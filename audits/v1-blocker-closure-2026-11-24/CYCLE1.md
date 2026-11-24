# V1 blocker closure: the single consolidated corrective cycle (after R1 on `6e85222`)

**R1 verdicts on `6e85222`:**
- Security `SEC_BC_R1`: **FAIL** (SEC-BC-01, a regression this candidate introduced).
- SSCTR `SSCTR_BC_R1`: **ACCEPT_WITH_CONDITIONS** (nothing blocking).
- QRE `QRE_BC_R1`: **READY_WITH_CONDITIONS**.

This is the one cycle allowed. It is commit `220c005`; the cycle tests are in `CoachingCore/test/v1bc-cycle1.test.mjs`. No engine file changed in the cycle: the only runtime file touched is `src/boundary/integration.mjs`, plus the verifier and tests.

## Fixed

| Finding | Fix | Evidence |
|---|---|---|
| **SEC-BC-01** (High, blocking): an erasure under a clock set back before a readiness declaration wrote its marker in the past and released a standing clinical hold | An erasure or a revocation admitted under a clock behind the record is dated at the record's latest instant (`op.at = lastAt` in the integration load), so nothing it writes predates the record | Security `q1`: the attack is now BLOCKED / CLINICAL_HUMAN_REQUIRED, as on `ee256ae`. Test "SEC-BC-01"; mutant BC01 killed |
| **SEC-BC-02 = QRE-BC-01** (Low): after an erasure, a duplicate-only answer said `warningSignScreen: null` while the kept stop still required the screen | The duplicate-only shortcut is taken only while the record holds the last answer's readings. Otherwise the engine is asked, and it names the screen | Security `q3`, QRE `p01` (a): the screen is named. Test "SEC-BC-02 / QRE-BC-01"; mutant BC02 killed |
| **C-BC-2** (Medium, test discrimination): 11 real guards no test pinned | Tests added for A2, F6, C2, C5, C7, I2, I5, I6, S1, S2 and S3 | QRE's `mutate-survivors.mjs --set=boundary` on `220c005`: **13/13 killed**, the 11 plus BC01 and BC02 (`evidence/mutation-cycle1/mutation-survivors-boundary.json`) |
| **C-BC-3** (Low): the RC verifier could write a record for another commit, or accept an edited count or digest | `--write` requires HEAD equal to `--commit` and a clean `CoachingCore` except the record; `--check` recomputes `fileCount` and `filesDigest` | `scripts/v1-rc-1.mjs` |
| **C-BC-4** (Low, records) | The inventory names the code `BEFORE_RECORD_START` and its shape. `NATIVE_OBLIGATIONS.md` §3.4a covers it: the HealthKit anchor from enrollment, a refused index set aside, a date picker with no day before enrollment, and the route for a refused safety draft | — |
| **SEC-BC-O-2** (native note) | `NATIVE_OBLIGATIONS.md` §3.4a | — |
| **SSCTR-BC-01** (Low, native) | `NATIVE_OBLIGATIONS.md` §4.4a: a not-recorded athlete form goes back in the same request as the screen answer | — |
| **SSCTR C-BC-3, SSCTR-BC-05** (copy) | `NATIVE_OBLIGATIONS.md` §7.5 and §3.4a | — |

**A test of this line corrected:** the focal test "SEC-INT-04 (rest)" read `lastAt` through `carried()`, which does not expose it, so its last assertion compared `undefined` with `undefined`. It now reads the stored document. No earlier test of the project was edited.

## Not changed (routed with owners, as the judges set them)
- **SEC-BC-O-1** (custody: a kept voice's label swapped for an integrity label; Low, defence in depth, no boundary input). Engineering, optional.
- **SSCTR-BC-02** (Core + SSCTR): a timing refusal stands against the same activity re-sent valid; pre-existing.
- **SSCTR-BC-03** (Core + Security, then SSCTR): with no declaration, an earlier stop then a session today reads no pause; pre-existing. Pinned as the current scope by the F6 test.
- **SSCTR-BC-04:** the superset amendment of decision A, stated in the final report.

## Regression after the cycle

- **Suite on `220c005`:** 1934 tests, 1887 pass, 47 fail (`evidence/suite-220c005.txt`).
- **Against `ee256ae`, by title:** the same four by-design failures as on `6e85222`, and nothing else.
  - tm-5, A04L and the V1INT record each have a green successor.
  - The RC-1 test goes green with the record.
- **Mac package:**
  - the oracles and the linker, re-run on `220c005`, leave the committed package byte-identical;
  - the bundle does not include `integration.mjs` yet (README §14 step 2).
