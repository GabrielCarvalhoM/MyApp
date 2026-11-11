# Security review: CoachingCore V1 Final Closure (V1FC)

**Verdict: FAIL**. Gate: SECURITY_BLOCKED. Scope: the V1-scoped synthetic candidate `2d089c0` (base `3b14804`) and its reference custody boundary, nothing else. I am an independent judge and authored none of this work. The JSON record prevails over this summary. I make no legal, regulatory (LGPD) or clinical claim.

There are three blocking findings. Each is narrow and runtime-only, and each has a small fix. They fit the one directed fix cycle, after which this role does one narrow recheck.

**Host context:** the host injected the global `CLAUDE.md`, the project `CLAUDE.md` and `MEMORY.md` (hashes in the JSON). I used them only to orient. They are neither approval nor a finding.

## Method
- I reviewed a `git archive` extract of `2d089c0` in a new scratch folder, with `node_modules` copied from the worktree. `node --test` gave **1243/1243**.
- I wrote my own probe scripts in a separate folder. They use synthetic data only and run custody and the app boundary in memory.
- I ran one differential probe on an extract of `3b14804`.
- I did not run `verify` or any `verify-r*` script. There was no recursive deletion. I did not read the other roles' records for this round.

## The four earlier findings
| id | status | probe |
|---|---|---|
| SEC-V1CIB-01 | **CLOSED** | I created a pending change, then imposed each of these: a hold through a submit, an erasure, revoking coaching consent (also with consent granted again), a restart, retried requests, and a forged pending in storage. Every `accept` returned `NOT_PENDING` or `INTEGRITY_FAILURE`, and the program did not change. No pending change is created while a hold stands. |
| SEC-V1CIB-02 | **CLOSED** | A restart without coaching consent returns `CONSENT_REQUIRED`. A restart under a hold, or over a clinical break, returns `CLINICAL_HUMAN_REQUIRED`. |
| SEC-V1CIB-03 | **CLOSED** | `learningConsent` and the other server-owned fields sent in the intake are not taken. A future screening date is asked about. `SYNTHETIC_ONLY` holds. Residual: the intake `version` field is still open (see SEC-V1FC-02). |
| SEC-V1CIB-04 | **CLOSED** | No unkeyed digest, `rowHash` or `inputHash` of an erased row remains anywhere in storage. Chain and request digests are keyed, so a custody with another key fails to verify. Residual: PCG B-C1 is only partly met (see SEC-V1FC-04 and -05). |

## New findings
| id | sev | blocks freeze | reproduction (probe) | smallest fix |
|---|---|---|---|---|
| **SEC-V1FC-01** | HIGH | **YES** | p9c: hold → erasure → in storage, null the marker row and set `chain[m].erased=true` without the key. The record still reads OK, the view is `VALID_PLAN` with executable sessions, and a later change is adopted. The `erased` flag and the `of` pointer sit outside every MAC. On `3b14804` the same tamper also verifies, but the cached reference kept the view blocked; this candidate clears that reference on erasure. | Add `of` to the `link()` MAC. Add the erased seqs to the sealed envelope. Bump the schema to `-3`. Add both tamper tests. |
| **SEC-V1FC-02** | MEDIUM | **YES** | p1b/p1c: send an intake with `version:'R5-INPUT-1'` to the V1 entry. It produces a legacy program that ignores the V1 scope and the restart facts. Custody stores it, and from then on every read is `INTEGRITY_FAILURE`, permanently: re-enrolling is refused and only account erasure recovers. | `v1-index`: refuse any input that is not `R6-INTAKE-1` and any program that is not `R6-PROGRAM-1`. Custody: commit only when `validProgram` holds. |
| **SEC-V1FC-03** | MEDIUM | **YES** | p7: `targetSessionId` is not bound to anything. Naming a quality session from week 6 as missed in week 4 produces a MOVE offer that copies it into week 4, and `accept` adopts it. A long run not yet due is moved earlier. A target that differs from the reported session still gets a MOVE. A past-week target gives `ENGINE_CONTRACT_VIOLATION`, which the app shows as an integrity failure. Another athlete is never affected. SSCTR should rule on the sporting effect. | For `MISSED_SESSION`, accept a target only if it is the same review's missed observation, in the current week, and dated on or before today. Otherwise drop it or refuse it. |
| SEC-V1FC-04 | MEDIUM | no (before real data) | p4b: after erasure, the stored program still holds `readinessRecord.cause: CLINICAL`, the hold's kind and time, the stop dates, the per-sport readiness answers, and the `SPORT_HELD` and `RETURN_HOLD` adaptations, all in plain text. | Redact the program's entries for the erased events to their planning shape, then re-hash and re-seal. Until then, list this residue in §9. |
| SEC-V1FC-05 | LOW | no | p5(a): erasing a logged "not 100%" ASK report keeps `reference.pending` (`NOT_FEELING_100` plus the sign name), and the view keeps asking the question. | In the logged-only path, set `reference:null` as the fact path does. |
| SEC-V1FC-06 | LOW | no | p5(b,c): any event id named alongside a health event scrubs that review's decision entry and its idempotency entry. | Scrub only erased F08 rows and logged F08-kind entries. |
| SEC-V1FC-07 | LOW | no | p2 A8: after LEARNING consent is revoked, a pending LEARNED_REARRANGEMENT is still adopted. | Revoking LEARNING closes that pending change, and `accept` refuses it. |
| SEC-V1FC-08 | LOW | no | `unavailable`, `pending`, `offer` and `agency` are not classed in the inventory. `HOLD_ON_RECORD`, a word on the canary list, would reach telemetry `code` (the path is currently unreachable). | Add the inventory rows. Give that refusal a neutral code. |

## Verified, no finding
- **V1 gate:** I swept 24 review kinds (including aliases, case variants and prototype names) with wellbeing payloads. None opened a temporary reduction, and no state was REDUCED.
- **Holds:** under a hold, every kind and payload I sent left the view BLOCKED. Only the readiness declaration releases a hold, and it requires HEALTH_SIGNALS consent.
- **Event extension:** with no SSCTR record file, nothing is enabled. A marathon is UNSUPPORTED and a 5K keeps its fallback, even with extension authority values smuggled into the intake.
- **Offer path:** the decline memory is under the seal. A declined pattern is not offered again. `PENDING_EXPIRED` closes the change with its cause recorded.
- **Regression on the touched paths:** tampering with agency, pending, decisions, requests, consents, schema or reference, and truncation or reordering, all give `INTEGRITY_FAILURE` on read and on write. Idempotency, version conflicts, server-owned and unknown fields (no echo), the cross-athlete check, the tombstone and consents all hold. CF-OBS-1 holds at the engine layer for 7 kinds sent with no reference.
- **Telemetry and push:** across a journey through every new path, no health-derived word reached the logs, and push text stayed neutral.

## §7 of the integration contract
§7's PENDING list is no longer complete. Its guarantee that "a removed row → INTEGRITY_FAILURE" is contradicted by SEC-V1FC-01. Add these:
- pinning the authority files read from disk, now including the event-records file, whose mere presence enables events;
- request size limits (each offer runs the engine twice);
- erasure of the health-derived content kept in the program, and erasure reaching backups;
- what happens to the learning model when LEARNING consent is revoked;
- separate keys per purpose under KMS.

## The four distinctions
1. **Synthetic candidate:** FAIL. SEC-V1FC-01, -02 and -03 block the freeze. One fix cycle plus a narrow recheck closes them.
2. **Integration boundary:** NOT_READY. It needs those three fixes, the §7 operational parts and the additions above.
3. **Before real data:** every finding resolved; the operational parts built (authentication, KMS, a production database with access control and encryption at rest, an external version counter, backups that honour erasure, monitoring, rate and size limits); authority files pinned; G07 (owner: Founder with legal counsel, not ruled on here); the SEC-V1CP pending items; F08/G04 wording.
4. **Real athletes:** **NO**. Everything in (3), plus human and clinical revalidation. CLINICAL_HUMAN_REQUIRED stands.

## Not done
I edited no code, test, canon, mission, ledger or freeze, and committed or pushed nothing. The worktree's untracked `CoachingCore/scripts/v1fc-freeze.mjs` belongs to another author and was left untouched. I wrote only this file and its JSON.
