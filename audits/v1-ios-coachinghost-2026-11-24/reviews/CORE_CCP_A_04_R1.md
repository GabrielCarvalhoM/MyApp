# Core review R1 of CCP_A_04_RESOLUTION.md (as received)

Independent reviewer, role Core (owner of the frozen boundary/custody semantics), 2026-11-26. Read-only. Reviewed the design document plus the work-in-progress NativeStore.swift / ErasureFence.swift in the worktree.

---

CORE boundary review of CCP_A_04_RESOLUTION.md (QRE-A-04 erasure fence)

Verdict: APPROVE_WITH_CHANGES. The native design is sound and stays in front A's column. Nothing in the frozen custody, integration, store contract or bundle changes. Two corrections are needed so the eraseAccount answers match the frozen flow in every state.

Basis: I read custody.mjs, store.mjs, integration.mjs, the facade's entry.mjs, NativeStore.swift (now modified in the worktree), the untracked ErasureFence.swift, Ports.swift, contract §6/§7 and CCP-A-04. I ran `node --test CoachingCore/test/v1cib-custody.test.mjs`: 21/21 pass.

**Q1. Is a fence-based tombstone faithful to the store interface? Yes.**
- I grepped the whole core (src, v1-f08, semantics, integration, api) and the bundle. `tombstoneOf` has exactly two callers, both of the form `store.tombstoneOf(subjectOf(actor.athleteId))`:
  - custody.mjs:196 (`open`)
  - custody.mjs:226 (`enroll`)
- integration.mjs:100 only passes the call through. semantics.mjs:43 and v1-f08.mjs:17 use "tombstone" for F08 marker rows, not the store.
- Both callers only test whether the value is truthy, and a truthy value only produces `fail('GONE',…)`. No field of the value is read anywhere in the core; only a test reads it (test:195). So `{"scope":"ACCOUNT"}` without `erasedAt` changes nothing.
- Every other operation reaches the store through `open` (submit, accept, decline, restart, setConsent, the erasures, read) or through `custody.read` (integration.mjs:281, 323, 406-412: profileWrite, carried, presentation, importActivities). The facade always passes `H.actor`, which is the host's own athlete id.
- `acknowledgeRecordLoss` (integration.mjs:398-405) does not consult the tombstone. It goes by the anchor, which the erasure clears, so it answers `NOT_LOST` exactly as in the frozen flow.

**Q2. Does skipping the fence during eraseAccount reproduce the frozen flow?**
- Record present: `ok`, the custody tombstone is written, the integration clears the anchor (integration.mjs:395). Identical.
- INTEGRITY_FAILURE, or a load that throws RECORD_LOST/ROLLED_BACK: `open` catches it as INTEGRITY_FAILURE, eraseAccount goes ahead, and `run` returns `ok` because `r.ok` is true. Identical.
- Custody tombstone already present under the same key: `GONE`. Identical.
- Two states diverge (F1 and F2 below).

**Q3. Does same id on the same install = GONE respect the frozen authority? Yes.**
- custody.mjs:31-33 and :226 ("a new account is a new athlete") mean the tombstone blocks reuse of the athlete id.
- "After a reinstall the same id may enrol again" is consistent with how the core is deployed here. The reference adapters keep the tombstone in the same store as the record (store.mjs:15, 26).
- But the core's model is a server custody ("the server's integrity key ... the app never holds", custody.mjs:~52), where "no resurrection by a device that synchronises old data" survives a device wipe. On device, that guarantee cannot outlive the container. Record this as a deployment limit for G07 and the future account service, not as a property of the fence.

**Q4. Any effect on equivalence or PRODUCTION_BUNDLE_EQUIVALENT? None.**
- The change is Swift-only: `coachinghost.js` and `entry.mjs` are untouched.
- Test mode with the memory store uses the JS `memoryStore`, so the fence is never reached.
- EquivalenceTests.swift:37-54 binds `b.store.tombstoneOf` directly, not through `jsMembers`.
- With fixture keys, `productionKey` is nil, so the key survives. The custody's own tombstone file is found first (NativeStore.swift:186 uses `??`), so the answers are byte-identical.

**Q5. Inside front A's column? Yes.**
- The store adapter, the anchor and the key are A's (contract §7). The frozen store signature (FINAL_RELEASE_FREEZE_V1.json:119) is unchanged, so no §11 change is needed.
- Recommendation for a later Core cycle, not a blocker: let the tombstone subject not depend on the key that sealed the record. Options are a separate long-lived subject key, or `tombstone(athleteId)` with the adapter pseudonymising. The core then would not rely on an adapter invariant.

**Findings**

F1 (MAJOR): a repeat eraseAccount after ERASED answers differently.
- The design says the fence "is not served" during eraseAccount, unconditionally (F3).
- After a completed erasure the key is new, so the custody tombstone is not found. If the fence is also skipped, custody returns `NOT_ENROLLED`. The frozen flow returns `GONE` (custody.mjs:393 via :196).
- Ports.swift:276 treats both alike, but the boundary answer and the outcome it maps to differ.
- Required change: skip the fence only for the call that wrote `REQUESTED` (or one retrying an in-process `REQUESTED`). If the fence is already `ERASED` when the call starts, serve it, so custody answers `GONE` itself.

F2 (MINOR): a never-enrolled id gets fenced.
- Ports.swift:276 (QRE-A-06) purges natively on `NOT_ENROLLED`, so the fence becomes `ERASED`. A later `enroll` of that id then gets `GONE`, where the frozen custody wrote no tombstone and would admit it.
- This fails closed and matches the athlete's request, so it is acceptable.
- Required change: state it in §3 as A's host-level outcome, or mirror custody and drop the fence when no record, anchor or native residue existed. Pin the choice in a test.

F3 (MINOR): the "seals nothing while REQUESTED" rule is missing from the design.
- The design text has only "completion at start" (F4). Without the rule, this sequence is possible: a native key removal fails, then a new id enrols in the same process under the old key, then the next `start` deletes that key and the new record becomes INTEGRITY_FAILURE.
- ErasureFence.swift:13-14 says `perform` seals nothing while a fence is `REQUESTED`.
- Required change: put that rule into §3 F3/F4 and test it.

F4 (MINOR): the fence relies on a pinned-bundle invariant.
- `fenced()` ignores the subject argument (NativeStore.swift:186). That is faithful only because of Q1's invariant and the one-actor host.
- Required change: document that the invariant holds for the pinned AMENDMENT-2 bundle, and re-review on any bundle change. Optionally add a test that scans the bundle and fails if a third `tombstoneOf(` call site appears.

F5 (MINOR, existing behaviour, not introduced here): the integrity key is per install.
- Deleting it on one athlete's erasure invalidates any other athlete's record on the same install.
- Required change: state "one enrolled athlete per install" as a host invariant in §3 F6.

**Q6. Are T1–T9 enough? Mostly. Add:**
- T10: eraseAccount twice. The second call is `GONE` in the same process and after a restart (F1).
- T11: eraseAccount for a never-enrolled id. The answer is `NOT_ENROLLED`, and the later enrol outcome is as documented (F2).
- T12: a native removal fails, the fence stays `REQUESTED`. An enrol of a new id in the same process is refused or deferred, no seal happens, then the next start completes (F3).
- T13: equivalence. The bundle and facade hashes are unchanged, the journeys are byte-identical, and eraseAccount in test mode with fixture keys answers as before.
- T14: the fence skip is reset even if `perform` throws (scoped and deferred).
- T4 addition: `acknowledgeRecordLoss` answers `NOT_LOST`, and `ingestContext` answers `GONE` for B.

T3 is correct as written. With the fence deleted and old bytes restored under the new key, `open` gives INTEGRITY_FAILURE and `enroll` gives CONFLICT_ALREADY_ENROLLED, so the result is never `ok`.
