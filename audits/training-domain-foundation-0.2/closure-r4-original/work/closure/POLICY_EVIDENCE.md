# AE Closure Round — política aplicável e evidência

Revisão **AE-POLICY-20261022-r4.1** · missão AE-CLOSE-20261022-r4 · data de consulta 2026-10-22, America/Sao_Paulo. Autoria de Research; **não é parecer independente nem aprovação profissional**. Escopo exclusivo: Etapa 3 e contratos condicionais consumíveis pelas fixtures. Dados estruturados: [policy.json](policy.json).

**Conclusão:** as autoridades atuais permitem fechar a descrição, a rastreabilidade e o comportamento na ausência de política. Elas não permitem declarar G01–G04 aprovados. Os quatro permanecem **HUMAN_REVIEW_REQUIRED / DOMAIN_APPROVAL_OPEN**. Nenhum profissional real, escopo assinado ou aceite de regras foi encontrado nos inputs examinados. Isso é ausência da prova exigida no projeto, não alegação de que profissionais não existam. Bibliografia e fixtures sintéticas não substituem essa prova.

## Contrato e proveniência

Responsabilidade desta instância: somente `work/closure/policy.json` e este arquivo; outros autores trabalham no mesmo projeto. Não foram editadas autoridades de produto, regras globais, Figma ou runtime. Ferramentas disponíveis e usadas: leitura local, escrita local autorizada e pesquisa web. Não houve contato com pessoas, coleta com atletas ou delegação.

Modo **EVIDENCE_AUDIT + VALIDATION + CHALLENGE**, usando evidence-synthesis 1.1.0 e RESEARCH 1.2.0. Pergunta decisória: quais decisões da missão podem receber um contrato documental materializável sem falsificar suporte esportivo, e qual prova continua necessária para prescrição real? Parada: fontes adicionais não mudam o limite de autoridade nem as restrições de contrato. O alvo não é uma revisão exaustiva da ciência do treinamento.

Foram inspecionados PDR §5 e freeze; AEOS §§9–10/17–18; SIS §§1.1/3–7; RIL §§1.1/3–9; STIL §§1.1/2–9; e `reviews/sports.md`. Revisões e hashes constam no JSON. As fontes locais são normativas ou reviews documentais, **não observações de eficácia**. A filtragem EXP-AUTH-r1 mantém os limites esportivos vigentes. Este suplemento de fechamento não altera o PDR nem cria registry paralelo de gaps/policies.

## G01–G04 recuperados literalmente

Fonte: `inputs/product/PRODUCT_DECISION_REGISTER.md`, §5, linhas 168–171. Texto da coluna “Decisão exata, owner e prova necessária”:

| Gap | Texto exato |
| --- | --- |
| G01 Cobertura · DR-20/49; TR-G01/G-REG-2 | Founder aloca profissional real de Educação Física habilitado e recursos; profissional valida perfis adultos, objetivos/sessões Running, repertório/equipamento/progressão Strength, restrições/casos suportados; jurídico qualifica modelo de serviço. Prova: escopo versionado com casos positivos/negativos, não apenas bibliografia. |
| G02 Política e instrumentos · DR-08/17/20; TR-G02/03 | Autoridade de treino valida sinais que qualificam cada ação, prioridades/spacing, intensidade/volume, substituições, deload, freshness/referência pessoal, RPE/RIR e momento/âncoras de coleta; Engineering prova dispositivo/execução. Prova: política/rule IDs versionados, limites e cenários aceitos/rejeitados. |
| G03 Aderência · DR-20; TR-G05 | Product/UX com profissional de treino fixa critérios por modalidade/sessão, parcial e tolerâncias; prova por casos incluindo correção, desvio admissível e ausência de sync. |
| G04 Safety/retorno · DR-17; TR-G04/G-SAFE-1 | Profissionais competentes (médico quando avaliação clínica) aprovam classes concretas, urgência/copy, elegibilidade, restrição, liberação e retorno; treino cobre retorno não clínico, Engineering falha operacional. Prova: regras e casos versionados, evidência de reavaliação e responsável real. |

Suplemento freeze, linha 182, trecho exato relativo a G02: “Freeze: G02 inclui critérios profissionais versionados de adequação, necessidade/benefício material após Change Cost, hysteresis/stickiness e trade-offs Balanced; sem thresholds arbitrários.” A linha completa é preservada no JSON. AEOS §17 declara os slots PS01–PS04 `UNFILLED_EXTERNAL` até prova real; `SYNTHETIC_ONLY` não é aprovação.

| Gap | O que esta rodada entrega | O que ainda impede fechamento de domínio | Owner e trigger |
| --- | --- | --- | --- |
| G01 | Schema de cobertura/receita, condições de ausência, positivos/negativos exigidos; sem catálogo fictício aprovado. | Escopo real validado por profissional habilitado, perfis/casos/exclusões, repertório/receitas revistos, qualificação jurídica já exigida pelo PDR. | Founder aloca; profissional/jurídico aprovam antes de implementar regras/cobertura reais desse perfil ou declarar suporte. |
| G02 | 12 contratos rastreáveis de decisão/ausência e schema de regra com alternativas, adequacy, necessity, custo, horizonte e evidência. | Aprovação por regra/aplicabilidade, protocolos/âncoras/frescor, limites/envelopes e witnesses aceitos/rejeitados; prova Engineering onde dispositivo/execução afetar regra. | Autoridade de treino; antes de implementar como autoridade final ou ativar geração/adaptação/export prescritivos. |
| G03 | Revisão aceita como comparador, desconhecido separado, correção e desvios brutos preservados. | Critérios/tolerâncias por modalidade e sessão, parcial/comparabilidade, aceites de Product/UX e treino. | Product/UX + treino; antes de classificar/usar aderência automaticamente. |
| G04 | HOLD por causa/escopo/owner/saída; ausência de clearance automático; separação de retorno não clínico e clínico. | Classes concretas, urgência/copy, restrição/liberação/retorno e evidência de reavaliação aprovadas por responsáveis reais. | Treino e profissionais competentes; médico no clínico; Engineering no operacional. Antes da coleta/classificação/ação dependente e liberação de HOLD. |

Esses são os quatro gaps existentes; detalhar evidência residual não cria G12 ou um novo gate. HUMAN_REVIEW_REQUIRED não precisa bloquear registro factual independente, model update elegível ou fixtures sintéticas. Também não autoriza manter treino antigo como default “seguro” quando validade/autoridade está indeterminada.

## Evidence Ledger e decisões que as fontes realmente mudam

O JSON contém DOI, URL, desenho, população, acesso, direção, limitações, contraponto, confiança e decisão dependente para cada fonte. `OBSERVED` significa “reportado pela fonte”, não replicação pela equipe. As recomendações de contrato são `INFERRED`; as restrições já vigentes são `DECIDED`. Estudos presentes nas meta-análises e nos artigos primários podem se sobrepor: **não foram contados como confirmações independentes nem somados em amostra total**. Acesso por abstract foi identificado como tal. Algumas aberturas PubMed/PMC retornaram página antirrobô; as leituras de abstracts indexados foram recuperadas por busca no domínio, sem contornar acesso.

| Claim | Suporte e contraevidência | Inferência permitida para a missão |
| --- | --- | --- |
| CL-01 — proximidade Run × Strength não prova conflito material | [Schumann 2022, 43 estudos](https://pubmed.ncbi.nlm.nih.gov/34757594/): resultados diferem entre força máxima, hipertrofia e explosão. [Robineau 2016](https://pubmed.ncbi.nlm.nih.gov/25546450/) fornece um contexto mais restrito com resposta à separação temporal. | Distinguir objetivo/endpoint, tarefa e horizonte; a literatura não justifica um cutoff único nem prova a inadequação de KEEP em S01/S02. Confiança moderada na restrição contra universalização. |
| CL-02 — ordem de double é decisão condicionada | [Eddens 2018, dez estudos](https://pubmed.ncbi.nlm.nih.gov/28917030/) encontra resultado específico para força dinâmica. [Lee 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7224562/) mostra outros desfechos e contexto. | Preferência, objetivo e janelas são inputs; duas sessões viáveis no calendário não provam tolerância fisiológica. Ordem/distância exigem regra aplicável e próximo estímulo validado. |
| CL-03 — HRV exige protocolo e referência individual | [Vesterinen 2016](https://pubmed.ncbi.nlm.nih.gov/26909534/) individualizou timing; [Manresa-Rocamora 2021](https://pubmed.ncbi.nlm.nih.gov/34639599/) encontra benefícios de performance pequenos e não significativos no agregado. | Nem veto por uma noite nem imunidade a adaptação por ser “só HRV”. Sem protocolo aplicável, registrar/qualificar e abster-se da decisão dependente. Não definir número de noites por intuição. |
| CL-04 — relato e dado objetivo são complementares | [Saw 2016, 56 estudos](https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/) encontra responsividade de medidas subjetivas e inconsistência entre construtos. | Sinais locais/funcionais não são apagados por score favorável; convergência precisa de fontes/contexto, sem somatório mágico. Recovery debt pode ser estado sintético testável, não medida fisiológica certificada. |
| CL-05 — envelope autorregulado não equivale a mutação | [Huang 2025](https://pubmed.ncbi.nlm.nih.gov/40791980/) compara métodos; [Barnes 2026](https://pubmed.ncbi.nlm.nih.gov/42497844/) fornece contraponto primário sem superioridade geral. | Não bloquear execução do envelope previamente aceito. Não presumir aumento obrigatório, validade universal do RIR ou transferir protocolo de falha para o app. A distinção de execução/mutação já vem de AEOS/STIL. |
| CL-06 — taper é dependente de evento e população | [Wang 2023, 14 estudos](https://pubmed.ncbi.nlm.nih.gov/37163550/) encontra benefício médio; [Mujika 2000](https://pubmed.ncbi.nlm.nih.gov/10694140/) não mostra melhora significativa em oito corredores de meio-fundo. | Revalidar evento, prioridade, fase e horizonte; não importar percentuais/subgrupos como receita universal. Cancelamento remove a justificativa do evento e abre reavaliação, sem aumento compensatório automático. |
| CL-07 — retorno após lesão requer avaliação competente | [Ardern 2016, consenso de Bern](https://pubmed.ncbi.nlm.nih.gov/27226389/) trata retorno como processo compartilhado de gestão de risco. | Não derivar clearance de tempo, HRV, ausência de dor ou clique. O consenso não fornece automaticamente política G04 aplicável ao produto. |
| CL-08 — aderência/desvio e progressão são conclusões diferentes | SIS §6, RIL §8, STIL §§3/8 e PDR G03. | Não requer busca científica adicional: é semântica de produto. Medir desvio bruto é possível; rótulos/tolerâncias automáticos e crédito de progressão continuam condicionados. |

O estudo RIR de Graham & Cleather, DOI `10.1519/JSC.0000000000003164`, permanece no review r3. Sua identidade foi reconferida em [PubMed](https://pubmed.ncbi.nlm.nih.gov/31009432/), mas o abstract não estava disponível e o publisher não pôde ser lido nesta rodada. Não foi usado para acrescentar afirmação quantitativa nem preencher envelope novo. PMID 33337690 já excluído por retratação em r3 continua excluído. Resultados de busca secundários/reviews narrativos encontrados não foram usados como prova.

## Contratos utilizáveis pelas fixtures

IDs `PC-*` no JSON identificam **claúsulas deste suplemento derivadas das autoridades existentes**, não policies fisiológicas aprovadas ou novo registry. Cada fixture deve usar uma destas rotas, sem promover uma à outra:

1. **Contrato determinístico documental:** fatos explícitos de agenda/equipamento, precedência, presença/ausência de approval, lineage, envelope já aceito como premissa de controle, comparação de alternativas sob assessments congelados. Pode provar o mecanismo naquele modelo.
2. **Witness esportivo sintético:** atleta/semana concretos, doses simbólicas ou exemplificativas explicitamente sintéticas, assessments de adequação/demanda fornecidos como premissas. Pode ser materializável para harness, preservando a dependência esportiva ainda não aprovada.
3. **Witness de domínio aprovado:** requer recipe/rule/payload/ranges e casos aceitos/rejeitados com responsáveis e versões reais. Não existe promoção automática a esta rota por compilar fixture ou citar artigo.

KEEP → microadjust → volume/intensity → move → substitute → partial replan → significant replan é a ordem de investigação de suficiência. O nível não substitui adequacy: uma alteração pequena pode ser insuficiente e uma maior só se justifica com rejeição rastreável das menores. HOLD/ASK/RECONCILE são controles, não exercícios de menor dose. A extensão S01/S02 deve continuar condicional se “MOVE preserva estímulo e restaura adequação” for apenas um stub.

Para double/Balanced, o fixture pode instanciar horários, preferência e comparadores de Pareto. A preservação dos dois estímulos depende de assessments explícitos. ASK resolve preferência material entre alternativas já válidas; não resolve falta de política/dose/safety. Para taper, data/distância/prioridade/fase confirmadas fecham o contexto; a receita segue pendente quando não houver aprovação. Para autorregulação, `accepted_envelope_ref` tem versão imutável; escolher dentro é execução, expandir limite é nova proposta. Para retorno, `clearance_ref` é condição externa pertinente; nunca valor sintético apresentado como profissional real.

### Pacote mínimo para revisão humana, sem retrabalho genérico

O schema de submissão em `policy.json` exige: ID/revisão; aprovador/competência/escopo; população/elegibilidade/exclusões; receita/repertório/metadata e unidades; inputs, protocolo/âncoras/frescor/comparabilidade; regra de adequacy/materialidade/necessity/custo; alternativas e rejeições; horizonte; intervalos/envelopes e rationale; ausência/conflito; safety/agency; critério de reavaliação; evidence refs; positivos/negativos; assinatura/disposição por regra/versão e condições/retirada. Campos de aprovação ausentes ficam `null`, nunca preenchidos com “Research/LLM aprovou”.

Casos de entrada para esse pacote: S01/S02, S05/S12/S13/S14, S28/S29; C1 trajetória; C2 double; C3 Balanced; C4 Levels 1/2/4/5/6 quando exigirem efeitos esportivos; C5 evento/taper; C6 envelope/progressão. Profissional pode aprovar subset e rejeitar/out-of-scope outros. Esta rodada não exige que todo adulto/objetivo/evento fique coberto para sempre.

## Disposição de evidência e handoff

**EVIDENCE_PARTIAL_PROCEED_AS_EXPERIMENT**, estritamente para especificação documental e fixtures locais sintéticas reversíveis. Guardrails: `SYNTHETIC_ONLY`, sem entrega prescritiva a atleta, sem claim de eficácia/segurança, sem mutação real, sem preenchimento implícito de aprovação. Medição desta rodada: integridade das refs, presença de campos críticos, contraexemplos e consistência com a régua r3; não taxa de sucesso fisiológico. Stop: tentativa de exportar/prescrever com essas premissas, missing rule crítico, mudança de domínio/authority ou review independente REQUEST_CHANGES material.

Para a decisão **runtime prescritivo como autoridade final**, evidência **EVIDENCE_INSUFFICIENT** enquanto G01–G04 permanecerem abertos. Esse achado sustenta um limite de readiness; o veredito global da missão e sua auditoria pertencem ao owner e aos judges independentes. G09/G11 preservam seus triggers existentes e não foram fechados por esta pesquisa. O documento não declara validação clínica, paridade com coach nem segurança de uma sessão.

Self-check de autoria: definições exatas retidas; todos os claims materiais têm proveniência/limites/contraevidência; nenhum limiar universal criado; nenhum aprovador fictício; quatro disposições explícitas. Este self-check deve ser confrontado com os hashes atuais pelos reviewers. Próxima ação: consumir os contratos nas fixtures sem alterar a classificação de suporte; revisar o pacote e obter os aceites humanos descritos antes da implementação prescritiva dependente.
