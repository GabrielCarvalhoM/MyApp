# Front C · contract change proposals (contract §11)

Proposals only. Front C edits no shared contract; each item keeps a local adapter or a hidden UI element until the integration mission decides.

| Id | Shared type | Need | Evidence | Meanwhile in C |
|---|---|---|---|---|
| CCP-C-01 | `CoachingPresentation.RunCalibration` | Type `goal` (event, target seconds, status) so Hoje 20 / Prova 71 can draw the goal marker inside the estimate range ("meta 44:30", Figma `880:4362`). | `runCalibration.goal` is present in `04-…`, `12-presentation-after-w0` (untyped, dropped on decode). | The race card shows the range, base and phases without a goal marker. |
| CCP-C-02 | Fixtures (`INDEX.json`) | `hr5r-declared-presentation.json` is listed twice in the index (100 entries, 99 files). Generator output; harmless, but a test that counts entries sees 100. | `FixtureReplayTests.testEveryIndexedFixtureDecodesThroughItsPort` | The test counts unique names (99). |
| CCP-C-03 | `CoachingWriting.decline` fixtures | No capture of a declined proposal exists, so the fixture writer answers `FIXTURE_UNAVAILABLE` and the UI shows the operational error. | `actions-B*` and `actions-A2*` cover accept only. | Decline is wired; its fixture answer is an honest failure. |
