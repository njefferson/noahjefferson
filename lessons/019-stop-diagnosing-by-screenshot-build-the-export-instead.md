## 19. Stop diagnosing by screenshot — build the export instead

**Enforced by:** CHECKLIST text-diagnostic — every app emits its whole panel state as text (Doctrine §7f). Ask the owner for that, never for a screenshot.

Every defect in an app over several sessions was found the same way: a
photograph of a phone screen, and I read pixels. That channel loses the reason
strings (clipped at the edge of a gauge), cannot show a field that is off
screen, cannot show a filter's internals at all, and makes a person do OCR on
behalf of a machine. It also makes the owner do the work — repeatedly, and the
owner said so each time.

**One tap on the version stamp now emits the entire panel state as text.** What
made it worth more than a raw dump:

- **The first lines are the DIAGNOSIS, not the data.** Everything failing, with
 its reason, above a field table nobody reads.
- **Root causes separated from what they knocked over.** A derived field names
 the inputs it is missing, so its reason contains "unavailable (" — that makes
 it a consequence. Thirty-eight failures collapse to three real ones plus
 "these fell over because of those."
- **Console errors captured from BOOT**, by wrapping `console.error` at module
 load rather than inside the startup function — "the app failed to start" is
 exactly the case worth capturing, and the startup function may never run.
- **Position rounded to ~1 km by default**, with a tick box, because a report
 designed to be pasted somewhere should not carry a precise location by
 accident.

The version stamp becoming a BUTTON is also a better reading of the
"stamp must be pasteable" rule than the rule's literal text: pressing it yields
the version *and everything else* as selectable text.

*(fauxplane, 2026-08-02.)*
