## 378 · Every time given to the owner is California local time

**Enforced by:** GATE noahjefferson:report.mjs — `californiaTime()` converts every status stamp to America/Los_Angeles · JUDGEMENT

**Smell:** a time given to the owner off the container's UTC clock; a change that does more than the conversion asked for.

**Recorded 2026-10-02.** Statuses gave the owner times from the container's UTC clock after the owner had asked for California time, and `report.mjs` stamped the container's zone. The rule now sits in Doctrine §2 and `report.mjs` converts its stamp. The fix is the conversion and nothing else: an attempt that also changed the time format was taken back.
