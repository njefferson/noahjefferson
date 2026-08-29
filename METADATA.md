# Repo metadata — every app, one file (Doctrine §10)

The GitHub-side metadata the session token cannot set: description, website,
topics, social preview, default branch. Each is a Settings-page step the owner
performs by hand; this file is the single place the VALUES live, so a session
proposes here and the GitHub UI copies from here — never the other way round,
and never typed fresh in chat where it evaporates.

**Status is tracked per item.** An item is `set` only after the owner has actually
applied it and said so; `proposed` means the value below is awaiting the owner's
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

**Description** — **SET** 2026-08-27, applied by the owner and read back from
the repository. First set 2026-08-03; the revision below was proposed the same
day and sat unapplied for twenty-four days.

Superseded:

> A glass cockpit for your desk — airliner instruments driven by your device's
> own sensors and live aviation data. Not a simulator; never for navigation.

**Why it changed** — that framing put the app *for your desk*, which is one
reader's case and silently excluded the two uses that make the panel come alive:
following a real flight while on it, and clamping it in the car. The app was
undersold by its own copy. Live now:

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

# njefferson/solve-ent

**Every item below is `set`**, applied by the owner on 2026-08-27 and confirmed
by them here — which is the only thing that flips a row (§10). A session cannot
see a repository's description, topics or social preview, so it cannot check
this and must never mark a row itself.

**Description** — **set** 2026-08-27

> Learn the algebra chemistry needs. Every wrong answer is traced to the
> mistake that produced it, not marked wrong.

Written for what the app IS rather than what it currently does. No topic list,
no version and no feature in it — the seven topics belong in the README, where
they are cheap to change. The second sentence is there because it is the whole
product: free tools already solve these, and none of them says which
misconception produced a particular number.

**Website** — **set** 2026-08-27

> https://solve-ent.pages.dev

**THE ADDRESS ANSWERS**, which is why this one could be applied at all.
`deploy.yml` uploaded thirty files to the `solve-ent` Pages project on
2026-08-26 and reported `Deployment complete`; the owner opened the URL and
confirmed the app is there, and only then was the field set. A website field
pointing at a 404 is worse than an empty one — it reads as a shipped app to
anybody who finds the repository.

**A SESSION CANNOT CHECK THIS ONE ITSELF.** The environment's egress policy
refuses `*.pages.dev`, so a session that curls the deployed site gets a 403 from
the proxy gateway rather than a page. That is a network policy, not an outage —
and reading it as one is precisely §162. The deploy log is the end of what a
session can see; the confirmation has to come from somebody with a browser.

**Topics** — **set** 2026-08-27

> `algebra` `chemistry-education` `stoichiometry` `education` `pwa`
> `offline-first` `local-first` `no-account` `accessibility`

**Social preview** — **set** 2026-08-27

The card is `social-preview.png` in the solve-ent repository, 1280x640, which is
what GitHub crops to. It is GENERATED by `tools/social-card.mjs` from
`palettes/solve-ent.json` and the shipped `public/icon.svg`, so the colours are
the ones the palette gate measures rather than picked for a card, and the flask
on it is the app's own icon rather than a redraw.

The two sentences on it are the description above, word for word. A card that
said something else would be a third place to keep one claim in step.

This row said "nothing to upload yet — neither the art nor the palette exists",
which was true when it was written and stopped being true the day the palette
and the icon landed.

**Default branch** — **set** 2026-08-27, on the owner's word

> `main`

It was deliberately `staging` while `main` carried nothing, because a default
branch pointing at an empty branch is what a visitor lands on. It flipped on the
first promotion, exactly as 3d-printing-pal's did, and `main` is now the default
branch, the Cloudflare Pages production branch and what a push deploys.

---

# njefferson/MoleBridge

Added 2026-08-25. Every item was set on 2026-08-25 — description, website,
topics and default branch read back off the repository rather than assumed, the
social preview on the owner's word because the API does not expose it.
**EVERY ITEM IS SET.** The description was revised and the topics extended on
2026-08-27, and both were read back off the repository the same way.

`https://molebridge.pages.dev` was opened and answers — confirmed by the owner
on 2026-08-25, which is the check no gate here could perform: this sandbox's
proxy refuses `*.pages.dev`, and the deploy job's own assertions had only ever
run against the immutable per-deploy host. The apex follows a push, so the
Cloudflare project's production branch is correctly set.

**Description** — **SET** 2026-08-27, applied by the owner and read back from
the repository. First set 2026-08-25; revised on 2026-08-27 for the reason
below.

Superseded, and the two phrases that superseded it are why:

> A step-gated stoichiometry trainer. Students enter every intermediate value;
> the app names which step failed and why, and hands the teacher a completion
> code that decodes to a class-wide error histogram.

The description says what the app IS rather than what it is made of, per §10.
The temptation here is to lead with "no accounts, works offline", which is true
and is the wrong first sentence — it describes the constraints rather than the
thing. That judgement still holds; only two phrases in it do not.

**What is live now** — applied 2026-08-27. Releases 1.6.0 through 1.11.1 removed the
copy that told a reader the app belongs to somebody else, and a hard gate now
forbids each phrase by name across every screen and the patch notes. **The
repository description was never in that gate's scope, and it carries two of the
exact phrases the gate forbids** — one naming who receives the code, one naming
the group it summarises.

It is also the FIRST surface most readers meet: it is what GitHub search returns,
what the social card shows, and what the hub links under. A family learning at
home is told the app is not theirs before the app has loaded. The revision keeps
the sentence structure and the §10 judgement above, and changes only the room:

> A step-gated stoichiometry trainer. Students enter every intermediate value;
> the app names which step failed and why, and hands back a completion code that
> decodes to an error histogram across everyone who worked the same key.

**The general shape, which is worth checking in every repo: a word gate scans
the working tree, and a repository description does not live there.** Nothing
about the app can fail on it.

**Website** — **SET** 2026-08-25, read back from the repository

> https://molebridge.pages.dev

0.4.4 was promoted to `main` and deployed. The row's earlier condition — do not
set this until a deploy from `main` answers there — is met on the first half and
unverified on the second: the deploy happened, and the address itself has not
been fetched by anyone. See the note at the top of this section.

**Topics** — **SET** 2026-08-27, applied by the owner and read back from the
repository as all eleven. Ten were set 2026-08-25; `homeschool` was added
2026-08-27.

> chemistry, stoichiometry, education, high-school, homeschool, teaching-tool,
> pwa, offline-first, typescript, no-backend, static-site

`high-school` stayed, and the reasoning is worth keeping: it names a curriculum
level rather than a room, and a family learning at home works high-school
chemistry and uses that word for it. `homeschool` was added for discoverability
rather than as a correction — nothing in the list was wrong, and a reader
searching that word had no way to arrive.

**Social preview** — **SET** 2026-08-25, applied and confirmed by the owner

Generated by `npm run og` in the repository from `tools/og-card.html`, at
1280x640. The artwork is wordless and the lettering is real type laid over it
(Doctrine §3) rather than letter paths, and its contrast is MEASURED rather than
looked at: the renderer checks every run of text against the colour actually
behind it and refuses to pass below 4.6:1. It came out at 9.63, 6.43 and 9.45.

Not verifiable from here — the API does not expose a social preview, so unlike
every other row in this section this one rests on the owner having said so.

**Default branch** — **SET** 2026-08-25, read back from the repository

> `main`

The family convention holds here: work commits to `staging`, `main` is
production, and `.branch-guard` generates a pre-commit hook that refuses
anything else. `main` is the right default either way, because it is what a
reader lands on and it is what Cloudflare Pages treats as production.

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.

---

# njefferson/Cv-Thalweg

Added 2026-08-29, the day the app was named for the hub. **NOTHING IS SET.**
Every item below is PROPOSED: a session cannot set repository metadata, and
none of these has been read back off the repository.

**Description** — proposed:

Depth, tide and flow for the Central Valley fall-run fishery — the Sacramento,
Feather, American and Mokelumne, and the Delta. Published surveys and gauges
only. Not for navigation.

**Website** — proposed:

https://cv-thalweg.pages.dev

**Topics** — proposed:

california, sacramento-river, delta, bathymetry, tides, usgs, noaa, dwr, cdfw,
salmon, fishing, pwa, offline-first, leaflet, cloudflare-pages, no-tracking

**Social preview** — not proposed yet. The app's own icon is a channel section
with the thalweg marked; a preview image has not been made.

**Default branch** — `main`, which is already the only branch and the Cloudflare
Pages production branch. Nothing to change, but it has not been read back off
the repository either, so it is listed rather than assumed.
