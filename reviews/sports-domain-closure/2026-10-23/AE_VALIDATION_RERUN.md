# Adaptive Engine validation rerun — Sports Domain Closure

SDC-AE-RERUN-r1 · 23/10/2026 · America/Sao_Paulo. Esta é uma reavaliação documental por IA. Nenhum runtime foi executado. O estado final de revisão e dos gates está na [consolidação independente](GATE_DISPOSITION.json); os payloads de autoria congelados conservam seu estado histórico de submissão.

A comparação usa os mesmos 80 cenários e nove sequências, com dez dimensões e 890 células. Inputs e oráculos originais permanecem intactos. As notas de revisão atual registram a nova autoridade SSCTR; justificativas históricas que exigiam exclusivamente humano são provenance, e essa exigência administrativa não governa o subset não clínico suportado hoje. Dados ausentes, receitas e evidência continuam necessários.

| Classificação | r3 | r4 | Sports Closure — mesmos inputs |
|---|---:|---:|---:|
| PASS | 61 | 62 | 62 |
| ACCEPTABLE | 19 | 19 | 19 |
| QUESTIONABLE | 9 | 8 | 8 |
| WRONG | 0 | 0 | 0 |
| DANGEROUS | 0 | 0 | 0 |

**0/8 positivos originais fechados.** Os oito ainda não contêm fatos suficientes para uma escolha prescritiva positiva; preencher novas fixtures não muda esse denominador. São S01, S02, S05, S12, S13, S14, S28 e S29. Não houve regressão de classificação ou de células nessa base. Zero WRONG/DANGEROUS documental não é estimativa de segurança.

| Dimensão — base histórica | PASS | PARTIAL | FAIL | N/E |
|---|---:|---:|---:|---:|
| Safety | 48 | 0 | 0 | 41 |
| Goal alignment | 27 | 3 | 0 | 59 |
| Priority correctness | 4 | 2 | 0 | 83 |
| Interference reasoning | 8 | 1 | 0 | 80 |
| Recovery reasoning | 18 | 2 | 0 | 69 |
| Plan stability | 38 | 7 | 0 | 44 |
| Minimum Effective Change | 1 | 12 | 0 | 76 |
| Progression preservation | 10 | 9 | 0 | 70 |
| User agency | 39 | 0 | 0 | 50 |
| Explainability / JEV | 62 | 27 | 0 | 0 |

O suplemento tem **43 variantes sintéticas / 430 células próprias**: 2 PASS, 33 ACCEPTABLE, 8 QUESTIONABLE, 0 WRONG, 0 DANGEROUS. Nenhuma entra nos 89. ACCEPTABLE indica coerência condicional da policy/controle no contexto fornecido; QUESTIONABLE conserva a insuficiência para a dose candidata. PASS nas variantes clínicas avalia somente a rota humana e a preservação do histórico. N/E continua fora do denominador avaliável; não há score composto.

| Case | Positivo concreto sucessor | Proposta de disposição | Fecha o positivo original? |
|---|---|---|---|
| S01 | S01-B3 | LIMITED_REVERSIBLE_RECOMMENDATION | Não |
| S02 | S02-B3 | LIMITED_REVERSIBLE_RECOMMENDATION | Não |
| S05 | S05-C2 | LIMITED_REVERSIBLE_RECOMMENDATION | Não |
| S12 | S12-C2 | LIMITED_REVERSIBLE_RECOMMENDATION | Não |
| S13 | S13-T | APPROVE_WITH_CONDITIONS | Não |
| S14 | S14-T | APPROVE_WITH_CONDITIONS | Não |
| S28 | S28-14D | LIMITED_REVERSIBLE_RECOMMENDATION | Não |
| S29 | S29-R2 | APPROVE_WITH_CONDITIONS | Não |

Os sucessores S13-T/S14-T/S29-R2 oferecem positivos limitados por fatos concretos e agência. As doses exatas de resposta aguda lower × cruise, redução por convergência, excesso de execução e re-entry permanecem sem aprovação forte. S01/S02 também têm KEEP positivos: prioridade sozinha não cria necessidade. A aprovação independente e seus limites prevalecem sobre esta proposta de autoria.

Os 29 witnesses adicionais de G03/G04 estão no [pacote semântico](semantics/SEMANTICS_WITNESSES.json). Esse terceiro conjunto testa fatos, interpretação e routing; não é misturado ao suplemento esportivo nem ao histórico.

A rubrica original está preservada no [rerun estruturado](AE_VALIDATION_RERUN.json). Cada uma das variantes tem dez células com justificativa no [suplemento](AE_SUPPLEMENTAL_ASSESSMENTS.json). Fontes, limitações, contrafactuais e doses ficam vinculados aos targets científicos. Esses julgamentos não demonstram eficácia, execução de código, validação humana ou clearance.
