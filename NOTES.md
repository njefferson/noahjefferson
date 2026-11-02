# Hub notes

What a session working on the hub needs to know that no other file holds.

## Found queue

Findings recorded for the next plan (Doctrine §0e rule 2) are filed one to a file in `found/` at the hub root, each named by its key and holding its line (`found/Q-HUB-1.md`); a finding that was not put right and does not stop the plan it was found in gets a file there under the next free key, and a plan whose Files names the hub answers every file in a `## Found answered` section, one line each; `foundQueue` in hook-dispatch.mjs reads the folder where it exists and this section otherwise.
