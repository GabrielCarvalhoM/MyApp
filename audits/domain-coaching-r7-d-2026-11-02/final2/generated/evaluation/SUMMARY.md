# R7-D harness run summary

- Harness R7D-HARNESS-9; first evaluation: true; 2026-11-08T15:56:19.558Z → 2026-11-08T15:56:47.334Z; node v24.19.0.
- Runtime R7D-FREEZE-6 (d569ef2b38e2f2d641e92d2a06cf2cac5f0f6251), files 727/727 equal to the record.
- Corpus R7D-GENERATED-FINAL-1 (300 cases), sha256 b29dd52a58694143fe94cff3a0a4759bc1dde79948d1d6cabde40b9956e0e19f.
- Freshness: all checks pass.
- Structure: 0 error(s), 0 warning(s).
- Evaluated 300/300; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 23 | 0 | 0 |  |
| P02 | PASS | 142 | 0 | 0 |  |
| P03 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P04 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P05 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P06 | PASS | 265 | 0 | 47 |  |
| P07 | PASS | 295 | 0 | 0 |  |
| P08 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P09 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P10 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P11 | PASS | 67439 | 0 | 0 |  |
| P12 | PASS | 12531 | 0 | 0 |  |
| P13 | PASS | 547 | 0 | 0 |  |
| P14 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P16 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P17 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P18 | NOT_EVALUABLE | 0 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 300 | 300 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 0 | 0 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 0 | 0 | 0 |  |  |
| RENAME_OPAQUE_IDS | 227 | 227 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 20 | 20 | 0 |  | R7D-G039, R7D-G078, R7D-G095, R7D-G177, R7D-G214, R7D-G231 |
| RESEND | 0 | 0 | 0 |  |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 0 | 0 | 0 |  |  |
| INSERT_NEWER_BREAK | 0 | 0 | 0 |  |  |
| CONSENT_OFF | 0 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 0 | 0 | 0 |  |  |
| CALENDAR_SHIFT | 227 | 227 | 0 |  |  |
| VARIANT | 0 | 0 | 0 |  |  |

Units not evaluable (never counted as a pass):
- P06 R7D-G008 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G009 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G015 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G047 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G054 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G064 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G075 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G080 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G090 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G094 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G095 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G096 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G097 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G098 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G099 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G103 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G105 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G112 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G131 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G144 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G151 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G175 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G189 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G198 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G205 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G208 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G211 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G213 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G215 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G220 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G243 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G247 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G250 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G252 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G253 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G254 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G257 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G261 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G268 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G274 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G276 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G281 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G288 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G289 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G297 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G298 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G299 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)

Author expectations: {"PASS":0,"FAIL":0,"NOT_EVALUABLE":0,"JUDGED":0,"CORPUS_ERROR":0}.
