# SSCTR — reverificação do fix-forward do V1RWS (fase A), r3 — 2026-11-14

**Veredito: ACCEPT_WITH_CONDITIONS.** Candidato sintético, sem atleta real e sem integração.

- **SSCTR-RWS-B-01: FECHADO.** Reproduzi a falha em `a8e9b05`. No candidato, a parada por sintoma é lida em todo relato recebido ou guardado, inclusive com conflito e em quarentena.
- **SSCTR-RWS-B-02: FECHADO**, como decidido.
- **Nenhum bloqueio novo.** Seis condições, todas de integração e anteriores a atleta real, nenhuma pré-habilitação: C-01 a C-04, C-07 e C-08. C-07 e C-08 vêm da verificação dos pontos do juiz de Security (seção 5a). C-08 trava a integração do composto.
- **Registro habilitador: não escrito nesta passagem**, como manda o pedido. Eu o emitiria para este candidato, com as condições da seção 5, depois dos vereditos de Quality e Security.

Dados da revisão:
- **Candidato:** `644cd8e` (HEAD, árvore limpa). Diff julgado: `a8e9b05..644cd8e`. Comparação com `d6381bb`; base congelada `c8104c1`.
- **Hashes conferidos:**
  - r2 `daf3d7a2…2213`, r3 `6b96d769…08e2`, r3a `37047d21…d412`;
  - `RUN_FORMATS_V1.json` `26c6e3fb…353c`, igual a `FORMAT_VALUES_SHA256`.
- **Revisor:** instância SSCTR nova (claude-opus-5-5), PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, sem credencial humana. Não escrevi o candidato, as decisões, as revisões anteriores nem a correção. Não houve revisão humana, validação empírica nem juízo clínico.

## 1. SSCTR-RWS-B-01 — FECHADO

**Antes (`a8e9b05`, extraído em rascunho, sonda p1c do juiz anterior):** o app diz parada por sintoma e a importação diz `completed:true`. Nas três ordens e nas duas expressões (6 de 6 casos):
- triagem `NOT_RAISED_BY_THIS_EXTENSION`;
- de 1 a 4 sessões nativas na semana seguinte.

Reproduz o achado.

**Agora (`644cd8e`, mesma sonda):** 18 de 18 casos com triagem `REQUIRED` e 0 nativas. A linha do motor fica como estava: CONFLICTED, e sem parada quando a importação chega antes. Sondas próprias (`s1-signal.mjs`):

| Cenário | Resultado |
|---|---|
| Três relatos (importação concluída, parada no app, segunda importação de outra atividade), 6 ordens × 2 expressões | 12/12 `REQUIRED` na revisão e no dia seguinte com a triagem antiga; 0 nativas |
| Novo relato do app na identidade em quarentena (`IDENTITY_QUARANTINED_BY_CONFLICT`) | `REQUIRED` (em `a8e9b05`: não pedida) |
| A parada vem na importação do relógio, e o app diz concluído, nas duas ordens | `REQUIRED`, 0 nativas (em `a8e9b05`: 7 nativas) |
| Motivo FATIGUE, PACING, CHOICE ou TIME em conflito | nunca pede triagem |
| Rota clínica (sinal "sim") com a parada no registro | `CLINICAL_HUMAN_REQUIRED`, `prescribing:false`, todas por tempo com `prescribed:false`, `CLINICAL_ROUTE` |
| ASK de elegibilidade com a parada no registro | `REQUIRED`, 0 nativas, `prescribing:false` |
| Triagem respondida no dia seguinte | liberada; nativas voltam como o plano permite |
| Restart quando só o fato guarda a parada (importação primeiro) | `REQUIRED` e 0 nativas com a triagem do dia da parada; liberado com triagem posterior (em `a8e9b05`: 2 nativas) |

A parada também sobrevive:
- à correção que a retira;
- à correção que troca o motivo;
- à duplicata;
- ao registro passado por JSON.

Conferi lendo o código (`symptomStops` = fatos de relato + toda linha de corrida, também as substituídas) e pelos testes dirigidos do autor, que rodaram verdes: 74/74.

**Separação entre sinal e evidência.** Na linha em conflito:
- a execução não ganha crédito (`completed:false`);
- não pausa a classe;
- não entra no histórico;
- não dimensiona nada.

A triagem é a existente (r3 C4, `decidedByThisExtension:false`). Não há classificação clínica nova.

**Motor intocado.** As mesmas entradas pelo ponto de entrada congelado dão a mesma decisão e as mesmas linhas (teste do autor). Na minha varredura, 135 revisões não tiveram diferença no motor (seção 4).

Critério do juiz anterior e aceitação do Founder: atendidos. O sinal resiste:
- a contradição entre fontes;
- às três ordens;
- a atualização, duplicata e correção;
- à releitura e ao restart.

O registro de execução e o sinal de segurança ficam separados. Sob rota clínica, nada é oferecido como prescrição. Sob hold, rota clínica, triagem pedida ou ASK de elegibilidade, nenhuma sessão nativa sai.

O que ainda pode perder ou liberar o sinal fica nas condições C-01, C-02 e C-04 (seção 3).

## 2. Outros achados anteriores no meu campo

| id | estado | evidência |
|---|---|---|
| SSCTR-RWS-B-02 | **FECHADO** | `b2-ask.mjs`, em dois planos (16 km e prova de 10 km). **Elegibilidade:** sem elegibilidade, nula, `UNKNOWN` ou de 20 dias, o motor pede `eligibility.currentAssessment`. Resultado: 0 nativas, todas por tempo com `WARNING_SIGN_SCREEN_REQUIRED:ENGINE_ASKS_CURRENT_ELIGIBILITY`, `prescribing:false`, V1RC `NOT_OFFERED`. Em `a8e9b05`: 11 e 7 nativas com `prescribing:true`. **Outro ASK** (`choices`): as mesmas nativas da revisão sem pergunta e `prescribing:false`, a leitura da V1RC. Triagem de 6 e 8 dias, ainda vigente: sem mudança. Sinal "sim": rota clínica, como antes. |
| SSCTR-RWS-A-04 | ABERTA, condição do registro (inalterada) | Este ciclo não mexe na regra do passo planejado. |
| SSCTR-RWS-B-03 | ABERTA (integração; Data/iOS) | O autor declara que não tratou (seção 8 do registro). |
| SSCTR-RWS-B-04, B-05, B-06 | NOTAS (inalteradas) | — |

**QRE-RWS-B-02, lado esportivo: ACEITÁVEL.**
- **O que acontece:** uma distância medida sem duração vira `UNKNOWN` `DURATION_REQUIRED`, com pedido `SEND_THE_DURATION_OF_THE_RUN`. Não é evidência de ritmo nem referência de histórico. A sessão nativa fica parcial: o passo segura e não há crédito por distância.
- **Por que é aceitável:**
  - Sem duração, a medida não pode ser conferida contra a janela de plausibilidade.
  - `UNKNOWN` não conta para a X-2, como a r3a já diz para `UNKNOWN` (WE3A-03).
  - Sem referência, o L30 só muda a expressão, nunca a dose (WE3A-07).
  - O efeito é conservador e vem com uma pergunta.
- **Na minha diferencial:** 1.736 casos sem duração mudam. Nenhum ganha crédito, evidência de ritmo ou referência maior.
- **Limite:** importações reais do Saúde trazem duração; o caso é de borda.

## 3. Achados novos

| id | severidade | o quê | fecha com |
|---|---|---|---|
| SSCTR-RWS-C-01 | **CONDITION** (antes de integração ou de atleta real) | Com a importação chegando antes, a parada só existe no fato `RUN_REPORT_RECEIVED` do `runFormatRecord`. Se o cliente perde os fatos, a parada some: triagem não pedida e 6 nativas. Se um fato está danificado, acontece o mesmo; ele só é nomeado em `unreadableReports`. A linha em conflito do motor não aponta o relato em quarentena. Para formatos, perder um formato citado dá HOLD; para um fato de segurança ilegível, o sistema falha aberto. O próprio teste do autor afirma a dependência (linha 305). Sonda `s1-signal.mjs`, `factsContract`. | Um fato de relato ilegível falha fechado (corridas por tempo ou HOLD, como no formato perdido). E a integração guarda os fatos com o registro do motor, sob a cadeia com chave e no mesmo commit (Security A-01/A-06), tratados como dado de segurança. |
| SSCTR-RWS-C-02 | **CONDITION** (integração; já existia em `a8e9b05`) | Na revisão que traz a parada, às 20:00, vem uma triagem com instante 21:00 do mesmo dia, posterior ao instante da própria revisão. O motor a aceita como atual, porque confere a data, e a extensão a toma como respondida depois da parada: 7 nativas na hora. Com data só do mesmo dia, ou instante anterior, a triagem continua pedida. Com data do dia seguinte, o motor pede ASK. Sonda `s1-signal.mjs`, `screenAt/*`, igual nos dois commits. | O instante da triagem que libera a parada não pode passar do instante da revisão (ou a custódia o carimba). |
| SSCTR-RWS-C-03 | **CONDITION** (Product, antes de atleta real; estende a QRE-RWS-A-07) | Sob ASK de elegibilidade, o `runFormat.prescribing` é `false`, mas cada sessão por tempo continua com `prescribed:true`. Pela SSCTR-05, elegibilidade não avaliada não permite prescrever. Um consumidor que leia só o campo da sessão ofereceria treino. | Uma sessão sob `prescribing:false` (ASK) não é oferecida como treino a fazer até a triagem ser respondida, como já vale para `prescribed:false`. |
| SSCTR-RWS-C-04 | **CONDITION** (Data/Product, integração; já existia em `a8e9b05`) | O motor grava como `UNPLANNED` um relato de corrida fora do plano (sem `sessionId`) que declara parada por sintoma, mas ninguém lê essa parada: triagem não pedida e 11 nativas. O contrato ADF hoje só prevê importações soltas, e importação não traz parada; por isso não bloqueia. Sonda `u1-unplanned.mjs`. | O app nunca oferece motivo de parada numa corrida fora do plano. Ou a parada dessa linha é lida para a triagem, como as outras. |
| SSCTR-RWS-C-07 | **CONDITION** (antes de integração; é a SEC-RWS-C-01 no meu campo) | A resposta `REVIEW_BEFORE_THE_RECORD` sobre uma decisão que o motor aceitou só nomeia uma parada que venha no próprio pedido. Uma parada que o registro já guarda não é nomeada. Exemplo: o fato foi guardado por um ASK de formato desconhecido, e chega uma revisão da fila, anterior a ele. Resultado: triagem `null` e 0 sessões da extensão. Não sai nenhuma nativa (a resposta é inerte), o fato continua no registro, e a próxima revisão aceita dá `REQUIRED` com 0 nativas. Sob a custódia o `asOf` é o relógio do servidor, então o caminho exige relógio que volta. Sonda `x1-security-points.mjs`, p2. | Toda resposta inerte sobre decisão aceita nomeia a triagem que o registro exige (e, do lado do QRE, entrega a calibração sobre o registro admitido). |
| SSCTR-RWS-C-08 | **CONDITION do registro habilitador, que trava a integração** (dono: engenharia da fronteira/custódia; é a SEC-RWS-C-03) | Na custódia (`src/boundary/custody.mjs`), relato do app e importação da mesma corrida em duas requisições falham fechado, nas duas ordens: a segunda requisição volta `ok:false`, nada é guardado, e a resposta tem só `ok` e `error`. Na ordem "importação, depois parada no app", a parada não fica em lugar nenhum e nenhuma triagem chega ao app. Numa requisição só, a linha guardada fica em conflito sem a parada, e a custódia não guarda `runFormatRecord`, então o fato também se perde. Já existia: a custódia usa por padrão o `v1-index` congelado, que dá o mesmo resultado, e não roda o ponto de entrada composto. Por isso hoje nenhuma nativa sai por ela, e não bloqueia o candidato sintético. Sonda `x1-security-points.mjs`, p4 (custódia padrão e composta). | O ponto de entrada composto, com `V1X-RUN-NATIVE` ligado, não entra em custódia nem em integração enquanto três coisas faltarem. (1) A custódia aceita a fusão e a marca de conflito que o motor faz numa linha guardada. (2) Fatos e formatos vão no mesmo commit selado. (3) A resposta leva a triagem exigida. Teste nas duas ordens, com a parada. |
| SSCTR-RWS-C-05 | NOTE | Fusão de vários arquivos por duas fontes: o motor soma a distância da importação com os `segments` do app. Se o app listar também o arquivo que a importação já trouxe, conta duas vezes: 26 km num alvo de 16, `MEASURED`, referência 26, teto CT-3 de 18,08 para 28,6. Dá o mesmo com a mesma falha num relato só, então não é da fusão. Não vira evidência de ritmo, e o próximo longão continua 16 km (a dose é por tempo). Sonda `m1-merge.mjs`. | Contrato Data: cada gravação em um relato só (deduplicar por id de atividade), junto da B-03. |
| SSCTR-RWS-C-06 | NOTE | Numa revisão recusada (HOLD de integridade, entrada inválida, anterior ao registro), nada é guardado: o motor também não grava o relato. A parada é nomeada só na resposta. | O cliente mostra a triagem nomeada e reenvia o relato, como reenvia qualquer relato recusado. |

## 4. Nada mais mudou (diferencial contra `d6381bb`)

Sonda `d1-differential.mjs`: `d6381bb` extraído em rascunho contra o worktree, mesmas entradas.

**Seletor**, com a triagem ligada e desligada e quatro estados do motor:
- 378.000 seleções de repetições: 0 diferenças de padrão, blocos, estimativa, checagens, dimensionamento, instruções ou hash;
- 380.160 seleções de contínuos: 0 diferenças, também em `prescribed`.

**Leitor da execução:** 118.800 casos, contra o leitor antigo com as marcas que o ponto de entrada antigo gravava.
- 117.024 idênticos.
- As diferenças são só duas:
  - sem duração (1.736);
  - disputa entre o número do atleta e a medida (40, só `paceEvidence`).
- 0 casos com mais crédito, 0 com mais evidência de ritmo, 0 com referência maior.
- Vários arquivos e correção com motivo leem igual ao antes.

**Pelo ponto de entrada:** 3 planos × 5 formas de relato × 9 semanas = 135 revisões. Formas: como prescrito, só por tempo, parada por fadiga, sessão perdida, parada por sintoma sem conflito.
- 0 diferenças no motor, nas sessões, nas execuções, no `runFormat` e na calibração.

**Congelados e decisões:**
- `node scripts/v1rws-freeze.mjs --preserved`: 197/197 + 1 emendado autorizado (22+/10−); 30/30.
- `v1-run-calibration.mjs`, `v1-run-index.mjs` e `v1-index.mjs` sem diff desde `c8104c1`.
- `r6-adaptation.mjs` e `v1/` sem diff desde `d6381bb`.
- Nenhum teste de `c8104c1` editado.

**Exemplos r2/r3/r3a:** passam (74/74 na suíte v1rws). Nenhum resultado esperado mudou. As três entradas revertidas batem com o registro r3a:
- WE3A-02: qualidade OK com SIGNAL_LOSS ("Same" de WE3A-01, que diz OK);
- WE3A-04: "quality OK", com e sem motivo;
- WE3A-10: GPS 14,0 + 2,1, sem marca, como em `bcac30d`.

**Prova (`r1-race.mjs`):**
- Medida inteira (GPS, relógio), digitada, MANUAL e OFFICIAL: lidas igual pela V1RC congelada e pelo ponto de entrada.
- Só a prova em dois arquivos, a corrigida com motivo e a disputada deixam de chegar à V1RC.

## 5. As cinco leituras do autor (seção 4 do registro)

1. **Tolerância de disputa = o 0,91 já amarrado: ACEITA.**
   - Só retira a distância dos leitores de ritmo: na diferencial muda só `paceEvidence`, sem efeito em crédito, X-2 ou dose.
   - Não cria número novo e vai no sentido conservador.
   - Limite: dentro de 9%, vale a distância que o motor guardou, que pode ser a maior. Aceitável como limite de engenharia.
   - Nenhuma afirmação nova sobre precisão de GPS é feita aqui.
2. **Prova em vários arquivos ou corrigida não é mais resultado para a V1RC: ACEITA.**
   - Antes, a V1RC lia o primeiro arquivo sobre o tempo inteiro: 6 km em 50 min como resultado de prova, um número errado.
   - Perder o resultado é melhor que calibrar com ele. O atleta declara o resultado pela via própria.
   - A exceção N02 (prova digitada, lida pelas camadas da V1RC) fica intacta.
3. **Fusão de vários arquivos por duas fontes = o mesmo relato num envio só: ACEITA.**
   - É a r3a WE3A-10 (`DISTANCE`/`MEASURED`, nunca ritmo) e WE3A-02 para a correção com motivo.
   - Nas três ordens deu igual ao relato único: 16 km, referência 16, `SEVERAL_RECORDINGS`, S2 mantido.
   - Ressalva: NOTE C-05 (contagem dupla é falha de dados).
4. **Sinal monótono; sob triagem pedida, por tempo com `prescribed:true`; `prescribed:false` só para hold e rota clínica: ACEITA.**
   - É a letra da r3 C4: "keeps run sessions in TIME until it is answered; any yes takes the existing clinical route".
   - Triagem pedida não é classificação clínica. Por tempo é a dose canônica.
   - Ressalva: C-03 para o caso do ASK de elegibilidade.
5. **Parada em relato com formato desconhecido é guardada e nomeada: ACEITA.**
   - Não vira execução nem crédito.
   - Guarda o sinal sob o instante que o motor aceitou e o nomeia de imediato.
   - Em revisão recusada, ver C-06.

## 5a. Os quatro pontos do juiz de Security (SEC_V1RWS_FOCAL_R2), verificados por mim

Pedidos pelo Chief depois da primeira versão deste relatório. Rodei a sonda própria `x1-security-points.mjs` no candidato; não tomei a palavra do juiz.

| Ponto | O que eu vi | Decisão para o candidato sintético |
|---|---|---|
| 1. SEC-RWS-C-06: fato de parada ilegível | Importação primeiro: nenhuma linha guarda a parada. Fato intacto: `REQUIRED`, 0 nativas. Alterado sem rehash, ou de outro atleta: listado em `unreadableReports`, triagem `NOT_RAISED`, 6 nativas. Fato retirado: o mesmo, sem nada listado. | **CONDITION**, já registrada como SSCTR-RWS-C-01. Não bloqueia: exige perda ou dano do registro guardado pelo cliente, e a custódia com cadeia de chave é o lugar de detectar isso. Mas é falha aberta num dado de segurança: fecha antes de integração (cair para tempo ou HOLD). |
| 2. SEC-RWS-C-01: `REVIEW_BEFORE_THE_RECORD` | Confirmado: triagem `null` quando o pedido não traz parada; `REQUIRED` quando traz. Nenhuma nativa sai na resposta inerte, e a revisão aceita seguinte dá `REQUIRED`. | **CONDITION**: SSCTR-RWS-C-07. |
| 3. SEC-RWS-C-07: triagem minutos após o `asOf`; corrida avulsa | Triagem no mesmo pedido com +1 min ou +4 min: `NOT_RAISED`, 7 nativas. No `asOf` ou −5 min: `REQUIRED`. Corrida avulsa com parada: não lida (`u1-unplanned.mjs`). As duas já existiam em `a8e9b05`. | **CONDITION** (o Security marcou NOTE; eu mantenho CONDITION porque libera ou perde o sinal): SSCTR-RWS-C-02 e SSCTR-RWS-C-04. Não bloqueia: anterior a este ciclo, e fora do contrato atual do cliente (relógio, ADF). |
| 4. SEC-RWS-C-03: a custódia falha fechado na fusão entre requisições | Confirmado na custódia padrão (`v1-index` congelado) e com o ponto de entrada composto: a segunda requisição volta `ok:false`, nada fica guardado, e sem parada na ordem "importação primeiro". A custódia não guarda `runFormatRecord`. | **CONDITION do registro habilitador**: SSCTR-RWS-C-08. Não é condição do veredito sobre o candidato, que não está integrado (a custódia não roda o composto e não entrega nativas). Mas o registro não autoriza integrar o composto enquanto ela não fechar. |

Nenhum dos quatro é BLOCKING para o candidato sintético: o veredito continua ACCEPT_WITH_CONDITIONS.

## 6. Registro habilitador

Não escrito (o arquivo ainda não existe). **Eu o emitiria para `644cd8e`**, depois dos vereditos de Quality e Security, com estas condições:
- A-04 antes de a fase B ler `paceEvidence`;
- C-01, C-02, C-03, C-04, C-07, B-03 e QRE-RWS-A-07 antes de integração ou de atleta real;
- C-08: o composto não entra em custódia nem em integração enquanto ela não aceitar a fusão e a marca de conflito, guardar fatos e formatos no mesmo commit e devolver a triagem;
- Security A-01, A-04 e A-06 a A-08 (integração), e as condições SEC-RWS-C-02 a C-06 da revisão focal.

Se Quality ou Security pedirem mudança no runtime, o registro só vale para o commit que eu julgar.

Item de fila humana **proposto, não anexado** (a fila não é minha neste passo): HQ-V1RWS-A-SSCTR-R3-SYMPTOM-SIGNAL, sobre a leitura da parada em toda fonte e a monotonia até a triagem. Ele se soma aos dois da r2.

## 7. O que rodei, onde, e o que não verifiquei

**Rascunho:** `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/c10c7f19-99c9-449b-b28b-312cccb82112/scratchpad/ssctr-r3-ff-1794656658/`
- `old-a8e9b05/` e `old-d6381bb/`: `git archive` + `node_modules`;
- `probes/`: p1c, p1d e p1f do juiz anterior (cópias com a raiz trocada), `d1-differential`, `s1-signal`, `b2-ask`, `m1-merge`, `r1-race`, `u1-unplanned`, `x1-security-points`, com as saídas `.out`.
- Do juiz de Security, só li o relatório, as saídas e as sondas `early-queued.mjs` e `custody-stop.mjs`, como referência; a evidência é a minha sonda.

**Comandos:**
- `sha256sum` dos registros, dos valores e dos arquivos do host;
- `node --test test/v1rws-*.test.mjs` no worktree: 74/74;
- `node scripts/v1rws-freeze.mjs --preserved`.

Não rodei `npm run verify`, `verify-r*`, `*-freeze --write`, `v1rc-journeys`, `v1rc-fuzz` nem `validate_records.py`.

**Não verifiquei:**
- a suíte inteira (1409 entradas, afirmada pelo autor);
- `v1rc-freeze --check 1`;
- mutação;
- QRE-RWS-B-01 além do efeito esportivo;
- B-04, B-05 e B-06 do QRE;
- custódia e classificação de dados (Security);
- o hold F08 em execução;
- triagens `eligibility.assessedOnOrAfterRace`, `assessedAfterHold` e `assessedToday` (lidas no código, que trata todo `eligibility.*` como pedido de elegibilidade; não executadas);
- cobertura fora das grades;
- a redação final;
- a fase B.

**Literatura:** nenhuma afirmação científica nova. WebSearch e WebFetch estavam disponíveis como ferramentas adiadas e não foram usadas.

**Contexto injetado pelo host (divulgado):**
- CLAUDE.md global (`c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6`);
- CLAUDE.md do projeto (`e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6`);
- MEMORY.md (`afd187467bec0da84e92007bd03cb902a4c0039f6b9e41f0927ace7ff7c349a8`).

Lidos só como contexto. Nada deles serviu de evidência.
