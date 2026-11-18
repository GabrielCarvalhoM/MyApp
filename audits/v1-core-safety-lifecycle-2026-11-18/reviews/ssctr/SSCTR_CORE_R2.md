# SSCTR narrow recheck R2: Core Safety & Lifecycle, cycle 1 (2026-11-18)

**Verdict: NOT_READY.** The cause of B-01 is closed on every path the cycle tested. One path it did not test still loses the symptom-stop signal, and that residual is blocking: SSCTR-CORE-B-01-R (§1).

The other three points of this recheck are settled:

| Point | Outcome |
|---|---|
| The historical test change (fix-forward:316) | ACCEPTED |
| A-C4 (readiness status after the date) | CLOSED |
| C-C1 (the 16 RWS failures) | as-if acceptance CONFIRMED; the condition stays open (§3) |
| C-C2 (rows without parts) | stays a non-blocking condition |
| QRE-CORE-06 | changes nothing in item (a) |

This is a narrow recheck of the four points the Chief named, and nothing else.

## 0. Reviewer, target, method

- **Reviewer:** the same SSCTR instance as R1 (claude-opus-5-5; SSCTR-1.0.0 / SSCTR-CONST-1.0.0). This makes R2 a recheck of my own R1 findings against code that another author changed. It is not independent of R1.
  - Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical decisions only.
  - No human review, no clinical judgment. I delegated nothing.
- **Target:** commit `430c493770cb1149555862078c12fbb07569a336`. I also read `CYCLE1.md` and `REGRESSION.md` at `6f747f2`. `src/` and `test/` are identical between the two commits (empty `git diff --stat`).
- **SHA-256 of the files at 430c493 (git objects):**

  | File | SHA-256 |
  |---|---|
  | `v1-safety-index.mjs` | `1f813cb0…a1c7f` |
  | `r6-provenance.mjs` | `3ef1dadf…ed0180b` |
  | `v1-run-format-index.mjs` | `b7ab3119…2cfa5bc` |
  | `r6-adaptation.mjs` | `c82c5e11…26857ee` |
  | `r6-index.mjs` | `a49388b3…4d363550` |
  | `v1core-cycle1.test.mjs` | `ecad9794…9fd8c87` |
  | `CYCLE1.md` | `219f8cfb…6a492436` |
  | `REGRESSION.md` | `34b696ad…acaae7f` |

  The full hashes are in `SSCTR_CORE_R2.json`.
- **What I ran** (Node 24; nothing in the repo was edited):
  - `node --test test/v1core-*.test.mjs`: 57/57 pass.
  - I re-ran the R1 probes on this tree: `p-latestop`, `p-expiry`, `p-e1`, `p-e1-symptom2`, and the as-if variant of the heat / walk-breaks lineage test.
  - I added these probes, all in the session scratchpad `…/scratchpad/ssctr-core-r1-probes-7f3a/`:
    - `p-r2-ask`: a stop sent in a review the engine does not accept;
    - `p-r2-06`: the clinical answer after the date, with a symptom stop;
    - `p-r2-resolve`: conflict resolution after a re-sync;
    - `p-r2-legacy`: RWS withholding for rows without valid parts;
    - `ff-signal-r2`: a scratch copy of the historical fix-forward test with only the one expectation under judgment changed.
  - I did not run any `verify`, and the human queue is untouched.
- **Literature:** none needed. No point asks for a sporting rule, dose or threshold.

## 1. SSCTR-CORE-B-01: REVISE (residual blocking)

**Closed by the cycle (verified by `p-latestop` and the cycle test).** A symptom stop reported late for a plan A session after a restart asks for the existing screen and names the session:

| Path | Screen |
|---|---|
| A review with eligibility | REQUIRED |
| The next review | REQUIRED |
| A late correction | REQUIRED |
| After a restore | REQUIRED |
| After a third plan | REQUIRED |

The change only reads a declared `actual.stop` (`statedStop`):
- on rows the engine does not know to belong to another sport;
- on request reports for sessions the plan in force does not hold.

It adds no criterion. The other-athlete filter still holds.

**SSCTR-CORE-B-01-R (BLOCKING, the same safety signal).** The stop is lost when it arrives in a review the engine does not accept, for example a review with no eligibility, which the engine answers ASK.

- **Reproduction (`p-r2-ask`).** The same symptom stop is sent without eligibility; the next review carries an eligibility dated before the stop:

  | Session | That review | Stop facts kept | Next review |
  |---|---|---|---|
  | Planned in the plan in force (control) | ASK, screen REQUIRED | 1 | REQUIRED (`w1-run-d1`) |
  | An earlier plan's session, after a restart | ASK, screen REQUIRED | 0 | NOT_RAISED_BY_THIS_EXTENSION |

  - Neither review records a row.
  - On the base `16577b6`, this same path gave REQUIRED in the next review, though only through the wrong binding (R1 `late_noElig`).
- **Cause.** The new `elsewhere` reports feed only `requested`, which names the stop in the current answer. Unlike `received`, they leave no stop fact in the record. A planned session's report leaves a fact whatever the engine does with the review ("every report leaves a fact"), through `stopOnly` when nothing else of it can be kept.
- **Why it blocks.** The rule is decided: the symptom stop stays outside every lineage reading, and only a screen answered afterwards removes it (L1, L5, contract §5).
  - Here the stop is shown once and then dropped.
  - Native sessions then become available again without the screen having been answered, while the control session keeps them unavailable.
  - This is the remainder of B-01, not a new rule.
- **Test weakness.** The cycle test's "without eligibility" case is conditional (`if(r.runFormat?.warningSignScreen) …`), and it never checks the next review on that path.
- **What a fix must show** (result tests, no new criterion):
  - a symptom stop declared for a session the plan does not hold leaves a stop fact, as a planned session's does, whether or not the engine accepts the review;
  - the next review asks for the screen until a screen dated after the stop answers it.

## 2. The historical test `SSCTR-RWS-B-01: the signal survives time…` (v1rws-fix-forward.test.mjs:316): ACCEPTED

- **What failed.** Only the fourth element of one assertion: `withRow(elsewhere).status`, which was `NOT_RAISED_BY_THIS_EXTENSION` and is now `REQUIRED`. That is a carried row of a session the plan does not name, with no report fact beside it. The other elements are unchanged, including the other-athlete row, which still raises nothing.
- **Rest of the test.** The test stops at its first failure, so the later assertions were not exercised in the suite run. In a scratch copy (`ff-signal-r2`) I changed only that one expectation to `REQUIRED`, and **the whole test passes**. That covers:
  - a refused-first report with no facts, still NOT_RAISED;
  - a reason-only correction, still REQUIRED;
  - an update merge;
  - the exact-instant clearing;
  - the restart cases.
- **Judgment.** The pinned NOT_RAISED recorded a limit of the reader ("its stop is read from the report fact, which names no plan"). It was not a decided exclusion. The stop is this athlete's own declared symptom stop on a row the engine cannot name as another sport. Asking for the existing screen is the decided rule. The change only adds a request; it never removes one, and it adds no clinical content. When the test is restated, its comment line must change with the expectation.

## 3. Conditions and finding

- **A-C4: CLOSED.** The test pins CLINICAL_HUMAN_REQUIRED after the date. I also observed `referenceState.pending` = CLINICAL_HUMAN_REQUIRED (`p-expiry`). Pinning that too is recommended but not required.
- **C-C1: as-if acceptance CONFIRMED after the QRE-CORE-01 fix.**
  - **Re-run on 430c493.** In all ten combinations (ADVERSE, FATIGUE, HEAT, walk breaks and SYMPTOM, each in two orders), the review that applies the re-sync decides exactly as the as-if control and as the run with no correction, and so does the following Sunday review.
  - **Screen.** The screen stays REQUIRED after an agreeing re-sync, a conflicting re-sync, and an athlete reason edit.
  - **Lineage test.** The as-if variant of the heat / walk-breaks lineage test passes in three orders.
  - **Conflict resolution (`p-r2-resolve`).** A correction now inherits the other voice's parts:
    - **the device corrects again and agrees:** the row keeps the athlete's ADVERSE and rpe 8, the session is credited, and the adverse reading counts;
    - **the athlete corrects to agree with the device's stop:** the row merges as not completed;
    - **the athlete still disagrees:** the conflict stays, nothing is credited, and it is never resolved by arrival order.
  - **Still open, before freeze (QRE judges the form).** C-C1 asked for each of the 16 scenarios to be restated as the as-if invariant. `CYCLE1.md` defers this to `FINAL_READINESS_REPORT.md`, which does not exist yet. The restatement should be executable, or at least name each scenario with its as-if reading.
- **C-C2: remains a condition (before freeze, non-blocking).**
  - **The behavior holds today (`p-r2-legacy`).** For a legacy merged row with no parts, and for a row with a malformed part, the device correction replaces the row as before. The run is then withheld from pace evidence (`REPORT_NOT_CARRIED`, `paceWithheld: REPORT_NOT_CARRIED`). The control row with parts keeps HEAT and withholds nothing.
  - **No guard pins it.** The historical tests that pinned this withholding now fail for other reasons, and the cycle has only an engine-level test.
  - **Required:** one RWS-level result test for these two paths. The malformed-part path is live code (SEC-CORE-04), not only legacy data.
- **QRE-CORE-06: does not change item (a).** Probed with `p-r2-06`: a warning sign plus a symptom-stop run report on 05-03, after the date. The answer is:
  - CLINICAL_HUMAN_REQUIRED, with no proposal;
  - the screen still REQUIRED, because the refusal's `runFormat` carries it;
  - no executable run session;
  - forecast UNAVAILABLE and calibration NOT_APPLICABLE;
  - no `updatedModel`;
  - the record kept (clinical fact and report row);
  - `referenceState.pending` CLINICAL_HUMAN_REQUIRED.

  The clinical route, its wording and the recorded facts are unchanged; the 21-case `p-expiry` matrix is identical to R1. No learning after the date is conservative and consistent with an expired authority. Item (a) stays APPROVE_WITH_CONDITIONS. A-C1, A-C2, A-C3 and A-C5 are carried to integration as `CYCLE1.md` records.

## 4. Dispositions R2

| Item | R2 disposition | Blocking |
|---|---|---|
| (a) post-expiry precedence | APPROVE_WITH_CONDITIONS (A-C4 closed; QRE-CORE-06 no change) | no |
| (b) restart identity | REVISE: B-01 closed on accepted reviews, **B-01-R open** | **yes** |
| historical test fix-forward:316 | ACCEPT the changed expectation (only element 4) | no |
| (c) E-1 / RWS consequence | APPROVE_WITH_CONDITIONS (as-if confirmed; C-C1 restatement and C-C2 test open; C-C3, C-C4, C-C5 carried) | no |
| (d) RFC-NUMERIC-1 | unchanged from R1 (APPROVE_WITH_CONDITIONS) | no |

- **Human queue:** HQ-CORE-SSCTR-C was proposed in R1 and is not appended. The queue is untouched.
- **Gate and publication:** none.
- **Re-review:** under the Chief's rule there is no further cycle. B-01-R therefore closes this item as blocked unless the Chief or the Founder decides otherwise.
