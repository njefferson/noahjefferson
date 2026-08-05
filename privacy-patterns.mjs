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

/**
 * ATTRIBUTION — quoting the owner, or putting his words in a repo at all.
 *
 * A SEPARATE FAILURE FROM A DISCLOSURE, and it went unnoticed for the entire
 * life of these repos because the disclosure patterns look for a diagnosis or a
 * health fact and this is neither. It is his ordinary speech — reports,
 * decisions, frustration, swearing — quoted verbatim, attributed to him by
 * name, in PUBLIC repositories bearing that name. 787 sites across two repos on
 * 2026-08-05, including in the very files that define what must never land in
 * one.
 *
 * It grew because quoting whoever found a defect FEELS like provenance. It is
 * not provenance. It is republishing somebody's private messages, in public,
 * under their own name, without asking, in a place their peers and family read.
 *
 * WHAT IS AND IS NOT CAUGHT. His name is allowed to exist — it is his site, his
 * byline, his link in a footer. What is forbidden is ATTRIBUTION: a quotation
 * beside his name or role, or reported speech naming him as the source. Write
 * what was wrong and what it measured; never who said it or what they said.
 *
 * The engineering reason a defect was found does not require the sentence that
 * reported it. "The scope was 269px against the horizon's 217" is the whole
 * fact. Everything else is somebody's message.
 */

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

export const ATTRIBUTION = [
  // Name or role, then a colon, then an opening quote: the classic attribution,
  // and the shape every one of the 787 sites took.
  /\b(?:noah(?![.\w])|the owner)\b[^:\n]{0,40}:\s*[*_]{0,2}["“]/i,
  // NARROWED ON ITS FIRST RUN. A proximity rule — a quote mark within 80
  // characters of the word "owner" — fired on fifteen pieces of ordinary prose
  // in this repo alone: a doctrine sentence about whose decision the hub is, a
  // security heading about what only the owner can do, a UI string in a check.
  // Every one a false positive, and this file already records why that is the
  // one thing a privacy gate cannot afford: a gate that fires on honest prose
  // is a gate people learn to route around. The precise shapes below catch what
  // actually happened and leave prose alone.
  // Reported speech, but ONLY when a quotation follows. "The owner asks what the
  // numbers look like" is ordinary guidance prose and fired on the first run;
  // "the owner said: <quote>" is the thing.
  /\b(?:noah|the owner)\b\s+(?:said|says|reported|complained|wrote|told|put it|called it)\b[^\n]{0,60}["“]/i,
  // His words, his message, his screenshot — attribution without a quote mark.
  // The name token excludes handles and domains, which are his own product copy
  // and were caught by the first draft of this rule.
  /\b(?:noah(?![.\w])|the owner)(?:'s|\u2019s)\s+(?:words|quote|message|complaint|wording|phrasing|screenshot|exact)\b/i,
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
