## 132 · The status page whose whole point is being current at ONE address was structurally always one promotion behind it

**Enforced by:** CHECKLIST promote-the-record-too — a promotion is not finished
when the app is live; it is finished when the record commit that says so has ALSO
been promoted, because that commit is what makes the published status page true. ·
GATE 3d-printing-pal:tools/branch-state-check.mjs — holds the page's version lines
to the release triplet in the TREE, which is necessary and is not sufficient: it
cannot see which ref the reader is actually served.

Doctrine §7i's page ships inside `public/` and deploys with the app. The release
flow is: promote the app, then write a record commit saying it reached production
— and that commit lands on `staging`, because that is where work goes.

**So the published copy of the page states the state BEFORE the promotion it is
describing.** Immediately after promoting 0.7.2, the page at the production
address still read *"0.7.1 is live. 0.7.2 is on staging, waiting for you to pass
it"* — an instruction to do a thing already done. The corrected copy existed, was
green, and was on the wrong branch.

**Every release had this and none of them noticed**, because the window closes on
the next promotion, and nobody looks at a status page except when they are handed
the link. The link is handed over in a progress reply — which is exactly inside
the window.

**The tree-level gate cannot catch it and is not the answer.** A commit guard
comparing the working tree against `origin/main` is measuring the right things and
is blind to this by construction: both copies are internally consistent, on
different refs, and the reader is served one of them. **A gate that checks the
artefact cannot check which artefact was published** — that is a fact about a
deployment, not about a tree.

**The fix is sequence, not code.** Promote the record commit as part of the
promotion rather than leaving it for the next release to carry. It is docs plus
the status page, no app change, and it is already green from its own staging run —
so it is a second fast-forward, not a second risk.

**The general shape: an artefact that DESCRIBES a deployment has to be deployed
after the thing it describes, which means it is never covered by that thing's own
release.** Anything with this shape — a status page, a "what is live" banner, a
version history rendered from a file — needs its update promoted separately or it
documents the previous state at the address people read.
