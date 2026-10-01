// Renders the preview-card image (site/assets/og.jpg) and icons from site/og.html.
// Needs Playwright:  npm i -D playwright && npx playwright install chromium
// Then:              npm run og
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import config from "../event.config.mjs";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch {
  ({ chromium } = require(path.join(process.env.NPM_GLOBAL || "", "playwright")));
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const browser = await chromium.launch();

// ── og.jpg (1200×630) ──
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(site, "og.html")).href);
const month = new Date(Date.UTC(config.year, config.month - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
const days = [...config.nights].sort((a, b) => a.date.localeCompare(b.date)).map((n) => Number(n.date.slice(8)));
await page.evaluate(({ config, month, days }) => {
  document.getElementById("kicker").textContent = `${config.hostedBy} presents`;
  document.getElementById("title").textContent = config.title;
  const haunts = new Set(config.nights.map((n) => n.at || n.address)).size;
  document.getElementById("sub").textContent = `${config.nights.length} nights · ${haunts} haunts · NYC`;
  document.getElementById("dates").innerHTML = days.map((d) => `<span>${month.slice(0, 3).toUpperCase()} ${d}</span>`).join("");
}, { config, month, days });
await page.evaluate(() => document.fonts.ready);
// Shrink the title until it fits.
await page.evaluate(() => {
  const h = document.getElementById("title");
  let size = 104;
  while (h.scrollWidth > 720 && size > 40) h.style.fontSize = `${(size -= 2)}px`;
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(site, "assets", "og.jpg"), type: "jpeg", quality: 86 });

// ── icons ──
const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
await icon.goto(pathToFileURL(path.join(site, "og.html")).href);
await icon.setContent(`<style>@font-face{font-family:Nosifer;src:url(${pathToFileURL(path.join(site, "assets/fonts/nosifer.woff2")).href})}</style>
  <body style="margin:0;width:180px;height:180px;display:grid;place-items:center;background:radial-gradient(circle at 50% 30%,#3a0810,#0a0708 70%)">
  <div style="font:400 120px/1 Nosifer;color:#e0162b;text-shadow:0 0 20px rgba(224,22,43,.7),0 5px 0 #6e0510;transform:translateY(-6px)">${config.title[0]}</div></body>`);
await icon.evaluate(() => document.fonts.ready);
await icon.waitForTimeout(300);
await icon.screenshot({ path: path.join(site, "assets", "apple-touch-icon.png") });
await icon.setViewportSize({ width: 64, height: 64 });
await icon.evaluate(() => { document.body.style.zoom = 64 / 180; });
await icon.screenshot({ path: path.join(site, "assets", "favicon.png"), clip: { x: 0, y: 0, width: 64, height: 64 } });

await browser.close();
console.log("Wrote site/assets/og.jpg, apple-touch-icon.png, favicon.png");
