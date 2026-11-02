# SSCTR semantic re-disposition: R7-C Phase 5

Record `SSCTR-SD-R7C-r2`, dated 2026-11-02, with the structured record in [SSCTR_SEMANTIC_REDISPOSITION_R7C.json](SSCTR_SEMANTIC_REDISPOSITION_R7C.json).

It supersedes the disposition and condition C6 of [r1](SSCTR_SEMANTIC_DISPOSITION_R7C.md), which is kept unchanged as history.

- **Reviewer:** project agent `sports-science-concurrent-training-reviewer`, model `claude-opus-5-5`, effort xhigh.
- **Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. There is no human, empirical or clinical validation, and no gate or publication effect. This is not the final gate: a narrow recheck on frozen bytes comes later.
- **Bytes:** HEAD `074b835`, runtime `e1a4ef4`:
  - `r6-adaptation.mjs`: `8b189617…1587`;
  - `r6-composition.mjs`: `2a4c47e8…b7ce`.
- **Unchanged inputs, verified:** policy, catalog, `product/`, `canon/`, the four legacy tests and the queue (230 items, `95ea4b92…99c8`, funding NOT_DECLARED).

## Decision

| Field | Value |
|---|---|
| `SEMANTIC_DISPOSITION` | **ACCEPT_R7C_UNKNOWN_SEMANTICS** |
| SD-01 | **CLOSED**: the answer week is re-planned from the facts before any handler decides |
| SD-02 | **CLOSED**: the answer week is tested; mutant SD-M2 is killed |
| SD-03 | **CLOSED** for the event's own signals and the plain-review route. A narrower residual remains (SSCTR-SD5-02, conditions C3 and C8) |
| R1 | **CONDITION** (C9) |
| R2 | **ACCEPTABLE_RESIDUAL**, routed to the policy owner (C10) |
| R3 | **ACCEPTABLE_RESIDUAL**, disclosure corrected |
| R4 | **ACCEPTABLE_RESIDUAL**, pre-existing; Engineering item |
| R5 | **ACCEPTABLE_RESIDUAL**, pre-existing; condition C3 |
| Legacy split | **Authorized**: QRE-R6-04, D18, F3/H25 and §19; the fifth fixture is ratified, with variants |
| Blocking findings | None |

The acceptance holds only where conditions C2, C3, C8 and C9 are carried as binding consumer conditions in the freeze record and the handoff.

## Why accept

**The r1 blocker is gone.** A known stop answered mid-week now plans the entry for the rest of the answer week. The evidence:
- **SD7:** 0 credited, against 24 before.
- **The `:85` fixture:** week 7 at 15/15/15.
- **The D18 fixture:** an answer on day 0 or day 2 equals the known miss in weeks 7 and 8.

**My own grid holds.** It covers 3,060 cells: 20 decision kinds, days 0/1/3/4/6, GEN and R10K including the taper and race week, RV and NR, MISS and EXEC.
- There are 0 validity or history violations.
- In the answer week, no VALID known-stop cell plans a run above the entry, or any quality or race touch. The only exception is strides at the entry where two executed easy weeks precede the gap, which the timely path also plans.
- B leaves A's plan in force in 2,712 cells. The rest fail closed: elapsed-session questions, the R4 HOLD, and a RECOVERED event, which never answers.

**Known misses keep the legacy answer.**
- **QRE-R6-04:** R7-C equals R7B2-FREEZE-1 at all 12 reviews.
- **The other fixtures:** the four legacy fixtures and the fifth reproduce R7B2-FREEZE-1 with the misses reported.
- **Answered known stop:** it reproduces the known-miss plan from the answer on.

**The clinical route is unchanged.** Pain wins over the answer and over a held signal.

## Residuals and new conditions

**R1 (C9).**
- **What happens.** After a known stop answered once an answer-week run has elapsed, the next week's conditional projection credits the stale stored prescription, and the plan is VALID.
- **Observed:**
  - EASY 45 / EASY 45 / LONG 55, or EASY 50 / QUALITY 34 / LONG 55, against 20/20/20;
  - in race week, a 25-minute race touch.
- **Why it is not a blocker.** The next decision always cures it before any stale session is due (168 + 16 cells, 0 ceiling breaches).
- **Consumer condition.** That week is not presented until a decision re-plans it, and the client triggers that decision at the week boundary.
- **Engineering.** Before any use beyond the offline reference, stop crediting elapsed unreported sessions in the projection, or mark it conditional.

**SD-03 residual (C8).**
- **What happens.** An answer sent inside SCHEDULE_CHANGE, EQUIPMENT_CHANGE, GOAL_CHANGE, UNAVAILABLE_DAY or LOCAL_FATIGUE drops the held SYSTEMIC_FATIGUE and validates the plan. QUALITY 34 stays where the on-time path removes it.
- **Client.** It answers through a plain review or the pending event kind, or re-submits the signal.
- **Engine.** In the next revision, the engine never clears a held signal silently.

**R2 (C10).** The same known stop gives three re-entry paths, depending only on how it reaches the engine:

| Path | Re-entry |
|---|---|
| Timely (A*) | Trimmed state, no quality |
| Late or batch (A = B) | Progression at the ceiling, threshold work in week 4 |
| Declared break | RESTART |

- All three stay within D17/D18 and the quality activation counts.
- The evidence supports re-entry, but not an optimal retraining dose by interruption length, so this record abstains on any rule.
- Correction: the reference that differs is A* only.

**R3.** With adverse evidence, B is one long-run step above A, and the step persists into week 8. With mixed evidence, B is never longer than A.

**R4 and R5.** Both are pre-existing and fail closed.

**Carried from r1:**
- C1 is satisfied.
- C2 is extended to any REQUIRES_RECONCILIATION result.
- C3 is sharpened for held signals, RECOVERED and the clinical re-send.
- C4 and C5 are unchanged.
- C7 is extended with these corrections.

## Legacy split (what each variant asserts)

The full assertions are in the JSON. Every one holds on `e1a4ef4` (probes `qre-r6-04-split`, `legacy-variants` and the re-run `phase3-suite-dispositions`).

**QRE-R6-04.**
- **UNREPORTED:**
  - no run in the ledger;
  - before the first question, every decision equals the known-miss plan (hash);
  - from the first question on, every decision with runs ahead is the typed ASK, with no proposal and REQUIRES_RECONCILIATION;
  - the only later VALID decision has nothing ahead.

  This replaces r1's wording, which conditional projections break by design (the coordinator's counts, verified).
- **KNOWN_MISS:** the original invariant, plus no intense session in the week after any decision.
- **ANSWERED:** after the answer, every decision equals the known-miss plan, and the original invariant holds.

**D18.**
- **UNREPORTED:** typed ASK, never reviewed and reviewed empty; both ask about the same 13 sessions.
- **KNOWN_MISS:** week 7 at the entry.
- **ANSWERED (day 0 and day 2):** REPLAN_FROM_EVIDENCE, VALID, the runs ahead equal the known miss, and week 8 equals the known miss.

**F3/H25.**
- **UNREPORTED:** S1 keeps the invariant; S2 is the typed ASK.
- **KNOWN_MISS:** the original invariant.
- **ANSWERED:** the re-submitted event, or a plain review followed by the event; the original invariant holds on the result.

**§19.**
- **UNREPORTED:** week 4 is the typed ASK with no block review, and nothing grows (55 ≤ 60; the state holds at 60).
- **KNOWN_MISS:** the original invariant.
- **ANSWERED:**
  - at the end of week 4: the block review names the held doses, and week 5 equals the known miss;
  - mid-week 5: the runs ahead are at the entry.

**Fifth fixture (`r6-adaptation.test.mjs:140`).**
- **EXECUTED:** the Phase 2 edit, ratified as this variant.
- **UNREPORTED:** typed ASK.
- **KNOWN_MISS:** REESTABLISH at the entry, no quality. The run on the review day, outside the declared 6 days, must also be reported.
- **ANSWERED:** REESTABLISH at the entry, no quality.

## What was verified, and what was not

**Run by this reviewer at HEAD `074b835`:**
- **Full suite:** 848 tests, 844 pass; the 4 failures are exactly the four legacy tests.
- **R7-C directed tests:** 49/49.
- **Coordinator probes re-run, byte-identical:** SD grid, verify-sd01, G01, G02, holdout, the three conformance checks, neighbors and differential (both exit 1, as recorded), and my r1 probes sd/sd7/sd8/sd9.
- **Suite dispositions:** identical to Phase 4 except one reason string.
- **Own probes:** 8 under [probes/sd5/](probes/sd5/), outputs in `probes/sd5/out/`; two were re-run and are deterministic.
- **Literature:** two new sources (Mujika & Padilla 2000 Part II, through a catalogue summary; Barbieri et al. 2024, a systematic review, through a summarizing fetch).

**Not verified:**
- the full texts of the sources;
- the mutation run and the b2-copy clinical probes (outputs read, not re-run);
- schema validation (Python is unavailable);
- real-user behaviour and consumer compliance with the conditions;
- R1 and R2 beyond the probed shapes;
- R3 beyond week 8.

**Proposed queue items (not appended):**
- the R7-C unknown semantics;
- the G02 binding.

**Re-review:** on any change to the two runtime files, the legacy-split commit (final recheck), an engine fix for C8 or C9, a G03 decision, or a relevant policy change; at the latest 2027-04-30. Owner: Chief.
