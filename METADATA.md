# Repo metadata — every app, one file (Doctrine §10)

The GitHub-side metadata the session token cannot set: description, website,
topics, social preview. Each is a Settings-page step Noah performs by hand;
this file is the single place the VALUES live, so a session proposes here and
the GitHub UI copies from here — never the other way round, and never typed
fresh in chat where it evaporates.

**Status is tracked per item.** An item is `set` only after Noah has actually
applied it and said so; `proposed` means the value below is awaiting his
confirm. Never report a repo "set up" while any row says proposed (§10).

Where to apply: repo → Settings → General. Description and website in "About"
(the ⚙ on the repo home page also works); topics likewise; social preview
under Settings → General → Social preview → Edit.

**How to verify a row rather than assume it.** Description, website and topics
come back from the search API (`repo:owner/name`, full output). The social
preview does NOT — no API field exposes it. Read the repo's own HTML instead
and look at the `og:image` host: `repository-images.githubusercontent.com`
means a card was really uploaded, `opengraph.githubassets.com` means GitHub is
auto-generating one and the upload did not land. Note that a markdown-
converting fetcher drops the `<head>`, so this needs the raw HTML.

---

## njefferson/fauxplane

| item | value | status |
|---|---|---|
| Description | A glass cockpit for your desk — airliner instruments driven by your device's own sensors and live aviation data. Not a simulator; never for navigation. | **set** 2026-08-03 |
| Website | https://fauxplane.pages.dev | **set** 2026-08-03 |
| Topics | `aviation` `glass-cockpit` `flight-instruments` `adsb` `efis` `pwa` `offline-first` `web-sensors` | **set** 2026-08-03 |
| Social preview | **The icon-art card — Noah's pick, 2026-08-03.** Source: `scripts/social-card-icon.html`; og:image serves it too. | **set** 2026-08-03 |
| Default branch | `main`. Was `claude/jet-panel-pwa-amendments-f07ygu` — a harness branch this repo's policy says to ignore (Doctrine §11), so the landing page, the default clone and every new PR base all pointed at stale code until Noah moved it. | **set** 2026-08-03 |

## njefferson/noahjefferson

| item | value | status |
|---|---|---|
| Description | Photography, and small free tools for enjoying the world. | **set** 2026-08-03 |
| Website | https://noahjefferson.pages.dev | **set** 2026-08-03 |
| Topics | `photography` `portfolio` `free-tools` `pwa` `offline-first` `static-site` | **set** 2026-08-03 |
| Social preview | Delivered to Noah in chat, 2026-08-03. Also at https://noahjefferson.pages.dev/og.png — the file had never been copied into `public/`, so index.html's og:image and the URL this row used to give were both 404 until then. Regenerate with `node render-social.mjs`, then copy to `public/og.png`. | **set** 2026-08-03 |

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.
