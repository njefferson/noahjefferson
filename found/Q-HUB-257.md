Q-HUB-257: no line of the dispatcher reads a permission mode from a UserPromptSubmit payload and a session start carried none at harness 2.1.316, so the plan seed's print at a prompt may never fire and the dispatcher learns the mode from PreToolUse payloads; the manager runs the seed by hand where it does not (found in steps 81 and 82 of the plan that wrote the seed, filed in step 83).

Not the repository's: the harness's session start and prompt payloads carry no permission mode at harness 2.1.316, so the seed prints at the first call that carries one.
