# PCG-V1CPFF-CFOBS1-r1: who holds a clinical hold (CF-OBS-1)

**Status:** GOVERNANCE_READY_FOR_REVIEW. This is a reading of decided sources. It changes no doctrine, adds no DR and edits no canon. The Chief consolidates it with the Security and QRE answers. The JSON record prevails over this summary.
**Inputs:** worktree at `0950b0a`, the reverted scratch patch and its suite run (28 failures), the sources listed in the JSON with their blob ids.

## The gap
Every clinical decision writes a `CLINICAL_HOLD` row to the record. But reviews other than the readiness declaration and the new plan keep the clinical route only through `referenceState.pending`. A client that omits the reference state, or sends an invalid one, gets training planned over an unreleased hold.

## Answers
- **Q1. Source of truth:** the record. The reference state is a cache: it can add protection, never remove it. When the two disagree, the record governs. Sources: DR-148 (4) and (7); AEC §7 "Sem liberação por silêncio"; integration contract §3.
- **Q2. Standing hold:** the hold stands when a readable `CLINICAL_HOLD` row for this athlete has no later valid `READINESS_DECLARED` row for that sport. Release is per sport. Unreadable rows never count as "no hold". Nothing else releases a hold: time, training, an eligibility re-answer, RECOVERED, a "not 100%" report, a break, a correction, an omitted reference state, or a relayed professional clearance. Sources: DR-148 (3)–(6) and its Protections; P-2-r2; the G04 row.
- **Q3. Absent, invalid or stale reference state:** the outcome is never less protective than with the intact state. Every review kind except the readiness declaration returns the clinical route and prescribes nothing. Facts are still recorded. A break is recorded but never releases. Signs still set the D5 guidance level. A stale state may not trap someone whose release is already on the record.
- **Q4. Legitimate resumption:** only the readiness declaration, read from the record, releases a hold. It opens a conservative restart, sport by sport. "The next review without the reference state" is never a release or a clearance. Under the authorities that is release by silence, and nothing can verify it. The R7 "qualified clearance" convention was only ever an evaluation device (PCG-F08-C07, I-F08-2), and consumers were already told never to drop the clinical state (C06). The recorded form it needs is the readiness declaration, not a clearance form (DR-148 (1); P-1). The 28 tests get re-expressed on that basis, as marked updates accepted by SSCTR and QRE. R7 records stay untouched.
- **Q5. Contract:** on every real path, a hold on the record is enforced on every review until a valid declaration releases it. Two layers are needed, because a pure core cannot see a deleted row:
  - the core reads holds from the record;
  - RECORD-CUSTODY keeps the record whole.
  Making the reference state mandatory covers only the absent case. The integration-contract text goes in a new §11, proposed in the JSON. Owner: the Chief with Engineering; Security and QRE judge. RECORD-CUSTODY is owned by Engineering, re-verified by Security, with G07. No DR delta is required; an optional pointer for DR-148 is proposed.
- **Q6. Tests:**
  - absence and alteration never prescribe, and the absent case is never more permissive than the present one;
  - a valid declaration still releases, per sport and conservatively;
  - nothing else releases;
  - clinical first still applies during a hold;
  - the re-expressed R7 tests keep their invariants.
  QRE owns the mechanics.
- **Q7. Closure:** yes, the shadow candidate can close with CF-OBS-1 named as a BLOCKING integration blocker. It blocks INTEGRATION_READY, real-athlete use, publication readiness, F08 closure and V1 authority. The hold path counts as technically validated only "with the reference state sent as returned".

## Findings
- **F01** (runtime): DOWNSTREAM_VIOLATION.
- **F02** (integration contract §1): its omission sentence presents losing a clinical hold as acceptable.
- **F03** (the "recorded clearance form" wording): resolved here as the readiness declaration.
- **F04** (the R7 convention in the current tests): latent drift.

## Founder
No question for the Founder: DR-148 (1), (3) and (4) already decide this. For visibility: once this is fixed, an athlete cleared by a professional outside the app resumes through the in-app readiness declaration.
