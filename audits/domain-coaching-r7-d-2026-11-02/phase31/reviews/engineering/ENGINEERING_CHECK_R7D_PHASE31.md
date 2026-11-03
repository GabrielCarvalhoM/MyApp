# R7-D Phase 3.1: narrow engineering check (`R7D-ENGINEERING-PHASE31-CHECK-1`)

**Verdict: READY_WITH_CONDITIONS.** No blocker. One MAJOR finding that needs a Founder/SSCTR decision (F08), not an engineering fix. The structured record is [ENGINEERING_CHECK_R7D_PHASE31.json](ENGINEERING_CHECK_R7D_PHASE31.json); where the two differ, the JSON prevails.

| | |
|---|---|
| Date | 2026-11-02 |
| Judge | Quality & Reliability Engineer, fresh instance, claude-opus-5-5 / xhigh |
| Independence | Did not write the runtime, the tests, the harness, PREREG-3 or the evidence. Did not open `phase31/reviews/ssctr/`. |
| Candidate | Runtime bytes of `1357638` (only `src/r6-adaptation.mjs` differs from R7D-FREEZE-1 `4cabd18`; sha256 `9f905030…0e95`). HEAD `a6a11f5` changes no source or test byte. |
| Not run | `freeze-r7d-2.mjs`, `verify-r7d-2.mjs`, `integrate-queue-r7d.mjs`, `npm run verify`, any `verify-r*`/`freeze-r*`. The queue was not touched. |

## What was reproduced

Everything ran on runtimes rebuilt outside the repository (session scratch), node v24.19.0.

- **Full suite:** 921/921 on the candidate.
  - With only the two records named in the instructions, 908/921: 13 legacy-path tests need the R3, R4 and R5 SSCTR records too (QE-R7D-P31-13).
- **Directed tests:** 14/14 on the candidate.
  - On R7D-FREEZE-1, 13 of 14 fail for the retention reason. The future-start/template/determinism test passes on both.
- **Updated assertions:**
  - Each new version selects one test, fails on R7D-FREEZE-1 and passes on the candidate.
  - Each old version (`b77480f`) fails on the candidate.
- **Conformance:** R7-B, R7-B.1 and R7-B.2 PASS. Their stdout sha256 is identical to the evidence.
- **Author's mutation:** 6/6 killed, each by its own witness, identical to `MUTATION_PHASE31.json`.
- **Harness validation 3:** summary identical; every section identical once roots and timestamps are removed. `DEV_CASES_R7D_3.json` rebuilds byte-equal.
- **Regressions:** diagnostic (18 cases) and generated (100 cases) summaries and case rows are identical to the committed ones.
  - P01–P17: 0 violations.
  - VARIANT: 4/12, the triaged set.
- **Differential:** the author's probe gives an identical result: 141 cases, 4 differing (DEV-18–21), 0 unexplained.
- **Stronger attribution:** the candidate equals R7D-FREEZE-1 run on the same case with the kept break restated in every later review, in all 141 cases.
  - Execution-record differences appear only in the family (R7D-D10, DEV-18, -19, -20).

## Answers (short)

1. **Factual persistence: PASS, with one wording gap.**
   - The row is recorded on the decision path and on every clinical and question early return: clinical flag, unknown or stale eligibility, post-race check, standing clinical route, generic RECOVERED.
   - Malformed execution facts never refuse a review that states a break (12/12 recorded).
   - On the integrity refusals the break is not recorded, and the next plain review is VALID (silence ceiling re-plan). This is by design, but the public rule says the break survives "HOLD" (QE-R7D-P31-02).
2. **No stale-plan resurrection: PASS.**
   - A kept break is applied once and never re-read after its return.
   - After clearance, the first review re-enters from the break, never from the pre-break plan.
   - The only route back to the pre-break plan is an integrity refusal of the stating review.
   - A clinical-reason break never resumes (QE-R7D-P31-01).
3. **Event separation: PASS.** 12 non-return kinds were checked as carriers:
   - the carrier adds only REPLAN_FROM_EVIDENCE;
   - the applying return adds only REESTABLISH;
   - a weekly review with block choices asks and applies nothing.
4. **Duplicate, replay and correction: PASS with residuals.**
   - An exact replay adds nothing. A stale replay after the return is refused.
   - A newer declaration replaces an older one.
   - A correction through `episodeId` works.
   - Residuals:
     - a re-stated applied break is applied again (QE-R7D-P31-03);
     - the same id with other facts is silently not recorded (QE-R7D-P31-10);
     - a partial newer declaration replaces a complete one, also a clinical one (QE-R7D-P31-11).
5. **P17 and RESTATE: sound, with sensitivity gaps.**
   - They detect the author's M1–M4.
   - They do not detect "applied twice" (M5) or "newer ignored" (M6, which needs two declarations in one case).
   - P03 does not check the row's clock or athlete at first recording (QE-R7D-P31-05, -06).
   - P03/P10 do fire on a forged, rewritten or dropped row.
6. **Δ5: a scoped relaxation, not only precision.**
   - On the corpora it removes only false FAILs: DEV-18 P12 goes from 18 to 0, and no asked change was ever adopted.
   - On a constructed case, a VALID plan prescribes a barbell squat after the athlete's equipment change was asked and never re-sent. HARNESS-2 P11 fails; HARNESS-3 passes (QE-R7D-P31-04).
7. **Updated assertions: acceptable from engineering.**
   - The R7-A.1 test keeps its commutativity assertion. The original passed only because both orders dropped the break.
   - The R7-C test's VALID becomes CLINICAL (F08). The nonclinical answer-after-clearance coverage in the same test is unchanged.
   - The domain judgement is the SSCTR's.
8. **Freeze readiness: the scripts are consistent** (read, not run).
   - They bind the reviewed bytes, refuse a source or test drift from `1357638`, require the queue integration first, and embed both reviews' conditions.
   - They also bind the instruments, so any wording or tightening from the conditions below has to land before the freeze.
9. **Security routing: yes.**
   - The declared break's free text (and the whole interruption) now persists in the carried record for the life of the program and travels with every decision.
   - Before this phase it was never stored; the program keeps only a hash and the screened tokens.
   - This is a data-minimization and retention question for the privacy owner (QE-R7D-P31-07).

## Findings

| Id | Class | Finding |
|---|---|---|
| QE-R7D-P31-01 | **MAJOR** (decision needed: Founder + SSCTR, F08) | A break whose reason is clinical is absorbing.<br>• After clearance, every later decision of every kind stays CLINICAL_HUMAN_REQUIRED for the rest of the program. Five weekly reviews over weeks 5–9, with training reported, were all CLINICAL.<br>• No truthful conforming input leaves it: a return with no break, the same break with nonclinical flags, and RECOVERED all stay CLINICAL.<br>• Only a newer, different declaration leaves it.<br>• It fails closed and is disclosed (PREREG-3 residual, INTERFACE-3), so it does not block |
| QE-R7D-P31-02 | MINOR | INTERFACE-3 §1 and PREREG-3 Δ1 say a break survives "HOLD". The runtime does not record it on integrity refusals; 6 paths were probed, and the next review is VALID. P17 has no carve-out. The case format cannot reach these paths |
| QE-R7D-P31-03 | MINOR | A break already applied and re-stated with a new event id, by any carrier, is kept and applied again (SAME_BREAK/DUPLICATE, revision 2).<br>• The plan ahead changes: dumbbell loads 22 vs 20 kg and back squat 3×9 vs 3×11 in weeks 8–9.<br>• Δ8 retired "declare once", the consumer guard of R-DX02-2 |
| QE-R7D-P31-04 | MINOR | PREREG-3 Δ5 relaxes P11/P12 for an asked change that is never re-sent. It is labelled as precision only |
| QE-R7D-P31-05 | MINOR | Test adequacy: 9 of 17 adversarial mutants survive the directed file and the whole suite.<br>• Among them: keep dropped on the eligibility, post-race and guard paths; future-clock rows read; an early return that drops the whole carried record (caught only by harness P10); the hash check (the tamper test is not its witness); a template reading the kept break.<br>• The instruments miss M5, M6, QM31-02, -04 and -11 on the dev cases.<br>• Every path probed behaves correctly on the candidate |
| QE-R7D-P31-06 | MINOR | P03 (Δ4) checks only the row's event id and interruption. A wrong clock or athlete at recording is not flagged; its effect is caught by P17 |
| QE-R7D-P31-07 | OBSERVATION → Security | The free-text reason (health-related) is retained in the carried record |
| QE-R7D-P31-08 | OBSERVATION | An early return with no new declaration omits `actualLedger`. "Carry exactly as returned" does not say that absent means unchanged |
| QE-R7D-P31-09 | OBSERVATION (pre-existing) | Append-only holds by fact, not by position.<br>• Declared rows are emitted after newer execution rows.<br>• A return-week row's `context` is re-derived; this is the same on R7D-FREEZE-1 |
| QE-R7D-P31-10 | OBSERVATION | The same event id with other break facts on a carrier is neither recorded nor refused. The return handler asks `event.id` instead |
| QE-R7D-P31-11 | OBSERVATION → SSCTR | A partial newer declaration (only `reason`, or only `episodeId`) replaces a complete kept break, also a clinical-reason one. Decisions become ASK, not VALID |
| QE-R7D-P31-12 | OBSERVATION → SSCTR / Security | Two notes:<br>• an open-ended kept break ends the day before the applying review, so sessions reported in between count as break (identical to stating it there);<br>• a forged row with a recomputed hash is read (the hash is a consistency check) |
| QE-R7D-P31-13 | OBSERVATION (docs) | The full suite on a rebuilt runtime also needs the R3, R4 and R5 records |

## Conditions for the freeze

- **CF-1: freeze exactly what was reviewed.**
  - Freeze the runtime bytes of `1357638` with `--reviewed 1357638`.
  - The directed test file is `b81cf114…`.
  - Commit this record and `probes/`; the freeze binds them.
- **CF-2: settle the instrument and interface text before the freeze binds it.**
  - The text, all precision or tightening:
    - the integrity-refusal carve-out (P31-02), also in the freeze record's rule text;
    - Δ5 labelled as a scoped relaxation, with the consumer condition "send the carrying event again after the return" (P31-04);
    - the consumer rule on re-stating an applied break, or the re-application disclosed (P31-03);
    - C3: an absent `actualLedger` means the record is unchanged (P31-08).
  - Optional tightening:
    - P03 checks the row's clock, athlete, kind and hash;
    - a P17 check that a kept break is applied once;
    - Δ6 coverage of a newer declaration replacing an older one.
  - Otherwise record each item as a disclosed residual.
  - No instrument change after the freeze without a new freeze.
- **CF-3: P31-01 as a residual.** Disclose it as a known residual with no envelope. Owners: Founder and SSCTR (F08). Decide it before any consumer use of the kept-break rule.
- **CF-4: route to Security.** P31-07 and the forged-row note go to Security as the privacy owner, before any real-data consumer. No runtime change in this phase.
- **CF-5: test gaps.** Record the mutation survivors as TEST_GAP. Owner: Engineering; trigger: the next authorized runtime phase. QM31-07 comes first.
- **CF-6: reproduction docs.** Add the R3, R4 and R5 records to the reproduction instructions.

## Probes (`probes/`)

Each takes a root that holds `CoachingCore` and the records it reads. Run them on scratch copies only.

| Probe | What it checks |
|---|---|
| `qe31-persistence.mjs` | Early returns, resurrection, F08 liveness, open-ended breaks, event separation, replay and correction, append-only, forged and future rows, free text |
| `qe31-row-diff.mjs` | Which carried rows change, and how (candidate vs R7D-FREEZE-1) |
| `qe31-malformed-and-resend.mjs` | Malformed facts with a break; the plan after a re-stated applied break |
| `qe31-post-race.mjs` | The post-race early return keeps the break |
| `qe31-mutation.mjs` | 17 adversarial mutants (directed file, then the whole suite) |
| `qe31-make-mutant-runtimes.mjs` | One scratch runtime per mutant, for the instruments |
| `qe31-instruments.mjs` | Δ5 (HARNESS-2 vs HARNESS-3), P03/P10 on the new row, mutants under P17 and RESTATE |
| `qe31-differential-attribution.mjs` | Candidate vs R7D-FREEZE-1, and vs R7D-FREEZE-1 with the break restated; the execution record |
