## 148 · Node strips TypeScript itself now, so a TypeScript project can carry ZERO runtime dependencies and one build one

**Enforced by:** GATE noahjefferson:pin-check.mjs — the existing npm-hygiene
gate already fails on an undeclared dependency, and a tree with none passes it
trivially. · CHECKLIST no-toolchain-by-reflex — before adding a bundler or a test
runner, check whether Node alone does it.

MoleBridge is TypeScript, strict, no `any`, 107 tests, and its
`node_modules` holds the type checker and the Node type definitions. Nothing
else. No bundler, no transpiler, no test framework, no build step: `node
src/thing.ts` runs, and `node --test 'test/**/*.test.ts'` runs the suite.

Node 22.18 and later strip type annotations at load. It is not a compiler — it
erases types and runs the rest — so the code has to stay erasable: no `enum`, no
namespaces, no parameter properties, explicit `.ts` in import specifiers, and
`import type` where the import is only a type. TypeScript's own
`erasableSyntaxOnly` flag enforces exactly that set, so the type checker refuses
anything Node would choke on.

**Why this is worth a lesson rather than a footnote.** Doctrine §16 says the
realistic threat to these repos is a compromised package pulled in for a script
nobody thinks about, executing on a runner holding a live token. The cheapest
defence is not pinning; it is **not having the package**. A test runner and a
bundler together are hundreds of transitive dependencies, every one of which
executes during `npm ci` on that runner.

**What it costs.** `node --test` has no watch-and-rerun worth using, no snapshot
testing, and its default reporter is TAP, which is verbose. Those are real, and
for a repo with a browser-driven suite a real runner may still win. **The point
is not that the toolchain is always wrong — it is that adding one should be a
decision rather than the first line of a new repo.** This one was reached for by
reflex in every previous repo here, and in at least one of them nothing but
`tsc` and a test runner was ever needed.

