## 357 · A gate that copies a pipeline's last step and not its filter counts what could render, not what does

**Enforced by:** CHECKLIST count-what-renders — when a gate checks a list that
a build renders, it runs the build's own filter before it counts, read out of
the build's source rather than restated, and it prints the number that reaches
the page, not the bound it is sliced to. · GATE
jefferson-photography-studio:tools/notes-check.mjs — reads the `Shown as:`
pattern out of `vite.config.ts`, counts the entries that survive it, prints
that count, and refuses zero.

**Smell:** a gate that prints "shows the first N" where N is a constant from the
build, with no count of what met the build's conditions. Also: a build step that
filters and then slices, mirrored by a gate that only slices.

**Measured 2026-09-24 in Jefferson-Photography-Studio.** The public release-notes
page is built from the notes archive: the build keeps only entries that declare
a `Shown as:` line, then takes the first twelve. The gate that guards the page
read the slice bound out of the build's own source, which was the right
instinct, and printed "notes.html shows the FIRST 12 of 125 archived items".
It exited green. The page carried five. The `Shown as:` requirement arrived on
2026-09-22, and every entry archived before that date lacks the line, so 120 of
125 entries were filtered out before the slice ever ran.

**The gate had been built to read the build rather than restate it, and it read
the wrong half.** It copied the step that is easy to see, a `.slice(0, 12)` at the
end of a chain, and not the condition three lines earlier that decides what
reaches the slice. A count that is a constant is not a measurement. The fix
reads the build's own filter pattern and counts what passes it. It was made to
fail once with every `Shown as:` line planted away, and it refused.
