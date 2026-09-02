## 155 · `exclude` is inherited through `extends`, so a whole directory was checked by neither project while both exited 0

**Enforced by:** GATE solve-ent:tools/coverage-check.mjs — every source file must
be loaded by at least one project, asked of the compiler with `--listFilesOnly`
rather than inferred from the config, and a project that loads nothing at all
fails too.

**Smell:** a config split for a good reason. The moment one project excludes
something so another can include it, ask which project actually loads it — and
ask the compiler, not the file.

Solve-ent's engine must not touch the DOM, and the way to make that a fact about
the build rather than a habit is to give its project `lib: es2023` and no DOM at
all. So the base config excluded the browser directory, and the browser config
extended it and included everything.

**`exclude` is inherited through `extends`.** The exclusion applied to both. The
browser layer — a screen written in one pass, several hundred lines — was loaded
by neither project. `tsc --noEmit` exited 0 on each config. It had two real type
errors in it: a property that does not exist on the returned type, and a field
name that was simply wrong.

It was found by asking `--listFilesOnly` how many files had been looked at, on a
hunch that a screen written in one pass had no business compiling first time.
**That hunch is not a build system.** Nothing in the output distinguished
"checked and clean" from "checked nothing": both are silence and exit 0.

The same shape appears wherever a tool takes an include list — a test runner
whose glob stops matching after a rename, a linter with an ignore file that grew
a broader pattern, a coverage tool measuring a directory that moved. **The
failure is always silent in the same direction**, because the absence of
findings is what success looks like.

**The general form: a checker reports on the files it loaded, and never on the
files it did not.** So something has to compare the set it loaded against the
set that exists. Ask the tool what it saw — most of them will say, and it is a
different question from what the config appears to say. Where two configs divide
a tree between them, the division is a claim that their union is the whole tree,
and nothing checks a claim like that by itself.

**And the second half, which is cheap and was nearly missed:** a project that
loads NOTHING is the same defect one level up, and it exits 0 too. Both are
planted in that gate — the inherited exclusion, and an include pattern pointing
at a directory that does not exist.
