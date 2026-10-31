# R7-B0 consolidated baseline — B0 NOT STARTED

2026-10-31 America/Sao_Paulo · repository `GabrielCarvalhoM/MyApp` · branch **`baseline/r7-b0`**.

Integrated authority commit: **`39e4e091697c2426f547e112df04706e802dbf41`**, parents `30164c2c45d6428769f7255fe93ebcf1f9d90ff2` and `0a0422029b839f293b15ae00e05418a82754415a`. The subsequent delivery commit contains this handoff, verification and small navigation/status amendments only. Resolve its full SHA with `git log -1 --format=%H -- audits/r7-b0-baseline-2026-10-31/BASELINE_HANDOFF.md`; the final delivery report pins that SHA. Semantic/runtime base is the exact formal closure below, not an unrelated foundation.

## Integrated authority identities

| Authority | Original branch | Commit |
|---|---|---|
| Formal R7-A closure | `closure/r7a-final` | `2263d1a1a5034eea20e0bd0fa7a8db049f4a2671` |
| Growth canonical sync | `chore/growth-canonical-sync` | `30164c2c45d6428769f7255fe93ebcf1f9d90ff2` |
| Readiness/context compression | `chore/r7-b0-readiness-pack` | `f82b7f6917e695b5fb8f277e3b6ea39737e19c35` |
| Founder-approved rotation canonicalization | `chore/two-week-rotation-policy` | `0a0422029b839f293b15ae00e05418a82754415a` |
| Historical proposal supporting that canonicalization | same rotation branch | `1c2fb97ca47fb0ca3be312298de435f4b8d10311` |

All original commits are reachable. Growth is a fast-forward from closure; the narrow merge brings exactly the readiness, rotation proposal and approved canonicalization commits. The proposal/matrix/source reviews remain historical supporting material, not wholesale normative approval. No cherry-pick equivalence claim is needed. The request's rotation SHA `0a0422029b839f293b15ac00e05418a82754415a` differs from the fetched approved branch object; the correct SHA is the `...b15ae00...` value above.

Four additive conflicts occurred in `CURRENT_MISSION.md`, `MISSION_LEDGER.md`, `canon/CANONICAL_INDEX.md` and `product/PRODUCT_DECISION_REGISTER.md`. Resolution retained both exact approved additions: closure/Growth followed by rotation appends, or rotation prefix followed by the Growth document. No normative sentence was reconciled by inventing a decision. Later baseline navigation explicitly supersedes only stale pending-recheck/held-Growth status metadata.

## Current status and immutable freeze

`R7A_EXIT_READINESS = READY` · `R7A_FORMAL_CLOSURE = COMPLETE` · `GROWTH_CANON_SYNC = COMPLETE` · `SAFE_FOR_R7_B0_BASELINE = YES`.

`FOUNDER_DECISION = APPROVED` · `TWO_WEEK_ROTATION_POLICY_CANONICALIZED = YES` · `R7_B0_ROTATION_FOUNDER_BLOCKER = CLOSED`.

| Frozen identity | Value |
|---|---|
| Freeze | `R7A-RESIDUAL-AUTHORITY-FREEZE-1` |
| Runtime commit | `7d2da3603e224124696a2290766ec448080f3264` |
| Source digest | `e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d` |
| 86-file manifest digest | `3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125` |
| R6-POLICY-5 canonical digest | `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` |

[VERIFICATION.json](VERIFICATION.json) records current raw-file comparisons, recomputed digests, exact approved additions, closure preservation, indexed hashes/locators, unchanged original classifications/gap/deferred categories, scope and ancestry. Reproduce read-only with `node audits/r7-b0-baseline-2026-10-31/verify-baseline.mjs`. No frozen artifact or test result is regenerated; the 673-test result remains accepted closure evidence, not a new execution claim.

The historical read-only `verify-r7ara.mjs` returns **11/12, exit 1, `closed-history`**. Its old whole-repository baseline predates the approved closure queue and canon/product updates. The current verification enumerates every differing historical path and permits only those exact approved changes. Bound files, source/manifest/policy digests and freeze evidence are checked independently. This is not a raw historical-verifier PASS or a rejudgment of the accepted rechecks.

## Canonical read order for the separately authorized B0

1. [Current mission](../../CURRENT_MISSION.md), formal-closure and baseline blocks → [R7-A final handoff](../../CoachingCore/r7/R7A_FINAL_HANDOFF.md) → [final disposition](../domain-coaching-r7a-residual-authority-2026-10-30/FINAL_DISPOSITION.json).
2. [Readiness handoff](../domain-coaching-r7-b0-readiness-2026-10-30/CLAUDE_HANDOFF.md) and scoped [authority index](../domain-coaching-r7-b0-readiness-2026-10-30/AUTHORITY_INDEX.json) → [canonical index](../../canon/CANONICAL_INDEX.md), [PDR](../../product/PRODUCT_DECISION_REGISTER.md) DR-93–134/G01–G11 and [truth map](../../product/PRODUCT_TRUTH_MAP.md). Consume the pinned external wearable refinement below where relevant.
3. [Thesis](../../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md) retained invariants and [V1 scope](../../product/V1_RELEASE_SCOPE.md). Growth DR-124–133 is present; do not reapply its preserved patch.
4. [R6 Founder request §4](../domain-coaching-r6-2026-10-26/FOUNDER_REQUEST.md) → unchanged [R6-POLICY-5](../../CoachingCore/r6/PROGRAM_POLICY_R6.json) → [Hybrid](../../CoachingCore/r6/HYBRID_PROGRAMMING_R6.md). Dynamic contextual priority supersedes old static-priority wording only where already decided.
5. [Adaptive Engine contract](../../product/ADAPTIVE_ENGINE_CONTRACT.md), [domain model](../../product/PRODUCT_DOMAIN_MODEL.md), [architecture](../../product/PRODUCT_ARCHITECTURE.md) and [operational spec](../../product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md): retained authority, agency, representation, evidence and safety clauses; no legacy layout authority.
6. [Sport](../../product/SPORT_INTELLIGENCE_SPEC.md), [Running](../../product/RUN_INTELLIGENCE_SPEC.md) and [Strength](../../product/STRENGTH_INTELLIGENCE_SPEC.md), including DR-134 and the [Founder source](../two-week-rotation-policy-2026-10-30/FOUNDER_DECISION.md). Requirements are not newly approved recipes.
7. R7-A semantic amendments in index order: week composition → interruption → week-start boundary → state model → state consumers → decision authority → residual authority. Use exact unsuperseded clauses and existing approvals.
8. Only B0-relevant [R6 gaps](../../CoachingCore/r6/OPEN_GAPS_R6.md) and the scoped [drift audit](../domain-coaching-r7-b0-readiness-2026-10-30/DOCUMENT_DRIFT_AUDIT.md). Deepen by a named gap; do not preload old holdouts, review branches, snapshots or Figma.

## Later approved external authority — reference only

Branch `chore/v1-healthkit-workoutkit-evidence`, commit **`993b258e792ae894a29101e9c0efd95689c5f880`**, PDR-1.13 / **DR-135–147**, VWE-01–13: [approved strategy](https://github.com/GabrielCarvalhoM/MyApp/blob/993b258e792ae894a29101e9c0efd95689c5f880/product/V1_WEARABLE_EVIDENCE_STRATEGY.md), [exact PDR](https://github.com/GabrielCarvalhoM/MyApp/blob/993b258e792ae894a29101e9c0efd95689c5f880/product/PRODUCT_DECISION_REGISTER.md), [publication/gates](https://github.com/GabrielCarvalhoM/MyApp/blob/993b258e792ae894a29101e9c0efd95689c5f880/audits/v1-healthkit-workoutkit-evidence-2026-10-30/FINAL_DISPOSITION.md).

For future metadata interpretation: HealthKit remains V1's only external ingestion path; native Apple WorkoutKit is a V1 structured-delivery exception to earlier blanket watch deferral. Evidence capabilities/provenance are field-specific; imported values remain immutable; missing-only USER_REPORTED supplements stay distinct; exclusion preserves originals and never fabricates measured streams. No brand guarantees confidence or detail. These approved clauses qualify older watch-deferral/missing-data prose, without changing frozen R7-A. HealthKit own-activity write-back remains open at iOS prep. B0 can express available/required evidence metadata only under its later authorization. This reference neither integrates that branch nor starts adapter/KMP/backend work.

Repository/delivery foundation `1a6d88988b452faad2e2fb60fd7f2fefd250ceac`, engineering quality/security foundation `e0666d57b35ef85c19d6dfb58159cdf5eead8dfa`, preflight `3f11f7db5250d1b89dad739a31d7ee4c0046c867` and reviewer branches remain separate. No files from those lines are required for this documentation baseline.

## B0 boundary, do-not-reopen and deferrals

Future mission: **DOMAIN_COACHING_R7-B0 — V1 Coaching Repertoire Foundation — Running + Strength + Hybrid Week Archetypes**. Only a separately authorized B0 may define the versioned repertoire/configuration/archetype foundation, constrained composition relations, eligibility, parameterization, safety and validation inputs within approved envelopes. All seven existing gap categories remain; no recipe or configuration is created here.

DR-134 is fixed: MAIN stable within block; ACCESSORY may be two-week eligible when an admissible alternative exists; PRACTICE has no calendar-driven automatic rotation. Contextual role differs from eligibility; close variation is a directed relation, not a role; justified reason-based substitution overrides cadence; broader block review remains around six weeks. Concrete configuration mapping belongs to B0, not a remaining pre-B0 Founder decision.

Do not reopen closed R7-A/QE-R7ADA-01/02/F4-X/R7ARA-SELF-01, F1–F4, D53/D56–59, HOLD/MAINTAIN or accepted R2/R3/R6-H35 semantics. Preserve the final disposition's exact nonblocking backlog and human queue. No runtime, R6-POLICY-5, frozen test, freeze, closure artifact or reviewer-branch edits. No new sports/clinical decision or G01–G11 closure. Growth behavior stays limited to already-canonized decisions.

Deferred: R7-B planner/cold-start/whole-program progression, R7-C longitudinal learning, R7-D fresh generalization, KMP, iOS/HealthKit/WorkoutKit implementation, persistence/backend, TestFlight/production/real-use/legal/privacy gates, Figma and design reconciliation, Growth implementation, Post-V1 Crew/additional sports/direct providers/Android, and funded-human revalidation under its existing trigger. QE-R7ARA-OBS-1 remains PRE_TESTFLIGHT_REVIEW; NF-R7ARA-1 remains POLICY_BACKLOG, not a B0 blocker. Clinical needs retain their human requirement.

**Remaining Founder decision before B0: none identified for this baseline or the approved rotation structure.** Actual B0 execution still requires a new, explicit mission authorization. Future iOS write-back/naming/analytics or other deferred decisions are not silently closed.

**B0 HAS NOT STARTED. STOP after the clean delivery commit and push of this baseline branch. Do not merge to main or begin DOMAIN_COACHING_R7-B0.**
