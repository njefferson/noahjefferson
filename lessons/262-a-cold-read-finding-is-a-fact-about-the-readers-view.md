## 262 · A cold reader's finding is a fact about the READER's view until somebody checks whose view it was

**Enforced by:** CHECKLIST coldread-classify — before a cold-read finding is
reported upward as a defect of a KIND (an accessibility defect, a performance
defect, a data defect), measure it in the terms of that kind. The reader's
report says what the reader met; it does not say which population meets it. ·
JUDGEMENT — a finding that arrives with a diagnosis attached is the one to
re-measure, because the diagnosis is the part nobody asked the reader for.

**Smell:** a cold-read finding relayed onward in a category the reader was never
in a position to establish. Also: any sentence of the form "and every green
gate passed over it", written before the gate's actual coverage was checked —
that clause is an accusation about a gate, and it is cheap to verify and
expensive to be wrong about.

**Infrared Photography Studio 2.12, 2026-09-09.** The unprompted half of a
two-pass cold read reported hidden interactive duplicates mounted in the DOM at
all times — a Help dialog and a second copy of a picker — with several controls
resolving to two or three elements when queried by visible text, and said
plainly that this was invisible to a pointer but real for anything navigating by
name. That last clause is true and is about automation. It was relayed onward as
an accessibility defect, with the added claim that every green accessibility run
had passed over it, and put to the owner as one of two recommended fixes.

Measured afterwards, with a probe walking every button, link, input and
`label[for]` and excluding anything `display:none`, `visibility:hidden`,
`[hidden]`, inside `aria-hidden`, inside a CLOSED `<dialog>`, or inside a
`<template>`: 406 controls in the document and 26 reaching the accessibility
tree on the start screen, 37 with a photo open. Duplicate accessible names among
exposed controls, both states: zero. Exposed controls of zero width or height,
both states: zero. A closed `<dialog>` is `display:none` and its contents are
out of the tree entirely. There was nothing to fix, and the runs that kept
coming back green were right.

**What the reader actually established** was that a text-query navigator sees
the whole document. What was reported was that assistive technology does. Those
are different populations and only one of them was in the room.

**The cost is not the wasted probe.** It is that a recommendation went to the
owner naming this as one of two things worth doing, so the choice offered was
made partly of something that did not exist — and that a gate was accused of
missing something it had correctly excluded, which is exactly how a good gate
gets weakened by somebody obliging.

**This is the proxy error wearing different clothes.** The same session had
already measured a touch target as a bounding box, durability as elapsed time, a
photograph's shape as the CSS box of an `object-fit: contain` image, and a
scroll position that had not finished animating. Every one is a quantity
standing in for the quantity that was wanted. A cold reader's report is a
measurement too, taken through one instrument, and its category is the reading
most easily mistaken for the thing.
