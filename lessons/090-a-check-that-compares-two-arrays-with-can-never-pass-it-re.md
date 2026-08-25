## 90 · A check that compares two arrays with `===` can never pass — it reads as a real finding while being structurally incapable of going green

**Enforced by:** CHECKLIST — when a check's expected value is an array, an object,
or anything else compared by identity, convert it to a scalar the comparator can
actually match. A check whose PASS state is unreachable has never been seen green,
so nobody knows what green would even look like.

A walk added an "every control, pressed or accounted for" section: press each
control, and anything it could not reach must be named with the reason it could
not, so a control added later fails the build instead of sitting unpressed for a
year. The check was written as `is(unexplained, [], …)`, and the walk's `is`
compares with `===`.

Two arrays are never `===`. **The check was red on an empty list**, which is the
one result it exists to call green.

**It hid because it was busy being right.** The first three runs really did find
unreached controls, so every red was a genuine finding and every fix was a real
fix. The run where the list finally emptied printed

```
FAIL  every control this pass could not reach is accounted for: got [], expected []
```

— a failure whose got and expected are the same two characters. Only then was the
comparator visible at all.

**The general shape, and it is the one that matters:** a new check is normally
proven by watching it go RED on a plant, and this one was — three times, on real
findings. That is only half the proof. **A check must be seen green as well**, or
the pass state was never exercised and can be unreachable. Red-on-a-plant proves
the check detects; green-on-a-clean-tree proves the check can ever finish. This
repo has always demanded the first and had no rule about the second.

Cheap and general: make the failing value a joined string and the expectation the
empty string, then run both directions in five lines of `node -e` rather than a
six-minute walk.
