# COLDREAD.md — the two-pass cold read

Canonical here, like the gates. A sibling does not fork this file; it opens it
and runs the two prompts below against its own deployed URL.

This exists because [LESSONS §233](lessons/233-a-claims-walk-asks-can-you-find-x-never-what-was-that-like.md)
diagnosed its own failure in its last paragraph: §206 was filed as a CHECKLIST,
and a checklist step that lives inside a lesson is a step somebody has to
remember. It was a year of nothing in every repo in the family but the one it
was written in. So the method is a file now, with the prompts in it, because
the thing that was missing was never the reasoning.

## What it is

Two passes over a DEPLOYED build by an agent with no build context.

- **Pass one, unprompted.** Somebody has just invited you to try their web app.
  Use it. Report what actually happened. This is the only pass that can
  DISCOVER, because it is the only one that has not been told what to look for.
- **Pass two, the claims walk.** Here are the release claims, each written as a
  place to stand and a thing that must be visible there. Walk them. This pass
  VERIFIES: it answers whether named things can be found, and nothing else.

The unprompted pass must not be able to see the claims. §233 states this as an
ordering rule — unprompted first — because it was written for one agent doing
both passes in sequence, where order is the only available protection.

**Run them as two SEPARATE agents instead, in parallel.** Order stops being a
promise and becomes a property: the discovery pass cannot be contaminated by a
checklist it was never handed, and the two runs cost one wall-clock run rather
than two. The claims agent gives up having a first-run experience to draw on,
which is not a loss — verifying is its whole job.

## Isolation is by instruction, and the run declares it

The agent is forbidden the source tree and the repo checkout by name, and is
required to state what it consulted. A leak invalidates the RUN, not the
method. Name the forbidden paths explicitly in the prompt; an agent in a
container with the repo on disk will read it otherwise, reasonably, because
nothing told it not to.

## Writing the claims

Each claim is a PLACE TO STAND and a THING THAT MUST BE VISIBLE THERE. Not a
feature name, not a changelog line. "The Infrared panel with a photo open" and
"a control called Restore depth that is ON by default, and beside it a strength
slider" — so the report can say *I stood there and it was not there*, or *I
stood there and here is what it was like*.

A claim that names an internal identifier, a file, or a function has failed
before the walk starts: the reader cannot stand in a source file.

## The prompts

Pass one, unprompted. Substitute the URL and the forbidden paths:

```
Somebody has just invited you to try their web app. It is at <URL>.

You have never seen it before and you know nothing about it. Use it the way
you would use a thing a friend just sent you: open it, work out what it is
for, try to do the thing it appears to be for, and stop when you have either
done it or given up.

Then report what that was actually like. Not a review and not a bug list —
an account. What you understood immediately and what took a second read.
What you skipped. What you pressed that did nothing you could see. What you
could not tell. Anything you had to read twice. Anything that felt like it
was written for somebody who already knew.

You may use a headless browser. You must NOT read <FORBIDDEN PATHS>, or any
source for this app. At the end of your report, list every source you
consulted.
```

Pass two, the claims walk. Paste the claims in place of the marker — and check
that you actually did, because a prompt shipped with the marker still in it is
a run that stops and asks:

```
You are walking a deployed web app at <URL> against a list of release claims.
You have no build context and you are not getting any.

Each claim below is a place to stand and a thing that must be visible there.
For each one: go to that place, look for that thing, and report whether you
found it AND what it was like to try. "Found it" on its own is not a report.
Where you could not find it, say what you did find instead.

You may use a headless browser. You must NOT read <FORBIDDEN PATHS>, or any
source for this app. At the end of your report, list every source you
consulted.

<CLAIMS>
```

## What it costs

One long report per pass on a mid-tier model, plus the browser work. Both
passes in parallel is one wall-clock run. It is a deliberate spend and it is
announced before it starts, like every other expensive thing (Doctrine §11b).

## The run record

Every run gets a file under `coldreads/`, named `<date>-<repo>.md`, carrying:
the deployed URL and version walked, the claims as handed over, what each pass
found, what was fixed and what was not, and **every deviation from this file**.
A run whose deviations are not written down is a run whose findings cannot be
weighed later.
