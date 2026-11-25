// REPMILE V1 test-suite sanitization (2026-11-25), review cycle (QRE_SAN_R1 QRE-SAN-04): the historical layer is the bytes its record binds.
// REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1 (audits/v1-test-suite-sanitization-2026-11-25/SANITIZATION_RECORD.json, written by commit
// 254738a) binds the manifest of historical tests, the three suite scripts, package.json and every test file holding a successor or an
// alsoCoveredBy test. A change to any of them (a weakened successor, a manifest entry added for a test that regressed, a runner that accounts
// differently) fails here until a new record version is written and reviewed (HISTORICAL_TEST_POLICY.md §4). Other active tests are not bound:
// ordinary test work needs no record.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const ROOT=path.resolve(import.meta.dirname,'../..');
const RECORD='audits/v1-test-suite-sanitization-2026-11-25/SANITIZATION_RECORD.json',RECORD_COMMIT='254738a';
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');

test('REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1: the record is the bytes of its commit, and the historical layer is the bytes it binds',()=>{
 const sealed=execFileSync('git',['show',`${RECORD_COMMIT}:${RECORD}`],{cwd:ROOT,maxBuffer:1<<26});
 assert.equal(sha(RECORD),createHash('sha256').update(sealed).digest('hex'),'the record is not rewritten');
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8'));
 assert.equal(rec.revision,'REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1');
 assert.equal(rec.filesDigest,createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(rec.files).sort()))).digest('hex'),'the record is internally consistent');
 const changed=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f);
 assert.deepEqual(changed,[],'the historical layer changed without a new record');
 const m=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/test/HISTORICAL_TESTS.json'),'utf8'));
 assert.equal(m.entries.length,rec.historicalEntries);
 const succ=[...new Set(m.entries.flatMap(e=>[e.successor,...e.alsoCoveredBy]).map(x=>'CoachingCore/test/'+x.file))].sort();
 assert.deepEqual(succ,rec.successorFiles,'every successor file is bound');
});
