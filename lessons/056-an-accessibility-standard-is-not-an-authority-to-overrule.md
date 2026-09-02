## 56 · An accessibility standard is not an authority to overrule the owner with, and "it has to be there" is a claim that must be READ before it is made

**Enforced by:** CHECKLIST — before citing a success criterion as a reason NOT to do what the owner asked, quote the criterion's actual text in the same breath. GATE fauxplane:scripts/a11y-gate.mjs `checkValuesAreScreenReaderOnly` is the shape of the correct answer: assert the alternative EXISTS and is reachable, never that it is painted.

Five separate asks, and every one of them was for the same thing. The record in
the repo is unambiguous, and it is worse than the summary:

- **1.18.0** — a code comment written that day agreed the owner was right: SC
 1.1.1 says nothing about the text being large or adjacent — **and then kept
 it painted, and called it "never optional" eleven lines later.**
- **1.19.1** — The strip was made denser.
- **1.28.0** — It was
 pushed to the bottom.
- **1.28.5** — It was capped, then given the
 leftover space, then moved below the fold.
- **1.29.0** — Only here was the
 premise questioned.

**FIVE ASKS. FOUR RE-RATIONINGS OF THE SAME GLASS. The question every time was
"how much room should this get", and never once "why is it on screen at all".**

**WHAT THE CRITERION ACTUALLY SAYS.** SC 1.1.1 requires non-text content to have
a text alternative that serves the equivalent purpose. It says nothing about
that alternative being visible. `.sr-only` satisfies it completely — the text is
in the DOM and in the accessibility tree, which is the whole point. The correct
answer was available from the first ask and was never looked up, because the
belief felt like expertise rather than an assumption.

**THE FAILURE MODE IS THE DANGEROUS PART, and it is not about accessibility.**
A standard, a licence, a security rule, a doctrine section — each is a source of
real authority, and each can be invoked to end a conversation the owner is trying
to have. Done from memory, it is an assertion of authority the speaker has not
earned, against the one person whose product it is. **From the owner's side
there is no difference between that and being lied to**, and arguing about
intent is worth nothing to the owner.

Two rules come out of it:

- **QUOTE IT OR DROP IT.** If a standard is the reason for refusing what the
 owner asked, its actual text goes in the same message. A criterion that cannot
 be quoted has not been read, and an unread criterion is an opinion wearing a
 number.
- **A REPEATED ASK IS EVIDENCE THE PREMISE IS WRONG, NOT THAT THE ANSWER NEEDS
 RESTATING.** The second time an owner asks for the same thing, stop refining
 the answer and go and check the thing that made it a "no". Four re-layouts is
 what refining looks like from inside; from outside it is an adversary.

**Smell:** any sentence of the form "it has to be there for accessibility /
security / the licence" that is not immediately followed by the words of the rule
it names. Also: an owner asking a third time.

*(fauxplane 1.18.0–1.29.0, 2026-08-05. The owner was right on the first ask.)*

---
