# Vilumo Fit — Product Domain Model

**Estado:** SPECIFICATION — amendment pré-UX; publicação/gates no índice.

| Campo | Valor |
|---|---|
| Revisão | **PDM-1.1** · 2026-10-15 |
| Autoria | Product/UX Architect, worker |
| Estado de gate | Publicação/gate corrente no [índice](../canon/CANONICAL_INDEX.md); não se autoaprova. |
| Autoridade | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), L003–L009, L013–L023, C001, C012, C023–C037, C038–C044; pedido direto do Founder em [RB-3.0.0-r1](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md). Estado upstream controlado pelo índice. |
| Consumidores | [Architecture](PRODUCT_ARCHITECTURE.md), [Engine Contract](ADAPTIVE_ENGINE_CONTRACT.md), [Release Scope](V1_RELEASE_SCOPE.md), [Experience Model](EXPERIENCE_MODEL.md), [Core Flows](CORE_FLOWS.md). |
| Linhagem | Consolidada da PDM-0.6, preservada no [snapshot](../governance/snapshots/2026-10-14-pre-3.0.0/product/PRODUCT_DOMAIN_MODEL.md). Gates históricos não cobrem esta revisão. |

Modelo conceitual de significado, ownership e fronteiras; não esquema de dados, API, algoritmo, fórmula, vendor ou telas. **[N]** obrigação normativa; **[A]** escolha arquitetural subordinada; **[O]** aberto no [PDR](PRODUCT_DECISION_REGISTER.md). Uma entidade não obriga um destino de navegação.

Amendment pré-UX PREUX-20261015-r1: preserva PTC-3.0.0/PTM-1.0 e o rebaseline aprovado; explicita contexto, trace, aplicabilidade/HOLD e representação neutra para que os consumidores não inventem regras. Evidências de apoio: [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md), TR-001–015/NUT-001–010; [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md), SAFE-001–005; [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md), CTRL-001–012. AEC concentra comportamento, PDR §5 concentra decisões residuais; packs não são outra autoridade.

## 1. Current → target

O núcleo coordena **Running × Strength** para uma pessoa no loop **Decide → Prepare → Execute → Observe → Adapt → Share → Repeat**. Share é voluntário; pular essa etapa preserva todo o valor solo. O Adaptive Engine determina o apropriado, incluindo reduzir, substituir, recuperar, descansar e retornar. Nutrition prepara demandas do treino; Wearables atravessam plataformas suportadas; Crew Lite apoia continuidade e distribuição sem prescrever.

| Baseline preservado | PDM-1.1 |
|---|---|
| Dois pilares equivalentes; quatro esportes mínimos | Engine núcleo; Running e Strength first-class V1; Crew Lite camada de apoio. Cycling/Swimming/outros futuros, sem prazo obrigatório (C038, C023, C042). |
| Nutrition com profundidade aberta | Insights ligados às demandas do treino; nenhum food logging, macro tracker, dieta ou meal planner (C039). |
| Relógios somente fontes | Ingestão e exportação estruturada consentidas separadamente, conforme capacidade comprovada (C040). |
| Ontologia social e progresso coletivo extensos | Compromisso leve, check-in consentido e apoio privado; sem score coletivo obrigatório, perfilamento ou memória social V1 (C041). |
| Atleta único, agência, recovery e privacidade | Preservados: contexto e plano integrados, referência estável de sessão e nenhuma verdade paralela por canal. |

## 2. Atores, modos e restrições preservadas

| Ator / modo | Valor e limite |
|---|---|
| Pessoa / atleta | Adulta, dona do contexto, registros, permissões e escolha de execução. O sistema não coage nem exige motivo de pausa/ajuste. |
| Full Member sem Crew (M1) | Experiência pessoal completa sem convite ou compartilhamento obrigatório. |
| Full Member em Crew (M2) | M1 mais participação voluntária; grupo não altera decisão, plano ou carga. |
| Crew Member (M3) | Participação social leve, intenção e check-in autodeclarados. Sem Athlete Context/wearable obrigatório; sistema não avalia sua adequação nem valida performance. |
| Convidado | Ainda sem vínculo; convite não concede acesso a dados da Crew. |
| Adaptive Engine | Coordenação e adequação sob política de segurança; não consente nem age no social. |
| Agente opcional de coordenação | Explica e prepara sobre os mesmos objetos do caminho direto; não possui plano/estado/autoridade próprios. |
| Fonte/destino wearable | Integração externa com capacidades de leitura/escrita declaradas; envio não comprova execução. |
| Destino externo de share | Recebe cópia escolhida, fora do controle posterior do Vilumo, sem acesso interno vivo. |

Preservam-se **Brasil, PT-BR + inglês, smartphone iOS + Android, 18+ em toda entrada**. Nova autoridade altera “relógios apenas fontes”, sem exigir app próprio no relógio. Preservam-se até **3 vínculos Ativos ou Pausados por pessoa**, Crews íntimas de **até cerca de 8**, criação permitida a Full Member e Crew Member, convite nominal e confirmação do convidante em aceite encaminhado/projetado. Sem agenda de contatos ou discovery público. Fonte: [Founder Gate](../audits/phase-1-3-reviews/founder-gate-phase3-decisions.md), C025 e DR-47, com atualização ativa no PDR.

M1 ↔ M2 depende apenas de vínculos. M3 → M2 requer adoção voluntária da experiência pessoal. M2 → M3 pode manter a Crew ao deixar o motor. Sem experiência pessoal e sem vínculo, conta sem modo ativo pode criar Crew, aceitar convite ou adotar o motor. Modo não é plano comercial nem dado social.

## 3. Ownership e entidades

| Responsabilidade | Possui | Não decide / não possui |
|---|---|---|
| Pessoa & Permissões | Pessoa, modo, acesso a capacidades, consentimento por finalidade/escopo, idioma, direitos de dados. | Modelo comercial ou adequação. |
| Athlete Context / Performance | Objetivo primário/secundário e prioridades declaradas, experiência, agenda/disponibilidade, equipamentos, práticas, observações reconciliadas, exposição/cobertura e trajetória com confiança. | Plano prescrito, prioridade trocada silenciosamente ou perfil por esporte. First-class não implica igual dose. |
| Capacidades Running e Strength | Representação/linguagem da sessão, registros e critérios de aderência específicos; estruturas admissíveis e implicações para contexto. | Pessoa, carga integrada ou decisão próprias. |
| Recovery | Sinais consentidos, relato local/efeito funcional e recuperação geral distinguíveis, com tipo/escala/protocolo/timing/fonte/limites. | Diagnóstico de fadiga local/sistêmica, REDs, score universal ou prescrição separada. |
| Nutrition Insights | Asset/conteúdo revisado, classe funcional educação/guidance/prescrição, demanda/decisão/sessão/revisão, fase, aplicabilidade e contexto mínimo voluntário; policy/evidence/content revisões. | Ingestão inferida, dieta, macro/deficit, prescrição individual autônoma ou suplementos V1. Conteúdo elegível não equivale a ato profissional autorizado. |
| Adequação / Adaptive Engine | Decisão, plano integrado/revisões, sessão planejada e representação neutra, trace de inputs/regras/evidência/explicação, confiança/aplicabilidade e HOLD no escopo afetado; seleção de insights. | Execução real, consentimento, liberação clínica ou incentivo social. |
| Continuidade pessoal | Intenção leve do Crew Member, desfecho, registro de continuidade, interrupção/retorno. | Contexto bruto de terceiros ou abandono inferido. |
| Wearable closed loop | Conexão/rota/capacidades versionadas e limites reais de permissão, ingestão, referência externa/provenance, intenção/export/cópias da revisão, transformação/diferenças, recibos/reconciliação. | Prescrição, estado canônico de provider/Terra ou plano externo concorrente. Store/formato não é executor. |
| Crew Lite | Crew, vínculo, convite, compromisso leve, check-in/contribuição voluntária, apoio privado e reconhecimento qualitativo do período comum. | Contexto privado, score de performance, feed, chat, discovery ou marketplace. |
| Shareability | Objeto derivado, prévia e projeção externa. | Fonte bruta, perfil público ou alcance/curtidas. |

**Relações [A]:** um Athlete Context por Full Member; nenhum obrigatório ao Crew Member. Um plano integrado vigente é um horizonte de decisões com janelas que podem conter várias sessões de corrida/força; não significa uma sessão por dia. Cada sessão tem referência estável e payload de modalidade. Sessão realizada pode ser não planejada; se associada, aponta à versão planejada realmente executada. Revisão não reescreve passado.

Observação distingue bruto, declaração/correção, inferência e derivado. Conserva pessoa, origem imediata/originador exposto, provider/rota/conta e IDs namespaceados, ocorrido/medido/recebido com timezone, unidade/método/janela, qualidade/frescor e cobertura. Derivado aponta aos inputs/revisões e transformação; corrigido/suprimido não continua como sinal ativo inelegível. Não copiar payload sensível integral em todo trace. Duplicatas não criam sessão/carga; delivery ID não é fato. Similaridade só propõe associação; duas sessões reais parecidas permanecem distinguíveis, sem média de campos incompatíveis.

Eliminação/supressão possui revisão de estado e precedência sobre revisões antigas do fato/escopo, por marcador mínimo (tombstone ou controle equivalente). Novo delivery ID/replay/refetch/backfill não ressuscita observação/carga/derivados; reentrada legitimamente nova exige autorização atual e preserva a intenção de supressão/revogação. AEC §4/§5.4 governa o comportamento. O marcador não contém payload bruto de saúde e não concede retenção indefinida: minimização, finalidade/base e retenção/eliminação seguem G07; controle equivalente permitido deve preservar a precedência quando não for lícito retê-lo, sem recoleta proibida. Não se escolhe schema/banco ou mecanismo aqui.

Sessão/workout mantém revisão imutável, referência/revisão de plano/decisão e validade. Sua representação neutra preserva steps/repeats (total de iterações), completion, advance e targets/unidades/baselines separados, com semântica Strength completa. **Domínio → neutro → adapter → provider** não cria um objeto de treino governado pelo intermediário. Export é cópia/intenção com revisão neutra, transformação/adapter/capability, diferenças e prova de sistema/device; nunca sessão realizada. Intenção de aplicação/envio é sobre alcance/revisão atuais, separada de consentimento. AEC §3/§5 define trace/idempotência; mecanismos de armazenamento não são escolhidos aqui.

HOLD pertence à recomendação/adaptação dependente: classe/causa privada mínima, escopo, revisão, owner, próximo passo e evidência de saída. Não é diagnóstico, estado social ou conta bloqueada. Recusa/override registra agência sem liberar prescrição proibida. Insight reconhecido não comprova ingestão; educação e guidance exigem avaliação profissional/legal para publicação, por função do conteúdo (AEC §6/§7).

Agenda representa disponibilidade durante a prática; **Interrupção** é a fonte única da pausa da prática. Pausa de vínculo de Crew é independente. Pessoa N ↔ M Crew via vínculo; pendente não é participante. Compromisso leve tem período, adesão opcional e intenção de fazer o apropriado, sem dose física comum; Crew pode existir sem compromisso ativo.

**Check-in/contribuição [A]:** projeção mínima escolhida pela pessoa para uma Crew e destinatário ativo específicos, “fiz o que fazia sentido”, inclusive descanso/retorno. Mensagem estruturada privada, sem feed/lista de quem cumpriu, origem, motivo, confiança ou selo de verificação. Declaração do Crew Member é continuidade, não valida performance. Apoio é resposta estruturada privada, sem texto livre ou contador. Registro pessoal é independente da retenção social.

**Reconhecimento coletivo [A, L010/C041]:** ao fim do período do compromisso, reconhecer qualitativamente o período comum de continuidade/apoio e cooperação. O fato canônico é o encerramento temporal do compromisso, sem afirmar cumprimento de todos, contar check-ins ou produzir sucesso/fracasso por ausência. Apoio privado reconhece a contribuição escolhida por cada pessoa. Não é dashboard, score, memória social ou share coletivo externo.

## 4. Contratos de fronteira

I1–I10 preservam a linhagem útil com redução explícita do social; W1–W3 delimitam bidirecionalidade. Não são APIs.

| ID | Travessia e regra |
|---|---|
| **I1** Contexto → Adequação | Sinais/fatos autorizados com provenance/escala/timing/cobertura, confiança **por decisão** e aplicabilidade. Só o motor integra carga/interferência/recuperação/agenda, sem equivalência km↔séries ou score universal. |
| **I2** Adequação → continuidade/execução | Decisão, sessão/revisão, classe/trace, aderência, justificativa/confiança, aplicabilidade/HOLD e próximo passo permitido. Confirmação é sobre alcance/versão, sem consentir efeitos externos novos. |
| **I3** Observação/declaração → Continuidade | Real reconciliado e declaração pessoal. Ausência de atividade não prova não realização; descanso sem evidência é desconhecido, nunca falha. |
| **I4** Continuidade → Crew Lite | Check-in mínimo por ação explícita, consentimento, Crew e destinatário escolhidos. Sem contexto, intenção, motivo, origem, confiança, modo, dado físico ou ausência. Aceitar Crew não publica desfechos automaticamente. |
| **I5** Social → agenda | Extensão para intenção declarada pela própria pessoa. Together não entra na V1; grupo nunca escreve agenda/plano de outro. |
| **I6** Permissões → travessias | Finalidade e escopo próprios; dados sensíveis mínimos. Leitura de atividade, saúde/recovery e envio wearable separados localmente, sem prometer scopes OAuth externos iguais. Revalidar finalidade/versão no efeito/fila/retry. Outra finalidade só continua após revogação se técnica/juridicamente sustentável; senão desconectar e explicar. Desconexão completa cessa leitura/envio; não equivale a apagar toda história/cópia remota. |
| **I7** Progresso próprio → Shareability | Preparado por iniciativa da pessoa: próprio marco/resultado elegível; nenhum sinal de saúde, Nutrition, justificativa ou dado de outra pessoa. |
| **I8** Crew → Shareability | V1 somente convite sem dados da Crew/membros antes do aceite autorizado. Identidade/conquista/progresso coletivos externos diferidos; anonimato de pequeno grupo não é presumido. |
| **I9** Shareability → externo | Prévia exata, ação explícita, destino escolhido e cópia estática. Sem postagem automática, dados vivos, rastreamento de audiência/conversão individual ou importação de alcance. Convite volta somente pelo aceite. |
| **I10** Continuidade → Adequação | Primário: desfecho/contexto declarado necessário para explicar/replanejar a sessão/horizonte atual com escopo transparente. Secundário: aprendizado longitudinal adicional de históricos/motivos, próprio opt-in OFF por padrão; nomear “adaptativo” não o torna primário. Revogar cessa uso, fila e serviço de derivados dessa finalidade, eliminando ou deixando de usar os derivados; registro primário exige necessidade/base independente válida. Sem perfilamento social V1. |
| **W1** Fonte → Observação | Ingestão autorizada com provenance, frescor, qualidade, conflito, duplicata/correção; pendência não fabrica execução. |
| **W2** Sessão → destino wearable | Export da revisão confirmada quando capacidade/consentimento permitem. Transporte não muda adequação; adaptação invalida export preparado antigo. |
| **W3** Resultado externo → reconciliação → I3/I10 | Recibo de envio é transporte; atividade observada é evidência separada. Associação sem duplicar informa readaptação. Falha/desconexão não é falha do atleta. |

[AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md) consome I1/I2/I3/I10 e W1–W3. Insights de Prepare acompanham a revisão da demanda: plano alterado exige rever aplicabilidade, sem orientação órfã ou prescrição paralela.

## 5. Estados e transições

| Objeto | Estados / regra |
|---|---|
| Confiança | Suficiente, parcial, conflitante, desatualizada ou ausente por sinal/decisão; preservar motivos simultâneos. Ausente não é zero/não treinou/consentimento negado; parcial não é clearance. Policy define utilidade, sem TTL/score universal. |
| Aplicabilidade / HOLD | Elegível/degradada → contexto necessário ou HOLD escopado → correção/review → reavaliação pela policy atual. Causas e owners em AEC §7. Confiança favorável, tempo, silêncio ou override não liberam restrição clínica/policy ausente. Histórico, correção, direitos e funções não dependentes continuam. |
| Decisão/plano | Preparada → vigente → substituída/expirada/encerrada por interrupção. Contexto material mudou: confirmação da versão antiga inválida. |
| Sessão | Planejada/pronta → em execução ↔ pausada → concluída parcial/completa ou cancelada. Nova decisão não apaga séries/intervalos; ajuste do restante tem versão/aceite explícitos. |
| Observação | Recebida/pendente → proposta de associação → associada confirmada ou não associada; duplicata reconhecida; corrigida/suplantada ou eliminada/suprimida com revisão de precedência; conflito privado. Revisão antiga não reativa fato/derivados por reentrega ou backfill. Dado tardio mantém ocorrido versus recebido; correção legítima e autorizada recalcula derivados sem apagar supressão vigente, duplicar fato ou reescrever decisão passada. |
| Continuidade | Ativa (em curso/adaptando/recuperando), sem dados, interrompida por declaração, retornando. Retorno usa contexto atual, sem compensar volume/streak. |
| Descanso | Evidência/confirmação compatível → honrada; sem evidência → desconhecida, nunca falha. Confirmação tardia não envia check-in automaticamente. |
| Nutrition Insight | Elegível/provisório/exibido → reconhecido/dispensado; contexto necessário, retido/encaminhamento ou obsoleto se demanda muda. Classe/fase/conteúdo/aprovação distintos; nenhum fato de consumo inferido. |
| Conexão wearable | Não conectada, autorização parcial, ativa, indisponível, permissão revogada/desconectada; capability documentada/aprovada/comprovada são dimensões distintas. Read/write locais independentes dentro do limite externo real. |
| Export wearable | Preparada com preflight → fila → transporte aceito → confirmação no sistema/device **quando provada**, ou falha/unknown/discrepância. Executada/observada/associada são fatos separados. Revisão/HOLD invalida pendente afetado; substituição composta pode falhar parcialmente; sem retry cego ou recall presumido (AEC §5). |
| Vínculo | Ativo ↔ pausado; saiu/removido encerra acesso inclusive histórico. Novo convite para reentrar. |
| Crew | Em formação (um participante), ativa (dois ou mais), encerrada (último sai). Pausas não alteram estado nem geram fracasso. Criador sem poder permanente especial. |
| Compromisso | Proposto → ativo por adesão → concluído ao fim/cancelado sem fracasso. Conclusão temporal pode reconhecer qualitativamente cooperação, sem avaliar cumprimento de todos. Um restante cancela compromisso comum; prática solo continua. |
| Convite | Emitido → pendente de comprovação/confirmação → aceito; recusado/expirado/revogado sem acesso. Convidante vê só pendente, aceito ou não aceito/expirado, sem causa sensível. |
| Check-in/apoio | Preparado → enviado privadamente → retirado/expirado conforme retenção. Sem confirmação pública de leitura; novo membro sem passado. Pausa/saída/remoção impede novos envios. |
| Share | Prévia privada → confirmada → projetada. Cancelar não projeta; revogar para futuro não recolhe cópias externas. |

## 6. Invariantes

1. Um atleta, um plano integrado, uma sessão canônica; canais e integrações não geram estado concorrente.
2. Motor decide; pessoa age. Insight, fonte, Crew e agente não prescrevem independentemente. Edição manual é input do loop sem ajuste oculto adicional.
3. Honrar reduzir/recuperar/descansar é progresso. Mais volume não supera honrar nem gera vantagem social. Tolerância fina de aderência permanece aberta.
4. Insight nutricional só explica/prepara demanda do treino. Contexto disponível não autoriza logging, dieta ou meal planner.
5. Workout exportado não equivale a entregue/executado. Dado tardio/corrigido não duplica, apaga passado ou prescreve retroativamente.
6. Crew pode criar/participar nos tetos, aderir, pausar, sair, bloquear convites/silenciar apoio. Nenhum alerta de quem “sumiu”, ausência, contexto ou modo de outro.
7. Consentimento social, leitura, envio, share e aprendizado secundário não se ampliam entre finalidades, Crews ou destinos.
8. Sem leaderboard, pontos ou score/streak coletivo V1; check-in não cresce por volume nem exige prova. Descanso pode contar sem revelar a causa.
9. Até classificação jurídica própria, Recovery, Nutrition e motivos de saúde têm minimização/consentimento explícito e ficam privados; não cruzam para Crew/share.
10. Outro esporte pode ser contexto no que se interpreta com confiança explícita; sem prescrição/analytics próprios, placeholder ou promessa. Extensão não exige capability futura implementada agora.

## 7. Persistência e direitos

Registro pessoal admite correção, acesso, exportação dos próprios dados e eliminação. Ao deixar experiência pessoal, cessam prescrição/processamento ativo; contexto, Recovery, Nutrition, planos e aprendizado secundário são eliminados ou mantidos somente sob finalidade transparente de privacidade. Continuidade pode ser mantida pela finalidade escolhida sem reativar motor. Encerrar conta abrange todos os domínios, convites/exports não enviados e tratamento transparente de dados já entregues externamente.

Check-ins/apoio têm janela operacional limitada, sem Crew Memory. Saída/remoção termina acesso imediato, elimina/minimiza mensagens pessoais sem composição inferível, revoga convites pendentes e impede novo uso da pessoa. Revogar opt-in retira o que segue visível sob ele; histórico pessoal não é alterado pelo social. Durações, backups e prova de eliminação: Security/Engineering antes de implementar, sem prazos inventados aqui.

## 8. Alternativas e provas

| Decisão | Escolha | Alternativa concorrente e consequência |
|---|---|---|
| Run × Strength | Capacidades específicas, contexto/plano únicos. | Dois planos mantêm profundidade mas dividem autoridade; tracker genérico perde profundidade. |
| Extensibilidade | Payload específico e fronteiras para duas modalidades; adapters wearable por capacidade. | Framework universal de plugins sem consumidor V1 amplia abstração; pessoa/plano por esporte torna extensão ruptura. |
| Nutrition | Insight versionado na preparação. | Módulo alimentar preservado ampliaria promessa/jornada para logging/dieta. |
| Crew | Compromisso leve e check-in privado direcionado. | Dashboard coletivo exige denominadores/regras e facilita inferir ausência em grupo pequeno. |
| Share coletivo externo | Diferido, preservando capability futura; V1 próprio progresso/convite. | Agregar/ocultar nomes não demonstra anonimato em Crew de dois/oito; baseline sem nova prova carregaria risco material. |

Provas analíticas em [CF-1.1 S01–S18](CORE_FLOWS.md) e critérios de [RS-1.1](V1_RELEASE_SCOPE.md); não testes executáveis/eficácia. Autoavaliação está em [PA §9](PRODUCT_ARCHITECTURE.md), identificada como self; gate independente é registrado pelo Chief.

## 9. Abertos / limite de etapa

Decisões residuais exatas, owners/provas e efeitos por etapa estão **somente no [PDR §5, G01–G11](PRODUCT_DECISION_REGISTER.md)**; [RS §6](V1_RELEASE_SCOPE.md) consome esse inventário. Literatura/capacidades públicas já sustentam os contratos qualitativos; política profissional, conteúdo/legalidade, aprovação de provider/device e prova executável não são fabricados. Não há schema, vendor escolhido, treino validado, Figma/UI ou release pronto. Autoria Product/UX worker; autoavaliação PA §9 não aprova esta revisão.
