# Engineering — revisão independente C/D

**Veredito r1: FAIL / REQUEST_CHANGES — ENG-PREUX-01.** Avaliação independente sobre o freeze de consumidores 1.1 e PRE_REVIEW executado em 2026-10-15T17:45:22.568Z. A falha é documental e delimitada: preservar supressão/eliminação contra reentrega antiga. Nenhum gate de arquitetura executável é emitido. O checkpoint inicial de 14:41:38-03:00 é preservado abaixo como histórico da avaliação.

| Campo | Valor |
|---|---|
| Task / contrato | PREUX-20261015 / PREUX-20261015-r1; MISSION-PREUX-1.0 |
| Escopo | C: evidência e recomendação wearable; D: contratos conceituais de controles; consumo nos seis documentos existentes e PDR. Apenas delta pré-UX. |
| Instância avaliadora | `/root/preux_engineering_judge`, Engineering / Systems Architect 1.3.0, independente; sem autoria/coautoria de packs ou consumidores. |
| Autores | WEA: `/root/wearable_contracts`; consumidores: `/root/preux_integration`; PDR/índice/checks: Chief. |
| Routing herdado | T3/R3/L3; impacto material de dados/integrações/safety, alteração documental reversível, dependências delimitadas entre domínios. Não cria cascata de agentes. |
| Referências de método | CORE 1.4.0; EXECUTION_PROPORTIONALITY 1.4.0; ENGINEERING 1.1.0; evals/README 1.4.0; ENGINEERING_EXECUTION 1.3.0; route-work 1.4.0; verify-domain-gate e verify-before-completion 1.3.0. |
| Ambiente confirmado | PowerShell e leitura/escrita local; web reader e GET público de documentação oficial disponíveis. Sem login, aplicação de parceiro, gasto, device, API de conta, Figma, spike ou código de produto. |
| Autoridade e proteção | AGENTS/CLAUDE/CURRENT_MISSION/Canonical Index/MISSION_RECORD lidos; PTC-3.0.0/PTM-1.0 preservados. Rebaseline 3.0.0 não reaberto. |
| Ownership | Exclusivamente este parecer; outros autores trabalham nos inputs. Finding retorna ao autor, sem correção silenciosa do produto/packs. |

## 1. Inputs finais, checks e histórico de checkpoint

**artifact_revision:** PREUX-consumers-1.1 / PDR-1.1; **inputs_revision:** WEA-1.0-final + SCI-1.0 + PRO-BOUND-1.0; **contract_revision:** PREUX-20261015-r1. Identificação exata pelo SHA-256 do freeze (confirmado independentemente, 14/14 correspondências):

| Arquivo / revisão | SHA-256 avaliado |
|---|---|
| product/ADAPTIVE_ENGINE_CONTRACT.md — AEC-1.1 | `03a5787bb267f0d318782ffa404d150c735e64b1bd176963220dfb89a7b8fe73` |
| product/PRODUCT_DOMAIN_MODEL.md — PDM-1.1 | `44e86ddbbbcaaf809b457d6b48d32b8ae8bbf0b1f1c664ed416cd07873e5763f` |
| product/PRODUCT_ARCHITECTURE.md — PA-1.1 | `cf67169c8a4a54aecd899daf90a77c2317b321583e666c5453df3bdfb847556d` |
| product/V1_RELEASE_SCOPE.md — RS-1.1 | `b71b4393b21620481f4e8e918a9ab917d6119b036206861385af089d4fec026b` |
| product/EXPERIENCE_MODEL.md — EM-1.1 | `7a9ed8037ebe4a19efc38d6ebcc5d12f95c8e406852bd5956264d7686ad184e5` |
| product/CORE_FLOWS.md — CF-1.1 | `edc410a76fee0643453446d94117aa54b78215ccb92e886d0e8f2beeb4fe5dbb` |
| product/PRODUCT_DECISION_REGISTER.md — PDR-1.1 | `f2ab6e3c019e247b566fbe0da4b85bf1a988e3575da68eb2a0d68da99de556a3` |
| audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md — WEA-1.0 | `5f741d8586e5a25397280b2178126c90e6044a780cf312a8a19e3fd3d7f6c902` |
| audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md — SCI-1.0, apoio sem parecer científico deste juiz | `dca8943e290881b1317fc02ed697d3543b9d5fd8ae5522cbbf3b7acc40271618` |
| audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md — PRO-BOUND-1.0, apoio sem signoff deste juiz | `97b128fdaca6b149da75fc41a1d3600f9f01dd9b351db94dd71355763dd47aaa` |
| audits/pre-ux-2026-10-15/COMMERCIAL_EVIDENCE_AND_TESTS.md — não julgado, identidade do conjunto | `d98d9ba8db915522f1ff8ceaff50273d29e8d3976394c372595bc79b9445a42a` |
| canon/CANONICAL_INDEX.md — CI-3.0.1, estado review pending | `647d91222881c595983d0edeeb0a36d755d32e40a628500aa60c4283407b8740` |
| CURRENT_MISSION.md — MISSION-PREUX-1.0, follow-up incorporado | `084c7a0bfaae6820db605116e86adb991738ddd8c7e699c027e528a0b5faad7c` |
| audits/pre-ux-2026-10-15/MISSION_RECORD.md — PREUX-20261015-r1 | `86421599fb280e31af996b3baeb663dca7070711fcad6859e4bb537ccd27c041` |

**checks_revision / checks_pass_ref:** [PRE_REVIEW_VERIFICATION.json](PRE_REVIEW_VERIFICATION.json), `mode: pre-review`, `at: 2026-10-15T17:45:22.568Z`, 351/351, zero falhas; SHA-256 `b41491aa07572523084aacec3e0f47b642de6c8223032d62d8265b0063074568`. O Chief informou execução exit 0 antes deste parecer; este juiz inspecionou conteúdo/resultado e recalculou cada input com `Get-FileHash -Algorithm SHA256`, 14/14 iguais em 2026-10-15T14:45:46-03:00 (comando exit 0). O helper documental prova integridade declarada/links/cobertura estrutural, não a semântica das fontes/controles; ENG-PREUX-01 resulta da inspeção independente posterior.

### Histórico anterior ao freeze

WEA-1.0 foi lido integralmente por seções: 20 claims, matriz por rota, 13 CTRL, 18 casos negativos, cobertura dos 32 itens e gaps por etapa. SHA-256 final confirmado duas vezes, inclusive no checkpoint:

`5f741d8586e5a25397280b2178126c90e6044a780cf312a8a19e3fd3d7f6c902`

AEC-1.1 foi inspecionado no hash `12c1ec1434850e726fdba0bccbb259a9e35617b00c0319c67ca8817ff617c4ce`. Seu consumo técnico é coerente na inspeção atual; falta o conjunto consumidor fechado e checks atuais para o julgamento final. PDM/PA foram vistos em edição, RS/EM/CF ainda continham versões anteriores no momento das leituras. Esses estados intermediários **não recebem parecer final**.

O PRE_REVIEW_VERIFICATION disponível tinha `mode: source-only`, `at: 2026-10-15T12:30:27`, 316/316 checks e hash WEA antigo `d7dacb13f482e13f405ddb39dabec0fdee7f22ac5c493c961bb3076ead95894b`. O próprio arquivo de checks tem SHA-256 `b21d39d0c5176182e3d9574ad3b69d461d71205fd65b873c5e18509e869389d4` no checkpoint. Isso registra um **check intermediário sem cobertura dos inputs finais**; Chief confirmou que o substituirá antes do parecer. Nenhum PASS atual foi deduzido dele.

Mecanismos objetivos já usados: `Get-Content` e `rg` para inspeção dos contratos; `Get-FileHash -Algorithm SHA256` para identificação exata; leitura da estrutura/conteúdo do JSON de verificação; web open/find sobre fontes oficiais; `Invoke-WebRequest -UseBasicParsing` somente para GET público oficial quando o reader não renderizou Markdown Terra/JSON Apple. Todos os comandos de leitura/hash concluíram com exit 0. Não há head/base de implementação aplicável: o outcome é documental e nenhum código foi autorizado.

## 2. Fontes decisivas abertas independentemente

Consultas em **2026-10-15**. Resultado é prova do conteúdo público limitado, sem provar acesso Vilumo, contrato privado, fidelidade de adapter, hardware ou produção. As falhas do reader para páginas Apple/Terra foram resolvidas com o formato oficial público indicado abaixo; não são uma lacuna de acesso protegido.

| Claim / mecanismo | Fonte primária aberta | Evidência observada e consequência limitada |
|---|---|---|
| WEA-002 / web | [Garmin Training API](https://developer.garmin.com/gc-developer-program/training-api/) e [FAQ](https://developer.garmin.com/gc-developer-program/program-faq/) | Publica workout/plano no calendário Connect; compatível sincroniza ao dispositivo; teste após aprovação em produção com throttling. Programa empresarial/OAuth 2.0, sem licença de acesso geral mas possíveis taxas de métricas. Não concede admissão ou contrato ao Vilumo. |
| WEA-004 / web | [COROS Partner API Access](https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access) | Página atualizada em 03/09/2026: OAuth multiusuário, push de workout/plano, delete por ID, webhook aproximado, histórico limitado e admissão de plataforma/empresa/segurança. O acesso efetivo permanece pendente. |
| WEA-007 / web open/find | [Polar Dynamic API v4](https://www.polar.com/polar-api-v4/) | Scopes publicados incluem `training_targets:read`; training target calendar usa GET. Schemas de fases/versões não demonstram write. Classificar Polar como ingestão + app é sustentado; não se declara impossibilidade permanente de outbound. |
| WEA-009/010 / GET JSON oficial + web WWDC | [HealthKit authorization](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data), [WorkoutKit](https://developer.apple.com/documentation/workoutkit), [WorkoutScheduler](https://developer.apple.com/documentation/workoutkit/workoutscheduler), [WWDC23](https://developer.apple.com/videos/play/wwdc2023/10016/) | HealthKit controla tipos/read/write e torna read-denial opaco; WorkoutKit cria/sincroniza composições, scheduler tem autorização/suporte próprios; estatísticas realizadas usam HealthKit. O talk de 2023 não fixa limites universais de 2026. JSONs oficiais em `/tutorials/data/documentation/...json` responderam 200. |
| WEA-011 / web | [Health Connect training plans](https://developer.android.com/health-and-fitness/health-connect/features/training-plans) | Guia separa app que escreve plano do app que lê/executa e registra realizado; permissões de planned exercise e feature availability próprias. Planned record não demonstra delivery/executor Wear OS. O guia assinala sua versão alpha; disponibilidade real permanece prova futura. |
| WEA-013/014 / GET Markdown oficial 200 | [Terra compatibility](https://docs.tryterra.co/planned-workouts-api/provider-compatibility.md) e [coercion warnings](https://docs.tryterra.co/planned-workouts-api/coercion-warnings.md) | COROS update é delete+create; operação não suportada pode retornar success, delete só local pode deixar device intacto. Warnings incluem default de baseline e completion alterada. A prévia/perda exige controle do Vilumo; schema intermediário não vira domínio nem policy. |
| WEA-015 / GET Markdown oficial 200 | [Terra push to watch](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/extra-features-scores-graphs-teams-nutrition-cgm/planned-workout-push-to-watch.md) e [424/retries](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/extra-features-scores-graphs-teams-nutrition-cgm/planned-workout-424-and-retries.md) | Cada schedule cria workout e não há idempotency key. 424 não é enfileirado/repetido pela Terra; falha geral pode ter chegado ao destino. O contrato unknown/sem retry automático cego responde ao failure mode documentado. Apple depende de SDK/iPhone pareado e autorização própria. |
| WEA-017 / web + GET oficial 200 | [Oferta Terra](https://tryterra.co/pricing), [Unified pricing](https://docs.tryterra.co/unified-api/pricing.md), [Planned pricing](https://docs.tryterra.co/planned-workouts-api/pricing.md) | Base pública US$499 mensal/US$399 faturado anualmente; Unified 100 mil créditos, 200/conexão ativa e eventos; Planned add-on US$99, 20 mil créditos, push 10/pull 1. Pools/unidades distintos; pessoa não equivale a conexão. Não prova quote/custo líquido Vilumo. |
| WEA-019 / web e GET público para vigência | [Strava API Policy](https://www.strava.com/legal/api_policy) | Vigência 01/06/2026 confirmada. §5.3 cobre operação AI, contexto, RAG e evals; §5.4 analytics/combinação e derivados; §5.16 intermediários/interfaces; §3.5 MCP próprio pessoal. Sustenta excluir Strava da fundação Engine/closed loop/Crew e impedir contorno por Terra/LLM. Não é parecer jurídico externo. |

As afirmações decisivas acima são consistentes com o WEA final. Não foi encontrada violação material de factualidade nesse escopo. Outros claims não decisivos do ledger foram auditados pela coerência/limites do pacote, sem alegar reabertura individual de toda URL. Não se repetirá pesquisa já suficiente sem finding novo com efeito decisório.

## 3. Avaliação final C/D por critério aplicável

| Critério | Evidência atual | Situação no checkpoint |
|---|---|---|
| Neutralidade e fidelidade | WEA CTRL-001/002, §3/4; AEC §5.1/5.2; PDM §3/W2; PA AR-08; RS §2/4/G06; CF F04/S15; EM §3/5. Identidades/revisões próprias; domínio→neutro→adapter→provider; completion/advance/target separados; Strength app-first; loss report e recusa de perda semântica, alternativa somente como revisão confirmada. | **PASS documental.** Fontes, acesso e device distintos; nenhuma escolha técnica muda o produto silenciosamente. |
| Provenance/confiança/trace | CTRL-003–005; AEC §2/3/4; PDM §3/I1/I2/§5; CF F05/F06; PA §3; EM §3/5. Ocorrido/recebido, método/unidade/janela, raw/derived/lineage; classes por decisão; plano-base/workout/resultados, sinais/rules/evidence/class/confidence/affected/confirmation/override/undo/provenance. | **PASS documental**, salvo lifecycle de supressão na linha específica abaixo. Nenhum campo material do trace requerido ausente. |
| Agência e concorrência | CTRL-006/011; AEC §3/5.4; CF F02/F03/F06/S17; EM §3; PDM §5. Proposta material obsoleta inválida; aplicação depende de contexto/plano atuais, revalidação no efeito; escolha manual/override não é sobrescrita; undo sob contexto atual preserva realizado e não promete recall remoto. | **PASS documental.** Invariante de aplicação condicional está explícito; mecanismo de concorrência/prova executável pertence a G09. |
| Intenções, webhook, normalization e adaptation | CTRL-008/010/011; AEC §4/5.4; CF F04/F05/F06/S18. Intent estável com pessoa/conta/finalidade/operação/objeto/revisão; mesma identidade/payload diferente conflita; delivery≠resource≠fato; update legítimo não é descartado; normalization successor e adaptação não reaplicam; update composto conserva etapas/target. | **PASS documental** para essas operações. Runtime não foi testado; G09 exige os casos reais. |
| Delete/supressão versus reentrega antiga | AEC §4/§5.4; PDM §3/§5; CF F05/S18. Há escopo de delete e efeito de supressão, mas falta declarar precedência persistente mínima contra evento/backfill antigo. | **FAIL — ENG-PREUX-01.** Não basta dedupe de novo delivery; requer correção conceitual bounded pelo autor. |
| Consistência e desconhecido | CTRL-009; N03–N05/N08/N16/N17; AEC §5.3/5.4; CF F04/S15/S16; PA AR-09; EM §5. Níveis local/transporte/sistema/device/realizado separados, update composto parcial, timeout sem leitura/idempotência permanece unknown; sem retry automático cego. | **PASS documental.** Capacidade pública não promovida a delivery/device proof ou exactly-once remoto. |
| Multi-source/história | CTRL-003/004/010/011; AEC §4; CF F05/S18; PDM §3/§5. IDs namespaceados, associação candidata/confirmada, duas sessões parecidas não fundidas, sem soma duplicada ou superatividade; late/correção muda futuro e derivados, preservando passado conhecido. | **PASS documental** para associação/correção/atraso, ressalvado ENG-PREUX-01 para dado já suprimido. |
| Permissão e revogação | CTRL-008/009; AEC §5.1/5.4; PDM I6/I10; CF F04/F05/S17; EM §5; PA §8. Read/write por finalidade local não promete OAuth granular; revalidar pessoa/conta/propósito/revisão/capability/HOLD; revogação vence pendência, remoto não apagado por suposição. | **PASS documental no domínio Engineering.** Não substitui parecer especializado Security/jurídico. |
| LLM e HOLD | CTRL-007/012; AEC §7; PDM §3/§5; CF F01/F02/F06/S13/S17; PA AR-05; EM §3/5. Extração é candidata/corrigível, autoridade/policy fora do modelo, texto externo como dado; HOLD tem classe/escopo/owner/saída e preserva registro/direitos, sem diagnóstico/liberação por override. | **PASS documental no domínio Engineering.** Políticas reais/profissionais e prova runtime continuam gaps, corretamente delimitados. |
| 32 itens e recomendação técnica | WEA §7 mapeia 1–32, apoiado por matriz §3, CTRL-001–013 e N01–N18; §9/PDR G01–G09/RS §6 identificam acesso, hardware, contratação, privacidade, policy e realização. Apple direto candidato, Garmin direto/Terra condicionados, COROS Partner candidato, HC ingest/store, Polar ingest/app; Strava fora da fundação. | **PASS da classificação documental**, com ENG-PREUX-01 corrigível antes do fechamento C/D. Não exige fabricar prova de laboratório nesta missão. |
| Performance/escala/migração de sistema executável, API/schema/stack | Nenhum sistema/código/contrato executável está sendo implantado ou migrado; fontes/objetos/estados conceituais e critérios futuros são o outcome autorizado. | **NOT_APPLICABLE nesta etapa.** Versionamento, lineage, reconciliação, limites e riscos operacionais pertinentes estão avaliados; implementação tem gates futuros. |

## 4. Findings, limitações e próxima ação

No primeiro checkpoint não havia finding material identificado. Após o freeze dos seis consumidores 1.1 e a leitura cruzada final, surgiu **ENG-PREUX-01**, abaixo. Não se emite PASS enquanto a disposição/correção e os hashes/checks dependentes não forem atuais.

| ID / critério | Evidência / reprodução / impacto | Owner / menor correção / estado |
|---|---|---|
| **ENG-PREUX-01 — delete/supressão não pode ser revertido por evento antigo** | AEC §4/§5.4 e PDM §3/§5 definem recurso/revisão, correção/supressão e dedupe, mas não declaram a precedência de uma eliminação/supressão sobre reentrega/backfill antigo. Caso: observação processada → eliminada/suprimida → mesmo dado antigo reaparece com novo delivery ID. Sem o marcador conceitual, pode ressuscitar observação/derivado inelegível, embora a entrega seja tecnicamente nova. Critério C/D: identidade de fato, update/delete, atraso e idempotência; pedido explícito do despacho para semântica de tombstone. | Product/UX `/root/preux_integration`, com Chief coordenando. Declarar marcador/revisão mínima de eliminação/supressão que rejeita reativação por evento antigo; não guardar payload sensível por isso. Reentrada somente por novo fato/base/ação válida sob regra vigente. Acrescentar caso negativo em CF/S18 ou equivalente. **REQUEST_CHANGES**, enviado ao Chief; não corrigi inputs julgados. |

O freeze recebido do Chief trouxe PRE_REVIEW `mode: pre-review`, `at: 2026-10-15T17:45:22.568Z`, **351/351, zero falhas**, SHA-256 `b41491aa07572523084aacec3e0f47b642de6c8223032d62d8265b0063074568`. A conferência independente com `Get-FileHash` em 2026-10-15T14:45:46-03:00 constatou **14/14 inputs correspondentes**. Esse check precede o finding; correção material invalida somente hashes/checks/trechos afetados, sem repetir pesquisa pública já suficiente.

**Próxima ação:** Chief aceitou ENG-PREUX-01 para correção pelo autor, preservando os inputs r1 antes da edição. Reavaliar em r2 somente o delta AEC/PDM/CF pertinente, sua compatibilidade com os demais consumidores congelados e o hash map/checks atualizados. Sem reabrir fontes ou outros controles já avaliados. A correção deve conservar minimização e retenção limitada; Security julga sua fronteira competente. A verificação de cumprimento é independente do relato de autoria.

Limites permanentes deste parecer: não julga fisiologia, norma profissional, classificação jurídica ou Security como especialista; não prova conta/produção/device, prescrição segura/eficaz, arquitetura executável, implementação ou release. Um eventual PASS cobre **somente fechamento documental C/D e seus consumidores nas revisões/hashes avaliados**. Não emitirá `ENGINEERING_ARCHITECTURE_READY`, `AI_SYSTEM_READY` ou runtime readiness.

**STOP r1 atingido:** findings e evidência devolvidos ao Chief/autor; nenhum input de produto alterado pelo juiz. Parecer r1 encerra com **FAIL / REQUEST_CHANGES** sobre os hashes acima. Nenhum novo provider, pesquisa repetitiva, spike, API/schema/stack, signup, código, Figma ou UI.
