# Security recheck of the fix cycle `0950b0a` (2026-11-09)

The JSON record `SEC_FF_RECHECK_CYCLE.json` prevails over this summary.

**Verdict: PASS_WITH_CONDITIONS** (SECURITY_READY_WITH_CONDITIONS). The scope is the offline shadow core at `0950b0a` only. There are no blocking findings.

## How it was checked
- Both commits were extracted with `git archive`, `0950b0a` and `4630bca`, into a new scratch folder (`sec-ffc2-1794246484`).
- Full suite: 1143/1143. The first run failed only because `ajv` was missing from the archive; I copied the locked version and ran it again.
- I re-ran the round-1 probes p1–p6 on both commits and wrote five new probes, p7–p11. All data is synthetic.

## Items
- **SEC-FFR-01 (C1): CLOSED.**
  - Tested 9 shapes on 2 review kinds:
    - a 2,000-character key;
    - 300 keys with text;
    - nested objects;
    - an open key with a string, object or array value;
    - `__proto__` and `constructor` keys.
  - In every case `missingInputs` holds one `wellbeingCheck.improved.unrecognized` (or the open key name). The text never reaches the decision, the reference state or the record. Nothing throws.
- **SEC-FFR-02 (C3): CLOSED for the level and wording.**
  - Setup: a W7 hold is open and the reference state is sent.
  - These all get urgent care: W2, W3, W5 at a check, X1 at the weekly review, W4 carried by a missed-session report, and W3 at a readiness declaration.
  - Same status, level and reason as without the reference, for the "not 100%" and readiness cases.
  - The pending hold is unchanged and nothing is planned. The next review and a restart from the record stay clinical.
  - **Residual:** a sign answered during a standing hold is not recorded anywhere, only shown in the decision. I classify this as non-blocking and carry it as new condition **C8**, because:
    - the hold stands;
    - the only release, the readiness declaration, asks every warning sign again;
    - what is lost is accountability;
    - recording the sign is new health data, so its form is a joint decision.

## Regressions on the touched paths
None. Specifically:
- no new echo and no new collected field;
- rows stay append-only and sealed;
- unreadable holds still fail closed (SB-3);
- clinical comes first before an id conflict (SB-2);
- every hold is still recorded (SB-4);
- malformed input never throws (SB-5);
- guidance never appears in a row or in the reference state.

Two non-blocking observations, both pre-existing and identical on `4630bca`:
- **OBS-FFC-01:** a clinical decision through the guard returns no `actualLedger` field. The integration must read an absent field as "record unchanged" (added to C7).
- **OBS-FFC-02:** a sign answered in a payload the review does not read is ignored, and with a refused reference it gets HOLD with no guidance. Routed to SSCTR and QRE.

## Conditions
- **C1:** closed.
- **C2 (CF-OBS-1):** open, unchanged in code. Making `referenceState` mandatory is not enough on its own:
  - its digest is keyless, so a client can re-seal a clean reference and plans 30 live sessions over the hold (p11);
  - a stale reference behaves exactly like a missing one (p10).
- **C3:** closed (the wording stays interim pending G04).
- **C4:** open; now also covers `decision.warningSigns`.
- **C5:** open, unchanged.
- **C6:** open, unchanged.
- **C7:** open; now also covers OBS-FFC-01.
- **C8:** new (see SEC-FFR-02 above).
- **SEC-V1CPI-06:** open, unchanged (deleting the hold row still gives PROPOSED). It remains a named blocker of real collection and erasure.
- **SEC-V1CP pendings:** unchanged. None of these blocks closing this shadow candidate; they bind integration, real collection or exposure.

## CF-OBS-1 answers
- **Q1. What is the source of truth for a hold?** The record's readable `CLINICAL_HOLD` row, held under server custody. The reference state is a cache: it can add a restriction but can never show that no hold stands.
- **Q2. When does a hold stand?** One shared predicate, computed from the record on every call: a readable hold row exists with no later valid `READINESS_DECLARED` that answers it. An unreadable row means HOLD.
- **Q3. What if the reference is invalid, absent or stale?**
  - Invalid: HOLD.
  - Absent or stale while a hold stands:
    - a readiness declaration goes through its own handler;
    - breaks and "not 100%" reports or checks are screened and recorded, but never release the hold;
    - every other kind returns CLINICAL_HUMAN_REQUIRED with no proposal.
- **Q4. What releases a hold?** Only a recorded release fact: the athlete's valid readiness declaration, or a future explicit and attributable fact defined by the competent authority. "The next review sent without the reference" is never a release or a clearance. The 28 R7-era tests that model clearance that way must be migrated when the rule is fixed.
- **Q5. What does the integration need?**
  - The server holds the record and the reference, refuses stale heads, accepts only prefix-extending records, and delivers no prescription while a hold stands.
  - Release goes only through the declaration endpoint.
  - The client never builds, edits, re-seals or drops this state.
- **Q6. How should this be tested?**
  - a negative matrix of review kind × reference variant × record variant;
  - a monotonicity property and a mutation that drops the record check;
  - release parity with and without the reference;
  - server-level refusals.
- **Q7. Can this shadow candidate close?** **Yes**, closed separately, with CF-OBS-1 named as a blocker of integration readiness, real use and V1 authority. INTEGRATION_READY and V1_COACHING_AUTHORITY_READY stay NO while it is open.

## States
| State | Status |
|---|---|
| Implementation | done |
| Technical validation, security part (offline) | passed with conditions |
| Integration readiness | NO |
| Real athletes | NO |
| Publication | NO |
| F08 | F08_OPEN |
| V1_COACHING_AUTHORITY_READY | NO |

No legal, regulatory or clinical claim is made.
