#!/usr/bin/env node
// THE START BRIEF, A SHELL.
//
//   node session-brief.mjs --repo <folder>
//
// Other repositories call this file by its path at a start, so the path stays. It prints the heading line, the branch lines (which
// branch the repository is on and where its work commits, read from the repository's .branch-guard), and the one line naming the
// short page. Nothing else.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const at = args.indexOf('--repo');
const repo = resolve(at >= 0 && args[at + 1] ? args[at + 1] : '.');
const hub = dirname(fileURLToPath(import.meta.url));
const name = repo.split('/').filter(Boolean).pop() ?? 'this repo';

const sh = (cmd) => {
  try { return execSync(cmd, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

const out = [];
out.push(`=== session brief · ${name} ===`);

const branch = sh('git symbolic-ref --short HEAD') ?? '(detached)';
let work = null; let promote = null; let escape = null;
const guardPath = join(repo, '.branch-guard');
if (existsSync(guardPath)) {
  for (const line of readFileSync(guardPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim();
    if (k === 'work') work = v;
    if (k === 'promote') promote = v;
    if (k === 'escape') escape = v;
  }
}
out.push(`BRANCH: on '${branch}'.`);
if (work) {
  if (branch === work) out.push(`  Correct — work in this repo commits to '${work}'.`);
  else if (branch === promote) out.push(`  This is PRODUCTION. Work belongs on '${work}'. A commit here is refused unless ${escape}=1.`);
  else out.push(`  Work in this repo commits to '${work}'. A commit here will be refused.`);
} else {
  out.push('  No .branch-guard — this repo is UNGUARDED. Write one and install:');
  out.push('    node /root/.claude/hub/branch-guard.mjs --repo . --install');
}

out.push(`HOW WORK GOES HERE: the short page, ${hub}/plans/native/page.md. The procedures and the roles are files under ${hub}/plans/native/skills and ${hub}/plans/native/roles. The push guard and the check before a push hold every push of staging and main, and the choice popup is refused.`);
console.log(out.join('\n'));
