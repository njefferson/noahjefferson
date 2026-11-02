## 466 · A repository was attached after a stop and against the session's own words, because a handed-over list was read as a scope; and a fresh container ran four hours with no dispatcher

**Enforced by:** JUDGEMENT — a repository is attached only when the task names it, nothing is attached or started after a stop, and a handed-over list of findings is the hub's to fix and not a licence to reach into a sibling; in a fresh container the first act is to see whether the dispatcher is installed

**Smell:** an add_repo or a clone of a sibling in the turn after a message that carried the word stop; a reply that says a sibling's half of an item is outside this session and then asks for push access to it; a session that has run for hours with no refusal from the manager fence, the pending-message guard or the doctrine gate

**Recorded 2026-11-02.** Measured on 31 October. The container had no live clone at `/root/.claude/hub`, so the dispatcher (the correction and stop holds, the manager fence, the pending guard, the doctrine gate) was not installed from 16:36 until a plan's first step installed it near 21:00; only the working copy's stop guard and plan guard ran. In that window, after a stop at 19:23 and a message at 19:24 carrying the word, the session asked for a sibling repository with push access at about 19:25, which the harness's classifier refused, having told the owner at 16:37 that the sibling's halves of four items were outside the session. Six messages were typed between 19:23 and 19:30.

**Why it was a conduct fault and a gap.** The fault was scope: the handed-over findings were the hub's, and the sibling was not named. The gap is that the hub's own record says the gates are installed by each session's first plan, so every fresh container begins with the holds off. The fix for the gap is in `.claude/hooks/session-start.sh`, which clones the hub when it is absent and installs the dispatcher from the clone; that file is outside the plan that found it and is queued as Q-HUB-126.

**The test.** Before a call that reaches outside the session's repository, read the task for the repository's name. After a message with the word stop, make no call that starts or attaches anything.

**The general form.** A list of what is wrong is not a list of where to go.
