# R7-C Phase 5 — Engineering review request (the one review, on R7C-FREEZE-1)

You are a fresh, independent engineering judge (`quality-reliability-engineer`). You did not author this runtime, its fixes, its tests or its evidence.

DOMAIN_COACHING_R7-C (Longitudinal Coaching) changes how the engine reads unreported training. A session with no report is unknown, never success or failure, and a session reported not done is a known miss. Where a run dose depends on unknown training, the engine asks `UNREPORTED_TRAINING` and plans neither the projection (credit) nor zero. Once the athlete answers, the answer week and the weeks after are re-planned from the facts.

The SSCTR accepted these semantics in `SSCTR-SD-R7C-r2`, with binding consumer conditions. Its final recheck on this freeze runs separately. Judge the engineering.

## Bytes to judge

- **R7C-FREEZE-1:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json`.
  - Commit of the bound bytes: `1890f66356455112907d757032a8b1cd2de29c00`.
  - Source digest: `29bf25327cfedf57add2ed7f4c4e6439ee20c2e6c72add50fa4def5f23bf4b6f`. Manifest digest: `0362faa76f21269b9dbcce469c29338b0717c2ee9030b98c588cf944313b813e`.
  - 138 files; the suite has 848 tests.
- **Identity:** `node CoachingCore/scripts/verify-r7c.mjs` (read-only without `--write`; `--suite` also re-runs the suite). Run it yourself, before and after your work.
- **Predecessor:** R7B2-FREEZE-1, commit `1a1c728`, 799 tests.
- **Delta:** `git diff 1a1c728 1890f66356455112907d757032a8b1cd2de29c00 -- CoachingCore/src CoachingCore/test`.
  - Runtime: `src/r6-composition.mjs` (`unknownRunWindow`, `peaksDecide`, `runGapInForce`) and `src/r6-adaptation.mjs`.
  - In `src/r6-adaptation.mjs`:
    - the gap guard, `heldByRunGap` and `plansNoRunDose`;
    - the answer path, `gapAnsweredBy` inside `factualReplan`;
    - held signals: `REACTIVE` in `withReference`, `heldSignal` and `replayHeld`;
    - `rebaseReason`, `notDone`, record fidelity and `learnedMaintenance` (G02).
  - Tests: `r7c-longitudinal`, `r7c-phase4`, `r7c-phase5`, and the legacy split of five fixtures.

## What to read

1. The phase checkpoints `audits/domain-coaching-r7-c-2026-11-01/PHASE{1..4}_CHECKPOINT.md`: the scope, the gaps G01 and G02, and the blockers and fixes per phase.
2. The SSCTR records `reviews/ssctr/SSCTR_SEMANTIC_DISPOSITION_R7C.md` (r1, NOT_READY on SD-01) and `SSCTR_SEMANTIC_REDISPOSITION_R7C.md` (r2, ACCEPT), with their JSON: the conditions, residuals and findings.
3. The re-disposition request `reviews/ssctr/SEMANTIC_REDISPOSITION_REQUEST.md`: the SD-01, SD-02 and SD-03 fix, the tests and the residuals R1–R5.
4. The freeze record, the handoff `CoachingCore/r7/c/R7C_HANDOFF.md`, and the evidence it binds: the evidence manifest and the mutation output under `audits/domain-coaching-r7-c-2026-11-01/probes/out/`, labelled `R7C-P5-f69ddbb`.

Do not trust the evidence because it exists. Read the diff and the decision step yourself, and reproduce what your verdict depends on.

## Evaluate (the Founder's list)

- **Current actionable horizon.** After an answer, the answer week's sessions still ahead follow the facts. History is never rewritten. Later weeks are recomposed.
- **Projection vs fact.** A stored projection made while training was unknown is never left in force as valid once the facts are known. This includes R1 / SSCTR-SD5-01: the next week's conditional projection after a later-week answer.
- **Pending lifecycle:**
  - the question raised;
  - repeated verbatim;
  - kept beside an independent change (REQUIRES_RECONCILIATION);
  - partially answered (only the unknown asked);
  - answered (pending cleared);
  - the held signal travelling, consumed, or dropped across weeks.
- **Replay.** A held signal is re-evaluated by its own handler, once, on the factual state. Nothing is replayed twice or across weeks.
- **Deterministic answer processing.** The same facts give the same decision. The answer is detected on the carried record read canonically, and it is independent of how the answer is batched.
- **Plan validity:** VALID exactly when nothing is pending.
- **No stale dose after reconciliation**, for known stops, mixed answers and answers in the taper and race week.
- **Evidence preservation.** Adverse responses, fatigue and performance reports sent with the answer, or held by the question, are not dropped. SSCTR-SD5-02 is the recorded residual.
- **Clinical priority.** Clinical-first stays absolute: the eligibility screen and the handler clinical routes.
- **Consent and revocation:** G02 learned maintenance only with consent; revocation empties the model.
- **History immutability.**
- **Tests:** the directed tests, the legacy split, and the full suite on the freeze.
- **Mutation:** the Phase 3 set, the G02-M4 equivalence, the Phase 4 rules, and the SD mutants.

## Scope and bounds

- **In scope:** the R7-C delta, and every path it can change.
- **Pre-existing behaviour identical on R7B2-FREEZE-1 is recorded and routed, not a blocker,** unless the R7-C delta demonstrably makes it worse. That includes R4, the last-week schedule change HOLD, and R5, the eligibility clinical exit that drops the reports.
- **Clinical judgment stays CLINICAL_HUMAN_REQUIRED:** you judge routing, not clinical content.
- **The Founder allows one narrow correction cycle after this freeze,** and only for a blocker caused directly by the R7-C delta: fix, directed tests, the full suite if the runtime changed, `R7C-FREEZE-2`, the affected recheck. There is no second cycle. Mark each blocker as `DIRECT_R7C_DELTA` or not.

## Rules

- **Read-only on the repository.** Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`: your probes in `probes/`, their outputs in `probes/out/`.
- **Probes and scripts:**
  - Run committed probes only if they print to stdout, or from copies in your folder.
  - `probes/phase5-run-evidence.mjs` and `probes/phase5-mutation.mjs` are long, and their outputs are committed. Do not re-run them in place, because the evidence runner writes into `probes/out`.
  - For the predecessor bytes, use `git archive 1a1c728` into a temporary directory.
- **Never run** `npm run verify`, any `verify-r*` script other than `verify-r7c.mjs` without `--write`, or any script with `--write`. `CoachingCore/node_modules` is installed; do not reinstall.
- **No commits** and no git operation that changes state. The coordinating session commits your outputs.
- **Do not edit** `src/`, tests, evidence, freeze records, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or anything outside your folder. You fix nothing.

## Deliverables

- **`ENGINEERING_REVIEW_R7C.json`:**
  - the freeze identity (record sha256, digests, the verifier result before and after);
  - the verdict;
  - per-item answers with evidence;
  - findings, and the probes run.
- **`ENGINEERING_REVIEW_R7C.md`:** the human-readable review.
- **For every finding:**
  - id (`QE-R7C-NN`) and severity (BLOCKER / MAJOR / MINOR / OBSERVATION);
  - origin: introduced by R7-C, or pre-existing with its origin;
  - `DIRECT_R7C_DELTA` yes or no;
  - the reproduction (probe path and command), expected against actual, and the smallest fix if you see one.
- **Last line of the `.md`:** exactly `R7C_ENGINEERING_GATE = READY`, `R7C_ENGINEERING_GATE = READY_WITH_CONDITIONS` or `R7C_ENGINEERING_GATE = NOT_READY`.
