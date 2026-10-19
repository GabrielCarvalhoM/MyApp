# Product/UX consistency — rebaseline 3.0.0, r1

**Veredito: FAIL documental, correção localizada requerida.** Ownership, hierarquia, escopo e jornadas principais são coerentes. CF F04 contém uma regra de recuperação ambígua sobre a independência das permissões wearable; UXRB-01 impede fechar a consistência cruzada dos estados/efeitos de revogação. UXRB-02 e UXRB-03 são ajustes não bloqueantes. Não há mudança estratégica requerida nem DOCTRINE_BLOCKED.

Este parecer não emite VISUAL_READY, UX_SPEC_READY, UI_READY, aprovação visual, segurança executável, eficácia, engenharia pronta ou release readiness. Sua finalidade é o gate documental autorizado nesta missão. Nenhum artefato avaliado foi editado pelo judge.

| Campo | Valor |
|---|---|
| task_id / contract_revision | RB-3.0.0 / RB-3.0.0-r1 |
| Data | 2026-10-14, America/Sao_Paulo |
| Evaluator / modo | Codex `/root/ux_judge`, **independent**, mesma instância fresca do estágio normativo |
| Agent / versão | Product/UX Architect 1.2.0; modelo/effort herdados, sem override por papel |
| Skills | verify-product-architecture 1.0.0; verify-before-completion 1.3.0 |
| Rubrica | PRODUCT_ARCHITECTURE 1.0.0, extensão 1.2.0; critérios de consistência documental desta missão |
| Autores | Product/UX worker `architecture_rebaseline` (seis consumidores); PCG worker `pcg_rebaseline` (tese/mapa); Chief (PDR/missão/índice) |
| Independência | Judge distinto dos autores e Chief, sem coautoria ou edição; escrita limitada a audits atribuídos |
| Escopo | PDM/PA/RS/AEC/EM/CF, consumo da tese/mapa, PDR atual §1–6, CURRENT_MISSION e Canonical Index |
| Preconditions | Stage1 DOCTRINE_INTERPRETABLE PASS da mesma PTC/PTM; PRE_REVIEW_VERIFICATION atual: **248/248 PASS**, 0 fails. Os 11 hashes foram conferidos contra arquivos presentes. |

## Revisões/hashes efetivamente consumidos

| Artefato | Revisão | SHA-256 |
|---|---|---|
| `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` | VILUMO-PTC-3.0.0 | `acc97432ed3dff327a35d632cd5f93fac51080523cedbd52c0790fb347140b8f` |
| `product/PRODUCT_TRUTH_MAP.md` | PTM-1.0 | `04b083461b72eaadeb4e46ed9d78d0fc100d1263e7ba1523641ab004a25dac0f` |
| `product/PRODUCT_DOMAIN_MODEL.md` | PDM-1.0 | `5e40eaca70377307cbc48474160b5597b802bdcc69e7bb373cf2fbc1f0d549da` |
| `product/PRODUCT_ARCHITECTURE.md` | PA-1.0 | `ded74f1bfa972f3a0a360a1b77f466c96e2fb84350070c9ca9285e14e170383c` |
| `product/V1_RELEASE_SCOPE.md` | RS-1.0 | `f994868f06929f3b36270758a958ff61ef65837b06524dc7bfde0b1da18fe070` |
| `product/ADAPTIVE_ENGINE_CONTRACT.md` | AEC-1.0 | `51a82c8a23a9bb4352f994b120e4df0618b8cf35f279359713568a4b533413ed` |
| `product/EXPERIENCE_MODEL.md` | EM-1.0 | `5d1dec26da2a296b275ca20d68f681f02e81cb851e2c8e7c67c5b2db5d5a0dbb` |
| `product/CORE_FLOWS.md` | CF-1.0 | `afb4faf9572a99ee7b6899e6f6999de65dcfc64bf7413f067d6f08fff6a83eb6` |
| `product/PRODUCT_DECISION_REGISTER.md` | PDR-1.0, inclui DR-65 | `0730a6bc59787abac809490a7ce333e0132e73650feccfb809ee631fd837a422` |
| `CURRENT_MISSION.md` | MISSION-RB-1.0 | `ce8f3d7b1841b6b705ec59eb6006af32a47750b9a037966931468821ec1cb640` |
| `canon/CANONICAL_INDEX.md` | CI-3.0.0 | `ab3a1bc8e5cdfd9be7a0297aa65bd1c8c6e9dd4e9a2d09664282a583b6e91745` |

Prova objetiva complementar: `PRE_REVIEW_VERIFICATION.json` SHA-256 `aa2297547feacb4b26b8be331e48377f90002bdb4e0b5417a584f3b74e6168a3`, contendo 248 resultados PASS e hashes correspondentes. Stage1: `DOCTRINE_INTERPRETABLE_r1.md` SHA-256 `fbd57a189c736a364918be17c13e84d777a12df7c4c1b768610efbb56d5e4003`.

Inspeção: seis documentos estruturais integrais; PTC/PTM integrais no Stage1; PDR somente seção vigente §1–6 e separação do bloco histórico; missão/índice vigentes. Fontes Founder brutas e políticas/rubricas já registradas no Stage1. A inspeção dos hashes foi executada por Get-FileHash contra o manifesto do precheck; nenhum review recebeu conclusão esperada. Checks de links/IDs/histórico não comprovam semântica, eficácia, APIs ou controles reais.

## Architecture Eval por critério

| Critério | Resultado | Evidência / limite |
|---|---|---|
| Necessidade/outcome | **PASS documental** | PA§1, RS§1–§4 e AEC§1 respondem à coordenação Run × Strength decidida pelo Founder. Demanda, eficácia e diferencial percebido permanecem H/O; não se afirma validação empírica. Scope impede que tracker raso em Strength cumpra a promessa. |
| Canonical ownership | **PASS** | PDM§3–§4 separa atleta/contexto, decisão/plano, estrutura de modalidade, realizado/observação e export. PA§3 define destino canônico de cada objeto e múltiplas entradas sem cópia. Hoje e agente não possuem plano próprio; repetir histórico prepara nova sessão. |
| Arquitetura/navegação | **PASS documental** | PA§2–§5: referências lógicas Hoje/Plano/Progresso/Crews/Você, sem obrigação de cinco abas. Recovery/Nutrition integram contexto/preparação; export aponta a sessão/revisão. Caminhos diretos e profundidade permanecem descobríveis sem criar hub por esporte ou Nutrition/Watch autônomos. Layout/rótulo visual final permanecem fora desta missão. |
| Jornada | **PASS documental** | CF F01–F10, EM§2–§5 e PDM§5: entrada solo/social leve, decisão, execução/registro, fechamento, correção, interrupção e retorno com estado preservado. M3 não ganha adequação fisiológica fictícia; M1 não recebe falta de Crew como pendência. As exceções de permissões F04 são julgadas no critério Estados abaixo. |
| Hierarquia | **PASS** | PA§4 explicita precedência de segurança material, sessão ativa/registro, decisão/preparação/transporte relevante, readaptação, social opcional e reflexão. Conflito P0 resolvido: risco material prevalece sem apagar registros; avisos de plano não substituem treino iniciado silenciosamente. |
| Estados/transições/recuperação | **FAIL — UXRB-01** | PDM§5, AEC§3–§5 e EM§5 definem vazio, dados insuficientes, versões, offline, export, duplicata/correção e retorno de forma coerente. Porém CF F04 Recuperação agrupa “desconectar/revogar” sob “interrompe novos reads/writes”, permitindo efeito diferente do consentimento separado e da preservação de read em EM§5/CF S07. UI/implementação não devem resolver essa contradição por conveniência. |
| Terminologia/invariantes | **PASS, com ajustes não bloqueantes UXRB-02/03** | L002 superado; Run/Strength first-class, Engine núcleo, Nutrition insights e Crew Lite estão consistentemente traduzidos. L010/C041 concretizados em compromisso/período comum e apoio privado qualitativo, sem afirmar cumprimento de todos nem somar carga. O intervalo do PDR em RS§6 e a palavra recovery em CF F10 precisam clareza editorial. |
| Alternativas/prova | **PASS proporcional** | PDM§8 e PA§8 comparam plano integrado/objetos específicos vs planos por modalidade/tracker genérico, fronteiras proporcionais vs framework antecipado, preparação vs módulo Nutrition, private check-in vs dashboard coletivo e coletivo externo futuro vs preservação insegura/apagamento. S01–S12 testam consequências. Direção estratégica veio do Founder; não cabe reabrir a V1 por ritual. Prova analítica suficiente para este outcome documental, sem protótipo visual ou usability claim. |
| Handoff | **FAIL para fechamento; recuperação definida** | PA§10/EM§7/CF§12, Scope§6 e índice identificam producer/consumer/revisões/restrições/gates e abertos. Autoria não se autoaprova; publicação/aceite ainda pendentes. UXRB-01 exige correção e re-review sobre hashes novos antes do handoff final. Não há lacuna estratégica nova; owners de parâmetros/Safety/integração/retention já estão nomeados por função/trigger. |

## Cenários e contraprovas cruzadas

| Cenário | Evidência / resultado observado na documentação | Julgamento |
|---|---|---|
| S01 — solo sem wearable/Crew/agente | CF F01–F03/F07; EM§2; RS§1. Valor completo com confiança honesta e controles diretos; Share opcional. | PASS |
| S02 — longão próximo de força | AEC§6, CF F02/F06. Coordenação conjunta, efeitos nas duas modalidades e alternativas sob policy futura; não duas prescrições concorrentes. | PASS |
| S03/S04 — Strength→Run e Run tardio→Strength | CF F03/F05/F06 e AEC§4 distinguem observado/recebido, preservam decisão histórica e recalculam futuro. Correção não duplica carga. | PASS documental |
| S05 — descanso com compromisso | PDM§5, CF F07/F09, EM§6. Honrado quando confirmado/compatível; ausente é desconhecido. Check-in voluntário mínimo não revela motivo. Mais volume não ganha mais mérito; nenhum score/ponto é imposto. | PASS |
| S06 — demanda muda e insight/export antigos | PDM§4–§5, AEC§5–§6, CF F02/F04/F06. Insight obsoleto reavaliado; pendente invalidado; cópia enviada antiga explicitada até prova de update/cancel. | PASS |
| S07 — read autorizado, write recusado/não suportado | EM§5 e CF S07 preservam leitura e execução no app; CF F04 Recuperação permite cessar ambos por revogação sem qualificar escopo. | **FAIL localizado UXRB-01** |
| S08 — mesma atividade manual + integração + correção | PDM I3/W1/W3, AEC§4, CF F05. Um fato ou associação pendente explícita; nenhum match ou precisão inventados. | PASS |
| S09 — interrupção/retorno com Crew | PDM§3/§5, EM§4 e CF F07. Interrupção pessoal e vínculo pausado independentes; contexto atual; sem compensação/streak; não retoma Crew automaticamente. | PASS |
| S10 — forwarded invite, inelegível/cheia/limite | PDM§2/§5, PA AR-12/13, CF F08. Até 3 vínculos Ativos/Pausados e cerca de 8; confirmation do inviter; pendente sem acesso; resultados neutros, controles técnicos futuros explícitos. | PASS documental |
| S11 — M3, apoio e progresso coletivo | PDM§3/I4, PA AR-10/11, EM§6, CF F09 e DR-65. Intenção/check-in autodeclarados sem validação fisiológica; gesto privado; reconhecimento comum temporal qualitativo sem cumprimento de todos/contagem/ausência. | PASS |
| S12 — share próprio ou convite vs dados de terceiros | PA§7/PDM I7–I9/CF F10 separam cópia escolhida de fonte viva, preservam consentimento, diferem coletivo externo e não prometem recall. A redação recovery deve qualificar sinais/contexto para não sugerir retirar o próprio desfecho genérico. | PASS com UXRB-03 editorial |
| Versão mudou enquanto proposta é preparada | AEC§3/§7, EM§3, CF F02/F06 invalidam proposta antiga e mantêm estado único nos caminhos manual/agente. Nenhum envio/social por recálculo. | PASS |
| Esporte fora da V1 ingerido | PDM§6, AEC§2, RS§3, CF F05. Contexto interpretável/confiança não criam prescrição/analytics ou obrigação de Cycling/Swimming. | PASS |
| Navigation contextual após retomada | PA AR-01/02/03, EM§4. Hoje seleciona objetos, referências não mudam por personalização, back preserva tarefa/registro, histórico não reaplica prescrição passada. | PASS documental |
| Documentos viram suposta prova de produto pronto | Todos os seis cabeçalhos, PA§9/self e Scope§4–§6 explicitam estágio. Questões reais precedem implementação/claim; doctrine_audit não substitui evidência empírica. | PASS |

## Findings e resolução requerida

### UXRB-01 — Revogação wearable com efeito de escopo ambíguo

- **Prioridade:** correção requerida para Estados/CROSS_DOCUMENT_CONSISTENCY; pequena, não estratégica.
- **Critério:** transições e efeitos da permissão claros, sem caminho contraditório; PTC L014/C040, PDM I6 e AEC§5.1.
- **Evidência A:** CF F04 Recuperação: “desconectar/revogar interrompe novos reads/writes e pendências não autorizadas”.
- **Evidência B:** EM§5: “Recusar write não desconecta read automaticamente”; CF S07: “read consent pode seguir”; AEC§5.1 separa ingestão/envio.
- **Impacto:** dois leitores podem implementar o ato de revogar somente o envio com efeitos diferentes na leitura, interrompendo Observe silenciosamente ou conservando-o. O consentimento independente e o fallback precisam da mesma regra em todos os caminhos.
- **Owner:** Product/UX worker; Security/Engineering julgam suas fronteiras/provas separadamente.
- **Resolução:** **CORRECT**: distinguir desconexão completa de revogação apenas da finalidade/capacidade afetada; interromper somente operações/pendências cuja autorização cessou e preservar permissões independentes válidas. Não ampliar autonomia ou promessa de remoção externa.
- **Prova r2:** read-only consent persiste após revogar write; write-only consent cessa após revogar write; desconexão completa cessa ambos; pendências não autorizadas invalidadas; app/history/cópias remotas mantêm limites explícitos.

### UXRB-02 — Intervalo de decisões incompleto no Scope

- **Prioridade:** não bloqueante, editorial de traceability.
- **Critério:** versões/decisões e autoridade rastreáveis.
- **Evidência:** RS§6 chama registro único “PDR, DR-55–DR-64”, mas PDR§2 e índice/missão incluem DR-65 e lhe atribuem escolhas que o próprio Scope consome.
- **Impacto:** leitor pode deixar de conferir a decisão delegada DR-65 ao retomar; não altera o comportamento porque o PDR/índice já estão claros.
- **Owner / resolução:** Product/UX worker, **CORRECT** o intervalo/ref para incluir DR-65, sem nova decisão/feature.

### UXRB-03 — “Recovery” sem qualificador em fronteira de share

- **Prioridade:** não bloqueante, clareza editorial.
- **Critério:** terminologia e elegibilidade de objeto sem exclusão implícita de outcome permitido.
- **Evidência:** PA§7 permite próprio marco/adaptação/descanso/retorno e exclui “recovery/health signals”; PDM I7 exclui sinal de saúde/justificativa. CF F10 passo 1 diz “Nenhum dado ... Nutrition/health/recovery, motivo ou rota”, termo mais amplo junto à permissão de progresso/adaptação próprios.
- **Impacto:** leitura ampla de recovery pode excluir o desfecho genérico voluntário “descansei/adaptei” previsto pela arquitetura, quando a intenção é evitar contexto/sinais íntimos. As regras upstream e o flow inteiro permitem resolver; convém remover a dúvida na fronteira.
- **Owner / resolução:** Product/UX worker, **CORRECT** a expressão para sinais/contexto privados Recovery/Health, mantendo desfecho próprio genérico escolhido sem motivo/sinal/terceiro. Não adicionar nova família de shareable.

## Autoridade, abertos e próxima ação

DR-63/65 são escolhas delegadas explicitamente atribuídas a Product/UX, pendentes de review; não foram apresentadas como Founder estratégia nova. PDR§1–§6 seleciona a leitura atual e preserva DR-01–54 no bloco histórico, sem transferir seus gates. Tese/mapa permanecem upstream; o índice candidato não publica silenciosamente. Missão mantém hard stop sem código/Figma e não retoma as 22 fases antigas automaticamente.

Safety e parâmetros de treino/aderência, conteúdo Nutrition, quem fixa/verifica cobertura crível (O014/O017), provider/capabilities, idade/canal, retenção/eliminação, jurídico, comercial, métricas/evidência e rollout de agente continuam com owners/triggers em RS§6/PDR. Não bloqueiam a formalização abstrata, mas impedem claims/implementação dependentes até resolvidos. Não cabe ao judge resolver essas lacunas ou declarar gate Security/Engineering.

**Próxima ação:** Chief devolve UXRB-01–03 ao autor; autor corrige somente trechos pertinentes e declara delta/revisões/hashes; checks objetivos pertinentes são atualizados; esta instância independente faz re-review r2 do delta e cenários afetados. Nenhum terceiro pass repetitivo é necessário; os findings são localizados e ainda não houve correction loop nesta instância.

O gate r1 não cobre versões modificadas. Eventual marcador administrativo DRAFT→publicado pode preservar cobertura somente após parecer válido e equivalência comprovada; nenhuma publicação pode converter este FAIL em PASS sem a correção avaliada.
