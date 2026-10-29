# R6 — núcleo de coaching offline Node24

**Estado no fechamento (2026-10-27):** a R6 fechou **com bloqueio explícito**. O SSCTR negou o FREEZE-2 na rodada 12, a última permitida pela regra do Founder, por dois bloqueios só de runtime (D53 no caminho "a partir do log" e D54). O runtime em `../src/` traz todas as correções posteriores ao FREEZE-1, mas **não está congelado**. A evidência oficial (a primeira avaliação do holdout, as simulações, as demonstrações e o replay R5) continua presa ao FREEZE-1. Próximo passo: DOMAIN_COACHING_R7 (ver [OPEN_GAPS_R6.md](OPEN_GAPS_R6.md)).

Leia primeiro [FINAL_REPORT.md](FINAL_REPORT.md), depois [READINESS_VERDICTS_R6.json](READINESS_VERDICTS_R6.json), [VERIFICATION.json](VERIFICATION.json), [PROGRAM_QUALITY_R6.md](PROGRAM_QUALITY_R6.md) e [OPEN_GAPS_R6.md](OPEN_GAPS_R6.md). O índice de entregáveis com SHA-256 está em [DELIVERABLE_INDEX_R6.json](DELIVERABLE_INDEX_R6.json).

Entry point: `../src/r6-index.mjs` (intake → programa completo → adaptação → aprendizado). Política revisada: [PROGRAM_POLICY_R6.json](PROGRAM_POLICY_R6.json), habilitada por boundary pela revisão SSCTR e vinculada ao hash exato da política. Runtime congelado: [RUNTIME_FREEZE_R6.json](RUNTIME_FREEZE_R6.json).

Comandos (no diretório CoachingCore):
- `node --test` — suíte completa;
- `npm run simulate` — simulador de programa inteiro (R6);
- `npm run verify` — verificação objetiva somente leitura (R6);
- `npm run verify:r6-write` — grava só `r6/VERIFICATION.json`.

Os aliases históricos (`verify:r5-historical` etc.) regeneram evidência fechada e não fazem parte do fechamento do R6; veja [CONFORMANCE_SUPERSESSION_R6.md](CONFORMANCE_SUPERSESSION_R6.md).

Holdout novo: [holdout/](holdout/) (interface, corpus selado, manifesto de independência, primeira avaliação bruta). Regressão do holdout R5: [R5_HOLDOUT_REGRESSION_R6.md](R5_HOLDOUT_REGRESSION_R6.md).

Referência sintética de shadow. Não autoriza atleta real, produção, UI, Figma ou KMP.
