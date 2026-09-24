## 361 · A comparison shows where the candidates differ, not where they are the same

**Enforced by:** CHECKLIST differ-before-sending — before a comparison sheet
goes to the owner, the candidate renders are compared with each other, and any
two that come out identical mean the sheet is showing the wrong place: it is
redrawn around what actually differs (a menu's contents, a second screen, a
state after a press), with each candidate's difference named in words beside
its picture.

**Smell:** two candidates in a sheet whose files have the same size, or a
caption that has to explain a difference the pictures above it do not show.

**Measured 2026-09-24 in Jefferson-Photography-Studio.** Three top-bar layouts
(record 060) were rendered in the real app and sent as a sheet of editor
screenshots at three sizes. Candidates A and C put the same four buttons in the
bar and differ only in what a More menu holds and in the start screen, so their
editor screenshots were the same file byte for byte: 747,333 bytes each at iPad
landscape, 394,947 each at portrait, 197,725 each on the phone. The sheet
showed the bar, where the two are identical, and the choice could not be made
from it. The redrawn sheet has three sections: the bar enlarged, where the other
buttons went (both More menus open, and the floating group for the third
candidate), and the three start screens, each labelled with what differs.

**Why it happens.** The render is organised by where the change STARTS, which
for a toolbar is the toolbar. Two candidates that start the same way and
diverge one press later look like one candidate in a picture of the starting
point. Rendering every candidate is not the same as showing the difference
between them, and the byte sizes said so before the sheet was sent.

**Related.** §359 is about the pictures being beside the question when it is
asked; this is about the pictures answering it once they are there.
