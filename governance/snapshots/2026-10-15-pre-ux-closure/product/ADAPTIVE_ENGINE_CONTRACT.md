# Vilumo Fit — Adaptive Engine Contract

**Estado:** SPECIFICATION — revisão documental aprovada.

| Campo | Valor |
|---|---|
| Revisão | **AEC-1.0** · 2026-10-14 |
| Owner / autoria | Product/UX Architect, worker; Engineering, Security e autoridade de treino consomem e detalham seus domínios. |
| Estado de gate | Gate/publicação no [índice](../canon/CANONICAL_INDEX.md). Não é contrato técnico, algoritmo validado ou autorização de treino real. |
| Autoridade | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), L003–L009, C012, C015, C023, C038–C044; [PDM-1.0](PRODUCT_DOMAIN_MODEL.md), I1–I3/I10 e W1–W3. |
| Necessidade / consumidores | [Release Scope](V1_RELEASE_SCOPE.md) precisa provar coordenação; [Experience Model](EXPERIENCE_MODEL.md) precisa fixar autoridade e revisões; [Core Flows](CORE_FLOWS.md) precisa tratar confirmação, exportação e reconciliação. Centraliza regras antes dispersas sem criar doutrina concorrente. |

## 1. Promessa e autoridade

O Engine determina o comportamento apropriado de **Running × Strength**, considerando a pessoa integral e seu contexto disponível. Seu diferencial pretendido é coordenar as modalidades, explicar adaptações e fechar o ciclo com o realizado. A eficácia dessa promessa é hipótese, não resultado demonstrado por este documento.

Uma decisão pode manter, reduzir, substituir ou remanejar uma sessão, recuperar, descansar ou retornar. Um único plano integrado vigente pode conter várias sessões/janelas; nenhuma modalidade mantém prescrição paralela. Recovery e Nutrition são inputs/contexto e preparação, não motores concorrentes. Crew, agente, recompensa e plataforma externa nunca aumentam a carga para proteger compromisso, share, streak ou engajamento.

A pessoa decide o que executar. Revisar o contexto ou o planejado não é consentir envio externo, publicação social ou uso secundário de dados. O histórico deve permitir distinguir a recomendação vigente, a versão executada e o realizado.

## 2. Inputs e outputs do ciclo

| Input | Origem / requisito | Quando ausente ou conflitante |
|---|---|---|
| Objetivos/prioridades, experiência, agenda, disponibilidade e equipamentos | Athlete Context, declarações editáveis. | Pedir só o que altera decisão; tornar a limitação explícita. Não inventar disponibilidade, carga máxima ou prioridade. |
| Running / Strength planejados e realizados | Capacidades específicas; observações reconciliadas com provenance/confiança. | Não supor sessão concluída; sem dado confiável, manter incerteza. |
| Recuperação e sinais relevantes | Recovery, autodeclaração ou fonte consentida. | Ausência de wearable não é inadequação; sinais materiais conflitantes limitam recomendação conforme política de segurança. |
| Demandas do treino e contexto nutricional mínimo | Sessão/decisão vigente e declaração voluntária pertinente. | Insight geral contextual ou omitido; sem inferir refeição, disponibilidade energética exata, déficit ou macros. |
| Interrupção, retorno, ajuste e motivo opcional | Continuidade da própria pessoa, I10 privado. | Falta de dado não é abandono; motivos nunca obrigatórios nem enviados à Crew. |
| Outro esporte realizado | Somente leitura de contexto que se consiga sustentar. | Confiança reduzida explícita; pode pedir esclarecimento, sem fingir carga precisa ou prescrição daquela modalidade. |
| Estado das integrações | Capacidades, autorizações, frescor e falhas de ingestão/exportação. | Decisão distingue falta de evidência e estado de transporte; falha de integração não penaliza o atleta. |

**Output mínimo por decisão:** referência estável/revisão; janela/validade; contexto que a fundamenta; tipo de comportamento; sessões específicas quando cabíveis; confiança e limitação material; explicação compreensível; critério de aderência aplicável; vínculo de insights; efeitos no plano. Não exige expor todos os sinais no primeiro nível nem produzir score numérico.

**Output de preparação:** controles e estrutura executável da modalidade, contexto de equipamento/agenda, insight nutricional elegível, e opção de structured export se suportado/autorizado. Nenhum componente inventa dose para preencher campo obrigatório.

## 3. Inputs → decisão → confirmação/revisão → execução

1. **Ler contexto vigente.** Usar somente dados/propósitos consentidos, com origem, qualidade, frescor e conflitos. Separar observação, declaração e inferência; não converter hipótese em fato.
2. **Produzir coordenação.** Running e Strength fornecem estrutura/critério específicos; o motor considera relações entre as modalidades, agenda e recovery. Não basta justapor dois planos.
3. **Apresentar o que mudou.** Decisão e revisão anteriores permanecem rastreáveis; efeito no restante do plano é explicado antes de assumir uma mudança. Incerteza material fica junto à próxima ação.
4. **Distinguir sugestão de compromisso de execução.** Recomendação recalculada pode ser apresentada sem confirmação a cada cálculo. Mudança que a pessoa aplica em seu contexto/plano, ou troca de sessão já escolhida/exportada, mostra alcance e exige confirmação. Nunca iniciar sessão, enviar workout ou publicar por esse recálculo.
5. **Confirmar sobre versão corrente.** Se contexto/plano mudou enquanto a proposta era preparada, invalidá-la, explicar e apresentar uma nova proposta. Nenhuma confirmação antiga autoriza efeitos novos.
6. **Executar diretamente.** Iniciar, pausar, registrar, corrigir e concluir sem conversa. Ao iniciar, preservar a versão executada. Atualização durante execução informa mudança; não altera séries/intervalos feitos nem troca silenciosamente o restante.
7. **Ajustar com agência.** Pessoa pode fazer diferente ou registrar sessão não planejada; preserva-se o realizado e sua origem. Motor readapta sem punição ou prêmio por exceder.

**Reversão:** antes de aplicar, cancelar é sem efeito. Após aplicar, corrigir/restaurar a informação pelo mesmo objeto; reprocessar sob contexto atual, sem “voltar no tempo” sobre execução ou dados já enviados. Se restaurar uma revisão anterior já não é seguro/aplicável, explicar e preparar alternativa. Operação externa pode exigir cancelamento/substituição separado; não prometer undo remoto universal.

## 4. Observe → reconciliação → Adapt

- Observação manual, fonte e correção apontam a um fato canônico; não duplicam carga/desfecho porque a mesma atividade veio por dois caminhos. Sem associação suficientemente sustentada, manter registro não associado e pedir resolução privada, sem inventar correspondência.
- Momento do fato e momento de recebimento são distintos. Dado tardio pode corrigir contexto/derivados e readaptar o **futuro**, preservando qual decisão foi dada e executada com os dados disponíveis naquele momento. Não prescrever retroativamente nem declarar desobediência por informação recebida depois.
- Correção substitui a observação anterior em seu escopo, com rastreabilidade. Recalcular somente as consequências afetadas; não contar duas vezes ou sobrescrever outra atividade válida.
- Carga integrada é representação interna com incerteza, não conversão universal exata entre km/séries ou score social. Running e Strength mantêm linguagem própria no detalhe.
- Desfecho usa critério de aderência da modalidade/revisão, com conclusão parcial e tolerância a definir com evidência. Excesso marginal não pode ser arbitrariamente tratado como falha. **Mais volume não tem maior mérito.** Não há score/pontos sociais V1 para premiar desvio.
- Descanso/recuperação confirmado e compatível pode ser honrado; sem confirmação/evidência, desconhecido, nunca não realização/falha por ausência de treino. Confirmação tardia atualiza o registro pessoal, sem check-in automático.
- Interrupção declarada encerra planejamento ativo de treino sem desfecho forçado. Retorno rebaseia pelo contexto atual; sem compensação automática de sessões perdidas, volume antigo ou restauração de streak.
- Feedback social, alcance e distribuição não entram como evidência fisiológica/decisória. Aprendizado comportamental secundário de I10 é finalidade própria opcional, desligada por padrão; revogar interrompe esse uso e remove ou deixa de usar os derivados dessa finalidade, sem revogar o uso primário ainda autorizado (PDM I10). Nenhum perfilamento social; retenção/prova técnica seguem seus owners antes de implementação, sem prazo ou modelo inventado.

## 5. Structured workouts e closed loop wearable

### 5.1 Capacidades e permissões

A conexão informa separadamente: ingestão de atividades; sinais suportados; envio de structured workouts; atualização/cancelamento; recibos; granularidade representável de Running/Strength. Nenhum vendor, SDK, relógio ou acesso comercial é escolhido aqui. Capacidade desconhecida não é tratada como suportada.

Ingestão e envio exigem consentimento próprio por fonte/tipo de dado/finalidade. Conectar para observar não autoriza escrever. Autorizar envio não publica socialmente nem transmite sinais privados desnecessários. Envio de cada workout depende da ação explícita da pessoa sobre sessão/revisão identificadas; sincronização automática em lote seria novo contrato de autonomia, fora da V1 aqui proposta.

### 5.2 Ciclo do export

| Estado / evento | Comportamento obrigatório |
|---|---|
| Preparada | Cópia da sessão/revisão selecionada; prévia do que será enviado, destino e diferenças de representação. Sem permissão/capacidade, não entra em fila. |
| Pendente / indisponibilidade | Sessão preservada no app; fila e ausência de confirmação visíveis. Não mostrar pronta no relógio. |
| Enviada | Transporte aceito conforme evidência disponível; não implica entrega final no relógio se a integração não a comprovar. |
| Confirmada | Recebimento/disponibilidade comprovados no limite que a integração permite; limite explicado. Nunca equivale a “executada”. |
| Falha / resultado desconhecido | Distinguir erro conhecido de timeout após possível entrega. Antes de reenviar, reconciliar o estado quando possível; retries não geram workouts duplicados. Sem prova, avisar possível cópia remota e oferecer execução no app. |
| Sessão/decisão revista | Export ainda não enviado fica obsoleto/inválido. Export já enviado fica marcado como revisão anterior; preparar substituição ou cancelamento somente se suportados e confirmados pela pessoa. |
| Atualização/cancelamento pendente | Não afirmar remoto atualizado/cancelado até evidência. Se impossível, informar que a cópia antiga pode continuar no relógio, orientar conferência e manter versão vigente no app. |
| Desconectada / permissão revogada | Desconexão completa interrompe ingestão e envio da conexão; revogação por finalidade interrompe somente as operações/pendências cuja autorização cessou, preservando permissões independentes válidas. Revogar envio não revoga leitura ainda autorizada. Explicar dados/cópias já entregues, sem prometer remoção externa automática. |
| Atividade executada chega | Observação separada; reconciliar origem/versão/sessão sem duplicar. O atleta pode ter executado cópia antiga; preservar o fato e readaptar o futuro. |

Se o destino não representa a estrutura ou prescrição de forma crível, não simplificar silenciosamente: mostrar diferença/limite e oferecer execução pelo app. Pode haver ingestão sem envio ou envio somente de Running; isso é limite daquela integração, não exclusão de Strength do produto. A matriz de viabilidade de launch deve escolher integração(s) com ao menos um caminho real de closed loop antes de anunciar a promessa (RS §6).

Offline, execução/registro local continuam dentro do que já foi validamente preparado. Nova prescrição dependente de dado remoto indisponível não recebe precisão inventada. Nenhum treino ou registro desaparece em silêncio na reconexão. Os mecanismos técnicos de idempotência, versionamento e autoridade de sync cabem a Engineering; estes são os outcomes que precisam provar.

## 6. Nutrition e exemplos de coordenação

Insight é **contextual performance insight**, não dieta: responde a uma demanda de treino identificada, liga-se à revisão e apresenta limites. Pode explicar preparação de combustível, hidratação ou recuperação ligada à sessão, se houver base suficiente; não define dieta, refeição, macro diário, dose suplementar ou recomendação clínica. Não usar “20%”, “30 minutos” ou outra precisão como regra sem baseline, aplicabilidade e evidência aprovados. O exemplo do Founder não é uma fórmula autorizada.

Os cenários abaixo são testes de coerência sob contexto assumido, **não afirmações fisiológicas ou prescrições já validadas**:

| Cenário | Coordenação que a estrutura deve permitir |
|---|---|
| Longão planejado próximo de força de membros inferiores | Tornar o conflito relevante legível e avaliar opções admissíveis de manter/remanejar/reduzir conforme objetivos, agenda, recovery e policy; explicar efeitos em ambas as modalidades. |
| Força realizada diferente do previsto | Observação corrigida atualiza o contexto compartilhado e pode alterar próxima decisão de corrida; não apenas analytics isolados de força. |
| Corrida longa observada e sessão de força seguinte | Contexto realizado pode alterar decisão de força e seus insights de preparação; efeito não é automático sem evidência/regra aprovada. |
| Longão mudou para descanso | Rever/retirar o insight ligado à demanda anterior e invalidar export pendente; descanso não recebe marca de falha. |
| Crew convida para fazer mais | Convite/compromisso não muda adequação; honrar adaptação/descanso permanece válido. |

## 7. Safety, degradação e agente opcional

Sem dados suficientemente seguros para uma prescrição específica, limitar detalhe, pedir contexto material, suspender recomendação inadequadamente sustentada ou usar alternativa conservadora **somente conforme regra de safety validada**. Não existe default quantitativo “seguro” inventado. Sinal de risco não é diagnóstico; limites/escalation para ajuda qualificada precisam de evidência/autoridade competente antes de execução real. Safety Contract/policy de runtime e parâmetros ainda são requisito de implementação/release, não desculpa para fabricar regra nesta missão documental.

Se houver agente: lê apenas objetos/propósitos autorizados; explica a decisão do Engine; prepara ajuste com alcance exato, versão e confirmação; usa as mesmas operações do caminho direto. Proposta sobre estado antigo é inválida. Não age no social, envia workout, projeta share, muda consentimento ou exerce direitos pela pessoa. Conversa não cria estado paralelo; informação usada para decidir deve aparecer no objeto correspondente. Tarefas simples e core loop funcionam sem agente. Arquitetura preserva o canal, mas implantação, modelo, retenção e rollout exigem AI Systems/Security; não são pré-requisito desta formalização.

## 8. Aceitação documental e abertos

Este contrato é suficiente quando os consumidores distinguem decisão, confirmação, execução, observação e export; preservam revisão/correção; fazem degradação explícita; mantêm Run × Strength coordenados e social sem autoridade. Percursos de prova: [CF S01–S12](CORE_FLOWS.md). Prova executável/segurança/eficácia permanece pendente.

Owners e triggers dos abertos estão em [RS §6](V1_RELEASE_SCOPE.md) e PDR: safety/aderência/cobertura, parâmetros nutrition, viabilidade/capacidades wearable, política de sync/retention/consentimento e agente. Alterar autoridade, permissão, scope ou promessa exige revisão dos consumidores e gates afetados. Este contrato é subordinado à tese, não fonte normativa concorrente.
