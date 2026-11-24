# QRE BC R1: independent Quality & Reliability gate on the V1 blocker-closure candidate

**Judge:** Quality & Reliability Engineer (independent; not the author). **Synthetic athletes only.**
**Version judged:** commit `6e85222` (branch `claude/v1-cc-blocker-closure`). **Base:** `ee256ae` (FREEZE-7 + V1INT-BOUNDARY-SUCCESSOR-1).
**Scope (mission §13, QRE):** determinism, idempotency, persistence and restoration, regression by identity, test discrimination, record integrity, performance of the directly affected consumers, the integration contract, the RC verifier design. No new general audit.
**Date:** 2026-11-24. **Node:** v24.19.0 (Windows 11).

## Verdict

**READY_WITH_CONDITIONS**

All nine runtime and boundary fixes behave as their closing criteria say, on the author's reproductions and on my own probes. The suite on `6e85222` shows the by-design failures and nothing else, by title. There is no regression by identity, and no existing test was edited.

Three conditions remain:
- one demonstrated defect: **QRE-BC-01**, a residual of SSCTR-INT-R2-01 in the state G07 creates;
- test-discrimination gaps on several new guards (**C-BC-2**). The behaviour is correct, but nothing pins it;
- the RC verifier and the records need hardening (**C-BC-3**, **C-BC-4**).

None of them blocks the physical validation on the Mac and iPhone. QRE-BC-01 blocks real athletes. All four fit in the single consolidated corrective cycle, and that cycle should run before `RELEASE_CANDIDATE_V1_RC_1.json` is written, so that the record binds the corrected bytes.

## Commands (all on my own copies; the worktree was not touched except this file and `probes/`)

| What | How |
|---|---|
| Copies | `git archive 6e85222` and `git archive ee256ae` (`CoachingCore audits`) extracted under my scratchpad (`qrebc-r1-1795526340/{cand,base}`), with `node_modules` copied in. A git environment as well: `git clone --no-checkout <worktree>` per commit, then `git -c core.longpaths=true checkout -f <sha>`. In those clones the suites ran with `GIT_CONFIG_*` setting `core.longpaths` for that process only (no config written). |
| Suite | `node --test` in `CoachingCore/` of each clone (both in parallel, nothing else running). Failing titles compared with `evidence/titles.mjs`. |
| Mutation | `probes/mutate-run-bc.mjs` (in memory, `probes/mutate-hook.mjs`; no file edited). 57 mutants. Tier 1 runs the focal file; a survivor is re-run against 13 wider files (v1int ×6, SC, O-1, F08, restart, voices). A kill counts only on a title that is green without the mutant (so the by-design red tests never count). The survivors were then re-run with `probes/mutate-survivors.mjs`: against every boundary-reaching test file (`--set=boundary`, 15 files), and against the full suite (`--set=all`; and R10 on its own). |
| Probes | `p01-boundary-edges.mjs`, `p02-bench-boundary.mjs`, `p03-co13-corrections.mjs`, `p04-evolves-merge-forgery.mjs`, `p05-qreint02-merged.mjs`, `p-rc-graph.mjs`, the RC verifier exercise (`rc-verifier-design-*.txt`), and re-runs of my V1INT R1/R2 probes p02, p06, r2/p14, r2/p15 (`r2-reruns/`). |
| RC verifier | Read in full. `--check` run read-only in the clone (at `6e85222` it answers `no record`, as designed). `--write` and `--check` were then exercised in my scratch clone only, with the record **staged, never committed** there. |

## Current evidence

### Suite by title (`probes/titles-qre.txt`, `probes/suite-*-qre.txt`)

| Run | tests | pass | fail | Failing titles against the reference |
|---|---|---|---|---|
| `ee256ae` (clone) | 1908 | 1865 | 43 | **identical** to `audits/v1-integration-boundary-2026-11-23/evidence/suite-cycle1.txt` (0 new, 0 gone) |
| `6e85222` (clone) | 1926 | 1879 | 47 | against `ee256ae`: **4 new, 0 gone** (below) |

The four new failing titles on `6e85222`, each by design and each with its successor:

| Failing (by design) | Why | Green successor on `6e85222` |
|---|---|---|
| `C-NCC-3 (b), SEC-INT-01: … QRE-INT-02 (open, routed) pinned` (tm-5) | pinned QRE-INT-02 "as it stands" | `QRE-INT-02 (device route, successor of tm-5)` ✔. tm-5's other assertions stay pinned by green tests: mutants T1 (device states a screen: killed by `SEC-INT-01: the device channel carries no screen of its own…`) and T2 (onboarding screen not captured: killed by the tm-5 successor) |
| `QRE-INT-11 A04L: the limits are the reviewed values` | `safetyExcess` added | `successor of QRE-INT-11 A04L` ✔ (every old value plus `safetyExcess:3`; mutant S4 killed) |
| `V1INT-BOUNDARY-SUCCESSOR-1: FREEZE-7 preserved (49/49) …` | seven declared amendments | `REPMILE-COACHINGCORE-V1-RC-1 …`: **red at `6e85222`** (no record yet, by the mission's order). I wrote the record for `6e85222` and staged it in my scratch clone: it then passes ✔ (`rc-verifier-design-2.txt`) |
| `REPMILE-COACHINGCORE-V1-RC-1 …` | the record is written after the gates | the same test, once the record exists (as above) |

The author's interim claim (only the by-design failures) is confirmed by title. In the git-archive extract the git-dependent record tests change state: there the V1INT successor test fails on the base too, and two older preservation tests pass. That is why the suite was judged in clones.

**No existing test edited.** `git diff --stat ee256ae 6e85222 -- CoachingCore/test` lists only two new files (`v1bc-blocker-closure.test.mjs`, `v1bc-rc-record.test.mjs`). No budget or threshold changed.

### RED for the right reason (`evidence/red-on-ee256ae.txt`, checked against the code)

14 of the 17 focal tests fail on `ee256ae`, and 3 controls pass on both commits. Each failure is at the item's own assertion:
- C-O1-3: `adverse` 0 in the device-first orders;
- SEC-SC-02: `G2` DECLARED;
- SEC-SC-03: `G1` NO_PAUSE;
- QRE-INT-02: 2 facts / `REPORT_NOT_CARRIED`;
- SEC-INT-02R: forgeries kept;
- SEC-INT-06: `OK` in place of `BEFORE_RECORD_START`;
- SEC-INT-07: `LIMIT_EXCEEDED` for the safety correction;
- SEC-INT-04 rest: `CLOCK_BEHIND_RECORD`;
- SSCTR-INT-R2-01: `null`;
- G07: screen kept;
- A04L successor: `safetyExcess` missing.

The mutation run (below) confirms that each focal test fails when its own guard is removed (A1, A5, P1, F1, F3, F5, R1, C1, I1, I4, I9, I10, I11 and others).

### Per-dimension evidence

| Dimension | Evidence | Result |
|---|---|---|
| Determinism | SEC-SC-03 focal test (two identical `restartIntake` answers); SEC-SC-02 re-read after a JSON round trip; the author's differential (16 configurations, nondeterminism and re-read invariants 0, `bc-diff/SUMMARY.txt`); p03: the same C-O1-3 reading in both orders after every correction kind | pass |
| Idempotency | p01 (d): a safety correction past the limit, then the same `clientRequestId` again: same answer, version +1 once. QRE-INT-02 device route: a re-delivery is a duplicate, one row. p01 (b): a retried erasure with the old version gives `CONFLICT_STALE_VERSION` and writes nothing | pass |
| Persistence and restoration | C-O1-3 survives a file-store restore (focal). QRE-INT-02 controls: replay after a restore is identical. p01 (b): an erasure under a behind clock, then a restore from a file store: `lastAt` unchanged, screen still erased; the next delivery is `SCREEN_REQUIRED`, then `OK` once the athlete answers. SEC-SC-02: a legacy part with no `observedAt` reads as before (focal) | pass |
| Regression by identity | Suite by title (above). My V1INT probes re-run on both commits, outputs **identical**: p02 (7 legitimate multi-voice shapes, all kept), p06 (5 forgeries, all refused), r2/p14 (kept-voice forgeries refused, control kept), r2/p15 (screen) (`r2-reruns/`) | pass |
| Behaviour of the fixes beyond the focal cases | p03 (C-O1-3, `adverse` per order × correction): `6e85222` gives 1/1/0/1 in **both** orders (none, amount-only correction, ADVERSE withdrawn, correction agreeing with the watch); `ee256ae` gives 0 for "device first, none". A non-resolving correction keeps the reading, an explicit withdrawal is heard, and the row is never credit (CONFLICTED). p01 (c): athlete-channel per-day limit: 8 plain, the 9th plain refused, 3 with a stop admitted, the 4th refused; ADVERSE and IMPAIRED admitted past the limit, TOO_HARD refused. p01 (e): a mixed request is refused whole with `index:1, firstDay`; a workout on the enrollment day itself, before the enrollment instant, is admitted. p01 (f): a pre-record report with a stop is refused and names its `safetyFields`. p04: 6 further merge forgeries **all refused** on `6e85222`, against 4 of the 6 kept on `ee256ae`; both controls kept. p05: merged and kept-voice reports keep their standing report facts and the same reading as on `ee256ae` | pass |
| Integration contract | `api.mjs` unchanged (not in the diff). Journeys A–H (`v1int-journeys`) green. One new refusal code, `BEFORE_RECORD_START` (`{code,index,field,firstDay}`, with `safetyFields`). `LIMIT_EXCEEDED` keeps its shape. No other new code in the diff | pass, with C-BC-4 (records) |
| Performance | See the performance section below. The author: review ×1.03, voice bytes ×1.062. Mine (interleaved boundary journeys): median ×1.002, bytes ×1.003 | pass |
| RC verifier design | See the RC verifier section below | pass, with C-BC-3 |

## Status per item (QRE view)

| Item | Closing criterion (inventory) | QRE status | Evidence |
|---|---|---|---|
| **C-O1-3** | same count in all four orders and after a non-resolving correction; never credit | **FIXED_VERIFIED** (test gap A2: an IMPAIRED-only voice is not pinned, C-BC-2) | focal ×3; p03; mutants A1, A3, A5 killed |
| **SEC-SC-02** | G2 and G4 ASK; D3, D4 stay DECLARED | **FIXED_VERIFIED** | focal; `reproductions-before-after.txt`; P1, F1, F3, F4 killed; F2 killed by the full suite (`QRE-R2-04`) |
| **SEC-SC-03** | G1 ASK; nothing else in p3b moves | **FIXED_VERIFIED** (F6 survives: the restart-day restriction without a declaration is not pinned, C-BC-2) | focal; F4b, F5, F7, F8, F9 killed |
| **QRE-INT-02** (core) | re-sent run carried, 1 fact, stop still screened, no double credit | **FIXED_VERIFIED**. The "merged or kept stays in force" clause is pinned by the full suite (R10 killed by 17 run-format tests) and holds in p05 (same facts and reading as `ee256ae`) | focal ×3; p05; R1, R2, R3, R7, R9, R10 killed |
| **SEC-INT-02R** | 6/6 refused; legitimate shapes admitted | **FIXED_VERIFIED**. Three of the four new rules are unpinned: C2 (non-word response key), C5 (a stated key dropped from the new voice), C7 (one execution: `completed` equal). For each, p04 shows a forgery that only that rule refuses (C-BC-2) | focal; p02/p06/p14 re-runs; p04; C1, C3, C4, C8, C9 killed |
| **O-SC-1** | most parts through the boundary bounded and tested | **FIXED_VERIFIED** (test) | focal O-SC-1 (≤ 1 + 4 voices, record < 400 kB) |
| **SEC-INT-06** | p5 (A) refused, backfill within the plan admitted | **FIXED_VERIFIED** (I2: the enrollment day itself admitted is unpinned, C-BC-2; the records name the code wrongly, C-BC-4) | focal; p01 (e), (f); I1 killed |
| **SEC-INT-07** | a stop past the limit recorded and screened; a 4th excess refused | **FIXED_VERIFIED** on both limits. The per-day athlete path and each signal kind are unpinned: I5, I6, S1, S2, S3 survive (C-BC-2) | focal (corrections; device per-day); p01 (c); I3, I4, I8, S4, S5 killed |
| **SEC-INT-04 rest** | erasure under a behind clock succeeds; `lastAt` unchanged | **FIXED_VERIFIED** | focal; p01 (b), with restore and the next operations; I11 killed |
| **SSCTR-INT-R2-01** | a duplicate after a stop names the screen | **FIXED, with a residual: QRE-BC-01** (after an erasure of health facts, the duplicate-only answer is `null` again) | focal (I9 killed); p01 (a) |
| **G07** (screen erasure) | — | **FIXED_VERIFIED** in behaviour (screen erased, persists over a restore, delivery `SCREEN_REQUIRED` until a new screen, stop retained and still asked). The retention is the Founder's call (inventory C) | focal; p01 (a), (b); I10 killed |
| SEC-O1-03 | duplicate of its parts | agree | — |
| Deferred and native rows (SEC-INT-05, -12, QRE-SC-04, O-SC-S4, SEC-NCC-03, QRE-SC-03, O-O1-1, C-NCC-3 rest; inventory C) | — | no QRE objection to the dispositions; out of this gate's behaviour scope | — |
| My earlier conditions: **C-R2-1** | — | stays met. C06/C09 were re-targeted (the code moved) as C1/C8: killed. S02 is pinned by `SEC-INT-01 / QRE C-R2-1 (S02)` (green) | mutation |
| **QRE-INT-02 (core)** (QRE_INT_R2) | an engine decision and tm-5 asserting the lineage verdict after re-delivery | **CLOSED** by the fix and the tm-5 successor | above |
| **O-R2-1** | — | unchanged (native queue; not in this line's code) | — |

## Mutation results (`probes/mutation-bc-out-main.json`, `mutation-bc-out-R10-R11.json`, `mutation-R10-fullsuite.txt`)

57 mutants on the focal file and 13 wider files: **33 killed, 24 survived**. The survivors were then re-run: the boundary ones against all 15 boundary-reaching test files (all still survive), and A2, A4, F2, F6, R10 and R11 against the full suite (R10, A4 and F2 killed). **Final: 36 killed, 21 survived.** 11 of the survivors are real, unpinned guards (C-BC-2). The other 10 are redundant, equivalent or pre-existing.

| Guard | Killed | Survived (why it matters) |
|---|---|---|
| C-O1-3 `voicedAdverse` / `kindOf` | A1 (parts not read), A3 (no ADVERSE), A5 (revert), A4 (no `conflicted` guard: killed by the full suite, `Simulation: …`) | **A2** (IMPAIRED-only voice unread: unpinned in the full suite) |
| SEC-SC-02 `partOf` / `saidAfter` | P1, F1, F3, F4, F2 (`>=`: killed by the full suite, `QRE-R2-04`) | — |
| SEC-SC-03 pause | F4b, F5, F7, F8, F9 | **F6** (drops "on the restart day" without a declaration: unpinned in the full suite) |
| QRE-INT-02 `notDecided` | R1, R2 (stop dropped), R3, R7 (refusals not in force), R9, R10 (merged and kept voices not decided: the merged report's fact goes, p05 2 → 1; killed by 17 full-suite tests) | R4, R5, R6, R8, R11 (redundant: `inputHashes` names every source in the shapes built) |
| SEC-INT-02R `evolves` / `sameReport` | C1, C3, C4, C8 (label), C9 (response rule) | **C2, C5, C7**: real guards, each the only refusal of a p04 forgery (`p04-out.txt`); C6, C10, C11 (exemptions: survivors make admission stricter, so no legitimate test shape uses them; no false refusal seen in journeys, p02 or the suite) |
| SEC-INT-06 | I1 | **I2** (`<=`: the enrollment day refused; p01 (e) shows it admitted, but no test pins it) |
| SEC-INT-07 | I3, I4, I8 (chain depth), S4 (value), S5 (no signal) | **I5, I6** (athlete per-day excess path: removed, or unbounded); **S1, S2, S3** (each signal kind alone); I7 (`headOf` loop bound: affects only the head named in a refusal) |
| SSCTR-INT-R2-01, G07, SEC-INT-04 rest | I9, I10, I11 | — |
| tm-5 coverage (by-design red) | T1, T2 | T3 (pre-existing R2 survivor S03, low; not a regression) |

R10 against the **full suite**: see the R10 section below.

## Findings and conditions

| Id | Severity | Blocking: physical validation / real athletes | Minimal reproduction | Owner | Closing criterion |
|---|---|---|---|---|---|
| **QRE-BC-01** (defect; residual of SSCTR-INT-R2-01 in the G07 state) | Low | No / **Yes** | `probes/p01-boundary-edges.mjs` (a). (1) enroll. (2) Send a weekly form with `actual.stop {reason:'SYMPTOM'}`: the screen is `RUN_STOPPED_FOR_A_SYMPTOM`. (3) `notFeeling100`. (4) `eraseHealthFacts([nf])`: OK. (5) Re-send the same form with no eligibility: `{duplicate:true, warningSignScreen:null}`. (6) An empty review right after: `RUN_STOPPED_FOR_A_SYMPTOM`. Cause: the duplicate-only answer reads `op.loaded.presentation.readings.warningSignScreen` (integration.mjs, the SSCTR-INT-R2-01 line). The erasure set `readings` to null (`readings:erasing?null:…`, line 119), while G07 keeps the stop and the screen is still required. | Engineering (boundary) | After an erasure of health facts, the duplicate-only answer names `RUN_STOPPED_FOR_A_SYMPTOM` while the screen is required. For example: no early return when `readings` is null (the engine is asked), or the erasure keeps `warningSignScreen`. A focal test for steps 1–6, and p01 (a) shows the screen at step 5. |
| **C-BC-2** (test discrimination) | Medium | No / No (the behaviour is correct today, as my probes show; a later change could remove these guards silently) | The 11 real survivors: A2, F6 (full suite), C2, C5, C7, I2, I5, I6, S1, S2, S3 (all boundary tests). For C2, C5 and C7, `p04-out.txt` shows a forgery that only that rule refuses, and that the mutant then keeps. | Author (tests only) | Tests are added and none is edited:<br>- an IMPAIRED-only voice on a disputed row is heard (A2);<br>- without a declaration, a stop on another day with a session done on the restart day keeps the existing answer (F6);<br>- the p04 forgeries: a non-word response key (C2), a stated key dropped from the new voice (C5), a "not done" voice merged with no stated response (C7);<br>- a report on the enrollment day is admitted (I2);<br>- the athlete per-day excess, as p01 (c): stop, ADVERSE and IMPAIRED each admitted alone past 8, the 4th refused (I5, I6, S1–S3).<br>Then `probes/mutate-survivors.mjs --set=boundary --only=C2,C5,C7,I2,I5,I6,S1,S2,S3` and `--set=all --only=A2,F6` show every one killed. |
| **C-BC-3** (RC verifier hardening) | Low | No / No (the record binds what the app consumes; this is about the record's own integrity) | `rc-verifier-design-2.txt` T6: `--write --commit deadbeef` on a tree with an uncommitted change to `integration.mjs` writes the record, and `--check` then passes on that tree. T9: a record edited to `fileCount:1`, `filesDigest:'x'` passes `--check` (it prints "1/1"). | Author (script) | `--write` refuses unless `git rev-parse HEAD` starts with `--commit` and `git status --porcelain -- CoachingCore` is empty except the record. `--check` recomputes `fileCount` and `filesDigest` from `files` and compares. Re-running T6 and T9 shows both refused. |
| **C-BC-4** (records and contract) | Low | No / No | The inventory names the SEC-INT-06 refusal `BEFORE_PLAN_START` and says "before the plan's start". The code refuses `BEFORE_RECORD_START`, dated before the record's creation day (`doc.createdAt`, in the plan's offset). `INTEGRATION_BOUNDARY_CONTRACT.md` (refusal table, §9 queue rules) does not list the new code. | Author (records) / Native | FINAL_REPORT and the contract name `BEFORE_RECORD_START` and its shape `{code,index,field,firstDay}` + `safetyFields`. NATIVE_OBLIGATIONS states that the HealthKit anchor starts at enrollment, that a refused index is set aside (the existing §9 rule), and that the athlete's date picker never offers a day before the enrollment day. |
| **C-BC-5** (sequence) | — | No / No | At `6e85222`, `REPMILE-COACHINGCORE-V1-RC-1` is red because the record does not exist yet, so the by-design red V1INT successor test has its green successor only after the record is written. | Author | After the record is written and committed, the suite on that commit shows exactly the three by-design titles (tm-5, A04L, V1INT-BOUNDARY-SUCCESSOR-1) and the RC-1 test green. `v1-rc-1.mjs --check` exits 0. |

**Observations, not conditions:**
- **(O-1) A pre-record stop has no report route** (p01 (f)). The refusal names `safetyFields`, so the draft is kept, but it can never be admitted. Pre-enrollment health belongs to the onboarding screen; SSCTR/Security may confirm.
- **(O-2) Over-binding.** The RC record binds 87 files: all 67 `src/*.mjs` and the URL data. The V1 entry graph (engine + boundary) reaches 44 modules. None of them imports JSON by import attributes or a bare package (`p-rc-graph-out.txt`), so the binding is complete for what the app consumes.

## Performance (directly affected consumers)

- **Author** (`evidence/bench-ee256ae-vs-candidate.txt`, `voice-load-…`): review median ×1.029, p95 ×1.025, restarts ×1.02–1.05, normalizer merge ×1.029, re-read ×1.005, late batch ×1.014, record bytes unchanged on the journey, keptBytes ×1.062 on the voice load (the new `parts.*.observedAt`).
- **Mine** (`probes/p02-bench-boundary.mjs`, `p02-bench-out.txt`): one process, base and candidate interleaved, 10 journeys each. Each journey covers every run session of week 0 (screen, watch, disputing form with ADVERSE (kept voice), a second watch fragment), every strength form, and a closing review. That is the admission loop with the new guards, custody `evolves`/`sameReport` on merges and kept voices, `kindOf`, and `notDecided`. Per operation: median 86.48 → 86.65 ms (**×1.002**), p95 94.44 → 91.36 ms (×0.967), record 311,200 → 312,101 bytes (**×1.003**).
- The O-SC-1 focal test bounds the record at < 400 kB after 100 hostile sends on one session. **No budget changed**, and no budgeted test fails.
- Result: **pass**.

## R10 against the full suite

R10 drops merged and kept voices from the "decided" set. It survives the focal and wide files. Against the **full suite** it is **KILLED** by 17 existing green tests (`mutation-R10-fullsuite.txt`), among them `C-C2: after a device re-sync, a merged row …`, the closure-2 QRE-RWS successors, `QRE-RFC-A-01 closed …` and `T5 no leak, 500 cases …`. So the merged-voice clause of QRE-INT-02 is pinned by the run-format suite, and R10 is not a gap.

The boundary survivors (C2, C5, C6, C7, C10, C11, I2, I5, I6, I7, S1, S2, S3, T3) were re-run against **every** test file that reaches `src/boundary` (15 files, 141 tests; `mutation-survivors-boundary.json`). All of them **still survive**.

The engine survivors were re-run against the **full suite** (`mutation-survivors-all.json`; baseline 1879 pass, 45 fail in the extract):

| Mutant | Full suite | Killed by / meaning |
|---|---|---|
| A4 | **KILLED** | `Simulation: repeated surplus earns, repeated adverse regresses, …`. The guard matters, and it is pinned |
| F2 | **KILLED** | `QRE-R2-04: "took place" … the declaration boundary is strict`. Pinned |
| R11 | SURVIVED | The decided set with only `inputHashes` and refusals: `inputHashes` names every source in every shape the suite builds. Redundant with R10 (killed), so not a gap |
| **A2** | SURVIVED | An IMPAIRED-only voice on a disputed row is read by no test (C-BC-2) |
| **F6** | SURVIVED | Without a declaration, the "on the restart day" scope of SEC-SC-03 is read by no test (C-BC-2) |

R4, R5, R6 and R8 are the one-by-one parts of R10/R11 (redundant sources) and were not re-run.

**Net unpinned guards (C-BC-2):** A2, F6, C2, C5, C7, I2, I5, I6, S1, S2, S3. Low-value or equivalent survivors, with no condition: C6, C10, C11 (exemptions that only make admission stricter), I7 (the head named in a refusal), R4–R6, R8, R11 (redundant), and T3 (pre-existing since R2).

## RC verifier design (`scripts/v1-rc-1.mjs`)

- **Binds what the app consumes.** It binds every `src/*.mjs` and every `new URL('…',import.meta.url)` data file, 87 in all, among them the 10 SSCTR/authority records under `audits/` (for example `SSCTR_RECHECK_B0.json`, the 2027-04-30 expiry). The static entry graph (`p-rc-graph.mjs`) confirms that no consumed file is missing.
- **Detects undeclared changes** (`rc-verifier-design-2.txt`, scratch clone, record staged):
  - T1: an undeclared change to a consumed file → `CHANGED and not declared`;
  - T2: an amended file changed after the record → `NOT byte-identical`;
  - T3/T3b: a new src file, untracked or staged → `UNTRACKED` / `CHANGED and not declared`;
  - T4: a bound `audits/` data file changed → `NOT byte-identical`;
  - T5: a test file changed → refused. This is stricter than needed, and acceptable;
  - T7: the record's hash edited → refused;
  - T8: an entry removed from the record → `NOT BOUND`;
  - each exits 1, and the final check on the honest record exits 0.
- **Gaps:** C-BC-3 (an unverified `--commit`, a dirty tree at `--write`, `fileCount`/`filesDigest` not re-verified). `--check` also needs git and the base commit, so it cannot run inside an app bundle. The record's `files` map is the portable part, and the Mac run should verify those hashes directly.
- **Sequence:** the record does not exist at `6e85222`, so `--check` answers `no record` (C-BC-5).

## Stop

The verdict is issued on `6e85222`, with per-item status, and the blocking defect (QRE-BC-01, for real athletes) is reproduced minimally. Nothing needs a Founder decision for QRE. The G07 retention remains the Founder's, as the inventory records.
