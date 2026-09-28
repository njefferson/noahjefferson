# HANDOFF — rules and gates, from the session of 2026-09-28

**Read this first in any new session.** It carries an approved plan whose build
was cut short when the session ended, every finding it rests on, and what is
still owed. Update the status lines in place as work lands; delete this file
only when every gate below reads BUILT and the owner has run the setup block.

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

## The rules (owner, 2026-09-28) — each one broken in that session

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
4. **Reply to every point in the owner's message.** Skipping part of it is
   ignoring the owner. When the owner says something was done wrong, that is a
   full stop: answer it, and nothing else runs in that turn.
5. **Plan mode only.** Nothing runs outside a plan the owner approved. Talk the
   plan through in chat before proposing it; a plan proposed without discussion
   is refused by the owner.
6. **A line before each tool call and a line after each result.**
7. **Never "waiting on you", never "you owe".** Say "open for you:".
8. **A limit is reported only after every route available was tried**, with the
   failed attempt named. The session told the owner a private Drive folder
   could not be read, without trying the Drive connector's own download, which
   then worked first time.
9. **A defect of the session is a bug**, never framed as the owner's preference
   or "your rule".
10. **When the harness reports ultracode off, the first line of the next reply
    says so.** The session silently dropped work when it went off.
11. **Questions to the owner are real decisions only** — never something the
    record already ranks, never research handed back.
12. **Infrared first.** A white-balance test that moved only the red and blue
    sliders with green fixed is a visible-light model; the owner rejected it.
    In this app a neutral's colour is set by the per-photosite black level,
    the lens profile's colour, gray-world's THREE gains, the look's 3x3 mixer
    (the swap and the infrared subtraction), its tint, its per-channel curves
    and its grade wheels — see IR-SCIENCE.md sections 3, 4c and 6.
13. **Never invent a name.** A function name that exists nowhere in the code
    (`wbBias`) reached a plan after a context compaction.

## The gates — the approved plan, with build status

Each gate is made to fail once on a planted payload before it is trusted.

- **1. `hook-dispatch.mjs`** (hub, new) — NOT BUILT. Wired once at user level
  by the environment's setup script, so it fires however a session is rooted.
  Per event it runs the hub's family guards, then each touched repo's own
  `.claude/settings.json` hooks with `CLAUDE_PROJECT_DIR` set to that repo.
  Touched repo: the one holding the edited path, or the Bash working directory;
  every repo for pathless tools. Skips the repo that is the launch directory.
  First deny wins. A crash in PreToolUse refuses everything but reads. Runs
  from a stable clone at `/root/.claude/hub`, never the working copy.
  `--install` writes `~/.claude/settings.json`.
- **1a. report-clock** — NOT BUILT. `report.mjs "<status>"` stamps the time.
  PreToolUse refuses every call (reads too) once five minutes pass since the
  last stamp, measured from the owner's last message; `report.mjs` itself is
  exempt, and so are subagent calls (payload `agent_id`).
- **2. approved-plan-guard** (exists in the hub) — run by the dispatcher on
  PreToolUse and on PostToolUse `--mark`. The staged, unwired JPS shim
  `.claude/hooks/approved-plan-guard.sh` is to be deleted.
- **3. plan-guard, talk-first** — NOT BUILT. ExitPlanMode refused unless, since
  the last rejected ExitPlanMode or the last EnterPlanMode, a turn ended in
  assistant text and a genuine owner message followed it.
- **4. plan-guard, plan-names** — NOT BUILT. Every code-formatted name in a
  plan must exist in a session repo, or in a tool RESULT this session read, or
  be marked "(new)". Absolute paths and tokens with spaces are skipped.
- **5. drive-guard** — NOT BUILT. Refuses `list_recent_files`, any `fullText`
  search, and any search not scoped by a `parentId` that is in
  `tools/owner-images.json` or appeared in an earlier tool result, or by an
  exact `title =` found in the owner's latest message. Refuses Drive writes
  (create, update, share, trash, copy). Downloads pass only for ids in the
  index or seen in an earlier tool result.
- **6. stop-guard** — NOT BUILT. Adds a third shape: refuses "waiting on you",
  "waiting for you" and "you owe", declaration or not. Its instructed escape
  wording changes from "Stopping here, waiting on you for X" to "Stopping here:
  open for you is X".
- **7. compact-brief** — NOT BUILT. SessionStart with `source: compact` prints
  every tool name used earlier in the session, with counts, so a capability
  cannot drop out of the compaction summary (the Drive connector's download
  did).
- **8. UserPromptSubmit reminder** — NOT BUILT. Injects rules 1, 2 and 4 on each
  owner message.
- **9. Drive fetch methods in `tools/owner-images.mjs`'s header** (JPS) — NOT
  BUILT. The direct link works only for link-shared folders; otherwise the
  connector's `download_file_content`, whose oversized result the harness
  saves to a file: `jq -r .content FILE | base64 -d > OUT`.
- **10. Adversarial review workflow** over the dispatcher and gates before the
  commit that switches them on.

## The owner's one manual step — setup script (after gate 1 is BUILT)

Cloud environment menu in the session title bar, then Edit, then Setup script.
Add these lines. The first new session proves it: its Stop records list more
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
