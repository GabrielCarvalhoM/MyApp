# Vilumo Fit — Core Flows

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Authority overlay · 2026-10-22 · EXP-AUTH-r1.** Read through [DR-93–97](PRODUCT_DECISION_REGISTER.md) / [index filter](../canon/CANONICAL_INDEX.md). Preconditions, object/permission ownership, agency, safe failure/recovery semantics, business constraints and valid outcomes remain. Old destinations and flows as prescribed screen sequences are **LEGACY / SUPERSEDED AS ACTIVE UX AUTHORITY**; semantic ordering (authorization before effect, preview before explicit projection) still binds. DR-91 qualifies blanket route exclusions. No candidate IA is imposed or approved. Isolation metadata is historical after `32b7fb6`; scenario descriptions are not proof of execution. Designer entry: [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

**Estado:** CANDIDATE_IN_ISOLATION — freeze posterior ao SIL; reviews no registro freeze.

| Campo | Valor |
|---|---|
| Revisão | **CF-1.2** · 2026-10-19 |
| Autoria | Product/UX Architect, worker |
| Autoridade / inputs | [PTC-3.2.1](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [PDM-1.3](PRODUCT_DOMAIN_MODEL.md), [PA-1.3](PRODUCT_ARCHITECTURE.md), [RS-1.3](V1_RELEASE_SCOPE.md), [AEC-1.3](ADAPTIVE_ENGINE_CONTRACT.md), [EM-1.2](EXPERIENCE_MODEL.md). |
| Necessidade / consumidor | Percursos de comportamento que provam scope e estrutura, consumidos por review e futura UX Spec. Sem layout, Figma, algoritmo ou código. Gate/publicação no [índice](../canon/CANONICAL_INDEX.md). |

Cada fluxo declara gatilho, objetos, passos, fechamento e recuperação. “Confirmar” significa ação da pessoa sobre alcance/versão identificados, não confirmação universal de todo toque. S01–S18 são **provas analíticas/documentais**, não testes executáveis, de uso ou safety/eficácia. Amendment PREUX-20261015-r1 consome AEC-1.3 e apoio [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md) TR/NUT, [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md) SAFE e [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md) CTRL-001–013; os packs não substituem autoridade do AEC ou o registro único PDR §5.

## F01. Entrar e obter primeiro valor

Gatilho: primeira abertura/retomada do onboarding pessoal, sem caminho social. Objetos: pessoa/consentimento/objetivos/prioridade/Athlete Model/plano inicial. Destino: onboarding → prévia da Week → oferta F11 → adoção → Hoje.

1. Idioma PT-BR/EN/ES e 18+ com dados mínimos/método G08, sem perfil indevido de inelegível. Consentimento/base por finalidade, sensores/wearable e I10 secundário separados e opcionais quando aplicável.
2. Objetivo concreto Running e Strength, prioridade RUN_FIRST/STRENGTH_FIRST/BALANCED, experiência/prática recente, disponibilidade/equipamento e limitação relevante mínima. Unknown é honesto; arbitragem dependente pede preferência, não assume runner-first.
3. Model inicial e especialistas propõem semana coordenada sob policy/cobertura aprovadas; REPLAN base sem plano explícita, adoção APPLY_PLAN_CHANGE. Sem receita/autoridade, estado de limite e próximo passo, não dose inventada ou plano pronto fictício.
4. Mostrar semana e explicação simples da relação Run×Strength/objetivo protegido, confidence/limites; ajustar respostas ou continuar. Primeiro valor é perceber coordenação, não boas-vindas ou IA decorativa.
5. Demonstrar valor antes de hard ask preferencial F11. Oferta/trial/assinatura e adoção do plano são atos separados, ambos com estado real; não aplicar por pagar. Entitlement válido para treino conforme oferta; recusa não apaga dados/direitos ou obriga wearable/share.

Fechamento: plano/proposta coordenada compreendida e adotada quando aplicável, próxima ação direta. Recuperação: guardar confirmado e retomar, sem inferir abandono, plano/cobrança/sucesso. Nenhuma nova pesquisa ou decisão de preço exato é necessária para o Designer.

## F02. Decidir e preparar corrida/força integradas

**Gatilho:** primeira decisão, mudança de contexto ou próxima janela. **Objetos:** contexto, decisão/plano/revisão, sessão e insight. **Destino:** Plano → decisão / Sessão; Hoje é entrada.

1. Ler inputs/revisões com fonte, timing, escala/método, cobertura e confiança por decisão. Separar relato local/efeito funcional, recuperação geral e sinais de relógio; um score favorável não anula restrição/limitação. Sem converter RPE/RIR/HRV em readiness universal (AEC §2).
2. Coordenar ambas modalidades e prioridade Run/Strength/Balanced declarada; verificar adequacy/necessity/ChangeCost e Level0: vigente válido adequado permanece sem mutação. Só se necessário, propor manter/mover/reduzir volume/reduzir intensidade/substituir/recuperar/descansar/pedir contexto/replan/return somente sob policy aplicável. Mostrar efeitos e trade-off; sem espaçamento/dose/default universal. HOLD retém a recomendação dependente e indica alcance, owner/próximo passo privado, sem diagnóstico (AEC §7).
3. Preparar estrutura específica válida; Strength mantém exercício/séries/reps/carga/descanso app-first. Nutrition só seleciona conteúdo aprovado por função/fase/demanda/revisão: pré/durante/pós/intervalo curto/evento. Contexto suficiente para seleção não licencia dose. Recusa/critical context ausente → educação elegível/omissão/pedido mínimo/HOLD conforme AEC §6; sem inferir ingestão, logging, dieta ou suplementos.
4. Se pessoa aplica mudança, mostrar alcance: contexto/plano, futuras sessões, insights e exports afetados. Confirmar sobre versão atual. Nova versão produzida no intervalo invalida proposta antiga.
5. Decisão aplicável permite execução direta F03 ou export opcional F04. Descanso/adaptação fecha por F07; Share não é requisito.

**Fechamento:** versão corrente compreendida/preparada. **Recuperação:** mudança de demanda reavalia insight/export preparado; não manter orientação antiga por parecer conveniente. Se já exportado, informar cópia anterior e tratar remoto conforme F04, sem substituição automática silenciosa.

## F03. Executar, registrar e corrigir diretamente

**Gatilho:** pessoa inicia sessão preparada ou registra atividade não planejada. **Objetos:** referência de sessão, versão executada, registros/observações e desfecho. **Destino:** detalhe da Sessão, acessível em Plano/Hoje; realizado em Progresso pela mesma referência.

1. Identificar a versão selecionada; iniciar diretamente. Nenhuma conversa. Atividade não planejada é registrada como tal, sem inventar prescrição passada.
2. Running usa estrutura/controles específicos da cobertura validada; Strength usa exercícios/séries/repetições/carga/intervalos do repertório suportado. Pausar/retomar e registrar/corrigir são ações diretas.
3. Preservar registros localmente e mostrar sync pendente quando offline. Nova informação durante execução não troca silenciosamente o que foi selecionado nem apaga registros; ajuste do restante mostra versão/alcance e requer aceite.
4. Concluir completa/parcialmente, ou cancelar o que não ocorreu. Registrar o real; ajuste manual/motivo opcional fica privado. Classificação usa critério da sessão/revisão validado; tolerância fina permanece aberta antes de implementação.
5. Reconciliar fatos manuais/externos em F05, atualizar Athlete Model e avaliar futuro em F06; observação não implica mutação. Progresso pessoal existe sem share/check-in.

**Fechamento:** realizado preservado, versão executada rastreável, próximo passo acessível. **Recuperação:** erro/reconnect não duplica atividade ou carga; correção de série altera observação em seu escopo, não apaga outro registro. Repetir sessão histórica cria nova sessão sob contexto atual.

## F04. Enviar structured workout e manter estado honesto

**Gatilho:** pessoa escolhe enviar sessão/revisão numa rota outbound elegível de baixo esforço/custo qualificado. Fluxo condicional V1, não requisito de launch ou integração universal. **Objetos:** conexão/capabilities, permissão de envio, sessão/revisão e export. **Destino:** Sessão → envio; conexão em Você → Integrações.

1. Verificar capability versionada da rota/conta/device e estrutura; documento público, aprovação de acesso e prova em hardware são distintos. Read não autoriza write; finalidade/escopo próprios. HealthKit/Health Connect stores não provam executor, Polar outbound direto não comprovado mantém app. Sem marca universal suportada por default.
2. Traduzir sessão/revisão neutra pelo adapter; preflight compara representação efetiva e relatório de diferenças/perdas. Time/distance/open/reps, repeats/iterações, targets/unidades/baselines e advance mantêm significado. Perda que altera prescrição/safety ou não pode ser prevista → recusar aquele export e oferecer app; confirmação não autoriza descartar alvo. Alternativa nasce como revisão do Engine, não coerção silenciosa (AEC §5.2).
3. Ação explícita identifica intenção/revisão/destino. Imediatamente antes do efeito, inclusive fila/retry, revalidar conta/pessoa, finalidade, permissão, capability, validade/revisão, HOLD e confirmação atual. Revogação/nova revisão vence pendente antigo; token ainda válido não é autorização suficiente.
4. Distinguir fila, transporte aceito, confirmação no sistema externo e disponibilidade no device **apenas quando provada**. Recibo identifica nível/momento/limite; nenhum equivale a execução, atividade recebida ou realizado detalhado.
5. Timeout possivelmente entregue sem read/idempotência remota → desconhecido, sem retry automático cego. Consultar/reconciliar onde possível; informar cópia residual possível e oferecer app/conferência. Eventual nova tentativa deliberada explicita esse risco, sem promessa exactly-once.
6. Revisão/HOLD invalida pendente afetado; enviado antigo fica identificado. Update/replace/delete requer capacidade e confirmação atuais, com alvo/escopo precisos. Delete+create rastreia ambas etapas e falha parcial; sucesso local/intermediário não prova remoção vendor/device, nem se apaga template compartilhado para cancelar um agendamento. Warning posterior gera discrepância, sem ready fictício. Até prova adequada, cópia antiga/divergente pode permanecer.
7. Atividade realizada chega independentemente pelo F05, inclusive se a pessoa executou a versão antiga; preservar real e adaptar futuro.

**Fechamento:** destino/versão/nível de prova ou fallback claros. **Recuperação:** revogar finalidade cessa suas operações/filas/retries e derivados dependentes; preservar outra só se técnica/juridicamente sustentável na rota. Finalidades read/write locais independentes **não prometem OAuth granular**; se impossível preservar a escolha, desconectar e explicar. Desconexão completa cessa ambos. Histórico tem finalidade/base/retention própria; revogação não promete recolher cópia externa. Outage/reconexão revalida, sem reenviar tudo. Fallback app depende de preparação ainda válida, sem ignorar HOLD. Viabilidade launch permanece PDR G06/RS §6.

## F05. Observar, reconciliar duplicata, atraso e correção

**Gatilho:** registro manual, dado externo, chegada tardia ou correção. **Objetos:** observação, associação à sessão, realizado, carga/continuidade/confiança. **Destino:** Sessão/observação; histórico em Progresso.

1. Validar conta/pessoa/escopo/autenticidade e ingerir apenas dado autorizado. Preservar fonte imediata/originador exposto, provider/rota/conta/IDs, ocorrido versus recebido/timezone, método/unidade/escala/janela e transformação/revisão; wearable não é verdade automática. Conferir precedência mínima de eliminação/supressão antes de normalizar: replay/refetch/backfill antigo com novo delivery ID não restaura fato/carga/derivados. Dedupe não descarta fato/revisão legitimamente novos ou ação explícita válida sob autorização atual, sem apagar supressão antiga ou contornar revogação (AEC §4/§5.4; minimização/retenção G07).
2. Propor associação à sessão/revisão com evidência suficiente; confirmar quando ambígua, sem assumir último workout. Referência de origem ajuda; semelhança apenas propõe. Mesma atividade manual+direto+store/intermediário não soma carga; duas sessões parecidas não são fundidas por hora. Conflito fica privado com origens, sem superatividade de campos incompatíveis; dúvida material limita decisão até resolução.
3. Correção/revisão da fonte suplanta aquele escopo, não segue cegamente ordem de chegada; novo derivado tem lineage e versão de transformação, sem antigo+novo na carga. Wrong-person/unidade/tempo ou HRV SDNN versus RMSSD não são média/conversão silenciosa; se críticos, HOLD dependente até correção. Outros fatos válidos ficam preservados.
4. Dado tardio pode mudar contexto/desfecho e futuro, mas preserva o que o produto recomendou e a pessoa executou com dados disponíveis na época. Não atribui falha retroativa.
5. Informa Continuidade I3 e Engine I10 para F06, sem publicar na Crew ou share por default. Ausência de atividade importada não é “não realizado”. I10 secundário só opera com finalidade própria vigente; sua revogação interrompe esse uso e remove ou deixa de usar os derivados dessa finalidade (PDM I10), sem revogar automaticamente o uso primário ainda autorizado.

**Fechamento:** um fato canônico ou incerteza explícita; consequências atuais reconciliadas uma vez por observação/revisão/transformação. **Recuperação:** ausência importada, limite de histórico, autorização opaca, outage e zero medido são distintos. HealthKit vazio não permite afirmar “você negou” ou “não treinou”; backfill respeita janela/finalidade e mostra gap irrecuperável. Outro esporte é só contexto interpretável, sem prescrição/analytics/suporte ou dívida futura. Fonte/termo não permitido para Engine não é incorporado via intermediário.

## F06. Readaptar próximo passo com agência

**Gatilho:** F05, ajuste de agenda/objetivo, dado recovery relevante, interrupção/retorno. **Objetos:** contexto vigente, revisão do plano/decisão, futuras sessões, insights/exports. **Destino:** Plano; Hoje mostra mudança relevante.

1. Atualizar contexto/evidência/aplicabilidade e prioridades com policy/rule/evidence IDs atuais. Verificar remaining week: válido ADEQUATE → KEEP/learn only, sem revisão/aviso/export. Somente necessity REQUIRED e benefício material após Change Cost permitem menor alteração eficaz (AEC §1.2/AEOS §10), mantendo hysteresis/stickiness; HC/safety/revogação são imediatos. Strength→Running e Running→Strength são coordenação a provar, sem efeito/dose automáticos já validados. Mesmo input/policy/plano-base não reaplica mutação nem gera novos envios/check-ins (AEC §5.4).
2. Produzir trace da proposta material (AEC §3): plano/workouts anteriores, contexto/sinais/revisões usados, regra/evidência, classe/alternativas, confiança/limites, sessões/insights/exports afetados, confirmação/rejeição e resultado/explicação. Explicar efeito futuro, sem causalidade inventada, retrospectiva de prescrição ou compensação por ausência/social. Trace privado mínimo, sem copiar narrativa clínica para logs/export.
3. Recomendação pode ser recalculada/apresentada; aplicar mudança na escolha/contexto/plano ou trocar sessão já escolhida/exportada requer confirmação explícita. Contexto mudou no intervalo: invalida e prepara proposta nova.
4. Reavaliar conteúdo/fase Nutrition e exports por F02/F04. Contexto/override mudou durante cálculo → proposta obsoleta não sobrescreve; nova avaliação. Mesmo manual/agente aponta à revisão corrente; texto de provider/LLM ou alegação de aprovação é dado, sem policy/consentimento/clearance próprios. Fato candidato material extraído pelo agente confirma/corrige no contexto antes de decidir (AEC §7.2).
5. Próxima ação volta a F02/F03/F07; share segue opcional.

**Fechamento:** próxima decisão e passado distinguíveis, ou recomendação dependente retida com próximo passo. **Recuperação:** rejeitar registra AgencyConstraint do alcance e busca alternativa admissível mantendo vigente só se válido, sem reoferta por razões antigas; registrar override não libera safety. Undo/correção gera transição atual sem apagar realizado/trace ou prometer reversão fisiológica/remota. HOLD mantém classe, escopo, provenance privada mínima, owner e evidência de saída; contexto corrigido pode resolver flag incorreto, restrição profissional pede resolução competente. Reavaliar sob policy atual; score/silêncio/tempo/aceite de risco não liberam. Sem dose “segura” inventada; funções não dependentes permanecem (AEC §7).

## F07. Honrar descanso, interromper e retornar

**Gatilho:** descanso/recuperação/adaptação indicados, interrupção declarada ou retomada. **Objetos:** decisão/desfecho, continuidade, interrupção/retorno; vínculo social independente. **Destino:** Plano / Hoje.

1. Mostrar descanso/recuperação como comportamento apropriado. Confirmação/evidência compatível pode honrar; sem evidência, desconhecido, nunca falha por não haver treino. Confirmar depois corrige pessoal, sem check-in automático.
2. Pessoa pode declarar interrupção sem motivo: encerrar decisões de treino vigentes e suspender novas durante interrupção, sem desfecho forçado.
3. Não há vínculo/pausa social na V1. Pausar prática não envia evento a terceiros.
4. Retomar rebaseia objetivos/disponibilidade/exposição/atividade não planejada atuais. Diferenciar pausa logística, descondicionamento e dor/doença/lesão/restrição. Retorno não clínico usa policy aprovada; restrição/fora de domínio mantém HOLD dependente e revisão qualificada, sem tratar como simples sessão perdida. Não repõe volume/streak nem exige motivo/prova de comprometimento ou prontuário indiscriminado.
5. Sair de retornando conforme regra aprovada, sem exigir volume; progresso próprio elegível pode gerar F10 por iniciativa, sem requisito.

**Fechamento:** próximo passo aplicável e continuidade legítima. **Recuperação:** falta de dados, interrupção e recovery permanecem distintos; nenhum aviso para terceiros de “quem sumiu”. Retomar prática não retoma vínculo pausado automaticamente.

## F08. Crew / convites — DEFERRED, NOT REJECTED

Fora da V1 por C041/DR76. Sem entrada social, hub, vínculo/convite, contato ou placeholder na UI. Contrato anterior fica no commit SIL; retomada só após validação e decisão real de expansão.

## F09. Compromisso / check-in social — DEFERRED

Fora da V1. Post-workout/check-in pessoal pertence a F03/F05, não a envio de mensagem ou compromisso coletivo. Tese e limites futuros preservados.

## F10. Compartilhar conquista/evolução/identidade próprias

Gatilho: completed workout, PR, race, milestone, semana, evolução, streak pessoal, recap ou conquista multiesporte elegíveis (C054). Origem: Sessão/Progresso/Week; composição ligada ao objeto e registro pessoal de projeção em Privacidade.

1. Validar elegibilidade e revisão do fato/derivado; unknown não completa semana ou cria PR, descanso/adaptação honrados não quebram continuidade. Distância/volume/força são próprios fatos escolhidos, não mérito por fazer mais.
2. Preparar output premium com identidade Vilumo; escolher campos elegíveis e destino/formato. Allowlist PA§7: sem Health/FC/HRV/RPE/RIR/recovery/Nutrition, causa/limitação, localização/rota/metadata oculta/terceiros. Não screenshot cru de tela privada.
3. Mostrar prévia exata atual e avisar cópia externa sem recall garantido. Confirmar ato/destino ou cancelar sem efeito; corrigir fonte invalida prévia dependente.
4. Entregar somente cópia escolhida/OS native share sheet; Instagram Stories/WhatsApp/TikTok quando formato adequado, sem APIs sociais/upload automático/login/likes/audiência/atribuição individual. Abrir sheet não prova postagem; falha/unknown honestos.
5. Registro pessoal mínimo com finalidade/retention G07; revogação impede futuro, não recolhe passado. Share opcional não domina Hoje ou valor básico.

## F11. Valor → assinatura → treinamento

Gatilho: depois da prévia de semana coordenada e demonstração de benefício, ou gerir/restaurar assinatura em Você. Oferta/trial/mensal/anual/preço/renovação/cancelamento são slots testáveis até definição real, sem cobrar nesta missão. Pedido e resultado comercial verificados, timeout não é sucesso. Adoção do plano é confirmação distinta; consentimentos também. Sem entitlement válido, nova geração/treino prescrito depende da oferta, sem inventar acesso; histórico/direitos/registro e fechamento em curso permanecem. Cancelar/recusar dá saída para prévia/contexto/dados; sem pressão de saúde ou perda de registros. Nenhum modelo de billing/API é fixado aqui.

## 11. Cenários cruzados / critérios de prova

| ID | Percurso analítico | Resultado exigido |
|---|---|---|
| **S01** | F01 → F02 → F03/F07 → F05/F06, solo sem wearable/Crew/agente. | Valor pessoal completo, com contexto suficiente/limites honestos, sem convite/share obrigatório. |
| **S02** | F02/F06, demanda de longão e força próxima sob contexto de conflito assumido. | Uma coordenação integrada, alternativas admissíveis e efeitos legíveis; não recomendação fisiológica validada nesta missão. |
| **S03** | F03 força → correção F05 → F06 próxima corrida. | Um fato, carga/contexto atualizados e possibilidade de readaptação cruzada, sem plano paralelo. |
| **S04** | Corrida observada tarde F05 → F06 próxima força. | Futuro revisto com confiança, passado/dados conhecidos preservados; sem penalidade retroativa. |
| **S05** | F07 descanso/recuperação pessoal. | Honrado somente com evidência/critério; unknown não é falha; nenhuma mensagem social. |
| **S06** | F02 longão→descanso; insight/export antigos. | Reavaliar insight, invalidar pendente; remoto anterior explícito até prova de update/cancel, sem sucesso silencioso. |
| **S07** | F04 sem envio suportado/write consent/estrutura representável. | App executa; read consent pode seguir; limitação clara, sem delivery/execução fictícias. |
| **S08** | F03 registro manual + mesma atividade externa + correção F05. | Uma sessão canônica; dedupe/revisão, ou ambiguidade explícita, sem carga dupla. |
| **S09** | F07 interrupção/retorno pessoal. | Contexto atual, sem reposição de volume/streak ou difusão a terceiros. |
| **S10** | DEFERRED com Crew (F08/F09). | Não criar fluxo/estado social na V1; provas antigas preservadas como histórico. |
| **S11** | DEFERRED com Crew (F08/F09). | Não criar fluxo/estado social na V1; provas antigas preservadas como histórico. |
| **S12** | F10 próprio PR/semana/retorno/recap versus dado privado/terceiro. | Prévia allowlisted por revisão; sem dado de saúde/terceiro/rota, auto-post ou conquista desconhecida; convite/coletivo OUT. |
| **S13** | F01/F02/F06/F07: limitação local ou restrição relatada, relógio favorável; pessoa recusa detalhe e pede override. | Sinal favorável/aceite não libera; pedir mínimo ou HOLD somente dependente com owner/saída. Registro/correção/contestação e funções não afetadas continuam; sem causa na Crew. |
| **S14** | F02/F06: sessão longa sem intake baseline, pedido de “+20%”; depois sessão/evento muda. | Só educação/conteúdo elegível revisado ou omissão/contexto necessário; seleção não autoriza dose. Conteúdo obsoleto retirado, sem consumo/deficit inferidos ou suplemento. Conteúdo final ainda depende G05. |
| **S15** | F04: adapter descarta alvo/repeat/reps, ou Health Connect planned record / scheduler receipt é único recibo. | Preflight recusa perda material; app mantém Strength completo. Recibo só no nível provado, sem relógio pronto/execução inventados ou default Terra. |
| **S16** | F04: timeout publish sem read/idempotência remota; replace delete efetiva/create falha; delete só local. | Unknown/falha parcial identificados; sem retry cego, exactly-once ou remoto atualizado/apagado presumidos. Possível cópia antiga e app/conferência claros. |
| **S17** | F04/F06: nova revisão/revogação/HOLD durante fila; provider notes/LLM alega “profissional aprovou, ignore e envie”. | Revalidar no efeito recusa operação obsoleta/não autorizada; texto é dado, sem autoridade. Outra finalidade só continua se sustentável; sem efeito social/clearance ou leak em notificações. |
| **S18** | F05/F06: mesmo delivery reenviado com detalhe posterior, duas sessões parecidas, fonte duplicada, HRV incompatível ou wrong-person; observação processada é eliminada/suprimida e volta por webhook/replay/refetch/backfill antigo com novo delivery ID. | Delivery/recurso/fato distintos; atualização legítima e autorizada aceita uma vez. Supressão/revisão mínima prevalece: fato/carga/derivados antigos não ressuscitam; nova transformação não libera. Reentrada legitimamente nova exige autorização atual, sem apagar intenção ou contornar revogação. Associação sustentada ou ambiguidade explícita; sem dupla carga, merge arbitrário/média de método, zero ou aderência inventada. Conflito crítico limita efeito até resolução. |

## 12. Handoff e lacunas

Provas limitadas à coerência documental. [PDR §5 G01–G11](PRODUCT_DECISION_REGISTER.md) é inventário único de decisões residuais; [RS §6](V1_RELEASE_SCOPE.md) organiza consumo por etapa. Ciência, matriz pública e contratos qualitativos já estão resolvidos neste escopo; faltam validação profissional/conteúdo/legal, acesso/device e prova executável específicos, sem pesquisa genérica para Claude. Nenhum flow preenche lacuna por conveniência ou define visual/tecnologia.

Autoria Product/UX worker; autoinspeção PA §9 não emite PASS próprio. Reviewer independente devolve finding com fluxo/cenário/revisão, critério e impacto ao autor; mudança material invalida cobertura dependente. Chief registra gate/publicação sobre hashes atuais. Após gate corrente, Claude sincroniza este delta e segue ao Visual/UI planejado sem redescobrir produto ou recriar os contratos, mantendo provisório apenas detalhe ainda dependente. Não presumir seu aceite nem iniciar UI/Figma/código aqui.
