## 178 · A failure that names a number instead of a cause sends the next attempt guessing, and a swallowed timeout inside a retry loop spins in silence

**Enforced by:** CHECKLIST name-the-blocker — when a driving step in a browser
walk cannot reach an element, the failure must say WHY: walk the ancestor chain
and name the first one that is `hidden`, `display:none`, `visibility:hidden` or a
closed `<details>`, plus whatever mode the app is in. · CHECKLIST
no-swallowed-timeout — never `.catch(() => {})` a click inside a retry loop; use
a short explicit timeout, capture the boolean, and act on it. · CHECKLIST
state-precondition — before driving a new state, write down what the app requires
for that state to exist at all, and assert each precondition separately.

**Smell:** a walk step that reports a count ("7 card(s)") and nothing else. Also:
any retry loop whose failure mode is indistinguishable from its success mode
having produced nothing.

A new surface needed a driven state in an accessibility walk. It took **eight
four-minute runs**, and every one of the four obstacles was invisible in the
failure text.

**It reported a number.** "A second item is reachable (7 card(s))" — seven
elements matched and none was visible, which reads as a race and is not one. Two
runs were spent guessing at causes. The third added ten lines that walk the
ancestor chain and name the first thing hiding the element; it answered
immediately, and answered differently each time as each layer came off.

**Then the layers.** The cards lived inside a closed `<details>` disclosure. The
helper that leaves a job lands on the app's hub, and the hub IS the screen — a
CSS rule sets `display:none` on every section when no job is active, so opening
the disclosure changed nothing. Neither is a bug; both are the app working, and
neither is deducible from "7 card(s)".

**Then the silence.** The retry loop wrapped its click in `.catch(() => {})`
against a twelve-second default timeout. Six iterations spent seventy-two
seconds waiting on an invisible element and reported the same sentence it would
have reported for a state that genuinely had one item. **A swallowed timeout
inside a retry loop is an absence that looks exactly like a presence** — the
shape this register already names about missing CI runs and stale receipts,
arriving in a third costume.

**And then the precondition nobody had written down.** The state needed two
items under a passed date. Dating card after card produced nothing, because in
that app an unsorted capture is not eligible for the surface at all — the
eligibility predicate excludes anything still in triage, along with containers
and recurring work. The walk had to *route* something first. That fact was in
the source, one function away from the code being tested, and no amount of
driving would ever have found it.

**The general rule: a driven state has preconditions, and they are a list.**
Write them down before driving — what must exist, what mode the app must be in,
what must not be open — and assert each one separately, so a failure names the
missing one instead of the last symptom. A single boolean at the end of a chain
of four requirements can only ever say *no*.

**The cost is why this is here.** Eight runs of somebody's compute for a state
that took ten minutes to build, and the first three of those runs bought nothing
because the check could not say what was wrong. The diagnostic that fixed it is
smaller than this lesson.
