## 209 · A panel that explains a picture squeezed the picture to nothing, and the symptom was a test that looked broken

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — after holding a traced
point and re-rendering, the drawing's wrapper still has height AND
`elementFromPoint` at the centre of its hit area still returns the hit area. ·
CHECKLIST second-interaction — any gesture that CHANGES THE PAGE is asserted a
second time, after the change it caused; the first one passing proves only that
it works on a page nothing has happened to yet. · CHECKLIST no-min-height-zero
— a flex child that IS the content, with commentary as a sibling in a
fixed-height box, gets a floor; `min-height:0` on it lets the commentary win. ·
JUDGEMENT — no gate can guess which child of a flex container is the point of
it.

**Smell:** `flex:1 1 auto; min-height:0` on the element that the section exists
to show, with siblings that grow on interaction. A container with a fixed
height (`height:230px`, `height:44dvh`) whose children include a panel that
appears only after the user does something. A drawing sized once, in
JavaScript, from a container that can later resize. Also, and this is the one
that costs the time: **a manual check that passes on a fresh page and fails
when the same steps are repeated in one page.**

A section carried a drawing, a note, and a panel that appears when the reader
holds a point on the drawing. The section had a fixed height. The drawing's
wrapper was `flex:1 1 auto; min-height:0`; the panel, once filled, was 154 px
of paragraphs and buttons. **The flexbox did exactly what it was told and took
the drawing to zero** — while the SVG, whose geometry had been computed in
JavaScript from the wrapper's old height, went on painting at its old size
outside its own container, with the panel drawn over it.

So the gesture worked ONCE. The second drag landed on a paragraph and did
nothing at all: no line, no readout, no mark on the map, and nothing in the
console. Every released version carrying that panel had it.

**THE MEASUREMENT THAT SETTLED IT, after two wrong hypotheses.** Before a
trace: wrapper 87 px, and `elementFromPoint` at the centre of the hit area
returned the hit area. After one: wrapper **0**, hit area 122 px tall, and the
same point returned `<p class="note">`. Everything before that measurement was
guessing — a pointer capture stranded on a discarded node was the first theory,
plausible, wrong, and its fix was kept because it is right anyway.

**Most of the hour went on believing the test.** On a fresh page every case
passed; only the second interaction in one page failed, which is the signature
of a bad harness and is why it was disbelieved. It is equally the signature of
a defect that only appears once the page has been used — **and a product is
used, not freshly loaded, for all but the first few seconds of its life.**

**Two rules come out of it.**

**A picture can have a height and be unreachable, so assert what is ON TOP.**
Height, visibility and even a correct bounding box all survive this defect
intact. What does not survive is hit testing, which is the same instrument this
family of repos already uses for touch targets and for a skip link that was
present in the source and reachable by nobody.

**And assert the SECOND interaction, not the first.** A gesture that changes
the page has to be tried again after the change it caused. The first one is a
test of a page in a state no reader will be in for long.
