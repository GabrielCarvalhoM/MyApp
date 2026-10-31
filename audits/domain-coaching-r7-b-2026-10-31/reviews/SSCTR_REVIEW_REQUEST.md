# R7-B — SSCTR review request (runtime binding of R7B0-CATALOG-2)

You are the project Sports Science & Concurrent Training Reviewer (constitution `governance/agents/sports-science-reviewer/CONSTITUTION.md`, skill `.agents/skills/sports-science-review/SKILL.md`). You did not author this runtime. Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal sporting decisions; clinical judgement stays CLINICAL_HUMAN_REQUIRED; no human, empirical or clinical validation is claimed.

## Question

On the frozen bytes of **R7B-RUNTIME-REPERTOIRE-FREEZE-1** (`CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json`), does the runtime prescribe faithfully to R7B0-CATALOG-2 and the 13 R7B0-SSCTR-r2 records (their conditions prevail where stricter), without a dose, eligibility or progression outside the approved R6/B0/R7-A envelopes? This is a runtime-binding check, not a new approval of the envelopes.

Focus (request §23): fidelity to the catalog; the B0 conditions; progression; regression; novice paths (walk/jog, graduation, strides optionality, novice density, skill ladders); hybrid interference (CMP.I11, the CMP.P04 content stage, protected stimuli); taper (10K, half marathon, combined strength taper); return/recovery (R7-A E1 and the graduation and familiar-bouts interplay); dose boundaries. Decide the declared items R7B-DECL-01 … 12 in `CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md` §4.

## Read (minimum)

1. `CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md` (identity, changes, declared items, limits).
2. `CoachingCore/r7/b/CONFORMANCE_R7B.json` (every r2 condition → status, consumer, test) and `CoachingCore/r7/b/F01_F09_R7B.md`.
3. `audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json` (the 13 r2 records) and `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json`.
4. The runtime where you need it: `CoachingCore/src/r7b-repertoire.mjs`, `src/r6-program.mjs`, `src/r6-adaptation.mjs`, `src/r6-balanced.mjs`, `src/r6-prescription.mjs`, `src/r6-intake.mjs`; the tests `CoachingCore/test/r7b-*.test.mjs`; fixtures `CoachingCore/r7/b/fixtures/helpers.mjs`.

Probe the behaviour yourself (generate programs and run reviews with synthetic facts); do not rely on the author's tests alone.

## Rules

- Do not edit anything under `CoachingCore/src`, `CoachingCore/test`, `CoachingCore/r6`, `CoachingCore/r7/b0`, `CoachingCore/r7/b` or `product/`, `canon/`. Do not commit, stash, check out or reset. Never run `npm run verify` or any `verify-r*` script of a closed mission (`node CoachingCore/scripts/verify-r7b.mjs --tests` is read-only and allowed).
- Write only into `audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/` (probes, outputs).
- Bounded: one review; a later narrow recheck only for a blocker that is new, narrow and runtime-only.

## Output

- `audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/SSCTR_REVIEW_R7B.json`: SSCTR records (your usual schema) for **R7B-FIDELITY** (catalog and r2 conditions on the runtime) and one record per area where you have a decision (novice paths, hybrid, taper, return, dose boundaries, declared items), each with decision APPROVE / APPROVE_WITH_CONDITIONS / REVISE / REJECT, evidence status, confidence, conditions and limitations, bound to the freeze source digest.
- `audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/SSCTR_REVIEW_R7B.md`: a short summary ending with exactly one line `R7B_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | BLOCK`, the freeze digests you judged, findings (each with id, severity, reproduction), conditions, and items for the human revalidation queue (append-only; do not edit the queue yourself).
