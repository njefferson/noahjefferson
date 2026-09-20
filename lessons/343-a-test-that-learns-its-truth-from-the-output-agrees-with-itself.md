## 343 · A test that learns its truth from the output under test agrees with itself, and its numbers move the wrong way when the output improves

**Enforced by:** CHECKLIST name-the-truths-source — every acceptance test says,
in its own header, where its idea of RIGHT comes from. If any part of it is
derived from the thing under test, list the inputs on which that derivation is
known to fail, and keep those inputs out of the default set.

A sky-mask test needs to know which pixels are sky. It has no external
annotation, so it learns: it takes the pixels the mask covers most confidently,
averages their colour, and keys the whole frame against that average. On a
frame where the mask is roughly right this is excellent — better than a
hand-drawn region, because it is the field's own dragged-box average and it
adapts to each photograph.

**On a frame where the mask is badly wrong it learns the wrong thing and then
agrees with itself.** One frame is a wooden playhouse under trees. The mask
covered the building, so the test's target came back at hue 0° — within a
degree of the playhouse's own warm red, and about 160° from the verified sky in
every other frame in the set. The test then called the building sky and
reported the mask for not covering enough of it.

**The direction of the failure is the part worth remembering.** When the mask
was fixed and stopped covering the building, that frame's reported open-sky
coverage went DOWN, from 79.6% to 57.1%, while the picture plainly improved:
the walls, the roof, the tyre swing and the lawn left the selection. A test
like this does not merely fail to notice an improvement. **It scores the
improvement as a regression**, which is exactly the reading that gets a good
change reverted.

Two guards, and the cheap one is the better one.

- **Keep such a frame out of the default set, with the reason written at the
  declaration** rather than in a commit message. It stays runnable by name, for
  anyone who wants to watch the circularity happen.
- **Print the learned target on every run.** One line — the hue and saturation
  the test decided sky is — makes the failure self-announcing: 200°, 201°, 202°
  on three frames and 0° on the fourth is a sentence anybody reads correctly.
  That line already existed here as a pass/fail check on whether the target was
  keyable at all; it was printing the wrong answer, in public, for days, and
  nobody read the number because the check beside it said ok.

**Jefferson-Photography-Studio, 2026-09-20.**
