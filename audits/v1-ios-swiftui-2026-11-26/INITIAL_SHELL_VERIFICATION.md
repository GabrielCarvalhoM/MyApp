# Verificação do primeiro shell SwiftUI

- Base da branch `claude/v1-ios-swiftui` verificada como descendente da tag `v1-abc-ready-2026-11-26` (`065178f`).
- Xcode 27.2, iOS 27.2, Apple Silicon. O app compilou, instalou e abriu no iPhone 18 Pro virtual dedicado `RepMile-C-SwiftUI`.
- `NavigationTests/testTabsAndProfileRoundTrip` passou: Hoje → Plano → Histórico → Progresso → Hoje → Perfil → Hoje. [Resultado](results/navigation-xcuitest.txt).
- `swift test`: IntegrationContracts 10/10, CoachingPresentation 29/29, 99 fixtures mais `INDEX.json`.
- Diff vazio nos caminhos congelados de CoachingCore, CoachingPresentation e IntegrationContracts. O app deste incremento usa conteúdo provisório de navegação, sem serviços ou dados de atleta.

## Comparação visual

Comparei a [captura do XCUITest](results/hoje-shell.png) com [Hoje no Figma](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S?node-id=880-4257). A ordem das quatro abas, a seleção inicial de Hoje e o acesso ao Perfil no canto superior direito correspondem à estrutura. A barra nativa clara é provisória. Faltam a barra escura com ação central de registro, o avatar do atleta, os ícones e a tipografia do design, além do conteúdo de Hoje movido por fixtures. A comparação valida a estrutura deste incremento e deixa o aceite de fidelidade visual em aberto.

O XCUITest e o lançamento via simctl usaram o runtime iOS normalmente. O aplicativo gráfico Simulator.app não estava disponível na instalação do Xcode.

Retomada e correções do Figma em [START_AND_QUALITY.md](START_AND_QUALITY.md). **REAL_ATHLETE_READY = NO.**
