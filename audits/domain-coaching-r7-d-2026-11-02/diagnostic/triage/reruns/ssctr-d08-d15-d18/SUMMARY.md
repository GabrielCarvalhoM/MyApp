# R7-D harness run summary — SSCTR-TRIAGE-RERUN

- Harness R7D-HARNESS-1; first evaluation: false; 2026-11-02T21:20:14.230Z → 2026-11-02T21:20:27.409Z; node v24.19.0.
- Runtime R7C-FREEZE-4 (a9654c8ea175611fbaae805ac6b0e8b928620dff), files 197/197 equal to the record.
- Corpus R7D-DIAGNOSTIC-1 (18 cases), sha256 44fca38174a8999888dac4b2bfc6cafdfde2c6a0dcc089a563121af5a6740957.
- Freshness: no manifest (development run).
- Structure: 0 error(s), 0 warning(s).
- Evaluated 3/3; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P02 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P03 | PASS | 1819 | 0 | 0 |  |
| P04 | PASS | 2 | 0 | 0 |  |
| P05 | FAIL | 3 | 1 | 0 | R7D-D15 |
| P06 | PASS | 88 | 0 | 0 |  |
| P07 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P08 | PASS | 3 | 0 | 0 |  |
| P09 | PASS | 259 | 0 | 0 |  |
| P10 | FAIL | 2775 | 1 | 0 | R7D-D15 |
| P11 | PASS | 9438 | 0 | 0 |  |
| P12 | PASS | 1346 | 0 | 0 |  |
| P13 | PASS | 798 | 0 | 0 |  |
| P14 | PASS | 31 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 3 | 3 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 3 | 3 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 3 | 3 | 0 |  |  |
| RENAME_OPAQUE_IDS | 3 | 3 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 1 | 1 | 0 |  | R7D-D08 |
| RESEND | 3 | 3 | 1 | R7D-D15 |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| CONSENT_OFF | 0 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 3 | 3 | 0 |  |  |
| CALENDAR_SHIFT | 3 | 3 | 0 |  |  |
| VARIANT | 2 | 4 | 0 |  |  |

Author expectations: {"PASS":12,"FAIL":10,"NOT_EVALUABLE":1,"JUDGED":13,"CORPUS_ERROR":0}.
