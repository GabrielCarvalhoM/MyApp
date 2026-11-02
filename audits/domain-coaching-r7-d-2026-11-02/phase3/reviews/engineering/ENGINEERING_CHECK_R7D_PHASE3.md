# R7-D Phase 3: narrow engineering check (`R7D-ENGINEERING-PHASE3-CHECK-1`)

**Verdict: READY_WITH_CONDITIONS.** No blocker. One MAJOR finding, routed with conditions. The structured record is [ENGINEERING_CHECK_R7D_PHASE3.json](ENGINEERING_CHECK_R7D_PHASE3.json); where the two differ, the JSON prevails.

| | |
|---|---|
| Date | 2026-11-02 |
| Judge | Quality & Reliability Engineer, fresh instance, claude-opus-5-5 / xhigh |
| Independence | Did not author the runtime, the fix, its tests, its evidence, the harness, the pre-registrations, the F03-B rule or any earlier R7-D review. Did not open `phase3/reviews/ssctr/`. |
| Candidate | `7039bc1` (runtime bytes of `9e1ecbf`), against R7C-FREEZE-4 `a9654c8` |
| Not reviewed | `d4725e6` (freeze script, verifier, authorization summary). It landed during this check and does not touch `src/`. |

## What was reproduced

All reruns used runtimes rebuilt outside the repository (`%TEMP%\qe-r7d-p3\`).

- **Full suite:** 907/907 (884 frozen + 23 directed).
- **Directed tests on R7C-FREEZE-4:** 22 of 23 fail, each for the expected reason. T9 also passes there, so it is a characterization test, not a RED test.
- **Conformance:** R7-B, R7-B.1 and R7-B.2 all PASS.
- **Harness validation 2:** byte-equal to the committed summary, runs, witnesses, findings and coverage.
  - Following the README literally fails for rt-f3: the B0 record is missing (QE-R7D-P3-13).
- **Regressions:** diagnostic and generated summaries identical to the committed ones.
  - P01–P16: 0 violations.
  - VARIANT: 4/12, the already-triaged set.
- **Differential:** the author's script gives identical rows.
  - My step-level attribution finds every difference attributable to one of the four corrections.
  - That includes 25 generated cases whose only difference is the machine unit (STACK_STEP to KG), which the author's canonical view reports as the same.
- **Mutation:** the author's 6/6 holds (rerun recorded in the JSON).
  - I ran 24 adversarial mutants of my own: 17 are killed, and 7 survive the whole suite (QE-R7D-P3-02).

## Answers

1. **DX-01: PASS with residuals.**
   - Carried day-precision rows keep their instant and local day; the report-before-observation screen still applies.
   - This holds in UTC, UTC-5 and UTC+9. Duplicates, replay, later corrections, `firstRecordedAt` and append-only history behave correctly.
   - Residuals: a same-day correction of a day-precision report is refused (pre-existing); the learning model has the same defect (pre-existing).
2. **Carrier independence: PASS at the declaring decision; the break is not retained after it.**
   - Weekly review and return report give identical decisions, including a re-sent break and a past break followed by training.
   - The other 17 kinds ask. R7C-FREEZE-4 returned a stale VALID on 13 of them.
   - The break is kept only when it is applied (QE-R7D-P3-01).
3. **Machine round trip: PASS.**
   - The full trip works: prescription in KG, log read, record, next week.
   - No machine value that the athlete did not supply appears in any plan. This covers the directed T2 sweep and 7 extra scenarios: race window, taper, returns, fatigue, substitution, pounds, and adverse weeks with no plate that fits.
4. **Confounded semantics: PASS.**
   - Adverse recovery or an impaired next day stays ADVERSE; a confounded run is otherwise CONFOUNDED.
   - Return tolerance becomes more conservative; learning is unchanged.
5. **History, clinical-first, stale VALID: PASS.**
   - Past sessions and decision history are intact.
   - A clinical reason routes clinically on all 19 kinds.
   - No stale VALID appears that R7C-FREEZE-4 did not already produce.
6. **Harness and PREREG-2: no weakening of the success criteria.**
   - PREREG-1 is unchanged, and §4, §8 and §9 carry over verbatim.
   - The oracles measure the four invariants: P10 and RESEND, P08, P16 and P09. Each fires on R7C-FREEZE-4 and is clean on the candidate.
   - P16 is sound but narrow (QE-R7D-P3-05).
   - P07 now reads the race date from the plan it checks (QE-R7D-P3-06).
   - Δ2 is labelled stricter but relaxes one corner by Founder decision (QE-R7D-P3-07).
   - P3-F01 stays strict.
7. **Flagged behaviours: all reproduced. None is a Phase 3 blocker. All three are QE-R7D-P3-01.**
   - **1 (P3-F01):** fail-closed, pre-existing. It is a P05 violation if the holdout exercises it.
   - **2:** after clearance, VALID with long runs of 70 and 75 min against 65 executed, and THRESHOLD in the re-entry week. Identical on R7C-FREEZE-4 and to undeclared silence. No automated property measures it.
   - **5:** asks correctly. If the next decision does not re-send the break, that decision is VALID with the stale plan. R7C-FREEZE-4 did that immediately.

## Findings

| Id | Class | Origin | Finding | Reproduction |
|---|---|---|---|---|
| QE-R7D-P3-01 | **MAJOR** | (a) new ask path, safer than R7C-FREEZE-4; (b), (c) pre-existing | A declared break is retained only by a decision that applies it:<br>(a) another event kind asks, and a later decision without the break is VALID and stale;<br>(b) break plus clinical flag, then clearance: VALID and stale, with quality;<br>(c) a break answer through a clinical carrier is asked again (P3-F01) | `probes/qe-dx02.mjs` E4, E3; validation DEV-17/17b |
| QE-R7D-P3-02 | MINOR | new (test adequacy) | 7 of 24 mutants survive the whole suite: QM10, QM16, QM18, QM19, QM21, QM23, QM24. The probes show correct behaviour for QM16, QM19, QM21 and QM23 | `probes/qe-mutation.mjs`, `probes/qe-f03b-edges.mjs` |
| QE-R7D-P3-03 | MINOR | pre-existing | A same-day correction of a day-precision report is refused (`INVALID_CORRECTION_CHAIN`) | `qe-dx01.mjs` A, A2 |
| QE-R7D-P3-04 | MINOR | pre-existing | DX-01 sibling: same-day day-precision reports never enter the learning model | `qe-dx01.mjs` D |
| QE-R7D-P3-05 | MINOR | new (harness) | P16 checks only KNOWN rows of VALID plans, and only unread exact copies | `harness/lib/properties.mjs` p16 |
| QE-R7D-P3-06 | MINOR | new (harness) | P07 no longer sees an unrequested race-date or goal change | `raceDateTimeline` |
| QE-R7D-P3-07 | MINOR | new (PREREG text) | Δ2 is labelled "Mais estrito", but a confounded UNDER or HARDER run is now favourable (Founder-authorized) | `favourable()` vs PREREG-1 P09 |
| QE-R7D-P3-08 | MINOR | pre-existing | A non-object `interruption` on a weekly review is ignored, VALID and stale (the return carrier asks) | `qe-dx02.mjs` E2 |
| QE-R7D-P3-09 | OBSERVATION | new | A carried day-precision row's `localDate` and `timePrecision` are trusted without a consistency check | `qe-dx01.mjs` B |
| QE-R7D-P3-10 | OBSERVATION | new | A re-sent `interruption` re-applies the return; consistent across carriers and conservative | `qe-dx02.mjs` E1 |
| QE-R7D-P3-11 | OBSERVATION | pre-existing | A consent revocation lapses when not repeated, and the model re-ingests the record. Route to Security | `qe-consent.mjs` |
| QE-R7D-P3-12 | OBSERVATION | new (I-1) | Machine duplicates agree only when equal: 140 vs 141 kg now conflicts | `qe-f03b-edges.mjs` 3 |
| QE-R7D-P3-13 | OBSERVATION | new (docs) | The README's rt-f3 rebuild omits the B0 record, so QE-R7C-10 sensitivity reads NOT_DETECTED | validation rerun |
| QE-R7D-P3-14 | OBSERVATION | new (method) | The author's differential attribution is coarse; the step-level check confirms it | `qe-differential-attribution.mjs` |

**Why QE-R7D-P3-01 is not a blocker:**
- No path is worse than R7C-FREEZE-4.
- The declaring decision is never VALID and stale (19/19 kinds).
- The later stale VALID needs a further event without the break, and equals the undeclared-silence outcome the current authority already accepts.
- The agreed minimal scope allowed "or the decision asks".
- Its domain severity belongs to the SSCTR recheck (question 5), which this check does not override.

## Conditions for the freeze

- **CF-1: bind the evaluated bytes.**
  - The six source files and the directed test file.
  - The unchanged policy, catalog, R6 and B0 records.
  - Both F03-B records.
  - A note that `d4725e6` was not reviewed here.
- **CF-2: disclose QE-R7D-P3-01 (a), (b) and (c).**
  - Record them as known residuals with no envelope in the freeze record and handoff.
  - Before the holdout is commissioned, tell the Founder:
    - the final brief is likely to exercise them;
    - (c) is a P05 violation under PREREG-2;
    - (a) and (b) are measured by no automated property.
- **CF-3: the Δ11 envelopes for flagged behaviours 3 and 4 stand only if the SSCTR recheck accepts them.** Otherwise, remove them in a PREREG-3 before the holdout exists.
- **CF-4: record the mutation survivors as TEST_GAP.** Owner: Engineering; trigger: the next authorized runtime phase. No test change in this phase.
- **CF-5: settle the harness items before the holdout exists.**
  - Either tighten P16 and P07 and fix the Δ2 label in a registered stricter revision, or accept them as TEST_GAP in the freeze record.
  - Tightening only.
- **CF-6: record the consumer conditions.**
  - Re-send a break on its own after `breakCarrierAsk`.
  - Send `interruption` only in the review that declares it.
  - Carry the record as returned.
  - Send the current consent with every decision. Security must accept this as the privacy owner.
- **CF-7: disclose QE-R7D-P3-03, -04 and -08 and route them to the Engineering backlog.**

## Probes

All in `probes/`:

| Probe | What it checks |
|---|---|
| `qe-dx01.mjs` | DX-01 |
| `qe-dx02.mjs` | DX-02 and carriers |
| `qe-f03.mjs` | Machine scenarios |
| `qe-f03b-edges.mjs` | F03-B edges the directed tests do not pin |
| `qe-mutation.mjs` | The 24 mutants |
| `qe-differential-attribution.mjs` | Step-level differential |
| `qe-consent.mjs` | Consent revocation |

Each takes a root that holds `CoachingCore`. Run them on scratch copies, never on the repository.
