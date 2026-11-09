# SSCTR recheck of the V1CP Fix-Forward candidate (SSCTR-V1CPFF-RECHECK-r1, 2026-11-09)

**Disposition: BLOCK** for the sporting behaviour of `4630bca`. The blockers are narrow and runtime-only, and all of them fit the one narrow fix cycle the bounded-cycle rule allows. This is not V1 authority: F08 stays F08_OPEN and V1_COACHING_AUTHORITY_READY stays NO.

The structured record is [SSCTR_FF_RECHECK.json](SSCTR_FF_RECHECK.json). Where the two differ, the JSON prevails.

## Who and how

- **Who.** A fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical content only). It authored none of the decision record, the candidate, its tests or its evidence.
- **Runs, on this instance's own scratch extracts** (`git archive` of `4630bca` and `5ee9dec`, outside the repository):
  - The full suite: 1132/1132.
  - The directed tests on `5ee9dec`: 46 of 53 fail. The 7 that pass are guards.
  - The read-only differential against `5ee9dec`: H1 shows 0 summary differences, and 116 of 130 steps are fully identical; the other 14 differ only by the guidance field and record rows. H2 is 300/300 and generations are 39/39, so the default path is unchanged.
  - Eighteen probe scripts (P0–P17).
- **Literature.** WebSearch and WebFetch work: the NCBI record of S06 was read, and it lists no correction. No new source is used and no number is added.

## Named blockers

| NB | Ruling | Evidence |
|---|---|---|
| NB-1 (CH-r2-1..10) | **OPEN, narrow residual** | The five V1CPR-01 scenarios pass. A sweep of 168 chained reports finds no day above either report alone. KEEP occurs only in CH-r2-3 (b). Recurrence and in-wait reports take the persistence route. **Residual (SSCTR-FFR-02):** CH-r2-7 drops days without training across a chain. |
| NB-2 (FF-Q2, D3) | CLOSED | Every rung gives no session, a walk or an easy run, never race effort or a completion. No race question blocks. The paths are offered once. An executed race moves the ladder at most one rung and never replaces the reference. The restart and the date-change route are in scope. |
| NB-3 | CLOSED (its defect) | Six single-break variants give the right per-sport class, and the return is the MODERATE recipe. **The fix introduced SSCTR-FFR-06** on the same path. |
| NB-4 | **OPEN, narrow residual** | The recheck scenario, a reported-but-unreviewed week and two silent weeks all repeat as ruled. **Residual (SSCTR-FFR-01):** an off-review check lets an unexecuted week count as checked. |
| NB-5 | CLOSED | 486 intakes with no reported longest run: no session or week is lowered or dropped. 57 first long runs are raised, none above availability. |
| NB-6 | CLOSED | 4176 checks on the ladder and the first week after it: no case is above the last executed count plus one. |

## Founder decisions

- **D1: conformant, except FFR-01, FFR-02 and FFR-06.**
  - No speed restores doses by date. A missed or unreviewed week repeats with no debt.
  - Waited days count, with the exact class bounds (10/11 and 28/29 days).
  - No daily questionnaire. No watch, exam, certificate or test is required.
- **D2: conformant.**
  - The three speeds differ in every row of 180 cases.
  - FASTER equals BALANCED only where the decision says so, and the decision text discloses it.
  - FASTER's R4 shortcut needs a whole executed and checked week. FFR-03 adds a precision for weeks followed by waiting.
- **D3: conformant.**
  - The race stays visible and is flagged as the athlete's own event.
  - It is never automatically adequate, and no question blocks.
  - Keeping it ends or shortens nothing.
- **D4: conformant.**
  - The short check works from the day after the report, with today's screen.
  - Any warning sign or clinical flag routes clinical.
  - A restriction or held sport stays in force, and the 14-day count does not reset.
  - 1- and 2-day windows take the up-to-10-days rows.
- **D6: conformant, limitation recorded.** Across 24 generations, 48 review paths and 4 F08 paths, DEMANDING prescribes exactly what BALANCED prescribes. Only the ACCEPT advice and the disclosure differ.

## New findings

1. **SSCTR-FFR-01 (MAJOR, BLOCKING, NB-4 residual).**
   - Scenario: REST 5 days at FASTER, then an R3 week with nothing executed and only a WELLBEING_CHECK on its Saturday.
   - Result: the Monday review keeps R4, the held doses (3x8 at RIR 3, long run 45 min). Without that check, the same review repeats R3. `5ee9dec` behaves the same way.
   - Fix: in `missedLadderWeek`, a checked week is skipped only if its sessions were executed.
2. **SSCTR-FFR-02 (MAJOR, BLOCKING, NB-1 residual).**
   - Scenario: REST 7 days, a return whose sessions were not executed, then a REST report of 4 days. That is 14 days without training.
   - Result: the return reads 4 days and gives FASTER R3, R4 (35-min runs). With 6 waited days, 20 days are read as 10. One 14-day window gives the MODERATE recipe.
   - Fix: `sportPlan` reads the chain's rest and wait days back to the last executed session.
3. **SSCTR-FFR-06 (MAJOR, BLOCKING, introduced by the NB-3 fix).**
   - Scenario: a REST window, then a declared break.
   - Result: every later review, check and "not 100%" report in the return's first weeks asks to confirm the interruption again. Confirming does not end the loop. `staleReturn` compares against the break's own class, not the per-sport class. `5ee9dec` gives KEEP.
4. **SSCTR-FFR-03 (MINOR, non-blocking, decision precision).** FASTER's R4 shortcut survives up to 10 waited days without training. Precision: no shortcut after a waited day.
5. **SSCTR-FFR-04 (MINOR, non-blocking, pre-existing).** A break that supersedes a wait starts the return next week. The emptied week keeps "waiting for your check".
6. **SSCTR-FFR-05 (MINOR, non-blocking).** A race or taper week with no strength session is called "not done as planned". The dose is unchanged.

Observations:
- **O-1.** A recurrence is matched across strength regions (conservative).
- **O-2.** The urgent copy adds an emergency-number sentence; G03 and G04 must review it.
- **O-3.** Recurrence detection ends with the chain reset.

## Chief observations

- **CF-OBS-1: sporting-safety relevant.**
  - After a chest-pain hold, a weekly review sent without the reference state plans the full plan doses. A "not 100%" report then opens a window as if no hold existed.
  - Classification: BLOCKING for integration readiness and any real use. This is not acceptable as the protocol's contract alone.
  - The record hold must keep the clinical route on every review kind except the readiness declaration. A declared break may be recorded, but it never releases the hold.
- **CF-OBS-2: resolved by probe.** The date change into an R3 or R4 week builds on the 8-week fixture. The race becomes the athlete's own event (an easy run) and the offer is made once. It should be added as a test.

## Directed tests of SSCTR-V1CPFF-DECISION-r1 not covered by the candidate's tests

- **FF-Q1:** DT4 (adverse session in the window's last days) and DT7 (the no-early-R4 sweep).
- **FF-Q2:** DT7 (date change), DT8 (missed R3 shift), DT11 and DT12 (race executed).
- **FF-Q3:** DT1, DT2, DT3, DT5, DT7 (no screen) and DT8 (restriction or held sport). DT9 is conditional.
- **FF-Q4:** DT1 beyond one F08 path, and DT3.
- **FF-Q9:** per-surface coverage.

The probes ran all of these, and each behaves as ruled. The exception is FF-Q1 DT7 at review level, which FFR-01 breaks.

## Conditions

- **C-1:** fix FFR-01.
- **C-2:** fix FFR-02.
- **C-2b:** fix FFR-06.

  C-1, C-2 and C-2b are blocking. Each fix needs a directed test that is red on `4630bca`.
- **C-3 (CF-OBS-1):** before integration; recommended in the same cycle.
- **C-4:** add the uncovered directed tests.
- **C-5:** FFR-03.
- **C-6:** FFR-04.
- **C-7:** FFR-05.
- **C-8:** DEMANDING is never presented as a distinct coach.
- **C-9:** the urgent copy stays interim until G03 and G04 review it.
- **C-10:** the decision's conditions stand.

## States, queue and expiry

- **States:**
  - Implementation done: yes, except FFR-01, -02 and -06.
  - Technical validation: QRE's gate. The suite and the differential were reproduced here.
  - Integration readiness: NO.
  - Real athletes: NO.
  - App publication: NO.
- **Queue:** 235, nothing appended.
- **Clinical items:** none.
- **Skill validator:** not run (no Python). The JSON was checked with Node.
- **Expiry:** any CoachingCore change after `4630bca`, or a change to the decision, DR-148/149 or the PCG delta.
