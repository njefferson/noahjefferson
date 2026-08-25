## 72 · A gate that names ONE surface is satisfied by moving the content to a surface it does not name

**Enforced by:** GATE quietkeep:tools/size-check.mjs — every destination measured by name, plus their SUM, so filing cannot pass as cutting.

A budget on how much a reader has to get through was added after a report that
an app read like an encyclopedia. It measured three things, and one of them was
the rendered scroll height of the information panel: `#about-body`, at phone
width, 9,000px.

Two releases later that panel was split into six destinations. The number it had
been measuring fell from 9,000-odd to 2,459 — **by three quarters, without one
word being cut.** The reading did not go anywhere. It went somewhere the gate
could not see, and the gate said *within budget* about an app that had exactly as
much in it as the day the complaint was made.

**This is not a bug in the gate. It is what a gate scoped to a name does.** The
selector `#about-body` is an implementation detail wearing the costume of a
measurement. Every refactor is free to satisfy it, and the more thorough the
refactor the better it scores.

**The fix has two halves and the second is the one that matters:**

- **Enumerate the surfaces and measure each**, so a new screen is a new number
  rather than a hiding place. This half is obvious once the failure is seen.
- **Measure the SUM, and hold it.** Without it, "split it again" is always
  available and always passes. The total is the only number that is about the
  product rather than about the layout, and it is the one a reader's actual
  experience tracks — they do not read one screen, they go looking.

**And say what the total is FOR in the gate's own words.** Here the split moved
10,830px around and cut nothing, and the comment beside the number says so:
*"Set just above today's measurement, as a ratchet. It is not a target that has
been met."* A budget set at what a thing currently measures is a ratchet; a
budget described as an achievement is a false receipt. The same number, and the
difference is one sentence nobody is forced to write.

**The test for any budget, before trusting it:** name a refactor that would
satisfy it without changing what a person experiences. If one exists, the gate is
measuring the code's shape and not the product.

---
