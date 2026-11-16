# V1 Run Extensions — fase B: Race Forecast + Pace Insights, encerramento (2026-11-16)

**Estado final: `APPROVED_SYNTHETIC_CANDIDATE`, com condições, para a previsão de prova e os insights de ritmo (observacionais).**
**A revisão de ritmo (`V1X-PACE-REVISION`) NÃO está aprovada.**

- Os três juízes liberaram o candidato corrigido `0d3015b`, sem bloqueio. Houve uma rodada, **um** ciclo corretivo e **uma** reverificação, como o handoff previa. Nenhuma correção de runtime foi feita depois da reverificação.
- Os registros habilitadores de `V1X-RUN-FORECAST` e `V1X-PACE-INSIGHTS` foram **emitidos pelo juiz SSCTR**, depois de ele ler inteiros os pareceres de Quality e de Security.
- O freeze aditivo `COACHINGCORE-V1-RACE-FORECAST-FREEZE-1` é escrito a partir do commit que contém este arquivo. O registro dele fica em `../PHASE_B_FREEZE_V1RFC_1.md`, fora desta pasta (o freeze amarra todos os arquivos rastreados de `phase-b/`: **não acrescentar nem editar nada aqui depois dele**).
- **É um candidato sintético.** Não autoriza atleta real, integração iOS nem produção. Nada foi enviado (push) nem mesclado.

## 1. Vereditos (como recebidos, em `reviews/`)

| Juiz | Rodada sobre `400edb7` | Reverificação sobre `0d3015b` |
|---|---|---|
| Quality & Reliability | `NOT_READY` (A-01, A-02, A-03) | **`READY_WITH_CONDITIONS`**, nenhum bloqueio |
| SSCTR | `BLOCK` (A-01; A-02 no mesmo ciclo) | **`ACCEPT_WITH_CONDITIONS`**, nenhum bloqueio |
| Security, focal | `PASS_WITH_CONDITIONS` | **`PASS_WITH_CONDITIONS`**, nenhum bloqueio |

O que cada achado era, a causa e a correção: `PHASE_B_CORRECTIVE_CYCLE.md`. O que os juízes mediram na reverificação, por conta própria: os 43 exemplos e 6.000 casos aleatórios sem divergência; 285 comparações de composição sem diferença; 108 jornadas de admissão sem violação; a semana da prova nunca mostrada alterada em 21 mudanças tardias; 24 casos de estabilidade dentro da semana.

**Registros habilitadores:** `reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json`, sha256 `a1274c5c0d83dd19ac40dfe35a059e2ccf803afdf9fdb4e6b080c701b673b8a6`. Dois registros, `APPROVE_WITH_CONDITIONS` / `SUPPORTED_WITH_LIMITS`, revisão `SSCTR-V1RFC-RECHECK-R2`, amarrados aos valores (`eae01117…e840`) e, por texto, aos bytes de `0d3015b`:

| Arquivo | sha256 |
|---|---|
| `src/v1-race-forecast.mjs` | `8ab1815b16e27092774a12d2666011d99cded5b1364db1fe57cda86e2bc4a92e` |
| `src/v1-pace-insights.mjs` | `9b18063c5b2b77511d677b2afcec4d37392e39b39067d5284b4b1fe553c0fd7b` |
| `src/v1-run-forecast-index.mjs` | `b57c1c16a380f3b22eb8ee01a9ce7dc3230ae232c93816a433e6d16f73f5c5bd` |
| `v1/RACE_FORECAST_EXTENSION_V1.json` | `eae0111744d904211963ecc76a964a59d214dd84c541c9ac799480fd3f3de840` |

Conferido por mim com o leitor (`runForecastAuthority()` sem opções): previsão ligada, insights ligados, **revisão desligada**. O runtime confere só o hash dos valores; a amarração aos bytes está no registro e no freeze.

## 2. A revisão de ritmo: implementada, desligada, não aprovada, e não falha fechada

Isto precisa estar escrito sem ambiguidade (Security SEC-RFC-B-03, Quality R2 seção 5, nota do SSCTR):

- O código da revisão está dentro dos arquivos que o freeze amarra. **"Desligada por padrão" não quer dizer "segura".**
- **Nenhum registro habilitador de `V1X-PACE-REVISION` é válido sobre estes bytes.** O runtime a ligaria com qualquer registro amarrado ao hash dos valores; por isso o verificador do freeze falha se o arquivo de registros tiver qualquer registro dela.
- Ligá-la exige: código novo, os achados abaixo fechados e julgados de novo, uma integração que cumpra a IC-2, e um **freeze sucessor**.
- Abertos: SEC-RFC-A-01 (o registro de respostas não falha fechado), A-02 (a oferta sobrevive aos sinais da própria semana), A-03 (um término por retirada não persiste), A-10; SSCTR-RFC-A-03 (pausa de 7 dias ou mais e modo de retorno não encerram), A-11, e a pergunta da A-09; QRE-RFC-A-04 (uma correção posterior apaga um passo aceito), B-03 (com ela ligada a calibração de semanas passadas volta a ser relida); L-12 (qualidade de GPS escrita pelo aparelho); o hard gate E-1 e a QRE-RWS-F-01.
- O SSCTR já respondeu as duas perguntas esportivas de Security, para quando ela for refeita: qualquer sinal de término depois da virada retira a oferta aberta; uma retirada **encerra** a revisão, não a suspende.

Sem registro, `paceRevision` é `INERT`: nada é oferecido nem gravado, e a faixa é a da V1RC.

## 3. Condições abertas da previsão e dos insights

Nenhuma bloqueia o candidato sintético. Todas estão nos registros habilitadores.

| Quando | O quê |
|---|---|
| Sempre | Só dados sintéticos. Um envelope de plausibilidade, nunca uma probabilidade. **Os limiares da simulação de sanidade do handoff NÃO foram atingidos** (cobertura 63,8 %; 77,6 % numa segunda descrição feita depois; pedido 80 %): nada pode afirmar cobertura ou acurácia |
| Antes de qualquer uso com atleta | E3 (leitura do Founder e do PCG da regra "tempo de chegada ou ganho de forma") e E4 (texto final). Os donos do texto são avisados de que **a ponta lenta não é um piso** (no gerador a verdade ficou mais lenta que ela em 9 a 26 % dos casos por braço). O Founder e Product são avisados do achado B-1, abaixo |
| Antes de integração ou atleta real | **QRE-RFC-B-02:** num restart feito no mesmo dia em que o plano novo começa, uma corrida do plano antigo relatada naquela manhã ainda é creditada (a guarda compara dias, não instantes). SSCTR-RFC-B-02: uma pausa futura só entra no registro quando começa |
| Antes de integração | Medir **com que frequência a retirada dentro da semana dispara** (seção 3 do registro do ciclo). Custódia com chave e gravação atômica: a garantia "nunca mostrado alterado" e a faixa entregue só valem sob ela (SEC-RFC-B-01: uma linha de formato forjada e reselada muda o estado de um insight; B-02: cortar fatos de relato desfaz a retirada). QRE-RWS-F-01, hard gate E-1, as duas vozes, R-11 e as condições herdadas da V1RC; nenhuma opção passada pela integração |
| Antes de qualquer alegação de acurácia | Recalibração empírica de G, τ e wMax contra resultados reais (inclui a nota SSCTR-RFC-B-01); revisão até 2027-05-13 ou no primeiro dado real |
| Notas | Guardas novas sem teste próprio (QRE-RFC-B-04: 10 de 18 mutantes das linhas do ciclo sobrevivem; o comportamento foi conferido por sonda do juiz). Recomendação de Security e do SSCTR para um sucessor: ler a faixa do formato que a execução cita. SSCTR-RFC-A-05 reabre se os formatos mudarem |

**Achado B-1, para o Founder e Product (confirmado pelo SSCTR, sem mudança de código):** a previsão segue a validade de 56 dias da referência V1RC. Com um único resultado anterior ao plano, a previsão existe só nas semanas 1 a 8 de um plano de 16, e a semana da prova não mostra nada. Com um resultado recente (uma prova ou um teste durante o plano) ela volta. Validade, margem e wMax não devem ser afrouxados para mantê-la na tela.

**Do motor e da RWS congelados, para o Founder:** a calibração V1RC da semana corrente se move dentro da semana depois de uma correção; a RWS liga a execução antiga à sessão nova depois de um restart. A fase B não lê nenhum dos dois.

## 4. O que mudou depois da reverificação (declarado; não julgado de novo)

Só o verificador do freeze, `scripts/v1rfc-freeze.mjs`, a pedido dos três juízes: ele agora recusa escrever e acusa `DRIFT` quando o arquivo de registros tem qualquer registro de `V1X-PACE-REVISION`, e grava no registro do freeze o que a seção 2 diz. Nenhum byte de runtime mudou: os quatro arquivos da seção 1 são os de `0d3015b`.

## 5. Contrato de dados para o aplicativo

**Ponto de entrada único:** `CoachingCore/src/v1-run-forecast-index.mjs` (`generateProgram`, `evaluateProgram`, `restartProgram`). Um registro, um ponto de entrada. A integração não passa opções.

**O que o cliente envia, além do que o V1RWS-2 já pede:** nada. (`paceRevisionResponse` e `paceRevisionRecord` existem só para a revisão de ritmo, que está desligada; são retirados antes de qualquer camada abaixo ler a entrada.)

**O que o cliente guarda e devolve:** o que já guardava (o registro do motor, `runEvidenceRecord`, `runFormatRecord`, `runHistoryRecord`). A fase B **não acrescenta registro**: tudo é recalculado do registro a cada resposta.

**O que a resposta traz a mais** (todas as chaves do V1RWS-2 vêm intactas):

| Chave | Conteúdo |
|---|---|
| `runForecast.status` | `SHOWN`, `TOO_UNCERTAIN_TO_SHOW`, `NOT_YET_IN_WINDOW` (com `availableFrom`), `UNAVAILABLE` (com `reason`), `WITHHELD_R11_CENTRAL_ABOVE_6H`, `NOT_APPLICABLE`, `DISABLED` |
| `runForecast.shown` | Quais faixas mostrar, na ordem: `OBSERVED_FORECAST` primeiro, `PLAN_SCENARIO` como alternativa condicional. Só mostrar o que está nesta lista |
| `runForecast.observedForecast`, `planScenario` | `lowSeconds`, `centralSeconds`, `highSeconds`, `status`, `statement` (o texto exigido), `conditionalOn`, `interval` (`PLAUSIBILITY_ENVELOPE`, não probabilístico), `goalRelation` (posição da meta contra a faixa, texto neutro) |
| `runForecast.current` | A estimativa atual da V1RC de onde a previsão parte. A comparação V1RC meta × estimativa (`runCalibration.goal`) vem sempre primeiro |
| `runForecast.basis.statement` | "Based on your ‹referência› of ‹data›; individual results vary. A plausible span, not a probability." |
| `runForecast.raceWeek` | Na semana da prova: `SHOWN_FROZEN` com `frozenRange` (só low e high), `label` e `from`/`through`; ou `NOT_SHOWN` com o motivo. Nunca no dia da prova |
| `runForecast.marathon` | Na maratona: só a estimativa atual, nunca chamada de previsão |
| `runForecast.guidance` | Rotas existentes quando não há faixa: relatar um resultado de prova na distância; o teste de campo só se a V1RC o oferece |
| `runForecast.adherence`, `decomposition`, `response` | Para auditoria e explicação: crédito por sessão e a regra aplicada; O, U, F e g; a resposta e o par |
| `paceInsights.domains[d]` | `state` (`IMPROVING`, `STABLE`, `MIXED`, `SLOWER_THAN_BAND`, `INSUFFICIENT_DATA`), `sessions` (com a faixa contra a qual cada uma foi lida), `excluded` (com o motivo), `action`, `id` (para o atleta dispensar) |
| `paceRevision` | `INERT`. `effectivePaceBands.THRESHOLD_CONTROLLED` é a faixa da V1RC |

**Motivos de `UNAVAILABLE` que o aplicativo precisa tratar:** `HOLD`, `WARNING_SIGN_SCREEN_REQUIRED`, `DECLARED_BREAK_OF_14_DAYS_OR_MORE`, `MODE_WALK_JOG_RESTART_RETURN`, `EXPERIENCE_NONE`, `COMPLETION_RACE`, `AFTER_THE_RACE_DATE`, `RACE_WEEK`, `WEEK_NOT_STARTED`, `REPORTS_CHANGED_SINCE_THE_WEEK_STARTED`, `BREAK_DECLARED_SINCE_THE_WEEK_STARTED`, `CURRENT_ESTIMATE_UNAVAILABLE`, `CURRENT_ESTIMATE_NOT_REPRODUCED`, `RUN_FORMATS_‹motivo›` (a camada abaixo não decidiu). Uma retirada (`withdrawn: true`) não traz estimativa nem número.

**O que o aplicativo nunca faz:**
1. Mostrar o central sozinho, um tempo único, uma porcentagem ou a palavra probabilidade, chance ou "no caminho".
2. Mostrar o cenário do plano como manchete quando a previsão observada está em `shown`.
3. Usar qualquer faixa como ritmo de prova; na semana da prova o ritmo vem da estimativa atual e da cautela da V1RC.
4. Dar estilo de sucesso ou fracasso à relação com a meta.
5. Tratar um insight como mudança: ele não altera capacidade, estimativa, faixa, dose nem progressão.
6. Ler `actual.completed`, uma distância ou `work.paceSecondsPerKm` do registro por conta própria para decidir adesão ou evidência de ritmo.

**Regra de atualização:** a previsão e os insights de uma semana são os do primeiro dia dela. Uma retirada vale na hora.

## 6. Freezes anteriores, cada um no seu snapshot (clone de rascunho, verificadores sem edição)

| Freeze | Snapshot | Resultado |
|---|---|---|
| `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` | `08d2dc8` | `--check 1` exit 0 |
| `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2` | `f32a711` | `--check 2` exit 0 (e nesta árvore, pelo verificador da fase B) |
| `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` e `COACHINGCORE-V1-FREEZE-1` | `c8104c1` | `--check 1` exit 0, 30 de 30 e 198 de 198; o teste histórico é verde lá |

## 7. Números

- Testes da extensão: 85 de 85 (6 arquivos). Suíte conjunta: 1535 entradas, 1534 passam; a única falha é o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…`, por desenho, não editado. **A suíte conjunta não é verde nesta linha.**
- Os números do freeze, rodados pelo próprio script, estão em `../PHASE_B_FREEZE_V1RFC_1.md`.

## 8. Commits desta missão (linha `claude/v1-run-extensions`, nada enviado)

| Commit | O quê |
|---|---|
| `400edb7` | O candidato; julgado na rodada |
| `aea7536` | Os três pareceres da rodada, como recebidos |
| `0d3015b` | O ciclo corretivo; julgado na reverificação; os bytes de runtime que os registros amarram |
| (este) | As reverificações, os registros habilitadores, a guarda do verificador e este encerramento; é o commit que o freeze amarra |
| (o seguinte) | O registro do freeze e `PHASE_B_FREEZE_V1RFC_1.md` |

## 9. O que fica para o Founder

1. **O achado B-1** (a previsão some depois de 8 semanas sem resultado recente): é informação de produto antes de qualquer tela.
2. **A simulação de sanidade não atingiu os limiares.** O SSCTR julgou que isso confirma a abstenção (nenhuma cobertura é alegada) e não bloqueia o candidato sintético. A decisão de produto sobre como falar de incerteza é sua e do PCG (E3).
3. **O custo da retirada dentro da semana**, se a sincronização do aparelho costuma chegar depois do relato do atleta: medir na integração; se for material, é o contrato das duas vozes ou uma decisão sua sobre o motor.
4. **A revisão de ritmo** continua um trabalho por fazer, com a lista da seção 2.
5. **Os dois comportamentos do motor e da RWS congelados** citados na seção 3.
6. Itens de fila humana propostos pelo SSCTR, não anexados: HQ-RFC-SSCTR-FORECAST e HQ-RFC-SSCTR-INSIGHTS (a fila segue em 235).

`CURRENT_MISSION.md`, `MISSION_LEDGER.md`, a fila humana, o Figma e a Strength Intelligence não foram alterados.
