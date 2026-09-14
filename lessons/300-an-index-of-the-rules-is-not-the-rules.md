## 300 · An index of the rules is not the rules, and the rule that gets skipped is the one no sibling had broken yet

**Enforced by:** GATE noahjefferson:doctrine-sync.mjs — a repo records the doctrine commit it
has reconciled with, and the check exits non-zero on unreconciled drift. · GATE
jefferson-photography-studio:tools/hub-pin-check.mjs — the marker and the CI pin
are the same fact and must not disagree. · CHECKLIST read-the-source — a session
working a sibling reads DOCTRINE.md itself once, not only the per-repo index of
it, before claiming a repo is held to it.

**Smell:** a repo with no `.doctrine-sync` at all. A session that has worked all
day against a `CLAUDE.md` summary and never opened the document it summarises. A
CI pin older than the marker beside it — or a pin with no marker to be older
than.

**Measured 2026-09-14, Jefferson-Photography-Studio.** The repo had **no
`.doctrine-sync` file**, so nothing recorded which version of the shared rules it
had ever been held to, and every session got the same "no marker" message
carrying no information about what was unreconciled. Its CI pin was four weeks
behind the hub, so every gate added upstream in between was enforced nowhere.

Reading the doctrine itself rather than the index found **an entire app shipping
without a rule marked non-negotiable**: §7b, the running version visible on
screen, from the first deploy, in every app. One repository, two apps. The editor
had carried a stamp since its first release. The other had never had one, so a
screenshot of it could not say which build made it — which is the exact failure
the rule exists to prevent, and it had been live for that app's whole life.

**Why an index cannot catch that.** The per-repo file is an index of the rules
that GET BROKEN — every entry in it is there because something went wrong
somewhere, and it says so. A rule no sibling has yet broken is therefore the one
most likely to be absent from it, and absence from an index reads exactly like
compliance. The rules most worth re-reading are the ones nothing has had to
write a paragraph about.

**The two markers are one fact and drift silently.** Adopting is one command,
editing a workflow is another, and the second is easy to skip because nothing
about the tree looks different afterwards. Holding them to each other on every
commit costs nothing; the failure it prevents is CI going green from a commit
that never heard of the rules the repository claims to have adopted.

**And the read pays for itself in one finding.** It took reading a handful of
sections to find an app-wide omission nobody had noticed in months of sessions.
The objection to reading a long canonical document is always its length; the
answer is that the index was written by people who already knew what it left out.
