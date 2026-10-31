# R7-B narrow recheck handoff — R7B-RUNTIME-REPERTOIRE-FREEZE-2

To the three independent judges of FREEZE-1 (SSCTR, Engineering, Quality). This is the **one narrow recheck** the Founder loop bound allows (`audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`, applied by the task contract). Judge the frozen bytes of FREEZE-2 only, and only:

1. whether each finding of your FREEZE-1 review that blocked your gate is resolved on these bytes;
2. whether the fix-cycle delta (FREEZE-1 → FREEZE-2) introduced a defect inside your gate's scope.

Areas the delta does not touch are not reviewed again. A finding that is still blocking after this recheck closes R7-B **NOT_READY with an explicit blocker**; there is no further cycle.

## 1. Identity

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-2, record [RUNTIME_FREEZE_R7B_2.json](RUNTIME_FREEZE_R7B_2.json): source digest `d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241`, manifest digest `d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a`, 105 files, bytes of `d03025b` |
| Predecessor | FREEZE-1 `4995d58` (source `791b5311…`), superseded; it verifies only at its own commit |
| Reviews answered | committed at `0fb1339`: `audits/domain-coaching-r7-b-2026-10-31/reviews/{ssctr,engineering,quality}/` |
| Fix commits | `4873c5d` (runtime, tests, scripts, conformance matrix R7B-CONFORMANCE-2) and `d03025b` (the first FREEZE-2 attempt refused on surviving mutants M17 and M25: an unreachable branch removed, M25 re-targeted, one test added) |
| Verify | from `CoachingCore/`: `node scripts/verify-r7b.mjs --freeze 2 [--tests]` (read-only; never `--write`) |
| Delta | `git diff 4995d58 d03025b -- CoachingCore/src CoachingCore/test` (5 runtime files, 1 new suite of 19 tests, 1 changed test) |

Policy R6-POLICY-5 `18ec48f3…`, catalog R7B0-CATALOG-2 `ceee276a…`, its schema and the 13 B0 SSCTR r2 records are byte-identical to the B0 closure (the freeze refuses otherwise). R7-B adds no dose.

## 2. What changed, per finding

| Finding | Gate | Change (where) | Test (`test/r7b-review-fixes.test.mjs`) |
|---|---|---|---|
| QE-R7B-01 (BLOCKER) | ENG | A slot replays every recorded decision on it in order, starting from its natural pick as if nothing were set aside; a decision also names the slots where its configuration was in use (rotation included); a set-aside configuration is never the result. The substitution is ASK unless the plan prescribes what it selected. (`r7b-repertoire.mjs` buildTemplates; `r6-program.mjs` slotsInUse; `r6-adaptation.mjs` exerciseSubstitution) | QE-R7B-01 (incl. the engineering grid) |
| QE-R7B-02 / Q-R7B-01 | ENG / QUA | A configuration a decision put in a slot holds from its first week: the calendar counts turns from that week; rungs below a reached configuration on its chain are never rotation alternatives. (`rotationFor`; buildTemplates `surpassed`, `ladderBelow`) | Q-R7B-01 / QE-R7B-02 (three cases × cadences, incl. the reverse-lunge EVERY_2_WEEKS case) |
| QE-R7B-03 | ENG | The PlanningView takes the novice density cap from the evidence reducer, never from the projection. (`planningBase`) | QE-R7B-03 (A3 correction; A3b substitution, equipment and schedule change, the latter judged from the first week it plans) |
| QE-R7B-04 | ENG | Before any decision, a graduation is re-checked: its qualifying weeks judged as at the boundary (its gates' clock) with the facts as they now stand. If one no longer qualifies the graduation leaves the contexts from this week (`runGraduationWithdrawn` keeps the record), the threshold ladder leaves the sessions ahead, executed sessions stay history, a later block review can graduate again; a state carrying a withdrawn graduation returns to easy running. (`graduationWithdrawal`; `advanceRun`) | QE-R7B-04 (adverse and 10-minute corrections, the introduction-week review, the boundary control, an unrelated correction) |
| QE-R7B-05 | ENG | The cap starts in the planner and the reducer alike when a context change raises a strength-NONE athlete above two days before the first development-block boundary. (`densityCappedAt`, `firstStrengthBoundary`, `advanceStrength`, `contextAfter`) | QE-R7B-05 |
| QE-R7B-06 | ENG | Two changes of one exercise at one boundary are ASK in every order; nothing is recorded from an unapplied step. (`blockBoundary`) | QE-R7B-06 |
| QE-R7B-07 | ENG | A configuration set aside for a reason is never offered or accepted again (ladder step or MAIN change). | QE-R7B-07 |
| QE-R7B-08 | ENG | Choices must be a list (else HOLD) of known kinds (else ASK); block choices are applied only by the weekly review of a complete week (else ASK); an unknown substitution target is ASK. (`evaluateProgram`) | QE-R7B-08 |
| QE-R7B-09 / -10 | ENG | The review-by date is the UTC calendar date of the instant; a record bound to the catalog that does not enable vetoes its candidate. (`repertoireAuthority`) | QE-R7B-09 / QE-R7B-10 |
| QE-R7B-11 | ENG | The intake's 5K fallback reads the planner's repertoire authority. (`canonicalizeIntake`, `generateProgram`) | QE-R7B-11 |
| QE-R7B-12 | ENG | Matrix R7B-CONFORMANCE-2: the contradicted entries cite plan-level tests; `fixCycle` lists every finding's disposition. | conformance PASS |
| Q-R7B-02 | QUA | The QUALITY_AFTER_EVIDENCE trace states the path per class (`path`: GRADUATION_AT_BLOCK_REVIEW for WALK_JOG, RESTART, EASY_LOW; NONE_IN_V1 otherwise); EASY_UNKNOWN is told it has no harder session in this plan. No new path is invented. (`feasibilityOf`) | Q-R7B-02 |
| Q-R7B-05 | QUA | Two slots of one pattern at practice dose give one practice row. (`strengthRowsFor`) | Q-R7B-05 |
| Q-R7B-07 | QUA | PULL_LIMITED_FOR_EQUIPMENT and MOVEMENT_PATTERN_UNAVAILABLE carry `limit` (SKILL or EQUIPMENT) and offer only equipment that would add the pattern at the athlete's skill. (`buildTemplates`, `pullCoverageDisclosure`, `generateProgram`) | Q-R7B-07; test change #7 |
| R7B-SSCTR-F1 | SSCTR | Graduation sets `qualityNeeds` to qualityRequiresEstablishedEasyWeeks (the EASY_CURRENT value): the introduction is unchanged (its qualifying weeks are established easy weeks) and after a restart quality waits the two established easy weeks. (`advanceRun`) | SSCTR R7B-F1 (graduated vs EASY_CURRENT comparator, p12 timeline) |
| R7B-SSCTR-F2 | SSCTR | The familiar task is current through `policy:operational.return.moderateMaxDays` (28) after its last performance (intake observation, then each executed bouts session); a week that ends beyond that has no bouts and the state lapses them. (`initialRunState`, `runRow`, `advanceRun`) | SSCTR R7B-F2 (p14 A observed dates; 10K and half-marathon NEXT_BLOCK) |
| R7B-SSCTR-F3 | SSCTR | The introduction week keeps last week's strides count; race-day warm-up strides are optional where strides are optional. (`runRow`; `racePrescription`) | SSCTR R7B-F3 |
| R7B-SSCTR-F4 | SSCTR | The CMP.P04 content stage also sees next week's day-0 long run, or day-0 quality run while quality is active, from next week's arrangement. (`buildWeek`) | SSCTR R7B-F4 (p20 B2) |
| R7B-SSCTR-F5 | SSCTR | The threshold session that replaces paused bouts says why and that it is a different, lower stimulus (`replaces: FAMILIAR_REPEATED_BOUTS`). (`distributeRun`, `buildWeek`) | SSCTR R7B-F5 (break lapse; adverse withdrawal) |

## 3. Declared interpretations (revised or new)

| Id | Item |
|---|---|
| R7B-DECL-04 (revised, F1) | Graduation lives in the context from its week and is re-applied by later transitions under that context; it makes the athlete EASY_CURRENT for quality eligibility, so after a restart quality waits qualityRequiresEstablishedEasyWeeks executed easy weeks as for EASY_CURRENT; a graduation whose qualifying evidence is corrected away is withdrawn (QE-R7B-04). |
| R7B-DECL-05 (conditions F2, F5) | Familiar bouts start after the two established easy weeks and only while the task is current at the prescription date (28 days from its last performance, the R6 intake currency, `return.moderateMaxDays`); the fallback is disclosed. |
| R7B-DECL-13 | A block-boundary step or a substitution applies to the slots where its configuration was in use (rotation included) and to slots whose natural pick it is; the substitution is asked if the plan would not prescribe the selection. |
| R7B-DECL-14 | Block choices are accepted only in the weekly review of a complete week (the boundary step); anything else is asked or held, never dropped. |
| R7B-DECL-15 | Records: a non-enabling record bound to the catalog vetoes its candidate; the review-by comparison uses the UTC date of the decision instant. |
| R7B-DECL-16 | The novice density cap starts lazily (planner and reducer) when a context change raises a strength-NONE athlete above two strength days before the end of the first development block; after that boundary no cap starts. |

## 4. Recorded, not fixed in this cycle (owners)

| Item | Disposition | Owner |
|---|---|---|
| R7B-SSCTR-F6 (observation contract cannot say which session was run) | ROUTED | Product/Data with Engineering, before any use beyond the offline reference |
| R7B-SSCTR-F7 (calf alternation chosen before the time fit) | RECORDED_DEVIATION (matrix `SSCTR:B0-C05#c2`) | Next runtime mission |
| R18 (every elapsed week gets its gating review) | RECORDED_CONDITION | Product/Engineering client contract |
| Ceiling units (time vs distance spikes) | RE_REVIEW_TRIGGER | Next policy revision |
| Q-R7B-03, -04, -06, -08…-11 | ROUTED / RECORDED_DIVERGENCE (matrix `witness:WP-STR-06`) | Next catalog and matrix revision; Q-R7B-04 and -06 with the SSCTR |
| QE-R7B-OBS-01…05 | ROUTED | OBS-04 (substitution introduces a never-performed configuration in TAPER or RACE_WEEK) to this SSCTR recheck; the rest to the next runtime mission |

## 5. Evidence on FREEZE-2 (author evidence, not a gate)

In the freeze record: suite 733/733; conformance PASS (301 entries, matrix R7B-CONFORMANCE-2); differential regression against the R7-A predecessor 83 programs, 77 changed, 0 dose findings, 0 status differences; informational differential against FREEZE-1 31 programs changed, 0 rises; bounded mutation probe 24/25 killed, M13 equivalent as before (M15 re-anchored to its moved fragment; M16–M25 each undo one fix). Read-only verification `node scripts/verify-r7b.mjs --freeze 2 --tests`: 20/20 PASS.
