## 215 · A hidden element answers a query exactly as well as a shown one, so a suite full of `querySelector` can pass against a blank screen

**Enforced by:** GATE `Cv-Thalweg:tools/render-test.mjs` — it walks whatever the
app's own tab list offers, presses each one, and asserts the panel is SHOWN, has
content, reports itself selected, and is the only one showing. · CHECKLIST
route-before-content — when a surface gains a way in (a tab, a route, a
disclosure), the first assertion written is that the way in reveals it; the
assertions about what is inside come second and prove nothing on their own. ·
CHECKLIST derive-the-second-list — two lists stating the same fact are a defect
waiting for the next addition; the second is derived from the first or the pair
is asserted equal. · JUDGEMENT — no gate can tell which of two arrays is the
authority.

**Smell:** a test file where every assertion about a surface starts
`document.querySelector('#panel-x …')`. Any `forEach` over a hardcoded array of
surface names living apart from the function that decides which surfaces exist.
An accessibility audit that "passes on the X panel" without anything having
established that the X panel is on screen. Also: adding a case to a `switch` or
a name to one array and feeling finished.

An app gained a tab. `tabNames()` decides which tabs EXIST; a hardcoded array
inside `selectTab` decided which panels get shown and hidden. The new name went
into the first and not the second, so pressing the tab hid the old panel, unhid
nothing, and left **a blank screen under a highlighted tab**. It was found by a
person on a device.

**Every suite was green, and that is the lesson rather than the typo.**

- The accessibility walk clicked the tab and then ran axe on the page. **A blank
  panel has no violations.**
- Every check about the new surface read it directly — `#panel-tide .tidephase`,
  `#panel-tide svg[role=img]`, the text content, the prose budget, the figure
  geometry. All of them passed. **`querySelector` does not care whether an
  element is displayed**, so each was measuring content that was correct,
  present, and invisible.
- Nothing anywhere asserted that pressing a tab SHOWS THE PANEL IT NAMES.

**So the suites were not weak; they were aimed one layer too deep.** They tested
what was inside the room and never that the door opened. That is a whole class
of failure a `querySelector`-shaped test cannot see, and it applies to every
route, tab, accordion, modal and conditional render in any app: **the assertion
that a thing is reachable is a different assertion from every fact about the
thing, and it has to be written separately.**

**Write the walk over the app's own list, not a copy of it.** The check that
fixes this is worth more if it iterates whatever the app currently offers, so it
covers the surfaces that exist and the ones nobody has built yet. A hardcoded
list in the test is the same defect the test was written for.

**And the fix to the code is to delete the second list.** Where two arrays state
the same fact, the next addition goes into one of them; deriving the second from
the first is the only version that cannot drift.
