## 291 · A page that counts its own repository is wrong on the commit that writes the count, and correcting it makes it wrong again

**Enforced by:** JUDGEMENT — a published record may state what is waiting, and
may state a version or a commit that does not move when the page does; it may
not state a quantity the act of publishing changes.

**Smell:** "N commits ahead", "N items outstanding", "last updated N minutes
ago" written into a file that lives in the thing being counted.

**Measured 2026-09-14, Jefferson-Photography-Studio.**

A status page said how many commits were waiting for an on-device pass. Writing
the number was itself a commit, so the page shipped wrong; the commit that
corrected it made it wrong by one again in the same way.

It says what is waiting now, named rather than counted, and the counts that do
belong on it are ones the page does not move: the version on staging, the
version in production, and the identifier of the last commit verified green —
which is always the one BEFORE the commit carrying the page, because a page
cannot name the commit that writes it.
