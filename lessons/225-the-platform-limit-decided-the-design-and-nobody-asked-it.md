## 225 · The platform limit decided the design, and the code shipped without anyone asking what it was

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — a scanned
credential must land on the install-first screen rather than the credential
form, the app must say in words that a scan on iOS lands in the browser, and
no square may be drawn where scanning it cannot complete the task. · GATE
unlisted-app:tools/worker-check.mjs — the lookup a scan needs discloses
exactly what the link lookup discloses and no more. · CHECKLIST
name-the-handoff-target — for any credential that leaves the app and comes
back through another program (a camera, a mail client, a password manager),
write down which program receives it and what that program will do, before
choosing what to encode. · JUDGEMENT — whether the receiving program's
behaviour helps or harms is specific to the flow and cannot be read off a
capability table.

**Smell:** encoding a URL into anything a *different* application will open —
a QR, a deep link, a mailto, a share sheet — without having written down which
application that is on each platform. Also: a fix that makes a payload shorter
or tidier and quietly changes where it lands.

**The unlisted app, 2026-09-02.** A QR carrying a plain code was reported reading
correctly on an iPad and then offering a web search. The fix was to carry a URL
instead, which the camera would open. That much was right.

**The owner's next question was the one that mattered: does the inability to
open into an installed app affect this?** It does, completely. iOS opens every
scanned address in Safari and cannot route one into a home-screen web app —
Android does this, iPhone and iPad do not — and the installed app keeps a
sign-in separate from the browser's.

**So the same change was correct for one credential and harmful for the other,
and nothing in the code distinguished them.**

- An **invitation** scanned into the browser is fine: the browser is where
  somebody who has not installed the app is supposed to be.
- A **device-link code** scanned into the browser is useless. Its entire
  purpose is signing in the *installed* app on a second device. Following it
  signs in the browser, and the app on the home screen is still asking for a
  code.

**And it had already caused a regression, one release earlier.** To make the
payload short enough for a single-block encoder, the invitation square had been
repointed from the link to the code, and the code's route landed on the
credential form rather than on the install-first page. On an iPhone that form
is *in Safari*. Pressing its button joins in Safari and leaves the installed
app signed out — which is the single failure the install-first page exists to
prevent, reached more quietly than the plain link could ever have reached it.
The change looked like a payload-size fix. It was a change of destination.

**The rule: a credential that leaves through another program is designed for
that program's behaviour, not for the payload's tidiness.** Write down which
application receives it on each platform and what that application will do,
before choosing what to encode. Here the answer differs per credential AND per
platform, so the design does too: one square lands on the install-first page,
the other is not drawn at all on the platform where it cannot work, and the app
says why in both places rather than leaving it to be discovered.

**A square that cannot finish the job is worse than no square**, for the same
reason §95 gives about an unreachable control: its presence answers "have we
handled this" for everybody afterwards, and it looks like a shortcut right up
until it deposits somebody somewhere useless.

---

**And the second half of the same session: a name is not a description.**

Two calendar feeds sat on one host. `hsu-events-calendar-academic-deadlines`
was expected to be administrative chaff and turned out to independently confirm
four dates read out of a PDF by a hand-written decoder — two sources with no
way to share a mistake. `planning_calendar` sounded exactly like the thing a
family planner wants and is two hundred rows of class sections.

Wiring the second by its name would have flooded a family's day sheet with
`ANTH 102 1 41567`, and wiring the first — the one that sounded administrative
— would have been noise too, since almost all of it is add/drop and census
deadlines. **The useful one was useful for a purpose neither name suggested:
as a check, not as a source.** Reading both was the only way to know any of it,
and it cost one request each.
