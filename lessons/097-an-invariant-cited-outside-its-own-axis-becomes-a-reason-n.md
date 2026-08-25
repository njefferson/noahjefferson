## 97 · An invariant cited outside its own axis becomes a reason not to fix a defect

**Enforced by:** CHECKLIST law-in-its-axis — before a product law is used to
decline a request, name the axis the law is written about and check it is the
axis the request is on. A law quoted as a slogan is not a law being applied.

Quietkeep's product law 4 reads: *"Levels push down; the user never climbs. The
runway is the only workspace. Higher horizons project lineage and health
downward. Altitude views are inspection modes, not places to work."*

Its subject is **altitude**. It exists so that nobody has to climb a hierarchy of
goals and areas to plan a day — lineage projects downward, and a goal is
something you inspect rather than somewhere you go to work. Its own ADR says so.

The first thing ever asked of that app was *"the app is one long page, it needs
pages or tabs, no?"*. It got neither, and the reason recorded was the middle
sentence of law 4: **the runway is the only workspace.**

That sentence is about *where work happens*. It was read as *how the runway is
laid out* — and those are different axes. Once read that way, an invariant about
hierarchy became a standing answer to a question about navigation, and the
defect it was closing was real and measurable: the page ran to 3.0 screens with
six live blocks on the **small** thirteen-item sample, and eight blocks with the
list starting 4.9 screens down on a phone with a real store. There was no index
of what was on the page and no way to reach any block but the two at the ends.

Nineteen days later the same defect was found again on a device, unchanged:
**there was still no way to reach any section except by scrolling the whole
front page**, so the surface read as one very long to-do list.

**Why this is worth its own entry rather than being filed under §96.** In §96 a
requirement was translated into a mechanism and lost. Here the requirement was
never lost — it was *refused*, in writing, citing a rule. That is a much stronger
close: a session reading "law 4 forbids it" does not go looking for whether law 4
forbids it, because a product law is the one kind of statement in these repos
that is not supposed to be re-litigated. **The strength of the invariant is
exactly what makes misciting one expensive.**

**And the misreading survives being right about the other half.** The same answer
correctly declined *tabs* — tabs partition, and a partition means remembering to
check the other pile, which is the failure that app exists to prevent. Being
right about the mechanism made the whole answer feel finished. It is the §96
shape one level up: the correct half carries the wrong half.

**The habit:** when a law is about to decline a request, say the axis out loud.
*"Law 4 is about altitude; this request is about navigation; law 4 has no
opinion here."* Two clauses, and they either hold or they visibly do not. A law
that is quoted rather than applied is being used as a slogan, and a slogan cannot
be checked.
