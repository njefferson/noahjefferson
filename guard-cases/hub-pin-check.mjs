// The cases and plants of hub-pin-check.mjs (Q-HUB-378). The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// A planted hub (a git work tree holding the two files the check looks for) with a pinned commit on its main, a later commit on top of
// it, and a commit on a side branch the main does not reach; and a planted app with one workflow naming the hub at the pin it is given.
function plant(h, pinOf, marker) {
  const hub = h.repo({ 'DOCTRINE.md': 'planted\n', 'branch-guard.mjs': 'planted\n' }, 'hub');
  hub.g('branch', '-M', 'main');
  hub.g('commit', '-q', '--allow-empty', '-m', 'planted subject of the pinned commit');
  const onMain = hub.g('rev-parse', 'HEAD').stdout.trim();
  hub.g('commit', '-q', '--allow-empty', '-m', 'planted later commit on main');
  hub.g('checkout', '-q', '-b', 'side', onMain);
  hub.g('commit', '-q', '--allow-empty', '-m', 'planted side commit no main reaches');
  const onSide = hub.g('rev-parse', 'HEAD').stdout.trim();
  hub.g('checkout', '-q', 'main');
  const pin = pinOf({ onMain, onSide });
  const app = h.tmp('sg-pin-app-');
  mkdirSync(join(app, '.github', 'workflows'), { recursive: true });
  writeFileSync(join(app, '.github', 'workflows', 'gates.yml'), `jobs:\n  hub-gates:\n    uses: njefferson/noahjefferson/.github/workflows/hub-gates.yml@${pin}\n`);
  if (marker) writeFileSync(join(app, '.doctrine-sync'), `${marker({ onMain, onSide })}\n`);
  return { hub, app, onMain, onSide };
}
const runCheck = (dir, w) => spawnSync('node', [join(dir, 'hub-pin-check.mjs'), '--repo', w.app, '--hub', w.hub.dir, '--no-fetch'], { encoding: 'utf8', timeout: 60000 });

export const cases = [
  {
    name: 'Q-HUB-378: the hub pin check prints the subject of each commit beside it: a pin the main reaches, a pin it does not reach, and a marker, so a log that masks long hex runs still shows which commit is meant',
    guards: ['pin_subject_ok', 'pin_subject_fail', 'pin_subject_marker'],
    run(m, dir, h) {
      const good = plant(h, (c) => c.onMain, (c) => c.onMain);
      const ok = runCheck(dir, good);
      const bad = plant(h, (c) => c.onSide);
      const fail = runCheck(dir, bad);
      return h.assertAll([
        ['a pin the main reaches exits 0 and its line carries the pin\'s subject', ok.status === 0 && ok.stdout.includes(`pin ${good.onMain} ("planted subject of the pinned commit") is a commit the hub's main reaches`), ok.stdout + ok.stderr],
        ['the marker\'s line carries the marker commit\'s subject', ok.stdout.includes(`.doctrine-sync names ${good.onMain.slice(0, 7)} ("planted subject of the pinned commit"), a commit the hub has`), ok.stdout],
        ['a pin the main does not reach exits 1 and its line carries that commit\'s subject', fail.status === 1 && fail.stdout.includes(`pin ${bad.onSide.slice(0, 12)} ("planted side commit no main reaches") is on no line of the hub's main`), fail.stdout + fail.stderr],
      ]);
    },
  },
];

export const plants = {
  // Each line is in hub-pin-check.mjs, which the plant takes the line out of.
  pin_subject_ok: ['pin ${p.ref}${subjectOf(hub, p.ref)} is a commit', 'pin ${p.ref} is a commit', 'hub-pin-check.mjs'],
  pin_subject_fail: ['pin ${p.ref.slice(0, 12)}${subjectOf(hub, p.ref)} ${why}', 'pin ${p.ref.slice(0, 12)} ${why}', 'hub-pin-check.mjs'],
  pin_subject_marker: ['names ${since.slice(0, 7)}${subjectOf(hub, since)}, a commit the hub has', 'names ${since.slice(0, 7)}, a commit the hub has', 'hub-pin-check.mjs'],
};
