// The cases and plants of rules-keep-check.mjs, hold 5 of the plan of 14 November. The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const KEPT = 'Planted rule line that must stand.';
const OTHER = 'Planted other line that stays.';

// A temporary git repository with a base commit holding `before` and a second commit holding `after` (path -> text; null removes).
function plant(h, before, after) {
  const r = h.repo({}, 'rules');
  const put = (files) => {
    for (const [f, text] of Object.entries(files)) {
      const p = join(r.dir, f);
      if (text === null) { rmSync(p, { force: true }); continue; }
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
    }
    r.g('add', '-A');
  };
  put(before); r.g('commit', '-q', '-m', 'planted base');
  put(after); r.g('commit', '-q', '--allow-empty', '-m', 'planted change');
  return r;
}
const check = (dir, r, ...more) => spawnSync('node', [join(dir, 'rules-keep-check.mjs'), '--repo', r.dir, ...more], { encoding: 'utf8', timeout: 60000 });
const BASE = { 'CLAUDE.md': `${KEPT}\n${OTHER}\n`, 'doctrine/hub.md': 'Planted hub line.\n', 'notes.md': 'Planted note line.\n' };

export const cases = [
  {
    name: 'rules-keep-check: a line removed from a rules page fails and is named with its old file and line number; an unchanged repository passes with a count',
    guards: ['rk_lost', 'rk_names_line', 'rk_why'],
    run(m, dir, h) {
      const lost = plant(h, BASE, { 'CLAUDE.md': `${OTHER}\n` });
      const same = plant(h, BASE, {});
      const a = check(dir, lost);
      const b = check(dir, same, '--base', 'HEAD~1');
      return h.assertAll([
        ['the removal exits 1', a.status === 1, a.status + a.stdout + a.stderr],
        ['it names the lost line with file and line number', a.stdout.includes(`CLAUDE.md:1: ${KEPT}`) && /listed in plans\/rules-released\.md/.test(a.stdout), a.stdout],
        ['the failure output ends with the Why sentence', a.stdout.trimEnd().split('\n').pop() === 'Why: on 12 November 2026 a rebuild meant to make the hub lighter dropped rules it was meant to keep, and nothing showed it.', a.stdout],
        ['an unchanged repository exits 0 with one line holding a count', b.status === 0 && /^rules-keep-check: \d+ lines held/.test(b.stdout) && b.stdout.trim().split('\n').length === 1, b.status + b.stdout + b.stderr],
      ]);
    },
  },
  {
    name: 'rules-keep-check: the same line moved to another rules page passes',
    guards: ['rk_moved'],
    run(m, dir, h) {
      const r = plant(h, BASE, { 'CLAUDE.md': `${OTHER}\n`, 'doctrine/never.md': `  ${KEPT}  \n` });
      const out = check(dir, r);
      return h.assertAll([['a moved line passes', out.status === 0, out.status + out.stdout + out.stderr]]);
    },
  },
  {
    name: 'rules-keep-check: the same line listed in plans/rules-released.md passes, and the released file is not itself a rules page',
    guards: ['rk_released'],
    run(m, dir, h) {
      const listed = plant(h, BASE, { 'CLAUDE.md': `${OTHER}\n`, 'plans/rules-released.md': `On the planted date, released because the planted reason holds.\n\n\`\`\`\n${KEPT}\n\`\`\`\n` });
      const asPage = plant(h, { ...BASE, 'plans/rules-released.md': 'Planted line of the released file.\n' }, { 'plans/rules-released.md': 'Another line.\n' });
      const a = check(dir, listed);
      const b = check(dir, asPage);
      return h.assertAll([
        ['a listed line passes', a.status === 0, a.status + a.stdout + a.stderr],
        ['a line of the released file itself is no rules page, so changing it loses nothing', b.status === 0, b.status + b.stdout + b.stderr],
      ]);
    },
  },
  {
    name: 'rules-keep-check: a reworded line fails and the old line is named',
    guards: ['rk_lost', 'rk_names_line'],
    run(m, dir, h) {
      const r = plant(h, BASE, { 'CLAUDE.md': `Planted rule line that now stands.\n${OTHER}\n` });
      const out = check(dir, r);
      return h.assertAll([
        ['the reworded line exits 1', out.status === 1, out.status + out.stdout],
        ['the old line is named', out.stdout.includes(KEPT) && !out.stdout.includes('now stands'), out.stdout],
      ]);
    },
  },
  {
    name: 'rules-keep-check: a line removed from a file that is not a rules page passes, and so does a rules page new at the working tree',
    guards: ['rk_not_page'],
    run(m, dir, h) {
      const r = plant(h, BASE, { 'notes.md': 'Another note.\n', 'doctrine/extra.md': 'A new rules page.\n' });
      const out = check(dir, r);
      return h.assertAll([['a removed line of a non-page passes', out.status === 0, out.status + out.stdout + out.stderr]]);
    },
  },
  {
    name: 'rules-keep-check: a base that cannot be read says so and exits 1, never 0',
    guards: ['rk_unreadable'],
    run(m, dir, h) {
      const r = plant(h, BASE, {});
      const named = check(dir, r, '--base', 'no-such-commit-anywhere');
      const lone = h.repo({ 'CLAUDE.md': 'x\n' }, 'lone');
      const fallback = spawnSync('node', [join(dir, 'rules-keep-check.mjs'), '--repo', lone.dir], { encoding: 'utf8', timeout: 60000 });
      return h.assertAll([
        ['a base that names no commit exits 1 with a reason', named.status === 1 && /base cannot be read/.test(named.stderr), named.status + named.stderr],
        ['a repository with one commit has no HEAD~1 and exits 1', fallback.status === 1 && /base cannot be read/.test(fallback.stderr), fallback.status + fallback.stderr],
      ]);
    },
  },
  {
    name: 'rules-keep-check: with no --base, an uncommitted removal of a rules line is judged against HEAD and fails, naming the base and rule 1',
    guards: ['rk_base_head', 'rk_rule_label'],
    run(m, dir, h) {
      const r = plant(h, BASE, {});
      r.write('CLAUDE.md', `${OTHER}\n`);
      const out = check(dir, r);
      return h.assertAll([
        ['it fails', out.status === 1, out.status + out.stdout + out.stderr],
        ['it names the lost line, judged against HEAD', out.stdout.includes(`CLAUDE.md:1: ${KEPT}`) && /at HEAD \(/.test(out.stdout), out.stdout],
        ['it says rule 1 chose the base', /rule 1/.test(out.stdout), out.stdout],
      ]);
    },
  },
  {
    name: 'rules-keep-check: with no --base, a clean tree with one unpushed commit that removes a line is judged against origin/main and fails, naming rule 2',
    guards: ['rk_base_origin'],
    run(m, dir, h) {
      const r = plant(h, BASE, { 'CLAUDE.md': `${OTHER}\n` });
      r.g('update-ref', 'refs/remotes/origin/main', 'HEAD~1');
      const out = check(dir, r);
      return h.assertAll([
        ['it fails', out.status === 1, out.status + out.stdout + out.stderr],
        ['it names the lost line, judged against origin/main by rule 2', out.stdout.includes(`CLAUDE.md:1: ${KEPT}`) && /at origin\/main \(/.test(out.stdout) && /rule 2/.test(out.stdout), out.stdout],
      ]);
    },
  },
  {
    name: 'rules-keep-check: a line an earlier, pushed commit removed is not named in a run before a commit that removes nothing, and the success line names HEAD and rule 1',
    guards: ['rk_base_head', 'rk_rule_label'],
    run(m, dir, h) {
      const r = plant(h, BASE, { 'CLAUDE.md': `${OTHER}\n` });
      r.g('update-ref', 'refs/remotes/origin/main', 'HEAD');
      r.write('CLAUDE.md', `${OTHER}\nA planted new line.\n`);
      const out = check(dir, r);
      return h.assertAll([
        ['it passes and does not name the earlier removal', out.status === 0 && !out.stdout.includes(KEPT), out.status + out.stdout + out.stderr],
        ['its one line names HEAD and rule 1', /against HEAD \(.*rule 1/.test(out.stdout) && out.stdout.trim().split('\n').length === 1, out.stdout],
      ]);
    },
  },
];

export const plants = {
  rk_base_head: ["if (touched.length) { base = 'HEAD';", "if (false) { base = 'HEAD';", 'rules-keep-check.mjs'],
  rk_base_origin: ['else if (reaches) {', 'else if (false) {', 'rules-keep-check.mjs'],
  rk_rule_label: ["chosen = 'rule 1: a rules page", "chosen = 'a rules page", 'rules-keep-check.mjs'],
  rk_lost: ['if (lost.length) {', 'if (false) {', 'rules-keep-check.mjs'],
  rk_names_line: ['console.log(`  ${o.file}:${o.n}: ${o.line}`);', 'console.log(`  ${o.file}:${o.n}`);', 'rules-keep-check.mjs'],
  rk_why: ["  console.log('Why: on 12 November 2026 a rebuild meant to make the hub lighter dropped rules it was meant to keep, and nothing showed it.');\n", '', 'rules-keep-check.mjs'],
  rk_moved: ['held.add(l.trim());', 'held.add(`${p}${l.trim()}`);', 'rules-keep-check.mjs'],
  rk_released: ['released.add(l.trim());', 'void l;', 'rules-keep-check.mjs'],
  rk_not_page: ['const isPage = (p) => p !== RELEASED && (RULES_PAGES.exact', "const isPage = (p) => p.endsWith('.md') || (RULES_PAGES.exact", 'rules-keep-check.mjs'],
  rk_unreadable: ['this is not a pass.`); process.exit(1);', 'this is not a pass.`); process.exit(0);', 'rules-keep-check.mjs'],
};
