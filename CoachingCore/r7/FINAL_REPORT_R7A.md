# DOMAIN_COACHING_R7-A — Relatório final

**Fase:** R7-A, a primeira de quatro (R7-A, R7-B, R7-C, R7-D). Este relatório cobre só a R7-A.
- **Data:** 2026-10-27.
- **Escopo:** referência offline, sintética, Node 24, modo sombra. Nenhum efeito em produção, planos reais, UI, Figma, KMP, HealthKit ou integrações.
- **Validação:** nenhuma afirmação de validação humana, empírica ou clínica.
- **Runtime revisado:** R7A-FREEZE-2 (`r7/RUNTIME_FREEZE_R7A_2.json`, digest `f56ae974…`), depois de um segundo ciclo limitado. A primeira revisão dos dois juízes foi sobre R7A-FREEZE-1 (`r7/RUNTIME_FREEZE_R7A_1.json`, digest `1f2bb1d8…`). Política R6-POLICY-5 inalterada (`18ec48f3…`).
- **Limite de ciclos:** uma revisão por juiz e no máximo uma re-verificação estreita, só com bloqueios novos, estreitos e de runtime. Não houve terceiro ciclo.

> **Resultado: R7A_EXIT_READINESS = NOT_READY.** A R7-A fecha com bloqueio explícito: sete bloqueios nomeados nas re-verificações únicas dos dois juízes sobre R7A-FREEZE-2.
> - Engenharia: QE-R7A-01, 02, 03, 05, 12 corrigidos só em parte; QE-R7A-19 novo.
> - SSCTR: D56, novo.
>
> D54 e D55 estão resolvidos. D53 está corrigido nos seus caminhos originais, mas não fecha pelo §16, porque D56 é um caminho equivalente aberto. O limite de ciclos não admite um terceiro ciclo. Por isso não há handoff, e a R7-B não foi iniciada. Detalhes em `r7/READINESS_R7A.json` e `audits/domain-coaching-r7a-2026-10-27/FINAL_DISPOSITION.json`.

## 1. Estado inicial

- A R6 fechou com bloqueio explícito: o SSCTR negou o FREEZE-2 na rodada 12 por D53 (caminho "a partir do log") e D54. Todos os vereditos R6 ficaram NOT_READY, exceto RETURN_AFTER_PAUSE_READINESS = PARTIAL.
- O runtime em que a R7-A começou é o que o SSCTR revisou na rodada 12 (`r6-program.mjs` `57973e97…`), nunca congelado. Ele foi copiado byte a byte em `audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/` antes de qualquer edição.
- **Linha de base:** 443/443 testes; 1.007 arquivos protegidos ligados por hash em `BASELINE.json` (todo o `CoachingCore/`, `product/`, `canon/`, a auditoria R6 fechada, o registro VWS, os arquivos de missão e a fila humana).
- **Escopo de plataforma reidratado:** V1 só iOS; HealthKit inbound obrigatório; Garmin, COROS, Polar, entrega estruturada ao Apple Watch e Android são POST_V1 (DR-117–123). A R7-A avaliou o Core só por entradas canônicas.

## 2. Bloqueios R6 consumidos

| Item | Comprovado antes | Depois |
|---|---|---|
| D53 | O instrumento do próprio SSCTR (rodada 12), rodado sem mudança no runtime anterior, reproduz as 43 seções byte a byte; grade AI com logs ruidosos: 48 próximas exposições mais de uma série acima do restabelecimento | Caminhos originais: 0 saltos (AI ruidoso 48 → 0; AH 0 de 584; casos AJ "a partir do log" sem violação). Mas o segundo ciclo abriu um caminho equivalente, D56 (semanas ajustadas ao tempo), e por isso D53 não fecha pelo §16 |
| D54 | AK: 70 linhas acima da dose da fase; sonda R7-A: 120 linhas de semana da prova e pós-prova a 2×5 @RIR3 contra 1 série @RIR ≥ 4 | AK 0; sonda R7-A 0 de 3.360 linhas |
| FREEZE-2 recusado | — | Sucessores R7: R7A-FREEZE-1 (primeira revisão do SSCTR e de um juiz de engenharia independente) e R7A-FREEZE-2 (segundo ciclo e re-verificação única) |

## 3. Causas raiz

**Comprovado** (sonda antes/depois, teste e mutação para cada uma):
1. **Duas definições do mesmo conceito.** A prescrição decidia "restabelecimento" para qualquer estado com intervalo acima de 28 dias; a transição só reconhecia um quando o estado era de carga conhecida. No caminho "a partir do log" a recuperação de séries não começava (D53).
2. **Retorno antecipado antes do modificador de fase.** A linha de restabelecimento saía da função antes da redução de fase (D54). Outras duas linhas (entrada do retorno) também saíam antes, mas ficavam dentro da dose só porque os valores da política coincidem.
3. **Reconstrução da semana a partir da linha errada.** A revisão lia a última exposição *prescrita* de cada exercício e re-derivava seu significado pelo modo de carga, em vez de ler o que foi prescrito e executado (R19).
4. **Estado de exercícios fora de uso.** Exercícios trocados pela rotação ficavam parados no passo 0 do retorno e faziam a semana parecer de entrada para exercícios novos.
5. **Desconhecido lido como zero.** Uma série registrada sem repetições valia 0 repetições: regressão de repetições e, com carga conhecida, revisões inválidas.
6. **Fusão dependente da ordem.** Na entrada, um registro externo sem dose completa substituía a dose completa relatada pelo atleta (último vence).
7. **Contradição tratada como duplicata.** Dois relatos da mesma sessão com cargas diferentes eram fundidos em silêncio, e o resultado dependia de qual chegava primeiro.
8. **Registro carregado não era só de acréscimo.** O fato corrigido saía do registro; na revisão seguinte a correção era rejeitada e a sessão perdia sua execução.
9. **Escopo de data ignorado.** Uma mudança de turno de um dia virava permanente, e o próprio dia não mudava.
10. **Duração da prova lida como meta.** Uma prova terminada antes da janela era registrada como parcial.

**Segundo ciclo** (achados dos juízes sobre R7A-FREEZE-1, cada um reproduzido pelas sondas deles; dez dos doze bloqueios já existiam no runtime de fechamento da R6):

11. **Revisões da mesma semana dependiam da ordem** (QE-R7A-01). Uma revisão semanal depois de um retorno que começa na semana seguinte reconstruía essa semana a partir do estado anterior à pausa e apagava o retorno.
12. **"À frente" significava só uma data posterior** (QE-R7A-02). Uma sessão no dia do relato de retorno, ainda sem relato, mantinha a dose de antes da pausa.
13. **Mudanças sempre a partir da semana seguinte** (QE-R7A-03, 04). Uma prova antecipada deixava os dias restantes desta semana com dose de construção dentro do novo polimento; uma prova adiada mantinha a sessão de prova antiga; a validação rejeitava propostas comuns depois da mudança.
14. **Fusão pela "melhor fonte" inteira** (QE-R7A-05, 06, 07). Um segundo relato concordante com menos exercícios apagava os registros manuais; o prefixo do nome do provedor decidia a qualidade; repetições, reserva e libras não entravam no teste de concordância.
15. **Registro carregado com uma só identidade por linha** (QE-R7A-08, 09). A correção de um relato fundido e a repetição exata de um relato fundido falhavam na revisão seguinte.
16. **Movimentos com a dose da data original** (QE-R7A-10); **datas de janela sem validação** (QE-R7A-11).
17. **Repetições curtas viravam meta** (QE-R7A-12). Em HOLD ou REGRESS, as repetições registradas substituíam a meta (3x3 abaixo da faixa do objetivo).
18. **Duas leituras da mesma semana** (QE-R7A-14, 15, 17). O ajuste ao tempo disponível era lido como redução de fase na revisão, mas não na projeção; a semana de entrada tinha duas definições; a linha de prática era lida pelo papel do catálogo.
19. **Exercício novo durante o retorno fora do retorno** (SSCTR D55). Ganhava uma série de fim de bloco com uma única exposição e subia de 2 para 4 séries.

**Correção honesta da primeira congelação:** três classes que dei como não aplicáveis em R7A-FREEZE-1 foram refutadas pelos juízes: C06 (rótulo de fonte: QE-R7A-05, 13), C08 (duplicatas: QE-R7A-05, 09) e C13 (estabelecimento × progressão: D55). Minhas sondas de classe variavam um relato isolado e não cobriam relatos fundidos nem o retorno.

Encontrados por mim durante o segundo ciclo, antes da congelação:
- A primeira versão da correção QE-14 lia uma semana reduzida por fadiga como não reduzida (a sonda FR2 do SSCTR mostrou).
- A primeira versão da QE-03 replanejava esta semana por uma simples troca de nome de fase, antes da data efetiva da mudança de objetivo (holdout H25).
- A primeira versão da QE-12 mantinha a meta antiga de repetições ao adotar uma carga recém-restabelecida (a sonda SW do SSCTR mostrou).

As re-verificações acharam mais dois efeitos do segundo ciclo que eu não vi: D56 (SSCTR) e QE-R7A-19 (engenharia). Estão nas seções 8 e 9.

## 4. Mudanças estruturais

Cinco arquivos (`dossier/RUNTIME_DELTA_R7A.diff`), sem mudança de política:
- **Um ponto de composição para a força.** Cada linha é um candidato (tipo, a contagem que o exercício teria naquele dia, teto da linha, piso de reserva) seguido de **um** passo de fase, igual para todas as linhas. Nenhuma linha sai antes dele.
- **Cada linha declara o que prescreve** (`exposure`: tipo, fase do dia, base da redução, contagens). A revisão lê isso. A primeira exposição executada decide o tipo da semana; a última executada dá as contagens. Linhas antigas, sem `exposure`, são classificadas com as regras que as escreveram.
- **A validação final** rejeita qualquer linha de força acima da dose da fase do dia, venha de onde vier; e uma sessão nunca é movida para um dia de outra fase.
- **Entradas canônicas:** fusão de registros de força independente da ordem e da fonte; repetições desconhecidas não pesam; relatos contraditórios viram conflito; o registro carregado guarda o fato corrigido como histórico inerte; uma mudança datada nunca vale além das datas; prova terminada é prova completa.

Segundo ciclo, nos mesmos quatro arquivos de runtime (`dossier/RUNTIME_DELTA_R7A_CYCLE2.diff`), sem mudança de política:
- **Uma composição da semana:** a revisão seguinte parte do estado de retorno que uma revisão anterior da semana guardou; o que está à frente é o que tem data posterior ou é do mesmo dia sem relato; uma reconstrução que começa nesta semana mantém o passado e replaneja o resto; uma mudança de prova que leva dias desta semana para o polimento, a semana de prova ou o pós-prova replaneja esses dias.
- **Uma leitura da semana:** cada linha guarda a contagem antes do ajuste ao tempo (`phasedSets`, reduzida também pela fadiga) e o plano guarda a contagem ajustada; o teto de um retorno é a maior contagem inteira executada fora de redução de fase (R20 do SSCTR), igual na projeção e na revisão; a semana de entrada é definida uma vez e viaja no estado.
- **Fusão por exercício:** conhecido vence desconhecido, depois a qualidade declarada, depois o valor conservador; cada relato fundido guarda seu hash; repetições, reserva e libras entram na concordância.
- **Doses que a data permite:** o planejador e os movimentos usam o mesmo teste de restabelecimento; em HOLD e REGRESS a meta de repetições não muda quando o registro confirma a carga conhecida; um exercício novo durante o retorno herda o bloco do retorno e sobe no máximo uma série por semana executada.

A re-verificação mostrou que essas mudanças não cobrem todos os caminhos: outros tratadores da semana, a fusão campo a campo, a carga mais leve e a leitura da semana ajustada para os tetos continuam abertos (seções 8, 9 e 11).

## 5. Invariantes

As 12 invariantes (INV-01 a INV-12), cada uma com sua autoridade na política ou no contrato, estão em `r7/CLASS_DISPOSITIONS_R7A.json`. Três delas ainda não valem em todos os caminhos: INV-03 (D56), INV-04 (QE-R7A-01, 03, 19) e INV-08 (QE-R7A-05). Em resumo: um passo de fase por linha; nenhuma linha acima da dose da fase; recuperação de no máximo uma série por semana executada após qualquer restabelecimento; a semana segue o que foi executado; exercício fora de uso não muda o estado; desconhecido não ganha valor; rótulo de fonte não muda decisão; duplicata não muda decisão e contradição é conflito em qualquer ordem; convenção diferente da planejada é desconhecida e perguntada; registro carregado é só de acréscimo; fato datado não vale além das datas; prova terminada é completa.

## 6. Testes adicionados

- `test/r7a-semantic-core.test.mjs`: 17 testes de propriedade e metamórficos sobre classes de equivalência (estados, fases, modos, representação, ordem, fonte), não sobre casos fixos.
- `test/r7a-cycle2.test.mjs`: 16 testes, um ou dois por classe do segundo ciclo (ordem de revisões, o dia corrente, mudanças que alcançam a semana, rótulos, unidades, correções carregadas, movimentos, datas, metas de repetição, ajuste ao tempo, semana de entrada, D55).
- Suíte: **476/476** (Node 24.19.0).
- Verificação por mutação (`probes/mutation-check-r7a.mjs`): **33 de 34** reversões de uma correção por vez são pegas pelos testes. A restante ("contagens da primeira exposição executada") não é coberta por nenhum teste. Eu a registrei como inalcançável, com base numa busca estreita demais (`probes/r7a-mutant-reach-search.out.json`). O juiz de engenharia mostrou que ela é alcançável (QE-R7A-22: retorno e depois fadiga sistêmica no meio de uma semana com teto). A R7A-FREEZE-2 se comporta corretamente nesse caso, mas é uma lacuna de teste aberta. Na primeira congelação foram 13 de 13, depois de fechar duas lacunas de teste; esse resultado está guardado em `mutation-check-r7a.FREEZE1.out.json`.
- O número de testes é só informativo.

## 7. Regressões

`r7/REGRESSION_R7A.json` roda as mesmas entradas no runtime de fechamento da R6 e no R7-A:

| Entrada | Resultado |
|---|---|
| Corpus R5 (24) | 24 idênticos |
| Perfis de desenvolvimento R6 (16) | 15 idênticos; WALK_JOG_FIVE_DAYS difere só no teto de retorno projetado depois de uma semana toda ajustada ao tempo (QE-R7A-14, só estado) |
| Simulações R6 (14 trajetórias) | 10 idênticas; T04 e T13: a meta de repetições não cai mais para a série curta (QE-R7A-12); T05 e T08: a sessão do dia do retorno, sem relato, recebe a dose do retorno (QE-R7A-02) |
| Holdout novo da R6 (35), **só como regressão** | 24 idênticos; 11 diferenças, cada uma nomeada pela correção que a causa (`r7/README.md`); uma única mudança de disposição, a mesma da primeira congelação (H23: o conflito de um dia agora pergunta em vez de mudar todas as semanas seguintes) |

O registro da primeira congelação está em `r7/REGRESSION_R7A_FREEZE1.json` (R5 24/24, perfis 16/16, simulações idênticas, holdout 27/35). Dois campos de registro passaram a ser ignorados como bytes (a marca de semana de entrada guardada no estado e os hashes por relato), porque seu efeito aparece nas linhas e decisões comparadas. Nenhum resultado antigo foi reclassificado, e nada disso é evidência de generalização.

## 8. SSCTR

**Primeira revisão** (R7A-SSCTR-r1, sobre R7A-FREEZE-1; `reviews/ssctr-r7a-review.md`): runtime não aceito.
- D53 e D54 resolvidos.
- Q1 decidida pela leitura A: a recuperação parte da contagem antes da redução de fase. Q2 a Q4 confirmadas.
- Um bloqueio novo: D55. Recomendações R17 a R24.

**Re-verificação única** (R7A-SSCTR-r2, sobre R7A-FREEZE-2; `reviews/ssctr-r7a-recheck.md`): runtime não aceito.
- **D55 resolvido.** Em 12 exercícios montados no passo 2 do retorno, nenhum ganha série de bloco nem sobe mais de uma série. Na FREEZE-1, 6 dos 12 saltavam duas.
- **S2, S3, S4, S5 e S7 valem** como composições das regras declaradas:
  - HOLD e REGRESS mantêm a meta;
  - a sessão do dia do retorno recebe a dose do retorno;
  - a mudança de prova que alcança a semana corresponde ao programa gerado com a nova data;
  - movimentos que cruzariam os 28 dias não são oferecidos (R24 fechada);
  - a semana de entrada se mantém numa reconstrução.
- **S6 vale só em parte.** O teto do retorno pela maior contagem inteira executada (R20) vale, e a fadiga conta como redução. Mas tratar o ajuste ao tempo como semana inteira, para subir ou encerrar os tetos, **não vale**. É o **D56**, novo, estreito, só de runtime e introduzido pelo segundo ciclo. Exemplo: agachamento 2, 2 e depois 4 séries, quando o tempo disponível aumenta. Na grade do SSCTR, 64 semanas totalmente ajustadas liberam o teto e há 16 saltos; na FREEZE-1, 0 e 0. Correção exigida: os tetos só sobem ou terminam depois de uma semana em que uma exposição executada fez sua contagem inteira depois do ajuste ao tempo.
- **Decisões:** as quatro decisões da FREEZE-1 foram re-vinculadas à FREEZE-2. Em REGAIN-BASE, as condições 5 e 6 não são atendidas por causa de D56; SPLIT-WEEK foi emendada na condição 4. Há um registro novo: R7A-SSCTR-CYCLE2-COMPOSITIONS.
- **Fila:** cinco itens integrados à fila de revalidação humana. A fila passou de 127 para 132 itens, só por acréscimo, com os anteriores idênticos byte a byte. Financiamento NOT_DECLARED. Registro em `audits/domain-coaching-r7a-2026-10-27/QUEUE_INTEGRATION_R7A.json`; o pino de 127 itens do verificador fechado da R6 fica superado, sem reescrevê-lo.
- **Fora do delta, não bloqueante para o SSCTR:** O-1/R28, uma mudança de equipamento depois da revisão semanal da mesma semana perde o registro de entrada (mesmo tratador do QE-R7A-01). Recomendações R25 a R27; R27 é o caso SHORT do QE-R7A-02.
- **Validação:** feita por validador substituto, porque Python e jsonschema não estão instalados. Não é validação humana, empírica nem clínica.

## 9. Revisão independente de engenharia

**Primeira revisão** (R7A-QE-r1, sobre R7A-FREEZE-1; `reviews/quality-engineering-r7a-review.md`): NOT_READY.
- Doze bloqueios, QE-R7A-01 a 12, todos novos, estreitos e de runtime. Dez já existiam no runtime de fechamento da R6.
- Achados LOW: 13 a 18.

**Re-verificação única** (R7A-QE-r2, sobre R7A-FREEZE-2; `reviews/quality-engineering-r7a-recheck.md`): **NOT_READY**.
- **Corrigidos (11):** 04, 06 a 11, 14 a 17.
- **Corrigidos só em parte e ainda bloqueantes (5).** Cada um tem um resíduo no mesmo mecanismo:
  - 01 (HIGH): uma mudança de equipamento na mesma semana ainda apaga um retorno que começa na semana seguinte;
  - 02: num retorno curto (SHORT) relatado na manhã de um dia de qualidade, a primeira corrida continua de qualidade;
  - 03 (HIGH): depois de um retorno na semana da prova, adiar a prova deixa duas provas;
  - 05: a fusão por exercício guarda uma entrada inteira e pode perder uma carga conhecida (em dez semanas, quatro exercícios nunca se estabelecem);
  - 12: uma série curta registrada com carga mais leve vira meta.
- **Parcial e não bloqueante:** 13 (fuso horário de um registro de entrada só com data). 18 foi encaminhado à R7-B.
- **Novos:**
  - **QE-R7A-19** (MEDIUM, bloqueante, introduzido pelo segundo ciclo): uma mudança de prova que alcança a semana descarta as adaptações anteriores da mesma semana, como a redução por fadiga ou a remarcação por dia indisponível;
  - QE-R7A-20, 21 e 23 (LOW, não bloqueantes; 20 e 23 introduzidos pelo segundo ciclo);
  - QE-R7A-22 (LOW): a sobrevivente de mutação que registrei como inalcançável é alcançável.
- **Confirmação independente:** reproduzi QE-R7A-01, 03 e 19 com a sonda P1 do juiz numa cópia isolada do mesmo runtime, e D56 com a seção D56 da sonda do SSCTR. As saídas são iguais às dos juízes.

## 10. Lacunas encaminhadas

- **R7-B (cold start e programa inteiro):** fusão de histórico de corrida e autorrelato (CQ-R6-01); progressão que fica plana (CQ-R6-02); negociação quando o plano não alcança a meta (CQ-R6-05); declarações R17 (a, c, d), R8, R9, R16; F-ACCESSORY-REPS; convenção de implemento único (goblet squat); mapeamento DR-112–114; rotação CORE que repete um exercício na mesma sessão (QE-R7A-18); as recomendações R21 e R23 do SSCTR (limite de séries de um exercício novo no passo 2 do retorno; exercício substituído durante o retorno que volta à contagem cheia).
- **R7-C (longitudinal):** R18 e CQ-R6-04 (semanas sem revisão), com a decisão G03 de Produto/Dados; janelas temporárias de agenda; Athlete Model (CQ-R6-14); R1, R2, R5, R14, R15.
- **R7-D (generalização):** um holdout novo e não visto; lacunas de interface do autor do holdout.
- **Clínico:** a triagem clínica de texto livre continua heurística e fora do escopo não clínico.
- **Bloqueios da R7-A** (vão para a próxima missão autorizada pelo Founder, antes da R7-B): QE-R7A-01, 02, 03, 05, 12, 19 e D56.
- **Abertos e não bloqueantes, que acompanham os bloqueios:** QE-R7A-13 (fuso horário), 20, 21, 22 (lacuna de teste), 23; recomendações R25 a R28 do SSCTR (R28 = O-1).

## 11. Readiness

`r7/READINESS_R7A.json` (só os sete vereditos desta fase; nenhum AUTONOMOUS_COACHING_READY ou KMP_READY):

| Veredito | Valor | Por quê |
|---|---|---|
| STATE_COMPOSITION_STABILITY | NOT_READY | Os tratadores da mesma semana ainda não compõem em qualquer ordem (QE-R7A-01, 03, 19). Semanas inteiramente ajustadas ao tempo sobem o teto de recuperação (D56, equivalente de D53) |
| PHASE_MODIFIER_INTEGRITY | NOT_READY | D54 resolvido e toda linha dentro da dose da fase do dia; mas a fase da prova não se mantém na composição: uma prova adiada depois de um retorno deixa a prova antiga numa semana que agora é de polimento (QE-R7A-03) |
| PRESCRIPTION_RECONSTRUCTION_INTEGRITY | NOT_READY | A semana ajustada é lida como inteira para os tetos (D56); a série curta com carga mais leve vira meta (QE-R7A-12); o retorno SHORT mantém a qualidade (QE-R7A-02); a reconstrução no meio da semana parte do estado do início da semana (QE-R7A-19) |
| CANONICAL_INPUT_SEMANTIC_STABILITY | NOT_READY | A fusão por exercício pode perder uma carga conhecida (QE-R7A-05) |
| R7A_ENGINEERING_REVIEW | NOT_READY | R7A-QE-r2 |
| R7A_SCIENTIFIC_REVIEW | NOT_READY | R7A-SSCTR-r2: runtime não aceito (D56) |
| R7A_EXIT_READINESS | NOT_READY | As condições de parada 1, 6 e 7 não são atendidas, e o limite de ciclos não admite outro ciclo |

O que vale e está comprovado: D54; D55; os caminhos originais de D53; as 11 correções de engenharia confirmadas; e as regressões, só como regressão.

## 12. Ponto exato de retomada da R7-B

**A R7-A não saiu READY.** Por isso não há handoff (§22) e a R7-B não deve começar a partir daqui sem uma decisão do Founder. A R7-B não foi iniciada. A próxima missão, que o Founder decide e que não foi iniciada, deve tratar os sete bloqueios, ainda no runtime de referência offline. Minha recomendação é uma missão limitada antes da R7-B, que comece exatamente por:

1. **Um modelo de composição da semana** (QE-R7A-01, 03, 19 e O-1/R28). Todo tratador da mesma semana parte da semana como prescrita agora e do estado de retorno guardado, nunca da projeção do início da semana. Pontos de entrada:
   - `CoachingCore/src/r6-adaptation.mjs` `equipmentChange` (linha 526), que não lê `rebasedNext` (linha 223);
   - o caminho `fromWeek===ctx.w` de `rebuild` (linha 460), que re-projeta a partir de `stateTrace[w]` e perde as adaptações da semana;
   - a guarda `!rebasedNext` de `goalChange` (linha 559), que deixa duas provas.
2. **D56:** em `CoachingCore/src/r6-program.mjs` `advanceStrength` (`unreduced`, linha 492), os tetos de recuperação e de retorno só sobem ou terminam depois de uma semana em que uma exposição executada fez a contagem inteira depois do ajuste ao tempo. É o mesmo teste do teto R20.
3. **QE-R7A-05:** em `CoachingCore/src/r6-provenance.mjs` `mergeActual` (linha 36), fusão campo a campo em vez de uma entrada inteira por exercício.
4. **QE-R7A-12:** em `r6-program.mjs` (linha 484), uma série curta registrada com carga mais leve não vira meta.
5. **QE-R7A-02 e R27:** a regra SHORT de `returnAfterPause` (linha 591 e seguintes) usa `aheadOf` em vez de comparar só datas.

Depois disso, uma nova congelação e uma re-verificação estreita pelos dois juízes. As decisões do SSCTR só passam a valer para essa congelação depois da re-verificação dele.

Se o Founder escolher abrir a R7-B levando estes bloqueios, o ponto de entrada da R7-B é `r7/CLASS_DISPOSITIONS_R7A.json` filtrado por `R7B_COLD_START`, a começar por CQ-R6-01 (`CoachingCore/r6/OPEN_GAPS_R6.md`).

**Reidratação mínima:**
1. `CURRENT_MISSION.md` e `MISSION_LEDGER.md` (os blocos de encerramento da R7-A);
2. `audits/domain-coaching-r7a-2026-10-27/FINAL_DISPOSITION.json`;
3. `r7/READINESS_R7A.json`;
4. `r7/CLASS_DISPOSITIONS_R7A.json` (`closure`, `judgeFindings`);
5. `reviews/quality-engineering-r7a-recheck.md` e `reviews/ssctr-r7a-recheck.md`;
6. `audits/domain-coaching-r7a-2026-10-27/CHECKPOINT.md`, ponto de retomada 7;
7. este relatório.

Comandos, a partir de `CoachingCore/`: `node --test`; `node scripts/regress-r7a.mjs`; `node scripts/verify-r7a.mjs` (só leitura). Nunca rode `npm run verify`, `npm run simulate`, `npm run demonstrations:r6` ou o `scripts/verify-r*.mjs` de uma missão anterior.

## Comprovado, inferido e não testado

**Comprovado** (executado nesta missão, saída guardada):
- **D54 resolvido:** AK 0, sonda R7-A 0 de 3.360 linhas, grade de fases do SSCTR igual nas duas congelações.
- **Caminhos originais de D53 corrigidos:** AI ruidoso 48 → 0, AH 0, AJ.
- **D55 resolvido:** 12 casos do SSCTR.
- **As 11 correções de engenharia confirmadas** pelas sondas do próprio juiz.
- **Os sete bloqueios:** reproduzidos pelas sondas dos juízes; QE-R7A-01, 03, 19 e D56 também por mim, numa cópia isolada.
- **Regressão:** R5 24/24; cada diferença do holdout, dos perfis e das simulações nomeada pela sua causa.
- **Testes e mutação:** 476/476; mutação 33 de 34.
- **Integridade:** a fila só por acréscimo (127 → 132); os 1.007 arquivos da linha de base protegidos, salvo o delta de runtime declarado, os acréscimos aos arquivos de missão e a fila.

**Inferido** (por mecanismo, não por uma correção testada):
- Os sete bloqueios vêm de duas raízes estruturais: tratadores da semana que re-derivam a semana de estados diferentes, e a contagem ajustada ao tempo que não é o teste de semana inteira para os tetos.
- Não existe outro desvio do tipo D54. Isso foi buscado em grades, não provado exaustivamente.

**Não testado:**
- atletas reais, aparelhos reais e HealthKit;
- populações fora dos perfis sintéticos;
- um holdout novo e não visto (R7-D);
- semanas sem revisão (C15, R7-C);
- sequências longas além das sondas;
- o comportamento da sobrevivente de mutação além do caso do juiz;
- se as correções propostas acima resolvem os bloqueios: nada foi corrigido depois das re-verificações, pelo limite de ciclos.
