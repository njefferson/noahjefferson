## 207 · A link that renders is not a link that arrives, and a widget that is declared is not a widget that loaded

**Enforced by:** GATE Jefferson-Line:tools/worker-check.mjs — every generated
user-facing link is asserted against the origin it must land on, not merely
against being non-empty. · CHECKLIST follow-the-link — for any surface whose
whole job is to send someone somewhere, fetch the destination and assert its
status, in the same check that asserts the surface renders. · JUDGEMENT — a
presence check reads as a coverage check and is not one; "the card renders" and
"the card works" are different sentences and only one of them was ever tested.

**Smell:** a check that asserts an element, a tag, an href, or a config key
EXISTS. Also: a feature described in the spec as first-class, built once, and
never exercised end to end because it has no obvious failure mode. Also: any
app served from two origins.

**One app, two independent instances of the same defect, both shipped green.**

**The link.** A private app served its API from a Worker and its frontend from
Pages — two origins. The Worker rendered the unfurl card for invitation links,
and built the card's button from the only origin it had in hand, its own:
`${url.origin}/app/#/join/<token>`. There is no `/app/` on the Worker. Every
invitation anyone would ever paste led to a 404, and the invite link was the
only door into the product. The card was correct in every other respect — right
title, right description, right token, valid HTML, 200 OK — and the unfurl
preview in a messaging app looked perfect.

**The widget.** The same app's join screen declared a bot-check container and
called `window.turnstile.render` guarded by `if (window.turnstile)`. The
provider's script tag was never added to the page, so that global was never
defined, the guard was always false, the widget never rendered, and no token
was ever sent — silently, because the guard's whole purpose was to be safe when
the library was missing. The screen looked finished.

**Why both survived.** Every check asked whether something was PRESENT. The
card existed and returned 200. The container div existed. The config key
existed. Nothing asked where the button went or whether the library arrived.
`url.origin` is the trap in miniature: on a two-origin deployment it is always
available, always plausible, and always the wrong origin for a link a human
will click — so the bug cannot present as a crash, an exception, or an empty
value, only as a destination nobody visited.

**The rule.** For anything whose purpose is to hand someone off — a link, a
redirect, an unfurl, a third-party script, an OAuth callback — the check is the
DESTINATION, not the emission. Fetch it and assert what comes back. And where a
deployment spans two origins, the origin a link needs is a configured fact,
declared once and shared by everything that builds a URL; the origin the code
happens to be running on is not that fact, and reaching for it is how the two
silently disagree.
