// The cases and plants of approved-plan-guard.mjs added by step 142 of the plan of 9 November: the plan identity the marker records (Q-HUB-348)
// and the amendment that follows a write of the plan (Q-HUB-352, Q-HUB-375: the guard leaves no mark of its own; the plan fence reads the
// write times). Step 152 adds the recovered button approval's identity (Q-HUB-374).
// The shape of this file is the one guard-cases/shape.mjs describes.
import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

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
    name: 'Q-HUB-374: an approval recovered from the transcript at the button records the plan\'s title line and a first approval time equal to its own approval time, read from the marker',
    guards: ['recover_identity'],
    run(m, dir, h) {
      const A = h.appHome(dir);
      const tr = h.transcript([h.turn(0, 'start'), ...h.enterPlan(-60), ...h.buttonExit(-20, A.plan, h.STEPS_PLAN)]);
      const r = A.guard(tr, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const mk = A.mk();
      const t = Date.parse(mk?.approvedAt ?? '');
      return h.assertAll([
        ['the first call records a marker from the button approval', r.status === 0 && mk?.buttonUse === 'bx', JSON.stringify(mk)],
        ['the marker holds the plan\'s title line', mk?.title === '# Gate test plan', JSON.stringify(mk)],
        ['the marker holds a first approval time that is its own approval time', Number.isFinite(t) && mk?.firstApprovedAt === mk?.approvedAt, JSON.stringify(mk)],
      ]);
    },
  },
  {
    name: 'Q-HUB-375: a write of the approved plan the guard lets through leaves no mark in the marker, and the amendment that follows moves the hash, leaves the marker as it was when nothing changed, and refuses when the approved scope moved; a write it refuses leaves the marker as it was',
    guards: ['amend_moves_hash'],
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
        ['it leaves no mark and the marker\'s hash is still the old one', !!marked && !('rerecording' in marked) && marked.hash === hashBefore, JSON.stringify(marked)],
        ['the amendment moves the hash', post.status === 0 && !!after && after.hash !== hashBefore && !('rerecording' in after), JSON.stringify(after)],
        ['an amendment that finds the hash unmoved leaves the marker\'s hash as it was', !!markedSame && !!afterSame && afterSame.hash === markedSame.hash && !('rerecording' in afterSame), JSON.stringify(afterSame)],
        ['an amendment that finds the Goals moved refuses', postMoved.status === 2 && !!afterMoved && !('rerecording' in afterMoved), JSON.stringify(afterMoved)],
        ['an edit the guard refuses leaves the marker as it was', refused.status === 2 && !!unmarked && unmarked.hash === hashBefore && !('rerecording' in unmarked), JSON.stringify(unmarked)],
      ]);
    },
  },
  {
    name: 'Q-HUB-395: a plan approved again after a marker written before the identity fields keeps the first approval time that marker recorded, whichever marker it replaces; a changed title still starts afresh',
    guards: ['keep_identity'],
    run(m, dir, h) {
      const A = h.appHome(dir);
      const tr = h.transcript([h.turn(0, 'start')]);
      const text = titled(h, 'Plan of the old marker');
      writeFileSync(A.plan, text);
      const OLD = '2026-11-01T10:00:00.000Z';
      const lineage = join(A.home, '.claude', 'APPROVED-PLAN-lineage.json');
      const enter = () => A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'EnterPlanMode' }, '--mark');
      const approve = (body) => {
        writeFileSync(A.plan, body);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: body, isAgent: false, filePath: A.plan } }, '--mark');
        return A.mk();
      };
      // A marker as it was written before a marker held the plan's title and first approval time: no `title`, no `firstApprovedAt`.
      writeFileSync(A.marker, JSON.stringify({ plan: A.plan, hash: 'written-before-the-identity-fields', at: OLD, approvedAt: OLD, steps: [5] }));
      enter();
      const again = approve(text);
      // The same, with a marker that records its own time only as `at`.
      rmSync(lineage, { force: true });
      writeFileSync(A.marker, JSON.stringify({ plan: A.plan, hash: 'written-before-the-identity-fields', at: OLD, steps: [5] }));
      enter();
      const viaAt = approve(text);
      // A different title on the path after such a marker is a different plan.
      rmSync(lineage, { force: true });
      writeFileSync(A.marker, JSON.stringify({ plan: A.plan, hash: 'written-before-the-identity-fields', at: OLD, approvedAt: OLD, steps: [5] }));
      enter();
      const other = approve(titled(h, 'A different plan after the old marker'));
      return h.assertAll([
        ['the approval after an old marker keeps that marker\'s approval time as the first', again?.firstApprovedAt === OLD && again?.approvedAt !== OLD, JSON.stringify(again)],
        ['a marker with only an `at` time hands on that time', viaAt?.firstApprovedAt === OLD, JSON.stringify(viaAt)],
        ['a changed title starts at its own approval time', other?.firstApprovedAt === other?.approvedAt && other?.firstApprovedAt !== OLD, JSON.stringify(other)],
      ]);
    },
  },
  {
    name: 'Q-HUB-388: the approval guard reads the mode of an end of plan mode through the status print\'s function, so a session\'s own EnterPlanMode call after an owner message under auto is a plan mode of the session\'s and not an end under auto mode',
    guards: ['mode_shared'],
    run(m, dir, h) {
      const B = h.appHome(dir);
      const u = h.uid();
      const tr = h.transcript([h.turn(0, 'start'), { ...h.turn(-80, 'Go.'), permissionMode: 'auto' }, ...h.enterPlan(-60), h.exitEntry(-19, B.plan, u)]);
      B.guard(tr, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const entries = [h.turn(0, 'start'), { ...h.turn(-80, 'Go.'), permissionMode: 'auto' }, ...h.enterPlan(-60)];
      const state = m.report.planModeState(entries);
      return h.assertAll([
        ['the shared function reads the session\'s newer entry call as plan mode', state.mode === 'plan' && state.by === 'enter', JSON.stringify(state)],
        ['the guard judges that end as one the session\'s call did not make, not as one under auto mode', B.outcome(u) === 'no exit call', B.outcome(u)],
        ['no marker is written from it', B.mk() === null, JSON.stringify(B.mk())],
      ]);
    },
  },
];

export const plants = {
  keep_identity: ['{ keepIdentity(MARKER); rmSync(', '{ rmSync(', 'approved-plan-guard.mjs'],
  mode_shared: ['mode: planModeState(entries, i).mode }', "mode: 'auto' }", 'approved-plan-guard.mjs'],
  identity_carry: ['title && was.title === title && ', '', 'approved-plan-guard.mjs'],
  identity_title: ['...identityOf(plan, approvedNow), ', '', 'approved-plan-guard.mjs'],
  recover_identity: ["approvedAt: new Date(x.at).toISOString(), ...identityOf(x.plan, new Date(x.at).toISOString()), ", 'approvedAt: new Date(x.at).toISOString(), ', 'approved-plan-guard.mjs'],
  amend_moves_hash: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt', '{ ...mk, scope: snap.scope, amendedAt', 'approved-plan-guard.mjs'],
};
