## 313 · Look it up BEFORE you start, not after four rounds fail — a measurement of your own output cannot tell you what the output should be

**Enforced by:** CHECKLIST `look-before-each-new-thing` — before beginning a new
piece of work, run one search, read one spec, or find one reference
implementation. The trigger is *a new piece of work is starting*, not *the work
is going badly*. Doctrine §11e. · CHECKLIST `write-the-source-down` — what is
found goes into the repo's research file with the source named, so the next
session does not pay for it twice.

**Smell:** a question about a real-world medium, process, format or piece of
equipment — film, filters, optics, colour science, a file format, a protocol —
being answered by tuning parameters and re-measuring the result. Round two of
that loop. A comparison sheet made entirely of your own renders. The sentence
"let me try a lower value and see". Any derivation that feels like progress and
produces a number nobody outside the session could check. And the strongest
tell: the thing being emulated EXISTS and nobody has looked at it.

**Measured 2026-09-16, Jefferson-Photography-Studio, twice in one day.**

**The first.** Four rounds went into why the app's Aerochrome emulation would
not go deep red: hue and saturation measured on rendered frames, colour bands
tuned, a candidate sheet built and compared. Every round was a measurement of
the app's own output. The owner said early on that a DIFFERENT look in the same
app looked more like the film than the one named after it — and that report was
correct, and it went unresolved through all four rounds because there was
nothing to check it against.

One PDF of one article ended it. Measured off two photographs of the actual
film: foliage at **6.2°** on the hue wheel and sky at **204.0°**, 197.8° apart.
What the app shipped that same evening: foliage **325°**, sky **167°** — about
**40° out in both**, and on the magenta side of red where the film is scarlet.
The look the owner had flagged measured 353° and 180°, closer to the film than
the one carrying its name. **Every number needed to see this was one search
away, and every number actually gathered was internal.**

**The second, the same day, and this is the one that makes it a cadence rule.**
With the colour solved, the next defect was bright foliage washing out to white
— 28–45% of the frame carrying no colour at all, against 13.8% on the film. A
solver was about to be written. One search named it instead: applying a tone
curve INDEPENDENTLY PER CHANNEL desaturates highlights toward white, it is the
standard approach in most raw software, the alternative (compress luminance
only) keeps the colour and clamps harshly, and the blend between the two is a
parameter colour pipelines already expose. The app's own pipeline does the
per-channel form, three lines, exactly as described. **Nothing needed deriving,
and the second search happened only because the owner said to make it a habit.**

**Why the principle was not enough.** "Mine the references first" had been a
standing rule in that repository since 2026-07-25 and was restated on the
morning of 2026-09-16. Both times it was agreed with and both times it was
skipped, because at the moment work starts the next step always looks obvious
enough not to need checking — the doubt that would send you looking arrives
later, after the obvious step has failed. A principle fires on doubt. **A
cadence fires on a trigger**, and the trigger is that new work is beginning.

**The general form.** A measurement of your own output cannot tell you what the
output should be. Every reading is real, the instrument is sound, and it is
pointed inward — so the loop can run indefinitely, producing genuine numbers and
converging on nothing, and from inside it is indistinguishable from progress.

**Measured again 2026-09-25, same repository, twice, with this lesson and the
cadence rule both in force.** A light halo beside every building and pylon
under the Aerochrome look was traced to its cause — the look's hidden sky
selection fading in over about 200 px beside an edge — and six variants of
that selection were then built and rendered, one after another, before a
single search on how established editors keep an adjustment through a soft
sky mask from haloing at an edge. The same day the look was tuned toward the
film's numbers by a coordinate search and by hand-set bands, and only
afterwards did a search find published Aerochrome LUTs, one of them free
under CC BY-SA, and the practitioners' recipes around them.

**WHY THE TRIGGER DID NOT FIRE, which is the part worth keeping.** The cadence
says the trigger is new work beginning, and none of it registered as new. Each
variant was a small change to the one before, so it felt like continuing, not
starting — and the checklist only fires at a start. The tuning felt like
finishing a measurement already begun. **So the trigger is wider than a new
item: it is also the first variant of any fix, and any candidate built to be
compared against another.** Building a second candidate is the moment to ask
whether the field already has the answer, because two candidates means the
answer is not known.

**What stopped it both times was being told to look, not the lesson.** A
paragraph in a file has now failed four times on this rule in one repository.
The order that held on 2026-09-25 was structural: research dispatched first,
written into the repository's research file with sources, and nothing built
until it was read.
