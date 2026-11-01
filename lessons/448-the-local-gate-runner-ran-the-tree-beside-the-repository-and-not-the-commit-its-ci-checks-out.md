## 448 · The local gate runner ran the tree beside the repository and not the commit its CI checks out

**Enforced by:** GATE hub:hub-gates-local.mjs — `node hub-gates-local.mjs --repo <path>` reads the same pin the pin check reads, refuses a pin the hub's `main` does not reach before any gate runs, adds a worktree of the hub at the pinned commit with `git worktree add`, runs the gates from that worktree as `hub-gates.yml` does, removes the worktree, and closes with a line naming the commit the gates ran from and never the tree beside it

**Recorded 2026-11-01.** Measured on 31 October with the same scratch harness as lesson 447. A sibling's local run of the hub's gates used the hub checkout beside it, which is the hub's current tree, while its CI checks the hub out at the commit its workflow pins. The two can differ by every gate added since the pin, and a green local run said nothing about the run that counts. In the harness an orphan pin was refused with no worktree made, and a real pin ran eight gates, left no worktree registered, and printed the pinned commit in its closing line.

**What is done now.** One runner at the hub root, imports the pin readers instead of copying them, and the gate index says the sibling copies are superseded. A gate the pinned commit does not have is printed as absent from it, not run from somewhere else.

**What the change leaves.** In a scratch repository with no `.branch-guard` the branch-guard step fails inside the runner, which is correct for that repository. The runner is wired into no sibling's CI, and siblings keep their copies until a later plan removes them.

**The general form.** A local run is evidence about the run it imitates only when it uses the same inputs. The closing line names the input.
