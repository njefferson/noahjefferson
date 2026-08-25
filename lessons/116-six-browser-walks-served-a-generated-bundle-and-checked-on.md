## 116 · Six browser walks served a generated bundle and checked only that it EXISTED, so any of them could measure the previous app and pass

**Enforced by:** GATE quietkeep:tools/bundle-fresh.mjs · CHECKLIST
stale-artefact — every generated thing a check READS is checked for freshness,
not just for existence, in the same commit that makes the check depend on it.
The question is not "is it there" but "is it the one this source would produce".

A sibling's browser walks — accessibility, smoke, look, the walkthrough
photographs, the import walk, the touch gate — all serve `public/app.js`, which
esbuild generates and `.gitignore` excludes. Each opened with the same guard:
does the file exist, and if not, say to run the build. **None asked whether it
was current.**

**So the sequence that breaks it is the ordinary one:** edit `src/`, run the
walk, read green. The walk served the last build and measured the app as it was
before the edit. Six walks, every session, for the life of the repo.

**CI was never wrong, and that is what kept it invisible.** The pipeline runs
`npm run build` before its walks, so the full run always measured the right
thing. The exposure was entirely local — and local is where a session decides a
push is safe. That repo's own plan file names running the smoke walk locally
before pushing as a verification step, written after a browser walk failed in CI
that no static sweep could see.

**What found it was an accident, and the accident is the lesson.** A new audited
state asserted that a control's label read *Come back to this* before auditing
it. The walk failed saying the sheet *still says Make it repeat* — the previous
build's words. **Nothing structural could have caught it:** a new audit added to
a stale bundle measures the old markup and passes, and every existing audit
passes for the same reason. The check had no way to fail.

**The fix is one stat, not a rebuild.** Compare the bundle's mtime against the
newest mtime under `src/`; refuse and say so. Deliberately NOT "build it for
me" — a check that repairs the condition it tests stops being able to report it,
and the next stale-artefact defect would arrive somewhere the repair does not
reach.

**The general shape, and this family keeps meeting it.** Wherever a check reads
something generated — a bundle, rendered screenshots, a snapshot, a compiled
schema, a hook installed into `.git` — existence is not currency, and the gap
between them is exactly as long as the interval since the last generation. The
repo already gated the walkthrough photographs, the changelog triplet and the
pre-commit hook this way. The walks were the one generated thing with no
freshness check, and they are simultaneously the most expensive to run and the
most trusted when they pass.

---
