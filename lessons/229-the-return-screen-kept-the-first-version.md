## 229 · Every improvement landed on the screen you see once, and the screen you come back to kept the first version

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — every Settings
section named in prose anywhere in the app, the front page, the guide, the
administrator's manual or the console's own welcome must match a legend the
Settings screen actually renders; it found four more on its first run, two of them
invisible to a search for the phrase because the name was wrapped across a line.
· GATE unlisted-app:tools/help-check.mjs — and a
second one for the recurrence below: each landing a scanned square can reach is
sliced out of the file by its own branch and asked separately whether it leads
with installing, whether it assumes an app that may not be there, and whether
the escape hatch is reachable without being the first thing offered. Per BRANCH,
because all three live in one file and the improved one makes the file look
right. · CHECKLIST when-two-screens-do-one-job-diff-them — before shipping an
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
name — three screens in the app, the front page, the administrator's manual,
and the admin console's own welcome. The last two are the pages somebody reads when they
are ALREADY stuck. Two of the six were invisible to a search for the phrase,
because the name happened to wrap across a line break in the source. A label
quoted in prose is an API, and nothing was holding the callers to it.

---

**IT HAPPENED AGAIN THE NEXT DAY, AND THE GATE WRITTEN HERE COULD NOT SEE IT.**
The check above holds prose to the screen it names. What went wrong the second
time was not a name — it was a whole SECTION missing from one of two screens
that do the same job.

A person arriving on a phone has nothing installed yet, and the invitation
landing had been rebuilt around that: drawn install steps first, then the code
handed across. The DEVICE-LINK landing is reached by exactly the same person on
exactly the same kind of device — a device-link code is *for* a device that is
not signed in, which is usually one the app has never been on — and it kept the
first version. It opened "open the app on your home screen" at somebody whose
home screen had none, and the only way on from there was the browser sign-in,
which is the one outcome both screens exist to prevent.

**And a third entry point had the same defect wearing a disguise.** Being signed
in on that screen looks like proof the app is installed, and is not: the
invitation page offers "join from this browser instead", so a person can arrive
there having never installed anything. Nothing in a browser can ask whether a
home screen holds an icon, so that one offers the steps behind a disclosure
rather than pushing them — the honest shape when the app cannot know.

**The gate that catches this is per BRANCH, not per file.** All three landings
live in one file, so any check that the file mentions the install steps
*somewhere* would have passed for the whole of the defect's life — the improved
screen's own code is what makes the file look correct. Slice each entry point's
own source and ask what is in it: does this one lead with installing, does it
assume an app that may not be there, is the escape hatch reachable and NOT the
first thing offered.

**The checklist item above was right and was not run.** "Find every other entry
point into that flow and compare what it offers" would have found this in a
minute, on the day the invitation page was rebuilt. A checklist nobody runs is
the reason the gate has to exist, and the gate has to be shaped like the defect
rather than like the last one.

