// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE. Everything on the page (and the calendar files) comes from it.
//  After editing, run `npm run build` (or just push — GitHub Actions rebuilds).
// ─────────────────────────────────────────────────────────────────────────────

export default {
  // Big title on the page + the text-message preview card.
  title: "SHOCKTOBER",
  subtitle: "A month of horror movies, hopping haunted house to haunted house.",
  year: 2026,
  month: 10, // October. The calendar grid renders this month.

  // All times below are wall-clock times in this timezone.
  // Calendar invites are converted to UTC so they land at the right time for everyone.
  timezone: "America/New_York",

  // Where the site lives once deployed (no trailing slash). Preview cards need an
  // absolute URL for the image. The GitHub Pages workflow fills this in for you;
  // set it yourself if you host somewhere else. SITE_URL env var overrides it.
  siteUrl: "https://example.com/boo",

  // Shows up in the preview card + footer.
  hostedBy: "the coven",
  previewDescription: "6 nights. 6 haunts. No RSVP — just show up, bring snacks, scream responsibly.",

  // Scrolls across the caution-tape banner.
  marquee: ["NO RSVP NEEDED", "BRING SNACKS", "SCREAMS WELCOME", "BYOB(lanket)", "PHONES FACE DOWN", "DON'T SPLIT UP"],

  // ── The nights ────────────────────────────────────────────────────────────
  // date: YYYY-MM-DD · start/end: 24h "HH:MM" (end earlier than start = ends after midnight)
  // gif: file in site/assets/gifs/ (or any https:// URL)
  // notes: host's special instructions (shown as a checklist)
  nights: [
    {
      id: "carve",
      date: "2026-10-03",
      start: "18:30",
      end: "23:00",
      title: "Carve & Creature Feature",
      tagline: "Pumpkin guts, then a monster movie.",
      host: "Laurie",
      venue: "Laurie's Place",
      address: "45 Lampkin Ln, Haddonfield, IL",
      gif: "pumpkins.webp",
      notes: [
        "Pumpkins provided — bring your own carving knife if you're picky.",
        "Wear clothes you don't mind getting pumpkin on.",
        "Street parking only, don't block the driveway.",
      ],
    },
    {
      id: "ghostface",
      date: "2026-10-09",
      start: "20:00",
      end: "23:59",
      title: "What's Your Favorite Scary Movie?",
      tagline: "Meta-slasher night. Landline-era vibes.",
      host: "Sidney",
      venue: "The Woodsboro House",
      address: "261 Turner Ln, Woodsboro, CA",
      gif: "ghostface.webp",
      notes: [
        "Gate code is 1996#.",
        "If the phone rings, don't answer it.",
      ],
    },
    {
      id: "elm-street",
      date: "2026-10-16",
      start: "21:00",
      end: "02:00",
      title: "Elm Street Sleepover",
      tagline: "Double feature. Whatever you do, don't fall asleep.",
      host: "Nancy",
      venue: "1428 Elm",
      address: "1428 Elm St, Springwood, OH",
      gif: "freddy.webp",
      notes: [
        "Pajamas encouraged. Coffee provided.",
        "Shoes off at the door.",
        "Cat lives here — heads up if you're allergic.",
      ],
    },
    {
      id: "chucky",
      date: "2026-10-23",
      start: "19:30",
      end: "23:30",
      title: "Child's Play Date",
      tagline: "Killer dolls + a very unserious snack table.",
      host: "Andy",
      venue: "Apartment 4B",
      address: "666 Toy Box Ave, Chicago, IL",
      gif: "chucky.webp",
      notes: [
        "Buzz 4B. Elevator is haunted (broken). Take the stairs.",
        "Potluck — bring a snack to share.",
      ],
    },
    {
      id: "overlook",
      date: "2026-10-30",
      start: "20:00",
      end: "23:59",
      title: "Heeere's Friday",
      tagline: "The Overlook is open for the season. Room 237 is off-limits.",
      host: "Wendy",
      venue: "The Overlook",
      address: "The Stanley Hotel, Estes Park, CO",
      gif: "jack.webp",
      notes: [
        "Park in the back lot, use the side door.",
        "Dress code: flannel. Axes optional (please no real axes).",
      ],
    },
    {
      id: "halloween",
      date: "2026-10-31",
      start: "19:00",
      end: "01:00",
      title: "Halloween Night",
      tagline: "The finale. Costumes mandatory. The Shape is watching.",
      host: "Tommy",
      venue: "The Myers House",
      address: "1031 Shape St, Haddonfield, IL",
      gif: "myers.webp",
      notes: [
        "COSTUMES REQUIRED. No costume, no candy.",
        "Trick-or-treaters until 8:30 — help hand out candy.",
        "Best costume wins control of the remote.",
      ],
    },
  ],

  // ── The movie pool ────────────────────────────────────────────────────────
  // Add `watched: "carve"` (a night's id) to cross a movie off after that night.
  movies: [
    { title: "Halloween", year: 1978, tag: "slasher" },
    { title: "The Thing", year: 1982, tag: "creature" },
    { title: "Scream", year: 1996, tag: "slasher" },
    { title: "The Shining", year: 1980, tag: "haunted" },
    { title: "A Nightmare on Elm Street", year: 1984, tag: "slasher" },
    { title: "Hereditary", year: 2018, tag: "occult" },
    { title: "Suspiria", year: 1977, tag: "giallo" },
    { title: "It Follows", year: 2014, tag: "curse" },
    { title: "The Babadook", year: 2014, tag: "psych" },
    { title: "Get Out", year: 2017, tag: "psych" },
    { title: "The Descent", year: 2005, tag: "creature" },
    { title: "Talk to Me", year: 2023, tag: "possession" },
    { title: "Barbarian", year: 2022, tag: "wtf" },
    { title: "X", year: 2022, tag: "slasher" },
    { title: "Pearl", year: 2022, tag: "slasher" },
    { title: "Longlegs", year: 2024, tag: "occult" },
    { title: "The Witch", year: 2015, tag: "folk" },
    { title: "Midsommar", year: 2019, tag: "folk" },
    { title: "Rosemary's Baby", year: 1968, tag: "occult" },
    { title: "The Texas Chain Saw Massacre", year: 1974, tag: "slasher" },
    { title: "Evil Dead II", year: 1987, tag: "splatter" },
    { title: "Child's Play", year: 1988, tag: "slasher" },
    { title: "The Substance", year: 2024, tag: "body" },
    { title: "Sinners", year: 2025, tag: "vampire" },
    { title: "Weapons", year: 2025, tag: "wtf" },
    { title: "Nosferatu", year: 2024, tag: "vampire" },
  ],
};
