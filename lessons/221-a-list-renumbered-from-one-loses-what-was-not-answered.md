## 221 · A list renumbered from 1 each time loses everything that was not answered in the same breath

**Enforced by:** GATE Jefferson-Line:tools/questions-check.mjs — refuses a
reused number, refuses a gap in the sequence (a gap is a deletion under a
tidier name), and requires options and a recommendation on anything still
open; prints the full open list on every run, wired into `.branch-guard` so
it runs on every commit. · CHECKLIST every-open-question-every-report — the
closing list is EVERY open item by permanent number, not a fresh selection,
and length is information rather than a reason to trim. · JUDGEMENT — whether
a question has been overtaken by events, and so should be closed as withdrawn
rather than left open, is a reading nothing can automate.

**Smell:** a report that ends "1. … 2. … 3. …" where the previous report also
ended "1. … 2. … 3. …" and the two lists are not the same questions. Also:
any recurring correspondence where the reply can address items by number and
the numbers are assigned per message.

**Jefferson Line, 2026-09-02.** Reports closed with a short numbered list of
decisions, which is the right shape and was the standing rule. Every report
numbered its list from 1. The owner answered by number.

**Two failures, and the second is worse than the first.** "2" meant one thing
on Tuesday and a different thing on Wednesday, so an answer could attach to
the wrong question. And a question that was not answered in the same message
it was asked had **nowhere to be** — the next report's list was a fresh three,
chosen fresh, and anything left over was simply gone. Three had gone that way
before anybody counted, and the one losing them was the one asking.

It was noticed by the person answering, not the person asking, and the
sentence was "you always do".

**The fix is a permanent number and a file to hold it.** Q7 is Q7 in every
report it ever appears in. Nothing is asked that is not registered first,
every report carries every open item by number rather than a curated
selection, and a question overtaken by events is closed as *withdrawn* with
the reason. Length of the open list is information about the state of the
work, and trimming it is the failure, not the fix.

**Why a file and not a habit.** The rule "end reports with decisions" already
existed, was already followed, and produced this defect anyway — because the
part that needed memory across sessions was living in the part of the system
that has none. A gate now refuses a reused number and refuses a GAP, which is
the same loss committed tidily: deleting an awkward question renumbers nothing
and looks clean. And it prints the whole open list on every run, so the list
arrives in front of whoever is about to write the next report without anybody
having to remember it exists.

**The general shape, and it is the same one as §217 and §220:** a rule that
lives only in an instruction is a rule that holds until the session is long
enough. Anything that must survive between reports needs a file with a gate on
it. The tell here is specific and worth watching for — **an identifier that is
assigned per message rather than per thing.** It reads as tidy, it costs
nothing to write, and it silently makes the correspondence unable to refer to
its own history.
