# SEC_INT_R2: narrow Security recheck of the V1INT focal cycle

**Judge:** Security, Privacy & Abuse Architect, the same independent instance as SEC_INT_R1. I am not the author. **Date:** 2026-11-23. Synthetic athletes only.
**Scope:** only the R1 findings as `CYCLE1.md` dispositions them. This is not a new full review.
**Judged:** commit `d310fafbdb09b1d82f1ebe557259ac8fc5442f73`, the cycle over `a52db2b`.

| File | sha256 (first 16 characters) |
|---|---|
| `integration.mjs` | `c209775029a81dc9` |
| `admission.mjs` | `92631d69e2403d4a` |
| `custody.mjs` | `a3e604f6200fcc39` |

**Runs on `d310faf`:**
- Cycle tests: `v1int-cycle1` 12/12, `v1int-authorship` 16/16, `v1int-journeys` 8/8.
- R1 probes re-run: p1, p2, p4, p6, p5c.
- New probes:
  - `p7-device-screen-r2.mjs`. The cycle's `t.import` helper now answers the screen through the athlete channel first, so p3 no longer exercises the device route. p3's `restamped` row now shows the athlete answering, which is legitimate.
  - `p8-shape.mjs` and `p8-evolves-r2.mjs`.
  - `p9-intake-r2.mjs`.
- Run each from `CoachingCore/` with `node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/<file>`.

## Verdict: PASS_WITH_CONDITIONS

- **SEC-INT-01, -03, -09, -10 and -11 are CLOSED.** -01 and -03 were blocking.
- **SEC-INT-02 is PARTIAL.** The five R1 shapes are refused. Six new forgeries, built on the real engine rows, still pass (SEC-INT-02R).
- **SEC-INT-04, -05 and -08 are PARTIAL.** Their remainders are routed.
- **SEC-INT-06 and -07 are routed.**
- **Successor record:** yes, for synthetic use only, with SEC-INT-02R named in the record as an open condition (§3).

## 1. Status per R1 finding

| ID | Status | Evidence |
|---|---|---|
| SEC-INT-01 | **CLOSED** | p7. Every device-side way to state a screen is refused: `eligibility` beside the workouts, a `review` object, a `kind`, and `eligibility: null` are all `INVALID_REQUEST`; `eligibility` inside a workout is `UNKNOWN_FIELD`. After a symptom stop, a plain delivery carries the athlete's stored screen (from the stop day): KEEP, the workout recorded, and the screen still **REQUIRED**. An athlete screen from the future is refused and not stored, and the delivery that follows still asks. |
| SEC-INT-02 | **PARTIAL → SEC-INT-02R (open)** | p6: the 5 R1 forgeries are all `ENGINE_CONTRACT_VIOLATION`. p1 A–C: legitimate corrections on merged rows are still admitted. p8: six new forgeries pass, listed below. |
| SEC-INT-03 | **CLOSED** | p2 A. On an intact record that holds a CLINICAL_HOLD, the call answers `NOT_LOST`, and the record and its hold stay. |
| SEC-INT-04 | **PARTIAL, routed** | p2 B. Revoking HEALTH_SIGNALS now passes under a clock behind the record. `eraseHealthFacts` and a symptom-stop report are still `CLOCK_BEHIND_RECORD`. **Owner correction:** exempting erasure from the check is Engineering's work, as revocation was. Only the clock set **ahead** (trusted time) is Founder D1's. Before real athletes. |
| SEC-INT-05 | **PARTIAL** | p9. 3,000 or 500 anchors are refused (`intakeBytes`), a field nested 20 deep is refused (`depth`), and a restart is bounded the same way. **Remainder, not routed in CYCLE1 or contract §10:** within the bound, the free-text keys inside anchors are still persisted (60 notes of 480 characters), and a 64 KB intake becomes a 306 KB record. Route to **Core**: close anchors to their known keys. Before real athletes. |
| SEC-INT-06 | Routed (Engineering, SSCTR informed, before real athletes) | Correct in CYCLE1. **Record correction:** the contract §10 line has no owner or trigger; copy CYCLE1's. |
| SEC-INT-07 | Routed (as for -06) | As for -06. |
| SEC-INT-08 | **PARTIAL, routed to G07** | p4. The readings are dropped, the boundary's request record of the erased report is gone, and a retry of it is a new request. Remaining under Founder G07: the SYMPTOM stop in `runFormatRecord`, and the new `carried.screen` (the athlete's pain, injury and illness answers), which `eraseHealthFacts` does not erase. Account erasure removes both. |
| SEC-INT-09 | **CLOSED** (as a contract item) | §9.9 adds HealthKit sources (user-entered and other apps' writes excluded), no screen on the device route, one writer with compare-and-swap under a lock and stale-lock recovery, the logs rule, Keychain survival across reinstall, `acknowledgeRecordLoss` only from its screen, and the clock recovery screen. `anchorStale` is now returned. Two small additions, verified at iOS revalidation: account erasure also removes `.tmp`/`.lock` files, and §9 states what happens to the Keychain key. |
| SEC-INT-10 | **CLOSED** | Contract §8 restates the claim: `--check` exits 1 on this line by design, and FREEZE-7's 49 bound files are checked by direct hash. |
| SEC-INT-11 | **CLOSED** | p1 D: `DUPLICATE_IN_REQUEST` at admission. |

## 2. The tightened `evolves`: SEC-INT-02R

Each forgery below alters the engine's answer for the athlete's second report. It starts from the real engine row of that shape (`p8-shape.mjs`): MERGE for the device's 40 min then the athlete's 40 min, rpe 4, ADVERSE/IMPAIRED; KEPT VOICE for the athlete's 90 min. Both controls are kept.

| Forged | Result | Why it passes |
|---|---|---|
| MERGE: the new voice's `ADVERSE`/`IMPAIRED` left out of the merged response (all UNKNOWN) | **KEPT** | An unknown row response may stay unknown even when a new voice states a known value. |
| KEPT VOICE → MERGE: a disagreeing "not done" voice merged; `completed` true→false, minutes 0, row unflagged, conflict label gone | **KEPT** | "Every value is the row's or a new voice's", so `completed: false` from the new voice is allowed in MERGE. An execution and its dispute both disappear. |
| MERGE: rpe fabricated in the new voice and the row (sent 4, kept 9) | **KEPT** | A new voice is compared with its report on completion, stop, recovery and next-day function only. |
| MERGE: effort fabricated (ON_TARGET → TOO_HARD) | **KEPT** | Same as the rpe case. |
| KEPT VOICE: the kept voice's amount fabricated (sent 90, kept 300) | **KEPT** | Same as the rpe case. |
| KEPT VOICE: a conflict label of no known kind | **KEPT** | Any string is accepted as a label. |

**Severity: Medium (defence in depth).**
- Through the boundary, no input reaches these shapes. Only the frozen engine emitting a non-engine shape would.
- The R1 conditions asked for exactly these two invariants, and both are still unmet:
  - each new voice equals its report;
  - safety monotonicity: stop, ADVERSE, IMPAIRED and `completed: true` survive.

**Fix (narrow; owner Engineering (custody) with QRE):**
1. Each new part's `actual` and `response` are byte-equal to the report custody sent under that id. All four facts, not a subset.
2. In MERGE, `completed` is equal across the row, every new voice and the result. A disagreement is only ever a KEPT VOICE shape.
3. In MERGE, for each response key, if the row or a new voice states a known value, the result states one. `ADVERSE` and `IMPAIRED` from any of them survive.
4. A KEPT VOICE label is one of the labels `r6-provenance.mjs` writes.

Pin the six rows of `p8-evolves-r2.mjs` as tests.

**New, Low (SEC-INT-12).** `actual` is open below its top level on both channels: an unknown key is recorded as sent. p7 case 4 shows a workout's `actual.eligibility` stored in the row. It has no effect on the screen. This is the same class as the anchors in SEC-INT-05. Owner: Engineering/Core (close `actual` per channel). Before real athletes. Not blocking.

## 3. Decisions

- **The `custody.mjs` amendment may receive a successor record against COACHINGCORE-V1-FREEZE-1: YES, for synthetic use only, on two conditions.**
  1. The record names **SEC-INT-02R as open**. Owner: Engineering (custody) + QRE. Trigger: before any real athlete, or before any change to the merge or kept-voice code of `r6-provenance.mjs`, whichever comes first. The record does not claim SEC-INT-02 closed.
  2. The verifier declares the amended file with its base and new hashes.

  Reasons:
  - the amendment is necessary for the core run journey;
  - every R1 shape is refused, and no legitimate shape tested is refused;
  - the open gap needs the frozen engine to misbehave;
  - the one allowed cycle is used.

  This is not an engine freeze.
- **SEC-CORE-03: CLOSED at the portable layer.** Correction authorship and the screen now both follow the channel. **Native part open:** channel integrity and HealthKit sources (§9.1, §9.9), checked at IOS_REVALIDATION; Founder D1.
- **C-F01-2: CLOSED at the portable layer, for synthetic use** (unchanged from R1). The native store, anchor and one-writer part (§9.3, §9.4, §9.9) stays open, with IOS_REVALIDATION_PENDING.
- **SEC-O1-03, boundary part: PARTIAL.**
  - Every input route is now bounded: submit, import, review-level fields, and the enroll/restart intake.
  - Open: SEC-INT-06, SEC-INT-07, the SEC-INT-05 anchor remainder (Core), and O-SC-1 (Core).
  - It is **not** closed.

**Before real athletes (owners as above):** SEC-INT-02R, SEC-INT-04 (rest), SEC-INT-05 (rest), SEC-INT-06, SEC-INT-07, SEC-INT-08 (G07), SEC-INT-12, the §9 native obligations at IOS_REVALIDATION, and Founder D1/D2.

**Gate scope:** `d310faf` only. **V1 authority:** NO.
