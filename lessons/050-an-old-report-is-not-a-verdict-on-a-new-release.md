## 50 · An old report is not a verdict on a new release

**Enforced by:** CHECKLIST report-version-first — read the version stamp at the top of any diagnostic before drawing a conclusion from it, and say in the reply which release it describes.

Two fixes went out. The owner sent a diagnostics report showing the same symptom
they had described before — a panel of crossed-out instruments.

**The report was from the release BEFORE the fix.** Its own header said so, and
so did a line further down: `a newer version is not waiting`, timestamped three
minutes before capture. The new build had not reached the device.

The pull is to read it as "the fix did not work" and start undoing good work, or
as "the reload must not have happened" and say nothing useful. Both are wrong. **The
report was worth having — it contained two defects nobody had noticed** — but it
could not speak to the release it predated.

**And the symptom genuinely had two causes.** One was the freshness-window bug
that release fixed: fields crossed out whose data HAD arrived. The other, in
this report, was an aircraft that never reported at all because the feed was
refusing us. **Identical on screen, unrelated underneath.** Matching a screenshot
to a known bug is not diagnosis; the report says which one, and only if it is
read.

**The general shape: a diagnostic carries the version it was taken on, and that
is the first field to read, not the last.** An app with §7f diagnostics and
§7h stale-app detection will routinely receive reports from releases behind
HEAD — the two features together guarantee it. Say plainly in the reply which
release the report describes and what it therefore cannot tell you.

*(fauxplane 1.22.0 → 1.22.1, 2026-08-04.)*

---
