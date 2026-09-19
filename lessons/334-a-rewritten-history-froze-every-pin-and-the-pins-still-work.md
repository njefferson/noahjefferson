## 334 · A rewritten history froze every pin to it, and the pins still work

**Enforced by:** GATE Jefferson-Photography-Studio:tools/hub-pin-check.mjs —
now asks whether the pinned commit is reachable from the hub's `main`, not only
whether the repository's two records of it agree. Every sibling carrying that
file owes the same version of it.

A sibling repository runs the hub's shared gates by CALLING the hub's
`hub-gates.yml` at a pinned commit, and records the hub commit it has
reconciled with in `.doctrine-sync`. Those two are the same fact written twice,
and the existing gate refuses a commit where they disagree. That gate is
correct and it is not enough: **both can agree perfectly on a commit that is on
no branch at all.**

## What happened

The hub's history was rewritten on 2026-09-18 to take chat-session trailers out
of every commit message. A rewrite gives every commit a new SHA, so the moment
it landed, every pin anywhere in the family was pointing at a commit the hub
could no longer reach from anything.

Measured 2026-09-19 against the five hub commits the hub's own census records
siblings pinning. Four are unreachable from `main`: `3f2a373` (2026-09-02),
`a75d92d` (2026-08-26), `61a3f9a` (2026-08-22) and `042400b` (2026-09-03) —
every one dated before the rewrite. The fifth, `50207f0`, was re-pinned
afterwards and is on `main`.

**And they still work.** GitHub keeps serving a commit no ref reaches: fetching
`3f2a373` through the API on 2026-09-19 returned it in full, trailers and all —
the very trailers the rewrite existed to remove. So `actions/checkout` still
fetches it, the gates still run, and CI still goes green, out of a tree frozen
before the rewrite that can never contain a gate added since.

That is the whole failure. A pin left BEHIND is a known problem with a known
fix and a gate that finds it. A pin knocked OFF THE LINE is invisible from
inside the repository, because the two files agree, and `doctrine-sync --adopt`
cannot move it for the same reason — the marker is already what the pin says.

## The shape, past this family

**A rewrite is not a content change, it is an identity change, and every
external reference to the old identity keeps resolving for a while.** That is
the trap: the references do not break, so nothing announces them. Any pinned
SHA in another repository, any submodule commit, any `go.mod` pseudo-version,
any container digest built from a tag that moved — each survives the rewrite
looking healthy and is frozen from that moment.

So the obligation belongs to the rewrite itself: **a session or a person who
rewrites a published history owes a sweep of everything that pins it**, in the
same piece of work, because afterwards there is no failing signal to find it
by. Counting them first is the cheap part; the hub's census already listed
where every pin was.

## What was added

The gate now asks the second question — is this commit on the hub's `main` —
and it can only ask it where the hub is checked out beside the repository. It
SKIPS rather than fails when it is not, and PRINTS the skip, the same way
`branch-guard --artefact` prints the two checks it cannot perform on a runner.
A declared check that quietly stops running is the fail-open this whole family
of hooks exists because of.

It also skips, printing, when the clone has simply never seen the commit — a
pin pushed to the hub minutes ago is legitimately absent from a stale clone,
and refusing a commit over that would teach everyone to bypass the hook, which
costs more than the check is worth.

Proven by planting: with both records set to `3f2a373`, the first two checks
pass and the third refuses the commit.
