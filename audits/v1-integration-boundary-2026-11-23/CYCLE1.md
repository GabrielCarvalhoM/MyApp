# V1INT: the single focal correction cycle (after R1 on `a52db2b`)

**R1 verdicts:**
- Security `SEC_INT_R1`: **PASS_WITH_CONDITIONS**.
- QRE `QRE_INT_R1`: **NOT_READY**.
- SSCTR `SSCTR_INT_R1`: **ACCEPT_WITH_CONDITIONS**.

This is the one cycle allowed. Every fix below has a test in `CoachingCore/test/v1int-cycle1.test.mjs` (or the `v1int-custody` amendment test), and that test fails on `a52db2b` (`evidence/red-cycle1-on-a52db2b.txt`: 12 of 12 cycle tests).

No engine file changed. The only frozen file this line touches is still `custody.mjs`, and only in `reconcile` / `evolves`.

## Fixed in the cycle

| Finding | Fix | Test |
|---|---|---|
| **QRE-INT-01** = AUTH-INT-01 (High): an accepted offer lost the formats of the moved session | A waiting change keeps the records of the engine answer that made it (`pendingRecords`, under the carried MAC). When the athlete adopts exactly that plan, those records come into force. Nothing else can commit in between: a later review closes the change. | "QRE-INT-01 / AUTH-INT-01" |
| **QRE-INT-03 = SEC-INT-03** (High): `acknowledgeRecordLoss` deleted a healthy record and its hold | Allowed only when the anchor says the record is lost, rolled back or forked. An intact record is `NOT_LOST`, and so is an unreadable one (an integrity failure; account erasure is the way out). | "QRE-INT-03 / SEC-INT-03" (also I13: a fork is `RECORD_ROLLED_BACK`) |
| **QRE-INT-04 = SEC-INT-02** (Medium): forged in-place changes passed `evolves` | `evolves` now admits exactly the two shapes `r6-provenance.mjs` writes. **KEPT VOICE:** amount, response and merged ids byte-equal; `conflicted === true`; a conflict label kept or set. **MERGE:** every value stated by the row or a new voice stays stated; each value comes from the row, a new voice, or the lower of two numbers; a known response is never changed; exercises come from the voices. In both shapes the row's own voice is present and equal to the stored row, and each new voice's completion, stop, recovery and next-day function equal the incoming report's. | the amendment test, with 4 first-merge cases added. The reviewers' probes are now all refused (SEC p6 5/5, QRE p06 5/5), and QRE's 7 legitimate shapes (p02) are all admitted |
| **SEC-INT-01** (High) and SSCTR-INT-04: the device route could carry a screen that cleared the warning-sign request | `importActivities` refuses any field but workouts. A delivery carries the athlete's **own last screen, byte for byte**: the onboarding intake's, or the last athlete review's. With none it is `SCREEN_REQUIRED`. | "SEC-INT-01", and `tm-5` (the onboarding screen byte for byte; 40 days on the engine asks) |
| **SSCTR-INT-01** (condition): an identical athlete report refused a safety review riding with it | The report in force sent again unchanged is a **duplicate** (as on the device channel), and the rest of the request goes on. A changed report is still `ALREADY_REPORTED`. A refusal names the safety review kinds (`kind:NOT_FEELING_100`, …). | "SSCTR-INT-01" (the warning sign routes to `CLINICAL_HUMAN_REQUIRED`) |
| **QRE-INT-05** (part) | Every delivery answer has `activities: [{index, activityId, outcome: RECORDED\|NOT_RECORDED\|DUPLICATE, eventId, reason?}]`. A duplicate-only answer holds arrays. An empty delivery is `NOTHING_TO_IMPORT`, writes nothing. | "QRE-INT-05" |
| **SEC-INT-11** | One workout twice in a request: `DUPLICATE_IN_REQUEST` at admission | "QRE-INT-05" |
| **QRE-INT-02** (boundary part), A03 | An instant must carry its offset (`Z` or `±hh:mm`), and a device report must carry its end | "QRE-INT-02 (boundary part)" |
| **SEC-INT-05** (part) | The intake of `enroll` and `restart` is bounded: `intakeBytes` 65,536; `intakeArrayLength` 512; depth, keys and strings as for reports | "SEC-INT-05" |
| **SEC-INT-04** (part) | A consent revocation is never held back by a clock behind the record, and the latest instant on record never moves back | "SEC-INT-04 (part)" |
| **QRE-INT-08** | A kept record whose anchor write failed answers `anchorStale: true` | "QRE-INT-08" |
| **SEC-INT-08 / QRE-INT-10** (part) | An erasure of health facts also drops the last readings, and the boundary's record of every request custody dropped (a retry is then a new request) | "SEC-INT-08 / QRE-INT-10" |
| **QRE-INT-11** | I06 (retry at a later clock, both channels), I12 (presentation pruning), I13 (fork), C03 (own voice on first merge), A03, A04L (limits pinned as literals) | the tests named |
| **QRE-INT-07 / SEC-INT-10** (records) | The regression statement is corrected (contract §8): `v1core-freeze-7.mjs --check` exits 1 on this line by design, and FREEZE-7's 49 bound files are byte-identical **by a direct hash check**. Counts are restated from the runs. | — |

## Not fixed here: routed, with owners

- **QRE-INT-02 (core):** a report the engine did not record, because it asked (ASK), still leaves a `RUN_REPORT_RECEIVED` fact in the record of formats. The same workout sent again is then withheld from pace evidence (`REPORT_NOT_CARRIED`).
  - This is engine behaviour (the run-format layer records report facts under an accepted instant even when the review asks).
  - The boundary now prevents the main path: a delivery always carries the athlete's last screen, and with none it waits. It cannot prevent a screen the engine judges no longer current. `tm-5` pins this as open.
  - **Owner: Core + SSCTR, Founder decision** (an engine change). It blocks real athletes.
- **SEC-INT-04 (rest):** a clock set **ahead** locks mutating operations until that date. A revocation now passes; reports and erasure still wait. A trusted-time source is Founder D1. Blocks real athletes.
- **SEC-INT-06:** there is no overall growth bound on the record (the athlete can date reports across past days). **SEC-INT-07:** past the limits, a new safety signal for that session has no route. The refusal names it, and nothing is invented. Owner: Engineering, with SSCTR informed, before real athletes. O-SC-1 (the engine's own bound) stays with Core.
- **SEC-INT-08 / QRE-INT-10 (rest):** the engine's own stop facts in the record of formats, and the athlete's stored screen, are not erased by `eraseHealthFacts`. This is Founder G07, the erasure scope.
- **SEC-INT-09, QRE-INT-05 (native part), QRE-INT-06, QRE-INT-09:** the native obligations are added to contract §9. They are checked on the Mac and iPhone.
- **SSCTR-INT-02, -03, -05, -06:** app conditions in contract §9. SSCTR-INT-06 is pre-existing: the frozen `api.mjs` `logRun` cannot carry a stop, effort or conditions, so the app sends run forms through `submit`.
- **SEC-CORE-07** (presentation after rule expiry): the app shows the plan only through views that honour the expiry state. Listed in §9.

## Regression after the cycle

See `evidence/suite-cycle1.txt`.
