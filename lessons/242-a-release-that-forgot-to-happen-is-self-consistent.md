## 242 · A release that forgets to happen is perfectly self-consistent, so every consistency check passes it

**Enforced by:** GATE 3d-printing-pal:tools/shipped-version-check.mjs — if any
file the service worker PRECACHES differs from `origin/main`, the version must
differ from `origin/main` too; the precache list is read out of `sw.js` rather
than kept as a second copy, and a missing `origin/main` fails rather than skips.
Planted red against the exact tree that was sitting on staging. · CHECKLIST
did-it-change-for-anyone — before promoting, ask not "is this correct" but "what
reaches a device that already has the app", and answer it from the artefact that
decides, which for an offline-first app is the worker's own bytes. · JUDGEMENT —
which files count as shipped, in a repo where `public/` also holds pages the app
never caches.

**Smell:** a change to CSS, markup or an app module with no version bump in the
same commit — especially a small correction that feels beneath a release. Also:
any repo where the version lives in more than one file and a gate holds those
files to EACH OTHER. That gate proves they agree; it cannot notice that they
agree on the wrong number.

**A contrast fix that would have reached nobody, 2026-09-04.** Four stylesheets
in an offline-first app had their dimmed-text colours corrected — a real
improvement, measured against the palette floors, in both themes. It sat on
`staging` for several days. The version constant was never touched, so the
service worker stayed **byte-identical** and kept the cache name production was
already running.

**An installed app only goes looking for a new copy of itself when the worker
differs. An unchanged worker IS "no update."** Promoted as it stood, the fix
would have been correct in the repository, live at the address, and invisible on
every device that already had the app installed — which is the entire population
it was written for. The only readers who would have seen it are the ones who had
never used the app.

**EVERY RELEVANT GATE WAS GREEN, AND EACH WAS RIGHT.** The PWA check asserts the
cache name CARRIES a release — it did. The changelog check holds the version
constant, `CHANGELOG.md` and the in-app patch notes identical to one another —
all three agreed, on the old number. Those are checks of **internal
consistency**, and that is the trap: a release that never happened is internally
consistent in every respect. Nothing in the repository was contradictory. It was
simply, uniformly, the previous release.

**The question none of them asked was about the OUTSIDE.** Not "do these files
agree with each other" but "does this tree differ from what production serves,
and if so does it say so". That comparison needs a second tree — `origin/main` —
and every existing check was reading only its own.

**Why it is easy to do and easy to miss.** The change was a colour correction of
a few hex digits. Nothing about it feels like a release: no feature, no
migration, no note anyone was waiting for. A version bump reads as ceremony for
something that small. **But the version is not a label describing the size of the
change — it is the mechanism by which the change is delivered.** Skipping it does
not ship a small fix quietly; it ships nothing at all.

**The general rule.** In any app that caches itself, the artefact that decides
whether a change reaches a reader is the worker's own bytes, and it is the last
thing anybody looks at. **Hold what the app SERVES against production, not
against itself.** And when adding a check to a family like this, ask what its
inputs are: a gate reading one tree can only ever find disagreements inside that
tree, and the most expensive defects are the ones where the tree is perfectly
coherent and simply wrong.
