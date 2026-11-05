# Hub notes

What a session working on the hub needs to know that no other file holds.

## Template-injection fix in two workflows (P-287, 5 November 2026)

- Tool: zizmor 1.31.1, installed from the hub's hash-pinned requirements file into a venv, run offline.
- Before, run with no config: `cf-analytics.yml` 28 findings, 23 shown and 5 counted as suppressed; `deploy-myfax.yml` 9 findings, 1 shown and 8 counted as suppressed.
- The suppressed ones are the auditor persona's. By rule, `cf-analytics.yml` held 1 more template-injection (a lower-confidence one at the command case), 1 anonymous-definition and 3 secrets-outside-env; `deploy-myfax.yml` held 1 anonymous-definition and 7 secrets-outside-env. The auditor persona's totals, 28 and 9, equal the plain runs' totals.
- After: both files show no finding at the gate's persona; the auditor persona shows no template-injection finding in either file, and the rest are the anonymous-definition and secrets-outside-env findings above, left because they are not template-injection and the scope was template-injection. Over the workflows folder with strict collection and no suppression, zizmor shows no finding and counts 21 as suppressed (the auditor-persona kind).
- Changed: each input used in a run block now comes through an environment variable and is quoted; the branch input in a checkout's ref and in the deploy action's command input sits outside any run block and was left as it was.

## Found queue

Findings recorded for the next plan (Doctrine §0e rule 2) are filed one to a file in `found/` at the hub root, each named by its key and holding its line (`found/Q-HUB-1.md`); a finding that was not put right and does not stop the plan it was found in gets a file there under the next free key, and a plan whose Files names the hub answers every file in a `## Found answered` section, one line each; `foundQueue` in hook-dispatch.mjs reads the folder where it exists and this section otherwise.
