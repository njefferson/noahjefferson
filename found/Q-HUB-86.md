Q-HUB-86: the correction gate reads a bare option number given to answer a choice as a correction, so the answer was held until a message ended with a go-word; for the next hub plan, a bare option number answers a choice and is not held (found in step 0, recorded by step 219).

Fix in: `hook-dispatch.mjs`. A message that is only a bare option number given to answer a choice is read as the answer and not as a correction, while the go-word list stays as it is.
