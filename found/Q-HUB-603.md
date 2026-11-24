Q-HUB-603: Seen on 22 November 2026 in a read of the environments of the account: one environment holds a token and a secret as plain variables, where the product keeps a credential as a network secret that no session reads.

The need, put exactly on 23 November 2026. The environment holds three plain variables and no network secret: a token for the Cloudflare API, a Turnstile secret, and an account identifier under a misspelled name. A variable is readable by every command that runs in a session on that environment, and its network allows hosts that such a command could send it to. A network secret is not readable by any session: the proxy adds it to a request's header for one host. A session edits only the environment it runs in, so the move is made in a session on that environment, by the block below. It asks for one secure form and one approval card. A newly issued token is entered on the form, and the old one is revoked after the move, because entering the old one moves it without closing what was readable. The names of the environments are given in the session's report and not here.

Not known from the hub: how that repository's deploy reads the three variables, whether its deploy tool works with the token on the proxy, and whether the environment's edit takes a placeholder under that variable's name. The block tries each before it removes anything, and says what it met.

```
Move this environment's credentials out of plain variables. At no point print, echo, log or write the value of any variable, and never ask for a secret in the chat.

1. Read this session's environment and list the names of its variables and of its network secrets. Expected: the variables CLOUDFLARE_API_TOKEN, Turnstile_secret and CLOUDEFLARE_ACCOUNT_ID, and no network secret. If the names differ, say so and go on with what is there.
2. Search this repository for each of those names, and for the word turnstile in any case, and say in one line each what reads it: a script, a config file, a workflow, or nothing.
3. The Cloudflare API token. Ask for it with the secure credential form, for the host api.cloudflare.com, as a bearer token. A newly issued token is entered there. Then prove that it works with the real value out of the way: run one call that changes nothing, a GET of https://api.cloudflare.com/client/v4/user/tokens/verify with a placeholder in the place of the token, and say what it returned. If it does not return success, stop here and change nothing.
4. Only after step 3 returned success, propose one edit of this environment that puts the placeholder in the place of the value of CLOUDFLARE_API_TOKEN, so that the deploy tool still starts and the proxy puts the real token on the request. If the edit is refused for that name, say so, and propose removing the variable and giving the placeholder on the deploy command's own line.
5. The Turnstile secret. It is sent in the body of a request and not in a header, so it cannot be kept as a network secret. From step 2, say whether anything in this repository needs its value inside a session. If nothing does, propose removing the variable in the same edit as step 4. If something does, stop, say what, and change nothing for it.
6. CLOUDEFLARE_ACCOUNT_ID is an identifier and not a secret, and its name is misspelled. Say what reads it, and change nothing for it.
7. If this repository has a deploy check or a dry run that changes nothing, run it and say whether it still passes.
8. End by reading the environment again and listing the names of its variables and of its network secrets.
```

Not the repository's: The need is put exactly: which environment, which variables, and where each is set as a secret and removed as a variable.
