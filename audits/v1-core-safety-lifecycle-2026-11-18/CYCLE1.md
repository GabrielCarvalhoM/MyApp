# The one correction cycle on R1

**R1 on `0b8e45a`:**
- **QRE:** NOT_READY (QRE-CORE-01, -02 blocking);
- **SSCTR:** NOT_READY (SSCTR-CORE-B-01 blocking; a, c, d approved with conditions);
- **Security:** PASS_WITH_CONDITIONS (SEC-CORE-01, -02 before freeze).

**Cycle commit:** `430c493` (sources and tests). Mac outputs regenerated in `6b11b34`. The reviews are kept as received in `reviews/`.

This is the only cycle. Its recheck is narrow, on the findings below. If a material blocker remains, the mission closes PARTIAL/BLOCKED for that item; no second cycle follows.

## Fixed in the cycle

| Finding | What was wrong | Change (`430c493`) | Evidence |
|---|---|---|---|
| **QRE-CORE-01** (blocking) | When the record is carried between reviews, a superseded merged row claimed the athlete's id first. A later athlete correction then went down the duplicate path (quarantined or dropped) | `r6-provenance.mjs`: **(1)** a live row answers for the reports it holds as parts (ids its own provenance merged) before any superseded row; **(2)** a correction inherits the other valid parts of the live row that names the corrected report, also when it resolves a standing conflict | `v1core-cycle1`: a five-sequence differential (one review per report, the record carried through JSON) gives exactly the row one normalization call gives, in every QRE sequence; "the athlete corrects to ADVERSE after a re-sync" counts `adverseSessions: 1` |
| **SSCTR-CORE-B-01** (blocking) | A symptom stop reported after a restart for an earlier plan's session did not ask for the screen | `v1-run-format-index.mjs`: the screen reads a stop on any row the engine does not know to be another sport's (record), and on any report of a session the plan in force does not hold (request). Only the stop is read; no new criterion | `v1core-cycle1` B-01 matrix: a late report with and without eligibility, the next review, a late correction, after a restore, after a third plan. All `REQUIRED` with the session named |
| **SEC-CORE-01 = QRE-CORE-03** | A new report could bring its own `context` and `comparable` and escape binding | `normalizeObservations(..., {incoming:true})`, set only at the two review call sites in `r6-adaptation.mjs`. A review's incoming report loses `context` and the merge provenance it claims. The learning model and the other internal readers, which pass bound rows, are unaffected (preservation shows it) | `v1core-cycle1` "sneaky context": the row is `UNPLANNED`, `comparable: false` |
| **SEC-CORE-02** | A new report's forged `provenance.parts`, `mergedSourceIds` and `inputHashes` were kept | same strip; parts are built only from validated reports | `v1core-cycle1` forged parts: the parts are the reports' own; after a re-sync, the athlete's `ADVERSE` stands |
| **SEC-CORE-04 = QRE-CORE-04** | A malformed part on a carried row could reach the live row or throw | `validPart` (the same checks a report passes). A malformed part is not read: the correction replaces the row as before. Never throws | `v1core-cycle1`: three malformed forms; no HOLD, no row lost, no `BOGUS` value |
| **SEC-CORE-05**, QRE-CORE-08 | The `EXPIRED` marker sat on refusals caused by something else, and on a caller's own authority | `v1-safety-index.mjs`: no marker when the dates set aside still refuse; a caller's `authority` (like its `repertoire`) excludes the re-reading | `v1core-cycle1`: missing or vetoed records, and another policy, after the date: `UNSUPPORTED`, unmarked |
| **QRE-CORE-06** | The clinical answer after the date carried readings computed with the dates set aside | `v1-safety-index.mjs`: the clinical answer keeps the refusal's `runSessions`, `runFormat`, `runCalibration`, `runForecast`, `paceInsights`, `paceRevision`, `strengthExposure`, `qualityAssessment` and `weekEvidence`, and no `updatedModel`. The clinical route and the recorded facts are unchanged | `v1core-cycle1` QRE-CORE-06 |
| **QRE-CORE-05** (part) | No custody-level expiry test | test with `v1-safety-index.mjs` injected into the V1CIB custody | `v1core-cycle1`: through custody, a sign after the date is `CLINICAL_HUMAN_REQUIRED` and kept |
| **QRE-CORE-07**, SSCTR A-C4 | Weak tests | the differential replaces the single-call "order-independent" check; the integrity-after-the-date test; the vacuous restart assertion pinned to `KEEP`; the readiness status after the date pinned to `CLINICAL_HUMAN_REQUIRED` | `v1core-cycle1`, `v1core-restart` |
| **SEC-CORE-12** | `e.message` at `r6-legacy:143,332` | error class (`TypeError`, the only class those catches admit) | — |

**Preservation after the cycle:** on a fresh copy with every cycle file, P0's `lab/oracle.mjs` regenerates J5, its answers and P16 **byte-identical**. A first version of the strip ran on every non-prior row and changed the learning model; it was found by this oracle and scoped to `incoming`. `mac/vm-check.mjs` passes (JIT and `--jitless`), and `core-oracle` is deterministic.

## Not changed in this cycle, by decision (conditions carried to integration or to the Founder)

| Finding | Why not here | Where it goes |
|---|---|---|
| QRE-CORE-02 (RWS readings move) | SSCTR accepts it expressly as rule L1 (C-C1). It blocked only while E-1's composition was unstable (QRE-CORE-01, now fixed) | the 16 historical tests stay unedited; their invariants are restated in the as-if form in `FINAL_READINESS_REPORT.md` |
| SEC-CORE-03 (author of a correction) | A limit of E-1, not a regression; it needs `speakerOf` in the engine's provenance (a layering decision) | before integration (Security) |
| SEC-CORE-06, -07, -10; QRE-CORE-05 (the rest); SSCTR A-C1, C-C3 | Integration wiring: the bridge forwards no options; the app and custody call `v1-safety-index.mjs` with its engine id; `report-voices` becomes a per-channel allow-list at ingest, with adapter tests | integration mission |
| SSCTR A-C2, A-C3, A-C5, C-C4, C-C5, D-C1, D-C2 | App, product and device conditions | integration / Mac run |
| SSCTR C-C2 (rows without parts keep the E-01 withholding) | Engine-level test only: a legacy row is corrected exactly as before. **No RWS-level withholding test was written** | open condition |
| SEC-CORE-08 (clock rollback evades expiry), -09 (G07 retention of `parts`), D1, D2 | Founder decisions | Founder |
| SEC-CORE-11 (namespace shape on read; 40 bits), -13 | Notes | recorded |
