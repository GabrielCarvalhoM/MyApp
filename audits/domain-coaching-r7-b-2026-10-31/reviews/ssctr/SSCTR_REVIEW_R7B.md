# R7-B — SSCTR review of the runtime binding (R7B-SSCTR-r1)

Independent Sports Science & Concurrent Training Reviewer (SSCTR-1.0.0, SSCTR-CONST-1.0.0, SSCTR-EP-1.0.0), 2026-10-31. The instance's system prompt is the project adapter body (`.claude/agents/sports-science-concurrent-training-reviewer.md`, SHA-256 `021b5951…6c52d`). The model is inherited (claude-opus-5-5). This instance did not author the runtime, its tests, the conformance matrix or the declarations.

Authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY only. This review is not human, empirical or clinical validation, and it does not re-approve the R6 or B0 envelopes: it checks whether the frozen runtime stays inside them. Structured records are in [SSCTR_REVIEW_R7B.json](SSCTR_REVIEW_R7B.json).

## Bytes judged

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-1, commit `4995d58`, record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json` (file SHA-256 `782f2a66…07b3ec`) |
| Source digest | `791b531100c190f6b0ed73e892f6e212d7eee5406d144fce4a188170900a2c4f` |
| Manifest digest | `b1a1faf0a7064da99db8a33a0f04852ae3cc3a06177bcb3e4edba7cfdf222f73` |
| Policy / catalog / r2 records | R6-POLICY-5 `18ec48f3…`, R7B0-CATALOG-2 `ceee276a…`, SSCTR_RECHECK_B0.json `6867d3e8…` |

Verification, run from `CoachingCore/`:
- Before the probes: `node scripts/verify-r7b.mjs` returned 18/18 PASS.
- After the probes: `--tests` returned 19/19 PASS (714 tests), and the plain run again returned 18/18 PASS.
- `node scripts/conformance-r7b.mjs` (without `--write`) returned PASS (301 entries).

No repository file outside this folder was modified. `mutate-r7b.mjs`, `--write` and `npm` were not run.

**Literature access.** Confirmed: Europe PMC REST records and open-access full-text XML, fetched through WebFetch.
- Read in full: Run Clever 2018 and Kinoshita 2023.
- First 100,000 characters only: Frandsen 2025, Zheng 2022, de Carvalho e Silva 2022, Wang 2023 and ACSM 2026.
- Abstract only: Videbæk 2015.

**Validation.** No Python interpreter is installed, so the project validator could not run. `probes/validate-records.mjs` is a Node port of its checks. It uses the ajv already present in `CoachingCore/node_modules`, and it passes on the 7 records. A sanity test showed it rejects deliberately broken records. The queue check was not run, because queue entries are only proposed here.

## Decisions

| Record | Disposition | Evidence | Confidence |
|---|---|---|---|
| R7B-SSCTR-FIDELITY (catalog and r2 conditions on the runtime) | REVISE | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-NOVICE (walk/jog, graduation, strides, novice density, ladders) | REVISE | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-HYBRID (CMP.I11, CMP.P04 content stage, protected stimuli) | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-TAPER (10K, half marathon, combined strength taper) | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-RETURN (E1, graduation and familiar-bouts interplay; AE questions answered) | REVISE | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-DOSE (dose boundaries) | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | MODERATE |
| R7B-SSCTR-DECLARED (R7B-DECL-01 … 12) | REVISE | SUPPORTED_WITH_LIMITS | MODERATE |

What holds:
- **Dose sweep** (195 programs, plus 30 timelines reviewed for 6 weeks): no breach was found. Strength sets, establishment, conventions, skill, taper and race-week strength, quality gates and the single-run ceiling all stayed within bounds.
- **Text:** no forbidden claim appears in program text.
- **Composition and progression:** ladders, rotation deferral, novice-density release points, CMP.P04 leads and roles, moderate and short returns, and E1 all follow their records.

Two reachable paths prescribe outside their envelope (F1, F2). They are narrow and runtime-only.

## Findings (reproductions in `probes/`, frozen bytes)

| Id | Severity | Finding and reproduction |
|---|---|---|
| R7B-SSCTR-F1 | MAJOR, blocking | **A graduated athlete regains quality in the first EASY week after a restart.**<br>`p12-return-interplay.mjs`: a NOVICE athlete running 80 min on 3 days graduates at the week-3 review. A 30-day nonclinical TRAVEL break follows; the return is reviewed in week 10 and the athlete restarts.<br>Week 13 is the first EASY week (`easyWeeksDone` 0, `qualityNeeds` 0). It holds THRESHOLD 3×5 with EASY 35 and LONG 39.<br>The EASY_CURRENT comparator, under the same timeline, gets no quality until week 15, after two established easy weeks.<br>Cause: `r6-program.mjs` line 305 sets `qualityNeeds=0`, and the restart switch (line 255) resets `easyWeeksDone`. This breaches B0-C01 c1 and R6-RUN-QUALITY C5. Moderate returns are equal for both paths. |
| R7B-SSCTR-F2 | MODERATE, blocking | **Familiar repeated bouts are prescribed at the full dose after more than 28 days without the task**, which is outside B0-C02 c1 and c5.<br>`p13` B (10K): the bouts resume in NEXT_BLOCK week 13 at 4×3, 49 days after the last bouts session, while NEXT_BLOCK lowers every other dose. `p14` C (half marathon): 56 days.<br>`p14` A: a task observed 15 or 27 days before the intake is first prescribed 33 or 43 days after its last performance, because DECL-05 defers the first session.<br>Currency is read only at intake (`r6-intake.mjs` line 35). |
| R7B-SSCTR-F3 | MINOR | **Strides.**<br>(a) In the introduction week the strides step from 4 to 5 repetitions (`p11` A), against B0-C01 c5.<br>(b) The race-day warm-up strides instruction (`r6-prescription.mjs` line 61) is not marked optional for EASY_LOW or NOVICE athletes (`p41`), against c8. Easy, taper and shakeout strides are optional (299 sites checked). |
| R7B-SSCTR-F4 | MINOR | **The CMP.P04 content stage ignores the week wrap.**<br>`p20` B2: in RUN-led SPECIFIC weeks 7–9, a day-6 PM session keeps `bulgarian-split-squat-db` ×2, 13 h before the next week's day-0 long run. With a same-week long run, the same row is reduced (A2).<br>The CMP.I11 ranking does see the wrap (`p20` C), but `nearProtected` (`r6-program.mjs` line 983) reads only the same week. This bears on B0-C11 c3 and c4. |
| R7B-SSCTR-F5 | MINOR | **The bouts fallback is not disclosed as a different stimulus** (B0-C02 c3).<br>`p13` C: after two adverse bouts, week 4 becomes THRESHOLD step 0 (a correct calibration) with no disclosure.<br>`p14` B: a 4-day break lapses the bouts, also with no disclosure. |
| R7B-SSCTR-F6 | MINOR (Product/Data, G03) | **The observation contract cannot say that the easy alternative was run.**<br>`p11` C: 31 easy minutes on the 34-min introduction day count as the calibration. QUALITY is gated ADVANCE, `qualityDone` goes from 0 to 1 and `achieved.quality` is set, because completeness is "at least 90% of the planned minutes" (`r6-adaptation.mjs` line 124).<br>The default 20-min alternative is gated PARTIAL and HOLD (`p10` C). |
| R7B-SSCTR-F7 | MINOR | **The calf alternation is chosen before the time fit.**<br>`p42`: 570 of 10,526 weeks with calf work end with a single bent-knee exposure (4 strength days, 25–45 min sessions). This is against B0-C05 c2.<br>Selection is in `r7b-repertoire.mjs` lines 249–252; the fit is in `r6-program.mjs` line 977. |

Observations (not findings):
- **R18 reading.** Graduation counts a week that had no gating review of its own, but only when its complete reported evidence is judged by the weekly rule at the next review (`p10` D). This is accepted with a condition.
- **Ceiling units.** The single-run ceiling is measured in minutes, and the introduction session is 13% above the longest recent run. Frandsen 2025 links spikes of more than 10% in *distance* to overuse injury. This is a policy re-review trigger.
- **Bouts in consolidation weeks** are held at the full dose, as c3 says.
- **Novice release** can fall in the first SPECIFIC week, which is equal to the R6 three-day dose. It never falls in the taper.
- **Projection artifact.** The projection credits the eased first quality slot after a short break. Actual reviews correct it; the behaviour is inherited.
- **Implement steps.** These are not collected (B0-F07); the owner is Product/Data.

## Declared items

- **Accepted:** DECL-02, 06, 07, 09, 11 and 12.
- **Accepted with conditions or limitations:**
  - DECL-01: hold the strides in the introduction week (F3 a). The R6 EASY_CURRENT comparator stepped an easy run in its first quality week, so this path is the stricter one.
  - DECL-03: the observation contract must record which session was run (F6).
  - DECL-05: currency at the prescription date (F2) and disclosure of the fallback (F5).
  - DECL-08: extend the content stage across the week wrap (F4).
  - DECL-10: limitation recorded for REPS_THEN_LOAD goals.
- **Revise:** DECL-04 (F1).

## Conditions

1. Fix F1 and F2 on a new freeze, then confirm them in the single narrow SSCTR recheck. They are new, narrow and runtime-only. The reproductions are `p12`, `p13` B, and `p14` A and C.
2. Fix F3, F4, F5 and F7 in the same pass, or carry each as a recorded deviation with an owner and a due mission.
3. Route F6 to Product/Data and Engineering. The observation contract must record which session was executed before any use beyond the offline reference.
4. Enforce R18 (every elapsed week receives its gating review) before any use beyond the offline reference.
5. Keep R6-POLICY-5, the catalog and the r2 records unchanged. R7-B adds no dose.
6. Treat ceiling units (time versus distance, Frandsen 2025) as a re-review trigger for the next policy revision.

## Human revalidation queue

These items are proposed and append-only. The queue was not edited by this reviewer. Each targets `RUNTIME_FREEZE_R7B.json` (`782f2a66…`) and carries the record's conditions verbatim. State: QUEUED_FOR_FUNDED_HUMAN_REVALIDATION; funding NOT_DECLARED.

- HQ-R7B-SSCTR-HYBRID: CMP.I11 and CMP.P04 on the runtime, 3 conditions.
- HQ-R7B-SSCTR-TAPER: 10K and half-marathon taper with the combined strength taper, 3 conditions.
- HQ-R7B-SSCTR-DOSE: dose boundaries, 4 conditions.

The four REVISE records are not approvals and are not queued. Future qualified humans may maintain, modify or revoke any of these decisions without an AI veto.

## Files

- Records: `SSCTR_REVIEW_R7B.json` and this file.
- Probes in `probes/`:
  - `p00`–`p02`: record and envelope readers.
  - `p10`–`p16`: graduation, returns and bouts.
  - `p20`: hybrid.
  - `p31`–`p32`: novice density and ladders.
  - `p40`–`p43` (with `p42b`): dose sweep, strides, calf, claims.
- Tools in `probes/`:
  - `build-records.mjs` writes only the JSON records.
  - `validate-records.mjs` is read-only.

R7B_SSCTR_GATE = BLOCK
