// a11y-gate.mjs — the accessibility gate Doctrine §4 requires.
//
// This EXITS NON-ZERO on any failure. That is the whole point: a checker that
// prints "FAIL" and exits 0 is a reporter, and §4 claimed a gate for months
// while only a reporter existed.
//
// It runs every deployed page in BOTH themes, computes contrast rather than
// eyeballing it, and FAILS LOUDLY when a registered selector goes missing —
// because silently skipping a renamed class removes coverage with no signal.
//
//   node a11y-gate.mjs            check everything, exit non-zero on failure
//   node a11y-gate.mjs --verbose  also print every passing measurement
//
// Adding a new foreground/background pair? Add it to REGISTRY below in the SAME
// commit that introduces it (§4).

import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

// The session sandbox ships a Chromium at a fixed path (Doctrine §11) and
// playwright-core is pinned to the matching revision — see package.json.
// A CI runner has no such path, so fall back to playwright's own download
// there. Explicit rather than clever: if the sandbox binary is absent we say so
// and let playwright resolve it, instead of failing with a confusing ENOENT.
const SANDBOX_CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const launchOpts = { args: ['--no-sandbox'] };
if (existsSync(SANDBOX_CHROMIUM)) launchOpts.executablePath = SANDBOX_CHROMIUM;

const VERBOSE = process.argv.includes('--verbose');
const axeSrc = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

// Every deployed page. accessibility.html is the shared statement every sibling
// app's About screen links to — it went unscanned by anything until 2026-07-28.
// `registry`  — text colour vs background, AA (4.5:1, or 3:1 for large text).
// `nonText`   — WCAG 1.4.11: the visual information that identifies a control
//               (its boundary or its fill) needs 3:1 against what is adjacent.
//               Text contrast passing tells you nothing about whether the
//               control's own edge is visible. Same loud-failure rule as
//               `registry`: a selector that stops matching FAILS, never skipped.
//
//               LIVE since 2026-07-29 (F-07, the owner's call): --line was raised to
//               computed 3:1 values in both themes, so these selectors are
//               registered and guarded. Adding a new bordered control? Register
//               it here in the SAME commit that introduces it — the same rule
//               the text registry above follows.
const PAGES = [
  { file: 'public/index.html',
    registry: ['.tag','.foot','.sub','.vchip','.app-name','.app-sub','.go','.group-title','.label','.name','h1','h2'],
    // .ns-list a (the no-JS fallback) is NOT here: it lives inside <noscript>,
    // so with JS running its content never enters the DOM and the selector
    // cannot match — the loud-failure rule caught exactly that on first run.
    // It borrows the same --line/--surface tokens as the three below, so it is
    // covered by proxy; measuring it directly would need a JS-disabled pass.
    nonText:  ['a.tile','a.approw','.vchip'] },
  { file: 'public/accessibility.html',
    // .applist / .applist strong added 2026-08-02 with the single-source app
    // list that replaced three drifting copies. §4: a new fg/bg pair joins the
    // gate in the SAME commit as the markup that introduces it.
    registry: ['.foot','.sub','.lead','.apps','.applist li','.applist strong','.contact-email','h1','h2'],
    // .apps is a non-interactive grouping panel and the links inside identify
    // themselves by text that already passes AA — no boundary is REQUIRED to
    // identify a component here, so nothing is registered (WCAG 1.4.11 scope).
    nonText:  [] },
];

const THEMES = ['light', 'dark'];

// Small-phone-at-200%-text is the case that broke a sibling app's place card
// (§4). 320px wide is the narrowest phone worth supporting.
const VIEWPORTS = [
  { name: 'phone',      width: 390, height: 844 },
  { name: 'phone-320',  width: 320, height: 568 },
];

const MIN_TARGET = 44; // §4: targets >= 44px
// §4 tremor: overshoot is the failure mode, so size alone is not enough — two
// targets with no gap mean a 2px miss lands on the wrong control. 8px is OUR
// floor (the common platform-guidance minimum). WCAG 2.5.8 treats spacing as
// compensation for insufficient SIZE rather than as an absolute gap, so this is
// a stricter rule of ours in a different axis, not a WCAG citation.
const MIN_SPACING = 8;

const failures = [];
const notes = [];
const exemptions = new Set();
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

const browser = await chromium.launch(launchOpts);

try {
  for (const { file, registry, nonText } of PAGES) {
    for (const theme of THEMES) {
      const page = await browser.newPage({
        viewport: VIEWPORTS[0],
        deviceScaleFactor: 2,
        colorScheme: theme,
      });
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e)));
      const where = `${file} [${theme}]`;

      await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axeSrc });

      // ---- axe ------------------------------------------------------------
      const axeResult = await page.evaluate(async () =>
        await axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] },
        })
      );
      for (const v of axeResult.violations) {
        fail(where, `axe [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node${v.nodes.length===1?'':'s'})`);
        for (const n of v.nodes.slice(0, 4)) notes.push(`      ${n.target.join(' ')}`);
      }
      // axe drops colour-contrast to `incomplete` for transformed elements
      // rather than failing it — a known instrument limitation (LESSONS §5).
      // That is exactly why the REGISTRY below is computed by hand.
      if (VERBOSE) console.log(`  ${where} axe: ${axeResult.violations.length} violations, ${axeResult.passes.length} passes, incomplete: ${axeResult.incomplete.map(i=>i.id).join(', ')||'none'}`);

      // ---- computed contrast over the registry ----------------------------
      const contrast = await page.evaluate(({ sels, nonTextSels }) => {
        const lum = c => {
          const [r,g,b] = c.map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055) ** 2.4; });
          return 0.2126*r + 0.7152*g + 0.0722*b;
        };
        const ratio = (fg, bg) => {
          const L1 = lum(fg), L2 = lum(bg);
          return (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
        };
        // Treat anything with alpha < 1 as NOT opaque and keep walking up —
        // measuring against a translucent layer gives a number that is wrong in
        // a direction nobody notices.
        const parse = s => {
          const m = s.match(/[\d.]+/g);
          if (!m) return null;
          const n = m.map(Number);
          return { rgb: n.slice(0,3), a: n.length > 3 ? n[3] : 1 };
        };
        // The page background is a GRADIENT, so there is no single colour to
        // measure against. Rather than guess, collect every candidate colour the
        // text could sit on — opaque background-colors plus every colour stop of
        // any background-image gradient — and let the caller take the WORST
        // case. Conservative by construction: if the worst stop passes, every
        // point of the gradient passes.
        const bgCandidates = el => {
          const out = [];
          let e = el;
          while (e) {
            const cs = getComputedStyle(e);
            const img = cs.backgroundImage;
            if (img && img !== 'none') {
              for (const m of img.matchAll(/rgba?\(([\d.,\s]+)\)/g)) {
                const p = parse(m[0]);
                if (p && p.a > 0.95) out.push(p.rgb);
              }
            }
            const p = parse(cs.backgroundColor);
            if (p && p.a === 1) { out.push(p.rgb); break; } // opaque layer blocks anything behind
            e = e.parentElement;
          }
          return out;
        };
        const out = {};
        for (const s of sels) {
          const el = document.querySelector(s);
          if (!el) { out[s] = { missing: true }; continue; }
          const cs = getComputedStyle(el);
          const cands = bgCandidates(el);
          const fg = parse(cs.color);
          if (!cands.length || !fg) { out[s] = { undetermined: true }; continue; }
          const px = parseFloat(cs.fontSize);
          const weight = parseInt(cs.fontWeight, 10) || 400;
          // WCAG AA: 3:1 for large text (>=24px, or >=18.66px bold), else 4.5:1
          const isLarge = px >= 24 || (px >= 18.66 && weight >= 700);
          const ratios = cands.map(bg => ratio(fg.rgb, bg));
          out[s] = {
            ratio: +Math.min(...ratios).toFixed(2), // worst point of the gradient
            against: cands.length,
            required: isLarge ? 3 : 4.5,
            size: cs.fontSize, weight, isLarge,
          };
        }
        // WCAG 1.4.11 Non-text Contrast: 3:1 for the visual information needed
        // to identify a UI component. Measured against the same worst-case
        // gradient candidates as text, and never guessed.
        const outNT = {};
        for (const s of nonTextSels) {
          const el = document.querySelector(s);
          if (!el) { outNT[s] = { missing: true }; continue; }
          const cs = getComputedStyle(el);
          // 1.4.11 asks whether the component is IDENTIFIABLE, not whether one
          // particular property passes. A filled card is bounded by its surface
          // colour as much as by its border, so take the BEST available
          // boundary signal — border-vs-outside, or fill-vs-outside — and
          // require 3:1 of that. Measuring the border alone fails cards that
          // are perfectly visible by their fill.
          const outside = bgCandidates(el.parentElement || el);
          if (!outside.length) { outNT[s] = { undetermined: true }; continue; }
          const worst = rgb => Math.min(...outside.map(bg => ratio(rgb, bg)));
          const signals = {};
          const bw = parseFloat(cs.borderTopWidth) || 0;
          const edge = parse(cs.borderTopColor);
          if (bw > 0 && cs.borderTopStyle !== 'none' && edge && edge.a === 1) {
            signals.border = worst(edge.rgb);
          }
          const fill = parse(cs.backgroundColor);
          if (fill && fill.a === 1) signals.fill = worst(fill.rgb);
          if (!Object.keys(signals).length) { outNT[s] = { undetermined: true }; continue; }
          const best = Object.entries(signals).sort((a, b) => b[1] - a[1])[0];
          outNT[s] = {
            ratio: +best[1].toFixed(2),
            via: best[0],
            all: Object.fromEntries(Object.entries(signals).map(([k, v]) => [k, +v.toFixed(2)])),
            required: 3,
          };
        }
        return { text: out, nonText: outNT };
      }, { sels: registry, nonTextSels: nonText });

      for (const [sel, r] of Object.entries(contrast.nonText)) {
        if (r.missing) {
          fail(where, `non-text registry selector "${sel}" matched nothing — restore it or remove it from nonText in a11y-gate.mjs`);
        } else if (r.undetermined) {
          fail(where, `could not determine an opaque boundary or background for "${sel}" — refusing to guess`);
        } else if (r.ratio < r.required) {
          const detail = Object.entries(r.all).map(([k, v]) => `${k} ${v}:1`).join(', ');
          fail(where, `non-text contrast ${sel} best boundary ${r.ratio}:1 via ${r.via} (needs ${r.required}:1 — WCAG 1.4.11; measured ${detail})`);
        } else if (VERBOSE) {
          console.log(`  ${where} non-text ${sel} ${r.ratio}:1 via ${r.via} ok`);
        }
      }

      for (const [sel, r] of Object.entries(contrast.text)) {
        if (r.missing) {
          // §4: a registered pair that stops matching must FAIL, not be skipped.
          fail(where, `registry selector "${sel}" matched nothing — either restore it or remove it from REGISTRY in a11y-gate.mjs`);
        } else if (r.undetermined) {
          fail(where, `could not determine an opaque background for "${sel}" — refusing to guess`);
        } else if (r.ratio < r.required) {
          fail(where, `contrast ${sel} ${r.ratio}:1 (needs ${r.required}:1 at ${r.size}/${r.weight})`);
        } else if (VERBOSE) {
          console.log(`  ${where} ${sel.padEnd(16)} ${String(r.ratio).padStart(6)}:1  needs ${r.required}  PASS`);
        }
      }

      // ---- structural checks ---------------------------------------------
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const custom = await page.evaluate(({ minTarget, minSpacing }) => {
          const inter = [...document.querySelectorAll('a[href],button,[role="button"]')];
          const visible = el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          };
          // WCAG 2.2 SC 2.5.8 "Inline" exception: a target inside a sentence,
          // whose size is constrained by the line-height of the surrounding
          // text, is exempt. Forcing 44px on a link mid-paragraph breaks the
          // text flow and makes the page WORSE. Exemptions are REPORTED, never
          // silent — see the summary at the end of a run.
          // Must be text IMMEDIATELY adjacent — on the same line. A link that
          // merely shares a parent with text elsewhere (e.g. sitting alone
          // before a <br>) is standalone and gets no exemption: nothing
          // constrains its height, so it can and should be 44px.
          const isInlineInText = el => {
            if (getComputedStyle(el).display !== 'inline') return false;
            // Walk one direction past whitespace-only text nodes. Stop at the
            // first thing that matters: real text means same sentence; a <br>
            // or any element means a new line, so no exemption.
            const hasAdjacentText = (node, dir) => {
              while (node) {
                if (node.nodeType === 3) {
                  if (node.textContent.trim()) return true;        // real text beside it
                } else {
                  return false;                                     // <br> or any element
                }
                node = dir === 'prev' ? node.previousSibling : node.nextSibling;
              }
              return false;
            };
            return hasAdjacentText(el.previousSibling, 'prev')
                || hasAdjacentText(el.nextSibling, 'next');
          };
          const measured = inter.filter(visible).map(el => {
            const r = el.getBoundingClientRect();
            return {
              el,
              t: el.textContent.trim().slice(0,32),
              w: +r.width.toFixed(1), h: +r.height.toFixed(1),
              r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
              tooSmall: r.width < minTarget || r.height < minTarget,
              inline: isInlineInText(el),
            };
          });
          // §4 tremor: TARGETS ARE SPACED, NOT ONLY SIZED. Gap between two
          // axis-aligned rects — 0 when they touch or overlap. If they overlap
          // on one axis, dx or dy is 0 and this reduces to the distance on the
          // other, which is the gap a finger actually has to clear.
          const gapBetween = (a, b) => {
            const dx = Math.max(0, a.left - b.right, b.left - a.right);
            const dy = Math.max(0, a.top - b.bottom, b.top - a.bottom);
            return Math.hypot(dx, dy);
          };
          // Inline-in-a-sentence targets are exempt from spacing for the same
          // reason they are exempt from size: the line box constrains them, and
          // forcing gaps mid-paragraph shreds the text. Exemption is reported.
          const spaceable = measured.filter(m => !m.inline);
          const tight = [];
          for (let i = 0; i < spaceable.length; i++) {
            for (let j = i + 1; j < spaceable.length; j++) {
              const gap = gapBetween(spaceable[i].r, spaceable[j].r);
              if (gap < minSpacing) {
                tight.push({ a: spaceable[i].t, b: spaceable[j].t, gap: +gap.toFixed(1) });
              }
            }
          }
          const small   = measured.filter(m => m.tooSmall && !m.inline).map(({el,...m}) => m);
          const exempt  = measured.filter(m => m.tooSmall &&  m.inline).map(({el,...m}) => m);
          // An <img> is a fault only when it has NO alt attribute at all.
          // alt="" with aria-hidden="true" is the CORRECT pattern for a
          // decorative image — counting it as a failure trains people to
          // ignore the checker.
          const imgsNoAlt = [...document.querySelectorAll('img')]
            .filter(i => !i.hasAttribute('alt'))
            .map(i => i.getAttribute('src') || '(no src)');
          // WCAG 1.1.1: a <canvas> is non-text content and needs a text
          // alternative — an accessible name, or real fallback content between
          // the tags. "Drawing canvas" is not an alternative; it must describe
          // what is actually on it. INERT IN THIS REPO (the hub has no canvas)
          // and live in the app repos that share this gate — see ACCESSIBILITY.md.
          const canvasNoAlt = [...document.querySelectorAll('canvas')]
            .filter(c => !c.getAttribute('aria-label')
                      && !c.getAttribute('aria-labelledby')
                      && !c.getAttribute('title')
                      && !c.textContent.trim())
            .map(c => c.outerHTML.slice(0, 60));
          const linksNoName = inter
            .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title'))
            .map(el => el.outerHTML.slice(0, 60));
          return {
            smallTargets: small,
            tightTargets: tight,
            canvasNoAlt,
            inlineExempt: exempt,
            imgsNoAlt,
            linksNoName,
            lang: document.documentElement.lang,
            h1: document.querySelectorAll('h1').length,
          };
        }, { minTarget: MIN_TARGET, minSpacing: MIN_SPACING });

        const at = `${where} @${vp.name}`;
        for (const t of custom.smallTargets) {
          fail(at, `touch target "${t.t}" is ${t.w}x${t.h}px — §4 requires >= ${MIN_TARGET}px`);
        }
        for (const t of custom.tightTargets) {
          fail(at, `targets "${t.a}" and "${t.b}" are ${t.gap}px apart — §4 tremor requires >= ${MIN_SPACING}px between targets`);
        }
        for (const t of custom.inlineExempt) {
          exemptions.add(`${t.t} (${t.w}x${t.h}px, inline in a sentence — WCAG 2.2 SC 2.5.8)`);
        }
        for (const s of custom.imgsNoAlt) fail(at, `<img> has no alt attribute: ${s}`);
        for (const c of custom.canvasNoAlt) fail(at, `<canvas> has no text alternative (WCAG 1.1.1) — needs aria-label, aria-labelledby, or fallback content describing what it holds: ${c}`);
        for (const l of custom.linksNoName) fail(at, `interactive element has no accessible name: ${l}`);
        if (!custom.lang) fail(at, 'document has no lang attribute');
        if (custom.h1 !== 1) fail(at, `expected exactly one <h1>, found ${custom.h1}`);
        if (VERBOSE) console.log(`  ${at} targets ok, lang="${custom.lang}", h1=${custom.h1}`);
      }

      if (pageErrors.length) fail(where, `page errors: ${pageErrors.join(' | ')}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

console.log('=== a11y gate ===');
console.log(`pages: ${PAGES.length} x themes: ${THEMES.length} x viewports: ${VIEWPORTS.length}`);
if (exemptions.size) {
  console.log(`\nEXEMPTED (${exemptions.size}) — reported, never silent:`);
  for (const e of exemptions) console.log('  · ' + e);
  console.log('  §4 carries the inline exception explicitly (the owner, 2026-07-29; WCAG 2.2 SC 2.5.8).');
}
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log('  ✗ ' + f);
  if (notes.length) { console.log('\n  detail:'); for (const n of notes) console.log(n); }
  console.log('\nDoctrine §4: accessibility is a hard gate. This exits non-zero.');
  process.exit(1);
}
console.log(`PASS — no violations, all registered contrast pairs meet AA, all non-inline targets >= ${MIN_TARGET}px and >= ${MIN_SPACING}px apart.`);
