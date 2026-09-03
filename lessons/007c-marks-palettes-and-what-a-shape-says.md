## 7c · Marks, palettes, and what a shape says

**Enforced by:** GATE hub:palette-check.mjs · JUDGEMENT

**Smell:** a mark that reads correctly to you and has never been shown to anyone who uses the audience's own vocabulary.

**Check a mark against the audience's own vocabulary, not only against other
logos.** Two icon candidates for Quietkeep were spirals, and every check run on
them was a *collision* check — does this look like another brand, an app icon, a
loading spinner. All of that passed or was fixable, and I rejected them on
legibility.
**A spiral is the shape of tightening inward with no way out.**
For an app that exists to meet people at exactly that moment, putting it on the
front door says the app is the feeling rather than the answer to it.

This is the visual form of the *wince* lesson. A lookalike check asks "does this
resemble something else" — a meaning check asks "what does this say to the person
holding it", and only the second one catches this. Any product with a specific
audience has vocabulary like this, verbal and visual; find out what it is before
drawing, not after.

*(Quietkeep, 2026-07-28 — caught only after a session had rejected the same
two candidates for entirely different and lesser reasons.)*

**"Make it lighter" can be arithmetically impossible, and the arithmetic is worth
running before answering.** A three-tone mark where each step needs 3:1 over the
last needs roughly **9:1 of luminance range end to end**. Asked to lighten a
near-black icon, every naive "lift everything a step" variant failed the second
step at 2.0–2.4:1 — there is no room above a light field. The fix was to
**invert** rather than pale: light field, dark form, bright warm detail. Same
idea, same composition, and it measured *better* — 8.92:1 / 6.48:1 against the
original 3.34:1 / 3.45:1, and it stopped collapsing in grayscale at 32–48px.
Compute the ladder before you reach for the brightness slider, and render the
rejected variants so the choice is visible rather than argued.

*(Quietkeep, 2026-07-28.)*

**Checking is not the same as checking with the right instrument — and a cached
index is the wrong one.** Two sessions running told the owner a repo topic still had a
typo in it. The owner had fixed it before the first report. The reports were not guesses;
they quoted a GitHub **search** API response, which is a *cached index*, not a read
of current state — and the proof was sitting in the same payload, an `updated_at`
frozen through four subsequent pushes. Nobody looked at it. Meanwhile the direct
`api.github.com/repos/...` endpoint 403s through this sandbox's proxy, so there was
no live read available at all.

Two rules, both cheap:

- **Ask any "current state" response when it last changed**, and check that against
 what you know has happened since. A stale timestamp beside stale data is the
 instrument confessing.
- **When the owner is the only witness, ask clearly and believe the answer.** The
 failure here was not the stale read — it was reporting "read back from the API,
 not assumed" as though it outranked the owner's word. It did not. Doctrine §10 already
 says confirmation *is* the verification; a cache was being smuggled in as a
 second opinion.

*(Quietkeep, 2026-07-28.)*

**A detail visible in a screenshot is not a fact you were told.** Debugging a
site that would not load on an iPad, a session noticed the status bar read
LTE, inferred that earlier failed attempts must have been on Wi-Fi, and wrote
"the likelier cause is a network-level block" into a permanent verification
record as reasoning. **The connection had been LTE the entire time, same device, one
network.** The invented variable also crowded out the explanation that actually
fit every observation — both failing URLs were preview deployments on a Pages
project that had no production deployment yet, and the apex worked the moment one
existed.

Screenshots, API responses, and unset environment variables are all
**instruments**. Reading one is not the same as being told something, and the gap
between them is where confident wrong answers come from. If a variable matters to
a diagnosis and the owner has not stated it, **ask — one line — rather than infer
it and build on the inference.** Guessing about someone else's setup and
presenting it as analysis is worse than saying "I don't know why."

*(Quietkeep, 2026-07-28 — the third instance in one day, after a cached search
index reported as current repo state and an unset secret name reported as a
missing secret. Same error, three costumes.)*
