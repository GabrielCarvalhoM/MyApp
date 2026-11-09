# Task contract: V1CP FIX-FORWARD (V1CPFF-TC-r1, 2026-11-09)

**Authority:** the Founder's direct request of 2026-11-09, summarized here and not copied. It continues V1_COACHING_PRODUCTIZATION (closed CLOSED_NOT_READY at `8039d94`; last reviewed runtime `5ee9dec`). R7-D stays closed; R7D-FREEZE-6 is a historical reference only.

**Objective:** fix the named blockers NB-1..NB-6, SB-1..SB-5 and QRE-V1CPR-02/-05/-06 at their cause, apply the Founder's decisions D1–D7, keep every capability that works, and deliver one reviewed candidate.

**Authorized:** CoachingCore runtime fixes with RED-then-GREEN directed tests; the full CoachingCore suite; a differential against R7D-FREEZE-6 for regression only; seven synthetic F08 journeys; the authority delta for RC-16 and the Founder decisions (PCG); one SSCTR decision on the sporting mapping of D1, D3, D4, D6 and the routed rulings; one independent review round (SSCTR, QRE, Security); an integration-contract delta where a fix changes what the app consumes; a candidate and a freeze if the review is favourable.

**Not authorized:** reopening R7-D or writing under `final/` or `final2/`; editing any freeze record or earlier judgment; Figma edits; the iOS app, Apple Health, wearables, Crew, gamification or new sports; new agents; new research programs; a new holdout; a push or a merge; recursive deletion; real data collection.

**Branch:** `claude/v1cp-fix-forward` from `8039d94`, in worktree `.claude/worktrees/v1-coaching-productization`. The old branch stays at `8039d94`. The human queue stays at 235 unless the Founder appends.

## Founder decisions (2026-11-09), summarized

- **D1, low-friction return.** The athlete says they are better; a short check fit to the context; a conservative return when eligible; executed sessions then decide how much and when to progress. No daily questionnaire; no watch, exam, certificate or physical test for any conservative return. Quote: "A escolha de uma retomada mais rápida não autoriza voltar automaticamente às doses anteriores apenas porque o prazo de redução terminou." and "A ausência de um registro não significa automaticamente intolerância ao treino, mas também não pode justificar uma progressão que dependa de evidência ainda não obtida." This answers FP-4.
- **D2, three speeds** (conservative, balanced, faster) kept, distinct where there is margin, never artificially aggressive, temporary and separate from the coach profiles.
- **D3, a race during a return.** Quote: "Uma prova cadastrada deve continuar visível no calendário, mas não deve ser automaticamente considerada adequada ou autorizada pelo motor durante uma retomada incompatível." Paths: move or update the date, remove it from the plan, or keep the event registered "sem transformá-lo automaticamente em prescrição ou autorização para competir". If kept, the app separates the personal decision to take part from the recommendation the coach can sustain. No endless ASK, and eligible training is never blocked. This resolves NB-2.
- **D4, early end of a reduction.** Quote: "O usuário pode informar que se recuperou antes dos três dias inicialmente previstos." It opens a short check, presumes no clinical recovery, and never bypasses limits, contraindications or restrictions in force. "A janela inicial de 3–14 dias permanece como escolha de redução, não como uma obrigação de permanecer indisposto por três dias." RC-16 is adjusted with the PCG.
- **D5, warning-sign wording.** Interim, clear, non-diagnostic: stop and seek an appropriate professional assessment; for potentially serious signs, urgent care proportional to the risk, with no invented diagnosis, urgency class or clearance; the existing instrument and criteria; wording that depends on pending clinical authority stays marked for review before real use; mild indisposition is never an emergency.
- **D6, the Demanding coach.** Real, observable, admissible difference, for example a choice among already authorized alternatives or a progression strategy inside the validated envelope; no invented numbers, no faster progression without support, no reopened rejected decisions. If none exists, the limitation is recorded and Demanding is not declared functionally complete or presented as distinct prescriptive behaviour in V1.
- **D7, the 12 SSCTR queue proposals** (HQ-V1CP-SSCTR-Q01..Q12): a traceable disposition each (relevant to a current blocker, future improvement, or already covered); no automatic missions, rounds or governance steps.

## Units

| Unit | Level | Owner | Independent judge | Stop when |
|---|---|---|---|---|
| Sporting mapping of D1, D3, D4, D6, D7 and the rulings QRE routed (-05, -09, -10), the lexicon revision (CF-1), the urgent-sign set (D5) | L3 | SSCTR (decision) | the final SSCTR recheck (fresh instance) | one decision record, no new number |
| Authority delta: DR-148 amendment for D1–D6, RC-16 | L2 | PCG (author) | Chief consolidation against the Founder's words | deltas restate the decisions only |
| NB-1..NB-6, SB-1..SB-5, QRE-V1CPR-02..-10, CF-1 engineering | L3 | Chief / Engineering | SSCTR, QRE, Security (one round) | RED on `5ee9dec`, GREEN after, suite green, differential explained |
| F08 journeys A–G | L2 | Chief / Engineering | QRE, SSCTR (in the round) | each journey runs end to end on synthetic data |
| Integration-contract delta | L1 | Chief | Security (fields), QRE | every changed field, state or option listed |
| Candidate and freeze | L2 | Chief | the round's verdicts | all three favourable, or close with the named blocker |

**Cycle bound:** one review round on the consolidated candidate. A new failure is classified; at most one narrow fix cycle, only for a new, narrow, runtime-only blocker, with a narrow recheck; anything else closes with a named blocker (Founder rule, 2026-10-26). No automatic further round after closure.

**ESCALATE_IF:** a medical document needed; a clearance claimed; a relevant sign ignored; a new number without evidence; a strategic or subjective choice that is the Founder's and is not covered by D1–D7.

**States kept distinct in every report:** implementation done; technical validation passed; integration readiness; authorization for real athletes; app ready to publish.

## Provenance addendum (PCG-V1CPFF-F08 F04; appended, r1 unchanged above)

The Founder's own words for the decisions summarized above without a quote (mission prompt of 2026-11-09):

- **D2:** "Essas velocidades influenciam a trajetória de progressão, mas compartilham os limites obrigatórios do motor." "A escolha mais rápida deve ter um efeito legítimo quando existe margem para isso." "Não tornar as três velocidades idênticas. Também não criar agressividade artificial para diferenciá-las." "As velocidades são temporárias e independentes do perfil permanente de treinador."
- **D5:** "Adotar linguagem provisória clara, objetiva e não diagnóstica." "Quando houver sinais potencialmente graves, orientar atendimento urgente de maneira proporcional ao risco, sem inventar um diagnóstico, uma classificação de urgência não fundamentada ou uma liberação clínica." "Não transformar toda indisposição leve em emergência."
- **D6:** "O perfil Exigente não pode ser vendido como um treinador funcionalmente diferente se apenas trocar as frases exibidas." "Se não houver uma alternativa técnica legitimamente distinta, registrar explicitamente essa limitação. Nesse caso, o perfil Exigente não poderá ser declarado funcionalmente concluído nem apresentado como comportamento prescritivo diferente na V1."
- **D7:** "Registrar sua disposição de forma rastreável: relevante para corrigir bloqueador atual, melhoria futura ou já coberta." "Não criar automaticamente 12 novas missões, rodadas de validação ou etapas de governança." "Não aumentar o backlog simplesmente por procedimento."
