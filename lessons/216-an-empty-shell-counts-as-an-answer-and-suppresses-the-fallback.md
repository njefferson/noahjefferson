## 216 · A failure that still returns a row counts as an answer, and the answer it suppresses is the one that would have worked

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — the search suite runs in
the OFFLINE browser, asserts a named place is found with no network at all, and
asserts separately that **every** entry in the index has a real position rather
than a coerced zero. · GATE Cv-Thalweg:tools/fetch-gauges.mjs — `--check` refuses
a build whose declared places are not baked, so the offline path cannot be empty
without something going red. · CHECKLIST empty-shell — wherever a fallback is
chosen by asking whether the primary source "has" a record, the test is whether
the record carries the FIELD being used, never whether the record exists. ·
JUDGEMENT — no gate can tell which of a placeholder's fields were meant.

**Smell:** `if (live[id]) return;` — a fallback skipped on the presence of a key
rather than the presence of a value. A guard written with the global `isFinite`
around a value that can be `null`. An error path that pushes a row so the UI has
something to render, read later by code that assumes a row means data. A feature
that works on every desktop run and is dark in the one condition the product
exists for.

An offline-first app grew a place search. The index was built from the live
readings, because that payload is where each gauge's name and position arrive.
So the search knew Freeport once the water level did — and on a riverbank with
no signal, knew nothing. The fix was to bake the names and positions into the
build, fetched once from the service, never transcribed.

**With the bake in place and the fallback written, the search still found
nothing, and both reasons were the same shape.**

- The failed fetch **still pushes a row per declared gauge** — id, `name:''`,
  `lat:null`, `lon:null`, `error:'request failed'` — so the panel can say which
  gauges did not answer. The index read that row's presence as "this one is
  live" and skipped the baked entry underneath it. *The error state suppressed
  the offline state.* Nothing about that is visible from a run with a network,
  where there is no error row and the fallback is never reached either.
- The guard meant to drop a positionless row was `isFinite(lat)`. **`isFinite(null)`
  is `true`** — `null` coerces to `0` — so the row was not dropped. Thirty-three
  unreachable gauges went into the index at 0°N 0°E, in the Gulf of Guinea, and
  were offered to the reader as places to go.

Either defect alone would have been survivable. Together they cancelled: the
fallback never ran, and the rows that replaced it were positioned at the origin,
so the search returned a small, plausible, entirely wrong list — and a fast
desktop check found the correct answer every time, because there the live data
had actually arrived.

**The generalisation is about the shape of a failure, not about `null`.** A
request that fails and returns nothing is easy to reason about. A request that
fails and returns a *shaped* result — the right number of records, the right
keys, empty values — is indistinguishable from success to every test written as
"did we get records back", and it is the shape most real code produces, because
an error row is how a panel says which thing did not answer.

**And the numeric half is its own trap.** `isFinite` and `isNaN` coerce; a
codebase that has a strict helper for exactly this reason still gets the loose
global written into new code, because the loose one is the name everybody knows.
The finding is not "use the helper" — it is that a finiteness check is a
TYPE check in disguise, and `null`, `''`, `false` and `[]` all pass it.

**What to do**

- Choose a fallback on the field you are about to read, not on the record.
  `if (row && isNum(row.lat) && isNum(row.lon))` — never `if (row)`.
- Test the degraded path in the degraded environment. An offline suite that
  loads the app offline and then asserts a *positive* result — a named place is
  found — is the only thing that could have caught this; asserting no errors
  would not have, because there were none.
- Assert the negative too, over the whole collection: nothing in this index sits
  at 0,0. A single coerced zero is a bug; thirty-three of them is a class.
- When a build bakes data so a feature works offline, gate the bake. A missing
  bake is not a smaller feature, it is the feature only working where it was
  never needed.
