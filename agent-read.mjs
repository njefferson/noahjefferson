#!/usr/bin/env node
/**
 * THE READERS OF A SESSION'S AGENTS, kept on their own so the push guard stands on nothing a retirement removes.
 *
 * These functions are copied, unchanged, from report.mjs: `sessionFiles` finds a session's transcript and its `subagents/` folder,
 * `agentFiles` lists the agent transcripts, `agentMeta` reads one agent's `.meta.json`, and `agentEnd` says how an agent ended from its own
 * transcript. It imports nothing but node's own modules.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

/**
 * Every agent transcript of a session, the Workflow agents' included.
 * @param {string} dir  the session's `subagents/` folder (`sessionFiles(...).agents`).
 * @returns {{id: string, name: string, file: string, folder: string}[]} one entry per
 *   `agent-<id>.jsonl` found, sorted by file name, the first of an id kept: those
 *   directly in `dir`, then those one level below `dir/workflows/<run>/`, where the
 *   agents of a Workflow keep theirs (measured on this session's disk: `subagents/
 *   workflows/<run>/agent-<id>.jsonl` and its `.meta.json` beside it), then those in
 *   `<session>/workflows/<run>/` beside the subagents folder, which holds only a
 *   run's script folder (`scripts`) today and is read in case a harness moves the
 *   agents there. `folder` is where its `.meta.json` sits. [] when `dir` cannot be
 *   read.
 */
export function agentFiles(dir) {
  const out = [];
  const seen = new Set();
  const take = (folder) => {
    let names = [];
    try { names = readdirSync(folder); } catch { return; }
    for (const n of names) {
      const m = /^agent-([\w-]+)\.jsonl$/.exec(n);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push({ id: m[1], name: n, file: join(folder, n), folder });
    }
  };
  const runs = (parent) => {
    let ds = [];
    try { ds = readdirSync(parent, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'scripts').map((d) => d.name).sort(); } catch { return []; }
    return ds.map((d) => join(parent, d));
  };
  take(dir);
  for (const r of runs(join(dir, 'workflows'))) take(r);
  for (const r of runs(join(dirname(dir), 'workflows'))) take(r);
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * One agent's `.meta.json`.
 * @param {{id: string, folder: string}} a  an entry of `agentFiles`.
 * @returns {object} the parsed file beside the agent's transcript, or {} when it is
 *   not there or not JSON; `agentEnd` reads `stoppedByUser` from it.
 */
export function agentMeta(a) {
  try { return JSON.parse(readFileSync(join(a.folder, `agent-${a.id}.meta.json`), 'utf8')) ?? {}; } catch { return {}; }
}

// An agent's own way of handing back.
const AGENT_RETURN = /^(?:SubagentHandback|StructuredOutput)$/;
// The words a hand-back's first line opens with when it says how the step went. A hand-back that
// opens with one is a report whatever hook refusal came before it (`agentEnd`).
const HAND_BACK_WORD = /^(?:DONE|FAILED|REFUSED|EJECT)\b/;
// A hook's refusal of a call, as a tool result carries it (is_error true): the call never ran.
export const HOOK_REFUSAL = /^(?:Error: )?PreToolUse:\S+ hook error/;
const LAST_CHARS = 1500;
const resultText = (b) => (typeof b?.content === 'string' ? b.content
  : Array.isArray(b?.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '');

/**
 * Where a session's transcript and its agents' transcripts are.
 * @param {string} sid  the session id (`CLAUDE_CODE_SESSION_ID`).
 * @returns {{main: string, agents: string} | null} the session's JSONL and its
 *   `subagents/` directory under ~/.claude/projects/<dir>/, or null when the id
 *   is malformed or no project directory holds it.
 */
export function sessionFiles(sid) {
  if (!/^[\w-]+$/.test(String(sid ?? ''))) return null;
  const projects = join(homedir(), '.claude', 'projects');
  let dirs = [];
  try { dirs = readdirSync(projects); } catch { return null; }
  const dir = dirs.find((d) => existsSync(join(projects, d, `${sid}.jsonl`)) || existsSync(join(projects, d, sid, 'subagents')));
  return dir ? { main: join(projects, dir, `${sid}.jsonl`), agents: join(projects, dir, sid, 'subagents') } : null;
}

/**
 * How one agent ended, read from its own transcript.
 * @param {object[]} entries  the agent's transcript (its tail), in file order.
 * @param {object} [meta]  its `.meta.json`; `stoppedByUser` marks an interruption.
 * @param {number} [processStart]  when this session's process began, in ms;
 *   an agent whose last entry is older is not running.
 * @param {string} [notified]  the status a task notification gave it, if any.
 * @returns {{how: string, at: number, last: string, word?: string, refusedBefore?: boolean} | null} null while it is
 *   still running. Otherwise how it ended — "a report" (it handed back), "a
 *   refusal" (it handed back, or was ended, straight after a hook refused it),
 *   "an interruption" (stopped, or cut off by a restart), or "a failure" — its
 *   last entry's time, and its last entry: the hand-back's text, or else the
 *   last thing it said, ran or was answered.
 *   A HAND-BACK WHOSE FIRST LINE OPENS DONE, FAILED OR REFUSED IS "a report" WHATEVER HOOK REFUSAL CAME BEFORE IT (LESSONS §436):
 *   such an end carries `word` (the opening word) and `refusedBefore` (true when the last tool result before the hand-back was a
 *   hook's refusal). A hand-back opening any other way keeps "a refusal" after one.
 */
export function agentEnd(entries, meta = {}, processStart = 0, notified = '') {
  let at = 0, lastAssistant = -1, interruptedAt = -1;
  let handback = null, lastRefusal = false, last = '';
  entries.forEach((e, i) => {
    const t = Date.parse(e?.timestamp ?? '');
    if (Number.isFinite(t) && t > at) at = t;
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) {
      for (const b of c) {
        if (b?.type === 'text' && String(b.text ?? '').trim()) { last = String(b.text).trim(); lastAssistant = i; }
        if (b?.type !== 'tool_use') continue;
        lastAssistant = i;
        if (AGENT_RETURN.test(b.name ?? '')) handback = { id: b.id, text: String(b.input?.message ?? b.input?.result ?? JSON.stringify(b.input ?? {})), refused: false };
        else { handback = null; last = `${b.name} ${JSON.stringify(b.input ?? {})}`; }
      }
    }
    if (e?.type !== 'user') return;
    const words = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((b) => b?.type === 'text').map((b) => b.text ?? '').join('\n') : '';
    if (/^\s*\[Request interrupted/.test(words)) interruptedAt = i;
    if (Array.isArray(c)) for (const b of c) {
      if (b?.type !== 'tool_result') continue;
      const text = resultText(b);
      if (handback && b.tool_use_id === handback.id) { handback.refused = !!b.is_error; continue; }
      lastRefusal = !!b.is_error && HOOK_REFUSAL.test(text);
      last = `${b.is_error ? 'error' : 'result'}: ${text}`;
    }
  });
  const cut = (s) => (s.length > LAST_CHARS ? `${s.slice(0, LAST_CHARS)} … (${s.length} characters; the rest is in its transcript)` : s);
  if (handback && !handback.refused) {
    // A HAND-BACK THAT OPENS DONE, FAILED OR REFUSED IS A REPORT WHATEVER CALL WAS REFUSED BEFORE IT (LESSONS §436).
    const word = HAND_BACK_WORD.exec(String(handback.text ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '')?.[0];
    return { how: lastRefusal && !word ? 'a refusal' : 'a report', at, last: cut(handback.text), ...(word ? { word, refusedBefore: lastRefusal } : {}) };
  }
  if (meta?.stoppedByUser || interruptedAt > lastAssistant) return { how: 'an interruption', at, last: cut(last) };
  // AN AGENT IS ENDED ONLY BY ITS HAND-BACK, AN INTERRUPTION OR A FAILURE (Q-HUB-255). The harness tells the main thread an agent's turn
  // "completed" each time the agent pauses on its own background run and again when it is resumed by the run's end, so the
  // notification is no end: with no hand-back call in its transcript the agent is still running, whatever the notification says, the
  // run's completion already in its transcript included. A session restart after its last entry ended it with the process (below).
  if (/^(?:completed)$/.test(notified) && !(processStart && at && at < processStart)) return null;
  if (/^(?:killed|stopped|cancelled)$/.test(notified)) return { how: 'an interruption', at, last: cut(last) };
  if (notified === 'failed') return { how: 'a failure', at, last: cut(last) };
  if (processStart && at && at < processStart) return { how: 'an interruption (the session restarted after its last entry)', at, last: cut(last) };
  return null;
}
