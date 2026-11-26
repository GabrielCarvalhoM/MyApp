#!/bin/bash
# Swift package gate for RepMile V1 (docs/engineering/QUALITY_GATES.md).
#
#   tools/orchestration/swift-packages.sh [--fronts=build|test|off]
#
# Shared contract packages (IntegrationContracts, CoachingPresentation) always run `swift test` and must report
# 0 failures and 0 skipped tests: their tests call `node` against CoachingCore and XCTSkip when node is missing, so a
# skip is a lost check, not a pass. Front packages under ios/Packages/ (CoachingHost, HealthKitIngest, RepMileUI,
# RunRecorder, ...) are compiled with their tests (`--fronts=build`, the CI default) or tested (`--fronts=test`, for the
# Mac mini native gate). Front tests are not run on hosted CI: they may need the Keychain, a device or the simulator.
# A front package that does not declare macOS (iOS-only, e.g. RepMileUI) is compiled with xcodebuild for the generic iOS Simulator;
# its tests run in the simulator pipeline (tools/orchestration/sim.sh test). It is never silently skipped.
#
# Exit 0: all gates passed. 1: a gate failed. 2: missing dependency.
set -uo pipefail
FRONTS=build
for a in "$@"; do case "$a" in --fronts=build|--fronts=test|--fronts=off) FRONTS="${a#--fronts=}";; *) echo "usage: $0 [--fronts=build|test|off]" >&2; exit 2;; esac; done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "swift-packages: not inside a git checkout" >&2; exit 2; }
cd "$ROOT"
command -v swift >/dev/null || { echo "swift-packages: MISSING_DEPENDENCY swift (Xcode or a Swift toolchain)" >&2; exit 2; }
command -v node >/dev/null || { echo "swift-packages: MISSING_DEPENDENCY node (the shared tests run CoachingCore through node; without it they skip)" >&2; exit 2; }
[ -d CoachingCore/node_modules/ajv ] || { echo "swift-packages: MISSING_DEPENDENCY CoachingCore/node_modules (run: (cd CoachingCore && npm ci --ignore-scripts))" >&2; exit 2; }

SHARED="IntegrationContracts CoachingPresentation"
LOGDIR="${SWIFT_GATE_LOGDIR:-$ROOT/ios/.build/swift-gate}"
mkdir -p "$LOGDIR"
status=0
summary=()

check_test_log() { # $1 log → prints the XCTest totals line; fails on failure, skip or zero tests
  local log="$1" totals
  totals="$(grep -E 'Executed [0-9]+ tests?' "$log" | tail -1 | sed 's/^[[:space:]]*//')"
  [ -n "$totals" ] || { echo "no XCTest totals"; return 1; }
  echo "$totals"
  if grep -qE "Test Case .* skipped|tests? skipped|Executed 0 tests" "$log"; then echo "SKIPPED_OR_EMPTY"; return 1; fi
  grep -qE 'with 0 failures' <<<"$totals"
}

for manifest in ios/Packages/*/Package.swift; do
  [ -e "$manifest" ] || continue
  dir="$(dirname "$manifest")"; name="$(basename "$dir")"; log="$LOGDIR/$name.log"
  shared=0; case " $SHARED " in *" $name "*) shared=1;; esac
  if [ $shared -eq 0 ] && [ "$FRONTS" = off ]; then summary+=("SKIP_BY_OPTION $name"); continue; fi
  if [ $shared -eq 0 ] && ! grep -q '\.macOS(' "$manifest"; then
    command -v xcodebuild >/dev/null || { summary+=("FAIL           $name · iOS-only package and no xcodebuild"); status=1; continue; }
    echo "::group::xcodebuild build $name (generic iOS Simulator)"
    (cd "$dir" && xcodebuild build -scheme "$name" -destination 'generic/platform=iOS Simulator' -derivedDataPath "$LOGDIR/dd-$name") >"$log" 2>&1; rc=$?
    tail -20 "$log"; echo "::endgroup::"
    if [ $rc -eq 0 ]; then summary+=("IOS_BUILD_OK   $name (iOS-only; tests run in sim.sh test)"); else summary+=("FAIL           $name · xcodebuild exit $rc"); status=1; fi
    continue
  fi
  mode=test; [ $shared -eq 0 ] && mode="$FRONTS"
  echo "::group::swift $mode $name"
  if [ "$mode" = test ]; then
    (cd "$dir" && swift test) >"$log" 2>&1; rc=$?
    tail -40 "$log"
    if [ $rc -eq 0 ] && result="$(check_test_log "$log")"; then summary+=("PASS           $name · $result")
    else summary+=("FAIL           $name · exit $rc · ${result:-see $log}"); status=1; fi
  else
    (cd "$dir" && swift build --build-tests) >"$log" 2>&1; rc=$?
    tail -20 "$log"
    if [ $rc -eq 0 ]; then summary+=("BUILD_OK       $name (tests compiled, run on the native gate)"); else summary+=("FAIL           $name · build exit $rc"); status=1; fi
  fi
  echo "::endgroup::"
done

for s in $SHARED; do [ -f "ios/Packages/$s/Package.swift" ] || { summary+=("FAIL           $s · shared package missing"); status=1; }; done
echo
echo "Swift package gate (fronts=$FRONTS), $(swift --version 2>/dev/null | head -1)"
printf '  %s\n' "${summary[@]}"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  { echo "### Swift packages"; echo; printf -- '- `%s`\n' "${summary[@]}"; } >>"$GITHUB_STEP_SUMMARY"
fi
exit $status
