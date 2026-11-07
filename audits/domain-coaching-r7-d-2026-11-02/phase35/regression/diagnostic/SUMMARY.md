# R7-D harness run summary — R7-D Phase 3.5 regression only (diagnostic corpus, not fresh evidence)

- Harness R7D-HARNESS-7; first evaluation: false; 2026-11-07T19:38:24.397Z → 2026-11-07T19:39:06.053Z; node v24.19.0.
- Runtime R7D-FREEZE-4 (b2422376b04e444acd64504d9798db47ac0e079a), files 412/423 equal to the record.
- Corpus R7D-DIAGNOSTIC-1 (18 cases), sha256 44fca38174a8999888dac4b2bfc6cafdfde2c6a0dcc089a563121af5a6740957.
- Freshness: no manifest (development run).
- Structure: 0 error(s), 0 warning(s).
- Evaluated 18/18; corpus errors 1; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | PASS | 15 | 0 | 0 |  |
| P02 | PASS | 24 | 0 | 0 |  |
| P03 | PASS | 7971 | 0 | 0 |  |
| P04 | PASS | 13 | 0 | 0 |  |
| P05 | PASS | 14 | 0 | 0 |  |
| P06 | PASS | 344 | 0 | 0 |  |
| P07 | PASS | 189 | 0 | 0 |  |
| P08 | PASS | 5 | 0 | 0 |  |
| P09 | PASS | 839 | 0 | 0 |  |
| P10 | PASS | 11223 | 0 | 0 |  |
| P11 | PASS | 29228 | 0 | 0 |  |
| P12 | PASS | 5001 | 0 | 0 |  |
| P13 | PASS | 3633 | 0 | 0 |  |
| P14 | PASS | 138 | 0 | 0 |  |
| P16 | PASS | 790 | 0 | 0 |  |
| P17 | PASS | 9 | 0 | 0 |  |
| P18 | NOT_EVALUABLE | 0 | 0 | 0 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 17 | 17 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 14 | 14 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 14 | 14 | 0 |  |  |
| RENAME_OPAQUE_IDS | 14 | 14 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 3 | 3 | 0 |  | R7D-D08, R7D-D10, R7D-D14 |
| RESEND | 14 | 14 | 0 |  |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 1 | 3 | 0 |  |  |
| INSERT_NEWER_BREAK | 0 | 0 | 0 |  |  |
| CONSENT_OFF | 1 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 14 | 14 | 0 |  |  |
| CALENDAR_SHIFT | 14 | 14 | 0 |  |  |
| VARIANT | 10 | 12 | 4 | R7D-D02, R7D-D06, R7D-D14, R7D-D16 |  |

Author expectations: {"PASS":112,"FAIL":27,"NOT_EVALUABLE":2,"JUDGED":64,"CORPUS_ERROR":0}.

Corpus errors:
- R7D-D11: [{"stepId":"cl2","message":"substitution.exerciseRef: no SQUAT exercise in w2-str-d4","detail":{"ref":{"week":2,"day":4,"pattern":"SQUAT"}}}]
