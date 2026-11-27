#!/bin/bash
# #98: the Debug-only `-route` launch argument is absent from a Release build. Two checks, one build:
#   1. conditional compilation: the app builds in Release, so no Release code refers to `DebugRoute` (the whole file is `#if DEBUG`);
#   2. strings check (as #63): the Release app binary holds neither the argument nor the type, while the Debug binary does.
#      The type-name count ('DebugRoute', from the Swift metadata) is the load-bearing check: it proves the code is compiled out. The
#      '-route' literal alone could be absent for other reasons (an optimiser folding it, another spelling).
# Simulator only. Usage: ios/Packages/RepMileUI/Tools/release-route-check.sh [<simulator udid>]   Exit 0 = absent in Release.
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel)" || exit 2
cd "$ROOT/ios" || exit 2
DEST="generic/platform=iOS Simulator"; [ -n "${1:-}" ] && DEST="platform=iOS Simulator,id=$1"
DERIVED="$ROOT/ios/.build/DerivedData-route-check"
fail=0
for config in Release Debug; do
  log="$DERIVED/build-$config.log"; mkdir -p "$DERIVED"
  if ! xcodebuild build -project App/RepMile.xcodeproj -scheme RepMile -configuration "$config" -destination "$DEST" -derivedDataPath "$DERIVED" >"$log" 2>&1; then
    echo "$config build: FAILED (see $log)"; grep -E 'error:' "$log" | head -10; exit 1
  fi
  app="$DERIVED/Build/Products/$config-iphonesimulator/RepMile.app"
  # Every Mach-O of the app: the executable and, in Debug, RepMile.debug.dylib (where Xcode puts the code of a Debug build).
  bins=("$app/$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$app/Info.plist")")
  while IFS= read -r f; do bins+=("$f"); done < <(find "$app" -type f \( -name '*.dylib' -o -path '*/Frameworks/*' \) | sort)
  route=0 type=0
  for b in "${bins[@]}"; do
    route=$((route + $(strings -a "$b" | grep -cx -- '-route'))); type=$((type + $(strings -a "$b" | grep -c 'DebugRoute')))
  done
  echo "$config build: BUILD SUCCEEDED · binaries: $(for b in "${bins[@]}"; do printf '%s ' "${b#$app/}"; done)"
  echo "  '-route' strings: $route · 'DebugRoute' strings: $type"
  if [ "$config" = Release ] && { [ "$route" -ne 0 ] || [ "$type" -ne 0 ]; }; then fail=1; fi
  # The Debug build must show both, or a zero in Release proves nothing (QRE P3): the type name above all, the load-bearing one.
  if [ "$config" = Debug ] && { [ "$route" -eq 0 ] || [ "$type" -eq 0 ]; }; then echo "Debug binaries lack '-route' or 'DebugRoute': the check would not detect it"; fail=1; fi
done
[ $fail -eq 0 ] && echo "result: -route absent in Release, present in Debug" || echo "result: FAILED"
exit $fail
