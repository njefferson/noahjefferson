#!/usr/bin/env node
/**
 * reply-guard.mjs, fed recorded payloads (LESSONS §374).
 *
 *   node reply-guard.test.mjs           every case against the guard; exit 1 on any failure
 *   node reply-guard.test.mjs --plants  MADE TO FAIL: for each refusal, a copy of the
 *                                       guard with that refusal taken out, and the case
 *                                       that guards it must then FAIL. Exit 1 if a
 *                                       planted copy passes the case meant to catch it.
 *
 * The payloads are shaped like the real ones: what the proxy, curl, a publisher and
 * the fetch tool printed in this family's sessions.
 */
import { mkdtempSync, writeFileSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const T0 = Date.parse('2026-10-01T12:00:00Z');

const MADE = [];
function fresh(at = T0) {
  process.env.REPLY_LEDGER_DIR = mkdtempSync(join(tmpdir(), 'reply-ledger-'));
  MADE.push(process.env.REPLY_LEDGER_DIR);
  process.env.REPLY_GUARD_NOW = String(at);
}
const at = (ms) => { process.env.REPLY_GUARD_NOW = String(ms); };
const bash = (command, extra = {}) => ({ session_id: 't', tool_name: 'Bash', tool_input: { command, description: 'x' }, ...extra });
const ran = (command, stdout, stderr = '') => ({ ...bash(command), tool_use_id: `u${Math.random()}`, tool_response: { stdout, stderr } });
const failed = (command, error) => ({ ...bash(command), tool_use_id: `u${Math.random()}`, error });
const fetchOf = (url) => ({ session_id: 't', tool_name: 'WebFetch', tool_input: { url, prompt: 'x' } });

const PIX = 'https://pixinsight.com/tutorials/multiscale-gradient-correction/';
const PIX_406 = [
  'HTTP/1.1 406 Not Acceptable', 'Date: Tue, 30 Sep 2026 20:00:00 GMT', 'Server: Apache', 'Content-Type: text/html; charset=iso-8859-1', '',
  '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">', '<html><head><title>406 Not Acceptable</title></head><body>',
  '<h1>Not Acceptable</h1>', '<p>An appropriate representation of the requested resource could not be found on this server.</p>', '</body></html>',
].join('\n');
const SD = 'https://www.sciencedirect.com/science/article/pii/S0038092X15000000';
const SD_403 = [
  'HTTP/2 403', 'server: cloudflare', 'tdm-reservation: 1', 'tdm-policy: https://www.elsevier.com/tdm/tdmrep-policy.json', 'content-type: text/html', '',
  '<html><body>There was a problem providing the content you requested. Please contact us via our support center.</body></html>',
].join('\n');
const RG = 'https://www.researchgate.net/publication/123_Cloud_detection';
const RG_403 = ['HTTP/2 403', 'server: cloudflare', '', '<html><title>Temporarily Unavailable</title><body>The page is temporarily unavailable, please try again later.</body></html>'].join('\n');

/** Each case: (g, self) → true when the guard behaved. `guards` names the plant it must catch. */
const CASES = [
  {
    name: 'a declining reply is recorded and put in front of the session',
    run(g) {
      fresh();
      const msg = g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const d = g.load({ session_id: 't' }).find((e) => e.kind === 'decline');
      return /pixinsight\.com declined/.test(msg) && d?.status === 406 && d.host === 'pixinsight.com';
    },
  },
  {
    name: 'a plain retry before the reply is read is refused',
    guards: ['unread', 'fullread'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const r1 = g.decide(bash(`curl -sS '${PIX}'`));
      const r2 = g.decide(fetchOf('https://www.pixinsight.com/tutorials/'));
      return /nothing on record says its reply was read/.test(r1 ?? '') && /An appropriate representation/.test(r1) && !!r2;
    },
  },
  {
    name: 'a disguised retry is refused as a disguise, before and after a reading',
    guards: ['disguise', 'disguise_flags', 'config_env', 'runtime_opts'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const before = g.decide(bash(`curl -sS -A 'Mozilla/5.0 (Windows NT 10.0) Firefox/131.0' '${PIX}'`));
      const ok = g.decide(bash(`node ${self} --read pixinsight.com --said "An appropriate representation of the requested resource could not be found" --route "negotiate: ask again with an honest Accept: text/html"`));
      const after = [
        g.decide(bash(`curl -sS -H 'Accept: text/html' -A 'Mozilla/5.0 Firefox/131.0' '${PIX}'`)),
        g.decide(bash(`curl -sS -H 'Accept: text/html' -H 'User-Agent: Mozilla/5.0' '${PIX}'`)),
        g.decide(bash(`curl -sS -H 'Accept: text/html' -H 'Sec-Fetch-Mode: navigate' '${PIX}'`)),
        g.decide(bash(`node -e "const {chromium}=require('playwright'); chromium.launch().then(b=>b.newPage().then(p=>p.goto('${PIX}')))"`)),
        g.decide(bash(`curl -sA 'research-bot/1.0' -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -sSA 'research-bot/1.0' -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -sSH 'User-Agent: research-bot/1.0' -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`wget -qU 'research-bot/1.0' --header='Accept: text/html' -O - '${PIX}'`)),
        g.decide(bash(`curl -sAresearch-bot -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -Abot/1.0 -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl --user-a bot -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -H 'Accept: text/html' -H'User-Agent: bot' '${PIX}'`)),
        g.decide(bash(`wget -qUbot --header='Accept: text/html' -O - '${PIX}'`)),
        g.decide(bash(`HOME=/tmp/h curl -sS -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`CURL_HOME=/tmp/h curl -sS -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -{s,A} bot -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl $'-A' bot -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl --expand-user-agent bot -H 'Accept: text/html' '${PIX}'`)),
        g.decide(bash(`curl -H 'Accept: text/html' -H "User-Age\\\nnt: bot" '${PIX}'`)),
        g.decide(bash(`google-chrome --headless --dump-dom '${PIX}'`)),
        g.decide(bash(`SYSTEM_WGETRC=/tmp/w wget -q --header='Accept: text/html' -O - '${PIX}'`)),
      ];
      return /disguise/.test(before ?? '') && ok === null && after.every((r) => /disguise/.test(r ?? ''));
    },
  },
  {
    name: 'a request inside a wrapper is still a request, and still in its own identity',
    guards: ['wrapper'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const unread = [
        `bash -c "curl -sS '${PIX}'"`, `sh -c 'curl -sS ${PIX}'`, `bash -lc "timeout 20 curl -sS '${PIX}'"`,
        `timeout 30 bash -c "curl -sS '${PIX}'"`, `exec bash -c "curl -sS '${PIX}'"`, `env LC_ALL=C sh -c "curl -sS '${PIX}'"`,
        `echo "curl -sS '${PIX}'" | bash`, `bash <<< "curl -sS '${PIX}'"`, `(curl -sS '${PIX}')`, `if curl -sS '${PIX}'; then echo; fi`,
        `python3 -c "import os; os.system('curl -sS ${PIX}')"`, `node -e "require('child_process').execSync('curl -sS ${PIX}')"`,
        `find . -maxdepth 0 -exec curl -sS '${PIX}' \\;`, `timeout -s KILL 20 curl -sS '${PIX}'`, `sudo -u nobody curl -sS '${PIX}'`,
      ].map((c) => g.decide(bash(c)));
      g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      const disguised = [
        `bash -c "curl -sA bot -H 'Accept: text/html' '${PIX}'"`, `sh -c "curl -sS -H 'Accept: text/html' -A bot ${PIX}"`,
        `C=curl; $C -sS -A bot -H 'Accept: text/html' '${PIX}'`, `CURL="curl -sS -A bot"; $CURL -H 'Accept: text/html' '${PIX}'`,
        `wget -e user_agent=bot --header='Accept: text/html' -O - '${PIX}'`, `curl -K cfg.txt -H 'Accept: text/html' '${PIX}'`,
        `curl -H @hdrs.txt -H 'Accept: text/html' '${PIX}'`, `P=User; curl -H 'Accept: text/html' -H "$P-Agent: bot" '${PIX}'`,
        `aria2c -U bot --header='Accept: text/html' '${PIX}'`,
      ].map((c) => g.decide(bash(c)));
      return unread.every((r) => /nothing on record/.test(r ?? '')) && disguised.every((r) => /disguise/.test(r ?? ''));
    },
  },
  {
    name: 'a host is matched without its scheme, and with a trailing dot',
    guards: ['schemeless', 'schemeless_tld'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return ['curl -sS pixinsight.com/tutorials/', 'curl -sS www.pixinsight.com/x', 'curl -sS --url pixinsight.com/x']
        .every((c) => /nothing on record/.test(g.decide(bash(c)) ?? ''))
        && /nothing on record/.test(g.decide(bash('curl -sS https://pixinsight.com./x')) ?? '')
        && (g.record(ran('curl -sS -i -o out.dt https://example-d.org/', 'HTTP/2 403\nserver: x\n\n<p>no</p>'), 'PostToolUse'), true)
        && !g.load({ session_id: 't' }).some((e) => e.kind === 'decline' && e.host === 'out.dt');
    },
  },
  {
    name: 'a reading is one plain command: nothing it carries is run',
    guards: ['strictread'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const said = 'could not be found on this server';
      const forms = [
        `node ${self} --read pixinsight.com --said "${said}" --route "api: use the site API $(curl -sS -A bot '${PIX}')"`,
        `node ${self} --read pixinsight.com --said "${said}" --route "api: use the site API \`curl -sS '${PIX}'\`"`,
        `node ${self} --read pixinsight.com --said "${said}" --route "api: use the site API" <(curl -sS '${PIX}')`,
        `node ${self} --read pixinsight.com --said "${said}" --route "api: use the site API" > /tmp/x`,
        `node ${self} --read pixinsight.com --said "${said}" --route "api: use the site API"; curl -sS '${PIX}'`,
      ];
      const refused = forms.every((c) => /one plain command/.test(g.decide(bash(c)) ?? ''));
      return refused && !g.load({ session_id: 't' }).some((e) => e.kind === 'read');
    },
  },
  {
    name: 'the ledger is written by the guard alone',
    guards: ['ledger_write', 'ledger_bash'],
    run(g) {
      fresh();
      return /written by the guard alone/.test(g.decide({ session_id: 't', tool_name: 'Write', tool_input: { file_path: '/root/.claude/reply-ledger/t.jsonl', content: '{}' } }) ?? '')
        && /written by the guard alone/.test(g.decide(bash(`echo '{"kind":"read"}' >> ~/.claude/reply-ledger/t.jsonl`)) ?? '')
        && /written by the guard alone/.test(g.decide(bash('rm -rf /root/.claude/reply-ledger')) ?? '')
        && /written by the guard alone/.test(g.decide(bash('sort -o ~/.claude/reply-ledger/t.jsonl /dev/null')) ?? '')
        && /written by the guard alone/.test(g.decide(bash('uniq /dev/null ~/.claude/reply-ledger/t.jsonl')) ?? '')
        && /written by the guard alone/.test(g.decide(bash('cd ~/.claude && rm -rf reply-ledger')) ?? '')
        && g.decide(bash('tail -5 ~/.claude/reply-ledger/t.jsonl')) === null;
    },
  },
  {
    name: 'ordinary work that only mentions a declined host, a client or the ledger is not refused',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const d = mkdtempSync(join(tmpdir(), 'reply-notes-')); MADE.push(d);
      writeFileSync(join(d, 'notes.md'), `read with curl -sS -i ${PIX}\n`);
      writeFileSync(join(d, 'tool.mjs'), 'console.log(1)\n');
      return [
        `git commit -m "Fixed curl 406 on ${PIX}"`, `sed -i "s/curl pixinsight.com/curl -i pixinsight.com/" ${join(d, 'notes.md')}`,
        'git commit -m "the reply-ledger is written by the guard"', `echo 'see ${PIX}'; which curl`, 'npm test', 'git status',
        `node ${join(d, 'tool.mjs')} ${join(d, 'notes.md')}`, 'man curl',
      ].every((c) => g.decide({ ...bash(c), cwd: d }) === null)
        && g.decide({ session_id: 't', tool_name: 'Edit', tool_input: { file_path: join(d, 'x.mjs'), old_string: 'a', new_string: 'the reply-ledger file' } }) === null;
    },
  },
  {
    name: 'a page that answered 200 is not a refusal, whatever it is about',
    run(g) {
      fresh();
      g.record(ran('curl -sS -i https://en.wikipedia.org/wiki/CAPTCHA', 'HTTP/2 200\ncontent-type: text/html\n\n<p>A CAPTCHA is a captcha challenge. Request blocked. Just a moment</p>'), 'PostToolUse');
      g.record({ ...fetchOf('https://developers.cloudflare.com/waf/'), tool_use_id: 'w2', tool_response: { code: 200, result: 'The page explains captcha challenges and Attention Required! | Cloudflare pages.' } }, 'PostToolUse');
      return !g.load({ session_id: 't' }).some((e) => e.kind === 'decline');
    },
  },
  {
    name: 'a refusal quoted in the transcript is not a new decline; an interrupt is not a failure',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const tx = join(process.env.REPLY_LEDGER_DIR, 'transcript.jsonl');
      g.decide({ ...bash('true'), transcript_path: tx });
      const before = g.load({ session_id: 't' }).filter((e) => e.kind === 'decline').length;
      writeFileSync(tx, [
        { type: 'assistant', timestamp: new Date(T0 + 1000).toISOString(), message: { content: [{ type: 'tool_use', id: 'r1', name: 'Bash', input: { command: `curl -sS -A bot '${PIX}'` } }] } },
        { type: 'user', timestamp: new Date(T0 + 2000).toISOString(), message: { content: [{ type: 'tool_result', tool_use_id: 'r1', is_error: true, content: 'PreToolUse:Bash hook error: reply-guard: HTTP/1.1 403 Forbidden\nRequest blocked. Just a moment' }] } },
      ].map((x) => JSON.stringify(x)).join('\n') + '\n');
      at(T0 + 3000);
      g.decide({ ...bash('true'), transcript_path: tx });
      const after = g.load({ session_id: 't' }).filter((e) => e.kind === 'decline').length;
      g.record({ ...failed('npm run build', 'Exit code 130'), is_interrupt: true }, 'PostToolUseFailure');
      g.record(failed('npm run walk', '[Request interrupted by user for tool use]'), 'PostToolUseFailure');
      return before === after && g.decide(bash('npm run build')) === null && g.decide(bash('npm run walk')) === null;
    },
  },
  {
    name: 'a reply captured among other output is read on its own before a reading counts',
    guards: ['mixed'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'; echo 'these are words chosen by the session'`, `${PIX_406}\nthese are words chosen by the session`), 'PostToolUse');
      const read = (said) => g.decide(bash(`node ${self} --read pixinsight.com --said "${said}" --route "negotiate: ask again with an honest Accept: text/html"`));
      const chosen = read('these are words chosen by the session');
      const real = read('could not be found on this server');
      const full = g.decide(bash(`curl -sS -i '${PIX}'`));
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return /among other output/.test(chosen ?? '') && /among other output/.test(real ?? '') && full === null && read('could not be found on this server') === null;
    },
  },
  {
    name: 'a reading run by a program merely named node is not a reading',
    guards: ['node_literal'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      g.decide(bash(`/tmp/x/node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      return !g.load({ session_id: 't' }).some((e) => e.kind === 'read');
    },
  },
  {
    name: 'a browser tool asked for a declined host drives a browser',
    guards: ['browser_tool'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const nav = { session_id: 't', tool_name: 'mcp__Claude_Browser__navigate', tool_input: { url: PIX } };
      const before = g.decide(nav);
      g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      const bare = { session_id: 't', tool_name: 'mcp__claude-in-chrome__navigate', tool_input: { url: 'pixinsight.com/tutorials/multiscale-gradient-correction/' } };
      return /disguise/.test(before ?? '') && /disguise/.test(g.decide(nav) ?? '') && /disguise/.test(g.decide(bare) ?? '');
    },
  },
  {
    name: 'a script run by path is read for its requests',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const d = mkdtempSync(join(tmpdir(), 'reply-script-')); MADE.push(d);
      const f = join(d, 'fetchit');
      writeFileSync(f, `#!/bin/sh\ncurl -sS '${PIX}'\n`);
      return /nothing on record/.test(g.decide(bash(f)) ?? '') && /nothing on record/.test(g.decide(bash(`. ${f}`)) ?? '');
    },
  },
  {
    name: 'a client configuration file that sets a user-agent is a disguise',
    guards: ['rc'],
    run(g, self) {
      fresh();
      const home = process.env.HOME;
      process.env.HOME = process.env.REPLY_LEDGER_DIR;
      try {
        g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
        g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
        const clean = g.decide(bash(`curl -sS -H 'Accept: text/html' '${PIX}'`));
        writeFileSync(join(process.env.HOME, '.curlrc'), 'user-agent = "research-bot/1.0"\n');
        const rc = g.decide(bash(`curl -sS -H 'Accept: text/html' '${PIX}'`));
        return clean === null && /curlrc sets a user-agent/.test(rc ?? '');
      } finally { process.env.HOME = home; }
    },
  },
  {
    name: 'an error of a few words is read by quoting all of it',
    run(g, self) {
      fresh();
      g.record(failed('test -f /tmp/build-done', 'Exit code 1'), 'PostToolUseFailure');
      const id = g.load({ session_id: 't' }).find((e) => e.kind === 'fail').id;
      return g.decide(bash('test -f /tmp/build-done')) !== null
        && g.decide(bash(`node ${self} --read call:${id} --said "Exit code 1" --route "the build writes the file when it finishes"`)) === null
        && g.decide(bash('test -f /tmp/build-done')) === null;
    },
  },
  {
    name: 'eval, nohup and exec do not hide a request',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return [`eval "curl -sS '${PIX}'"`, `nohup curl -sS '${PIX}' &`, `exec curl -sS '${PIX}'`, `echo "$(curl -sS '${PIX}')"`]
        .every((c) => /nothing on record/.test(g.decide(bash(c)) ?? ''));
    },
  },
  {
    name: 'reading the reply in full as itself is allowed; a cut-down or disguised read is not',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -o /dev/null -w '%{http_code}' '${PIX}'`, '406'), 'PostToolUse');
      return g.decide(bash(`curl -sS -i -H 'Accept: text/html' '${PIX}'`)) === null
        && g.decide(bash(`curl -sSi '${PIX}' | head -c 30000`)) === null
        && g.decide(bash(`curl -sS -D - '${PIX}'`)) === null
        && g.decide(bash(`curl -sS -i '${PIX}' | grep -i title`)) !== null
        && g.decide(bash(`curl -sS -i -o /dev/null '${PIX}'`)) !== null
        && g.decide(bash(`curl -sS -I '${PIX}'`)) !== null
        && g.decide(bash(`curl -fsSi '${PIX}'`)) !== null
        && g.decide(bash(`curl -sS -i '${PIX}' | head -5`)) !== null
        && g.decide(bash(`curl -sS -i '${PIX}' > /tmp/x.html`)) !== null
        && g.decide(bash(`curl -sS -i --user-a bot '${PIX}'`)) !== null;
    },
  },
  {
    name: 'a reading whose words are not in the reply is refused; the status line and curl\'s own words do not count',
    guards: ['said'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, `${PIX_406}\ncurl: (22) The requested URL returned error: 406`), 'PostToolUse');
      const read = (said) => g.decide(bash(`node ${self} --read pixinsight.com --said "${said}" --route "negotiate: ask again with an honest Accept: text/html"`));
      return read('the server refuses all automated clients outright') !== null
        && read('HTTP/1.1 406 Not Acceptable') !== null
        && read('The requested URL returned error: 406') !== null
        && read('an appropriate representation of the requested resource') === null;
    },
  },
  {
    name: 'a route the reply does not allow is refused; the routes it does allow are recorded',
    guards: ['route'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${SD}'`, SD_403), 'PostToolUse');
      const read = (route) => g.decide(bash(`node ${self} --read www.sciencedirect.com --said "There was a problem providing the content you requested" --route "${route}"`));
      return read('negotiate: ask again with Accept: text/html') !== null
        && read('later: try again in an hour or so') !== null
        && read('maybe: whatever works best') !== null
        && read('tdm: read the policy at elsevier.com/tdm/tdmrep-policy.json') === null
        && g.decide(bash(`curl -sS -i '${SD}'`)) === null;
    },
  },
  {
    name: 'after a negotiate reading, a request must carry its Accept, however it is spelled',
    guards: ['negotiate_accept'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      return g.decide(bash(`curl -sS '${PIX}'`)) !== null && g.decide(bash(`curl -sS -H 'Accept: text/html' '${PIX}'`)) === null
        && g.decide(bash(`curl -sSH 'Accept: text/html' '${PIX}'`)) === null
        && g.decide(bash(`curl -sS -H 'Accept: text/html' -oArticle.html '${PIX}'`)) === null;
    },
  },
  {
    name: 'a container-network refusal routes only to the owner, and waits for the owner',
    guards: ['proxy', 'owner_wait'],
    run(g, self) {
      fresh();
      const url = 'https://bugzilla.mozilla.org/show_bug.cgi?id=1';
      g.record(ran(`curl -sS '${url}'`, '', 'curl: (56) CONNECT tunnel failed, response 403'), 'PostToolUse');
      const fullRead = g.decide(bash(`curl -sS -i '${url}'`));
      const api = g.decide(bash(`node ${self} --read bugzilla.mozilla.org --said "CONNECT tunnel failed, response 403" --route "api: use the bug tracker's REST API"`));
      const owner = g.decide(bash(`node ${self} --read bugzilla.mozilla.org --said "CONNECT tunnel failed, response 403" --route "owner: asked to allow bugzilla.mozilla.org"`));
      const waiting = g.decide(bash(`curl -sS '${url}'`));
      const tx = join(process.env.REPLY_LEDGER_DIR, 'transcript.jsonl');
      writeFileSync(tx, JSON.stringify({ type: 'user', message: { role: 'user', content: 'allowed it' }, timestamp: new Date(T0 + 60000).toISOString() }) + '\n');
      at(T0 + 120000);
      const answered = g.decide(bash(`curl -sS '${url}'`, { transcript_path: tx }));
      return /never asked|before the request left/.test(fullRead ?? '') && /only route is the owner/.test(api ?? '') && owner === null
        && /no message from the owner/.test(waiting ?? '') && answered === null;
    },
  },
  {
    name: 'the fetch tool\'s proxy refusal is recorded from its error',
    run(g) {
      fresh();
      const url = 'https://chromium.googlesource.com/chromium/src/+/main/x.md';
      g.record({ ...fetchOf(url), tool_use_id: 'w1', error: 'Error: {"error_type":"EGRESS_BLOCKED","domain":"chromium.googlesource.com","message":"Access to chromium.googlesource.com is blocked by the network egress proxy."}' }, 'PostToolUseFailure');
      return /before the request left/.test(g.decide(fetchOf(url)) ?? '');
    },
  },
  {
    name: 'a later route waits for Retry-After or ten minutes, and only where the reply said temporarily or to try again later',
    guards: ['later_wait', 'later_words'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${RG}'`, RG_403), 'PostToolUse');
      const ok = g.decide(bash(`node ${self} --read www.researchgate.net --said "The page is temporarily unavailable, please try again later" --route "later: retry once after the wait it asks for"`));
      const soon = g.decide(bash(`curl -sS -i '${RG}'`));
      at(T0 + 11 * 60000);
      const later = g.decide(bash(`curl -sS -i '${RG}'`));
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const wrong = g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "later: retry once after the wait it asks for"`));
      fresh();
      g.record(ran("curl -sS -i 'https://journals.example-f.org/view/x.xml'", 'HTTP/2 403\nserver: CloudFront\n\n<H2>The request could not be satisfied.</H2>\nRequest blocked.\nWe can\'t connect to the server for this app or website at this time. There might be too much traffic or a configuration error. Try again later, or contact the app or website owner.'), 'PostToolUse');
      const tryLater = g.decide(bash(`node ${self} --read journals.example-f.org --said "There might be too much traffic or a configuration error. Try again later" --route "later: the reply says to try again later"`));
      return ok === null && /more minute/.test(soon ?? '') && later === null && /temporarily/.test(wrong ?? '') && tryLater === null;
    },
  },
  {
    name: 'a port is not a status, and program text is not a list of hosts',
    guards: ['port', 'tlds'],
    run(g) {
      fresh();
      g.record(ran(`for h in example-a.org example-b.org; do echo "$h $(curl -s -o /dev/null -w '%{http_code}' https://$h/)"; done; node -e "const keys = Object.keys(x); console.log(keys.join(','), JSON.parse('1'))"`,
        'example-a.org 200\nexample-b.org 200\n[agent-proxy] While this command ran, 1 connection through the agent proxy failed:\n- www.google.com:443 — connect_rejected (the egress proxy denied the CONNECT)'), 'PostToolUse');
      // A bare status names no host, so it is laid on every host the request
      // names — which must not include words out of the program text.
      g.record(ran(`for h in example-c.org; do curl -s -o /dev/null -w '%{http_code}' https://$h/; done; node -e "console.log(keys.join(','), JSON.parse('1'))"`, '403'), 'PostToolUse');
      const ev = g.load({ session_id: 't' }).filter((e) => e.kind === 'decline');
      return ev.length === 2 && ev.some((e) => e.host === 'www.google.com' && e.cause === 'proxy') && ev.some((e) => e.host === 'example-c.org' && e.status === 403)
        && !ev.some((e) => e.status === 443);
    },
  },
  {
    name: 'a URL held in a variable is still asked of, from the line or a file fed in',
    guards: ['from_variable'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const d = mkdtempSync(join(tmpdir(), 'reply-urls-')); MADE.push(d);
      writeFileSync(join(d, 'urls.txt'), `pix ${PIX}\n`);
      return [
        `for u in "${PIX}"; do curl -sS "$u"; done`,
        `cat > u.txt <<'EOF'\npix ${PIX}\nEOF\nwhile read n u; do curl -sS "$u"; done < u.txt`,
        `while read n u; do curl -sS "$u"; done < ${join(d, 'urls.txt')}`,
      ].every((c) => /nothing on record/.test(g.decide({ ...bash(c), cwd: d }) ?? ''));
    },
  },
  {
    name: "the fetch tool's own words for a status are a status",
    guards: ['returned_http'],
    run(g) {
      fresh();
      const url = 'https://www.researchgate.net/publication/1_x';
      g.record({ ...fetchOf(url), tool_use_id: 'w3', tool_response: { result: 'The server returned HTTP 403 Forbidden.\n\nThe response body was not retrieved.' } }, 'PostToolUse');
      return g.load({ session_id: 't' }).some((e) => e.kind === 'decline' && e.status === 403 && e.host === 'www.researchgate.net');
    },
  },
  {
    name: 'every status at 400 and above is recorded, a 404 included',
    run(g) {
      fresh();
      g.record(ran('curl -sS -i https://example-c.org/gone', 'HTTP/2 404\ncontent-type: text/html\n\n<p>There is no page at this address any more.</p>'), 'PostToolUse');
      return g.load({ session_id: 't' }).some((e) => e.kind === 'decline' && e.status === 404) && g.decide(bash('curl -sS https://example-c.org/gone')) !== null;
    },
  },
  {
    name: 'a status printed by -w is laid on its own host, not on its neighbour',
    run(g) {
      fresh();
      g.record(ran(`for h in example-a.org example-b.org; do echo "$h $(curl -s -o /dev/null -w '%{http_code}' https://$h/)"; done`, 'example-a.org 200\nexample-b.org 403'), 'PostToolUse');
      return g.decide(bash('curl -sS https://example-a.org/')) === null && g.decide(bash('curl -sS https://example-b.org/')) !== null;
    },
  },
  {
    name: 'the same failed call again is refused until its error is read, an edit since included',
    guards: ['repeat', 'callsaid'],
    run(g, self) {
      fresh();
      const cmd = 'ls /nonexistent-dir';
      g.record(failed(cmd, "Exit code 2\nls: cannot access '/nonexistent-dir': No such file or directory"), 'PostToolUseFailure');
      const again = g.decide(bash(cmd));
      const relabelled = g.decide({ ...bash(cmd), tool_input: { command: cmd, description: 'try once more' } });
      const id = g.load({ session_id: 't' }).find((e) => e.kind === 'fail').id;
      const badRead = g.decide(bash(`node ${self} --read call:${id} --said "permission denied on the directory" --route "the directory exists now"`));
      const read = g.decide(bash(`node ${self} --read call:${id} --said "cannot access '/nonexistent-dir': No such file" --route "the directory was created by the build since"`));
      const after = g.decide(bash(cmd));
      fresh();
      g.record(failed(cmd, "Exit code 2\nls: cannot access '/nonexistent-dir': No such file or directory"), 'PostToolUseFailure');
      g.record({ session_id: 't', tool_name: 'Edit', tool_input: {}, tool_use_id: 'e1' }, 'PostToolUse');
      const afterWrite = g.decide(bash(cmd));
      return /failed, unchanged/.test(again ?? '') && !!relabelled && !!badRead && read === null && after === null && /failed, unchanged/.test(afterWrite ?? '');
    },
  },
  {
    name: 'a hook\'s refusal is not a failed call; a failure in the transcript is caught up',
    run(g) {
      fresh();
      const tx = join(process.env.REPLY_LEDGER_DIR, 'transcript.jsonl');
      g.decide({ ...bash('true'), transcript_path: tx });
      const use = (id, command) => ({ type: 'assistant', timestamp: new Date(T0 + 1000).toISOString(), message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }] } });
      const res = (id, text) => ({ type: 'user', timestamp: new Date(T0 + 2000).toISOString(), message: { content: [{ type: 'tool_result', tool_use_id: id, is_error: true, content: text }] } });
      writeFileSync(tx, [
        use('a', 'cat /missing-file'), res('a', 'Exit code 1\ncat: /missing-file: No such file or directory'),
        use('b', 'echo refused'), res('b', 'PreToolUse:Bash hook error: [node "/root/.claude/hub/hook-dispatch.mjs" PreToolUse]: 5 minutes since the owner last got a status.'),
      ].map((x) => JSON.stringify(x)).join('\n') + '\n');
      at(T0 + 3000);
      return /failed, unchanged/.test(g.decide({ ...bash('cat /missing-file'), transcript_path: tx }) ?? '')
        && g.decide({ ...bash('echo refused'), transcript_path: tx }) === null;
    },
  },
  {
    name: 'a heredoc is data unless a shell or an interpreter reads it',
    guards: ['heredoc_data'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const allowed = [
        `git commit -m "$(cat <<'EOF'\nFixed: read with curl -sS -i -H 'Accept: text/html' ${PIX}\nEOF\n)"`,
        `git commit -F - <<'EOF'\nNotes: curl -sS ${PIX} answered 406\nEOF`,
        `cat >> notes.md <<'EOF'\n  curl -sS -A 'Mozilla/5.0 (Windows NT 10.0) Firefox/131.0' ${PIX}\nEOF`,
      ].every((c) => g.decide(bash(c)) === null);
      const shellRead = /nothing on record/.test(g.decide(bash(`bash <<'EOF'\ncurl -sS '${PIX}'\nEOF`)) ?? '');
      const programRead = /nothing on record/.test(g.decide(bash(`python3 - <<'EOF'\nimport urllib.request\nurllib.request.urlopen('${PIX}')\nEOF`)) ?? '');
      return allowed && shellRead && programRead;
    },
  },
  {
    name: 'a client counts only where a command runs it',
    guards: ['command_position'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      g.record(ran(`curl -sS -i '${SD}'`, SD_403), 'PostToolUse');
      return g.decide(bash('grep -rn -e curl -e pixinsight.com --include=*.md .')) === null
        && g.decide(bash('rg -n -e curl -e www.sciencedirect.com')) === null
        && /nothing on record/.test(g.decide(bash('timeout -s KILL 20 curl -sS pixinsight.com/x')) ?? '');
    },
  },
  {
    name: 'in program text a host comes only from a request call, never a comment or a table',
    guards: ['program_hosts', 'comments'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const d = mkdtempSync(join(tmpdir(), 'reply-prog-')); MADE.push(d);
      const w = (n, t) => { writeFileSync(join(d, n), t); return join(d, n); };
      const harness = w('harness.mjs', `import { chromium } from 'playwright-core';\n// was: await page.goto('${PIX}')\nconst b = await chromium.launch(); const p = await b.newPage();\nawait p.goto('http://localhost:5173/ir.html');\nawait b.close();\n`);
      const smoke = w('fetchtest.mjs', `// Not pixinsight.com, which declined curl\nconst notes = { source: '${PIX}' };\nconst port = 5173;\nawait fetch(\`http://localhost:\${port}/\`);\nconsole.log(notes);\n`);
      const audit = w('audit2.mjs', `// never curl -A\nconst entries = [{ url: '${PIX}' }];\nconst pat = /User-Agent:/;\nconsole.log(entries.length, pat);\n`);
      const real = w('real.mjs', `await fetch('${PIX}');\n`);
      const allowed = [`node ${harness}`, `node ${smoke}`, `node ${audit}`,
        `python3 - <<'EOF'\nimport pathlib, urllib.parse\nu = urllib.parse.urlsplit('${PIX}')\nprint(u.netloc)\nEOF`].every((c) => g.decide(bash(c)) === null);
      const refused = /nothing on record/.test(g.decide(bash(`node ${real}`)) ?? '');
      g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      const driven = w('driven.mjs', `import { chromium } from 'playwright-core';\nconst b = await chromium.launch(); const p = await b.newPage();\nawait p.goto('${PIX}');\n`);
      return allowed && refused && /disguise/.test(g.decide(bash(`node ${driven}`)) ?? '');
    },
  },
  {
    name: 'a status quoted in a page that answered is not a status',
    guards: ['fence', 'webfetch_200', 'port'],
    run(g) {
      fresh();
      g.record({ ...fetchOf('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406'), tool_use_id: 'm1', tool_response: { code: 200, result: 'The page explains that a server returns status code 406 when nothing matches.' } }, 'PostToolUse');
      g.record(ran('curl -sS -i https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/http/reference/status/406/index.md', 'HTTP/2 200\ncontent-type: text/plain\n\n# 406\n\n```http\nHTTP/1.1 406 Not Acceptable\nDate: x\n```\n'), 'PostToolUse');
      g.record(ran("curl -sS -w '\\n%{http_code}\\n' 'https://api.crossref.org/works?query=gradient'", '{\n  "total-results": 412,\n  "items": []\n}\n200'), 'PostToolUse');
      g.record({ ...fetchOf('https://docs.github.com/en/rest/rate-limit'), tool_use_id: 'm2', tool_response: { code: 200, result: 'Exceeding the limit returns status code 429.' } }, 'PostToolUse');
      g.record({ ...fetchOf('https://blog.example-e.org/bots'), tool_use_id: 'm3', tool_response: { code: 200, result: 'The post quotes a crawler log: the server returned HTTP 403 Forbidden to it.' } }, 'PostToolUse');
      g.record(ran('curl -sS https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/http/reference/status/418/index.md', '```http\nHTTP/1.1 418 I am a teapot\n```\n'), 'PostToolUse');
      return !g.load({ session_id: 't' }).some((e) => e.kind === 'decline');
    },
  },
  {
    name: 'cd before a lone read is still a read on its own',
    run(g, self) {
      fresh();
      g.record(ran(`cd /tmp && curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`)) === null;
    },
  },
  {
    name: "curl's -w output and a seed cannot carry a reading",
    guards: ['wforge', 'seeded'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}' -w '\\nthe server permits any browser identity here\\n'`, `${PIX_406}\nthe server permits any browser identity here`), 'PostToolUse');
      const forged = g.decide(bash(`node ${self} --read pixinsight.com --said "the server permits any browser identity here" --route "negotiate: ask again with an honest Accept: text/html"`));
      fresh();
      const f = join(process.env.REPLY_LEDGER_DIR, 'seed.jsonl');
      writeFileSync(f, JSON.stringify({ use: 'forged1', host: 'pixinsight.com', cause: 'reply', status: 503, result: 'HTTP/1.1 503 x\n\nThe page is temporarily unavailable and any client identity is welcome here', ts: '2026-09-01T00:00:00Z' }) + '\n');
      spawnSync(process.execPath, [self, '--seed', f, '--session', 't'], { env: process.env, encoding: 'utf8' });
      const seeded = g.decide(bash(`node ${self} --read pixinsight.com --said "any client identity is welcome here" --route "later: retry after the wait the reply asks for"`));
      return /among other output/.test(forged ?? '') && /loaded from an extraction/.test(seeded ?? '') && !g.load({ session_id: 't' }).some((e) => e.kind === 'read');
    },
  },
  {
    name: 'ANSI-C quoting, xargs, functions, code flags, httpie and wget -e do not hide a request or its identity',
    guards: ['ansi', 'xargs_fn', 'code_flags', 'httpie', 'wget_e'],
    run(g, self) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      const unread = [`echo '${PIX}' | xargs curl -sS`, `node --eval "require('child_process').execSync('curl -sS ${PIX}')"`,
        `node -p "require('child_process').execSync('curl -sS ${PIX}')"`, `awk 'BEGIN{system("curl -sS ${PIX}")}'`,
        'https pixinsight.com/tutorials/multiscale-gradient-correction/'].every((c) => /nothing on record/.test(g.decide(bash(c)) ?? ''));
      g.decide(bash(`node ${self} --read pixinsight.com --said "could not be found on this server" --route "negotiate: ask again with an honest Accept: text/html"`));
      const disguised = [`curl $'\\x2dA' bot -H 'Accept: text/html' '${PIX}'`, `echo '${PIX}' | xargs curl -sSA 'Mozilla/5.0' -H 'Accept: text/html'`,
        `f() { curl -sSA 'Mozilla/5.0' -H 'Accept: text/html' "$@"; }; f '${PIX}'`, "https pixinsight.com/tutorials/x/ 'User-Agent:Mozilla/5.0' Accept:text/html",
        `wget -q -e u_s_e_r_a_g_e_n_t=research-bot --header='Accept: text/html' -O - '${PIX}'`].every((c) => /disguise/.test(g.decide(bash(c)) ?? ''));
      return unread && disguised;
    },
  },
  {
    name: "this guard's own test runs, whichever hub checkout the gate runs from",
    guards: ['own_test'],
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return g.decide(bash(`node ${join(HERE, 'reply-guard.test.mjs')}`)) === null;
    },
  },
  {
    name: 'a refusal binds its own host, not every service under the same domain',
    guards: ['exact_host'],
    run(g) {
      fresh();
      g.record(ran("curl -sS -w '%{http_code}' -o /dev/null https://patents.google.com/patent/US1", '503'), 'PostToolUse');
      return g.decide(bash('curl -sS https://drive.usercontent.google.com/download?id=x')) === null
        && /nothing on record/.test(g.decide(bash('curl -sS https://patents.google.com/patent/US2')) ?? '');
    },
  },
  {
    name: 'a line that only lists the ledger beside other work is not refused; a redirect into it is',
    guards: ['ledger_segments'],
    run(g) {
      fresh();
      return g.decide(bash('ls ~/.claude/reply-ledger 2>&1 | head; rm -rf /tmp/scratch-x; git -C /root/.claude/hub log --oneline -2')) === null
        && /written by the guard alone/.test(g.decide(bash('cat x.jsonl >> ~/.claude/reply-ledger/t.jsonl')) ?? '')
        && /written by the guard alone/.test(g.decide(bash('D=~/.claude/reply-ledger; rm -rf $D')) ?? '');
    },
  },
  {
    name: 'a reply of a few words is read by quoting all of it',
    guards: ['short_reply'],
    run(g, self) {
      fresh();
      g.record(ran('curl -sS -i https://raw.githubusercontent.com/x/y/main/z.md', 'HTTP/2 404\ncontent-type: text/plain\n\n404: Not Found'), 'PostToolUse');
      return g.decide(bash(`node ${self} --read raw.githubusercontent.com --said "404: Not Found" --route "api: list the repository's tree for the right path"`)) === null;
    },
  },
  {
    name: 'a seed adds declines met before the gate ran, and only declines',
    guards: ['seed'],
    run(g, self) {
      fresh();
      const f = join(process.env.REPLY_LEDGER_DIR, 'seed.jsonl');
      writeFileSync(f, [
        JSON.stringify({ use: 'old1', host: 'pixinsight.com', cause: 'reply', status: 406, server: 'Apache', headers: {}, result: PIX_406, ts: new Date(T0 - 3600000).toISOString() }),
        JSON.stringify({ kind: 'read', use: 'old2', target: 'pixinsight.com', route: 'api: smuggled' }),
      ].join('\n') + '\n');
      const r = spawnSync(process.execPath, [self, '--seed', f, '--session', 't'], { env: process.env, encoding: 'utf8' });
      const ev = g.load({ session_id: 't' });
      return r.status === 0 && ev.filter((e) => e.kind === 'decline').length === 1 && !ev.some((e) => e.kind === 'read')
        && /nothing on record/.test(g.decide(bash(`curl -sS '${PIX}'`)) ?? '');
    },
  },
  {
    name: 'calls that are not requests pass untouched',
    run(g) {
      fresh();
      g.record(ran(`curl -sS -i '${PIX}'`, PIX_406), 'PostToolUse');
      return g.decide(bash('ls -la')) === null
        && g.decide(bash('git log --grep pixinsight.com --oneline')) === null
        && g.decide(bash(`echo 'see ${PIX}' >> notes.txt`)) === null
        && g.decide({ session_id: 't', tool_name: 'Read', tool_input: { file_path: '/x' } }) === null;
    },
  },
];

// Each plant takes ONE refusal out of a copy of the guard.
const PLANTS = {
  unread: ['return declineReason(host, d);', 'continue;'],
  fullread: ['if (!headers) return false;', ''],
  disguise: ['if (disguise && declinedScript) {', 'if (false) {'],
  disguise_flags: ['if (setsUA) return `sets its own User-Agent (${x.slice(0, 24)})`;', ''],
  wrapper: ['if (SHELL.test(b) && i > at && /^-[A-Za-z]*c[A-Za-z]*$/.test(w[i]) && w[i + 1] != null) openShell(w[i + 1]);', ''],
  schemeless: ["if (m && !/^-/.test(w) && TLDS.has(m[0].toLowerCase().replace(/:\\d+$/, '').replace(/\\.$/, '').split('.').pop())) keep(m[0]);", ''],
  schemeless_tld: ["if (m && !/^-/.test(w) && TLDS.has(m[0].toLowerCase().replace(/:\\d+$/, '').replace(/\\.$/, '').split('.').pop())) keep(m[0]);", 'if (m && !/^-/.test(w)) keep(m[0]);'],
  said: ['if (!norm(source).includes(said)) {', 'if (false) {'],
  route: ['if (!ROUTES.includes(kind) || ', 'if (false && '],
  proxy: ["if (d.cause === 'proxy' && kind !== 'owner')", 'if (false)'],
  owner_wait: ['if (!owner || owner.at <= d.t) return', 'if (false) return'],
  later_wait: ['if (now() < d.t + wait) return', 'if (false) return'],
  negotiate_accept: ['if (!/(?:-[A-Za-z]*H|--header)', 'if (false && !/(?:-[A-Za-z]*H|--header)'],
  repeat: ['if (!read) {', 'if (false) {'],
  callsaid: ['if (!norm(f.text).includes(said)) return', 'if (false) return'],
  strictread: ['if (r.bad) return', 'if (false) return'],
  ledger_write: ["if (['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(tool) && LEDGER_WORD", 'if (false && LEDGER_WORD'],
  ledger_bash: ['if (!readOnly) return', 'if (false) return'],
  rc: ['if (!identity && clientSegs.length) identity = rcIdentity();', ''],
  mixed: ["if (d.mixed && d.cause !== 'proxy' && d.cause !== 'tool') return", 'if (false) return'],
  node_literal: ["if ((w[0] !== 'node' && w[0] !== process.execPath) ||", "if ((basename(w[0] ?? '') !== 'node') ||"],
  browser_tool: ["identity: BROWSER_TOOL.test(tool) ? 'drives a browser' : null", 'identity: null'],
  config_env: ['(HOME|CURL_HOME|WGETRC|SYSTEM_WGETRC|XDG_CONFIG_HOME)=/.test(h.shell)) identity', '(HOME|CURL_HOME|WGETRC|SYSTEM_WGETRC|XDG_CONFIG_HOME)=/.test(h.shell) && false) identity'],
  port: ['for (const t of [toks[0], toks[1]]) {', "for (const t of toks.map((x) => x.replace(/^.*:/, '').replace(/,$/, ''))) {"],
  tlds: ['if (TLDS.has(tld)) keep(m[0]);', 'keep(m[0]);'],
  from_variable: ['if (fromVariable) {', 'if (false) {'],
  returned_http: ['|| L.match(/\\breturned HTTP (\\d{3})\\b/i);', ';'],
  seed: ["if (!d?.host || !d.use || have.has(`${d.use} ${d.host}`)) continue;", "if (!d?.host || !d.use || have.has(`${d.use} ${d.host}`) || true) continue;"],
  heredoc_data: ["else data.push(body.join('\\n'));", 'else keep.push(...body);'],
  command_position: ['function clientOf(words, any = false) {\n  if (any) {', 'function clientOf(words, any = false) {\n  if (true) {'],
  program_hosts: ['for (const t of programs) for (const m of t.matchAll(CALL_URL)) for (const x of hostsIn(m[1])) hosts.add(x);', 'for (const t of programs) for (const x of hostsIn(t)) hosts.add(x);'],
  comments: ["function stripComments(t) {\n  return String(t ?? '')", "function stripComments(t) {\n  return String(t ?? ''); String(t ?? '')"],
  fence: ['if (/^\\s*(```|~~~)/.test(L)) { fence = !fence; continue; }', ''],
  webfetch_200: ["out = code && code < 400 ? '' :", 'out = code && code < 400 ? res :'],
  wforge: ["if (segs[0].words.slice(c.at + 1).some((x) => (/^-[A-Za-z]*w/.test(x) && !x.startsWith('--')) || /^--write-out/.test(x))) return true;", ''],
  seeded: ["if (d.seeded && d.cause !== 'proxy') return", 'if (false) return'],
  ansi: ['if (c === \'$\' && s[i + 1] === "\'") {', 'if (false) {'],
  xargs_fn: ["if (s.words.slice(0, c.at).some((x) => basename(x) === 'xargs')) fromVariable = true;", ''],
  code_flags: ['const CODE_FLAG = /^(-[A-Za-z]*[ceEpr]|--eval|--print|--exec|--command)$/;', 'const CODE_FLAG = /^(-[A-Za-z]*[ce])$/;'],
  httpie: ['if (CLIENTS.has(b) || (i === first && /^https?$/.test(b))) return { exe: b, at: i };', 'if (CLIENTS.has(b)) return { exe: b, at: i };'],
  wget_e: ["if (evn.startsWith('useragent') ||", 'if (false &&'],
  own_test: ["if (/^reply-guard(\\.test)?\\.mjs$/.test(basename(f)) && existsSync(join(dirname(f), 'hook-dispatch.mjs'))) return;", ''],
  exact_host: ["return String(h).toLowerCase().replace(/\\.$/, '').replace(/^www\\./, '');", "return String(h).toLowerCase().split('.').slice(-2).join('.');"],
  ledger_segments: ['const segsL = commandsIn(heredocs(c).shell).filter((s) => s.words.some(names));', 'const segsL = commandsIn(heredocs(c).shell); if (!segsL.some((s) => s.words.some(names))) segsL.length = 0;'],
  short_reply: ['if (!(whole.length < 40 && said === whole) && (said.length', 'if (true && (said.length'],
  later_words: ['const LATER_WORDS = /temporar|try (it )?again later|retry later|come back later|try again in a (few|little)/i;', 'const LATER_WORDS = /temporar/i;'],
  runtime_opts: ['return `builds an option at run time (${x.slice(0, 24)}), which this guard cannot read`;', ';'],
};

async function runAll(guardPath, only) {
  const g = await import(pathToFileURL(guardPath).href + `?v=${Math.random()}`);
  const results = [];
  for (const c of CASES) {
    if (only && !(c.guards ?? []).includes(only)) continue;
    let ok = false;
    try { ok = await c.run(g, guardPath); } catch (e) { ok = false; c.err = e?.message; }
    results.push({ name: c.name, ok, err: c.err });
    while (MADE.length) rmSync(MADE.pop(), { recursive: true, force: true });
  }
  return results;
}

if (process.argv.includes('--plants')) {
  let bad = 0;
  for (const [key, [from, to]] of Object.entries(PLANTS)) {
    const src = readFileSync(join(HERE, 'reply-guard.mjs'), 'utf8');
    if (!src.includes(from)) { console.log(`PLANT ${key}: the line to take out is not in the guard — the plant is stale`); bad++; continue; }
    const dir = mkdtempSync(join(tmpdir(), 'reply-plant-'));
    writeFileSync(join(dir, 'reply-guard.mjs'), src.replace(from, to));
    copyFileSync(join(HERE, 'transcript-tail.mjs'), join(dir, 'transcript-tail.mjs'));
    const r = await runAll(join(dir, 'reply-guard.mjs'), key);
    const caught = r.length > 0 && r.some((x) => !x.ok);
    if (!r.length) console.log(`PLANT ${key}: no case names it in its guards`);
    console.log(`${caught ? 'CAUGHT' : 'MISSED'}  plant "${key}" (${from.trim()} → ${to})${caught ? '' : ' — its case still passed'}`);
    if (!caught) bad++;
    rmSync(dir, { recursive: true, force: true });
  }
  process.exit(bad ? 1 : 0);
} else {
  const r = await runAll(join(HERE, 'reply-guard.mjs'));
  for (const x of r) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.err ? ` (${x.err})` : ''}`);
  const failedN = r.filter((x) => !x.ok).length;
  console.log(`${r.length - failedN}/${r.length} passed`);
  process.exit(failedN ? 1 : 0);
}
