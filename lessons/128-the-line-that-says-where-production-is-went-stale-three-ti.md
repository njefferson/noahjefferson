## 128 · The line that says where production is went stale three times in four days, and each time it was found by accident — because a maintained-looking line is the one nobody re-reads

**Enforced by:** GATE quietkeep:tools/branch-state-check.mjs — the two URL
bullets in NOTES.md's branch-state block are compared against the triplet in
`public/sw.js` in the tree and at `origin/main`, as a commit guard rather than a
CI step; planted six ways, including a missing `origin/main`, which FAILS rather
than skipping. · GATE 3d-printing-pal:tools/branch-state-check.mjs — the same
check adapted to a repo that writes the two facts THREE times, because its live
status page (§7i) carries them in a lede and in a row block as well as in
NOTES.md; same placement and the same six plants. · CHECKLIST
still-owed-by-the-rest — Intersecting Parallels, fauxplane and photo-pointer each
have a block like this and none of them has the check.

Quietkeep's `NOTES.md` carries a short block naming the version on staging and
the version in production. It was wrong three times:

- 2.12.2 / 2.11.0 until 2026-08-20, through two promotes.
- 2.14.1 / 2.13.0 until 2026-08-22, through eleven releases and a promote.
- 2.24.0 / 2.24.1 until 2026-08-23, through five releases and two promotes.

**No gate found any of them, and the three discoveries were all luck.** The
first was caught by `handoff-check.mjs`, which is not in that repo's Spine and
has to be remembered. The second by a lesson landing from another repo's session
while this one happened to be working in the file. The third only because a
production version came back from the device and the block had to be opened to
record it — and that third recurrence was in the same block, on the same day,
as the paragraph written into it about the second.

**Two notes and no gate is what produces a third note.** The block itself
carried the defect's own history, in bold, directly above the wrong numbers.
Writing the lesson into the artefact that has the defect does not fix the
defect; the doctrine already says this and it still took a third time.

**The failure mode is specific and worth naming: a line that looks maintained
is the one nobody re-reads.** Nothing about a version number beside a URL looks
stale. Every other kind of rot in these repos announces itself — a broken link
404s, a stale generated file fails its `--check`, a missing surface fails the
walk. A prose fact just sits there being wrong, and it is read as current by
everyone including the session that wrote the note about it being wrong.

**Ask of any hand-written fact: is it derivable?** Both numbers here were —
the release triplet lives in `public/sw.js`, which git holds at every ref, so
the check is two file reads and a `git show` with no network at all. The rule
generalises past versions: a hand-maintained fact that some file already knows
is not documentation, it is a second copy waiting to disagree.

**And where a derived check runs is part of its design, not a detail.** This one
is a commit guard and deliberately NOT a CI step, because it compares against
`origin/main` as of the moment of the commit. On a runner at a promote,
`origin/main` is already the merge, so the step would be red by construction on
every promote — and a gate that is red for a window teaches everyone to ignore
red. Same reasoning the hub gives for keeping `doctrine-sync.mjs` out of CI, and
the same shape as `branch-guard.mjs`'s `.git/hooks` assertion being a fact about
one clone. **Before wiring a new gate, ask what its assertion is true OF** — a
tree, a clone, a ref, a moment — and put it where that thing exists.

The SHAs beside each version are left ungated on purpose. A commit cannot name
its own hash, and gating production's would leave the block unfixable for a
window after every promote. All three failures were version failures; gating
what actually broke beats gating everything on the line.

**And it must SAY it is out on purpose, where the next reader will look.** 127
is the mirror of this: two gates missing from a workflow by accident, invisible
for a release and longer, and the fix there is a parity check comparing the
check chain against the workflow's steps. A gate deliberately absent from CI
looks exactly like those two to a parity check. So this one is not in
`npm run check` either — it is declared in `.branch-guard`, which is the list it
actually belongs to — and the reason is in the first screen of the gate's own
file rather than in a commit message nobody will open.

---

**THE DEFECT MOVED HOUSE WITHIN MINUTES OF THE GATE PASSING.** Asked what was
still open, the session opened `docs/plan-routed.md` and found its own resume
block naming Production 2.24.1 and Staging 2.24.1 — five releases and three
promotes out of date, in a file the new gate does not read. Adopting the gate
into 3d-printing-pal turned up THREE copies in that repo, because its live
status page carries the same two facts in a lede and in a row block as well.

**So the answer is not to police every copy — it is to refuse the copy.** The
block in NOTES.md complains about "one file, two answers" three paragraphs above
where it was itself wrong. The gate's second half fails on a present-tense
bullet claiming what a branch carries in any tracked markdown but the one
source, **whatever version it names, a correct one included**: a copy that is
right today is a copy that goes wrong on the next promote.

Narrow on purpose. It matches the bullet shape these blocks use with a triplet
on the same line and leaves prose recounting what production HELD in the past
alone. A false positive is the one failure a gate cannot recover from, because
the next session routes around it and every later assertion in the file goes
with it.

**And when a gate grows a second assertion, its ADVICE has to fork with it.**
This one printed "fix the block in NOTES.md" while the block was correct and
only a copy was stale — sending somebody to the one file that was right. The
failure message is part of the gate: a correct refusal with misdirecting advice
costs the time the gate was built to save, and it is invisible until the new
half fails on its own, which is a case worth planting deliberately.
