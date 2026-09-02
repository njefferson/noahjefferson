## 120 · Five of a nine-step plan named things missing that were already built, and one named as built was destroying what it touched

**Enforced by:** CHECKLIST plan-against-code — before writing any plan step,
grep for the noun it is about and read what comes back. Every step says what
was FOUND, not only what will be built, and a step whose finding is "already
there" says so in the plan rather than being quietly dropped. · JUDGEMENT

**Smell:** a plan step phrased as *add X* where X is a noun the schema already
has. The schema is where the last person's intentions are recorded; a noun in it
with no route to it is the normal end state of good design and no time.

Phases 2 and 3 of an app's plan were written from its documents, its ADRs and
its stated intent — carefully, and by somebody who had read all three. Measured
against the code, step by step:

- **Step 1, *make goals creatable*.** Real, and it was one default and one
  picker. Everything downstream — the ancestor walk, the *serves ⟨goal⟩* line
  shipped two years of releases earlier, the unfed-goal reading, the quiet-area
  reading — was built and had never had data to run on.
- **Step 3, *a page listing them*.** The computation existed; only the surface
  was missing.
- **Step 4, *make bulk-filing accept any container kind*.** Already accepted it.
  What was actually missing was that the picker never said which KIND each place
  was — invisible while every place in the list was one kind.
- **Step 2 of phase 3, *what is due today*.** Computed and worded for exactly
  this purpose, rendering only inside an opt-in module about something else,
  third in a run-on sentence.
- **Phase 4's *a screen for a person showing both directions*.** Shipped two
  years of releases earlier, on the person's own detail sheet, with one of its
  two halves permanently empty because nothing could fill it. **Counted here
  because the count kept rising after this entry was written** — the tally was
  four when it landed and the next phase made it five, which is itself the
  finding: this is not a bad afternoon, it is what planning from documents does.

**And the one that ran the other way is the reason this is a lesson rather than
a curiosity.** Step 2 of phase 2, *give containers a review clock*, was
described as a missing route. The route existed and **destroyed the node it
acted on**: the repeat control converted every kind to the recurring kind, so
the picker shipped one release earlier made goals that the next control in the
same sheet silently unmade, under a label that said something else entirely.
Two sibling controls had the same defect. Three of the four sites in that app
that rewrite a node's kind were wrong.

**Why a careful plan gets this wrong, and it is not carelessness.** A schema
outlives the routes into it. Somebody adds a kind, an event, a computed reading
— and the surface that would reach it is a different day's work that never
came. **A noun in the schema with nothing pointing at it is the normal residue
of good design meeting finite time**, and it is invisible from the documents,
because the documents describe the design and the design is real.

**The corollary that cost the most.** A kind nothing could create had never been
handled wrongly by anything, because nothing had ever handed one to any control.
Every defect above was latent from the day the kind was added and could not have
been found by any test, walk or review — only by making one and then using the
ordinary controls on it. **Whenever a new kind, state or shape becomes reachable
for the first time, enumerate every control that writes to that dimension and
try each one.** Four sites; three were wrong.

**What this changes about writing a plan.** Reading the code first is not
diligence, it is the difference between a plan and a guess: it turned three
build-it steps into wire-it-up steps, one into a two-word copy change, and found
a shipped defect none of them had asked about. The reading was never the
expensive part.
