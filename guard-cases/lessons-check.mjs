// The cases and plants of lessons-check.mjs for the citation of an item inside a lesson (P-253). The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// A planted hub of two lessons; the second carries the words it is given in its body.
function run(h, dir, words) {
  const d = h.tmp('sg-lessons-cite-');
  copyFileSync(join(dir, 'lessons-check.mjs'), join(d, 'lessons-check.mjs'));
  mkdirSync(join(d, 'lessons'));
  writeFileSync(join(d, 'lessons', '1-a-planted-lesson.md'), '## 1 · A planted lesson\n\n**Enforced by:** JUDGEMENT\n\n**Smell:** a planted smell of the case.\n');
  writeFileSync(join(d, 'lessons', '2-a-citing-lesson.md'), `## 2 · A citing lesson\n\n**Enforced by:** JUDGEMENT\n\n**Smell:** a planted smell of the case.\n\n${words}\n`);
  writeFileSync(join(d, 'LESSONS.md'), '# Lessons\n\nPlanted prose of the case.\n\n- **§1** — [A planted lesson](lessons/1-a-planted-lesson.md)\n- **§2** — [A citing lesson](lessons/2-a-citing-lesson.md)\n');
  return spawnSync('node', [join(d, 'lessons-check.mjs')], { encoding: 'utf8', timeout: 60000 });
}

export const cases = [
  {
    name: 'P-253: a citation of an item inside a lesson, written with a point, is read as the lesson number: it passes where the lesson exists and fails naming the item where it does not',
    guards: ['lessons_cite_point', 'lessons_cite_resolves'],
    run(m, dir, h) {
      const good = run(h, dir, 'See LESSONS §1.3 for the item.');
      const missing = run(h, dir, 'See LESSONS §9.4 for the item.');
      const plain = run(h, dir, 'See LESSONS §9 for the lesson.');
      return h.assertAll([
        ['a point citation of a lesson that exists exits 0', good.status === 0 && /^PASS/m.test(good.stdout), good.stdout + good.stderr],
        ['a point citation of a lesson that does not exist exits 1 and names the citation and its item', missing.status === 1 && /cites LESSONS §9\.4 \(item 4 of lesson 9\), and no lesson is numbered 9/.test(missing.stdout), missing.stdout + missing.stderr],
        ['a citation with no point of a lesson that does not exist exits 1 as it does with one', plain.status === 1 && /cites LESSONS §9, and no lesson is numbered 9/.test(plain.stdout), plain.stdout + plain.stderr],
      ]);
    },
  },
  {
    name: 'P-253: a section number cited with a point and no word LESSONS before it is not read as a lesson citation, so a section of another page is left alone',
    guards: ['lessons_cite_only_named'],
    run(m, dir, h) {
      const other = run(h, dir, 'The doctrine says so in §99.4 and in section 16.8.');
      return h.assertAll([
        ['a bare §99.4 exits 0 and prints no failure', other.status === 0 && /^PASS/m.test(other.stdout) && !/resolves to nothing/.test(other.stdout), other.stdout + other.stderr],
      ]);
    },
  },
];

export const plants = {
  // Each line is in lessons-check.mjs, which the plant takes the line out of.
  lessons_cite_point: ['(?:\\.(\\d+))?/g)]\n  .map((m) => ({ section', '/g)]\n  .map((m) => ({ section', 'lessons-check.mjs'],
  lessons_cite_resolves: ['    if (!onDisk.has(c.section)) {', '    if (false) {', 'lessons-check.mjs'],
  lessons_cite_only_named: ['/\\bLESSONS\\s+§(', '/(?:LESSONS\\s+)?§(', 'lessons-check.mjs'],
};
