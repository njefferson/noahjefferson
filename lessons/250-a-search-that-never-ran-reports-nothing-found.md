## 250 · A search whose error you discarded reports "nothing found", and nothing found is an answer

**Enforced by:** CHECKLIST never-2-dev-null-a-search — a `grep`, `find`, `rg` or
`ls` whose result will support a NEGATIVE claim keeps its stderr. If the noise
is genuinely unwanted, assert the path first (`test -d "$P" || exit 1`) so the
absence of a haystack cannot be reported as the absence of a needle. Watched:
the exact failing command was replayed with stderr restored and printed `No such
file or directory` where it had printed nothing. · CHECKLIST
relative-path-after-cd — a path argument written for one working directory is
wrong in the next call; parallel calls in one batch do not share the cwd you
think they do. · JUDGEMENT — whether an empty result is evidence or an artefact.

**Smell:** `grep -r … <relative-path> 2>/dev/null` where the relative path names
the directory you are probably already standing in. Any negative conclusion —
"this has never been done", "there is no such file", "nothing references it" —
resting on ONE command that produced no output. Zero hits reported without the
number of files searched beside it. And the giveaway in prose: *returns zero
hits across* — a phrase that sounds like a measurement and names no denominator.

**2026-09-08.** A session opened by asking whether a repository had ever run a
particular kind of review. One `grep` over two repos came back empty, and the
session reported the practice had never happened — in chat, in a `NOTES.md`
paragraph, and in two commit messages, one of which called the day's work "the
first this repo has ever had".

It had happened seven days earlier, under a protocol the owner designed. The
phrase appears in the repo's own NOTES three times, in two shipped source files,
in a tool, in a verifications record and in three test files: ten files, in the
tree that was searched.

The command was run from inside `/repo` with `repo` as its path argument. The
shell said `No such file or directory`; `2>/dev/null` ate it; the empty stdout
was read as a finding. **The redirect was there to suppress permission noise
from `node_modules` and it suppressed the only line that mattered.**

**What makes this worse than a wrong answer is the direction.** A search that
errors LOUDLY costs a retry. A search that errors quietly returns the empty set,
and the empty set is the shape of a real negative result — so it does not
prompt a second look, it terminates the enquiry. Every later step inherited it:
the review was designed without the earlier protocol's asymmetry rule, which
had been written down precisely so a fresh report could be weighed.

**The general shape, and it is the same as §249 from the same day.** An
instrument that cannot distinguish *measured nothing* from *did not measure* will
report the second as the first, and the first is the reassuring one. §249 was an
equality check satisfied by two things that never moved; this is a search
satisfied by never running. Ask of any negative result: what would this have
printed if it had not executed at all — and if the answer is "the same thing",
it is not evidence yet.
