## 185 · An offline suite that waits on a live service has an upstream's uptime in its verdict

**Enforced by:** CHECKLIST own-your-inputs — a suite that runs against a local
server seeds the state its assertions need, rather than waiting for a real
service to supply it. · CHECKLIST wait-for-the-app — a wait is legitimate when
the thing being waited for is something the app controls, and is a disguised
service-availability assertion when it is not. · JUDGEMENT — the same assertion
passing on one geometry and failing on another, on the same commit, is a race,
and a longer timeout is not the fix for it.

**Smell:** a check that goes red on one screen size and green on another in the
same run. Also: a suite named for something local — offline, geometry,
accessibility — whose failures name an external service. Also: any fix of the
form "give it a few more seconds".

Thalweg's `tools/a11y.mjs` runs six screen sizes and two browser engines against
a local server. Three of its checks asked DWR's ImageServer for a real survey
and read the resulting label, and one more asserted a control in the Layers
panel — which `renderLayers()` does not draw at all until the survey catalogue's
promise settles.

It failed on the desktop geometry while the phone geometry passed the identical
assertion seconds later. **Three attempts to wait more carefully all failed, and
one made it worse**, turning a single failure into three:

- Waiting for the label to stop saying it was asking. The label reaches a
  terminal *"the directory has not arrived"* just as readily.
- Waiting for the catalogue to have entries. That is a requirement that DWR has
  published a survey for that point — an assertion about a state agency wearing
  the costume of an assertion about the app.
- Waiting for the panel to render. From a GitHub runner that took over twenty
  seconds, and sometimes never.

**The tell was there from the first run and it is worth learning to read.** Two
geometries running the same assertion minutes apart, one red and one green, is
never a defect in the thing asserted. It is a race, and the question is what the
race is against — here, an ImageServer belonging to somebody else.

**The fix is not a better wait. It is owning the input.** The suite seeds a
catalogue. Whether the real directory arrives and renders is the LIVE suite's
question, and it was already asking it — those three checks were duplicates of
`tools/live-test.mjs` ones, in a suite that had no business needing a network.
That suite is `continue-on-error` precisely because an upstream outage is not
the commit's fault, which is the distinction the offline suite had lost.

**The rule, in one line:** wait for what the app controls, never for what an
upstream controls, and where the app's own render is gated on an upstream, hand
it the input instead of waiting for one.

**And a smaller one that cost four round trips.** 190 lines of PASS push a
handful of FAILs far enough up a CI log that fetching its tail shows the runner
cleaning up and nothing else — so each diagnosis cost a push. The suite repeats
its failures at the end now. A test runner's log is read backwards.
