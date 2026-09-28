#!/usr/bin/env node
/**
 * THE OWNER'S DRIVE IS SEARCHED ONLY WHERE THE OWNER POINTED (LESSONS §369, §370).
 *
 * The connector can see the whole Drive, and that is access, not permission.
 * A session searched all of it for a file the owner had already said not to
 * use, then for every raw outside the shared folders. §369 left "never search
 * for more" as a checklist line; this is the refusal. It is scoped rather than
 * blanket, because a blanket refusal would have refused the owner's own request
 * the same day: open the folder at root named by title.
 *
 * PreToolUse, run by hook-dispatch.mjs, on any Google Drive connector tool:
 *   - writes (create, update, share, trash, copy) are refused outright;
 *   - listing recent files and any `fullText` search are refused — both search
 *     the whole Drive;
 *   - a search passes only when every `parentId` in it is a folder in a repo's
 *     `tools/owner-images.json` or was already returned in a tool result this
 *     session, or when every `title = '…'` in it appears in the owner's latest
 *     message;
 *   - reading or downloading a file passes only for an id in the index or one
 *     already returned in a tool result this session.
 *
 *   node drive-guard.mjs <launch-dir>    (payload on stdin; exit 2 refuses)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tailEntries, lastOwnerMessage, seenInResults } from './transcript-tail.mjs';

/**
 * Every folder and file id in any repo's owner-image index under `root`.
 * @param {string} root  the session's launch directory.
 * @returns {Set<string>} the ids; empty when no repo carries an index, which
 *   makes every unscoped search refused rather than every search allowed.
 */
function indexIds(root) {
  const ids = new Set();
  let dirs = [];
  try { dirs = [root, ...readdirSync(root).map((d) => join(root, d))]; } catch { /* unreadable root */ }
  for (const d of dirs) {
    const f = join(d, 'tools', 'owner-images.json');
    if (!existsSync(f)) continue;
    try {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      for (const x of j.folders ?? []) if (x?.id) ids.add(x.id);
      for (const x of j.files ?? []) if (x?.id) ids.add(x.id);
    } catch { /* a malformed index adds nothing */ }
  }
  return ids;
}

/**
 * Decide on one Drive call.
 * @param {object} p     the PreToolUse payload.
 * @param {string} root  the launch directory, to find the owner-image index.
 * @returns {string | null} the refusal reason, or null to allow; hook-dispatch
 *   turns a reason into exit 2 with it on stderr.
 */
export function decide(p, root) {
  const tool = String(p.tool_name ?? '');
  if (!/Google_Drive/.test(tool)) return null;
  const op = tool.split('__').pop();
  if (['create_file', 'update_file', 'share_file', 'trash_file', 'copy_file'].includes(op)) {
    return `Drive ${op} refused: nothing is written to the owner's Drive.`;
  }
  if (op === 'list_recent_files') return 'Listing recent Drive files is a search of the whole Drive, and it is refused (LESSONS §369).';
  const entries = tailEntries(p.transcript_path ?? '');
  // Seen means RETURNED BY DRIVE: a successful Drive result, never a refusal
  // quoting the id back, and never an id the session echoed through Bash.
  const seen = seenInResults(entries, /Google_Drive/);
  const ids = indexIds(root);
  const known = (id) => ids.has(id) || (id.length >= 10 && seen.includes(id));
  if (op === 'search_files') {
    const q = String(p.tool_input?.query ?? '');
    if (/fullText/i.test(q)) return 'A fullText Drive search reads the whole Drive, and it is refused (LESSONS §369).';
    // One scoped clause proves nothing about the rest of the query: `parentId =
    // 'known' or mimeType contains 'image/'` searched the whole Drive. A query
    // is a pure AND of clauses, so or, not and != outside quotes are refused.
    const bare = q.replace(/'(?:[^'\\]|\\.)*'/g, "''");
    if (/\bor\b|\bnot\b|!=/i.test(bare)) return 'A Drive search may only AND its clauses: or, not and != can widen a scoped search to the whole Drive, and they are refused (LESSONS §369).';
    const parents = [...q.matchAll(/parentId\s*=\s*'([^']+)'/g)].map((m) => m[1]).filter((id) => id !== 'root');
    const titles = [...q.matchAll(/title\s*=\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
    const owner = (lastOwnerMessage(entries)?.text ?? '').toLowerCase();
    // A title the owner NAMED: a whole phrase in the message, never a fragment
    // of a word — `title = 'e'` passed because "e" is in every message.
    const named = (t) => t.trim().length >= 3
      && new RegExp(`(?:^|[^a-z0-9])${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`).test(owner);
    if (parents.length && parents.every(known)) return null;
    if (titles.length && titles.every(named)) return null;
    return 'A Drive search must be scoped to a folder in tools/owner-images.json or one already listed this session, '
      + "or to an exact title = '…' the owner named in their latest message. Never search for more (LESSONS §369).";
  }
  const id = String(p.tool_input?.fileId ?? '');
  if (id && !known(id)) return `Drive file ${id} is neither in the owner-image index nor returned by any listing this session.`;
  return null;
}

if (process.argv[1] && process.argv[1].endsWith('drive-guard.mjs')) {
  let p = {};
  try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { /* no payload: nothing to judge */ }
  const why = decide(p, process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  process.exit(0);
}
