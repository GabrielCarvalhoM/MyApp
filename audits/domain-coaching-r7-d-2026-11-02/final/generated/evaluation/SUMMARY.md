# R7-D harness run summary

- Harness R7D-HARNESS-8; first evaluation: true; 2026-11-08T03:57:59.950Z → 2026-11-08T03:58:30.371Z; node v24.19.0.
- Runtime R7D-FREEZE-5 (7272e9ad5cc550d05bce3be761e3ac8cf6adf03b), files 649/649 equal to the record.
- Corpus R7D-GENERATED-FINAL-1 (300 cases), sha256 b69fa543c7bac184c7f3cc0af67a2d6b33f6adf4b368e881a16a9cc752edba69.
- Freshness: all checks pass.
- Structure: 0 error(s), 0 warning(s).
- Evaluated 300/300; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 16 | 0 | 0 |  |
| P02 | PASS | 156 | 0 | 0 |  |
| P03 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P04 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P05 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P06 | PASS | 263 | 0 | 28 |  |
| P07 | PASS | 313 | 0 | 0 |  |
| P08 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P09 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P10 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P11 | PASS | 74250 | 0 | 0 |  |
| P12 | PASS | 13162 | 0 | 0 |  |
| P13 | PASS | 533 | 0 | 0 |  |
| P14 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P16 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P17 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P18 | NOT_EVALUABLE | 0 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 300 | 300 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 0 | 0 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 0 | 0 | 0 |  |  |
| RENAME_OPAQUE_IDS | 218 | 218 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 15 | 15 | 0 |  | R7D-G020, R7D-G060, R7D-G140, R7D-G245 |
| RESEND | 0 | 0 | 0 |  |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 0 | 0 | 0 |  |  |
| INSERT_NEWER_BREAK | 0 | 0 | 0 |  |  |
| CONSENT_OFF | 0 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 0 | 0 | 0 |  |  |
| CALENDAR_SHIFT | 218 | 218 | 0 |  |  |
| VARIANT | 0 | 0 | 0 |  |  |

Units not evaluable (never counted as a pass):
- P06 R7D-G025 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G032 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G033 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G034 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G049 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G082 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G083 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G112 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G115 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G130 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G135 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G137 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G141 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G152 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G156 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G160 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G166 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G171 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G175 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G202 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G205 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G220 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G222 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G249 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G264 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G278 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G295 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P06 R7D-G299 (case result NOT_EVALUABLE): 1 unit(s) not evaluable, NO_RUN_REFERENCE_IN_WINDOW; domain judge (R7D-PREREG-6 Δ16, Δ27)

Author expectations: {"PASS":0,"FAIL":0,"NOT_EVALUABLE":0,"JUDGED":0,"CORPUS_ERROR":0}.
