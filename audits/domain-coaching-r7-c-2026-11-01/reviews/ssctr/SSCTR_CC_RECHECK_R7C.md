# SSCTR recheck after the correction cycle: R7-C on R7C-FREEZE-2

Record `SSCTR-CC-R7C-r4`, dated 2026-11-02. The structured record is [SSCTR_CC_RECHECK_R7C.json](SSCTR_CC_RECHECK_R7C.json).

## Decision

**Gate: ACCEPT_WITH_CONDITIONS. No blockers.**

- **What the cycle fixed:**
  - **QE-R7C-02.** No first decision of week b+1 keeps a run above the single-run ceiling or an intense session the on-time path lacks, on any route I measured.
  - **QE-R7C-01.** A known stop recorded by a refusal or a clinical route is applied by the next decision, as the on-time and direct-answer paths apply it.
- **Why the gate is not READY:**
  - **R1 is narrowed, not closed.** It persists on handler routes that re-compose the weeks from the answer week. The next decision contains it, so C9 keeps binding.
  - **Adverse or mixed answers.** One recorded by a handler clinical route is still not applied after clearance, even re-sent. C3 gains a clause.
  - **Consumer conditions.** C2, C3, C8 and C9 remain obligations that no frozen byte discharges.

This is a narrow recheck, not a new disposition.

| # | Item | Result |
|---|---|---|
| 1 | R1 closed; C9; FR-03 | **NOT CONFIRMED.** R1 is closed on the factual re-plan, open on handler routes and contained. C9 still binds, and the taper clause stays. |
| 2 | Answer after a refusal or clinical route, within r2 | **CONFIRMED.** Known stops only; adverse or mixed answers via a clinical route are not applied (C3). |
| 3 | Ceiling re-plan: inside r2 and the policy, no new dose, populations | **CONFIRMED.** It plans what the reviewed path plans and never raises a dose. Three pre-existing credits are outside its scope (C7, C10). |
| 4 | `r7a-cycle2:111` as EXPECTED_SEMANTIC_UPDATE | **CONFIRMED** |
| 5 | SSCTR-SD5-02 / C8 after QE-R7C-03 | **CONFIRMED.** Narrowed; the non-review residual is unchanged. |
| 6 | D1, G02, taper and race week, clinical boundary unchanged | **CONFIRMED** |
| 7 | C2, C3, C7, C8, C9 carried | **CONFIRMED.** Verbatim in the freeze record; C3, C7 and C9 are updated here. |

## Why

**1. R1.**
- **Closed on the factual re-plan:**
  - **My `r1-exposure`:** 168 of 168 cells now equal the on-time plan (112 on R7C-FREEZE-1).
  - **My `r1-race-week`:** race week after a taper answer is EASY 15 / EASY 15 / RACE 75, the on-time plan.
  - **My CC1 grid (1,536 cells, including the QE-R7C-02 timeline with week b's review skipped):** 0 runs above the ceiling and 0 intense roles the on-time path lacks (72 and 10 on R7C-FREEZE-1). What remains is one 5-minute step within the ceiling, the R2 shape. The same 24 cells already differ on the reviewed path, on both freezes.
- **Open on handler routes:**
  - **Where:** my re-run kinds-days grid still flags 46 next-week cells, all answers carried on day 3 or 4 by `EXERCISE_SUBSTITUTION`, `RETURN_SHORT` or `EVENT_DATE_CHANGE`.
  - **Magnitude (CC3):** 66 such cells keep the stale week b+1, up to EASY 50 / QUALITY 34 / LONG 60. After a taper answer carried by a substitution, race week keeps a 25-minute race touch.
  - **Cause:** only `factualReplan` passes the uncredited sessions; `rebuild()` and the return composition do not.
- **Contained:**
  - Across 2,916 first decisions of week b+1, 1,752 are VALID and 804 ask.
  - None plans above the ceiling or adds an intense role.
  - With nothing reported after the answer, every first decision asks.
- **C9 decision:**
  - The condition is not retired and not narrowed, and its premise now holds.
  - Its Engineering part is done for the factual re-plan only.
  - Keep "including the taper-to-race-week case" (FR-03).

**2. The answer after a refusal or clinical route (CC2, 1,200 cells, six recorders).**
- **Known stop:** 228 of 228 VALID cells equal the on-time plan and the direct-answer plan. R7C-FREEZE-1 had 108 ceiling breaches here.
- **Adverse or mixed answer, after a substitution with pain or a clinical return report and then clearance:**
  - The rest of the week keeps the stored doses, re-send included.
  - Adverse example: LONG 65 is kept where the direct path plans 45.
  - Mixed example: QUALITY 48 / LONG 75 is kept where it plans EASY 45 / LONG 60.
  - This is identical on R7C-FREEZE-1, stays within the ceiling and converges at the week's review.
  - It sits behind a clinical return, which remains CLINICAL_HUMAN_REQUIRED.

**3. The ceiling re-plan.**
- **It enforces the policy's own reading on the week in force:** the ledger ceiling once earlier weeks are facts or unknown.
- **Where it fires, it equals the reviewed path:**
  - never-reported class: 16 of 16 cells;
  - late schedule-change rows of the G01 grid: 6 of 6, now equal to their reviewed-miss rows (FREEZE-1 kept up to LONG 90 against a 65 ceiling).
- **No new dose:** 0 cells above the stored week; it never raises a dose.
- **It never fires on the timely path:** 0 of 72 partial-execution decisions, 0 of 20 taper and race-week cells, and 97 of 99 differential scenarios identical.
- **Pre-existing scope limits, disclosed:**
  - **Never-reported easy running below the ceiling:** credited progression and quality stand at non-review decisions within the intake window, for example EASY 50 / QUALITY 34 / LONG 65 against the reviewed 45/45/60.
  - **Never-reported restart and walk/jog:** outside the window by design. The restart ladder reaches EASY 30 / LONG 35 by week 5 against 15 on the reviewed path.
  - **After a short return following known misses:** the reviewed path goes back to the entry the week after the re-entry week (B.2-identical), and the re-plan now brings the late path there too. This goes to C10.

**4.** The dated change is still asked and never applied. The factual re-plan of the credited run doses (E40/Q34/L60 to E35/E35/L50) travels with the question, which is REQUIRES_RECONCILIATION. The original assertion holds on the same fixture with nothing credited.

**5.** The held fatigue now survives a kept change (128 of 128, against 64 of 128) and is re-evaluated with a plain answer, as on time (32 of 32). It is still dropped inside `SCHEDULE_CHANGE` or `EQUIPMENT_CHANGE`, as before. No replay across weeks (0 of 8).

**6.** Re-runs byte-identical to the coordinator's FREEZE-2 outputs (holdout and G02 also equal to FREEZE-1 after labels):
- holdout;
- G02 (`47212a8f…`);
- the SD grid (1,200 cells, 0 violations; C 9/0);
- the G01 grids.

The clinical copies are equal after labels: K6, K6b, CAND-01, CAND-02, ADJ, and 3,228 adversarial checks with 0 failed.

## Conditions as set now

- **C2, C4, C5 and C8:** unchanged. The C8 residual is narrowed.
- **C3, added clause:**
  - After a handler clinical route records an adverse or mixed answer, the run doses left in that week are not presented as a prescription after clearance.
  - The qualified human's clearance and the week's own review decide.
- **C7, corrected and extended:**
  - R1 as above;
  - R4: the answer is now applied; the HOLD itself remains;
  - R5: split by route;
  - SSCTR-SD5-02: narrowed;
  - QE-R7C-05;
  - the never-reported credit below the ceiling;
  - never-reported restart and walk/jog.
- **C9:** still binding, with its r2 text verbatim. Engineering still owes the handler re-compositions, with a directed test per route (substitution on taper day 4 included).
- **C10:** extended with the re-entry observation.

## Findings (one line each)

- **CC-F01** (DIRECT_R7C_DELTA, condition): R1 persists on handler re-composition routes; the next decision contains it.
- **CC-F02** (not the cycle's delta, condition): an adverse or mixed answer recorded by a handler clinical route is not applied after clearance, even re-sent.
- **CC-F03** (positive): the ceiling re-plan equals the reviewed path, never raises a dose, and never fires on the timely path.
- **CC-F04** (pre-existing, disclosure): never-reported easy running keeps credited progression and quality below the ceiling until the week's review.
- **CC-F05** (pre-existing, disclosure): never-reported restart and walk/jog progress on credit, outside the unknown window.
- **CC-F06** (pre-existing, C10): after a short return following known misses, the reviewed path returns to the entry; the late path now matches it.
- **CC-F07** (info): after an executed answer later in the week, the threshold step is held where the on-time path progresses on its own unreported session.
- **CC-F08** (documentary): the handoff overstates R1 ("fixed"), C9 ("Engineering part done") and R5 ("with or without the re-send"). Correct it at closure.

## What I ran, and what I did not

**Run:**
- **Verifier:** `verify-r7c.mjs --revision 2 --suite` without `--write`: 16/16 PASS, 854/854.
- **My own probes:** eight, CC1 to CC8, in [probes/cc/](probes/cc/).
- **Re-runs:**
  - my `sd` and `sd5` probes;
  - the coordinator's stdout probes;
  - conformance (stdout sha256 equal to the freeze record);
  - the four clinical probes, from scratchpad copies.
- **Unchanged inputs:** policy, catalog, `product/`, `canon/` and the queue (230 items, funding NOT_DECLARED).

**Not run, read only:** the mutation run, and the Engineering recheck that appeared during this review (not read).

**Not verified:**
- **Schema validation:** Python is unavailable.
- **Clinical clearance:** the runtime has no clearance API, so it is modelled as the tests model it.
- **Native dispatch:** cannot be observed.
- **Literature:** access is confirmed and no new claim is made. My screen found no newer systematic review.

**Authority:**
- PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY.
- No human, empirical or clinical validation; no publication; V1 authority stays NO.
- Nothing was appended to the queue.

**Re-review:** on any change to a frozen file, an engine fix for C9's handler routes or the C3 residual (or C8, C5 or R4), a G03 cadence decision, a relevant policy change, new V1 data, or a relevant systematic review. At the latest 2027-04-30. Owner: Chief.
