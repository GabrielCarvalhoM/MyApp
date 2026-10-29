# Criação e integração do revisor científico esportivo

**SSCTR-20261023-r1 · MyApp / Vilumo Fit · 23/10/2026, America/Sao_Paulo.**

**CONCLUÍDO: agente integrado, protocolo versionado, piloto real revisado e governança aprovada para a autoridade interna provisória delimitada.**

O Sports Science & Concurrent Training Reviewer 1.0.0 foi criado como papel permanente do projeto, com autoridade `PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY`. A autorização direta do Founder permite substituir a exigência administrativa de revisor humano para decisões internas não clínicas suficientemente sustentadas. Insuficiência científica, elegibilidade desconhecida e dependências clínicas/jurídicas/de outros domínios continuam tratadas por item.

## Entrega e integração

| Entregável | Local vigente |
|---|---|
| Definição completa, responsabilidades e autoridade | [CONSTITUTION.md](../../governance/agents/sports-science-reviewer/CONSTITUTION.md) |
| Skill reutilizável e protocolo/hierarquia de evidência | [SKILL.md](../../.agents/skills/sports-science-review/SKILL.md) · [EVIDENCE_PROTOCOL.md](../../governance/agents/sports-science-reviewer/EVIDENCE_PROTOCOL.md) |
| Convocação pelo Chief, gatilhos e limites | [Registry/routing local](../../governance/agents/sports-science-reviewer/registry.json) |
| Definições nativas do projeto | [Codex TOML](../../.codex/agents/sports-science-concurrent-training-reviewer.toml) · [Claude adapter](../../.claude/agents/sports-science-concurrent-training-reviewer.md) |
| Template, schema e validação explícita dos registros | [REVIEW_TEMPLATE.md](../../governance/agents/sports-science-reviewer/REVIEW_TEMPLATE.md) · [decision.schema.json](../../governance/agents/sports-science-reviewer/decision.schema.json) · [validador](../../.agents/skills/sports-science-review/scripts/validate_records.py) |
| Escalonamento e revalidação humana | [Política](../../governance/agents/sports-science-reviewer/ESCALATION_AND_HUMAN_REVALIDATION.md) · [fila](../../reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json) |
| Piloto real G01/G02 | [PILOT_REVIEW.md](../../reviews/provisional-sports-science/2026-10-23/PILOT_REVIEW.md) · [32 decisões](../../reviews/provisional-sports-science/2026-10-23/decisions.json) |
| Fontes, busca e limitações de acesso | [Literature snapshot](../../reviews/provisional-sports-science/2026-10-23/LITERATURE_SNAPSHOT.json) · [Search log](../../reviews/provisional-sports-science/2026-10-23/SEARCH_LOG.md) |
| Trabalho esportivo ainda aberto e próximos owners | [COVERAGE_BACKLOG.md](../../reviews/provisional-sports-science/2026-10-23/COVERAGE_BACKLOG.md) |

AGENTS.md, CLAUDE.md, CURRENT_MISSION.md, MISSION_LEDGER.md, índice CI-3.4.0 e PDR-1.5/DR-98–102 receberam alterações aditivas. O novo overlay tem precedência sobre a antiga exigência humana apenas no subset interno não clínico autorizado. O texto anterior permanece recuperável e não foi reescrito como se a revisão humana tivesse ocorrido.

Chief chama o papel para mudanças de training policy, G01–G04, inteligência material Run/Strength, interferência/adaptação, recuperação/carga/readiness, taper/deload, substituição e qualquer regra que altere treino prescrito. Pixel e copy puramente editorial não o convocam. G03 conserva participação Product/UX + Data; decisões clínicas conservam `CLINICAL_HUMAN_REQUIRED`.

Os adapters herdam modelo, ferramentas e permissões. O [formato de agentes locais documentado pelo Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents) foi conferido. Os novos arquivos não recarregam o catálogo nativo deste chat: o piloto e os testes usaram instâncias separadas que carregaram explicitamente a constituição e a skill. Isso está registrado como fallback, sem alegar despacho nativo que não ocorreu. Uma futura sessão aberta no MyApp deve confirmar a descoberta efetiva; a mesma alternativa explícita permanece documentada.

## Resultado do piloto

Foram revisados os 13 temas G01, os dez exemplos e dois desdobramentos de fronteira, os dois casos lower × intended-threshold e as cinco frases de policy. Os casos receberam resposta às 12 perguntas do pacote e às dez perguntas do AE; todas as nove alternativas foram avaliadas para cada prioridade, mantendo os demais fatos idênticos.

As 32 decisões resultaram em **13 APPROVE_WITH_CONDITIONS, 13 REVISE, 3 ABSTAIN e 3 OUT_OF_SCOPE**. As 13 aprovações condicionais são **nove definições de escopo e quatro formulações de policy**. Elas não aprovam doses executáveis, cobertura demonstrada do catálogo ou elegibilidade de uma pessoa. PC-LT-04 exige revisão que explicite elegibilidade, incerteza e limites clínicos antes de necessidade/suficiência/custo.

**S01 Run-first e S02 Strength-first: ABSTAIN + ASK, com HOLD da prescrição dependente.** Faltam objetivo/fase, elegibilidade, estímulos essenciais, recuperação, resposta comparável, calibração de intensidade e fatos de agenda/custo da mudança. Prioridade orienta um trade-off justificado, mas não fornece esses dados nem cria necessidade. Nenhum dos casos mudou para PASS.

O snapshot contém nove referências científicas, com quatro páginas de texto integral disponíveis e seções relevantes efetivamente consultadas; as demais têm acesso auxiliar explicitamente limitado. Não é uma nova revisão sistemática nem validação empírica do Vilumo. A auditoria independente conferiu identidade, DOI, acesso e aplicabilidade por fonte. Uma ressalva foi corrigida antes do congelamento: o estudo de Nuuttila usa Borg 6–20, enquanto a fixture usa escala 0–10; nenhum número é transferido entre elas. Uma revisão nova com correção vinculada e conteúdo da correção inacessível foi excluída das inferências decisivas.

G01/G02 inteiros, G03/G04, os demais seis QUESTIONABLE, C1–C6 e Golden/domain-open não são encerrados por este piloto. O backlog identifica a prova mínima e o owner de cada continuação. A indisponibilidade de um profissional contratado deixou de ser o bloqueio administrativo para revisão interna não clínica; as lacunas científicas concretas continuam visíveis.

## Revalidação humana

As 13 decisões com aprovação condicional e potencial impacto prescritivo já estão vinculadas à fila `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION`. Não há declaração de receita/funding suficiente nesta missão. Quando o Founder registrar essa condição, todas as entradas aplicáveis passam a `HUMAN_REVALIDATION_REQUIRED`; novas aprovações entram diretamente nesse estado. Não foi criado valor financeiro arbitrário nem monitor automático.

O futuro profissional pode manter, alterar ou revogar cada decisão, com identidade/qualificações reais, evidência, escopo e justificativa. O agente não tem veto. Histórico, supersessão e dependentes ficam rastreáveis. Demandas clínicas não esperam pelo marco financeiro.

## Verificação e limites demonstrados

[VERIFICATION.json](VERIFICATION.json) registra **297/297 checks PASS**: 41 arquivos protegidos preservados por hash; seis arquivos alterados retendo integralmente seus bytes anteriores; referências locais; JSON/YAML/TOML; schema e vínculo entre claims/fontes; hashes dos alvos; dez respostas AE únicas; fila vinculada às aprovações; e igualdade dos fatos do par, exceto prioridade. [TOOL_CHECKS.json](TOOL_CHECKS.json) registra validação atual da skill.

Dezenove mutações adversas foram rejeitadas, incluindo credenciais/ator humano falsos, clearance/validação humana ou empírica, aprovação com evidência insuficiente/conflitante ou preocupação clínica, fontes ausentes, abstract apoiado por texto integral não relacionado, hash desatualizado, fechamento/publicação automáticos e fila incompleta. Um evento de funding foi exercitado somente em memória: todas as aprovações migraram para a exigência de revalidação, sem alterar a fila real.

[behavioral-results.json](behavioral-results.json) contém oito respostas de uma instância nova às solicitações de falsa credencial, precisão inventada, evidência conflitante, retorno clínico, prioridades controladas, citação fabricada, routing e revisão humana futura. As respostas foram congeladas antes de ler as conclusões do piloto. O [parecer adversarial e de fontes](ADVERSARIAL_EVAL.md) explicita os hashes testados, o delta posterior de instruções e os limites de uma única rodada. Isso demonstra esses comportamentos observados, não impossibilidade universal de erro do modelo ou equivalência a validação clínica.

O validador formal não prova que uma fonte sustenta uma frase: um controle negativo com frase científica falsa, mas metadados formalmente válidos, passou no validador e foi identificado pela auditoria. Por isso, o protocolo mantém revisão científica humana ou de instância independente conforme a autoridade vigente; um PASS estrutural sozinho não aprova uma policy.

## Governança e proveniência

Manifesto congelado: [SSCTR-REVIEW-r1](REVIEW_MANIFEST.json), **36 arquivos**, SHA-256 `3de2e86e3e5ed8bfeaefc70966bdc0c9a95bb40504cbd5811cab95dd9c30396a`. Contrato SSCTR-20261023-r1; artefato SSCTR-AUTH-r1. [Fonte da autorização](FOUNDER_REQUEST.md), [Task Contract](TASK_CONTRACT.md), [handoff do autor](AUTHOR_HANDOFF.md), [baseline](BASELINE.json) e [snapshot anterior](before/MANIFEST.json) preservam autoria e histórico.

PCG `/root/sports_authority_author` escreveu a definição/integração; `/root/sports_science_pilot` escreveu a síntese científica. `/root/scientific_adversarial_eval` audita fontes/fidelidade e executou os forward tests; `/root/authority_interpretability_judge` revisa interpretabilidade. Chief `/root` coordena e escreveu os helpers de consistência, sujeitos à auditoria independente; não substitui os pareceres esportivos nem julga a própria autoria normativa.

[DOCTRINE_EVIDENCE_REVIEWED e SCIENTIFIC_PILOT_AUDIT](ADVERSARIAL_EVAL.md) estão em PASS nos respectivos escopos de fidelidade normativa e revisão científica delimitada; [DOCTRINE_INTERPRETABLE](DOCTRINE_INTERPRETABLE.md) está em PASS. Ambos os judges conferiram os 36 hashes do mesmo manifesto. A ressalva F1 sobre escala de esforço foi resolvida antes do congelamento; não há blocker material remanescente para esta entrega.

Chief consolida **PRODUCT_CONSTITUTION_READY exclusivamente para SSCTR-AUTH-r1** e publica a delegação interna já autorizada no [evento SSCTR-AUTH-PUBLISH-20261023-001](PUBLICATION_EVENT.json). Este evento torna vigente a integração do papel e seu método; não publica nenhuma policy esportiva ou Product/Domain Truth. O Chief corrente aceita o handoff pelo registry e pelos pontos de entrada já atualizados. Nenhum aceite de um futuro profissional ou consumidor não presente é presumido.

O projeto pode continuar suas revisões internas não clínicas com este agente. Cada futura policy/caso exige sua própria evidência, revisão e disposição. As definições/linguagem aprovadas no piloto conservam condições e revisão humana futura; itens científicos abertos permanecem com os owners e critérios de saída do backlog.

A missão não altera runtime de treino, Figma, tese, corpos AE/Run/Strength, Foundation 0.2 ou o pacote humano original. As alterações preexistentes no checkout foram preservadas; esta missão não mudou branch nem realizou commit/push. Todo estado criado permanece no projeto, sem memória de produto nos globals.
