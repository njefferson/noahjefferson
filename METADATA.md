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

---

## njefferson/fauxplane

| item | value | status |
|---|---|---|
| Description | A glass cockpit for your desk — airliner instruments driven by your device's own sensors and live aviation data. Not a simulator; never for navigation. | proposed |
| Website | https://fauxplane.pages.dev | proposed |
| Topics | `aviation` `glass-cockpit` `flight-instruments` `adsb` `efis` `pwa` `offline-first` `web-sensors` | proposed |
| Social preview | **The icon-art card — Noah's pick, 2026-08-03.** Save from https://fauxplane.pages.dev/social-preview-icon.jpg (long-press, Save), upload in Settings → Social preview. Source: `scripts/social-card-icon.html`; og:image already serves it. | proposed |

## njefferson/noahjefferson

| item | value | status |
|---|---|---|
| Description | Photography, and small free tools for enjoying the world. | proposed |
| Website | https://noahjefferson.pages.dev | proposed |
| Topics | `photography` `portfolio` `free-tools` `pwa` `offline-first` `static-site` | proposed |
| Social preview | Delivered to Noah in chat, 2026-08-03. Also now genuinely at https://noahjefferson.pages.dev/og.png — the file had never been copied into `public/`, so index.html's og:image and the URL this row used to give were both 404. Regenerate with `node render-social.mjs`, then copy to `public/og.png`. | proposed |

---

New app? Add its section here in the same commit that creates the repo, and
point its CLAUDE.md §10 note at this file.
