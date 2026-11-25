// V1HR5 (2026-11-25): the successor of v1final-freeze-record.test.mjs on this line. REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE binds the
// frozen bytes of src/v1-run-calibration.mjs and of the frozen bundle, so its verifier fails here BY DESIGN (the amendment changes that file and
// adds three consumed files). This test proves both halves: the amendment's own verifier passes (the original record untouched, one declared
// amended file with its recorded diff, heartRateOf byte-identical, the added files bound, the amended bundle the bound sources), and every
// line the original verifier fails on names only what the amendment declares, never another file.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT=path.resolve(import.meta.dirname,'../..');
const run=script=>spawnSync(process.execPath,[path.join(ROOT,'CoachingCore/scripts',script),'--check'],{cwd:ROOT,encoding:'utf8'});
const RECORD=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json'),'utf8'));
const DECLARED=['CoachingCore/src/v1-run-calibration.mjs',...RECORD.addedConsumed,...RECORD.added];

test('REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1: the amendment verifier passes; the original record is untouched; one declared amended file',()=>{
 const r=run('v1-five-zone-amendment.mjs');assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: its record is byte-identical to 6482749/);
 assert.match(r.stdout,/86\/86 of its other bound files byte-identical; 1 declared amendment/);
 assert.match(r.stdout,/heartRateOf byte-identical to the frozen function/);
 assert.equal(RECORD.kind,'VERSIONED_AMENDMENT_BESIDE_THE_ORIGINAL_FREEZE');assert.deepEqual(RECORD.amended.map(a=>a.file),['CoachingCore/src/v1-run-calibration.mjs']);
 assert.equal(RECORD.original.revision,'REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE');assert.equal(RECORD.original.fileCount,87);assert.equal(RECORD.fileCount,90);
});
test('REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE on this line: it fails by design, and only on what the amendment declares',()=>{
 const r=run('v1-final-release-freeze.mjs');assert.notEqual(r.status,0,'the original verifier must not pass over amended bytes');
 const lines=r.stderr.split('\n').filter(Boolean);assert.ok(lines.length>0);
 for(const l of lines){
  const named=[...l.matchAll(/CoachingCore\/[\w./-]+|audits\/[\w./-]+/g)].map(m=>m[0].replace(/[,.]$/,''));
  assert.ok(named.length===0||named.every(f=>DECLARED.includes(f)),'an undeclared file in: '+l);
  assert.ok(/RC-1|CHANGED and not declared|bundle module not the bound source|NOT byte-identical|NOT BOUND|UNTRACKED/.test(l),'an unexpected kind of failure: '+l);
 }
});
