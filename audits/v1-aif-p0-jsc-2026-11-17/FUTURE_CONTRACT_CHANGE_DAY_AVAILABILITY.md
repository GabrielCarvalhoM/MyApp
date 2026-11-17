# Mudança futura de contrato: disponibilidade por dia, sem turnos (V1)

**Origem:** nota do Founder de 2026-11-17, junto com a missão P0.
**Estado:** REGISTRADA. **Não implementada.** A P0 usou os contratos atuais do CoachingCore sem mudança e não construiu nada de turnos.

## Decisão de produto (do Founder)

- A V1 planeja por dias, não por turnos. A coleta de manhã, tarde e noite sai do onboarding.
- O atleta continua informando os dias disponíveis para corrida e para musculação, e a duração das sessões.
- Corrida e musculação podem cair no mesmo dia.
- A ordem visual dos treinos não obriga uma ordem de execução.
- O motor continua responsável pela coordenação esportiva, pela interferência, pela carga e pela recuperação.

## Por que é mudança de contrato, não de interface

O contrato atual aceita turno **AM/PM, um por esporte** (L-APP-03) e não aceita minutos por dia (L-APP-04), conforme `APP_DATA_CONTRACTS.md` da AIF. O turno entra no motor congelado e fica visível em pelo menos estes lugares (levantamento por busca de texto, **não é uma análise de impacto**):

- `CoachingCore/src/r6-program.mjs`, `r6-composition.mjs`, `r6-intake.mjs`, `r6-adaptation.mjs`, `r6-balanced.mjs`: composição da semana e coexistência de corrida e força no mesmo dia;
- `CoachingCore/src/r5-contract.mjs`: janelas ordenadas por `startMinute`. Esse é o único uso de `Array.prototype.toSorted` no bundle, e é ele que fixa o piso do iOS em 16.0 (`results/api-floor.json`);
- `CoachingCore/src/boundary/views.mjs` e `harness/lib.mjs` (AIF): o campo `turn` na linha de sessão das projeções.

Tirar o turno muda a entrada, as regras de mesmo dia e interferência e as projeções. Por isso exige:

1. análise de impacto no motor, com o SSCTR, porque mexe em interferência e coexistência no mesmo dia;
2. um freeze sucessor;
3. testes de regressão sobre as jornadas existentes;
4. revisão do contrato de dados do app (VF-APP-0).

## Fora desta missão

A remoção não pode ser feita na P0. A mudança é uma missão própria, autorizada pelo Founder.
