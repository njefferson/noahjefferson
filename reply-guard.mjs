#!/usr/bin/env node
/**
 * READ THE REPLY BEFORE THE NEXT REQUEST (LESSONS §374).
 *
 * A server that declines a request almost always says why, and how to ask
 * instead: a 406 says nothing it could serve matched what the client said it
 * accepts, a publisher's 403 carries a header naming its text-and-data-mining
 * policy, a CDN's page names what it blocked. A session that files every such
 * reply as an obstacle goes around it — another identity, another tool — and
 * never learns what it was told. The hub already said a refusal is an
 * instruction, and a refusal naming its remedy is the instruction given twice;
 * it was broken across a whole research pass, so this is the refusal.
 *
 * Run by hook-dispatch.mjs for every agent, the main thread and subagents:
 *
 *   PreToolUse (no flag)  refuses the next request to a host whose last
 *                         declining reply has not been read; any request in
 *                         another identity to a host that declined a script;
 *                         and a failed call repeated unchanged before its
 *                         error has been read
 *   --record <Event>      PostToolUse and PostToolUseFailure: writes declining
 *                         replies and failed calls to the ledger,
 *                         and puts a declining reply in front of the session
 *                         at once (exit 2 on stderr; the tool has already run)
 *   --read <host|call:ID> --said "<words from the reply>" --route "<kind>: <how>"
 *                         the reading, run as a Bash command of its own. The
 *                         PreToolUse check validates and records it: --said
 *                         must be text the reply actually carried, and --route
 *                         must be one that reply allows. Run alone, it reports
 *                         whether a hook recorded it.
 *
 *   --seed <declines.jsonl> --session <id>
 *                         adds declining replies met before the gate ran, from
 *                         an extraction of the transcripts; declines only
 *
 * Failed calls are ALSO caught up from the transcript tail on every PreToolUse,
 * so the gate does not rest on PostToolUseFailure being wired: hook settings
 * are read when a session starts, and an event added later may not fire.
 *
 * One JSONL ledger per session under ~/.claude/reply-ledger/ (REPLY_LEDGER_DIR
 * overrides it, and REPLY_GUARD_NOW the clock, for the test).
 *
 * KNOWN GAP: a request made by a program that names no URL on its command line
 * or in the script file it runs (a URL read from a file, or built at run time)
 * is invisible here. The research brief's requirement — every refused host
 * reported with the reply's own words and the route taken — covers that case.
 */
import { appendFileSync, readFileSync, mkdirSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { tailEntries, ownerMessagesSince } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);
const ROUTES = ['api', 'negotiate', 'tdm', 'author-copy', 'open-index', 'later', 'owner'];
const LOCAL = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?)$/;
const LATER_DEFAULT_S = 600;
const LATER_WORDS = /temporar|try (it )?again later|retry later|come back later|try again in a (few|little)/i;
const CLIENTS = new Set(['curl', 'wget', 'wget2', 'lynx', 'w3m', 'links', 'elinks', 'aria2c', 'httpie', 'xh', 'xhs']);
const CLIENT_WORD = /(^|[^A-Za-z0-9_-])(curl|wget2?|lynx|w3m|aria2c|httpie)([^A-Za-z0-9_-]|$)/;
// Programs that run a string they are given (`-c`, `-e`), and the words that
// may stand before a program without being it.
const RUNS_STRING = /^((ba|z|da|k|fi)?sh|python[0-9.]*|node|perl|ruby|php|deno|bun|pwsh)$/;
const PREFIX_WORD = /^(timeout|env|nice|ionice|nohup|exec|setsid|sudo|stdbuf|command|time|\d+[smhd]?|[A-Za-z_][A-Za-z0-9_]*=.*)$/;
// A browser, driven or impersonated: a request in its identity, whatever the
// command line says. Matched with URLs taken out, so a page ABOUT one is not one.
const BROWSER = /\b(playwright|puppeteer|selenium|webdriver|chromium(?:-browser)?|google-chrome(?:-stable)?|headless_shell|wkhtmltopdf|curl_cffi|cloudscraper|curl_chrome\d*|curl_ff\d*|curl-impersonate)\b|\bimpersonate\s*=|\bpage\.goto\s*\(|\b(firefox|chrome)\s+--headless/i;
// A tool other than Bash that asks for a URL: a browser tool drives a browser.
const URL_TOOL = /navigate|browser|chrome|playwright|puppeteer|fetch|scrape|crawl|http/i;
const BROWSER_TOOL = /navigate|browser|chrome|playwright|puppeteer/i;
// curl's short options that take no value: a cluster of these may END in one
// that does (`-sSA bot`, `-sSAbot`), and that last letter is what it sets.
const CURL_NOARG = 'sSLivkfIgGjlnNpqRaB0-6#Z';
// The ledger's own directory as a path component — not a file that merely has
// "reply-ledger" in its name, and not the word in prose.
const LEDGER_WORD = /(^|[/~])reply-ledger(\/|$)/i;
// What a program does when it asks the network for something, as opposed to
// merely mentioning a URL in a string or a comment.
const PROGRAM_REQUEST = /\bfetch\s*\(|\bhttps?\.(?:get|request)\s*\(|\brequire\(\s*['"](?:node:)?https?['"]\s*\)|\bfrom\s+['"](?:node:)?https?['"]|\brequests\.(?:\w+\s*\(|Session\b)|\burllib\.request\b|\burllib3\b|\burlopen\s*\(|\bhttpx\b|\bhttp\.client\b|\baiohttp\b|\bpage\.goto\s*\(|\baxios\b|\bundici\b|\bgot\s*\(|node-fetch|LWP::|file_get_contents\s*\(\s*['"]https?:/;
// A tool result that is a hook's or the user's refusal, not the call failing:
// the call never ran, and what it said has been answered by the next action.
// An interrupt and the harness's read-before-edit preconditions are the same:
// the call never ran as asked.
const NOT_A_FAILURE = /hook error|^\s*\[node .*hook-dispatch|The user doesn't want to proceed|Permission to use .* has been denied|was blocked by a hook|Request interrupted by user|File has not been read yet|File has been modified since read|modified since it was (last )?read/i;
const SHARED_SUFFIX = new Set(['github.io', 'pages.dev', 'netlify.app', 'vercel.app', 'readthedocs.io', 'wordpress.com',
  'blogspot.com', 'googleusercontent.com', 'amazonaws.com', 'cloudfront.net', 'appspot.com', 'herokuapp.com', 'workers.dev']);
const FILE_EXT = new Set(['js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'json', 'html', 'htm', 'md', 'txt', 'css', 'png', 'jpg', 'jpeg',
  'gif', 'svg', 'pdf', 'sh', 'py', 'log', 'xml', 'yml', 'yaml', 'csv', 'rst', 'gz', 'zip', 'tar', 'out', 'diff', 'webp', 'nef', 'dng', 'lock',
  'xhtml', 'cpp', 'hpp', 'cc', 'c', 'h', 'raw', 'hdr', 'cr2', 'arw', 'tif', 'tiff', 'exr', 'jsonl', 'patch', 'bak', 'tmp']);

const TLDS = new Set(['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'io', 'dev', 'app', 'info', 'biz', 'ai', 'co', 'me', 'tv', 'xyz',
  'site', 'online', 'tech', 'page', 'blog', 'photography', 'pro', 'science', 'academy', 'news', 'cloud', 'ly', 'us', 'uk', 'de', 'fr',
  'jp', 'nl', 'ca', 'au', 'ch', 'se', 'no', 'fi', 'it', 'es', 'pl', 'cz', 'at', 'be', 'dk', 'ru', 'cn', 'in', 'br', 'nz', 'ie', 'eu',
  'gl', 'to', 'sh', 'gg', 'is', 'pt', 'gr', 'hu', 'kr', 'tw', 'sg', 'za', 'mx', 'ar', 'il', 'tr', 'ua', 'ro', 'sk', 'si', 'hr', 'lt',
  'lv', 'ee', 'lu', 'li', 'museum', 'studio', 'design', 'art', 'gallery', 'camera', 'photo', 'photos', 'space', 'store', 'shop']);
const now = () => Number(process.env.REPLY_GUARD_NOW || Date.now());
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const cap = (s, n) => { const t = String(s ?? ''); return t.length <= n ? t : t.slice(0, n - 2000) + '\n…\n' + t.slice(-2000); };

/**
 * The ledger file for this session.
 * @param {object} p  a hook payload; its `session_id` names the file.
 * @returns {string} an absolute path. The main thread and its subagents share
 *   it, so a refusal any of them met binds all of them.
 */
function ledgerFile(p) {
  const dir = process.env.REPLY_LEDGER_DIR || join(homedir(), '.claude', 'reply-ledger');
  return join(dir, `${String(p.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.jsonl`);
}

/**
 * Every event recorded this session, oldest first.
 * @param {object} p  a hook payload.
 * @returns {object[]} parsed events. A missing ledger is an empty session and a
 *   torn line is skipped, never fatal, because `decide` must always answer.
 */
export function load(p) {
  let raw = '';
  try { raw = readFileSync(ledgerFile(p), 'utf8'); } catch { return []; }
  const out = [];
  for (const l of raw.split('\n')) { if (!l) continue; try { out.push(JSON.parse(l)); } catch { /* torn */ } }
  return out;
}

function append(p, ev) {
  const f = ledgerFile(p);
  mkdirSync(dirname(f), { recursive: true });
  appendFileSync(f, JSON.stringify({ t: now(), ...ev }) + '\n');
}

/**
 * Split a shell command into its simple commands.
 * @param {string} cmd  a Bash command line.
 * @returns {{words: string[], op: string}[]} each simple command's words with
 *   quoting removed, and the operator that ends it (`|`, `&&`, `||`, `;`, `&`,
 *   a newline, or '' at the end). Redirections stay words (`>`, `2>&1`). It is
 *   approximate — no expansion, no nesting — and callers use it only to read a
 *   request's flags, never to decide that a command is harmless.
 */
export function splitShell(cmd) {
  const out = []; let words = []; let w = ''; let inWord = false;
  const push = () => { if (inWord) { words.push(w); w = ''; inWord = false; } };
  const end = (op) => { push(); out.push({ words, op }); words = []; };
  const s = String(cmd ?? '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '$' && s[i + 1] === "'") {
      // $'…' is decoded as bash decodes it, so `$'\x2dA'` is the -A it sends.
      i += 2; inWord = true;
      const esc = { n: '\n', t: '\t', r: '\r', e: '\x1b', a: '\x07', b: '\b', f: '\f', v: '\v', '\\': '\\', "'": "'", '"': '"' };
      while (i < s.length && s[i] !== "'") {
        if (s[i] === '\\' && i + 1 < s.length) {
          const n = s[i + 1];
          const hx = s.slice(i + 2).match(/^[0-9A-Fa-f]{1,2}/); const oc = s.slice(i + 1).match(/^[0-7]{1,3}/);
          if (n === 'x' && hx) { w += String.fromCharCode(parseInt(hx[0], 16)); i += 2 + hx[0].length; continue; }
          if (oc) { w += String.fromCharCode(parseInt(oc[0], 8)); i += 1 + oc[0].length; continue; }
          w += esc[n] ?? n; i += 2; continue;
        }
        w += s[i]; i++;
      }
      continue;
    }
    if (c === "'") { const j = s.indexOf("'", i + 1); const k = j < 0 ? s.length : j; w += s.slice(i + 1, k); inWord = true; i = k; continue; }
    if (c === '"') {
      inWord = true; i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\' && s[i + 1] === '\n') { i += 2; continue; }
        if (s[i] === '\\' && i + 1 < s.length && '"\\$`'.includes(s[i + 1])) i++;
        w += s[i]; i++;
      }
      continue;
    }
    if (c === '\\' && i + 1 < s.length) { if (s[i + 1] !== '\n') { w += s[i + 1]; inWord = true; } i++; continue; }
    if (c === '\n' || c === ';') { end(c); continue; }
    if (c === '|' || c === '&') {
      const two = s.slice(i, i + 2);
      if (two === '||' || two === '&&') { end(two); i++; continue; }
      if (c === '&' && w.endsWith('>')) { w += c; continue; }
      end(c); continue;
    }
    if (c === ' ' || c === '\t') { push(); continue; }
    if (c === '#' && !inWord) { const j = s.indexOf('\n', i); i = (j < 0 ? s.length : j) - 1; continue; }
    w += c; inWord = true;
  }
  end('');
  return out.filter((x) => x.words.length);
}

/**
 * The client named by one word, wherever in the word it sits.
 * @param {string} w  a word of a command.
 * @returns {string} the bare program name: `curl` for `curl`, `/usr/bin/curl`,
 *   `(curl`, `<(curl`, `os.system(curl`, `execSync(curl`, `BEGIN{system(curl`
 *   or `${CURL:-curl}` alike.
 */
const clientName = (w) => {
  const v = String(w ?? '').match(/^\$\{\w+:?-([\w./-]+)\}/);
  return basename(v ? v[1] : String(w ?? '').replace(/^.*[(`'"={]/, '').replace(/^!+/, ''));
};

// Words a command may stand behind, with the options of theirs that take a value.
const WRAPPERS = { timeout: /^(-s|--signal|-k|--kill-after)$/, sudo: /^(-u|-g|-C|-h|-p|-U)$/, env: /^(-u|--unset|-C|--chdir|-S|--split-string)$/, busybox: /^$/,
  nice: /^(-n|--adjustment)$/, ionice: /^(-c|-n|-p)$/, xargs: /^(-I|-n|-P|-L|-d|-a|-s|-E|--max-args|--max-procs|--delimiter|--arg-file)$/,
  stdbuf: /^$/, nohup: /^$/, exec: /^$/, setsid: /^$/, command: /^$/, builtin: /^$/, time: /^$/ };
const SHELL = /^((ba|z|da|k)?sh)$/;
const INTERPRETER = /^(python[0-9.]*|node|perl|ruby|php|deno|bun|pwsh)$/;
const CODE_FLAG = /^(-[A-Za-z]*[ceEpr]|--eval|--print|--exec|--command)$/;
// A call in program code that runs the string or argument list it is given.
const EXEC_CALL = /\b(?:system|exec|execSync|execFile|execFileSync|spawn|spawnSync|popen|Popen|run|call|check_output|check_call|getoutput|getstatusoutput|shell_exec|passthru)\s*\(/;
const BROWSER_BIN = /^(chromium(-browser)?|google-chrome(-stable)?|chrome|firefox|headless_shell|wkhtmltopdf|wkhtmltoimage|curl_chrome\d*|curl_ff\d*|curl-impersonate\S*)$/;

/**
 * Where the program word of a simple command sits.
 * @param {string[]} words  one simple command's words.
 * @returns {number} the index of the word that names the program run, past
 *   `(`, `{`, `!`, `if`/`while`/`do`/`then`, a function's `name()`, variable
 *   assignments, and wrappers with their own options (`timeout -s KILL 20`,
 *   `sudo -u nobody`, `env -u X A=1`, `xargs -I{}`); -1 when there is none.
 */
export function commandWordIndex(words) {
  let i = 0;
  while (i < words.length) {
    const w = String(words[i]).replace(/^(<\(|\()+/, '');
    if (w === '' || /^(\{|!|if|then|else|elif|do|while|until|[A-Za-z_][\w-]*\(\))$/.test(w) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) { i++; continue; }
    const b = basename(w);
    if (b in WRAPPERS) {
      i++;
      while (i < words.length && /^-/.test(words[i])) { if (WRAPPERS[b].test(words[i])) i++; i++; }
      if (b === 'timeout' && /^\d/.test(words[i] ?? '')) i++;
      while (b === 'env' && i < words.length && /^[A-Za-z_]\w*=/.test(words[i])) i++;
      continue;
    }
    return i;
  }
  return -1;
}

/**
 * Separate a command line's heredoc bodies by what reads them.
 * @param {string} cmd  a Bash command line.
 * @returns {{shell: string, programs: string[], data: string[], files: object}} the line with
 *   each body taken out unless a shell reads it (a shell runs it, so it stays);
 *   the bodies an interpreter or awk reads (program text); and every other body
 *   (data: a commit message, notes written to a file, a list fed to a loop),
 *   with each body written to a file kept by that file's name, so a script
 *   written and run in one line is read before it exists.
 *   The version before this split every line of a heredoc into commands, and
 *   refused a commit message and a page of notes that named a declined host.
 */
export function heredocs(cmd) {
  const lines = String(cmd ?? '').split('\n');
  const keep = []; const programs = []; const data = []; const files = {};
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    keep.push(L);
    const m = L.match(/(?<!<)<<(-?)\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2/);
    if (!m) continue;
    const before = L.slice(0, m.index).split(/\|\||&&|[|;&]|\$\(|\(/).pop() ?? '';
    const w = splitShell(before)[0]?.words ?? [];
    const at = commandWordIndex(w);
    const b = at >= 0 ? clientName(w[at]) : '';
    const body = [];
    let j = i + 1;
    for (; j < lines.length; j++) { if ((m[1] ? lines[j].replace(/^\t+/, '') : lines[j]) === m[3]) break; body.push(lines[j]); }
    // `cat <<'EOF' | bash` hands the body to the shell at the end of the pipe;
    // a scope check got a disguised curl through that way.
    const pipe = L.slice(m.index + m[0].length).match(/\|\s*(?:sudo\s+(?:-\S+\s+)*)?(\S+)/);
    const reader = pipe ? clientName(pipe[1]) : b;
    if (SHELL.test(reader)) keep.push(...body);
    else if (INTERPRETER.test(reader) || /^[gm]?awk$/.test(reader)) programs.push(body.join('\n'));
    else {
      data.push(body.join('\n'));
      // A body written to a file may be run later in the same line.
      const tgt = L.slice(0, m.index).match(/>>?\s*(\S+)\s*$/) || L.slice(m.index + m[0].length).match(/^\s*>>?\s*(\S+)/);
      if (tgt) files[tgt[1]] = body.join('\n');
    }
    i = j;
  }
  return { shell: keep.join('\n'), programs, data, files };
}

/**
 * Every simple command a command line runs, wrappers opened.
 * @param {string} cmd      a Bash command line (heredoc bodies already sorted).
 * @param {number} [depth]  how many strings deep this call is.
 * @param {boolean | 'code'} [any]  false for a shell command line; 'code' for
 *   a program's text, where no word is a client and only what a call runs is
 *   opened; true for what a call runs (`os.system('curl …')`), where a client
 *   may stand anywhere in a word.
 * @param {{code: string[]}} [sink]  collects the program code strings opened.
 * @returns {{words: string[], op: string, depth: number, any: boolean}[]} as
 *   `splitShell`, plus the commands inside `$( … )` and backticks, and every
 *   string another program RUNS, opened as a command line of its own, four
 *   levels deep: what a shell is given with `-c`, `<<<` or a pipe; what `eval`
 *   runs; a command waiting in a variable (`CURL="curl -A bot"`); an
 *   interpreter's `-c`/`-e`/`--eval`/`-p` code and awk's program, as code;
 *   `env -S` and `script -c`; and inside code, what a call runs (`system(`,
 *   `execSync(`, `subprocess.run([…])`). A string that is only written or
 *   printed — a commit message, a sed expression, a log line — is not opened.
 */
export function commandsIn(cmd, depth = 0, any = false, sink = { code: [] }) {
  const segs = splitShell(cmd).map((s) => ({ ...s, depth, any }));
  const out = [...segs];
  if (depth >= 4) return out;
  const openShell = (str) => out.push(...commandsIn(str, depth + 1, any, sink));
  // A program's text is opened as code, where only its calls are followed; what
  // a call runs is opened as a command line in which a client may stand
  // anywhere. Opening a whole program that way refused the guard's own tests,
  // which only hand `curl …` to decide() as a string.
  const openCode = (str) => { sink.code.push(str); out.push(...commandsIn(str, depth + 1, 'code', sink)); };
  const openArg = (str) => { sink.code.push(str); out.push(...commandsIn(str, depth + 1, true, sink)); };
  for (const m of String(cmd).matchAll(/\$\(((?:[^()]|\([^()]*\))*)\)|`([^`]*)`/g)) openShell(m[1] ?? m[2] ?? '');
  segs.forEach((s, k) => {
    const w = s.words;
    const at = commandWordIndex(w);
    const b = at >= 0 ? clientName(w[at]) : '';
    for (let i = Math.max(at, 0); i < w.length; i++) {
      if (SHELL.test(b) && i > at && /^-[A-Za-z]*c[A-Za-z]*$/.test(w[i]) && w[i + 1] != null) openShell(w[i + 1]);
      if (INTERPRETER.test(b) && i > at && CODE_FLAG.test(w[i]) && w[i + 1] != null) openCode(w[i + 1]);
      if (w[i] === '<<<' && w[i + 1] != null) (INTERPRETER.test(b) ? openCode : openShell)(w[i + 1]);
    }
    if (b === 'eval') openShell(w.slice(at + 1).join(' '));
    if (b === 'script') for (let i = at + 1; i < w.length; i++) if (/^-[A-Za-z]*c[A-Za-z]*$/.test(w[i]) && w[i + 1] != null) openShell(w[i + 1]);
    for (let i = 0; i < Math.max(at, 0); i++) {
      // env -S splits its string and appends the rest of the line to it.
      if (/^(-S|--split-string)$/.test(w[i]) && w[i + 1] != null) openShell([w[i + 1], ...w.slice(i + 2)].join(' '));
      else if (/^-S./.test(w[i])) openShell([w[i].slice(2), ...w.slice(i + 1)].join(' '));
    }
    if (/^[gm]?awk$/.test(b)) {
      for (let i = at + 1; i < w.length; i++) { if (/^-[Fvf]$/.test(w[i])) { i++; continue; } if (/^-/.test(w[i])) continue; openCode(w[i]); break; }
    }
    for (const x of w) {
      if (any) {
        // In code, only what a call RUNS is opened — `os.system('curl …')`,
        // `execSync('curl …')`, `subprocess.run(['curl', …])`. A string that is
        // printed or stored is not: a scope check had `console.log('next: curl
        // …')` refused as a request.
        const m = String(x).match(EXEC_CALL);
        if (!m) continue;
        const arg = x.slice(m.index + m[0].length);
        // A call's arguments never open with a comma: `['exec(', 'curl ', …]`
        // is a list of words to search for, and the replay found it refused.
        if (/^\s*[,)]/.test(arg)) continue;
        if (CLIENT_WORD.test(arg) || /^\[/.test(arg)) openArg(arg.replace(/[[\],]/g, ' ').replace(/[)}\s]+$/, ''));
        continue;
      }
      if (/\s/.test(x) && CLIENT_WORD.test(x) && /^[A-Za-z_][A-Za-z0-9_]*=/.test(x)) openShell(x.replace(/^[A-Za-z_][A-Za-z0-9_]*=/, ''));
    }
    // `echo "…" | sh`: what is piped into a shell is run by it.
    const next = segs[k + 1];
    const tb = next ? clientName(next.words[commandWordIndex(next.words)] ?? '') : '';
    if (s.op === '|' && (SHELL.test(tb) || INTERPRETER.test(tb))) for (const x of w.slice(at + 1)) (SHELL.test(tb) ? openShell : openCode)(x);
  });
  return out;
}

/**
 * The web client a simple command runs, if any.
 * @param {string[]} words  one simple command's words.
 * @param {boolean | 'code'} [any]  as `commandsIn`: in what a call runs, a
 *   client anywhere counts; in a program's own text, none does.
 * @returns {{exe: string, at: number, browser?: boolean} | null} the client
 *   in the command's PROGRAM position (or after `find … -exec`), and its index.
 *   The version before this took a client from any word, and refused `grep -e
 *   curl -e host`, which names curl as a pattern. A browser run as a command is
 *   a client too, flagged as one.
 */
function clientOf(words, any = false) {
  if (any === 'code') return null;
  if (any) {
    for (let i = 0; i < words.length; i++) { const b = clientName(words[i]); if (CLIENTS.has(b)) return { exe: b, at: i }; }
    return null;
  }
  const first = commandWordIndex(words);
  const positions = [first];
  words.forEach((x, i) => { if (/^-(exec|execdir|ok|okdir)$/.test(x)) positions.push(i + 1); });
  for (const i of positions) {
    if (i < 0 || i >= words.length) continue;
    const b = clientName(words[i]);
    if (CLIENTS.has(b) || (i === first && /^https?$/.test(b))) return { exe: b, at: i };
    if (BROWSER_BIN.test(b)) return { exe: b, at: i, browser: true };
  }
  return null;
}

/**
 * The hosts a request names.
 * @param {string} text     words of a request: a client's arguments, or a URL.
 * @param {string} [context]  the whole line, for hosts held in a variable.
 * @returns {Set<string>} lower-case host names without a trailing dot, never a
 *   local one: every URL's host, every domain-shaped argument of a web client
 *   ending in a real top-level domain whether or not it carries a scheme (curl
 *   takes `pixinsight.com/x` as readily as the full URL), and, where a URL's
 *   host is a shell variable (`https://$h/`) or a glob (`https://{a,b}/`),
 *   every domain-shaped word in the context ending in a real top-level domain.
 */
export function hostsIn(text, context = text) {
  const hosts = new Set(); let templated = /\bhttps?:\/\/[{\[]/.test(text);
  const keep = (raw) => {
    const h = String(raw).toLowerCase().replace(/^[^@]*@/, '').replace(/:\d+$/, '').replace(/\.$/, '');
    const tld = h.split('.').pop();
    if (h.includes('.') && !LOCAL.test(h) && /^[a-z0-9.-]+$/.test(h) && !FILE_EXT.has(tld)) hosts.add(h);
  };
  for (const m of String(text).matchAll(/\bhttps?:\/\/[^\s'"<>`|;(){}\\]+/gi)) {
    const h = m[0].replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
    if (/[$%{]/.test(h)) { templated = true; continue; }
    keep(h);
  }
  for (const s of commandsIn(text)) {
    const c = clientOf(s.words, s.any);
    if (!c) continue;
    for (const w of s.words.slice(c.at + 1)) {
      const m = String(w).match(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?(?::\d+)?(?=[/?#]|$)/i);
      // Without a scheme, a word is a host only if it ends in a real top-level
      // domain: `-o rfc9110.dt` names a file, and an audit of this session
      // found two such file names recorded as hosts.
      if (m && !/^-/.test(w) && TLDS.has(m[0].toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '').split('.').pop())) keep(m[0]);
    }
  }
  // Where the host is a variable, a domain-shaped word counts only if it ends
  // in a real top-level domain: the first version took `keys.join` and
  // `json.parse` out of program text as hosts.
  if (templated) {
    for (const m of String(context).matchAll(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi)) {
      const tld = m[0].toLowerCase().split('.').pop();
      if (TLDS.has(tld)) keep(m[0]);
    }
  }
  return hosts;
}

/**
 * Who a host answers for: the name a refusal binds.
 * @param {string} h  a host.
 * @returns {string} the host itself, lower-cased, with a leading `www.` and a
 *   trailing dot taken off, so `www.x.org`, `x.org` and `x.org.` are one source.
 *   The version before this bound the whole registrable domain, and a replay of
 *   this session's 11 087 calls showed what that costs: a 503 from
 *   patents.google.com refused the owner's own photographs from
 *   drive.usercontent.google.com. Different services under one domain answer
 *   for themselves.
 */
export function site(h) {
  return String(h).toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
}

/**
 * Program text with its comments taken out.
 * @param {string} t  JavaScript, Python, shell or similar source.
 * @returns {string} the text without block comments, line comments (`//`
 *   after a space or at a line's start, never the `//` of a URL) and `#`
 *   comments, so a URL or a browser named in a comment is not a request.
 */
function stripComments(t) {
  return String(t ?? '').replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n').map((l) => l.replace(/(^|[\s;])\/\/.*$/, '$1').replace(/(^|\s)#(?!!).*$/, '$1')).join('\n');
}

// A URL handed to a request call in program text: the only place a program's
// host is taken from, so a URL in a data table or a log message is not one.
const CALL_URL = /\b(?:fetch|get|post|put|patch|head|request|urlopen|urlretrieve|goto|navigate|newPage|Request|open|axios|got|curl|wget|file_get_contents|load)\s*\(\s*(?:new\s+URL\(\s*)?[`'"](https?:\/\/[^`'"\s$]+)/gi;

/**
 * The text of every script a Bash command runs.
 * @param {{words: string[], depth: number, any: boolean}[]} segs  from `commandsIn`.
 * @param {string} cwd  where relative paths resolve.
 * @returns {{body: string, shell: boolean}[]} each script's text — run through
 *   an interpreter (`node x.mjs`, `python3 x`, `bash x.sh`), by path
 *   (`./fetchit`) or sourced (`. ./x`) — that makes a request, names a client or
 *   drives a browser, and whether a shell runs it (a shell, `.`, `source`, or a
 *   path whose first line or name says shell), so `analyze` opens it as a
 *   command line or as program code. The guard's own test is read like any
 *   other program: it was exempt by name while a program's whole text was
 *   opened as commands, and the exemption let any file of that name through.
 */
function scriptsRun(segs, cwd, written = {}) {
  const out = []; const seen = new Set();
  // Run by path, a file without a `#!` line is run by the shell.
  const isShell = (f, body, how) => how === 'shell' || (how === 'path' && (!/^#!/.test(body) || /^#!\S*(\/|\s)((ba|z|da|k)?sh)\b/.test(body)));
  const take = (w, needScript, how) => {
    if (!w || /^-/.test(w) || seen.has(w)) return;
    seen.add(w);
    const pending = Object.entries(written).find(([k]) => k === w || resolve(cwd || process.cwd(), k) === resolve(cwd || process.cwd(), w));
    if (pending) { const body = pending[1]; if (PROGRAM_REQUEST.test(body) || CLIENT_WORD.test(body) || BROWSER.test(body)) out.push({ body, shell: isShell(w, body, how) }); return; }
    try {
      const f = resolve(cwd || process.cwd(), w);
      const st = statSync(f);
      if (!st.isFile() || st.size > 262144) return;
      const body = readFileSync(f, 'utf8');
      if (body.slice(0, 1024).includes('\u0000')) return;
      if (needScript && !/\.(m?js|cjs|ts|py|sh|bash|pl|rb|php)$/.test(f) && !body.startsWith('#!')) return;
      if (PROGRAM_REQUEST.test(body) || CLIENT_WORD.test(body) || BROWSER.test(body)) out.push({ body, shell: isShell(f, body, how) });
    } catch { /* not a file */ }
  };
  for (const s of segs) {
    if (s.any) continue;
    const at = commandWordIndex(s.words);
    if (at < 0) continue;
    const w0 = s.words[at]; const b = basename(w0); const rest = s.words.slice(at + 1);
    if (SHELL.test(b) || INTERPRETER.test(b)) { if (!rest.some((x) => CODE_FLAG.test(x) || /^-[A-Za-z]*c[A-Za-z]*$/.test(x))) take(rest.find((x) => !/^-/.test(x)), true, SHELL.test(b) ? 'shell' : 'interp'); }
    else if (b === '.' || b === 'source') take(rest[0], false, 'shell');
    else if (String(w0).includes('/')) take(w0, true, 'path');
  }
  return out;
}

/**
 * The identity a client's own words give a request.
 * @param {string[]} words  one simple command's words.
 * @param {number} at       the client's index.
 * @param {string} exe      the client.
 * @returns {string | null} what in its options presents another identity: a
 *   user-agent flag in any spelling curl, wget or aria2c accept (alone, in a
 *   cluster, with its value attached, abbreviated, `--expand-…`, wget's `-e
 *   user_agent=` with or without separators), a header ending `-Agent:` or a
 *   browser's header, options or headers read from a file this guard cannot see
 *   (`-K`, `--config`, `-H @file`), an option or header built at run time, or
 *   an httpie header item naming the agent.
 */
function flagIdentity(words, at, exe) {
  const w = words.slice(at + 1);
  for (let i = 0; i < w.length; i++) {
    const x = w[i];
    const setsUA = new RegExp(`^-[${CURL_NOARG}]*[AU]`).test(x) || /^--user-?a/i.test(x) || /^-useragent/i.test(x) || /^--expand-/.test(x);
    if (setsUA) return `sets its own User-Agent (${x.slice(0, 24)})`;
    if (new RegExp(`^-[${CURL_NOARG}]*K`).test(x) || /^--config(=|$)/.test(x)) return 'reads its options from a file this guard cannot see (-K / --config)';
    if ((/^-/.test(x) && /[$`{\\]/.test(x)) || /^\$['-]/.test(x)) return `builds an option at run time (${x.slice(0, 24)}), which this guard cannot read`;
    if (/^-/.test(x) && /useragent/i.test(x.replace(/[-_.]/g, ''))) return `sets its own User-Agent (${x.slice(0, 24)})`;
    const ev = /^(-e|--execute)$/.test(x) || (/^wget/.test(exe) && /^-[A-Za-z]*e$/.test(x)) ? w[i + 1] : /^--execute=/.test(x) ? x.slice(10) : /^-e./.test(x) && /^wget/.test(exe) ? x.slice(2) : null;
    const evn = ev == null ? '' : String(ev).replace(/[-_\s]/g, '').toLowerCase();
    if (evn.startsWith('useragent') || (evn.startsWith('header') && evn.includes('agent'))) return 'sets a User-Agent through wget -e';
    let hv = null;
    if (new RegExp(`^-[${CURL_NOARG}]*H`).test(x)) hv = x.replace(new RegExp(`^-[${CURL_NOARG}]*?H`), '') || w[i + 1];
    else if (/^--heade(?:r)?$/.test(x)) hv = w[i + 1];
    else if (/^--heade(?:r)?=/.test(x)) hv = x.replace(/^--heade(?:r)?=/, '');
    if (hv != null && /^\s*@/.test(hv)) return 'reads its headers from a file this guard cannot see (-H @file)';
    if (hv && /[$`\\]/.test(hv)) return 'builds a header at run time, which this guard cannot read';
    if (hv && /^\s*\S*-agent\s*:/i.test(hv)) return 'sets a User-Agent header';
    if (hv && /^\s*(sec-fetch-|sec-ch-ua|upgrade-insecure-requests)/i.test(hv)) return "sends a browser's request headers";
    if (/^https?$/.test(exe) && /^[\w-]*agent[:=]/i.test(x)) return 'sets a User-Agent header';
  }
  const joined = w.join(' ').replace(/\bhttps?:\/\/\S+/g, ' ');
  if (/user[-_ ]?agent\s*["']?\s*[:=,]|useragent\s*[:=]/i.test(joined)) return 'sets a User-Agent';
  if (/Mozilla\/\d|AppleWebKit|Chrome\/\d|Safari\/\d|Firefox\/\d|Gecko\/\d/.test(joined)) return "names a browser's identity";
  return null;
}

/**
 * What a program's text does to its identity.
 * @param {string} t  program text, comments taken out.
 * @returns {string | null} a User-Agent it sets, a borrowed identity, a
 *   browser's headers or name, or a browser it drives or impersonates.
 */
function programIdentity(t) {
  const bare = String(t).replace(/\bhttps?:\/\/[^\s'"`)]+/g, ' ');
  if (/user[-_ ]?agent\s*["']?\s*[:=,]|useragent\s*[:=]/i.test(bare)) return 'sets a User-Agent';
  if (/fake[_-]?useragent/i.test(bare)) return "borrows another program's identity";
  if (/\bsec-fetch-|\bsec-ch-ua|upgrade-insecure-requests/i.test(bare)) return "sends a browser's request headers";
  if (/Mozilla\/\d|AppleWebKit|Chrome\/\d|Safari\/\d|Firefox\/\d|Gecko\/\d/.test(bare)) return "names a browser's identity";
  if (BROWSER.test(bare)) return 'drives or impersonates a browser';
  return null;
}

/**
 * Everything this guard needs to know about one call.
 * @param {object} p  a tool payload.
 * @returns {{request: boolean, hosts: Set<string>, identity: string | null, text: string}}
 *   whether it asks the network for anything; the hosts it asks; what about it
 *   presents another identity; and its request text (the command as run, plus
 *   the program text it runs). For Bash the hosts are those named by commands
 *   that make a request — a client in program position, a command whose program
 *   is a variable, a request call's URL argument in program code — and, where a
 *   client's URL is a variable or comes through `xargs`, every URL on the line,
 *   in its data heredocs and in any file fed in with `<`. A browser tool's URL is
 *   taken with or without a scheme. Callers rely on `hosts` never naming a host
 *   that appears only in a comment, a commit message or a data table.
 */
export function analyze(p) {
  const tool = String(p.tool_name ?? '');
  let a;
  if (tool !== 'Bash') {
    const u = tool === 'WebFetch' ? String(p.tool_input?.url ?? '') : urlOf(p);
    if (!u) a = { request: false, hosts: new Set(), identity: null, text: '' };
    else {
      const full = /^https?:\/\//i.test(u) ? u : `https://${u}`;
      a = { request: true, hosts: hostsIn(full), identity: BROWSER_TOOL.test(tool) ? 'drives a browser' : null, text: full };
    }
  } else {
    const cmd = String(p.tool_input?.command ?? '');
    const h = heredocs(cmd);
    const sink = { code: [] };
    const segs = commandsIn(h.shell, 0, false, sink);
    const scripts = scriptsRun(segs, p.cwd, h.files);
    // A script a shell runs is a command line; a program's text is code, and
    // so is a heredoc an interpreter reads, whose calls were never opened before.
    for (const { body, shell } of scripts) segs.push(...commandsIn(stripComments(body), 1, shell ? false : 'code', sink));
    for (const t of h.programs) segs.push(...commandsIn(stripComments(t), 1, 'code', sink));
    const programs = [...h.programs, ...sink.code, ...scripts.map((x) => x.body)].map(stripComments);
    const clientSegs = []; const varSegs = [];
    for (const s of segs) {
      const c = clientOf(s.words, s.any);
      if (c) { clientSegs.push({ s, c }); continue; }
      const i = commandWordIndex(s.words);
      if (!s.any && i >= 0 && /^\$/.test(s.words[i])) varSegs.push({ s, c: { exe: '', at: i } });
    }
    const request = clientSegs.length > 0 || (varSegs.length > 0 && CLIENT_WORD.test(h.shell))
      || programs.some((t) => PROGRAM_REQUEST.test(t) || BROWSER.test(t.replace(/\bhttps?:\/\/[^\s'"`)]+/g, ' ')));
    const hosts = new Set();
    let fromVariable = false;
    let identity = null;
    for (const { s, c } of [...clientSegs, ...varSegs]) {
      for (const x of hostsIn(s.words.slice(c.at).join(' '), h.shell)) hosts.add(x);
      // A URL in a variable (`curl "$u"`, `"$@"`) comes from elsewhere in the
      // line — a `for` list, a heredoc, a function's call — or from a file fed in
      // with `<`, or through `xargs`. The first version took no host from it,
      // and a loop of browser-identity requests over publishers went unseen.
      if (s.words.slice(c.at + 1).some((x) => /^\$\{?[A-Za-z_@*0-9]/.test(x) || /^https?:\/\/\$/.test(x))) fromVariable = true;
      if (s.words.slice(0, c.at).some((x) => basename(x) === 'xargs')) fromVariable = true;
      if (!identity && c.browser) identity = 'drives or impersonates a browser';
      if (!identity) identity = flagIdentity(s.words, c.at, c.exe);
    }
    if (fromVariable) {
      for (const x of hostsIn(h.shell)) hosts.add(x);
      for (const d of h.data) for (const x of hostsIn(d)) hosts.add(x);
      for (const s of splitShell(h.shell)) for (let i = 0; i < s.words.length; i++) {
        const f = s.words[i] === '<' ? s.words[i + 1] : /^<[^<(]/.test(s.words[i]) ? s.words[i].slice(1) : null;
        if (!f) continue;
        try { const t = readFileSync(resolve(p.cwd || process.cwd(), f), 'utf8'); if (t.length < 262144) for (const x of hostsIn(t)) hosts.add(x); } catch { /* not a file */ }
      }
    }
    for (const t of programs) for (const m of t.matchAll(CALL_URL)) for (const x of hostsIn(m[1])) hosts.add(x);
    if (!identity && clientSegs.length && /(^|[\s;&|(])(export\s+)?(HOME|CURL_HOME|WGETRC|SYSTEM_WGETRC|XDG_CONFIG_HOME)=/.test(h.shell)) identity = 'points the client at another configuration (HOME, CURL_HOME, WGETRC, SYSTEM_WGETRC)';
    if (!identity) for (const t of programs) { identity = programIdentity(t); if (identity) break; }
    if (!identity && clientSegs.length) identity = rcIdentity();
    a = { request, hosts, identity, text: [h.shell, ...programs].join('\n') };
  }
  return a;
}

/**
 * The full text of a request.
 * @param {object} p  a tool payload.
 * @returns {string} a URL tool's URL; for Bash the command as run (heredoc
 *   data taken out) plus the program text it runs; '' for anything else.
 */
export function requestText(p) { return analyze(p).text; }

/**
 * The hosts a call actually asks.
 * @param {object} p  a tool payload.
 * @returns {Set<string>} as `analyze`.
 */
export function requestHosts(p) { return analyze(p).hosts; }

/**
 * Does this call ask the network for something?
 * @param {object} p  a tool payload.
 * @returns {boolean} as `analyze`.
 */
export function isWebRequest(p) { return analyze(p).request; }

/**
 * The URL a tool other than Bash asks for, if it asks for one.
 * @param {object} p  a tool payload.
 * @returns {string | null} its `url` (or `uri`, `href`), with or without a
 *   scheme, when the tool's name says it fetches, browses or navigates.
 */
function urlOf(p) {
  if (!URL_TOOL.test(String(p.tool_name ?? ''))) return null;
  const i = p.tool_input ?? {};
  return [i.url, i.uri, i.href].find((x) => typeof x === 'string' && /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]|$)/i.test(x)) ?? null;
}

/**
 * Does a request present itself as something other than the client it is?
 * @param {string} text  a Bash command line.
 * @param {string} [tool]  the tool, when it is not Bash.
 * @returns {string | null} as `analyze`'s identity: a User-Agent of its own
 *   choosing, a browser's headers or name, a driven browser, or options and
 *   headers read from somewhere this guard cannot see. An honest `Accept` is
 *   content negotiation and is NOT here.
 */
export function identityChange(text, tool = 'Bash') {
  if (BROWSER_TOOL.test(tool)) return 'drives a browser';
  return analyze({ tool_name: 'Bash', tool_input: { command: String(text) } }).identity;
}

/**
 * Does a client's own configuration file give every request another identity?
 * @returns {string | null} the file and what it does, or null. curl reads
 *   `~/.curlrc` and wget `~/.wgetrc` and `/etc/wgetrc` on every run, so a
 *   user-agent written there is a disguise no command line shows.
 */
function rcIdentity() {
  for (const f of [join(process.env.CURL_HOME || homedir(), '.curlrc'), join(homedir(), '.config', 'curlrc'), join(homedir(), '.wgetrc'),
    process.env.WGETRC || '', process.env.SYSTEM_WGETRC || '', '/etc/wgetrc']) {
    if (!f) continue;
    try { if (/^\s*user[-_]?agent/im.test(readFileSync(f, 'utf8'))) return `${f} sets a user-agent for every request`; } catch { /* none */ }
  }
  return null;
}

/**
 * Does this command only read a host's reply in full, as itself?
 * @param {string} cmd   a Bash command.
 * @param {string} host  the host whose reply is to be read.
 * @returns {boolean} true for one curl pipeline naming the host that shows the
 *   response headers (`-i`, `--include`, `-v`, `-D -`), keeps the body (no
 *   `-o` to a file, no `-I`, no `--fail`), sends no header but `Accept*`, no
 *   user-agent, cookie or referer, and pipes at most into `cat` or a `head`
 *   keeping 20 000 bytes or 400 lines. Anything else is not a reading.
 */
export function readsInFull(cmd, host) {
  if (identityChange(cmd)) return false;
  // `cd somewhere &&` before the read is allowed; nothing else before it.
  const all = splitShell(cmd);
  let lead = 0;
  while (lead < all.length - 1 && basename(all[lead].words[0] ?? '') === 'cd' && all[lead].op === '&&') lead++;
  const segs = all.slice(lead);
  if (!segs.length || segs.some((s) => !['|', ''].includes(s.op))) return false;
  const [first, ...rest] = segs;
  const c = clientOf(first.words);
  if (!c || c.exe !== 'curl' || first.words.slice(0, c.at).some((x) => !/^(timeout|time|\d+[smhd]?)$/.test(x))) return false;
  const w = first.words.slice(c.at + 1);
  if (!w.some((x) => /^https?:\/\//i.test(x) && site(x.replace(/^https?:\/\//i, '').split(/[/?#:]/)[0]) === site(host))) return false;
  let headers = false;
  for (let i = 0; i < w.length; i++) {
    const x = w[i];
    if (/^-[A-Za-z]+$/.test(x)) {
      if (/[IfoOAebDHumXwdFTK]/.test(x.slice(1, -1)) || /[If]/.test(x)) return false;
      if (/[iv]/.test(x)) headers = true;
      const last = x.at(-1);
      if (last === 'o') { if (w[i + 1] !== '-') return false; i++; continue; }
      if (last === 'O') return false;
      if (last === 'D') { if (w[i + 1] === '-') headers = true; i++; continue; }
      if (last === 'H') { if (!/^accept(-[a-z]+)?\s*:/i.test(w[i + 1] ?? '')) return false; i++; continue; }
      if ('Aebu'.includes(last)) return false;
      if ('wdFTK'.includes(last)) return false;
      if (last === 'X') { if (!/^GET$/i.test(w[i + 1] ?? '')) return false; i++; continue; }
      if (last === 'm') { i++; continue; }
      continue;
    }
    if (x === '--include' || x === '--verbose') { headers = true; continue; }
    if (['--head', '--fail', '--remote-name', '--user-agent', '--referer', '--cookie', '--user'].includes(x) || /^--(write-out|trace|data|form|upload-file|json|config)/.test(x) || /^file:/i.test(x)) return false;
    if (x === '--request' || x.startsWith('--request=')) { if (!/^GET$/i.test(x.includes('=') ? x.split('=')[1] : w[i + 1] ?? '')) return false; if (!x.includes('=')) i++; continue; }
    if (x === '--output' || x.startsWith('--output=')) { if ((x.includes('=') ? x.split('=')[1] : w[i + 1]) !== '-') return false; if (!x.includes('=')) i++; continue; }
    if (x === '--dump-header') { if (w[i + 1] === '-') headers = true; i++; continue; }
    if (x === '--header' || x.startsWith('--header=')) { const v = x.includes('=') ? x.slice(9) : w[++i]; if (!/^accept(-[a-z]+)?\s*:/i.test(v ?? '')) return false; continue; }
    if (/^\d*>{1,2}(?!&)/.test(x)) return false;
  }
  if (!headers) return false;
  for (const s of rest) {
    const [exe, ...a] = s.words;
    if (exe === 'cat' && !a.length) continue;
    if (exe === 'head') {
      const j = a.join(' ');
      const bytes = j.match(/^-c\s*(\d+)$/); const linesN = j.match(/^-(?:n\s*)?(\d+)$/);
      if ((bytes && Number(bytes[1]) >= 10000) || (linesN && Number(linesN[1]) >= 200)) continue;
    }
    return false;
  }
  return true;
}

const PROXY_LINE = /CONNECT tunnel failed, response 40[37]|Received HTTP code 40[37] from proxy after CONNECT|no rule or allowlist entry allows host|EGRESS_BLOCKED|connect_rejected/;
const CHALLENGE = /cf-mitigated:\s*challenge|<title>\s*Just a moment|Attention Required! \| Cloudflare|\bcaptcha\b|Request blocked\.|The request could not be satisfied|Access Denied<\/title>/i;
const INSTRUCTION_HEADERS = ['tdm-reservation', 'tdm-policy', 'link', 'retry-after', 'www-authenticate', 'cf-mitigated', 'x-cache', 'content-type', 'location', 'allow'];

/**
 * Find the declining replies in what a request printed.
 * @param {string} reqText  the request (command, program text or URL).
 * @param {string} out      everything it printed, or its error text.
 * @param {number} [code]   a WebFetch response code, when the tool gave one.
 * @param {Set<string>} [known]  the hosts the call asked (`requestHosts`);
 *   every host in the request text when not given.
 * @param {boolean} [fetch]  the reply came through a fetch tool, not a shell
 *   client, so the tool's own wording for a status is read.
 * @returns {object[]} one entry per host that declined: `{host, cause, status,
 *   server, headers, evidence, excerpt}`. Cause is `proxy` (this container
 *   refused; the host was never asked), `challenge`, `tool` or `reply`. A line
 *   naming no host is laid on the host named nearest it, else on every host the
 *   request names: over-recording costs one reading, under-recording is the
 *   failure this file exists for.
 */
export function declinesIn(reqText, out, code, known, fetch = false) {
  const hosts = known ?? hostsIn(reqText);
  const lines = String(out ?? '').split(/\r?\n/);
  const found = new Map();
  const rank = { proxy: 4, challenge: 3, tool: 2, reply: 1 };
  const add = (hs, d) => {
    for (const host of hs) {
      const cur = found.get(host);
      if (!cur) { found.set(host, { status: 0, server: '', ...d, host, headers: { ...(d.headers ?? {}) }, evidence: [...(d.evidence ?? [])] }); continue; }
      if (rank[d.cause] > rank[cur.cause]) cur.cause = d.cause;
      if (d.status && !cur.status) cur.status = d.status;
      if (d.server && !cur.server) cur.server = d.server;
      Object.assign(cur.headers, d.headers ?? {});
      cur.evidence.push(...(d.evidence ?? []));
      if (d.excerpt && !cur.excerpt) cur.excerpt = d.excerpt;
    }
  };
  const mention = (s) => [...hosts].filter((h) => String(s ?? '').toLowerCase().includes(h));
  const attribute = (i) => {
    let m = mention(lines[i]); if (m.length) return m;
    if (/^curl: /.test(lines[i])) for (let j = i + 1; j <= Math.min(lines.length - 1, i + 2); j++) { m = mention(lines[j]); if (m.length) return m; }
    for (let j = i - 1; j >= Math.max(0, i - 60); j--) { m = mention(lines[j]); if (m.length) return m; }
    for (let j = i + 1; j <= Math.min(lines.length - 1, i + 2); j++) { m = mention(lines[j]); if (m.length) return m; }
    return [...hosts];
  };
  const around = (i, n = 3) => lines.slice(Math.max(0, i - n), i + n + 1).join('\n');
  // A status line is a reply's only where a reply can start: not inside a
  // fenced code block, and inside a page's body only after a blank or a label
  // line. A scope check had 200 pages recorded as refusals because their text
  // quoted `HTTP/1.1 406 Not Acceptable`.
  let fence = false; let inBody = false;

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^\s*(```|~~~)/.test(L)) { fence = !fence; continue; }
    if (fence) continue;
    // ---- this container's proxy: the host was never asked ----
    for (const m of L.matchAll(/-\s+([a-z0-9.-]+\.[a-z]{2,}):\d+\s+—\s+connect_rejected/gi)) add([m[1].toLowerCase()], { cause: 'proxy', evidence: [L.trim()], excerpt: around(i) });
    for (const m of L.matchAll(/"error_type"\s*:\s*"EGRESS_BLOCKED"\s*,\s*"domain"\s*:\s*"([^"]+)"/g)) add([m[1].toLowerCase()], { cause: 'proxy', evidence: [L.trim().slice(0, 400)], excerpt: L.slice(0, 1200) });
    for (const m of L.matchAll(/allowlist entry allows host \\?"([^"\\]+)\\?"/g)) add([m[1].toLowerCase()], { cause: 'proxy', evidence: [L.trim()], excerpt: around(i) });
    if (/CONNECT tunnel failed, response 40[37]|Received HTTP code 40[37] from proxy after CONNECT/.test(L)) { add(attribute(i), { cause: 'proxy', evidence: [L.trim()], excerpt: around(i) }); continue; }
    // ---- a server's own status line, with its headers and body ----
    const st = L.replace(/^< /, '').match(/^HTTP\/[\d.]+\s+(\d{3})\b/);
    const prev = i > 0 ? lines[i - 1] : '';
    if (st && (!inBody || !prev.trim() || /^(==|--|>>|##|< )/.test(prev) || /^< /.test(L))) {
      const status = Number(st[1]);
      let j = i + 1; const headers = {}; let server = '';
      for (; j < lines.length; j++) {
        const h = lines[j].replace(/^< /, '');
        const hm = h.match(/^([A-Za-z0-9-]+):\s*(.*)$/);
        if (!h.trim() || !hm) break;
        const k = hm[1].toLowerCase();
        if (k === 'server') server = hm[2].trim();
        if (INSTRUCTION_HEADERS.includes(k)) headers[k] = hm[2].trim().slice(0, 400);
      }
      inBody = true;
      // Every status at 400 and above, 404 included: a server saying "not
      // here" has said something too, and the plan this gate came from drew
      // the line at 400, not at whichever replies look like refusals.
      if (status < 400) { i = j - 1; continue; }
      let k = j + 1;
      while (k < lines.length && !/^(< )?HTTP\/[\d.]+\s+\d{3}\b/.test(lines[k])) k++;
      const block = lines.slice(i, k).join('\n');
      const proxy = PROXY_LINE.test(block) && !server;
      add(attribute(i), {
        cause: proxy ? 'proxy' : CHALLENGE.test(block) ? 'challenge' : 'reply', status, server, headers,
        evidence: [L.trim()], excerpt: block.slice(0, 2400),
      });
      continue;
    }
    // ---- a client's report of a status it was given ----
    // A client's own words for a status, the fetch tool's among them ("The
    // server returned HTTP 403 Forbidden"), which an audit of this session
    // found eight times with nothing recorded.
    // A client's own report, at the start of its own line — never the same
    // words quoted inside a page that answered: a scope check had a 200 page
    // quoting wget's `ERROR 403: Forbidden.` recorded as a refusal. The fetch
    // tool's own sentences are read only from the fetch tool.
    const cf = (/\bcurl\b/.test(reqText) && L.match(/^curl: \(22\) The requested URL returned error: (\d{3})/)) || (/\bwget2?\b/.test(reqText) && L.match(/^(?:\d{4}-\d\d-\d\d \d\d:\d\d:\d\d )?ERROR (\d{3}):/))
      || (fetch ? (L.match(/\b(?:failed|error)\b.*\bstatus code (\d{3})\b/i) || L.match(/\breturned HTTP (\d{3})\b/i)) : null);
    if (cf && Number(cf[1]) >= 400) { add(attribute(i), { cause: 'reply', status: Number(cf[1]), evidence: [L.trim()], excerpt: around(i) }); continue; }
    const tool = L.match(/unable to fetch from ([a-z0-9.-]+\.[a-z]{2,})/i);
    if (tool) { add([tool[1].toLowerCase()], { cause: 'tool', evidence: [L.trim()], excerpt: around(i) }); continue; }
    if (/%\{(?:http|response)_code\}/.test(reqText)) {
      // A status stands alone or after `= `, `, `, `| ` or `: ` — never glued
      // to a colon, which is a port: the proxy's own note prints `host:443`,
      // and an audit of this session found 264 "replies" with status 443.
      // …and stands as the first or second word of its line (`403`, `host
      // 403 5560 url`), never inside JSON (`"total-results": 412,`).
      const toks = L.trim().split(/\s+/);
      for (const t of [toks[0], toks[1]]) {
        if (/^[45]\d\d$/.test(t ?? '') && !/^["{[]/.test(toks[0])) { add(attribute(i), { cause: 'reply', status: Number(t), evidence: [L.trim()], excerpt: around(i) }); break; }
      }
    }
    // A challenge is a refusal only where the server says so in a header; the
    // word "captcha" in a page that answered 200 is an article about one.
    if (/^(< )?cf-mitigated:\s*challenge/i.test(L)) add(attribute(i), { cause: 'challenge', evidence: [L.trim()], excerpt: around(i, 6) });
  }
  if (code && code >= 400) add([...hosts], { cause: CHALLENGE.test(String(out)) ? 'challenge' : 'reply', status: code, evidence: [`WebFetch answered ${code}`], excerpt: String(out).slice(0, 1200) });
  return [...found.values()];
}

/**
 * Was a reply captured on its own, or among other output?
 * @param {object} p  a tool payload.
 * @returns {boolean} true when a Bash line is more than one request pipeline —
 *   commands chained with `;`, `&&` or `||`, a substitution, a loop — so what
 *   it printed may hold words no server sent. A reading of such a reply is
 *   refused until the reply is read on its own: the version before this took
 *   `--said` from anything the line printed, and `curl -i URL; echo 'words'`
 *   made the session's own words a reading. `cd somewhere &&` before a lone
 *   request is not mixing; curl's `-w` is.
 */
export function mixedCapture(p) {
  if (p.tool_name !== 'Bash') return false;
  const cmd = String(p.tool_input?.command ?? '');
  const all = splitShell(cmd);
  let lead = 0;
  while (lead < all.length - 1 && basename(all[lead].words[0] ?? '') === 'cd' && all[lead].op === '&&') lead++;
  const segs = all.slice(lead);
  const c = clientOf(segs[0]?.words ?? []);
  if (!c) return true;
  // curl's -w prints what the session wrote, beside what the server sent: a
  // scope check forged a reading with `-w '\nwords of its own\n'`.
  const cw = segs[0].words.slice(c.at + 1);
  if (cw.some((x) => (/^-[A-Za-z]*w/.test(x) && !x.startsWith('--')) || /^--write-out/.test(x))) return true;
  // A second URL, a file: URL, a trace of what was sent, or options from a file
  // each put words the session chose beside the reply — three forgeries a
  // scope check made.
  if (cw.filter((x) => /^[a-z]+:\/\//i.test(x)).length > 1 || cw.some((x) => /^file:/i.test(x) || /^--trace/.test(x) || /^(-K|--config)$/.test(x) || /^-[A-Za-z]*K/.test(x))) return true;
  return segs.some((s) => !['|', ''].includes(s.op)) || /\$\(|`|<</.test(cmd);
}

/**
 * The part of a captured reply that the SERVER said.
 * @param {string} text  a request's whole output.
 * @returns {string} the text minus what the client printed about itself —
 *   curl's and wget's own lines, progress meters, `-v`'s request lines (`> `)
 *   and notes (`* `), an exit-code line, and bare status lines. A reading's
 *   `--said` is looked for HERE, so a status code or curl's own complaint
 *   cannot stand in for having read what the server sent.
 */
export function replyText(text) {
  return String(text ?? '').split(/\r?\n/)
    .filter((l) => !/^(curl: |wget: |\s*% Total|\s*Dload|\s*\d+\s+\d+\s+\d+|\* |> |Exit code \d+$)/.test(l) && !/^(< )?HTTP\/[\d.]+\s+\d{3}\s*\S*\s*$/.test(l))
    .map((l) => l.replace(/^< /, '')).join('\n');
}

/**
 * The identity of a call, for "the same call again".
 * @param {string} tool   the tool name.
 * @param {object} input  its input.
 * @returns {string} a sha256 of the tool and what the call DOES — a Bash
 *   command's text, any other tool's input without its description — so a
 *   relabelled retry is still the same call.
 */
export function callHash(tool, input) {
  const what = tool === 'Bash' ? String(input?.command ?? '') : JSON.stringify({ ...(input ?? {}), description: undefined });
  return createHash('sha256').update(`${tool}\n${what}`).digest('hex');
}

/**
 * Parse a reading command.
 * @param {string} cmd  a Bash command.
 * @returns {{target: string, said: string, route: string, bad?: string} | null}
 *   null when the command does not invoke this file with `--read`. When it
 *   does, `bad` says why it is not a reading unless it is EXACTLY one plain
 *   invocation — `node <this file>` and the three flags with their values,
 *   nothing else: no `$`, no backtick, no redirect, no extra word, nothing
 *   chained. The first version checked only that the command did not split,
 *   and a `--route` carrying `$( curl … )` was recorded and then run by bash.
 */
export function parseRead(cmd) {
  const raw = String(cmd ?? '');
  const segs = splitShell(raw);
  const w = segs[0]?.words ?? [];
  if ((w[0] !== 'node' && w[0] !== process.execPath) || !w[1] || resolve(w[1]) !== SELF || !w.some((x) => x === '--read' || x.startsWith('--read='))) return null;
  const vals = {}; let bad = '';
  for (let i = 2; i < w.length; i++) {
    const m = w[i].match(/^--(read|said|route)(=(.*))?$/s);
    if (!m) { bad = `an extra word (${w[i].slice(0, 30)})`; break; }
    if (m[1] in vals) { bad = `--${m[1]} twice`; break; }
    vals[m[1]] = m[2] ? m[3] : w[++i];
    if (vals[m[1]] == null) { bad = `--${m[1]} has no value`; break; }
  }
  if (!bad && segs.length !== 1) bad = 'more than one command';
  if (!bad && /[`$]/.test(raw)) bad = 'a $ or a backtick, which the shell would expand';
  if (!bad && !('said' in vals && 'route' in vals)) bad = 'no --said or no --route';
  return { target: String(vals.read ?? '').toLowerCase(), said: vals.said ?? '', route: vals.route ?? '', ...(bad ? { bad } : {}) };
}

function latestDecline(ev, host) {
  for (let i = ev.length - 1; i >= 0; i--) if (ev[i].kind === 'decline' && site(ev[i].host) === site(host)) return i;
  return -1;
}

const indent = (s) => String(s ?? '').split('\n').slice(0, 30).map((l) => `    | ${l.slice(0, 300)}`).join('\n');

/**
 * Check a reading against the ledger.
 * @param {{target: string, said: string, route: string}} r  from `parseRead`.
 * @param {object[]} ev  the ledger.
 * @returns {string | null} why the reading is refused, or null when it may be
 *   recorded. The words must be in what the server said (for the proxy or the
 *   fetch tool, in what the client reported of it); the route must be one that
 *   reply allows: a proxy refusal routes only to the owner, `negotiate` answers
 *   only a 406 or 415, `later` only a reply that said temporarily or gave
 *   Retry-After (or a 429 or 503), `tdm` only a reply naming its policy.
 */
export function checkReading(r, ev) {
  const said = norm(r.said);
  if (r.target.startsWith('call:')) {
    const id = r.target.slice(5);
    const f = [...ev].reverse().find((e) => e.kind === 'fail' && e.id === id);
    if (!f) return `reply-guard: no failed call ${id} is on record.`;
    // An error of a few words ("Exit code 1") is read by quoting all of it.
    if (said === norm(f.text)) return norm(r.route).length < 15 ? 'reply-guard: --route must say what is different now, in at least a short sentence.' : null;
    if (said.length < 12 || (said.match(/[a-z]{2,}/g) ?? []).length < 3) return 'reply-guard: --said must quote at least three words of the error, copied from it.';
    if (!norm(f.text).includes(said)) return `reply-guard: --said is not in that call's error. Copy the words from the error itself:\n${indent(String(f.text).slice(0, 1200))}`;
    if (norm(r.route).length < 15) return 'reply-guard: --route must say what is different now, in at least a short sentence.';
    return null;
  }
  const i = latestDecline(ev, r.target);
  if (i < 0) return `reply-guard: nothing from ${r.target} is on record as declined, so there is nothing to read.`;
  const d = ev[i];
  if (d.seeded && d.cause !== 'proxy') return `reply-guard: ${d.host}'s refusal was loaded from an extraction of earlier transcripts, so its words cannot be vouched for here. Read the reply on its own now — curl -sS -i '<url>', as itself — and record the reading against that.`;
  if (d.mixed && d.cause !== 'proxy' && d.cause !== 'tool') return `reply-guard: ${d.host}'s reply was captured among other output in one command line, so its words cannot be told from the rest. Read it on its own first — curl -sS -i '<url>', as itself — and record the reading against that.`;
  const source = d.cause === 'proxy' || d.cause === 'tool' ? d.text : replyText(d.text);
  // A reply of a few words ("404: Not Found") is read by quoting all of it —
  // all of its body, after the headers.
  const whole = norm(String(d.text ?? '').split(/\r?\n\r?\n/).slice(1).join('\n') || source);
  if (!(whole.length < 40 && said === whole) && (said.length < 20 || (said.match(/[a-z]{2,}/g) ?? []).length < 4)) return 'reply-guard: --said must quote at least four words (20 characters) of what the reply said, copied from it — or, where the reply is shorter than that, all of it.';
  if (!norm(source).includes(said)) {
    return `reply-guard: --said is not in what ${d.host} said. It must be the server's own words — not the status line, not curl's message about it. If the body was not printed, read it in full first (curl -sS -i '<url>').\nWhat was captured:\n${indent(String(source).slice(0, 1500))}`;
  }
  const kind = (r.route.match(/^\s*([a-z-]+)\s*:/i)?.[1] ?? '').toLowerCase();
  if (!ROUTES.includes(kind) || norm(r.route).length < kind.length + 12) return `reply-guard: --route must start with one of ${ROUTES.join(', ')}, then a colon, then how, in a few words.`;
  if (d.cause === 'proxy' && kind !== 'owner') return `reply-guard: this container's network refused ${d.host}; the host was never asked, so the only route is the owner: ask them to allow ${d.host}, naming it (LESSONS §188).`;
  const all = `${d.text}\n${JSON.stringify(d.headers ?? {})}`;
  if (kind === 'negotiate' && ![406, 415].includes(d.status)) return `reply-guard: negotiate answers a 406 or 415; ${d.host} answered ${d.status || 'no status'}.`;
  // "Try again later" is the reply naming this route; CloudFront's refusal
  // page says it, and the first version refused it for not saying
  // "temporarily".
  if (kind === 'later' && !(LATER_WORDS.test(all) || d.headers?.['retry-after'] || [429, 503].includes(d.status))) return `reply-guard: later is a route only where the reply said temporarily or to try again later, gave Retry-After, or answered 429 or 503; ${d.host}'s did none of those.`;
  if (kind === 'tdm' && !/tdm|text and data mining/i.test(all)) return `reply-guard: tdm is a route only where the reply names a text-and-data-mining policy; ${d.host}'s does not.`;
  return null;
}

function describe(d) {
  const parts = [];
  if (d.cause === 'proxy') parts.push("this container's network proxy refused the connection — the host itself was never asked");
  else parts.push(d.status ? `HTTP ${d.status}` : d.cause === 'tool' ? 'the fetch tool refused it' : 'a declining reply');
  if (d.cause === 'challenge') parts.push('a challenge page');
  if (d.server) parts.push(`server: ${d.server}`);
  for (const [k, v] of Object.entries(d.headers ?? {})) parts.push(`${k}: ${v}`);
  return parts.join('; ');
}

function readCommand(host, d) {
  return `node ${SELF} --read ${host} --said "<words copied from the reply>" --route "${d.cause === 'proxy' ? `owner: asked to allow ${host}` : '<kind>: <how>'}"`;
}

function declineReason(host, d) {
  const what = d.cause === 'proxy'
    ? `This container refused ${host} before the request left. That is a fact about the container and says nothing about the source (LESSONS §188). Ask the owner to allow it, naming ${host}; requests to it then wait for the owner's next message.`
    : 'Doubt yourself first: a reply that declines usually says why, and how to ask instead. If its body was cut off, read it in full as yourself — curl -sS -i \'<url>\', an Accept header allowed, nothing discarded — then record the reading and the honest route.\n  Routes: api, negotiate (a 406), tdm (the policy it names), author-copy, open-index, later (it said temporarily or gave Retry-After), owner. Never another identity.';
  return `reply-guard (LESSONS §374): ${host} declined and nothing on record says its reply was read.\n  ${describe(d)}\n  What it said:\n${indent(d.excerpt || String(d.text ?? '').slice(0, 1500))}\n${what}\n  ${readCommand(host, d)}`;
}

/**
 * Catch up from the transcript tail what the post-tool hooks may have missed.
 * @param {object} p   the PreToolUse payload (its transcript_path).
 * @param {object[]} ev  the ledger, whose `start` event bounds how far back.
 * @returns {void} appends `fail` events for failed calls (never a hook's or
 *   the user's refusal) and `decline` events for web requests, each once by
 *   tool_use_id, so `decide` sees a failure even where PostToolUseFailure has
 *   never been wired.
 */
function catchUp(p, ev) {
  if (!p.transcript_path) return;
  const start = ev.find((e) => e.kind === 'start')?.t ?? now();
  const entries = tailEntries(p.transcript_path, 600 * 1024);
  const done = new Set(ev.filter((e) => e.use).map((e) => e.use));
  const uses = new Map();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) if (b?.type === 'tool_use') uses.set(b.id, b);
  }
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c)) continue;
    const t = Date.parse(e.timestamp ?? '');
    if (!Number.isFinite(t) || t < start) continue;
    const agent = e.agentId || p.agent_id || 'main';
    for (const b of c) {
      if (b?.type !== 'tool_result' || done.has(b.tool_use_id)) continue;
      const u = uses.get(b.tool_use_id);
      if (!u) continue;
      const text = typeof b.content === 'string' ? b.content : Array.isArray(b.content) ? b.content.filter((x) => x?.type === 'text').map((x) => x.text).join('\n') : '';
      done.add(b.tool_use_id);
      if (b.is_error && !NOT_A_FAILURE.test(text) && !(u.name === 'Bash' && parseRead(String(u.input?.command ?? '')))) {
        const h = callHash(u.name, u.input);
        append(p, { kind: 'fail', use: b.tool_use_id, agent, tool: u.name, h, id: h.slice(0, 8), text: cap(text, 8000), t });
      }
      const q = { ...p, tool_name: u.name, tool_input: u.input };
      const a = analyze(q);
      if (!a.request || NOT_A_FAILURE.test(text)) continue;
      const mixed = mixedCapture(q);
      const said = u.name !== 'Bash' && !b.is_error ? (text.match(/^.*\breturned HTTP \d{3}\b.*$/m)?.[0] ?? '') : text;
      const ds = declinesIn(a.text, said, undefined, a.hosts, u.name !== 'Bash');
      for (const d of ds) append(p, { kind: 'decline', use: b.tool_use_id, agent, ...d, mixed, text: cap(text, 40000), t });
      if (!mixed && !b.is_error) for (const h of a.hosts) if (!ds.some((d) => site(d.host) === site(h))) append(p, { kind: 'answered', use: b.tool_use_id, host: site(h), t });
      append(p, { kind: 'seen', use: b.tool_use_id });
    }
  }
}

/**
 * Decide on one tool call (PreToolUse).
 * @param {object} p  the hook payload.
 * @returns {string | null} the refusal, or null to allow. A valid reading is
 *   recorded here, as a side effect, before it is allowed to run; hook-dispatch
 *   turns a refusal into exit 2 with it on stderr.
 */
export function decide(p) {
  const tool = String(p.tool_name ?? '');
  const agent = p.agent_id || 'main';
  if (!load(p).some((e) => e.kind === 'start')) append(p, { kind: 'start' });
  try { catchUp(p, load(p)); } catch { /* a transcript that cannot be read adds nothing */ }
  const ev = load(p);

  // ---- the ledger is written by this guard and nothing else ----
  if (['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(tool) && LEDGER_WORD.test(`${p.tool_input?.file_path ?? ''} ${p.tool_input?.notebook_path ?? ''}`)) {
    return 'reply-guard (LESSONS §374): the reply ledger is written by the guard alone. A reading is recorded with --read; an edited ledger is a reading invented.';
  }
  if (tool === 'Bash') {
    const c = String(p.tool_input?.command ?? '');
    // Only the simple commands that NAME the ledger are held to reading it,
    // and a redirect into it is a write whoever makes it: a replay of this
    // session found the whole-line version refusing `ls ~/.claude/reply-ledger`
    // beside an unrelated `rm` of scratch files.
    const names = (x) => (LEDGER_WORD.test(x) || x === 'reply-ledger') && !/\s/.test(x) && !/^REPLY_LEDGER_DIR=/.test(x);
    const segsL = commandsIn(heredocs(c).shell).filter((s) => s.words.some(names));
    if (segsL.length && !parseRead(c)) {
      const reader = (w) => { const at = commandWordIndex(w); const b = at >= 0 ? basename(w[at]) : ''; return /^(cat|grep|rg|ag|head|tail|wc|ls|jq|stat|cut|nl|less|more|file|du)$/.test(b) || (b === 'git' && /^(grep|log|show|diff|status|blame)$/.test(w[at + 1] ?? '')) || (b === 'find' && !w.some((x) => /^-(delete|exec|execdir|ok|okdir|fprint\w*|fls)$/.test(x))); };
      const intoLedger = (w) => w.some((x, i) => (/^\d*(<>|>>?)$/.test(x) && names(w[i + 1] ?? '')) || (/^\d*(<>|>>?)./.test(x) && !/^\d*>&/.test(x) && names(x.replace(/^\d*(<>|>>?)/, ''))));
      const readOnly = segsL.every((s) => reader(s.words) && !intoLedger(s.words) && !s.words.some((x) => /^(tee|-i|--in-place)$/.test(x)));
      if (!readOnly) return 'reply-guard (LESSONS §374): the reply ledger is written by the guard alone, and this command does more than read it. A reading is recorded with --read; an edited, emptied or deleted ledger is a reading invented.';
    }
  }

  if (tool === 'Bash') {
    const r = parseRead(String(p.tool_input?.command ?? ''));
    if (r) {
      if (r.bad) return `reply-guard (LESSONS §374): a reading is one plain command and nothing else — node ${SELF} --read <host|call:ID> --said "<words>" --route "<kind>: <how>". This one carries ${r.bad}. Choose words from the reply that hold no $ or backtick.`;
      const why = checkReading(r, ev);
      if (why) return why;
      append(p, { kind: 'read', agent, target: r.target.startsWith('call:') ? r.target : site(r.target), said: r.said, route: r.route });
      return null;
    }
  }

  // ---- the same failed call again, with nothing learned in between ----
  // A failed request whose failure was a host declining is governed by the
  // host rules below, which name the cause and its route; once those allow it
  // (the owner opened the host), the identical request is the right one.
  const h = callHash(tool, p.tool_input);
  let fi = -1;
  for (let i = ev.length - 1; i >= 0; i--) if (ev[i].kind === 'fail' && ev[i].agent === agent && ev[i].h === h) { fi = i; break; }
  if (fi >= 0 && ev[fi].use && ev.some((e) => e.kind === 'decline' && e.use === ev[fi].use)) fi = -1;
  if (fi >= 0) {
    const f = ev[fi];
    const read = ev.slice(fi + 1).some((e) => e.kind === 'read' && e.target === `call:${f.id}`);
    if (!read) {
      return `reply-guard (LESSONS §374): this is the ${tool} call that failed, unchanged, and its error has not been read. A repeat learns nothing the error did not already say.\n  The error:\n${indent(String(f.text).slice(0, 1500))}\nRead it and change the call. If the identical call is right now (the code it runs was edited, a dropped connection, a file that now exists), record why:\n  node ${SELF} --read call:${f.id} --said "<words copied from the error>" --route "<what is different now>"`;
    }
  }

  // ---- requests to a host that declined ----
  const a = analyze(p);
  if (!a.request) return null;
  const text = a.text;
  const cmd = tool === 'Bash' ? String(p.tool_input?.command ?? '') : '';
  const disguise = a.identity;
  for (const host of a.hosts) {
    const di = latestDecline(ev, host);
    if (di < 0) continue;
    if (ev.slice(di + 1).some((e) => e.kind === 'answered' && e.host === site(host))) continue;
    const d = ev[di];
    const declinedScript = ev.some((e) => e.kind === 'decline' && site(e.host) === site(host) && e.cause !== 'proxy');
    if (disguise && declinedScript) {
      return `reply-guard (LESSONS §374): ${host} declined a script, and this request ${disguise}. A request in another identity is a disguise, never a route — refused whatever the reading says.\n  What ${host} said:\n${indent(d.excerpt || String(d.text ?? '').slice(0, 1200))}\nAsk the way the reply allows: content negotiation with an honest Accept, its API or published policy, the authors' own copy, an open index, a later retry where it said temporarily, or the owner.`;
    }
    const reading = ev.slice(di + 1).filter((e) => e.kind === 'read' && e.target === site(host)).pop();
    if (!reading) {
      if (d.cause !== 'proxy' && tool === 'Bash' && readsInFull(cmd, host)) continue;
      return declineReason(host, d);
    }
    const kind = (reading.route.match(/^\s*([a-z-]+)/i)?.[1] ?? '').toLowerCase();
    if (kind === 'owner') {
      // The answer has to be about this host. Any owner message after the
      // refusal used to count, so a message adding one host answered for every
      // host refused before it — found on 2026-10-01, when a message opening
      // science.nasa.gov would have let helpx.adobe.com through unasked.
      const named = new RegExp(`(?<![a-z0-9.-])(?:www\\.)?${site(host).replace(/\./g, '\\.')}(?!\\.?[a-z0-9-])`, 'i');
      const said = p.transcript_path ? ownerMessagesSince(p.transcript_path, d.t) : [];
      if (!said.some((m) => named.test(m.text))) return `reply-guard (LESSONS §374): the recorded route for ${host} is the owner (${reading.route}), and no message from the owner has arrived since it declined that names ${site(host)}. Ask them, naming ${host}; this request waits for their answer.`;
      continue;
    }
    if (kind === 'later') {
      const ra = Number(d.headers?.['retry-after']);
      const wait = (Number.isFinite(ra) && ra > 0 ? ra : LATER_DEFAULT_S) * 1000;
      if (now() < d.t + wait) return `reply-guard (LESSONS §374): the recorded route for ${host} is a later retry, and ${Math.ceil((d.t + wait - now()) / 60000)} more minute(s) remain of the ${Math.round(wait / 60000)} it allows (Retry-After where the reply gave one, else ten minutes).`;
      continue;
    }
    if (kind === 'negotiate') {
      if (!/(?:-[A-Za-z]*H|--header)\s*=?\s*['"]?accept\s*:|["']accept["']\s*[:=,]|\baccept\s*[:=]\s*["']/i.test(text)) return `reply-guard (LESSONS §374): the recorded route for ${host} is content negotiation, and this request names no Accept. Say what it takes: -H 'Accept: text/html'.`;
      continue;
    }
    if (kind === 'author-copy' || kind === 'open-index') {
      return `reply-guard (LESSONS §374): the recorded route for ${host} goes elsewhere (${reading.route}). Asking ${host} again is the declined request again; to ask it a different way, record a reading with a route through it.`;
    }
  }
  return null;
}

/**
 * Record what a tool call returned (PostToolUse, PostToolUseFailure).
 * @param {object} p      the hook payload.
 * @param {string} event  the hook event.
 * @returns {string} a message to put in front of the session when a reply
 *   declined, '' otherwise; the caller exits 2 with it so it is read now.
 */
export function record(p, event) {
  const tool = String(p.tool_name ?? '');
  const agent = p.agent_id || 'main';
  const use = p.tool_use_id;
  let out = ''; let code;
  if (event === 'PostToolUseFailure') {
    if (p.is_interrupt) return '';
    out = String(p.error ?? '');
    if (!NOT_A_FAILURE.test(out) && !(tool === 'Bash' && parseRead(String(p.tool_input?.command ?? '')))) {
      const h = callHash(tool, p.tool_input);
      append(p, { kind: 'fail', use, agent, tool, h, id: h.slice(0, 8), text: cap(out, 8000) });
    }
  } else if (event === 'PostToolUse') {
    const r = p.tool_response;
    if (tool === 'Bash') out = [r?.stdout, r?.stderr].filter(Boolean).join('\n');
    else if (tool === 'WebFetch') {
      // A page the fetch tool answered is its summary of the page: it is not
      // parsed for statuses, or a page ABOUT a 406 records one. Only its own
      // "returned HTTP NNN" sentence and its response code are read.
      code = Number(r?.code) || undefined;
      const res = String(r?.result ?? r?.codeText ?? '');
      out = code && code < 400 ? '' : (res.match(/^.*\breturned HTTP \d{3}\b.*$/m)?.[0] ?? (code ? res : ''));
    }
  } else return '';
  const a = analyze(p);
  if (!a.request || NOT_A_FAILURE.test(out)) return '';
  const ds = declinesIn(a.text, out, code, a.hosts, tool !== 'Bash');
  const mixed = mixedCapture(p);
  for (const d of ds) append(p, { kind: 'decline', use, agent, ...d, mixed, text: cap(out, 40000) });
  // A lone request the host answered below 400 ends its refusal: a scope check
  // found a seeded refusal that a later honest 200 could never clear.
  if (!mixed && event === 'PostToolUse' && (tool !== 'Bash' || out)) for (const h of a.hosts) if (!ds.some((d) => site(d.host) === site(h))) append(p, { kind: 'answered', use, host: site(h) });
  append(p, { kind: 'seen', use });
  return ds.map((d) => d.cause === 'proxy'
    ? `reply-guard (LESSONS §374): this container refused ${d.host} — the host was never asked. Ask the owner to allow it, naming ${d.host}, then record that:\n  ${readCommand(d.host, d)}`
    : `reply-guard (LESSONS §374): ${d.host} declined — ${describe(d)}. Its words are in the output above. Read them before the next request to it:\n  ${readCommand(d.host, d)}`).join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const argv = process.argv.slice(2);
  if (argv[0] === '--seed') {
    // Declining replies met before the gate was running, from an extraction of
    // the session's transcripts (one JSON object per line: use, host, cause,
    // status, server, headers, result, ts). Only declines are ever added — a
    // seed can make the gate stricter and never lift it — and each once.
    const file = argv[1]; const sid = argv[argv.indexOf('--session') + 1];
    if (!file || argv.indexOf('--session') < 0 || !sid) { console.error('usage: reply-guard.mjs --seed <declines.jsonl> --session <session id>'); process.exit(1); }
    const p = { session_id: sid };
    const have = new Set(load(p).filter((e) => e.kind === 'decline' && e.use).map((e) => `${e.use} ${e.host}`));
    let n = 0;
    for (const l of readFileSync(file, 'utf8').split('\n')) {
      let d; try { d = JSON.parse(l); } catch { continue; }
      if (!d?.host || !d.use || have.has(`${d.use} ${d.host}`)) continue;
      append(p, { kind: 'decline', seeded: true, use: d.use, agent: 'seed', host: d.host, cause: d.cause, status: d.status ?? 0, server: d.server ?? '', headers: d.headers ?? {},
        evidence: d.evidence ?? [], excerpt: d.excerpt ?? '', mixed: !!d.mixed, text: cap(d.result, 40000), t: Date.parse(d.ts ?? '') || now() });
      have.add(`${d.use} ${d.host}`); n++;
    }
    console.log(`reply-guard: seeded ${n} declining replies into ${ledgerFile(p)}`);
    process.exit(0);
  }
  if (argv[0] === '--read') {
    // The PreToolUse check did the recording; this only reports whether a hook
    // actually did, so a session without the gate wired is told, not reassured.
    const dir = process.env.REPLY_LEDGER_DIR || join(homedir(), '.claude', 'reply-ledger');
    const target = String(argv[1] ?? '').toLowerCase();
    const want = target.startsWith('call:') ? target : site(target);
    let hit = null;
    try {
      const files = readdirSync(dir).map((f) => join(dir, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs).slice(0, 3);
      for (const f of files) {
        for (const l of readFileSync(f, 'utf8').trim().split('\n').reverse()) {
          let e; try { e = JSON.parse(l); } catch { continue; }
          if (e.kind === 'read' && e.target === want && now() - e.t < 120000) { hit = { ...e, file: basename(f) }; break; }
        }
        if (hit) break;
      }
    } catch { /* no ledger */ }
    if (hit) { console.log(`reply-guard: reading recorded for ${hit.target} in ${hit.file}; route: ${hit.route}`); process.exit(0); }
    console.error('reply-guard: no hook recorded this reading — the gate is not running in this session, so nothing was checked.');
    process.exit(1);
  }
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* none */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { process.exit(0); }
  if (argv[0] === '--record') {
    let msg = '';
    try { msg = record(p, argv[1] || p.hook_event_name || ''); } catch (e) { process.stderr.write(`reply-guard --record: ${e?.message ?? e}\n`); process.exit(1); }
    if (msg) { process.stderr.write(msg + '\n'); process.exit(2); }
    process.exit(0);
  }
  const why = decide(p);
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  process.exit(0);
}
