# SSCTR review of the R6 coaching envelopes

**Current state: round 5.** This is a quick check before freeze at hash `f9f89b7f…`, dated 2026-10-26.

Earlier rounds are kept unchanged:

| Round | File | Hash |
|---|---|---|
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the evidence appraisal, the answers to the seven questions and the D01–D33 findings. The other earlier files keep matching `.r1`–`.r4` suffixes.

## Round 5 — quick screen-only check

**Who reviewed.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0; not a fallback. I did not author the policy or the runtime.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This check carries no human, empirical or clinical validation and no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-2.
- Canonical hash, recomputed with `value.mjs`: `f9f89b7f6f49c4946332dc7447eeaea9477308a777cabfd7bab38f1627c977ac`.
- File SHA-256: `f4c7e05354b745c5f72b5a9e322b043e2bc235dfbe9e830f809fad6d9de6f030`.

**Scope of the change.** Only `operational.return.reasonScreen` changed. Putting the round-4 text back reproduces `d766f0d9…`. The runtime change is confined to `r6-clinical.mjs`.

**What I checked.**
- I read the revised denial logic.
- I ran a new battery, `ssctr-probe-delta-policy2-r5.mjs`, with 27 phrases.
- I re-ran the round-3 and round-4 screen and return probes, plus the round-4 strength-return check.

I did not run `npm run verify`, any `verify-r*` script, or the test suite; the coordinator reports 372/372.

### Results

**D40 — fixed.** A without/sem/sin denial now counts only at the start of its clause. These now return ASK:
- "It was hard to run without pain"
- "Struggled to run without pain on the trip"
- "Apenas conseguia correr sem dor"

Clause-initial denials with a category stay NONCLINICAL, for example "Without pain, just travel", "Sem dor, só trabalho" and "Sin dolor, solo trabajo".

**R4 — adopted.** "nothing clinical, just a busy month" with a WORK category is now NONCLINICAL.

**Perception/possession denials — accepted.** "Didn't feel any pain", "Não senti dor nenhuma", "No tuve dolor" and "Never had any injury" are genuine denials and return NONCLINICAL with a category. "didn't feel well" returns ASK in all three languages. The round-4 probe flagged "Didn't feel any pain [WORK] → NONCLINICAL" only because of its earlier conservative expectation; this is the intended change.

**Earlier rounds — unchanged.** I found no regressions:
- Double negation still routes CLINICAL.
- The Spanish and clause-boundary cases from rounds 2–3 still route CLINICAL end-to-end.
- Falls still return ASK.
- Free text alone still returns ASK.
- Returns with a WORK category re-enter in stages (ADVANCE only), and illness text routes CLINICAL.
- There is no prior known load before a post-interruption log.

### Residual heuristic limit (D41; does not block the offline freeze)

The new perception/possession denial path is honoured even when a temporal or contrast qualifier follows, which turns the sentence into an affirmation of a clinical event. With a nonclinical category, these return NONCLINICAL:
- "Didn't feel any pain until I tried to run"
- "Never had any injury before this trip"
- "Não senti dor até voltar a correr"
- "No tuve dolor hasta que corrí"
- "Didn't have pain except when running"

This is the same class as round 4's D40. It can only matter when the athlete's free text contradicts their own two structured answers: a nonclinical category, and a current eligibility check dated after the break with every clinical flag false.

**Required before any use beyond the offline synthetic reference** (production, a KMP port, or real athletes): do not honour a denial when its clause also contains until/till/before/after/except/unless/only when, or the Portuguese and Spanish equivalents (até/antes/depois/exceto/salvo/só quando; hasta/antes/después/excepto/salvo/solo cuando). Return ASK instead.

### Dispositions at hash f9f89b7f…

All ten boundaries are APPROVE_WITH_CONDITIONS with evidence status SUPPORTED_WITH_LIMITS.

| Boundary | Binding |
|---|---|
| R6-COLD-START | Residual heuristic limit documented (D41) |
| R6-LOAD-ESTABLISHMENT | No blocking defect |
| R6-PLANNED-PROGRESSION | No blocking defect (recommendation R1 stands) |
| R6-RUN-QUALITY | No blocking defect |
| R6-HYBRID-ARRANGEMENT | No blocking defect |
| R6-SUBSTITUTION | No blocking defect |
| R6-NONCLINICAL-RETURN | Residual heuristic limit documented (D41) |
| R6-EVENT-TRANSITION | No blocking defect |
| R6-PARTIAL-NOISY-LEARNING | No blocking defect |
| R6-ROTATION | No blocking defect |

**Runtime effect.** I loaded the real authority file: all ten boundaries are enabled, and profile A gets a cold-start program (PROPOSED).

**Human queue.** `ssctr-proposed-queue-items.json` (revision r5) proposes ten funded-human revalidation items at this hash. It supersedes the unmerged r1–r4 proposals. I did not edit the queue file, and funding is NOT_DECLARED.

### May the runtime be frozen?

**Yes, for the offline synthetic Node24 reference** — the fresh holdout and its evaluation.
- Record the runtime hashes at freeze.
- Any later change to a reviewed runtime function needs a delta binding review.
- D41 belongs in the next runtime revision. It must be closed before production, a KMP port, or any use with real athletes.

### Escalation

None. The clinical requirement is met by the structured design, and the remaining text-heuristic gap is documented and owned as D41.

**Validation.** All ten round-5 records pass the project validator (jsonschema 4.26.0, Python 3.12.14 from a bundled runtime). The queue proposal, `ssctr-policy-review.json` and `ssctr-records.json` agree, and every recorded file hash is current. This certifies record consistency only, not scientific correctness.
