#!/usr/bin/env node
// svg-check.mjs — every SVG in a repo parses as XML, because the browser that
// draws it AS AN IMAGE will not forgive one that does not.
//
//   node svg-check.mjs                    check the hub
//   node svg-check.mjs --repo ../app      check a sibling
//   node svg-check.mjs --repo ../app --verbose   name every file it parsed
//
// ## Why this exists, and what it cost to find out
//
// An SVG is read two completely different ways depending on how it arrives.
// Inlined into a page — which is how every icon renderer in this family draws
// its PNGs — it goes through the HTML parser, which is famously forgiving.
// Loaded as an IMAGE, which is how a favicon, a manifest icon, an `<img src>`
// and a CSS `url()` all arrive, it goes through an XML parser, which is not
// forgiving at all: one well-formedness error and the file is refused whole,
// with no partial render and no fallback to whatever sits beside it.
//
// print-tracker's icon carried the sequence `-` `-` inside its header comment,
// where XML forbids it, from its first commit. What that cost was the install
// offer on every Chromium browser: the manifest lists the SVG with sizes "any",
// so Chromium picks it as the largest icon available, tries to decode it for
// the installability check, fails, and reports `no-acceptable-icon` — never
// falling back to the 192 and 512 PNGs, which were correct the whole time. Edge
// and Chrome both stopped offering to install the app. The SVG favicon died the
// same way and fell back silently to the PNG favicon, so nothing on any screen
// looked wrong.
//
// EVERY GATE IN THAT REPO WAS GREEN THROUGHOUT, and the two that came closest
// are the interesting part. Its icon renderer inlines the source into an HTML
// page, so the HTML parser drew the PNGs perfectly. Its drift check compares the
// source and the served copy byte for byte, and both were equally malformed. A
// pair of gates can agree completely and still both be looking away.
//
// ## Why it is a parser rather than a pattern
//
// The obvious cheap version greps for `--` inside comments. That is the one
// failure that has actually happened, and writing a gate for exactly the last
// failure is how the next one gets through: an unescaped `&`, a `<` in an
// attribute value, a tag closed in the wrong order and an undeclared entity are
// all the same defect with the same symptom — the file is refused, nothing
// says so, and a PNG somewhere covers for it.
//
// So this is a real well-formedness scanner, and it reports the FIRST problem in
// a file rather than a cascade. An XML error is fatal by definition, so
// everything after it is speculation about a document the browser stopped
// reading.
//
// ## The one judgement call in it
//
// Named references. XML defines exactly five (`amp`, `lt`, `gt`, `apos`,
// `quot`); everything else has to be declared, and `&nbsp;` in an SVG is a
// broken file in every browser. But a document CAN declare its own in an
// internal subset, and this does not parse DTDs — so when a DOCTYPE with a
// `[` is present the named-reference rule stands down for that file and says so
// in the summary. Refusing what it cannot verify would be the more confident
// answer and the less honest one.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { repoFromArgv } from './gate-args.mjs';

const { REPO, NAME, GIVEN } = repoFromArgv(process.argv.slice(2), { gate: 'svg-check.mjs' });
const VERBOSE = process.argv.includes('--verbose');

const NAME_START = /[\p{L}_:]/u;
const NAME_CHAR = /[\p{L}\p{N}._:-]/u;
const REFERENCE = /^&#[0-9]+;|^&#x[0-9a-fA-F]+;|^&([\p{L}_:][\p{L}\p{N}._:-]*);/u;
const PREDEFINED = new Set(['amp', 'lt', 'gt', 'apos', 'quot']);

/** Where an index falls, for a message somebody has to act on. */
function at(src, index) {
  const before = src.slice(0, index);
  const line = before.split('\n').length;
  const col = index - (before.lastIndexOf('\n') + 1) + 1;
  return `${line}:${col}`;
}

class NotWellFormed extends Error {
  constructor(index, message) {
    super(message);
    this.index = index;
  }
}

/**
 * Scan one document for XML well-formedness.
 *
 * Throws NotWellFormed at the first problem. Returns the number of elements it
 * walked, so a caller can tell "clean" from "there was nothing here".
 */
function scan(src) {
  const bad = (index, message) => { throw new NotWellFormed(index, message); };
  const n = src.length;
  let i = src.charCodeAt(0) === 0xfeff ? 1 : 0;
  let elements = 0;
  let rootSeen = false;
  let rootClosed = false;
  const stack = [];

  // A document may declare its own entities, and this does not read DTDs. The
  // named-reference rule stands down rather than guessing.
  const declares = /<!DOCTYPE[^>[]*\[/i.test(src);

  const space = (j) => { while (j < n && /\s/.test(src[j])) j++; return j; };

  const readName = (j) => {
    if (j >= n || !NAME_START.test(src[j])) return null;
    let k = j + 1;
    while (k < n && NAME_CHAR.test(src[k])) k++;
    return { name: src.slice(j, k), end: k };
  };

  const refs = (text, base, where) => {
    let from = 0;
    for (;;) {
      const amp = text.indexOf('&', from);
      if (amp === -1) return;
      const ref = REFERENCE.exec(text.slice(amp));
      if (!ref) {
        bad(base + amp, `a bare "&" in ${where}. XML reads every "&" as the start of a reference — write "&amp;" for a literal one`);
      }
      if (ref[1] && !PREDEFINED.has(ref[1]) && !declares) {
        bad(base + amp, `"&${ref[1]};" is not one of the five references XML defines, and this file declares no others. A browser drawing this file as an image refuses the whole file — write the character itself, or "&#${ref[1] === 'nbsp' ? '160' : 'NNN'};"`);
      }
      from = amp + ref[0].length;
    }
  };

  while (i < n) {
    if (src[i] !== '<') {
      const next = src.indexOf('<', i);
      const end = next === -1 ? n : next;
      const text = src.slice(i, end);
      if (text.trim() && stack.length === 0) {
        bad(i, rootSeen ? 'text after the last element closed' : 'text before the document element');
      }
      const cdata = text.indexOf(']]>');
      if (cdata !== -1) bad(i + cdata, '"]]>" in text, which XML reserves for the end of a CDATA section — write "]]&gt;"');
      refs(text, i, 'the text');
      i = end;
      continue;
    }

    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      if (end === -1) bad(i, 'a comment that is never closed');
      const body = src.slice(i + 4, end);
      const twice = body.indexOf('--');
      if (twice !== -1) {
        bad(i + 4 + twice, 'two hyphens in a row inside a comment. XML forbids the sequence there, so the whole file is refused by anything that draws it as an image — and the HTML parser that renders it inline will not tell you');
      }
      if (body.endsWith('-')) bad(end - 1, 'a comment ending in three hyphens. XML requires the body to stop before the closing "--"');
      i = end + 3;
      continue;
    }

    if (src.startsWith('<![CDATA[', i)) {
      const end = src.indexOf(']]>', i + 9);
      if (end === -1) bad(i, 'a CDATA section that is never closed');
      i = end + 3;
      continue;
    }

    if (src.startsWith('<?', i)) {
      const end = src.indexOf('?>', i + 2);
      if (end === -1) bad(i, 'a processing instruction that is never closed');
      i = end + 2;
      continue;
    }

    if (src.startsWith('<!', i)) {
      // A DOCTYPE, with or without an internal subset. Not parsed — only walked
      // past, correctly, so a "[" inside it cannot swallow the document.
      const bracket = src.indexOf('[', i);
      const close = src.indexOf('>', i);
      if (close === -1) bad(i, 'a declaration that is never closed');
      if (bracket !== -1 && bracket < close) {
        const endSubset = src.indexOf(']', bracket);
        if (endSubset === -1) bad(i, 'an internal subset that is never closed');
        const after = src.indexOf('>', endSubset);
        if (after === -1) bad(i, 'a declaration that is never closed');
        i = after + 1;
      } else {
        i = close + 1;
      }
      continue;
    }

    if (src.startsWith('</', i)) {
      const nm = readName(i + 2);
      if (!nm) bad(i, 'a closing tag with no element name');
      const j = space(nm.end);
      if (src[j] !== '>') bad(j, `"</${nm.name}" is not closed with ">"`);
      if (!stack.length) bad(i, `</${nm.name}> closes an element that was never opened`);
      const open = stack.pop();
      if (open.name !== nm.name) {
        bad(i, `</${nm.name}> closes <${open.name}>, which was opened at ${at(src, open.index)}. XML has no optional closing tags — every element is closed, in order`);
      }
      if (!stack.length) rootClosed = true;
      i = j + 1;
      continue;
    }

    const nm = readName(i + 1);
    if (!nm) bad(i, 'a "<" that starts neither a tag nor a comment. XML reads every "<" as markup — write "&lt;" for a literal one');
    if (rootClosed) bad(i, `<${nm.name}> is a second document element. An XML document holds exactly one`);
    elements++;
    rootSeen = true;

    let j = nm.end;
    const seen = new Set();
    for (;;) {
      const ws = space(j);
      if (src.startsWith('/>', ws)) {
        if (!stack.length) rootClosed = true;
        j = ws + 2;
        break;
      }
      if (src[ws] === '>') {
        stack.push({ name: nm.name, index: i });
        j = ws + 1;
        break;
      }
      if (ws >= n) bad(i, `<${nm.name}> is never closed with ">"`);
      if (ws === j) bad(ws, `<${nm.name}> needs whitespace before its next attribute`);

      const an = readName(ws);
      if (!an) bad(ws, `<${nm.name}> has something that is not an attribute name here`);
      let k = space(an.end);
      if (src[k] !== '=') bad(k, `"${an.name}" on <${nm.name}> has no value. XML has no bare attributes — write ${an.name}="${an.name}"`);
      k = space(k + 1);
      const quote = src[k];
      if (quote !== '"' && quote !== "'") bad(k, `the value of "${an.name}" on <${nm.name}> is not quoted. XML requires quotes on every attribute value`);
      const close = src.indexOf(quote, k + 1);
      if (close === -1) bad(k, `the value of "${an.name}" on <${nm.name}> is never closed`);
      const value = src.slice(k + 1, close);
      const lt = value.indexOf('<');
      if (lt !== -1) bad(k + 1 + lt, `a "<" inside the value of "${an.name}" on <${nm.name}> — write "&lt;"`);
      refs(value, k + 1, `the value of "${an.name}" on <${nm.name}>`);
      if (seen.has(an.name)) bad(ws, `"${an.name}" appears twice on the same <${nm.name}>`);
      seen.add(an.name);
      j = close + 1;
    }
    i = j;
  }

  if (stack.length) {
    const open = stack[stack.length - 1];
    bad(open.index, `<${open.name}> is opened here and never closed`);
  }
  if (!rootSeen) bad(0, 'no element in the file at all');
  return { elements, declares };
}

const tracked = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n').filter((f) => f.endsWith('.svg'));

console.log(`=== svg gate · ${NAME} ===\n`);

let failed = 0;
let stoodDown = 0;

for (const file of tracked) {
  let src;
  try {
    src = readFileSync(join(REPO, file), 'utf8');
  } catch (error) {
    console.error(`  FAIL  ${file}: could not be read — ${error.message}`);
    failed++;
    continue;
  }

  try {
    const { elements, declares } = scan(src);
    if (declares) stoodDown++;
    if (VERBOSE) console.log(`  ok    ${file} — ${elements} element(s)${declares ? ', declares its own entities' : ''}`);
  } catch (error) {
    if (!(error instanceof NotWellFormed)) throw error;
    console.error(`  FAIL  ${file}:${at(src, error.index)} — ${error.message}`);
    failed++;
  }
}

if (failed) {
  console.error(`\nsvg gate: ${failed} of ${tracked.length} file(s) would be refused by a browser drawing them as an image.`);
  console.error('An icon renderer inlines the file into a page, where the HTML parser forgives this. A favicon, a manifest icon, an <img src> and a CSS url() do not.');
  process.exit(1);
}

if (!tracked.length) {
  console.log('svg gate: no SVG files tracked in this repo.');
} else {
  const aside = stoodDown ? `, ${stoodDown} declaring their own entities` : '';
  console.log(`svg gate: ${tracked.length} file(s) parse as XML${aside}.`);
  if (!VERBOSE) console.log(`  Name them: node svg-check.mjs --repo ${GIVEN} --verbose`);
}
