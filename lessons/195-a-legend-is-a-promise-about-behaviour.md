## 195 · A legend is a promise about behaviour, not only a decoder for colours

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — asserts the key cannot claim an interaction the surface does not offer: if the legend says a tap switches, the control must be present where the tap lands. · CHECKLIST read-the-key-as-a-spec — every verb in a legend or caption names a behaviour somebody must have built; check each one against the thing it describes. · JUDGEMENT

**Smell:** a legend entry containing a verb — "tap to", "press for", "drag to".
Also: a capability that exists in one surface and is advertised in another.
Also: any explanatory text written in the same commit as the thing it explains,
where only the text was revisited afterwards.

A map's key read "Other tide station — tap to switch". Tapping a station opened
a label with its name and how far it was from the middle of the reach, and
offered nothing else. The key was describing behaviour that had never been
built.

**The cost was not cosmetic.** Which station the tide is read at is the app's
most consequential hidden setting: high water at one end of that reach and at
the other are hours apart, so a reader on the wrong station is wrong by hours.
That single legend line was the only place in the app telling a reader the
station was a choice at all — so the sentence carrying the whole idea pointed
at a control that did not exist.

**Why it survived.** The capability was real, in a different surface: the panel
had a station picker and a "use the nearest one to you" button, added several
releases earlier. Anyone checking whether the app let you change station would
find that it did, and stop. **A feature that exists somewhere makes every claim
about it look true**, including claims about places it was never wired into.

**The general rule.** A legend is not passive description. Every verb in one is
a specification: somebody has to have built that, in that place, and it can
rot independently of the words. Read a key as a list of assertions to verify
rather than as a caption to proofread — the colours are the easy half, and the
verbs are where the lie hides.

This is the third defect in the same family found in one surface: a key drawn
outside its own picture, a caption pointing at nothing, and now a key promising
an interaction. The pattern behind all three is that **explanatory furniture is
never exercised by using the app**, so it decays silently while the thing it
describes is used every day.
