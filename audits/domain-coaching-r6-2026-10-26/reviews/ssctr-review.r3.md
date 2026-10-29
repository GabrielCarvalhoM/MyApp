# SSCTR review of the R6 coaching envelopes

**Current state: round 3**, a narrow delta review at hash `983171ac…`, dated 2026-10-26.

Earlier rounds are preserved unchanged:
- Round 2: `ssctr-review.r2.md`, hash `1c5e3844…`.
- Round 1: `ssctr-review.r1.md`, hash `81114d89…`. It contains the evidence appraisal, the answers to the seven questions and the D01–D33 findings.

My other earlier files carry the matching `.r1` / `.r2` suffixes.

## Round 3 — narrow delta review

**Reviewer:** the native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. This is not a fallback instance. I did not author the policy or the runtime.

**Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. There is no human, empirical or clinical validation, and no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-2.
- Canonical hash, recomputed with `value.mjs`: `983171acc6e99550bb9cfe2029c518b64913c21825bd2be545b812486a5c0a49`.
- File SHA-256: `fd8b85c092de2eb1f1f886e9425190f5670ee24526872bc69ff418ea9d73a5e6`.

**What changed since round 2.** The policy key set is the same. Three semantics changed:
- `operational.return.reasonScreen`: three languages, clause splitting, and denials extended only across or/nor;
- `operational.learning.pooling`: a dose key in the arrangement-preference query;
- `operational.hybridSemantics.disclosure`: a new rule.

The runtime changes are in `r6-clinical.mjs`, `r6-adaptation.mjs` and `r6-program.mjs`. No envelope claim changed, so the round-1 evidence base still applies.

**What I checked:**
- I read the new screen and the code for D36 (`doseKeyOf`, the `rebuild` query) and D37 (`arrangementDisclosures`).
- I re-ran every earlier probe on the current runtime and found no regressions against rounds 1 and 2.
- I added `ssctr-probe-delta-policy2-r3.mjs`, which covers:
  - a 34-phrase clinical-reason battery: double negation, clause boundaries, Spanish, falls and accidents, legitimate denials, and structured-category interplay;
  - end-to-end runs of the failures through a return review and a short intake pause;
  - a D36 dose-key check;
  - a D37 disclosure check.

I did not run `npm run verify` or any `verify-r*` script. The coordinator reports the suite at 370/370; I did not re-run it.

### Resolved since round 2

**D34 — fixed.** Clause-bounded denials now work:
- "Not sick - injured on holiday", "No pain, injury during work travel" and "no pain and injured knee at work" are CLINICAL.
- End to end, both return and intake route these to CLINICAL_HUMAN_REQUIRED.

**D35 — fixed.**
- "Ocupado y enfermo", "Familia, estuve con fiebre", "Hacía mucho calor y me lesioné la rodilla", "Me torcí el tobillo…", "Me enfermé…" and "…me duele la espalda" are CLINICAL.
- Legitimate denials stay NONCLINICAL, for example "Sin enfermedad ni lesión, solo trabajo" and "Sem dor nem lesão, só trabalho".

**D36 — fixed.** Observations carry `doseKey` (for example `THRESHOLD:THRESHOLD:0`). The `rebuild` preference query uses sessionType + phaseClass + doseKey.

**D37 — fixed.** The unavoidable MODERATE case now carries an `ARRANGEMENT_COST_DISCLOSED` item. It names both MODERATE costs and offers to keep the layout, swap shifts, or move a session.

### Still blocking: two clinical-screen defects, shared by R6-COLD-START and R6-NONCLINICAL-RETURN

**D38 — double negation.** `stripNegations` removes "without/sem/sin + clinical word" even when the clause is already negated, and in that case the clinical word is an affirmation. These all screen NONCLINICAL:

| Language | Phrases |
|---|---|
| English | "On the work trip I couldn't run without pain"; "Could not train without pain during the work trip"; "Never ran without pain on vacation" |
| Portuguese | "Não conseguia correr sem dor durante a viagem"; "Não consegui treinar sem dor no trabalho" |
| Spanish | "No podía correr sin dolor durante el viaje"; "Nunca corrí sin dolor en vacaciones" |

End to end, each one gets a nonclinical return (REESTABLISH), and a 2-week intake pause gets an ordinary program. This is a common way to describe a pain-caused interruption, so the clinical boundary is not met.

Required change:
- honour a denial only when no other negation or inability marker precedes it in the same clause (not, no, never, cannot, can't, couldn't, unable, não, nunca, jamais, jamás, impossible / impossível / imposible);
- otherwise every clinical word in that clause counts as a mention;
- add the round-3 battery as regression tests.

**D39 — falls missing from the Portuguese and Spanish ambiguous lists.** English "I fell" is correctly ASK, but "Caí na viagem" and "Me caí en el viaje" screen NONCLINICAL. Required change: add the Portuguese and Spanish fall verbs and phrases (caí, caiu, tombo, tropecei, me caí, caída, tropecé…) to the ambiguous lists, and test them.

**R3 — strongly recommended.** The R3 recommendation from round 2 is now strongly recommended, because it closes this whole class of lexicon misses. Free text alone should never yield NONCLINICAL: without a structured nonclinical category the outcome is ASK for the category, and free text can only add CLINICAL or ASK. D38 is still required with R3, because a nonclinical category combined with "couldn't run without pain" must also route clinical.

### Dispositions at hash 983171ac…

Eight boundaries are approved and enabled; two remain REVISE.

| Boundary | Disposition | Binding |
|---|---|---|
| R6-COLD-START | REVISE | Blocking defect in the shared clinical screen (D38, D39) |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | No blocking defect (recommendation R1) |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-NONCLINICAL-RETURN | REVISE | Blocking defect in the shared clinical screen (D38, D39) |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | No blocking defect |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | No blocking defect |

Evidence status is SUPPORTED_WITH_LIMITS for all ten.

**Runtime effect, checked with the real authority loader:**
- Eight boundaries are enabled.
- Cold-start generation still returns UNSUPPORTED, because R6-COLD-START is not enabled.
- Returns are UNSUPPORTED in both paths.

**Queue.** `ssctr-proposed-queue-items.json` (revision r3) proposes eight items at this hash. They supersede the unmerged r1 and r2 proposals. I did not edit the queue file, and funding is NOT_DECLARED.

### May the runtime be frozen?

**No, not yet.** The only remaining work is in `r6-clinical.mjs`:
1. Add the double-negation rule and the Portuguese/Spanish fall verbs, with the round-3 battery as regression tests.
2. If the `reasonScreen` text changes, the hash changes. Either way, request a screen-only delta review.

At that review I re-run the battery. The eight approved records then only need re-binding to the new hash. No other item is open.

### Escalation

The clinical requirement is still unmet in the shared interruption-reason screen: "could not run without pain" and Portuguese/Spanish falls pass as nonclinical. No clinical judgment is requested, and nothing needs the Founder or Product Truth.

**Validation.** All ten round-3 records pass the project validator (jsonschema 4.26.0, bundled Python 3.12.14). The queue proposal and the cross-check between `ssctr-policy-review.json` and `ssctr-records.json` are consistent. All recorded file hashes are current. This certifies record consistency only.
