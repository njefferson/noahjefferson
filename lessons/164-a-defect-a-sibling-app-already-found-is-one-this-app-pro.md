## 164 · A defect a sibling app already found is one this app probably has, and their NOTES is where it is written down

**Enforced by:** CHECKLIST read-the-sibling — before building a surface another
app in this family already has, read that repository's `NOTES.md` for what it
cost them. · CHECKLIST comprehensible-not-just-correct — the gates measure
whether a surface is right; nothing measures whether it can be understood, and
that gap is where sibling notes pay.

**Smell:** two apps in this family with the same shape of screen, and one of
them older. Anything the older one learned in front of a person, the younger one
is about to learn again.

Solve-ent had just been caught by its owner on three reader-facing faults that
every gate passed. Its sibling MoleBridge — same teacher, same students, same
room, longer in front of people — was read looking specifically for findings
about being COMPREHENSIBLE rather than correct.

**Three of MoleBridge's findings were live defects in Solve-ent**, unfixed, at
that moment. Ten minutes of reading against several sessions of finding them the
hard way.

- **The keyboard came back over the reason.** A wrong answer called `focus()` on
  the field — the reflex, *they got it wrong, let them retype* — which on iOS
  re-raises the keyboard and scrolls the field into view, taking the diagnosis
  with it. In an application whose whole thesis is attribution, the student got
  the "wrong" and not the "why". MoleBridge found it on a photograph of a real
  iPad. Solve-ent did the same thing in two places.
- **There was no way out of a set.** MoleBridge's note says it plainly: *nothing
  in this repository had ever asked the question "can you get out of here", and
  no gate asks it now either.* Nothing in Solve-ent had asked it either — its
  drill had a stop control and a whole run had none.
- **A control that admits it is in the wrong place.** Solve-ent's "put this in
  the answer" button had a branch apologising that a choice step has nowhere to
  put a result. That branch is the defect writing itself down: a control being
  offered where it cannot work, with the evidence in its own handler.

**And one decision had been re-derived rather than read.** Both applications
built a calculator; both refused `eval` for the same stated reason (it would
ACCEPT what the box has to refuse); both refused to round to the problem's
precision because that is a graded step. Two apps arriving separately at the
same three rules is worth more than either of them asserting it — but the
younger one spent the thinking twice, and MoleBridge also had the better TEST:
it feeds all 118 element symbols and seven real formulas through the parser,
because "a blocklist is a list somebody forgets to extend".

**The general form: the family's gates all measure whether a surface is CORRECT,
and none of them asks whether it can be UNDERSTOOD.** Contrast, target size,
focus rings, axe, collision sweeps, external verifiers — all green on a screen
that read as two unrelated questions followed by a shout. That gap does not
close with another gate. It closes two ways, and both are cheap: somebody opens
the app on the device it is for, and somebody reads what the sibling already
wrote down.
