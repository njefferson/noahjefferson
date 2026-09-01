## 202 · An incoherent fixture survives until the app starts DERIVING from it, and then it certifies the failure branch

**Enforced by:** JUDGEMENT — a fixture is only as coherent as the questions asked of it, and no gate can know which question comes next. · CHECKLIST fixture-invariants — when synthesising data with internal structure (turns of a tide, an ordered series, a hierarchy), assert the structure in the fixture itself rather than trusting the formula that generated it. · CHECKLIST refuse-then-check — a function that returns null on incoherent input needs a test that its null is reached by incoherence and NOT by the ordinary fixture, or a broken fixture reads as a pass.

**Smell:** a fixture whose labels and whose values come from two different
expressions. Also: a new derivation added over data a suite has used for
releases without anyone re-reading the fixture.

A tide fixture put its highs and lows on a six-hour grid and read each one's
height off a sine with a period of about 24.5 hours. Every value was finite,
every timestamp was ordered, the labels alternated high, low, high, low
correctly. It had been used for many releases.

It was not a tide. Because the grid and the curve disagreed, a row labelled
"high" could sit more than a foot BELOW the lows either side of it.

Nothing noticed, because for its whole life the app only LISTED the turns:
render them in order, show the clock time and the height, and every one of those
is correct about a fixture that is wrong. **A renderer cannot notice an
incoherent relationship between two rows it draws independently.**

The moment the app started deriving — working out whether the water is rising or
falling from the turn behind now and the turn ahead — the fixture became
load-bearing in a new way. And the derivation had a guard, written for real
data: if the two turns disagree about which is higher, that is a broken
prediction rather than a tide, so return nothing rather than draw an arrow from
it. The guard fired. On the fixture. Every time.

**So the new feature's tests would have passed while measuring the refusal
path**, and the app would have shipped with a rising-or-falling indicator that
had never once been seen to say "rising". The check that caught it was the one
asserting the direction was *right* for the fixture, not merely that the
function returned something.

**The general shape.** A fixture is not validated by being used. It is
validated by the specific questions asked of it, and every new derivation asks a
question nobody asked before. Two rules follow. Assert a fixture's own
invariants where it is built — a high is higher than the lows either side of it
— rather than trusting the expression that generated them. And when a function
refuses incoherent input, test the refusal with *deliberately* incoherent input
and test the ordinary path with the ordinary fixture, in the same run: a
refusal that fires on both is indistinguishable from a feature that works.
