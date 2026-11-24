# RepMile V1: incompatibilidades entre o Figma aprovado, o CoachingCore congelado e o iPhone

**Data:** 2026-11-24 · **Branch:** `claude/v1-ui-functional-reconciliation` (base `077f031`, fundação consolidada) · **Freeze:** `--check` 87/87, exit 0.

**Fontes**
- **Figma:** arquivo `90oyvXHxxBQAvr1netov7S`, inventário somente leitura em `figma-inventory/`.
- **Motor:**
  - `CoachingCore/src/boundary/{views,api,integration,custody,admission}.mjs` e `src/v1-*.mjs`;
  - respostas reais da fronteira para um atleta sintético em `probes/out/`, geradas por `probes/capture-*.mjs`.
- **Contratos:** `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md` (o "handoff") e `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md` (o "contrato paralelo").
- **Produto:** `product/DESIGNER_PRODUCT_CONTEXT.md` e PDR DR-104/107/109/111/114/116–123/133.

**Regra aplicada a todos os itens:**
- nenhum item altera o CoachingCore;
- nenhum item considera uma tela pronta só porque o Figma a desenhou;
- a solução mínima preserva o layout aprovado e usa uma variante que já existe sempre que possível;
- correções no Figma ficam registradas como proposta, com o nó exato, e não foram aplicadas.

**Classificação:**
- `COPY_ONLY`
- `STATE_MAPPING`
- `DATA_SOURCE`
- `APP_IMPLEMENTATION`
- `BACKEND_REQUIRED`
- `FUTURE_ONLY`
- `CORE_CONTRACT_GAP`
- `SAFETY_BLOCKER`

**Responsáveis:**
- **A** CoachingHost;
- **B** HealthKit;
- **C** SwiftUI;
- **INT** missão de integração;
- **FDR** Founder;
- **SEC** Security;
- **SSCTR** revisor esportivo;
- **JUR** jurídico.

## Resumo

| Classe | Itens |
|---|---|
| `SAFETY_BLOCKER` | GAP-01, GAP-02, GAP-03, GAP-04, GAP-05 |
| `CORE_CONTRACT_GAP` | GAP-06 a GAP-15, GAP-37 |
| `DATA_SOURCE` | GAP-16, GAP-17, GAP-18 |
| `STATE_MAPPING` | GAP-19, GAP-20, GAP-21, GAP-22 |
| `COPY_ONLY` | GAP-23, GAP-24, GAP-25 |
| `APP_IMPLEMENTATION` | GAP-26 a GAP-30 |
| `BACKEND_REQUIRED` | GAP-31, GAP-32, GAP-33 |
| `FUTURE_ONLY` | GAP-34, GAP-35, GAP-36 |

**Nenhum item obriga a alterar o CoachingCore.**
- **Facade de A:** quatro itens (GAP-03, GAP-06, GAP-07, GAP-08) se resolvem com projeções somente leitura na fachada JS de A, que é código de aplicação.
- **Contrato compartilhado:** três itens dependem de um contrato novo (proposta CHG-UI-1 a CHG-UI-3, em `FOUNDATION_CHANGE_PROPOSALS.md`).
- **Investigação:** um item (GAP-12) é um comportamento observado da fronteira congelada que A precisa investigar antes de a tela de força avulsa poder dizer "salvo".

---

## SAFETY_BLOCKER (antes de atletas reais; não impedem implementar)

### GAP-01 · Dados reais recusados pela custódia (`syntheticOnly=true`)
1. **Afetado:** todo o app. O cadastro (10) e qualquer escrita.
2. **Esperado:** o atleta real se cadastra e treina.
3. **Suportado:**
   - `createIntegration({syntheticOnly=true})` é o padrão (`integration.mjs:60`);
   - a custódia recusa `SYNTHETIC_ONLY` para qualquer intake com `synthetic!==true` ou `purpose!=='SHADOW_REFERENCE'` (`custody.mjs:229`, `:339`);
   - o handoff §5.1 manda `synthetic:false`, o que a custódia recusa no padrão.
4. **Evidência:** código citado; OPEN-4 do contrato paralelo.
5. **Solução mínima:**
   - a fachada de A passa `syntheticOnly` só por decisão registrada do Founder;
   - até lá, o app roda só com intake sintético (fixtures e lab);
   - o erro `SYNTHETIC_ONLY` mapeia para a tela "Primeira carga · não foi possível carregar a conta" (81, `849:…`) com o código registrado, nunca para um plano vazio.
6. **Responsável:** FDR (decisão), A (parâmetro), C (estado).
7. **Teste de aceite:** com `syntheticOnly` padrão, o intake real é recusado com `SYNTHETIC_ONLY` e a UI mostra o estado de erro operacional; a troca do parâmetro tem registro de decisão.
8. **Impacto V1:** bloqueia atletas reais. Não bloqueia A, B ou C.

### GAP-02 · Gestação ou parto recente coletados e descartados no cadastro
1. **Afetado:** 10 · `Onboarding / 27 Cuidados` (`836:3299`), item "Gestação atual ou parto nos últimos 12 meses".
2. **Esperado:** marcar o item impede o plano comum.
3. **Suportado:**
   - o motor lê `athlete.specialPopulation` (`PREGNANCY`, `POSTPARTUM`) e põe o caso fora do escopo (`r6-intake.mjs:91`);
   - mas a lista fechada de chaves do intake no handoff §5.1 (SEC-INT-05) **não contém `specialPopulation`**;
   - se as structs fechadas de A seguirem o §5.1 ao pé da letra, a resposta é descartada e uma gestante recebe um plano;
   - os seis outros itens mapeiam para `eligibility.{pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern}`.
4. **Evidência:** `r6-intake.mjs:91`; handoff §5.1; texto do Figma.
5. **Solução mínima:**
   - incluir `athlete.specialPopulation: [PREGNANCY|POSTPARTUM]` na struct de intake de A e no teste de schema SEC-INT-05;
   - o resultado do motor (fora de escopo) mapeia para `Sistema / Plano indisponível · sinal informado no cadastro` (81);
   - nenhuma mudança no motor.
6. **Responsável:** A (struct e teste), C (mapeamento da opção), SEC/SSCTR (confirmar a leitura).
7. **Teste de aceite:** o intake com o item marcado chega ao motor com `specialPopulation`, a resposta não tem plano executável, e o teste de schema falha se a chave sumir.
8. **Impacto V1:** segurança. Precisa entrar na lista antes de A fechar as structs de intake (item 9 do handoff A).

### GAP-03 · Sinais de alerta: o conjunto depende da condição e não pode ser completado pela UI
1. **Afetado:**
   - 72 · `Não estou 100% · sinais de alerta, um por tela (9 de 13)` e `conferir as 13 respostas` (`843:1751`);
   - 72 · `Declaração de prontidão · passo 2 (1 de 15)` e `passo 3` (`843:1980`).
2. **Esperado:** o Figma pergunta 13 sinais no "não estou 100%" com "cansaço fora do comum" e 15 na declaração de prontidão.
3. **Suportado (a divergência "13 × 15" da análise anterior está resolvida):**
   - o motor pergunta por condição (`v1-f08.mjs:38 signsFor`):
     - W1–W9 para `MINOR_DISCOMFORT` e `NEED_REST` (9 sinais);
     - mais W10, W12, W13 e W14 para `UNUSUAL_FATIGUE` (13 sinais);
     - mais W11 e W15 para `MILD_ILLNESS` e `MILD_INDISPOSITION` (15 sinais);
   - a prontidão sempre lê os 15;
   - os 13 do Figma são exatamente `signsFor('UNUSUAL_FATIGUE')`, na mesma ordem. O "15 booleans" do handoff §5.4 descreve o vocabulário, não a quantidade a perguntar;
   - sinal sem resposta é pergunta de novo (`readBooleans`: ausente → `missing` → ASK), e a cópia "Sem resposta não conta como não" está certa.
4. **Evidência:**
   - `v1-f08.mjs:21-38, 63-66`;
   - probe `actions-D3-notFeeling100-no-screen.json` (ASK sem os sinais);
   - Figma `843:1751`, `843:1980`.
5. **Solução mínima:**
   - a UI recebe a lista de sinais da fachada de A (`warningSignsFor(condition)` e `exerciseSignsFor(condition)`, projeção do próprio `signsFor` congelado: CHG-UI-2);
   - a UI nunca replica a tabela em Swift e nunca envia `false` para um sinal não perguntado;
   - o Figma não precisa de mudança: as 3 contagens (9/13/15) são variantes do mesmo componente.
6. **Responsável:** A (projeção), C (fluxo), SSCTR (já aprovado: só confirmar a ordem).
7. **Teste de aceite:**
   - para cada uma das 5 condições, a UI pergunta exatamente `signsFor(condição)`;
   - o JSON enviado não contém sinal não perguntado;
   - uma resposta faltando produz ASK e a UI volta ao sinal.
8. **Impacto V1:** segurança. Sem bloqueio de design.

### GAP-04 · Sessão "iniciável" depois de apagar relatos de saúde (SEC-FPV-01) e tela de sinais pendente
1. **Afetado:**
   - botão "Começar" em 20 (Hoje), 31 (Treino planejado) e 40/41 ("pronto para começar");
   - 70 · `Dados · apagar relatos de saúde (folha)`.
2. **Esperado:** "Começar" só para sessão autorizada.
3. **Suportado:**
   - `executable` no `planView` é necessário, mas não suficiente;
   - depois de `eraseHealthFacts` de um "não estou 100%" que não abriu hold, a view volta a mostrar a sessão executável (SEC-FPV-01, handoff §9);
   - quando `warningSignScreen.status = REQUIRED` (corrida parada por sintoma), o plano segue `VALID_PLAN` e a sessão executável (probe `actions-C1-run-stop-symptom.json`, `actions-C2-plan-after-symptom-stop.json`);
   - a obrigação de levar o atleta à tela é nativa (NATIVE 7.1).
4. **Evidência:** probes citados; handoff §5.4, §9.
5. **Solução mínima:**
   - C habilita "Começar" só por `startability(sessionId) == .startable`, decidido por A (porta proposta CHG-UI-1);
   - A combina `executable`, a regra local pós-apagamento, `warningSignScreen` pendente, o relógio (D1) e a validade do repertório R7-B0;
   - a UI mostra o motivo com a variante que já existe: "Pergunta rápida antes do treino" ou a triagem de 40 `registro: algo incomum leva à triagem` (`660:1313`).
6. **Responsável:** A (regra), C (consumo).
7. **Teste de aceite:**
   - fixture "apagado sem hold": "Começar" desabilitado até a nova triagem;
   - fixture "parada por sintoma": a tela de sinais abre antes de qualquer sessão de corrida.
8. **Impacto V1:** segurança, antes de atletas reais.

### GAP-05 · Textos clínicos e jurídicos ainda provisórios
1. **Afetado:**
   - 70 · `Aviso de saúde`, `Termos`, `Política de privacidade`;
   - 72 (sinais, hold, "sinal urgente");
   - 10 · `27 Cuidados`.
2. **Esperado:** textos finais.
3. **Suportado:**
   - o motor marca a orientação de hold como `guidance.wordingStatus = INTERIM_PENDING_G04` (probe `17-plan-blocked.json`);
   - o próprio Figma (99 · Handoff, `934:37`) diz que os textos clínicos e jurídicos são rascunho de 16 nov "até a revisão de um profissional de saúde" e "de um advogado";
   - faltam razão social, CNPJ, e-mail do encarregado e o prazo de backup.
4. **Evidência:** probe; Figma `934:37`; C-BC-3 e SSCTR-BC-05 (pendências do freeze).
5. **Solução mínima:**
   - C implementa os textos como tabela de cópia versionada, com a marca `INTERIM` visível no código e no relatório;
   - nada é inventado no lugar;
   - a revisão substitui a tabela sem mudar componentes.
6. **Responsável:** FDR, JUR, SSCTR, G04/G07; C (tabela).
7. **Teste de aceite:** um teste de snapshot da cópia falha se um texto `INTERIM` for para build de release sem a flag de revisão.
8. **Impacto V1:** bloqueia atletas reais e a App Store. Não bloqueia implementar.

---

## CORE_CONTRACT_GAP (o contrato congelado não entrega o que a tela pede)

### GAP-06 · O histórico congelado não tem distância, ritmo, séries, cargas nem treino avulso
1. **Afetado:**
   - 50 · Concluído (corrida e força), Histórico (lista, filtro, busca "agachamento");
   - 41 · coluna "Anterior";
   - 60 · Progresso (cargas, km, volume, recordes);
   - 82 · artes "Evolução" e "Recorde".
2. **Esperado:** treinos passados com seus números.
3. **Suportado:**
   - `historyView` dá por sessão vinculada só `{eventId, sessionId, date, completed, minutes}` (`views.mjs:64-70`, probe `26-history-final.json`);
   - uma corrida importada sem vínculo, que fica no registro (probe `24-import-unlinked.json`), não aparece nele;
   - `presentation().inForce[].execution` traz `actualMinutes`, `measuredKm`, `declaredKm`, `extentKm`, `reliability` e `paceWithheld`, mas só das corridas do plano em vigor;
   - a regra de força `FROM_LOG` diz "Use the load you logged last time" sem trazer o número (probe `03-sessions.json`).
4. **Evidência:** código e probes citados.
5. **Solução mínima:**
   - a fachada de A expõe `loggedEntries()`: uma projeção somente leitura dos relatos do próprio atleta que o registro guarda;
   - campos: canal, esporte, data, minutos, distância e medição, RPE, motivo de parada, exercícios com séries e cargas como registradas, `superseded`;
   - tipo `LoggedEntry` na proposta CHG-UI-1; função na CHG-UI-2;
   - é código de aplicação sobre `custody.read`: não muda o motor nem o documento;
   - **a UI não mantém segunda cópia** (G07: apagar alcança todas as camadas);
   - "Anterior" e a carga `FROM_LOG` vêm daí;
   - o PR de força é a maior carga registrada (GAP-27).
6. **Responsável:** A (projeção, com revisão SEC sobre o que cruza a ponte), C (telas).
7. **Teste de aceite:**
   - a projeção devolve exatamente as linhas visíveis do registro do próprio atleta;
   - corrigir mostra o relato em vigor;
   - `eraseAccount` deixa a lista vazia;
   - nenhuma chave reservada da fronteira (`provenance`, `context`) cruza para o Swift.
8. **Impacto V1:** sem isso, 50, 60 e 82 só mostram data, feito/não feito e minutos. **É o maior gap funcional da UI.**

### GAP-07 · Fases e volume previsto por semana não estão na view
1. **Afetado:**
   - 30 · `Fases · plano inteiro` (`596:2125`), o gráfico "Fases até a prova · minutos por semana", "Semana 3 de 8 · Construção";
   - 20 · trilha Construção → Específico → Polimento.
2. **Esperado:** fase e minutos previstos por semana.
3. **Suportado:**
   - `program.weeks[w]` tem `phase` (`ESTABLISHMENT | BUILD | CONSOLIDATION | SPECIFIC | TAPER | RACE_WEEK`), `plannedRunMinutes` e `plannedStrengthSets`;
   - `planView` e `sessions()` não expõem nenhum deles;
   - a soma de `durationMinutes` das sessões é derivável, mas não é o número do motor.
4. **Evidência:** leitura do documento sintético (`program.weeks[].phase`); `views.mjs:planView`.
5. **Solução mínima:**
   - projeção `weekPlan()` na fachada de A com `{index, startDate, phase, plannedRunMinutes, plannedStrengthSets, status}` (CHG-UI-2);
   - o rótulo da fase é cópia por código;
   - as semanas depois de uma pergunta seguem `projected` ("suave é previsto").
6. **Responsável:** A, C.
7. **Teste de aceite:** os números do gráfico batem com o documento; nenhuma fase aparece num plano sem esse campo.
8. **Impacto V1:** sem isso, o gráfico de fases some e a soma das sessões fica como fallback rotulado "previsto".

### GAP-08 · A proposta pendente não mostra o que muda na força
1. **Afetado:**
   - 30 · `Proposta · aguardando confirmação (sábado indisponível)` (`597:1542`), `Mover · o que muda antes de confirmar` (`597:1909`);
   - 70 · `Volume e dificuldade · … (proposta)`;
   - 31 · `proposta de troca de exercício, aguardando`.
2. **Esperado:** o antes e depois da semana.
3. **Suportado:**
   - `view.pending = {decisionId, kind:'CHANGE_WAITING_CONFIRMATION', change:'REQUESTED_CHANGE'}`, sem diff;
   - `decision(decisionId)` dá `action` e `reason` (em inglês);
   - `presentation().pending` dá as corridas do plano proposto;
   - a força do plano proposto não é exposta.
4. **Evidência:** probes `actions-B1-unavailable-day.json`, `actions-A2b-plan-after-substitution.json`; `integration.mjs:340`.
5. **Solução mínima:**
   - projeção `pendingWeek()` na fachada de A: as sessões do plano proposto no mesmo formato da view (CHG-UI-2);
   - o diff é calculado na UI como comparação descritiva de dois planos do motor, sem regra;
   - sem a projeção, a folha mostra só a razão (por `action`) e as corridas.
6. **Responsável:** A, C.
7. **Teste de aceite:**
   - para `UNAVAILABLE_DAY`, `PREFERENCE_CHANGE` e `EXERCISE_SUBSTITUTION`, a folha lista as sessões que mudam;
   - aceitar ou recusar chega ao estado `VALID_PLAN` (probe `actions-B2-accept-unavailable.json`).
8. **Impacto V1:** a confirmação continua funcionando; só o detalhe da força depende da projeção.

### GAP-09 · Arrastar um treino para um dia escolhido
1. **Afetado:** 30 · `Mover · arrastando a corrida leve de quinta para sexta` (`593:689`), "Toque e segure para mover um treino".
2. **Esperado:** o atleta escolhe o dia de destino.
3. **Suportado:**
   - não existe operação do atleta para "mover a sessão X para o dia Y";
   - existem:
     - `updateAvailability({unavailableDates})`, que dá `RESCHEDULE_WITHIN_WEEK` à espera de confirmação (probe `actions-B1-unavailable-day.json`: "moved within chosen days when that adds no interference, otherwise skipped without debt");
     - `updateAvailability({changes})` (`SCHEDULE_CHANGE`, os dias da rotina);
     - a oferta `MOVE` do treinador depois de uma sessão perdida (`custody.mjs OFFERED_ACTIONS`).
4. **Evidência:** `api.mjs`, `custody.mjs:24-30`, probe B1.
5. **Solução mínima:**
   - o gesto vira "não posso neste dia": o dia de origem fica indisponível, o motor propõe o encaixe, a folha mostra o resultado (GAP-08) e o atleta confirma;
   - a tela `Mudar a agenda · dia indisponível, escolher` já existe e passa a ser o caminho do gesto;
   - **proposta de cópia no Figma** (`593:689` e `597:1909`): "Toque e segure para mudar o dia. O treinador encaixa o treino e você confirma antes de valer."
6. **Responsável:** C; FDR/Design (cópia).
7. **Teste de aceite:** o gesto gera `updateAvailability({unavailableDates:[origem]})`, nunca uma data de destino escolhida pela UI, e nada vale antes de `accept`.
8. **Impacto V1:** o destino escolhido pelo atleta fica para uma mudança revisada da fronteira (V2).

### GAP-10 · Ajuste de carga e sugestão do treinador durante a sessão de força
1. **Afetado:**
   - 41 · `ajuste de carga (reserva abaixo do previsto)` (`665:486`): "Baixar para 70 kg / Manter 72,5 kg";
   - 41 · `sugestão do treinador durante a sessão` (`665:1079`): "Sai só o afundo… Aceitar mudança".
2. **Esperado:** número e mudança sugeridos no meio do treino.
3. **Suportado:**
   - o motor decide sobre relatos, não dentro da sessão: não há operação intra-sessão;
   - a prescrição traz `load.mode` (`KNOWN` com `value`, `FROM_LOG` com `rule`, `ESTABLISH`, `BODYWEIGHT` ou `RETURN`) e instruções em texto;
   - "70 kg" e "sai o afundo" seriam calculados pela UI, o que é proibido;
   - nenhuma busca no motor encontrou regra intra-sessão.
4. **Evidência:** probe `03-sessions.json` (instruções e regras de carga); `api.mjs`.
5. **Solução mínima:**
   - **ajuste:** mostrar a orientação do plano por código (regra de carga e reserva) e deixar o atleta editar a carga das séries que faltam como relato dele, sem número sugerido;
   - **sugestão do treinador:** fica `FUTURE_ONLY`. A estrutura fica no componente, oculta na V1; a sessão pode terminar como parcial e o motor decide na revisão;
   - **proposta no Figma:** em `665:486`, trocar "Baixar para 70 kg" por "Ajustar carga" (campo) e manter "Manter 72,5 kg".
6. **Responsável:** C; FDR/Design.
7. **Teste de aceite:** nenhuma string de carga sugerida aparece sem vir de `prescription.exercises[].load.value`; a sessão parcial chega como `logStrength` com as séries feitas.
8. **Impacto V1:** cópia e estado apenas.

### GAP-11 · Pergunta rápida antes do treino ("decide entre manter ou trocar por caminhada")
1. **Afetado:** 20 · `Pergunta rápida antes do treino` (`575:1172`).
2. **Esperado:** a resposta decide o treino da noite.
3. **Suportado:**
   - não há operação verificada que troque a corrida da noite por caminhada a partir dessa pergunta;
   - os tipos de revisão `LOCAL_FATIGUE` e `SYSTEMIC_FATIGUE` existem no motor (`r6-adaptation.mjs:19`), mas não foram exercitados pela fronteira V1 nem têm formulário em `api.mjs`;
   - "Com dor que não passa" tem caminho suportado: `EXERCISE_SUBSTITUTION` com dor, ou "Dor ou lesão", dá `CLINICAL_HUMAN_REQUIRED` (probe `actions-A3-substitution-pain.json`).
4. **Evidência:** probes; `api.mjs`.
5. **Solução mínima:**
   - "Normais" não envia nada;
   - "Com dor" leva ao fluxo 72 · `Dor ou lesão`;
   - "Mais pesadas" fica `UNVERIFIED` até A provar um envio `LOCAL_FATIGUE` e mostrar o que o motor devolve. Até lá, a cópia não promete o desfecho;
   - **proposta no Figma** (`575:1172`): trocar "Sua resposta decide entre…" por "Se algo não estiver bem, o treinador revê com o que você contar."
6. **Responsável:** A (prova), C, SSCTR (cópia).
7. **Teste de aceite:** nenhuma resposta altera a sessão sem uma resposta do motor; "Com dor" chega a `CLINICAL_HUMAN_REQUIRED`.
8. **Impacto V1:** a pergunta pode ficar, com a cópia ajustada.

### GAP-12 · Força avulsa e registro sem sessão (comportamento a investigar)
1. **Afetado:**
   - 41 · "Força avulsa";
   - 50 · `Força avulsa · fora do plano` (`684:4381`);
   - 50 · `Registrar treino · força feita fora do app`;
   - 72 · `treino avulso salvo, plano segue pausado`.
2. **Esperado:** uma sessão fora do plano fica no histórico.
3. **Suportado:**
   - uma corrida avulsa enviada por `submit` com `actual.sport:'RUN'` fica no registro como `UNPLANNED` (probe `unplanned-8-rows-kept.json`);
   - uma força avulsa responde `recorded:[id]`, mas o documento guardado não tem linha com esse id: aparece um slot nulo (`probes/trace-unplanned-strength.mjs`, `out/trace-unplanned-strength.txt`);
   - uma segunda corrida avulsa sem `sport`, no mesmo dia de outra avulsa, também responde `recorded` e não fica no documento (`unplanned-2`, `unplanned-8-rows-kept.json`). Sozinha, ela fica (o traço). O comportamento depende do contexto e não está explicado;
   - `actual.sport` não está na lista de chaves do handoff §5.2 (SEC-INT-12), e o motor precisa dela para ler a avulsa.
4. **Evidência:** probes citados.
5. **Solução mínima:**
   - A investiga com um teste próprio (sem mudar o motor) e registra se é comportamento esperado (o motor não guarda força sem sessão) ou defeito;
   - até lá, C só mostra "salvo" para uma avulsa quando `loggedEntries()` contém a linha;
   - a lista de chaves de SEC-INT-12 ganha `sport` para relatos sem `sessionId`.
6. **Responsável:** A (investigação e schema), INT/FDR (se for defeito, vira exceção pós-freeze), C.
7. **Teste de aceite:** o teste de A reproduz o traço; a UI de força avulsa não confirma o que o registro não guarda.
8. **Impacto V1:** força avulsa fica `UNVERIFIED`; corrida avulsa fica suportada.

### GAP-13 · Excluir um treino ou remover um importado
1. **Afetado:**
   - 50 · `Corrida avulsa · excluir (confirmação)` (`683:2360`), `Força avulsa · excluir`, "depois de excluir a avulsa (desfazer)";
   - 81 · `Importado · remover do Repmile (folha)` (`849:1153`).
2. **Esperado:** apagar um treino.
3. **Suportado:**
   - não existe exclusão de relato: existem correção (`correctionOf`, o original fica como histórico), `eraseHealthFacts` (só fatos F08) e `eraseAccount`;
   - deleções do HealthKit não são enviadas na V1 (G-5).
4. **Evidência:** `api.mjs`; handoff §11; contrato paralelo G-5.
5. **Solução mínima:**
   - V1 oferece "Corrigir registro" (já desenhado em 50: `corrigir registro (folha)`);
   - "Excluir" e "Remover do Repmile" ficam ocultos (`FUTURE_ONLY`);
   - **proposta no Figma:** marcar as duas folhas como V2.
6. **Responsável:** C; FDR (produto); INT (G-5).
7. **Teste de aceite:** nenhuma ação "excluir" é alcançável na V1.
8. **Impacto V1:** perde-se a exclusão; a correção cobre o erro de registro.

### GAP-14 · "Era o treino do plano?": vincular um importado escolhido pelo atleta
1. **Afetado:** 81 · `Importado · era o treino do plano? (folha no Hoje)` (`849:811`).
2. **Esperado:** o atleta liga um treino importado a uma sessão.
3. **Suportado:**
   - B só vincula quando há exatamente uma corrida prevista e um treino no dia (contrato paralelo §4.3);
   - o vínculo pelo atleta seria uma afirmação dele dentro de um relato do aparelho, o que mistura autoria;
   - o atleta pode registrar a sessão pelo próprio formulário (duas vozes), mas se o treino do aparelho ficou sem vínculo, a contagem dos dois relatos não foi verificada.
4. **Evidência:** contrato paralelo §4.3; handoff §11; NATIVE 7.5.
5. **Solução mínima:** fica `UNVERIFIED` até A e B provarem, com fixture, que "aparelho sem vínculo + formulário do atleta na sessão" não conta duas vezes. Até lá, a folha oculta.
6. **Responsável:** A + B (prova na integração), C.
7. **Teste de aceite:** fixture de integração com os dois relatos: uma execução no plano, nenhuma contagem dupla.
8. **Impacto V1:** um caso ambíguo continua sem vínculo; isso é seguro.

### GAP-15 · Possível duplicata entre fontes (Apple Watch × outro app)
1. **Afetado:** 81 · `Importado · possível duplicata (folha)` (`849:1066`).
2. **Esperado:** o app detecta a mesma corrida vinda de duas fontes.
3. **Suportado:**
   - a fronteira deduplica por digest exato e por `activityId`;
   - duas gravações da mesma corrida por apps diferentes são dois `HKWorkout`;
   - fontes de terceiros são o OPEN-1 (DR-118 × SEC-INT-09).
4. **Evidência:** contrato paralelo OPEN-1; `integration.mjs` (duplicates).
5. **Solução mínima:** fica oculta até a decisão do OPEN-1; B pode já contar candidatos como diagnóstico, sem enviar ao motor.
6. **Responsável:** FDR + SEC (OPEN-1), B.
7. **Teste de aceite:** nenhum aviso de duplicata é mostrado sem regra aprovada.
8. **Impacto V1:** depende do OPEN-1.

### GAP-37 · Zonas de FC: três zonas do motor, contra cinco zonas e "máxima informada" no Figma
1. **Afetado:**
   - 50 · "Zonas", "Tempo por zona" Z1–Z5 (máxima 188 bpm);
   - 71 · `Frequência cardíaca · zonas aproximadas pela máxima informada (Lucas)`, `… máxima observada com cinta`, `… valores de laboratório, como fornecidos`, `… sem zonas (Rafa)`.
2. **Esperado:** cinco zonas a partir de uma FC máxima, inclusive informada.
3. **Suportado (`v1-run-calibration.mjs heartRateOf`; `RUN_CALIBRATION_EXTENSION_V1.json heartRate`):**
   - **laboratório:** valores como fornecidos (`LAB_TEST`, até 182 dias, `checkedByTheApp:false`);
   - **máxima observada:** **três** zonas (`LOW` < 0,80, `MODERATE` 0,80–0,87, `HIGH` ≥ 0,87). Exige uma prova, contrarrelógio ou teste de campo de ≥ 10 min, RPE ≥ 8 e sensor `CHEST_STRAP`, em até 365 dias;
   - **sem isso:** `UNAVAILABLE` (`NO_MEASURED_HEART_RATE` ou `HEART_RATE_DATA_NOT_QUALIFYING`);
   - uma **máxima informada** sem sensor não gera zonas;
   - as zonas são `REFERENCE_SCALE_ONLY` e nunca alvo de sessão;
   - as entradas (FC do anchor, `lab`) **não constam da lista de chaves do intake** no handoff §5.1.
4. **Evidência:** código e dados citados; probe 12 (`UNAVAILABLE`).
5. **Solução mínima:**
   - 71 usa as variantes "laboratório", "máxima observada com cinta" (renderizando três zonas) e "sem zonas";
   - "máxima informada" fica oculta (`UNSUPPORTED_V1`);
   - 50 · "Tempo por zona" Z1–Z5 fica `FUTURE_ONLY`: depende de série de FC (GAP-17) e de cinco zonas que o motor não define;
   - A inclui as chaves de FC dos anchors e de `LAB_TEST` na struct de intake, se o Founder quiser zonas na V1;
   - **proposta no Figma:** em 71, trocar Z1–Z5 por "baixa · moderada · alta".
6. **Responsável:** A (schema), C, FDR/Design, SSCTR (rótulos).
7. **Teste de aceite:** as zonas mostradas são exatamente `heartRateZones.zones` ou `values`; sem `AVAILABLE`, nenhuma zona aparece.
8. **Impacto V1:** cópia e estado. As zonas existem, mas só com cinta ou laboratório.

---

## DATA_SOURCE (fonte nativa a ligar, ou fonte que a V1 ainda não autoriza)

### GAP-16 · Corrida só com o iPhone: distância, ritmo, parciais, percurso e elevação não chegam ao registro
1. **Afetado:**
   - 40 · todas as corridas com GPS (`510:473`, `Corrida avulsa · em andamento, com GPS`);
   - 50 · `leve, só com o iPhone, rota oculta` (`880:20729`), `limiar · só com o iPhone`;
   - 82 · artes com rota;
   - 99 · "Só o iPhone: tempo, distância, ritmo, parciais por km, percurso e elevação".
2. **Esperado:** o iPhone mede a corrida e o plano usa a distância medida.
3. **Suportado:**
   - **o canal ATHLETE** aceita `distanceKm` só como **declarada** pelo atleta; `measurement` e `gpsQuality` são exclusivos do aparelho (`v1int-helpers.mjs DEVICE_ONLY`; handoff §5.2–5.3). Pôr a distância do GPS do app no formulário do atleta falsifica a autoria;
   - **o canal DEVICE** aceita só `HKWorkout` (`activityId = uuid`);
   - gravar no HealthKit o treino do próprio app é decisão aberta (DR-121/DR-107), e a regra de B trata gravações de outros apps como afirmação do atleta (handoff §11; OPEN-1);
   - **ninguém tem o gravador da corrida no app:** CoreLocation, cronômetro das etapas, background, Live Activity e retomada depois que o app fecha não estão no escopo de A nem de B.
4. **Evidência:** handoff §5.2, §5.3, §11; DR-121; `HEALTHKIT_MISSION_HANDOFF.md` ("não pedir escrita").
5. **Solução mínima V1:**
   - **sem decisão:** a corrida no app registra tempo, etapas e esforço pelo canal ATHLETE. O GPS ao vivo pode guiar a corrida na tela (`SUPPORTED_IOS`), mas o resumo salvo mostra só o que o registro guarda (tempo e esforço), sem distância medida, mapa nem parciais. O layout fecha o espaço, como o próprio 99 prevê;
   - **com decisão do Founder e de SEC (recomendada):** o app grava a própria corrida como `HKWorkout` com rota (`HKWorkoutBuilder` + `HKWorkoutRouteBuilder`), e B a importa pelo canal DEVICE com `measurement: GPS`. A política de fonte ganha "gravação do próprio Repmile = aparelho", uma extensão do OPEN-1;
   - **dono do gravador:** proposto como frente B2 (captura) ou subescopo de C sem HealthKit (CHG-UI-5).
6. **Responsável:** FDR + SEC (decisão), B/B2 (gravação e importação), C (telas).
7. **Teste de aceite:**
   - sem a decisão, nenhuma distância medida pelo app aparece num registro salvo;
   - com a decisão, a corrida do app chega como `HKWorkout` e volta pelo canal DEVICE, com `measuredKm` em `execution`.
8. **Impacto V1:** **é o gap mais importante para a V1 sem relógio.** O treino funciona (tempo e esforço), mas a riqueza da corrida só com o iPhone depende dessa decisão.

### GAP-17 · Sinais do relógio: FC, cadência, elevação, sono, VFC, FC de repouso, VO₂ máx
1. **Afetado:**
   - 20 · "Sono 7h10 · VFC 58 ms";
   - 50 · números do treino, blocos com FC, gráficos, zonas;
   - 60 · "Sinais do relógio", VO₂ máx;
   - 72 · `Sinais do relógio · dados completos` (`806:3252`) e variantes.
2. **Esperado:** mostrar os sinais quando chegarem.
3. **Suportado:**
   - o motor não lê nenhum deles: `paceInsights.heartRateInput=false`, `runCalibration.heartRateZones = UNAVAILABLE / NO_MEASURED_HEART_RATE` (probe 12), G-1;
   - a V1 lê do HealthKit só treinos, distância e a presença de rota (handoff §11; handoff B §2);
   - FC "só se uma regra revisada a ler";
   - mostrar esses dados exige novas permissões de leitura de dados de saúde.
4. **Evidência:** probe 12; handoff §11; `HEALTHKIT_MISSION_HANDOFF.md:50`.
5. **Solução mínima:**
   - **V1 padrão:** os componentes ficam completos no código, com todas as variantes, e ocultos (`Availability.unsupported("NOT_IN_V1")`);
   - **com decisão do Founder e de SEC de leitura só para exibição:** viram `SUPPORTED_HEALTHKIT`, lidos por B e expostos a C por uma porta própria, nunca enviados ao motor;
   - **zonas de FC:** não vêm da FC do HealthKit. São as do motor (GAP-37), nunca uma fórmula por idade (`ageFormula: AGE_FORMULA_NOT_INDIVIDUAL`).
6. **Responsável:** FDR + SEC (decisão), B, C.
7. **Teste de aceite:** com `unsupported`, nenhuma célula vazia, traço ou "indisponível" aparece, e a grade de 3 × 2 vira 2 × 2 (regra do 99).
8. **Impacto V1:** `FUTURE_ONLY` por padrão. A UI fica pronta para quando a fonte for autorizada.

### GAP-18 · Força importada do Apple Saúde como histórico informativo
1. **Afetado:**
   - 50 · `Força · importada do Apple Saúde` (`684:4890`);
   - 60 · `Força · 12 semanas, importados só com duração` (`730:1109`);
   - 81 · `conectado` ("Treinos de corrida e de força entram no histórico como importados").
2. **Esperado:** força feita em outro app aparece no histórico, só com a duração.
3. **Suportado:**
   - o canal DEVICE aceita só `RUN` (`admission.mjs DEVICE_ACTIVITY_TYPES`);
   - B classifica e exclui a força com contagem (G-4) e não a guarda para exibição;
   - o produto pede que "o que falta aparece como desconhecido, nunca inventado" (DPC).
4. **Evidência:** `admission.mjs`; handoff B §2 (G-4); DPC "Integrações".
5. **Solução mínima:**
   - B expõe a C, por uma porta nova (CHG-UI-3), os treinos não-corrida importados como resumo `{uuid, tipo, início, fim, duração, app de origem como o Apple Saúde informa}`;
   - nunca vão ao motor;
   - nunca têm séries, cargas ou RIR;
   - a UI mostra "registrado no Apple Saúde · só a duração".
6. **Responsável:** B (porta), C (telas), INT (composição).
7. **Teste de aceite:**
   - fixture de força importada: o histórico mostra a duração e nenhuma série;
   - a carga de força do Progresso não conta o importado;
   - `strengthExposure` não muda.
8. **Impacto V1:** é aditivo para B. Se não entrar, a linha some.

---

## STATE_MAPPING (usar estado ou variante que já existe)

### GAP-19 · "Acesso negado" e "FC sem permissão" no Apple Saúde não são observáveis
1. **Afetado:**
   - 81 · `Apple Saúde · acesso negado` (`848:502`);
   - 81 · `conectado em parte` (`848:383`): "frequência cardíaca sem permissão".
2. **Esperado:** estados distintos para leitura negada.
3. **Suportado:**
   - o iOS não revela negação de leitura: uma consulta vazia é indistinguível de "nada registrado";
   - o próprio `848:502` já diz que "O iPhone não conta ao app o que foi negado".
4. **Evidência:** Apple HealthKit (`authorizationStatus` só reflete compartilhamento); Figma `848:502`.
5. **Solução mínima:**
   - B só informa `authorizationRequested` (o pedido foi feito) e "nada recebido desde X";
   - C mapeia para `Apple Saúde · nada recebido` com o passo a passo de `848:502`;
   - "conectado em parte" vira "o que está chegando" (já desenhado: `conectado, o que está chegando`), listando o que chegou;
   - **proposta no Figma:** reescrever "FC sem permissão" como "nenhuma FC recebida".
6. **Responsável:** B, C; FDR/Design (cópia).
7. **Teste de aceite:** nenhum estado ou texto afirma negação de leitura.
8. **Impacto V1:** cópia e estado.

### GAP-20 · Ações que pedem a triagem atual (`eligibility.currentAssessment`)
1. **Afetado:**
   - 70 · `Volume e dificuldade`, `Seu treinador`, `Rotina`;
   - 30 · `Mudar a agenda`;
   - 72 · `Pausa · declarar`.
2. **Esperado:** a ação é aplicada.
3. **Suportado:**
   - sem `eligibility` atual, o motor responde `ASK` com `missingInputs: ["eligibility.currentAssessment"]` e o plano fica `NEEDS_INPUT`, sem nada executável (probe `14-setPreferences.json`);
   - com a triagem, a mesma ação dá `PENDING_CONFIRMATION` (probe `actions-B3-preferences-with-screen.json`);
   - uma pausa precisa das datas já terminadas (`interruption.endAfterThisReview`, probe `actions-E1-break-nonclinical.json`).
4. **Evidência:** probes citados.
5. **Solução mínima:**
   - C anexa a triagem do dia (o mesmo componente de `27 Cuidados`, reusado) quando a view a pede, perguntando exatamente `question.missingInputs`;
   - a pausa só se declara retroativamente (início e fim) ou ao voltar ("Volta depois de uma pausa", 20).
6. **Responsável:** C (e A, que repassa a triagem).
7. **Teste de aceite:** para cada ação de 70/30/72, a fixture com e sem triagem chega aos estados acima.
8. **Impacto V1:** estado.

### GAP-21 · "Atualização necessária" e validade do repertório R7-B0
1. **Afetado:** 81 · `Atualização necessária · esta versão não envia mais` (`849:3950`).
2. **Esperado:** bloquear o envio de uma versão antiga.
3. **Suportado:**
   - não há backend de versão na V1;
   - o repertório R7-B0 vence em 2027-04-30, e A expõe o estado de expiração (handoff A, item 9).
4. **Evidência:** handoff A; freeze.
5. **Solução mínima:**
   - a tela vira o estado `Startability.notStartable(.repertoireExpired)`;
   - a checagem de versão por servidor fica `BACKEND_REQUIRED` (GAP-33).
6. **Responsável:** A, C.
7. **Teste de aceite:** com relógio depois de 2027-04-30, nenhuma sessão é iniciável e a tela aparece.
8. **Impacto V1:** estado.

### GAP-22 · Hold, retorno, pergunta e erros: a UI mostra o estado do motor, nunca um plano vazio
1. **Afetado:**
   - 72 · `algum sinal, sem treino prescrito`, `Declaração enviada · a corrida volta, a força segue retida`;
   - 20 · `Sistema · sem plano`, `erro ao carregar`;
   - 81 · erros.
2. **Esperado:** cada estado tem tela.
3. **Suportado:**
   - **cada estado tem probe:**

     | Estado | Probe |
     |---|---|
     | `BLOCKED` | 17 |
     | `RETURNING` | 19 |
     | `NEEDS_INPUT` | 14 |
     | `PENDING_CONFIRMATION` | A2b |
     | `OPERATIONAL_ERROR` | 22 |
     | `NO_DATA` | 23, F5 |

   - o retorno "a corrida volta, a força segue retida" é exatamente `sports.STRENGTH.state = HELD` com `exit: READINESS_DECLARATION`;
   - a velocidade de retorno "Padrão / Com mais cautela" (`843:1980`) é `readiness.returnSpeed` (`BALANCED` ou `CONSERVATIVE`, `v1-f08.mjs:31,169`), suportada.
4. **Evidência:** probes; `views.mjs:stateOfError`.
5. **Solução mínima:**
   - tabela `ClientState` e `error.code` → tela (handoff §7) implementada em C;
   - estado desconhecido falha fechado (`ClientState.unrecognized`, testado na proposta CHG-UI-1).
6. **Responsável:** C.
7. **Teste de aceite:** uma fixture por estado e por código de erro do handoff §7, cada uma chegando à tela certa.
8. **Impacto V1:** estado.

---

## COPY_ONLY

### GAP-23 · Textos do treinador que afirmam razões que o motor não deu
1. **Afetado:**
   - 20 · `Dia duplo · manhã` (`572:203`): "nessa ordem, as pernas chegam mais inteiras ao longão de sábado", com "Por que nessa ordem?";
   - 20 · `longão mantido após noite curta` (`572:1379`): "Uma noite, sozinha, não muda o plano", com "Por que manteve?";
   - 60 · "Contexto para o plano";
   - 72 · `relato diferente do relógio`: "Uma noite isolada não muda o plano".
2. **Esperado:** explicações contextuais do treinador.
3. **Suportado:**
   - o motor explica com `decision.reason` e `session.explanation` em **inglês** e com códigos (`status`, `action`, `kind`, `role`, `turn`, `effortDomain`);
   - não produz razão sobre ordem do dia nem sobre sono;
   - não lê sono, que o próprio 81 `conectado` declara corretamente: "O treinador não usa sono, VFC nem frequência de repouso para decidir o treino".
4. **Evidência:** probes 10, 13, 19 (`lastDecision.reason`, `explanation`); `paceInsights.heartRateInput=false`.
5. **Solução mínima:**
   - C implementa a cópia como tabela por código (`action` × `kind` × `role` × `turn`), revisada (C-BC-3);
   - frases que afirmam uma razão inexistente saem;
   - **"noite curta" na V1:** `572:1379` não aparece, porque depende de sono (GAP-17), ou aparece sem a frase "não muda o plano";
   - **propostas no Figma:**
     - `572:203`: "Por que nessa ordem?" mostra a razão do motor quando houver; sem razão, o botão some;
     - 60: "Contexto para o plano" vira "Só para você ver: não entram no plano".
6. **Responsável:** C, SSCTR (cópia de decisão), FDR/Design.
7. **Teste de aceite:** cada frase do treinador na UI vem de uma chave de cópia ligada a um código do motor (teste de cobertura da tabela).
8. **Impacto V1:** cópia.

### GAP-24 · Textos do motor em inglês: prescrição, instruções e razões
1. **Afetado:** 31 (etapas, esforço, instruções), 41 (regras de carga), 20 e 30 (razões), 60 (frases de estimativa).
2. **Esperado:** PT-BR, EN e ES (83).
3. **Suportado:**
   - **campos de texto em inglês:** `prescription.effort`, `instructions[]`, `intensity.talk`, `load.rule`, `decision.reason`, `estimates[].statement`, `planScenario.statement`, `basis.statement`;
   - **parâmetros:** as razões do retorno ("restarts after 4 days … 2 conditional steps back") só existem dentro do texto, sem parâmetros estruturados (probe `21-decision.json`).
4. **Evidência:** probes 03, 12, 21.
5. **Solução mínima:**
   - cópia localizada por código: `effortDomain` + `rpe[]` dá "Esforço 2–4 · conversa em frases inteiras";
   - números vêm dos campos numéricos, nunca do texto;
   - **parâmetros do retorno:** a fachada de A pode projetar os parâmetros do retorno (CHG-UI-2, opcional); sem isso, a cópia de retorno é genérica por `action = READINESS_RESTART`;
   - o texto em inglês nunca é mostrado a quem usa PT-BR ou ES.
6. **Responsável:** C; A (projeção opcional).
7. **Teste de aceite:** com idioma PT-BR, nenhuma string do motor aparece (teste de snapshot com as fixtures).
8. **Impacto V1:** cópia.

### GAP-25 · "Mapa híbrido", VO₂ máx e "entrou na zona da meta"
1. **Afetado:** 60 · `Geral · 12 meses` (`512:360`).
2. **Esperado:** força relativa × VO₂ máx e uma "zona da meta".
3. **Suportado:**
   - o motor não produz VO₂ máx, força relativa nem zona de meta híbrida;
   - "zona da meta" é uma interpretação, mesmo com a ressalva "isso não prova que um ajudou o outro".
4. **Evidência:** grep do motor; probes 12.
5. **Solução mínima:**
   - o bloco fica `FUTURE_ONLY`, oculto na V1, com o componente preservado;
   - **proposta no Figma:** marcar o "Mapa híbrido" como V2.
6. **Responsável:** C; FDR/Design.
7. **Teste de aceite:** a V1 não renderiza o bloco.
8. **Impacto V1:** o Progresso perde um bloco; os demais ficam.

---

## APP_IMPLEMENTATION (comportamento da camada do app, sem decisão esportiva)

### GAP-26 · Esteira: velocidade no lugar do ritmo
1. **Afetado:** 40 · `esteira, velocidade no lugar do ritmo` (`657:1342`): "11,4–12,4 km/h · equivale a 4:50–5:15 /km".
2. **Esperado:** a faixa em km/h.
3. **Suportado:**
   - a faixa vem do motor (`intensity.pace` ou `paceBands`);
   - converter s/km em km/h é aritmética de unidade, não prescrição;
   - a medição `TREADMILL` não dimensiona doses (`RUN_FORMATS_V1.sizingExclusions`).
4. **Evidência:** probe 12; `RUN_FORMATS_V1.json`.
5. **Solução mínima:** C converte só a faixa dada, com o arredondamento declarado. "Sem GPS o ritmo não é medido" fica.
6. **Responsável:** C.
7. **Teste de aceite:** a faixa convertida vale (3600 / s por km), e não há faixa sem `pace` do motor.
8. **Impacto V1:** nenhum.

### GAP-27 · Recordes, marcos e evolução
1. **Afetado:** 60 · "Marcos" (5 km 21:48; agachamento 92,5 kg; maior longão); 82 · `Arte 6 · Recorde`, `Arte 3 · Evolução`.
2. **Esperado:** recordes reais.
3. **Suportado:**
   - **corrida:** `runCalibration.actualResults` e `historicalBest` (resultados reais, `isEstimate:false`), suportado;
   - **força:** o motor não calcula PR. A "maior carga registrada" é um fato do registro (GAP-06), não uma estimativa;
   - e1RM é proibido sem regra.
4. **Evidência:** probe 12; DPC ("PR, estimativa e progressão são conclusões diferentes").
5. **Solução mínima:** recorde de corrida pelo motor; de força, pela maior carga registrada × reps, rotulada como "registrada"; nunca estimativa.
6. **Responsável:** C (depende de GAP-06).
7. **Teste de aceite:** nenhum recorde sem linha de origem; estimativas nunca aparecem como recorde.
8. **Impacto V1:** depende de GAP-06.

### GAP-28 · Consistência e aderência
1. **Afetado:** 60 · "Consistência 44 de 52 semanas"; 82 · `Arte 7 · Constância e conquista`; 20 · "19 de 19 sessões feitas".
2. **Esperado:** contagem de semanas e sessões.
3. **Suportado:**
   - contagens descritivas saem do histórico (GAP-06) e do plano;
   - os rótulos dependem de G03, e "% de aderência" fica fora dos shares até G03 (DPC Growth Layer);
   - descanso planejado conta como parte do plano.
4. **Evidência:** DPC.
5. **Solução mínima:** C conta sessões feitas ÷ sessões planejadas não opcionais, sem percentual nos shares, e o descanso planejado não quebra a sequência.
6. **Responsável:** C; G03.
7. **Teste de aceite:** com uma semana de descanso planejado, a sequência não cai.
8. **Impacto V1:** nenhum.

### GAP-29 · Mapa, rota e privacidade de compartilhamento
1. **Afetado:** 50 · mapa da corrida; 82 · `privacidade da rota, início e fim escondidos`; 70 · rotas.
2. **Esperado:** mapa e rota.
3. **Suportado:**
   - a rota só existe se uma gravação a tiver: o `HKWorkoutRoute` de outro app ou a gravação do próprio app (GAP-16);
   - B só lê a presença de rota (OPEN-3), não as coordenadas;
   - a exibição de rota no app começa desligada (DR-109), e os 200 m iniciais e finais ficam ocultos por padrão (DR-133).
4. **Evidência:** handoff B; DPC.
5. **Solução mínima:**
   - V1: mapa só quando houver rota lida com permissão e o atleta tiver ligado as rotas;
   - a leitura de coordenadas é escopo novo de B (CHG-UI-3, opcional);
   - sem rota, "o topo vira cabeçalho simples" (regra do 99).
6. **Responsável:** B, C; FDR (DR-109/133).
7. **Teste de aceite:** um share com rota oculta os 200 m por padrão; sem rota, nada de mapa vazio.
8. **Impacto V1:** depende de GAP-16 e CHG-UI-3.

### GAP-30 · Clima no Hoje
1. **Afetado:** 20 · "☀️ Ensolarado 24°".
2. **Esperado:** clima.
3. **Suportado:**
   - WeatherKit exige entitlement, atribuição Apple Weather, localização e rede;
   - o motor não usa clima: `namedFactors: ["heat"]` é só nota.
4. **Evidência:** probe 12.
5. **Solução mínima:** clima só como contexto, sem frase de ajuste; sem rede ou localização, a célula some.
6. **Responsável:** C.
7. **Teste de aceite:** sem localização, nenhum clima e nenhum espaço vazio.
8. **Impacto V1:** nenhum.

---

## BACKEND_REQUIRED

### GAP-31 · Conta, login, códigos, aparelhos, excluir conta e baixar dados
1. **Afetado:**
   - 80 · `Entrar · Apple, Google ou e-mail` (`824:1172`) e as cerca de 40 telas de conta;
   - 70 · `exportar dados`;
   - 10 · "salvar o plano".
2. **Esperado:** conta real.
3. **Suportado:** nada. Não há backend (handoff §6.2; restrição desta missão). DR-111 exige a conta antes do envio a servidor.
4. **Evidência:** handoff §6.2.
5. **Solução mínima:**
   - C implementa as telas contra uma porta `AccountService` local, com fixture dos estados;
   - "Excluir conta" chama `eraseAccount` local (A), que já é real;
   - exportar dados é local (a fachada exporta o registro do atleta, CHG-UI-2 opcional), sem servidor.
6. **Responsável:** backend (futuro), C (telas), A (apagar e exportar locais).
7. **Teste de aceite:** com fixtures, cada estado de 80 é alcançável; nenhuma chamada de rede existe no build V1 sem backend.
8. **Impacto V1:** a V1 de loja precisa de backend; a implementação das telas não.

### GAP-32 · Assinatura ligada à conta e verificação de servidor
1. **Afetado:** 80 · `Assinar · planos, 7 dias grátis` (`826:2295`) e outras, `assinatura já está em outra conta do Repmile`.
2. **Esperado:** a assinatura vale para a conta.
3. **Suportado:**
   - StoreKit 2 verifica entitlement no aparelho (`Transaction.currentEntitlements`), o que é `SUPPORTED_IOS`;
   - o vínculo entre a assinatura e uma conta Repmile exige servidor;
   - os preços do Figma são exemplos (99: "R$ 199,90 e R$ 59,90 são exemplos"; DR-104).
4. **Evidência:** Figma `934:37`; DR-104/116.
5. **Solução mínima:**
   - preços sempre de `Product.displayPrice`;
   - o "72% menos" é calculado dos preços exibidos (DR-116);
   - o vínculo com a conta fica oculto sem backend;
   - assinatura não adota plano nem remove hold (DPC).
6. **Responsável:** C; backend; FDR (G10).
7. **Teste de aceite:** com StoreKit Testing, todos os estados de compra; nenhum preço fixo no código.
8. **Impacto V1:** compra local é possível; o vínculo depende de backend.

### GAP-33 · Sincronização entre aparelhos, backup e servidor de tempo
1. **Afetado:**
   - 81 · `Plano · mudou em outro aparelho, atualizado` (`849:3330`);
   - 72 · `outro aparelho, o estado vem da conta` (`805:2723`);
   - 80 · `Entrar em outro iPhone`;
   - 81 · checagem de versão.
2. **Esperado:** o estado acompanha a conta.
3. **Suportado:** nada na V1: D2 (backup) e D1 (relógio de servidor) são decisões do Founder; um aparelho, um registro.
4. **Evidência:** handoff §6, §8; DPC.
5. **Solução mínima:** as telas ficam ocultas (`FUTURE_ONLY`) até D2; nunca se promete sincronização (regra da missão §6.7).
6. **Responsável:** FDR (D1, D2), backend.
7. **Teste de aceite:** nenhum texto da V1 promete sincronização entre aparelhos.
8. **Impacto V1:** um aparelho só.

---

## FUTURE_ONLY (estrutura mantida, não ativada)

### GAP-34 · FC ao vivo durante a corrida
1. **Afetado:** 40 · `limiar, bloco 2 de 3` (`510:473`): "158 bpm".
2. **Esperado:** FC ao vivo.
3. **Suportado:** sem app de relógio na V1 (DR-122) e sem sensor BLE no escopo. As variantes "sem FC ao vivo" (`879:2007` e outras) são o padrão da V1.
4. **Evidência:** DR-122; Figma 40.
5. **Solução mínima:** C usa as 4 variantes "sem FC ao vivo"; a célula de FC fica no componente, oculta.
6. **Responsável:** C.
7. **Teste de aceite:** a corrida em andamento nunca mostra uma célula de FC na V1.
8. **Impacto V1:** nenhum. Já desenhado.

### GAP-35 · Relato de sono do atleta ("Dormi umas 5 horas")
1. **Afetado:** 72 · `relato diferente do relógio` (`806:3406`).
2. **Esperado:** o atleta conta o próprio sono.
3. **Suportado:** não há campo de sono no relato do atleta nem no motor.
4. **Evidência:** handoff §5.2.
5. **Solução mínima:** fica oculto, `FUTURE_ONLY`.
6. **Responsável:** C.
7. **Teste de aceite:** não alcançável na V1.
8. **Impacto V1:** nenhum.

### GAP-36 · Altura, peso e "força relativa"
1. **Afetado:** 10 · `19 Altura e peso` (`836:2649`); 81 · "Altura e peso · para preencher o perfil"; 60 · "Força relativa (agachamento ÷ peso)".
2. **Esperado:** coletar e usar.
3. **Suportado:**
   - o intake congelado não tem altura nem peso (handoff §5.1);
   - o motor não os lê;
   - o DPC admite dados declarados opcionais (DR-114: sexo só como pista fraca), mas o freeze não os consome.
4. **Evidência:** handoff §5.1; DR-114.
5. **Solução mínima:**
   - pela minimização de dados, a V1 não coleta altura e peso, e a tela 19 sai do fluxo;
   - se o Founder quiser o perfil, o dado fica local, nunca vai ao motor, e a força relativa continua V2 (GAP-25).
6. **Responsável:** FDR, SEC (privacidade), C.
7. **Teste de aceite:** o intake enviado não contém altura nem peso.
8. **Impacto V1:** onboarding com uma etapa a menos, salvo decisão.

---

## Itens confirmados como compatíveis (registrados para não reabrir)

**Plano e treino**
- **Não estou 100%, sem sinal:** a V1 mantém o plano e não reduz. O motor responde KEEP com "This version does not adjust the plan for feeling under par" (probe `actions-D1-notFeeling100-no-sign.json`), e o Figma diz "esta versão não reduz o treino sozinha". `REDUCED` nunca é devolvido (`views.mjs V1_SERVER_STATES`).
- **Troca de exercício por preferência ou técnica:** `EXERCISE_SUBSTITUTION` com `reason: NONCLINICAL_DISCOMFORT_OR_PREFERENCE | SKILL_MISMATCH` dá `SUBSTITUTE_FOR_REASON`, à espera de confirmação, e o aceite dá `VALID_PLAN` (probes A2, A2b, A2c).
  - Com dor, dá `CLINICAL_HUMAN_REQUIRED` (A3), e o Figma 41 `trocar exercício: com dor` segue isso.
  - **Atenção:** não há formulário em `api.mjs`; A expõe a operação via `submit` (CHG-UI-2).
- **Distância errada:** `actual.declared {distanceKm, reason: SIGNAL_LOSS|OBSTRUCTED_SKY|AUTO_PAUSE|DEVICE_RESTART}` dá `reliability: POOR` e `paceWithheld: CORRECTED_MEASUREMENT` (probe `unplanned-7-presentation.json`), e cobre 50 · `Distância parece errada?` (`688:4096`). "Ignorar" sem distância declarada não existe; a folha pede a distância ou o motivo.

**Segurança e sessão perdida**
- **Parada por sintoma:** abre a triagem (`warningSignScreen.status = REQUIRED`, `RUN_STOPPED_FOR_A_SYMPTOM`). Parada sem motivo é lida como sintoma (`RUN_FORMATS_V1.stops.missingReasonReadAs = SYMPTOM`). Cobre 40 · `registro: algo incomum leva à triagem`.
- **Sessão perdida:** `logRun({completed:false})` dá KEEP, "no debt" (probe 10). A oferta de mover é do treinador, à espera do atleta.

**Estimativas e previsão**
- **Estimativa e previsão:** `estimates` (capacidade atual, faixa primeiro, central nunca sozinho, `promise:false`), `runForecast.planScenario` ("se seguir o plano", envelope de plausibilidade) e `projection` (`UNAVAILABLE`) são três coisas distintas no motor e no Figma (20 · "capacidade atual estimada nos 10 km · meta 44:30"). Maratona fica indisponível sem resultado de meia (probe 12).
- **Teste oferecido (Rafa):** `runCalibration.assessment {status, reason, progress}` existe; o estado "teste oferecido" não foi exercitado (`UNVERIFIED`).
