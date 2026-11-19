# SEC-NCC-R1: Security / PCG gate on the Normalization Consistency candidate (F1, F2, F3)

**Judge:** Security, Privacy & Abuse Architect. Independent instance, not the author. It reproduced and classified F1–F3 in `audits/v1-core-sec-r2-2026-11-19/reviews/security/SEC_SR2_R1.md` §5. No QRE or SSCTR review of this line was read. **Date:** 2026-11-19. Synthetic athletes only.

**Verdict:** **PASS_WITH_CONDITIONS** (SECURITY_READY_WITH_CONDITIONS).
- F1, F2 and F3 are closed on their closing evidence.
- One new defect introduced by this line, **SEC-NCC-01**, is **BLOCKING for the successor freeze** and needs a runtime change in the one focal cycle.
- SEC-NCC-02 and SEC-NCC-03 do not block the freeze. They bind before real athletes and need no runtime change in this cycle.

## Identities judged

| Input | Identity |
|---|---|
| Candidate line | `ef490bbc892082f1ec3f062890458ec9b7ce45a3` (runtime `07301f366fca92c7f877ed77886853fdb9b53999`; no `CoachingCore/src` change from 07301f3 to ef490bb) |
| Base / FREEZE-4 | `e704180d48995a9648d46a632eb02589b9942228` |
| `CoachingCore/src/r6-provenance.mjs` @ef490bb | sha256 `fc04b9e21ed5435bbe66fd0bf6bfe40972755b5dc8311a1dd00b7fcf84eddb19` (base `d2439377dce49b6e70f3d2db2c84281e940a7afd9b476964dcc9a60cb075fb3a`) |
| `git diff e704180 ef490bb -- CoachingCore/src` | sha256 `90197e960e7306033a7240c589f4464a6991da6ae8f413492618b6903e954f51` (one file) |
| `CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs` | sha256 `43c13b99448878d48af138d64eed1381774746dff84a8d5a018849b2499962ca` |
| Judge probes (scratch `sec-ncc-q9z4/probes/`, outside the repo; sha256 prefixes) | `sb1.mjs` `52b1a885dcbf406b` (the SEC_SR2_R1 file, unchanged), `fuzz2.mjs` `a224161bcd354341`, `fuzz3.mjs` `d1b05f228e6bffc1`, `legacy.mjs` `4b3fbdc3019dc13e`, `edge.mjs` `f24fe16e48fdaa71`, `e7.mjs` `a601cd2fa905e81d`, `e5d.mjs` `c5b37b5cc7cfbfa3`, `engine-e1.mjs` `141c317f11d134be`, `engine-e1b.mjs` `81224c2afdb03a1d`, `engine-e5d.mjs` `70b0c7b25270b7aa` |

**How the probes were run.**
- Both trees were scratch extracts: `git archive ef490bb CoachingCore audits` and `git archive e704180 CoachingCore audits`, with `node_modules` copied in.
- The probes take the extract as an argument.
- On the candidate extract, the directed NCC tests passed **21/21** and `v1core-secr2-correction-integrity.test.mjs` passed **24/24**.
- No verify script was run, nothing was committed, and no worktree, freeze or history was touched. This file is the only repository write.

## Criteria → evidence → result

### 1. F1: a carried row in force never leaves the record through arrival order — **PASS** (closed)

**`sb1.mjs` shapes (SEC_SR2_R1 §5) on the candidate:**
- **F1_evict:** the carried symptom-stop run X/sx stays in force, flagged conflicted. The late report that reuses its id is refused (`EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`). The readiness question **asks**, where FREEZE-4 gave `readinessDeclared: true`.
- **F1_sameSession:** X/sx stays and the early "not done" R is refused (`DUPLICATE_CONFLICT_QUARANTINED`). It **asks**.

**Independent fuzz (`fuzz2.mjs`).** Setup:
- `incoming:true` and `recordArrival:true`;
- reports split at random across three reviews;
- adversarial reports: self-flagged `conflicted`, forged `provenance.parts`/`mergedSourceIds`/`firstRecordedAt`, forged `superseded`, borrowed activities, reused ids, replays.

2 × 2500 cases, 7500 passes per run:

| Measure | Candidate | FREEZE-4 |
|---|---|---|
| carried rows in force lost from the record | **0 / 0** | 733 / 797 |
| identities lost | 0 / 0 | 70 / 71 |
| symptom stops once in the record that later vanish | **0 / 0** | 129 / 193 |
| re-read changes | 0 | |
| `firstRecordedAt` moved later on a carried row | 0 | 13 / 8 |
| `firstRecordedAt` forged | 0 | |

**Provenance.**
- A carried row now stays the lead of its execution, so its event id and `firstRecordedAt` are stable across reviews.
- An incoming `firstRecordedAt` is overwritten with the decision clock (`edge.mjs` E2).

### 2. F2: one activity is never in force on two sessions — **PASS** (closed for records this line writes; legacy limit in SEC-NCC-03)

**`sb1.mjs` F2.** A later review now refuses Z (`ACTIVITY_BOUND_TO_TWO_SESSIONS`) and flags M/sm. Unflagged minutes in force go from 80 to 0.

**Fuzz.** No activity (own or part) was in force on two identities in 15 000 passes.

**Trust of `parts[].activityId`:**
- `partOf` reads the normalizer's recomputed `provenance.activityId`, built from the report's own `source.activityId ?? canonicalActivityId`.
- `incoming:true` strips `parts`, `mergedSourceIds` and `inputHashes`.
- `edge.mjs` E2: a forged `provenance.parts[Z].activityId:'hk-v'` and a forged `provenance.activityId` with no source both bind nothing. The victim's later `hk-v` report is accepted.
- So an incoming report binds only the activity it claims as its own. That is the same trust it already had (SEC-CORE-03, no HealthKit provenance check).
- E4: an activity merged as a part persists exactly as the same claim does on an own row (control). This is the pre-existing steal/denial lever, and it is not widened.
- A carried part's `activityId` is engine-written record content. Trusting it is inside existing custody, **C-F01-2**. A forged carried record can already do more than this, and no new custody assumption is made.

### 3. F3: a carried conflicted correction keeps its quarantine — **PASS** (closed)

**`sb1.mjs` F3:**
- `session:sm` is quarantined in pass 2 and pass 3, as in the plain control.
- The later agreeing report Q is refused (`IDENTITY_QUARANTINED_BY_CONFLICT`). It is no longer merged.

**Fuzz.** A carried conflicted row's identity was never released without an admitted correction on it: 0 / 0, against FREEZE-4's 79 / 89.

**Clearing a quarantine.** The only path is `admit()` of a correction on that identity, with `heldBefore`. A correction that carries its own `conflicted` flag keeps the quarantine. The correction itself is unauthenticated, which is SEC-CORE-03 and unchanged.

### 4. Refused reports do not change what is in force — **PASS for this line** (pre-existing levers routed below)

Fuzz with the refused report removed, about 4 800 refusals checked per run:
- Flag-only differences are the O-1 policy.
- 2–3 refusals per run change rows in force. Each one is pre-existing and identical in kind on FREEZE-4:
  - a self-flagged `conflicted:true` report that is refused still quarantines its identity for the pass (OOS-1);
  - a plain refused conflict flags the carried row, so a later correction in the same pass resolves the conflict and retires every voice on that identity to history (O-1 with SEC-CORE-03).
- Nothing is lost: retired rows stay as history.

### 5. The new chain rule: a correction made before the report it names was available — **FAIL → SEC-NCC-01 (blocking)**

**What the rule compares.** The rule compares `correctedAt` with `availability(old)`. When the named report was merged as a part, `old` is the **holder row**, so the rule reads the lead report's `reportedAt`, not the named report's own clock. A legitimate correction is therefore refused depending on how reports were split into reviews.

**`e5d.mjs` setup:**
- the watch W of session sm is reported at 12:00 and carried;
- the athlete's report A was made at 11:00 and sent late;
- the athlete's correction C of A, made at 11:30, stopped at 15 min for a SYMPTOM with recovery adverse.

| Variant | FREEZE-4 | Candidate |
|---|---|---|
| d1: W carried, then A and C in one review | C in force, conflicted; 0 unflagged min; `session:sm` quarantined | **C refused `INVALID_CORRECTION_CHAIN`; W in force at 40 min, unflagged; no quarantine** |
| d2: W, A and C in one review | C in force, conflicted; 0 min | C in force, conflicted; 0 min |
| d3: control, C made after W was reported | C in force, conflicted | C in force, conflicted |

**Other shapes.**
- E5a: A and C arrive in separate later reviews. C is refused on the candidate and admitted on FREEZE-4.
- E5c (the reverse error): a correction of a carried part W2, made before W2 was reported, is **admitted** when split across reviews but refused in one review. The holder M was reported earlier.

**Engine (`engine-e5d.mjs`).** Run d3 is known only from the watch (19:00). The athlete's d3 report (18:00) and its correction (18:30: 12 min, SYMPTOM, adverse) arrive the next morning.
- FREEZE-4: `d3-fix` is in force, conflicted, and gives no run-history fact.
- Candidate: `d3-fix` is refused, the watch's 40 min is in force unflagged, and **a 40-min d3 run-history fact** is added.
- The warning-sign screen is still required in both, because the run-format layer reads the request.

**Effect.**
- Dose, capacity and run-evidence credit go to an execution the athlete said stopped at 12–15 min for a symptom.
- The athlete's correction is denied.
- Outcomes differ by how reports were batched. This contradicts the invariant the candidate itself states ("whichever review brought that report", §A F1).

**Abuse angle.** A report source can plant a lead report on the athlete's session with a late `reportedAt` (≤ now) before the athlete's delayed report arrives. The athlete's later corrections made before that instant are then refused. The precondition is SEC-CORE-03, but the refusal itself is new.

### 6. SB-1 / alert persistence — **PASS with a routed residual (SEC-NCC-02)**

**Covered by the probes.**
- The `sb1` shapes ask.
- In the fuzz, a symptom stop that was once in the record never leaves it.
- `engine-e1.mjs`: a late d3 SYMPTOM report dated before the carried d3 "done" is refused by the normalizer, but the run-format layer keeps the stop (`runFormatRecord`). `warningSignScreen` is REQUIRED (`RUN_STOPPED_FOR_A_SYMPTOM`) in that review and in the next one with nothing new.

**Residual (`e7.mjs`).**
- Setup: the carried row is a "not done" (0 min) after a readiness declaration, and a late SYMPTOM report (12 min) conflicts with it.
- The report is refused, so f08 `restartIntake` returns `readinessDeclared: true` and SB-1 is skipped.
- On FREEZE-4 this is **identical under a monotone clock**. FREEZE-4 asked only in the earlier-clock order, and only by the F1 eviction.
- This line makes the outcome arrival-independent; it does not create the gap.

### 7. Loss or double credit; forged or replayed events — **PASS except SEC-NCC-01**

- No row was lost, no activity counted twice, and no orphan or nondeterminism appeared, apart from the tie below. Replays merge or are refused as before.
- `superseded`, `supersededBy`, `context`, `parts`, `mergedSourceIds` and `inputHashes` from an incoming report are stripped.
- `conflicted` and `provenance.conflict` are **not** stripped (OOS-1, pre-existing).

**Legacy FREEZE-4 records (`legacy.mjs`).** A FREEZE-4-written record that holds the F2 double, re-read by the candidate, keeps both rows. There is no eviction and the symptom stop on Z stays, but nothing heals either. This is the author's stated limitation; see SEC-NCC-03.

**Permutation.** One case in 7 500, on both lines: two incoming reports with the same event id and the same instant are ordered by input. It is pre-existing; see OOS-2.

## Conditions

| ID | Blocks the freeze? | Runtime change? | What | Closing evidence | Owner |
|---|---|---|---|---|---|
| **SEC-NCC-01** | **Yes** (the one focal cycle) | **Yes** | The chain rule must compare `correctedAt` with the **named report's own** availability, never with that of the row holding it. For a merged part, use its own clock kept on the part, which is engine-written and within C-F01-2 custody like `activityId`. For a part kept before this line with no clock, use no availability refusal (FREEZE-4 behaviour). Never refuse a correction made after the named report was available. | 1. `e5d.mjs`: d1 ≡ d2 in force (C in force, conflicted, 0 unflagged min, `session:sm` quarantined). 2. E5a admitted. 3. E5c refused in both the split and the one-review case. 4. `engine-e5d.mjs`: `d3-fix` in force, no 40-min d3 run-history fact, screen required. 5. Re-read ×2 and a JSON round trip unchanged. 6. A mutant using the holder's availability is killed. 7. NCC 21+ and SEC-R2 24 green, and `fuzz2.mjs` re-run with 0 lost / 0 doubles / 0 symptomGone / 0 quarantineLost. | Core (this line); Security narrow recheck of exactly these items |
| SEC-NCC-02 | No | No (this cycle) | A report refused for conflicting with a carried row never reaches the ledger, so its SYMPTOM stop is unseen by f08 SB-1 when the carried row is a "not done". The run-format screen still asks. Identical on FREEZE-4 under a monotone clock. | Within the O-1 conflict-policy decision: f08's readiness question hears a refused report's declared stop (or reads the run-format stop facts), `e7.mjs` asks | Core + QRE with O-1; SSCTR informed. Binding before a real-athlete restart |
| SEC-NCC-03 | No | No | A record written by FREEZE-4 or earlier keeps its merged activities unbound, so an F2 double stays and does not heal. | No such record is carried into real-athlete use, or a migration is decided first. All current records are synthetic. | Core / release owner. Before real athletes |

## Outside scope (pre-existing, identical on FREEZE-4; not conditions of this freeze)

**OOS-1 (Medium; owner Core with SEC-CORE-03 / O-1).** `incoming:true` does not strip `conflicted` or `provenance.conflict`. A self-flagged incoming report:
- bypasses `IDENTITY_QUARANTINED_BY_CONFLICT` and merges into a disputed row as a new voice (`edge.mjs` E6: `P/sp[C]<P,K>`);
- quarantines its identity for the pass even when it is itself refused.

Minimal reproducer (fuzz case 1166, one review, empty prior):
- the batch is P1 (s1, reported 06:11, 45 min); W0 (s1, `correctionOf:'P1'`, `correctedAt` 04:02, `conflicted:true`); X (s1, reported 07:27, 40 min, `conflicted:true`);
- with W0, W0 is refused (`INVALID_CORRECTION_CHAIN`), then P1 is refused (`IDENTITY_QUARANTINED_BY_CONFLICT`), and X is the row in force;
- without W0, P1 is in force.

**OOS-2 (Low; QRE).** Two incoming reports with the same event id at the same instant are ordered by input. This is the tie the candidate notes in §F.

**Unchanged.** C-F01-2 (custody, with SEC-SR2-02), SEC-CORE-03 (correction author not checked), and the O-1 lever. This line does not worsen any of them.

## Verdict

**PASS_WITH_CONDITIONS.**
- F1, F2 and F3 are closed.
- **SEC-NCC-01 is blocking for the successor freeze and needs a runtime change.**
- SEC-NCC-02 and SEC-NCC-03 are not blocking and need no runtime change now; both bind before real athletes.
- OOS-1 and OOS-2 are routed.
- The recheck will look only at SEC-NCC-01's closing evidence.
