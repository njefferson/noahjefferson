## 173 · A 200 from a static host is not evidence the page exists, and the client may be lying about why it cannot reach it

**Enforced by:** GATE quietkeep:tools/deployed-check.mjs — asserts deployed
CONTENT against the root document the host itself serves, never a status code
and never a hand-typed marker. · CHECKLIST proxy-before-blocked — when one
client gets 403 and another gets 200 for the same URL at the same moment, the
client is misconfigured; read the proxy's own README before concluding the host
is blocked. · CHECKLIST fallback-aware-probe — on any host with an SPA or
catch-all fallback, ask what a URL that certainly does not exist returns, and
build the probe around that answer.

**Smell:** verifying a deploy by status code, on a platform that serves a
fallback document. Also: any "we cannot reach X" written down as a standing fact
rather than as an observation with a date and a container attached.

Three things went wrong in one sitting, and each looked like the others.

**The record said it was impossible.** A repo's notes carried "a session cannot
read production — every `pages.dev` host is refused 403 at CONNECT", tested in a
fresh container, with an explicit *do not spend another session re-testing this*.
It was accurate when written. The condition then changed — the host was added to
the session's egress allowlist — and the instruction outlived it, which is
exactly what an instruction not to look is for. **A negative capability finding
needs the date and the configuration it was true under, or it becomes a rule.**

**Then the client lied about why.** Node's built-in `fetch` does not read
`HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1`, and it is read at STARTUP — setting
it in-process is too late. Without it the request returns **403 with the proxy's
own allowlist message in the body**, which reads precisely like the host being
blocked. `curl` was returning 200 for the same URL in the same shell seconds
earlier. Two clients, two answers, and the wrong one was the one that looked
authoritative. The environment documented the fix; guessing would have concluded
the grant had not landed.

**Then the probe passed on a page that was not there.** Cloudflare Pages serves
the root document for any unknown path, so `/paths` on a host without that page
returns **200 and 189KB of the whole application**. A status-code check calls
that shipped. Reading content fixed it — but the first content check tested for
`<title>Quietkeep</title>`, which is one edition's title and not the other's, so
the second edition reported a 185KB page it did not have.

**The fix is to ask the host what its own fallback looks like.** Fetch `/`, then
treat any page byte-identical to it as absent. Nothing is typed into the checker,
so a rename, a second edition or a new title cannot make it pass wrongly — the
same reason every set in that repo's `help-check` is read from the source that
defines it rather than restated.

**And reachability is not a property of the tree**, so the tool SKIPS an
unreachable host with the reason printed rather than failing. A gate that goes
red because of how somebody's container was configured teaches people to ignore
red, which costs more than the check was worth.
