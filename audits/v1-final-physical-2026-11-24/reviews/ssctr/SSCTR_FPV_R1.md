# SSCTR review of the V1 final physical validation candidate, R1 (2026-11-24)

**Verdict on `503945a` (base `8ff74bb`, RC-1, content `89796df`), for the FINAL RELEASE FREEZE on these bytes (synthetic athletes only): ACCEPT.**
- No prescriptive behaviour changes: dose, progression, hold release, readiness, return, taper and substitution are all the same. The engine's sporting modules are byte-identical. The one effect on prescription is that decisions the engine already makes on the FPV-01 path are now recorded instead of refused. I verified that those decisions do not depend on the label the stored row keeps.
- SEC-BC-R2-01 can only add a hold. It never releases one.
- G07 keeps the approved contract: an erasure is never read as recovery or readiness.
- Three findings, all informational. None blocks.
- This is a narrow review that only checks the approved contracts are preserved. It is not a new sporting audit and opens no G01–G04 question. Clinical matters stay CLINICAL_HUMAN_REQUIRED.

## 0. Reviewer, authority, bytes, method

**Reviewer**
- SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, launched as a fresh instance by the Chief.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, I delegated nothing, and I claim no native dispatch.
- I read the constitution and the `sports-science-review` skill, and my previous review `audits/v1-blocker-closure-2026-11-24/reviews/ssctr/SSCTR_BC_R1.md`.
- I wrote none of the candidate, its tests or its evidence. I did not read the Security or QRE reviews of this line.

**Literature**
- WebSearch and WebFetch exist as deferred tools; I did not load them.
- The questions are about preserving contracts: which label a reader reads, and whether a hold can be released. I make no new empirical sporting claim and set no number. I wrote no JSON decision record and did not run the validator.
- There is no new prescriptive approval, so no human revalidation queue entry is created.

**Bytes**
- I ran `git archive 503945a CoachingCore audits` and `git archive 8ff74bb …` into `…/scratchpad/ssctr-fpv-r1/{cand,base}` and copied in `node_modules`.
- I did not modify, stage or commit anything in the author's worktree. Its untracked `audits/v1-final-physical-2026-11-24/results/` was not judged.
- `git diff 8ff74bb 503945a --stat -- CoachingCore/src`: only `boundary/custody.mjs` (+13/−2) and `boundary/views.mjs` (+6/−2) change.
- `git diff --quiet` over `CoachingCore/fixtures`, `src/r6-adaptation.mjs` and `src/v1-f08.mjs` is empty.

| File | @503945a sha256 prefix | @8ff74bb |
|---|---|---|
| `src/boundary/custody.mjs` | `fc576c433b26fb78` | `f58b52399eca4d77` (= the one judged in SSCTR_BC_R1) |
| `src/boundary/views.mjs` | `6f0eb07c50933152` | `38c3c6144273044e` |
| `test/v1final-fpv-01.test.mjs` | `f816aeac902220c8` | (new) |
| `test/v1final-sec-bc-r2-01.test.mjs` | `5eb3dab1784eb907` | (new) |
| `audits/v1-final-physical-2026-11-24/mac/final-oracle.mjs` | `5f2a514e661dedb1` | (new) |

**Fixtures.** `core.json`, `int.json`, `j5.json`, `j5-answers.json` and `p16.json` are byte-identical (not in the diff).
- `focal.json` changes only its `bundleSha256` and a `defaultLocale` label (`pt-BR` to `en-US`). Its digests are unchanged. This is not sporting.
- `final.json` and `hmac.json` are new.

**Commands** (Node v24.19.0)
- The two new focal files pass 6/6 on the candidate.
- I ran the full `node --test` on both extracts and compared them with `titles.mjs`.
  - Candidate 1940/1892/46 (2 skipped), base 1934/1886/46 (2 skipped).
  - **No new failing title and none that stopped failing.**
  - In an archive extract the RC-1 record test fails on both trees, because there is no git repository. So my run does not discriminate that one title. The author's run below does.
- The author's Mac runs (`suite-mac-final.txt` against `suite-mac.txt`) went from 1934/1888/46 to 1940/1893/47.
  - One title is newly failing: `REPMILE-COACHINGCORE-V1-RC-1: FREEZE-7 and V1INT preserved … nothing else changed since ee256ae`.
  - No title stopped failing.

**Probes.** All are read-only and synthetic, in `…/scratchpad/ssctr-fpv-r1/probes/`. Each takes a CoachingCore root and ran on both extracts.

| Probe (sha256 prefix) | What it reads |
|---|---|
| `fpv-probe.mjs` (`7903a120`) | (1) The G07 journey as in `final-g07-erasure`, against a control that does not erase: codes, statuses, view state, executable sessions, the facts left after erasure, the view 30 days later, and a digest of four weeks of prescriptions. (2) The FPV-01 path through an engine spy: the label stored against the label the engine binds. |
| `fpv-diff.mjs` (`4d72d799`), `fpv-diff-w1.mjs` (`077e98f6`) | The engine's whole answer for the same input, with the stored row carrying the recorded label (EASY/BUILD) or the re-bound one (RETURN/RETURN). Checked for the screen after the declaration and for the next week. |

## 1. Answers

### (a) Is prescriptive behaviour changed beyond what the engine already decides? **No.**

- **Engine untouched.** No file that computes a dose, progression, hold, readiness, return, taper or substitution changed. The two changed files are the custody reconcile and the plan view.
- **Fixtures unchanged.** The frozen oracles (core, int, J5, P16) are byte-identical, so every recorded engine answer is unchanged.
- **Suite.** In the author's Mac runs, no test that passed before now fails, except the RC-1 freeze-record check. That one fails by construction, because files changed after RC-1 (SSCTR-FPV-03). The 6 added tests are the two new focal files.
- **FPV-01's effect is only that the engine's answer now gets recorded.**
  - On base, the athlete's next write after a hold, a readiness declaration and a report in the same week is ENGINE_CONTRACT_VIOLATION. My probe reproduces this both with and without an erasure.
  - On the candidate it is OK, with status KEEP.
  - The engine's answer is the same. Custody now records it instead of refusing it.
  - `asRecorded` still fails closed. Only `mode` and `phaseClass` may differ, both must be strings, and the session, type, sport, role, planned minutes and every stated fact must stay byte-equal. Any other change is refused, as the focal forgery cases pin.
- **SEC-BC-R2-01 is display only.** It adds only `ERASED_F08` rows dated after the clock to the rows `standingHolds` reads, and never adds a READINESS_DECLARED.
  - So `lastReady` cannot move, and the set of holds can only grow.
  - Writes are refused (CLOCK_BEHIND_RECORD) until the clock passes the marker. After that, the marker is in the as-of set anyway, and the engine answers CLINICAL_HUMAN_REQUIRED (focal test 2).

### (b) FPV-01: is keeping the recorded context sporting-safe? **Yes (SSCTR-FPV-01, -02).**

- **The engine ignores the stored label.**
  - `bindObservations` (`r6-adaptation.mjs` l.215) rebuilds `context` from the plan in force on every decision.
  - The engine's readers (the pool filter l.247, learned interference l.319, learned maintenance l.396, the evidence reducer, the learning model update l.615 via `usableBound`) all run on that re-bound ledger.
  - Probe check: with the stored row labelled EASY/BUILD or RETURN/RETURN, the engine's answer is identical except for `inputHash` and `trace.reviewHash`. This holds for both the screen after the declaration and the next week's decision.
- **Readers outside the decision.**
  - `restartIntake` (`v1-f08.mjs`) reads only `context.sessionType`, `sport` and `runMinutes`. All three stay byte-equal under `asRecorded`. It never reads `mode` or `phaseClass`.
  - `views.mjs` and `historyView` read no context.
  - Run calibration (`mode==='EASY'`), run history (`mode`) and the forecast index (`mode==='EASY'`) read the decision's own `base.actualLedger`, which is re-bound. They fall back to the input ledger only when the decision returns none.
  - So no reader I found reads a stale label in a way that changes a dose.
- **Remaining path: rows carried into a later namespaced plan.** After a restart, a row bound under an earlier plan is carried exactly as recorded (`r6-adaptation.mjs` l.209). It is then read with its stored EASY/BUILD label (SSCTR-FPV-02).
  - That label is the context the session was actually executed under, before the hold.
  - It is the same label every pre-hold session carries when the hold falls in a later week. So FPV-01 creates no exposure that the approved carry rule does not already have.
  - Its one dose-touching consumer, learned maintenance, can only keep a long run where it is, never step it up.

### (c) G07, `final-g07-erasure`: is the contract preserved? **Yes.**

The probe gives the same result on both trees up to the readiness declaration:

| Step | Result |
|---|---|
| Symptom stop | KEEP with `RUN_STOPPED_FOR_A_SYMPTOM` screened |
| Hold | BLOCKED |
| Erasure | Leaves `ERASED_F08`, read as a hold of unknown cause. BLOCKED on both sports, 0 executable sessions |
| 30 days later, without a declaration | Still BLOCKED. Time does not release it |
| Delivery before readiness | SCREEN_REQUIRED |
| Readiness declaration | MODIFY, RETURNING |
| Screen and delivery after it | On the candidate: KEEP and KEEP. On base: ENGINE_CONTRACT_VIOLATION, which is FPV-01 |

- **Only a readiness declaration ends the hold.** The erasure ends nothing.
- **An erasure earns no faster plan.** Four weeks of prescriptions after the declaration have the same digest with and without the erasure (`900f91dc…`), on both trees.
- **SEC-BC-R2-01 closes the clock-ahead variant.** Without it, an erasure dated ahead would be dropped from the view, which would then show RETURNING with sessions executable.

## 2. Findings

| ID | Severity | Blocking | Finding | Action / owner |
|---|---|---|---|---|
| **SSCTR-FPV-01** | Info | No | After FPV-01, a stored row can show EASY/BUILD while the engine reads it as RETURN on every decision. Verified harmless today: the engine overwrites the context, and the readers outside the decision read keys that stay byte-equal or read the re-bound ledger. | **Re-review trigger:** any reader that takes a stored row's `context.mode` or `phaseClass` from custody rows (not the decision's `actualLedger`) to credit progression, calibrate pace or choose a dose. Add `mode`/`phaseClass` reading to the FPV-01 comment's contract. Owner: Core, with SSCTR on trigger. |
| **SSCTR-FPV-02** | Info | No | Rows carried unbound into a later namespaced plan keep their recorded EASY/BUILD label. This is the same as the existing carry rule (QRE-AIF-02 / L-APP-06), and its only dose-touching reader (`learnedMaintenance`) can only hold a long run. | No change. Re-review together with SSCTR-FPV-01's trigger, or if the restart's cold-start rule ("never from prior doses") changes. Owner: Core. |
| **SSCTR-FPV-03** | Info | No (record, not sporting) | The RC-1 freeze-record test fails on the candidate by construction: boundary files changed after RC-1. | The final freeze record should supersede RC-1, declaring the two amendments (SEC-BC-R2-01, FPV-01), instead of leaving that title failing unexplained. Owner: author with QRE and Chief. |

The conditions from earlier reviews (SSCTR-BC-01…05, C-BC-3, the Founder's confirmation of G07 retention) stand unchanged. This review neither extends nor closes them.

## 3. Status fields

- **Dispositions.**
  - SEC-BC-R2-01: ACCEPTED, contract-preserving.
  - FPV-01: ACCEPTED, contract-preserving.
  - G07 journey: contract preserved.
- **Evidence status.** Engine-behaviour claims rest on code reading plus synthetic probes. Sporting claims: none new.
- **Proposed AE action:** none.
- **Gate:** none of G01–G04 is opened or closed.
- **Publication:** none. I promote no Product Truth and approve no human-facing prescription.
- **Clinical:** the hold, its release and any return after symptoms remain CLINICAL_HUMAN_REQUIRED, together with the readiness declaration as designed. This review assessed no person.
- **Confidence: high** that no prescriptive behaviour changes on these bytes. This covers the synthetic paths exercised and the readers traced, not every possible field record.
- **Re-review triggers:**
  - any change to `bindObservations`;
  - any change to the restart carry rule;
  - any change to `standingHolds` or `readableF08`;
  - SSCTR-FPV-01's reader trigger;
  - a field case where stored and bound labels diverge in a way that shows in a native view.
