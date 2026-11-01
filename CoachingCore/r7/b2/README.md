# R7-B.2 — QE-R7B1-04 clinical precedence closure

DOMAIN_COACHING_R7-B.2 (2026-10-31 to 2026-11-01) is the narrow follow-up of R7-B.1, which closed NOT_READY with one blocker, QE-R7B1-04 ([R7-B.1 closure handoff](../b1/R7B1_CLOSURE_HANDOFF.md)). Its contract is [`audits/domain-coaching-r7-b2-2026-10-31/TASK_CONTRACT.md`](../../../audits/domain-coaching-r7-b2-2026-10-31/TASK_CONTRACT.md).

| File | What it is |
|---|---|
| [R7B2_CLOSURE_HANDOFF.md](R7B2_CLOSURE_HANDOFF.md) | **Closure (2026-11-01): CLOSED READY.** R7B_RUNTIME_REPERTOIRE_READY = READY; the runtime to start from; SSCTR conditions C1–C4; the routed items, with owners |
| [BLOCKER_CLOSURE_R7B2.md](BLOCKER_CLOSURE_R7B2.md) | QE-R7B1-04, R7B2-CAND-01 and R7B2-CAND-02: finding, root cause, authority, inventory of exits, fix, regression tests; the adjacent class-(c) R7B2-OBS-01 |
| [CONFORMANCE_R7B2_DELTA.json](CONFORMANCE_R7B2_DELTA.json) | One entry: `SSCTR:B0-C06#c8` (D08) mapped to the precedence point, its consumers and tests (checked by `scripts/conformance-r7b2.mjs`) |
| `RUNTIME_FREEZE_R7B2_1.json` | **R7B2-FREEZE-1** (`1a1c728`, bytes of `63fa602`): bound bytes, digests, predecessor R7B1-FREEZE-2, runtime and test delta, policy and catalog identity, evidence. Written by `scripts/freeze-r7b2.mjs`; verified read-only by `scripts/verify-r7b2.mjs` (35/35, [VERIFICATION_R7B2_1.json](VERIFICATION_R7B2_1.json)) |
| `NEIGHBORS_R7B2.json` | The G3 adversarial neighbors A–F, the path after the clinical route, and the CAND-01/02 pairs: 32/32 (`scripts/neighbors-r7b2.mjs`) |
| `REGRESSION_R7B2.json`, `REGRESSION_INTAKE_R7B2_VS_R7B1_FREEZE2.json` | The G4 timeline and intake differentials against R7B1-FREEZE-2 (`scripts/regress-r7b2.mjs`, `scripts/regress-r7b.mjs --base 146ebb8`) |
| `MUTATION_R7B2.json` | G5: 9 mutants, 8 killed, M41 documented equivalent (`scripts/mutate-r7b2.mjs`) |
| `*.report.json`, `SUPERSESSION_VERIFY_R7B1_ON_R7B2.json` | The inherited conformance on these bytes, the B.2 delta report, and the by-design failure of `verify-r7b1.mjs` on the new bytes |

The reviews, the gate records and the probes are under [`audits/domain-coaching-r7-b2-2026-10-31/`](../../../audits/domain-coaching-r7-b2-2026-10-31/): Engineering READY, SSCTR ACCEPT_WITH_CONDITIONS (r1 + A1), Quality READY.

Unchanged authorities:
- R6-POLICY-5 (`18ec48f3…`);
- R7B0-CATALOG-2 (`ceee276a…`), with its schema and foundation;
- the 13 B0 SSCTR r2 records and the seven R7B1-SSCTR-r2 records;
- the human queue (230 entries).

R7-B.1's records and R7B1-FREEZE-2 stay as they were. FREEZE-2 verifies at its own commit (`146ebb8`).
