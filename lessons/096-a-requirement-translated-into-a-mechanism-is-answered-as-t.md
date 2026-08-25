## 96 · A requirement translated into a mechanism is answered as the mechanism and lost as the requirement — and the search that misses it later is the same translation

**Enforced by:** CHECKLIST close-the-need — a numbered question may only be Closed when the NEED it describes is built or explicitly refused. Answering the mechanism the asker guessed at, and parking the need as "a candidate for vN", is an OPEN question wearing a Status line. **CHECKLIST search-their-words** — before recording that something was never asked for, search the record in the ASKER's vocabulary as well as the feature's.

Quietkeep's Q-10, asked 2026-07-29, in the repo's first week: *whether a second
vault is for home tasks, and whether the app already separates work tasks some
other way.*

The session that answered it was not careless. It got the design **exactly
right** and wrote it down:

> *"what the owner is describing wants a lens — a filter you switch on and off
> over one list — and not a partition."*
> *"Binding constraint if a lens is built: law 1 does not bend for it. A thing
> filtered out of view still has its clock and still comes back."*

Nineteen days later that feature was built from scratch, and its ADR's decision
and central rule are **that paragraph, restated** by a session that did not know
the paragraph existed.

**What failed is the shape of the close.** The asker had guessed at a mechanism —
vaults — and the answer was about vaults: thorough, correct, and closed. The
NEED was parked in the last sentence as *"a candidate for v1.5"*, with a
workaround offered in the meantime. A numbered question carrying **Status:
Closed** reads as settled to every session after it, so nineteen days of sessions
read it and moved on. **The answer was right and the requirement was still lost.**

**Then it was nearly lost a third time, by the search.** Asked whether contexts
had ever been raised, a session searched the record for `context`, `@home`,
`@work` — the vocabulary of the FEATURE — found nothing, and reported in writing
that the concept appeared nowhere and had never been decided against. Q-10 is
written in the vocabulary of the QUESTION: vault, lens, home, work. The same
session had printed Q-10 an hour earlier while looking at something else.

**The general shape, and it is not about search syntax.** A record is indexed by
whoever wrote it, in the words they were using at the time. When a request is
translated on the way in — a need into a mechanism, "keep home out of my work
list" into "should vaults scope projections" — the record keeps the translation
and loses the original. Every later search runs against the translation.

**Two cheap habits:**

- **Close on the need, not on the guess.** If somebody asks whether feature X
  solves problem P, the question is P. Answering X and parking P leaves a
  question that looks answered and is not. Write the need back in their words in
  the Status line, or leave it open.
- **When you are about to write "this was never asked for", search their words
  first.** That sentence is a claim about another person's history and it is the
  one most likely to be wrong, because the thing that lost the requirement is
  the same thing that will hide it from you.
