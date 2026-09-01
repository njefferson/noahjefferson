## 204 · A comment that names the gate it needs is a rule in a file, and the file already says that does not hold

**Enforced by:** GATE Cv-Thalweg:tools/copy-count.mjs — the specific instance, a count in reader-facing copy held to the array it names. · GATE noahjefferson:lessons-check.mjs — a LESSON citing a gate that does not exist already fails; a repo's own source comments are not reached by it, which is the gap this lesson is about. · CHECKLIST cited-gate-exists — when a comment, a note or a commit message names a
script as the thing that will stop a defect recurring, run that script before
the sentence is written. If it does not exist yet, the sentence is a promise and
must be written as one, or the script written first.

**Smell:** a comment in the present tense about a check that has not been run in
this session. "`tools/x.mjs` refuses…". "The gate below asserts…". Any sentence
where the evidence that it is true is that somebody intended it. Also: fixing a
defect and, in the same commit, writing the paragraph explaining why a paragraph
would not have been enough.

A repo fixed a class of defect — numbers typed into product copy that name the
size of an array elsewhere in the file — by routing several sentences through the
list. In the same commit it wrote a comment above the counting helper saying, in
as many words, that `tools/copy-count.mjs` refuses a hardcoded count in
reader-facing copy, **"because a rule in a comment is what this repo has just
demonstrated does not hold."**

The comment was written. The script was not. So the rule was a comment, in the
file, arguing that a rule in a file does not hold — and it went on not holding
for several releases with every gate green.

**What it cost, measured on the run that finally wrote the script.** Three more
sites, all invisible to a rendering suite and an accessibility suite that were
both passing:

- The first-run page and the About panel each opened by stating the count and
  then naming the items by hand, four sentences apart in two functions. Neither
  knew the table existed. Correct on screen every day so far.
- **A button's visible label asked the list and the announcement one line below
  it was typed.** The label was built from the helper; the spoken sentence said
  the old number. The half that went stale was the half only a screen-reader
  user ever receives, and it sat directly beneath the half that was right.
- A key describing a four-band lookup table was a second typed copy of it —
  the same words and the same thresholds written twice.

**And the first version of the gate flagged ninety lines, nearly all honest.**
"A mark belongs to one river." "Two surveys here." "One of the four subsections
amended." That is §108 arriving again: honest prose and a stale count are the
same SHAPE, so the shape cannot be what a gate matches. What worked was
matching the COINCIDENCE — flag a spelled number only where it equals the
current size of one of the app's own tables and sits next to that table's noun
or stands bare for the set, with the sizes read out of the arrays on every run.
A number that matches no table is talking about something else; a number that
matches is correct today and is exactly what goes stale tomorrow. Ninety became
three, and all three were worth reading.

**The generalisation, and it is the useful half.** A gate that asks "is this
sentence the kind of thing that goes stale" cannot be built, because every
honest sentence is that kind of thing. A gate that asks "does this number
currently agree with a thing that can move" can, and it fails at the moment the
thing moves rather than at the moment somebody writes prose. Prefer the second
question wherever a defect has the first question's shape.

**A second, looser copy of the same check was written into the rendering walk,
run, and removed.** It flagged every "all «number»" in one panel that was not
the guarded count and found twenty-two honest hits. Asking loosely, a second
time, what a source gate already asks precisely buys nothing and costs
twenty-two declarations — which is how an allow-list stops being read. What was
kept there is the half the source gate cannot see: that the RENDERED page
carries the count phrase and every item's name, with the expected strings
computed from the table in the page itself. A helper can be called and the
sentence around it can still name three of four things by hand.

**This is the same family as the branch guard and the stop guard.** In each,
something was written down, was correct, was read at the start of a session and
broken hours later — and the fix was never a better sentence. It was a refusal.
The distinguishing feature here is that the sentence which failed was itself
about sentences failing, which is as close to proof as this record gets.
