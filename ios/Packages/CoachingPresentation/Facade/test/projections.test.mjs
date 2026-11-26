// Shared app-facade projections over the real boundary (current runtime). Node only; run: node --test ios/Packages/CoachingPresentation/Facade/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,athleteA,ELIG,addDays,U} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
import {signsFor,exerciseSignsFor,READINESS_SIGNS,CONDITIONS} from '../../../../../CoachingCore/src/v1-f08.mjs';
import {loggedEntries,keepsReport,weekPlan,warningSignSet,warningSignSets,timeInZones,timeInZonesForReviewOnly,TIME_IN_ZONE_GATE} from '../app-projections.mjs';

let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const RESERVED=['provenance','context','source','sourceHash','canonicalActivityId','athleteId','reportedAt','localDate','fact','inputHashes','parts'];
const keysDeep=(x,out=new Set())=>{if(Array.isArray(x))x.forEach(v=>keysDeep(v,out));else if(x&&typeof x==='object')for(const[k,v]of Object.entries(x)){out.add(k);keysDeep(v,out);}return out;};

test('warning-sign sets are the frozen signsFor, per condition, in order (GAP-03)',()=>{
 for(const c of CONDITIONS){const s=warningSignSet(c);assert.deepEqual(s.warningSigns,signsFor(c));assert.deepEqual(s.exerciseSigns,exerciseSignsFor(c));}
 assert.deepEqual(warningSignSet('READINESS').warningSigns,[...READINESS_SIGNS]);
 assert.deepEqual(warningSignSets().map(s=>s.warningSigns.length),[15,13,15,9,9,15]);
 assert.equal(warningSignSet('NOT_A_CONDITION').error,'UNKNOWN_CONDITION');
});

test('loggedEntries: exactly the visible rows, no reserved key, corrections and erasure (GAP-06)',()=>{
 const t=athlete({newId,id:'p-logged',weeks:8});t.enroll();const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'20:00');
 const r1=t.weekly(s.date,[t.form(s)]);assert.ok(r1.ok);
 let e=loggedEntries(t.rows());assert.equal(e.length,t.rows().filter(r=>!r.fact).length);
 for(const k of RESERVED)assert.ok(!keysDeep(e).has(k),'reserved key '+k+' crossed');
 // A correction: the original stays as history (superseded), the report in force is an entry.
 const f=t.form(s);const r2=t.weekly(s.date,[{...f,actual:{...f.actual,minutes:33},correctionOf:r1.recorded[0]}]);assert.ok(r2.ok,JSON.stringify(r2.error));
 e=loggedEntries(t.rows());const live=e.filter(x=>x.sessionId===s.id&&!x.superseded);
 assert.equal(live.length,1);assert.equal(live[0].minutes,33);assert.equal(live[0].correctionOf,r1.recorded[0]);
 assert.ok(keepsReport(e,r2.recorded[0]));
 // eraseAccount: nothing to read, so nothing to project.
 assert.ok(t.api.eraseAccount({actor:t.actor}).ok);const o=t.it.read({actor:t.actor});assert.equal(o.ok,false);assert.equal(o.error.code,'GONE');
});

test('two-voice row: athlete facts come from the athlete voice; distances kept apart (SSCTR-ABC-S5)',()=>{
 const t=athlete({newId,id:'p-voices',weeks:8});t.enroll();const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'08:00');
 assert.ok(t.import([t.watch(s)],{eligibility:ELIG(s.date)}).ok);t.set(s.date,'20:00');const f=t.form(s);
 assert.ok(t.weekly(s.date,[{...f,actual:{...f.actual,rpe:6,distanceKm:6.5}}]).ok);
 const [e]=loggedEntries(t.rows()).filter(x=>x.sessionId===s.id);const av=e.voices.find(v=>v.channel==='ATHLETE'),dv=e.voices.find(v=>v.channel==='DEVICE');
 assert.deepEqual(e.channels,['ATHLETE','DEVICE']);assert.equal(e.rpe,6);assert.equal(e.rpe,av.rpe);assert.deepEqual(e.response,av.response);
 assert.equal(e.declaredKm,6.5);assert.equal(e.measuredKm,dv.measuredKm);assert.notEqual(e.measuredKm,e.declaredKm);
});

test('QRE-ABC-01: a symptom stop the athlete reports against a completed device run stays visible',()=>{
 const t=athlete({newId,id:'p-conflict',weeks:8});t.enroll();const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'08:00');
 assert.ok(t.import([t.watch(s)],{eligibility:ELIG(s.date)}).ok);t.set(s.date,'20:00');const f=t.form(s);
 const r=t.weekly(s.date,[{...f,actual:{completed:false,minutes:5,rpe:9,stop:{reason:'SYMPTOM'}},response:{...f.response,recovery:'ADVERSE'}}]);assert.ok(r.ok);
 assert.equal(r.warningSignScreen.status,'REQUIRED');
 const [e]=loggedEntries(t.rows()).filter(x=>x.sessionId===s.id&&!x.superseded);
 assert.equal(e.stopReason,'SYMPTOM');assert.equal(e.rpe,9);assert.equal(e.response.recovery,'ADVERSE');
 const av=e.voices.find(v=>v.channel==='ATHLETE');assert.equal(av.completed,false);assert.equal(av.minutes,5);assert.equal(av.stopReason,'SYMPTOM');
 assert.ok(e.voices.find(v=>v.channel==='DEVICE').completed);
});

test('GAP-12 / FND-ABC-01: unplanned reports need observedAt to be kept as sessions; in one request too',()=>{
 const STR={completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]};
 for(const obs of [false,true]){
  const t=athlete({newId,id:'p-unpl-'+obs,weeks:8});t.enroll();const d=addDays(t.doc().program.startDate,5);t.set(d,'21:00');
  const o=(a,h)=>({occurrenceDate:d,...(obs?{observedAt:`${d}T${h}:00-03:00`}:{}),actual:a,response:U});
  // A queued pair sent in one request (the offline queue flushes this way): the same operation instant for both.
  const r=t.weekly(d,[o({completed:true,minutes:30,sport:'RUN',rpe:3},'18:10'),o(STR,'20:40')]);assert.ok(r.ok);assert.equal(r.recorded.length,2,'the answer lists both either way');
  const e=loggedEntries(t.rows()),kept=r.recorded.filter(id=>keepsReport(e,id));
  if(obs){assert.equal(kept.length,2);assert.deepEqual(e.map(x=>x.sport),['RUN','STRENGTH']);assert.ok(e.every(x=>!x.unplannedMerge));}
  else{assert.equal(kept.length,1,'without observedAt the engine keeps one session (pinned: FND-ABC-01)');assert.ok(e.some(x=>x.unplannedMerge));}
 }
});

test('weekPlan: the plan\'s own phases and planned volume, never derived (GAP-07)',()=>{
 const t=athlete({newId,id:'p-weeks',weeks:12});t.enroll();const doc=t.doc(),w=weekPlan(doc,{today:doc.program.startDate});
 assert.equal(w.weeks.length,doc.program.weeks.length);
 w.weeks.forEach((x,i)=>{const k=doc.program.weeks[i];assert.equal(x.phase,k.phase);assert.equal(x.plannedRunMinutes,k.plannedRunMinutes);assert.equal(x.plannedStrengthSets,k.plannedStrengthSets);});
 assert.equal(w.weeks[0].timing,'CURRENT');assert.equal(w.weeks[1].timing,'AHEAD');
});

test('timeInZones: the engine classifier over the engine zones, gated; never from an average (phase 6.3)',()=>{
 const t=athlete({newId,id:'p-tiz',weeks:8});t.enroll();const readings=t.it.presentation({actor:t.actor}).readings;
 const z=readings.runCalibration.heartRateFiveZones;assert.equal(z.status,'AVAILABLE');
 // 15 s spacing: within the classifier's maximum gap, so every second is covered (a longer gap is UNKNOWN time, never interpolated).
 const series={sensor:'CHEST_STRAP',samples:Array.from({length:121},(_,k)=>({t:k*15,bpm:k<60?120:175}))};
 const gated=timeInZones(readings,series,{durationSeconds:1800});
 assert.equal(gated.status,'UNAVAILABLE');assert.equal(gated.reason,'SERIES_CHANNEL_NOT_REVIEWED');assert.equal(gated.fromAverageHeartRate,false);
 assert.deepEqual(Object.keys(gated).sort(),['fromAverageHeartRate','reason','status'],'no distribution leaks under the gate (SSCTR-ABC-S3)');
 assert.equal(TIME_IN_ZONE_GATE.enabled,false);assert.ok(Object.isFrozen(TIME_IN_ZONE_GATE));
 assert.equal(timeInZones(readings,series,{durationSeconds:1800,enabled:true}).reason,'SERIES_CHANNEL_NOT_REVIEWED','a caller cannot open the gate');
 const open=timeInZonesForReviewOnly(readings,series,{durationSeconds:1800});assert.equal(open.status,'AVAILABLE');
 assert.equal(open.seconds.Z1+open.seconds.Z2+open.seconds.Z3+open.seconds.Z4+open.seconds.Z5,open.coveredSeconds);
 // An average alone is not a series; a single sample is not enough; an optical series is classified with its sensor kept.
 assert.equal(timeInZonesForReviewOnly(readings,{sensor:'CHEST_STRAP',samples:[{t:0,bpm:150}]}).reason,'INSUFFICIENT_SAMPLES');
 assert.equal(timeInZonesForReviewOnly(readings,{sensor:'CHEST_STRAP',samples:Array.from({length:31},(_,k)=>({t:k*60,bpm:150}))},{durationSeconds:1800}).reason,'INSUFFICIENT_COVERAGE','gaps are unknown time, never filled');
 assert.equal(timeInZonesForReviewOnly(readings,{sensor:'UNKNOWN',samples:series.samples}).reason,'SENSOR_NOT_QUALIFYING');
 assert.equal(timeInZonesForReviewOnly(null,series).reason,'NO_FIVE_ZONE_READING');
});

test('special population: the engine reads the key at enroll and restart; the key is the only path (GAP-02, FND-ABC-04)',()=>{
 for(const sp of [['PREGNANCY'],['POSTPARTUM']]){
  const t=athlete({newId,id:'p-sp-'+sp[0],weeks:8}),i=athleteA({weeks:8,id:'p-sp-'+sp[0]});i.athlete.specialPopulation=sp;
  const e=t.api.onboard({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});
  assert.equal(e.ok,true);assert.equal(e.status,'UNSUPPORTED');assert.equal(e.enrolled,false);assert.match(e.reason,/SPECIAL_POPULATION_OUTSIDE_V1/);
  assert.equal(t.api.plan({actor:t.actor}).error.code,'NOT_ENROLLED');}
 // Dropping the key (what a closed list without it would do) gives a plan: the key is load-bearing.
 const t=athlete({newId,id:'p-sp-dropped',weeks:8}),i=athleteA({weeks:8,id:'p-sp-dropped'});delete i.athlete.specialPopulation;
 assert.equal(t.api.onboard({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}}).status,'PROPOSED');
 // Restart declaring it: refused by scope, and the earlier plan stays executable in the record (the host gate stops it).
 t.set('2026-11-20','10:00');const r=athleteA({weeks:8,id:'p-sp-dropped'});r.asOf='2026-11-20';r.startDate='2026-11-23';r.athlete.eligibility.assessedAt='2026-11-20';r.athlete.specialPopulation=['POSTPARTUM'];
 const a=t.api.restart({actor:t.actor,intake:r,expectedVersion:t.version()});assert.equal(a.status,'UNSUPPORTED');
 assert.equal(t.api.plan({actor:t.actor}).view.state,'VALID_PLAN');
});
