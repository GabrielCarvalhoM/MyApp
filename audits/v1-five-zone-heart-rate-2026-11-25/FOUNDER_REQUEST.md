# Founder request — RepMile Five-Zone Heart Rate Intelligence V1 (2026-11-25)

This is the record of the Founder's direct request that authorizes this mission. The request was given in Portuguese in the Claude Code session that ran it, on the Mac mini M4. The binding parts are below; the full mission text set the phases 1 to 10 that these files follow.

## Decision

> A V1 deverá possuir cinco zonas de FC verdadeiramente implementadas no CoachingCore, e não apenas uma representação visual dividida em cinco segmentos.
> Isso não autoriza remover os três domínios fisiológicos internos caso sejam necessários à lógica esportiva existente.

## What it authorizes

- A bounded implementation in CoachingCore: five heart-rate zones (Z1–Z5) with calibration, provenance and confidence. It includes the safe behaviour without a heart-rate reference, and the role of heart rate in run prescription.
- Tests, macOS JavaScriptCore validation, Swift contract validation in an isolated mission area, and physical validation on the connected iPhone with synthetic athletes only.
- An independent review, a versioned amendment record beside the original final release freeze, and commits pushed to `claude/v1-five-zone-heart-rate`. No force push and no merge.

## Non-negotiable limits (as given)

- No Figma edit. No SwiftUI screens, HealthKit, backend or GPS recording.
- No change to the A/B worktrees or to shared contracts (`ios/Packages/IntegrationContracts`, the A/B handoffs, the frozen parallel contract).
- The engine is not reopened, and the original freeze is not rewritten.
- No fabricated heart-rate data, and no zones without a sufficient reference. The three physiological domains are not turned into five artificial domains.
- RPE and pace prescription are not weakened. Strength rules are not changed without need.
- No real athletes and no `syntheticOnly=false`. No destructive Git operation, no new full freeze cycle, and no approval claimed without real validation.

## Authority reading

`CURRENT_MISSION.md` (MISSION-EXPERIENCE-1.0) says `IMPLEMENTATION_AUTHORIZED = NO` for its own documentary mission. Since 2026-11-08, each V1 CoachingCore mission has instead run on a direct Founder request, recorded in its audit folder and in an insert-only `MISSION_LEDGER.md` entry, without editing `CURRENT_MISSION.md` (V1CP, V1FC, V1RC, V1INT, V1BC, V1FPV, V1PAR, V1UIR). This mission follows that precedent and does not edit `CURRENT_MISSION.md`. The sports-science reviewer (SSCTR) must be called for this change under CLAUDE.md, because heart-rate zones are Run Intelligence that touches prescription.
