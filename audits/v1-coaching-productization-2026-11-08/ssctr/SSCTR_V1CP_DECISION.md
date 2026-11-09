# SSCTR decision on the V1CP design (SSCTR-V1CP-DECISION-r1, 2026-11-08)

The machine-readable record is `SSCTR_V1CP_DECISION.json`, beside this file. Where the two differ, the JSON prevails.

**Reviewer:** a fresh SSCTR-1.0.0 instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only). It holds no credentials and claims no human, clinical or empirical validation.

**Inputs:**
- DESIGN_V1CP.md, sha256 `7ac633c4…2b41`, as dispatched.
- PCG-V1CP-F08 r2 with DR-148.
- FREEZE-6 behaviour: HEAD `4584a77`, whose source, policy and catalog bytes equal `d569ef2`.

**Not reviewed:** the implementation committed or written ahead of this decision. It must be reconciled with this record in the later SSCTR review of the candidate.

**F08 items (Q05–Q07)** are valid only if DR-148 / PCG-V1CP-F08 r2 passes its re-check and the Chief consolidates it as written. F08 stays F08_OPEN until then.

## Dispositions

| # | Item (design rows) | Disposition | Evidence | Conf. | What is decided |
|---|---|---|---|---|---|
| Q01 | A1 screen (a)–(c) | MODIFY | SUPPORTED_WITH_LIMITS | MOD | Approved as designed, plus five changes. (1) The confirmation names pregnancy and recent childbirth. (2) First-person plural ("we", "nós", "nosotros") counts as first person. (3) Idiom exceptions never apply in a clause with a damage verb or a clinical word; "my/the/lower back" stays a body word. (4) A structured "no" never resolves a conditioned denial. (5) R-F08-1 holds across screen versions. |
| Q02 | A3 | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | MOD | **Option A**, per sport. If a sport has no live session on any day between two breaks, its stop runs through the earlier break and takes its own class. It only ever lengthens a stop. Symmetric for running. |
| Q03 | E1 | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | LOW | Months in the **current continuous period**, per sport: 0 NONE, 1–5 NOVICE, 6–23 INTERMEDIATE, ≥24 EXPERIENCED (label only). An explicit category wins. Never capacity. |
| Q04 | E2 | MODIFY | SUPPORTED_WITH_LIMITS | MOD | Narrowed. A race counts as a completed run *session* (≤ 28 days, tolerated). It is used only as the intake longest-run reference, for the week-1 long-run cap and the ceiling. Never the walk/jog test, class, pace or volume. |
| Q05 | F08 S1 intents | MODIFY | SUPPORTED_WITH_LIMITS | MOD | REDUCE_LIGHT now **reduces difficulty** (rung R3). Illness types get R2/R1/R0 only. Scope follows the athlete's per-sport statement. There is a stricter warning-sign list, plus window-end, no-chaining and race-in-window rules. |
| Q06 | F08 return speeds | MODIFY | SUPPORTED_WITH_LIMITS | MOD | Speeds are rung climbs on executed weeks. No jump from rest or a substantial reduction straight to the old doses. A window of ≤ 14 days is never read as LONG. Strength rises at most one set per week. |
| Q07 | F08 S2 restart | MODIFY | SUPPORTED_WITH_LIMITS | MOD | The restart class is counted per sport to that sport's declaration date, with **MODERATE as the floor**. Options: BALANCED or CONSERVATIVE; no FASTER. Restrictions are hard caps. Running with AVOID_LOWER needs an explicit answer. An adverse response is asked, never only held. |
| Q08 | F08 S3 new plan | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | MOD | Existing cold start and RESTART. Exposure is bounded by the record. It never starts above the in-program return (or the S6 restart) for the same pause. |
| Q09 | P1–P5 | MODIFY | SUPPORTED_WITH_LIMITS (P5: INSUFFICIENT) | MOD | P1 approved. P2 and P4 approved with conditions. **P3 rejected as a profile lever** and moved to D1 LOWER. **P5 rejected.** |
| Q10 | V1–V4 | MODIFY | SUPPORTED_WITH_LIMITS | MOD | V1, V2 and V3 approved with conditions. **V4 rejected**; it is replaced by V4': under LOWER, easy-run durations take no step. |
| Q11 | D1–D3 | MODIFY | SUPPORTED_WITH_LIMITS | MOD | D1 LOWER takes the step tolerance 0. D1 HIGHER is approved but narrowed. D2 HIGHER keeps strides optional and ungated. D3 approved. |
| Q12 | Rules 1–6 | MODIFY | SUPPORTED_WITH_LIMITS | MOD | Rule 4 is rewritten; the DESIGN wording contradicted D2 and D3. Rule 6 gains no retroactive credit and "returns prevail". Defaults are byte-identical. |

## Situation 1 rungs (exact operations; Q05, Q06)

| Rung | Running | Strength |
|---|---|---|
| R0 REST | none | none |
| R1 LIGHT_ACTIVITY_ONLY | optional 20-min walk | rest |
| R2 REDUCE_SUBSTANTIAL | quality and long become easy runs at the week's easy duration; no strides | 1 set, ≥ 4 RIR, load by effort, never above the current load |
| R3 REDUCE_LIGHT | no hard work: quality becomes easy, no strides; long run at its consolidation length | consolidation sets (−1), every set ≥ 4 RIR, load by effort, never above the current load; no step |
| R4 HELD | pre-window doses, no step; first quality slot easy | pre-window doses, no step |

**Return speeds:**

| Window | FASTER | BALANCED (default) | CONSERVATIVE |
|---|---|---|---|
| REDUCE_LIGHT | R4 | R3 → R4 | R3 → R4 → R4 |
| REDUCE_SUBSTANTIAL | R3 → R4 | R2 → R3 → R4 | R2 → R3 → R4 → R4 |
| REST/LIGHT ≤ 10 days | R3 → R4 | R2 → R3 → R4 | MODERATE recipe |
| REST/LIGHT 11–14 days | MODERATE recipe | MODERATE, first step held one more week | MODERATE, each step held one more week |

**How a rung advances:**
- Each rung is one whole executed plan week with no adverse response and every warning sign answered no.
- Otherwise the rung repeats. A sign answered yes routes to S3.

**FP-4 (Founder question).** The only one-step return to the held dose is FASTER after a REDUCE_LIGHT window, once the window's weeks were executed. If "gradual" is read more strictly, that row becomes R3 → R4.

## New parameters approved

- **E1 bands** (both sports): 0 / 1–5 / 6–23 / ≥24 months.
  - Strength basis: ACSM 2009 (abstract) and ACSM 2026 (full text).
  - Running basis: Videbæk 2015 (full text).
- **D1 HIGHER:**
  - HYPERTROPHY accessory loaded rows: prescribed RIR 2, progression "while ≥ 1 in reserve".
  - GENERAL accessory rows: "while ≥ 2 in reserve".
  - Only for INTERMEDIATE or EXPERIENCED lifters, in development phases. Athletes with a run goal get it on upper-body rows only.
  - Basis: ACSM 2026 and Refalo 2023 (full text), Robinson 2024 (abstract).
- **D1 LOWER:** step tolerance 0. The regression bound is unchanged.
- **F08:**
  - the R3 combination;
  - which intents each condition may choose;
  - the chaining and persistence rule;
  - the rung sequences and hold units;
  - the MODERATE floor after a clinical hold;
  - the running item with AVOID_LOWER;
  - the warning-sign items W1–W15 and X1–X4 and the improvement question. These are flagged FUTURE_G04_REVALIDATION and need Security's confirmation.
  - Basis: IOC 2022 consensus (full-text postprint).
- **Lexicon only, no numbers:** the A1 additions.

## Conditions the implementation must meet (summary; all of them are in the JSON)

1. **Defaults:** BALANCED / STANDARD / STANDARD with no new key reproduce FREEZE-6 outputs byte for byte. Check with the R7-D suite and a differential on both spent holdouts. Never re-evaluate the holdouts, and never write under `final/` or `final2/`.
2. **Envelope:** every choice sits under the same envelope (Q12 rule 2): clinical first, R-F08-1, gates, caps, return recipes, phase doses, establishment.
3. **No retroactive credit:**
   - a choice made during a window, ladder, S6 restart or return is recorded, and that path's rules prevail;
   - D1 HIGHER waits until the return completes.
4. **Strength sets** come back at most one set per executed week, on every path.
5. **Situation 1:**
   - the return starts only after the athlete answers that the condition has resolved or improved;
   - not improved means no new window and S3, except NEED_REST;
   - there is no re-window before the ladder completes;
   - a window that holds the race day asks about the race;
   - logs from the window never replace the held load.
6. **Warning signs:**
   - every sign is actively answered;
   - unknown is ASK;
   - any yes routes S3 for every sport;
   - they are re-asked weekly, at the window end and after any adverse response;
   - all answered no is never presented as "safe".
7. **A1:** asked once per report, append-only, never prefilled. Text alone never yields NONCLINICAL. Old CLINICAL reports stay clinical across screen versions.
8. **E2:** never feeds the below-minimum walk/jog test (the probe shows a value of 14 minutes flips an intermediate runner to walk/jog).
9. **Copy:** never "cleared" or "liberado". The return speeds are distinct from the coach profiles. LOWER volume discloses slower goal progress. DEMANDING is described as the same limits with acceptance-oriented advice.

## Not approved (PENDING)

- **P5** (faster easy-run cadence): INSUFFICIENT_EVIDENCE. DEMANDING therefore has no dose lever.
- **V4 as proposed** (an optional easy day): it is a new count, and it creates a hazard where an unset gate defaults to ADVANCE.
- **D1 HIGHER on lower-body accessory rows for athletes with a run goal:** ABSTAIN, insufficient evidence on interference.
- **Conditional on DR-148:**
  - all of Situation 1 and Situation 2 stay pending until it is consolidated;
  - if Security refuses the added warning-sign items, MILD_ILLNESS and MILD_INDISPOSITION are limited to R0 and R1.

## Escalations

| To | What |
|---|---|
| Founder | FP-4; whether to ship DEMANDING as advice only; V4' as the meaning of LOWER running volume |
| PCG | R-F08-1 across screen versions; MILD_INDISPOSITION as illness-type; the SSCTR-05/06 pointer to DR-148 (the Chief applies it) |
| Security / G07 | the new booleans; trainingMonths; the race "tolerated" answer; the chronic-condition risk-factor gap (IOC checklist question 2) |
| G04 (no owner) | all warning-sign content, persistence routing and urgency wording |
| Product/UX | wording of the questions, speeds and race prompt |
| Engineering / Chief | reconcile commits `4c3f6dc` and `54b25bb` and the uncommitted `v1-f08.mjs` with this record |

## Queue and process

- **Queue:** 12 proposals, HQ-V1CP-SSCTR-Q01 to -Q12. Nothing was appended; the queue stays at 235 items (file hash unchanged).
- **Literature:**
  - full text: PMC, Europe PMC and repository copies;
  - abstract only: ACSM 2009, Robinson 2024, Frandsen 2025 and Spiering 2021, used as context only;
  - publisher sites refused access.
- **Probes:** read-only, on FREEZE-6 bytes, in a new scratch directory.
- **Validation:** the skill validator was not run (Python is absent), and this twelve-item record does not fit `decision.schema.json`. JSON well-formedness was checked with Node.
- **Native agent dispatch:** not verifiable from inside the run.
