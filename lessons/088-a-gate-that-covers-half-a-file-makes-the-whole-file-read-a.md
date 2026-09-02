## 88 · A gate that covers half a file makes the whole file read as maintained — and the cure is to check the file against ITSELF, not against the truth

**Enforced by:** GATE quietkeep:tools/collisions.mjs — the TOP 5 list and the entry it points at must agree about what shipped. Generalise it: wherever one file states the same fact twice, add a check that the two statements agree. **CHECKLIST for the rest:** when a fact would be written in a second place, either link to the first or accept that the second will go stale, and say which you chose.

A catalogue had been found to be a false receipt — claiming as unbuilt things
that had shipped — and a gate was written to stop it happening again. The gate
held every ENTRY honest: each states how strong its evidence is and how it
routes, both from closed sets.

At the bottom of the same file sat a ranked list of what to build next. **Four of
its five items had shipped**, and each one was recorded as *shipped* in the very
entry the list pointed at. The gate had never looked there.

**A file with a gate over half of it reads as maintained.** That is worse than a
file with no gate at all, because the gate is the reason nobody re-reads it. The
green check is doing the work the reader's suspicion used to do, over a smaller
area than the reader assumed.

**The cure that works, and it needs no knowledge of the subject.** The gate's own
header had already refused the obvious idea, correctly: a gate that decided *what
had shipped* would need to know the codebase, would drift, and would become the
same false receipt it was written to prevent. So it checked nothing.

But there is a third option between "know the truth" and "check nothing":
**check that the document does not contradict itself.** Two statements of one
fact, in one file, must agree — that is decidable by a script with no domain
knowledge whatsoever, it never goes stale, and it catches the exact failure. It
does not need to know which of the two is right; a disagreement is a defect
either way, and a human resolves it in a minute because both halves are named.

**Where to look for the same shape:** any document with a "what to build next"
section and per-item status; any status list beside a per-item record; any count
stated in prose beside the thing it counts. All of them state one fact twice, and
in every case only one of the two copies has a reason to be revisited.

**The general shape:** ask what fraction of a file its gate actually reads. If a
gate covers the part that is easy to check and the drift lives in the prose, the
gate is measuring the wrong half — and its passing is what stops anyone noticing.
