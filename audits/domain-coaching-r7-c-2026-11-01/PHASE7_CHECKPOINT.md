# R7-C · Fase 7 — checkpoint (2026-11-02)

**Autoridade.** Pedido direto do Founder (DOMAIN COACHING — R7-C · FASE 7), com um único bloqueio a fechar: **QE-R7C-10** (respostas executadas abaixo da dose prescrita continuavam dependentes de quem as registrou). O P6-F01 do SSCTR é a mesma causa. Sem ciclo de correção: um bloqueio novo num gate fecha `CLOSED_NOT_READY`.

**Base.** `claude/domain-coaching-r7-c`, a partir de `8699cba` (documental) e de `R7C-FREEZE-3` (`08c6db3`, runtime). Commits da fase:
- `bcda329`: a correção e os 18 testes dirigidos;
- `e709caa`, `2ab229c`, `c2d1f77`, `b446443`: o runner de evidência, o harness de mutação, o diferencial contra o FREEZE-3, o gerador e o verificador do freeze, e duas correções do próprio harness (abaixo);
- `a9654c8`: as evidências e a mutação;
- `3fe55ae`: `R7C-FREEZE-4`, handoff e pedidos aos gates;
- `aea6fa2` e `dcb6d19`: as revisões (Engineering; SSCTR com adendo);
- o commit de fechamento: este checkpoint, o handoff, a missão e o ledger..

**Fora do escopo, intocados.** Policy, catálogo, G02, dose nova, `product/`, `canon/`, a fila (230), os registros fechados, FREEZE-1/2/3, Figma, iOS e Supabase. Não absorvidos: QE-R7C-08, -09, -11, -12, -13, CC-F01, C8, C5, o HOLD do R4, C10, D1 e G03. A R7-D não foi iniciada.

## R7C_PHASE7_STATUS

**`CLOSED_READY`.** Os dois gates sobre o `R7C-FREEZE-4` sem bloqueio:
- **Engineering:** READY_WITH_CONDITIONS, com o QE-R7C-10 fechado; as condições são correções de divulgação, feitas no fechamento, e encaminhamentos.
- **SSCTR:** ACCEPT_WITH_CONDITIONS (SSCTR-P7-R7C-r6 com adendo), com o P6-F01 fechado no domínio dele, uma única C3 final e a C11 generalizada.

## QE_R7C_10 (antes → depois)

**Antes, no FREEZE-3.** `unreadRunWeeks` decidia que uma revisão "não leu corrida nenhuma" pela classe dos gates que ela registrou (todos não executados, e o redutor lendo agora ADVANCE, EARNED ou REGRESS). Uma corrida feita mais curta dá HOLD dos dois jeitos, então a semana contava como lida e a projeção obsoleta ficava VALID: 28 de 280 células da Engineering (ex.: GEN semana 7 → QUALITY 34 / LONG 60 contra EASY 44 / LONG 44 da resposta direta; taper → QUALITY 28 / LONG 45 contra EASY 30 / LONG 40).

**Depois, no FREEZE-4.** O que uma revisão leu vem do registro canônico e do relógio dela, nunca do gate que ela deu: 0 de 280.

## EVIDENCE_VISIBILITY

- **Por que metadado novo.** Nas estruturas existentes, um relato tardio e um relato no prazo de uma corrida encurtada são os mesmos fatos canônicos: mesmas linhas do ledger, relógios, gates e estados guardados; só o texto da razão da revisão difere (`(MISSED)` × `(PARTIAL)`), que é saída de decisão, não registro. O QE-R7C-10 exige o primeiro como não lido e o Founder exige o segundo como lido; nenhuma regra nas estruturas existentes faz as duas coisas. É a condição do Founder ("demonstravelmente impossível").
- **O metadado:** `provenance.firstRecordedAt` em cada linha do registro de trabalho feito: o relógio da decisão cuja entrada trouxe primeiro um relato daquela execução.
  - escrito só pelo runtime (`evaluateProgram`), nunca tirado da entrada; mantido quando a linha é carregada;
  - uma mesma execução guarda o mais antigo (duplicata concordante, correção e o que ela corrige);
  - só visibilidade de evidência: sem dose, sem autoridade; o redutor, a HistoricalState, os gates e o modelo de aprendizagem nunca o leem nem o guardam; determinístico.
- **A regra (`unreadRunReports`), por relato:** semana só projetada → nenhum relato dela foi lido (inalterado); semana fechada por revisão (`WEEK_EVIDENCE`, relógio `evidenceThrough`) → relato que o registro passou a ter depois desse relógio não foi lido; o que já tinha, foi, qualquer que seja o conteúdo e qualquer que seja o gate (HOLD, REGRESS ou outro); qualquer outro início (intake, entrada de retorno) → lida. O resto do `answeredOnRecord` é o do FREEZE-3 (gatilho, ordem, C9, teto, guarda G01).
- **Comportamento retroativo:** um relato sem o relógio (registro escrito antes do FREEZE-4, linha montada pelo cliente, relógio perdido) é lido como no FREEZE-3 (`legacyUnreadWeeks`). Nada é migrado: a chegada desses relatos nunca foi registrada e não é inventada. Fixado por teste.
  - **Escopo corrigido no fechamento (QE-R7C-15, P7-F03):** nesses registros qualquer resposta pode ficar sem aplicar: encurtadas, adversas e mistas, e também em dose cheia ou adversas quando uma semana foi fechada por decisão sem gates.
  - A C3 cobre o consumidor.
  - Os consumidores carregam o registro como o runtime o devolve e mandam relatos novos só como observações.

## RECORDER_INDEPENDENCE_FULL

**0 / 160** (grade original `rc-p4`; FREEZE-3 0, FREEZE-2 72). Trajetórias (`p6-x1`, 1.536): nenhum plano obsoleto VALID (FREEZE-3: 54, todos SHORT) e nenhuma falha para EXEC, MIXED, ADVERSE, EASYONLY, PARTIAL ou SHORT; as 36 restantes (MISS 30, LONGONE 6, portador no dia 1) perguntam onde o caminho direto está VALID, iguais ao FREEZE-3.

## RECORDER_INDEPENDENCE_SHORTENED

**0 / 280** (grade da Engineering `p6-x5`: SHORT60, SHORT80, longões encurtados com o resto feito ou não feito, EXEC; portadores CSUB, CHOICE, R4). FREEZE-3: 28; FREEZE-2: 224; R7B2-FREEZE-1: 0.

## MIXED_P6_F01

**0** células dependentes do portador: escopo do SSCTR 0 / 768 (FREEZE-3: 16) e CC2 0 / 1.200 (FREEZE-3: 18). Mesma correção, sem regra para mistas.

## ALL_ADVERSE

Testemunha efetiva: resposta toda adversa por portador = resposta direta (32 células, teste (10)); revisão no prazo que deu REGRESS sobre relatos adversos conta como lida (teste (2)/(11), mata F7-M3 sozinho); no registro sem relógios, o mutante do juiz (REGRESS fora de "executado") agora é F7-M7, morto pelo teste de comportamento retroativo.

## DIRECTED_TESTS

`test/r7c-phase7.test.mjs`: **18 / 18**. Visibilidade (1–4), encurtadas (5–9), toda adversa (10, 11), mistas P6-F01, não lido de verdade (12), parcial continua ASK (13), histórico e HistoricalState (14), clínico primeiro (15), validade (16), as regras do relógio, o comportamento retroativo. Portadores: direto, R4 e clínico.

## FULL_SUITE

**884 / 884** (866 + 18), no registro do freeze, no verificador `--suite` e na evidência. Nenhuma falha; nenhum teste ou fixture existente mudou.

## MUTATION

Em cópia isolada, repositório intacto (`mutation.R7C-P7-b446443.json`):

| Conjunto | Resultado |
|---|---|
| Fase 3 | 17/18, G02-M4 equivalente, testemunha morta |
| Fase 4 | 8/8 |
| SD | 6/6 |
| Ciclo | 9/9 |
| Fase 6 | 7/7 (fragmentos de P6-M2 e P6-M7 acompanham o texto novo, mesma mutação) |
| **Fase 7, F7-M1..M11** | **11/11, cada um morto pela própria testemunha rodada sozinha** |

F7-M1 volta à classe do gate; F7-M2 HOLD nunca conta como lida (morto pela testemunha de revisão no prazo com corridas curtas, e por mais dois testes); F7-M3 REGRESS nunca conta como lida (morto só pela própria testemunha); F7-M4 ignora o relógio; F7-M5 encurtada por portador clínico não reconciliada; F7-M6 mista por portador não reconciliada; F7-M7 a leitura retroativa sem REGRESS; F7-M8..M11 as regras do relógio.

**O que a fase pegou em si mesma:** a primeira rodada de evidência passou o root do probe adversarial clínico pelo ambiente (não carregou; corrigido em `c2d1f77`, saídas descartadas); `regress-r7b2` faz hash do registro carregado e acusa toda etapa registrada só pelo campo novo (a forma neutra lê igual à Fase 6); a primeira rodada de mutação deu ao F7-M5 um padrão de testemunha que não selecionava teste (corrigido em `b446443`; o harness agora conta os testes que rodaram).

## CLINICAL

K6, K6b, CAND-01/CAND-02 (inventário) e o adversarial herdado (3.228 / 0): idênticos à Fase 6 salvo o rótulo. Clínico primeiro preservado: com a rota clínica de pé nada é prescrito; depois da liberação qualificada os fatos registrados são aplicados sem reenvio, inclusive encurtados e mistos (teste (15)). O flag clínico de elegibilidade continua sem registrar nada (R5).

## FREEZE

- **`R7C-FREEZE-4`** ([registro](../../CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json), sha256 `bf99c01b…2fc2`).
- **Bytes:** commit `a9654c8`, fonte `16d0633e…69c1`, manifesto `61937f87…f6b8`, 197 arquivos, 884/884.
- **Verificador:** `node CoachingCore/scripts/verify-r7c.mjs --revision 4 --suite`, **27/27 PASS** ([relatório](../../CoachingCore/r7/c/VERIFICATION_R7C_4.json)), só leitura. Os juízes o rodaram sem `--write`: a Engineering antes e depois (27/27, 884/884) e o SSCTR uma vez (27/27, 884/884).
- FREEZE-1/2/3 imutáveis; os verificadores deles falham `files-current` por desenho.
- **Regressão:** diferencial contra o FREEZE-3 128/128 idêntico (inclui quem relata sempre atrasado, em dose cheia e encurtado; nenhum acima dos fatos no prazo); grade SD, SD-01, G01, G02, holdout, conformidade R7-B/B.1/B.2 e vizinhos byte-idênticos à Fase 6; alcance (QE-R7C-11) 45/45 idêntico; histórico 111 replanejamentos, 0 violações.

## ENGINEERING_GATE

**READY_WITH_CONDITIONS** ([registro](reviews/engineering/PHASE7_REVIEW_R7C.md); `quality-reliability-engineer` novo e independente, `claude-opus-5-5`, xhigh).

| Pergunta | Resposta |
|---|---|
| 1. QE-R7C-10 fechado? | **sim** (0/280; 0 obsoleto VALID em 1.536 trajetórias; e 0 em quatro grades irmãs que a fase não testou: 648 trajetórias com portadores clínico, de retorno e de escolha nos dias 1, 4 e 5; 224 células com semanas fechadas por decisões sem gates; 108 de reenvio, duplicata, resposta dividida e correção) |
| 2. Encurtadas independentes do portador? | sim, em todo portador e dia medidos, com reenvios, duplicatas de segunda fonte, respostas divididas e correções |
| 3. Visibilidade pelo registro e tempo, não pelo gate? | sim; o metadado era necessário (A e B idênticos em todo campo estruturado; só a razão em texto livre difere) e cumpre as condições do Founder; o comportamento retroativo estava divulgado de forma estreita demais (QE-R7C-15, corrigido no fechamento) |
| 4. All-adverse coberto? | sim (F7-M3 morre só pela própria testemunha; o FREEZE-3 falhava 9 trajetórias e 20 células dessa forma) |
| 5. P6-F01 pela mesma correção, sem caso especial? | sim (0/768, byte-idêntico ao dos autores; nenhum ramo para mistas; F7-M6 morto) |
| 6. QE-R7C-07 continua fechado? | sim, e mais completo (0/160; a semana fechada por decisão sem gates agora converge) |
| 7. Nenhum novo VALID obsoleto? | nenhum |
| 8. QE-R7C-08/09/11/12/13 classificados e não absorvidos? | sim; a fase alarga o escopo do 11 e do 12 (QE-R7C-16) |

Achados: QE-R7C-15 (menor), QE-R7C-16 (menor), QE-R7C-17 e QE-R7C-18 (observações); detalhe em REMAINING_NONBLOCKING_FINDINGS.

## SSCTR_GATE

**ACCEPT_WITH_CONDITIONS**, sem bloqueio ([registro](reviews/ssctr/SSCTR_PHASE7_RECHECK_R7C.md), SSCTR-P7-R7C-r6 com adendo, `claude-opus-5-5`, xhigh).

- **Semântica das encurtadas:** confirmada. Na grade própria do SSCTR, 960/960 respostas registradas iguais à direta (FREEZE-3: 92 obsoletas); 0 corrida acima do teto (FREEZE-3: 60, até 28 min acima); nenhum passo que a corrida curta não ganhou.
- **Mistas e adversas (E1, M2):** confirmadas (0/768, 0/1.200, toda adversa 0/96, encurtada com adversa 0/96, encurtada com falta 0/96).
- **Clínico primeiro:** confirmado.
- **Limites de taper e prova:** confirmados (0 toque de prova ou qualidade no taper além da resposta direta; FREEZE-3: 16).
- **C11:** inalterada no caminho no prazo (525 células idênticas ao FREEZE-3). No adendo, generalizada para cobrir o QE-R7C-16: semanas depois da atual são provisórias até a decisão que fecha a semana anterior.
- **C3:** uma única redação final (abaixo), que substitui o texto r2 como carregado e as cláusulas r4 e r5.
- **Adendo depois da revisão da Engineering:**
  - QE-R7C-16 aceito pela C11 (b), sem bloqueio;
  - QE-R7C-15 entra na cláusula retroativa da C3;
  - QE-R7C-18 recebe redação na C3 e divulgação na C7;
  - nota r6 da C9 e C7 atualizadas; C2, C4, C5, C8 e C10 inalteradas.

## C3_FINAL

**Status:** FINAL (SSCTR-P7-R7C-r6, adendo). É a única C3 em vigor depois do fechamento; substitui o texto r2 como carregado e as cláusulas r4 e r5. O conflito entre os gates da Fase 6 está resolvido. Texto (verbatim, inglês, como o SSCTR o fixou):

> The answer path is low-friction and factual: done or not done per session, or a declared break with its reason, screened clinically. HealthKit evidence is used before asking where available. Non-response never falls back silently to credit or zero. While referenceState.pending.signal is present, the answer is delivered as a plain review of that week or as the pending event kind with its signals. An answer inside another event kind is followed by the held signal re-submitted before the plan is presented. A RECOVERED event does not carry the answer (it stays ASK). An answer to UNREPORTED_TRAINING that a decision recorded without applying it (a refusal such as the R4 HOLD; a handler clinical route: a substitution with pain or a clinical return report; an ASK whose proposal the client did not apply under C2) is applied by the first eligible decision after it, with no re-send, as the same answer delivered directly, and after a clinical route only after qualified clearance, which the runtime cannot give. On R7C-FREEZE-4 this holds for every answer shape measured: known stops, runs done in full, runs done shorter than prescribed (at 60 % or 80 %, the long run only, with the other runs not done), adverse responses, mixed answers and their combinations; re-sending such an answer changes nothing. An eligibility clinical flag returns before any report is read and records nothing, so after qualified clearance its answer is re-sent or asked again (R5). A correction of an earlier report is different: one that a decision recorded without applying it (measured: a clinical substitution, then cleared) is applied only by the week's own review, re-send included, and until then the plan built from the uncorrected report stays VALID; so after such a decision the run doses remaining in that week are not presented as a prescription until that review. This rests on the record: whether an earlier review read a run report is taken from the clock at which the completed-work record first held it (provenance.firstRecordedAt, written only by the runtime), never from the gate that review gave. Consumers carry the record exactly as the runtime returns it, send new reports only as observations, and never add rows of their own or drop, set or rewrite that clock. A report without it (a record written before R7C-FREEZE-4, a row a client built itself, or a clock lost) is read as on R7C-FREEZE-3, and any answer recorded that way can stay unapplied after clearance, re-send included, with the stored doses VALID: runs done short, adverse or mixed, and also runs done in full or adverse when a week of the window was closed by a decision that records no gates, such as a nonclinical exercise substitution (measured: a long run of 65 minutes where the record allows 41; QUALITY 34 / LONG 60 where an all-adverse answer plans EASY 25 / LONG 35; a taper quality session and a race touch where the direct answer plans easy running). No such record is carried into any use beyond the offline reference; if one is, after a decision that recorded an answer on it without applying it, the run doses remaining in that week are not presented as a prescription: the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts. Cadence and wording belong to G03.

## REMAINING_NONBLOCKING_FINDINGS

Não bloqueantes, registrados no handoff (C7) e encaminhados:
- **QE-R7C-15** (menor): no registro sem relógio, a leitura do FREEZE-3 também deixa respostas em dose cheia e adversas sem aplicar quando uma semana da janela foi fechada por decisão que não registra gates (substituição não clínica, mudança de agenda): 128 de 224 células (Engineering), 13 de 24 (SSCTR); com relógio, todas convergem. Coberto pela cláusula retroativa da C3; a frase do registro do freeze ("sound for full-dose and adverse") subestima isso, e o registro não é editado.
- **QE-R7C-16** (menor; aceito pelo SSCTR na C11 (b)): quem relata sempre atrasado, com corridas curtas, agora replaneja semanas futuras antes da revisão da semana. São 19 replanejamentos, a maioria para baixo, com 16 aumentos de 3 a 5 min, 14 acima do que a revisão da semana planeja depois, VALID até ela, nunca na semana atual. A parte de motor fica com o QE-R7C-12.
- **QE-R7C-17** (observação): três regras do relógio sem teste (fusão com linha sem relógio; reenvio que ordena antes da linha carregada; `reportedAt` nunca é o carimbo). O runtime segue as três.
- **QE-R7C-18** (observação, pré-existente desde o R7B2-FREEZE-1): correção de um relato no prazo registrada por rota clínica só é aplicada na revisão da semana. A C3 protege o consumidor.
- **SSCTR:** P7-F02 (QE-R7C-12 depois de resposta direta encurtada, C9 r6); P7-F03 (registros sem relógio, C3); P7-F04 (R3 com toda adversa, C7); P7-F05 (documental: três frases do handoff, corrigidas no fechamento); P7-F06 (observação).
- **Inalterados e não absorvidos:** QE-R7C-08, -09, -11, -12, -13, CC-F01 / R1, C8, C5, C10, o HOLD do R4, D1, G03, e os mutantes J-M3 e J-M5 sem testemunha (fora do QE-R7C-10).

## R7C_STATUS

**`CLOSED_READY`.** QE-R7C-10 fechado; P6-F01 fechado; os dois gates sem bloqueio; condições e resíduos não bloqueantes registrados no handoff (`CoachingCore/r7/c/R7C_HANDOFF.md`). `R7C-FREEZE-4` é o estado final da R7-C. D1 continua `ACCEPTABLE_RESIDUAL` (holdout H19 idêntico).

## V1_COACHING_AUTHORITY_READY

`NO`.

## GIT

- Branch `claude/domain-coaching-r7-c`, worktree `.claude/worktrees/domain-coaching-r7-c`.
- O commit de fechamento fica sobre `dcb6d19`; o SHA dele está no `git log` da branch.
- **Sem push e sem merge.** Nenhum pedido de push nesta fase; a branch, local, segue as Fases 1–6.

## NEXT

**R7-D — Fresh Generalization Gate**, com autorização própria do Founder. **Não iniciada.**

Para uma missão de runtime posterior, também com autorização própria:
- QE-R7C-13;
- CC-F01;
- C8, C5 e o HOLD do R4;
- QE-R7C-09;
- a parte de motor do QE-R7C-12/16;
- os testes do QE-R7C-17;
- o QE-R7C-18;
- as testemunhas de J-M3 e J-M5.
