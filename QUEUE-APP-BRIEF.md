# Queue app — design brief (TEMPORARY, lives here only until the app repo exists)

> **This file does not belong to the hub.** It is parked here because the app's own
> repo did not exist when the design was settled, and a session cannot add a repo
> mid-flight (Doctrine §11). **The next session moves this into the new repo's
> `NOTES.md` and deletes it from this repo.** Do not build anything from it inside
> `noahjefferson`.
>
> To do that work, start a session with **both** the new repo **and** `noahjefferson`
> selected — §13 requires the hub in scope because `DOCTRINE.md` lives here.

Settled with Noah, 2026-07-26. **Repo name: `InstaQueue`** (Noah's call, 2026-07-26).

---

## Thesis

The `ig-posting-scheduler` skill already maintains a real, ordered, dateless queue
per account: a versioned state CSV in Drive, queue order = row order, and a strict
per-post output block (caption, blank line, hashtag line, nothing else). Today the
only way to *read* that queue is to open a chat session and ask. Noah posts from his
phone, on his own timing.

The gap is **delivery, not planning** — the next post in his hand (frame, caption,
hashtags) without starting a session.

So: a **read-only pocket mirror of the queue with one-tap copy**, plus a receipt of
what he posted to hand back to Claude. Claude and the Drive CSV stay the single
writer of record. The app never becomes a second source of truth.

It needs no server, no account, and no Drive credentials to do this — which is why it
sits inside the doctrine cleanly rather than fighting it.

## What it is / what it is NOT

**Is:** free · on-device · offline-first · no account · no analytics · **no network
calls at all** (strict CSP, zero external requests). Doctrine §1 clean.

**Is NOT** — stated plainly on the About screen (§9):

- not connected to Instagram; it never posts anything
- not connected to Google Drive; it holds a copy Noah imported, not live state
- not a queue editor — order, captions and tags are decided with Claude, in the skill

## Data contract

Requires **no changes to the skill**. It consumes what the skill already writes.

Source of truth is the skill's state CSV (see the skill's `references/state.md`):

```
filename,account,status,tier,species,session,post_date,post_time,caption,tags,phash,dhash,notes
```

Two import paths, one normalizer:

1. **CSV import (canonical).** The exact `state_<account>_<stamp>.csv` from Drive.
   The parser must handle quoted fields, `\n` escapes inside `caption`, and legacy
   rows missing the `phash`/`dhash` columns. Only `queued` rows render in the queue
   (in row order — row order *is* the queue); `posted` rows populate history;
   `nominee` and `cut` are ignored.
2. **Paste import (fast path on iPad).** Claude prints a JSON block in chat; Noah
   taps copy in chat, taps Paste in the app. No file management at all. Normalizes to
   the same record.

**Photos** never arrive with the data. They come from an `<input type="file" multiple>`
picker (Files / Drive app) and are matched to rows by **filename stem** (`NOA_7362`)
— the same key Lightroom and the CSV already share. On import the app derives, in
the browser via canvas, a ~400px thumbnail for lists and a 1440px-long-edge JPEG;
both stored as blobs in IndexedDB. A frame with no photo renders a labelled
placeholder, never a silent blank.

**Merge on re-import**, keyed `account + filename`:

- captions, tags, species and order always take the newer CSV
- a row marked posted-in-app that comes back as `queued` keeps a **"posted here, not
  yet in Drive"** flag until a CSV agrees
- never silently drop a local posted mark; never silently overwrite one

**Round trip out:** a *Copy update for Claude* button emitting plain lines —
`posted: NOA_7362 2026-07-26` — for pasting into chat, where Claude records the
transition and writes state back to Drive. The app does **not** emit a rival CSV.
One writer.

## Screens

1. **Next up** — thumbnail, "1 of 14", account, species, then the copy block rendered
   **byte-identical to the skill's per-post rule**: caption, blank line, hashtag line,
   and nothing else inside the block. Buttons: Copy post · Save photo · Open Instagram
   (opens the app and claims nothing more) · Mark posted → advances.
   **Per-slide carousels:** a caption cell holding `\n\n`-separated `(1/3)` parts
   renders one labelled block and one Copy button *per slide*, tags on slide 1 only —
   mirroring the skill's rule that a combined block is manual work he'd have to undo.
2. **Queue** — numbered list, thumbnail, species, tier; tap to open. Order is
   read-only.
3. **Posted (pending sync)** — local receipts and the copy-for-Claude button.
4. **Data** — import CSV / paste / add photos; a freshness line ("imported 2026-07-26 ·
   14 queued · 3 frames without a photo") and the exact missing filenames; storage
   used; a `navigator.storage.persist()` request with an honest note that iOS can
   evict data from a site that isn't installed to the home screen.
5. **About** — what it is / is NOT, privacy, a link to the hub accessibility
   statement, PolyForm Noncommercial.

Account filter: All / photo / macro / infrared.

## Accessibility — DESIGN step (§4: the non-hue channel, stated before any code)

| Encoding | Non-hue channel |
| --- | --- |
| Account | text label + distinct glyph shape + fixed position |
| Tier A/B/C | the letter itself, in the badge |
| Status (queued / posted / pending sync) | text label + icon (outline dot / check / clock) + section grouping |
| Missing photo | dashed placeholder + the words "no photo imported" |
| Copy succeeded | button text changes to "Copied" + icon |
| Position in queue | the number, always rendered |

Every one survives a grayscale render. Plus: a computed contrast gate in CI (exits
non-zero on failure; new fg/bg pairs added in the same commit), ≥44px targets,
visible focus rings, real `<button>` / `<dialog>`, no zoom lock, reduced-motion
honored, and an axe run in both themes before any UI ship.

Port `a11y-scan.mjs` and `a11y-detail.mjs` from the hub rather than writing new ones.

## PWA shell

Own `manifest.webmanifest` (`display: standalone`, own icon — wordless artwork with
lettering overlaid afterwards per §3), a service worker precaching the shell only
(queue data lives in IndexedDB and never in the SW cache), cache name carrying the
release triplet. Static, no build step. Deploy workflow copied from the hub's
`.github/workflows/deploy.yml`.

## Bootstrap checklist for the new repo (Doctrine §13)

1. `CLAUDE.md` — thin, pointing at this repo's `DOCTRINE.md`, repo-specific facts only
2. `LICENSE` — PolyForm Noncommercial 1.0.0
3. `NOTES.md` — this brief becomes its thesis, roadmap and settled decisions
4. `ACCESSIBILITY.md` — the append-only register
5. Branches: `staging` and `main` only
6. Hub wiring — per the open question below
7. Repo metadata — listed for Noah to confirm (§10; the session token cannot set it)

## Verification, before any handoff to Noah

Serve the app locally and walk the full journey headless: import a real state CSV,
import photos, confirm stem matching, copy the block and **assert it is byte-identical
to the skill's output**, mark posted, re-import a newer CSV and assert the merge rules
hold. Then run the a11y scan in both themes and confirm an offline reload works with
the network disabled. Report what was verified separately from what needs his hands
(install, share sheet, real iPad feel).

## Open — Noah's calls, still unanswered

1. **App display name.** The repo is `InstaQueue`. Whether the *app* also reads
   "InstaQueue" on the home screen and in the manifest is still open — the family
   reads Photo Studio / Frame / Photo Pointer / Astro Planner / ND Toolbox. Default
   assumption: same name, both places. Note for whoever ships it: Meta's brand
   guidelines ask third parties not to use "Insta" or "Gram" in a product name, which
   matters only if the app is ever published or listed publicly — a private repo and
   an unlisted personal tool are unaffected. Noah's call, flagged once, not relitigated.
2. **Does the app hand him the actual file to post** (a 1440px copy with
   Save-to-Photos), or is the photo only there to identify the frame he exports from
   Lightroom? The file it holds is whatever he imported, not his Lightroom export —
   whichever way this goes, the app must say so plainly.
3. **Listed on the hub, or unlisted personal tool?** It is local-first and no-account
   like the rest, so it *could* sit in the app list; default assumption is unlisted.
4. **Confirm the read-only-mirror model** (mirror + receipts, one writer) rather than
   the app also exporting its own CSV.

Ask these in plain text. The choice popup is banned permanently (Doctrine §0).
