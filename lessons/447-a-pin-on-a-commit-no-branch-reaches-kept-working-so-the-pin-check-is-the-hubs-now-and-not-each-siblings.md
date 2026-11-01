## 447 · A pin on a commit no branch reaches kept working, so the pin check is the hub's now and not each sibling's

**Enforced by:** GATE hub:hub-pin-check.mjs — `node hub-pin-check.mjs --repo <path>` reads every workflow under the repository's `.github/workflows` for a `uses:` line naming this hub and refuses a pin that is not a full forty-character commit, a commit the hub does not have, and a commit the hub's `main` does not reach by `git merge-base --is-ancestor`; it refuses a `.doctrine-sync` marker naming a commit the hub does not have; it skips with a printed line where no hub checkout is found at `--hub`, beside the repository or at `/root/.claude/hub`

**Recorded 2026-11-01.** Measured on 31 October with a scratch harness of eighteen cases. A pin of forty characters that no repository holds exits 1, a commit that exists in the hub and on no branch exits 1, a branch name used as a pin exits 1, and a marker the hub lacks exits 1. The reason is lesson 334: after a history rewrite GitHub goes on serving the old commits, so a pin on one checks out and runs green out of a frozen tree and no failure ever points at it. Five siblings carried a copy of the check as `tools/hub-pin-check.mjs`, and a copy drifts the way every forked gate does.

**What is done now.** One script at the hub root that takes `--repo`, so a sibling runs it without copying it. The hub's `CLAUDE.md` gate index says the sibling copies are superseded. It is not wired into `hub-gates.yml` or any sibling's CI; that is queued, since a gate that no workflow calls is a gate a session has to remember.

**The general form.** A check whose subject is the hub belongs where the hub is. A sibling that carries its own has the rule and a stale refusal.
