# DOMAIN_COACHING_R6 — Relatório final

**Situação:** a R6 **fecha com bloqueio explícito**. O próximo passo é a **DOMAIN_COACHING_R7**.
- **Data:** 2026-10-27.
- **Escopo:** referência offline, sintética, Node 24, em modo sombra. Não há efeito em produção, em planos reais, em UI, no Figma nem em KMP.
- **Validação:** nenhuma afirmação de validação humana, empírica ou clínica.

## Resumo

Depois do FREEZE-1, o runtime recebeu as correções:
- dos 23 achados da revisão de engenharia;
- dos defeitos D42–D53 apontados pelo SSCTR nas rodadas 7–11;
- de três problemas encontrados pelo próprio autor.

O SSCTR, porém, **negou o FREEZE-2** na rodada 12, que era o último ciclo permitido pela regra do Founder (`../../audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`). Ficaram dois bloqueios, ambos só de runtime:
- **D53, no caminho "a partir do log".** Depois de re-estabelecer um exercício cuja carga ainda espera confirmação, ou que foi feito sem carga registrada, a série extra do fim do bloco volta de uma vez: de 2 para 4 séries.
- **D54.** A linha de re-estabelecimento ignora as doses reduzidas do polimento, da semana da prova e da semana pós-prova. Prescreve 2 séries a RIR 3 onde a dose da fase é 1 série a RIR ≥ 4.

O juiz independente de qualidade de coaching avaliou a única avaliação do holdout novo, feita no FREEZE-1, e chegou a **QUALITY_BLOCKED**:
- **Arquitetura:** não há buraco de arquitetura;
- **Semântica do núcleo:** há defeitos, como a fusão de evidências no cold start, a progressão, o estado de semanas sem revisão e o conflito de turno;
- **Athlete Model:** não muda nenhuma decisão.

Por isso, nenhum veredito fica READY.

## 1. Holdout R5: antes e depois

Revisão independente da regressão R5 (`audits/…/reviews/r5-regression-review.json`), feita sobre o replay do FREEZE-1, com os fatos inalterados:

| Classe | R5 | R6 (FREEZE-1) |
|---|---|---|
| BEST_SUPPORTED | 4 | 11 |
| ACCEPTABLE_ALTERNATIVE | 4 | 10 |
| SUBOPTIMAL | 3 | 0 |
| INSUFFICIENT_INFORMATION | 6 | 2 |
| UNSUPPORTED | 7 | 0 |
| CLINICAL_OUT_OF_SCOPE | 0 | 1 |

- **Gate da regressão:** QUALITY_READY_WITH_CONDITIONS.
- **No runtime atual, não congelado:** o replay de desenvolvimento difere do replay julgado em 8 casos (H01, H07, H08, H10, H12, H14, H17, H22), só na linha de aquecimento do dia da prova (D43(c)). Esses casos não foram reclassificados, porque não existe FREEZE-2.

## 2. Holdout novo da R6

- **Autoria e selo:** 35 casos, escritos e selados por um autor independente que nunca viu o runtime. O corpus é `49a85b8c…`.
- **Avaliação:** rodou **uma única vez**, no FREEZE-1 (`FIRST_EVALUATION.json`, sha256 `b3d155b6…`), com 0 erros. O autor do runtime nunca abriu o conteúdo.
- **Sem nova rodada:** não houve nova avaliação pós-correção, porque ela dependia do FREEZE-2, que foi negado.
- **Integridade:** o juiz conferiu tudo e o resultado bate.

## 3. Distribuição do holdout novo

Primeira avaliação, segundo o juiz independente:

| Classe | Casos |
|---|---|
| BEST_SUPPORTED | 4 |
| ACCEPTABLE_ALTERNATIVE | 14 |
| SUBOPTIMAL | 9 |
| INSUFFICIENT_INFORMATION | 1 |
| UNSUPPORTED | 4 (H01, H03, H23, H25) |
| CLINICAL_OUT_OF_SCOPE | 2 |
| CORPUS_ERROR | 1 (H20) |

- Ao todo, 21 dos 35 casos têm bom resultado ou o encaminhamento correto.
- Sem as semanas que o holdout deixou sem revisão (lacuna R18), o H25 passa a ACCEPTABLE.

## 4. Cold start

- **Família dedicada, a mais fraca:** de 9 perfis, 2 ficaram aceitáveis, 5 subótimos e 2 sem suporte.
- **Os 17 casos que só geram programa:**
  - programas completos: 5, dos quais 2 aceitáveis ou melhores;
  - carga estabelecida por esforço primeiro: 5, dos quais 1 aceitável ou melhor;
  - ASK legítimo: 2;
  - encaminhamento clínico ou de escopo correto: 3;
  - incompletos ou sem suporte: 2.
- **Principal achado (CQ-R6-01, alta):** a fusão entre o histórico do relógio e o autorrelato falha nas duas direções.
  - H01: o histórico de 8 semanas tinha só 10 dias de dados, e o motor programou corridas curtas demais.
  - H07: o motor confiou no autorrelato de 200 min/semana, contra um relógio que mostrava 95–127 min.
- **Funciona bem** para o corredor intermediário com autorrelato e para quem já sabe as próprias cargas.

## 5. Qualidade do programa inteiro

Foram 30 programas gerados (`PROGRAM_QUALITY_R6.md`):

| Classe | Programas |
|---|---|
| BEST_SUPPORTED | 7 |
| ACCEPTABLE | 13 |
| SUBOPTIMAL | 8 |
| INCOMPLETE | 1 (H03) |
| UNSUPPORTED | 1 (H01) |

- Todos são estruturalmente completos: têm fases, polimento, semana da prova e semana pós-prova.
- Os 7 melhores são do mesmo perfil.
- A progressão às vezes fica plana (CQ-R6-02). O D50 corrige parte disso no runtime atual, mas a correção não está congelada nem foi verificada no holdout.

## 6. Balanced

- **H15, sem prioridade declarada:** BEST_SUPPORTED. O arranjo está correto.
- **H16, dois objetivos de desempenho e três noites:** SUBOPTIMAL. Houve empilhamento sem confirmação, prioridade JOINT sem escolha explícita e levantamento pesado de quadril antes do longão.
- **Critério do KMP:** PARTLY_MET.

## 7. Retorno após pausa

- **Casos:** H26 aceitável, H27 subótimo, H28 com encaminhamento clínico correto.
- **Critério "retorno não clínico funciona":** MET. Uma pausa de 5 dias retoma com re-estabelecimento mínimo, uma de 17 dias reentra perto de 60% com controle por evidência, e um recomeço depois de 11 semanas parte da corrida atual. Doença vai para um humano.
- **Veredito:** PARTIAL, porque o runtime não está congelado e, antes de qualquer uso além da referência offline, ainda precisam fechar:
  - a triagem clínica de texto livre (R11, R15);
  - a R14;
  - a R18.

## 8. Evento e semana da prova

- **Casos:** H29 e H30 aceitáveis.
- **O que funciona:** todo programa de prova tem polimento, semana da prova e semana pós-prova.
- **O que falta:**
  - **CQ-R6-06 (alta):** atletas preparados só com caminhada e trote recebiam a prova em ritmo de prova, com acelerações. O D43(c) e o D47 tratam disso, mas só segundo o dossiê; não foi verificado no holdout.
  - **D54:** bloqueia o freeze.
- **Critério do KMP:** PARTLY_MET.

## 9. Substituição

- **O que funciona:** a janela temporária de equipamento troca o exercício pelo mesmo padrão de movimento, não mexe na corrida, sobrevive a uma mudança de fuso e depois reverte.
- **O que falha:** a opção de puxada com peso do corpo nunca é escolhida (CQ-R6-12).
- **Limite da evidência:** o holdout tem um único caso de substituição.
- **Critério do KMP:** PARTLY_MET.

## 10. Aprendizado do atleta

- **Atualizações:** 9 válidas e 5 que ignoraram histórico relevante.
- **Erros:** nenhum overfit, nenhuma contaminação por duplicata e nenhuma causalidade falsa.
- **O problema:** nenhum padrão aprendido mudou alguma decisão (CQ-R6-14).
- **Critério do KMP:** NOT_MET.

## 11. Bugs corrigidos

Tudo isto vale para o runtime atual, que **não está congelado**. A suíte tem 443 testes, todos passando.

- **Engenharia:** os 23 achados QRE-R6-01…23 da revisão do FREEZE-1, cada um com seu teste.
- **SSCTR, rodadas 7–11:**
  - D42–D49, respondidos nas políticas R6-POLICY-4 e R6-POLICY-5;
  - D50 e D51, só de runtime;
  - D52, só de runtime: o estado de força passa a seguir as execuções, e o relógio de 28 dias conta a partir da última execução;
  - D53 no caminho da carga conhecida;
  - as recomendações R6, R7 e R9–R13.
- **Encontrados pelo autor:**
  - a semana de entrada do retorno;
  - o histórico de corrida apagado num recomeço;
  - um relato em conflito que deixa de definir ou confirmar carga.
- **Política em vigor:** R6-POLICY-5 (`18ec48f3…`). Os 10 registros estão APPROVE_WITH_CONDITIONS.

## 12. Lacunas restantes

Ao todo são 55 itens, listados em `OPEN_GAPS_R6.md`. Os principais:

| Grupo | Itens |
|---|---|
| Bloqueio | D53 (caminho "a partir do log"), D54 e o FREEZE-2 negado |
| Não executado, por exigir FREEZE-2 | a nova avaliação pós-correção, a revisão de engenharia e a reclassificação do R5 |
| Do SSCTR | R18 (semanas sem revisão contam como executadas), R11/R15 (triagem clínica de texto livre), R14, R16, R17 e R19 |
| Do juiz | 19 achados, 6 de severidade alta (CQ-R6-01 a 06) |
| Produto e dados | G03, consentimento de aprendizado, plausibilidade de carga, exibição em libras (DR-114) e rotação de variantes próximas |

## 13. PRODUCTION_CORE_SEMANTIC_STABILITY = NOT_READY

Por quê, exatamente:
- o runtime corrigido não está congelado;
- depois de doze rodadas do SSCTR ainda restam dois bloqueios de runtime (D53 e D54);
- o juiz encontrou defeitos na semântica do núcleo, por onde todo atleta passa: fusão de evidências no cold start, progressão, estado de semanas sem revisão e conflito de turno.

## 14. KMP_PRODUCTION_CORE_PREP_READINESS = NOT_READY

- A regra do Founder exige todos os critérios cumpridos.
- O juiz avalia **1 de 10** como MET (o retorno), 7 como PARTLY_MET e 2 como NOT_MET: o Athlete Model inerte e as lacunas que não são de borda.
- Também não existe runtime congelado para migrar.

## 15. NEXT_ENGINEERING_STEP = DOMAIN_COACHING_R7

A R7 começa assim:
1. Corrigir o D53 em todos os modos de estado e o D54, sem mudar a política, que é o próximo passo dado pelo SSCTR.
2. Fazer a checagem estreita do SSCTR no hash `18ec48f3`, ou a revisão completa de um hash novo se a política mudar.
3. Congelar o runtime e fazer a revisão independente de engenharia.
4. Fechar a R18 com Produto e Dados.
5. Tratar os achados altos do juiz (CQ-R6-01 a 06) antes de qualquer preparação de KMP.
6. Usar um holdout novo e não visto, porque o da R6 só serve como reuso de desafio.

A R7 precisa de uma missão própria, autorizada pelo Founder; a R6 não a inicia.

## Verificação

`VERIFICATION.json` mostra o estado objetivo no fechamento: **10 de 14 checagens passam**. Nenhuma checagem foi relaxada para passar.

**Passam:** a linha de base preservada, os comandos do pacote, a autoridade do SSCTR, o holdout novo, as demonstrações, os entregáveis, os vereditos, a fila humana, a ausência de escopo proibido e os **443 testes**.

**As 4 falhas são consequência direta do bloqueio:**

| Checagem | Por que falha |
|---|---|
| `runtime-freeze` | O runtime corrigido difere do FREEZE-1 porque não foi congelado: o FREEZE-2 foi negado. |
| `r5-regression` | O replay oficial do R5 continua preso à política do FREEZE-1, e não à atual. Os fatos estão inalterados, com 0 erros. |
| `simulation` | A simulação oficial também é a do FREEZE-1. As 14 trajetórias passam em todas as invariantes. |
| `independent-reviews` | A revisão de engenharia do FREEZE-2 não existe, porque não houve FREEZE-2. |

**Incidente no fechamento, corrigido.** O `queue-r6.mjs` gravou a fila e só depois falhou numa checagem de prefixo de bytes. A checagem estava errada, porque `queue_revision` vem antes de `items` no arquivo.
- A fila foi restaurada exatamente ao original, com o sha conferido contra o que o OB-2 registrou.
- A checagem passou a reconstruir o original e comparar o sha antes de gravar qualquer coisa.
- A integração rodou de novo: 114 → 127 itens, os anteriores idênticos byte a byte.

## Disciplina do processo

- Avaliação: a primeira avaliação rodou uma só vez e nunca foi refeita; o autor do runtime nunca viu o corpus nem as saídas.
- Julgamento: o autor nunca julgou o próprio trabalho. Os juízes foram o SSCTR, o autor independente do holdout, o juiz de engenharia e o juiz de qualidade de coaching.
- O que não foi tocado: `product/`, `canon/`, UI, Figma, KMP e produção.
- Commits: nenhum commit, merge ou deploy.
