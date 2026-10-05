(() => {
  const data = JSON.parse(document.getElementById("event-data").textContent);
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const gifSrc = (g) => (/^https?:\/\//.test(g) ? g : `assets/gifs/${g}`);
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);

  const now = Date.now();
  const nights = data.nights.map((n) => ({
    ...n,
    startMs: Date.parse(n.startUtc),
    endMs: Date.parse(n.endUtc),
  }));
  const status = (n) => (now >= n.endMs ? "past" : now >= n.startMs ? "now" : "future");
  const nextNight = nights.find((n) => status(n) !== "past");

  // Today's date in the event's timezone, as YYYY-MM-DD.
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: data.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  const dayInfo = (dateStr) => {
    const d = new Date(`${dateStr}T12:00:00Z`);
    return {
      dow: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      dowLong: d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
      mon: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      day: d.getUTCDate(),
    };
  };

  // Apple Maps on iPhone/Mac, Google Maps everywhere else.
  const mapsUrl = (n) => {
    const q = encodeURIComponent(n.address);
    return isApple ? `https://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  };

  // ── fit the title to its container ──────────────────────────────────────
  const title = $(".title");
  const fit = $(".title .fit");
  const fitTitle = () => {
    title.style.fontSize = "100px";
    const scale = title.clientWidth / fit.scrollWidth;
    title.style.fontSize = `${Math.min(100 * scale * 0.98, 110)}px`;
  };
  fitTitle();
  if (document.fonts) document.fonts.ready.then(fitTitle);
  addEventListener("resize", fitTitle);

  // ── marquee ─────────────────────────────────────────────────────────────
  const words = data.marquee.length ? data.marquee : [data.title];
  const run = words.map((w) => `<span>${esc(w)}</span><span class="dot">✦</span>`).join("");
  $("#marquee").innerHTML = run.repeat(4) + run.repeat(4); // two identical halves → seamless loop


  // ── countdown ───────────────────────────────────────────────────────────
  const cd = $("#countdown");
  if (nextNight) {
    const info = dayInfo(nextNight.date);
    let when;
    if (status(nextNight) === "now") {
      when = `<b>Happening now:</b> ${esc(nextNight.title)}`;
    } else {
      const days = Math.round((Date.parse(`${nextNight.date}T00:00:00Z`) - Date.parse(`${todayStr}T00:00:00Z`)) / 864e5);
      const rel = days === 0 ? "TONIGHT" : days === 1 ? "TOMORROW" : `in ${days} days`;
      when = `Next haunt: <b>${info.dow} ${info.mon} ${info.day}</b> · ${rel}`;
    }
    cd.innerHTML = `<a href="#night-${nextNight.id}" style="text-decoration:none">${when}</a>`;
  } else {
    cd.innerHTML = "That's a wrap. See you next October 🎃";
  }
  cd.hidden = false;

  // ── calendar grid ───────────────────────────────────────────────────────
  const byDate = Object.fromEntries(nights.map((n) => [n.date, n]));
  const first = new Date(Date.UTC(data.year, data.month - 1, 1));
  const daysInMonth = new Date(Date.UTC(data.year, data.month, 0)).getUTCDate();
  let cal = ["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="cal-dow" role="columnheader">${d}</div>`).join("");
  cal += `<div class="cal-day is-empty"></div>`.repeat(first.getUTCDay());
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${data.year}-${pad(data.month)}-${pad(d)}`;
    const n = byDate[ds];
    const cls = ["cal-day", ds < todayStr && "is-past", ds === todayStr && "is-today", n && "has-event"].filter(Boolean).join(" ");
    if (n) {
      cal += `<a class="${cls}${status(n) === "past" ? " is-past" : ""}" href="#night-${n.id}" role="gridcell" aria-label="${esc(`${dayInfo(ds).dowLong} October ${d}: ${n.title}`)}">
        <img src="${esc(gifSrc(n.gif))}" alt="" loading="lazy"><span class="num">${d}</span><span class="pip">${esc(n.calIcon || "🔪")}</span></a>`;
    } else {
      cal += `<div class="${cls}" role="gridcell"><span class="num">${d}</span></div>`;
    }
  }
  $("#cal-grid").innerHTML = cal;

  // ── night cards ─────────────────────────────────────────────────────────
  $("#night-list").innerHTML = nights.map((n) => {
    const info = dayInfo(n.date);
    const st = status(n);
    const maps = mapsUrl(n);
    const badge = st === "now" ? `<span class="badge badge-now">HAPPENING NOW</span>`
      : n === nextNight ? `<span class="badge badge-next">NEXT UP</span>`
      : st === "past" ? `<span class="badge badge-past">R.I.P.</span>` : "";
    const notes = n.notes.length
      ? `<div class="notes${!(n.notesTitle ?? "Host says…") && n.notes.length === 1 ? " is-plain" : ""}">${(n.notesTitle ?? "Host says…") ? `<h4>${esc(n.notesTitle ?? "Host says…")}</h4>` : ""}<ul>${n.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
    return `
    <article class="night${st === "past" ? " is-past" : ""}" id="night-${esc(n.id)}">
      <span class="night-num">NIGHT ${pad(n.number)}</span>${badge}
      <div class="night-media">
      <figure class="vhs">
        <img src="${esc(gifSrc(n.gif))}" alt="" loading="lazy">
        <figcaption class="osd" aria-hidden="true">
          <span class="osd-bl">${st === "past" ? "■ STOP" : "PLAY ▶"}</span>
          <span class="osd-br">${info.mon.toUpperCase()}.${pad(info.day)} ${esc(n.startLabel)}</span>
        </figcaption>
      </figure>
      ${n.sticker ? `<img class="night-sticker" src="${esc(gifSrc(n.sticker))}" alt="" loading="lazy">` : ""}
      </div>
      <div class="night-body">
        <div class="night-head">
          <div class="datebox" aria-hidden="true"><span class="mon">${info.mon.toUpperCase()}</span><span class="d">${info.day}</span><span class="dow">${info.dow.toUpperCase()}</span></div>
          <div>
            <h3 class="night-title">${esc(n.title)}</h3>
            ${n.tagline ? `<p class="night-tagline">${esc(n.tagline)}</p>` : ""}
          </div>
        </div>
        <dl class="facts">
          <div class="fact"><span class="ico">🕯️</span><div><dt>When</dt><dd>${info.dowLong}, ${info.mon} ${info.day}<span class="sub">${esc(n.timeLabel)}</span></dd></div></div>
          ${n.host ? `<div class="fact"><span class="ico">🧛</span><div><dt>Host</dt><dd>${esc(n.host)}</dd></div></div>` : ""}
          ${data.movies.filter((m) => m.watched === n.id).map((m) => `<div class="fact"><span class="ico">🎬</span><div><dt>Watched</dt><dd>${esc(m.title)}${m.year ? ` <span class="yr-inline">(${esc(m.year)})</span>` : ""}${m.trailer ? `<a class="sub" href="${esc(m.trailer)}" target="_blank" rel="noopener">▶ Trailer</a>` : ""}</dd></div></div>`).join("")}
          <a class="fact" href="${esc(maps)}" target="_blank" rel="noopener"><span class="ico">📍</span><div><dt>Where · tap for directions</dt><dd>${esc(n.venue)}<span class="sub">${esc(n.address)}</span></dd></div></a>
        </dl>
        ${notes}
        <p class="alt-maps"><button type="button" data-copy="${esc(n.address)}">Copy address</button></p>
      </div>
    </article>`;
  }).join("");

  // ── movie shelf ─────────────────────────────────────────────────────────
  const labels = ["#e0162b", "#ff6a13", "#ffd23f", "#c6ff3a", "#3fd7ff", "#b58cff", "#f3eadb", "#ff4fa3"];
  const shelf = $("#shelf");
  shelf.innerHTML = data.movies.map((m, i) => {
    const watchedOn = m.watched && nights.find((n) => n.id === m.watched);
    const meta = [m.year, watchedOn ? `✓ watched ${dayInfo(watchedOn.date).mon} ${dayInfo(watchedOn.date).day}` : m.watched ? "✓ watched" : m.booked ? `🎟️ ${m.booked}` : m.tag].filter(Boolean).join(" · ");
    const trailer = m.trailer
      ? `<a class="trailer" href="${esc(m.trailer)}" target="_blank" rel="noopener" aria-label="Watch the ${esc(m.title)} trailer">▶ Trailer</a>`
      : "";
    return `<li class="tape-spine${m.watched ? " is-watched" : ""}" style="--label:${labels[i % labels.length]}">
      <div class="label"><span class="mt">${esc(m.title)}</span>${meta ? `<span class="yr">${esc(meta)}</span>` : ""}</div>
      ${trailer}</li>`;
  }).join("");

  const summonBtn = $("#summon");
  const result = $("#summon-result");
  summonBtn.addEventListener("click", () => {
    const spines = [...shelf.children];
    const pool = spines.map((el, i) => i).filter((i) => !data.movies[i].watched && !data.movies[i].booked);
    if (!pool.length) { result.textContent = "You've watched them all. Seek help."; return; }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    spines.forEach((el) => el.classList.remove("is-picked", "is-scanning"));
    summonBtn.disabled = true;
    let step = 0;
    const total = 14;
    const tick = () => {
      spines.forEach((el) => el.classList.remove("is-scanning"));
      if (step < total) {
        const i = pool[Math.floor(Math.random() * pool.length)];
        spines[i].classList.add("is-scanning");
        result.textContent = `▶▶ ${data.movies[i].title}`;
        step++;
        setTimeout(tick, 60 + step * 12);
      } else {
        spines[pick].classList.add("is-picked");
        spines[pick].scrollIntoView({ behavior: "smooth", block: "center" });
        const m = data.movies[pick];
        result.innerHTML = `☠ ${esc(m.title)}${m.year ? ` (${esc(m.year)})` : ""}` +
          (m.trailer ? ` <a href="${esc(m.trailer)}" target="_blank" rel="noopener">▶ trailer</a>` : "");
        summonBtn.disabled = false;
      }
    };
    tick();
  });

  // ── add-to-calendar sheet ───────────────────────────────────────────────
  const sheet = $("#sheet");
  const opt = (href, ico, label, sub, external) =>
    `<a class="sheet-opt" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}><span class="ico">${ico}</span><span><b>${label}</b><small>${sub}</small></span></a>`;

  const openSheet = (id) => {
    if (id === "all") {
      $("#sheet-kicker").textContent = `All ${nights.length} nights`;
      $("#sheet-title").textContent = `Add ${data.title} to your calendar`;
      $("#sheet-options").innerHTML = [
        opt(data.allIcs, "🍎", "Apple Calendar / iPhone", "Adds every night at once. Tap “Add All” on the next screen."),
        opt(data.gcalSubscribe, "🟦", "Google Calendar", "Subscribes to the whole lineup. Best done on a computer.", true),
        opt(data.allIcs, "⬇️", "Download .ics", "Outlook, Proton, Fantastical, anything else."),
      ].join("");
    } else {
      const n = nights.find((x) => x.id === id);
      const info = dayInfo(n.date);
      $("#sheet-kicker").textContent = `Night ${pad(n.number)} · ${info.dow} ${info.mon} ${info.day}`;
      $("#sheet-title").textContent = n.title;
      $("#sheet-options").innerHTML = [
        opt(n.ics, "🍎", "Apple Calendar / iPhone", "Opens right in Calendar with a reminder 3 hours before."),
        opt(n.gcal, "🟦", "Google Calendar", "Opens Google Calendar with everything filled in.", true),
        opt(n.outlook, "📨", "Outlook.com", "For Outlook / Hotmail accounts.", true),
        opt(n.ics, "⬇️", "Download .ics", "Anything else."),
      ].join("");
    }
    if (typeof sheet.showModal === "function") sheet.showModal();
    else location.href = id === "all" ? data.allIcs : nights.find((x) => x.id === id).ics;
  };

  // Tap outside the sheet closes it.
  sheet.addEventListener("click", (e) => {
    const r = sheet.getBoundingClientRect();
    if (e.clientY < r.top || e.clientX < r.left || e.clientX > r.right) sheet.close();
  });
  sheet.addEventListener("click", (e) => { if (e.target.closest(".sheet-opt")) setTimeout(() => sheet.close(), 300); });

  // ── toast / copy / share ────────────────────────────────────────────────
  const toastEl = $("#toast");
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.append(ta); ta.select();
      const ok = document.execCommand("copy"); ta.remove(); return ok;
    }
  };

  document.addEventListener("click", async (e) => {
    const calBtn = e.target.closest("[data-cal]");
    if (calBtn) return openSheet(calBtn.dataset.cal);
    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) return toast((await copy(copyBtn.dataset.copy)) ? "📋 Address copied" : "Couldn't copy 💀");
  });

  $("#share").addEventListener("click", async () => {
    const url = data.siteUrl.includes("example.com") ? location.href.split("#")[0] : `${data.siteUrl}/`;
    const shareData = { title: data.title, text: `${data.title} — ${data.subtitle}`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      toast((await copy(url)) ? "🔗 Link copied — go haunt someone" : url);
    }
  });
})();
