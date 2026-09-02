## 16. A test harness that edits the working tree must refuse to run twice

**Enforced by:** CHECKLIST harness-lock — a harness that mutates the tree takes a pid lock and refuses a second run, and states plainly that the lock cannot stop a person editing mid-run.

`plant.mjs` injects a fault, runs the gate, and restores the file from a copy it
took first. Two runs overlapped. The second read a file the first had already
planted, kept THAT as its "original", and faithfully restored the planted fault
into the tree — leaving a genuinely broken page that every subsequent gate
passed, because the plant it came from had been retired. It surfaced days'
worth of confusion later as a single STALE plant.

**A pid lock, and refuse.** A harness whose entire contract is "the tree is
exactly as I found it" cannot honour that contract concurrently with itself.

**And the lock cannot stop a PERSON.** Mid-run the working tree genuinely
contains a planted fault, so a `git diff` looks alarming and a `git commit`
would ship the fault. This nearly happened twice in one session — the second
time while writing this very lesson. If a harness edits the tree, treat it like
a lock on the whole repository: do not read the diff, do not commit, wait.

The same run taught a second thing: **plant against the gate that can actually
see the fault.** Sensor-logic plants were being checked against a browser gate,
and a headless browser has no accelerometer — so every attitude in it is FAIL
whatever the code does, and the gate would have stayed green through any of
them. A plant that "passes" against a blind gate is worse than no plant: it is
a green tick recording that something was verified when nothing was.

*(fauxplane, 2026-08-02.)*
