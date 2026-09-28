# HANDOFF — rules and gates, from the session of 2026-09-28

**Read this first in any new session.** It carries an approved plan whose build
was cut short when the session ended, every finding it rests on, and what is
still owed. Update the status lines in place as work lands; delete this file
only when every gate below reads BUILT, gate 10 has run, and nothing under
"Other work still owed" is left.

## FIRST STEP OF EVERY NEW SESSION — the owner only presses approve

The gates below exist and are tested, but they switch on only when installed
into the session's own settings, and a container is rebuilt every session. A
session cannot install them unasked — Claude Code refuses it as
self-modification — and the environment setup script that would do it for
every session is not reachable from the tablet app. So:

1. The session's FIRST plan contains exactly this step: clone main, then
   install FROM THE CLONE, then the probe below.

       git clone --depth 1 https://github.com/njefferson/noahjefferson /root/.claude/hub
       node /root/.claude/hub/hook-dispatch.mjs --install

   Never install from the working copy: `install()` wires whichever copy runs
   it, and a broken edit in a working copy would then refuse its own fix. The
   plan is approved with the plan button. Nothing else is asked for.
   **Measured 2026-09-28, second session:** the install was allowed inside the
   approved plan, and the gates went live mid-session with no restart. The
   first ordinary call after it was refused, and so was the probe.
2. **Probe, harmless whether the gates are live or not:** write a file in the
   session scratchpad. With the gates live, it is refused until the next plan
   is approved (approved-plan-guard); a refusal is the proof. Never probe with
   a Drive search: if the gates were dead, it would search the owner's Drive.
3. If the install is refused even after approval, say so to the owner in one
   line, record the result here and in LESSONS §370, and carry on — never send
   the owner to a settings page.

## The root cause, measured

**None of the owner's hooks ran for the whole session.** The session was
launched in `/home/user`, the parent of both repos, which has no
`.claude/settings.json`. Claude Code loads project hooks only from the launch
directory. The transcript's Stop records show 543 Stop events, and every one
ran exactly one hook: the cloud environment's own
`~/.claude/stop-hook-git-check.sh`, wired from
`/root/.claude/launcher-settings.json`. `stop-guard` ran zero times, and so did
`plan-guard`, `ident-guard`, `harness-guard`, `ledger` and the session brief.
Every failure below had either a gate that could not fire or no gate at all.

The hub's CLAUDE.md already recorded this exact failure for `branch-guard` ("a
session rooted in a PARENT directory never fires"). It was true of every hook.

## The rules (2026-09-28) — each one broken in that session

1. **Tell the owner in the first line, all during the work, and at the end.**
   The first line says what is being done now and what comes next. During the
   work, each step says what it is, what it found in plain terms, and what that
   means. Anything long says how long it takes and the clock time of the next
   report. At the end: what was done, what was not, what was found and not
   fixed, and what is open for the owner. Process noise with no finding in it
   is not telling.
2. **A status at least every five minutes during any work**, saying what is
   done, what is running, what is next and when the next status comes. Hours
   of work with no idea when the next report arrives is the silence the owner
   means; "Working…" with nothing under it is the same thing.
3. **No app notifications, ever.** Statuses go in chat and on the status page.
4. **Reply to every point in a message from the owner.** Skipping part of it
   is ignoring it. A message saying something was done wrong is a
   full stop: answer it, and nothing else runs in that turn.
5. **Plan mode only.** Nothing runs outside a plan the owner approved. Before a
   plan goes up, one chat turn says what is being done and why, and asks
   nothing. It never pastes the plan's text: the owner reads the plan in the
   plan, and a copy in chat has nothing in it about the work. After the owner's
   reply, the next turn ends with ExitPlanMode. Approval is only the plan-mode
   button. (Doctrine §0e rule 4; `plan-guard.mjs` talk-first; `stop-guard.mjs`
   refuses a reply asking for approval in chat.)
6. **A line before each tool call and a line after each result.**
7. **Never "waiting on you", never "you owe".** Say "open for you:".
8. **A limit is reported only after every route available was tried**, with the
   failed attempt named. The session told the owner a private Drive folder
   could not be read, without trying the Drive connector's own download, which
   then worked first time.
9. **A defect of the session is a bug**, never framed as the owner's preference
   or "your rule".
10. **When the harness reports ultracode off, the first line of the next reply
    says so.** The session silently dropped work when it went off. **And on
    2026-09-28 the harness twice reported ultracode off while it was on.**
    That notice is a harness bug. When it appears, the first line says so and
    the work continues with ultracode on.
11. **Questions to the owner are real decisions only** — never something the
    record already ranks, never research handed back.
12. **Infrared first.** A white-balance test that moved only the red and blue
    sliders with green fixed is a visible-light model, and was rejected.
    In this app a neutral's colour is set by the per-photosite black level,
    the lens profile's colour, gray-world's THREE gains, the look's 3x3 mixer
    (the swap and the infrared subtraction), its tint, its per-channel curves
    and its grade wheels — see IR-SCIENCE.md sections 3, 4c and 6.
13. **Search the whole codebase before saying a name is real or invented.**
    The session told the owner a look field (`wbBias`, `src/main.ts`) did not
    exist, from a search that covered five files and left `main.ts` out. A
    partial search reported as a fact is the defect, in either direction.

14. **Look at everything from the owner's side.** Never hand the owner a step
    a session can do. Anything asked of the owner is only what only they can
    do, doable in the tablet app with a tap or a reply — an approve button, a
    one-word answer. Never directions to settings, a menu, a setup script, a
    permission rule or an install. Try every route first. Refused by
    `stop-guard.mjs` (shape 5); the judgement no pattern sees stays here.

## The gates — the approved plan, with build status

Each gate is made to fail once on a planted payload before it is trusted.

- **1. `hook-dispatch.mjs`** — BUILT (d578392), planted: install, write refusal outside a plan, reads pass, Stop runs once, the post-compaction tool list prints. Wired once at user level
  by the environment's setup script, so it fires however a session is rooted.
  Per event it runs the hub's family guards, then each touched repo's own
  `.claude/settings.json` hooks with `CLAUDE_PROJECT_DIR` set to that repo.
  Touched repo: the one holding the edited path, or the Bash working directory;
  every repo for pathless tools. Skips the repo that is the launch directory.
  First deny wins. A crash in PreToolUse refuses everything but reads. Runs
  from a stable clone at `/root/.claude/hub`, never the working copy.
  `--install` writes `~/.claude/settings.json`. **Fixed 6592f28:**
  - a family guard that crashed was read as a pass, and now refuses every
    non-read;
  - `--mark`'s outcome was discarded, and is now passed to the session;
  - the report exemption matched a `report.mjs` anywhere, and now matches only
    the hub's own;
  - `--install` keeps the clear-context-on-accept option off, since that
    approval route mints no marker.
- **1a. report-clock** — BUILT (`report.mjs`, d578392), planted 4 of 4. `report.mjs "<status>"` stamps the time.
  PreToolUse refuses every call (reads too) once five minutes pass since the
  last stamp, measured from the owner's last message; `report.mjs` itself is
  exempt, and so are subagent calls (payload `agent_id`).
- **2. approved-plan-guard** — BUILT, and its approval half WORKS since 5c3b094.
  It was planted only on its refusal side and never recognised an approval.
  `--mark` matched two phrases that exist only in the sentence shown to the
  session, never in the result object the hook is handed, so no approval ever
  wrote a marker and every write after every approval was refused.

  It now reads the result's `filePath`, planted 21 ways, and a real approval
  wrote the marker on 2026-09-28. **Fixed 2566674, found by the review of that
  fix:**
  - a forgeable `--done` exception;
  - a crashing classifier read as a pass;
  - an unreadable plan file that crashed the check;
  - edits to the approved plan, which voided it in silence;
  - approvals that were not tied to a session.

  A refusal now says the action is not a recognised read, and quotes why.
- **3. plan-guard, talk-first** — BUILT (efb9a93), planted both ways. ExitPlanMode refused unless, since
  the last rejected ExitPlanMode or the last EnterPlanMode, a turn ended in
  assistant text and a genuine owner message followed it. **Fixed 4ae8731:** a
  gate's own refusal of ExitPlanMode is recorded with the same denial kind as
  the owner's rejection, so it was counted as the owner's answer, and every
  gate refusal cost the owner a message. It is now told apart by its content.
- **4. plan-guard, plan-names** — BUILT (efb9a93), planted: an invented name is refused, a real one and a "(new)" one pass. It searches code only, since a name the docs merely mention is not one that exists. Every code-formatted name in a
  plan must exist in a session repo, or in a tool RESULT this session read, or
  be marked "(new)". Absolute paths and tokens with spaces are skipped.
  **Fixed 4ae8731:** a name written as a call is looked up by its name. Also
  fixed in 4ae8731:
  - reads with a pipe inside their quotes, and `git -C`, were refused in plan
    mode;
  - `env`, `find -exec` or `-delete`, `sed -i` or `w`, and `sort -o` were
    passed as reads;
  - ExitPlanMode checked the newest file in the plans directory rather than the
    plan the harness passes.
- **5. drive-guard** — BUILT (d578392), planted 9 of 9, including the owner's own title search passing. Refuses `list_recent_files`, any `fullText`
  search, and any search not scoped by a `parentId` that is in
  `tools/owner-images.json` or appeared in an earlier tool result, or by an
  exact `title =` found in the owner's latest message. Refuses Drive writes
  (create, update, share, trash, copy). Downloads pass only for ids in the
  index or seen in an earlier tool result.
- **6. stop-guard** — BUILT (d578392, wording ac7c0e2), planted 4 of 4. Adds a third shape: refuses "waiting on you",
  "waiting for you" and "you owe", declaration or not. Its instructed escape
  wording changes from "Stopping here, waiting on you for X" to "Stopping here:
  open for you is X". **Added 0eb20b4:** a reply that asks for a plan's
  approval in chat is refused, declared stop or not.
- **7. compact-brief** — BUILT inside `hook-dispatch.mjs`, planted on this session's transcript. SessionStart with `source: compact` prints
  every tool name used earlier in the session, with counts, so a capability
  cannot drop out of the compaction summary (the Drive connector's download
  did).
- **8. UserPromptSubmit reminder** — BUILT inside `hook-dispatch.mjs`. Injects rules 1, 2 and 4 on each
  owner message.
- **9. Drive fetch methods in `tools/owner-images.mjs`'s header** (JPS) —
  BUILT on JPS branch `claude/relaxed-bardeen-vlwm3g` (d120f4d). The direct link works only for link-shared folders; otherwise the
  connector's `download_file_content`, whose oversized result the harness
  saves to a file: `jq -r .content FILE | base64 -d > OUT`.
- **10. Adversarial review** — RUN 2026-09-28, second session.
  - **Shape:** one reviewer per gate file, ten files across both repos. Then one
    skeptic per finding, told to refute it by running it. That is the owner's
    original shape; three skeptics each would have taken hours at this
    container's limit of two workflow agents at a time.
  - **Result:** 24 findings. 20 confirmed and fixed in one round, each planted
    against old and new code (hub 4798cc9, b24149e, 4859df0, eae5380, a062c3d,
    90089df, 9eae69d; JPS f5f0e29, 74497ca).
  - **4 refuted:**
    - an install over an unparsable settings file: the route never arises;
    - the report clock's 4 MB tail: unreachable once any status exists;
    - plans-directory writes: by design;
    - a mid-turn owner message in an attachment shape that never occurs.
  - **Found and NOT fixed** (reviewed, no skeptic yet, or larger than one
    round):
    - **harness-guard:**
      - a scratch script run after a `cd` in an earlier call, through a
        shell variable, with a flag value, or inside `bash -c` is never
        checked;
      - a harness printing its control through a call with parentheses, a
        constant, stderr or `process.stdout.write` is refused, while a
        commented-out one passes;
      - any node script under the scratchpad counts as a measurement, and so
        does a node command merely quoted in text.
    - **plan-guard, only its false-refusal half.** The write-bypass half was
      NOT reviewed: its reviewer was stopped by a safety classifier twice.
      Four false refusals:
      - the name check finds no repos when the project directory sits above
        them;
      - a `#` comment inside a code fence, or a `---` inside a plan, cuts off
        the checked block;
      - `path:line` spans and names in superseded plans are refused;
      - common reads are refused (`sed -nE`, `git branch --show-current`,
        `git tag -l` with a pattern, `git remote get-url`, and others).
    - **ledger:**
      - output of a command that failed is never recorded, since PostToolUse
        does not fire on failure, so a SHA read that way is refused and
        re-reading loops;
      - trimming races with concurrent appends and drops entries.
    - **drive-guard:** the 8 MB transcript tail forgets a listing. The fix is
      a per-session record, which is larger than one round.
    - **approved-plan-guard:** a marker name assembled from pieces inside the
      shell rewrote the marker under an approved plan. No string check can
      see that; it rests on Doctrine §0e.
    - **transcript-tail:** an owner message typed mid-turn is recorded only as
      a queue-operation entry, which the owner-message reader does not see.
      A skeptic found this while refuting another finding; it is not yet
      reviewed.

## Found while building, and fixed or recorded

- **Both repos' `plan-guard.sh` shims refused every plan-mode call, reads
  included** — `printf … | exec node` replaces only a pipe's subshell, so the
  script ran on into its no-gate branch. Invisible while no hook ran. Fixed in
  the hub (efb9a93) and on the JPS work branch (d120f4d); JPS `main` still has
  the old shim until that branch merges.
- **`wbBias` is real** (`src/main.ts`, a look's white-point gain). The session
  told the owner it was invented, from a search of five files; rule 13 above.
- **Two lines of attribution were pushed** before the privacy
  gate caught them — `HANDOFF.md` at 6fbf41c and `stop-guard.mjs` at d578392.
  The tree was fixed in ac7c0e2; those two commits still carry the lines in
  history. The hub's own commit hook did not run `privacy-check.mjs`, which
  is how they got through; it does now (`also=privacy-check.mjs`), and a
  planted attribution was refused at commit.
- **Found and fixed 2026-09-28 (second session):**
  - **The ident guard read seven hex letters inside an ordinary word as an
    identifier** and refused the call. It now counts a hex run only as a whole
    word, while every SHA shape is still caught. JPS 1f28aa8, on the JPS
    session branch `claude/approved-plan-guard-marker-fix-37tcwa`, not yet on
    JPS main.
  - **Measured: a hook's refusal of a tool is recorded with the same
    `toolDenialKind` as the owner's own rejection** ("permission-rule"). Only
    the content, which opens "PreToolUse:<Tool> hook error: [", tells them
    apart. That is why talk-first counted gate refusals as answers.
- **Session defects of 2026-09-28, second session, now in Doctrine §0e:**
  - It pasted a whole plan into chat instead of saying what it was doing
    (rule 4).
  - Five statuses in a row carried estimated times, forty minutes off the
    clock (rule 2). It happened again an hour later in the same session, up
    to ten minutes ahead, and was caught only because a plant printed the
    clock. `report.mjs` now writes the clock's time into every status
    (b24149e).
- **Found and NOT fixed:** LESSONS §369 cites JPS `tools/owner-images.mjs`,
  which exists only on the unmerged JPS branch `claude/relaxed-bardeen-vlwm3g`.
  So `lessons-check.mjs` fails wherever JPS is checked out beside the hub. CI
  does not see it (there the citation reads as unverified). Merging that
  branch is the remedy.

## The setup script — not reachable from the tablet app

Kept for a session that can reach an environment's settings some other way.
These lines in the setup script would install the gates in every session. The first new session proves it: its Stop records list more
than one hook, and a planted Drive search is refused.

    mkdir -p "$HOME/.claude"
    if [ -d "$HOME/.claude/hub/.git" ]; then git -C "$HOME/.claude/hub" pull --ff-only; else git clone --depth 1 https://github.com/njefferson/noahjefferson.git "$HOME/.claude/hub"; fi
    node "$HOME/.claude/hub/hook-dispatch.mjs" --install

## What the research workflow measured (for building the gates)

- **Genuine owner message**: a `user` entry with no `tool_result` block, not
  `isMeta`, `origin.kind` "human". The 160 "Stop hook feedback" entries are all
  `isMeta`.
- **ExitPlanMode results**: approved content starts "User has approved your
  plan"; the common rejection is `is_error: true` with
  `toolDenialKind: "permission-rule"` and the owner's text as the whole
  content; a rarer one starts "The user doesn't want to proceed with this tool
  use"; `toolDenialKind: "cancelled"` is not a rejection. EnterPlanMode's
  result starts "Entered plan mode". The `type: "mode"` entries do NOT record
  plan mode; `permissionMode` on user entries does.
- **Mid-turn text** is recorded for some messages only: of 7,400 messages that
  follow a tool result and call a tool, 2,253 carry text. A gate cannot rely on
  reading chat text; report-clock uses its own stamp for that reason.
- **The transcript is over 512 MB.** Never read it whole; stream or read a
  tail.

## Other work still owed

- **069 (cloud cyan under Aerochrome's sky stages).** On the owner's raws with
  the lens fix: NIR_1651.NEF's cloud arrives at saturation 0.08–0.10 with the
  clear sky's hue (171–174) and leaves the sky stages at 0.29–0.38;
  NIR_1661.NEF's wisps go 0.20 to 0.69; NIR_3461.NEF's thick cloud stays at
  0.03; NIR_3466.NEF's wisps go 0.05 to 0.11. The record's option 10 and
  Rejected 9 rest on NIR_1644 (a practice copy only) and NIR_3406 (not in the
  owner's set) and must be corrected and labelled. The next test traces the
  cloud, clear sky, foliage and a neutral away from the sky through every
  pipeline stage, in order, on the seven raws in the owner's set that 069
  names, moving no setting.
- **071 (Firefox build 44 s).** The owner's PC reading from the test page's
  "What makes the picture code slow to build" button is pending.
- **The CLAUDE.md and DOCTRINE text for the rules above** was refused to the
  session as self-modification; if it is refused again, it goes to the owner
  as one paste block.
