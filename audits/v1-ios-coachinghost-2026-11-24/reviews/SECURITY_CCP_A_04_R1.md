# Security review R1 of CCP_A_04_RESOLUTION.md (as received)

Independent reviewer, role Security (privacy by design), 2026-11-26. Read-only. Reviewed the design against the frozen core, the authorities and the Swift code at that point.

---

**Verdict: APPROVE_WITH_CHANGES**

I reviewed the design in `CCP_A_04_RESOLUTION.md` against the frozen core, the authorities and the current Swift code. The worktree has in-progress code (`ErasureFence.swift`, an uncommitted `NativeStore.swift` diff). I only glanced at it and did not review it as code.

**Answers to the questions**

1. **Reading:** correct. Non-recovery of the old record rests on deleting it and destroying the key (`verify` fails under any later key). The tombstone only refuses the erased id. It must also cover:
   - the `acknowledgeRecordLoss` path, which skips `open` and the tombstone (F3 below);
   - the host's own pre-writes (F5 in the design);
   - B's deliveries after a restart.
2. **The unkeyed fence:** acceptable, given that the `.lock` already survives with the same tag (`NativeStore.swift:44`) and the id is high-entropy. A separate long-lived key adds a secret that outlives the erasure and buys nothing over a random id. Dropping `erasedAt` is right, but the claim is hollow as written (F5 below).
3. **Ordering:** sound in principle. It has gaps at start-up completion (F1, F2), with B (F2) and in lock scope (F6).
4. **Serving the fence through `tombstoneOf`:** no risk. It only restricts, and the facade's actor is fixed per host (`entry.mjs:92`). `fenced()` must test this host's own tag, never "any fence exists".
5. **Same id after reinstall:** acceptable. Nothing old survives (container gone; `FirstLaunch.swift:26-28` removes the Keychain leftovers). Same id on the same install giving GONE is acceptable only if CCP-A-05 is made binding and complete (F4). The rule as stated is correct but not sufficient.
6. **Ownership:** within front A. It is a native adapter of `store.mjs`, keeps the frozen `GONE` semantics and honours 6.3. It still needs documentation updates (F7). A per-athlete key (F1) is also native, because `keyRef` is opaque, but it departs from obligation 1.5 ("per-install key") and needs Security sign-off.
7. **Tests:** T1–T9 are insufficient; see F8.

**Findings**

**F1. MAJOR: a per-install key conflicts with per-athlete erasure.**
- Evidence: `Keychain.swift:89,114` uses one account, `key.integrity.v1`. NATIVE_OBLIGATIONS_FINAL 1.5 (line 18) says the key is per install. Meanwhile `CoachingHost.swift:6` ("one instance per signed-in athlete") and `NativeStore.swift:43` (one file per athlete) allow several athletes on one install.
- Erasing athlete X deletes the key that seals athlete Y's record, so Y gets `INTEGRITY_FAILURE`. F4 in the design widens this: `start` deletes "the integrity key" for any REQUESTED fence (resolution lines 45-46). F6's claim "same install, new id works at once" holds only if no other record exists.
- Required: either a per-athlete key (account `key.integrity.v1.<tag>`, resolved natively, recorded as a deviation from 1.5), or a single enrolled athlete per install enforced in `start`/`onboard`, with key removal only when no other record exists. Add a test where X and Y are both enrolled, X is erased, and Y still verifies.

**F2. MAJOR: completion at start is incomplete and does not say it fails closed.**
- (a) B's purge is sent only in-process, after the write (`Ports.swift:115,282`, and `try?` swallows a failure). If the process dies after the fence is REQUESTED, B keeps the erased athlete's queue, ledger and `HKQueryAnchor`, so old personal data remains (contract §6 line 224, §7).
  - Required: a third fence state (for example `NATIVE_DONE`) that becomes `ERASED` only after `purge(.accountErased)` returns. `start` re-issues the purge for any fence not `ERASED`, before `deliveryConditionsChanged`.
- (b) The design does not say what happens when completion fails at start (for example, the Keychain delete fails).
  - Required, stated in the design: while any REQUESTED fence remains, the host seals nothing for any athlete. Either `start` throws, or `perform` refuses every operation except reads that return GONE. The in-progress `ErasureFence.swift:13` says this; the design must too.
  - Removals are checked, not `try?`: `Keychain.swift:114` and `NativeStore.swift:200` ignore the status today.

**F3. MINOR: one write path bypasses the tombstone.**
- `integration.mjs:398-405`: `acknowledgeRecordLoss` never calls `open`/`tombstoneOf`.
- Required: `perform` refuses every operation except `eraseAccount` for a fenced athlete, with a GONE in the custody's shape. Add a test.

**F4. MAJOR: CCP-A-05 is not written, and the rule is insufficient.**
- No CCP-A-05 exists in `CONTRACT_CHANGE_PROPOSALS.md`; it is only referenced at resolution line 58.
- `Intake.swift:44` says "A sets it from the authenticated account". That contradicts "left to the integration".
- A stable IdP subject (for example the Sign in with Apple user id) or a server account id reused at re-signup would turn the fence into a lifetime ban on that install. That breaks the Founder's "must not be permanently banned".
- Required: write CCP-A-05 as binding:
  - the athlete id is an opaque random value of at least 128 bits, issued at each account creation;
  - it is never derived from an email, phone, IdP subject or device id;
  - re-creating an account after an erasure always issues a new id;
  - the GONE screen leads to "create a new account".
- Reconcile the `Intake.swift:44` comment with this.

**F5. MINOR: the "no time retained" claim is hollow.**
- `custody.mjs:394` still writes `{scope, erasedAt}` to `tombstone-<sha(hmac(K1,…))>.json` (`NativeStore.swift:45,133`). After the key is destroyed, that file is unfindable dead data that keeps the time, and the fence's mtime also records it.
- Required: remove the orphaned custody tombstone during the native erasure, once the fence is ERASED. Alternatively, have the adapter's `tombstone()` write the fence itself (the adapter serves one athlete). State the mtime residual in the design.

**F6. MINOR: lock scope and fence bypass.**
- The boundary erasure and `eraseFiles` run in separate lock holds (`Ports.swift:273,278`).
- Required:
  - Run the boundary call, the native removals and the fence update under one `withLock` hold.
  - Scope the "fence not served" bypass to that single `perform("eraseAccount")` call, reset it with `defer`, and never apply it when the fence is already `ERASED`.
  - Validate tags read from the directory listing as exactly 32 lowercase hex characters before any file or Keychain removal (`ErasureFence.swift:46-50` does not).

**F7. MINOR: documentation of the authorities.**
- Record that the fence is a new A-owned persistence: add it to the §7 table (A owns it, store folder, cleaned at reinstall).
- Flag it to the G07 row (line 310) as "mechanism within the declared tombstone retention (`custody.mjs:31-33`), pending G07", so it does not read as a silent retention change.
- Record that keeping the `.lock` (QRE-A-07) deviates from the literal 6.3.
- State that each GONE check re-creates a fresh key right after the erasure (`EngineRuntime.swift:112-116`, `Keychain.swift:101-110`). It seals nothing, but T1 must check "key gone" before any further call.

**F8. MINOR: missing tests.**
- X and Y both enrolled; erase X; Y still verifies (F1).
- Kill the process at each step: after REQUESTED, after the boundary call, after each removal, after native completion but before the purge. Then `start` completes and re-issues B's purge (F2a).
- Completion fails at start: nothing is sealed for any id (F2b).
- `acknowledgeRecordLoss` and `eraseHealthFacts` on a fenced athlete give GONE, and no signals or clock file is recreated (`HostSignals.swift:71-84`, `TrustedClock.swift:65-68`).
- An unreadable fence counts as REQUESTED and is never overwritten with a guess.
- Malformed `erased-*` names are ignored.
- A second process with a cached old key cannot enrol a new id under it (in V1, at least assert and document the residual).
- After erasure plus a new id, B does not bring back activities or ledger entries dated before the erasure.
- Erasing an already-ERASED account is idempotent and writes no new time-bearing file.
- T3 and T6 assert the exact codes and that no view or data is returned.
- No athlete id or tag appears in the logs during completion.
