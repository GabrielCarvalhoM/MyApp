# R7-D Phase 3 — the Founder's authorization (summary, not verbatim)

Direct Founder request on 2026-11-02, after `R7D_PHASE2_STATUS = DIAGNOSTIC_BLOCKED` (`PHASE2_CHECKPOINT.md`). Recorded here because the PCG F03-B record asks for it on disk (condition C10). The request itself is not stored verbatim, by the Founder's standing preference.

**Authorized:** R7-D Phase 3 only. It covers a narrow correction of the blockers the independent diagnostic found, the harness gaps relevant to the gate, and the final runtime freeze candidate. Branch `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, from `cdff248`, runtime R7C-FREEZE-4 (`a9654c8`).

**Founder decisions:**
- **DX-02 (SAFETY_BLOCKER): correct.**
  - The same interruption fact is factual whatever the carrier. A declared pause never depends on a pending UNREPORTED_TRAINING question to be read.
  - Order: clinical/safety → factual state → return/re-entry → ordinary adaptation.
  - Reuse the existing return authority. No new return protocol, and no dose raised to resolve ambiguity.
- **DX-01: correct.** A completed-work row causally accepted into the record must not become invalid merely because its normalized timestamp is re-evaluated. Preserve causal ordering, day precision, late evidence, corrections, duplicates, `firstRecordedAt` and append-only history. Do not simply disable the temporal validation.
- **F03-A: correct (mandatory).** Prescription → execution log → ingestion → factual history, with no semantic loss, plus a round-trip test.
- **F03-B: narrow policy decision authorized,** with the SSCTR and the appropriate Product Constitution & Governance owner, on one question: how a machine load progresses when the executable increments depend on the machine.
  - Not allowed: hardcoding +2.5 or +5 kg, assuming one stack for all machines, an impossible weight, or false precision.
  - "Uma mudança estreita de policy está autorizada somente se necessária para resolver F03-B e aprovada pelos owners."
  - Otherwise: `F03_POLICY_BLOCKED`, and stop before the freeze.
- **F04: correct.** It stays a blocker even though its harmful form was seen only in a minimal witness. `confounded` may limit the causal and performance reading, but never erases or neutralizes independently reported adverse recovery or impaired function. No new threshold, no new dose; clinical first.

**Also authorized:**
- **Harness corrections:**
  - consent carried between decisions;
  - goal and race changes followed only when adopted;
  - confounded separated into performance, recovery, effort and next-day function;
  - P08 independent of the carrier;
  - load logging in the runtime's public format;
  - development witnesses covering P05 (long silence, direct answer, clinical carrier, hold carrier, clearance, re-send).
- **The diagnostic corpus as regression only:** it may be re-run, but is never fresh evidence. Its original bytes and manifests are preserved.
- **Directed tests and mutants for each fix:** DX01-M1, DX02-M1, F03-M1, F04-M1, each killed by its own witness.
- **Regressions:** the full suite; R7-B, R7-B.1 and R7-B.2 conformance; R7-C invariants; clinical-first; the diagnostic and generated samples; superseded-runtime sensitivity.
- **A narrow SSCTR recheck** of DX-02, F03-B and F04 only, and **a narrow engineering check**.
- **A new runtime freeze,** only if all four blockers are closed, neither check finds a blocker, the suite is green and the regression is acceptable. It never edits R7C-FREEZE-4 and records its predecessor, delta, policy delta, tests, mutation, regressions and both reviews.
- **R7D-PREREG-2 and R7D-HARNESS-2** if needed, before the final holdout exists, never weakening the success criteria. The final author brief is updated with the required coverage.

**Not authorized:**
- the final holdout or final gate;
- using the diagnostic as fresh evidence;
- changing success criteria;
- clearing inherited findings without a causal link to the four;
- KMP or iOS;
- any change to `V1_COACHING_AUTHORITY_READY`;
- push or merge;
- starting another correction automatically.

**Done:**
- `READY_FOR_FINAL_HOLDOUT`, with all four blockers closed and the new freeze created;
- or `CORRECTION_BLOCKED`. Then stop.
