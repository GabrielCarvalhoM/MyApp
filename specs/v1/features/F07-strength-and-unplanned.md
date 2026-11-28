# F07 · Registro de musculação e treinos avulsos

**Situação:** IMPLEMENTADO em C (inc. 04, correções inc. 08) · spec de manutenção. Issue: #12.

**Objetivo.** Registrar a sessão de força planejada e treinos fora do plano (corrida ou força) sem inventar dados.

**Comportamento.** Força: séries com carga prescrita visível; RIR, repetições e minutos **digitados pelo atleta** (nada copiado da prescrição);
salvar desabilitado até os minutos. Avulso de força: `observedAt` obrigatório; salvo só quando o motor devolve `WriteOutcome.kept`.
Corrida avulsa ("Correr agora"): pergunta de sintomas antes; relato sem `stop`; **não inicia** sob bloqueio, fora do escopo, clínico ou
triagem pendente (decisão provisória do fundador, QRE P1-11).

**Aceite.** Pedido igual ao contrato (`RequestShapeTests`) · avulso sem `observedAt` não é aceito · nenhum valor default.

**Contratos.** `ReviewRequest.sessionReports`, `LoggedEntry.unplannedMerge`. **Figma.** 41 `665:486`; 40 `661:1215`, `661:1289`; 50 `684:4381`.

**Testes.** `testUnplannedStrengthSavedOnlyWhenKept`, `testUnplannedRunIsNotStartedUnderAHold`,
`testUnplannedRunAsksTheSymptomQuestionAndOpensNotFeeling100`; unit `testUnplannedRunHasObservedAtSportAndNoStop`,
`testUnplannedStrengthKeptOnlyWithObservedAt`.

**Pendente.** `StrengthLogViewModel` · iPhone.
