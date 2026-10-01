// Builds the static site into dist/:
//   - copies site/ as-is
//   - fills index.html's %TOKENS% (preview-card meta tags need absolute URLs)
//   - inlines the event data as JSON for app.js
//   - writes one .ics per night plus cal/all.ics
// Zero dependencies. Run: node build.mjs   (SITE_URL=https://... to override config.siteUrl)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./event.config.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "site");
const dist = path.join(root, "dist");
const siteUrl = (process.env.SITE_URL || config.siteUrl).replace(/\/+$/, "");
// A site URL with a path (https://example.com/boo) is built into dist/boo/ so the
// host can serve it under that path.
const basePath = new URL(siteUrl).pathname.replace(/\/+$/, "");
const out = path.join(dist, basePath);

// ── time helpers ────────────────────────────────────────────────────────────

// Offset (ms) of `tz` from UTC at the given UTC instant.
function tzOffset(utcMs, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const p = Object.fromEntries(parts.map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - utcMs;
}

// Wall-clock date + time in `tz` → UTC Date.
function zonedToUtc(date, time, tz) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let utc = wall - tzOffset(wall, tz);
  utc = wall - tzOffset(utc, tz); // second pass settles DST boundaries
  return new Date(utc);
}

function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const hr = h % 12 || 12;
  return `${hr}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

const tzAbbr = (date, tz) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(date).find((p) => p.type === "timeZoneName").value;

const icsStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// ── ics ─────────────────────────────────────────────────────────────────────

const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

// RFC 5545: lines longer than 75 octets are folded with CRLF + space.
function fold(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const chunks = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--; // don't split a UTF-8 char
    chunks.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74;
  }
  return chunks.join("\r\n ");
}

function vevent(n) {
  const desc = [
    n.venue,
    n.tagline,
    n.host && `Hosted by ${n.host}.`,
    ...(n.notes.length ? ["", "Notes:", ...n.notes.map((x) => `• ${x}`)] : []),
    "",
    `${siteUrl}/#night-${n.id}`,
  ].filter((x) => x != null && x !== false).join("\n");
  return [
    "BEGIN:VEVENT",
    `UID:${n.id}-${config.year}@${new URL(siteUrl).hostname}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(new Date(n.startUtc))}`,
    `DTEND:${icsStamp(new Date(n.endUtc))}`,
    `SUMMARY:${icsEscape(`${config.title}: ${n.title}`)}`,
    `LOCATION:${icsEscape(n.address)}`,
    `DESCRIPTION:${icsEscape(desc)}`,
    `URL:${siteUrl}/#night-${n.id}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(`${n.title} tonight 🔪`)}`,
    "TRIGGER:-PT3H",
    "END:VALARM",
    "END:VEVENT",
  ];
}

function calendar(nights, name) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${config.title}//Horror Calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(name)}`,
    "X-WR-TIMEZONE:" + config.timezone,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...nights.flatMap(vevent),
    "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}

// ── data ────────────────────────────────────────────────────────────────────

// Nights point at a venue (`at`); the venue fills in place, address, host and notes.
const venues = config.venues || {};
const ids = new Set();
const nights = [...config.nights]
  .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  .map((raw, i) => {
    const v = raw.at ? venues[raw.at] : {};
    if (!v) throw new Error(`Night #${i + 1} points at unknown venue "${raw.at}"`);
    const n = {
      ...raw,
      id: raw.id || `${new Date(`${raw.date}T12:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toLowerCase()}-${raw.date.slice(8)}`,
      title: raw.title || v.name,
      venue: raw.venue || v.place || v.name,
      address: raw.address || v.address,
      host: raw.host ?? v.host,
      tagline: raw.tagline ?? v.tagline,
      notes: [...(v.notes || []), ...(raw.notes || [])],
    };
    for (const k of ["date", "start", "title", "venue", "address"]) {
      if (!n[k]) throw new Error(`Night #${i + 1} (${n.date}) is missing "${k}"`);
    }
    if (ids.has(n.id)) throw new Error(`Duplicate night id "${n.id}" — give one of them an explicit id`);
    ids.add(n.id);
    const start = zonedToUtc(n.date, n.start, config.timezone);
    const end = n.end
      ? zonedToUtc(n.end <= n.start ? addDays(n.date, 1) : n.date, n.end, config.timezone)
      : new Date(start.getTime() + (n.hours || config.defaultHours || 3) * 36e5);
    const details = [n.venue, n.tagline, n.host && `Hosted by ${n.host}.`].filter(Boolean).join("\n");
    const gcal = new URL("https://calendar.google.com/calendar/render");
    gcal.searchParams.set("action", "TEMPLATE");
    gcal.searchParams.set("text", `${config.title}: ${n.title}`);
    gcal.searchParams.set("dates", `${icsStamp(start)}/${icsStamp(end)}`);
    gcal.searchParams.set("location", n.address);
    gcal.searchParams.set("details", `${details}\n\n${siteUrl}/#night-${n.id}`);
    gcal.searchParams.set("ctz", config.timezone);
    const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
    outlook.searchParams.set("path", "/calendar/action/compose");
    outlook.searchParams.set("rru", "addevent");
    outlook.searchParams.set("subject", `${config.title}: ${n.title}`);
    outlook.searchParams.set("startdt", start.toISOString());
    outlook.searchParams.set("enddt", end.toISOString());
    outlook.searchParams.set("location", n.address);
    outlook.searchParams.set("body", `${details.replace(/\n/g, " ")} ${siteUrl}/#night-${n.id}`);
    return {
      notes: [],
      ...n,
      number: i + 1,
      startUtc: start.toISOString(),
      endUtc: end.toISOString(),
      timeLabel: `${fmtTime(n.start)}${n.end ? ` – ${fmtTime(n.end)}` : ""} ${tzAbbr(start, config.timezone)}`,
      startLabel: fmtTime(n.start),
      ics: `cal/${n.id}.ics`,
      gcal: gcal.toString(),
      outlook: outlook.toString(),
    };
  });

const monthName = new Date(Date.UTC(config.year, config.month - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
const icsAllUrl = `${siteUrl}/cal/all.ics`;
const data = {
  title: config.title,
  subtitle: config.subtitle,
  hostedBy: config.hostedBy,
  year: config.year,
  month: config.month,
  monthName,
  timezone: config.timezone,
  siteUrl,
  marquee: config.marquee || [],
  nights,
  movies: config.movies || [],
  allIcs: "cal/all.ics",
  gcalSubscribe: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsAllUrl.replace(/^https?:/, "webcal:"))}`,
};

// ── write ───────────────────────────────────────────────────────────────────

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true, filter: (p) => !p.endsWith("og.html") && !p.endsWith("_headers") });
// Cloudflare reads _headers from the root of the assets directory; prefix its paths with the base path.
const headers = fs.readFileSync(path.join(src, "_headers"), "utf8").replace(/^\/(\S*)/gm, (m, rest) => `${basePath}/${rest}`);
fs.writeFileSync(path.join(dist, "_headers"), headers);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tokens = {
  TITLE: esc(config.title),
  PAGE_TITLE: esc(`${config.title} · ${monthName} ${config.year}`),
  DESCRIPTION: esc(config.previewDescription || config.subtitle),
  SUBTITLE: esc(config.subtitle),
  HOSTED_BY: esc(config.hostedBy),
  MONTH_LABEL: esc(`${monthName} ${config.year}`),
  NIGHT_COUNT: String(nights.length),
  VENUE_COUNT: String(new Set(nights.map((n) => n.address)).size),
  SITE_URL: esc(siteUrl),
  OG_IMAGE: esc(`${siteUrl}/assets/og.jpg?v=${Date.now().toString(36)}`),
  // </script> can't appear inside the JSON block
  DATA: JSON.stringify(data).replace(/</g, "\\u003c"),
};
let html = fs.readFileSync(path.join(src, "index.html"), "utf8");
html = html.replace(/%([A-Z_]+)%/g, (m, k) => (k in tokens ? tokens[k] : m));
fs.writeFileSync(path.join(out, "index.html"), html);

fs.mkdirSync(path.join(out, "cal"), { recursive: true });
fs.writeFileSync(path.join(out, "cal", "all.ics"), calendar(nights, `${config.title} ${config.year}`));
for (const n of nights) fs.writeFileSync(path.join(out, n.ics), calendar([n], `${config.title}: ${n.title}`));

console.log(`Built ${nights.length} nights → ${path.relative(root, out) || "dist"}/  (site URL: ${siteUrl})`);
if (siteUrl.includes("example.com")) {
  console.warn("⚠  siteUrl is still example.com — preview cards and calendar subscriptions need your real URL.");
}
