# V1 COACHING PRODUCTIZATION: checkpoint de encerramento

**Estado: V1CP = CLOSED_NOT_READY, com bloqueadores nomeados.**

| Item | Estado |
|---|---|
| V1_COACHING_AUTHORITY_READY | NO |
| F08 | F08_OPEN |
| R7D-FREEZE-6 | Intacto. A worktree `domain-coaching-r7-d` continua em `32b5ce3`. |
| Freeze ou candidato | Nenhum congelado. O último estado revisado é `5ee9dec`. |
| Push, merge, exclusão, Figma | Nenhum. O Figma não foi tocado. |

O ciclo limitado foi usado uma vez, com um único recheck. Os bloqueadores restantes ficam para a próxima missão; nenhum é corrigido em loop aqui.

**Rótulos usados:**
- IMPLEMENTED: o código existe.
- TESTED: há testes dirigidos que passam.
- DOMAIN_REVIEWED: um juiz independente revisou.
- INTEGRATION_READY: pode ir ao app como referência shadow.
- PENDING: depende de correção ou decisão.

## 1. Relatório de implementação dos blocos

**Bloco 1, estabilização**
- **A1, triagem de texto livre:** atribuição a terceiros e colocações não corporais restritas à lista aprovada pelo SSCTR, Q01 (c). A pergunta conduz à sua própria saída.
- **A2, regra explícita da última semana:** o TypeError do H05 deixou de ocorrer.
- **A3, parada por esporte:** a força volta MODERATE no H28; a corrida, SHORT.
- **E1:** os meses de treino viram uma categoria e nunca definem a capacidade.
- **E2:** um resultado de prova é só um teto.
- **E3:** o histórico inutilizável é divulgado, nunca descartado em silêncio.

**Bloco 2, F08** (DR-148, mapeamento SSCTR Q05–Q08)
- **Situação 1, "não estou 100%":**
  - triagem de 15 sinais de alerta mais 4 itens de resposta ao exercício;
  - janela de 3 a 14 dias no degrau da intenção (R0 a R3);
  - as sessões esperam pelo check do fim da janela;
  - retorno por degraus, uma semana executada por degrau, em três velocidades;
  - encadeamento, fim antecipado a partir do 3º dia, corrida.
- **Situação 2, prontidão após hold clínico:** reinício a partir de MODERATE, com o primeiro passo segurado uma semana a mais, restrições como teto rígido e checks semanais enquanto o retorno dura.
- **Situação 3, novo plano:** cold start com a pausa do registro por esporte, nunca acima da entrada de retorno, com o registro preservado.

**Blocos 3 e 4, perfis, volume e dificuldade**
- **Perfis:** P1, P2 e P4. O P5 foi rejeitado.
- **Volume:** V1, V2, V3 e V4'.
- **Dificuldade:** D1, D2 e D3.
- Um eixo por alavanca, e o envelope igual para todas as escolhas.
- PREFERENCE_CHANGE vale da semana seguinte em diante, sem crédito retroativo.

**Bloco 5:** a validação está no item 8; o contrato, no item 9.

## 2. Capacidades realmente funcionais

**Execução e decisões**

| Capacidade | Rótulos |
|---|---|
| A2, última semana | IMPLEMENTED, TESTED, DOMAIN_REVIEWED (QRE aceitou), INTEGRATION_READY |
| A3, parada por esporte | IMPLEMENTED, TESTED, DOMAIN_REVIEWED (SSCTR Q02 FAITHFUL), INTEGRATION_READY |
| E3, divulgação do histórico inutilizável | IMPLEMENTED, TESTED, INTEGRATION_READY |
| Perfis de treinador (P1, P2, P4) | IMPLEMENTED, TESTED, DOMAIN_REVIEWED (Q09 FAITHFUL), INTEGRATION_READY |
| Volume e dificuldade independentes | IMPLEMENTED, TESTED, DOMAIN_REVIEWED (Q10, Q11, Q12 FAITHFUL), INTEGRATION_READY |
| PREFERENCE_CHANGE | IMPLEMENTED, TESTED, INTEGRATION_READY |
| Caminho padrão (sem escolhas, sem F08) | Byte-idêntico ao FREEZE-6 nos 300 atletas gerados (H2). As diferenças no H1 estão explicadas no item 8. |

**F08**

| Capacidade | Rótulos |
|---|---|
| F08, Situação 1 | IMPLEMENTED, TESTED, DOMAIN_REVIEWED. Os casos comuns funcionam (item 6). PENDING pelos bloqueadores NB-1 a NB-6 do item 3. |
| F08, Situações 2 e 3 | IMPLEMENTED, TESTED. PENDING pelos bloqueadores de Security SB-1 a SB-5. |

## 3. Capacidades que dependem de correção ou decisão

**Bloqueadores nomeados para a próxima missão.** Todos são de runtime e estreitos, salvo onde indicado.

**SSCTR:**
- **NB-1, SSCTR-V1CPR-01 (BLOCKING):** o encadeamento C-1 permite que um relato mais leve encerre a doença para um esporte que ele não cobre. Implementar o C-1 como modificado pelo recheck:
  - por esporte, nunca menos conservador que qualquer um dos relatos;
  - o esporte não coberto mantém seu episódio, e o coberto fica com o degrau mais restritivo;
  - um relato mais leve oferece o check;
  - a doença mantém seu teto e seu check;
  - o limite de 14 dias vale até uma semana inteira de escada executada.
- **NB-2, SSCTR-V1CPR-02:** a corrida volta a ter três respostas no check (C-2 modificado): manter a data, e então o retorno termina antes da semana da prova; mover; ou pular.
- **NB-3, SSCTR-V1CPI-03 e QRE-V1CPR-01:** os dias de descanso antes de uma pausa declarada única.
- **NB-4, SSCTR-V1CPI-04:** a semana sem revisão, inclusive quando a revisão chega na segunda-feira; repetir o degrau perdido.
- **NB-5, SSCTR-V1CPI-07:** o resultado de prova nunca entra nos minutos semanais (Q04).
- **NB-6, SSCTR-V1CPR-03 e QRE-V1CPR-04:** D49 por séries executadas, não prescritas.

**Security:**
- **SB-1, SEC-V1CPI-02 residual (RC-11):** depois de treino posterior à declaração, uma nova parada sem causa declarada pergunta o motivo.
- **SB-2, SEC-V1CPR-03, regressão:** o check clínico vem antes do conflito de id.
- **SB-3, SEC-V1CPR-01 e QRE-V1CPR-03:** uma linha ilegível ou de outro atleta conta como hold, e o id e o relógio vêm do registro (fail closed).
- **SB-4, SEC-V1CPR-02:** toda decisão clínica registra o seu CLINICAL_HOLD.
- **SB-5, SEC-V1CPR-04:** o TypeError do restart padrão.

**QRE:**
- QRE-V1CPR-02, introduzido pelo ciclo: as linhas de check do S6 são descartadas e perguntadas de novo.
- QRE-V1CPR-05: a regra da corrida só é verificada na abertura e no fim da janela.
- QRE-V1CPR-06: os mutantes sobreviventes M12, M29, N11, N14, N18 e N19.
- Os MINOR, e as condições C1 a C10.

**Bloqueadores de desenho, fora do core:**
- SEC-V1CPI-06: o tombstone de exclusão, antes de qualquer caminho de exclusão ou coleta real.
- RECORD-CUSTODY: o servidor guarda o registro e a referência e fixa o id, o relógio e `assessedAt`.
- Os itens servidor/cliente de Security: SEC-V1CP-01, 06–13, 15–20 e 24–27.

**Decisões do Founder:**
- **FP-4:** o retorno FASTER após REDUCE_LIGHT pode voltar direto às doses seguradas?
- **C-Q09-2:** lançar o DEMANDING como perfil distinto, sendo só um conselho?
- **B6, SSCTR-V1CPR-02:** uma prova pode ficar dentro de um retorno? Se não, a pergunta da janela perde a opção "manter", e o SSCTR revê.
- **RC-16, com o PCG:** fim antecipado antes de 3 dias.
- **B4:** informativo, sobre o NB-1.
- **Texto de urgência provisório:** o G04 está indisponível.
- **Fila:** fica em 235. As 12 propostas do SSCTR não foram anexadas; anexá-las é decisão do Founder.
- **Pendentes de antes:**
  - o sentido do V4' (volume de corrida LOWER);
  - uma restrição dada por profissional encerrada pela declaração do atleta;
  - o modelo de serviço D1.5;
  - com Security/G07: `trainingMonths`, `tolerated` e a lacuna de condição crônica;
  - com o PCG: C-Q01-5 e MILD_INDISPOSITION como tipo doença.

## 4. Evidências de que os perfis influenciam o motor

Testes em `test/v1cp-levers.test.mjs` (11/11):
- **CONSERVATIVE:** um EARNED vira ADVANCE (P1).
- **CONSERVATIVE:** uma corrida concluída sem resposta relatada segura o passo (P2). No BALANCED não segura.
- **P4:** as ofertas de bloco trazem `recommendation`: KEEP_BUILDING no conservador, ACCEPT no exigente. Os vereditos são os mesmos.
- **DEMANDING:** usa as mesmas doses do BALANCED (o P5 foi rejeitado pelo SSCTR), mais o conselho e a divulgação.
- **Envelope:** o perfil nunca muda doses de volume ou dificuldade e nunca encurta retorno ou escada.

## 5. Evidências da independência entre volume e dificuldade

**Volume LOWER:**
- força só com os principais, nas séries-base, sem série no limite de bloco;
- corrida sem passo nas corridas fáceis;
- taper e semana de prova nos limites aprovados.
- O volume HIGHER é igual ao STANDARD e diz isso.

**Dificuldade:**
- LOWER segura um log de RIR 2 numa linha de RIR 3, sem regredir.
- HIGHER prescreve RIR 2 só em acessórios elegíveis de membros superiores, em semanas de desenvolvimento, para intermediários ou experientes.
- Os strides opcionais são ocultos no LOWER e mostrados no HIGHER, sem tornar a corrida parcial.

**Cruzamentos:**
- O perfil nunca altera uma escolha de volume ou dificuldade: as doses são iguais com qualquer perfil.
- A mudança de escolha nunca credita o passado nem dá dois passos numa semana.

Fonte: `v1cp-levers`. O SSCTR deu Q10–Q12 FAITHFUL.

## 6. Casos de F08 e retomada funcionando

No atleta sintético do Founder (`evidence/F08_SCENARIOS.json`, gerado por `evidence/f08-scenarios.mjs`):
- **A, gripe leve:** 5 dias de descanso, depois check, depois R2, R3, R4 e plano normal. As séries de força sobem uma por semana.
- **B, desconforto no joelho:** 4 dias mais leves, retorno FASTER. Quando uma corrida da semana de retorno falta, só o degrau da corrida repete.
- **C, sem melhora ao fim da janela:** hold clínico, depois declaração de prontidão, depois reinício MODERATE com checks semanais.
- **D, três semanas de viagem:** novo plano em RESTART, com força na entrada de retorno e o registro intacto.

Mais 37 testes dirigidos de F08: `v1cp-f08`, 15, e `v1cp-fixcycle`, 22. Os casos ainda abertos estão no item 3.

## 7. Auditoria de experiência e recordes

Atleta sintético do Founder: só os fatos declarados (`test/v1cp-experience.test.mjs`, seção 7 do contrato).

| Fato | Como o motor usa |
|---|---|
| Idade | Só elegibilidade. |
| Sexo, altura, peso | Guardados, nunca dose. |
| 10 meses de treino | INTERMEDIATE em ambos os esportes. |
| Minutos semanais | Desconhecidos permanecem desconhecidos. |
| 5K 30:36 e 10K 1:18:00 | Guardados como declarados; um resultado atual vira teto. |
| Agachamento 20 kg e supino 15 kg em "anilhas" | Divulgados e não usados: PLATES não é uma convenção que o motor lê, e o agachamento pede barra e rack não declarados. |

Lacuna: os turnos são só AM/PM, um por esporte. Tarde e noite viram o mesmo PM. Isso é SPECIFIED_BUT_PENDING com o Product.

## 8. Regressões e revisões independentes

**Suite:** 1080/1080 em `5ee9dec`.

**Diferencial contra o FREEZE-6:**
- H2: 300/300 idênticos, também no resultado completo.
- Gerações: 39/39 idênticas.
- H1: 13 de 130 passos diferem no resumo, todos decisões do Bloco 1 (A1, A2, A3).
- Outros 13 diferem só pelas novas linhas CLINICAL_HOLD; o recheck de qualidade confirmou.

**Juízes independentes:**

| Rodada | SSCTR | Quality | Security |
|---|---|---|---|
| 1, `fa3985b` | NOT_READY | NOT_READY | FAILED |
| Recheck, `5ee9dec` | NOT_READY | NOT_READY (os 2 BLOCKING originais fechados; fuzz de 1.000 seeds sem exceções) | FAILED |

- Um ciclo de correção: `FIX_CYCLE_V1CP.md`.
- Registros: `ssctr-impl/`, `quality/`, `security-impl/`, `ssctr-recheck/`, `quality-recheck/` e `security-recheck/`.

## 9. Contrato de entrada e saída para o aplicativo

Em `INTEGRATION_CONTRACT_V1CP.md`:
- entradas, saídas, enums, estados, erros recuperáveis, mudanças de estado, dados de explicação, campos persistidos e eventos de cada capacidade;
- a auditoria dos campos de onboarding;
- a classificação das saídas: IMPLEMENTED, DERIVABLE, SPECIFIED_BUT_PENDING ou NOT_SUPPORTED.

## 10. Pendências para a futura auditoria Figma × Motor

Seção 9 do contrato:
- cada item de F08 como controle não respondido, um a um;
- o estado "aguardando o seu check";
- o check do fim da janela, o fim antecipado, o relato que substitui outro e a corrida que espera;
- as velocidades com texto concreto, nunca como perfis;
- a declaração de prontidão completa, incluindo "nenhuma restrição" como resposta explícita, sem termo de liberação;
- as escolhas de treinador com as divulgações;
- turnos AM/PM;
- não mostrar o que é NOT_SUPPORTED: prontidão, Body Battery, estresse, previsão de prova e ritmo a partir de meta.

## 11. Commits, Git e candidato

- **Branch:** `claude/v1-coaching-productization`, na worktree `.claude/worktrees/v1-coaching-productization`, a partir de `32b5ce3`. Não enviado.
- **Commits:**
  - `4584a77`, `4c3f6dc`, `ecad12d`, `54b25bb`, `2d0cee5`;
  - `0b06a8e`, `134368c`, `1323746`, `793f7ae`;
  - `fa3985b`, o candidato revisado;
  - `5ee9dec`, o ciclo de correção;
  - o commit de encerramento, com estes registros e o append de missão e ledger.
- **Freeze:** nenhum. Não há candidato congelável enquanto houver bloqueadores.

## 12. Próxima missão estritamente necessária

**V1CP Fix-Forward**, de runtime, estreita, partindo de `5ee9dec` neste branch:
1. Implementar NB-1 a NB-6 e SB-1 a SB-5, mais QRE-V1CPR-02, -05 e -06, com testes vermelhos no `5ee9dec`.
2. Um único recheck por SSCTR, Quality e Security frescos.
3. Se aprovado, criar um candidato e um freeze.

Itens que não entram nela:
- Os MINOR que não forem triviais ficam como condições.
- O tombstone e a RECORD-CUSTODY são de desenho e precedem qualquer coleta real.

Antes dessa missão, convém decidir FP-4 e B6 sobre a corrida mantida dentro de um retorno. B6 muda o NB-2.
