## 321 · A detector that acts before the thing it detects becomes the cause, and a planted fault has to fail the way the real one does

**Enforced by:** GATE `picker-walk checks 6–8` (Jefferson-Photography-Studio,
`tools/picker-walk.mjs`) — one window that never came back followed by one that
does must not raise the offer; three dead windows in a row must, and only after
the third click has been issued; a touch that becomes a scroll counts nothing.
· CHECKLIST plant-it-the-way-the-platform-leaves-it — before trusting a
regression check, plant the fault with the same mechanism the platform uses
(here: a real chooser request that nothing answers), read the app's own counter
after it, and confirm the counter reads what the device reported. · JUDGEMENT
— any detector that opens a modal, navigates, or blocks input BEFORE issuing the
action it is measuring has to be read as a candidate cause of the symptom it
reports, before the platform is blamed.

**Smell:** "N opened, 0 came back" where N is more than one — a second failure
that looks identical to the first is the moment to ask what the app did
differently on press two. A remedy in a dialog's copy that nobody has watched
work. A planted fault whose check passes on the very first run.

**Measured 2026-09-18, Jefferson-Photography-Studio, on a phone.**

Every Open button dead until a force-quit; the ⓘ report read "4 opened, 0 came
back". The app's wedge detector (commit 2841469 of that repo, 2026-09-14) counted
file windows opened against windows returned, and at two outstanding raised a
modal offer to reload. Reading it back:

- Press one really did not return. The engine's `cancel` event is admitted
  unreliable in the code's own comment; an action sheet dismissed at its first
  level fires nothing. One missed message.
- From press two, the detector incremented the count, tested "two outstanding"
  — which included the window it was about to open — raised `showModal()`, and
  THEN issued the click. On the phone the three presses after that produced
  nothing. Whether the modal inerted the input or the platform dropped a sheet
  requested under an opening dialog is the phone's to say; either way the app
  changed one thing between press one and press two, and it was the detector.
- The offer's copy promised a reload would clear it. Nobody had seen that; a
  force-quit is what cleared it.

Fix: count at the input's own click, issue the click, raise the offer on a later
tick only when the two PREVIOUS opens never returned, and let any return — files,
cancel, or focus coming back — retire the whole count and close the offer.

**The instrument lesson is the one that cost an hour.** The first regression
check planted a dead picker by replacing `HTMLInputElement.prototype.click` with
a synthetic `dispatchEvent(new MouseEvent("click"))`. On the OLD build, with the
defect present, three planted presses raised no offer — the check could not see
the bug it was written for. The app's counter explained it: "2 opened, 2 came
back". Chromium answers an untrusted click on a file input with an immediate
`cancel`, so the plant was a window that came back instantly, the opposite of a
wedge. Planted instead as a real chooser request that the harness holds and never
answers, the old build raised the offer on press two and the new one on press
three. A planted fault that passes its check on the first run has not been shown
to be the fault.
