## 189 · A qualifier written beside the answer appears only when there is an answer

**Enforced by:** JUDGEMENT — no gate can tell a qualifier that belongs to the
whole reply from one that belongs to a branch of it, because both render
correctly in the case the author was looking at. · CHECKLIST qualifier-is-a-prefix
— a sentence describing what was done to the QUESTION goes above every branch,
never inside one; a sentence describing the ANSWER goes with the answer. ·
CHECKLIST assert-the-qualifier-on-a-non-answer — the test that proves it is
there must drive an outcome that has no value in it, because the value path is
the one path where a misplaced qualifier looks right.

**Smell:** a caveat added while looking at the happy path. Also: a qualifier
written as its own `if` that returns, in a chain of outcomes — it does not join
the outcome, it replaces it. Also: a test suite that asserts a notice exists by
rendering the successful case only.

An app that reads depth from published surveys took a tap on the map as the
question. A finger is wide and a river is narrow, so a tap landing on the bank
was answered correctly and uselessly: nothing is surveyed on dry land. The fix
was to move the tap onto the water first — and moving somebody's question
without telling them is worse than refusing it, because they asked about one
place and would read the answer for another. So the displacement had to be said
every time.

**It was written twice and both were wrong in the same way, in opposite
directions.**

Spoken, it was written as its own branch at the top of a chain of outcomes and
returned early — so a tap moved onto unsurveyed water said only that it had
been moved, and the reason there was no reading was gone. The qualifier
*swallowed* the outcome.

On screen, it was written next to the number, where the author was looking when
they added it — so it appeared only when there was a number. A tap that was
moved and then found nothing rendered as the app failing at the spot the reader
picked, which is not the spot it looked at. The qualifier *deserted* the
outcome.

**The distinction that fixes both:** the displacement is a fact about the
QUESTION, established before anything was asked, so it is true of every answer
that could follow — including all the ones that are not answers. It is a
prefix. The survey's name and the distance to the nearest sounding are facts
about the ANSWER, so they belong with it and correctly vanish when there is none.

**Why it survives review.** Both versions were read, and both read fine, because
the case in front of the eye was the one where a value came back — and in that
case a prefix and a suffix are indistinguishable, and a swallowing branch never
fires. The suite had a test and it passed: it rendered a reading. Three tests
were added driving the outcomes that carry no value, and only those found it.
**A notice that must appear on every path has to be asserted on the paths that
have nothing else on them.**
