# V1 Run Extensions — fase B: Race Forecast + Pace Insights, registro do autor (candidato, 2026-11-15)

**Estado: candidato para revisão independente. Não aprovado, não congelado.**
Nenhum registro habilitador existe: as três fronteiras novas estão **desligadas por padrão** e, desligadas, a resposta é a do V1RWS-2 chave a chave. Só dados sintéticos. Nada aqui autoriza atleta real, integração iOS ou produção.

Missão do Founder de 2026-11-15, sobre `claude/v1-run-extensions` em `f32a711` (`COACHINGCORE-V1-RUN-FORMAT-FREEZE-2`, `--check 2` exit 0 antes de começar). Autoridade: `HANDOFF_RACE_FORECAST.md` r3 e `SSCTR_RFC_DECISION_R2.json` (`51bec86b…1fe4`), já nesta linha, byte a byte os de `9ffe163`. Nenhum código antigo foi importado.

## 1. O que foi construído (só arquivos novos; nenhum arquivo congelado foi tocado)

| Arquivo | O quê |
|---|---|
| `CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json` | O objeto `values` da r2, literal. sha256 `eae01117…e840`, fixado no código |
| `src/v1-race-forecast.mjs` | Funções puras: crédito de aderência, f, Γ, as duas faixas, janela, semana da prova, meta × faixa, textos; autoridade por fronteira |
| `src/v1-pace-insights.mjs` | Funções puras: estado por domínio, ação, e a revisão do limiar confirmada pelo atleta |
| `src/v1-run-forecast-index.mjs` | Ponto de entrada composto: `v1-run-forecast-index → v1-run-format-index → v1-run-index → v1-index` |
| `test/v1rfc-*.test.mjs` (5) e `test/v1rfc-helpers.mjs` | 78 testes |
| `scripts/v1rfc-simulate.mjs`, `scripts/v1rfc-freeze.mjs` | Simulação de sanidade; verificador do freeze aditivo (não declara emenda; roda o verificador do V1RWS-2 sem editá-lo) |

Fronteiras: `V1X-RUN-FORECAST`, `V1X-PACE-INSIGHTS`, `V1X-PACE-REVISION`. Cada uma liga só por registro SSCTR independente amarrado ao hash dos valores, em `phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json` (que não existe). As três exigem `V1X-RUN-ESTIMATE` **e** `V1X-RUN-NATIVE`; os insights exigem também `V1X-RUN-PACE`; a revisão exige os insights.

Saída: todas as chaves do V1RWS-2 intactas, mais `runForecast`, `paceInsights`, `paceRevision` e `paceRevisionRecord`.

## 2. A fronteira de evidências (seção 5 da missão)

A fase B não lê o registro do motor por conta própria. Tudo passa pela resposta do `v1-run-format-index`:

1. **Calibração:** a `runCalibration` da resposta, ou o `runCalibrationOf` exportado por ele com o `runFormatRecord` devolvido (para outra semana do mesmo registro). Nunca `v1-run-calibration.mjs` sobre o registro cru.
2. **Adesão:** `runSessions[id].execution` — a conclusão lida pelo motor, `extentKm`, os pesos das etapas. Uma sessão concluída é adesão mesmo quando o ritmo dela está retido.
3. **Evidência de ritmo:** três condições juntas: `paceWithheld === null`, a linha fora de `runFormat.paceEvidenceWithheld`, e `paceEvidence !== false`. Só depois disso o ritmo de trabalho da linha é lido. Uma sessão por tempo tem `paceEvidence: null` mesmo retida: o motivo é lido primeiro (o ponto que o encerramento do E-01 deixou para esta fase).
4. Uma resposta do V1RWS-2 que não entrega sessões (revisão recusada, anterior ao registro, erro) não é lida: `UNAVAILABLE`, sem número algum.

Testes de resultado em `v1rfc-evidence.test.mjs`: a armadilha do E-01 por três formas de correção e pela re-sincronização do aparelho (forma do D-01); parada com `completed: true` forjado; distância declarada; execução UNKNOWN; conflito app × aparelho; resposta sem decisão (C-05). Com evidência retida, o `inputDigest` da previsão é o do controle.

## 3. Pré-condições e checagens do handoff (seção 9.1)

| | Resultado |
|---|---|
| Freeze V1RWS-2 no seu snapshot | `--check 2` exit 0 em `f32a711`, árvore limpa |
| (a) calibração de semana passada sem ler o futuro | Confirmada: relida 8 a 14 semanas depois, é a que a semana mostrou (teste "first checks") |
| (b) `projection.comparisons` com datas e 10K-equivalente | Confirmada |
| (c) sessão → `prescription.durationMinutes` | Confirmada |
| (d) fases do motor ⊂ listas de `values` | Confirmada em 8 planos (T1b) |

## 4. Achados (são achados, não ajustes)

| Id | O quê |
|---|---|
| **B-1** | **A previsão depende da atualidade da referência V1RC (56 dias).** Com só um resultado anterior ao plano, a referência envelhece na semana 9: a estimativa vira PROVISIONAL/LOW e a previsão passa a `TOO_UNCERTAIN_TO_SHOW` até a prova. Os exemplos (a) e A4-1, que mostram faixa na semana 15 com referência de 2027-01-01, reproduzem ao segundo na função pura, mas ponta a ponta só existem com um resultado nos últimos 56 dias. É consequência da V1RC, não um defeito desta implementação; é informação de produto para o Founder e o SSCTR |
| **B-2** | **`NOT_YET_IN_WINDOW` não ocorre ponta a ponta:** o motor só gera planos de 4, 8, 12 ou 16 semanas, e 16 semanas são 111 dias. O estado está implementado e testado na função pura (exemplo i) |
| **B-3** | **A simulação de sanidade não atinge os limiares do handoff.** Gerador fixado antes da primeira rodada (ruído de medição e de dia de prova, cada um com o desvio da própria decisão, 0,025/1,2816): a verdade cai no envelope em **63,8 %** (pedido: ≥ 80 %); braço acima do teto 56,6 % (pedido: ≥ 60 %); verdade mais rápida que a borda rápida no braço sem resposta 14,8 % (pedido: ≤ 10 %). Os dois critérios de erro do central são atendidos. Uma segunda descrição, acrescentada **depois** de ver o resultado e rotulada assim (os dois ruídos somados com aquele desvio): 77,6 %, ainda abaixo de 80 %; os demais atendidos. Causa aritmética: o envelope tem a largura da margem V1RC, feita para uma fonte de ruído. Arquivos em `audits/v1-race-forecast-2026-11-13/evidence/`. Não ajustei nada para passar. O handoff lista a simulação à parte dos testes obrigatórios para o freeze; se ela bloqueia é julgamento do SSCTR |
| **B-4** | O arquivo de valores traz, nas razões de recusa dos domínios de ritmo de prova, um termo que o filtro `FORBIDDEN_CLAIM` do motor proíbe ("critical speed"). São razões da decisão, nunca texto para o atleta; nada as emite (teste T13) |
| **B-5** | Pela regra de excepcional da decisão, uma última sessão lenta e distante das outras (> 5 %) é mostrada e não vota; as anteriores podem então ler `IMPROVING`. É o contrato; registro para o SSCTR |

## 5. Leituras minhas, para o SSCTR decidir (não são decisões esportivas)

| Id | Leitura no candidato |
|---|---|
| **V5** | Sessão nativa `UNKNOWN`: sem crédito por distância ou minutos, **contada com crédito 0** (`unknownSessionCredit = 'ZERO'`, ponto único nomeado). A outra leitura (`'EXCLUDED'`) está implementada e testada. A resposta do SSCTR prevalece |
| L-1 | Linha em conflito entre fontes: tratada como a V5 |
| L-2 | Sessão `SKIPPED` pelo plano e não movida: conta como planejada, crédito 0. Movida ou opcional: só conta se foi relatada |
| L-3 | Extensão de um contínuo não concluído: `extentKm` (a menor distância utilizável) sobre o alvo. `extentFraction` nunca é lido (SSCTR-RWS-E-03) |
| L-4 | Experiência: só vale a classe declarada ou derivada de meses declarados; sem isso o intake grava NOVICE e a previsão lê **EXPERIENCED** (Athlete Data Foundation, seção 6) |
| L-5 | As três fronteiras exigem `V1X-RUN-NATIVE` (mais estrito que o handoff, que é anterior à RWS) |
| L-6 | Previsão só de semana já iniciada (ou da semana 1 antes do início do plano): uma referência dentro de semana não terminada é a condição que a A1 mandou rever |
| L-7 | Par da resposta: A é a referência elegível mais antiga do próprio registro de mudanças da V1RC; a elegibilidade dela é lida da calibração na última semana em que esteve em vigor; uma retirada entre A e B invalida o par |
| L-8 | Semana da prova: a previsão da semana anterior é **relida do registro como aquela semana leu**, não guardada. Além das causas da decisão, não é mostrada quando um relato de sessão anterior chegou depois de a semana congelada começar para uma sessão que já tinha relato (correção, segunda fonte, contradição), ou quando uma pausa foi declarada desde então. Nunca é mostrada alterada |
| L-9 | Insights retirados por: hold, triagem pedida, experiência NONE, modo walk/jog/restart/return, corrida de conclusão, depois da prova, RACE_WEEK. **Não** apliquei a janela de 112 dias nem "estimativa indisponível" aos insights (a r1 F8 diz "as mesmas condições") |
| L-10 | Ação para `STABLE` e `MIXED`: `NONE` (a decisão não nomeia uma) |
| L-11 | Caducidade da revisão: conferida em **toda** virada de semana a partir de 56 dias, não só na primeira (mais estrito) |
| L-12 | "GPS com qualidade GOOD": aceito `gpsQuality` `GOOD` ou `OK`; ausente ou outro valor não serve |
| L-13 | Uma sessão relatada mais dura que a dica encerra a revisão e bloqueia a oferta **mesmo com o ritmo dela retido**: é a palavra do atleta, não evidência de ritmo |
| L-14 | Blocos longos: o passo planejado ≥ 5 min **e** cada etapa do formato nativo ≥ 300 s (fecha a SSCTR-RWS-A-04 para os leitores desta fase) |
| L-15 | Maratona acima de 6:00:00: retida na saída desta extensão; a estimativa da V1RC continua sendo a da V1RC (condição R-11 herdada, de integração) |

## 6. Revisão de ritmo (`V1X-PACE-REVISION`): implementada e desligada

Sem registro habilitador próprio (que só pode existir depois de a integração cumprir a IC-2), `paceRevision` é `INERT`, nada é oferecido nem gravado e a faixa é a da V1RC: a função é **observacional**. Sob autoridade de desenvolvimento, nos testes: PR-1 a PR-3, cada condição de oferta, cada término, I8 (a faixa do seletor é a faixa exibida, a partir da virada da semana; só o formato das sessões de limiar muda).

**Superfície nova guardada, só com essa fronteira ligada:** `paceRevisionRecord` (respostas ACCEPT, DECLINE, REVOKE do atleta; linha selada por hash sem chave, como os demais registros). Segurança focal pedida. Nenhuma outra coisa é guardada: a previsão é recalculada do registro.

## 7. Limites que continuam abertos (não resolvidos aqui, por instrução)

Demonstrados por teste como estão, com o nome `LIMIT, open`:
- **QRE-RWS-F-01:** o atleta diz HEAT, o relato do aparelho traz outra condição; a linha fundida fica comparável e a sessão **vota** nos insights.
- **Hard gate E-1:** a re-sincronização do aparelho enviada como correção apaga a recuperação ADVERSE do atleta da linha do motor; a regra dos 7 dias da oferta de revisão lê o registro do motor e herda isso.

Também abertos, sem mudança: as duas vozes e o contrato iOS, custódia (gravação atômica, integridade com chave, reparo, retenção, apagamento). Nenhum hard gate foi declarado atendido.

## 8. Números do candidato

- Testes da extensão: 78 de 78 (5 arquivos). T5: 500 casos.
- Exemplos da decisão: os 43, ao segundo, com status, exibição e flags.
- Suíte conjunta: ver o encerramento (rodada uma vez; a única falha esperada é o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…`).
- `v1rfc-freeze.mjs --preserved`: exit 0.

## 9. O que não foi feito

Nenhuma mudança no motor, na V1RC ou na RWS. Nenhum registro habilitador (é do juiz SSCTR). Nenhum freeze. Nenhum push ou merge. `CURRENT_MISSION.md`, `MISSION_LEDGER.md`, a fila humana, o Figma e a Strength Intelligence não foram tocados.
