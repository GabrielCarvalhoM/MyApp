# Engineering constitution and Definition of Done

Foundation v1 · 2026-10-30 · target guidance for future authorized implementation.

This extends [CONTRIBUTING](../../CONTRIBUTING.md), not the product Canon. Current Founder instructions, [AGENTS](../../AGENTS.md), [mission](../../CURRENT_MISSION.md) and the [authority filter](../../canon/CANONICAL_INDEX.md) retain precedence. No product behavior, sporting rule, screen map, release gate or frozen review status is changed here.

The repository currently contains a Node Reference Oracle and delivery scripts, not an iOS app, Kotlin module or backend. The target is pragmatic Clean Architecture, MVVM-C and feature boundaries for iOS; a platform-independent KMP Production Core later; a modular backend only when authorized. No module skeletons or speculative frameworks are created.

Read only the relevant contract:

- [ADR 0001: runtime and dependency boundaries](decisions/0001-runtime-boundaries.md): iOS, KMP, backend, composition and authority.
- [Quality](QUALITY.md): coding, lint/suppressions, tests, measurable performance and local commands.
- [Security](SECURITY.md): OWASP-based baseline, threat model, logging, operations and supply chain.
- [Privacy](PRIVACY.md): inventory template and data lifecycle; unresolved legal/DPO decisions.
- [Delivery evidence](DELIVERY.md): scope, immutable baseline, checks, limitations and stop condition.

## Hard gates — few, explicit and proportional

| Gate | Enforcement now | Future implementation PR obligation |
| --- | --- | --- |
| Build/compile affected targets | Not applicable: no app/KMP/backend target; Node lint parses active tooling | Add locked, reproducible build/typecheck for each target in its first implementation PR; no passing placeholder jobs |
| Lint, zero warnings | ESLint for live JavaScript; workflow syntax through actionlint | SwiftLint for Swift; ktlint for Kotlin; add gates with the first target, before accepting source |
| Relevant tests | CI-adapter tests always; Core tests selected by existing authority/path guard | Domain/use-case/boundary tests for changed behavior; UI tests only for material journeys |
| No detected secrets or unresolved high/critical dependency vulnerabilities | Gitleaks checkout/history scans always; npm audits on relevant changes | Do not silence a real secret; revoke/rotate and remediate. Vulnerability exceptions need a reviewed, scoped, expiring decision and an enforcing mechanism |
| Frozen Coaching Core integrity | Existing R7ARA verifier plus full fixed-commit tree/checkout-byte comparison always | Preserve this freeze until an explicit successor mission reviews/replaces the adapter; never regenerate it for green CI |
| Security-sensitive review | Conditional PR flags and competent independent review; **human/mission gate**, not programmatically approved | Required before merging changes to identity, authorization, payment, permissions, sensitive data, sync, deletion/export, secrets, admin, dependencies or migrations |

The final `CI` job aggregates selected jobs and must stay present for docs-only changes. It is effective merge enforcement only after a supported GitHub ruleset/protection is enabled. Passing CI proves mechanical checks, not product/sports/security/legal/release readiness. No author self-approves a required independent gate.

## Guidelines — review with judgment

Dependencies point toward domain contracts. Separate mutable state and side effects from decisions. Prefer small cohesive concrete types; add a protocol where substitution, external I/O, ownership or a meaningful test seam needs it. Feature folders precede separate packages. Start with one deployable backend, not microservices. Choose extra layers only for demonstrated change pressure.

An implementation PR is done when its authorized behavior and failure/cancellation states are demonstrated; relevant gates are current; migrations and rollback/recovery are understood; data flows and permission changes update the inventory/threat model; and affected performance budgets are measured or explicitly resolved before dependent release. Link evidence in the existing PR template. Explain N/A gates. A TBD is a tracked prerequisite, not evidence that it passed.

Exceptions state rule, exact scope, reason, owner, risk, expiry/removal trigger and validation. Never grant broad permanent disables, use generated baselines to bury new findings, or bypass product authority through infrastructure changes. Repeated exceptions require revisiting the design. ADRs record only costly boundary/authority/persistence decisions; routine implementation choices belong in code or the PR.
