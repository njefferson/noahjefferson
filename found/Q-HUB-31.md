Q-HUB-31: agent-rules.md does not say that a library file a scratch script imports needs the MADE TO FAIL block, while the app's harness guard refuses node --check on such a file without it (found in step 58).

Fix in: `agent-rules.md`. A rule line is added saying a library file a scratch script imports needs the MADE TO FAIL block too, since the harness guard refuses a node run on it without one.
