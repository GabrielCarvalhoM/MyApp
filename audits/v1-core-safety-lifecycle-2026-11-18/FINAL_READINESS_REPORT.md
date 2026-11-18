# Core Safety & Lifecycle Closure: final report

**Mission:** Founder, 2026-11-18. Chief: Opus 5.5, effort high, on Windows.
**Line:** branch `claude/v1-core-safety-lifecycle` (worktree `.claude/worktrees/v1-core-safety-lifecycle`), from `origin/claude/v1-aif-p0-jsc` @ `16577b6`. **Nothing is pushed or merged, and `main` is untouched.**
**Final state: `PARTIAL`. No successor freeze.**
The reviewed candidate is commit `430c493`; the evidence and the reviews are in the commits after it.

## Why there is no freeze

The mission allowed one round of review, one focused correction cycle, and a freeze only for corrections actually approved.

After the cycle (R2):
- **QRE:** READY_WITH_CONDITIONS, with two conditions **before any freeze** (QRE-CORE-R2-01 and -R2-02).
- **SSCTR:** NOT_READY, one blocker (**SSCTR-CORE-B-01-R**), plus condition C-C2 before the freeze.
- **Security:** PASS_WITH_CONDITIONS.

The cycle is spent, and these items need source or test changes that no judge has seen. All the corrections live in one tree, so a freeze would bind code that is not approved. The candidate therefore stays reviewed and unfrozen. Earlier freezes are preserved (no record, verifier or snapshot was edited).

## A. Per defect

| Defect | Reproduced on `16577b6` | Cause | Correction (file) | Tests | Review | Final state |
|---|---|---|---|---|---|---|
| **QRE-AIF-01** (P0): a warning sign after 2027-04-30 gives `UNSUPPORTED` | yes (`repro/repro-p0.mjs`) | the repertoire check, which expiry fails, comes before validation and the clinical screen | new composed entry `src/v1-safety-index.mjs` (`V1X-SAFETY-LIFECYCLE-1`, `V1_CORE_ENGINE`). When the only reason for the refusal is the passed date, the review is re-read with the dates set aside. **Only** `CLINICAL_HUMAN_REQUIRED` with no proposal is taken from that reading, and the refusal's readings go with it. Everything else stays `UNSUPPORTED`. Integrity failures stay unchanged | `v1core-expiry`, `v1core-cycle1` (custody, after the date, marker, readings) | SSCTR (a) APPROVE_WITH_CONDITIONS; Security closed; QRE READY_WITH_CONDITIONS (R2-01) | **Corrected in the candidate, not frozen.** Open: QRE-CORE-R2-01, and the integration conditions (the app and custody use this entry) |
| **QRE-AIF-02** (P0): restart identity | yes, and wider than reported: any review after a restart re-bound plan A's rows; every custody review was refused (`repro-restart-rebind.mjs`) | ids are `w<n>-…` in every plan; the identity carries no plan; binding is by bare id | a session namespace for each restart (`r6-program`, `r6-index`: hash of the athlete's intake as sent plus the instant); an earlier plan's rows are carried as recorded (`r6-adaptation`) | `v1core-restart`, `v1core-cycle1` | QRE fixed; Security closed; **SSCTR (b) NOT_READY: B-01-R** | **BLOCKED.** An earlier plan's symptom stop, arriving in a review the engine does not accept (ASK), leaves no stop fact, so the next review forgets the screen. **The app does not offer restart** (L-APP-06 kept) |
| **E-1** (P1): a re-sync erases effort and recovery | yes | a correction retired the whole merged row | `r6-provenance`: each report's part is kept in the merged row; a correction replaces only its own part and re-merges with the reports in force (as-if invariant), including when resolving a conflict; parts are validated | `v1core-e1`, `v1core-cycle1` (carried-record differential) | SSCTR (c) APPROVE_WITH_CONDITIONS; QRE fixed (01); Security closed (02, 04) | **Corrected in the candidate, not frozen.** Open before a freeze: C-C1 (restate the 16 RWS tests in as-if form) and C-C2 (an RWS-level test for rows without parts). Before integration: SEC-CORE-03 (author of a correction) |
| **QRE-RWS-F-01** (P1) | measured earlier (QRE-RWS-F-01) | the merge keeps one value per field | closure (a): `src/boundary/report-voices.mjs` refuses the four mixed forms | `v1core-voices` | SSCTR C-C3 and Security SEC-CORE-10: not enforced while it is not wired at ingest | **PARTIAL:** the contract is executable; the integration has to make it a per-channel allow-list, with adapter tests. The field for the surface the athlete states does not exist (open) |
| **C-3** (P2): locale-dependent order | yes (anchor hash across da/nb/cs) | `localeCompare` at 6 sites in the V1 graph | code-unit order | `v1core-locale` | QRE fixed | **Corrected, not frozen;** physical revalidation pending |
| **QRE-P0-03** (P2): engine error text in an answer | `r6-adaptation:695`, `r6-legacy:143,332` | V8 and JSC word messages differently | the error class instead of the text | — | Security closed | **Corrected, not frozen** |
| **EXPLAINED_LIBM** (P2): Race Forecast | (device) | 1-ULP differences between engines | **Policy A, RFC-NUMERIC-1**, no code change. Outside `runForecast` nothing may differ. Inside it, statuses, texts and integers are identical and non-integer numbers may differ by ≤1e-12. The `hash` and `inputDigest` of `runForecast` are runtime-local | `v1core-forecast-numeric` (exp/log/pow moved 1 ULP: persisted state byte-identical) | SSCTR (d) APPROVE_WITH_CONDITIONS (D-C1 a re-review if anything prescriptive reads the forecast; D-C2 the `**` branch on the device) | **Decided; confirmation pending on the device** |

## B. Regression evidence

`REGRESSION.md` holds the full detail.
- **Full suite:** base 1603 tests, 1601 pass / 2 fail. Candidate `430c493`: 1661 tests, 1638 pass / 23 fail.
- **The 23 failures, all attributed:**
  - 2 historical freezes, failing since earlier lines;
  - 1 V1STR preservation check (this line amends files that freeze binds);
  - 1 test that pins the restart defect;
  - 16 RWS tests that pin "a re-sync retires the row". SSCTR accepted the change as rule L1;
  - 1 E-01 test after a restart (namespace part fixed; E-1 part as above);
  - 1 B-01 pin: SSCTR accepted the new expectation; QRE says it is no reliability regression.
- **Historical tests:** none was edited. Successor tests in as-if form are still owed (C-C1, QRE-CORE-R2-02).
- **Preservation:** P0's `lab/oracle.mjs` gives byte-identical J5 and P16, including the restores (checked on a clean archive by QRE). The focal engine results are identical.
- **Performance (Node):**
  - review latency is unchanged (median ×0.97, p95 ×1.03; suite 281 s vs 277 s);
  - the record grows **×1.61** in a journey with a two-voice run every week (`provenance.parts`). That is a justified cost of E-1, with 14× headroom on the device's atomic write.

## C. Custody and security

- **Technically corrected (Security R2):**
  - a review's report can no longer bring a binding context or merge provenance;
  - malformed parts are not read and never throw;
  - the expiry precedence cannot be bypassed;
  - the error text is removed;
  - a caller cannot set the namespace.
- **Limited:**
  - SEC-CORE-14: a malformed part makes the whole row fall back to the old behavior;
  - SEC-CORE-15: in the D1 class, a rewritten record can deny a correction;
  - SEC-CORE-11: the namespace is 40 bits and not checked on read;
  - SEC-CORE-16: legacy intakes must be refused by the bridge.
- **Before integration:**
  - SEC-CORE-03: a correction is not bound to its author;
  - SEC-CORE-06: the bridge forwards no options;
  - SEC-CORE-07: the facade and views on the new entry and id;
  - SEC-CORE-10: `report-voices` wired at ingest.
- **Founder decisions:**
  - **D1:** custody on the device, the threat model, whether expiry must resist rolling back the device clock (SEC-CORE-08);
  - **G07:** retention and erasure of the per-report health facts duplicated in `parts` and in superseded rows (SEC-CORE-09);
  - **D2:** backup.
- **Needs a new Security review:** the integration of custody with `v1-safety-index`, and the adapter's ingest.

## D. Successor freeze

**Not created**, for the reasons above.

## E. Mac revalidation package

`mac/README.md`, built on the P0 harness, with no second iOS test system:
- `build/entry.mjs` carries the new entry; the bundle is relinked;
- `Fixtures/core.json` holds the Node oracle;
- `FocalTests.testCoreSafetyLifecycle` runs it, and the `testLocaleAndSortCoverage` expectation is updated;
- `mac/vm-check.mjs`: the bundle in a classic V8 context equals Node (with JIT and `--jitless`).

The Swift code **was not compiled** (no Xcode on Windows). Because there is no freeze, the package validates the candidate `430c493`, not a frozen state. Run it on the Mac after the next minimal mission, so it is not run twice.

## F. Answers

1. **QRE-AIF-01 closed?** Corrected in the candidate and approved by SSCTR and Security. QRE condition R2-01 is open (format facts recorded after expiry). **Not frozen.**
2. **QRE-AIF-02 closed?** **No: BLOCKED by SSCTR-CORE-B-01-R.** The identity part is correct per QRE and Security; the symptom screen of a late earlier-plan stop in a refused review is lost. The app does not offer restart.
3. **E-1 closed?** Corrected and approved with conditions. C-C1 and C-C2 are owed before a freeze. SEC-CORE-03 (author) and the real HealthKit tests are owed before integration.
4. **QRE-RWS-F-01 closed?** **Partially.** The contract is executable but not enforced at ingest, and the surface field is open.
5. **Canonical results independent of locale?** Yes, on Node: no `localeCompare` call is left in the V1 graph, and the anchor hash is equal under pt-BR/en-US/da-DK/nb-NO/cs-CZ. On the device it is pending.
6. **Race Forecast policy?** **A, RFC-NUMERIC-1**, approved by SSCTR. The two-race `**` branch is to be confirmed on the device.
7. **Is record continuity protected?** In the candidate: E-1 under the as-if invariant, the restart without contamination, custody keeping reviews after a restart, persistence and restore tested. **Not frozen, and B-01-R is open.** Tampering on the device depends on D1.
8. **Approved by QRE, SSCTR and Security?**
   - QRE R2 READY_WITH_CONDITIONS for the whole candidate;
   - Security R2 PASS_WITH_CONDITIONS;
   - SSCTR approved (a), (c) and (d) with conditions and blocked (b).

   No item is approved by all three without a condition before a freeze.
9. **Pending iPhone revalidation:** everything in this line (`IOS_REVALIDATION_PENDING`): `EquivalenceTests`, `testCoreSafetyLifecycle` in five languages, `testLocaleAndSortCoverage`, `testLibmBits`.
10. **What still blocks real athletes:**
    - B-01-R;
    - QRE-CORE-R2-01/-02;
    - C-C1/C-C2;
    - the integration wiring (C-INT, SEC-CORE-03/06/07/10);
    - D1, G07, D2;
    - the iOS revalidation and the entry-level device;
    - the real HealthKit adapter tests (C-C3, C-C5);
    - the external calibration of the Race Forecast;
    - renewal of the R7B0 records (A-C5);
    - the gates of the earlier lines.
11. **Next minimal mission:** "Core Safety & Lifecycle closure-2": a single runtime cycle with exactly these four items:
    - B-01-R: a symptom stop for a session outside the plan in force leaves a stop fact even when the review is refused, with the next-review test;
    - QRE-CORE-R2-01: after expiry, the format record is the refusal's;
    - C-C1 and C-C2 as successor tests;
    - SEC-CORE-14 if it fits.

    Then a narrow recheck, the freeze for what is approved, and the Mac run. **Starting it needs your authorization.**
