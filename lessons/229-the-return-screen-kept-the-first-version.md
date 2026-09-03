## 229 · Every improvement landed on the screen you see once, and the screen you come back to kept the first version

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — every Settings
section named in prose anywhere in the app, the front page, the guide, the
Commodore's manual or the console's own welcome must match a legend the Settings
screen actually renders; it found four more on its first run, two of them
invisible to a search for the phrase because the name was wrapped across a line.
· CHECKLIST when-two-screens-do-one-job-diff-them — before shipping an
improvement to a flow, find every other entry point into that flow and compare
what it offers. · JUDGEMENT — the screen with the best version is usually the
one somebody was looking at while building it.

**Smell:** a feature reachable from a first-run screen and from a settings
screen. Also: any handover — a code, a link, an address — that one screen dresses
properly and another prints into a span.

**The unlisted app, 2026-09-03.** Signing a second device in needs a short code,
and there are two places to get one: the welcome screen a reader sees once, and
a button in Settings, which is the only one anybody will ever find again.

The welcome screen minted the code, drew a QR of a URL that lands the other
device somewhere useful, said how many minutes it lasts, said running out costs
nothing, and offered another. Four releases of work went into it, including a
finding about what an iPad's camera does with a bare ten-character code — it
offers to search the web for it — which is why the square carries a link.

The Settings button wrote `Code: XXXX (10 minutes)` into a span, exactly as it
had on the day it was written. Every one of those findings was about the flow
and none of them reached the second door into it. What that button does on a
live install: prints a code, draws no square, says nothing about where it
goes.

**Why it survives.** It is not neglect, it is where the attention was. The
welcome screen is where you land when you test a change to onboarding, so it is
the screen in front of you while you improve onboarding. The settings entry is
the one a person uses on their eleventh day, which is a day no session has.

**And renaming it cost six more.** Splitting that fieldset in two meant renaming
"Link another device", and six other places sent a reader to look for it by that
name — three screens in the app, the front page, the Commodore's manual, and the
admin console's own welcome. The last two are the pages somebody reads when they
are ALREADY stuck. Two of the six were invisible to a search for the phrase,
because the name happened to wrap across a line break in the source. A label
quoted in prose is an API, and nothing was holding the callers to it.
