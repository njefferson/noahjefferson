// The cases and plants of approved-plan-guard.mjs added by step 142 of the plan of 9 November: the plan identity the marker records (Q-HUB-348)
// and the mark the guard leaves while it has let a write of the plan through and not yet re-recorded it (the guard's half of Q-HUB-352).
// The shape of this file is the one guard-cases/shape.mjs describes.
import { writeFileSync } from 'node:fs';

const titled = (h, title) => `# ${title}\n\n${h.STEPS_PLAN.replace(/^# .*\n+/, '')}`;

export const cases = [
  {
    name: 'Q-HUB-348: the marker records the plan\'s title line and the time of its first approval; a second approval of the same path and title keeps the first time, and a different plan written to the same path gets a later one',
    guards: ['identity_carry', 'identity_title'],
    run(m, dir, h) {
      const A = h.appHome(dir);
      const tr = h.transcript([h.turn(0, 'start')]);
      const approve = (text) => {
        writeFileSync(A.plan, text);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
        return A.mk();
      };
      const enter = () => A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'EnterPlanMode' }, '--mark');
      const first = approve(titled(h, 'Plan of the first walk'));
      enter();
      const gone = A.mk();
      const again = approve(titled(h, 'Plan of the first walk'));
      enter();
      const other = approve(titled(h, 'A different plan on the same path'));
      const since = (x) => Date.parse(x?.firstApprovedAt ?? '');
      return h.assertAll([
        ['the first approval records the title line', first?.title === '# Plan of the first walk', JSON.stringify(first)],
        ['the first approval records its own time as the first approval', Number.isFinite(since(first)) && first.firstApprovedAt === first.approvedAt, JSON.stringify(first)],
        ['entering plan mode removes the marker', gone === null, JSON.stringify(gone)],
        ['the same path and title approved again keeps the first approval time', again?.firstApprovedAt === first?.firstApprovedAt && again?.approvedAt !== first?.approvedAt, JSON.stringify(again)],
        ['a different title on the same path starts at its own approval time', other?.title === '# A different plan on the same path' && since(other) > since(first) && other.firstApprovedAt === other.approvedAt, JSON.stringify(other)],
      ]);
    },
  },
  {
    name: 'Q-HUB-352: a write of the approved plan the guard lets through leaves a re-recording mark naming the hash the marker held, and the amendment that follows removes it whether the hash moves, nothing changed or the approved scope moved; a write it refuses leaves none',
    guards: ['rerecord_mark', 'rerecord_cleared', 'rerecord_cleared_same', 'rerecord_cleared_moved'],
    run(m, dir, h) {
      const text = h.scopedPlan(dir);
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      const GOAL = { old_string: '1. The thing is built and read.', new_string: '1. The thing is built.' };
      const home = () => {
        const A = h.appHome(dir);
        writeFileSync(A.plan, text);
        const tr = h.transcript([h.turn(0, 'start')]);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
        const edit = (input, flag) => A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...input }, ...(flag ? { hook_event_name: 'PostToolUse' } : {}) }, flag);
        return { A, edit };
      };
      // A Steps edit let through, then the file written and the amendment run.
      const one = home();
      const hashBefore = one.A.mk()?.hash;
      const pre = one.edit(STEP);
      const marked = one.A.mk();
      writeFileSync(one.A.plan, text.replace(STEP.old_string, STEP.new_string));
      const post = one.edit(STEP, '--amend');
      const after = one.A.mk();
      // A Steps edit let through that changes nothing in the file: the amendment finds the hash unmoved and still removes the mark.
      const two = home();
      two.edit(STEP);
      const markedSame = two.A.mk();
      two.edit(STEP, '--amend');
      const afterSame = two.A.mk();
      // A Steps edit let through, then a file that moved the Goals: the amendment refuses to carry the approval and removes the mark.
      const three = home();
      three.edit(STEP);
      writeFileSync(three.A.plan, text.replace(GOAL.old_string, GOAL.new_string));
      const postMoved = three.edit(GOAL, '--amend');
      const afterMoved = three.A.mk();
      // An edit of the Goals is refused before the write, and no mark is left.
      const four = home();
      const refused = four.edit(GOAL);
      const unmarked = four.A.mk();
      return h.assertAll([
        ['a Steps edit passes', pre.status === 0, pre.stdout + pre.stderr],
        ['it leaves a mark naming the hash the marker held and a time', marked?.rerecording?.fromHash === hashBefore && Number.isFinite(Date.parse(marked?.rerecording?.at ?? '')), JSON.stringify(marked?.rerecording)],
        ['the marker\'s hash is still the old one at the mark', marked?.hash === hashBefore, JSON.stringify(marked)],
        ['the amendment moves the hash and removes the mark', post.status === 0 && after?.hash !== hashBefore && !('rerecording' in (after ?? {})), JSON.stringify(after)],
        ['an amendment that finds the hash unmoved still removes the mark', !!markedSame?.rerecording && afterSame && !('rerecording' in afterSame), JSON.stringify(afterSame)],
        ['an amendment that finds the Goals moved refuses and removes the mark', postMoved.status === 2 && afterMoved && !('rerecording' in afterMoved), JSON.stringify(afterMoved)],
        ['an edit the guard refuses leaves no mark', refused.status === 2 && unmarked && !('rerecording' in unmarked), JSON.stringify(unmarked)],
      ]);
    },
  },
];

export const plants = {
  identity_carry: ['title && was.title === title && ', '', 'approved-plan-guard.mjs'],
  identity_title: ['...identityOf(plan, approvedNow), ', '', 'approved-plan-guard.mjs'],
  rerecord_mark: ['rerecording: { fromHash: current.hash,', 'rerecordingOff: { fromHash: current.hash,', 'approved-plan-guard.mjs'],
  rerecord_cleared: ['  delete mk.rerecording;\n', '', 'approved-plan-guard.mjs'],
  rerecord_cleared_same: ['  if (snap.hash === mk.hash) { unmarked(); process.exit(0); }\n', '  if (snap.hash === mk.hash) { process.exit(0); }\n', 'approved-plan-guard.mjs'],
  rerecord_cleared_moved: ['  if (moved.length) {\n    unmarked();\n', '  if (moved.length) {\n', 'approved-plan-guard.mjs'],
};
