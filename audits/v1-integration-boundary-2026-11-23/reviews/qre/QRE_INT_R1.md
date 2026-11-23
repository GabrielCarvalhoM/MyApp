# QRE review R1: CoachingCore Integration Boundary (V1INT-1)

**Judge:** Quality & Reliability Engineer (independent; did not author the candidate). **Candidate:** `a52db2b` on `claude/v1-cc-integration-foundation`, base `e44d855` (FREEZE-7). **Date:** 2026-11-23. Synthetic only.

## Verdict: NOT_READY

Three defects in executable behaviour block it, each reproduced through the boundary with the real composed engine:
- **QRE-INT-01:** the unit of custody is incomplete for an offered change the athlete accepts.
- **QRE-INT-02:** the contract's own "send it again" path takes the run out of pace evidence for good.
- **QRE-INT-03:** `acknowledgeRecordLoss` deletes an intact record, a standing hold included.

The rest is sound and well tested: persistence, retries, corruption, the anchor, the clock, the regression delta and the determinism of the device fixture. One focal cycle should close INT-01, INT-03 and INT-04 and decide INT-02.

## What was executed (current evidence, this machine, Node v24.19.0)

| Check | Result |
|---|---|
| `node --test test/v1int-*.test.mjs` | 42/42 pass (124 s) |
| Full suite `node --test` (from `CoachingCore/`) | **1893 tests, 1850 pass, 43 fail**. Raw output: `probes/suite-qre-a52db2b.txt`. |
| Fail titles against the FREEZE-7 record (`audits/v1-core-sc-2026-11-20/evidence/suite-candidate.txt`) | **Exactly one new title**: "Safety Continuity: the eleven earlier freezes are preserved; only src/r6-provenance.mjs and src/v1-f08.mjs amended since 48e428f". None gone. Files: `probes/fails-candidate.txt`, `probes/fails-freeze7.txt`. |
| FREEZE-7 bound files, hashed directly against `RUNTIME_FREEZE_V1CORE_7.json` | 49/49 byte-identical |
| `node scripts/v1core-freeze-7.mjs --check` | **exit 1**. It names custody.mjs (FREEZE-1 not preserved) and 8 undeclared files. See QRE-INT-07. |
| `int-oracle.mjs`, rerun into `probes/int-qre-rerun.json` (copy `probes/p07-int-oracle-copy.mjs`, OUT redirected) | Driver, input and expected are identical to the committed `Fixtures/int.json`. Replay = live holds. |
| Mutation run, 28 in-memory mutants (`probes/mutate-run.mjs --fast`, hook `probes/mutate-hook.mjs`, no file edited) | See §Mutation |
| Probes P01–P10 (`probes/p*.mjs`, outputs `probes/p*-out.txt`) | See the findings |

All probes run from `CoachingCore/` as `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/<probe>.mjs`.

## Findings

| Id | Severity | Blocking | Owner |
|---|---|---|---|
| QRE-INT-01 | High | Yes: READY, and C-F01-2 "unit complete" | Boundary author |
| QRE-INT-02 | Medium (no dose or safety effect; it withholds evidence) | Yes for real athletes; a condition for synthetic use | Boundary author + Core/SSCTR. **Escalate:** the fix may need an engine change (Founder). |
| QRE-INT-03 | High (safety-relevant) | Yes | Boundary author; Security on the INTEGRITY_FAILURE case |
| QRE-INT-04 | Medium | Yes for the custody.mjs successor record | Boundary author; Security co-judge |
| QRE-INT-05 | Medium | Condition (native handoff) | Boundary author + native |
| QRE-INT-06 | Medium | Condition | Boundary author + SSCTR |
| QRE-INT-07 | Low | No (evidence accuracy) | Boundary author |
| QRE-INT-08 | Low | No | Boundary author / native |
| QRE-INT-09 | Low | No | Native handoff |
| QRE-INT-10 | Low | No (route to Security/G07) | Security |
| QRE-INT-11 | Low | No (test gaps) | Boundary author |

### QRE-INT-01: an accepted offer leaves the record of formats without the plan in force's formats; the athlete's report of the moved session is not recorded (High, blocking)

**The cause.** For MOVE and LEARNED_REARRANGEMENT, custody calls the engine twice: once with the change, once with it withheld (`plain`). Integration keeps the records of the **last** call, `plain`.
- The offered proposal's delivered formats exist only in the first answer. P01 measured 35 formats there and 34 in `plain`.
- `accept` adopts the proposal with no engine call.
- After the accept, `presentation.inForce` shows the first call's run sessions. Its `w4-run-d2` (TIME, `formatHash fcc22446…`) is **not** in the stored `runFormatRecord`.
- The athlete then reports that session citing the format the app showed. The engine answers **ASK `UNKNOWN_RUN_FORMAT`**, and the report is **not recorded** (`notRecorded: NOT_RECORDED_BY_THIS_DECISION`).

So invariant §3.1 ("each carried record is exactly the engine's last returned one") holds literally, but the unit is not complete for the plan custody puts in force. The conforming clients have no offer path, so the contract's comparison with them never exercises this case. No test covers an offer or an accept through the boundary.

**Reproduction:** `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p01-offer-accept.mjs`. It uses TEN_K_EIGHT_WEEKS, weeks 0–3 checked in, the week-4 quality session missed, then MOVE offered and accepted.

**Required:**
- Keep the formats the offered answer delivered for the pending proposal. Either merge that answer's `RUN_FORMAT_EMITTED` rows for the proposal's sessions, a rule Core must approve, or have `accept` obtain them from the engine.
- Add a test: offer → accept → a report citing the shown format is recorded. Do the same for decline and for a REQUESTED_CHANGE accept.

### QRE-INT-02: the "send it again" path for a report answered ASK takes the run out of pace evidence for good (Medium, blocking for real athletes; escalate)

**The cause.**
- A report the decision does not record (ASK: no current screen) still leaves a `RUN_REPORT_RECEIVED` fact in the record of formats. The contract notes this as pre-existing.
- The boundary then documents re-sending as the recovery: §5 "sent again with the screen", README §14 step 5 "volta junto com a próxima triagem", and test `tm-5`.
- The re-send is a **new** report of the same speaker, not a correction. An origin exists only for admitted reports, so the boundary does not bind it.
- The record then holds two reports in force for the session, and the row carries only one of them. The engine's own `reportsReading` gives **`REPORT_NOT_CARRIED` (whole row withheld)** for good.
- The control, the same workout sent once with the screen, gives `withheld: null`.
- This reproduces on both channels:
  - DEVICE: `p03-device-queue.mjs` (d);
  - ATHLETE: `p03b-athlete-ask.mjs`.

**Effect.** Every run first sent while the screen is stale loses its pace, calibration and forecast evidence. A HealthKit background delivery made before the athlete opens the app is the common case. Completion, credit, load and stops are unaffected, so there is no safety or dose effect. `tm-5` asserts only `recorded.length===1`, so it passes over this.

**Reproduction:**
- `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p03-device-queue.mjs`, last two lines;
- `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p03b-athlete-ask.mjs`.

**Route:** the fix is one of:
- the boundary binds the re-send to the not-recorded report it repeats, if the engine admits that;
- the engine stops counting a report it did not record as "in force". That is a Core change and needs the Founder.

Either way, `tm-5` must assert the lineage verdict.

An offset-less `observedAt` is another way into the same state: admission lets it through, then the engine answers `OBSERVATION_TIME_REQUIRED` (`p05-time-forms.mjs`). Admission should refuse an instant without `Z` or an offset (`INVALID_TIME`), as §9.6 already requires of native code.

### QRE-INT-03: `acknowledgeRecordLoss` deletes an intact record, a standing clinical hold included (High, safety-relevant, blocking)

**The cause.** `acknowledgeRecordLoss` checks only that an anchor item exists. It never checks that the record is in fact lost or rolled back.

**Behaviour:**
- On an intact record it answers OK and removes the document and the anchor. The next read is `NOT_ENROLLED`.
- On a record that fails its integrity check, it removes it too.

**P10:**
1. A warning-sign hold is recorded (`CLINICAL_HUMAN_REQUIRED`).
2. A restart over the intact record is still `CLINICAL_HUMAN_REQUIRED`, and the plan view is `BLOCKED`.
3. `acknowledgeRecordLoss` answers OK.
4. `enroll` answers `PROPOSED`, the view is `VALID_PLAN`, and 0 rows are on record.

So one call reachable from the app turns a held athlete into a fresh plan without the hold. This is exactly what the restart path refuses. The contract says only this act starts over after `RECORD_LOST` / `RECORD_ROLLED_BACK`, but nothing enforces that precondition. No test calls it on an intact record. I14 shows the `NOT_LOST` guard is not pinned either.

**Reproduction:**
- `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p10-ack-hold.mjs`;
- `p04-persistence-anchor.mjs` (a), (b).

**Required:**
- Admit the act only while the anchor check fails now (missing, older, or forked). Otherwise answer `NOT_LOST`.
- Security decides whether an `INTEGRITY_FAILURE` record may be set aside by the athlete, and whether a tombstone or evidence copy is kept.
- Add tests for an intact record, a record with a hold, and a tampered record.

### QRE-INT-04: `evolves` admits forged evolutions the contract says it refuses (Medium, blocking the custody.mjs successor record)

The amended `reconcile` keeps a stored row changed in place in four forged shapes, each with no engine contract violation. The run used the frozen-engine answer, altered for one review (`p06-evolves-forged.mjs`):

| Forged shape | Kept? | What the contract (§6) says |
|---|---|---|
| First merge: the row's own voice is removed from `parts`, and only the newcomer stays | Kept | "the row's own voice is unchanged" |
| `actual.minutes` set to 999 in the review that adds a voice | Kept | "Its amount and response change only together with such a part": true literally, but the amount is not tied to any voice |
| A report of this review **for another session** merged as a voice of this row | Kept | "every new part is a report of this review": the session is not checked |
| `conflicted` set to `"maybe"` | Kept | — |

On the legitimate side, the probes found no refusal. `p02-evolves-shapes.mjs` ran:
- device → athlete → device re-sync;
- athlete → device → device re-sync;
- athlete → device → athlete correction;
- a dispute and then an athlete correction that agrees;
- a dispute and then a device re-sync that agrees;
- device + device → re-sync of the second → athlete;
- an athlete symptom stop → a device workout.

All were OK, the chain verified, and the athlete's answers survived device re-syncs. So E-1 is not reproduced through this path.

**Required:**
- On a first merge, `parts[x.eventId]` must exist and equal the row's voice.
- Each added part must be an incoming observation of the row's own session.
- `conflicted` may only be absent or `true`.
- State explicitly that the amount is the engine's, unbounded by `evolves`.

Security should confirm before any successor record. The engine is frozen, trusted code, so this is defence in depth and has no runtime effect today.

### QRE-INT-05: the device answer cannot be applied as the native handoff says (Medium, condition)

README §14 step 5 says a workout leaves the queue "só quando o seu id estiver em `recorded`". The probes (`p03-device-queue.mjs`, `p09-queue-poison.mjs`) found five gaps:

1. **Wrong ids.** `recorded` and `notRecorded` hold custody event ids, never `activityId`s. The answer carries no activity id at all.
2. **Shifted index.** In a mixed delivery, `observationIds[k]` is the k-th workout **after** the duplicates are removed. So index 0 of the answer is index 1 of the delivery in P03 (b). This mapping is written nowhere.
3. **Inconsistent type.** A duplicate-only delivery answers `recorded: 0`, a number, where every other answer has an array.
4. **One item refuses the delivery.** A single refused workout refuses the whole delivery. P09 (a) shows `UNKNOWN_SESSION` at `index:1` three times in a row, while the valid workout beside it is never recorded. No queue rule says what happens to the refused item, so a literal queue blocks itself.
5. **Empty delivery.** An empty delivery (`activities: []`) is admitted, runs a full `WEEKLY_REVIEW`, and writes a new version. P03 (c) shows v3 → v4.

**Required:**
- An answer per activity: `activityId → RECORDED | DUPLICATE | NOT_RECORDED(reason) | REFUSED(code)`.
- A queue rule for each outcome.
- An empty delivery refused or a no-op.
- The native list should also say that the request id must be new after any **answered** request: a re-send after ASK is a new action. Reusing the id replays the ASK, or gives `CONFLICT_IDEMPOTENCY_KEY` once the screen is added.

### QRE-INT-06: a workout delivered after a restart, linked to the earlier plan's session, is refused with no documented path (Medium, condition)

After a restart the new plan holds other session ids. A queued HealthKit workout done under the old plan (`w0-run-d1`) is refused `UNKNOWN_SESSION` (P09 (b)), so the execution can only be recorded unlinked, or not at all.
- The athlete channel does not check `sessionId` against the plan.
- The engine reads an earlier plan's stop (SSCTR-CORE-B-01).

So the two channels behave differently. The boundary and SSCTR must decide how an execution of the earlier plan is recorded, and the native rule must follow.

**Reproduction:** `node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p09-queue-poison.mjs`, part (b).

### QRE-INT-07: the regression claims are not exact as written (Low)

The behavioural delta is exact: one new failing title, by design. Two things in the evidence are not:

- **The FREEZE-7 check.** Contract §8 and the review request say "`v1core-freeze-7.mjs --check` stays 49/49".
  - On the candidate it **exits 1** before checking the record: `preserved()` reports "COACHINGCORE-V1-FREEZE-1 … NOT preserved: custody.mjs" and "CHANGED and not declared: admission.mjs, custody.mjs, integration.mjs, the 5 v1int test files".
  - The 49 bound files are byte-identical only when hashed directly.
  - The evidence should say this, and cite the direct hash check, not the command.
- **The counts.**
  - The candidate has 1893 tests, which is 43 more than the stated base of 1850, but it adds 42 v1int tests. Either the base was 1851 or a count differs; reconcile it in `evidence/suite-candidate.txt`.
  - `red-on-base-custody.txt` reports 41 tests and 13 failing, against 42 tests now. Re-run RED on the final test set.

### QRE-INT-08: an anchor write that fails is swallowed (Low)

`op.anchorStale` is set and never read. The answer is OK (P04 (d)), so the anchor stays one version behind. A store later restored to that version then reads OK and is not detected as rolled back.
- **Required:** surface `anchorStale` in the answer and have native code retry the Keychain write, or state this as an accepted limit in §9.4.
- **Reproduction:** `p04-persistence-anchor.mjs` (d).

### QRE-INT-09: an enroll whose write landed before the store threw (Low)

The retry of that enroll answers `CONFLICT_ALREADY_ENROLLED`, because enroll has no idempotency (P04 (c)). Native code must read this answer as "enrolled, read the plan"; it should be added to §9.

### QRE-INT-10: health-derived content outside the erasure (Low, Security/G07; by inspection)

§10 lists `runFormatRecord` and `origins`. Two more boundary-owned parts also keep the warning-sign screen after `eraseHealthFacts`, which makes no engine call and leaves `carried` as it was:
- `carried.requests[*].outcome.warningSignScreen`;
- `carried.presentation.readings.warningSignScreen`.

This diverges from SEC-V1FC-05: custody drops its own cached responses of erased events, while the boundary's request record keeps them.

### QRE-INT-11: test gaps found by mutation (Low)

See §Mutation.

## Mutation

**Method.** 28 mutants were applied in memory at load time; no file was edited. The four v1int files ran for each. `--fast` skips the three 2000-iteration tests, except for A04L, which ran them all.
- Tools: `probes/mutate-run.mjs`, `probes/mutate-hook.mjs`.
- Results: `probes/mutation-out.json`.

**Result: 19 killed, 9 survived.** Of the survivors, 2 are equivalent or dead code. The other 7 are real gaps (QRE-INT-11):

| Mutant | Change | Why it survives / what is missing |
|---|---|---|
| **I06** | A retry rebuilds its reports with the **new** clock, not the first one | Every test retries at the same clock. P11 (`p11-retry-later.mjs`) shows the candidate is correct for a retry 5 minutes later, on both channels (`replayed=true`). Under I06 the same probe gives `CONFLICT_IDEMPOTENCY_KEY`: a write that landed would never be confirmed. Needs a test of a retry at a later clock. |
| **I13** | The anchor no longer detects a fork (same version, other `docMac`) | Only the older and missing cases are tested. |
| **I14** | The `NOT_LOST` guard of `acknowledgeRecordLoss` is removed | Untested; see INT-03. |
| **C03** | The first-merge check of the row's own voice is removed | Untested; and INT-04 shows the dropped-voice shape passes even with the check in place. |
| **A03** | A device report without `observedAt` is admitted | Untested at the boundary. |
| **A04L** | `deviceActivitiesPerSession` 4 → 5 | The test reads the limit from the module under test, so a changed value passes. Pin the constants (or the measured basis) in a test. |
| **I12** | Presentation of other plans is not pruned | A projection only; harmless, but untested. |
| I11 | Correction across device activities | Equivalent: a device correction is always bound by its own activity, and the athlete cannot send `activityId`. This is dead defensive code. |
| I18 | The boundary's own idempotency-digest check is removed | Equivalent in effect: custody's request digest refuses the replay the same way. |

The killed mutants are I01–I05, I07–I10, I15–I17, A01, A02, A05 and C01, C02, C04, C05. The tests do discriminate:
- authorship;
- the carried MAC binding;
- the stale-records mutant;
- the origins admitted;
- the collision check;
- excluded reasons;
- duplicates;
- the clock check;
- the evolves conditions that are tested.

## Answers to the review questions

1. **The unit of custody.** It is correct for review and restart. P08 confirms the restart answer carries no `carriedRecord`, `referenceState` or `updatedModel` that custody would drop. It is **incomplete for an offer that is accepted** (INT-01). `paceRevisionRecord` is correctly left out (V1X-PACE-REVISION is off).
2. **Persistence and failures.** Covered by tests and confirmed:
   - throw before the write;
   - throw after the write, with replay on retry;
   - a version race reported as `CONFLICT_STALE_VERSION`, not `PERSISTENCE_FAILURE`;
   - corruption and splices;
   - another key;
   - the anchor's lost and rolled-back cases;
   - the clock behind the record;
   - `REQUEST_ID_REUSED`.
   
   No path was found that confirms a write that did not land. Two paths lose one that did:
   - an intact record through `acknowledgeRecordLoss` (INT-03);
   - a delivery blocked whole by one refused item (INT-05).
3. **Determinism.** Same inputs, clock, key and ids give the same bytes (Journey D). The oracle rerun is identical to the committed fixture. The replay = live check compares only each journey's last stored hash, which suffices for these journeys. The fixture uses a memory store with no anchor, so persistence and anchor behaviour on the device rest on the §14 step 4 tests, not on the fixture. Stored content is order-independent across the two voices: device→athlete and athlete→device give the same row (P02 A/B).
4. **`evolves`.** It is minimal for the legitimate flows probed, with none refused, but not sound as specified (INT-04).
5. **Discrimination and regression.** Most mutants are killed. The survivors are in §Mutation. The regression claim is exact in behaviour and inexact in its stated evidence (INT-07).
6. **Native obligations and the Mac handoff.** These are mostly clear: key, store, anchor, request ids, the crypto host functions (`createHash` is already provided by the P0 prelude) and the clock. They are incomplete or wrong on:
   - the queue mapping (INT-05);
   - refused items (INT-05);
   - late deliveries across a restart (INT-06);
   - anchor write failure (INT-08);
   - the enroll retry (INT-09);
   - fresh request ids after an answered request (INT-05).
   
   `safetyFields` is returned only on admission refusals. The app keeps the draft on every other refusal too, and §7 should say so.

## Stop

NOT_READY for the scope evaluated (`a52db2b`, Node only). Re-review needs:
- INT-01, INT-03 and INT-04 fixed, each with a test that fails on `a52db2b`;
- INT-02 routed by the Chief (an engine decision or a boundary binding), with `tm-5` asserting the lineage;
- INT-05 to INT-09 answered in the contract or the README, or fixed.

Nothing here closes IOS_REVALIDATION_PENDING; nothing ran in JavaScriptCore.
