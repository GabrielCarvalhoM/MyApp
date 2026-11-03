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
| Δ1 | **P17 — persistência do fato de pausa (nova propriedade; BLOCKER, sem envelope; SAFETY_BLOCKER quando um plano sai VALID com a pausa não aplicada).** Uma pausa declarada sobrevive a ASK, HOLD e CLINICAL_HUMAN_REQUIRED até ser substituída, corrigida ou resolvida pela semântica factual autorizada (um retorno que a aplica, ou uma declaração mais nova).<br>**(a)** Da decisão que declara a pausa sem aplicá-la até a decisão que registra um retorno (ou até uma revisão que declare outra pausa), nenhuma decisão é VALID, exceto a que aplica o retorno.<br>**(b) RESTATE_DECLARED_BREAK** (metamórfica): o mesmo caso com a pausa declarada de novo em toda revisão posterior que não declara nenhuma, até um retorno ser registrado. Toda decisão posterior tem de ser idêntica (validade, pergunta, estado pendente, plano inteiro e fases). Mede que o atleta nunca precisa repetir a pausa.<br>**(c) Separação de eventos.** Dentro dessa janela, uma decisão de outro tipo de evento (nem revisão semanal nem relato de retorno) que não seja rota clínica nunca aplica a própria mudança: só replanejamento factual (REPLAN_FROM_EVIDENCE). A decisão que aplica o retorno acrescenta só o retorno e o replanejamento factual.<br>**(d) Aplicada uma vez** (acrescentado depois da checagem de engenharia, CF-2). Depois da decisão que aplica a pausa, nenhuma decisão posterior aplica um retorno de novo, a menos que uma revisão declare uma pausa outra vez.<br>**Exclusão:** uma revisão que o coach recusa como entrada inválida antes de lê-la (contrato, relógio, semana, forma das listas, estado carregado ou modelo inválidos: HOLD sem registro devolvido) não registra nada e não abre janela. O formato R7D-CASE-1 não produz essas revisões (QE-R7D-P31-02) | QE-R7D-P3-01 (a), (b); P3-F01; Founder D1–D3; R7D-ENGINEERING-PHASE31-CHECK-1 | Mais estrito (novo). Cobre (a) e (b), antes sem propriedade automática |
| Δ2 | **"Pausa declarada" para o P17** (regra pública da INTERFACE-3): um objeto `interruption` com pelo menos um campo com valor, cujo início declarado (`startDate`, ou o instante `startedAt`) não é posterior à revisão. Um modelo só com campos vazios, ou uma pausa que começa depois, continua sendo só a pergunta da própria revisão (DX-02, inalterado) | Fase 3.1 | Definição |
| Δ3 | **P05, P3-F01 deixa de ser achado.** O CARRIER_CLINICAL continua estrito e sem envelope. A resposta-pausa enviada por uma rota clínica, depois liberada, tem de dar na primeira decisão elegível o mesmo plano que a resposta direta. A validação 3 mostra 0 violação no candidato | P3-F01 corrigido | Inalterado no oráculo; o registro de "achado conhecido" do PREREG-2 sai |
| Δ4 | **P03 e P10 com a linha de pausa declarada.** O registro pode ter linhas `INTERRUPTION_DECLARED`.<br>• P03: cada uma corresponde a uma revisão que enviou exatamente aquela `interruption`, com o mesmo id de evento; senão, RECORD_ROW_WITHOUT_REPORT. E traz o atleta, o relógio (`declaredAt`) e o hash dos fatos dessa revisão; senão, DECLARED_ROW_FACTS_WRONG (QE-R7D-P31-06).<br>• P10: nunca some e seus fatos (interrupção, relógio, hash, atleta) nunca mudam (RECORD_ROW_DROPPED, RECORD_ROW_REWRITTEN) | Fase 3.1 | Mais estrito |
| Δ5 | **P11 e P12, mudança perguntada ou recusada.** Uma mudança de agenda (SCHEDULE_CHANGE, DOUBLE_CONFLICT) ou de equipamento (EQUIPMENT_CHANGE) cuja própria decisão perguntou ou recusou (ASK, HOLD, UNSUPPORTED, rota clínica) não está em vigor: os dias e o equipamento continuam os de antes | Validação 3 (falso FAIL no DEV-18: a mudança que trouxe a pausa é perguntada) | **Relaxamento delimitado** (QE-R7D-P31-04). Remove um falso FAIL, como o Δ3 do PREREG-2 fez para a data da prova. Mas uma mudança perguntada e nunca reenviada deixa de ser conferida pelo P11/P12 nos planos VALID seguintes. O P17(c) é a contraparte estrita: a mudança perguntada nunca pode ser aplicada. Condição de consumidor (Δ8): reenviar o evento depois do retorno. Nenhuma propriedade mede esse reenvio (TEST_GAP declarado) |
| Δ6 | **Cobertura crítica (§7, acréscimo).** Além do Δ9 do PREREG-2, o H1 avaliado precisa de pelo menos 2 casos base independentes com cada um destes:<br>• pausa declarada junto com outro tipo de evento, e a revisão seguinte sem repeti-la;<br>• pausa declarada com uma flag clínica (ou uma substituição com dor), liberação qualificada, e a revisão seguinte sem repeti-la.<br>Precisa também de pelo menos 1 caso com pausa de razão clínica, depois liberação.<br>Unidades obrigatórias: P17 ≥ 4 e RESTATE_DECLARED_BREAK > 0.<br>Faltando qualquer um: INVALID_HOLDOUT, substituído por corpus novo e independente | Founder (o holdout precisa medir o invariante) | Mais estrito: o gate não passa por omissão |
| Δ7 | **Sensibilidade.** O HARNESS-3 detecta, no R7D-FREEZE-1, QE-R7D-P3-01(a) e (b) (P17 e RESTATE) e o P3-F01 (CARRIER_CLINICAL), todos limpos no candidato. Os sete defeitos anteriores continuam detectados nos seus runtimes. 39/39 testemunhas disparam, inclusive as do P17(d) e da checagem de fatos do P03 | Validação 3 | Registro |
| Δ8 | **Condições de consumidor.** Saem as condições G03 da Fase 3 que pediam repetir a pausa (quando perguntada, enviá-la sozinha; declará-la de novo depois de uma liberação): o runtime guarda a pausa declarada. Ficam, revistas pelas duas checagens da Fase 3.1 (SSCTR CF-P31-04; engenharia CF-2):<br>• carregar o registro exatamente como devolvido; uma decisão que não devolve registro (`actualLedger` ausente) o deixa inalterado, e o cliente mantém o anterior (QE-R7D-P31-08, SSCTR-P31-F05);<br>• depois de uma pergunta `interruption.reportedOnItsOwn`, reenviar o evento perguntado (sinais de fadiga e desempenho inclusos) quando o retorno tiver aplicado a pausa (SSCTR-P31-F04, QE-R7D-P31-04);<br>• declarar uma pausa uma vez. Depois de aplicada, declará-la de novo só para corrigi-la, com `episodeId`; declarada de novo com outro id de evento, ela é aplicada outra vez e a reentrada recomeça (QE-R7D-P31-03);<br>• nunca enviar `interruption` de modelo;<br>• enviar o consentimento atual em toda decisão.<br>Nenhuma condição pede ao atleta para repetir uma pausa guardada. Opcional: deixar o atleta corrigir as datas de uma pausa guardada quando ela é aplicada (SSCTR-P31-F01) | Founder D1 ("não depender de uma condição de consumidor que peça ao atleta para repetir a pausa"); checagens da Fase 3.1 | Precisão |
| Δ9 | **Fronteira F08 na rubrica.** Uma pausa cuja razão é clínica é guardada e, depois da liberação qualificada, vai de novo para um humano em toda decisão, como a mesma pausa declarada de novo vai (F08 continua em aberto; nenhuma receita de retorno não clínica para causa clínica). Uma expectativa do autor de retorno planejado depois de pausa clínica é EXPECTATION_OUTSIDE_AUTHORITY (Δ10(d) do PREREG-2), não falha do runtime | SSCTR D10-cl6; Founder D3 | Precisão |

## Defeito aberto e resíduos divulgados, sem envelope

Nenhum item abaixo vira envelope ou resíduo permitido. Um caso do holdout que os mostre é julgado como qualquer outro, e uma violação de propriedade é bloqueio. Registrados pelas duas checagens da Fase 3.1 (`phase31/reviews/`): SSCTR-R7D-P31-RECHECK-r1 e R7D-ENGINEERING-PHASE31-CHECK-1.

**Defeito de domínio aberto: decisão do Founder antes da Fase 4.**
- **SSCTR-P31-F02. Uma pausa mais nova, de outro período, encerra a retenção de uma pausa guardada e não aplicada.**
  - Os dias sem treino que a pausa antiga declarou saem do estado factual, e a reentrada é classificada só pela parada mais nova. Isso **não** é seguro.
  - Exemplo (`phase31/reviews/ssctr/probes/p4-newer-replaces.mjs`): feriado de 14 dias guardado, depois uma viagem de 7 dias declarada. Sai SHORT (EASY 45/34, LONG 65, depois THRESHOLD 41), onde a parada de 21 dias declarada de uma vez dá MODERATE (EASY 15, LONG 20).
  - As regras de treino não relatado (UNREPORTED_TRAINING, teto D18) **não** protegem contra essa subclassificação.
  - Nenhuma propriedade automática detecta o caso: o P17 conta a declaração mais nova como resolução, e o P08 passa. Um caso do holdout com duas paradas declaradas e disjuntas antes de uma revisão elegível o exercita, e é julgado pelo domínio sem envelope.
  - Igual ao R7D-FREEZE-1 quando a pausa mais nova vem numa revisão semanal; melhor que ele nos outros caminhos.
  - Conflita com a D2 do Founder ("em todos os casos o fato sobrevive"). Se a correção é exigida antes da Fase 4, o Founder decide. Opções que a SSCTR deixou sem decidir:
    - perguntar se a pausa mais nova é correção ou outra parada, com a pergunta de episódio que já existe (I9);
    - ler como uma parada só as paradas declaradas contíguas, sem treino entre elas. Isso esbarra na I9, que nunca junta duas declarações sozinha.

**Resíduos divulgados:**
- **F08 (QE-R7D-P31-01, SSCTR-P31-F03).** Uma pausa de causa clínica é guardada e, depois da liberação qualificada, vai para um humano em toda decisão, mesmo com o atleta treinando e relatando normalmente.
  - É um estado sem saída verdadeira: nem relato de retorno, nem a mesma pausa marcada não clínica, nem RECOVERED o tiram dali.
  - Só uma declaração mais nova e diferente a substitui, e essa saída não é sempre conservadora: uma viagem não clínica posterior substitui a lesão e retoma SHORT com THRESHOLD. Remarcar as mesmas datas como não clínicas dá MODERATE, um incentivo de consumidor a reclassificar.
  - Falha fechada (nenhuma dose). A decisão é do Founder e do PCG com os donos de G04, mais a SSCTR, antes de qualquer uso de consumidor da regra ou de qualquer afirmação de autoridade V1.
- **SSCTR-P31-F01.** Os dias segurados depois da data final declarada de uma pausa guardada não contam como pausa nem são perguntados. Uma pausa SHORT segurada por uma rota clínica retoma as últimas doses completas depois de uma parada real possivelmente mais longa. Igual a um relato de retorno com as mesmas datas, nos dois runtimes. Vai junto com o F07.
- **SSCTR-P31-F04.** Um evento perguntado por causa de uma pausa guardada fica registrado, mas seu efeito (uma redução por fadiga) só vale se o cliente o reenviar depois do retorno (Δ8). Nenhum sinal o segura, ao contrário do SD-03 da R7-C.
- **QE-R7D-P31-03.** Uma pausa já aplicada e declarada de novo com outro id de evento é aplicada outra vez: a reentrada recomeça, como no R-DX02-2.
- **QE-R7D-P31-11.** Uma declaração mais nova parcial (só razão, só `episodeId`) substitui uma pausa guardada completa, inclusive a de causa clínica. As decisões seguintes perguntam pelo que falta, em falha fechada. Uma pergunta sobre os fatos de uma pausa guardada (horário de início, razão, dias) se responde com a pausa inteira corrigida, porque campos soltos não se juntam à declaração guardada.
- **QE-R7D-P31-12.**
  - Uma pausa guardada sem data final termina na véspera da revisão que a aplica, e as sessões relatadas entre a declaração e essa revisão caem dentro dela. É o mesmo que declará-la ali.
  - O `inputHash` da linha é checagem de consistência, não autenticação: uma linha forjada pelo consumidor, com hash recalculado, é lida.
- **QE-R7D-P31-10.** Uma reapresentação com o mesmo id de evento e outros fatos de pausa não é registrada nem recusada.
- **QE-R7D-P31-09.** O registro é append-only por fato, não por posição.
- **A demonstração atual** (`currentDemonstration`) não é guardada com a pausa. Vale a da revisão que aplica o retorno, ou a dose de entrada revisada; é mais conservador.
- **QE-R7D-P31-07.** O texto livre da razão da pausa, muitas vezes informação de saúde, passa a ficar no registro que o consumidor carrega. Vai para Security, dona da privacidade, junto com a nota de linha forjada, antes de qualquer consumidor com dados reais.

**TEST_GAP (QE-R7D-P31-05):** 9 de 17 mutantes da engenharia sobrevivem à suíte inteira. O primeiro da fila é QM31-07: um retorno antecipado que solta o registro carregado inteiro só é pego pelo P10 do harness. Dono: Engenharia; gatilho: a próxima fase de runtime autorizada.

## O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, que depende do digest do R7D-FREEZE-2.
- Qualquer decisão sobre `V1_COACHING_AUTHORITY_READY`.
