#!/usr/bin/env node
/**
 * THE PLAN GUARD, A SHELL.
 *
 * Other repositories call this file by its path from their own hooks (their plan-guard.sh shim), so the path stays. What it does is
 * what is left of it: it refuses the choice popup (AskUserQuestion) in every repository, and passes every other call in every
 * permission mode, printing nothing.
 *
 *   node plan-guard.mjs                  (the hook's payload on standard input)
 *   node plan-guard.mjs --check <path>   prints one line saying the plan check is retired, and exits 0
 *
 * The refusal is the form the hook has always used: a JSON decision of deny on standard output and exit code 2.
 */
import { readFileSync } from 'node:fs';

if (process.argv[2] === '--check') {
  console.log('The plan check is retired: a plan is no longer checked by a file, and this passes.');
  process.exit(0);
}

let p = {};
try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { /* an unreadable payload is not the choice popup */ }

if (String(p?.tool_name ?? '') === 'AskUserQuestion') {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'CHOICE POPUP REFUSED (Doctrine §0): AskUserQuestion is refused in every repository. Ask in plain text, and only a choice that is the owner\'s.',
    },
  }));
  process.exit(2);
}
process.exit(0);
