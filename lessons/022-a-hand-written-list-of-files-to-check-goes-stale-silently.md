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

## And the same defect once more, in a sweep that enumerates rather than lists

**2026-09-20, an accessibility sweep, and it is the fourth instance in one
instrument.** That walk does not carry a hand-written list of controls — it
enumerates every button on the page and measures it, which is meant to be the
cure for exactly the staleness above. It still misses whatever is not on
screen at the moment it looks, and a control with no bounding box is skipped
in silence.

Its own comments record the first three: a page, a dialog, a MODE and a TAB
turned out to be four different things, and only the first two were ever
visited. The fourth is an editor that does not exist until the reader has
CREATED something — a mask's own panel is `hidden` until a mask exists and one
is selected, so the sweep walked the Masks tab seeing the Add row and nothing
else. Show mask, Invert, Delete, two sliders, three radios and a whole brush
row had never been measured, and the output said every control passed.

**The generalisation, and it is why this keeps happening**: an enumerating
sweep is a list too. Its list is *the states somebody thought to put it in*,
and that list is exactly as hand-written and exactly as stale as a list of
file paths — it is just written in the driving code instead of in a data file,
where it is harder to notice missing. The question to ask of any such sweep is
not "does it enumerate" but "what does the app have to have DONE for this
control to exist, and does the sweep do it".
