# Rastreabilidade do pacote — TDF-HR-0.2-r1

**Derivado / NON-AUTHORITATIVE.** Data 22/10/2026, America/Sao_Paulo. Autor do pacote: /root (assistente). Revisor humano, credenciais, aceite e expected action: **não fornecidos / null**. Revisões de assistentes são documentais, sem equivalência a profissional humano.

## Entradas e autoridade

| Referência | Local portátil no repositório | Relação / limite |
|---|---|---|
| Foundation 0.2 / submissão TDF-0.2-review-input-r2 | [candidate status](../../../product/candidates/training-domain-foundation/0.2/README.md), [overview original](../../../product/candidates/training-domain-foundation/0.2/foundation/FOUNDATION_OVERVIEW.md) | 15 arquivos byte-identical; base de representação proposta. |
| Auditoria 0.1→0.2 | [relatório](../../../audits/training-domain-foundation-0.2/audit-original/RELATORIO_AUDITORIA.md), [disposição](../../../audits/training-domain-foundation-0.2/audit-original/REVIEW_DISPOSITION.md), [manifesto original r2](../../../audits/training-domain-foundation-0.2/audit-original/review-input-manifest-0.2.json) | READY WITH FIXES para revisão delimitada; G01–G04 abertos. |
| Closure AE-CLOSE-20261022-r4 | [relatório preservado](../../../audits/training-domain-foundation-0.2/closure-r4-original/outputs/closure-r4/RELATORIO_EXECUTIVO.md), [fix01.json](../../../audits/training-domain-foundation-0.2/closure-r4-original/outputs/closure-r4/fix01.json), [revisões/limites](../../../audits/training-domain-foundation-0.2/closure-r4-original/outputs/closure-r4/review-index.json) | Contexto suplementar, NO-GO prescritivo; oito QUESTIONABLE e C1–C6 abertos; governança/safety final r4 incompletos. Não criar r5 nem apagar essa limitação. |
| G01/G02 vigentes | [PDR §5](../../../product/PRODUCT_DECISION_REGISTER.md#5-questões-realmente-abertas-e-dependências), [filtro ativo](../../../canon/CANONICAL_INDEX.md) | PDR conserva owners e provas; este pacote solicita parecer, sem modificar autoridade. |
| Oráculos originais S01/S02 | [Scenario Lab](../../../product/ADAPTIVE_ENGINE_SCENARIO_LAB.md) (linhas históricas 91/92), [r4 migração](../../../audits/training-domain-foundation-0.2/closure-r4-original/outputs/closure-r4/fix01.json) em `records[id=S01/S02]` | Snapshot e limitações r4 preservados. A decisão condicional antiga de MOVE não é resposta esperada do humano. |
| Origem dos ZIPs/hashes | [SOURCE_MANIFEST.json](../../../audits/training-domain-foundation-0.2/SOURCE_MANIFEST.json) | Caminhos originais /mnt/data, cópias locais, anexos da conversa e SHA-256 correspondentes. |

## Composição dos casos

Fonte comum: [DOMAIN_REVIEW_FIXTURES.json](../../../product/candidates/training-domain-foundation/0.2/foundation/DOMAIN_REVIEW_FIXTURES.json), revisão 0.2. Projeção auditável do pacote: [CASE_INPUTS.json](CASE_INPUTS.json).

| Campo no pacote | Localizador na fonte 0.2 |
|---|---|
| Perfil/histórico/plano | `base_fixture.athlete`, `.history`, `.plan`; BASE-REVIEW/0.2 |
| Lower e contexto semanal | `sessions[id=lower-mon,run-tue,run-thu,upper-fri]` |
| Configurações/doses | `strength_variations[id=back_squat_barbell,rdl_barbell,split_squat_db]`; `strength_prescriptions[id=squat-example,rdl-example,split-example]` |
| Corrida e intensidade | `run_prescriptions[id=threshold-example]`; `run_intensity_references[id=RPE_SYNTHETIC]` |
| Intent/criticality | `session_intents[id=intent-lower,intent-threshold]`; HIGH em ambos, estímulo essencial UNKNOWN |
| S01 / Run-first | `scenarios[id=S01].overrides`; priority RUN_FIRST; lower-less-volume / move-lower |
| S02 / Strength-first | `scenarios[id=S02].overrides`; `same_domain_facts_as=S01`, priority STRENGTH_FIRST; run-less-volume / move-run |

Não se transportam para a 0.2 os longões simbólicos r4, a colisão de agenda criada como witness r4, sinais S05 ou um bloco/objetivo não fornecido. A 0.2 é adição concreta parcial, não substituição dos inputs r4 nem encerramento de seu denominador.

Os documentos humanos usam o **mesmo catálogo de nove opções**. K/V-L/MV-L/V-R/MV-R são união das alternativas explícitas de S01/S02. M/I/SUB/PR são prompts de revisão com delta null, não novas receitas. Nenhuma substituição de remada é aplicada ao lower. `rejected_smaller_alternatives` vazios são relatados como ausência de rejeições fundamentadas.

Controle do par: nos `inputs` de CASE_INPUTS, a única diferença permitida é **priority_mode**. Identificadores S01/S02 são metadados. Cargas, RIR, tempos, histórico, criticality, unknowns e opções são idênticos. A seção comum dos dois Markdown é gerada do mesmo texto e verificada por hash. Os totais e spacings derivados são aritmética de relógio/receita, não regras esportivas.

## Próximo gate e incorporação futura

O [formulário](05_REVIEW_FORM.md) registra cada item/rule/caso com identidade, credenciais, população, versão/hash, disposição, rationale, base, condições, mudanças, trigger e data. O revisor humano avalia o subset. O Founder aloca profissional e recursos; curadoria registra o retorno e só altera os candidatos/receitas cobertos em missão posterior. Qualificação jurídica G01 e Engineering para alegações de execução continuam dependências existentes.

G01/G02 não recebem fechamento geral por este retorno. G03/G04 permanecem HUMAN_REVIEW_REQUIRED, sem modificação de escopo ou status. A reavaliação posterior dos oito QUESTIONABLE + C1–C6 e eventual promoção formal são separadas. Nesta missão nenhum canon, Product Truth, AE/Run/Strength, runtime ou Figma é alterado.

[Manifesto do pacote humano](REVIEW_MANIFEST.json) congela os oito Markdown e CASE_INPUTS. [Verificação da integração](../../../audits/training-domain-foundation-0.2/VERIFICATION.json) e [parecer documental independente](../../../audits/training-domain-foundation-0.2/DOCUMENTARY_REVIEW.md) registram apenas integridade/fidelidade e preparo do handoff.
