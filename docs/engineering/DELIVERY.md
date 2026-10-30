# Engineering foundation delivery record

Task: Engineering Architecture, Quality & Security Foundation · 2026-10-30.

Authority: direct Founder request in this Codex session, authorizing only foundation/docs/tooling/CI, commit and push, followed by stop. No PR, merge, Growth patch, R7-B0, sporting/runtime changes, KMP/backend/HealthKit/product implementation or Figma work. This record is project/session evidence, not a replacement for the active mission/Canon.

## Baseline, routing and isolation

- Repository: `GabrielCarvalhoM/MyApp`, verified public; default branch remains `r7/decision-authority-closure-base`.
- Explicit baseline: prior repository-delivery foundation `1a6d88988b452faad2e2fb60fd7f2fefd250ceac`. This branch depends on that unmerged foundation; it does not cherry-pick review work or adopt the remote default as an approved integration baseline.
- Frozen authority: `R7A-RESIDUAL-AUTHORITY-FREEZE-1`, commit `7d2da3603e224124696a2290766ec448080f3264`.
- Branch/lease: `chore/engineering-quality-security-foundation`; author `/root`; separate checkout `C:/Users/carva/Documents/ChatGPT/fit/work/MyApp-engineering-foundation`.
- Managed-worktree creation rejected the nested source path as outside its accepted workspace-root input. Native Git worktree creation provided the requested isolation. Existing candidate/review/delivery worktrees were not switched, reset or edited.
- Routing: **T2 / R2 / L2**, implementation of bounded repository controls + target architecture documentation, with independent Engineering/quality and Security/privacy reviews after deterministic checks. Impact medium (future boundaries and executable CI), reversibility low risk (additive/revertible infrastructure), uncertainty bounded by repository inspection/official references, dependencies bounded to prior workflow. No live product trust boundary, user data model or sporting behavior is modified. Current instance coordinates; no separate Chief, Product/UX, UI, Research or SSCTR invocation is necessary for this infrastructure-only scope. Security reviews the normative security/privacy baseline and scanner exceptions; it does not certify a nonexistent production system.
- STOP_WHEN: documented requirements covered, relevant local checks/reviews current, only authorized files committed/pushed, remote branch identity verified; no PR/merge. ESCALATE_IF: frozen drift, real credential, material unresolved control gap or action outside authorization. No project state is stored in global agent files.

## Files and consequential decisions

Added:

- `docs/engineering/README.md`: concise constitution, hard gates vs guidelines, DoD.
- `docs/engineering/decisions/0001-runtime-boundaries.md`: one ADR covering feature-based iOS Clean/MVVM-C, inward dependencies/manual composition, pure future KMP vs frozen Node Oracle, canonical/conformance contracts and server-authoritative modular backend.
- `docs/engineering/QUALITY.md`: coding/concurrency/state/error/dependency rules; lint/suppression policy; testing matrix; performance TBD register and measurement/regression methods; exact commands.
- `docs/engineering/SECURITY.md`: MASVS/ASVS family mapping, threat table, token/entitlement/storage/transport/abuse/admin controls, telemetry allowlist, incident/backup/restore/supply-chain policy.
- `docs/engineering/PRIVACY.md`: sensitive-data handling, inventory template, purpose/basis/retention placeholders, permissions/revocation/correction/export/deletion/restore flows and legal/DPO review prerequisites.
- `docs/engineering/DELIVERY.md`: this scope/evidence/handoff record.
- `package.json`, `package-lock.json`, `eslint.config.mjs`: isolated locked Node tooling and zero-warning ESLint gate.
- `.gitleaks.toml`: default detectors plus narrow verified synthetic-history false-positive exceptions; no blanket baseline/folder skip.
- `.github/dependabot.yml`: monthly root tooling/action checks; frozen Core intentionally excluded from automatic edits.
- `scripts/ci/frozen-tree.mjs`, `scripts/ci/frozen-tree.test.mjs`: fixed freeze/tree/raw-byte/index guard and adversarial tests.
- `scripts/ci/secrets.mjs`, `scripts/ci/scanner.test.mjs`: working checkout scan independent of installed dependencies; tests proving exceptions do not hide other credentials.

Changed:

- `.github/workflows/ci.yml`: extend the existing workflow, checksummed scanner installation, workflow lint, both freeze guards and secret scans always; conditional ESLint/audits; aggregate `CI` includes quality.
- `scripts/ci/coaching.mjs`, `scripts/ci/coaching.test.mjs`: extend/test the existing path selector with quality output, retaining coaching selection.
- `CONTRIBUTING.md`: link engineering guidance and update the existing delivery/local-check description.
- `.github/pull_request_template.md`: conditional security/privacy review flags and engineering evidence; no invented automated approval.

No separate ADR for each tool/style choice, module skeletons, Swift/Kotlin tools, formatter, deployment workflow, CODEOWNERS or binary artifacts. No code under `CoachingCore/`, `canon/`, `product/`, `audits/`, review branches or mission files is edited.

## Current local evidence

Environment: Windows/PowerShell, Node `v24.19.0`, npm `11.17.0`; Gitleaks `8.30.1`, actionlint `1.7.12` from official release archives verified against the recorded SHA-256 hashes. CI uses Ubuntu and Node 24. Commands/install details are in [QUALITY](QUALITY.md#exact-local-commands).

| Check | Observed result |
| --- | --- |
| Locked root `npm ci --ignore-scripts --no-audit --no-fund` | Pass; no lifecycle scripts |
| `npm run lint` | Pass, zero warnings |
| `npm test` | 7/7 CI/guard/scanner tests pass, including staged/committed/checkout drift and scanner negative controls |
| `actionlint .github/workflows/ci.yml` | Pass; workflow/YAML/expressions parse |
| Locked Core install + `npm --prefix CoachingCore test` | Original 673/673 pass, no test edits |
| `npm run check:freeze` | All 459 tracked CoachingCore files: committed tree and unfiltered raw checkout blob identity match `7d2da36`; index clean; no extra non-ignored source |
| `node scripts/ci/coaching.mjs freeze 1a6d88988b452faad2e2fb60fd7f2fefd250ceac` | Original read-only R7ARA verification 12/12 |
| `npm run audit:dependencies` | Both root and Core lockfile audits: 0 vulnerabilities at execution time |
| `npm run check:secrets` | Redacted scan of complete tracked/non-ignored new checkout, including historical evidence: no detected secrets after reviewed false-positive scoping |
| `gitleaks git --redact --no-banner --ignore-gitleaks-allow .` | Reachable HEAD history: no detected secrets after reviewed false-positive scoping |
| `git diff --check` | Pass |

The full-file guard originally encountered a >64 MB historical output when buffering `git show`; it now uses raw unfiltered Git blob identity, avoiding file-content output and buffering. Default secret detection initially flagged synthetic checksums/scenario names; source inspection established their provenance, scoped exceptions preserve detectors and adversarial probes remain active. These are tooling adaptations, not changes to the frozen source.

## Automated vs documented; deferred work

Automated now: JavaScript syntax/correctness lint, workflow syntax, path selection, CI/scanner regressions, secret detection, locked dependency audits and freeze integrity. Core tests remain conditional on the existing relevant authority paths. Docs-only/UI-only changes retain cheap workflow/security/freeze checks but skip the Node suite/quality install when paths do not apply; implemented UI targets must gain their own gates.

Documented/future: architecture/import enforcement once real modules exist; SwiftLint/ktlint and actual compile/tests with their first targets; runtime authz/token/entitlement/HealthKit/log-redaction/export/deletion controls; Node↔KMP conformance before port adoption; all performance numeric budgets, API quotas/timeouts and RPO/RTO from actual measurements; retention/lawful basis/processor/transfer/rights details by legal/DPO; named production incident/reporting/monitoring owners; license review and future distributable SBOM. No numerical production budget or compliance claim is fabricated. CodeQL is deferred until a useful scoped production target exists, although public-repository use is available.

Manual GitHub adoption recommendations: retain read-only Actions permissions; verify secret scanning/push protection and Dependabot alerts; on the later authorized integration branch require the always-present `CI` status, PRs, resolved conversations and no force push/deletion where supported. Do not impose impossible solo CODEOWNER/approval requirements. Dependabot config takes effect after default-branch adoption. No GitHub setting, default branch or protection rule is changed here. See [CONTRIBUTING](../../CONTRIBUTING.md#optional-github-settings--manual-not-configured-here).

## Independent reviews and handoff

Both fresh read-only judges approved the staged 20-file foundation over `1a6d889` with no material findings:

- Security/Privacy: **APPROVE / SECURITY_READY for the foundation scope**; inspected threat/lifecycle/logging/server-authority guidance, CI posture and exception provenance, and independently reran the scanner regression (1/1). Reviewed security-scope diff SHA-256: `0b536c9e9650f56649a56290d21d31a44a4604d9bfe089602464ad7ac02621b8`.
- Engineering/CI: **APPROVE / ENGINEERING_ARCHITECTURE_READY for the foundation scope**; checked boundaries, conformance plan, test/performance/lint guidance, selector/aggregate behavior and protected paths; independently ran zero-warning ESLint, all 7 infrastructure tests, actionlint and staged whitespace validation.

Only review/delivery evidence metadata was added after those reviews. These judgments cover repository controls and future guidance, not implemented mobile/backend security, legal compliance, R7-A exit, merge or release. No R7-A Engineering/SSCTR review status is changed or inferred.

Final commit/push identity, working-tree state and actual GitHub run result belong to the session handoff after execution; no successful remote run is presumed here. The commit containing this record is discoverable with `git log -1 -- docs/engineering/DELIVERY.md`; recording its own SHA inside itself would be circular. Preserve this checkout for review; no merge, PR or cleanup of other branches is authorized by this delivery.
