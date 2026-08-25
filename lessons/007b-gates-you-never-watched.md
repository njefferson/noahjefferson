## 7b · Gates you never watched

**Enforced by:** CHECKLIST watch-the-gate — after pushing, READ the CI run. A workflow that exits 0 is not evidence a step ran; a skipped step exits 0 too.

**Running the command locally is not the same as watching the gate.** Quietkeep's
CI workflow failed on **all four of its runs, every run since it was created**,
always on the first step — `npm ci` died with `EJSONPARSE` because `package.json`
had unescaped double quotes inside a script string. Meanwhile every session
verified the same code by invoking the tools *directly*
(`node --experimental-strip-types --test …`, `npx tsc --noEmit`), which bypass
`package.json` and pass. So the local check was green, the CI check was red, and a
commit message reading sat on a SHA with a
failing run attached. Every statement was individually true and the picture they
painted was false.

Three things fall out of it, all cheap:

- **If you cite a workflow as verification, open the run.** A gate nobody has
 watched pass is a file, not a gate — the same finding as the accessibility gate
 that had no `process.exit` in it, in a second place.
- **Exercise the entry point CI uses, not a shortcut around it.** `npm run test`
 and `node --test …` are not the same command; only one of them parses
 `package.json`.
- **`package.json` is executable configuration — validate it.**
 `python3 -c "import json;json.load(open('package.json'))"` costs nothing and
 catches the whole class.

*(Quietkeep, 2026-07-28 — found only because a rename touched `package.json` and
the failure finally surfaced locally. It had been red for a day.)*

**It happened again the same week this rule was written down, twice, in the two
repos that hold the rule.** Both are the same shape and neither needed anything
clever to catch — one API call would have done it.

- **photo-field-tools CI: red on its last three runs, unnoticed.** The
 `doctrine` job died on
 `Cannot find module '.../hub/pin-check.mjs'`. The job checks the hub out at
 its **default branch**, and the hub instruments it calls only existed on a
 working branch. Every gate had been run locally and passed; nobody opened the
 run. **A cross-repo gate depends on the OTHER repo's default branch, not on
 your working copy — landing the caller before the callee is red CI by
 construction.**
- **The hub's own `doctrine.yml` had never executed, not once.** It was written
 `on: push: branches: [main]` in a repo whose work happens on `claude/*`
 branches. So the workflow created *specifically to stop rules from being
 prose* was, itself, prose — a file that had never exited any code at all. It
 now also runs on `claude/**`.

**Ask of a new workflow: on which branch does this actually fire, and have I
seen it fire?** An unrun workflow and a missing workflow are the same artefact.
And after any push, list the runs — `actions_list` on the workflow, read
`conclusion` — before writing a sentence that implies the tree is green.
*(the hub and photo-field-tools, 2026-08-03 — found in a review of the
session's own diff, not by the gates.)*
