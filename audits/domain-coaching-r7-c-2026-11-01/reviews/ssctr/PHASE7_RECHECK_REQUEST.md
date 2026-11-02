# R7-C Phase 7 — SSCTR narrow recheck request (on R7C-FREEZE-4, QE-R7C-10 and P6-F01)

Reviewer: the project's `sports-science-concurrent-training-reviewer`, under its constitution and skill (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; nonclinical items only). Your last record is [SSCTR-P6-R7C-r5](SSCTR_PHASE6_RECHECK_R7C.md) on R7C-FREEZE-3: ACCEPT_WITH_CONDITIONS, no blocker. There you found **P6-F01**: a mixed answer recorded by a handler clinical route was not applied after clearance, and you narrowed C3 (the r5 clause). The Engineering review of the same bytes found **QE-R7C-10**, the same cause, for answers whose runs were all done but shortened, and asked that C3 not be narrowed while it stood. Both records are bound; the conflict was routed to you.

**Narrow, not a broad scientific review.** The semantics are accepted (SSCTR-SD-R7C-r2). Phase 7 is the Engineering fix of QE-R7C-10. There is no correction loop: a new blocker closes R7-C as `CLOSED_NOT_READY`.

## Rules

- Write only `SSCTR_PHASE7_RECHECK_R7C.md` and `SSCTR_PHASE7_RECHECK_R7C.json` in this folder, and any probes under `probes/phase7/`.
- No edits to `CoachingCore/`, no commits.
- `node CoachingCore/scripts/verify-r7c.mjs --revision 4` is read-only; never with `--write`. Never run `npm run verify` or another `verify-r*` script.
- Do not open the authoring session's scratchpad (`C:\Users\carva\AppData\Local\Temp\claude\C--Users-carva-Desktop-myApp-MyApp\9c34315f-9491-4e24-b552-36b62143e482\`).
- Clinical judgment stays CLINICAL_HUMAN_REQUIRED.

## What changed (R7C-FREEZE-4)

- **R7C-FREEZE-4:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json`, sha256 `bf99c01bf791b832725bb0f4a83cab270378c1afc882b402b76916000eca2fc2`.
  - Commit of the bound bytes: `a9654c8ea175611fbaae805ac6b0e8b928620dff`.
  - Source digest `16d0633e21d10bb102a6f4869e44f8f5080ce4e7c66674de41b24577d8a269c1`; manifest digest `61937f87bf8ecffa950fb7825b4656ab8da0b04413bca9f3d95c06dbecd3f6b8`; 197 files; 884 tests.
  - Verifier `--revision 4 --suite`: 27/27 PASS ([report](../../../../CoachingCore/r7/c/VERIFICATION_R7C_4.json)). Handoff: [R7C_HANDOFF.md](../../../../CoachingCore/r7/c/R7C_HANDOFF.md).
- **Predecessor:** R7C-FREEZE-3, commit `08c6db352d102e2b33ed7e834cff980248b90299` (its own verifier now fails `files-current` by design: superseded, not edited).
- **Delta:** `git diff 08c6db352d102e2b33ed7e834cff980248b90299 a9654c8ea175611fbaae805ac6b0e8b928620dff -- CoachingCore/src CoachingCore/test`:
  - `src/r6-provenance.mjs`: `provenance.firstRecordedAt` (`firstRecorded`, `setFirstRecorded`, the `recordArrival` option of `normalizeObservations`);
  - `src/r6-adaptation.mjs`: `evaluateProgram` normalizes with `recordArrival`; `unreadRunReports` replaces `unreadRunWeeks`; `legacyUnreadWeeks` keeps the R7C-FREEZE-3 reading for records without the clock; `answeredOnRecord` reads the per-report set;
  - `test/r7c-phase7.test.mjs` (18 directed tests, new). No existing test or fixture changed.

- **No new rule, dose or authority.** The recorded-answer re-plan, its composition (C9's `uncredited` included), its order and its scope are FREEZE-3's. What changed is how the runtime knows which run reports an earlier review had:
  - each report in the completed-work record now carries the clock at which the record first held it (`provenance.firstRecordedAt`, written by the runtime, never by the input; evidence visibility only, never read by the evidence reducer, gates or doses, never kept by the learning model);
  - a report the record first held after the review that closed its week was not read by that review; one it held by then was, **whatever it reports and whatever gate it gave** (a run done short gives HOLD; adverse runs give HOLD or REGRESS).
- **Why not the gate:** on FREEZE-3 a late run done short read HOLD, like a run with no report, so its week counted as read and the stale projection stayed VALID (QE-R7C-10: 28 of 280 Engineering cells; your P6-F01: 16 of 768 and 18 of 1,200).
- **Records written before R7C-FREEZE-4** carry no clock and keep the FREEZE-3 reading (disclosed; nothing is migrated).

## Evidence

Manifest `evidence.R7C-P7-c2d1f77.json`; mutation `mutation.R7C-P7-b446443.json` (both on the freeze's src and test bytes). The freeze record's `evidence` block holds every output's SHA-256; the generator refused on any of the criteria below.

| Check | On R7C-FREEZE-4 | On R7C-FREEZE-3 |
|---|---|---|
| Recorder independence, original grid (`rc-p4`, 160 cells) | **0 / 160** | 0 / 160 |
| Shortened answers (the Engineering's `p6-x5`, 280 cells: SHORT60, SHORT80, long runs short with the rest done or not done, EXEC; CSUB, CHOICE, R4) | **0 / 280** | 28 / 280 |
| Trajectories (`p6-x1`, 1,536) | **0 stale valid**; no failing trajectory for EXEC, MIXED, ADVERSE, EASYONLY, PARTIAL or SHORT; 36 (MISS 30, LONGONE 6, carrier on day 1) ask where the direct path is valid, as on R7C-FREEZE-3 | 54 stale valid (SHORT); the same 36 |
| SSCTR mixed scope (`p6-mixed-scope`, 768 cells, P6-F01) | **0** carrier ≠ direct | 16 |
| SSCTR CC2 (1,200 cells) | **0** valid ≠ direct; MISS, EXEC and ADVERSE identical | 18 |
| Directed tests `r7c-phase7` | 18 / 18 | — |
| Full suite | 884 / 884 | 866 / 866 |
| Differential against R7C-FREEZE-3 (`phase7-differential.mjs`: weekZero, timely, timely-short70, returns, never reported, mid-week unreported, late single report, skipped review, habitual late reporters at full dose and shortened) | **128 / 128 identical**; no late reporter above the same facts reported on time | — |
| SD grid, SD-01, G01, G02, holdout (D1, H19), conformance R7-B / B.1 / B.2, neighbors | byte-identical to the Phase 6 outputs | — |
| `regress-r7b2` against R7B2-FREEZE-1 | differs only through its digest of the carried record (the new field at every recorded step); its stamp-neutral form (`phase7-regress-r7b2-stamp-neutral.mjs`) reads exactly as Phase 6's | — |
| Clinical (K6, K6b, CAND-01/02 inventory, inherited adversarial 3,228 / 0) | identical to Phase 6 apart from the label | — |
| Reach (`p6-x2`, 45 scenarios, R7C-FREEZE-3 bytes as the old runtime) | 45 / 45 identical; the same 72 recorded re-plans | — |
| Late reporter (`p6-x4`) | no week above the timely facts or above R7C-FREEZE-3 | — |
| Direct refire (`p6-x7`, 224 cells; QE-R7C-12) | 6 more re-plans after a direct shortened answer, 2 cells changed, both more conservative (R10K next week QUALITY 34 → EASY 40); no dose raised above the plan before or above R7C-FREEZE-3 | — |
| History (`p6-x6`) | 111 recorded re-plans, 0 violations | — |
| Mutation (isolated copy; repository untouched) | Phase 3 17/18 + G02-M4 equivalent (witness killed); Phase 4 8/8; SD 6/6; cycle 9/9; Phase 6 7/7 (P6-M2 and P6-M7 fragments follow the new text, same mutations); **Phase 7 F7-M1..M11 11/11, each killed by its own witness run alone** | — |

The Phase 7 mutants: F7-M1 back to the gate class; F7-M2 HOLD never counts as read (witness: a timely review that read runs done short); F7-M3 REGRESS never counts as read (witness: a timely review that read adverse runs, killed by that test only); F7-M4 the observation time stands in for the arrival; F7-M5 a shortened answer a clinical route recorded is not reconciled; F7-M6 a mixed answer a carrier recorded is not reconciled; F7-M7 REGRESS dropped from the R7C-FREEZE-3 reading kept for records without clocks (your predecessor's J-M2); F7-M8..M11 the clock's own rules (taken from the input, the later of two merged reports, a correction's own clock, kept by the learning model).

**What the phase caught in itself:**
- The first evidence run passed the inherited clinical adversarial probe its root through the environment (it failed to load); fixed in `c2d1f77`, all of that run's outputs discarded.
- `regress-r7b2` hashes the carried record, so it reports every recorded step as changed; the stamp-neutral copy shows that this is the field alone.
- The first mutation run gave F7-M5 a witness pattern that matched no test (the harness then counted the file as one passing test); fixed in `b446443` (the harness now counts the tests that ran and refuses a witness that selects none), output discarded.

## Recheck only

1. **Shortened execution semantics:** an answer whose runs were done shorter than prescribed (60 %, 80 %, the long run only, shortened with the rest not done, shortened with an adverse response), recorded by a refusal (R4) or a clinical route, is applied as the same answer delivered directly. Is that plan inside the authorities (no step a short run did not earn, no dose above the single-run ceiling the shortened runs allow)?
2. **Mixed and adverse answers** (E1, M2 of your r2 grid properties): P6-F01's patterns, all adverse, done with adverse, short with misses.
3. **Clinical-first** intact.
4. **Taper and race-week bounds** hold (no race touch or taper quality the direct answer lacks).
5. **C11** (timely path, mid-week): unchanged, changed or retired by this fix?
6. **C3:** QE-R7C-10 and P6-F01 are what the r4 and r5 clauses were waiting on. Please write **one single final C3 text, compatible with the frozen runtime (R7C-FREEZE-4)**. It replaces both the r4 and the r5 clause; after the closure no two C3 texts stay in force.

Also say whether C7's R4 and R5 texts and the QE-R7C-14 disclosure need changing on these bytes.

Gate: `READY`, `ACCEPT_WITH_CONDITIONS` or `NOT_READY`.
