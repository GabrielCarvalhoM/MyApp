// V1HR5 native validation (2026-11-25): the Node oracle of the five-zone journeys (the final-oracle.mjs pattern). Synthetic athletes through
// createIntegration and the frozen api.mjs, with NO options (the production authorities: the five zones are on only if the independent SSCTR
// record binds the pinned values), every call recorded; the record is replayed through hr5-driver.js over the native ESM modules, twice, and
// must store the same bytes as the live run. Writes the fixture into THIS mission's copy of the iOS package only:
//   node audits/v1-five-zone-heart-rate-2026-11-25/mac/hr5-oracle.mjs  -> audits/v1-five-zone-heart-rate-2026-11-25/native/ios/Tests/P0HostTests/Fixtures/hr5.json
// Deterministic: running it again leaves `git diff` empty. Journeys: chest strap, lab, conflict, none (watchless), invalid and extreme values,
// a hold, a maximum declared during the plan (week boundary), a restart, a reopen (persistence) and a tampered five-zone value (integrity).
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
const {fiveZoneAuthority}=zones5;
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,CONSENTS} from '../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../CoachingCore/test/v1rc-helpers.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const OUT=path.join(HERE,'..','native','ios','Tests','P0HostTests','Fixtures','hr5.json');
const KEY='v1hr5-device-run-synthetic-key',START='2026-11-14T12:00:00-03:00';
const DEVICE_ONLY=['gpsQuality','measurement'];
const drop=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const json=x=>JSON.parse(JSON.stringify(x));
const code=r=>r.ok===false?r.error.code:'OK';
const ON=fiveZoneAuthority().approved===true;
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
// A lab test as SSCTR-HR5-DECISION-r1 HR5-2 needs it: a declared running test (lab.modality), ECG or chest strap, RPE 8 or more, tolerated.
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});

function journey(name,athleteId,anchors){
 let clock=Date.parse(START),n=0,it,ap;const st=store.memoryStore(),m=new Map(),kept=new Map(),steps=[];
 const anchor={get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id)};
 const open=()=>{it=integration.createIntegration({store:st,key:KEY,clock:()=>clock,anchor,newId:p=>p+'_'+String(++n).padStart(6,'0')});ap=api.createBoundary({custody:it,now:()=>clock});};
 open();const actor={athleteId};
 const intake=()=>{const i=athleteA({weeks:8,id:athleteId});i.athlete.performanceAnchors=json(anchors);return i;};
 const J={name,athleteId,steps,
  set(day,time='20:00'){clock=Date.parse(at(day,time));},
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
 J.enroll=()=>J.op('it.enroll',{intake:intake(),consents:CONSENTS});
 // A restart intake as the final journeys build it (final-oracle.mjs restartIntake): today's screen, a start three days on, a nonclinical pause.
 J.restart=day=>{const u={...intake(),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  return J.op('it.restart',{intake:u,expectedVersion:J.doc().version});};
 J.form=s=>{const r=reportOf(J.env(),s);return {sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,actual:drop(r.actual,DEVICE_ONLY),response:r.response};};
 J.week=(w,extra={})=>{const day=addDays(J.doc().program.startDate,w*7+6);J.set(day);const obs=liveSessions(J.env(),w).map(J.form);
  return J.op('it.submit',{clientRequestId:J.rid('wk'),expectedVersion:J.doc().version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations:obs,...extra}});};
 J.look=()=>{J.op('it.presentation');J.op('api.plan');};
 return J;
}
const journeys=[];
const five=J=>J.readings()?.runCalibration?.heartRateFiveZones;
// A. Chest strap: zones on onboarding, through a week, a reopen (persistence), and a tampered five-zone value (the seal covers the reading).
{const J=journey('hr5-strap','hr5-a',[R10(STRAP(186))]);assert.equal(code(J.enroll()),'OK');J.look();
 if(ON){const z=five(J);assert.equal(z.status,'AVAILABLE');assert.deepEqual(z.zones.map(x=>x.fromBpm),[null,134,149,162,171]);}
 assert.equal(code(J.week(0)),'OK');J.look();J.op('reopen');J.look();
 const raw=J.stored(),find=ON?'"slowDownCueAtOrAboveBpm":162':'"reason":"EXTENSION_NOT_ENABLED"';assert.ok(raw.includes(find));
 J.op('raw.keep');J.op('raw.tamper',{find,replace:ON?'"slowDownCueAtOrAboveBpm":172':'"reason":"NO_MEASURED_HEART_RATE"'});
 const t=J.op('it.read');assert.equal(code(t),'INTEGRITY_FAILURE','a changed five-zone value is an integrity failure');J.op('api.plan');
 J.op('raw.restore');assert.equal(code(J.op('it.read')),'OK');J.look();journeys.push(J);}
// B. Lab maximum as supplied (the three-zone output shows the supplied values).
{const J=journey('hr5-lab','hr5-b',[R10(),LAB(190)]);assert.equal(code(J.enroll()),'OK');J.look();
 if(ON){const z=five(J);assert.equal(z.reference.kind,'LAB_MEASURED_MAXIMUM');assert.equal(J.readings().runCalibration.heartRateZones.basis,'MEASURED_AS_SUPPLIED');}journeys.push(J);}
// C. Conflicting references: a chest-strap maximum 12 bpm above the lab maximum gives no zones (HR5-3), both reported.
{const J=journey('hr5-conflict','hr5-c',[R10(STRAP(192)),LAB(180)]);assert.equal(code(J.enroll()),'OK');J.look();if(ON){assert.equal(five(J).reason,'REFERENCE_CONFLICT');assert.equal(five(J).conflict.differenceBpm,12);}journeys.push(J);}
// D. No heart rate at all (no watch): the plan, the week and the review run by effort, exactly.
{const J=journey('hr5-none','hr5-d',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();assert.equal(code(J.week(0)),'OK');J.look();assert.equal(code(J.week(1)),'OK');J.look();
 if(ON)assert.equal(five(J).reason,'NO_MEASURED_HEART_RATE');journeys.push(J);}
// E. Invalid values (optical, out of range, not a number): no zones, no failure.
{const J=journey('hr5-invalid','hr5-e',[R10({heartRate:{maxBpm:186,sensor:'OPTICAL'}}),{id:'tt-x',...result('5K',1500,'2026-10-25',{heartRate:{maxBpm:300,sensor:'CHEST_STRAP'}})},{id:'tt-y',...result('5K',1500,'2026-10-18',{heartRate:{maxBpm:'188',sensor:'CHEST_STRAP'}})}]);
 assert.equal(code(J.enroll()),'OK');J.look();if(ON){assert.equal(five(J).status,'UNAVAILABLE');assert.equal(five(J).reason,'HEART_RATE_DATA_NOT_QUALIFYING');}journeys.push(J);}
// F, G. The extremes of the plausible range.
for(const [name,id,bpm] of [['hr5-extreme-low','hr5-f',140],['hr5-extreme-high','hr5-g',220]]){const J=journey(name,id,[R10(STRAP(bpm))]);assert.equal(code(J.enroll()),'OK');J.look();if(ON)assert.equal(five(J).reference.bpm,bpm);journeys.push(J);}
// H. A hold: a warning sign withholds the zones and every cue at once; the hold persists.
{const J=journey('hr5-hold','hr5-h',[R10(STRAP(186))]);assert.equal(code(J.enroll()),'OK');J.look();
 const day=addDays(J.doc().program.startDate,2);J.set(day);const r=J.op('it.submit',{clientRequestId:J.rid('pain'),expectedVersion:J.doc().version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]}});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');J.look();J.op('reopen');J.look();
 if(ON){assert.equal(five(J).reason,'HOLD_NO_PRESCRIPTION');assert.ok(Object.values(five(J).sessions).every(s=>s.role==='NONE'));}journeys.push(J);}
// I. Declared evidence during the plan: the frozen boundary admits no `runEvidence` in a review (custody's review keys; a contract finding of
// this mission, not changed here), so it is refused whole and nothing moves; the athlete then trains by effort as before.
{const J=journey('hr5-declared','hr5-i',[R10()]);assert.equal(code(J.enroll()),'OK');J.look();
 const day=addDays(J.doc().program.startDate,2);J.set(day);
 const r=J.op('it.submit',{clientRequestId:J.rid('ev'),expectedVersion:J.doc().version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations:[],runEvidence:[{id:'tt-1',kind:'TIME_TRIAL',distance:'5K',seconds:1500,date:addDays(day,-1),measurement:'GPS',rpe:9,tolerated:true,...STRAP(188)}]}});
 assert.equal(code(r),'INVALID_REQUEST','the frozen boundary refuses declared evidence in a review');J.look();assert.equal(code(J.week(0)),'OK');J.look();journeys.push(J);}
// J. A restart from the canonical record: the intake's own anchor gives the reference of the new plan.
{const J=journey('hr5-restart','hr5-j',[R10(STRAP(186))]);assert.equal(code(J.enroll()),'OK');assert.equal(code(J.week(0)),'OK');
 const day=addDays(J.doc().program.startDate,8);J.set(day,'10:00');const r=J.restart(day);assert.equal(r.status,'PROPOSED',JSON.stringify(r.errors??r.reason));J.look();
 if(ON)assert.equal(five(J).reference.bpm,186);journeys.push(J);}

const input={key:KEY,journeys:journeys.map(J=>({name:J.name,athleteId:J.athleteId,steps:J.steps}))};
vm.runInThisContext(fs.readFileSync(path.join(HERE,'hr5-driver.js'),'utf8'));
const M={integration,store,api,value},text=globalThis.__hr5(M,JSON.stringify(input)),expected=JSON.parse(text);
assert.equal(globalThis.__hr5(M,JSON.stringify(input)),text,'the replay is deterministic');
for(const J of journeys){const live=J.stored(),last=expected.journeys.find(x=>x.name===J.name).steps.findLast(s=>'stored' in s);assert.equal(last.stored,live===null?null:value.hash(JSON.parse(live)),J.name+': replay = live');}
for(const j of expected.journeys)for(const s of j.steps)assert.ok(!s.error,`${j.name}: ${s.op} threw ${s.error}`);
// Heart rate is never primary and never a target in any step of any journey.
for(const j of expected.journeys)for(const s of j.steps)if(s.fiveZones){assert.ok(!/PRIMARY/.test(s.fiveZones.roles),j.name);if(s.fiveZones.status==='AVAILABLE')assert.equal(s.fiveZones.flags,'false,false,false,false',j.name);}
// The module-level checks, the same driver text: every plausible maximum, readings on the edges of a 186 bpm reference, a series, refusals.
const unitsIn={from:140,to:220,reference:186,readings:[60,133,134,148,149,161,162,170,171,200,29,231],bad:[0,-1,null,'186',1000],
 series:{sensor:'CHEST_STRAP',samples:[{t:0,bpm:120},{t:5,bpm:140},{t:10,bpm:150},{t:15,bpm:165},{t:20,bpm:175},{t:25,bpm:999},{t:30,bpm:175,artifact:true},{t:35,bpm:175},{t:50,bpm:150},{t:55,bpm:150}]},
 // TEST-ONLY classifier limits: SSCTR-HR5-DECISION-r1 HR5-7 sets none (a future SSCTR and Data review of a series channel does).
 limits:{maxGapSeconds:10,minCoverageFraction:0.5,plausibleBpm:[30,220]}};
const units=globalThis.__hr5units(zones5,JSON.stringify(unitsIn));assert.equal(globalThis.__hr5units(zones5,JSON.stringify(unitsIn)),units);
assert.equal(JSON.parse(units).valid,true,'the pinned values are read');
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify({driver:fs.readFileSync(path.join(HERE,'hr5-driver.js'),'utf8'),inputJSON:JSON.stringify(input),expected,unitsInputJSON:JSON.stringify(unitsIn),unitsExpectedJSON:units},null,1)+'\n');
const summary=Object.fromEntries(expected.journeys.map(j=>[j.name,[...new Set(j.steps.filter(s=>s.fiveZones).map(s=>[s.fiveZones.status,s.fiveZones.reason??s.fiveZones.reference,s.fiveZones.edges].filter(Boolean).join(' | ')))]]));
console.log(JSON.stringify({ok:true,fiveZoneBoundaryOn:ON,out:path.relative(REPO,OUT),digest:expected.digest,steps:expected.journeys.reduce((a,j)=>a+j.steps.length,0),summary},null,1));
