# R7-D — pré-registro do gate final, versão 5 (`R7D-PREREG-5`)

**Status:** registrado na Fase 3.3 (2026-11-06), antes de existir qualquer holdout final, autor final ou seed final.
- Substitui o `R7D-PREREG-4` (`PREREGISTRATION_R7D_4.md`) para o gate da Fase 4. PREREG-1 a PREREG-4 não são editados.
- **Tudo o que o PREREG-4 (e, por ele, os anteriores) diz e este arquivo não altera continua valendo**, palavra por palavra: critérios de sucesso, protocolo selado, regra de não-tuning, Δ1–Δ15 do PREREG-4 (P18 inclusive, salvo o P18(a) abaixo).

**Fontes do delta:**
- decisão do Founder na Fase 3.3 sobre o SSCTR-P32-F01, **direção B**: restringir o que conta como treino conhecido entre duas pausas. Uma execução isolada não prova retomada; uma retomada comprovada continua reconhecida; nenhum limiar fisiológico, critério clínico ou dose nova;
- o runtime candidato e seus testes dirigidos (`CoachingCore/test/r7d-phase33.test.mjs`);
- `harness/validation/HARNESS_VALIDATION_R7D_5.json` (validação 5).

## Instrumentos vinculados

| Instrumento | Versão | Onde |
|---|---|---|
| Runtime avaliado | `R7D-FREEZE-4`, o freeze da Fase 3.3. R7D-FREEZE-1 a -3 ficam superados, não editados | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json` |
| Harness | `R7D-HARNESS-5` (padrão: o registro do R7D-FREEZE-4) | `harness/`; validação em `harness/validation/HARNESS_VALIDATION_R7D_5.json` |
| Interface do autor | `R7D-INTERFACE-5` = INTERFACE-1 + deltas 2, 3, 4 e `author/INTERFACE_DELTA_R7D_5.md` (o mais novo prevalece) | `author/` |
| Esquema e checador | `R7D-CASE-1`, `check-corpus.mjs`, sem mudança | `author/` |
| Gerador | `R7D-GENERATOR-1`, sem mudança. Seed do H2: `sha256('R7D-SAMPLE\|FINAL\|' + manifestDigest do R7D-FREEZE-4)` | `harness/generate-sample.mjs` |
| Brief final | `R7D-AUTHOR-BRIEF-FINAL-4` (`author/AUTHOR_BRIEF_FINAL_R7D_4.md`); o `-3` fica como registro da Fase 3.2 | `author/` |

## Delta PREREG-4 → PREREG-5

**Nenhum critério de sucesso é afrouxado.** O P18 continua sem envelope: uma violação é bloqueio.

| Δ | Mudança | Origem | Efeito |
|---|---|---|---|
| Δ1 | **P18(a), semana de retomada.** Uma pausa separada listada como `TRAINING_AFTER` só é contabilizada quando uma semana inteira do plano entre o último dia dela e o primeiro dia da parada foi executada: toda sessão viva dessa semana cai entre os dois e tem relato executado (concluída, não conflitada, não substituída). Uma corrida, uma corrida abortada ou sessões em nenhuma semana assim não contabilizam nada: a parada precisa cobrir a pausa. Senão: OLDER_BREAK_DROPPED.<br>A regra do runtime é mais estrita (todo gate ADVANCE ou EARNED, sem resposta adversa). Esta checagem é a parte que um cliente lê do plano e do registro, uma condição necessária, então nunca bloqueia um runtime que aplica a regra mais estrita | SSCTR-P32-F01; Founder Fase 3.3 (direção B) | Mais estrito. No HARNESS-4 qualquer relato executado entre as duas bastava, e nenhum instrumento detectava o F01 |
| Δ2 | **A regra pública (runtime).** Treino entre duas pausas separadas só retoma o atleta depois da pausa anterior quando uma semana inteira do plano entre elas foi executada por completo, em todo esporte que ela planeja: toda sessão executada como prescrita e todo gate ADVANCE ou EARNED (a regra do redutor de evidência, SSCTR S-A e E3; R7-A final P5).<br>Então a pausa anterior é histórico (`TRAINING_AFTER`, com `reentryWeek`) e a mais nova é lida sozinha, a partir do que foi executado.<br>Treino aquém disso é fato da parada, não retomada: a parada atravessa a pausa anterior como sem treino entre elas (`TRAINING_NOT_REESTABLISHED`), classificada pelas classes existentes. Treino desconhecido entre elas continua perguntado (TRAINING_BETWEEN_BREAKS) | Founder Fase 3.3 | Precisão. A receita R6-NONCLINICAL-RETURN não muda; nenhum número novo |
| Δ3 | **Cobertura crítica (acréscimo ao Δ5 do PREREG-4).** O H1 avaliado precisa de pelo menos 2 casos base independentes com duas pausas separadas e treino relatado entre elas. Entre eles, pelo menos:<br>• 1 com treino isolado entre as pausas (uma sessão, ou poucas, sem nenhuma semana inteira executada);<br>• 1 com uma semana inteira do plano executada por completo entre as pausas (o controle do defeito inverso).<br>Unidades obrigatórias: P18 ≥ 2 nesses casos.<br>Faltando qualquer um: INVALID_HOLDOUT, substituído por corpus novo e independente | Founder Fase 3.3 ("verifique especialmente que a correção não cria o defeito inverso") | Mais estrito |
| Δ4 | **Sensibilidade.** O HARNESS-5 detecta o SSCTR-P32-F01 no R7D-FREEZE-3 pelo P18 (DEV-27, DEV-28, DEV-29, DEV-31). Todos ficam limpos no candidato. O DEV-30 (semana inteira executada) não bloqueia em nenhum dos dois runtimes. As 13 linhas anteriores continuam detectadas nos seus runtimes. 43/43 testemunhas disparam | Validação 5 | Registro |
| Δ5 | **Condições de consumidor (acréscimo ao Δ7 e ao Δ13 do PREREG-4):**<br>• relatar toda sessão planejada entre duas pausas, feita ou não feita: a retomada é lida por semanas inteiras;<br>• mostrar ao atleta por que a pausa anterior ainda conta (`TRAINING_NOT_REESTABLISHED`) ou qual semana o retomou (`reentryWeek`), sem número novo;<br>• nunca apresentar uma sessão isolada como prova de retomada | Founder Fase 3.3 | Precisão |
| Δ6 | **Resíduos da regra, sem envelope:**<br>• **Alinhamento por semana do plano.** A retomada é lida por semana do plano, como todo passo. Sete dias ou mais executados atravessando duas semanas do plano, sem nenhuma inteira, não retomam (lado conservador);<br>• **Todo esporte.** Uma semana com toda corrida feita mas uma sessão de força perdida não retoma (lado conservador; retomada por esporte não é modelada: família NF-R7AB-1 / R40);<br>• **Adesão imperfeita longa.** Semanas de treino entre duas pausas sem nenhuma semana inteira executada são lidas como uma parada só, mais conservadora que cada pausa sozinha; é a regra existente de que nenhuma semana incompleta ganha passo. Uma expectativa do autor diferente disso é julgada pelo domínio;<br>• **Semana revisada não basta.** Uma revisão que fechou a semana (pausa declarada depois) não a torna retomada: os gates dela seguram o que não foi executado como planejado;<br>• **Pergunta a mais.** Sessões não relatadas entre as pausas continuam perguntadas mesmo quando nenhuma semana inteira cabe entre elas (O-01 estendido): custo de uso, não de segurança | Fase 3.3 | Divulgação |

## Fechado nesta fase (sujeito às duas checagens)

- **SSCTR-P32-F01, nos caminhos que a regra nomeia.** Uma sessão isolada (de qualquer esporte, concluída, parcial ou abortada) entre duas pausas separadas não apaga mais a pausa anterior: a parada inteira é lida. Medido pelo P18(a) revisado.
- O resíduo Δ11 do PREREG-4 é substituído pelo Δ2 e pelo Δ6 acima.

## O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, que depende do digest do R7D-FREEZE-4.
- Qualquer decisão sobre `V1_COACHING_AUTHORITY_READY`.
