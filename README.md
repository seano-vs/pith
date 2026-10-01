# SPOOKTOBER 🔪

A static, Partiful-style event page for a multi-night, multi-location horror movie month.
No RSVPs, no accounts, no tracking. Just a link you text to people.

- October month grid; tapping a haunted night jumps to its card
- One card per night with time, host, a tap-for-directions address (Apple Maps on iPhone, Google Maps elsewhere), copy-address, and the host's special instructions
- Add all nights to your calendar at once (Apple/.ics, Google, or a .ics download)
- The movie pool as a VHS rental shelf, with a random-pick button
- iMessage/WhatsApp/Discord preview card (`og:image` 1200×630)
- Built for phones first. GIFs are animated WebP, so they stay light on cellular data

## Edit the event

Everything lives in **`event.config.mjs`**:

- `venues`: each place's name, address, host and standing notes (e.g. "bring your own chairs").
- `nights`: one line per night, a date, a start time, which venue (`at`) and a GIF.
  A night can override `title`, `tagline`, `notes` or add an `end` time. Without an `end`, the page
  shows only the start time and calendar invites last `defaultHours`.
- `movies`: the pool, each with a YouTube `trailer` link. To cross one off, add `watched: "oct-04"`.
- GIFs go in `site/assets/gifs/`. A night's `gif` can also be any `https://` URL.

Times are wall-clock in `timezone` (New York).

## Run locally

```sh
npm run dev     # builds to dist/ and serves http://localhost:8080/boo/
```

No dependencies. Any Node 18+ works; 26 is pinned for Cloudflare and CI.

## Deploy

The site is just static files: `node build.mjs` writes everything to `dist/`. Host that folder anywhere.

### Cloudflare (recommended)

The site is served at **https://example.com/boo**. `wrangler.jsonc` routes only `example.com/boo`
and `example.com/boo/*` to this Worker, so the rest of example.com is untouched.

1. In the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**
   and pick this repo. You'll need to authorize Cloudflare's GitHub app for it.
2. Build command: `node build.mjs`. Deploy command: `npx wrangler deploy`.
3. Every push to `main` rebuilds and redeploys.

To move it, change `siteUrl` in `event.config.mjs` and the `routes` in `wrangler.jsonc` together.
A path in `siteUrl` makes the build output go to `dist/<path>/`, and `/boo` redirects to `/boo/`.

`site/_headers` makes Cloudflare serve `.ics` as `text/calendar`. iPhones need that to show
"Add to Calendar". The build prefixes its paths with `/boo`.

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
