# Maintaining esp-labs-web

What runs on every pull request, what protects `main`, and the repository settings that the files in `.github/` rely on.

## What runs where

| Workflow                                                     | When                              | What it does                                                                                       |
| ------------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| [CI](../.github/workflows/ci.yml)                            | every PR, push to `main`, merge queue | `pnpm typecheck`, `pnpm lint`, `pnpm test` (a stale translator catalogue fails), `pnpm build` with the esp-labs firmware, actionlint on the workflows |
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

## When it gets noisy

- **A wave of spam PRs or comments**: Settings → Moderation options → Interaction limits restricts issues, PRs and comments to prior contributors or collaborators for 24 hours up to 6 months:

  ```sh
  gh api -X PUT repos/agharsallah/esp-labs-web/interaction-limits -f limit=existing_users -f expiry=one_week
  ```

- **One account**: block it from your profile (Settings → Moderation → Blocked users), or report it to GitHub from the ⋯ menu on its comment.
- **A heated thread**: lock it (`gh issue lock <n> --reason too_heated`).
- **A PR that touches `.github/`**: read it line by line before approving the workflow run. A change there can alter what CI checks or what a workflow is allowed to do.
