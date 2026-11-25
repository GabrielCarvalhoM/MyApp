# V1HR5R — Independent reviews

The worker is not the judge.

- **Sports science:** SSCTR (the project sports-science reviewer, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY). It wrote none of the values, code or tests.
- **Engineering, integrity, security and privacy:** an independent QRE + Security reviewer, read-only, a separate agent instance with no part in the implementation. Its probes ran in the session scratch space and are not committed; the regression tests below reproduce each finding.

## 1. SSCTR

| Round | Bytes | Outcome |
|---|---|---|
| SSCTR-HR5R-DECISION-r1 | values `e795b90b…` | **REVISE**: REV-3 (no estimate past 80), REV-4a/b (the direction of the age-formula error), REV-7 (optical caveat), N1 (a label) |
| SSCTR-HR5R-RECHECK-r1 | values `784ba7fe…`; code bound | **APPROVE_WITH_CONDITIONS**; enabling record written |
| SSCTR-HR5R-RECHECK-r2 | the same values; code re-bound after the QRE fixes (zones `3a4c2e32…`, profile `ede68c09…`, safety-index `298f5ac8…`, run-calibration `8203b875…` unchanged) | **APPROVE_WITH_CONDITIONS**. QRE-HR5R-07 approved as implemented: it also fixes a defect where a measured value could reach the week in force mid-week. Local-day aging, compaction, validation by source and erasure approved. A new condition records the week rule. The r1 record was moved to `superseded`. |

Details: [SCIENCE_AND_CALIBRATION_DECISION.md](SCIENCE_AND_CALIBRATION_DECISION.md) and [`ssctr/`](ssctr/).

## 2. QRE + Security

### Round 1 on `23f6a86`: **NOT_READY** (1 BLOCKER, 4 MAJOR, 3 MINOR, 2 NOTE), every finding reproduced by a probe

| ID | Severity | Finding | Disposition | Regression test |
|---|---|---|---|---|
| QRE-HR5R-01 | BLOCKER | After an erasure of health facts, a heart-rate write turned the null readings into `{runCalibration:null}`. A resent stopped run then became a duplicate with **no warning-sign screen**: a heart-rate operation changed a safety-route answer. | **FIXED**: null readings stay null and their time stays the answer's (`readingsAsIs`) | `v1hr5r-boundary` "QRE-HR5R-01" |
| QRE-HR5R-02 | MAJOR | Accepting a pending change restored the offer-time records, **erasing a later heart-rate override** | **FIXED**: accept keeps the profile record in force | "QRE-HR5R-02" |
| QRE-HR5R-03 | MAJOR (privacy) | Heart-rate data was recorded with COACHING consent revoked | **FIXED**: CONSENT_REQUIRED, as for a review. Whether HEALTH_SIGNALS should also govern this data stays a G07 / Founder question. | "QRE-HR5R-03 / N2" |
| QRE-HR5R-04 | MAJOR | A day-only intake row was read at UTC midnight. East of UTC, a declaration right after onboarding was refused as backdated; west of UTC, a same-day restart's age was dropped. | **FIXED**: every time is read in the plan's offset; an intake age is never dropped for time | "QRE-HR5R-04" (offsets +600, +60, −180, −600, plus the same-day restart) |
| QRE-HR5R-05 | MAJOR (security) | A client could forge `heartRateProfileRecord` rows in an intake: a permanent throw, a lock until 2099, a full record, an impossible maximum | **FIXED**: carried keys stripped and refused at enroll and restart; an invalid intake declaration refused; a first plan reads no record; rows validated by source; faults typed | "QRE-HR5R-05" |
| QRE-HR5R-06 | MINOR | A carried-only commit at the same custody version could be rolled back undetected; two processes could race | **FIXED** for rollback: a carried `seq`, with the anchor keeping `carriedSeq`, so a rollback is RECORD_ROLLED_BACK. **ACCEPTED RISK** for the multi-process race: the device has one serial queue and the server store is PENDING. | "QRE-HR5R-06" |
| QRE-HR5R-07 | MINOR | Provisional next-week cues were recomputed from the current week's measured references | **FIXED**: each session keeps its own week's references. SSCTR approved (r2). | `v1hr5-five-zones` "QRE-HR5R-07" |
| QRE-HR5R-08 | MINOR (privacy) | No erasure of heart-rate declarations; a permanent 128-row cap | **FIXED**: `eraseHeartRateProfile`; compaction to the rows in force | "QRE-HR5R-08" |
| QRE-HR5R-09 | NOTE | The regression proof never called the new operation and used only offset −180 | **FIXED**: `--tz 600`, and the neutrality proof `evidence/hr-neutrality.mjs` (75 writes injected) | results files |
| QRE-HR5R-10 | NOTE | The readings' time moved; a busy store gave an untyped answer | **FIXED** | — |

### Round 2 (narrow recheck): **READY_WITH_CONDITIONS**

All ten were FIXED. The recheck found four new issues in the fixes:

| ID | Severity | Finding | Disposition | Test |
|---|---|---|---|---|
| N1 | MAJOR | After a sequence rollback, `acknowledgeRecordLoss` answered NOT_LOST and the athlete was locked out | **FIXED**: a carried rollback is a loss for the athlete's acknowledgement | "QRE-HR5R-N1 / N3 / N4" |
| N2 | MAJOR (privacy) | Erasing the heart-rate profile was refused once consent was revoked | **FIXED**: consent is checked only to record a value, never to erase | "QRE-HR5R-03 / N2" |
| N3 | MINOR | Erasure was refused with the clock behind the record | **FIXED**: non-mutating, dated at the record's latest instant, as `eraseHealthFacts` is | "N1 / N3 / N4" |
| N4 | MINOR (privacy) | An erased value stayed in `pendingRecords` | **FIXED**: a pending change keeps no copy of the profile record | "N1 / N3 / N4" |

The reviewer's own probes for N1–N4 (p4b, p9) were rerun after the fixes and pass:

- the rollback is released by the athlete's acknowledgement;
- erasure works with consent revoked and with the clock behind;
- no `211` is left in the stored document.

A third round was not run; the closing evidence is the passing probes and regression tests. The conditions the reviewer set (fix N1 and N2 with tests, fix or accept N3 and N4, keep the race in the risk register, SSCTR for 07) are all met.

## 3. Open from the reviews

- **G07 / Founder:** whether HEALTH_SIGNALS (and not only COACHING) governs the heart-rate profile.
- **Risk register:** the multi-process same-version race (QRE-HR5R-06).
- **Security:** a Security and privacy review of heart-rate data before real athletes (SSCTR C13).
- **Revalidation queue:** HQ-V1HR5R-SSCTR-ZONES, proposed by SSCTR and not added (a Chief/Founder artefact).
