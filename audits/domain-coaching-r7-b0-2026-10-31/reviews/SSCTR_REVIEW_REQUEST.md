# R7-B0 — SSCTR review request (gate R7B0-SSCTR-r1)

2026-10-31 · requested by the mission coordinator (author of the target; not a judge). Mission: DOMAIN_COACHING_R7-B0 ([request](../FOUNDER_REQUEST.md), [contract](../TASK_CONTRACT.md)). Branch `claude/domain-coaching-r7-b0`.

## Frozen target (review exactly these bytes)

| Artifact | SHA-256 |
|---|---|
| `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json` (R7B0-CATALOG-1) | `db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe` |
| `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.schema.json` | `8b51b80b5861cea189489db28f2c15125269f4d3a4eb1c937a30590184dcffd8` |
| `CoachingCore/r7/b0/REPERTOIRE_FOUNDATION_B0.md` (R7B0-SPEC-1) | `1fb2eb4b961a1bf1c4be86d5959a81a73dcbf5f588b27de31e1b0853f03712b6` |
| `CoachingCore/r7/b0/GAP_CLOSURE_B0.md` (R7B0-GAPS-1) | `0f43f09fb3ccbe4ab2f4f71c03c82f7ea09a588a43358bd149cf64b5e4fa2b04` |
| `audits/domain-coaching-r7-b0-2026-10-31/validate-b0.mjs` | `d757e55edd433fd3fb330217b503799d38c1eafc3d3bd538ddccbe19dc7e4d05` |

Bound policy: R6-POLICY-5, canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` (unchanged; its ten boundaries are APPROVE_WITH_CONDITIONS in `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.r12.json`). The author's validator reports 18/18 structural/binding checks (`VALIDATION_B0.json`); that is not a scientific verdict.

## Questions (one bounded record each)

Population for all: explicitly nonclinical eligible adults (18+), recreational novice-to-experienced hybrid runners/strength trainees, V1 (`policy:population`); offline specification only; no real athlete or runtime effect.

- **B0-FIDELITY** — Does the catalog materialize the approved R6 envelopes and the R2 familiar paths faithfully, without adding a dose, widening an eligibility, or dropping a condition? (Run families except `RUN.FAMILIAR_REPEATED_BOUTS`; the 39 R6 strength configurations; templates; substitution; composition CMP.I01–I10 and CMP.P01–P03, P05–P08; trajectories; safety.) Binding check, not new approval.
- **B0-C01** — Novice run graduation: strides after walk/jog exit under the existing executed-week count; and quality (threshold step 0) eligibility at a block boundary when the last two executed weeks each reached ≥ 60 running minutes on ≥ 2 days without an adverse signal, superseding a self-declared NOVICE label for this purpose only. Comparator: R6 runtime (WALK_JOG/EASY_LOW-started athletes never get strides/quality within the program).
- **B0-C02** — Continuing an exact current familiar harder repeated-bout task (VO2-style, e.g. 4 × 3 min) at its familiar field target as the week's single quality session, with no progression and the listed exclusions, under SSCTR-R2-P14/P07.
- **B0-C03** — Admitting the 37 B0-origin strength configurations (catalog `origin: "B0"`) to the V1 repertoire for this population, under the unchanged R6 selection, establishment and progression envelopes (skill ≤ declared experience unless familiar; effort-guided establishment; no load transfer).
- **B0-C04** — Metadata as ordinal decision priors (skill, lower-body, axial, eccentric demand; primary/secondary muscles; purposes; the derived recovery-cost class; muscle-counting convention) and the representation corrections SINGLE_IMPLEMENT, BAND_TENSION, ASSISTED_BODYWEIGHT and pull-up loading. Are the classifications defensible and free of unsupported precision?
- **B0-C05** — Contextual role admissibility and goal-context accessory alternatives (hypertrophy isolation; running-support calf alternation, hip abduction, tibialis) inside the unchanged R6 templates and goal doses; one configuration per session; deterministic selection order.
- **B0-C06** — Rotation eligibility mapping (DR-134), the admissible-alternative definition incl. the LUNGE split-stance/step group, the directed close-variation rule, and MAIN change at a block boundary only with a recorded reason, established by effort (extends R6's "main lifts stay").
- **B0-C07** — Skill ladders (practice-for, progression-of) and strength novice graduation: offered at a block boundary with agency after ADVANCE/EARNED, established by effort, HIGH skill familiarity-gated unless reached through the ladder.
- **B0-C08** — Strength novice density: class NONE gets at most two full templates per week until the first block boundary; extra chosen days carry the CORE template, disclosed and negotiable.
- **B0-C09** — PULL coverage for equipment-limited profiles (kb-row, inverted-row, band pulls, scapular pull-up; bodyweight-only scapular work with the PULL_LIMITED disclosure).
- **B0-C10** — The 20 LATER_GATE / UNSUPPORTED_V1 classifications and their fallbacks (incl. steady, continuous tempo, de novo VO2, hill repeats, short intervals, tests, 5K; Nordic, Copenhagen, plyometrics, ballistic/Olympic, supersets/drop sets, failure training, 1RM testing, weighted bodyweight, stagnation rule). Is anything here actually covered by an approved envelope (wrongly excluded), or is anything included that should be later-gated?
- **B0-C11** — CMP.I11 (LOW run cost for HIGH-eccentric or first/re-establishment lower-body work within ~30 h before the long run or a quality run), CMP.P04 placement under SIS §5 / DR-112 (SSCTR OB-2 Q1/Q2), and the axial tie-break in CMP.P05.
- **B0-C12** — Archetypes derived from the R6 goal model (5 items; event, novice and return as overlays rather than archetypes).

## Rules for the review

- Follow your constitution, skill and EVIDENCE_PROTOCOL 1.0.0. Reuse the 56 sources already verified in `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.r12.json` where they suffice; research new material claims only where they do not, and log queries and access.
- Dispositions per decision: APPROVE / APPROVE_WITH_CONDITIONS / REVISE / REJECT / ABSTAIN. A REVISE must name the smallest exact change. ABSTAIN or REJECT makes the item LATER_GATE; it does not block the rest.
- **Bounded:** this is the single review round; at most one narrow recheck will follow, only for REVISE items that are new, narrow and fixable in the specification.
- Write only: `audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_REVIEW_B0.json` (array of records per `governance/agents/sports-science-reviewer/decision.schema.json`) and `SSCTR_REVIEW_B0.md` (summary). Python is not installed in this environment, so `validate_records.py` cannot run: validate the records against `decision.schema.json` with the pinned ajv at `CoachingCore/node_modules/ajv/dist/2020.js` (Node) and disclose the substitution. Do not append to the human revalidation queue: list the queue entries you require in the summary; the coordinator appends them.
- Do not edit any target or other file; do not run `npm`, tests or any `verify-r*` script. You may run `node audits/domain-coaching-r7-b0-2026-10-31/validate-b0.mjs` without `--write`.
- Summary first line: `R7B0_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | REVISE | NOT_READY`, then one line per decision id with its disposition.
