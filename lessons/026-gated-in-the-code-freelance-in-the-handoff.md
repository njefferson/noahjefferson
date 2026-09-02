## 26 · Gated in the code, freelance in the handoff

**Enforced by:** GATE hub:handoff-check.mjs — the handoff is a deliverable and has its own checker.

*(photo-field-tools, 2026-08-02. At the end of a build whose four CI gates
were all green, the correction was blunt: a detailed doctrine already existed,
and this session alone had ignored essentially all of it.)*

The correction was accurate, and the interesting part is WHICH rules got ignored.

**The rules that held, perfectly, all session:** contrast floors, touch-target
sizes, tremor spacing, offline behaviour, the acceptance criteria, the untested-
vs-clean distinction, no-lens-preloaded, no-filter-control. Every one of those
was checked by something that exits non-zero, and every one of them was also
deliberately broken once to prove the checker bites.

**The rules that were ignored, every single time they came up:** hand over the
preview URL (§7). Don't give the owner a manual step you haven't verified end to end
(§6). Don't diagnose the owner's setup without evidence (§5b). iPad-first — no step
that assumes a desktop (§2).

Not one of those has a gate. All of them are prose.

**So the failure is not "the doctrine wasn't read".** It was read closely enough
to be quoted in the commit messages. The failure is that it was applied to the
ARTEFACT and not to the HANDOFF — rigorous about the software, freelance about
the sentence at the end that tells the owner what to do next.

### The single mechanism underneath all four

**Asserting something about the world outside the sandbox instead of checking
it, where the assertion creates work for the owner.**

- Told the owner to add Cloudflare secrets and create a Pages project. Both
 already existed. The deploy log said so and the log was one tool call away —
 the session had GitHub Actions access the whole time and never looked.
- Told the owner to upload an image "from the repo", to a reader on an iPad,
 when the session could have attached the file directly.
- Deployed to staging four times and never gave the owner the URL, then told
 the owner the build was "waiting on your on-device pass".
- Modelled the converted camera from a spec document instead of from the
 hardware, and built a per-shoot wavelength dial from notes asserting a cutoff
 value that the hardware itself was never asked to confirm.

Each one individually looks like carelessness. Together they are one habit: the
code got evidence and the human got inference.

### What does NOT fix it

**Writing more doctrine.** There are 847 lines of it and every rule broken here
was already in there, stated plainly. A rule that was ignored once at 847 lines
will be ignored again at 900. Asking for better doctrine is asking the owner to
pay for the session's mistake.

### What does

Doctrine's own answer, §15.7 and §16.8: **MAKE IT A GATE, NOT AN INTENTION. A
rule that lives only in prose is a rule that loses to whoever is in a hurry.**
That rule was written about pinning and pacing. It generalises to the handoff,
and this session is the proof: the gated half was clean and the prose half was
a mess, in the same repo, in the same hours, by the same process.

**The handoff is a deliverable and it needs a checker.** Before any "here's
where things stand" message:

- If a deploy ran, READ THE LOG and quote the URL from it. A workflow that
 exits 0 is not evidence of a deploy — a gracefully-skipped deploy also exits
 0. Check whether the steps ran or were skipped.
- Any claim about external state — secrets, projects, permissions, whether
 something exists — cites the log line or API response it came from, or it is
 not made.
- Any manual step handed over is either verified end to end, or accompanied by
 the reason it could not be. "Upload the file in the repo" fails this: the
 session never confirmed the owner could reach it, and could have just sent it.
- Any file the owner is asked to act on is ATTACHED, not described by path.

The first two are mechanically checkable and should be a script in any repo
that deploys. The last two are not, which is exactly why they need to be on a
list that gets read rather than left to judgement at the end of a long session,
when judgement is worst.

---
