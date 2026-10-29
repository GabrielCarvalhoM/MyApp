# Founder request — onboarding, login and paywall revision OB-2 (2026-10-25)

Provenance: direct Founder message in a Claude Code session on 2026-10-25, for the new Figma `TYR10AIrquCpKvKL3eyXyO` and the repo's product contracts. Recorded verbatim. Attachments: two screenshots of the BeFit app (Apple Health ↔ app illustration; "Como você deseja configurar seus treinos?" with a RECOMENDADO tag) and a 99-second screen recording of BeFit's onboarding, paywall and sign-up, sent "apenas como referência de qualidade". The recording also shows a personal chat notification from the Founder's phone; it is not transcribed or reused anywhere.

## Request

fluxo de onboarding, paywall e login precisam de alguns ajustes ainda

onboarding precisa vir antes do login, logo depois da tela "começar/ja tenho conta", login deve ser depois do onboarding apenas

paywall deve destacar mais o plano atual, botar a % do desconto por mês em relação ao plano mensal tradicional, destacar as vantagens, ser uma tela mais trabalhada

treinos de corrida geralmente são mais dinâmicos, mas musculação geralmente se passa um certo tempo com um treino fixo, o onboarding deve perguntar de quanto em quanto tempo o usuario quer atualizar os exercícios do plano de força, 6 semanas, 2 semanas, fixo ou o coach decide (atualizar se refere a mudar os exercicios, não progressão de carga, etc, isso deve continuar evoluindo normalmente)

no onboarding atual o app pergunta os dias e turnos que o usuario tem disponivel, e o sistema monta por conta propria o treino, dizendo quando o usuario vai treinar dentro daqueles dias, quando terá dois treinos no mesmo dia e qual turno será cada treino... quero que o onboardin peça os dias que o usuario deseja treinar musculação e o turno que deseja treinar musculação, e peça os dias que o usuário deseja treinar corrida, o turno que deseja, e dentre os dias escolhidos pra correr, qual dia ele prefere fazer o longão, pode usar a mesma tela que ja existe, mas separando por esporte, e agora o usuario não vai mais só dizer quais eles tem disponivel e o app monta como quer, o app precisa usar os dias e turnos informados pelo usuario, assim como acontece no runna por exemplo, então seria algo do tipo "que dias voce deseja treinar força" "horarios", pois tem gente que quer treinar só 3 vezes na semana por exemplo, e tem gente que quer treinar 5, se do jeito que ta hoje o usuario que quer treinar 5, marcar 5 dias, mas o coach só usar 3, pode frustrar o usuario e faze-lo largar o app

a tela de topa treinar duas vezes pode sair, ja que o usuario vai escolher individualmente os dias de força e corrida, se ele escolher o mesmo dia nos dois, então entendisse que ele quer treinar os dois no mesmo dia, apenas caso alem do mesmo dia ele também escolha o mesmo turno, pode adicionar um alerta informando o conflito e perguntar se ele realmente quer os dois treinos em sequencia, para confirmar

 na tela de peso e altura deve ter um switch pro tipo de metrica (kg/lb - cm/ft)

os tracinhos que contam as telas ja passadas do onboarding podem ficar todos brancos, não precisam usar a cor dos esportes

melhore a ui de alguns lugares, como o desenho do apple saude com o app, olhando o exemplo de como o befit faz isso pelo print, quero algo mais bem trabalhado, os gráficos devem ser montados com motion

também podemos adicionar tag de recomendado SOMENTE ONDE FIZER SENTIDO nas opções do onboarding, isso não deve estar por exemplo na escolha dos objetivos, mas talvez faça sentido por exemplo na tela de quando os dois disputam, recomendar baseado no objetivo que ele escolheu antes, priorizar força, corrida, ou ambos

mandei um video do fluxo de onboarding, não quero que mude o nosso mais do que eu pedi, ou que imite o dele, mandei apenas como referencia de qualidade, o carrossel mostrando o app na primeira tela antes do onboarding, o gráfico sendo montado em motion, a animação do befit com o apple saude, a tela de login mais trabalhada, a ênfase no plano anual, etc

essas mudanças não são apenas visuais, além do figma, precisa verificar os contratos e documentação do projeto, pra verificar os lugares que por exemplo falam que o usuario escolherá os dias disponíveis e o coach montará como achar melhor, e alterar para dizer que o coach deve usar os dias e turnos escolhidos (isso é um exemplo, mas caso tenham mais mudanças como essa que não tenham impacto do de ui, mas também de escolha pra contrato, atualize)

e também pergunte genero na tela de pergunta altura e peso, genero também deve ser relevante na hora de um coach montar um treino...

## Scope read from the request

1. Order: welcome ("Começar" / "Já tenho conta") → onboarding → account (sign-up or sign-in) only after the onboarding.
2. Paywall: stronger emphasis on the selected plan and on the annual plan, discount % per month against the monthly plan, benefits highlighted, a more crafted screen.
3. New strength question: how often the exercises change — every 6 weeks, every 2 weeks, fixed, or the coach decides. Load, sets and reps keep progressing normally.
4. Schedule per sport: strength days + strength shift; running days + running shift + long-run day among the running days. The plan must use the chosen days and shifts.
5. Remove the double-session question. Same day in both sports = two sessions that day; same day and same shift = alert asking to confirm back-to-back sessions.
6. Body data step: unit switch kg/lb and cm/ft; ask sex/gender there, relevant to the coach.
7. Progress dashes all white.
8. Crafted Apple Health ↔ app illustration (BeFit print as quality reference); charts built with motion.
9. "Recomendado" tags only where meaningful (e.g. the priority question, derived from the goals) — never on goals.
10. Quality references only (do not imitate, do not change more than asked): welcome carousel showing the app, chart built in motion, Apple Health animation, more crafted sign-up, annual emphasis.
11. Update contracts and documentation wherever these choices change product truth, not only the Figma.
