# Maintaining esp-labs-web

What runs on every pull request, what protects `main`, and the repository settings that the files in `.github/` rely on.

## What runs where

| Workflow                                                     | When                              | What it does                                                                                       |
| ------------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| [CI](../.github/workflows/ci.yml)                            | every PR, push to `main`, merge queue | `pnpm typecheck`, `pnpm lint`, `pnpm test` (a stale translator catalogue fails), `pnpm chip:refs` (every chip citation names a section of the committed reference), `pnpm build` with the esp-labs firmware, actionlint on the workflows |
| [Deploy](../.github/workflows/deploy.yml)                    | by hand (Run workflow, `gh workflow run Deploy`) | once CI passed on `main`'s latest commit, builds it with the esp-labs firmware and the reference (`vercel build --prod`), deploys it to Vercel production, tags it `vX.Y.Z` with a GitHub release and its notes, and removes previews older than 30 days. Never runs a PR's code |
| [CodeQL](../.github/workflows/codeql.yml)                    | every PR, push to `main`, weekly  | security analysis of the TypeScript and of the workflows                                          |
| [Dependency review](../.github/workflows/dependency-review.yml) | PRs that touch dependencies or `.github/` | fails when a PR adds a dependency with a known moderate-or-worse vulnerability          |
| [PR title](../.github/workflows/pr-title.yml)                | PR opened or edited               | the title (the squash commit) follows Conventional Commits, lower-case subject                    |
| [PR limit](../.github/workflows/pr-limit.yml)                | PR opened or reopened             | closes a PR, with a kind comment, when its author already has 3 open. Owner, collaborators and bots are exempt. Change `MAX_OPEN_PRS` to adjust |
| [Stale](../.github/workflows/stale.yml)                      | daily                             | PRs idle 30 days and issues idle 90 days get `stale`, then close 14 days later. `pinned`, `security`, `good first issue`, `help wanted` and drafts are exempt |
| [Dependabot](../.github/dependabot.yml)                      | weekly                            | grouped npm and Actions updates, each release at least 14 days old; TypeScript stays on 6         |

Every third-party action is pinned to a full commit SHA (Dependabot keeps the pins fresh), every workflow starts with a read-only token, and the two `pull_request_target` workflows never check out the PR's code. Keep both rules when you add a workflow.

## Protecting `main`

[`.github/rulesets/main.json`](../.github/rulesets/main.json) is the branch ruleset: no deletion or force push, linear history, changes only through a pull request with an approving code-owner review (re-requested after new pushes), resolved conversations, and the CI, workflow-lint and PR-title checks green. Repository admins can bypass it, so you can still push a hotfix.

Apply it once, and again after you edit the file (replace `<id>` with the id the first command printed):

```sh
gh api -X POST repos/agharsallah/esp-labs-web/rulesets --input .github/rulesets/main.json --jq .id
gh api -X PUT repos/agharsallah/esp-labs-web/rulesets/<id> --input .github/rulesets/main.json
```

## Repository settings

These live on GitHub, not in the repo. Apply them once with `gh`:

```sh
R=repos/agharsallah/esp-labs-web

# Fork PRs from anyone outside the repo wait for your approval before any workflow runs.
gh api -X PUT $R/actions/permissions/fork-pr-contributor-approval -f approval_policy=all_external_contributors
# Workflows get a read-only token by default and can't approve pull requests.
gh api -X PUT $R/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false

# Private vulnerability reports (SECURITY.md), Dependabot alerts and security fixes.
gh api -X PUT $R/private-vulnerability-reporting
gh api -X PUT $R/vulnerability-alerts
gh api -X PUT $R/automated-security-fixes
# Secret scanning and push protection.
gh api -X PATCH $R --input - <<'JSON'
{ "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" } },
  "delete_branch_on_merge": true,
  "allow_merge_commit": false,
  "allow_squash_merge": true,
  "allow_rebase_merge": true,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY" }
JSON
```

## Production deploys

[Deploy](../.github/workflows/deploy.yml) puts `main` on Vercel production when you run it (merging does not deploy), and refuses a commit whose CI has not passed. After a successful deploy:

- **Release.** `tools/deploy/` picks the next version from the Conventional Commits since the last `v*` tag (breaking: major, or minor below 1.0.0; `feat`: minor; anything else: patch; the first release is `package.json`'s version), tags the deployed commit and publishes a GitHub release marked latest. The notes group the changes (breaking first, then features, fixes, performance, docs, maintenance) with their PRs, and link the live URL, the commit, the run and the comparison with the previous tag. Redeploying a commit that is already tagged makes no new release. Tags are the version; `package.json`'s stays the starting point.
- **Metadata.** The Vercel deployment carries the commit, branch, message and release tag (`--meta`), so the dashboard shows what each deployment is; GitHub's `production` environment lists each deploy with its URL.
- **Cleanup.** Preview deployments (`pnpm deploy:preview`) older than 30 days are removed. Production deployments are kept: they are Vercel's instant rollbacks. A cleanup failure does not fail the deploy.

Undo a bad release by promoting the previous production deployment in Vercel (Instant Rollback), then fix forward; the next Deploy releases the fix.

It reads, once:

```sh
R=agharsallah/esp-labs-web
# The production environment, deployable from main only. It holds the token.
gh api -X PUT repos/$R/environments/production --input - <<'JSON'
{ "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true } }
JSON
gh api -X POST repos/$R/environments/production/deployment-branch-policies -f name=main -f type=branch
# The ids from .vercel/project.json (after `vercel link`); not secret.
gh variable set VERCEL_ORG_ID --repo $R --body "$(jq -r .orgId .vercel/project.json)"
gh variable set VERCEL_PROJECT_ID --repo $R --body "$(jq -r .projectId .vercel/project.json)"
# A token from https://vercel.com/account/tokens, scoped to the project's team. Pasted at the prompt.
gh secret set VERCEL_TOKEN --repo $R --env production
```

A secret set on the environment, rather than on the repository, is readable only by jobs that name that environment, so only Deploy sees the token. `pnpm deploy:prod` still works from your machine.

[`.github/rulesets/release-tags.json`](../.github/rulesets/release-tags.json) keeps released `v*` tags from being moved or deleted (admins can bypass). Apply it once, as for `main`:

```sh
gh api -X POST repos/agharsallah/esp-labs-web/rulesets --input .github/rulesets/release-tags.json --jq .id
```

## When it gets noisy

- **A wave of spam PRs or comments**: Settings → Moderation options → Interaction limits restricts issues, PRs and comments to prior contributors or collaborators for 24 hours up to 6 months:

  ```sh
  gh api -X PUT repos/agharsallah/esp-labs-web/interaction-limits -f limit=existing_users -f expiry=one_week
  ```

- **One account**: block it from your profile (Settings → Moderation → Blocked users), or report it to GitHub from the ⋯ menu on its comment.
- **A heated thread**: lock it (`gh issue lock <n> --reason too_heated`).
- **A PR that touches `.github/`**: read it line by line before approving the workflow run. A change there can alter what CI checks or what a workflow is allowed to do.
