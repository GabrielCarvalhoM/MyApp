# R7-D Phase 3.4 — decision request (SSCTR domain decision; PCG F08 authority form)

Coordinator: the Phase 3.4 Chief instance (also the engineering worker). It gives no verdict. Authority: [AUTHORIZATION_PHASE34.md](../AUTHORIZATION_PHASE34.md). Baseline: R7D-FREEZE-4 (record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json`, sha256 `bee62152…`, runtime bytes `3228a70`, `r6-adaptation.mjs` `15e4279b…`), re-verified at the start of this phase: `verify-r7d-4.mjs --suite` 27/27 PASS.

Read first: the two Phase 3.3 records (`phase33/reviews/ssctr/SSCTR_PHASE33_RECHECK_R7D.json`, `phase33/reviews/engineering/QUALITY_CHECK_R7D_PHASE33.json`), PREREG-5 with its addendum, INTERFACE-5.

---

## Part 1 — SSCTR: domain decision before implementation

You decide the domain readings below under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY (nonclinical only). No new dose, threshold, count, length, percentage or ceiling may come from this record. A fresh SSCTR instance will later recheck the implemented candidate; this record is the rule it is checked against.

### 1.1 The defect and the Founder's direction

- **SSCTR-P33-F01** (your Phase 3.3 finding): with an earlier separate break unapplied, training between it and a later break that completes no plan week in every sport is counted as stop days, so the class grows with the training span (V1: LONG 32 RESTART, against SHORT 4 by the episode rule).
- **The Founder adopts your option (a), "direction A":** reconstruct the state that applying the earlier break would have produced and read the executions after it, instead of turning those weeks into stop days. Distinguish an isolated session from partial but consistent training, a proven re-entry, late or bulk reports, and running and strength resuming differently. Never impose SHORT 4; never invent physiology. If direction A is not implementable correctly under existing authority, say so and route the block; **do not substitute per-sport re-entry (option b) silently.**
- **The mandatory case:** 14-day holiday; two weeks with every run done and one strength session missed each week; a 4-day trip. FREEZE-4: LONG 32 RESTART.

### 1.2 The candidate reading the coordinator prototyped (scratch only; diff `prototype/PROTOTYPE_A.diff`)

For two separate unapplied breaks, earlier **x** and the stop that begins after it, the training between is classified by the evidence reducer's own predicates, per plan week wholly between them:

1. **Full re-entry** (unchanged, FREEZE-4): a plan week wholly between, executed completely in every sport it plans (`complete`, COMPLETED_SESSIONS) → x is `TRAINING_AFTER`; the later stop reads the executed history.
2. **Direction A** (new): no full re-entry, but a plan week wholly between executed completely in **at least one** sport → x is read as **its own return** (`OWN_RETURN`), reconstructed exactly as `returnAfterPause` would have applied it **the day after x ended** (the athlete's first day back):
   - x's own stop (x with any breaks before it, by the same rules, recursively), its class from its own declared days (SHORT ≤ 10, MODERATE ≤ 28, LONG — the unchanged R6 table);
   - its entry by the unchanged R6-NONCLINICAL-RETURN recipe from the state at its start, **with no current demonstration** (the reviewed entry dose);
   - then the evidence reducer reads the training after that return per sport, by its existing rule (a closed or complete week steps; anything else is a fact with no step; adverse responses hold; executed doses cap — `historicalRun`);
   - the later stop's class comes from **its own** days.
   - **Per sport** (Front B, item 4 below): a sport that has its own whole complete week between reads its executed history, as in (1); a sport without one reads from x's reconstructed return.
   - Guard: if a return already applied lies between x and the later stop, nothing is reconstructed (the existing path and question stand; QE-R7D-P33-03).
3. **Continuity** (unchanged): no plan week complete in any sport (isolated, partial or aborted sessions only) or nothing trained → the stop runs through x (`TRAINING_NOT_REESTABLISHED` / `NO_TRAINING_BETWEEN`). Unreported sessions between are asked before (2) or (3), as now.

No new number: the class table, the recipe, the reducer's predicates and the "day after the break" (the break's own end) are existing facts or rules.

### 1.3 What the prototype produced (outputs in `prototype/out/`, labelled, reproducible with the diff on a FREEZE-4 rebuild)

Variants: **γ** = the reading above; **M** = (2) without the per-sport part (every sport from x's return); **ANY** = (2) triggered by any executed session (no week requirement).

| Case | Shape | FREEZE-4 | γ | M | ANY |
|---|---|---|---|---|---|
| X5 = V1 (mandatory) | 14 d holiday; 2 wks, every run done, Fri strength missed; 4 d trip | LONG 32 RESTART; run 15/20/20/20 | SHORT 4; run EASY 75/50/41/65 (= E1's executed); strength: Fri lifts re-established (> 28 d undone, existing per-exercise rule), Mon lifts at return entry | SHORT 4; run 65/45/34/60 (prior, via 2 return steps) | = γ |
| V2 | 2 wks, Tue easy run missed each week | LONG 32 RESTART | SHORT 4; run RETURN 20/30/30/45 (x's return, no step); strength executed 2x8@85 | run same; strength 2x8@82.5 | = γ |
| V3 | 3 wks, Fri strength missed | LONG 39 RESTART | SHORT 4; run 65/50/43/75 | 60/45/41/70 | = γ |
| V5 | late form; weeks 4–5 reviewed at the time, Fri missed | LONG 34 RESTART | SHORT 4; run 50/41/60, then THRESHOLD 48 | 45/34/55, THRESHOLD 34 | = γ |
| X3 | 1 wk: runs done, Fri strength missed | MODERATE 25 (20/30/30/45) | SHORT 4; run 70/50/41/70 (= X3c, the complete week) | SHORT 4; RETURN step 1 (45/45/34/60) | = γ |
| X4 = I5 | 1 wk in full, strength logged without RIR (P33-F02) | MODERATE 25 | SHORT 4; run 70 (= the RIR control) | RETURN step 1 | = γ |
| I4 | late form, reviewed week without RIR | MODERATE 27 | SHORT 4; run 50/41/65, then THRESHOLD 41 | — | — |
| C4 | adverse recovery on a run; strength complete | MODERATE 25 | SHORT 4; run RETURN 20/30/30/45; strength executed 3x11@82.5 | — | — |
| E4 | week without its long run (strength complete) | MODERATE 25 (15/15/20) | SHORT 4 (15/15/20) | — | — |
| X8 | A; wk 4 runs done, Fri missed; B Mon–Wed wk 5; rest of wk 5 done but Fri; D Mon–Thu wk 6 | LONG 32 RESTART | MODERATE 11 (B..D: the 4 days between are in no whole plan week) from A's own return; run 20/30/30/45 | MODERATE 11; 45/45/THR 34/55 | SHORT 4 at 75 |
| **X2** | 2 wks, both sports partial (Tue run and Fri strength missed) | LONG 32 RESTART | **unchanged** (residual) | unchanged | SHORT 4; RETURN 20/30/30/45 |
| **X1** | 3-week gap, one isolated run, rest not done (14+21+4) | LONG 39 RESTART | **unchanged** | unchanged | **SHORT 4; RETURN 20/30/30/45** |
| X6 | runs with recovery ADVERSE (systemic: both sports hold) | MODERATE 25 | unchanged | unchanged | SHORT 4 RETURN |
| F1–F6, K1–K3, E1–E3, I1–I3, I6, Q1–Q7 (QRE) | isolated sessions; full re-entry; timely forms; three breaks with isolated runs | — | **identical to FREEZE-4** | identical | F1–F6 relabelled SHORT 4, same doses |
| C1–C3, X7 | clinical | CLINICAL_HUMAN_REQUIRED | identical | identical | identical |

The timely comparators (V4: weekly reviews between; K: the holiday applied when stated) are identical on every variant: direction A changes only bulk and late forms.

### 1.4 Questions

- **Q1 — Direction A under existing authority.** Is reading x as its own return (its own class and recipe, reconstructed the day after it ended, no demonstration; the training after it read by the reducer; the later stop by its own days) a correct implementation of the Founder's direction with existing authority only? Is "the day after it ended" the right point, or must it be another existing point (the report that kept it; the first executed session after it)?
- **Q2 — Isolated vs consistent training.** Is "a plan week wholly between executed completely in at least one sport" the right existing predicate to separate training that counts as training (direction A) from training that stays a fact of the stop (continuity)? ANY reopens the isolated-session pattern on long gaps (X1). γ leaves X2 (both sports partial every week) on continuity: is that an acceptable disclosed residual, given that a partial-adherence criterion would be a G03 / new-threshold matter? Should a restart on X2's path count as a domain failure in the holdout (CF-P33-03)?
- **Q3 — Per sport (Front B items 3–4).** May a sport with its own whole complete week read its executed history while the other sport reads from x's reconstructed return (γ), or must both read from x's return (M)? In particular: does a strength data gap (missing reps or RIR; a missed lift) justify holding the running conclusion, or only the strength conclusion? Any scientific or technical dependency that requires coupling?
- **Q4 — The re-entry week contract (QE-R7D-P33-01).** Which sessions must be executed for a plan week to count as complete, for full re-entry and for direction A's trigger? Rule on each: gated runs (EASY, LONG, QUALITY, WALK_JOG); optional brisk WALK; RECOVERY_EASY; SHAKEOUT; RACE_TOUCH; RACE; every strength exercise with a usable log (reps, RIR). Today the runtime gates only the first and the last; INTERFACE-5, PREREG-5 Δ1/Δ2 and P18(a) say every session. One reading will bind the runtime, P18(a), the pre-registration and the public contract.
- **Q5 — A stated start time on the later break's first day (QE-R7D-P33-02).** Should a plan week whose last session falls on that day, executed before the stated start, count as wholly between (the QRE's EXP-1 reading)?
- **Q6 — Adverse responses.** C4 and X6 above: is the reducer's reading (an adverse run holds the run; a systemic signal holds both) the right input for direction A?
- **Q7 — Invariants.** Do γ's outcomes respect: executed history never erased; missed training never credited; no calendar-only progression; no return above authorized capacity; running and strength coordinated; I9; clinical first?
- **Q8 — F08, the sporting process after a legitimate clearance** (nonclinical part only; see [../f08/F08_RETURN_PROPOSAL.md](../f08/F08_RETURN_PROPOSAL.md) and [../f08/F08_COMPETITOR_BENCHMARK.md](../f08/F08_COMPETITOR_BENCHMARK.md)). What may the nonclinical engine do once a qualified clearance exists, and what must stay with a qualified human? Which existing rules could serve S6 (reassessment, return class by the break's own length, current demonstration, prior doses as ceiling), which signs must send the athlete back to a qualified assessment, and how running and strength differ when only one is cleared. Your constitution forbids approving a clinical return: say exactly where that line falls, and do not approve anything beyond it. Runna's three return speeds are a UX reference only; no new percentage or uncalibrated choice.

### 1.5 Output

`phase34/policy/SSCTR_P34_DECISION_R7D.json` (prevails) and `.md`: disposition per question (ACCEPT / ACCEPT_WITH_CONDITIONS / REJECT / NEEDS_AUTHORITY), the binding readings for Q1–Q5, any conditions, findings, the literature you rely on (direction only), and a proposed human-revalidation item if your decision changes prescribed training. Run anything you need on your own scratch rebuild (FREEZE-4 + the diff); never on the repository.

---

## Part 2 — PCG: authority form for F08 (with the existing G04 / clinical owners)

You decide the authority form only; the sporting process is the SSCTR's (Part 1 Q8), the clinical judgment a qualified human's.

- **Inputs:** [../f08/F08_RETURN_PROPOSAL.md](../f08/F08_RETURN_PROPOSAL.md) (state machine, clearance contract, transitions, invariants, authority table, open questions P-1 … P-5), [../f08/F08_COMPETITOR_BENCHMARK.md](../f08/F08_COMPETITOR_BENCHMARK.md); the canon: `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, `canon/CANONICAL_INDEX.md`, `product/PRODUCT_DECISION_REGISTER.md` (G04 row; DR-98, DR-99, DR-101, DR-125), `governance/agents/sports-science-reviewer/CONSTITUTION.md` (SSCTR-02, SSCTR-06), INTERFACE_ONLY_R7D §1 and §4, INTERFACE-3, INTERFACE-4; the F08 triage (`diagnostic/triage/SSCTR_DIAGNOSTIC_TRIAGE_R7D.json`, finding F08).
- **Questions:** answer P-1 … P-5 of the proposal. In particular: whether any part of S5/S6 is implementable now; what a qualified clearance is and whether an athlete-declared one can ever open S6; whether an interim exit (a fresh onboarding after the professional's clearance) is acceptable or bypasses the boundary; whether the existing correction path (naming the kept clinical break and correcting its reason) conflicts with the Founder's prohibition on reclassifying the original cause, and what restriction, if any, it needs; the exact blocker, owner and reopening trigger. State whether Security is required before any clearance input.
- **Output:** `phase34/policy/PCG_F08_AUTHORITY_R7D.json` (prevails) and `.md`, in the form of `phase3/policy/PCG_F03B_AUTHORITY_R7D.*`. No `product/` or `canon/` edit.

---

**Both:** fresh instances; you did not write the prototype, the proposal or the benchmark. Read-only on the repository except your own output files. No `verify-r*`, `freeze-r*` or `--write` script against the repository. **No `rm -rf` and no recursive deletion:** scratch work goes into new, uniquely named directories under the session scratchpad.
