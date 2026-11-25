// V1HR5R (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25): the athlete's heart-rate profile through the integration boundary the app uses
// (createIntegration + api.mjs): onboarding with only an age gives five zones; setHeartRateProfile records a maximum or custom limits with no engine
// call and no custody decision, keeps them across a reopen (file store + anchor), a review and a restart, is idempotent, refuses whole, is sealed,
// and never reaches telemetry. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as CORE from '../src/v1-safety-index.mjs';
import {createIntegration,createBoundary,memoryStore,fileStore,athleteA,reportOf,liveSessions,at,ELIG,addDays,CONSENTS,memoryAnchor,scratchDir} from './v1int-helpers.mjs';
import {devFiveZone} from '../src/v1-heart-rate-zones.mjs';
import {CARRIED_RECORDS} from '../src/boundary/integration.mjs';
import {DATA_INVENTORY,telemetryOf} from '../src/boundary/inventory.mjs';

const O={heartRateFiveZone:devFiveZone()};
/** The composed entry with the development five-zone authority (the production one needs the independent record). */
const engine={...CORE,generateProgram:i=>CORE.generateProgram(i,O),evaluateProgram:(p,r)=>CORE.evaluateProgram(p,r,O),restartProgram:i=>CORE.restartProgram(i,O),heartRateProfileReading:(rc,rec,c)=>CORE.heartRateProfileReading(rc,rec,c,O)};
let calls=0;const counted={...engine,evaluateProgram:(p,r)=>{calls++;return engine.evaluateProgram(p,r);}};
function setup({store=memoryStore(),anchor=memoryAnchor(),id='hr5r-b',age=30,eng=counted,log=[]}={}){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),n=0;
 const mk=()=>createIntegration({store,key:'v1hr5r-synthetic-key',clock:()=>clock,anchor,engine:eng,newId:p=>p+'_'+String(++n).padStart(6,'0')});
 const A={store,anchor,actor:{athleteId:id},it:mk(),log};A.api=createBoundary({custody:A.it,now:()=>clock,log:x=>log.push(x)});
 A.reopen=()=>{A.it=mk();A.api=createBoundary({custody:A.it,now:()=>clock,log:x=>log.push(x)});};
 A.set=(day,time='20:00')=>{clock=Date.parse(at(day,time));};A.tick=s=>{clock+=s*1000;};
 A.doc=()=>A.it.read({actor:A.actor}).doc;A.v=()=>A.doc().version;
 A.five=()=>A.it.presentation({actor:A.actor}).readings?.runCalibration?.heartRateFiveZones;
 A.record=()=>A.it.carried({actor:A.actor}).records.heartRateProfileRecord;
 A.hr=(profile,rid)=>A.api.setHeartRateProfile({actor:A.actor,clientRequestId:rid,expectedVersion:A.v(),heartRateProfile:profile});
 const intake=athleteA({weeks:8,id});if(age!==null)intake.athlete.ageYears=age;A.intake=intake;
 return A;
}
const lim=z=>z.zones.map(x=>[x.minBpm,x.maxBpm]);

test('HR5R boundary: onboarding with only an age (no device) gives five estimated zones; the age is carried under the seal',()=>{
 const A=setup();const r=A.api.onboard({actor:A.actor,intake:A.intake,consents:CONSENTS});assert.equal(r.ok,true);assert.equal(r.status,'PROPOSED');
 const z=A.five();assert.equal(z.status,'AVAILABLE');assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.equal(z.reference.bpm,190);
 assert.deepEqual(lim(z),[[null,123],[124,153],[154,169],[170,184],[185,null]]);
 assert.deepEqual(A.record().map(x=>[x.source,x.declaration]),[['INTAKE',{ageYears:30}]]);assert.ok(CARRIED_RECORDS.includes('heartRateProfileRecord'));
});
test('HR5R boundary: setHeartRateProfile records a maximum and custom limits with no engine call, no custody decision and no plan change',()=>{
 const A=setup({id:'hr5r-b2'});A.api.onboard({actor:A.actor,intake:A.intake,consents:CONSENTS});
 const before=A.doc(),n0=calls;A.tick(60);
 const r=A.hr({maxHeartRateBpm:195},'hr-1');assert.equal(r.ok,true,JSON.stringify(r.error));assert.deepEqual(r.heartRateProfile,{added:['hrp-0002'],unchanged:[]});assert.deepEqual(r.fiveZones,{status:'AVAILABLE',reason:null});
 assert.equal(calls,n0,'the engine is not asked');const after=A.doc();
 assert.equal(after.version,before.version,'custody records no new version');assert.equal(JSON.stringify(after.decisions),JSON.stringify(before.decisions));assert.equal(after.program.hash,before.program.hash);
 let z=A.five();assert.equal(z.reference.kind,'ATHLETE_DECLARED_MAXIMUM');assert.deepEqual(lim(z),[[null,126],[127,157],[158,173],[174,189],[190,null]]);
 assert.ok(Object.values(z.sessions).filter(s=>s.role==='COMPLEMENTARY_CEILING_CUE').every(s=>s.slowDownCueAtOrAboveBpm===174));
 A.tick(60);assert.equal(A.hr({zoneUpperBpm:[130,150,165,180]},'hr-2').ok,true);z=A.five();assert.equal(z.boundarySource,'ATHLETE_CUSTOM');assert.deepEqual(lim(z),[[null,130],[131,150],[151,165],[166,180],[181,null]]);
 // The api view answers as for any operation; the plan view is the same plan.
 assert.equal(A.api.plan({actor:A.actor}).ok,true);
});
test('HR5R boundary: invalid, stale, reused and foreign requests are refused whole; a retry replays; nothing is recorded by a refusal',()=>{
 const A=setup({id:'hr5r-b3'});A.api.onboard({actor:A.actor,intake:A.intake,consents:CONSENTS});A.tick(60);
 for(const [p,f] of [[{zoneUpperBpm:[150,140,165,180]},'zoneUpperBpm.strictlyIncreasing'],[{maxHeartRateBpm:'190'},'maxHeartRateBpm.wholeBpm120to230'],[{maxHeartRateBpm:300},'maxHeartRateBpm.wholeBpm120to230'],[{x:1},'heartRateProfile.unknownField'],[null,'heartRateProfile.object']]){
  const r=A.hr(p,'bad-'+f);assert.equal(r.ok,false);assert.equal(r.error.code,'INVALID_REQUEST');assert.ok(r.error.fields.includes(f),f);}
 assert.equal(A.record().length,1,'nothing recorded');
 const ok=A.hr({maxHeartRateBpm:192},'hr-a');assert.equal(ok.ok,true);
 const again=A.hr({maxHeartRateBpm:192},'hr-a');assert.equal(again.ok,true);assert.equal(again.replayed,true);assert.deepEqual(again.heartRateProfile,ok.heartRateProfile);assert.equal(A.record().length,2);
 assert.equal(A.hr({maxHeartRateBpm:193},'hr-a').error.code,'CONFLICT_IDEMPOTENCY_KEY');
 assert.equal(A.api.setHeartRateProfile({actor:A.actor,clientRequestId:'hr-s',expectedVersion:A.v()+1,heartRateProfile:{maxHeartRateBpm:191}}).error.code,'CONFLICT_STALE_VERSION');
 assert.equal(A.it.setHeartRateProfile({actor:A.actor,clientRequestId:'hr-x',expectedVersion:A.v(),heartRateProfile:{maxHeartRateBpm:191},extra:true}).error.code,'INVALID_REQUEST');
 assert.notEqual(A.api.setHeartRateProfile({actor:{athleteId:'someone-else'},clientRequestId:'hr-o',expectedVersion:1,heartRateProfile:{maxHeartRateBpm:191}}).ok,true);
 assert.equal(A.api.setHeartRateProfile({actor:A.actor,clientRequestId:'',expectedVersion:A.v(),heartRateProfile:{maxHeartRateBpm:191}}).error.code,'INVALID_REQUEST');
 assert.equal(A.record().length,2);
});
test('HR5R boundary persistence: the overrides survive a reopen over the native-style file store and anchor, a weekly review and a restart; only the athlete clears them',()=>{
 const dir=scratchDir('hr5r'),A=setup({id:'hr5r-b4',store:fileStore(dir),eng:engine});
 try{
  A.api.onboard({actor:A.actor,intake:A.intake,consents:CONSENTS});A.tick(60);
  assert.equal(A.hr({maxHeartRateBpm:195,zoneUpperBpm:[130,150,165,180]},'hr-1').ok,true);
  A.reopen();let z=A.five();assert.equal(z.reference.bpm,195);assert.equal(z.boundarySource,'ATHLETE_CUSTOM');
  const p=A.doc().program,day=addDays(p.startDate,6);A.set(day);
  const env={program:p,presentation:{runSessions:A.it.presentation({actor:A.actor}).inForce??{}}};
  const obs=liveSessions(env,0).map(s=>{const x=reportOf(env,s);return {sessionId:x.sessionId,occurrenceDate:x.occurrenceDate,actual:Object.fromEntries(Object.entries(x.actual).filter(([k])=>!['gpsQuality','measurement'].includes(k))),response:x.response};});
  const wk=A.api.weeklyCheckIn({actor:A.actor,clientRequestId:'wk0',expectedVersion:A.v(),eligibility:ELIG(day),reports:obs.map(o=>({sessionId:o.sessionId,occurredOn:o.occurrenceDate,completed:o.actual.completed,minutes:o.actual.minutes,response:o.response}))});
  assert.equal(wk.ok,true,JSON.stringify(wk.error));z=A.five();assert.equal(z.reference.bpm,195,'a review keeps the override');assert.equal(z.boundarySource,'ATHLETE_CUSTOM');
  const rday=addDays(p.startDate,8);A.set(rday,'10:00');const u={...athleteA({weeks:8,id:'hr5r-b4'}),asOf:rday,startDate:addDays(rday,3)};u.athlete.ageYears=31;u.athlete.eligibility=ELIG(rday);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  const rs=A.api.restart({actor:A.actor,intake:u,expectedVersion:A.v()});assert.equal(rs.ok,true,JSON.stringify(rs.error));
  z=A.five();assert.equal(z.reference.kind,'ATHLETE_DECLARED_MAXIMUM','a restart never overwrites the athlete\'s maximum');assert.equal(z.reference.bpm,195);
  assert.deepEqual(A.record().map(x=>x.declaration),[{ageYears:30},{maxHeartRateBpm:195,zoneUpperBpm:[130,150,165,180]},{ageYears:31}],'the new age is recorded beside it');
  A.tick(60);assert.equal(A.hr({maxHeartRateBpm:null,zoneUpperBpm:null},'hr-c').ok,true);A.reopen();
  z=A.five();assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.equal(z.reference.bpm,189);assert.equal(z.boundarySource,'DEFAULT_PERCENT_OF_MAXIMUM');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('HR5R boundary integrity and privacy: a changed carried profile is an integrity failure; a record stored before the amendment reads as empty; no heart rate in telemetry',()=>{
 const log=[],A=setup({id:'hr5r-b5',log});A.api.onboard({actor:A.actor,intake:A.intake,consents:CONSENTS});A.tick(60);assert.equal(A.hr({maxHeartRateBpm:195},'hr-1').ok,true);
 const raw=A.store.raw('hr5r-b5');assert.ok(raw.includes('"maxHeartRateBpm":195'));
 A.store.setRaw('hr5r-b5',raw.replace('"maxHeartRateBpm":195','"maxHeartRateBpm":150'));assert.equal(A.it.read({actor:A.actor}).error.code,'INTEGRITY_FAILURE');A.store.setRaw('hr5r-b5',raw);
 assert.equal(A.it.read({actor:A.actor}).ok,true);
 for(const t of log){const s=JSON.stringify(t);assert.ok(!/195|maxHeartRate|ageYears|zoneUpper/.test(s),s);}
 assert.equal(telemetryOf('setHeartRateProfile',{ok:true,version:1}).op,'review','a neutral operation class');
 assert.ok(DATA_INVENTORY.some(d=>/heartRateProfileRecord/.test(d.field)&&d.class==='HEALTH'&&d.egress==='NONE'));
 // A record kept before the amendment has no heartRateProfileRecord: read as empty; the next plan answer records the intake's age.
 const B=setup({id:'hr5r-b6',eng:{...engine,generateProgram:i=>{const g=engine.generateProgram(i);const {heartRateProfileRecord:_r,...rest}=g;return rest;}}});
 B.api.onboard({actor:B.actor,intake:B.intake,consents:CONSENTS});assert.deepEqual(B.record(),[]);
});

// ---------- QRE-SEC-HR5R review findings (each reproduced by the reviewer's probe; each now a regression test) ----------
import {athlete,U,notFeeling100WithSign} from './v1int-helpers.mjs';
import {hash as valueHash} from '../src/value.mjs';
import {appendProfile} from '../src/v1-heart-rate-profile.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';
const aged30=(t,x={})=>{const i=athleteA({weeks:8,id:t.id});i.athlete.ageYears=30;return {...i,...x};};
const codeOf=r=>r.ok===false?r.error.code:'OK';
const fiveOf=t=>t.it.presentation({actor:t.actor}).readings?.runCalibration?.heartRateFiveZones;
const hrOf=(t,profile,rid)=>t.api.setHeartRateProfile({actor:t.actor,clientRequestId:rid,expectedVersion:t.version(),heartRateProfile:profile});

test('QRE-HR5R-01: a heart-rate write after an erasure keeps the readings null, so a resent stopped run is asked again (its screen named), never a null-screen duplicate',()=>{
 for(const withHr of [false,true]){
  const t=athlete({id:'q01-'+withHr});t.enroll(aged30(t));const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'20:00');
  const f={...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U};t.weekly(s.date,[f]);
  t.set(s.date,'20:30');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
  t.set(s.date,'21:00');assert.equal(codeOf(t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()})),'OK');
  if(withHr){t.set(s.date,'21:05');assert.equal(codeOf(hrOf(t,{maxHeartRateBpm:195},'hr')),'OK');assert.equal(t.it.presentation({actor:t.actor}).readings,null,'null stays null');}
  t.set(s.date,'21:10');const again=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
  assert.equal(!!again.duplicate,false,String(withHr));assert.equal(again.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM',String(withHr));
 }
});
test('QRE-HR5R-02: accepting a pending change keeps the heart-rate profile in force (an override is never overwritten by a plan adoption)',()=>{
 const i=JSON.parse(JSON.stringify(EDGE_PROFILES.TEN_K_EIGHT_WEEKS));i.asOf='2026-11-01';i.startDate='2026-11-02';i.athlete.ageYears=30;
 const u=athlete({id:'q02',start:'2026-11-01T12:00:00-03:00',anchor:memoryAnchor()});assert.equal(u.enroll({...i,athlete:{...i.athlete,id:'q02'}}).status,'PROPOSED');
 for(const w of [0,1,2,3]){const sun=addDays(u.doc().program.startDate,w*7+6);u.set(sun);u.weekly(sun,u.sessions(w).map(s=>u.form(s)));}
 const q=u.doc().program.weeks[4].sessions.find(x=>x.role==='QUALITY');u.set(q.date,'21:00');
 const r=u.api.logRun({actor:u.actor,clientRequestId:'miss',expectedVersion:u.version(),eligibility:ELIG(q.date),sessionId:q.id,occurredOn:q.date,completed:false});
 assert.ok(r.offer?.decisionId&&u.doc().pending,'a pending offer');
 u.set(q.date,'21:02');assert.equal(codeOf(hrOf(u,{maxHeartRateBpm:200},'hr1')),'OK');
 u.set(q.date,'21:05');assert.equal(codeOf(u.api.accept({actor:u.actor,decisionId:r.offer.decisionId,expectedVersion:u.version()})),'OK');
 assert.deepEqual(u.carried().heartRateProfileRecord.map(x=>x.declaration),[{ageYears:30},{maxHeartRateBpm:200}]);
 const sun=addDays(u.doc().program.startDate,4*7+6);u.set(sun);u.weekly(sun,[]);assert.equal(fiveOf(u).reference.kind,'ATHLETE_DECLARED_MAXIMUM');assert.equal(fiveOf(u).reference.bpm,200);
});
test('QRE-HR5R-03 / N2: with coaching consent revoked a heart-rate write is refused (CONSENT_REQUIRED), nothing recorded; erasing is never refused for consent',()=>{
 const t=athlete({id:'q03'});t.enroll(aged30(t));t.clock+=60000;
 assert.equal(t.api.setConsent({actor:t.actor,purpose:'COACHING',granted:false,expectedVersion:t.version()}).ok,true);t.clock+=60000;
 assert.equal(hrOf(t,{maxHeartRateBpm:199},'hr').error.code,'CONSENT_REQUIRED');
 assert.deepEqual(t.carried().heartRateProfileRecord.map(x=>x.declaration),[{ageYears:30}]);
 const u=athlete({id:'q03b'});u.enroll(aged30(u));u.clock+=60000;assert.equal(codeOf(hrOf(u,{maxHeartRateBpm:199},'hr')),'OK');u.clock+=60000;
 assert.equal(u.api.setConsent({actor:u.actor,purpose:'COACHING',granted:false,expectedVersion:u.version()}).ok,true);u.clock+=60000;
 const e=u.api.eraseHeartRateProfile({actor:u.actor,clientRequestId:'er',expectedVersion:u.version()});assert.equal(codeOf(e),'OK');assert.equal(e.erased.length,1);
 assert.ok(!u.store.raw('q03b').includes('"maxHeartRateBpm":199'),'the erased value is gone from the stored record');
});
test('QRE-HR5R-N1 / N3 / N4: a carried rollback is released by the athlete\'s acknowledgement; an erasure under a clock behind the record works; a pending change keeps no copy of an erased value',()=>{
 const store=memoryStore(),anchor=memoryAnchor(),t=athlete({id:'qn1',store,anchor});t.enroll(aged30(t));
 t.clock+=60000;hrOf(t,{maxHeartRateBpm:200},'a');const old=store.raw('qn1');t.clock+=60000;hrOf(t,{maxHeartRateBpm:201},'b');
 store.setRaw('qn1',old);assert.equal(t.it.read({actor:t.actor}).error.code,'RECORD_ROLLED_BACK');
 assert.equal(t.it.acknowledgeRecordLoss({actor:t.actor}).ok,true,'the athlete\'s explicit act is the way out');assert.notEqual(t.it.read({actor:t.actor}).error?.code,'RECORD_ROLLED_BACK');
 const c=athlete({id:'qn3'});c.enroll(aged30(c));c.clock+=3600e3;assert.equal(codeOf(hrOf(c,{maxHeartRateBpm:199},'hr')),'OK');c.clock-=1800e3;
 const e=c.api.eraseHeartRateProfile({actor:c.actor,clientRequestId:'er',expectedVersion:c.version()});assert.equal(codeOf(e),'OK');assert.equal(e.erased.length,1);
 const i=JSON.parse(JSON.stringify(EDGE_PROFILES.TEN_K_EIGHT_WEEKS));i.asOf='2026-11-01';i.startDate='2026-11-02';i.athlete.ageYears=30;
 const u=athlete({id:'qn4',start:'2026-11-01T12:00:00-03:00'});u.enroll({...i,athlete:{...i.athlete,id:'qn4'}});
 for(const w of [0,1,2,3]){const sun=addDays(u.doc().program.startDate,w*7+6);u.set(sun);u.weekly(sun,u.sessions(w).map(s=>u.form(s)));}
 const q=u.doc().program.weeks[4].sessions.find(x=>x.role==='QUALITY');u.set(q.date,'21:00');
 const r=u.api.logRun({actor:u.actor,clientRequestId:'miss',expectedVersion:u.version(),eligibility:ELIG(q.date),sessionId:q.id,occurredOn:q.date,completed:false});assert.ok(r.offer);
 u.set(q.date,'21:02');hrOf(u,{maxHeartRateBpm:211},'hr');u.set(q.date,'21:03');assert.equal(codeOf(u.api.eraseHeartRateProfile({actor:u.actor,clientRequestId:'er',expectedVersion:u.version()})),'OK');
 assert.ok(!u.store.raw('qn4').includes('"maxHeartRateBpm":211'),'no copy in the pending change');
});
test('QRE-HR5R-04: east and west of UTC, an intake day is the plan\'s local day: a declaration right after onboarding and a same-day restart are recorded; the age is read at a local instant',()=>{
 for(const tz of [600,60,-180,-600]){
  const t=athlete({id:'q04-'+tz,start:'2026-11-15T08:00:00+10:00'});const i=aged30(t);i.timezoneOffsetMinutes=tz;
  assert.equal(t.enroll(i).status,'PROPOSED',String(tz));t.clock+=60000;
  const h=hrOf(t,{maxHeartRateBpm:195},'hr');assert.equal(codeOf(h),'OK',tz+' '+JSON.stringify(h.error));
  assert.equal(fiveOf(t).profile.ageYears,30,String(tz));assert.equal(fiveOf(t).reference.kind,'ATHLETE_DECLARED_MAXIMUM',String(tz));
 }
 // A restart later the same local day (-180, 23:45 local) after a declaration at 23:30: the intake's new age is recorded, never dropped.
 const t=athlete({id:'q04-r'});t.enroll(aged30(t));const day=addDays(t.doc().program.startDate,8);t.set(day,'23:30');assert.equal(codeOf(hrOf(t,{maxHeartRateBpm:195},'hr')),'OK');
 t.set(day,'23:45');const u={...athleteA({weeks:8,id:'q04-r'}),asOf:day,startDate:addDays(day,3)};u.athlete.ageYears=31;u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 assert.equal(t.api.restart({actor:t.actor,intake:u,expectedVersion:t.version()}).ok,true);
 assert.deepEqual(t.carried().heartRateProfileRecord.map(x=>x.declaration),[{ageYears:30},{maxHeartRateBpm:195},{ageYears:31}]);assert.equal(fiveOf(t).profile.ageYears,31);
});
test('QRE-HR5R-05: an intake can state no carried record and no invalid declaration; forged or invalid rows are never read; a fault is typed',()=>{
 const t=athlete({id:'q05'});
 for(const bad of [{heartRateProfileRecord:[{fact:'V1HR5R-HEART-RATE-PROFILE-DECLARED'}]},{runEvidenceRecord:[]},{heartRateProfile:{maxHeartRateBpm:999}},{heartRateProfile:{zoneUpperBpm:5}}]){
  const r=t.enroll(aged30(t,bad));assert.equal(r.ok,false,JSON.stringify(bad));assert.equal(r.error.code,'INVALID_REQUEST');}
 const ok=t.enroll(aged30(t,{heartRateProfile:{maxHeartRateBpm:190}}));assert.equal(ok.status,'PROPOSED');assert.equal(fiveOf(t).reference.kind,'ATHLETE_DECLARED_MAXIMUM');
 // The engine entry: a first plan never reads a record from its input; rows invalid for their source are never read.
 const g=CORE.generateProgram({...aged30({id:'q05b'}),heartRateProfileRecord:[{fact:'V1HR5R-HEART-RATE-PROFILE-DECLARED',athleteId:'q05b',eventId:'hrp-9999',declaredAt:'2099-01-01',source:'ATHLETE',declaration:{maxHeartRateBpm:999},inputHash:'x'}]},O);
 assert.deepEqual(g.heartRateProfileRecord.map(r=>r.declaration),[{ageYears:30}]);
 // Rows intact by hash but invalid for their source (an impossible maximum, a malformed limit, an athlete row with an age, an intake row with a
 // maximum) are never read, and never lock the record against a valid declaration.
 const rc=g.runCalibration,mk=(source,declaration)=>({fact:'V1HR5R-HEART-RATE-PROFILE-DECLARED',version:'V1HR5R-HEART-RATE-PROFILE-1',eventId:'hrp-0099',athleteId:'q05b',declaredAt:'2026-11-20T10:00:00Z',source,declaration,inputHash:valueHash(declaration)});
 for(const bad of [mk('ATHLETE',{maxHeartRateBpm:999}),mk('ATHLETE',{zoneUpperBpm:5}),mk('ATHLETE',{ageYears:30}),mk('INTAKE',{maxHeartRateBpm:190}),mk('INTAKE',{ageYears:30,maxHeartRateBpm:190})]){
  const read=CORE.heartRateProfileReading(rc,[...g.heartRateProfileRecord,bad],{athleteId:'q05b',at:'2026-11-21T10:00:00Z'},O).heartRateFiveZones;
  assert.equal(read.reference.kind,'AGE_ESTIMATE',JSON.stringify(bad.declaration));assert.equal(read.profile.declaredMaximumBpm,null);
  const r=appendProfile([...g.heartRateProfileRecord,bad],{athleteId:'q05b',at:'2026-11-21T10:00:00Z',declaration:{maxHeartRateBpm:188}});assert.deepEqual(r.added.length,1,JSON.stringify(bad.declaration));}
});
test('QRE-HR5R-06: a carried rollback at the same custody version (an older heart-rate write replayed) is RECORD_ROLLED_BACK',()=>{
 const store=memoryStore(),anchor=memoryAnchor(),t=athlete({id:'q06',store,anchor});t.enroll(aged30(t));
 t.clock+=60000;assert.equal(codeOf(hrOf(t,{maxHeartRateBpm:200},'a')),'OK');const old=store.raw('q06');
 t.clock+=60000;assert.equal(codeOf(hrOf(t,{zoneUpperBpm:[120,140,160,175]},'b')),'OK');
 store.setRaw('q06',old);assert.equal(t.it.read({actor:t.actor}).error.code,'RECORD_ROLLED_BACK');
});
test('QRE-HR5R-08: the athlete erases the heart-rate declarations (history included); the age stays; the zones go back to the estimate; the record compacts at its bound',()=>{
 const t=athlete({id:'q08'});t.enroll(aged30(t));
 for(let k=0;k<3;k++){t.clock+=60000;assert.equal(codeOf(hrOf(t,{maxHeartRateBpm:190+k},'h'+k)),'OK');}
 t.clock+=60000;const e=t.api.eraseHeartRateProfile({actor:t.actor,clientRequestId:'er',expectedVersion:t.version()});assert.equal(codeOf(e),'OK');assert.equal(e.erased.length,3);
 assert.deepEqual(t.carried().heartRateProfileRecord.map(x=>x.declaration),[{ageYears:30}]);assert.equal(fiveOf(t).reference.kind,'AGE_ESTIMATE');
 assert.equal(t.api.eraseHeartRateProfile({actor:t.actor,clientRequestId:'er',expectedVersion:t.version()}).replayed,true);
 // Past 128 rows the record keeps the rows in force and goes on accepting the athlete.
 for(let k=0;k<130;k++){t.clock+=1000;assert.equal(codeOf(hrOf(t,{maxHeartRateBpm:150+(k%60)},'c'+k)),'OK','write '+k);}
 const rec=t.carried().heartRateProfileRecord;assert.ok(rec.length<=128);assert.equal(rec.at(-1).declaration.maxHeartRateBpm,150+(129%60));assert.equal(rec[0].declaration.ageYears,30,'the age row stays');
});
