## 461 · Plan mode refused a remote read, a git config read and a clock read with a time zone, and the refusal told the session to stop

**Enforced by:** GATE hub:session-guards.test.mjs — plan mode passes git ls-remote, a git config that reads one key or lists, and a clock read with an Area/City time zone set in front of date; git config with a value, an add, an unset or any other flag, a time zone in front of any other command and a zone with no slash are still refused; six plants each turn the case red

**Recorded 2026-11-02.** Measured on 31 October between 19:30 and 19:33 California time: a date command with a time zone set in front of it was refused as an unknown command, the refusal said to say so and stop, the session ended its turn, and a message had to be typed to ask what it was doing. Within minutes `git ls-remote` and a read of the git configuration were refused as not read-only, and the same facts were read another way each time. Lesson 370 had fixed three earlier reads; these were not among them.

**What is done now.** `plan-guard.mjs` lists `ls-remote` as a read, passes `git config` only when it reads (one key, or `--get`, `--get-all`, `--get-regexp`, `--list`, with the scope flags and no value) and strips a leading `TZ=Area/City` before the reader check when the command is `date`.

**What is not done.** The wording of a refusal that says to stop when the line is read-shaped and only needs rewriting is left as it is: it is the owner's hold and the choice to loosen it is the owner's (queued in the Found queue).

**The general form.** An allow-list of readers has to be extended each time a read is refused, and the refusal that lists the missing one is a defect report.
