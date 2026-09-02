## 162 · A filtered API query served stale results, agreed with itself three times, and a session reported a production outage that was not happening

**Read with §161, which is the true version of what this session believed it had
found.** There, two pushes genuinely created no run and the list's newest green
tick belonged to the commit before them; its checklist — find the run whose
`head_sha` IS the pushed commit — is right and is what was attempted here. This
lesson is the failure mode INSIDE that check: the listing you search for that SHA
can itself be stale, so "no run for this SHA" is a finding to corroborate with a
second instrument, not a conclusion.

**Enforced by:** CHECKLIST vary-the-instrument — when a check reports something
that contradicts a fact already established by other means, change the
INSTRUMENT before believing the finding. Not the timing, not the retry count.
Three consistent readings from one instrument are one reading. · JUDGEMENT — no
gate can tell a stale answer from a fresh one; that is the whole difficulty.

**Smell:** a query with a filter on it, disagreeing with something you already
verified another way. Ask what the same source says with the filter removed. If
the two disagree, the filter is the story.

A promote was pushed to `main` and verified against the true remote with
`ls-remote`, which passed. The GitHub API was then asked for that repository's
workflow runs with `branch: main`. It returned eight runs, newest being the
PREVIOUS promote — no run for the commit just pushed. Asked again five minutes
later: same eight. Asked a third time after another push: same eight.

The same API, same credential, seconds later, with **no branch filter**,
returned thirty runs including both of the pushes the filtered call insisted did
not exist. Both had run. The second had deployed, and its own log showed the
live page serving the new release.

**A stale answer is worse than an error, because an error stops you.** This came
back well-formed, complete and plausible, and it agreed with itself across three
calls spread over ten minutes. That consistency is what "I have checked" feels
like from the inside, and it is worth nothing: repeating one call is not
corroboration, it is the same measurement again.

**The session then acted on it, and the action cancelled the thing that was
working.** The first run was live while the query reported it absent. A second
push, made as a remedy, cancelled it — `concurrency: cancel-in-progress` doing
exactly its job — and started a run that deployed. Left alone, the first would
have deployed on its own. Nothing was broken; the fix created the only real
artefact of the whole episode, which was a written incident report describing an
outage that never happened, promoted to production carrying that description.

**A false incident report in a repository's history is a real defect.** It
teaches every later reader the wrong thing about a system that was working, and
it is harder to spot than a missing one because it looks like diligence.

The general form is broader than an API. Any indirect view — a cached listing, a
dashboard, a local remote-tracking ref, a mirrored file, a summarising tool —
can be confidently, repeatably wrong while the thing it describes is fine. Same
family as §143's stale clone, arriving through a different door: there the local
refs went stale with the tree, here the answer went stale inside the service.
**Read the primary source, and when you cannot, read a DIFFERENT secondary one.**
