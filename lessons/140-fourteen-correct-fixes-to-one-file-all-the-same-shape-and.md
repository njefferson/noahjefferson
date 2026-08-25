## 140 · Fourteen correct fixes to one file, all the same shape, and "why are there fourteen" was never asked from inside the work

**Enforced by:** JUDGEMENT

**Smell:** the same file has been fixed three times running and every fix was
correct. Before writing the fourth, write one paragraph answering *what is true
of all of these*. A gate cannot catch it — a counter that fires at N is answered
by splitting commits — but the COUNT is the signal, and the count is always
visible before the diagnosis is.

A navigation shim was added to two browser walks so they could reach controls
after a landing-view change. In one session it produced **fourteen rounds of
defects in itself and zero findings about the app it was walking.** Every round
was diagnosed correctly, fixed correctly, verified and pushed. Every round was
the same shape: the shim carried a SECOND copy of rules the app already computed
on every paint, and the two disagreed.

Each fix was competent. The sequence was not. Nothing in an execution loop asks
whether the current step should exist, so momentum runs toward the next fix —
and the evidence for the real diagnosis sat unread the whole time, which is that
there were fourteen of them and they were one bug. It was named only from
outside the work, by an observation that the harness was finding more faults in
itself than in the code.

**The cost is the reason this is written down rather than remembered.** Each
round was a browser walk, a CI round, or both. A correct fix delivered fourteen
times is not fourteen units of progress. It is one diagnosis, missed thirteen
times, and billed every time.

The fix, once asked, was one file: the rules moved into app source
(`quietkeep:src/reach.ts`), the app imports them, and both walks bundle and
inject the same module. Two models of one thing drift; the drift is invisible
until a slower machine runs it.

Same family as §104 (an absence identical to a presence) and §138 (a check whose
fixture cannot express its failure has not run): the evidence was present and
unexamined, not missing.
