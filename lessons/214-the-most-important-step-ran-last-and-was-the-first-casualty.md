## 214 · The most important step ran last, so it was the first thing sacrificed — and nothing read the file could see it

**Enforced by:** GATE unlisted-app:tools/worker-check.mjs — asserts the
ORDER, not just the outcome: the backup's write must happen before the job's
first network fetch, a missing bucket is a reported error rather than a quiet
skip, a failure carries its reason, and the record of the last SUCCESS
survives a failure. · CHECKLIST protect-the-irreplaceable-first — in any job
that both preserves something and does expensive work, the preserving step
goes first; whatever the invocation runs out of, the thing you cannot rebuild
is already written. · JUDGEMENT — which step in a job is the irreplaceable one
is specific to the job, and no gate can identify it.

**Smell:** a scheduled job whose steps are ordered by narrative — tidy up,
then do the work, then save a copy — rather than by what survives being cut
short. Also: any promise made to users in prose ("backups are kept for thirty
days") with no assertion anywhere that the thing exists.

**The unlisted app, 2026-09-02.** The privacy page had promised nightly
snapshots with thirty-day retention since the first deploy. The bucket was
empty. Not one snapshot had ever been written.

**The code was correct.** Invoked on demand it produced a valid 96 KB object
first try. The defect was entirely positional: the snapshot was the last thing
in the nightly job, after housekeeping and — once ingestion was added — after
fetching every source across thirty-odd requests. Whatever limit that
invocation reached, the backup was what got cut, and it failed inside
`ctx.waitUntil`, where a rejected promise surfaces nowhere.

**Two independent things had to be true for this to be invisible for the life
of the app.** The step was last, so it was reachable only if everything else
succeeded. And its failure was silent, so nothing recorded that no backup had
been taken. Fix either one and it surfaces in a day.

**The general form.** Order is not a property of any function, so a gate that
reads functions cannot see it — the same family as §212, where the file was
right and the host made it wrong. Ask of any scheduled job: if this is cut off
halfway, what did we lose that we cannot rebuild? Put that first. Then make it
say so when it fails: a step that records `last_run` and, separately,
`last_successful_run` turns "we have no idea" into "protection goes back to
Tuesday", and a failure that overwrites the success record throws away the only
number that mattered.

**And a tool caution from the same hour.** `wrangler r2 object get` reported
"The specified key does not exist" for an object that demonstrably existed —
confirmed present, to the byte, through the provider's own API on the same
account and bucket. A CLI's absence answer is not evidence of absence; check a
second way before concluding a thing is missing, especially when concluding it
would be alarming.
