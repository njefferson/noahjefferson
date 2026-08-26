// palette-check.mjs — the cross-app palette gate (Doctrine §4, PALETTES.md).
//
// EXITS NON-ZERO on any hard-floor failure. Same reason a11y-gate.mjs does: a
// checker that prints "FAIL" and exits 0 is a reporter, and a reporter lets a
// broken palette ship.
//
// It takes palettes described in ROLES, not in one app's token names, so every
// app in the family can run the same instrument against its own reskin:
//
//   node palette-check.mjs palettes/mine.json
//   node palette-check.mjs palettes/mine.json --verbose
//
// SPEC SHAPE — one entry per theme (a "palette family" is two entries, its dark
// and its light). Every field is a CSS colour string; rails may be rgba():
//
//   {
//     "instrument-night": {
//       "kind": "app",                  // "app" (surface ladder) | "tiles" (hub-style)
//       "page":     "#1a1a1a",
//       "pageAlt":  "#232323",          // the gradient's other stop, if any
//       "surfaces": ["#3a3a3a", "#414141", "#484848"],   // rest, raised, pressed
//       "rail":     "rgba(255,255,255,.62)",             // load-bearing control edge
//       "hairline": "rgba(255,255,255,.17)",             // decorative, exempt
//       "text":     ["#eaeaea", "#d2d2d2", "#c1c1c1"],   // primary, secondary, tertiary
//       "accents":  { "primary": "#9fc2f5" },            // >=1; all are checked AS TEXT
//       "onAccent": "#10233d",          // text ON the accent fill — a primary button
//       "accentSoftAlpha": 0.15         // if the app tints a fill with its accent
//     }
//   }
//
// WHY ROLES: an app that calls its tokens --paper/--ink still has a page, a
// surface ladder, a rail and a text scale. Naming the roles is what lets one
// gate serve every app instead of each app growing its own half-checked copy.

import { readFileSync } from 'node:fs';

/* ---------- colour maths (WCAG 2.x; run, never estimated) ---------- */
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const Lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const x = Lum(a), y = Lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const composite = (ink, a, bg) => [0, 1, 2].map((i) => ink[i] * a + bg[i] * (1 - a));

// Accepts "#rrggbb" or "rgba(r, g, b, a)" / "rgb(r, g, b)".
function parseColor(s) {
  if (typeof s !== 'string') throw new Error(`not a colour: ${JSON.stringify(s)}`);
  const t = s.trim();
  if (t.startsWith('#')) {
    if (!/^#[0-9a-fA-F]{6}$/.test(t)) throw new Error(`only 6-digit hex is supported: ${t}`);
    return { ink: hex(t), alpha: 1 };
  }
  const n = (t.match(/[\d.]+/g) || []).map(Number);
  if (n.length < 3) throw new Error(`unparseable colour: ${t}`);
  return { ink: n.slice(0, 3), alpha: n.length > 3 ? n[3] : 1 };
}
// A translucent token has no colour of its own — resolve it against its backdrop.
const resolve = (c, bg) => (c.alpha >= 1 ? c.ink : composite(c.ink, c.alpha, bg));

/* ---------- Oklab, for chroma (how tinted is the chrome?) ---------- */
function oklch(rgb) {
  const [r, g, b] = rgb.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, C: Math.hypot(A, B) };
}

/* ---------- CVD simulation (Machado 2009, severity 1.0) + CIELAB dE76 ---------- */
const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
function toLab([r, g, b]) {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
function simulate(rgb, matrix) {
  const l = rgb.map(lin);
  const out = matrix.map((row) => row[0] * l[0] + row[1] * l[1] + row[2] * l[2]);
  const gamma = (v) => {
    v = Math.max(0, Math.min(1, v));
    return (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
  };
  return out.map(gamma);
}
const deltaE = (a, b) => {
  const x = toLab(a), y = toLab(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

/* ---------- thresholds (PALETTES.md §2) ---------- */
const FLOOR = {
  text: 4.6,   // AA 4.5 + headroom, because a value specced AT the line drifts under it
  rail: 3.4,   // 1.4.11 is 3.0; a 1px edge renders ~0.15 below its arithmetic
  ring: 3.0,   // focus indicator against whatever it circles
};
const ASPIRE = { textAAA: 7.0, tertiary: 5.0, fill: 1.5, chroma: 0.02, peak: 15.0 };

/* The fill names this file uses, in the CSS-role spelling an app's own gate
   reports. Only needed where a pairing key is built. */
const ROLE_NAME = {
  page: '--page', pageAlt: '--page-alt',
  surface: '--surface-1', surface2: '--surface-2', surface3: '--surface-3',
};

/* ---------- the gate ---------- */
function checkPalette(name, p, verbose, renders) {
  const fails = [], notes = [], lines = [];

  /*
    ---- WHAT THE APP ACTUALLY PAINTS ----

    `renders` is the list of role pairings the app was OBSERVED to render, in
    "--text-2 on --accent-soft" form. When a spec supplies it, a pairing that
    misses a floor and is NOT on the list becomes a note rather than a failure —
    because it is a forecast about a screen nobody has built, not a defect on a
    screen somebody ships.

    WHY IT MATTERS. This gate measures the full cross product of roles, which is
    what makes a palette PORTABLE: cleared against every pairing, it can be
    dropped into any app that paints role tokens with no browser run at all.
    Cleared against only the eighteen pairings one app happens to paint today,
    it stops being valid the first time somebody puts a hint on a highlighted
    row. Both facts are worth having, and they are not the same severity.

    Omit it and everything is hard, which is what every other repo gets today.

    The list must be MEASURED, never typed — MoleBridge's comes out of its own
    accessibility gate, which reverse-maps every rendered colour to the token it
    came from, and a `--pairs` mode fails when the recorded list and the
    observed one differ.
  */
  const renderedSet = Array.isArray(renders) ? new Set(renders) : null;
  const floorFail = (pairing, message) => {
    if (renderedSet === null || renderedSet.has(pairing)) fails.push(message);
    else notes.push(`${message} — not painted by this app today, so it is a forecast rather than a defect`);
  };
  const kind = p.kind === 'tiles' ? 'tiles' : 'app';

  const page = parseColor(p.page).ink;
  const pageAlt = p.pageAlt ? parseColor(p.pageAlt).ink : page;
  const surfaces = (p.surfaces || []).map((s) => parseColor(s).ink);
  if (!surfaces.length) fails.push(`${name}: no surfaces declared`);
  const text = (p.text || []).map((t) => parseColor(t).ink);
  if (!text.length) fails.push(`${name}: no text tokens declared`);
  const accents = Object.entries(p.accents || {}).map(([k, v]) => [k, parseColor(v).ink]);

  // Every fill a foreground can legitimately land on.
  const fills = [['page', page], ['pageAlt', pageAlt],
    ...surfaces.map((s, i) => [`surface${i ? i + 1 : ''}`, s])];

  /* 1. text on every fill */
  let worstText = Infinity, worstTextWhere = '';
  const names = ['text', 'text-2', 'text-3', 'text-4'];
  for (const [i, t] of text.entries())
    for (const [fn, fc] of fills) {
      const r = contrast(t, fc);
      if (r < worstText) { worstText = r; worstTextWhere = `${names[i]} on ${fn}`; }
      if (r < FLOOR.text) fails.push(`${name}: ${names[i]} on ${fn} = ${r.toFixed(2)} (floor ${FLOOR.text})`);
      if (verbose) lines.push(`    ${names[i]} on ${fn}: ${r.toFixed(2)}`);
    }

  /* 2. accents AS TEXT (they label things — "Open →", links, counts) */
  for (const [an, ac] of accents)
    for (const [fn, fc] of fills) {
      const r = contrast(ac, fc);
      if (r < worstText) { worstText = r; worstTextWhere = `${an} on ${fn}`; }
      if (r < FLOOR.text) fails.push(`${name}: accent ${an} as text on ${fn} = ${r.toFixed(2)}`);
      if (r < FLOOR.ring) fails.push(`${name}: accent ${an} as focus ring on ${fn} = ${r.toFixed(2)}`);
    }

  /* 3. the rail, composited against each fill it edges */
  let worstRail = Infinity, worstRailWhere = '';
  if (p.rail) {
    const rail = parseColor(p.rail);
    for (const [fn, fc] of fills) {
      const r = contrast(resolve(rail, fc), fc);
      if (r < worstRail) { worstRail = r; worstRailWhere = fn; }
      if (r < FLOOR.rail) fails.push(`${name}: rail on ${fn} = ${r.toFixed(2)} (floor ${FLOOR.rail})`);
    }
  } else notes.push(`${name}: no rail declared — nothing carries control boundaries`);

  /* 4. hierarchy STRICTLY ordered on every fill, and audible */
  for (const [fn, fc] of fills)
    for (let i = 1; i < text.length; i++)
      if (!(contrast(text[i - 1], fc) > contrast(text[i], fc)))
        fails.push(`${name}: hierarchy inverted on ${fn} — ${names[i - 1]} is not louder than ${names[i]}`);
  // Two tokens closer than ~2.3 ΔE are one token wearing two names.
  for (let i = 1; i < text.length; i++) {
    const d = deltaE(text[i - 1], text[i]);
    if (d < 2.3) fails.push(`${name}: ${names[i - 1]} and ${names[i]} differ by ΔE ${d.toFixed(1)} — below JND, indistinguishable`);
    else if (d < 4) notes.push(`${name}: ${names[i - 1]}→${names[i]} step is faint (ΔE ${d.toFixed(1)})`);
  }

  /* 5. the surface ladder.
     "app" surfaces are an ELEVATION ladder — rest, raised, pressed — and must
     step monotonically away from the page, or "higher" stops meaning anything.
     "tiles" surfaces are STATES (rest, hover) and carry no elevation ordering:
     a light-theme hover legitimately darkens TOWARD the page. Requiring
     monotonicity there is the rule over-applied — it flagged a correct hub
     hover, and tempted a fix by mislabelling which surface was which. What a
     state ladder actually owes is being SEEN: a hover nobody can perceive is
     not a hover. */
  const dist = surfaces.map((s) => contrast(s, page));
  if (kind === 'app') {
    for (let i = 1; i < dist.length; i++)
      if (!(dist[i] > dist[i - 1]))
        fails.push(`${name}: fill ladder not monotonic at step ${i + 1} (${dist.map((d) => d.toFixed(2)).join(' / ')})`);
  } else {
    for (let i = 1; i < surfaces.length; i++) {
      const d = deltaE(surfaces[i - 1], surfaces[i]);
      if (d < 2.3) fails.push(`${name}: surface states ${i} and ${i + 1} differ by ΔE ${d.toFixed(1)} — below JND, the state is invisible`);
    }
  }

  /* 6. text on an accent-tinted fill (a real regression source)

     THE WHOLE LADDER, not just text[0]. It checked the primary only, and an
     app rendering text-2 on an accent-soft panel — a hint under a highlighted
     row, a secondary line in a selected card — was outside what this measured.
     Found by instrumenting MoleBridge's accessibility gate to reverse-map every
     rendered colour to the role token it came from and reading off the pairings
     the app ACTUALLY paints: `--text-2 on --accent-soft` was one of eighteen,
     and this gate had never looked at it. */
  if (p.accentSoftAlpha && accents.length && text.length) {
    const [, primary] = accents[0];
    for (const [fn, fc] of fills) {
      const tinted = composite(primary, p.accentSoftAlpha, fc);
      for (const [i, t] of text.entries()) {
        const r = contrast(t, tinted);
        if (r < FLOOR.text) {
          // THE FILL IS PART OF THE KEY. A tint over the page and the same tint
          // over surface-3 are different colours with different contrast, and a
          // key that dropped the fill turned three real near-misses on screens
          // nobody has built into three reported defects.
          floorFail(
            `--${names[i]} on --accent-soft over ${ROLE_NAME[fn] ?? '--' + fn}`,
            `${name}: ${names[i]} on accent-tinted ${fn} = ${r.toFixed(2)}`,
          );
        }
        if (verbose) lines.push(`    ${names[i]} on accent-tinted ${fn}: ${r.toFixed(2)}`);
      }
    }
  }

  /* 6b. THE TEXT ON THE ACCENT FILL, which is the loudest pairing in an app and
     was measured by nothing here.

     A primary button is the accent as a FILL with its own text colour on top,
     and that colour cannot be one of the text tokens: in a light theme the page
     is a warm tan and tan lettering on a dark green button is a pairing nobody
     chose, it just falls out of borrowing a token for a job it was not for. So
     an app declares `onAccent` and this measures it.

     Optional, because a palette with no accent-filled control does not need
     one — but declared-and-unmeasured is the state this was in, so an app that
     declares it gets it checked, and one that renders it without declaring it
     is caught by its own role-pairing gate rather than here. */
  if (p.onAccent && accents.length) {
    const onAccent = parseColor(p.onAccent).ink;
    for (const [an, ac] of accents) {
      const r = contrast(onAccent, ac);
      if (r < FLOOR.text) fails.push(`${name}: onAccent on accent ${an} = ${r.toFixed(2)} (floor ${FLOOR.text})`);
      else if (verbose) lines.push(`    onAccent on accent ${an}: ${r.toFixed(2)}`);
    }
  } else if (accents.length) {
    notes.push(`${name}: no onAccent declared — if anything paints text on the accent fill, nothing here measures it`);
  }

  /* 7. aspirations — reported, never fatal */
  const fillSep = dist.length ? dist[0] : 0;
  const chroma = Math.max(...[page, ...surfaces].map((c) => oklch(c).C));
  const peak = Math.max(...text.map((t) => contrast(t, page)));
  const aspirations = [
    [`fill separation ${fillSep.toFixed(2)}`, fillSep >= ASPIRE.fill],
    [`primary text AAA (${contrast(text[0], surfaces[0] || page).toFixed(2)})`,
      contrast(text[0], surfaces[0] || page) >= ASPIRE.textAAA],
    [`tertiary >= 5:1 (${text.length > 2 ? worstOf(text[2], fills).toFixed(2) : 'n/a'})`,
      text.length > 2 ? worstOf(text[2], fills) >= ASPIRE.tertiary : true],
    [`chrome chroma ${chroma.toFixed(4)}`, chroma <= ASPIRE.chroma],
    [`peak contrast ${peak.toFixed(1)} (halation cap ${ASPIRE.peak})`, peak <= ASPIRE.peak],
  ];

  /* 8. CVD — only meaningful for a categorical accent SET */
  let cvd = null;
  if (accents.length >= 3) {
    cvd = {};
    for (const [cond, m] of Object.entries(CVD)) {
      let min = Infinity, pair = '';
      for (let i = 0; i < accents.length; i++)
        for (let j = i + 1; j < accents.length; j++) {
          const d = deltaE(simulate(accents[i][1], m), simulate(accents[j][1], m));
          if (d < min) { min = d; pair = `${accents[i][0]}–${accents[j][0]}`; }
        }
      cvd[cond] = { min, pair };
      if (min < 10) notes.push(`${name}: ${cond} cannot separate ${pair} (ΔE ${min.toFixed(1)}) — never let those two carry meaning by colour alone`);
    }
  }

  return { name, kind, fails, notes, lines, worstText, worstTextWhere,
    worstRail, worstRailWhere, fillSep, chroma, peak, aspirations, cvd };
}
const worstOf = (c, fills) => Math.min(...fills.map(([, f]) => contrast(c, f)));

/* ---------- run ---------- */
const [, , specPath, ...flags] = process.argv;
if (!specPath) {
  console.error('usage: node palette-check.mjs <spec.json> [--verbose]');
  process.exit(2);
}
const verbose = flags.includes('--verbose');
let spec;
try {
  spec = JSON.parse(readFileSync(specPath, 'utf8'));
} catch (e) {
  console.error(`cannot read ${specPath}: ${e.message}`);
  process.exit(2);
}

// Keys beginning with "_" are commentary, not palettes. `_renders` is the one
// exception with meaning: the role pairings the app was OBSERVED to paint,
// shared by every palette in the file because which roles pair is a fact about
// the app rather than about the colours. An entry may override it with its own
// `renders` if one palette is used somewhere the others are not.
const entries = Object.entries(spec).filter(([k, v]) => !k.startsWith('_') && v && typeof v === 'object');
if (!entries.length) { console.error(`${specPath} declares no palettes`); process.exit(2); }
let results;
try {
  results = entries.map(([name, p]) => checkPalette(name, p, verbose, p.renders ?? spec._renders));
} catch (e) {
  // A malformed spec is a FAILURE, not a crash to be shrugged at — say which
  // palette, and exit non-zero like every other failure path.
  console.error(`spec error: ${e.message}`);
  process.exit(1);
}
let failed = 0;
for (const r of results) {
  console.log(`\n${r.name}`);
  console.log(`  worst text ${r.worstText.toFixed(2)} (${r.worstTextWhere})` +
    (Number.isFinite(r.worstRail) ? `   worst rail ${r.worstRail.toFixed(2)} (${r.worstRailWhere})` : ''));
  console.log(`  aspirations: ` + r.aspirations.map(([t, ok]) => `${ok ? '✓' : '·'} ${t}`).join('   '));
  if (r.cvd) console.log(`  CVD minima: ` +
    Object.entries(r.cvd).map(([c, v]) => `${c} ${v.min.toFixed(1)} (${v.pair})`).join('   '));
  if (verbose) r.lines.forEach((l) => console.log(l));
  r.notes.forEach((n) => console.log(`  NOTE  ${n}`));
  if (r.fails.length) { failed += r.fails.length; r.fails.forEach((f) => console.log(`  FAIL  ${f}`)); }
}
console.log('');
if (failed) {
  console.log(`${failed} hard-floor failure(s) across ${results.length} palette(s).`);
  process.exit(1);
}
console.log(`All ${results.length} palette(s) clear every hard floor.`);
