## 135 · A live commit hook rolled back to before two of its guards existed refused one check loudly and skipped the other two in silence

**Enforced by:** CHECKLIST reinstall-on-any-clone-surprise — run the hub's
`branch-guard.mjs --repo . --install` whenever a clone's HEAD is not where it
was left; the tracked artefact is not evidence the live hook matches it. ·
JUDGEMENT a-guard-that-fired-is-not-a-suite-that-ran.

`.branch-guard` declares extra commit checks with `also=`, and
`branch-guard.mjs --install` GENERATES `.git/hooks/pre-commit` from it. A
session's clone reverted to a commit from before two of those checks were
declared, and the live hook went back with it: 1247 bytes, carrying `tour-fresh`
and neither `a11y-fresh` nor `branch-state`.

**So a commit that should have been refused twice was refused once.** The tour
guard fired, visibly and correctly, with a paragraph explaining itself. The
accessibility-receipt guard beside it said nothing, and a release went out
carrying a receipt for the previous commit's markup — the exact defect that
guard exists for, waved through by the mechanism built to catch it.

**Watching a hook refuse something is what convinces you the rest of it ran.**
That is the whole trap. A silent hook invites suspicion; a hook that stops you
for one reason reads as a working hook. Partial is worse than absent.

**The tracked artefact was correct throughout**, so nothing in CI could have
noticed: `.githooks/pre-commit` matched what `.branch-guard` declared and
`--artefact` kept passing. §107 already says whether a hook is INSTALLED is a
fact about one clone and cannot hold on a runner. This is the other half of
that: it also cannot be inferred from the repo, so the only signal is the clone
itself, and the moment to check is any time the clone is not where it was left.

---
