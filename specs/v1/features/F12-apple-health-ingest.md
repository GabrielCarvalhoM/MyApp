# F12 · Apple Saúde — HealthKitIngest (frente B)

**Situação:** EM ANDAMENTO na sessão B (`claude/v1-ios-healthkit` @ `3af17d4`, política OPEN-1 2 publicada às 14:03 de 26/11). **Não
tocar.** Issues: #2 (acompanhamento), #16 (portas reais), #25 (contagem dupla digitada × relógio).

**Objetivo.** Importar do Apple Saúde as atividades do atleta (canal único de ingestão da V1), só leitura, com proveniência e sem contagem dupla.

**Política aprovada pelo fundador.** Corridas no Apple Saúde são importadas mesmo quando registradas por Garmin, Strava ou outro app. Preservar
origem/proveniência. Não rejeitar por `THIRD_PARTY_SOURCE`. Não contar duas vezes a mesma corrida física (inclusive de vários apps). Não fundir
corridas distintas só por proximidade de horário. Sem integração direta com fabricantes na V1.

**Já entregue (publicado).** Ingest só-leitura, normalização, link, fila persistente, dedupe, status, mapeamento de FC; HealthKitLab com
autorização, leitura ancorada, observer, exclusão; revisões R1/R2 corrigidas (reentrância); OPEN-1 política 2 (`99a74cf`, `3af17d4`).

**A verificar na entrega final.** Revisão independente da política 2 · testes de dedupe multi-app · idempotência · regras de dado manual e
confiança · decisão #25.

**Contratos.** `HealthIngestStatusSource`, `DeviceActivitySink`, `DeviceQueueControl`, `AppRecordingIndex.decision` (dedupe com a corrida do iPhone).

**Fora da V1.** Escrita no Apple Saúde (#23), sono/VFC/FC de repouso (#24), Garmin/COROS/Polar direto.
