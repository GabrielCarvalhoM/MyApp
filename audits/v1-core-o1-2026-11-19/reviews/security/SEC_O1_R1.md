# SEC-O1-R1: Security decision on the O-1 Conflict Evidence Policy and its runtime candidate

**Judge:** Security, Privacy & Abuse Architect, acting as the PCG security judge. I am an independent instance, not the author. **Date:** 2026-11-19. Synthetic athletes only. I read no SSCTR or QRE review.
**Scope:** POLICY.md r1 (P1, P3–P6, §5), the `r6-provenance.mjs` candidate, and f08 SB-1 as it reads the kept voice. The finding to close is SEC-NCC-02 (SEC_NCC_R1 §6).

## 1. Verdict

**PASS_WITH_CONDITIONS.**
- On FREEZE-5 the e7 shape skipped SB-1. On this candidate it **asks**.
- No kept voice gains dose, clinical, referral or prescriptive authority.
- Integrity refusals are never kept.
- Nothing regresses SB-1, SEC-R2-03/04 or C-F01-1 r2.
- One defect in the candidate's own P4 blocks the successor freeze: **SEC-O1-01a**, a runtime change of a few lines.
- Two residual classes do not block the synthetic freeze. Both bind before a real-athlete restart: **SEC-O1-01b/c**, where a kept stop is erased by a correction, and **SEC-O1-02**, a phantom quarantine.

## Identities judged

| Input | Identity |
|---|---|
| Judged commit | `24ca2ae263eaa5c99153a6071919805421d566b5` (amendment notified mid-review; supersedes 1d418d1) |
| `CoachingCore/src/r6-provenance.mjs` @24ca2ae | sha256 `14596080b83e13c15358ae87c2696daf1cd922789b742152ae867124f4d3ec01` (1d418d1: `41e64477…`; FREEZE-5 f40fbe1: `408eb9be…`) |
| `v1-f08.mjs` | unchanged from f40fbe1 |
| `test/v1core-o1-conflict-evidence.test.mjs` @24ca2ae | sha256 `fed5267322a99752…`, 14/14 |
| Judge probes (scratch `sec-o1-k7m2/probes/`, outside the repo) | `p1.mjs` `80a6910f9567759f`, `p2.mjs` `6f0449467a5d9761`, `fuzz-o1.mjs` `af3dac0b6dc925b9` |

**How the probes were run.**
- The probes ran on `git archive` extracts of f40fbe1, 1d418d1 and 24ca2ae, with `node_modules` copied in.
- No verify script was run. Nothing was committed, and no worktree or freeze was touched. This file is the only repository write.

**Directed suites on 24ca2ae.**

| Suite | Result | Notes |
|---|---|---|
| O-1 | 14/14 | |
| SEC-R2 correction integrity | 24/24 | |
| v1cp-f08 | 15/15 | |
| cf011r2 | 35/36 | The one failure is `SEC-R2-01 engine-written orphan`. It fails on f40fbe1 with the identical assertion: the orphan shape no longer arises since SEC-R2-03. Pre-existing. |
| NCC | 23/26 | The three failures are intended moves, not security regressions. F1 and F3 now expect a refused W to be kept as a voice, so its re-send is `EXACT_REPLAY`; the third is the scenario 21 lineage successor. QRE must re-baseline them. |

**The amendment's own test.** It is RED on 1d418d1 and GREEN on 24ca2ae, which I confirmed independently.

**Findings on 1d418d1 that still hold on 24ca2ae.** All of them. Every `p1` output is byte-identical on both commits, and the fuzz counts are identical too.

## 2. Decisions on items 1–8

| # | Decision | Relation to the proposal |
|---|---|---|
| 1 | **Signals that count under a contested sporting fact.** Two kinds count: a declared stop (`actual.stop`; a missing or unlisted reason reads as SYMPTOM, V1RC R-01), and a voice saying the session took place (`completed` or minutes > 0) after the latest readiness declaration. Each counts from a report in force, a kept voice (head-on, or on an execution in dispute), or a report refused only by a quarantine (SEC-O1-02). No other content becomes a signal: no new clinical category, no symptom inference. | Adopts P1/P6 and extends them to SEC-O1-02 |
| 2 | **Minimum identity, origin and integrity.** A signal needs every check an admitted report passes: athlete match, causal times, measures, response vocabulary, an event id not reused with other facts, an activity not bound to another execution, and a valid correction chain. It must also arrive over the athlete-authenticated channel (C-F01-2). The declared speaker (`sourceQuality`/`activityId`) is **not authenticated**. It may decide whose quantitative voice a correction sets aside, but it **never** clears a safety signal. | Adopts P3; restricts P4 (SEC-O1-01) |
| 3 | **What a contested signal leads to.** SB-1 **ASK**, plus the existing CONFLICTED dose state: no credit, HOLD, the dose repeated and never raised. Both states are already authorized. It never leads to CLINICAL_HUMAN_REQUIRED, a restriction or a referral. Those come only from the existing paths: `INTERRUPTION_DECLARED` with a clinical category, a CLINICAL screen, or standing F08 holds. | Adopts P2/P6 |
| 4 | **When a signal is ignored.** A signal is ignored when it comes from an integrity refusal (P3), another athlete, a report beyond the staleness window, or a session observed at or before the latest readable readiness declaration. Ignored means "not a new question". The run-format record still keeps its stop (C-NCC-3). | Adopts |
| 5 | **Telling the three states apart.** A **pending alert** is SB-1 ASK or the warning-sign screen REQUIRED: a missing input the athlete answers. A **sporting conflict** is `conflicted` plus `provenance.conflict` plus a quarantined identity: a dose state that asks nothing by itself. A **clinical referral** is CLINICAL_HUMAN_REQUIRED, from the existing paths only. A kept voice changes neither `provenance.conflict` nor `mergedSourceIds` and emits no clinical status. Verified by reading the code: `clinicalBreak` reads only F08 facts, and only f08 reads `provenance.parts`. | Adopts, stated explicitly |
| 6 | **A quantitative resolution never erases a pending screening.** A declared stop on record after the latest readiness declaration keeps SB-1 asking until a later readiness declaration. This holds wherever the stop sits: in force, a kept voice, or a history row. No correction, merge, speaker rule or dispute resolution answers it. This is the rule the run-format layer already applies (SSCTR-RWS-B-01: "only the screen answered after the stop clears it"). **The candidate does not meet it** (SEC-O1-01). | **Replaces** P4/P6 for stop-bearing voices. SSCTR must concur, because this extends a shared rule to SB-1 |
| 7 | **How a screening validly stops blocking.** Only through a readable readiness declaration by this athlete, made after the session (S8). Resolving the dispute releases the dose (CONFLICTED → credit), never the screening. A voice with no stop that only says "done" may still be retracted by its own speaker's correction naming it (existing E-1). | Adopts S6/S8 and narrows what a correction can answer |
| 8 | **Persistence.** The voice is a `provenance.parts` entry plus its input hash on the ledger row. It survives a re-read, a JSON round trip, a restore and a restart, and the history row keeps it after a resolution. A replay is `EXACT_REPLAY`. Legacy records read as before (SEC-NCC-03 class). Trusting the stored parts is within C-F01-2 custody. | Adopts P5; verified (§4) |

## 3. SEC-NCC-02

**CLOSED for its stated closing evidence.**
- f08's readiness question hears a refused report's declared stop.
- `e7` asks: `N[C]{N,S}` gives ASK, where FREEZE-5 gave DECLARED.
- The answer survives a re-read ×2, a JSON round trip and a later review.
- The in-dispute (third-voice) shape also asks.

The residual mechanisms are new findings, not the original loss on refusal. They are filed below and are **not** closed by this declaration:
- **SEC-O1-01:** a kept stop is erased later by a correction.
- **SEC-O1-02:** a valid stop is lost through a quarantine with no flagged row.

## 4. Attack analysis

**Fabrication.** Can an invalid, foreign or forged report add a voice, open SB-1 or block a resolution?
- **Integrity refusals add nothing.** Another athlete, an invalid measure, a future report, a report before the run, an event id reused with other facts, a borrowed activity and an invalid chain are all refused and none is kept. In the fuzz, 3 × 2 × 1500 cases gave **0** integrity-refused ids kept as a voice.
- **A valid but forged report on the authenticated channel can do three things:**
  - open SB-1 ASK. An admitted forged report could already do this, and it is the fail-safe direction.
  - block a resolution. A third-speaker voice (`quality:'UNVERIFIED'` or a fake activity id) is nobody's word and must be agreed with, so the session stays CONFLICTED: no credit, HOLD. This errs low and gains no authority (SEC-O1-03).
  - bind its activity id to the disputed execution. That is the more protective O-R2-1 direction.
- **A forged voice cannot reach dose or clinical state.** `mergedSourceIds` is unchanged, and the run-format layer reads only `mergedSourceIds`. `occurred` needs every voice to say "done", so an extra voice can only make it stricter. A voice dated before the declaration does not ask (`F1_preDeclarationVoice`: DECLARED).

**Suppression.** Can a crafted report or correction remove a kept safety voice?

| Attempt | Result |
|---|---|
| Replay with the same event id | `EXACT_REPLAY`, voice kept, ASK |
| Same id with novel facts | `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, voice kept, ASK |
| Same id with the *row's* facts | Read as `EXACT_REPLAY`, because it is compared with the row rather than the part. No effect; voice kept (observation O-O1-1) |
| Self-flagged report (OOS-1) agreeing with the row | Merged into the amount, as pre-existing; voice kept, ASK |
| Forged device-speaker correction | Athlete voices carried; still disputed; ASK |
| **Corrections by an athlete or unknown speaker** | **Erase the stop: SEC-O1-01 below** |

**SEC-O1-01, a kept stop erased by a correction.** Base: `e7` record `N[C]{N,S}`, where N is the athlete's "not done", S is the athlete's 12-minute symptom stop, and a readiness declaration precedes them.

| Case | Correction | Result on 24ca2ae | FREEZE-5 |
|---|---|---|---|
| **a** (`p2.mjs`) | The device's stop S is kept against N. The athlete's correction N2 (naming N) stays disputed with S: `N2[C]{N2,S}`, ASK. Then a correction from an **unknown speaker** (`source.quality:'UNVERIFIED'`) names N, which the row in force no longer holds. | `U1{}`: S and N2 are retired **unheard**, and the result is **DECLARED** | `N2{N2,U1}`, DECLARED (S was never kept) |
| b (`B4`) | An unknown-speaker correction names S with "0 min" | `S9{N,S9}`, DECLARED: a non-athlete retracts the athlete's stop | S never kept |
| c (`B1`–`B3`) | The athlete reaffirms "not done", naming **N**, not S. This also happens with no `source` at all, because the default MANUAL counts as ATHLETE, or with `quality:'SELF_REPORT'`. | The speaker rule sets S aside: `N2{}`, DECLARED. This persists after a round trip | S never kept |

**Why case a blocks the freeze.**
- It is the class the 24ca2ae amendment was written to close ("another speaker's voice could leave the row in force unheard"), left open for unknown speakers.
- The fallback `voicesOf` is taken only when `mine` is a known speaker. With `mine===null` and no holder, `inherited` stays null, and the admission retires every row on the identity.

**Why cases b and c matter.** They contradict P6/S6 ("resolving a quantitative dispute does not answer the readiness question") and item 6. Neither regresses FREEZE-5, where S was never kept.

**SEC-O1-02, phantom quarantine (pre-existing, in O-1 scope).** `ACTIVITY_BOUND_TO_TWO_SESSIONS` quarantines the incoming identity without flagging any row on it, and OOS-1 does the same with a self-flagged report refused for its chain. A later valid report of that identity in the same pass meets `IDENTITY_QUARANTINED_BY_CONFLICT` with no disputed row, so it is **refused and not kept**. It is lost from the record for good.

Minimal reproducer (`p1.mjs` C1). The record holds N (sx, "not done") and Z (sz, `hk-z`, before the declaration). One review brings:
- B: sx, `hk-z`, 30 min, reported 12:10;
- S: sx, symptom stop, reported 12:30.

| Order | Excluded | Result | Next review |
|---|---|---|---|
| C1: B before S | `B:ACTIVITY_BOUND_TO_TWO_SESSIONS`, `S:IDENTITY_QUARANTINED_BY_CONFLICT` | `N{}`, DECLARED | DECLARED |
| C2: S before B | | `N[C]{N,S}`, ASK | |

C3 (OOS-1 self-flag) behaves as C1, and FREEZE-5 is identical.

**Fuzz (`fuzz-o1.mjs`).** Setup:
- random batches on two sessions;
- manual, three watch activities (one bound to a prior session) and unverified sources;
- self-flags, foreign reports, bad measures, corrections and id reuse;
- each batch compared in one review (three permutations) and split in two.

Cases where SB-1 differs by arrival or batching:

| | Total | Borrowed activity (SEC-O1-02) | Same class (activity shared across sx/sy, sy has no row) | Self-flag (OOS-1) | Event id reuse (integrity, P3, pre-existing) |
|---|---|---|---|---|---|
| FREEZE-5 | 138/1500 | | | | |
| 24ca2ae | **86/1500** | 78 | 1 | 4 | 3 |

The candidate halves the order dependence, and **SEC-O1-02 is the remaining class**. P7 ("arrival order and batching do not change whether disputed or the voices kept") does not hold in it.

**Persistence.**
- The fuzz re-read ×2 with a JSON round trip changed nothing in force or in the voices: **0** changes.
- History rows keep the voices after a resolution (focal S6).
- f08 reads a restored record the same way.

**Retention and new attack surface (SEC-O1-03).**
- Refused head-on and in-dispute reports are now persisted, and `partOf` clones the whole `actual`, extra keys included.
- 2000 spam voices on one session, each carrying a 1 KB pad, made the record **2.6 MB** (FREEZE-5: 828 B); ingesting took 0.58 s.
- The dispute is then unresolvable by the athlete (`stillConflicted: true`).
- It errs low and gains no authority, but it is unbounded growth from refused input and a durable no-credit lever. It is bounded only by the staleness window.

**SB-1 regressions.** None found. SEC-R2-03/04, C-F01-1 r2 and SEC-V1CPI-02 suites are green, apart from the pre-existing orphan test above. Every `p1` case that asks on FREEZE-5 also asks on 24ca2ae.

**Observations (not conditions).**
- **O-O1-1 (Low, QRE):** a reused voice id is compared with the row's facts, not the part's.
- **O-O1-2 (Low, pre-existing C-F01-1 r2):** SB-1 dates a voice by its row's `observedAt`.

## 5. Conditions

| ID | Blocks the successor freeze? | Runtime change? | What | Closing evidence | Owner |
|---|---|---|---|---|---|
| **SEC-O1-01a** | **Yes** (one focal cycle) | **Yes** (normalizer, a few lines) | While a dispute stands, a correction from **any** speaker, unknown included, that names a report the row in force no longer holds must carry the flagged row's other voices. The `voicesOf` fallback must not depend on `mine`. | 1. `p2.mjs` ends in ASK, and S is still a voice of the row in force or of a still-disputed one. 2. The amendment test and the O-1 14/14 tests stay green. 3. A mutant restoring `mine?…:null` is killed. 4. SEC-R2 24/24 and cf011r2 green except the pre-existing orphan test. | Core; Security narrow recheck of exactly these items |
| SEC-O1-01b/c | No | Yes (f08 SB-1 or normalizer; mechanism chosen by Core) | Item 6: a declared stop on record after the latest readiness declaration keeps SB-1 asking until a later readiness declaration. A correction, the speaker rule or a resolution never answers it, whoever speaks. This reuses the run-format rule SSCTR-RWS-B-01. The quantitative resolution is unchanged. | `p1` B1–B5 ASK; S6/S8 unchanged; a stop-less "done" retracted by its own speaker still releases SB-1. **SSCTR concurrence** on extending the rule to SB-1; if SSCTR disagrees, escalate to the Chief as a shared-rule conflict. | Core + SSCTR; Security recheck. Binds before a real-athlete restart |
| SEC-O1-02 | No | Yes (normalizer) | A quarantine that flags no row on an identity (a borrowed activity, OOS-1) must not lose a later valid report of it. The report is processed as without that quarantine, or kept, and the outcome is order- and batch-independent (P7). Stripping the incoming `conflicted` flag, which closes OOS-1, covers C3 but not C1. | `p1` C1 ≡ C2 (ASK); `fuzz-o1.mjs` shows 0 order-dependent SB-1 cases outside the event-id-reuse class; F2/QRE-R6-13 tests green | Core + QRE; Security recheck. Binds before a real-athlete restart |
| SEC-O1-03 | No | Yes (bounded) | Bound the kept voices per row (for example one per event id with a per-row cap), and keep in a part only the validated fields (`completed`, measures, `stop`, `exercises`, response). Ingestion size limits belong to the app boundary (C-F01-2). | The spam probe shows a bounded record and an unchanged outcome | Core; before real athletes |

## 6. Dependencies, stated and not closed here

- **SEC-CORE-03 (correction author not validated).** The speaker rule reads declared `sourceQuality`/`activityId`, and any client can claim ATHLETE (the default with no source) or a device. The speaker rule is therefore **not an authentication boundary**.
  - Once SEC-O1-01b/c holds, a forged correction can still move the quantitative resolution either way, within credit or no credit. It can no longer clear a safety signal.
  - This judgment does not close SEC-CORE-03.
- **C-F01-2 (custody).**
  - Kept voices, their `availableAt`, `inputHashes` and activity bindings are engine-written record content. A forged carried record can add or remove voices.
  - Trusting them is custody, as for every carried part (SEC_NCC_R2), and this judgment does not close C-F01-2.
  - SEC-NCC-03 (legacy records) and OOS-2 are unchanged.
