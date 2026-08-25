## 92 · A gate that takes `--repo` and silently ignores a bare path reports GREEN for the repo it was standing in, under that repo's name

**Enforced by:** GATE noahjefferson:gate-args.mjs — one parser for every hub gate that can be pointed at a sibling. An argument that is not a declared flag is refused with exit 2, so a mistyped invocation stops instead of measuring the wrong tree.

Seven gates live in the hub and serve six repos, which is the whole reason they
are not forked. Each took the target as `--repo <path>`. Each had hand-written
the same three lines to parse it, and each had the same hole: **an argument that
was not `--repo` was never looked at.**

So this, typed from the hub to check a sibling:

```
node privacy-check.mjs ../Quietkeep
```

scanned the hub. It printed a clean green — and it printed it under the HUB's
name, which is the only part of the output that could have given it away, and
only to somebody who already knew which name to expect.

**Why it reads as correct.** `docs-check.mjs .` DOES take a positional path.
Two gates in one directory, one convention each, and no error either way. Every
gate in the family had this, including both privacy gates — the ones whose whole
job is to be believed when they say a repo is clean.

**The near miss.** The rule these gates enforce says nothing personal about the
owner lands in any repo. A session adopting the gate in a sibling would have run
it exactly like this, seen `no personal disclosures in tracked files`, and
recorded that repo as covered. Not one of its files would have been opened.

**The fix is refusal, not tolerance.** Accepting the bare path is kinder in the
moment and leaves every invocation already written down — in a workflow, in a
handoff block, in a NOTES.md — ambiguous about which repo it measured. Exit 2
makes each one declare itself once and then be right for ever.

**The general shape, and it is not really about argv:** when two tools in the
same family take the same-looking argument with different meanings, the one that
IGNORES what it does not understand is the dangerous one. Silence on an
unrecognised input is a design decision, and the default it produces is
*measure something else and call it a pass*.
