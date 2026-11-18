# QRE_CORE_R1: independent Quality & Reliability review of the Core Safety & Lifecycle candidate

**Judge:** Quality & Reliability Engineer, independent instance (worker != judge: this instance wrote none of the code under review). Opus 5.5, effort high, Windows, Node 24.
**Candidate judged:** `0b8e45a` on `claude/v1-core-safety-lifecycle` (base `16577b6`), as dispatched. The Chief's follow-up `f3a8871` (restart namespace from the caller's intake, plus `REGRESSION.md`) is assessed in §4.
**Method:** by execution. The repro scripts and the 47 new `v1core-*` tests were run. The full suite was run on the worktree, on a clean `git archive` of `0b8e45a` and on a clean `git archive` of `16577b6`. Adversarial probes were run against the candidate and the base. The probes live outside the repo in `C:/Users/carva/AppData/Local/Temp/qre-core-r1-1795033884/probes/`: `e1-adv.mjs`, `e1-dump.mjs`, `e1-diff.mjs`, `parts-forge.mjs`, `restart-adv.mjs`, `forged-dbg.mjs`, `f99.mjs`/`f99b.mjs`, `forged-effect.mjs` and `expiry-adv.mjs`. No file under `CoachingCore/` was edited, no `verify-r*` or `npm run verify` was run, and git state was not touched.

## Verdict: **NOT_READY**

Two findings block. (1) The E-1 as-if invariant holds only when every report reaches the engine in one review. Once the record is carried between reviews, which is how a real record works, an athlete's correction of their own part after a device re-sync is lost or quarantined. In one case the athlete's later ADVERSE recovery is dropped from the week evidence, while the base keeps it. (2) The E-1 change moves RWS pace readings in 16 historical tests, including the band edges of a threshold calibration. These changes were not declared in CANDIDATE.md, and they need SSCTR disposition on top of a corrected E-1.

The QRE-AIF-02 restart identity, the QRE-AIF-01 expiry precedence (inside `v1-safety-index`), C-3, QRE-P0-03, the RFC-NUMERIC-1 tests and the report-voices guard hold under adversarial probing, with the conditions below.

## 1. Findings

### QRE-CORE-01: BLOCKING. The E-1 re-merge does not survive a carried record: the athlete's correction after a device re-sync is lost or quarantined, and an adverse response can be dropped

**What.** After a re-sync (D to D′) is merged with the athlete's part (A), the record holds a live row `D′` with `provenance.parts = {D′, A}` and a superseded row that lists `A` in `mergedSourceIds`. When the record is carried into the next review, the superseded row is processed first and claims `byEvent['A']` (`for id of mergedSourceIds: if(!byEvent.has(id)) byEvent.set(id,row)`). The live row cannot then claim it. An athlete correction `A′ (correctionOf A)` therefore finds `old` already superseded, so it inherits nothing and retires nothing. It falls through to the duplicate path against the live `D′+A` row, where:
- if the response changes, it is a response conflict: `DUPLICATE_CONFLICT_QUARANTINED`, the row is flagged `conflicted` and the athlete's edit is refused;
- if only `rpe` changes, `mergeActual` keeps the higher-ranked device row's value, so the edit is silently lost;
- if a conflict already stands and an agreeing correction arrives, the conflict is never cleared.

Inside one review the same reports give the correct as-if row, because `byEvent` is set to the live row there. The result therefore depends on how the reports were batched.

**Evidence.**
- `node e1-dump.mjs <root> worse-after-resync v1-strength-index.mjs`. The athlete first said COMPATIBLE, then the device re-synced, then the athlete corrected to ADVERSE/HARDER/rpe 9, in separate reviews.
  - **base `16577b6`:** the edit merges, `adverse: 1` at the edit and on the Sunday probe.
  - **candidate:** `excluded: ["ath-1b:DUPLICATE_CONFLICT_QUARANTINED"]`, the row stays `COMPATIBLE/COMPATIBLE/ON_TARGET`, `conflicted: true`, and `adverse: 0` on the Sunday probe. This is a safety-relevant regression: the athlete's later adverse response no longer reaches the evidence.
- `node e1-dump.mjs <root> edit-after-resync`. ADVERSE corrected to COMPATIBLE after a re-sync gives the same quarantine on the candidate. The base merges the edit.
- `node e1-diff.mjs <root>` (differential: the same reports in one `normalizeObservations` call, or one per call with the record carried as `JSON(accepted + supersededRows)`). The candidate diverges in **6 of 7** sequences:
  - resync then edit: one call gives `A>13 rpe=5 COMPATIBLE`; carried gives `D>12 rpe=8 ADVERSE conflicted=true`;
  - resync then rpe-only edit: carried keeps `rpe=8`, so the edit is lost;
  - resync, edit, resync: carried gives `rpe=8`, the edit is lost;
  - conflicting resync then agreeing athlete edit: carried stays `conflicted=true`;
  - conflicting resync then agreeing resync: one call loses the athlete part (`rec=UNKNOWN`), carried keeps it.
  
  The base also diverges (4 of 7), so batching dependence is not new. But the candidate's claim is precisely the as-if row plus "persist-restore changes nothing", and on the carried path it turns the base's working athlete edit into a refused conflict.
- `e1-adv.mjs` case 1 shows the same contrast through the engine client: "separate reviews" gives the conflict, "one review" gives the as-if row.

**Why the tests miss it.** `v1core-e1` "the athlete edits only the athlete part" edits the athlete part without a prior re-sync. "order-independent" checks one arrival order, in one call. No test carries a re-merged row into a later correction.

**Minimal fix I would accept.**
1. In `normalizeObservations`, a live (non-superseded) row maps every id in its `provenance.parts` in `byEvent`, overriding a superseded row's claim. Equivalently, a correction whose `old` is superseded resolves to the live row of the same identity whose `parts` holds `correctionOf`.
2. The corrected part leaves `parts` after an agreeing correction resolves a conflict.
3. Add a differential test: one call ≡ one call per report with a JSON-carried record. It should cover resync then edit, edit then resync, resync/edit/resync, rpe-only edits, conflict then agreeing correction from each voice, and three voices, with assertions on actual, response, `conflicted` and the week evidence (`adverseSessions`).

### QRE-CORE-02: BLOCKING. The E-1 change silently changes RWS pace readings and calibration (16 historical tests); "failures by design" was under-declared

**What.** The full suite on `0b8e45a` gives **1651 tests, 1629 pass, 22 fail** (worktree run, 477 s; the clean-archive run is in §3). CANDIDATE.md §3 declares 5. The 17 others pin RWS lineage and withholding readings that the E-1 re-merge now changes. Examples from the failure output:
- `v1rws-e01:150` "E-01 in every order of arrival…": `REPORT_NOT_CARRIED ×4` becomes `SEVERAL_RECORDINGS ×4`, and **the threshold band edges move from 290/325 to 300/335 s/km** ("one review" order);
- `v1rfc-evidence:52` "adherence is not pace evidence…": the corrected row now carries distance (`'distanceKm' in row.actual` false→true), and `paceWithheld` goes from `REPORT_NOT_CARRIED` to `null`;
- `v1rws-e01:177`: the withholding word becomes `CORRECTED_MEASUREMENT`;
- `v1rws-lineage` matrices EASY/LONG, D-01, race rows, late re-sync, queued review, L4-e; `v1rws-final-fix` C-01; `v1rws-fix-forward` B-01.

These are sporting readings: pace evidence, band edges and the history reference. They are not mechanical identity changes. The mission scope says "no new sporting behavior". The Chief's `REGRESSION.md` (in `f3a8871`) now attributes them to E-1 and says they are **not** declared by design until SSCTR and QRE judge them.

**QRE judgment.** They cannot be accepted as by design on this candidate. The E-1 composition they now read is itself not stable across a carried record (QRE-CORE-01), so the new readings are not yet a defined behavior to approve.

**Minimal fix I would accept.**
1. Fix QRE-CORE-01 first.
2. SSCTR dispositions the RWS reading change: which rows are pace evidence after a re-sync, and whether the band shift is wanted.
3. Successor tests state the new expected readings explicitly for each of the 16 cases. Do not edit the historical tests; supersede them, recorded in the regression ledger.
4. Re-run the full suite with an exact attribution of every failure.

### QRE-CORE-03: CONDITION. After a restart, a new report can supply the engine-owned `context` and `comparable` flags, and they are kept

**What.** `bindObservations` carries "exactly as recorded" any accepted row whose `sessionId` is outside the plan's namespace and whose `context.sessionId === sessionId`. It does not check that the row came from the carried record. A **new** observation that carries a forged `context` (for example `sessionType: RUN:EASY`, a `plannedHash`, `weekIndex`) and `comparable: true` therefore keeps them. Custody forwards observation objects whole (`custody.mjs:182 {...x, eventId, athleteId}`).

**Evidence.**
- `node f99.mjs <cand>`: after a restart, a new report for `w99-run-d3` with a forged context is stored with `sessionType: RUN:EASY, comparable: true`.
- `node f99b.mjs <base>`: the same report is rewritten to `UNPLANNED, comparable: false`.
- `forged-effect.mjs`: the forged row changes `runFormat.history.runs` in the answer and in the next review.

**Minimal fix.** Apply the carry-as-recorded rule only to rows from the prior record. Alternatively, strip `context`, `comparable`, `partial`, `confounded` and `logs` from non-carried observations in `normalizeObservations`. Add a test with a forged context on a new report after a restart. Security to confirm against the D1 custody threat model.

### QRE-CORE-04: CONDITION. `provenance.parts` of a carried row is not validated; an invalid part either enters the live row or makes every later correction HOLD

**Evidence.** `node parts-forge.mjs <cand>`:
- a carried part with `response.recovery: 'BOGUS'` produces a live row with `recovery: 'BOGUS', effort: 'WHATEVER'` after a correction. This bypasses the `INVALID_RESPONSE` screen that every observation passes;
- `parts.A = null` or a part without `actual` throws `TypeError` inside `normalizeObservations`. The engine catches it as `HOLD (Malformed review facts)`, so the record is poisoned for every review that brings a correction of that execution.

Reaching this needs a tampered record. Custody's HMAC chain covers it; the on-device envelope custody (D1) is open.

**Minimal fix.** Validate each part on carry with the observation rules (`RESPONSE` enums, `actual` numerics, `completed` boolean). A row with an invalid part falls back to the legacy correction path, flagged, and never throws. Add a test.

### QRE-CORE-05: CONDITION. The QRE-AIF-01 fix exists only in the new entry; custody's default engine and the integration facade still refuse a warning sign after expiry

**Evidence.** `node expiry-adv.mjs <cand>`:
- `createCustody` with its default engine (`v1-index.mjs`): a warning sign on 2027-05-02 gives **`UNSUPPORTED`**;
- the same custody with `engine: v1-safety-index`: `CLINICAL_HUMAN_REQUIRED`.

The AIF harness facade (`harness/lib.mjs`, the P0 J5/P16 journeys) still imports `v1-strength-index`, and its envelope still checks `engine === V1_STRENGTH_ENGINE`.

Two consequences:
- **The repro script does not show the fix.** `repro-p0.mjs <v1-safety-index.mjs>` still prints `signAfter: UNSUPPORTED`, because its expiry branch uses `createClient()`, which is hard-wired to `v1-strength-index`. The entry argument only affects `generateAfter` and the custody branch.
- **A base envelope restores without an engine-id change.** CANDIDATE §5's "the envelope engine id changes, so such an envelope is refused" holds only once the integration moves to `V1_CORE_ENGINE`. Meanwhile `V1_STRENGTH_ENGINE` now names changed behavior (namespace and E-1 live below it) with no id change, so a base envelope restores silently.

**Minimal fix.**
1. Make the integration entry `v1-safety-index`: custody's default engine, or an explicit custody configuration covered by a custody-level expiry test.
2. Fix `repro-p0.mjs` so its expiry branch uses the selected entry.
3. Record or version the behavior change under `V1_STRENGTH_ENGINE`.

### QRE-CORE-06: CONDITION (route to SSCTR/PCG). The clinical answer after expiry also carries readings computed under the expired authority

**Evidence.** `expiry-adv.mjs` `clinicalPayload`. The `CLINICAL_HUMAN_REQUIRED` answer of 2027-05-02 (no proposal, 0 executable sessions, no offers) also carries `runForecast`, `paceInsights`, `runCalibration`, `qualityAssessment`, `updatedModel` (the learning update), `runFormat` and `weekEvidence`. All are computed with the review-by dates set aside. CANDIDATE §1 says only `CLINICAL_HUMAN_REQUIRED` is taken from that reading, but in practice the whole answer is taken.

**Minimal fix.** Either SSCTR/PCG accept that the clinical answer is the same answer as before the date, all fields included, or `v1-safety-index` strips or marks the non-clinical readings (forecast, insights, calibration, model update) when it answers from the undated reading. Add a test of whichever is chosen.

### QRE-CORE-07: CONDITION. Several tests are weaker than their labels (this gap let QRE-CORE-01 through)

- `v1core-e1` "the corrected row is the row … (order-independent)" runs one order in one call; it never carries a record (QRE-CORE-01).
- `v1core-expiry` "records missing, altered or vetoed are not expiry" runs at **2027-04-29, before the date**, so it does not test the post-expiry branch it names. My probe covers it, and it holds: altered and missing records after the date give `UNSUPPORTED`, `authorityExpiry: undefined`.
- `v1core-restart` "the first report of the new plan…" ends with `assert.ok([...].includes(r.status)||typeof r.status==='string')`, which is vacuous.
- `v1core-expiry` "a readiness release prescribes nothing" accepts either `CLINICAL_HUMAN_REQUIRED` or `UNSUPPORTED`. Acceptable, but it should pin the one the engine gives.
- `repro-p0.mjs`: see QRE-CORE-05.

**Minimal fix.** Tighten these as part of the 01 and 05 fixes.

### QRE-CORE-08: NOTE. Expiry precedence: no bypass or widening found; one mislabel

Probed after the date:
- altered core record: `UNSUPPORTED`, no marker;
- missing core record: `UNSUPPORTED`;
- vetoed non-core record (B0-C12): clinical answered. The authority is valid without it, as it is before the date;
- invalid input: `UNSUPPORTED` or `HOLD`;
- a caller `repertoire`: excluded.

Only `CLINICAL_HUMAN_REQUIRED` with no proposal is ever taken from the reread.

Two notes:
- **Mislabel.** A caller `options.authority.repertoire = {valid:false}` after the date returns `UNSUPPORTED` with `authorityExpiry: {status:'EXPIRED', clinicalRouteAnswered:false}`. The refusal is the caller's authority, not expiry. It should not be marked.
- **Caller-supplied records.** `options.repertoireRecords` is caller-supplied authority that §4 does not list as excluded. Records without dates give a full `MODIFY` after the date (`callerRecordsWithoutDates_weekly`). This is the same power the base already gives, so it is not a widening by this line, but custody must never forward it.

### QRE-CORE-09: NOTE. Restart identity holds

`restart-adv.mjs` and the 10 `v1core-restart` tests show:
- the namespace is the same for one instant written in two offsets (`-03:00` and `Z`);
- it is identical through a JSON-carried record;
- a caller cannot set it: the string option and the intake field are ignored, and the symbol is not exported from any entry;
- the custody path works after a restart (base: `ENGINE_CONTRACT_VIOLATION`; candidate: `KEEP`).

`repro-restart-rebind.mjs` reproduces the base defect, and `repro-p0` shows distinct plan B ids on the candidate.

**By design, harmless:** two restarts at the same instant with the same facts share all ids (`sameInstantChain: sharedIds 6`). The plan is identical, and no row of it can exist before its start date.

### QRE-CORE-10: NOTE. Performance

Review latency is unchanged within noise (REGRESSION.md: median 0.97×, p95 1.03×). Suite wall time is in §3. The record grows **1.61×**, because parts are kept on merged rows and copied into superseded rows. That is acceptable against the measured 50 ms envelope-write budget. Revisit the reduction options in REGRESSION.md before records span a season.

## 2. Claims checked by execution (summary)

| Claim | Result |
|---|---|
| AIF-01 reproduced on base | yes (`repro-p0`: sign UNSUPPORTED on 05-01) |
| AIF-01 fixed | yes **only via `v1-safety-index`** (`v1core-expiry` 9/9; `expiry-adv` custody with that engine). Not via custody default or facade (QRE-CORE-05) |
| AIF-02 reproduced (wider) on base | yes, rerun by me on the `16577b6` archive. `repro-restart-rebind`: a plain review after the restart re-binds every plan A row (`plannedHash` replaced, `dateShift −21`). `repro-p0` custody: `afterRestart: ENGINE_CONTRACT_VIOLATION` |
| AIF-02 fixed | yes (QRE-CORE-09); forged-context hole (QRE-CORE-03) |
| E-1 fixed | **only within one review**; on the carried record the athlete's own corrections regress (QRE-CORE-01) |
| QRE-RWS-F-01 (a) guard | `v1core-voices` 5/5; the guard refuses the four mixed forms; the surface field stays open as declared |
| C-3 | 4/4 locale tests; the code-unit comparator is order-equivalent for the ASCII ids and ISO dates sorted there |
| QRE-P0-03 | reason names the class; `errors` unchanged; suite green on that path |
| RFC-NUMERIC-1 | 2/2; ULP-moved `exp/log/pow` touch only `runForecast` non-integer leaves and its runtime-local hashes |
| New tests | 47/47 pass on `0b8e45a` (`node --test test/v1core-*.test.mjs`, 10.2 s) |
| "Failures by design" (§3) | incomplete: 22 failures, not 5 (QRE-CORE-02) |

## 3. Full suite

| Tree | Tests | Pass | Fail | Wall |
|---|---|---|---|---|
| worktree at `0b8e45a` (+ uncommitted P0 build files outside `CoachingCore/`) | 1651 | 1629 | 22 | 477 s |
| clean archive `16577b6` | 1603 | 1600 | 2 (+1 skipped) | 277 s |
| clean archive `0b8e45a` | 1651 | 1629 | 21 (+1 skipped) | 256 s |

- **Base:** the 2 failures are the two pre-existing freeze checks (`V1RC COACHINGCORE-V1-FREEZE-1 …`, `I10, V6 …`), as declared.
- **Clean candidate:** 21 failures. The V1STR freeze test (`the four earlier freezes are preserved …`) skips in a `git archive` tree and fails in the worktree, which accounts for the 22nd. The failure set is otherwise identical to the worktree run, so the uncommitted P0 build files outside `CoachingCore/` affect nothing.
- **Wall time:** the two archive runs were sequential, each with the machine to itself. The candidate is not slower (256 s vs 277 s), so there is no material increase in review cost (QRE-CORE-10). The 477 s worktree run overlapped with my probes and is not a timing reference.

## 4. Does `f3a8871` change any finding?

No. `f3a8871` changes only `r6-index.mjs`: the namespace is hashed from the caller's intake plus the instant, with no record-derived fact. It also adds REGRESSION.md.

- **QRE-CORE-01:** unchanged. `node e1-diff.mjs` on a clean archive of `f3a8871` still diverges in 6 of 7 sequences (`r6-provenance.mjs` is untouched).
- **QRE-CORE-02:** unchanged in substance. The under-declaration is now disclosed in REGRESSION.md, which is the right record, but the readings still need SSCTR disposition on a fixed E-1.
- **QRE-CORE-03 to QRE-CORE-08:** unchanged. The files involved are not touched.
- **QRE-CORE-09:** still holds on `f3a8871`. `restart-adv.mjs` gives the same results: one namespace for two offsets, identical through JSON, not caller-settable.

The new namespace input makes restarts with equal caller facts at one instant share ids whatever the record holds. That is harmless for the reason given in QRE-CORE-09. It also removes the record-form dependence that broke `v1rws-e01` "from stored records … after a restart". I agree with that change.

## 5. Next action

Return to the owner, REQUEST_CHANGES:
1. QRE-CORE-01: fix, plus the differential carried-record test.
2. QRE-CORE-02: SSCTR disposition of the RWS reading change on the fixed E-1, plus successor tests.
3. QRE-CORE-03 to QRE-CORE-07 as conditions.

Re-review scope: `r6-provenance.mjs`, `r6-adaptation.mjs` `bindObservations`, `v1-safety-index.mjs`, the integration wiring, the new tests, and a full suite with exact attribution.
