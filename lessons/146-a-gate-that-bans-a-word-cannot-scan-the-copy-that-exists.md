## 146 · A gate that bans a word cannot scan the copy that exists to say the word is absent

**Enforced by:** CHECKLIST register-before-exemption — when a word gate fails on
honest copy, ask which REGISTER the copy is in before reaching for an exemption.
The answer is usually that a different rule applies, not that no rule does.

**Smell:** a gate failing on the product keeping the promise the gate exists to
enforce. If the only way past it is to stop saying the true thing, the gate is
pointed at the wrong text.

Solve-ent bans praise, streaks, scores and targets, in a gate that runs on every
commit, because that is the rule a later session undoes in one well-meaning
afternoon. Its release notes are generated from `CHANGELOG.md` into a committed
source file under `src/`, so the gate scanned them the moment they existed.

**It failed on the note whose entire job is to tell a reader the app has no
streaks.** Two lines: one saying there are none, one saying why a streak makes
stopping feel like failing. Both are the product keeping its promise, said out
loud to the person the promise is to.

There was no wording around it. The gate matched the word, the word was the
subject, and every rewrite that satisfied the gate said less than the note it
replaced — **the note got worse in exact proportion to how well the gate was
working.**

The reflex is a whole-file exemption, and that is the wrong fix twice over. It
is where material collects, which is the privacy gate's own history in this
family, where green meant *not looked at*. And it discards a real check: those
notes ARE reader-facing copy and something should be reading them.

**The actual answer is register.** The praise, blame and assumed-classroom rules
are about a sentence spoken TO somebody about their own work. A release note is
about the app, and describing an absence requires naming it. The same repository
already had a rule for notes — no function names, no filenames, no developer
vocabulary — and that is the rule that applies. So the artefact is scanned in the
same run, under the notes rule, by its string literals only, and the run PRINTS
which rules it was held to. Not skipped: differently governed.

**The general form: a word gate encodes a rule about what may be SAID TO
somebody, and the same words are legitimate when the subject is the software
rather than the reader.** Documentation, release notes, a settings screen
explaining what it will not do, a test naming the thing it forbids — every one
of them has to name the banned word. Decide which text is in which register when
the gate is written, because the day it fails is the day somebody is mid-commit
and an exemption is one line.

**And the tell that this is the right shape rather than a rationalisation:** the
narrowed gate can still be planted red. A filename dropped into a carried note
fails, on the right line, with the right reason. An exemption cannot be planted
at all, which is what makes it feel safe.
