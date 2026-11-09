# SEC_FF_RECHECK r1: Security, Privacy and Abuse review of the V1CP Fix-Forward candidate

**Judge:** Security, Privacy & Abuse Architect. This is an independent instance: it did not write the candidate, the SSCTR FF decision, SEC_V1CP_IMPL or SEC_V1CP_RECHECK. Model claude-opus-5-5, effort high, L3.
**Reviewed:** `4630bca` on `claude/v1cp-fix-forward`. The CoachingCore tree equals the commit. The baseline for regressions is `5ee9dec`.
**Scope:** the offline core boundary only. This repository has no server, client, logging, analytics or share surface, so none of them was verified.
**Machine record:** `SEC_FF_RECHECK.json` holds the hashes, the evidence and the conditions.

## Verdict: PASS_WITH_CONDITIONS (SECURITY_READY_WITH_CONDITIONS)

I tested the candidate's claims with my own probes and did not take them on trust. Every finding behind SB-1..SB-5 is closed at its cause. SEC-V1CPR-05 and -06 are closed, and so are OBS-R1 and OBS-R2. Rows stay append-only and sealed. LEX-3 text never lowers an outcome. The derived guidance level adds no collected field and never becomes a field of a record row or the reference state. No finding blocks this offline candidate. One new privacy regression (SEC-FFR-01) and the CF-OBS-1 gap both bind before any integration. A safety-relevant gap is routed to SSCTR and QRE (SEC-FFR-02).

| State | Value |
|---|---|
| Implementation done | YES (fix-forward scope, 4630bca) |
| Technical validation (security, offline core) | passed with conditions C1–C7 |
| Integration readiness | NO |
| Authorization for real athletes | NO (no real collection authorized) |
| App publication readiness | NO |
| F08 / V1 coaching authority | F08_OPEN / V1_COACHING_AUTHORITY_READY = NO |

I make no legal, regulatory or clinical compliance claim.

## Runs
- Full suite on a scratch copy (`V1CP_ROOT` unset): 1133 tests, of which 1132 passed. The single failure came from two read-only audit inputs that `v1cp-block1.test.mjs` needs and the scratch copy lacked. After I copied them from `4630bca`, that file passed 10/10, so the effective result is 1133/1133.
- Directed tests (`v1cp-ff`, `v1cp-ff-guard`): 53/53.
- Probes p1–p6 ran against the candidate and against `5ee9dec`, under the scratchpad folder `sec-ff-20261109-a7k3`. All data is synthetic.

## Prior findings

| Finding | Ruling | Evidence (one line) |
|---|---|---|
| SEC-V1CPI-02 residual (SB-1) | CLOSED | Declaration, then trained weeks, then a new stop with no stated cause now gives ASK `athlete.pause.reasonCategory` at 1, 4 and 6 weeks. At 5ee9dec the same input gave PROPOSED with READINESS_DECLARED. A declaration with no training after it still stands in for its own stop. |
| SEC-V1CPR-03 (SB-2) | CLOSED | A reused id with a yes on X1, W5, W2 or W3 (weekly review, check, report or readiness) gives CLINICAL with URGENT_CARE_ADVISED and writes one new hold. A restart from the record then blocks. An all-no payload under a reused id is still asked for its id, and an identical replay is a KEEP. |
| SEC-V1CPR-01 (SB-3) | CLOSED | Altered, foreign, numeric-id, unsealed and orphan rows give HOLD `record.f08Unreadable` with counts only, on both the review and the restart path. A restart that names another athlete, or is dated before the hold, also gives HOLD. The clinical flag is still read first. |
| SEC-V1CPR-02 (SB-4) | CLOSED | Non-string or empty ids give HOLD. A planted foreign hold, a reused id after a release and a stale clinical reference all still write a hold. All 18 clinical decisions I produced return a readable, unreleased CLINICAL_HOLD. Case (e), a malformed ledger, is a residual left under custody (C7). |
| SEC-V1CPR-04 (SB-5) | CLOSED | A restart with no stated pause asks for the reason at 1, 3, 10 and 45 days; at 5ee9dec it threw a TypeError. Null or malformed inputs give a status, never an exception, and the error names only its class. |
| SEC-V1CPR-05 | CLOSED | Excluded breaks are now matched by `readBreakIds` (event ids). The list is covered by the program hash: tampering with it gives HOLD. |
| SEC-V1CPR-06 | CLOSED | The CLINICAL_HOLD row is reduced to who, when and the event id. An early "not improved" answer is no longer kept: improved is null and improvedBy is absent. The inputHash residual is SEC-FFR-04. |
| SEC-V1CPI-09 residual | CLOSED | A named hold must match every key it gives, and an empty name `{}` is refused. |
| OBS-R1 | CLOSED | "tore my acl skiing", "rompi o lca", "me rompí el menisco" (TRAVEL, clinicalReason no) now give CLINICAL. |
| OBS-R2 | CLOSED | The same condition reported again after "improved" gives CLINICAL, recorded as RECURRENCE with `of`. A restart then blocks. The sporting rule itself is SSCTR's. |
| SEC-V1CPI-06 (named blocker) | OPEN, unchanged | Deleting the hold row still gives PROPOSED. The terms from SEC_V1CP_RECHECK still apply, extended by C6. |

## New and changed outputs
- **guidance (C-FF9-2):** derived only from the items answered yes. Each of W1–W15 gives the expected level, and persistence routes and flags give PROFESSIONAL_ASSESSMENT. All 18 clinical routes carry a guidance level. It never appears in a record row or as a field of the reference state. It can be reconstructed, though, from `referenceState.pending.reason` (which holds the sign names and the urgent wording) and from `signsYes`. Both count as health data under C4.
- **Race row and RACE_PATHS:** neither collects anything new. The paths reuse existing routes, and the default needs no answer. The program now carries health-derived text and markers ("while you are unwell", `unwell`, rungs), which is SEC-FFR-03 / C4.
- **NEED_REST_ROUTE and WELLBEING_CHECK offers:** they hold fixed text, sports and event ids only.
- **takenFrom, chainFrom, carried, rungs, supersedes, persistence, kinds, improvedBy `CONDITION@eventId`:** all values are closed vocabulary, dates or ids, and keys are validated before they are kept. Cross-row copies and ids fall under C6 and C7.
- **LEX-3:** I ran 441 combinations, including a 50,000-character note. No text lowered an outcome and none crashed. Self-attributed clinical text plus an exclusion stays CLINICAL. UNCERTAIN is still asked when clinicalReason is no. `matched` holds lexicon words only.

## New findings
- **SEC-FFR-01 (LOW, NON_BLOCKING, new in this candidate).** `readCheck` echoes an unknown `improved` key, free text included, into `missingInputs`, the reason and the stored `referenceState.pending`. For example, `improved: {NEED_REST: true, "<2,000-character note>": true}` produced a 52 KB output; 5ee9dec did not echo. *Smallest fix:* report such keys as `wellbeingCheck.improved.unrecognized` with a count only, plus a canary test. → C1
- **SEC-FFR-02 (safety-relevant, NON_BLOCKING for this gate; routed to SSCTR/QRE).** Scenario: a W7 hold is open and the reference state is sent. A later report with W2 yes gets the generic guard: PROFESSIONAL_ASSESSMENT, "A prior clinical dependency remains...", and no row records W2. The same review without the reference state gets URGENT_CARE_ADVISED. The hold stands and no training is planned, but the urgent level and the record of the sign are lost. *Smallest fix:* read `signsYesIn` of the payload before the CLINICAL guard, as SB-2 does. → C3. The Chief should decide whether the "relevant sign ignored" escalation applies in this narrow form.
- **SEC-FFR-03 (LOW, condition).** Health-derived state now sits in the program and the reference state, outside the F08 record. → C4
- **SEC-FFR-04 (LOW, pre-existing).** `inputHash` is an unsalted digest of a small closed payload, so the dropped "improved false" answer can be recovered by enumeration. → C5
- **SEC-FFR-05 (LOW, pre-existing hardening).** A record sent as a non-array is read on restart as if there were no record. → C7

## CF-OBS-1
**NON_BLOCKING for this offline candidate. It is a condition before any integration (C2) and is not acceptable as the protocol's contract alone.** With a hold on record and no reference state, a weekly review gives KEEP with 30 live sessions ahead, and a MISSED_SESSION or SYSTEMIC_FATIGUE review gives MODIFY. The returned reference state is clean. The record still holds the hold for a restart or a readiness declaration. An identical replay of a W2 check without the reference state also gives KEEP; this already happened at 5ee9dec. The core trusts the record hold for restarts but not for reviews, so any future integrator that drops the reference state fails open silently. The narrow core fix is therefore preferred over relying on custody alone.

## Conditions
1. **C1:** fix SEC-FFR-01, with a canary test. Before any integration; it fits the single narrow cycle.
2. **C2:** CF-OBS-1. Either an unreleased record hold keeps the clinical route on every review kind except the readiness declaration and a declared break, or `referenceState` becomes mandatory when F08 facts exist and the server refuses reviews sent without it, with negative tests. RECORD-CUSTODY applies either way. Before any integration.
3. **C3:** SEC-FFR-02. SSCTR rules on the urgent level during a standing clinical reference; if the ruling is yes, apply the narrow fix. Before any real use of the D5 wording.
4. **C4:** add guidance, the pending reason, the race fields and explanation, the WELLBEING_REDUCTION markers, RACE_IN_RETURN and `decision.wellbeing` to the inventory, and keep them out of logs, analytics, crash reports, push/OS surfaces, shares and exports (Growth Layer included). Before exposure.
5. **C5:** treat `inputHash` and `rowHash` as the payload itself, or key them under custody. Before exposure.
6. **C6:** extend the tombstone design to cross-row references: `carried`, `takenFrom`, `chainFrom`, `supersedes(All)`, `of`, `kinds`, and `improvedBy` keys. The named blocker's terms are unchanged.
7. **C7:** RECORD-CUSTODY and the server schema. Event ids must be opaque, server-assigned and bounded. A non-array record or ledger gives HOLD. The server binds the athlete id and the restart's clock. Before any integration.

All earlier SEC-V1CP pendings stay pending. Nothing in the repository was edited except this record and its JSON. Nothing was committed, pushed or frozen.
