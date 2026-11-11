# Security review — V1 Coaching Integration Boundary (V1CIB)

**Verdict: PASS_WITH_CONDITIONS** · gate SECURITY_READY_WITH_CONDITIONS · scope: the offline **synthetic shadow** boundary at `3b14804` only. Fresh independent judge; authored none of this work. The JSON record prevails. No legal, regulatory (LGPD) or clinical claim is made.

Host context: the global `CLAUDE.md` and the Vilumo `MEMORY.md` were injected by the host; used only to orient, taken as neither approval nor a finding.

## What was verified (synthetic probes + full suite 1211/1211)

- **C2 / CF-OBS-1, both layers.** Core: the record's standing hold keeps every review kind but the readiness declaration clinical whatever reference is sent — absent, stale, client-re-sealed clean, or altered (88 core cases + all 17 app operations, **no** prescription over the hold; where the base `0950b0a` planned over it, the candidate is now clinical: probes p4/p8/p10/p11). Custody: composes the engine input from its stored copies, refuses every server-owned field and an explicit null reference, and suppresses any prescription while the record holds (defence in depth); the program hash is unchanged and the view is BLOCKED.
- **C7 / C5.** Keyed HMAC row chain and document seal (a foreign-key re-mac fails; the keyless `rowHash`/`inputHash`/reference digest are payload, never proof); opaque server-assigned ids stable on retry; athlete binding (`FORBIDDEN`/`UNAUTHENTICATED`); server clock (future screen refused, instant normalized, `declaredAt` a server UTC instant); closed payload (unknown fields refused **without echo**); 8 tamper/reorder/truncation variants → `INTEGRITY_FAILURE` on read and write; reconciliation keeps the stored record (drop/change/duplicate → `ENGINE_CONTRACT_VIOLATION`; absent ledger = unchanged); idempotency (cap 500, same-key-different-request conflict), version conflict, file-store lock → `BUSY`; the whole-document rollback residual verifies (external monotonic version PENDING).
- **C4.** No health or health-derived word in any log, telemetry or push across a full journey (reports, reduction, hold, warning sign, erasure, declaration); a hold reads as a plain change class; inventory classes every field, HEALTH/HEALTH_DERIVED egress NONE; history summarises F08 by type.
- **C6 / SEC-V1CPI-06.** Erasure cascades over cross-row references; the chain verifies with erased slots; one `ERASED_F08` marker the core reads as a standing hold until a later readiness declaration (the legitimate way back); the account tombstone is pseudonymous, checked **before** load, and refuses resurrection by a re-synced device. **This is the tombstone design required in round 1.**
- **C8.** A durable minimised trace is now kept (closed sign names + guidance level + event id + time); the engine `reason` prose is health-derived and egress NONE (canary clean). **Closes the prior C8 residual.**
- **Consents** (COACHING / HEALTH_SIGNALS / LEARNING) and **SYNTHETIC_ONLY** enforced; real data refused at onboarding and restart.
- **No regression** on C1, C3/SEC-FFR-02, SB-2..SB-5 on the touched paths; the 28 migrated tests assert "dropping the reference never releases; only the readiness declaration does" (negative twins), closing the F04 drift.

## Findings (all new, narrow, runtime-only)

| id | sev | blocking | one line |
|---|---|---|---|
| **SEC-V1CIB-01** | MEDIUM | **integration YES**, candidate no | After an erasure leaves a pending change, `accept` installs it over the standing hold (`eraseHealthFacts` doesn't clear `doc.pending`; `accept`/`decline` don't re-check the hold). Bounded: `planView` still suppresses, so **no prescription leaks** — what leaks is a program-state mutation. |
| SEC-V1CIB-02 | MEDIUM | real-data YES | `custody.restart` makes and stores a plan after COACHING consent is revoked (enroll/submit gate it; restart doesn't). Bounded: later reviews still refuse. |
| SEC-V1CIB-03 | LOW | real-data YES | `custody.restart` lets the app assert `learningConsent:true` into the new program though the LEARNING consent is false. Bounded: review time re-derives from custody (off). |
| SEC-V1CIB-04 | LOW-MED | C6 before real data | The erased slot keeps a **keyless** digest of the health row while the marker keeps the event id — a brute-force oracle over bounded-entropy content for an operator with storage access. The chain mac is already keyed; a keyed digest would verify without the oracle. |

Fix family: all four are in `custody.mjs`. Eligible for **one** narrow fix cycle + one narrow Security recheck; otherwise they close as named conditions.

## The four distinctions

1. **Synthetic candidate security:** PASS_WITH_CONDITIONS (SEC-V1CIB-01 bounded by view suppression).
2. **Integration-boundary security:** NOT_READY — SEC-V1CIB-01 (adopt-path defence-in-depth hole) + the §7 operational PENDING parts.
3. **Before real data:** SEC-V1CIB-01..04 resolved; §7 operational parts built; at-rest encryption/access control; erasure→backups; G07 (legal basis, texts, periods); SEC-V1CP pendings; F08/G04 wording.
4. **Real athletes:** **NO** — all of (3) plus human/clinical revalidation. No AI clearance; CLINICAL_HUMAN_REQUIRED stands.

## States
RUNTIME_CORRECTNESS (security part) pass-with-conditions · F08_STATUS F08_OPEN · RECORD_CUSTODY_STATUS IMPLEMENTED_WITH_CONDITIONS · INTEGRATION_READY **NO** · V1_COACHING_AUTHORITY_READY **NO** · authorization for real athletes **NO**.

## Not done
No code/test/canon/mission/ledger/freeze edited; nothing committed or pushed; no `verify`/`verify-r*`; no recursive deletion; this round's SSCTR/QRE/PCG records not read. Only this record and its JSON written. Review ran on synthetic data in new scratch folders.
