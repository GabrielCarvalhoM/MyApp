# SSCTR recheck of the V1 Run Calibration Extension (fix cycle 0098834)

**SSCTR-V1RC-RECHECK-r1, 2026-11-11. Verdict: READY_WITH_CONDITIONS.** The JSON beside this file is the authoritative record.

- **Who reviewed:** a fresh SSCTR instance (AI, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY). It wrote neither the decision, nor the first review, nor the fix. This is not human, clinical or empirical validation. Clinical judgment stays CLINICAL_HUMAN_REQUIRED.
- **What was reviewed:** values sha256 `d9f7429b…84aa`, verified. Runtime `v1-run-calibration.mjs` is `0eae6521…9f01` and `v1-run-index.mjs` is `a86b6f1e…602e608`, the same bytes in the extract and in the live worktree.
- **What was run:** the four directed test files, 72 of 72 passing. The first round's probes 1 to 6, repointed. My own probes 7 to 9, in `ssctr-recheck-scratch-rc1-9d4a` inside the extract.
- **Literature:** no literature tool was used and no source was opened. Each ruling rests on the decision's sources and on the first review's verified reads. Each new condition only withholds or slows.
- **Host context:** the host injected a CLAUDE.md and a MEMORY.md. I used them for orientation only, never as evidence.

## First-round findings

| Finding | Status | Why |
|---|---|---|
| R-01 | CLOSED_WITH_CONDITION | Symptom stops, stops with no reason, and results reported not tolerated now end test offers and raise the screen at once (probe 1 D, probe 7, journey 24). The conditions are RC-02 and RC-03, plus "act on REQUIRED at once" |
| R-02 | CLOSED | Under ASK, UNASSESSED, an unanswered item or stale eligibility: `NOT_OFFERED [ELIGIBILITY_NOT_CURRENT]` (probes 3 to 6) |
| R-03 | CLOSED | A half in 2:55 inside a marathon block gives a marathon estimate and band `OUTSIDE_MODEL_POPULATION` (probe 1 A, journey 25) |
| R-04 | CLOSED | No inversion across the 10K sweep. LONG is never faster than EASY (journeys 04 and 11) |
| R-05 | CLOSED | Sessions jogged below the cue do nothing. A real slower pair at RPE 7 still steps the band down by 2% |
| R-06 | CLOSED | With ESTIMATE off, the race-pace bands and the 10 km equivalent are unavailable |
| R-07 | CLOSED | The caution and the assumption appear as fields on the estimate, the band and the race day |
| R-08 | CLOSED | Observed bands carry their sessions, dates, window, `validUntil` and uncertainty causes |
| R-09 | CLOSED | Lab values follow the floor. The QRE-06 direct test is the test that tells the cases apart |
| R-10 | CLOSED | Aged evidence with two more reductions gives no capacity |
| R-11 | OPEN (non-blocking) | Not corrected. Carried as a limit with the condition in ruling (c) |
| R-12 | CLOSED | The contract states the declaration order, and a later harder session that week reads `TEST_ALREADY_DONE_THIS_WEEK` |

## Amendments

All four are sound and implemented as written:

- **R-01:** a repeat only after a stop that was not for a symptom.
- **R-04:** ceilings only ever slower.
- **R-07:** the caution carried as content.
- **R-10:** aged evidence counts as one reduction.

## Regression

No sporting rule of the decision is broken. The changes fall into three groups:

- **Changes that bring the runtime to the decision's own text:** week-start recency, corrections next week, longest run as on record, and the heart-rate floor.
- **Changes that only remove faults:** the 2:00 to 15:00 pace window, and the 10 km equivalent shown only with ESTIMATE.
- **Recording:** the engine's HOLD is an integrity refusal. A symptom stop declared in a clinical review is still recorded (probe 9).

The worked examples still reproduce. I checked two by hand: 10K 50:00 HIGH and half 1:50:00 HIGH.

## Rulings

- **(a)** A result that fails capacity qualification on conditions, measurement, effort or unreported tolerance may count for the endurance gates. A result reported as not tolerated may not. Today the runtime counts it (RC-04).
- **(b)** The P1 slow edge resting on one slow run is acceptable: the band is a ceiling only. The copy must never present the slow edge as a minimum.
- **(c)** R-11 needs a future amendment. Longer-than-half evidence whose marathon central exceeds 360 min should be `OUTSIDE_MODEL_POPULATION`. Until then, no marathon estimate, MARATHON_EFFORT band or race-day reference with a central time above 6:00:00 is shown.
- **(d)** Lab values lapsing at a hold or a return: confirmed.

## New findings (all non-blocking)

- **RC-01:** a test is offered two days after a declared out-of-plan race. The offer reads the week in force, but next week is already CALIBRATED HIGH from the race. This was already there on bc40218. Condition: show no offer when next week is CALIBRATED above LOW, or when an actual result is dated within 7 days before the offer.
- **RC-02 (low):** the repeat is allowed when tolerance was not reported. Condition: `stoppedFor` and `tolerated` are required on a stopped test.
- **RC-03 (low):** a correcting row lifts the symptom flag at once. Condition: no correction of `tolerated` or `stoppedFor`.
- **RC-04 (low):** a not-tolerated result opens the half estimate. Condition: while the screen is REQUIRED, take the athlete to it before showing estimates or race-pace bands.

## Boundaries

All four are APPROVE_WITH_CONDITIONS with SUPPORTED_WITH_LIMITS. Their sources and conditions are in the JSON. Records bound to `d9f7429b…84aa` are appended to `SSCTR_V1RC_RUN_RECORDS.json`. The first-round HR record is untouched; it is bound to the old bytes and enables nothing.

Limitation C stays as it is. All of this is synthetic data only. V1 authority NO. The Founder/PCG reading of the finish-time rule is still needed before any athlete-facing use.

**Review by:** 2027-05-11, or earlier on any trigger listed in the JSON.
