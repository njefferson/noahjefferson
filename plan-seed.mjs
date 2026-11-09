#!/usr/bin/env node
// THE PLAN SEED. A plan is typed from a print of the record and not from memory: two plans on 5 November reached their reviews with a
// dependency line copied from the entry above the item's own, a Files list copied from an older plan, a close step without its filing, a
// remote head carried as a fact another session had moved, and a proof written without reading how the tool counts. Every check read the
// plan after it was typed and nothing put the record into the plan at the moment of writing; the session brief fixed that moment at the
// start with a print, and this is the same print at the plan's moment.
//
//   node plan-seed.mjs --item <P-key | next> [--repo <full path>] [--plan <path>] [--steps <count>] [--hub <full path>]
//   node plan-seed.mjs --batch [--size <n>] [--steps <n>] [--repo <full path>] [--plan <path>] [--hub <full path>]
//
// `--batch` prints the open findings of the repository as ONE plan, grouped by the file each names: a take-up step, a step for each group of up
// to `--size` findings (eight by default; `--steps` limits the groups printed) that fixes and lands its own commit, and a close.
//
// `--out <path>` (either mode) writes the whole print to that file and prints one line naming the path and the print's first line, so a print too long
// for the conversation (the batch print for the hub's queue ran to 246 KB) is read whole from the file. A finding whose own text has a sentence that
// opens with the words put right is set done at the batch's take-up with that sentence and is left out of every group.
//
// Without `--out` it READS and PRINTS and writes nothing, so the manager fence and the plan guard pass it as they pass the plan check. The print is the plan
// in its own shape: the Goals with the item's acceptance as goal 1, the item's own entry (its dependency line from its own block and no
// other), the rules version read from the rules file, the standing text from `plans/seed-template.md`, the Files in the shape the plan guard
// reads, the found keys as a ready "Found answered" section, the roadmap and shipped-check stubs from the notes, and last the reads another
// session can move, each marked and timed, so a step that depends on one reads it at the time of use.
import { readFileSync, readdirSync, existsSync, realpathSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { goalsBlock, agentRules, planSection, scratchpadOf, sessionFiles, californiaTime } from './report.mjs';
import { foundQueue, roadmapItems, repoBranches } from './hook-dispatch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOVABLE = '[movable: another session can move this before a step runs]';
// Placeholders and sentences the seed prints in both modes.
const SEND_REPORT = 'a send after the first writes its own file, named for the step number, a hyphen, the send\'s number and -report.txt';
const FINDINGS_PASSED_IN = '- <Each finding the owner passed in from another session, in the session\'s own words, one line each, which the close step files in the found folder with its program item; write that none was passed in where none was.>';
const FORCED_TURNS = '<Where the plan\'s Rules hold its commits for a later landing: the number of turns the environment\'s stop hook forces while a commit stands unpushed, written as a number beside the words forced turns.>';
const CLOSE_KEYS_LINE = '- The close step\'s report names each key it filed beside the line it came from, key by key and never as a range.';

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
 * The highest keys the remote's main holds, as last fetched (Q-HUB-302: another session can land filings while a plan is typed, and the keys a close files
 * must be the next free ones past the remote's, not past the working copy's).
 * @param {string} hub  the hub's working copy.
 * @returns {{found: number, lesson: number, program: number, read: boolean}} the highest `Q-HUB-N` file, the highest lesson number and the highest `P-N`
 *   entry on `origin/main`; zeros and `read: false` where the hub has no such ref (a folder that is not a clone, a clone never fetched).
 */
export function remoteHead(hub) {
  const out = { found: 0, lesson: 0, program: 0, read: false };
  const f = git(['ls-tree', '--name-only', 'origin/main', 'found/'], hub);
  if (!f.ok) return out;
  out.read = true;
  for (const n of f.out.split('\n')) { const m = /Q-HUB-(\d+)\.md$/.exec(n); if (m) out.found = Math.max(out.found, Number(m[1])); }
  const l = git(['ls-tree', '--name-only', 'origin/main', 'lessons/'], hub);
  if (l.ok) for (const n of l.out.split('\n')) { const m = /lessons\/(\d+)-/.exec(n); if (m) out.lesson = Math.max(out.lesson, Number(m[1])); }
  const p = git(['show', 'origin/main:PROGRAM.md'], hub);
  if (p.ok) for (const e of programEntries(p.out)) out.program = Math.max(out.program, e.n);
  return out;
}

/**
 * The program item the session's approval marker names (Q-HUB-336: a seed printed at a resume took the program's next open item, which is not always the
 * session's).
 * @param {string} marker  the approval marker's path.
 * @param {{key: string, state: string}[]} entries  the program's entries.
 * @param {string} sid  the session id of this print ('' when none is known).
 * @returns {string} the P-key the marker's plan names (its `item` field when the marker has one, else the first P-key in the plan file's title line or its
 *   Item entry heading) when that item is open or planned and the marker names this session; '' otherwise (no session id known included), and every
 *   doubt reads as ''.
 */
export function markerItem(marker, entries, sid) {
  let mk;
  try { mk = JSON.parse(readFileSync(marker, 'utf8')); } catch { return ''; }
  if (!mk || typeof mk !== 'object') return '';
  if (!sid || mk.session !== sid) return '';
  const usable = (k) => (entries.find((e) => e.key === k && (e.state === 'open' || e.state === 'planned')) ? k : '');
  if (typeof mk.item === 'string' && /^P-\d+$/.test(mk.item)) return usable(mk.item);
  const planText = typeof mk.plan === 'string' && mk.plan ? slurp(mk.plan) : '';
  if (!planText) return '';
  const title = planText.split('\n').find((l) => /^#\s/.test(l)) ?? '';
  const heading = /^###\s+(P-\d+)\./m.exec(planSection(planText, 'Item entry'))?.[1] ?? '';
  const fromTitle = /\bP-\d+\b/.exec(title)?.[0] ?? '';
  return usable(fromTitle) || usable(heading);
}

/**
 * Print the seed.
 * @param {{item: string, repo?: string, plan?: string, steps?: number, hub?: string, now?: Date, marker?: string}} o
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
  // `next` takes the item the session's approval marker names where one does, and the program's first open item of the repository otherwise.
  const markedKey = want === 'next' ? markerItem(o.marker ?? join(homedir(), '.claude', 'APPROVED-PLAN.json'), entries, String(process.env.CLAUDE_CODE_SESSION_ID ?? '').trim()) : '';
  const entry = want === 'next' ? (entries.find((e) => e.key === markedKey) ?? firstOpen) : entries.find((e) => e.key === want);
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
  const remote = remoteHead(hub);
  const hubMax = Math.max(fileMax, remote.found, ...parts.filter((m) => m[1] === 'HUB').map((m) => Number(m[2])), 0);
  let lessonMax = remote.lesson;
  try { for (const n of readdirSync(join(hub, 'lessons'))) { const m = /^(\d+)-/.exec(n); if (m) lessonMax = Math.max(lessonMax, Number(m[1])); } } catch { /* no folder */ }
  const nextPk = Math.max(nextP, remote.program + 1);
  const remoteNote = remote.read ? ` (counted past the remote's main as last fetched, which holds up to P-${remote.program}, Q-HUB-${remote.found} and lesson ${remote.lesson})` : '';
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
  const vars = { HUB: isHub ? repo : hub, ITEM: entry.key, TAKEUP: takeup, CLOSE: close, REVIEW: review, NEXTP: `P-${nextPk}`, NEXTQ: `Q-HUB-${hubMax + 1}`, NEXTL: lessonMax + 1,
    TRANSCRIPT: transcript, REVIEWFILE: join(homedir(), '.claude', 'hub', 'aim-review.md'), PUTRIGHT: '' };
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
  L('## Findings passed in');
  L();
  L(FINDINGS_PASSED_IN);
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
    L(`${n}. **<the item's step ${n}, one result>.** <Repository>, one agent. Facts: <the asks and the facts the step depends on, restated>. Do: <the exact actions and nothing outside them>. Observe: <the observation that means it is done>. Kill: <what ends the step with nothing further written>. Report \`progress/step-${n}-report.txt\` (new); ${SEND_REPORT}. Estimate <minutes> min.`);
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
  L(`Each of the ${count + 2} steps runs on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. <The runs and checks the plan makes.> Two pushes are made, one by the take-up step and one by the close step, each rebased onto the remote's head. ${FORCED_TURNS} <The main thread's tier for the writing and for the management.>`);
  L();
  L('## Verification');
  L();
  L('- <What is observed at the end that shows the item\'s acceptance, each as one line.>');
  L(CLOSE_KEYS_LINE);
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
  L(`- ${MOVABLE} the next free program key: P-${nextPk}`);
  L(`- ${MOVABLE} the items count line as PROGRAM.md prints it: ${/^\d+ items\b[^\n]*/m.exec(planSection(programText, 'Items'))?.[0] ?? 'not read'}`);
  L(`- ${MOVABLE} the next free found key: Q-HUB-${hubMax + 1}${remoteNote}`);
  L(`- ${MOVABLE} the next free lesson number: ${lessonMax + 1}`);
  return { ok: true, text: `${out.join('\n')}\n` };
}

/**
 * The sentence of a finding's text that says the finding was put right.
 * @param {string} text  the finding's file, its whitespace collapsed to single spaces.
 * @returns {string} the sentence that opens with the words put right (in any case) at the head of the text or after the end of another sentence, from those
 *   words to the next full stop followed by a space or the end, at most 400 characters; '' when no sentence opens that way. A finding that only MENTIONS
 *   the words in the middle of a sentence (one describing other findings that were put right) is not one.
 */
export function putRightSentence(text) {
  const t = String(text ?? '');
  const m = /(?:^|[.;:)\]]\s+)(put right\b.*)$/i.exec(t);
  if (!m) return '';
  const rest = m[1];
  const end = /\.(?:\s|$)/.exec(rest);
  return (end ? rest.slice(0, end.index + 1) : rest).slice(0, 400).trim();
}

/**
 * The open findings of a repository, grouped by the file each is about.
 * @param {{entries: object[], repoName: string, repo: string, foundDir: string}} o  the program's entries, the repository's name as the program spells it, its path, and its found folder.
 * @returns {{key: string, item: string, rank: number, text: string, files: string[], home: string}[]} one per open entry of the repository whose title names a
 *   finding key with a file in the found folder, in the program's rank order. `files` are the code spans of the finding's text that name a path existing in the
 *   repository, and `home` is the first of them, '' when none.
 */
export function openFindings(o) {
  const out = [];
  o.entries.forEach((e, rank) => {
    if (e.state !== 'open' || e.repository.toLowerCase() !== o.repoName.toLowerCase()) return;
    const key = /\bQ-[A-Za-z0-9]+-\d+\b/.exec(e.title)?.[0];
    if (!key || !existsSync(join(o.foundDir, `${key}.md`))) return;
    const text = slurp(join(o.foundDir, `${key}.md`)).replace(/\s+/g, ' ').trim();
    const files = [];
    for (const m of text.matchAll(/`([^`\n]+)`/g)) {
      const s = m[1].trim().replace(/[.,;:]+$/, '');
      if (s && !/\s/.test(s) && !files.includes(s) && existsSync(join(o.repo, s))) files.push(s);
    }
    out.push({ key, item: e.key, rank, text, files, home: files[0] ?? '', putRight: putRightSentence(text) });
  });
  return out;
}

/**
 * Print the batch: the open findings of the repository grouped by the file each names, as a plan in the plan's own shape.
 * @param {{repo?: string, plan?: string, steps?: number, size?: number, hub?: string, now?: Date}} o
 * @returns {{ok: boolean, text: string}} the print, or the error when the repository holds no open finding.
 */
export function batchSeed(o) {
  const hub = resolve(o.hub ?? HERE);
  const repo = resolve(o.repo ?? (existsSync(join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.git')) ? (process.env.CLAUDE_PROJECT_DIR || process.cwd()) : hub));
  const now = o.now ?? new Date();
  const stamp = `${now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })} ${californiaTime(now)} California`;
  const programText = slurp(join(hub, 'PROGRAM.md'));
  const entries = programEntries(programText);
  const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
  const isHub = real(repo) === real(hub) || (existsSync(join(repo, 'plan-seed.mjs')) && existsSync(join(repo, 'PROGRAM.md')));
  const repoName = isHub ? 'hub' : basename(repo);
  const findings = openFindings({ entries, repoName, repo, foundDir: join(isHub ? hub : repo, 'found') });
  if (!findings.length) return { ok: false, text: `plan-seed: no open entry of ${repoName} in PROGRAM.md is a filed finding, so there is no batch to print.\n` };
  const size = Math.max(1, Math.floor(Number(o.size) || 8));
  // Group by home, in the order of the lowest-ranked item of each group, the group with no file last; a group past the size is cut into runs of it.
  // A finding whose own text says it was put right is set done at the take-up with that sentence and is left out of every group.
  const putRight = findings.filter((f) => f.putRight);
  const byHome = new Map();
  for (const f of findings) { if (f.putRight) continue; if (!byHome.has(f.home)) byHome.set(f.home, []); byHome.get(f.home).push(f); }
  const homes = [...byHome.keys()].sort((a, b) => (a === '') - (b === '') || byHome.get(a)[0].rank - byHome.get(b)[0].rank);
  let groups = [];
  for (const h of homes) { const fs = byHome.get(h); for (let i = 0; i < fs.length; i += size) groups.push({ home: h, list: fs.slice(i, i + size) }); }
  const limit = Math.floor(Number(o.steps) || 0);
  if (limit > 0) groups = groups.slice(0, limit);
  const planned = groups.flatMap((g) => g.list);
  const batch = [...putRight, ...planned];

  const hubFound = foundQueue(hub);
  const repoFound = isHub ? [] : foundQueue(repo);
  const keys = [...new Set([...hubFound, ...repoFound].map((q) => q.key))];
  const parts = keys.map((k) => /^Q-([A-Za-z0-9]+)-(\d+)$/.exec(k)).filter(Boolean);
  let fileMax = 0;
  try { for (const n of readdirSync(join(hub, 'found'))) { const m = /^Q-HUB-(\d+)\.md$/.exec(n); if (m) fileMax = Math.max(fileMax, Number(m[1])); } } catch { /* no folder */ }
  const remote = remoteHead(hub);
  const hubMax = Math.max(fileMax, remote.found, ...parts.filter((m) => m[1] === 'HUB').map((m) => Number(m[2])), 0);
  let lessonMax = remote.lesson;
  try { for (const n of readdirSync(join(hub, 'lessons'))) { const m = /^(\d+)-/.exec(n); if (m) lessonMax = Math.max(lessonMax, Number(m[1])); } } catch { /* no folder */ }
  const nextP = Math.max((entries.reduce((m, e) => Math.max(m, e.n), 0)) + 1, remote.program + 1);
  const remoteNote = remote.read ? ` (counted past the remote's main as last fetched, which holds up to P-${remote.program}, Q-HUB-${remote.found} and lesson ${remote.lesson})` : '';
  const planText = o.plan ? slurp(resolve(o.plan)) : '';
  const stepNums = [...planSection(planText, 'Steps').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1]));
  const takeup = (stepNums.length ? Math.max(...stepNums) : 0) + 1;
  const g1 = takeup + 1;
  const close = g1 + groups.length;
  const review = close + 1;
  const rules = agentRules(join(hub, 'agent-rules.md'));
  const rulesPath = join(homedir(), '.claude', 'hub', 'agent-rules.md');
  const sid = String(process.env.CLAUDE_CODE_SESSION_ID ?? '').trim();
  const pad = sid ? scratchpadOf(sid) : null;
  const files = sid ? sessionFiles(sid) : null;
  const transcript = files?.main ?? '/root/.claude/projects/<the project folder>/<the session id>.jsonl';
  const tpl = templateBlocks(slurp(join(hub, 'plans', 'seed-template.md')));
  const itemKeys = batch.map((f) => f.item).join(', ');
  const vars = { HUB: isHub ? repo : hub, ITEM: itemKeys, TAKEUP: takeup, CLOSE: close, REVIEW: review, NEXTP: `P-${nextP}`, NEXTQ: `Q-HUB-${hubMax + 1}`, NEXTL: lessonMax + 1,
    TRANSCRIPT: transcript, REVIEWFILE: join(homedir(), '.claude', 'hub', 'aim-review.md') };
  vars.LANDING = fill(tpl.landing ?? '<plans/seed-template.md has no landing block>', vars);
  // The take-up sets the planned items to planned and the put-right items to done, so it is filled with the planned keys and the put-right paragraph.
  vars.PUTRIGHT = putRight.length
    ? `; in the entry of each of these items, whose finding's own text says it was put right, set State to done with the sentence after its key as what changed: ${putRight.map((f) => `${f.item} (${f.key}): ${f.putRight}`).join(' ')}`
    : '';
  const takeupVars = { ...vars, ITEM: planned.map((f) => f.item).join(', ') };
  // Each check is spelled as its own usage gives (Q-HUB-308): the docs check takes the repository's path bare, the lessons check none, and the quote,
  // privacy, third-person, example and pin checks take it after the repo flag.
  const checks = ['docs-check', 'privacy-check', 'quote-check', 'third-person-check', 'lessons-check', 'example-check', 'pin-check'].map((c) => {
    const base = `node ${vars.HUB}/${c}.mjs`;
    return `\`${c === 'docs-check' ? `${base} ${repo}` : c === 'lessons-check' ? base : `${base} --repo ${repo}`}\``;
  }).join(', ');

  const out = [];
  const L = (s = '') => out.push(s);
  L(`PLAN SEED for the batch of ${batch.length} open findings of ${repoName}, in ${groups.length} group ${groups.length === 1 ? 'step' : 'steps'}, repository ${basename(repo)}, printed ${stamp}.`);
  L(`Every line of the plan below was read from a file at this time. The lines under the movable reads at the end can be moved by another session before a step runs, so a step that depends on one reads it at the time of use.`);
  L('The plan starts at the line of equals signs. Fill each angle-bracket placeholder, delete this header, and keep the rest as printed.');
  L('==== THE PLAN STARTS BELOW THIS LINE ====');
  L();
  L(`# <The plan's title, naming the batch of ${batch.length} open findings of ${repoName}>`);
  L();
  L('## Goals');
  L();
  L(`1. Each of the ${batch.length} findings of the batch (${batch.map((f) => f.key).join(', ')}) is put right as its own text says, each of its items (${itemKeys}) is done in the program, and the commits are on the remote's main.`);
  L(goalsBlock(join(hub, 'CLAUDE.md')) || '<the hub CLAUDE.md goals block could not be read>');
  L();
  const gnums = groups.map((_, i) => g1 + i);
  L(`Served by: step ${takeup} serves goals 5 and 6; step${gnums.length === 1 ? '' : 's'} ${gnums.length === 1 ? g1 : `${g1} to ${g1 + gnums.length - 1}`} ${gnums.length === 1 ? 'serves' : 'serve'} goal 1; step ${close} serves goals 5 and 6; step ${review} serves goals 3, 5 and 6.`);
  L();
  L('## Asked');
  L();
  L(`<What the owner asked, in the session's own words and sharing no run of eight words with any message of the owner: the plan guard refuses a line that does.>`);
  L();
  L('## Design');
  L();
  L(`The wall line of every report reads against this: the item is the batch of ${batch.length} findings, whose acceptance is goal 1 above. <The owner's asks it serves, and the program's goal it serves.>`);
  L();
  L('## Findings passed in');
  L();
  L(FINDINGS_PASSED_IN);
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
  // In a batch each group step lands its own commit, so the push rule names them (a rebase of one commit onto a moved head does not conflict where many do).
  L(fill(tpl['rules-of-this-plan'] ?? '<plans/seed-template.md has no rules-of-this-plan block>', vars)
    .replace("Nothing is pushed except by the take-up step, which lands its one commit, and the close step, which lands the plan's other commits with its own; each fetches",
      'Nothing is pushed except by the take-up step, each group step and the close step, each landing its own commit; each fetches'));
  L();
  const order = [takeup, ...gnums, close];
  L('## Order');
  L();
  L(`Order: ${order.join(' ')}`);
  L(`Standing: ${review}`);
  L(`After: ${order.slice(1).map((n, i) => `${n} after ${order[i]}`).join('; ')}`);
  L();
  L('## Steps');
  L();
  L(fill(tpl['take-up'] ?? '<plans/seed-template.md has no take-up block>', takeupVars));
  L();
  const stepOf = new Map();
  groups.forEach((g, i) => {
    const n = g1 + i;
    const ks = g.list.map((f) => f.key);
    g.list.forEach((f) => stepOf.set(f.key, n));
    const where = g.home ? `\`${g.home}\`` : 'the files each names';
    const named = [...new Set(g.list.flatMap((f) => f.files))];
    const doEach = g.list.map((f) => `for ${f.key} (item ${f.item}) make the change its text names${f.files.length ? ` in ${f.files.map((x) => `\`${x}\``).join(', ')}` : ' in the files its text names'}`).join('; ');
    L(`${n}. **${g.home ? `Put right in ${where}` : 'Put right in the files each names'}: ${ks.join(', ')}.** ${isHub ? 'Hub' : basename(repo)}, one agent. Facts: the step takes up ${ks.length} filed ${ks.length === 1 ? 'finding' : 'findings'}, each read whole from its file; ${g.list.map((f) => `${f.key} (item ${f.item}): ${f.text}`).join(' ')} The remote's main moves under this session, so it is fetched at the time and this step's commit goes on top of it. Do: \`git status\`, read clean; read with Read and Grep ${where}${named.length > 1 ? ` and ${named.filter((x) => x !== g.home).map((x) => `\`${x}\``).join(', ')}` : ''}; ${doEach}; where the home is a gate file the suite covers, add a case that fails on the old text and a plant for the fix in \`session-guards.test.mjs\`, and run \`node ${vars.HUB}/session-guards.test.mjs\` with the new cases by name, then the plants narrowed to the files touched; after \`git add\`, run ${checks} once each, each exit code read; make one local commit whose subject names ${ks.join(', ')}; then the landing acts: ${vars.LANDING}. Observe: the cases named pass where one was added, every plant is caught, the seven checks exit 0, and the remote's main is the pushed commit with this step's commit above the fetched head. Kill: a red check ends the step FAILED with its lines; a conflict in the rebase or a push refused as not a fast-forward ends it EJECT with nothing pushed and the rebase ended; a refusal of the fetch, the rebase, the push or the pull ends it REFUSED, nothing further done and no other route tried. Report \`progress/step-${n}-report.txt\` (new); ${SEND_REPORT}. Estimate ${15 + 5 * g.list.length} min.`);
    L();
  });
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
  const named = [...new Set(batch.flatMap((f) => f.files))];
  const edited = ['PROGRAM.md', 'NOTES.md', 'found/', ...(existsSync(join(hub, 'lessons')) ? ['lessons/', 'LESSONS.md'] : [])];
  const mine = [...(named.some((x) => x.endsWith('.mjs')) ? ['session-guards.test.mjs'] : []), ...named].filter((x, i, a) => a.indexOf(x) === i);
  const mark = (x) => `\`${x}\`${existsSync(join(isHub ? repo : hub, x)) ? '' : ' (new)'}`;
  if (isHub) {
    L(`- Hub, edited: ${[...edited.map((x) => `\`${x}\``), ...mine.filter((x) => !edited.includes(x)).map(mark)].join(', ')}`);
    L(`- Hub, read only: ${readOnly.map((f) => `\`${f}\``).join(', ')}`);
  } else {
    L(`- Hub, edited: ${edited.map((x) => `\`${x}\``).join(', ')}`);
    L(`- Hub, read only: ${readOnly.map((f) => `\`${f}\``).join(', ')}`);
    L(`- ${basename(repo)}, edited: ${mine.map((x) => `\`${x}\`${existsSync(join(repo, x)) ? '' : ' (new)'}`).join(', ') || '<the files the findings name>'}`);
  }
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
  else L(`A line for each item marked in, after a git log of ${br.production} and ${br.staging} has been read in this session: <key>: not shipped, read against ${br.production} and ${br.staging} on <the date>.`);
  L();
  L('## Found answered');
  L();
  for (const f of batch) {
    L(f.putRight ? `- ${f.key} fixed in step ${takeup}: its own text says it was put right, so ${f.item} is set done at the take-up with no change.`
      : `- ${f.key} fixed in step ${stepOf.get(f.key)}: ${f.item} is put right in its step as the finding's own text says.`);
  }
  const inBatch = new Set(batch.map((f) => f.key));
  const rest = parts.filter((m) => !inBatch.has(m[0]));
  const byTag = new Map();
  for (const m of rest) { if (!byTag.has(m[1])) byTag.set(m[1], []); byTag.get(m[1]).push(Number(m[2])); }
  for (const [tag, ns] of byTag) {
    for (const [lo, hi] of runs(ns)) {
      L(lo === hi ? `- Q-${tag}-${lo} still queued: not in this batch, which takes the open findings of ${repoName} up by file.`
        : `- Q-${tag}-${lo} to Q-${tag}-${hi} still queued: not in this batch, which takes the open findings of ${repoName} up by file.`);
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
  L('<What the repository exists for and how this batch serves it, in a line of more than twenty characters.>');
  L();
  L('## Leaves open');
  L();
  L('- <What the plan leaves open and why, in one line of more than twenty characters.>');
  L();
  L('## Cost');
  L();
  L(`The ${groups.length + 2} steps (${groups.length} group ${groups.length === 1 ? 'step' : 'steps'} with the take-up and the close) run on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. ${groups.length + 2} pushes are made, one for each group step and two more for the take-up and the close, each rebased onto the remote's head. ${FORCED_TURNS} <The main thread's tier for the writing and for the management.>`);
  L();
  L('## Verification');
  L();
  L('- <What is observed at the end that shows the batch\'s acceptance, each as one line.>');
  L(CLOSE_KEYS_LINE);
  L();
  L('==== THE PLAN ENDS ABOVE THIS LINE ====');
  L();
  L(`MOVABLE READS, each read at ${californiaTime(now)} California and marked, so a step reads it again at the time of use:`);
  const heads = git(['ls-remote', '--heads', 'origin'], repo);
  L(`- ${MOVABLE} the remote's heads of ${basename(repo)}: ${heads.ok ? (heads.out.split('\n').filter(Boolean).map((l) => l.replace(/\s+/g, ' ')).join('; ') || 'none') : `not read (${heads.out})`}`);
  const head = git(['rev-parse', 'HEAD'], repo);
  L(`- ${MOVABLE} the working copy's head: ${head.ok ? head.out : `not read (${head.out})`}`);
  L(`- ${MOVABLE} the next free program key: P-${nextP}`);
  L(`- ${MOVABLE} the next free found key: Q-HUB-${hubMax + 1}${remoteNote}`);
  L(`- ${MOVABLE} the next free lesson number: ${lessonMax + 1}`);
  return { ok: true, text: `${out.join('\n')}\n` };
}

/**
 * Print a result to stdout, or write it whole to a named file.
 * @param {{ok: boolean, text: string}} r  the seed's result.
 * @param {string|undefined} outPath  the `--out` path.
 * @returns {void} without `--out` the text goes to stdout as it always did. With it the whole text is written to that path (its folder made) and stdout
 *   gets one line naming the path and the print's first line, so a print of any size is read whole from the file; a file that cannot be written
 *   prints the error and the exit is 1.
 */
export function emit(r, outPath) {
  if (!outPath) { process.stdout.write(r.text); return; }
  try {
    const path = resolve(outPath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, r.text);
    process.stdout.write(`plan-seed: wrote ${path} (${r.text.split('\n').length - 1} lines); first line: ${r.text.split('\n')[0]}\n`);
  } catch (err) {
    process.stdout.write(`plan-seed: could not write ${outPath}: ${err.message}\n`);
    r.ok = false;
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = process.argv.slice(2);
  const val = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
  if (a.includes('--batch')) {
    const b = batchSeed({ repo: val('--repo'), plan: val('--plan'), steps: val('--steps'), size: val('--size'), hub: val('--hub') });
    emit(b, b.ok ? val('--out') : undefined);
    process.exit(b.ok ? 0 : 1);
  }
  if (!val('--item')) {
    process.stdout.write('usage: node plan-seed.mjs --item <P-key | next> | --batch [--size <n>] [--steps <n>] [--repo <full path>] [--plan <path>] [--hub <full path>] [--out <path>]\n');
    process.exit(1);
  }
  const r = seed({ item: val('--item'), repo: val('--repo'), plan: val('--plan'), steps: val('--steps'), hub: val('--hub') });
  emit(r, r.ok ? val('--out') : undefined);
  process.exit(r.ok ? 0 : 1);
}
