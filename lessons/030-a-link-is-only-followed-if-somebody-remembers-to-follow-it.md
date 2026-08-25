## 30 · A link is only followed if somebody remembers to follow it

**Enforced by:** GATE hub:doctrine-sync.mjs — each sibling records the hub commit it last reconciled with; the script reports what has landed since, down to which DOCTRINE.md sections, and exits non-zero on unreconciled drift.

The sibling repos LINK to this hub's `DOCTRINE.md` and `LESSONS.md` rather than
forking them. That is the right design — one canonical copy, no divergence — and
it has exactly one failure mode: nobody re-checks the link once it is written.

In a single afternoon this repo gained §7d, §7e and §7f, four new shared gates,
`SECURITY.md`, and two lessons. A session working in a sibling reads that
repo's `CLAUDE.md`, which points back to this hub as canonical — and reading a
link is a thing you either remember or do not. **Every argument in this file
about prose losing to whoever is in a hurry applies to the doctrine itself.**

Measured, on the session that built the check: it reported that
intersecting-parallels was 40-odd commits behind and named `SECURITY.md` among
the changes. That file listed the repo under "not in reach this session" — so
its security baseline had never once been run against it. Running it found four
`artipacked` findings: every workflow left a git credential in `.git/config` on
the runner, including the deploy job holding a live Cloudflare token. **Twenty
releases had shipped through four green workflows over that credential.** Nothing
was wrong with the code; nobody had pointed the audit at it.

**Why it names sections rather than files.** "DOCTRINE.md changed" is not
actionable — it sends someone to skim 900 lines and conclude nothing applies.
"§7e and §15 changed" sends them to two paragraphs. The script maps every touched
line to the nearest heading above it, which is cheap and turns a notification
into an instruction.

**Why it is not a CI gate.** A sibling's build going red because the hub moved
teaches everyone to ignore red, and CI cannot tell a *session* what it has not
read. The failure happens at the start of a session, so that is where the check
belongs. `--adopt` is an assertion the drift was read, exactly like
handoff-check's `--ack`: a session can make it falsely, but it can no longer skip
it without noticing.

**The general shape: any "remember to check X elsewhere" instruction is a defect
report against your tooling.** If X is machine-readable and the staleness is
detectable, detect it.

*(the hub and Intersecting Parallels, 2026-08-03, at the owner's instruction.)*

---
