# Independent R5 DEV review — REQUEST_CHANGES

Evaluator: `/root/quality`, Quality & Reliability Engineer 1.3.0; independent of runtime/policy/fixture implementation. Contract `R5-1`; rubric QUALITY 1.1.0; verify-domain-gate and verify-before-completion 1.3.0. Environment: local Windows PowerShell, Node v24.19.0, HEAD `1d25c73e56661c8feac780aa814cc26aef51c9fc`, additive uncommitted R5 with dirty pre-existing project work preserved. Model/tools/permissions inherited from session; filesystem + Node execution confirmed. No global memory, source edits, new dependency, UI, production, or real athlete work performed.

Scope is pre-freeze adversarial DEV behavior. This is neither the fresh unseen holdout nor final binding/coaching approval. Root is correcting findings; this review applies only to source hashes in `quality-probes-dev-results.json`. Test authority in the harness isolates deterministic behavior and is explicitly not scientific approval. SSCTR independently owns current scientific source/policy binding.

Run from project root:

```powershell
node audits/domain-coaching-r5-2026-10-25/reviews/quality-probes-dev.mjs
```

Raw evidence: `quality-probes-dev-results-round1.json` preserves the first 12 probes; `quality-probes-dev-results.json` contains all 16 probes on the same runtime hashes. Each probe is an executable minimal construction from canonical DEV input with the stated mutation. The harness intentionally catches exceptions to preserve subsequent findings.

| Criterion | Evidence/current result | Assessment |
| --- | --- | --- |
| Direction of known progress/regress and complete changed dimensions | Q01 accepts PROGRESS 30→20 min; Q02 REGRESS 30→50 min; Q10 adds unavailable TREADMILL; Q16 removes preparation while claiming duration-only progression | FAIL, P1 |
| Actual-dose exposure earns progression | Q13 three runs at actual 1 minute, labeled completed/OVER, earn 30→35 because context binds planned prescription, not executed dose | FAIL, P1 |
| MOVE preserves same current dose | Q03 prior earned 35 becomes 30 for moved week, then returns to35 next week | FAIL, P1 |
| Completed actuals retain source-plan chronology | Q04 review week0/asOf11-10 moves executed 11-02 session to11-04; ledger remains unchanged but its task date no longer agrees | FAIL, P1 |
| Prescription fits availability/equipment | Q09 35-minute progression in a30-minute window; Q10 requires missing equipment | FAIL, P1 |
| Event horizon partitions correctly | Q14 week0 event overlaps FOUNDATION; lookup chooses FOUNDATION, schedules long run after event, then DEVELOPMENT post-event despite no event config | FAIL, P1 |
| Clinical signals cannot add positive individual dose evidence | Q08 pain=true routes clinical but appends OVER/COMPATIBLE/EASIER to updatedModel | FAIL, P1 |
| Calendar and clock validation fail closed | Q05 2026-02-30 accepted and normalized to03-02; Q06 invalid review date and Q07 backwards model clock throw uncaught TypeError | FAIL, P2 |
| Local fatigue applies MEC only to affected work | Q11 target optional strength-b also deletes unrelated optional easy run | FAIL, P2 |
| Chronology includes scheduled session time | Q15 execution at00:01 accepted for07:00 session | FAIL, P2 |
| Malformed reference input produces structured rejection | Q12 null anchor throws rather than INVALID_INPUT | FAIL, P2 |
| Official plan/apply state | Inspected output construction clones official state and uses SHADOW/applied=false; raw probes did not cause external mutations | Narrow PASS; full current final invariants pending |
| Requested whole-program coaching and goal-optimal A–G quality | Simulator/docs still under construction; familiar repeated conditional weeks do not themselves establish competence or BEST_SUPPORTED decisions | BLOCKED pending final artifacts and independent review |

Primary source locations at reviewed hashes: `r5-contract.mjs:6,79–87` (date/dimensions/alternatives); `r5-selectors.mjs:8,33,42,55,59` (selection, baseline anchors, excessive fatigue removal); `r5-adaptation.mjs:8–24` (patch without asOf/actual/executable feasibility guards); `r5-review-context.mjs:11–33` (clock/learning/actual binding); `r5-program.mjs:14–23` (overlapping early-event blocks).

Owner for corrections is `/root` and original implementation authors. Resolution requires fail-closed input/alternative validation, current-dose-aware scheduling, explicit immutable/past-horizon checks, actual-dose/clinical evidence guards, feasible proposal checks, disjoint event phases and affected-only fatigue scope. Rejecting an inadmissible alternative at initial generation is an acceptable resolution; the harness will be adjusted to report structured rejection rather than require unsafe generation.

State: **QUALITY_BLOCKED**. Review event: **REQUEST_CHANGES**. Stop for this pre-freeze pass after reproducible findings are delivered. Re-evaluate affected probes and current deterministic checks after author notice; final current-source gate, A–G coaching classification and holdout evidence remain separate work. No claim of broad whole-program/first-prescription/autonomous or production readiness is supported by this review.
