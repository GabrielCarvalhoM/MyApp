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
