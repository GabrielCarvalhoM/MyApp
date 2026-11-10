# V1CIB: request for the one consolidated independent review

**Candidate:** the commit named in the dispatch (branch `claude/v1-integration-boundary`, from `ad0c8fc`). Review a `git archive` extract of that commit in a new folder of your own scratchpad, never the worktree. The archive has no `node_modules`: copy the locked `ajv` from `CoachingCore/node_modules` of the worktree into the extract before running the suite. Never run `npm run verify` or any `verify-r*` script (they rewrite closed missions' evidence). No recursive deletion: build into new folders only. Write your record (JSON authoritative, MD summary) under `audits/v1-coaching-integration-boundary-2026-11-09/reviews/<role>/`, new files only; change nothing else.

**Cycle bound (task contract):** this is the single round. A finding that is new, narrow and runtime-only can get at most one narrow fix cycle and one narrow recheck by the same roles; everything else closes with a named blocker. Say for each blocking finding whether it qualifies.

## What changed (code)

| Item | Where | What |
|---|---|---|
| SSCTR-FFC-01 | `r6-adaptation.mjs` `sportPlan`, `stricterPlan` | The REST row reads every day of the chain's stretch after the sport's last executed session (FF-N1: days without training, incl. an unexecuted REDUCE window and the unexecuted tail of a partly executed one). CH-r2 with I-04: it is never less conservative than a REDUCE window of the chain that held an executed session, read on its own (order: R6 LONG > MODERATE EACH > FIRST > NONE > rung lists, first lower rung then longer list). |
| SSCTR-FFC-02 | `f08RestBefore` | Before a declared break, ladder days and R2/R3 window days of the sport with no executed session count as days without training, as R0/R1/wait days did; an executed session stops the scan. |
| QRE-FFC-01 | `r6-composition.mjs` `ladderCap`, `lastExecutedSets`, `setsExecutedIn` | D49 ("sets come back at most one set per executed week whatever the rung") reads the last executed count across every Situation 1 week of the sport (any report, window, wait or ladder), counting only sessions from the reduction's first day in that week (fuzz seed 367). |
| CF-OBS-1 | `v1-f08.mjs` `standingHolds`; `r6-adaptation.mjs` `recordHoldGuard`, guard, `withHoldFact`, `ctx.holds.record`, readiness `holdAt`; `restartIntake` | One standing-hold predicate from the record for every entry point; every review kind but the readiness declaration stays clinical over it whatever reference is sent; a READINESS_DECLARED row reads only as a valid declaration; a plan older than a declaration on record is HOLD (`program.behindRecord`); session reports sent during a hold are recorded (PCG Q3). |
| Release path | `readinessRestart`, `heldByRunGap`, `replayOf` | The restart applies a break the record kept during the hold, once (recorded as its return); it is not held by the unreported-training question when it applies such a break; a declaration (or report or check) under an id that names a session report on record is asked for its own id. |
| QRE-FF-06 | `value.mjs` `canonical` | JSON value semantics (undefined and non-JSON values left out of objects, null in arrays, toJSON applied); a JSON-stable value keeps its exact earlier text. |
| SEC-V1CPI-06, C6 | `v1-f08.mjs` `ERASED_F08`, `erasureFact`; custody `eraseHealthFacts`, `referencesOf` | Erased F08 facts (cascading over cross-row references) leave one sealed marker the core reads as a standing hold of unknown cause until a later readiness declaration. |
| RECORD-CUSTODY, C4, C5, C7, C8, boundary | `src/boundary/` (custody, store, views, inventory, api), `scripts/v1cib-ios-fixtures.mjs`, `fixtures/v1cib-ios/` | See `INTEGRATION_BOUNDARY_V1.md` §2–§9. |

The 28 R7-era qualified-clearance tests (R7-B.2 1, R7-C phases 5–7: 23, R7-D 3.1: 3, R7-D 3.4: 1) are migrated in place, marked `V1CIB CF-OBS-1 migration`, each releasing by the readiness declaration and keeping the old convention as its negative twin; none was deleted.

## Evidence (in `evidence/`)

- RED on `0950b0a`: the new directed tests (`RED_new_tests_on_0950b0a.txt`: 30 of 45 fail; the 15 that pass are stated controls) and the migrated tests (`RED_migrated_on_0950b0a.txt`).
- GREEN: the full suite on the candidate (`GREEN_FULL_SUITE.txt`).
- Differential of the spent R7-D corpus (regression only): `DIFF_*.json` and the classification `CLASSIFY_*.json` (`classify-differential.mjs`): every difference is HASH_ONLY_QRE_FF_06 or CF_OBS_1, with the two R7D-H24 steps explained in the checkpoint draft.
- F08 journeys A–G: byte-identical to `0950b0a` and to the recorded JOURNEYS_FF.
- QRE fuzz (your harness, seeds 0–600): `FUZZ_*.json`.

## Questions by role

**SSCTR** (sporting; PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only):
1. FFC-01: accept the FF-N1 reading of the REST row (the unexecuted tail of a partly executed REDUCE window counts), beyond your minimal correction?
2. FFC-01: accept the CH-r2/I-04 order `stricterPlan`? At CONSERVATIVE a MODERATE recipe after a short rest outranks a long R2 ladder although it reaches the prior doses sooner: is a precision needed?
3. FFC-02: accept counting unexecuted R2/R3 window days and ladder days before a break (and a regional strength window when no strength session was executed)?
4. QRE-FFC-01: accept the D49 reading across reports, waits and mid-week windows?
5. Release path: the restart applying a kept break once; an ERASED_F08 marker read as a hold needing a readiness declaration (the sporting consequence of SEC-V1CPI-06).
6. Accept the 28 migrated tests' re-expressed invariants (PCG Q4: "marked updates accepted by SSCTR and QRE").
7. Observations to classify: missed REDUCE sessions repeat the rung (I-04) while the same days declared as a REST report do not; seed 518 (a check is not recorded on its first evaluation when a factual re-plan takes the decision; recorded on a retry; conservative).

**QRE** (reliability): verify the fixes by your own probes and fuzz; the migrated tests (each has a negative twin; G01's guard is no longer reached by the clinical carrier: a coverage gap to rule on); the `canonical()` change and compatibility; custody's reconciliation rule (stored rows kept, a correction's annotation the only change) and the order-independence test; the differential classification; JSON round trips; mutation of the new rules.

**Security:** CF-OBS-1's two layers (core and custody); C5 and C7 (HMAC chain, seal, prefix/identity rules, opaque ids, binding, clock, tamper and truncation, the documented whole-document rollback residual); C4 (inventory, egress, telemetry, push); C6 and SEC-V1CPI-06 (erasure cascade and marker); C8 (the decision-log trace); consents; SYNTHETIC_ONLY; whether the PENDING list in §7 is complete.

**PCG** (narrow: contract interpretation only): (a) the adoption reading of AEC §2 and §3.4 (`CONFIRMATION_KINDS`, applied-with-fact, applied-with-evidence); (b) the C8 form; (c) "facts are still recorded" during a hold read as: session reports and declared breaks recorded; Situation 1 reports and checks screened (signs set the guidance, the custody log keeps the sign names) but opening no window while nothing is prescribed.

**States to report separately:** RUNTIME_CORRECTNESS, F08_STATUS, RECORD_CUSTODY_STATUS, JSON_PERSISTENCE_STATUS, INTEGRATION_READY, V1_COACHING_AUTHORITY_READY (and, where you can, authorization for real athletes).
