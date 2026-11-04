#!/bin/bash
# Printed into every session, because everything below was already written down
# and none of it was being read. See session-brief.mjs for why this exists.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

# The gates run from a clone of the hub, and in a fresh container it is absent until a plan's first
# step puts it there, so the first hours of a session ran with no dispatcher (Q-HUB-126). Clone it
# and wire it here, before anything else prints. The three variables exist so a test can point the
# path at an empty folder, the source at a local copy, and skip the install; the defaults are live.
HUB_CLONE_PATH="${HUB_CLONE_PATH:-/root/.claude/hub}"
HUB_CLONE_SOURCE="${HUB_CLONE_SOURCE:-https://github.com/njefferson/noahjefferson.git}"
if [ ! -f "$HUB_CLONE_PATH/hook-dispatch.mjs" ]; then
  if git clone --quiet "$HUB_CLONE_SOURCE" "$HUB_CLONE_PATH" >/dev/null 2>&1; then
    echo "session-start: the hub clone was absent; cloned it from $HUB_CLONE_SOURCE into $HUB_CLONE_PATH"
    if [ -n "${HUB_CLONE_DRY:-}" ]; then
      echo "session-start: install line (dry run, not run): node $HUB_CLONE_PATH/hook-dispatch.mjs --install"
    else
      node "$HUB_CLONE_PATH/hook-dispatch.mjs" --install 2>&1 || echo "session-start: the dispatcher install from the clone failed"
    fi
  else
    echo "session-start: the hub clone was absent and cloning it from $HUB_CLONE_SOURCE into $HUB_CLONE_PATH failed; the gates are not wired"
  fi
fi

node session-brief.mjs --repo . 2>/dev/null || true
node branch-guard.mjs --repo . --install >/dev/null 2>&1 || true
