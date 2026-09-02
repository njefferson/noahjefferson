## 22. A hand-written list of files to check goes stale, silently and twice

**Enforced by:** CHECKLIST derive-the-list — a check DERIVES what it covers by walking the tree; where it must enumerate, a missing entry FAILS rather than shrinking the sweep.

In one session, two of them:

- A fault-injection plant was anchored to a specific line of source. Ordinary
 refactoring rewrote that line, the plant stopped matching, and it proved
 nothing. (Section 12's entry has the detail.)
- The same harness held a hand-written array of five test-file names. A sixth
 test file was added and not added to the array — so **the gate the plants were
 verified against was running a strict subset of `npm test`**, and would have
 blessed any fault covered only by the new file.

Both have the same shape: a list that stays correct only while someone remembers
it exists. The fix is to derive it — read the directory and filter on the
suffix. Filter rather than hand the whole directory over: `node --test scripts/`
had already, in this same repo, swept in every non-test script and run it as a
test.

**If a check enumerates what to check, the enumeration is the weakest part of
it.** Derive the list, or accept that it is a comment describing what used to be
true.

*(fauxplane, 2026-08-02.)*
