# Coding, lint, tests and performance

## Code quality contract

Use names from domain vocabulary, explicit units (`durationSeconds` rather than `value`), one consistent language in code and descriptive business actions. Keep DTO/domain/persistence models distinct at I/O boundaries; avoid redundant mapping layers inside pure computations. Prefer immutable values, explicit inputs/outputs, cohesive responsibilities and composition. SOLID is a review aid: small consumer-owned interfaces, substitutable semantics, explicit dependencies and a clear reason for a type to change. Avoid inheritance trees, generic base repositories and services that own unrelated workflows.

Sizing is a **review heuristic**, not a lint gate: investigate functions around 40–60 meaningful lines or types/files around 300–400 lines. Split when responsibilities, state owners or test setups diverge; do not split cohesive code mechanically. A ViewModel should manage one presentation responsibility; a repository coordinates a bounded persistence contract; a service should have a specific named purpose. A large enum/fixture is not automatically bad code. Avoid `Manager`, `Helper`, `Utils` and generic `Service` buckets.

Add an abstraction/protocol for external I/O, independently substitutable behavior, an ownership boundary or a test seam that represents a real contract. One implementation is fine for a platform boundary. Do not create a protocol merely because a class exists; do not abstract two superficially similar domain behaviors with different invariants. Inject clocks, random sources and identifiers where nondeterminism affects decisions. Keep secrets/SDK objects out of interfaces consumed by Domain.

Concurrency has an owner and lifetime. Swift UI state is `@MainActor`; use structured tasks owned/cancelled by view/feature/session and actors for isolated mutable stores. Kotlin uses structured coroutine scopes and explicit dispatcher ownership; cancellation propagates, not swallowed as a domain failure. Node code bounds concurrency, request timeouts and retries, and propagates abort signals across I/O. Avoid detached work, unbounded task groups, blocking work on UI/event loops and captured session credentials after logout. Document transaction/cache consistency and the single writer for each mutable state. Derived UI state is computed rather than duplicated.

Errors have typed/stable categories such as invalid input, unauthorized, unavailable, conflict, stale evidence and cancelled. Keep diagnostic causes inside trusted boundaries with redaction; public errors never expose database internals, token values or raw health payloads. Distinguish retryable from permanent failure; never silently substitute success/default health facts. Views render loading/empty/content/stale/error states explicitly and avoid competing Boolean state combinations.

Dependencies require a demonstrated need, maintenance/security/license review, exact direct version + committed lock and an upgrade owner. Prefer standard/platform libraries; no new vendor SDK simply for DI/logging. Changes to runtime engines, lockfiles or CI tooling receive relevant tests, audit and supply-chain review. Install with lifecycle scripts disabled unless a narrowly reviewed build requirement proves otherwise.

## Lint and formatting now

Only JavaScript/Node exists as executable application/reference/tooling source today. Root tooling is isolated from the frozen `CoachingCore/package*.json`.

| Tool | Configuration / scope | Gate |
| --- | --- | --- |
| ESLint 10.14.0 + @eslint/js 10.0.1 + globals 17.13.0 | [`eslint.config.mjs`](../../eslint.config.mjs), locked in root package lock; live JS/MJS/CJS | Recommended correctness rules, strict equality, const/no var, unused suppression detection; zero warnings |
| actionlint 1.7.12 | Existing workflow; pinned release archive + SHA-256 in CI | YAML/workflow expressions and job dependency validation |
| Gitleaks 8.30.1 | Repository checkout + reachable HEAD commit history, redacted; pinned archive + SHA-256 in CI | Detected secrets fail; exception policy below |
| npm audit | Root tooling and existing Core lockfile, no lock mutation | High/critical block; all lower findings still triaged |

No formatter is added: it would mostly reformat frozen/historical code. Follow surrounding style; `git diff --check` rejects whitespace errors. [`ESLint recommended`](https://eslint.org/docs/latest/rules/no-unused-vars) supplies correctness checks without quote/semicolon/line-length bikeshedding.

The only lint exclusions are installed dependencies and the explicit frozen/evidence zones: `CoachingCore/`, `audits/`, `reviews/`, `governance/snapshots/`. They are not new-code destinations. The current live tooling has **no warning baseline**. Frozen source is protected by immutability/tests instead of opportunistically reformatted. A future authorized unfreeze/migration must inventory existing findings and remove exclusions by source group; new source cannot hide there. No `eslint . --fix` against the freeze.

Suppressions must be the smallest rule/line with a comment explaining invariant, owner and removal trigger/issue. No file-wide `eslint-disable`, growing global ignores or lowering error severity to make a PR green. Legacy onboarding may use a reviewed list of exact existing findings (file/rule/location/reason/owner/expiry); CI must reject new findings and fail stale suppressions. This exact-finding mechanism does **not** exist yet and is not permission to accumulate debt. Prefer fixing live code before introducing it.

Gitleaks exceptions must identify a verified synthetic false positive and narrow rule/value/path or exact finding fingerprint, with owner/reason/review. The current [config](../../.gitleaks.toml) retains every default detector and scopes exceptions to fixed historical files plus checksum fields/two exact scenario labels. Large-file chunk boundaries truncate some `doseKey` matches; each observed truncated form was checked against its full 64-hex source line. The scanner regression test verifies that another credential in the same file, the same hash field elsewhere, non-hex values and inline allow comments still fail. Never baseline a live credential or upload an unredacted report. Inline `gitleaks:allow` bypasses are disabled in the scanner command. History findings remain actionable even after a file is deleted. Real exposure requires revocation/rotation and incident handling, not just removal from Git.

## First implementation in another language

- Swift/iOS: add pinned **SwiftLint**, a minimal reviewed config and `swiftlint lint --strict`, plus actual target compilation/tests on macOS. Start with correctness/default rules, warnings promoted to failures; review sizing as a heuristic. Add SwiftFormat only if measured formatting friction warrants a second tool and a narrow adoption diff.
- Kotlin/KMP: add pinned **ktlint** in the real Gradle build, reviewed `.editorconfig`, `./gradlew ktlintCheck` plus compile/common tests. Add **detekt** for proven complexity/concurrency concerns when production source exists; avoid overlapping duplicate style rules. No blanket detekt baseline.
- TypeScript/backend: extend the existing stack to actual compiler/types/framework only when implemented. Introduce TypeScript-aware rules with the first TS source rather than silently excluding it.

These tools/configs/jobs are intentionally **not installed now**: no Swift/Kotlin target can validate them. The first source PR must also extend the path selector/aggregate CI for that target; docs-only and unrelated UI work must not trigger Core tests. UI source still needs its own build/lint/tests once implemented.

## Exact local commands

Install the pinned scanner binaries below and put them on PATH first (the scanner regression test uses Gitleaks). From the repository root on Node 24 (validated with 24.19.0):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm test
npm run check:freeze
node scripts/ci/coaching.mjs freeze 1a6d88988b452faad2e2fb60fd7f2fefd250ceac
node scripts/ci/coaching.mjs changes 1a6d88988b452faad2e2fb60fd7f2fefd250ceac HEAD
npm --prefix CoachingCore ci --ignore-scripts --no-audit --no-fund
npm --prefix CoachingCore test
npm run audit:dependencies
actionlint .github/workflows/ci.yml
npm run check:secrets
gitleaks git --redact --no-banner --ignore-gitleaks-allow .
git diff --check
git status --short
```

Install the exact scanner binaries from [Gitleaks v8.30.1](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) and [actionlint v1.7.12](https://github.com/rhysd/actionlint/releases/tag/v1.7.12), verify archive SHA-256 and add their directory to PATH. CI shows the Linux commands/checksums. Windows x64 archive hashes: Gitleaks `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`; actionlint `6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9`. Binaries are downloaded outside the repository, not committed. npm scripts work from PowerShell as well as CI. Audit requires the npm registry; no-network failure is not a passing audit.

## Testing strategy

| Layer | Primary evidence and meaningful cases |
| --- | --- |
| Domain / coaching | Unit-heavy invariant/decision/state-transition tests; missing/conflicting evidence, safety, authority, corrections and deterministic replay |
| Use cases | Business outcomes, permissions, error mapping, cancellation, transaction/idempotency/retry behavior; injected clock/IDs |
| Repository implementations | Common port contract + integration tests of real chosen persistence/HTTP adapters; cache freshness, mapping, failures and migrations |
| ViewModels / Coordinators | State transitions, one action/one effect, cancellation/logout, deep-link validation and route ownership; no SDK/network dependencies |
| Platform/backend boundaries | Synthetic provider payloads; permission unavailability/revocation, token expiry, cross-user denial, signed transaction replay/refund, rate limiting, export/deletion and restore lifecycle |
| Node↔KMP | Versioned synthetic golden inputs/semantic outputs on both runtimes, numeric contract, safety/authority equivalence and regressions; mandatory before adopting the port |
| UI/E2E | Few critical flows: authenticated entry, execution persistence, purchase state, permission disconnect, account export/deletion; not every pixel |

Never use real HealthKit exports, athlete data or credentials in fixtures. Version fixture schema/origin/expected semantics; do not overwrite golden output just because a test changed. Separate developer-generated cases from independent expected outcomes. Freeze clocks/time zones, seed randomness, avoid network/time sleeps in unit tests. Integration tests use isolated ephemeral data and explicit cleanup; prevent accidental production access. Mutation/property tests apply to safety/authority/idempotency/state invariants where they can expose real failures; no blanket coverage or mutation-score target. Existing 673 Core tests remain unchanged; this foundation adds only tests of new CI guard behavior.

## Performance and scalability budget register

No device build, backend, workload or representative dataset exists, so numeric targets are **TBD** rather than invented. Each first implementation/affected feature owner must capture a reproducible baseline, set a justified target with Product/Engineering and agree a regression threshold before dependent release. Budget record fields: metric, target, percentile/sample count, device/OS/build, dataset cardinality, network state, warm/cold state, measurement command/trace, owner and date. Current rows:

| Area | Target / owner / resolution trigger | Measurement method |
| --- | --- | --- |
| Cold launch to interactive UI | TBD · iOS · first signed release-like app build | Physical lower-tier supported device; XCTest launch metrics + Instruments App Launch; multiple clean launches |
| Home initial content / refresh | TBD · iOS + Product · first implemented entry surface | Signposts from route entry to useful content; cold/warm cache, offline/degraded network; p50/p95 |
| Plan generation / decision evaluation | TBD · Core Engineering · first authorized KMP port | Fixed representative synthetic histories on device and Oracle separately; p50/p95, allocations, cancellation latency; no Node=>iOS extrapolation |
| Database queries | TBD · Backend/Data · datastore selection | Query plan, rows scanned/returned, p95 latency, query count per action and worst accepted account size; detect N+1 |
| Networking | TBD · Backend + iOS · first API contract | p50/p95 endpoint/end-to-end latency, requests/action, bytes, retries, timeouts, payload/page limits and concurrency under expected load |
| Memory | TBD · iOS/Core · first realistic history | Instruments Allocations/Leaks, peak/resident memory and retained sessions after logout; repeated open/close and large history |
| Scrolling | TBD · iOS · first long list/chart | Instruments Animation Hitches, frame pacing on physical supported device, realistic history; isolate mapping/decoding off main thread |
| Battery/background HealthKit sync | TBD · Platform · first authorized adapter | Energy Log/MetricKit and physical-device runs; bounded batches, anchor delta, wakeups, bytes, duration, locked/offline behavior, retry/backoff and cancellation |
| Backend recovery/capacity | TBD · Operations · before live data | Expected concurrency/cardinality, load saturation/error rate; measured restore rehearsal establishes RPO/RTO |

Use release-like optimized builds, sanitizers for diagnosis separately, and signposts with IDs/timings only. Compare like-for-like traces on the same device/OS/data, repeat enough to distinguish noise and keep evidence in the PR. Once targets exist, a reproducible breach blocks the affected release until corrected or an explicit reviewed budget change documents user impact. Do not set a blanket arbitrary percentage before baseline variance is measured. CI microbenchmarks may catch pure-core regressions; device energy/scrolling/recovery remain measured operational gates. Profile before adding caching, queues, sharding or extra services; document invalidation/consistency when caching is justified.
