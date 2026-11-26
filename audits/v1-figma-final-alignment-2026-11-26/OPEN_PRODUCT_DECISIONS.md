# Open product decisions (affect the Figma)

These decisions cannot be inferred from the contracts. None of them blocks C from starting. Each has a V1 default already applied in the Figma.

| # | Decision | Owner | Options | V1 default applied | Impact if it changes |
|---|---|---|---|---|---|
| 1 | **DR-121:** the app writes its own run to Apple Saúde (`HKWorkout` + route) | FDR + SEC | (a) it does not write (current); (b) it writes, and B imports it through the DEVICE channel | (a): label "medido pelo iPhone · não usado pelo plano"; the coach reading uses time and effort | With (b), the iPhone distance and pace enter the plan. The labels on 50 `880:19765`, `880:20729` and `682:2528` go back to "GPS do iPhone", and the reading can cite pace. |
| 2 | **GAP-17:** read sleep, HRV and resting HR for display only | FDR + SEC | (a) not in V1; (b) display only, never sent to the engine | (a): the frames carry an annotation or the `[FUTURO]` tag; Hoje follows `880:4257` | With (b), the Hoje frames with "Sono 7h10 · VFC" and 72 "Sinais do relógio" become V1, and new HealthKit permissions are needed. |
| 3 | **Heart rate from HealthKit** (needed for C10 "Tempo por zona") | FDR + SEC + SSCTR (C10) | (a) not requested in V1; (b) requested now, used only after C10 | (a): the HR row on 81 is annotated as hidden | With (b), 81 shows the row and 50 keeps the block hidden until C10. |
| 4 | **GAP-36:** height and weight in onboarding (10 `836:2649`) | FDR + SEC | (a) the screen leaves the flow (minimization); (b) kept as local data only | Annotated as pending; screen unchanged | With (a), the onboarding has one step fewer (not applied, because it removes an approved screen). |
| 5 | **OPEN-1:** third-party sources and duplicates (81 `849:1066`) | FDR + SEC | rule for reading other apps | hidden | the duplicate sheet becomes V1 |
| 6 | **GAP-13:** delete a report or remove an imported workout | FDR (product) + A | (a) V2; (b) a reviewed boundary operation | (a): `[FUTURO]` on `683:2360`, `684:4669`, `687:4651`, `849:1153`; "Excluir" hidden on 50 | the delete actions on 50 and 81 come back |
| 7 | **Post-onboarding evidence** (lab, test, race for the HR reference: FND-HR5-01) | Core + SEC | open a reviewed input | `UNSUPPORTED_V1`; actions hidden on 71 `760:1693` | "Corrigir/Remover valores" and "registrar resultado" come back |
