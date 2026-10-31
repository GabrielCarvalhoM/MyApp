# R7-B: Quality review (third judge)

| | |
|---|---|
| Review | R7B-QUALITY-REVIEW-1, 2026-10-31. Independent judge: not the author, and a scope separate from SSCTR and Engineering |
| Frozen identity | R7B-RUNTIME-REPERTOIRE-FREEZE-1, commit `4995d58` |
| Source digest | `791b531100c190f6b0ed73e892f6e212d7eee5406d144fce4a188170900a2c4f` |
| Manifest digest | `b1a1faf0a7064da99db8a33a0f04852ae3cc3a06177bcb3e4edba7cfdf222f73` |
| Catalog | R7B0-CATALOG-2 `ceee276a…` |
| Frozen bytes | `node scripts/verify-r7b.mjs` passed 18/18 before the probes and again after them, with the same digests. No repository file was changed outside this folder. |
| Record | [QUALITY_REVIEW_R7B.json](QUALITY_REVIEW_R7B.json); probes and their raw outputs are in [probes/](probes/) and [probes/out/](probes/out/) |

## Question and method

The question was whether the bound repertoire is complete and reachable, without contradictions (request §25). Sports-science fidelity belongs to SSCTR and correctness to Engineering; neither was re-judged here.

Reachability counts only items the runtime produces from onboarding-like inputs through its public entry points:

- `generateProgram`: 27,608 programs in the p01 grid, 2,250 with rotating preferences in p06, 14,273 targeted attempts in p02, and 11,200 arrangements for athletes with no strength training (strength class NONE) in p11.
- Weekly reviews and block-boundary reviews, with sessions executed as prescribed.
- `LADDER_STEP` and `MAIN_CHANGE` choices.
- `EXERCISE_SUBSTITUTION` and `EQUIPMENT_CHANGE` reviews.

I checked the conformance matrix against the catalog myself (p08) instead of relying on its checker.

## Reachability

| Item | Reachable | Notes |
|---|---|---|
| Run families | 10 / 10 | 12 of 13 run configurations are named by the binding; `RUNCFG.STRIDES_SET` never is. EASY_UNKNOWN athletes cannot reach any quality family or strides (Q-R7B-02). |
| Strength configurations | 74 / 76 | 51 come from onboarding answers alone; 8 only through rotation; 12 only after a later review; 3 only when the athlete declares them familiar. `back-extension` and `hip-hinge-practice` are never produced. |
| Templates | 7 / 7 | |
| Archetypes | 5 / 5 | The EVENT_PREP overlay is produced. |

## Findings

| Id | Severity | Kind | Finding |
|---|---|---|---|
| Q-R7B-01 | MAJOR | CONTRADICTION | An accepted accessory skill-ladder step (pull-up, barbell overhead press) goes back to the easier configuration at the next rotation turn, at week 9 under COACH_DECIDES (the default) and EVERY_6_WEEKS, or every 2 weeks under EVERY_2_WEEKS. No reason or disclosure is given. The catalog says progression on a ladder is never automatic and stepping back needs a stated reason (SKILL_MISMATCH). Only FIXED keeps the step. Evidence: p13, p12. |
| Q-R7B-02 | MAJOR | CONTRADICTION | An athlete who leaves weekly running minutes blank (class EASY_UNKNOWN) is told a harder session comes after two complete easy weeks, through "graduation at a block review" (QUALITY_AFTER_EVIDENCE). The runtime never graduates EASY_UNKNOWN. After 16 executed weeks, a 10K athlete still has only easy runs, the long run and the race. The matrix does not explain this. Evidence: p09, p09b. |
| Q-R7B-03 | MINOR | ORPHAN | `back-extension` is accessory-only, every hinge slot is a main slot, and no ladder or substitution path reaches it, so it can never be prescribed. Evidence: p02. |
| Q-R7B-04 | MINOR | DEAD | Movement practice is given only in the first strength session of the first week, and that session is always TPL.FULL_A. So the hinge and lunge practice configurations are never prescribed, and `hip-hinge-practice` is unreachable. Evidence: p11. |
| Q-R7B-05 | MINOR | CONTRADICTION | Every TPL.CORE session in the first week for an athlete with no strength training repeats `dead-bug-practice` twice (1,080 sessions). This breaks the catalog rule "a configuration is used at most once per session". Evidence: p14. |
| Q-R7B-06 | MINOR | CONTRADICTION | The runtime contradicts witness WP-STR-06 and no divergence is recorded: in a bands-only travel window it substitutes `band-face-pull`, not `band-pulldown`, because of the id tie-break. Evidence: p10. |
| Q-R7B-07 | MINOR | CONTRADICTION | PULL_LIMITED_FOR_EQUIPMENT and MOVEMENT_PATTERN_UNAVAILABLE blame equipment when the real limit is skill. They offer "Add a band or a bar" to athletes who already have them, or for a push pattern that neither would add. Evidence: p07, p17. |
| Q-R7B-08 | OBSERVATION | COMPLETENESS | The matrix has no entry per configuration, run configuration or session family. `RUNCFG.STRIDES_SET` is never named. The catalog reference `trajectories.return` points to a section that does not exist. Evidence: p08. |
| Q-R7B-09 | OBSERVATION | COMPLETENESS | The test cited for the emphasis signal does not exercise emphasis. Emphasis reorders rows and changes which accessories survive time fitting, but never which configuration fills a slot. Evidence: p05, p05b. |
| Q-R7B-10 | OBSERVATION | DEAD | The 7 ladder edges that start at a practice configuration never take effect. The option "Step back on a skill ladder" cannot be met for some accessories. Evidence: p04, p15. |
| Q-R7B-11 | OBSERVATION | REACHABILITY | Which path reaches each configuration: rotation only, later review only, or declared familiarity only (`db-step-up`, `barbell-row`, `cable-face-pull`). Evidence: p16. |

## Routing

- Q-R7B-01, -02, -05 and -07 go back to the author.
  - For Q-R7B-02 the disclosure can be corrected without any domain decision. Whether EASY_UNKNOWN athletes should get a graduation path is for SSCTR and the Founder.
- Q-R7B-03, -04, -06 and -08 go to the next catalog or matrix revision.
  - Q-R7B-04 and Q-R7B-06 also raise sports-science questions. SSCTR decides those; this gate does not.

I classified every finding without needing a sports-science or Founder decision, so nothing was escalated. The two MAJOR findings keep this gate from passing. This review covers only the frozen bytes judged here. Bounded: one review; I did not fix the runtime.

R7B_QUALITY_GATE = NOT_READY
