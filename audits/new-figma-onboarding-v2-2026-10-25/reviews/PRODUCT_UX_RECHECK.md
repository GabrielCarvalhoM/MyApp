# Product/UX re-check — OB-2 round 2 · delta check of M1–M3

- **Review ID:** PUX-OB2-2026-10-26-r2. It re-checks PUX-OB2-2026-10-26-r1 ([round 1](PRODUCT_UX_REVIEW.md)), as round 1 asked.
- **Reviewer:** a fresh Product/UX Architect instance (constitution 1.2.0), acting as a read-only judge. I am not the author and not the round-1 instance.
- **What I wrote:** only this file. I did not edit the Figma, `product/`, `canon/`, the mission, the ledger or the queue. I did not run `apply-pending-doc-corrections.mjs`, `npm run verify` or any `verify-r*` script.
- **Rubric:** `agent-system/evals/PRODUCT_ARCHITECTURE.md` 1.0.0.
- **Scope:** M1–M3, then the state of S1–S9 and C1–C8. This is not a fresh review.
- **Independence:**
  - `SECURITY_RECHECK.md` and `SSCTR_BINDING_RECHECK.md` appeared in `reviews/` while I worked. I did not read them.
  - One line of `SSCTR_BINDING_RECHECK.md` surfaced in a repo-wide search after I had already found N1 in the frames. It agrees with N1.
  - I read the Q3 lines of the round-1 `SSCTR_BINDING_REVIEW.md`, because ops 4 and 26 cite them as their source.

## Verdict

**Architecture Eval: PASS for the Figma revision I read on 2026-10-26 (about 10:55–11:10, −03:00).**

- **The three MUST findings are closed in the Figma.**
- **The product-truth side is PASS on application of the 34 held ops, with two conditions before applying them:**
  - **N1:** narrow op 23 first. As written, it contradicts the Figma.
  - **S7:** at apply time, re-word the "(R6)" owner in ops 2–3, unless R6 actually took the mapping.
- **VISUAL_READY is issued** for that Figma revision, scoped to the OB-2 structure (nodes listed under "Handoff").
  - It lapses if any M1–M3 frame, note or link listed below changes.
  - It also lapses if op 23 is applied as written.
- **Founder:** nothing new. The 2-week rotation scope stays open as surfaced.

## M1–M3

### M1 — sign-in branches ignore the draft · CLOSED

The Figma side is closed. The product-truth rule is **CLOSED on application** of ops 1 (DR-111) and 22 (UXS ONB-15).

- **AC-04f now has a variant for each draft state.**
  - No draft: `300:2889` "Começar" → ON-01b. Its copy ("primeiro algumas perguntas…") is true for this state.
  - Incomplete draft: `445:13343` "Continuar minhas respostas" → ON-01r `386:4394`. ON-01r's "Continuar de onde parou" → ON-11, which is step 9 of 14, the saved step.
  - Complete draft: `445:13387` "Criar conta com estas respostas" → ON-02 `118:655`.
  - Each variant keeps "Entrar de outro jeito" → AC-04.
- **Notes on the variants.**
  - `445:13386` and `445:13429`: the provider token is discarded, and ON-02 asks for a fresh sheet.
  - In the complete-draft variant, nothing is erased or restarted.
- **The AC-04 note `250:2080` was rewritten.**
  - It sets one draft per device. "Criar conta" goes to ON-01b with no draft, to ON-01r with an incomplete one, and to ON-02 with a complete one.
  - It says the draft is never restarted and never duplicated; only the explicit erase (ON-01s) restarts it.
  - It adds the sign-in routing table, and says AC-04f "não cria conta aqui (sem termos nesta tela)".
  - The stale lines "Criar conta → ON-01b (18+) → ON-02" and "explícita, com termos e 18+" are gone.
- **The supporting notes agree.**
  - ON-01r `400:13233`: signing in erases the draft only after success.
  - AC-04d `276:2856`: only a draft started for that pending sign-up on this device is uploaded.
- **Residuals (COULD, not blocking).**
  - AC-04 "Criar conta" has one drawn link (→ ON-01b). The other two destinations live in the note only.
  - The incomplete-draft variant lands on ON-01r, which asks "Continuar de onde parou" again. It could go straight to the saved step, which is ON-01r's own rule.
  - Ops 1 and 22 call the AC-04f action "Começar". In the draft variants it has other labels. Say "a ação principal de AC-04f".

### M2 — the account step exists in two versions · CLOSED

M2 has no doc dependency.

- **ON-02 `118:655` now shows the three lines** (visible text and screenshot):
  - "Suas respostas e o resumo do Apple Saúde vão para sua conta para montar seu plano. Ao continuar, você aceita os Termos de uso e a Política de privacidade. O Vilumo é para maiores de 18 anos."
  - Under "Já tenho conta · Entrar": "Ao entrar, as respostas deste aparelho são apagadas e o plano da sua conta continua."
- **ON-02b `300:2971` and the background of ON-02d `397:4963` repeat these lines word for word.**
- **The note `118:878`** says "Este frame é a fonte única do passo da conta", and that "e o resumo do Apple Saúde" appears only when Apple Saúde was connected.
- **Risk.** These lines vanished once, between 2026-10-25 and 2026-10-26, with no known cause.
  - This gate covers only the text quoted above.
  - ON-02b and ON-02d are copies, not instances, so they can drift apart again.

### M3 — the limitation branch is under-specified · CLOSED

The Figma side is closed. The product-truth side is **CLOSED on application only after op 23 is narrowed** (N1).

- **ON-15 `122:1156`.** "Nada no momento" is selected, and Continuar → ON-02. No act is needed for that answer.
- **ON-15b on arrival `444:4793`.** "Voltando de uma pausa" is selected and the switch is off.
  - Note `444:5015`: continuing with the switch off means the answer is not used and stays unknown.
- **ON-15b after the act `397:4845`.** The switch is on.
  - Note `400:13236`: the same act applies to "Dor ou lesão", before ON-V5.
- **ON-15d `444:4889`.** "Dor ou lesão" is selected and the switch is off. It shows: "Sem autorização, não usamos essa resposta. Recomendamos uma avaliação profissional antes de treinar a região afetada. Você pode autorizar depois em Perfil."
  - Note `444:5016`: no region is collected and nothing is kept. The answer is unknown, never "sem restrição", and HC03/ONB-12 apply.
- **ON-V5 `126:1734`.** "Entendi, continuar" `126:1813` → ON-02 `118:655`.
  - Note `126:2077`: ON-V5 comes only after the act, and it collects the region only with authorization.
- **ON-15 note `122:1546`.** One rule covers both answers: the act comes before any detail.
- **Why N2 does not reopen M3.**
  - Every item in round 1's fix list is done.
  - The follow-up question for "Voltando de pausa" (N2) is undrawn. It comes after the act and concerns a non-injury answer, and the drawn path is complete.
  - So no consent, safety or journey break remains.

## SHOULD and COULD items

| Item | State | Evidence |
|---|---|---|
| S1 ON-V7/V7b triggers | CLOSED | ON-V7 note `126:2079`: a local trigger (exits ON-12a/12b or ON-14) and a server trigger (ON-16 → PP-01, "Ver nova proposta"); precedence ON-12c → ON-V7 → ON-V7b. ON-V7b note `400:4794`: display rule with no invented ceiling, both cases, strength and zero-practice copy, exits. Residuals: N3. |
| S2 shift values and "Horário" | CLOSED on application | Ops 25 and 28 define Manhã/Almoço/Noite. "Horário" becomes a preferred start range that places the time without locking it. PP-01 `122:1305` now has "Sáb 07:00", inside 06:30–08:00. The reason for "Almoço" is provenance only (see N4). |
| S3 availability vocabulary | CLOSED on application | ON-12a `121:1100` copy and note `121:1292` say "Perfil › Rotina". Ops 8–14, 16, 17, 29, 33 and 34 cover every row round 1 listed. AM-02 and HC05 name DR-112 (ops 10, 29). The remaining uses of "disponibilidade" are generic, except AEC:81 (Athlete Context inputs) and CORE_FLOWS:99 (resume), which could join a later sweep. Naming nit: N4. |
| S4 moves to non-chosen days | CLOSED on application | AD-04 `148:1717` offers "Sexta, 18:30, só desta vez — só tronco", labelled "Exceção fora dos seus dias, só nesta semana", plus "Não fazer esta semana" and "Escolher outro dia" (note `148:1818`). The ON-06 example is about content only. The rule is in ops 10, 27 and 30. The AESL fixtures are named in op 2 (see S7 for timing). |
| S5 path skips | CLOSED (Figma) and on application | ON-03 note `118:879` has a skip table for each path and the dash rule. Op 25 adds the single-sport line. |
| S6 existing-account edges | PARTIAL | Done: the routing table in AC-04 note `250:2080` and op 21; ON-02c `400:13238` only when a draft was erased; AC-04d `276:2856` without a draft → questionnaire in signed-in mode → ON-16. Open: Security Q4's COULD ("Usar as respostas deste aparelho") is undecided. ON-02d `397:4963` says "você continua com o plano dessa conta" and goes to AC-11 even when the found account has no plan. The ON-01 note `118:877` still lists two destinations. |
| S7 records and owners | PARTIAL | Ops 2–3 name R6 (on application). CURRENT_MISSION.md:141–153 has the OB-2 block and the DR-110 supersession. MISSION_LEDGER.md has **no OB-2 entry**: its SHA-256 equals R6's baseline (`75cc18f3…`), so ONBOARDING_V2 line 116 is inaccurate. R6's TASK_CONTRACT does not mention DR-112, and op 2 cannot reach R6 before it closes. At apply time, "Owner: the next coaching mission (R6)" will name a closed mission. |
| S8 where M1 is captured | CLOSED on application | Ops 18–20 put M1 at the account step, as a separate act or together with acceptance (G07 decides). J-01 (UXS:849) now matches ONB-23. |
| S9 carousel reactions | CLOSED | ON-01 `118:512` has two reactions only ("Começar" → ON-01b; "Já tenho conta" → AC-04). Frames 2/3 `384:3591` and 3/3 `384:4369` have none. |
| C1 missing links | PARTIAL | Added: ON-08 "Agora não" → ON-V3; ON-V5 → ON-02; PP-01 "Mudar dias ou horários" → ON-12a; PP-03 close → PP-08. Missing: ON-V7 actions (no reactions); AC-11 → ON-02c; ON-02 back → ON-15 (the chevron is drawn but has no reaction); ON-12b conflict → ON-12c. New gaps: nothing links ON-15 to ON-15b, ON-15d or ON-V5, or AC-04 to the AC-04f variants; ON-02b `300:2971` lost all its reactions in the rebuild. |
| C2 edit path from PP-01 | PARTIAL | Op 15 states the path (on application). The PP-01 note `122:1548` says "volta a ON-12a e recalcula a proposta". The ON-12a/12b notes do not say that Continuar goes to ON-16 → PP-01 in edit mode. |
| C3 "Recomendado" gaps | CLOSED on application | Ops 7 and 24: reason templates for rules 1–4; "corrida de desempenho sem data" mapped to "Correr mais rápido" / "Correr mais longe"; ON-14b's reason is its own description. The ON-06 note `120:1177` says the drawn state is after the tap, with the reason under the option. |
| C4 ON-12c scope | PARTIAL | The ON-12c note `400:13235` states the scope and the re-ask. The CF-04 note `178:4091` still promises per-day fine-tuning, but no frame shows it. |
| C5 analytics wording | CLOSED on application | Op 1. |
| C6 smaller states | PARTIAL | Done: AC-04d bound to its pending sign-up (`276:2856`); the AC-11 note `251:2218` covers the Apple Saúde grant made before the account. Open: ON-16 offline after the account is still copy only (`122:1547`), with no state and no exit. |
| C7 record accuracy | CLOSED | DECISIONS_DRAFT line 3 is a history header. ONBOARDING_V2 line 32 states the ON-06 exception. |
| C8 Founder-facing summary | CLOSED | CHECKPOINT, "Facts the Founder should know", states the three facts plainly. The Chief delivers it. |

## New findings in this delta

**N1 — fix before applying op 23.**

- **Finding.** Op 23 (UXS ONB-11) gives the referral line to "volta de pausa" too.
- **Evidence.** In the Figma, a pause with the switch off (`444:4793`, note `444:5015`) has no referral line. Only "Dor ou lesão" with the switch off (`444:4889`) has one.
- **Impact.** As written, product truth would contradict the Figma and send a person back from travel to a professional.
- **Fix.** Replace the `to` text with:

  > "…sem ele nada é guardado, a resposta vale como desconhecida e a pessoa pode autorizar depois em Perfil — o plano não a trata como “sem restrição”; em dor ou lesão, uma linha neutra recomenda avaliação profissional. |"

  Then regenerate the UXS `postSha256`. Scope the "Sem autorização (ON-15d)" sentence in the ON-15 note `122:1546` the same way.
- **Re-check.** A Product/UX spot check of this one op is enough.
- **Owner:** OB-2 author.

**N2 — SHOULD.**

- **Finding.** The ON-15 note says "Voltando de pausa → pergunta o motivo e quanto tempo".
  - No frame draws this question, and the page has no such text.
  - Its place (inline or a separate step) and its categories are undefined.
  - The after-act frame `397:4845` links straight to ON-02.
  - ONB-11 does not mention it. ONB-01 requires a named consumer for every question.
- **Recommendation.** Remove the question from onboarding. The recent-practice answers on ON-09/ON-10 already set the starting point, and "sem repor o volume antigo" holds by construction.
- **Alternative.** Name its consumer, and draw it inline after the act with coarse options and an exit to ON-02.
- **Owner:** OB-2 author.

**N3 — COULD.**

- The condition "a chosen day cannot be a supported session" has two homes:
  - ON-V7b, on the device (`400:4794`);
  - ON-V7, on the server after the account (`126:2079`).

  Give it one home. Say that the server never re-asks a choice the person already confirmed on ON-V7b.
- Before the account, "Trocar a meta da corrida" continues to ON-14. It should let the person pick the new goal.
- The before-account ON-V7 variant, with its CTA, is not drawn.

**N4 — COULD.**

- **Destination name.** Three names are in use:
  - the ON-12a copy says "Perfil › Rotina";
  - UXS ONB-09 keeps "Você › Rotina", and op 25 leaves it;
  - CF-04's back label is "Você".

  Pick one user-facing name.
- **Afternoon training.** A person who trains in the afternoon edits a range under "Almoço" or "Noite". The Designer may revisit the labels.

**N5 — SHOULD; SSCTR owns the wording.**

- **Finding.** Ops 4 and 26 drop "load" from the list of what keeps progressing.
- **Why it matters.** The Founder named it: "progressão de carga… deve continuar evoluindo normalmente".
- **SSCTR's reason (C3.4).** Load restarts when a lift changes.
- **Fix.** Scoping keeps both points: "a carga dos exercícios que ficam, séries, repetições e esforço seguem evoluindo…; quando um exercício muda, a carga do novo começa por um ajuste pelo esforço" (and the equivalent in op 4).
- **Not blocking.** The ON-14b footnote, "Em qualquer opção o treino continua evoluindo", is fine.

**N6 — observation for the Chief, not a product finding.**

- CURRENT_MISSION.md's SHA-256 is now `f054b2a2…`. R6's baseline recorded `54dc19b4…`.
- The only post-baseline content I can identify is the OB-2 block: line 150 names R6, and the file's mtime is 10:53.
- The `product/` ops were held for exactly this reason. If R6 compares hashes when it closes, it will see this change.

## Rubric (PRODUCT_ARCHITECTURE 1.0.0) on this revision

| Criterion | Round 1 | Now |
|---|---|---|
| Need / outcome | PASS | PASS |
| Canonical ownership | PASS with S3 | PASS. S3 closes on application; N4 is a naming nit. |
| Architecture / navigation | PASS with S5, S9 | PASS. S5 and S9 are closed. |
| Journey | FAIL (M1, M3) | **PASS.** M1 and M3 are closed; N2 is a residual. |
| Hierarchy | PASS | PASS |
| States | PARTIAL | PARTIAL, not blocking: S6, C6, N2, N3. |
| Terminology / invariants | PARTIAL | PASS on application, with N1 fixed first. N5 is SSCTR's wording. |
| Alternatives / proof | N/A | N/A |
| Handoff | PARTIAL | PARTIAL: S7 (ledger entry, R6 owner timing). |

## Handoff to the Designer (VISUAL_READY)

- **Revision.** Figma `TYR10AIrquCpKvKL3eyXyO` as read on 2026-10-26. The plugin API offers no pinnable version.
- **Nodes.**
  - Account step: ON-02 `118:655`, ON-02b `300:2971`, ON-02d `397:4963`, ON-02c `397:13488`.
  - Draft and sign-in: AC-04 `250:1868` and note `250:2080`; AC-04f `300:2889`, `445:13343` and `445:13387`; ON-01r `386:4394`.
  - Limitation branch: ON-15 `122:1156`; ON-15b `444:4793` and `397:4845`; ON-15d `444:4889`; ON-V5 `126:1734`.
  - Elsewhere: AD-04 `148:1717`; CF-04 `178:3793`.
- **Decisions carried.** PDR-1.7 (DR-110–116), plus the held ops 1–34 with N1 applied.
- **Constraints the visual work must keep.**
  - One draft per device. Only the explicit erase restarts it.
  - Signing in erases the draft only after success, with ON-02c.
  - The purpose act comes before any limitation detail.
  - ON-02 is the single source of the account step.
  - Chosen days are hard constraints. Another day is only an explicit, labelled, one-off exception.
  - "Recomendado" never pre-selects.
- **Open for the Designer:** C1 links, C4 per-day tuning frame, C6 offline state, N3 before-account ON-V7 variant, N4 naming.
- **Open for others:**
  - N1 and N2: OB-2 author.
  - S6 Q4 COULD: Security.
  - S7 and N6: Chief.
  - N5: SSCTR.
  - 2-week rotation scope: Founder.

## Founder

Nothing new needs the Founder.

- The 2-week rotation scope stays open as surfaced: DR-113, the PDR open list and the ON-14b note `400:13230`. I did not re-decide it.
- The unexplained ON-02 regression is already in the CHECKPOINT's Founder facts.

## What I checked and how

- **Read.**
  - CORE, the constitution and the rubric.
  - The round-1 review, FOUNDER_REQUEST, and ONBOARDING_V2 ("Round 2" and "Concurrency note").
  - The held JSON, and the apply script (read only).
  - CHECKPOINT and the DECISIONS_DRAFT header.
  - The PDR-1.7 block, and UXS §6 (ONB rows and §6.2).
  - R6's TASK_CONTRACT and the mission entries in its BASELINE.
  - The round-1 SSCTR binding Q3 lines.
- **Deterministic checks.** I used my own read-only script in the scratchpad; nothing was written to `product/`.
  - All 8 target files match their `preSha256`.
  - Each of the 34 `from` texts occurs exactly once.
  - Applying the ops in memory reproduces all 8 `postSha256` values.
  - I searched the post-op copies for leftover "disponibilidade".
- **Figma, read-only** (`use_figma` scripts and `get_screenshot`).
  - Visible text and every reaction of:
    - ON-01, its 2/3 and 3/3 frames, ON-01r and ON-01s;
    - ON-02, ON-02b, ON-02d and ON-02c;
    - AC-04, AC-04d and the three AC-04f frames;
    - ON-15, both ON-15b frames, ON-15d and ON-V5;
    - ON-V7, ON-V7b, ON-12a, ON-12b, ON-12c, ON-06, ON-14b and PP-01;
    - AD-04 (page 4), and CF-04 and CF-01 (page 6).
  - Every reaction on page 2 that targets a branch frame.
  - 36 notes.
  - Screenshots of ON-15, both ON-15b frames, ON-15d and ON-02.
  - A search of page 2 for a pause follow-up question.
- **Versions.**
  - FOUNDER_REQUEST `a94132ba…fdc`; ONBOARDING_V2 `dc5ef14f…d1c`; PENDING_DOC_CORRECTIONS_R2 `be103e0c…eea`.
  - CHECKPOINT `732dbf8f…984`; round-1 review `014addca…f63`.
  - The `product/` targets are at their `preSha256`: PDR `d9ea31a1…`, UXS `8d91e765…`, AEOS `08149de6…`, AEC `1db3b0e0…`, SIS `2f5179ae…`, STIL `2d6d20b7…`, CORE_FLOWS `e054cde8…`, PRODUCT_ARCHITECTURE `1a7182d8…`.
  - R6 is still open: there is no `FINAL_DISPOSITION.json`.
- **Not covered.**
  - Visual quality, motion and accessibility (UI gate).
  - Security sufficiency (Security).
  - The scientific soundness of the copy (SSCTR).
  - Playing the prototype: reactions were read, not clicked.
