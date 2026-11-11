#!/usr/bin/env node
/**
 * plan-land.mjs — the landing of a plan as one command (Q-HUB-473).
 *
 * node plan-land.mjs prove  --manifest=<file> --out=<folder> [--checks-only] [--repo=<path>]
 * node plan-land.mjs commit --manifest=<file> [--label=<label>] [--repo=<path>]
 * node plan-land.mjs push   --expect=<count> [--clone=<path>] [--repo=<path>]
 *
 * THE MANIFEST is a JSON file the landing agent writes in the session scratchpad:
 *   { "steps": [ { "label", "message", "changed": [..], "added": [..], "plants": [..] } ],
 *     "close": { same form }, "suite": "<path>", "checks": { "docs": "<path>", .. } }
 * `steps` is one entry for each file step, in the order of the commits. `close`, `suite` and `checks` are optional; the suite and
 * the checks are the repository's own unless the manifest names others, which is how a case points this command at planted ones.
 *
 * prove  commits nothing. It runs every stage whatever an earlier one showed, prints one PASS or FAIL line for each stage with each
 *        failing item under it, writes each stage's whole print to a file under --out, and ends with one PROVE line.
 * commit refuses, with nothing committed and each cause named, a bad message, a listed file with no change and a changed or
 *        untracked file no entry lists; then it makes one commit for each entry, with only that entry's files.
 * push   lands the work branch the branch guard file names: fetch, rebase, count, push as a fast-forward, read the remote, pull a clone.
 *
 * Every git and node call is made with a list of arguments under a time limit and never through a shell string, so no word of a
 * manifest is read as shell. The command edits no file of the repository itself.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const verb = argv[0];
const KNOWN = {
  prove: ['repo', 'manifest', 'out', 'checks-only'],
  commit: ['repo', 'manifest', 'label'],
  push: ['repo', 'expect', 'clone'],
};
const say = (s = '') => console.log(s);
const die = (s) => { console.error(`plan-land: ${s}`); process.exit(2); };
if (!KNOWN[verb]) die('the first argument is a verb: prove, commit or push');
for (const a of argv.slice(1)) {
  const name = /^--([a-z-]+)(=.*)?$/.exec(a)?.[1];
  if (!name || !KNOWN[verb].includes(name)) die(`${verb} takes no argument "${a}"; its switches are ${KNOWN[verb].map((k) => `--${k}`).join(', ')}`);
}
const sw = (name) => { const a = argv.find((x) => x.startsWith(`--${name}=`)); return a === undefined ? undefined : a.slice(name.length + 3); };
const has = (name) => argv.includes(`--${name}`);
const REPO = resolve(sw('repo') ?? HERE);

const run = (cmd, args, o = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: o.timeout ?? 120000, cwd: o.cwd });
  return { status: r.status ?? 1, stdout: r.stdout ?? '', out: `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? `\n[${r.error.message}]` : ''}` };
};
const gitIn = (dir, ...a) => run('git', ['-C', dir, ...a]);
const git = (...a) => gitIn(REPO, ...a);
const lastLines = (s, n = 4) => s.split('\n').filter((l) => l.trim()).slice(-n).join(' / ');

// ---- the manifest ----
function readManifest() {
  const p = sw('manifest');
  if (!p) die(`${verb} needs --manifest=<file>`);
  let m;
  try { m = JSON.parse(readFileSync(resolve(p), 'utf8')); } catch (e) { die(`the manifest ${p} cannot be read: ${e.message}`); }
  if (!Array.isArray(m.steps)) die('the manifest holds no steps list');
  const norm = (e, i) => {
    if (typeof e?.label !== 'string' || typeof e?.message !== 'string') die(`manifest entry ${i} needs a label and a message, both text`);
    const list = (k) => { if (e[k] !== undefined && !(Array.isArray(e[k]) && e[k].every((x) => typeof x === 'string'))) die(`manifest entry "${e.label}": ${k} is a list of text`); return e[k] ?? []; };
    return { label: e.label, message: e.message, changed: list('changed'), added: list('added'), plants: list('plants') };
  };
  const steps = m.steps.map(norm);
  const close = m.close ? { ...norm({ label: 'close', ...m.close }, 'close'), label: m.close.label ?? 'close' } : null;
  return { steps, close, all: close ? [...steps, close] : steps, suite: m.suite, checks: m.checks ?? {} };
}

// ---- prove ----
const LONG = new Set(['hook-dispatch.mjs', 'session-guards.test.mjs', 'report.mjs']);
const LONG_COUNT = 250;
const CHUNK = 25;
// name, the file, the arguments it takes (as the check's own usage gives them)
const CHECKS = [
  ['docs', 'docs-check.mjs', (r) => [r]],
  ['lessons', 'lessons-check.mjs', () => []],
  ['quote', 'quote-check.mjs', (r) => ['--repo', r]],
  ['privacy', 'privacy-check.mjs', (r) => ['--repo', r]],
  ['third-person', 'third-person-check.mjs', (r) => ['--repo', r]],
  ['example', 'example-check.mjs', (r) => ['--repo', r]],
  ['pin', 'pin-check.mjs', (r) => ['--repo', r]],
];

function prove(m) {
  const out = sw('out') ? resolve(sw('out')) : mkdtempSync(join(tmpdir(), 'plan-land-'));
  mkdirSync(out, { recursive: true });
  const suite = m.suite ?? join(REPO, 'session-guards.test.mjs');
  const stages = [];
  const stage = (name, items, text) => {
    stages.push({ name, ok: items.length === 0 });
    say(`${items.length ? 'FAIL' : 'PASS'}  ${name}`);
    for (const i of items) say(`    ${i}`);
    writeFileSync(join(out, `${String(stages.length).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-')}.txt`), text);
  };

  const checks = () => {
    const items = []; let text = '';
    for (const [name, file, args] of CHECKS) {
      const r = run('node', [m.checks[name] ?? join(REPO, file), ...args(REPO)], { cwd: REPO, timeout: 600000 });
      text += `== ${name} check, exit ${r.status}\n${r.out}\n`;
      if (r.status !== 0) items.push(`the ${name} check exited ${r.status}: ${lastLines(r.out)}`);
    }
    stage('the seven checks', items, text);
  };

  say(`PROVE of ${REPO}; each stage's print is in ${out}`);
  if (has('checks-only')) checks();
  else {
    // stage 1: the dry listing of each file the manifest names
    const files = [...new Set(m.all.flatMap((e) => [...e.changed, ...e.added]).map((f) => (f.startsWith('guard-cases/') ? basename(f) : f)))];
    const keys = new Set(m.all.flatMap((e) => e.plants));
    let items = [], text = '';
    for (const f of files) {
      const r = run('node', [suite, '--plants', '--dry', `--files=${f}`], { timeout: 300000 });
      text += `== ${f}, exit ${r.status}\n${r.out}\n`;
      const listed = /^PLANTS TO RUN: (\d+) of \d+:(.*)$/m.exec(r.stdout);
      const staleLine = /^STALE PLANTS BEFORE THE RUN \(\d+\): (.*)$/m.exec(r.stdout);
      if (staleLine) items.push(`${f} holds stale plants: ${staleLine[1]}`);
      else if (!listed || r.status !== 0) items.push(`the dry listing for ${f} exited ${r.status}${listed ? '' : ' and printed no plants line'}: ${lastLines(r.out)}`);
      if (!listed) continue;
      const stale = new Set(staleLine ? staleLine[1].split(/, /).map((t) => t.trim().split(' ')[0]) : []);
      const long = LONG.has(basename(f)) || Number(listed[1]) > LONG_COUNT;
      if (!long) for (const k of listed[2].split(',').map((s) => s.trim()).filter(Boolean)) if (!stale.has(k)) keys.add(k);
    }
    stage('the dry listing', items, text);

    // stage 2: the whole suite once
    items = [];
    const whole = run('node', [suite], { timeout: 25 * 60 * 1000 });
    text = `== whole suite, exit ${whole.status}\n${whole.out}\n`;
    const red = whole.stdout.split('\n').filter((l) => l.startsWith('FAIL  '));
    for (const l of red) items.push(`red case: ${l.slice(6)}`);
    if (!/^\d+\/\d+ passed$/m.test(whole.stdout)) items.push(`the suite's print was cut: no passed line (exit ${whole.status}): ${lastLines(whole.out)}`);
    else if (whole.status !== 0 && !red.length) items.push(`the suite exited ${whole.status} with no case named red: ${whole.stdout.split('\n').filter((l) => /^(NOT LOADED|CASES NOT RUN|NOTHING SELECTED|LEAK)/.test(l)).join(' / ') || lastLines(whole.out)}`);
    // a red case is run again narrowed to its own name, so its print stands alone
    for (const l of red) {
      const sub = l.slice(6).split(' (')[0].split(',')[0].trim();
      if (!sub) continue;
      const again = run('node', [suite, `--case=${sub}`, '--allow-wide'], { timeout: 900000 });
      text += `== narrowed to "${sub}", exit ${again.status}\n${again.out}\n`;
    }
    stage('the whole suite', items, text);

    // stage 3: the plants, by key
    items = []; text = '';
    const list = [...keys];
    for (let i = 0; i < list.length; i += CHUNK) {
      const chunk = list.slice(i, i + CHUNK);
      const r = run('node', [suite, '--plants', `--plant-keys=${chunk.join(',')}`], { timeout: 30 * 60 * 1000 });
      text += `== plants ${chunk[0]} to ${chunk[chunk.length - 1]}, exit ${r.status}\n${r.out}\n`;
      const seen = new Set();
      for (const l of r.stdout.split('\n')) {
        const v = /^(CAUGHT|MISSED)  plant "(.+?)" in /.exec(l);
        if (v) { seen.add(v[2]); if (v[1] === 'MISSED') items.push(`plant ${v[2]} was MISSED`); continue; }
        const s = /^PLANT (\S+): .*stale/.exec(l);
        if (s) { seen.add(s[1]); items.push(`plant ${s[1]} is stale`); }
      }
      const end = /^CHUNK-END bad=(\d+) leaks=(\d+)$/m.exec(r.stdout);
      if (!end) items.push(`the process for ${chunk[0]} to ${chunk[chunk.length - 1]} ended early (exit ${r.status}): ${lastLines(r.out)}`);
      else { if (Number(end[1])) items.push(`the suite counted ${end[1]} bad in ${chunk[0]} to ${chunk[chunk.length - 1]}`); if (Number(end[2])) items.push(`the suite reported a LEAK of the planted session in ${chunk[0]} to ${chunk[chunk.length - 1]}`); }
      for (const k of chunk) if (!seen.has(k)) items.push(`plant ${k} has no verdict`);
    }
    stage(`the plants (${list.length} by key)`, items, text || 'no plant keys to run\n');

    checks();
  }
  const failed = stages.filter((s) => !s.ok).length;
  say(`PROVE ${failed ? 'FAIL' : 'PASS'} (${stages.length} stage${stages.length === 1 ? '' : 's'}, ${failed} failed)`);
  process.exit(failed ? 1 : 0);
}

// ---- commit ----
const NAMES_MODEL = /\b(?:claude(?!\.md\b)|sonnet|opus|haiku|fable|mythos)\b/i;
const LINK = /https?:\/\/|www\.|\bclaude\.ai\b|\/code\/session_/i;
const TRAILER = /^\s*(?:co-authored-by|claude-session|signed-off-by|reviewed-by|acked-by|tested-by|generated with)\b/im;

function statusPaths() {
  const r = git('status', '--porcelain', '-z', '--untracked-files=all');
  const parts = r.stdout.split('\0').filter(Boolean);
  const paths = [];
  for (let i = 0; i < parts.length; i++) {
    paths.push(parts[i].slice(3));
    if (/^[RC]/.test(parts[i])) i++;
  }
  return paths;
}

function commit(m) {
  const label = sw('label');
  const todo = label === undefined ? m.steps : m.all.filter((e) => e.label === label);
  if (!todo.length) die(label === undefined ? 'the manifest holds no steps' : `the manifest holds no entry labelled "${label}"`);
  const causes = [];
  for (const e of todo) {
    const msg = e.message.trim();
    if (!msg) causes.push(`${e.label}: the message is empty`);
    if (msg.includes('\n')) causes.push(`${e.label}: the message is more than one line`);
    if (LINK.test(msg)) causes.push(`${e.label}: the message holds a link`);
    if (NAMES_MODEL.test(msg)) causes.push(`${e.label}: the message names a model`);
    if (TRAILER.test(e.message)) causes.push(`${e.label}: the message holds a trailer line`);
    if (e.changed.length + e.added.length === 0) causes.push(`${e.label}: the entry lists no file`);
    for (const f of [...e.changed, ...e.added]) {
      if (git('status', '--porcelain', '--untracked-files=all', '--', f).stdout.trim() === '') causes.push(`${e.label}: ${f} is listed and has no change`);
    }
    for (const f of e.added) if (!existsSync(join(REPO, f))) causes.push(`${e.label}: ${f} is listed as added and is not there`);
  }
  if (label === undefined) {
    const listed = new Set(m.all.flatMap((e) => [...e.changed, ...e.added]));
    for (const p of statusPaths()) if (!listed.has(p)) causes.push(`${p} is changed or untracked and no entry lists it`);
  }
  if (causes.length) {
    say(`COMMIT REFUSED, nothing committed (${causes.length} cause${causes.length === 1 ? '' : 's'}):`);
    for (const c of causes) say(`  - ${c}`);
    process.exit(1);
  }
  for (const e of todo) {
    if (e.added.length) {
      const a = git('add', '--', ...e.added);
      if (a.status !== 0) { say(`COMMIT STOPPED at ${e.label}: git add exited ${a.status}: ${lastLines(a.out)}`); process.exit(1); }
    }
    const c = git('commit', '-m', e.message.trim(), '--', ...e.changed, ...e.added);
    if (c.status !== 0) { say(`COMMIT STOPPED at ${e.label}: git commit exited ${c.status}, the commits before it stand: ${lastLines(c.out, 8)}`); process.exit(1); }
    say(`COMMIT ${e.label}: ${git('rev-parse', 'HEAD').stdout.trim()} ${git('log', '-1', '--pretty=%s').stdout.trim()}`);
  }
  say(`COMMITTED ${todo.length}; the working copy now reads:`);
  say(git('status', '--short', '--branch').stdout.trimEnd());
  process.exit(0);
}

// ---- push ----
function push() {
  const refuse = (why) => { say(`PUSH REFUSED, nothing pushed: ${why}`); process.exit(1); };
  const decl = existsSync(join(REPO, '.branch-guard')) ? readFileSync(join(REPO, '.branch-guard'), 'utf8') : '';
  const work = /^work=(.*)$/m.exec(decl)?.[1].trim();
  if (!work) refuse('the repository has no .branch-guard file naming a work branch');
  if (!['main', 'staging'].includes(work)) refuse(`the work branch is "${work}", and only main and staging reach a remote`);
  const here = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.trim();
  if (here !== work) refuse(`the checked-out branch is "${here}" and the branch guard names "${work}"`);
  const expectRaw = sw('expect');
  if (!/^\d+$/.test(expectRaw ?? '')) refuse('--expect=<the number of commits to push> is needed');
  const clone = sw('clone');
  if (clone !== undefined && !existsSync(resolve(clone))) refuse(`the clone ${clone} is not there`);

  const f = git('fetch', 'origin', work);
  if (f.status !== 0) refuse(`the fetch of ${work} exited ${f.status}: ${lastLines(f.out)}`);
  say(`FETCHED origin ${work}`);
  const rb = git('rebase', `origin/${work}`);
  if (rb.status !== 0) {
    const files = git('diff', '--name-only', '--diff-filter=U').stdout.split('\n').filter(Boolean);
    git('rebase', '--abort');
    refuse(`the rebase onto origin/${work} stopped on a conflict in ${files.join(', ') || 'a file git did not name'}; the rebase was ended`);
  }
  say(`REBASED onto origin/${work}`);
  const ahead = git('rev-list', '--count', `origin/${work}..HEAD`).stdout.trim();
  if (ahead !== expectRaw) refuse(`${ahead} commits stand ahead of origin/${work} and ${expectRaw} were expected`);
  say(`COUNTED ${ahead} ahead of origin/${work}`);
  const p = git('push', 'origin', work);
  if (p.status !== 0) { say(`PUSH FAILED: exit ${p.status}: ${lastLines(p.out, 8)}`); process.exit(1); }
  say(`PUSHED ${work} to origin`);
  const head = git('rev-parse', 'HEAD').stdout.trim();
  const remote = git('ls-remote', '--heads', 'origin', `refs/heads/${work}`).stdout.trim().split(/\s+/)[0];
  if (remote !== head) { say(`PUSH NOT READ BACK: the remote's ${work} is ${remote || 'not there'} and the local head is ${head}`); process.exit(1); }
  say(`READ the remote: ${work} is ${head}`);
  if (clone !== undefined) {
    const pl = gitIn(resolve(clone), 'pull', 'origin', work);
    const there = gitIn(resolve(clone), 'rev-parse', 'HEAD').stdout.trim();
    if (pl.status !== 0 || there !== head) { say(`CLONE NOT AT THE HEAD: the pull exited ${pl.status} and the clone's head is ${there}, where the local head is ${head}`); process.exit(1); }
    say(`PULLED the clone ${clone}: its head is ${there}`);
  }
  say('the working copy now reads:');
  say(git('status', '--short', '--branch').stdout.trimEnd());
  process.exit(0);
}

if (verb === 'push') push();
else { const m = readManifest(); if (verb === 'prove') prove(m); else commit(m); }
