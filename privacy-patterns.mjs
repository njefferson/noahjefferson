// privacy-patterns.mjs — THE disclosure patterns. One source, no copies.
//
// CANONICAL IN THE HUB. Never fork it, never inline it.
//
// It exists because the list was duplicated three times — the tree gate, the
// history gate, and Quietkeep's offline mirror — and a narrowing fix reached
// exactly one of them. Duplication of a CI-blocking pattern is not a tidiness
// problem: an over-broad copy stops deploys, and a stale copy is a gate
// measuring something nobody has read. See LESSONS §53.
//
// A sibling repo that must run offline may still mirror this list, but its
// mirror is then held to `privacy-mirror-check.mjs`, which fails on any drift.
//
// The sentinels below are load-bearing. Every gate keying off them skips the
// region for disclosure-scanning and holds it to no-name-and-no-date instead,
// because a pattern's source legitimately carries the anchor token.

// privacy-gate:patterns-begin
export const DISCLOSURE = [
  /\b(?:noah|the owner|he|she|they)\s+(?:is|was|are|were|being|remains)\s+(?:\w+\s+){0,2}?(?:audhd|adhd|autistic|neurodivergent)\b/i,
  // `diagnosed` only counts as a disclosure when something is diagnosed WITH
  // something. Bare "diagnosed" is ordinary engineering English about a FAULT,
  // and this pattern used to swallow it: a release note reading "they are
  // still not diagnosed, only absent" — about console warnings — failed the
  // gate and blocked FOUR consecutive deploys before anyone noticed, because
  // "they are ... diagnosed" matched. Four releases sat on a branch, reported
  // as shipped, while the owner's device stayed on the last one that deployed.
  //
  // Requiring "with" keeps every real disclosure ("he was diagnosed with X")
  // and releases the technical sense outright. A gate that fires on ordinary
  // prose is a gate people learn to route around, which is the one failure a
  // privacy check cannot afford.
  /\b(?:noah|the owner|he|she|they)\s+(?:is|was|are|were|being|remains)\s+(?:\w+\s+){0,2}?diagnosed\s+with\b/i,
  /\b(?:audhd|adhd|autistic|neurodivergent)\s+(?:owner|maker|author)\b/i,
  /\bconfirmed\b[^\n]{0,50}\b(?:he|she|they)\s+(?:is|are)\s+neurodivergent\b/i,
  /\b(?:noah|the owner)\b[^\n]{0,30}\b(?:medication|therapy|diagnosis|diagnosed)\b/i,
];
// privacy-gate:patterns-end

// What a sentinel-skipped region may never contain, once its regex literals
// are set aside: the region's prose and string literals are the only place a
// real sentence could hide, and neither needs a proper name or a date.
export const REGION_FORBIDDEN = [
  [/\bnoah\b/i, 'the owner’s name outside a pattern'],
  [/\b20\d\d-\d\d-\d\d\b/, 'a date'],
];

export const BEGIN = 'privacy-gate:patterns-begin';
export const END = 'privacy-gate:patterns-end';

// A line that opens with `/` but not `//` is a regex literal, not prose.
export const isPatternSource = line => /^\s*\/(?!\/)/.test(line);

// Split a file into the lines the disclosure patterns read, and the lines the
// sentinels exclude. Blanking rather than dropping keeps line numbers honest.
export function split(text) {
  const body = [];
  const region = [];
  let inside = false;
  for (const line of text.split('\n')) {
    if (line.includes(BEGIN)) { inside = true; body.push(''); continue; }
    if (line.includes(END)) { inside = false; body.push(''); continue; }
    if (inside) {
      if (!isPatternSource(line)) region.push(line);
      body.push('');
    } else { body.push(line); }
  }
  return { body: body.join('\n'), region: region.join('\n') };
}
