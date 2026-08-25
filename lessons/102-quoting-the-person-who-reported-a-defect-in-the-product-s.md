## 102 · Quoting the person who reported a defect, in the product's own release notes, is the attribution rule reaching a surface nobody checks

**Enforced by:** JUDGEMENT — no gate. Detecting it means telling "you said it was
hot" (the reader's own data, correct product voice) from "you said the screen was
too busy" (somebody's report, republished), and a checker that cannot tell them
apart teaches sessions to route around it, which is worse than none.

**Smell:** a release note, commit message or PR body that opens by telling the
reader what they said. "You said", "you told me", "you asked for", "what you
said on <date>" — where the object is a judgement about the app rather than
something the reader entered into it. If deleting the clause leaves the
engineering fact intact, the clause was somebody's words and does not belong.

The rule is already written down and already hard-gated in the files: never quote
the person who found a defect, never attribute anything to them by name. Write
what was wrong and what it measured. The gate that enforces it scans tracked
files for disclosure and attribution patterns.

**It was being broken in the shipped product, in the app's own patch notes**, and
the gate was green throughout because the shape is not a disclosure pattern. Two
releases opened with the reporter's words as the justification:

- *"You said a screen showing exactly one task was terrifyingly busy and you did
  not want to begin in it."*
- *"This is the answer to what you said on 4 August — no feeling of being shown
  the right things."*

**The second-person voice is exactly what hides it.** Patch notes speak to the
reader as "you" everywhere and correctly so — "the one you called hot", "you said
not yet, and that holds" — so a sentence that begins "You said" reads as house
style rather than as a quotation. To a stranger reading the notes, "you" is them.
To the person who actually said it, it is their own frustration printed back at
them under their own name, in a public repo and in the running app.

**And the date makes the second one worse.** A dated report attached to a person
is provenance, and provenance is the thing this rule exists to refuse: quoting
the reporter FEELS like giving credit and is not.

**The right shape was already in the same file, three releases earlier:**
*"Reported from a device: X and Y overlap. They were 0.0 pixels apart."* That
carries the whole engineering fact — what was wrong, and what it measured — and
carries nobody's words.

**The general form: a rule with a gate gets checked where the gate reaches, and
the surface it does not reach is where the rule quietly stops applying.** Ask of
any hard-gated rule which surfaces the gate actually scans, and go and read the
ones it does not.
