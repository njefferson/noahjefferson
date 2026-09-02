## 157 · `clients.claim()` fires `controllerchange` exactly as a replacement does, so "reload when the worker changes" reloads every first-time visitor

**Enforced by:** GATE solve-ent:tools/update-walk.mjs — serves one release,
installs it, serves a genuinely different one from the same origin, and asserts
that a FIRST visit is neither reloaded nor told about an update. ·
CHECKLIST first-install — for every §7h behaviour, ask what it does on the visit
where somebody arrives, and answer it by driving a real second worker rather than
by reading the code.

**Smell:** any handler on `controllerchange`. There are two ways to get a
controller and only one of them is an update.

Doctrine §7h asks for a worker that WAITS rather than taking over under the open
page, a reader who is told in words, and a reload only when the reader releases
it. The obvious implementation is a `controllerchange` listener that reloads,
because a controller changing is what a swap looks like.

**It is also what a first install looks like.** A worker that calls
`clients.claim()` in `activate` — which is the normal thing to do, so the page it
was registered from is served by it rather than waiting for the next load —
fires `controllerchange` on that very first claim. Nothing was replaced. There
was no previous version. And every first-time visitor gets a reload they did not
ask for, on the visit where they had just arrived.

It was found by an accessibility gate whose page navigated out from under it
mid-measure, which is the only reason it was found at all: **a reader would have
seen a flash and thought nothing of it.**

**The first fix was worse than the defect, and that is the part worth keeping.**
It captured whether the page had a controller once, before registering, and
refused to offer an update unless it did. Correct for the first paint and wrong
forever after — a page that arrived as a newcomer could then never be offered an
update, however long it stayed open. One line, and the app silently lost the
whole behaviour for exactly the people who leave a tab open.

**The signal is not `controller`, it is `registration.active`,** read at the
moment a new worker installs. A waiting worker beside an active one is an update.
A waiting worker with no active one is somebody arriving.

And the reload guard needs two halves, not one: the reader pressing the control,
AND the case where somebody takes the update in another tab, that worker claims
every client, and THIS page becomes old markup being served new modules — §7h.1's
hazard arriving sideways.

**The general form: an event that means two things cannot be handled as if it
meant one.** The same shape is everywhere — a `change` that fires on
initialisation as well as on edit, a watcher that emits on first read, a
subscription that replays. The fix is never a flag captured once at start-up;
it is asking the source of truth at the moment the event arrives.

**And the reason this needs a real second worker to catch:** the hub's
`pwa-check.mjs` reads source text and says so itself — it catches NEVER
IMPLEMENTED, not implemented-subtly-wrong. It passed cleanly on the version with
this defect live. A source gate cannot tell a worker that waits from one that
appears to.
