Q-HUB-575: Eight research files and an appendix under plans/research/, and ten parts of the ledger with its index under plans/rules-ledger/, are whole and untracked in one session's checkout. The design in plans/hub-analysis.md rests on them. Nothing holds them if that container is reclaimed.

Fix in: `plans/research/00-what-was-read.md`, `plans/rules-ledger/index.md`. The research and the ledger's parts are landed by a page of their own, the first piece run by the script, and what the run cost in acts, stops and tokens is written beside the earlier entries.
