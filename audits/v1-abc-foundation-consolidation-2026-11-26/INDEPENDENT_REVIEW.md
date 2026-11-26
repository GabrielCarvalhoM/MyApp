# Revisão independente

Revisores separados do autor, cada um em sessão própria, somente leitura, com o código e as perguntas, sem as conclusões do autor. O autor não aprovou nenhuma correção própria: a rodada 2 de QRE verificou as correções.

| Rodada | Revisor | Escopo | Veredito |
|---|---|---|---|
| R1 | **QRE + Security + Integração** | `237797c..a33a2bb` (código, fixtures, testes) | **READY_WITH_CONDITIONS**: 2 HIGH, 4 MEDIUM, 3 LOW, 2 NOTE |
| R1 | **SSCTR** (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; não humano, não clínico) | S1–S5 (decisões esportivas e de segurança do contrato) | **READY_FOR_SYNTHETIC_PARALLEL_IMPLEMENTATION_WITH_CONDITIONS**: S1–S5 ACCEPT_WITH_CONDITIONS |
| R2 | QRE (recheck estreito) | `a33a2bb..f9cbdb4` | **READY_WITH_CONDITIONS**: os dois HIGH fechados; 3 LOW residuais e 2 lacunas a registrar; nada bloqueia o início sintético |

O que o QRE rodou nas duas rodadas: os 3 conjuntos de testes (Node, CoachingPresentation, IntegrationContracts), `npm test` do CoachingCore (1952/1952/0; 53 históricos), a regeneração das fixtures (`diff -r` idêntico) e o diff vazio em `CoachingCore`. Probes do revisor: `probe1.mjs`–`probe4.mjs` no scratchpad da sessão.

## QRE / Security

| Id | Sev. | Achado | Resolução | R2 |
|---|---|---|---|---|
| QRE-ABC-01 | HIGH | `loggedEntries` escondia a parada por sintoma do atleta numa sessão em que o aparelho registrou "completo 40 min" (topo da linha = aparelho; voz sem `stop`) | vozes com `stopReason`/`exercises`; fatos do atleta lidos da voz do atleta; fixture `P-logged-conflict` + teste Node | **CLOSED** (nota: com várias vozes do atleta, o topo traz a primeira; a tela lê as vozes, regra no handoff C) |
| QRE-ABC-02 | HIGH | `ReadinessDeclaration` não codificava `runningNotRestricted`: saída do hold inalcançável com restrição de membros inferiores | campo + teste das chaves aninhadas + e2e "restricted" | **CLOSED** |
| QRE-ABC-03 | MED | `improved` só booleano; várias condições pedem mapa e a união dos sinais | `Improved.single/.perCondition`, `init(askingWarningSigns:)`; a lista vem de `missingInputs` (A) | **CLOSED** (contrato); trabalho de A registrado |
| QRE-ABC-04 | MED | tempo em zona: resposta fechada ainda levava a distribuição; portão era parâmetro | `TIME_IN_ZONE_GATE` congelado, resposta fechada sem distribuição, acessor só de revisão | **CLOSED** (o acessor só é contido por grep: gate de A) |
| QRE-ABC-05 | MED | dedupe podia perder um treino (relato ainda não feito); não cobre relato manual | `holdUntilRecordingSettles`; sobreposição sobre o intervalo maior | **CLOSED** com lacuna **FND-ABC-06** (dupla contagem nos dois sentidos) registrada no contrato §12; reavaliação dos treinos em espera = B |
| QRE-ABC-06 | MED | FND-ABC-04: a segurança depende só do portão de A | teste de aceite de A (inclusive após reinstalar) | dono A |
| QRE-ABC-07 | LOW | comentário dizia que apagar exige consentimento; fixture vazia | comentário corrigido; fixture apaga linhas reais | **CLOSED** |
| QRE-ABC-08 | LOW | tabela de zonas escrita num teste Swift | zonas lidas da fixture do motor | **CLOSED** |
| QRE-ABC-09 | LOW | `precondition` derrubaria o app; `.faster` na prontidão | inits que lançam; `ReadinessReturnSpeed` no armazenamento | **CLOSED** depois da R2 (resíduo corrigido antes da tag) |
| QRE-ABC-10 | NOTE | `received` ecoa o próprio runner; `distanceKm` sem autoria no nome | `declaredDistanceKm`; comentário do teste corrigido | **CLOSED** depois da R2 |
| QRE-ABC-11 | NOTE | modelo de concorrência fiel, mas o lock entre processos não é modelado e o CAS só é atômico sob o lock | registrado: A implementa os dois nativamente | dono A |

Limpo segundo o revisor: nenhuma chave reservada vaza; `specialPopulation` sempre enviado; flags e sinais sem resposta omitidos; observações = `OBSERVATION_KEYS.ATHLETE`; revisões ⊆ `CLIENT_REVIEW_FIELDS`; `IntakeCustodyMode` não codifica intake real; nenhuma zona, percentual ou ritmo recalculado em código de produção; nada em `HealthIngest` diz "negado"; a mudança da trava está correta.

## SSCTR (decisão SSCTR-ABC, 2026-11-26)

| Item | Decisão | Condições aplicadas nesta missão | Condições para as frentes |
|---|---|---|---|
| S1 corrida avulsa → "Não estou 100%" | ACCEPT_WITH_CONDITIONS | e2e: flag "sim" na rota → `CLINICAL_HUMAN_REQUIRED`/`BLOCKED` | C: pergunta obrigatória, rota imediata, relato salvo à parte, cópia (sem "leve", nunca "liberado"); A: rota abandonada → `screenRequired`. **Lacuna para Core + dono G04:** a rota não pergunta X1 (sinal urgente com exercício) |
| S2 portão FND-ABC-04 | ACCEPT_WITH_CONDITIONS | cobre toda razão de população e escopo; **restart clínico também** (verificado: o plano anterior continua executável → `clinicalHumanRequired`, FND-ABC-04b) | A: persistência como SEC-FPV-01, liberação só por intake aceito ou apagamento; C: cópia de escopo, não de contraindicação; histórico/registro/consentimento/apagamento continuam disponíveis |
| S3 tempo em zona | ACCEPT_WITH_CONDITIONS (só o contrato fechado) | sem distribuição sob o portão | C10 decide zonas atuais × vigentes no treino; até lá "com suas zonas atuais", aviso óptico, sem gráfico parcial |
| S4 dedupe | ACCEPT_WITH_CONDITIONS | espera em vez de descarte; gravação curta dentro de corrida longa não descarta | B: contar evidência perdida; nunca pré-preencher a distância do iPhone; FND-ABC-06 |
| S5 histórico | ACCEPT_WITH_CONDITIONS | fatos do atleta da voz do atleta (teste) | C: nunca mostrar o `historyReference` (menor das duas) como "a distância"; mesclada → "não salva como sessão separada" com reenvio |

Gatilhos de nova revisão SSCTR: correção no motor de O-1, FND-ABC-01 ou FND-ABC-04; revisão C10; mudança da regra de dedupe; qualquer portão de atleta real. Itens clínicos: CLINICAL_HUMAN_REQUIRED (leitura de sinal e retorno após sinal; liberação na gestação/pós-parto).

## Resultado

**INDEPENDENT_REVIEW_PASSED = YES**, nos termos dos vereditos: nenhum BLOCKER, nenhum HIGH aberto; o que segue aberto tem dono e não bloqueia o início paralelo em modo sintético.
