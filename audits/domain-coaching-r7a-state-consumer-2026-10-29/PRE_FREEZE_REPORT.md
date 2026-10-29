# Relatório pré-freeze (Founder §36) — State Model Consumer Closure

`STATE_MODEL_CONSUMER_FREEZE_READY_FOR_INDEPENDENT_REVIEW = YES`

**Rótulos.**
- **[C] COMPROVADO:** executado nesta sessão, registrado e vinculado ao digest congelado.
- **[I] INFERIDO:** raciocínio ou busca limitada, não uma prova executada.
- **[NT] NÃO TESTADO.**

## 1. Baseline [C]

HISTORICAL-PROJECTION-FREEZE-1 (`0db72d0e…`), com 0 de 83 arquivos em drift e `node --test` 589/589.

- `verify-r7asm` read-only deu 15/16; depois que o script de preparo desta missão existiu, 14/16.
- As probes dos juízes para os sete findings: 22 de 22 reproduzidas, 21 byte a byte. O trace-h25 difere só no próprio relógio.
- Registro: `probes/baseline/BASELINE_COMPARE.json`.

## 2. Os sete findings [C], fechados nas probes dos próprios juízes, sobre os bytes congelados

| Finding | Neste freeze | No predecessor |
|---|---|---|
| QE-R7ASM-01 | Q3 (4 variantes), Q3b e Q12a: `prescribedKnownLoadBecameHistory = false`, histórias iguais | `true` |
| QE-R7ASM-02 | Q4 LONG/MODERATE: `planDiffersWithIdenticalLedgers = false`; Q4b: `historyAlwaysEqual = true` | `true` / `false` |
| QE-R7ASM-03 | Q11c sem linhas divergentes; Q12b igual | divergia |
| QE-R7ASM-04 | Q2 `publicApiIgnoresCorrection = false`; Q2b `publicApiReadsRetractedLoad = false` | `true` / `true` |
| F1 | grids de restauração e de caps com B = 0; o overhead press volta 1 → 2 → 3 | B = 2; 1 → 3 |
| F2 | probe de repetições: 126 linhas, 0 fora da faixa; tick × 5 | 9 fora da faixa; × 3 |
| F3 | trace-h25: 56 linhas depois da mudança, 0 acima de 8 | 2 × 12 |

## 3. Causas raiz [C]

Reproduzidas no baseline, uma por finding (`TASK_CONTRACT.md`):

| Finding | Causa |
|---|---|
| 01 | `setUp` a partir da linha KNOWN |
| 04 | `historicalStateOf` lia o registro carregado como veio |
| 02 | `planningBase` tomava a corrida da história só em RETURN |
| 03 | `planningExercise` lia as repetições da projeção |
| F2 | `earnedAt` copiava as repetições logadas qualquer que fosse o gate |
| F3 | o alvo do objetivo antigo ficava sem corte |
| F1 | o passo de retorno avançava em qualquer exposição |

## 4. History ingress

**[C]**
- `asEstablishment` atua no redutor, na leitura só de fatos, na transição da revisão e nas perguntas de carga.
- Testes: H1–H4, os 6 testes de QE-R7ASM-01 e o teste das perguntas de carga.
- Os 5 mutantes de ingress foram capturados.

**[I]** Não há outro caminho de ingress fora dos caminhos auditados. A auditoria de consumidores é uma busca limitada.

## 5. Correction boundary [C]

- `canonicalRecord`.
- Testes: H5, P2, P7 e QE-R7ASM-04; T15, P7 (reexpressos com `correctionOf`) e T15c (o conflito).
- Os 3 mutantes de correção foram capturados.

## 6. PlanningView semântica

**[C]**
- `resolveExercisePrescription` resolve a dose como uma unidade; `planningExercise` e `HISTORY_ATOMS` foram removidos.
- S1–S6, P3, P4 e Q6 (perturbação da projeção) reexecutada.
- C15 (view contra história): 0 violações.

**[I]** O único sobrevivente da mutação é equivalente nos caminhos alcançáveis. É o predicado de modo da view, lado da projeção. A base é um argumento de lockstep mais uma bateria de 112 timelines sem diferença, cujo controle positivo é detectado; isso não é prova.

## 7. Evidência temporal [C]

- T1–T5, P5, P6 e a janela do gate (o dead-bug do T04).
- NF-R7ASM-1 e o lado walk/jog de F1.
- O retorno de corrida, idêntico ao STATE-EVIDENCE-FREEZE-1.
- C16 sobre todo o corpus de simulações: 0 violações aqui, 34 no predecessor.

## 8. HOLD [C]

HOLD repete a dose mantida:
- 82,5 × 5;
- um REGRESS numa carga projetada vai de 20 × 8 para 18 × 8, igual ao STATE-EVIDENCE-FREEZE-1. O predecessor dava 18 × 7 e 18 × 6, abaixo de 8–12.

Testes: S1 e P4. Os mutantes "HOLD usa as repetições projetadas" e "repetições logadas qualquer que seja o gate" foram capturados.

## 9. MAINTAIN

**[C]**
- R6-H25 fica em ≤ 8; S2 e S6.
- `inRange` corta toda linha de dose conhecida; os mutantes foram capturados.
- Efeito lateral: sob STRENGTH, linhas de retorno de acessórios vão de 7 para 6, mesmo sem mudança de objetivo. Seguem o corte que a linha KNOWN já fazia. Linhas de estabelecimento mantêm 7.

**[I]** Que esse efeito está dentro da ciência aprovada. Foi enviado ao SSCTR (contrato §10, item 3).

## 10. D53 / D57 [C]

**D53 e D57 restaurados.**
- B = 0 nos grids de restauração e de caps, na extensão NONE/NOVICE e em todos os shards, com 0 saltos cobertos.
- As 864 timelines foram comparadas linha a linha: 159 diferem do STATE-EVIDENCE-FREEZE-1, todas nomeadas:

| Classe | Linhas |
|---|---|
| Base de retorno aprovada no predecessor | 1.464 |
| Corte de faixa | 132 |
| F1 restaurado | 60 |
| Sem explicação | 0 |

**D56:** A = 0, A2 = 0, caps com 0 sem explicação.
**D58:** byte-idêntico.
**D59:** E = O = B = 0.

## 11. Testes [C]

632/632 (Node v24.19.0). Nas duas suítes do consumidor, 27 de 77 testes falham no predecessor; entre eles estão todas as regressões de finding.

## 12. Propriedades

**[C]** A, B, C e D, cada uma com seus testes (contrato §9). Self-challenge: 16 classes, 1.376 casos, 0 violações. O predecessor tem 84, em 8 classes.

**[I]** "Nenhum caminho V1 material existe" não está provado. Está limitado pelas auditorias, pelas probes e pela bateria.

## 13. Auditoria de qualidade dos testes [C]

`dossier/TEST_QUALITY_AUDIT_R7ASC.md`:
- nenhum teste conta mais um conflito como cobertura de correção;
- QE-R7ASM-07 fechado colateralmente.

## 14. Auditoria de consumidores

**[C]** `dossier/CONSUMER_AUDIT_R7ASC.md`.

**[I]** Completude além dos caminhos nomeados.

## 15. Mutação [C]

- 26 mutantes: 20 da lista §25 e 6 das peças em que as frentes se apoiam. 25 foram capturados, 0 deixaram de ser aplicados.
- Na primeira rodada, 4 sobreviventes eram materiais e cada um ganhou um teste: perguntas de carga (D45), walk/jog, R42 com carga escolhida pelo atleta, REGRESS numa carga projetada.
- 1 sobrevivente documentado, com sua evidência de equivalência.
- O registro está vinculado ao digest e aos hashes dos testes.

## 16. Regressões [C]

**Contra o predecessor:**
- R5 24/24, perfis 12/16, simulações 10/14, holdout R6 25/35.
- Nenhum caso do corpus muda de status.
- 9 de 89 casos diferem depois da contabilidade do resumo, em 5 classes nomeadas, 0 sem classe.
- Campos de dose: 60 subiram e 82 caíram. Dos que subiram, 56 estão no T04 e no T13, agora idênticos ao STATE-EVIDENCE-FREEZE-1. Os outros 4 estão no R6-H22: pontos do mesmo ciclo REPS_THEN_LOAD, um passo atrás dos passos projetados do predecessor (29 × 10 onde ele tinha 31,5 × 6).

**Bloqueios anteriores:** continuam fechados nas probes dos próprios juízes.

**Não bloqueantes:**
- NF-R7ASM-1: fechado.
- NF-R7ASM-3, QE-R7ASM-07 e a nota R42: fechados colateralmente.
- NF-R7ASM-2, R41, QE-R7ASM-05 e QE-R7ASM-06: inalterados (Q10 dá as mesmas 10 células), no backlog.

## 17. Identidade do freeze [C]

**STATE-MODEL-CONSUMER-FREEZE-1**

| | |
|---|---|
| Source digest | `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5` |
| Manifest | `4f11f4b48782a5f16dc6c9770a367d013564380aecc42d19be348d4ebc45cd1f` |
| Arquivos | 84 |
| Congelado em | 2026-10-29T14:19:24Z |
| Política | `18ec48f3…`, inalterada |
| Alterados | `src/r6-adaptation.mjs`, `src/r6-program.mjs`, `test/r7asm-state-model.test.mjs` |
| Adicionado | `test/r7asc-state-consumer.test.mjs` |
| Verificação | `verify-r7asc.mjs` 25/25 |
| Drift depois do freeze | 0 arquivos |

Há um único freeze; o script recusa um segundo.

## 18. Pontos de entrada dos revisores

- `REVIEW_HANDOFF.md`
- `reviews/ENGINEERING_REVIEW_BRIEF.md`
- `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md`
- `STATE_CONSUMER_CONTRACT.md`
- `node CoachingCore/scripts/verify-r7asc.mjs`, read-only

## NÃO TESTADO [NT]

- dados reais, atletas reais, validação humana ou clínica;
- HealthKit, KMP, UI, produção;
- caminhos V1 fora dos consumidores nomeados;
- exaustividade da bateria de mutantes;
- o julgamento do SSCTR sobre os itens enviados a ele (§10 do contrato).

## Estado

| | |
|---|---|
| `CURRENT_MISSION` | `STATE_MODEL_CONSUMER_CLOSURE_FROZEN` |
| `NEXT_STEP` | `INDEPENDENT_REVIEWS` |
| `R7A_EXIT_READINESS` | não emitido |

- Nenhum revisor foi executado e o R7-B0 não foi iniciado.
- Sem commit, merge ou deploy.
- A fila humana não foi tocada.
- O patch de canon do Growth Layer (`audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`) espera o fechamento desta missão.
