## 220 · A role granted inside the app is not a key to the door in front of it

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — the crew manual
must say that granting the role is two steps, name the infrastructure policy
as the half the app cannot perform, and tell apart the three different codes
that land on somebody during one first visit. · CHECKLIST
two-systems-two-grants — wherever an app sits behind an access layer it does
not control, every grant of an in-app role is written down as two steps, with
the one the app cannot do named and attributed to whoever can. · JUDGEMENT —
which grants have a second half outside the app is specific to the
deployment, and nothing inside the app can discover it.

**Smell:** an admin surface protected by something the app did not build —
Zero Trust, a VPN, an IP allowlist, HTTP auth at the edge — with an in-app
"make them an admin" button beside it. The button will look like the whole
operation because from inside the app it IS the whole operation.

**The unlisted app, 2026-09-02.** The owner promoted a second person to the
admin role and asked how to tell them to sign in. The honest answer was that
the instructions would not have worked: the console sits behind Cloudflare
Access, which knows nothing about the app, has never heard of its roles, and
decides who may load the address at all from a list of email addresses in a
dashboard. **Pressing the button gave them the keys and did not open the
door.** They would have reached a login they could not pass, on a page that
cannot say why, because the thing refusing them has no idea a role was ever
granted.

**Neither half can see the other, and that is not a bug in either.** The app
cannot read the access policy; the access layer cannot read the app's roles.
The separation is the security property — an outer wall that does not depend
on the application's own logic is exactly what an outer wall is for. What was
missing was nowhere in either system: **a written procedure that names both
halves and says which one a person can do and which one only the account
holder can.**

**Three codes arrive in that one visit** and the first hour is spent
confusing them: a one-time code emailed by the access layer, which gets them
to the page; a device-link code from their own copy of the app, which signs
the console in as them; and the app's invitation code, which is neither and
is only for somebody who is not on the line at all. Each was documented
separately and correctly. Nothing said they are three different things, which
is the only sentence that matters when all three are in a person's hands at
once.

**The general rule: an admin surface behind an access layer the app does not
control has a TWO-PART grant, and the app can only ever perform one part.**
Write the other part down where the role is granted, name who can perform it,
and say what the failure looks like from the far end — because it looks like
the app being broken, and it will be reported that way.

---

**A second finding from the same session, on the same console, of a related
shape: one string was serving a privacy promise and an operational record at
once, and it could only keep one of them.**

Two entirely different events rendered as the same words, "a former member".
An administrator removing somebody's access tombstones the row and LEAVES THE
NAME IN IT. A person deleting themselves clears the name, and it is genuinely
gone. Both displayed identically, so an administrator looking at the roster
could not tell who they had removed, whether it was the right person, or
whether the row was somebody's own choice to leave — **while the name sat in
the database, being withheld from the one person entitled to see it.**

The byline exists to protect a departed person from the other members. It was
applied on the admin console by inheritance rather than by decision, where it
protected nobody and destroyed the console's only means of verifying its own
actions. Split by audience: the byline is unchanged everywhere members can
see, and the console shows the fact — the name where the name survives,
nothing where the person erased it, and which of the two it was either way.

**And proving the second half of that turned up a real leak.** Before claiming
an erased name could not be recovered, it was worth checking, and it could:
the invitation row that seated a person carries the name the seat was minted
under, and the deletion path was not clearing it. The promise had been kept in
one of the two places the name lived. **The claim a gate is about to make is
the best prompt there is for checking whether it is true.**
