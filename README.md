# noahjefferson.pages.dev

Personal link hub — photography accounts and free web apps.
Static, self-contained, no build step.

## Structure
- `public/` — the deployed site (index.html, og.png share card, tiles/ app social cards)
- `og-card.html`, `render-og.mjs`, `render-preview.mjs` — tooling to regenerate the share card / preview

## Deploy (Cloudflare Pages, Git-connected)
- Framework preset: **None**
- Build command: **(empty)**
- Build output directory: **public**

No build runs; Cloudflare serves `public/` as-is. Every push to `main` redeploys.
