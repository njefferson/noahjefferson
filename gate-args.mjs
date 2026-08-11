/**
 * gate-args.mjs — the one place a hub gate works out WHICH REPO it is measuring.
 *
 * WHY THIS FILE EXISTS.
 *
 * Every gate here takes `--repo <path>` so a sibling can be checked without
 * forking the gate into it. Six of them parsed that by hand, identically, and
 * identically wrong: an argument that was not `--repo` was simply not looked at.
 *
 * So `node privacy-check.mjs ../Quietkeep` — which reads exactly like
 * `node docs-check.mjs .`, because that gate DOES take a positional path —
 * silently scanned the hub instead, and printed
 *
 *     === privacy gate · noahjefferson ===
 *     no personal disclosures in tracked files.
 *
 * A clean green, under the wrong repo's name, with not one file of the intended
 * repo opened. This is LESSONS 34's shape (a gate reading the wrong file) with
 * the failure moved one step earlier: the gate read the right files, of the
 * wrong repo, and nothing in its output said so unless you already knew which
 * name to expect.
 *
 * It is the worst failure a gate can have, because it is indistinguishable from
 * the answer you wanted.
 *
 * THE RULE: refuse, do not guess.
 *
 * Accepting the bare path would be kinder in the moment and would leave every
 * invocation already written down — in a workflow, in a NOTES.md, in a handoff
 * block — ambiguous about which repo it measured. A hard stop makes each one
 * say so, once, and then be correct for ever.
 */

import { resolve } from 'node:path';

/**
 * Resolve the repo under test from argv, refusing anything unrecognised.
 *
 * @param {string[]} argv    process.argv.slice(2)
 * @param {object}   opts
 * @param {string}   opts.gate  the gate's own filename, for the usage lines
 * @param {string[]} [opts.flags]  long flags this gate takes that consume the
 *   NEXT argument (`--repo` is always included). Bare switches like `--adopt`
 *   or `--ack=deploy-green` need no declaration — they start with `--`.
 * @param {string}   [opts.fallback]  what `--repo` defaults to. Some gates read
 *   the HUB when unasked (they measure the canon itself); others read the
 *   current directory. Passing it in keeps that per-gate decision where it was
 *   made instead of quietly standardising it here.
 * @returns {{ REPO: string, NAME: string, GIVEN: string }}
 *   GIVEN is the `--repo` value EXACTLY AS TYPED, or '.' when it was omitted.
 *   Gates print a copy-pasteable re-run line, and that line has to say what the
 *   person would type — not an absolute path this process resolved, and not
 *   whatever happens to sit at argv[0] when `--repo` was never passed. Both
 *   mistakes were live: one gate printed its own script path as the --repo
 *   value, and the index arithmetic behind the other read argv[-1 + 1], so
 *   `--adopt` alone would have printed `--repo --adopt`.
 */
export const repoFromArgv = (argv, { gate, flags = [], fallback } = {}) => {
  const consuming = new Set(['--repo', ...flags]);

  // Index of every argument that is the VALUE of a consuming flag, so a path
  // written as `--repo ../x` is not then reported as a stray `../x`.
  const consumed = new Set();
  argv.forEach((a, i) => { if (consuming.has(a)) consumed.add(i + 1); });

  const stray = argv.filter((a, i) => !a.startsWith('--') && !consumed.has(i));
  if (stray.length) {
    const name = gate ?? 'this gate';
    console.error(`=== ${name} ===\n`
      + `Unexpected argument: ${stray.join(' ')}\n`
      + `This gate takes the repo as --repo <path>, never as a bare path.\n`
      + `  node ${name}                     # scan the current directory\n`
      + `  node ${name} --repo ../Quietkeep # scan a sibling\n`
      + `A bare path used to be IGNORED, and the gate then reported green for\n`
      + `whichever repo it was standing in — under that repo's name. Refusing.`);
    process.exit(2);
  }

  const ri = argv.indexOf('--repo');
  const given = ri >= 0 && argv[ri + 1] && !argv[ri + 1].startsWith('--')
    ? argv[ri + 1]
    : null;
  const REPO = given ? resolve(given) : (fallback ?? process.cwd());
  return { REPO, NAME: REPO.split('/').pop(), GIVEN: given ?? '.' };
};
