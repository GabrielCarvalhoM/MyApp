# Coaching-quality judge for the blocked closure (as dispatched)

On 2026-10-27 the fourth continuation session adapted this brief from `judge-prompts.md`, section "COACHING-QUALITY JUDGE". SSCTR round 12, the last round under the Founder bound (`../FOUNDER_LOOP_BOUND.md`), refused the freeze, so R6 closes with an explicit blocker. There is no FREEZE-2 and no post-fix rerun. The judge therefore judges the single first evaluation only: the primary record, bound to FREEZE-1.

It was dispatched to a fresh `quality-reliability-engineer`, with `model: opus` and `effort: xhigh`.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"Independent adversarial coaching-quality judgment of the fresh R6 holdout: the single first evaluation on FREEZE-1, the primary and only evaluation, since FREEZE-2 was refused and R6 closes with an explicit blocker; primary readiness evidence","mode":"productization","owner":"quality-reliability-engineer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/coaching-quality-holdout-review.json","audits/domain-coaching-r6-2026-10-26/reviews/coaching-quality-holdout-review.md"],"stop_when":"Every holdout case and every generated program of the first evaluation has a classification with reasons, the metric tables are complete and every KMP criterion is assessed","escalate_if":"The first evaluation was not produced from the sealed corpus on the FREEZE-1 digest, the first raw changed, or a clinical or safety failure appears"}</task-route>

You are the independent, adversarial coaching-quality judge for DOMAIN_COACHING_R6 of the Vilumo Fit coaching core. The core is an offline, synthetic shadow reference for hybrid running and strength coaching. You authored neither the runtime nor the corpus.

Judge like a strong hybrid coach. Credit what a good coach would do, not mere safety or output existence. A safe ASK is not a positive prescription.

## Order of events

The records are in the files named.

1. **The holdout.**
   - The runtime was frozen as FREEZE-1: `CoachingCore/r6/RUNTIME_FREEZE_R6.json`, digest `507f35fc…`. Its sources are preserved byte-identical in `audits/domain-coaching-r6-2026-10-26/freeze-1-source/`.
   - The policy in force was R6-POLICY-2: canonical hash `af2779fe…`, file sha256 `c855cde0…`, kept as `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-af2779fe.json`. The SSCTR records then in force are in `reviews/ssctr-policy-review.r6.json`.
   - An independent author wrote and sealed the holdout without runtime access (`CoachingCore/r6/holdout/INDEPENDENCE_MANIFEST.json`, `R6_INDEPENDENT_HOLDOUT.json`).
   - The single first evaluation ran on FREEZE-1 (`CoachingCore/r6/holdout/FIRST_EVALUATION.json`). It is the primary record and, for R6, the only evaluation.
2. **After the evaluation.**
   - An independent engineering judge failed FREEZE-1 (`reviews/quality-engineering-review.json`).
   - The runtime author then made the changes recorded in these dossiers:
     - the engineering fixes (`CoachingCore/test/r6-engineering-fixes.test.mjs`);
     - SSCTR rounds 7–11 answered in `reviews/ssctr-dossier/REVISION_R6_POLICY_3.md`, `_4.md` and `_5.md`, and in `RUNTIME_DELTA_D50_D51.md`, `RUNTIME_DELTA_D52.md` and `RUNTIME_DELTA_D53.md`;
     - D42–D53, with three author-found changes.
   - The author made them without inspecting the first evaluation. They came after the author had seen the holdout author's one-line case summaries, never the corpus or any output.
3. **The refused freeze.**
   - SSCTR round 12 (`reviews/ssctr-policy-review.json`, R6-SSCTR-POLICY-r12, at R6-POLICY-5 `18ec48f3…`) refused the freeze.
     - D53 remains open for an exercise whose establishment log is pending or unlogged: its set count can come back two at once after a re-establishment.
     - D54 is new: a re-establishment row ignores the taper, race-week and post-event doses.
   - Under the Founder's bound, R6 closes with that blocker. There is no FREEZE-2 and no post-fix rerun. The current runtime, which carries every later change, is not frozen.

The SSCTR approvals hold under a weekly-review contract. Every elapsed week must get a gating weekly review, with unreported sessions reviewed as missed; a week without one keeps the projection's assumption that it was executed and logged (owned gap R18). Holdout steps that skip weeks carry that assumption, so read their outcomes in that light.

## Integrity first

- The corpus bytes hash to the manifest's `corpusSha256`.
- `FIRST_EVALUATION.json` carries that corpus hash and the FREEZE-1 digest.
- Its sha256 is `b3d155b63d525325ac94688f403efa073b12698dd342ed43a87093be7a75eb3e`.

Stop and report if anything does not match.

## What to read

- the corpus, where each case carries the author's independent assessment, written before any output;
- the first raw;
- `CoachingCore/r6/holdout/INTERFACE_ONLY.md`;
- the FREEZE-1 policy and SSCTR records named above, whose envelopes and conditions are not yours to re-decide;
- the dossiers, only to say which of your findings a documented later change addresses.

You may run read-only scripts to inspect programs or counterfactuals, against the FREEZE-1 sources or the current runtime. Write them under `audits/domain-coaching-r6-2026-10-26/reviews/coaching-quality/`.

You must not:
- change the runtime, the corpus or the raw;
- run the holdout cases through the current runtime: there is no frozen post-fix runtime to bind such a rerun to;
- regenerate the evaluation;
- read or edit the topic docs in `CoachingCore/r6/*.md`, which the author is finalizing;
- run `npm run verify` or any `verify-r*` script.

## What to classify

**Every case**, as one of:
- `BEST_SUPPORTED`;
- `ACCEPTABLE_ALTERNATIVE`;
- `SUBOPTIMAL`;
- `INSUFFICIENT_INFORMATION`: the right answer was to ask or hold, and the engine did;
- `UNSUPPORTED`: the engine could not serve a request it should serve, or served it wrongly;
- `CLINICAL_OUT_OF_SCOPE`: correct clinical routing, reported separately.

If a case failed because the corpus referenced something the interface cannot express, or made an error, mark it `CORPUS_ERROR` with the reason; the author's own interface-gap notes are in the manifest. Do not count such a case against the runtime.

**Every generated program, as a whole**, as one of `PROGRAM_BEST_SUPPORTED`, `PROGRAM_ACCEPTABLE`, `PROGRAM_SUBOPTIMAL`, `PROGRAM_INCOMPLETE` or `PROGRAM_UNSUPPORTED`. Look at:
- phases and progression;
- quality timing;
- strength dose and loads;
- the hybrid arrangement;
- event weeks;
- negotiation and gaps;
- what week 1 asks of the athlete.

For each finding, say whether a documented later change addresses it (`addressedByLaterChange` with the change id), whether it is still open, or whether that is unclear. You cannot verify a later change on this holdout, and must not claim to.

## What to report

The metrics the Founder asked for, all on the first evaluation:
- the holdout distribution;
- cold start: complete programs, establishment-required, legitimate ASK, incomplete or unsupported;
- the whole-program quality distribution;
- adaptation: appropriate KEEP, appropriate MODIFY, unnecessary mutation, insufficient mutation, excessive mutation;
- learning: valid update, ignored relevant history, overfit, duplicate contamination, false causal hardening.

Then:
- **Findings**, ranked by severity.
- **Whether the evidence shows a fundamental architecture or domain hole**, as opposed to bounded edge gaps.
- **Each KMP_PRODUCTION_CORE_PREP criterion the Founder set**, from your own evidence only, as MET, PARTLY_MET or NOT_MET, with the cases that show it:
  - cold start works for core V1 profiles;
  - whole-program generation works end-to-end;
  - Balanced no longer has structural suboptimal behaviour;
  - run, strength and hybrid trajectories are materially complete;
  - normal nonclinical return works;
  - supported event profiles include the race-week transition;
  - substitution works;
  - the Athlete Model changes future decisions without obvious overfit;
  - the fresh holdout reveals no fundamental architecture or domain hole;
  - remaining gaps are bounded edge coverage rather than core semantics.

Your assessment informs the readiness verdicts; it does not set them.

## Outputs

Write `reviews/coaching-quality-holdout-review.json` with:
- revision, evaluator, independent and integrity;
- the rubric;
- `cases`: `[{caseId, family, classification, programClassification?, reason, addressedByLaterChange?, comparedToAuthorAssessment}]`. Keep `classification` at the top level of each case;
- `metrics`, `adaptationMetrics`, `learningMetrics`, `coldStart` and `programDistribution`;
- `findings`, each with its severity and `addressedByLaterChange`;
- `kmpCriteria`: `[{criterion, assessment, cases, note}]`;
- `verdict`: `{qualityStatus, fundamentalHole, rationale, recommendedVerdicts:{COACHING_DECISION_QUALITY, WHOLE_PROGRAM_QUALITY}}`;
- `limitations`.

Also write a `.md` summary.
