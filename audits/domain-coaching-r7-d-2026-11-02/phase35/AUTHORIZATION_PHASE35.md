# R7-D Fase 3.5: resumo da autorização do Founder (2026-11-07)

Pedido direto do Founder, em continuidade à Fase 3.4 (`CLOSED_NOT_READY`, `a8dbc57`).

A prioridade é terminar um treinador híbrido funcional, competitivo e comercialmente viável, sem complexidade desnecessária. A fase é de fechamento, não de ampliação.

## Autorizado

1. **Os três bloqueios do Δ22 do PREREG-6** (SSCTR-P34R2-F01, SSCTR-P34R2-F02 e QRE2-P34-01):
   - só no runtime;
   - cada um com teste que falha em `46934a0` e passa na correção;
   - os controles existentes preservados;
   - as diferenças explicadas;
   - sem regressão de segurança ou progressão.
2. **Os instrumentos do Δ23:**
   - sensibilidade de SY1 e CU3;
   - retornos aninhados, QH4 incluído;
   - teste que fixa as doses de uma cadeia em dois níveis;
   - testes que matam N01 e N05;
   - NOT_EVALUABLE nunca convertido em PASS.

   Sem aumentar a suíte por quantidade.
3. **Duas decisões de produto a registrar:**
   - o posicionamento da V1;
   - o F08 inspirado no Runna.

   O registro está em `FOUNDER_DECISIONS_PHASE35.md`. O F08 tem nesta fase apenas preparação: o menor delta e a missão curta.
4. **Revisões e freeze:**
   - testes, regressão, conformidade, harness, sensibilidade e mutação proporcional;
   - comparação com `46934a0` e com o R7D-FREEZE-4;
   - uma instância nova do SSCTR e uma checagem independente de Quality/Reliability;
   - o `R7D-FREEZE-5`, com verificação, se as duas aprovarem.

## Não autorizado

- Phase 4 ou o holdout final.
- Mudar a V1 coaching authority.
- Abrir outra fase automaticamente.
- Mudar o produto, o design ou a UI/UX por causa do posicionamento.
- Alterar a governança G04 ou o runtime clínico.
- Pesquisa competitiva nova ou pesquisa jurídica extensa.
- Push, merge, apagar worktrees, editar freezes ou autoridades.
- Novas funcionalidades esportivas, novos números ou protocolos.

## Fila de revalidação humana

A Fase 3.5 não autoriza acréscimo à fila. Ela continua com 235 itens, e os itens da Fase 3.4 ficam só propostos.

## Se um bloqueio real persistir

- Sem freeze.
- O defeito é registrado com a consequência prática e a menor correção.
- Não se abre fase nova sem o Founder.
