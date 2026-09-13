## 287 · A process listing that comes back empty is not proof the process is gone — confirm the resource, not the process table

**Enforced by:** CHECKLIST own-what-you-start — a background process is
confirmed dead by the RESOURCE it holds (its port does not answer, its output
file stopped growing, its exit code arrived), never by a process listing alone.
· JUDGEMENT — a listing that disagrees with the resource is the listing to
doubt, and a sweep reports what it could not account for rather than rounding it
to zero.

**Smell:** "nothing leaked" concluded from `ps` and nothing else. `ps ... --sort=etimes | tail`,
which shows the OLDEST processes, in a sweep looking for the newest. `pgrep -f`
in a command whose own text contains the pattern.

**Measured 2026-09-13, Jefferson-Photography-Studio, sweeping static servers.**

§270 says every process you start is owned until CONFIRMED dead, and the
confirmation it names is `ps`. Three listings in a row reported a static server
gone, and the port it was serving answered 200:

- `ps -eo pid,args | grep "[h]ttp.server"` — nothing.
- `ps -eo pid,comm,args | awk '$2 ~ /python3/'` — nothing.
- `ps -eo pid,ppid,etimes,args --sort=etimes | tail -15` — kernel threads only.
- `curl http://127.0.0.1:8131/ir.html` — **200.**
- `fuser -k 8131/tcp` — killed PID 5168, and the port went quiet.

**THE THIRD LISTING WAS THE INSTRUMENT LYING, AND IT WAS MY OWN FAULT.**
`--sort=etimes` sorts ASCENDING by elapsed time, so `tail` shows the processes
that have been alive LONGEST — init and kernel threads, on any machine, every
time. A sweep for something started minutes ago has to read the HEAD of that
sort. Printed against a real leak it would have looked exactly the same.

**The first two are not explained, and this lesson does not pretend they are.**
The first version of it asserted that each shell call gets its own PID
namespace. That was a guess written as a finding, and it is contradicted by a
later call in the same session listing a background `node`, its `python3`
server and their wrapper by PID and killing both. Whatever hid the earlier one —
a sandbox boundary that applies to some calls and not others, a process already
reparented, something else — was not established, and a lesson that names the
wrong cause sends the next session to the wrong remedy.

**So the rule is about the EVIDENCE, not the mechanism, and it holds either
way.** A process table is one witness. When it disagrees with the resource — a
port that answers, a file still growing, a lock still held — the resource is the
one that is right, because the resource is the thing that actually matters. Ask
it directly:

- a server — `curl` the port, and `fuser -k <port>/tcp` to free it;
- a writer — is the output file still changing;
- a walk — did its exit code arrive.

**Two tells were there and were read as noise.** A backgrounded server printed
`Exit 1` on three separate rounds, which is the port saying "occupied" in the
only way it can. And `kill -9` on a freshly-captured PID had worked every time
in the same call, which built the confidence that the pattern was sound — it IS
sound, and it says nothing about the calls before it.

**And `pgrep -f` earned its second entry.** `pgrep -f "http.server 8131"`
matched the wrapper shell whose own command line contained that string, and the
`kill` that followed killed the wrapper: the command's entire output was
`killing 15969`, its own PID, as it died. §270 recorded this spelling stranding
processes by never exiting a loop; here it strands them by killing the sweeper
instead of the swept. There is no safe spelling of `pgrep -f` inside a command
whose text contains the pattern, which is every command that uses it.
