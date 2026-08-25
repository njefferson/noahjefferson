## 68 · A Content-Security-Policy is served for the service worker too, and `connect-src 'none'` silently gives an offline-first app a worker that can cache nothing

**Enforced by:** GATE 3d-printing-pal:tools/serve.mjs · CHECKLIST csp-under-test — a security header is a runtime behaviour, not a string in a config file. Serve the real `_headers` from whatever the gate boots the app through, so a policy that breaks the app goes red in CI rather than on a device. A CSP written and never exercised is a guess with a header's authority.

print-tracker ships `_headers` with a strict policy, which it can afford because
every script is an external module. The first draft said `connect-src 'none'`,
with a comment explaining that the app makes no network requests at all — which
is true of the app, and was the reason the directive looked safe.

**Cloudflare Pages applies the `/*` block to every path, and that includes
`sw.js`. A service worker inherits the policy delivered with its own script.**
Under `'none'`, `cache.add()` and `fetch()` inside the worker are both blocked.

**What that looks like from outside is nothing at all.** The worker registers.
It reports `active`. `caches.keys()` returns the versioned cache name, because
`caches.open()` succeeds — it is only the fetching that is refused, so the cache
exists and is empty. Nothing throws where a reader or a deploy log would see it.
The app simply never works offline, which is the one property it was built for,
and the failure has no symptom on a machine that is online.

**It was found because the gate boots the app through a server that sends the
real `_headers`.** The first symptom was `net::ERR_FAILED` on a reload; the
actual error only surfaced after the worker's `respondWith` was temporarily made
to answer with its own exception text. Two other findings came free from the same
decision: `page.addScriptTag({content})` is refused under `script-src 'self'`, so
the gate serves axe from a same-origin URL and runs UNDER the policy rather than
around it; and `style-src 'self'` blocks parsed `style=""` attributes, so styles
are applied through the CSSOM instead — `element.style.width = …` is not blocked,
while a string handed to `setAttribute` is dropped in silence.

**The general shape: a header is not covered by the tests unless the tests are
served it.** Anything that only takes effect at runtime — CSP, `Permissions-Policy`,
cross-origin isolation, cache directives — is invisible to a gate that loads the
app from disk or from a bare static server. Point the gate at the real
configuration file rather than a copy, so the policy under test cannot drift from
the policy that ships.

**And the honest form of the directive is the narrow true one, not the narrower
false one.** `connect-src 'self'` is what this app actually needs and what it
actually does: the only requests it ever makes are the worker collecting this
app's own files. `'none'` was not a stronger promise, it was a wrong one.

---
