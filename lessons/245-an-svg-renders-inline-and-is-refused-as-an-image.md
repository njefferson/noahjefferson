## 245 · The same file, two parsers, and only the forgiving one was ever asked

**Enforced by:** GATE noahjefferson:svg-check.mjs — every tracked `.svg` in a
repo is scanned for XML well-formedness, which is what a browser applies when it
loads one AS AN IMAGE. Watched: red on the icon that caused this, and on ten
planted defects — a bare `&`, a `<` in an attribute value, a duplicate
attribute, an unquoted value, a mismatched tag, an unclosed element, `&nbsp;`,
a comment ending in three hyphens, two document elements. Green on every honest
icon in the family, sibling apps included. Its verdict was compared against a
real XML parser on all twenty-one and agreed in both directions. · CHECKLIST
which-parser-reads-this — for any asset a repo both GENERATES FROM and SERVES,
name the two consumers separately and ask whether they parse it the same way.

**Smell:** an artefact that is rendered by one path and served by another; a
"drift check" that compares two copies of a file rather than validating either;
a fallback list where the first entry is the one nobody looks at. And the
specific tell — a source file whose header comment quotes the tool's own
command-line flags.

**2026-09-08.** An app was not offered as an installable app by Chrome or Edge,
while every sibling was. Its manifest was correct, its service worker had a
fetch handler, it was served over HTTPS from its own origin with the right
content types, and its 192 and 512 icons were exactly what they claimed to be.
Chromium's own answer, asked directly, was `no-acceptable-icon`.

The manifest listed the SVG icon with `sizes: "any"`. Chromium reads that as the
largest icon available, picks it, and tries to decode it for the installability
check. The decode failed, and **the check does not fall back**: one unusable
entry and the conclusion is that the app has no acceptable icon at all. Two
correct PNGs sat in the same list, unread.

The SVG was not well-formed XML. Its header comment named the renderer's check
flag, spelled with the two hyphens it is typed with, and XML forbids that
sequence inside a comment. One token, in a comment, in a file whose visible
content was perfect.

**What makes it a lesson is which gates were green.** The icon renderer draws
the PNGs by inlining the SVG into an HTML page — so the HTML parser, which
forgives this, produced four flawless images from a file no XML parser would
accept. The drift check held the source and the served copy byte for byte, and
they matched, because they were equally malformed. Two gates, both looking
straight at the file, both reporting on something other than whether it parses.
The SVG favicon was refused the same way and fell back silently to the PNG
favicon, so there was no symptom on any screen either.

The malformed comment and the manifest entry that made it load-bearing arrived
in the SAME commit, so the app was never once installable with that icon: three
releases over seventeen days, in a repo running twenty-one gates. It was found
by asking the browser rather than by reading the manifest — Chromium reports the
installability verdict directly, and it named the icon in one line.

**The general shape.** A file that is generated, rendered, copied and served is
read by more than one parser, and a repo tends to own only the forgiving one. The
question is never "does this file work" but "which reader is it about to meet,
and is that the reader we have ever run".
