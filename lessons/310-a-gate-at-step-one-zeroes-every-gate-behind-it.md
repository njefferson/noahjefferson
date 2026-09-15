## 310 · A gate that refuses at step one means every gate behind it never ran, and the workflow that deploys is green either way

**Enforced by:** CHECKLIST `every-workflow-not-just-the-deploy` — after a push,
ask of EVERY workflow the push triggers, not only the one that deploys: is there
a run whose head SHA is this commit, and what did its log say. §161 established
the question and a session asked it of one workflow out of two for fourteen
consecutive releases. · CHECKLIST `regenerate-in-the-same-commit` — editing the
SOURCE of a generated artefact and regenerating the artefact are one change; the
commit that does one without the other is the commit to refuse.

**Smell:** a repository with more than one workflow, so "is CI green" has more
than one answer. A check placed FIRST in a job because it is cheap. A generated
file that is also a committed file. Any sentence of the form "all N gates green"
where N was counted somewhere other than where it matters. And the specific
tell: a job that fails in under thirty seconds, every time, with the same
message.

**Measured 2026-09-15, Jefferson-Photography-Studio.**

The repository generates its pre-commit hook from a declaration file. Two checks
were added to that declaration over three releases — a lens-store consistency
check and a function-contract check — and the tracked hook was never regenerated
from it. Two files that are one fact, saying different things.

CI opens its gates job with `branch-guard --artefact`, which holds the TRACKED
hook to the declaration. It fired, correctly, on every run. **Because it is step
one, the eight gates behind it never executed on a runner at all** — not once,
across fourteen consecutive runs on three branches. The failure this produced is
the one the declaration file's own header comment describes, and the file that
was out of date was that declaration's own artefact.

**Everything local was genuinely green, and that is why nothing looked wrong.**
The live hook in `.git/hooks` was current, so every commit really did run all
nine checks and every one really passed. That was reported after each release and
it was TRUE — of one clone, and of nothing else. A statement about coverage is
about a population, and the population had silently become one machine.

**The deploy workflow was green all fourteen times.** It is a different workflow
with a different trigger and nothing in common with the gates job but the push
that starts both. So the release verification — cache stamp read off the served
site, deploy run green for that exact SHA, §53 and §161 both satisfied — was
correct and complete about the thing it examined. Two commits reached production
that way, each with a red gates run against it, and nothing anywhere said so.

**§161 is the rule that was followed into the gap.** It says the question is
never "is the newest run green" but "is there a run whose head SHA is this
commit, and what did its log say". Asked of the deploy workflow, answered, every
time. The clause that was missing is *of every workflow the push triggers* — and
a session cannot notice that clause is missing by looking harder at the workflow
it already checks, because that one keeps answering.

**The divergence has a cause worth knowing, and it is a deliberate design
decision working exactly as intended.** `--install` writes the hook to two
places: the tracked `.githooks/` copy and the live `.git/hooks/` copy. The live
copy is there on purpose — §107's finding was that pointing `core.hooksPath` at
the tracked directory FAILS OPEN, because checking out an older branch deletes
the hook with it, and the branch most in need of a guard is the one most likely
to be older. So the live copy is immune to checkout. **Which means a checkout
reverts the tracked copy and leaves the live one current, and the two are now
different with no event marking it.** Restarting a session branch from the
default branch does precisely that. The property that makes the guard survive is
the property that lets its two copies drift apart in silence.

**What generalises, and it is about ordering rather than about hooks.** Putting a
cheap consistency check first in a job is good practice and it has a cost nobody
prices: every later step's coverage becomes conditional on it, and a red job
reports that the JOB failed, never how many of its checks ran. Green means all of
them; red means an unknown number between zero and all-but-one, and zero is the
most likely value when the failing step is first. The reading worth taking from a
red job is therefore not the conclusion but **the count of steps that executed**,
and no CI surface shows that without opening the log.

**The option not taken, recorded rather than decided:** the generator could embed
a checksum of the declaration in the hook it writes, so a declaration edited
without a regeneration is refused locally, at the commit, instead of on a runner
afterwards. It is a small change to one shared file. Its cost is that the
generated text changes for every sibling at once, so every repo's tracked hook
becomes drifted until somebody re-installs it — which is six repositories going
red for a reason that is not theirs, and the doctrine's own objection to a
sibling's CI going red because the hub moved.
