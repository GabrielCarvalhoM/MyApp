# R7-D — pré-registro do gate final, versão 2 (`R7D-PREREG-2`)

**Status:** registrado na Fase 3 (2026-11-02), antes de existir qualquer holdout final.
- Substitui o `R7D-PREREG-1` (`PREREGISTRATION_R7D.md`, sha256 `fefb532a…47c6`) para o gate da Fase 4.
- O PREREG-1 continua sendo o registro histórico da Fase 2 e não é editado.
- **Tudo o que o PREREG-1 diz e este arquivo não altera continua valendo**, palavra por palavra. Isso inclui os critérios de sucesso (§4), o protocolo selado (§8) e a regra de não-tuning (§9).

**Fontes do delta:**
- achados do diagnóstico (`PHASE2_CHECKPOINT.md`: HG-01..HG-07, TG-01, DX-01, DX-02, F03, F04);
- triagem SSCTR `SSCTR-R7D-DIAG-TRIAGE-r1`;
- decisões do Founder na autorização da Fase 3;
- regra `F03B-MACHINE-STEP-r1` (`phase3/policy/SSCTR_F03B_DECISION_R7D.json`, `phase3/policy/PCG_F03B_AUTHORITY_R7D.json`).

## Instrumentos vinculados

| Instrumento | Versão | Onde |
|---|---|---|
| Runtime avaliado | `R7D-FREEZE-1`: o freeze final que pode chegar à produção. Um sucessor exige autorização nova | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json` |
| Harness | `R7D-HARNESS-2` (padrão: o registro do R7D-FREEZE-1) | `harness/`; validação em `harness/validation/HARNESS_VALIDATION_R7D_2.json` |
| Interface do autor | `R7D-INTERFACE-2` = `R7D-INTERFACE-1` + `author/INTERFACE_DELTA_R7D_2.md` (o delta prevalece onde divergem) | `author/` |
| Esquema e checador | `R7D-CASE-1`, `check-corpus.mjs`, sem mudança | `author/` |
| Gerador | `R7D-GENERATOR-1`, sem mudança. Seed do H2: `sha256('R7D-SAMPLE\|FINAL\|' + manifestDigest do R7D-FREEZE-1)` | `harness/generate-sample.mjs` |
| Brief final | `author/AUTHOR_BRIEF_FINAL_R7D.md` | `author/` |

## Delta PREREG-1 → PREREG-2

Cada item diz se o gate fica mais estrito ou só mais preciso. **Nenhum critério de sucesso é afrouxado.**

| Δ | Mudança | Origem | Efeito |
|---|---|---|---|
| Δ1 | **P08, qualquer portador.** Vale para qualquer revisão que declare uma pausa (`interruption` não vazia, em qualquer tipo de evento) e para qualquer decisão que registre um retorno (REESTABLISH). Mede o plano em vigor depois de toda decisão VALID: a proposta adotada, ou o plano mantido sem proposta. "Tolerada" passa a exigir recuperação não adversa **e** dia seguinte não prejudicado | HG-05, DX-02, triagem | Mais estrito |
| Δ2 | **P09 com confounded.** Uma execução marcada `confounded` torna ilegíveis só desempenho e esforço. Recuperação ADVERSE ou dia seguinte IMPAIRED continuam desfavoráveis. Sem `confounded`, esforço HARDER sem desempenho OVER também é resposta adversa | HG-03, F04 (Founder) | Mais estrito |
| Δ3 | **P07, linha da prova.** A data da prova é a do plano adotado (`goal.run.event.date`), nunca a de uma mudança recusada ou perguntada | HG-02 | Precisão: remove um falso FAIL; o P07 continua checando a prova que o plano mantém |
| Δ4 | **P14 e consentimento.** O cliente carrega o consentimento atual do atleta em toda decisão, e o P14 lê o consentimento em vigor. **Nova CONSUMER_CONDITION:** um cliente envia o consentimento atual em toda decisão; uma revogação enviada uma vez só caduca | HG-01 | Precisão; condição de consumidor explícita |
| Δ5 | **P16, nova propriedade** (AUTOMATED; GENERALIZATION_BLOCKER, DIRECT_RUNTIME_DELTA). **(a)** Uma carga registrada exatamente como a linha a prescreveu (valor, unidade e convenção) é lida: nunca `LOGGED_UNIT_OR_CONVENTION_UNKNOWN`. **(b)** Nenhum plano em vigor declara carga de máquina (MACHINE_STACK, KNOWN) que o atleta não tenha fornecido, registrado ou confirmado antes daquela decisão | F03; regra F03B-MACHINE-STEP-r1 | Mais estrito (novo) |
| Δ6 | **Confirmação de carga no cliente.** Usa o valor em kg que o runtime devolveu e a convenção da linha planejada | HG-06 | Precisão |
| Δ7 | **Expectativas do autor.** ROLE_ABSENT e ROLE_PRESENT, na semana do próprio passo, leem só as sessões a partir da data do passo. ROLE_MINUTES_COMPARE conta 0 minuto para um papel ausente numa semana que o plano tem | HG-04; lacuna 9 do autor | Precisão. É oráculo do autor, julgado pelo domínio e nunca bloqueia por si |
| Δ8 | **Pacote e visão canônica.** Os intervalos de walk/jog em segundos são exibidos e comparados | HG-07 | Comparações mais estritas |
| Δ9 | **Cobertura crítica (§7, acréscimo).** O H1 avaliado precisa de pelo menos 2 casos base independentes com cada um destes:<br>• pausa declarada sem pergunta pendente;<br>• pergunta UNREPORTED_TRAINING respondida diretamente;<br>• exercício de máquina registrado.<br>Precisa também de pelo menos 1 caso com corrida `confounded` e recuperação adversa ou dia seguinte prejudicado.<br>Unidades obrigatórias: CARRIER_CLINICAL > 0, CARRIER_HOLD > 0 (as variantes H1-M) e P08 ≥ 2.<br>Faltando qualquer um: INVALID_HOLDOUT, substituído por corpus novo e independente | TG-01, Founder (coberturas da Fase 3) | Mais estrito: o gate não passa por omissão |
| Δ10 | **Rubrica (§5).** Adotadas as sugestões de precisão da triagem SSCTR:<br>**(a)** o roteamento clínico é julgado: um caso clínico corretamente roteado é avaliável quanto ao roteamento; CLINICAL_OUT_OF_SCOPE vale só para o conteúdo clínico;<br>**(b)** a classe UNSUPPORTED da rubrica passa a se chamar SCOPE_MISROUTED;<br>**(c)** classe por passo, e o caso herda o pior passo;<br>**(d)** EXPECTATION_OUTSIDE_AUTHORITY como classe de passo, que não é falha do runtime;<br>**(e)** premissa das VARIANT: uma variante que não entrega os mesmos fatos é NOT_EVALUABLE;<br>**(f)** INVARIANT_ORACLE limitado às propriedades registradas.<br>**Não adotada:** "defeito visto só numa testemunha do juiz é TEST_GAP". Ela contradiz a decisão do Founder na Fase 3 (F04 continua bloqueio, mesmo com a forma nociva vista só numa testemunha mínima) e a regra estrutural do §3 | Triagem; Founder | Precisão; (a) e (c) tornam o gate mais estrito |
| Δ11 | **Envelopes (§6, acréscimos).** Resíduos divulgados da regra F03B-MACHINE-STEP-r1, como KNOWN_DISCLOSED_RESIDUAL:<br>• platô quando a próxima regulagem da máquina não cabe no alvo (R-01);<br>• tamanho do passo não verificável: um salto de duas regulagens, verificado, é adotado (R-02);<br>• uma pergunta por regulagem pendente;<br>• um registro em R, inclusive numa semana que segura a carga, descarta a regulagem pendente;<br>• R-03..R-10 como no registro SSCTR | SSCTR-R7D-F03B-r1 | Envelope de regra autorizada, divulgada; não cobre nenhum valor computado (P16b continua bloqueando) |
| Δ12 | **Sensibilidade dos runtimes superados.** O harness detecta, cada um no seu runtime e limpo no R7D-FREEZE-1:<br>• no R7C-FREEZE-4, DX-01 (P10), DX-02 (P08), F03 (P16) e F04 (P09);<br>• os três defeitos anteriores (QE-R7C-10, R7C-G01, D54) nos seus runtimes. | Validação HARNESS-2 | Registro |

## Achado conhecido antes do holdout, sem envelope

**P3-F01.** Uma resposta a UNREPORTED_TRAINING que declara uma pausa, registrada por uma rota clínica (substituição com dor), não é retida depois da liberação qualificada.
- A primeira decisão elegível pergunta de novo: REQUIRES_RECONCILIATION, sem dose de corrida. A resposta direta, por revisão semanal ou relato de retorno, faz a reentrada.
- **Origem:** PRE_EXISTING. No R7C-FREEZE-4 a forma de relato de retorno já diferia. A forma de revisão semanal não aparecia porque a própria pausa era ignorada (DX-02).
- **Natureza:** falha fechada (pergunta, sem dose). Validação em `harness/validation/HARNESS_VALIDATION_R7D_2.json`, `findings`.
- **Tratamento:** CARRIER_CLINICAL continua estrito. Se o holdout final mostrar o P3-F01, ele conta pelo §4.
- Uma correção ou um envelope exigem decisão do Founder e, no caso do envelope, um PREREG-3 registrado antes de o holdout existir.

## O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, que depende do digest do R7D-FREEZE-1.
- Qualquer decisão sobre `V1_COACHING_AUTHORITY_READY`.
