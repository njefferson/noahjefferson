## 227 · A test that skips the state a bug lives in certifies the bug, and the first one written here did

**Enforced by:** GATE Jefferson-Line:tools/panel-shot.mjs — opens the app in a
real browser at two viewport sizes, presses through the first-run screen, and
measures whether the way out of the panel is inside it, on screen,
unobscured by anything painted over it, and still reachable with the body
scrolled to its end; it serves itself and runs on every commit through
`.branch-guard`. · CHECKLIST walk-the-state-the-defect-needs — a browser test
of a fix must reach the state the defect required, not a state where the same
selectors happen to exist. · JUDGEMENT — which state a defect needs is a
reading of the code path, and a passing test is exactly when nobody looks for
it.

**Smell:** a browser test that sets a flag, seeds storage or stubs a step "to
get to the interesting part", where the skipped step is the one that moves,
mounts or repositions the thing under test. Also: a fix verified only by a
test written after it.

**Jefferson Line, 2026-09-02.** A release moved a dialog's title into a new
header bar. Elsewhere, the code returning a first-run block to that dialog
placed it with `home.after(block)`, where `home` was that title. So from that
release on, the block was inserted INTO the bar — which was deliberately the
one box that does not scroll, under `overflow: hidden`.

Measured afterwards: on the working build the Close button sits 103px down; on
the broken one it sits at 845px, with the bar 814px of a 1003px panel. On the
reference device it still technically fitted. On anything shorter it did not.
Reported as a panel that could not be closed, had nothing on it, and looked
cropped.

**The old guard made it permanent.** It compared the block's parent to the
title's, and once both were the bar it concluded the block was already home.
The fix is a NAMED element to return to, so moving something else cannot take
it somewhere it does not belong — *"after that other thing"* is a position
that depends on a fact nobody restates when they change it.

**Then the browser test, which is the actual lesson.** Three UI defects had
reached a device the session could not see, so one was finally written. Its
first version set the "already oriented" flag to skip the first-run screen and
get to the panel.

**It passed against the broken build.** The defect lives entirely in the code
that moves the block BACK, which only runs after that screen — so a test that
skipped the screen found the block still sitting where its markup put it, in
the right box, and reported everything fine. **The step it skipped for
convenience was the only step that mattered.**

That is worse than no test. A red gate is a defect; a green one that cannot
see the defect is a defect plus a reason not to look.

**Two more of its own making, both worth knowing.** Overriding
`navigator.serviceWorker` with `undefined` left `'serviceWorker' in navigator`
TRUE — the property exists and its value is undefined — so the app took the
branch, called `register()` on nothing, threw, and never reached its router.
A blank page whose cause was the test rather than the app. And an
`addInitScript` that throws takes the whole page with it, which looks identical
to the application failing to start.

**The general rule: a gate that reads files cannot see layout.** This is §212's
finding one layer further in — that one was about a file gate missing what
happens where the file meets the host, this one is about a file gate missing
what happens where the CSS meets a viewport. Both were found by a person on a
device. The remedy is the same both times: something has to actually go and
look, in the state a reader is actually in.
