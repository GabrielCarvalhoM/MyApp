# Design da dashboard de auditoria

Modo Operate/Read. Artefato profissional local, separado do produto Vilumo e de seu Figma. O briefing já fixa arquitetura, campos, navegação e propósito; nenhuma decisão estética do app foi reaberta.

Mesa de revisão: papel claro, tinta petróleo, acento verde contido e status rotulados. Navegação lateral no desktop, lista horizontal no mobile; mesma ordem de informação. Overview abre com veredito e âmbito, corpus, distribuição e blockers. Tabelas sem grade vertical, numerais tabulares e detalhe completo por ID, sem modal. Dados/limites têm prioridade sobre decoração.

Fonte Segoe UI para leitura operacional no Windows, 15px corpo; títulos em peso e escala maiores; detalhe em duas colunas que empilham em viewport estreita. Sem imagem, gráfico ornamental, ícone inventado, dependência externa ou animation de entrada. Gráfico único é a distribuição diretamente rotulada.

Status PASS verde escuro, ACCEPTABLE violeta neutro, QUESTIONABLE âmbar, WRONG/DANGEROUS vermelho. Cor nunca carrega significado sozinha. Filtros com labels e resultado anunciado, botões nativos, foco visível, estado vazio e suporte a reduced motion. Proibições, oracle original e incerteza ficam em campos distintos.

Encerramento: inspeção visual e funcional registrada em outputs/VERIFICATION.json; revisões de conteúdo por hash em reviews/. Nenhum asset raster é utilizado na entrega; capturas servem apenas como evidência de QA.
