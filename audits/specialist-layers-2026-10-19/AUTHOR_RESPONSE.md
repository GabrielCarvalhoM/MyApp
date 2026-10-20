# Correção localizada r1 → r2

2026-10-19 · SIL-20261019-r1 · autor Codex `/root`, não judge.

| Finding | Disposição / alteração | Prova esperada |
|---|---|---|
| UXR-01 / ENG-SIL-01 (mesma raiz, material) | CORRECT: SIS §7, AEOS §2.1 e AESL SIL-S12 conservam evento de agência no DecisionTrace/StabilityState, com revisão executada, proposta/razões de STALE e fronteira do início. Composto inteiro fica STALE. Não repropor alteração ao restante sem fato material surgido depois do início; início/replay/novo ID/conjunto não bastam. Demais sessões seguem sucessor normal e safety é imediato. | Judge verifica compatibilidade com CONF-16/UPSTREAM-ISSUE-04; nova fixture futura testa não reproposta sem depender só da guarda de commit. UX_SPECIFICATION e missão ficam intactas. |
| ENG-SIL-02 (baixo) | CORRECT: referência AEOS `SIS-I1–I5` → `SIL-I1–I5`. | IDs correspondem aos definidos em SIS §5. |
| R-NB01 (editorial) | CORRECT agora: cabeçalho PDR distingue fonte do baseline de fonte do amendment atual. | Link/autoridade/data coerentes, sem decisão normativa nova. |

Revisões semânticas afetadas: SIS-1.0-r2, AEOS-1.1-r2, AESL-1.1-r2. Índice/registro sincronizam esses rótulos; PDR mantém 1.2, mesma decisão e fonte agora inequívoca. Outros documentos idênticos aos hashes r1. R1/FAILs preservados em `*_REVIEW_r1.md`; inputs substituídos recuperáveis em `review-inputs-r1/` com manifest/checagem originais. REVIEW_INPUTS.json agora fixa os 13 hashes correntes. PRE_REVIEW_VERIFICATION_r2.json: **424 PASS / 0 FAIL**. Sem segunda rodada de autoria além desta; delta revalidado somente nos domínios afetados.

UPSTREAM-ISSUE-04 recebe o detalhamento na cópia isolada; não se presume aceite do Claude/owner no checkout ativo. Nenhum outro issue/FD da UX é resolvido, removido ou reaberto por esta correção. Nenhuma implementação ou teste de runtime foi realizado.
