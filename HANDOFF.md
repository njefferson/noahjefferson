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
4. **Before the install, every repo's working tree must carry a working
   `plan-guard.sh`** (measured 2026-09-29). The dispatcher runs each repo's own
   hooks from its working tree on every event. A tree holding the old shim
   refuses every plan-mode call once installed, and that includes
   ExitPlanMode. JPS `main` has the old shim until relaxed-bardeen's fix
   merges, so check JPS out on a branch carrying the fix first.
   `claude/laughing-edison-x0pdv8` carries it.
   **Then plan twice.** A plan approved before the install minted no marker,
   so the first write after it is refused (the probe), and the work goes up
   again as the next plan. The ledger also starts empty at the install, so
   the first command after that approval re-reads every SHA the plan cites.

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
    In this app a neutral's colour is set by the black level (one number: the
    four per-site values in MakerNote 0x3D averaged; they read 1008 on all
    seven owner raws traced 2026-09-29, so nothing is lost on those),
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
  - a family guard that crashes refuses every non-read;
  - `--mark`'s outcome is passed to the session;
  - only the hub's own `report.mjs` is exempt from the report clock;
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
  - the `--done` exception is granted only on its real condition;
  - a classifier that crashes refuses;
  - an unreadable plan file is refused with its reason;
  - an edit to the approved plan voids it, and the refusal says so;
  - an approval counts only in the session that gave it.

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
  - reads with a pipe inside their quotes, and `git -C`, pass in plan mode;
  - every command that can write, in any of its forms, is treated as a write;
  - ExitPlanMode checks the plan the harness passes.
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
  - **Found and NOT fixed, written as the outcome each gate still owes**
    (LESSONS §371: gate work is written as outcomes, never as routes past a
    gate). Reviewed with no skeptic yet, or larger than one round:
    - **harness-guard owes:**
      - every scratchpad measurement script is checked for its made-to-fail
        block whenever node runs it, however the command reaches it;
      - a block printed in any ordinary way passes, and a block that is only
        a comment does not;
      - only a script actually run as a measurement is gated.
    - **plan-guard owes, on its refusal side** (four false refusals measured):
      - plan names are checked against the session's repos wherever the
        project directory sits;
      - the whole top block of a plan is checked, whatever it contains;
      - `path:line` spans, and names in superseded plans, pass;
      - every read-only command passes in plan mode. Measured refused:
        `sed -nE`, `git branch --show-current`, `git tag -l` with a pattern,
        `git remote get-url`, and, on 2026-09-29, a read beginning with `cd`.

      Its other side, that every write in plan mode is refused, has NOT been
      reviewed: the review of it was stopped twice before it returned.
    - **ledger owes:**
      - a value printed by a command that failed counts as read, so reading it
        again ends the refusal;
      - trimming never loses an entry appended at the same moment.
    - **drive-guard owes:** a folder listing counts as seen for the whole
      session, not only while it sits in the transcript's last 8 MB. The
      remedy is a per-session record, larger than one round.
    - **approved-plan-guard owes:** the approval marker changes only when an
      approval is recorded. No string check can promise that alone; it rests on
      Doctrine §0e.
    - **transcript-tail owes:** an owner message typed mid-turn counts as an
      owner message. A skeptic found this while refuting another finding; it is
      not yet reviewed.

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
    word, while every SHA shape is still caught. JPS 1f28aa8, with its two
    companions, has been on JPS main since 2026-09-29: PR 178, rebase-merged
    as 11df7b7. That head's Gates run and deploy were read green.
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
- **Session defects of 2026-09-29, before the gates were installed:**
  - Three statuses carried estimated times, 02:12 to 02:17, while the clock
    read 02:07 (rule 2). Every time since has been read from the clock.
  - Two writes happened in plan mode, both in the scratchpad and outside
    both repos. A read command also saved a copy of IR-SCIENCE.md, and a
    read-only agent saved copies of five source files. Once the gates were
    live, both were refusals.
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

- **069: DONE 2026-09-29.** The trace ran on the seven owner raws, through
  every stage, with nothing moved. Option 10, Rejected 9 and Rejected 10 are
  labelled by what each file was and corrected on the owner's files. It is
  JPS 1146b21 on `claude/laughing-edison-x0pdv8`, the relaxed-bardeen commits
  plus this record.
  - **The result.** On every frame the white point leaves cloud and clear sky
    on one side and foliage and a road on the other. Dense cloud is left near
    neutral and stays white on four of six frames with cloud. A cloud goes
    cyan only where it is left off neutral and arrives above 019's saturation
    gate: NIR_1651's band and NIR_1661's wisps. The look's mixer amplifies the
    ground side, and NIR_3466's road renders maroon.
  - **Still open in the record:** option 10's white-point renders and option
    9's two forms, on the owner's files.
- **071 (Firefox build 44 s): the readings arrived 2026-09-29.** On the home PC
  (Firefox, Direct3D 11 on a GTX 980) the build takes 45.4 s as shipped, 45.3 s
  with loop counts hidden, 0.79 s without the mask loops and 0.67 s with both.
  On the work PC (Chrome, software rendering) it takes 18 ms however the code
  is built. They go into record 071 under their own plan. The same plan takes
  a question the readings cannot settle: whether a cached launch is slower
  than a first visit while an update downloads. That needs one machine timed
  three ways.
- **"Bold Pink", asked for 2026-09-29.** A preset from the trace's tone-curve
  step: Aerochrome with the HSL mixer neutral and Sky colour smoothing and Sky
  saturation off. Its own plan: render it on the seven raws and show it,
  write the record, build it, and push it to staging for the device pass.
- **The CLAUDE.md and DOCTRINE text for the rules above** was refused to the
  session as self-modification; if it is refused again, it goes to the owner
  as one paste block.
