# ROOT_CAUSE_CLASSIFICATION — the 51 failures, by cause

All athletes and records are synthetic. Per-test rows are in [RESOLUTION_MATRIX.md](RESOLUTION_MATRIX.md) and [FAILURE_INVENTORY.md](FAILURE_INVENTORY.md); the machine-readable form is [`CoachingCore/test/HISTORICAL_TESTS.json`](../../CoachingCore/test/HISTORICAL_TESTS.json) and [`evidence/inventory.json`](evidence/inventory.json).

## Result

| Category | Meaning (mission) | Tests | Of the 51 |
|---|---|---|---|
| **A** | contract or record of an earlier line, replaced by a versioned amendment | 31 (H52, H53 included) | 29 |
| **B** | the test pinned a defect, or the compensation for one, as its line's behaviour; a later versioned amendment corrected it | 22 | 22 |
| **C** | defect still reproducible | **0** | 0 |
| **D** | infrastructure or environment | **0** | 0 |
| **E** | known blocker kept on purpose | **0** among the failures (the open limits are passing tests; §E) | 0 |

**51 = 29 A + 22 B.** No failure is a defect of the current runtime. That conclusion does not rest on the failures having persisted across versions. It rests on four checks, made for every test:

1. **Own context.** Each test is replayed at all 73 first-parent commits that touch `CoachingCore`. Each one passes at a commit of its own line and first fails at a named amendment commit ([`evidence/provenance-matrix.json`](evidence/provenance-matrix.json)). The historical suite re-runs each at that commit: **53/53 pass**.
2. **Declared change.** That amendment is recorded, with its reason, in its mission's audit and successor ledger (`supersededBy`).
3. **Current contract.** A successor asserts the contract in force, and it passes on the current tree (the active suite checks this on every run).
4. **Safety points.** For the safety points, the current behaviour is reproduced through the integration API the app uses (`test/v1san-boundary-safety.test.mjs`), not only through the frozen functions. A targeted mutation shows those boundary tests detect the defect (REGRESSION_REPORT.md §3).

## Root causes (consolidated)

| RC | Cause | Tests | Kind |
|---|---|---|---|
| **RC-1** | **Line-local record tests.** Each freeze or amendment verifier asserts that the files it binds are byte-identical and that *nothing else in CoachingCore changed since its base, tests included*. Every later line changes a bound file, or at least adds a test, so the record test fails on every later line by design. Each mission then wrote a successor, which the next mission broke again. That is the chain that grew to 51. | H01 H02 H05 H11 H12 H17 H18 H19 H23 H24 H25 H28 H29 H37 H51 (+ H52 H53, made historical by this mission) | A |
| **RC-2** | **Core Safety & Lifecycle (`0b8e45a`, cycle `430c493`).** **E-1 fixed** in `r6-provenance.mjs`: a correction replaces only its own author's part of a merged row (the as-if invariant). Also **QRE-AIF-02**: a restart has its own namespace. Tests written against the frozen engine pinned the defect itself (HARD GATE E-1, LIMIT E-1, QRE-RFC-A-03's id collision). Others pinned the E-01 patch's compensation for it: `REPORT_NOT_CARRIED`, the run withheld from pace evidence because the re-synced row no longer carried the athlete's report. With E-1 fixed the row carries every report in force, so those readings return to the merged row's. | H30–H36, H38, H39, H41–H50 (B); H40 (A: SSCTR-RWS-B-01's order behaviour, then O-1) | B (19), A (1) |
| **RC-3** | **C-F01-1 r2 (`3f0b04f`).** The restart reads what the record shows took place. QRE-F01-01 pinned the open behaviour: with reports present but none in force, the stated 600 min / 7 days stayed unbounded. It is now bounded to the record, 0/0, which is lower and never higher. SSCTR_F01_R1_ADDENDUM (b) pinned "today's behaviour, NOT a decided reading": the SB-1 question was not asked after a disputed-amount session. It is now asked (D1). | H03 H04 | B |
| **RC-4** | **SEC-R2-03/-04 (`4e8cffe`).** A refused correction retires nothing. SEC-R2-01's first assertion pinned the orphan that the normalizer used to write. The orphan is no longer written, so the session stays in force and SB-1 reads the row in force. | H09 | B |
| **RC-5** | **The conflict-voice model.** NCC F1–F3 (`07301f3`). O-1 (`1d418d1`): a report refused for disputing its execution is kept as a voice of the flagged row. Safety Continuity C-O1-2 (`ec811c1`): when every well-formed voice says a disputed session took place, it is an occurrence for the pause, never minutes or credit. These are **SSCTR decisions A and C** (SSCTR_O1_R1), queued for funded-human revalidation (HQ-SSCTR-O1-02). | H06 H07 H08 H13 H14 H15 H16 H20 H21 H22 | A |
| **RC-6** | **V1 blocker closure (`6e85222`), reviewed.** QRE-INT-02 closed: a workout the engine asked about is not recorded, and its receipt is no report in force. tm-5 had pinned it "as it stands". SEC-INT-07 adds `LIMITS.safetyExcess: 3`, so a report that states a safety signal is still admitted past the limits. | H26 H27 | A |
| **RC-7** | **FIVE-ZONE-AMENDMENT-2 (`23f6a86`).** The composed entry carries `heartRateProfileRecord` and `heartRateProfileDeclared` and resolves the five-zone reading. QRE-AIF-01's byte-for-byte comparison with the entry below therefore no longer holds as written. Its successor holds with those keys set aside. | H10 | A |

### Why B and not A for RC-2, RC-3 and RC-4

These tests did not verify a sound contract that was later replaced. They verified a **defect**, or a compensation for one, so that "nobody reads it as closed" (the comment above HARD GATE E-1 in `v1rws-lineage.test.mjs:592`). Their expectation is wrong for the current version, and a correct current rule exists. That is category B. The mission's remedy for B is "update the test or create its successor". Successors already existed: closure-2 generated them (`audits/v1-core-safety-closure-2-2026-11-18/successors/`), and the later ledgers added more. **The historical files are not edited.** Each is bound by an earlier freeze, and an edited historical test would no longer be the test that was green on its line. Every B entry's successor passes in the active suite. For the E-1 family, the boundary tests also pass, and so does the mutation.

### Successor chains, resolved to their active end

Several successors were themselves broken by the next line. Examples: closure-2's lineage matrix successor, broken by NCC then O-1, and closure-2's SSCTR-RWS-B-01 successor, broken by O-1. The manifest points every entry at the **active end** of its chain, and its validator refuses a successor that is itself historical. The chains, by ledger:

- `v1rws-lineage:146` (H41, H42) → closure-2 `v1core-successor-lineage` EASY/LONG (H21, H22) → NCC `…:303` (H15) → **O-1 `v1core-o1-successors`: "successor of v1core-successor-lineage.test.mjs:205 … the matrix passes whole in both families"**.
- `v1rws-fix-forward:285` (H40) → closure-2 `v1core-successor-fix-forward:105` (H20) → **O-1 "successor of v1core-successor-fix-forward.test.mjs:105 (SSCTR-RWS-B-01)"**.
- Freeze-record chain: V1RC → V1RWS → V1STR → closure-2 → C2-F01 → C-F01-1 r2 → SEC-R2 → NCC → O-1 → SC → V1INT → RC-1 → FINAL → AMENDMENT-1 → AMENDMENT-2 (H52, H53) → **`v1san-runtime-integrity.test.mjs`**. This last successor checks what the records protect, *by class*: the runtime is the bytes AMENDMENT-2 binds, and every record is its sealed bytes. Test-only work therefore never breaks it, and the chain stops growing.

## Category C, D, E: why each is empty

**C (defect still reproducible): none.** Every safety point was reproduced against the current runtime through `createIntegration` and api.mjs (Phase 3; [REGRESSION_REPORT.md](REGRESSION_REPORT.md) §3):

| Investigation point | Result through the integration API |
|---|---|
| HARD GATE E-1 / A-12 / SSCTR L5: a re-sync erases the athlete's answers | **Closed.** With the athlete first, the device first, or a late re-sync, the row in force keeps `ADVERSE`/`HARDER`, `adverseSessions` stays 1, there is one row, and completion is unchanged. With E-1 re-introduced (mutation), these tests fail at exactly that assertion (`UNKNOWN`/`UNKNOWN`). |
| Import against manual report (A12, B4-B5, B7, O-1) | One flagged row with both voices kept. It is never COMPLETED and never two executions, and the larger disputed amount is never dose. |
| Late corrections, calibration (QRE-RWS-B-01, C-01) | A duplicate workout and a duplicate form are duplicates: no write, no engine call, calibration unchanged. Only `asOf` and the hash that covers it move. |
| Warning signs, screen answers (SSCTR-RWS-B-01, SEC-R2-01) | A symptom stop survives an import and a re-sync of the same run. The row is flagged, the stop is a voice of it, and the screen is still asked (`RUN_STOPPED_FOR_A_SYMPTOM`). |
| Another athlete or plan (QRE-RFC-A-03) | Writes under another athlete change nothing: the record stays byte-identical. After a restart no new session id is an old one, and no new session is credited by an old row. |
| Duplicates counting effort twice | The same workout twice in one request is refused. Re-sent three times later it is a duplicate: `completedWork` is identical and there is one row. A second athlete form is `ALREADY_REPORTED`. |
| QRE-RWS-F-01 (open in the engine) | **Not reachable through the boundary.** A device report stating conditions is refused (`REPORT_VOICE_MIXED`), and the athlete's `HEAT` stays on the merged row. |
| Custody, versioning, recovery (SEC-R2) | A stale version gives `CONFLICT_STALE_VERSION`. A rolled-back document gives `RECORD_ROLLED_BACK`. A tampered carried record gives `INTEGRITY_FAILURE`. |

**D (environment): none in the project.** The active suite passes unchanged with `TZ=UTC`, with `TZ=Asia/Tokyo`, and with the wall clock moved 200 days ahead, past the R7B0 records' `review_by` of 2027-04-30 (REGRESSION_REPORT.md §4). Three environment effects were found, all in **this mission's own instrumentation**. None is a project failure, and each is documented:

- A `node_modules` *symlink* is an untracked file to the record verifiers, because `.gitignore`'s `node_modules/` matches directories only. The first replay therefore showed record tests as never green. The replay was redone with a copy, and the historical runner copies.
- node's junit reporter does not escape `>` inside an attribute, so a title such as "done -> not done" broke a naive tag regex and swallowed the following testcases. Both parsers now read quoted attributes, and they agree with an XML parser on all 1993 entries.
- node's default discovery counts the 8 helper modules under `test/` as passing tests, so the earlier totals included 8 pseudo-tests.

**E (known blocker kept on purpose): none among the failures.** The open limits that remain are **passing** tests that pin them, and they stay in the active suite. QRE-RWS-F-01 (`v1rfc-evidence`) is engine-only and refused at the boundary. The custody residual C-F01-2 is in `v1core-cf011r2-restart-evidence` C5. SSCTR-BC-03 (F6) is in `v1bc-cycle1`. The hold rule's known limitation SSCTR-STR-A-04a is in `v1str-time`. None of them was silenced or migrated.
