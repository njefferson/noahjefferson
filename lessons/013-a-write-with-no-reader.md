## 13 · A write with no reader

**Enforced by:** CHECKLIST read-your-own-write — every field or event a build writes must name the code that reads it, and a push is confirmed by reading the remote ref, never by reading the push output.

**An event you write and never read is a promise nobody is keeping — and
nothing will tell you, because nothing is looking.** Quietkeep has recorded
`export.written` since its first week: every time somebody exported a copy of
their data, the fact went into the append-only log with a timestamp. Three call
sites wrote it. **Nothing ever read it.** So the one question the app's entire
durability story turns on — *when did I last save a copy?* — had an answer
sitting in storage for months, and no surface could give it. The design record
had even specified the surface: It was never built,
so the app let people assume, silently, and looked completely healthy doing it.
Nothing failed; no test went red; the data was all there. **A write with no
reader is the quietest defect a system can have**, because every instrument
reports success — the event validates, the log grows, the export works. The
generalisation worth carrying: **the consequences section of a design document
is a build list, not prose.** Anything written there as is
either shipped or outstanding, and the ones nobody converted into work become
the app's quietest lies — features the record insists exist. Two riders found
the same day. First, when one noun serves several acts, **check what the reader
will conclude from it**: the same `export.written` recorded a whole importable
backup, a partial *reading* copy that cannot be imported at all, and a calendar
file — so a naive reader would have told somebody their calendar export was
their backup, which is worse than the silence it replaced. The fix is to hold
the *writers* to the reader's categories, in code, so the set cannot drift.
Second, **an index of records rots faster than the records do**: this repo's
decision index had been stale for twenty-four entries, and eleven of the
filenames written from memory to repair it were wrong until checked against
disk. A pointer file nobody verifies is a pointer file that lies.
*(Quietkeep, 2026-08-02 — the question that surfaced it was whether clearing
Safari's cookies loses everything the app is holding.)*

**And the fix generalises into a gate, which is the half worth copying.** Having
found two of these in one day, the obvious next question was *how many more?* —
and the answer was **twenty-three more names the app could record and never did,
of which exactly two carried a note saying so.** From outside, all twenty-three
looked identical to the two that were real defects. So the rule became: **every
name in the closed vocabulary is either written by the running code, or the
document says in words that it is not, and why.** There is no third state, and a
build fails on one. The check greps for the name's string literal outside the
handful of files that necessarily mention every name (the declaration, the
renderer, the reader) — deliberately crude, because a precise emit-detector
would need to understand every code path and would become another thing that
could quietly stop working, which is the exact failure being fixed. Crude also
errs toward calling a name *used*, and that is the safe direction: the sentence
it would otherwise demand is cheap, while a false "accounted for" is the outcome
that hurts. **It checks both directions** — a name the code now does write must
not still be described as unused, because a stale note is the next quiet lie and
would be left behind by whoever finally wires the thing up. Two implementation
notes that cost real time: the first version split the document on blank lines,
and since a bullet list has none, one note vouched for every entry beside it —
scope the check to the entry, not the region; and forcing a *sentence* rather
than a boolean is the whole mechanism, because "reserved", "deferred, waiting on
X", "superseded by Y" and "redundant" are four different answers and only prose
distinguishes them. Applies to any closed set a system declares and only
sometimes uses: feature flags, error codes, permission scopes, event types,
metric names, translation keys.
*(Quietkeep, 2026-08-02 — 1.14.2, the release after the two that prompted it.)*

**`git push -u origin <branch>` pushes the ref with that NAME, not the branch you
are standing on — and it reports success either way.** After promoting fauxplane
to production with `git checkout main && git merge --ff-only staging`, the
session never went back. Two further releases were committed — onto `main`,
locally — and each was "pushed to staging" with `git push -u origin staging`.
Both pushes succeeded. Both moved nothing, because local `staging` had not
advanced. Production was never at risk, which was luck rather than care: had the
pushes named the current branch, unreviewed work would have gone straight to
production past a hard release gate.

The owner was told twice that fixes were live, with instructions to reload a URL
that was still serving the old build. Reloading would have exposed it in
seconds — the second false "it's deployed" of the day.

**The tell was in the output, and it was read as success twice.** A push that
transfers anything prints a range:

 c4e952c..d1b6d65 staging -> staging

No range means no transfer. The output in question was only
`branch 'staging' set up to track 'origin/staging'` — the tracking message,
which git prints for `-u` whether or not anything moved. **Read the range line;
its absence is the failure.**

What caught it was a stop hook complaining about commit signatures, which
happened to name the branch. Nothing in the session's own reasoning did,
because every step reported success.

Three fixes, in order of how much they buy:
- **`git ls-remote --heads origin` before claiming anything shipped.** The push
 output is a claim; the remote is the fact. One command, and it is the same
 discipline as opening the CI run rather than citing it (§7b).
- **Promote without leaving the branch:** `git push origin staging:main` does
 the whole job and cannot strand commits on the wrong branch.
- **If you must check out another branch, check back afterwards**, and treat any
 `git checkout` during a release as a step that must be undone.
*(fauxplane, 2026-08-02.)*

---
