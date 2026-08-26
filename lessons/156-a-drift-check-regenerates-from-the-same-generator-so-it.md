## 156 · A drift check regenerates from the same generator, so it can only catch a wrong artefact — never a wrong generator

**Enforced by:** CHECKLIST generated-properties — for every property a generated
file must have, ask whether the check reads it off the OUTPUT or merely trusts
the generator to keep emitting it. Anything printed as `ok` that was not read
off the output is a claim, not a measurement.

**Smell:** a check whose whole body is "regenerate and compare", printing more
than one `ok` line. The comparison establishes exactly one thing — that the file
matches what this generator produces today — and every other line above it is
being asserted by the person who wrote the print statement.

This family generates a lot: release notes, colour tokens, a commit hook, an
emitted engine. The pattern is right and the drift check is right. But a drift
check compares like with like. Change the generator and it regenerates from the
changed generator, the two agree, and it goes green.

Solve-ent's colour tokens are generated from the one palette file, and the
generated CSS needs four cascade blocks: a default outside every query, the
system asking for light with nothing stored, an explicit day beating a system
set to dark, and an explicit night beating a system set to light. The last is
the one that gets dropped — it looks correct until somebody on a light-set
device turns night mode on and nothing happens.

The check printed `ok  day arrives three ways, and night beats a system set to
light`.

**It had never looked.** During a plant the explicit-night block was deleted
from the generator; the drift check regenerated, compared, agreed, and printed
that line under a file which no longer contained the rule it described. The
plant was restored by a command that silently did nothing — the file was
untracked — and the gap was found only because the next run's output was read
against what had just been typed.

The fix is four lines: read the four cases off the generated TEXT, where a
generator that stops emitting one of them fails. It planted red twice
immediately.

**The general form: every `ok` line is a promise that something was measured.**
A gate whose output is not read is merely useless; a gate whose output is read
and believed is worse than none, because it spends the reader's attention and
returns a fact that was never established. Before printing a line, find the
expression that would make it print `FAIL` — if there isn't one, the line is a
comment wearing a checkmark.
