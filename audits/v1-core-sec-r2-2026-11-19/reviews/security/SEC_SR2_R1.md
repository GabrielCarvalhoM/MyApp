# SEC-SR2-R1: Security gate on the SEC-R2-03 + SEC-R2-04 correction-integrity candidate

**Judge:** Security, Privacy & Abuse Architect. This is an independent instance and not the author. It raised SEC-R2-03 and SEC-R2-04 in `SEC_R2_R1` / `SEC_R2_R2`. **Date:** 2026-11-19. Synthetic athletes only.
**Verdict:** **PASS_WITH_CONDITIONS** (SECURITY_READY_WITH_CONDITIONS). The conditions are:
- **SEC-SR2-01** is **BLOCKING**. It must be fixed in the one focal correction cycle before the successor freeze.
- **F1, F2 and F3** are not blocking for this mission. They are **binding before real athletes**.
- **O-1** is accepted for this mission.

## What was judged

| Input | Identity |
|---|---|
| Candidate line | `f6a934fc9fb324230e60316d9767484e792ab59d` (runtime `4e8cffe51fa92d4e385dcd62458aa1db808ac310`; no `CoachingCore/src` change from 4e8cffe to f6a934f) |
| Base / FREEZE-3 | `a6e10d0dcbcda982823044a66b831ccacb40565a` (untouched checkout `.claude/worktrees/v1-core-cf011-r2`; its `src/r6-provenance.mjs` sha256 `d701d120…af00d`) |
| `CoachingCore/src/r6-provenance.mjs` @f6a934f | sha256 `277addbc53883e9df3a8d3a591081679955181f7a7fde5910e7120ea4d43d391` |
| `CoachingCore/src/v1-f08.mjs` @f6a934f | sha256 `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` |
| `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs` @f6a934f | sha256 `9f6b0669a5ea05864e8f0561d2f236de442799c7feeb7821fa6121297455da0e` |
| `git diff a6e10d0 4e8cffe -- CoachingCore/src` | sha256 `70da2059d3e9477ccaa19fe09a8a1dd46158eccad5dc25c8d518559aee682b1a` |
| Judge probes (scratch `sec-sr2-k7q4-probes/`, outside the repo) | `fuzz.mjs` `07612433…433a`, `sb1.mjs` `52b1a885…6eda`, `firstrec.mjs` `3f83b46f…fe`, `judge-firstrec-engine.test.mjs` `07340466…fc11` |

**Commands run:**
- The directed test file, in the worktree: **20/20 pass**.
- `v1core-cf011r2-restart-evidence.test.mjs` with `r6-balanced-provenance.test.mjs`: **53/54**. The one failure is `SEC-R2-01: the engine-written orphan…`, the failure `SUCCESSOR_LEDGER.json` declares by design.
- `node CoachingCore/scripts/v1core-freeze-4.mjs --preserved`:
  - FREEZE-3 23/24 (1 amended);
  - FREEZE-1 196/198 (2 amended);
  - the other freezes have all their files at the base bytes;
  - "no untracked file". It ran before this review file existed.

No verify scripts were run, no commits were made, and no checkout, reset or stash was done. This file is the only thing written in the repository.

## 1. SEC-R2-03: closed for retirement, parts, indexes and row status; one provenance leak remains (SEC-SR2-01)

**Code reading:**
- Every `retire()` and every `byIdentity` deletion now runs inside `admit()`.
- `admit()` runs only after the last refusal point: the event-id check, the activity check and the duplicate-conflict check.
- After `admit()` there is no `continue` that refuses. The inherited-part conflict only flags the admitted row.
- The quarantine gate is skipped for corrections (`!admit`). That is equivalent to FREEZE-3, which deleted the quarantine before the gate.
- `dropsIdentity` and `admit&&quarantined` keep the merge target off any row the admission retires. This removes shapes (D) and (E).
- Stale aliases are no longer deleted from `byEvent`, so an id the record holds is never freed for this report.

**Independent fuzzing** (judge's generator, not the author's). It covers:
- plain conflicting reports, so there are quarantines and carried conflicted rows;
- response conflicts, symptom stops and replays of earlier items;
- corrections of corrections, with event ids reused from any row or from the row itself;
- watch activities of other sessions, out-of-chain targets and missing `correctedAt`;
- three passes over a JSON-round-tripped prior.

The invariants checked in every pass:
- no superseded entry without a same-identity replacement in the record;
- no self-replacement;
- at most one row in force per identity;
- with monotone arrival, no identity loses its row in force;
- **refusal no-op**: when the last-arriving report is a correction refused after the chain check, the record equals the record without it, compared on `eventId`, superseded state, `supersededBy`, actual, response, parts, merged ids and input-hash ids. Conflict flags are excluded here; they are O-1.

| Root, seeds 777 + 9001, 4000 cases each | Passes | Refusal no-op checks (event id / duplicate conflict / activity) | Orphan | Self | Second row in force | Lost (monotone) | No-op broken |
|---|---|---|---|---|---|---|---|
| Candidate, monotone | 23 865 | 1 490 (986 / 418 / 86) | 0 | 0 | 0 | 0 | 0 |
| FREEZE-3, monotone | 23 865 | 1 532 | 980 | 1 102 | 11 | 1 902 | 883 |
| Candidate, random arrival | 23 886 | n/a | 0 | 0 | 0 | 123 rows (F1) | n/a |
| FREEZE-3, random arrival | 23 886 | n/a | 375 | 552 | 14 | 1 009 rows | n/a |

Under random arrival, the candidate's lost-row cases are a **strict subset** of FREEZE-3's on the same generated cases (0 new on both seeds). They are F1, an arrival-order effect, and not a refused correction. The candidate is deterministic, with 0 non-determinism. The author's test claims for shapes (A) to (E), the stored records and the engine consumers are confirmed.

**SEC-SR2-01 (BLOCKING for the successor freeze; owner: Core author of this line, focal cycle; Security narrow recheck)**

*The leak:* a correction that is never admitted still changes another session's row.

*How.* At `r6-provenance.mjs:137`, `setFirstRecorded(o, firstRecorded(o, old, …))` gives the incoming correction its chain's earliest first-recorded clock before admission. The event-id check (line 165) then classifies a report that reuses another row's id with that row's `actual` (and a non-conflicting response) as `EXACT_REPLAY`. It writes `setFirstRecorded(sameEvent, firstRecorded(sameEvent, o))`, so the other session's row takes the chain's older clock. This is the SEC-R2-03 root cause, an effect applied before admission, on the one field the fix did not move. It also breaks the candidate's own rule: the same report without `correctionOf` carries the decision clock and changes nothing.

*Reproduction:*
- **Normalizer** (`firstrec.mjs`): X is recorded on 11-01. Y (session sy, ADVERSE) is recorded on 11-06. A "correction" of X with eventId `Y` and Y's actual arrives on 11-08. Y's `firstRecordedAt` goes from `2026-11-06T20:00Z` to `2026-11-01T20:00Z`, X stays in force, and the report is a "replay". The same happens when Y and the report arrive in one batch.
- **Engine** (`judge-firstrec-engine.test.mjs`, the QRE-V1CP-04 shape run against the worktree):
  - Control: a late ADVERSE run after a wellbeing check gives **ASK** ("A session was reported as not going well…").
  - With the crafted report added: **KEEP**.

  The ADVERSE_SESSION wellbeing check, the f08Guard check that asks a clinical-adjacent screen (`r6-adaptation.mjs:1804` `adverseIn` reads `firstRecordedAt`), is skipped. FREEZE-3 does the same, and also retires X there.

*Minimal change:* apply the chain's first-recorded clock only when the correction is admitted. Compute it where it is now, set it on `o` inside `admit()` (before any retirement), and leave `o` with its own clock on the replay and refusal paths. An equivalent alternative is to propagate it in the replay branch only when `sameEvent.identity === identity`. Nothing else changes.

*Closing evidence:*
1. Both probe shapes leave Y's `firstRecordedAt` unchanged. The engine shape gives ASK.
2. An admitted correction, its merge and its exact replay keep the chain's earliest clock, so the existing QE-R7C-10 and C-F01 tests stay green.
3. A mutant that restores the pre-admission set is killed.
4. The directed suite and FREEZE-4 `--preserved` are re-run.

Narrow Security recheck of this change only.

## 2. SEC-R2-04: closed

- **Through the normalizer.** No admitted sequence writes an orphan: 0 in about 47 700 passes, and test 18 gives ASK through `restartProgram`. The probe3 shape no longer occurs.
- **Kept or forged rows.** `sameExecution` matches only a positive identity: the same session, else the same activity, else `provider@observedAt` with neither row bound to a session or an activity. That mirrors the normalizer identity exactly, including `provenance.activityId` and the DX-01 day-precision instant.
  - **Not too strict.** The judge's day-precision manual "not done" chain is read as history (`readinessDeclared: true`), as is the session chain. A false orphan can only add a question.
  - **Not too loose.** A different provider at the same instant, or a session row against a manual row with neither id, is not a replacement, and a chain that ends in a missing row is asked (`sb1.mjs` `chainToOrphan`).
- **Residual (non-blocking, observation SEC-SR2-02; owner: Core with C-F01-2 custody).** A forged pair that names each other (`X.supersededBy=C`, `C.supersededBy=X`, same session, both superseded) hides the session from SB-1 (`readinessDeclared: true`). The normalizer cannot write it, because the event-id check reads the record before admission and history registers every id. Forging it is the power custody already grants; it is equivalent to forging a "not done". Add it to C-F01-2's closing evidence. Optional hardening: a replacement must not itself be superseded back to the orphan.

## 3. New bypasses: none introduced

- `replacedBy` became stricter, so it can only remove `readinessDeclared`.
- No dose reader reads orphans.
- The normalizer change keeps more rows in force than FREEZE-3 and never fewer. The monotone fuzz found 0 lost rows, and the random-arrival losses are a subset of FREEZE-3's.
- Clinical-hold, episode and readiness reading code is unchanged outside `replacedBy`. SB-1 still hears conflicted rows: in the O-1 probe the declaration does not answer.
- The engine consumers equal the plain report (author test 15, confirmed).
- The dose delta (+10 min at restart week 0 against "no report") is the O-1 conflict on d1 lowering the C-Q08-1 bound into a non-monotonic start class. FREEZE-3 gives the same 80 to the plain report. It is SSCTR's open residual (O-1/B0-F05), not a bypass this line opens.
- The only clinical-screen skip found (SEC-SR2-01) pre-exists in FREEZE-3 and is fixed by condition 1.

## 4. O-1: acceptable for this mission, not blocking

A refused report flags the row holding the reused event id (QRE-R6-14), or the row bound to the activity (QRE-R6-13), as `conflicted`. The flag persists into the next review. That row stays in force but leaves dose, capacity and calibration, and its week reads CONFLICTED (HOLD). SB-1 still hears it.

The effect is the existing conflict policy, identical for the plain report. It errs toward hold and less dose, apart from the SSCTR start-class residual above.

The abuse lever remains: any accepted report source can quarantine another session by naming its id. That lever belongs to SEC-CORE-03 (the report's author and source are not checked). **Owner: QRE (conflict policy) with Security, carried in SEC-CORE-03's closing evidence before real athletes.** It is not a separate binding item.

## 5. F1 to F3: reproduced and classified (none blocks closing SEC-R2-03/-04; all identical in FREEZE-3)

**F1 (BINDING before any real-athlete restart and real-athlete review; High; owner: Core normalizer with QRE; Security recheck)**
- *Reproduced* (`sb1.mjs`). A carried run X (session sx, after the declaration, stopped for SYMPTOM) is evicted from the record entirely. The evicting report is incoming, reuses id `X` for another session, and sorts before X by availability. A same-session "not done" report that sorts first does the same.
- *Effect.* Before: the declaration does not answer. After: `readinessDeclared: true`, so SB-1 is skipped, and the stop and its reason are gone. Unlike SEC-R2-03, nothing is left as history, so the SEC-R2-04 defence cannot help.
- *Closing evidence.* No carried row in force leaves the record under any arrival order, and the probe shapes ask.

**F2 (BINDING before real-athlete use of HealthKit inbound and before a real-athlete restart; Medium; owner: Core with Security; SSCTR informed for C-Q08-1)**
- *Reproduced.* One watch activity merged as a part of session sm is accepted again, a review later, for session sz. Both rows are in force: **80 min from one 40-min execution**. The same batch refuses it (`ACTIVITY_BOUND_TO_TWO_SESSIONS`).
- *Effect.* Dose and capacity inflation, and a raised C-Q08-1 bound.

**F3 (BINDING before real-athlete reviews; Medium; owner: Core with QRE; SSCTR informed)**
- *Reproduced.* A correction in conflict with a part in force has `quarantinedIdentities` `["session:sm"]` in its pass and `[]` once carried. The plain-conflict control keeps it. A later agreeing plain report is then merged into the conflicted row instead of being refused.
- *Effect.* `weekEvidence` takes CONFLICTED from that list (`r6-adaptation.mjs:232–234`), so the session can read as COMPLETED and lift the HOLD on a disputed amount. Capacity still excludes the conflicted row.

## 6. C-F01-2 and SEC-CORE-03: the fix does not depend on them

- The normalizer fix is internal ordering.
- The `v1-f08` rule defends kept rows and relies on no author or custody check.
- Both items stay open, unchanged, and bind before a real-athlete restart. The custody residual SEC-SR2-02 and the O-1 lever are added to them as closing evidence.
- The `observedAt` vs `localDate` observation (SEC_R2_R1) is unchanged.

## Conditions

| ID | Blocking? | What | Closing evidence | Owner |
|---|---|---|---|---|
| SEC-SR2-01 | **Blocking** for the successor freeze (the one focal cycle) | The chain's first-recorded clock is applied only on admission. A replay- or refusal-classified correction leaves every other row's provenance as it was. | The §1 probes (normalizer: Y's clock unchanged; engine: ASK), QE-R7C-10 and C-F01 green, a mutant killed, the directed suite and `--preserved` re-run | Core (this line); Security narrow recheck |
| F1 | Not blocking here; **binding before real athletes** | Arrival order never evicts a carried row in force | The §5 shapes ask; there is no carried-row loss under random arrival | Core + QRE; Security recheck |
| F2 | Not blocking here; **binding before real athletes** | Merged-part activities are indexed across reviews | One activity is never in force on two sessions | Core + Security; SSCTR informed |
| F3 | Not blocking here; **binding before real athletes** | A carried conflicted correction keeps its identity's quarantine | The §5 F3 shape keeps `session:sm` | Core + QRE; SSCTR informed |
| O-1 | Not blocking | Conflict policy unchanged | Carried in SEC-CORE-03 | QRE + Security |
| SEC-SR2-02 | Not blocking | A forged mutual-replacement cycle hides SB-1 | In C-F01-2 custody evidence (or optional f08 hardening) | Core with C-F01-2 |

When SEC-SR2-01 closes, SEC-R2-03 and SEC-R2-04 can be marked CLOSED for the synthetic successor freeze. C-F01-2, SEC-CORE-03, SEC-CORE-03's O-1 item, and F1–F3 remain open, and all of them bind before a real-athlete restart.
