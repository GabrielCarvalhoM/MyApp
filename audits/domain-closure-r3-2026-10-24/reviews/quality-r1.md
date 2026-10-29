# DCR3 independent Quality review — r1

Verdict: **QUALITY_BLOCKED / REQUEST_CHANGES**. Evaluator `/root/quality_r3` is independent of adapter, runtime, harness and sporting-policy authors. This is executable offline reference review, not a sporting approval, clinical review, UI or production gate.

Contract DCR3-20261024-r1; constitution Quality & Reliability Engineer1.3.0; rubric QUALITY1.1.0; skills verify-domain-gate1.3.0 / verify-before-completion1.3.0. Environment Windows PowerShell + Node24; inherited tools/permissions confirmed. HEAD/base `1d25c73e56661c8feac780aa814cc26aef51c9fc` on main, dirty checkout preserved. Only `reviews/quality*` authoring by this judge.

Raw evidence: `quality-probes-r1.raw.json` (78 cases/variants,36 explicit assertions,20 expectation failures), produced by `node audits/domain-closure-r3-2026-10-24/reviews/quality-probes.mjs`; `quality-regression-r1.tap` (`npm test`:198/198). Target runtime raw SHA256 `fdee0ba8c29dbe8b2442d74a922888f7c4079082ead1b322fb5bcfae1c369af1`; full file hashes are in raw JSON. Deterministic suite success does not resolve below behavior failures.

| Criterion | Evidence / result |
|---|---|
| Frozen42 conserved and structurally canonical | PASS: all42 normalized/evaluated, source facts in probe output; adapter tests verify exact reconstruction/hash. |
| Official/applied state and caller input conservation | PASS for78 probe executions: all inputs unchanged, applied==official; explicit completed prefix5+3 preserved in frozen10. |
| Actual current semantic consumption before coverage | FAIL: kind-only cases1/9/10/11/15/23/25/28/35/41/42 still consumed=true, including assertions about nonexistent material facts. |
| Positive selector scope / context fidelity | FAIL: unfamiliar terrain still selects R2-P14; STEADY ignores contradictory priorHistory sibling currentCapacity. |
| Clinical boundary over supported input forms | FAIL: canonical-valid narrative persistent pain in observations remains normal HOLD/science gap. |
| Useful ASK discriminates genuinely missing facts | FAIL: providing every requested missing field in32/29/34 leaves same usefulASK and false absent rationale. |
| Contract/hash/version failures separate from useful ASK | PASS for mismatched source hash, real-person and unsupported canonical version; missing canonical section produces software-contract category. |
| Trace integrity | FAIL: deleting deterministic stale warning is accepted as canonical-valid; dose still withheld by other metadata guard in this witness, but canonical diagnostic integrity is unproved. |
| Sporting approval of new prescriptions | NOT_APPLICABLE to this judge; separate independent SSCTR required. |
| UI / devices / KMP / production / real athlete effect | NOT_APPLICABLE: explicitly excluded from this mission. |

## Findings to author

1. **P1 — Semantically consumable40 is not proved by kind routing.** `kind-only-10` strips all facts except population, eligibility and kind. Runtime reports `consumed:true`, `decisionReady:true`, and rationale `The 5min plus 3min completed prefix is immutable` despite no completed prefix or session. `kind-only-25` claims exact event/components/windows consumed when all are absent. Similar fixed rationale occurs in11 other branches. Actual fact reads alone do not prove use: undefined is read and ignored. Require a binding assessment over typed material operands and genuine absence/unknown/opaque states, separate recognized request routing from semantic binding and dose readiness. Opaque or not bound material representation must remain visible as software/contract or domain representation gap. Recompute denominator after this boundary.

2. **P1 — Exact positive context leaks.** `easy-unfamiliar-terrain` modifies frozen31 terrain to unfamiliar steep rocky hill while retaining stated conditions similarity: still `MODIFY R2-P14`. `steady-prior-context-contradiction` adds `priorHistory.currentCapacity='unknown after interruption'` to33: still `MODIFY R3-STEADY`. History sub-object hash ignores material sibling context. Reconcile or fail closed for any unreviewed material field; test changed values, not just extra keys. This judge does not establish new terrain or capacity applicability scientifically.

3. **P1 — Supported narrative pain bypasses clinical boundary.** `narrative-pain-return`23 and `narrative-pain-race`25 supply `observations.pain='persistent with ordinary jogging'`. Both validate canonical and receive normal HOLD; race case becomes science gap. Schema explicitly permits recovery pain as boolean|string. Clinical facts already represented in supported forms must not require a second boolean to be respected. Unknown/ambiguous narrative should withhold dependent prescription and ask/refer appropriately; explicit persistent pain must route clinical.

4. **P1 — Useful ASK is hardcoded, not responsive to supplied facts.** `recovery-required-facts-now-supplied`, `postevent-required-facts-now-supplied`, and `cruise-required-facts-now-supplied` supply all ASK paths, yet return identical missing paths. Once missing facts arrive, either re-evaluate existing binding, identify a different actual missing input, or expose domain/science gap. Do not require positive action; require truthful missingness and category.

5. **P2 — Canonical warning/trace integrity is incomplete.** `easy-stale-warning-deleted` drops EXPLICIT_STALE_OBSERVATION from canonical input after normalization; validateCanonical accepts it. Other guards keep this case HOLD, so no positive exploit is claimed. Validate source-determined diagnostics or recompute them for decisions; source-derived provenance and trace should not silently disagree with source.

Owner for corrections: root engineering author, coordinating adapter owner where relevant. STOP: no approval of40 semantic-consumable or newly executable positive expansion while P1 findings unresolved. Re-evaluate exact revised hashes with these probes, current regression and regenerated baseline. No author files were changed by judge.
