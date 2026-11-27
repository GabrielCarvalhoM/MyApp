#!/bin/bash
# RepMile V1 simulator pipeline: discover → build → boot → install → launch → logs → screenshot → tests → evidence.
# SIMULATOR ONLY. The physical iPhone is never touched here: device runs go through tools/device-lock/with-device.sh
# (docs/engineering/QUALITY_GATES.md §4). Every evidence manifest says target=simulator.
#
#   tools/orchestration/sim.sh <detect|doctor|build|run|test|all> [options]
#
#   detect   find the app project/workspace and list its schemes (exit 3 = WAITING_FOR_APP_SHELL)
#   doctor   detect + toolchain + chosen simulator, change nothing
#   build    build the scheme for the simulator
#   run      build, boot, install, launch, capture logs and a screenshot
#   test     xcodebuild test (XCTest + XCUITest) into an .xcresult, failures summarised
#   all      run + test
#
# Options:
#   --project <path>      .xcworkspace or .xcodeproj (default: ios/*.xcworkspace, else ios/App/RepMile.xcodeproj)
#   --scheme <name>       default: the only scheme; several schemes → you must choose
#   --sim "<name>"        simulator model (default $SIM_DEVICE, else first available of: iPhone 17 Pro, iPhone 18 Pro, iPhone 17)
#   --appearance light|dark   (default light)     --locale pt_BR|en_US|es_ES   (default pt_BR)
#   --wait <seconds>      time between launch and screenshot (default 8)
#   --content-size <cat>  Dynamic Type category for the run (e.g. large, extra-extra-extra-large, accessibility-large)
#   --session A|B|C|INT   DerivedData-<session> (default from the branch: C on claude/v1-ios-swiftui*, INT otherwise)
#   --out <dir>           evidence directory (default ios/.build/sim-runs/<UTC timestamp>, gitignored)
#   --label <text>        free label kept in the manifest (e.g. the screen or issue)
#
# Exit: 0 ok · 1 build/launch/test failure · 2 usage or missing dependency · 3 WAITING_FOR_APP_SHELL
set -uo pipefail

die() { echo "sim: $*" >&2; exit "${2:-1}"; }
need() { command -v "$1" >/dev/null 2>&1 || die "MISSING_DEPENDENCY $1${2:+ ($2)}" 2; }

CMD="${1:-}"; [ -n "$CMD" ] && shift
case "$CMD" in detect|doctor|build|run|test|all) ;; *) sed -n '2,26p' "$0" >&2; exit 2;; esac

PROJECT="" SCHEME="" SIM_NAME="${SIM_DEVICE:-}" APPEARANCE=light LOCALE=pt_BR WAIT=8 SESSION="" OUT="" LABEL="" CONTENT_SIZE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT="$2"; shift 2;; --scheme) SCHEME="$2"; shift 2;; --sim) SIM_NAME="$2"; shift 2;;
    --appearance) APPEARANCE="$2"; shift 2;; --locale) LOCALE="$2"; shift 2;; --wait) WAIT="$2"; shift 2;;
    --session) SESSION="$2"; shift 2;; --out) OUT="$2"; shift 2;; --label) LABEL="$2"; shift 2;; --content-size) CONTENT_SIZE="$2"; shift 2;;
    *) die "unknown option $1" 2;;
  esac
done
case "$APPEARANCE" in light|dark) ;; *) die "--appearance must be light or dark" 2;; esac
[[ "$WAIT" =~ ^[0-9]+$ ]] || die "--wait must be an integer" 2

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git checkout" 2
cd "$ROOT"
need node "used to read xcodebuild/simctl JSON"

# ---- detect -------------------------------------------------------------------------------------------------------
if [ -z "$PROJECT" ]; then
  for ws in ios/*.xcworkspace; do [ -d "$ws" ] && PROJECT="$ws" && break; done
  [ -z "$PROJECT" ] && [ -d ios/App/RepMile.xcodeproj ] && PROJECT=ios/App/RepMile.xcodeproj
fi
if [ -z "$PROJECT" ]; then
  echo "WAITING_FOR_APP_SHELL: no ios/*.xcworkspace and no ios/App/RepMile.xcodeproj in $(git rev-parse --abbrev-ref HEAD)@$(git rev-parse --short HEAD)."
  echo "  The app shell is front C's first increment (C_SWIFTUI_HANDOFF.md §6). Nothing was built; no app was invented."
  exit 3
fi
[ -d "$PROJECT" ] || die "project not found: $PROJECT" 2
case "$PROJECT" in *.xcworkspace) PFLAG=-workspace;; *.xcodeproj) PFLAG=-project;; *) die "--project must be .xcworkspace or .xcodeproj" 2;; esac
need xcodebuild "install Xcode"; need xcrun

LIST_JSON="$(xcodebuild -list -json "$PFLAG" "$PROJECT" 2>/dev/null)" || die "xcodebuild -list failed for $PROJECT"
SCHEMES="$(node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));const p=j.workspace||j.project;console.log((p.schemes||[]).join("\n"))' <<<"$LIST_JSON")"
echo "project: $PROJECT"; echo "schemes: $(tr '\n' ' ' <<<"$SCHEMES")"
if [ -z "$SCHEME" ]; then
  # One scheme → it. Several → the one named after the project/workspace (e.g. RepMile beside the RepMileUI package scheme).
  if [ "$(grep -c . <<<"$SCHEMES")" -eq 1 ]; then SCHEME="$SCHEMES"
  else PNAME="$(basename "$PROJECT")"; PNAME="${PNAME%.*}"; grep -qxF "$PNAME" <<<"$SCHEMES" && SCHEME="$PNAME"; fi
fi
if [ "$CMD" = detect ]; then exit 0; fi
[ -n "$SCHEME" ] || die "several schemes; choose one with --scheme" 2
grep -qxF "$SCHEME" <<<"$SCHEMES" || die "scheme '$SCHEME' does not exist in $PROJECT" 2

# ---- simulator ----------------------------------------------------------------------------------------------------
DEVICES_JSON="$(xcrun simctl list devices available -j)" || die "simctl failed"
IFS=$'\t' read -r UDID SIM_PICKED RUNTIME < <(PREF="$SIM_NAME" node -e '
  const j=JSON.parse(require("fs").readFileSync(0,"utf8"));
  const prefs=process.env.PREF?[process.env.PREF]:["iPhone 17 Pro","iPhone 18 Pro","iPhone 17"];
  const all=[];for(const [rt,ds] of Object.entries(j.devices)){if(!/iOS/.test(rt))continue;for(const d of ds)all.push({...d,rt:rt.replace(/.*SimRuntime\./,"")});}
  all.sort((a,b)=>b.rt.localeCompare(a.rt,undefined,{numeric:true}));
  for(const p of prefs){const d=all.find(d=>d.name===p);if(d){console.log([d.udid,d.name,d.rt].join("\t"));process.exit(0);}}
  process.exit(1);' <<<"$DEVICES_JSON") || die "no available simulator named ${SIM_NAME:-iPhone 17 Pro / iPhone 18 Pro / iPhone 17}; see: xcrun simctl list devices available" 2

if [ -z "$SESSION" ]; then case "$(git rev-parse --abbrev-ref HEAD)" in claude/v1-ios-swiftui*) SESSION=C;; *) SESSION=INT;; esac; fi
case "$SESSION" in A|B|C|INT) ;; *) die "--session must be A, B, C or INT" 2;; esac
DERIVED="$ROOT/ios/.build/DerivedData-$SESSION"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${OUT:-$ROOT/ios/.build/sim-runs/$STAMP}"
DEST="platform=iOS Simulator,id=$UDID"
XCODE="$(xcodebuild -version | tr '\n' ' ' | sed 's/ *$//')"
echo "scheme: $SCHEME · simulator: $SIM_PICKED ($RUNTIME, $UDID) · DerivedData: $DERIVED · out: $OUT"
echo "xcode: $XCODE"
if [ "$CMD" = doctor ]; then exit 0; fi
mkdir -p "$OUT"


# ---- evidence manifest (written on every exit after this point) ---------------------------------------------------
RESULT=failed BUNDLE_ID="" TEST_SUMMARY=""
write_manifest() {
  [ -n "$CONTENT_SIZE" ] && xcrun simctl ui "$UDID" content_size large >/dev/null 2>&1   # restore the default category
  [ -n "${UDID:-}" ] && xcrun simctl status_bar "$UDID" clear >/dev/null 2>&1
  M_CMD="$CMD" M_RESULT="$RESULT" M_LABEL="$LABEL" M_BRANCH="$(git rev-parse --abbrev-ref HEAD)" M_COMMIT="$(git rev-parse HEAD)" \
  M_DIRTY="$(git status --porcelain | wc -l | tr -d ' ')" M_PROJECT="$PROJECT" M_SCHEME="$SCHEME" M_SIM="$SIM_PICKED" M_RT="$RUNTIME" \
  M_UDID="$UDID" M_XCODE="$XCODE" M_APP="$APPEARANCE" M_LOCALE="$LOCALE" M_BUNDLE="$BUNDLE_ID" M_OUT="$OUT" M_TESTS="$TEST_SUMMARY" M_SIZE="$CONTENT_SIZE" \
  node -e '
    const e=process.env, fs=require("fs"), crypto=require("crypto");
    const sha=(f)=>crypto.createHash("sha256").update(fs.readFileSync(e.M_OUT+"/"+f)).digest("hex");
    const m={target:"simulator",command:e.M_CMD,result:e.M_RESULT,label:e.M_LABEL||null,generatedAt:new Date().toISOString(),
      git:{branch:e.M_BRANCH,commit:e.M_COMMIT,uncommittedFiles:Number(e.M_DIRTY)},project:e.M_PROJECT,scheme:e.M_SCHEME,
      simulator:{name:e.M_SIM,runtime:e.M_RT,udid:e.M_UDID},xcode:e.M_XCODE,appearance:e.M_APP,locale:e.M_LOCALE,contentSize:e.M_SIZE||"default",
      bundleId:e.M_BUNDLE||null,artifacts:fs.readdirSync(e.M_OUT).filter(f=>f!=="manifest.json").sort(),
      screenshots:Object.fromEntries(fs.readdirSync(e.M_OUT).filter(f=>f.endsWith(".png")).map(f=>[f,sha(f)])),
      tests:e.M_TESTS?JSON.parse(e.M_TESTS):null};
    fs.writeFileSync(e.M_OUT+"/manifest.json",JSON.stringify(m,null,2)+"\n");'
  echo "evidence: $OUT/manifest.json (target=simulator result=$RESULT)"
}
trap write_manifest EXIT

boot_sim() {
  xcrun simctl boot "$UDID" >/dev/null 2>&1 || true            # already booted is fine
  xcrun simctl bootstatus "$UDID" -b >/dev/null || { RESULT=boot_failed; exit 1; }
  xcrun simctl ui "$UDID" appearance "$APPEARANCE" >/dev/null 2>&1 || echo "sim: could not set appearance (continuing)"
  if [ -n "$CONTENT_SIZE" ]; then xcrun simctl ui "$UDID" content_size "$CONTENT_SIZE" >/dev/null || { RESULT=content_size_failed; exit 1; }; fi
  # Deterministic screenshots: standard status bar (cleared on exit).
  xcrun simctl status_bar "$UDID" override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4 >/dev/null 2>&1 || true
}

build_app() {
  echo "sim: building $SCHEME for $SIM_PICKED → $OUT/build.log"
  if ! xcodebuild build "$PFLAG" "$PROJECT" -scheme "$SCHEME" -destination "$DEST" -derivedDataPath "$DERIVED" >"$OUT/build.log" 2>&1; then
    grep -E 'error:|BUILD FAILED' "$OUT/build.log" | head -20 >&2
    grep -E 'error:' "$OUT/build.log" | head -50 >"$OUT/build-errors.txt" || true
    RESULT=build_failed; exit 1
  fi
  # The app and its bundle id are read from what was built, never assumed.
  local settings; settings="$(xcodebuild -showBuildSettings -json "$PFLAG" "$PROJECT" -scheme "$SCHEME" -destination "$DEST" -derivedDataPath "$DERIVED" 2>/dev/null)"
  APP_PATH="$(node -e '
    const s=JSON.parse(require("fs").readFileSync(0,"utf8"));
    const t=s.find(x=>x.buildSettings.WRAPPER_EXTENSION==="app"&&x.buildSettings.EFFECTIVE_PLATFORM_NAME==="-iphonesimulator");
    if(t)console.log(t.buildSettings.TARGET_BUILD_DIR+"/"+t.buildSettings.FULL_PRODUCT_NAME);' <<<"$settings")"
  [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ] || { echo "sim: the scheme built no iOS Simulator .app" >&2; RESULT=no_app_product; exit 1; }
  BUNDLE_ID="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP_PATH/Info.plist")"
  echo "sim: built $APP_PATH (bundle id from Info.plist: $BUNDLE_ID)"
}

run_app() {
  boot_sim
  xcrun simctl install "$UDID" "$APP_PATH" || { RESULT=install_failed; exit 1; }
  local exe; exe="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP_PATH/Info.plist")"
  xcrun simctl spawn "$UDID" log stream --style compact --level info --predicate "process == \"$exe\"" >"$OUT/app.log" 2>&1 &
  local logpid=$!
  local lang="${LOCALE%%_*}"; [ "$LOCALE" = pt_BR ] && lang=pt-BR
  xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  # Any other user app left in the foreground would put a "◀ <app>" breadcrumb in the screenshot: terminate them (simulator only).
  local others; others="$(xcrun simctl listapps "$UDID" 2>/dev/null | plutil -convert json -o - - 2>/dev/null | node -e '
    let j={};try{j=JSON.parse(require("fs").readFileSync(0,"utf8"))}catch{}
    console.log(Object.entries(j).filter(([k,v])=>v.ApplicationType==="User"&&k!==process.argv[1]).map(([k])=>k).join("\n"))' "$BUNDLE_ID")"
  while IFS= read -r other; do [ -n "$other" ] && xcrun simctl terminate "$UDID" "$other" >/dev/null 2>&1; done <<<"$others"
  if ! xcrun simctl launch "$UDID" "$BUNDLE_ID" -AppleLanguages "($lang)" -AppleLocale "$LOCALE" >"$OUT/launch.txt" 2>&1; then
    kill "$logpid" 2>/dev/null; cat "$OUT/launch.txt" >&2; RESULT=launch_failed; exit 1
  fi
  sleep "$WAIT"
  local shot; shot="$OUT/screenshot-$(tr ' ' '-' <<<"$SIM_PICKED")-$LOCALE-$APPEARANCE${CONTENT_SIZE:+-$CONTENT_SIZE}.png"
  xcrun simctl io "$UDID" screenshot "$shot" >/dev/null 2>&1 || { kill "$logpid" 2>/dev/null; RESULT=screenshot_failed; exit 1; }
  # Still running? A crash during the wait is a failure, not a screenshot of the home screen.
  # Capture first: with pipefail, `grep -q` closing the pipe early would make a running app look dead (SIGPIPE).
  local running; running="$(xcrun simctl spawn "$UDID" launchctl list 2>/dev/null)"
  if ! grep -qF "UIKitApplication:$BUNDLE_ID[" <<<"$running"; then
    kill "$logpid" 2>/dev/null; echo "sim: the app is not running after ${WAIT}s (crash?) — see $OUT/app.log" >&2; RESULT=app_not_running; exit 1
  fi
  kill "$logpid" 2>/dev/null; wait "$logpid" 2>/dev/null
  echo "sim: launched, screenshot $shot, log $OUT/app.log ($(wc -l <"$OUT/app.log" | tr -d ' ') lines)"
}

test_app() {
  boot_sim
  local xcr="$OUT/Tests.xcresult"
  echo "sim: testing $SCHEME → $OUT/test.log"
  xcodebuild test "$PFLAG" "$PROJECT" -scheme "$SCHEME" -destination "$DEST" -derivedDataPath "$DERIVED" -resultBundlePath "$xcr" >"$OUT/test.log" 2>&1
  local rc=$?
  if [ -d "$xcr" ]; then
    xcrun xcresulttool get test-results summary --path "$xcr" >"$OUT/test-summary.json" 2>/dev/null || true
    xcrun xcresulttool get test-results tests --path "$xcr" >"$OUT/test-tree.json" 2>/dev/null || true
    TEST_SUMMARY="$(node -e '
      const fs=require("fs");let s={};try{s=JSON.parse(fs.readFileSync(process.argv[1],"utf8"))}catch{}
      const out={result:s.result??null,total:s.totalTestCount??null,passed:s.passedTests??null,failed:s.failedTests??null,skipped:s.skippedTests??null,
        failures:(s.testFailures||[]).map(f=>({test:f.testName,target:f.targetName,message:(f.failureText||"").slice(0,300)}))};
      console.log(JSON.stringify(out));' "$OUT/test-summary.json")"
    node -e 'const t=JSON.parse(process.argv[1]);console.log(`sim: tests ${t.result} · ${t.passed}/${t.total} passed · ${t.failed} failed · ${t.skipped} skipped`);for(const f of t.failures)console.log(`  FAIL ${f.target} ${f.test}: ${f.message}`)' "$TEST_SUMMARY"
  else
    grep -E 'error:|TEST FAILED|BUILD FAILED' "$OUT/test.log" | head -20 >&2
  fi
  [ $rc -eq 0 ] || { RESULT=tests_failed; exit 1; }
  # A green run that ran nothing, or skipped something, is a lost check.
  node -e 'const t=JSON.parse(process.argv[1]||"{}");process.exit(t.total>0&&!t.skipped?0:1)' "$TEST_SUMMARY" \
    || { echo "sim: no tests ran, or some were skipped" >&2; RESULT=tests_skipped_or_empty; exit 1; }
}

case "$CMD" in
  build) build_app;;
  run) build_app; run_app;;
  test) test_app;;
  all) build_app; run_app; test_app;;
esac
RESULT=ok
