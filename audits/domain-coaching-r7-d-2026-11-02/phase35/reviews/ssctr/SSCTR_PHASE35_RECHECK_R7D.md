# SSCTR-R7D-P35-RECHECK-r1: narrow domain recheck of candidate `8e78b8a`

**Disposition: ACCEPT_WITH_CONDITIONS.** The SSCTR side does not block R7D-FREEZE-5. The reference record is `SSCTR_PHASE35_RECHECK_R7D.json`.

**Reviewer.** A fresh SSCTR instance, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: nonclinical only, no human credential, no human or empirical validation. Native dispatch was not verified. I wrote none of the Phase 3.4 or 3.5 work. I did not open `phase35/reviews/engineering/`.

**What I ran.** All runs used my own rebuilds of `8e78b8a`, `46934a0` and R7D-FREEZE-4 (`3edf3c5`), under `ssctr2-p35-20261107-165808-643` in the scratchpad.
- The Phase 3.4 SSCTR probes: on 46934a0 and FREEZE-4 their outputs reproduce byte for byte. On the candidate, only the expected closure cases change, the same set as the author's fidelity record.
- Directed tests on the candidate: 10/10, 40/40, 14/14, 17/17 and 14/14.
- The Phase 3.5 test file on 46934a0: the 7 finding tests fail and the 3 adequacy tests pass.
- My own probe, `probes/p35-recheck.mjs`, on all three runtimes.

No literature was searched: this record makes no new scientific claim.

## Answers

1. **F01 and F02 are closed as stated (CFR2-01 to CFR2-03).**
   - SY1 now equals SY1g: MODERATE 25, TRAINING_NOT_REESTABLISHED.
   - CU3 now equals CU3f: it asks only 2026-12-13 RUN. Answered done, by a plain review or by the correction sent again, it equals CU3fa in stop, labels and every dose.
   - CU1 equals CU1f; LC1 and LC1d ask LC1f's two sessions; CU2 asks CU2f's five.
   - Every other probe case keeps its 46934a0 output. CU2a changes only by construction: it now answers the five sessions asked, and equals CU2b.
   - The "moved a week later" reading (T32) is right. The re-entry history is read without the superseded return, as executedStateAt's rule 1 and the Q7 ruling require. Its stop and strength doses equal the fresh report's.
2. **The domain side of QRE2-P34-01 is acceptable.**
   - **Order.** The start time comes first because rule 0.8 makes it the deciding fact. I6 is asked afterwards only when the state changes, that is, only when the late fact is genuine late evidence (CF-P34-04). RS1 equals the start time stated from the outset. RS2 (start before the lift) keeps the plan.
   - **Confirming first.** It asks the start time once more. The confirmation is kept, and the restatement then applies it, with no later ask.
   - **The rule.** It is right: I1/I3 apply to the same named episode, so a restatement is not a new break. A clinical change is never consumed as a restatement (RS4 routes CLINICAL_HUMAN_REQUIRED). Any other changed fact is still asked, which fails closed.
3. **O-P35-01 is a disclosed, non-blocking residual.**
   - It breaks no re-entry rule and raises no dose above the last executed one.
   - R27 itself was classified low weight and non-blocking by the role's R7-A recheck.
   - Fixing it needs a new R27 / R7-A.2 slot reading, which belongs to the next authorized phase.
   - Δ31 needs one precision. The single-break correction is identical on all three runtimes. In the two-break shape of T32, R7D-FREEZE-4 eased the next quality slot, so there the candidate (like 46934a0) is one eased session less conservative.
4. **HARNESS-7.**
   - P18(c) is right: a superset of the systemic rule that keeps sufficiency.
   - P18(f) is right: R7-C G01 plus the F02 closure.
   - The P17/P08 restatement reading is right: it follows INTERFACE-7 §2.
   - P18(e) has one corner outside the runtime's systemic rule: finding SSCTR-P35-F01.
5. **No new number.**

## Finding

**SSCTR-P35-F01: P18(e) can false-block.**
- Classification: non-blocking for this freeze, binding before any final holdout. New in HARNESS-7, narrow, harness only.
- **What happens.** `adverseConvergence` counts a complete report with recovery ADVERSE and performance OVER. The reducer classifies that report CONFLICTING, and the unchanged systemic rule (BR-Q6) does not count it. On probe SYc1, the candidate re-enters through the week (TRAINING_AFTER), which conforms to the binding rule, yet P18(e) would report SYSTEMIC_WEEK_REENTERED (SAFETY_BLOCKER). The DEV corpus has no such response, so validation 7 cannot see it.
- **Smallest fix.** Count a report only when the reducer reads it ADVERSE: performance not OVER, or the report confounded. Add one DEV false-block control of the SYc1 shape, and restate Δ27's necessary-condition wording, by a PREREG addendum. Fallback: mark the shape NOT_EVALUABLE for P18(e), for the domain judge.

## Observations (non-blocking)

- **O01.** The O-P35-01 disclosure precision and its route (above).
- **O02.** BR-Q6's "adverse or conflicting" matches the run gates; the strength gate holds on ADVERSE only. The runtime conforms to BR-Q4.3 and to BR-Q6's first sentence, so this is text precision only.
- **O03.** O-02's "as one period" wording for a changed-fact report of an earlier break invites the athlete to merge separate breaks. It fails closed and is pre-existing. On the candidate, restating the break resolves it (RS5x).

## Conditions for the freeze

- **CFP35-01.** Freeze exactly the checked runtime and test bytes. Any other runtime or test change returns to a fresh SSCTR instance.
- **CFP35-02.** Disclose O01 to O03. Record SSCTR-P35-F01 as open.
- **CFP35-03.** Close SSCTR-P35-F01 before any final holdout. Until then, a P18(e) unit on a report given with performance OVER goes to the domain judge.
- **CFP35-04.** Carry CFR2-06 unchanged.

## States and queue

- **States:** V1_COACHING_AUTHORITY_READY = NO; FINAL_HOLDOUT_EXISTS = NO; F08_OPEN (BLOCKED_BY_AUTHORITY).
- **Queue:** 235 items, no append. The human revalidation item HQ-R7D-SSCTR-P35-RECHECK is proposed only. It would supersede the proposed P34 recheck item.
- **New prescriptive authority:** none.
