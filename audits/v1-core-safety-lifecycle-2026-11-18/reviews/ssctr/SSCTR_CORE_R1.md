# SSCTR review R1: Core Safety & Lifecycle candidate (2026-11-18)

**Verdict: NOT_READY.** One item is blocking: SSCTR-CORE-B-01 in item (b). Items (a), (c) and (d) are approved with conditions. Item (e) names one undeclared change, judged in (c), and one regression, B-01.

## 0. Reviewer, authority, target

- **Reviewer:** a fresh instance of the project's SSCTR role, running in a subagent (claude-opus-5-5). Agent SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, skill sports-science-review 1.0.0.
  - Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical decisions only. I hold no human credential.
  - No human review, no empirical validation and no clinical judgment took place. I delegated nothing.
  - Independence: I did not write the candidate, the tests or the repro scripts. The rules L1 to L5 (`SSCTR_RWS_LINEAGE_ITEMS.md`) were written by other instances of this role. Here I judge whether the candidate meets them; I do not reopen them.
- **Target:** commit `0b8e45a67d4595b34f46ec05e576ff6ea37f0064`, compared with base `16577b6`. I judged it as dispatched.
- **Commit `f3a88718…` came in during this review.** The worktree moved to it, and §7 covers it. It changes only how the restart namespace is computed, in `src/r6-index.mjs`. My probes before §7 ran on the `0b8e45a` engine. In those runs the namespace was `r1670a9b911`; on f3a8871 it is `r404a1c3300`.
- **SHA-256 of the reviewed files, from the git objects at 0b8e45a:**

  | File | SHA-256 |
  |---|---|
  | `src/v1-safety-index.mjs` | `1b4ad360…7979928` |
  | `src/r6-provenance.mjs` | `abab1e6c…3bab292` |
  | `src/r6-adaptation.mjs` | `5f0f95d8…2aca81` |
  | `src/r6-index.mjs` | `d349da49…6299228` (`a49388b3…4d363550` at f3a8871) |
  | `src/r6-program.mjs` | `d8610065…27be786f` |
  | `src/boundary/report-voices.mjs` | `9e000875…2239405` |
  | `CANDIDATE.md` | `ec0c3782…7e04ee086` |
  | `REGRESSION.md` | `0641b1ad…88db06e45` |

  The full hashes are in `SSCTR_CORE_R1.json`.

- **What I read:**
  - the constitution, the skill, and the section headings of `CURRENT_MISSION.md`;
  - `CANDIDATE.md` and `REGRESSION.md` (f3a8871);
  - the whole diff;
  - `APP_DATA_CONTRACTS.md` L-APP-06 and L-APP-08;
  - `IOS_RUN_REPORT_INTEGRATION_CONTRACT.md` §§1–7;
  - `SSCTR_RWS_LINEAGE_ITEMS.md` (L1–L5) and `E01_PATCH_CLOSURE.md` (QRE-RWS-F-01);
  - the R6 adaptation of `SSCTR_V1RWS_E01_PATCH_R6.md`;
  - the clinical precedence in `v1-strength-index.mjs`;
  - the screen reader in `v1-run-format-index.mjs`.
- **What I ran** (Node 24, Windows; nothing in the repo was edited):
  - `node --test test/v1core-*.test.mjs`: 47/47 pass;
  - the three repro scripts, with entry `v1-safety-index.mjs`;
  - `test/v1rws-e01.test.mjs`: 4 failures, all the E-1 reading change;
  - the heat / walk-breaks test of `v1rws-lineage`;
  - my own probes, kept outside the repo in the session scratchpad `…/scratchpad/ssctr-core-r1-probes-7f3a/`: `p-expiry`, `p-restart`, `p-latestop`, `p-restart-dose`, `p-restart-expiry`, `p-e1`, `p-e1-symptom2`, and an as-if variant of the heat / walk-breaks lineage test;
  - a `git archive` of `16577b6` in `…/scratchpad/ssctr-core-r1-base-16577b6/`, used as the comparison base.
  - I did not run `npm run verify` or any `verify-r*`, and I did not touch the human queue.
- **Literature access:**
  - Web search works. PubMed and PMC full text returned only an interstitial page, so I read no full text.
  - Search snippets found Saw, Main & Gastin, *BJSM* 2016;50:281–291 (doi 10.1136/bjsports-2015-094758). It reports that subjective measures were more sensitive to training load than objective ones, and it is supporting context only.
  - No disposition below rests on literature. The items are about precedence, identity and lineage under rules already decided (G04 clinical route, L1, L5). None of them asks for a new training rule, dose or threshold, and I create none.

## 1. Dispositions

| Item | Disposition | Evidence status | Blocking? |
|---|---|---|---|
| (a) clinical precedence after the authority's review-by date | APPROVE_WITH_CONDITIONS | WELL_SUPPORTED, by execution against the existing clinical route (no new scope) | no |
| (b) restart identity | **REVISE** | the crediting part is WELL_SUPPORTED by execution; the screen regression is shown by execution | **yes: SSCTR-CORE-B-01** |
| (c) E-1 as-if re-merge, conflict path, RWS consequence | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS: Core shown by execution; real HealthKit re-sync not measured | no |
| (d) RFC-NUMERIC-1, policy A | APPROVE_WITH_CONDITIONS | WELL_SUPPORTED (arithmetic: a relative 1e-12 is far below any shown resolution) | no |
| (e) changes beyond what CANDIDATE.md declares | FINDING | see §6 | B-01 |

## 2. (a) Precedence after the review-by date

**What I checked.** After 2027-04-30, read as a UTC day, `v1-safety-index.mjs` re-reads the review with the record dates set aside. It does this only when the dates are the sole cause of the refusal. From that re-read it takes only one kind of answer: CLINICAL_HUMAN_REQUIRED with no proposal.

**Execution (`p-expiry`).** The same plan was reviewed on 2027-04-29 and on 2027-05-03. The entry below the new one answers UNSUPPORTED to every case after the date.

- All 15 warning signs, one at a time, plus a WELLBEING_CHECK with a sign: CLINICAL_HUMAN_REQUIRED before and after the date, never with a proposal. Reason, action, guidance and `warningSigns` are identical, and so is the result's key set apart from `authorityExpiry`. The clinical record fact is kept (record rows pre = post).
- Eligibility pain, eligibility injury, pain with an exercise substitution, and a clinical interruption reason on a return: the same, identical before and after.
- "Not 100%" with no sign: KEEP before, UNSUPPORTED after. Nothing is prescribed after the date.
- A hold recorded on 04-28, then a readiness declaration on 05-03: CLINICAL_HUMAN_REQUIRED, "Prior clinical dependency is preserved". `referenceState.pending` stays CLINICAL_HUMAN_REQUIRED, the next weekly review is still clinical, and no release or plan is made.
- A restart after the date: CLINICAL_HUMAN_REQUIRED when a hold is on record; with no hold, no plan is made.
- Missing, altered or vetoed records, or a caller's own repertoire: UNSUPPORTED, with no `authorityExpiry` (test file, passes).

**Judgment.** This adds no clinical scope. The answer given after the date is the engine's own pre-date answer, byte for byte, apart from the marker. No new sign, criterion, wording or route is added, and nothing else gets through: no progression, release, plan or proposal. It matches the precedence the strength extension already has, and it answers L-APP-08: the clinical route comes before the authority check, and the refusal of everything else stands. Keeping an integrity failure UNSUPPORTED is the right engine behavior, because an engine whose bound authority is missing or altered cannot be trusted to screen. The cost of that falls on the app, so I set condition A-C3.

**Conditions:**
- **A-C1 (before integration).** The integration calls only `v1-safety-index.mjs`, with no options.
  - The AIF harness `harness/lib.mjs` still imports `v1-strength-index.mjs`. So does the expiry section of `repro/repro-p0.mjs`, whatever entry argument it is given; run with `v1-safety-index.mjs` it still prints `signAfter: UNSUPPORTED`.
  - Any app path built on that harness keeps the defect.
- **A-C2 (app).** After the date, a run report with a symptom stop is answered UNSUPPORTED.
  - That answer still carries `runFormat.warningSignScreen: REQUIRED` (observed), but the engine returns no record for it.
  - The app must show the screen request and keep the report for when an authority is in force again. It never shows the state as rest (V1CIB §3).
- **A-C3 (Product/UX, Security, G04 human owner).** A review that carries a warning sign and is refused for integrity (UNSUPPORTED) needs an engine-independent path to the existing G04 warning-sign guidance.
  - The wording stays CLINICAL_HUMAN_REQUIRED and belongs to the human owner, not to me.
- **A-C4 (QRE).** The readiness test accepts either `CLINICAL_HUMAN_REQUIRED` or `UNSUPPORTED`. It should pin what I observed: CLINICAL_HUMAN_REQUIRED, and `referenceState.pending` still CLINICAL_HUMAN_REQUIRED.
- **A-C5.** Renewing the R7B0 records before 2027-04-30 remains the primary control. This precedence is a fallback, not an extension of authority.

## 3. (b) Restart identity

**Accepted, by execution:**
- **Plan B is not credited with plan A's executions.**
  - On the base, plan B's week 0 reports collided with plan A rows of the same id: `completed: 0`, MODIFY / GATED_NEXT_STEP (`p-restart-dose`, base).
  - On the candidate, plan B's own six reports are credited: KEEP / INSTANTIATE_LOGGED_LOADS.
  - The progression gate ("previous comparable sessions executed without adverse response") reads the athlete's own exposure in the plan in force. This is the existing rule applied to correct identities, not a new rule.
- **Plan B's doses are unchanged by the namespace.** With ids stripped, the restart plan is byte-identical to the base's in both variants, on 0b8e45a and on f3a8871. A four-week plan B journey with no plan A reports is identical to the base at every step.
- **Earlier-plan rows are kept with their own context.** For example, `w0-run-d1` keeps sport RUN and type RUN:EASY.
- **A late earlier-plan report is credited to nothing** (UNPLANNED, `completed 0`, `adverse 0` in plan B's week). Plan B was built from the record at restart, and no rule re-plans plan B from late pre-start evidence. I add none. Its first week does not exceed current practice.

**SSCTR-CORE-B-01 (BLOCKING, safety signal).** A symptom stop reported late for an earlier plan's session no longer asks for the warning-sign screen.

- **Reproduction (`p-latestop`).** A plan A week-1 run is reported after the restart, on plan B's day 0, with `stop: SYMPTOM`.

  | | Screen, that review | Screen, next review | Late row |
  |---|---|---|---|
  | Base `16577b6` | REQUIRED | REQUIRED | re-bound to plan B's session (wrong binding) |
  | Candidate `0b8e45a` | NOT_RAISED_BY_THIS_EXTENSION | NOT_RAISED_BY_THIS_EXTENSION | `{sessionType:'UNPLANNED'}`, no sport |
  | `f3a8871` | NOT_RAISED_BY_THIS_EXTENSION | NOT_RAISED_BY_THIS_EXTENSION | as at 0b8e45a |

  - The candidate result holds with and without the review's own eligibility.
  - The control, the same stop on a planned session with no restart, gives REQUIRED on every tree.
- **Cause, read in `v1-run-format-index.mjs`.** Neither of the two sources the screen reads ever sees this stop:
  - report facts and `requested` come only from reports whose session is planned in the plan in force (`planned.get(o.sessionId)?.sport==='RUN'`);
  - the recorded stops (`rowStops`) require `context.sport==='RUN'`.
- **Why it blocks.** The rule is decided:
  - the symptom stop stays outside every lineage reading ("only a screen answered afterwards removes it": L1; contract §5);
  - L5 asks only that the signal is not lost.

  The restart change creates a path where it is lost. The base raised it only by accident, through the wrong binding, but the athlete's safety signal must not depend on that.
- **What a fix must show.** I am not designing code, and no screening criterion is added. With result tests:
  - a symptom stop declared in any run report of this athlete, received or recorded, asks for the existing screen until a later answered screen, whatever plan the report's session belongs to;
  - the cases are a late report, a late correction of an earlier-plan report, with and without eligibility in that review, after persist and restore, and with a third plan;
  - the screen content stays the existing one (G04, CLINICAL_HUMAN_REQUIRED for any clinical sufficiency).

**Observation O-1 (pre-existing, unverified cause; not this line).** An unplanned run with no session id and `stop: SYMPTOM` gave ASK with no `warningSignScreen` on both trees. I did not establish whether this comes from the screen or from my probe's report shape. I route it to the Chief for a check under the same rule as B-01.

## 4. (c) E-1: as-if re-merge, conflict path, RWS consequence

**L5 at the Core, in the two-report form.** Checked by execution in `p-e1`: cases ADVERSE, FATIGUE, HEAT, walk breaks and SYMPTOM, sent in two reviews and in one.

- The review that applies the device re-sync gives the same decision as the as-if control (corrected device report plus the athlete's report from the start). That covers status, action, proposal hash, `adverseSessions`, `completed`, calibration hash and withheld list. It also gives the same decision as the run with no correction at all, and so does the following Sunday review.
- The live row keeps recovery, effort, rpe, `conditions: ['HEAT']`, `walkBreaks` and `stop: SYMPTOM`. These are L5 item 1 and item 3.
- **Screen (`p-e1-symptom2`, no later eligibility answer).** `warningSignScreen: REQUIRED` stays raised:
  - after an agreeing re-sync;
  - after a conflicting re-sync;
  - after the athlete edits the stop reason to PACING.

  This is L5 item 2, and it matches the decided rule that only a later answered screen removes the stop.

**Conflict path.** A correction that disagrees with a report in force is quarantined, not resolved by arrival order.

- The execution is not credited (`completed` 5 instead of 6). Its athlete response is not counted in `adverseSessions` (0). The screen stays raised.
- In my scenario the Sunday decision was identical (same proposal hash).
- Compared with the base, which credited the device row and lost the athlete's response, this is no less conservative. It equals the R7-A quarantine and L2 ("a refused report is in force and on no row").
- One adverse response of a quarantined execution does not count towards "repeated adverse". I acknowledge this and create no rule for it.

**RWS consequence (REGRESSION.md: 16 tests; CANDIDATE.md §3.4 named one).**
- **This is the reading L1 decided.** L1 withholds only "a row that does not carry every report in force"; "on the row that carries them all, the reading is today's".
  - With E-1, a re-synchronized row carries every report in force, so its reading returns to the merged row's.
  - The return path was anticipated: "make the import not arrive as a bare `correctionOf`, (the minimum of L5)" (L1 r2, §3).
  - It reduces the L1-f cost and adds no evidence the merged row did not have.
- **Verified:**
  - **heat / walk breaks** (as-if variant of the lineage test, three orders): after the re-sync the row keeps HEAT or walk breaks, and its word and easy band equal the merged row's. That is `[345,420]` with HEAT or walk breaks, and `[345,575]` for the athlete who said nothing. The latter is legitimate easy evidence that L1 used to withhold as a cost;
  - **D-01:** the runtime and the oracle both give SEVERAL_RECORDINGS, which still withholds;
  - **v1rws-e01:** the rows return to the merged control's calibration (`[300,335]` threshold). The bare-record contamination `[290,325]` is gone. The words are SEVERAL_RECORDINGS or CORRECTED_MEASUREMENT, and those still withhold.
- **Correction to CANDIDATE.md §3.4.** "The run is read for pace evidence again" overstates it. The run is read **as if no correction had happened**, and that reading can still withhold it: device POOR, several recordings, corrected measurement, HEAT, walk breaks.
- **L1-a** ("the lineage only withholds") applied to the L1 rule itself, which is unchanged. I expressly accept that rows recorded with parts no longer meet the not-carried condition.

**Conditions:**
- **C-C1 (before freeze; QRE judges strength).** All 16 failing tests are declared by design. The successor tests restate each scenario as the as-if invariant: the post-re-sync reading (word, `wholeRow`, band edges, history reference, race evidence, sizing source) equals the merged row's before the re-sync, or the direct merge's. No assertion is dropped without restatement.
- **C-C2.** Merged rows without parts (recorded before this line) keep the E-01 `REPORT_NOT_CARRIED` withholding, with a test. Before a real athlete, no stored record predates the line.
- **C-C3 (before integration).** L5's single-report form is closed only by refusing mixed reports at ingest.
  - `checkReportVoice` is not called by custody or the harness today.
  - It must be enforced on the ingest path, with adapter outcome tests K1, K4, K5 and MANUAL with an activity id.
  - Until then, the single-report form of E-1 is not met.
  - The open field for an athlete-stated surface keeps its owner (Product/Data).
- **C-C4 (Product/UX; integration).** A conflicted execution is shown to the athlete for resolution, by either voice's correction. Its frequency is counted with the L1-f fraction (SSCTR-RWS-F-03). If it is material, re-review.
- **C-C5.** The real HealthKit re-sync behavior is unmeasured, so the hard gate E-1 for real athletes closes only with the adapter's own result tests (contract §6), not with these Core tests.

## 5. (d) RFC-NUMERIC-1, policy A

`runForecast` is read only by the forecast modules. No prescription, dose or gate reads it, and Pace Revision is off and not approved.

- Every shown value is an integer of seconds.
- A relative difference of ≤ 1e-12 on a race time of about 3000 s is about 3 ns, far below any meaningful forecast precision.
- The test perturbs exp, log and pow by ±1 ULP and keeps persisted state, statuses and integers identical.

**Conditions:**
- **D-C1.** The forecast stays descriptive. If any prescriptive reader ever consumes a forecast number, or Pace Revision is enabled, this item is re-reviewed.
- **D-C2.** The two-race `**` branch is confirmed on the device run (Mac package).

## 6. (e) Changes beyond what CANDIDATE.md declares

1. **Undeclared, judged in (c):** the RWS pace evidence, calibration, history and race readings of re-synchronized rows (16 tests, not 1). This is a material change to readings, accepted as L1's own merged reading, with conditions C-C1 to C-C5.
2. **Undeclared regression:** the lost symptom-stop screen for late earlier-plan reports (B-01).
3. **No change found to prescription rules, dose, progression gates, interference, recovery criteria or holds.** Evidence:
   - plan B doses are identical to the base;
   - the plan B journey is identical when plan A has no reports;
   - E-1 decisions equal the no-correction control in all ten combinations;
   - clinical answers after the date are identical to before, and holds are kept.
   - The locale change affects only tie-break order at six sort sites. I read it, and I relied on the author's byte-identical oracles rather than reproducing them.
   - The error-class text and `report-voices` carry no sporting rule.
4. The crediting of plan B's own week 0 changes plan B outputs relative to the base. That is the correction of the defect, not a new rule.

## 7. Commit f3a8871

The namespace is now `hash({intake as sent, instant})` instead of the normalized intake.

- I re-ran on f3a8871: plan B doses and the four-week journey are identical to my 0b8e45a runs.
- **B-01 reproduces unchanged.**
- **No disposition changes.**

## 8. The ten AE questions (items b and c)

1. **Adequacy:** the plan in force stays adequate. No dose changed.
2. **Facts and provenance:** E-1 keeps per-report parts. The restart separates plan identities.
3. **KEEP and what is unknown:** KEEP is defensible except where a stop signal is lost (B-01).
4. **Necessity:** the changes are needed against base defects that were reproduced.
5. **Smallest sufficient intervention:** identity and lineage only.
6. **Smaller alternatives:** re-presenting the athlete's report does not suffice (L5). Client-side scoping by date does not reach the engine.
7. **Priority and progression:** preserved. The credit now goes to the right plan.
8. **Evidence for conclusion and dose:** no dose was approved. The conclusions rest on decided rules and on execution.
9. **Remaining uncertainty:** real HealthKit re-sync behavior, the frequency of conflicts, JavaScriptCore.
10. **ASK / HOLD / CLINICAL:** clinical content stays CLINICAL_HUMAN_REQUIRED, unchanged. B-01 must restore the existing screen request.

## 9. Record

- **Proposed human-revalidation entry (not appended; the queue is untouched):** `HQ-CORE-SSCTR-C`, for the E-1 return of re-synchronized rows to the merged pace-evidence reading.
- **Re-review triggers:**
  - the B-01 fix (one narrow recheck);
  - the adapter result tests (C-C3, C-C5);
  - renewal or change of the R7B0 records;
  - any change to the clinical route or the screen reader;
  - any prescriptive consumer of the forecast;
  - a material conflict or L1-f fraction.
- **Gate:** this review closes no gate and publishes no Product Truth. Its output is item-level dispositions for the Chief.
