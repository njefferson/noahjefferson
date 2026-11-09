// The shape of a case file. session-guards.test.mjs loads every `.mjs` file in this folder and joins its cases and plants to its own.
//
// ONE FILE PER GUARD FILE, NAMED FOR IT: the cases and plants of `report.mjs` go in `guard-cases/report.mjs`. A plants run narrowed to a
// guard file (`--files=report.mjs`) runs that file's plants wherever they are written, and `--touched` counts a touched case file as a
// touch of the guard file it is named for.
//
// `cases` is an array of { name, guards, run(m, dir, h) }:
//   name    unique across the whole suite; a name already taken is refused when the suite loads.
//   guards  the plant keys this case answers for; a key named here must be a key of `plants`, or a plants run says NO PLANT.
//   run     returns true when the case holds, or throws an Error naming the assertion that did not, with the text the call returned.
//             m   the guard modules, imported fresh from `dir`.
//             dir the folder the guards sit in: the working copy in a plain run, a copy with one plant applied in a plants run.
//             h   the helpers of session-guards.test.mjs: tmp, sid, turn, tool, result, repo, world, seedHub, batchHub, suiteCopy and
//                 the rest of the list at the object `H` there. `h.assertAll([[label, ok, got], ...])` throws with every failed label and
//                 what it got, and is the way to end a case that checks more than one thing.
//
// `plants` is an object { key: [the line to take out, what replaces it, the guard file] } in the shape of `PLANTS` in the suite. Write
// the line so that it holds a newline or a quote the plants map would have to escape, or the first match in the suite's own text is the
// plants map and not the code. Before every plants run the suite names each plant whose line its file no longer holds.
//
// A CASE NEVER WRITES INTO THE WORKING COPY. A plain run compares the content of every tracked file of its checkout after each case and
// fails the case after which one differs. A case that needs a program, a found folder, a lessons folder, a plan, a marker, a repository or a
// transcript writes it under a temporary folder (`h.tmp`, `h.repo`, `h.seedHub`, `h.suiteCopy`) and never into `dir`.

export const cases = [];

export const plants = {};
