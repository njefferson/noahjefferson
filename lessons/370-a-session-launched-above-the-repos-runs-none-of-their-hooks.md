## 370 · A session launched above the repos runs none of their hooks, and every rule then rests on memory

**Enforced by:** CHECKLIST — `HANDOFF.md` carries the approved gates (a user-level dispatcher, a five-minute report clock, talk-first and plan-names in `plan-guard.mjs`, a Drive guard, a third `stop-guard.mjs` shape, a post-compaction tool list). Until the dispatcher is built and the setup script installs it, check a new session's first Stop record: it must list more than the environment's git check.

**Smell:** the owner repeating a rule that a gate in this family already refuses. The gate is not failing; it is not running.

**Measured 2026-09-28.** A cloud session attached to two repos was launched in their parent directory, which has no `.claude/settings.json`. Claude Code loads project hooks only from the launch directory. The transcript held 543 Stop events and every one ran exactly one hook, the environment's own git check; `stop-guard` ran zero times, and so did `plan-guard`, `ident-guard`, `harness-guard`, the ledger and the session brief. The hub's CLAUDE.md had already recorded this for `branch-guard` alone.

**What ran in its place was memory, and memory failed on every rule it carried.** The same session proposed a plan with none of the five sections `plan-guard` requires. It worked for long stretches with no status. It asked questions the record already ranked. It searched the owner's whole Drive. It proposed an infrared white-balance test that moved only two of three gains. It told the owner a real field was invented, from a search of five files that left out the one holding it. And it told the owner a private folder could not be read, without trying the connector download it had, which worked first time.

**Two findings for whoever builds the gates.** A session's text between tool calls is in the transcript for only some messages (2,253 of 7,400 measured), so a gate cannot read chat to see whether the owner was told; it needs its own stamp. And a compaction summary can drop a capability in use, so the tool list must be re-printed after every compaction rather than trusted to the summary.
