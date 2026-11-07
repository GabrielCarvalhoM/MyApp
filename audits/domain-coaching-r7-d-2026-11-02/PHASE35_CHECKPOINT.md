# R7-D Fase 3.5: checkpoint de fechamento (2026-11-07)

**DOMAIN_COACHING_R7-D, Fase 3.5: fechamento técnico do motor, decisões definitivas da V1 e preparação para o holdout.** A autorização do Founder está resumida em `phase35/AUTHORIZATION_PHASE35.md`.

## PHASE35_STATUS

**COMPLETE: R7D-FREEZE-5 criado e verificado.** Os três bloqueios da Fase 3.4 estão fechados. O único ciclo de correção foi usado no QRE-P35-01 e fechou.

- **Aprovação técnica do runtime:** sim, pelos dois juízes independentes. O SSCTR-R7D-P35-RECHECK-r2 deu ACCEPT_WITH_CONDITIONS, e o QRE-R7D-PHASE35-CHECK-r2 deu READY_WITH_CONDITIONS. É autoridade interna provisória, não aprovação profissional humana, e não houve validação humana nem empírica.
- **Prontidão para o holdout:** ainda não. Antes de existir qualquer holdout final, faltam itens de instrumento por adendo só de acréscimo (CQ4-2, CFP35R2-02). A Fase 4 e o holdout exigem autorização separada do Founder.
- **Prontidão comercial da V1:** não. O F08 continua aberto, a autoridade de coaching da V1 é NO, e a checagem do enquadramento da comercialização é uma dependência administrativa separada. Isto não é autorização de lançamento.

## BASELINE

| Item | Valor (confirmado ao abrir a fase) |
|---|---|
| Ramo / worktree | `claude/domain-coaching-r7-d` / `.claude/worktrees/domain-coaching-r7-d` |
| Ponto de partida | checkpoint da Fase 3.4 `a8dbc57`; candidato não congelado `46934a0` (runtime `77768e6`) |
| Último freeze válido | R7D-FREEZE-4 (registro `8bbbb8e`, arquivos `b242237`); `RUNTIME_FREEZE_R7D_5.json` inexistente |
| Estados | `FINAL_HOLDOUT_EXISTS = NO`; `V1_COACHING_AUTHORITY_READY = NO`; F08_OPEN |
| Fila de revalidação humana | 235 itens (nenhum acréscimo autorizado nesta fase) |

As probes dos dois revisores da Fase 3.4 reproduziram byte a byte em `46934a0`: 125 casos fixados. Isso deu o oráculo do CFR2-03 (nada mais muda).

## THREE_BLOCKERS_BEFORE_AFTER

Só `CoachingCore/src/r6-adaptation.mjs` mudou: `5839f83` (sha256 `60d91e22…e310`) e, no ciclo, `6203dcf` (sha256 `5e910f52…035e`). Nenhum número, entrada ou política nova.

| Bloqueio | `46934a0` | Candidato | Correção |
|---|---|---|---|
| **SSCTR-P34R2-F01** (SY1): semana de prova sem corrida com gate; força e shakeout opcional com recuperação adversa | SHORT 4, `OWN_RETURN`, corrida reentra (30/34/35/40) | **MODERATE 25, `TRAINING_NOT_REESTABLISHED`**, igual ao SY1g | O redutor expõe o flag sistêmico que os gates aplicam; a reentrada da corrida exige `!systemic`, inclusive pelo toque e pela prova. SY0 e SY1x inalterados |
| **SSCTR-P34R2-F02** (CU3): correção que descobre o longão de domingo nunca relatado | LONG 32 **RESTART**, sem pergunta | **ASK `TRAINING_BETWEEN_BREAKS`** pelo domingo (= CU3f). Respondido feito: SHORT 4 `OWN_RETURN` (= CU3fa) | O relato substituído não marca mais dias de parada (`unreportedBetween`), nem no histórico da semana de reentrada |
| idem (CU1, LC1/LC1d, CU2) | aplicadas sem perguntar; CU2 perguntava 2 de 5 sessões | perguntam exatamente o que o relato novo pergunta (Mon wk6; Mon–Tue wk6; as 5 de wk5) | idem; a correção repetida não muda nada |
| **QRE2-P34-01** (R07): resposta à pergunta de hora de início numa releitura | toda resposta caía em "as one period", ASK até a semana 9 | reafirmar a pausa com a hora é lido: segue a confirmação do I6 (quando o estado muda) → REESTABLISH → nenhum ASK depois. Hora antes da sessão: nada muda | Uma reafirmação da pausa listada (fatos iguais, menos nome e hora; o relato mais novo decide) é o relato em vigor da hora dela, lido por toda releitura, nunca uma pausa nova |
| idem (R04, correção) | ASK persistente por qualquer canal | por relato de retorno ou revisão semanal: aplicado na mesma revisão; por outro evento: registrado e aplicado na revisão seguinte; = a mesma correção com a hora dada desde o início | idem |
| **QRE-P35-01** (achado na primeira checagem de qualidade, preexistente desde `46934a0`): relato sem nome com as mesmas datas da última pausa, depois de um retorno que leu a pausa anterior como retorno próprio | a viagem era restabelecida sozinha e a pausa anterior caía: força voltava a cargas conhecidas (agachamento 2x8 a 85 kg em vez de 1x7 ESTABLISH). O R7D-FREEZE-4 pergunta | relido por `recordedStop`, como o relato nomeado: lê a parada inteira (= o relato nomeado) | ciclo único, `6203dcf`: a menor correção do QRE, aplicada como escrita |

As perguntas genuinamente necessárias continuam:
- confirmar a viagem antes de dar a hora pergunta a hora de novo;
- uma hora em outro dia ou um fato diferente continua perguntado (O-02);
- um retorno de continuidade reenviado com os dias da viagem pergunta.

## TESTS_AND_REGRESSIONS

- **Suíte:** 1005/1005.
- **Dirigidos:** Fase 3.5 13/13 (T31–T38); 3.4 40/40; 3.3 14/14; 3.2 17/17; 3.1 14/14. Nenhum teste existente mudou desde `46934a0`; T36–T38 foram só acrescentados.
- **RED em `46934a0`:** falham exatamente os 9 testes dos achados (T31, T32 ×3, T33 ×3, T36, T38). Os 4 de adequação (T34, T35 ×2, T37) passam lá.
- **RED em `8e78b8a`** (o candidato da primeira checagem): só o T36 falha.
- **Conformidade:** R7-B, R7-B.1 e R7-B.2 PASS.
- **Regressões (R7D-HARNESS-7 r2):** diagnóstico com 18 casos e gerado com 100, sem violação de propriedade. O único erro de corpus é o R7D-D11, preexistente e idêntico na Fase 3.4.
- **Diferencial contra `46934a0`:** 177 casos, 169 idênticos e 8 diferentes, todos explicados:
  - DEV-48 pelo SYSTEMIC;
  - DEV-49 pelo CORRECTION;
  - DEV-51, DEV-52, DEV-55 e DEV-56 pelo RESTATEMENT;
  - DEV-53 pelo DUPLICATE;
  - DEV-57 pelo CORRECTION e pelo RESTATEMENT.
- **Diferencial contra `8e78b8a`:** 177 casos, 176 idênticos; só o DEV-53 difere (DUPLICATE). O ciclo não alcança nenhum outro caminho.
- **Fidelidade:** todas as probes fixadas das rechecagens da Fase 3.4 foram rodadas de novo. Só os casos de fechamento mudaram. `qre2-p34-harness` muda apenas nos campos do próprio harness; passos, retornos e doses são idênticos. As saídas são idênticas às da execução em `8e78b8a`, exceto os caminhos de scratch.
- **Divergência preexistente (O-P35-01, redação corrigida pelo SSCTR-P35-O01):** uma correção que move uma pausa curta sobre o slot que o primeiro relato tinha tornado leve (R27) deixa a qualidade seguinte sem a versão leve.
  - Em correção de pausa única, é igual no R7D-FREEZE-4, no `46934a0` e no candidato.
  - Na forma de duas pausas do T32, o R7D-FREEZE-4 a tornava leve (porque descartava a pausa anterior): ali o candidato é uma sessão leve menos conservador, desde a Fase 3.4.
  - Não foi mudada; está divulgada e vai à próxima fase autorizada.

## MUTATION_AND_SENSITIVITY

- **Mutação** (`phase35/evidence/MUTATION_PHASE35.json`): 18/18 mortos, cada um pela própria testemunha:
  - P35-M01 a M12, sobre as três correções;
  - P35-M13, o QRE-P35-01 revertido (morto pelo T36);
  - Q10 e Q15, os sobreviventes do QRE-P35-05 (mortos pelo T37 e pelo T38);
  - N01, N05 e DEPTH2, os sobreviventes do QRE na Fase 3.4.
- **R7D-HARNESS-7 r2, validação 7 r2:**
  - 59 casos DEV, sem falso bloqueio;
  - 23/23 linhas de sensibilidade. As novas são DEV-48 por P18(e) e DEV-49 por P18(f), em `46934a0`, e DEV-53 por P18(d), em `8e78b8a`;
  - 56/56 testemunhas;
  - P17 com 245 unidades e P18 com 170;
  - unidades não avaliáveis listadas por caso: DEV-17, DEV-17b e DEV-41 (P06); DEV-47 e DEV-50 (P18).
- **Δ23 resolvido:**
  - **CFR2-04:** detectores para SY1 e CU3.
  - **CQ2-2:** a guarda NESTED lê pelo primeiro dia; QH4/DEV-50 vira NOT_EVALUABLE.
  - **CQ2-3:** T34 fixa as doses da cadeia em dois níveis e mata o DEPTH2; as unidades não avaliáveis são listadas por caso; o texto do Δ30 foi completado.
  - **CQ2-4:** T35 mata N01 e N05.
  - **NOT_EVALUABLE nunca vira PASS.**
- **Instrumento corrigido no ciclo** (só harness; PREREG-6 Δ35):
  - **P18(e)** conta só o que o redutor lê como ADVERSE (SSCTR-P35-F01 = QRE-P35-02). Recuperação ADVERSE com desempenho OVER é CONFLICTING. DEV-54 é o controle.
  - **P17:** uma reafirmação encerra só a janela da própria pausa (QRE-P35-03; W-P17f, DEV-56, DEV-57).
  - **P18:** uma reafirmação não é pausa aberta (QRE-P35-04; DEV-55).
- **Correções do instrumento encontradas pelo autor antes das checagens:** P18(c) (DEV-48) e P17/P08 na reafirmação (Δ32). A primeira convocação, sobre `9736718`, foi parada antes de qualquer saída e refeita sobre `8e78b8a`.

## SSCTR_REVIEW

**Primeira checagem, sobre `8e78b8a`** (`phase35/reviews/ssctr/SSCTR_PHASE35_RECHECK_R7D.json`): ACCEPT_WITH_CONDITIONS.
- F01 e F02 fecharam exatamente como o r2 da Fase 3.4 os definiu.
- O lado de domínio do QRE2-P34-01 foi aceito, com a ordem das perguntas.
- O-P35-01 é resíduo divulgado.
- Achado novo, não bloqueante: **SSCTR-P35-F01**. O P18(e) contava relatos CONFLICTING.

**Rechecagem, sobre `33d3181`** (`SSCTR_PHASE35_RECHECK2_R7D.json`): **ACCEPT_WITH_CONDITIONS**. Foi feita por uma instância nova, exigida pelo CFP35-01 porque bytes de runtime e de teste mudaram. Nenhum achado bloqueante.
- **Q1, QRE-P35-01:** o reenvio sem nome com as mesmas datas agora é igual ao nomeado em todas as variantes. O feriado fica como retorno próprio, e o agachamento é 1x7 ESTABLISH (em `8e78b8a` era 2x8 a 85 kg; o R7D-FREEZE-4 perguntava). O QH18 dá 1x9 ESTABLISH, como a confirmação nomeada. Os controles mantêm o sentido nos quatro runtimes. Só as formas de duplicata sem nome diferem de `8e78b8a`.
- **Q2, SSCTR-P35-F01:** fechado como a menor correção pedia. O P18(e) coincide com o classificador do runtime nas 288 combinações com recuperação ADVERSE; o harness r1 errava 12. O DEV-54 é o controle certo. O DEV-48 e a W-P18j continuam detectados. Nenhuma outra propriedade foi enfraquecida.
- **Q3, T37:** a rota clínica está correta por todos os canais e nos quatro runtimes.
- **Q4:** o Δ36 é fiel em substância. **SSCTR-P35R2-F01** (baixo, não bloqueante) registra três pontos que ele omite:
  - (a) o juiz de domínio do holdout final lê a forma de duas pausas do O-P35-01 como o resíduo divulgado;
  - (b) se uma sessão de força acima da meta com recuperação adversa deve segurar é uma questão de gate do R6, não revisada;
  - (c) a redação "as one period" do O-02 convida a fundir pausas com semanas de treino entre elas, o que a direção A proíbe.
- **Q5:** nenhum número novo.
- **Observações:**
  - **SSCTR-P35R2-O01:** um reenvio sem fato novo replaneja a partir do próprio dia. É custo de estabilidade do plano, preexistente do R7-A, dentro da receita SHORT.
  - **SSCTR-P35R2-O02:** uma frase de JSDoc desatualizada acima de `adverseConvergence`, a corrigir na próxima revisão do harness.
- **Condições:**
  - **CFP35R2-01:** congelar exatamente os bytes checados, `r6-adaptation.mjs` 5e910f52…, `r6-composition.mjs` 8aa5f950…, `r7d-phase35.test.mjs` 03880b41… e `properties.mjs` 09972fa6…. Foi cumprido.
  - **CFP35R2-02:** divulgar, inclusive os pontos (a)–(c).
  - **CFP35R2-03:** o SSCTR-P35-F01 está fechado; qualquer mudança nessas propriedades o reabre.
  - **CFP35R2-04:** CFP35-04 carregado.
- **Fila:** o item HQ-R7D-SSCTR-P35-RECHECK r2 é só proposto. Ele substitui as propostas r1 e as do P34-RECHECK.

## ENGINEERING_REVIEW

**Primeira checagem, sobre `8e78b8a`** (`phase35/reviews/engineering/QUALITY_CHECK_R7D_PHASE35.json`): **NOT_READY**.
- **QRE-P35-01** (HIGH, novo, estreito, só runtime, preexistente desde `46934a0`): o relato sem nome com as mesmas datas derrubava a pausa anterior.
- **Não bloqueantes:** QRE-P35-02 (= SSCTR-P35-F01), -03 e -04 (harness), -05 (Q10 e Q15 sem teste) e -06 (guarda do freeze).
- Isso abriu o ciclo único: o runtime `6203dcf` aplica a menor correção do QRE, como escrita, com T36–T38, o harness r2 e a guarda.

**Rechecagem, sobre `33d3181`** (`QUALITY_CHECK_R7D_PHASE35_R2.json`): **READY_WITH_CONDITIONS**. Nenhum achado bloqueante.
- **Q1:** o QRE-P35-01 está fechado.
  - A linha de `6203dcf` é a menor correção do r1, byte a byte; dá 74/74 casos iguais ao protótipo.
  - QH17 e QH18 são iguais aos relatos nomeados, e nada fica perguntado até a semana 11.
  - O T36 é o único teste vermelho em `8e78b8a` (1004/1005).
  - Nas 18 formas de duplicata sondadas, a forma sem nome é igual à nomeada. Onde o R7D-FREEZE-4 pergunta, as doses do candidato nunca passam da resposta nomeada dele.
  - O diferencial independente dá 177/176/1 contra `8e78b8a` (DEV-53), 177/169/8 contra `46934a0` e 177/148/29 contra o R7D-FREEZE-4. Contra este, a única pergunta nova é a do DEV-49, como no r1.
- **Q2:** Q10 morre só pelo T37 e Q15 só pelo T38.
- **Q3:** as três correções do harness funcionam como descritas, sem falso bloqueio no corpus DEV nem nas regressões. DEV-48 e DEV-49 continuam detectados em `46934a0`, e DEV-53 em `8e78b8a`. O mutante QH-DROP agora é detectado.
- **Q4:** a guarda do freeze e as evidências são adequadas.
- **Não bloqueantes:**
  - **QRE3-P35-01** (MEDIUM, só testes): três cláusulas da linha nova não têm teste. Os mutantes QF3, QF6 e QF7 sobrevivem à suíte.
  - **QRE3-P35-02** (MEDIUM, harness, introduzido pelo r2): `sameBreakNamed` compara nomes literalmente. Quando duas respostas nomeiam a mesma pausa de formas diferentes, o P17 bloqueia falsamente (QH21, QH22).
  - **QRE3-P35-03** (LOW): o P18(e) exige `completed` também em relato confundido. É mais estreito que o runtime e que o texto do Δ35, mas continua condição necessária.
  - **QRE3-P35-04** (LOW): o freeze não vincula as pastas `probes2/`; o CQ4-3 manda checá-las.
- **Condições:**
  - CQ3-1 a CQ3-4 cumpridos; CQ3-5 carregado.
  - **CQ4-1:** os testes do QRE3-P35-01 no próximo candidato, ou antes de qualquer mudança em `returnAfterPause` ou `recordedStop`.
  - **CQ4-2:** corrigir QRE3-P35-02 e -03 antes de qualquer holdout, com casos DEV.
  - **CQ4-3:** freeze só sobre `33d3181` mais arquivos novos de revisão, com os hashes de `probes2/` checados. Foi cumprido.

## R7D_FREEZE_5

**Criado.** O registro é `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json`, sha256 `956da5c23c3499fd85af532e384e9302be15158fbc85a309e3d50c8721456dd8`, com commit em `20c099d`.

| Item | Valor |
|---|---|
| Commit vinculado | `7272e9a`: o candidato revisado `33d3181` mais os registros r2 dos revisores. `postReview` mostra 79 linhas, todas `A`, só nas duas pastas de revisão |
| Runtime | `r6-adaptation.mjs` `5e910f52e1454c07662001bc66dd574bfc8bea4fa1876bd09e434d00c74e035e` (runtime `6203dcf`); `r6-composition.mjs` `8aa5f950…18a8`, inalterado desde `1978cc4` |
| Testes e harness vinculados | `r7d-phase35.test.mjs` 03880b41…; `harness/lib/properties.mjs` (R7D-HARNESS-7 r2) 09972fa6… |
| Source digest | `578450b5205365e45a2c7a22090c1d167cf1a3c95f625503cfbf5ed5ba02a6a8` |
| Manifest digest | `ce3fe8e117b3696756775b1446e2b35fe2f725c4dc469d66eeaba7e5ea73168e` |
| Arquivos vinculados | 649 |
| Suíte no freeze | 1005/1005; conformidade R7-B, R7-B.1 e R7-B.2 PASS |
| Revisões vinculadas | SSCTR-R7D-P35-RECHECK-r2 (ACCEPT_WITH_CONDITIONS) e QRE-R7D-PHASE35-CHECK-r2 (READY_WITH_CONDITIONS), com condições e achados copiados. As primeiras checagens e o ciclo estão em `phase35` |
| Predecessor | R7D-FREEZE-4: substituído, não editado. O verificador dele falha `files-current` de propósito |

O registro carrega F08_OPEN, `V1_COACHING_AUTHORITY_READY = NO` e `finalHoldoutExists = false`. É referência sombra (shadow reference), sem número novo.

## FREEZE_VERIFICATION

- `node CoachingCore/scripts/verify-r7d-5.mjs --suite --write`: **PASS, 34/34 checagens**, incluindo:
  - arquivos atuais e commitados;
  - digests;
  - evidências e revisões;
  - autoridades;
  - fila só por acréscimo;
  - F08 aberto, sem holdout final, autoridade V1 = NO;
  - suíte 1005/1005;
  - as três conformidades.
- `CoachingCore/r7/d/VERIFICATION_R7D_5.json`: sha256 `18d216c003a6045c273c2f3da1fc92d1b513fb0d051703b4362c4b33fd9f08bc`.
- **CQ4-3 / QRE3-P35-04:** as pastas `probes2/` batem com as listas de hash dos próprios registros. São 58/58 na engenharia e 17/17 no SSCTR, sem arquivo fora da lista. O resultado está em `phase35/FREEZE5_PROBES2_CHECK.json`.

## V1_PRODUCT_POSITIONING_DECISION

**Registrada** em `phase35/FOUNDER_DECISIONS_PHASE35.md` (D1). Em substância:
- a V1 oferece sugestões automatizadas e personalizadas de treino, geradas pelo algoritmo baseado em literatura científica do esporte;
- não alega acompanhamento humano nem validação que não aconteceu;
- a profissionalização vem depois, financiada pela receita, sem pré-condição de auditoria paga.

**Regra absoluta:** o produto não muda. Ficam preservados os planos personalizados, a prescrição, a progressão, o histórico e os recordes, os três perfis de treinador, os controles de volume e de dificuldade, o híbrido, as telas, o tom e o Figma.

O que ficou de fora do motor:
- a dependência administrativa separada: verificar o enquadramento da comercialização, com dono Founder e jurídico;
- o alinhamento documental, com dono PCG e Product/UX, numa missão autorizada.

Nada em `product/`, `canon/`, no motor ou na UI mudou por causa desta decisão.

## F08_PRODUCT_DECISION

**Registrada** (D2). Ela estabelece:
- **as três situações:**
  - (1) redução temporária de 3–14 dias, com retomada conservadora, equilibrada ou mais rápida, sempre dentro dos limites do motor;
  - (2) doença ou lesão relevante: recomendar avaliação, sem diagnosticar; depois, recomeço utilizável pela declaração do atleta, sem atestado universal e nunca apresentado como liberação médica;
  - (3) interrupção longa: plano novo com avaliação atualizada, preservando o histórico;
- o diferencial híbrido: reduzir uma modalidade sem suspender a outra;
- as velocidades de retomada não são os perfis de treinador.

É o gatilho T2 do PCG-R7D-F08-r1. **O F08 continua `F08_OPEN`** (BLOCKED_BY_AUTHORITY, F08-BLOCK-G04): nem a governança G04 nem o runtime clínico mudaram.

Enquanto um atleta recuperado puder ficar sem saída legítima, a V1 não é funcionalmente completa. Resolver isso é obrigatório antes do lançamento, sem contaminar este freeze.

## F08_MINIMAL_FOLLOWUP_MISSION

Está em `phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md`.

**Proteções que ficam:**
- nunca diagnosticar nem dar liberação fictícia;
- sinal atual leva à avaliação;
- contraindicação conhecida limita a prescrição;
- recomeço conservador;
- gatilhos de volta à rota clínica;
- R-F08-1;
- histórico preservado.

**O que sai na V1 (excessivo):**
- bloqueio permanente até existir G04;
- atestado como única saída;
- proibição da declaração de prontidão e do plano novo;
- suspensão das duas modalidades quando a restrição é de uma.

**Menor delta (G1–G9):**
- DR nova do Founder (supera em parte o DR-99);
- ajuste no AEC §7; a AEOS regra 4 fica inalterada;
- escopo G04;
- re-revisão PCG por T2;
- decisão SSCTR (três velocidades dentro das receitas e tetos existentes, sem número novo);
- Security/G07 (dados de saúde);
- copy;
- PREREG e INTERFACE.

**A missão:**
- autoridade, depois runtime (R1–R4: entrada de prontidão, redução e velocidade, plano novo, por modalidade);
- testes dirigidos;
- SSCTR e QRE estreitos;
- freeze.

**STOP_WHEN e ESCALATE_IF** estão definidos no documento.

## FINAL_HOLDOUT_EXISTS

**NO.** Nenhum holdout, autor final ou seed final foi criado. A Fase 4 e o holdout independente exigem autorização separada do Founder.

## V1_COACHING_AUTHORITY_READY

**NO.** O R7D-FREEZE-5 é referência sombra interna. Nenhuma autoridade de coaching V1, validação humana ou empírica, ou autorização de lançamento foi concedida.

## REMAINING_FINDINGS

**Antes de qualquer holdout final.** Itens de instrumento, por adendo só de acréscimo numa fase autorizada:
- **CQ4-2:** QRE3-P35-02, ou seja, `sameBreakNamed` resolver os dois nomes pela pausa listada, com casos DEV das formas QH21 e QH22. Também QRE3-P35-03: alinhar o P18(e) com o Δ35 ou reescrever o Δ35.
- **CFP35R2-02 / SSCTR-P35R2-F01:** os pontos (a)–(c) no próximo adendo do PREREG-6. O PREREG-6 está vinculado ao freeze e não recebeu nada depois dele.
- **CFP35R2-03:** qualquer mudança em `adverseConvergence`, no fim da janela do P17, nas pausas abertas do P18 ou em `restatesListed` volta para uma instância nova do SSCTR ou para o brief do juiz de domínio.

**No próximo candidato, ou em qualquer mudança de `returnAfterPause` ou `recordedStop`:**
- **CQ4-1:** os testes do QRE3-P35-01, nas formas N16b, N6 e N9. Eles têm de matar QF6, QF3 e QF7. Nenhuma mudança de runtime.

**Resíduos divulgados, sem envelope:**
- **O-P35-01:** na forma de duas pausas, o candidato fica uma sessão leve menos conservador que o R7D-FREEZE-4. A leitura do slot R27/R7-A.2 vai para a próxima fase autorizada.
- **SSCTR-P35-O02:** o gate de força só segura em ADVERSE.
- **SSCTR-P35-O03:** a redação do O-02 vai para o dono da interface.
- **SSCTR-P35R2-O01:** um reenvio sem fato novo replaneja.
- **SSCTR-P35R2-O02:** JSDoc desatualizado.
- **Carregados da Fase 3.4:**
  - X2 / SSCTR-P34-F03 e F04;
  - SSCTR-P34R O01 e O02, e SSCTR-P34R2-O02;
  - QE-R7D-P33-03 e -04;
  - R-F08-1 R1/R2;
  - os itens roteados do CQ3-5.

**Fora do motor:**
- **F08_OPEN** (BLOCKED_BY_AUTHORITY, F08-BLOCK-G04): obrigatório antes do lançamento, pela missão F08 preparada.
- A checagem do enquadramento da comercialização (Founder e jurídico).
- O alinhamento documental do D1.

**Fila de revalidação humana:**
- Continua com 235 itens; esta fase não autoriza acréscimo.
- Ficam só propostos: HQ-R7D-SSCTR-P35-RECHECK (r2, que substitui as propostas anteriores) e HQ-R7D-SSCTR-P34-DECISION.

## EXACT_NEXT

Nenhuma fase abre automaticamente. Decisões do Founder, cada uma por autorização própria:
1. **Fase 4 (holdout independente):** antes de criar o holdout, aplicar os itens de instrumento do CQ4-2 e do CFP35R2-02 por adendo só de acréscimo. Depois vêm a checagem estreita que o CFP35R2-03 exige e o holdout, sobre os bytes do R7D-FREEZE-5.
2. **Missão F08** (`phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md`): obrigatória antes do lançamento, independente da Fase 4.
3. **Acréscimo à fila** de HQ-R7D-SSCTR-P35-RECHECK, nomeando o R7D-FREEZE-5, numa fase que o autorize.
4. **Checagem administrativa** do enquadramento da comercialização (D1).

## GIT_STATE

- Ramo `claude/domain-coaching-r7-d`, com 16 commits da fase depois de `a8dbc57`:
  - runtime `5839f83` e `6203dcf`;
  - testes `f8cf12e`;
  - candidatos `9736718` (convocação parada), `8e78b8a` e `33d3181`;
  - revisões `e64478e` (r1) e `7272e9a` (r2);
  - freeze `20c099d`.
  Depois vêm este checkpoint e os blocos de missão e ledger.
- Nada foi enviado (push) nem mesclado (merge). Nenhuma worktree foi apagada.
- Nada foi apagado. As reconstruções estão em diretórios novos e exclusivos sob o scratchpad da sessão.
- `product/`, `canon/`, a política, o catálogo e os registros R6/B0 estão inalterados. Os freezes R7D-FREEZE-1 a -4 estão intactos.
- `CURRENT_MISSION.md`, `MISSION_LEDGER.md` e `PREREGISTRATION_R7D_6.md` receberam apenas acréscimos.
