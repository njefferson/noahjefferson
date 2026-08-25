## 71 · An intermittent failure is a defect that has told you its reproduction rate, and "re-run it" is how it gets filed as a flake

**Enforced by:** CHECKLIST intermittent-is-a-defect — when a gate goes red once and green on retry, do not re-run to confirm. Find the state that differed, CREATE it on purpose in the gate, and confirm the new check fails deterministically with the defect planted. If the condition cannot be created, say so in the gate's own comment rather than deleting the check.

A browser walk went red on one check, and green on the next four runs. The check
was not one of the ones being added — it was an old assertion that a shortcut
lands with the capture line focused, and it read `got ""`.

**`""` is not "the wrong element". It is NO element**, and it is what focusing a
hidden node does. The release under test had added a second field that hides the
first when a draft is waiting, and the code that restored that draft ran AFTER
the code that focused. So the shortcut whose entire job is to land you ready to
type landed you on nothing — no cursor, and on a tablet no keyboard.

**Whether it reproduced depended on an unawaited write.** The draft is saved
per keystroke and deliberately not awaited — correct, because blocking a capture
field on storage is the one thing that app must never do — so whether the draft
had landed before the next navigation decided whether the bug appeared. One run
in five. Every property of a real defect, wearing the costume of a flake.

**The wrong move is available and it feels like diligence:** run it again, get
green, note "intermittent, could not reproduce", move on. That is how a shipped
defect gets converted into a line of noise, and it is more tempting the more the
run costs — this walk takes two and a half minutes, so five runs is a coffee
break, and the incentive points at "it was probably nothing."

**What worked was creating the condition rather than waiting for it.** The walk
now opens the second field, polls the store the app actually writes to until the
draft has landed, and only then arrives via the shortcut. The property is checked
on every run instead of one in five — and with the fix reverted it fails every
time, with the same `got ""`. A defect that can be planted is a defect that is
understood; one that can only be waited for is not.

**The general shape, and it generalises past tests.** A failure that appears
under load, after a deploy, or on one device is reporting a rate, not an opinion.
The question is never "does it happen again", it is "what was different", and the
answer is usually something asynchronous that nobody promised to wait for.
Convert the timing into a condition you can set, or the next person to see it
will have exactly as little to go on as you did.

---
