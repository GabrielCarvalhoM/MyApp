# R7-D — pré-registro do gate final, versão 3 (`R7D-PREREG-3`)

**Status:** registrado na Fase 3.1 (2026-11-02), antes de existir qualquer holdout final, autor final ou seed final.
- Substitui o `R7D-PREREG-2` (`PREREGISTRATION_R7D_2.md`) para o gate da Fase 4. O PREREG-1 e o PREREG-2 não são editados.
- **Tudo o que o PREREG-2 (e, por ele, o PREREG-1) diz e este arquivo não altera continua valendo**, palavra por palavra: critérios de sucesso (§4), protocolo selado (§8), regra de não-tuning (§9), Δ1–Δ12.

**Fontes do delta:**
- decisões do Founder na Fase 3.1: D1 (corrigir QE-R7D-P3-01), D2 (a pausa declarada é fato independente do evento que a trouxe; reter o fato não é aplicar a decisão), D3 (clínico primeiro, inalterado);
- a correção no runtime candidato e seus testes dirigidos (`CoachingCore/test/r7d-phase31.test.mjs`);
- `harness/validation/HARNESS_VALIDATION_R7D_3.json` (validação 3).

## Instrumentos vinculados

| Instrumento | Versão | Onde |
|---|---|---|
| Runtime avaliado | `R7D-FREEZE-2`, o freeze da Fase 3.1. O R7D-FREEZE-1 fica superado, não editado | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json` |
| Harness | `R7D-HARNESS-3` (padrão: o registro do R7D-FREEZE-2) | `harness/`; validação em `harness/validation/HARNESS_VALIDATION_R7D_3.json` |
| Interface do autor | `R7D-INTERFACE-3` = `R7D-INTERFACE-1` + `author/INTERFACE_DELTA_R7D_2.md` + `author/INTERFACE_DELTA_R7D_3.md` (o delta mais novo prevalece) | `author/` |
| Esquema e checador | `R7D-CASE-1`, `check-corpus.mjs`, sem mudança | `author/` |
| Gerador | `R7D-GENERATOR-1`, sem mudança. Seed do H2: `sha256('R7D-SAMPLE\|FINAL\|' + manifestDigest do R7D-FREEZE-2)` | `harness/generate-sample.mjs` |
| Brief final | `R7D-AUTHOR-BRIEF-FINAL-2` (`author/AUTHOR_BRIEF_FINAL_R7D_2.md`); o `-1` fica como registro da Fase 3 | `author/` |

## Delta PREREG-2 → PREREG-3

**Nenhum critério de sucesso é afrouxado.** P17 não tem envelope: uma violação é bloqueio.

| Δ | Mudança | Origem | Efeito |
|---|---|---|---|
| Δ1 | **P17 — persistência do fato de pausa (nova propriedade; BLOCKER, sem envelope; SAFETY_BLOCKER quando um plano sai VALID com a pausa não aplicada).** Uma pausa declarada sobrevive a ASK, HOLD e CLINICAL_HUMAN_REQUIRED até ser substituída, corrigida ou resolvida pela semântica factual autorizada (um retorno que a aplica, ou uma declaração mais nova).<br>**(a)** Da decisão que declara a pausa sem aplicá-la até a decisão que registra um retorno (ou até uma revisão que declare outra pausa), nenhuma decisão é VALID, exceto a que aplica o retorno.<br>**(b) RESTATE_DECLARED_BREAK** (metamórfica): o mesmo caso com a pausa declarada de novo em toda revisão posterior que não declara nenhuma, até um retorno ser registrado. Toda decisão posterior tem de ser idêntica (validade, pergunta, estado pendente, plano inteiro e fases). Mede que o atleta nunca precisa repetir a pausa.<br>**(c) Separação de eventos.** Dentro dessa janela, uma decisão de outro tipo de evento (nem revisão semanal nem relato de retorno) que não seja rota clínica nunca aplica a própria mudança: só replanejamento factual (REPLAN_FROM_EVIDENCE). A decisão que aplica o retorno acrescenta só o retorno e o replanejamento factual | QE-R7D-P3-01 (a), (b); P3-F01; Founder D1–D3 | Mais estrito (novo). Cobre (a) e (b), antes sem propriedade automática |
| Δ2 | **"Pausa declarada" para o P17** (regra pública da INTERFACE-3): um objeto `interruption` com pelo menos um campo com valor, cujo início declarado (`startDate`, ou o instante `startedAt`) não é posterior à revisão. Um modelo só com campos vazios, ou uma pausa que começa depois, continua sendo só a pergunta da própria revisão (DX-02, inalterado) | Fase 3.1 | Definição |
| Δ3 | **P05, P3-F01 deixa de ser achado.** O CARRIER_CLINICAL continua estrito e sem envelope. A resposta-pausa enviada por uma rota clínica, depois liberada, tem de dar na primeira decisão elegível o mesmo plano que a resposta direta. A validação 3 mostra 0 violação no candidato | P3-F01 corrigido | Inalterado no oráculo; o registro de "achado conhecido" do PREREG-2 sai |
| Δ4 | **P03 e P10 com a linha de pausa declarada.** O registro pode ter linhas `INTERRUPTION_DECLARED`.<br>• P03: cada uma corresponde a uma revisão que enviou exatamente aquela `interruption`, com o mesmo id de evento; senão, RECORD_ROW_WITHOUT_REPORT.<br>• P10: nunca some e seus fatos (interrupção, relógio, hash, atleta) nunca mudam (RECORD_ROW_DROPPED, RECORD_ROW_REWRITTEN) | Fase 3.1 | Mais estrito |
| Δ5 | **P11 e P12, mudança perguntada ou recusada.** Uma mudança de agenda (SCHEDULE_CHANGE, DOUBLE_CONFLICT) ou de equipamento (EQUIPMENT_CHANGE) cuja própria decisão perguntou ou recusou (ASK, HOLD, UNSUPPORTED, rota clínica) não está em vigor: os dias e o equipamento continuam os de antes | Validação 3 (falso FAIL no DEV-18: a mudança que trouxe a pausa é perguntada) | Precisão: remove um falso FAIL, como o Δ3 do PREREG-2 fez para a data da prova. O P17(c) é a contraparte estrita: a mudança perguntada nunca pode ser aplicada |
| Δ6 | **Cobertura crítica (§7, acréscimo).** Além do Δ9 do PREREG-2, o H1 avaliado precisa de pelo menos 2 casos base independentes com cada um destes:<br>• pausa declarada junto com outro tipo de evento, e a revisão seguinte sem repeti-la;<br>• pausa declarada com uma flag clínica (ou uma substituição com dor), liberação qualificada, e a revisão seguinte sem repeti-la.<br>Precisa também de pelo menos 1 caso com pausa de razão clínica, depois liberação.<br>Unidades obrigatórias: P17 ≥ 4 e RESTATE_DECLARED_BREAK > 0.<br>Faltando qualquer um: INVALID_HOLDOUT, substituído por corpus novo e independente | Founder (o holdout precisa medir o invariante) | Mais estrito: o gate não passa por omissão |
| Δ7 | **Sensibilidade.** O HARNESS-3 detecta, no R7D-FREEZE-1, QE-R7D-P3-01(a) e (b) (P17 e RESTATE) e o P3-F01 (CARRIER_CLINICAL), todos limpos no candidato. Os sete defeitos anteriores continuam detectados nos seus runtimes. 37/37 testemunhas disparam | Validação 3 | Registro |
| Δ8 | **Condições de consumidor.** Saem as condições G03 da Fase 3 sobre repetir a pausa (declarar uma vez; quando perguntada, enviá-la sozinha; declará-la de novo depois de uma liberação): o runtime guarda a pausa declarada. Continuam: carregar o registro exatamente como devolvido (C3; agora ele também guarda as pausas declaradas); nunca enviar `interruption` de modelo; enviar o consentimento atual em toda decisão | Founder D1 ("não depender de uma condição de consumidor que peça ao atleta para repetir a pausa") | Precisão; uma condição a menos |
| Δ9 | **Fronteira F08 na rubrica.** Uma pausa cuja razão é clínica é guardada e, depois da liberação qualificada, vai de novo para um humano em toda decisão, como a mesma pausa declarada de novo vai (F08 continua em aberto; nenhuma receita de retorno não clínica para causa clínica). Uma expectativa do autor de retorno planejado depois de pausa clínica é EXPECTATION_OUTSIDE_AUTHORITY (Δ10(d) do PREREG-2), não falha do runtime | SSCTR D10-cl6; Founder D3 | Precisão |

## Resíduos divulgados, sem envelope

Nenhum vira envelope. Um caso do holdout que os mostre é julgado como qualquer outro, e uma violação de propriedade é bloqueio.
- **Uma declaração mais nova substitui a mais antiga ainda não aplicada**, mesmo com datas diferentes. A pausa antiga deixa de ser lida como pausa declarada; seus dias valem como silêncio, e as regras de treino não relatado (UNREPORTED_TRAINING, teto D18) seguem valendo para eles.
- **Uma pergunta sobre os fatos de uma pausa guardada** (horário de início, razão, dias) é respondida com a pausa inteira corrigida: campos soltos não se juntam à declaração guardada.
- **A demonstração atual** (`currentDemonstration`) não é guardada com a pausa: vale a da revisão que aplica o retorno, ou a dose de entrada revisada.
- **F08:** depois da liberação de uma pausa de causa clínica, o atleta fica em CLINICAL_HUMAN_REQUIRED até uma declaração nova ou uma decisão de política. Seguro, sem plano.

## O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, que depende do digest do R7D-FREEZE-2.
- Qualquer decisão sobre `V1_COACHING_AUTHORITY_READY`.
