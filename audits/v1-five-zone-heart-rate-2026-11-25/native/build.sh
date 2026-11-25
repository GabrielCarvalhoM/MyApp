#!/bin/sh
# V1HR5 native inputs, from the repository root: the amended JavaScriptCore bundle and every Node oracle fixture, written ONLY into this
# mission's copy of the iOS package (native/ios) by the historical linker and oracles run unchanged under native/redirect.mjs, then this
# mission's hr5 fixture. The historical package (audits/v1-aif-p0-jsc-2026-11-17/ios) is never written. Deterministic once its inputs are
# committed: a second run leaves `git diff` empty (checked with --twice). Run it again whenever a CoachingCore source or data file changes.
set -eu
cd "$(git rev-parse --show-toplevel)"
R="--import ./audits/v1-five-zone-heart-rate-2026-11-25/native/redirect.mjs"
node $R audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs
node $R audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs
node $R audits/v1-aif-p0-jsc-2026-11-17/lab/focal-oracle.mjs
node $R audits/v1-core-safety-lifecycle-2026-11-18/mac/core-oracle.mjs
node $R audits/v1-core-safety-lifecycle-2026-11-18/mac/int-oracle.mjs
node $R audits/v1-final-physical-2026-11-24/mac/final-oracle.mjs > /dev/null
node $R audits/v1-final-physical-2026-11-24/mac/hmac-oracle.mjs
node audits/v1-five-zone-heart-rate-2026-11-25/mac/hr5-oracle.mjs > /dev/null
# The historical package: no tracked change, and no untracked or ignored file left in it (QRE-HR5-10).
git diff --quiet -- audits/v1-aif-p0-jsc-2026-11-17 || { echo "build.sh: the historical package changed" >&2; exit 1; }
[ -z "$(git status --porcelain --ignored -- audits/v1-aif-p0-jsc-2026-11-17)" ] || { echo "build.sh: a file was left in the historical package" >&2; git status --porcelain --ignored -- audits/v1-aif-p0-jsc-2026-11-17 >&2; exit 1; }
# The bundle carries the engine's pinned five-zone values and the enabling records the engine reads (QRE-HR5-01, condition C1).
node -e '
const fs=require("fs"),c=require("crypto"),R="audits/v1-five-zone-heart-rate-2026-11-25/native/ios/Sources/P0Host/Resources/";
const am=JSON.parse(fs.readFileSync(R+"assets-manifest.json")),pin=/HR5_SHA256=.([0-9a-f]{64})/.exec(fs.readFileSync("CoachingCore/src/v1-heart-rate-zones.mjs","utf8"))[1];
const v=am.find(a=>a.key==="CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json"),r=am.find(a=>a.key==="audits/v1-five-zone-heart-rate-2026-11-25/reviews/ssctr/SSCTR_HR5_RECORDS.json");
const h=f=>c.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
if(!v||v.sha256!==pin||h(R+"assets/"+v.file)!==pin)throw new Error("build.sh: the bundled five-zone values are not the engine pin");
if(!r||h(R+"assets/"+r.file)!==h(r.key))throw new Error("build.sh: the enabling records are not bundled as on disk");
console.log("build.sh: bundled five-zone values = engine pin "+pin.slice(0,12)+"; enabling records bundled");'
[ "${1:-}" = "--twice" ] && { git diff --quiet -- audits/v1-five-zone-heart-rate-2026-11-25/native || { echo "build.sh: not deterministic against the committed copy" >&2; git diff --stat -- audits/v1-five-zone-heart-rate-2026-11-25/native >&2; exit 1; }; }
echo "build.sh: bundle and fixtures written under audits/v1-five-zone-heart-rate-2026-11-25/native/ios; the historical package is unchanged"
