# F10 · Perfil, configurações, consentimentos, privacidade e zonas de FC

**Situação:** IMPLEMENTADO em C (inc. 06 `4dc51a7`) com fixtures · exclusão real depende de A (ErasureFence em andamento). Issue: #13.

**Objetivo.** O atleta controla consentimentos, apaga dados de saúde ou a conta, e vê/ajusta as zonas de FC calculadas pelo motor.

**Comportamento.** Consentimentos por finalidade (`setConsent`); apagar fatos de saúde (`eraseHealthFacts`); excluir conta (`eraseAccount`
→ rota "conta excluída", apaga gravações de C, registro de A, fila de B). Zonas: estimadas pela idade (padrão), máximo declarado, limites
personalizados (60–230 bpm, validados pelo motor), cinta, laboratório (só onboarding), conflito mostra os dois valores, sem zonas com motivo
(`AGE_REQUIRED`, `HOLD_NO_PRESCRIPTION`…), apagar perfil de FC.

**Aceite.** Nenhum percentual inventado em limites personalizados · erro do motor mapeado ao campo (`hr.error.*`) · exclusão não deixa nada em
memória nem em disco.

**Contratos.** `HeartRateFiveZones`, `setHeartRateProfile`, `eraseHeartRateProfile`, `setConsent`, `eraseAccount`.
**Figma.** 71 `1102:4302`, `760:1484`, `1102:4428`, `760:1611`, `760:1693`, `845:4225`.

**Testes.** `testAgeEstimateZonesMatchTheFixture`, `testCustomLimitsHaveNoPercentages`, `testConflictShowsBothValuesAndNoAgeShowsReason`,
`testDeclaredMaximumSavedAndInvalidLimitsRefusedByTheEngine`, `testEraseAccountReachesTheErasedState`; unit `testDiscardAndEraseAll`.

**Pendente.** `ProfileViewModel`, `HeartRateZonesViewModel` · telas de conta sobre `AccountService` (depende de #28) · semântica final de
exclusão e reinscrição após exclusão (A) · evidência pós-onboarding (`UNSUPPORTED_V1`).
