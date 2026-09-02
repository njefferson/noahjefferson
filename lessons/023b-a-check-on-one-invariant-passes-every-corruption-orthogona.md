## 23b · A check on one invariant passes every corruption orthogonal to it

**Enforced by:** CHECKLIST orthogonal-corruption — when a validity check guards a vector quantity, name what the check does NOT constrain, and add the case that moves only that.

fauxplane's attitude filter rejected accelerometer samples whose MAGNITUDE
strayed from one g. Leaning a hand-held phone corrupts the DIRECTION — the
vector rotates without stretching — so the check certified the corrupted
samples as clean, and the horizon pitched like a rocket while reading 1.01 g.
The fix needed a second instrument entirely (the gyro) because no threshold on
the checked quantity could ever see the unchecked one.

The same audit found the same shape twice more in one function:

- **Stillness was one sample** — rate under a floor beside magnitude near one
 g, no duration. Rhythmic leaning crosses zero rate at every reversal, exactly
 where the corruption peaks, so the corrupted instant PASSED the stillness
 check and bypassed the new gate at triple gain. A predicate about a state
 ("still") that tests an instant is a different predicate than one that tests
 a duration, and the comment claimed the duration while the code tested the
 instant.
- **Two rejection paths, two clocks.** The new gate bounded its coast on a
 private timer while staleness ran on the shared one, so the two paths could
 spend the same trust budget twice and cross the instrument out. If two
 mechanisms spend one resource, they must read one meter.

**The rule: when a validity check guards a vector quantity, ask what the check
does NOT constrain, and whether the failure you fear lives there.** |v| ≈ 1
says nothing about direction; "rate is low right now" says nothing about the
last half second; "my window is open" says nothing about the other gate's.
The corruptions that ship are the ones orthogonal to the invariant somebody
checked, precisely because the checked ones get caught.

*(fauxplane, 2026-08-03 — found by five adversarial reviewers set against a
one-hour-old fix; three of the five findings were this same shape in different
clothes.)*

---

**The documentation a session obeys is the documentation the harness INJECTS,
not the documentation it is told to open.** In one hour, two written rules were
broken: a markdown table was rendered into chat, and a session offered to delete
a remote branch. Both are recorded — the table ban has been Doctrine §3 since
the beginning, and the branch relay's inability to delete a ref has been in this
file since 2026-07-28. Neither rule was disputed, forgotten, or judged
inapplicable. They were simply not in front of anyone at the moment of typing.

The mechanism is worth stating plainly, because it is a property of the tooling
and not of anyone's care. `CLAUDE.md` is loaded into context automatically at
every session start. `DOCTRINE.md` (900 lines) and this file (2700) are *linked*
from it — they must be deliberately opened, which happens once, early, before
any of the work that will violate them exists. Four hours later the rule is a
memory competing with a task, and memories lose. The table went into a reply
about metadata verification; the branch offer went into a tidy-up paragraph.
Neither moment felt like a moment for consulting a doctrine.

So: **a rule that binds EVERY message must live in the injected file.** Not
forked there — indexed, one line each, pointing at the canonical text. The hub's
`CLAUDE.md` now carries that index. Length is the whole reason it works, so it
earns entries only by having actually been broken.

Two riders:

- **A gate beats an index, wherever one is possible.** The table ban is now
 `docs-check.mjs`, run from the hub over every tracked `.md`, and it found 62
 rows across three documents — including `NOTES.md`, the file whose own
 CLAUDE.md says to read it first every session. Nobody had noticed, because
 a table looks fine to whoever wrote it. The gate cannot see a chat reply,
 which is exactly where it broke, so the index still earns its place.
- **Never offer a capability the lessons record as impossible.** The branch
 offer is a distinct failure from forgetting a rule: it promises work that will
 fail *and report success* (`git push --delete` dies on a sideband disconnect,
 then prints `Everything up-to-date`). Before writing "happy to do X", check
 whether X is on the list of things that do not work. Three of the five entries
 in the new index are of this shape.

*(2026-08-03. Written the same hour both rules were broken, at the owner's
insistence — an unreadable table had to be pointed out by screenshot before it
was noticed.)*

---

**When the owner has to ask for the same thing in a second app, the asking IS
the defect report — and it is a report about this document, not about the
feature.** The owner asked for an information menu in fauxplane — a feature
already built, at the owner's request, in more than one app before it, and
never written down anywhere a session for the NEXT app would read.

The mechanism is the same one that makes rules get broken (the injected-versus-
opened entry above), turned around. A feature requested per-app gets built
per-app, beautifully, and dies with the session. The repo's own `CLAUDE.md`
records it — fauxplane's had "ask the owner for the report, not for a photograph"
written down for days — but a sibling repo's session never opens fauxplane's
`CLAUDE.md`, so the rule is invisible from three feet away. **Being written in
one app's file is precisely why it had to be asked for again in another.**

Three things follow:

- **The session that HEARS the repeat writes the doctrine entry**, not the
 session that finishes the feature. Those are usually the same conversation and
 the entry still gets skipped, because the feature feels like the deliverable
 and the rule feels like paperwork. It is the other way round: the feature
 serves one app, the rule serves all of them.
- **Generalise from the second instance, not the fifth.** Waiting for a pattern
 to be undeniable means four more repos shipped without it and four more
 conversations spent asking.
- **Write it as a BASELINE, not a suggestion.** "Consider an about screen" gets
 read as optional. The entry that works names the surface, lists what must be
 behind it, says what it must not do, and requires the app's existing gate to
 assert it exists — because prose in the doctrine did not stop any of the
 omissions that produced the section.

The tell to watch for is in the shape of the request, not in the code: pointing
at another app that already has the thing, or noting that it was solved once
before. Those are not feature requests. They are bug reports against the
shared rules.

*(2026-08-03, fauxplane — Doctrine §7e and §7f were written from this.)*

---

**A modal `<dialog>` lives in the TOP LAYER, so a full-page screenshot cannot
see the part of it below the fold — and a sampler that reads pixels by
coordinate will happily measure the wrong ones instead of failing.** fauxplane's
contrast gate reads backdrops off a real screenshot rather than from computed
style, which is correct and catches things `getComputedStyle` cannot. It sampled
the first-run text inside the power gate at 1.37:1 and reported a contrast
failure. The colours were fine. The text was simply not painted at the
coordinate being sampled.

The top layer is not part of document flow and is composited relative to the
VIEWPORT. `fullPage: true` stitches the document; anything a modal draws past
the bottom of the screen is not in that image, so those coordinates show the
page behind — or nothing, which reads back as near-white and produces an
arbitrary ratio. Note that `position: static` does NOT fix it: top-layer
membership is not a positioning property. The dialog must be demoted with
`close` + `setAttribute('open','')` for sampling, then promoted again.

**The dangerous part is not the false failure, it is the silent degradation.**
The check had been green for weeks and was genuinely measuring — because the
gate's content was short enough to fit on screen. Adding four lines of copy
pushed the registered text below the fold and the check started reading unpainted
pixels. It did not know, and nothing said so. A wrong pixel that happens to be
dark would have produced a false PASS just as easily, and nobody would ever have
looked.

Two rules generalise:

- **A pixel-sampling check must prove the pixel belongs to the element**, not
 merely that the coordinates are inside the image. Sampling by geometry is
 sound only while everything is on screen, and content length decides that.
- **When you change how a check MEASURES, plant a fault and watch it go red
 before trusting the green.** The fix here turned a red into a green, which is
 exactly the shape of a fix that has disabled a check rather than repaired one.
 A deliberately bad colour was planted, the gate reported 1.08:1, and only then
 was the pass believed.

*(fauxplane, 2026-08-03. Applies to every app whose accessibility gate samples
a screenshot — which is all of them, since they share this approach.)*

---
