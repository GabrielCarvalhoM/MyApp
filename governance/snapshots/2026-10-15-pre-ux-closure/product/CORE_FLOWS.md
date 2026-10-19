# Vilumo Fit — Core Flows

**Estado:** SPECIFICATION — revisão documental aprovada.

| Campo | Valor |
|---|---|
| Revisão | **CF-1.0** · 2026-10-14 |
| Autoria | Product/UX Architect, worker |
| Autoridade / inputs | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [PDM-1.0](PRODUCT_DOMAIN_MODEL.md), [PA-1.0](PRODUCT_ARCHITECTURE.md), [RS-1.0](V1_RELEASE_SCOPE.md), [AEC-1.0](ADAPTIVE_ENGINE_CONTRACT.md), [EM-1.0](EXPERIENCE_MODEL.md). |
| Necessidade / consumidor | Percursos de comportamento que provam scope e estrutura, consumidos por review e futura UX Spec. Sem layout, Figma, algoritmo ou código. Gate/publicação no [índice](../canon/CANONICAL_INDEX.md). |

Cada fluxo declara gatilho, objetos, passos, fechamento e recuperação. “Confirmar” significa ação da pessoa sobre alcance/versão identificados, não confirmação universal de todo toque. As provas S01–S12 são **analíticas/documentais**, não testes executáveis, usability test ou prova de segurança/eficácia.

## F01. Entrar e obter valor solo

**Gatilho:** pessoa instala/abre o app sem Crew. **Objetos:** Pessoa, modo M1, Athlete Context, consentimentos e primeira decisão/plano. **Destino:** primeira entrada → Hoje / Plano.

1. Verificar elegibilidade 18+ antes de criar identidade; método e minimização serão definidos por Engineering/Security. Não guardar perfil de quem não passa além do que a política estritamente exigir; terceiros não recebem motivo.
2. Oferecer caminho de experiência pessoal ou participação leve; seguir solo não depende de Crew, wearable, agente ou share.
3. Obter contexto pertinente a Running × Strength: práticas, objetivos/prioridades, experiência, disponibilidade/equipamento e somente dados exigidos pela policy validada para aquela decisão. Fontes/sinais sensíveis têm finalidade/consentimento próprios; não pedir Nutrition como diário.
4. Motor integra contexto, explicita confiança e limitações. Dados opcionais ausentes não fingem precisão; dados necessários à segurança podem limitar prescrição até contexto suficiente, com motivo claro.
5. Mostrar o previsto e próxima ação em Hoje, com plano/detalhe acessíveis por referência estável. Executar, descansar ou completar contexto conforme decisão.

**Fechamento:** pessoa entende próximo passo e encontra caminhos diretos. **Recuperação:** contexto insuficiente mantém limite e contexto editável; Crew/integração recusadas não aparecem como “produto incompleto”. Sem obrigação de completar todos os dados antes de qualquer valor.

## F02. Decidir e preparar corrida/força integradas

**Gatilho:** primeira decisão, mudança de contexto ou próxima janela. **Objetos:** contexto, decisão/plano/revisão, sessão e insight. **Destino:** Plano → decisão / Sessão; Hoje é entrada.

1. Ler inputs vigentes com confidence. Running/Strength entregam representações específicas; Engine coordena ambas no contexto da pessoa, sem justapor planos independentes.
2. Mostrar comportamento apropriado e mudança relevante, explicação acessível e alternativas somente admissíveis sob política/objetivos/agenda.
3. Preparar estrutura da sessão e requisitos em escopo. Nutrition Insight existe somente pela demanda identificada; mostra vínculo e limites, sem dose fabricada ou logging obrigatório.
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

1. Verificar capacidades da integração, conta/dispositivo e tipo/estrutura do workout. Ingestão autorizada não autoriza escrita; pedir finalidade própria de envio se necessária.
2. Mostrar destino, versão e diferenças/limites de representação. Se estrutura não for crível, não degradar silenciosamente: executar no app; ingestão pode continuar independente.
3. Ação explícita prepara/envia aquela versão. Enquanto pendente/indisponível, mostrar que não há prova de disponibilidade no relógio.
4. Transporte aceito é “enviada”; só evidência adequada permite “confirmada”, com o limite do que o provedor confirma. Nenhum desses estados diz “executada”.
5. Timeout após possível entrega é resultado desconhecido; reconciliar antes de retry quando possível, evitando duplicata. Sem certeza, informar possibilidade de cópia remota e oferecer app.
6. Revisão do plano/sessão invalida pendente antigo. Enviado antigo fica marcado; preparar substituição/cancelamento somente se suportado e confirmado pela pessoa. Até prova remota, a cópia antiga pode permanecer.
7. Atividade realizada chega independentemente pelo F05, inclusive se a pessoa executou a versão antiga; preservar real e adaptar futuro.

**Fechamento:** destino/versão/status comprovado ou fallback claros. **Recuperação:** desconexão completa interrompe ingestão e envio daquela conexão; revogar somente leitura ou envio interrompe apenas operações/pendências da finalidade afetada, preservando autorizações independentes válidas. Revogar envio com leitura ainda autorizada mantém a ingestão; numa conexão somente de envio, revogar envio encerra essa operação. Revogar leitura conserva somente envio com autorização e revisão correntes, sem permitir novos reads em fila/retry; numa conexão só de envio, revogar leitura não retira o write consent vigente. Nenhuma revogação promete apagar cópias externas. Sem suporte de envio, não bloquear execução pessoal nem ocultar limitação. Viabilidade launch é O016/RS §6.

## F05. Observar, reconciliar duplicata, atraso e correção

**Gatilho:** registro manual, dado externo, chegada tardia ou correção. **Objetos:** observação, associação à sessão, realizado, carga/continuidade/confiança. **Destino:** Sessão/observação; histórico em Progresso.

1. Ingerir somente escopo autorizado, guardando provenance e momentos de fato/recebimento. Wearable não é verdade automática.
2. Associar à sessão/revisão quando há base suficiente; reconhecer mesma atividade por caminhos distintos sem criar duas sessões/cargas. Ambiguidade permanece pendente ou não associada; pedir esclarecimento privado.
3. Dado corrigido suplanta sua versão no escopo; preserve trilha e não conte antigo+novo. Outros fatos válidos não são sobrescritos.
4. Dado tardio pode mudar contexto/desfecho e futuro, mas preserva o que o produto recomendou e a pessoa executou com dados disponíveis na época. Não atribui falha retroativa.
5. Informa Continuidade I3 e Engine I10 para F06, sem publicar na Crew ou share por default. Ausência de atividade importada não é “não realizado”. I10 secundário só opera com finalidade própria vigente; sua revogação interrompe esse uso e remove ou deixa de usar os derivados dessa finalidade (PDM I10), sem revogar automaticamente o uso primário ainda autorizado.

**Fechamento:** um fato canônico ou incerteza explícita; consequências atuais reconciliadas. **Recuperação:** conflito exige resolução, não seleção silenciosa. Outro esporte ingerido pode informar contexto honestamente, sem prescrição/analytics próprios, declaração de suporte ou dívida futura.

## F06. Readaptar próximo passo com agência

**Gatilho:** F05, ajuste de agenda/objetivo, dado recovery relevante, interrupção/retorno. **Objetos:** contexto vigente, revisão do plano/decisão, futuras sessões, insights/exports. **Destino:** Plano; Hoje mostra mudança relevante.

1. Reavaliar contexto integrado, conforme policy/evidência. Strength realizado/corrigido pode afetar próxima decisão Running, e Running observado pode afetar Strength; são capacidades a provar, não prescrição automática já validada.
2. Produzir revisão futura e explicar alcance: o que muda, por quê, confiança e limites. Não reescrever treino encerrado ou aumentar dose para compensar ausência/compromisso social.
3. Recomendação pode ser recalculada/apresentada; aplicar mudança na escolha/contexto/plano ou trocar sessão já escolhida/exportada requer confirmação explícita. Contexto mudou no intervalo: invalida e prepara proposta nova.
4. Reavaliar insight vinculado à demanda e exports antigos conforme F02/F04. Mesmo manual/agente aponta à revisão corrente, sem plano paralelo.
5. Próxima ação volta a F02/F03/F07; share segue opcional.

**Fechamento:** próxima decisão e passado distinguíveis. **Recuperação:** cancelar proposta não aplica; corrigir/restaurar dado aplicado gera nova avaliação no contexto atual, sem undo remoto/fisiológico universal. Dados críticos insuficientes degradam/limitam conforme policy, sem regra quantitativa inventada.

## F07. Honrar descanso, interromper e retornar

**Gatilho:** descanso/recuperação/adaptação indicados, interrupção declarada ou retomada. **Objetos:** decisão/desfecho, continuidade, interrupção/retorno; vínculo social independente. **Destino:** Plano / Hoje.

1. Mostrar descanso/recuperação como comportamento apropriado. Confirmação/evidência compatível pode honrar; sem evidência, desconhecido, nunca falha por não haver treino. Confirmar depois corrige pessoal, sem check-in automático.
2. Pessoa pode declarar interrupção sem motivo: encerrar decisões de treino vigentes e suspender novas durante interrupção, sem desfecho forçado.
3. Vínculos não mudam. Pode oferecer pausar Crew por Crew, padrão “não alterar”; se escolhido, só estado neutro “Em pausa”, nunca motivo/horário/histórico.
4. Retomar rebaseia contexto atual e prepara decisão de retorno. Não repõe sessões/volume, restaura streak ou pede prova de comprometimento.
5. Sair do estado retornando após primeira janela conforme modelo, sem condição de mais volume; M3 retoma por intenção/declaração leve. Pode escolher check-in de retorno F09 ou progresso próprio elegível F10, sem requisito.

**Fechamento:** próximo passo aplicável e continuidade legítima. **Recuperação:** falta de dados, interrupção e recovery permanecem distintos; nenhum aviso para terceiros de “quem sumiu”. Retomar prática não retoma vínculo pausado automaticamente.

## F08. Criar/entrar Crew por convite fechado

**Gatilho:** criar Crew ou receber nominal invite/link projetado. **Objetos:** pessoa, consentimento por Crew, convite/vínculo e estado da Crew. **Destino:** Crews / espaço da Crew.

1. Sem identidade, verificar 18+ e entrar como M3 com mínimo: nome de exibição e consentimento de finalidade/acesso; sem contexto do motor. Quem já usa motor preserva M1→M2 sem onboarding paralelo.
2. Criar é direito de qualquer modo dentro do teto; aplicar referência até 3 vínculos e cerca de 8 participantes por Crew. Criação segue o mesmo consentimento informado de finalidade/acesso do aceite de convite (passos 5–6); não efetiva vínculo/acesso antes dele. Convite pendente não é membro; Ativo/Pausado contam.
3. Convite é nominal, de um participante, com validade/revogação. Aceite direto exige comprovação do canal; encaminhado/projetado exige confirmação do convidante. Candidato confirma compartilhar só o nome mínimo necessário ao convidante para essa confirmação, sem acesso antecipado à Crew.
4. Antes de comprovação/confirmação, nenhuma Crew/membro/contexto interno é exposto. Convidante que saiu/removeu revoga seus pendentes. Sem confirmação, convite recusado/revogado/expirado, idade inelegível ou teto: nenhum acesso.
5. Depois de elegível/aprovado e com vaga, explicar categorias e alcance do consentimento da Crew: nome de exibição, lista de participantes, estado neutro do vínculo e audiência permitida são categorias do futuro acesso. Esta explicação pré-aceite não mostra roster, nomes, estados ou outros dados reais de participantes nem conteúdo interno da Crew. Membership não autoriza publicar desfecho ou compartilhar externo.
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

## 12. Handoff e lacunas

Provas limitadas a coerência documental. Parâmetros, método de idade/comprovação, retenção, limites de abuso, matriz wearable, critérios de training/aderência/safety e conteúdo Nutrition continuam owners/triggers de RS §6/PDR. Nenhum flow permite preencher essas lacunas por conveniência; nenhum define visual ou tecnologia.

Reviewer devolve finding com fluxo/cenário/revisão, critério e impacto ao worker. Ajuste material invalida os consumidores/gates afetados; self-check é PA §9, review/publicação no índice/auditoria. Claude deve consumir o conjunto publicado e fechar dependências antes de UX Spec/Designer/Engineering em missão futura autorizada. Não há código ou Figma nesta missão.
