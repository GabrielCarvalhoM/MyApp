# Revisão independente DELTA 0.2 — concurrent / hybrid / interference

Data: 2026-10-22, America/Sao_Paulo. Input: `outputs/foundation-audit/v1-training-domain-foundation-0.2`, versão `TDF-0.2-review-input` do manifesto. Escopo: correções dos achados HYB-01–08 do parecer 0.1; não é novo parecer clínico/esportivo humano. Ownership apenas deste review. Nenhum artefato do pacote foi editado por esta instância.

**Veredito: READY WITH FIXES para revisão humana delimitada de estrutura, vocabulário, metadata e casos sintéticos.** Não é Product/Domain Truth, modelo de custo calibrado, política aceita, prova de segurança/eficácia ou runtime validado. Nenhum P0/P1 remanescente identificado que impeça esse handoff delimitado. Duas correções P2 de precisão de timing/composição são pequenas e recomendadas antes de enviar o pacote.

**Atualização r2:** os dois P2 documentais foram corrigidos e verificados no addendum ao final; a descrição anterior é histórico do primeiro snapshot. As pendências atuais são de revisão/decisão dos responsáveis de domínio, preservando READY WITH FIXES nesse escopo.

## Evidência de input e limites

- Recalculei SHA-256 e tamanho dos 15 arquivos: 15/15 coincidiram com `review-input-manifest-0.2.json` lido nesta revisão. Esta conclusão se refere a esse snapshot; edição posterior requer novo manifesto e disposition do delta relevante.
- Li o resultado `checks-0.2.json`: 40 PASS/0 FAIL, declarado estritamente como consistência dos exemplos. Não o interpretei como validação fisiológica, runtime ou aprovação profissional.
- Fiz inspeção independente dos contratos, modelo compartilhado, overview, source ledger/limites, mapping/prep e exemplos de agenda, dose, reconciliação, alternativas e observação parcial.
- Recalculei: 32 Strength + 17 Run; 49/49 demand estimates UNKNOWN/null; 49/49 approvals nulos; campos candidatos Strength restringem-se a objective_tags/status; 14/14 cenários mantêm ação/efeito esperado nulos e NOT_EVALUABLE_DOMAIN; oito dimensões do único perfil de demanda exemplificado estão UNKNOWN sem comparador; perfil NOT_ESTIMATED.
- Os limites científicos novos foram comparados com fontes primárias/abstracts PubMed já verificadas no parecer 0.1. Não realizei nova revisão sistemática nem leitura integral de artigos fechados. Fonte checada não é modelo aprovado.

## Disposição dos achados 0.1

| Achado | Disposição no escopo de review humano | Evidência atual / limite |
| --- | --- | --- |
| HYB-01, bandas sem constructo/comparador | CORRECT para o risco de falsa comparabilidade; calibração DEFER para domínio | Shared Model exige constructo, dose/configuração, atleta, comparador/método/regra e validade. UNKNOWN é não ordenado e não zero. Nenhuma banda é consumível sem ancoragem. Não se exigiu inventar uma escala. |
| HYB-02, custo fixado na identidade | CORRECT | Todos os 49 estimates são UNKNOWN/null e as faixas fixas foram removidas. Os valores antigos permanecem somente no input 0.1 preservado. Identidade e objetivo candidato não provam demanda. |
| HYB-03, contexto e custo misturados | CORRECT | Prioridade/criticality/schedule ficam no contexto; novelty no histórico; systemic é hipótese resumo opcional não aditiva. Regiões/músculos/aspectos mecânicos são projeções da mesma exposição, não cargas a somar. |
| HYB-04, planned/observed e double counting | CORRECT como contrato/documentação; implementação DEFER | Reuso SIS ExposureContribution/FactRef/active revision/segment; doses observadas substituem somente a cobertura prevista correspondente. Prefixo conhecido, passado desconhecido e futuro válido são distintos. Manual/wearable apontam o mesmo fato rev2, que substitui rev1. `planned_or_observed` é base da exposição, enquanto provenance DERIVED_ESTIMATE deixa claro que demanda pode seguir inferida. |
| HYB-05, interferência sem efeito/horizonte | CORRECT no contrato; assessments concretos DEFER | InteractionAssessment reutiliza SIS, com endpoint/constructo, agudo/crônico, horizonte, população/dose aplicável e efeitos/unknowns por alternativa. InterferenceAssessment ambíguo foi substituído. A regra não soma penalidade nem afirma causalidade. |
| HYB-06, labels tratados como materializações | CORRECT para submissão delimitada, sem fechamento esportivo | Agora há atleta sintético, dose/horário/configurações, cenário por override, opções KEEP/menos volume/MOVE, histórico e observação. C4(5/6), C5 e efeitos positivos permanecem explicitamente incompletos. Mapping informa cobertura parcial sem fingir witnesses aprovados. |
| HYB-07, RIR acima equivale a maior carga | CORRECT | S12 mantém RIR3 e usa uma quarta série como desvio concreto; texto explica direção de RIR. Comparabilidade/materialidade ficam para G02/G03. |
| HYB-08, evidência ampla demais | CORRECT como ledger de limites | Evidência separa adaptações crônicas e acute/24h; RIR estimado/meta-regressão não é recovery; revisão TID não valida bandas; concurrent group-average null não é readiness; squat commentary é level5. Todos esses anchors continuam sem validar o vetor completo ou tags individuais. |

## P2 remanescentes e menor correção

### HYB2-01 — timing S01 precisa distinguir start-to-start de end-to-start

Local: `DOMAIN_REVIEW_FIXTURES.json`, sessões lower-mon/run-tue e pergunta S01; `SCENARIO_DOMAIN_MAPPING.md`, S01; `G01_G04_REVIEW_PREP.md`, G02.

lower-mon começa em 26/10 18h e termina 19h; run-tue começa em 27/10 7h. Isso é **13h entre inícios e 12h entre término e próximo início**. O pacote chama o intervalo de “13h gap”, enquanto a pergunta C2 reconhece end-to-start. Para espaçamento, a referência temporal faz parte do constructo. O problema é descritivo, não uma recomendação sobre se 12h ou 13h é adequado.

Correção mínima: explicitar “13h start-to-start / 12h end-to-start” e evitar chamar ambos de gap. Recalcular somente horários/relatos afetados; nenhum cutoff científico ou policy deve ser criado.

### HYB2-02 — composição de overrides de agenda precisa de uma frase explícita

Local: `SCENARIO_DOMAIN_MAPPING.md`, instrução de resolver base/overrides; `DOMAIN_REVIEW_FIXTURES.json`, C2 e deltas MOVE de S01/S02.

C2 referencia a sessão lower-mon originalmente na segunda, mas fornece horário na terça no bloco `double`. Para review humano, a intenção é inferível; para tornar a representação inequívoca, deve constar que o horário do branch substitui a agenda da mesma sessão, sem criar uma nova exposição nem manter simultaneamente a original. Deltas MOVE informam new_start, mas não dizem como transportar o end; herdar literalmente o end antigo criaria intervalo inválido.

Correção mínima: documentar que branch C2 substitui os horários das sessões referenciadas, cada Ref continua uma única sessão; MOVE preserva duração da sessão por padrão e recalcula end, salvo override explícito de duração. Isso é semântica de fixture, não runtime ou regra esportiva.

## Cobertura e inferências permitidas

S01/S02 agora podem ser discutidos a partir de doses/configurações/tempos e prioridade sem que uma inversão de prioridade altere a exposição física. Nenhum exemplo demonstra que KEEP é inadequado ou MOVE mínimo. C1 e S29 exercitam lineage/segmentos, correção e prefixo parcial, sem confundir desconhecido com zero. C2 tem par no mesmo dia e próxima sessão; C3 tem alternativas concretas, mas efeitos e viabilidade permanecem unknown antes de Pareto. C4 não mascara ausência de witnesses níveis5/6. C5 tem evento/fase/cancelamento, não taper recipe. C6 materializa um envelope sintético de controle sem dizer que foi profissionalmente aprovado.

O único TrainingDemandProfile preenchido é de Strength e contém apenas UNKNOWN. Não demonstra um estimador Run×Strength; isso é explicitamente compatível com o escopo atual. A linguagem compartilhada permite formular as perguntas e registrar projeções, não comparar fisiologia por um índice. Um próximo exemplo Run com o mesmo shape só será útil se exercitar uma necessidade concreta de review; não é pretexto para preencher bandas fictícias ou ampliar catálogo.

A preparação G01–G04 agora dá uma submissão por regra/receita/metadata com população, exclusões, protocolos, essencial stimulus, alternativas menores, horizonte, missing/conflict, assinatura/disposition e limites. É suficiente para começar a revisão do subconjunto representado. Profissionais ainda podem rejeitar dados/constructos/doses ou limitar cobertura; não precisam endossar o pacote inteiro. Falta de calibração crítica impede a decisão dependente, não registro factual independente.

## Handoff recomendado

Aceitar as correções conceituais e preservar o limite READY WITH FIXES. Corrigir os dois P2 documentais antes de entregar quando possível e atualizar manifesto/checks dos arquivos afetados. Não abrir nova rodada de expansão de ontology ou pesquisa sem pergunta que mude decisão. A próxima etapa pode ser human sports-domain review delimitada, com G01–G04 e os oito QUESTIONABLE preservados. Não há exigência desta perspectiva de uma0.3 abstrata, runtime, novos scores ou doses profissionais fabricadas.

## Addendum — delta r2 verificado

Manifesto atual: `TDF-0.2-review-input-r2`. A submissão anterior permanece em `review-input-manifest-0.2-submission1.json` e `review-snapshot-0.2-submission1.zip`; não foi reescrita. Comparei os dois manifestos e confirmei exatamente quatro arquivos alterados. Recalculei seus bytes/SHA-256; todos coincidem com r2. Os onze demais hashes permanecem iguais ao snapshot originalmente revisto. Este addendum limita-se ao delta; não houve revisão integral ou nova pesquisa científica.

| Arquivo alterado | Bytes | SHA-256 r2 verificado |
| --- | ---: | --- |
| CHANGELOG.md | 2035 | `7bb11187f169c460f12cae78b5657dbe955f314d282513abf9b3ec1a0f0e3228` |
| DOMAIN_REVIEW_FIXTURES.json | 79264 | `25afe0a483caacc2931bb09d5925ee319ab552302d79acf879318e5056153adb` |
| G01_G04_REVIEW_PREP.md | 6752 | `5d1b2a8ec49b86a90463c7b09eba6fab61d9b23f3f21cf572b4f775332c31bc4` |
| SCENARIO_DOMAIN_MAPPING.md | 4696 | `3a29f4facf670676bbce83af735062eafad4ecb87eff9339307af2a4f0f13fdc` |

- **HYB2-01 → CORRECT.** S01 identifica `46800s` start-to-start e `43200s` end-to-start; pergunta, mapping e prep distinguem13h/12h e não prescrevem cutoff.
- **HYB2-02 → CORRECT.** `fixture_composition` declara que C2 substitui a colocação temporal das mesmas sessões, sem adicionar exposições. MOVE explicita novo início e término com duração preservada. Recalculei3600s para lower e2220s para Run, coerentes com os originais.
- **Delta correlato S13/S14 → ACCEPT.** Ambos referenciam run-tue/intended-threshold na mesma revisão; criticality HIGH/LOW é override de contexto, com dose/agenda/prioridade constantes. Isso melhora o contrafactual e não afirma mudança de custo físico.
- Li `FOUNDATION-AUDIT-20261022-check2`:43 PASS/0 FAIL, com o mesmo limite de consistência de artefatos. Reconfirmei independentemente que14/14 cenários mantêm NOT_EVALUABLE_DOMAIN e ação/efeito/aprovação nulos.

**Disposição r2:** nenhum P0/P1/P2 híbrido documental pendente identificado no delta. Mantém-se READY WITH FIXES para o handoff humano delimitado porque receita/comparadores/efeitos/autoridade de domínio continuam abertos; isso não é promoção a Truth, fechamento de G01–G04 ou reclassificação dos oito QUESTIONABLE. Sem pedido de nova versão abstrata ou nova rodada desta mesma revisão.
