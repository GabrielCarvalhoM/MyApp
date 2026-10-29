# Independent R4 holdout

Author: `/root/holdout_quality`, Quality & Reliability Engineer 1.3.0. The author did not implement the R4 engine and did not inspect it before freezing this corpus. Inputs read before sealing were the R3 input adapter/contract and R2 source vocabulary. No R4 output informed facts or expectations.

The active corpus is `R4_INDEPENDENT_HOLDOUT.json`, **R4-HO-1.0.1**, 24 new synthetic nonclinical adult cases. Its SHA-256 is `6c81410c36dbef9772bacb762c48bdd12d43210ad0370875c1a30d6134024a2a`. The independence manifest seals file bytes, each case's facts, and semantic expectations. The input-validation artifact records 24/24 valid, unblocked canonical inputs under Node v24.19.0 and the existing R3 validator.

The earlier 1.0.0 bytes are preserved as `*-prevalidation.json`. Its two structured `observations.currentCapacity` values did not match R3's string contract. Version 1.0.1 re-expresses those same current-capacity facts as strings and preserves structured numerical run exposure under `reportedExposure`. This representation correction occurred before R4 inspection; no expectation or scenario meaning changed.

Normalize records using `normalizeRepresentative({...record, corpusId: corpus.corpusId, corpusVersion: corpus.version})`. Runtime consumers receive the resulting canonical facts only. Runtime code must not import corpus expectations, desired candidate names, case IDs as branches, or evaluation results. The evaluation harness may read both input facts and sealed criteria outside the runtime.

Each expectation names goal-relevant comparisons, unacceptable choices, boundaries, material facts, uncertainty and future observations. It deliberately does not approve scientific envelopes or claim universal physiological optimality. The independent scientific reviewer owns admissibility. Quality review determines whether the runtime's actual concrete recommendation follows the supported envelope, serves the goal, preserves essential work and avoids dominated alternatives.

All 24 cases remain in the denominator even if current support is absent. KEEP, ASK and HOLD stay separate from positive prescriptions. New runner, new strength trainee, intermediate hybrid, all priorities, earned progression, underperformance, missed work, local/systemic fatigue, scheduling, double ordering, long/cruise progression, substitution, return, personal response and race week are represented. This is a designed challenge, not an estimate of population coverage or autonomous efficacy.

Evaluation results and adverse-probe evidence belong in `audits/domain-closure-r4-2026-10-25/reviews/quality*` and separately versioned R4 result artifacts. Do not revise this corpus after inspecting outputs to improve results. A future correction needs a new explicit version, preserved earlier bytes and a semantic-change explanation.
