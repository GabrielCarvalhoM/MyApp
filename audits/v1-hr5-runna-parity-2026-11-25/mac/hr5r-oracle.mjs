// V1HR5R native validation (2026-11-25): the Node oracle of the corrected five-zone journeys (V1X-HR-FIVE-ZONE-2, the Runna-parity correction),
// copied from V1HR5's hr5-oracle.mjs. Synthetic athletes through createIntegration and the frozen api.mjs, with NO options (the production
// authorities: the five zones are on only if the independent SSCTR record binds the pinned values), every call recorded; the record is replayed
// through hr5r-driver.js over the native ESM modules, twice, and must store the same bytes as the live run. Writes the fixture into THIS
// mission's copy of the iOS package only (the name hr5.json is kept so the copied FiveZoneTests read it):
//   node audits/v1-hr5-runna-parity-2026-11-25/mac/hr5r-oracle.mjs -> audits/v1-hr5-runna-parity-2026-11-25/native/ios/Tests/P0HostTests/Fixtures/hr5.json
// Journeys: a 30-year-old with no device (acceptance 1), declared maximum and custom limits (acceptance 3) with persistence, measured heart rate
// above and below the estimate (acceptance 2), lab, conflict, no age, a hold, invalid requests, a restart, an optical reading, the age range edge.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as integration from '../../../CoachingCore/src/boundary/integration.mjs';
import * as store from '../../../CoachingCore/src/boundary/store.mjs';
import * as api from '../../../CoachingCore/src/boundary/api.mjs';
import * as value from '../../../CoachingCore/src/value.mjs';
import * as zones5 from '../../../CoachingCore/src/v1-heart-rate-zones.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,CONSENTS} from '../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../CoachingCore/test/v1rc-helpers.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const OUT=path.join(HERE,'..','native','ios','Tests','P0HostTests','Fixtures','hr5.json');
const KEY='v1hr5r-device-run-synthetic-key',START='2026-11-14T12:00:00-03:00';
const DEVICE_ONLY=['gpsQuality','measurement'];
const drop=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const json=x=>JSON.parse(JSON.stringify(x));
const code=r=>r.ok===false?r.error.code:'OK';
const ON=zones5.fiveZoneAuthority().approved===true;
assert.ok(ON,'the five zones must be enabled by the independent record for this oracle (SSCTR_HR5R_RECORDS.json bound to the pinned values)');
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});

function journey(name,athleteId,anchors,{age=30}={}){
 let clock=Date.parse(START),n=0,it,ap;const st=store.memoryStore(),m=new Map(),kept=new Map(),steps=[];
 const anchor={get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id)};
 const open=()=>{it=integration.createIntegration({store:st,key:KEY,clock:()=>clock,anchor,newId:p=>p+'_'+String(++n).padStart(6,'0')});ap=api.createBoundary({custody:it,now:()=>clock});};
 open();const actor={athleteId};
 const intake=(a=age)=>{const i=athleteA({weeks:8,id:athleteId});i.athlete.performanceAnchors=json(anchors);if(a!==null)i.athlete.ageYears=a;else{delete i.athlete.ageYears;i.athlete.ageEligible=true;}return i;};
 const J={name,athleteId,steps,
  set(day,time='20:00'){clock=Date.parse(at(day,time));},tick(s){clock+=s*1000;},
  op(op,args={}){steps.push({op,at:clock,args:json(args)});
   if(op==='reopen'){open();return null;}
   if(op.startsWith('raw.')){const raw=st.raw(athleteId);
    if(op==='raw.keep')kept.set(athleteId,raw);else if(op==='raw.restore')st.setRaw(athleteId,kept.get(athleteId));
    else if(op==='raw.tamper'){const i=raw.indexOf(args.find);assert.ok(i>=0,'tamper target '+args.find);st.setRaw(athleteId,raw.slice(0,i)+args.replace+raw.slice(i+args.find.length));}
    return null;}
   const [side,fn]=op.split('.');return (side==='it'?it:ap)[fn]({actor,...json(args)});},
  doc:()=>{const o=it.read({actor});if(!o.ok)throw new Error(o.error.code);return o.doc;},
  env:()=>({program:J.doc().program,presentation:{runSessions:it.presentation({actor}).inForce??{}}}),
  readings:()=>it.presentation({actor}).readings,
  stored:()=>st.raw(athleteId)};
 let k=0;J.rid=tag=>`${tag}-${++k}`;
 J.enroll=(a=age)=>J.op('it.enroll',{intake:intake(a),consents:CONSENTS});
 J.restart=(day,a=age)=>{const u={...intake(a),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  return J.op('it.restart',{intake:u,expectedVersion:J.doc().version});};
 J.form=s=>{const r=reportOf(J.env(),s);return {sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,actual:drop(r.actual,DEVICE_ONLY),response:r.response};};
 J.week=(w,extra={})=>{const day=addDays(J.doc().program.startDate,w*7+6);J.set(day);const obs=liveSessions(J.env(),w).map(J.form);
  return J.op('it.submit',{clientRequestId:J.rid('wk'),expectedVersion:J.doc().version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations:obs,...extra}});};
 J.hr=(profile,rid=J.rid('hr'))=>{J.tick(60);return J.op('it.setHeartRateProfile',{clientRequestId:rid,expectedVersion:J.doc().version,heartRateProfile:profile});};
 J.look=()=>{J.op('it.presentation');J.op('api.plan');};
 return J;
}
const journeys=[];
const five=J=>J.readings()?.runCalibration?.heartRateFiveZones;
const lim=z=>z.zones.map(x=>x.maxBpm).slice(0,4);
// A. Acceptance 1: 30 years, no device: five estimated zones on onboarding, through a week, a reopen, and a tampered cue (the seal covers it).
{const J=journey('hr5r-age30','hr5r-a',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();
 let z=five(J);assert.equal(z.status,'AVAILABLE');assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.deepEqual(lim(z),[123,153,169,184]);
 assert.equal(code(J.week(0)),'OK');J.look();J.op('reopen');J.look();assert.equal(five(J).reference.bpm,190);
 const raw=J.stored(),find='"slowDownCueAtOrAboveBpm":170';assert.ok(raw.includes(find));
 J.op('raw.keep');J.op('raw.tamper',{find,replace:'"slowDownCueAtOrAboveBpm":171'});assert.equal(code(J.op('it.read')),'INTEGRITY_FAILURE');J.op('api.plan');
 J.op('raw.restore');assert.equal(code(J.op('it.read')),'OK');J.look();journeys.push(J);}
// B. Acceptance 3: a declared maximum, then custom limits, kept across a reopen and a week; cleared only by the athlete.
{const J=journey('hr5r-declared','hr5r-b',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();
 assert.equal(code(J.hr({maxHeartRateBpm:195})),'OK');J.look();assert.deepEqual(lim(five(J)),[126,157,173,189]);
 assert.equal(code(J.hr({zoneUpperBpm:[130,150,165,180]})),'OK');J.look();assert.equal(five(J).boundarySource,'ATHLETE_CUSTOM');
 J.op('reopen');J.look();assert.equal(code(J.week(0)),'OK');J.look();assert.equal(five(J).reference.bpm,195);assert.deepEqual(lim(five(J)),[130,150,165,180]);
 assert.equal(code(J.hr({maxHeartRateBpm:null,zoneUpperBpm:null})),'OK');J.look();assert.equal(five(J).reference.kind,'AGE_ESTIMATE');
 const raw=J.stored();J.op('raw.keep');J.op('raw.tamper',{find:'"maxHeartRateBpm":195',replace:'"maxHeartRateBpm":205'});assert.ok(raw.includes('"maxHeartRateBpm":195'));
 assert.equal(code(J.op('it.read')),'INTEGRITY_FAILURE','a changed override is an integrity failure');J.op('raw.restore');J.look();journeys.push(J);}
// C, D. Acceptance 2: a chest-strap maximum above the age estimate replaces it; one below it is shown and not used.
{const J=journey('hr5r-strap-above','hr5r-c',[R10(STRAP(186))],{age:40});assert.equal(code(J.enroll()),'OK');J.look();assert.equal(five(J).reference.kind,'OBSERVED_MAXIMUM');assert.deepEqual(lim(five(J)),[120,150,165,180]);journeys.push(J);}
{const J=journey('hr5r-strap-below','hr5r-d',[R10(STRAP(186))]);assert.equal(code(J.enroll()),'OK');J.look();assert.equal(five(J).reference.kind,'AGE_ESTIMATE');assert.equal(five(J).measurements[0].zone,'Z5');journeys.push(J);}
// E. A lab maximum as supplied (below the age estimate: it is a measurement, it is used).
{const J=journey('hr5r-lab','hr5r-e',[R10(),LAB(190)],{age:25});assert.equal(code(J.enroll()),'OK');J.look();assert.equal(five(J).reference.kind,'LAB_MEASURED_MAXIMUM');assert.equal(J.readings().runCalibration.heartRateZones.basis,'MEASURED_AS_SUPPLIED');journeys.push(J);}
// F. Conflicting measurements (strap 12 bpm above the lab): neither is used; the age estimate is; both are shown.
{const J=journey('hr5r-conflict','hr5r-f',[R10(STRAP(192)),LAB(180)],{age:40});assert.equal(code(J.enroll()),'OK');J.look();const z=five(J);assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.equal(z.conflict.differenceBpm,12);journeys.push(J);}
// G. No age stated (only "adult"): no estimate, typed; a declared maximum gives zones.
{const J=journey('hr5r-noage','hr5r-g',[R10()],{age:null});assert.equal(code(J.enroll()),'OK');J.look();assert.equal(five(J).reason,'AGE_REQUIRED');
 assert.equal(code(J.hr({maxHeartRateBpm:188})),'OK');J.look();assert.equal(five(J).reference.kind,'ATHLETE_DECLARED_MAXIMUM');journeys.push(J);}
// H. A hold: the zones and every cue withheld at once; a declaration during it is recorded and withholds nothing less; the hold persists.
{const J=journey('hr5r-hold','hr5r-h',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();
 const day=addDays(J.doc().program.startDate,2);J.set(day);const r=J.op('it.submit',{clientRequestId:J.rid('pain'),expectedVersion:J.doc().version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]}});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');J.look();assert.equal(five(J).reason,'HOLD_NO_PRESCRIPTION');
 assert.equal(code(J.hr({maxHeartRateBpm:160})),'OK');J.look();assert.equal(five(J).reason,'HOLD_NO_PRESCRIPTION');assert.ok(Object.values(five(J).sessions).every(s=>s.role==='NONE'));
 J.op('reopen');J.look();journeys.push(J);}
// I. Requests the boundary refuses whole, a retry that replays, a reused request id.
{const J=journey('hr5r-invalid','hr5r-i',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();
 for(const p of [{zoneUpperBpm:[150,140,165,180]},{maxHeartRateBpm:'190'},{maxHeartRateBpm:300},{restingBpm:50}])assert.equal(code(J.hr(p)),'INVALID_REQUEST');
 assert.equal(code(J.hr({maxHeartRateBpm:192},'same')),'OK');const again=J.hr({maxHeartRateBpm:192},'same');assert.equal(again.replayed,true);
 assert.equal(code(J.hr({maxHeartRateBpm:193},'same')),'CONFLICT_IDEMPOTENCY_KEY');J.look();journeys.push(J);}
// J. A restart with a new age keeps the athlete's maximum (never overwritten by the intake).
{const J=journey('hr5r-restart','hr5r-j',[R10()]);assert.equal(code(J.enroll()),'OK');assert.equal(code(J.hr({maxHeartRateBpm:195})),'OK');assert.equal(code(J.week(0)),'OK');
 const day=addDays(J.doc().program.startDate,8);J.set(day,'10:00');const r=J.restart(day,31);assert.equal(r.status,'PROPOSED',JSON.stringify(r.errors??r.reason));J.look();
 assert.equal(five(J).reference.kind,'ATHLETE_DECLARED_MAXIMUM');assert.equal(five(J).profile.ageYears,31);journeys.push(J);}
// K. An optical session maximum: classified as one value with its sensor and the optical caveat; never a maximum.
{const J=journey('hr5r-optical','hr5r-k',[R10({heartRate:{maxBpm:176,sensor:'OPTICAL'}})]);assert.equal(code(J.enroll()),'OK');J.look();const z=five(J);
 assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.ok(z.disclosures.includes('OPTICAL_MEASUREMENT'));assert.equal(z.measurements[0].zone,'Z4');journeys.push(J);}
// L. The edges of the formula's range: 18 and 80.
for(const [nm,id,a] of [['hr5r-age18','hr5r-l',18],['hr5r-age80','hr5r-m',80]]){const J=journey(nm,id,[R10()],{age:a});assert.equal(code(J.enroll()),'OK');J.look();assert.equal(five(J).reference.bpm,220-a);journeys.push(J);}

const input={key:KEY,journeys:journeys.map(J=>({name:J.name,athleteId:J.athleteId,steps:J.steps}))};
vm.runInThisContext(fs.readFileSync(path.join(HERE,'hr5r-driver.js'),'utf8'));
const M={integration,store,api,value},text=globalThis.__hr5(M,JSON.stringify(input)),expected=JSON.parse(text);
assert.equal(globalThis.__hr5(M,JSON.stringify(input)),text,'the replay is deterministic');
for(const J of journeys){const live=J.stored(),last=expected.journeys.find(x=>x.name===J.name).steps.findLast(s=>'stored' in s);assert.equal(last.stored,live===null?null:value.hash(JSON.parse(live)),J.name+': replay = live');}
for(const j of expected.journeys)for(const s of j.steps)assert.ok(!s.error,`${j.name}: ${s.op} threw ${s.error}`);
for(const j of expected.journeys)for(const s of j.steps)if(s.fiveZones){assert.ok(!/PRIMARY/.test(s.fiveZones.roles),j.name);if(s.fiveZones.status==='AVAILABLE')assert.equal(s.fiveZones.flags,'false,false,false,false',j.name);}
const unitsIn={from:120,to:230,ageFrom:18,ageTo:80,reference:190,readings:[60,123,123.4,123.5,124,153,154,169,170,184,185,200,29,231],bad:[0,-1,null,'186',1000,119,231,186.5],
 custom:[[130,150,165,180],[150,140,165,180],[130,150,165],[50,150,165,180]],
 series:{sensor:'CHEST_STRAP',source:'HEALTHKIT',samples:[{t:0,bpm:110},{t:5,bpm:140},{t:10,bpm:160},{t:15,bpm:170},{t:20,bpm:185},{t:25,bpm:999},{t:30,bpm:175,artifact:true},{t:35,bpm:175},{t:50,bpm:150},{t:55,bpm:150},{t:60,bpm:150},{t:65,bpm:150}]},
 limits:{maxGapSeconds:10,minCoverageFraction:0.5,minSamples:2,plausibleBpm:[30,230]}};
const units=globalThis.__hr5units(zones5,JSON.stringify(unitsIn));assert.equal(globalThis.__hr5units(zones5,JSON.stringify(unitsIn)),units);
const U=JSON.parse(units);assert.equal(U.valid,true,'the pinned values are read');assert.equal(U.ages['30'],'123,153,169,184');assert.equal(Object.keys(U.edges).length,111);
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify({driver:fs.readFileSync(path.join(HERE,'hr5r-driver.js'),'utf8'),inputJSON:JSON.stringify(input),expected,unitsInputJSON:JSON.stringify(unitsIn),unitsExpectedJSON:units},null,1)+'\n');
const summary=Object.fromEntries(expected.journeys.map(j=>[j.name,[...new Set(j.steps.filter(s=>s.fiveZones).map(s=>[s.fiveZones.status,s.fiveZones.reason??s.fiveZones.reference,s.fiveZones.boundarySource,s.fiveZones.edges].filter(Boolean).join(' | ')))]]));
console.log(JSON.stringify({ok:true,fiveZoneBoundaryOn:ON,out:path.relative(REPO,OUT),digest:expected.digest,steps:expected.journeys.reduce((a,j)=>a+j.steps.length,0),summary},null,1));
