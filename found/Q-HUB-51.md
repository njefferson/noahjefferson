Q-HUB-51: any Bash line holding a backtick pair or a dollar-parenthesis group is opened as a command of its own even inside a quoted commit message, so the plan fence refuses it (commandsIn in reply-guard.mjs, judged by plan-fence.mjs); the real remedy is an opener that reads quotes, and the plan wording that avoids them is the cheap one (found in step 137).

Put right already: "a command line is opened as a shell opens it" in `session-guards.test.mjs`. The case holds that text in single quotes never opens a command, so a commit message with a backtick pair passes the plan fence.
