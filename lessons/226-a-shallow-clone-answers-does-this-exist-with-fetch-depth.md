## 226 · A shallow clone answers "does this commit exist" with a fact about the fetch depth, and says nothing about doing so

**Enforced by:** CHECKLIST unshallow-before-history — before any conclusion that
rests on git history (does this commit exist, how far behind is this, what
changed since), check `.git/shallow` and `git rev-list --count`, and unshallow if
either looks short. · CHECKLIST refetch-before-you-survey — a survey of several
repositories reads each one's REMOTE state first; a clean working tree says
nothing about how far behind it is. · JUDGEMENT — no gate can know which of a
tool's answers you were about to build a decision on.

**Smell:** any conclusion of the form "that commit is not in this repository",
"this repo has never had X", or "the history only goes back to Y", drawn from a
clone somebody else created. A survey loop over sibling repositories that reads
working trees without fetching. A `git log` whose oldest entry is suspiciously
round or recent. Also: `git status` reporting clean and being taken as current.

A sweep across eight sibling repositories was about to reconcile each one's
record of which hub commit it had adopted. Two of the eight named commits that
`git cat-file` reported absent, and the natural reading — the one already
written down in a shared file — was that those markers pointed at nothing and
should be re-adopted.

**`.git/shallow` was present. The clone held 141 commits of a 443-commit
history, and both "missing" commits were in the 302 that had been cut off.**
Nothing about the failure said so: `git cat-file -t` on a commit outside the
graft simply reports it is not a valid object, in exactly the words it uses for
a commit that never existed.

Re-adopting on that reading would have moved two repositories' markers forward
without anyone reading the drift they actually had — which is the one thing
adopting a marker asserts.

**A second copy of the same failure was in the same survey.** One repository's
local clone was seventy-four commits behind its remote, and clean. The survey
read the working tree and reported a pin that repository had already moved past
— a claim that had also been written into a shared file and read as current by
everyone since.

**The two have one shape: a local artifact answering a question about a remote
fact, in a voice that does not distinguish the two.** `git` is unusually good at
this — it will tell you a commit does not exist, that a tree is clean, that a
branch is up to date, each true of what it has and none of it about what is
there.

**What to do**

- Before drawing any conclusion from history, `test -f .git/shallow` and
  `git rev-list --count HEAD`. If either surprises you, `git fetch --unshallow`
  and re-ask. It costs one fetch of a repository you already have.
- Fetch before you survey. A loop over N repositories starts with N fetches, and
  reports ahead/behind rather than the working tree.
- When a check says a thing is ABSENT, ask what it would have said if the thing
  were merely out of reach. If the two answers are the same sentence, the check
  has not answered the question yet.
- A claim about a sibling repository that was written down once goes stale
  silently. Re-measure it at the point of acting on it, not by reading the file
  that recorded it.
