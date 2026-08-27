## 165 · Lengthening a displayed string loosens every substring check that reads it

**Enforced by:** CHECKLIST anchor-substring-assertions — when a check asserts a
short token appears in rendered text, anchor it to the surrounding words rather
than to the token alone. · CHECKLIST grep-the-element-after-changing-its-copy —
after changing what an element says, grep the test and walk sources for that
element's selector and re-read every assertion against the NEW string.

**Smell:** any `includes(String(n))`, `contains("2")`, or bare-number regex over
text a person reads. Ask what else on that line could be that number after the
next copy change.

A walk check asserted that a warm-up link opened the right number of problems:

    check(progress.includes(String(WARMUP_PROBLEMS)), ...)

`WARMUP_PROBLEMS` is 2, and the line read `Problem 1 of 2`. Exact, and the only
2 on the line.

A later release added the step to the same line, so it read `Problem 1 of 2.
Step 1 of 6: Balance.` The check still passed — and would now pass on a warm-up
of ANY length whose step count happened to contain a 2, or whose step names did.
Nothing went red. Nothing could have: the assertion's population grew and its
predicate did not.

**A substring check is only as strong as the string it reads**, and the string
is not under the check's control. Adding words to a sentence is the most
ordinary edit there is — copy changes, a label gains a qualifier, a status line
gains a second clause — and every one of them silently widens the space of
things that satisfy every substring assertion over that text. The check does not
break, which is the whole problem; a break is information and this is not.

**Same family as §141**, where a check derived its population from the fix it
enforced. Here the population is derived from the copy, and the copy belongs to
whoever is writing product voice this week.

**The transferable form: anchor to the words, not to the value.**
`includes(\`Problem 1 of ${n}.\`)` cannot be satisfied by a step count. It costs
one more token in the literal and it is the difference between an assertion and
a coincidence. And when you change what an element SAYS, the edit is not
finished until you have grepped that element's selector across the test and walk
sources and re-read each assertion against the new sentence — the assertion that
needs re-reading is precisely the one that did not fail.
