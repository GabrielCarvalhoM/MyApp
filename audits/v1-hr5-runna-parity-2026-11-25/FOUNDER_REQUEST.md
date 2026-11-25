# Founder request: HR5 Runna parity correction (2026-11-25)

**An explicit Founder product decision.** The text below is the Founder's instruction as received in the session, condensed without changing its meaning. The original is in Portuguese; the binding points are quoted.

## Decision

> "O RepMile deve calcular e disponibilizar cinco zonas de frequência cardíaca para todo atleta com idade válida, independentemente de possuir relógio, cinta cardíaca, exame laboratorial ou histórico de frequência cardíaca."

The reference is the behaviour the Runna support articles document:

- 6359409, understanding and training to heart rate;
- 10547417, using your heart-rate device with Runna;
- 6205998, adjusting your estimated race time and pace targets.

## What is required

1. **Initial calibration.**
   - The maximum is estimated as `220 − age`, from the valid age collected at onboarding.
   - The five zones exist with no wearable, marked as an estimate.
   - No lab, chest strap or effort history is required.
   - An invalid age or value stays refused.
2. **Default bands, as % of maximum heart rate.**
   - Z1 up to 65.
   - Z2 above 65 up to 81.
   - Z3 above 81 up to 89.
   - Z4 above 89 up to 97.
   - Z5 above 97.
   - The bpm edges are defined and tested exactly, with consistent rounding, no gaps and no overlaps.
3. **Personalisation.**
   - The athlete can enter and change the maximum manually.
   - The athlete can customise the five zones' limits, with an ordering check.
   - Explicit overrides are kept and never overwritten automatically.
   - Estimated, declared and measured references are kept apart.
   - More reliable references are incorporated when available and authorised.
4. **Wearables.**
   - The five zones exist without one.
   - With heart-rate data, valid measurements are classified into the zones.
   - The contract is prepared for HealthKit series.
   - Optical sensors are allowed for analysis and presentation, with their provenance kept.
   - Time in zone is computed only from sufficient time samples, never from an average.
   - A synced watch is never assumed to give live heart rate on the iPhone.
5. **Prescription and safety.**
   - Pace and RPE keep governing prescription and progression; heart rate is an additional reference only.
   - Heart rate never changes the plan automatically.
   - A maximum estimate is never medical evidence, a measured threshold or a trigger that releases a safety block.
   - Recovery, screens, limitations and hybrid training are preserved.
   - The five zones become the canonical operational heart-rate model. The three old domains are kept only where there is a legitimate dependency, never forced onto the new bands.
6. **Implementation.**
   - Correct the HR5 amendment rather than build a parallel system.
   - Update the calculation, schemas, source data and availability states.
   - Keep historical contracts where needed.
   - Prepare the Swift delta for CoachingHost and SwiftUI.
   - Not in scope: screens, backend, the full HealthKit integration, and Figma.
7. **Validation.**
   - Unit tests.
   - With and without a wearable.
   - Estimated, measured and custom maximum.
   - Override persistence.
   - Safety and sporting regression.
   - Node × macOS JavaScriptCore, and the iPhone through the device lock.
   - An independent scientific review that tells operational estimates apart from physiological measurements.

   > "Não permita que a exigência de precisão laboratorial impeça a experiência de cinco zonas estimadas."

8. **Closing.**
   - Keep the historical freeze and the first amendment.
   - Record an auditable successor amendment.
   - Run the verifiers.
   - Commit, push, and check that the remote equals local.
   - Write the final report.

## Acceptance criteria (verbatim intent)

1. A 30-year-old athlete with no wearable gets five estimated zones.
2. An athlete with measured heart rate keeps five zones.
3. An athlete with a custom maximum gets five zones recalculated correctly.
4. No valid user loses the five zones for lack of a lab test or chest strap.
5. Missing measurements produce no fictitious zone distribution.
6. Pace, RPE, strength and safety stay correct.
7. Node, JavaScriptCore and the iPhone agree.
8. The final work is published on the remote.

## Authority

- This decision supersedes, for the five-zone reading only, SSCTR-HR5-DECISION-r1 items HR5-1, the reference rules of HR5-2 that refused an age formula or a declared maximum, and HR5-5's "no zones without a measured reference".
- It does not supersede the clinical boundary (CLINICAL_HUMAN_REQUIRED), the three-zone `heartRateZones` reading (SSCTR-V1RC-DECISION-r1 Q6, kept byte for byte), or any training-policy rule.
