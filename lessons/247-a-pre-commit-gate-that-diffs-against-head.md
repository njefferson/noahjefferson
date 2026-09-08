## 247 · A pre-commit gate that diffs against HEAD is reading the commit before the one it is guarding

**Enforced by:** CHECKLIST what-does-this-ref-mean-here — for any check wired
into a git hook, write down what `HEAD`, the index and the working tree each
name at the moment it runs, and pick the one the assertion is about. Watched:
the gate below was planted red on a tree whose version had been rolled back, and
green when it was restored; before the fix the same plant printed a pass. ·
JUDGEMENT — which of a hook's three views of the repository an assertion belongs
to.

**Smell:** `git diff <ref> HEAD` inside anything that runs before a commit
exists. Also: a gate that reads one half of its comparison from disk and the
other half from a commit — the version from `readFileSync`, the file list from
`git diff`. And the tell that made this one invisible for its whole life: it
never went red, on a repository where its subject changes every release.

**2026-09-08.** A repo had a commit guard whose one job was to refuse a change to
any file the app SERVES unless the release version moved with it — written after
a colour fix shipped with no version bump, which left the service worker
byte-identical and therefore reached nobody who already had the app installed.
Good gate, correct reasoning, and its own header carefully explains that its
assertion is true of a tree at a moment rather than of a branch.

It compared `origin/main` with `HEAD`. In a pre-commit hook `HEAD` is the commit
BEFORE the one being made, and on the first commit of a release branch `HEAD`
IS `origin/main` — so the diff was empty, every time, by construction. The gate
printed *nothing the app serves differs from production* over a commit that
rewrote the service worker, the markup, the manifest, a module and five icons.

**What made it undetectable is that it passed.** A gate reporting a clean state
is doing what everybody expects. It had no false positives to investigate and no
red run to explain, and the one condition under which it could ever have spoken —
several commits into a branch, changing a shipped file in a LATER commit than the
one that changed the version — is not how a release is cut here.

The fix is to name no second ref: `git diff origin/main -- <paths>` compares
against the working tree, which is where the gate was already reading the version
from. The two halves now look at the same thing.

**The general shape.** A hook runs at a moment when the repository has three
different answers to "what is the code" — the last commit, the index, and the
files on disk — and they are all valid, and only one of them is what the hook is
about. `HEAD` is the one that reads most naturally in a command line and is
almost never the right answer in a *pre*-commit check.
