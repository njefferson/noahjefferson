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

---

**It recurred four more times the same day it was written**, which is what moved
the fix from a per-case judgement to two structural rules.

- A test asserting a session has no accommodation field failed on its own
  header, which names the fields it must never have.
- The §7f diagnostic's `maxTouchPoints` line matched a ban on *points* — and
  that property is the one thing that tells an iPad from a Mac, since iPadOS
  Safari reports itself as macOS, so the doctrine effectively requires the line
  to exist.
- A browser walk asserting that praise is ABSENT has to spell the praise out:
  `check(!/streak|badge|great job/i.test(closing), 'nothing congratulating anybody')`.
- And the release notes again, from a second direction.

**Two fixes, not four exemptions.** The word gate now strips REGEX LITERALS as
well as comments — a pattern is not copy, nothing inside `/…/` is ever shown to
anybody, and the same file's plain strings are still read, so a harness that
actually printed praise is still caught. And the *points* rule was narrowed to
points-as-a-reward rather than the bare word.

The stripper is deliberately conservative about what counts as a regex, because
`/` is also division and a stripper that guessed wrong would silently delete
real copy; anything ambiguous stays in and is therefore still scanned. Planted
both ways: praise after a division is still caught, and ordinary division does
not trip it.

**The frequency is the finding.** Four recurrences in one sitting says this is
not a special case — it is what happens to every word gate once the codebase
starts documenting, testing and asserting the rule the gate enforces. Expect it,
and answer it with a syntactic rule about where copy can live rather than with a
list of files that are allowed to be wrong.

