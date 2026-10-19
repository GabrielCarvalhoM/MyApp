# Vilumo Fit — Core Flows

**Estado:** SPECIFICATION — amendment pré-UX; publicação/gates no índice.

| Campo | Valor |
|---|---|
| Revisão | **CF-1.1** · 2026-10-15 |
| Autoria | Product/UX Architect, worker |
| Autoridade / inputs | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [PDM-1.1](PRODUCT_DOMAIN_MODEL.md), [PA-1.1](PRODUCT_ARCHITECTURE.md), [RS-1.1](V1_RELEASE_SCOPE.md), [AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md), [EM-1.1](EXPERIENCE_MODEL.md). |
| Necessidade / consumidor | Percursos de comportamento que provam scope e estrutura, consumidos por review e futura UX Spec. Sem layout, Figma, algoritmo ou código. Gate/publicação no [índice](../canon/CANONICAL_INDEX.md). |

Cada fluxo declara gatilho, objetos, passos, fechamento e recuperação. “Confirmar” significa ação da pessoa sobre alcance/versão identificados, não confirmação universal de todo toque. S01–S18 são **provas analíticas/documentais**, não testes executáveis, de uso ou safety/eficácia. Amendment PREUX-20261015-r1 consome AEC-1.1 e apoio [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md) TR/NUT, [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md) SAFE e [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md) CTRL-001–013; os packs não substituem autoridade do AEC ou o registro único PDR §5.

## F01. Entrar e obter valor solo

**Gatilho:** pessoa instala/abre o app sem Crew. **Objetos:** Pessoa, modo M1, Athlete Context, consentimentos e primeira decisão/plano. **Destino:** primeira entrada → Hoje / Plano.

1. Verificar elegibilidade 18+ antes de criar identidade; método e minimização serão definidos por Engineering/Security. Não guardar perfil de quem não passa além do que a política estritamente exigir; terceiros não recebem motivo.
2. Oferecer caminho de experiência pessoal ou participação leve; seguir solo não depende de Crew, wearable, agente ou share.
3. Obter contexto pertinente à decisão Running × Strength: objetivo primário/secundário/prioridade, experiência/prática recente, disponibilidade/equipamento e apenas os sinais necessários pela policy validada. Prioridade decisiva desconhecida pede esclarecimento; first-class não é dose igual. Fontes sensíveis têm finalidade própria; sem diário Nutrition ou intake clínico para educação.
4. Motor integra contexto e explicita confiança **para a decisão**, aplicabilidade e limitações. Ausência opcional não é incompletude; recusa de dado crítico é desconhecido, não saúde confirmada. Pedir mínimo contexto ou reter só prescrição/efeito dependente por AEC §7; registro/direitos e funções não afetadas continuam.
5. Mostrar o previsto e próxima ação em Hoje, com plano/detalhe acessíveis por referência estável. Executar, descansar ou completar contexto conforme decisão.

**Fechamento:** pessoa entende próximo passo e encontra caminhos diretos. **Recuperação:** contexto insuficiente mantém limite e contexto editável; Crew/integração recusadas não aparecem como “produto incompleto”. Sem obrigação de completar todos os dados antes de qualquer valor.

## F02. Decidir e preparar corrida/força integradas

**Gatilho:** primeira decisão, mudança de contexto ou próxima janela. **Objetos:** contexto, decisão/plano/revisão, sessão e insight. **Destino:** Plano → decisão / Sessão; Hoje é entrada.

1. Ler inputs/revisões com fonte, timing, escala/método, cobertura e confiança por decisão. Separar relato local/efeito funcional, recuperação geral e sinais de relógio; um score favorável não anula restrição/limitação. Sem converter RPE/RIR/HRV em readiness universal (AEC §2).
2. Coordenar ambas modalidades e prioridade declarada; propor manter/mover/reduzir volume/reduzir intensidade/substituir/recuperar/descansar/pedir contexto/replan/return somente sob policy aplicável. Mostrar efeitos e trade-off; sem espaçamento/dose/default universal. HOLD retém a recomendação dependente e indica alcance, owner/próximo passo privado, sem diagnóstico (AEC §7).
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
5. Reconciliar fatos manuais/externos em F05 e readaptar futuro em F06. Progresso pessoal existe sem share/check-in.

**Fechamento:** realizado preservado, versão executada rastreável, próximo passo acessível. **Recuperação:** erro/reconnect não duplica atividade ou carga; correção de série altera observação em seu escopo, não apaga outro registro. Repetir sessão histórica cria nova sessão sob contexto atual.

## F04. Enviar structured workout e manter estado honesto

**Gatilho:** pessoa escolhe enviar sessão/revisão ao destino wearable. **Objetos:** conexão/capabilities, permissão de envio, sessão/revisão e export. **Destino:** Sessão → envio; conexão em Você → Integrações.

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

1. Validar conta/pessoa/escopo/autenticidade e ingerir apenas dado autorizado. Preservar fonte imediata/originador exposto, provider/rota/conta/IDs, ocorrido versus recebido/timezone, método/unidade/escala/janela e transformação/revisão; wearable não é verdade automática. Dedupe de delivery não descarta correção legítima do recurso (AEC §5.4).
2. Propor associação à sessão/revisão com evidência suficiente; confirmar quando ambígua, sem assumir último workout. Referência de origem ajuda; semelhança apenas propõe. Mesma atividade manual+direto+store/intermediário não soma carga; duas sessões parecidas não são fundidas por hora. Conflito fica privado com origens, sem superatividade de campos incompatíveis; dúvida material limita decisão até resolução.
3. Correção/revisão da fonte suplanta aquele escopo, não segue cegamente ordem de chegada; novo derivado tem lineage e versão de transformação, sem antigo+novo na carga. Wrong-person/unidade/tempo ou HRV SDNN versus RMSSD não são média/conversão silenciosa; se críticos, HOLD dependente até correção. Outros fatos válidos ficam preservados.
4. Dado tardio pode mudar contexto/desfecho e futuro, mas preserva o que o produto recomendou e a pessoa executou com dados disponíveis na época. Não atribui falha retroativa.
5. Informa Continuidade I3 e Engine I10 para F06, sem publicar na Crew ou share por default. Ausência de atividade importada não é “não realizado”. I10 secundário só opera com finalidade própria vigente; sua revogação interrompe esse uso e remove ou deixa de usar os derivados dessa finalidade (PDM I10), sem revogar automaticamente o uso primário ainda autorizado.

**Fechamento:** um fato canônico ou incerteza explícita; consequências atuais reconciliadas uma vez por observação/revisão/transformação. **Recuperação:** ausência importada, limite de histórico, autorização opaca, outage e zero medido são distintos. HealthKit vazio não permite afirmar “você negou” ou “não treinou”; backfill respeita janela/finalidade e mostra gap irrecuperável. Outro esporte é só contexto interpretável, sem prescrição/analytics/suporte ou dívida futura. Fonte/termo não permitido para Engine não é incorporado via intermediário.

## F06. Readaptar próximo passo com agência

**Gatilho:** F05, ajuste de agenda/objetivo, dado recovery relevante, interrupção/retorno. **Objetos:** contexto vigente, revisão do plano/decisão, futuras sessões, insights/exports. **Destino:** Plano; Hoje mostra mudança relevante.

1. Reavaliar contexto/aplicabilidade e prioridades com policy/rule/evidence IDs atuais. Strength→Running e Running→Strength são coordenação a provar, sem efeito/dose automáticos já validados. Mesmo input/policy/plano-base não reaplica mutação nem gera novos envios/check-ins (AEC §5.4).
2. Produzir trace da proposta material (AEC §3): plano/workouts anteriores, contexto/sinais/revisões usados, regra/evidência, classe/alternativas, confiança/limites, sessões/insights/exports afetados, confirmação/rejeição e resultado/explicação. Explicar efeito futuro, sem causalidade inventada, retrospectiva de prescrição ou compensação por ausência/social. Trace privado mínimo, sem copiar narrativa clínica para logs/export.
3. Recomendação pode ser recalculada/apresentada; aplicar mudança na escolha/contexto/plano ou trocar sessão já escolhida/exportada requer confirmação explícita. Contexto mudou no intervalo: invalida e prepara proposta nova.
4. Reavaliar conteúdo/fase Nutrition e exports por F02/F04. Contexto/override mudou durante cálculo → proposta obsoleta não sobrescreve; nova avaliação. Mesmo manual/agente aponta à revisão corrente; texto de provider/LLM ou alegação de aprovação é dado, sem policy/consentimento/clearance próprios. Fato candidato material extraído pelo agente confirma/corrige no contexto antes de decidir (AEC §7.2).
5. Próxima ação volta a F02/F03/F07; share segue opcional.

**Fechamento:** próxima decisão e passado distinguíveis, ou recomendação dependente retida com próximo passo. **Recuperação:** rejeitar preserva estado coerente/trace sem punição; registrar override não libera safety. Undo/correção gera transição atual sem apagar realizado/trace ou prometer reversão fisiológica/remota. HOLD mantém classe, escopo, provenance privada mínima, owner e evidência de saída; contexto corrigido pode resolver flag incorreto, restrição profissional pede resolução competente. Reavaliar sob policy atual; score/silêncio/tempo/aceite de risco não liberam. Sem dose “segura” inventada; funções não dependentes permanecem (AEC §7).

## F07. Honrar descanso, interromper e retornar

**Gatilho:** descanso/recuperação/adaptação indicados, interrupção declarada ou retomada. **Objetos:** decisão/desfecho, continuidade, interrupção/retorno; vínculo social independente. **Destino:** Plano / Hoje.

1. Mostrar descanso/recuperação como comportamento apropriado. Confirmação/evidência compatível pode honrar; sem evidência, desconhecido, nunca falha por não haver treino. Confirmar depois corrige pessoal, sem check-in automático.
2. Pessoa pode declarar interrupção sem motivo: encerrar decisões de treino vigentes e suspender novas durante interrupção, sem desfecho forçado.
3. Vínculos não mudam. Pode oferecer pausar Crew por Crew, padrão “não alterar”; se escolhido, só estado neutro “Em pausa”, nunca motivo/horário/histórico.
4. Retomar rebaseia objetivos/disponibilidade/exposição/atividade não planejada atuais. Diferenciar pausa logística, descondicionamento e dor/doença/lesão/restrição. Retorno não clínico usa policy aprovada; restrição/fora de domínio mantém HOLD dependente e revisão qualificada, sem tratar como simples sessão perdida. Não repõe volume/streak nem exige motivo/prova de comprometimento ou prontuário indiscriminado.
5. Sair do estado retornando após primeira janela conforme modelo, sem condição de mais volume; M3 retoma por intenção/declaração leve. Pode escolher check-in de retorno F09 ou progresso próprio elegível F10, sem requisito.

**Fechamento:** próximo passo aplicável e continuidade legítima. **Recuperação:** falta de dados, interrupção e recovery permanecem distintos; nenhum aviso para terceiros de “quem sumiu”. Retomar prática não retoma vínculo pausado automaticamente.

## F08. Criar/entrar Crew por convite fechado

**Gatilho:** criar Crew ou receber nominal invite/link projetado. **Objetos:** pessoa, consentimento por Crew, convite/vínculo e estado da Crew. **Destino:** Crews / espaço da Crew.

1. Sem identidade, verificar 18+ e entrar como M3 com mínimo: nome de exibição e consentimento de finalidade/acesso; sem contexto do motor. Quem já usa motor preserva M1→M2 sem onboarding paralelo.
2. Criar é direito de qualquer modo dentro do teto; aplicar referência até 3 vínculos e cerca de 8 participantes por Crew. Criação segue o mesmo consentimento informado de finalidade/acesso do aceite de convite (passos 5–6); não efetiva vínculo/acesso antes dele. Convite pendente não é membro; Ativo/Pausado contam.
3. Convite é nominal, de um participante, com validade/revogação. Aceite direto exige comprovação do canal; encaminhado/projetado exige confirmação do convidante. Candidato confirma compartilhar só o nome mínimo necessário ao convidante para essa confirmação, sem acesso antecipado à Crew.
4. Antes de comprovação/confirmação, nenhuma Crew/membro/contexto interno é exposto. Convidante que saiu/removeu revoga seus pendentes. Sem confirmação, convite recusado/revogado/expirado, idade inelegível ou teto: nenhum acesso.
5. Depois de elegível/aprovado e com vaga, explicar categorias/alcance/audiência do consentimento: nome de exibição, participantes e estado neutro são categorias do futuro acesso. Explicitar inferência humana residual legítima em Crew de dois/vínculos sobrepostos, sem promessa de anonimato total ou função de correlação. Antes do vínculo, não mostrar roster/nomes/estados reais ou conteúdo interno; membership não autoriza desfecho público/share. Consentimento PT-BR/EN preserva escopo equivalente.
6. Aceitar o consentimento cria o vínculo autorizado; somente depois do vínculo Ativo mostrar os dados mínimos permitidos da Crew/participantes, sem mensagens/contribuições anteriores. Criador não ganha poder permanente especial; Crew de um fica Em formação e dois ou mais Ativa.

**Fechamento:** vínculo consentido ou nenhuma entrada. **Recuperação:** convidante vê só pendente/aceito/não aceito-expirado, sem causa sensível/limite/idade/bloqueio. Corridas de aceites respeitam capacidade; sem “entrou depois perdeu vaga”. Bloquear remetente e recusar não geram sinal público. Métodos/limites técnicos têm owners em RS §6.

## F09. Compromisso, check-in, apoio e saída Lite

**Gatilho:** propor/aderir a período, escolher check-in, receber apoio ou mudar vínculo. **Objetos:** compromisso, intenção/desfecho privados, check-in/apoio, consentimento/vínculo. **Destino:** espaço da Crew; ação própria pertinente em Hoje.

1. Propor período/compromisso leve de continuar fazendo o apropriado; cada um adere voluntariamente. Não define dose comum, plano ou volume. M3 usa intenção própria sem avaliação do motor.
2. Após desfecho/retorno/declaração elegíveis, pessoa pode enviar check-in mínimo para **uma Crew e um destinatário ativo escolhidos**. Mostrar alcance/consentimento e confirmar. Nada publica ao terminar sessão, pelo aceite da Crew ou para todas Crews. Descanso pode usar mesma mensagem, sem motivo.
3. Destinatário recebe privado; pode responder gesto estruturado. Sem chat/texto livre, visto por último, número de contribuições, fonte/verificação/modo ou lista de ausentes. Remetente/destinatário podem silenciar/retirar conforme finalidade/retenção.
4. Ao fim do período, compromisso conclui temporalmente e reconhece qualitativamente o período comum de apoio/cooperação, **sem afirmar que todos cumpriram** nem consultar/comparar quantos check-ins existem. Sem falha coletiva por ausência, pontos ou composição inferível.
5. Pausar vínculo interrompe novos check-ins/apoios daquela relação e mostra só “Em pausa”; sair/remover revoga acesso imediato e minimiza/elimina mensagens pessoais, sem afetar histórico solo. Pendentes emitidos são revogados. Com um restante, compromisso cancelado sem fracasso; último sai e Crew encerra.
6. Novo convite para reentrar; removido também exige confirmação de quem removeu se ainda participante. Remoção simétrica/controles de abuso dependem de qualificação Security/Engineering antes de implementar; não há poderes ocultos de criador.

**Fechamento:** continuidade/apoio privado, período encerrado ou vínculo encerrado sem exposição moral. **Recuperação:** revogação retira dados que seguem visíveis naquela finalidade; nenhuma outra Crew vê vínculo/mensagem/limite. Retenção operacional não vira Crew Memory.

## F10. Compartilhar progresso próprio ou convite

**Gatilho:** ação em próprio marco/resultado elegível ou convite. **Objetos:** projeção permitida, shareable, prévia/projeção. **Destino:** composição ligada à origem; registro em Você → Privacidade.

1. Escolher objeto elegível. V1 oferece próprio progresso/retorno/adaptação/descanso apropriados e convite; não objeto coletivo externo. Nenhum dado de outro membro ou Crew, contexto Nutrition, sinais/contexto privados Health/Recovery, motivo ou rota. Desfecho genérico próprio de descanso/adaptação pode ser escolhido voluntariamente, sem sinal íntimo, causa ou inferência sobre terceiro.
2. Preparar expressão sem volume como mérito, selecionar inclusão/destino permitidos e mostrar prévia exata; não screenshot do contexto interno ou link vivo a dados pessoais.
3. Explicar cópia externa sem recolhimento garantido; confirmar explicitamente ou cancelar sem perda. Cancelar/recusar share não altera valor, adequação ou membership.
4. Projetar cópia estática só dos dados vistos, sem metadados extras sensíveis, rastrear audiência/atribuição individual ou importar likes/alcance. Convite é link de ingresso opaco, sem dados da Crew; aceite encaminhado/projetado continua F08 com confirmação.
5. Registro pessoal permite impedir projeções futuras; cópias já enviadas ficam fora do controle. Share coletivo externo segue diferido até scope/consentimento/prova de inferência próprios.

**Fechamento:** objeto voluntariamente projetado ou origem intacta. **Recuperação:** erro nunca vira sucesso; repetir não cria publicação oculta. Nenhuma expressão promete que outro membro treinou por estar na Crew.

## 11. Cenários cruzados / critérios de prova

| ID | Percurso analítico | Resultado exigido |
|---|---|---|
| **S01** | F01 → F02 → F03/F07 → F05/F06, solo sem wearable/Crew/agente. | Valor pessoal completo, com contexto suficiente/limites honestos, sem convite/share obrigatório. |
| **S02** | F02/F06, demanda de longão e força próxima sob contexto de conflito assumido. | Uma coordenação integrada, alternativas admissíveis e efeitos legíveis; não recomendação fisiológica validada nesta missão. |
| **S03** | F03 força → correção F05 → F06 próxima corrida. | Um fato, carga/contexto atualizados e possibilidade de readaptação cruzada, sem plano paralelo. |
| **S04** | Corrida observada tarde F05 → F06 próxima força. | Futuro revisto com confiança, passado/dados conhecidos preservados; sem penalidade retroativa. |
| **S05** | F07 descanso com compromisso F09. | Confirmação compatível → honrado; sem dado → desconhecido; check-in voluntário sem motivo; nenhum fracasso/ausência pública. |
| **S06** | F02 longão→descanso; insight/export antigos. | Reavaliar insight, invalidar pendente; remoto anterior explícito até prova de update/cancel, sem sucesso silencioso. |
| **S07** | F04 sem envio suportado/write consent/estrutura representável. | App executa; read consent pode seguir; limitação clara, sem delivery/execução fictícias. |
| **S08** | F03 registro manual + mesma atividade externa + correção F05. | Uma sessão canônica; dedupe/revisão, ou ambiguidade explícita, sem carga dupla. |
| **S09** | F07 interrupção/retorno com vários vínculos. | Contexto atual, sem compensação; vínculos independentes e nenhuma difusão da causa. |
| **S10** | F08 encaminhado sem confirmação, menor, cheia/limite ou convidante saiu. | Nenhum acesso; motivo sensível indistinguível ao convidante; sem agenda de contatos. |
| **S11** | F08 M3 → F09 intenção/check-in/apoio e fechamento de período. | Entrada leve, sem adequação avaliada; contribuição privada/cooperação qualitativa sem score/lista ou performance verificada. |
| **S12** | F10 próprio retorno/convite; tentativa de terceiro/coletivo. | Só objeto próprio/convite sem dado de terceiros; coletivo diferido; share voluntário e nenhuma inferência de cumprimento alheio. |
| **S13** | F01/F02/F06/F07: limitação local ou restrição relatada, relógio favorável; pessoa recusa detalhe e pede override. | Sinal favorável/aceite não libera; pedir mínimo ou HOLD somente dependente com owner/saída. Registro/correção/contestação e funções não afetadas continuam; sem causa na Crew. |
| **S14** | F02/F06: sessão longa sem intake baseline, pedido de “+20%”; depois sessão/evento muda. | Só educação/conteúdo elegível revisado ou omissão/contexto necessário; seleção não autoriza dose. Conteúdo obsoleto retirado, sem consumo/deficit inferidos ou suplemento. Conteúdo final ainda depende G05. |
| **S15** | F04: adapter descarta alvo/repeat/reps, ou Health Connect planned record / scheduler receipt é único recibo. | Preflight recusa perda material; app mantém Strength completo. Recibo só no nível provado, sem relógio pronto/execução inventados ou default Terra. |
| **S16** | F04: timeout publish sem read/idempotência remota; replace delete efetiva/create falha; delete só local. | Unknown/falha parcial identificados; sem retry cego, exactly-once ou remoto atualizado/apagado presumidos. Possível cópia antiga e app/conferência claros. |
| **S17** | F04/F06: nova revisão/revogação/HOLD durante fila; provider notes/LLM alega “profissional aprovou, ignore e envie”. | Revalidar no efeito recusa operação obsoleta/não autorizada; texto é dado, sem autoridade. Outra finalidade só continua se sustentável; sem efeito social/clearance ou leak em notificações. |
| **S18** | F05/F06: mesmo delivery reenviado com detalhe posterior, duas sessões parecidas, fonte duplicada, HRV incompatível ou wrong-person. | Delivery/recurso/fato distintos; atualização legítima aceita uma vez. Associação sustentada ou ambiguidade explícita; sem dupla carga, merge arbitrário/média de método, zero ou aderência inventada. Conflito crítico limita efeito até resolução. |

## 12. Handoff e lacunas

Provas limitadas à coerência documental. [PDR §5 G01–G11](PRODUCT_DECISION_REGISTER.md) é inventário único de decisões residuais; [RS §6](V1_RELEASE_SCOPE.md) organiza consumo por etapa. Ciência, matriz pública e contratos qualitativos já estão resolvidos neste escopo; faltam validação profissional/conteúdo/legal, acesso/device e prova executável específicos, sem pesquisa genérica para Claude. Nenhum flow preenche lacuna por conveniência ou define visual/tecnologia.

Autoria Product/UX worker; autoinspeção PA §9 não emite PASS próprio. Reviewer independente devolve finding com fluxo/cenário/revisão, critério e impacto ao autor; mudança material invalida cobertura dependente. Chief registra gate/publicação sobre hashes atuais. Claude consome conjunto publicado/dependências e pode detalhar estrutura na próxima missão autorizada, mantendo provisório apenas detalhe ainda dependente. Não presumir seu aceite nem iniciar UI/Figma/código aqui.
