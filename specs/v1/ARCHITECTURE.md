# Arquitetura iOS do RepMile V1

**SwiftUI + MVVM + Clean Architecture + modularização por responsabilidade.** Este documento descreve a arquitetura **real** (código em
`claude/v1-ios-swiftui` @ `a15e938`, A em `claude/v1-ios-coachinghost`, B em `claude/v1-ios-healthkit`) e o alvo para onde ela migra,
incrementalmente e sem mudar comportamento. Regras verificáveis: [quality/CODE_AND_ARCHITECTURE.md](quality/CODE_AND_ARCHITECTURE.md).

## 1. Módulos (Swift Packages) e quem é dono

```text
CoachingCore/ (JS, congelado) ── autoridade esportiva: prescrição, zonas, progressão, safety gates
        │  bundle de produção + app-projections (CoachingPresentation/Facade)
        ▼
ios/Packages/
  IntegrationContracts  (compartilhado §11)  portas: HealthIngestStatusSource, DeviceActivitySink, DeviceQueueControl,
                                              AppRecordingIndex, HeartRateSeriesSource, HealthSignalSource
  CoachingPresentation  (compartilhado §11)  portas CoachingReading / CoachingWriting, tipos de leitura (PlanView, Week,
                                              PresentationSnapshot, Startability, …), pedidos (ReviewRequest, OnboardingAnswers), fixtures
  CoachingHost          (A)  implementa CoachingReading/CoachingWriting sobre JavaScriptCore + o bundle; persistência protegida,
                              Keychain, relógio confiável, exclusão (ErasureFence)
  HealthKitIngest       (B)  implementa HealthIngestStatusSource + DeviceQueueControl (actor HealthKitIngestor); leitura só-leitura
                              do Apple Saúde, normalização, deduplicação, fila persistente
  RunRecorder           (C)  gravação de corrida no iPhone: CoreLocation, passos, pausa, retomada após morte do processo,
                              arquivo protegido; implementa AppRecordingIndex
  RepMileUI             (C)  todas as telas, design system, cópia PT-BR/EN/ES, provedores de fixture
ios/App/RepMile          (C)  alvo do app (RepMileApp.swift), recursos, XCUITests
ios/App/Composition      (INT, futuro) raiz de composição de produção: CoachingHost + HealthKitIngest + RunRecorder
```

Regra de dependência: `RepMileUI → CoachingPresentation, IntegrationContracts, RunRecorder`. **RepMileUI nunca importa** HealthKit,
JavaScriptCore, CryptoKit, Security ou CoreLocation (CoreLocation só em RunRecorder). A e B não dependem de RepMileUI.

## 2. Mapeamento para Clean Architecture

| Camada | Onde está hoje | Observação |
|---|---|---|
| **Domain — contratos de Repository** | `CoachingReading`, `CoachingWriting` (CoachingPresentation); portas de IntegrationContracts | Já são as interfaces estáveis. Não criar protocolos paralelos por feature que só repassam a mesma chamada. |
| **Domain — modelos** | tipos de CoachingPresentation/IntegrationContracts | Não duplicar modelos do CoachingCore na UI. |
| **Domain — Use Cases** | ainda não existem como tipos | Criar só quando coordenam algo (ex.: "enviar relato e recarregar o plano", "iniciar corrida avulsa respeitando gates"). |
| **Data — Repository impl** | `CoachingHost` (A), `HealthKitIngestor` (B), `FixtureCoachingReader/Writer` (C, fase paralela) | Fixture e produção implementam a mesma porta. |
| **Data — Service / DataSource** | `NativeStore`, `Keychain`, `TrustedClock` (A); `HealthKitReader` (B); `RecordingStore`, `CoreLocationSource` (C) | Service = fala com framework/armazenamento. |
| **Presentation** | `RepMileUI/Features/*`, `DesignSystem/`, `App/RepMileShell` | Views ainda chamam `model.writer.*` diretamente (13 pontos, §4). |
| **App / Composition root** | `RepMileShell.init(scenario:)` (fixtures) e `init(model:)` | Produção: `ios/App/Composition` (#15/#16). |

## 3. Estado global: `AppModel`

`AppModel` (`@Observable @MainActor`, 105 linhas) é o **read model** do app: lê todas as portas e publica tudo de uma vez (`load()`),
decide a rota raiz (`RootRoute`, falha fechada para estados desconhecidos), guarda os gates (`startability`, `globalGate`).

Responsabilidades **legítimas** a manter: snapshot lido das portas, rota raiz, gates, recarga após escrita.
Não deve receber: formulários, validação de entrada, estado de envio, navegação de features, lógica de escrita. Hoje ele expõe
`writer` e `reader` publicamente — é por aí que as Views chamam as portas diretamente.

## 4. Padrão alvo da Presentation

```text
View ──eventos──▶ ViewModel (@Observable @MainActor) ──▶ porta de Domain (CoachingWriting/Reading) ou UseCase
  ▲                    │
  └────UIState─────────┘   (enum explícito: idle · editing · submitting · saved · failed(code) …)
```

- **ViewModel obrigatório** para tela com escrita, formulário, envio assíncrono ou tratamento de erro. Não criar para componente visual.
- ViewModel recebe dependências **pelo inicializador** (a porta, `AppModel` para recarregar, closures de navegação). Nada de singleton.
- Estado de envio por enum (impede duplo envio: `submit()` ignora quando `.submitting`). Erros do motor (`BoundaryError.code`)
  viram estado visual; código desconhecido falha fechado.
- `Task` lançada pelo ViewModel é cancelada no `deinit`/`onDisappear` quando o resultado não pode mais ser aplicado.
- Navegação: `NavigationStack` tipado (`Route`), um roteador de sheets em `AppTabs`. Coordinator só para fluxo de várias etapas
  (onboarding, corrida: sessão → relato → sinais). Sheet local pode continuar como estado da View.

Pontos de escrita direta a migrar (ordem por risco):

| # | Feature | Arquivo | Escrita | ViewModel alvo |
|---|---|---|---|---|
| 1 | Onboarding | `Onboarding/OnboardingFlow.swift` (378) | `onboard` | `OnboardingViewModel` + `OnboardingDraft` |
| 2 | Relato da corrida | `Run/RunReportView.swift` | `submit(sessionReports)` | `RunReportViewModel` |
| 3 | Segurança | `Adapt/SafetyFlows.swift` | `warningSignSet`, `submit` ×2 | `NotFeeling100ViewModel`, `ReadinessViewModel` |
| 4 | Musculação | `Run/StrengthLogView.swift` | `submit` | `StrengthLogViewModel` |
| 5 | Perfil / privacidade | `Profile/ProfileScreen.swift` | `setConsent`, `eraseHealthFacts`, `eraseAccount` | `ProfileViewModel` |
| 6 | Zonas de FC | `Profile/HeartRateZonesScreen.swift` | `setHeartRateProfile`, `eraseHeartRateProfile` | `HeartRateZonesViewModel` |
| 7 | Mover treino | `Plan/UnavailableDaySheet.swift` | `submit(unavailableDays)`, `accept` | `UnavailableDayViewModel` |
| 8 | Correção no histórico | `History/HistoryScreen.swift` | `submit` | `HistoryCorrectionViewModel` |

Quando o último ponto migrar, `AppModel.writer` deixa de ser público.

## 5. Organização de pastas (alvo, por feature)

```text
RepMileUI/Sources/RepMileUI/Features/Onboarding/
  Presentation/Views/        OnboardingFlow.swift, steps…
  Presentation/ViewModels/   OnboardingViewModel.swift
  Presentation/State/        OnboardingUIState.swift
  Domain/UseCases/           (só se coordenar algo além de uma chamada de porta)
```

`Data/` de cada feature só existe quando houver implementação local (ex.: mapper). Não criar pastas ou wrappers vazios. Componentes
compartilhados ficam em `DesignSystem/`; cópia em `Copy/`.

## 6. Exemplo: o padrão aplicado a uma escrita

```swift
@Observable @MainActor
final class RunReportViewModel {
    enum State: Equatable { case editing, submitting, saved, screenRequired, failed(String) }
    private(set) var state: State = .editing
    private let writer: CoachingWriting
    private let reload: () async -> Void

    init(writer: CoachingWriting, reload: @escaping () async -> Void) { self.writer = writer; self.reload = reload }

    func submit(_ observation: AthleteObservation) async {
        if state == .submitting || state == .saved { return }        // sem duplo envio
        state = .submitting
        let outcome = await writer.submit(ReviewRequest(.sessionReports([observation]), eligibility: nil))
        state = RunReportViewModel.state(for: outcome)               // WriteOutcome → State: função pura, testada sem UI
        if state == .saved { await reload() }
    }
}
```

A View só lê `state` e chama `submit`. O mapeamento `outcome → State` é uma função pura com teste unitário.

## 7. Composição de produção (integração)

`ios/App/Composition/AppComposition.swift` (INT) monta: `CoachingHost` (A) como `CoachingReading & CoachingWriting`,
`HealthKitIngestor` (B) como `HealthIngestStatusSource`, `RunRecorder` (C) como `AppRecordingIndex`, e entrega `AppModel(reader:writer:health:…)`
a `RepMileShell(model:)`. Fixtures continuam para testes determinísticos (`-scenario`). Nenhuma tela muda na troca.

## 8. Concorrência

`AppModel` e ViewModels são `@MainActor`. Portas são `Sendable`; A usa classe `@unchecked Sendable` com isolamento interno, B usa `actor`.
Persistência de RunRecorder não pode bloquear a main thread (QRE P2 aberto: grava a cada 5 fixes na main → issue de C).
