## 212 · A gate that reads the file cannot see the defect that lives where the file meets the host

**Enforced by:** GATE Jefferson-Line:tools/deployed-check.mjs — reads the
service worker's own precache list and asserts, against the PUBLISHED site,
that every entry answers 200 without redirecting, that the version served
matches the checkout, and that the crew surface is not answering the open
internet. · CHECKLIST deploy-then-ask — after any deploy, run at least one
assertion against the deployed URL rather than the tree; a source gate's green
is a statement about the repository. · JUDGEMENT — which behaviours are
host-shaped rather than source-shaped is specific to the host, and no gate can
enumerate them.

**Smell:** a gate whose subject is a FILE but whose promise is about
BEHAVIOUR — "the app works offline", "the new version waits", "the link
resolves". Also: any static host with clean-URL rewriting under a PWA, which
is most of them.

**Jefferson Line, 2026-09-02, found on the way to something else.** The
service worker had listed `index.html`, `privacy.html` and two more in its
precache array since the first commit. Cloudflare Pages 308s every `.html`
path to its extensionless form, and `cache.put` refuses a response whose
redirected flag is set, because it would be stored under a URL that is not the
one it came from. One rejection fails the whole `addAll`, which fails the
install, which means **the worker never activated in production**: no offline
copy and no update strip, on every device, for the life of the app.

Nothing was red. The fetch handler falls through to the network, so the app
worked perfectly and nobody could have noticed by using it. `pwa-check.mjs`
passed on every commit — and it was right to. It reads `public/sw.js`, and
`public/sw.js` says exactly the correct thing. The file is not where the defect
is.

**The shape.** The gate and the defect were in different places. Every check in
that repo, and in this family, reads the working tree: the tree is where most
defects live and it is cheap and offline to inspect. But a deployed app is the
tree PLUS a host that rewrites URLs, sets headers, serves a `_headers` file,
answers `/x.html` with a 308 and `/crew/` with an Access redirect. None of that
is in the tree, and a promise like "works offline" is a claim about the
combination.

**Two rules fall out.** After a deploy, assert something against the deployed
URL — one request is enough to catch a release that silently did not happen
(§53) and a shell entry that silently redirects. And when a gate's NAME is a
behaviour rather than a file property, ask which of the two it is actually
measuring; if it never issues a request, it is measuring the file, and it
should say so in its own output rather than in a passing sentence a reader
will take for the behaviour.

**One practical trap inside the fix.** The deployed gate first used Node's
`fetch`, which ignores `HTTPS_PROXY` — so in the proxied build container every
request came back 403 and the gate reported the entire site as down. A gate
that cries wolf in one environment is a gate that gets ignored in all of them;
it uses `curl` now, which every environment here already honours the proxy
with.
