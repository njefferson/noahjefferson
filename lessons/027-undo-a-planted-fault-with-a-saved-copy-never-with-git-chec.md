## 27 · Undo a planted fault with a saved copy, never with `git checkout`

**Enforced by:** CHECKLIST plant-then-restore — before planting a deliberate fault, copy the file aside; restore from that copy. Never `git checkout` a path that holds uncommitted work.

§7g requires planting a fault and watching a gate go red before trusting its
green, and this session did that four times. The fourth one cost the release's
markup: `git checkout public/index.html` removed the planted `tabindex="-1"`
**and every other uncommitted change in that file** — a whole feature's HTML,
written over the preceding hour. Nothing warned; the command did exactly what
it says it does.

The mutation-testing rule and the working-tree rule collide here, and the
collision is structural rather than careless: **the plant-and-revert cycle
happens on exactly the files a release is actively editing**, because those are
the files whose gates you are proving. So the revert step is the dangerous one,
every time, and its danger scales with how much good work is sitting next to
the fault.

Two things that make it safe, both cheap:

- **Copy the file aside first** (`cp x /tmp/x.bak` … `cp /tmp/x.bak x`). The
 restore is then exactly the inverse of the plant and touches nothing else.
 Earlier plants in this same session did this and were fine; the one that used
 a checkout was the one that hurt.
- **Or commit before planting.** A fault planted on a clean tree can be reverted
 with a checkout safely — which is precisely why the habit feels safe right up
 until the tree is not clean.

**The general shape: a command whose blast radius is "the file" is unsafe in a
workflow whose unit is "the change".** Before any revert, ask what else lives in
that path — the answer is usually "an hour of work" and it is never announced.

*(Quietkeep 1.18.0, 2026-08-03. Recovered by re-applying the edits; the sweep
was re-run clean afterwards rather than assumed.)*

---
