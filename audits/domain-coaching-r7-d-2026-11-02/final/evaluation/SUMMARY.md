# R7-D harness run summary

- Harness R7D-HARNESS-8; first evaluation: true; 2026-11-08T03:57:13.619Z → 2026-11-08T03:57:39.614Z; node v24.19.0.
- Runtime R7D-FREEZE-5 (7272e9ad5cc550d05bce3be761e3ac8cf6adf03b), files 649/649 equal to the record.
- Corpus R7D-FINAL-1 (35 cases), sha256 2f2a5d270c96117dfa5a8ef3c9b8a8ba2d380c7ec27c0835a7af8a4834b63b18.
- Freshness: all checks pass.
- Structure: 0 error(s), 0 warning(s).
- Evaluated 35/35; corpus errors 4; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 6 | 0 | 0 |  |
| P02 | PASS | 13 | 0 | 0 |  |
| P03 | FAIL | 2697 | 2 | 0 | R7D-F13, R7D-F21 |
| P04 | PASS | 33 | 0 | 0 |  |
| P05 | FAIL | 27 | 1 | 0 | R7D-F12 |
| P06 | FAIL | 240 | 4 | 3 | R7D-F07 |
| P07 | PASS | 248 | 0 | 0 |  |
| P08 | PASS | 36 | 0 | 1 |  |
| P09 | PASS | 231 | 0 | 0 |  |
| P10 | PASS | 3481 | 0 | 0 |  |
| P11 | PASS | 29891 | 0 | 0 |  |
| P12 | PASS | 4963 | 0 | 0 |  |
| P13 | PASS | 1342 | 0 | 0 |  |
| P14 | PASS | 88 | 0 | 0 |  |
| P16 | PASS | 372 | 0 | 0 |  |
| P17 | PASS | 78 | 0 | 0 |  |
| P18 | PASS | 61 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 31 | 31 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 25 | 25 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 25 | 25 | 0 |  |  |
| RENAME_OPAQUE_IDS | 28 | 28 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 1 | 1 | 0 |  | R7D-F29 |
| RESEND | 25 | 25 | 0 |  |  |
| CARRIER_CLINICAL | 2 | 2 | 1 | R7D-F12 |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 12 | 23 | 0 |  |  |
| INSERT_NEWER_BREAK | 4 | 4 | 0 |  |  |
| CONSENT_OFF | 1 | 1 | 0 |  |  |
| CLOCKLESS_CONTROL | 25 | 25 | 0 |  |  |
| CALENDAR_SHIFT | 28 | 28 | 0 |  |  |
| VARIANT | 3 | 3 | 0 |  |  |

Units not evaluable (never counted as a pass):
- P06 R7D-F13 (case result PASS): 2 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-F21 (case result PASS): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P08 R7D-F21 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_EXECUTED_TOLERATED_RUN; domain judge (R7D-PREREG-6 Δ16, Δ27)

Author expectations: {"PASS":155,"FAIL":13,"NOT_EVALUABLE":7,"JUDGED":64,"CORPUS_ERROR":0}.

Corpus errors:
- R7D-F22: [{"stepId":"s1","message":"substitution.exerciseRef: no SQUAT exercise in w1-str-d2","detail":{"ref":{"week":1,"day":2,"pattern":"SQUAT"}}}]
- R7D-F32: [{"stepId":"s3","message":"fact 0 matches no session: {\"week\":5,\"sport\":\"RUN\",\"day\":6}","detail":{"ref":{"week":5,"sport":"RUN","day":6}}}]
- R7D-F33: [{"stepId":"s3","message":"fact 0 matches no session: {\"week\":4,\"sport\":\"RUN\",\"day\":6}","detail":{"ref":{"week":4,"sport":"RUN","day":6}}}]
- R7D-F34: [{"stepId":"s4","message":"fact 0 matches no session: {\"week\":7,\"sport\":\"STRENGTH\",\"day\":4}","detail":{"ref":{"week":7,"sport":"STRENGTH","day":4}}}]
