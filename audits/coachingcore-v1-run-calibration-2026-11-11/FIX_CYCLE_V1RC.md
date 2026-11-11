# V1 Run Calibration Extension: the single fix cycle

After the independent round on `bc40218` (SSCTR NOT_READY, QRE NOT_READY). This is the one directed cycle the mission allows; its recheck follows and there is no second cycle.

Tests: `test/v1rc-review-fixes.test.mjs` (SSCTR findings) and `test/v1rc-review-fixes-qre.test.mjs` (QRE findings and surviving mutants). The values file changed (revision 2), so its pinned hash changed and the heart-rate record written at the first round no longer enables anything.

## SSCTR findings (SSCTR-V1RC-REVIEW-r1)

| Finding | Correction |
|---|---|
| R-01 (blocking): a test stopped for a symptom or not tolerated was offered again | New `stoppedFor` field; a stop with no stated reason is read as a symptom. Any result of the plan's time reported as not tolerated, or stopped for a symptom, ends test offers for the plan and raises `warningSignScreen: REQUIRED` with the evidence ids, at once. The one repeat stays only for a stop for pacing, conditions, time or another stated reason |
| R-02 (blocking): a test offered while the engine asked unanswered warning-sign items | Offered only when the engine's answer prescribes and the review's eligibility is nonclinical with all six items answered no; otherwise `ELIGIBILITY_NOT_CURRENT` |
| R-03 (blocking): marathon estimate and band for a runner outside the model population | A reference outside the population is no marathon source: `OUTSIDE_MODEL_POPULATION` |
| R-04: long ceiling faster than the easy one; threshold fast edge faster than the 10 km one at the population edge | Clamped in the slowing direction only (long ≥ easy, recovery ≥ long, threshold ≥ 10 km) |
| R-05: a downward step from sessions jogged below the cue; a failed session did not break a pair | A session below its cue is not informative; a session not completed or done in part breaks the pair |
| R-06: race-pace bands shown with the estimate boundary off | They need both boundaries |
| R-07: the marathon caution was only a flag | `cautions` and `assumes` (ids and texts) on the marathon estimate, its band and its race day |
| R-08: observed bands carried no dates, validity or uncertainty | `sessions` with dates, `windowDays`, `validUntil`, `uncertaintyCauses` |
| R-09: supplied lab values ignored the hold and return cutoff | They follow the same floor as the observed maximum |
| R-10: aged evidence stayed LOW however many reductions stacked | Aged counts as one reduction; with two more the capacity is unavailable |
| R-11: no population limit for results longer than a half marathon | **Not corrected.** The review gave no value; carried as a limit on the estimate boundary |
| R-12: order between the test declaration and the not-done report | Stated in the contract (same review). A harder session still standing later in the week of a test is by effort only (`TEST_ALREADY_DONE_THIS_WEEK`) |
| Reading R3 condition | A band moved by training is labelled `ESTIMATED_TRAINING_ADJUSTED` |

Amendments to the decision, taken from the review record: R-01 (repeat only after a non-symptom stop), R-04 (ceilings never made faster, instead of never derived), R-07 (the caution as content), R-10 (aged evidence as one reduction).

## QRE findings (QRE-V1RC-REVIEW)

| Finding | Correction |
|---|---|
| 01 (blocking): the move was withheld while the extension was off, and from data the extension did not accept | Withheld only when the extension is on and an accepted `FIELD_TEST` of this athlete names a live harder session of the plan, in the week of the test. Negative tests for each case |
| 02 (blocking): a refused or backdated review still recorded evidence | Recorded only when the engine accepted the review, and never under an instant earlier than the record |
| 03 (blocking): a mid-week correction removed the reference in force | A row is corrected for a week only when the correcting row is in force for that week |
| 04 (blocking): the longest recent run read evidence recorded inside the week | It reads only what was on record before the week, after any withdrawal |
| 05 (blocking): week 0 read through the intake day, and recency was counted from it | Week 0 is like every week; recency and every window are counted from the week's first day |
| 06 (blocking): heart-rate zones came back from a maximum older than 112 days dated before a break or hold | Nothing dated on or before the floor is read for heart rate |
| 07: one GPS glitch stretched the easy band | A pace outside 2:00 to 15:00 per km is not an observation |
| 08: the 10 km equivalent was shown without the estimate boundary | Shown only with it, in the capacity and in the record of changes |
| 09: caller options can enable the extension | **Not changed** (same exposure as the frozen event extension). Integration condition: pass no options |
| 10: evidence accumulated while the extension was off | Nothing is recorded while off |
| 11: future-dated intake anchors | Refused, named |
| 12: a declaration id colliding with an anchor or a plan race | Refused (`evidence.idReserved`) |
| 13: non-object carried rows were dropped | Every carried row is returned as received |
| 14: contract incomplete | Completed |
| 15: 150,000 anchors failed the calibration | No argument spreading on evidence lists |
| 16: twelve surviving mutants | One directed test each: M02, M03, M11, M23, M27, M29, M31, M32 in reachable flows; M06, M12, M15, M20 by calling the calibration on a record with the fact in question, since the engine's own behaviour masks them in the flows |

## Left for the recheck to rule

- Whether a result that does not qualify as capacity (heat, for example) may still count as a long run for the endurance gates (QRE's question on reading R8). Today it counts when completed without walk breaks.
- Whether the easy band's slow edge should rest on a single run (QRE-07). The rule is the decision's; only the plausibility window was added.
- The test for lab values after a hold in a reachable flow is weak (the plan is in return mode, which hides heart rate anyway); the direct test in the QRE file is the one that discriminates.
