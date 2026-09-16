## 314 · Effort flows to what is measured, so the ungated list is the one that decides what to build

**Enforced by:** GATE `quietkeep:tools/roadmaps.mjs` — every plan of record
declares itself, is named in the repo's source-of-truth file, states when it was
last measured and at which release, gives each item one state from a closed set,
and cites the release or the record behind any state claiming the item is
settled. Both directions on the population; the gap since the last measurement
is printed and never failed. · CHECKLIST plan-of-record — before choosing what
to build, ask which document says what remains, and when anything last checked
it against the source. · JUDGEMENT — a gate you add to the thing you already
measure buys less than a gate on the thing nothing measures, however much
smaller the second file is.

**Smell:** a document that decides what gets built, with no `--check` beside it.
A plan whose items have no states. Two plans in one repo that do not cite each
other. A roadmap whose newest dated line is older than the last twenty releases.
A source-of-truth file that names one of the repo's plans and not the other.

**Measured 2026-09-16, Quietkeep, at 3.25.0 with 307 releases behind it.**

The repo carried around sixty gates. The open-questions list had one, the
research catalog had one, the decision index had one, the manual had three, the
walkthrough photographs had one, every colour pair was computed in CI, and every
npm script was asserted to be run by a workflow or declared exempt with a
reason. **Nothing at all held the two documents that decide which work
happens.**

Both had gone stale, and staleness in a plan does not look like staleness — an
out-of-date roadmap reads as a roadmap. The design document was written at
1.42.x and still listed as work to do the item it calls the whole design; that
item had shipped at 2.0.0, about a hundred releases earlier. One of its four
items had been refused in the meantime by a record accepted nineteen days after
the document was written, and nothing connected the two. The structural
assessment, three days old, promised in its own header that each phase would get
a status line when it landed; three of its first phase's six items had landed
and the file said nothing about any of them.

**Neither cited the other, and they conflicted.** One paid to standardise a
reader-facing count the other proposed deleting. One consolidated an invariant
the other proposed replacing. A session reading either alone could not learn
that from inside it, and the file that calls itself the repo's source of truth
named one of them and had never named the other.

**The mechanism is the whole lesson.** Effort flows to what is measured.
Everything measured in that repo was downstream of a decision already made —
does the app do what it says, is the receipt current, is the colour legal — so
hundreds of gated, receipted releases went past while the three documents
deciding what to build sat unread and unreconciled. The gates were not wrong and
the work was not wasted. It was aimed by the one list nothing checked.

**What the gate can and cannot do, because the limit is the same one every
shape gate has.** It cannot know whether an item's state is honest, or whether a
cited release did what the line claims. It can refuse a state with nothing
behind it, refuse a line that says two things, and print how long it has been
since anybody looked. That last number is deliberately not a failure: a
threshold is arbitrary, and a gate that fires on an honest document is one
people learn to route around.

**The teeth are in the citation, and the reason is a line this session wrote
wrong itself.** A status line was committed reading *"still a queue with a
depth: `#triage-count` is written on every render"* — and that selector had
carried no number for sixteen releases. The corrected line cites an accepted
record instead. **The wrong line and the right line were indistinguishable in
shape**, and the only mechanical difference was that one named a release or a
record and the other named a selector it was wrong about. So a state claiming an
item is settled must name the release or the record that settles it. That rule
would have caught the bad line on the commit that made it.

**The general form for every repo here:** find the file that decides what you
build next, and check whether anything at all is holding it to the code. If the
answer is no, it is the most expensive ungated list you own, whatever its size.
