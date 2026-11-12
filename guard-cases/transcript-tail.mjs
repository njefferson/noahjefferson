// The cases of transcript-tail.mjs, the reader of a session's transcript: what is a message the owner typed, and what the harness wrote.
// The plants that take a line out of it stand in the suite's own map, beside the push guard's. The shape is shape.mjs.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const load = (dir) => import(`${pathToFileURL(join(dir, 'transcript-tail.mjs')).href}?v=${Math.random()}`);
const NOTE = '<task-notification><task-id>w1</task-id><status>completed</status></task-notification>';
const BACK = '<agent-message from="a1b2c3">\n[Subagent hand-back] The text below is the final report of a subagent. Step one is built.\n</agent-message>';
const BARE = '[Subagent hand-back] Step two is built and its suite passes.';
const SLASH = '<command-name>/model</command-name>\n<command-message>model</command-message>\n<command-args>fable</command-args>';

export const cases = [
  {
    name: 'transcript-tail: a task notification, an agent\'s hand-back (in its tag and bare) and a slash command\'s tags are the harness\'s words, and a typed sentence is not',
    guards: ['harness_tag', 'harness_handback', 'harness_bare_handback', 'owner_slash_shared'],
    async run(m, dir, h) {
      const t = await load(dir);
      return h.assertAll([
        ['a task notification is a harness tag', t.HARNESS_TAG.test(NOTE), NOTE],
        ['an agent-message tag is a harness tag', t.HARNESS_TAG.test(BACK), BACK],
        ['a bare hand-back line is a harness tag', t.HARNESS_TAG.test(BARE), BARE],
        ['a slash command\'s tags are a harness tag', t.HARNESS_TAG.test(SLASH), SLASH],
        ['a typed sentence is not', !t.HARNESS_TAG.test('Please change the title of the page'), ''],
      ]);
    },
  },
  {
    name: 'transcript-tail: a slash command\'s entry and an agent\'s hand-back are not a message the owner typed, while a typed message is',
    guards: ['owner_slash_tags'],
    async run(m, dir, h) {
      const t = await load(dir);
      return h.assertAll([
        ['a slash command is not the owner\'s message', t.isOwnerMessage(h.turn(5, SLASH)) === false, ''],
        ['a typed message is', t.isOwnerMessage(h.turn(7, 'Please change the title of the page')) === true, ''],
        ['a tool result is not', t.isOwnerMessage(h.result(1, 'x', 'ok')) === false, ''],
      ]);
    },
  },
  {
    name: 'transcript-tail: the permission mode of the owner\'s newest typed message is read, and nothing is read from a message that is not the owner\'s',
    guards: ['owner_mode'],
    async run(m, dir, h) {
      const t = await load(dir);
      const typed = (s, mode) => ({ ...h.turn(s, `Please do the next thing, number ${s}`), ...(mode ? { permissionMode: mode } : {}) });
      return h.assertAll([
        ['the newest typed message\'s mode is returned', t.ownerMode([typed(1, 'default'), typed(2, 'plan')]) === 'plan', ''],
        ['a message recording no mode gives null', t.ownerMode([typed(1, 'plan'), typed(2)]) === null, ''],
        ['a slash command after it is skipped', t.ownerMode([typed(1, 'auto'), { ...h.turn(2, SLASH), permissionMode: 'plan' }]) === 'auto', ''],
      ]);
    },
  },
  {
    name: 'transcript-tail: a text that shares a run of eight words with an owner message copies it, and one in other words does not',
    guards: ['copies_owner'],
    async run(m, dir, h) {
      const t = await load(dir);
      const owner = ['Please move the export button to the left side of the toolbar and nothing else at all.'];
      return h.assertAll([
        ['a copied run is found', t.copiesOwner('Move it: please move the export button to the left side of the toolbar.', owner) === true, ''],
        ['other words are not', t.copiesOwner('Relocate the export control to the toolbar\'s left edge, with no other change.', owner) === false, ''],
        ['no owner message copies nothing', t.copiesOwner('Please move the export button to the left side', []) === false, ''],
      ]);
    },
  },
];

export const plants = {};
