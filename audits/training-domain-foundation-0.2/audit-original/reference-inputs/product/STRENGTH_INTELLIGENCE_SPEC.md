# Strength Intelligence Layer

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Domain authority retained · 2026-10-22 · EXP-AUTH-r1.** Full prescription/progression/programming/exercise/recovery/analytics semantics and scientific/approval limits remain intact. [DR-93–97](PRODUCT_DECISION_REGISTER.md) / [index filter](../canon/CANONICAL_INDEX.md) retire only inherited surface allocation, “existing objects” presentation prescriptions and experience reading sequences as requirements. No capability implies a surface and no scope is added. Isolation metadata is history after `32b7fb6`; no efficacy or implemented support follows. Designer entry: [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

Revisão **STIL-1.1-r1** · 2026-10-19 · **CANDIDATE_IN_ISOLATION** · task FREEZE-20261019-r1 (baseline SIL).
Owner semântico: Strength Intelligence sob Adaptive Engine. [SIS](SPORT_INTELLIGENCE_SPEC.md) define contratos/ownership/arbitragem e carga compartilhada; [AEC](ADAPTIVE_ENGINE_CONTRACT.md) e [AEOS](ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md) conservam autoridade. Especificação do núcleo decisório para implementação futura, sem catálogo de features, fórmulas ou prescrição real aprovada.

## 1. Pergunta decisória e estado

Qual estímulo de força atende objetivo, experiência e contexto do atleta, com sobrecarga merecida, recuperação e interferência consideradas? O usuário pode priorizar força, hipertrofia ou fortalecimento específico dentro da cobertura aprovada, inclusive com corrida secundária. Strength é especialista de primeira classe; não se resume a acessórios de corredor, lista de exercícios ou calendário de “dia de perna”.

Consome `SpecialistRequest` com objetivo/prioridades, experiência/exposição conhecida, equipamento disponível e incrementos representáveis, histórico comparável por exercício/configuração, dose/execução/esforço, restrições e projeção compartilhada de carga/recuperação. Nenhum teste máximo, sensor ou relato íntimo adicional é requisito implícito. Desconhecido limita a decisão correspondente; não vira iniciante, zero carga ou recuperação completa por default.

Programação/performance/recovery específicos são projeções versionadas do Athlete Model único. O especialista retorna propostas e avaliações; Adaptive Engine é único dono da prescrição vigente e árbitro Run × Strength.

## 1.1 Fundamentos decisórios e cadência

Strength deve raciocinar explicitamente sobre especificidade; progressive overload; volume, intensidade e frequência; proximidade da falha; recuperação; seleção e ordem de exercícios; fadiga; progressão e periodização; aderência e individualização. São fundamentos para escolher/manter estímulo e interpretar resposta, não features, lista de opções ou fórmula universal. C057/SIS§1.1 exigem suporte em princípios de treinamento bem estabelecidos e prática consolidada, com evidência/aplicabilidade e limites rastreáveis; não prescrever por plausibilidade, LLM, novidade ou para demonstrar personalização. “AI applies training science; it does not replace training science.” Evidência fraca/conflitante reduz certeza/precisão e conserva decisões reversíveis cobertas, sem substituir abstensão por dose inventada.

AEC§1.3/AEOS§10.3 distinguem Continuous Learning de Exceptional In-Cycle Adaptation e Systematic Between-Cycle Progression. Após execução, atualizar o Athlete Model pertinente não muta plano; semana válida/adequada permanece, salvo fato material que exija reação. Entre semanas/ciclos é o lugar padrão para evolução significativa; progressão é earned por evidência comparável e não calendário. Programmed Variation exige propósito de treinamento/fase/especificidade/deload/taper, não ganho presumido; Reactive Adaptation exige inadequação material e menor intervenção. Estrutura variável já aceita é execução do plano, não nova mutação. Nenhum rótulo contorna HC/agency/necessity.

Consistência programada pode servir mensuração, habilidade, estímulo e especificidade; preservar quando útil. Repetição não é defeito automático, variação não demonstra inteligência e personalização não exige instabilidade. Interação com a outra modalidade usa concurrent training/TrainingDecisionBasis SIS§1.1, prioridade, demanda/recuperação e resposta individual, sem regras arbitrárias ou dupla fadiga. §9/G11 conserva prova futura, revisão humana desejável e claims responsáveis; não bloqueia Visual/UI.

## 2. Prescription engine

Traduz objetivo → horizonte/fase → frequência/divisão → padrões/grupos e estímulos → exercício/configuração → séries/repetições/esforço/carga → descanso/ordem → alternativas aprovadas. Divisão e método são meios para estímulo/viabilidade, não identidade de produto ou opções obrigatórias de UI.

| Payload / decisão | Semântica preservada |
|---|---|
| Exercício/configuração | ID estável e revisão de repertório, equipamento, variante, amplitude/execução prescrita quando relevante, unilateral/bilateral e lado; peso corporal, assistência ou carga externa identificados. |
| Tipo e sequência de série | Aquecimento/preparação versus trabalho, técnica ou segmento especial coberto; ordem, referência local e relação com bloco. Aquecimento não conta automaticamente como série efetiva. |
| Repetições | Faixa/alvo e realizado por série/lado quando necessário; parcial, interrompida, omitida e desconhecida não se confundem. Não somar lados duas vezes como volume bilateral equivalente. |
| Carga | Valor/unidade e convenção: por mão, total, máquina/placa/stack, assistência ou peso corporal; equipamento/configuração e incrementos disponíveis. Cargas de máquinas diferentes não são intercambiáveis. |
| Esforço | RIR estimado ou RPE de série com escala/momento/âncoras; distinguir RPE de sessão e dor. Não converter RIR/RPE em certeza de falha, carga máxima ou clearance. |
| Descanso | Intervalo/alvo e advance manual/temporal entre séries/exercícios/blocos, com propósito. Pausa maior/menor observada pode afetar comparabilidade/densidade; não é simples cosmética de timer. |
| Ordem e duração | Dependências/estímulos prioritários, transições/equipamento, estimativa de tempo com limites e alternativa se disponibilidade mudar. Não retirar descanso/aquecimento silenciosamente para caber na agenda. |
| Estímulo e demanda | Grupo/padrão pretendido, custo qualitativo local/sistêmico sustentado, axial/excêntrico/novidade e efeitos previstos/unknowns. Deve permitir comparar alternativas sem “exercício equivalente” por nome. |

Carga inicial parte somente de método validado e evidência pertinente; sem histórico comparável, usar procedimento/receita de estabelecimento aprovado ou pedir contexto/reter dose dependente. Não testar 1RM nem impor aumento fixo para preencher campo.

Aquecimento considera tarefa, carga/experiência, preparação e contexto conforme receita; pode ter séries específicas e não substitui regra de safety. Recuperação entre séries participa da prescrição/estímulo e do tempo disponível. Proposta precisa continuar íntegra no app; relógio não reduz força a intervalos cronometrados ou inventa reps/carga/RIR omitidos.

## 3. Progression engine

`StrengthProgressionAssessment` estende SIS §6 por exercício/variante/padrão/grupo e ciclo: alvo vigente/revisão, séries executadas, reps/carga/esforço/descanso, técnica/amplitude quando avaliadas por método autorizado, comparabilidade, evidência/contraevidência e oportunidade de progressão. Só registrar não valida técnica; não se infere de vídeo/sensor inexistente.

Pode propor mudar carga, reps, séries, frequência, esforço-alvo, densidade, variante ou manter/reduzir/rebasear; cada eixo e o efeito combinado exigem regra/limites aprovados. Aumento de carga não é única progressão. Mais volume não é automaticamente melhor e redução deliberada não significa perda de força.

| Evidência / situação | Decisão a sustentar |
|---|---|
| Alvo de reps/esforço atingido em tarefa comparável | Pode haver elegibilidade para avanço conforme policy e recovery/horizonte; conclusão de séries sozinha não concede aumento. |
| Reps caem entre séries, esforço maior ou descanso/configuração mudaram | Interpretar padrão e comparabilidade; manter/revisar ou abster-se conforme regra. Não subir carga por calendário ou PR isolado. |
| Repetições “cumpridas” com esforço desconhecido | Registrar resultado; não inventar RIR ou prova de margem. Método aprovado pode suportar decisão limitada; sem ele, insuficiência explícita. |
| Orchestrator retirou séries/carga para preservar corrida/recuperação | Aderência usa alvo reduzido aceito. Não classificar tentativa fracassada do original nem conceder progressão original não conquistada; marcar oportunidade não avaliada. |
| Mudança de máquina, assistência, lado, variante ou unidade | Nova condição de comparabilidade/baseline. Sem transferência automática de PR/carga ou diagnóstico de regressão. |
| Deload, retorno ou interrupção | Rebasear próximo estímulo sob regra/contexto atuais; sem volume em dívida ou retorno automático ao último máximo. |

Progressão pode ocorrer no padrão/ciclo sem recorde em toda sessão. Reavaliar resposta e necessidade de mudança com evidência comparável, sem autoadaptação de thresholds por correlação. Após proposta, Orchestrator valida Run × Strength e aplica somente com autoridade/agência vigentes.

## 4. Programming / periodization

`StrengthProgramState` referencia objetivo/cobertura, fase/bloco/mesociclo/microciclo, frequência/divisão, prioridades por padrão/grupo, dose prevista/observada, esforço-alvo, progressão e critérios de transição. Essa projeção pertence ao plano integrado; não é calendário paralelo.

Deve sustentar distribuição de estímulo e recuperação por grupo/padrão, volume/intensidade/frequência e proximidade da falha conforme objetivo/experiência. Métodos lineares, ondulatórios ou outros só entram como receitas aprovadas quando adequados; nenhum método é default obrigatório. Hipertrofia, força máxima e fortalecimento esportivo não recebem automaticamente a mesma prescrição “3×10”.

Deload pode reduzir/redistribuir demanda conforme regra; taper para evento de força ou evento Running exige objetivo/prioridade, retenção/perda de estímulo e coordenação. Não há semana fixa, percentual de 1RM, séries por músculo ou regra universal de falha definidos neste documento. Bloco encerrado não prova adaptação física, recuperação ou prontidão.

Agenda apertada, prova próxima, mudança de equipamento ou sessão extra de corrida podem mudar divisão/ordem/volume; alternativa precisa preservar mínimo de estímulo aprovado e não simplesmente empilhar trabalho no dia seguinte. Se não houver solução que preserve ambos os objetivos, Orchestrator explicita trade-off ou ASK da preferência material.

## 5. Exercise intelligence e banco de exercícios

Banco é repertório versionado de decisões admissíveis, com cobertura/aprovação e limitações; não meta de quantidade como “500+”. Conteúdo técnico/vídeo é asset revisado vinculado ao exercício/versão quando existir; presença de mídia não prova validade da receita ou execução correta da pessoa.

| Metadado decisório | Uso e limite |
|---|---|
| Identidade/variante/equipamento | Restrições, disponibilidade, convenção de carga, incrementos e comparabilidade. Revisão e fonte/aprovação rastreáveis. |
| Padrão de movimento | Agachar, hinge, empurrar/puxar, locomoção ou outros padrões do repertório aprovado; não equivalência automática por pertencer ao mesmo grupo. |
| Músculos/grupos primários e secundários | Propósito e atribuição de exposição/volume por método; evita omissão ou soma sistêmica duplicada. “Efetivo” só por definição validada, sem coeficiente arbitrário. |
| Unilateral/bilateral, lado e estabilidade | Convenção de registro, tempo, exposição lateral e exigência técnica; assimetria observada não é diagnóstico. |
| Amplitude, resistência e exigência técnica | Restrição/aplicabilidade e preservação do estímulo quando definidos; não prescrever correção clínica ou nova técnica para contornar dor. |
| Demanda axial e excêntrica | Categorias/limites aprovados, contexto/novidade e incerteza para comparar alternativas; não escore universal nem medição individual presumida. |
| Custo de fadiga local/sistêmico | Estimativa sustentada por tarefa/dose/esforço/novidade e evidência; não atributo fixo que garante recuperação ou causalidade. |
| Transferência esportiva | Relação hipotética/evidência e contexto de objetivo/demanda Running; distinguir objetivo pretendido de transferência comprovada para este atleta. Força mantém valor intrínseco se for principal. |
| Substituições admissíveis | Relação condicionada a propósito/grupo/padrão, equipamento/experiência, restrições, dose e janela; efeito preservado/perdido e regras/aprovação. Sem fallback universal. |

## 6. Substituição e métodos especiais

Substituir é decisão sobre estímulo e viabilidade: filtrar restrições/cobertura/equipamento, comparar propósito e custo de demanda, recalcular dose/ordem/tempo e revalidar horizonte. Trocar por outro exercício do mesmo músculo não prova equivalência. Menor demanda axial ou excêntrica só justifica alternativa quando sustentada por repertório/policy e contexto; não é garantia de segurança ou solução automática para intervalado amanhã.

Se a alternativa muda exposição/técnica/equipamento, a progressão anterior pode deixar de ser comparável. Conservar relação e estabelecer baseline pelo método aprovado; não zerar histórico nem transportar PR arbitrariamente. Restrição/dor sem alternativa validada produz abstensão escopada, não catálogo de exercícios “seguros”.

Supersets e drop sets são estruturas admissíveis **quando fizerem sentido** para objetivo/experiência/equipamento/tempo e estiverem cobertos por receita. Não são obrigação de uso, lançamento ou tela:

- **Superset:** membros/exercícios, ordem, séries de cada membro, transições, descansos dentro/entre ciclos, término e relação de grupos/demandas explícitos. Mudança de densidade/fadiga e conflito de equipamentos entram na validação conjunta; duas séries pareadas não viram uma série física única ou duplicada.
- **Drop set:** série/segmentos e relação com a série-base, carga/reps/esforço de cada segmento, transições/descanso e critério de término. Não gerar decremento fixo, falha obrigatória ou reps extras por default. Contabilização separa segmentos e método de volume; drop não vira progressão automática.
- **Aquecimento:** série preparatória identificada e separada de trabalho; entra em tempo e exposição pertinente, sem inflar volume efetivo ou PR de trabalho por simples contagem.

Estrutura especial precisa permanecer fiel no payload neutro/app. Se provider não representar a semântica, AEC preflight recusa export dependente; app-first conserva a sessão. Não converter superset/drop set em intervalos genéricos para alegar suporte.

## 7. Strength recovery model

Interpreta ExposureRefs compartilhadas: dose por grupo/padrão, reps/carga/esforço, demanda axial/excêntrica, novidade, unilateral/bilateral, distribuição recente e descanso conhecido; considera corrida realizada/planejada, relato funcional local e contexto geral. Nenhum tempo fixo por músculo ou “músculo verde” dá clearance.

Grupos primários/secundários descrevem sobreposição, não somas independentes de fadiga sistêmica. Um exercício conta uma vez como fato; atribuições locais preservam método/limites SIS-I5. Tonnage não compara diretamente exercícios, máquinas ou amplitude, nem descreve sozinho estímulo/fadiga. Carga maior não implica sessão melhor.

Sinais insuficientes/conflitantes preservam incerteza. Domínio relata viabilidade/opções, sem diagnosticar fadiga central, lesão ou causa de performance. Estado estimado não volta como atividade nova nem cancela sozinho a sessão de corrida. Interference Engine valida relações e Orchestrator decide dentro de HC/policy/prioridade.

## 8. Analytics e PRs a serviço da decisão

Projeções derivadas dos fatos/revisões sustentam volume/frequência por grupo/padrão, carga/reps/esforço por exercício comparável, exposição/densidade, aderência/parcial/unknown, tendência e oportunidades de progressão. Volume externo, séries de trabalho e eventual volume efetivo têm definições/unidades/métodos separados, com cobertura e incerteza; não mostrar um total “científico” sem definição validada.

`StrengthRecordAssessment` distingue recorde observado de carga, reps em carga/configuração, trabalho na tarefa e estimativas de capacidade. PR exige variante/configuração/unidade e critério conhecidos, comparabilidade e fato não duplicado; estimativa de 1RM só se modelo aprovado, rotulada e sem virar teste realizado. Mudança de critério cria revisão, não recordes artificiais em cascata.

PR isolado não determina progressão nem justifica buscar falha/volume. Período sem recorde não prova estagnação. Redução coordenada conserva contexto para interpretar tendência sem tratá-la como queda de capacidade. Aderência é contra revisão executada sob G03; excesso não vale mais. Informação aparece conforme decisão/contexto nos objetos existentes, sem dashboard obrigatório ou score social.

## 9. Critérios para futura implementação

G01 qualifica repertório, perfis/objetivos/equipamentos e receitas; G02 qualifica dose/esforço, progressão/periodização, substituições, atribuição de volume/custo/demanda/transferência e materialidade; G03 comparabilidade/aderência/PR; G04 restrições/retorno; G09 execução/versões; G11 efeitos/claims. Nenhuma fórmula ou regra clínica é preenchida por este documento.

Scenario Lab deve cobrir: força principal com corrida secundária; desempenho comparável versus RIR desconhecido; progressão não conquistada; redução deliberada; troca de equipamento; aquecimento/superset/drop set sem dupla contagem; volume por grupo versus exposição sistêmica; substituição com perda de estímulo; demanda axial/excêntrica e corrida seguinte; PR/estimativa distintos; política ausente e execução parcial. Contratos sintéticos não aprovam qualidade fisiológica, técnica de exercício ou promessa de paridade.
