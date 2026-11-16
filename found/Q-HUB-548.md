Q-HUB-548: A write of a path in a folder beneath the plans folder on the main thread is refused by the manager hold with its own text before the plan file hold judges it, so the refusal names the wrong hold and the plan file hold's case does not reach such a path.

Fix in: `hook-dispatch.mjs`. The manager hold passes only a plan file directly under the plans folder, and the plan file hold reads the whole folder.
