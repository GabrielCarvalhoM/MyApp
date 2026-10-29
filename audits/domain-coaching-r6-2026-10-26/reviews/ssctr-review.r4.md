# SSCTR review of the R6 coaching envelopes

**Current state: round 4.** This is a screen-only delta review at hash `d766f0d9…`, dated 2026-10-26.

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` (evidence appraisal, answers to the seven questions, findings D01–D33) | `81114d89…` |

The other earlier files carry the matching `.r1`, `.r2` and `.r3` suffixes.

## Round 4 — screen-only delta review

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0; not a fallback. I did not author the policy or the runtime.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This review is not human, empirical or clinical validation, and it gives no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-2.
- Canonical hash, recomputed with `value.mjs`: `d766f0d95bf7982c1c128acddb79427ccb819a8f992bffbd64b4fbb3dbf4fcf8`.
- File SHA-256: `c965e2d2c482cd9e71707fc441b1a2ac62667a314c452248a237dc7d942d94c0`.

**Only `operational.return.reasonScreen` changed.** I checked this directly: putting the round-3 text back reproduces `983171ac…` exactly.

The runtime changes are in `r6-clinical.mjs`, plus one line in `r6-legacy.mjs`. That line maps the legacy `clinicalReason=false` answer to OTHER_NONCLINICAL; the reason text is still screened.

**What I checked.**
- I read the new denial logic and the screen entry point.
- I re-ran all earlier probes. `ssctr-probe-binding-2` now stops at its free-text-only return, which correctly asks for a reason category under R3.
- New probe `ssctr-probe-delta-policy2-r4.mjs` covers:
  - a 40-phrase screen battery, with and without categories;
  - returns and intake pauses with categories;
  - the EARNED trail during a return.
- New probe `ssctr-probe-delta-policy2-r4b.mjs` covers the strength return with a WORK category.

I did not run `npm run verify`, any `verify-r*` script, or the test suite. The coordinator reports 371/371.

### Results

**R3 is in effect.** Free text alone never confirms a nonclinical break; the screen asks for the category (`interruption.reasonCategory` or `athlete.pause.reasonCategory`). With a category, free text can only add CLINICAL or ASK.

**D38 is fixed.** A denial inside an already negated clause no longer hides the clinical word. With a WORK category these all route CLINICAL:
- "couldn't run without pain", "Could not train without pain…", "Never ran without pain…";
- "Was not able to run without pain", "Didn't manage to run without pain";
- "Não conseguia correr sem dor…", "Nunca treinei sem dor…";
- "No pude correr sin dolor…", "Nunca corrí sin dolor…", "Jamás corrí sin dolor".

End to end, the return and the intake pause both route to CLINICAL_HUMAN_REQUIRED.

**D39 is fixed.** Falls are ambiguous (ASK) in all three languages: "I fell", "Tripped", "Caí", "Levei um tombo", "Me caí", "Tropecé".

**Round-2 and round-3 cases still behave correctly.** Legitimate denials with a category stay NONCLINICAL, for example:
- "No pain or injury, work travel";
- "no pain and no injury";
- "Not sick, not injured";
- "Sem dor nem lesão…";
- "Sin enfermedad ni lesión…".

**Return behaviour with a structured WORK category.**
- The staged re-entry runs 15/15/20 → 25/25/40 → prior dose, with ADVANCE only (no EARNED).
- A strength session offered as a demonstration is ignored.
- No prior known load is prescribed before a post-interruption log, at 20 or at 90 days.
- An ILLNESS category, or illness or double-negation text, routes to CLINICAL_HUMAN_REQUIRED.

**Nothing else regressed.** Every other round-1 to round-3 check still holds:
- race-week touch gating and calendar-free activation;
- strength gates;
- substitution persistence;
- arrangement selection, the long-run share cap and taper work fractions;
- post-race eligibility, D36 and D37.

### Residual (documented as D40; not blocking the offline freeze)

A "without / sem / sin + clinical word" denial is honoured anywhere in a clause. Affirmative pain phrased without an explicit negation therefore still screens NONCLINICAL when the athlete also picked a nonclinical category:
- "It was hard to run without pain";
- "Struggled to run without pain on the trip";
- "Apenas conseguia correr sem dor".

**Why this does not block the offline freeze.** A nonclinical recipe now needs two explicit structured answers from the athlete:
- a nonclinical reason category;
- a current eligibility check, dated on or after the interruption ended, with every clinical flag false.

The text screen is a second line of defence. It misses only when the athlete's own structured answers contradict their text.

**Required change (D40).** Honour a without/sem/sin denial only at the start of its clause; elsewhere, treat the clause as ASK. This must be closed before production, a KMP port, or any use with real athletes.

**Optional (R4).** Treat nothing/nada/nenhum/ningún as negators. "nothing clinical, just a busy month" currently routes CLINICAL, a conservative false positive.

### Dispositions at hash d766f0d9…

| Boundary | Disposition | Evidence | Binding |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Residual heuristic limit documented (D40) |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect (recommendation R1 stands) |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Residual heuristic limit documented (D40) |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect |

**Runtime effect.** I loaded the real authority file: all ten boundaries are enabled, and profile A now gets a cold-start program (PROPOSED).

**Human queue.** `ssctr-proposed-queue-items.json` (revision r4) proposes ten funded-human revalidation items at this hash. It supersedes the unmerged r1–r3 proposals. I did not edit the queue file, and funding is NOT_DECLARED.

### May the runtime be frozen?

**Yes, for the offline synthetic Node24 reference** (the fresh holdout and its evaluation):
- Record the runtime hashes at freeze.
- Any later change to a reviewed runtime function needs a delta binding review.
- D40, and optionally R4, go into the next runtime revision and must be closed before production, a KMP port, or any use with real athletes.

### Escalation

None is open. The clinical requirement is met by the structured design; the residual heuristic limit is documented and owned as D40. No clinical judgment, Founder decision or Product Truth change is needed.

**Validation.** All ten round-4 records pass the project validator (jsonschema 4.26.0, Python 3.12.14 from a bundled runtime). The queue proposal, `ssctr-policy-review.json` and `ssctr-records.json` are consistent with each other, and every recorded file hash is current. This certifies record consistency only.
