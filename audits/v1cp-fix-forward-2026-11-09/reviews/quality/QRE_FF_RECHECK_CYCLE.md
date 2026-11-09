# QRE recheck of the V1CP Fix-Forward fix cycle (0950b0a)

Record: `QRE_FF_RECHECK_CYCLE.json`. If this summary and the JSON disagree, the JSON is right. Date: 2026-11-09. Fresh independent QRE instance. I authored none of the candidate, the cycle, its tests or its evidence.

## Verdict: NOT_READY (QUALITY_BLOCKED)

The fix cycle does what it claims. My round-1 blockers are closed, and all of its shipped evidence reproduces exactly.

The Founder asked me to classify the remaining fuzz findings. Doing that turned up one real defect: a dose-relevant D49 violation on the candidate's per-sport chain (QRE-FFC-01). It is BLOCKING under my round-1 criteria. It came in with the candidate (4630bca), not with the cycle, and round 1 missed it because I misattributed fuzz seed 544. No further fix cycle is allowed, so the mission closes NOT_READY with this named blocker.

## Named items
- **QRE-FF-01: CLOSED.** I tested 12 variants: a sign hold, a clinical break or a travel break, each followed the next day by a missed session, a schedule change, a preference change or the weekly review. None shows a Situation 1 marker of the superseded episode, and the doses match 5ee9dec. Fuzz: s1AfterRestart 78 → 0.
- **QRE-FF-02 (a): CLOSED.** A race in a CONSERVATIVE recipe step is now the athlete's own event (easy 15–20 min, no completion item). Fuzz: raceAtEffortInScope 1 → 0.
- **QRE-FF-02 (b): CLOSED.** After the date change the d49 week plans 2 sets (it planned 6 at 4630bca), as at 5ee9dec.
- **QRE-FF-03: CLOSED.** Fuzz: noGuidance 6 → 0. No directed test protects it (QRE-FFC-02, non-blocking).
- **QRE-FF-04: OPEN, non-blocking, unchanged.** The class and headline still say SHORT while classBySport says MODERATE.
- **QRE-FF-05: OPEN, non-blocking, unchanged.**
- **QRE-FF-06: OPEN.** Pre-existing since FREEZE-6. It blocks integration readiness.
- **QRE-V1CPR-05 and QRE-V1CPR-06: CLOSED.**
- **CF-OBS-2 test:** present, and it kills the D3-scope mutant.

## Runs (all on git-archive extracts)
- **Suite:** 1143/1143 at 0950b0a; 1132/1132 at 4630bca. The archive has no `node_modules`, so ajv was copied in.
- **Cycle tests:** on 4630bca, 8 fail (each for its stated reason) and 3 pass. On 0950b0a, 11 pass.
- **FREEZE-6 and 5ee9dec differentials, and journeys A–G:** byte-identical to the shipped files.
- **Fuzz, seeds 0–600:** the counts match `FUZZ_QRE_CYCLE.json` exactly at both commits.
- **Mutation:** 10 mutants killed. 4 survived, and I ran each survivor through a 600-seed behavioural differential:
  - MC-QRE02a: confirmed covered elsewhere.
  - MF-D3-strength: confirmed equivalent in practice.
  - The `>=` boundary: equivalent.
  - QRE-FF-03 mutant: not equivalent. Only the fuzz catches it.

## Residual fuzz classes
- **d49Executed (7 steps), four subclasses:**
  - 4 steps show a stale projection after an ASK or a clinical result. This is a checker limit, plus an integration risk: the client must never execute a plan that is not valid.
  - 1 step is the OBS-QRE-FF-4 reading. It was present at 5ee9dec, and the reading belongs to SSCTR.
  - 2 steps (seed 544) are **QRE-FFC-01, a real defect.**
- **programNotJsonStable:** a real defect, pre-existing since FREEZE-6. `canonical()` hashes keys whose value is undefined. It blocks integration readiness and real use, but not the shadow closure.
- **jsonRoundTripProgram:** the effect of that same root cause. All 415 flagged steps had an undefined value in their input. It fails closed (HOLD).

## QRE-FFC-01 (new, BLOCKING)
To reproduce:
1. Use known 6x8 rows.
2. Report MILD_ILLNESS, REDUCE_SUBSTANTIAL, 10 days. Strength drops to 1 set and is executed.
3. Report NEED_REST, REST, 2 days, with FASTER.
4. At the review, answer improved.

Week 3 then starts R3 at **4 sets after a week at 1**. At 5ee9dec the same sequence plans 1 set, then 2.

The cause is in `ladderCap`: it reads only the later episode's rungs, so the cap is lost across the chain. The next runtime mission picks this up: Engineering owns the fix, SSCTR rules the D49 base.

## CF-OBS-1
Reproduced at 0950b0a and found identical at 5ee9dec, apart from the declaration. A review sent without the reference state, with a stale one, or with an altered one plans over the record hold.

New finding: **a single lost reference launders the hold permanently.** Every later review plans over it, even when the reference is sent exactly as received.

My answers to Q1–Q7, in short:
- **Q1.** The record row is the source of truth.
- **Q2.** One standing-hold rule applies on every entry point.
- **Q3.** When the reference is absent or stale, the record decides. When it is invalid, the result is HOLD.
- **Q4.** Only a recorded release fact ends a hold. "A review without the reference" is never a clearance.
- **Q5.** The server keeps custody and refuses reviews that lack the record. The client never models a clearance by omitting state.
- **Q6.** A negative matrix of review kind × reference variant × record variant, plus a metamorphic property and a fuzz property at 0. The 28 qualified-clearance tests are migrated with a recorded release and a negative twin each, never deleted.
- **Q7.** Yes. CF-OBS-1 can stay a named integration blocker. It blocks integration readiness, real use, V1 authority and publication.

## States
- **Implementation:** done.
- **Technical validation:** not passed.
- **Integration readiness:** NO.
- **Real athletes:** NO.
- **Publication:** NO.
- **F08:** F08_OPEN.
- **V1_COACHING_AUTHORITY_READY:** NO.
