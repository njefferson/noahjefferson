#!/usr/bin/env node
// MARKDOWN TO A HOSTED PAGE, for this site's essays.
//
// PORTED FROM `Quietkeep/tools/doc-page.mjs` on 2026-08-31, at the owner's
// instruction, so that a piece written here can be published here rather than
// living inside an app's repo.
//
// **`convert()` below is that file's, character for character, and it must stay
// that way.** Two markdown converters in one family would drift, and the drift
// is invisible — both pages render and only one is right, which is the exact
// failure `privacy-mirror-check.mjs` exists for. If a converter bug is found,
// fix it in Quietkeep and re-copy; that repo has `thesis:check`, which
// regenerates its page and diffs it byte-for-byte, so it is the copy with a
// gate behind it. This file changes only what must differ between two sites:
// the palette, and the page shell.
//
// THE STYLES GO IN A FILE rather than a `<style>` block, and that is deliberate
// here even though this site has no CSP to refuse one. `public/_headers` says
// in its own words that a real policy "needs that script and the inline <style>
// extracted to files first" — so a new page that ships its styles externally is
// one less thing standing in the way of that, rather than one more.

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline markdown on already-escaped text. Order matters: code and links first
 *  so their contents are not re-processed, then bold before italic so `**` is
 *  consumed before a lone `*`. Doubled markers (`****x**`) are collapsed first —
 *  the doc uses them to mean plain bold. */
function inline(text) {
  let s = esc(text).replace(/\*{3,}/g, '**');
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) => `<a href="${url}">${t}</a>`);
  s = s.replace(/\*\*(.+?)\*\*/g, (_, b) => `<strong>${b}</strong>`);
  s = s.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, (_, pre, it) => `${pre}<em>${it}</em>`);
  // Any stray unbalanced ** left over reads as text, not a broken tag.
  return s.replace(/\*\*/g, '');
}

/** Leading-space count → list nesting depth (the doc nests at two spaces). */
const indentOf = (line) => (line.match(/^ */)?.[0].length ?? 0);

export function convert(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  const flushList = (marker) => {
    // Collect a run of list items at this indent; a deeper-indented run becomes a
    // nested list inside the last item.
    const baseIndent = indentOf(lines[i]);
    const tag = marker === 'ol' ? 'ol' : 'ul';
    const items = [];
    const re = marker === 'ol' ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
    while (i < lines.length) {
      const m = lines[i].match(re);
      if (!m || indentOf(lines[i]) < baseIndent) break;
      if (indentOf(lines[i]) > baseIndent) {
        // Nested list — recurse into the deeper block, appended to the last item.
        const nestMarker = /^\s*\d+\.\s/.test(lines[i]) ? 'ol' : 'ul';
        const nested = flushList(nestMarker);
        if (items.length) items[items.length - 1] += nested;
        continue;
      }
      // LAZY CONTINUATION LINES BELONG TO THE ITEM ABOVE THEM.
      //
      // This loop used to end the item at the newline and fall through to the
      // paragraph branch, which produced 33 single-item <ul>s each followed by
      // an orphaned <p> holding the rest of its own sentence — every wrapped
      // bullet in the document, live on the public page. Section 11's five
      // differentiator claims rendered as five separate lists all numbered "1".
      //
      // And the second symptom had the same cause: `inline()` was applied per
      // LINE, so emphasis opened on one line and closed on the next never
      // paired. `*(community-construct —` printed its asterisk as text. The raw
      // text is therefore joined FIRST and marked up once, which is the only
      // order in which a span can cross the wrap.
      //
      // A continuation is indented past the marker and does not itself start a
      // list item — that second clause is what keeps two-space NESTING working,
      // since the doc nests at the same indent it wraps at.
      let raw = m[2];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ''
        && indentOf(lines[i]) > baseIndent
        && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
        raw += ` ${lines[i].trim()}`;
        i += 1;
      }
      items.push(inline(raw));
    }
    return `<${tag}>${items.map((it) => `<li>${it}</li>`).join('')}</${tag}>`;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i += 1; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i += 1; continue; }

    if (/^-{3,}\s*$/.test(line.trim())) { out.push('<hr>'); i += 1; continue; }

    if (/^\s*[-*]\s+/.test(line)) { out.push(flushList('ul')); continue; }
    if (/^\s*\d+\.\s+/.test(line)) { out.push(flushList('ol')); continue; }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      // Blank-separated paragraphs inside the quote.
      const paras = quote.join('\n').split(/\n{2,}/).map((p) => `<p>${inline(p.replace(/\n/g, ' '))}</p>`);
      out.push(`<blockquote>${paras.join('')}</blockquote>`);
      continue;
    }

    // Paragraph: gather until a blank line or a block-starting line.
    const para = [];
    while (i < lines.length && lines[i].trim() !== ''
      && !/^(#{1,4}\s|>\s?|-{3,}\s*$|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}


/* THE PALETTE IS THIS SITE'S, taken from `public/accessibility.html` so that no
   new foreground/background pair enters the contrast gate. Dark first with a
   light-mode override, which is the order both existing pages use. */
export const CSS = `:root{
  --bg:#0B1020; --bg2:#0E1428; --surface:#151B30; --line:#646FA0;
  --text:#EAECF5; --muted:#B7BFD6; --link:#8A97FF;
}
@media (prefers-color-scheme:light){
  :root{
    --bg:#F4F6FB; --bg2:#FBFCFE; --surface:#FFFFFF; --line:#7482A0;
    --text:#171C2B; --muted:#4C5570; --link:#4A54C8;
  }
}
*{box-sizing:border-box}
html,body{margin:0}
/* A SOLID BACKGROUND, not the gradient the other two pages use. The contrast
   gate refuses to sample text over a gradient — "could not determine an opaque
   background ... refusing to guess" — and it is right to: the ratio genuinely
   differs down the page. Long-form prose is the one place that matters most. */
body{
  background:var(--bg);
  color:var(--text);
  font:1rem/1.65 ui-serif,Georgia,"Times New Roman",serif;
  padding:0 max(1rem,env(safe-area-inset-left)) 4rem max(1rem,env(safe-area-inset-right));
}
main{max-width:38rem;margin:0 auto;padding-top:1.5rem}
h1,h2,h3,h4{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.25}
h1{font-size:1.75rem;margin:1rem 0 0.5rem}
h2{font-size:1.25rem;margin:2.25rem 0 0.5rem}
h3{font-size:1.05rem;margin:1.75rem 0 0.4rem}
h4{font-size:1rem;margin:1.25rem 0 0.3rem}
p,li{color:var(--text)}
li{margin:0.35rem 0}
ul,ol{padding-left:1.3rem}
strong{font-weight:700}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.9em;
  background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:0.05em 0.3em}
blockquote{margin:1rem 0;padding:0.4rem 0 0.4rem 1rem;border-left:3px solid var(--line);color:var(--muted)}
hr{border:0;border-top:1px solid var(--line);margin:2.5rem 0}
a{color:var(--link);text-underline-offset:2px}
a:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* THE WAY BACK IS A REAL TARGET. 44px both ways, at the top where it is met
   first, and it is the only route off this page. */
.back{display:inline-flex;align-items:center;min-height:44px;padding:0 0.25rem;
  font-family:ui-sans-serif,system-ui,sans-serif;font-size:0.9rem;text-decoration:underline}
footer{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--line);
  color:var(--muted);font-size:0.85rem;font-family:ui-sans-serif,system-ui,sans-serif}
footer a{color:var(--link)}
`;

/** The page shell. Differs from Quietkeep's only in the title suffix, the way
 *  back, and the icon paths — this site keeps its icons at the root. */
export function page(bodyHtml, meta) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title} — Noah Jefferson</title>
<meta name="description" content="${meta.description}">
<meta name="theme-color" content="#0B1020" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F4F6FB" media="(prefers-color-scheme: light)">
<link rel="canonical" href="https://noahjefferson.pages.dev/${meta.slug}">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/icon.svg">
<link rel="stylesheet" href="essay.css">
</head>
<body>
<main>
  <a class="back" href="/">&larr; noahjefferson.pages.dev</a>
${bodyHtml.split('\n').map((l) => '  ' + l).join('\n')}
  <footer>
    ${meta.footer}
  </footer>
</main>
</body>
</html>
`;
}
