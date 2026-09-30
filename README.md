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

No dependencies. Any Node 18+ works; 24 (current LTS) is pinned for Cloudflare and CI.

## Deploy

The site is just static files: `node build.mjs` writes everything to `dist/`. Host that folder anywhere.

### Cloudflare (recommended)

Works with this repo staying private.

1. In the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**
   and pick this repo. You'll need to authorize Cloudflare's GitHub app for it.
2. Settings:
   - **Build command:** `node build.mjs`
   - **Deploy command:** `npx wrangler deploy` (Workers). On a Pages project, set the **output directory** to `dist` instead.
   - **Build variable:** `SITE_URL=https://your-final-url` (custom domain or `https://<project>.pages.dev`)
3. Every push to `main` redeploys.

Or deploy from your machine: `SITE_URL=https://your-final-url node build.mjs && npx wrangler deploy`.

`site/_headers` makes Cloudflare serve `cal/*.ics` as `text/calendar`. iPhones need that to show "Add to Calendar".

### Anywhere else (nginx, Kubernetes, S3, …)

Serve `dist/` as static files. Make sure `.ics` is served as `text/calendar`. For nginx, stock `mime.types` doesn't include it, so add:

```nginx
types { text/calendar ics; }
```

## Preview card image

`site/assets/og.jpg` is rendered from `site/og.html`. It reads the title and dates from the config.
Regenerate it after changing them:

```sh
npm i -D playwright && npx playwright install chromium
npm run og
```

iMessage caches previews hard. If you change the image, the build already cache-busts
the URL, but a message thread that has already unfurled the link keeps the old preview.
