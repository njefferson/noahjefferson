## 379 · Do what the owner asked, and nothing more

**Enforced by:** GATE noahjefferson:plan-guard.mjs — a plan needs an `## Asked` section in the session's own words, sharing no run of eight words with an owner message · GATE noahjefferson:plan-scope-check.mjs — prints the owner's messages for the watcher to judge the diff against, and `--record` refuses a verdict or finding that copies them · JUDGEMENT

**Smell:** a change that does more than the request: a second thing changed beside the one asked for, a rule written wider than it was stated, a scope made by pasting an owner message into a file.

**Recorded 2026-10-02.** Asked for a time-zone conversion, a session also changed the time format and widened the doctrine text past the request; both were taken back. The plan written to put the rule in place then carried the owner's messages verbatim as its scope, which breaks §9b on its own. The rule is Doctrine §0f. Neither gate can tell an asked-for step from one shaped like it; the watcher reads the owner's messages against the diff, and the gates make sure those messages are in front of it and never land in a file.
