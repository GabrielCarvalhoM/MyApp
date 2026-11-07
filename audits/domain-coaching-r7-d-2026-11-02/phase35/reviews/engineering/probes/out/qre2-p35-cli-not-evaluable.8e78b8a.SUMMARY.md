# R7-D harness run summary — qre2-p35 rt-8e78b8a

- Harness R7D-HARNESS-7; first evaluation: false; 2026-11-07T20:38:12.665Z → 2026-11-07T20:38:35.095Z; node v24.19.0.
- Runtime R7D-FREEZE-4 (b2422376b04e444acd64504d9798db47ac0e079a), files 329/423 equal to the record.
- Corpus QRE2-P35-NE (5 cases), sha256 2f32364302f0eb9ea0ea065d83f6d26cae8cab923e35e2b084473e2815849908.
- Freshness: no manifest (development run).
- Structure: 0 error(s), 1 warning(s).
- Evaluated 5/5; corpus errors 0; harness errors 0.

| Property | Result | Units | Violations | Not evaluable | Failing cases |
|---|---|---|---|---|---|
| P01 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P02 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P03 | PASS | 1492 | 0 | 0 |  |
| P04 | PASS | 20 | 0 | 0 |  |
| P05 | PASS | 5 | 0 | 0 |  |
| P06 | PASS | 86 | 0 | 0 |  |
| P07 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P08 | PASS | 8 | 0 | 0 |  |
| P09 | PASS | 106 | 0 | 0 |  |
| P10 | PASS | 2296 | 0 | 0 |  |
| P11 | PASS | 10866 | 0 | 0 |  |
| P12 | PASS | 1654 | 0 | 0 |  |
| P13 | PASS | 713 | 0 | 0 |  |
| P14 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P16 | NOT_EVALUABLE | 0 | 0 | 0 |  |
| P17 | PASS | 66 | 0 | 0 |  |
| P18 | PASS | 50 | 0 | 4 |  |

| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |
|---|---|---|---|---|---|
| DETERMINISM | 5 | 5 | 0 |  |  |
| PERMUTE_OBSERVATIONS | 5 | 5 | 0 |  |  |
| DUPLICATE_SECOND_SOURCE | 5 | 5 | 0 |  |  |
| RENAME_OPAQUE_IDS | 5 | 5 | 0 |  |  |
| LOAD_CONVENTION_EQUIVALENT | 0 | 0 | 0 |  |  |
| RESEND | 5 | 5 | 0 |  |  |
| CARRIER_CLINICAL | 0 | 0 | 0 |  |  |
| CARRIER_HOLD | 0 | 0 | 0 |  |  |
| RESTATE_DECLARED_BREAK | 5 | 19 | 0 |  |  |
| INSERT_NEWER_BREAK | 5 | 6 | 0 |  |  |
| CONSENT_OFF | 5 | 0 | 0 |  |  |
| CLOCKLESS_CONTROL | 5 | 5 | 0 |  |  |
| CALENDAR_SHIFT | 5 | 5 | 0 |  |  |
| VARIANT | 0 | 0 | 0 |  |  |

Units not evaluable (never counted as a pass):
- P18 QH1 (case result PASS): 1 unit(s) not evaluable, NESTED_OWN_RETURN_RECORD; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P18 QH4 (case result PASS): 1 unit(s) not evaluable, NESTED_OWN_RETURN_RECORD; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P18 DEV-47 (case result PASS): 1 unit(s) not evaluable, NESTED_OWN_RETURN_RECORD; domain judge (R7D-PREREG-6 Δ16, Δ27)
- P18 DEV-50 (case result PASS): 1 unit(s) not evaluable, NESTED_OWN_RETURN_RECORD; domain judge (R7D-PREREG-6 Δ16, Δ27)

Author expectations: {"PASS":0,"FAIL":0,"NOT_EVALUABLE":0,"JUDGED":0,"CORPUS_ERROR":0}.
