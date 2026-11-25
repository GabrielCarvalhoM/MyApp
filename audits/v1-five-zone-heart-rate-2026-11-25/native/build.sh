#!/bin/sh
# V1HR5 native inputs, from the repository root: the amended JavaScriptCore bundle and every Node oracle fixture, written ONLY into this
# mission's copy of the iOS package (native/ios) by the historical linker and oracles run unchanged under native/redirect.mjs, then this
# mission's hr5 fixture. The historical package (audits/v1-aif-p0-jsc-2026-11-17/ios) is never written. Deterministic: run twice, no diff.
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
git diff --quiet -- audits/v1-aif-p0-jsc-2026-11-17 || { echo "build.sh: the historical package changed" >&2; exit 1; }
echo "build.sh: bundle and fixtures written under audits/v1-five-zone-heart-rate-2026-11-25/native/ios; the historical package is unchanged"
