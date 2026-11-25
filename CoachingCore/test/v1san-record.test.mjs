// REPMILE V1 test-suite sanitization (2026-11-25), review cycle (QRE_SAN_R1 QRE-SAN-04, QRE_SAN_R2 QRE-SAN-10/-11): the historical layer is the
// bytes its record binds. REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2 (audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_LAYER_RECORD.json)
// is written by one commit and never modified; it binds the manifest of historical tests, the suite scripts, package.json, this test, every test
// file holding a successor or an alsoCoveredBy test, the helpers and harness they import and the verifier scripts they run. The same check runs
// in scripts/suite-active.mjs before the suite, and the runner requires this test to run and pass. A change to any bound file (a weakened
// successor, a manifest entry added for a regressed test, a runner that accounts differently) fails until a new record file is written and
// reviewed (HISTORICAL_TEST_POLICY.md §4). Other active tests are not bound: ordinary test work needs no record.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {layerRecordErrors,RECORD_TEST} from '../scripts/suite-manifest.mjs';

test(RECORD_TEST.title,()=>{
 assert.equal(path.basename(import.meta.filename),RECORD_TEST.file);
 assert.deepEqual(layerRecordErrors(path.resolve(import.meta.dirname,'../..')),[]);
});
