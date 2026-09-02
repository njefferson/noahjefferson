## 64 · A fixture built to match your heuristic will agree with it forever

**Enforced by:** CHECKLIST fixture-from-reality — a parser's fixture must be a captured real payload or a faithful reconstruction of one. If the fixture was written by the same reasoning as the parser, the test is a mirror and passes on both being wrong together.

fauxplane split a raw weather feed into reports on blank lines, and its test
proved it: a body of two short advisories separated by one blank line, split into
two. Green, and shipped.

**A real convective SIGMET bulletin is ONE document with several paragraphs** —
the advisory, an OUTLOOK, then AREA 1, AREA 2, AREA 3 — separated by blank lines.
The rule tore each bulletin into five. The panel reported *66 reports* that were
fragments, and displayed a lone `AREA 3...FROM END-ARG-LIT-MCB-CEW-210S` with no
header saying which SIGMET or which hazard it belonged to — **a truncated
warning, which is the precise failure the rule had been written to prevent.**

**The test could not have failed.** Its fixture came from the same idea as the
code: *reports are separated by blank lines, so here are reports separated by
blank lines.* Two expressions of one assumption, checking each other. Every real
property — how many paragraphs a bulletin has, whether a fragment is
self-describing — was outside what the fixture could express.

**The tell is that the fixture is TIDY.** Real payloads have headers, feed-added
prefixes, inconsistent separators and documents that do not fit the rule. A
fixture with none of that was not captured; it was composed, and composed by the
author of the thing it is checking.

**What it cost, and what it bought.** One release, and a correction that was
free: the feed marks its own documents with a `Type:` prefix, which is what a
delimiter is for. The right rule was in the payload the whole time and nobody had
looked at a payload.

**Smell:** a parser fixture you wrote from your head. A test whose input you could
have derived from the implementation. Any "reports are separated by X" where X
was chosen before any real input was seen.

*(fauxplane 1.34.0 → 1.35.0, 2026-08-05.)*
