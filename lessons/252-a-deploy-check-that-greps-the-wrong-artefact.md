## 252 · A deploy check greps one file and the bundler put the answer in another, so "not deployed yet" was a fact about the file list

**Enforced by:** CHECKLIST deploy-check-names-its-artefact — before writing any
"is it live?" probe, grep the LOCAL `dist/` for the same string and let that
answer decide which URL to fetch. A bundler decides which file carries a string;
a session guessing is guessing. · CHECKLIST follow-the-redirect — a probe that
reads `%{http_code}` fetches with `-L`, or it is measuring the host's URL
policy rather than the resource. · CHECKLIST pin-to-a-string-only-the-new-build-has
— the marker must be absent from the previous build; a version number that also
appears in shipped copy matches either way. · JUDGEMENT — whether the string you
chose can only mean what you think it means.

**Smell:** a deploy probe that greps the page's HTML for something the app
computes — a version, a feature flag, a CSS rule. A probe whose pattern was
written from the SOURCE rather than from the build output. `curl -s -o /dev/null
-w '%{http_code}'` with no `-L` against a static host. A version pattern with a
trailing separator (`v2\.10\.`) when the release's own stamp can end there. Any
"still waiting for the deploy" that has been true for longer than the deploy
takes.

**2026-09-09.** One release, three probes, all three wrong, none of them wrong
about the deploy.

The app stamps its version into the JS bundle at build time and nowhere in the
HTML. The first probe grepped `ir.html` for the version, so it could never match
— and the pattern also carried a trailing dot, which a release commit's own
stamp does not have, so it was two independent misses in one line. The second
probe read `%{http_code}` for `/debug.html` without `-L`; the host 308s
`.html` to the extensionless path, so a working page reported `308` and was read
as missing. The third grepped `ir.html` for a CSS rule that the bundler had put
in a separate hashed stylesheet.

Every one of those reported the same thing: **the new build is not live yet.**
It was live within a minute of each push. Three polling loops burned, and worse,
a session sitting on a correct release believing it had not shipped — which is
one decision away from pushing again to "fix" it.

**The direction is what makes it dangerous, and it flips.** These three failed
CLOSED, which is merely wasteful. The same instrument fails OPEN the moment the
string it greps for is present for another reason: grep the HTML for `2.10` and
the in-app patch notes will carry it while the code is still the old build, and
the probe will certify a deploy that never happened. §242 is that failure with
the release missing; this is that failure with the CHECK missing.

**The general shape.** A deploy check is a claim about bytes at a URL, and it
has three joints where it can be about something else: which file (the bundler
chose), which URL (the host rewrote), and which string (the build stamped).
Two of the three are decided by machinery the session never looked at, and the
local build already contains the answer to all three. Read the artefact you
built before writing the probe for the artefact you shipped.
