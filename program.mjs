#!/usr/bin/env node
/**
 * THE PROGRAM'S ACTS AS FIVE COMMANDS (Q-HUB-473).
 *
 * The claim of an item, the filing of a finding, the close of an item, the cost entry of a plan and the writing of a lesson were prose that a plan
 * typed out and an agent performed by hand, and the close came out written differently each time. Each is one verb here, and each prints what it wrote.
 *
 * Usage:  node program.mjs <verb> [switches]      (the repository's root is --root <path>, and this file's own folder otherwise)
 *   claim P-12 P-13 --plan <plan file>             sets each open item planned, with the plan's title on its plan line
 *   file <findings.json>                           files each finding: its file in found/, its item in the program, both counts raised
 *   done --item "P-12=One sentence." [--item ...]  sets each item done, with its Done sentence
 *   measure <session transcript> [--root ...]      writes the close entry of the plan last approved in the transcript under P-10, from session-cost.mjs
 *   lesson --title <t> --declaration <d> --body <file>   writes the next lesson's file and its row in LESSONS.md
 *
 * A verb that refuses writes nothing, names each cause on its own line and exits 1. A verb that writes prints one line for each thing it wrote.
 * The findings file is a JSON array (or an object with a findings array); each finding holds text, kind (Fix in, Put right already, Not the
 * repository's or Not placed, or fix-in, put-right, not-repo, not-placed), files (paths, code-spanned in the finding's last line), sentence,
 * goal (a number) and acceptance, and may hold title.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { programEntries } from './plan-seed.mjs';
import { DISCLOSURE, ATTRIBUTION, OWNER_LIFE, SESSION_LINKS } from './privacy-patterns.mjs';
import { PRONOUN_G, POSSESSIVE_G, ATTRIBUTION_G } from './third-person-check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TAG = 'Q-HUB';
const KINDS = { 'fix in': ['Fix in', 'fix-in'], 'fix-in': ['Fix in', 'fix-in'], 'put right already': ['Put right already', 'put-right'], 'put-right': ['Put right already', 'put-right'],
  'not the repository\'s': ['Not the repository\'s', 'not-repo'], 'not-repo': ['Not the repository\'s', 'not-repo'], 'not placed': ['Not placed', 'not-placed'], 'not-placed': ['Not placed', 'not-placed'] };

const slurp = (f) => { try { return readFileSync(f, 'utf8'); } catch { return null; } };
/** The value of a switch (the word after it), or undefined. */
const argVal = (a, f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
/** Every value of a repeated switch. */
const argVals = (a, f) => a.flatMap((x, i) => (x === f && a[i + 1] !== undefined ? [a[i + 1]] : []));

/** A refusal: every cause on its own line, nothing written, exit 1. */
function refuse(verb, causes) {
  for (const c of causes) process.stdout.write(`program ${verb}: REFUSED, ${c}\n`);
  process.stdout.write(`program ${verb}: nothing written\n`);
  process.exit(1);
}

/** The same regular expression without its global flag, so a test starts from the beginning each time. */
const plain = (re) => new RegExp(re.source, re.flags.replace('g', ''));

/**
 * The classes of attribution and disclosure a text holds, by class and number and never by the matched words, because a line that quoted its find
 * would republish it in a log.
 * @param {string} text  a text about to be written into the repository.
 * @returns {string[]} one label for each pattern that matches.
 */
export function textFaults(text) {
  const out = [];
  const classes = [['disclosure', DISCLOSURE], ['attribution', ATTRIBUTION], ['life', OWNER_LIFE], ['session link', SESSION_LINKS], ['third person', [PRONOUN_G, POSSESSIVE_G, ATTRIBUTION_G]]];
  for (const [label, list] of classes) list.forEach((re, i) => { if (plain(re).test(String(text ?? ''))) out.push(`${label} pattern ${i + 1}`); });
  return out;
}

/** The index of the line that opens an entry, and the end of its block (the next heading of level two or three). */
function blockOf(lines, key) {
  const start = lines.findIndex((l) => l.startsWith(`### ${key}. `));
  if (start < 0) return null;
  let end = lines.length;
  for (let j = start + 1; j < lines.length; j++) if (/^#{2,3} /.test(lines[j])) { end = j; break; }
  return { start, end };
}

/** The line of an entry that opens with Repository, in the block, or -1. */
const repoLine = (lines, b) => { for (let j = b.start; j < b.end; j++) if (lines[j].startsWith('Repository:')) return j; return -1; };

const lastTrim = (s) => String(s).replace(/\s+$/, '');
const noStop = (s) => String(s).trim().replace(/[.\s]+$/, '');

function paths(root) {
  return { program: join(root, 'PROGRAM.md'), found: join(root, 'found'), lessons: join(root, 'lessons'), lessonsMd: join(root, 'LESSONS.md') };
}

function write(root, file, text, wrote) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
  wrote.push(file.startsWith(root) ? file.slice(root.length + 1) : file);
}

function claim(a, root) {
  const P = paths(root);
  const keys = a.filter((x) => /^P-\d+$/.test(x));
  const planFile = argVal(a, '--plan');
  const causes = [];
  if (!keys.length) causes.push('no program key was named');
  if (!planFile) causes.push('no --plan file was named');
  const plan = planFile ? slurp(planFile) : null;
  if (planFile && plan === null) causes.push(`the plan file ${planFile} cannot be read`);
  const title = plan === null ? '' : noStop(/^#\s+(.+)$/m.exec(plan)?.[1] ?? '');
  if (plan !== null && !title) causes.push('the plan file has no title line');
  const text = slurp(P.program);
  if (text === null) causes.push('PROGRAM.md cannot be read');
  if (causes.length) refuse('claim', causes);
  const lines = text.split('\n');
  const entries = programEntries(text);
  for (const k of keys) {
    const e = entries.find((x) => x.key === k);
    if (!e) causes.push(`${k} is not an item of the program`);
    else if (e.state !== 'open') causes.push(`${k} is ${e.state || 'in no state'} and not open`);
  }
  if (causes.length) refuse('claim', causes);
  for (const k of keys) {
    const b = blockOf(lines, k);
    const r = repoLine(lines, b);
    if (r < 0) { causes.push(`${k} has no Repository line`); continue; }
    lines[r] = lines[r].replace(/State:\s*open\.\s*Plan:.*$/, () => `State: planned. Plan: ${title}.`);
  }
  if (causes.length) refuse('claim', causes);
  const wrote = [];
  write(root, P.program, lines.join('\n'), wrote);
  for (const k of keys) process.stdout.write(`program claim: ${k} is planned under the plan ${title}\n`);
  process.stdout.write(`program claim: wrote ${wrote.join(', ')}\n`);
}

function done(a, root) {
  const P = paths(root);
  const items = argVals(a, '--item').map((x) => { const i = x.indexOf('='); return i < 0 ? [x, ''] : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
  const causes = [];
  if (!items.length) causes.push('no --item KEY=sentence was given');
  const text = slurp(P.program);
  if (text === null) causes.push('PROGRAM.md cannot be read');
  if (causes.length) refuse('done', causes);
  const lines = text.split('\n');
  const entries = programEntries(text);
  items.forEach(([k, s], n) => {
    if (!/^P-\d+$/.test(k)) causes.push(`item ${n + 1} names ${JSON.stringify(k)}, which is not a program key`);
    else if (!entries.some((e) => e.key === k)) causes.push(`${k} is not an item of the program`);
    if (!s) causes.push(`${k} has no sentence`);
    for (const f of textFaults(s)) causes.push(`the sentence of ${k} matches ${f}`);
  });
  if (causes.length) refuse('done', causes);
  // The entries are edited from the last up, so a line added to one never moves the heading of another that is still to be edited.
  const order = [...items].sort((x, y) => Number(y[0].slice(2)) - Number(x[0].slice(2)));
  for (const [k, s] of order) {
    const b = blockOf(lines, k);
    const r = repoLine(lines, b);
    if (r < 0) { causes.push(`${k} has no Repository line`); continue; }
    lines[r] = lines[r].replace(/State:\s*[\w-]+\./, 'State: done.');
    const at = lines.findIndex((l, j) => j > b.start && j < b.end && l.startsWith('Done:'));
    if (at >= 0) lines[at] = `Done: ${s}`; else lines.splice(r + 1, 0, '', `Done: ${s}`);
  }
  if (causes.length) refuse('done', causes);
  const wrote = [];
  write(root, P.program, lines.join('\n'), wrote);
  for (const [k] of items) process.stdout.write(`program done: ${k} is done\n`);
  process.stdout.write(`program done: wrote ${wrote.join(', ')}\n`);
}

/** The words a finding's text opens with, for a printed line. */
const firstWords = (t, count = 8) => String(t).trim().split(/\s+/).slice(0, count).join(' ');

function fileFindings(a, root) {
  const P = paths(root);
  const src = a.find((x) => !x.startsWith('--'));
  const causes = [];
  let list = null;
  if (!src) causes.push('no findings file was named');
  else {
    const raw = slurp(src);
    if (raw === null) causes.push(`${src} cannot be read`);
    else { try { const j = JSON.parse(raw); list = Array.isArray(j) ? j : j?.findings; } catch (e) { causes.push(`${src} is not JSON: ${String(e.message).split('\n')[0]}`); } }
    if (raw !== null && !Array.isArray(list) && !causes.length) causes.push(`${src} holds no array of findings`);
  }
  const progText = slurp(P.program);
  if (progText === null) causes.push('PROGRAM.md cannot be read');
  if (causes.length) refuse('file', causes);
  // Every text is read before anything is written, because a heading of the close of 9 November carried an attribution and cost a review and a second send.
  list.forEach((f, i) => {
    const n = `entry ${i + 1} (${firstWords(f?.text ?? '', 3)})`;
    if (typeof f?.text !== 'string' || !f.text.trim()) { causes.push(`${n} has no text`); return; }
    if (!KINDS[String(f.kind ?? '').toLowerCase()]) causes.push(`${n} has a kind that is none of the four`);
    if (typeof f.sentence !== 'string' || !f.sentence.trim()) causes.push(`${n} has no sentence after the files of its last line`);
    if (typeof f.acceptance !== 'string' || !f.acceptance.trim()) causes.push(`${n} has no acceptance`);
    if (!Number.isInteger(Number(f.goal)) || Number(f.goal) < 1 || Number(f.goal) > 6) causes.push(`${n} has a goal that is not a number from 1 to 6`);
    if (f.files !== undefined && !(Array.isArray(f.files) && f.files.every((x) => typeof x === 'string' && x.trim() && !/[`\s]/.test(x)))) causes.push(`${n} has files that are not paths`);
    for (const field of ['text', 'sentence', 'acceptance', 'title']) for (const fault of textFaults(f?.[field])) causes.push(`${n}: ${field} matches ${fault}`);
  });
  if (causes.length) refuse('file', causes);
  const have = existsSync(P.found) ? readdirSync(P.found) : [];
  const existing = have.filter((n) => /^Q-HUB-\d+\.md$/.test(n)).map((n) => ({ key: n.replace(/\.md$/, ''), text: (slurp(join(P.found, n)) ?? '').split('\n')[0] }));
  let nextFound = 0;
  for (const e of existing) nextFound = Math.max(nextFound, Number(e.key.slice(TAG.length + 1)));
  for (const m of progText.matchAll(/^### P-\d+\.\s*Q-HUB-(\d+)\b/gm)) nextFound = Math.max(nextFound, Number(m[1]));
  nextFound += 1;
  let nextItem = 0;
  for (const e of programEntries(progText)) nextItem = Math.max(nextItem, e.n);
  nextItem += 1;
  const wrote = [];
  const lines = [];
  let filed = 0;
  let prog = progText.endsWith('\n') ? progText : `${progText}\n`;
  for (const f of list) {
    const text = f.text.trim();
    const dup = existing.find((e) => e.text.startsWith(`${e.key}: ${text}`));
    if (dup) { lines.push(`already filed as ${dup.key}: ${firstWords(text)}`); continue; }
    const key = `${TAG}-${nextFound}`;
    const [label] = KINDS[String(f.kind).toLowerCase()];
    const files = (f.files ?? []).map((x) => `\`${x}\``).join(', ');
    const last = `${label}: ${files ? `${files}. ` : ''}${f.sentence.trim()}`;
    write(root, join(P.found, `${key}.md`), `${key}: ${text}\n\n${last}\n`, wrote);
    const item = `P-${nextItem}`;
    const title = noStop(f.title ?? text.split(/(?<=\.)\s|\s\(/)[0]);
    prog += `\n### ${item}. ${key}: ${title}\n\nRepository: hub. Goal: ${Number(f.goal)}. State: open. Plan: none.\n\nAcceptance: ${f.acceptance.trim()}\n\nDepends: none.\n`;
    lines.push(`${key}, ${item}, ${firstWords(text)}`);
    existing.push({ key, text: `${key}: ${text}` });
    nextFound += 1; nextItem += 1; filed += 1;
  }
  if (filed) {
    let counted = prog;
    const items = /^(\d+) items\b/m.exec(counted);
    const finds = /\b(\d+) findings(?=, one for each key)/.exec(counted);
    const bad = [];
    if (!items) bad.push('the items count line is not where the program prints it');
    if (!finds) bad.push('the findings count is not where the program prints it');
    if (bad.length) refuse('file', bad);
    counted = counted.replace(/^(\d+) items\b/m, (all, n) => `${Number(n) + filed} items`);
    counted = counted.replace(/\b(\d+) findings(?=, one for each key)/, (all, n) => `${Number(n) + filed} findings`);
    write(root, P.program, counted, wrote);
  }
  for (const l of lines) process.stdout.write(`program file: ${l}\n`);
  process.stdout.write(`program file: ${filed} filed; wrote ${wrote.length ? wrote.join(', ') : 'nothing'}\n`);
}

/** The lines of one bucket of the instrument's print, from its heading to the next heading or the end. */
function bucketOf(out, re) {
  const ls = out.split('\n');
  const start = ls.findIndex((l) => re.test(l));
  if (start < 0) return null;
  let end = ls.length;
  for (let j = start + 1; j < ls.length; j++) if (ls[j].startsWith('## ') || ls[j].startsWith('# ') || ls[j].startsWith('The harness\'s own running cost entry')) { end = j; break; }
  return ls.slice(start, end);
}

/** The indented list under a line of a bucket. */
function listUnder(b, opener) {
  const i = b.findIndex((l) => l.startsWith(opener));
  const out = [];
  if (i < 0) return out;
  for (let j = i + 1; j < b.length && /^\s+- /.test(b[j]); j++) out.push(b[j].replace(/^\s+- /, ''));
  return out;
}

function measure(a, root) {
  const P = paths(root);
  const t = a.find((x) => !x.startsWith('--'));
  const causes = [];
  if (!t) causes.push('no transcript was named');
  const r = t ? spawnSync('node', [join(HERE, 'session-cost.mjs'), t], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024 }) : null;
  if (r && (r.error || r.status !== 0)) causes.push(`the cost instrument did not run: ${String(r.error?.message ?? `exit ${r.status}`)}`);
  const out = r ? String(r.stdout) : '';
  if (r && !causes.length && /PLANTED COUNTS DO NOT MATCH|SKIPPED|REFUSED/.test(out)) causes.push('the cost instrument refused the transcript or failed its own planted counts');
  const text = slurp(P.program);
  if (text === null) causes.push('PROGRAM.md cannot be read');
  if (causes.length) refuse('measure', causes);
  const plans = [...out.matchAll(/^## Plan (\d+) \((.*)\), approved (.*)$/gm)];
  const last = plans[plans.length - 1];
  if (!last) refuse('measure', ['the instrument printed no approved plan for the transcript']);
  const b = bucketOf(out, new RegExp(`^## Plan ${last[1]} \\(`));
  const tot = bucketOf(out, /^## Total over every transcript/);
  const cost = /^The harness's own running cost entry, the last of ([\d,]+): total (\S+) dollars/m.exec(out);
  const num = (re, src = b) => { const m = re.exec(src.join('\n')); return m ? m.slice(1) : null; };
  const own = num(/^Owner messages: ([\d,]+) \(ending in a go-word: ([\d,]+); not ending in one: ([\d,]+), of which carrying the whole word stop: ([\d,]+)\)/m);
  const stops = num(/^Stop-hook refusals, from the system entries that sum the stop hooks: ([\d,]+) messages in ([\d,]+) stops/m);
  const refs = num(/^Hook refusals on the main thread, by the gate named in their text: ([\d,]+)/m);
  const ag = num(/^Agents: ([\d,]+), by the model/m);
  const agRef = num(/^Agent hook refusals by the gate named in their text: ([\d,]+)/m);
  const comp = num(/^Compactions: ([\d,]+)/m);
  const starts = num(/^Starts: ([\d,]+); resumes: ([\d,]+)/m);
  const totOwn = tot ? num(/^Owner messages: ([\d,]+) \(ending in a go-word: ([\d,]+); not ending in one: ([\d,]+), of which carrying the whole word stop: ([\d,]+)\)/m, tot) : null;
  const totAg = tot ? num(/^Agents: ([\d,]+), by the model/m, tot) : null;
  const totComp = tot ? num(/^Compactions: ([\d,]+)/m, tot) : null;
  const totStarts = tot ? num(/^Starts: ([\d,]+); resumes: ([\d,]+)/m, tot) : null;
  const missing = [['owner messages', own], ['stop-hook refusals', stops], ['main-thread refusals', refs], ['agents', ag], ['agent hook refusals', agRef], ['compactions', comp], ['starts and resumes', starts]].filter(([, v]) => !v).map(([n]) => n);
  if (missing.length) refuse('measure', missing.map((n) => `the instrument's print for the plan holds no line for ${n}`));
  const gates = (opener) => listUnder(b, opener).map((x) => { const m = /^([\d,]+)\s+(.*)$/.exec(x); return m ? `${m[2]} ${m[1]}` : x; }).join(', ');
  const turns = listUnder(b, 'Main-thread turns by serving model').map((x) => { const m = /^(.*?): ([\d,]+) turns \(.*?\), input [\d,]+, output ([\d,]+),/.exec(x); return m ? `${m[2]} on ${m[1]} with ${m[3]} output tokens` : x; });
  const use = listUnder(b, 'Agent usage by model').map((x) => { const m = /^(.*?): ([\d,]+) turns \(.*?\), input [\d,]+, output ([\d,]+), cache read ([\d,]+), cache written ([\d,]+)/.exec(x); return m ? `${m[1]} with ${m[3]} output tokens, ${m[4]} cache-read tokens and ${m[5]} cache-written tokens` : x; });
  const planLabel = last[2];
  const entry = [
    `Close entry of the plan (${planLabel}), from the cost instrument run on this session's transcript, so far and before the push that follows. The instrument numbers it plan ${last[1]} and it was approved ${last[3]}:`,
    `- The owner's messages: ${own[0]} in the plan, of which ${own[1]} end in a go-word and ${own[2]} do not; ${own[3] === '0' ? 'none carries' : `${own[3]} carry`} the whole word stop.`,
    `- Stop-hook messages: ${stops[0]} in ${stops[1]} stops.`,
    `- Main-thread refusals: ${refs[0]}${refs[0] === '0' ? '' : ` (${gates('Hook refusals on the main thread')})`}.`,
    `- Agents: ${ag[0]}${use.length ? `, usage ${use.join('; ')}` : ''}; ${agRef[0]} hook refusals${agRef[0] === '0' ? '' : ` (${gates('Agent hook refusals by the gate')})`}.`,
    `- Main-thread turns: ${turns.length ? turns.join('; ') : 'none'}.`,
    `- Compactions: ${comp[0]}. Resumes: ${starts[1]}. Pushes: the instrument does not count them.`,
  ];
  if (totOwn && totAg && totComp && totStarts) entry.push(`- The whole transcript over its approved plans: ${totOwn[0]} owner messages (${totOwn[1]} go-words, ${totOwn[2]} without, ${totOwn[3]} carrying the whole word stop), ${totAg[0]} agents, ${totComp[0]} compactions, ${totStarts[1]} resumes.`);
  if (cost) entry.push(`- The harness's own running cost entry, the last of ${cost[1]}, reads ${cost[2]} dollars for the whole session; the transcript holds no price list and that entry lags the transcript, so no dollars are derived by plan (Q-HUB-132). Like every close entry written in a middle step it is short by what follows (Q-HUB-252): the agents of the sends after it are not in it.`);
  const lines = text.split('\n');
  const blk = blockOf(lines, 'P-10');
  if (!blk) refuse('measure', ['the program holds no item P-10']);
  let at = -1;
  for (let j = blk.start; j < blk.end; j++) if (lines[j].startsWith('- ')) at = j;
  if (at < 0) refuse('measure', ['P-10 holds no close entry to write beside']);
  lines.splice(at + 1, 0, '', ...entry);
  const wrote = [];
  write(root, P.program, lines.join('\n'), wrote);
  process.stdout.write(`program measure: wrote the close entry of plan ${last[1]} under P-10, ${entry.length} lines; wrote ${wrote.join(', ')}\n`);
}

const slug = (title) => String(title).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function lesson(a, root) {
  const P = paths(root);
  const title = (argVal(a, '--title') ?? '').trim();
  const decls = argVals(a, '--declaration').map((d) => d.trim().replace(/^\*\*Enforced by:\*\*\s*/, ''));
  const bodyFile = argVal(a, '--body');
  const causes = [];
  if (!title) causes.push('no --title was given');
  if (!decls.length) causes.push('no --declaration was given');
  const body = bodyFile ? slurp(bodyFile) : null;
  if (!bodyFile) causes.push('no --body file was given'); else if (body === null) causes.push(`the body file ${bodyFile} cannot be read`);
  for (const d of decls) {
    const m = /^(GATE|CHECKLIST|JUDGEMENT)\b\s*(.*)$/.exec(d);
    if (!m) { causes.push('a declaration opens with none of GATE, CHECKLIST or JUDGEMENT'); continue; }
    if (m[1] === 'GATE') {
      const g = /^(\S+?):(\S+)/.exec(m[2]);
      if (!g) causes.push('a GATE declaration names no repository and file');
      else if (g[1] === 'hub' && !existsSync(join(root, g[2]))) causes.push(`a GATE declaration names ${g[2]}, a gate file the hub does not hold`);
    }
    if (m[1] === 'JUDGEMENT' && body !== null && !/\*\*Smell:\*\*/.test(body)) causes.push('a JUDGEMENT declaration needs a Smell line in the body');
  }
  for (const [n, s] of [['title', title], ['body', body ?? ''], ['declaration', decls.join('\n')]]) for (const f of textFaults(s)) causes.push(`the ${n} matches ${f}`);
  const md = slurp(P.lessonsMd);
  if (md === null) causes.push('LESSONS.md cannot be read');
  if (causes.length) refuse('lesson', causes);
  const rows = md.split('\n');
  const lastRow = rows.reduce((acc, l, j) => (/^- \*\*§\d+\*\* /.test(l) ? j : acc), -1);
  if (lastRow < 0) refuse('lesson', ['LESSONS.md holds no row of the index to write beside']);
  let top = 0;
  for (const n of existsSync(P.lessons) ? readdirSync(P.lessons) : []) { const m = /^(\d+)-/.exec(n); if (m) top = Math.max(top, Number(m[1])); }
  for (const l of rows) { const m = /^- \*\*§(\d+)\*\* /.exec(l); if (m) top = Math.max(top, Number(m[1])); }
  const n = top + 1;
  const name = `${String(n).padStart(3, '0')}-${slug(title)}.md`;
  const text = `## ${n} · ${title}\n\n${decls.map((d) => `**Enforced by:** ${d}`).join('\n')}\n\n${lastTrim(body)}\n`;
  const wrote = [];
  write(root, join(P.lessons, name), text, wrote);
  rows.splice(lastRow + 1, 0, `- **§${n}** — [${title}](lessons/${name})`);
  write(root, P.lessonsMd, rows.join('\n'), wrote);
  process.stdout.write(`program lesson: wrote lesson ${n}; wrote ${wrote.join(', ')}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = process.argv.slice(2);
  const rootAt = a.indexOf('--root');
  const root = rootAt >= 0 && a[rootAt + 1] ? resolve(a[rootAt + 1]) : HERE;
  const rest = rootAt >= 0 ? a.filter((_, i) => i !== rootAt && i !== rootAt + 1) : a;
  const verbs = { claim, file: fileFindings, done, measure, lesson };
  const verb = rest[0];
  if (!verbs[verb]) {
    process.stdout.write('usage: node program.mjs <claim|file|done|measure|lesson> [switches] [--root <path>]; see the header of this file for each verb\'s switches\n');
    process.exit(2);
  }
  verbs[verb](rest.slice(1), root);
}
