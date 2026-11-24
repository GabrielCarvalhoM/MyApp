# V1 native obligations after the physical validation (successor of `audits/v1-blocker-closure-2026-11-24/NATIVE_OBLIGATIONS.md`)

**Numbering:** same as the predecessor.

**Status:**
- **HARNESS_PROVEN**: proven on iPhone 17 Pro Max / iOS 27.2.1 by the harness (`NativeCustody.swift`, `BoundaryTests.swift`), so the contract is achievable. **The app must still implement it and prove it again in its own code.**
- **APP**: not provable without the app (HealthKit, UI, backend); verified in the implementation mission.
- **FOUNDER / LEGAL**: a decision.

**When:** P = the app's integration stage; R = before real athletes; S = before App Store submission.

| # | Obligation | Status | When |
|---|---|---|---|
| 1.1 | One file per athlete, `tmp + fsync + rename`, success only after the rename | HARNESS_PROVEN: death after the rename gives `replayed`; death before it gives the earlier record, then a new record | P |
| 1.2 | `completeUntilFirstUserAuthentication` | HARNESS_PROVEN: read **and** write while locked | P |
| 1.3 | One writer: lock + compare-and-swap; leftovers removed at start | HARNESS_PROVEN in one process: 200/200. App extensions and background delivery need the same lock across processes | P |
| 1.4 | Keychain anchor `{version, docMac}`; `RECORD_LOST`/`RECORD_ROLLED_BACK` screens; `acknowledgeRecordLoss` only from them | HARNESS_PROVEN (anchor across processes; the final journeys over the native store give `RECORD_ROLLED_BACK`, `RECORD_LOST`, `INTEGRITY_FAILURE`) | P |
| 1.5 | Per-install key in the Keychain (`…AfterFirstUnlockThisDeviceOnly`); never in the UI or logs | HARNESS_PROVEN: class `cku`, readable while locked. **New, physically confirmed:** Keychain items **survive app deletion**, the file does not, so a reinstall reads `RECORD_LOST`. The app reconciles on first launch (handoff §6.1); the key is per install only if the app clears it there | P |
| 1.6 | A failed write confirms nothing | HARNESS_PROVEN with a simulated `ENOSPC` (`PERSISTENCE_FAILURE`, record unchanged). A physically full disk was not tested | P |
| 1.7 | Backup (D2) | FOUNDER | S |
| 2.1 | Host `hmacSHA256` / `constantTimeEqual` / `Buffer.from` | HARNESS_PROVEN: CryptoKit equal to Node (40/40 vectors; every boundary seal) | done |
| 2.2 | The app bundle carries exactly the frozen modules | APP: build the app facade; acceptance rules in handoff §2 | P |
| 2.3 | The boundary in the bundle | done in the validated bundle (48 modules) | done |
| 2.4 | Minimum iOS (D3) | FOUNDER (bundle floor iOS 16; validated on 27.2.1) | S |
| 3.1–3.5 | Channels, authorship, `BEFORE_RECORD_START`, no payload in logs | APP | P / R (3.5) |
| 4.1–4.6 | HealthKit queue rules | APP (no HealthKit path in the harness: **not validated**) | P / R |
| 5.1 | Trusted clock, 300 s, with Security's wording (handoff §8: a server reference only if the project runs a server; otherwise the record's `lastAt` plus monotonic time since, in the same boot session) | APP + backend. Measured: the engine's observation tolerance holds at 299/301 s; the boundary accepts an operation clock a day ahead, so the native bound is required | R |
| 6.1 | `eraseHealthFacts` erases facts, readings, requests and screen; an erased hold keeps BLOCKED until a valid readiness declaration | done in the engine and boundary (journey `final-g07-erasure`, SEC-BC-R2-01 closed) | done |
| 6.2 | Stop-fact safety retention after erasure | FOUNDER + LEGAL: the safety need is shown; the legal basis to retain after an erasure request is **not** presumed | R |
| 6.3 | Account erasure removes the file, `.tmp`/`.lock`, the anchor and the key | HARNESS: `NativeFileStore.eraseFiles`, `Keychain.delete`; the app must call them on `eraseAccount` and remove backups (D2) | P |
| 7.1–7.7 | App behaviour (warning-sign screen, drafts, `submit` for stops, views honouring expiry, contest a device workout, R7-B0 expiry warning, request ids) | APP. 7.6: the records expire **2027-04-30** | P / R / S |
| 8 | Real synced week, background delivery with the app closed | APP | R |
| new N-3 | SEC-FPV-01: after any `eraseHealthFacts`, no session is startable until the athlete answers a new screen; alternatively a content-free "screen required" boundary state (a reviewed boundary change) | R |
| new N-4 | SEC-FPV-02: production key = a random 256-bit key created by the host; an opaque allowlisted label as `keyRef`; atomic Keychain writes; never logged; never a fixture key | R |
| new N-5 | SEC-FPV-03: a kernel-released lock (`flock`/`fcntl`) across processes (app, extensions, background delivery) with a two-process test; an anchor update that never deletes before adding (`SecItemUpdate`) | R |
| new N-1 | Schema tests for SEC-INT-05 rest / SEC-INT-12 (handoff §5) | APP + Engineering | R |
| new N-2 | A backend stores records as opaque bytes and never compares stored digests across runtimes (forecast readings differ by an ULP: handoff §10) | backend | P |
