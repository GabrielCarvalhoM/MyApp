# SSCTR review — PR #121 / CCP-ONB-1 (#109)

Reviewer: sports-science-concurrent-training-reviewer (SSCTR-1.0.0, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY), independent context, read-only.
Reviewed: branch `claude/v1-ios-integration-i109-ccp-onb` @ 0d504672, 2026-11-27. Verbatim report as handed back to the orchestrator
(Chief); the reviewer did not write to the repository, so Chief records it here. No decision_id was assigned by the reviewer:
Chief assigns `SSCTR-CCPONB-2026-11-27-R1` as the record id.

## Verdict: APPROVE_WITH_CONDITIONS

Engine amendments: none of the seven items needs one for V1. Two hardening amendments are recommended but do not block V1 (item 1, item 2).

### Basis and limits
- Role: SSCTR-1.0.0, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is a software review, not a human, clinical or empirical validation.
- Inputs read: branch @ 0d504672 (record, diffs of Intake.swift, OnboardingFields.swift and other Swift sources, tests); the frozen engine
  (r6-intake.mjs, r6-program.mjs, r6-balanced.mjs, v1-coaching.mjs, v1-run-calibration.mjs, custody.mjs); the C spec F-ONBOARDING-FIGMA.md (read-only).
- Reproduced: both replays through Facade/e2e-runner.mjs (fields 23 cases, clinical 30 cases), JSON-identical to the committed outputs; the probe output, identical; own probes edge.mjs, weeks.mjs, calib.mjs (scratchpad only).
- Literature (abstracts/metadata only, except partial full text of Petré 2021); claims resting on them are SUPPORTED_WITH_LIMITS:
  - Robineau 2016, JSCR 30:672 — interference depends on the recovery gap between sessions (0 h worse than 6 h or 24 h). https://pubmed.ncbi.nlm.nih.gov/25546450/
  - Petré 2021, Sports Med 51:991 — strength interference in trained people appears only in the same session (<20 min apart), not when >2 h apart. https://pmc.ncbi.nlm.nih.gov/articles/PMC8053170
  - 2022 Sports Med meta-analysis on RIR — people underpredict RIR by about 1 rep, more accurately near failure. https://pubmed.ncbi.nlm.nih.gov/34542869/
  - Ely 2007, MSSE 39(3) — marathon performance slows progressively with heat. https://experts.umn.edu/en/publications/impact-of-weather-on-marathon-running-performance/
  - ACOG CO 804 — exercise is generally safe in pregnancy and postpartum without contraindication. https://pubmed.ncbi.nlm.nih.gov/33481513/

### Field by field
| Field | Verdict | Note |
|---|---|---|
| Known loads | OK, with copy conditions (item 4) | Sent as a load hint only. Listing an exercise also changes which exercise is picked: with F1's same equipment, a familiar back-squat replaces the goblet-squat (lower-body demand MODERATE → HEAVY), and barbell-row replaces db-row. Sets, reps and RIR are sent but never used (no current/tolerated/observedAt); the Data owner should consider data minimisation. |
| Coach | OK | Week-1 doses identical across the three profiles; only disclosures differ. Explicit BALANCED behaves like no key. |
| Race time goal | OK | Context only (`usedForPace:false`); plan unchanged apart from the uncertainty note. Range issue is item 7. |
| `temporaryPreference` | Encoding OK, meaning narrower than the copy | F3 run/strength/balance plans are session-identical. The engine sets the lead from goals and phase (`buildGoalModel`); this field only breaks ties between options with equal worst-case joint harm (`chooseBalanced`). Screen 07's "A corrida/força fica protegida" overclaims. |
| Shifts and `sameTurnConfirmed` | OK | Absent shifts place both sessions at the same default hour, back to back (≤6 h counts as same session) — worst case, conservative. `sameTurnConfirmed` only sent as `true`. Limitation: Manhã→07h and Tarde→18h can overstate the gap for late-morning + early-afternoon pairs; ordinal, low severity; re-review if the turn model changes. |
| Result conditions | OK | HEAT and HILLY each exclude the result from calibration. |
| `weeks` absent without a race | OK | Engine plans 12 weeks. With a race and `weeks` absent, the race is anchored but the plan grows to 12 weeks with post-event weeks, so "8 semanas até lá" would be false. |
| Single sport, training months | OK | Nothing sent for the sport not trained. The record's row "0 only for Nunca" is wrong: B1 and SSCTR D12 also send 0 for "Já corri e parei" (documentary fix). |
| `recent.*` | OK | Unknown values omitted, never zero. B1 gives SAFE_CONSERVATIVE_ESTABLISHMENT and WALK_JOG; B2's zeros are the athlete's real answer. |
| `specialPopulationNotStated` hold | OK | See item 1. |
| Marathon projection | OK | PREPARATORY and BLOCK disclosures verbatim. BLOCK has no list of met criteria, so no "6 de 6". |

### Rulings on the seven open items
1. **Combined pregnancy/postpartum item, and "not answered" with no clinical sign: hold the send. Correct V1 behaviour.** No amendment for V1.
   - Why the hold is needed: as the UI really encodes it (flags 1–6 absent), the frozen engine returns ASK; if the athlete then answers "no" to all six, PROPOSED.
   - Why it stays closed today: a code not among the four is ignored (engine fails open); Swift cannot emit such a code, and the encoder throws on the hold. "Not answered" without a sign arises only when decoding an intake that lacks the key, and it is held.
   - Conditions: (a) C checks `answers.hold` before sending and shows a specific out-of-V1-scope screen (host A today returns `.failed("INVALID_REQUEST")`, which would land on the generic failure screen); the scope screen must not suggest exercise is unsafe, must not diagnose and must not substitute a dose. (b) The item-7 answer survives a clinical hold and any later re-onboarding.
   - Individual prescription in pregnancy/postpartum is OUT_OF_SCOPE_CLINICAL; excluding it from V1 is Founder scope.
   - Recommended hardening (Founder decision on frozen code; owners Core + SEC + SSCTR): a combined or unknown code should give UNSUPPORTED (fail closed). → Founder Decision #123.
2. **Per-day shift (09b): no amendment for V1.** Send per-sport shifts only when per-day answers reduce to exactly one shift per sport; never by majority; otherwise keep 09b disabled or collapse it into the per-sport shift. Absent shift is the conservative case. Per-day modelling is a fidelity improvement, not safety (Robineau, Petré): V2 Founder decision + SSCTR review.
3. **"Calor ou subida": no amendment.** Preferred: Founder/design split into "Calor" and "Subida". Interim: never pick one code, never send both (evidence record is append-only; a false condition would persist). A result marked "Calor ou subida" must not be sent as comparable: keep it local, copy says it does not calibrate paces.
4. **Known loads as hints: acceptable (SUPPORTED_WITH_LIMITS).** Today every listed exercise is set by effort in week 1, at most 2 sets with an RIR floor; the week-1 row says the earlier load "is a starting hint only"; a logged load within one increment of the hint is adopted without the usual second confirmation. Proposed screen 26 copy: "Suas cargas entram como referência. Na primeira semana cada exercício é ajustado pelo esforço; a carga que você registrar perto da sua referência já passa a valer." Remove "Sem carga conhecida, o exercício fica a estabelecer…". Screen 31: "Força com as suas cargas" → "Força a partir das suas cargas, ajustada pelo esforço na semana 1". The screen must not imply "4 × 5 · sobravam 3" is prescribed. Load convention comes from the catalogue; "Stiff com barra" → `barbell-rdl` (hinge hint only). A known-dose start would need new questions (recent, tolerated, within 28 days) but no engine change: Founder decision + SSCTR wording review.
5. **"Teste" without a measurement: screen 23's "faixas de ritmo" claim is false for it.** No amendment. Add a follow-up "Como cronometrou: relógio com GPS / cronômetro / esteira" → GPS / MANUAL / TREADMILL (probe: GPS → MODERATE tier; MANUAL and TREADMILL → LOW with wider bands). Never default to MANUAL. Until then, the pace-band promise applies only to an official race or track.
6. **"Equilíbrio" with a real tie: ASK is correct.** No amendment. On a real tie the athlete's preference is the right tie-breaker. UI asks "qual fica mais descansado neste bloco" with costs shown; never picks automatically; says the answer is stored and decides later ties, or shows it in Perfil. Screen 07 copy must describe tie-breaking, not general protection.
7. **Time goal outside 10–400 min dropped silently.** No amendment; low risk (goal never sets intensity). Client limits the field to 10–400 min (D19 also needs an hours wheel for half/full marathon), never sends out-of-range, gives an explicit message. Screen 31 shows the comparison only when `RunCalibration.goal` is not nil.

### Owners
- C (UI) and QRE: 1a/1b, 2, 3 interim, 5 interim, 6 UI, 7; enforce derived `weeks` whenever there is a race, or test it.
- Product/UX copy and Founder: screens 07, 23, 26, 31 and the scope screen (→ #120).
- Founder / design: splitting the item in 3; the follow-up question in 5; known-dose questions in 4.
- Founder (frozen code): item-1 hardening amendment (#123); per-day shifts in V2.
- Integration (record fixes): the `runTrainingMonths` row; exercise-selection effect of known loads; tie-break-only meaning of `temporaryPreference`.
- Data/Privacy: sets, reps and RIR collected and never used.
- Outside this PR: screen 24 "sem dor: Não" only sets `tolerated:false`; screen 27 asks about current pain next.

### Records and expiry
- Proposed human-queue entries (reviewer was read-only; Chief appends): **HQ-CCPONB-SSCTR-LOADHINT** (item 4) and **HQ-CCPONB-SSCTR-TURN** (item 2), both QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.
- re_review_triggers: any engine amendment; any change to the encoding; any Figma change to screens 07, 09b, 23, 24, 26, 27 or 31.
