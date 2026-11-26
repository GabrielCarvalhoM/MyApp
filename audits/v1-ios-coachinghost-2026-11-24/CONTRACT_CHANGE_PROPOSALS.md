# Front A (CoachingHost): contract change proposals

Contract §11: front A did not edit any shared contract. `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation` is empty (`results/mac/gates.log`). Each proposal below has a local adapter inside `ios/Packages/CoachingHost`, so the interface the other fronts consume stays as it is. The integration mission decides.

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

## CCP-A-04: account erasure removes the key, and the key seals the tombstone (QRE-A-04; Security + Core decide)

- **Conflict.** NATIVE 6.3 / handoff §9 make the native side of `eraseAccount` remove the integrity key. But the custody's tombstone (the "no resurrection" `GONE` of an erased athlete) is keyed by `hmac(key, …|subject|athleteId)`. With a new key, `tombstoneOf` cannot find it.
- **Pinned today** (`ReviewFixTests.testEraseAccountThenSameIdPinned`, Mac and iPhone): after `eraseAccount`, an `onboard` with the same athlete id is `planCreated`, not `GONE`.
- **Options for the deciders:**
  1. Keep the key after an account erasure (only the record, the anchor and the side files go), so `GONE` holds. This deviates from 6.3's "remove the key".
  2. Keep 6.3, and accept that an erased id can enrol again as a new account (the old record is gone either way).
  3. Seal the tombstone subject with a separate long-lived host key that survives account erasure (a boundary-side or native change).
- **What A ships meanwhile.** Option 2, i.e. the literal 6.3, pinned by the test above.
- **Impact.** Security, Core (custody), Founder/legal (G07). None on B or C.
