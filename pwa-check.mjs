// pwa-check.mjs — an app that caches itself must be able to say it is stale.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node pwa-check.mjs --repo ../myapp
//
// WHY (Doctrine §7h, LESSONS §31). Noah, 2026-08-03: "Knowing that the app could
// not show if it was old and stuck seems like something all my apps need to fix."
//
// The failure is invisible by construction — caching IS the business of not
// asking the network, so a stale app looks perfectly fine. It is just old. There
// is no symptom, no error, and the version on screen is the old one reporting
// itself accurately. Nobody finds this by using the app.
//
// HONEST ABOUT ITS CEILING. This reads source text; it cannot run the app. It
// catches NEVER IMPLEMENTED, which is the actual failure mode in every repo that
// has this defect today — not "implemented subtly wrong". The repo's own walk or
// end-to-end gate is what proves the path works, driven by a REAL second worker.
// Same bargain pin-check makes, and stated for the same reason.
//
// EXITS NON-ZERO on any failure.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : process.cwd();
const NAME = REPO.split('/').pop();

const failures = [];
const passed = [];
const notes = [];

const read = p => (existsSync(join(REPO, p)) ? readFileSync(join(REPO, p), 'utf8') : null);

// Where a static app keeps its worker. Not a search of the whole tree: a file
// called sw.js in node_modules is not this app's service worker.
const SW_PATHS = ['public/sw.js', 'sw.js', 'src/sw.js', 'public/service-worker.js', 'service-worker.js'];
const swPath = SW_PATHS.find(p => read(p) !== null);
const sw = swPath ? read(swPath) : null;

console.log(`=== pwa gate · ${NAME} ===`);

if (!sw) {
  console.log('\nno service worker — §7h does not apply, nothing to check.');
  process.exit(0);
}
notes.push(`service worker: ${swPath}`);

// Every .js/.mjs the app ships, so "does anything listen for an update" can be
// answered without guessing which file the UI lives in.
const collect = re => {
  const roots = ['public', 'src', 'app'].map(r => join(REPO, r)).filter(existsSync);
  const out = [];
  const walk = dir => {
    for (const e of readdirSync(dir)) {
      if (e === 'node_modules' || e === '.git') continue;
      const full = join(dir, e);
      if (statSync(full).isDirectory()) walk(full);
      else if (re.test(e) && full !== join(REPO, swPath)) out.push(readFileSync(full, 'utf8'));
    }
  };
  roots.forEach(walk);
  return out.join('\n');
};
const appSrc = collect(/\.(mjs|js|ts|jsx|tsx|html)$/);
const html = collect(/\.html$/);

// ---- 1. the new version must WAIT -----------------------------------------
//
// skipWaiting() in install is the default advice and it is the thing that makes
// staleness actively harmful: the open page keeps running the old HTML and
// modules while the new cache is swapped in underneath, and activate deletes the
// old cache, so the old page is then served NEW files. Old markup, new modules,
// no reload, nothing said.
const installBlock = /addEventListener\(\s*["']install["'][\s\S]*?\n\}\);/.exec(sw)?.[0] ?? '';
if (/skipWaiting/.test(installBlock)) {
  failures.push(
    `${swPath} calls skipWaiting() during install. The new worker then takes over under the OPEN page, `
    + 'which is still running the previous release\'s HTML and modules — and activate deletes the old cache, '
    + 'so that page is served NEW files from then on. Let it wait, and skipWaiting only on a message from the page (§7h.1).',
  );
} else {
  passed.push('the new worker waits rather than taking over under the open page');
}

// ...and there must be a way to release it, or "waits" means "never arrives".
if (!/skipWaiting/.test(sw)) {
  failures.push(
    `${swPath} never calls skipWaiting() at all, so a waiting worker can never be activated by the reader. `
    + '§7h.1 asks for a message handler that takes SKIP_WAITING from the page.',
  );
} else if (!/addEventListener\(\s*["']message["']/.test(sw)) {
  failures.push(
    `${swPath} calls skipWaiting() but has no "message" listener, so nothing the READER does can trigger it. `
    + 'The reader\'s decision is what releases the update (§7h.1).',
  );
} else {
  passed.push('the reader\'s decision is what releases the waiting worker');
}

// ---- 2. the app must NOTICE ------------------------------------------------
const noticesUpdate = /updatefound/.test(appSrc) || /registration\.waiting|reg\.waiting/.test(appSrc);
if (!noticesUpdate) {
  failures.push(
    'nothing in the app listens for a new version — no `updatefound`, no check of `registration.waiting`. '
    + 'A cached app cannot notice staleness on its own; that is what caching means (§7h.2).',
  );
} else {
  passed.push('the app notices when a new version arrives');
}

// ---- 3. ...and must TELL THE READER ---------------------------------------
//
// Noticing without saying is the state Intersecting Parallels was in when this
// was written: the diagnostic reported it and nothing else did. Nobody opens a
// diagnostic to discover they are running last week's build.
//
// Searched in the MARKUP, not in all source. §7h.2 asks for a standing
// indicator, which is markup — and searching everything makes this satisfiable
// by coincidence: an app that generates its patch notes into a .mjs will carry
// the words "new version" in a changelog entry and pass while telling nobody
// anything. That is exactly LESSONS §29, and it happened in this very gate on
// the repo it was written against. A check whose cheapest passing input is
// changelog prose is measuring the wrong thing.
const tellsReader = /new version/i.test(html);
if (!tellsReader) {
  failures.push(
    'the app never says the words "new version" anywhere a reader could see. Detecting an update and only '
    + 'recording it in a diagnostic is not telling anyone (§7h.2) — it needs a standing indicator with its own way out.',
  );
} else {
  passed.push('the reader is told, in words, that a new version is ready');
}

// ---- 4. the diagnostic reports cache state --------------------------------
// `caches?.keys()` counts. Optional chaining is the CORRECT way to touch the
// Cache API — it is absent in some privacy modes and in older WebViews — so a
// regex insisting on a bare dot fails the repos that guard it properly.
// Quietkeep writes `globalThis.caches?.keys()` and this said it read nothing.
if (!/caches\s*\??\.\s*keys\(\)/.test(appSrc)) {
  failures.push(
    'nothing reads `caches.keys()`, so the §7f diagnostic cannot say which copy of the app this device is holding. '
    + 'The version stamp alone cannot tell "current" from "what the cache still holds" (§7h.4).',
  );
} else {
  passed.push('the diagnostic can report which caches the device holds');
}

// ---- 5. the cache name carries the release (LESSONS §21) -------------------
// The WHOLE right-hand side, not the first string literal in it. §21's actual
// requirement is that the name CHANGES when the release does — and it is met by
// a semver, by a plain counter (`horizon-v57`), by an interpolation, by
// concatenation, and by a build-time placeholder. An earlier version of this
// check demanded a semver triplet and reported two of Noah's six apps as broken
// when both were fine. Two false positives out of six is how a gate gets
// ignored, which costs more than the check is worth.
//
// So this fails only on the case that is unambiguously wrong: one string
// literal, fixed, with nothing in it that could ever differ between releases.
const cacheExpr = /(?:const|let|var)\s+\w*CACHE\w*\s*=\s*([^;\n]+)/i.exec(sw)?.[1]?.trim();
const literalOnly = cacheExpr && /^[`"'][^`"']*[`"']$/.test(cacheExpr);
if (!cacheExpr) {
  notes.push('could not find a cache-name constant — check by hand that it carries the release');
} else if (literalOnly && !/\d/.test(cacheExpr) && !/\$\{/.test(cacheExpr)) {
  failures.push(
    `the cache name is the fixed string ${cacheExpr} — nothing in it changes between releases, so a new release `
    + 'reuses the same cache and can never replace what is already in it (hub LESSONS §21).',
  );
} else {
  passed.push(`the cache name can change between releases — ${cacheExpr}`);
}

for (const n of notes) console.log(`  · ${n}`);
for (const p of passed) console.log(`  ✓ ${p}`);

if (failures.length) {
  console.error(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('\nDoctrine §7h: an app that caches itself cannot notice it has gone stale.');
  console.error('The failure is invisible by construction — nobody finds it by using the app.');
  process.exit(1);
}

console.log('\nPASS — a new version waits, the reader is told, and the diagnostic can say which copy is held.');
