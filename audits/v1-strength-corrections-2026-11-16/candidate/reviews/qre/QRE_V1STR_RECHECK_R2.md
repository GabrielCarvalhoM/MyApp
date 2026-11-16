# QRE recheck R2: V1STR corrective cycle (3342a1d)

- **Judge:** Quality & Reliability Engineer 1.3.0, the same independent instance as round 1 (claude-opus-5-5). I did not write the corrective cycle. This is the one recheck. Apart from my own files under `reviews/qre/`, nothing was edited.
- **Judged:** commit `3342a1d`, against `21838cb`, with the diff of `CoachingCore` and `candidate/probes`. The author's record is `V1STR_CORRECTIVE_CYCLE.md`. Bytes judged (sha256 prefix):
  - `src/r7b-repertoire.mjs` 0a8d2013… (43+/11- against its frozen base)
  - `src/v1-strength.mjs` 81dce34e…
  - `src/v1-strength-index.mjs` 36666ab2…
  - `v1/STRENGTH_EXTENSION_V1.json` 15a51f55…
  - `scripts/v1str-freeze.mjs` 5d92f18a…
- **Where things ran:** The joint suite ran in the worktree, which stayed clean. Everything else ran in new scratch clones: `r2-clone` at `3342a1d`, five mutation slots `r2-mut-*`, and `r2-freeze`, which holds a TEST-ONLY enabling record. No recursive deletion was used.
- **Independence:** I read the SSCTR R1 review only for the statement of SSCTR-STR-A-01. I did not read the SSCTR recheck.
- **Probes:** new probes are `reviews/qre/probes/r2-*.mjs`, with outputs in `probes/outputs/r2-*`. The R1 probes were rerun unchanged on `3342a1d`.

## Verdict: NOT_READY

The cycle fixes my R1 blocker and most of my conditions, and I measured each fix myself. It also introduces one regression, which is BLOCKING (QRE-STR-B-01). In a plan in force, the new `established` preference (D-15) can put into the asking MAIN slot a vertical exercise the plan held only as an accessory. The MAIN row then carries the accessory's dose state.

This is the same defect SSCTR blocked in round 1 (SSCTR-STR-A-01), reached by a path this cycle created. It also falsifies the cycle's own claim, "no MAIN row given another row's dose".

- **Where it happens:** 16 of 308 plans in force, all after a change from 4 or 5 strength days to 2.
- **Example:** an INTERMEDIATE hypertrophy plan with bands. pike-push-up goes from ACCESSORY 2×10/2×12 to MAIN 3×14, 2×16, 4×16, while the goal range is 8 to 12. Without the plane rule the same slot stays `push-up`.

**From the quality side:**
- No enabling record should be issued for **V1X-STRENGTH-PLANE** over the bytes of `3342a1d`.
- No freeze should be written over `3342a1d`. The verifier writes a freeze only when all four boundaries are on, and the plane boundary should not be enabled.
- **V1X-STRENGTH-HOLD-DOSE, V1X-STRENGTH-UPPER-LOADING and V1X-STRENGTH-EXPOSURE** behave as declared on everything I measured. Their remaining items are conditions and observations, not blockers.
- The fix for B-01 is bounded, but under the mission rule it cannot be made in this recheck.

## R1 findings: status

| id | R1 severity | status | evidence on 3342a1d |
|---|---|---|---|
| A-01 | BLOCKING | **CLOSED** | `qre-b2-anchor-variants.mjs` was rerun unchanged. In all three variants (machines, bands, dumbbells), the plan returns to `lat-pulldown` + `db-overhead-press` when the equipment comes back, and the anchors do not move. B1 of `qre-b-selection-paths.mjs` gives the same result for 4 intakes. |
| A-02 | CONDITION | **CLOSED** | `TRUNK_SLOT_UNFILLED` is declared in `strengthExtension.disclosures` at the substitution and at every later review, for both set-aside reasons (`r2-a`, A4). OFF has no gap and no disclosure. |
| A-03 | CONDITION | **CLOSED** | The four earlier records are pinned. The pins equal `git show 2dfa216:<record>` for all four (checked). `--preserved` refuses a record with an edited note, and a record together with its bound SSCTR file, committed or not (`r2-freeze-rehearsal`). |
| A-04 | CONDITION (integration) | **OPEN, as declared** | Through `v1-index.mjs`, an equipment change still brings `front-plank` back into a plan built under N1 (`qre-e … mixed`). The owner is integration (cycle §2). |
| A-05 | CONDITION (integration) | **PARTIAL** | A plan built under other rules now gets the clinical answer, exactly as the entry point below gives it: a pain sign, an injury sign, pain with an exercise, and a hold already recorded, for 4 kinds of other rules (`r2-a`, A3). Every other review stays UNSUPPORTED. The continuation path is still open (cycle §2). |
| A-06 | OBSERVATION | **CLOSED** | A JSON `strength` field is inert again at the frozen entry points: the `v1-index` plan hash is `29f0b2dd…` on `2dfa216` and on `3342a1d`. Only a code-level Symbol still acts there (D-12). |
| A-07 | OBSERVATION | **CLOSED** | The D-6 effect is gone. Same-exercise dose differences fell from 562 rows to 24; all 24 are `band-pulldown`, selected by the rule itself, in 8 plans. N1's set and minute effect on the trunk row is now a declared limitation (D-17). |
| A-08 | CONDITION | **CLOSED** | All 14 R1 survivors the cycle named are now killed. 33 of 41 round-2 mutants are killed. The non-equivalent survivors, X2-09 and X2-11, are minor (see the mutation section). |
| A-09 | OBSERVATION | **CLOSED** | `--preserved` and `--check` now refuse a committed change to r4/r5 policy, a new file in r5, the r5 SSCTR review, and an untracked `src` file. |
| A-10 | OBSERVATION | **CLOSED (documented)** | The verifier header now says the freeze binds `candidate/`. `--check` still drifts on a later file there, by design. |
| A-11 | OBSERVATION | **CLOSED** | The cycle record corrects the description of the earlier verifiers. |
| A-12 | OBSERVATION | **CLOSED** | `test/v1str-freeze.test.mjs` runs `--preserved` inside the suite. In my joint run it ran (0 skipped) and passed. |
| A-13 | OBSERVATION | **CLOSED** | A row without `athleteId` now counts 0. 8.5 repetitions no longer count; 8 does. Logged sets are still uncapped (5,000 count as 5,000), which is a descriptive matter for G03. |

## New findings

| id | severity | statement | reproduced in |
|---|---|---|---|
| QRE-STR-B-01 | BLOCKING (PLANE) | **A MAIN row takes an accessory's dose state again, through the cycle's `established` preference in a plan in force.** At build, `heldAs` keeps a vertical held as an accessory in an earlier session out of the asking MAIN slot. After 4→2 or 5→2 strength days, the template keys change and the asking slot has no anchor. It then prefers a vertical among `established` exercises, which includes one the plan held only as an accessory; the new 2-day week holds no accessory to trip `heldAs`. The MAIN row continues that exercise's accessory dose state. **Scope:** 16 of 308 sequences (8 of 4→2, 8 of 5→2). The exercises were lat-pulldown, pike-push-up, band-assisted-pull-up and db-overhead-press. The athletes were INTERMEDIATE, NOVICE with a named exercise, and hybrid; there were none in NONE. In none of the 16 does the same sequence without the plane rule do this. **Dose examples:** HYPERTROPHY, bands: pike-push-up MAIN 3×14, 2×16, 4×16 (range 8–12); without the rule FULL_B:2 stays push-up. HYPERTROPHY, machines: lat-pulldown MAIN 2×12 and 3×8 with the accessory's set count; without the rule it stays seated-cable-row. STRENGTH, machines: lat-pulldown MAIN 2×6, 3×6, 4×6. **Fix (bounded):** in the fallback, prefer only configurations the plan holds as MAIN, never one it held only in another role, or keep the R1 behaviour (prefer nothing without an anchor) and accept the D-2/D-15 cost. | `r2-b-cycle-regressions.mjs` (B2); `r2-c-role-switch.mjs` (4 traced cases with the goal dose) |
| QRE-STR-B-02 | OBSERVATION | **`--check` fails right after `--write`.** The new `untracked()` check does not exclude the verifier's own record, so `--check 1` exits 1 ("(untracked) CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json") until the record is committed. After the commit it passes. The order is write, commit, check; the header should say so, or `untracked()` should skip `RUNTIME_FREEZE_V1STR_n.json`. | `r2-freeze`: `--write 1` then `--check 1` |
| QRE-STR-B-03 | OBSERVATION (D-12 path) | **A malformed supplied authority now throws.** A supplied development authority (`options.strengthExtension`) whose `values` lack the new `holdDose.knownLimitations` array makes `generateProgram` throw (`Cannot read properties of undefined (reading 'map')`), uncontained. In R1 such values degraded silently. Only reachable with a hand-supplied authority. | `r2-a` (A6); the R1 probe `qre-a` stops on it |
| QRE-STR-B-04 | OBSERVATION | **NONE plans in force get anchors on rebuild.** A plan built with no asking slot (class NONE, D-13) gets `planeAlternation` annotations, and so anchors, on its first rebuild, because `practiceStart` is not consulted in force. In 35 of 35 NONE sequences (5 schedule changes × 7 equipment profiles) this changed only the annotations: no selection, prescription or week differed from the same plan without the plane rule. Mutant R2-04 (consult the class in force) therefore survives as selection-equivalent. | `r2-d-none-in-force.mjs` |

## Regressions searched for and not found

- **`practiceStart` vs the engine's class NONE:** they agree on 255 of 255 plans. The intakes covered stated and month-derived experience, a named exercise, a `familiar:false` entry, an unknown name, current and stale doses, and hybrids, across 5 equipment profiles and 3 day counts. Restarts after a 1-week and a 6-week pause keep the class and its asks (NONE gives 0, FAMILIAR_UNKNOWN_LOAD gives 2).
- **New exercises:** across the 308 in-force sequences, the rule never brought in an exercise that is in neither the plan before nor the plan after without the rule. The only vertical lost after a change was `band-pulldown` in the BANDS_PULLUP hybrid (4→2 and 5→2), where `band-assisted-pull-up` takes the MAIN (part of B-01).
- **Event weeks:** schedule and equipment changes inside the taper (3 equipment × 3 changes) bring nothing new into taper, race or post-event weeks.
- **Clinical pass-through:** only CLINICAL_HUMAN_REQUIRED without a proposal passes, and it is byte-identical to the answer of the entry point below apart from the two keys. Weekly, systemic, adverse-week, substitution, equipment and schedule reviews stay UNSUPPORTED even where the entry point below would MODIFY. A hold from the pass-through answers first on the next review.
- **Symbol carrier:** every caller form is taken off by the new entry point: the option key, and the Symbol on a supplied `repertoire`, `authority.repertoire` or the authority itself, as own, hidden or inherited properties.
  - A JSON round trip of an authority drops the rules, as intended.
  - In a long bodyweight plan under the rules, no hold appeared through 14 reviews of 7 kinds (weekly, schedule change twice, equipment change twice, local and systemic fatigue, substitution), and the binding stayed intact. So the rules did not vanish mid-flow on those paths.
  - I found no `structuredClone` or JSON copy of an authority in `src`.
- **Off-identity:** with no options, 576 of 576 first plans and 70 of 70 reviews and restarts match `v1-run-forecast-index`. The frozen `v1-run-forecast-index` gives digest `a0c2ab8c6a6ff78e` on both `2dfa216` and `3342a1d` (360 answers).

## What I measured

- **Joint suite (worktree):** 1600 tests, 1598 pass, 2 fail. The failures are `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: …` and `I10, V6: …`, by name.
  - Every test passing at `2dfa216` passes here except `I10, V6`.
  - Two own tests were renamed by the cycle ("SQ-4 c4 …", "V-EXT-01 only this entry point …"). No historical test was edited; only `test/v1str-*` files changed.
- **Own tests:** 64 of 64 across 5 files, 0 skipped (the freeze test ran). The mutation control was 63 of 63 over the 4 behaviour files.
- **Preservation differential (648 plans against OFF, 103,834 rows):**
  - Rows outside each rule's scope: 0. Status, runs, week shape, phases, blocks and interference: 0 differences.
  - Rows changed by each rule: 13,088 with all rules on (5,340 HOLD, 3,334 UPPER, 5,195 PLANE).
  - Same-exercise dose differences: 24 under PLANE, 0 under HOLD and UPPER.
  - No session exceeds the athlete's strength minutes (0 of 41,472).
- **N3:** planned counts match the catalog oracle on 2,304 weeks; corrections and conflicts through the engine are read correctly; nothing reads the exposure (18 of 18).
- **Freeze verifier on `3342a1d`:**
  - `--preserved` exits 0 on a pristine tree and refuses all 13 refusal cases: a frozen file, a byte or trailing newline in the amended file, an edited earlier record alone or with its bound file (committed or not), the r5 review, an untracked or committed new `src` file, a new file in r5, r5 policy and r4 registry. The two files it passes belong to this extension (an own-pattern test file, the values file), which only `--check` covers.
  - `--write 1` over a TEST-ONLY enabling record for the new values hash succeeded. It ran the joint suite with all four boundaries on by default (same two failures) and bound 42 files.
  - `--check 1` fails before the record is committed (B-02) and passes after.
  - `--check 1` drifts correctly on a withdrawn record, a changed earlier record, a later file in `candidate/`, an untracked `src` file, a changed r5 policy, and one byte of the amended file.

## Mutation (round 2)

There were 41 mutants on the lines the cycle changed or added, plus the R1 survivors it claims to cover. They ran against the 4 behaviour test files (63 tests). As the cycle asked, `v1str-freeze.test.mjs` was left out, since any changed byte fails it. The green control was 63 of 63; there were no timeouts.

| file | mutants | killed | survived |
|---|---|---|---|
| `r7b-repertoire.mjs` | 14 | 12 | 2 (R2-04, R2-07) |
| `v1-strength.mjs` | 10 | 8 | 2 (V2-08, V2-10) |
| `v1-strength-index.mjs` | 17 | 13 | 4 (X2-05, X2-09, X2-10, X2-11) |
| total | 41 | 33 (80%) | 8. Six are equivalent or selection-equivalent, so the score over the rest is 33/35 = 94%. |

**Now killed.** The 14 R1 survivors the cycle named are all killed: R01, R18, V05, V19, V25, V27, V30, X03, X04, X09, X15, X16, X19 and X20.

**Also killed:**
- the A-01 revert (R2-10);
- removing the established preference (R2-08) or `heldAs` (R2-05, R2-06);
- turning `practiceStart` off or ignoring named exercises (R2-02, R2-03);
- every clinical pass-through change except R2-05's twin X2-05 (no pass-through, any answer passes, asking under the refusal options);
- the Symbol read through a JSON field (R2-11, R2-12).

**V17 (V2-08) survives.** I accept the cycle's claim that it is unreachable for selection: NONE plans carry anchors only after a rebuild, and they hold no vertical to prefer.

**Survivors and what they mean:**
- **Equivalent:** R2-07 (template rows carry only MAIN or ACCESSORY) and V2-10 (hash pin).
- **Equivalent in practice:**
  - X2-05: the engine answered no CLINICAL_HUMAN_REQUIRED with a proposal in 12 of 12 cases.
  - X2-10: without HOLD a plank fills the trunk slot.
- **Selection-equivalent:** R2-04 and V2-08, which change annotations only (B-04).
- **Not equivalent, minor:**
  - X2-09: the trunk-gap disclosure would show on an INVALID_INPUT or UNSUPPORTED answer.
  - X2-11: a trunk gap only in the novice set would go undeclared. That needs class NONE with 3 to 4 days, where CORE exists only in the novice set.

Neither is a condition on its own. No test covers B-01, which no mutant was designed to catch either.

QRE-STR-A-08 is therefore **CLOSED**.

## Declared readings D-13 to D-17 (engineering)

- **D-13 (no plane rule for a new class-NONE plan):** implemented as declared and equal to the engine's class (255 of 255). In force the class is not consulted (B-04): annotations only, no selection change.
- **D-14 ("another role" looks at earlier sessions of the week):** true for a new plan. In a plan in force it does not hold once the keys change: B-01.
- **D-15 (after a change of days, the plane is preferred among exercises the plan already uses):** keeps the verticals and brings nothing new. However, "already uses" includes exercises used only as accessories, which is B-01.
- **D-16 (only the clinical answer passes):** verified.
- **D-17 (trunk under tight session time):** the HOLD-only differential matches its direction (2,880 sessions with different set totals, 2,990 with different minutes, none over budget). I did not rerun the SSCTR time probe.

## Security

Unchanged from R1: no focal review is needed for this candidate. The carrier change narrows the input surface: a JSON field can no longer carry rules. Integration still needs the focal review named in R1.

## Not verified

- The sporting acceptability of any dose. B-01 is reported on rule-caused role change and the goal range in the policy file; SSCTR owns the sporting reading.
- Integration, real data and any UI.
- Exhaustive event sequences. The in-force search covered 11 change patterns × 7 equipment profiles × 4 athlete types, not every combination.
- The SSCTR probes the author cites (`scan-roles.mjs`, `probe-time3.mjs`, `probe-binding.mjs`) were not rerun by me.
