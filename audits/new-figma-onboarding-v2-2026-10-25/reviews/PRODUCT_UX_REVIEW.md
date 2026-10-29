# Product/UX review — OB-2 onboarding, account and paywall revision · round 1

- **Review ID:** PUX-OB2-2026-10-26-r1 · started 2026-10-25, resumed and closed 2026-10-26 (the first run stopped on a usage limit, not on a finding).
- **Reviewer:** fresh Product/UX Architect instance (constitution 1.2.0), read-only judge. I did not author anything under review. The only file I wrote is this one. Nothing in the Figma was edited.
- **Rubric:** `agent-system/evals/PRODUCT_ARCHITECTURE.md` 1.0.0, applied to fidelity, structure, states, interpretability and doc sync.
- **Independence:** `SSCTR_BINDING_REVIEW.md` and `SECURITY_REVIEW_R2.md` appeared in `reviews/` while this review ran. I did not read them. I used only the two reviews the submission relies on.

## Verdict

**READY_WITH_FIXES.** The direction, the new order and the per-sport schedule are faithful to the Founder request, and the doc sync is broad and honest. Three MUST findings block a PASS on this revision:

- **M1:** the sign-in branches ignore the draft on the device.
- **M2:** the account step exists in two different versions.
- **M3:** the limitation branch is under-specified after the reorder.

Each fix is local, and none requires rework of the architecture.

- **Architecture Eval for this revision:** not PASS. **VISUAL_READY is not issued.**
- **Re-check:** a targeted delta check of M1–M3 by a fresh Product/UX instance can issue it on the fixed revision.
- **Founder:** no escalation is needed, apart from the 2-week rotation scope, which is already open and surfaced (recommendation below).

**Fact changed since the submission (coordinator, 2026-10-26).**
- DOMAIN COACHING R5 has closed. Its scheduler still models availability windows.
- The DR-112 mapping is therefore an owner gap for the next coaching mission (R6), which has not started.
- The PDR still names R5 as the owner. See S7.

## What holds

The following are accepted, with evidence:

- **Founder items 1–11 all land.** I checked each against the [request](../FOUNDER_REQUEST.md) and the Figma.
  - Order: ON-01 → ON-01b → ON-03…ON-15 → ON-02 → ON-16 → PP-01 → PP-03 → PP-04 → PP-05. The prototype links match.
  - Paywall PP-03 `123:1304`:
    - "Economize 72%";
    - R$ 199,90/ano as the main price;
    - "R$ 16,66 por mês · 72% menos que o mensal". The math checks: 199,90 ÷ 12 = 16,66, and 1 − 16,66/59,90 = 72%;
    - four benefits;
    - a personal plan card;
    - the renewal disclosure.
  - Rotation ON-14b `374:3379` offers the four options. "O coach decide" carries the tag and is not pre-selected. Copy is SSCTR-verbatim.
  - Schedule per sport: ON-12a `121:1100`, ON-12b `121:1213` (long-run day only among run days; strength days marked).
  - ON-13 is gone and no link targets a removed frame.
  - ON-12c `395:4416` is the same-shift sheet.
  - ON-11 `121:1030` has the units switch and optional Sexo.
  - Progress dashes are white.
  - "Recomendado" appears only on ON-06 and ON-14b, never on goals.
- **The account placement is the minimal move.** Login moved from before the questionnaire to right after it. Assembly, proposal, paywall and adoption keep their order.
  - This matches "não quero que mude o nosso mais do que eu pedi".
  - It also matches Security E1/E2: the assembly needs the server, and nothing leaves the device before the account.
- **Specialist-driven deviations are recorded, not hidden.** They are:
  - "Sexo" instead of "gênero";
  - no "Outro";
  - sex used only as a weak hint for the first loads.

  They are recorded in DR-114 (PDR:12) and in [ONBOARDING_V2](../ONBOARDING_V2.md) row 6, with SSCTR Q4 and Security Q3 as the reasons.
- **DR-110–116 state the decisions faithfully** (PDR:1–17).
  - They carry the SSCTR conditions:
    - binding days with load set first;
    - content before ON-V7, and chosen days never dropped;
    - long-run adjacency handled by content;
    - same-shift order by the key session, with ASK in Balanced;
    - rotation means selection only;
    - the first exposure is calibration;
    - Fixo keeps the selection, and a rotation due in a taper is deferred;
    - the sex envelope;
    - the "no tag" residual.
  - They also carry the Security conditions: E1–E9 → G09, token → G08, retention / art. 11 / analytics → G07, D-items in UXS ONB-05/15/23.
- **No parallel source of truth.**
  - The PDR-1.7 block is the decision authority. The canon index pointer (`CANONICAL_INDEX.md`:1–15) routes to it.
  - The UXS rows cite the DR IDs, and DPC is a derived view.
  - [DECISIONS_DRAFT](../DECISIONS_DRAFT.md) declares itself a draft (see C7).
- **Supersessions are narrow and named:**
  - ONB-09 and ONB-21 (UXS:297, :308), with ONB-21's step removed;
  - ONB-02 units;
  - ARCH-ACX-r1 order only, with 8B kept.
  - A search of the product docs finds no live "janela = possível", no double-session preference outside candidates or CoachingCore, and no "Prefiro evitar".
- **New states have triggers and gate dependencies in their notes:**
  - ON-01r `400:13233`: shows progress only (D1); retention is G07;
  - ON-01s `400:13234`: D2, including the HealthKit line;
  - ON-12c `400:13235`: shown on Continuar only when there is a conflict; stored as a preference; the order rule; prohibited claims;
  - ON-15b `400:13236`: G07, E9;
  - ON-02d `400:13237`: D10, G09;
  - ON-02c `400:13238`: D9;
  - AC-04f `300:2970`: D11, token G08/G09;
  - ON-V6 `126:2078`: D4.
- **CF-04 `178:3793` is per sport.** It covers:
  - strength days, shift, time and rotation;
  - running days, shift, long run and time;
  - equipment;
  - "Ver o que muda no plano", which leads to a proposal and never mutates the week by itself.
- **The open 2-week rotation scope is surfaced, not decided:** DR-113 (PDR:11), the PDR open list (PDR:16) and the ON-14b note `400:13230`.
- **Error states never link to success.**
  - AC-03a/b/c, AC-05, ON-02b and AC-04c lead only back, to retry or to recovery.
  - Code fields lead to ON-16 only on AC-03, AC-03d and AC-04d, which simulate a successful code.

## Findings

### MUST

**M1 — The sign-in branches ignore the draft on the device. This is a journey break in the new order.**

- **Evidence: prototype links.**
  - "Já tenho conta" goes to AC-04 from ON-02 `118:655` (complete draft), from ON-01r `386:4394` (incomplete draft), and from AC-01 `250:1689` and AC-03 `250:1812`.
  - On AC-04 `250:1868`, "Criar conta" → ON-01b.
  - On AC-04f `300:2889`, "Começar" → ON-01b.
- **Evidence: notes.** The AC-04 note `250:2080` is stale:
  - it says "Criar conta → ON-01b (18+) → ON-02". That is the account-first order; read literally, it creates an account without the questionnaire;
  - it describes AC-04f as "explícita, com termos e 18+", which contradicts D11 and AC-04f's own note.
- **Impact.**
  - A person who finished the questionnaire may tap "Já tenho conta" on ON-02 and have no Apple/Google account. AC-04f then tells them "primeiro algumas perguntas…", which is false for them, and restarts them at 18+.
  - With an incomplete draft, "Começar" restarts instead of resuming.
  - Either the draft is overwritten silently, which breaks DR-111/ONB-15 (erasing is an explicit act, ON-01s), or two drafts coexist, which nothing defines. Engineering would have to invent the rule.
- **Fix: three variants of AC-04 and AC-04f, each with its own note and links.**
  - (a) No draft: as drawn.
  - (b) Incomplete draft: AC-04f's primary action continues the answers at the saved step, and AC-04 "Criar conta" resumes.
  - (c) Complete draft: AC-04f offers "Criar conta com estas respostas" → ON-02, with a fresh provider sheet (G08 rule unchanged), and AC-04 "Criar conta" returns to ON-02.
  - Update the AC-04, ON-02 and ON-01r notes.
- **Owner:** OB-2 author (Product/UX structure, then Designer for frames and links). The Security delta confirms that the token handling is unchanged.

**M2 — The account step exists in two different versions.**

- **Evidence.**
  - The main-path frame ON-02 `118:655` shows only "Ao continuar, você aceita os Termos de uso e a Política de privacidade." It has:
    - no D8 line ("Suas respostas [e o resumo do Apple Saúde] vão para sua conta…");
    - no "O Vilumo é para maiores de 18 anos.";
    - no D10 warning under "Já tenho conta".
  - ON-02d `397:4963` is a sheet over a copy of ON-02, and its background shows all three.
  - The ON-02 note `118:878` and ONBOARDING_V2 ("ON-02 upload line") say these lines are on ON-02.
- **Impact.** The canonical frame of a P0 step lacks a Security MUST (D8) and a SHOULD (D10) that the submission declares drawn. Anyone building ON-02 from its frame omits them.
- **Fix.**
  - Make `118:655` the single source: add the three lines, with "e o resumo do Apple Saúde" shown only when it applies.
  - Keep ON-02d as a sheet over it.
- **Owner:** OB-2 author (Designer). The Security delta re-verifies ON-02.

**M3 — The limitation branch is under-specified after the reorder.**

- **Evidence.**
  - The ON-15 note `122:1546` sends "Dor ou lesão → ON-V5", and only "Voltando de pausa" through the consent act (ON-15b).
  - The ON-15b note `400:13236` says the act covers "pausa, dor" and that "o mesmo ato de consentimento vale lá".
  - ON-15b `397:4845` depicts only "Voltando de uma pausa".
  - ON-V5 `126:1734`:
    - collects the pain region ("Onde é a dor? Joelho…") with no consent element;
    - its "Entendi, continuar" has no link;
    - its note `126:2077` gives no exit for the new order.
  - No state defines "Dor ou lesão" with the act declined (per ON-15b, off means the answer is unused and treated as unknown). Meanwhile the option promises "Pedimos avaliação profissional antes de planejar a região afetada".
- **Impact.**
  - A product-truth invariant is at risk for health data. ONB-05 (UXS:293) and DR-111 require consent before the account to be an explicit act; choosing an option is not consent.
  - There is also an undefined, safety-relevant state. Under ONB-11 (UXS:299) and HC03, a refusal is unknown, not proof that there is no restriction.
- **Fix: one rule for both limitation answers.**
  - The act happens on ON-15 before any detail is asked, and ON-V5 comes only after the act.
  - Consent off with "Dor ou lesão" leads to a defined outcome. For example: no region is collected; the limitation stays unknown per ONB-11; a neutral line recommends professional evaluation; the answer is editable in Perfil.
  - The ON-V5 exit goes to ON-02.
  - Align both notes and add the link.
- **Owner:** OB-2 author (Product/UX). The Security delta checks D7, and SSCTR or the clinical owner checks the HC03 semantics.

### SHOULD

**S1 — ON-V7 and ON-V7b have inconsistent or undefined triggers and exits.**

- **Evidence.**
  - ON-V7:
    - Its note `126:2079` says "Calculado no aparelho antes da conta", yet its options "geram nova proposta (PP-01)" and the frame's CTA is "Ver nova proposta".
    - The ON-16 note `122:1547` also routes to ON-V7 after the account.
  - ON-V7b:
    - Its note `400:4794` says the screen asks for a decision only when the coach cannot make each day a supported session.
    - The frame `400:4698` shows the other case ("Dá para usar os 6…").
  - What is missing:
    - a display rule for "muitos dias perto da prática recente";
    - a strength equivalent of ON-V7b;
    - the precedence among ON-12c, ON-V7 and ON-V7b after ON-12b.
- **Fix.**
  - Define two triggers:
    - a local one before the account (few days for the goal; a frequency heads-up);
    - a server one after the account (an unsupported day, or the goals do not fit).
  - Give each its exit and CTA. Before the account, go back to ON-12a/12b or on to ON-14; after it, to ON-16 → PP-01.
  - Display rule: show ON-V7b when chosen days for a sport exceed the declared recent weekly frequency (ONB-08). This is not a ceiling, so it stays within SSCTR's no-number condition.
  - Add copy variants for zero recent practice and for strength.
  - Precedence: ON-12c → ON-V7 → ON-V7b.
- **Owner:** OB-2 author (Product/UX). SSCTR binding checks the copy.

**S2 — "Horário" and the shift values are drawn but are not in Product Truth.**

- **Evidence.**
  - ON-12a `121:1100`: "Manhã | Almoço | Noite" and "Horário 18:00–20:00".
  - ON-12b `121:1213`: "Horário 06:30–08:00" and "Longão até 2 h".
  - CF-04: "Noite · 18:00–20:00".
  - PP-01 `122:1305`: "Longão 60 min · Sáb 08:00", at the end of the 06:30–08:00 window.
  - ONB-09 (UXS:297), DR-112 (PDR:10) and AEOS `practice_context` (AEOS:75) define only days, one shift and time per session.
  - The old ONB-09 listed manhã/tarde/noite. "Almoço" appears nowhere in the repo.
- **Impact.** The shift is now binding and drives the same-shift check, but these are undefined:
  - the shift values;
  - what the time range means: a start window, a hard window, or a planned time (SES-02: "o turno escolhido é o planejado, não uma trava").

  The depicted week also contradicts the depicted window.
- **Fix.** Document both in ONB-09 and AEOS:
  - the shift set, including why "Almoço" replaced "Tarde";
  - the "Horário" semantics. Recommendation: an optional preferred start range inside the shift, used to place session times, not a lock. Alternatively, remove the field.

  Then align PP-01.
- **Owner:** OB-2 author (Product/UX and PCG sync). The Designer updates the frames.

**S3 — Superseded availability vocabulary is still live.**

- **Evidence: Figma.** ON-12a copy and its note `121:1292` say "Perfil › Disponibilidade". UXS ONB-09 says "Você › Rotina", and CF-04 is titled "Rotina".
- **Evidence: UXS.**
  - :80 "Uma edição de disponibilidade";
  - :178 SURF-X-12;
  - :474 AM-02 prohibits "sair da disponibilidade";
  - :554 FAC-07;
  - :607 AG-04;
  - :623 EDT-01 ("mover (dia/janela)", "mudar disponibilidade em geral");
  - :798 CTN-06;
  - :1014 B03 ("dias com janelas… fora da disponibilidade").
- **Evidence: other docs.** AEOS:164 HC05; CORE_FLOWS:23 (F01 step 2); PRODUCT_ARCHITECTURE:21.
- **Impact.** None of these reasserts the old semantics. They do keep a removed concept addressable. AM-02 and HC05 are where the new hard constraint should be named.
- **Fix.** Sweep the wording to "dias e turnos escolhidos (Rotina)". Name DR-112 in AM-02 and HC05. Change the Figma copy to "Perfil › Rotina".
- **Owner:** PCG doc sync (OB-2 author). The Designer updates ON-12a.

**S4 — Engine moves to non-chosen days are still drawn, and ON-06 copy implies moving days.**

- **Evidence.**
  - AD-04 `148:1717` (page 4): after the person blocks Thursday night, the engine offers "Sexta, 18:30 — só tronco" ("sexta é seu dia livre") as a ready option.
  - This conflicts with the updated rules: AEC:114 ("mover para outro dia só por ato da pessoa") and AEOS:122 C05 ("MOVE apenas dentro dos dias escolhidos ou por ato da pessoa").
  - ON-06 `120:828` says "Corrida primeiro muda o agachamento de dia." DR-112 and SSCTR Q1 condition 3 say adjacency is handled by content, never by moving days.
  - The AESL fixture (ADAPTIVE_ENGINE_SCENARIO_LAB:47–51) has `C-A / MOVE S-L` to a "janela livre".
- **Fix.**
  - Decide the rule. Recommendation: after the person removes a chosen day, the engine may offer another day only as an explicit one-off option. It is never applied without the person's choice, and it is labelled as that day's exception (EDT-02).
  - Write the rule in AEC and C05, or redraw AD-04 with options inside the chosen days plus "Escolher outro dia".
  - Reword the ON-06 example in content terms, for example "Corrida primeiro alivia as pernas na véspera do longão".
  - Hand the AESL fixtures to R6.
- **Owner:** OB-2 author (Product/UX, Designer). SSCTR binding checks the ON-06 copy. The R6 owner takes the AESL fixtures.

**S5 — Path skips are not updated for the per-sport screens.**

- **Evidence.** The ON-03 note `118:879` still lists only "Só corrida → pula ON-05/ON-06. Só força → pula ON-04/ON-06/ON-07".
- **What is missing:**
  - ON-12a, ON-14 and ON-14b, which are strength-only;
  - ON-12b and ON-12c;
  - the number of dashes on each path.
- **Fix.** Add a skip table for each path to the note, and one line in ONB-09/22 for single-sport paths.
- **Owner:** OB-2 author.

**S6 — Edge states of existing accounts are not routed.**

- **Evidence.**
  - The ON-01 note `118:877` routes a sign-in only to "plano ativo → AC-11 → Hoje" or "plano salvo sem assinatura → PP-08".
  - ON-16 `122:1547` allows an account that has answers but no week ("Não conseguimos montar agora…", or the offline upload).
  - The AC-04d note `276:2856` sends a confirmation without a draft to ON-03. That questionnaire then ends on ON-02 "Crie sua conta" for a person who is already signed in.
  - The ON-02c note does not say that the notice appears only when a draft was actually deleted.
  - Security Q4's COULD (offer "Usar as respostas deste aparelho") is undecided.
- **Fix.** Write a sign-in routing table:
  - active plan;
  - saved plan;
  - answers without a plan → ON-16;
  - no answers → the questionnaire in signed-in mode (no ON-02, no "só neste aparelho" line) → ON-16.

  Show ON-02c only when a draft was deleted.
- **Product/UX recommendation on the COULD:** adopt it only for an account that has no answers, under Security's four conditions.
- **Owner:** OB-2 author. The Security delta checks the COULD.

**S7 — Records and owners are stale after R5 closed.**

- **Evidence: owners.**
  - DR-112 scope (PDR:10) and the open list (PDR:16) name "the current coaching mission (R5)".
  - R5 closed on 2026-10-26. The MISSION_LEDGER tail says "Next DOMAIN_COACHING_R6, not started".
  - `CoachingCore/r5/OPEN_GAPS_R5.md` does not record the DR-112–114 mapping.
- **Evidence: mission and ledger.**
  - CURRENT_MISSION.md:137 still says "PDR DR-110, which is written but not yet applied". It is now applied in PDR-1.7.
  - Neither CURRENT_MISSION nor MISSION_LEDGER has an OB-2 entry, although ONBOARDING_V2 says they "were only appended to".
- **Fix.**
  - Name the owner as the next coaching mission (R6). List the gap where R6 will read it:
    - the R5 scheduler's window model;
    - the AESL fixtures;
    - the candidate POL-07 "double preference".
  - Append an OB-2 entry (insert-only) to the mission and the ledger, and a note that supersedes the DR-110 line.
- **Owner:** Chief (routing) and PCG doc sync.

**S8 — Where the primary consent (M1) is captured is ambiguous.**

- **Evidence.**
  - J-01 (UXS:849) says "conta com termos e consentimento primário (ONB-23)".
  - ONB-23 (UXS:310) does not mention M1.
  - §6.2 (UXS:320) still says "Consentimento primário (M1) | Agora".
  - ON-02 shows only the terms line.
- **Fix.** State in ONB-05/ONB-23 and §6.2 where M1 is captured in the new order, and whether it is a separate act or carried by the account step. G07 decides the form.
- **Owner:** OB-2 author, with G07.

**S9 — Prototype links in the welcome carousel bypass the order.**

- **Evidence.** ON-01 `118:512` embeds the device screen "Tela do app · HJ-01…". Its tab bar keeps live reactions, in two copies:
  - Plano → PL-01;
  - Histórico → HI-01;
  - Progresso → PR-01.

  A tester can enter the app from the welcome screen without 18+, the questionnaire or an account. The frames 2/3, 3/3, ON-01r and ON-01s are clean.
- **Fix.** Remove the reactions inside the illustration.
- **Owner:** Designer.

### COULD

- **C1 — Missing prototype links for documented branches.**
  - ON-08 "Agora não" → ON-V3.
  - ON-V5's exit.
  - The ON-V7 actions.
  - PP-01 "Mudar dias ou horários".
  - PP-03 close → PP-08.
  - AC-11 → ON-02c.
  - ON-02 back → ON-15.
  - An ON-12b variant with a conflicting selection, linking to ON-12c.

  (Designer.)
- **C2 — Edit path from PP-01.** In edit mode, ON-12a/12b should return to ON-16 → PP-01 (EDT-01 (3)) without repeating ON-14…ON-02. (OB-2 author.)
- **C3 — Gaps around "Recomendado".**
  - DR-115 says it shows its reason, but ON-14b has no reason line. Add one, or narrow DR-115 to suggestions derived from the person's answers.
  - Reason-line templates exist only for priority rules 1–2. Specify rules 3–4.
  - Map "corrida de desempenho sem data" to the ON-04 options ("Correr mais rápido"; "Correr mais longe"?).
  - ON-06 depicts the recommended option already selected. Say that it is the person's choice, or show the default state.

  (OB-2 author; SSCTR binding checks the copy.)
- **C4 — ON-12c scope.** Say whether "Fazer em sequência" covers only the listed days, and that a new same-shift day created later in CF-04 per-day tuning asks again. CF-04's note promises per-day fine-tuning, but no frame shows it. (OB-2 author.)
- **C5 — Analytics wording.** DR-111's rationale says nothing reaches "analytics" before the account. Its dependents leave funnel events without values to G07 (Security E1). Make the two consistent. (PCG.)
- **C6 — Smaller states for the Security delta.**
  - ON-16 offline after the account: the copy exists, but the state and its exit do not.
  - AC-04d with a draft: the draft must be bound to that pending sign-up (E7).
  - AC-11 on the OB-2 path when Apple Saúde was granted before the account: the grant is not the account's consent, and the connection is confirmed in Perfil › Integrações.

  (OB-2 author; Security delta.)
- **C7 — Record accuracy.**
  - DECISIONS_DRAFT still shows superseded details ("Outro", "Você › Disponibilidade", the residual Equilíbrio). Add one header line: "applied as PDR-1.7 with changes; history".
  - ONBOARDING_V2 says every accepted SSCTR string is verbatim. ON-06's reason line ends with "A escolha é sua." instead of SSCTR's second sentence. The copy is acceptable, but the claim is inaccurate.

  (OB-2 author.)
- **C8 — Founder-facing summary.** State plainly, as information and not as a question:
  - "gênero" became "Sexo" without "Outro";
  - sex is only a weak hint for the first loads;
  - the account sits right after the questionnaire because assembling the plan needs the server.

  (Chief.)

## Founder decision still open: what the 2-week rotation rotates

It is surfaced in PDR:11 and :16 and in the ON-14b note. Nothing decided it silently. The decision belongs to the Founder because it changes what the option promises.

**Product/UX recommendation: option (a).** "A cada 2 semanas" rotates accessories and close variants of the main lifts, and its helper text says so.

- It keeps progress readable at the exercise level. It needs no progress-by-block view, and progress claims are gated (DR-96).
- It stays honest, and SSCTR lists it as acceptable.

Option (b) is the literal reading of the request. It makes progress for "Ficar mais forte" depend on block-level views that do not exist yet. Either way, the person's choice is never overridden silently.

## Rubric (PRODUCT_ARCHITECTURE 1.0.0) on this revision

| Criterion | Result |
|---|---|
| Need / outcome | PASS. It removes the "marquei 5, usou 3" frustration the Founder named. |
| Canonical ownership | PASS with S3. Athlete Context owns days, shift, long run and rotation. Perfil › Rotina (CF-04) is the edit destination. The PDR is the authority. |
| Architecture / navigation | PASS with S5 and S9. |
| Journey | **FAIL until M1 and M3 are fixed.** Sign-in with a draft and the limitation branch break continuity. |
| Hierarchy | PASS. 18+ comes first; then the questionnaire on the device, the account, value before the offer, and adoption apart from payment. "Recomendado" never pre-selects. |
| States | PARTIAL (S1, S6, C6). The new support states are defined. |
| Terminology / invariants | PARTIAL (S2, S3, S4). The DR-112 invariant is carried, with vocabulary and drawn leftovers. |
| Alternatives / proof | N/A. The Founder decided the direction, and the minimal-move reading is justified above. |
| Handoff | PARTIAL (M2, S7, C7). |

## What I checked and how

- **Read.**
  - CORE and the constitution, the rubric, FOUNDER_REQUEST, ONBOARDING_V2, DECISIONS_DRAFT, SSCTR_REVIEW and SECURITY_REVIEW.
  - The PDR-1.7 block and the canon index pointer.
  - UXS §6 in full, plus the rows changed by OB-2 and the rows that still speak of availability.
- **Diffed** the 13 synced files against `before/`. All 13 `SHA256SUMS` lines verify OK.
- **Searched** product/, canon/, CoachingCore and candidates for leftover terms:
  - "janela", "disponibilidade", "duas sessões";
  - double-session preference, "Prefiro evitar", "multi-janela", "duração típica", "Almoço".
- **Figma `TYR10AIrquCpKvKL3eyXyO`, read-only.**
  - With `use_figma` scripts, read:
    - every prototype reaction in sections 2.1–2.4, with source, trigger and destination;
    - every note in 2.1, 2.2 and 2.4;
    - the visible text of 30+ frames;
    - the "Recomendado" and "Selo" placements;
    - the carousel's nested reactions.
  - Took screenshots of ON-02, ON-02d, ON-05, ON-06, ON-12a, ON-12b, ON-12c and ON-15b.
  - Read CF-01–CF-04 (page 6), the map and FAQ (page 8), and the adaptation frames (page 4).
  - Searched pages 1, 2, 4 and 6–8 for leftovers.
- **Versions.**
  - FOUNDER_REQUEST `a94132ba…fdc`; ONBOARDING_V2 `7ca3eaa5…ec2`; DECISIONS_DRAFT `90547e33…a0`.
  - PDR `d9ea31a1…a5a`; UXS `8d91e765…5d9`; CANONICAL_INDEX `b5f6a7c6…cc`.
  - AEOS `08149de6…e02`; AEC `1db3b0e0…730`; CF `e054cde8…a19`; DPC `ed972d58…e2`.
  - The Figma has no pinnable version through the plugin API. It was read on 2026-10-25 and 2026-10-26, and the coordinator confirms nothing changed in between.
- **Not covered.**
  - Visual quality, motion and accessibility (UI gate).
  - Legal and security sufficiency (Security, G07).
  - The scientific soundness of the copy (SSCTR binding).
  - Clicking through the prototype: reactions were read, not played.
