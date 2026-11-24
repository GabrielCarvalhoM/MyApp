# REPMILE V1 CoachingCore blocker closure: final report

**State: CLOSED.** `REPMILE-COACHINGCORE-V1-RC-1` is written. It is ready for physical validation on the Mac and iPhone (`READY_FOR_PHYSICAL_VALIDATION`), synthetic only.
- The application is not ready (`APPLICATION_NOT_READY`) and no real athlete can be enrolled (`REAL_ATHLETE_READY` = NO).
- This is not the FINAL RELEASE FREEZE.

**Line:** branch `claude/v1-cc-blocker-closure`, worktree `.claude/worktrees/v1-cc-blocker-closure`, from `ee256ae` (FREEZE-7 + V1INT-BOUNDARY-SUCCESSOR-1). **Nothing pushed or merged.**

| Commit | What it is |
|---|---|
| `6e85222` | the candidate |
| `220c005` | the single corrective cycle (`CYCLE1.md`) |
| `74aebb0` | cycle record and evidence |
| `963a9ad` | the R2 rechecks |
| `96a8ccc` | the RC record (binds the bytes of `220c005`) |

| Judge | R1 (`6e85222`) | R2 (`220c005`) |
|---|---|---|
| Security / PCG | FAIL (SEC-BC-01, introduced by the candidate) | **PASS_WITH_CONDITIONS** (RC-1 yes, synthetic) |
| SSCTR | **ACCEPT_WITH_CONDITIONS** | not needed: the cycle touched no sporting logic (boundary clock dating, the duplicate shortcut, tests, verifier) |
| QRE | READY_WITH_CONDITIONS | **READY** (RC-1 yes) |

**Records in this folder:**
- `V1_BLOCKER_INVENTORY.md` (A)
- `CYCLE1.md`
- `NATIVE_OBLIGATIONS.md` (F)
- `evidence/` (C)
- `reviews/` (D), with each judge's probes

The Mac handoff is README §15 of `audits/v1-core-safety-lifecycle-2026-11-18/mac/`.

## B. What changed (seven files, over `ee256ae`)

| File | Finding | Change |
|---|---|---|
| `src/r6-adaptation.mjs` | C-O1-3 | `kindOf`: a disputed (flagged) row any of whose kept voices states ADVERSE or IMPAIRED reads ADVERSE, in every arrival order |
| `src/r6-provenance.mjs` | SEC-SC-02 | `partOf` keeps the report's own `observedAt` |
| `src/v1-f08.mjs` | SEC-SC-02, SEC-SC-03 | Each voice is dated by its own instant. A stop after the latest declaration, or on the restart day, gives a 0-week pause with no declaration standing in, so the existing cause question asks |
| `src/v1-run-format-index.mjs` | QRE-INT-02 | A report the decision neither recorded nor refused leaves only its stop in the record of formats (receipt ≠ admission ≠ safety obligation) |
| `src/boundary/custody.mjs` | SEC-INT-02R | `evolves`: a new voice is its report whole; a merge keeps completion and every stated response; a kept voice's label is one the engine writes |
| `src/boundary/integration.mjs` | SEC-INT-06, SEC-INT-07, SEC-INT-04 rest, SSCTR-INT-R2-01, G07; cycle: SEC-BC-01, SEC-BC-02 | <ul><li>No report dated before the record began: `BEFORE_RECORD_START` `{index, field, firstDay}` plus `safetyFields`.</li><li>A report stating a stop, ADVERSE or IMPAIRED passes a limit, at most 3 more.</li><li>An erasure or revocation passes under a behind clock, dated at the record's latest instant.</li><li>The duplicate-only answer carries the stored screen while readings are stored, else the engine is asked.</li><li>An erasure erases the stored screen.</li></ul> |
| `src/boundary/admission.mjs` | SEC-INT-07 | `LIMITS.safetyExcess` 3; `statesSafetySignal` |

The public interface `api.mjs` is unchanged. The only new refusal code is `BEFORE_RECORD_START`.

## C. Regression evidence

- **RED/GREEN:**
  - `test/v1bc-blocker-closure.test.mjs`: 17 tests, 14 fail on `ee256ae` (`evidence/red-on-ee256ae.txt`); the 3 controls pass on both.
  - `test/v1bc-cycle1.test.mjs`: 8 tests.
  - All 25 green.
- **Judges' own probes, before and after** (`evidence/reproductions-before-after.txt`):
  - adv2 `0,0,1,0` → `1,1,1,1`;
  - p3b G1, G2 and G4 → ASK, with D3 and D4 still DECLARED;
  - p8: 6/6 forgeries KEPT → REFUSED, controls kept;
  - p03b: 2 facts, withheld → 1 fact, carried.
- **Suite by failing-test title:** `ee256ae` 1908/1865/43. The record commit `96a8ccc` (`evidence/suite-96a8ccc.txt`) fails only the three by-design titles, each with a green successor:

  | By-design failure | Its successor |
  |---|---|
  | tm-5 | "QRE-INT-02 (device route, successor of tm-5)" |
  | A04L | "successor of A04L … safetyExcess" |
  | the V1INT record test | the RC-1 record test |

  Nothing else is new, and no earlier test was edited.
- **Differentials and mutation:**
  - Lineage matrix: 0 of 62 rows differ.
  - Normalizer and f08 differential, 16 configurations × 3000 cases (`evidence/bc-diff/SUMMARY.txt`): identical once the one added field is stripped, credit gained/lost 0, f08 view unchanged, every invariant 0.
  - Mutation: QRE's 57 mutants at R1. In the cycle, 13/13 of the survivors and new guards killed (`evidence/mutation-cycle1/`).
- **Dose (SSCTR):** exactly one change, from C-O1-3, downward only.
  - It applies when a disputed session keeps a non-first adverse voice and that completes systemic convergence.
  - That week's ADVANCE/EARNED gates then HOLD: one step of lag (e.g. QUALITY 41 → 34 min at week +2; one load step deferred).
  - This is the lag athlete-first arrival already gave.
  - Nothing else changes a dose: SEC-SC-03 changes no plan, and QRE-INT-02 leaves credit, calibration, forecast and insights equal to the screen-first control.
- **Performance** (Node, `evidence/bench-ee256ae-vs-candidate.txt`): review ×1.03, corrected restart ×1.05, normalizer ×0.96–1.00, merged-history bytes ×1.06. QRE's boundary journeys give ×1.002. No budget changed.

## E. Integration compatibility

- Journeys A–H are green.
- `api.mjs` and the error vocabulary are unchanged, except `BEFORE_RECORD_START`.
- The Mac package is regenerated deterministically:
  - the bundle is relinked (41 modules, sha256 `f5d684e5…`);
  - `focal.json` changes only `bundleSha256`;
  - `core.json` and `int.json` change only digests: no status, action or count moves;
  - vm-check passes with JIT and `--jitless`, with no differences.

## G. Release candidate manifest

- **Record:** `CoachingCore/v1/RELEASE_CANDIDATE_V1_RC_1.json`, revision `REPMILE-COACHINGCORE-V1-RC-1`. Verifier: `node CoachingCore/scripts/v1-rc-1.mjs --check` (87/87).
- **Commit and base:** `commit` `963a9ad` (CoachingCore equal to `220c005`), base `ee256ae`; package `@vilumo/bounded-shadow-coaching-core` 0.1.0.
- **Entry points:** engine `src/v1-safety-index.mjs`; boundary `createIntegration` under `createBoundary`.
- **Binds:** 87 files (every `src/` module, plus the 16 data files the runtime reads by URL), `filesDigest` `5f920e3d…`.
- **Preserved:** FREEZE-7's other 47 bound files and V1INT's other 8 files are byte-identical.
- **Findings closed:** C-O1-3, SEC-SC-02, SEC-SC-03, QRE-INT-02, SEC-INT-02R, SEC-INT-06, SEC-INT-07, SEC-INT-04 rest, SSCTR-INT-R2-01, O-SC-1 (at the V1 entry), G07's screen part, and the cycle's SEC-BC-01 and SEC-BC-02 = QRE-BC-01.
- **Physical revalidation required:** `NATIVE_OBLIGATIONS.md` §8 and README §15.
- **Remaining conditions, before real athletes:**
  - **SEC-BC-R2-01** (Low). With a clock set ahead earlier, an erased hold reads RETURNING in the plan view until the clock catches up; writes stay locked meanwhile. The portable fix is to read standing holds at `max(now, lastAt)`. Owner: Engineering (boundary views), or D1 bounds it to 300 s.
  - **Founder G07:** confirm the stop-fact retention.
  - **SEC-INT-05 rest and SEC-INT-12:** close intake anchors and `actual` to the Swift schemas.
  - **SSCTR-BC-01:** re-send a not-recorded form with the screen answer, natively.
  - **C-BC-3 and SSCTR-BC-05:** copy.
  - **Optional or later decisions:** SEC-BC-O-1 (optional); SSCTR-BC-02 and SSCTR-BC-03 (pre-existing, Core decisions); SSCTR-BC-04, the record of decision A's amendment.
- **Condition for the physical run itself (Security):** the bundle does not yet include the boundary. Until README §14 step 2 relinks it with `integration.mjs` `5b4530ed…`, `custody.mjs` `f58b5239…` and `admission.mjs` `fe78490f…`, the iPhone validates the engine, not the boundary.
- **Note:** the record's amendment text for `integration.mjs` names the R1 findings. SEC-BC-01/-02 are in `CYCLE1.md`, and the bytes are bound either way.

## H. The seventeen questions

1. **How many blockers were in the initial inventory?**
   - The mission named 11 groups: A1–A4, B1–B3 and C1–C4.
   - Reconciled against the canonical reports, they cover the identifiers listed in `V1_BLOCKER_INVENTORY.md`.
2. **How many were duplicates or already closed?** 28 identifiers:
   - the SEC-O1-03 umbrella;
   - 19 closed by their judges;
   - 3 record-only items;
   - SEC-SC-O-1, OOS-1/2 and SEC-SC-O-2;
   - C-F01-1 r2.
3. **How many were actually corrected?** 10 inventory items, plus 2 defects of this candidate found by the judges and fixed in the cycle.
   - The 10: C-O1-3, SEC-SC-02, SEC-SC-03, QRE-INT-02, SEC-INT-02R, SEC-INT-06, SEC-INT-07, SEC-INT-04 rest, SSCTR-INT-R2-01, and G07's screen erasure.
   - O-SC-1 is closed at the V1 entry by a pinned test.
4. **Does a blocking runtime defect remain?**
   - For physical validation: **no**.
   - Before real athletes: one Low boundary-view item (SEC-BC-R2-01), with its fix named. Also the deferred minimisation items (SEC-INT-05 rest, -12) and the pre-existing SSCTR-BC-02/03 decisions.
5. **Is C-O1-3 closed?** **Yes** (SSCTR, Security, QRE).
6. **Are SEC-SC-02/03 closed?** **Yes** (Security CLOSED; SSCTR: no new clinical rule, no dose change).
7. **Is QRE-INT-02 closed?** **Yes.**
   - The re-sent run is recorded once and carried: 4 facts instead of 8, 0 withheld instead of 8.
   - A stop is still screened, and no hold or screen is bypassed (SSCTR, Security, QRE).
8. **Is SEC-INT-02R closed?** **Yes.**
   - p8: 6/6 refused.
   - q4: 13 more forgeries refused, legitimate shapes kept.
9. **Are the V1 growth limits sufficient?** **Yes, for the V1 entry.**
   - Back-dating is refused: Security's 480-report attack records 24, and the record grows to 277 KB instead of 695 KB.
   - Past a limit only a safety signal gets in, at most 3 more.
   - A session holds at most 5 voices through the boundary.
   - The engine-only merge growth (O-SC-1, 2000 parts) is not reachable from the app.
   - Long-term record size is linear in elapsed days; retention and archiving are a native/backend design item, with no runtime change.
10. **What dose changes were produced?** One, downward only (C-O1-3, above), authorized by SSCTR.
11. **Is the integration contract still compatible?** **Yes:** `api.mjs` is unchanged, journeys A–H are green, and there is one new refusal code.
12. **Did all essential flows pass?** **Yes, in Node:** onboarding, forms, HealthKit delivery, review, F08, readiness, break, restart, consent, erasure, the reads, and journeys A–H.
13. **What belongs to iOS/backend?** `NATIVE_OBLIGATIONS.md`:
    - store, anchor, Keychain and one writer;
    - JSC crypto host;
    - channels and HealthKit sources;
    - the queue rules, including `BEFORE_RECORD_START`;
    - the trusted clock (D1, 300 s);
    - erasure;
    - copy;
    - backup (D2) and minimum iOS (D3);
    - the R7-B0 records renewal before **2027-04-30**.
14. **What must still be proven on the iPhone?**
    - the JSC run of the RC fixtures (`focal`, `core`, `int`);
    - CryptoKit HMAC equal to Node's;
    - the bundle relinked with the boundary;
    - file protection when locked;
    - Keychain across reinstall;
    - process death mid-write;
    - disk full;
    - HealthKit background delivery with the app closed;
    - a real synced week.
15. **Is there a concrete technical reason to keep developing the engine before starting the app?** **No.**
    - Nothing in the engine is required before SwiftUI, backend and HealthKit work begins.
    - The remaining real-athlete items are small boundary or view fixes and decisions that can run alongside the app. None changes the public contract.
16. **Is the candidate ready for physical validation?** **Yes:** `READY_FOR_PHYSICAL_VALIDATION` for synthetic use, with the bundle-relink condition above.
17. **What is the minimum next action for the FINAL RELEASE FREEZE?**
    1. The Founder authorizes the push of this line (with the earlier unpushed lines).
    2. The Mac/iPhone run per README §15, including §14 step 2: relink the bundle with the boundary.
    3. Then the FINAL RELEASE FREEZE, on the bytes the app consumes. It also folds in whatever the physical run requires, plus SEC-BC-R2-01 and the Founder's G07 confirmation if they are done by then.

No further mission is started here.
