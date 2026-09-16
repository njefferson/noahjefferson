## 315 · Turning a one-press act into a two-press act breaks every walk that pressed it, and the failure is a timeout rather than a wrong answer

**Enforced by:** CHECKLIST step-added-to-a-route — when a control that used to
commit starts asking something first, grep every walk and every picture-taker
for that control before running any of them; the walks are the only consumers of
a flow that cannot re-read the code. · JUDGEMENT — a new step in a flow is a
breaking change to every automated reader of that flow, and it does not look
like one from the diff.

**Smell:** a diff that inserts a question between a press and its commit. A walk
helper that clicks one thing and then waits for a count to change. Any wait
whose failure mode is a timeout rather than an assertion, because a timeout
reads as a hang and gets blamed on the browser.

**Measured 2026-09-16, Quietkeep, one full Spine run spent on it.**

A sorting route was changed to ask which kind of wish something is before
filing it — one press became two, deliberately and with the research behind it.
Two walks pressed that route: the smoke walk's helper clicked the label and then
waited for the queue's count to drop by one, and the accessibility walk pressed
it to put an item on the Menu, which is the only way anything gets there. After
the change neither outcome happens on the first press, so both would sit until
they timed out.

**Both were found by a grep that took seconds, and it was run after the chain
had started.** The release was committed, pushed, and a twenty-minute receipt
chain — a picture render, the full Spine with three browser walks, and an
inventory — was already running. Doctrine §11e names the shape exactly: look it
up before you start, not after something fails. The look here was one `grep -n
Someday tools/*.mjs`.

**Why this class is worth its own entry rather than filing under §180.** That
one is about a walk keying on COPY, which pins the copy and the defect with it,
and which breaks when a word changes. This breaks when the number of ACTS
changes: the click succeeded, the selector was right, and the wait one statement
later never resolved. The remedies differ — §180's is to key on structure rather
than words, and this one's is to teach the walk the new step — and keying on
`data-route` would not have saved either walk here, because both were already
finding the control they meant.

**AND THE SWEEP THAT FOUND THEM WAS WRONG, WHICH COST A SECOND WALK.** The first
grep reported ONE press in the smoke walk. There were three. That file is large
enough and carries enough non-ASCII that `grep` calls it binary, prints `binary
file matches`, and then shows SOME of its matches — and a partial answer from
grep does not look partial, it looks like the answer. `grep -a` printed all
three. The missed one was a SECOND route helper four thousand lines from the
first, and it was the one that put the item on the Menu for a later section, so
the failure surfaced hundreds of lines later as a Menu item that was not
there — naming the symptom and not the cause.

This is the same shape as *an empty process table is not proof*: the instrument
was lying in a way worth knowing, and the remedy is not to try harder but to
confirm with a reading that cannot be partial. Sweep with `grep -arn`, and when
a sweep returns exactly one hit for something you expect to be used in several
places, treat the count as the suspicious part.

**The general form:** the walks are the only readers of a flow that cannot
re-read the source when the flow changes. Any change to how many acts a thing
takes is a change to them; the cheapest moment to find out is before the first
browser starts, and the sweep that tells you where they are has to be one that
cannot answer partially.
