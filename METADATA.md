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

**Description** — set 2026-08-03. **A revision is proposed below.**

Live on GitHub now:

> A glass cockpit for your desk — airliner instruments driven by your device's
> own sensors and live aviation data. Not a simulator; never for navigation.

**Proposed revision** — 2026-08-03. The live description frames the app *for
your desk*, which is one reader's case and silently excludes the two uses that
make the panel come alive: following a real flight while on it, and clamping it
in the car. The app is undersold by its own copy.

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

**Every item below is `proposed`.** Nothing here has been applied, and this
repository must not be reported as set up while that is true (§10).

**Description** — proposed 2026-08-26

> Learn the algebra chemistry needs. Every wrong answer is traced to the
> mistake that produced it, not marked wrong.

Written for what the app IS rather than what it currently does. No topic list,
no version and no feature in it — the seven topics belong in the README, where
they are cheap to change. The second sentence is there because it is the whole
product: free tools already solve these, and none of them says which
misconception produced a particular number.

**Website** — proposed 2026-08-26

> https://solve-ent.pages.dev

**THE DEPLOY HAS RUN — and that is not the same as this being true yet.** On
2026-08-26 `deploy.yml` uploaded thirty files to the `solve-ent` Pages project
and reported `Deployment complete`. What no session has been able to check is
whether the address ANSWERS: the environment's egress policy refuses
`*.pages.dev`, so the deploy log is the end of what can be seen from here.

A website field pointing at a 404 is worse than an empty one — it reads as a
shipped app to anybody who finds the repository. So this stays `proposed` until
somebody opens the URL and sees the app. That is a five-second check and it is
the owner's, not because of a permission but because of a network policy.

**Topics** — proposed 2026-08-26

> `algebra` `chemistry-education` `stoichiometry` `education` `pwa`
> `offline-first` `local-first` `no-account` `accessibility`

**Social preview** — proposed 2026-08-26

**Nothing to upload yet.** The card carries the app's name in real type over
wordless art (§3, §10), and neither the art nor the palette exists — this
repository has no screen and no colours. It is listed here so the obligation is
visible rather than discovered later.

**Default branch** — proposed 2026-08-26

> `staging`

**Deliberately `staging` and not `main`, for now.** `main` is production and
carries nothing; a default branch pointing at an empty branch is what a visitor
lands on. This flips to `main` on the first promotion, exactly as
3d-printing-pal's did.

---

# njefferson/MoleBridge

Added 2026-08-25. **EVERY ITEM BELOW IS NOW SET.** Description, website, topics
and default branch were read back off the repository rather than assumed; the
social preview is on the owner's word, because the API does not expose it and
there is nothing to read.

`https://molebridge.pages.dev` was opened and answers — confirmed by the owner
on 2026-08-25, which is the check no gate here could perform: this sandbox's
proxy refuses `*.pages.dev`, and the deploy job's own assertions had only ever
run against the immutable per-deploy host. The apex follows a push, so the
Cloudflare project's production branch is correctly set.

**Description** — **SET** 2026-08-25, applied and confirmed by the owner

> A step-gated stoichiometry trainer. Students enter every intermediate value;
> the app names which step failed and why, and hands the teacher a completion
> code that decodes to a class-wide error histogram.

The description says what the app IS rather than what it is made of, per §10.
The temptation here is to lead with "no accounts, works offline", which is true
and is the wrong first sentence — it describes the constraints rather than the
thing.

**Website** — **SET** 2026-08-25, read back from the repository

> https://molebridge.pages.dev

0.4.4 was promoted to `main` and deployed. The row's earlier condition — do not
set this until a deploy from `main` answers there — is met on the first half and
unverified on the second: the deploy happened, and the address itself has not
been fetched by anyone. See the note at the top of this section.

**Topics** — **SET** 2026-08-25, applied and confirmed by the owner; read back
from the repository as all ten

> chemistry, stoichiometry, education, high-school, teaching-tool, pwa,
> offline-first, typescript, no-backend, static-site

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
