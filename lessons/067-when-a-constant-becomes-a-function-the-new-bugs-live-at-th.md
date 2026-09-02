## 67 · When a constant becomes a function, the new bugs live at the EDGES of its domain — never where the motivating story lives

**Enforced by:** CHECKLIST domain-edges — when a hard-coded value becomes computed from an input, list the extremes of that input's real domain BY NAME and assert against the code that will actually consume the result, not against a restatement of its rule. "It works for the case that prompted the change" is not evidence about the change.

fauxplane spent its whole life asking three weather feeds about one fixed
rectangle. The prompt to fix it was ordinary: family in other states would open
the app and conclude it was broken, and they would be right — "Over your area"
was sorting hazards by whether they were over the one region.

So a constant became `queryBox(centre, halfWidthNm)`. The motivating case was
Denver. Denver worked immediately, on the first run, exactly as home did.

**Two defects shipped in the same function, and neither is anywhere near
Denver.**

- **A degree of longitude shrinks toward the poles.** At 82°N a 100-nm-wide box
  spans more than the twelve degrees the server accepts. Clamping to exactly
  twelve produced `12.000000000000007` — refused.
- **`bboxAround` does not wrap.** Near the antimeridian the box ran past ±180,
  which the same validator rejects outright.

**The failure mode is the reason this matters.** A refused bounding box is an
HTTP 400. The provider's terms count a 400 toward a temporary IP restriction,
and the address is shared with every other tenant on the platform. So the
symptom is not an error message — it is a feed that quietly stops answering,
somewhere the author does not live, charged to everybody.

**What found them was the list of PLACES, written out by name:** Suva and the
Chatham Islands either side of the dateline, Tromsø, Longyearbyen, Alert,
McMurdo, the South Pole. Nobody in the motivating story lives at 82°N. The list
was written because the change had a *domain* — every latitude and longitude on
earth — and the story only had a *point in it*.

**And each place was checked by importing the real validator rather than
restating it.** That is the cheaper half of the discipline and the easier one to
skip: the assertion becomes "the thing that will consume this accepts it",
which stays true when the rule changes and cannot drift from it. A copy of a
rule in a test is a second implementation with nothing holding the two together
— hub §51's argument about forked gates, one layer down.

**The general shape: replacing a constant with a computation converts a value
into a domain, and the tests almost never follow.** A constant has one case and
it is already known good. A function has an input space, and the parts of it
that break are exactly the parts nobody pictured while writing the reason for
the change. Ask what the input can be, not what it will usually be.
