# R7-C · Fase 2 — checkpoint (2026-11-01)

Autoridade: pedido direto do Founder de 2026-11-01 para a Fase 2, com as decisões 1 (o mecanismo factual de R18, C15 e CQ-R6-04 é da R7-C; o G03 fica só com a interação) e 2 (opção A, envelope atual). Implementação no runtime de referência shadow. Sem freeze, sem review independente, sem Fase 3.

## R7C_PHASE2_STATUS

`COMPLETE`.

## BASELINE

- Branch `claude/domain-coaching-r7-c`, no worktree `.claude/worktrees/domain-coaching-r7-c`. HEAD inicial: `b53d0d7`, o checkpoint da Fase 1.
- Runtime, testes, policy e catálogo idênticos ao R7B2-FREEZE-1 (`1a1c728`, em `baa2cb1`). Conferido com `git diff 1a1c728 HEAD` vazio em `src/`, `test/` e `package.json` antes da primeira edição.

## REBASELINE_RESULT

Sonda [`probes/phase2-rebaseline.mjs`](probes/phase2-rebaseline.mjs), só leitura. Rodada sobre os bytes do freeze ([saída](probes/phase2-rebaseline.on-R7B2-FREEZE-1.out.json)) e sobre o runtime da Fase 2 ([saída](probes/phase2-rebaseline.on-R7C-PHASE2.out.json)).

- **D1 / CQ-R6-16: REPRODUCED.** No H19 S4, a terceira sessão de qualidade adversa, com função prejudicada no dia seguinte, ainda dá KEEP no meio da semana. Com a semana 5 sem review, a regressão da qualidade só chega no review da semana 6, uma semana depois do caminho revisado. Os dois caminhos convergem na semana 7, sem crédito e sem zero. Não absorvido: ver REMAINING_FINDINGS 1.
- **D2 / CQ-R6-19, parte de registro: REPRODUCED.** No H22 S2, o longão movido e executado ficava em HOLD por causa da sessão de origem. No H17, um relato de "não feito" era registrado como PARTIAL. Absorvido no G01.
- **D4 / pausa declarada × lacuna: REPRODUCED.** Uma pausa declarada de 35 dias prescreve o reinício (15 → 20 → 25), e uma de 28 dias a reentrada (15/20 → 25 → 30 com qualidade). A lacuna desconhecida de mesma duração recebia 15/15/15 → 15/15/20 em modo EASY, sem triagem de causa e sem os passos de volta: era tratada como parada, mas sem as regras da parada. Absorvido no G01.
- **D5 / CQ-R6-14: REPRODUCED.** H34 e H20 dão decisões e propostas idênticas com consentimento ligado e desligado, em todos os passos. Nenhum padrão aprendido aparece. O H35 (e o H23) ficam UNSUPPORTED no freeze: os registros SSCTR da B0 vencem em 2027-04-30 (`review_by`) e as datas desses casos são de 2027. Isso é anterior à R7-C. Absorvido no G02.

## IMPLEMENTED

G01, uma leitura factual única: o desconhecido não é sucesso nem falha.
1. **ASK tipado na janela de corrida desconhecida** (`unknownRunWindow`, em `composeWeeks`). Vale para a primeira semana que uma decisão compõe, quando ela começa em modo EASY. O ASK sai quando três coisas se juntam:
   - nenhuma corrida concluída é conhecida nos 30 dias do teto de corrida isolada;
   - a entrada revisada (15 min) cortaria uma corrida planejada;
   - a janela tem sessões de corrida já passadas, sem nenhum relato, fora de uma interrupção declarada.

   A resposta é `ASK`, com `missingInputs: ['observations.unreportedSessions|interruption']` e `question.kind = UNREPORTED_TRAINING` (escopo dependente `RUN_DOSE`, janela, sessões sem relato, última corrida registrada). Não há proposta: nem a dose de entrada (zero), nem a projeção (crédito). Vale para todo handler que compõe: weekly review, mudança de agenda, de objetivo ou de data de prova, rearranjo aprendido, retirada de graduação, re-plan factual e retorno SHORT. Reinício, reentrada e walk/jog seguem a própria receita. Uma interrupção declarada conta como parada conhecida.
2. **Rótulo do C15.** Se a semana foi executada como planejado, mas as corridas seguintes diferem do plano, o weekly review dá `MODIFY`/`GATED_NEXT_STEP` e diz que o plano foi re-baseado. Nunca dá `KEEP` como instanciação.
3. **QE-R7B-R2-05.** O cap de densidade de novato começa no caminho de semana lida só pelos fatos do redutor de evidência, como na regra semanal. Só evidência executada o libera.
4. **Fidelidade do registro (D2).**
   - Uma sessão movida (`SKIPPED` com `movedTo`) deixa de ser linha própria, a menos que tenha relato de execução. O gate segue a sessão para onde ela foi.
   - Um relato de "não feito" vira `MISSED`, não `PARTIAL`.
   - Um pulo sem movimento mantém a linha e o HOLD da R6.

G02:
5. **Manutenção aprendida do longão** (`learnedMaintenance`, em `evidenceStart`, com registro no weekly review e no rebuild). Ver G02_RESULT.

## G01_RESULT

| Caso | Antes (freeze) | Depois |
|---|---|---|
| R18: semanas 2–6 sem review ou revisadas vazias; review da semana 7 sem relato | MODIFY com 15/15/15, depois 15/15/20 | ASK tipado, sem proposta; vazio ≡ sem review |
| C15: semana 7 executada depois das semanas 3–6 sem review | KEEP / INSTANTIATE_LOGGED_LOADS (instantiationOnly) sobre uma proposta que já tirava o crédito | MODIFY / GATED_NEXT_STEP, "re-based, not kept"; doses iguais, já vinham da evidência |
| C15: mudança de agenda; CQ-R6-04 (H25): mudança de data de prova | corrida colapsada em 15–25 min antes da prova | ASK |
| Retorno SHORT depois de semanas nunca relatadas | 15/15/15 (contradiz "retomar as últimas doses executadas") | ASK |
| R2-05: semana 1 sem review | semana 2 sem cap (LOWER, LOWER_B, UPPER, UPPER_B) | com cap (CORE, CORE, FULL_A, FULL_B), igual aos caminhos revisados |
| H22 / H17 | LONG HOLD / PARTIAL | LONG ADVANCE / MISSED |
| Pausas declaradas (D4) e retornos MODERATE e LONG | — | sem mudança |

## G02_RESULT

**A decisão que pode mudar:** o passo do longão na transição para uma semana de desenvolvimento (BUILD ou DEVELOPMENT, classe BUILD, modo EASY). Com consentimento, o passo fica retido quando a prescrição idêntica que ele alcançaria tem uma associação adversa estabelecida no Athlete Model:
- mesma prescrição, mesmo pool de arranjo, classe BUILD e até 56 dias;
- confiança EMERGING ou STRONG, direção ADVERSE, nunca MIXED.

Nesse caso o longão fica na dose executada por último. Exemplo: dois ciclos falham a 70 min, e a semana 13 fica em 65 min em vez de 70. A retenção cai sozinha quando a associação expira ou fica mista.

**Limites:**
- só escolhe entre HOLD e ADVANCE/EARNED do LONG, e nunca fica acima do início populacional;
- nenhuma dose, threshold ou tamanho de passo novo;
- nunca entra em SPECIFIC, TAPER, RACE_WEEK, POST_EVENT ou NEXT_BLOCK, nem em retorno, reinício ou walk/jog;
- o texto diz "an association, not a cause";
- com consentimento desligado ou revogado, nada acontece, e os fatos ficam.

Envelope: R6-PARTIAL-NOISY-LEARNING ("inform hold"), condições r12 8 e 13; AEC §1.3.

## SAFETY_INVARIANTS_PRESERVED

1. A rota clínica vem antes de qualquer pergunta nova. Testado com pain, retorno ILLNESS e substituição com dor depois da lacuna. 13/13 em `r7b2-clinical-precedence`.
2. CLINICAL_HUMAN_REQUIRED não tem proposta, e o estado pendente é mantido.
3. A continuidade não atravessa o hold clínico: nenhuma decisão nova planeja durante ele.
4. Evidência tardia só revisa o futuro: as semanas 0–7 ficam idênticas depois dos relatos tardios.
5. Aprendizado não é dose: só mantém uma dose executada.
6. Aprendizado não é causalidade: `causal: false` e texto associativo.
7. Ausência não é adversa: reviews vazios só dão HOLD, sem adversos.
8. Ausência não é sucesso: nenhum crédito de corrida, força ou cap.
9. A autoridade de taper e race week fica intacta: nada aprendido entra em semanas de evento.
10. Nenhum caminho novo lê as leituras clínicas incompletas da B.2.

Bytes de R6-POLICY-5 e R7B0-CATALOG-2, `product/`, `canon/` e a fila (230) não foram tocados. Nenhuma closure foi reaberta.

## TESTS

- **Novo:** `CoachingCore/test/r7c-longitudinal.test.mjs`, com 16 testes (12 do G01, 4 do G02): **16/16**.
- **Segurança dirigida:**
  - `r7b2-clinical-precedence`, `r7a2-interruption` e `r7af-episode-identity`: **36/36**;
  - testes de retorno e reentrada por nome em 7 arquivos: **25/25**.
- **Regressão dos comportamentos tocados**, por nome em 13 arquivos (aprendizado, consentimento, cap e densidade, rótulo de instanciação e KEEP, mover, indisponível, perdida, pulo, conflito): **61/61**.
- **Teste existente alterado:** um único fixture em `test/r6-adaptation.test.mjs`. O retorno SHORT agora roda sobre o programa revisado. Ele só passava no freeze pelo colapso de leitura zero; o caso nunca relatado agora pergunta.
- **Suíte completa:** não rodada (Fase 3).

## FILES_CHANGED

- `CoachingCore/src/r6-composition.mjs` e `CoachingCore/src/r6-adaptation.mjs`.
- `CoachingCore/test/r7c-longitudinal.test.mjs` (novo) e `CoachingCore/test/r6-adaptation.test.mjs` (um fixture).
- `audits/domain-coaching-r7-c-2026-11-01/probes/phase2-rebaseline*` e este checkpoint.
- `CURRENT_MISSION.md` e `MISSION_LEDGER.md`, só por inserção.

## REMAINING_FINDINGS

1. **D1 / CQ-R6-16.** Não há resposta dentro da semana a sessões-chave adversas repetidas. Com uma semana sem review, a regressão chega uma semana depois e converge. O remédio seria uma regra nova de redução dentro do ciclo (SSCTR) ou o check-in proativo (Product/UX), que o Founder excluiu desta fase.
2. **G03 (Product/Data).** Wording, momento e UX da pergunta `UNREPORTED_TRAINING`. O contrato do runtime é o ASK tipado.
3. **Leitura HISTORY.** Numa semana nunca revisada, `historicalStateOf(...).state.run.long` mantém uma liberação não executada (70). Numa semana revisada vazia, ele corta para a prescrição (65). Os fatos (`run.achieved`, modo) e todas as decisões (leitura PLAN) coincidem, e os retornos desfazem liberações. Fica como observação para a Engineering.

## PHASE3_REQUIRED_EVIDENCE

1. Suíte completa (799 + 16). Qualquer asserção existente de caminho R18 que mudar é disposta uma a uma, nunca atualizada em silêncio.
2. Freeze R7-C: registro, source digest e manifest, com script de verificação só de leitura.
3. Diferencial de 848 linhas da B.2 e adversarial com 3.228 checks: nenhuma mudança clínica.
4. Gate R7-A, classes A–E (F1–F4, D53, D56–D59, HOLD, MAINTAIN), conformance da R7-B e closures da B.1 e da B.2.
5. Mutação de `unknownRunWindow`, `runRebased`, do início do cap, de `notDone`/`movedTo` e de `learnedMaintenance`.
6. Holdout como regressão: H34 e H20 (aprendizado); H19, H22, H17 e H21 (longitudinal). H35 e H23 são UNSUPPORTED pela expiração dos registros.
7. Gates:
   - SSCTR, obrigatório: a semântica esportiva do ASK depois da lacuna e da manutenção aprendida, e se as aprovações sob o contrato de weekly review continuam valendo;
   - Engineering independente;
   - Quality só se necessário.

## DO_NOT_REOPEN

- A ausência de relato não vira zero nem crédito. Quando a dose segura depende dela, a resposta é o ASK `UNREPORTED_TRAINING`. Vazio ≡ sem review.
- A pausa declarada e a lacuna desconhecida continuam fatos diferentes.
- O aprendizado só escolhe entre resultados já autorizados, com consentimento.

## GIT_STATE

Commit local na branch `claude/domain-coaching-r7-c`, sem push. O SHA está no `git log` da branch.
