## 23. "The source gave me null" is not the same fact as "this is unknowable"

**Enforced by:** CHECKLIST null-is-not-unknowable — distinguish “the source returned nothing” from “this cannot be known” in the data model and in the words shown to the reader.

An honesty rule can be over-applied until it starts refusing to report a
measurement you are already holding.

fauxplane's rule is that every value traces to a sensor or a feed, and a missing
reading is a FAIL that says so. Correct, and it stays. But groundspeed sat
crossed out on a stationary device for four releases, because the Geolocation
API returns `coords.speed === null` when the platform will not compute one — and
that was read as "no groundspeed exists". **A receiver that is not moving has a
groundspeed. It is zero.** The two position fixes and the clock it is made of
were in hand the whole time; nobody differenced them.

**The tell was sitting in the code, in English, the entire time.** The failure
reason read:

> `this fix carried no speed (stationary, or the platform does not report it)`

A reason string containing "**X, or Y**" is not documentation. It is the code
confessing that it cannot distinguish two cases and did not try. Grep your own
failure messages for "or" — each one is a branch someone declined to write.

Three things generalise:

- **Distinguish the channel from the quantity.** "This API did not answer" is a
 statement about an API. Ask whether another channel already in hand answers
 it. A derived value from real inputs is not synthetic; refusing to compute it
 is not rigour.
- **Report the resolution, not just the value.** Zero is honest when it comes
 with the bound it is known to: two fixes of ±5 m taken 5 s apart resolve to
 ±1.41 m/s, so "0 kt, ±2.7 kt" is a complete measurement and "unknown" is not.
- **Not every zero is a measurement, and the difference is worth stating.** The
 same stationary receiver has NO track over ground — no direction of travel
 exists, rather than one below the noise floor. Zero speed is a measurement;
 zero track is a category error. A rule you can apply in both directions and
 say why is a rule; one you apply in one direction is a habit.

*(fauxplane, 2026-08-02 — found by the user, not by any gate, because every gate
agreed the FAIL was intentional.)*
