## 205 · A tracked-files gate run before `git add` scans none of the work it is vouching for

**Enforced by:** CHECKLIST gates-after-add — in a session that creates new
files, run the tracked-files gates (privacy, quote, third-person, docs) AFTER
staging, and treat a green from before `git add` as no run at all. ·
JUDGEMENT — the gate's own output does not say how many files it scanned, so a
green over an empty set and a green over the real set print the same sentence.

**Smell:** running a repo's gates "first, to be safe" in a session that has
not created its files yet — and then trusting that green after the files
exist. Also: a gate that passes locally and fails in CI on the same commit,
which here was not an environment difference but a *population* difference.

**The unlisted app, first commit, 2026-09-01.** A session building a new repo
ran all four hub prose gates locally and watched them pass — then committed
33 new files and had CI fail the third-person gate at the hub pin, on a bare
pronoun in a test-file comment. The local run had been honest: "no
third-person references in tracked files." At the moment it ran, the
repository tracked two files, and the comment it needed to catch was in a
file git had never been told about. The gate scanned everything it was asked
to scan, and it was asked to scan almost nothing.

**The general form.** Any gate scoped to `git ls-files` measures the
repository, not the working directory — which is the right scope for CI and a
trap for the session that is still creating the tree. The cheap fix is
ordering: `git add -A` first, gates second, commit third. The push cost one
red run and one fix commit here; on a larger drop it is one red run per
file-population the local green never looked at.
