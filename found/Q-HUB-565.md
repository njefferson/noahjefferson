Q-HUB-565: Since the commit of 18 November the planted failure `wq_stop_text` finds its line twice in the dispatcher, and a run takes out the first only. The suite's listing names it as ambiguous.

Fix in: `guard-cases/dispatch.mjs`. Its find is made to stand once.
