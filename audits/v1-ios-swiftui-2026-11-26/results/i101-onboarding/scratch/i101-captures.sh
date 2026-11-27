#!/bin/bash
# #101 captures: every onboarding frame state through tools/orchestration/sim.sh run (fixture composition, Debug seeds), dark appearance.
# Usage (from the front C worktree): i101-captures.sh <sim.sh path> <out dir> [variant ...]   variants: pt en es pt-ax (default: all four)
set -u
SIM="$1"; OUT="$2"; shift 2; if [ $# -gt 0 ]; then VARIANTS=("$@"); else VARIANTS=(pt en es pt-ax); fi
STATES=(
 "01-abertura-835-2069||||"
 "02-o-que-treinar-835-2114|lucas|train|form"
 "03-objetivo-corrida-835-2188|lucas|runAim|form"
 "03-sem-prova-rafa-838-853|rafa|runAim|form"
 "04-data-da-prova-835-2245|lucas|raceDate|form"
 "04-maratona-16-semanas-838-913|marathon|raceDate|form"
 "04-alem-de-16-semanas-838-3864|beyond|raceDate|form"
 "05-meta-de-tempo-835-2301|lucas|goalTime|form"
 "06-objetivo-forca-835-2349|lucas|strengthAim|form"
 "08-respiro-objetivo-835-2475|lucas|goalDone|form"
 "09-sua-semana-862-2271|lucas|week|form"
 "10-dia-do-longao-836-390|lucas|longRun|form"
 "11-duracao-836-546|lucas|duration|form"
 "12-onde-treina-forca-836-624|lucas|strengthPlace|form"
 "12-em-casa-equipamentos-867-2289|home|strengthPlace|form"
 "13-onde-corre-836-741|lucas|runPlace|form"
 "14-o-que-usa-836-782|lucas|runDevice|form"
 "16-respiro-rotina-836-882|lucas|routineDone|form"
 "17-nome-836-2567|lucas|name|form"
 "18-idade-836-2603|lucas|age|form"
 "19-altura-e-peso-836-2649|lucas|bodySize|form"
 "20-apple-saude-836-2791|lucas|appleHealth|form"
 "21-corrida-sem-apple-saude-838-969|lucas|runNow|form"
 "21-iniciante-marina-838-1045|marina|runStart|form"
 "21b-corrida-recente-838-1093|marina-stopped|runRecentDays|form"
 "22-tempo-de-corrida-836-2948|lucas|runYears|form"
 "23-resultado-recente-836-2994|lucas|result|form"
 "23-nao-tenho-838-1143|marathon|result|form"
 "24-como-foi-836-3049|lucas|resultDetail|form"
 "25-forca-ate-aqui-836-3128|lucas|strengthYears|form"
 "25-forca-iniciante-marina-838-1187|marina|strengthYears|form"
 "27-cuidados-836-3299|lucas|care|form"
 "27-um-sinal-838-3616|clinical|care|form"
 "27b-confirmar-838-4148|clinical|care|confirmCare"
 "28-respiro-ponto-de-partida-836-3372|lucas|youDone|form"
 "29-seus-dados-837-999|lucas|dataUse|form"
 "29-envio-retido-D03|rafa|dataUse|form"
 "30-montando-837-1059|lucas|dataUse|building"
 "retomar-838-3918|lucas|longRun|"
 "30-nao-deu-838-3972|lucas|dataUse|notBuilt"
 "30-falta-uma-resposta-838-4011|lucas|dataUse|missing"
 "fora-da-versao-838-4053|lucas|dataUse|outside"
 "retido-por-seguranca-838-3689|clinical|dataUse|held"
 "31-plano-pronto-837-1144|lucas|dataUse|ready"
 "32-salvar-o-plano-837-1323|lucas|dataUse|account"
 "34-primeira-semana-837-1239|lucas|dataUse|firstWeek"
)
for v in "${VARIANTS[@]}"; do
  case "$v" in pt) LOC=pt_BR; LANG_ARG="(pt-BR)"; CS="";; en) LOC=en_US; LANG_ARG="(en)"; CS="";; es) LOC=es_ES; LANG_ARG="(es)"; CS="";;
    pt-ax) LOC=pt_BR; LANG_ARG="(pt-BR)"; CS="accessibility-large";; esac
  mkdir -p "$OUT/$v"
  for s in "${STATES[@]}"; do
    IFS='|' read -r NAME SEED STEP PHASE <<<"$s"
    ARGS=(--arg -scenario --arg no-data --arg -simulatedLocation --arg -AppleLanguages --arg "$LANG_ARG" --arg -AppleLocale --arg "$LOC")
    [ -n "$SEED" ] && ARGS+=(--arg -onboardingSeed --arg "$SEED" --arg -onboardingStep --arg "$STEP")
    [ -n "$PHASE" ] && ARGS+=(--arg -onboardingPhase --arg "$PHASE")
    RUN="$OUT/.runs/$v-$NAME"; rm -rf "$RUN"; mkdir -p "$OUT/.runs"
    EXTRA=(); [ -n "$CS" ] && EXTRA=(--content-size "$CS")
    "$SIM" run --sim RepMile-C-2 --appearance dark --locale "$LOC" --wait 5 --out "$RUN" --label "i101 $v $NAME" ${EXTRA[@]+"${EXTRA[@]}"} "${ARGS[@]}" > "$RUN.log" 2>&1
    rc=$?; PNG=$(ls "$RUN"/screenshot-*.png 2>/dev/null | head -1)
    if [ $rc -eq 0 ] && [ -n "$PNG" ]; then
      if [ "$v" = pt ]; then cp "$PNG" "$OUT/$v/$NAME.png"; else sips -Z 1311 "$PNG" --out "$OUT/$v/$NAME.png" >/dev/null; fi
      cp "$RUN/manifest.json" "$OUT/$v/$NAME.manifest.json"; echo "ok $v $NAME"
    else echo "FAIL $v $NAME rc=$rc"; fi
  done
done
