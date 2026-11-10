# Task contract: V1 COACHING INTEGRATION BOUNDARY (V1CIB-TC-r1, 2026-11-09)

**Authority:** the Founder's request of 2026-11-09 (summarized, not copied). It follows V1CP Fix-Forward, closed CLOSED_NOT_READY at `ad0c8fc` (last reviewed runtime `0950b0a`). R7-D stays closed; R7D-FREEZE-6 (`40daadd`) is a regression reference only; the spent R7-D holdouts are a regression corpus, never fresh evidence.

**Branch:** `claude/v1-integration-boundary` from `ad0c8fc`, worktree `.claude/worktrees/v1-integration-boundary`. No push, no merge, no Figma edit, no real data, no recursive deletion. The human queue stays at 235.

**Objective:** fix SSCTR-FFC-01, SSCTR-FFC-02 and QRE-FFC-01 at their shared cause; enforce CF-OBS-1 (the record is the source of truth of a hold; only a later valid readiness declaration releases it, sport by sport) and migrate the 28 qualified-clearance tests with a negative twin each; make `canonical()` follow JSON semantics (QRE-FF-06); implement the smallest correct RECORD-CUSTODY and the app boundary for iOS with synthetic fixtures; resolve or classify Security C4–C8 and SEC-V1CPI-06.

| Unit | Owner | Independent judge | Stop when |
|---|---|---|---|
| Runtime blockers (shared cause: exposure read from executed history) | Chief / Engineering | SSCTR (sporting), QRE | RED on `0950b0a`, GREEN after, suite green |
| CF-OBS-1 in the core, 28 migrated tests, negative matrix | Chief / Engineering | Security, QRE (SSCTR on the release path) | every review kind stays clinical over a record hold whatever reference is sent |
| QRE-FF-06 | Engineering | QRE | round trip and fuzz `jsonRoundTripProgram` at 0 |
| RECORD-CUSTODY, boundary API, fixtures, client states | Engineering | Security, QRE | each custody requirement has a directed test; the operational part is named PENDING |
| Security C4–C8, SEC-V1CPI-06 | Engineering | Security | each condition closed, implemented-with-conditions, or classified with its owner |
| Integration boundary contract | Chief | Security, QRE | every operation, state, error and limitation listed |

**Cycle bound (Founder rule, 2026-10-26):** one consolidated independent round (SSCTR, QRE, Security; PCG only on a real authority conflict). At most one narrow fix cycle, only for findings that are new, narrow and runtime-only, followed by one narrow recheck by the same roles. Anything else closes with a named blocker. No automatic further round.

**Readiness dimensions kept apart in every report:** RUNTIME_CORRECTNESS, F08_STATUS, RECORD_CUSTODY_STATUS, JSON_PERSISTENCE_STATUS, INTEGRATION_READY, V1_COACHING_AUTHORITY_READY. A synthetic runtime can be validated while integration is not ready; a technically ready integration is not an authorization for real athletes.

**ESCALATE_IF:** a medical judgment or clearance is needed; a new sporting number without evidence; a product decision the Founder owns and no record covers.
