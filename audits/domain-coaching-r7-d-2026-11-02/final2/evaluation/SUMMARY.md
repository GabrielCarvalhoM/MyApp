# R7-D harness run summary

- Harness R7D-HARNESS-9; first evaluation: true; 2026-11-08T15:55:37.147Z → 2026-11-08T15:56:13.471Z; node v24.19.0.
- Runtime R7D-FREEZE-6 (d569ef2b38e2f2d641e92d2a06cf2cac5f0f6251), files 727/727 equal to the record.
- Corpus R7D-FINAL-2 (39 cases), sha256 24df57049442e1041f2ba09bdb08fccc4de5ccbd2c894bab680f6d33719c9dba.
- Freshness: all checks pass.
- Structure: 0 error(s), 0 warning(s).
- Evaluated 39/39; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 13 | 0 | 0 |  |
| P02 | PASS | 17 | 0 | 0 |  |
| P03 | PASS | 4897 | 0 | 11 |  |
| P04 | PASS | 54 | 0 | 0 |  |
| P05 | PASS | 41 | 0 | 0 |  |
| P06 | PASS | 290 | 0 | 14 |  |
| P07 | PASS | 202 | 0 | 0 |  |
| P08 | PASS | 53 | 0 | 2 |  |
| P09 | PASS | 283 | 0 | 0 |  |
| P10 | PASS | 5972 | 0 | 0 |  |
| P11 | PASS | 35644 | 0 | 0 |  |
| P12 | PASS | 5742 | 0 | 0 |  |
| P13 | PASS | 2454 | 0 | 0 |  |
| P14 | PASS | 123 | 0 | 0 |  |
| P16 | PASS | 348 | 0 | 0 |  |
| P17 | PASS | 112 | 0 | 0 |  |
| P18 | PASS | 70 | 0 | 1 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 39 | 39 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 36 | 36 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 36 | 36 | 0 |  |  |
| RENAME_OPAQUE_IDS | 36 | 36 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 0 | 0 | 0 |  |  |
| RESEND | 36 | 36 | 0 |  |  |
| CARRIER_CLINICAL | 3 | 3 | 0 |  |  |
| CARRIER_HOLD | 2 | 2 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 23 | 41 | 0 |  |  |
| INSERT_NEWER_BREAK | 7 | 7 | 0 |  |  |
| CONSENT_OFF | 1 | 1 | 0 |  |  |
| CLOCKLESS_CONTROL | 36 | 36 | 0 |  |  |
| CALENDAR_SHIFT | 36 | 36 | 0 |  |  |
| VARIANT | 3 | 3 | 0 |  |  |

Units not evaluable (never counted as a pass):
- P03 R7D-H01 (case result PASS): 2 unit(s) not evaluable, P03D_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P03 R7D-H17 (case result PASS): 2 unit(s) not evaluable, P03D_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P03 R7D-H25 (case result PASS): 4 unit(s) not evaluable, P03D_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P03 R7D-H33 (case result PASS): 1 unit(s) not evaluable, P03D_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P03 R7D-H35 (case result PASS): 2 unit(s) not evaluable, P03D_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H01 (case result PASS): 2 unit(s) not evaluable, P06_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H15 (case result PASS): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H16 (case result PASS): 2 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H17 (case result PASS): 2 unit(s) not evaluable, P06_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H25 (case result PASS): 4 unit(s) not evaluable, P06_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H33 (case result PASS): 1 unit(s) not evaluable, P06_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-H35 (case result PASS): 2 unit(s) not evaluable, P06_SESSION_REPORTED_BY_THIS_DECISION; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P08 R7D-H18 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_EXECUTED_TOLERATED_RUN; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P08 R7D-H19 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_EXECUTED_TOLERATED_RUN; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P18 R7D-H08 (case result PASS): 1 unit(s) not evaluable, NESTED_OWN_RETURN_RECORD; domain judge (R7D-PREREG-6 Δ16, Δ27)

Author expectations: {"PASS":191,"FAIL":11,"NOT_EVALUABLE":0,"JUDGED":70,"CORPUS_ERROR":0}.
