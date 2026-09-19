## 328 · A visual app is judged by LOOKING; a number says where to look and never what was seen

**Enforced by:** GATE Jefferson-Photography-Studio:tools/decisions-check.mjs
— a decision record that names frame identifiers must carry a `## Looked at`
section, and every frame named anywhere in the record must appear in it, both
directions.

**The owner's instruction, 2026-09-19, in those words: this is a VISUAL APP,
not a MATH APP. Store it as a lesson and gate decision outcomes by it.**

## What it cost

A look's two amounts were being chosen. The session rendered **seven**
comparison sheets through the app's own pipeline, sent **five** of them, and
then wrote **four rounds** of analysis about how the photographs look — a
recommendation with a named value, an "exchange rate" of colour gained per unit
of noise added, a paragraph on what each candidate costs — having opened
**none** of the images. Every appearance claim was inferred from saturation
figures and from a chroma residual pooled into blocks.

Opening all seven took one pass. The numbers had not lied. Almost everything
concluded from them was wrong or beside the point, and two defects that were
shipping sat in plain sight in frames that had each been summarised in one line.

- **A grey asphalt parking lot covered in red speckle**, in every arm, in a
  frame whose numbers read "foliage 0.69, colourless 51%" and were reported as
  "overcast, the gate holds it grey". The decision record whose entire stated
  purpose is *nothing colourless touched* was measured green against its own
  guard while this shipped.
- **A foliage amount shipped from a range read as uniform.** "0.59 to 0.82
  against the film's 0.60" was reported as fine end to end. At 0.59 it looks
  right; at 0.82 the tree is a flat mass with its internal structure gone.
- **A frame with no sky in it, carried in a seven-frame SKY corpus.** Its 0.10
  was reported as "hazy sky staying grey" for days. It is a macro of a flower
  spike; those are grey stems. The sky conclusions rested on six frames, and
  nobody could know that without looking.
- **The measurement the recommendation rested on was invisible.** The exchange
  rate came from corner residual. On the frame where that residual was most
  dramatic — 6.8x corner against centre — the four panels are
  indistinguishable by eye. The number moved; nothing a reader could see did.
- **The defect that IS visible was never named**: contour banding across the
  whole sky, plainly present at the shipped value, described for two rounds as
  "corner blotch" because that was the shape of the available statistic.
- And the session told the owner the sheets read **left to right** when they
  are a **2x2 grid** — wrong directions for reading their own comparison,
  which is only possible if you have not seen it.

## The rule

**In an app whose output is a photograph, a number is a POINTER TO WHERE TO
LOOK. It is never a substitute for looking, and it is never evidence about
appearance.** A rendered sheet that has not been opened as an image is not
evidence, whatever statistics were taken off it.

Three specific traps, each of which fired here.

- **A residual that moves is not a defect that shows.** A statistic can rise
  monotonically with a parameter and describe something no eye can find. Before
  a number is allowed into a recommendation, the picture it claims to describe
  is opened and the difference is confirmed as visible.
- **A statistic has a shape, and the defect will be described in that shape.**
  The available instrument measured local residual, so the report was about
  corners — while the visible artefact was frame-wide banding. The instrument
  chose the vocabulary and the vocabulary chose the diagnosis.
- **One line per frame is where a corpus rots.** Seven frames each summarised
  by one statistic produce a tidy list in which a macro shot of a flower passes
  as a hazy sky and a speckled car park passes as an overcast one.

## Why it needed a gate and not a paragraph

The sibling repo already carried **A LOOK CHOICE IS SHOWN, NEVER DESCRIBED** —
render the candidates and send the pictures, never substitute adjectives. That
rule was followed to the letter: the candidates were rendered and the pictures
were sent. It says how to present a choice to the owner. **It never said the
session must open what it rendered before reasoning about it**, and a rule that
is obeyed while the failure happens inside it is a rule that needed a mechanism.

The mechanism is mechanical on purpose, because no parser can tell looking from
claiming to have looked. What a parser CAN do is compare two lists: a decision
record that names frame identifiers must carry a `## Looked at` section, and
**every frame named anywhere in the record must appear in it.** Measure seven,
look at two, report on seven — refused. Both directions, like every other
declared list in this family, so the section cannot be padded with frames the
record does not otherwise discuss.

## Neighbours

The same family, with the looking step present and the instrument wrong:
**§319** (every instrument built after a diagnosis measures the diagnosis),
**§320** (a statistic that cannot see a clustered defect reports it absent),
**§322** (a fix that leaves the instrument's reading unchanged has not touched
the cause), **§325** (a window fitted to a rendering measures that rendering),
**§326** (operate the app as a photographer and look at the photograph). This
one is the same failure with the looking skipped entirely, which is why it is
the one that got the gate.
