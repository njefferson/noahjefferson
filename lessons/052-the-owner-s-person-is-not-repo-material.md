## 52 · The owner's person is not repo material

**Enforced by:** GATE hub:privacy-check.mjs — tracked files in any repo are
scanned for sentences that attach a diagnosis, health fact, or identity
disclosure to the owner; any hit exits non-zero. HARD in CI per Doctrine §9b:
GATE hub:.github/workflows/doctrine.yml runs it on every hub push, and GATE
Quietkeep:.github/workflows/spine.yml checks the hub out and runs the
canonical copy on every Quietkeep push. Quietkeep also carries the patterns
as `test/privacy.test.ts`, so its `npm test` fails without the hub present.
No file is exempt: the gate scans itself and its own test, skipping only a
sentinel-marked region of pattern source, which a second rule holds to no
proper name and no date.

The failure mode here is DILIGENCE, not sloppiness, which is what makes it
likely to recur and why it needs a gate rather than a resolution. These repos
run on a documented reflex — capture a report verbatim, because sessions keep
paying for not writing things down — and that same reflex, pointed at the
wrong object, carries something personal into a public repo inside an
otherwise correct log entry. The reflex is right and stays. The gate is what
aims it.

The line that decides every case: **the owner's design statements are repo
material; who the owner is, is not.** The products' framing ("a planner for neurodivergent
users") is public on purpose. Research about users as a population is fine.
The violation is a sentence whose predicate is a diagnosis, a health fact, or
an identity disclosure and whose subject is the OWNER — and the gate's
patterns anchor on exactly that structure, because the same nouns appear
legitimately a hundred times in product and research prose.

Three traps found building the gate, kept so the next widening avoids them:
the medical pattern must say `diagnosis|diagnosed`, not `diagnos\w+` — the
apps ship a *diagnostic report* feature whose name sits beside the owner's
name constantly, and the first run false-fired on it. And a false positive here is
worse than elsewhere: a gate that fails the product's honest vocabulary
teaches sessions to route around the one gate that must never be routed
around. And the gate's first CI wiring failed on its own documentation:
this lesson's original Enforced-by line named the person first and the
medical term four words later, which is the exact shape the medical pattern
anchors on — prose ABOUT the rule reads exactly like the thing the rule
forbids, and it cannot even be QUOTED here without failing the gate again. The convention that resolves it without loosening
anything: meta-prose names the TERM first and the person second ("a diagnosis
attached to the owner"), while a real disclosure leads with the person —
which is the very structure the patterns anchor on. The wrong fix was
excluding LESSONS.md from the scan: the recording reflex writes HERE, so this
file is the last one the gate may skip.

**A gate that exempts a file cannot see that file, and the exemption is where
the material collects.** The first version skipped `privacy-check.mjs` and
`test/privacy.test.ts` whole, reasoning that a pattern is not a disclosure.
That is true of the patterns and false of every other line in those files —
their header prose and, worse, the test's fixtures, which were the sentences
the gate exists to keep out, sitting in a public repo and labelled as
authentic. The gate ran green over them for a day; green meant *not looked
at*. Two changes make the exemption safe: it is now a SENTINEL REGION of a
few lines rather than a file, and the region itself is scanned by a second
rule — `REGION_FORBIDDEN`, no proper name and no date — so the one place the
patterns do not read is structurally incapable of holding a disclosure. A
gate's fixtures must be SYNTHETIC: bare pronouns and bracketed placeholders
that exercise a pattern while asserting nothing about a real person. Anything
quoted from life is the leak, however good the reason for quoting it.

The general rule, worth more than this instance: **any scanner's exclusion
list is the first place to audit, because it is the only place the scanner
guarantees it is not looking.** Ask what an exclusion is load-bearing FOR,
then make it the narrowest thing that carries that load.

**A CI-blocking pattern that exists in more than one place is a deploy outage
waiting for someone to fix a false positive.** This list ended up in THREE
files — the tree gate, the history gate, and Quietkeep's deliberate offline
mirror — and the narrowing that §53 paid four deploys to learn reached exactly
one of them. The stale copies were not "slightly out of date": they were a
different gate, still carrying the pattern that stops releases. Fixed by making
GATE hub:privacy-patterns.mjs the one source that both hub gates IMPORT, and by
holding the one copy that must stay a copy to GATE
hub:privacy-mirror-check.mjs, which fails on any drift. The test to apply to
any shared rule: **if I narrow this to unblock someone, how many other places
keep the old behaviour, and what does each of them block?**

**A gate that quotes what it found republishes it.** Both this gate and its
Quietkeep test printed the matched sentence into the failure message. On a
public repo the Actions log is public, so every red run would have broadcast
the exact text the gate exists to suppress — to a wider audience than the file
did, and in a place nobody thinks to scrub. They now print `path:line` and
nothing else. The rule generalises past privacy: **a check that reports a
secret, a token, or a personal sentence must report its LOCATION, never its
VALUE.** The person fixing it has the file open anyway.

**And the history question now has an answer.** GATE
hub:privacy-history-check.mjs walks every commit reachable from every ref plus
every commit MESSAGE — a message being the one thing no later commit can clean.
It is deliberately NOT in CI: history does not change on a push, so a per-push
run measures nothing, and the only remedy is rewriting published history, which
is the owner's call. Two things it must be built knowing, both of which it got
wrong first: it has to skip regex-literal lines, or it reports every version of
the gate as a violation of itself; and it has to honour the sentinel region, or
it reports the gate's own synthetic probes. A history scanner that cries wolf on
the gate files is worse than none, because the one repo it is guaranteed to run
against is the one that contains it.

**What the gate cannot reach, said plainly: git history.** A pushed sentence
lives in old commits whether or not the tree is clean — the gate keeps the
PRESENT clean and makes the next violation loud at commit time, which is where
the recording reflex fires.

**And the history question is now CLOSED — this lesson is not an invitation to
re-open it.** Quietkeep's history was rewritten on the owner's word (2026-08-05, by
pattern, locations-only, verified against a fresh clone from GitHub). What
survives that is accepted. Both remaining remedies — making a repo private, and
asking GitHub Support to purge cached commits — are DECLINED, permanently and
in every repo. A session that finds residue records it and moves on.

Worth saying because the failure is specific and it is a documentation failure,
not a judgement one: the previous wording here ended "report it plainly,
with the options". A red history scan in an unvisited sibling would have read
as new, and the same two remedies would have gone back in front of the owner with the
same confidence. **A record that instructs a session to offer something is a
record that will keep offering it — so when a standing question is answered,
the answer belongs where the question was asked, not only in the log.**

*(Quietkeep and the hub, 2026-08-04; the history question closed 2026-08-05.)*

---
