# R7-D Phase 5: SSCTR domain review, r2 (QRE-P5-F02 ruling)

**Record:** SSCTR-R7D-P5-REVIEW-r2, 2026-11-08, candidate `c7c72e5`. The full record is in `SSCTR_PHASE5_REVIEW_R7D_r2.json`. `probes/build-r2-record.mjs` built it from r1, so every r1 field is carried and r1 stays unchanged as history. r2 supersedes r1 only by what it adds.

This is still a PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY review (nonclinical). It claims no human, clinical or empirical validation and adds no number.

## Disposition: ACCEPT_WITH_CONDITIONS (unchanged)

There are no blocking findings, and no narrow adjustment is requested.

## QRE-P5-F02

I re-ran the QRE probe on both runtimes: P8 is byte-identical to the QRE output. I also extended P8 through week 9.

**P8 (a session skipped in the entry week): inside strengthEntryWeek and D55, with D52.** ACCEPTABLE_ALTERNATIVE (SSCTR-P5-O06).
- **The plan met the entry rule.** Week 4 planned every exercise in use at the entry dose, including the skipped session. That satisfies strengthEntryWeek and Δ47.
- **The skipped exercises then fall under D55.** They establish nothing (D52). Their first exposure comes in a return-step week, which is exactly D55's case: "first set up while an exercise in use is in the return steps".
- **They stay inside D55's limits.** They take the effort-guided establishment, at most 2 sets at RIR3. They then rise at most one set per executed week, never go above the normal count, and earn no block. FREEZE-5 credited blocks on this path and reached 4 sets in week 9.
- **Logged loads change nothing harmful.** When the entry loads are logged, the whole entry week repeats.
- **How far this is from a strict reading:** one set and one RIR at the first exposure. It is not the F01 defect.
- **The strict reading has no approved basis.** It would require the entry dose to follow a skipped exercise until it is performed. That is a new rule, and it would cause the indefinite entry repeats recorded in O02.

**P9 (loaded rows done without a usable load): inside D52/D55.** This is SSCTR-P5-O01, now explicit for every week until a load is logged.
- These rows take the effort-guided establishment.
- They never rise without a log.
- Once a load is logged, D55 governs them.

**Narrow change:** none is needed. The QRE's one-line idea is not narrow: it would contradict D55, and it would cause O02-style indefinite entry repeats.

**K-P5-F1:** satisfied by this record.

## CF2

CF2 is carried, provided the coordinator passes r2 as `--ssctr`. `freeze-r7d-6.mjs` then copies:
- `conditionsForFreeze` verbatim into `reviews.ssctr.conditions`;
- `findings` verbatim into `disclosures.ssctrFindings`.

It also binds this folder by SHA-256. The freeze record is the vehicle for the disclosures, so PREREG-8 stays unchanged.

The coordinator should check two things after the freeze:
- that the recorded conditions are exactly the list below;
- that the holdout judgment requests name CFD-1 to CFD-5.

## Conditions for the freeze (copied verbatim by the script)

- **CF1:** the freeze binds exactly the reviewed runtime bytes.
- **CFD-1:** the step-2 arithmetic.
- **CFD-2:** loads not usable (P9, O01).
- **CFD-3:** a session skipped in the entry week (P8, O06). A credited block, a count above the normal count, or a rise of more than one set in a week on this path is a D55 deviation.
- **CFD-4:** the unlogged entry repeats (O02), a known residual.
- **CFD-5:** interface 8 §5 rests on CC-F05.

r1's conditions C1–C4 are carried.

## Queue

The queue item is still proposed only, and the queue is unchanged.
