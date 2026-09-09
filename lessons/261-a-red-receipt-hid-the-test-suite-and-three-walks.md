## 261 · A file-only gate went red and silenced the test suite and every browser walk, and the run still said "failure"

**Enforced by:** CHECKLIST read-the-step-list-not-the-verdict — a red CI run is
diagnosed by listing its steps and their conclusions, because `skipped` is
indistinguishable from `deliberately not run` in the summary a person sees. ·
CHECKLIST a-prerequisite-is-a-condition-not-an-order — a step needing a browser,
a build, or an install says so with `steps.<id>.outcome == 'success'`, never by
sitting after it. · JUDGEMENT — which gates are genuinely prerequisites of which.

**Smell:** a workflow where most gates carry `if: always()`/`!cancelled()` and a
few do not, with a comment explaining that the few "need" something earlier. A
run that fails in well under a minute on a pipeline whose walks take ten. A step
list full of `skipped`. Local and CI disagreeing about what was measured while
agreeing that something failed.

**2026-09-09.** A repo's CI ran about thirty gates in one job. Most carried
`if: ${{ !cancelled() }}` — added after an earlier incident where one red gate at
position 30 left seven below it `skipped` for several runs. The browser and build
steps deliberately did NOT carry it, with a comment saying they genuinely need
the chromium install or the build to have happened, and that running them anyway
would report a missing prerequisite as a gate failure.

**The reasoning is correct and the mechanism is step order, which cannot say it.**
Step 7 was a receipt check: does the accessibility stamp in the tree match the
markup being committed? It is a fact about a FILE. It went red on four
consecutive pushes, and each time it took down **twelve** steps — the typecheck,
the entire unit suite, the chromium install, the build, and all three browser
walks — because none of them carried the condition and all of them came after it.

**Every one of those runs was reported as `failure`, which is why nobody looked.**
Red was expected; red was correct; the receipt WAS stale. What the summary does
not say is that the release had no test run, no build, and no walk behind it. The
step list says `skipped` twelve times, and `skipped` reads as a decision somebody
made rather than as coverage that was lost.

**And the local runner disagreed silently.** The repo has a script that reads the
workflow and runs every step locally, deliberately continuing past failures the
way CI does — so locally all thirty ran and one was red. Locally and in CI the
VERDICT matched. What differed was the population, and nothing compares those.

**A second instance in the same run, from the same cause inverted.** A page-audit
gate needing a browser had been filed among the file-only gates and given
`!cancelled()`. On a run where the chromium install had been skipped it therefore
went ahead, launched, and failed with the "run npx playwright install" banner —
and its failure then stopped the build and the walks below it. The same step both
ran when it should not have and stopped what should have continued.

**The fix is to say the prerequisite instead of implying it.** The install and
the build get `id`s and `!cancelled()`, and each dependent step asks
`steps.chromium.outcome == 'success' && steps.build.outcome == 'success'`. That
refuses exactly when the prerequisite is missing and at no other time, so a red
receipt can no longer hide a broken walk. Ordering expresses "after"; only a
condition expresses "because of".

**The general shape.** In a long single-job pipeline, a gate's blast radius is
every step below it that lacks a condition — and that radius is invisible in the
one place people look. Ask of any gate: *if this goes red, what stops being
measured?* If the answer is "things it says nothing about", the ordering is doing
work the condition should do.
