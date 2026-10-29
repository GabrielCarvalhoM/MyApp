# New Figma — onboarding, account and paywall revision (OB-2)

Date: 2026-10-25 · File: `TYR10AIrquCpKvKL3eyXyO` · Source: [Founder request](FOUNDER_REQUEST.md) · Decisions: PDR DR-110–116 ([draft and routing](DECISIONS_DRAFT.md)).
Status: **CLOSED FOR FOUNDER REVIEW (2026-10-26).** The four independent gates pass for the Figma revision of 2026-10-26: UI_READY; Product/UX Architecture Eval PASS with VISUAL_READY; Security PASS (SECURITY_READY_WITH_CONDITIONS); SSCTR binding Q1–Q5 BOUND. The doc side of these gates closes when the held product-doc corrections are applied after DOMAIN_COACHING_R6 closes (see "Round 2", "Gates" and the [CHECKPOINT](CHECKPOINT.md)). Still an experience candidate: not implemented, not promoted (DR-94). Legacy Figma untouched; no runtime change.

## What changed, by Founder item

| # | Founder item | Figma | Repo |
|---|---|---|---|
| 1 | Onboarding right after "Começar / Já tenho conta"; login only after it | New order on page 2, section 2.1: ON-01 → ON-01b (18+) → ON-03…ON-15 → **ON-02** (account) → ON-16 → PP-01 → PP-03 → PP-04 → PP-05. Links rewired (ON-01b → ON-03; ON-15 → ON-02; ON-02 Apple/Google, AC-03, AC-03d, AC-04d → ON-16). New support states: ON-01r (resume, progress only), ON-01s (erase answers), ON-02d (provider already has an account), ON-02c (notice after signing in to an existing account), ON-15b (explicit purpose consent). AC-04f now leads to the questionnaire and has no terms line. | DR-111, DR-110; UXS ONB-03/05/15/23, J-01, FLOW-01; CF F01; EM; Scope; DPC |
| 2 | Paywall: stronger emphasis on the current/annual plan, % discount per month, advantages, more crafted | PP-03 rebuilt: personal plan card with the 16-week phase bar, four benefits with icon tiles, annual card selected with green check, "Economize 72%" badge, R$ 199,90/ano as the main price and "R$ 16,66 por mês · 72% menos que o mensal", monthly card, auto-renewal disclosure and links. Motion: phase bar fills left to right, then the badge pops. | DR-116 (prices still provisional, DR-104/G10) |
| 3 | Strength exercise rotation question | **ON-14b** (new, after ON-14): O coach decide (Recomendado) · A cada 6 semanas · A cada 2 semanas · Fixo, plus the progression footnote. Copy is SSCTR's accepted wording. Perfil › Rotina shows it (CF-04). | DR-113; UXS ONB-22; STIL §4 |
| 4 | Days and shift per sport; long-run day; the plan uses them | **ON-12a** (strength days + shift + time) and **ON-12b** (run days with strength-day markers, long-run day among run days, run shift, times) replace ON-12. ON-16, PP-01, ON-02 and CF-04 speak of chosen days. ON-V7 rewritten for chosen days; **ON-V7b** (more run days than current practice) added. | DR-112; UXS ONB-09/21, §6.2, SES-02, EDT-02; AEOS `practice_context`, C05; AEC; SIS; RIL; PDM; DPC |
| 5 | Remove the double-session question; same shift → alert and confirm | Old ON-13 frame reused as ON-12b (the question is gone). **ON-12c**: "Força e corrida no mesmo turno" sheet with "Fazer em sequência" / "Mudar o turno". | DR-112; UXS ONB-21 |
| 6 | Units switch on the height/weight step; ask gender | ON-11: units segmented switch (kg · cm / lb · ft), optional **Sexo** (Feminino / Masculino / Prefiro não dizer; no pre-selection) with the SSCTR-approved helper. CF-02 gains a Sexo row. Label "Sexo", not "gênero": the coach can only use the physiological construct; gender identity has no consumer (SSCTR Q4, Security Q3). "Outro" was not added: no consumer (minimization); "Prefiro não dizer" takes the same neutral path. | DR-114; UXS ONB-02/20; AEOS `profile_context` |
| 7 | Progress dashes all white | 14 dashes on every questionnaire step (ON-03…ON-15, ON-V1/V2/V3/V5), done = `texto/primário`, upcoming = `superfície/elevada`. | — |
| 8 | Crafted Apple Health ↔ app drawing; charts built with motion | ON-08: Apple Saúde tile → Vilumo tile, two connectors, data chips (Corridas, Treinos de força, FC nos treinos, Sono e VFC · opcional), "Só leitura" label; dots flow one way only (DR-107: ingest only). Motion on ON-01 (carousel), ON-07 (16 weeks to race), ON-08 (diagram), ON-09 (weekly bars), ON-16 (week assembling) and PP-03 (phases). | DR-107 unchanged |
| 9 | "Recomendado" only where it makes sense | ON-06 "Corrida primeiro" with the reason line (dated race); ON-14b "O coach decide". New component **Selo de destaque** (page 9, white pill: green stays selection-only), also used for the paywall discount. Never on goals. | DR-115; UXS ONB-07 |
| 10 | Quality references (carousel, motion chart, Health animation, login, annual emphasis) | ON-01 carousel with three real app screens in a device (Hoje, strength execution, a proposal with its reason), auto-advance and seamless loop; static frames 2/3 and 3/3 for review. ON-02 rebuilt with brand light and the person's chosen week. Nothing copied from the reference: no ratings, testimonials, body imagery, countdown or "só hoje". | — |
| 11 | Update contracts, not only the Figma | 13 files synced (35 exact edits; pre-change copies and SHA-256 in [`before/`](before/SHA256SUMS.txt)). Thesis unchanged. | PDR-1.7 block; canon index pointer |

## Frame map (new file)

Page 2, section 2.1 main row (x = 80 + 473·i): ON-01 `118:512` · ON-01b `299:2879` · ON-03 `118:708` · ON-04 `118:792` · ON-05 `120:733` · ON-06 `120:828` · ON-07 `120:908` · ON-08 `120:985` · ON-09 `120:1068` · ON-10 `121:900` · ON-11 `121:1030` · ON-12a `121:1100` · ON-12b `121:1213` · ON-14 `122:1056` · ON-14b `374:3379` · ON-15 `122:1156` · ON-02 `118:655` · ON-16 `122:1253` · PP-01 `122:1305` · PP-03 `123:1304` · PP-04 `123:1379` · PP-05 `123:1520`.
Section 2.1 support row (y = 1300): ON-01 2/3 `384:3591` · ON-01 3/3 `384:4369` · ON-01r `386:4394` · ON-01s `386:5170` · ON-12c `395:4416` · ON-15b `397:4845` · ON-02d `397:4963`.
Section 2.2: ON-V7 `126:1887` (rewritten) · ON-V7b `400:4698` (new). Section 2.4: AC-04f `300:2889` (D11) · ON-02c `397:13488` (new). Section 2.6: OB-2 annotation in the direction document.
Page 6: CF-04 Rotina per sport `178:3793`, CF-02 Sexo row `178:3611`, CF-01 routine summary. Page 8: Entrada column and entry answer updated. Page 9: Selo de destaque `396:4773`.
Added in round 2: ON-11 lb · ft `443:4723` · ON-15b arrival, switch off `444:4793` (the existing `397:4845` is now the state after the act) · ON-15d "Dor ou lesão" without the act `444:4889` (support row) · AC-04f with an incomplete draft `445:13343` and with a complete draft `445:13387` (section 2.4). ON-02b `300:2971` was rebuilt in place. Page 4: AD-04 `148:1717` redrawn. The support row moved down 282 and section 2.4 rows 2–3 moved down 240 to make room; no frame or note overlaps.

## Independent reviews used before drawing

- **SSCTR** ([review](reviews/SSCTR_REVIEW.md)): Q1 chosen days APPROVE_WITH_CONDITIONS; Q2 back-to-back APPROVE_WITH_CONDITIONS; Q3 rotation APPROVE_WITH_CONDITIONS with copy REVISE; Q4 sex LIMITED_REVERSIBLE_RECOMMENDATION; Q5 priority suggestion LIMITED_REVERSIBLE_RECOMMENDATION with the residual default replaced by "no tag". Accepted strings are used verbatim, with one exception: ON-06's reason line ends with "A escolha é sua." instead of SSCTR's second sentence (the binding review accepted that copy). Three reusable rules proposed for the funded-human queue (OB2-Q1-ALLOC, OB2-Q2-ORDER, OB2-Q3-ROTATION); the queue file was not edited.
- **Security** ([review](reviews/SECURITY_REVIEW.md)): SECURITY_READY_WITH_CONDITIONS for the direction. Design MUSTs D1–D9 and D11 are drawn (ON-01r, ON-01s, promise on ON-01b and ON-08, ON-V6 note, privacy links on ON-01/ON-01r/ON-08, ON-08/ON-15b copy, ON-02 upload line, ON-02c, AC-04f); SHOULD D10 drawn (ON-02 warning + ON-02d); offline-after-account copy in the ON-16 note. Engineering conditions E1–E9 and the legal items stay with G09/G08/G07.

## Author verification (not a gate)

- Screenshot of every new or changed frame after each batch; fixes applied where content met the action bar (ON-08, ON-14b, PP-03, ON-V7b, ON-15b, ON-06, CF-04).
- Motion rendered with `export_video` and sampled frame by frame: ON-01 (slide 1 → 2 → 3 → seamless return), ON-08 (tiles, connectors drawing, chips, one-way dots), ON-16 (sessions drop into dashed slots, checklist in order, spinner).
- Hygiene scan of 32 frames: every frame keeps its explicit variable mode; no collapsed text; no text outside its frame; no overlap between frames and notes in sections 2.1, 2.2 and 2.4.
- Repo: each of the 35 edits matched exactly once; line endings preserved (LF); file tails unchanged.

## Round 2 (2026-10-26)

The four round-1 judges came back after their first runs stopped on a usage limit. They were resumed, not restarted.

| Gate | Round-1 result | Record |
|---|---|---|
| Product/UX | READY_WITH_FIXES: M1 sign-in branches ignore the draft; M2 two versions of the account step; M3 limitation branch under-specified | [PRODUCT_UX_REVIEW](reviews/PRODUCT_UX_REVIEW.md) |
| UI | NOT_UI_READY: M1 carousel slide-2 text clipped; M2 unstyled height; M3 day letters below 4.5:1 on ON-02 | [UI_REVIEW](reviews/UI_REVIEW.md) |
| Security delta | PASS_WITH_CONDITIONS: M1 D8 line missing on ON-02/ON-02b; M2 consent switch drawn on; M3 limitation and AC-04d paths; M4 DR-114 and AC-04 note wording | [SECURITY_REVIEW_R2](reviews/SECURITY_REVIEW_R2.md) |
| SSCTR binding | Q1 MISBOUND (ON-06 example moved a session; C05; ON-V7 number); Q3 PARTIAL (DR-113 "load keeps progressing"); Q5 PARTIAL (ON-06 drawn as pre-selected); Q2 and Q4 BOUND | [SSCTR_BINDING_REVIEW](reviews/SSCTR_BINDING_REVIEW.md) |

The author changed the following in the Figma. Each change was checked by reading the file on 2026-10-26, and the re-check judges verify them.

- **Account step** (Security M1, PUX M2):
  - ON-02 `118:655` is the single source again. It has the upload line (D8), the 18+ sentence, and the D10 warning under "Já tenho conta · Entrar".
  - ON-02b `300:2971` was rebuilt with the same lines.
  - The day letters use texto/secundário (UI M3).
  - These three lines were drawn on 2026-10-25 and found missing on 2026-10-26. The author did not remove them, and the cause is unknown. They were restored.
- **Draft on the device** (PUX M1, Security M4 note):
  - New AC-04f variants: an incomplete draft `445:13343` ("Continuar minhas respostas") and a complete draft `445:13387` ("Criar conta com estas respostas" → ON-02).
  - The AC-04 note now gives one draft per device, the sign-in routing table (PUX S6) and the corrected AC-04f description.
  - AC-04d uploads only a draft that was started for that pending sign-up on this device (Security M3b).
  - ON-02c appears only when a draft was erased (UI R3).
- **Limitation before the account** (PUX M3; Security M2, M3a, S2):
  - ON-15b now has an arrival state with the switch off (`444:4793`). The existing `397:4845` is labelled as the state after the act.
  - ON-15d `444:4889` covers "Dor ou lesão" without the act: nothing is kept; the answer is unknown, not "sem restrição"; a neutral referral line is shown; the person can authorize later in Perfil.
  - ON-V5 comes only after the act, and its "Entendi, continuar" → ON-02.
  - The ON-15, ON-15b and ON-V5 notes are aligned.
- **SSCTR copy** (Q1, Q5):
  - The ON-06 example is in content terms ("Corrida primeiro alivia as pernas no treino de sexta…").
  - The ON-06 reason line sits under the recommended option. The note says the drawn state is after the person's tap.
  - The ON-V7 rows and body state facts about this plan. Its note says the minimums are illustrative until the session floor is approved.
  - The ON-V7b note covers both cases, the display rule and the copy variants (PUX S1).
- **UI**:
  - The carousel slide text has room (UI M1). The body ends 78 pt above the dots and 60 pt inside the slide, in ON-01 and its copies.
  - ON-11 height uses Número/Médio + Texto/Meta (M2). The lb · ft state is drawn as `443:4723` (S10).
  - Shift times use Número/Hora (S9).
  - ON-08 has one-way arrowheads (S4).
  - PP-01 has a bottom inset of 169 for a 153-pt bar (S5).
  - The direction document now says (S1–S3, S8):
    - motion plays once, except the carousel and the ON-08 dots;
    - pause rules;
    - 14 steps;
    - 44-pt hit areas.
- **Structure**:
  - ON-12a copy says "Perfil › Rotina" (PUX S3).
  - AD-04 `148:1717` was redrawn. It offers the person a one-off exception or skipping the session; nothing is applied without the person's choice (PUX S4).
  - The ON-03 note has a skip table for each path (S5).
  - There are no live reactions inside the carousel illustration (S9).

Not every SHOULD and COULD item was addressed. The re-check records which ones stay open.

### Re-check and spot check (2026-10-26)

The four judges re-checked the revision above. Records: [PRODUCT_UX_RECHECK](reviews/PRODUCT_UX_RECHECK.md) (a fresh instance, as round 1 asked), [UI_RECHECK](reviews/UI_RECHECK.md), [SECURITY_RECHECK](reviews/SECURITY_RECHECK.md) and [SSCTR_BINDING_RECHECK](reviews/SSCTR_BINDING_RECHECK.md).
- All round-1 MUSTs were closed.
- Five new items came back:
  - SSCTR Q1: the server-side "a day can't be a supported session" case was routed to ON-V7 options;
  - Security N1: the signed-in questionnaire mode kept device-only lines;
  - Product/UX N1 and SSCTR: op 23 gave the referral line to every pause;
  - Security S5: the AC-04f draft variants had no way out for someone else's answers;
  - UI N1 and N2: the ON-V7 bar was not at the bottom, and the ON-02c X was not drawn.

The author fixed them, and the same four judges spot-checked the fixes. Records: [PRODUCT_UX_SPOTCHECK](reviews/PRODUCT_UX_SPOTCHECK.md), [UI_SPOTCHECK](reviews/UI_SPOTCHECK.md), [SECURITY_SPOTCHECK](reviews/SECURITY_SPOTCHECK.md) and [SSCTR_SPOTCHECK](reviews/SSCTR_SPOTCHECK.md). The fixes:
- **Notes.**
  - ON-V7 `126:2079`: one home for the unsupported-day rule (ON-V7b's), with "Trocar a meta da corrida" → ON-04.
  - ON-V7b `400:4794`: the zero-practice condition.
  - AD-04 `148:1818`: the drawn state is after the person's tap.
  - AC-04 `250:2080`: the signed-in mode drops every "só neste aparelho" line.
  - ON-01 `118:877`: routes to the AC-04 table.
  - ON-02d `400:13237`: the case of an account with no plan.
  - ON-12a and ON-12b: the edit path.
  - ON-15 `122:1546`: the referral applies to pain or injury only, and the undrawn reason question is removed.
- **Frames and links.**
  - The pause sub-label is now "Viagem, rotina ou outro motivo — sem dor nem lesão", on ON-15, both ON-15b frames and ON-15d.
  - Both AC-04f variants have "Não são minhas respostas · Recomeçar" → ON-01s.
  - The ON-V7 bar is pinned to the bottom.
  - ON-02c has a close X.
  - ON-02 and ON-02b back links go to ON-15.
  - Section 2.2 grew by 104 pt, and the sections below moved with it.
- **Held doc corrections.** They were regenerated as r2 (`101fbb6f…`). Only six ops changed:
  - ops 2–3: an owner that stays true;
  - ops 4 and 26: load keeps progressing on the exercises that stay, which keeps the Founder's point and SSCTR's;
  - op 21: the signed-in mode;
  - op 23: the referral line for pain or injury only.

### Founder decision (2026-10-26): the 2-week rotation

The Founder chose SSCTR Q3 option (a): "Na opção 'A cada 2 semanas', troque só os acessórios e as variações próximas dos exercícios principais (opção a), e ajuste o texto de ajuda para dizer isso."

What changed in the Figma:
- The ON-14b helper now reads "Os principais ficam; trocam os acessórios e as variações deles". It still fits two lines, and the footnote ends at 747, above the bar at 753.
- The ON-14b note `400:13230` records the decision. The CF-04 note `178:4091` gives the helper to use where the option appears without the ON-14b footnote: it adds ", e cada um novo começa com uma carga de ajuste". Section 6.1 grew 140 pt for it.

What changed in the held corrections:
- They are now revision r3 (`c511d828…`), with 38 ops.
- Ops 1–34 are byte-identical to r2.
- Ops 35–38 record the decision in DR-113, the PDR open list, ONB-22 and STIL.

SSCTR checked it in [SSCTR_ROTATION_CHECK](reviews/SSCTR_ROTATION_CHECK.md): BOUND, with nothing to change. Which exercises count as main ones, and what counts as a close variant, stays with the rotation recipe (training policy + SSCTR, before runtime).

After the spot checks, three note-only completions the judges asked for were made. None changes a rule or a frame:
- the ON-15 note now states honestly that the pause label does not exclude illness, and that where a recent illness goes is open for G04 + Product/UX;
- the ON-V7b note names "Mais tempo por treino";
- the ON-02c note gives the copy for an account with no plan.

The product-doc corrections are prepared but **held**. They are 34 exact edits in 8 files, answering:
- PUX M1, M3, S2–S4, S6–S8, C2, C3 and C5;
- Security M4;
- SSCTR Q1–Q4.

See [PENDING_DOC_CORRECTIONS_R2.json](PENDING_DOC_CORRECTIONS_R2.json) and the concurrency note below.

## Concurrency note

A Codex mission, DOMAIN COACHING R5, started at 18:29 while this work ran. Its baseline (`audits/domain-coaching-r5-2026-10-25/BASELINE_MANIFEST.json`) covers CoachingCore, CURRENT_MISSION and MISSION_LEDGER, not `product/` or `canon/`, so these edits do not touch its freeze; mission and ledger files were only appended to. Two effects for its owner:
- R4's historical verifier (`npm run verify`, check `frozen_historical_source_preservation`) hashes `product/` and `canon/` against R4's pre-mission manifest, so it will now report the 13 synced files as changed. That is expected: they were changed by this later Founder-authorized mission (pre-change copies in `before/`).
- R5's scheduler (`CoachingCore/src/r5-schedule.mjs`) models availability windows that the coach fills. DR-112 replaces that semantics with chosen days per sport as hard constraints. The owner of R5 (or the next coaching mission) should map it; this mission edits no runtime.

Update, 2026-10-26:
- **R5 closed at 09:23** (`FINAL_DISPOSITION.json`) without the DR-112 mapping. The owner is now R6.
- **DOMAIN COACHING R6 opened at 10:08.** Its `audits/domain-coaching-r6-2026-10-26/BASELINE.json` binds the SHA-256 of:
  - all 66 `product/` files and 2 `canon/` files;
  - `AGENTS.md`, `CLAUDE.md`, `CURRENT_MISSION.md` and `MISSION_LEDGER.md`.
- **The product-doc corrections were not written,** to keep R6's evidence valid. There are 34 from round 2 and 4 more for the Founder's rotation decision: 38 ops in revision r3. They are held in [PENDING_DOC_CORRECTIONS_R2.json](PENDING_DOC_CORRECTIONS_R2.json), with the hash each file must have before and after.
  - [`apply-pending-doc-corrections.mjs`](apply-pending-doc-corrections.mjs) applies them once R6 closes.
  - It refuses while R6 is open, and when a target file has changed.
  - It snapshots the eight files to `before-r2/` first.
- **CURRENT_MISSION and MISSION_LEDGER received insert-only entries** on 2026-10-26: an OB-2 block in the NFV1 section, and a ledger entry at closure. Every line of R6's baseline stays present, in order. Their hashes now differ from R6's baseline. That is how every mission writes these two shared logs: R5's verifier excepts both files, and R6 must add its own entries too. If R6's closing check flags them, the only change is this OB-2 text.
- **The three OB-2 queue items stay in [QUEUE_ADDITIONS_PROPOSED.json](QUEUE_ADDITIONS_PROPOSED.json).** `verify-r5` asserts exactly 114 queue items, so appending them would break R5's closed verification. The next queue owner (R6 or later) appends them.

## Gates

| Gate | Judge | Round 1 | Re-check | Spot check: final |
|---|---|---|---|---|
| Product/UX (structure, fidelity, interpretability) | Product/UX Architect, Opus 5.5 max (round 1, then a fresh instance) | READY_WITH_FIXES (M1–M3) | M1–M3 closed; Architecture Eval PASS; VISUAL_READY; N1 on op 23 | **PASS + VISUAL_READY**; doc side passes once r2 is applied |
| UI (visual, interaction, motion, accessibility) | UI & Experience Designer, Opus 5.5 max | NOT_UI_READY (M1–M3) | **UI_READY**; SHOULD N1 and N2 | **UI_READY**; N1 and N2 closed |
| Security delta (redrawn account step, AC-04f, new states) | Security, Privacy & Abuse Architect | PASS_WITH_CONDITIONS (M1–M4) | M1–M4 closed; new MUST N1; SHOULD S5 | **PASS** (SECURITY_READY_WITH_CONDITIONS: apply ops 1, 6 and 18–23; G07/G08/G09) |
| SSCTR binding (docs and copy carry its conditions) | SSCTR | Q1 MISBOUND · Q3, Q5 PARTIAL | Q1 PARTIAL; Q2–Q5 BOUND (Q3, Q5 on application) | **Q1–Q5 BOUND** (doc parts on application) |

Open, none blocking:
- **Founder:** nothing open. The 2-week rotation was decided on 2026-10-26 (option a, above).
- **Training policy + SSCTR:** the rotation recipe, including which exercises count as main ones and what counts as a close variant.
- **G04 + Product/UX:** where a return after illness goes.
- **Security Q4 COULD:** "Usar as respostas deste aparelho" for an account with no answers.
- **Remaining COULDs:**
  - the rest of the prototype links (C1);
  - the per-day tuning frame (C4);
  - the ON-16 offline state (C6);
  - one name for the Rotina destination ("Perfil" or "Você", N4);
  - the before-account ON-V7 variant (N3);
  - the "Começar" label in ops 1 and 22;
  - the ON-06 resting frame (C9);
  - the ON-14b reason line, which needs SSCTR copy (C10);
  - a quieter style for "Não são minhas respostas";
  - ON-15d's referral sitting under the bar at rest (UI N5);
  - the moon rest glyph (C4 UI);
  - the ON-08 chips (C5 UI);
  - the inactive dots and dashes (C11);
  - the ON-01 fade (N3 UI);
  - the prime marks (N4 UI);
  - the PP-03 spacing (N6 UI);
  - the pre-OB-2 items in C12;
  - the ON-15 subtitle suggested by SSCTR.
- **Copy owner:** the slide-2 headline lost "primeiro" so it fits two lines ("do tiro à última série").

## Limits

Figma renders at 1x; no device or simulator check of VoiceOver, Dynamic Type or reduced motion (the motion spec asks for a reduced-motion fallback: cross-fade, no travel). Prices, legal text and integrations keep their gates (G10, G07, G06). The Apple Health tile is a drawing: the build must use Apple's official icon per the HealthKit guidelines.
