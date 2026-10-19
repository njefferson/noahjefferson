## 412 · The suite shared the live session's id and could rewrite its status page, so it runs under a planted session and every case is compared with the planted pad

**Enforced by:** GATE hub:session-guards.test.mjs — the case that holds the comparison itself to account (the planted pad is quiet when untouched, finds a rewritten page, finds a removed note and finds a real page write made by report.mjs for the planted session, the inherited session id is the planted one and the temp folder is the suite's) and the check the suite runs after every case, which fails a case that changed the planted page or notes and says so at the end of a run and of the plants

**Recorded 2026-10-19.** A suite run from inside a session inherits that session's id and its temp folder, and every guard that falls back on that variable writes where the live session reads. A reviewer read the live status page's header and took it for a test plan's while step 108's suite ran, which is how the leak was seen: a case had written the page through the inherited variable, and the page is the state of the work.

**What is done now.** Before any case runs, `session-guards.test.mjs` takes the inherited session id and temp folder out of the environment and puts a planted session in their place, `sg-live-<pid>`, with a scratchpad under the suite's own temp folder holding a planted status page and planted manager notes. After every case the planted pair is compared byte for byte, and a case that changed either fails with the file named and the planted bytes are put back so the next case is judged alone. The live session's files are never read or compared, because they change legitimately while a suite runs; what is compared is the pad the environment now points at. A run prints whether the planted pad was unchanged, for the suite and for the plants.

**What the check cannot see.** A case that reaches the live scratchpad by a path that carries the live session's id in its own words. No case builds one; the ids a case uses are made by the suite.

**The general form.** A test that must not touch a thing is given a stand-in for the thing, and the stand-in is what is checked afterward.
