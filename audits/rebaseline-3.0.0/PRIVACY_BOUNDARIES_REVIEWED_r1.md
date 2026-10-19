# PRIVACY_BOUNDARIES_REVIEWED — revisão independente r1

Data: 2026-10-14 (America/Sao_Paulo). Task/contrato: **RB-3.0.0 / RB-3.0.0-r1**.
Veredito: **FAIL — REQUEST_CHANGES no contrato documental**, pelos findings PB-J-01 e PB-J-02 abaixo.

## Escopo, independência e evidência

Evaluator: instância Codex **/root/privacy_judge**, Security, Privacy & Abuse Architect 1.1.0; independente dos autores PCG, Product/UX e Chief. Nenhuma coautoria, correção dos documentos julgados ou revisão de código. Único arquivo escrito: este relatório. Ambiente e permissões herdados; filesystem/PowerShell disponíveis, sem integração, coleta, publicação externa ou delegação nesta revisão.

Rubrica: **SECURITY 1.1.0**, aplicada às fronteiras conceituais; CORE/Execution Proportionality 1.4.0, HANDOFF 1.2.0, verify-domain-gate e verify-before-completion 1.3.0. Lidos AGENTS.md, CLAUDE.md, missão/índice, autoridade direta e Task Contract no [REBASELINE_RECORD](REBASELINE_RECORD.md), além das fontes/documentos abaixo e critérios históricos SEC-J pertinentes. Modelo/permissões do ambiente não concedem autorização adicional.

O outcome é consistência de contratos de consentimento, privacidade, minimização, acesso e abuso em **documentação pré-implementação**. Não avalia conformidade jurídica, segurança/eficácia do treino, age method, APIs disponíveis, infraestrutura, armazenamento ou controles executáveis. Não emite SECURITY_READY de sistema, AI_SYSTEM_READY, release ou aprovação de qualquer coleta. Ausência de modelo de IA selecionado não exige gate de modelo nesta missão.

Checks antecedentes: [PRE_REVIEW_VERIFICATION.json](PRE_REVIEW_VERIFICATION.json), audit_revision RB-3.0.0-r1, gerado `2026-10-14T18:02:52.2030772Z`, **247 PASS / 0 FAIL**; SHA-256 `aa2297547feacb4b26b8be331e48377f90002bdb4e0b5417a584f3b74e6168a3`. Resultado documental/determinístico, sem prova semântica automática. Inspecionei os inputs e executei conferência SHA-256 com `Get-FileHash` contra os 11 artefatos do manifesto: **11/11 coincidências**, reconfirmadas antes da escrita do parecer. REBASELINE_RECORD consumido: SHA-256 `c6180f86d07146d12fdd0a59465127227e6657633d0658260562b3142070be15`.

### Revisões e hashes efetivamente consumidos

| Artefato | Revisão | SHA-256 |
|---|---|---|
| canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md | PTC-3.0.0 | `acc97432ed3dff327a35d632cd5f93fac51080523cedbd52c0790fb347140b8f` |
| product/PRODUCT_TRUTH_MAP.md | PTM-1.0 | `04b083461b72eaadeb4e46ed9d78d0fc100d1263e7ba1523641ab004a25dac0f` |
| product/PRODUCT_DECISION_REGISTER.md | PDR-1.0 | `0730a6bc59787abac809490a7ce333e0132e73650feccfb809ee631fd837a422` |
| product/PRODUCT_DOMAIN_MODEL.md | PDM-1.0 | `5e40eaca70377307cbc48474160b5597b802bdcc69e7bb373cf2fbc1f0d549da` |
| product/PRODUCT_ARCHITECTURE.md | PA-1.0 | `ded74f1bfa972f3a0a360a1b77f466c96e2fb84350070c9ca9285e14e170383c` |
| product/ADAPTIVE_ENGINE_CONTRACT.md | AEC-1.0 | `51a82c8a23a9bb4352f994b120e4df0618b8cf35f279359713568a4b533413ed` |
| product/V1_RELEASE_SCOPE.md | RS-1.0 | `f994868f06929f3b36270758a958ff61ef65837b06524dc7bfde0b1da18fe070` |
| product/EXPERIENCE_MODEL.md | EM-1.0 | `5d1dec26da2a296b275ca20d68f681f02e81cb851e2c8e7c67c5b2db5d5a0dbb` |
| product/CORE_FLOWS.md | CF-1.0 | `afb4faf9572a99ee7b6899e6f6999de65dcfc64bf7413f067d6f08fff6a83eb6` |
| CURRENT_MISSION.md | MISSION-RB-1.0 | `ce8f3d7b1841b6b705ec59eb6006af32a47750b9a037966931468821ec1cb640` |
| canon/CANONICAL_INDEX.md | CI-3.0.0, candidate | `ab3a1bc8e5cdfd9be7a0297aa65bd1c8c6e9dd4e9a2d09664282a583b6e91745` |

PDR: leitura operacional §§1–6; bloco histórico e snapshot apenas para critérios/proveniência pertinentes, nunca como estado vigente. Alteração material dos contratos torna o parecer stale para o trecho afetado; correção anunciada não é correção verificada.

## Atores, ativos e fronteiras

Pessoa adulta M1/M2/M3 controla dados e finalidades; candidato ainda sem vínculo não é participante; participante atual/futuro/removido não recebe os mesmos direitos. Remetente e destinatário de check-in escolhem uma relação privada concreta; criador não tem privilégio permanente. Engine recomenda; agente opcional explica/prepara. Provedor wearable e destino externo de share recebem apenas a projeção autorizada, sem adquirir autoridade sobre o plano ou consentimento.

Ativos: contexto/recovery/Nutrition/motivos pessoais; plano e revisão; observação/provenance; contato de convite, vínculo/identidade da Crew; mensagens estruturadas; consentimentos; export/fila/cópias remotas; derivados de aprendizado secundário. Travessias relevantes: I4/I6/I7/I8/I9/I10, W1–W3, aceite→vínculo, saída/revogação→acesso, versão atual→ação preparada. Ameaças: acesso por convite sem membership; inferência de ausência/saúde/modo/cross-Crew; assédio/reentrada; uso secundário indevido; envio com autorização/revisão antiga; falsa promessa de recall externo.

## Critérios e avaliação atual

PASS aqui significa regra documental coerente no limite indicado, não controle implementado.

| Critério | Resultado | Evidência atual / limite |
|---|---|---|
| Autoridade, routing Security, worker != judge e limite de etapa | PASS | Record Task Contract; missão/índice candidate; hashes atuais, sem transferência de PASS histórico. |
| Crew privada/18+/3/~8/criação nos dois modos | PASS | PTC C025/C041; PDM §2; PA §§2/6; RS §2; CF F01/F08. Método de identidade/idade permanece dependência anterior à coleta. |
| Convite nominal/comprovação, encaminhado/projetado confirmado, vagas e resultado sem causa sensível | PASS parcial; acesso FAIL | CF F08.3–4/Recuperação; PA AR-13; PDM §5. Não enumera limite/idade/bloqueio; PB-J-01 impede fechar a fronteira de acesso. |
| Consentimento por finalidade, Crew, destinatário/tipo; sem herança social do wearable | PASS | PDM I4/I6/invariante 7; PA §6; EM §3; AEC §5.1. Accept não publica desfecho; novo membro não herda mensagens. |
| Saída/remoção/novo membro/pausa e revogação social | PASS documental | PDM §§5/7; PA AR-12/14; CF F09.5–6. Acesso histórico termina, pendentes são revogados; mensagens eliminadas/minimizadas sem composição inferível. Controles de remoção/reentrada precisam qualificação antes de implementar. |
| Não exposição de ausência, motivos, Nutrition, health/recovery, modo, local/horário e outras Crews | PASS com limite de inferência | PDM I4/§6; PA §§6/7; EM §§4/6; CF F07/F09/F10. Sem grid, contador, last seen, lista de faltantes, fanout ou contexto de treino. PB-F-02 distingue inferência residual de autorização pelo produto. |
| Check-in/apoio estruturados, voluntários e privados; sem chat | PASS | PDM §3; PA §6; CF F09.2–3. Mensagem comum M2/M3, sem selo de adequação; silenciar/retirar e bloqueio de convites existem. |
| Encerramento coletivo qualitativo não afirma cumprimento individual | PASS | PA AR-11; PDM §3/§5; RS §2; EM §6; CF F09.4. Fato é tempo encerrado, sem ler contagem de contribuições; descanso/silêncio não gera fracasso de alguém. |
| Share próprio/convite sem third-party data; coletivo externo diferido | PASS | PDM I7–I9; PA §7; RS §§2/3; CF F10. Prévia/cópia estática, sem Crew/terceiros/rota ou tracking individual. Regra coletiva permanece doctrine; não há implementação presumida de agregação anônima. |
| Ingestão/envio wearable independentes, scopes mínimos, outbound limitado | FAIL na revogação | AEC §5.1/PDM I6 e EM §5 estabelecem independência; CF F04 e AEC §5.2 agrupam revogação com desconexão total. PB-J-02. |
| Ação preparada/export exige autorização e revisão correntes | PASS documental | AEC §3.4–5/§5.2; PDM W2; CF F02/F04/F06. Revisão invalida pendente; revogação cancela pendência não autorizada. Execução técnica precisa provar novamente a condição no momento do efeito, inclusive retry. |
| Terceiros, cópia remota e undo honestos | PASS | AEC §§3/5; PA AR-15; EM §3; CF F04/F10. Sent/confirmed não é executed; timeout pode ter entregue; recall não é prometido; nenhuma ação em lote autônoma. |
| Uso primário versus secundário, minimização/retenção/direitos | PASS no mínimo abstrato; followup | PDM I10/§7; AEC §§1/3/4; PA §8; RS §6/PDR §5. Primário replaneja/rebaseia, secundário comportamental tem opt-in próprio off por padrão. PB-F-01 cobre precisão necessária sobre derivados sem inventar duração. |
| Agente opcional sem consentimento/autoridade ampliados | PASS | AEC §7; EM §3; PTC C032/O015; RS §3. Sem ação social, export/share, direitos ou consentimento pela pessoa; modelo/runtime não selecionado, gate correspondente NOT_APPLICABLE agora. |
| Testes executáveis, conformidade jurídica, eficácia e provider real | NOT_APPLICABLE neste outcome | Missão proíbe produto/Figma; RS §6 e PDR §5 suspendem a etapa dependente até provas reais. Não são dispensados para implementação/release. |

## Findings bloqueantes — retorno ao autor

### PB-J-01 — roster antes de membership autorizado

**Critério:** candidato sem vínculo não recebe dados internos da Crew; divulgação para consentimento deve explicar categorias/alcance sem conceder acesso prévio. L014/C025, PDM §2/I8; histórico SEC-J-03.

**Evidência:** CF F08.5 (linha 108) manda mostrar “nome de exibição/lista de membros e estado de vínculo” depois da elegibilidade/aprovação/vaga. F08.6 (linha 109) só então aceita e cria vínculo. PDM §2 (linha 36) diz que convidado ainda não tem vínculo e convite não concede dados; I8 (linha 84) proíbe dados Crew/membros antes do aceite autorizado. PA AR-13 não pode resolver silenciosamente o conflito entre essas duas regras.

**Contraexemplo:** candidato comprova o canal, é elegível e há vaga; chega ao passo 5, lê nomes/estados e cancela o aceite no passo 6. Nunca virou participante e já recebeu dados de terceiros. Nada no flow exige que os atuais participantes tenham consentido essa audiência de candidatos que não aderiram.

**Impacto:** formalizar o flow assim autoriza uma nova fronteira de exposição contrária ao domínio. Não depende de escolher token, provider ou schema para corrigir.

**Owner:** Product/UX worker (CF/PDM/PA afetados), Chief integra. **Bloqueante para PRIVACY_BOUNDARIES_REVIEWED e fechamento documental dependente.** Correção esperada: explicitar que o passo de consentimento apresenta as categorias/alcance, e que roster/estados reais só são acessados após aceite/vínculo autorizado; preservar convite e criação leves. Autor decide redação, judge não edita.

**Prova para fechar:** novos hashes/checks + percurso confirmar elegibilidade→cancelar e percurso aceitar→acessar, sem acesso no primeiro. Criar Crew também deve obter o mesmo consentimento antes do vínculo/primeira exposição.

### PB-J-02 — revogação parcial tratada como desconexão completa

**Critério:** permissões de ingestão/envio são independentes; revogação de uma finalidade não altera silenciosamente autorização válida da outra. PTC C040, PDM I6, AEC §5.1.

**Evidência:** CF F04 Recuperação (linha 62) diz “desconectar/revogar interrompe novos reads/writes”; AEC §5.2 (linha 79), “Desconectada / permissão revogada”, manda interromper ingestão/envios futuros. EM §5 (linha 69) mantém read quando write é recusado, e AEC §5.1 (linha 66) separa os propósitos. Os dois primeiros trechos não delimitam qual autorização foi revogada.

**Contraexemplo:** read consent continua válido, pessoa revoga apenas write durante um export pendente. Uma leitura literal de CF/AEC interrompe também ingestão, embora não tenha sido desconectada nem revogada essa finalidade. Inversamente, revogar read não deve autorizar novos reads em retry; write continua somente no alcance autorizado e com confirmação de revisão vigente.

**Impacto:** contrato de permissões tem dois resultados incompatíveis para a mesma ação. A correção abstrata não exige API/runtime. Ambiguidade também já encaminhada pelo Product/UX judge; não é um segundo processo de aprovação.

**Owner:** Product/UX worker com consumo Engineering/Security. **Bloqueante documental até clarificação.** Diferenciar desconexão total de revogação somente da finalidade/escopo afetados, invalidando respectivas pendências. Dados/copias já entregues conservam tratamento transparente, sem recall fictício.

**Prova para fechar:** novas hashes/checks e cenários read-only→revogar write; write-only→revogar read; desligar conexão inteira; autorização revogada enquanto há retry/fila. Prova agora é coerência de contrato; execução futura pertence ao implementation gate.

## Followups e risco residual — não bloqueiam este rebaseline

### PB-F-01 — derivados de aprendizado secundário

**Critério/evidência:** PDM I10 (linha 86) e AEC §4 (linha 58) distinguem replanejar/rebasear de aprendizado comportamental secundário opcional. PDM §7 regula saída/retenção e retirada do visível; PA §8 manda parar uso futuro conforme propósito. A regra anterior específica de remover/deixar de usar **derivados secundários** ao revogar (SEC-J3-07; PA-0.1 J7/AR-69 no snapshot) ficou menos explícita no texto consolidado.

**Disposição:** FOLLOWUP, sem autorização atual para manter uso sob finalidade revogada. Não há implementação/coleta nem contrato permitindo reaproveitar derivado secundário como se primário fosse. RS §6/PDR §5 já exigem qualificação de revogação/retention antes de coleta, por isso não é uma contradição positiva como PB-J-01. Evitar alegar que o detalhe foi integralmente verificado/fechado.

**Owner/trigger:** Product/UX + Security definem a fronteira operacional antes de UX Spec/contrato técnico que use aprendizado; Engineering prova antes de coleta/processamento. Deve esclarecer que motivos opcionais relevantes ao replanejamento atual não autorizam perfil comportamental longitudinal; revogar secundário para seu uso e remove/deixa de usar derivados daquela finalidade, sem apagar fatos pessoais legítimos por outra finalidade. Janela, backups e método permanecem por decidir. Se a próxima especificação permitir derivados persistirem ativos após revogação, vira blocker dessa etapa.

### PB-F-02 — inferência residual em relação privada e Crews sobrepostas

**Critério/evidência:** PA AR-12 e EM §6 mostram somente nome/estado neutro em cada Crew; PDM I4 e CF F09 escolhem Crew/destinatário, sem fanout, timestamps da prática, contagem, modo ou outras memberships. Um participante que já pertence voluntariamente às mesmas duas Crews ainda reconhece a mesma pessoa e pode comparar os estados que legitimamente vê. Um destinatário sabe que recebeu uma mensagem voluntária, sem que isso prove momento de treino, ausência, recuperação ou motivo. O produto não pode prometer impossibilidade de toda inferência humana. SEC-J3-09/PA-0.1 NC-14 já registravam esse residual.

**Disposição:** FOLLOWUP/limitação, não nova permissão de cruzar dados. Não há função de correlação, descoberta de outras Crews ou analytics de ausência em V1. Isolamento por Crew e mensagens privadas reduzem exposição; não tornam relação de duas pessoas anônima. Nenhum cumprimento individual pode ser inferido pelo marco coletivo temporal.

**Owner/trigger:** Product/UX + Security antes da UX Spec de consentimento/notificações e implementação. Informar o alcance da audiência atual/futura e do estado neutro quando há membros em comum; conferir com Crew de 2 e pessoa em 3 Crews sobrepostas. Sem alerta citando status de alguém, ordenação por atividade, dia de treino, horário/histórico de pausa ou tratamento de não mensagem como não cumprimento. Futuras categorias/novos destinatários/ampliação pedem consentimento próprio, sem reutilizar o atual.

### PB-F-03 — prova negativa e exposição fora das superfícies internas

**Critério/evidência:** RS §4/§6, PDR §5 e CF F08/F09 deixam os métodos reais e seus controles como dependências. Histórico SEC-J-09/15, SEC-J3-02/03/05/06 permanece relevante; nenhum PASS técnico foi herdado.

**Owner/trigger:** Engineering + Security antes de implementação/coleta/technical readiness; Product/UX antes de UX Spec das superfícies. Precisam provar autorização na fronteira real para cross-account/cross-Crew, removido/saída, novo membro, convite encaminhado e corrida de vagas; bloquear convites do mesmo remetente em todas as suas Crews sem revelar bloqueio; rate limits de convite/check-in/apoio/remoção/reentrada; revalidar vínculo, destinatário/consentimento e revisão na emissão/retry, não apenas na prévia; revogação/deleção alcançando filas e derivados. Parâmetros não são inventados nesta revisão. Minimizar idade/contato e revisar terceiro verificador quando escolhido; notificações/lock screen/widget sem conteúdo sensível ou estado de terceiros por padrão; textos PT-BR/EN com escopo equivalente e versão/idioma do consentimento. Isso é followup necessário à próxima etapa dependente, não permissão para implementá-la agora.

## Disposição dos critérios históricos

SEC-J-01–08/12/13 e SEC-J2-04–07: reavaliados pelas regras atuais de consentimento, destinatário, ausência, estrutura/saída/mensagens, sujeito a PB-J-01 e à limitação PB-F-02. SEC-J3-01–04/09: relevantes para convite/idade/abuso/integrations/overlap, com PB-J-01/02 e futuras provas acima. SEC-J2-02/SEC-J3-07: mínimo primário/secundário conservado, precisão de derivados em PB-F-01.

SEC-J-10/SEC-J2-03/SEC-J3-08 (objetos coletivos externos, composição/recusa/inferência) e SEC-J2-10 (objetos sociais avançados): **NOT_APPLICABLE à entrega V1 atual**, pois coletivo externo/social avançado estão diferidos. Princípios permanecem vinculantes; nova entrada desses objetos reabre gate, sem herdar aprovação de agregação, standing preference ou anonimato. SEC-J-11/I9 continua relevante a cópias próprias/convites e foi reavaliado pela prévia estática sem metadados/tracking.

SEC-J-09/14/15 e SEC-J3-05/06: dependências legítimas de threat model/controle executável, jurídico ou UX Spec, com owner/trigger e sem declaração de resolução real. Nenhum veredito histórico é transferido à r1.

## Parada e handoff

Uma questão aberta é dependência futura legítima quando o contrato fixa limites conservadores coerentes, identifica owner/trigger **antes do uso real** e não depende de solução fictícia para autorizar acesso/ação agora. Vira blocker atual quando duas regras para o mesmo estado são incompatíveis, o flow concede dado/ação proibidos upstream, falta autoridade essencial ou a etapa declara prova que não existe. PB-J-01/02 são desse segundo tipo; idade/provider/durações/prova de eliminação são do primeiro no outcome documental.

Próximo owner: Product/UX worker corrige PB-J-01/02; Chief consolida os consumidores e executa checks/hashes novos. Retornar à **mesma instância judge** para delta review das fronteiras alteradas. O Chief não pode substituir o FAIL por aprovação, nem presumir correções anunciadas. PUBLICAÇÃO/fechamento dependente aguardam ausência de bloqueante com evidência corrente. PB-F-01–03 ficam com owners/triggers; não precisam novos documentos sem consumidor.

A redação CF F10 “Nutrition/health/recovery” é excessivamente ampla diante da representação genérica própria de descanso/adaptação permitida por PA/PDM. Product/UX judge já encaminhou essa questão estrutural. O limite de privacidade que deve conservar na correção é: desfecho genérico próprio elegível pode ser representado; sinais/contexto privado, motivos, terceiros e dados coletivos não cruzam. Minha avaliação dessa mudança exigirá sua hash nova, sem aprovar antecipadamente.

**STOP nesta revisão documental r1. Sem edição dos artefatos julgados, sem publicação externa e sem SECURITY_READY de sistema executável.**

Verificação após salvar: o relatório foi lido e seu veredito confirmado. Enquanto este parecer era escrito, as hashes de PDM/PA/RS/AEC/EM/CF mudaram em relação ao manifesto inicial. Essas alterações não foram consumidas na r1; a tabela de inputs acima continua sendo o escopo avaliado, e o delta exige re-review. Não foi presumida a resolução de nenhum finding pela existência de novas hashes.
