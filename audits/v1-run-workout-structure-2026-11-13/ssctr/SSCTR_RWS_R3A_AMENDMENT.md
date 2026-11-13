# SSCTR-RWS-R3A-AMENDMENT: what was measured, what was declared, and when a distance target is met (2026-11-13)

`SSCTR_RWS_R3A_AMENDMENT.json` is the authoritative record. Its values are version **RWS-R3A-1**, which amends RWS-R3-1. Only r3 C3 (target met) and r3 C1 CT-3 with C2 (history sources) change. Every other r3 item, value and worked example stands.

**Author.** An AI instance of the SSCTR acting as decision author, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only.
- It is independent of the Chief, who wrote the request.
- It holds no human credentials. This record is not human, clinical or empirical validation.
- It enables no boundary and judges no implementation.
- No frozen file, queue or code was changed.

**Founder rule (as given, not reopened).** A distance target is met only when the distance was actually covered. A measured 15.52 km does not by itself show 16 km. Executed distance is never invented. A correction is allowed on reasonable evidence of a measurement failure, and the original value is kept. Absolute precision is never demanded. A technical tolerance is never a sporting completion.

**Literature access.** The Europe PMC REST API was reachable; Frandsen 2025 resolved by PMID. No new search was needed, because no amended rule needs a source r3 does not already hold. All sources are reused from r3 as summarised there, and none was re-read in full this run. Python is unavailable, so the skill validator did not run; Node confirmed that the JSON parses.

## Rulings

| Q | Ruling | Kind | Conf. |
|---|---|---|---|
| **A1** Target met | APPROVE_WITH_CONDITIONS. The automatic 0.97 is removed. | Founder rule as given; 0.91 is a conservative heuristic; the fact model is a data requirement | LOW (MOD for the fact model) |
| **A2 (i)** CT-3 class | APPROVE: an expression bound, not a safe threshold, dose or progression rule | Conservative heuristic | LOW |
| **A2 (ii)** History sources | APPROVE_WITH_CONDITIONS | Data requirement and heuristic | LOW |
| **A2 (iii)** Effect | CONFIRMED: it changes only the expression, never the dose, step or credit, and never blocks a session | Structural | MOD |
| **A2 (iv)** Longer window | NOT ADOPTED: 30 days for everyone | Abstention | MOD (that a longer window would be inert) |

### A1: four facts, three bases

**The four facts kept for every run:**
- **Measured distance.** Immutable, with its source (track count, measured course, treadmill display, GPS or device) and its quality. Segments of one run, for example after a restart, are each kept and summed.
- **Declared distance.** The athlete's figure. When it corrects a measurement it carries a reason from a closed list: SIGNAL_LOSS; OBSTRUCTED_SKY (tunnel, tall buildings, dense tree cover); AUTO_PAUSE; DEVICE_RESTART.
- **Source reliability.** OK, UNKNOWN or POOR. POOR is set only by a device flag or by an athlete's failure reason. UNKNOWN, for example on an import, counts as usable.
- **Target met.** Yes or no, with its basis.

**Met on exactly three bases:**
- **MEASURED.** A usable measurement is at or above the target, and the athlete has not declared less.
- **CONFIRMED_CORRECTION.** The measurement is below the target or device-flagged POOR. The athlete declares at least the target with a listed reason, or the device flag serves as the reason. The measurement is at least 0.91 × target. The measurement is recorded as POOR and its original value is kept. This is the lowest tier, and it is never calibration evidence.
- **DECLARED.** There is no measurement and the athlete explicitly declares at least the target. This is also the lowest tier.

**Not met:**

| Situation | Status |
|---|---|
| Usable measurement below target, no answer | PARTIAL + one ASK (stop reasons, correction, or "I ran less") |
| Declares the target, no listed reason, against a usable shorter measurement | UNKNOWN (MEASUREMENT_CONFLICT) + ASK |
| Declares the target with a reason, but the measurement is below 0.91 × target | UNKNOWN + ASK to add a measurement of the missing part |
| Device-flagged POOR measurement, no declaration | UNKNOWN + ASK |
| Declares less than the target, whatever the device says | PARTIAL |
| Nothing measured, nothing declared | UNKNOWN |

**Repetitions** are unchanged: the lap decides.

**Changes from the author's proposal:**
1. **0.91 bounds declarations, not failures.** 9% is the largest under-reading documented for a working watch. A restart or a tunnel can lose more. A larger shortfall therefore needs a measurement of the missing part, which is then summed and classified as MEASURED, rather than a bigger declaration.
2. **Tree cover joins the reason list.** The device study documents under-reading in forest. The list is closed: Product words the reasons but adds none without re-review.
3. **The device's own POOR flag counts as the failure reason.**
4. **A declaration below target is PARTIAL even if the device reads more.** Devices also over-read.
5. **X-2 change (consequential).** A PARTIAL that rests only on a usable measurement of at least 0.91 × target, with no stop and no answer, neither counts nor resets X-2. Otherwise two device under-readings could pause a class for 28 days, which would be fictitious misfit, the mirror of fictitious completion.
6. **History change (consequential).** A run's history distance is the smaller of its usable facts, so a correction never inflates history.
7. **Quality UNKNOWN is usable.**

### A2: the CT-3 history bound

**(i) What CT-3 is.** D ≤ 1.10 × L30 keeps an uncapped distance target inside Frandsen 2025's reference group: single sessions up to 10% above the longest run of the previous 30 days. Frandsen is observational, and even 1–10% increases were associated with a higher rate in its sensitivity analysis. The 1.10 is therefore an outer edge, not a safe threshold.

**(ii) Where L30 comes from.** L30 is the largest history distance among runs of any family and any status, races included, dated within 30 days.
- **Sources:** the engine ledger, HealthKit imports, manual entries, and an intake declaration of one run that carries a distance and a run date. The same run counts once.
- **History distance of a run:**
  - Usable measurement only: the measured value.
  - Declaration only: the declared value.
  - Both: the smaller of the two.
  - Device-POOR measurement only: none.
- **Never used:** undated declarations, weekly totals and minutes-only figures. Minutes are never converted to kilometres.

The source rule changes the proposal in two ways:
- **One rule for all declarations.** The proposal gave a no-device declaration nothing while accepting the intake at face value. The two are the same kind of fact, so one rule now covers both.
- **The current intake contributes nothing.** It stores minutes only, dated at the intake day. Adding a dated distance field is a Product/Data choice.

The same history distance feeds C2's comparable long run. A corrected run qualifies by its minutes, with S2 taken from its measured distance, which can only slow sizing. An intake declaration never qualifies, because the first LONG of a plan is TIME (r3).

**Why generous sources are acceptable.** CT-3 rarely decides alone.
- CT-1 caps D at the planned minutes at the athlete's own slow pace.
- For LONG, C2 requires a recent run of nearly the same minutes. That keeps D within about M/(M − 5) of that run's distance, which is below 1.10 once M is 55 min or more.
- The engine already doses from self-reported intake history.

**(iii) What failing CT-3 does.** CT-3 may pick a smaller native D, but only while CT-2's dose floor holds. Otherwise the session is TIME at the same dose. It never changes M, family, step, credit or load, and it never blocks a session.

**(iv) A longer window.** Not adopted, for three reasons:
- No evidence supports a longer reference.
- It would be inert: P1 needs 3 easy runs in 28 days and C2 needs a comparable run in 28 days, so both fail first.
- The cost of keeping 30 days is a TIME expression until new runs are recorded.

## Replaced r3 keys (RWS-R3A-1)

| r3 key | Change |
|---|---|
| `tiedValues.gpsMetFraction` | **Removed** |
| `tiedValues.gpsConfirmedFloorFraction` | Renamed `correctionFloorFraction`; 0.91 unchanged; now applies to declarations only |
| `tiedValues.distanceReferenceMaxFraction` | 1.10 unchanged; classification restated |
| `completion.continuousBySource` | Replaced by `completion.continuous` |
| `statuses.PARTIAL`, `statuses.UNKNOWN` | Redefined |
| `exposure.X-2.counting` | Adds the device-error exception |
| `continuous.checks.CT-3` | New L30 definition; classification, effect, window |
| `continuous.paceSizingSources.S2` | The corrected comparable run only |
| `eligibility.continuous.LONG.comparableLongRun` | Sources stated |
| `suppression.newDefinitions.DISTANCE_HISTORY_UNKNOWN` | Rewritten |
| `textRequirements.afterRun` | Updated |

Added: `runFacts` and `historyReference`. The tied numbers are 0.91, 30 days and 1.10, all carried from r3. No new number is introduced.

## Worked examples

Athletes:
- **A** is r3's: 16 km LONG at M 100, L30 15.5. Here 0.91 × 16 = 14.56.
- **B** is EXPERIENCED, with recorded easy runs of 7–8 km and an EASY session of M 60.
- **C** is EXPERIENCED and has no recorded run in 30 days.

| WE | Case | Expected status | Basis / rule kind | Tier | History km |
|---|---|---|---|---|---|
| 01 | GPS 15.52 (OK), no answer | PARTIAL + one ASK. Step holds; X-2 neither counts nor resets. | Founder rule; heuristic (X-2) | GPS | 15.52 |
| 02 | Same + declares 16, SIGNAL_LOSS | DISTANCE (15.52 ≥ 14.56); quality POOR, 15.52 kept | CONFIRMED_CORRECTION; Founder rule bounded by heuristic | lowest | 15.52 |
| 03 | Same + declares 16, no reason | UNKNOWN (MEASUREMENT_CONFLICT) + ASK. Not adverse; step holds. | Founder rule | GPS | 15.52 |
| 04 | GPS 14.0 (OK) + declares 16 | UNKNOWN (conflict) with or without a reason (14.0 < 14.56); ASK to add the missing part | Heuristic (0.91) | GPS | 14.0 |
| 05 | No device, declares 16 | DISTANCE; never calibration evidence | DECLARED; Founder rule | lowest | 16 |
| 06 | Track, 40 laps of 400 m | DISTANCE | MEASURED; Founder rule | TRACK | 16 |
| 07 | B: only long run is an intake 15 km | **LONG:** TIME (LONG_HISTORY_NOT_COMPARABLE).<br>**EASY, intake with distance and date:** NATIVE 9.5 km (about 55–59 min; CT-3 bound 16.5).<br>**EASY, current minutes-only intake:** L30 8, bound 8.8, 8.5 km fails CT-2, so TIME. Dose is 60 min in every case. | Data requirement and heuristic | DECLARED | 15 or none |
| 08 | C: empty 30 days after a taper | TIME, reported as the first reason in r3 order: mode or phase if set, else CONTINUOUS_PACE_UNOBSERVED (DISTANCE_HISTORY_UNKNOWN is also true). No longer window. Repetitions are not affected. Dose unchanged. | Abstention and data requirement | none | none |
| 09 | GPS 16.4, device POOR | **No answer:** UNKNOWN + ASK, no history.<br>**Declares 16:** DISTANCE, CONFIRMED_CORRECTION, history 16 (the smaller value). | Founder rule | lowest | none or 16 |
| 10 | GPS 14.0, DEVICE_RESTART, adds a 2.1 km second file | DISTANCE (16.1 measured, segments kept) | MEASURED; data requirement | GPS | 16.1 |
| 11 | GPS 16.3; the athlete later says "cut short, about 15" | PARTIAL; X-2 counted | Founder rule | DECLARED | 15 |

**r3 examples superseded:**
- **WE3-07 (GPS 15.6)** and **WE3-08 (GPS 15.0):** no longer met by measurement.
  - With a listed reason: CONFIRMED_CORRECTION.
  - Declared without a reason: UNKNOWN.
  - No answer: PARTIAL + ASK.
- **WE3-09 (GPS 14.0, confirmed):** UNKNOWN for both good and poor GPS. The r3 poor-GPS MANUAL route below 0.91 is withdrawn.
- **WE3-10:** renamed DECLARED; the outcome is the same.
- **WE3-23:** renamed MEASURED/TREADMILL; the outcome is the same.

## Escalations

**Founder (information, not blocking).** A watch reading slightly short now needs the athlete's answer with a cause before the target counts as met. A shortfall beyond 9% needs a measurement of the missing part; otherwise the run is UNKNOWN and the step holds. A no-device declaration still meets the target at the lowest tier, as r3 already allowed. It rests on the athlete's explicit word and never on missing data. The Founder should confirm that this stays the intent.

**Chief.** Update handoff sections 3–5 with:
- The removal of 0.97.
- The four facts and three bases.
- The not-met table and the closed reason list.
- The history rule and the L30 sources.
- The X-2 exception.
- The CT-3 class and effect.
- The superseded r3 examples.

**Product.**
- The ASK flows: the combined shortfall question, the conflict question and the add-a-measurement path.
- Wording for the four reasons.
- Showing the original measurement next to any correction.
- Neutral statuses.

**Data/G03.**
- The four-fact schema and immutability.
- The quality states.
- Segment sums and deduplication of ledger and imports.
- The history-distance rule.
- Whether to add a dated single-run distance to the intake.

**Engineering/QRE.**
- Deterministic classification.
- The X-2 exception.
- `actual.distanceKm` stays the measured value.
- Declared and corrected distances never reach V1RC as measured; V1RC is unchanged.
- The L30 source union.
- The S2 lower-bound case.

**Clinical.** Nothing new. STOPPED SYMPTOM routes are unchanged.

## Queue, expiry and governance

**Queue (proposed only, not appended).** Both items are QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.
- HQ-RWS3A-SSCTR-COMPLETION-BASIS (A1) amends HQ-RWS3-SSCTR-COMPLETION.
- HQ-RWS3A-SSCTR-L30-HISTORY (A2) amends HQ-RWS3-SSCTR-CONTINUOUS-DISTANCE.

**Expiry.** 2027-05-11, the same date as r3, or earlier on any of these triggers:
- A Founder change to the completion rule or to the acceptance of declarations.
- A change to r3, V1RC or P1.
- First product data on the PARTIAL, UNKNOWN, conflict, correction and declared shares, and on declared-based L30.
- New GNSS validation or new self-report evidence.
- An intake or HealthKit quality change.
- An adverse event.
- A runtime inconsistency.
- The funding declaration.

**Governance.**
- No gate is closed and nothing is published.
- No boundary is enabled. V1X-RUN-NATIVE needs a fresh SSCTR judge's record.
