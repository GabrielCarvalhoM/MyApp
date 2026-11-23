# CoachingCore Integration Boundary & Custody Foundation: final report

**State: CLOSED.** The boundary is implemented and tested. One focal cycle was used. Every judge's R2 verdict is favourable with conditions. The boundary successor record is emitted (synthetic only).

**Line:** branch `claude/v1-cc-integration-foundation`, worktree `.claude/worktrees/v1-cc-integration`, from `e44d855` (COACHINGCORE-V1-CORE-SAFETY-FREEZE-7).

| Commit | What it is |
|---|---|
| `a52db2b` | the candidate |
| `e3d193c` | the R1 reviews |
| `d310faf` | the cycle |
| `0aa1288` | the R2 reviews, C-R2-1 and the verifier |
| (the next commit) | the successor record |

**Nothing pushed or merged. Synthetic athletes only.**

| Judge | R1 (`a52db2b`) | R2 (`d310faf`) |
|---|---|---|
| Security / PCG | PASS_WITH_CONDITIONS | **PASS_WITH_CONDITIONS** (successor: yes, synthetic, SEC-INT-02R open) |
| QRE | NOT_READY | **READY_WITH_CONDITIONS** (successor once C-R2-1 met: met) |
| SSCTR | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** (no dose change) |

**Records:** `INTEGRATION_BOUNDARY_CONTRACT.md` (deliverables A–E), `CYCLE1.md`, `REVIEW_REQUEST.md`, `evidence/` and `reviews/`. The Mac handoff is README §14 of `audits/v1-core-safety-lifecycle-2026-11-18/mac/`, with `int-driver.js`, `int-oracle.mjs` and `Fixtures/int.json`.

## What the mission did not expect, and what it found

1. **The frozen V1CIB custody could not record the core V1 run journey.** A second voice of a session arriving in a later review was refused whole: the watch in the morning, the athlete's effort in the evening, or a dispute. The engine (E-1, O-1) evolves the row in force in place, and V1CIB's `reconcile` predates that. This is reproduced on the frozen custody alone.
   - **Fix:** a delimited amendment of `custody.mjs` (`reconcile`/`evolves`). It admits exactly the two shapes the engine writes.
   - **Authority:** approved by Security and QRE, with no dose effect (SSCTR). It is recorded as **V1INT-BOUNDARY-SUCCESSOR-1**, a boundary record and not an engine freeze.
2. **The frozen custody dropped the record of formats, history and evidence** the composed engine carries. As a result, a kept symptom stop **stopped asking for the warning-sign screen** at the next review, and custody's answer never told the app that the screen was asked.
3. **The device route could have answered the warning-sign screen** (SEC-INT-01). Now only the athlete states a screen, and a delivery carries their last one byte for byte.
4. **An accepted offered move lost the moved session's format** (AUTH-INT-01 = QRE-INT-01). This is fixed.

## The fifteen questions

1. **Which adapter was implemented?**
   - `CoachingCore/src/boundary/integration.mjs` (`createIntegration`) is a custody-compatible service that composes the frozen V1CIB custody through its `store` and `engine` injection points, over the composed entry `v1-safety-index.mjs`.
   - `admission.mjs` holds the structural limits.
   - The frozen `api.mjs` (`createBoundary`) runs over it unchanged.
2. **Which operations does it support?**
   - Every `api.mjs` operation:
     - `onboard`, `logRun`, `logStrength`, `weeklyCheckIn`;
     - `notFeeling100`, `wellbeingCheck`, `declareReadiness`, `reportBreak`;
     - `updateAvailability`, `setPreferences`, `setCoach`;
     - `accept`, `decline`, `restart`;
     - `setConsent`, `eraseHealthFacts`, `eraseAccount`;
     - the reads.
   - Plus `submit` (athlete forms), `importActivities` (HealthKit), `acknowledgeRecordLoss`, `carried` and `presentation`.
   - Every answer names:
     - what was recorded or not (`recorded`, `notRecorded`, per workout `activities`);
     - the warning-sign screen the engine asked for;
     - `anchorStale`.
3. **Was C-F01-2 closed at the portable layer?** **Yes, for synthetic use** (SEC_INT_R2, QRE_INT_R2).
   - The unit (program, ledger, reference state, model, the three carried records) is kept in one atomic write under a MAC bound to custody's seal.
   - It is handed back exactly as the engine last returned it, a restart included.
   - It survives a process restart.
   - It refuses corruption, splices, another athlete and another key.
   - A failed write confirms nothing.
   - With the anchor, a lost or rolled-back record is never replaced by a new or older plan.
   - The engine-level HOLD for self-contradicting records is not needed on this path.
4. **What is missing for its native validation?**
   - The native store: tmp + fsync + rename, file protection, one writer under a lock, cleanup.
   - The Keychain anchor and key, including their behaviour on reinstall.
   - The host HMAC and constant-time compare in JavaScriptCore (the P0 prelude marks them unsupported).
   - The device fixture `int.json` run in JSC.
   - Process death during a write.
   
   README §14 has the steps; IOS_REVALIDATION_PENDING still stands.
5. **Was SEC-CORE-03 closed or partially implemented?** **Closed at the portable layer** (SEC_INT_R2): who may correct which report holds against every attack the judges tried. **Open:**
   - the native part (that `importActivities` is reachable only from HealthKit delivery, and which HealthKit sources count as the device);
   - Founder D1 (device-custody threat model);
   - SEC-INT-02R (defence in depth against a misbehaving engine).
6. **Which boundary verifies authorship?**
   - The **entry point** native code calls: `submit` is the athlete, `importActivities` is the device. Authorship is never taken from a payload field.
   - The boundary builds the source from the channel.
   - It refuses boundary-owned fields (ids, clocks, source, provenance).
   - It applies the frozen voice guard.
   - It binds each correction to the author's own report in force, through the sealed origins map.
7. **Was C-NCC-3 closed on the implemented paths?** **Yes, at the portable layer.**
   - **(a)** The record of formats is carried on every review and restart, and the screen is asked until answered.
   - **(b)** `reportedAt` and `correctedAt` come from the operation clock (custody's `asOf`); activity times are kept as sent with their offset; a clock behind the record is refused, never moved forward.
   - **Open:** a clock set ahead (Founder D1), and the plan's fixed offset under DST or travel (engine policy, unchanged).
8. **Do the input limits work?**
   - **Yes, on every route:** reports, review fields, deliveries and intakes.
   - Measured limits refuse the whole request, never truncate, and name the safety fields carried.
   - 2,000-report abuse in every shape is bounded, and normal and high batches pass.
   - **SEC-O1-03 is not closed** (boundary part PARTIAL): SEC-INT-06 (overall growth), SEC-INT-07 (no route past the limits), the intake-anchor rest, and O-SC-1 (Core) remain.
9. **Are there changes to frozen CoachingCore files?**
   - **No engine file changed.** FREEZE-7's 49 bound files are byte-identical by direct hash.
   - **One frozen boundary file changed:** `src/boundary/custody.mjs`, bound by COACHINGCORE-V1-FREEZE-1, in `reconcile`/`evolves` only.
     - It was indispensable: the core run journey could not be recorded otherwise.
     - It was reproduced, delimited and approved by the competent judges.
     - It is declared in V1INT-BOUNDARY-SUCCESSOR-1 with its base hash `c90f2ae9…` and new hash `a3e604f6…`.
   - `v1core-freeze-7.mjs --check` exits 1 on this line by design; its successor test is `v1int-successor.test.mjs`.
10. **Did the end-to-end journeys pass?** **Yes.** Journeys A–H pass through the real engine, the frozen `api.mjs` and a file store.
    - **v1int:** 55 tests, all passing. RED evidence: 13/41 fail on the base custody, and 12/12 cycle tests fail on `a52db2b`.
    - **Suite on `d310faf`:** 1905 tests, 1862 pass, 43 fail. That is the base's 42 unchanged plus FREEZE-7's preservation test by design, which has a successor.
    - Mutation: QRE's C-R2-1 mutants are all killed.
11. **Was there a dose change?** **No** (SSCTR R1 and R2). The amendment only lets custody keep what the engine already decided, where before the whole review was refused. No rule, threshold or formula changed.
12. **Which gates still block real athletes?**
    - **QRE-INT-02:** a report fact kept for a report an ASK did not record withholds the re-sent run from pace evidence. Core + SSCTR, then a **Founder decision**, before real athletes see pace readings.
    - **SEC-INT-02R.**
    - **SEC-INT-04:** a clock set ahead (D1), and erasure under a clock behind.
    - **SEC-INT-05 rest, -06, -07, -08 rest (G07), -12.**
    - **The native obligations of contract §9.**
    - **From before:** C-O1-3, SEC-SC-02, SEC-SC-03, QRE-SC-04, C-O1-5, O-SC-S4, SEC-NCC-03, OOS-1/2, C-F01-1 r2, the R7-B0 record expiry, and Founder D1/D2/D3.
    - **IOS_REVALIDATION_PENDING.**
13. **What is ready to integrate in Swift?**
    - **Integrable now:** the interface (`createBoundary({custody: createIntegration(...)})` plus `importActivities`), its answers and error codes, the store/anchor contracts and the HealthKit mapping.
    - **Operations that can be integrated for synthetic use:** onboarding, athlete forms and corrections, HealthKit delivery, the weekly review, F08 reports, readiness, breaks, availability and preferences, adoption, restart, consent, erasure, and the reads.
    - **Blocked for real athletes:** everything above until the gates in answer 12 clear. Pace readings are blocked specifically by QRE-INT-02, and weekly-review gating by C-O1-3.
14. **Which checks need the physical iPhone?**
    - HealthKit background delivery with the app closed;
    - file protection with the device locked;
    - Keychain key and anchor across reinstall;
    - process death mid-write (a replay, never a double);
    - disk full;
    - CryptoKit HMAC equal to Node's (`int.json` `stored` digests);
    - the JSC run of `int.json`;
    - a real synced week.
15. **What is the next minimal action?**
    1. The Founder authorizes the push of this line together with the earlier unpushed lines.
    2. The Mac run: first the pending FREEZE-7 revalidation as packaged, then README §14.
    3. A Founder decision on QRE-INT-02 (Core + SSCTR), and the narrow Core item C-O1-3, before weekly-review gating with real athletes.

    No mission is started here.
