# F02 · Design system

**Situação:** IMPLEMENTADO em C (inc. 02, `c6bf7e4`) · spec de manutenção. Issue: #5 (estava "Blocked" por #3/#4; ambas entregues).

**Objetivo.** Tokens e componentes únicos para todas as telas, fiéis ao Figma: dark-first, azul = corrida, laranja = força.

**Conteúdo.** `DesignSystem/Theme.swift` (44 cores, 15 estilos de texto `rmText`), fontes OFL registradas (`RMFonts`), 28 ícones e line art,
`Components.swift`, `TabBar.swift`. Cópia: `Copy/copy.psv` → `.strings` PT-BR/EN/ES (569 chaves).

**Aceite.** Nenhuma cor/fonte literal fora de `Theme` · nenhum texto literal fora de `L.t` · tokens batem com as variáveis do Figma.

**Figma.** Variáveis e estilos do arquivo `90oyvXHxxBQAvr1netov7S` (versão nomeada pendente).

**Testes.** `testLanguages`, `testLargeDynamicType`; comparação visual pela F-14 (#14).

**Pendente.** Medição formal de contraste; modo claro (se V1).
