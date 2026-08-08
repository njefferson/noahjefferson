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

The app is **print-tracker**; the repo keeps the name it was created with. Every
item below is `proposed` — none of it is set until Noah applies it and says so.

**Description** — proposed 2026-08-07

> Track 3D print jobs, filament and models on your own device. Offline, no account.

Written for what the app IS rather than what it currently does: no feature, no
module and no version in it, because those change and the description should not.
Which parts exist today belongs in the README.

**Website** — proposed 2026-08-07

> https://3d-printing-pal.pages.dev

**The Pages project now exists** — it was created by the first push to `staging`
on 2026-08-08, and that deploy's log was read rather than inferred. But this
apex address serves the PRODUCTION deployment, and there has not been one: `main`
does not exist yet, so nothing has been promoted.

So this value is right and is not yet true. Set it once something reaches `main`
and that deploy has been read in a log. The staged candidate lives at
`https://staging.3d-printing-pal.pages.dev` in the meantime, recorded in the
repo's own NOTES.md where the handoff gate reads it.

**Topics** — proposed 2026-08-07

> `3d-printing` `filament` `kanban` `pwa` `offline-first` `indexeddb` `local-first` `no-account`

**Social preview** — proposed 2026-08-07

Not made yet. When it is: it carries the app's NAME in real type, and its
contrast is measured rather than looked at — render the tile once with the text
hidden, sample the real backdrop inside each LINE's tight rect rather than the
element box, take the lightest pixel found, and compute against the real text
colour.

**Default branch** — proposed 2026-08-07

> `staging` for now, and `main` at the first promote.

**This one is not cosmetic and it blocks the deploy.** The repository was created
empty, so `main` still does not exist. The repo's default branch currently names
a branch that is not there, which means the landing page, the default clone and
every new PR base all point at nothing. `staging` is where the candidate lives
and is real code, so it is the honest interim; `main` takes over the moment
something is promoted to production.

Setting it to `staging` is not the failure mode this file has recorded before —
that was a default left pointing at a stale working branch nobody had touched in
weeks. This one is the branch the work is actually on, and it is expected to
move.

**Until `main` exists, nothing reaches production** and no website URL above can
become real. Cloudflare Pages deploys production from a production branch, and a
branch preview alias may not resolve at all until the project has had one
production deployment.

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.
