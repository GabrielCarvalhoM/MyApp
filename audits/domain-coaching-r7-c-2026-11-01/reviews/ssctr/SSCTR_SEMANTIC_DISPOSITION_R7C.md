# SSCTR semantic disposition — R7-C Phase 4, Etapa F

Record `SSCTR-SD-R7C-r1`, dated 2026-11-01, with the structured record in [SSCTR_SEMANTIC_DISPOSITION_R7C.json](SSCTR_SEMANTIC_DISPOSITION_R7C.json).

- **Reviewer:** project agent `sports-science-concurrent-training-reviewer`, model `claude-opus-5-5`, effort xhigh.
- **Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. There is no human, empirical or clinical validation, and no gate or publication effect.
- **Bytes:** runtime `39115ed`, HEAD `f6c688c`:
  - `r6-adaptation.mjs`: `7dda46de…c605`;
  - `r6-composition.mjs`: `2a4c47e8…b7ce`.
- **Unchanged inputs, verified:** policy, catalog, `product/`, `canon/` and the queue (230 items, `95ea4b92…99c8`, funding NOT_DECLARED).

## Decision

| Field | Value |
|---|---|
| Founder's question | **YES in principle.** The authority should distinguish a session known not done from a session with no report. |
| `SEMANTIC_DISPOSITION` | **NOT_READY** |
| KEEP_R12_UNREPORTED_AS_MISSED | Rejected on the merits |
| D1 | **ACCEPTABLE_RESIDUAL** |
| G02 | **Confirmed** inside R6-PARTIAL-NOISY-LEARNING (r12 conditions 8 and 13; AEC §1.3) |
| Four legacy tests | **Not authorized** at `39115ed` |
| Queue items | None proposed now |

Under the Founder's rule:
- no test is edited and no freeze is made;
- the conflict below is recorded;
- Phase 4 closes NOT_READY.

## Why the principle holds

Product Truth already requires the distinction:
- AEOS §15: missing data is censored or unknown.
- AEC §2.1: missing sync, partial and really omitted sessions are different.
- AEC §4: without confirmation, the state is unknown, never non-completion.
- AEC §1.2: decisive uncertainty goes to ASK, HOLD or RECONCILE, without a physiological default.
- DR-118: unknown is never zero or "not done".

V1 reads from HealthKit (DR-121), so an activity can exist without reaching the app.

The sporting stakes are asymmetric:
- A real stop of several weeks costs endurance capacity and calls for re-entry ([Mujika & Padilla 2000](https://pubmed.ncbi.nlm.nih.gov/10966148/), abstract only).
- A zero reading of a trained athlete strips the taper of the volume and intensity pattern associated with the best performance ([Bosquet et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17762369/), abstract only).

Asking is the smallest step that assumes neither reading. Evidence that a sudden load jump causes injury is very limited ([Damsted et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30534459/)), so no conclusion here rests on it.

## Why NOT_READY: SSCTR-SD-01 (blocking, safety-relevant)

**What happens.** The athlete can answer UNREPORTED_TRAINING with a known stop (every gap run reported not done) before the next weekly review. The decision then keeps the stored projection, and validates it, for the rest of that week.

**Probe SD7:**
- **Reviewed path:** R7-C credits the stop in 12 of 16 cells; the other 4 ask. B.2 plans the entry in 16 of 16.
- **Unreviewed path:** both runtimes credit it. This is the pre-existing R18 path, which R7-C was assigned to close.
- **Example:** KEEP and VALID with EASY 50 / THRESHOLD 41 / LONG 65 ahead, after seven weeks reported not done. Reported on time, the same misses plan 15 / 15 / 15.

**The committed test misses it (SD9).** The exact fixture of `test/r7c-phase4.test.mjs:85` gives week 8 at the entry, so the test passes. Week 7 keeps THRESHOLD 34 and LONG 60, which the test does not check.

**Controls (SD8):**
- The result is the same with the reports timed at the answer.
- The exposure ends at the week's own review.

**Fatigue path (SD1).** SYSTEMIC_FATIGUE re-submitted with a not-done answer reduces from the projection, not from the entry.

**What it contradicts:**
- the approved single-run ceiling (D18);
- R7-C's own rules 1 and 2;
- r12 R18;
- the Phase 3 claim that reported misses reproduce B.2 bit for bit.

**Root cause.** The current week is re-planned only on corrections or retractions. Once the answer removes the unknowns, the gap guard stands down, and the stored doses left by the earlier questions stay in force.

**Smallest fix (runtime only).** When a decision's facts turn the window from unknown to known, plan the run doses still ahead in that week from the facts before any decision keeps, validates or reduces them:
- a known stop gets the entry, or a declared break's return recipe;
- executed sessions get their evidence.

Then add directed tests:
- the SD7 grid;
- the `:85` fixture asserting the answer week;
- mixed answers;
- a mutant that removes the re-plan.

## Boundary rulings

**B1 — hold region: acceptable.**
- The two readings give the same dose, bounded by a known run inside the window.
- Condition C4: the internal gating label `MISSED` must never be shown as "not done".
- A B.2-identical policy observation is routed to the policy owner: holds after about four known-miss weeks while an anchor run is still in the window.

**B2 — known run anchors: acceptable residual.**
- With the easy runs unreported, the taper's easy runs sit at the minimum.
- This equals the known-miss reading and B.2.
- It is conservative, and the reason makes no "not done" claim.

**B3 — independent changes: acceptable, with condition C5.**
- Kept changes stay unvalidated (REQUIRES_RECONCILIATION).
- A nonclinical EXERCISE_SUBSTITUTION asks and waits for the answer. That fails closed, but a strength intent is blocked: apply it strength-only in a later revision.
- With pain, the substitution goes to the clinical route first.

**B4 — late-week decisions: the questions are correct, the answers are not.**
- The pending question is repeated verbatim.
- An answer given at the end-of-week review works.
- An answer given mid-week is SD-01.

**B5 — asking cost: acceptable, with conditions C2 and C3.**
- A never-reporting athlete gets the question at all 10 decisions and has no valid run plan until answering.
- The holdout's new questions (H19 S1, H17 S1, H21) follow from corpus gaps.
- A fatigue signal reported with the question is lost if the answer comes through a plain review (SD-03).

## Conditions for any later acceptance

- **C1:** fix SD-01 and re-present the disposition.
- **C2:** make O1 binding. While the question is pending, no consumer presents the stored run doses as a prescription.
- **C3 (G03):** the answer path:
  - takes a low-friction answer: per session done or not done, or a break with its reason;
  - uses HealthKit evidence before asking;
  - never falls back silently to credit or zero;
  - re-evaluates the pending event's own signal.
- **C4:** history and adherence keep "no report" distinct from "reported not done".
- **C5:** apply a nonclinical substitution strength-only. Not blocking.
- **C6:** when the tests are re-requested, each splits into UNREPORTED, KNOWN_MISS and ANSWERED_KNOWN_STOP, as detailed in the JSON. The UNREPORTED variant of QRE-R6-04 asserts that no decision returns VALID with quality, touch or strides ahead while the run ledger is empty.
- **C7:** disclose D1, B2, the B1 observation and the fifth legacy fixture.

The fifth legacy fixture is `test/r6-adaptation.test.mjs:140`. It was edited in Phase 2 (disclosed in that checkpoint) and is not ratified here.

## D1 and G02

**D1.**
- Steps S2–S4 of H19 are identical to B.2 at `39115ed`, and S4 still keeps (SD5).
- S1 now asks, because the corpus has no earlier facts.
- The clinical route is intact.
- An in-cycle reduction rule would be a new policy. This record does not review evidence for one and abstains.
- Owners: SSCTR with PCG for the rule; Product/UX for a check-in.

**G02.**
- Learned maintenance only holds the long run at a dose already executed, with consent.
- It needs an established association (EMERGING or STRONG, never MIXED), the identical prescription and arrangement pool, the BUILD class, and evidence no older than 56 days.
- It never sets a new dose, step or threshold.
- The probe was re-run and its output is byte-identical. O3 is coherent; O4 is a G07 privacy question.

## What was verified, and what was not

**Run by this reviewer:**
- **Full suite:** 832 tests, 828 pass; the 4 failures are exactly the four legacy tests.
- **Coordinator probes re-run, outputs identical:** adversarial G01, adversarial G02, suite dispositions.
- **Own probes:** SD1–SD9 under [probes/sd/](probes/sd/), outputs in `probes/sd/out/`.
- **Literature:** opened on PubMed, abstracts only.

**Not verified:**
- the full texts of the three sources;
- the mutation run and the coordinator's holdout, differential, clinical sweep and conformance outputs (read, not re-run; H19 reproduced independently);
- schema validation (Python is unavailable; this record follows the request's field list);
- real-user asking cost;
- SD-01 in decision kinds beyond those probed.

Untracked `probes/b2-copy/out/*-R7C-P4-39115ed.json` files are not this reviewer's.

**Re-review:** on any change to the two runtime files, a fix for SD-01, a G03 decision or relevant policy changes; at the latest 2027-04-30. Owner: Chief.
