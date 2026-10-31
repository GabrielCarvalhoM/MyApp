# R7-B.1 — SSCTR narrow recheck on R7B1-FREEZE-2 (R7B1-SSCTR-r2)

This is the one narrow recheck that the loop bound allows after the R7-B.1 correction cycle (request §17). No further cycle follows it: any finding here is routed, not corrected.

- **Reviewer.** The same SSCTR instance that wrote R7B1-SSCTR-r1. It is not an author of R7-B.1 or of its correction cycle.
- **Versions.** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, evidence protocol SSCTR-EP-1.0.0.
- **Instance.** Its instructions match the body of the project adapter (`021b5951…6c52d`). The model (claude-opus-5-5) is inherited and there is no Agent tool. Registration as the native agent type cannot be verified from inside the instance.
- **Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY only. This is not human, empirical or clinical validation.
- **Records.** [SSCTR_RECHECK_R7B1.json](SSCTR_RECHECK_R7B1.json): revision R7B1-SSCTR-r2 of the seven records, re-bound to R7B1-FREEZE-2.

## Bytes judged

| | |
|---|---|
| Freeze | R7B1-FREEZE-2; record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (`e75a2799…4f27d5`); freeze commit `146ebb8`, bytes of `f6525e7` |
| Source digest | `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612` |
| Manifest digest | `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8` |
| Previous | R7B1-FREEZE-1 (`d41df8b`, source `976a1335…`), reviewed in R7B1-SSCTR-r1 (`2e874f1`) |
| Unchanged | R6-POLICY-5 `18ec48f3…`, R7B0-CATALOG-2 `ceee276a…`, B0 r2 records `6867d3e8…` |

Read-only verification from `CoachingCore/` with `node scripts/verify-r7b1.mjs` (FREEZE-2 is the default):
- before the recheck, with `--tests`: 25/25 PASS (786 tests, 0 failed);
- after the recheck: 24/24 PASS without `--tests`, same source and manifest digests (`probes/out/verify-r7b1-after.json`).

No tracked file changed. I wrote only under `reviews/ssctr/recheck/`. I did not run the mutation, freeze or integration scripts with `--write`, nor `npm run verify`.

## Method

- **Comparator.** A `git archive d41df8b` mirror of R7B1-FREEZE-1, kept outside the repository. Its 112 bound files match its freeze record. I deleted it, and the R7-B FREEZE-2 mirror from r1, after the recheck.
- **Probes.** Every probe ran on both trees, read-only. Scripts are in [probes/](probes/) (`run-compare.mjs` runs and compares them); outputs are in `probes/out/R7B1-F2/` and `probes/out/R7B1-F1/`.
  - The 20 R7-B r2 probes.
  - My r1 probes, unchanged: `s01`, `s03`–`s07`.
  - New probes: `s02` v2 (the equipment path, with stand-ins, omissions and rest by design), `s08` (clinical screen), `s09` (rows no substitution placed), `s10` (leaving the slot out), `s11`–`s14` (intake event weeks, disclosures).
  - The author's adversarial probe, copied unchanged.
- **Blocking criterion** (unchanged): a finding blocks when the runtime prescribes outside *every* approved envelope. A deviation from a stricter rule whose prescription stays inside an approved envelope is recorded with an owner.

## Question 1 — the event-week rule for every row: F11 resolved

**F11 (equipment path), s02 v2.** Never-performed rows on event-phase days fall from 94 to 0.
- 76 slots are left out. No stand-in was available, because nothing performed fits kettlebell-only, bodyweight-only or bands-only.
- No row is below the phase RIR minimum.
- All 15 decisions disclose the handling (FREEZE-1: none).
- The author's adversarial probe, re-run here: 3,228 checks, 0 failed, identical to the author's output. Its own equipment observation now finds no new exercise in the event weeks (12 rows on FREEZE-1).

**Reason-based substitutions are unchanged.** s01's 436 decisions are line-for-line identical: 0 never-performed rows on 2,233 event days, 9 stand-ins, 428 slots left out, and all 241 first exposures after the event are establishments.

**The rule now also reaches rows no substitution placed.** These are reductions only:
- **Missed sessions (s09).** An athlete who skipped every day-4 strength session, or every strength session, got 19 first exposures in the planned taper, race and post-event sessions on FREEZE-1. On FREEZE-2 those slots are left out (3), or the whole session is rest by design (4).
- **Intake programs (s11, s14; 2,560 programs).** FREEZE-1 planned 222 first exposures on event-phase days in 144 programs, all with 25- or 35-minute sessions. There, the time fit had kept those rows out of earlier weeks, and the reduced taper sets let them in. FREEZE-2 plans none: 58 performed stand-ins and 164 slots left out.
  - 216 of 26,880 event sessions change. None gains a set (184 equal, 32 lower).
  - Live event sessions stay at 14,080.
- **Rebuilds and short horizons.** A schedule change or a goal change at the taper, and intakes with the race 12–26 days away, are identical on both freezes and bring in nothing new.

**Correction of my earlier records.** R7B-SSCTR-r2 and R7B1-SSCTR-r1 preserved "no new exercise in a planned taper" on the evidence of p40 (195 programs). That held on the probed grid only. FREEZE-1 planned 222 first exposures in the broader intake grid above. On FREEZE-2 it holds on that grid too (claim TAP4-5).

**Stand-in doses: acceptable.**
- s03 is byte-identical: 9 stand-in rows, none above its own last dose, the replaced row or the comparison week.
- At intake, a stand-in performed more than 28 days earlier is re-established by effort under its earlier load, at the phase dose. Example: seated-calf-raise-db, 1×10 at RIR 3, for bent-knee-calf-raise. This is what R6-EVENT-TRANSITION C18 allows.

**Sessions left entirely out: acceptable.** Two cases:
- after an equipment change, the 24 race-week or post-event light sessions (1 set per MAIN lift) whose lifts would all be first exposures;
- an athlete who never did strength in the program.

R6 caps these sessions at one light session (at most one short session in the race window, and one light session after the race). In resistance-trained adults, a full week without resistance training left muscle size, endurance and power gains unchanged, with probably smaller maximal-strength gains (Coleman 2024, RCT, read in full). In the event weeks strength is maintained, not developed, and the new exercise starts with establishment after the post-event week. So the cost is small and recoverable, and it buys the race priority and the R6-EVENT-TRANSITION C7 and B0-C05 c1 rule.

## Question 2 — leaving the slot out after a SKILL_MISMATCH: allowed

**Behaviour (s10, s05, s06).** In all 36 no-lower-skill cases the question offers exactly two options, both of which act: "Keep the equipment" (nothing changes) or "Leave the pull slot out until the equipment returns" (`changes.acceptGap`).
- It names only the missing equipment.
- Confirming applies in 36 of 36. On FREEZE-1, "Name a pull exercise" had no effect.
- After confirming, nothing harder takes the slot (0 climbs at slot level).
- After a dated window, the substitute returns in 18 of 18.

**Why it is allowed.** It follows the reason's direction (catalog SKILL_MISMATCH rule, B0-C07 condition 1) and never prescribes above what the athlete could do. It also uses the compliant answer R6-SUBSTITUTION condition 8 gives for a pattern without a substitute, and only with the athlete's confirmation.

**New finding F14 (MINOR).** In 6 of 18 permanent confirmed losses, all 2-day programs, no pull exercise remains in weeks 4–7. The confirmed disclosure says only that the slot is left out until the equipment returns. Condition 8 asks for such an omission to be disclosed as an essential-stimulus loss where applicable. F14 is routed.

## Question 3 — the clinical screen before any block choice: resolved

s08 covers three athletes (block boundary, mid-block, graduation runner) and three clinical reports (pain with an exercise, a clinical text, an illness interruption). Each was sent with a ladder, main-change, graduation or unrecognised choice, with and without a correction.
- FREEZE-2: 70 of 70 route to CLINICAL_HUMAN_REQUIRED, with no proposal and the dependency carried.
- FREEZE-1: 0 of 70; all were asked about the block choice, 28 of them carrying a proposal.
- Nonclinical controls with a choice off the boundary still ask and propose nothing.

This meets B0-C06 condition 8 and D08.

## Question 4 — disclosure: confirmed, with what changed

- **Review half of F12: resolved.** A weekly review that keeps an event-week slot out, or fills it with a stand-in, now says so in all 6 of 6 missed cases (s04, s13). An example: "bulgarian-split-squat-db, not yet done in this program, is left out of w10-str-d4; it starts after the post-event week". When the substitute was done, nothing is disclosed.
- **Also changed: knock-on slots.** The knock-on slots of a substitution are now disclosed (s12: 3 decisions, for example machine-chest-press left out of a taper session). The cycle record lists this under C5.
- **Decision-time half of F12: unchanged and routed.** None of the 68 decisions taken in the last SPECIFIC week discloses anything.
- **F13: narrowed, not closed.** The exhaustion question no longer offers "Add equipment", and offers naming only when it works (C4). The no-lower-skill question now offers leaving the slot out (C2).

  What remains is my call on "keeping the exercise after a SKILL_MISMATCH". Keeping is acceptable as one option: it is a familiar exercise at its current dose, and the choice is nonclinical and the athlete's. It must not be the only option. Today the exhaustion question never offers leaving the slot out, and when nothing else can take the place it offers only "Keep X" (the author's test case: prone-ytw-raise). F13 stays routed.

## Question 5 — no dose regression

- p40 is byte-identical. p42 differs only where first exposures planned on event days are removed (calf weeks 10,526 → 10,525; single bent-knee 570 → 566).
- s01 and s03 doses are identical, and s05 differs only in question options.
- No changed intake session gains a set.
- No event-week row falls below the phase RIR minimum (s01, s02).
- A confirmed gap prescribes nothing.
- The cycle changes no run path.

## Findings

| Id | Severity | Status | Owner |
|---|---|---|---|
| R7B1-SSCTR-F11 | MODERATE | **Resolved** on FREEZE-2 (C3) | — |
| R7B1-SSCTR-F12 | MINOR | Review half resolved (C5); the decision-time half is open and routed, unchanged | Next runtime mission, with Product/UX |
| R7B1-SSCTR-F13 | MINOR | Narrowed (C2, C4). Remaining: no "leave the slot out" in the exhaustion question, and after a SKILL_MISMATCH keeping the exercise must not be the only option | Next runtime mission, with Product/UX |
| R7B1-SSCTR-F14 | MINOR, new, non-blocking | A confirmed gap that leaves the pattern out of the whole week is not disclosed as a loss of that stimulus, with the ways back (R6-SUBSTITUTION C8) | Next runtime mission, with Product/UX |

None blocks: each prescription stays inside an approved envelope, and none changes a dose.

## Records (R7B1-SSCTR-r2)

| Record | Disposition | Note |
|---|---|---|
| R7B-SSCTR-FIDELITY | APPROVE_WITH_CONDITIONS | F11 resolved; C1, C2, C5 verified; F12 decision half, F13 and F14 routed |
| R7B-SSCTR-NOVICE | APPROVE_WITH_CONDITIONS | Novice paths byte-identical; F13, F14, F6 as conditions |
| R7B-SSCTR-HYBRID | APPROVE_WITH_CONDITIONS | Carried forward, re-bound (p20 identical) |
| R7B-SSCTR-TAPER | APPROVE_WITH_CONDITIONS | The r1 F11 exclusion is lifted; the planned-taper statement is corrected; the ten AE questions are answered |
| R7B-SSCTR-RETURN | APPROVE_WITH_CONDITIONS | Return paths byte-identical; the clinical screen now comes before block choices; F8 still a condition |
| R7B-SSCTR-DOSE | APPROVE_WITH_CONDITIONS | No regression; F7 and F10 recorded; the F11 exclusion is lifted |
| R7B-SSCTR-DECLARED | APPROVE_WITH_CONDITIONS | R7B-DECL-13 now covers every row; R7B-DECL-14 comes after the clinical screen; F8 and F6 |

Every record has evidence status SUPPORTED_WITH_LIMITS and confidence MODERATE.

There is no Python interpreter here, so I checked the records with `probes/validate-recheck-r7b1.mjs`, a Node port of the skill validator: passed, 7 records, 7 queue entries equal to the block below, 0 errors (`probes/out/validate-recheck-r7b1.json`); `integrate-queue-r7b1.mjs` without `--write` accepts the block against R7B1-FREEZE-2 (223 -> 230 entries, no problems), and the queue file is unchanged. Schema validity says nothing about scientific truth.

## Conditions

1. **F12, decision-time half.** A substitution whose substitute is planned before the event weeks says that it enters them only once done.
2. **F13.** The exhaustion question offers leaving the slot out, disclosed. After a SKILL_MISMATCH it never offers keeping the exercise as the only option.
3. **F14.** A confirmed gap that leaves a pattern out of the whole week is disclosed as a loss of that stimulus, with the ways back.
4. **R18.** The rule reads what was performed from the week-start state, so every elapsed week receives its gating review (recorded condition, unchanged).
5. **Carried with their owners:** F6, F7, F8, F10, and the ceiling-units re-review trigger.
6. **Unchanged authorities.** R6-POLICY-5, R7B0-CATALOG-2 and the B0 r2 records stay as they are. R7-B.1 adds no dose.

Conditions 1–3 apply before any use beyond the offline reference.

## Literature

Read in full in this recheck: Coleman et al. 2024 (PMC10809978, RCT), on a one-week cessation of resistance training. The evidence base of R7B1-SSCTR-r1 is carried unchanged; it is the same instance and the same day. That base is Theodorou 2026, Maeo 2017 and Devantier-Thomas 2024, read in full, and the re-checked Wang 2023, de Carvalho e Silva 2022, Run Clever, Zheng 2022, ACSM 2026, Kinoshita 2023 and Frandsen 2025.

Recorded gap: I still found no open-access synthesis on strength retention over two to three weeks in trained adults.

## Proposed human revalidation queue entries

There is one entry per approving record, with the conditions copied verbatim from the records. Each target names `RUNTIME_FREEZE_R7B1_2`. These entries are proposed and append-only; this reviewer did not edit the queue. Funding is NOT_DECLARED. A future qualified human may maintain, modify or revoke any of these decisions without an AI veto.

```json
[
  {
    "queue_id": "HQ-R7B1-SSCTR-FIDELITY",
    "decision_id": "R7B-SSCTR-FIDELITY",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "R6-POLICY-5 envelope records (r12): R6-EVENT-TRANSITION C7 and C18, R6-SUBSTITUTION C5, C6 and C8",
        "R7B0-SSCTR-r2 B0-C05 c1, B0-C06 c1 and c8, B0-C07 c1, B0-C09",
        "Correction cycle R7B1-FREEZE-1 d41df8b -> R7B1-FREEZE-2 146ebb8: src/r6-program.mjs (strengthRowsFor guard on every row, eventWeekStandIn lineage, buildWeek records), src/r6-adaptation.mjs (evaluateProgram clinical-first and unknown choices, skillMismatchGap with acceptGap, exerciseSubstitution attempt and nameable, slipsFrom week of next use, newEventStandIns)",
        "C1 QE-R7B1-01, C2 QR7B1-01, C3 QR7B1-02 with R7B1-SSCTR-F11, C4 QR7B1-03, C5 QR7B1-04 with R7B1-SSCTR-F12, C6 QR7B1-05",
        "CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md section Correction cycle (SHA-256 6c61137c...7ba15c)"
      ]
    },
    "approved_scope": "The R7-B.1 runtime binding on R7B1-FREEZE-2: the event-week rule for every row (performed admissible stand-in fitting the equipment of the date, else the slot left out, disclosed; establishment after the post-event week), the clinical screen before any block-choice question, the no-lower-skill question with keeping the equipment or leaving the slot out, review-time disclosure, stored novice templates, the SKILL_MISMATCH fallback direction and the next substitution candidate; F12 decision half, F13 and F14 as conditioned.",
    "conditions": [
      "F12 decision-time half (owner next runtime mission, with Product/UX for presentation): a substitution whose substitute is planned before the event weeks says it enters them only once done, before any use beyond the offline reference",
      "F13 (owner next runtime mission, with Product/UX): the NO_ADMISSIBLE_ALTERNATIVE question offers leaving the slot out, disclosed (R6-SUBSTITUTION C8), and after a SKILL_MISMATCH never offers keeping the exercise as the only option, before any use beyond the offline reference",
      "F14 (owner next runtime mission, with Product/UX): a confirmed no-lower-skill gap that leaves a pattern out of the whole week is disclosed as a loss of that stimulus with the ways back (R6-SUBSTITUTION C8), before any use beyond the offline reference",
      "R18: the event-week rule reads what was performed from the week-start state; a substitute or configuration planned before the event weeks enters them only once performed, which holds only when each elapsed week receives its gating review; every elapsed week receives its gating review before any use beyond the offline reference (recorded condition, unchanged)",
      "Carried with their owners: F6 (Product/Data with Engineering), F7 (recorded deviation), F8 and F10 (next runtime mission), the ceiling-units re-review trigger",
      "R6-POLICY-5, R7B0-CATALOG-2 and the B0 r2 records stay unchanged; R7-B.1 adds no dose"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-NOVICE",
    "decision_id": "R7B-SSCTR-NOVICE",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "B0-C08 c1-c5 (novice density, incl. the lazy start R7B-DECL-16)",
        "B0-C07 c1 and c6 (skill ladders; SKILL_MISMATCH regression)",
        "B0-C01 c1-c10 (graduation, strides optionality; unchanged)",
        "QR7B1-01 (skillMismatchGap with acceptGap)",
        "QR7B1-03 (exhaustion question options)"
      ]
    },
    "approved_scope": "Novice paths on R7B1-FREEZE-2: graduation and its withdrawal, strides optionality, novice density from intake and from a context change (held through later reviews), skill ladders and the SKILL_MISMATCH direction with its questions, practice rows; F13, F14 and F6 as conditioned.",
    "conditions": [
      "F13 (owner next runtime mission, with Product/UX): the NO_ADMISSIBLE_ALTERNATIVE question offers leaving the slot out, disclosed (R6-SUBSTITUTION C8), and after a SKILL_MISMATCH never offers keeping the exercise as the only option, before any use beyond the offline reference",
      "F14 (owner next runtime mission, with Product/UX): a confirmed no-lower-skill gap that leaves a pattern out of the whole week is disclosed as a loss of that stimulus with the ways back (R6-SUBSTITUTION C8), before any use beyond the offline reference",
      "F6: the observation contract records which session was run (owner Product/Data with Engineering) before any use beyond the offline reference",
      "B0-C01, B0-C07 and B0-C08 conditions keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-HYBRID",
    "decision_id": "R7B-SSCTR-HYBRID",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "B0-C11 c1-c8 (CMP.I11, CMP.P04 content stage incl. the week wrap)",
        "B0-C03 c3, B0-C06 c2, B0-C07 c7 placement of first exposures",
        "src/r6-program.mjs buildWeek content stage",
        "src/r6-balanced.mjs interferenceCosts"
      ]
    },
    "approved_scope": "CMP.I11 ranking and the CMP.P04 content stage within the week and across the week wrap on R7B1-FREEZE-2 (carried forward).",
    "conditions": [
      "B0-C11 c1-c8 keep applying unchanged; R7-B and R7-B.1 add no hybrid dose",
      "First exposures that CMP.I11 does not see (a novice-density release, a mid-context re-establishment; R7B-DECL-08) stay acceptable only while CMP.I11 is a LOW ranking cost and those exposures are effort-established at most 2 sets at RIR >= 3"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-TAPER",
    "decision_id": "R7B-SSCTR-TAPER",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "R6-EVENT-TRANSITION as bound (10K, half marathon), C7 and C18",
        "B0-C05 c1",
        "B0-C06 c1 and c8",
        "R6-SUBSTITUTION C5, C6 and C8",
        "B0-C02 c2 and c6; race-day warm-up strides (B0-C01 c8)",
        "src/r6-program.mjs strengthRowsFor (guard on every row), eventWeekStandIn, buildWeek; src/r6-adaptation.mjs exerciseSubstitution, newEventStandIns, eventWeekDisclosure"
      ]
    },
    "approved_scope": "Planned 10K and half-marathon taper, race week, post-event and combined strength taper on R7B1-FREEZE-2, with no first exposure on an event-phase day whatever placed it (substitutions, equipment changes, rotation, rebuilds, earlier missed sessions); the F12 decision half as conditioned.",
    "conditions": [
      "R6-EVENT-TRANSITION C4-C19, B0-C05 c1 and R6-SUBSTITUTION C5-C8 keep applying unchanged; R7-B.1 adds no event dose",
      "R18: the event-week rule reads what was performed from the week-start state; a substitute or configuration planned before the event weeks enters them only once performed, which holds only when each elapsed week receives its gating review; every elapsed week receives its gating review before any use beyond the offline reference (recorded condition, unchanged)",
      "F12 decision-time half (owner next runtime mission, with Product/UX for presentation): a substitution whose substitute is planned before the event weeks says it enters them only once done, before any use beyond the offline reference",
      "\"Keep <exercise> until after the event\" stays available as not adopting a substitution's proposal: it schedules nothing, and the athlete makes the change after the post-event week",
      "Race-day warm-up strides stay optional for the B0-C01 c8 population"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-RETURN",
    "decision_id": "R7B-SSCTR-RETURN",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "R6-NONCLINICAL-RETURN as bound (SHORT, MODERATE, LONG)",
        "R7-A E1",
        "B0-C01 c1 and c7 with R7B-DECL-04 (revised)",
        "B0-C02 c1, c3 and c5 with R7B-DECL-05",
        "QE-R7B-04 (graduation withdrawal on corrected evidence)",
        "QE-R7B1-01 (the clinical screen before any block-choice question)"
      ]
    },
    "approved_scope": "Returns after nonclinical interruptions and evidence corrections on R7B1-FREEZE-2, with the clinical screen before any block-choice question (F8 as conditioned; carried forward).",
    "conditions": [
      "F8: a completed bouts session counts toward currency whatever its response, the gate decides repeat or withdrawal, and the replacing session states the actual reason (owner next runtime mission) before any use beyond the offline reference",
      "R6-NONCLINICAL-RETURN, B0-C01 c7 and B0-C02 c3/c5 keep applying unchanged"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-DOSE",
    "decision_id": "R7B-SSCTR-DOSE",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "R6 goal doses, establishment and phase doses as bound (R6-EVENT-TRANSITION C7 and C18; R6-SUBSTITUTION C6)",
        "B0-C03 c1, c2, c6; B0-C04 c4, c5; B0-C05 c1, c2; B0-C08; B0-C09",
        "Correction cycle: the event-week rule for every row (stand-in dose: strengthDose of the stand-in configuration in the slot role and day phase); the confirmed no-lower-skill gap"
      ]
    },
    "approved_scope": "Strength and run dose boundaries and B0 representation rules on R7B1-FREEZE-2, including event-week stand-ins at their own reduced dose and confirmed no-lower-skill gaps (F7 and F10 as recorded).",
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
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
      "A relevant new systematic review or meta-analysis",
      "V1 population, objective or scope change",
      "Adverse event or runtime inconsistency observed in a later gate",
      "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
    ]
  },
  {
    "queue_id": "HQ-R7B1-SSCTR-DECLARED",
    "decision_id": "R7B-SSCTR-DECLARED",
    "decision_revision": "R7B1-SSCTR-r2",
    "target": {
      "project": "MyApp / Vilumo Fit",
      "artifact": "CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json",
      "artifact_revision": "R7B1-FREEZE-2 (freeze commit 146ebb80c51d302ef3518a61c1cab208c7778632, bytes of f6525e7907680990ecbdbaf067c34fb0ec641d13; source digest f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612; manifest digest 980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8; previous R7B1-FREEZE-1 d41df8b129495e32fe2923087d665798854609e9, source 976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9; predecessor R7B-RUNTIME-REPERTOIRE-FREEZE-2 10b26d6e40542a066f7f100fbf16060b66e15aee; policy R6-POLICY-5 18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c; catalog R7B0-CATALOG-2 ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9; B0 r2 records 6867d3e89ebd4bb309c018fb456508d3a4510038194269769b0a4ef16f23d885)",
      "sha256": "e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5",
      "rule_ids": [
        "CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md section 3 (SHA-256 110006b6...9acb): R7B-DECL-04 (revised), -05, -13, -14, -15, -16",
        "CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md section 4: R7B-DECL-01 ... 12",
        "CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md B1, B2 and the correction cycle C1-C5"
      ]
    },
    "approved_scope": "Declared interpretations R7B-DECL-01 ... 16 as bindings on R7B1-FREEZE-2 (R7B-DECL-13 inside the event weeks under the every-row rule; R7B-DECL-14 after the clinical screen; F8 and F6 as conditioned).",
    "conditions": [
      "R7B-DECL-05: F8 before any use beyond the offline reference (owner next runtime mission)",
      "R7B-DECL-03: F6 routed (owner Product/Data with Engineering)",
      "R7B-DECL-13 inside the event weeks applies under the every-row rule as frozen, with the F12 decision half, F13 and F14 routed",
      "R18: every elapsed week receives its gating review before any use beyond the offline reference (recorded condition); the ceiling-units question is a re-review trigger for the next policy revision"
    ],
    "approval_date": "2026-10-31",
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
    "owner": "Chief / Founder",
    "human_review": null,
    "re_review_triggers": [
      "Any byte change to a file bound by RUNTIME_FREEZE_R7B1_2.json, to R6-POLICY-5, to R7B0-CATALOG-2 or to the R7B0-SSCTR-r2 records",
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
