# R7-D Phase 3.4 — the Founder's authorization (summary, not verbatim)

Direct Founder request on 2026-11-07, after `R7D_PHASE33_STATUS = COMPLETE` (`PHASE33_CHECKPOINT.md`). The request is not stored verbatim, by the Founder's standing preference.

**Authorized:** R7-D Phase 3.4 only, on `claude/domain-coaching-r7-d` from `3edf3c5` (runtime `R7D-FREEZE-4`: record `8bbbb8e`, bound files `b242237`, reviewed runtime `3228a70`, manifest `e41418da…10ba`). Three fronts, in this order:

- **A. SSCTR-P33-F01.** The Founder adopts, preferably, the SSCTR's **direction A**: when an earlier break is still unapplied and training was actually executed before a later break, reconstruct the state that applying the earlier break would have produced and read the executions after it, instead of turning those weeks into stop days. This is an architectural direction to investigate and implement, not authority to invent physiology.
  - Distinguish: a real stop with no training; an isolated session; partial but consistent training; a proven re-entry; a later break of another nature; late or bulk reports; running and strength resuming differently.
  - The mandatory case: hybrid athlete, 14-day holiday, two weeks with every run done and one strength session missed each week, a 4-day trip. `LONG 32 RESTART` is not accepted without explicit scientific justification, and `SHORT 4` is not imposed: the return must come from authorized rules and evidence.
  - Invariants: executed history never erased; missed training never credited; no calendar-only progression; no return above authorized capacity; plan stability; running and strength coordinated; events, corrections, episodes and I9 intact; clinical signs never neutralized by a sporting return; no new dose, percentage, ceiling or threshold.
  - If direction A cannot be implemented correctly under existing authority, route the block to the SSCTR. **Never substitute direction B silently.**
- **B. QE-R7D-P33-01.** The SSCTR defines, from existing sporting authority, the evidence that recognizes a re-entry week (mandatory, optional, recovery, race-specific sessions and strength exercises); whether missing reps/RIR blocks the whole hybrid re-entry or only a strength conclusion (running is not penalized for a strength data gap unless the dependency is technically and scientifically justified). Then the runtime, P18(a), the pre-registration and the public contract are aligned to the approved reading. F01 detectors stay; controls against false blocks are added. The oracle is never weakened to obtain a PASS.
- **C. F08.** A documented benchmark of public competitor behaviour (Runna, TrainerRoad, Gentler Streak, Garmin; IOC consensus on return after respiratory infection) with an ADOPT / ADAPT / DEFER / REJECT matrix; a coherent state machine reusing existing states; a clinical-authority boundary (SSCTR on the return process; PCG and the existing G04/clinical owners on the authority transition; qualified clearance vs athlete statement). Implement only with sufficient scientific and governance authority; otherwise record a complete proposal and block only that part of the runtime. Forbidden: a later nonclinical break erasing an earlier injury, or the athlete simply reclassifying the original cause.

**Specialists:** SSCTR, PCG / G04 owners (the F08 authority transition only) and the Quality/Reliability Engineer; only those needed, no new agents, no redundant rounds. The coordinator gives no independent verdict.

**Queue:** integrating the proposed `HQ-R7D-SSCTR-P33-RECHECK` is authorized: found and its origin validated, not duplicated, scientific content preserved, append-only, linked to its freeze. It is not funded human review.

**Freeze:** only for a coherent set of approved, verified changes. A and B may be frozen with `F08_OPEN` if F08 stays blocked by authority; F08 is then never declared resolved. `R7D-FREEZE-4` and earlier freezes are preserved.

**Not authorized:** Phase 4 or the final holdout; UI/UX, Figma, SwiftUI, KMP, backend or Apple Health; push or merge; `product/`, `canon/` or scientific-policy changes outside appropriate authority; `rm -rf` or any recursive deletion (scratch rebuilds go into new, uniquely named directories).

**Close:** the Founder's report sections in Portuguese, `FINAL_HOLDOUT_EXISTS = NO`, `V1_COACHING_AUTHORITY_READY = NO`. Then stop.

**Routing (this instance, Chief and engineering worker; no verdict of its own):** T3 · R3 · L3 — a prescriptive runtime change plus a clinical-authority boundary. Judges: SSCTR (a pre-implementation domain decision, then a fresh narrow recheck of the candidate), PCG (F08 authority form only), Quality/Reliability Engineer (narrow check), each claude-opus-5-5 at xhigh. Security is not dispatched while no clinical-clearance input enters the runtime; it becomes mandatory before any such input (a new trust boundary for sensitive health claims).
