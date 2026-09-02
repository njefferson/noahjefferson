## 181 · An observer that writes what another observer watches is a loop, and the loop presents as a timeout somewhere else

**Enforced by:** CHECKLIST guarded-write — any code that sets an attribute or
property from inside an observer, effect or subscription writes only when the
value would actually change (`if (el.hidden !== v) el.hidden = v`). ·
CHECKLIST observer-inventory — before adding a MutationObserver, grep for the
others on the same root and read what each one watches; two that overlap are a
cycle waiting for a trigger.

**Smell:** a browser walk that stops dead on an unrelated click, with no error
and no failing assertion. Also: any `MutationObserver` whose callback touches the
DOM inside its own observed subtree.

A small feature hid two stray controls when the reader moved to a different part
of the app, by observing one attribute on a container and setting `hidden` on two
elements inside it. Reasonable, small, and it made the app impossible to drive.

**The other observer had been there for releases.** A shell-level watcher
observed `hidden` on **any element under `main`, subtree included**, and repainted
a navigation surface for each change. So the new observer's every write fed it,
that repaint touched the DOM, and the page never went idle. Nothing errored.
Nothing asserted false. The walk simply stopped on the next click it tried,
because the automation waits for the page to be stable and the page never was.

**Which is why this is worth a lesson rather than a comment.** The failure
surfaced hundreds of lines and several sections away from the cause, as a twelve
second timeout on a disclosure summary that had worked for a year. Everything
about the symptom pointed at the wrong file. The only reason it was found was
noticing that the same run had passed thirty-nine checks and then advanced by
nothing at all for ten minutes — a *stall*, not a failure, and the two look
identical in a log.

**The fix is one line and the discipline is general.** Write only on change. It
costs a comparison, it removes a class of bug that cannot be reasoned about
locally, and it is the difference between "these two observers overlap" being a
design note and being an outage. The wider rule: in any system with more than one
reactive watcher over one tree, a write from inside a callback is an edge in a
graph nobody drew.
