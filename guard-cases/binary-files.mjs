// The case and plant of binary-files.mjs. The shape is shape.mjs.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// The third-person pronoun, built from character codes: a string a case writes holds no word the third-person check reads as one.
const PRON = String.fromCharCode(104, 101);

export const cases = [
  {
    name: 'binary-files.mjs lists onnx and part as binary: the third-person check passes a repository whose .onnx and .part files hold a pronoun sentence, and fails the same line in a .txt',
    guards: ['binary_onnx_part'],
    run(m, dir, h) {
      const line = `${PRON} wrote the note\n`;
      const r = h.repo({ 'model.onnx': line, 'model.part': line });
      const runIt = () => spawnSync('node', [join(dir, 'third-person-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const first = runIt();
      r.write('notes.txt', line);
      r.g('add', '-A'); r.g('commit', '-q', '-m', 'notes');
      const second = runIt();
      return h.assertAll([
        ['a pronoun in a .onnx and a .part is not read', first.status === 0, `exit ${first.status}: ${first.stdout}${first.stderr}`],
        ['the same line in a .txt is refused', second.status !== 0, `exit ${second.status}: ${second.stdout}${second.stderr}`],
      ]);
    },
  },
];

export const plants = {
  binary_onnx_part: ["  + '|onnx|part'", "  + ''", 'binary-files.mjs'],
};
