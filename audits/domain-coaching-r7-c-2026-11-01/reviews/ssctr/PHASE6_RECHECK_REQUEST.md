# R7-C Phase 6 — SSCTR narrow recheck request (on R7C-FREEZE-3, QE-R7C-07)

Reviewer: the project's `sports-science-concurrent-training-reviewer`, under its constitution and skill (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; nonclinical items only). Your last record is [SSCTR-CC-R7C-r4](SSCTR_CC_RECHECK_R7C.md) on R7C-FREEZE-2: ACCEPT_WITH_CONDITIONS, no blocker. There you found CC-F02: an adverse or mixed answer recorded by a handler clinical route was never applied after clearance, and the C3 r4 clause holds "until an engine fix".

**Narrow, not a broad scientific review.** The semantics are accepted (SSCTR-SD-R7C-r2). Phase 6 is the Engineering fix of QE-R7C-07 (with CC-F02): an answer to `UNREPORTED_TRAINING` that a refusal (R4 HOLD) or a clinical route recorded is now applied by the next eligible decision from the record, as the same answer delivered directly. There is no correction loop in this phase: a new blocker closes R7-C as `CLOSED_NOT_READY`.

## Rules

- Write only `SSCTR_PHASE6_RECHECK_R7C.md` and `SSCTR_PHASE6_RECHECK_R7C.json` in this folder, and any probes under `probes/phase6/`.
- No edits to `CoachingCore/`, no commits.
- `node CoachingCore/scripts/verify-r7c.mjs --revision 3` is read-only; never with `--write`. Never run `npm run verify` or another `verify-r*` script.
- Do not open the authoring session's scratchpad (`C:\Users\carva\AppData\Local\Temp\claude\C--Users-carva-Desktop-myApp-MyApp\a9736ead-4ba9-4430-b704-18f03e641f9c\`).
- Clinical judgment stays CLINICAL_HUMAN_REQUIRED.

## What changed (R7C-FREEZE-3)

- **Record:** `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json`, sha256 `e21da973802483f215622b88433b980e4f2241a07097ef777196c3794eae0f36`.
- **Bytes:** commit `08c6db352d102e2b33ed7e834cff980248b90299`, source digest `764ad023…4b38`, 866 tests.
- **Verifier:** `verify-r7c.mjs --revision 3 --suite`, 20/20.
- **Handoff:** `CoachingCore/r7/c/R7C_HANDOFF.md`.

In detail:

- **No new rule, dose or authority.** The fix adds a trigger for the existing factual re-plan (the composition SD-01's answered re-plan already uses, with C9's `uncredited`). It fires when the record holds run reports the stored plan did not read and, without them, the doses ahead would depend on unreported training. Only `src/r6-adaptation.mjs` changed. Policy, catalog, G02 and clinical routes are untouched.
- **Precedence kept:** clinical/safety first, then factual reconciliation, then ordinary adaptation. While a clinical route stands nothing is prescribed. After qualified clearance (the client continues with the record and no clinical reference state), the first eligible decision applies the recorded facts with no re-send. A partial answer still asks. A known stop is unchanged (the ceiling re-plan still applies it first). The new re-plan never travels with an `UNREPORTED_TRAINING` question.
- **Reach (please judge):** recorder independence on state means a stored plan resting on projection over its whole run window follows the record of that window at the first decision whose factual plan differs, however the facts arrived. That includes on-time reports with reviews that left no evidence anchor (KEEP, or none). Example: weeks 2–4 kept by KEEP reviews and weeks 5–6 never reviewed, with the Saturday lift missed. At week 7 the Saturday-only lifts now follow history (22 kg) instead of the projection (24 kg). Five closed state-model tests depended on that projection staying ahead. Their fixture was pinned (EXPECTED_SEMANTIC_UPDATE of the fixture only, no assertion changed). A plan whose window holds a run a review read keeps projecting until its review, as before.

## Evidence

From the freeze record's `evidence` block (outputs under `../../probes/out/`, label `R7C-P6-*`):
- **Recorder independence:** the Engineering grid, 160 cells: **0 failures** (72 on FREEZE-2). DIRECT == R4 == clinical for EXEC, MIXED, ADVERSE, MISS and PARTIAL.
  - Example cells: race week after a mixed answer: EASY 20 + RACE 75 (FREEZE-2 kept RACE_TOUCH 25); taper after a mixed answer: EASY 30 / LONG 40 (kept QUALITY 28 / LONG 45); GEN week 7 after an adverse answer: EASY 45 / LONG 35 (kept QUALITY 34 / LONG 60).
- **SD grid** (1,200 cells), the SD-01 check and **G02:** byte-identical to FREEZE-2.
- **G01:** 0 violations, P1 165/0. Four grid-A rows: late facts carried by a schedule change after KEEP weeks are now applied (the known-miss plan, MISS and UNREP alike; EXEC unchanged).
- **Differential against FREEZE-2:** 120 scenarios identical (on-time, short runs, returns, cold starts, never reported, mid-week unreported, late single report, skipped review).
- **Suite:** 866/866. **Clinical:** K6, K6b, CAND-01/02 and the inherited adversarial set, in the manifest.

## Recheck only

1. No new prescriptive effect: the re-plan is the facts' plan under existing authorities, never above the direct answer's.
2. Adverse and mixed answers stay inside the authorities (no association read as causation; E1/M2 of your r2 grid properties).
3. Clinical-first is intact.
4. Taper and race-week bounds hold (no race touch or taper quality the direct answer does not plan).
5. C9 still binds. Say whether its Engineering part changed for the handler routes; CC-F01 was not in scope.
6. G02 unchanged.
7. The reach above, and the five fixture pins: is following the facts there a new prescriptive effect, or the accepted semantics applied consistently?
8. Whether the C3 r4 clause ("until an engine fix") can now be narrowed, and the condition texts the closure must carry.

Gate: `READY`, `ACCEPT_WITH_CONDITIONS` or `NOT_READY`.
