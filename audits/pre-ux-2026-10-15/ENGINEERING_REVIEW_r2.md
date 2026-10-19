# Engineering — reavaliação independente C/D r2

**Veredito: PASS no escopo documental C/D. ENG-PREUX-01: RESOLVED.** Reavaliação limitada à correção de precedência de eliminação/supressão nos hashes abaixo, com reaproveitamento explícito dos demais critérios PASS da r1. Não declara `ENGINEERING_ARCHITECTURE_READY`, integração executada, runtime ready ou release.

| Campo | Valor |
|---|---|
| Task / contrato | PREUX-20261015 / **PREUX-20261015-r1**; MISSION-PREUX-1.0 |
| artifact_revision / inputs_revision | Consumidores 1.1 com correção ENG-PREUX-01; hashes exatos abaixo. WEA-1.0-final e fontes/controles não alterados mantêm a avaliação r1. |
| Avaliador | `/root/preux_engineering_judge`, Engineering / Systems Architect 1.3.0, instância independente, sem autoria dos inputs ou da correção. |
| Autor / ownership | Correção Product/UX `/root/preux_integration`; Chief coordena. Juiz edita exclusivamente este parecer r2, sem alterar produto/packs/r1. |
| Método/rubrica | ENGINEERING 1.1.0; CORE/EXECUTION_PROPORTIONALITY 1.4.0; verify-domain-gate e verify-before-completion 1.3.0, já lidos/aplicados em r1. T3/R3/L3 herdado, sem novo routing/pesquisa. |
| Escopo e parada | Delta AEC §4/§5.4, PDM §3/§5, CF F05/S18; correção do finding e compatibilidade com consumidores inalterados. STOP após parecer/handoff. |

## 1. Identificação e evidência atual

O parecer [r1](ENGINEERING_REVIEW_r1.md), SHA-256 `a8c3372a22cf1481716fc3970329c1c1d88bb7590c16f983ed95220beb5114d5`, permanece **FAIL / REQUEST_CHANGES** histórico, sem alteração. O [manifest dos inputs r1](review-inputs-r1/MANIFEST.json) conserva exatamente os três candidatos rejeitados e o check 351/351. Recalculei os quatro hashes preservados: **4/4 iguais ao manifest**, incluindo o antigo PRE_REVIEW `b41491aa07572523084aacec3e0f47b642de6c8223032d62d8265b0063074568`.

| Input corrigido / revisão | SHA-256 atual avaliado |
|---|---|
| product/ADAPTIVE_ENGINE_CONTRACT.md — AEC-1.1 | `4afa90fa231326ee4c8d8db5bb8639ca4fa30ca25f05dfde1e70d11388fd00f4` |
| product/PRODUCT_DOMAIN_MODEL.md — PDM-1.1 | `ebf942286693b4a8dd3bb861c7e88ac4e68faf9d5f3341da0a10423107a2daa4` |
| product/CORE_FLOWS.md — CF-1.1 | `fa5dfd9f5d4bfdd0167320cbf255b07e33ddfff8f265861853afb2fce4ea90e5` |

**checks_revision / checks_pass_ref:** [PRE_REVIEW_VERIFICATION.json](PRE_REVIEW_VERIFICATION.json), SHA-256 `d9d68e98bfbd16aaa44ec316afb01eb4ceff06b34b90566995e77491fc5d1ea9`, `mode: pre-review`, contrato PREUX-20261015-r1, `at: 2026-10-15T17:49:56.223Z`, **355/355, zero falhas**. Chief informou execução exit 0 antes da reavaliação. Este juiz inspecionou JSON/resultado e recalculou **14/14 hashes atuais iguais ao mapa**, com PowerShell `Get-FileHash -Algorithm SHA256` em 2026-10-15T14:50:19-03:00, exit 0. Check documental prova integridade/links/revisões/cobertura estrutural; não substitui a análise semântica abaixo.

Comparação dos três arquivos com suas cópias preservadas: `git --no-pager diff --no-index -- <r1-preservado> <atual>`. Cada comando retornou **exit 1 esperado porque há diferenças**, sem falha de leitura; apenas aviso Git de conversão futura LF/CRLF, sem escrita. Os diffs se restringem à precedência de eliminação/supressão e seu consumo em normalization/webhook/observação/F05/S18. Não mudaram fonte, provider, política fisiológica, autoridade, escopo ou promessa de produto.

O MISSION_RECORD atual, hash `0792d295dd3ae374ba81fbc86da4bed05b07471dded9bb7d91d2d349709c34d2`, acrescenta registro administrativo do finding, preservação e correção delimitada; esse trecho foi lido e não altera o contrato autorizado.

## 2. Reavaliação do finding

| Critério / caso adversarial | Evidência efetiva no delta | Resultado |
|---|---|---|
| Observação já processada é eliminada/suprimida; webhook antigo retorna com **novo delivery ID** | AEC §4 e §5.4 mandam conferir precedência do fato/escopo/revisões antes de processar. ID/recebimento novos não provam revisão nova. PDM §3/§5 mantém revisão de supressão; CF F05/S18 exige não restaurar fato/carga/derivados. | **PASS documental.** O contraexemplo da r1 deixa de ser permitido. |
| Replay/refetch/backfill antigo ou nova versão da transformação tenta recriar o sinal | AEC §4/normalizar §5.4 proíbe retorno de versão eliminada/suprimida por replay/backfill/mudança de transformação; CF S18 preserva a mesma regra. | **PASS documental.** Trocar delivery ou transformação não contorna a supressão. |
| Correção/fato/revisão legitimamente novos ou ação explícita válida chegam depois | AEC §4 exige legitimidade, autorização atual e aplicabilidade ao escopo, sem apagar supressão antiga ou contornar revogação. PDM §3/§5 e CF F05/S18 repetem a separação. | **PASS documental.** Não bloqueia todo fato futuro por identidade de pessoa, nem usa nova autorização para apagar intenção antiga. |
| Marcador mínimo se torna justificativa para reter saúde indefinidamente | AEC §4 limita a identidade/escopo/revisão necessários, exclui payload bruto de saúde, mantém G07 para finalidade/base/retenção/eliminação e não cria exceção ao erasure. Se marcador não puder ser retido, exige controle equivalente permitido sem recoleta proibida; PDM §3 acompanha. | **PASS no domínio Engineering.** Nenhuma licença de retenção foi criada; adequação jurídica/minimização permanece com Security/jurídico e G07. |
| Supressão concorre com fila, nova adaptação ou consentimento revogado | Delta liga a precedência ao processamento/normalização; AEC §5.4 já exige revalidação no efeito e determina que revogação/eliminação vençam pendências. CF F05 aponta à mesma autoridade; nada libera efeito social/export ou restaura plano antigo. | **PASS documental.** Compatível com agência/revisão/idempotência aprovadas nos outros blocos da r1. |
| Não escolher storage/schema prematuramente | PDM §3 admite tombstone ou equivalente e nega escolha de banco/schema/mecanismo; AEC fixa o resultado observável, CF fixa o percurso negativo. G09 conserva prova executável futura. | **PASS.** A correção resolve sem ampliar a missão. |

**Disposição:** ENG-PREUX-01 **CORRECT → ACCEPT / RESOLVED**, com evidência nos três documentos corrigidos e S18. Nenhum novo finding material neste delta. Não se trata de teste executado de webhook/banco: é verificação independente da semântica documental exigida nesta etapa.

## 3. Cobertura r1 reutilizada e compatibilidade

Permanecem inalterados e com os hashes r1 confirmados no mapa atual:

| Consumidor / input | SHA-256 |
|---|---|
| PA-1.1 | `cf67169c8a4a54aecd899daf90a77c2317b321583e666c5453df3bdfb847556d` |
| RS-1.1 | `b71b4393b21620481f4e8e918a9ab917d6119b036206861385af089d4fec026b` |
| EM-1.1 | `7a9ed8037ebe4a19efc38d6ebcc5d12f95c8e406852bd5956264d7686ad184e5` |
| PDR-1.1 | `f2ab6e3c019e247b566fbe0da4b85bf1a988e3575da68eb2a0d68da99de556a3` |
| WEA-1.0-final | `5f741d8586e5a25397280b2178126c90e6044a780cf312a8a19e3fd3d7f6c902` |

São reutilizados os PASS documentais r1 de factualidade primária decisiva e recomendação por rota; neutralidade/fidelidade/Strength app-first; provenance/confidence/trace; agência/concorrência/undo; intenções/webhook/normalization/adaptation; unknown/retry/consistência; associação/multisource/história; permissões; LLM/HOLD; classificação dos 32 itens e gaps. Nos três arquivos alterados, os diffs deixam esses contratos intactos e acrescentam a precedência antes ausente. PA/EM apontam à observação/decisão da mesma referência; RS/PDR G07/G09 conservam minimização, realização e prova futura. Não há novo objeto, destino, prescrição, compartilhamento, autonomia, provider ou coleta para propagar aos demais consumidores.

A cobertura combinada é **r1 sobre os trechos/inputs inalterados + r2 sobre o delta identificado**, nunca transferência do FAIL histórico para PASS. Fontes oficiais não foram buscadas novamente porque nenhuma afirmação factual mudou. SCI/PRO/COM permanecem fora de signoff científico/profissional/comercial deste juiz.

## 4. Conclusão e handoff

**PASS — fechamento documental Engineering C/D nas revisões/hashes avaliados; sem blocker Engineering documental remanescente.** O finding material r1 está resolvido. Chief pode consolidar este parecer com os demais domínios e publicar somente dentro do contrato da missão.

G06 permanece requisito de acesso/entitlement/custo/fidelidade/device antes de declarar rota suportada; G07 exige operações/dados/base/retenção reais; G09 exige testes executáveis de anti-replay, concorrência, idempotência, reconciliação, autorização e realização. Esses limites já pertencem ao inventário aprovado para a etapa dependente: este PASS não os fecha nem autoriza implementação. O controle equivalente, se necessário por retenção, deverá provar o mesmo resultado na realização; texto não prova mecanismo implantado.

Não julgo fisiologia ou legalidade profissional, nem substituo Security. Não se declara UX Spec/Figma/UI pronta, conta/provider aprovado, treino seguro/eficaz ou runtime pronto. Nenhum código, API/schema/stack, signup, gasto, spike, Figma ou UI foi iniciado. O r1 ficou intacto e apenas este report foi criado pelo juiz. **STOP após este handoff.**
