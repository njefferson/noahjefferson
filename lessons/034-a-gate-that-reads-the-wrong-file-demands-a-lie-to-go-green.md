## 34 · A gate that reads the wrong file demands a lie to go green

**Enforced by:** GATE hub:handoff-check.mjs — the version lookup now tries
`public/src/core/version.js` and `src/core/version.js` before falling through to
`package.json`.

`handoff-check.mjs` requires a staged candidate's NOTES.md block to name the
version it is staging, so "there is a build on staging" cannot be acted on
without knowing WHICH. It found the version at `src/version.js`, or failing that
in `package.json`.

fauxplane has **no build step**: `public/` is deployed verbatim, so its module
tree is `public/src/` and its one version constant lives at
`public/src/core/version.js`. Neither path matched. The gate fell through to
`package.json` — which in that repo is a scaffold holding `0.1.0`, a number
nobody has ever bumped because nothing reads it — and failed with:

 NOTES.md records the deploy URL but not the current version (0.1.0) beside it

The app on screen said 1.16.0. **The only way to satisfy the gate was to write
0.1.0 into the handoff**, telling the owner a version that does not exist, about a
build the owner is being asked to test. The gate's green state was a false statement.

**Doctrine §7b says a version is typed once.** A gate that reads a DIFFERENT
place than the app does is a second source of truth wearing a gate's authority —
worse than an ordinary duplicate, because it can compel the duplicate.

**The general shape: when a gate fails, check whether it is measuring what you
think before you change anything to satisfy it.** A fallback that silently
succeeds on the wrong file is the dangerous kind, because it produces a
plausible number rather than an error. Order fallbacks so the general case is
last, and prefer failing to guessing.

*(fauxplane and the hub, 2026-08-03.)*

---
