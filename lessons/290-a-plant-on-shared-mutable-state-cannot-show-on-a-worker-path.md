## 290 · A plant that depends on shared mutable state proves nothing on a path that copies its input, and reports the code as safe

**Enforced by:** CHECKLIST name-the-path-the-plant-runs-on — before trusting a
negative control over concurrency, establish from the product's OWN report which
path executed, and force the path where the defect could exist. · JUDGEMENT — a
plant that comes back green is a claim about the plant until the path is known.

**Smell:** a mutation-leak test on anything that may be handed to a worker, a
structured clone, a `postMessage`, or a copy-on-write layer. Two different
plants that both come back identical to the baseline.

**Measured 2026-09-14, Jefferson-Photography-Studio.**

An export was changed to snapshot the edit at the press so the reader could keep
working while it ran. The gate for it planted the LIVE parameter object in place
of the copy and expected the output bytes to change, with the reader moving to
another photo and dragging sliders mid-run.

The plant came back byte-identical. So did a second, cruder plant that passed the
wrong file entirely. Both looked like proof that the snapshot was unnecessary.

The app's own report said what had happened: **that export ran on three
threads.** Each worker is handed a structured COPY of the edit, so no mid-run
mutation can reach it, and neither plant could have shown anything. Healing a
spot makes the parallel path refuse the job; on one thread the same plant
produced a different file immediately.

**Two smaller things it took to get there.** The interference has to touch
something the work reads LATE — almost everything is folded in before the
per-pixel pass starts, and only one parameter here is read per pixel. And the
overlap has to be MEASURED rather than assumed: the check now records how far
through the run the interference landed (30% of a fifteen-second export), so a
future green cannot be a race that was quietly lost.
