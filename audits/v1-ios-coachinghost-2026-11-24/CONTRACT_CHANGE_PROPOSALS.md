# Front A (CoachingHost): contract change proposals

Contract §11: front A did not edit any shared contract (CCP-A-01 to 06). `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation` is empty (`results/mac/gates.log`). Each proposal below has a local adapter inside `ios/Packages/CoachingHost`, so the interface the other fronts consume stays as it is. The integration mission decides.

## CCP-A-01: a `pendingWeek` read in `CoachingReading` (CHG-UI-2 2.3, GAP-08 / GAP-CORE-03)

- **Why.** The frozen view names no diff. `presentation().pending` carries only the run sessions of a proposal. C cannot show the strength sessions of a change that waits for accept/decline without inventing them.
- **What A already has (local adapter).** `facade/pending-week.mjs` (`PENDING_WEEK_VERSION = RM-COACHINGHOST-PENDING-WEEK-1`) runs the frozen `planView` over `doc.pending.proposal` and returns the proposed week in the view's own week format. Each session gets `executable:false` and `proposed:true`, so nothing in a proposal can ever start. It is linked into the production bundle and covered by a Node test over the real boundary (`facade/test/item18.test.mjs`): the proposal holds 6 sessions (2 strength), none executable, and they equal the adopted week after `accept`. Evidence: `results/item18-evidence.json`.
- **Exact diff proposed** (in `ios/Packages/CoachingPresentation`):
  ```swift
  // HistoryAndAnswers.swift
  public struct PendingWeekProjection: Decodable, Equatable, Sendable {
      public let projections: String                 // RM-COACHINGHOST-PENDING-WEEK-1
      public let pending: PendingWeek?               // nil: nothing waits
  }
  public struct PendingWeek: Decodable, Equatable, Sendable {
      public let decisionId: String
      public let change: Code
      public let programHash: String?
      public let weekIndex: Int
      public let weeks: Int
      public let week: Week?                         // PlannedSession gains `proposed: Bool?` (optional, decodes today's views)
  }
  // CoachingPort.swift, CoachingReading
  func pendingWeek(week: Int?) async -> Result<PendingWeekProjection, BoundaryError>
  ```
  Also: `PlannedSession.proposed: Bool?`, and a regenerated fixture `actions-B1c-pending-week.json` from `capture-fixtures.mjs`.
- **Impact.** On C: a new optional read and one fixture. C's fixture provider gains one method. On B: none.
- **Tests that change.** `CoachingPresentationTests.testEveryFixtureDecodes` (the new fixture). `FixtureFreshnessTests` (regeneration). Front A adds `CoachingHost.pendingWeek(week:)` once the type exists.

## CCP-A-02: the LOCAL_FATIGUE review has no closed request type (GAP-11, CHG-UI-2 2.10)

- **Why.** The proof the reconciliation asked for (`results/item18-evidence.json`, `item18.test.mjs`) was run through `integration.submit` with `{kind:'LOCAL_FATIGUE', eligibility, observations:[]}`. The engine answered `ok`, `status: MODIFY`, `action: REDUCE`. The current week's sessions changed **at once**, with no pending change to accept. The view stayed `VALID_PLAN`.
- **What this means for the screens (not a decision of A).** The Figma 20 choice "Mais pesadas" would really reduce the plan, without an accept/decline step. The copy must not promise anything else. `ReviewRequest` has no `LOCAL_FATIGUE` case, so C cannot send it today, and A sends no request that the shared types cannot build.
- **Proposal.** No diff from A. **SSCTR + Product/UX** decide whether V1 exposes this review. If yes, add `case localFatigue` to `ReviewRequest.Body` (encoding `kind: "LOCAL_FATIGUE"`), with the copy rules SSCTR sets. A then needs no change: `submit` already carries it.
- **Impact.** C (a form and copy) and SSCTR. None on B.

## CCP-A-03: an explicit write for "the unplanned-run symptom route is open" (A18a ii)

- **Why.** A18a (ii) requires `.notStartable(.screenRequired)` when the athlete answered "yes" to the unplanned-run question and left without answering the signs, "sinal recebido de C pela escrita".
- **What A implements now (local adapter, no new port).** A keeps a persistent signal (`HostSignals.warningSignsAsked`). It is set by any write answer that asks for the warning signs: `warningSignScreen.status == REQUIRED`, or `missingInputs` / the view's `question.missingInputs` naming `wellbeing.warningSigns.*`, `wellbeingCheck.warningSigns.*`, `wellbeingCheck.improved.*`, `wellbeingCheck.exerciseResponse.*` or `readiness.warningSigns.*`. A later answer that no longer asks for them releases it. `startability` also reads the live `presentation().readings.warningSignScreen` and the view's question. So when C writes the route's first step (the `NOT_FEELING_100` review with the signs still unanswered → ASK), nothing starts until the signs are answered. This covers reopening the process too (`PortTests.testWarningSignFlowsAndTheRoute`, `testWriteOutcomeKeptAndSymptomStop`).
- **What stays open.** If C writes **nothing** before the athlete leaves (the "yes" lives only in a draft), the host cannot know.
- **Proposal.** Either:
  - C always sends the route's first write before showing the sign questions (a rule in `C_SWIFTUI_HANDOFF`, no type change; preferred); or
  - a `CoachingWriting.openWarningSignRoute()` that only sets the native signal (no boundary call), released by the next answer that asks for no signs.
- **Impact.** C (flow), SSCTR-ABC-S1 owner. None on B.

## Not proposed (recorded)

- **`hr5r-carried.json`** is not reproduced through the facade. The app never reads the raw sealed carried records. A test-only read (`heartRateDeclarationIds`, ids only, refused outside `__chTestMode`) serves the HR5 two-process proof.
- **`PendingReports`.** A keeps no offline queue of athlete reports in this phase: drafts are C's (handoff §1). `pendingReports()` counts the writes in flight on A's queue, `oldestQueuedAt: nil`. If the integration wants a durable A-side queue, that is a new decision, not a type change.

## CCP-A-04: account erasure removes the key, and the key seals the tombstone (QRE-A-04): **RESOLVED IN A**

- **Conflict.** NATIVE 6.3 / handoff §9 make the native side of `eraseAccount` remove the integrity key. But the custody keys its tombstone (the "no resurrection" `GONE` of an erased athlete) by `hmac(key, …|subject|athleteId)`. With a new key, `tombstoneOf` could not find it, and the same id enrolled again.
- **Resolution (native, no shared change).** `CCP_A_04_RESOLUTION.md`, reviewed by Core R1 and Security R1 (both APPROVE_WITH_CHANGES, every change applied):
  - The key is still removed (6.3).
  - A native erasure fence, keyed by the store's existing digest tag and holding no time, makes the store adapter answer `tombstoneOf` for the host's own athlete. The frozen custody then answers `GONE` itself, for every read, write and delivery, in every process, whatever the key.
  - The old record is unrecoverable: it is deleted, and the key that sealed it is gone.
  - A new account (a new id) is genuinely new: new state, new key.
  - Tests: `ErasureTests` (Mac and iPhone), and the locked-device phase on the iPhone.
- **Superseded:** the pinned test `testEraseAccountThenSameIdPinned` ("the same id enrols again"). The same id on the same install is now `GONE`, as the custody defines it.
- **Impact.** None on B or C beyond CCP-A-05 (who issues the id). Security, Core: done. Founder/legal (G07): see CCP-A-06.

## CCP-A-05: a new account is a new athlete id (binding rule for whoever issues the id; Integration + Security)

- **Why.** The custody refuses an erased **id** for good ("a new account is a new athlete"). The fence keeps that on the device (CCP-A-04). This is right only if a person who comes back gets a **new** id. If the id were derived from a stable personal identifier, the erasure would turn into a lifetime ban of that person on that install, against the Founder's intent.
- **Rule (binding):**
  1. The athlete id is an opaque random value of at least 128 bits, issued at each account creation.
  2. It is never derived from an email, a phone number, an identity-provider subject (for example the Sign in with Apple user id), a device id or any other stable personal identifier.
  3. Re-creating an account after an erasure always issues a new id. An erased id is never re-issued.
  4. The `GONE` state on screen leads to "create a new account", never to "restore".
- **Shared text to reconcile (not edited by A).** `CoachingPresentation/…/Intake.swift:44` says "A sets it from the authenticated account". Proposed: "The app's athlete id: an opaque random id issued by the account layer at each account creation (CCP-A-05); A passes it as the actor; C passes what A gives."
- **Host code for C to map.** `ANOTHER_ATHLETE_ON_THIS_INSTALL`: onboarding refused because another athlete is enrolled on this install (one athlete per install; the integrity key is per install, NATIVE 1.5).
- **What A does.** A takes the id the app opens it with (`CoachingHost.Configuration.athleteId`), refuses an erased one, and enforces one enrolled athlete per install. A does not invent an account system.
- **Impact.** Integration (the account layer), C (the GONE screen copy), Security. None on B.

## CCP-A-06: record the fence in the contract; a later Core option (Core recommendation)

- **Persistence table, contract §7.** Proposed new row: "Erasure fence `erased-<tag>.json` (`{scope, state}`, no time) | A | `CoachingHost/` | `completeUntilFirstUserAuthentication` | never removed by the host; goes with the app container at a reinstall."
- **G07 row (line 310).** Proposed note: "The fence is a mechanism inside the tombstone retention the custody already declares (`custody.mjs:31-33`, MECHANISM_ONLY_PENDING_G07), not a new retention."
  - The custody's own tombstone files, which hold `erasedAt`, are removed once the key that named them is gone.
  - On a device, "no resurrection" cannot outlive the container. A server account service must keep its own tombstone.
- **Recorded deviations from the literal 6.3:**
  - the `.lock` file is kept (QRE-A-07: it holds no data, and unlinking it would split the lock);
  - the fence remains.
- **Core option, later cycle (not a blocker).** Let the custody's tombstone subject not depend on the key that seals the record: a separate long-lived subject key, or `tombstone(athleteId)` with the adapter pseudonymising. The core would then not rely on the adapter invariant that `testPinnedBundleTombstoneCallSites` pins today.
- **Impact.** Contract owners (integration mission), Core, Founder/legal (G07). None on B or C.
