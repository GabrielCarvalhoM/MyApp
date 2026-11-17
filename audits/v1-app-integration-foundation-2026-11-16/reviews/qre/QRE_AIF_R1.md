# QRE AIF R1: independent Quality & Reliability review of the Application Integration Foundation candidate

- **Judge:** Quality & Reliability Engineer 1.3.0, an independent instance. I did not author this work and I fixed nothing.
- **Round:** one. There is no fix cycle.
- **Date:** 2026-11-16.
- **Candidate:** `e4a2b80` on `claude/v1-app-integration-foundation`. Its parent is `c39d18a` (COACHINGCORE-V1-STRENGTH-FREEZE-1), and `2dfa216` is an ancestor of it (checked with `git merge-base --is-ancestor`).
- **Scope:** everything under `audits/v1-app-integration-foundation-2026-11-16/` in `e4a2b80`, which means the ADR, APP_DATA_CONTRACTS, PERFORMANCE_FOUNDATION, `harness/` and `results/`.
- **Out of scope:** `INTEGRATION_READINESS_REPORT.md` and `results/work/`. Both are untracked and not in the commit. Another author is writing the report at the same time, so I did not judge it.
- **Environment:** Node v24.19.0, Windows 11, the development desktop. No iPhone and no JavaScriptCore. Every number below is a lab number.

## Verdict: READY_WITH_CONDITIONS

The executable evidence supports the candidate's central claims:

- The harness drives the real composed engine with no options.
- The 30 journey checks pass and are deterministic across reruns.
- The cold restore in a fresh process gives the same next answer.
- The portable-host redirection is really on the engine's path.
- The lab statistics are computed correctly and are never presented as iPhone numbers.
- The freezes are intact.
- Both open gates are engine behaviours, not artefacts of the harness.

The two gates were understated, though. Through the custody the ADR recommends, RESTART does more than drop a row: the review that carries the report is refused. AUTHORITY_EXPIRY also removes the clinical answer to a warning sign and refuses new plans. That second point contradicts a general statement in APP_DATA_CONTRACTS.

**Conditions** (owner: Chief, the author; these are document corrections only and need no engine change):

1. **QRE-AIF-01** and **QRE-AIF-02** are written into L-APP-06, L-APP-08 and ADR §8 before the Founder decides on them.
2. QRE-AIF-01 goes to Founder + SSCTR as an engine question.
3. The MINOR findings are corrected in the documents or carried as known limitations.

## Commands run and results

| # | Command (from the worktree root) | Result |
|---|---|---|
| C1 | `git diff --stat c39d18a e4a2b80` and `git diff --name-only … \| grep -v '^audits/v1-app-integration-foundation-2026-11-16/'` | 18 files, all under the candidate folder; **0 outside** |
| C2 | `node CoachingCore/scripts/v1str-freeze.mjs --check 1` | **exit 0**: V1STR-1 121 added + 1 amended match; V1-FREEZE-1 196/196, V1RC 30/30, RUN-FORMAT-2 98/98, RACE-FORECAST-1 163/163 preserved |
| C3 | `node audits/v1-app-integration-foundation-2026-11-16/harness/journey.mjs` | **30/30, exit 0**; RESTART reproduced=true, AUTHORITY_EXPIRY reproduced=true. The rerun rewrote the tracked `results/journey.json`, and only the timing fields changed. I restored it with `git restore` (QRE-AIF-12) |
| C4 | `node audits/v1-app-integration-foundation-2026-11-16/harness/portable/proof.mjs` | **exit 0**: identical=true, jitless identical=true; 20 assets (833,281 B); calls readFileSync 32, existsSync 20, sha256 3,187; misses 0; unsupported 0. `results/portable.json` came out byte-identical, with no diff |
| C5 | Portable controls (scratch preloads, child `proof.mjs --child`) | **no hook registered** (host global present): identical=true, calls 0, misses 0, unsupported 0, so the proof's pass predicate would also hold (QRE-AIF-04). **Wrong host sha256** and **one asset dropped** (SSCTR_RECHECK_B0): onboarding is no longer PROPOSED and the child crashes. The shims really are on the engine path |
| C6 | `node --expose-gc …/harness/perf.mjs --child long` (default mode, raw data) | 64 evaluates, 19 UNSUPPORTED (first at index 47 of 67), 45 kept. Nearest-rank median 143.6, p95 219.3, max 221.5 ms; the recorded figures are 144.7 / 216.7 / 218.7. Restart ops: 87.2 ms (real) and **14.0 ms (the refused UNSUPPORTED restart)**. Plans `2026-11-16`, `2027-03-15`; at most 95 rows |
| C7 | Scratch `qre_expiry.mjs` (journey plan; a plan covering the dates; onboarding after expiry) | Same envelope: 2027-04-29 **HOLD**, 04-30 **HOLD**, 05-01 **UNSUPPORTED**, 05-03 UNSUPPORTED; **2027-04-30T21:30-03:00 UNSUPPORTED** (cutoff on the UTC day). Covering plan (start 2027-04-19): week 0 KEEP, week 1 (05-02) UNSUPPORTED; **warning sign 2027-05-04 UNSUPPORTED**, warning sign 2027-04-28 CLINICAL_HUMAN_REQUIRED; generateProgram dated 2027-05-03 UNSUPPORTED |
| C8 | Scratch `qre_restart_custody.mjs` (V1CIB custody with `v1-strength-index` injected, server ids, custody's own `restart`) | Enroll PROPOSED; week 0 KEEP (6 rows); restart PROPOSED (new start 2026-12-07); first report of new `w0-run-d1` (2026-12-08): **ok:false ENGINE_CONTRACT_VIOLATION, "The decision did not keep the stored record (a stored row changed); nothing was kept"**; rows 6 → 6 |
| C9 | Scratch instrumented copy of `journey.mjs` (imports made absolute, output to a new mkdtemp dir) | 30/30. Duplicate in step 12: the live row is **not** conflicted and has one input hash, so it is a genuine exact replay. Actions adopted: KEEP, INSTANTIATE_LOGGED_LOADS, READINESS_RESTART; none offered or rearranging. Forecast at step 10 SHOWN with `PLAN_SCENARIO` |
| C10 | Scratch `qre_perf_actions.mjs` (the perf long loop, two plans) | Decisions: KEEP/KEEP 28, KEEP/INSTANTIATE_LOGGED_LOADS 4, MODIFY/GATED_NEXT_STEP 13, UNSUPPORTED 19; 17 proposals adopted, **0** of them in `OFFERED_ACTIONS`, 0 rearranging. **Plan 2: 0 rows of its own; 31 rows conflicted** out of 95 |
| C11 | Scratch `qre_runsessions.mjs` | After onboarding, `runSessions` holds 12 of 48 run sessions; every detail is TIME. After the week-0 review: 40 TIME + 8 NATIVE. During a hold: 48 HELD, nothing executable |

The scratch scripts are in my session scratchpad and are not part of the repository. Each scratch output directory was a new `mkdtemp` directory, and nothing was deleted. No file outside this report was left changed.

## What was confirmed

**Real engine, no decision of its own (item 1)**
- `lib.mjs` calls `S.generateProgram`, `S.evaluateProgram` and `S.restartProgram` from `v1-strength-index.mjs` with no options.
- No dose, selection, progression, interference, triage, calibration, forecast, insight or exposure rule is restated. The projections reshape engine fields, and the plan view reuses V1CIB `planView`.
- The record is carried the way custody carries it, including `updatedModel` returned as `athleteModel` and `referenceState` cleared on restart.
- `restartProgram` returns the record unchanged (`r6-index.mjs`), so keeping the input ledger after a restart is correct.

**Journey (item 2)**
- 30/30, and deterministic: only the timings changed on rerun.
- The cold restore runs in a real child process and compares digests of the answer and the envelope.
- The corrupt envelope is refused, and so is the envelope of another engine.
- The late correction keeps the original as superseded, with one live row.
- Hold and release run through CLINICAL_HUMAN_REQUIRED, then READINESS_DECLARATION, then RETURNING.

**RESTART (item 3).** This is engine behaviour.
- `normalizeObservations` keys every report by `identity = 'session:'+sessionId`, with no plan or date scope (`r6-provenance.mjs:113`).
- A report of the new plan's `w0-run-d1` meets the old plan's row of the same identity in `byIdentity`. It is quarantined if the physical facts differ, which flags the old row `conflicted`. By reading the code, it is merged into the old row if they agree (`r6-provenance.mjs:138-150`). Either way it gets no row of its own.
- The same thing happens through custody, which assigns server event ids and runs its own `restart` (C8).

**AUTHORITY_EXPIRY (item 4).** Confirmed as the cause.
- `repertoireAuthority` skips a record when `asOf > review_by`, and all 13 R7-B0 records have `review_by: 2027-04-30`.
- Without the CORE_RECORDS the repertoire is invalid, and every review is UNSUPPORTED (C7, on the same plan on both sides of the date).
- Leaving the 19 UNSUPPORTED reviews out of the evaluate latency is correct. They are fail-closed answers, not decisions, and they are not trivially fast: about 75 ms each. The exclusion is disclosed in `perf.json` `history.excludedFromLatency` and in PERFORMANCE_FOUNDATION §4.

**Portable host (item 5).**
- The hook matches `/CoachingCore/src/` in the Windows file URLs.
- The recorded run has 32 reads and 3,187 sha256 calls through the shims, in both modes.
- The engine's entry graph imports only `node:fs` and `node:crypto`. `ajv` and `node:path` are imported only by modules that cannot be reached from the entry (36 modules).

**Performance (item 6).**
- `q()` is a correct nearest-rank quantile. The raw rerun agrees with `perf.json` within run-to-run noise.
- Every document says the numbers are lab numbers and not iPhone numbers, and that P0 on device is required. PERFORMANCE_FOUNDATION §5 and §6 say "não medido ≠ aprovado".

**Freeze (item 7).** Confirmed (C1, C2).

## Findings

### QRE-AIF-01: MAJOR (escalate: Founder + SSCTR). After the enabling records expire, a warning sign no longer gets the clinical answer, and no new plan can be made.

**Evidence (C7):**
- The plan covers the dates, so plan end is ruled out as a cause.
- `NOT_FEELING_100` with a warning sign returns CLINICAL_HUMAN_REQUIRED on 2027-04-28 and **UNSUPPORTED** on 2027-05-04. The strength entry point's clinical-first path runs only for `plan==='MISMATCH'` (`v1-strength-index.mjs:89`). Here the plan is `UNDER` and the repertoire is invalid, so the clinical answer never comes first.
- `generateProgram` and `restartProgram` are refused after the date too. `perf.json` itself records the second restart as refused (`history.restartRefused`).
- The cutoff is the **UTC** day (`utcDayOf`): 2027-04-30 21:30 at -03:00 is already expired.

**What the candidate says:**
- ADR §8 and L-APP-08 say only "toda revisão responde UNSUPPORTED".
- APP_DATA_CONTRACTS §2 says, without conditions, "Um sinal de alerta dá `CLINICAL_HUMAN_REQUIRED`".
- §5 says "uma resposta clínica, que sempre passa".

Read generally, these are contradicted by execution after the expiry date. They describe a safety-relevant answer that an app "unavailable" state could hide.

**Smallest correction:**
- State all three consequences in L-APP-08 and ADR §8: the clinical answer is lost, onboarding and restart are refused, and the cutoff is the UTC day.
- Qualify the §2 and §5 statements to "before the records' review_by".
- Route to Founder + SSCTR whether a clinical screen must survive the authority expiry. That would be an engine change, so it belongs to a successor freeze. It is not this mission's work.

### QRE-AIF-02: MAJOR. Through the recommended custody, the RESTART gate refuses the athlete's report entirely, and it quarantines the earlier plan's history.

**Evidence:**
- C8: the first report of the new plan through V1CIB custody gets `ENGINE_CONTRACT_VIOLATION` ("a stored row changed; nothing was kept"). The engine flags the old row `conflicted`, and custody's `reconcile` refuses any change to a stored row.
- So after a restart, under custody, no review that carries a report for a reused session id can be kept.
- C10: in the harness's long history, plan 2 got **0** rows of its own, and **31** rows of plan 1 were marked conflicted, which quarantines them for gating and learning.

**What the candidate says.** L-APP-06 describes only what the harness sees: no row of its own, and one prior row conflicted. The ADR recommends custody in the app. The stated resolution ("identidade de sessão por plano … nenhum reinício com atleta real") still holds.

**Smallest correction:** add to L-APP-06:
- the custody outcome, ENGINE_CONTRACT_VIOLATION on every such review;
- the quarantine of the earlier plan's rows;
- the merge case, where a report that agrees physically is folded into the old plan's row (read from the code, not executed).

### QRE-AIF-03: MINOR. The journey's AUTHORITY_EXPIRY probe has no control.

**Evidence:** the probe reviews on 2027-05-03, about 12 weeks after the last week of the 12-week plan. `reproduced:true` on its own does not isolate expiry from the plan having ended. My paired control does isolate it (C7: HOLD on 04-30, UNSUPPORTED on 05-01, same envelope).

**Smallest correction:** add the paired probe (`review_by` and `review_by`+1 day on the same envelope), plus a probe on a plan that covers the date.

### QRE-AIF-04: MINOR. The portable proof's pass predicate can pass vacuously.

**Evidence (C5):** with no hook registered, the child reports identical answers, 0 misses, 0 unsupported and 0 calls. `proof.mjs` exits 0 on `identical && !misses && !unsupported`, so it would pass even though the shims were never used.

The recorded result does show real use (32 reads, 3,187 hashes, in both modes), and the positive controls confirm the shims are on the path. The claim holds today, but the script does not protect itself.

**Smallest correction:** also require `calls.readFileSync>0 && calls.sha256>0` in both host runs, or a sentinel export that only the shim provides.

### QRE-AIF-05: MINOR. Some journey checks are weaker than their labels.

- **Step 12 (dedup):** "one live row" would also hold if the engine had quarantined the re-send as `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, which flags the row and keeps it. The actual run is a genuine exact replay (C9), but the check does not assert `conflicted!==true`, rows before = rows after, or the duplicate's reason.
- **Step 13:** "forecast unavailable with a reason" accepts `reason ?? status`, so a status alone passes. The observed reason was `HOLD`.
- **Step 4:** "the week lists every session" is tautological, because `weekView` maps the program's own sessions.
- **Step 15:** the label says the extension records are "recomputed from nothing at each review", but no custody review is executed. The check only reads the document keys and `CLIENT_REVIEW_FIELDS`. That is enough to confirm the gap, not that behaviour.
- **Step 11:** the envelope digest replaces `decisions` with its length. That weakens the comparison and is not needed.

**Smallest correction:** tighten these assertions and rename the step 15 label to what the check verifies.

### QRE-AIF-06: MINOR. `perf.json` `restartMs` mixes in a refused restart, and other statistics need labels.

**Evidence (C6):**
- `restartMs` has n=2: one real restart (87 ms with JIT, 122 ms jitless) and the refused UNSUPPORTED restart (12 to 14 ms). Its "median" is therefore a fail-closed latency. That is inconsistent with the exclusion rule applied to evaluate, and it is not disclosed. The documents do not quote it.
- With n=5 (cold start) and n=15 (warm), the nearest-rank p95 equals the max.
- The "60 a 150 linhas" bucket includes the plan-2 reviews whose reports were all quarantined (QRE-AIF-02), so it is not a real second plan.

**Smallest correction:**
- Measure the restart with its status and leave out the refused one.
- Mark p95 as equal to the max when n<20.
- Note the plan-2 composition of that bucket.

### QRE-AIF-07: MINOR. Some document numbers differ from the results they cite.

**PERFORMANCE_FOUNDATION §4**
- jitless import p95 and max are given as "80". `perf.json` has 81.6.
- Serialization max "6" appears nowhere in `perf.json`. The maximum is 4.1.
- "Envelope 1,17 MB ao fim de um plano de 16 semanas (95 linhas)". At the end of plan 1 (95 rows) it is 1.10 MB. 1.17 MB is after the quarantined weeks of plan 2. APP_DATA_CONTRACTS §3 has this right at 1.1 MB.

**APP_DATA_CONTRACTS §4 view sizes, against `journey.json` `steps.views`**
- SESSION (strength) is given as 1.0 KB; it measured **3.3 KB**.
- SESSION (run) is given as 1.2 KB; it measured 1.45 KB.
- INSIGHTS is given as 1.9 KB; it measured 2.4 KB.
- The "projeções de 0,5 a 2 KB" in PERFORMANCE_FOUNDATION §1.4 and the ADR §4 diagram are exceeded by the strength detail.

**Hash counts.** "Cerca de 800 SHA-256 sobre cerca de 3,4 MB" per review (ADR §2, PERFORMANCE_FOUNDATION §4) cannot be derived from the cited `surface.json` and `portable.json`. Averaged over the proof journey's four reviews, they give about 714 calls and about 2.7 M characters per review.

**Check count.** APP_DATA_CONTRACTS line 11 says "29 verificações". There are 30.

**Smallest correction:** take every figure from the result files, or cite the run that produced it.

### QRE-AIF-08: MINOR. The jitless penalty is explained by a cause nobody measured.

**Evidence:**
- ADR §2 says "Cerca de 1,4×, porque o custo está em builtins nativos (JSON, hash)". No profile was run.
- V8 `--jitless` keeps V8's native C++ builtins and Node's native OpenSSL SHA-256. Neither says anything about JavaScriptCore's interpreter.
- The cost of about 700 host sha256 calls per review crossing a Swift bridge is not measured.

Everything else here is honest: the lab numbers are labelled, jitless is called a proxy in `perf.json` and PERFORMANCE_FOUNDATION §4, and P0 is required.

**Smallest correction:** present the cause as a hypothesis for P0 to test, and add the per-call bridge cost to the P0 measurements.

### QRE-AIF-09: MINOR. The harness adopts proposals in ways custody does not, and one record is not carried (latent).

**Evidence:**
- `lib.keep` adopts every `r.proposal`. Custody instead:
  - re-decides MOVE and LEARNED_REARRANGEMENT with `withhold` and keeps them as offers;
  - makes CONFIRMATION_KINDS changes and rearrangements wait for the athlete;
  - suppresses proposals while a hold stands (`custody.mjs:185-213`).
- None of these cases occurred in the journey or in the long history (C9, C10: 0 offered and 0 rearranging among 17 adoptions), so no evidence is affected.
- APP_DATA_CONTRACTS §3 says "uma proposta aplicada pelo motor substitui o anterior" without that qualification, although the §2 row on schedule changes does mention confirmation.
- `paceRevisionRecord` is returned by every answer (`v1-run-forecast-index.mjs:406`) and carried by the conforming test client (`v1str-helpers.mjs:58-59`), but it is not in `CARRIED` or in the envelope. That is harmless while V1X-PACE-REVISION is INERT.

**Smallest correction:**
- Qualify §3 by custody's adoption rules.
- List `paceRevisionRecord` in the envelope, or state why it is left out.

### QRE-AIF-10: NOTE. Projection semantics to settle before screens.

- `todayView.week.planned` and `.minutes` are aggregates computed by the client. They count any non-REST status (for example SKIPPED), so they can disagree with the engine's own notion of what is planned.
- `sessionDetail` labels a run session outside `runSessions` as `expression:'TIME'` with the engine prescription. After onboarding that is 36 of 48 sessions (C11). The view cannot tell "not yet formatted" from "the time version was delivered".
- The comment at `lib.mjs:51` says "an inactive layer keeps the last delivered detail", but `keep` replaces `presentation` wholesale.

None of these restates a training rule.

### QRE-AIF-11: NOTE. The ADR cites an artefact that is not in the candidate.

- ADR line 6 points to "o relatório de prontidão §8", which is `INTEGRATION_READINESS_REPORT.md`. That file is untracked and not in `e4a2b80`, so this review does not cover it.
- `results/work/` is untracked too, and the current harness does not produce it: `journey.mjs` writes to `os.tmpdir()`.

### QRE-AIF-12: NOTE. Rerunning the harness changes tracked files.

`journey.mjs`, `perf.mjs` and `proof.mjs` write into the tracked `results/`. A rerun of the journey changed only the timings, which shows good reproducibility of content, but it leaves the tree dirty. Write the timings to a separate file or to a temp directory, and keep the deterministic content in the tracked result.

## Escalation

QRE-AIF-01 meets the task's escalation trigger: execution contradicts a statement in the candidate. It goes to the Chief for Founder + SSCTR as an engine question.

The harness was not found to duplicate or alter any sporting decision. The adoption difference in QRE-AIF-09 is an agency rule, it is latent, and nothing in the evidence exercised it.
