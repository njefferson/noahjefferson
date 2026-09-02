## 129 · A gate anchored on the FIRST match measures whichever paragraph happens to sit highest, and adding an unrelated section above it silently moved what it was reading

**Enforced by:** GATE noahjefferson:handoff-check.mjs — the staged-candidate check
now scans EVERY `<project>.pages.dev` URL in NOTES.md and passes if the current
version stands beside any one of them, naming the URL it matched. · CHECKLIST
any-gate-using-exec — a check that calls `exec` where `matchAll` was meant states a
rule about one occurrence while its message states a rule about the document.

`handoff-check.mjs` asserts Doctrine §7: a staged candidate must be VISIBLE after
the session that made it, with its URL and its version. It found the deploy URL
with `urlRe.exec(notes_md)` and asked whether the version appeared within 400
characters of THAT match.

`exec` returns the first match. NOTES.md accumulates addresses — 17 of them in this
repo by now: a live status page, a CORS probe, and every shipped release's
immutable deploy URL. Which one comes first is a fact about document order.

**A "The status page" section landed 85 lines above the staged-candidate record,
and the gate started reading it instead.** The candidate record was correct and
complete — version, alias, the SHA whose steps were read, the deploy log's own
lines — and the gate reported that NOTES.md "records the deploy URL but not the
current version beside it", pointing at a URL that was never the candidate's.

**The failure message never named the text it had read**, which is what made it
read as a defect in the record rather than in the check. A gate that measures a
window has to say which window; `— https://staging.<project>.pages.dev` in the
pass line is the whole fix for that half.

**The dangerous direction is the other one.** This instance was a false positive,
which is loud. The same anchoring passes a handoff whose candidate record is
missing entirely, so long as any older paragraph in the file happens to carry
today's version string near an address — and that is silent, and it is the exact
state §7 exists to prevent.

**The general shape: a gate whose subject appears many times in one file must scan
all of them and REPORT WHICH ONE SATISFIED IT.** `exec` where `matchAll` belongs
turns "the document says this" into "the first paragraph says this", and nothing
about it looks conditional at the call site. Planted red both ways: with the
version removed from the candidate paragraph it fails and says how many URLs it
checked; restored, it passes and names the alias.

---
