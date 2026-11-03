# R7-D — pré-registro do gate final, versão 4 (`R7D-PREREG-4`)

**Status:** registrado na Fase 3.2 (2026-11-02), antes de existir qualquer holdout final, autor final ou seed final.
- Substitui o `R7D-PREREG-3` (`PREREGISTRATION_R7D_3.md`) para o gate da Fase 4. PREREG-1, PREREG-2 e PREREG-3 não são editados.
- **Tudo o que o PREREG-3 (e, por ele, os anteriores) diz e este arquivo não altera continua valendo**, palavra por palavra: critérios de sucesso, protocolo selado, regra de não-tuning, Δ1–Δ9 do PREREG-3 (P17 inclusive).

**Fontes do delta:**
- decisão do Founder na Fase 3.2 sobre o SSCTR-P31-F02:
  - uma declaração de pausa mais nova só substitui uma pausa guardada e não aplicada quando se identifica explicitamente como sua correção (`episodeId`);
  - sem isso, nenhuma substituição, nenhuma junção e nenhum last-write-wins: a relação é perguntada;
  - pausas separadas continuam fatos separados;
- disposição do Founder sobre o F08: `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`;
- o runtime candidato e seus testes dirigidos (`CoachingCore/test/r7d-phase32.test.mjs`);
- `harness/validation/HARNESS_VALIDATION_R7D_4.json` (validação 4).

## Instrumentos vinculados

| Instrumento | Versão | Onde |
|---|---|---|
| Runtime avaliado | `R7D-FREEZE-3`, o freeze da Fase 3.2. R7D-FREEZE-1 e -2 ficam superados, não editados | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json` |
| Harness | `R7D-HARNESS-4` (padrão: o registro do R7D-FREEZE-3) | `harness/`; validação em `harness/validation/HARNESS_VALIDATION_R7D_4.json` |
| Interface do autor | `R7D-INTERFACE-4` = INTERFACE-1 + deltas 2, 3 e `author/INTERFACE_DELTA_R7D_4.md` (o mais novo prevalece) | `author/` |
| Esquema e checador | `R7D-CASE-1`, `check-corpus.mjs`, sem mudança | `author/` |
| Gerador | `R7D-GENERATOR-1`, sem mudança. Seed do H2: `sha256('R7D-SAMPLE\|FINAL\|' + manifestDigest do R7D-FREEZE-3)` | `harness/generate-sample.mjs` |
| Brief final | `R7D-AUTHOR-BRIEF-FINAL-3` (`author/AUTHOR_BRIEF_FINAL_R7D_3.md`); o `-2` fica como registro da Fase 3.1 | `author/` |

## Delta PREREG-3 → PREREG-4

**Nenhum critério de sucesso é afrouxado.** P18 não tem envelope: uma violação é bloqueio.

| Δ | Mudança | Origem | Efeito |
|---|---|---|---|
| Δ1 | **P18: relação de pausas não resolvida** (nova propriedade; BLOCKER, sem envelope; SAFETY_BLOCKER quando um retorno larga uma pausa aberta, ou é aplicado antes de a relação de uma pausa mais nova sem nome ser declarada).<br>**Pausas abertas:** as declaradas desde o último retorno aplicado. Relatos que se nomeiam (`episodeId` igual ao nome do outro ou ao id de evento que o declarou) ou que declaram os mesmos fatos, fora o nome, são uma pausa só.<br>Em toda decisão que aplica um retorno com duas ou mais pausas abertas:<br>**(a) Cada uma é contabilizada.** Uma das três vale:<br>• a parada que o retorno registra cobre os dias dela;<br>• o retorno a lista em `separateBreaks` como `TRAINING_AFTER`, e o registro mostra uma sessão executada depois dela e antes do início da parada;<br>• o retorno a lista em `notApplied`, e ela nomeia uma pausa que um retorno já aplicou.<br>Senão: OLDER_BREAK_DROPPED.<br>**(b) A relação foi declarada.** Toda pausa aberta depois da primeira traz um nome em algum relato seu. Senão: RELATION_NOT_ESTABLISHED.<br>**Não avaliável:** uma pausa sem data de início ou de fim, em (a).<br>**INSERT_NEWER_BREAK** (metamórfica do P18): em cada revisão que aplicou um retorno lendo uma pausa guardada, a mesma revisão também declara uma pausa mais nova sem nome (sete dias até a véspera, viagem de trabalho). Essa decisão não pode aplicar retorno nem sair VALID | SSCTR-P31-F02; Founder Fase 3.2 | Mais estrito (novo). Cobre o F02, antes sem propriedade: o P17 fecha a janela da pausa antiga quando uma nova é declarada, e o P08 passava |
| Δ2 | **P17 inalterado.** Continua com a janela de uma pausa só. O P18 continua a janela da pausa antiga depois de uma mais nova | Fase 3.2 | Registro |
| Δ3 | **RENAME_OPAQUE_IDS renomeia `interruption.episodeId`** com o mesmo mapeamento dos ids de evento, como já fazia com `correctionOf`. O nome de uma pausa é um id opaco. No HARNESS-3 uma correção que nomeava o relato deixava de nomeá-lo na variante: o DEV-23 deu falso FAIL | Validação 4 | Correção do instrumento. A equivalência medida fica mais estrita, não mais frouxa |
| Δ4 | **Pacote de domínio:** mostra todas as pausas registradas e não aplicadas, não só a mais recente (o renderer do HARNESS-3 era last-write-wins) | Fase 3.2 | Só renderer |
| Δ5 | **Cobertura crítica (acréscimo ao Δ6 do PREREG-3).** O H1 avaliado precisa de pelo menos 2 casos base independentes com duas ou mais pausas declaradas antes de o coach aplicar a primeira, seguidas de uma revisão que não declara nenhuma. Entre eles, pelo menos:<br>• 1 em que a pausa mais nova é mais curta e encosta na antiga ou se sobrepõe a ela;<br>• 1 com dias entre as duas pausas;<br>• 1 respondido como pausa separada e 1 como correção;<br>• 1 com sessões planejadas entre duas pausas separadas, relatadas só quando perguntadas;<br>• 1 com a pausa antiga de razão clínica.<br>Unidades obrigatórias: P18 ≥ 2 e INSERT_NEWER_BREAK > 0.<br>Faltando qualquer um: INVALID_HOLDOUT, substituído por corpus novo e independente | Founder ("o holdout final precisa ter pelo menos um caso de múltiplas pausas capaz de expor o F02 antigo") | Mais estrito |
| Δ6 | **Sensibilidade.** O HARNESS-4 detecta no R7D-FREEZE-2:<br>• SSCTR-P31-F02 pelo P18 (DEV-22, DEV-23, DEV-24) e pelo INSERT_NEWER_BREAK (DEV-18, DEV-20);<br>• o caminho de reclassificação do SSCTR-P31-F03 pelo P18 (DEV-25).<br>Todos ficam limpos no candidato. Os dez defeitos anteriores continuam detectados nos seus runtimes. 42/42 testemunhas disparam | Validação 4 | Registro |
| Δ7 | **Condições de consumidor (acréscimo ao Δ8 do PREREG-3):**<br>• uma correção nomeia a pausa que corrige (`episodeId`), também antes de ela ser aplicada;<br>• nunca gerar `episodeId` automaticamente: o nome é a declaração do atleta;<br>• responder INTERRUPTION_RELATION reenviando a pausa mais nova com o `episodeId` escolhido pelo atleta;<br>• responder TRAINING_BETWEEN_BREAKS como UNREPORTED_TRAINING.<br>Nenhuma condição pede ao atleta para repetir uma pausa guardada | Founder Fase 3.2 | Precisão |
| Δ8 | **Fronteira F08: `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`** (disposição do Founder).<br>• Uma liberação qualificada não é autoridade suficiente para converter uma pausa de causa clínica na receita não clínica.<br>• Uma pausa mais nova não clínica e sem nome também não converte (antes, no R7D-FREEZE-2, ela substituía a clínica).<br>• Uma expectativa do autor de retorno planejado depois de pausa clínica continua EXPECTATION_OUTSIDE_AUTHORITY.<br>• Dono depois da R7-D: Founder/PCG + revisão qualificada SSCTR/clínica. Nenhuma expansão de runtime agora | Founder Fase 3.2 | Precisão; o caminho de saída por pausa mais nova sem nome fecha |

## Fechado nesta fase

- **SSCTR-P31-F02.** Uma pausa mais nova sem nome não encerra mais a retenção de uma pausa guardada. A relação é perguntada, e pausas separadas são lidas juntas pela continuidade factual. Medido pelo P18 e pelo INSERT_NEWER_BREAK.
- **QE-R7D-P31-11.** Uma declaração mais nova parcial não substitui mais uma pausa guardada: a relação é perguntada.

## Resíduos divulgados, sem envelope

Valem os do PREREG-3, com estas mudanças.

**F08 (QE-R7D-P31-01, SSCTR-P31-F03).** Agora é `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`.
- A única saída que resta é uma correção nomeada da própria pausa. Uma declaração mais nova sem nome não sai mais.
- Uma correção nomeada que muda a razão para não clínica torna a correção a pausa em vigor, como no R7D-FREEZE-2 (Founder A: os fatos anteriores ficam inertes).
- Divulgado para a SSCTR.

**Novos resíduos da Fase 3.2 (registrados pelas checagens):**
- **Atrito de uso.** Uma pausa corrigida e reenviada sem `episodeId` (por exemplo, depois de uma pergunta sobre a razão ou as datas) é perguntada uma vez a mais: pela relação. Esse é o custo da regra do Founder. O consumidor o evita nomeando a correção.
- **Dias sem sessão planejada entre duas pausas separadas contam como sem treino.** É o lado conservador: parada mais longa, classe mais conservadora. O modelo só conhece treino de sessões do plano (Founder 0.3).
- **Relato conflitado.** Um relato conflitado de sessão entre pausas é tratado como não relatado: perguntado.
- **Correção de pausa aplicada guardada.** Enquanto outra pausa não aplicada está registrada, ela não é lida: fica em `notApplied` quando o retorno da outra é aplicado. Uma correção da pausa anterior através da nova é perguntada depois, pela regra B4, inalterada.

## O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, que depende do digest do R7D-FREEZE-3.
- Qualquer decisão sobre `V1_COACHING_AUTHORITY_READY`.
