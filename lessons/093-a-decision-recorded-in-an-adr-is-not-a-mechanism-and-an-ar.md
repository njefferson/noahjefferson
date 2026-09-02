## 93 · A decision recorded in an ADR is not a mechanism — and an argument accepted for one surface does not travel to the others by itself

**Enforced by:** JUDGEMENT — nothing can check that a sentence and the code under it agree. What CAN be checked is stated in the ADR that closes each case; the failure here is that two such sentences existed and neither had ever been measured against the thing it described.

**Smell:** a comment or ADR that says what a surface **is** — "an inspection mode, not a workspace", "never the landing view", "on request only" — with no number anywhere in the repo standing behind it. Also: a decision whose reasoning names no surface, whose fix touched exactly one, and which closed the same week. Both are cheap to test the moment you notice them; the tell is that the sentence reads as settled and has never been measured.

Quietkeep's alignment tree shipped with a comment directly above its markup
reading *"never the landing view; an inspection mode, not a workspace"* — the
words of its own ADR. The markup under that comment unfolded the tree **into
the workspace**, inline, above the held list, for thirty-four releases. On a
full store that fold measured **17,246px**. The coverage claim beside it, same
shape, measured **26,031px**. Nobody had disagreed with the sentence; nobody had
ever put a number against it either.

**The second half is worse, because it was fresh.** The day before, the same
repo had retired the (i) panel's folding groups and written down exactly why:
*"opening a group scrolls the others out of reach — the fold changes how much
stands in front of you and not how far you have to travel, and travel is what
was expensive."* That argument was accepted, the panel was fixed, and the two
biggest folds in the entire app were left alone — because they were on a
different screen. The decision had a scope, the scope was the surface somebody
happened to be looking at, and nothing in the record made the general claim look
general.

**What it cost to find:** nothing, once measured. Rendering the app with a real
store and reading `document.documentElement.scrollHeight` took one script.
Opening the two controls took the surface from **17,777px to 63,906px** — 15.1
screens to 54.2. Every gate was green throughout, in both repos, and correctly:
contrast, targets, names, axe, behaviour walks and budgets all measure things
that were fine. **No gate in either app had any opinion about how far a reader
travels**, which is why a defect this size lived in plain sight under a comment
describing it.

**The two questions this leaves, and they are cheap:**

- **When an ADR says what a surface IS, measure the surface against the
 sentence once.** "Inspection mode, not a workspace" is a claim with a number
 behind it, and the number was never taken.
- **When a decision is accepted, ask what else it is true of before closing
 it.** ADR-0083's reasoning named no surface. The fix it drove touched one.
 The question "where else is this shape" is one line in the record and it was
 not asked.

**The general shape:** a rule written in the same file as the code it governs
feels enforced, and it is doing strictly less than a comment — a comment at
least gets read when somebody edits that line. The dangerous case is not the
rule nobody wrote down. It is the rule everybody agrees with, sitting one line
above the code that breaks it, where its presence is mistaken for its effect.
