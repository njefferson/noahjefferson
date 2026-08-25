## 55 · A rule written at the top of the file gets read once; the file is then edited from the bottom

**Enforced by:** GATE fauxplane:scripts/releases.test.mjs — the reader-address rules over every release note, with patterns written from sentences that actually shipped, plus a test that the ban has not widened. DOCTRINE §7d.1 is the rule; this is what it cost to find that stating it was not enough.

Ten consecutive releases of a **development diary published inside the product**.
An app built for one reader, and that reader opens the notes to find four
sentences of the same shape: two telling them what they had asked and what they
had done with the device in their hands, one narrating the session's own process
and admitting a test was written late, and one addressing them directly about a
feature request. **Every one of them a fact about a person, published in a
product they use.**

The sentences are described rather than reproduced, which is the rule the lesson
is about applied to the lesson itself — quoting them to prove they were quoted
republishes them one more time, in a public file, for as long as it exists.

**The file those were written in opens with the rule they break.**

That paragraph was written from this app, by a session on this app, and then
walked past every release for two days.

**That is the lesson, and it generalises past patch notes.** A rule in a header
comment is read on the FIRST edit of a file and approximately never again. Every
subsequent edit opens the file, scrolls to the array, and appends. The rule is
four screens up, in a region the editor has no reason to revisit — present,
correct, and completely inert. **Documentation at the top of a file is a rule for
whoever creates the file, not for whoever maintains it.**

**Three failure forms, each reasonable while being typed:**

- **"You" drifts from the reader to whoever reported the fault.** The session has
 just read the report; its wording is the freshest thing in context, and quoting
 the reporter feels like precision. The reader is not the reporter.
- **"I" appears at all.** A session narrating its own process — including its own
 mistakes, which feels like honesty and is actually a stranger apologising to a
 stranger in someone else's product.
- **The reader is given homework.** "Send me that." Eight releases running. A
 working arrangement between two other people, on a third person's screen.

**The condition that produced it is worth naming: the work was going WELL.** Fast
back-and-forth, a fix per hour, the owner reporting and the session shipping. That is
exactly when the reporting voice is loudest in the session's context and least
distinguishable from the app's own. **The notes were being written from the
session's memory of the day rather than from the diff** — and a diff has no
opinion about who found anything.

**The remedy is a gate, and its patterns come from real sentences.** Twenty lines
over the release data. Written from the shipped text, not from imagination, with
a test asserting each pattern still catches its verbatim original — and a second
test asserting the ban stays NARROW, because ordinary second person is how good
product copy speaks and a gate that bans "you" outright makes the notes worse
than it found them.

**It went red on six lines immediately, two of them written minutes earlier in
the very release that added it.** A gate written from real examples finds its
author still doing it.

**Smell:** any rule you can only comply with by remembering it. If the only thing
standing between the rule and its violation is a session having read the top of
a file, it is not a rule, it is a hope. Also: a patch note that names a person, a
release note containing "I", or copy that tells the reader what to send you.

*(fauxplane 1.19.2–1.28.0, rewritten in 1.28.1, 2026-08-05.)*

---
