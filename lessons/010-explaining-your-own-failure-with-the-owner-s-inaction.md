## 10 · Explaining your own failure with the owner's inaction

**Enforced by:** GATE hub:handoff-check.mjs · CHECKLIST evidence — every claim about external state cites the log line or response it came from.

**When a call fails, the cause is a claim about the world — go and find it.
"You must not have approved it" is the one guess that costs the person who
cannot check it, so it is the last one you are allowed to reach for, never the
first.**

MyFax PR #1, 2026-08-01. Subscribing to PR activity through the
`claude-code-remote` MCP server returned `MCP error -32003: MCP tool call
requires approval`. What followed was the whole anti-pattern in about four
minutes: the identical call was **retried verbatim** (twice — the same call is
not new evidence), then the same server's `send_later` failed the same way, and
the owner was told the tools were "blocked pending approval in this session" and that
"this session can't run that prompt" — despite every one of them already being
approved. The correction came back immediately, and it was right.

The diagnosis took two minutes once it was actually attempted, and every piece
of it was sitting on disk the entire time:

- `~/.claude/mcp-needs-auth-cache.json` contained exactly one server —
 `711ebc42-…` — and the failing server, `bf7c680d-…`, was **not in it**. The
 harness did not think that server needed authorisation at all.
- `~/.claude/launcher-settings.json` pre-allows `"Skill"` and nothing else, so
 the approval gate is a harness permission policy, not a pending user action.
- **The decisive tell was in the transcript before the wrong explanation was
 ever offered**: `mcp__github__subscribe_pr_activity` — the *same action, same
 PR, different server* — succeeded on the first attempt. Two servers, one
 action, opposite outcomes is a server-side difference. It cannot be something
 the user did or failed to do, because the user did the same nothing for both.

Three things generalise, and none of them are about MCP:

- **A failed call is a puzzle you own.** Read the error code, check the tool's
 state, find the config that governs it, and compare against a call that
 works. Attributing it to the user before doing that is not a hypothesis, it is
 a way of stopping.
- **Guess in the direction where being wrong costs YOU.** "The server is
 misconfigured" is wrong at the price of a minute of your own time. "You didn't
 approve it" is wrong at the price of sending the owner to inspect a setting that
 was never the problem, while pinning the fault on the owner, the only one who
 can disprove it.
- **"I don't know why yet" is a complete, honest answer.** Say what you ruled
 out, say what the fallback costs, and move. The failure here was never not
 knowing; it was filling the gap with the user's name.

*(the hub / MyFax, 2026-08-01. Codified as Doctrine §5b the same hour — the
fallback, a session-only cron, was fine; the explanation was the defect.)*

**A carry list written by hand is a bug with a delay fuse — and a test that
names its coverage shares the blind spot of the code it guards.** Quietkeep's
"fold a duplicate" verb writes across what the survivor lacks: dates, the note,
people, children. That list was written once, correctly, by the release that
built it. Then three later releases each added a field to the same data
structure — a standing decline, a decision log, dependency edges — and not one
of them visited the merge, because nothing made them. Every omission silently
took a real record off every surface the moment a duplicate was folded. The
part worth carrying between apps is not "we forgot"; it is that **the test could
never have caught it.** It was called , and it asserted exactly those
four, so it enumerated the same list the code did and was blind in precisely the
same place, permanently. A test whose name is a promise and whose body is an
enumeration is not guarding the promise. The fix is a **totality gate**: a map
from every field of the structure to a decision — carried, handled elsewhere, or
deliberately left behind *with the reason in words* — checked by the type system
so a new field cannot compile until someone has written the sentence. A reasoned
"not carried" is a fine answer; forcing the sentence is the whole mechanism.
Anywhere one structure is copied, transformed, or exported field-by-field —
serialisers, API mappers, form submissions, migrations — the hand-written list
will drift the same way, and the same gate stops it. Two smaller riders from the
same audit: writing the invariant *generically* (for every object-valued key,
assert identities differ) found two aliasing bugs a field-list test had been
walking past; and a randomised property test needs its own **coverage** pin,
because Quietkeep's strongest test had silently stopped exercising nine of the
kinds it was supposed to cover, including the one branch changed since it was
written.
*(Quietkeep, 2026-08-01 — the 1.9.2 audit of nine releases.)*
