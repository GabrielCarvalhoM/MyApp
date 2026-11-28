# F08 · Adaptação e segurança ("Não estou 100%", prontidão, bloqueios)

**Situação:** IMPLEMENTADO em C (inc. 04, correções SSCTR/QRE no inc. 08) · recheck independente do inc. 08 em andamento. Issue: #12 (fluxos),
#9 (gates). Revisão SSCTR obrigatória para mudança de regra.

**Objetivo.** O atleta informa como está; o motor decide manter, modificar, perguntar, bloquear ou reiniciar; a UI só apresenta.

**Comportamento.** "Não estou 100%": condição (Indisposição · Resfriado ou outra doença · Incômodo no corpo) → `warningSignSet(condition)` →
pergunta exatamente o conjunto do motor, omite o não respondido → `submit`. Resultado lido do status do motor: KEEP → mantido; MODIFY →
modificado; ASK → precisa de respostas; clínico → bloqueado; desconhecido → falha fechada. Prontidão após bloqueio: 15 sinais (`READINESS`);
"de volta" só em `READINESS_RESTART`/RETURNING. Adaptação semanal (proposta) em F05.

**Aceite.** Nenhum texto de resultado sem o status do motor · nenhuma rota "de volta" em ASK · bloqueado = sem prescrição.

**Contratos.** `warningSignSet`, `SignAnswers`, `ReviewRequest`. **Figma.** 72 `843:1696`, `843:1751`, `843:1923`, `843:1980`; bloqueios `849:3994`, `805:410`, `645:749`.

**Testes.** `testNotFeeling100AsksTheEngineSignsForTheCondition`, `testBlockedReadinessAsksFifteenSignsAndReturns`; unit
`testNotFeeling100AsksExactlyTheEngineSetAndOmitsUnanswered`, `testNotFeeling100OutcomeReadsTheEngineStatus`, `testWriterRoutesNotFeelingBySigns`.

**Segurança.** `readiness.*`, `state.blocked.action`: CLINICAL_HUMAN_REQUIRED (G04); textos `.interim` até revisão clínica.

**Pendente.** ViewModels (ARCHITECTURE §4 #3) · revisão clínica humana dos textos · REAL_ATHLETE_READY = NO.
