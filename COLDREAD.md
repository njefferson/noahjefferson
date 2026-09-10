# The cold read

A fresh agent, given the deployed app and nothing else, told to use it and say
what happened. It is the most productive instrument this family of repos has,
and every one of its rules below exists because a run went wrong in that exact
way.

Canonical here like the gates. A sibling **opens this file and runs it against
its own deployed URL** rather than reinventing the method — which is what
happened for a year while the reasoning sat in two lessons nobody opened
(§206 designed the claims walk, §233 found the half it was missing, and §233's
own last paragraph is the diagnosis: a CHECKLIST that lives inside a lesson is
a step somebody has to remember).

---

## The two things a cold read may not do

### It reports a SYMPTOM. It does not pick the remedy.

A fresh reader can say *I stopped here*, *this said something untrue*, *I could
not find it* — evidence nothing else produces. What it cannot say is what the
app should therefore do, because it has read none of the research, none of the
ADRs and none of the refusals. Its expectation is one person's expectation, and
these apps are not built to meet expectations.

**The remedy is decided from the research and the record** — the app's own
collision catalog, its ADRs, its laws — and **the entry is cited when the fix
lands, or the fix is refused.**

Measured, in one session, on one cold read:

- Two fixes taken from the research **both held.**
- Two fixes taken from a session's own reading of a symptom were **both wrong**,
  and both were caught by a browser walk rather than by review.

One of those two had the research pointing the *other way*: the reader met a
worry with nowhere to go, the session recommended a ninth sort destination, and
the catalog entry on that exact class spends its whole length refusing one —
"a state of affairs is not work, and offering one as the next thing to do is the
category error already refused for a person, a place and a role."

A cold read agreeing with the research is luck. Checking first is the method.
(See §262: a finding is a fact about the READER's view until somebody checks
whose view it was.)

### It is never run as a PERSON.

Never *"as a neurodivergent user"*, never as any persona. Two reasons and both
are load-bearing:

1. **A persona returns what the model believes about a group**, not what the app
   does. It is a stereotype with a costume on.
2. **The condition is not owned by any group.** These apps are designed against
   a *condition* — low capacity, high demand, interruption, engagement that
   varies — rather than a diagnosis. Everybody enters it: stress, illness,
   grief, a bad week, a new baby, a deadline. That is the whole reason one
   design serves everyone.

So the audience question — *can somebody who meets this condition most often and
most severely understand this app* — is answered by putting the app **under the
condition**, as circumstances the run is given:

- arriving cold, with no memory of a previous session
- interrupted mid-action and made to come back
- minutes rather than an hour
- holding more than fits in a head
- on a phone, by touch

Those are testable. *Be neurodivergent* is not.

---

## How to run one

**Two passes, as two SEPARATE agents, in parallel.**

§233 states an ordering rule — the unprompted pass first — because it was
written for one agent doing both in sequence, where order is the only protection
there is. Two independent agents make contamination **structurally impossible**
instead of promised, and cost one wall-clock run rather than two.

Neither agent may read the repository. Not the source, not the README, not the
changelog, not the notes. A claim in hand is a spoiler for comprehension.

### Pass 1 — the unprompted pass (discovery)

Give it the URL and nothing else. It discovers; it is the only half that can.

```
You are going to try to USE a web app you have never seen. Nobody will tell you
what it is for. Do not read any source code, any README, any repository, or any
documentation file on disk — ever, at any point in this task. That would spoil
the only thing being measured.

The app is at <URL>

Drive it in a real browser at a phone viewport (390x844), by taps rather than
keyboard shortcuts, because that is how this app is actually used. Take
screenshots as you go and look at them.

Your task is not to review it. Your task is to GET SOMETHING DONE.

1. Arrive with nothing. Work out what it is for.
2. Then actually run your own week through it, start to finish. Put down at
   least a dozen real things a person genuinely has — some quick, some vague,
   some with dates, some that are projects with steps inside them, some that
   depend on another person, some that are just worries rather than tasks.
   Invent them; do not use anything from a real person's life.
3. Sort all of them. File them where they belong. Make whatever containers you
   need.
4. Then USE what you built: ask the app what to do next, do some of it, mark
   things done, get interrupted and come back, change your mind about
   something, look for one specific thing you put in earlier, and try to see
   the whole picture of what you are carrying.
5. Close the loop: reload the page and confirm everything you did is still
   there and still makes sense.

Push all the way to the end even where it is unpleasant. If you get stuck, note
exactly where and what you tried, then find another way and keep going. The
measurement is how far a determined person gets and what it costs them.

Report, quoting the app's own words:
- Could you tell what it was for, and how fast? What told you.
- THE WALL. The single worst moment — where you would have stopped if you were
  not being paid to continue. Quote the screen. Say what you expected and what
  happened.
- Every place you got stuck, in order, with what you tried and how you got past
  it (or did not).
- Anything that read as code, jargon, or a developer talking to themselves.
- Anything you expected and could not find. Include things you went looking for
  and were relieved not to find.
- Anything in an unexpected or annoying place — a control several taps away,
  something you scrolled past repeatedly, a route back that was not where you
  reached for it.
- Anything you could not undo, or were afraid to press.
- Did the app ever tell you something that turned out not to be true? Any count,
  status, promise or claim that did not match what you found. THIS ONE MATTERS
  MOST.
- What you actually accomplished, and what you gave up on.
- After the reload: was anything lost, and did anything read differently?

Do not be polite and do not soften anything. Do not suggest fixes — describe
what happened. If something worked well and mattered, say so briefly, so the
report can be trusted in both directions.

One hard rule: never claim you did something you did not do, and never describe
a screen you did not see. If a step failed, report the failure rather than the
intent.
```

### Pass 2 — the claims walk (verification)

Give it the release claims, each written as **a place to stand and a thing that
must be visible there**, and nothing else. Diff its report against intent.

```
You are checking a web app against a list of claims. Do not read any source
code, any README, or any repository — only the deployed app.

The app is at <URL>

Drive it in a real browser at a phone viewport (390x844), by taps.

For each claim below: go to the place it names, and report whether the thing it
names is visible there. Quote what you actually see. If you cannot reach the
place, say so and say what stopped you — do not substitute a different route
and report success.

  <one line per claim: "Standing at X, you should see Y">

Report per claim: FOUND (quote it), NOT FOUND (say what was there instead), or
COULD NOT REACH (say what stopped you). Never infer a claim is satisfied
because something similar was nearby.
```

**§206's rule stands: the claims are written BEFORE the run**, from the release
notes, by somebody who is not the agent. A claim invented after the fact to
match what was found is not a check.

---

## Where the records live

**The method is canonical here; the records are not.**

Each app keeps its own cold-read records in its own `NOTES.md`, beside the
releases that answered them — that is where a session looks when it asks "has
this been found before", and it is where the fix's own release notes point. The
hub's `coldreads/` holds only runs of the hub site itself.

This follows the gates exactly: shared method, per-repo output. It is written
down here because the alternative — app records accumulating in the hub — puts
one app's findings where no session working on that app will read them, which
is the failure this whole file exists to prevent.

---

## What a run is worth, and what it costs

A run is one wall-clock browser session per pass. Both passes in parallel is
one session total.

It is expensive and it is the only instrument that has ever found this class:

- **Things the app SAYS that are not true.** Five green-gate suites, thirty CI
  gates and three browser walks passed a coverage screen that listed finished
  work as "returns today", and an app that counted its own internal bookmark
  among the reader's things. Both survived a reload. Neither is reachable by any
  test that asks whether a component renders.
- **Conformance that is not reachability.** A control can be 44px, correctly
  named, focus-ringed and contrast-measured, and still mean the wrong thing
  because of where it sits. A list of places you could tap, printed directly
  under a question, is read as the answer to the question.
- **The give-up point.** No gate has an opinion about the ninety seconds at
  which somebody stops.
