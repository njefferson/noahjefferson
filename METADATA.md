# Repo metadata — every app, one file (Doctrine §10)

The GitHub-side metadata the session token cannot set: description, website,
topics, social preview, default branch. Each is a Settings-page step the owner
performs by hand; this file is the single place the VALUES live, so a session
proposes here and the GitHub UI copies from here — never the other way round,
and never typed fresh in chat where it evaporates.

**Status is tracked per item.** An item is `set` only after the owner has actually
applied it and said so; `proposed` means the value below is awaiting his
confirm. Never report a repo "set up" while any item says proposed (§10).

**No tables in this file, ever** (Doctrine §3). One item per heading, its value
on its own line. `node docs-check.mjs` fails the build if a grid creeps back in.

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

**Proposed revision** — 2026-08-03, from how the owner actually describes the app to
his friends: The live description says **, which is the one reader's case and silently excludes the two uses
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

The icon-art card, the owner's pick. Source is `scripts/social-card-icon.html`; the
same image serves as the page's og:image.

**Default branch** — set 2026-08-03

`main`. It was `claude/jet-panel-pwa-amendments-f07ygu`, a harness branch this
repo's policy says to ignore (Doctrine §11) — so the landing page, the default
clone and every new PR base pointed at stale code until the owner moved it. It was
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

# njefferson/3d-printing-pal

The app is **print-tracker**; the repo keeps the name it was created with. Every item below is **set**, applied on 2026-08-09 and then VERIFIED rather than
taken on trust — the description, website, topics and default branch read back
from the repository API, and the social preview from the page's own `og:image`
host.

**Description** — set 2026-08-09

> Track 3D print jobs, filament and models on your own device. Offline, no account.

Written for what the app IS rather than what it currently does: no feature, no
module and no version in it, because those change and the description should not.
Which parts exist today belongs in the README.

**Website** — set 2026-08-09

> https://3d-printing-pal.pages.dev

**This is now true.** 0.1.0 was promoted to `main` on the owner's say-so and the
production deploy was read in its log rather than inferred — its steps ran, and
wrangler reported the deployment complete.

**Topics** — set 2026-08-09

> `3d-printing` `filament` `kanban` `pwa` `offline-first` `indexeddb` `local-first` `no-account`

**Social preview** — set 2026-08-09

**Confirmed live.** The repo page's `og:image` points at
`repository-images.githubusercontent.com`, which means the uploaded card is really
in place — `opengraph.githubassets.com` would have meant GitHub was still
auto-generating one and the upload had not taken.

Delivered in chat as `social-preview.png` (1280x640), which is the size GitHub
asks for. Source is the repo's own `social-card.html`, rendered by
`tools/render-social.mjs`; the same template also produces `public/og.png` at
1200x630, which the app serves as its `og:image`, so the two cannot drift into
saying different things.

It carries the app's NAME in real type above a printer farm — a whole machine at
full contrast with one receded and cropped by each edge, so the row reads as
continuing past the card. Name, tagline, and one plain line of what it is, which
is all a card read at a third of its size beside a bare domain can carry.

**The card's art is deliberately NOT the icon.** An icon carries one shape at
favicon size and a farm shrunk that small is grey mush, so they are two drawings.
Inside the card the machine is drawn once and placed three times, so the file
cannot disagree with itself.

**Its contrast is measured rather than looked at**, by `tools/social-check.mjs`,
which is the piece the hub's own card tooling does not have: it renders the card
with the text hidden, takes each LINE's tight rect from `Range.getClientRects()`
rather than the element box, samples the lightest pixel under it, and fails below
4.5:1 at both aspect ratios. Worst line on the new card measures 10.4:1. It was
planted red before it was trusted.

**Default branch** — set 2026-08-09

> `main`

`main` now exists and carries the production release, so the interim is over —
the earlier proposal here was `staging`, only because `main` did not exist yet
and the default was pointing at a branch that was not there.

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.
