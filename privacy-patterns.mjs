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

/**
 * HIS_LIFE — the owner's actual circumstances, as opposed to his person or his
 * words. A THIRD fail class, and the one the doctrine claimed to cover and did
 * not.
 *
 * WHAT HAPPENED. He described a real morning to shape the product — medication
 * running low, a medical device needing supplies, appointments to make, a
 * workplace matter, his family's plans. A session's next move was to write all
 * of it into a public NOTES.md as "evidence", hours after that same session had
 * finished removing every quotation of him for the identical reason. He stopped
 * it. Neither of the two existing classes would have: DISCLOSURE looks for a
 * diagnosis beside his name, ATTRIBUTION looks for his words, and a paraphrased
 * account of his day is neither.
 *
 * THE LINE. The SHAPE of what he reports is product design and belongs here —
 * "a standing arrangement whose failure mode is silence" is a noun worth having.
 * The INSTANCE is his life and belongs nowhere in a repository.
 *
 * WHY THIS IS NOT A WORD LIST. This app is a PLANNER: its own sample data says
 * dentist, appointment, doctor, family, car — ten files use "dentist" alone.
 * Banning everyday nouns would fail the product's own fixtures on the first run,
 * which this file already records as the one thing a privacy gate cannot afford.
 * So the broad rule ANCHORS ON HIM — a life noun tied to him by a possessive or
 * a verb — and only a short list of specifics with no possible product meaning
 * is banned outright.
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

  // ATTRIBUTION WITHOUT QUOTATION MARKS. Every rule above requires a quote
  // character somewhere, and that was the defect.
  //
  // All 787 original sites carried quotation marks, so the patterns were fitted
  // to that shape and the shape was mistaken for the class. Five sites in a
  // sibling's stylesheet \u2014 served verbatim from production \u2014 attributed findings
  // by name with no quote mark anywhere: a parenthetical after an observation, a
  // finding verb, and a possessive naming a device. Widening the file filter to
  // reach the stylesheet found nothing, because the patterns could not see the
  // sentences even once they were being read. Two separate failures wearing one
  // green tick.
  //
  // ANCHORED ON THE NAME ONLY, never on the role. The anonymised role is the
  // CORRECT form and appears throughout the lessons doing load-bearing work: a
  // sentence recording that a human caught a defect where no test did is a fact
  // about gate coverage, and a rule firing on it would teach sessions to route
  // around the gate \u2014 which this file already records as the one thing a privacy
  // check cannot afford. The name is what republishes a person; the role is what
  // records an engineering fact.

  // A parenthetical carrying the name, e.g. a provenance tag after an
  // observation. The commonest habit, and pure attribution \u2014 the finding is
  // already in the sentence, and the name adds only who said it.
  /\(\s*noah(?!\s+jefferson)(?![.\w@-])[^)\n]*\)/i,

  // A finding verb with the name in front of it. Deliberately NOT "decides",
  // "reads", "wants" or "owns" \u2014 those are the hub's rules ABOUT whose call a
  // thing is, which are legitimate and must stay sayable. These are the verbs of
  // reporting a defect, which is exactly what must be recorded without a
  // reporter.
  /\bnoah(?![.\w@-])\s+(?:found|finds|noticed|notices|caught|spotted|reported|reports|flagged|observed|hit|saw|sees)\b/i,

  // The name possessing a device or an instance. Narrow on purpose: the same
  // possessive in front of a decision noun is the doctrine talking about whose
  // call a thing is, and stays legal.
  /\bnoah(?![.\w@-])(?:'s|\u2019s)\s+(?:ipad|iphone|device|phone|screen|browser|machine|laptop|tablet|instance|store|install)\b/i,
];
export const HIS_LIFE = [
  // Anchored on him: a life noun tied to the owner by a possessive. "his
  // prescriptions", "the owner's supervisor", "his wife". The app's own
  // fixtures say "dentist" and "appointment" freely and are untouched, because
  // nothing there belongs to anybody.
  /\b(?:noah(?![.\w])|the owner|his)(?:'s|\u2019s)?\s+(?:\w+\s+){0,2}?(?:prescription|prescriptions|pharmacy|refill|refills|medication|medications|dose|dosage|inhaler|appointment|appointments|doctor|dentist|optician|optometrist|surgery|clinic|therapist|supervisor|employer|workplace|payroll|wife|husband|partner|spouse|kids|children|daughter|son|truck|car|vehicle|mortgage|landlord)\b/i,
  // Health and care specifics a planner has no reason to contain at all. Short
  // and explicit on purpose: each earns its place by having no product meaning.
  /\b(?:cpap|bipap|sleep apnoea|sleep apnea|blood pressure|insulin|antidepressant|adhd meds|stimulant medication)\b/i,
  // A first-person account of a real day. The repo's own prose is written in
  // the repo's voice about the software; "I noticed in the shower", "I realise
  // I need to", "I remember I have to" is somebody's morning, not a design note.
  /\bI\s+(?:noticed|realis|realiz|remember|forgot|need to|have to|keep forgetting)\w*\b[^\n]{0,40}\b(?:shower|sink|driving|drive|car|work|appointment|doctor|order|refill)\b/i,
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
