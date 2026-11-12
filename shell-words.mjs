#!/usr/bin/env node
/**
 * THE READING OF A SHELL LINE, kept on its own so the push guard stands on nothing a retirement removes.
 *
 * These functions are copied, unchanged, from reply-guard.mjs: `splitShell` breaks a Bash line into its simple commands, `commandWordIndex`
 * finds the program word of one, `heredocs` sorts a line's heredoc bodies by what reads them, `substitutionsIn` finds the `$( … )` and backtick
 * groups a shell runs, `openerName` says in words the character a command was opened at, and `commandsIn` opens every command a line runs,
 * wrappers and nested strings included. It imports nothing but node's own modules.
 */
import { basename } from 'node:path';

const CLIENT_WORD = /(^|[^A-Za-z0-9_-])(curl|wget2?|lynx|w3m|aria2c|httpie)([^A-Za-z0-9_-]|$)/;

/**
 * Split a shell command into its simple commands.
 * @param {string} cmd  a Bash command line.
 * @returns {{words: string[], op: string, opener: string}[]} each simple command's words with
 *   quoting removed, the operator that ends it (`|`, `&&`, `||`, `;`, `&`,
 *   a newline, or '' at the end), and `opener`: the operator that ended the command before it,
 *   which is the character the line opened this command at ('' for the first). Text in single or
 *   double quotes never opens one, whatever it holds. Redirections stay words (`>`, `2>&1`). It is
 *   approximate — no expansion, no nesting — and callers use it only to read a
 *   request's flags, never to decide that a command is harmless.
 */
export function splitShell(cmd) {
  const out = []; let words = []; let w = ''; let inWord = false; let opener = '';
  const push = () => { if (inWord) { words.push(w); w = ''; inWord = false; } };
  const end = (op) => { push(); out.push({ words, op, opener }); words = []; if (op) opener = op; };
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
 * The index of the parenthesis that closes a `$(` group.
 * @param {string} s  a command line.
 * @param {number} from  the index just after the `$(`.
 * @returns {number} the index of the matching `)`, counting nested parentheses and leaving the ones inside quotes alone; -1 when the
 *   group is never closed, which a shell would refuse as a syntax error and which therefore opens nothing here.
 */
function closeParen(s, from) {
  let depth = 1;
  let q = '';
  for (let i = from; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (q) { if (c === q) q = ''; continue; }
    if (c === "'" || c === '"') { q = c; continue; }
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i;
  }
  return -1;
}

/**
 * The command substitutions a shell runs for a command line.
 * @param {string} cmd  a Bash command line (heredoc bodies already sorted).
 * @returns {{body: string, opener: string}[]} each `$( … )` group and each backtick pair that the line opens, in the order they begin,
 *   `opener` being `$(` or the backtick, and `body` the text inside, which the caller opens as a command line of its own (a
 *   substitution inside a body is found when that is done). THE SHELL'S QUOTE RULE: text inside single quotes is one word and
 *   opens nothing; text inside double quotes opens a command only at a dollar sign followed by an opening parenthesis and at a
 *   backtick, as a shell does; unquoted text opens one at each. A single quote that is never closed is an ordinary character, so a
 *   stray apostrophe in prose cannot hide a substitution after it, and `$'…'` is read as the shell reads it, up to the closing
 *   quote that no backslash escapes. A group or a pair that is never closed opens nothing. The line `git commit -m 'a $(rm x) b'`
 *   opens nothing, where the whole-line scan this replaced opened `rm x` and the plan fence refused the commit message (Q-HUB-51).
 */
export function substitutionsIn(cmd) {
  const s = String(cmd ?? '');
  const out = [];
  let q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (c === '$' && s[i + 1] === "'" && !q) {
      let j = i + 2;
      while (j < s.length && s[j] !== "'") { if (s[j] === '\\') j++; j++; }
      if (j < s.length) i = j;
      continue;
    }
    if (c === "'" && !q) {
      const j = s.indexOf("'", i + 1);
      if (j >= 0) i = j;
      continue;
    }
    if (c === '"') { q = !q; continue; }
    if (c === '$' && s[i + 1] === '(') {
      const end = closeParen(s, i + 2);
      if (end >= 0) { out.push({ body: s.slice(i + 2, end), opener: '$(' }); i = end; }
      continue;
    }
    if (c === '`') {
      let j = i + 1;
      while (j < s.length && s[j] !== '`') { if (s[j] === '\\') j++; j++; }
      if (j < s.length) { out.push({ body: s.slice(i + 1, j), opener: '`' }); i = j; }
    }
  }
  return out;
}

// The words a refusal uses for the character a command was opened at (`opener` of a segment of `commandsIn`).
const OPENER_WORDS = { '|': 'a vertical bar', '||': 'a double vertical bar', '&&': 'a double ampersand', ';': 'a semicolon', '&': 'an ampersand',
  '\n': 'a new line', '$(': 'a dollar sign and an opening parenthesis', '`': 'a backtick' };

/**
 * The words for the character a command was opened at.
 * @param {string|undefined} opener  `opener` of a segment `commandsIn` gave: an operator, `$(` or a backtick.
 * @returns {string} a phrase such as "a vertical bar" or "a dollar sign and an opening parenthesis"; '' for the first command of a
 *   line, which no character opened, and for an opener this table does not know.
 */
export function openerName(opener) {
  return OPENER_WORDS[String(opener ?? '')] ?? '';
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
 * @returns {{words: string[], op: string, opener: string, depth: number, any: boolean}[]} as
 *   `splitShell` (`opener` is the character the command was opened at: an operator, `$(` or a backtick; `openerName` says it in
 *   words), plus the commands inside `$( … )` and backticks as a shell opens them (`substitutionsIn`: never inside single
 *   quotes, inside double quotes at a dollar-parenthesis and a backtick only), and every
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
  // `opener`: the character a substitution was opened at, put on the first command of what it opened (the rest carry their own).
  const openShell = (str, opener = '') => out.push(...commandsIn(str, depth + 1, any, sink).map((x) => (x.opener ? x : { ...x, opener })));
  // A program's text is opened as code, where only its calls are followed; what
  // a call runs is opened as a command line in which a client may stand
  // anywhere. Opening a whole program that way refused the guard's own tests,
  // which only hand `curl …` to decide() as a string.
  const openCode = (str) => { sink.code.push(str); out.push(...commandsIn(str, depth + 1, 'code', sink)); };
  const openArg = (str) => { sink.code.push(str); out.push(...commandsIn(str, depth + 1, true, sink)); };
  for (const sub of substitutionsIn(cmd)) openShell(sub.body, sub.opener);
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
