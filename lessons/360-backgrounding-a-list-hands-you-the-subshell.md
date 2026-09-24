## 360 · `a && server &` backgrounds the whole list, and `$!` is the subshell, not the server

**Enforced by:** CHECKLIST start-then-hold — a background server is started as
a command of its own, on its own line or after a `;`, never as the last link of
an `&&` chain, so that `$!` is the server's own process; and every stop is
confirmed by the RESOURCE (the port answers nothing), never by the `kill`
having returned.

**Smell:** `cd dir && python3 -m http.server 8152 & SRV=$!` followed later by
`kill $SRV` and nothing that asks the port afterwards.

**Measured 2026-09-24 in Jefferson-Photography-Studio, twice in one session.**
A scratch render harness started its static server as
`cp … && cd … && python3 -m http.server 8152 & SRV=$!` and stopped it with
`kill $SRV`. The port check after the run read 200, not 000. The process table
showed the server under a different PID from the one held in `$SRV`; killing
that PID took the port to 000. The next run used `cd … && python3 … & SRV=$!`,
the same shape one link shorter, and left the server answering again. Started
as its own command after a `;`, the third run's server stopped when killed.

**Why.** In a shell, `&` applies to the whole AND-list before it. `a && b &` runs
`a && b` in a background subshell, and `$!` is that subshell's PID. `kill` stops
the subshell; the server it launched keeps running, holding the
port. Nothing reports an error, because the `kill` succeeded against the process
it was given.

**What this is not.** §287 records a server that survived three empty `ps`
listings and says two of the three were never explained. This mechanism is one
way a stop can fail silently. That it explains those two is not established.

**The remedy is two lines, not one.** Start the server as its own command, so
`$!` names it; then confirm the stop by the port, because a stop that was never
confirmed is the failure §270 describes, whatever the reason it missed.
