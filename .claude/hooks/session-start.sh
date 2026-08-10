#!/bin/bash
# Printed into every session, because everything below was already written down
# and none of it was being read. See session-brief.mjs for why this exists.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
node session-brief.mjs --repo . 2>/dev/null || true
node branch-guard.mjs --repo . --install >/dev/null 2>&1 || true
