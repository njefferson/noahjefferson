# noahjefferson.pages.dev

Personal link hub — photography accounts and free web apps.
Static, self-contained, no build step.

## Structure
- `public/` — the deployed site
  - `index.html` — the page
  - `og.png` — link-preview (share) card
  - `tiles/` — each app's own social-tile image
- `.github/workflows/deploy.yml` — deploys `public/` to Cloudflare Pages on every push to `main`
- `og-card.html`, `render-og.mjs`, `render-preview.mjs`, `inline.mjs` — tooling to regenerate the share card / preview / single-file build

## One-time setup

1. **Create the repo** on GitHub: `njefferson/noahjefferson`.
2. **Add two repository secrets** (Settings -> Secrets and variables -> Actions -> New repository secret):
   - `CLOUDFLARE_API_TOKEN` — an account-wide **Cloudflare Pages: Edit** token.
   - `CLOUDFLARE_ACCOUNT_ID` — the same account ID your other apps use
     (Cloudflare dashboard -> Workers & Pages -> **Account ID** in the right sidebar).
3. **Push the files** to `main`.

The workflow skips gracefully until both secrets exist, so it never fails while
you're still setting up. On the first push with secrets present it creates the
`noahjefferson` Pages project and deploys to **https://noahjefferson.pages.dev**.

## Editing later
Change anything in `public/` and push to `main` — it redeploys automatically.
Regenerate the share card with `node render-og.mjs` after editing `og-card.html`.
