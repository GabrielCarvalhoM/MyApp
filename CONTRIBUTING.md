# Repository and delivery workflow

Use a small GitHub Flow: one focused branch, a reviewable PR, current evidence, then merge and delete the branch. Product authority remains in [AGENTS.md](AGENTS.md), [CURRENT_MISSION.md](CURRENT_MISSION.md) and the [Canon](canon/CANONICAL_INDEX.md). This workflow grants no product, sporting-policy or deployment authorization.

Future implementation also follows the [Engineering Constitution / Definition of Done](docs/engineering/README.md), with [runtime boundaries](docs/engineering/decisions/0001-runtime-boundaries.md), [coding/lint/tests/performance](docs/engineering/QUALITY.md), [security](docs/engineering/SECURITY.md) and [privacy inventory](docs/engineering/PRIVACY.md). These extend this delivery workflow without changing the current mission or authorizing product implementation.

## Baseline and branches

`main` is conceptually sacred: integrated, reviewed work only; no direct feature work, force pushes or casual history rewrites. **As of this foundation, the remote has no `main`; its default is `r7/decision-authority-closure-base`.** Creating/promoting `main` is a separate Founder decision. Do not rename, merge into or repurpose the current default, closure or review branches to adopt this workflow.

Normally branch from freshly fetched, updated `main`. Until `main` exists, or for a bounded mission, use an explicitly named and fetched baseline and record its full commit SHA in the PR. Never assume the newest branch is an approved integration baseline.

```sh
git fetch origin
git switch -c feature/short-description origin/main
# Mission alternative: git switch -c chore/short-description <explicit-baseline-sha>
```

Use short-lived `feature/`, `fix/`, `refactor/`, `chore/` and `review/` branches. `review/` holds independent review artifacts and is not an implementation branch. Existing `claude/` and `r7/` branches retain their mission scope. Use a separate checkout if another session owns the current one; preserve its dirty files. Avoid unrelated changes and branch rebases during a frozen review.

This foundation starts at handoff `4917489364bb1138f8d82b46c20dd65d1bf693c7` on `chore/repository-delivery-foundation`, preserving the R7-A candidate at freeze commit `7d2da3603e224124696a2290766ec448080f3264`. It does not integrate the independent preflight/review branches.

## Commits, PRs and review

Use Conventional Commits: `type(optional-scope): short imperative summary`, for example `chore(ci): verify the frozen coaching candidate`, `fix(coaching): ...` or `docs: ...`. Types include `feat`, `fix`, `refactor`, `chore`, `docs`, `test` and `ci`. CI does not enforce message format.

1. Push only the focused branch and open a PR to the intended integration branch or explicit mission target. Fill in the template, including scope, evidence, risk and rollback. Check that the diff contains no unrelated mission commits; when baselines differ, agree the integration route before merging.
2. Inspect the complete diff and CI. A solo Founder may review low-risk documentation/infrastructure directly. Behavioral changes require the competent independent reviews defined by the active mission; an author's self-check cannot substitute for those gates.
3. Resolve findings and rerun checks invalidated by the changes. Merge only after the required evidence is current and authorization exists. Prefer a squash merge with a Conventional Commit title for ordinary work; preserve mission/review history when its contract requires it.
4. After a verified merge, update the local integration branch and delete ordinary short-lived remote/local branches. Preserve frozen candidate/review branches until their mission explicitly permits cleanup. Roll back through a reviewed revert PR; do not reset shared history.

No `CODEOWNERS` is added: assigning every path to the sole Founder adds no independent review and can obstruct self-authored PRs if required-owner review is enabled. Add path owners when distinct responsible collaborators exist. Coaching review obligations already come from the mission and local reviewer routing.

## CI and local validation

[Repository CI](.github/workflows/ci.yml) runs on branch pushes and PRs, with read-only repository permission, no deployment/secrets, and pinned official checkout/setup-node actions. PRs test the merge result; selection compares the merge base to the PR head, avoiding unrelated changes on the target branch. Pushes compare before/after histories; a new branch conservatively selects from its full tree. A push and an open PR can each produce a run; superseded runs in each context are cancelled.

| Check | Automatic behavior |
| --- | --- |
| `Workflow checks` | Always: actionlint syntax validation; CI-adapter tests; redacted Gitleaks checkout and reachable HEAD history scans; path selection; existing read-only R7ARA verifier/record protection; all 459 CoachingCore files compared with fixed commit `7d2da36` using unfiltered raw blob hashes and tree identity. Checks worktree cleanliness. |
| `Coaching Core` | On relevant changes: Node **24** (the documented reference major, satisfying `engines.node >=24`), cached npm downloads keyed by `CoachingCore/package-lock.json`, locked install without lifecycle scripts, then `npm test`. Checks worktree cleanliness. |
| `Lint and dependency security` | On live JS/tooling/dependency/workflow changes: locked root install without lifecycle scripts, ESLint with zero warnings, npm audit of root and frozen Core lockfiles (high/critical block), then cleanliness. Historical evidence JS alone does not trigger this job. |
| `CI` | Always evaluates preceding job results. Fails if workflow checks fail or either selected Core/quality job fails/cancels. Accepts jobs skipped by the selector. This is the recommended future required status check. |

The suite runs for any `CoachingCore/` change (including runtime, policy, fixtures, tests, lockfile and freeze), `canon/`, `product/`, sports-review authorities, coaching/domain-closure/science audits, mission/agent entry points, CI scripts/workflows, and dependency/byte-handling configuration listed in [the selector](scripts/ci/coaching.mjs). Renames are evaluated as removal plus addition. New unrelated `docs/`, root workflow documentation, PR-template and app/UI-only changes skip the full suite. Policy/authority documents are deliberately relevant. Add new external Core inputs to the selector when introducing them.

Freeze verification always runs, even for unrelated changes: the existing verifier binds 86 runtime/test/policy/package files, evidence and closed historical files. The additional fixed-commit guard checks the complete CoachingCore tree and raw checkout bytes, including historical outputs and tests, against `7d2da3603e224124696a2290766ec448080f3264`; it rejects extra non-ignored files too. Editing a historically bound document may therefore fail integrity without running the full suite. This foundation is deliberately bound to R7ARA: a future authorized successor must preserve old records and review both guards rather than bypass them. It is not a generic documentation lint.

From the repository root, on Node 24:

```sh
node --check scripts/ci/coaching.mjs
node --check scripts/ci/coaching.test.mjs
node --test scripts/ci/coaching.test.mjs
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm test
npm run check:freeze
node scripts/ci/coaching.mjs changes <base-sha> HEAD
node scripts/ci/coaching.mjs freeze <base-sha>
npm --prefix CoachingCore ci --ignore-scripts --no-audit --no-fund
npm --prefix CoachingCore test
git diff --check
git status --short
```

The complete [local quality commands and pinned scanner installation details](docs/engineering/QUALITY.md#exact-local-commands) also include `npm run check:secrets`, the Gitleaks history scan, `npm run audit:dependencies` and `actionlint .github/workflows/ci.yml`. Workflow validation now runs automatically. Swift/Kotlin lint tools enter with their first real target; no automatic reformat touches frozen source. Existing mission-specific probes remain required where their mission says so; this foundation does not rerun all historical probe kits or create a replacement governance system. Official references: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [skipped workflows and required checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks).

## Coaching Core freeze and gates

The active candidate is **R7A-RESIDUAL-AUTHORITY-FREEZE-1**. CI calls the existing `CoachingCore/scripts/verify-r7ara.mjs` without `--write`; it never calls a freeze generator. The delivery guard also rejects editing/deleting the existing record or verifier relative to the event base. The current freeze's bytes must stay unchanged. A future authorized successor must retain prior records, record new mission/evidence, and explicitly update this delivery adapter to the applicable verifier. Updating CI itself is a review obligation, not a loophole to self-authorize runtime changes.

The current verifier describes the pre-recheck handoff (including `reviews-not-dispatched`). If later authorized review integration changes that state, its owner must select the appropriate successor verification deliberately; do not weaken frozen scripts to make CI green. CI does not decide whether mission evidence is scientifically sufficient or a successor is authorized.

For runtime/policy/test/freeze or authority changes, apply the PR's conditional Coaching checklist and current Engineering/Quality/SSCTR gates on exact bytes. Preserve closed history and frozen tests. Passing CI grants neither `R7A_EXIT_READINESS`, R7-B0, TestFlight clearance, Product Truth promotion nor real-athlete activation. The Growth patch stays unapplied; KMP, HealthKit, Figma, backend and product-feature work remain separate missions.

## Environments and releases

| Stage | Minimal discipline |
| --- | --- |
| DEV | Local/synthetic work on a focused branch; no production secrets or athlete data. |
| STAGING | Future integrated build with isolated configuration/test data and a known commit. No staging service is created here. |
| TESTFLIGHT | Future signed iOS distribution only after explicit release authorization and the applicable product, clinical/privacy/domain and pre-TestFlight gates (including the recorded R1 gate). Record commit, build number, evidence and recovery version. |
| PRODUCTION | Explicit Founder release decision after applicable gates; identify the released commit/build and previous known-good build. No automatic promotion from CI or TestFlight. |

Keep credentials/configuration separate by environment when those environments exist; never commit secrets. Before any release, know the recovery build and owner; use a revert/fix and controlled re-release rather than rewriting history. This foundation adds no builds, signing, environment resources, deployment or release automation.

## Optional GitHub settings — manual, not configured here

After an authorized adoption into an integration branch, check Settings → Actions to allow the official actions and read-only workflow permissions; do not enable write tokens just for this CI. PR templates become available normally after adoption into the default branch.

When `main` is explicitly established and the account/repository supports the settings, recommend a ruleset or branch protection requiring PRs and the **`CI`** status check, resolved review conversations, no force pushes/deletion, and up-to-date checks before merge. Avoid path-filtering the entire required workflow: job-level skipping keeps a final status available. Do not require a human approval count/CODEOWNER approval that a sole Founder cannot satisfy; independently required domain reviews still apply as mission evidence. Revisit one approval and scoped owners when another collaborator joins.

Merge strategy and automatic deletion of ordinary merged branches can be set later, taking care to retain sacred mission/review branches. No plan upgrade, protection rule, default-branch change or GitHub setting is assumed or enabled. Without server-side protection, these checks report failures but cannot prevent an authorized user from pushing/merging anyway. Branch discipline, PR text, independent review, successor authorization and release gates remain documented responsibilities.
