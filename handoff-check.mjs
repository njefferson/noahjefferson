// handoff-check.mjs — the handoff is a deliverable, so it gets a checker.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node handoff-check.mjs --repo ../myapp
//   node handoff-check.mjs --repo ../myapp --ack=deploy-green,deploy-url,evidence,attachments,manual-steps
//
// WHY (LESSONS §26, Noah 2026-08-02). A build shipped with four green gates and
// a handoff that broke four doctrine rules — every one of them prose-only:
//   · deployed to staging four times and never handed over the URL (§7)
//   · told him to add Cloudflare secrets that already existed (§5b)
//   · told a man on an iPad to fetch a file "from the repo" (§2, §6)
//   · modelled his hardware from a document instead of from him (§6)
// The gated rules all held. The prose rules all lost. So: gate the prose.
//
// HONEST ABOUT ITS OWN CEILING. The first group below is MECHANICAL — the
// script decides. The second is ACKNOWLEDGED — no script can read a draft
// message and know whether a claim carries its evidence, so those must be
// asserted explicitly with --ack. A session can assert them falsely, exactly as
// it can mis-declare a drag interaction under Doctrine §4. What it cannot do is
// skip them without noticing, which is the whole failure this addresses.
//
// EXITS NON-ZERO on any failure.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : HUB;
const NAME = REPO.split('/').pop();
const ack = new Set(
  (argv.find((a) => a.startsWith('--ack=')) || '').replace('--ack=', '').split(',').filter(Boolean),
);

const failures = [];
const passed = [];
const notes = [];

const read = (p) => (existsSync(join(REPO, p)) ? readFileSync(join(REPO, p), 'utf8') : null);

/* ================================================================== *
 * MECHANICAL — the script decides these
 * ================================================================== */

const notes_md = read('NOTES.md');
const wfDir = join(REPO, '.github', 'workflows');
const workflows = existsSync(wfDir)
  ? readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f)).map((f) => ({ f, text: readFileSync(join(wfDir, f), 'utf8') }))
  : [];
const deployWf = workflows.find((w) => /pages deploy|wrangler-action/.test(w.text));

if (!deployWf) {
  notes.push('no deploy workflow — the deploy checks below do not apply');
} else {
  // What project does this repo deploy to, and does it have a staging branch?
  //
  // The capture is DELIBERATELY LOOSE and then resolved, because the first
  // version matched `[\w-]+` only and therefore missed every workflow that
  // parameterises the name — which is the better practice, not the worse one.
  // Quietkeep sets `PROJECT: quietkeep` once at workflow level and writes
  // `--project-name=${{ env.PROJECT }}` at four call sites; the gate declared
  // it "names no --project-name" and failed a repo that names it correctly.
  //
  // **The false positive was the lesser half.** `project` also feeds the
  // staging-URL assertion below, so the early `if (!project)` return meant
  // that check — Doctrine §7, the one about a staged candidate leaving a
  // visible URL — had NEVER RUN against that repo. A gate whose first failure
  // hides its later checks reports less than it appears to, and the missing
  // assertion is invisible precisely because something else went red.
  // NOT `\S+` — a GitHub expression contains spaces (`${{ env.PROJECT }}`), so
  // a non-whitespace capture stops at `${{` and resolves to nothing. The
  // alternation matches an expression OR a bare name, and nothing else.
  const projectRaw = (/--project-name=(\$\{\{[^}]*\}\}|[\w-]+)/.exec(deployWf.text) || [])[1];
  const project = (() => {
    if (!projectRaw) return undefined;
    // `${{ env.X }}` → the workflow's own `env:` value for X. Anything else
    // that still carries an expression is left unresolved rather than guessed:
    // a name this script cannot work out is reported, never invented.
    const expr = /^\$\{\{\s*env\.(\w+)\s*\}\}$/.exec(projectRaw);
    if (!expr) return /^[\w-]+$/.test(projectRaw) ? projectRaw : undefined;
    const val = new RegExp(`^\\s*${expr[1]}:\\s*([\\w-]+)\\s*$`, 'm').exec(deployWf.text);
    return val ? val[1] : undefined;
  })();
  const hasStaging = /branches:\s*\[[^\]]*staging/.test(deployWf.text);

  if (!project) {
    failures.push(`${deployWf.f} deploys but names no --project-name; cannot tell where it lands.`);
  } else if (hasStaging) {
    // §7: a staged candidate must be VISIBLE after the session that made it.
    if (!notes_md) {
      failures.push('deploys to staging but has no NOTES.md to record the candidate in (§7, §12).');
    } else {
      const urlRe = new RegExp(`https?://[\\w.-]*${project}\\.pages\\.dev`, 'i');
      const found = urlRe.exec(notes_md);
      if (!found) {
        failures.push(
          `NOTES.md records no ${project}.pages.dev URL. Doctrine §7: hand over the preview URL and `
          + 'leave a durable "waiting on Noah" signal, so a staged candidate is not invisible '
          + 'once the session ends.',
        );
      } else {
        passed.push(`NOTES.md carries the deploy URL — ${found[0]}`);

        // The recorded version must be the one that would deploy. A stale URL
        // block claiming an old build is worse than none.
        //
        // WHERE THE VERSION ACTUALLY LIVES, WHICH IS NOT ONE PATH, and the
        // order is order of AUTHORITY rather than convenience.
        //
        // `package.json` was the only source until 2026-08-03 and it is the
        // weakest. Quietkeep leaves it at the `0.0.0` npm-init placeholder and
        // carries its real release triplet in the service worker's cache name,
        // which its own `changelog:check` pins to the changelog head — so
        // demanding "0.0.0 beside the URL" would have been a gate inventing a
        // requirement the repo is right to ignore.
        //
        // fauxplane found the other half of the same defect. It has NO BUILD
        // STEP: `public/` deploys verbatim, so its module tree is `public/src/`
        // and its one version constant is at `public/src/core/version.js`. Its
        // cache name is a template literal reading a query parameter, so the
        // regex below cannot match it, and neither `src/version.js` nor
        // `package.json` held anything true — the fall-through produced `0.1.0`,
        // a scaffold number nobody bumps, while the app on screen said 1.16.0.
        // The only way to go green was to write a version that did not exist,
        // into a handoff, about a build Noah was being asked to test.
        //
        // **A gate whose green state is a lie is worse than no gate**, and both
        // repos reached it by the same route: a fallback that succeeds on the
        // wrong file produces a plausible number instead of an error.
        const swText = read('public/sw.js') || read('sw.js');
        const vm = (swText && /CACHE\s*=\s*['"][\w-]*?-(\d+\.\d+\.\d+)['"]/.exec(swText))
          || (() => {
            const vSrc =
              read('src/version.js')
              || read('public/src/core/version.js')
              || read('src/core/version.js')
              || read('package.json');
            const m = vSrc && (/VERSION\s*=\s*'([^']+)'/.exec(vSrc) || /"version":\s*"([^"]+)"/.exec(vSrc));
            // `0.0.0` is the npm placeholder, not a claim about a release.
            return m && m[1] !== '0.0.0' ? m : null;
          })();
        if (vm) {
          const version = vm[1];
          const block = notes_md.slice(Math.max(0, found.index - 400), found.index + 400);
          if (!block.includes(version)) {
            failures.push(
              `NOTES.md records the deploy URL but not the current version (${version}) beside it. `
              + 'A staged-candidate note that does not say WHICH build is staged cannot be acted on.',
            );
          } else {
            passed.push(`the recorded candidate names the current version (${version})`);
          }
        }
      }
    }
  } else {
    notes.push(`${deployWf.f} has no staging branch — production-only repo, no candidate to record`);
  }
}

/* ---- §2/§6: never tell an iPad-first owner to go and get a file ---- */

const prose = [
  ['NOTES.md', notes_md],
  ['README.md', read('README.md')],
].filter(([, t]) => t);

for (const [file, text] of prose) {
  text.split('\n').forEach((line, n) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) return;
    // "upload public/og.png from the repo" — a desktop-shaped instruction.
    const m = /\b(upload|attach|grab|copy|take|use)\b[^.\n]{0,60}\b([\w/-]+\.(png|jpg|jpeg|svg|json|zip|pdf))\b[^.\n]{0,40}\bfrom\b[^.\n]{0,30}\b(the )?repo\b/i.exec(line);
    if (m) {
      failures.push(
        `${file}:${n + 1}: tells the reader to fetch "${m[2]}" from the repo. `
        + 'Noah is iPad-first (§2) — ATTACH the file instead of naming a path on a machine he is not on.',
      );
    }
  });
}

/* ================================================================== *
 * ACKNOWLEDGED — no script can judge these
 * ================================================================== */

const MUST_ACK = [
  /**
   * A PUSH IS NOT A RELEASE, and this obligation exists because that sentence
   * was learned the expensive way on 2026-08-04.
   *
   * fauxplane pushed four releases — 1.24.1, 1.25.0, 1.25.1, 1.26.0 — and
   * verified each one the way the lessons demand: read the REMOTE, confirm the
   * range line, confirm the SHA. Every push was real. Every DEPLOY had failed,
   * on a CI gate added the same afternoon. Noah's device sat on 1.24.0 for four
   * releases while each was reported as shipped, and it surfaced only when he
   * asked "What. Button." about a feature that had never left the branch.
   *
   * `deploy-url` above covers reading a log you already opened. This covers the
   * step before it: opening one AT ALL, for the exact commit, on the branch
   * that deploys. Those are different failures — the first is misreading
   * evidence, the second is never gathering it — and the second is the one that
   * hid for four releases, because `git push` succeeding feels like completion.
   */
  ['deploy-green', 'For every branch I pushed, I checked the DEPLOY for that exact SHA '
    + 'and saw it CONCLUDE SUCCESSFULLY — not that the push landed, which is a different '
    + 'fact. A green push over a red deploy is a release that does not exist, and the '
    + 'owner finds out by using the old build.'],
  ['deploy-url', 'If anything deployed, I READ THE LOG and quoted the URL from it. '
    + 'A workflow exiting 0 is not evidence — a gracefully-skipped deploy also exits 0, '
    + 'so I checked whether the steps RAN or were SKIPPED.'],
  ['evidence', 'Every claim I make about external state — secrets, projects, permissions, '
    + 'whether a thing exists — cites the log line or response it came from. '
    + 'No claim that makes it the owner\'s problem goes out on inference (§5b, §10).'],
  ['attachments', 'Every file I ask him to act on is ATTACHED, not described by path (§2).'],
  ['manual-steps', 'Every manual step I hand over I have either verified end to end, or '
    + 'I have said plainly why I could not (§6). No goose chases.'],
];

const missing = MUST_ACK.filter(([id]) => !ack.has(id));

/* ================================================================== *
 * report
 * ================================================================== */

console.log(`=== handoff gate · ${NAME} ===`);
for (const p of passed) console.log(`  ✓ ${p}`);
for (const n of notes) console.log(`  · ${n}`);

if (missing.length) {
  console.log(`\nNOT YET ACKNOWLEDGED (${missing.length}) — read each, then re-run with --ack:`);
  for (const [id, text] of missing) {
    console.log(`\n  [${id}]`);
    for (const line of wrap(text, 74)) console.log(`      ${line}`);
  }
  // `ri` indexes `argv` (already sliced by 2). Reading process.argv[ri + 1]
  // here printed this script's own path as the --repo value, i.e. the one
  // line whose whole job is to be copy-pasteable was not.
  console.log(`\n  Re-run: node handoff-check.mjs --repo ${argv[ri + 1] || '.'} --ack=${MUST_ACK.map(([i]) => i).join(',')}`);
  console.log('\n  These are ASSERTIONS, not measurements — the script cannot read your draft.');
  console.log('  Saying them is cheap; skipping them without noticing is what actually happened.');
  failures.push(`${missing.length} handoff obligation(s) not acknowledged.`);
} else {
  console.log(`  ✓ all ${MUST_ACK.length} handoff obligations acknowledged`);
}

function wrap(s, w) {
  const out = [];
  let line = '';
  for (const word of s.split(' ')) {
    if ((line + word).length > w) { out.push(line.trimEnd()); line = ''; }
    line += `${word} `;
  }
  if (line.trim()) out.push(line.trimEnd());
  return out;
}

if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nLESSONS §26: the gated rules held all session and the prose rules all lost.');
  console.log('Exiting non-zero.');
  process.exit(1);
}
console.log('\nPASS — the handoff carries its URL, its version, and its evidence.');
