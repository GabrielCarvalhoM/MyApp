# R7-D diagnostic: SSCTR domain triage (`SSCTR-R7D-DIAG-TRIAGE-r1`)

**What this is.** The domain triage of the first evaluation of the diagnostic corpus (R7D-DIAGNOSTIC-1) on R7C-FREEZE-4.
- It is not a gate. It gives no R7-D readiness verdict and makes no freeze, queue item, policy change or catalog change.
- Reviewer: SSCTR-1.0.0, provisional nonclinical software authority. No human review, no clinical judgment, no validation.
- Machine-readable record: `SSCTR_DIAGNOSTIC_TRIAGE_R7D.json` in this folder. It holds the per-case step notes, the reproductions and the sources.

**Literature access.**
- WebSearch works.
- Full texts at BJSM and PMC were blocked, so every source was read at abstract or summary level.
- No prescriptive approval is made, so no funded-human revalidation entry is created.

## Answer to the Founder

**Yes, the diagnostic found blockers.** Two were seen directly in corpus decisions and one more structural pattern showed up across three cases:

| Id | Class | Where | What |
|---|---|---|---|
| **DX-02** | SAFETY_BLOCKER | D18 a6 | A declared 17-day full stop inside a weekly review is ignored, and the decision is VALID. The athlete gets the program's longest run that day, strength loads above the last ones executed, and threshold work the next week. |
| **DX-01** | GENERALIZATION_BLOCKER | D15 w2 | A same-day report drops out of the record at the next decision. My witness shows it can also turn a required step-back after repeated adverse responses into a hold (next long run +5 min). |
| **F03** | GENERALIZATION_BLOCKER (+ DIRECT_RUNTIME_DELTA) | D08, D14, D18 | Machine-stack loads: the runtime prescribes unit `STACK_STEP` but rejects it when it is logged back. Machine lifts never progress (D08: the 3 main hypertrophy lifts are frozen for 9 weeks, with 5 confirmation questions each week). When the loads are read, steps are +1 kg, which no real stack can set. |
| **F04** | GENERALIZATION_BLOCKER (latent; judge witness only) | mechanism in D14 w1 | A `confounded` flag masks an adverse recovery and an impaired next day, and the long run advances. |

**Safety test gaps that block a final gate until covered:**
- P08 saw only RETURN_AFTER_PAUSE (HG-05).
- No UNREPORTED_TRAINING question was ever asked, so the answer paths were not exercised (TG-01).

All of these are PRE_EXISTING and undisclosed.

**Rubric works, with fixes.** The rubric was usable. The ambiguities and suggested changes are listed below; none is applied.

## Rubric classes (17 evaluable, 1 corpus error)

| Class | Count | Cases |
|---|---|---|
| BEST_SUPPORTED | 8 | D03, D04, D05, D09, D10, D13, D15, D17 |
| ACCEPTABLE_ALTERNATIVE | 5 | D02, D06, D07, D14, D16 |
| SUBOPTIMAL | 3 | D01 (AUTHORITY_SCOPE), D08 (RUNTIME, structural), D12 (AUTHORITY_SCOPE) |
| UNSAFE | 1 | D18 (RUNTIME, structural; step a6) |
| CORPUS_ERROR | 1 | D11 (CE-01) |

Notes on the SUBOPTIMAL cases:
- **D01:** the walk/jog beginner never trains longer than about 30 minutes before a 75-minute 10K window. The runtime flags this gap itself but treats it as non-material for a 10K.
- **D12:** two adverse runs in one week only hold. The policy counts adverse responses per run role, within 14 days back from the decision.
- **D08:** the machine-stack stall (F03).

## Positions

- **DX-01:** blocker, GENERALIZATION_BLOCKER, structural.
  - In D15 itself no visible dose changed.
  - But the effect is not only conservative: a dropped adverse report suppresses the policy's repeated-adverse regression.
  - Fix and test this before any final holdout.
- **DX-02:** UNSAFE (SAFETY_BLOCKER), not SUBOPTIMAL and not acceptable.
  - The first-return-week run (70 min) exceeds the largest run executed before the pause (65 min). That violates P08 in substance (R7-A inv. 3/6).
  - It contradicts the accepted rule "a declared break is a known stop with its return recipe".
  - The same facts sent as a return report get the return recipe, with no quality.
  - The harm magnitude is not claimed; the scientific direction is supported with limits.
- **"Coach should ask" (D02, D06, D16, D18):**
  - Acceptable alternatives. The author expectations go beyond the accepted R7-C ask rule, because every dose stayed within executed capacity.
  - D18 s6 raises safety-relevant POLICY_QUESTION F07: a 17-day silence while the ceiling is anchored by a 28-day-old run.
- **D14 g5:** domain-acceptable, since nothing was planned and the plan was kept. The ASK status with a horizon reason, instead of UNSUPPORTED, is OBSERVATION F10.
- **D10 cl6:** correct within authority. A cleared clinical return is outside the policy population and the interface scope, so the author's expectation exceeds the authority. The missing path back into the plan is POLICY_QUESTION F08 (safe).
- **D08 dc3:** acceptable. The ASK follows the R7-A dated-window rule. Applying a one-day change directly is POLICY_QUESTION F09 (non-safety).
- **D14 w1 (HG-03):** acceptable. The run was confounded but completed in full with normal recovery. The oracle fix must still treat an adverse recovery or an impaired next day as unfavourable when the run is confounded (F04).
- **VARIANT failures:**
  - D02, D06, D16: not runtime violations. The base timelines never delivered the facts, because their answers had no pending question, so the relations are NOT_EVALUABLE.
  - D14: a real but conservative difference (F11) with equal run doses.

## Other findings

| Class | Items |
|---|---|
| POLICY_QUESTION | F05 walk/jog race preparation; F06 cross-role repeated adverse; F07 long silence; F08 path after clearance; F09 one-day double conflict; F13 adverse in a consolidation week (witness only) |
| HARNESS_GAP | HG-01..HG-05 confirmed; **HG-06** (new): the client can never send a load confirmation, because it misreads `logged`; **HG-07** (new): the packet renders walk/jog seconds as "undefined" |
| OBSERVATION | F10, F11, F12 (kettlebell steps assume implements the intake does not state) |
| KNOWN_DISCLOSED_RESIDUAL | HV-01 |

## Rubric usability (suggestions, not applied)

**Worked:**
- the authors' independent assessments, written before any output;
- keeping the rubric class (recommendation quality) separate from the taxonomy class (property violations);
- the attribution field.

**Ambiguous:**
- A correctly routed clinical case could be read as CLINICAL_OUT_OF_SCOPE. Then the clinical stratum is never evaluable, and every holdout is INVALID under §7.
- The rubric class "UNSUPPORTED" collides with the runtime status of the same name.
- The case-level class hides mixed cases.
- SUBOPTIMAL is unclear when the policy's principle and its operational rule differ.
- There is no step-level class for an expectation outside the authority.
- Latent defects found only in a judge's witness have no defined standing.

**Suggestions:**
- Judge the routing itself, and count a correctly routed clinical case as evaluable.
- Rename the class to SCOPE_MISROUTED.
- Record step-level classes; the case takes its worst step.
- Add a step-level class EXPECTATION_OUTSIDE_AUTHORITY.
- Add a premise check to VARIANT relations: they must deliver the same facts, or they are NOT_EVALUABLE.
- Limit INVARIANT_ORACLE to registered properties.
- Extend P08's scope to any declared break.
- In the P09 oracle, a confounded run neutralizes only performance and effort.
- A latent defect seen only in a judge witness is a TEST_GAP until a holdout case shows it.
- Add the corresponding coverage to the final brief.
