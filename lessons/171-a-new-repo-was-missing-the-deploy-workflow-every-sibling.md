## 171 · A new repo was missing the one file every sibling already has, and three round trips were spent asking a person to do what CI does

**Enforced by:** CHECKLIST read-the-siblings-workflows — before proposing any
deploy mechanism in a new repository, read `noahjefferson/.github/workflows/`
and copy the arrangement that is already working. · CHECKLIST
capability-before-request — before asking the owner to do something, establish
that it is actually theirs to do.

**Smell:** a session about to ask the owner for a dashboard step, a credential,
or a network allowance, in a family of repositories where the same job is
already automated somewhere else.

A new app was built and pushed. Asked how to deploy it, the session said:
connect the repository to Cloudflare Pages in the dashboard, build command
none, output directory `public`. Then, over three further exchanges, it asked
for two hosts to be opened on the session network so it could deploy by hand
and then check the result.

None of that was necessary. Every deployed app in this family ships a
`deploy.yml` that holds two repository secrets, creates its own Pages project
with `pages project create`, and deploys on push to `main`. There is no
dashboard step anywhere in the arrangement and there never was. **The secrets
were already configured on the new repository** — the very first run of the
workflow, once written, went straight through credentials, created the project
and deployed. The only thing missing had been the file.

**The evidence was in the working tree the whole time.** The hub was checked
out beside the new repo, its `CLAUDE.md` says in plain words that
`.github/workflows/deploy.yml` deploys `public/` to Cloudflare Pages on every
push to `main`, and that sentence was read early in the session. It was read as
a fact about the hub rather than as the pattern to copy.

**What made it persist for three exchanges** is that each ask was individually
reasonable. No Cloudflare credential in the environment: true, and checked. The
Cloudflare MCP server is read-only for Workers: true, and checked.
`api.cloudflare.com` refused by the egress policy: true, and checked. Three
correct findings, each one deepening a conclusion that was wrong at the root,
because all three were answers to "why can *this session* not deploy" and none
of them to "whose job is deploying".

It ended on the observation that no sibling repo had ever needed this much
setup by hand — which is the fact that the three findings had walked past.

**The general shape: a capability question answered from inside the session's
own reach.** "I cannot do X" is not the same as "X needs a person", and the
gap between them is exactly where a session hands somebody else work that was
already automated. Before asking, establish who or what normally does the
thing — in a family of repositories, usually by reading the one that already
does it.

**A second, smaller cost is worth recording.** One of the three requests was
genuinely useful: a data host was opened that let the missing river gauges be
written against real responses rather than remembered ones. Asking is not the
error. Asking for something a file in the next directory would have made
unnecessary is.
