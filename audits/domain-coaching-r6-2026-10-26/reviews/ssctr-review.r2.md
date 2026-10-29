# SSCTR review of the R6 coaching envelopes

**Current state: round 2.** Delta review of R6-POLICY-2 as amended during the review, dated 2026-10-26.

The round-1 review of R6-POLICY-1 (hash `81114d89…`) is preserved unchanged in `ssctr-review.r1.md`. Its dispositions are superseded; its evidence appraisal still applies. My other round-1 files carry the same `.r1` suffix.

## Round 2 — delta review of R6-POLICY-2

**Reviewer:** the native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. This is not a fallback instance. I did not author the policy or the runtime.

**Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. There is no human, empirical or clinical validation, and no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-2.
- Canonical hash, recomputed with `value.mjs`: `1c5e3844b5e6dd8095b6d329d328d217a8633b0e4f7ca3660a96b6d50e745e8c`.
- File SHA-256: `880d3869ce9b9c1a6e512709797b7000c6fa9099f152145600a77a4fb9fdf90c`.

The coordinator first dispatched hash `a7570f2e…`. It then amended the target to `1c5e3844…` during the review; the only change is the long-run share semantics. I re-ran every probe after that amendment.

**What I checked:**
- The author's response file (`ssctr-dossier/REVISION_R6_POLICY_2.md`) and the new runtime-binding section.
- A structured diff of the policy against the preserved reviewed copy.
- The code I could not exercise directly: the new clinical screen `r6-clinical.mjs`, `weeklyGates`, `completedRuns`, `projectWeeks`, the legacy RETURN branch, legacy admissibility, `phaseClassOf` and `bindObservations`.
- All my round-1 probes, re-run unchanged on the current runtime. Their round-1 outputs are kept as `*.r1.out.json`.
- Two new probe sets: `ssctr-probe-delta-policy2.mjs` and `ssctr-probe-delta-policy2b.mjs`, with their `.out.json` outputs.

**Unchanged:**
- The policy changes are declarations and semantics only. Envelope claims are unchanged except the reworded load-establishment claim, so the round-1 evidence base (34 sources) still applies.
- No new literature was needed.
- I did not run `npm run verify` or any `verify-r*` script. The coordinator reports the suite at 366/366; I did not re-run it.

### Dispositions at hash 1c5e3844…

Eight boundaries are approved; two remain REVISE because of one shared defect.

| Boundary | Disposition | Binding | Open items |
|---|---|---|---|
| R6-COLD-START | REVISE | Blocking defect in the shared clinical screen | D34, D35 |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | No blocking defect | — |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | No blocking defect | R1 (recommendation) |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | No blocking defect | — |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | Changes required before freeze | D37 |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | No blocking defect | — |
| R6-NONCLINICAL-RETURN | REVISE | Blocking defect in the shared clinical screen | D34, D35 |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | No blocking defect | — |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | Changes required before freeze | D36 |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | No blocking defect | — |

Evidence status is SUPPORTED_WITH_LIMITS for all ten.

**Runtime effect, checked with the real authority loader:**
- The eight approved boundaries are enabled.
- Cold-start generation still returns UNSUPPORTED, because R6-COLD-START is not enabled.
- Returns are UNSUPPORTED in both the cold-start and legacy paths.

**Queue.** `ssctr-proposed-queue-items.json` (revision r2) proposes eight funded-human revalidation items. They supersede the unmerged round-1 proposal. I did not edit the queue file, and funding is NOT_DECLARED.

### Round-1 defects confirmed resolved on the current runtime

| Defect | Evidence on the current runtime |
|---|---|
| D01 | Race-week touch and shakeout strides are gated by authority and by executed work (P1, `TAPER_AFTER_ALL_QUALITY_MISSED`). |
| D02 | Taper quality total work fraction is 0.56 for HM 3×12 → 2×10, 0.60 for 10K 5×3 → 3×3, and 0.50 for 6×3 → 3×3. My P15 repetition ratio is no longer the governing quantity. |
| D03 | Taper and race week are built from executed peaks: easy-only after zero executed quality. |
| D04 | A post-race review with eligibility dated before the race returns ASK. With post-race eligibility, redevelopment starts at 40/25 min with threshold 3×5. |
| D08 (English and Portuguese) | "Flu illness" and "Sick with a fever" route to clinical; "Work travel, will resume" is accepted as nonclinical (P5). |
| D09 | Only completed easy-family runs count as a demonstration (P6). |
| D10 | No prior known load before a log made after the interruption, at 20 or 90 days (P7). |
| D11 / D12 | One step per week; walk/jog advances steps 0→1→2→3→4; no EARNED in return. |
| D13 | No quality or strides after three missed weeks (P2). |
| D14 | No added set after a missed block (P3). |
| D15 | Logged RIR 1 against prescribed RIR 3 holds (P9). |
| D16 | No load step without logs (P8). |
| D17 / D18 | Transitions are declared in the policy. The single-run ceiling is checked against completed runs: with long runs executed at 40 of 60 min, the long run is held at the intake reference for 30 days and then follows completed runs +5. |
| D19 | Long-run share ≤ 0.45 in every week of profile A. After the amendment, no long run drops outside planned reductions in any profile. |
| D21 | Week 1 is 120 of 120 reported minutes. |
| D22 (English and Portuguese) | Illness-named pause → clinical; restart without return authority → UNSUPPORTED. |
| D23 | No establishment rows without load-establishment authority. |
| D24 | Strength-first is chosen for an easy run plus heavy lower-body work in the same session (P11). |
| D25 | Costs are compared worst-first; the option without a MODERATE run cost is chosen, basis LOWEST_WORST_CASE_JOINT_HARM (P12); same-day labels are correct. |
| D26 | Legacy admissibility now applies the rule I asked for (inspection). |
| D27 | Substitution persists through the next weekly review (P10). |
| D28 | Observations carry mode and phase class; return periods form their own class (inspection). |
| D29, D30, D31, D32, D33 | Declared in the policy and implemented. |

### Remaining defects

**D34 — clinical boundary; blocks R6-COLD-START and R6-NONCLINICAL-RETURN.**
- In `r6-clinical.mjs`, `normalize()` turns punctuation into spaces before `stripNegations` runs. A denial can therefore swallow a clinical word from the next clause.
- "Not sick - injured on holiday" and "No pain, injury during work travel" screen as NONCLINICAL.
- End to end, a 14-day return gets REESTABLISH, and a 2-week intake pause gets an ordinary program even with return authority disabled (`ssctr-probe-delta-policy2b.out.json`).

Required change:
- Split the raw text into clauses at punctuation and at but/mas/pero before normalizing.
- Inside a clause, let a negation absorb further clinical words only when they are joined by or/and/nor (ou/e/nem, o/y/ni).
- Add these phrases as regression tests.

**D35 — clinical boundary; blocks the same two boundaries.**
- The lexicon covers English and Portuguese, but V1 ships in PT-BR, EN and ES.
- Spanish clinical words are unknown. Spanish words that also appear in the Portuguese nonclinical list (ocupado, familia, calor, frio, academia) make these reasons NONCLINICAL:
  - "Ocupado y enfermo";
  - "Familia, estuve con fiebre";
  - "Hacía mucho calor y me lesioné la rodilla".
- Other Spanish phrasings fall to ASK, which is safe.

Required change:
- Add Spanish clinical, ambiguous and nonclinical word lists. The record lists suggested terms.
- Update `operational.return.reasonScreen` to name all three languages.
- Add regression tests.

**D36 — required before freeze; does not block approval.** The policy declares the arrangement-preference query as session type + phase class + dose key (family and ladder step). The `rebuild` query in `r6-adaptation.mjs` uses only `{sessionType, phaseClass}`. Required change: add family and ladder step (or `plannedHash`) to the bound context and to the query. This affects associative ranking among admissible options only.

**D37 — required before freeze; does not block approval.** Probe `UNAVOIDABLE_MODERATE`: a cold start with heavy lower-body work in the morning and the key run the same afternoon is selected with a MODERATE run cost, and no athlete-facing disclosure or negotiation item is emitted. Required change: when the selected arrangement carries a MODERATE or higher cost at the session horizon, `generateProgram` and `rebuild` must add a negotiation item that names the cost and offers keeping it, swapping shifts or using another chosen day.

### The two judgment calls

**Unknown logged RIR treated as HOLD — accepted.** It stays inside the envelope: missing data is not treated as adverse, and nothing regresses.

R1 is a non-blocking recommendation, for the coaching-quality owner:
- when a strength step holds only because RIR was not logged, ask for RIR on that exercise in the next session, so progress does not stall silently;
- an acceptable option is one ADVANCE after two consecutive exposures with target reps met at the planned load and no RIR logged, never EARNED.

**Cold-start reading of the unknown-arrangement rule — accepted, with a condition.** Same-day pairings in a cold start come from the athlete's own chosen days and shifts, so arrangement evidence is not required. A MODERATE or higher cost must still be disclosed with an alternative. That is condition D37, which the runtime does not meet yet.

### May the runtime be frozen?

**No, not yet.**
1. Correct D34 and D35 in `r6-clinical.mjs` and update the `reasonScreen` text. This changes the hash.
2. Implement D36 and D37.
3. Request a narrow delta review. It needs the screen phrase battery in `ssctr-probe-delta-policy2.mjs`, the disclosure check and the query check, then re-issue of all ten records at the new hash.

Everything else in R6-POLICY-2 is ready.

### Escalation

The clinical requirement is still unmet in the shared interruption-reason screen. No clinical judgment is requested, and nothing here needs the Founder or Product Truth. The fix is narrow, but both boundaries that use the screen stay disabled until it lands.

### Non-blocking recommendations

- **R2:** collect the structured `reasonCategory` in the product. A FAMILY reason whose text says a relative was ill currently routes to clinical, a conservative false positive.
- **R3:** let free text alone yield NONCLINICAL only when it contains no unrecognized content word; otherwise return ASK.

**Validation.** All ten round-2 records pass the project validator (jsonschema 4.26.0, bundled Python 3.12.14). The queue proposal and the cross-check between `ssctr-policy-review.json` and `ssctr-records.json` are consistent (`ssctr-schema-validation.json`). This certifies record consistency only.

---

Round-1 narrative: see `ssctr-review.r1.md`. It covers the evidence appraisal, the answers to the seven questions and the D01–D33 findings against hash `81114d89…`.
