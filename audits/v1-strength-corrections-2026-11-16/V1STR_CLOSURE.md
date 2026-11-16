# V1STR — encerramento

Missão do Founder de 2026-11-16 (Strength Intelligence, as quatro correções aprovadas pelo SSCTR). Chief em Fable 5.2.

**Estado: ENCERRADA COM BLOQUEIO NOMEADO.** Três das quatro correções passaram pelos dois juízes independentes sem bloqueio. A quarta, a alternância de planos (N4), está bloqueada pelos dois juízes pelo mesmo achado. O único ciclo corretivo foi usado. **Nada foi habilitado e nada foi congelado:** não existe registro de habilitação nem freeze desta extensão, e por padrão ela está desligada.

| Correção | Fronteira | QRE (reverificação) | SSCTR (reverificação) |
|---|---|---|---|
| N1 isometria | `V1X-STRENGTH-HOLD-DOSE` | sem bloqueio de qualidade | ACCEPT_WITH_CONDITIONS |
| N2 MAIN superior em RUNNING_SUPPORT | `V1X-STRENGTH-UPPER-LOADING` | sem bloqueio de qualidade | ACCEPT_WITH_CONDITIONS |
| N3 volume por músculo, descritivo | `V1X-STRENGTH-EXPOSURE` | sem bloqueio de qualidade | ACCEPT_WITH_CONDITIONS |
| N4 planos verticais | `V1X-STRENGTH-PLANE` | **bloqueante** (QRE-STR-B-01) | **BLOCK** (SSCTR-STR-B-01) |

Veredito da QRE sobre os bytes de `3342a1d`: `NOT_READY`, só por N4. Registros: `candidate/reviews/qre/QRE_V1STR_RECHECK_R2.md` e `candidate/reviews/ssctr/SSCTR_V1STR_RECHECK_R2.md`, como recebidos (commit `c1499be`).

## 1. O bloqueio

**O que acontece.** Num plano já em curso, depois de uma mudança no número de dias de força que troca os templates, o slot que pede o plano vertical pode ficar com um exercício que o plano só usava como acessório. O motor guarda um estado de dose por exercício, então a linha MAIN passa a carregar a dose do acessório.

**Exemplos medidos pelos juízes.**
- Força, barra, exercícios com barra nomeados, de 4 ou 5 dias para 2: `barbell-overhead-press` como MAIN a 3×7, 3×7, 2×7, 4×7 por dez semanas, com a faixa aprovada em 4 a 6. Em 44 de 672 mudanças (SSCTR).
- Hipertrofia, elásticos, de 4 ou 5 dias para 2: `pike-push-up` passa de acessório 2×10 a MAIN 3×14, 2×16, 4×16, com a faixa em 8 a 12. Em 16 de 308 sequências (QRE).
- Um plano de iniciante em curso ganha slots de plano depois de uma mudança de dias (64 de 64 tentados), e em 12 deles um MAIN recebe a dose de um acessório. Isso contradiz a leitura D-13 que eu mesmo declarei.

Não é risco de segurança: mais repetições com a mesma reserva é carga mais leve. É dose fora do envelope aprovado, e a SQ-4 foi aprovada sobre dose inalterada.

**Causa, e ela é minha.** No ciclo corretivo acrescentei uma preferência para o slot sem âncora depois de uma mudança de dias: "o plano vertical só entre exercícios que o plano já usa". Fiz isso para responder a uma observação, não a um bloqueio. "Já usa" inclui o que o plano só usava como acessório. Além disso, um plano construído sem slot de plano grava um conjunto vazio de âncoras, que o código lê como "plano em curso com a regra", e assim liga a regra dentro de um plano de iniciante. O teste que escrevi para o achado da rodada 1 cobria só planos novos.

**Por que encerra aqui.** É o mesmo defeito da rodada 1 (SSCTR-STR-A-01), alcançado por outro caminho. A regra do Founder para ciclos limitados diz que o mesmo defeito falhando de novo encerra a missão com o bloqueio nomeado, sem nova correção nem nova rodada de juiz.

**O que fecha o bloqueio numa próxima missão (critérios do SSCTR, testáveis).**
1. Um plano em curso nunca ganha um slot de plano com o qual não foi construído.
2. Um slot sem âncora, num plano em curso, nunca fica com um exercício que o plano tinha em papel diferente de MAIN.
3. As varreduras dos juízes (`r2-scan-changes.mjs`, `r2-scan-inforce-small.mjs`, `r2-c-role-switch.mjs`, ou equivalentes tão largas quanto) mostram zero MAIN de carga externa fora da faixa acrescentado e zero MAIN de plano tirado de exercício só acessório.
4. Um teste dirigido segura cada item.
5. O achado SSCTR-STR-B-02 é resolvido: depois de 2 → 3 ou 2 → 4 dias, a rotação dos acessórios traz `pike-push-up` e `band-assisted-pull-up`, novos no plano e sem carga externa, para um atleta de força com academia completa (56 de 672 mudanças).
6. Nova revisão do SSCTR e da QRE sobre esses bytes.

A QRE aponta o tamanho da correção: nesse caminho, preferir só exercícios que o plano tem como MAIN, ou voltar ao comportamento da rodada 1 (não preferir nada quando não há âncora) e aceitar que uma mudança de 2 para 4 dias deixa os dois slots no plano horizontal.

## 2. O que os dois juízes confirmaram

- **Achados da rodada 1.** Os três bloqueantes fecharam: a âncora do plano em curso sobrevive a perder e recuperar equipamento; num plano novo nenhum MAIN herda dose de acessório por causa da regra (128 perfis sem a regra, 128 com ela; eram 172); a resposta clínica vem antes da recusa de um plano construído sob outras regras (12 de 12 revisões clínicas idênticas à do ponto de entrada de baixo).
- **Desligada, é idêntica.** 576 de 576 planos e 70 de 70 revisões e reinícios iguais aos do ponto de entrada de baixo. O ponto de entrada congelado dá o mesmo resumo em `2dfa216` e em `3342a1d`.
- **Preservação** (648 planos, 103.834 linhas): nenhuma mudança fora do alcance de cada regra; nenhuma diferença em corridas, forma da semana, fases ou interferência; nenhuma sessão acima dos minutos do atleta (0 de 41.472).
- **N1:** nenhuma prancha em nenhum caminho tentado. A limitação sob tempo curto está declarada e fixada por teste (85 semanas com menos tronco, 32 sem nenhuma, em 456 planos; toda linha perdida era prancha).
- **N3:** igual ao oráculo do catálogo em 2.304 semanas; nada lê o valor.
- **Suíte conjunta:** 1598 de 1600. As duas falhas são os testes históricos de freeze que nomeiam o arquivo emendado, pelo nome. Nenhum teste histórico foi editado. Testes próprios: 64 de 64.
- **Mutação (QRE, rodada 2):** 33 de 41 mortos; dos 8 sobreviventes, 6 são equivalentes ou só mudam anotações.
- **Verificador de freeze:** recusa 13 de 13 árvores erradas; o ensaio de `--write 1` numa cópia, com registro de teste, funcionou.
- **Freezes antigos:** os quatro registros são os bytes fixados e cada verificador antigo passa no próprio snapshot. Nesta linha eles acusam o arquivo emendado, por desenho.

## 3. Por que não há freeze parcial

O verificador desta extensão só escreve um freeze com as quatro fronteiras ligadas, e a QRE declarou que não se deve escrever freeze sobre `3342a1d`. Congelar só N1, N2 e N3 exigiria mudar o verificador depois da reverificação e congelar bytes que um juiz chamou de `NOT_READY`. Não fiz isso. O SSCTR também não emitiu registro: ele só emite depois de ler a reverificação da QRE, e os três registros valeriam sobre bytes que a próxima correção vai mudar.

**Decisão que cabe ao Founder.**
- **(A) Recomendada.** Autorizar um ciclo estreito só para N4, pelos seis critérios acima, com uma reverificação dos dois juízes. Depois, registros para as quatro fronteiras e um freeze único.
- **(B)** Congelar agora N1, N2 e N3 com N4 implementada, desligada e não aprovada, como a linha fez com a revisão de ritmo no Race Forecast. Exige ajustar o verificador e uma confirmação focal dos juízes. Custo: habilitar N4 depois vira mudança de regras para todo plano construído antes.
- **(C)** Deixar N4 fora da V1 e retirar o código dela. É a mais lenta, porque muda de novo o arquivo emendado.

## 4. Condições e abertos, com dono

**Antes de qualquer uso não sintético ou integração** (os juízes aceitaram para uso sintético):
- **Planos anteriores às regras (SSCTR-STR-A-03):** não há migração. Um plano construído antes mantém a prancha em repetições. Ou todo plano nasce sob a regra, ou a migração é feita e revista.
- **Plano sob regras que mudaram (SSCTR-STR-A-04b, QRE-STR-A-05):** só a resposta clínica passa. Falta um caminho de continuação.
- **Data de revisão (SSCTR-STR-A-05):** o runtime não lê "revisar até 2027-04-30".
- **Roteamento (QRE-STR-A-04):** só o novo ponto de entrada faz valer o binding do plano. A custódia de referência ainda chama `v1-index.mjs`; pelo ponto de entrada congelado, uma mudança de equipamento devolve a prancha a um plano construído sob a regra.
- **Exposição (N3):** a semântica de dados (G03) revê o número executado antes de qualquer tela; ele se descreve como "séries registradas nas sessões desta semana".
- **Revisão focal de Segurança:** dispensada agora pela QRE; necessária na integração.

**Para a próxima correção de N4, além dos seis critérios:** `--check` logo depois de `--write` acusa o próprio registro como não rastreado até o commit (QRE-STR-B-02); uma autoridade de desenvolvimento sem `knownLimitations` faz `generateProgram` lançar erro (QRE-STR-B-03, só caminho de desenvolvimento); a declaração do slot de tronco vazio aparece numa resposta recusada e não cobre o conjunto de templates de iniciante (mutantes X2-09 e X2-11); os valores descrevem a regra de planos em campos que o runtime não lê (SSCTR-STR-B-04).

**Perguntas pré-existentes do motor congelado, não deste candidato (SSCTR-STR-A-11), para o Founder encaminhar:**
- Um exercício que é MAIN numa sessão e acessório em outra divide um estado de dose. Sem regra nenhuma, um avanço como MAIN já sai a 3×7 em objetivo de força.
- Com 30 a 45 minutos por sessão, o motor já deixa mais de mil semanas dos planos testados sem linha de tronco.

**Consequência de produto a saber (D-13, aceita pelo SSCTR para planos novos):** quem começa do zero não recebe a alternância de planos no primeiro plano. Ela começaria num plano posterior, e só se os fatos do intake mudarem (um reinício a partir do registro mantém a classe NONE).

**Fila humana:** os itens `HQ-SI-V1-SSCTR-SQ-1` a `SQ-4` continuam apenas propostos. Nenhum gate foi fechado e nada foi publicado. Não houve validação humana, empírica ou clínica.

## 5. Estado da linha

- Branch `claude/v1-strength-corrections`, worktree `.claude/worktrees/v1-strength-corrections`, a partir de `2dfa216`. Nada enviado, nada mesclado. A linha congelada `claude/v1-run-extensions` não foi tocada.
- Commits: `87df347` (pacote da fundação), `21838cb` (candidato), `4af0653` (rodada 1 como recebida), `3342a1d` (ciclo corretivo), `c1499be` (reverificação como recebida), e este encerramento.
- O que existe: um arquivo congelado emendado (`CoachingCore/src/r7b-repertoire.mjs`, 43 linhas a mais e 11 a menos), valores, dois módulos novos, o verificador próprio e 64 testes. Sem registro de habilitação, tudo isso fica inerte: toda resposta é a do ponto de entrada de baixo.
- Os testes da regra de planos rodam sob autoridade de desenvolvimento e fixam o comportamento de uma regra **não aprovada**. O teste "SQ-4 c5 (SSCTR-STR-A-08)" fixa justamente a leitura D-15 que os juízes rejeitaram. Não são aprovação.
- Dois testes históricos de freeze falham nesta linha por desenho e ficam verdes no próprio snapshot. Nunca anunciar suíte toda verde aqui.
- Não foram tocados: Figma, HealthKit, onboarding visual, Race Forecast, Run Workout Structure, fila humana, `product/`, `canon/`.

## 6. Registros desta missão

| Arquivo | Papel |
|---|---|
| `candidate/V1STR_CANDIDATE.md` | registro do autor sobre o candidato `21838cb` (leituras D-1 a D-12) |
| `candidate/V1STR_CORRECTIVE_CYCLE.md` | registro do autor sobre o ciclo `3342a1d` (leituras D-13 a D-17) |
| `candidate/reviews/qre/` | revisão R1 e reverificação R2 da QRE, com probes e saídas |
| `candidate/reviews/ssctr/` | revisão R1 e reverificação R2 do SSCTR |
| `candidate/probes/probe-v1str.mjs` | a probe da fundação no novo ponto de entrada |
| este arquivo | encerramento |
