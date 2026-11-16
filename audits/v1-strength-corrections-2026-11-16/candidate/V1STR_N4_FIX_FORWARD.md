# V1STR — N4, a correção focal (registro do autor)

Autor: Chief em Fable 5.2. Missão do Founder de 2026-11-16, "N4 · Final focused fix-forward": uma correção delimitada e uma reverificação independente. Parte de `76b8448` (o código julgado é o de `3342a1d`). Os registros anteriores (`V1STR_CANDIDATE.md`, `V1STR_CORRECTIVE_CYCLE.md`, as revisões R1 e R2) não foram editados.

Nada está aprovado. Não existe registro de habilitação nem freeze. A reverificação dos dois juízes vem depois deste commit.

## 1. O que mudou

Duas expressões no arquivo emendado `CoachingCore/src/r7b-repertoire.mjs` (`buildTemplates`), mais comentários:

| Onde | Antes (`3342a1d`) | Agora |
|---|---|---|
| Quais slots pedem o plano vertical num plano em curso | todo segundo slot MAIN do padrão, sempre que `inForce` existisse (um conjunto vazio de âncoras também contava) | só o slot que o plano foi construído pedindo: o mesmo tipo de template e o mesmo índice têm de estar entre as âncoras |
| O que um slot com âncora prefere quando a configuração dele não cabe | o plano vertical entre os exercícios que o plano já usa (`established`) | nada: a ordem de sempre do motor. Volta à âncora quando ela cabe de novo |

Com isso, num plano em curso a regra **só conserva**. Ela não escolhe nada, não leva exercício nenhum para uma linha MAIN e não entra num plano que foi construído sem ela. Num plano novo nada mudou.

Acompanham a mudança, sem efeito no comportamento:
- `v1/STRENGTH_EXTENSION_V1.json`: a frase `planInForce` descrevia a preferência retirada; agora descreve o que o código faz. É o único byte de valores que mudou. Novo sha: `06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33` (era `15a51f55…850f`). Todo registro de habilitação tem de vincular este sha.
- `src/v1-strength.mjs`: só o sha fixado dos valores.
- `scripts/v1str-freeze.mjs`: os hashes autorizados do arquivo emendado (`1997a4e5…776b`, diff `4b52eb74…bef4`, 44 linhas a mais e 11 a menos sobre a base de `COACHINGCORE-V1-FREEZE-1`), a frase que descreve a emenda, e uma linha no cabeçalho com a ordem escrever, commitar, conferir (QRE-STR-B-02).
- `test/v1str-extension.test.mjs`: o teste "SQ-4 c5 (SSCTR-STR-A-08)", que fixava a leitura D-15 rejeitada, saiu. Entraram quatro testes (seção 4).

Nenhum arquivo de dose, progressão, recuperação, interferência ou triagem foi tocado. `src/v1-strength-index.mjs` não mudou.

## 2. Por que retirar em vez de limitar

A QRE apontou dois caminhos: preferir só o que o plano tinha como MAIN, ou voltar ao comportamento da rodada 1 (não preferir nada sem âncora). Escolhi o segundo, e fechei também a entrada da regra em planos construídos sem ela.

- É a leitura D-2 da rodada 1, que o SSCTR aceitou ("num plano em curso a regra só conserva, nunca adota").
- Fecha os seis critérios na leitura mais estrita: um slot sem âncora não existe mais, então não pode ficar com nada.
- A preferência limitada manteria a regra escolhendo exercícios dentro de um plano em curso. Foi exatamente essa classe de mecanismo que produziu o bloqueio. O Founder pediu para não transformar a limitação em funcionalidade nesta missão. Ela pode ser decidida depois, sozinha: é um acréscimo, não uma correção.

## 3. Leituras declaradas, para os juízes decidirem

**D-18 (substitui D-15 e o lado "plano em curso" de D-13). Num plano em curso a regra só conserva.**
- Um slot pede o plano vertical só onde o plano foi construído com ele pedindo. Plano construído sem nenhum (classe NONE, novato sem exercício nomeado, um dia de força) nunca ganha um.
- Entre dois e três dias de força o slot continua (o template `FULL_B` está nas duas semanas) e fica com o exercício com que foi construído.
- Depois de uma mudança de dias que troca o template desses slots (2↔4, 3↔4, 2↔5, 5→2), nenhum slot pede. A seleção dessa revisão é byte a byte a seleção sem a regra sobre o mesmo estado do plano (teste "criterion 2"). O plano não volta a alternar planos: as âncoras não existem mais. A alternância só volta num plano novo.
- **Custo, declarado.** Os exercícios verticais com que o plano foi construído podem sair do plano depois dessa mudança. Na probe da QRE (`r2-b`, 308 sequências, HYPERTROPHY e híbrido): 88 sequências perdem um vertical que o plano tinha como MAIN (eram 2 em `3342a1d`), todas em mudanças de dias que trocam o template; nenhuma em 2↔3 dias. A probe não conta esse item nas sequências de equipamento; ali a âncora volta quando o equipamento volta (teste "SQ-4 c5 (QRE-STR-A-01)"). É o custo que a rodada 1 já declarava (SSCTR-STR-A-08, observação). Nenhum texto pode afirmar que o plano cobre os dois planos depois disso (SQ-4 c7).

**D-19. SSCTR-STR-B-02 não foi resolvido por código. Peço a decisão do SSCTR com as contagens (critério 5, segunda alternativa).**
- O que acontece: depois de 2→3 ou 2→4 dias, os verticais que eram MAIN passam a ocupar os slots acessórios da sessão `UPPER`. Quem os põe ali é o critério de continuidade do motor congelado (ordem de seleção do catálogo, item 2). Na primeira fronteira de bloco, a rotação do motor (B0-C06) troca essas linhas pelas alternativas admissíveis do mesmo plano: `pike-push-up` e `band-assisted-pull-up`.
- A regra não seleciona nada nessa semana: nenhum slot pede.
- **Não vem da preferência retirada.** A contagem é a mesma com ela (`76b8448`: 56 de 672) e sem ela (este candidato: 56 de 672), e o mesmo acontece no candidato da rodada 1, `21838cb`, que não tinha a preferência (probe de rascunho num clone, 8 de 8 casos com academia completa, STRENGTH e RUNNING_SUPPORT).
- **É a rotação do motor congelado.** Com tudo desligado e sem mudança de dias, um plano com máquinas e elásticos troca `lat-pulldown` (carga externa, acessório) por `band-assisted-pull-up` ou `band-pulldown` na semana 9 (`probes/n4-b02-counts.mjs`, parte 2).
- Contagens, matriz do SSCTR (672 mudanças por objetivo, DEV contra OFF), neste candidato:

| Objetivo | Mudanças com exercício superior novo que OFF não traz | Detalhe |
|---|---|---|
| STRENGTH | 56 | 28 em 2→4, 28 em 2→3; FULL 32, MACH_DB 24. 64 linhas: `pike-push-up` 40, `band-assisted-pull-up` 24. Todas ACESSÓRIO, todas na semana 9, fase DEVELOPMENT, todas 2×7. Todas no lugar de `db-overhead-press` ou `lat-pulldown`, que eram MAIN antes da mudança |
| GENERAL | 104 | 52 em 2→4, 52 em 2→3; FULL 32, DB 24, MACH_DB 24, DB_BANDS 24. 112 linhas: `pike-push-up` 88, `band-assisted-pull-up` 24. Todas ACESSÓRIO, semana 9, DEVELOPMENT, 1×12, no lugar de `db-overhead-press` ou `lat-pulldown` que eram MAIN |
| HYPERTROPHY | 0 | os slots acessórios da sessão superior recebem outros padrões nesse objetivo |
| RUNNING_SUPPORT | 160 com todas as regras; **104 só com a regra de planos** | Só a regra de planos: o mesmo desenho de GENERAL (112 linhas, `pike-push-up` 88 e `band-assisted-pull-up` 24, ACESSÓRIO, semana 9, 1×10). As outras vêm da regra de carga (N2), já aceita: com a regra de planos desligada e as outras ligadas são 160 mudanças e 320 linhas acessórias, 208 delas de carga externa; 184 entram na semana da mudança e 136 na semana 9 |

- Nos conjuntos STRENGTH e GENERAL, depois da mudança, o plano com as regras traz 384 exercícios novos ao todo e o plano sem as regras traz 608: os verticais ocupam slots que, sem a regra, receberiam exercícios novos já na semana da mudança.
- **A mesma rotação acontece sob N2 sozinha.** Em RUNNING_SUPPORT, com a regra de planos desligada, a regra de carga põe `db-overhead-press` no slot acessório novo e a rotação o troca por `pike-push-up` na semana 9 (48 linhas em 672 mudanças).
- **A dose do MAIN não muda.** Depois de 2→3 dias o vertical continua MAIN em `FULL_B` (âncora) e também ocupa o acessório da `UPPER` até a semana 9. As linhas MAIN dele têm, semana a semana, as mesmas séries e repetições do mesmo plano sem a mudança de dias (STRENGTH, GENERAL e RUNNING_SUPPORT, mudança na semana 1 e na 3: 12 de 12 trilhas iguais). A linha acessória leva as mesmas repetições com menos séries.
- Um guarda de carga para a rotação seria uma regra nova sobre B0-C06, não parte de SQ-4. Não a implementei.

**O que não mudou de leitura:** D-13 para planos novos, D-14, D-16 e D-17 continuam como julgados na R2.

## 4. Os seis critérios do SSCTR, um por um

| Critério | Estado | Onde conferir |
|---|---|---|
| 1. Plano em curso nunca ganha slot de plano com que não foi construído | fechado | `r2-scan-inforce-small.mjs` do juiz: 64 planos de iniciante, 0 ganham slot (eram 64). Teste "criterion 1": 26 mudanças, cada uma igual, linha a linha, ao plano sem a regra |
| 2. Slot sem âncora nunca fica com exercício que o plano tinha em outro papel | fechado | não existe mais slot sem âncora num plano em curso. Mesma varredura: 0 (eram 12 nos iniciantes; 24 com intermediários). Probe da QRE `r2-b`: 0 trocas de papel por causa da regra (eram 16). Testes "criteria 2 and 3" e "criterion 2" |
| 3. Varreduras: zero MAIN de carga externa fora da faixa acrescentado; zero MAIN de plano vindo de exercício só acessório | fechado | `r2-scan-changes.mjs` do juiz: STRENGTH 0 de 672 (eram 44). Rodei também os outros três objetivos: GENERAL 0, HYPERTROPHY 0, RUNNING_SUPPORT 0. Ao todo 0 em 2.688 mudanças. `r2-b01-strength.mjs`: 0 (eram 44) |
| 4. Um teste dirigido para cada item | feito | quatro testes novos em `test/v1str-extension.test.mjs`; os três com "SSCTR-STR-B-01" no nome falham no arquivo de `76b8448` (0 de 3) e passam aqui |
| 5. SSCTR-STR-B-02 | **aberto para decisão do SSCTR**, com contagens | D-19 acima; `probes/n4-b02-counts.mjs` |
| 6. Nova revisão do SSCTR e da QRE | pendente | depois deste commit |

Mutação feita pelo autor sobre as duas expressões (rascunho, 4 mutantes: a preferência de volta; o guarda de slot fora; o guarda lendo só "o plano tem alguma âncora"; preferência sem limite quando a âncora não cabe): 4 de 4 mortos pelos testes dirigidos.

## 5. Evidência deste candidato (rodada pelo autor)

Reprodução antes de editar, em `76b8448`, com as probes dos juízes sem alteração: SSCTR 44 de 672 e 56 de 672; iniciantes 64 de 64 ganham slot, 24 MAIN vindos de acessório, 6 fora da faixa (versão larga, 128 mudanças); QRE 16 trocas de papel em 308 sequências.

| Verificação | Resultado neste candidato |
|---|---|
| Testes próprios (`test/v1str-*.test.mjs`, 5 arquivos) | 67 de 67, nenhum pulado |
| Suíte conjunta | 1601 de 1603. As duas falhas são os dois testes históricos de freeze que nomeiam o arquivo emendado, pelo nome: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…` e `I10, V6: …`. Falham nesta linha por desenho desde antes desta missão e ficam verdes nos próprios snapshots. Eram 1598 de 1600; saiu um teste próprio e entraram quatro |
| `v1str-freeze --preserved` | 196/196, 30/30, 98/98, 163/163; os quatro registros são os bytes fixados; base, bytes e diff de `r7b-repertoire.mjs` conferem (44+/11-); nada mais mudou; nenhum arquivo não rastreado |
| Freezes históricos nos próprios snapshots (clone de rascunho) | `v1fc --check 1` em `981a8f6`, `v1rc --check 1` em `c8104c1`, `v1rws --check 2` em `f32a711`, `v1rfc --check 1` em `2dfa216`: os quatro saem com 0 |
| SSCTR `r2-scan-changes.mjs`, quatro objetivos | MAIN de carga externa fora da faixa que OFF não tem: 0 de 2.688 |
| SSCTR `r2-scan-inforce-small.mjs` (NONE e NOVICE, 64) | sem slot na construção 64, ganharam um 0; MAIN de plano vindo de acessório 0; conjunto de MAIN diferente do plano sem a regra 0; fora da faixa 0 |
| SSCTR `r2-scan-inforce-small.mjs` (com INTERMEDIATE, 128) | 0 ganharam slot; 0 vindos de acessório; 0 fora da faixa; 12 com MAIN diferente do plano sem a regra, todos 3→2 dias, onde o slot com âncora guarda o exercício com que foi construído |
| SSCTR `scan-roles.mjs` (1500 perfis, planos novos) | 128 / 128 / 128 e 680 / 680 / 680, como na R2 |
| SSCTR `probe-time3.mjs` (600 planos, 30/40/45 min) | DEV 85 / 32, HOLD 85 / 32, UPPER 0 / 0, PLANE 0 / 0, como na R2 (saída idêntica) |
| SSCTR `probe-binding.mjs` | saída idêntica à da R2: dor, lesão e dor com um exercício respondem `CLINICAL_HUMAN_REQUIRED` sem proposta |
| SSCTR `r2-probe.mjs` | muda só onde a correção age: nenhum slot pede depois de uma mudança que troca o template; iniciante 3→2 igual ao plano sem a regra |
| QRE `r2-b` (308 sequências) | troca de papel pela regra 0 (eram 16); exercício novo pela regra 0; NONE em curso alterado 0 (eram 76); vertical perdido 88 (eram 2), o custo de D-18 |
| QRE `r2-c` (4 casos traçados) | nenhum exercício passa a MAIN; os slots são os do plano sem a regra |
| QRE `r2-d` (NONE em curso, 35) | só anotação: 0 (eram 35). Fecha QRE-STR-B-04 |
| QRE `qre-c` (648 planos, 103.834 linhas) | números idênticos aos da R2: 13.088 linhas mudadas, 0 fora do alcance, 0 em corridas, forma, fases e interferência, 24 diferenças de dose no mesmo exercício |
| QRE `qre-b`, `qre-b2`, `qre-c2`, `qre-d`, `qre-f`, `r2-a` | iguais às saídas gravadas na R2, fora o que a correção muda (casos de mudança de dias em `qre-b`), o sha dos valores e um tempo em milissegundos |
| QRE `qre-a` | 576 de 576 e 70 de 70 idênticos com tudo desligado; para depois no erro já registrado como QRE-STR-B-03 (autoridade de desenvolvimento malformada), como na R2 |
| `probes/probe-v1str.mjs` | 38 de 38 |
| Probe da fundação no ponto de entrada congelado | 37 de 37 |

As contagens de D-19 saem de `probes/n4-b02-counts.mjs` (objetivo, e as regras ligadas: todas, só a de planos, ou todas menos ela). As probes de rascunho citadas (o candidato da rodada 1 e as trilhas de dose depois de 2→3) ficaram fora do repositório, em `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\5e4a7765-3b4b-44f4-a8e4-e5048aab9bf3\scratchpad\n4\probes\`, com as saídas em `...\n4\fix\` e a reprodução inicial em `...\n4\base\`.

A lista da missão (seção 5), e onde cada caso está coberto:

| Caso | Onde |
|---|---|
| Planos novos com dois ou mais slots MAIN | testes "SQ-4 c1", "c2", "c3", "c9" e "SQ-4 c6 (SSCTR-STR-A-01)", inalterados; `scan-roles` |
| Plano em curso sem mudança de agenda | "SQ-4 c5 the configuration is fixed per slot"; os atletas sintéticos de várias semanas em `v1str-preservation` |
| De dois para três ou mais dias; redução de dias | teste "criteria 2 and 3" (56 mudanças, sete direções); as varreduras do SSCTR |
| Troca de nome e de ordem dos templates | o mesmo teste (mudanças que trocam o tipo de template) e "what does not change the templates" (os mesmos dias em outros dias da semana) |
| Exercício usado como acessório em outra sessão; exercício que era MAIN | teste "criteria 2 and 3" (levantamentos com barra nomeados, máquinas, elásticos) e "criterion 2" |
| Perda e recuperação de equipamento | "SQ-4 c5 (QRE-STR-A-01)", inalterado; `qre-b2` |
| Substituição por habilidade | "what does not change the templates" |
| Iniciante verdadeiro; novato com exercício conhecido | "criterion 1" (26 mudanças); o caso NOVICE com exercício nomeado em "criteria 2 and 3" |
| Hipertrofia, força, geral, suporte à corrida | os quatro em "criteria 2 and 3"; `r2-scan-changes` nos quatro objetivos |
| Híbrido com taper e semana de prova | "SQ-4 c6", "V-SUB-04", e a mudança de dias dentro do taper em "what does not change the templates" |
| Sessões de 30 a 45 minutos | `v1str-time`; "criterion 1" com 30 e 45 minutos; `probe-time3` |
| Dor, sinais de alerta, hold clínico | "SSCTR-STR-A-02", inalterado; `probe-binding` |

## 6. N1, N2 e N3

Nenhuma linha delas mudou. O que as garante continua medido igual: nenhuma prancha em nenhum caminho; a limitação de tronco fixada em 85 / 32; carga externa antes de propósito só no escopo de SQ-2; a exposição igual ao oráculo e sem consumidor. O único byte novo que elas compartilham é a frase `planInForce` dos valores, e com ela o sha que os registros vinculam.

Condições que permanecem, sem virar funcionalidade:
- algumas semanas curtas perdem a linha de tronco ao tirar a prancha dos exercícios em repetições;
- planos anteriores às regras não são migrados;
- a seleção pode conservar os exercícios que o plano tem em vez de fazer a alternância vertical (D-18).

## 7. O que continua aberto, com dono

Como no encerramento anterior (`../V1STR_CLOSURE.md`, seção 4), sem mudança: migração de planos anteriores às regras, caminho de continuação para plano sob outras regras, data de revisão não lida, roteamento pelo novo ponto de entrada, revisão de dados (G03) da exposição, revisão focal de Segurança na integração. Do encerramento, "para a próxima correção": QRE-STR-B-02 ganhou só a linha de cabeçalho; QRE-STR-B-03 e os mutantes X2-09 e X2-11 não foram tocados (fora do bloqueio); SSCTR-STR-B-04 continua (os valores descrevem a regra em campos que o runtime não lê; a frase agora é verdadeira).

## 8. Como conferir

Da pasta `CoachingCore/`:

```
node --test test/v1str-extension.test.mjs test/v1str-preservation.test.mjs test/v1str-exposure.test.mjs test/v1str-time.test.mjs test/v1str-freeze.test.mjs
node scripts/v1str-freeze.mjs --preserved
node ../audits/v1-strength-corrections-2026-11-16/candidate/probes/probe-v1str.mjs
node ../audits/v1-strength-corrections-2026-11-16/candidate/probes/n4-b02-counts.mjs STRENGTH
```

As probes do SSCTR estão fora do repositório, onde ele as deixou: `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\21ffbd32-da9f-43c9-b8b9-3f3dffe707fe\scratchpad\ssctr-v1str\`. As da QRE estão em `reviews/qre/probes/`. Numa rodada de mutação do arquivo emendado, deixar `v1str-freeze.test.mjs` de fora.
