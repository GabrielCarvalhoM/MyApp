// V1HR5R (2026-11-25): successors of the tests this correction makes fail BY DESIGN, each proving what the original proved with the declared
// change set aside, and the verifier of REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2.
// - v1hr5-amendment-record.test.mjs (REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1's own test) binds the revision-1 bytes, so it fails here, as
//   v1final-freeze-record.test.mjs already does on the first amendment's line. Its successor: the second amendment's verifier passes, and every
//   line the first amendment's verifier fails on names only what the second amendment declares.
// - v1core-expiry.test.mjs "QRE-AIF-01: before and on the review-by day, the answer of the new entry point is the answer below it, byte for byte":
//   the composed entry now adds heartRateProfileRecord and heartRateProfileDeclared and resolves the five-zone reading with the profile. Its
//   successor: byte for byte with those two keys and the five-zone reading (and the reading hash that covers it) set aside.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import * as S from '../src/v1-safety-index.mjs';
import * as below from '../src/v1-strength-index.mjs';
import {client,athleteA,at,ELIG,addDays,notFeeling100WithSign} from './v1core-helpers.mjs';

const ROOT=path.resolve(import.meta.dirname,'../..');
const run=script=>spawnSync(process.execPath,[path.join(ROOT,'CoachingCore/scripts',script),'--check'],{cwd:ROOT,encoding:'utf8'});
const RECORD_PATH=path.join(ROOT,'CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json');

test('REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2: the verifier passes; both earlier records untouched; the run calibration byte-identical',{skip:!fs.existsSync(RECORD_PATH)&&'the record is written by the closing commit'},()=>{
 const r=run('v1-hr5-runna-amendment.mjs');assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: its record is byte-identical to 6482749/);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1: its record is byte-identical to bec39c5/);
 assert.match(r.stdout,/src\/v1-run-calibration\.mjs: byte-identical to the bytes REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1 binds/);
 assert.match(r.stdout,/V1X-RUN-HR-FIVE-ZONE ENABLED by SSCTR-HR5R-RECHECK-r1/);
 const rec=JSON.parse(fs.readFileSync(RECORD_PATH,'utf8'));assert.equal(rec.revision,'REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2');assert.equal(rec.first.revision,'REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1');
});
test('successor of v1hr5-amendment-record.test.mjs: REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1 fails by design, and only on what the second amendment declares',{skip:!fs.existsSync(RECORD_PATH)&&'the record is written by the closing commit'},()=>{
 const rec=JSON.parse(fs.readFileSync(RECORD_PATH,'utf8'));
 const DECLARED=[...rec.amended.map(a=>a.file),...Object.keys(rec.amendedTests),...rec.added,...rec.addedConsumed,...rec.noLongerConsumed,'CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json'];
 for(const script of ['v1-five-zone-amendment.mjs','v1-final-release-freeze.mjs']){
  const r=run(script);assert.notEqual(r.status,0,script+' must not pass over the amended bytes');
  const lines=r.stderr.split('\n').filter(Boolean);assert.ok(lines.length>0);
  // The original freeze's verifier also names the first amendment's own files (as it did on that line).
  const first=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json'),'utf8'));
  const allowed=script==='v1-final-release-freeze.mjs'?[...DECLARED,'CoachingCore/src/v1-run-calibration.mjs','CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json',...first.addedConsumed,...first.added]:DECLARED;
  for(const l of lines){
   const named=[...l.matchAll(/CoachingCore\/[\w./-]+|audits\/[\w./-]+/g)].map(m=>m[0].replace(/[,.]$/,''));
   assert.ok(named.every(f=>allowed.includes(f)),script+': an undeclared file in: '+l);
   assert.ok(/RC-1|CHANGED and not declared|bundle module not the bound source|bundle asset differs|NOT byte-identical|NOT BOUND|UNTRACKED|CONSUMED and not declared|other bound files byte-identical|not in the amended bundle|five-zone values|diff is not the recorded|bundle is not the one|enabling state/.test(l),script+': an unexpected kind of failure: '+l);
  }
 }
});
test('successor of QRE-AIF-01 (v1core-expiry.test.mjs): before and on the review-by day, the new entry point answers as the one below it, the heart-rate profile keys and the five-zone reading set aside',()=>{
 const i=athleteA({weeks:8,id:'core-expiry'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);
 const c=client(S);assert.equal(c.onboard(i).status,'PROPOSED');
 const plain=r=>{const {heartRateProfileRecord:_a,heartRateProfileDeclared:_b,...rest}=r;if(rest.runCalibration&&typeof rest.runCalibration==='object'){const {heartRateFiveZones:_f,hash:_h,...rc}=rest.runCalibration;rest.runCalibration=rc;}return rest;};
 for(const day of ['2027-04-25','2027-04-29','2027-04-30']){
  for(const rv of [c.input('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),'s-'+day),c.input('WEEKLY_REVIEW',at(day,'20:00'),{eligibility:ELIG(day)},'w-'+day)]){
   const a=S.evaluateProgram(c.env.program,rv),b=below.evaluateProgram(c.env.program,rv);
   assert.equal(JSON.stringify(plain(a)),JSON.stringify(plain(b)));
   assert.ok(Array.isArray(a.heartRateProfileRecord));
   if(b.runCalibration?.heartRateFiveZones)assert.equal(a.runCalibration.heartRateFiveZones.model,b.runCalibration.heartRateFiveZones.model);
  }
 }
});
