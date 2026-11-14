# V1 Run Extensions — Fase A: candidato (Run Workout Structure + Athlete Data Foundation), 2026-11-13

**Autor:** Fable 5.2, como Chief/implementador. **Para:** juízes SSCTR, QRE e Data/Security; Founder.
**Linha:** `claude/v1-run-extensions`, a partir de `9769455`. Nada foi enviado (push) nem mesclado.
**Estado:** candidato sintético para revisão. `V1X-RUN-NATIVE` está **desligado** por padrão: não existe registro SSCTR habilitador, e o autor não o emite.

## 1. O que existe agora

| Arquivo | Papel |
|---|---|
| `CoachingCore/src/r6-adaptation.mjs` | **Única emenda** de arquivo congelado: `bindObservations` recebe o leitor de conclusão (chave `READS_COMPLETION`), levado às cinco vinculações. 10 linhas trocadas, 12 acrescentadas (declaração e comentário). |
| `CoachingCore/v1/RUN_FORMATS_V1.json` | Valores r2 ← r3 ← r3a, fixados por sha256 (`5ca33b9b…a60d`). |
| `CoachingCore/src/v1-run-format.mjs` | Modelo de etapas, expressão TIME, envelope E1–E3, catálogo, seletor, dimensionamento CT-1..CT-3, leitor de conclusão, contrato `execution`, registro de formatos. |
| `CoachingCore/src/v1-run-history.mjs` | Fatos de distância, `historyReference`, `runHistoryRecord`, L30, longão comparável, S3. |
| `CoachingCore/src/v1-run-format-index.mjs` | Ponto de entrada composto sobre `v1-run-index` (que continua intacto). |
| `CoachingCore/scripts/v1rws-freeze.mjs` | Verificador próprio (preflight V6). |
| `CoachingCore/test/v1rws-*.test.mjs` | 49 testes novos em 5 arquivos, mais `v1rws-helpers.mjs`. |

Composição: `v1-run-format-index → v1-run-index → v1-index`. Saídas novas: `runSessions`, `runFormat`, `runFormatRecord`, `runHistoryRecord`. As chaves de `v1-run-index` voltam como estão.

## 2. Decisões de engenharia que diferem da letra dos contratos (para o QRE julgar)

**D-1. O leitor é entregue ao motor; nenhuma leitura é gravada na observação.**
- O handoff (§5) descreve `actual.completionRead` recalculado e injetado em cada observação antes do motor.
- Implementado: o ponto de entrada passa a **função leitora** pela chave interna, e `bindObservations` a chama sobre a linha canônica, depois de o motor fundir duplicatas.
- Motivo, verificável: o motor funde o relato do app com a importação do Apple Saúde da mesma sessão (`mergeActual`). Uma leitura calculada por observação, antes da fusão, não vê os fatos fundidos (o relato do app cita o formato e não tem distância; a importação tem distância e não cita o formato).
- Consequências: nenhum `completionRead` existe no registro; o `inputHash` do motor e a identidade de replay não mudam (R2 do preflight deixa de existir); um valor forjado é inerte em qualquer ponto de entrada.
- O que continua igual ao handoff: só `r6-adaptation.mjs` muda; sem a chave a saída é byte a byte a de hoje; qualquer `completionRead` recebido é apagado, na revisão e no registro carregado; a chave nas opções do chamador é descartada.

**D-2. Modo EQUIVALENT não implementado** (o handoff §7 o declara opcional). Onde o catálogo cairia nele, a sessão sai em TIME com `NO_FORMAT_WITHIN_ENVELOPE` e o detalhe `EQUIVALENT_MODE_NOT_PART_OF_THIS_EXTENSION`.

**D-3. Horizonte de entrega.** `runSessions` traz a semana em vigor e as duas seguintes, e só o que está no `runFormatRecord` é entregue. Um relato nunca cita um formato fora do registro.

**D-4. Formato fixo na semana.** O formato entregue por uma seleção enquanto a semana estava em vigor é reentregue igual, salvo dose replanejada pelo motor ou estado que o retira para tempo (retirada imediata).

**D-5. Um formato que expressa outra dose** (o motor replanejou a sessão depois) não dá crédito por distância: vale a leitura por minutos contra a dose atual.

**D-6. Contrato de fatos do relato nativo.**
- `actual.distanceKm` é sempre medida de aparelho ou percurso. Um número manual nesse campo num relato nativo dá UNKNOWN (`DISTANCE_SOURCE_REQUIRED`); a declaração vai em `actual.declared`.
- Uma correção com motivo da lista fechada é gravada com `gpsQuality: 'POOR'` pelo ponto de entrada (a marca do aparelho fica em `deviceGpsQuality`), para a V1RC nunca a ler como evidência de ritmo. O valor medido não muda.
- Segundo arquivo de uma mesma corrida: `actual.segments[]`.
- A triagem de sinais depois de uma parada por sintoma só conta como respondida por uma revisão cuja triagem foi avaliada **depois** de o registro ter recebido a parada.

**D-7. P1.** A faixa leve observada vem da própria V1RC (a faixa EASY que ela dá ao mesmo registro quando nenhum resultado a calibra). Não é recalculada aqui.

## 3. Achados para os juízes

**F-1 (SSCTR). Exemplo WE-17 da r2 diverge da regra escrita.**
- `values.candidateOrder.MIXED`: "distance unit coarsest first; then longer distance first". Para 2 × 15 min na faixa 5:20–5:30, tanto 2600 m (múltiplo de 200) quanto 2700 m (só de 100) passam em E1–E3.
- A regra escrita dá **2600 m**. O exemplo do próprio registro dá 2700 m.
- Implementado: a regra escrita. Nenhum outro dos 34 exemplos distingue as duas ordens. O teste T13 nomeia a divergência e falha se qualquer outro exemplo divergir.
- Pedido: o SSCTR decide qual vale. Se for o exemplo, a ordem muda no ciclo corretivo.

**F-2 (QRE, Founder). Um teste histórico falha na linha comum, por desenho.**
- `test/v1rc-calibration.test.mjs:325` ("COACHINGCORE-V1-FREEZE-1 is preserved") é um verificador do freeze escrito como teste, dentro de um arquivo que o freeze V1RC vincula. Ele exige os 198 arquivos idênticos.
- Com a emenda autorizada, ele acusa exatamente `CoachingCore/src/r6-adaptation.mjs` e nada mais. Suíte na linha: **1383 de 1384**.
- Não foi editado (regra de governança do Founder de 2026-11-13; parada S8). No snapshot `c8104c1` ele continua verde (1334/1334).
- O preflight (V6) previu isso para o script `v1rc-freeze`, não para este teste dentro da suíte. O critério do handoff §11.1 ("suíte inteira verde") não se cumpre ao pé da letra na linha comum.
- O teste novo I10 prova o invariante corrigido: 197 arquivos idênticos, o arquivo emendado parte dos bytes registrados e cada linha trocada só acrescenta o leitor; 30/30 do V1RC.

**F-3 (Security/Data). Os registros da extensão são levados pelo cliente, sem chave.** `runFormatRecord` e `runHistoryRecord` têm integridade por hash de conteúdo, que qualquer cliente recalcula. Um formato fabricado e coerente seria lido. É o mesmo modelo de confiança do `actualLedger` fora da custódia. A custódia hoje guarda só os campos do motor (G7): guardar os três registros sob a cadeia com chave é condição de integração.

## 4. Onde cada teste exigido está

| Exigido | Arquivo e teste |
|---|---|
| T1, I1 | `v1rws-engine`: "I1, T1" (4 jornadas, desligado e ligado) |
| T2 | `v1rws-engine`: "T2 through the engine" |
| T3 | `v1rws-engine`: "I7, T3" e "T3: custody" |
| T4, T5, T9, T11, T12 | `v1rws-format` |
| T6, T16, T18, T19, I2, I5, I7, I9, I10 | `v1rws-engine` |
| T7, T8, T10, T14, T15, T17, T20, I3, I4, I6 | `v1rws-execution` |
| T13 | `v1rws-ssctr-examples` (r2, r3, r3a lidos dos JSON) |
| H1–H6 | `v1rws-history`; H8 em `v1rws-execution` ("I3, H8") |
| I8 | Só o gancho inerte (`BAND_OF`, teste "I9, V4"); a revisão de ritmo é da fase B |
| H7, H9 | Fase B, não implementados |

## 5. Preparado para a fase B, sem implementá-la

- `runSessions[id].execution`: status, base, alvo, medido, declarado, `extentKm`, minutos reais e estimados, `aboveEstimate`, `paceEvidence`, e o peso de planejamento de cada etapa principal com `targetMet`.
- `completed` em `execution` é o predicado SC-1 (linha vinculada pelo motor), nunca o `actual.completed` cru.
- `UNKNOWN` nunca vira concluído. O tratamento semanal na previsão fica para o SSCTR da fase B (V5).
- Gancho `BAND_OF` para a faixa efetiva (IC-2), inerte.
- H9: `experienceDeclared` e `experienceBasis` do intake canônico continuam intactos no programa; a RFC deve lê-los.

## 6. Dependências do aplicativo iOS (nenhuma implementada aqui)

1. Histórico do onboarding com `distanceKm`, data, `canonicalActivityId` e `measurement` (`TREADMILL` para atividade indoor); `historyWeeks` com as semanas realmente cobertas.
2. Preservar o UUID do HKWorkout em `canonicalActivityId` e `source.activityId`; nunca enviar o mesmo UUID vinculado e solto.
3. Ignorar na importação os treinos de origem própria, se o write-back for adotado.
4. Declaração manual em `actual.declared{distanceKm}`, sem `actual.distanceKm`; correção com `declared.reason` da lista fechada.
5. Recordes com data, `measurement` e `tolerated`.
6. Experiência em meses (`runTrainingMonths`), sem a categoria junto.
7. Esforço percebido também para corridas importadas (PD-1 continua pendente).
8. Corrida importada fora do plano com `actual.sport: 'RUN'`.
9. Citar `actual.formatHash` só quando o atleta executou o formato nativo (inclusive ao vincular uma importação); sem ele, vale a versão por tempo. Voltas por etapa em `actual.steps`; parada em `actual.stop{reason}`.
10. Guardar e devolver `runFormatRecord` e `runHistoryRecord` a cada revisão; chamar o Core ao menos uma vez a cada duas semanas para que os formatos a executar estejam no registro.
11. Peso, altura e sexo continuam contexto, sem consumidor de dose.

## 7. Pendências que não são desta fase

Registros habilitadores (emitidos pelo juiz SSCTR); persistência dos três registros na custódia (Data + Security); copy e fluxos ASK (Product); PD-1..PD-3; cobertura nativa parcial em 5K e 10K (informado no handoff); fila humana em 235, sem anexos; `V1_COACHING_AUTHORITY_READY = NO`, `INTEGRATION_READY = NO`.
