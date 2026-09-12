## 277 · Two mechanisms each correct on its own can compose into a silent no-op, and neither one's tests can see it

**Enforced by:** CHECKLIST preference-reachability — whenever code PREFERS one
class of input over another, assert that the preferred class can actually reach
the preference AND survive everything downstream of it. A preference that has
never once fired is indistinguishable from a preference that does not exist. ·
JUDGEMENT — the composition is where this lives; unit tests of either half pass.

**Smell:** a branch with a well-written comment explaining why it prefers
something, and no test that reaches it. Also: a data field that records which
branch ran, whose every stored value names the branch you did not want.

**Infrared Photography Studio, 2026-09-12.** A lens rig prefers a raw frame over
a camera JPEG and sets the JPEGs aside, with a paragraph explaining that an
8-bit frame carries a systematic quantisation bias rather than noise. Correct,
and it had never run: a decode fault meant no frame ever arrived as raw, because
Nikon raws and DNGs share a TIFF magic number and only the FILENAME tells them
apart, so every raw fell through to its embedded JPEG preview.

The decode fault was then fixed. The preference still produced nothing useful,
because a separate floor — see §276 — meant a raw frame could measure no colour
at all. So the composition was: prefer the frames that cannot measure colour,
set aside the ones that can. A group with raw frames in it stored a flat 1 for
colour; a group without them stored colour from the wrong colour space.

**What made it invisible is that both halves have honest failure modes that look
like the ordinary case.** A profile carrying flat 1s reads as "this lens casts no
colour", which is a thing a lens can do. A profile measured from a JPEG reads as
a profile. Nothing was NaN, nothing was refused, nothing was logged.

**What found it was a census, not a test.** One script over every profile file on
disk, printing how many profiles carried a non-trivial colour curve and what each
recorded as its source: 30 shipped and 130 measured, **all 160 saying
`source: "rendered"`**. The field that records which branch ran had been written
into every file for weeks, and no test asserted anything about it, and no human
had read it.

**The general form.** When you add a preference, add the assertion that the
preferred thing gets all the way through — not that the branch is taken. And when
a struct records which path produced it, assert on the distribution of that
field across real stored data, because that is the one place a never-taken branch
becomes countable.
