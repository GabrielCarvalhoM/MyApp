# SSCTR — reverificação do ciclo corretivo da fase B (Race Forecast + Pace Insights), R2 — 2026-11-16

**Veredito: ACCEPT_WITH_CONDITIONS**, nos bytes de `0d3015b`, para `V1X-RUN-FORECAST` e `V1X-PACE-INSIGHTS`. Só dados sintéticos.

- Nenhum achado bloqueador resta.
- A-01 e A-02 estão fechados, reproduzidos por sondas minhas.
- As cinco leituras novas são aceitas.
- **A revisão de ritmo (`V1X-PACE-REVISION`) não está aprovada** e não é julgada de novo aqui.

Registro estruturado: `SSCTR_V1RFC_RECHECK_R2.json`. Sondas novas: `probes/r2/`. Não editei os meus arquivos da R1.

## Quem julga

- **Instância:** a mesma instância SSCTR independente da R1 (SSCTR-1.0.0, claude-opus-5-5), sob PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. Não escrevi a r1, a r2, o candidato nem o ciclo.
- **Natureza:** não é revisão humana, validação empírica nem juízo clínico.
- **Literatura:** nenhuma pesquisa nova.
- **Contexto do host:** o mesmo da R1, usado só como orientação.

## O que li e rodei

**Li inteiros:**
- o registro do ciclo (`PHASE_B_CORRECTIVE_CYCLE.md`, `9c1ec9c9…`);
- o parecer de Quality R1 (`ce3b625a…`);
- o parecer de Security R1 (`f4eb7c9c…`);
- a diferença `400edb7..0d3015b` em `CoachingCore`;
- o teste novo do ciclo (lido, não tomado como prova).

**Conferi:** `v1-race-forecast.mjs`, o arquivo de valores e os scripts não mudaram.

**Rodei:**
- **As oito sondas da R1, sem mudança**, todas passam em `0d3015b`:
  - p01: 224/224;
  - p02: 61/61;
  - p03: 49/49 (a verificação que falhava passou);
  - p05: 7/7;
  - p06: nenhuma palavra proibida;
  - p08: mostra que a A-03 da revisão continua aberta.
- **Sonda nova `q01-cycle.mjs`:** 15/15, com cenários meus.
- **Testes do autor:** 85/85, uma vez.

## Achados da R1

| Id | Estado | Como conferi |
|---|---|---|
| **SSCTR-RFC-A-01** | **FECHADO** | Ver o item abaixo |
| **SSCTR-RFC-A-02** | **FECHADO** | Ver o item abaixo |
| A-03, A-11 (revisão) | abertos | Antes de qualquer registro da revisão |
| A-09 | aberto | Questão para o SSCTR da IC-2 |
| A-04, A-05, A-08, A-10 | notas | Sem mudança; a A-08 agora é ainda mais estrita |
| A-06 (B-3), A-07 (B-1) | condições mantidas | B-1 reproduzido de novo |

**A-01.** Uma pausa de 14 dias declarada na segunda em que começa é retirada, com motivo `DECLARED_BREAK_OF_14_DAYS_OR_MORE`:
- na resposta que a grava;
- na quinta;
- na segunda e na quarta seguintes;
- na previsão e nos insights, sem número nenhum.

Uma de 15 dias em curso, declarada na quinta, também. Depois do fim vale o caminho que já existia (modo RETURN). Pausas de 13 e de 8 dias retiram só a semana em que são declaradas.

**A pausa com início futuro.** O motor congelado não grava a declaração: responde ASK e não guarda fato. A regra lê toda pausa em registro que ainda não terminou. **Isso atende ao meu critério de fechamento.** O critério era "pausa ≥ 14 dias em registro, em curso ou por vir", e uma declaração que o motor recusa não está em registro. Além disso, até a pausa começar, as faixas se apoiam em treino que de fato aconteceu. O resíduo é a B-02.

**A-02.** Num atleta meu:
- hold na quarta da semana 5;
- todas as sessões das semanas 5 e 6 relatadas como concluídas;
- prontidão declarada na quarta da semana 6.

As semanas 5 e 6 não contam e ficam fora da média, embora as sessões delas apareçam `COMPLETED`. As semanas de retorno também não contam.

## Leituras que mudaram

- **(a) Par da resposta só com referência anterior HIGH e dentro da população: aceito.**
  - O par mede uma mudança de poucos por cento, e um resultado medido por GPS tem erro de distância do mesmo tamanho (3,2–6,1 %, V1RC SRC13). Deixá-lo atualizar R leria erro de medida como resposta ao treino.
  - Sem par, vale o prior decidido (r1 F3).
  - A referência por GPS ainda serve à regra de lentidão: no meu atleta, um resultado posterior 3,5 % mais lento dá g = 0.
  - Custo, dito às claras: com a anterior por GPS e a posterior menos de 3 % mais lenta, perde-se o freio do par. O central fica uma unidade de arredondamento mais rápido (2910 contra 2925 s); as bordas não mudam.
- **(b) O insight lê a faixa com que a sessão foi entregue: aceito.**
  - É a faixa em vigor na semana da sessão (r1 F9), como o atleta de fato a recebeu e correu.
  - Refazer a faixa de uma semana passada depois de uma correção classificaria a sessão contra um alvo que o atleta nunca viu.
  - Sessão entregue só por esforço não tem faixa e não vota: é o lado da abstenção.
  - No meu atleta, cinco sessões de limiar foram lidas exatamente contra a faixa entregue de cada uma, inclusive as faixas mais rápidas depois que o fator Q8 subiu.
- **(c) Linha só dentro da semana da própria sessão e gravada depois de o plano existir: aceito.**
  - Erra para baixo na previsão e só custa evidência nos insights.
  - Conferido: o longão da semana 4 corrido na segunda da semana 5 com o mesmo id é `MISSING_REPORT`.
  - Custo: a sessão feita um dia atrasada é dose recebida e não creditada. Product/UX + Data (G03) devem saber disso.
- **(d) Retirada até a virada quando chega, dentro da semana, um relato de sessão anterior que já tinha relato, ou se declara uma pausa: aceito.**
  - A decisão manda recalcular só na virada. O motor reescreve a linha, então a semana não pode ser relida como estava.
  - Retirar remove uma afirmação e nunca acrescenta uma.
  - Conferido: uma segunda fonte na quarta retira a semana na quarta e na sexta, e a semana seguinte é lida de novo.
  - Condição de integração: medir a fração de semanas retiradas assim.
- **(e) Semana em que um hold clínico esteve de pé tem crédito zero: aceito.**
  - É a regra decidida.
  - Os fatos são do próprio motor; não há inferência clínica.
  - O resíduo é a B-01.

## Achados novos

| Id | Gravidade | O quê | Fecha com |
|---|---|---|---|
| SSCTR-RFC-B-01 | NOTE | Propriedade do modelo decidido, não falha de implementação. Com a referência medida depois de um hold, as semanas sem crédito deixam o atleta mais embaixo na curva de saturação, e as semanas restantes rendem um pouco mais (g 0,0090 contra 0,0061; borda rápida 2745 contra 2760 s, uma unidade de arredondamento; central e borda lenta iguais). Com a referência antes do hold, o hold nunca soma ganho | Nada agora. Entra na recalibração empírica de G e τ (D7) como caso a testar |
| SSCTR-RFC-B-02 | NOTE | Uma pausa anunciada antes de começar não está em registro (o motor não a grava), então não retira nada até começar | Antes de integração, se o contrato iOS deixar anunciar pausa futura: o motor ou o adaptador a grava (motor congelado: decisão do Founder) |

## Notas do Quality encaminhadas a mim

- **V5 × L-1 (QRE-RFC-A-06):** a V5 é ZERO, então as duas leituras não divergem. O caso da semana em que o aparelho chega agora é semana retirada (d).
- **L-12:** já julgada na R1. Vale só para a revisão.
- **L-14:** aceito. Sessões nativas de limiar com voltas de 1.200 m (bloco planejado de menos de 300 s) saem dos insights, como a regra decidida manda. Que o V1RC as leia para o Q8 é a parte aberta da SSCTR-RWS-A-04, no V1RC congelado, e fica registrada para o Founder.
- **B-3, as duas leituras:**
  - (i) A leitura literal ("borda rápida mais rápida que a verdade") seria verdadeira por construção na maioria dos casos sem resposta, então não pode ser a intenção ao lado de 80 % de cobertura. A leitura do autor é coerente.
  - (ii) A medida usa o envelope não arredondado e uma única configuração.
  - Nenhuma das duas muda a R1: nada bloqueia o candidato sintético, nada afirma cobertura, a A-06 fica.
- **R-11 no central arredondado:** aceito, como na R1. Vale o central exibido: 21.629 s aparece como 6:00:00 e é mostrado; 21.631 s aparece como 6:01:00 e é retido.
- **IC-1, regra 3 (QRE-RFC-A-07):** aceito como conforme. Sem extensão medida, o "senão 0" decidido dá 0, com ou sem o rótulo de repetição. Condição para quando a extensão das voltas existir: só uma repetição de bloco repetido ganha 0; uma etapa WORK única ou de pirâmide ganha a fração medida.

## Perguntas da Security ao SSCTR (só a revisão)

- **SEC-RFC-A-02: confirmo.** Todo sinal de término, ou toda condição que teria impedido a oferta, que surja depois da virada retira também a oferta aberta da semana. Um ACCEPT posterior não nomeia oferta nenhuma, e a próxima oferta respeita 28 dias depois do término.
- **SEC-RFC-A-03: uma retirada encerra a revisão; não a suspende.** A A3 põe as retiradas V1RC entre os términos. Uma revisão nova pede oferta nova, sob todas as condições. O término deve sair de fatos duráveis do registro, nunca do estado de hoje.

## O que continua aberto, e está dito como aberto

A seção 4 do registro do ciclo diz que a revisão não está aprovada, segue desligada, sem registro, e não afirma falhar fechado. Os itens abertos dela estão listados lá:
- SEC-RFC-A-01, A-02, A-03 e A-10;
- SSCTR-RFC-A-03, A-11 e a questão da A-09;
- QRE-RFC-A-04;
- a condição da L-12.

Também lá estão os limites: QRE-RWS-F-01, o hard gate E-1, as duas vozes e a custódia. Nada no ciclo diz que um hard gate foi atendido.

## Registros habilitadores (não escritos nesta vez)

| Fronteira | Nos bytes de `0d3015b` |
|---|---|
| `V1X-RUN-FORECAST` | **Emitiria**, `APPROVE_WITH_CONDITIONS` / `SUPPORTED_WITH_LIMITS`, depois de ler inteiras as reverificações de Quality e Security e só se elas permitirem |
| `V1X-PACE-INSIGHTS` | **Emitiria**, nas mesmas condições de leitura |
| `V1X-PACE-REVISION` | Nenhum registro |

Condições da previsão:
- dados só sintéticos; V1 authority NO;
- amarrada aos valores `eae01117…e840` e ao runtime de `0d3015b`;
- é um envelope, nunca uma probabilidade; os limiares da simulação ficam como não atendidos; nada afirma cobertura (A-06);
- antes do uso com atleta: E3, E4, A-06 e A-07;
- antes de integração: QRE-RWS-F-01, E-1, R-11 e as condições V1RC herdadas, a fração de semanas retiradas medida e a B-02;
- recalibração empírica antes de qualquer alegação de acerto, com a B-01 como caso a testar.

Condições dos insights:
- dados só sintéticos;
- só observam;
- amarrados aos mesmos bytes;
- QRE-RWS-F-01 e E-1 antes de integração;
- a fração de semanas retiradas medida;
- A-05 reabre se os formatos mudarem;
- nenhum texto convida a correr mais rápido que a dica.

**Fila humana:** proposta e não anexada, HQ-V1RFC-SSCTR-RECHECK-R2. Os registros, quando emitidos, levam a entrada QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.

**Escrita:** só estes dois arquivos e `probes/r2/`. Nenhum arquivo rastreado foi editado. Não usei git de escrita. `SSCTR_V1RFC_RUN_RECORDS.json` não foi escrito.
