# Qualidade de código e arquitetura

Critérios que o revisor independente aplica a todo incremento Swift. Arquitetura de referência: [../ARCHITECTURE.md](../ARCHITECTURE.md).

## 1. Camadas
- View não chama porta de escrita, serviço, persistência nem regra esportiva. Lê estado e envia eventos ao ViewModel.
- Tela com escrita/formulário/envio tem ViewModel `@Observable @MainActor`, dependências pelo inicializador.
- Domain (contratos) não importa SwiftUI, HealthKit, CoreLocation nem implementação concreta.
- Regra esportiva (prescrição, intensidade, zonas, progressão, gates, validação de faixa) **só no CoachingCore**. Swift apresenta o que a
  porta devolve. Nada de default inventado (idade, RIR, repetições, motivo de parada, carga sugerida).
- Status/código desconhecido do motor **falha fechado** (não inicia, não mostra prescrição).

## 2. Estado
- Estado de tela por `enum`, não por combinação de booleanos.
- Envio idempotente na UI: um envio por vez; botão desabilitado em `.submitting`.
- Após escrita bem-sucedida, a leitura é refeita a partir da porta (nunca mostrar a apresentação anterior à escrita).

## 3. Concorrência e memória
- `@MainActor` para estado observado; portas `Sendable`; nenhum `@unchecked Sendable` novo sem justificativa no código.
- Sem I/O de disco ou JSON grande na main thread.
- `Task` guardada é cancelada quando o resultado perde sentido; closures que capturam `self` em objetos de vida longa usam `[weak self]`.

## 4. Organização e nomes
- Pasta por feature e camada (ARCHITECTURE §5); sem arquivos vazios ou wrappers de uma linha.
- Nomes expressivos; comentários explicam decisão, não o óbvio.
- Sem lógica duplicada entre features: componente → `DesignSystem/`, formatação → `Fmt`, cópia → `Copy/`.

## 5. Tamanho de arquivo
- **Limite 350 linhas** por arquivo Swift escrito à mão; **aviso a partir de 300**.
- Automatizado: `node tools/orchestration/swift-size.mjs` (CI, job "Repository integrity"). Arquivo novo acima de 350 falha.
- Legado inventariado em 26/11 (`tools/orchestration/swift-size-baseline.json`) é reportado sem falhar; sai da lista quando dividido.
  Nunca acrescente um arquivo ao baseline para passar no CI.
- Exceção justificada: `// swift-size-exception: <motivo>` nas 10 primeiras linhas (ex.: tabela exaustiva). O revisor julga o motivo.
- Não se aplica a gerados, a JS do CoachingCore nem a não-Swift.

| Legado (26/11) | Linhas | Frente | Divisão planejada |
|---|---|---|---|
| `RepMileUI/Features/Plan/PlanScreen.swift` | 395 | C | semana / mês / fases em arquivos próprios |
| ~~`RepMileUI/Features/Onboarding/OnboardingFlow.swift`~~ | ~~378~~ → 122 | C | **feito** no #32.1 (PR #43) |
| `RepMileUI/Features/Session/SessionDetailView.swift` | 354 | C | corrida / força |
| `CoachingHost/Sources/CoachingHost/Ports.swift` | 370 | A | após a entrega final de A |
| `CoachingHost/Sources/CoachingHost/CoachingHost.swift` | 354 | A | entrega final `296a435` (anterior à regra na branch de A) |
| `CoachingHost/Tests/CoachingHostTests/ErasureTests.swift` | 401 | A | idem |
| `HealthKitIngest/Sources/HealthKitIngest/HealthKitIngestor.swift` | 796 | B | após a entrega final de B |
| `HealthKitIngest/Tests/HealthKitIngestTests/ThirdPartyImportTests.swift` | 415 | B | após a entrega final de B |

## 6. Migração
Incremental, por feature, com o comportamento preservado: os XCUITests e testes unitários existentes passam antes e depois sem
alteração de asserções (mudança de asserção exige justificativa no PR). Nunca reescrever o app inteiro; nunca mudar o design para
facilitar refatoração.
