#!/bin/bash
# Doctrine §11c, made mechanical. A rule in a file did not stop this happening a
# fourth time; a Stop hook runs whether anything was remembered or not.
# Canonical script: noahjefferson/stop-guard.mjs — never fork it.
#
# FAILS OPEN ON PURPOSE when the hub is not checked out. A guard that blocks
# every turn because a sibling repo is missing gets switched off within a day,
# and a switched-off guard is worse than none. The session brief already says
# loudly when the hub is absent.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
# WHERE THE DISPATCHER IS WIRED THIS SHIM STANDS ASIDE. The dispatcher runs stop-guard.mjs once on the main thread, and a session
# started in the hub reads this shim too, so running the guard here would print a refusal twice. Where the user-level settings do not
# name hook-dispatch.mjs, nothing else runs the guard, so the shim runs it.
HOOK_SETTINGS="${HOOK_DISPATCH_SETTINGS_FILE:-$HOME/.claude/settings.json}"
if grep -qs 'hook-dispatch\.mjs' "$HOOK_SETTINGS"; then exit 0; fi
[ -f ../noahjefferson/stop-guard.mjs ] || exit 0
exec node ../noahjefferson/stop-guard.mjs
