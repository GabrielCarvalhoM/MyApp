# SSCTR — julgamento da implementação do Race Forecast + Pace Insights (fase B), rodada 1 — 2026-11-16

**Veredito: BLOCK, nestes bytes** (candidato `400edb7`, base `f32a711`, V1RWS-2).

Há um achado bloqueador, estreito: uma retirada decidida não acontece na hora. Uma condição fecha no mesmo ciclo. O resto se sustenta:
- os 43 exemplos reproduzem ao segundo, com entradas montadas por mim;
- os limites da projeção valem;
- os Pace Insights só observam;
- a fronteira de evidências vale nos meus próprios atletas.

Registro estruturado: `SSCTR_V1RFC_REVIEW_R1.json`. Sondas: `probes/`.

## Quem julga e com que autoridade

- **Quem julga:** uma instância SSCTR nova (SSCTR-1.0.0, constituição `9de27b4d…`, skill `67374297…`, modelo claude-opus-5-5), sob PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY.
- **Independência:** não escrevi a r1, a r2 nem o código. Não afirmo despacho nativo.
- **O que este julgamento não é:** revisão humana, validação empírica ou juízo clínico. Os dados são só sintéticos.
- **Literatura:** nenhuma pesquisa nova. Cito só o que a r1, a r2 e a V1RC já assentaram.
- **Contexto do host:** recebi o CLAUDE.md global, o do projeto (`e657d059…`) e o índice MEMORY.md (`be12c509…`). Serviram de orientação, nunca de evidência.

## O que rodei

Todas as entradas e os valores esperados saem do texto da decisão, não dos helpers do autor. Dos helpers do teste usei só a mecânica de cliente (timeline, relato).

| Sonda | O que mostra | Resultado |
|---|---|---|
| p01 | Exemplos da r2 com entradas minhas: a–h, d2, e1, e2, A1-1/2, A2-1/2/3 e A4-1, nas duas faixas (segundos, status, exibição, flags, confiança, R_c/R_hi, H). Também A4-1 a A4-3, cada causa de não exibição na semana da prova, i (111/112/113 dias), os nove A5, AD-1 inteiro, PI-1, PR-2 e PR-3 | 224/224 |
| p02 | PR-1 por `paceRevisionOf`, com semanas montadas por mim; cada condição de oferta, cada término, a caducidade | 61/61 |
| p03 | O ponto de entrada composto (cenários abaixo) | 48/49; a falha é o A-01 |
| p04 | Duração dos blocos nativos; a semana em que se declara uma pausa de 14 dias | ver A-01 e A-05 |
| p05 | Linha mascarada sem distância (F-01), num atleta meu de meia maratona | 7/7 |
| p06 | Todo texto emitido em duas jornadas inteiras | 0 palavras proibidas; 0 `FORBIDDEN_CLAIM`; nada de "critical speed" |
| p07 | As regras de g = 0; experiência NONE e desconhecida | conferem |
| p08 | Revisão ativa diante de uma pausa de 8 dias | ver A-03 |

Os cenários de p03:
- autoridade padrão: tudo DISABLED, e a resposta é a dos formatos chave a chave;
- adesão minha (1; 0,6; 1; 0,5938): as duas faixas iguais à minha conta, ao segundo;
- corridas leves rápidas não mudam nem a previsão nem os insights;
- sinal clínico: previsão e insights retirados;
- experiência desconhecida vira EXPERIENCED;
- maratona só como estimativa atual;
- sessões no calor e na esteira não votam e contam adesão 1;
- com os insights ligados, nenhuma chave dos formatos muda, e o hash da calibração também não;
- a revisão fica INERT, com a faixa V1RC.

Também rodei:
- **Os 78 testes do autor**, uma vez: 78 de 78. Não os tomei como prova.
- **A simulação**, sem `--out`: o resultado é idêntico às evidências já commitadas.

## Achados

| Id | Gravidade | O quê | Fecha com |
|---|---|---|---|
| **SSCTR-RFC-A-01** | **BLOCKING** | Uma pausa declarada de 14 dias ou mais não retira a previsão nem os insights na hora (r2 `withdrawal`; r1 F8: "na hora"; os insights pelas mesmas condições). Na semana em que a pausa é declarada, as duas faixas seguem `SHOWN` até a virada ("se você continuar treinando como nas últimas 4 semanas…"), e os insights seguem `ACTIVE`. Conferi de novo na sexta-feira daquela semana. Uma pausa retroativa sai, mas só pela calibração | Retirar as duas saídas a partir da resposta em que a pausa ≥ 14 dias está no registro, enquanto ela estiver em curso ou por vir. Depois disso valem os caminhos que já existem. Teste de resultado no ponto composto: a revisão que declara a pausa, outro dia da mesma semana e uma pausa que começa no futuro. Nenhum valor muda |
| SSCTR-RFC-A-02 | CONDITION | Semanas de HOLD não contam como semanas de crédito zero na leitura composta: ela só marca os modos walk/jog/restart/return. O hold aqui é da revisão (F08), não um modo da semana. Achado por leitura de código; não reproduzi ponta a ponta | Antes do registro da previsão, no mesmo ciclo do A-01: semana com calibração `WITHHELD_HOLD`, ou coberta por um hold em vigor, tem crédito zero, com teste. Ou a Engenharia mostra, por teste, que essa semana nunca leva relato creditado |
| SSCTR-RFC-A-03 | CONDITION (só a revisão) | Uma revisão ativa não termina na hora com uma pausa declarada ≥ 7 dias, como pede a A3. Com 8 dias, a V1RC fica calibrada, o modo segue EASY e a revisão continua | Antes de qualquer registro de `V1X-PACE-REVISION` |
| SSCTR-RFC-A-04 | NOTE | S4 (etapa contínua por tempo, parada em 15 de 20 min) dá 0,75 na função pura e 0 ponta a ponta: a RWS não expõe segundos medidos por etapa. É o "senão 0" da própria decisão, e erra para baixo | Rever quando a RWS expuser os segundos das voltas |
| SSCTR-RFC-A-05 | NOTE | A L-14 lê o passo planejado e o peso de planejamento (ponto médio) de cada etapa, não o bloco como foi corrido. Uma etapa de distância com peso pouco acima de 300 s, corrida mais rápida, dura menos de 5 min. Nas 56 etapas amostradas, nenhuma cai abaixo de 300 s. Pelo contrato ADF, relatos nativos não trazem ritmo de trabalho | Reabrir se o catálogo de formatos mudar, ou se relatos nativos passarem a trazer ritmo |
| SSCTR-RFC-A-06 | CONDITION | B-3 (abaixo) | Condições do registro |
| SSCTR-RFC-A-07 | CONDITION | B-1 (abaixo) | Antes do uso com atleta |
| SSCTR-RFC-A-08 | NOTE | O par e a comparação de lentidão são mais estritos que a r1, no lado seguro | — |
| SSCTR-RFC-A-09 | CONDITION | B-5, na revisão (abaixo) | O SSCTR que julgar a IC-2 decide |
| SSCTR-RFC-A-10 | NOTE | `INSUFFICIENT_DATA` sempre leva a `INFORMATIVE_ONLY`; `STABLE` e `MIXED` levam a `NONE`. Nenhum dos dois sugere nada | — |
| SSCTR-RFC-A-11 | NOTE (só a revisão) | Quando a revisão termina na virada, uma sessão do primeiro dia daquela semana ainda é classificada contra a faixa revisada. A faixa que o seletor lê está certa | Junto com o A-03 |

## V5, L-1 a L-15, B-1 a B-5

- **V5: contada com crédito 0** (`ZERO`, o valor provisório do candidato). **Esta resposta prevalece.**
  - Pela última regra da própria r2, um relato sem extensão registrada vale 0.
  - A adesão da previsão é um indicador do estímulo recebido e deve errar para baixo (A6).
  - Excluir a sessão dos dois lados deixaria quem tem muitas sessões ilegíveis com adesão alta, tirada das poucas legíveis: o lado do excesso de crédito.
  - Uma correção posterior reclassifica a sessão.
- **L-1: aceito.** Uma linha em conflito não é execução legível. Ela nunca chega ao crédito 1, porque o `completed` do motor é falso para ela.
- **L-2: aceito.** O crédito mede a dose recebida. Uma sessão pulada pelo plano e não movida é dose não recebida, qualquer que seja a causa. A sessão movida conta uma vez; a opcional, só se relatada. A semântica G03 fica com Product/UX + Data.
- **L-3: aceito.** A menor distância utilizável sobre o alvo é a extensão conservadora. `extentFraction` nunca é lido: o grep acha só um comentário. Isso fecha a SSCTR-RWS-E-03 para os leitores desta fase.
- **L-4: aceito.** Experiência não informada lê EXPERIENCED, o menor teto (ADF seção 6, r1 F2). Conferido ponta a ponta.
- **L-5: aceito.** A fronteira de evidências só existe pelo ponto de entrada dos formatos.
- **L-6: aceito.** É a condição da A1 e a regra de recalcular só na virada da semana.
- **L-7: aceito.** Anular o par através de uma lacuna deixa o prior, que é mais largo, nunca mais confiante.
- **L-8: aceito.** O congelado da semana da prova nunca aparece alterado; a leitura do autor é mais estrita que isso.
- **L-9: modifico.**
  - Aceito: a janela de 112 dias e "estimativa indisponível" não se aplicam aos insights. Essas regras protegem uma projeção; os insights leem a faixa da semana de cada sessão.
  - Não aceito: a pausa ≥ 14 dias também retira os insights na hora (r1 F8, "as mesmas condições"). É o A-01.
- **L-10: aceito.** A decisão não nomeia ação para STABLE ou MIXED; `NONE` não sugere nada.
- **L-11: aceito.** É mais estrito e nunca mantém uma revisão por mais tempo.
- **L-12: aceito, com uma condição.**
  - O vocabulário V1 não tem GOOD: a qualidade do aparelho é OK, POOR ou ausente. OK é a avaliação positiva; ausente é "só não ruim" e não serve. É o que a A3 quis dizer.
  - Condição, antes de qualquer registro da revisão: só vale a qualidade escrita pelo aparelho. O app nunca diz OK por ele (QRE-RWS-F-01 (a), SSCTR-RWS-F-02). E a Data confirma o mapeamento do HealthKit.
- **L-13: aceito.** O esforço relatado é a palavra do atleta, não evidência de ritmo.
- **L-14: aceito.**
  - Fecha a SSCTR-RWS-A-04 para os leitores desta fase, que nunca dependem de `paceEvidence === true`.
  - A A-04 fica aberta para qualquer outro leitor do campo.
  - O resíduo é o A-05.
- **L-15: aceito.** A R-11 segue condição herdada de integração. A comparação usa o central exibido, que é o que o atleta leria; a borda é de menos de 30 s.
- **B-1: confirmado.** É consequência da atualidade da V1RC, e o código não precisa mudar.
  - Com um só resultado anterior ao plano, a previsão de 10K aparece nas semanas 1 a 8 e passa a `TOO_UNCERTAIN_TO_SHOW` a partir da 9. A de meia a partir de um 10K nunca aparece.
  - É a abstenção funcionando: a previsão não sobrevive à evidência de que parte.
  - Antes do uso com atleta (A-07), o Founder e o Product precisam saber: no caso mais comum, a previsão existe só na primeira metade de um plano de 16 semanas, e a semana da prova não mostra nada.
  - O estado indisponível diz o motivo V1RC e só as rotas decididas: relatar um resultado de prova na distância (nunca um convite a se inscrever) e o teste P3 só quando oferecido.
  - Não se relaxa atualidade, margem nem wMax para mantê-la na tela.
- **B-2: aceito.** O estado é inalcançável enquanto o motor planejar no máximo 16 semanas (111 dias). Passa no exemplo i.
- **B-3: condição; não bloqueia um candidato sintético.** Confirma o que a r1 C5 e as abstenções já dizem.
  - O envelope nunca foi um intervalo de probabilidade. A borda lenta é a própria estimativa V1RC, e a largura é a margem V1RC de uma fonte só.
  - Os erros do lado lento vêm da estimativa de que a previsão parte, não de algo que a fase B acrescenta. Os dois critérios de erro do central são atendidos.
  - Condições (A-06):
    - os limiares ficam registrados como **não atendidos** e nunca apresentados como atendidos;
    - nada afirma cobertura ou acerto;
    - antes do uso com atleta, quem escreve o texto (E3, E4) fica sabendo que a "ponta lenta" não é um piso: no gerador, a verdade ficou mais lenta que ela em até cerca de um quarto dos casos;
    - a recalibração empírica (r1 F1, D7) continua sendo a porta de qualquer alegação de acerto.
  - A segunda descrição (TOTAL), feita depois de ver o resultado, só explica o mecanismo e não pesa no juízo. Não peço ajuste do gerador nem dos valores.
- **B-4: aceito.** São razões da decisão, e nada as emite.
- **B-5: aceito nos insights, onde é o contrato da r1 F9 e a sessão excepcional aparece na saída.** Na revisão, uma sessão muito mais lenta, no esforço certo, pode ser vencida no voto e virar oferta. Mudar isso é emenda da regra de oferta da A3, não falha de implementação. Fica para o SSCTR que julgar a IC-2 (A-09).

## Os pontos que pediram cuidado

- **Números.** O arquivo de valores é igual a `values` da r2 (hash `eae01117…e840`). Não achei número, porta ou tolerância que as decisões não deem.
- **Limites da projeção:**
  - a ponta lenta é sempre a estimativa atual, e O nunca é somado (g = U + F);
  - a semana da referência é creditada nela;
  - as duas faixas aparecem com a observada primeiro, e o cenário nunca aparece sozinho enquanto a observada existe;
  - a maratona aparece só como estimativa;
  - a janela é de 112 dias;
  - a semana da prova mostra só o congelado, só low–high, datado, depois da cautela, nunca no dia da prova, nunca com meta;
  - a relação com a meta é neutra;
  - o crédito é por extensão;
  - cada regra de g = 0 vale;
  - cada retirada vale, **menos a pausa ≥ 14 dias (A-01)**.
- **Incerteza:**
  - confiança LOW sempre que há ganho;
  - nada de z, porcentagem ou probabilidade ao lado da faixa (o texto de base diz "not a probability", como decidido);
  - evidência fraca dá um estado indisponível explicado, nunca um valor inventado;
  - um recorde pessoal antigo é `HISTORICAL_BEST` na V1RC e nunca capacidade.
- **Fronteira de evidências:**
  - adesão, ritmo, carga e resultado de prova seguem separados;
  - sessão retida não vota e conta adesão;
  - a SSCTR-RWS-F-01 fecha para esta fase: as leituras são completas, nunca `reportsVerdict`, e a linha mascarada não vota no meu atleta;
  - a A-04 e a E-03 fecham para os leitores desta fase pela L-14 e pela L-3.
- **Limites abertos:**
  - os dois testes `LIMIT, open` mostram QRE-RWS-F-01 e E-1 como estão;
  - nada no candidato diz que um hard gate foi atendido;
  - nenhum dos dois precisa fechar antes de um registro **sintético** da previsão ou dos insights;
  - os dois precisam fechar antes de integração, atleta real ou qualquer registro da revisão.

## Registros habilitadores

| Fronteira | Nestes bytes | Depois |
|---|---|---|
| `V1X-RUN-FORECAST` | **Não emitiria** (A-01, A-02) | Emitiria num sucessor que feche A-01 e A-02, julgado só nessa diferença, depois de ler inteiros os pareceres de Quality e Security. Seria `APPROVE_WITH_CONDITIONS` / `SUPPORTED_WITH_LIMITS`, com as condições abaixo |
| `V1X-PACE-INSIGHTS` | **Não emitiria** (A-01) | O mesmo |
| `V1X-PACE-REVISION` | **Nenhum registro** | Espera a IC-2. Antes, também A-03, A-11, a condição da L-12, a questão do A-09 e o E-1 |

Condições da previsão:
- dados só sintéticos; V1 authority NO;
- amarrado aos valores e aos bytes de runtime julgados;
- é um envelope, nunca uma probabilidade, e os limiares da simulação ficam como não atendidos;
- antes do uso com atleta: E3, E4, A-06 e A-07;
- antes de integração: QRE-RWS-F-01, E-1, R-11 e as condições V1RC herdadas;
- recalibração empírica antes de qualquer alegação de acerto.

Condições dos insights:
- só observam;
- QRE-RWS-F-01 e E-1 antes de integração;
- A-05 reabre se os formatos mudarem;
- nenhum texto convida a correr mais rápido que a dica.

## O que não verifiquei

- Um hold seguido de liberação, ponta a ponta: o A-02 vem só da leitura do código.
- A triagem de sinais de alerta e a prova de conclusão, ponta a ponta: só código e os testes do autor.
- O HealthKit real.
- A custódia do registro de respostas (Security).
- As fontes da r1/r2/V1RC, que não reverifiquei.

**Fila humana:** proposta e não anexada, HQ-V1RFC-SSCTR-REVIEW-R1. Esta revisão não aprova nada prescritivo.

**Escrita:** só estes dois arquivos e `probes/`. Nenhum arquivo rastreado foi editado. Não usei git de escrita. `SSCTR_V1RFC_RUN_RECORDS.json` não foi escrito.
