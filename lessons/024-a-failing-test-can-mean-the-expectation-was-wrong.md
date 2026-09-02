## 24. A failing test can mean the EXPECTATION was wrong

**Enforced by:** CHECKLIST test-may-be-wrong — before editing code to make a test pass, establish that the test was entitled to its expectation.

Writing tests for the above, a case called "a walking pace is obviously motion"
failed. The instinct is to go fix the code.

The code was right. Two GPS fixes of ±5 m accuracy taken 5 s apart resolve
speed to ±1.41 m/s, and a walking pace is 1.40 m/s — genuinely inside the noise.
The test asserted something the physics does not allow.

It was kept, inverted, as a test **of the limitation**, with the arithmetic in
the comment. That is more valuable than the test originally intended, because
the next person to think "surely it can see a walk" now gets an answer instead
of a hunch.

**Before changing code to make a test pass, check that the test was allowed to
ask for it.** A gate that gets weakened to match a wrong expectation is worse
than no gate — and the pressure to do exactly that is highest when the
expectation feels obvious.

*(fauxplane, 2026-08-02.)*
