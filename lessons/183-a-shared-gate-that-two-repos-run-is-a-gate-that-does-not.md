## 183 · A gate that lives in the hub and runs in two repos is a gate that does not exist

**Enforced by:** GATE hub:.github/workflows/hub-gates.yml — every hub gate is
CALLED by a sibling rather than copied into it, so adding one adds it everywhere
that has bumped its pin. · CHECKLIST wired-means-run — "this repo runs the hub's
gates" is a claim about a workflow file, and the only way to check it is to read
that file and count. · JUDGEMENT — a gate switched on for the first time in an
old repo is expected to be red, and that redness is the measurement, not a
setback.

**Smell:** a map, a doctrine or a NOTES file that says a gate runs "in every
repo". Also: any per-repo list of what is wired, maintained by hand, in a family
where the gates themselves were deliberately never forked.

`REPOS.md` recorded that `privacy-check.mjs` and `quote-check.mjs` ran in every
repo, each having been watched going red on a synthetic plant. That was true.
The sentence next to it, that the branch guard was installed everywhere and
nothing was owed, was true too. What neither said was how many of the NINE hub
gates each repo ran, because nobody had ever counted, and the count was the
thing that mattered.

Counted on 2026-08-29, on the branch each repo actually works on:

- **3d-printing-pal, solve-ent** — six of nine.
- **intersecting-parallels, molebridge** — five. No `pwa-check`, both shipping a
  service worker.
- **quietkeep** — five, a different five. No `pin-check`, no `pwa-check`.
- **fauxplane, photo-pointer** — three.

`third-person-check.mjs` — the privacy rule's third half — ran in exactly two of
them. Switched on in the other five it found **110 sites**. Ten in MoleBridge
were the element helium; thirty-nine in photo-pointer were ingested
OpenStreetMap inscriptions and a vendored library's citation of its own author;
and **fifty-nine in fauxplane were real**, in comments in the shipped page, the
fusion filter, the version module, five test files and the design record. That
repo is public and carries the owner's name. The gate had existed the whole
time.

**The general shape, and it is not about privacy.** A shared check whose SOURCE
is centralised and whose WIRING is copied has been centralised in the half that
does not decide anything. The gates here were never forked, on purpose, and that
was treated as the problem being solved — while the workflow that invoked them
was pasted into eight repos and drifted exactly the way a forked file does. The
question "which gates does this repo run" had eight answers and no owner.

**Turning a gate on in an old repo is a measurement.** Five of seven were red on
something the first time the full set ran, and every one was a real defect: a
thirteen-row table nobody could read on the device it was written for, a
`package.json` with no lockfile and a `.gitignore` line putting it there, a
palette that cleared the colour floors at the pin CI used yesterday and fails
four of them at today's. None of those were caused by wiring the gate. All of
them were found by it.

**What a blunt pattern needs is a list, not a narrower pattern.** The
third-person gate matches a bare masculine pronoun because a narrower one cannot
see an attribution carrying no name, which is the entire half of the rule it
covers. In a chemistry app that pronoun is element 2 and in an aeronautical one
it is a runway's high end. The answer is `.third-person-allow` — declared per
file, checked BOTH ways so a scrub cannot quietly un-cover a file, and never
declarable for a reference to the owner. Weakening the pattern to fit the two
repos where it is noisy would have cost the fifty-nine in the third.
