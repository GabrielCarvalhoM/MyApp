# SSCTR — itens L1 a L5 da linhagem de evidência do V1RWS (fase A) — 2026-11-14

Este registro decide cinco itens sobre um diagnóstico. **Não é rodada de revisão**: nenhum código mudou e nada aqui julga um candidato.

O registro tem duas versões:
- **r1:** os cinco itens, como pedidos primeiro.
- **r2, esta:** o coordenador emendou L1, L2 e L4 depois do fato 6. Esta versão decide os itens emendados e substitui as decisões de r1 sobre L1, L2 e L4. L3 e L5 ficam como em r1; a L5 agora cita o fato 6.

## 1. Revisor, autoridade, o que li e rodei

- **Revisor:** instância SSCTR nova (claude-opus-5-5), agente SSCTR-1.0.0, constituição SSCTR-CONST-1.0.0.
  - Autoridade: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, só para decisões internas delimitadas e não clínicas. Não tenho credencial humana.
  - Não houve revisão humana, validação empírica nem juízo clínico. Não deleguei nada.
  - Não escrevi o candidato, o diagnóstico, o oráculo, as sondas `d-*` nem a r4. A r4 foi escrita por outra instância SSCTR. Este registro não é independente das decisões de r2, r3 e r3a do mesmo papel.
- **Runtime diagnosticado:** worktree `v1-run-extensions`, HEAD `a4a434f`, árvore limpa. Li sem escrever nada.
  - O `src/` da cópia executável é igual ao do worktree (`diff -q` no nível de cima, sem diferença).
- **Li:**
  - constituição e skill;
  - `CURRENT_MISSION.md`, só os títulos das seções;
  - r4 `SSCTR_V1RWS_FINAL_R4.md` (`dce344bb…`), o encerramento `PHASE_A_FINAL_FIX_FORWARD_CLOSURE.md` (`4c5a037b…`) e a QRE r4, seção 8 e seções 11 a 13 (`5bf26073…`);
  - `SSCTR_RWS_R2_DECISION.md` (`cf530419…`), `SSCTR_RWS_R3_DECISION.md` (`6ea12f7d…`) e `SSCTR_RWS_R3A_AMENDMENT.md` (`e99e4e73…`), por grep dirigido mais as linhas citadas: r3 C1/C2/C5 e r3a A1 e A2;
  - `oracle.mjs` (`1d579983…`), `d-matrix.mjs` (`c8f0f9ce…`) e `d-other-statements.mjs` (`8d707ef6…`);
  - os testes da extensão: `v1rws-fix-forward.test.mjs` (`ee9d0dd6…`), linhas 60 a 110 e 270 a 300, e `v1rws-final-fix.test.mjs` (`804e00d6…`), linhas 100 a 145, mais um grep de `correctionOf` em `test/v1rws-*.test.mjs`;
  - em `src/v1-run-history.mjs`, `distanceFacts` e `historyReference`, e em `src/v1-run-format.mjs`, `readCompletion` e o leitor de execução (linhas 540 a 593).
- **Rodei**, na cópia `…/scratchpad/cand-a4a434f/CoachingCore`, com saída em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/479a0ad5-431f-436b-90c6-25b00f206597/scratchpad/ssctr-lineage-items/`:
  - `d-matrix` EASY e LONG, depois `summ.mjs`: igual byte a byte a `out/`;
  - `d-other-statements`: igual byte a byte a `out/d-other-statements.json`;
  - `judges/q4-corr-disputed`, `judges/q4-corr-race`, `d-engine-frozen`, `d-recompose` e `judges/ssctr-m2-empty-merge`: iguais a `out/`;
  - `judges/q4-corr`: os mesmos números de `out/`, mas a forma difere (seção 4);
  - as três sondas do QRE e a `m2` são iguais em sha256 às originais dos juízes;
  - sondas minhas: `s21.mjs`, `s21b.mjs` e `s21c.mjs`, com o cenário 21 em LONG e os controles.
- **Não rodei:** a suíte, `npm run verify`, `v1rc-journeys`, `v1rc-fuzz` nem `validate_records.py`. Não usei git de escrita. Este é o único arquivo que escrevi num worktree.
- **Literatura:** nenhuma afirmação científica nova. WebSearch e WebFetch existem como ferramentas adiadas e não foram carregados. Nenhum item pede evidência nova: todos são regras de admissão de evidência sobre valores já amarrados (0,91, CT-3, a regra de histórico da r3a e as exclusões da V1RC congelada).

## 2. Decisões

| Item | Decisão | O que amarra | Condições |
|---|---|---|---|
| **L1 (emendada)** Quem pode substituir um relato, e quando a linha vai a um leitor de ritmo | **ACCEPT_WITH_CONDITIONS** | **Regra do locutor**, como enviada: um relato fica em vigor até o próprio locutor (o atleta, ou uma atividade de dispositivo pelo id) o substituir por uma correção aplicada pelo motor. Uma correção nunca remove o que outro locutor disse, e o que não se mostra fica em vigor. A parada por sintoma fica fora da regra. **Entrega:** a linha só vai a um leitor de ritmo, de capacidade ou de resultado de prova se carrega todo relato em vigor da sessão. Senão, a distância é retida com uma palavra fechada nova. Na linha que carrega todos, a leitura é a de hoje. **Fato por relato:** todo relato recebido para uma sessão de corrida planejada deixa uma linha de fato com id e locutor, mesmo sem fato de distância. **Os testes mudam** (seção 3). | L1-a: a regra só **retém**. Nunca acrescenta distância medida, crédito, conclusão nem extensão, salvo o rebaixamento de L3 e L4. Teste: em toda a matriz e em `d-other-statements`, nada que hoje é retido passa a ser entregue. L1-b: a retirada agora deixa fato e substitui os relatos anteriores do próprio locutor. A linha só é entregue se carrega a retirada. Isto substitui a L1-b de r1. L1-c: o locutor é gravado na recepção, a partir dos campos de origem do relato. Nunca é inferido depois. L1-d: a confiança no locutor é da Security, antes de integração, e também a guarda e retenção da linha de fato nova (SEC-RWS-C-04). L1-e: teste nas três ordens para leve, longão, prova e HEAT ou pausas para caminhar. L1-f: antes de integração ou de atleta real, a integração declara que fração das corridas planejadas fica retida para sempre pela palavra nova. Se a fração for material, o contrato de integração dá o caminho de volta (seção 3). Nada disso entra no Core agora. |
| **L2 (emendada)** Relato recusado num conflito | **ACCEPT**, como consequência de L1 | O relato recusado está em vigor e não está em linha nenhuma. A linha da sessão é retida até o próprio locutor o substituir. Não há leitura separada. Cenários 18 e 19: retidos. | As condições L1-a a L1-c valem. A parada por sintoma num relato recusado segue a regra de triagem existente. |
| **L3** SSCTR-RWS-D-01 no Core (soma de gravações de duas fontes) | **ACCEPT_WITH_CONDITIONS**, como guarda do Core (sem mudança desde r1) | Só a referência de histórico (L30, longão comparável, `extentKm` de `historyReference`): a lista soma ao **menor** entre a distância do primeiro arquivo que a linha guarda e a que o próprio relato que lista declara para si, quando declara uma. | L3-a: não toca o `measuredKm` que `readCompletion` usa; status, crédito e meta cumprida ficam como hoje. L3-b: nunca cria histórico onde hoje não há. L3-c: **não fecha** a D-01, que segue condição de integração junto com a B-03, inclusive na forma C-05 (26 km) e no lado do crédito da contagem dupla. L3-d: o fix-forward mostra na grade `m2` que o próximo longão sai com a mesma dose e expressão (16 km, 100 min); o teto vai de 24,2 para 18,084. |
| **L4 (emendada)** Referência de histórico com relato em vigor fora da linha, ou com disputa | **ACCEPT_WITH_CONDITIONS** | Quando um relato em vigor não está na linha, ou quando os relatos da própria linha disputam a distância, a referência de histórico é o menor entre o que a linha lê e os valores que esses relatos declararam. 08, 09 e 10 dão 6,6 (leve) e 9,6 (longão) em qualquer ordem. | L4-a: só valores **utilizáveis** pela regra de histórico da r3a. Medida POOR do dispositivo, implausível ou sem duração não é valor. L4-b: se a linha não dá histórico, a L4 também não dá. L4-c: um valor é o que o relato declara para a corrida inteira (o total medido, com a própria lista, ou a declaração ou número digitado), nunca uma gravação listada sozinha. L4-d: vale só para a referência, nunca para crédito ou conclusão. L4-e: teste de 03, 08, 09, 10, 18 e 19 em leve e longão, com a referência e a expressão do próximo longão. |
| **L5** Fato 5 (motor congelado, correção pela outra fonte) | **CONDITION antes de integração e de atleta real**; não pesa no candidato sintético. Decisão do Founder sobre o motor **só se** a integração não atender o mínimo. | O mínimo da integração está na seção 3, L5. O fato 6 o reforça: a linha que o motor guarda também perde as condições e as pausas para caminhar do atleta. | O conteúdo clínico de qualquer rota de dor ou sintoma segue CLINICAL_HUMAN_REQUIRED; exijo só que o sinal não se perca. |

Nenhum item pediu número esportivo novo, juízo clínico ou mudança de regra de dose ou crédito. A palavra de retenção nova é um rótulo fechado, não um valor. Onde o caminho chegaria a uma regra de crédito (a contagem dupla, em L3), não decido: digo isso e encaminho.

## 3. Razões

**L1 (emendada).**
- A L1 de r1 lia só os fatos de distância guardados. O fato 6 mostra que isso não basta. Reproduzi:
  - o atleta diz HEAT, ou que fez pausas para caminhar;
  - fundida com a importação, a linha tem isso, a V1RC congelada não lê a corrida como ritmo leve, e a faixa fica `[345,420]`;
  - depois da re-sincronização, a linha é só a importação, e a faixa vai a `[345,575]`. O oráculo de r1 também dá `null`.
- A re-sincronização desfaz uma exclusão que a própria calibração congelada faz. Qualquer lista de campos a guardar ficaria incompleta: o POOR do dispositivo, o esforço, a resposta.
- A regra emendada não enumera nada. Se a linha não carrega todos os relatos em vigor, não se sabe o que se perdeu, e a abstenção é a única leitura defensável.
- A regra do locutor fica como em r1, pelas razões de r1:
  - os mesmos fatos leem igual em qualquer ordem;
  - vale a regra do Founder aceita na r4, leitura 1: "o que uma fonte não diz não apaga o que a outra disse";
  - vale a leitura 2 da r4: uma distância em disputa não calibra.
- **Custo, e por que o aceito.**
  - 11 e 12 ficam retidos mesmo com as duas fontes concordando. Com o motor congelado, a corrida sai da evidência de ritmo para sempre.
  - O que se perde é a observação de ritmo de uma corrida. Nada de treino, crédito ou dose. A dose é por minutos (r3a A2 iii).
  - Sem faixa disponível, a sessão sai por tempo, a dose canônica.
  - O risco real é a calibração ficar sem dados, se re-sincronizações forem frequentes. Isso não está medido. Daí a condição L1-f.
- **O caminho de volta é da integração, não do Core.** Concordo com o coordenador.
  - Pela `d-recompose`, o relato do atleta reapresentado sob id novo numa revisão seguinte recompõe a linha. Sob a regra estrita, porém, o relato antigo do atleta continua em vigor e fora da linha, então a linha segue retida.
  - O caminho de volta precisa reconhecer o relato reapresentado sem mudança, ou fazer a importação não chegar como `correctionOf` nu (o mínimo de L5).
- **A L1 de r1 é substituída, e r1 continua registrada.** Na regra emendada:
  - o fato do locutor torna conhecida a retirada (16 e 17) e o relato que só disse HEAT;
  - os cenários 03 a 07, 18, 20 e os de `d-other-statements` ficam retidos;
  - 13 e 14 (um locutor) e 15 (duas fontes inteiras fundidas) seguem entregues, com a leitura de hoje.
- **Os testes mudam o resultado esperado.**
  1. O caso `whole`, em `v1rws-fix-forward.test.mjs:94-97` e `v1rws-final-fix.test.mjs:128-131`:
     - `withheld(whole.after)` deixa de ser `[]` e passa a `[[id,<palavra nova>]]`, porque a linha viva `corr-easy` não carrega o relato da importação;
     - `exec.paceEvidence` deixa de ser `true` e passa a `false`;
     - `exec.paceWithheld` deixa de ser `null` e passa a `<palavra nova>`;
     - ficam como hoje: `whole.merged` (`SEVERAL_RECORDINGS`), `row.eventId` (`'corr-easy'`), status, base e crédito da execução, e as bordas das faixas, iguais às do controle;
     - caem as asserções de hash igual ao congelado (fix-forward, 97) e à calibração crua (final-fix, 131), porque agora há retenção;
     - entra no lugar: 08, 09 e 10 são todos retidos, com a mesma `paceEvidence`, as mesmas bordas e a mesma referência de histórico (L4). A palavra pode diferir: a nova em 08, `DISTANCE_DISPUTED` em 09 e 10.
  2. **Provável terceira mudança, só de palavra**, que não rodei: o caso `late` de `v1rws-final-fix.test.mjs:124-127`.
     - A importação e o app vão na mesma revisão e se fundem. Depois o app corrige o próprio relato, e a linha viva passa a ser só a correção.
     - O resultado continua retido, mas por `<palavra nova>` em vez de `SEVERAL_RECORDINGS`, salvo se a engenharia der precedência à leitura da própria linha. Para o lado esportivo, as duas valem.
     - O caso `late` do fix-forward (89-91) tem um locutor só e não muda.
     - O teste de sinal de segurança (fix-forward, 282) só afirma a triagem, que fica fora da regra.
     - O fix-forward deve conferir todo teste com correção sobre linha fundida.

**L2 (emendada).**
- Sob a regra estrita, o relato recusado é um relato em vigor que nenhuma linha carrega. A retenção sai da regra geral, sem leitura própria.
- O resultado nos cenários 18 e 19 é o que aceitei em r1, retido, agora pela palavra nova.
- O motor recusar um relato não torna falso o que ele disse.
- O custo de um relato recusado e errado é a observação de ritmo de uma corrida e um histórico menor. É subprogressão limitada, nunca dose a mais.

**L3** (sem mudança desde r1).
- A r3a A2 (ii) diz que "a mesma corrida conta uma vez". A r3a A1 (6) diz que o histórico é "o menor dos seus fatos utilizáveis". A soma da lista do app à medida inteira do relógio fere as duas.
- A guarda usa só valores que já estão no registro. Por construção, só pode baixar.
- Os números são aritmética, não rodados: na sobreposição, min(16, 10) + 6 = 16 e o teto 18,084, igual ao da `r3aEmptyList` que a `m2` mostra; `r3aEmptyList` fica em 16; dois arquivos complementares ficam em 11.
- O CT-3 só escolhe um D nativo menor ou TIME na mesma dose (r3a A2 iii).
- O fechamento é a identidade de cada gravação no contrato de dados (B-03), como na r4, D-01.
- O lado do crédito da contagem dupla é regra de crédito: não o decido.
- A L3 se aplica também sob a regra estrita, numa linha que carrega todos os relatos e soma uma lista.

**L4 (emendada).**
- É a regra de histórico da r3a A1 (6) ("o menor dos fatos utilizáveis; uma correção nunca infla o histórico"), estendida da linha aos relatos em vigor da sessão. Os relatos em vigor podem estar fora da linha, ou disputar dentro dela.
- Torna a referência independente da ordem, com um valor que o runtime de hoje já dá em duas das três ordens: 09 e 10 dão 6,6 e 9,6.
- Um relato fora da linha que não declara valor (só HEAT) não muda a referência. Um valor maior é ignorado pelo "menor".
- O efeito é um teto CT-3 menor, que só reduz o D nativo ou leva a TIME na mesma dose. É expressão, não dose.
- L4-b e L4-c corrigem dois furos da frase "só pode baixar" (seção 4).
- **Exemplo de L4-c:** no cenário 03, o relato do app só lista um arquivo de 4,4 km. Ler esse 4,4 como valor da corrida a faria menor que o primeiro arquivo, o que é falso.

**L5** (sem mudança na decisão).
- O motor congelado reescreve a execução inteira numa correção. Isso está certo para um locutor só.
- Com dois locutores, a correção do dispositivo apaga o que o atleta disse:
  - `d-engine-frozen`: recuperação ADVERSE e esforço HARDER viram UNKNOWN, e `adverseSessions` vai de 1 a 0;
  - fato 6: as condições e as pausas para caminhar somem da linha;
  - `s21`, longão: a parada por sintoma do atleta já sai da linha pela quarentena de conflito, e depois da re-sincronização o motor explica a semana como "Executed as planned this week".
- No caso `s21`, a triagem da extensão segue `REQUIRED`, com 0 nativas. O status é MODIFY, e o plano da semana 2 é idêntico aos controles.
- Ainda não achei decisão diferente, em dois cenários. Isso não mostra que nenhuma muda.
- Não pesa no candidato sintético: acontece com a extensão desligada, e a extensão não muda o motor.
- Antes de integração ou de atleta real, a integração mostra, por teste de resultado, que em toda re-sincronização de importação de uma sessão que o atleta também relatou:
  1. a resposta da revisão que aplica a re-sincronização lê o que o atleta declarou por último: recuperação, esforço, função no dia seguinte, parada, dor, condições e pausas para caminhar. Os casos de teste são ADVERSE, SYMPTOM, FATIGUE e HEAT;
  2. a triagem segue `REQUIRED` para a parada por sintoma;
  3. as declarações do atleta seguem em vigor (L1).
- Reapresentar o relato do atleta não basta sozinho. A `d-recompose` mostra que só restaura numa revisão seguinte, e a revisão intermediária não pode entregar prescrição calculada sem as respostas do atleta.
- Se o mínimo pedir mudança no motor congelado, a decisão é do Founder.
- A suficiência clínica de qualquer rota de dor ou sintoma segue CLINICAL_HUMAN_REQUIRED.

## 4. O que o diagnóstico errou ou não disse

1. **`out/q4-corr.json` não é a saída crua de `judges/q4-corr.mjs`.** A saída crua (a minha) é igual byte a byte à `corr-cand.json` do QRE e tem também `family` e `week5.sized`. A de `out/` é condensada. Os números são os mesmos.
2. **Em r1, o texto de L1 e o oráculo divergiam nas retiradas** (cenários 16 e 17). A emenda resolve isso, porque todo relato deixa fato. O oráculo atual (`oracle.mjs`, `1d579983…`) ainda implementa a L1 de r1, não a emendada. Para servir de oráculo do fix-forward, precisa ser reescrito.
3. **"Só pode baixar o valor de hoje" tem dois furos em L4.** O primeiro: criar histórico onde a linha não dá nenhum (L4-b). O segundo: usar como valor uma gravação listada sozinha, ou um valor que a r3a exclui (L4-a e L4-c). Em L3 a frase vale por construção.
4. **"Fecha a D-01 em toda ordem" foi mostrado em leve e longão, não na prova.** A matriz não tem prova, e o oráculo não rodou sobre `q4-corr-race`. Daí a condição L1-e.
5. **Os cenários 21 e 06 dependem da família.** No 21 leve, a re-sincronização é recusada (`INVALID_CORRECTION_CHAIN`) e a linha viva é a parada do atleta, em conflito. No 21 longão, ela é aplicada, e a linha viva é a importação feita (16 km). O 06 é o contrário. Vi isso e não expliquei a causa. Em toda a matriz, a triagem segue `REQUIRED` onde há parada.
6. **No 21 longão, a perda do lado do motor vem antes de qualquer correção**: pela quarentena de conflito. Só a triagem da extensão guarda o sinal.
7. **A emenda diz que a regra estrita deixa 08 "retido como antes".** Vale também para o caso `late` do final-fix, que muda de palavra (seção 3). A emenda não o lista.

## 5. O que não verifiquei

- Nenhuma de L1 a L4 está implementada, e o oráculo não implementa a L1 emendada. Os resultados da regra estrita nos cenários vêm da coluna "reportsInForceTheLiveRowDoesNotCarry" de `d-other-statements` e de leitura da matriz, não de execução da regra.
- O efeito de L3 e L4 na expressão do próximo longão (L3-d, L4-e).
- A fração de corridas que ficaria retida para sempre (L1-f), e se uma importação real do HealthKit re-sincroniza como `correctionOf`, e com que id.
- A mudança de palavra no caso `late` do final-fix. Os testes de `v1rws-execution` com `correctionOf` (linhas 57, 102 e 117), que parecem ter um locutor só.
- A rota de dor do motor congelado (R7-B.2) no caso 21.
- Uma busca por decisão diferente do motor no fato 5 (testei dois cenários).
- Por que a triagem não é pedida na revisão da semana seguinte no 21, inclusive no controle sem correção. É igual com e sem correção, e não é deste pedido.
- A confiança no locutor, a guarda da linha de fato nova e a custódia (Security). O crédito da contagem dupla (D-01 e B-03).
- A suíte, a mutação e a fase B.
- Fila humana: itens **propostos, não anexados** (este pedido permite um arquivo só):
  - HQ-V1RWS-A-SSCTR-LINEAGE-L1L2 (quem pode substituir um relato, e a entrega só da linha que carrega todos);
  - HQ-V1RWS-A-SSCTR-LINEAGE-L3L4 (referência de histórico sob soma e disputa).
- Expiração. Revejo estes itens quando surgir qualquer um destes:
  - o candidato do fix-forward;
  - mudança no contrato de dados (B-03);
  - dados do importador real ou da fração retida;
  - decisão do Founder sobre o motor.

## 6. Contexto injetado pelo host

O host pôs no meu contexto:
- o CLAUDE.md global (`c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6`);
- o CLAUDE.md do projeto em `MyApp/` (`e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6`);
- o MEMORY.md (`39aa000de92a775acf74217b65659599c0a4d5c8112a2c1984c9a80274be4a9d`).

Eles resumem rodadas anteriores. Li-os só como contexto. Nada deles serviu de evidência.

Na mesma pasta apareceu, durante esta passagem, `EVIDENCE_LINEAGE_CONTRACT.md`. Não o escrevi e não o li.
