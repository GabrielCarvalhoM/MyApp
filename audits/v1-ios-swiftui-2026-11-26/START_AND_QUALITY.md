# Frente C · início e critérios para os primeiros incrementos

**Worktree** `~/.codex/worktrees/myapp-v1-ios-swiftui/MyApp` · **branch** `claude/v1-ios-swiftui` · **base** `v1-abc-ready-2026-11-26` (`065178f`).

Leia [C_START_PROMPT](../v1-abc-foundation-consolidation-2026-11-26/C_START_PROMPT.md) e [C_SWIFTUI_HANDOFF](../v1-abc-foundation-consolidation-2026-11-26/C_SWIFTUI_HANDOFF.md) com as respectivas autoridades. Antes de implementar uma tela, consulte também o adendo visual publicado no commit `26ec95f` e a revisão abaixo. O adendo atualiza as referências visuais e as variantes do handoff. A revisão registra correções posteriores no mesmo arquivo.

```sh
git show origin/claude/v1-figma-final-alignment:audits/v1-figma-final-alignment-2026-11-26/SWIFTUI_VISUAL_HANDOFF_ADDENDUM.md
```

## Incrementos

1. Shell executável em `ios/App/RepMile.xcodeproj` e `RepMileUI`, com as quatro abas e o caminho de ida e volta do Perfil. As telas provisórias usam controles nativos e indicam prévia de navegação.
2. Ligar provedores que reproduzam as fixtures congeladas pela interface compartilhada. Implementar os estados de entrada e bloqueio antes de expor ações de treino. Derivar disponibilidade, prescrição e sinais dos tipos compartilhados. Manter o modo sintético e os caminhos de A, B, integração e CoachingCore fora dos diffs da Frente C.
3. Evoluir navegação e conteúdo pela referência atual do Figma. Para Hoje, começar por [880:4257](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S?node-id=880-4257), incluindo o avatar e a ação central no shell. Usar os estados V1 do adendo e as anotações Dev Mode.

Em cada incremento navegável, compile o esquema RepMile, execute no simulador dedicado, amplie o XCUITest do fluxo implementado e compare screenshots **capturados no simulador** com os nós correspondentes do Figma. Registre a versão ou o nó, o dispositivo, a variante, a evidência e as diferenças. Use os mesmos dados, idioma e tamanho de tela quando comparar fidelidade. A aceitação completa continua no §10 do handoff C.

```sh
xcodebuild -project ios/App/RepMile.xcodeproj -scheme RepMile \
  -destination 'platform=iOS Simulator,name=RepMile-C-SwiftUI' \
  -derivedDataPath ios/.build/DerivedData-C -parallel-testing-enabled NO \
  CODE_SIGNING_ALLOWED=NO test
```

## Revisão direcionada do Figma

| Prioridade | Nó | Resultado |
|---|---|---|
| P1 | `760:1484` e `785:5601` | O aviso de Z4/Z5 omitia a origem aproximada baseada na máxima informada (SSCTR C5). Cópia corrigida em `760:1588` e `785:5691`. |
| P1 | `848:502` e `849:12183` | O estado sem treinos inferia negativa de leitura do Apple Saúde. Títulos, cópia e instruções agora informam ausência de dados e como conferir acesso aos treinos. Para ausência genérica, também existe a variante `848:696`. |
| P1 | `843:1696` e `851:19589` | O cabeçalho nomeava cansaço, enquanto a pergunta era sobre piora. A cópia corrigida mantém o ordinal e uma única pergunta. Em C, gerar a pergunta e a contagem a partir de `warningSignSet(condition:)`. |
| P0 · verificado no recorte | `838:4053`, `1103:2299`, `836:3299`, `661:1215` | Gestação/pós-parto preservam o bloqueio, inclusive ao refazer o cadastro. Corrida avulsa apresenta a pergunta sobre parada ou sintoma. Em C, ausência de resposta continua distinta de “não”, e “sim” abre o fluxo 72 com `eligibility`. |
| P1 · verificado no recorte | `760:1611`, `1102:4302`, `1102:4428`, `845:4225` | Cinco zonas e faixas dos exemplos conferidas para cinta, estimativa pela idade e limites personalizados. A cinta informa a origem e a condição do exemplo. Para ausência de zonas, renderizar a razão do contrato, inclusive hold/conflito, e aplicar C1/C2 pelos dados recebidos. Reprodução da animação da cinta `785:5837` segue pendente. |

O conector do Figma não implementa a criação de versão nomeada. No arquivo atual, use **Save to Version History** (`⌘⌥S`), título **RepMile V1 · 26/11** e descrição **Alinhamento funcional V1: HR5, segurança, HealthKit, dados parciais e handoff SwiftUI**. Clique em **Save**.

**REAL_ATHLETE_READY = NO.**
