Q-HUB-558: On 18 November the push guard refused a push after a checker had passed the commit. The checker had called the Write tool for a test script in the scratchpad, as its role allows and its page asked, and the guard counts a pass only from a checker whose record holds no call of a writing tool. The guard does not count a write made through the shell.

Fix in: `plans/native/roles/checker.md`, `.claude/agents/checker.md`, `push-guard.mjs`. The role and the guard are made to agree on what a checker may write, without loosening what the guard holds.
