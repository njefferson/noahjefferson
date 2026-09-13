## 286 · A harness that hands in two objects where the product may hand in one cannot see the aliasing defect

**Enforced by:** CHECKLIST alias-the-way-the-product-can — when a function takes
two callables, feed it THE SAME ONE in at least one case, because somewhere a
wrapper returns its input unchanged and the two arguments become one object. ·
JUDGEMENT — a documented "the returned array may be reused" contract is a claim
every CALLER has to be checked against, not a note on the callee.

**Smell:** `const c = base(x, y);` … forty-nine calls to something else … `c[0]`.
Also any wrapper whose fast path is `if (strength <= 0) return sample;`.

**Infrared Photography Studio, 2026-09-12.** The sampler contract says in its own
words that the array it returns may be reused by the next call — it exists so a
21-megapixel export does not allocate sixty million short-lived triples. The
sharpening pass took the centre colour as that array and read it AFTER forty-nine
neighbourhood taps had run through the same machinery.

Harmless while `base` and `raw` are different objects with different scratch
arrays. They are not always: with noise reduction at zero the denoiser returns
its input sampler unchanged, so both arguments become the same function with the
same array, and the centre colour became whatever the last tap had sampled.

**Measured on a 1.3-megapixel crop of a real raw:** 933 pixels of 1,304,800 wrong
with sharpen up and denoise off, **95,577 (7.3%) once straightened**, worst by 50
of 255 — and ZERO with the noise reduction the app opens a photograph with. So it
was unreachable on a photograph exported as the app hands it over, and waiting
for anyone who turned one slider down and another up.

**How it was found, which is the transferable part.** A parity harness written to
prove an unrelated change bit-identical passed ONE sampler as both arguments,
because the product can. It then failed on all sixteen cases — including cases
that could not possibly differ, like a scan order with identical sample counts.
"Suspect the instrument first" is the right instinct and it was wrong here: the
instrument was reproducing an aliasing the product allows, and the product was
the thing that could not survive it.

**And one question at a time, or neither gets answered.** With two changes in the
tree the parity run could only say "different". Proving the intended change
needed a copy of the OLD implementation carrying ONLY the aliasing fix, so the
comparison isolated one variable. A run that reports "different" about two
changes has measured nothing.
