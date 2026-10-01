// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE. Everything on the page (and the calendar files) comes from it.
//  Push to main and Cloudflare rebuilds the site.
// ─────────────────────────────────────────────────────────────────────────────

export default {
  // Big title on the page + the text-message preview card.
  title: "SHOCKTOBER",
  subtitle: "fear is the best spice",
  year: 2026,
  month: 10, // October. The calendar grid renders this month.

  // All times below are wall-clock times in this timezone.
  // Calendar invites are converted to UTC so they land at the right time for everyone.
  timezone: "America/New_York",

  // Where the site lives once deployed (no trailing slash). A path works too: the site
  // is then built into dist/<path>/ and served under it. Preview cards and calendar
  // subscriptions need this to be the real URL. A SITE_URL env var overrides it.
  siteUrl: "https://example.com/boo",

  // Text under the title in the preview card.
  previewDescription: "10 nights of horror movies across NYC. Just show up, bring snacks, scream responsibly.",

  // Scrolls across the caution-tape banner.
  marquee: ["JUST SHOW UP", "BRING SNACKS", "SCREAMS WELCOME", "BYOB(lanket)", "MAMDANI APPROVED", "DON'T SPLIT UP"],

  // How long a night lasts in calendar invites when it has no `end`.
  defaultHours: 3,

  // ── The places ────────────────────────────────────────────────────────────
  // name: shown as the night's title · place: shown next to the address
  // notes: special instructions, shown on every night at this place
  // notesTitle: heading over the notes (defaults to "Host says…"; "" hides it)
  venues: {
    elvira: {
      name: "Elvira's",
      place: "Elvira's apartment",
      host: "Elvira",
      address: "1313 Mockingbird Ln, New York, NY",
    },
    vincent: {
      name: "Vincent's",
      place: "Vincent's apartment",
      host: "Vincent",
      address: "13 Elm St, New York, NY",
    },
    boris: {
      name: "Boris's",
      place: "Boris's apartment",
      host: "Boris",
      address: "666 Hollow Rd, New York, NY",
      tagline: "Boris's brand new apartment!",
      notesTitle: "",
      notes: ["Boris just moved in! But his couch hasn't yet. So bring your own chair or ask a friend for one!"],
    },
    regal: {
      name: "Regal Union Square",
      place: "Regal Union Square",
      address: "850 Broadway, New York, NY 10003",
      tagline: "It's a movie theater. A real one.",
      notesTitle: "Vincent requests:",
      notes: ["RSVP to him via Signal! He's already bought tickets for the group, so hit him up to claim a spot with everyone."],
    },
  },

  // ── The nights ────────────────────────────────────────────────────────────
  // date: YYYY-MM-DD · start: 24h "HH:MM" · at: a key from `venues` above
  // Optional: end ("HH:MM"; earlier than start = after midnight), title, tagline, notes, host,
  // sticker (a GIF stuck on the card's corner), calIcon (emoji on the calendar day, default 🔪).
  // gif: file in site/assets/gifs/ (or any https:// URL)
  nights: [
    {
      date: "2026-10-04", start: "21:00", at: "elvira", gif: "pumpkins.webp",
      tagline: "🎂 It's Boris's birthday!", sticker: "cake.webp", calIcon: "🎂",
    },
    { date: "2026-10-05", start: "19:00", at: "vincent", gif: "ghostface.webp" },
    { date: "2026-10-07", start: "21:00", at: "vincent", gif: "freddy.webp" },
    { date: "2026-10-12", start: "16:40", at: "regal", gif: "theater.webp" },
    { date: "2026-10-14", start: "21:00", at: "vincent", gif: "chucky.webp" },
    { date: "2026-10-17", start: "19:00", at: "boris", gif: "skeleton-big.webp" },
    { date: "2026-10-18", start: "19:00", at: "elvira", gif: "pennywise.webp" },
    { date: "2026-10-21", start: "21:00", at: "vincent", gif: "haunted-house.webp" },
    { date: "2026-10-26", start: "19:00", at: "elvira", gif: "jack.webp" },
    { date: "2026-10-30", start: "19:00", at: "elvira", gif: "myers.webp" },
  ],

  // ── The movie pool ────────────────────────────────────────────────────────
  // Each night we pull one at random. Add `watched: "oct-04"` (a night's date as
  // oct-DD) to cross a movie off after that night.
  movies: [
    { title: "Come to Daddy", year: 2019, tag: "wtf", trailer: "https://www.youtube.com/watch?v=3D05YjZmVSI" },
    { title: "Companion", year: 2025, tag: "sci-fi", trailer: "https://www.youtube.com/watch?v=Qr_kX0D3DNA" },
    { title: "Heretic", year: 2024, tag: "psych", trailer: "https://www.youtube.com/watch?v=O9i2vmFhSSY" },
    { title: "Let the Right One In", year: 2008, tag: "vampire", trailer: "https://www.youtube.com/watch?v=ICp4g9p_rgo" },
    { title: "Smile 2", year: 2024, tag: "curse", trailer: "https://www.youtube.com/watch?v=0HY6QFlBzUY" },
    { title: "The Thing", year: 1982, tag: "creature", trailer: "https://www.youtube.com/watch?v=ySvzHdtCiWE" },
  ],
};
