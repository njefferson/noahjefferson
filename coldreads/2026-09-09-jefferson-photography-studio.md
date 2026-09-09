# Cold read — Infrared Photography Studio, 2026-09-09

**Walked:** `https://jefferson-photo-studio.pages.dev/ir.html`, production, v2.12
(`5799f9d`). Two agents, in parallel, neither permitted
`/home/user/Jefferson-Photography-Studio` or `/home/user/noahjefferson`, both
required to declare sources. Both declarations came back clean.

**Materials.** The app's own hosted practice library, plus 23 real Nikon NEFs
(`NIR_2910`–`NIR_2932`, 25–33 MB each) handed over mid-run as a folder path and
a file count — no hint of what to look for. Two of the 23 are EXIF orientation 8;
orientation 6 is in none of them, so that branch went unexercised.

## Deviations from COLDREAD.md — all of them

- **Two separate agents rather than one doing two passes.** This is the change
  that has since been written into the method: the discovery pass cannot be
  contaminated by a checklist it was never handed, so the ordering rule becomes
  a property instead of a promise, and both passes cost one wall-clock run.
- **The claims prompt shipped with its placeholder still in it.** The agent
  refused and asked for the claims, which is the correct failure and the reason
  the method file now says to check. Restarted with the real text.
- **The unprompted pass was not started first.** Both were launched together, so
  no contamination was possible, but the ordering §233 specifies was not
  followed as written.
- **Real photographs arrived partway through both runs**, not at the start.
- **One agent read the repo's `CLAUDE.md` files** — not by choice or by any tool
  call, but because the harness displays project instructions automatically at
  session start. It declared this unprompted. The isolation is by instruction
  and it held for every deliberate act; this is a hole in the CONTAINER, not in
  the agent's conduct, and any future run in this harness has it too.

## The unprompted pass — what it found that no claim covered

- **Tapping a blown highlight to set white balance throws the frame into deep
  magenta, with no warning.** The agent tapped a sunlit snow bank expecting
  neutral, got a wrecked image, and read it as the app being broken. Help says
  the target is foliage; nothing at the moment of the tap does. A photographer
  recognises this instantly and a newcomer cannot.
- **Hidden interactive duplicates are mounted in the DOM at all times** — a Help
  dialog, and a second copy of the practice-photo picker. Querying by visible
  text finds two or three matches for Undo, Aerochrome, Visualize spots, Find
  spots automatically, Export & Save and Close. Invisible to a mouse; not
  invisible to anything that navigates by name.
  **MEASURED AFTERWARDS AND IT IS NOT AN ACCESSIBILITY DEFECT.** 406 controls in
  the document, 26 reaching the accessibility tree on the start screen and 37
  with a photo open; duplicate accessible names among exposed controls, zero;
  zero-size exposed controls, zero. A closed `<dialog>` is `display:none` and
  out of the tree. It was relayed onward as an accessibility defect and as a
  gate having missed something, and both of those were added by the relay rather
  than found by the reader. See LESSONS §262.
- **The Grade shadows wheel is extremely sensitive**: a drag of roughly 30px
  near its centre registered as 92% and painted the whole frame heavy magenta.
- **Visualize spots shows the identical smudge before and after healing.** The
  app explains why — it scans the raw pixels — but in the moment the fix looks
  like it did nothing.
- **The bare R⇄B swap, pressed without a look, flattens toward pale purple** and
  loses separation the frame already had. It is a building block and nothing
  says so.
- Batch, export, stickers, tone curve, sky mask and warp all worked as promised,
  on the practice library and on the real NEFs equally.

## The claims pass — 14 claims

Eleven found cleanly: the version-tag report and its copy button, the test page
with a number and a sentence for each measurement, the report's three storage
lines with no filename anywhere in it, Restore depth on by default with its
strength slider, double-tap returning a slider to its opening value rather than
zero, the status line never saying "opening", the batch dialog naming highlight
recovery and Restore depth verbatim, the portrait thumbnail standing upright,
the Quick look header uncut at 390px with 44px buttons, and the undeveloped-tile
badge reading as the word "preview".

Three came back with something attached:

- **The problem-report row is buried.** The control that opens it is labelled
  "What's new", and Settings is reached only by scrolling past the changelog,
  the roadmap, a privacy link and a tip link. Found only because the same report
  had already been found elsewhere.
- **"Opening" is still on screen during a multi-photo open** — not in the line
  under the photos, which was the claim and which is correct, but in a centred
  modal that appears first and reads "Opening 5 photos — reading 1 of 5". The
  claim survives on its wording alone.
- **Strip thumbnails take 6–10 seconds to follow a look**, and the same modal
  appears when keeping a Quick look set, so the reuse looks for a moment like it
  is not happening. Timed: keep-after-quick-look 6.7s against 16.6s cold, so the
  reuse is real and roughly 2.5x.

One inconclusive: tapping a thumbnail mid-load. The agent never caught a wrong
message, and never produced clean evidence of a right one, because the DOM is
restructuring through exactly the window the claim describes.

Four surprises outside every claim: the start screen samples 15 of the 53
practice photos at random per load, so "the first practice photo" is a different
photograph each session; the status line settles to its idle text while
thumbnails are still provisional, so it reads finished while the strip visibly
is not; the channel swap applies by default to camera-rendered JPEGs too; and
`/debug.html` reports the offline worker as not registered while the same report
reached from inside the app says active.

## What this cost, and what it bought

Two agents, about 300k tokens each, roughly 45 minutes of wall clock in
parallel, 155 and 220 tool calls. It bought five findings no gate in the family
can see. The clipped-highlight tap is the one that mattered: the app's signature
gesture, wrecking the frame with no explanation, on the exact mistake a newcomer
makes. It is fixed. The duplicate-controls finding measured to nothing once
somebody asked whose view it was a fact about — which is its own lesson, and a
warning about what a cold read's findings are before they are measured.

**The pattern worth carrying:** the unprompted pass found the things that make
the app hard to USE, and the claims pass found the things that make it hard to
BELIEVE. Neither list overlaps the other. Running only the second one, which is
what §206 specified, would have returned eleven clean confirmations and three
caveats — and nothing at all about the magenta.
