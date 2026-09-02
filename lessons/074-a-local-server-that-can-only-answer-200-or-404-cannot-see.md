## 74 · A local server that can only answer 200 or 404 cannot see any defect that needs a redirect, and the gap reads as an engine difference

**Enforced by:** GATE quietkeep:tools/serve.mjs — the walk server can issue redirects, and the §7h walk drives one through the capture entrance. CHECKLIST rig-can-do-what-the-edge-does — before blaming an engine for a defect only one browser shows, list what the local server can answer that the edge can, and what it cannot.

A PWA's capture entrance died on a real device with the browser naming the cause:

    Safari can't open the page.
    The error was: "Response served by service worker has redirections".

The defect was genuine and one line wide. A service worker was answering a
navigation with a response fetched through a redirect, which the spec makes a
network error — the document's URL and the response's URL would disagree. It
appeared because a privacy fix built a fresh `Request` to strip a query string,
and **a constructed Request defaults to `redirect: "follow"` where a real
navigation carries `redirect: "manual"`.** The original hands a 3xx back
untouched for the browser to follow; the replacement chases it and returns a
response flagged `redirected`. Only on navigations carrying a query — which was
exactly one path, the app's widest way in.

**The first conclusion was that WebKit enforces the rule and Chromium does not.**
It is written down here because it was wrong, it was plausible, and it survived
being planted: with the fix removed, the Chromium walk went GREEN. That looks
like proof of an engine difference and is not.

**Chromium enforces it identically — `ERR_FAILED`.** The plant passed because the
local server had no way to issue a redirect, so no redirect was ever followed and
the defective branch was never entered. The rig had answered every path 200 or
404 for its whole life. **Not an engine difference: a hole in the harness, which
is the less flattering answer and the only useful one.**

**The tell was available and was misread.** The server logged every request it
received; after the failing navigation it had logged one path and not the
redirect target. "The second request is missing" is the whole diagnosis, and it
was visible before any theory about browsers was formed.

**Two further false trails, both of which look exactly like "the fix does not
work":**

- **The browser's own HTTP cache answered the redirect with no request at all.**
  Redirecting to a path the walk had already loaded meant the canary body could
  never arrive, so the check failed identically with the fix present and absent.
  Point a redirect at a path nothing has ever fetched.
- **`upgrade-insecure-requests` in the shipped CSP rewrote the redirect target to
  `https://127.0.0.1:<port>`** and killed it with an SSL error. The directive is
  inert in production, which is https throughout, and destructive locally, which
  is http by necessity. It is now dropped for local serving only, with the reason
  written beside it.

**The general shape:** when a defect appears on one browser and not another, the
first question is not *which engine is stricter* but *does my harness reproduce
the condition at all*. An engine difference is an interesting answer, so it gets
believed early; a missing capability in the rig is a boring answer, so it gets
checked late. Reverse that. And when a planted defect passes, that is never
reassurance — it means the plant did not reach the code, and finding out why is
the actual work.

---
