# SSCTR review of the R6 coaching envelopes

**Current state: round 10 (records revision r10), a narrow runtime delta check at the unchanged R6-POLICY-5 hash `18ec48f3…`, 2026-10-26.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 9 | `ssctr-review.r9.md` | `18ec48f3…` (round-9 runtime) |
| 8 | `ssctr-review.r8.md` | `1046ad0e…` |
| 7 | `ssctr-review.r7.md` | `e9c87e09…` |
| 6 | `ssctr-review.r6.md` | `af2779fe…` |
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r9` suffixes.

## Round 10 at a glance

**Verdict: FREEZE-2 is not allowed yet.** D50 and D51 are resolved, but this round found a new binding defect, D52:
- it is a runtime defect that predates FREEZE-1;
- I missed it in rounds 1–9;
- its fix is runtime-only, so the policy hash need not change.

**The round-9 defects:**

| Defect | Status |
|---|---|
| D50 | Resolved. Running keeps progressing while the share cap holds the long run, with one increase per week under a 50-minute reference |
| D51 | Resolved. A return ends with the exercises in use, and rotation resumes on its cadence |

**The new binding defect:**

| Defect | Boundaries | In one line |
|---|---|---|
| D52 | LOAD-ESTABLISHMENT, shared with SUBSTITUTION, ROTATION and NONCLINICAL-RETURN | The strength state follows prescriptions, not executions: a missed first exposure skips establishment, and the 28-day re-establishment clock never starts while sessions are skipped |

**Dispositions at this hash.** All ten boundaries are APPROVE_WITH_CONDITIONS, and their envelopes are sound. D52 must be fixed in four of them before the freeze:

| Binding status | Boundaries |
|---|---|
| Required change before freeze | LOAD-ESTABLISHMENT, SUBSTITUTION, ROTATION, NONCLINICAL-RETURN (all D52) |
| No blocking defect observed | COLD-START, PLANNED-PROGRESSION, RUN-QUALITY, HYBRID-ARRANGEMENT, EVENT-TRANSITION, PARTIAL-NOISY-LEARNING |

**The four questions, in short:**

| Question | Ruling |
|---|---|
| Q1: in a held week the stepped easy run may equal the long run | Accepted |
| Q2: "in use" means prescribed in the week | Confirmed. One consequence belongs to D52 |
| Q3: R14 as an open gap tied to G03 | Accepted as non-blocking. Close it before any use beyond the offline reference |
| Q4: the consolidation long run below an easy run | Non-blocking. Recommendation R16 for the next policy revision |

**Effect at this hash.** The real authority enables all ten boundaries through the round-10 records; I checked that it reads all ten. `scripts/freeze-r6-2.mjs` will still refuse, because `freezeVerdict.runtimeMayBeFrozen` is false.

**Next.**
1. Fix D52 in the runtime, with probe Z as regression tests.
2. Request another narrow runtime delta check at this hash.
3. FREEZE-2 can follow that check.

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-5, unchanged.
- Canonical hash, recomputed with `value.mjs`: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
- File SHA-256: `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- Both match the stated values.

**Runtime delta.**
- Of the 39 files in my round-9 `reviewedFiles`, only `CoachingCore/src/r6-program.mjs` differs (`f5cba5f3…` → `4227f501…`).
- The reconstructed round-9 copy in `ssctr-dossier/reviewed-18ec48f3-r9-source/` matches my round-9 record for all 18 recorded files it holds, including `r6-program.mjs`.
- My diff against it shows exactly the four stated functions: `distributeRun`, `plannedOf`, `advanceRun` and `advanceStrength`.
- The new test file `r6-ssctr-r9-fixes.test.mjs` adds 6 tests. No other test changed.

## What I ran and read

**Tests.** `node --test` in CoachingCore: **428/428 pass**, run by me.

**My probe.** `ssctr-probe-runtime-d50-d51-r10.mjs`, output in `.out.json`.
- It uses the **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `18ec48f3…`, not the real authority, which now also enables the boundaries through my round-9 records.
- It started from a byte copy of my round-9 probe, which is unchanged. Sections A–Y and S keep the round-9 logic and athletes, so they compare directly with the round-9 output.
- Sections S2b and Y2b re-run my new checks on a temporary copy of the runtime with the reconstructed round-9 `r6-program.mjs`. The copy was built in the OS temp directory and removed; nothing under `CoachingCore/` was touched.

| Section | What it covers | Result |
|---|---|---|
| A–D, G, I–R, T, U, W, X | The round-9 checks | Byte-identical to round 9: 0 violations |
| V | Restarts and goal changes applied by reviews | Restart-built racers now reach 50–55 continuous minutes (round 9: 45); still a completion with the item. R14 unchanged |
| S | The round-9 stall grid, unchanged | Flat 4+ weeks: 47 → 0 of 66 programs. Flat 6+: 42 → 0 |
| S2 | D50: 69 programs and nine executed scripts | 0 one-increase violations against the 30-day reference; the quality ladder advances |
| Y | The round-9 rotation case, unchanged | Return steps end in week 10; rotation resumes from week 11 |
| Y2 | D51: 39 timelines, 42 returns | Every return ends; rotation resumes in all 25 rotating timelines with weeks left |
| Z | D52 (new) | 9 findings in four paths, below |

**Author material.** I read these as author material, not as evidence:
- the dossier `RUNTIME_DELTA_D50_D51.md`;
- the rerun of my round-9 probe in `r9-author-reruns/`;
- the checks in `continuation/author-checks/`.

My results agree with the author's on S and Y, and on the consolidation count in direction and size.

**Not run or read.**
- `npm run verify`, the `verify-r*` scripts and the `mutation-check-*` scripts.
- The R6 holdout, FIRST_EVALUATION and any post-fix evaluation.

**Literature.** Europe PMC works from Node in this session. I ran four searches (`ssctr-evidence/search-r10.json`, script `ssctr-r10-literature.mjs`) and read two new full texts:
- **Theodorou 2026, randomized groups.** The protection one eccentric bout gives against muscle damage from the next was evident at 3 and 6 weeks, partly at 9 weeks, and gone by 12 weeks.
- **Rowe 2024, quasi-randomized.** In strength-trained adults, 1-RM was unchanged after 4 weeks without training, while muscle size fell.

The search on how a reduced running week is distributed across sessions found nothing applicable. That is a negative search.

## D50: resolved

**The fix.**
1. `distributeRun` marks a long run the share cap held.
2. `plannedOf` carries the mark into the week's planned state.
3. `advanceRun` no longer counts that held step as the week's single-session increase. If the easy or the quality step then steps, the long-run target waits where it was prescribed.

**Evidence.**

| Measure | Round-9 runtime | Now |
|---|---|---|
| Programs with 4+ consecutive flat build weeks (probe S, 66) | 47 | 0 |
| Programs with 6+ | 42 | 0 |
| Programs whose internal easy minutes never change | 35 | 9 |
| Executed 45/25: running, first to last build week | 45 → 90 min, 6 flat weeks | 45 → 105 min |
| Executed 60/35 | Flat for 11 weeks | 50 → 80 min |
| Quality runner 90/40: quality step | 0 → 0 | 0 → 7 |

- The 9 "never change" programs are four-run-day athletes. Their easy runs step one at a time, and their longest flat run is 1–2 weeks.
- **One increase per week holds.** I judged it against the 30-day reference the policy names, not only against the previous week. In the 232 weeks whose long run steps beyond a sub-50-minute reference, no easy run reaches a new level, no quality step is new and no walk converts. No week steps two easy runs.
- **After a held week** (174 of them), the next week brings an easy step in 102, a quality step in 6, a walk conversion in 5, a long-run step in 4, and nothing in 64.
- The only program with 4 flat weeks is a 200-minute athlete at the 60-minute session limit, whose quality ladder still advances.

## D51: resolved

**The fix.** When the last exercise in use completes its return steps, the return ends. The remaining markers are cleared from the exercises not used during it.

**Evidence (probes Y and Y2).**
- On the reconstructed round-9 runtime, the same returns never end and nothing rotates.
- **Return length.** 39 of 42 returns carry steps for three planned weeks: usually the entry week's first strength session is dated inside the pause, so it is never executed. The other 3 run four weeks, each with an in-use exposure missed in the step-2 week.
- **Rotation.** In all 25 rotating timelines with weeks left, rotation resumes on its calendar cadence. Every exercise after the return is the rotation's choice for its slot (0 off-calendar).
- **Doses.** No exercise after a return gets the return-entry dose. No block in progress at the break earns a set. Probes U and X are unchanged, so D49 holds.
- **Exercises not used during the return.** All 60 never-performed exercises start with effort-guided establishment. Of 35 rotated back more than 28 days after their last performance:
  - the 5 loaded ones are re-established by effort;
  - the 30 bodyweight ones resume their earlier sets at RIR 3 (R17, below).

## New binding defect D52 (required before FREEZE-2)

**Defect.** `advanceStrength` creates an exercise's state, and stamps its last week, for every prescribed exercise, executed or not. Two consequences follow.

**(A) A missed first exposure skips establishment.** The exercise becomes "established" without a log. Its next row is FROM_LOG and says "Use the load you logged last time for this exercise", with the full set count and a progression rule.

| Path (probe Z) | Next exposure after the missed establishment row |
|---|---|
| Rotation, EVERY_2_WEEKS and COACH_DECIDES (db-step-up) | 1×10 at RIR 3, FROM_LOG |
| Cold start, FIXED (goblet squat) | 3×8 at RIR 3, FROM_LOG, "Add 2 reps per set…" |
| Equipment-window substitute (goblet squat) | 3×5 at RIR 3, FROM_LOG, "…add the smallest available increment" |
| After a return, an exercise first prescribed in the session dated inside the pause | 2×10, FROM_LOG |

This contradicts:
- LOAD-ESTABLISHMENT conditions 5, 6 and 11;
- SUBSTITUTION conditions 6 and 7;
- ROTATION condition 7;
- the D48 rule that no row sends the athlete to a log that does not exist.

**(B) The 28-day clock counts prescribed weeks, not performed ones.**
- Every strength session missed for five weeks while running continued: the back squat resumes at 4×5 at RIR 3 at the prior 82.5 kg, 42 days after it was last performed. The runtime's clock reads 0 days, and it would stay there however long the sessions were skipped.
- After a return, an accessory last performed 35 days earlier counts as 28 days.

This contradicts `strength.resumeAfterDays` ("not performed for more than return.moderateMaxDays") and ROTATION condition 8.

**Why it is binding.** It breaks approved conditions in four boundaries, and it is reachable in ordinary use: one missed session, or weeks of skipped strength. The same code is in the FREEZE-1 source, and D51 now makes it reachable after a return.

**Sporting weight.** The risk is modest, not nil:
- people choosing a load without a reference tend to choose light (Steele 2022, abstract level);
- strength is largely kept over 4 weeks (Rowe 2024);
- the protection against muscle damage is still present at 3–6 weeks (Theodorou 2026).

So a few days beyond 28 matter little. The unbounded case (B) and the missing ramp-up in (A) do matter, and the declared rules exist to prevent exactly them.

**Required change (runtime-only).**
- **(A)** A prescription that was not executed establishes nothing. The next exposure of a never-performed exercise is the effort-guided establishment row: the establishment set count at RIR ≥ 3, the ramp-up, no load and no progression step. A FROM_LOG row is issued only when a logged load exists, pending or adopted.
- **(B)** Count `strength.resumeAfterDays` in calendar days from the last executed exposure, in the completed-work ledger. That covers rotation back, the end of a substitution window, skipped sessions and exercises not used during a return.
- Add probe Z (Z1–Z4) as regression tests.

## Answers to the four questions

### Q1 — D50: in a held week the stepped easy run can equal the long run

**Accepted.**
- In 62 non-consolidation weeks the longest easy run equals the long run. Most are two 15-minute minimum sessions in weeks 1–2; some follow a held week.
- An easy run above the long run appears only in a pre-existing week-1 split of 45-minute athletes (25-minute easy run, 20-minute long run), never after a held week. It goes into R16.
- Equality creates no single-session spike. The evidence ties injury to a session longer than the longest run of the previous 30 days (Frandsen 2025), and the stepped easy run never exceeds the long run already prescribed.

### Q2 — D51: "in use" means prescribed in the week

**Confirmed.**
- In probe Y2, each of these keeps the return open until the exposure is executed:
  - a missed squat in the step-2 week;
  - every strength session missed in the step-2 week;
  - every strength session missed in the entry week.
- A week without strength exposure ends nothing.

**One consequence belongs to D52.** "Prescribed in the week" also covers the entry week's session dated inside the pause, which can never be executed. An exercise that first appears there becomes "established" without a log. Once the return ends, it comes back as a FROM_LOG row with no log. D52 (A) fixes that; the definition of "in use" stays as it is.

### Q3 — R14 as an open gap tied to G03

**Accepted as a non-blocking open gap for FREEZE-2.**
- Probe V still shows it: after a restart applied in the last two weeks before the race, the item states 0 although a 15-minute restart run was executed.
- Race day stays a completion, so no dose is affected.
- It understates executed running in an athlete-facing statement. Close it before any use beyond the offline reference, together with the Product/Data classification of sessions inside a declared pause.

### Q4 — the consolidation long run below an easy run

**Not required before the freeze. It is a non-blocking recommendation for the next policy revision (R16).**

My probe reproduces the effect on a larger grid:

| Measure (229 consolidation weeks with a long run) | Round-9 runtime | Now |
|---|---|---|
| Long run below an easy run (always by 5 minutes) | 5 | 25 |
| Week's longest run at or below the previous week's | 229 | 229 |
| Total running falls | 220 | 219 |
| A new easy level first appears | 8 | 18 |

- There is no single-session spike.
- The deload still cuts the week's longest run, and in almost every week its total running.
- The weeks whose running does not fall predate D50. A walk conversion or an easy step is planned into the consolidation week.
- A deload is a reduction of overall training stress (Bell 2023, Coleman 2024). No study addresses which session of a reduced running week must be longest.

This is a coherence issue, not a sporting risk, and fixing it needs policy text. **R16**, in the next revision, with a full delta review:
- keep the long run at least as long as the week's easy runs in consolidation weeks and in the first cold-start weeks, extending the R10 floor;
- plan no new easy level and no walk conversion into a consolidation week, so that its total running falls.

## Dispositions at hash 18ec48f3…

Evidence status is SUPPORTED_WITH_LIMITS for all ten boundaries.

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | None | Progresses after week 1 now; first-week split into R16 |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | **D52 before freeze** | D44, D45 and D48 unchanged |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | None | D50 resolved; Q1 accepted; Q4 into R16 |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | None | D50 resolved; the ladder advances |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | Unchanged |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | **D52 before freeze** | A missed substitute exposure skips establishment |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | **D52 before freeze** | D51 resolved; Q2 confirmed |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | None | R14 open gap (Q3) |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Skipped-session observation routed to Product/Data |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | **D52 before freeze** | D51 resolved; conditions 7 and 8 need executed exposures |

I rewrote the conditions that changed:
- **PLANNED-PROGRESSION and RUN-QUALITY.** The D50 conditions now name the long-run share cap precisely. A long run held at the single-run ceiling still counts as a step beyond the reference. Q1 is added.
- **NONCLINICAL-RETURN.** "In use" is defined (Q2). Exercises that reappear after a return enter by effort when they were never performed, or were last performed more than 28 days earlier.
- **LOAD-ESTABLISHMENT, SUBSTITUTION and ROTATION.** Establishment and re-establishment count executed exposures (D52).

## Non-blocking recommendations

| ID | Recommendation |
|---|---|
| R1, R2 | Unchanged from earlier rounds |
| R5 | Confirm a load logged far below the plan. Data owns the threshold |
| R8 | Collect the keep-or-change choice before the race window |
| R9 | Unchanged. Restart-built racers now reach 50–55 minutes, and no exemption is declared |
| R11 (rest) | Ask pregnancy/postpartum again at reviews and returns. Product/Data |
| R14 | Open gap tied to G03 (Q3). Close it before any use beyond the offline reference |
| R15 | Treat "cut back", "cut down" and the face and eye idioms as phrases, before any use beyond the offline reference |
| R16 | New (Q4). Long run never shorter than the week's easy runs in consolidation and first cold-start weeks; nothing new planned into a consolidation week |
| R17 | New. Declare the bodyweight case of `strength.resumeAfterDays`: today a bodyweight exercise resumes its earlier sets at RIR ≥ 3 after more than 28 days |

**Observation for Product and Data (G03).** Five weeks of missed strength sessions, while running continued, produced weekly holds and no question to the athlete. An unexplained interruption cannot be assumed nonclinical, so whether a run of missed sessions should prompt for a reason is theirs to decide. The dose consequence is D52.

## May the runtime be frozen as FREEZE-2?

**No.** `freezeVerdict.runtimeMayBeFrozen` is false, with D52 blocking. `scripts/freeze-r6-2.mjs` will refuse.

1. Fix D52 in the runtime, with probe Z as regression tests. It needs no policy change.
2. Request a narrow runtime delta check at hash `18ec48f3…`. Probes S2, Y2 and Z, the round-10 sections A–Y and the suite will be re-run, and the records re-issued with a new freeze verdict.
3. If the author also changes policy text, the new hash needs a delta binding review instead.
4. FREEZE-2 may follow only after that check.

**Before production, a KMP port or any real-athlete use:**
- re-review the free-text screen and its battery together with the structured intake design, including R11 and R15 (the owned open gap);
- close R14 with the G03 classification.

## Human queue

`ssctr-proposed-queue-items.json` (revision r10) proposes ten funded-human revalidation items, one per approved boundary at this hash, with the round-10 conditions.
- An approved envelope does not freeze the runtime.
- The r10 proposal supersedes the unmerged r1–r9 proposals. The r9 items named the same hash; their conditions are replaced.
- I did not edit the queue file, and funding is NOT_DECLARED.

## Escalation and routing

**No escalation.**
- No envelope magnitude is widened.
- No clinical boundary is weakened.
- D52 restores declared behaviour and needs no Founder decision.

**Routing:**
- **Runtime author:** D52, with R14 and R15 before any use beyond the offline reference.
- **Runtime author with Product Constitution & Governance**, in the next policy revision: R16 and R17.
- **Data / Engineering:** numeric plausibility of logged loads (D45, R5).
- **Product / Data:**
  - the pregnancy/postpartum re-ask (R11);
  - how sessions inside a declared pause are classified (G03, R14);
  - whether a run of missed sessions prompts the athlete for a reason (G03);
  - the learning-consent privacy scope, unchanged.

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with the bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

Written in this round:
- `ssctr-build-r6-r10.mjs`, the build script, which replays rounds 1–9 unchanged and adds round 10;
- `ssctr-probe-runtime-d50-d51-r10.mjs` and its `.out.json`;
- `ssctr-r10-literature.mjs`;
- in `ssctr-evidence/`: `search-r10.json`, `abstracts-r10.json`, `PMC13674372.xml` and `PMC11467040.xml`.

Updated in this round:
- `ssctr-policy-review.json`;
- `ssctr-records.json`;
- `ssctr-proposed-queue-items.json`;
- `ssctr-evidence-manifest.json`;
- `ssctr-schema-validation.json`;
- this file.

The `.r1`–`.r9` files are unchanged.
