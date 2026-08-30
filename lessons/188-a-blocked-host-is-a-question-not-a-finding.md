## 188 · A blocked host is a question, not a finding

**Enforced by:** JUDGEMENT — no gate can tell an unreachable host from an
absent dataset, because the session sees the same failure either way. ·
CHECKLIST ask-for-the-host — when a fetch fails on egress rather than on the
service, name the exact hosts and ask for them in the same reply; never report
the capability as unavailable and stop. · CHECKLIST say-which-failure — a
session that could not reach a host says that, and never dresses it as
"the data does not exist" or "I could not confirm it exists".

**Smell:** any sentence of the shape "I could not verify X, so I cannot say
whether it is possible." Also: a recommendation to leave a feature out, resting
on evidence the session was never able to gather. Also: falling back on what
the model remembers about a public dataset, because the real one would not load.

A question about public boat ramps and fishing access needed a look at what the
state actually publishes. Two hosts were tried, both refused by the session's
egress policy, and the reply said the data could not be confirmed from here and
put "should I be given access" as a numbered decision at the end.

**That was the wrong shape and it was corrected immediately:** ask for the site
to be added, in the moment, as part of doing the work — rather than
handing back a finding whose entire content is that the session has a firewall.

**Why the distinction is not pedantic.** These are three different states and
only one of them is about the data:

- the host answered and published nothing useful — a finding about the dataset;
- the host answered and refused — a finding about access or licensing;
- the request never left the container — a finding about THIS SESSION, which
  the owner can clear in seconds and which says nothing whatever about the app.

Reporting the third as though it were the first is how a real, available
dataset gets written off, and how a decision the owner would have made one way
gets put to them with the evidence missing. It is the same defect as the app's
own rule that not knowing and knowing there is nothing must never print as the
same sentence — here the app was honest about it and the session was not.

**The general form: the cheapest unblock is asked for, not worked around.**
A session that hits a wall it cannot pass has one move that costs the owner a
few seconds and one that costs them a worse answer. Take the first. This is
the same family as never offering a capability the record says is impossible —
both are about knowing which side of the wall a limit is on before speaking.
