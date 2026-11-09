# SSCTR recheck of the V1CP fix cycle (SSCTR-V1CP-RECHECK-r1, 2026-11-09)

**Verdict: NOT_READY** for the V1CP sporting behaviour of `5ee9dec`. This is not V1 authority: F08 stays F08_OPEN and V1_COACHING_AUTHORITY_READY stays NO.

The structured record, with evidence and code locations, is `SSCTR_V1CP_RECHECK.json` in this folder. Where the two differ, the JSON prevails.

## Who and how

- A fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only). It authored none of the decision, the implementation review, the fix cycle, C-1 to C-3, the code or the tests.
- This is the single recheck the bounded-cycle rule allows. No further cycle follows.
- Executed by this instance:
  - suite: 1080/1080;
  - `v1cp-fixcycle.test.mjs`: 22/22 on `5ee9dec`. Run against the `fa3985b` tree, 14 fail. The -03 and -07 tests pass there, so they do not discriminate the fix;
  - differential: H2 300/300, generations 39/39, H1 104/130 fully identical, with the summary differences only in the Block 1 set;
  - about twenty probes, against `5ee9dec`, `fa3985b` and FREEZE-6, kept outside the repository.
- No new literature was needed and no number is added.

## Rulings on SSCTR-V1CPI-01..12

| Id | Ruling | Why |
|---|---|---|
| -01 | CLOSED_WITH_CONDITIONS | An illness during a running-only window, or in an R4 week, rests both sports now. The fix of V1CPR-01 must keep this. |
| -02 | CLOSED | R4 returns the held 82.5 kg (it is never re-established), and logs on R2/R3 never replace it. |
| -03 | OPEN (MAJOR) | A 7-day rest window, then a 7-day break, is still SHORT after 21 days off. The fix reaches only the separate-breaks path. |
| -04 | OPEN (MAJOR) | After a silent R3 week, W6 is still R4 at the held doses. The fix repeats the current rung, after the fact. |
| -05 | CLOSED_WITH_CONDITIONS | The race is asked at the check and the return never crosses it. Condition: C-2 as modified. |
| -06 | CLOSED_WITH_CONDITIONS | An early end exists from day 3. RC-16 stays with the Founder and PCG; the consumer offers the check. |
| -07 | OPEN (MAJOR) | A 25-minute 5K still cuts the long run 45 to 25 and the week 135 to 115, for weeks. Q04 says the race never enters weekly minutes. |
| -08 | OPEN, carried: acceptable | Minor. The MODERATE floor and evidence-conditioned steps remain. |
| -09 | Reason fixed; record part OPEN, carried: acceptable | No dose effect. The region's stop is still misstated. |
| -10 | OPEN (MINOR) | 'me too' is fixed. 'and me too', 'I had it too', 'eu também tive' and 'eu tbm' still resolve to NONCLINICAL on a structured no. |
| -11 | OPEN, routed: acceptable | Pre-existing. It joins -10 in one lexicon revision. |
| -12 | CLOSED | REGRESS repeats the rung, and the later rungs take the regressed start. |

## Consolidations

- **C-1: MODIFY.** C-1 supersedes on any overlap. The ruling covered only systemic-over-local and illness at R3/R4, and kept the 14-day count from the earlier window. The modification, with no new number:
  - per sport, never less conservative than either report;
  - an uncovered sport keeps its episode;
  - a covered sport takes the more restrictive rung;
  - a lighter report offers the check;
  - the illness ceiling and its check stand;
  - the 14-day bound runs until a whole ladder week has been executed.
- **C-2: MODIFY.** The core is right. But a 'keep the race date' answer, which the decided window question offers, now meets 'move or skip' at the check. The modification restores C-Q05-3's three answers at the check: on keep, the return ends before the race week.
- **C-3: ACCEPT.** It is faithful, and the day-3 floor is the Founder's own minimum. RC-16 is routed.

## New findings

- **SSCTR-V1CPR-01 (BLOCKING), chained reports, introduced by C-1:**
  - a MINOR_DISCOMFORT report for running ends a mild-illness window for strength too. Strength then returns to 4x8 at 82.5 kg with no ladder, and the illness items and its improvement check are never answered;
  - a running-only report in an R2 week lets strength jump from 1x8 to 4x10 the next week;
  - a 'not 100%' report can raise 1 set to 3 sets;
  - a one-day return resets the 14-day bound (18 days of the same illness).

  This meets ESCALATE_IF "a relevant sign being ignored".
- **SSCTR-V1CPR-02 (MAJOR), race:** the decided keep answer is a dead end (B6).
- **SSCTR-V1CPR-03 (MAJOR), D49:** rungs count prescribed sets, so a missed session still adds sets: 4 sets after 2 executed at R4. The mechanism is pre-existing and is now reachable through the -02 fix.
- **SSCTR-V1CPR-04 (MINOR), unreviewed week:** each re-review of the same week adds another repeat.

## Named blockers and owners (bounded-cycle rule)

- NB-1 V1CPR-01, and NB-2 V1CPR-02: the Chief consolidates the C-1 and C-2 modifications, then Engineering implements and a fresh SSCTR instance rechecks.
- NB-3 -03, NB-4 -04, NB-5 -07 and NB-6 V1CPR-03: Engineering, under rules already stated.
- Before any freeze: the minor items and consumer conditions in the JSON.
- Unchanged dependencies: C-Q05-8, G04, RC-16, FP-4, DEMANDING, PCG on RC-06/RC-07.

## Escalations and queue

- **Chief:** V1CPR-01 (ESCALATE_IF); consolidate C-1/C-2 in a later mission; CND-2 is unmet for -03 and -07.
- **Founder:** B4 (V1CPR-01, for information); B6 (V1CPR-02, and whether a race may ever be kept inside a return); RC-16.
- **PCG:** RC-06 and RC-07 under the modified C-1; the consistency of the two race questions.
- **G03:** copy items.
- **Clinical:** none.
- **Queue:** 235, nothing appended.
- **Skill validator:** not run (no Python). The JSON was checked with Node.
