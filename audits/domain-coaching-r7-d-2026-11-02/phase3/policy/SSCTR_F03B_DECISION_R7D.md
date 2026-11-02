# SSCTR-R7D-F03B-r1: machine-stack load progression (F03-B)

**Outcome: DECIDED.** 2026-11-02. A fresh SSCTR instance (AI agent) decided this as PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: no human credentials, no human, empirical or clinical validation. It is independent of the request author and of the parallel PCG instance; the PCG record was not opened. This instance authored the rule, so its implementation must be judged by a different SSCTR instance. Structured record: [SSCTR_F03B_DECISION_R7D.json](SSCTR_F03B_DECISION_R7D.json).

## Scope

The question is F03-B only. It covers the ten MACHINE_STACK configurations of R7B0-CATALOG-2 in the offline synthetic shadow reference, for nonclinical adults. Precondition: F03-A, so a machine KNOWN row states KG. Out of scope:
- the authority form (PCG);
- the other conventions;
- establishment, return and re-establishment paths;
- any clinical judgment, since none is needed.

## What the runtime does now

Witness rerun live; scratch probe outside the repository.
- If the athlete keeps the real setting because +1 kg is not settable, the plan oscillates (140, 141, 140) and never moves.
- If the athlete uses the real next setting (145, 55, 62), every machine is asked about every week. Meanwhile the plan's own +1 kg track drifts away from what is lifted (141, 142, 143).

## Verdicts

| Option | Verdict | Why |
|---|---|---|
| A. Hold, repetitions only | **ACCEPT_WITH_CONDITIONS, fallback only** | Safe and no fabricated load. But an executable value never becomes known, so machine loads cap permanently, and a STRENGTH-goal machine MAIN never progresses load (strength rises with load: WELL_SUPPORTED). Use only if B' is inadmissible, with the plateau disclosed. |
| B. Athlete's next setting from executed evidence | **ACCEPT_WITH_CONDITIONS (chosen, as B')** | The step is the machine's own: executed, logged, then verified. There is no number in the engine. Effort-gated load selection is supported, and it keeps progression for every goal. |
| C. Equipment-declared increment | **REJECT (this phase)** | It needs a new input, an override of the policy value and a number in the engine. It gives nothing B' lacks. Equipment detail stays with Product/Data (B0-F07). |

## Chosen rule F03B-MACHINE-STEP-r1 (B')

1. **No computed machine load.** Nothing is ever R ± an increment, a fixed kilogram step or a rounding. Every number a machine row states was reported or logged by the athlete and then adopted.
2. **When a step is due** (existing trigger, cadence and development weeks), the next exposure is a numberless next-setting row:
   - "Move to the next heavier setting this machine allows above R kg (plate, pin or add-on)."
   - The target is the existing load-step target: the bottom of the range in REPS_THEN_LOAD; the current target in LOAD.
   - The prescribed reserve applies.
   - "If it does not fit, keep R at the dose held before the step. Record the load and unit."
   - A step that was not executed is offered again only at the existing cadence, never as a second step.
3. **Adoption of a heavier value H**, which requires all of the following:
   - KG or LB in MACHINE_STACK;
   - 0–500 kg;
   - the existing ADVANCE criterion at that exposure;
   - verification by the existing D45 mechanisms: an athlete confirmation, or a second executed log of the same exercise at the same value;
   - never above a re-establishment or return ceiling.

   Until H is verified, R stays the reference and one question is raised. Each later exposure repeats the same next-setting row relative to R and never states H (D48). The ADVANCE exposure alone is not enough: the engine cannot verify in kilograms that H is one setting above R.
4. **No heavier setting fits.** A step-due exposure logged at R holds the earlier dose: R at the top of the range, or R at the LOAD target. It never restarts the range.
5. **REGRESS.** It goes back to the previous adopted setting when that is held continuously. Otherwise it lowers repetitions by repStep, never below the bottom of the range. It never computes R − 1 kg, and it drops a pending H.
6. **LOAD mode** (STRENGTH-goal machine MAIN) is covered by rule 2 at each due tick. No repetition progression is added.
7. **Bounds** on a logged step are existing ones only: 0–500 kg, ADVANCE, ceilings, units and conventions, and D45 verification. `maximumIncrementsAbovePlanned = 1` reads as one machine setting (the runtime's STACK_STEP; the catalog convention). The engine does not compute it.

Directed tests T1–T11 are in the JSON. They check, among other things, that no machine row ever states a computed value, that adoption needs verification, that the dose holds without oscillation, that REGRESS behaves as stated, and that other conventions and the policy hash are unchanged.

## New prescriptive authority: none

The rule sets no dose, threshold, increment, cap, tolerance or cadence, and it removes the computed ±1 kg. Two behaviours are new to machine KNOWN references: the numberless row and a pending heavier value. Both apply existing D45/D48 semantics. PCG decides whether that is an interpretation or a change in substance. The domain constraints on that decision:
- no edit to policy values (the R6 hash);
- no weakening of D44, D45 or D48;
- keep A's conditions available as the fallback.

## Conditions

- C1: F03-A ships with or before this rule.
- C2: No computed machine load exists in any path, and a test proves it.
- C3: Adoption needs ADVANCE plus D45 verification, and the row never states a pending value.
- C4: No new number. If one is needed, return to the SSCTR.
- C5: Policy and catalog bytes are unchanged, and the R6 boundaries stay enabled.
- C6: The rule applies to MACHINE_STACK only.
- C7: The residuals are disclosed in the binding record.
- C8: A different SSCTR instance judges the implementation.
- C9: The rule holds for the shadow reference only.

## Residuals (disclosed, non-blocking)

- **R-01, plateau** when no heavier setting fits, mostly in LOAD mode. Holding is not harmful; overload is needed only for continued progress.
- **R-02, step size unverifiable**: a two-setting jump with ADVANCE and verification is adopted.
- **R-03**: RIR imprecision.
- **R-04**: machine identity across gyms (B0-F07).
- **R-05**: plausibility of logged values (Data).
- **R-06**: self-selected loads err light.
- **R-07**: at most one question per step.
- **R-08**: SINGLE_IMPLEMENT has the same structure; not decided here.
- **R-09**: the machine establishment agreement check is unchanged.
- **R-10**: limited applicability of the evidence (short trials, young or trained samples, no concurrent-training runners).

## Evidence (read level)

| Source | Read level |
|---|---|
| Plotkin et al. 2022, PeerJ, RCT, PMC9528903 | Full text (identical to R6-S11) |
| Hickmott et al. 2022, Sports Med Open, SR/MA, PMC8762534 | Full text |
| Currier et al. 2026, ACSM position stand, PMC12965823 | Full text (identical to R6-S01) |
| ACSM 2009 position stand, PMID 19204579 | Abstract only (publisher returned 402); its relative-increment recommendation is not adopted |
| Kraemer et al. 2002, PMID 11828249 | Abstract only |
| Chaves et al. 2024, Int J Sports Med, PMID 38286426 | Abstract only (directed counterevidence; reports no difference) |
| Halperin et al. 2022, PMID 34542869 | Abstract only |
| Steele et al. 2022, PMID 35790622 | Abstract only |

- **Negative search:** no trial on load-increment size or machine-stack progression. Any step number is INSUFFICIENT_EVIDENCE.
- **Overall evidence status:** SUPPORTED_WITH_LIMITS.
- **Confidence:** MODERATE.

## Funded-human revalidation

A queue item is needed and is **PROPOSED only** in the JSON (`HQ-R7D-SSCTR-F03B`, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, owner Chief / Founder). The queue file was not touched. The coordinator or Chief appends it if the decision adopts B', or A under its conditions.

## Governance

- **Status:** gate NOT_CLOSED_BY_THIS_RECORD; NOT_PUBLISHED.
- **Expiry:** review by 2027-05-02, or earlier on any listed trigger:
  - a policy, catalog or convention change;
  - an equipment-increment input;
  - a new SR/MA;
  - a scope change;
  - an adverse event or runtime inconsistency;
  - human revalidation.
