# Revisão independente — product safety e consistência de evidência

Revisão SAFETY-r1 · 2026-10-22 America/Sao_Paulo · avaliador `/root/safety_review`, instância independente da autoria dos resultados/dashboard · Security, Privacy & Abuse Architect 1.1.0 · skill verify-domain-gate 1.3.0 · rubrica SECURITY 1.1.0. Destinatário: `/root`.

**Escopo:** auditar o corpus e os limites de interpretação de segurança, autoridade, incerteza, confiança, agência e privacidade. Esta revisão não concede aprovação profissional de treinamento, clínica, jurídica, técnica ou de exposição a atletas. Não executou runtime. Nenhuma fonte canônica foi alterada. Ferramentas locais de leitura/escrita disponíveis; modelo e permissões herdados da sessão, sem escolha ou ampliação pelo especialista.

**Estado desta revisão:** `REQUEST_CHANGES` para conclusões que tratem a conformidade sintética como segurança/eficácia fisiológica ou que adotem automaticamente oráculos antigos de mudança. `SECURITY_READY_WITH_CONDITIONS` somente para prosseguir com o relatório documental, sob as condições abaixo. O draft dos resultados e da dashboard ainda não foi submetido a este avaliador; não há aprovação antecipada desses artefatos.

## Baseline e contrato da revisão

O pedido direto atual do usuário autoriza validação documental e artefatos na sessão. A missão anterior limita implementação/Figma e não torna os relatórios antigos autoridade de resultado atual. Entradas lidas: AGENTS, CURRENT_MISSION, filtro vigente do Canonical Index, AEC-1.3, AEOS-1.2-r2, AESL-1.2-r2, SIS-1.1-r2 e apenas PDR §5/DR-91 pertinentes. O filtro mantém controle, ciência, safety e privacy como domínio ativo; a arquitetura visual antiga não é critério.

Corpus confirmado por contagem das linhas de matriz do Lab: **47 S + 14 SIL + 7 TD + 12 FZ = 80 cenários; 9 Q = 9 sequências**. Cabeçalho histórico de 47/9 na linha 208 não inclui as extensões §§9–10; não constitui inventário atual completo.

Hashes SHA-256 dos inputs:

| Fonte | SHA-256 |
|---|---|
| product/ADAPTIVE_ENGINE_SCENARIO_LAB.md | `196309752ed75cc1d002595ad78dfb169bfaa94ffcd179f746dcca93356c25bf` |
| product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md | `56534c1bbe80c9b805ef3d7f94c63d0dced293ae79ffd0220c5fb1315744a610` |
| product/ADAPTIVE_ENGINE_CONTRACT.md | `3746823201b62144d6d4ac106647609a3509412627cb758b0a10e7a95f56ab37` |
| product/SPORT_INTELLIGENCE_SPEC.md | `1c7290f99063d1d1914fb563df029ee00724f96c54196721b71dfa0b5994a312` |
| canon/CANONICAL_INDEX.md | `6adbe0cdf921bd6fadc7f360bd904597e434c27bbff971f833feb7c05a61f3b2` |

## Achados priorizados

### SAFE-01 — P1 / bloqueia claim de segurança ou prontidão prescritiva

**IDs afetados:** todo o corpus; particularmente S01–07, S09–14, S28, SIL-S04/05/09/10/14, TD-S03/06 e FZ-S03/06/09.

**Evidência:** Lab:14,31–39,163,168,176 e 212; AEOS:220–232 e 382–401. Perfis simulam aprovação exclusivamente para teste. Validade de dose, intenção, safety e aderência precisa gold de profissional competente; sua ausência é `NOT_EVALUABLE_DOMAIN`. Confiança é por decisão/comparação/escopo, separada de segurança e sucesso fisiológico.

**Risco concreto:** converter uma recomendação derivável por regra sintética em "a decisão é segura/um excelente treinador a tomaria" ou apresentar zero DANGEROUS como taxa zero de risco humano. Os dados não sustentam essa inferência. Uma LLM independente pode desafiar lógica, mas não preenche aprovação profissional ausente.

**Correção mínima requerida:** manter a classificação principal exigida pelo usuário, acompanhada de um campo independente `domain_evidence_status=NOT_EVALUABLE_DOMAIN` quando aplicável. Na dimensão A, identificar explicitamente "safety de controle/autoridade", sem PASS clínico. Nomear confiança como confiança na derivação documental; não usar percentuais de segurança. Exibir denominadores, limitações e a distinção no overview e nos detalhes; um rodapé isolado é insuficiente se os cards comunicarem aprovação de treino. Readiness precisa declarar se se refere a contratos sintéticos ou prescrição real.

**Owner/trigger:** autor dos resultados/dashboard antes do fechamento; autoridade profissional G01–G04/G11 antes de prescrição/claims dependentes. Resolução verificável: inspecionar overview, campos por caso, relatório e Golden Set sem equivalência sintético→humano.

### SAFE-02 — P1 / oráculos de mudança anteriores não provam a política atual

**IDs exemplares:** S01/02/05/12/13/14; SIL-S01/09 e demais casos antigos que exijam mudança. Afeta cada Q que herda essas propostas enquanto decisão já válida.

**Evidência:** Lab:249 manda migrar expected de mudança S01–47/SIL-S01–14 para `adequacy/necessity/ChangeCostRule` explícitos e razão de KEEP insuficiente; sem isso, cenário incompleto/NOT_EVALUABLE para a nova política. AEOS:181–194 exige adequação, fato material, benefício após custo, comparação da menor intervenção e só então B1–B6. F-CROSS Lab:47–55 rejeita KEEP por R-CROSS sintética, mas não fecha micro/volume, benefício após custo ou custo do plano já escolhido.

**Risco concreto:** aprovar MOVE/REDUCE apenas porque era o expected histórico contorna a propriedade stable-by-default que a missão pretende testar; trocar por KEEP automaticamente também inventaria adequação.

**Correção mínima requerida:** registrar ausência/ambiguidade por caso como fragilidade do oráculo, com campos de necessidade/custo `NOT_SPECIFIED` ou equivalentes e confiança reduzida. Não preencher uma autoridade ausente com julgamento narrativo. A classificação QUESTIONABLE pode representar essa incompletude, sem chamar a decisão fisiologicamente errada. Um Golden de mudança exige posteriormente fechar a fixture em revisão nova; Golden com pendência deve ser marcado candidato, não pronto para execução exata.

**Owner/trigger:** owner AEOS/Lab para fixture migrada antes de usar como golden assertivo de B0; autor do relatório antes do fechamento para honestidade do estado atual. A revisão não altera as fontes para fazer o teste passar.

### SAFE-03 — P2 / as nove sequências não demonstram estabilidade esportiva ao longo de dias

**IDs:** Q01–Q09; cobertura de recuperação, sobrecarga e retorno acumulados.

**Evidência:** Lab:147–155 contém concorrência, atraso/duplicata, export/hold, jitter/recusa, finalidade, falha remota, replay pós-aplicação e revogação/commit. Q04 testa jitter da mesma evidência, não mudança de estado de treinamento por dias sucessivos. F-SIGNALS Lab:59–61 testa uma comparação isolada. AEOS:349–353 preserva observações/hipóteses, mas não cria uma trajetória com gold de recuperação.

**Risco concreto:** todos os Q passarem e o relatório afirmar que o motor não acumula recovery debt, não destrói uma semana ou retorna corretamente após overreach. Esses outcomes não foram exercitados por eventos do corpus atual.

**Correção mínima requerida:** cobertura `GAP` para trajetória esportiva com observações novas e decisões sucessivas, separada de cobertura `COVERED` para estabilidade/concorrência semântica. Propor no máximo uma sequência focada, por exemplo semana híbrida que inclua fadiga local material, sessão perdida confirmada e posterior melhora/continuação, mantendo hipóteses e resposta incertas. Não fabricar recuperação/dose; os marcos/invariantes podem ser definidos agora e o gold de domínio aguardar G02/G04. Não contar a proposta como sequência existente validada.

**Owner/trigger:** owner Lab + autoridade de treino antes de afirmar estabilidade esportiva longitudinal ou usar essa capacidade como gate de runtime prescritivo. O gap não impede verificar os nove Q existentes.

### SAFE-04 — P2 / granularidade de intervenção não está fechada para todos os exemplos pedidos

**IDs:** FZ-S03, SIL-S09, S09/S28, FZ-S09; Golden Scenario Set.

**Evidência:** AEOS:192 define níveis 0–6 como graus conceituais, não ordenação cega. FZ-S03 Lab:255 permite micro/volume, mas não define qual delta é suficiente em cada variante; SIL-S09 Lab:224 requer substituição coberta sem fechar escolha; S09 Lab:139 declara ausência de REPLAN exato; retorno S28 Lab:118 é condicionado a receita. Plano inicial FZ-S09 não é prova de replanning significativo de plano existente.

**Risco concreto:** preencher o Golden Set com Level 1/4/5/6 exatos inventados para satisfazer a lista do pedido. `HOLD` e `ASK` também não são níveis prescritivos da escala.

**Correção mínima requerida:** marcar níveis indeterminados com razão; distinguir `required/exercised`, `specified conditional` e `golden-ready`. Não classificar INITIAL como Level 6 significativo apenas porque sua action_class é REPLAN. Falta de um exemplo exato de cada ação não autoriza fabricar dose nem abrir dezenas de cenários. Priorizar os exemplos relevantes ao gate; candidatos adicionais precisam justificativa de cobertura.

**Owner/trigger:** autor Golden Set no relatório; owner AEOS/Lab + profissional antes de fixture executável que exija delta exato.

### SAFE-05 — P3 / interpretar FZ-S11 sob a autoridade vigente de compartilhamento

**ID:** FZ-S11.

**Evidência:** Lab:263 usa "sem health/route/terceiro/metadata oculto". Canonical Index filtro A/B/C remete DR-91; PDR:201 permite traçado próprio somente por escolha explícita por artefato, com limites. A qualificação atual supera exclusões absolutas anteriores.

**Risco concreto:** transformar a linha curta do cenário em nova proibição absoluta, ou no inverso usar DR-91 como consentimento automático. Nenhum dos dois é permitido.

**Correção mínima requerida:** avaliar FZ-S11 pela ausência de dados ocultos/não escolhidos; assinalar supersessão de qualquer leitura absoluta de route. Não adicionar teste de feature/fluxo de rota nesta missão. Consentimento, processamento local e exposição real permanecem no gate específico futuro.

**Owner/trigger:** autor da classificação e owner Lab quando atualizar redação. É nota de autoridade, não blocker da lógica de treinamento.

## Controles desafiados sem contradição material encontrada

| Critério | Resultado documental | Evidência e limite |
|---|---|---|
| HOLD não certifica inaptidão nem bloqueia conta inteira | PASS de especificação | AEC:246–259; AEOS:171; S07/S26/S27/S33/FZ-S08. Causa/escopo/owner/evidência de saída obrigatórios; KEEP/REST não são fallback seguro universal. Não foi testado em runtime. |
| Preferência desconhecida e recusa | PASS de especificação | S03, S15, FZ-S07; AEC:48–50 e AEOS:103–110/336. ASK mínimo admite recusa; não pedir ao atleta aprovação profissional; procurar alternativa dentro de agência sem reoferta com novo ID. |
| Restrição vence prioridade e estabilidade | PASS de especificação | S07/S33/S42/FZ-S08, AEOS:105/162/185. HRV favorável, cooldown e checkbox não liberam. Não há limiar clínico validado no corpus. |
| JEV shadow não emite ações | PASS de especificação | S34–38/S43 e AEOS:271–277. Rotas/flags shadow não alteram oficial; gate determinístico continua independente. Uma alta confiança B0/JEV não fecha os slots profissionais. |
| Explicação fiel ao oficial | PASS de especificação | S38/S44, TD-S07; AEOS:357–370. Texto causal/número/fonte inventados ou omissão material rejeitados; template autorizado. Nenhuma explicação produz consentimento/clearance. |
| Minimização, revogação, erasure e propósito | PASS de especificação | S21/S23/S31/S39/S40; Q05/Q08/Q09; AEOS:238/283/300 e 345–347. Pseudônimo não anonimiza; prova operacional/legal permanece G07/G09. |
| Cross-account e corrida de autoridade | PASS de especificação | S24/S45/S46/Q09, AEOS:160 e §13.1. Invariantes cobrem negativa e ordem de commit; nenhuma operação foi executada. |

Não foi identificada nesta inspeção uma instrução documental que obrigue a recomendar treino contra HOLD explícito, contornar recusa ou aceitar JEV como soberano. Isso sustenta coerência dos controles; não prova ausência de risco fisiológico.

## Condições para o fechamento do relatório

1. O autor do relatório resolve SAFE-01/02/04 nos próprios artefatos, preservando os limites e os casos questionáveis. Owner `/root`; prazo: antes da entrega final; evidência: draft de dados/dashboard/resumo submetido e reinspecionado.
2. SAFE-03 aparece como gap real, sem promover nova proposta a corpus validado. Owner `/root` e owner Lab futuro; trigger: conclusão sobre estabilidade longitudinal de treinamento.
3. SAFE-05 recebe interpretação coerente com o filtro atual. Owner `/root`; trigger: linha FZ-S11 e claims de privacidade da dashboard.
4. G01–G04/G07/G09/G11 continuam abertos nas etapas dependentes. Owner conforme PDR §5; trigger: prescrição, dados reais, efeito externo ou claim. Nenhum parecer desta revisão substitui essas provas.

**Próxima ação:** receber draft exato de resultados/relatório/dashboard para revisão independente das conclusões. Alteração material dos inputs acima invalida apenas as conclusões dependentes. O estado `SECURITY_READY_WITH_CONDITIONS` autoriza apenas continuação documental delimitada; não é readiness de implementação prescritiva, runtime ou release.

## Adendo — revisão independente do draft AE-DOC-20261022-r1

Revisão SAFETY-r2 · 2026-10-22 · input `outputs/validation-data.json`, SHA-256 **`2e47bac5a2ede1add4f3bfb12d3a95afa3f10d8d079b3b9ba26c63a7a8742724`**. Este adendo não substitui nem altera o input avaliado. Dashboard, coverage e Golden ainda não estavam neste JSON nem foram aprovados antecipadamente.

**Veredito do draft: REQUEST_CHANGES**, limitado aos dois defeitos de artefato D01/D02 abaixo. Não identifiquei recomendação prescritiva perigosa concreta, dose inventada, probabilidade fictícia de segurança ou autorização concedida por JEV nas decisões dos 89 registros. A coerência dos controles pode ser aceita documentalmente depois das correções; domínio fisiológico permanece não avaliado. **NO-GO para runtime prescritivo como autoridade de treino** é conclusão sustentada pelos inputs. **GO WITH FIXES para infraestrutura neutra/fixtures** é compatível com PDR G01/G09, condicionado a missão futura autorizada; não constitui autorização de implementação atual.

### Verificação objetiva e alcance do julgamento

Inspecionei decisões, preserve/modify, níveis, trade-offs, classificações, justificativas, confiança, domínio, ação da pessoa e campos de proibição dos 89 registros. Conferi presença e distribuição das dez dimensões (890 células), aprofundando os critérios e justificativas de safety, agência e limites da explicação/recuperação pertinentes ao meu domínio. O parecer não substitui o reviewer de lógica esportiva nas demais dimensões.

- Inventário: 80 cenários e 9 sequências, todos com dez dimensões. Cenários: 54 PASS, 17 ACCEPTABLE, 9 QUESTIONABLE. Sequências: 7 PASS, 2 ACCEPTABLE. Total: 61 PASS, 19 ACCEPTABLE, 9 QUESTIONABLE. São rótulos de revisão documental; não são observações de atletas nem taxa de segurança humana.
- `domain_status`: 44 `NOT_EVALUABLE_DOMAIN`; 45 `NOT_TESTED_DOMAIN` de controle/representação. Nenhum contém gold profissional ou prova de eficácia.
- Safety: 48 PASS de **controle documental**, todos explicitamente delimitados nas justificativas; 41 N/E. O agregado não pode virar "100% seguro" nem "0% risco".
- Agência: 39 PASS e 50 N/E. Não há caso que permita checkbox/aceite pessoal liberar restrição, autorização expirada ou perda de representação.
- Confiança ordinal refere-se à derivação, com limites; não encontrei número clínico fictício. Causalidade e false precision foram evitadas nas decisões. A ressalva fisiológica aparece no campo de domínio e nas justificativas, mas sua visibilidade na dashboard ainda precisa ser comprovada.

### D01 — P2 / campo must_not incorpora resultados obrigatórios como proibições

**Evidência:** em **89/89** registros, `must_not` começa com o texto completo de `source_oracle`. Exemplos no JSON: S01 linha 56 contém "B0 RECOMMEND C-A, CONFIRM"; S04 linha 385 contém "RECOMMEND KEEP"; S07 linha 712 contém "HOLD do escopo dependente". A mesma estrutura afeta Q e as extensões.

**Impacto:** um leitor ou consumidor do Golden Set pode entender a ação correta como proibida. O bruto positivo já está preservado em `source_oracle`; copiá-lo para `must_not` cria contradição artificial e torna o campo inadequado para teste futuro.

**Correção requerida antes da entrega:** conservar o texto bruto somente em `source_oracle`; preencher `must_not` com violações efetivamente proibidas por cada caso, separadas de required/allowed outcomes. Exemplo S07: liberar por HRV/override, recomendar KEEP/REST/SUBSTITUTE que suponha clearance, diagnosticar ou aplicar nova prescrição dependente. Exemplo S01: aplicar MOVE antes de necessidade/custo/menores opções sustentados, remover a sessão-chave de corrida sem trade-off autorizado ou aplicar sem aceite. Não inverter a correção para proibir todo MOVE ou todo HOLD. O autor corrige os dados; este reviewer não os altera.

**Owner/trigger/evidência de resolução:** `/root`, antes de materializar dashboard/Golden; novo hash do JSON e inspeção dos campos sem positivos obrigatórios sob proibição.

### D02 — P2 / ação genérica de aprendizagem omite finalidade e opt-in

**Evidência:** em **50/89** registros, `user_action` é "Sem aceite para aprender/ler/manter; confirmar separadamente qualquer efeito material futuro." Exemplos S04 linha 388, S06 linha 607 e TD-S02/FZ-S01. As decisões próprias de S39/Q05 preservam propósito secundário corretamente, mas a frase genérica pode ser lida isoladamente no detalhe do caso.

**Impacto:** a frase pode estender a ausência de novo aceite de plano a toda aprendizagem, inclusive personalização longitudinal secundária, contrariando AEOS:345–347 e AEC:40. Não se trata de exigir confirmação a cada atualização primária; trata-se de não apagar a fronteira de finalidade no resumo operacional.

**Correção mínima requerida:** qualificar atualização como uso primário pertinente, sob finalidade/base já válidas, que não exige aceite de mudança de plano; aprendizado secundário somente com opt-in vigente. Para casos sem aprendizagem, usar ação específica (por exemplo acompanhar estado de export, corrigir fato se necessário, nenhuma ação automática), evitando "aprender" como texto universal. Não acrescentar coleta ou novo fluxo de consentimento.

**Owner/trigger/evidência de resolução:** `/root`, antes da entrega; novo hash e inspeção das ações e justificativas de agência que referenciam esse texto.

### Reavaliação dos achados r1 no draft

| Achado | Disposição para este JSON | Evidência/limite |
|---|---|---|
| SAFE-01 limites de domínio/segurança | ACCEPT no nível de dados | Campos scope/readiness/domain/confidence e todas as justificativas de safety PASS delimitam controle. Cards/gráficos finais ainda precisam manter o limite visível. |
| SAFE-02 migração dos oráculos de mudança | ACCEPT como achado registrado | S01/02/05/12/13/14/S28/S29 estão QUESTIONABLE, com bloqueio/condicional de mudança e fix. Não inventaram KEEP adequado. Os fixes canônicos continuam abertos. |
| SAFE-03 trajetória de vários dias | PARCIAL / aguarda coverage final | Q02/Q04 e demais Q não alegam dívida de recuperação modelada. JSON não contém coverage matrix; gap ainda deve aparecer nela e no resumo executivo. |
| SAFE-04 níveis e Golden | ACCEPT no nível de dados; Golden pendente | Levels de FZ-S03/SIL-S09/S09/S28 são condicionais/indeterminados; FZ-S09 diz INITIAL fora da escala, sem equiparar a Level 6. Não há Golden pronto no draft recebido. |
| SAFE-05 FZ-S11/DR-91 | ACCEPT com ressalva editorial | A decisão aplica escolha/trim sem autopost e trata metadata oculta. Rationale "oracle proíbe genericamente" deve ser entendida como leitura possível da redação comprimida, não nova conclusão de conflito absoluto que a própria frase já qualificada resolva. |

**HOLD/ASK desafiados:** S01/02/05/12 retêm a **mudança incompleta**, sem declarar a pessoa inapta ou KEEP antigo seguro; isto é coerente com AEOS:191 e Lab:249. S03 aceita REFUSED/UNKNOWN sem insistência. S08/S25 não tornam outage/opcional ausente HOLD médico. S07/S26/S27/S33/S42 e FZ-S08 conservam causas/escopos/owners de controle. S29 exige fato material pós-início, preserva executado e não usa o próprio início como autorização. S35/S43 mantêm shadow sem canal de veto/clearance. Não há motivo documental para forçar uma classe DANGEROUS só porque domínio clínico não foi avaliado.

**Próxima ação:** corrigir D01/D02 e submeter novo hash; concluir visibilidade de limites/coverage/Golden nos artefatos finais. Risco residual: mecanismo, política profissional e experiência humana ainda não foram executados/validados. Este parecer continua independente e condicionado, sem aprovação técnica/prescritiva/release.
