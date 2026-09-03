## 234 · The second door was on a different hostname from the room, so it guarded the door

**Enforced by:** CHECKLIST name-the-hostname-each-door-is-on — for every
protected surface, write down the hostname the door is configured for and the
hostname the DATA answers on; if they differ, the door protects markup. · GATE
unlisted-app:tools/help-check.mjs — the list of operations the Worker requires a
second factor for is read out of the Worker and counted against the manual's
list of them, so a sixth added without a word to the reader fails the release. ·
JUDGEMENT — which operations deserve a second factor is a reading of what each
one takes away from somebody, and no pattern can make it.

**Smell:** an access policy named for a *page* ("protect /admin") in an app whose
front end and API are separate deployments. Also: any sentence of the form "it is
behind Access" where nobody has said behind Access *on which hostname*. Also: a
source comment asserting that some other check is the load-bearing one — it is
usually right, and usually nobody has re-read it since it was written.

**The unlisted app, 2026-09-03.** The admin console is a static page on the
Pages origin with a Cloudflare Access application in front of it. Its API is a
Worker on `*.workers.dev` — a different hostname, with no Access on it, which
answers 401 on its own and authorises every administrative operation on one
boolean carried by an ordinary device token. Verified against the live service
rather than reasoned about: no `cf-access` headers on the response, no redirect
to a login, it simply answers.

So the protection was real and was protecting the HTML. Anybody holding an
unlocked administrator's device — the same device the ordinary app runs on —
could void a person's access, hand out or take back the administrator role, or
sign out somebody else's device, without ever loading the page Access guards.
The console was two factors; the capability was one.

**The file said so and had said so since it was written.** The first comment in
the API's admin module reads: every route requires the flag AND rides behind
Access on the admin hostname — *the check here is the load-bearing gate*. That
sentence is correct, and it is the whole finding, and it sat at the top of the
file being read past. **A comment naming which check is load-bearing is a
finding waiting for somebody to ask what the other one is doing**, and the
answer is often "protecting a different thing from the one you pictured".

**What the fix is, and the two mistakes available in it.** A knowledge factor
enforced by the API, on the operations that take something away from somebody
rather than on the surface. The first mistake is scope: a second factor in front
of *everything* becomes a keystroke typed by habit within a week, and then it is
no longer a decision about the operation in front of it — reading a roster or a
log is not what needs guarding. The second is the default: "no passphrase has
been set" must REFUSE, never allow. A lock that opens for anybody who never
fitted it is not a smaller lock, it is a lock-shaped thing, and it is the same
fail-open shape as a guard hook installed by a lifecycle script that never runs
(§163) and a gate that skips when its tool is missing (§149).

**And one that only shows up under measurement.** Every other secret in that
app is a minted 128-bit token, where a plain SHA-256 is the right thing: there
is nothing to guess. A passphrase a person chooses is not that, and reaching for
the same helper would have been the natural move — it is imported at the top of
the file already. PBKDF2 with the iteration count stored inside the value, so it
can be raised later without invalidating what is set. **The cost of that is a
platform question, not a cryptography one**: 210,000 iterations is roughly 100ms
of CPU, the paid Workers plan allows 30 seconds per request and the free plan
allows 10 milliseconds, and a change that works everywhere it was tested can be
killed mid-request on the one runtime it ships to. §225 is the same shape — the
platform limit decided the design and nobody asked it — and the answer is the
same: ask the limit before choosing the number, and if the session cannot reach
the answer, say which press would settle it rather than shipping the number as
if it were verified.
