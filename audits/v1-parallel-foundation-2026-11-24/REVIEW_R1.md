# Revisão independente R1 da fundação paralela (2026-11-24)

**Revisor:** um agente independente, só leitura, que recebeu o código e as fontes congeladas, não as conclusões do autor (worker ≠ judge).
**Escopo:** contrato, handoffs, `ios/Packages/IntegrationContracts`, `tools/device-lock/with-device.sh` contra `CoachingCore/src/boundary/*.mjs` e os handoffs congelados.
**Achados sem problema, segundo o revisor:** chaves, enums e limites DEVICE; `idOk`; o caminho `UNKNOWN_SESSION`/`SPORT_MISMATCH`; a troca de id após `CONFLICT_STALE_VERSION`/`REQUEST_ID_REUSED`; nenhum arquivo reivindicado pelas duas frentes.

| # | Sev. | Achado | Verificado pelo autor | Disposição |
|---|---|---|---|---|
| 1 | HIGH | Reenviar um chunk `NOT_RECORDED` com o mesmo `deliveryId` devolve a resposta guardada para sempre (o ASK é gravado como request; `custody.mjs` `seen` → `replayed`) | sim (`custody.mjs`, `submit`) | **corrigido**: id reutilizado só após morte, `hostUnavailable` ou `retryLater`; UUID novo depois de qualquer outra resposta (contrato §6.2, `DeviceDelivery`, handoff B §4.7, teste obrigatório B §7.4) |
| 2 | MED | O teto de tentativas transformava uma espera legítima (ASK, HOLD) em perda | sim | **corrigido**: `NOT_RECORDED` reenviado só após `deliveryConditionsChanged()`; `waiting` e `halted` não contam |
| 3 | MED | `observedAt` com o fuso atual do aparelho não é determinístico, e entra no digest dos fatos | sim (`factsDigest`) | **corrigido**: offset de `HKMetadataKeyTimeZone`, senão UTC; reenvio com os bytes da primeira entrega |
| 4 | LOW | "Mesmo id, outros fatos = correção" impreciso: `sourceQuality` fora do digest; outro `sessionId` dá `ACTIVITY_LINKED_ELSEWHERE` | sim | **corrigido** no contrato §4.1 (5) e em `DeviceActivity` |
| 5 | MED | Recusa D1 (> 300 s à frente) sem código, mapeamento nem sinal | — | **corrigido**: `HostCode.clockAheadOfReference` → `waiting`; sinal em §4.2; teste em A |
| 6 | MED | `purge` concorrendo com entrega em voo poderia regravar dados apagados (G07) | — | **corrigido**: geração de purge em `DeviceQueueControl.purge`, contrato §6.2, handoff B |
| 7 | HIGH | A retomada de trava órfã por `mkdir` permitia dois donos | sim (raciocínio verificado) | **corrigido**: reescrito sobre `flock` de kernel herdado pelo comando (`exec`), sem retomada |
| 8 | MED | A trava registrava o pid do wrapper, não o do comando | sim | **corrigido** pelo mesmo desenho; um primeiro uso de `/usr/bin/lockf` foi descartado porque o teste mostrou que o macOS não passa o descritor ao comando |
| 9 | LOW | A tag-base e o relatório de consolidação não existiam | sim | **feito** nesta missão (tag `v1-parallel-base-2026-11-24`, `CONSOLIDATION_REPORT.md`) |

Não houve segunda rodada de revisão. As correções foram verificadas pelos testes (`results/`).
