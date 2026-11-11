# CoachingCore V1 Run Calibration Extension — registro de encerramento (2026-11-11)

**Extensão A aprovada com condições e congelada como `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1`.** A aprovação vale para o CoachingCore em dados sintéticos. Não vale para produção, backend nem aplicativo publicado, e não autoriza atletas reais.

`COACHINGCORE-V1-FREEZE-1` está intacto: os 198 arquivos que ele vincula continuam idênticos byte a byte. Flags inalteradas: V1_COACHING_AUTHORITY_READY = NO, INTEGRATION_READY = NO, F08_OPEN, fila humana em 235. Nada foi enviado ao remoto nem mesclado. Nenhum backend, SwiftUI, Figma ou integração foi iniciado.

## 1. Origem e commits

Branch `claude/coachingcore-v1-run-calibration`, worktree `.claude/worktrees/v1-run-calibration`, a partir de `981a8f6` (o freeze da V1).

| Commit | Conteúdo |
|---|---|
| `415296a` | Pedido e decisão esportiva do SSCTR (SSCTR-V1RC-DECISION-r1) |
| `bc40218` | Candidato revisado |
| `b429823` | Pareceres da rodada independente, como recebidos |
| `0098834` | O ciclo corretivo único |
| fechamento | Rechecagens, registros habilitadores, este registro |

## 2. O que foi construído

Uma camada aditiva ao lado do motor congelado. O ponto de entrada novo é `CoachingCore/src/v1-run-index.mjs`: devolve tudo o que `v1-index.mjs` devolve, sem alteração, e acrescenta a calibração de corrida. Nenhum plano, dose, gate ou progressão muda. A dica de esforço continua sendo a prescrição; a faixa de ritmo é uma orientação ao lado dela.

| Entrega pedida | O que o motor faz agora |
|---|---|
| Calibrar a capacidade atual | Distingue resultado de prova, teste de campo, tentativa de tempo, recorde pessoal, treino registrado, exame de laboratório, estimativa derivada, capacidade presumida e ausência de dados. Recorde antigo nunca vira capacidade atual. Resultado vale como atual até 56 dias, presumido (confiança baixa) até 112, depois é só histórico |
| Resultados contraditórios | Nunca escolhe o mais rápido. Dois resultados a até 28 dias um do outro com mais de 3% de diferença: vale o mais lento, com confiança reduzida |
| Faixas de ritmo | Oito faixas, cada uma ligada a um domínio de esforço: leve, longão, recuperação, limiar controlado, e esforço de 5 km, 10 km, meia e maratona. Cada faixa traz unidade, evidência usada, data, validade, método, confiança, margem, esforço percebido e marcação de estimada ou observada |
| Domínios e zonas | Três saídas separadas e não intercambiáveis: domínios de esforço (sempre, sem relógio), faixas de ritmo (com capacidade calibrada ou observada) e zonas de frequência cardíaca (só com máxima observada por cinta peitoral em esforço forte, ou valores de laboratório mostrados como fornecidos; nunca pela idade) |
| Estimativas de prova | 5 km, 10 km, meia e maratona, sempre como intervalo com valor central, rotuladas "estimativa da capacidade atual; não é promessa". A meta do atleta aparece como meta, comparada com o intervalo; nunca vira previsão nem fonte de ritmo |
| Projeção futura | Não é produzida. A saída declara que não há modelo validável e lista só as mudanças observadas da referência |
| Avaliação inicial | Iniciante absoluto: a primeira sessão como está, sem ritmo, sem teste, sem estimativa. Quem corre contínuo: observação das corridas leves e das sessões fortes do próprio plano. Teste de 3 km ou 5 km: opcional, só para elegíveis, no lugar da sessão forte da semana |
| Integração com o fluxo | Onboarding → plano → sessão → execução registrada → revisão semanal → atualização. A calibração é função pura do registro e só muda na virada da semana |

Valores esportivos: `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json` (revisão 2), fixado por hash. Cada um dos quatro limites (capacidade, ritmo, frequência cardíaca, estimativas) só liga com registro independente do SSCTR vinculado a esse hash. Sem registro, o comportamento é o da V1 congelada.

## 3. O que o SSCTR mudou em relação à proposta inicial

A decisão esportiva alterou vários valores propostos. Os principais:

- **Maratona:** estimativa só a partir de meia maratona ou distância maior, recente, e só para quem está no bloco de maratona. Nunca a partir de 5 km ou 10 km. Intervalo largo, com o aviso de que muitos corredores fazem a maratona mais devagar que a estimativa.
- **Faixas de prova:** saem da estimativa de ritmo de prova do próprio atleta. Com durações fixas, a faixa de 5 km de um corredor lento ficaria mais rápida que o ritmo de 5 km dele.
- **Margens maiores:** 2,5%, 4% e 6% conforme a confiança, mais 1% para quem faz 10 km em 60 minutos ou mais.
- **Medição:** resultado por GPS perde um nível de confiança; manual ou esteira, dois.
- **Teste de campo:** só depois de uma sessão forte já executada; novato só faz o de 3 km; a orientação é "cerca de 8 de 10", nunca esforço máximo.
- **População do modelo:** fora de 27 a 75 minutos equivalentes em 10 km, o modelo não produz nada.

## 4. Pareceres independentes

| Papel | Rodada em `bc40218` | Rechecagem em `0098834` |
|---|---|---|
| SSCTR | NOT_READY (3 bloqueantes, 9 não bloqueantes) | READY_WITH_CONDITIONS; os quatro limites aprovados com condições |
| QRE | NOT_READY (6 bloqueantes, 10 não bloqueantes, 12 mutantes sobreviventes) | READY_WITH_CONDITIONS; nada impede o freeze |

A decisão foi escrita por uma instância do SSCTR, julgada por outra, e a rechecagem foi feita por uma terceira. Os nove achados bloqueantes foram fechados no ciclo único. Detalhe por achado em `FIX_CYCLE_V1RC.md`; pareceres em `reviews/`.

Segurança não foi acionada: a fronteira de custódia não usa o ponto de entrada novo. Fica como condição de integração (seção 7).

## 5. Testes e evidências

- Suíte completa: **1334 de 1334** (1258 herdados, 75 novos em cinco arquivos, mais o arquivo de apoio).
- Os cinco exemplos trabalhados da decisão são reproduzidos ao segundo.
- 25 jornadas sintéticas (`evidence/JOURNEYS_V1RC.txt`) e um fuzz semeado: plano, decisões e registro idênticos aos do ponto de entrada congelado em todos os casos.
- Diferencial próprio do QRE: 304 linhas do tempo e mais de 2000 revisões, zero diferenças.
- Cobertos os casos pedidos: iniciante absoluto, iniciante com histórico, corredor sem resultado, com resultado recente, recorde antigo, resultados contraditórios, teste incompleto, corrida leve que não recalibra, sessão forte com ritmo, recalibração, metas de 5 km, 10 km e meia, maratona com e sem base, sem GPS ou FC, dados ruidosos.

## 6. Limitação C (análise secundária)

**Decisão: manter C como está, para a V2 ou a missão de integração. Nada foi ligado.**

O motor congelado já tem uma redução de uma semana para fadiga (`SYSTEMIC_FATIGUE`, `LOCAL_FATIGUE`): a sessão forte restante vira corrida leve, a força reduz, a semana seguinte não é tocada e um sinal clínico continua indo para o hold. A fronteira do app não expõe isso.

O SSCTR considerou o mecanismo aceitável, com condições: só depois da triagem de sinais com todos em "não", nunca para doença ou dor, como oferta que o atleta aceita, e com limite de repetição que encaminha para a rota de sintoma persistente. O motor não tem limite de repetição (um teste confirma). Atender às condições exige regra nova e trabalho na custódia, o que a missão manda não fazer. Os dois juízes do SSCTR concordaram em manter. `test/v1rc-limitation-c.test.mjs` documenta o comportamento existente.

## 7. Condições e pendências

**Condições esportivas que o cliente precisa cumprir (não corrigidas: o ciclo está gasto):**
- Não mostrar estimativa, faixa ou referência de maratona com valor central acima de 6:00:00 (falta o limite de população para resultados mais longos que a meia; valor já indicado para uma emenda futura).
- Não oferecer o teste quando a semana seguinte já está calibrada, nem a menos de 7 dias de uma prova, tentativa ou teste (o motor oferece hoje dois dias depois de uma prova declarada).
- Num teste interrompido, exigir o motivo e se foi tolerado; não permitir corrigir depois esses dois campos.
- Quando a saída pedir a triagem de sinais, levar o atleta a ela antes de mostrar estimativas ou faixas de prova, e agir de imediato.
- Nunca apresentar o lado lento da faixa leve como ritmo mínimo.

**Condições de confiabilidade:**
- A integração não passa opções ao ponto de entrada (mesma exposição da extensão de eventos).
- O contrato precisa nomear as exceções imediatas à estabilidade semanal (retirada, sinal de sintoma, teste já feito na semana, correções); um cliente que guarda a semana em cache pode mostrar uma faixa que já não vale.
- Lacunas menores do contrato, uma retenção de movimento em estado misturado de cliente, e lacunas de teste (12 mutantes novos sobrevivem; em cinco o juiz confirmou que o comportamento está correto). O teste que o ciclo corretivo declarou para o mutante M06 não o mata.

**Antes de qualquer texto visível ao atleta:**
- Leitura formal, pelo Founder e PCG, da regra de produto "não afirmar tempo de chegada" frente às estimativas rotuladas. A opinião esportiva é que são compatíveis.
- Revisão de texto de Product para todas as divulgações.

**Antes da integração e de dados reais:**
- Revisão de Segurança: o registro de evidências guarda frequência cardíaca e valores de laboratório; falta armazenamento, exclusão a pedido e inventário na custódia.

**Governança:**
- Entradas propostas para a fila humana, não anexadas: HQ-V1RC-SSCTR-CAP, -PACE, -HR, -EST, -EST-CALIBRATION.
- Uma emenda futura de valores e runtime, com checagem própria do SSCTR, para os itens esportivos acima.
- A decisão do SSCTR expira em 2027-05-11.

## 8. Freeze

`COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1`, em `CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json`. Vincula o commit de fechamento, os arquivos adicionados e a preservação do freeze da V1. Conferir com `node scripts/v1rc-freeze.mjs --check 1` em `CoachingCore`. O script antigo `v1fc-freeze.mjs --check 1` vincula diretórios inteiros e, neste worktree, aponta os arquivos novos como diferença; a conferência de preservação está no script novo.

## 9. Contrato dos novos dados

`RUN_CALIBRATION_CONTRACT_V1RC.md`, nesta pasta.

## 10. Próximo passo

Nenhum foi iniciado. A V2 não começa automaticamente. A ordem que você já tinha indicado continua: reconciliar o Figma com as capacidades aprovadas, agora incluindo ritmo, zonas e estimativas dentro das condições acima.
