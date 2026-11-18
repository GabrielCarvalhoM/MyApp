# SSCTR closure-2 review R1: Core Safety & Lifecycle (2026-11-18)

**Verdict: READY_WITH_CONDITIONS.** SSCTR-CORE-B-01-R is closed. C-C1 and C-C2 are closed. The `fix-forward:285` successor is accepted. Observation §5 is acceptable as it is. CORE-C2-F01 does not block this successor freeze: it is carried to the next mission as a binding condition (§6). No item is blocking, so the mission's one correction cycle is not needed for SSCTR.

| # | Item | Disposition | Blocking |
|---|---|---|---|
| 1 | SSCTR-CORE-B-01-R | CLOSED; choices (a) and (b) ACCEPTED | no |
| 2 | C-C1 (successor restatements) | CLOSED; each restated expectation is the accepted reading | no |
| 3 | C-C2 (RWS-level test) | CLOSED | no |
| 4 | Successor of `v1rws-fix-forward:285` | ACCEPTED (exactly element 4 and its comment) | no |
| 5 | §5 standing clinical hold after the date | ACCEPTABLE AS IS (sporting); one note for QRE | no |
| 6 | CORE-C2-F01 (restart sizes from superseded rows) | NOT a blocker for this freeze; CARRIED, binding | no (for this freeze) |

## 0. Reviewer, target, method

- **Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, a fresh instance in this closure-2 session.
  - I authored none of the code, tests or successor specs. I know R1 and R2 only through their records.
  - Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical matters only. No human review, no clinical judgment, nothing delegated.
- **Target:** candidate `219fb1ceb7966c029bb71192ab31423a4bb760f1`. The record commit `8f54df67…` changes no source or test (empty `git diff 219fb1c 8f54df6 -- CoachingCore`). SHA-256 values of the judged files are in §7.
- **Literature:** none needed. No item asks for a sporting rule, dose, threshold or progression. Web search and fetch exist in this runtime as deferred tools; I did not use them.
- **Commands** (Node v24.19.0, Git Bash; no `verify`; no repo file edited except these two records; the human queue is untouched):
  - `node --test test/v1core-closure2.test.mjs test/v1core-successor-*.test.mjs test/v1core-freeze.test.mjs`: **29/29 pass** (145 s).
  - `node ../audits/…/successors/make-successors.mjs --check`: `checked 7 files, 19 successor tests`, exit 0.
  - **Discrimination check.** In the scratch tree `…/scratchpad/ssctr-c2-r1-red-4c60915-71d2/` I combined the `219fb1c` tests, the `4c60915` `src` and `audits` from `219fb1c`, then ran `node --test test/v1core-closure2.test.mjs`:
    - fail: both B-01-R tests, R2-01 ×2, SEC-CORE-14;
    - pass: the refused-instant guard, the third R2-01 guard, C-C2.

    This is as `CANDIDATE.md` §2 states.
  - **Probes**, in `…/scratchpad/ssctr-c2-r1-probes-b4e1/` (copies of repo test files with absolute imports, plus an appended probe test):
    - `p-lineage.test.mjs` (D-01, rows 02–20, dose of the week after);
    - `p-b01r.test.mjs` (refused classes);
    - `p-standing.test.mjs` (§5);
    - `p-f01.test.mjs` (the CORE-C2-F01 probe, with a control that removes the superseded rows).

## 1. SSCTR-CORE-B-01-R: CLOSED

- **The fix.** `elsewhereStops` turns an earlier plan's symptom-stop report into `stopOnly(reportFactOf(…))`. It is appended to `read`, which every accepted answer returns, ASK and earlier-than-record included, and to `kept`, the unknown-format ASK. It is not appended under `lost.length || refused(base)`. This is the same rule a planned session's stop follows, so it is parity, not a new criterion. It is only read for a SYMPTOM stop of this athlete (or of no named athlete).
- **Steps 1–10 pass.** The ASK answer names the screen and makes nothing executable. One stop fact is recorded: `standing:false`, no distance, no execution row. The screen stays REQUIRED in each of these:
  - the next review, with a screen dated before the stop;
  - after a JSON restore;
  - after a late correction, and after a correction that drops the stop;
  - after duplicates (no extra fact, at most one live row);
  - in a third plan.

  A screen dated after the stop clears it, and it stays cleared. So the block is not permanent.
- **Dating.** A screen dated two days before the review that delivered the stop (that is, after the session date) still asks. The stop is therefore dated when it is reported, not when the session took place. This is the conservative reading: a screen answered before the athlete told us cannot answer the stop.
- **Parity and limits pass.** Both sessions are asked, the planned one and the earlier plan's. Another athlete's report records nothing. A FATIGUE stop records nothing.
- **(a) A refused instant: ACCEPTED.** Probe `p-b01r`:

  | Class | Status | Screen | Sessions | Executable | Stop facts |
  |---|---|---|---|---|---|
  | Unreadable instant | UNSUPPORTED | REQUIRED, names the session | 0 | 0 | 0 |
  | Invalid week | HOLD | REQUIRED, names the session | 0 | 0 | 0 |
  | Review earlier than the plan | HOLD | REQUIRED, names the session | 0 | 0 | 0 |
  | Accepted (control) | KEEP | REQUIRED, names the session | listed | 0 | 1 |
  | ASK (control) | ASK | REQUIRED, names the session | listed | 0 | 1 |

  A refused review prescribes nothing, names the screen, and changes no record. That is the decided SEC-RWS-A-05 integrity rule, applied identically to planned sessions. Recording a stop under an instant the engine cannot read would date a safety fact at an unknown time. The cost: the stop persists only if the client re-sends the report (condition C2-C3).
- **(b) An id over 128 characters: ACCEPTED.** A restart namespace is a fixed `r` plus 10 hex characters, prefixed to freshly generated base ids (`r6-program.mjs:1442`, `r6-index.mjs:44`). It does not nest across restarts. No session id of any plan can therefore exceed the 128-character report-id bound, and the limit only drops ids no plan could hold. Such an id is still named in that answer.
- **Non-blocking recommendation.** The refused-instant test checks the screen under a conditional `if(screenOf(r))`. My probe shows it is named in every refused class. Pinning it without the condition would make that a guard.

## 2. C-C1: CLOSED

- **Method.** I read every substitution and appended assertion in `successors*.json`. Each successor executes its as-if comparison against a control built with the historical file's own helpers. The generator check is current, and all successors pass.
- **D-01, "no duration" form: ACCEPTED** (probe `p-lineage`).

  | Reading | Word | Easy band | Frozen easy band | Run | Extent |
  |---|---|---|---|---|---|
  | Merged, before the re-sync | DURATION_REQUIRED | [345,420] | — | — | — |
  | After the re-sync | null | [345,575] | [345,575] | 6.6 km / 63 min | 6.6 |
  | Direct merge | null | [345,575] | [345,575] | 6.6 km / 63 min | 6.6 |

  - The after-re-sync row equals the direct merge exactly.
  - DURATION_REQUIRED was waiting for the device to time its own distance. The re-sync does exactly that, and nothing in the record says the 6.6 km is partial: there is no list of further recordings.
  - It is therefore legitimate easy evidence. It is the class R1 §4 accepted, and the frozen line's direct merge already reads it this way.
  - Only the easy band's slow edge widens. **The next week's prescribed sessions and the plan are byte-identical** to the merged control (`eqDose true eqPlan true`), so no dose follows from it.
  - The run's history extent stays 6.6, which is not raised.
- **The rows that are not as-if (lineage 04/12/20 = SEC-CORE-03): ACCEPTED as conservative.**
  - Each is withheld:

    | Row | Word | wholeRow | Pace evidence | History extent |
    |---|---|---|---|---|
    | 04 | REPORT_NOT_CARRIED | — | none | 6.6 |
    | 12 | DISTANCE_DISPUTED | REPORT_NOT_CARRIED | none | 6.6 |
    | 20 | SEVERAL_RECORDINGS | REPORT_NOT_CARRIED | none | 6.6 |

  - Row 12's history reference goes from 11 to 6.6. Lowering is the permitted direction under L3/L4, and it is bound to an open trust condition, not a sporting rule.
  - These rows must be re-read when SEC-CORE-03 closes (C2-C2).
- **V11 "declared limit": ACCEPTED.**
  - Each lossy record reads as the whole one, SEVERAL_RECORDINGS, so it withholds no less.
  - A record rewritten to drop the app's fact now shows no report reason, because the row itself carries the app's report. That row still withholds (SEVERAL_RECORDINGS). No pace reader gains a row.
- **`final-fix:116` / `fix-forward:82`, now PARTIAL: ACCEPTED.**
  - The historical test pinned two orders of the same statements, "import arrives last" and "no correction", as DISTANCE_DISPUTED with extent 6.6. Only the "app corrects itself last" order read complete at 11 km, because the correction alone did not carry the import.
  - The successor makes the three orders read the same, including the execution, as `asIfReading(neverCorrected)` asserts. That is the order independence L1 asked for, at the smaller figure in force (L4).
  - Crediting a disputed distance as partial is the frozen engine's existing direct-merge reading, not a new rule. It credits less and prescribes nothing more.
- **HARD GATE: ACCEPTED.** The retitle says what is true: the row keeps ADVERSE and HARDER, and the run reads as the merged control (`adverseSessions` 1). It names real HealthKit as open (C-C5, carried).
- **Other files: ACCEPTED.**
  - `rws-e01`:
    - the bare frozen calibration no longer steps faster at threshold ([300,335], as merged);
    - laps and the easy run are withheld (CORRECTED_MEASUREMENT);
    - the history reference stays 8 km;
    - the lost-lineage records are more conservative than the direct merge, and labelled so.
  - `rfc-evidence`:
    - re-sync votes 4, as the merged control;
    - an ADVERSE answer is kept, with 0 votes for RESPONSE_NOT_COMPATIBLE.
  - `rfc-cycle`: namespaced ids, and no old execution binds.

  Every restatement is the as-if reading or more conservative, and none raises a dose.

## 3. C-C2: CLOSED

- The test runs at the RWS level, through `runSessions[…].execution`.
  - A merged row recorded without parts gives `paceWithheld: REPORT_NOT_CARRIED`.
  - A row with a malformed athlete part gives the same.
  - The control with parts keeps ADVERSE and HEAT and is not withheld for REPORT_NOT_CARRIED.
- It passes on both trees, so it is a guard of existing behavior, which is what C-C2 asked for.

## 4. Successor of `v1rws-fix-forward:285`: ACCEPTED

The diff against the historical test is exactly the title prefix, the comment lines, and element 4 of one assertion (`withRow(elsewhere).status`, NOT_RAISED_BY_THIS_EXTENSION → REQUIRED). The other-athlete element stays NOT_RAISED. This is what R2 §2 accepted, and the comment changed with it.

## 5. Standing clinical hold after the date: ACCEPTABLE AS IS

- **What the answer contains** (probe `p-standing`, at 04-29, 05-01, 05-03 and 05-10, against the same hold created on 04-28):
  - CLINICAL_HUMAN_REQUIRED, no proposal, **0 executable sessions**;
  - forecast and insights UNAVAILABLE, calibration WITHHELD_HOLD, no `updatedModel`;
  - `referenceState.pending` keeps the "stop training and seek a professional assessment" route.
- **The same before and after the date.** Clinical-first precedence is the conservative order. An expiry refusal in its place (the no-hold control is UNSUPPORTED with nothing listed) would drop the clinical message.
- **Recorded formats.** The formats it records belong to sessions it lists as non-executable, which the R2-01 rule counts as delivered. That carries no sporting consequence.
- **Note for QRE / Product, not sporting.** This path sets no `authorityExpiry` marker. A consumer cannot see the expiry there.

## 6. CORE-C2-F01: CARRIED, not a blocker for this freeze

- **Reproduced** (probe `p-f01`):
  - **With superseded rows** (4 of 44 rows): restart from a record holding corrections sizes the new plan's easy runs at **60/60/60** with the long run at 100. This holds for weeks 0 to 2, and the "plain alone" case gives the same.
  - **Without them:**
    - the same record with the superseded rows removed gives **50/50/50/100**;
    - so do the direct merge and the merged control.
- **Why it matters.** Replaced rows are being counted as training. That is +10 min per easy run (+20%), about +30 min a week, in the less conservative direction. It is a dose defect.
- **Why it does not block this freeze:**
  - It is identical on `4c60915` and on `7e03f84`, before E-1, so freezing this line neither creates nor widens it.
  - No test pins the 60 (grep; the `rws-e01` successor comment names the gap).
  - The line has synthetic and shadow standing only, with V1 authority NO.
  - Any fix changes a dose, which this mission forbids, and needs its own SSCTR review.
- **Binding conditions (C2-C1):**
  - (i) The freeze record and the readiness report name CORE-C2-F01 as open.
  - (ii) No real-athlete or integration use of `restartProgram` from a record that holds superseded rows until it closes.
  - (iii) Owner: the next mission (R6 restart / Core).
- **What closes it** (a result test, no new criterion): for each case of the probe (lists, plain, with and without the watch), `restartProgram` from the stored record sizes every session of the new plan exactly as from the same record without its superseded rows (equivalently, as the direct merge). The fix then gets an SSCTR review.
- **Severity beyond this scenario.** It is untested whether more corrections inflate the sizing further. That is a reason the condition binds integration.

## 7. Conditions, queue and hashes

- **Conditions:**
  - **C2-C1:** CORE-C2-F01, §6.
  - **C2-C2:** lineage rows 04/12/20 are re-read as-if once SEC-CORE-03 closes.
  - **C2-C3:** integration. A report sent in a review the engine refuses is not consumed (the record is unchanged), so the client re-sends it. This applies to planned and earlier-plan sessions alike.
  - **Carried unchanged:** C-C3, C-C4, C-C5 (real HealthKit), and A-C1, A-C2, A-C3, A-C5.
- **Human queue (proposed only, not appended):**
  - HQ-CORE-C2-SSCTR-A: B-01-R stop persistence, and the D-01 no-duration admission.
  - HQ-CORE-SSCTR-C from R1 stays proposed.
- **Gate:** none. **Publication:** none.
- **SHA-256** (git objects at `219fb1c`; `CANDIDATE.md` at `8f54df6`):
  - `src/v1-run-format-index.mjs` 60ad5930…5dbd4
  - `src/v1-safety-index.mjs` 86cd1880…95298
  - `src/r6-provenance.mjs` d701d120…0af00d
  - `test/v1core-closure2.test.mjs` 4cb1e615…392fa
  - successor test files:
    - `fix-forward` a3ab3295…399f9
    - `lineage` ccbc4269…aeea3c
    - `final-fix` 153c456e…34610
    - `fix-forward-b01` 8719b9c5…70118
    - `rfc-evidence` 9ecd9a4d…9c83c
    - `rws-e01` 91ec91a0…32f1
    - `rfc-cycle` 4dbbf46b…2d46f
  - successor specs and generator:
    - `make-successors.mjs` 814b882c…2437a
    - `successors.json` bf2360cb…2d46f
    - `successors-lineage.json` 608d2dcd…263a0
    - `successors-other.json` dbcefa3e…451a3
    - `SUCCESSOR_LEDGER.json` 539d4af7…c774
  - `probes/restart-superseded-sizing-p14.mjs` 06750df6…0b05b
  - `CANDIDATE.md` 0d02f701…12bedf

  Full values are in `SSCTR_C2_R1.json`.
- **Re-review triggers:**
  - any change to the three source files or the successor specs;
  - a fix for CORE-C2-F01;
  - closure of SEC-CORE-03;
  - the real HealthKit adapter (C-C5).
