## 152 · An app offered the reader a new version, they took it, and nothing ever said what changed

**Enforced by:** GATE MoleBridge:tools/walk.mjs — the after-an-update panel is
walked in five states: a newcomer is not shown it, a returning reader is, it is
not shown over a resumed session, the version is recorded on dismissal however
the dialog was closed, and everything since the last recorded version is shown
rather than only the newest. · CHECKLIST what-did-they-just-get — for any app
whose §7h strip offers an update, ask what the reader sees AFTER they press it.

**Smell:** §7h is built and reported done. The strip waits, the reader is told
in words they can see, nothing reloads under them — every clause of the rule is
satisfied, and the rule stops one sentence short of the thing the reader
actually experiences, which is an app that is suddenly different.

MoleBridge had the strip, and it had patch notes (§7d), and the two had never
been connected. The reader pressed **Use it now**, the page reloaded, and the
account of what changed was behind the ⓘ under **What changed** — a place
somebody opens only if they already suspect there is news, which is precisely
what an app that updates itself gives them no reason to suspect. Both rules were
green. The gap was between them.

**It has to be AFTER the switch, and that is forced rather than chosen.** The
obvious design is a "what's in it" line on the strip itself. It cannot be
honest: the page showing that strip is the OLD build, and its release notes were
generated from the changelog as it stood when that build was made. The running
code has never heard of the release it is offering. The first moment anything in
the app knows is after the reload, in the new build.

**Three rules about when it may interrupt**, each of which is a state to walk:

- A newcomer is never told. There is no news for somebody with no before, and
  two modals stacked on a first run is the app talking over itself at the one
  moment a reader is deciding what it is.
- Never over work in progress. Record nothing in that case, so the offer stands
  rather than being swallowed — the same posture as the strip's own *Not yet*,
  which dismisses without resolving.
- Everything since, not only the newest. Being told about one of four changes is
  how an app comes to seem like it changes for no reason.

**And cap it.** Thirty releases in a dialog puts the way out under everything the
reader did not ask to read. The newest five and a link to a page carrying the
rest — a page inside the app, cached with it, not a link to a code host, whose
audience and language are somebody else's.

**The case the feature creates for itself, which nearly made the release that
adds it show nobody anything.** Every existing reader arrives at the first build
that records a version with nothing recorded — indistinguishable, from that key
alone, from somebody who has never opened the app. They are not the same person,
and the app already knows which is which by some other mark: whether the
orientation has been read. A returning reader with no recorded version gets the
release in front of them, which is the most that can be said without inventing
what they last saw.

Every sibling with an update strip has this gap until it is closed on purpose.
