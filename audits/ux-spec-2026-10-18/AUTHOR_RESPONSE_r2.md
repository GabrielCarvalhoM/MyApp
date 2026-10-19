# Resposta do autor aos reviews r2 — UXS-1.0-r2 → UXS-1.0-r3

| Campo | Valor |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1 · passada editorial limitada aos 10 NON_BLOCKING dos reviews de r2 |
| Autor | Product/UX Architect 1.2.0, worker autor único da especificação (não é judge) |
| Revisão avaliada | UXS-1.0-r2 · SHA-256 `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec` |
| Revisão corrigida | `product/UX_SPECIFICATION.md` UXS-1.0-r3 · SHA-256 `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb` · 197 995 bytes |
| Reviews de entrada | UX_REVIEW_r2 (UXS-UX-17–20), AI_REVIEW_r2 (UXS-AI-R2-01/02), ENGINEERING_REVIEW_r2 (UXS-ENG-r2-01/02), SECURITY_REVIEW_r2 (UXS-SEC-10/11); todos PASS WITH NON-BLOCKING FINDINGS sobre r2 |
| Escopo | Só os 10 findings. Nenhuma outra edição de conteúdo; atualizações de bookkeeping (cabeçalho, §24 e §26) limitadas ao que mudou. |

## 1. Contagem por disposição

**10 findings: 10 CORRECT · 0 ACCEPT · 0 DEFER · 0 REJECT · 0 ESCALATE.** Sobreposições tratadas uma vez: UXS-UX-20 ≈ UXS-ENG-r2-01 ≈ UXS-AI-R2-02 (CONF-16); UXS-UX-19 ≈ UXS-ENG-r2-02 (pausa retroativa). Nenhum componente foi dado como resolvido fora da autoridade do autor: a nota ao owner do AEOS (UPSTREAM-ISSUE-04), o catálogo de construtos (DEP-15) e a prova de recall da extração (G09) ficam com seus owners.

## 2. Finding → disposição → mudança

| Finding | Disp. | Mudança feita | IDs alterados / novos |
|---|---|---|---|
| UXS-UX-17 | CORRECT | ST-MAR passa a elegibilidade por fato registrado (horizonte só é marco com pelo menos uma sessão realizada ou descanso honrado registrado nele); critérios são de Product/UX (O001/O008 se virarem métrica), FD-02 fica só com representação/copy; HOJ-S8 mostra o marco mais recente até ser aberto/dispensado ou substituído por um mais novo. | ST-MAR, HOJ-S8 |
| UXS-UX-18 | CORRECT | (a) NAV-10 alinhado a AGT-03/08; a conversa só localiza SURF-13, sem abrir FLOW-15; (b) exceção explícita: o candidato vê o nome de exibição de quem convidou (CRW-23e); (c) caminho normal “vigente com continuação proposta → nova revisão” e “horizonte encerrado” rotulado como exceção DEG-31; (d) “iminente” = preparação/execução aberta agora. | NAV-10, CRW-04, CRW-17, ST-PLAN, SURF-02, HOJ-R8 |
| UXS-UX-19 ≈ UXS-ENG-r2-02 | CORRECT | Semântica (a) do Engineering: registro retroativo em FLOW-14 (modo período passado, OBJ-13) só anota o intervalo como pausa declarada no histórico e no contexto do motor; não cria `INTERRUPTED_DECLARED` corrente, não encerra o vigente, não oferece pausa de Crew nem exige `RETURNING`; reavaliação segue §10 (eventual RETURN/REPLAN como MAN-3); decisões passadas intactas (EXP-07). | ST-CTN, HOJ-C23, J-21, FLOW-14 |
| UXS-UX-20 ≈ UXS-ENG-r2-01 ≈ UXS-AI-R2-02 | CORRECT | CONF-16 reformulada como manifestação de resultado oficial: o motor registra o início com proposta pendente como evento de agência no trace e no estado de estabilidade, ligado às razões da proposta `STALE`; a não reproposição do restante da execução iniciada é resultado de estabilidade (AEOS §14), sem filtro de UX; proposta composta vai inteira a `STALE`; demais sessões recebem sucessora normal conforme MAN-R4, sem novo NOT-A salvo efeito materialmente diferente; safety imediata. Como o AEOS não nomeia esse evento, registrada nota de consumidor ao owner do AEOS. | CONF-16, §24.3 · **UPSTREAM-ISSUE-04** |
| UXS-AI-R2-01 | CORRECT | AGT-13: “sessão dependente” = escopo oficial de HC03 quando existir, senão toda sessão da janela corrente ou iminente (HOJ-R8), nunca juízo do LLM; catálogo de construtos inventariado em §22 (relevância a safety e materialidade em G02/G04, sensibilidade em G07); eficácia condicionada ao recall da extração, avaliado em G09. AGT-05 referencia o catálogo. | AGT-13, AGT-05 · **DEP-15** |
| UXS-SEC-10 | CORRECT | RUN-13: localização/sensores só derivam as métricas de execução da sessão; dado bruto fora do contexto do motor além dessas métricas, de I10, do agente/LLM e de inferência de locais frequentes; sem rota/mapa nem retenção de traçado bruto na V1 (mapa/rota seria finalidade nova via G07 com Security); sem coleta em pausa salvo necessidade técnica declarada; nenhuma coleta antes de G07/G09. A minimização vira critério de aceite em UPSTREAM-ISSUE-01; a opção INCLUIR da FD-03 cobre só métricas de execução; AGT-10 exclui dados brutos de localização. | RUN-13, UPSTREAM-ISSUE-01, FOUNDER-DECISION-03, AGT-10 |
| UXS-SEC-11 | CORRECT | “Efêmero” e “sem persistência” delimitados ao produto; nenhuma superfície promete não retenção pelo provedor sem contrato e verificação em G07/G09; destinatário e retenção reais em FLOW-15/SURF-13 antes do primeiro uso; sem seleção, o canal não existe e as explicações ficam em template (AGT-00, inalterado). | AGT-01, AGT-13, AGT-10 |

## 3. Lista exata de IDs alterados

Cabeçalho (Revisão, Nota de revisão); SURF-02 (Estados); NAV-10; FLOW-14; ST-PLAN; ST-CTN; ST-MAR; HOJ-S8; HOJ-R8; HOJ-C23; RUN-13; CONF-16; CRW-04; CRW-17; AGT-01; AGT-05; AGT-10; AGT-13; J-21; UPSTREAM-ISSUE-01; FOUNDER-DECISION-03; §24 (revisão no quadro; §24.3 cita UPSTREAM-ISSUE-04); §26 (quadro do artefato; limitações). **Novos:** UPSTREAM-ISSUE-04, DEP-15. Nenhuma INT alterada ou criada; nenhum outro ID tocado.
