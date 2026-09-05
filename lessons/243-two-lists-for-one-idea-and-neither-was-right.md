## 243 · Two gates carried two lists for one idea, and neither list was right

**Enforced by:** GATE noahjefferson:binary-files.mjs — the one deny-list of
non-prose file types, imported by `privacy-check.mjs` and
`third-person-check.mjs` rather than typed into each. Watched: the file type
that caused this returns no finds in either gate, and a text type added to
neither list is still read by both. · CHECKLIST one-idea-one-list — when two
gates in this family both need to know the same fact about a file, the fact
lives in a module and both import it; a second copy is the finding, whether or
not the copies currently agree. · JUDGEMENT — whether a given extension is
prose.

**Smell:** the same regular expression, or nearly the same, in two files. Also,
and more specifically: a comment that has already diagnosed the problem sitting
directly above the thing it diagnosed, unchanged. `privacy-check.mjs` carried
the sentence *two file lists for the same rule is one gate lying about its
coverage* — written about an earlier instance of this exact defect — in the
header of a file whose own list was one of two.

**2026-09-05.** A repository vendored a PDF library, which brought sixteen font
files with it. `third-person-check.mjs` reported two finds inside a Type 1
font's binary data: word-boundaried fragments in glyph outlines, which are not
words. `privacy-check.mjs` reported nothing about the same files.

Both answers were wrong, and they were wrong in opposite directions, which is
the part worth keeping. One gate produced noise that trains a reader to skim
its output — and skimming is how a real find gets missed. The other did not
look at all: `.pfb` was not on its list either, but its list is a deny-list of
binaries, so a file type absent from it is a file type the gate reads. It read
the binary and matched nothing, which is luck rather than coverage.

**The lists were not the same list.** One had `otf`, `eot` and `wasm` and the
other did not. Neither had `pfb`, `pfm` or `afm`. Nothing anywhere compared
them, and nothing could have: they were two constants in two files that no
third file mentions. Every argument for taking a gate with `--repo .` rather
than forking it applies with exactly the same force one level down, to a
constant two gates share.

**The fix is not adding the extension.** Adding `pfb` to both lists produces two
lists that agree today, which is the state they were already in the last time
somebody added an extension to both. `binary-files.mjs` is one export both
gates import, so the next font format is added once and the next gate to need
the fact imports it rather than typing it.

**And a deny-list, not an allow-list, for the reason already written down.** An
allow-list of text extensions has to be extended every time a repository grows
a file type, by somebody who happens to remember the gate exists. A deny-list of
binaries is total by default: a new text format is covered on the day it lands,
and the only way to lose coverage is to name an extension deliberately.
