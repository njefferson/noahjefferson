## 18. Read the terms from the publisher, then make the gate enforce them

**Enforced by:** CHECKLIST licence-terms — read the publisher’s own licence page before shipping their data, and turn each condition into an assertion rather than a promise.

adsb.fi's open data terms require a citation with a link to their home page.
That is a CONDITION OF USE, not a courtesy — and a condition that lives only in
a code comment is one that quietly lapses in the next refactor, at which point
the app is out of compliance and nobody knows.

**The licence condition is now an assertion in the accessibility gate and a
planted fault that proves the assertion works.** If the link goes, the build
goes red and says why.

Also worth stating plainly, because it changed a "no" to a "yes": the terms had
been recorded as unreadable because the host was blocked from the build sandbox.
They were in the publisher's own GitHub repository the whole time. A blocked
hostname is not an unreadable policy — see §12.

*(fauxplane, 2026-08-02.)*

---
