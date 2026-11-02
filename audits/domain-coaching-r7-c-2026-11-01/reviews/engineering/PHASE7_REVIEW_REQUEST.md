# R7-C Phase 7 — Engineering gate request (on R7C-FREEZE-4, QE-R7C-10)

You are a fresh, independent engineering judge (`quality-reliability-engineer`). You did not author this runtime, its Phase 7 fix, its tests or its evidence. Your predecessor's review of R7C-FREEZE-3 is [PHASE6_REVIEW_R7C.md](PHASE6_REVIEW_R7C.md) (with its JSON): **NOT_READY** on **QE-R7C-10** (BLOCKER, `DIRECT_R7C_DELTA`), with QE-R7C-11, -12 (minor), -13, -14 (observations).

The Founder's Phase 7 has one blocker to close: QE-R7C-10. The SSCTR's P6-F01 is the same cause. **There is no correction loop:** a new blocker from this review closes R7-C as `CLOSED_NOT_READY`. You are the phase's main gate.

## Rules

- Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`: your deliverables `PHASE7_REVIEW_R7C.md` and `PHASE7_REVIEW_R7C.json`, and any probes under `probes/phase7/`. No commits, no git state changes, no edits to `CoachingCore/`.
- Run `node CoachingCore/scripts/verify-r7c.mjs --revision 4` (add `--suite` to re-run the suite) before and after your work; never with `--write`. Never run `npm run verify` or any other `verify-r*` script.
- Other revisions' bytes: extract them with `git archive` into a folder of your own outside the repository (copy `CoachingCore/node_modules`). Do not open the authoring session's scratchpad (`C:\Users\carva\AppData\Local\Temp\claude\C--Users-carva-Desktop-myApp-MyApp\9c34315f-9491-4e24-b552-36b62143e482\`).
- No product, policy, catalog or clinical decision is yours or needed; name one if you find it.
- Do not absorb anything outside QE-R7C-10: QE-R7C-08, -09, -11, -12, -13, CC-F01, C8, C5, the R4 HOLD bug, C10, D1 and G03 stay as their gates classified them. Say if this change moved any of them.

## Bytes to judge

- **R7C-FREEZE-4:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json`, sha256 `bf99c01bf791b832725bb0f4a83cab270378c1afc882b402b76916000eca2fc2`.
  - Commit of the bound bytes: `a9654c8ea175611fbaae805ac6b0e8b928620dff`.
  - Source digest `16d0633e21d10bb102a6f4869e44f8f5080ce4e7c66674de41b24577d8a269c1`; manifest digest `61937f87bf8ecffa950fb7825b4656ab8da0b04413bca9f3d95c06dbecd3f6b8`; 197 files; 884 tests.
  - Verifier `--revision 4 --suite`: 27/27 PASS ([report](../../../../CoachingCore/r7/c/VERIFICATION_R7C_4.json)). Handoff: [R7C_HANDOFF.md](../../../../CoachingCore/r7/c/R7C_HANDOFF.md).
- **Predecessor:** R7C-FREEZE-3, commit `08c6db352d102e2b33ed7e834cff980248b90299` (its own verifier now fails `files-current` by design: superseded, not edited).
- **Delta:** `git diff 08c6db352d102e2b33ed7e834cff980248b90299 a9654c8ea175611fbaae805ac6b0e8b928620dff -- CoachingCore/src CoachingCore/test`:
  - `src/r6-provenance.mjs`: `provenance.firstRecordedAt` (`firstRecorded`, `setFirstRecorded`, the `recordArrival` option of `normalizeObservations`);
  - `src/r6-adaptation.mjs`: `evaluateProgram` normalizes with `recordArrival`; `unreadRunReports` replaces `unreadRunWeeks`; `legacyUnreadWeeks` keeps the R7C-FREEZE-3 reading for records without the clock; `answeredOnRecord` reads the per-report set;
  - `test/r7c-phase7.test.mjs` (18 directed tests, new). No existing test or fixture changed.

## The invariant and the fix

**Founder's invariant:** whether a prior review read a run must be derived from the canonical record available to that review, not inferred from the gate that resulted from it. A report that reached the record after the review was not read; one the record held before it was read, whatever gate it gave (HOLD, REGRESS or any other).

**Why existing structures could not carry it (the Founder's condition for new metadata).** Take one week closed by a review that recorded HOLD for its runs, and a run done at 60 % of its minutes:
- **A:** the review had no run report; the short run arrives later through a clinical carrier;
- **B:** the review had the short run on time.

On the existing structures, A and B are the same:
- the same ledger row (event id, `observedAt`, actual, response, provenance; the ledger carries no arrival, `reportedAt` is optional and client-supplied, absent in every grid);
- the same decision clocks and the same recorded gates (HOLD);
- the same stored start and state (HOLD gates the same transition).

Only the review's reason text differs (`(MISSED)` against `(PARTIAL)`), which is decision output, not record. QE-R7C-10 needs A unread (the carrier must converge with the direct answer) and the Founder needs B read (an on-time report that gave HOLD was read). So no rule on the existing structures can satisfy both.

**The metadata (no dose, no authority, factual visibility only, deterministic):** `provenance.firstRecordedAt` on each completed-work record row.
- Written only by the runtime: `evaluateProgram`'s normalization (`normalizeObservations(..., {recordArrival:true})`) stamps each report a decision brings with that decision's clock. A value the input supplies is replaced.
- A carried row keeps its own. Rows that are one execution keep the earliest: an agreeing duplicate (`EXACT_REPLAY` or a second source), a correction and what it corrects.
- Read only by `unreadRunReports` (below). Never read by the evidence reducer or HistoricalState; never kept by the learning model (a normalization without `recordArrival` keeps no clock).
- **Backward behaviour:** a record written before R7C-FREEZE-4 carries no clock. For such a report the R7C-FREEZE-3 reading stands (`legacyUnreadWeeks`, the gate-class rule: sound, but a shortened late answer on such a record reads as on FREEZE-3). Nothing is migrated: those arrivals were never recorded and are not invented. A directed test pins this.

**The rule (`unreadRunReports`, replacing `unreadRunWeeks`), per report:**
- a week the plan projected (next RUN start `CONDITIONAL_PLAN`): none of its run reports was read (unchanged);
- a week a review closed (`WEEK_EVIDENCE`, clock `evidenceThrough`): a report whose `firstRecordedAt` is after that clock was not read by it; one at or before it was;
- any other start (intake, a return's entry): read (unchanged).

`answeredOnRecord` then works as on FREEZE-3 on "the record without the unread reports": if on that record the doses ahead depend on unreported training and on the record as it stands they do not, the answer week is re-planned from the facts (C9), before any handler. Nothing else in the trigger, its order (clinical → factual reconciliation → ordinary adaptation), the ceiling re-plan, the G01 guard or C9 changed.

## Evidence (`../../probes/out/`, label `R7C-P7-e709caa`: the same src and test bytes as the freeze)

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

## Questions (mandatory, the Founder's)

1. Is QE-R7C-10 closed?
2. Are shortened answers recorder-independent?
3. Is evidence visibility derived correctly from the record and time, and not from the gate? Judge the metadata decision: is new metadata really necessary (the A/B demonstration), and does it meet the Founder's conditions (no dose, no authority, factual visibility only, deterministic, explicit backward behaviour)?
4. Is all-adverse covered (QE-R7C-14's witness)?
5. Does P6-F01 close by the same fix, without a special case?
6. Is QE-R7C-07 still closed?
7. Has no new stale VALID appeared?
8. Are QE-R7C-08, -09, -11, -12 and -13 still correctly classified, and not absorbed?

## Deliverable

Gate: `READY`, `READY_WITH_CONDITIONS` or `NOT_READY`, with findings (id from `QE-R7C-15`, severity, `DIRECT_R7C_DELTA` yes/no, reproduction), what you re-ran and what you did not.
