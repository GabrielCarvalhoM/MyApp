# SSCTR second fresh recheck, R7-D Phase 3.4 (`SSCTR-R7D-P34-RECHECK-r2`)

**Candidate:** `46934a0`, with the runtime bytes of `77768e6`:
- `r6-adaptation.mjs` `c98eb081…`;
- `r6-composition.mjs` `8aa5f950…`, unchanged since `1978cc4`.

**Judged against:**
- the CFR-02 expectations of `SSCTR-R7D-P34-RECHECK-r1`;
- `SSCTR-R7D-P34-DECISION-r1`, the binding readings BR-Q1 to BR-Q6 and the Q7 addendum ruling.

**Disposition: BLOCK.** This blocks freezing `46934a0`. It does not block direction A, and it does not reopen SSCTR-P34R-F01 to F04: all four are closed as stated. The phase's one correction cycle is used, so per the request the phase closes with the two blockers below, named and routed.

The structured record is `SSCTR_PHASE34_RECHECK2_R7D.json`. It is the reference; this page summarizes it.

## Who and how

- **Instance.**
  - A second fresh SSCTR instance (claude-opus-5-5, xhigh).
  - It did not write the decision, the first recheck, the runtime, the tests, the harness, PREREG-6, INTERFACE-6 or the evidence.
  - Of `reviews/engineering/` it read only the items QRE-P34-03, -05 and -06.
- **Dispatch and review.** Native adapter dispatch versus default-instance fallback is not verified. No human review occurred.
- **Literature.** None was searched: this recheck makes no new scientific claim. CL1–CL7 are relied on as recorded.
- **Rebuilds.** Own rebuilds in a new scratch directory, `ssctr-recheck2-p34-20261107-121154-11283`, made with `git archive`:
  - `46934a0`, `1978cc4` and `3edf3c5` (R7D-FREEZE-4);
  - a mixed root: the `1978cc4` runtime with the `46934a0` harness.

  Nothing was deleted, and the coordinator's rebuilds were not touched.
- **Reruns.** The first recheck's probes and the decision's probes, run on `1978cc4` and R7D-FREEZE-4, reproduce the recorded outputs byte for byte.
- **Directed tests on my rebuild.** Phase 3.4 40/40, Phase 3.3 14/14, Phase 3.2 17/17, Phase 3.1 14/14.
- **HEAD.** It moved to `c3a9a00` while I worked. That commit changes only `CoachingCore/scripts/freeze-r7d-5.mjs`; src, tests and harness are unchanged.

## Answers

1. **CFR-02 closure: met, for every stated expectation.**
   - **C5 = C5f.** Both give SHORT 4, OWN_RETURN, EASY 50/41, LONG 65, back-squat 1x7 ESTABLISH. Only the ids and the count of applied returns differ, by construction. On `1978cc4` this was LONG 33 RESTART.
   - **RT1o = RT2o.** Both give MODERATE 25 TRAINING_NOT_REESTABLISHED, EASY 15/15, LONG 20.
   - **RT1.** OWN_RETURN, with RUN null and STRENGTH re-entered on 2026-12-21. It equals W2.
   - **RW and RWo.** Both give TRAINING_AFTER, SHORT 4, at the full re-entry doses. P18(c) no longer flags RWo, and it still flags RWo on the `1978cc4` runtime.
   - **SD1.** ASK `interruption.startedAt`, with `question {episodeId: sd1-A, startDate: 2026-11-16}`. Nothing is applied. The question is answerable:
     - a start time after the lift gives SD2's reading;
     - a start time before the lift gives the default reading.
   - **Everything else is unchanged:**
     - the 18 other cases of `p34-recheck.mjs`;
     - all of `p34-ssctr.mjs` and `p34-ceiling.mjs`;
     - R-F08-1, which still holds on F1–F3.

   **But two shapes outside those probes deviate.** They are F01 and F02 below.
2. **QRE-P34-01: yes, this is CF-P34-02's reading.** A correction is read by the same rules as a first report: with no first day, from its length and last day; with no last day, as ending the day before the review (readBreak).
   - T26 passes.
   - A length-only correction sent two days later (LC1) equals the same correction with its dates stated (LC1d). On `1978cc4` both held, with "Invalid time value".
   - Caveat (a): INTERFACE-6 should say that a correction without a last day is read as ending the day before its review.
   - Caveat (b): both LC1 and LC1d inherit F02. They apply without asking about Mon–Tue of week 6, which the fresh report (LC1f) asks about.
3. **CFR-03: complete in substance.** The F04 substance, the full holdout-scoring recommendation, O01 and O02 are all disclosed. Precision gaps, non-blocking (O01 of this record):
   - "(o P18(c) já cobra)" overstates the coverage: P18(c) reads only nominal weeks;
   - SSCTR-P34R-O01 should also name the half-length touch (RT1), and say that week 9 on those paths is also above R7D-FREEZE-4;
   - the routed items need the dispositions below.
4. **CFR-05: yes.** P18(a) under the completion rule matches BR-Q4 and stays a necessary condition:
   - the gates hold every PARTIAL gated or strength row;
   - the race keys now require a non-partial report;
   - a finished race is never partial;
   - optional sessions are still excluded, and P18(c) is unchanged.

   Sensitivity is confirmed on the mixed root: the `1978cc4` RT1o and RT1, both TRAINING_AFTER, now read `P18a_RUN false`.
5. **Routed items:**
   - **QRE-P34-03: answered.** The record content is conformant to BR-Q1.4, which requires only the top-level `ownReturn` and inner labels. Richer nested records would be an explainability improvement (Chief, Product/UX, Data); T30 now pins the field.
   - **QRE-P34-05: answered.** The runtime is conformant to the binding text (BR-Q1.2(a), BR-Q4.4, BR-Q4.5): a sport whose sessions are all marked unavailable is not "planned" that week. This is pre-existing and identical on R7D-FREEZE-4. The mirror case, with the runs marked unavailable, is bounded by the single-run ceiling (EASY 15/15, LONG 15). I accept it as a disclosed residual of the SSCTR-P34-F04 family (O02). Changing the reading would be a new binding reading, for the Founder or PCG with the per-sport return classes.
   - **QRE-P34-06: answered.** The runtime is conformant to BR-Q4.4 verbatim: a week whose running is only optional re-enters strength alone. That is intended, and it is conservative for running.
   - **QRE-P34-07:** PCG's; left routed and open.
6. **New numbers: none,** in the cycle or in the closures this record asks for.

## Blocking findings

Both are runtime-only and use existing authority. Neither needs a number, and no registered harness reading flags either one.

**SSCTR-P34R2-F01 (MODERATE).** Introduced by the F03 fix; F01 direction.

| | Race week with no gated run (touch, optional shakeout, race) | The same week with a gated easy run |
|---|---|---|
| Strength **and** optional shakeout adverse: systemic (SY1 / SY1g) | **SHORT 4, OWN_RETURN, running re-entered**: RECOVERY_EASY 30, EASY 34/35, LONG 40 | MODERATE 25, TRAINING_NOT_REESTABLISHED, 15/15/15/20 (all three runtimes) |
| Strength adverse only: not systemic (SY0 / SY0g) | SHORT 4, OWN_RETURN, running re-entered | the same |

- **What goes wrong.** On the race-key path, `raced()` never reads the week's systemic flag. Without a gated run, nothing else holds running, so the systemic signal has no effect.
- **What the binding reading says.** BR-Q3.2(1), BR-Q4.2 and BR-Q6: converging adverse responses hold every gate, so neither sport is re-entry-complete.
- **Closure.** Running never re-enters through a week the systemic rule holds. SY1 should equal SY1g.

**SSCTR-P34R2-F02 (MODERATE).** Inverse direction. The masking pre-exists in the correction re-read; it becomes decisive once SSCTR-P34R-F01 is closed.

- **What goes wrong.** `unreportedBetween` treats the days of every recorded return as known stop days. During a named correction, that return is the report being superseded. So the sessions a correction uncovers are neither asked about nor read as unknown; they count as missed.
- **The decisive case, CU3.** The trip is first reported as Sunday of week 5 to Thursday of week 6, then corrected to Monday to Thursday. Week 5's Sunday long run is left unreported.

  | Path | Result |
  |---|---|
  | Corrected report, Sunday unreported (CU3) | **LONG 32 RESTART**, no question |
  | Fresh report, Sunday unreported (CU3f) | asks about the Sunday long run |
  | Fresh report, Sunday done (CU3fa) | SHORT 4, OWN_RETURN, EASY 50/34, LONG 65 |
  | Corrected report, Sunday done (CU3a) | SHORT 4, OWN_RETURN, EASY 50/34, LONG 65 |

- **Other shapes.**
  - CU1 and LC1 are applied without the question their fresh reports ask.
  - CU2's question lists 2 of the 5 sessions the fresh report lists. Once answered, it ends in an existing date question, so it fails closed.
- **Authority.** The Q7 ruling (a correction supersedes only the report it corrects), CF-P34-02, BR-Q1.2(c), I9 and R7-C G01.
- **Closure.** The superseded report never masks days in the re-read, and uncovered sessions are asked about as a fresh report asks. CU3 should equal CU3f.

## Conditions for freeze

These apply to any later candidate derived from `46934a0`.

- **CFR2-01.** Close F01 as stated, with a directed test that is RED on `46934a0`.
- **CFR2-02.** Close F02 as stated, with a directed test that is RED on `46934a0`.
- **CFR2-03.** Nothing else changes:
  - the SSCTR-P34R-F01 to F04 closures verified here;
  - the QRE-P34-01 reading;
  - T1–T30 and the conformance anchors;
  - every other probe case, which keeps its `46934a0` output in `probes2/out/`.
- **CFR2-04.** Before any holdout, add a sensitivity row for SY1 and for CU3 through an append-only PREREG addendum. If no automated detector is feasible, list both as critical coverage for the domain judge and disclose the gap. Never weaken an existing property.
- **CFR2-05.** Disclose SSCTR-P34R2-O01 and O02.
- **CFR2-06.** Carry CFR-04 and CFR-06 of r1:
  - no new numbers; shadow reference only;
  - V1 authority NO; no human or empirical validation;
  - F08_OPEN, BLOCKED_BY_AUTHORITY; R-F08-1 checked;
  - the Phase 3.4 queue items stay proposed.
- **CFR2-07.** No freeze of `46934a0` in Phase 3.4.
  - F01 and F02 route to the next Founder-authorized phase.
  - Their closure is objective, and a fresh SSCTR instance checks it narrowly.

**Proposed human revalidation:** `HQ-R7D-SSCTR-P34-RECHECK`, revision r2, is proposed only; it replaces the r1 proposal. The queue was not read or touched. The item can be appended only after a freeze binds a candidate with F01 and F02 closed and accepted.

## Files

- `ssctr/SSCTR_PHASE34_RECHECK2_R7D.json`: the structured record.
- `ssctr/probes2/p34-recheck2.mjs` and `ssctr/probes2/p34-recheck2-detectors.mjs`.
- `ssctr/probes2/out/`:
  - the first recheck's probes on the candidate: `p34-recheck`, `p34-recheck-detectors`, `p34-ssctr` and `p34-ceiling`, each `.CANDIDATE-46934a0.json`;
  - `p34-recheck-detectors.RUNTIME-1978cc4-HARNESS-46934a0.json`, the CFR-05 sensitivity check;
  - `p34-recheck2` on the three runtimes: `.CANDIDATE-46934a0`, `.CANDIDATE-1978cc4` and `.R7D-FREEZE-4`;
  - `p34-recheck2-detectors.CANDIDATE-46934a0.json`.
