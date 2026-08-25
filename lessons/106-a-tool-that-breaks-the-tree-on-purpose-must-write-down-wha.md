## 106 · A tool that breaks the tree on purpose must write down what it broke BEFORE it breaks it, because every in-process restore dies with the process

**Enforced by:** GATE quietkeep:tools/gate-audit.mjs — the plant's original bytes
go to a journal file on disk before the tree is touched, and the next run replays
whatever the last run did not clear. Every sibling repo that plants defects to
audit its gates owes the same.

A gate audit works by breaking the tree on purpose. Its restore lived in
`finally`, which covers a throw and covers nothing else.

**The run was killed mid-plant and `public/app.css` was left carrying
`--line: #F3F0E8`** — a near-invisible control boundary, in a stylesheet that
deploys. Planted by the tool whose entire job is proving that defects get caught,
and invisible to every gate that does not measure contrast; the gates that ran
afterwards passed over it without comment.

**A signal handler is the obvious fix and it is not sufficient**, for a reason
that is easy to miss: the runner uses `execSync`, which **blocks the event
loop**. A signal arriving while a gate is running is queued until that child
exits — so the handler fires minutes late, and never at all under SIGKILL, a
container stopping, or power going. Measured: a plant went live at 108s, SIGTERM
was sent, and the tree came back only when the in-flight browser walk finished.

So the record goes to DISK before the mutation, and recovery stops depending on
this process ever running again. **Two bugs in the first draft, and both were
found by simulating a dead run rather than by reading the code:**

- **`replayJournal` was written and never called.** The function existed, was
  correct, and nothing invoked it.
- **A new run overwrote the previous run's journal.** The first thing a run did
  with the file was WRITE it, which destroyed the only copy of the earlier
  plant's original — turning a recoverable state into an unrecoverable one.
  Replay must be the first thing that touches the journal, and planting over an
  unreplayed record must be refused rather than merged.

**Smell:** any tool whose correctness depends on it reaching its own cleanup —
audits, migrations, anything that checks out a branch to compare, anything that
swaps a config to test a fallback. Ask what the tree looks like if the process
stops between those two lines, and whether anything would notice.

**And the false accusation that came with it.** The same audit reported
`release:check` as "does not catch" its defect. It catches it fine: that gate
compares the shipped surface against the commit introducing the head triplet, and
when the triplet exists only in the working tree — **exactly the state a session
is in while preparing a release** — it correctly reports nothing to compare and
exits 0. The audit read a vacuous pass as a real one. **A gate that cannot be
exercised from the current tree is UNVERIFIED, never failing**, and it must say
which state would let it be checked. An audit that cries wolf gets discounted,
and the accusation lands on the gate instead of on the tree state that caused it.

**The argument list was closed here too, and for once the evidence was
immediate.** `--only=<gate>` was silently dropped by a filter that skipped
anything starting with a dash, so the flag selected nothing and all twenty-two
gates ran. A full audit is many minutes and drives a browser repeatedly, so
"this is taking a while" reads as normal — the output was misread in the same
session. LESSONS 103's tour tool learned this; the audit had not.
