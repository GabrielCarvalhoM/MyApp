# R7-B.2 — SSCTR review on R7B2-FREEZE-1 (R7B2-SSCTR-r1)

This is the one SSCTR review of this gate (contract §5, reopened by QE-R7B2-01; §10 bounded loop). It judges the sports-science adequacy of a routing consequence. It does not judge clinical content.

| | |
|---|---|
| Reviewer | A fresh instance of `sports-science-concurrent-training-reviewer` (SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, protocol SSCTR-EP-1.0.0), dispatched in supervised session 6. Model claude-opus-5-5 (inherited), effort xhigh. My instructions match the body of the project adapter, and I have no Agent tool. Registration as the native agent type cannot be verified from inside the instance. |
| Independence | I am not the author of the runtime, the fix or its evidence, and not the Engineering or Quality judge. The interrupted run-5 files in `probes/` were not modified and are not relied on. |
| Authority | PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY only. This is not human, empirical or clinical validation, and no clearance. |
| Record | [SSCTR_REVIEW_R7B2.json](SSCTR_REVIEW_R7B2.json); my probes are in [probes/r1/](probes/r1/), their outputs in `probes/r1/out/` |

## Identity

- **Freeze.** R7B2-FREEZE-1, record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`, matching the request. Freeze commit `1a1c728`; worktree HEAD `9269164`.
- **Digests.** Source `57512322…ecbd`, manifest `f9c5bd5a…ceca`; 122 files, 799 tests.
- **Verifier** (`node CoachingCore/scripts/verify-r7b2.mjs`, read-only):
  - before, with `--tests`: 35/35 PASS;
  - after the probes and the cleanup: 34/34 PASS, same digests;
  - after these two files: 34/34 PASS (below).
- **Predecessor.** R7B1-FREEZE-2 was extracted with `git archive 146ebb8` (full tree) into the new directory `%TEMP%/r7b2-ssctr-r1-s6-pred`, with `node_modules` copied in.
  - Its record sha256 is `e75a2799…4f27d5`, and `verify-r7b1.mjs`, run inside that tree, gives 24/24 PASS.
  - It was deleted after the probes. No other directory was touched.
- **Delta.** Only `src/r6-adaptation.mjs` changed (+32 / −8): the precedence point, and the two handler screens moved verbatim into shared functions.
  - Policy (R6-POLICY-5) and catalog (R7B0-CATALOG-2, B0 r2 records) are byte-identical in both freeze records.
  - The human queue (230 entries, `95ea4b92…`), governance and the closed B0, B and B.1 audits are unchanged since the R7-B.1 closure.
- **Final verifier run after writing this review:** 34/34 PASS without `--tests`, same source and manifest digests, HEAD still `9269164` (`probes/r1/out/verify-r7b2-after-deliverables.json`, sha256 `57773fa3…5194`).

## The case, reproduced

I copied the Engineering probes `dual.mjs`, `s5-factual-proposal.mjs` and `s5-downstream.mjs` verbatim (sha256 equal) and ran them on both runtimes. The outputs are identical to the Engineering record in every field except the run timestamp.

My own probes:
- `q3-resolution.mjs` runs six step variants on both runtimes, each followed by the same later reviews:
  - **A:** the same id + "Flu illness" + correction;
  - **B:** the same without the correction;
  - **C:** a new id + "Flu illness" + correction;
  - **D:** substitution pain + correction;
  - **E:** the correction alone;
  - **F:** nothing.
- `week4-context.mjs` shows the week-4 rows the correction refers to.
- `q4-other-rows.mjs` covers the K6, K6b, CAND-02 and CAND-01 rows, with their follow-ups.

**What the case is.** The resend under the return's own event id restates the week-3 interruption as "Flu illness". The correction restates week 4, the first week after the return at one set per exercise and RIR 3, with:
- performance UNDER;
- recovery ADVERSE;
- effort HARDER;
- next-day function IMPAIRED.

That is a suspected illness with a new functional limitation on return.

## Q1 — Is withholding the re-plan acceptable? Yes. It is required, and FREEZE-2 was the defect.

**Decisions, reproduced.**
- **FREEZE-2 (S5R2):** ASK about the report id, with the re-plan `439a61ba…` and pending ASK. S5R8 is the same through the block-choice question.
- **R7-B.2:** "The interruption reason is clinical or possibly clinical (flu, illness): qualified assessment is needed; no nonclinical return recipe". CLINICAL_HUMAN_REQUIRED, no proposal, pending CLINICAL_HUMAN_REQUIRED.

**What the athlete is prescribed while the route is pending.**
- **On FREEZE-2,** the athlete gets the re-planned program, offered with a bookkeeping question:
  - week 5 strength goes from 3×12@20 (goblet squat), 3×8@22 and 2×10@22 to 2×10@20, 2×8@22 and 1×10@22;
  - the runs are unchanged.

  The illness is not carried: the next review carrying FREEZE-2's state returns KEEP with no clinical dependency (q3 A/F1). That is a reduced dose offered in place of referral. SSCTR-05 forbids exactly this: "do not suggest a dose or generic deload as a substitute for referral".
- **On R7-B.2,** nothing new is prescribed:
  - the plan validity is REQUIRES_RECONCILIATION;
  - the dependency is sticky: the next review carrying the state returns CLINICAL_HUMAN_REQUIRED, "A prior clinical dependency remains outside this nonclinical reference; no automatic clearance", with no proposal.

  The rows already in the program are not re-authorized while the route is pending.

**Consistency with the authorities.**
- **B0-C06 condition 8:** "passes the clinical screen first: pain, injury, illness or a functional limitation routes CLINICAL_HUMAN_REQUIRED for the dependent scope". For an illness return, the dependent scope is the whole return, so the whole re-plan is withheld.
- **D08:** "Flu illness" routes to clinical.
- **QE-R7B1-01:** a clinical route is the decision, with no proposal.
- **`withFactualReplan`:** "A clinical route proposes nothing (no dependent prescription)".

**The predecessor already decided this for the same facts.** For the same facts under a new id (S5R4, q3 C) and for substitution pain with the same correction (S5R5, q3 D), FREEZE-2 routes to a human and proposes nothing. R7-B.2's output for QE-R7B2-01 is identical to the predecessor's own path C:
- the same reason;
- the same week-5 rows;
- the same weeks 5–11 after the week-5 review.

**Counterargument tested.** "FREEZE-2 was more conservative (fewer sets)." I reject it:
- Conservative is not automatic reduction (SSCTR-04).
- The reduction was a dose in place of referral.
- FREEZE-2 also dropped the clinical dependency.

**Literature.** Access was partial. I read the PubMed record of the IOC consensus on acute respiratory infections (S1, PMID 35863871), whose clinical sections include return-to-sport guidance. I also read the abstract of Snyders et al. 2023 (S2, PMC9770013): return to training after infection varies, and symptom number predicts it. The authors offer their data to "assist physicians as well as athletes/coaches in planning and guiding RTT".

These sources support SC-1, SUPPORTED_WITH_LIMITS: return after an acute respiratory illness is an individual, medically guided decision. For this athlete it is OUT_OF_SCOPE_CLINICAL. No full text was read, and the conclusion does not depend on these sources; they corroborate only.

**Confidence.** HIGH for the routing judgment.

## Q2 — Only routing changed; no prescriptive record changed. Confirmed.

- **No rule changed.** No dose, progression, selection, substitution, taper or deload rule changed. The diff is the decision step's precedence point and screens moved verbatim; policy and catalog are identical.
- **Same facts, same prescriptions.** The prescription difference against FREEZE-2's same-id output comes only from which decision is returned. A clinical route, which proposes nothing, replaces a question that carried the re-plan. For the same facts, R7-B.2 prescribes exactly what the predecessor already prescribes for them under a new id (q3 A on R7-B.2 equals q3 C on FREEZE-2, step and downstream).
- **Every nonclinical path is identical on both runtimes:**
  - S5a, S5e, S5g, S5i, S5R1, S5R6 and S5R7;
  - q3 E and F, through weeks 5–11;
  - the q4 controls.
- **The predecessor's clinical paths C and D** are identical on both runtimes in every follow-up.
- **Records.**
  - R7B-SSCTR-RETURN (R7B1-SSCTR-r2) approved returns and evidence corrections with the clinical screen first. FREEZE-2's S5R2 output sat inside its bytes but against its own condition. R7-B.2 brings the bytes into line and narrows nothing the record approved.
  - No R7-B0, R7-B or R7B1-SSCTR-r2 prescriptive record changes in meaning. I considered the seven R7B1-SSCTR-r2 records, the 13 R7B0-SSCTR-r2 records including B0-C06, and D08.
  - **No record needs a new revision.** The records stay bound to their own targets. This review attests, without re-approving, that their prescriptive content is unchanged on R7B2-FREEZE-1.
- **Queue.** No human-queue entry is proposed, and the queue stays at 230.

## Q3 — Deferred or dropped? Deferred to the next whole-week review; not re-planned for the rest of the current week. Pre-existing (SSCTR-R7B2-01).

What I checked (q3, on both runtimes):

1. **Recorded.** After the clinical route, `actualLedger` carries the corrections and supersedes the originals.
2. **While pending** (state carried): sticky CLINICAL_HUMAN_REQUIRED and no proposal, on R7-B.2 A and on both runtimes for C and D.
3. **What "resolved" means in the runtime.** `evaluateProgram` has no clinical clearance path, correctly, since there is no AI clearance. The only continuation is a later review admitted without the carried pending state.
4. **The rest of the week, after that.** Three kinds of later review in week 5 all give **KEEP with no proposal**:
   - a review with no reports (F2);
   - one that sends the same correction rows again (F3);
   - one that sends a correction of the correction with identical facts (F4).

   This holds on R7-B.2 A, and identically on both runtimes for C and D. The week-5 rows stay as planned before the correction:
   - goblet squat 3×12@20;
   - db-bench-press, db-row and db-rdl 3×8@22;
   - db-split-squat 2×10@22;
   - two sets of calf raise and dead bug.

   The correction applied at once (E) gives one set fewer on each, and goblet squat 2×10@20. The cause is that the factual re-plan fires only on a review whose own reports move this week's PlanningView (`viewMovedBy`), and the correction is already in the carried record.
5. **The next whole-week review reads it.** After week 5 is executed and reviewed:
   - weeks 6–8 differ from the same path without the correction (A ≠ B, A ≠ F);
   - week 6 carries the corrected volume: 2 sets per main exercise, against 3 without the correction.
6. **Late evidence** after a clinical route is asked again by a later review with no signal and no state, and the late report stays recorded (q4 K6-after, identical on both runtimes).

**Judgement.** Acceptable for this gate. Withholding while the route is pending is required (Q1). The remainder-of-week gap:
- is pre-existing, identical on FREEZE-2 for C and D;
- is bounded to one week;
- is reachable only after an external resolution that the runtime does not define;
- keeps rows the approved rule produced from the facts as first reported;
- is not a bypass of clinical-screen-first.

It is not a U5 item. A narrow fix would either attach a dose to a clinical route, which is forbidden, or change the factual re-plan trigger shared with the predecessor's own clinical paths, which falls under the contract's stop conditions. It is routed.

## Q4 — The other changed decisions. No sports-science concern.

**Every changed row goes from a nonclinical ASK to CLINICAL_HUMAN_REQUIRED, with no proposal on either side:**
- S5b, S5c, S5f, S5h and S5R3 (s5-factual-proposal);
- the K6 rows: pain, injury, clinical text, pain + ladder step, pain + unrecognised choice. FREEZE-2 was missing `interruption.episodeId` or `choices`. The late report is recorded;
- K6b's second step;
- CAND-02 with the same id and an illness, the INJURY category or a clinical flag. FREEZE-2 was missing `event.id`;
- CAND-01 with pain or illness and the correction. FREEZE-2 was missing `event.date`. The correction is recorded.

**What each replaced question was.** Each was bookkeeping or scheduling: an interruption confirmation, a report identity, a block choice or an event date. The clinical route is at least as restrictive, since it proposes nothing either, and it adds the referral and the sticky dependency.

**Nothing nonclinical is lost:**
- R7-A's question comes back once no clinical signal or state is carried;
- the nonclinical controls keep their questions.

**The one other differing row.** CAND-02-after, carrying the state, differs only because the carried state is now correctly clinical, under the unchanged sticky rule.

**Scope.** The substitution route stays scoped to the named exercise, as in the predecessor (S5d, S5R5).

## Findings

| Id | Severity | Origin | Blocks | Owner |
|---|---|---|---|---|
| SSCTR-R7B2-01 | MINOR | Pre-existing: QE-R7ADA-01 (`withFactualReplan`) with the factual re-plan trigger (`viewMovedBy`, Property B). Identical on FREEZE-2 for a new-id illness report and for substitution pain; B.2 extends its reach to the same-id resend | No (routed) | Next runtime mission (Engineering), with SSCTR (dose reading) and Data (state semantics) |
| SSCTR-R7B2-02 | OBSERVATION | Pre-existing: the reference continuation state and the clinical boundary design | No (routed) | Founder/Product (service model), with Engineering (input contract) and the qualified-human route |

**SSCTR-R7B2-01: a correction recorded by a clinically routed review is applied only at the next whole-week review.**
- **Consequence.** For the rest of that week, the rows planned from the facts as first reported stay: one more set per strength exercise at RIR 3, the same loads, and goblet squat 3×12@20 instead of 2×10@20. Logs of that remainder are judged against rows planned from facts that no longer stand. Runs are unaffected.
- **Evidence status.** PLAUSIBLE_BUT_UNCERTAIN (SC-3) that this harms a nonclinical adult little. That is why it is MINOR. In this scenario the decision is human anyway.
- **Next action.** Decide how corrections recorded under a clinical route re-enter the planning of the sessions still ahead when a review is next admitted without a pending clinical dependency, without attaching anything to the clinical route.

**SSCTR-R7B2-02: no runtime input represents a human resolution of a clinical dependency.** The only continuation is a review without the carried state. The program then keeps no record of the clinical reason, because a clinical route records nothing. What a documented human resolution looks like as an input is undefined. No clearance path or clinical reading is proposed here.

**Routed findings received.**
- QE-R7B2-03, the reading of structured clinical keys, is routed to SSCTR. It is outside Q1–Q4, and B.2 may not add a clinical reading, so it is not decided here. It stays with SSCTR and the next runtime mission.
- QE-R7B2-02 stays routed as recorded.

## Conditions

1. **C1.** SSCTR-R7B2-01 is resolved by its owner before any use beyond the offline synthetic reference. It needs no B.2 correction cycle.
2. **C2.** No later change may resolve SSCTR-R7B2-01 by attaching a factual re-plan or any dose to a CLINICAL_HUMAN_REQUIRED decision (QE-R7ADA-01; SSCTR-05).
3. **C3.** The R7B1-SSCTR-r2 conditions and routed findings stay with their owners, unchanged: F12 (decision half), F13, F14, F6, F7, F8, F10 and R18. So do QE-R7B2-02 and QE-R7B2-03.

## Records, queue, validation and re-review

- **Records.** No SSCTR record needs a new revision. This review produces no decision record and approves no prescriptive item.
- **Queue.** Proposed queue entries: none. The queue is unedited at 230 entries.
- **Validation.** The skill's `validate_records.py` could not run: no Python interpreter is installed, only the Windows Store alias. No schema validation is claimed.
- **States.** Gate: reviewed; no G01–G04 closure. Publication: NOT_PUBLISHED. Human, empirical and clinical validation: none.
- **Re-review triggers:**
  - any change to the precedence point, the shared screens, `withFactualReplan`, `factualReplan`/`viewMovedBy` or `withReference`;
  - the resolution of SSCTR-R7B2-01 or SSCTR-R7B2-02;
  - a new systematic review or consensus on return after acute illness;
  - any use beyond the offline reference.

## Rules kept

- **Writes.** I wrote only under `reviews/ssctr/`: `probes/r1/` and these two files.
- **Scripts.**
  - Verifiers ran only without `--write`.
  - No mutate or freeze script, no `npm run verify`, no reinstall.
  - The Engineering probes ran only from copies.
- **No commit and no state-changing git operation.**
- **Cleanup.** The temporary tree was mine and new, and it is deleted. No background command is left running.
- **Clinical content.** No clinical keyword, flag, threshold or clearance path was proposed.

R7B2_SSCTR_GATE = ACCEPT_WITH_CONDITIONS
