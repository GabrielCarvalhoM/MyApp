# R7-B — SSCTR narrow recheck on FREEZE-2 (R7B-SSCTR-r2)

This is the single narrow recheck allowed by the Founder loop bound. It was run by the same independent SSCTR instance that wrote R7B-SSCTR-r1 (committed at `0fb1339`). Versions: SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, evidence protocol SSCTR-EP-1.0.0. The system prompt is the project adapter body, `021b5951…6c52d`, and the model (claude-opus-5-5) is inherited.

Authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY only. This is not human, empirical or clinical validation. The structured records are in [SSCTR_RECHECK_R7B.json](SSCTR_RECHECK_R7B.json): revision r2 of all seven records, each superseding its r1 record.

## Bytes judged

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-2; record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json` (file `e49d80ec…153e`); commit `10b26d6`, bytes of `d03025b` |
| Source digest | `d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241` |
| Manifest digest | `d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a` |
| Unchanged | R6-POLICY-5 `18ec48f3…`, R7B0-CATALOG-2 `ceee276a…`, B0 r2 records `6867d3e8…` |

`node scripts/verify-r7b.mjs --freeze 2` returned 19/19 PASS both before and after the probes.

The r1 reproductions were re-run from copies in `recheck/probes/`. New probes `r01`–`r08` cover the delta and QE-R7B-OBS-04. Nothing under `reviews/ssctr/` outside `recheck/` was modified, and no tracked file changed.

**Blocking criterion (same as r1):**
- A finding blocks when the runtime prescribes outside *every* approved envelope (R6, B0, R7-A).
- A deviation from a stricter B0 overlay whose prescription stays inside an approved R6 envelope is recorded with an owner and does not block.

## FREEZE-1 findings on FREEZE-2

| Id | r1 | Now | Reproduction |
|---|---|---|---|
| F1 | MAJOR, blocking | **Resolved** | `p12`: after the 30-day restart, week 13 (first EASY week) has no quality; the first threshold session is in week 15, two established easy weeks later, identical to the EASY_CURRENT comparator.<br>The introduction is unchanged (`p10`: week 4, 3×5 at step 0; easy and long held). |
| F2 | MODERATE, blocking | **Resolved** | `p13` B: NEXT_BLOCK after the 10K runs THRESHOLD 3×5, with no bouts.<br>`p14` C: no bouts after the half marathon.<br>`p14` A: tasks observed 15 or 27 days before intake never start. |
| F3 | MINOR | **Resolved** | `p11` A: strides are held at 4 in the introduction week.<br>`p41`: race-day warm-up strides are optional for EASY_LOW and NOVICE athletes. |
| F4 | MINOR | **Resolved** | `p20` B2: in RUN-led weeks 7–9, the day-6 row before next week's day-0 long run is reduced to 1 set; other leads and MAIN rows are untouched. |
| F5 | MINOR | **Resolved** (see F8) | The replacing session carries `replaces` and says "a different, lower stimulus" (`p13` C, `p14` B).<br>With currency extended, the second adverse response withdraws the bouts and the session names the reason (`r08`). |
| F6 | MINOR | Routed | Product/Data with Engineering (matrix `fixCycle.recorded`); unchanged (`p11` C). |
| F7 | MINOR | Accepted as a recorded deviation | Matrix `SSCTR:B0-C05#c2`, owner: next runtime mission; the count is unchanged (`p42`: 570/10,526). |
| R18, ceiling units | conditions | Recorded | R18 is a condition on the client contract; ceiling units are a re-review trigger for the next policy revision. |

## Fix-cycle changes in scope

These stay inside the envelopes unless a finding is noted:
- **Graduation withdrawal on corrected evidence.** `r02`: the graduation is withdrawn from the review week, executed sessions stay in history, and easy and long runs hold at their executed values. Re-graduation needs two new qualifying weeks and re-enters at step 0.
- **Content stage across the week wrap:** see F4.
- **One practice row per configuration per session.** `r03` C: one `dead-bug-practice` row per TPL.CORE day. This is a reduction.
- **Class-specific quality trace.** `r07`: EASY_UNKNOWN is told there is no harder session in this plan (NONE_IN_V1).
- **Skill/equipment disclosures.** These still disclose "a lower, different stimulus … not an equivalent" and keep equipment optional; one wording issue is F10.
- **Lazy start of the novice cap:** see F9.
- **Dose sweep** on FREEZE-2 (`p40`, 195 programs and 30 reviewed timelines): no violations. The claims scan (`p43`) is clean.

## New findings in the delta (non-blocking)

| Id | Severity | Finding and reproduction |
|---|---|---|
| R7B-SSCTR-F8 | MINOR | **A completed bouts session with one adverse response does not extend the task's currency**, because currency is extended only on ADVANCE or EARNED.<br>With the usual horizon, one adverse first session lapses the bouts instead of repeating them. The replacement then says they are "no longer current (a break, or more than four weeks without them)", a week after the athlete ran them (`r01` A–C; the control `r01` D and `r08` behave as intended).<br>The dose is a fallback that B0-C02 c3 permits; the stated reason is wrong. Owner: next runtime mission. |
| R7B-SSCTR-F9 | MODERATE | **The lazily started B0-C08 cap is lost at the next weekly review** (QE-R7B-05 fix incomplete; DECL-16).<br>Case: a strength-NONE athlete moves from 2 to 4 days in week 1. The schedule-change proposal caps weeks 2–4 (FULL_A, FULL_B and two CORE days). The next weekly review re-plans them as LOWER, LOWER_B, UPPER and UPPER_B while the state still reads `capped=true`; the program no longer holds novice templates (`r04`, `r03` A).<br>Athletes capped from intake keep the cap through later changes and reviews (`r05`).<br>This is outside B0-C08 c1 but inside the R6 day-count envelope, and every new configuration is still established by effort at ≤2 sets, RIR ≥3. The cap is a coaching choice (B0-C08 c5). Owner: Engineering, next runtime mission. |
| R7B-SSCTR-F10 | MINOR | **The SKILL-limited PULL disclosure promises "harder pulls through their skill ladder" where no path exists.**<br>Case: a barbell-and-rack novice is given `prone-ytw-raise`, which has no ladder. `inverted-row` is reachable only from `prone-row-practice`, a practice row that is never offered a step (`r07`).<br>Wording only; owner: next runtime or catalog revision. |

## QE-R7B-OBS-04 — blocking (MODERATE)

**What happens (`r06`).** The athlete has a 10K, a GENERAL strength goal, dumbbells, a bench and a kettlebell, and FIXED rotation. Of 20 reason-based substitutions requested at the start of the taper week or the race week, 18 place a configuration never performed in the program into TAPER, RACE_WEEK or POST_EVENT sessions:
- in the taper week: 1 set at RIR 3, established by effort or at bodyweight;
- in race week: 1 set at RIR 4;
- in the post-event week: further rows.

This includes HIGH-eccentric first exposures in the taper week (`single-leg-rdl-db`, `bulgarian-split-squat-db`). An equipment change in the same week (the inherited path) changes nothing.

**Why it blocks.**
- R6-EVENT-TRANSITION C7 forbids any new exercise, load increase or rotation in taper and race week.
- B0-C05 c1 forbids a new exercise in TAPER, RACE_WEEK and POST_EVENT.
- DR-134 gives a stated reason precedence over cadence, MAIN retention and FIXED (B0-C06 c8), but not over event-phase policy.
- R6-SUBSTITUTION C8 already provides the compliant answer: omit the exercise and disclose it.
- No approved envelope permits a new exercise here.

The protection a prior bout gives belongs to that same exercise (Theodorou 2026), and a never-performed configuration lacks it. The dose is small, but the rule is categorical.

**Required narrow change.**
- In TAPER, RACE_WEEK and POST_EVENT weeks, a reason-based substitution selects only a configuration already performed in this program and not set aside, with the same pattern and role.
- Otherwise the exercise is omitted for those weeks and the omission is disclosed (R6-SUBSTITUTION C8). The athlete may keep the exercise instead.
- The chosen substitute starts after POST_EVENT, with effort-guided establishment.
- The clinical screen and the ASK routes still come first.

## Records (r2)

| Record | Disposition | Note |
|---|---|---|
| R7B-SSCTR-FIDELITY | REVISE | OBS-04 (blocking); F1–F5 resolved; F8–F10 routed |
| R7B-SSCTR-NOVICE | APPROVE_WITH_CONDITIONS | F9 and F6 as conditions |
| R7B-SSCTR-HYBRID | APPROVE_WITH_CONDITIONS | F4 resolved |
| R7B-SSCTR-TAPER | APPROVE_WITH_CONDITIONS | Planned taper only; event-week substitutions excluded until OBS-04 is fixed |
| R7B-SSCTR-RETURN | APPROVE_WITH_CONDITIONS | F1, F2, F5 resolved; F8 as a condition; AE questions answered |
| R7B-SSCTR-DOSE | APPROVE_WITH_CONDITIONS | Sweep clean; F7 and F10 recorded |
| R7B-SSCTR-DECLARED | APPROVE_WITH_CONDITIONS | DECL-04 (revised), -13, -14, -15 accepted; DECL-05 accepted with F8; DECL-16 accepted with F9; DECL-01 … 12 carried, with the r1 conditions on 01 and 08 now met |

Every record has evidence status SUPPORTED_WITH_LIMITS and confidence MODERATE.

## Conditions

1. **The blocker.** Apply the OBS-04 change above. Under the loop bound there is no further cycle, so R7-B closes NOT_READY with OBS-04 as the explicit blocker.
2. **Before any use beyond the offline reference:** fix F8, F9 and F10, and resolve F6 (owners named above).
3. **Carried as recorded:** F7, R18 and the ceiling-units trigger.
4. **Unchanged authorities:** R6-POLICY-5, the catalog and the r2 records stay as they are. R7-B adds no dose.

## Proposed human revalidation queue entries

There is one entry per approving r2 record, and the conditions are copied verbatim from the records. These entries are proposed and append-only; this reviewer did not edit the queue. Funding is NOT_DECLARED. A future qualified human may maintain, modify or revoke any of these decisions without an AI veto. The REVISE record is not queued, and the r1 proposals are superseded.

```json
[
  {
    "queue_id": "HQ-R7B-SSCTR-NOVICE",
    "decision_id": "R7B-SSCTR-NOVICE",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "B0-C01 c1-c10 (graduation, strides optionality)",
        "B0-C07 (skill ladders)",
        "B0-C08 c1-c5 (novice density, incl. the lazy start R7B-DECL-16)",
        "QE-R7B-04 graduation withdrawal",
        "Q-R7B-02 class trace",
        "Q-R7B-05 practice rows"
      ]
    },
    "approved_scope": "Novice paths on FREEZE-2: graduation (with withdrawal on corrected evidence and the R6 established easy weeks after a restart), strides optionality, novice density from intake, skill ladders, practice rows; the lazy-start cap only as conditioned (F9).",
    "conditions": [
      "F9: the lazily started B0-C08 cap must hold through later reviews (owner Engineering, next runtime mission) before any use beyond the offline reference; until then the plan after the first review follows the R6 day-count envelope",
      "F6: the observation contract records which session was run (owner Product/Data with Engineering) before any use beyond the offline reference",
      "B0-C01, B0-C07 and B0-C08 conditions keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B-SSCTR-HYBRID",
    "decision_id": "R7B-SSCTR-HYBRID",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "B0-C11 c1-c8 (CMP.I11, CMP.P04 content stage incl. the week wrap)",
        "B0-C03 c3, B0-C06 c2, B0-C07 c7 placement of first exposures",
        "src/r6-program.mjs buildWeek content stage",
        "src/r6-balanced.mjs interferenceCosts"
      ]
    },
    "approved_scope": "CMP.I11 ranking and the CMP.P04 content stage within the week and across the week wrap on FREEZE-2.",
    "conditions": [
      "B0-C11 c1-c8 keep applying unchanged; R7-B adds no hybrid dose",
      "First exposures that CMP.I11 does not see (a novice-density release, a mid-context re-establishment; R7B-DECL-08) stay acceptable only while CMP.I11 is a LOW ranking cost and those exposures are effort-established at most 2 sets at RIR >= 3"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B-SSCTR-TAPER",
    "decision_id": "R7B-SSCTR-TAPER",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "R6-EVENT-TRANSITION as bound (10K, half marathon)",
        "B0-C05 c1",
        "B0-C02 c2, c6",
        "race-day warm-up strides (B0-C01 c8)",
        "src/r6-program.mjs eventWeekSessions, buildWeek event branches; src/r6-prescription.mjs racePrescription"
      ]
    },
    "approved_scope": "Planned 10K and half-marathon taper, race week, post-event and combined strength taper on FREEZE-2; reason-based substitutions inside those weeks excluded until QE-R7B-OBS-04 is resolved.",
    "conditions": [
      "R6-EVENT-TRANSITION C4-C19 and B0-C05 c1 keep applying unchanged; R7-B adds no event dose",
      "Reason-based substitutions requested in TAPER, RACE_WEEK or POST_EVENT weeks are excluded from this approval until QE-R7B-OBS-04 is resolved",
      "Race-day warm-up strides stay optional for the B0-C01 c8 population"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)",
      "The runtime change that resolves QE-R7B-OBS-04"
    ]
  },
  {
    "queue_id": "HQ-R7B-SSCTR-RETURN",
    "decision_id": "R7B-SSCTR-RETURN",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "R6-NONCLINICAL-RETURN as bound (SHORT, MODERATE, LONG)",
        "R7-A E1",
        "B0-C01 c1, c7 with R7B-DECL-04 (revised)",
        "B0-C02 c1, c3, c5 with R7B-DECL-05 (bouts currency, withdrawal, lapse)",
        "QE-R7B-04 (graduation withdrawal on corrected evidence)"
      ]
    },
    "approved_scope": "Returns after nonclinical interruptions and evidence corrections on FREEZE-2: E1, graduation re-entry after a restart, graduation withdrawal, familiar-bouts currency, lapse and withdrawal (with F8 as conditioned).",
    "conditions": [
      "F8: a completed bouts session counts toward currency whatever its response, the gate decides repeat or withdrawal, and the replacing session states the actual reason (owner next runtime mission) before any use beyond the offline reference",
      "R6-NONCLINICAL-RETURN, B0-C01 c7 and B0-C02 c3/c5 keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B-SSCTR-DOSE",
    "decision_id": "R7B-SSCTR-DOSE",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "R6 goal doses, establishment and phase doses as bound",
        "B0-C03 c1, c2, c6; B0-C04 c4, c5; B0-C05 c1, c2; B0-C09",
        "Q-R7B-05 (one practice row per configuration per session)",
        "Q-R7B-07 disclosures (limit and equipment offered)"
      ]
    },
    "approved_scope": "Strength and run dose boundaries and B0 representation rules on FREEZE-2 (F7 and F10 as recorded).",
    "conditions": [
      "F7 stays a recorded deviation until a week-level calf pass after the fit (owner next runtime mission)",
      "F10: promise a skill-ladder path only where one exists (owner next runtime or catalog revision)",
      "B0-F07: available implement steps collected before production (owner Product/Data)",
      "Band and assistance level changes stay athlete-reported and confirmed (B0-C04 c5)"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B-SSCTR-DECLARED",
    "decision_id": "R7B-SSCTR-DECLARED",
    "decision_revision": "R7B-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json",
      "artifact_revision": "R7B-RUNTIME-REPERTOIRE-FREEZE-2 (freeze commit 10b26d6e40542a066f7f100fbf16060b66e15aee, bytes of d03025b; source digest d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241; manifest digest d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e49d80ec029d3a3aae3b4d251243fd8979d90a09397b423e25b74201cfb7153e",
      "rule_ids": [
        "CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md section 3 (SHA-256 110006b6...9acb): R7B-DECL-04 (revised), -05, -13, -14, -15, -16",
        "CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md section 4: R7B-DECL-01 ... 12 (decided in r1, carried)"
      ]
    },
    "approved_scope": "Declared interpretations R7B-DECL-01 ... 16 as bindings on FREEZE-2 (F8, F9 as conditioned).",
    "conditions": [
      "R7B-DECL-05: F8 before any use beyond the offline reference (owner next runtime mission)",
      "R7B-DECL-16: F9 before any use beyond the offline reference (owner Engineering, next runtime mission)",
      "R7B-DECL-03: F6 routed (owner Product/Data with Engineering)",
      "R7B-DECL-13 applies inside event weeks only after QE-R7B-OBS-04 is resolved",
      "R18: every elapsed week receives its gating review before any use beyond the offline reference (recorded condition); the ceiling-units question is a re-review trigger for the next policy revision"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)",
      "A policy revision of the single-run ceiling"
    ]
  }
]
```

R7B_SSCTR_GATE = BLOCK
