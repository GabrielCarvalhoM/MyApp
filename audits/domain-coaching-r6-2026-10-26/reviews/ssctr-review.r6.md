# SSCTR review of the R6 coaching envelopes

**Current state: final round (records revision r6), a screen-only check before freeze at hash `af2779fe…`, 2026-10-26.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the evidence appraisal, the answers to the seven questions and the D01–D33 findings. My other earlier files carry matching `.r1`–`.r5` suffixes.

## Final round — screen-only check

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. This is not a fallback instance. I did not author the policy or the runtime.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-2.
- Canonical hash, recomputed with `value.mjs`: `af2779fe0fc0e0a52f4b6371d3b360996687e57931b9b3feb878e9652f464910`.
- File SHA-256: `c855cde0de47eaf3a7715705e592f802b3adafedde89b6f63a9989d2caa02998`.

**Scope of the change.** Only `operational.return.reasonScreen` changed: putting the round-5 text back reproduces `f9f89b7f…`. The runtime change is confined to `r6-clinical.mjs`.

**What I ran.**
- `ssctr-probe-delta-policy2-r5.mjs`: no failures.
- The round-3 and round-4 screen and return probes, and the round-4 strength-return probe.
- A small set of sanity phrases on the structured path.

I did not run `npm run verify` or any `verify-r*` script. The coordinator reports the test suite at 373/373; I did not re-run it.

### Results

**D41 is fixed.** No denial counts in a clause that also carries a time or contrast condition. These five phrases now return ASK:
- "Didn't feel any pain until I tried to run"
- "Never had any injury before this trip"
- "Não senti dor até voltar a correr"
- "No tuve dolor hasta que corrí"
- "Didn't have pain except when running"

Clause-initial denials with a structured category still return NONCLINICAL: "Without pain, just travel", "Sem dor, só trabalho", "Sin dolor, solo trabajo", "nothing clinical, just a busy month", "Didn't feel any pain", "Não senti dor nenhuma", "No tuve dolor" and "Never had any injury".

A conservative side effect is acceptable: "No pain before or after the trip" returns ASK.

**The structured path is intact:**
- An ILLNESS category, or `clinicalReason=true`, routes to CLINICAL.
- A reason with no category returns ASK.
- Contradictory flags return ASK.

**Nothing from earlier rounds regressed:**
- Double negation, the Spanish cases and the clause-boundary cases still route to CLINICAL_HUMAN_REQUIRED end to end.
- Falls return ASK.
- A return with a WORK category re-enters in stages, with ADVANCE only.
- No prior known load is used before a post-interruption log.

The only round-4 "failure" is the accepted perception-verb refinement.

### Owned open gap

The free-text screen is still a lexicon heuristic, so no word list will catch every phrasing. As agreed with the coordinator, any further lexical miss is recorded as an owned open gap, not a new review round. The primary defence remains the athlete's structured answers:
- a nonclinical category;
- a current eligibility check, dated after the break, with every clinical flag false.

A defect in that structured path would still block.

Before production, a KMP port or any use with real athletes, the screen and its regression battery must be re-reviewed together with the structured intake design.

### Dispositions at hash af2779fe…

All ten boundaries are APPROVE_WITH_CONDITIONS. For every one, evidence is SUPPORTED_WITH_LIMITS and the binding shows no blocking defect.

| Boundary | Note |
|---|---|
| R6-COLD-START | — |
| R6-LOAD-ESTABLISHMENT | — |
| R6-PLANNED-PROGRESSION | Non-blocking recommendation R1 still stands |
| R6-RUN-QUALITY | — |
| R6-HYBRID-ARRANGEMENT | — |
| R6-SUBSTITUTION | — |
| R6-NONCLINICAL-RETURN | — |
| R6-EVENT-TRANSITION | — |
| R6-PARTIAL-NOISY-LEARNING | — |
| R6-ROTATION | — |

**Runtime effect.** I loaded the real authority file: all ten boundaries are enabled, and profile A gets a cold-start program (status PROPOSED).

**Human queue.** `ssctr-proposed-queue-items.json` (revision r6) proposes ten funded-human revalidation items at this hash. It supersedes the unmerged r1–r5 proposals. I did not edit the queue file, and funding is NOT_DECLARED.

### May the runtime be frozen?

**Yes, for the offline synthetic Node24 reference** (the fresh holdout and its evaluation).
- Record the runtime hashes at freeze.
- Any later change to a reviewed runtime function needs a delta binding review.

### Escalation

None.

**Validation.** All ten records pass the project validator (jsonschema 4.26.0, run with a bundled Python 3.12.14). The queue proposal, `ssctr-policy-review.json` and `ssctr-records.json` are consistent, and every recorded file hash is current. This certifies record consistency only.
