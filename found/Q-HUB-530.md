Q-HUB-530: A message already answered was delivered again at later prompts five times on 11 November.

Fix in: `pending-guard.mjs`. The pending guard prints a message once and does not print it again after a message typed later has arrived.
