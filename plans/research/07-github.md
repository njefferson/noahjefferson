# GitHub: the hub's branches and rules, and what GitHub offers

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The hub's page of settings says its aim is that the question of whether the repositories are secure has an answer to work down, and it lists what to switch on, what runs by itself and what a session token cannot set. Source: SECURITY.md:6
- The same page says the GitHub settings in its Part 2 cannot be set by the session token, so they are listed and confirmed and not assumed. Source: SECURITY.md:68
- The record of the redesign lists, as a requirement, that the settings a person must change are stated plainly, each with when. Source: archive/plans/redesign-record.md:62
- That record's section 11 says that before any stage that removes a transcript gate, branch protection is to be set on GitHub on the hub's main and on each app's main and staging, requiring the repository's checks and refusing force pushes and deletions. Source: archive/plans/redesign-record.md:439
- The rebuild's design says the hooks that remain are for the rules with no exceptions, among them where a push may go and the check before a push. Source: plans/native-setup.md:15
- The short page says only staging and main reach a remote. Source: plans/native/page.md:44
- The hub's repository file says the hub has the branch main only, with no staging, and that a push to main redeploys. Source: REPOS.md:32
- The hub's repository file says the hub owns the gates every sibling runs, and that its reusable workflow is called by the siblings and not copied. Source: REPOS.md:34
- The hub's repository file says the reusable workflow is a called workflow, which a sibling calls to get every hub gate. Source: REPOS.md:317

## What is there today

- GitHub's public interface answered for the hub's repository and reports it as public, not private, not archived, with main as its default branch. Source: github-api:api-repository.json
- GitHub lists two branches: one under `claude/`, and main. Source: github-api:api-branches.json
- Both branches are reported with protected set to false. Source: github-api:api-branches.json
- The answer for the main branch reports its own protected field as false. Source: github-api:api-branch-main.json
- The list of rulesets is an empty list. Source: github-api:api-rulesets.json
- The list of rules that apply to main is an empty list. Source: github-api:api-rules-on-main.json
- GitHub reports eleven workflows for the hub: seven are files under `.github/workflows/` and four are GitHub's own, listed with paths that begin `dynamic/`. Source: github-api:api-workflows.json
- The seven files are the accessibility gate, the branch sweep, the Cloudflare analytics report, the MyFax deploy, the deploy, the doctrine gates and the reusable hub gates, and all seven are reported as active. Source: github-api:api-workflows.json
- The four that GitHub supplies are named Advanced Security, Dependabot Updates, Dependency Graph and CodeQL, and are reported as active. Source: github-api:api-workflows.json
- The answer for the hub's environments is a message that access to that path is not permitted through the proxy. Source: github-api:api-environments.json
- The answer for the hub's actions permissions is a message that access to that path is not permitted through the proxy. Source: github-api:api-actions-permissions.json
- The deploy workflow runs on a push to main and on a manual dispatch. Source: .github/workflows/deploy.yml:11
- The accessibility gate workflow runs on a push to main, on a pull request and on a manual dispatch. Source: .github/workflows/a11y.yml:11
- The doctrine gates workflow runs on a push to main or to a branch under `claude/`, on a pull request and on a manual dispatch. Source: .github/workflows/doctrine.yml:29
- The reusable hub gates workflow runs when it is called, and it declares read access to the contents of the repository. Source: .github/workflows/hub-gates.yml:31
- The Cloudflare analytics workflow and the MyFax deploy workflow run only by manual dispatch. Source: .github/workflows/cf-analytics.yml:22
- The branch sweep workflow runs by manual dispatch and as a called workflow. Source: .github/workflows/branch-sweep.yml:46
- The hub's page of settings says a check can be required on a branch only if it already ran on that commit somewhere else. Source: SECURITY.md:113
- The same page says a repository with one branch can have no required checks, because nothing has run on a commit before it is pushed to main. Source: SECURITY.md:146
- The same page says to protect the hub's main with no force pushes and an empty list of required checks. Source: SECURITY.md:149
- The same page says not to tick the rule that requires a pull request before merging in any repository that promotes by pushing a branch. Source: SECURITY.md:106
- The same page says a required check on a work branch deadlocks on the first commit. Source: SECURITY.md:102
- The same page says that the check name of a reusable-workflow call is the calling job's id and the called job's name joined by a slash, and that renaming either leaves a rule that matches nothing. Source: SECURITY.md:127
- The same page says production's environment should have a deployment branch rule limiting it to main. Source: SECURITY.md:163
- The same page says required reviewers is a separate decision, because it pauses every deploy until someone approves it in the browser. Source: SECURITY.md:170
- The same page says the order of the environment steps matters: staging first with its two secrets, then production, then the branch rule, then deleting the repository-level secrets. Source: SECURITY.md:155
- The same page records the hub's workflows that read secrets outside an environment as a standing finding, and says the settings come first and the `environment:` line last. Source: SECURITY.md:249
- The same page says the deploy workflow and the gates are separate workflows with no dependency, so a red gate does not stop a deploy. Source: SECURITY.md:261
- The head comment of the push guard says only staging and main reach a remote and that a force push to main is refused. Source: push-guard.mjs:3
- The head comment of the push guard says the connector's tools that create a branch are refused, its file writes are refused unless the branch is staging or main, and its merge and branch-update tools are refused whatever they name. Source: push-guard.mjs:30
- The head comment of the push guard says a push that lands on staging or main is refused unless a checker has passed the exact commit it pushes. Source: push-guard.mjs:34
- The hub's repository file says the sibling Jefferson-Photography-Studio has its main not protected and that its deploy does not wait on its gates. Source: REPOS.md:302
- The same file says that sibling owes branch protection on its main requiring the Gates check, as a GitHub setting. Source: REPOS.md:311
- The hub's repository file counts eight repositories that call the reusable workflow as of 4 November 2026, and lists seven by name followed by Quietkeep. Source: REPOS.md:328
- The same file says the sibling Jefferson-Photography-Studio calls the shared reusable workflow, pinned by commit, with the PWA check on. Source: REPOS.md:301
- The hub's repository file says the hub's branch sweep is dispatched by the hub itself and that the siblings each owe a caller. Source: REPOS.md:462
- The harness's cloud page says the environment dialog's network access takes one of three levels, and that GitHub is reached through a separate proxy whichever level is picked. Source: docs:cloud-environments, Network access
- The environment's network is limited, with package registries and the hosts of connected servers allowed and one allowed host pattern, `*.pages.dev`, and the setup script is three lines. Source: the words read by the managing session on 19 November 2026
- `docs.github.com` is refused by the proxy, and GitHub's documentation pages are read from their source at `raw.githubusercontent.com`. Source: the words read by the managing session on 19 November 2026

## What was there before the rebuild

- Before the rebuild the connector's branch listing reported six branches for the hub on 2 November 2026, and every one reported protected as false. Source: 4ea3157:CONFIG.md:168
- The six were main, a branch under `claude/` from a sibling's work, and four Dependabot branches. Source: 4ea3157:CONFIG.md:170
- That page says that because main is unprotected, the barriers to a push to main were the push guard, the plan gates and the hub's pre-commit hook, and GitHub enforced none. Source: 4ea3157:CONFIG.md:174
- That page says whether a session or a person could set branch protection from a tablet was not read. Source: 4ea3157:CONFIG.md:174
- The branch guard before the rebuild said `work=main` for the hub, with a pre-commit hook generated from it. Source: 4ea3157:CONFIG.md:52
- That page carries the triggers of the seven workflow files as read from an earlier step and not re-read. Source: 4ea3157:CONFIG.md:137
- The page of settings at the commit before the rebuild has the same four lines on protecting main, required checks on a work branch, a check that already ran, and a repository with one branch, at the same line numbers as today. Source: 4ea3157:SECURITY.md:99
- The record's section 11 listed, as a setting to be made in the cloud environment, narrowing or turning off the environment's own git stop hook, and said where that hook lives was not found. Source: archive/plans/redesign-record.md:440
- The record's section 12 listed, as not reached, every sibling repository's workflows and settings, and whether any sibling pins the reusable workflow. Source: archive/plans/redesign-record.md:447
- The record's section 12 listed, as not reached, whether the settings of the environment can be changed and where. Source: archive/plans/redesign-record.md:455
- The design page says that from 12 November 2026 the check before a push always acts on staging and main, in every repository. Source: plans/native-setup.md:51

## What the documentation says

- The harness's GitHub proxy rejects branch deletions and pushes of anything other than a branch, such as a tag. Source: docs:cloud-environments, GitHub proxy
- The same proxy does not limit which branches a push can update, and the page says to use branch protection rules or rulesets on GitHub for that. Source: docs:cloud-environments, GitHub proxy
- The proxy serves GitHub API requests for the repositories attached to the session, and a request for another repository gets a 403 whose message starts with `GitHub access to`. Source: docs:cloud-environments, GitHub proxy
- The proxy rejects requests to GitHub's GraphQL endpoint with a 403, and the `gh` subcommands that use GraphQL, such as those for pull requests and issues, get the same 403. Source: docs:cloud-environments, GitHub proxy
- Committed files from public repositories arrive through `raw.githubusercontent.com`, which the security proxy handles and which is on the default allowlist. Source: docs:cloud-environments, GitHub proxy
- In an Anthropic-hosted environment the GitHub credentials stay on Anthropic's servers and never enter the session's VM, and the proxy attaches them. Source: docs:claude-code-on-the-web, GitHub authentication options
- The agent proxy never attaches a network secret to a request to GitHub, because the GitHub proxy authenticates those requests instead. Source: docs:cloud-environments, Requests that never get the credential
- Anyone who uses an environment can read its variables and setup script. Source: docs:cloud-environments, Environment variables
- The network page of the harness is about proxy servers, custom certificate authorities and mutual TLS for Claude Code itself, and lists `github.com` as used for cloning plugin marketplaces. Source: docs:network-config, Required URLs
- The page on Claude Code's GitHub Actions has headings for setup, automation modes, best practices, cost and troubleshooting, and none of them is on branch rules or rulesets. Source: docs:github-actions, headings of the page
- GitHub's documentation says rulesets and branch protection rules can both protect branches, work alongside each other, and have all applicable rules enforced. Source: github-docs:about-rulesets.md, About rulesets and protected branches
- It says multiple rulesets can apply to the same branch at the same time, while only one branch protection rule applies. Source: github-docs:about-rulesets.md, About rulesets and protected branches
- It says that when a ruleset is created, certain users, teams or apps can be allowed to bypass it. Source: github-docs:available-rules-for-rulesets.md, introduction
- It says that with the rule that restricts updates, only users with bypass permissions can push to branches or tags whose name matches the pattern. Source: github-docs:available-rules-for-rulesets.md, Restrict updates
- It says that when a required status check rule is added, an app can be chosen as the expected source of status updates, and that the app must be installed with the `statuses:write` permission and must have recently submitted a check run. Source: github-docs:available-rules-for-rulesets.md, Require status checks to pass before merging
- It says that if a status is set by any other person or integration than the chosen source, merging is not allowed, and that choosing any source leaves each status's author to be verified by hand. Source: github-docs:available-rules-for-rulesets.md, Require status checks to pass before merging
- It says a rule can require that changes are successfully deployed to named environments before a branch can be merged, and gives a staging environment as its example. Source: github-docs:available-rules-for-rulesets.md, Require deployments to succeed before merging
- It says job names should be unique across all workflows where branch protection requires specific status checks, because the same job name in several workflows can make results ambiguous. Source: github-docs:about-protected-branches.md, status checks tip
- It says an environment's required reviewers can list up to six users or teams, and that only one of them needs to approve the job for it to proceed. Source: github-docs:deployments-and-environments.md, Required reviewers
- It says that on the free, Pro and Team plans required reviewers are available only for public repositories, and the hub's repository is reported as public. Source: github-docs:deployments-and-environments.md, Required reviewers
- It says self-reviews can be prevented, so the user who started a deployment cannot approve it. Source: github-docs:deployments-and-environments.md, Required reviewers
- It says deployment branches and tags can be set to no restriction, to protected branches only, or to selected name patterns, and that if no branch protection rules exist then all branches can deploy under the protected-only option. Source: github-docs:deployments-and-environments.md, Deployment branches and tags
- It says that by default administrators can bypass an environment's protection rules and force deployments, and that an environment can be set to disallow that. Source: github-docs:deployments-and-environments.md, Allow administrators to bypass configured protection rules
- It says each job in a workflow can reference one environment, that the environment's protection rules must pass before the job is sent to a runner, and that the job reaches the environment's secrets only after that. Source: github-docs:deployment-environments.md, introduction
- It says environment secrets are available only to jobs that use the environment, and only after the configured rules pass. Source: github-docs:manage-environments.md, the step on environment secrets
- It says that when a branch protection rule is created, the branch it names does not have to exist yet, and that a rule can cover all current and future branches with the wildcard `*`. Source: github-docs:managing-a-branch-protection-rule.md, Creating a branch protection rule
- It says that when several branch protection rules affect one branch, a rule naming the branch has the highest priority, and among rules naming the same branch the one created first has higher priority. Source: github-docs:managing-a-branch-protection-rule.md, About branch protection rules
- It says only a single branch protection rule can apply at a time, and points to rulesets as the alternative. Source: github-docs:managing-a-branch-protection-rule.md, About branch protection rules
- It says people with admin permissions, or a custom role with the permission to edit repository rules, can manage branch protection rules. Source: github-docs:managing-a-branch-protection-rule.md, front matter, permissions
- It says a branch protection rule can allow specified actors to bypass required pull requests, and that actors may be added to bypass lists only when the repository belongs to an organization. Source: github-docs:managing-a-branch-protection-rule.md, Creating a branch protection rule
- It says a branch protection rule can require status checks chosen from a search field, and can require that the branch is up to date before merging. Source: github-docs:managing-a-branch-protection-rule.md, Creating a branch protection rule
- It says a branch protection rule can require that changes are successfully deployed to chosen environments before merging. Source: github-docs:managing-a-branch-protection-rule.md, Creating a branch protection rule
- It says a branch protection rule has a setting that does not allow bypassing its other settings, and separate settings under the heading of rules applied to everyone including administrators for force pushes and deletions. Source: github-docs:managing-a-branch-protection-rule.md, Creating a branch protection rule
- It says that when a ruleset is created, certain users can be allowed to bypass its rules, and that bypass permissions have their own step for a branch or tag ruleset. Source: github-docs:creating-rulesets-for-a-repository.md, Introduction
- It says a ruleset has an enforcement status, whose text the page takes from a shared reusable and does not give. Source: github-docs:creating-rulesets-for-a-repository.md, Using ruleset enforcement statuses
- It says a ruleset can target selected branches and tags, using `fnmatch` syntax for the names. Source: github-docs:creating-rulesets-for-a-repository.md, Using fnmatch syntax
- It says a push ruleset can be created for private or internal repositories, and that its bypass permissions are inherited by the entire fork network. Source: github-docs:creating-rulesets-for-a-repository.md, Creating a push ruleset
- It says an approver of a waiting deployment job chooses the job's environments, may leave a comment, and approves with Approve and deploy or rejects, and that a rejected job makes the workflow fail. Source: github-docs:review-deployments.md, Approving or rejecting a job
- It says that once a job is approved, and any other deployment protection rules have passed, the job proceeds and can reach the secrets stored in the environment. Source: github-docs:review-deployments.md, Approving or rejecting a job
- It says that where an environment prevents self-approval, a deployment from a workflow run the person started cannot be approved by that person. Source: github-docs:review-deployments.md, Approving or rejecting a job
- It says deployment protection rules can be bypassed to force all pending jobs for the environment to proceed, only while a job naming the environment is Pending, and not where the environment is set to prevent admins from bypassing. Source: github-docs:review-deployments.md, Bypassing deployment protection rules

## What is not known

- The settings of the hub's environments are not known, because the proxy refused the answer for them. Source: github-api:api-environments.json
- The hub's actions permissions, including the workflow permission default and whether workflows may approve pull requests, are not known, because the proxy refused the answer. Source: github-api:api-actions-permissions.json
- Whether any push protection, secret scanning or code scanning setting is on for the hub is not known; no saved answer covers them. Source: this step's reading of the files under the saved GitHub folder
- Whether the hub's deploy workflow refers to an environment is not known from the interface, since no environment answer was saved; the workflow file was read only at its head. Source: .github/workflows/deploy.yml:11
- The apps' repositories are not read from this session, so their branches, rulesets, rules and workflows are not known. Source: this step's reading
- Whether any sibling repository has main protected is not known beyond the one line in the hub's repository file about Jefferson-Photography-Studio. Source: REPOS.md:302
- Whether the sibling repositories pin the reusable workflow to a commit the hub's main reaches is not known from the hub, apart from the lines the hub's file gives for Quietkeep. Source: REPOS.md:332
- `docs.github.com` pages could not be read, so GitHub's documentation was read from its source files, whose text keeps template markers for plan and product conditions. Source: github-docs:available-rules-for-rulesets.md, Require deployments to succeed before merging
- Two saved pages of GitHub's documentation, on the secure use of Actions and on the token a workflow is given, answer no question of this file and were not read. Source: this step's reading of the questions
- The plan of the account that holds the hub's repository is not known, and so which plan notes on environments apply is not known. Source: github-api:api-repository.json

## Found

- The page of 19 November says the interface answers that a sign-in is needed for the hub's environments and actions permissions, and the saved answers say that access to those paths is not permitted through the proxy. Source: github-api:api-environments.json
- The page of 19 November says GitHub lists two branches of the hub, main and one under `claude/`, and the saved answer lists those two. Source: github-api:api-branches.json
- The hub's repository file says the hub has the branch main only, and the interface lists a second branch under `claude/` with the same branch name that CONFIG.md at the commit before the rebuild listed. Source: REPOS.md:32
- The record's section 11 says branch protection is to be set on the hub's main before any gate is removed, and the interface reports main with protected false and no rulesets. Source: archive/plans/redesign-record.md:439
- The page of settings says to protect the hub's main with no force pushes, and the interface reports no ruleset and no rule on main. Source: SECURITY.md:149
- The hub's repository file says eight repositories call the reusable workflow, and its list of seven by name followed by Quietkeep is eight, while another entry of the same file says Jefferson-Photography-Studio calls it too, which makes nine. Source: REPOS.md:328
- CONFIG.md at the commit before the rebuild reports six branches for the hub, and the interface lists two now, with the four Dependabot branches absent. Source: 4ea3157:CONFIG.md:168
- The doctrine gates workflow's head comment says the hub is a main-only repository, and the interface lists a branch under `claude/` for the hub. Source: .github/workflows/doctrine.yml:26
