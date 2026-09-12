## 278 · A cache keyed on the input identity replays the old code's answer after you fix the code, and reports it as progress

**Enforced by:** CHECKLIST cache-key-carries-the-code — every memo, cache or
resume store whose value is COMPUTED must key on a version of the computing code
as well as on the input. Prefer an identifier that moves by construction (the
build version) over a hand-kept number, and sweep foreign rows on read rather
than leaving them to expire. · JUDGEMENT — the danger is proportional to how
reassuring the cache's own progress message is.

**Smell:** a cache key built from a filename, a size, a hash of the INPUT, or a
URL — with nothing in it about the code that turned that input into the stored
value. Also: a resume message that says "already done" while you are testing a
fix.

**Infrared Photography Studio, 2026-09-12.** A lens rig measures up to ninety
raw frames, minutes of decoding, and keeps each measured frame so that an iPad
sleeping mid-run does not throw the work away. The key was the file's name and
byte length. Rows lived a fortnight.

A cached row is the OUTPUT of the decoder and the profiler. Both were fixed in
the same week — one to read Nikon raws as raw rather than as their embedded
previews, one to stop returning no estimate for the innermost and outermost
rings. Re-measuring the same files would have returned the answers from before
both fixes, every frame served from the cache, with the rig reporting them as
"already done from an earlier run".

**That message is the whole problem.** A stale cache that errors is a bug you
fix in a minute. A stale cache that says "already done" is a bug that ends the
investigation: the numbers come back unchanged, the fix appears not to have
worked, and the next hour goes into the code that was already correct. The
person re-measuring was about to do exactly that on a tablet, with no way to see
inside the store.

**The key carries the build version now**, which moves on every release by
construction. A hand-kept "measuring code version" was the obvious alternative
and is worse: it is a number somebody has to remember to bump, and the moment it
matters most is the moment attention is on the algorithm. The cost of the build
version is that a release ends a run in progress — and the moment this cache
exists to survive is a sleep in the middle of measuring, which is minutes, not
releases. **Match the invalidation to what the cache is actually for, then take
the widest key that is automatic.**

**And a dead export is a check nobody ran.** The store's `clearMeasured` was
exported and called by nothing. Sweeping foreign rows on read gave it a caller
and made the version change actually tidy up, instead of leaving a fortnight of
answers from a build that no longer exists.
