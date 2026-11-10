#!/usr/bin/env node
// THE PLAN SEED. A plan is typed from a print of the record and not from memory: two plans on 5 November reached their reviews with a
// dependency line copied from the entry above the item's own, a Files list copied from an older plan, a close step without its filing, a
// remote head carried as a fact another session had moved, and a proof written without reading how the tool counts. Every check read the
// plan after it was typed and nothing put the record into the plan at the moment of writing; the session brief fixed that moment at the
// start with a print, and this is the same print at the plan's moment.
//
//   node plan-seed.mjs --item <P-key | next | new> [--repo <full path>] [--plan <path>] [--steps <count>] [--hub <full path>]
//   node plan-seed.mjs --batch [--size <n>] [--steps <n>] [--wave <n>] [--rounds <1 to 5>] [--repo <full path>] [--plan <path>] [--hub <full path>]
//
// `--item new` is work with no entry in the program: the print gives the entry's form under the next free key and a take-up step that adds it. `--rounds <n>` prints
// that many waves as rounds of ONE plan, from `--wave` on: one take-up claims every round's items, each round has its own file steps run at once and its own landing
// step, the first round follows the take-up and each later round the landing step before it, and only the last landing step pulls the live clone.
//
// `--batch` prints the open findings of the repository as ONE plan, grouped by the file each names: a take-up step, one WAVE of up to seven file steps
// run at the same time (each a group of up to `--size` findings, eight by default, owning its files and its guard's case file, committing nothing;
// `--steps` limits the groups printed and `--wave` prints a later wave), after a take-up that only claims, and one landing step that proves in the foreground,
// commits once for each file step, closes in the program, pushes once and pulls the live clone last, with a computed Cost.
//
// `--out <path>` (either mode) writes the whole print to that file and prints one line naming the path and the print's first line, so a print too long
// for the conversation (the batch print for the hub's queue ran to 246 KB) is read whole from the file. A finding whose own text has a sentence that
// opens with the words put right is set done at the batch's take-up with that sentence and is left out of every group. The LAST line of a finding's file that opens with
// Put right already, Fix in, Not the repository's or Not placed, each with a colon, is read: a Fix in line's code spans are the finding's files, ahead of any other name in its
// text; a Put right already or Not the repository's line leaves the finding out of every batch, counted and named in the header; a Not placed line, or no line and no file in
// the text, gives the finding no step, and its key is listed after the plan's end as not placed.
//
// Without `--out` it READS and PRINTS and writes nothing, so the manager fence and the plan guard pass it as they pass the plan check. The print is the plan
// in its own shape: the Goals with the item's acceptance as goal 1, the item's own entry (its dependency line from its own block and no
// other), the rules version read from the rules file, the standing text from `plans/seed-template.md`, the Files in the shape the plan guard
// reads, the found keys as a ready "Found answered" section, the roadmap and shipped-check stubs from the notes, and last the reads another
// session can move, each marked and timed, so a step that depends on one reads it at the time of use.
import { readFileSync, readdirSync, existsSync, realpathSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { goalsBlock, agentRules, planSection, scratchpadOf, sessionFiles, californiaTime } from './report.mjs';
import { foundQueue, roadmapItems, repoBranches } from './hook-dispatch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOVABLE = '[movable: another session can move this before a step runs]';
// The most file steps one wave of the batch print runs at the same time.
const WAVE = 7;
// Placeholders and sentences the seed prints in both modes.
const SEND_REPORT = 'a send after the first writes its own file, named for the step number, a hyphen, the send\'s number and -report.txt';
// The two sentences that name the step that closes name it by its number and its title in the print they sit in (Q-HUB-407): the single print's step is the close
// and a batch print's is the landing step, which has no step of the close's title.
const findingsPassedIn = (closer) => `- <Each finding the owner passed in from another session, in the session's own words, one line each, which ${closer} files in the found folder with its program item; write that none was passed in where none was.>`;
const FORCED_TURNS = '<Where the plan\'s Rules hold its commits for a later landing: the number of turns the environment\'s stop hook forces while a commit stands unpushed, written as a number beside the words forced turns.>';
const closeKeysLine = (closer) => `- The report of ${closer} names each key it filed beside the line it came from, key by key and never as a range.`;

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
  // The word `new` is work that has no entry yet (Q-HUB-404): the print gives the entry's form under the next free key, filled in below once that key is known.
  const isNew = want === 'new';
  const entry = isNew ? {} : want === 'next' ? (entries.find((e) => e.key === markedKey) ?? firstOpen) : entries.find((e) => e.key === want);
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
  if (isNew) {
    Object.assign(entry, { key: `P-${nextPk}`, n: nextPk, title: 'new work with no entry', state: 'planned', repository: repoName, depends: '',
      acceptance: "<the work's acceptance, as one sentence a reader can check>",
      block: [`### P-${nextPk}. <the work's title>`, '', `Repository: ${repoName}. Goal: <the number of the program goal it serves>. State: planned. Plan: <this plan's title>.`, '',
        "Acceptance: <the work's acceptance, as one sentence a reader can check>", '', 'Depends: <the program keys it depends on, or none>.'].join('\n') });
  }
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
  // The take-up lands too, but leaves the live clone alone: the close pulls it last (Q-HUB-386).
  vars.TAKEUPLANDING = fill(tpl['landing-takeup'] ?? '<plans/seed-template.md has no landing-takeup block>', vars);

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
  L(findingsPassedIn(`step ${close}, the close step,`));
  L();
  L('## Item entry');
  L();
  L(isNew ? `No entry in PROGRAM.md holds this work. The take-up step adds the entry below, in its form, under the next free program key, ${entry.key}; every angle-bracket placeholder in it is filled before the plan is put forward.`
    : `The entry as PROGRAM.md holds it now, from its heading to the next; its dependency line is ${entry.depends ? `"${entry.depends}"` : 'not in the block'} and no other line stands for it.`);
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
  L(fill(tpl[isNew ? 'take-up-new' : 'take-up'] ?? `<plans/seed-template.md has no ${isNew ? 'take-up-new' : 'take-up'} block>`, vars));
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
  L(`Each of the ${count + 2} steps runs on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. <The runs and checks the plan makes.> Two pushes are made, one by step ${takeup}, the take-up step, and one by step ${close}, the close step, each rebased onto the remote's head. ${FORCED_TURNS} <The main thread's tier for the writing and for the management.>`);
  L();
  L('## Verification');
  L();
  L('- <What is observed at the end that shows the item\'s acceptance, each as one line.>');
  L(closeKeysLine(`step ${close}, the close step,`));
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
 * Every file a path of the repository stands for.
 * @param {string} repo  the repository's full path.
 * @param {string} rel  a path in it, a file or a folder (a trailing slash allowed).
 * @returns {string[]} the path itself for a file, every file under it, at any depth, for a folder (`.git` and `node_modules` left out), and [] when it does not exist.
 */
export function filesUnder(repo, rel) {
  const base = String(rel ?? '').replace(/\/+$/, '');
  let st;
  try { st = statSync(join(repo, base)); } catch { return []; }
  if (!st.isDirectory()) return [base];
  const out = [];
  const walk = (d) => {
    let es;
    try { es = readdirSync(join(repo, d), { withFileTypes: true }); } catch { return; }
    for (const e of es.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      if (e.isDirectory()) walk(`${d}/${e.name}`); else out.push(`${d}/${e.name}`);
    }
  };
  walk(base);
  return out;
}

/**
 * The files the plants of a case file target.
 * @param {string} text  a case file's text.
 * @returns {string[]} the file named as the third element of a plant (`[find, replace, 'file']`), each once.
 */
export function plantTargets(text) {
  return [...new Set([...String(text ?? '').matchAll(/,\s*'([\w./-]+\.(?:mjs|md|js|sh|json))'\s*\]/g)].map((m) => m[1]))];
}

/**
 * Merge the groups that would share a file (Q-HUB-371).
 * @param {{home: string, homes: string[], list: {rank: number}[]}[]} groups  the groups, in rank order.
 * @param {(g: object) => Set<string>} claimsOf  the files a group owns: every file under its homes and the case file of each.
 * @returns {object[]} the groups with any two of different homes whose claims meet made one (the homes of both, the findings of both in rank order, at the place of the
 *   first); the runs of one cut group share a home list and are left apart, for the waves to keep in different waves.
 */
export function mergeSharing(groups, claimsOf) {
  const cur = groups.map((g) => ({ ...g }));
  for (let again = true; again;) {
    again = false;
    const cl = cur.map(claimsOf);
    for (let i = 0; i < cur.length && !again; i++) {
      for (let j = i + 1; j < cur.length && !again; j++) {
        if (!cur[i].homes.length || !cur[j].homes.length || cur[i].homes.join('\n') === cur[j].homes.join('\n')) continue;
        if (![...cl[i]].some((x) => cl[j].has(x))) continue;
        cur[i] = { home: cur[i].home, homes: [...new Set([...cur[i].homes, ...cur[j].homes])], list: [...cur[i].list, ...cur[j].list].sort((a, b) => a.rank - b.rank) };
        cur.splice(j, 1);
        again = true;
      }
    }
  }
  return cur;
}

/**
 * The line a finding's file ends with, one of four kinds told by its opening words (Put right already, Fix in, Not the repository's, Not placed, each followed by a colon).
 * @param {string} raw  the finding's file, with its line breaks.
 * @returns {{kind: 'put-right'|'fix-in'|'not-repo'|'not-placed', rest: string}|null} the LAST line of the file that opens with one of the four, its kind and the words after
 *   the colon; null when no line opens that way.
 */
export function findingLine(raw) {
  let found = null;
  for (const l of String(raw ?? '').split('\n')) {
    const m = /^(Put right already|Fix in|Not the repository(?:'|’)s|Not placed):\s*(.*)$/.exec(l.trim());
    if (m) found = { kind: m[1] === 'Put right already' ? 'put-right' : m[1] === 'Fix in' ? 'fix-in' : m[1] === 'Not placed' ? 'not-placed' : 'not-repo', rest: m[2] };
  }
  return found;
}

/**
 * The open findings of a repository, grouped by the file each is about.
 * @param {{entries: object[], repoName: string, repo: string, foundDir: string}} o  the program's entries, the repository's name as the program spells it, its path, and its found folder.
 * @returns {{key: string, item: string, rank: number, text: string, files: string[], home: string, line: string, left: boolean, unplaced: boolean}[]} one per open entry of the
 *   repository whose title names a finding key with a file in the found folder, in the program's rank order. `files` are the code spans of the finding's text that name a path
 *   existing in the repository, those of a Fix in line first, and `home` is the first of them, '' when none. `line` is the kind of the file's last line of the four ('' when none).
 *   `left` is true for a finding whose line is Put right already or Not the repository's, which no batch takes; `unplaced` is true for one with a Not placed line, or with no line
 *   and no file in its text (and not one whose own text says it was put right), which no step takes.
 */
export function openFindings(o) {
  const out = [];
  o.entries.forEach((e, rank) => {
    if (e.state !== 'open' || e.repository.toLowerCase() !== o.repoName.toLowerCase()) return;
    const key = /\bQ-[A-Za-z0-9]+-\d+\b/.exec(e.title)?.[0];
    if (!key || !existsSync(join(o.foundDir, `${key}.md`))) return;
    const raw = slurp(join(o.foundDir, `${key}.md`));
    const text = raw.replace(/\s+/g, ' ').trim();
    const line = findingLine(raw);
    const files = [];
    const take = (s0) => {
      const s = s0.trim().replace(/[.,;:]+$/, '');
      if (s && !/\s/.test(s) && !files.includes(s) && existsSync(join(o.repo, s))) files.push(s);
    };
    // The files a Fix in line names are the finding's files, ahead of any other name in its text.
    if (line?.kind === 'fix-in') for (const m of line.rest.matchAll(/`([^`\n]+)`/g)) take(m[1]);
    for (const m of text.matchAll(/`([^`\n]+)`/g)) take(m[1]);
    const putRight = line ? '' : putRightSentence(text);
    const left = line?.kind === 'put-right' || line?.kind === 'not-repo';
    const unplaced = !left && !putRight && (line?.kind === 'not-placed' || files.length === 0);
    out.push({ key, item: e.key, rank, text, files, home: files[0] ?? '', putRight, counts: countsList(text), line: line?.kind ?? '', left, unplaced });
  });
  return out;
}

/**
 * Whether a finding's fix counts a list (Q-HUB-397).
 * @param {string} text  the finding's file, its whitespace collapsed to single spaces.
 * @returns {boolean} true when the text says the fix counts a list, or that a counted list changes, in the words "counts a list", "count the list" or "counted list".
 *   Every file such a finding names is a place of that list, so the step that takes the finding owns all of them.
 */
export function countsList(text) {
  return /\bcounts?\s+(?:a|the|one|each|every)\s+(?:\w+\s+){0,2}list\b|\bcounted\s+(?:\w+\s+){0,2}list\b/i.test(String(text ?? ''));
}

/**
 * Print the batch: the open findings of the repository grouped by the file each names, as a plan in the plan's own shape.
 * @param {{repo?: string, plan?: string, steps?: number, size?: number, wave?: number, rounds?: number|string, hub?: string, now?: Date}} o  `rounds` is how many waves
 *   the one plan holds, each as a round with its own file steps and landing step; absent or one is the print of a single wave.
 * @returns {{ok: boolean, text: string}} the print, or the error when the repository holds no open finding, when `rounds` is not a whole number from one to five, or
 *   when fewer waves remain than rounds are asked for.
 */
export function batchSeed(o) {
  const asked = o.rounds === undefined || o.rounds === null ? 1 : Number(o.rounds);
  if (!Number.isInteger(asked) || asked < 1 || asked > 5) return { ok: false, text: `plan-seed: --rounds takes a whole number from one to five, and ${String(o.rounds)} is not one, so no plan is printed.\n` };
  return batchWave({ ...o, rounds: asked });
}

/**
 * One wave of the batch as a plan, or (with `part`) one round of a plan of several: the part a later round contributes to the first round's print.
 * @param {object} o  the options of `batchSeed` with `rounds` a number; `part` makes it return the round's steps and numbers and no print, `firstStep` is the number of its
 *   first file step and `lastRound` whether its landing step is the plan's last, which pulls the live clone.
 * @returns {{ok: boolean, text?: string, part?: object}}
 */
function batchWave(o) {
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
  // A finding whose file ends with a Put right already line or a Not the repository's line is in no batch, and one with a Not placed line, or with no line and no file in its
  // text, gets no step because no file can be given to it: the first kind is counted and named in the header, the second after the plan's end.
  const leftOut = findings.filter((f) => f.left);
  const notPlaced = findings.filter((f) => f.unplaced);
  const byHome = new Map();
  for (const f of findings) { if (f.putRight || f.left || f.unplaced) continue; if (!byHome.has(f.home)) byHome.set(f.home, []); byHome.get(f.home).push(f); }
  const homes = [...byHome.keys()].sort((a, b) => byHome.get(a)[0].rank - byHome.get(b)[0].rank);
  let groups = [];
  // A guard the suite covers has its own case file under the guard cases folder, named for the guard; a repository with no such folder has none.
  const caseFileOf = (x) => (/\.mjs$/.test(x) && !x.includes('/') && x !== 'session-guards.test.mjs' && existsSync(join(repo, 'guard-cases')) ? `guard-cases/${x}` : '');
  for (const h of homes) {
    const fs = byHome.get(h);
    for (let i = 0; i < fs.length; i += size) groups.push({ home: h, list: fs.slice(i, i + size) });
  }
  // A finding whose fix counts a list owns every file it names, because each is a place of that list and the step that counts it must change them all (Q-HUB-397).
  groups = groups.map((g) => ({ ...g, homes: [...new Set([g.home, ...g.list.filter((f) => f.counts).flatMap((f) => f.files)])] }));
  // The files a group owns are every file under its homes (a folder is every file in it) and the case file of each; two groups that would own one file are
  // one group, so no file belongs to two steps (Q-HUB-371).
  const claimsOf = (g) => {
    const s = new Set();
    for (const h of g.homes) for (const y of filesUnder(repo, h)) { s.add(y); const c = caseFileOf(y); if (c) s.add(c); }
    return s;
  };
  groups = mergeSharing(groups, claimsOf);
  for (const g of groups) g.claims = claimsOf(g);
  const limit = Math.floor(Number(o.steps) || 0);
  if (limit > 0) groups = groups.slice(0, limit);
  if (!o.part && !groups.length && !putRight.length) {
    return { ok: false, text: `plan-seed: every open finding of ${repoName} is left out of every batch (${leftOut.map((f) => f.key).join(', ') || 'none'}) or is not placed (${notPlaced.map((f) => f.key).join(', ') || 'none'}), so there is no batch to print.\n` };
  }
  // The file steps of a wave run at the same time in the one working copy, so a wave holds up to WAVE groups in rank order and never two groups of one
  // file (the second run of a cut group waits for a later wave); the groups the wave leaves are printed by the next wave.
  const waves = [];
  for (let pending = [...groups]; pending.length;) {
    const used = new Set();
    const w = [];
    const rest = [];
    for (const g of pending) {
      if (w.length < WAVE && ![...g.claims].some((x) => used.has(x))) { w.push(g); for (const x of g.claims) used.add(x); } else rest.push(g);
    }
    waves.push(w);
    pending = rest;
  }
  const waveNo = Math.min(Math.max(1, Math.floor(Number(o.wave) || 1)), Math.max(1, waves.length));
  const R = o.rounds ?? 1;
  // Each round is one wave, so a plan of several rounds needs that many waves from the one asked for.
  if (R > 1 && waves.length - (waveNo - 1) < R) {
    const left = Math.max(0, waves.length - (waveNo - 1));
    return { ok: false, text: `plan-seed: ${R} rounds are asked for and ${left} ${left === 1 ? 'wave remains' : 'waves remain'} from wave ${waveNo}, so no plan is printed.\n` };
  }
  const totalGroups = groups.length;
  const leaves = waves.slice(waveNo + R - 1).reduce((s, w) => s + w.length, 0);
  groups = waves[waveNo - 1] ?? [];
  const plannedHere = groups.flatMap((g) => g.list);

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
  const g1 = o.firstStep ?? takeup + 1;
  // The landing step comes after the last file step of the wave and holds the proof, every commit, the close and the push; it is also the close, so there is no commit step apart from it.
  const landing = g1 + groups.length;
  const close = landing;
  // The rounds after the first are built by this function itself in its part mode, each numbered on from the landing step before it; only the last round's landing step
  // pulls the live clone (Q-HUB-404).
  const later = [];
  for (let k = 1, first = landing + 1; k < R; k++) {
    const p = batchWave({ ...o, rounds: 1, wave: waveNo + k, part: true, firstStep: first, lastRound: k === R - 1 });
    if (!p.ok) return p;
    later.push(p.part);
    first = p.part.landing + 1;
  }
  const lastRound = o.part ? o.lastRound === true : later.length === 0;
  const lastLanding = later.length ? later[later.length - 1].landing : landing;
  const review = lastLanding + 1;
  const planned = [...plannedHere, ...later.flatMap((p) => p.planned)];
  const batch = [...putRight, ...planned];
  const nGroups = groups.length + later.reduce((s, p) => s + p.gnums.length, 0);
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
  vars.TAKEUPLANDING = fill(tpl['landing-takeup'] ?? '<plans/seed-template.md has no landing-takeup block>', vars);
  const takeupVars = { ...vars, ITEM: planned.map((f) => f.item).join(', ') };
  takeupVars.FINDKEYS = planned.map((f) => f.key).join(', ');
  // Each check is spelled as its own usage gives (Q-HUB-308): the docs check takes the repository's path bare, the lessons check none, and the quote,
  // privacy, third-person, example and pin checks take it after the repo flag.
  const checks = ['docs-check', 'privacy-check', 'quote-check', 'third-person-check', 'lessons-check', 'example-check', 'pin-check'].map((c) => {
    const base = `node ${vars.HUB}/${c}.mjs`;
    return `\`${c === 'docs-check' ? `${base} ${repo}` : c === 'lessons-check' ? base : `${base} --repo ${repo}`}\``;
  }).join(', ');

  // ---- the files each step of the wave owns: the first step to name a file owns it, and every other step naming it holds a seam written into both ----
  // Every file has one owner (Q-HUB-371). First the files each group owns by its homes and their case files, which no two groups share; then the files the plants of
  // those case files target, which belong to the step whose case file plants them (the seed's template is the seed step's, whoever else names it first); then a file
  // a finding names that nobody owns, which goes to the first step to name it. A folder is every file under it.
  const owner = new Map();
  groups.forEach((g, i) => { for (const x of g.claims) if (!owner.has(x)) owner.set(x, i); });
  groups.forEach((g, i) => {
    for (const c of new Set([...g.claims].map(caseFileOf).filter(Boolean))) {
      for (const t of plantTargets(slurp(join(repo, c)))) {
        if (!existsSync(join(repo, t)) || owner.has(t)) continue;
        owner.set(t, i);
        const tc = caseFileOf(t);
        if (tc && !owner.has(tc)) owner.set(tc, i);
      }
    }
  });
  const namedFiles = new Set();
  groups.forEach((g, i) => {
    for (const f of g.list) {
      for (const x of f.files) {
        for (const y of filesUnder(repo, x)) {
          namedFiles.add(y);
          if (owner.has(y)) continue;
          owner.set(y, i);
          const c = caseFileOf(y);
          if (c && !owner.has(c)) owner.set(c, i);
        }
      }
    }
  });
  // A case file belongs to the step that owns its guard file and to that step only (Q-HUB-397): a step that named the case file first loses it to the guard's step.
  for (const [x, i] of [...owner]) { const c = caseFileOf(x); if (c && owner.has(c) && owner.get(c) !== i) owner.set(c, i); }
  // A file a finding names that another step owns is a seam, written into both steps.
  const seamsOut = groups.map(() => new Set());
  const seamsIn = groups.map(() => new Set());
  groups.forEach((g, i) => {
    for (const f of g.list) {
      for (const x of f.files) {
        for (const j of new Set(filesUnder(repo, x).map((y) => owner.get(y)).filter((o) => o !== undefined && o !== i))) {
          seamsOut[i].add(`${f.key} names \`${x}\` too, which step ${g1 + j} owns, so this step does not touch it and the part of ${f.key} that sits in \`${x}\` is made in that step`);
          seamsIn[j].add(`step ${g1 + i} takes up ${f.key}, whose text names \`${x}\`, which this step owns, so the part of ${f.key} that sits in \`${x}\` is made here`);
        }
      }
    }
  });
  const ownedFiles = (i) => [...owner].filter(([, j]) => j === i).map(([x]) => x);
  // What a step's text says it owns: a folder it owns whole by its name, the other files each, and its case files apart from both.
  const ownedView = (i) => {
    const files = ownedFiles(i);
    const mine = new Set(files);
    const covered = new Set();
    const names = [];
    for (const f of groups[i].list) {
      for (const x of f.files) {
        const under = filesUnder(repo, x);
        let isDir = false;
        try { isDir = statSync(join(repo, x)).isDirectory(); } catch { /* not there */ }
        if (isDir && under.length && under.every((y) => mine.has(y)) && !names.includes(x)) { names.push(x); for (const y of under) covered.add(y); }
      }
    }
    const cases = [...new Set(files.map(caseFileOf).filter(Boolean))].filter((c) => !covered.has(c));
    for (const y of files) if (!covered.has(y) && !cases.includes(y)) names.push(y);
    return { names, cases };
  };
  const caseFiles = [...new Set(groups.flatMap((_, i) => ownedFiles(i).map(caseFileOf).filter(Boolean)))];
  // The files the landing step runs the plants of: each guard file a step owns, and each file that a plant of the wave's case files or of the suite file targets and a finding
  // of the wave names (Q-HUB-363: the template's plants were left to the runner; Q-HUB-396: so were the suite file's and a doctrine page's).
  const suiteText = slurp(join(repo, 'session-guards.test.mjs'));
  const guardFiles = [...new Set([...groups.flatMap((_, i) => ownedFiles(i).filter(caseFileOf)),
    ...caseFiles.flatMap((c) => plantTargets(slurp(join(repo, c))).filter((t) => namedFiles.has(t))),
    ...plantTargets(suiteText).filter((t) => namedFiles.has(t))])];
  const estOf = (s) => Number(/Estimate (\d+) min/.exec(s)?.[1] ?? 0);
  const takeupEst = estOf(fill(tpl['take-up-batch'] ?? '', takeupVars));
  const groupEst = groups.map((g) => 15 + 5 * g.list.length);
  const landEst = 20 + 5 * groups.length;
  const agentMin = takeupEst + groupEst.reduce((s, x) => s + x, 0) + landEst;
  const wallMin = takeupEst + Math.max(0, ...groupEst) + landEst;
  const cvars = { ...vars, LANDSTEP: landing, FIRSTGROUP: groups.length ? g1 : takeup, LASTGROUP: groups.length ? g1 + groups.length - 1 : takeup, LANDEST: landEst, CHECKS: checks,
    GUARDFILES: guardFiles.length ? guardFiles.map((x) => `\`${x}\``).join(', ') : 'none, since no file of this wave is a guard file' };

  const out = [];
  const L = (s = '') => out.push(s);
  L(`PLAN SEED for the batch of ${batch.length} open findings of ${repoName}, in ${nGroups} group ${nGroups === 1 ? 'step' : 'steps'}, repository ${basename(repo)}, printed ${stamp}.`);
  if (R > 1) L(`This is ${R} rounds of one plan, waves ${waveNo} to ${waveNo + R - 1} of ${waves.length}: each round's file steps run at the same time, the most a wave holds being ${WAVE}, and the print leaves ${leaves} of the ${totalGroups} groups${leaves ? `, which \`node plan-seed.mjs --batch --wave ${waveNo + R}\` prints once these rounds have landed` : ' for no later wave'}.`);
  else L(`This is wave ${waveNo} of ${waves.length || 1}: its ${groups.length} file ${groups.length === 1 ? 'step runs' : 'steps run'} at the same time, the most a wave holds being ${WAVE}, and it leaves ${leaves} of the ${totalGroups} groups${leaves ? `, which \`node plan-seed.mjs --batch --wave ${waveNo + 1}\` prints once this wave has landed` : ' for no later wave'}.`);
  if (leftOut.length) L(`${leftOut.length} open ${leftOut.length === 1 ? 'finding is' : 'findings are'} left out of every batch, because the last line of ${leftOut.length === 1 ? 'its file' : 'each file'} says ${leftOut.length === 1 ? 'it is' : 'the finding is'} put right already or not the repository's: ${leftOut.map((f) => f.key).join(', ')}.`);
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
  // One clause pair for each round: its file steps serve goal 1 and its landing step serves goals 1, 5 and 6.
  const servedRound = (gn, lg) => [...(gn.length ? [`step${gn.length === 1 ? '' : 's'} ${gn.length === 1 ? gn[0] : `${gn[0]} to ${gn[gn.length - 1]}`} ${gn.length === 1 ? 'serves' : 'serve'} goal 1`] : []), `step ${lg} serves goals 1, 5 and 6`];
  const servedBy = [`step ${takeup} serves goals 5 and 6`, ...servedRound(gnums, landing), ...later.flatMap((p) => servedRound(p.gnums, p.landing)), `step ${review} serves goals 3, 5 and 6`];
  L(`Served by: ${servedBy.join('; ')}.`);
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
  L(findingsPassedIn(`step ${lastLanding}, the landing step,`));
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
  // The file steps of the wave run together and commit nothing, so the standing text of a parallel batch follows.
  if (groups.length) L(fill(tpl['parallel-rules'] ?? '<plans/seed-template.md has no parallel-rules block>', cvars));
  // A later round has its own file steps run at the same time: the block's first line, which names them, is printed again for each, and the rest of the block holds for all.
  for (const p of later) L(p.rule);
  L();
  // The take-up is first and alone, every file step comes after it and the one landing step after every file step; no commit step and no close step stand apart from the landing step.
  const order = [takeup, ...gnums, landing, ...later.flatMap((p) => [...p.gnums, p.landing])];
  L('## Order');
  L();
  L(`Order: ${order.join(' ')}`);
  L(`Standing: ${review}`);
  // The first round's file steps follow the take-up; each later round's follow the landing step of the round before.
  const after = [...gnums.map((n) => `${n} after ${takeup}`), `${landing} after ${gnums.length ? gnums.join(' ') : takeup}`];
  later.forEach((p, k) => {
    const before = k === 0 ? landing : later[k - 1].landing;
    after.push(...p.gnums.map((n) => `${n} after ${before}`), `${p.landing} after ${p.gnums.length ? p.gnums.join(' ') : before}`);
  });
  L(`After: ${after.join('; ')}`);
  L();
  L('## Steps');
  L();
  L(fill(tpl['take-up-batch'] ?? '<plans/seed-template.md has no take-up-batch block>', takeupVars));
  L();
  const stepsFrom = out.length;
  const stepOf = new Map();
  groups.forEach((g, i) => {
    const n = g1 + i;
    const ks = g.list.map((f) => f.key);
    g.list.forEach((f) => stepOf.set(f.key, n));
    const where = g.homes.map((h) => `\`${h}\``).join(', ');
    const view = ownedView(i);
    const owned = view.names;
    const cases = view.cases;
    const quote = (xs) => xs.map((x) => `\`${x}\``).join(', ');
    const ownedText = owned.length ? `${quote(owned)}${cases.length ? ` and its own case file${cases.length === 1 ? '' : 's'} ${cases.map((c) => `\`${c}\`${existsSync(join(repo, c)) ? '' : ' (new)'}`).join(', ')}` : ''}` : 'no file by name';
    const doEach = g.list.map((f) => `for ${f.key} (item ${f.item}) make the change its text names${f.files.length ? ` in ${f.files.map((x) => `\`${x}\``).join(', ')}` : ' in the files its text names'}`).join('; ');
    const others = groups.map((_, j) => g1 + j).filter((m) => m !== n);
    const together = others.length ? `, run at the same time as step${others.length === 1 ? '' : 's'} ${others.join(', ')}` : '';
    const seams = [...seamsOut[i], ...seamsIn[i]];
    const caseDo = cases.length ? `write into ${quote(cases)} a case that fails on the old text and a plant for each fix, in the shape of the case files beside it; ` : '';
    // The six parts of the order are the plan's rule for a file step, and the step's text points at it (Q-HUB-399).
    L(`${n}. **Put right in ${where}: ${ks.join(', ')}.** ${isHub ? 'Hub' : basename(repo)}, one agent${together}. Facts: the step owns ${ownedText} and writes nothing else, commits nothing and stages nothing; ${seams.length ? `${seams.join('; ')}; ` : ''}the step takes up ${ks.length} filed ${ks.length === 1 ? 'finding' : 'findings'}, each read whole from its file at the time of use; ${g.list.map((f) => `${f.key} (item ${f.item}): ${f.text}`).join(' ')} The landing step, step ${landing}, lands this step's edits. Do: \`git status\`, read as the rules of this plan allow; read with Read and Grep ${owned.length ? quote([...owned, ...cases.filter((c) => existsSync(join(repo, c)))]) : 'the files its findings name'}; ${doEach}; ${caseDo}then the six parts of the order the rules of this plan give a file step; a line a fix needs in a file another step of this plan owns is named in the report with the file, the place and the exact words, for the landing step, and is not written by this step; \`git status\`, read as the rules of this plan allow; write the report with the files changed, each case added, each new plant with its key and its CAUGHT line, each check's exit code and any find reworded, each stale plant re-pointed or named with its file, each line named for the landing step, and each finding's change in one line. Observe: the step's cases pass, each in a run of its own, every new plant reads CAUGHT, the three checks name no find in a line the step wrote, the files this step owns are changed and nothing else by this step, nothing is staged or committed. Kill: a red run of a case of its own ends it FAILED with its lines and nothing written after but the report; a part of its own that cannot be made or proved without a line in a file it does not own ends it EJECT naming the lines; a refusal of a command by a guard or by the harness's permission check ends it REFUSED with the refusal's words, nothing further done and no other route tried. Report \`progress/step-${n}-report.txt\` (new); ${SEND_REPORT}. Estimate ${groupEst[i]} min.`);
    L();
  });
  // The plan's last landing step pulls the live clone; a landing step of an earlier round leaves it as it is and does not record the measure.
  const landingBlock = lastRound ? 'landing-step' : 'landing-round';
  L(fill(tpl[landingBlock] ?? `<plans/seed-template.md has no ${landingBlock} block>`, { ...cvars, ITEM: plannedHere.map((f) => f.item).join(', ') }));
  L();
  if (o.part) {
    return { ok: true, part: { planned: plannedHere, gnums: groups.map((_, i) => g1 + i), landing, lines: out.slice(stepsFrom), caseFiles, groupEst, landEst, stepOf: [...stepOf],
      rule: fill(tpl['parallel-rules'] ?? '<plans/seed-template.md has no parallel-rules block>', cvars).split('\n')[0] } };
  }
  for (const p of later) for (const l of p.lines) L(l);
  for (const p of later) for (const [k, n] of p.stepOf) stepOf.set(k, n);
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
  const mine = [...(named.some((x) => x.endsWith('.mjs')) ? ['session-guards.test.mjs'] : []), ...named, ...caseFiles, ...later.flatMap((p) => p.caseFiles)].filter((x, i, a) => a.indexOf(x) === i);
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
  const nSteps = groups.length + 2;
  if (R > 1) {
    // A plan of rounds: the sends and the minutes of each round, one push for the take-up and one for each round.
    const rounds = [{ n: groups.length, landing, groupEst, landEst }, ...later.map((p) => ({ n: p.gnums.length, landing: p.landing, groupEst: p.groupEst, landEst: p.landEst }))];
    const sum = (xs) => xs.reduce((s, x) => s + x, 0);
    const allSteps = sum(rounds.map((r) => r.n)) + R + 1;
    const agentAll = takeupEst + sum(rounds.map((r) => sum(r.groupEst) + r.landEst));
    const wallAll = takeupEst + sum(rounds.map((r) => Math.max(0, ...r.groupEst) + r.landEst));
    const each = rounds.map((r, i) => `round ${i + 1} sends its ${r.n} file ${r.n === 1 ? 'step' : 'steps'} at once and then its landing step, step ${r.landing}`).join('; ');
    L(`The ${allSteps} steps (${sum(rounds.map((r) => r.n))} file steps, run at the same time within their ${R} rounds, with the take-up and the ${R} landing steps) run on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. In turn: ${each}. Agent time is the sum of the steps' estimates, ${agentAll} min; wall time is the take-up and then, for each round, its longest file step and its landing step, ${wallAll} min. ${R + 1} pushes are made, one by the take-up and one by the landing step of each round, each rebased onto the remote's head. ${allSteps} forced turns of the stop hook are spent while a commit stands unpushed, the file steps plus the take-up and the ${R} landing steps. <The main thread's tier for the writing and for the management.>`);
  } else
  L(`The ${nSteps} steps (${groups.length} file ${groups.length === 1 ? 'step' : 'steps'} run at the same time, with the take-up and the landing step) run on the sonnet tier with one agent for each, and a review is sent at the plan's first send and after an eject, a failure, a refusal or a correction, where the review gate asks for one, and at no other move. Agent time is the sum of the steps' estimates, ${agentMin} min; wall time is the take-up, the longest file step and the landing step, ${wallMin} min. 2 pushes are made, one each by the take-up and the landing step, each rebased onto the remote's head. ${groups.length + 2} forced turns of the stop hook are spent while a commit stands unpushed, the file steps plus two. <The main thread's tier for the writing and for the management.>`);
  L();
  L('## Verification');
  L();
  L('- <What is observed at the end that shows the batch\'s acceptance, each as one line.>');
  L(closeKeysLine(`step ${lastLanding}, the landing step,`));
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
  if (notPlaced.length) {
    L();
    L(`NOT PLACED, for the plan's writer to place, because no step of this print owns a file for ${notPlaced.length === 1 ? 'it' : 'them'}: ${notPlaced.map((f) => `${f.key} (item ${f.item})`).join(', ')}.`);
  }
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
    const b = batchSeed({ repo: val('--repo'), plan: val('--plan'), steps: val('--steps'), size: val('--size'), wave: val('--wave'), rounds: val('--rounds'), hub: val('--hub') });
    emit(b, b.ok ? val('--out') : undefined);
    process.exit(b.ok ? 0 : 1);
  }
  if (!val('--item')) {
    process.stdout.write('usage: node plan-seed.mjs --item <P-key | next | new> | --batch [--size <n>] [--steps <n>] [--wave <n>] [--rounds <1 to 5>] [--repo <full path>] [--plan <path>] [--hub <full path>] [--out <path>]\n');
    process.exit(1);
  }
  const r = seed({ item: val('--item'), repo: val('--repo'), plan: val('--plan'), steps: val('--steps'), hub: val('--hub') });
  emit(r, r.ok ? val('--out') : undefined);
  process.exit(r.ok ? 0 : 1);
}
