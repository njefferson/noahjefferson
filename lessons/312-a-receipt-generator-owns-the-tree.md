## 312 · A receipt generator owns the tree while it runs, and the thing that invalidates a receipt is usually the fix for what the same run found

**Enforced by:** CHECKLIST receipt-order — write the generation order into a
script rather than into a paragraph: render, walk, then the artefact taken from
rendered output LAST, after nothing else will touch an input it hashes. ·
CHECKLIST own-the-tree — never end a turn while a generator holds the working
tree; a commit taken mid-render captures deleted output, and the only honest
answer to a dirty-tree check at that moment is that the tree is not yours. ·
JUDGEMENT — when a run fails and the fix touches a file some receipt hashes,
assume every receipt taken in that run is now void, including the ones that
passed.

**Smell:** a rule about ordering that lives in a comment and is followed by
hand. A gate that says "re-extract it" more than once in a session. A
dirty-tree check firing while a browser walk is rewriting PNGs. Two receipts
regenerated in one release for two different reasons.

**Measured 2026-09-16, Quietkeep, three times in one session.**

The repo commits several artefacts taken from the rendered app: ten walkthrough
photographs with a manifest hashing five named files, an accessibility stamp
over the UI sources, and a colour inventory over the same sources. Each has a
gate that compares its recorded hash against the tree, so a stale one fails
loudly rather than reporting green — that part works.

**What kept going wrong is the order, and the reason is structural.** The
invalidating change is not some unrelated edit; it is the fix for a failure the
same run just found. Three instances:

- A version bump invalidated the inventory, because patch notes render.
- A failing plain-mode check was fixed by a generator that rewrote a block in
  the stylesheet — a file the inventory and the stamp both hash. The inventory
  taken forty minutes earlier in the same chain was void.
- That same stylesheet write invalidated the photographs, whose manifest hashes
  it by name, so a render that had succeeded had to be run again.

So "take the inventory last" is not a preference and cannot be held by
intention. The generation order is now a script, with the reason in its header,
because the session that wrote the rule down is the session that broke it twice
after writing it.

**And the second half, which cost more turns than the first.** A generator that
deletes its output and rewrites it one file at a time OWNS the working tree for
the length of the run. A dirty-tree check firing in that window is reporting
something true and unanswerable: the files are not in a committable state, and
committing would put deleted photographs into a release. Explaining that to the
check is not a remedy — the remedy is not to be in that window at a turn
boundary. Start the chain, stay with it, commit its output in the same breath.

**One release also turned out to be load-bearing where it looked like
bookkeeping.** The same session moved two shipped files in the commit AFTER the
release's cache name was cut. The release gate refused it, and squashing the two
commits would have made every check green — all shipped files inside the triplet
commit — while leaving the real defect exactly in place: the deployed build had
already served intermediate bytes under a name that would never change again, so
anyone holding it would never receive the fix. New bytes need a new name. A gate
whose complaint can be silenced by rearranging history is worth reading for what
it is actually measuring before the history is rearranged.
