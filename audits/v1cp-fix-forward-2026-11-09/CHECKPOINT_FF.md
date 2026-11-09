# V1CP Fix-Forward — encerramento (2026-11-09)

**Estado final: CLOSED_NOT_READY**, com bloqueadores nomeados.

O limite de ciclos foi usado por inteiro:
- uma rodada de revisão independente, no candidato `4630bca`;
- um ciclo estreito de correção, `0950b0a`;
- um recheck estreito, em `0950b0a`.

Nenhuma rodada nova foi aberta. Não houve freeze, push, merge nem alteração de Figma.

| Estado | Valor |
|---|---|
| Implementação | concluída no escopo da missão (`0950b0a`) |
| Validação técnica | **não aprovada** (SSCTR BLOCK, QRE NOT_READY) |
| Prontidão para integração | NÃO (`INTEGRATION_READY = NO`) |
| Autorização para atletas reais | NÃO |
| Publicação do app | NÃO |
| F08 | `F08_OPEN` |
| `V1_COACHING_AUTHORITY_READY` | NO |

**Linha de base confirmada no Git nesta sessão:**
- branch `claude/v1cp-fix-forward`, candidato `4630bca`, ciclo `0950b0a`;
- suíte 1143/1143, rodada de novo;
- sete jornadas F08 idênticas ao traço registrado;
- R7D-FREEZE-6 intacto (`40daadd`; o worktree `domain-coaching-r7-d` está limpo em `32b5ce3`);
- fila humana com 235 itens, byte a byte a do FREEZE-6;
- nada no remoto.

**O recheck.** O recheck interrompido pelo limite de uso não tinha deixado nenhum parecer, nem parcial. Foi refeito do zero por instâncias novas dos mesmos papéis, porque as originais não podiam ser retomadas. Todas trabalharam sobre extrações `git archive` de `0950b0a`, nunca sobre o worktree.

## 1. Parecer final do SSCTR — BLOCK

Registro: `reviews/ssctr/SSCTR_FF_RECHECK_CYCLE.json` (SSCTR-V1CPFF-RECHECK-CYCLE-r1).

- **SSCTR-FFR-01 (NB-4): FECHADO.** Numa semana não executada com verificação fora da revisão, o degrau repete em 32 de 32 casos; em `4630bca`, 28 avançavam pelo calendário. Uma semana executada e verificada continua avançando.
- **SSCTR-FFR-02 (NB-1): FECHADO no seu cenário.** 14 dias sem treino levam à receita MODERATE em todas as velocidades, e 20 dias também, contando a espera. A variante com sessão executada não muda.
- **SSCTR-FFR-06 (NB-3): FECHADO.** Não há mais laço de reconfirmação da pausa.
- **SEC-FFR-02 (encaminhado): SIM.** Um sinal respondido "sim" durante um hold define o nível de orientação (D5/FF-Q9). O hold nunca baixa, e a redação continua provisória (INTERIM_PENDING_G04).
- **Novo bloqueador SSCTR-FFC-01 (MAJOR).**
  - O defeito: numa janela REDUCE sem nenhuma sessão executada, encadeada com um relato REST, o retorno lê só os dias do REST.
  - Exemplo: REDUCE_SUBSTANTIAL de 12 dias seguido de REST de 3 dias, em FASTER, dá R3 e depois R4 (corrida longa de 55 min e 12 séries a RIR 3 na semana 4). Só o REDUCE daria a receita MODERATE (15/15/20).
  - Origem: introduzido pelo candidato `4630bca`.
- **Novo bloqueador SSCTR-FFC-02 (MAJOR).**
  - O defeito: uma pausa declarada depois de uma verificação respondida e de uma semana de retorno sem execução dá classe SHORT e as doses retidas completas (14 séries a RIR 3, longa de 50 min) após 17 dias sem treino. Os mesmos dias sem a verificação dão MODERATE.
  - Origem: é um defeito de leitura do NB-3 já presente em `5ee9dec`. Em `4630bca`, a revisão seguinte o mascarava em parte; o salto do QRE-FF-01 no ciclo removeu essa máscara.
- **Não bloqueantes:**
  - SSCTR-FFC-03: uma semana sem sessão de um esporte conta como feita após uma verificação fora da revisão, sem efeito de dose;
  - FFR-03..05, C-4..C-10 e O-1..O-3 mantidos;
  - O-4 e O-5 acrescentados.

## 2. Parecer final do QRE — NOT_READY

Registro: `reviews/quality/QRE_FF_RECHECK_CYCLE.json` (QRE-V1CPFF-RECHECK-CYCLE-r1).

- **QRE-FF-01: FECHADO**, em 12 variantes; s1AfterRestart caiu de 78 para 0.
- **QRE-FF-02 (a): FECHADO.** A prova aparece como evento do atleta no passo da receita.
- **QRE-FF-02 (b): FECHADO.** A semana D49 planeja 2 séries, não 6.
- **QRE-FF-03: FECHADO**, com noGuidance de 6 para 0. Nenhum teste dirigido o protege (QRE-FFC-02, não bloqueante).
- **QRE-V1CPR-05 e -06:** fechados.
- **Novo bloqueador QRE-FFC-01 (MAJOR).**
  - O defeito: o limite D49 se perde numa cadeia por esporte.
  - Exemplo: com linhas conhecidas 6x8, um MILD_ILLNESS REDUCE_SUBSTANTIAL de 10 dias põe a força em 1 série, executada. Depois vem um NEED_REST REST de 2 dias em FASTER, com a resposta "melhorou". A semana 3 planeja 4 séries depois de uma semana a 1, quando o D49 permite no máximo 2.
  - Causa: `ladderCap` lê só os degraus do episódio posterior.
  - Origem: introduzido pelo candidato. O round 1 o atribuiu a outra causa (seed 544).
- **Não bloqueantes:** QRE-FF-04 e -05 (inalterados) e QRE-FFC-02.

## 3. Parecer final de Security — PASS_WITH_CONDITIONS

Registro: `reviews/security/SEC_FF_RECHECK_CYCLE.json`.

- **SEC-FFR-01 (C1): FECHADO.**
  - Foram testados 9 formatos em 2 tipos de revisão, de uma chave de 2.000 caracteres a `__proto__`.
  - Cada um gera um único `wellbeingCheck.improved.unrecognized`. O texto nunca aparece na decisão, no estado de referência, nos `missingInputs` nem no registro.
  - Em `4630bca`, 12 de 18 execuções ecoavam a chave.
- **SEC-FFR-02 (C3): FECHADO para nível e redação.** Durante um hold W7, com o estado de referência enviado, W2, W3, W4, W5 e X1 dão URGENT_CARE_ADVISED, igual ao caso sem referência, e nada é planejado.
- **Sem regressões no seu escopo:** nenhum eco novo, nenhum campo novo coletado, linhas append-only e seladas, SB-2..SB-5 intactos.
- **Nova condição C8:** o sinal respondido durante um hold não é registrado; só aparece na decisão.
- **OBS-FFC-01 e OBS-FFC-02:** pré-existentes e não bloqueantes.
- Nada bloqueia o encerramento do candidato shadow. Tudo o que resta vincula integração, coleta real ou exposição.

## 4. Condições residuais e CF-OBS-1

### CF-OBS-1: decisão técnica consolidada

PCG (`pcg/PCG_V1CPFF_CFOBS1.json`), Security e QRE responderam às mesmas sete perguntas de forma independente e concordam. O SSCTR mantém o seu C-3.

Fato novo do QRE: **uma única revisão sem o estado de referência "lava" o hold para sempre**. Isso acontece mesmo que as revisões seguintes enviem a referência exatamente como recebida.

| Pergunta | Decisão |
|---|---|
| Fonte de verdade | A linha `CLINICAL_HOLD` do registro do atleta (append-only, sob custódia). O estado de referência é cache: pode acrescentar proteção, nunca removê-la. Em divergência, prevalece o registro (DR-148 (4) e (7); AEC §7 "sem liberação por silêncio"). |
| Como o motor identifica um hold vigente | Uma única regra em todas as entradas: há uma linha de hold legível sem uma `READINESS_DECLARED` válida posterior para aquele esporte. Linha ilegível conta como HOLD. |
| Referência ausente, inválida ou antiga | O resultado nunca é menos protetor que com a referência íntegra. Referência inválida dá HOLD. Referência ausente ou antiga com hold vigente: todo tipo de revisão, exceto a declaração de prontidão, volta à rota clínica sem prescrição. Os fatos continuam registrados. Pausas e relatos são registrados, mas nunca liberam. Os sinais ainda definem o nível D5. |
| Retomada legítima | Só a declaração de prontidão do atleta, lida do registro, libera o hold, por esporte e com recomeço conservador. Omitir a referência nunca é liberação nem clearance. A "liberação qualificada" do R7 era uma convenção de avaliação (PCG-F08-C07), não um caminho de produto. A forma registrada é a declaração de prontidão, não um formulário de liberação; isso corrige a redação de `FIX_CYCLE_FF.md`. Security só admite um fato de liberação futuro se uma autoridade competente o definir explicitamente. |
| Contrato da integração | Duas camadas. O core lê o hold do registro em toda revisão. O servidor (RECORD-CUSTODY) guarda programa, registro e referência; aceita só registros que estendem o prefixo; recusa estado ausente ou antigo; vincula atleta e relógio; e não entrega prescrição durante um hold. Uma referência obrigatória sozinha não basta: o digest não tem chave, e um cliente pode reselar uma referência limpa (Security, p11). |
| Testes | Uma matriz negativa de tipo de revisão × variante de referência × variante de registro. Uma propriedade metamórfica e de fuzz em 0: a ausência nunca é mais permissiva que a presença. Paridade de liberação com e sem referência. Os 28 testes de liberação qualificada (R7-B.2, R7-C, R7-D) são migrados para a declaração de prontidão, cada um com um gêmeo negativo, e nunca apagados. |
| Classificação | O candidato shadow pode ser encerrado separadamente. CF-OBS-1 fica como **bloqueador de integração nomeado e bloqueante**: bloqueia a prontidão para integração, o uso real, a publicação, a saída do F08_OPEN e a autoridade V1. |

Nenhuma decisão do Founder é necessária para CF-OBS-1, porque DR-148 (1), (3) e (4) já decidem. Consequência visível: um atleta liberado por um profissional fora do app retoma pela declaração de prontidão no app. Nenhuma correção foi implementada nesta missão.

### Resultados residuais de fuzz (classificação do QRE)

- **`d49Executed` (7 passos):**
  - 4 são projeção antiga após um ASK ou uma rota clínica. É um limite do verificador mais um risco de integração: o cliente nunca pode executar uma projeção que não é válida.
  - 1 é a leitura OBS-QRE-FF-4, já presente em `5ee9dec`; a leitura cabe ao SSCTR.
  - 2 (seed 544) são o defeito real QRE-FFC-01.
- **`programNotJsonStable` (1172):** defeito real desde o FREEZE-6. `canonical()` inclui no hash chaves com valor `undefined`, por dois caminhos. Bloqueia integração e uso real, mas não o encerramento shadow.
- **`jsonRoundTripProgram` (415):** efeito da mesma causa; falha fechada (HOLD). Tem a mesma classificação (QRE-FF-06).

### Outras condições abertas

Nenhuma delas bloqueia o encerramento. Todas vinculam integração, coleta real ou exposição:
- Security C2 (que é CF-OBS-1);
- Security C4 (inventário de dados; agora inclui `decision.warningSigns`), C5, C6, C7 (inclui OBS-FFC-01) e C8;
- SEC-V1CPI-06 (tombstone de apagamento) e as pendências SEC-V1CP;
- SSCTR C-4..C-10, entre elas C-8 (o Exigente nunca é apresentado como treinador distinto) e C-9 (o texto urgente fica provisório até G03/G04).

## 5. Testes e evidências

- **Suíte completa:** 1143/1143 em `0950b0a`, rodada pelo Chief no worktree e por SSCTR, QRE e Security em extrações próprias; 1132/1132 em `4630bca`.
- **Testes do ciclo:** em `4630bca`, 8 falham e os 3 de cobertura passam; em `0950b0a`, os 11 passam.
- **Diferenciais e jornadas:** os diferenciais contra FREEZE-6 e `5ee9dec` e as jornadas A–G são idênticos byte a byte aos registrados. O caminho padrão não mudou: H2 300/300 e gerações 39/39.
- **Mutação:** 10 mutantes mortos. Os sobreviventes passaram por um diferencial de 600 seeds:
  - MC-QRE02a está coberto em outro ponto;
  - MF-D3-strength é equivalente na prática;
  - a fronteira `>=` é equivalente;
  - o mutante do QRE-FF-03 não é equivalente, e só o fuzz o pega (QRE-FFC-02).
- **Fuzz, seeds 0–600:** as contagens são iguais às registradas nos dois commits. Em `0950b0a`: s1AfterRestart 0, raceAtEffortInScope 0, noGuidance 0, d49Executed 7, programNotJsonStable 1172, jsonRoundTripProgram 415.
- **Reprodução independente do Chief:** os três bloqueadores reproduzem em `0950b0a`, `4630bca` e `5ee9dec` (`evidence/CHIEF_REPRO_RECHECK_BLOCKERS.txt`).

## 6. Freeze e hashes

**Nenhum freeze.** O contrato só o permite com revisão favorável, e duas das três não foram.

Último runtime revisado: `0950b0ae481baa19f3310a81cd217e8c15ef35bf` (árvore `8fbf382aac416556a02a74284310a6513a035e43`).

Registros desta etapa (commit `69faf7695d1967f8648045d5ccd7d915a398a88b`), com SHA-256:
- `reviews/ssctr/SSCTR_FF_RECHECK_CYCLE.json`: `43a58ab908622384c378195a2c2709fa38dd4538f799a1b6dd55aadf4f98bcef`
- `reviews/quality/QRE_FF_RECHECK_CYCLE.json`: `78a5c60d49304974e15f94235c342bcde87fd5a80af35ab1ee14f4ac62c8eac0`
- `reviews/security/SEC_FF_RECHECK_CYCLE.json`: `3b361bb7a9c3da6fb986d4bdb5ed6330019ae96a4b2311b4f80959e3c271c7e8`
- `pcg/PCG_V1CPFF_CFOBS1.json`: `0c427cdf3b1010193a0269bfc2b725fe7edb96636eef572c0470762a9b63bda6`
- `evidence/CHIEF_REPRO_RECHECK_BLOCKERS.txt`: `3263fb2af41a0e081933757859c6c2d8dcffad2038a0d077f209a110d917a6e7`

R7D-FREEZE-6 (`40daadd`) continua sendo o último freeze, intacto.

## 7. F08

`F08_OPEN`. O runtime F08 está implementado como referência shadow, mas não validado: há três bloqueadores nas cadeias da Situação 1.

- DR-148 e DR-149 seguem GOVERNANCE_READY_FOR_REVIEW.
- A redação dos sinais de alerta é provisória até G04.
- A fila humana continua com 235 itens; nada foi acrescentado.
- As 12 propostas do D7 têm disposição rastreável: 8 ligadas a bloqueadores e 4 melhorias futuras. Só entram na fila se o Founder decidir acrescentá-las.

## 8. Autoridade V1

`V1_COACHING_AUTHORITY_READY = NO`. Nenhum parecer tem autoridade para mudá-lo:
- o SSCTR tem PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY;
- o clínico permanece CLINICAL_HUMAN_REQUIRED;
- a revalidação humana financiada (DR-102) ainda não ocorreu.

## 9. Integração

`INTEGRATION_READY = NO`, e não pode ser declarado enquanto um caminho real puder ignorar um hold.

Bloqueadores:
- CF-OBS-1;
- QRE-FF-06 (ida e volta JSON);
- RECORD-CUSTODY e o esquema do servidor (C7);
- SEC-V1CPI-06;
- C4–C8;
- os três bloqueadores de runtime nos caminhos F08 encadeados.

A §11 do contrato de integração (`audits/v1-coaching-productization-2026-11-08/INTEGRATION_CONTRACT_V1CP.md`) registra o que o integrador precisa saber.

**O que já serve para construir o app com dados sintéticos** (como referência shadow, sem custódia real): geração do plano, revisão semanal, relatos de sessão e escolhas de treinador, volume e dificuldade. O Exigente prescreve como o Equilibrado, como limitação registrada. O caminho padrão não foi alterado pelo ciclo (FREEZE-6 e jornadas).

## 10. Próximo passo concreto para iniciar a implementação do app

A implementação segue proibida pela missão vigente. Ela começa quando o Founder registrar em `CURRENT_MISSION.md` uma missão de implementação V1. A recomendação abaixo evita abrir uma nova cadeia só de motor:

1. **No mesmo registro, o Founder decide duas coisas:**
   - (a) a fonte de design a implementar: promover o arquivo Figma Pierre (`90oyvX…`) ou manter TYR10AI (DR-94);
   - (b) o escopo do motor na primeira entrega: as superfícies da seção 9, com as entradas F08 desligadas no app até a unidade 1 fechar.
2. **A unidade 1 da missão é a fronteira de integração**, antes de qualquer tela que dependa dela.
   - **No motor.** Primeiro, testes vermelhos em `0950b0a`; depois, uma única revisão estreita (SSCTR, QRE, Security). O escopo:
     - SSCTR-FFC-01, SSCTR-FFC-02 e QRE-FFC-01 (as reproduções mínimas estão nos registros);
     - CF-OBS-1 no core: o hold lido do registro em todo tipo de revisão e os 28 testes migrados, com gêmeos negativos;
     - `canonical()` sem `undefined` (QRE-FF-06).
   - **No servidor**, antes de qualquer coleta real:
     - RECORD-CUSTODY conforme a §11: custódia do programa, do registro e da referência; ids opacos atribuídos pelo servidor; recusa de estado ausente ou antigo; nenhuma prescrição durante um hold;
     - o tombstone de apagamento (SEC-V1CPI-06).
3. **Em paralelo, o esqueleto do app iOS**, consumindo o motor só por essa fronteira e com dados sintéticos.

A ordem e o escopo são decisão do Founder; nada disso foi iniciado aqui.
