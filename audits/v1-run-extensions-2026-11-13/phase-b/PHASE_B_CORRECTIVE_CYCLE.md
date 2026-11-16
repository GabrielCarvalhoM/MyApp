# V1 Run Extensions — fase B: o ciclo corretivo único, registro do autor (2026-11-16)

**Estado: candidato corrigido, para reverificação pelos mesmos juízes. Não aprovado, não congelado, nenhum registro habilitador.**
É o único ciclo corretivo que o handoff (seção 9, passo 6) e o preflight (S10) preveem. Depois dele não há outro: ou os juízes liberam, ou a fase fecha com o bloqueio nomeado.

A rodada independente sobre `400edb7` está em `reviews/`, como recebida:

| Juiz | Veredito | Bloqueios |
|---|---|---|
| Quality & Reliability | `NOT_READY` | QRE-RFC-A-01, A-02, A-03 |
| SSCTR | `BLOCK` | SSCTR-RFC-A-01 (condição no mesmo ciclo: A-02) |
| Security focal | `PASS_WITH_CONDITIONS` | nenhum; A-01 a A-03 são da revisão de ritmo, desligada |

Só arquivos da fase B mudaram: `src/v1-run-forecast-index.mjs`, `src/v1-pace-insights.mjs` (uma linha), `test/v1rfc-helpers.mjs`, `test/v1rfc-properties.test.mjs` e o novo `test/v1rfc-cycle.test.mjs`. Nenhum arquivo congelado, nenhum valor.

## 1. O que foi fechado, e como

| Achado | Causa | Correção | Teste de resultado |
|---|---|---|---|
| **QRE-RFC-A-01** — a previsão e os insights de uma semana mudavam dentro da semana | O motor congelado reescreve a linha quando chega uma segunda fonte ou uma correção (a correção guarda o primeiro instante da cadeia; o conflito marca a linha). A semana não pode ser relida como estava | Quando chega, a partir do primeiro dia da semana, um relato de uma sessão anterior **que já tinha relato**, ou uma pausa é declarada, a semana mostra **retirada com motivo** (`REPORTS_CHANGED_SINCE_THE_WEEK_STARTED`, `BREAK_DECLARED_SINCE_THE_WEEK_STARTED`) até a próxima virada. Nunca outro número. É o mesmo leitor que já guardava a semana da prova | `v1rfc-cycle` (sonda do juiz: 12 relatos de aparelho na quarta; correção do atleta; segunda fonte que concorda); T5 estendido: 500 casos com correções e segundas fontes, nenhum número alterado |
| **QRE-RFC-A-02** — a calibração de semana passada, relida depois de uma correção, se move (checagem (a) do handoff falha; S6) | Mesma causa, na V1RC congelada | A fase B **não relê** calibração de semana passada. (i) A faixa de cada execução é a faixa com que a sessão foi **entregue**, lida do registro de formatos (o último formato da sessão em registro até o dia em que foi corrida). (ii) O par da resposta é lido do registro de mudanças da própria resposta. A única calibração de outra semana ainda pedida é a da semana congelada, na semana da prova, sob a sua guarda | `v1rfc-cycle`: a calibração relida se move (o fato, afirmado em teste) e o insight lê a faixa entregue |
| **QRE-RFC-A-03** — depois de um restart, linhas do plano anterior creditavam sessões do plano novo | Os ids de sessão são relativos ao plano (`w0-run-d1`) | Uma linha só é lida para a sessão do plano em vigor quando está datada dentro da semana daquela sessão **e** foi gravada depois de o plano existir | `v1rfc-cycle`: restart com ids em colisão; créditos `MISSING_REPORT`, média 0, igual ao controle com ids renomeados; nenhum voto de insight |
| **SSCTR-RFC-A-01** (= QRE-RFC-A-05) — pausa declarada de 14 dias ou mais não retirava na hora | Eu tinha deixado a retirada para a V1RC, que só age depois da pausa | Pausa de 14 dias ou mais em registro e ainda não terminada: previsão e insights retirados na resposta que a grava e em todos os dias dela (`DECLARED_BREAK_OF_14_DAYS_OR_MORE`) | `v1rfc-cycle`: revisão que declara, dias seguintes, 13 dias, e depois da pausa |
| **SSCTR-RFC-A-02** — semana sob hold não era de crédito zero | Só os modos walk/jog, restart e return marcavam | Semana em que um hold clínico esteve de pé (dos fatos do próprio motor, do hold até a prontidão declarada) é de crédito zero e fica fora da média | `v1rfc-cycle`: hold, sessões relatadas durante ele, prontidão, retorno, nova referência |
| Security A-08, A-09, A-11 | — | Resposta ilegível não é ecoada; as chaves da extensão saem também do intake; uma retirada não repete a estimativa | `v1rfc-cycle` (intake); os demais por leitura |
| QRE-RFC-A-08 (mutante E08) | O teste do gancho usava um domínio que o gancho nunca recebia | Teste novo numa semana com sessão dura | `v1rfc-cycle` |

## 2. Leituras que mudaram, para o SSCTR julgar de novo

1. **Par da resposta (L-7).** Antes eu lia a elegibilidade da referência anterior na calibração da última semana dela (uma releitura do passado). Agora leio só o registro de mudanças da resposta: a referência anterior serve de ponta do par **só quando entrou em vigor com confiança HIGH** (nenhuma redução: esforço conhecido e máximo, medida em percurso ou pista, sem conflito, sem pausa, não envelhecida) e dentro da população do modelo. É **mais estrito** que a decisão para uma referência anterior medida por GPS (MODERATE): ela deixa de formar par, e vale o prior. Para a regra de desaceleração serve qualquer referência anterior do mesmo tipo.
2. **Faixa do insight.** A do formato entregue, não a derivada de novo. Com isso a faixa é a que o atleta viu. Se nenhum formato com ritmo foi entregue até o dia da corrida, a execução não vota (`NO_BAND_IN_ITS_WEEK`).
3. **Linha fora da semana da sessão.** Uma sessão executada em outra semana e relatada sob o id original não é crédito (lê como sem relato). Erra para baixo.
4. **Pausa com início futuro.** O motor congelado não a grava (responde ASK). Não há pausa em registro para ler; a regra lê toda pausa em registro que ainda não terminou.

## 3. Custo conhecido da correção do QRE-RFC-A-01 (para integração)

Com o motor como está, toda segunda fonte ou correção que chega depois da virada, sobre sessão que a semana já leu, retira a previsão e os insights daquela semana. Se a sincronização do aparelho costuma chegar depois do relato do atleta, isso será frequente. A integração precisa medir quantas semanas ficam retiradas e, se for material, ordenar os relatos (o contrato das duas vozes) ou pedir decisão do Founder sobre o motor. É a mesma classe do custo L1-f da fase A.

## 4. O que continua aberto

**A revisão de ritmo (`V1X-PACE-REVISION`) não está aprovada.** Continua desligada, sem registro, e nada aqui diz que ela falha fechada. Não mexi nela neste ciclo, além de ela ler a mesma faixa entregue. Condições abertas, todas antes de qualquer registro dela: SEC-RFC-A-01 (registro de respostas não falha fechado), A-02 (oferta sobrevive aos sinais da própria semana), A-03 (término por retirada não persiste), A-10; SSCTR-RFC-A-03 (pausa de 7 dias ou mais e modo de retorno não encerram), A-11 (dia da virada); QRE-RFC-A-04 (uma correção posterior apaga um passo aceito); SSCTR-RFC-A-09 (excepcional lento e a oferta); L-12 (qualidade de GPS escrita pelo aparelho).

**Do motor e da RWS congelados, para o Founder:** a calibração V1RC da semana corrente se move dentro da semana depois de uma correção; a RWS liga a execução antiga à sessão nova depois de um restart (colisão de ids). A fase B não lê nenhum dos dois; os dois continuam lá.

**Limites de integração, sem mudança:** QRE-RWS-F-01, hard gate E-1, as duas vozes, custódia (SEC-RFC-A-04 a A-07).

**Notas não tratadas:** QRE-RFC-A-06, A-07 (crédito 0 para etapa WORK contínua não cumprida: erra para baixo), o restante da A-08 (mutantes E03, P11, E15 e regras de valor sem teste), SSCTR-RFC-A-04, A-05, A-08, A-10.

## 5. Correções ao meu registro anterior (`PHASE_B_CANDIDATE.md`, que fica como foi julgado)

1. **"(a) Confirmada" estava errado.** O meu teste não tinha correção. Com uma correção a calibração relida de semana passada se move, como o preflight (R3) avisava e o juiz mostrou. A resposta deste ciclo é não relê-la.
2. **A seção 2, item 1,** dizia que a calibração de outra semana era lida pelo `runCalibrationOf` do V1RWS-2. Agora só a da semana congelada, na semana da prova.
3. **L-7 e L-9** mudaram como descrito acima (L-9: os insights também são retirados pela pausa de 14 dias e pela mudança dentro da semana).
4. O meu T5 só mandava primeiros relatos; não provava o que eu disse que provava.

## 6. Números

- Testes da extensão: 85 de 85 (6 arquivos). T5: 500 casos, com correções e segundas fontes.
- Os 43 exemplos da decisão seguem ao segundo (nenhuma função pura de previsão mudou).
- Suíte conjunta e `v1rfc-freeze.mjs --preserved`: no encerramento.
