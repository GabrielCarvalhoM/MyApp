// REPMILE CoachingCore V1 final physical validation (2026-11-24): the Node oracle of the final journeys (the int-oracle.mjs pattern).
// Journeys A, C, E and F of test/v1int-journeys.test.mjs (B, D, G and H are in int.json already), the G07 erasure, SEC-BC-R2-01, the clock (D1)
// and the storage failures, run live through createIntegration and the frozen api.mjs, every call recorded (operation, clock, arguments). The
// record is replayed through final-driver.js over the native ESM modules; the replay must store the same bytes as the live run, twice.
//   node audits/v1-final-physical-2026-11-24/mac/final-oracle.mjs  -> audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/final.json
// Deterministic: running it again must leave `git diff` empty. Synthetic athletes only. No sporting rule is stated here: every outcome is the
// engine's and the boundary's, recorded as they answer.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as integration from '../../../CoachingCore/src/boundary/integration.mjs';
import * as store from '../../../CoachingCore/src/boundary/store.mjs';
import * as api from '../../../CoachingCore/src/boundary/api.mjs';
import * as value from '../../../CoachingCore/src/value.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness,CONSENTS} from '../../../CoachingCore/test/v1int-helpers.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const OUT=path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17','ios','Tests','P0HostTests','Fixtures','final.json');
const KEY='v1final-device-run-synthetic-key',START='2026-11-14T12:00:00-03:00';
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const DEVICE_ONLY=['gpsQuality','measurement'],ATHLETE_ONLY=['conditions','walkBreaks','stop','rpe'];
const drop=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const json=x=>JSON.parse(JSON.stringify(x));
const code=r=>r.ok===false?r.error.code:'OK';

/** One journey executed live with exactly the driver's construction, every call recorded as the driver replays it. */
function journey(name,athleteId){
 let clock=Date.parse(START),n=0,it,ap;const st=store.memoryStore(),m=new Map(),kept=new Map(),steps=[];
 const anchor={get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id)};
 const open=()=>{it=integration.createIntegration({store:st,key:KEY,clock:()=>clock,anchor,newId:p=>p+'_'+String(++n).padStart(6,'0')});ap=api.createBoundary({custody:it,now:()=>clock});};
 open();
 const actor={athleteId};
 const J={name,athleteId,
  set(day,time='20:00'){clock=Date.parse(at(day,time));},
  op(op,args={}){
   steps.push({op,at:clock,args:json(args)});
   const who=args.athleteId??athleteId;
   if(op==='reopen'){open();return null;}
   if(op.startsWith('raw.')){const raw=st.raw(who);
    if(op==='raw.keep')kept.set(who,raw);else if(op==='raw.restore')st.setRaw(who,kept.get(who));else if(op==='raw.drop')st.remove(who);
    else if(op==='raw.tamper'){const i=raw.indexOf(args.find);assert.ok(i>=0,'tamper target');st.setRaw(who,raw.slice(0,i)+args.replace+raw.slice(i+args.find.length));}
    return null;}
   const [side,fn]=op.split('.');return (side==='it'?it:ap)[fn]({actor,...json(args)});
  },
  // Reads used only to build later arguments (never recorded; the replay check below proves they changed nothing).
  doc:(who=athleteId)=>{const o=it.read({actor:{athleteId:who}});if(!o.ok)throw new Error(o.error.code);return o.doc;},
  env:(who=athleteId)=>({program:J.doc(who).program,presentation:{runSessions:it.presentation({actor:{athleteId:who}}).inForce??{}}}),
  sessions:(w,who)=>liveSessions(J.env(who),w),
  version:(who)=>J.doc(who).version,
  form:(s,{actual={},response={}}={},who)=>{const r=reportOf(J.env(who),s);return {sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,actual:{...drop(r.actual,DEVICE_ONLY),...actual},response:{...r.response,...response}};},
  watch:(s,{activityId=`HK-${s.id}`,endTime='07:45',observedAt,actual={}}={},who)=>{const r=reportOf(J.env(who),s);return {activityId,activityType:'RUN',sessionId:s.id,observedAt:observedAt??at(s.date,endTime),actual:{...drop(r.actual,ATHLETE_ONLY),...actual}};},
  stored:()=>st.raw(athleteId),
  steps};
 let k=0;J.rid=tag=>`${tag}-${++k}`;
 J.enroll=(who=athleteId)=>J.op('it.enroll',{...(who!==athleteId?{actor:{athleteId:who}}:{}),intake:athleteA({weeks:8,id:who}),consents:CONSENTS});
 J.weekly=(day,observations,{rid=J.rid('wk'),who,expectedVersion,extra={}}={})=>J.op('it.submit',{...(who?{actor:{athleteId:who}}:{}),clientRequestId:rid,expectedVersion:expectedVersion??J.version(who),review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations,...extra}});
 J.screen=(day,who)=>J.op('it.submit',{...(who?{actor:{athleteId:who}}:{}),clientRequestId:J.rid('screen'),expectedVersion:J.version(who),review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(day)}});
 J.import=(activities,{rid=J.rid('hk'),who,expectedVersion}={})=>J.op('it.importActivities',{...(who?{actor:{athleteId:who}}:{}),clientRequestId:rid,expectedVersion:expectedVersion??J.version(who),activities});
 J.plan=()=>J.op('api.plan',{});
 return J;
}
const restartIntake=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};
const journeys=[];

// A, first plan: onboarding, the plan and its records kept, a new process over the stored bytes, the plan shown as valid.
{const J=journey('final-a-first-plan','fa');assert.equal(code(J.enroll()),'OK');J.plan();J.op('it.carried');J.op('reopen');
 const v=J.plan();assert.equal(v.view.state,'VALID_PLAN');J.op('it.presentation');J.op('api.sessions');J.op('api.history');J.op('api.status');journeys.push(J);}

// C, strength: sets and loads logged by the athlete (the form, then the frozen api.mjs logStrength), a new process, a review: kept as sent.
{const J=journey('final-c-strength','fc');J.enroll();const str=J.sessions(0).filter(x=>x.sport==='STRENGTH'),s=str[0];
 J.set(s.date);const f=J.form(s);assert.equal(code(J.weekly(s.date,[f])),'OK');J.op('reopen');J.set(s.date,'21:00');
 assert.equal(code(J.weekly(s.date,[])),'OK');
 const s2=str[1];J.set(s2.date,'19:00');const f2=J.form(s2);
 const ls=J.op('api.logStrength',{clientRequestId:'fc-api',expectedVersion:J.version(),sessionId:s2.id,occurredOn:s2.date,completed:true,minutes:f2.actual.minutes,exercises:f2.actual.exercises,response:f2.response,eligibility:ELIG(s2.date)});
 assert.equal(code(ls),'OK');J.op('api.history');J.plan();journeys.push(J);}

// E, invalid corrections: another athlete's event, another author, a forged identity: refused, the record byte-identical.
{const J=journey('final-e-invalid-corrections','fe');J.enroll();J.enroll('fe-other');const s=J.sessions(0).find(x=>x.id==='w0-run-d1');
 J.set(s.date,'08:00');J.screen(s.date,'fe-other');const theirs=J.import([J.watch(J.sessions(0,'fe-other').find(x=>x.id==='w0-run-d1'),{},'fe-other')],{who:'fe-other'}).recorded[0];
 J.screen(s.date);const hk=J.import([J.watch(s)]).recorded[0];J.set(s.date,'20:00');const before=J.stored();
 assert.equal(code(J.weekly(s.date,[{...J.form(s),correctionOf:theirs}])),'CORRECTION_TARGET_NOT_FOUND');
 assert.equal(code(J.weekly(s.date,[{...J.form(s),correctionOf:hk}])),'CROSS_AUTHOR_CORRECTION');
 assert.equal(code(J.op('it.submit',{actor:{athleteId:'fe-other'},clientRequestId:'x',expectedVersion:J.version(),review:{kind:'WEEKLY_REVIEW',observations:[{...J.form(s),correctionOf:hk}]}})),'CORRECTION_TARGET_NOT_FOUND');
 assert.equal(J.stored(),before);journeys.push(J);}

// F, a restart: a plan, its records, a pause, a new plan from the canonical record, a new process, the new plan continues.
{const J=journey('final-f-restart','ff');J.enroll();const w0=J.sessions(0),sun=addDays(J.doc().program.startDate,6);
 J.set(sun,'19:00');J.screen(sun);J.import(w0.filter(s=>s.sport==='RUN').map(s=>J.watch(s)));J.set(sun,'20:00');assert.equal(code(J.weekly(sun,w0.map(s=>J.form(s)))),'OK');
 const day=addDays(sun,12);J.set(day,'10:00');
 const r=J.op('it.restart',{intake:restartIntake('ff',day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),expectedVersion:J.version()});assert.equal(r.status,'PROPOSED');
 J.op('reopen');const s=J.sessions(0)[0];J.set(s.date);assert.equal(code(J.weekly(s.date,[J.form(s)])),'OK');J.plan();journeys.push(J);}

// G07, erasure: a hold, its report erased (an erasure is never readiness: BLOCKED), a delivery waits for a new screen (SCREEN_REQUIRED);
// a symptom stop, an erasure, the stop still screened (safety retention); a readiness declaration and a new screen are what continue.
{const J=journey('final-g07-erasure','fg');J.enroll();const p=J.doc().program,d0=addDays(p.startDate,1),s=J.sessions(0).find(x=>x.id==='w0-run-d1');
 J.set(s.date,'20:00');const stop=J.weekly(s.date,[{...J.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]);
 assert.equal(code(stop),'OK');assert.equal(stop.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 const h=addDays(p.startDate,4);J.set(h,'08:00');const hold=J.op('api.notFeeling100',{clientRequestId:'fg-hold',expectedVersion:J.version(),...notFeeling100WithSign(h)});assert.equal(code(hold),'OK');
 assert.equal(J.plan().view.state,'BLOCKED');J.set(h,'09:00');
 const holdIds=J.doc().rows.filter(r=>r&&r.fact).map(r=>r.eventId);
 const er=J.op('it.eraseHealthFacts',{eventIds:holdIds,expectedVersion:J.version()});assert.equal(code(er),'OK');
 const v=J.plan();assert.equal(v.view.state,'BLOCKED','an erasure is not readiness');assert.equal(v.view.week.sessions.filter(x=>x.executable).length,0);
 const s2=J.sessions(0).find(x=>x.id==='w0-run-d3');J.set(h,'10:00');
 const wait=J.import([J.watch(s2,{observedAt:at(h,'07:45')})]);assert.equal(code(wait),'SCREEN_REQUIRED');
 const rd=addDays(h,1);J.set(rd,'08:00');const ready=J.op('api.declareReadiness',{clientRequestId:'fg-ready',expectedVersion:J.version(),...readiness(rd)});assert.equal(code(ready),'OK');
 J.plan();J.set(rd,'09:00');J.screen(rd);J.set(rd,'10:00');J.import([J.watch(s2,{observedAt:at(rd,'07:45')})]);J.plan();journeys.push(J);}

// SEC-BC-R2-01: one operation with the clock 20 days ahead, the clock set right, the report of a standing hold erased: BLOCKED, nothing
// executable, writes locked until the clock passes the record's latest instant; then the engine reads the hold too.
{const J=journey('final-sec-bc-r2-01','fr');J.enroll();const d0=J.sessions(0)[0].date,d=k=>addDays(d0,k);
 const nf=(k,rid)=>{J.set(d(k),'09:00');return J.op('api.notFeeling100',{clientRequestId:rid,expectedVersion:J.version(),...notFeeling100WithSign(d(k))});};
 nf(0,'nf1');J.set(d(1),'09:00');J.op('api.declareReadiness',{clientRequestId:'rd1',expectedVersion:J.version(),...readiness(d(1))});const target=nf(3,'nf2');
 J.set(d(20),'09:00');assert.equal(code(J.weekly(d(3),[])),'OK');J.set(d(3),'10:00');
 assert.equal(code(J.op('it.eraseHealthFacts',{eventIds:[target.eventId],expectedVersion:J.version()})),'OK');J.set(d(3),'11:00');
 const v=J.plan();assert.equal(v.view.state,'BLOCKED');assert.equal(v.view.week.sessions.filter(x=>x.executable).length,0);J.op('api.status');
 assert.equal(code(J.weekly(d(3),[])),'CLOCK_BEHIND_RECORD');J.set(d(21),'09:00');assert.equal(J.weekly(d(21),[]).status,'CLINICAL_HUMAN_REQUIRED');J.plan();journeys.push(J);}

// D1, the clock: a workout 299 s and 301 s ahead of the operation clock (the engine's own 300 s tolerance), a clock behind the record (writes
// refused; a revocation and an erasure still pass), and a clock a day ahead, which the boundary itself accepts: bounding it by a trusted
// reference is the app's obligation (NATIVE_OBLIGATIONS §5.1).
{const J=journey('final-d1-clock','fd');J.enroll();const s=J.sessions(0).find(x=>x.id==='w0-run-d1'),s3=J.sessions(0).find(x=>x.id==='w0-run-d3');
 J.set(s.date,'08:00');J.screen(s.date);const t0=Date.parse(at(s.date,'08:00'));
 J.import([J.watch(s,{activityId:'HK-skew-299',observedAt:new Date(t0+299e3).toISOString()})]);
 J.import([J.watch(s3,{activityId:'HK-skew-301',observedAt:new Date(t0+301e3).toISOString()})]);
 J.set(s.date,'20:00');J.weekly(s.date,[J.form(s)]);
 J.set(s.date,'07:00');assert.equal(code(J.weekly(s.date,[J.form(s3)])),'CLOCK_BEHIND_RECORD');
 assert.equal(code(J.op('it.setConsent',{purpose:'LEARNING',granted:false,expectedVersion:J.version()})),'OK');
 J.set(s.date,'20:30');J.op('it.setConsent',{purpose:'LEARNING',granted:true,expectedVersion:J.version()});
 const ahead=addDays(s.date,1);J.set(ahead,'20:00');J.weekly(ahead,[]);J.plan();journeys.push(J);}

// H, storage and identity failures: a retried request (replayed), a stale version, a report before the record began, the same workout twice,
// a backup restored over a newer record (RECORD_ROLLED_BACK), the athlete's explicit acknowledgement, a new plan, one stored character altered
// (INTEGRITY_FAILURE), the file lost (RECORD_LOST), and account erasure (GONE).
{const J=journey('final-h-storage','fh');J.enroll();const s=J.sessions(0).find(x=>x.id==='w0-run-d1'),first=J.doc().program.startDate;
 J.set(s.date,'20:00');const v1=J.version(),f=J.form(s);
 assert.equal(code(J.weekly(s.date,[f],{rid:'fh-once',expectedVersion:v1})),'OK');assert.equal(J.weekly(s.date,[f],{rid:'fh-once',expectedVersion:v1}).replayed,true);
 assert.equal(code(J.weekly(s.date,[J.form(J.sessions(0).find(x=>x.id==='w0-run-d3'))],{expectedVersion:v1})),'CONFLICT_STALE_VERSION');
 assert.equal(code(J.weekly(s.date,[{...f,sessionId:undefined,occurrenceDate:addDays(first,-3)}])),'BEFORE_RECORD_START');
 J.set(s.date,'20:10');J.screen(s.date);J.import([J.watch(s)],{rid:'fh-hk'});J.import([J.watch(s)]);
 J.op('raw.keep');J.set(s.date,'21:00');J.weekly(s.date,[]);J.op('raw.restore');
 assert.equal(code(J.op('it.read')),'RECORD_ROLLED_BACK');J.op('api.plan');assert.equal(code(J.op('it.acknowledgeRecordLoss')),'OK');
 // A new plan is a new intake, dated the day it is made (the athlete starts over explicitly).
 const fresh=day=>({actor:{athleteId:'fh'},intake:{...athleteA({weeks:8,id:'fh'}),asOf:day,startDate:addDays(day,3),athlete:{...athleteA({weeks:8,id:'fh'}).athlete,eligibility:ELIG(day)}},consents:CONSENTS});
 const day2=addDays(s.date,1);J.set(day2,'08:00');assert.equal(code(J.op('it.enroll',fresh(day2))),'OK');assert.notEqual(J.stored(),null);
 // The stored text altered four ways: the athlete id, the document MAC (the anchor no longer matches), sealed content under an intact MAC (a
 // prescription's start day), and a spelling only (whitespace, the same JSON value). Only the last reads as the plan; none is read as another.
 const tampered=[];
 J.op('raw.keep');J.op('raw.tamper',{find:'"athleteId":"fh"',replace:'"athleteId":"fx"'});tampered.push(code(J.op('it.read')));J.op('api.plan');
 J.op('raw.restore');let raw=J.stored(),k=raw.indexOf('"docMac":"')+10;J.op('raw.tamper',{find:raw.slice(k,k+8),replace:(raw[k]==='0'?'1':'0')+raw.slice(k+1,k+8)});tampered.push(code(J.op('it.read')));
 J.op('raw.restore');raw=J.stored();k=raw.indexOf('"startDate":"')+13;J.op('raw.tamper',{find:raw.slice(k-13,k+10),replace:raw.slice(k-13,k)+addDays(raw.slice(k,k+10),1)});tampered.push(code(J.op('it.read')));J.op('api.plan');
 J.op('raw.restore');J.op('raw.tamper',{find:'"version":',replace:'"version": '});tampered.push(code(J.op('it.read')));
 assert.deepEqual(tampered.map(c=>c==='OK'),[false,false,false,true],JSON.stringify(tampered));console.error('tampered',JSON.stringify(tampered));
 J.op('raw.restore');assert.equal(code(J.op('it.read')),'OK');
 J.op('raw.restore');J.op('raw.drop');assert.equal(code(J.op('it.read')),'RECORD_LOST');J.op('api.plan');assert.equal(code(J.op('it.acknowledgeRecordLoss')),'OK');assert.equal(code(J.op('it.read')),'NOT_ENROLLED');
 const day3=addDays(s.date,2);J.set(day3,'08:00');assert.equal(code(J.op('it.enroll',fresh(day3))),'OK');J.op('api.eraseAccount');assert.equal(code(J.op('it.read')),'GONE');journeys.push(J);}

// B, D, G and H of int.json (int-oracle.mjs, the README §14 journeys), replayed by this driver with their own key: the same operations give the
// same answers and stored digests as int-driver.js (checked below), and the device classifies each of their steps (EXPLAINED_LIBM or DIVERGED).
const INT=JSON.parse(fs.readFileSync(path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17','ios','Tests','P0HostTests','Fixtures','int.json'),'utf8')),intIn=JSON.parse(INT.inputJSON);
const intJourneys=intIn.journeys.map(j=>({name:'final-'+j.name,athleteId:j.athleteId,key:intIn.key,steps:j.steps.map(s=>({...s,op:'it.'+s.op}))}));
const input={key:KEY,journeys:[...intJourneys,...journeys.map(J=>({name:J.name,athleteId:J.athleteId,steps:J.steps}))]};
vm.runInThisContext(fs.readFileSync(path.join(HERE,'final-driver.js'),'utf8'));
const M={integration,store,api,value},text=globalThis.__finalfocal(M,JSON.stringify(input)),expected=JSON.parse(text);
assert.equal(globalThis.__finalfocal(M,JSON.stringify(input)),text,'the replay is deterministic');
// The replay stores the same bytes the live run stored (the recorded calls are the whole journey).
for(const J of journeys){const live=J.stored(),last=expected.journeys.find(x=>x.name===J.name).steps.findLast(s=>'stored' in s);assert.equal(last.stored,live===null?null:value.hash(JSON.parse(live)),J.name+': replay = live');}
for(const j of expected.journeys)for(const s of j.steps)assert.ok(!s.error,`${j.name}: ${s.op} threw ${s.error}`);
for(const j of INT.expected.journeys){const f=expected.journeys.find(x=>x.name==='final-'+j.name);assert.equal(f.steps.length,j.steps.length);
 j.steps.forEach((s,k)=>{const t=f.steps[k];for(const key of ['code','status','version','recorded','screen','answer','stored'])assert.deepEqual(t[key],s[key],`${f.name}#${k} ${key}: final-driver = int-driver`);});}
const codes=Object.fromEntries(expected.journeys.map(j=>[j.name,j.steps.map(s=>s.op+':'+(s.code??'-')+(s.status?':'+s.status:'')+(s.state?':'+s.state:''))]));
fs.writeFileSync(OUT,JSON.stringify({driver:fs.readFileSync(path.join(HERE,'final-driver.js'),'utf8'),inputJSON:JSON.stringify(input),expected},null,1)+'\n');
console.log(JSON.stringify({ok:true,out:path.relative(REPO,OUT).replaceAll('\\','/'),digest:expected.digest,steps:expected.journeys.reduce((a,j)=>a+j.steps.length,0),codes},null,1));
