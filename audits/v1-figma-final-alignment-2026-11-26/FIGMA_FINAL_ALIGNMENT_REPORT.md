# RepMile: final functional alignment of the Figma (V1)

**Date:** 2026-11-26

**Figma:** `90oyvXHxxBQAvr1netov7S`, edited in place.

**Base for this record:** branch `claude/v1-figma-final-alignment`, created from the tag `v1-abc-ready-2026-11-26` (`065178f`) in its own worktree (`~/.codex/worktrees/myapp-v1-figma-final-alignment/MyApp`).

**Authority:**
- the Founder's direct request in this session, which authorizes editing the approved Figma;
- the contracts consolidated at `065178f` (functional);
- the approved Figma (visual).

**Inputs read:**
- the original reconciliation (`audits/v1-ui-functional-reconciliation/`: final report, 37 gaps, inventory);
- the foundation (`FIGMA_FUNCTIONAL_ALIGNMENT`, `FOUNDATION_CHANGE_DECISIONS`, `C_SWIFTUI_HANDOFF`, `HR5_INTEGRATION_REPORT`);
- `HEART_RATE_FIVE_ZONE_V2.json`;
- `CONTRACT_DELTA` HR5R;
- the `CoachingPresentation` fixtures.

The 588 screens were not audited again from scratch.

## 1. Access

- `whoami`: Full seat, Pro plan, admin.
- Reversible probe: the Guia frame `897:2` was renamed and restored in the same call (`restored: true`).
- The file's 25 pages match the inventory.

**FIGMA_EDIT_ACCESS_CONFIRMED = YES.**

## 2. What was done, by class

| Class | Items |
|---|---|
| **Applied in the Figma** | Five zones HR5 on 71: percentages and bpm from the engine; the 3 bands removed; the claim "never from age" removed; 2 missing states created (age estimate, the V1 default; custom limits). Unsupported actions hidden: lab after onboarding; "Excluir" on 50. Onboarding 14 copy (zones from age). FND-ABC-04 restart variant (10 `1103:2299`). GAP-09, -10, -11, -16, -19, -23 copy. SSCTR-ABC-S1 question in the unplanned run. C10 note in "Tempo por zona". HR is no longer a plan input in "Aprendizado". Guia updated. 99 copy. |
| **Applied as state marking** (name tag + Dev Mode annotation, no visual change) | FUTURE: live HR (16 frames), Tempo por zona, watch signals, Mapa híbrido, coach suggestion inside the session, delete or remove, another device, the athlete's own sleep report, short night. Hidden until a gate closes: GAP-14, GAP-15. Contract mapping on about 100 frames (`Startability`, `runSession(for:)`, `warningSignSet`, `loggedEntries`, `kept`, `HealthIngestStatusSource`, etc.). |
| **Documented only** | The pace insight "Ritmo consistente …" on 50 `880:19765` is local and descriptive. To be reviewed by Product/UX if C cannot back it with an engine code. The strength part of a proposal depends on `pendingWeek` (A). The C copy table (GAP-24) and the `INTERIM` texts (GAP-05) are C's work. The editor sheet for the four limits: C builds it with the approved form-sheet pattern (41 "corrigir série"); the engine returns the validation in `fields`. |
| **Not needed** | GAP-03: the 9/13/15 counts are already variants of the same component; annotation only. GAP-07 (`weekPlan` closed). Blocked states (`838:3689`, `838:3756`, `849:3994`, 31 `645:749`, 72 `805:410`): they already showed no "Começar" and no prescription. "Sem FC ao vivo" variants: they already exist (row `879:3062`). GAP-26, -28, -30. |
| **Blocked** | None on the Figma side. Pending product decisions are in `OPEN_PRODUCT_DECISIONS.md` (7 items, each with a V1 default already applied). |
| **Future preserved** | No future component was deleted. Every "hidden" item is `visible = false` or a tag on the name; the structure is intact for activation. |

## 3. Priorities

**P0 (safety or wrong data): all resolved.**
- **FND-ABC-04:** restart with pregnancy or postpartum. The new variant shows no "Começar"; the portão is annotated for A.
- **HR5:** wrong percentages, and copy contradicting the engine ("never age", "needs a strap").
- **GAP-16:** the coach reading said it used iPhone pace.
- **"Registrado · ritmo, FC e esforço":** heart rate was presented as a plan input.
- **SSCTR-ABC-S1:** stop or symptom in the unplanned run.

**P1 (would break the implementation): all resolved.**
- **Five zones on the strap screen:** the 3 bands are revoked.
- **The missing states:** age-estimated and custom.
- **Delete actions without an operation:** GAP-13.
- **"Sem permissão" or denial:** GAP-19.
- **Load suggestion:** GAP-10.
- **Move gesture:** GAP-09.
- **Coach reasons the engine does not give:** GAP-23.
- **Quick question:** GAP-11.
- **Post-onboarding lab:** FND-HR5-01.
- **Live HR, Tempo por zona, watch signals:** marked as hidden in V1.

**P2: the small ones were applied.**
- The Guia (`897:2`) and 99 (`897:1232`).
- The C10 copy in "Tempo por zona".
- The "Dia a dia" copy on 30.

## 4. Closing criteria

| Criterion | Result | Evidence |
|---|---|---|
| FIGMA_EDIT_ACCESS_CONFIRMED | **YES** | §1 |
| APPROVED_FILE_EDITED_IN_PLACE | **YES** | `FIGMA_NODE_CHANGELOG.md`: same file, real IDs, 3 new frames cloned from approved frames on the same page |
| VISUAL_LANGUAGE_PRESERVED | **YES** | No style, variable, component or color changed; screenshots in `VISUAL_REGRESSION_REVIEW.md` |
| P0_FUNCTIONAL_GAPS_RESOLVED | **YES** | §3 |
| P1_FUNCTIONAL_GAPS_RESOLVED | **YES** | §3 |
| HR5_FIVE_ZONES_RECONCILED | **YES** | 71: `760:1484`, `760:1611`, `760:1693`, `845:4225`, `1102:4302`, `1102:4428` (+ twins); 10 `836:782`; 50 Tempo por zona annotated as C10 |
| ONBOARDING_SAFETY_RECONCILED | **YES** | 10 `836:3299` (annotation: nil ≠ false, `specialPopulation`), `838:4053`, `1103:2299` |
| BLOCKED_STATES_RECONCILED | **YES** | 31 `645:749`, 72, 81 `849:3994`, 10 `1103:2299`; `Startability` annotated on 20/31/40 |
| HEALTHKIT_DATA_STATES_RECONCILED | **YES** | 81 `848:383`, `848:502`, `848:290`, `880:25617`; 50 imported `684:4890`; DR-121 not on by default |
| GPS_AND_RUNNING_STATES_RECONCILED | **YES** | 40 (live HR future, GPS states annotated, unplanned run), 50 iPhone-only |
| HISTORY_DATA_STATES_RECONCILED | **YES** | 50: `kept`, `unplannedMerge`, delete as future, correction; imported; offline already designed (50 "Força · salvo neste iPhone, envio pendente") |
| NO_UNSUPPORTED_METRIC_PROMISES | **YES** | Hybrid map, VO₂, watch signals, Tempo por zona and live HR marked as future; "ritmo, FC e esforço" fixed |
| VISUAL_REGRESSION_REVIEW_PASSED | **YES (self-check)** | `VISUAL_REGRESSION_REVIEW.md`. Independent review recommended in §4 there; playback of `785:5837` not verified |
| SWIFTUI_HANDOFF_UPDATED | **YES** | `SWIFTUI_VISUAL_HANDOFF_ADDENDUM.md` (additive; the original C handoff was not rewritten) |
| COACHINGCORE_UNCHANGED | **YES** | `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/` empty on this branch |
| A_B_C_WORKTREES_PRESERVED | **YES** | No file in the other worktrees was touched; the tag was not moved; nothing was merged |

## 5. Limits stated

- The frame ID of "Hoje / Descanso planejado" was not captured; its text nodes were.
- The Plugin API does not create a named version. **Founder:** save "V1 alinhamento funcional · 26 nov" in the version history, so C has a stable reference.
- Numbers on the Figma screens are design examples:
  - The HR5 examples were recomputed with the engine's rule.
  - `1102:4302` and `1102:4428` match the fixtures `hr5r-age30` and `hr5r-custom`.
  - Lucas (declared max 188) keeps the persona; the fixture uses 195.
- The historical sections of CURRENT_MISSION.md still say `FIGMA_EDITS_AUTHORIZED = NO`. This session followed the Founder's direct, later request. The mission file was not changed, because the request did not ask for that.
