## 219 · A container's contract holds in the state you audited and is broken in the three you did not — and the audit passing is what stops anyone looking

**Enforced by:** GATE Cv-Thalweg:tools/a11y.mjs — the search results are audited
in the results state AND in the empty state, where the container holds a
sentence and a button rather than results. · GATE Cv-Thalweg:tools/render-test.mjs
— asserts the container's role is one whose contract its real children can
satisfy, and that no child claims a role the container no longer implies. ·
CHECKLIST audit-the-empty-state — every surface with results has at least three
states (results, none, working); the one with results is the one that passes,
so it is the least worth auditing alone. · CHECKLIST half-a-pattern — an ARIA
composite adopted for one of its parts is a claim about all of them; take the
whole pattern or take none of it. · JUDGEMENT — no gate can tell you which of a
surface's states you have not thought of.

**Smell:** `role="listbox"`, `role="tablist"`, `role="menu"`, `role="grid"` or
`role="tree"` on a container whose children are built by more than one branch of
code. An accessibility audit called once per surface rather than once per state.
An empty state, a loading state or an error state rendered into the same node as
the results. Also: a composite role adopted without the input side of the
pattern — a listbox with no combobox, no `aria-activedescendant`, no
`aria-expanded`.

A search box put its results in `<div role="listbox">` and each result in a
`<button role="option">`. That is the obvious markup and it read as careful.
A listbox may contain **options and nothing else**, and this container also
held, in its other states, the sentence explaining an empty answer and a button
offering to look the query up somewhere else.

**The audit ran and passed, twice, because it ran on the one state that could
not fail.** The results state contains results; every child is an option; the
contract holds. The empty state was never audited, and it is the state a reader
reaches by typing something the app does not have — which is most of the reason
the search exists at all. When the audit was finally pointed at it, axe called
it **critical** on the first run.

**And the rest of the pattern had never been there.** No `role="combobox"` on
the field, no `aria-activedescendant`, no `aria-expanded`. The role had been
taken for the part that described the shape and none of the part that makes the
shape work — so the markup was making a promise about keyboard behaviour that
nothing in the code kept. Plain buttons in a named group was what the surface
actually was, and the buttons were already reachable and already named: the fix
removed code.

**The general shape is not about ARIA.** Any container with a contract — a role,
a schema, a type, an invariant — is checked against whatever it happened to hold
when you looked. A surface that renders results, an empty answer, a working
message and an error into the same node has four populations and one test, and
the population you test is the one you were thinking about when you wrote it.

**What to do**

- Enumerate a surface's states before auditing it, and audit each. Results is
  the least informative of them; empty and error are where the odd children
  live.
- When you reach for a composite role, write down every part of the pattern it
  implies. If you will not implement all of them, use the plain elements — a
  button is already a control with a name, and it cannot break its own contract.
- Prefer a container role with no required children (`group`, `region`) for
  anything that renders more than one kind of child.
- Assert the role in a test, not only through the audit. An audit tells you a
  state is clean; a direct assertion tells you the contract cannot be
  re-adopted by the next person who thinks listbox looks tidier.
