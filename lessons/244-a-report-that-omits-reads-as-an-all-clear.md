## 244 · A gate that omits gives a false pass; a report that omits gives a false all-clear

**Enforced by:** GATE unlisted-app:tools/user-walk-check.mjs — the cold-read
list is held against the app's own render functions in BOTH directions, in the
commit hook and in `npm run check`; a screen that exists and is unlisted fails,
and a listed screen that no longer exists fails. Watched: the list as it stood
named twelve of twenty-six screens and the gate refused. · CHECKLIST
what-drives-the-report — for any artefact handed to a human as evidence, name
what decides its scope, and make that decision checkable against reality rather
than against somebody's memory. · JUDGEMENT — which functions are screens and
which are fragments.

**Smell:** a hand-maintained list of what to inspect, inside a tool whose output
is read rather than acted on by a machine. Also: any "walk", "audit", "survey" or
"report" script with a `const` array of targets at the top and nothing comparing
that array to what exists. And the specific tell — the list is in journey order,
or priority order, or any order somebody chose, because a chosen order is a
chosen membership.

**2026-09-05.** An app kept a cold-read extractor: it pulls every user-visible
string out of the source, screen by screen, in the order a newcomer meets them,
so the copy can be handed to a reader who knows nothing. Its own header says why
— *the team that wrote a screen cannot read it cold; they supply the missing half
of every sentence from memory.* Good tool, correct reasoning, one array at the
top naming twelve screens.

The app had **twenty-six** render functions. Fourteen were not in the array,
**Home among them** — the first screen anybody lands on after joining. Every one
of eight releases shipped that day added or rebuilt a screen; not one of them was
in the list.

**THE FAILURE MODE IS NOT THE SAME AS A GATE'S.** A gate whose file list is short
goes green over unchecked files: a false pass, bad, and familiar — it is why the
deny-list of binaries one lesson back is a deny-list. A REPORT whose target list
is short produces a clean, detailed, quotable document about the parts it did
look at, and a person then reads that document and concludes the app is fine.
The false pass is consumed by a machine; the false all-clear is consumed by a
human who acts on it. It is worse, and it is quieter, because the report's
thoroughness about what it saw is itself the evidence that it saw everything.

**Nothing was wrong with the twelve entries.** That is the shape to remember: the
list was not stale in the sense of naming things that had gone, which a run would
have caught. It named real screens, correctly, in a sensible order, and the walk
it produced was accurate. Accuracy about a subset is what makes this invisible.

**Both directions, and the second direction is the cheap one.** Every render
function must be listed, which is the half that was missing. Every listed entry
must resolve to a real function, which costs one lookup and catches a screen
being renamed or removed out from under the list.

This is the same defect as the a11y surface list two lessons' distance away
(§231, §28): a new surface has to join the list in the commit that creates it, or
it ships unmeasured. What is new here is only the consequence — that one produces
a green run, and this one produces a report somebody believes.
