## 152 · A check's sentence and its predicate are two different things, and only one of them runs

**Enforced by:** CHECKLIST what-would-make-this-red — for any assertion carrying
a LITERAL, name the change that would make it fail. If the honest answer is
"nothing anyone would ever do", the literal is not testing the sentence above
it. · JUDGEMENT — no gate can read intent; this is a reading habit.

**Smell:** an assertion whose message describes a relationship and whose
predicate is a constant. `check(text.includes('0.1.0'), 'the notes name the
release that is running')`. The message is a claim about *now*; the predicate is
a claim about *a string*. They agreed once, and nothing keeps them agreeing.

MoleBridge's journey walk asserted that the ⓘ panel's patch notes name the
release the app is running, and tested it by looking for the literal `0.1.0` —
the OLDEST release in the file. It passed for thirty consecutive releases,
because the panel rendered every release ever shipped, so the literal was always
present. It had never once been asked the question its own sentence claims.

**An incidental truth held it up, and the fix that removed the incidental truth
is what exposed it.** The list was capped at the newest five for an unrelated
reason — a dialog whose way out sat under thirty releases of prose — and the
check went red immediately. Nothing was looking for this and nothing could have
been: the check was green, its message was accurate prose, and only its
predicate was wrong.

**The general form is a check that is true for a reason other than the one it
states.** The same shape as a coverage list that is complete because nobody has
added a surface yet, and as an invariant that holds because two independent
things happen to coincide. What makes it worse than an absent check is that the
sentence is in the log, in the reviewer's eye, and in the next session's mental
model of what is covered.

**The habit that catches it:** read the predicate without reading the message,
say out loud what it actually asserts, then compare. Where the two differ,
believe the predicate. And prefer deriving the literal from the same source the
app derives it from — `RELEASES[0].version` rather than a version typed in —
because a derived value cannot drift into being accidentally true.
