## 236 · The remedy for an instruction that could not be followed was another instruction that could not be followed

**Enforced by:** GATE noahjefferson:handoff-check.mjs — the iPad-first rule now
refuses BOTH shapes, and reads `METADATA.md` as well as NOTES and README,
because that is where an owner's manual steps actually live and it was not being
read. Both shapes planted and watched refuse. · CHECKLIST
which-app-is-the-reader-standing-in — before writing any step for somebody else,
name the application they will be inside when they read it, and check the step
is possible from there. · JUDGEMENT — whether a step is possible from inside a
home-screen app is a fact about the platform, and it has to be looked up rather
than assumed from how a browser behaves.

**Smell:** any instruction beginning "open", "visit", "download", "save from" or
"go to", written for somebody who uses the thing as an installed app. Also: a
correction that keeps the SHAPE of what it corrects — a path swapped for a URL,
one address for another — which is a fix aimed at the example rather than at the
cause.

**The unlisted app, 2026-09-03.** A file had to reach a tablet so it could be
uploaded to a settings page. The record already said not to write "fetch it out
of the repo", because there is no repo on a tablet. So the instruction was
rewritten to name the site's own copy of the file and say to save it from there.

**That fails harder, and the reason was written in the same repository three
releases earlier.** A link cannot leave an installed app on iOS — no `target`,
no `rel`, no gesture does it. It is why that app hands a code across with a copy
button instead of opening anything, and it had cost a release to find out.
Somebody standing in the installed app, signed in, could not reach the address
at all. The instruction was given to exactly that person.

**The correction kept the shape of the defect.** "Not a path — a URL" is a fix
aimed at the example. The cause is not paths or URLs: it is that the step
requires OPENING SOMETHING, and the reader is inside an application that cannot
open things. Every remedy of that shape fails, and there are many of them, so a
rule written against one example will be satisfied by the next one.

**The gate had the same narrowness.** It matched a verb, a filename, and the
words "from the repo" — so it was a rule about REPOS rather than about reach,
and the replacement instruction sailed through it. It refuses an address now
too. It also had never read `METADATA.md`, which is the file in that repo whose
entire purpose is steps only the owner can perform: **a gate pointed at NOTES
and README while the manual steps lived somewhere else is a gate reading the
wrong file**, and nothing about its green output said so.

**The remedy that works has no address in it at all: the session sends the
file.** It arrives in the conversation the person is already reading, and is
saved with a press. That is available in every one of these sessions and was
available the whole time.

**And the general form, because a session cannot see this from the inside.**
The whole family is built for a reader on a tablet using home-screen apps, and
every session writing instructions for that reader is sitting in a terminal
where every address opens. Both instructions read as obviously fine to the
session that wrote them. **Naming the application the reader is standing in is
the only step that makes the difference visible**, and it has to be done
deliberately, because nothing in the writing of it feels wrong.
