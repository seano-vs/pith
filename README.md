# SHOCKTOBER 🔪

A static, Partiful-style event page for a multi-night, multi-location horror movie month.
No RSVPs, no accounts, no tracking. Just a link you text to people.

- October month grid; tapping a haunted night jumps to its card
- One card per night with time, host, a tap-for-directions address (Apple Maps on iPhone, Google Maps elsewhere), copy-address, and the host's special instructions
- Add to calendar per night (Apple/.ics, Google, Outlook) or all at once (.ics, auto-updating subscription, Google subscribe)
- The movie pool as a VHS rental shelf, with a random-pick button
- iMessage/WhatsApp/Discord preview card (`og:image` 1200×630)
- Built for phones first. GIFs are animated WebP, so they stay light on cellular data

## Edit the event

Everything lives in **`event.config.mjs`**: title, timezone, nights (date, times, host, address, notes, gif) and the movie pool.

- Times are wall-clock in `timezone`. If an `end` is earlier than its `start`, the night ends after midnight.
- To cross off a movie, add `watched: "<night id>"` to it.
- GIFs go in `site/assets/gifs/`. A night's `gif` can also be any `https://` URL.

## Run locally

```sh
npm run dev     # builds to dist/ and serves http://localhost:8080
```

No dependencies. Node 18+ is all you need.

## Deploy (GitHub Pages)

1. Merge to `main`.
2. In the repo, go to **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` rebuilds and deploys. The workflow passes the real Pages URL
   in as `SITE_URL`, so preview cards and calendar subscriptions point at the right place.
   Using a custom domain? Set a repo variable `SITE_URL=https://your.domain`.

Any other static host works too (Netlify, Vercel, Cloudflare Pages): the build command is
`SITE_URL=https://your.site node build.mjs` and the output folder is `dist`.

## Preview card image

`site/assets/og.jpg` is rendered from `site/og.html`. It reads the title and dates from the config.
Regenerate it after changing them:

```sh
npm i -D playwright && npx playwright install chromium
npm run og
```

iMessage caches previews hard. If you change the image, the build already cache-busts
the URL, but a message thread that has already unfurled the link keeps the old preview.
