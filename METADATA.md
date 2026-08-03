# Repo metadata — every app, one file (Doctrine §10)

The GitHub-side metadata the session token cannot set: description, website,
topics, social preview, default branch. Each is a Settings-page step Noah
performs by hand; this file is the single place the VALUES live, so a session
proposes here and the GitHub UI copies from here — never the other way round,
and never typed fresh in chat where it evaporates.

**Status is tracked per item.** An item is `set` only after Noah has actually
applied it and said so; `proposed` means the value below is awaiting his
confirm. Never report a repo "set up" while any item says proposed (§10).

**One item per heading, its value on its own line.** Not because tables are
banned in files — Doctrine §2 was narrowed on 2026-08-03 and a rendered `.md`
table is fine — but because these values get copied one at a time into a GitHub
form, and a list is what you read while doing that.

Where to apply: repo → Settings → General. Description and website live in
"About" (the ⚙ on the repo home page also works); topics likewise; social
preview under Settings → General → Social preview → Edit; default branch under
Settings → General → Default branch.

## How to verify an item rather than assume it

Description, website, topics and default branch all come back from the search
API — query `repo:owner/name` with full output, and compare against the values
below.

The social preview does NOT. No API field exposes it. Read the repo's own HTML
instead and look at the `og:image` host:

- `repository-images.githubusercontent.com` — a card was really uploaded.
- `opengraph.githubassets.com` — GitHub is auto-generating one, and the upload
  did not land.

A markdown-converting fetcher drops the `<head>`, so this needs the raw HTML.

---

# njefferson/fauxplane

**Description** — set 2026-08-03. **A revision is proposed below.**

Live on GitHub now:

> A glass cockpit for your desk — airliner instruments driven by your device's
> own sensors and live aviation data. Not a simulator; never for navigation.

**Proposed revision** — 2026-08-03, from how Noah actually describes the app to
his friends: *"You can follow a flight, or use it on a flight to see like the
pilot, or use it in a car while you drive!"* The live description says **"for
your desk"**, which is the one reader's case and silently excludes the two uses
that make the panel come alive. The app is undersold by its own copy.

> Airliner instruments on your phone or tablet, driven by its own sensors and
> live aviation data. Follow a real flight, take it on one, or clamp it in the
> car. Not a simulator; never for navigation.

**Website** — set 2026-08-03

> https://fauxplane.pages.dev

**Topics** — set 2026-08-03

> `aviation` `glass-cockpit` `flight-instruments` `adsb` `efis` `pwa`
> `offline-first` `web-sensors`

**Social preview** — set 2026-08-03

The icon-art card, Noah's pick. Source is `scripts/social-card-icon.html`; the
same image serves as the page's og:image.

**Default branch** — set 2026-08-03

`main`. It was `claude/jet-panel-pwa-amendments-f07ygu`, a harness branch this
repo's policy says to ignore (Doctrine §11) — so the landing page, the default
clone and every new PR base pointed at stale code until Noah moved it. It was
never on this list; a verification pass found it.

---

# njefferson/noahjefferson

**Description** — set 2026-08-03

> Photography, and small free tools for enjoying the world.

**Website** — set 2026-08-03

> https://noahjefferson.pages.dev

**Topics** — set 2026-08-03

> `photography` `portfolio` `free-tools` `pwa` `offline-first` `static-site`

**Social preview** — set 2026-08-03

Delivered to Noah in chat, and served at https://noahjefferson.pages.dev/og.png.
The file had never been copied into `public/`, so index.html's og:image and the
URL this entry used to give were both 404 until then. Regenerate with
`node render-social.mjs`, then copy to `public/og.png`.

**Default branch** — set

`main`, and always has been.

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.
