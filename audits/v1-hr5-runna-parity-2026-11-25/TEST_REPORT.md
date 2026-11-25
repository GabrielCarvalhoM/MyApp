# V1HR5R — Test report

All athletes and records are synthetic. Host: Mac mini M4, macOS 27.0, Node v24.19.0, Xcode 27.2, Swift 6.4.2.

## 1. Node suite (CoachingCore)

| Run | Tests / pass / fail / skipped |
|---|---|
| The first amendment's line (`4850560`, V1HR5's record) | 1970 / 1922 / 48 |
| This correction at closing, production authority on (SSCTR-HR5R-RECHECK-r2) | **1993 / 1940 / 51 / 2** |

The three tests that fail beyond the 48 all fail **by design**; each has a successor that passes ([`results/node/suite-closing.txt`](results/node/suite-closing.txt)).

| Failing by design | Why | Successor (passes) |
|---|---|---|
| `v1hr5-amendment-record.test.mjs`: REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1 verifier passes | That record binds the revision-1 bytes | `v1hr5r-successors.test.mjs`: the amendment-1 verifier fails only on what amendment-2 declares; the amendment-2 verifier passes |
| `v1hr5-amendment-record.test.mjs`: the original freeze fails only on what amendment-1 declares | It now also names amendment-2's files | The same successor, which checks the original freeze verifier against amendment-1 plus amendment-2 |
| `v1core-expiry.test.mjs` QRE-AIF-01: byte for byte below the composed entry | The composed entry adds `heartRateProfileRecord` and `heartRateProfileDeclared` and resolves the five-zone reading | `v1hr5r-successors.test.mjs`: byte for byte with those keys and the five-zone reading set aside |

The 2 skipped tests are the amendment-2 record tests. They run once the closing commit writes the record.

### 1.1 Directed tests

**`test/v1hr5-five-zones.test.mjs`: 33/33.** It was rewritten to revision 2; the behaviour that is kept keeps its tests.

- **Authority:** fail-closed authority and its dependence on the run calibration's boundaries.
- **Acceptance 1:** a 30-year-old with no device gets 190 and Z1 ≤123 / 124–153 / 154–169 / 170–184 / ≥185, the cue at 170, and no measurement, distribution or live heart rate fabricated.
- **Acceptance 4:** every age 18–80 gets zones. Invalid ages are refused and none is recorded. With only "adult", the reason is `AGE_REQUIRED`, and a declared maximum still gives zones.
- **Aging:** whole years only. Past 80 there is no estimate (`AGE_OUTSIDE_ESTIMATE_RANGE`), while a declared maximum still gives zones.
- **Arithmetic:** for every maximum 120–230 and every whole bpm 1–260, exactly one zone, and x is in Z_k exactly when its percentage is above the lower and at most the upper. Readings are rounded half up. Broken values are refused.
- **Acceptance 2:** a strap maximum above the estimate replaces it; one below is shown, not used. The highest qualifying maximum is used. The lab maximum comes first, and its rules are kept. A conflict falls back to the age estimate, with both values shown; with no age, the reason is `REFERENCE_CONFLICT`.
- **Measured values:** optical, invalid, short and undated values are never a maximum. An optical value is classified with its sensor and the optical caveat.
- **Acceptance 3:** a declared maximum of 195 gives 126 / 157 / 173 / 189, ahead of lab, strap and age. Custom limits are exact, kept when the maximum changes, and ordered.
- **Declarations:** refused whole (11 cases).
- **Persistence:** a review keeps the overrides, a later measurement never displaces them, an unchanged value is not appended, a restart keeps them, a backdated declaration is refused, and only the athlete clears them.
- **Record integrity:** a row that was altered, belongs to another athlete, is dated in the future or names an unknown source is not read.
- **Sessions:** the cue at Z4's lower limit; no guidance for threshold, specific, race or strides work; the order (hold, then boundary, then mode, then family); the own-key family lookup; walk/jog keeps the zones and gives no session role; the newer-runner disclosure.
- **Acceptance 6:** age, a declared maximum or custom limits change no plan, pace, effort cue, strength value, decision or record. Under a hold the zones are withheld, the clinical answer is the one without heart rate, and the athlete's own fact is still recorded.
- **Determinism and fault isolation:** the same inputs give the same output; the week boundary holds; a break withdraws measured maxima only; a watchless athlete trains exactly as before; lab expiry works.
- **Classifier:** strap, ECG and optical series with provenance; the defaults (10 samples, 30 s gap, 80 % coverage); gaps and artifacts count as unknown; there is never a distribution from one value.
- **Texts and authority:** the production authority works end to end, and no output makes a threshold claim.
- **QRE-HR5R-07:** through the composed entry, a provisional session is cued from its own week's references (a strap maximum declared this week cues next week only); a declared maximum applies to every week at once.

**`test/v1hr5r-boundary.test.mjs`: 13/13.** These go through `createIntegration` and `api.mjs`.

- Onboarding with only an age gives five estimated zones.
- `setHeartRateProfile` makes **no engine call**, adds **no custody version or decision**, and leaves the plan hash the same.
- It refuses whole: invalid values, stale versions, a reused request id, extra fields, another athlete and an empty request id. A retry replays.
- Persistence over the **file store and anchor**: a reopen, a weekly check-in and a restart with a new age (the declared maximum is kept and the new age recorded beside it). Clearing returns to 189 (age 31).
- A changed carried profile gives `INTEGRITY_FAILURE`.
- No heart rate reaches telemetry. The inventory class is HEALTH with egress NONE.
- A record stored before the amendment reads as empty.
- Plus one regression test per review finding ([INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md)):
  - QRE-HR5R-01: the null-screen erasure path;
  - 02: accept keeps the override;
  - 03 / N2: consent to record, none to erase;
  - 04: offsets +600, +60, −180, −600 and the same-day restart;
  - 05: forged and invalid intake records and rows;
  - 06: carried rollback;
  - 08: erasure and compaction;
  - N1 / N3 / N4: rollback acknowledgement, erasure under a clock behind the record, no copy in a pending change.

## 2. Regression proof

[`evidence/regression-diff.mjs`](evidence/regression-diff.mjs) replays every recorded boundary journey, with the same clock, ids and key: int (78 steps), final (184) and V1HR5's hr5 (64). It runs them through the first amendment's engine (a checkout of `4850560`) and through this tree, and compares every answer and stored document in full.

- **326 steps, 0 unexplained**, at the fixtures' offset (−180) and at **+600** (`--tz 600`). Verdict: `FIVE_ZONE_READING_AND_PROFILE_ONLY` ([`results/regression-diff.json`](results/regression-diff.json), [`-tz600`](results/regression-diff-tz600.json)).
- The only differences:
  - the five-zone reading itself (428);
  - the hash that covers it (428);
  - the carried seal and the carried sequence `carried.seq` (QRE-HR5R-06), 415 each;
  - the added profile keys (418).
- 3 steps were skipped: the window of a tamper of a revision-1 value, which the revision-2 document does not contain.
- The int and final athletes carry an age (32), so their five zones now exist where revision 1 had none. Nothing else of any answer moved.

**Neutrality of the heart-rate operations** ([`evidence/hr-neutrality.mjs`](evidence/hr-neutrality.mjs), QRE-HR5R-09):

- The same 326 steps were replayed on this tree twice: as recorded, and with heart-rate writes injected (a maximum and custom limits after the first plan, a new maximum half way, an erasure near the end; 75 writes).
- **0 unexplained** at −180 and +600. Verdict: `HEART_RATE_ONLY`.
- Only the five-zone reading, the profile record, the carried seal and sequence, and the injected requests' idempotency entries differ: no plan, session, decision, version, screen or engine record.
- Three injections that fell after a journey's first `raw.keep` were not made and are counted (a later restore would be a real rollback, which test 06 covers).

## 3. Swift

| Package | Result |
|---|---|
| `proposals/CoachingPresentation` (contract delta) | **10/10**: FrozenShapeDecodingTests 6 (unchanged, over the corrected captures), FiveZoneDecodingTests 4 (rewritten) |
| `native/ios` P0Host on macOS JavaScriptCore | **29 tests, 0 failures**, 6 phase tests skipped by design ([NATIVE_VALIDATION_REPORT.md](NATIVE_VALIDATION_REPORT.md)) |

## 4. Verifiers

- `native/build.sh --twice`: deterministic, the historical package unchanged, V1HR5's evidence unchanged, and the bundled values equal to the engine pin.
- `scripts/v1-hr5-runna-amendment.mjs --check`: run by the closing commit ([FIVE_ZONE_AMENDMENT_2.md](FIVE_ZONE_AMENDMENT_2.md)).
- `scripts/v1-five-zone-amendment.mjs --check` and `scripts/v1-final-release-freeze.mjs --check` fail by design, and only on declared files, as the successor test proves.
