## 264 · A gate that greps for the words cannot tell an announcement from a confirmation, and its green says it can

**Enforced by:** GATE hub:pwa-check.mjs — its passing label now states what it
measured ("the words a reader needs exist in reader-visible source — a STRING")
rather than what a reader experiences. · CHECKLIST unprompted-surface — for any
requirement of the form "the reader is TOLD", the test has to reach the state
without touching the control that would tell them. A string test cannot.

**Smell:** a gate whose PASS label is written in the language of the doctrine
rule rather than the language of the check. Also: a requirement about something
happening UNPROMPTED, verified by a check that cannot distinguish prompted from
unprompted.

**Infrared Photography Studio, 2026-09-10.** Doctrine §7h.2 requires that when a
new version is waiting, the reader is told in a standing indicator. The gate
tests it with a regex for "new version", "update is ready" and neighbours over
reader-visible source, and reported `✓ the reader is told, in words, that a new
version is ready`.

The app had no standing indicator at all. Its only update surface was a button
in Settings, and the string the gate matched was
`"Checking for a new version…"` — status text that appears AFTER the reader
presses that button. A reader who never opened that panel was told nothing,
ever, on any release. The gate had been green on this check for the whole life
of the feature.

The gate's FAILING message on the same check was honest and said the right
thing — it names a standing indicator explicitly. Only the passing label
over-claimed. **A gate is read in the direction it passes far more often than in
the direction it fails**, and nobody opens the source of a check that is green.

**What could and could not be fixed.** A source scan genuinely cannot tell
whether a string is shown unprompted; that would take driving a real second
worker, which is what the app's own walk now does. So the check kept its scope
and lost its claim: the label says it found a string. That is a smaller green,
and a true one.

**The general rule.** Write a check's PASS label in the language of what it
MEASURED, never in the language of the rule it serves. The gap between those two
sentences is exactly the gap between the check and the requirement, and putting
the rule's words on the check's result hides it — from everyone, permanently,
because green is where reading stops.
