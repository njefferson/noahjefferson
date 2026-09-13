## 287 · `ps` in a fresh shell call cannot see what an earlier call started, so "no process" is a fact about the namespace

**Enforced by:** CHECKLIST own-what-you-start — a background process is
confirmed dead by the RESOURCE it holds (its port, its lock file, its output),
never by a process listing taken in a later shell call. · GATE none possible: a
session cannot gate what its own harness hides from it.

**Smell:** `ps -e | grep <thing>` returning nothing, in a call that did not
start the thing. Any sweep that concludes "nothing leaked" from a listing alone.
`pgrep -f "<pattern>"` at all — it matches its own wrapper's command line
(§270), and here it also killed that wrapper.

**Measured 2026-09-13, Jefferson-Photography-Studio, while sweeping servers.**

§270 says every process you start is owned until CONFIRMED dead, and the
confirmation it names is `ps`. On this harness that confirmation can be
**structurally unable to see the process**, and it fails in the direction that
reads as all-clear.

A static server was started in one Bash call to serve a build for a browser
walk. Later calls reported, in order:

- `ps -eo pid,args | grep "[h]ttp.server"` — nothing.
- `ps -eo pid,comm,args | awk '$2 ~ /python3/'` — nothing.
- `ps -eo pid,ppid,etimes,args --sort=etimes | tail -15` — kernel threads and
  the container's init, and no python at all.
- `curl http://127.0.0.1:8131/ir.html` — **200.**

Three process listings said the server was gone and the port said it was
serving. The listings were right about their own namespace: **each Bash call
runs in its own PID namespace while sharing the network namespace**, so a
process started in an earlier call is invisible to `ps` in a later one and its
socket is not. Every "nothing leaked" conclusion drawn from `ps` across calls
had been a fact about process isolation.

`fuser -k 8131/tcp` found it as PID 5168 and killed it. The kill worked across
the boundary the listing could not see across, because it goes at the SOCKET
rather than at the process table.

**Two tells that were there and were read the wrong way.** A backgrounded server
printed `Exit 1` on three separate rounds — the new one failing to bind because
the old one still held the port. That is the port saying "occupied" in the one
place it could, and it was read as noise from a race. And a `kill -9` of a
freshly-captured PID had succeeded in the same call every time, which is what
built the confidence that the pattern was sound: it IS sound, within one call,
and says nothing about the calls before it.

**So the rule sharpens rather than changes.** Confirming a process is dead means
confirming the RESOURCE is free:

- a server — the port does not answer (`curl`), or `fuser -k <port>/tcp`;
- a file writer — the lock or the output file stops changing;
- a walk — its exit code, or the file it was told to write.

A process listing is evidence only inside the call that took it. Across calls
it cannot distinguish *dead* from *invisible*, and it reports both as absent.

**And `pgrep -f` earned its second entry.** `pgrep -f "http.server 8131"`
matched the wrapper shell whose own command line contained that string, and the
`kill` that followed killed the wrapper — the command's only output was
`killing 15969`, its own PID, as it died. §270 recorded this pattern stranding
processes by never exiting a loop; here it strands them by killing the sweeper
instead of the sweepee. There is no spelling of `pgrep -f` that is safe in a
command whose text contains the pattern, which is every command that uses it.
