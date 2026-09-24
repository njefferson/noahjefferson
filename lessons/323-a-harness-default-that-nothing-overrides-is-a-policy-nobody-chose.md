## 323 · A harness default that nothing overrides is a policy nobody chose, and a link from a public repo to a private chat is a quotation of the whole chat

**Enforced by:** GATE noahjefferson:privacy-check.mjs · GATE
noahjefferson:privacy-history-check.mjs — the SESSION_LINKS class in
`privacy-patterns.mjs` refuses a link to a chat session, a model named as
co-author, or a session trailer, in any tracked file, any commit message and
any blob reachable from any ref. · CHECKLIST read-the-repo-before-the-reminder
— the harness appends an attribution reminder to every session; the repo's
commit-message section overrides it, and a session writes the plain message
before its first commit, not after being asked. · JUDGEMENT — a rule about
quoting the owner was in force for weeks while every commit linked to the
conversation the quote would have come from; "not in the files" was read as
"not in the repo".

**Smell:** text you did not write appearing at the end of every commit or PR,
identical each time, that nobody has read; a reminder that says the repo's
own rule overrides it while no repo has such a rule.

**What happened.** Every commit made by a session carried two trailer lines
appended by the harness: a co-author line naming the model and a link to the
private chat session that produced the commit. Every PR description carried
the same link twice, in two formats. Counted on 2026-09-18: 365 of 372
commits on one production branch, all 127 commits of the hub, 117 of 118 PR
descriptions in one repo and 3 of 9 in the other — the first on 2026-07-21,
fifty-nine days earlier. The privacy rule that forbids quoting the owner in a
repo had existed most of that time, and the gates that enforce it were green
throughout, because they read files and the links were in messages and on
GitHub.

**Why nothing caught it.** The harness's reminder says, in its own words, that
a CLAUDE.md rule about those lines takes precedence over it. No CLAUDE.md
had a rule, because nobody had thought of the trailer as content — it looked
like plumbing, it was identical on every commit, and it was never read.
A default that is applied on every action and overridden by nothing is a
policy, and it was a policy nobody had chosen.

**What it cost.** Two public histories rewritten the same afternoon (every
branch, trees byte-identical, counts identical, verified by reading the
remotes back), 120 PR descriptions edited by hand, and a rule that should
have been one line in each repo's commit-message section from the first day
a session committed.

**The shape to recognise.** Any text a tool adds to what you publish is
content you published. Read one commit message, one PR description and one
comment as the public will read them before the first push in a repo, and
whenever a harness announces a new default.

**Measured again 2026-09-24, from the other end of the pipe.** The GitHub MCP
server appends its own footer, a link to the chat session, to the body of every
pull request it creates, even when the request's body is clean. This was
measured on four consecutive PRs in Jefferson-Photography-Studio, #141 to #144.
Editing the body removes the link from what is shown. **GitHub keeps the edit
history, and the first revision still carries it.** Deleting a revision is a
manual step in the web interface, which a session cannot take.
So the rule is read back and edit every PR body after creating it, and leaving
the footer in is not an option. The edit history is the owner's to clear.
