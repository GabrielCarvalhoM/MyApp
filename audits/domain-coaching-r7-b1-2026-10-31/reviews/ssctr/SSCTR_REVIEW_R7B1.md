# R7-B.1 — SSCTR review on R7B1-FREEZE-1 (R7B1-SSCTR-r1)

This is the one SSCTR review the Founder's request allows for R7-B.1 (request §14, §17).

- **Reviewer.** A fresh SSCTR instance, not the one that wrote R7B-SSCTR-r1/r2, and not an author of R7-B.1.
- **Versions.** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, evidence protocol SSCTR-EP-1.0.0.
- **Instance.** Its instructions match the body of the project adapter (`.claude/agents/sports-science-concurrent-training-reviewer.md`, `021b5951…6c52d`). The model (claude-opus-5-5) is inherited and there is no Agent tool. Registration as the native agent type cannot be verified from inside the instance.
- **Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY only. This is not human, empirical or clinical validation.
- **Records.** [SSCTR_REVIEW_R7B1.json](SSCTR_REVIEW_R7B1.json): revision R7B1-SSCTR-r1 of the seven R7-B records.

## Bytes judged

| | |
|---|---|
| Freeze | R7B1-FREEZE-1; record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json` (file `01c146f9…920f`); freeze commit `d41df8b`, bytes of `b82d758` |
| Source digest | `976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9` |
| Manifest digest | `2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b` |
| Predecessor | R7B-RUNTIME-REPERTOIRE-FREEZE-2 (`10b26d6`, source `d2c73014…`) |
| Unchanged | R6-POLICY-5 `18ec48f3…`, R7B0-CATALOG-2 `ceee276a…`, B0 r2 records `6867d3e8…` |

Read-only verification from `CoachingCore/` with `node scripts/verify-r7b1.mjs`:
- before the review: 23/23 PASS;
- once with `--tests`: 24/24 PASS (762 tests, 0 failed);
- after the review: 23/23 PASS, same source and manifest digests (`probes/out/verify-r7b1-after.json`).

No tracked file changed. I wrote only under `reviews/ssctr/`. I did not run the mutation or freeze scripts, any `--write`, or `npm run verify`.

## Method

- **Comparator.** A `git archive 10b26d6` extraction of FREEZE-2, kept outside the repository. Its 105 bound files match the FREEZE-2 record.
- **Probes.** Every probe ran on both trees, read-only, against synthetic athletes. Scripts are in [probes/](probes/); outputs are in `probes/out/R7B1/` and `probes/out/FREEZE-2/`.
  - The 20 R7-B r2 probes, copied with only their import root changed (`run-inherited.mjs`).
  - Seven new probes, `s01`–`s07`.
  - The author's adversarial probe, copied unchanged.
- **Blocking criterion** (the same as r1 and r2):
  - a finding blocks when the runtime prescribes outside *every* approved envelope (R6, B0, R7-A);
  - a deviation from a stricter rule whose prescription stays inside an approved envelope is recorded with an owner and does not block;
  - under the loop bound, only a narrow blocker created by R7-B.1's own correction can open a further cycle.

## Question 1 — QE-R7B-OBS-04: met

**Reproduction.**
- `r06`, unchanged: 0 of 20 on R7B1. On FREEZE-2 it gives 18 of 20, the r2 finding reproduced exactly.
- `s01`, a wider grid: 436 decisions (351 applied, 85 asked). I judged each event-phase strength day in the plan in force when its week starts: 2,233 days and 4,417 rows.
  - 0 never-performed rows. FREEZE-2 has 304, plus 184 decision-week projections that show the new substitute.
  - 0 returns of the set-aside exercise, 0 rows below the phase RIR minimum, and 0 sessions with more strength sets than a no-substitution counterfactual.
  - 428 slots left out and 9 stand-in rows.
  - All 241 first exposures after the post-event week are establishments (at most 2 sets, RIR at least 3).
- `s07`, intake-familiar: an exercise familiar at intake but never performed here appears on no event-phase day (4 cases; FREEZE-2 prescribed it on 1–2 days per case).
- The author's P1, re-run here: 2,131 checks, 0 failed.

The s01 grid is 6 athletes × 6 decision points × every exercise in use × both reasons.
- Athletes: 10K and half marathon; GENERAL, STRENGTH, HYPERTROPHY and RUNNING_SUPPORT goals; FIXED, COACH_DECIDES and EVERY_2_WEEKS rotation; bodyweight only; a strength-NONE novice on three days; intake-familiar exercises.
- Decision points: TAPER day 0 and day 3, RACE_WEEK, POST_EVENT, and the last SPECIFIC week with the substitute either executed or missed.

**Clinical first.** In all three event phases, pain or a clinical text routes CLINICAL_HUMAN_REQUIRED with no substitute. An unconfirmed preference or a missing reason is asked (s01, 12 checks).

**The four points the request asked me to decide:**

1. **The stand-in rule: accepted.** The stand-in must be:
   - an admissible alternative under B0-C06 c1 (same subpattern group, a shared primary muscle, within one demand step, in the slot role);
   - performed in this program and not set aside;
   - after a SKILL_MISMATCH, below the set-aside configuration and never above the substitute;
   - the most recently performed one first.

   This keeps movement intent (R6-SUBSTITUTION C5) and adds no demand. The protection of a prior bout belongs to the configuration actually performed: a non-damaging bout of the same task protected by 47–64% a week later, while a different task gave none (Maeo 2017). Choosing the most recent one favours the strongest remaining protection, which wanes over 9–12 weeks (Theodorou 2026).

   Doses (s03):
   - reverse-lunge (bodyweight), 1×12–14 at RIR 3, stood in for db-split-squat (counterfactual 1×8–12 at 20–22 kg);
   - one-arm-db-row, 2×6 at 24 kg, stood in for db-row (counterfactual 2×5 at 24 kg; its own last exposure was 2×6 at 24 kg nine days earlier).

   No stand-in is above its own last dose, the replaced row, or the counterfactual week.

   Limitation: a stand-in last performed many weeks earlier keeps only part of its protection. A loaded stand-in not performed for more than 28 days is re-established under its earlier load (R6-EVENT-TRANSITION C18); a bodyweight one keeps its repetition target at RIR 3 or more.

2. **"Performed in this program": accepted.** An intake report is self-reported. It gives no in-program bout and no executed dose state, and R7-A gives execution the factual authority. The cost is small: that exercise waits two or three weeks, or a performed stand-in takes the slot (s07).

3. **A substitute planned in the last SPECIFIC week: accepted, with conditions.** The decision's conditional projection shows the substitute in the taper, because projections assume planned exposures are executed. The plan in force when the taper starts comes from the weekly review of the SPECIFIC week, from the evidence (s04):
   - executed: the substitute stays at 1 set, RIR 3, from its log; it is no longer new, with one prior bout about a week earlier;
   - missed: the slot is left out, or a performed stand-in takes it.

   None of the 68 such decisions in s01, each run with the substitute executed and with it missed, put a never-performed row on an event day. Two conditions apply: R18 (the guarantee rests on that weekly review) and F12 (nothing tells the athlete).

4. **"Keep the exercise until after the event" as disclosure text: accepted.** Declining the proposal keeps a familiar exercise at the taper dose, with nothing new. All 166 disclosures carry the option. It schedules nothing: the athlete makes the change after the post-event week. After a SKILL_MISMATCH, this keeps an exercise the athlete finds unsteady, at 1 set and RIR 3–4. That is a nonclinical choice that stays with the athlete, as R7B-SSCTR-r2 required.

## Question 2 — planned taper, and the inherited equipment path

**Planned taper, combined strength taper and event-transition semantics: unchanged.** p13, p14, p31, p40 and p41 are byte-identical on both trees. The author's differential keeps the 98 PRESERVE timelines identical, `event:planned-taper` included. R7B-SSCTR-TAPER now also covers reason-based substitutions requested in or before the event weeks.

**The inherited R6-SUBSTITUTION path (P1 `inheritedEquipmentChangeInTaper`): in scope as an observation, not blocking, routed as R7B1-SSCTR-F11 (MODERATE).**

- **What happens (s02).** All 15 well-formed equipment reports put same-intent configurations never performed in this program on event-phase days:
  - 94 rows in all, each 1 set, at RIR 3 or more in the taper and 4 or more on race and post-event days, effort-established or bodyweight;
  - the reports: kettlebell-only or bodyweight-only from the taper, bands-only from race week, and dated bodyweight windows over the race window (travel to the race);
  - byte-identical on FREEZE-2.
- **Why it does not block this gate:**
  - it is not a reason-based substitution, so it is outside OBS-04 as stated;
  - R7-B.1 neither created nor changed it;
  - it stays inside the literal R6-SUBSTITUTION envelope ("when equipment or circumstance removes an exercise") and its first-exposure dose (C6: at most 2 sets at RIR 3 or more).
- **Why it is real.** It breaches the same event-week rule as OBS-04 (R6-EVENT-TRANSITION C7, B0-C05 c1). R6-SUBSTITUTION only *permits* a substitute and already gives the compliant answer (C8), so both policies can be met. This is a binding gap, not a policy contradiction.
- **Required change (next runtime mission).** The same stand-in rule, with the equipment of the date; otherwise the slot is left out and disclosed.
- **Until then.** Excluded from R7B-SSCTR-TAPER and R7B-SSCTR-DOSE. It is a re-review trigger ("runtime inconsistency observed in a later gate") for the R6-EVENT-TRANSITION and R6-SUBSTITUTION bindings.

**Correction of my r2 record.** R7B-SSCTR-r2 said the inherited equipment path in the same week "changes nothing". Its comparator (r06) sent fields the runtime does not read, so it got KEEP; it still does, on both trees (s02 control). That statement is withdrawn (claim FID3-5).

## Question 3 — F1/F2 and the return paths: unchanged

In my own run, p10–p14, p16, r01, r02 and r08 are byte-identical between FREEZE-2 and R7B1, as the author reported.
- **F1.** After the 30-day restart, a graduated athlete's first threshold session is in week 15, after two established easy weeks (p12).
- **F2.** There are no familiar bouts after either event (p13, p14).
- **F8.** Still present (r01); it stays a condition.
- **QE-R7B-R2-02** (an Engineering item). The block-choice question now carries the correction's factual re-plan. P3, re-run: 104 checks, 0 failed (FREEZE-2: 32 failed). That re-plan equals the one the correction gives alone, so it adds no dose.

R7B-SSCTR-RETURN is carried forward.

## Question 4 — the novice and strength paths the delta touches

- **QE-R7B-R2-01 / F9: resolved.** The schedule-change proposal now stores the capped templates. After the next two weekly reviews, weeks 2–4 stay FULL_A, FULL_B and two CORE days while the state reads capped; FREEZE-2 re-planned them as LOWER and UPPER. New configurations wait for the week-5 release and start at 1 set, RIR 3 (r03, r04; P2 re-run: 639 checks, 0 failed). Intake-capped athletes are unchanged (r05).
- **QE-R7B-R2-03: resolved; the fallback never goes above the substitute.** s05 covers 52 equipment losses after a SKILL_MISMATCH:
  - 0 climbs (FREEZE-2 climbed to single-leg-rdl-db, HIGH eccentric, or to one-arm-db-row);
  - 16 fall back to glute-bridge, and kb-deadlift returns after a dated window;
  - 36 ask (NO_LOWER_SKILL_ALTERNATIVE).

  Asking is acceptable: nothing harder is prescribed and the choice stays with the athlete. The options are incomplete (F13).
- **QE-R7B-R2-04: acceptable.** The next candidate comes from the unchanged candidate order. Across s05's 216 decisions:
  - 0 SKILL_MISMATCH selections above the replaced exercise's skill;
  - loaded-to-unloaded changes are disclosed;
  - first exposures are establishments or a dose this program already executed.

  The 8 changed decisions stay within the athlete's admissible skill. Six lower the demand, for example one-arm-db-row to band-face-pull or prone-ytw-raise; one-arm-db-row to kb-row keeps it. One, a preference, moves incline-push-up to pike-push-up: MODERATE skill like push-up, FREEZE-2's selection, but a vertical push. That is allowed only because push-up stays in the same session as the horizontal push (B0-C07 c6), and it starts with establishment (bodyweight, at most 2 sets, RIR 3 or more).

  For novices, a front-plank SKILL_MISMATCH meets the same case: the only lower option (dead-bug) is already in the session. The plan now asks instead of prescribing an inconsistent session, but its options are "Add equipment" and "Keep front-plank" (F13).

## Question 5 — dose and progression: no regression

- p40 (195 programs, 30 reviewed timelines) and p42 are byte-identical. The author's regression shows 0 envelope findings and 0 run-minute rises.
- In the event weeks, no row is below the phase RIR minimum and no session is above the no-substitution counterfactual (s01).
- Stand-ins stay at or below their own last dose (s03).
- New configurations start with establishment (s01, s05).
- The delta changes no run path.

## New findings

| Id | Severity | Blocks? | Finding | Owner |
|---|---|---|---|---|
| R7B1-SSCTR-F11 | MODERATE | No: inherited, outside the delta and OBS-04, inside the literal R6-SUBSTITUTION envelope | Equipment-forced substitutes never performed in this program on event-phase days (s02: 15/15 reports, 94 rows, 1 set, RIR at least 3 or 4) | Chief → next runtime mission, with the SSCTR |
| R7B1-SSCTR-F12 | MINOR | No: no dose effect | Last-SPECIFIC case: neither the decision nor the weekly review that leaves the slot out discloses it; the omission exists only in `eventStandIns` (s04) | Next runtime mission, with Product/UX |
| R7B1-SSCTR-F13 | MINOR | No: no dose effect | The questions the delta asks offer no "leave the slot out" (R6-SUBSTITUTION C8) and include options that cannot apply ("Add equipment", "Keep front-plank"); while the R2-03 question is open, the sessions ahead keep the substitute whose equipment is gone (s06) | Next runtime mission, with Product/UX |

None of them needs a further cycle: F11 is inherited, and F12 and F13 do not block.

## Records (R7B1-SSCTR-r1)

| Record | Disposition | Note |
|---|---|---|
| R7B-SSCTR-FIDELITY | APPROVE_WITH_CONDITIONS | Was REVISE in r2. OBS-04 met; F11–F13 routed; r2 statement corrected |
| R7B-SSCTR-NOVICE | APPROVE_WITH_CONDITIONS | F9 resolved; F13 and F6 as conditions |
| R7B-SSCTR-HYBRID | APPROVE_WITH_CONDITIONS | Carried forward and re-bound (p20 identical) |
| R7B-SSCTR-TAPER | APPROVE_WITH_CONDITIONS | The event-week exclusion is lifted for reason-based substitutions; equipment-forced ones stay excluded (F11). The ten AE questions are answered |
| R7B-SSCTR-RETURN | APPROVE_WITH_CONDITIONS | Carried forward and re-bound; F8 still a condition |
| R7B-SSCTR-DOSE | APPROVE_WITH_CONDITIONS | Stand-in and candidate doses checked; F7 and F10 recorded; F11 doses excluded |
| R7B-SSCTR-DECLARED | APPROVE_WITH_CONDITIONS | R7B-DECL-13 now applies in the event weeks; DECL-16's F9 condition is met; DECL-05 keeps F8 and DECL-03 keeps F6 |

Every record has evidence status SUPPORTED_WITH_LIMITS and confidence MODERATE, and is bound to the R7B1-FREEZE-1 record and source digest.

There is no Python interpreter here, so I checked the records with `probes/validate-records-r7b1.mjs`, a Node port of the skill validator: passed, 7 records, 7 queue entries equal to the block below, 0 errors (`probes/out/validate-records-r7b1.json`). Schema validity says nothing about scientific truth.

## Conditions

1. **F11.** Apply the OBS-04 rule to equipment-forced substitutions on event-phase days before any use beyond the offline reference: a performed configuration that fits the equipment of the date, otherwise the slot is left out and disclosed; the substitute starts after the post-event week with its establishment. Until then that path is excluded from the taper approval.
2. **F12.** Disclose the event-week handling of a substitute planned before the event weeks, and every slot a review leaves out of an event-phase session.
3. **F13.** The questions asked instead of a substitution offer leaving the slot out (disclosed) and only options that can apply.
4. **R18.** A substitute planned before the event weeks enters them only once performed. That holds only when the week before them receives its gating review, so every elapsed week receives its gating review before any use beyond the offline reference (recorded condition, unchanged).
5. **Carried from R7B-SSCTR-r2** with their owners: F6, F7, F8, F10, and the ceiling-units re-review trigger.
6. **Unchanged authorities.** R6-POLICY-5, R7B0-CATALOG-2 and the B0 r2 records stay as they are. R7-B.1 adds no dose.

## Literature

Read in full in this review (Europe PMC, open access):
- Theodorou et al. 2026 (PMC13674372): how long the repeated-bout effect lasts;
- Maeo et al. 2017 (PMC5348007): a light bout of the same task protects; a different task does not;
- Devantier-Thomas et al. 2024 (PMC11199296): less soreness at a second resistance bout; endurance markers.

Re-checked for the numbers used: Wang 2023, de Carvalho e Silva 2022, Run Clever (Ramskov 2018), Zheng 2022, ACSM 2026, Kinoshita 2023 and Frandsen 2025.

Two gaps, recorded:
- I found no open-access synthesis on strength retention over two to three weeks. The cost of leaving a slot out rests on the approved R6 event envelope instead.
- No source shows that one low-dose first exposure days before a race is either harmful or harmless. The risk is directional and small, not quantified.

## Proposed human revalidation queue entries

There is one entry per approving record, with the conditions copied verbatim from the records. These entries are proposed and append-only; this reviewer did not edit the queue. Funding is NOT_DECLARED. A future qualified human may maintain, modify or revoke any of these decisions without an AI veto. The HQ-R7B-SSCTR-* entries of R7-B stay as they are.

```json
[
  {
    "queue_id": "HQ-R7B1-SSCTR-FIDELITY",
    "decision_id": "R7B-SSCTR-FIDELITY",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "R7B0-CATALOG-2 (bound paths the delta touches)",
        "R7B0-SSCTR-r2 B0-C05 c1, B0-C06 c1 and c8, B0-C07 c1 and c6, B0-C08 conditions",
        "R6-POLICY-5 envelope records (r12): R6-EVENT-TRANSITION C7 and C18, R6-SUBSTITUTION C5, C6 and C8",
        "R7-B.1 delta FREEZE-2 10b26d6 -> R7B1-FREEZE-1 d41df8b: src/r6-program.mjs (strengthRowsFor, eventWeekStandIn, buildWeek), src/r6-adaptation.mjs (exerciseSubstitution, eventWeekDisclosure, slipsFrom, skillMismatchGap, finishProposal, rebuild, equipmentChange, evaluateProgram), src/r7b-repertoire.mjs (buildTemplates, ladderDown, followsSkillMismatch, REASON_BASED_SUBSTITUTION)",
        "QE-R7B-OBS-04, QE-R7B-R2-01, QE-R7B-R2-03, QE-R7B-R2-04",
        "CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md (SHA-256 a551a610...95173cab)"
      ]
    },
    "approved_scope": "The R7-B.1 runtime binding on R7B1-FREEZE-1: the QE-R7B-OBS-04 event-week rule for reason-based substitutions (stand-in or slot left out, disclosure, establishment after the post-event week, clinical screen first), stored novice templates (F9), the SKILL_MISMATCH fallback direction and the next substitution candidate; the inherited equipment path on event-phase days excluded (F11); F12 and F13 as conditioned.",
    "conditions": [
      "F11 (owner Chief -> next runtime mission, with the SSCTR): apply the QE-R7B-OBS-04 rule to equipment-forced substitutions on event-phase days (a performed configuration that fits the equipment of the date, else the slot left out and disclosed; the substitute starts after the post-event week with its establishment) before any use beyond the offline reference; until then that path is excluded from R7B-SSCTR-TAPER",
      "F12 (owner next runtime mission, with Product/UX for presentation): disclose the event-week handling of a substitute planned before the event weeks, and every slot a review leaves out of an event-phase session, before any use beyond the offline reference",
      "F13 (owner next runtime mission, with Product/UX): the questions raised instead of a substitution (NO_ADMISSIBLE_ALTERNATIVE, NO_LOWER_SKILL_ALTERNATIVE) offer leaving the slot out, disclosed (R6-SUBSTITUTION C8), and only options that can apply, before any use beyond the offline reference",
      "R18: a substitute planned before the event weeks enters them only once performed, which holds only when the week before them receives its gating review; every elapsed week receives its gating review before any use beyond the offline reference (recorded condition, unchanged)",
      "Carried from R7B-SSCTR-r2 with their owners: F6 (Product/Data with Engineering), F7 (recorded deviation), F8 and F10 (next runtime mission), the ceiling-units re-review trigger",
      "R6-POLICY-5, R7B0-CATALOG-2 and the B0 r2 records stay unchanged; R7-B.1 adds no dose"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)",
      "The runtime change that resolves R7B1-SSCTR-F11"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-NOVICE",
    "decision_id": "R7B-SSCTR-NOVICE",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "B0-C08 c1-c5 (novice density, incl. the lazy start R7B-DECL-16)",
        "B0-C07 c1 and c6 (skill ladders; SKILL_MISMATCH regression)",
        "B0-C01 c1-c10 (graduation, strides optionality; unchanged)",
        "QE-R7B-R2-01 (finishProposal, rebuild, equipmentChange)",
        "QE-R7B-R2-03 (buildTemplates, followsSkillMismatch, skillMismatchGap)",
        "QE-R7B-R2-04 (exerciseSubstitution candidates, slipsFrom)"
      ]
    },
    "approved_scope": "Novice paths on R7B1-FREEZE-1: graduation and its withdrawal, strides optionality, novice density from intake and from a context change (held through later reviews), skill ladders and the SKILL_MISMATCH direction, practice rows; F13 and F6 as conditioned.",
    "conditions": [
      "F13 (owner next runtime mission, with Product/UX): the questions raised instead of a substitution (NO_ADMISSIBLE_ALTERNATIVE, NO_LOWER_SKILL_ALTERNATIVE) offer leaving the slot out, disclosed (R6-SUBSTITUTION C8), and only options that can apply, before any use beyond the offline reference",
      "F6: the observation contract records which session was run (owner Product/Data with Engineering) before any use beyond the offline reference",
      "B0-C01, B0-C07 and B0-C08 conditions keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-HYBRID",
    "decision_id": "R7B-SSCTR-HYBRID",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "B0-C11 c1-c8 (CMP.I11, CMP.P04 content stage incl. the week wrap)",
        "B0-C03 c3, B0-C06 c2, B0-C07 c7 placement of first exposures",
        "src/r6-program.mjs buildWeek content stage",
        "src/r6-balanced.mjs interferenceCosts"
      ]
    },
    "approved_scope": "CMP.I11 ranking and the CMP.P04 content stage within the week and across the week wrap on R7B1-FREEZE-1 (carried forward from R7B-SSCTR-r2).",
    "conditions": [
      "B0-C11 c1-c8 keep applying unchanged; R7-B and R7-B.1 add no hybrid dose",
      "First exposures that CMP.I11 does not see (a novice-density release, a mid-context re-establishment; R7B-DECL-08) stay acceptable only while CMP.I11 is a LOW ranking cost and those exposures are effort-established at most 2 sets at RIR >= 3"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-TAPER",
    "decision_id": "R7B-SSCTR-TAPER",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "R6-EVENT-TRANSITION as bound (10K, half marathon), C7 and C18",
        "B0-C05 c1",
        "B0-C06 c1 and c8",
        "R6-SUBSTITUTION C5, C6 and C8",
        "B0-C02 c2 and c6; race-day warm-up strides (B0-C01 c8)",
        "src/r6-program.mjs strengthRowsFor, eventWeekStandIn, buildWeek, eventWeekSessions; src/r6-adaptation.mjs exerciseSubstitution, eventWeekDisclosure; src/r6-prescription.mjs racePrescription"
      ]
    },
    "approved_scope": "Planned 10K and half-marathon taper, race week, post-event and combined strength taper on R7B1-FREEZE-1, and reason-based substitutions requested in or before those weeks under the QE-R7B-OBS-04 rule; equipment-forced substitutions on event-phase days excluded until R7B1-SSCTR-F11 is resolved.",
    "conditions": [
      "R6-EVENT-TRANSITION C4-C19, B0-C05 c1 and R6-SUBSTITUTION C5-C8 keep applying unchanged; R7-B.1 adds no event dose",
      "Equipment-forced substitutions (EQUIPMENT_CHANGE) on TAPER, RACE_WEEK or POST_EVENT days are excluded from this approval until R7B1-SSCTR-F11 is resolved",
      "R18: a substitute planned before the event weeks enters them only once performed, which holds only when the week before them receives its gating review; every elapsed week receives its gating review before any use beyond the offline reference (recorded condition, unchanged)",
      "F12 (owner next runtime mission, with Product/UX for presentation): disclose the event-week handling of a substitute planned before the event weeks, and every slot a review leaves out of an event-phase session, before any use beyond the offline reference",
      "\"Keep <exercise> until after the event\" stays available as not adopting the proposal: it schedules nothing, and the athlete makes the change after the post-event week",
      "Race-day warm-up strides stay optional for the B0-C01 c8 population"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)",
      "The runtime change that resolves R7B1-SSCTR-F11"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-RETURN",
    "decision_id": "R7B-SSCTR-RETURN",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "R6-NONCLINICAL-RETURN as bound (SHORT, MODERATE, LONG)",
        "R7-A E1",
        "B0-C01 c1 and c7 with R7B-DECL-04 (revised)",
        "B0-C02 c1, c3 and c5 with R7B-DECL-05 (bouts currency, withdrawal, lapse)",
        "QE-R7B-04 (graduation withdrawal on corrected evidence)"
      ]
    },
    "approved_scope": "Returns after nonclinical interruptions and evidence corrections on R7B1-FREEZE-1: E1, graduation re-entry after a restart, graduation withdrawal, familiar-bouts currency, lapse and withdrawal, and questions that carry the factual re-plan (F8 as conditioned; carried forward from R7B-SSCTR-r2).",
    "conditions": [
      "F8: a completed bouts session counts toward currency whatever its response, the gate decides repeat or withdrawal, and the replacing session states the actual reason (owner next runtime mission) before any use beyond the offline reference",
      "R6-NONCLINICAL-RETURN, B0-C01 c7 and B0-C02 c3/c5 keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-DOSE",
    "decision_id": "R7B-SSCTR-DOSE",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "R6 goal doses, establishment and phase doses as bound (R6-EVENT-TRANSITION C7 and C18; R6-SUBSTITUTION C6)",
        "B0-C03 c1, c2, c6; B0-C04 c4, c5; B0-C05 c1, c2; B0-C08; B0-C09",
        "R7-B.1 delta: the stand-in dose (strengthDose of the stand-in configuration in the slot role and day phase), next candidates, SKILL_MISMATCH fallbacks, stored novice templates",
        "Q-R7B-05 (one practice row per configuration per session)",
        "Q-R7B-07 disclosures (limit and equipment offered)"
      ]
    },
    "approved_scope": "Strength and run dose boundaries and B0 representation rules on R7B1-FREEZE-1, including event-week stand-ins at their own reduced dose and the establishment of next candidates and fallbacks (F7 and F10 as recorded; equipment-forced event-week first exposures excluded, F11).",
    "conditions": [
      "F7 stays a recorded deviation until a week-level calf pass after the fit (owner next runtime mission)",
      "F10: promise a skill-ladder path only where one exists (owner next runtime or catalog revision)",
      "F11: the doses of equipment-forced first exposures on event-phase days are not approved here (see R7B-SSCTR-TAPER)",
      "B0-F07: available implement steps collected before production (owner Product/Data)",
      "Band and assistance level changes stay athlete-reported and confirmed (B0-C04 c5)"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-DECLARED",
    "decision_id": "R7B-SSCTR-DECLARED",
    "decision_revision": "R7B1-SSCTR-r1",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json",
      "artifact_revision": "R7B1-FREEZE-1 (freeze commit d41df8b129495e32fe2923087d665798854609e9, bytes of b82d75878db2bb8290847ef18abe104fba21989f; source digest 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; manifest digest 2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee, source d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "01c146f92cf1728b21efed9983ee5855f14365eec93cb64393627c36e319920f",
      "rule_ids": [
        "CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md section 3 (SHA-256 110006b6...9acb): R7B-DECL-04 (revised), -05, -13, -14, -15, -16",
        "CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md section 4: R7B-DECL-01 ... 12",
        "CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md B1 (event weeks) and B2 (stored novice templates)"
      ]
    },
    "approved_scope": "Declared interpretations R7B-DECL-01 ... 16 as bindings on R7B1-FREEZE-1 (R7B-DECL-13 inside the event weeks under the QE-R7B-OBS-04 rule; F8 and F6 as conditioned).",
    "conditions": [
      "R7B-DECL-05: F8 before any use beyond the offline reference (owner next runtime mission)",
      "R7B-DECL-03: F6 routed (owner Product/Data with Engineering)",
      "R7B-DECL-13 inside the event weeks applies under the QE-R7B-OBS-04 rule as frozen, with F12 and F13 routed; equipment-forced substitutions on event-phase days stay excluded (F11)",
      "R18: every elapsed week receives its gating review before any use beyond the offline reference (recorded condition); the ceiling-units question is a re-review trigger for the next policy revision"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_1.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)",
      "A policy revision of the single-run ceiling"
    ]
  }
]
```

R7B1_SSCTR_GATE = ACCEPT_WITH_CONDITIONS
