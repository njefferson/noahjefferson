#!/usr/bin/env node
// THE PLAN SEED. A plan is typed from a print of the record and not from memory: two plans on 5 November reached their reviews with a
// dependency line copied from the entry above the item's own, a Files list copied from an older plan, a close step without its filing, a
// remote head carried as a fact another session had moved, and a proof written without reading how the tool counts. Every check read the
// plan after it was typed and nothing put the record into the plan at the moment of writing; the session brief fixed that moment at the
// start with a print, and this is the same print at the plan's moment.
//
//   node plan-seed.mjs --item <P-key | next> [--repo <full path>] [--plan <path>] [--steps <count>] [--hub <full path>]
//
// It READS and PRINTS and writes nothing, so the manager fence and the plan guard pass it as they pass the plan check. The print is the plan
// in its own shape: the Goals with the item's acceptance as goal 1, the item's own entry (its dependency line from its own block and no
// other), the rules version read from the rules file, the standing text from `plans/seed-template.md`, the Files in the shape the plan guard
// reads, the found keys as a ready "Found answered" section, the roadmap and shipped-check stubs from the notes, and last the reads another
// session can move, each marked and timed, so a step that depends on one reads it at the time of use.
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { goalsBlock, agentRules, planSection, scratchpadOf, sessionFiles, californiaTime } from './report.mjs';
import { foundQueue, roadmapItems, repoBranches } from './hook-dispatch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOVABLE = '[movable: another session can move this before a step runs]';

/** The text of a file, or '' when it cannot be read. */
const slurp = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };

/**
 * The program's entries.
 * @param {string} text  PROGRAM.md.
 * @returns {{key: string, n: number, title: string, block: string, state: string, repository: string, depends: string, acceptance: string}[]} one per `### P-N. title`
 *   heading, in file order. `block` runs from the heading to the line before the next `##` or `###` heading, so the dependency line and the
 *   acceptance are read from THAT block and from no other: the entry above is a different item.
 */
export function programEntries(text) {
  const lines = String(text ?? '').split('\n');
  const heads = [];
  lines.forEach((l, i) => { const m = /^### P-(\d+)\.\s*(.*)$/.exec(l); if (m) heads.push({ i, n: Number(m[1]), title: m[2].trim() }); });
  return heads.map((h) => {
    let end = lines.length;
    for (let j = h.i + 1; j < lines.length; j++) if (/^#{2,3} /.test(lines[j])) { end = j; break; }
    const block = lines.slice(h.i, end).join('\n').replace(/\s+$/, '');
    const state = /^Repository:[^\n]*?\bState:\s*([\w-]+)/m.exec(block)?.[1] ?? '';
    const repository = /^Repository:\s*(.*?)\.\s+(?:Goal|State)\b/m.exec(block)?.[1]?.trim() ?? '';
    const depends = /^Depends:\s*(.*)$/m.exec(block)?.[1]?.trim() ?? '';
    const acceptance = /^Acceptance:\s*([\s\S]*?)(?=\n\s*\n|$)/m.exec(block)?.[1]?.replace(/\s*\n\s*/g, ' ').trim() ?? '';
    return { key: `P-${h.n}`, n: h.n, title: h.title, block, state, repository, depends, acceptance };
  });
}

/** The standing blocks of the template: `@@ name` lines open a block that runs to the next one. */
export function templateBlocks(text) {
  const out = {};
  let name = null;
  for (const l of String(text ?? '').split('\n')) {
    const m = /^@@\s+([\w-]+)\s*$/.exec(l);
    if (m) { name = m[1]; out[name] = []; continue; }
    if (name) out[name].push(l);
  }
  for (const k of Object.keys(out)) out[k] = out[k].join('\n').replace(/^\n+|\s+$/g, '');
  return out;
}

const fill = (s, vars) => String(s).replace(/\{([A-Z]+)\}/g, (all, k) => (k in vars ? String(vars[k]) : all));

/** Consecutive runs of numbers, ascending: [1,2,3,7,9,10] gives [[1,3],[7,7],[9,10]]. */
function runs(nums) {
  const a = [...new Set(nums)].sort((x, y) => x - y);
  const out = [];
  for (const n of a) { const last = out[out.length - 1]; if (last && n === last[1] + 1) last[1] = n; else out.push([n, n]); }
  return out;
}

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 20000 });
  if (r.error || r.status !== 0) return { ok: false, out: String(r.stderr || r.error?.message || `exit ${r.status}`).trim().split('\n')[0] };
  return { ok: true, out: String(r.stdout).replace(/\s+$/, '') };
}

/**
 * Print the seed.
 * @param {{item: string, repo?: string, plan?: string, steps?: number, hub?: string, now?: Date}} o
 * @returns {{ok: boolean, text: string}} the print, or the error naming the next free key and the next ranked open item.
 */
export function seed(o) {
  const hub = resolve(o.hub ?? HERE);
  const repo = resolve(o.repo ?? (existsSync(join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.git')) ? (process.env.CLAUDE_PROJECT_DIR || process.cwd()) : hub));
  const now = o.now ?? new Date();
  const stamp = `${now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })} ${californiaTime(now)} California`;
  const clock = californiaTime(now);
  const programText = slurp(join(hub, 'PROGRAM.md'));
  const entries = programEntries(programText);
  const nextP = (entries.reduce((m, e) => Math.max(m, e.n), 0)) + 1;
  // The repository the print is for: the hub when the path is the hub's own or holds the hub's seed and program (the working copy is a
  // different path from the live clone the script may run out of), else the folder's name. The next item is the first open entry of THIS
  // repository, and the open entries of other repositories ranked before it are counted, never named as next.
  const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
  const isHub = real(repo) === real(hub) || (existsSync(join(repo, 'plan-seed.mjs')) && existsSync(join(repo, 'PROGRAM.md')));
  const repoName = isHub ? 'hub' : basename(repo);
  const openAll = entries.filter((e) => e.state === 'open');
  const firstOpen = openAll.find((e) => e.repository.toLowerCase() === repoName.toLowerCase());
  const passedOver = firstOpen ? openAll.indexOf(firstOpen) : openAll.length;
  const want = String(o.item ?? '').trim();
  const entry = want === 'next' ? firstOpen : entries.find((e) => e.key === want);
  if (!entry) {
    return { ok: false, text: `plan-seed: the key ${want || '(none given)'} is not in PROGRAM.md. The next free program key is P-${nextP}`
      + `${firstOpen ? ` and the next ranked open item is ${firstOpen.key}, ${firstOpen.title}` : ' and no entry is open'}.\n` };
  }

  // ---- the numbers read from the folders ----
  const hubFound = foundQueue(hub);
  const repoFound = isHub ? [] : foundQueue(repo);
  const keys = [...new Set([...hubFound, ...repoFound].map((q) => q.key))];
  const parts = keys.map((k) => /^Q-([A-Za-z0-9]+)-(\d+)$/.exec(k)).filter(Boolean);
  let fileMax = 0;
  try { for (const n of readdirSync(join(hub, 'found'))) { const m = /^Q-HUB-(\d+)\.md$/.exec(n); if (m) fileMax = Math.max(fileMax, Number(m[1])); } } catch { /* no folder */ }
  const hubMax = Math.max(fileMax, ...parts.filter((m) => m[1] === 'HUB').map((m) => Number(m[2])), 0);
  let lessonMax = 0;
  try { for (const n of readdirSync(join(hub, 'lessons'))) { const m = /^(\d+)-/.exec(n); if (m) lessonMax = Math.max(lessonMax, Number(m[1])); } } catch { /* no folder */ }
  const planText = o.plan ? slurp(resolve(o.plan)) : '';
  const stepNums = [...planSection(planText, 'Steps').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1]));
  const first = (stepNums.length ? Math.max(...stepNums) : 0) + 1;
  const count = Math.max(1, Math.floor(Number(o.steps) || 1));
  const takeup = first;
  const close = first + 1 + count;
  const review = close + 1;
  const rules = agentRules(join(hub, 'agent-rules.md'));
  const rulesPath = join(homedir(), '.claude', 'hub', 'agent-rules.md');
  const sid = String(process.env.CLAUDE_CODE_SESSION_ID ?? '').trim();
  const pad = sid ? scratchpadOf(sid) : null;
  const files = sid ? sessionFiles(sid) : null;
  const transcript = files?.main ?? '/root/.claude/projects/<the project folder>/<the session id>.jsonl';
  const tpl = templateBlocks(slurp(join(hub, 'plans', 'seed-template.md')));
  // HUB in the standing text is where an agent edits and tests: the working copy when the print is for the hub, never the live clone the
  // script may run out of.
  const vars = { HUB: isHub ? repo : hub, ITEM: entry.key, TAKEUP: takeup, CLOSE: close, REVIEW: review, NEXTP: `P-${nextP}`, NEXTQ: `Q-HUB-${hubMax + 1}`, NEXTL: lessonMax + 1,
    TRANSCRIPT: transcript, REVIEWFILE: join(homedir(), '.claude', 'hub', 'aim-review.md') };
  vars.LANDING = fill(tpl.landing ?? '<plans/seed-template.md has no landing block>', vars);

  const out = [];
  const L = (s = '') => out.push(s);

  // ---- the header, which is not the plan ----
  L(`PLAN SEED for ${entry.key} (${entry.title}), repository ${basename(repo)}, printed ${stamp}${want === 'next' ? `; it passed over ${passedOver} open ${passedOver === 1 ? 'entry' : 'entries'} of other repositories` : ''}.`);
  L(`Every line of the plan below was read from a file at this time. The lines under the movable reads at the end can be moved by another session before a step runs, so a step that depends on one reads it at the time of use.`);
  L('The plan starts at the line of equals signs. Fill each angle-bracket placeholder, delete this header, and keep the rest as printed.');
  L('==== THE PLAN STARTS BELOW THIS LINE ====');
  L();
  L(`# <The plan's title, naming ${entry.key}>`);
  L();
  L('## Goals');
  L();
  L(`1. ${entry.acceptance || `<${entry.key}'s acceptance: its entry in PROGRAM.md has no Acceptance line>`}`);
  const block = goalsBlock(join(hub, 'CLAUDE.md'));
  L(block || '<the hub CLAUDE.md goals block could not be read>');
  L();
  const w1 = takeup + 1;
  const served = [`step ${takeup} serves goals 5 and 6`, `step${count === 1 ? '' : 's'} ${count === 1 ? w1 : `${w1} to ${w1 + count - 1}`} ${count === 1 ? 'serves' : 'serve'} goal 1`,
    `step ${close} serves goals 5 and 6`, `step ${review} serves goals 3, 5 and 6`];
  L(`Served by: ${served.join('; ')}.`);
  L();
  L('## Asked');
  L();
  L(`<What the owner asked, in the session's own words and sharing no run of eight words with any message of the owner: the plan guard refuses a line that does.>`);
  L();
  L('## Design');
  L();
  L(`The wall line of every report reads against this: the item is <${entry.title}>, whose acceptance is goal 1 above. <The owner's asks it serves, and the program's goal it serves.>`);
  L();
  L('## Item entry');
  L();
  L(`The entry as PROGRAM.md holds it now, from its heading to the next; its dependency line is ${entry.depends ? `"${entry.depends}"` : 'not in the block'} and no other line stands for it.`);
  L();
  for (const l of entry.block.split('\n')) L(l ? `    ${l}` : '');
  L();
  L('## Thesis');
  L();
  L(planSection(programText, 'Thesis').trim().split(/\n\s*\n/)[0] ?? '<the thesis could not be read>');
  L();
  L('## Rules');
  L();
  L(rules?.version ? `Rules: ${rulesPath}, version ${rules.version}.` : '<the rules file could not be read: the version is not known>');
  L();
  L('## Rules of this plan');
  L();
  L(fill(tpl['rules-of-this-plan'] ?? '<plans/seed-template.md has no rules-of-this-plan block>', vars));
  L();
  const nums = Array.from({ length: count }, (_, i) => w1 + i);
  const order = [takeup, ...nums, close];
  L('## Order');
  L();
  L(`Order: ${order.join(' ')}`);
  L(`Standing: ${review}`);
  L(`After: ${order.slice(1).map((n, i) => `${n} after ${order[i]}`).join('; ')}`);
  L();
  L('## Steps');
  L();
  L(fill(tpl['take-up'] ?? '<plans/seed-template.md has no take-up block>', vars));
  L();
  for (const n of nums) {
    L(`${n}. **<the item's step ${n}, one result>.** <Repository>, one agent. Facts: <the asks and the facts the step depends on, restated>. Do: <the exact actions and nothing outside them>. Observe: <the observation that means it is done>. Kill: <what ends the step with nothing further written>. Report \`progress/step-${n}-report.txt\` (new). Estimate <minutes> min.`);
    L();
  }
  L(fill(tpl['close-step'] ?? '<plans/seed-template.md has no close-step block>', vars));
  L();
  L(fill(tpl['review-step'] ?? '<plans/seed-template.md has no review-step block>', vars));
  L();
  L('## Commands');
  L();
  L(fill(tpl.commands ?? '<plans/seed-template.md has no commands block>', vars));
  L();
  L('## Files');
  L();
  const readOnly = ['DOCTRINE.md', 'agent-rules.md', 'aim-review.md'].filter((f) => existsSync(join(hub, f)));
  // One label for a repository: when the print is for the hub its own files go in the one Hub list, and another repository gets its own.
  L(`- Hub, edited: \`PROGRAM.md\`, \`NOTES.md\`, \`found/\`${existsSync(join(hub, 'lessons')) ? ', `lessons/`, `LESSONS.md`' : ''}, <the item's own files, each with (new) after it where the plan creates it>`);
  L(`- Hub, read only: ${readOnly.map((f) => `\`${f}\``).join(', ')}`);
  if (!isHub) L(`- ${basename(repo)}, edited: <the item's own files in ${basename(repo)}>`);
  L(`- Session scratchpad: \`progress/\`, \`status/\`, \`scratch/\`, \`recall/\`, which is \`${pad ? `${pad}/` : '<the session scratchpad, which no session id here names>'}\``);
  L(`- Session transcript, read only: \`${transcript}\``);
  L();
  L('## What is');
  L();
  L('- <Each bullet quotes, in double quotes, twelve characters or more of one line of a file it names, read after the newest compaction, and the file is one a repository the plan names holds.>');
  L();
  L('## Roadmap');
  L();
  const road = roadmapItems(repo);
  if (!road.length) L(`${basename(repo)}'s NOTES.md keeps no Next capability release section, so there is no roadmap item to mark in or out.`);
  else for (const r of road) L(`- ${r.key}: <in or out, and why in ten characters or more> (${r.title})`);
  L();
  L('## Shipped check');
  L();
  const br = repoBranches(repo);
  if (!road.length) L('No roadmap item is marked in, so no line is owed.');
  else {
    L(`A line for each item marked in, after a git log of ${br.production} and ${br.staging} has been read in this session: <key>: not shipped, read against ${br.production} and ${br.staging} on <the date>.`);
  }
  L();
  L('## Found answered');
  L();
  if (!keys.length) L('- There is no queued finding in the repositories this plan names, so no line is owed.');
  const byTag = new Map();
  for (const m of parts) { if (!byTag.has(m[1])) byTag.set(m[1], []); byTag.get(m[1]).push(Number(m[2])); }
  for (const [tag, ns] of byTag) {
    for (const [lo, hi] of runs(ns)) {
      L(lo === hi ? `- Q-${tag}-${lo} still queued: <the reason this plan leaves it, ten characters or more>`
        : `- Q-${tag}-${lo} to Q-${tag}-${hi} still queued: <the reason this plan leaves them, ten characters or more>`);
    }
  }
  L();
  L('## Looked up');
  L();
  L('- <Each file or page read for this plan, and what it showed, in one line of more than twenty characters.>');
  L();
  L('## Branches');
  L();
  L('- <Each route the plan could have taken and did not, and why, in one line of more than twenty characters.>');
  L();
  L('## Call chain');
  L();
  L('- <What each step reads and writes, and which step hands what to which, in one line of more than twenty characters.>');
  L();
  L('## Whole app');
  L();
  L('<What the repository exists for and how this item serves it, in a line of more than twenty characters.>');
  L();
  L('## Leaves open');
  L();
  L('- <What the plan leaves open and why, in one line of more than twenty characters.>');
  L();
  L('## Cost');
  L();
  L(`Each of the ${count + 2} steps runs on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. <The runs and checks the plan makes.> Two pushes are made, one by the take-up step and one by the close step, each rebased onto the remote's head. <The main thread's tier for the writing and for the management.>`);
  L();
  L('## Verification');
  L();
  L('- <What is observed at the end that shows the item\'s acceptance, each as one line.>');
  L();

  // ---- the movable reads, outside the plan ----
  L('==== THE PLAN ENDS ABOVE THIS LINE ====');
  L();
  L(`MOVABLE READS, each read at ${clock} California and marked, so a step reads it again at the time of use:`);
  const heads = git(['ls-remote', '--heads', 'origin'], repo);
  L(`- ${MOVABLE} the remote's heads of ${basename(repo)}: ${heads.ok ? (heads.out.split('\n').filter(Boolean).map((l) => l.replace(/\s+/g, ' ')).join('; ') || 'none') : `not read (${heads.out})`}`);
  const live = git(['-C', join(homedir(), '.claude', 'hub'), 'rev-parse', 'HEAD'], repo);
  L(`- ${MOVABLE} the live clone's head: ${live.ok ? live.out : `not read (${live.out})`}`);
  const head = git(['rev-parse', 'HEAD'], repo);
  L(`- ${MOVABLE} the working copy's head: ${head.ok ? head.out : `not read (${head.out})`}`);
  const st = git(['status', '--short'], repo);
  L(`- ${MOVABLE} the working copy's changed lines: ${st.ok ? (st.out ? st.out.split('\n').length : 0) : `not read (${st.out})`}`);
  L(`- ${MOVABLE} the next free program key: P-${nextP}`);
  L(`- ${MOVABLE} the items count line as PROGRAM.md prints it: ${/^\d+ items\b[^\n]*/m.exec(planSection(programText, 'Items'))?.[0] ?? 'not read'}`);
  L(`- ${MOVABLE} the next free found key: Q-HUB-${hubMax + 1}`);
  L(`- ${MOVABLE} the next free lesson number: ${lessonMax + 1}`);
  return { ok: true, text: `${out.join('\n')}\n` };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = process.argv.slice(2);
  const val = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
  if (!val('--item')) {
    process.stdout.write('usage: node plan-seed.mjs --item <P-key | next> [--repo <full path>] [--plan <path>] [--steps <count>] [--hub <full path>]\n');
    process.exit(1);
  }
  const r = seed({ item: val('--item'), repo: val('--repo'), plan: val('--plan'), steps: val('--steps'), hub: val('--hub') });
  process.stdout.write(r.text);
  process.exit(r.ok ? 0 : 1);
}
