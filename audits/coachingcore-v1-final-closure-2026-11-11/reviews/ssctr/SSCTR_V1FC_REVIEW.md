# SSCTR V1FC review (SSCTR-V1FC-REVIEW-r1), 2026-11-11

The authoritative record is `SSCTR_V1FC_REVIEW.json`. This is a summary.

**Candidate:** `2d089c0` (compared with `3b14804`). **Reviewer:** an independent SSCTR-1.0.0 instance, an AI agent with no human credentials and no clinical or legal equivalence. It did not author the candidate, its tests or the decision record. Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.

**Method:** I reviewed `git archive` extracts of both commits in my own new scratch folders. The three new test files pass (30/30). I regenerated the journeys: byte-identical to the committed evidence. I ran about 60 of my own probe athletes and review sequences, including F08 on both commits. I never ran `npm run verify` or any `verify-r*` script. Europe PMC access worked; I re-read four key abstracts. One negative search: I found no direct evidence on how recent a marathon runner's longest long run must be. Python is not installed, so the skill validator did not run. Injected CLAUDE.md and MEMORY.md were used only to orient; their hashes are in the JSON.

## Verdict

- **For the V1 scope as requested: NOT_READY.** Two blocking findings, both on the marathon event only.
- **With the marathon not enabled: READY_WITH_CONDITIONS.** This is the candidate's default fail-closed state.
- **5K:** approved. I wrote its event record (`SSCTR_V1FC_EVENT_RECORDS.json`).
- **Marathon:** no record. I can write it at the narrow recheck, after one directed fix of R-01 and R-02.

## Blocking findings (marathon only)

| id | finding | smallest fix |
|---|---|---|
| R-01 (MAJOR) | Race day reads the program's maximum executed long run. Reproduction: `mar()` with every long run missed in weeks 2-11. The athlete's 150-minute run was about 77 days before the race. Planned long runs fall to 60 minutes, yet race day stays at MARATHON_EFFORT with no completion and no caution. This contradicts B1.2's 30-day currency rule. | Marathon only: use the longest long run executed in the 30 days before the first taper day. Below 150 minutes, race day becomes a completion, with the later or shorter event offered first. The window value must come from a decision amendment written by another instance. Scope reduction instead: the marathon stays off. |
| R-02 (MAJOR) | The MARATHON_PROJECTION note is never recomputed on proposals. Same reproduction: the proposals of weeks 3, 8 and 11 still say "reaches about 180 minutes, race day at steady marathon effort" while they plan 60-minute long runs. This breaks Amendment 1 (onReprojection). | Recompute the note from each proposal. Below 150 minutes, replace it with EVENT_AMBITIOUS_FOR_CURRENT_RUNNING. |

## Conditions and minor findings (not blocking)

- **R-03 (MINOR, marathon):** with a Monday race, the day-13 taper quality is 2x9', 0.3 of the peak instead of 0.5. A day -20 session planned under taper rules became the "achieved" peak. Fix: never record a session planned under taper rules as the peak (`r6-program.mjs:310`). This is more conservative, not less safe.
- **R-04 (MINOR, marathon):** post-marathon light strength is limited per calendar week, not per 7 days. Example: sessions on days +5 and +8.
- **R-05 (LOW, marathon):** the 4-run-day disclosure is missing.
- **R-06 (LOW, 5K):** the threshold-intervals note is shown to walk/jog athletes, who get no intervals. This is a condition of the 5K record.
- **R-07 (LOW):** the B2 disclosure says "do not run for 7 days"; the record says "do not train".
- **Observations:**
  - O-01: the long run and the marathon-effort session grow in the same week, as in the R6 half marathon. I judge this acceptable; the record's wording should be restated.
  - O-02: the 5K taper long run uses the 10K's point, which is more conservative.
  - O-03: with an early-week race, the taper quality session and the touch can be 2 days apart. This is existing R6 behaviour.
  - O-04: the next block after the marathon follows the record; flagged for re-review.
  - O-05: a marathon with a STRENGTH goal keeps 37 sets a week, the R6 specific reduction.
- **Conditions:**
  - V1-C1: synthetic data only.
  - V1-C2: fix the copy issues (R-05 to R-07).
  - V1-C3: athletes reach the engine only through `v1-index.mjs`.
  - V1-C4: queue HQ-V1FC-SSCTR-A for funded human revalidation (appended by Founder or Chief).
  - V1-C5: urgency wording stays INTERIM_PENDING_G04.

## Rulings by question

1. **Conformance:** every 5K and marathon value matches the record and its amendment. I checked G.1-G.7, A, B1 (with B1.8), B2, B3 and C.1 at and around each threshold. The deviations are R-02 to R-07 and O-01/O-02. I disagree with the record on R-01.
2. **Events:**
   - The 5K is coherent for every athlete I probed.
   - The marathon is coherent when its sessions are executed: probed with 4 run days, 3 strength days, races on Monday, Wednesday and Sunday, adverse responses, and the last two long runs missed.
   - It is not coherent once long runs stop (R-01, R-02).
   - The preparatory plan is the right answer for the athletes who get it.
3. **F08 V1 cut:** safe.
   - A report with every warning sign answered no keeps the plan, with the typed unavailability.
   - An unknown answer is asked; any yes is the clinical hold.
   - Only a clean readiness declaration releases the hold, sport by sport, into a conservative entry.
   - The hold paths are identical to `3b14804`. No athlete gets a higher dose or a weaker screen.
   - Known facts: 1 blocks the marathon (R-01). 2 and 3 are accepted. 4 does not block (Situation 1 is unreachable in V1). 5 is condition V1-C3. 6 is outside sporting scope.
4. **Normal journeys (01-07, 13-16):** coherent. Progression follows executed sessions, nothing is made up after a miss, and running and strength each keep their stimulus.
5. **Ready to freeze:** see the verdict above.

**States:**
- RUNTIME_CORRECTNESS (sporting view): correct except R-01 and R-02.
- V1_SCOPE_ENFORCED: yes, by my sporting probes.
- EVENT_EXTENSION: 5K approved with conditions; marathon not approved.
- F08_STATUS: V1 cut accepted.
- RECORD_CUSTODY_STATUS: not judged.
- INTEGRATION_READY: not a sporting call.
- Real athletes: NOT AUTHORIZED.

Review by 2027-05-11, or earlier on any trigger listed in the JSON.
