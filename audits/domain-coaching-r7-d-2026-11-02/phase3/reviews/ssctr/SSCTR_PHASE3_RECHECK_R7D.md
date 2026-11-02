# R7-D Phase 3: narrow SSCTR recheck (`SSCTR-R7D-P3-RECHECK-r1`)

**Disposition: ACCEPT_WITH_CONDITIONS.** 2026-11-02. No blocker on any question.

**Who.** A fresh SSCTR instance (AI agent, claude-opus-5-5, xhigh) under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: nonclinical sporting judgment only, no human review, no clinical, human or empirical validation.
- It did not write the runtime, the tests, the harness, PREREG-2, the evidence, rule F03B-MACHINE-STEP-r1 or the PCG record. So it meets condition C8 of the rule.
- It did not open `phase3/reviews/engineering/`.
- Structured record: [SSCTR_PHASE3_RECHECK_R7D.json](SSCTR_PHASE3_RECHECK_R7D.json). Where the two differ, the JSON prevails.

**What was judged.** Candidate `7039bc1`, runtime source bytes of `9e1ecbf` (unchanged at `d4725e6`), against R7C-FREEZE-4 (`a9654c8`) rebuilt outside the repository. Scope is DX-02, F03-B and F04 only, as the Founder asked.

**How.**
- I read the full source diff and the code around it.
- I ran the directed tests: 23/23 pass.
- I ran the committed probes, the harness on D08, D14 and D18 as regression only, and eight probes of my own on both runtimes. They are in [probes/](probes/).
- Literature: WebSearch works. PubMed pages were blocked by a cookie wall; Europe PMC returned abstracts. No full text was read.

## Answers

| # | Question | Verdict |
|---|---|---|
| 1 | DX-02: return and re-entry without undue dose | **NO_BLOCKER** |
| 2 | F03: executable unit and progression; fidelity to the rule, C1–C9; flagged 3 and 4 | **NO_BLOCKER** |
| 3 | F04: adverse signals kept despite `confounded` | **NO_BLOCKER** |
| 4 | New prescriptive authority | **No new number.** F03-B's new behaviour is the one already approved by the rule record. |
| 5 | Flagged 1, 2 and 5 | **Disclosed non-blocking residuals**, routed below |

**1. DX-02.**
- **Weekly review carrier:** a weekly review that declares a break now gives exactly the decision a return report gives, for breaks of 3 to 60 days and for a late declaration. FREEZE-4 ignored the break in every one of these.
- **Dose after a 14-day break:** EASY 15 / LONG 20, then 30 / 30 / 40, with no quality. FREEZE-4 gave 45 / 60, VALID. D18 a6 now re-enters at LONG 20 instead of 70.
- **Fails closed:** a break that is ongoing, in the future, of unknown nonclinical status, malformed or made of null fields is asked about, with REQUIRES_RECONCILIATION.
- **Clinical first:** a clinical flag or a clinical reason routes clinically through every carrier tested.
- **Other event kinds:** asked; nothing applied; no prescription under REQUIRES_RECONCILIATION.

**2. F03.**
- **C1–C6 and C9 met; C8 met by this record. C7 is pending:** the freeze record must carry the disclosures (CF-02).
- **No computed machine value anywhere.** Real plates are climbed (leg press 140 → 150 → 160). When no heavier setting fits, the dose holds at the top of the range with no oscillation.
- **Adoption needs ADVANCE plus verification,** and a row never states a pending value.
- **Flagged 3 is an acceptable reading.** It is the literal rule P3, it is conservative, and it costs one extra question.
- **Flagged 4 is an acceptable reading.** A dumbbell control under the same pattern repeats its stepped load. The machine re-offers the same step, effort-gated, and is no more aggressive.

**3. F04.**
- **Candidate:** across a 32-cell matrix, an adverse recovery or an impaired next day is ADVERSE (HOLD) even when confounded. Two such runs in 14 days REGRESS, as two unconfounded ones do.
- **FREEZE-4:** it masked all 16 confounded cells and advanced.

## Flagged behaviours 1, 2 and 5

| # | Finding | Class | Routes to |
|---|---|---|---|
| 1 | P3-F01: the answer is asked again after clearance (fails closed, no run dose) | Non-blocking, pre-existing | G03; Founder/PCG with G04 (F08). I do not ask to weaken CARRIER_CLINICAL. |
| 2 | Clinical route, then clearance. A plain review that omits the break is VALID with pre-break doses (EASY 45 / LONG 60). Same on FREEZE-4 | Non-blocking for Phase 3. Safety-relevant across decisions (low to moderate). It reduces to F07 / F08 / QE-R7C-08. F08 "fails closed" holds only when the return re-declares the clinical reason | Founder/PCG with G04 owners; G03 |
| 5 | Another event kind plus a break → ASK, not retained. A later plain review without the break is KEEP / VALID with the stale plan (same end state as FREEZE-4) | Non-blocking for Phase 3. Safety-relevant across decisions | G03 (send the break on its own); a later mission (retain the break, or apply the return and ask only about the event). **Founder interpretation flag:** "factual whatever the carrier" is implemented here as clinical screen plus ASK |

## Other observations (none blocks)

- **O-1:** a valid second equal machine log can be missed when the week of the first log was reviewed KEEP and is incomplete. The cause is the facts-only reading of the evidence reducer, which is pre-existing.
  - Effect: adoption is delayed and 2–3 questions are asked per step.
  - Reproduced with `f03b-verify-gap.mjs … PIN`.
- **O-2:** a log at R on a step row is gated against the step's repetitions, not the fallback's. R × 9 against a fallback of R × 12 counts as ADVANCE.
  - Doses stay within executed capacity.
  - But repeated underperformance there never reaches REGRESS, and a block-boundary set can be earned.
- **O-3:** PCG I-1 makes machine establishment agreement, hint agreement and duplicate tolerance equality-only. Rule residual R-09 no longer describes the runtime. This is stricter, and it is accepted.
- **O-4:** the harness domain packet shows a next-setting row as "last logged" and hides the instruction. Fix the renderer before any domain judging of the holdout.
- **O-5:** the committed F03-B athlete probe logs NaN on three unlisted machines. Its question counts are inflated; its main conclusions hold.
- **O-6:** a template interruption with only null fields declares a break every week (fails closed).
- **O-7:** a PARTIAL run with adverse recovery does not count toward the repeated-adverse rule. Pre-existing and outside F04's scope.

**Further residuals:**
- **R-DX02-2:** re-sending an already applied break re-anchors the re-entry, so the athlete is stuck at 15 / 20. This is pre-existing return semantics, now reachable through the weekly review.
- **R-DX02-3:** a late declaration discards tolerance the athlete demonstrated after the break. Pre-existing and conservative.

## Conditions for the freeze

| Id | Condition |
|---|---|
| CF-01 | Bind this record by sha256 in R7D-FREEZE-1, next to the F03-B SSCTR and PCG records. It accepts only the six listed source files; any byte change needs a new recheck. |
| CF-02 | Disclose rule residuals R-01..R-10 (R-09 restated per O-3), O-1, O-2 and the readings of flagged 3 and 4 (meets the rule's C7). |
| CF-03 | Disclose R-DX02-1/2/3, P3-F01 and O-6, plus the G03 consumer conditions: a break is sent once; when asked, it is sent on its own first; it is re-declared after a clearance; no template object is sent. Correct the F08 "fails closed" label. |
| CF-04 | Render `load.nextSetting` in the harness domain packet before any domain judging of the holdout. Renderer only, with no oracle or criteria change. |
| CF-05 | Carry the Founder interpretation flag of flagged 5. |
| CF-06 | State that Phase 3 adds no new dose, threshold, increment, tolerance or cadence number. Shadow reference only; V1 authority stays NO. |
| CF-07 | The authorized owner appends the proposed human-revalidation items, naming R7D-FREEZE-1. |

## Funded-human revalidation

**PROPOSED only:** `HQ-R7D-SSCTR-P3-RECHECK`, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, owner Chief / Founder.
- It covers acceptance of DX-02 and F04, which change prescribed training although no number is new.
- It is linked to `HQ-R7D-SSCTR-F03B`.
- The queue was not touched.

## Status and expiry

- **Status:** the gate is not closed by this record; not published; not Product Truth.
- **Clinical:** no clinical judgment was made.
- **Python:** not available, so `validate_records.py` was not run.
- **Review by 2027-05-02,** or earlier on any of:
  - a runtime byte change;
  - a policy or catalog change;
  - a holdout result touching P05, P08, P09 or machine rows;
  - a decision on F07, F08 or G03;
  - a new SR/MA;
  - an adverse event;
  - human revalidation.
