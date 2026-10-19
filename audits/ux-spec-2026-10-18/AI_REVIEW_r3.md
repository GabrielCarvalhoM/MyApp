# AI Systems — revalidação de delta r3 da Detailed UX Specification

**Veredito: PASS** para **UXS-1.0-r3**, SHA-256 `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb`. Mantém o **AI_BOUNDARIES_REVIEWED** documental nesse hash.

**Contagem:** 0 BLOCKING · 0 MATERIAL · 0 NON_BLOCKING. UXS-AI-R2-01 e UXS-AI-R2-02 estão **RESOLVED**. Não há regressão nem ampliação de autonomia ou autoridade. `ESCALATE_IF` não foi acionado.

Este parecer não emite AI_SYSTEM_READY, não escolhe modelo nem provider e não executa evals.

## 1. Contrato e método

| Campo | Valor |
|---|---|
| Unidade | UXSPEC-20261018 · U6 · revalidação de delta r3, limitada pela decisão D-UXS-06 do Chief |
| Avaliador | AI Systems & Agent Experience Architect 1.1.0, judge independente. É uma instância nova que substitui a judge de r2, perdida por limite de cota, no mesmo papel. Não é autor nem coautor e não alterou o artefato. |
| Artefato | `review-inputs-r3/UX_SPECIFICATION.md`. Hash recalculado no início: confere com `598b055d…`. A base r2 `review-inputs-r2/UX_SPECIFICATION.md` também confere (`092ec033…`). |
| Integridade do diff | `DIFF_r2_r3.patch` é idêntico, byte a byte, ao `git diff --no-index -U1 --word-diff` recalculado entre as duas cópias congeladas: 29 inserções e 26 remoções de linha. O diff cobre, portanto, todas as mudanças. |
| Inputs | AI_REVIEW_r2, AUTHOR_RESPONSE_r2, DIFF_r2_r3.patch e as linhas do r3 tocadas pelo diff. Nada fora do diff foi reaberto. |
| Sobreposição | AI-R2-02 ≈ UX-20 ≈ ENG-r2-01 (CONF-16). Este parecer julga só o limite de IA: manifestação vinda do resultado oficial versus filtro de UX. |

## 2. Findings de r2

| Finding | Sev. r2 | Resultado | Evidência em r3 |
|---|---|---|---|
| UXS-AI-R2-01 — fontes determinísticas de AGT-05/AGT-13 sem inventário | NB | **RESOLVED** | **(i)** AGT-13 define “sessão dependente” como “o escopo oficial de HC03 quando existir; senão, toda sessão da janela corrente ou iminente (HOJ-R8); nunca por juízo do LLM”. É a formulação recomendada. **(ii)** O novo DEP-15 inventaria o catálogo de construtos, com classificação “sempre determinística por construto, nunca por juízo do LLM”. Owners: G02/G04 para relevância a safety e materialidade, G07 para sensibilidade, G09 para a eficácia da extração. AGT-05 e AGT-13 referenciam DEP-15. **(iii)** O limite foi registrado: “A eficácia depende do recall da extração de enunciados de safety, avaliado em G09 (evals adversariais e negativos), não neste documento.” §26 lista DEP-15 como dependente. |
| UXS-AI-R2-02 — CONF-16 ancorada no resultado oficial, não num filtro de UX | NB | **RESOLVED** | CONF-16 diz agora: “O motor registra o início com proposta pendente como evento de agência no trace e no estado de estabilidade, ligado às razões da proposta `STALE`.” A não reproposição vem do “resultado oficial de estabilidade (AEOS §14)”, e “a UX só manifesta esse resultado e não filtra resultado oficial”. O novo UPSTREAM-ISSUE-04 leva a nota ao owner do AEOS + Engineering: o evento não é `DECLINED` e não tem nome; safety fica sem cooldown. Até a resposta, “CONF-16 descreve o resultado esperado sem filtro de apresentação”. Essa queda é a correta: se o motor repropuser, a UX manifesta a reproposição e não a esconde. A proposta composta vai inteira a `STALE` (INT-10). As demais sessões seguem a avaliação sucessora normal (MAN-R4), sem novo NOT-A salvo efeito materialmente diferente, critério coerente com CONF-15. A materialidade fica com o motor/policy, nunca com o LLM. A safety imediata (CONF-10) foi preservada. O §24.3 inclui UPSTREAM-ISSUE-04 como retorno ao Architect. |

## 3. Regressões no diff r2→r3

| Eixo | Conteúdo do diff verificado | Resultado |
|---|---|---|
| Autonomia e autoridade do agente | NAV-10 passa a seguir AGT-03/08: FLOW-02 para opção preparada, FLOW-05/SURF-11 para fato confirmado, FLOW-04 sem preenchimento. A conversa “só localiza SURF-13; não abre FLOW-15 nem altera consentimento (AGT-04)”. Isso remove uma saída para FLOW-15 que existia em r2. AGT-10 exclui também “dados brutos de localização/sensores (RUN-13)”. RUN-13 retira esse dado do agente/LLM. AGT-13 só estreita o comportamento. | **Sem regressão**: as capacidades diminuíram. |
| Fidelidade da explicação e proveniência | AGT-01 e AGT-13: “efêmero” e “sem persistência” passam a valer só “no produto”. Nenhuma superfície promete não retenção pelo provedor sem contrato e verificação em G07/G09. Destinatário e retenção reais aparecem antes do primeiro uso (AGT-10). Com isso, o sistema deixa de fazer uma afirmação sobre si que não pode garantir. | **Sem regressão**: o texto ficou mais honesto. |
| LLM como explicador opcional | As menções novas a LLM (AGT-13, DEP-15, RUN-13) são todas restritivas. A seleção condicional do agente ou explicador (AGT-01/10) é a de r2. AGT-00 e ALT-UX-08/FD-01 não aparecem no diff. | **Sem regressão.** |
| Invisibilidade do JEV shadow | O diff não menciona o JEV. Há 8 linhas com “JEV” em r2 e em r3. | **Sem regressão.** |
| Partes não-IA com efeito no motor | ST-CTN, FLOW-14, HOJ-C23 e J-21: o registro retroativo de pausa é um fato declarado diretamente pela pessoa, e a reavaliação segue §10/MAN-3. ST-MAR: a elegibilidade vem de fato registrado, “nunca por classificação de aderência”. Nenhuma das duas dá papel ao LLM/JEV nem cria efeito sem ato da pessoa. | **Sem regressão.** |

**Observação (não é finding):** HOJ-R8 passou a definir “iminente” como a sessão cuja preparação ou execução está “aberta agora”. Isso delimita o ramo de fallback de AGT-13 à janela corrente mais a sessão aberta. Fora desse escopo, a contenção continua por três vias: a declaração universal de que o candidato não é considerado, a regra “a decisão nunca muda por fato não confirmado” e AGT-12. Fica sugerido que os evals de G09 sob DEP-15 incluam a pergunta sobre uma sessão de outra janela com candidato de safety pendente. Não há mudança a fazer neste artefato.

## 4. Limites e handoff

- O parecer é documental e se restringe ao diff r2→r3. Os resultados de r1/r2 sem mudança continuam valendo por referência.
- **Continua não demonstrado:** catálogo de construtos (DEP-15), templates (DEP-13) e validador em execução; recall da extração de safety; latência e custo; observabilidade de IA; utilidade do LLM ou do JEV frente ao B0.
- **Dependências abertas com owners:** UPSTREAM-ISSUE-04 com o owner do AEOS + Engineering; DEP-15 com G02/G04/G07/G09.
- Se o AEOS mudar a semântica de estabilidade, a cobertura de CONF-16 deixa de valer.

Emissor: judge AI Systems → Chief. **PASS — AI_BOUNDARIES_REVIEWED documental para UXS-1.0-r3 no hash acima.** Nenhuma implementação, Figma, modelo, provider ou pesquisa é autorizada. **STOP deste judge.**
