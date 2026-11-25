# V1HR5 — Test report (phase 6)

Everything is synthetic. The Node results are in `results/node/`, the Mac results in `results/mac/` and the iPhone results in [NATIVE_VALIDATION_REPORT.md](NATIVE_VALIDATION_REPORT.md).

## 1. Suite against the baseline

| Run | Tests | Pass | Fail | Distinct failing titles |
|---|---|---|---|---|
| Baseline, pristine `476b657` (`suite-baseline-476b657.txt`) | 1942 | 1895 | 47 | = the freeze record's 47 (diff empty) |
| Amended, content commit `822e2c0` (`suite-amended-822e2c0.txt`) | 1968 | 1920 | 48 | the 47, plus 1 by design |
| With the amendment record (`suite-amended-record.txt`, closing commit) | see §5 | | | |

- **New tests:** 26 (`test/v1hr5-five-zones.test.mjs`), all passing (`v1hr5-tests-822e2c0.txt`).
- **The one new failure (by design):** `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: RC-1 preserved but for the two declared amendments; … the record holds`. The original freeze binds the frozen bytes of `src/v1-run-calibration.mjs` and the frozen bundle, and the amendment changes the one and adds files to the other. Its successor is `test/v1hr5-amendment-record.test.mjs`, which proves two things:
  - the amendment's own verifier passes;
  - every line the original verifier fails on names only what the amendment declares.
- **No longer failing:** none. **No historical failure changed.**
- No test was modified to hide a divergence. The only edit to a test that already existed during the mission was to this mission's own file, and the reason was recorded each time:
  - a comparison of whole programs across different intakes was narrowed to `program.weeks`, because the program embeds its intake;
  - the degenerate-zone mutations followed the per-mille edges once the decision made them the computation.

## 2. The 26 directed tests (`v1hr5-five-zones.test.mjs`)

| Area | What is proven |
|---|---|
| Authority (fail closed) | The values are read only as the pinned bytes (one byte more and there are no values). An enabling record must be independent, bound to these bytes, with supported evidence and a source; one refusing record vetoes. The run calibration's HR and CAPACITY boundaries are required. A disabled calibration carries no key, as before. The production records path works end to end, and a record bound to other bytes enables nothing. |
| Calibration | Five zones from a strap maximum (186 → 134/149/162/171), nested in LOW/MODERATE/HIGH, sharing the three-zone edges, with full provenance and LOW/LOW confidence. The highest qualifying observed maximum wins. A lab maximum (190 → 137/152/165/175) is used under every HR5-2 condition. Each failed condition — no maximum, no protocol, more than 182 days, out of range, optical, no sensor, RPE 7 or unreported, not tolerated, stopped, cycling, modality undeclared — falls back to the observed maximum, or to no zones. `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN`. |
| Conflict | Observed 192 against lab 180 gives `REFERENCE_CONFLICT`, both shown, no cue. A lab above the observed maximum is used. 5 bpm above is inside the band, 6 is not. A lab test that does not qualify is no side of a conflict. |
| No reference / invalid | No data, age only, optical, declared maximum, RPE 7, below 140 or above 220, not tolerated, not completed, a short effort, an undated PB: no zones, typed reason. Non-numbers (`'186'`, −5, 0, NaN, ∞, null, {}, [186], 1e9) are refused, never coerced, never a throw. |
| Arithmetic | For every maximum from 140 to 220: contiguous, strictly increasing, open at both ends, equal to the three zones' `Math.round`, equal to integer half-up per mille. Degenerate, gapped or non-integer edges are refused. Impossible maxima (1000, 139, 221, 186.5, −186, `'186'`, null) are refused by the pure function (FND-HR5-02). |
| Decision binding | The values file equals SSCTR-HR5-DECISION-r1's machine values: zones, lab conditions, confidences, conflict, every family role, cue rules. The decision's worked examples (190, 150, 140) are what the engine computes. |
| Convention | A reading on an edge belongs to the higher zone. Without a plausible range there is no zone. |
| Sessions | One role per planned run session. Never primary. Effort always governs. The cue is at the Z4 edge, sustained readings only, never speed up, no health meaning, and never on strides. THRESHOLD, HM and M carry no guidance (ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS); 5K and 10K, LAGS; RACE, RACE_DAY_GUIDANCE_AS_APPROVED. A walk/jog beginner gets NONE. The NOVICE disclosure appears. The order is hold, then off (either boundary), then effort-only, then family. EASY_REESTABLISHMENT has a cue only in EASY mode. Prototype names fail closed. |
| Additive | Heart rate and the five zones change no prescribed session, no pace band, estimate, capacity, assessment or session guidance, and no other key of the answer. |
| Fault isolation | A broken five-zone authority gives `FIVE_ZONE_ERROR` and nothing else moves (QRE-HR5-08). |
| Flow | A maximum declared mid-week counts from the next week. A hold withholds the zones and every cue at once. A break of 14 days or more withdraws them (observed and lab). A lab maximum expires after 182 days. The watchless athlete trains exactly as with the extension off: same plan, ledger and reading. |
| Classifier (unwired) | Strap or ECG only. Gaps, artifacts and readings above 220 are unknown. Coverage is reported. The decision sets no limits, so none means no distribution. Zero, reversed or out-of-range limits are refused, and so is a duration shorter than the series. One value is never a distribution. |
| Texts | No physiological threshold claim in the values or any output. |
| Determinism | The same record gives the same bytes, and a JSON round trip is identity. |

## 3. Regression proof (`evidence/regression-diff.mjs`; `results/node/regression-diff-on.json`)

The recorded boundary journeys are replayed through the **frozen** engine (pristine `476b657`) and the **amended** engine, with the same clock, ids and key, and every answer and stored document is deep-diffed. The production authorities are used, so **the five zones are on**.

| Fixture | Journeys | Steps | With a difference | All explained by the added reading | Threw | Skipped |
|---|---|---|---|---|---|---|
| int | 4 | 78 | 78 | 78 | 0 | 0 |
| final | 12 | 184 | 166 | 166 | 0 | 0 |
| hr5 | 10 | 64 | 59 | 59 | 0 | 3 |

**Verdict ADDITIVE_ONLY: 0 unexplained.** The allowed differences are:

- the added `heartRateFiveZones` (428);
- the `hash` of a body that holds it (428);
- the `carriedMac`, only where that step's stored document adds the reading (408).

The 3 skipped steps are `hr5-strap#10–12`: a tamper of the new reading, which has nothing to tamper in the frozen document, up to its `raw.restore`. They are listed by name. A window left open would fail the harness, and so would a step that throws in either engine. The same proof with the zones off (before the enabling record) was also ADDITIVE_ONLY.

## 4. Swift contract (`proposals/CoachingPresentation`; `results/mac/swift-coachingpresentation.log`)

**9/9:**

- the unchanged `FrozenShapeDecodingTests` (6) over the **amended** engine's captures;
- the new `FiveZoneDecodingTests` (3) over captures made with the production authority: strap, lab, conflict, none, hold, safety fields, strides, disclosures, and backward compatibility both ways.

## 5. Closing run

The closing commit adds the amendment record and its verifier. Its suite result and the two verifiers' outputs are in §5 of [FIVE_ZONE_AMENDMENT.md](FIVE_ZONE_AMENDMENT.md).

## 6. Findings during testing

| Id | Finding | Disposition |
|---|---|---|
| FND-HR5-02 | `zonesFromMaximum` accepted an impossible maximum (1000 bpm gave edges of 720…) when called directly. The engine path was already bounded, so no output was ever affected. Found by the JavaScriptCore unit check. | **Fixed:** `plausibleReferenceBpm` in the values, enforced in the pure function; tested. |
| — | Process errors of this mission, recorded for honesty: (a) a baseline run was contaminated by an edit made while it ran, then discarded and rerun in a pristine checkout; (b) the first committed native package was built from the draft values (QRE-HR5-01), then rebuilt, with a build check added; (c) a review file was committed with a local home path, redacted before any push. | Corrected; none reached the remote. |
