# R7-D Phase 5 — request for the two independent judgments of the new sealed final holdout

**What is judged:** the single first evaluation of the new R7-D final holdout (`R7D-FINAL-2`) on **R7D-FREEZE-6**, run by **R7D-HARNESS-9** under **R7D-PREREG-8**. It is the final gate of DOMAIN_COACHING_R7-D (R7D-PREREG-1 §4, §8.7) and, by the Founder's decision, the last R7-D holdout (PREREG-8 Δ57). The coordinator gives no grade: the final status is compiled mechanically from your two records under §4.

**The commits, in order:**
- `c7c72e5`: the reviewed candidate, with the instruments (R7D-HARNESS-9, validation 9, R7D-INTERFACE-8, brief 8, the checkers, the seal, PREREG-8);
- `d569ef2`: the two independent reviews of that candidate;
- `40daadd`: R7D-FREEZE-6, and `aedcd5c`: its verification (25/25), both before the author started;
- `56df0a1`: the sealed corpus, manifests, seals and the H2 sample, with the author's report, before any execution;
- `0ab7bc4`: the evaluation outputs and both manifests with `evaluationCount 1`.

## Inputs

All paths are under `audits/domain-coaching-r7-d-2026-11-02/` unless a path says otherwise.

| Item | Path | sha256 |
|---|---|---|
| Freeze record | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json` | `48536551b85dd885e9055e45d489b64b080a5b5e0f858c00190d34ca55e0e9a5` |
| Pre-registrations | `PREREGISTRATION_R7D.md`, the base (§1 properties, §2 relations, §3 taxonomy, §4 success criteria, §5 rubric, §6 envelopes, §7 corpus errors and critical coverage, §8 protocol, §9 no tuning), then `_2` to `_8`. Each version says everything it does not change still holds; the newest prevails | PREREG-8 `c9f22aef41e03137b7a5b1e21fb026b8f9699f1a66dce8b79f4a3b3125032f54` |
| Phase 5 authorization | `phase5/AUTHORIZATION_PHASE5.md` | |
| Phase 5 candidate reviews | `phase5/reviews/ssctr/SSCTR_PHASE5_REVIEW_R7D_r2.json` (r2 supersedes r1 only by what it adds) and `phase5/reviews/engineering/QUALITY_PHASE5_REVIEW_R7D.json`. Their freeze conditions travel verbatim in R7D-FREEZE-6 (`reviews.ssctr.conditions`: CF1 and the covering disclosures CFD-1 to CFD-5; `reviews.qualityReliability.conditions`: K-P5-F1, K-P5-F2). Their other conditions (SSCTR C1–C4; Quality K-P5-1 to K-P5-3) are in the records | |
| H1 corpus (authored) | `final2/R7D_FINAL_HOLDOUT_2.json`; manifest `final2/FRESHNESS_MANIFEST.json` (seal digest `1a7979df2a018bfd576891de7915cdd159d5f514cf1a2a05df92405a05044ca8`); seal `final2/SEAL.json`; builder `final2/build-final-corpus.mjs` | `24df57049442e1041f2ba09bdb08fccc4de5ccbd2c894bab680f6d33719c9dba` |
| Author's report | `phase5/AUTHOR_REPORT_PHASE5.md`: the case list and coverage mapping as the author claimed them. Check them; do not trust them. The author's interface gaps are also in the manifest (`interfaceGapsNoted`). A step that depends on one is judged with the attribution that fits (§5). Its coordinator preface is structural only, and records one disclosure: the host injected the user's and project's `CLAUDE.md` and the auto-memory index into the author's context at start (hashes in the preface; one-line summaries of earlier phases, no case content, no runtime code or output). The quality judge rules on it (Quality item 2) | |
| H2 sample (generated) | `final2/generated/R7D_GENERATED_FINAL.json`, with its manifest (seal digest `16223c8c1d024a529c6e0efe0177109cfee5a3ff7cf37f9b4f000aa5ea64d5f7`) and seal beside it | `b29dd52a58694143fe94cff3a0a4759bc1dde79948d1d6cabde40b9956e0e19f` |
| H1 evaluation | `final2/evaluation/`: `RUN_REPORT.json`, `DOMAIN_PACKET.md` / `.json`, `SUMMARY.md` | RUN_REPORT `d50493ee3a1b120785ee174300ddd39705e6dcf6c904fcf8e5135a910652d233` |
| H2 evaluation | `final2/generated/evaluation/` (the same four files) | RUN_REPORT `364c6556e762bc36b177a130ec83e43050daafa70e3d610faa9686c2e5302853` |
| Harness | `harness/r7d-harness-9.mjs`, `harness/lib/client-9.mjs`, `harness/lib/properties-9.mjs` and `harness/lib/metamorphic-9.mjs` are the new files (PREREG-8 Δ48, Δ49); every other module is the file R7D-FREEZE-6 binds | |
| Instrument evidence | `harness/validation/HARNESS_VALIDATION_R7D_9.json` (validation 9), `phase5/evidence/` (EVIDENCE_PHASE5, MUTATION_PHASE5, DIFFERENTIAL_PHASE5, WITNESS_GRID_PHASE5, K03_PHASE4_UNITS) | |
| The spent Phase 4 holdout | `final/` and its judgments: read only, for context. Its results are not changed by anything here, and it is never evaluated again | |

**What the H1 run reported** (`final2/evaluation/SUMMARY.md`; these are automated results, not verdicts):
- Evaluated 39/39. Corpus errors 0; structural errors 0 and warnings 0; harness errors 0. Freshness: all checks pass. Runtime 727/727 files equal to the record.
- Automated FAIL units: none. No property and no relation reports a violation.
- Coverage counts as the run reports them (confirm them; a unit lost to CORPUS_ERROR or HARNESS_GAP does not count):
  - relations: CARRIER_CLINICAL 3 applicable cases (3 units), CARRIER_HOLD 2 (2), RESTATE_DECLARED_BREAK 23 (41 units), INSERT_NEWER_BREAK 7 (7); LOAD_CONVENTION_EQUIVALENT has no applicable H1 case;
  - properties: P08 53 units, P17 112 units, P18 70 units.
- Units not evaluable (never a pass):
  - P03: 11 units, reason P03D_SESSION_REPORTED_BY_THIS_DECISION (H01 2, H17 2, H25 4, H33 1, H35 2);
  - P06: 14 units. Reason P06_SESSION_REPORTED_BY_THIS_DECISION: H01 2, H17 2, H25 4, H33 1, H35 2. Reason NO_RUN_REFERENCE_IN_WINDOW: H15 1, H16 2;
  - P08: 2 units, reason NO_EXECUTED_TOLERATED_RUN (H18, H19, whose P08 case result is NOT_EVALUABLE);
  - P18: 1 unit, reason NESTED_OWN_RETURN_RECORD (H08).
- No P17 `WINDOW_ENDED_BY_ROW_NAME` observation; in fact no property observation of any kind. The coordinator counted these; confirm the count.
- Author expectations: PASS 191, FAIL 11, JUDGED 70 (in 36 cases), NOT_EVALUABLE 0, CORPUS_ERROR 0. The 11 FAILs are all DOMAIN_ORACLE (case, step and expectation: expected → observed):
  - H04 s2 e4: STATUS_IN {MODIFY, KEEP} → ASK;
  - H07 s2 e6: STATUS_IN {MODIFY} → CLINICAL_HUMAN_REQUIRED; e7: VALIDITY_IS VALID_WITHIN_CURRENT_BOUNDED_SCOPE → REQUIRES_RECONCILIATION;
  - H17 s4 e6: STATUS_IN {MODIFY} → KEEP;
  - H20 s2 e3: STATUS_IN {MODIFY} → ASK; e4: VALIDITY_IS VALID_WITHIN_CURRENT_BOUNDED_SCOPE → REQUIRES_RECONCILIATION;
  - H32 s2 e2: STATUS_IN {MODIFY} → ASK; s5 e5: STATUS_IN {MODIFY, KEEP} → ASK; s5 e6: VALIDITY_IS VALID_WITHIN_CURRENT_BOUNDED_SCOPE → REQUIRES_RECONCILIATION;
  - H34 s3 e3: STATUS_IN {MODIFY} → ASK; e4: VALIDITY_IS VALID_WITHIN_CURRENT_BOUNDED_SCOPE → REQUIRES_RECONCILIATION.
- H2 (300 generated intakes): 300/300 evaluated; corpus errors 0, harness errors 0; no violation. P06 has 47 units not evaluable (NO_RUN_REFERENCE_IN_WINDOW; the cases are listed in its `SUMMARY.md`). LOAD_CONVENTION_EQUIVALENT has 20 applicable cases, with non-blocking differences in G039, G078, G095, G177, G214 and G231.

## Rules for both judges

**Independence and writes.**
- You did not write the runtime, the harness, the instruments or the corpus, and you did not review the Phase 5 candidate.
- Write only in your own folder (named in your section). Do not edit any other file.
- No deletion of any kind (the Founder's rule): no `rm` and no recursive removal. Rebuild into new, uniquely named scratch directories.

**No tuning (R7D-PREREG-1 §9; PREREG-8 Δ57).**
- Change no runtime, harness, oracle, envelope, rubric, threshold or criterion, and turn no case into a test. The first evaluation is the one that counts, and this holdout is never repeated.
- You may reproduce a mechanism, such as a minimal witness or a rerun of a case without `--first-evaluation`, but only in a **new** scratch directory outside the repository.
- A rerun never names a file under `final2/` or `final/` as `--out`, `--manifest` or `--seal`. Copy what you need into your scratch directory first.
- A new problem the holdout finds is classified by its real consequence for the product. It is never fixed here.

**How to classify.**
- **`NOT_EVALUABLE` is never `PASS`.** It stays in the denominator and is reported as such.
- **Classify by concrete impact** on what the coach prescribes or asks, not by procedural form.
- **Findings use the taxonomy of R7D-PREREG-1 §3.** Each has a class and an origin (NEW, PRE_EXISTING, KNOWN_R7C_RESIDUAL).
  - A finding inside a registered envelope (PREREG-1 §6, PREREG-2 Δ11) or a disclosed residual (PREREG-3 to -8, the Phase 5 disclosures of PREREG-8 Δ56 included) is KNOWN_DISCLOSED_RESIDUAL or CONSUMER_CONDITION, not a new finding. Say which disclosure covers it.
  - A behaviour outside them is a new finding.
- **CORPUS_ERROR (§7):**
  - it removes the affected case from the evidence and never counts against the runtime;
  - say what of the case stays evaluable, if anything;
  - critical coverage lost to it makes the holdout INVALID_HOLDOUT.

**Your verdict and evidence.**
- Give one of READY, READY_WITH_CONDITIONS, NOT_READY or INVALID_HOLDOUT for your side of §4.
- With it, list the blocking findings (if any), the conditions and the residual limitations.
- If your verdict is INVALID_HOLDOUT, still report every confirmed finding on the cases that remain valid, with its class, so that the invalidity hides no confirmed blocker.
- Report the evidence for every claim: case ids, step ids, the decision fields, and the property or relation with its unit.
- Report four tallies separately, never merged: real runtime failures (with their class), CORPUS_ERROR, instrument gaps (HARNESS_GAP, or an interface gap the author noted), and NOT_EVALUABLE units and cases.

## Sports Science / Domain judge (SSCTR, a fresh instance)

Write `final2/judgment/ssctr/SSCTR_FINAL_HOLDOUT_2_R7D.json` and a short `.md` beside it.

1. **Rubric per step, then per case** (PREREG-1 §5 with PREREG-2 Δ10).
   - The classes are BEST_SUPPORTED, ACCEPTABLE_ALTERNATIVE, SUBOPTIMAL, INSUFFICIENT_INFORMATION, SCOPE_MISROUTED, CLINICAL_OUT_OF_SCOPE, UNSAFE, CORPUS_ERROR, NOT_EVALUABLE_DOMAIN and EXPECTATION_OUTSIDE_AUTHORITY. A case inherits its worst step.
   - The reference is the author's `independentAssessment`, written before any output, read against the authorities.
   - For every SUBOPTIMAL or worse, give the cause, the attribution (RUNTIME, CORPUS, AMBIGUITY or AUTHORITY_SCOPE) and whether it is structural (§3).
   - Classify each of the 11 failed author expectations listed above: a runtime failure with its rubric class, an acceptable alternative where the expectation is narrower than the domain allows, CORPUS_ERROR, EXPECTATION_OUTSIDE_AUTHORITY, or an instrument or interface gap. Also classify any JUDGED expectation you find unmet.
   - Clinical routing is judged; clinical content is CLINICAL_OUT_OF_SCOPE.
2. **The DOMAIN_JUDGED parts of the properties:**
   - P07, a completion race without strides;
   - P08, strength and the identity of the break;
   - P09, step size;
   - P12, interference;
   - P14, influence with consent;
   - the P06 and P08 units the H1 run left not evaluable (`SUMMARY.md`): the result of each is yours;
   - every P18 unit `NOT_EVALUABLE` with reason `NESTED_OWN_RETURN_RECORD`: recompute the inner own return from the case timeline (PREREG-6 Δ16, Δ30). The unit's result is yours.
3. **The two Phase 4 blockers on the new cases** (PREREG-8 Δ47):
   - **SSCTR-P4-F01:** wherever a strength exercise was planned and never executed before a moderate or long break, do the entry week and the D49 return steps hold (entry dose of `strengthEntryWeek`, the step limits of `strengthReturnSets`, no progression credited without execution), and do exercises with valid history keep it?
   - **QRE-P4-F01:** where planned runs elapse unreported, is the absence of reports read as unknown, not as proof of no training, in whatever phase the week is?
4. **The Founder's domain questions**, each answered with the cases that show it:
   - the coherence of the running progression;
   - the coherence of the strength progression;
   - interference between the two;
   - the response to fatigue and recovery;
   - preservation of demonstrated capacity;
   - the safety of the return after breaks;
   - no progression without evidence;
   - compatibility with the existing sports authorities: the R6 policy, the B0 catalog, F03B-MACHINE-STEP-r1 and the BR-Q readings.
5. **P17 windows ended by row name (PREREG-7 Δ38, Δ42).** The H1 run lists every P17 window it ended that way as an observation `WINDOW_ENDED_BY_ROW_NAME`. Judge each one. If you reject the reading for a unit, that unit becomes HARNESS_GAP and returns as not evaluated, never in the runtime's favour.
6. **Readings that bind your judgment:**
   - **The X2 path** (PREREG-6 Δ10, Δ19): the Founder did not reclassify it.
   - **The F08 boundary** (PREREG-7 Δ45, kept by PREREG-8 Δ58): F08 is open, and the Founder's D2 direction is not implemented. These expectations are EXPECTATION_OUTSIDE_AUTHORITY:
     - a planned return after a clinical-cause break;
     - a temporary reduction for a clinical-cause complaint.

     The routing is still judged.
   - **O-P35-01's two-break shape** is the disclosed residual (PREREG-7 Δ40 (a)).
   - **The Phase 5 disclosures** (PREREG-8 Δ56 (a)–(f)).
   - **The covering disclosures of R7D-FREEZE-6** (SSCTR r2, carried verbatim in `reviews.ssctr.conditions`; QRE K-P5-3 asks both judges to read these shapes as the SSCTR ruled):
     - **CFD-1:** the step-2 arithmetic: the normal count is the ceiling, and no block is credited for weeks not executed. The Phase 4 illustration "2, 2 and 1" is superseded;
     - **CFD-2:** an exercise performed at a return entry, or in a later return week, without a usable load establishes nothing (D52), takes the effort-guided first establishment while it holds no state, and is set up under D55 once a load is logged (path P9, SSCTR-P5-O01);
     - **CFD-3:** an exercise planned at the entry dose whose session the athlete did not perform establishes nothing (D52); its first exposure, in a later week, is set up under D55 at most at 2 sets at reps in reserve 3 or more, then at most one set more per executed week up to its normal count, with no block credited (path P8, SSCTR-P5-O06). **A credited block, a count above the normal count, or a rise of more than one set in a week on this path is a D55 deviation**;
     - **CFD-4:** when, after a moderate or long return, no exercise in use holds a state (every loaded row performed without a usable load, nothing else reported), the return entry repeats each week and no load question is asked: a known residual (SSCTR-P5-O02), routed onward, not a new failure;
     - **CFD-5:** R7D-INTERFACE-8 §5 (no unreported-training question while running follows a re-entry recipe) rests on the disclosed CC-F05.

     Read each one against the case: a step these texts cover is read as the disclosure says, and a step outside them is judged on its own.
   - **The consumer conditions** that stay binding (SSCTR r2 C1, from Phase 4 CND-4): a REQUIRES_RECONCILIATION projection is never presented as a prescription; reports sent under an eligibility clinical flag are re-sent or re-asked after clearance (C3 with R5); the P12 same-turn confirmation; the G03 wording of the reason-screen question and of the R4 HOLD. A behaviour they cover is a CONSUMER_CONDITION.
7. **Coverage validity, domain side.**
   - Say whether each required coverage item is met by valid, evaluable cases, after any CORPUS_ERROR. The items are those of PREREG-2 Δ9, -3 Δ6, -4 Δ5, -5 Δ3, -6 Δ5, Δ18, Δ29 and -7 Δ44; PREREG-8 Δ53 keeps their minima and clauses.
   - Each clause says what a missing item means.
8. **Scientific blockers** (SCIENTIFIC_BLOCKER, UNSAFE) **and the domain verdict.**
   - Your authority is your provisional internal nonclinical authority. Claim no human or empirical validation, and add no new number.
   - Any queue item is proposed only.

## Quality / Reliability judge (a fresh instance)

Write `final2/judgment/quality/QUALITY_FINAL_HOLDOUT_2_R7D.json` and a short `.md` beside it.

1. **Freeze integrity.**
   - The evaluated runtime bytes are R7D-FREEZE-6: in each RUN_REPORT's `runtime` block, the files are equal and `runtimeDiff` is empty.
   - You may run `node CoachingCore/scripts/verify-r7d-6.mjs --suite` read-only. Never pass `--write`.
   - Its `no-new-holdout` check fails by design now that `final2/` exists. Nothing else should fail.
2. **Protocol integrity.**
   - The corpus bytes and the manifest seal digests match the seals.
   - `authorStartedAt` is after the freeze and after the instrument commit.
   - The seal commit precedes the evaluation.
   - Each manifest shows `evaluationCount 1` and names its report hash.
   - The outputs were written once, with `--first-evaluation` and new directories.
   - The harness and pre-registration the seal binds are the ones committed in `c7c72e5` and bound by R7D-FREEZE-6.
   - The author is a fresh instance that did not write the runtime, the harness or an earlier corpus and did not review the Phase 5 candidate (PREREG-8 Δ55); its manifest's `inspectedFiles` and `commandsRun` stay inside the brief's allowed inputs.
   - The author's disclosure of the host-injected session context (the user's and project's `CLAUDE.md` and the auto-memory index; their hashes are in the preface of `phase5/AUTHOR_REPORT_PHASE5.md`, and none of the three changed after `authorStartedAt`). Rule whether it affects the holdout's validity, and why.
3. **Instrument reliability.** Any harness defect you find is HARNESS_GAP (PREREG-1 §3). Confirm:
   - R7D-HARNESS-9 differs from R7D-HARNESS-8 only as PREREG-8 Δ48 and Δ49 state (diff the files);
   - the K03 changes return a unit they stop reading as NOT_EVALUABLE, never as PASS;
   - validation 9: no false block, 28/28 sensitivity rows, reachability REACHED, 60/60 witnesses;
   - **K-P5-2 (QRE-P5-F03):** HARNESS-9's P06 twin drops a same-day reported session without listing it when later runs of that week remain. Run a read-only accounting on the evaluated H1 traces (for instance a copy of `phase5/reviews/engineering/probes/qre-p5-k03-units.mjs`, in your scratch directory), and classify by hand every such session: one above its ceiling is a HARNESS_GAP finding, not a pass. Report the count, or 0.
4. **Properties and relations.**
   - Confirm each automated FAIL in H1, H1-M and H2 as a runtime violation, a HARNESS_GAP or a CORPUS_ERROR, with its mechanism.
   - Rule on each structural error the harness reported.
   - Cover:
     - data integrity;
     - decision consistency;
     - idempotence: RESEND, DUPLICATE_SECOND_SOURCE, and the re-sends and duplicates in the corpus;
     - record corrections;
     - determinism;
     - questions with no exit: an ASK the athlete cannot leave with any answer the interface allows, as distinct from a question the timeline simply left unanswered;
     - silent state changes (P03, P10);
     - regressions and property violations.
5. **Coverage units.** Each clause names its consequence. A unit lost to CORPUS_ERROR or HARNESS_GAP does not count. The registered units are:
   - CARRIER_CLINICAL > 0, CARRIER_HOLD > 0 and P08 ≥ 2 (PREREG-2 Δ9);
   - P17 ≥ 4 and RESTATE_DECLARED_BREAK > 0 (PREREG-3 Δ6);
   - P18 ≥ 2 and INSERT_NEWER_BREAK > 0 (PREREG-4 Δ5);
   - P18 ≥ 2 in the cases of PREREG-5 Δ3, and in the first two groups of PREREG-6 Δ5.

   Then check the case-level critical coverage (PREREG-1 §7; PREREG-2 to -8) against the cases, not against the author's mapping. List every unit not evaluable.
6. **The quality verdict**, with the blocking findings, the conditions and the residual limitations.
