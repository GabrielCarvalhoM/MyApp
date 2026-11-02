# R7-D harness run summary — GENERATED-FIRST-EVALUATION

- Harness R7D-HARNESS-1; first evaluation: true; 2026-11-02T20:53:55.156Z → 2026-11-02T20:54:04.326Z; node v24.19.0.
- Runtime R7C-FREEZE-4 (a9654c8ea175611fbaae805ac6b0e8b928620dff), files 197/197 equal to the record.
- Corpus R7D-GENERATED-DIAGNOSTIC-1 (100 cases), sha256 449b7d91d7b6a0235a473650dc2c256e8ef3b50bf4255e82cddd83b0e1601fb3.
- Freshness: all checks pass.
- Structure: 0 error(s), 0 warning(s).
- Evaluated 100/100; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 8 | 0 | 0 |  |
| P02 | PASS | 42 | 0 | 0 |  |
| P03 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P04 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P05 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P06 | PASS | 57 | 0 | 9 |  |
| P07 | PASS | 109 | 0 | 0 |  |
| P08 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P09 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P10 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P11 | PASS | 25128 | 0 | 0 |  |
| P12 | PASS | 4147 | 0 | 0 |  |
| P13 | PASS | 186 | 0 | 0 |  |
| P14 | NOT_EVALUABLE | 0 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 100 | 100 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 0 | 0 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 0 | 0 | 0 |  |  |
| RENAME_OPAQUE_IDS | 79 | 79 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 7 | 7 | 0 |  | R7D-G022, R7D-G050, R7D-G079 |
| RESEND | 0 | 0 | 0 |  |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| CONSENT_OFF | 0 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 0 | 0 | 0 |  |  |
| CALENDAR_SHIFT | 79 | 79 | 0 |  |  |
| VARIANT | 0 | 0 | 0 |  |  |

Author expectations: {"PASS":0,"FAIL":0,"NOT_EVALUABLE":0,"JUDGED":0,"CORPUS_ERROR":0}.
