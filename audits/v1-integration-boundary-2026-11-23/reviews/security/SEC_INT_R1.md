# SEC_INT_R1: Security / PCG review of the CoachingCore Integration Boundary (V1INT-1)

**Judge:** Security, Privacy & Abuse Architect, an independent instance. I did not write the candidate. **Date:** 2026-11-23. Synthetic athletes only.
**Judged:** commit `a52db2bb5e3beed2de08c3e7b888f143dcc27b54` (base `e44d855`, FREEZE-7).

| File | sha256 (first 16 characters) |
|---|---|
| `CoachingCore/src/boundary/integration.mjs` | `2d91cee38d439df7` |
| `CoachingCore/src/boundary/admission.mjs` | `825726d2bb887dbb` |
| `CoachingCore/src/boundary/custody.mjs` | `5bac855869b8c19d` |
| `INTEGRATION_BOUNDARY_CONTRACT.md` | `42f6701105b6bac9` |

**Method.**
- Read the contract, the code and the custody diff, and the source gates (SEC_CORE_R1, SSCTR_F01_R1 §5, SEC_SC_R1/R2).
- Ran the candidate tests, all green: custody 11/11, authorship 16/16, journeys 8/8, limits 7/7.
- Wrote six probes under `probes/`. Run each from `CoachingCore/` with `node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/<file>`.
- I read no QRE or SSCTR review of this candidate.

## Verdict: PASS_WITH_CONDITIONS

The trust model is right. The channel comes from the entry point; ids, clocks and source are owned by the boundary; origins and carried records sit under a MAC bound to custody's seal. Report and correction authorship holds against everything I tried:
- cross-author, cross-session, cross-activity and cross-athlete corrections;
- forged ids and provenance;
- replay;
- correction after a restore;
- the athlete correcting their own voice on a merged row in either order, and a device re-sync of a merged voice (p1 A–C: all admitted, nothing lost).

Five conditions must be met before the boundary can be used, and they bound what this review approves:
- **SEC-INT-01, -02 and -03** must be fixed in the one focal cycle, before any successor record or freeze.
- **The `custody.mjs` amendment is not approved in its current form** (SEC-INT-02).
- **SEC-INT-04 and -05** must be fixed before any real athlete.

## Findings

| ID | Severity | Blocking | Finding | Reproduction | Owner |
|---|---|---|---|---|---|
| **SEC-INT-01** | **High** | **Yes: focal cycle; SEC-CORE-03 closure; real athletes** | **The device channel carries the athlete's clinical screen.** `importActivities({eligibility})` forwards an `eligibility` that the athlete never sent through ATHLETE. After a symptom stop, the engine requires the warning-sign screen. An import carrying a screen re-stamped with today's `assessedAt` **clears it**: the next answer is `KEEP`, the run is recorded, and `warningSignScreen` is `NOT_RAISED`. This is exactly what the athlete's own answer does. The contract's trust table says the device is "not trusted" for athlete-only facts; this is the most safety-relevant one. A native cache that rebuilds "the last answer" with a fresh timestamp is enough to trigger it. | `p3-device-eligibility.mjs` (rows `restamped` vs `athlete-restamped`) | Engineering (integration). Fix: refuse `eligibility` on DEVICE, and let the boundary attach the last ATHLETE-channel screen it keeps under the seal, exactly as answered (or decide without it: ASK, and the queue retries). **SSCTR informed:** row `stale` shows that a screen assessed *before* the stop is accepted as current. It records `KEEP`, although the screen stays REQUIRED. This is engine policy and predates the candidate. |
| **SEC-INT-02** | **Medium** | **Yes: the `custody.mjs` successor record** | **`evolves` is more permissive than the contract states.** Each of these forged evolutions was kept, each next to a genuine new voice of the review:<br>(a) a stored `stop: SYMPTOM` and `ADVERSE` removed from the merged row;<br>(b) the amount rewritten (40 → 5 min);<br>(c) **on a first merge, the row's own voice left out of `parts`, and `completed` turned to false.** The contract condition "the row's own voice is unchanged" is enforced only when that part is present;<br>(d) the content of a new part fabricated under a real incoming id;<br>(e) `provenance.conflict` cleared while `conflicted` stays.<br>FREEZE-1 refused all of these. This loses defence in depth against an engine that drops a safety signal. **The too-strict side is fine:** every legitimate shape I tried passes (p1 A–C, and the test's 4 shapes). | `p6-evolves-forgery.mjs` (5 × `KEPT`) | Engineering (custody), with QRE. Fix, then a narrow Security recheck:<br>• require `partsY[x.eventId]` on a first merge, equal to x's own `actual`/`response`;<br>• each new part's `actual`/`response` equals what custody sent under that id;<br>• safety monotonicity: every stop, `ADVERSE` or `IMPAIRED` of x, and `completed: true`, survives in y, or the exact O-1 shape that changes it is pinned;<br>• `provenance.conflict` is never cleared. |
| **SEC-INT-03** | **Medium** | **Yes: focal cycle** | **`acknowledgeRecordLoss` deletes a healthy record.** It checks only that an anchor exists, never that the record is actually lost or rolled back. On a verified record holding a `CLINICAL_HOLD`, it returns ok, and the record (with the hold) is removed without a tombstone. A UI path or a bug can therefore lift a hold through a non-safety act. | `p2-lifecycle.mjs` (A) | Engineering. Act only when this athlete's load reports `RECORD_LOST`/`RECORD_ROLLED_BACK` now; otherwise `NOT_LOST`. |
| **SEC-INT-04** | **Medium** | **Yes: real athletes** | **One clock set ahead locks the record.** A single operation with the clock a year ahead sets `lastAt`. After the clock is corrected, every mutation is `CLOCK_BEHIND_RECORD` until that date arrives. This includes **revoking HEALTH_SIGNALS consent, `eraseHealthFacts`, and a symptom-stop report**. Only `eraseAccount` still works. A privacy right and a safety report are blocked by a clock state, with no recovery. | `p2-lifecycle.mjs` (B) | Engineering: exempt consent revocation and erasure from the check, and add an explicit recovery path. Founder D1: trusted or monotonic time. |
| **SEC-INT-05** | **Medium** | **Yes: real athletes** | **The admission limits do not cover the `enroll`/`restart` intake.**<br>• One enroll with 3,000 performance anchors and a 400 KB field stores a 1.58 MB record. The restart is the same.<br>• A field nested 5,000 deep is accepted (HOLD, no throw).<br>• **Minimisation:** anchors are kept with arbitrary extra keys. 500 free-text `note` strings were persisted (p5c). Unknown top-level and `athlete.notes` fields are dropped. | `p5-limits.mjs` (C), `p5c-intake-kept.mjs` | Engineering (integration): byte, structure and count bounds on the intake at both entry points. Core: anchors closed to known keys. |
| SEC-INT-06 | Low–Medium | No (SEC-O1-03 stays PARTIAL) | **The record has no growth bound.** The limit of 8 new reports per channel per day holds for each day, but the athlete chooses the day. 480 unplanned reports dated across 60 past days (all before the plan) were accepted, and the record grew from 251 KB to 695 KB. | `p5-limits.mjs` (A) | Engineering: a back-dating window or a per-record/week cap. SSCTR informed: whether unplanned pre-plan reports feed the restart sizing. |
| SEC-INT-07 | Low–Medium | No; before real athletes | **A safety signal with no admissible route.** After 16 corrections, a 17th that adds a symptom stop and `ADVERSE` is `LIMIT_EXCEEDED`, and a new report is `ALREADY_REPORTED`. The same applies to a 9th report of a day. Nothing is invented and `safetyFields` names the fields, but the stop cannot enter the session's record. | `p5-limits.mjs` (B) | Engineering: admit a correction that adds a safety signal past the limit (bounded, as in SEC-SC-01 (i)), or answer with an explicit route to the F08 path. SSCTR informed. |
| SEC-INT-08 | Medium (privacy) | No; before real athletes (G07) | **Erasure leaves health content in `carried`.** After `eraseHealthFacts`:<br>• `runFormatRecord` still holds the SYMPTOM stop;<br>• `presentation.readings` keeps `warningSignScreen` and `runCalibration`;<br>• the integration's request record keeps `nf-1` with outcome `RUN_STOPPED_FOR_A_SYMPTOM` and the session ids, although custody dropped its own entry.<br>Because of that divergence, a retry of the erased request id is handled as a "retry": admission is skipped, custody decides it anew, and it logs a new `NOT_FEELING_100` decision (`CLINICAL_HUMAN_REQUIRED`) for content just erased. The retry class predates the candidate in custody; the boundary amplifies it. | `p4-erasure.mjs` | Engineering: drop the carried request when custody drops its own, scrub the readings, and do both in the same commit. Founder G07 (extending SEC-CORE-09): whether `runFormatRecord` and `origins` are erased. |
| SEC-INT-09 | Medium | Yes: real athletes (iOS revalidation) | **The §9 native obligations are incomplete.** Items to add:<br>(a) **HealthKit source trust:** exclude or downgrade `HKMetadataKeyWasUserEntered` workouts, and decide which source revisions count as DEVICE. Otherwise a manual Health-app entry or another app's write becomes a `WEARABLE_FULL` measurement;<br>(b) SEC-INT-01: no screen on the device route;<br>(c) **one writer** across the app, its extensions and background delivery: commit is compare-and-swap under a lock (the reference `fileStore` has one; §9.3 omits it), with stale-lock recovery;<br>(d) no record or payload content in logs, `os_log`, crash reports or analytics; JS errors bridged by class name only;<br>(e) leftover `.tmp`/`.lock` files are cleaned, follow D2 for backup, and are removed on erasure;<br>(f) Keychain items (key, anchor) survive app deletion: state what a reinstall shows, and whether `eraseAccount` deletes the key;<br>(g) an anchor write failure is surfaced (`anchorStale` is computed but never returned);<br>(h) `acknowledgeRecordLoss` is reachable only from the RECORD_LOST screen;<br>(i) the clock recovery UI (SEC-INT-04). | Reading: `integration.mjs:88`, `store.mjs:30-34`, contract §9 | Engineering (iOS). Security re-checks at IOS_REVALIDATION. |
| SEC-INT-10 | Low (record) | No | `node CoachingCore/scripts/v1core-freeze-7.mjs --check` **exits 1** on the candidate. Its preservation step names `custody.mjs` (bound by FREEZE-1) and the new v1int files as undeclared. The 49 bound files are byte-identical by direct hash (49/49). The contract's "stays 49/49" must state how it was measured. | Run the command from the root; recompute the hashes from `RUNTIME_FREEZE_V1CORE_7.json` | QRE / author |
| SEC-INT-11 | Note | No | When two values of one new activity arrive in one request, the second is sent to the engine as `correctionOf: 'pending:0'` (a provisional id). The engine refuses it (`INVALID_CORRECTION_CHAIN`, named in `notRecorded`), so this fails safe. It would be better refused at admission. | `p1-merged-corrections.mjs` (D) | Engineering |

**Checked and held:**
- Every boundary-owned field is refused, including inside `actual`. The allow-list per channel, `checkReportVoice` and an unknown `correctionOf` all hold.
- `CORRECTION_TARGET_NOT_FOUND` is the same code for another athlete's target, so there is no oracle.
- Carried edit, splice, truncation and absence fail as `INTEGRITY_FAILURE`; another athlete's document is `FORBIDDEN`; with an anchor, rollback is detected.
- No engine options are forwarded (SEC-CORE-06 holds on this path).
- **Egress:** `integration.mjs` and `admission.mjs` contain no network, logging or environment access. Error answers carry codes, field names and class names only, never values.

**Carried, not new:** SEC-CORE-07 is still open at this surface. `presentation()` returns the stored sessions in force with no `authorityExpiry` reading, so after expiry the app would still show them.

## Dispositions

- **SEC-CORE-03: PARTIAL at the portable layer.**
  - Closed: correction authorship by channel (session, activity, chain head, athlete), boundary-owned source, ids and clocks, and the voice guard.
  - Remaining: SEC-INT-01 (the screen on DEVICE); channel integrity and HealthKit source trust (SEC-INT-09 a/b/h); Founder D1.
  - C-F01-3 (SSCTR re-reads the restart sizing) can now start for the portable part.
- **C-F01-2: CLOSED at the portable layer, for synthetic use.**
  - The unit (ledger, reference, model and the three carried records) is kept in one commit, handed back exactly to every review and restart, and corruption fails closed.
  - I concur that no engine-level `restartIntake` HOLD is needed on this path, because reconcile refuses duplicate identities, the seal refuses unions, and rows are never rebuilt from views.
  - The native part stays open: store CAS and the anchor (SEC-INT-09 c/f/g) and IOS_REVALIDATION_PENDING.
- **SEC-O1-03, boundary part: PARTIAL.**
  - `submit` and `importActivities`, including the review-level fields, are bounded, refused whole, and lose nothing silently.
  - Remaining: the intake routes (SEC-INT-05), record-level growth (SEC-INT-06), the route for a safety signal past a limit (SEC-INT-07), and O-SC-1 (Core).
  - SEC-O1-03 is **not** closed.
- **`custody.mjs` successor record: not in this form.**
  - First, SEC-INT-02 must be fixed and pass a narrow recheck.
  - Then register a successor record against COACHINGCORE-V1-FREEZE-1 for `custody.mjs`, with its base and new hashes, and a verifier that declares the amendment (SEC-INT-10).
  - This is not an engine freeze.

**Gate scope.** This verdict holds for `a52db2b` only. Any change to `integration.mjs`, `admission.mjs`, `custody.mjs`, `report-voices.mjs` or `store.mjs` invalidates the parts of this review that depend on it. **Re-review:** one narrow Security recheck of SEC-INT-01, -02 and -03 after the focal cycle. **V1 authority:** NO (synthetic only).
