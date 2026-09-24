## 356 · A comment in a shipped file is published copy: HTML comments are served in the page, and source maps carry every other comment to the production URL

**Enforced by:** CHECKLIST shipped-comments — the privacy rules (never quote,
never attribute by name or role) apply to comments in every file the build
serves, and to what the source maps expose, not only to docs. Before a release,
fetch one production page and one `.map` and search them the way the tree is
searched. · JUDGEMENT — a comment's audience is whoever opens the page source,
which on a public app is anyone.

**Smell:** a comment that records who reported something, in a file the build
copies to the output, in a project whose build emits source maps.

**Measured 2026-09-24 in Jefferson-Photography-Studio.** The editor's HTML
carried role-attributions in comments ("Owner report, <date>") above three of
its controls. Vite leaves HTML comments in the page, and the production page
source served them. The TypeScript and CSS comments are stripped from the
bundles, but the build emits source maps and the deploy uploads them: the
editor's main map is 1.87 MB at the production URL, with every comment in the
source intact. A sweep of the shipped files found 67 attribution sites in
comments across fifteen of them.

**The docs had been scrubbed and the gates were green.** The privacy gates read
the tree, and none of their patterns anchor on a role without a name. The
fixable part is a comment rewrite with a build diff that proves nothing but
comment text and maps changed. The lesson is that "the docs" was the wrong
boundary. **Anything the build serves is published, and a comment is served.**
