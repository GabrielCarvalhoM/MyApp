# F09 · Histórico e Progresso

**Situação:** IMPLEMENTADO em C (inc. 05 `894c4fe`) com fixtures · histórico real depende de A + B. Issue: #13.

**Objetivo.** Mostrar o que foi feito, separando o medido, o declarado e o contestado; mostrar evolução com faixa antes do número.

**Comportamento.** Histórico: `loggedEntries`; cada linha mostra todas as "vozes" (medido pelo iPhone, importado do Apple Saúde, declarado
pelo atleta); conflito mostra todas; "Distância parece errada?" → `actual.declared`; correção a partir da voz do atleta; status do Apple Saúde
("nada recebido", nunca "negado"). Progresso: `Readings` (`estimates`, `runForecast`) com faixa primeiro; barras de volume animadas.

**Estados.** vazio · lista · detalhe · conflito · importado · fila do Apple Saúde · erro.

**Contratos.** `loggedEntries`, `history`, `HealthIngestStatusSource.status()`. **Figma.** 50 histórico; 60 estimativas; 81 importados.

**Testes.** `testHistoryKeepsMeasuredDeclaredAndContestedApart`, `testConflictedRowShowsEveryVoice`, `testEmptyHistory`,
`testProgressRangeFirstAndPlanScenario`.

**Pendente.** `HistoryCorrectionViewModel` · excluir relato/remover importado (#27, V2 por padrão) · "Tempo por zona" (C10, `[FUTURO]`) ·
dados reais (#16, #17).
