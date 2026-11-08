# R7-D Fase 4: checkpoint de fechamento (2026-11-08)

**DOMAIN_COACHING_R7-D, Fase 4: holdout independente, julgamento final e encerramento controlado.** A autorização do Founder está resumida em `phase4/AUTHORIZATION_PHASE4.md`; o protocolo é o do `PREREGISTRATION_R7D.md` §8, completado pelo `PREREGISTRATION_R7D_7.md` Δ46.

## PHASE4_STATUS

**COMPLETE, com resultado NOT_READY.** A fase rodou de ponta a ponta pelo protocolo:
- condições pendentes resolvidas nos instrumentos;
- autor independente;
- selo antes de qualquer execução;
- avaliação única;
- dois julgamentos independentes em paralelo.

O resultado bloqueia o encerramento do R7-D: os dois juízes encontraram, cada um, um bloqueio estrutural confirmado num caso válido. Além disso, o holdout perdeu cobertura crítica registrada. Nenhuma correção foi feita, nenhum holdout foi repetido, e nada se abriu depois disso.

## FREEZE_5_VERIFICATION

- Registro `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json`, sha256 `956da5c23c3499fd85af532e384e9302be15158fbc85a309e3d50c8721456dd8`. Vincula `7272e9a`; source digest `578450b5…`; manifest digest `ce3fe8e1…`; 649 arquivos.
- **Na abertura:** `verify-r7d-5 --suite` deu 34/34, suíte 1005/1005, sobre `3563d71`. Depois do commit dos instrumentos, sem `--suite`, deu 30/30.
- **Nas duas avaliações:** 649/649 arquivos iguais ao registro, `runtimeDiff` vazio.
- **No julgamento:** o juiz de qualidade rodou `verify-r7d-5 --suite` e obteve 33/34. A suíte de 1005 e as três conformidades passam; só `no-final-holdout` falha, por desenho, porque `final/` agora existe.
- **No fechamento** (`1b3c93c`, só leitura, sem `--suite`): 29/30, também com só `no-final-holdout` falhando.
- **Nenhum byte vinculado ao R7D-FREEZE-5 mudou.** Todo arquivo da fase é novo.

## PENDING_CONDITIONS_RESOLUTION

Todas resolvidas antes do holdout, só em instrumentos, casos de validação e documentação. Ficaram no commit `58d6766` e foram registradas no PREREG-7 (sha256 `2ccceb18…`).

| Condição da Fase 3.5 | Resolução | Evidência |
|---|---|---|
| QRE3-P35-02 / CQ4-2, falso bloqueio do P17 | R7D-HARNESS-8: duas formas de nomear a mesma linha de pausa separada do último retorno aplicado contam como a mesma pausa (Δ38) | Validação 8: DEV-58 e DEV-59 falham no HARNESS-7 r2 e passam no HARNESS-8 (`FALSE_BLOCK_REMOVED`); nenhum falso bloqueio nos 64 casos; 27/27 linhas de sensibilidade, inclusive QH-DROP; 56/56 testemunhas. O juiz de qualidade reproduziu |
| QRE3-P35-03 / CQ4-2, P18(e) | Texto do Δ35 alinhado ao código, e JSDoc corrigido (Δ39) | O juiz de qualidade confirmou que a diferença do harness é só o Δ38 e o Δ39 |
| CFP35R2-02, as três divulgações (SSCTR-P35R2-F01 (a)–(c)) | Registradas no Δ40, com O01 e O02 | PREREG-7 |
| QRE3-P35-01 / CQ4-1, três cláusulas sem teste | T39, T40 e T41 fora do `CoachingCore` (Δ41) | `phase4/evidence/CQ41_MUTATION_PHASE4.json`: 3/3 no freeze; QF3 falha só o T39, QF7 só o T40, QF6 só o T41; QF0 falha os três. O juiz de qualidade reproduziu |
| CFP35R2-03 | Levado ao juiz de domínio (Δ42) | O SSCTR aceitou a leitura. O H1 tem zero janelas `WINDOW_ENDED_BY_ROW_NAME` (contagem confirmada pelos dois juízes); nenhuma unidade depende dela |

Nenhuma condição exigiu runtime.

## HOLDOUT_INDEPENDENCE

- **Autor:** instância nova, que não escreveu o runtime, o harness, corpus anterior nem julga.
  - **Leu só:** o brief 7 (`R7D-AUTHOR-BRIEF-FINAL-7`, sha256 `456f7245…`), a interface 1 e os deltas 2–7, e o esquema. Rodou `check-corpus.mjs` sem ler o arquivo.
  - **Não abriu:** o runtime, o harness, casos de desenvolvimento, holdouts anteriores, pareceres ou git.
  - **Registro:** o manifesto tem as nove entradas com hash, conferidas contra `58d6766`, os seis indicadores falsos e todos os comandos.
- **Tempo:** `authorStartedAt` 2026-11-08T02:22:52.247Z, 88 s depois do commit dos instrumentos e depois do freeze (2026-11-07T22:29:32.639Z). `sealedAt` 03:52:36.663Z.
- **Juízes:** instâncias novas do SSCTR e de Quality/Reliability, em paralelo; nenhum leu a pasta do outro. Escreveram só nas próprias pastas.
- **Limite:** o comportamento de leitura do autor é autodeclarado.

## HOLDOUT_CORPUS

- **H1** (`final/R7D_FINAL_HOLDOUT.json`, sha256 `2f2a5d270c96117dfa5a8ef3c9b8a8ba2d380c7ec27c0835a7af8a4834b63b18`):
  - 35 casos, 98 passos, `check-corpus` com 0 erros e 0 avisos;
  - digest de selo do manifesto `a0b6d7d8…`;
  - casos e cobertura declarados pelo autor em `phase4/AUTHOR_REPORT_PHASE4.md`.
- **Níveis de atleta (Δ44):** iniciantes em F11, F13, F15, F25, F30 e F35; intermediários em F12, F24, F26, F28, F29 e F31–F34.
- **H2** (`final/generated/R7D_GENERATED_FINAL.json`, sha256 `b69fa543c7bac184c7f3cc0af67a2d6b33f6adf4b368e881a16a9cc752edba69`):
  - 300 cadastros gerados;
  - seed `9072a6b1…` = sha256('R7D-SAMPLE|FINAL|' + manifest digest do freeze);
  - digest de selo `2b396d89…`.
- **Selo:** `seal-final.mjs` (R7D-SEAL-FINAL-1) gravou os dois `SEAL.json`, no commit `14c7ec8`, antes de qualquer execução.
- **Lacunas de interface:** o autor registrou nove no manifesto (`interfaceGapsNoted`). As principais:
  - a composição da semana de prova é escolha do coach;
  - referências a semanas anteriores dependem do plano em vigor;
  - não está claro se `asPrescribed` grava carga numa linha ESTABLISH;
  - `startedAt` não aparece na lista de campos da interface 1.

## HOLDOUT_RESULTS

Uma única avaliação de cada corpus, `r7d-harness-8.mjs --first-evaluation`, em diretório novo, sem `--allow-runtime-diff`. Os dois manifestos têm `evaluationCount 1`, e o commit é `87d0978`.

**H1, H1-M** (RUN_REPORT `c6278b29…`), 35/35 avaliados, 0 erros de harness:
- **Propriedades PASS:** P01, P02, P04, P07–P14, P16, P17 (78 unidades) e P18 (61).
- **Falhas automáticas, com a decisão do juiz de qualidade:**
  - **P03:** F13 é violação do runtime (QRE-P4-F01). F21 é HARNESS_GAP.
  - **P05 e CARRIER_CLINICAL em F12:** HARNESS_GAP.
  - **P06 em F07:** HARNESS_GAP.
  - As três unidades com HARNESS_GAP voltam como NOT_EVALUABLE, nunca como PASS.
- **Relações sem violação:**
  - determinismo 31/31;
  - PERMUTE 25, DUPLICATE_SECOND_SOURCE 25, RENAME 28, RESEND 25;
  - RESTATE_DECLARED_BREAK 23, INSERT_NEWER_BREAK 4;
  - CONSENT_OFF 1, CLOCKLESS 25, CALENDAR_SHIFT 28, VARIANT 3.
- **CARRIER_HOLD:** 0 unidades.
- **CORPUS_ERROR, 4 casos (11,4 %):** referências a sessões que o plano em vigor não tinha. Os dois juízes confirmaram os quatro, e o cliente resolveu cada referência corretamente.
  - **F22 s1:** só a geração do programa continua avaliável.
  - **F32 s3, F33 s3 e F34 s4:** continuam avaliáveis os passos anteriores, inclusive os retornos.
- **Não avaliáveis:**
  - P06 em F13 (2 unidades; o SSCTR julga que passam) e em F21 (1; continua não avaliável);
  - P08 em F21 (1; o SSCTR julga que passa);
  - as unidades com HARNESS_GAP acima.

**H2** (RUN_REPORT `d5bcbd10…`), 300/300 avaliados, 0 erros de corpus, 0 violações:
- P01, P02, P06 (263 unidades, 28 não avaliáveis), P07, P11, P12 e P13 passam;
- determinismo 300/300;
- as demais propriedades não se aplicam a uma partida a frio e ficam NOT_EVALUABLE;
- 587 observações `SAME_TURN_CONFIRMATION_REQUESTED`, a condição de consumo registrada.

**Determinismo recalculado:** o juiz de qualidade recalculou num processo novo os digests dos passos dos 35 + 300 casos, e eles saíram idênticos.

## SPORTS_SCIENCE_JUDGMENT

Registro `SSCTR-R7D-P4-FINAL-HOLDOUT-r1` (`final/judgment/ssctr/`, JSON sha256 `f7cf6686…`, MD `8f794c70…`).

**Veredito: INVALID_HOLDOUT.** Nove itens de cobertura registrados ficaram sem caso válido. O juiz diz que, com holdout válido, o lado de domínio seria NOT_READY.

- **Bloqueio SSCTR-P4-F01** (GENERALIZATION_BLOCKER, PRE_EXISTING, estrutural):
  - **Defeito:** depois de um retorno moderado ou longo, os exercícios de força que o atleta nunca executou antes da pausa escapam dos limites de retorno da D49.
  - **No F13:** a semana de entrada prescreve 1x10 com RIR3, quando a regra pede RIR ≥ 4. A semana seguinte prescreve 3x10, 3x10 e 2x10, quando o passo 2 permite 2, 2 e 1 séries. O coordenador conferiu esses valores no pacote de domínio.
  - **Testemunha W-D49-A**, noutro atleta: o passo 2 chega a 4x8.
  - **Controle W-D49-B:** o mesmo atleta, com a semana 0 executada, segue a D49 exatamente.
  - **Origem:** saída idêntica no R7D-FREEZE-4.
  - **Classe:** SUBOPTIMAL, não UNSAFE (peso corporal e halteres a RIR3). Nenhum envelope ou divulgação cobre o caso.
- **Rubrica:** dos 31 casos avaliáveis, 15 BEST_SUPPORTED, 15 ACCEPTABLE_ALTERNATIVE e 1 SUBOPTIMAL (F13); 4 CORPUS_ERROR. Nenhum EXPECTATION_OUTSIDE_AUTHORITY.
- **Clínico:** o conteúdo é CLINICAL_OUT_OF_SCOPE em F09, F21 e F23, e o roteamento está correto.
- **Sem SCIENTIFIC_BLOCKER e sem passo UNSAFE.**
- **Perguntas de domínio do Founder**, com os casos no registro:
  - **Progressão de corrida:** coerente. Há um limite: quem já foi intermediário e hoje não corre recomeça com corridas contínuas de 15 min, pela receita RESTART aprovada, não com caminhada e trote.
  - **Progressão de força:** coerente onde a carga é conhecida, e carga desconhecida nunca é inventada. Não é coerente depois de um retorno para exercícios nunca executados (F01). A progressão com halteres não foi exercida.
  - **Interferência:** tratada dentro dos dias escolhidos pelo atleta.
  - **Fadiga e recuperação:** respostas proporcionais. A fadiga repetida com consentimento não foi exercida.
  - **Capacidade demonstrada:** preservada. O custo é conservador: uma semana de entrada pode se repetir, e isso está divulgado (B1–B4, O01).
  - **Segurança do retorno:** a corrida é segura (P08 com 36 unidades). Há dois limites:
    - a força depois do retorno, no F01;
    - palavras ambíguas no motivo da pausa falham fechado e podem travar um retorno (SSCTR-P4-O05).
  - **Nenhuma progressão sem evidência:** respeitada. As exceções são:
    - o F01;
    - a semana de recomeço não relatada, coberta pelo envelope CC-F05;
    - o silêncio longo no piso de entrada, sem efeito na dose (SSCTR-P4-O03).
  - **Compatibilidade:** compatível com R6, B0, F03B-MACHINE-STEP-r1 e BR-Q, exceto a D49 no F01. As regras de semana de prova do BR-Q4.1 não foram alcançadas em casos válidos.
- **Leituras que vinculam o julgamento:** X2 só aparece em casos com erro de corpus; nenhum passo depende do F08; a forma de duas pausas do O-P35-01 não ocorre.
- **Leituras de domínio sobre as falhas automáticas:**
  - F07 e F12: propõe HARNESS_GAP;
  - F13 P03(d): sem impacto na dose, registrado como POLICY_QUESTION SSCTR-P4-O03. A decisão sobre o critério 1 é do juiz de qualidade, abaixo.
- **Literatura:** duas das três fontes foram lidas só pelo resumo.

## QUALITY_RELIABILITY_JUDGMENT

Registro `QRE-R7D-FINAL-HOLDOUT-r1` (`final/judgment/quality/`, JSON sha256 `1b695807…`, MD `bbc9c83f…`).

**Veredito: INVALID_HOLDOUT** (QRE-P4-I01). O juiz diz que o bloqueio confirmado já exclui READY.

- **Integridade:**
  - **freeze:** PASS;
  - **protocolo:** PASS (selos, digests, tempo, ancestralidade, `evaluationCount 1`, saídas num único commit, harness e PREREG-7 iguais aos de `58d6766`);
  - **instrumento:** confiável, com três HARNESS_GAP. A diferença do harness bate com o Δ38 e o Δ39; a validação 8 e o CQ4-1 foram reproduzidos.
- **Bloqueio QRE-P4-F01** (GENERALIZATION_BLOCKER, PRE_EXISTING, estrutural, P03(d)):
  - **Defeito:** no F13 s1, uma revisão vazia depois de sete semanas sem nenhum relato sai VALID. Ela reduz as doses à entrada (EASY 20/20/LONG 15 vira 15/15/15) e não pergunta UNREPORTED_TRAINING, com 13 corridas planejadas sem relato na janela.
  - **Testemunha:** no cadastro do F25, o defeito aparece quando a primeira semana planejada é uma CONSOLIDATION de dose baixa. Antes de uma DEVELOPMENT, o mesmo atleta é perguntado.
  - **Origem:** idêntico no R7D-FREEZE-4 e no R7C-FREEZE-4.
  - **Não é SAFETY_BLOCKER:** a dose cai, nunca sobe. A causa no código não foi localizada.
- **HARNESS_GAP:**
  - **H01, P06 no F07:** `longestRunMinutes 0` é lido como corrida.
  - **H02, P03 no F21:** a única unidade contada é uma sessão que a própria revisão relata como feita.
  - **H03, P05/CARRIER_CLINICAL no F12:** a variante troca a revisão da semana 4 e repete fatos relativos ao plano.
- **Integridade de dados e consistência de decisão:** PASS nos casos válidos.
- **Idempotência:** RESEND 25/25 e DUPLICATE_SECOND_SOURCE 25/25 sem violação; as duplicatas e reenvios de F18, F19 e F31 também.
- **Correções de registro:** P10 com 3481 unidades e sem violação.
- **Perguntas sem saída:** nenhuma pergunta que a interface não permita deixar.
  - As perguntas de motivo de F15 e F30 têm saída, mas a timeline as deixou sem resposta (QRE-P4-O01).
  - O único estado sem saída real é a fronteira divulgada do F08, no F23 (QRE-P4-R02).
- **Mudanças silenciosas:** P10 limpo. No P03 há uma mudança confirmada, o F01.
- **Regressões:** nenhuma em relação ao estado da Fase 3.5.

## CRITICAL_FAILURES

1. **SSCTR-P4-F01:** força pós-retorno acima dos limites da D49 para exercícios planejados e nunca executados antes da pausa. Correção mínima de runtime: a entrada e o passo 2 da D49 valem também para eles, sem bloco creditado nunca executado. Nenhum número novo; a D49 e o `strengthEntryWeek` já definem os limites.
2. **QRE-P4-F01:** a pergunta UNREPORTED_TRAINING não sai depois de mais de um mês sem relatos quando a semana seguinte é uma CONSOLIDATION de dose baixa. Pela P03(d), a revisão deveria perguntar, e não sair VALID reduzindo a dose. Correção mínima de runtime: o gatilho da pergunta não pode depender da fase ou da dose da semana planejada. Nenhum número novo. A causa no código ainda não foi localizada.
3. **Cobertura (QRE-P4-I01 e o veredito do SSCTR).** Faltam, sem ambiguidade:
   - CARRIER_HOLD > 0 (0 unidades) e a resposta direta ao UNREPORTED_TRAINING (1 de 2), do PREREG-2 Δ9;
   - pausa sob rota clínica com liberação (1 de 2, porque o F22 virou CORPUS_ERROR), do PREREG-3 Δ6;
   - semana inteira executada em todos os esportes entre pausas (0), do PREREG-5 Δ3;
   - semana de reentrada com sessões opcionais não feitas (0), do PREREG-6 Δ5;
   - semana de prova só com toque, shakeout e prova (0), do PREREG-6 Δ18;
   - semana de prova sem corrida com gate, com força e shakeout adversos (0), do PREREG-6 Δ29.

   Cada cláusula manda INVALID_HOLDOUT. A causa, segundo o juiz de qualidade, é mista:
   - **Corpus e interface, na maior parte:**
     - o CORPUS_ERROR do F22;
     - a última semana do F11 já não tinha dose de corrida a planejar, e por isso não houve pergunta nem CARRIER_HOLD;
     - `asPrescribed` não manda carga para uma linha FROM_LOG sem valor conhecido (F29);
     - a semana de prova e as sessões opcionais são compostas pelo coach (lacuna 3 do autor).
   - **O próprio QRE-P4-F01, num item:** no F13 o coach não pergunta, e por isso a resposta direta ao UNREPORTED_TRAINING fica em 1 de 2.
   - **Itens que dependem da leitura** (retorno no meio da semana; relato tardio da força respondido por canais diferentes): no F31 o coach não pergunta nada entre s3 e s6.

Os dois bloqueios já existiam antes das Fases 3.4 e 3.5. Nenhum é de segurança.

## RESIDUAL_LIMITATIONS

- **Autoridade:** julgamento interno provisório de software, sem validação humana, clínica ou empírica.
- **Evidência ausente no H1:**
  - reentrada em todos os esportes;
  - regras de reentrada em semana de prova;
  - CARRIER_HOLD;
  - aprendizado com consentimento;
  - progressão de carga com halteres;
  - a pergunta de hora de início (QRE2-P34-01).
- **F30:** o mecanismo pretendido nunca rodou, porque o retorno ficou na pergunta de motivo.
- **H2:** cobre só o cadastro inicial.
- **Corpus com erro:** o harness não roda relação num caso com CORPUS_ERROR.
- **Taxa de CORPUS_ERROR:** 11,4 %, acima do teto de 10 % que o PHASE1 só propõe.
- **Condições de consumo** que continuam valendo:
  - C2;
  - C3 com R5;
  - confirmação de mesmo turno do P12;
  - redação G03 da pergunta de motivo (F15, F30) e do HOLD do R4 (F04).
- **Harness, K03:** as três correções de HARNESS_GAP. O §3 do PREREG-1 pede a correção, mas o §9 proíbe mudar o harness em resposta a uma saída do holdout final. Cabe ao Founder decidir se seguem para um próximo holdout, numa versão registrada antes dele.
- **Testes, K04:** o CQ4-1 continua; T39–T41 entram na suíte do `CoachingCore` no próximo candidato autorizado.
- **Fila:** 235 itens, sem acréscimo. HQ-R7D-SSCTR-P4-HOLDOUT-JUDGMENT fica só proposto.

## R7D_FINAL_STATUS

**R7D_FINAL_STATUS = NOT_READY. A validade do holdout é INVALID_HOLDOUT, por cobertura.**

O estado foi compilado mecanicamente dos dois registros:
- **Critério 1 do §4 do PREREG-1** (violações confirmadas de propriedade = 0): falha, pelo QRE-P4-F01 (P03).
- **Critério 3** (GENERALIZATION_BLOCKER = 0): falha, pelos dois bloqueios.
- **Critério 4** (SUBOPTIMAL do runtime em caso válido): falha, pelo F13.
- **Critério 5:** a perda de cobertura crítica dá INVALID_HOLDOUT.
- **Critério 2** (relações e determinismo): passa.
- **§9:** um bloqueio no holdout final dá NOT_READY. O veredito dos dois juízes é INVALID_HOLDOUT, e cada um registrou um bloqueio confirmado que já exclui READY.

Por isso o estado é NOT_READY, e a invalidade fica registrada como segundo motivo, independente. Ela também decide como deve ser um próximo holdout: novo, independente e com cobertura alcançável.

**Os quatro estados, separados:**

| Estado | Situação |
|---|---|
| 1. R7-D concluído | **Não.** A Fase 4 terminou e o estado final está registrado, mas o critério de encerramento (nenhum bloqueio aberto no escopo do R7-D) não é atendido. A menor decisão volta ao Founder |
| 2. Runtime validado no escopo do R7-D | **Não.** Há dois bloqueios estruturais e o holdout é inválido por cobertura |
| 3. Capacidades adicionais da V1 pendentes | **Sim**, ver V1_REMAINING_CAPABILITIES |
| 4. App pronto para usuários reais | **Não** |

**R7D-FREEZE-5 continua sendo o último estado congelado e a base de referência da correção.** Ficou demonstrado nele:
- nenhum bloqueio de segurança ou científico;
- 30 dos 31 casos avaliáveis com BEST_SUPPORTED ou ACCEPTABLE_ALTERNATIVE;
- P17 e P18 limpos;
- relações de idempotência e determinismo limpas;
- 300 cadastros sem violação.

## V1_COACHING_AUTHORITY_READY

**NO.** Este gate não muda essa autoridade (PREREG-1 §4).

## F08_STATUS

**F08_OPEN** (BLOCKED_BY_AUTHORITY, F08-BLOCK-G04). A direção D2 do Founder, inspirada no Runna, está registrada e **não implementada**:
- redução de 3 a 14 dias;
- retorno gradual;
- orientação profissional nos casos sérios;
- sem atestado universal;
- histórico preservado;
- sem diagnóstico nem falsa liberação.

A missão curta do F08 está preparada em `phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md`. Nenhum passo do holdout dependeu dele.

## V1_REMAINING_CAPABILITIES

Além do R7-D:
- **Correção dos dois bloqueios.** Exige freeze novo e holdout novo e independente (PREREG-1 §9).
- **F08**, na missão própria.
- **Três perfis de treinador e controles independentes de volume e dificuldade.** São capacidades da V1 nomeadas pelo Founder. O comportamento deles não está especificado nas fontes desta branch (marcado "a recuperar", Fase 3.5 D1.4) e não foi exercido por este gate.
- **Apresentação completa do plano e a auditoria Figma × Motor**, em missão separada. O Figma da V1 não está aprovado, e esta fase não o tocou.
- **Verificação do enquadramento comercial** (D1.5), dependência administrativa do Founder.
- **CQ4-1 na suíte** e a decisão do K03 sobre o harness.

## EXACT_NEXT

**Decisão mínima do Founder.** Nada foi aberto automaticamente.

- **(A) Recomendado:** um único ciclo de correção, delimitado, com:
  - as duas correções de runtime acima, com testes dirigidos (T39–T41 entram na suíte) e nenhum número novo;
  - um freeze novo;
  - um holdout novo e independente. O brief e a interface tornam alcançáveis os itens que faltaram:
    - a composição da semana de prova e das sessões opcionais;
    - a carga em `asPrescribed`;
    - uma última semana com dose a planejar, para o CARRIER_HOLD;
    - as referências depois de adotar uma proposta;
    - o `startedAt`;
  - o K03 decidido antes de esse holdout existir.

  Se esse ciclo falhar, o R7-D fecha NOT_READY com bloqueios explícitos, sem nova rodada.
- **(B)** Fechar o R7-D agora como NOT_READY e levar os dois bloqueios para a próxima missão de coaching.

O F08, a apresentação do plano e a auditoria Figma × Motor continuam em missões próprias, em qualquer das duas opções.

## GIT_STATE

**Branch e estado:**
- branch `claude/domain-coaching-r7-d`;
- sem push e sem merge;
- nada apagado; worktrees, freezes e registros históricos intactos.

**Commits da fase:**
- `58d6766`: instrumentos, antes de o autor começar;
- `14c7ec8`: selo, antes de qualquer execução;
- `87d0978`: avaliação única de H1 e H2;
- `05908f3`: pedido de julgamento;
- `1b3c93c`: os dois julgamentos;
- o commit deste checkpoint, com o acréscimo em CURRENT_MISSION e MISSION_LEDGER, só de inserção.

**Arquivos principais:**

| Arquivo | sha256 |
|---|---|
| `PREREGISTRATION_R7D_7.md` | `2ccceb18…` |
| `harness/r7d-harness-8.mjs` | `2b5f26d1…` |
| `harness/lib/properties-8.mjs` | `2e5cf021…` |
| `harness/seal-final.mjs` | `4913bda7…` |
| `HARNESS_VALIDATION_R7D_8.json` | `a064c5e4…` |
| `CQ41_MUTATION_PHASE4.json` | `783d2b1e…` |
| `final/FRESHNESS_MANIFEST.json`, depois da avaliação | `d2588e13…` |
| `final/generated/FRESHNESS_MANIFEST.json`, depois da avaliação | `86a4e781…` |
