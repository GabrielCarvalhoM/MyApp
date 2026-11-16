# V1STR — N4, encerramento da correção focal

Missão do Founder de 2026-11-16, "N4 · Final focused fix-forward". Chief em Fable 5.2. Este arquivo continua `V1STR_CLOSURE.md`, que fica como estava.

**Estado: ENCERRADA. As quatro fronteiras foram aprovadas com condições pelos dois juízes independentes e congeladas como candidato sintético.** Uma correção, uma reverificação, nenhum bloqueio novo. Nada foi enviado, nada foi mesclado, e nada está liberado para atletas reais.

| Correção | Fronteira | QRE (R3, sobre `5f7f6f6`) | SSCTR (R3, sobre `5f7f6f6`) | Registro de habilitação |
|---|---|---|---|---|
| N1 isometria | `V1X-STRENGTH-HOLD-DOSE` | pode ser emitido | ACCEPT_WITH_CONDITIONS | APPROVE_WITH_CONDITIONS |
| N2 MAIN superior em RUNNING_SUPPORT | `V1X-STRENGTH-UPPER-LOADING` | pode ser emitido | ACCEPT_WITH_CONDITIONS | APPROVE_WITH_CONDITIONS |
| N3 volume por músculo, descritivo | `V1X-STRENGTH-EXPOSURE` | pode ser emitido | ACCEPT_WITH_CONDITIONS | APPROVE_WITH_CONDITIONS |
| N4 planos verticais | `V1X-STRENGTH-PLANE` | pode ser emitido; QRE-STR-B-01 fechado | ACCEPT_WITH_CONDITIONS; SSCTR-STR-B-01 fechado | APPROVE_WITH_CONDITIONS |

Veredito da QRE: `READY_WITH_CONDITIONS`. As condições são as de integração, que já existiam.

## 1. O que foi corrigido

Num plano em curso, a regra de planos agora **só conserva**. Duas expressões em `CoachingCore/src/r7b-repertoire.mjs`:
- um slot pede o plano vertical só onde o plano foi construído com ele pedindo;
- enquanto o exercício com que o slot foi construído não cabe, o slot não prefere nada e segue a ordem de sempre do motor. Volta a ele quando cabe de novo.

A preferência que acrescentei no ciclo anterior foi retirada, não limitada. Planos novos não mudaram (2.412 planos e 54 reinícios com o mesmo resumo antes e depois, medido pela QRE). O motor de dose não foi tocado.

## 2. O que os juízes mediram

- **Dose.** Nenhuma linha MAIN de carga externa fora da faixa do objetivo acrescentada pela regra: 0 em 2.688 mudanças de dias, nos quatro objetivos (eram 44 de 672 só em força). Nenhum MAIN com dose vinda de uma linha acessória: 0 em 672.
- **Entrada da regra.** Plano construído sem slot de plano nunca ganha um: 0 em 624 mudanças (eram 64 de 64).
- **Mesmo estado, com e sem a regra.** A QRE comparou 36.006 revisões de 7.140 sequências com a mesma revisão sem a regra de planos. Toda diferença era um slot guardando o exercício com que foi construído.
- **Dose conservada.** 384 MAIN verticais mantidos depois de uma mudança de dias têm, semana a semana, a mesma dose do plano sem a mudança. Em 192 mudanças entre 4 e 5 dias, que nenhuma varredura anterior cobria, os slots ficam como construídos e nenhuma linha sai da faixa.
- **Envelopes.** Em 240 planos híbridos de prova, corridas, posição das sessões e status são iguais com as regras, sem a regra de planos e com tudo desligado. Nenhuma sessão passa dos minutos do atleta e nada novo entra em taper, semana de prova ou semana seguinte.
- **N1, N2 e N3:** iguais à reverificação anterior. Dor e sinais de alerta continuam respondidos antes de qualquer recusa.
- **Testes.** Próprios: 67 de 67. Suíte conjunta: 1601 de 1603; as duas falhas são os dois testes históricos de freeze que falham nesta linha por desenho, pelo nome. Nenhum teste histórico foi editado. Mutação da QRE: 17 de 20 mortos, os 3 restantes equivalentes.

## 3. O que os juízes decidiram sobre o que eu deixei para eles

- **A regra só conserva num plano em curso (D-18): aceito com condições.** Custo: depois de uma mudança de dias que troca os templates (2↔4, 3↔4, 2↔5, 5→2), o plano para de alternar planos e os exercícios verticais podem sair dele. Não volta nem se o atleta retornar aos dias originais; volta só num plano novo. Na probe da QRE isso acontece em 88 de 308 sequências (eram 2). Não muda dose, papel nem estabilidade.
- **SSCTR-STR-B-02 (D-19): aceito com condição, sem mudança de código.** Depois de 2→3 ou 2→4 dias, os verticais que viram acessórios são trocados na semana 9 por exercícios de peso corporal ou assistidos. O SSCTR conferiu que isso é igual nos três commits (`21838cb`, `76b8448`, `5f7f6f6`), que a regra de planos não seleciona nada ali, e que o motor congelado faz o mesmo sozinho em 150 de 582 planos novos. Fica registrado como comportamento conhecido da rotação do motor, não como escolha da regra.
- **Reinício depois de pausa (QRE-STR-C-01): dentro do aprovado para planos novos.** O plano novo pode pôr no MAIN vertical um exercício que o plano antigo usava como acessório. A linha começa de novo na dose de MAIN: em 126 casos medidos pelo SSCTR, nenhuma dose vem do registro e nenhuma sai da faixa em nove semanas.

## 4. Habilitação e freeze

- **Registros:** `candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json` (sha `4cddc7ec…3711`), emitidos pelo juiz SSCTR depois de ler a reverificação da QRE. Cada um vincula os valores `06d4731d…9b33` e os três arquivos de runtime de `5f7f6f6`.
- **Autoridade vinculada aos bytes:** conferido por mim no runtime. As quatro fronteiras leem ligadas a partir da revisão independente, e o sha do arquivo de valores é o fixado.
- **Freeze:** `COACHINGCORE-V1-STRENGTH-FREEZE-1`, registro `CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json` (commit `b6a5df3`). Vincula o commit `24a6a40`: 121 arquivos acrescentados (resumo `c421aabf…1884`) e um arquivo emendado (44 linhas a mais, 11 a menos sobre os bytes de `COACHINGCORE-V1-FREEZE-1`).
- **Verificação:** `v1str-freeze --check 1` sai com 0. Os quatro freezes anteriores estão preservados (196/196, 30/30, 98/98, 163/163) e cada verificador antigo passa no próprio snapshot.
- **Desligada, é idêntica:** o ponto de entrada de baixo responde igual. Pelo novo ponto de entrada, sem opção nenhuma, os planos agora nascem sob as três regras de seleção.

## 5. O que fica aberto, com dono

**Para o Founder decidir ou encaminhar:**
- **Avisar o atleta de que a alternância acabou** depois de uma mudança de dias, e de que um plano novo a traz de volta. Hoje nada avisa. Dono: Produto/UX, antes de qualquer integração.
- **Manter os verticais depois de uma mudança de dias** quando o plano já os tinha como MAIN. Não implementei: manteria a regra escolhendo dentro de um plano em curso. É um acréscimo que pede revisão própria do SSCTR.
- **A rotação de acessórios do motor congelado não tem guarda de carga** (SSCTR-STR-C-02), junto com as duas perguntas já registradas do motor (estado de dose compartilhado entre MAIN e acessório; semanas sem tronco sob tempo curto). São do motor, não desta extensão.

**Antes de qualquer uso não sintético ou integração** (condição de todos os registros): migração de planos anteriores às regras; caminho de continuação para plano sob outras regras; data de revisão lida pelo runtime; roteamento de todo plano pelo novo ponto de entrada; revisão de dados (G03) da exposição antes de qualquer tela; revisão focal de Segurança.

**Menores:**
- mudanças entre 4 e 5 dias não têm teste dirigido; o SSCTR mediu e estão corretas (SSCTR-STR-C-01);
- uma autoridade de desenvolvimento malformada ainda lança erro (QRE-STR-B-03, só caminho de desenvolvimento);
- os registros pedem nova revisão até 2027-04-30, ou antes se qualquer byte vinculado mudar.

**Fila humana:** `HQ-SI-V1-SSCTR-SQ-1` a `SQ-4` continuam apenas propostos. Nenhum gate foi fechado, nada foi publicado. Não houve validação humana, empírica ou clínica.

## 6. Estado da linha

- Branch `claude/v1-strength-corrections`, worktree `.claude/worktrees/v1-strength-corrections`. Nada enviado, nada mesclado.
- Commits desta missão: `5f7f6f6` (candidato), `1db6e38` (as duas reverificações como recebidas), `24a6a40` (registros de habilitação), `b6a5df3` (freeze), e este encerramento.
- Não foram tocados: Run Workout Structure, Race Forecast, Figma, HealthKit, fila humana, `product/`, `canon/`, nenhum verificador ou teste histórico.
- Dois testes históricos de freeze continuam falhando nesta linha por desenho. Nunca anunciar suíte toda verde aqui.

## 7. Registros desta missão

| Arquivo | Papel |
|---|---|
| `candidate/V1STR_N4_FIX_FORWARD.md` | registro do autor sobre a correção (leituras D-18 e D-19) |
| `candidate/reviews/qre/QRE_V1STR_N4_RECHECK_R3.md` e `.json` | reverificação da QRE, com probes `r3-*` e saídas |
| `candidate/reviews/ssctr/SSCTR_V1STR_N4_RECHECK_R3.md` e `.json` | reverificação do SSCTR |
| `candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json` | os quatro registros de habilitação |
| `candidate/probes/n4-b02-counts.mjs` | contagens do autor para SSCTR-STR-B-02 |
| `CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json` | o freeze |
| este arquivo | encerramento |
