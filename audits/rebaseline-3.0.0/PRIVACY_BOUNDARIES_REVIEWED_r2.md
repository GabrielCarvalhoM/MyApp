# PRIVACY_BOUNDARIES_REVIEWED — delta review independente r2

Data: 2026-10-14 (America/Sao_Paulo). Task/contrato: **RB-3.0.0 / RB-3.0.0-r1**.
Veredito: **PASS no contrato documental e no delta avaliado**, sem finding bloqueante remanescente neste domínio.

## Independência, inputs e alcance

Evaluator: **/root/privacy_judge**, mesma instância independente Security, Privacy & Abuse Architect 1.1.0. Rubrica SECURITY 1.1.0; CORE/Execution Proportionality 1.4.0; verify-domain-gate/verify-before-completion 1.3.0. Sem coautoria, alteração dos documentos avaliados, coleta, integração, código, delegação ou publicação externa. Único arquivo escrito nesta passagem: este relatório.

Esta passagem reavalia PB-J-01/02 e os deltas de privacidade correspondentes em PDM/PA/AEC/RS/EM/CF, com seus consumidores diretos. O mapeamento de atores/ativos/fronteiras, critérios sem mudança e limites metodológicos estão no [parecer r1](PRIVACY_BOUNDARIES_REVIEWED_r1.md); seu **FAIL é histórico e permanece intacto**, SHA-256 `87a1b6f217901f09feb2e6ae0e6232be60cbb7e301f193a7671dbd54286d6775`. Não transformei retrospectivamente o FAIL em PASS nem substituí suas hashes pelas corrigidas.

Inspecionei os trechos atuais e cenários negativos abaixo, não apenas o relato de correção. Checks antecedentes: [PRE_REVIEW_VERIFICATION_r2.json](PRE_REVIEW_VERIFICATION_r2.json), gerado `2026-10-14T18:13:48.4789838Z`, **248/248 PASS**, audit_revision RB-3.0.0-r1, SHA-256 `49c65d9a5d0f2af9f861e4ebbeae739649873d1eefe28ec92a63be05840d0ffc`. Conferência independente com `Get-FileHash`: **11/11 hashes de artefatos coincidem** com o manifesto r2, incluindo cinco fontes sem alteração e seis consumidores corrigidos. O manifesto determina integridade/traceability, não prova semanticamente os controles nem autoria da execução.

### Hashes consumidas nesta passagem

| Artefato | Revisão documental | SHA-256 |
|---|---|---|
| canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md | PTC-3.0.0 | `acc97432ed3dff327a35d632cd5f93fac51080523cedbd52c0790fb347140b8f` |
| product/PRODUCT_TRUTH_MAP.md | PTM-1.0 | `04b083461b72eaadeb4e46ed9d78d0fc100d1263e7ba1523641ab004a25dac0f` |
| product/PRODUCT_DECISION_REGISTER.md | PDR-1.0 | `0730a6bc59787abac809490a7ce333e0132e73650feccfb809ee631fd837a422` |
| product/PRODUCT_DOMAIN_MODEL.md | PDM-1.0, correction pass | `3a5c61c3634720956d294c05c7cbbb4a9cbbb193ef7cfb77719b7966473949ba` |
| product/PRODUCT_ARCHITECTURE.md | PA-1.0, correction pass | `5f20dc11de2be7d6fa42f0a02dc8d713956d10cdfd2dd8e18626c6c092145333` |
| product/ADAPTIVE_ENGINE_CONTRACT.md | AEC-1.0, correction pass | `a5ae1039709df4a8cdac4c487ad9b35f2653fb45f718aecf1dbc0cd6b1be3548` |
| product/V1_RELEASE_SCOPE.md | RS-1.0, correction pass | `74cdd3983884d3b6087088be800483f067bd541fc1dd5007f36a67db88b460ef` |
| product/EXPERIENCE_MODEL.md | EM-1.0, correction pass | `a36fbb32e126b913ff9f109b14a35472c40fd37b2a7d151d75457697f9717eb8` |
| product/CORE_FLOWS.md | CF-1.0, correction pass | `fa4bedfb6772a2b2ee06d7a3123ff107eaf78b4ec8296b6b9cfe4abaa78b992b` |
| CURRENT_MISSION.md | MISSION-RB-1.0 | `ce8f3d7b1841b6b705ec59eb6006af32a47750b9a037966931468821ec1cb640` |
| canon/CANONICAL_INDEX.md | CI-3.0.0, candidate | `ab3a1bc8e5cdfd9be7a0297aa65bd1c8c6e9dd4e9a2d09664282a583b6e91745` |

Mesmo rótulo 1.0 não torna inputs equivalentes: as hashes acima distinguem o correction pass do draft da r1. Não houve nova estratégia nem gate de sistema executável.

## Reavaliação de findings e cenários

| ID / critério | Evidência atual e percurso analítico | Disposição |
|---|---|---|
| **PB-J-01** — nenhum roster/contexto antes de consentimento e vínculo autorizado | **CF F08.5** (linha 108) explica categorias/alcance sem roster, nomes, estados ou dados reais; **F08.6** (linha 109) só mostra o mínimo permitido após vínculo Ativo. **F08.2** estende o mesmo consentimento à criação, sem efetivar vínculo/acesso antes dele. **PA AR-13** (linha 100) explicita o mesmo limite, alinhado a PDM §2/I8. Candidato elegível/comprovado/com vaga que cancela no passo 5 não recebe dado real; aceitar cria vínculo antes de acesso; encaminhado não confirmado continua sem acesso; criar não contorna consentimento. | **CLOSED / PASS documental.** Sem nova audiência de candidatos que não aderiram. Métodos de comprovação e prova de acesso real seguem abertos antes de implementar. |
| **PB-J-02** — revogação por finalidade não desliga autorização independente válida | **PDM I6** (linha 82), **AEC §5.2** (linha 79), **CF F04 Recuperação** (linha 62), **EM §5** (linhas 69/77) e **PA §8** (linha 131) distinguem revogação de escopo/finalidade e desconexão completa. Revogar write com read autorizado cancela writes/pendências, mantém ingestão; revogar read interrompe reads/retries, conserva somente write autorizado sobre revisão corrente; write-only sem read não ganha permissão de ler; desligar a conexão toda interrompe ambas. Cópias já entregues não são prometidas como apagadas. | **CLOSED / PASS documental.** Autorização não se amplia nem se reduz silenciosamente entre propósitos. Prova de enforcement/fila/retry fica para a etapa real. |
| **PB-F-01** — revogação secundária alcança derivados, sem reclassificação implícita para finalidade primária | **PDM I10** (linha 86), **AEC §4** (linha 58), **CF F05.5** (linha 72), **EM §5** (linha 77), **PA §8** (linha 131) explicitam parar uso e remover/deixar de usar derivados da finalidade revogada. Replanejar/rebasear ainda autorizado não é desligado automaticamente. **RS §6** exige prova de derivados antes de coleta/technical readiness. | **CLOSED quanto à regra documental solicitada.** A fronteira operacional detalhada, retenção/backups e prova de eliminação continuam followup Product/UX + Security/Engineering antes de UX/contrato que use aprendizado e antes de coletar/processar. Consentir replanejamento atual não autoriza perfil comportamental secundário. |
| **PB-F-02** — isolamento não promete impossibilidade de inferência humana | **PA §6, Limitação de inferência** (linha 98) registra que membros comuns podem reconhecer/comparar estados legitimamente vistos; receber check-in não prova momento de treino, ausência, saúde ou motivo. **RS §6** fixa Product/UX + Security, audiência atual/futura/estado neutro no consentimento e qualificação de notificações antes da UX Spec/contrato dependente, com Crew de dois e vínculos sobrepostos. | **ACCEPT residual delimitado / PASS documental.** Não autoriza correlação pelo produto, descoberta de outras Crews, histórico/horário de pausa, analytics de ausência ou fanout. Disclosure/superfícies reais continuam followup, sem alegação de anonimato pleno. |
| **PB-F-03** — provas negativas e superfícies não desaparecem na consolidação | **RS §6**, linha de provas negativas, conserva Engineering + Security e Product/UX com trigger anterior a implementação/coleta/technical readiness; cobre acesso, saída/remoção/novo membro, destinatário/vínculo/revisão no efeito/retry, filas/derivados, minimização/abuso e notificações/widgets/lock screen. Consentimentos PT-BR/EN devem ter escopo equivalente. | **OPEN / DEFER legitimamente à etapa dependente.** Não bloqueia esta formalização; bloqueia claim de controle real sem evidência. Rate limits, antiassédio/reentrada, idade/contato, shared-device/auth e métodos permanecem por qualificar/provar. |
| Delta F10 — desfecho genérico próprio versus contexto privado | **CF F10.1** (linha 130) admite progresso/retorno/adaptação/descanso próprios elegíveis por iniciativa da pessoa; exclui dados de outro membro/Crew, contexto Nutrition, sinais/contexto privados Health/Recovery, motivo e rota. Sem terceiro ou coletivo por inferência; **PA §7**, PDM I7–I9 e PTC C021 continuam vinculantes. | **PASS documental.** A correção não amplia disclosure de saúde/contexto ou terceiros; retira uma proibição lexical ampla sobre o próprio desfecho genérico. Elegibilidade/conteúdo efetivos continuam revisão futura, sem diagnóstico ou dose autorizados. |

As transições preservam direitos de vínculo e valores anteriores: 18+, 3 vínculos Ativos/Pausados, cerca de 8 participantes, criação nos dois modos, confirmação nominal/encaminhada, convidante com resultado neutro, sem agenda de contatos. Novo membro não recebe passado; saída/remoção corta acesso histórico e pendentes; pausa de prática e vínculo continuam independentes. Check-in/apoio seguem privados por Crew/destinatário, estruturados, sem chat, contagens, origem/modo ou lista de ausência. Encerramento coletivo continua fato temporal qualitativo, sem afirmar cumprimento individual. Esses resultados são documentais, não testes de dispositivos/accounts.

Wearable continua com consentimento próprio por fonte/tipo/finalidade, projeção mínima outbound, ação explícita por sessão/revisão, invalidação de export antigo e tratamento honesto de enviada/confirmada/desconhecida/remota obsoleta. Privacidade social e share não são herdados de read/write. O agente opcional mantém somente explicar/preparar: não consente, envia, projeta, atua no social ou exerce direitos. Não há modelo selecionado cujo gate de runtime possa ser emitido ou exigido nesta formalização.

## Limites, publicação e handoff

Não surgiu nova contradição bloqueante nas fronteiras alteradas. Questões abertas são dependências futuras legítimas porque possuem limite conservador, owner e trigger antes do uso/coleta dependentes. Não autorizam implementar controles inexistentes nem flexibilizar a doutrina. Achado futuro que altere permissão, audiência, dados, retenção, autonomia ou comportamento reabre os artefatos/gates afetados.

**PASS limitado à coerência dos contratos no conjunto de hashes r2.** Não é SECURITY_READY de sistema, conformidade jurídica, safety/eficácia, prova de provider/idade/storage, UX testada, UI_READY ou RELEASE_READY. Nenhum veredito histórico SEC-J foi importado. Coletivos externos, perfis/memória social e agregação anônima permanecem fora da V1; introduzi-los exigirá nova revisão de consentimento/inferência.

Producer: judge independente; consumer: Chief para agregação dos gates, Product/UX para handoff e followups. Próxima ação: Chief confirmar demais reviews atuais e fechar a publicação documental dentro da autoridade direta, conservando PB-F-01 (prova operacional), PB-F-02 (disclosure/superfícies) e PB-F-03 (controles reais) nos owners/triggers de RS §6. Receber este relatório não constitui aceite de Claude ou implementação autorizada.

**Publicação por markers:** este PASS está vinculado às hashes acima. Alterar exclusivamente status editorial de draft/publicação pode reutilizar a avaliação sem novo julgamento semântico **somente com prova objetiva atual de equivalência do corpo/contratos**: cópia/hash avaliada, diff bruto ou comparação normalizada com allowlist estrita de markers, hashes finais, autoridade de publicação e registro da ponte r2→publicado. Não basta manter a revisão 1.0, alegar “só markers” ou observar checks lexicais. Qualquer mudança de fronteira/estado/regra fica fora dessa equivalência e requer delta review. Não aprovo antecipadamente arquivos finais ainda não consumidos.

STOP nesta revisão independente r2. Nenhuma edição dos artefatos avaliados; r1 preservada.
