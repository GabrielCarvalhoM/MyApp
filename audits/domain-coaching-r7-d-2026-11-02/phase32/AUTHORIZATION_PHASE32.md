# R7-D Phase 3.2 — the Founder's authorization (summary, not verbatim)

Direct Founder request on 2026-11-02, after `R7D_PHASE31_STATUS = COMPLETE` (`PHASE31_CHECKPOINT.md`). The request itself is not stored verbatim, by the Founder's standing preference.

**Authorized:** R7-D Phase 3.2 only, on `claude/domain-coaching-r7-d` from `747eab2` (runtime `R7D-FREEZE-2`, source digest `211b662d…efbe5`, record `93f3a38`), for exactly one defect: `SSCTR-P31-F02`. No Phase 4, no final holdout, no final author, no change to the final corpus or seed, no F08 or other clinical-return policy, no `product/`, `canon/`, repertoire/catalog or unrelated policy change, no push or merge.

**Founder decisions:**
- **F02, the rule.** A newer interruption declaration replaces an older unresolved one only when it explicitly identifies itself as a correction of that same episode, through the existing episode/correction mechanism. Otherwise the older one stays a factual record. No last-write-wins over unresolved facts, no automatic merge, and nothing is inferred to be one episode from its dates. I9 is preserved.
- **The three relations:**
  - an explicit correction is a revision: append-only provenance, the corrected facts live, no double application;
  - an exact replay records and applies nothing new;
  - otherwise the relation (correction or separate break) is asked before any dependent return becomes authoritative. The athlete is never asked to repeat the earlier facts, and clinical-first stays above the question.
- **Separate breaks** stay separate facts, never collapsed, with no durations added:
  - known training between them lets the existing rules act on that reality;
  - explicitly known no training lets the decision use the continuous no-training interval (factual continuity, not a merge);
  - unknown training between them, when the decision depends on it, is asked: unknown ≠ zero ≠ credit.
- **Clinical precedence unchanged.** No dose while a clinical route stands.
- **F08 disposition:** a qualified clearance is not R7-D authority to convert a clinical-cause interruption into the nonclinical recipe. Preserve fail-closed; record F08 as `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`, owned after R7-D by Founder/PCG with qualified SSCTR/clinical-domain review; no runtime expansion now.

**Required:**
- the F02 witness RED on R7D-FREEZE-2 before the change;
- directed tests over the 20-item matrix;
- a narrow property and metamorphic relation that detects F02, with a RED witness on R7D-FREEZE-2, PASS on the candidate and a constructed witness;
- a small targeted mutation set (the seven named mutants);
- regression: full suite, R7-B/B.1/B.2 conformance, Phase 3.1 and 3.2 directed tests, harness validation, diagnostic and generated regressions;
- a differential against R7D-FREEZE-2 with no unexplained difference;
- two fresh narrow checks in parallel (SSCTR, Engineering);
- then `R7D-FREEZE-3` with a read-only verifier (FREEZE-1 and -2 untouched), and a pre-registration update before any holdout exists if public semantics change.

Close as `COMPLETE` or `CLOSED_NOT_READY`; `FINAL_HOLDOUT_EXISTS = NO` and `V1_COACHING_AUTHORITY_READY = NO` either way. Then stop.
