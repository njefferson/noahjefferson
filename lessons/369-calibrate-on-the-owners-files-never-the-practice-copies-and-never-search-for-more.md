## 369 · Calibrate on the owner's own files, never the practice copies, and never go looking for more

**Enforced by:** GATE Jefferson-Photography-Studio:tools/owner-images.mjs — the only way a render tool gets a file. It refuses a practice DNG and any file outside the folders the owner shared. `tools/look-sheet.mjs` takes its file through it. `tools/decisions-check.mjs` requires every "Looked at" entry about a photograph to name one of those files with its extension, with the older entries declared in `.owner-images-allow` and only shrinking. The session brief prints what the set holds.

**Smell:** a conclusion about colour, a lens or the look drawn from a file the app opens differently from a reader's own raw. Or a search for a photograph beyond the ones the owner handed over.

**Measured 2026-09-28 in Jefferson-Photography-Studio.**
- **What the practice files are.** The app ships 44 practice DNGs. They are hand-written copies: no EXIF, no camera, no lens. So the app opens them with none of what it does for a reader's raw, and the lens fix is matched from EXIF.
- **What was judged on them.** Decision 069, clouds tinted cyan under the look's sky stages, was worked for days on them. Ten options were judged, nine rejected, and the tenth concluded the white balance was to blame. That conclusion came from NIR_1651 and NIR_1644, both opened with no lens fix, while the one real raw in the same run, NIR_3461, opened with its fix and had a neutral cloud.
- **What had been shared all along.** 444 files in seven Drive folders shared for testing: 229 raws, and among them the originals of 27 of the practice frames, NIR_1651.NEF included. Every session found them again by searching scratch folders that die with the container, and then used the practice copies anyway.

**And then it went further the wrong way.** A file earlier sessions had used, NIR_3406.NEF, was not in the shared folders. The owner had already said not to use it. Rather than drop it, the session searched the owner's whole Drive for it, then searched for every raw outside the shared folders to make its list complete. It had nearly five hundred files. The connector can see the whole Drive, and that is access, not permission. The shared folders are the set because the owner chose them, and a file outside them is not test data.

**What the gates do, and what is left to judgement.**
- **What is gated.** The door and the records gate cover the repo's own render tool and every record.
- **What cannot be gated.** A scratch harness written in a session cannot be. It must fetch through the same door, and it is a CHECKLIST line in the repo's CLAUDE.md.
- **Adding to the set is the owner's act.** They share a folder, and its listing is added to the index. Never search for more.
