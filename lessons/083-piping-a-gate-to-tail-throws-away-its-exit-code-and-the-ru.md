## 83 · Piping a gate to `tail` throws away its exit code, and the run summary then reports success for a failing gate

**Enforced by:** CHECKLIST — never pipe a gate to `tail`/`head`/`grep` and read the pipeline's status. Either run it bare, redirect to a file (`gate > out.txt 2>&1; echo $?`), or echo `${PIPESTATUS[0]}` explicitly. Before reporting any gate green, the number you quote must come from the gate, not from whatever formatted its output.

A walk was run as `npm run smoke 2>&1 | tail -80` to keep the output small. The
harness reported the background task as **completed, exit code 0**. The walk had
in fact failed two checks and exited 1.

A shell pipeline's exit status is the status of the **last** command, and the last
command was `tail`, which succeeds at printing whatever it was handed — including
the output of a gate that just failed. The failure was still visible in the text,
but only in the part `tail` kept, and the two `FAIL` lines were near the top of a
long run, so the window that made the output manageable was also the window that
hid the result.

**Three things made it worse than an ordinary mistake:**

- **The summary was affirmative, not silent.** "Completed (exit code 0)" reads as
  a verified pass. Silence would have prompted a check; a confident wrong answer
  did not.
- **The failing checks were the cheapest kind** — a stale bundle, because a
  source file was edited after the build and never rebuilt. Exactly the failure a
  gate exists to catch, and exactly the one most likely to be waved through.
- **It sits on the reporting path.** This repo already carries §53: four releases
  reported as shipped that never deployed. The shape is the same — a status was
  read from something adjacent to the thing being asserted, and the adjacent
  thing was healthy.

The tell that caught it was an explicit `echo "exit=${PIPESTATUS[0]}"` in the
same command, printing `1` two lines under a summary saying `0`. That habit is
the whole fix, and it costs nothing.

**The general shape:** every convenience wrapped around a check — a pipe, a
formatter, a retry loop, a summary line — is a place the check's verdict can be
replaced by the wrapper's. **Ask what actually produced the number you are about
to repeat.** If it is not the thing being checked, you have not checked it.
