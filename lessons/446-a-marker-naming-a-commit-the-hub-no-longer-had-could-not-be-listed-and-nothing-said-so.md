## 446 · A marker naming a commit the hub no longer had could not be listed, and nothing said so

**Enforced by:** GATE hub:doctrine-sync.mjs — a `.doctrine-sync` marker naming a commit the hub does not have exits 1 without `--adopt`, saying the drift since that commit cannot be listed and that `--adopt` records the hub's current commit; with `--adopt` it writes the marker and prints that every section of the doctrine is unread since the rewrite; the commit it records is the checkout's `HEAD`, and the fetch only prints how far `origin/main` is ahead of it

**Recorded 2026-11-01.** Measured on 31 October with a scratch harness that planted a marker naming a commit of the right shape that no repository holds. The hub's history was rewritten on 18 September and every commit took a new name. A sibling's marker from before then names a commit the hub does not have, and the drift script, asked what changed since it, had nothing to compare against. Beside that, the commit it recorded on adoption was open to being read from `origin/main`, which can be a commit the checkout has not got, and a marker naming it would be the same fault again, one fetch later.

**What is done now.** Both paths are explicit. Without `--adopt`, exit 1 and the reason. With it, the marker is written and the print says that no section of the doctrine can be called read. The recorded commit is the checkout's own `HEAD`, which is also the commit a plan pins; the fetch is for the "ahead by" line and nothing else.

**What the change cannot see.** It reads the marker and the hub; it cannot say whether the session read the doctrine. `--adopt` stays an assertion, as it was.

**The general form.** A comparison against a name that no longer exists is not an empty difference. It is a different answer, and the script says which one it has.
