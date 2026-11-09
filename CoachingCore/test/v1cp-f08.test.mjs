// V1 Coaching Productization, Block 2: F08 under DR-148 (Founder D2 and the 2026-11-08 request; PCG-V1CP-F08 r2, RC-01..RC-18; Security
// SEC-V1CP-01..27). The software never makes the clinical judgment, and a recovering athlete always has a legitimate way back to training.
//   S1 (NOT_FEELING_100): a structured report with every warning sign answered no opens a 3-14 day reduction by the athlete's intent, with
//       existing dose operations only; the reduced weeks release no step for the reduced sport; the return follows the chosen speed and never
//       restores a dose by date alone; a warning sign routes to the clinical hold; a local discomfort leaves the other sport alone, a systemic
//       condition never spares a sport; the race is never changed by it; reductions never chain past 14 days; a replay changes nothing.
//   S2 (READINESS_DECLARATION): after a clinical hold, the athlete's declaration (every item answered, today's screen) restarts each sport declared
//       ready by the existing return recipe of its own stop; a sport not declared ready stays held; a restriction is a hard cap until a later
//       declaration ends it; any new sign returns to the hold; the clinical cause stays on record and nothing says "cleared".
//   S3 (restartProgram): a new plan after a long interruption from the existing cold start; a standing clinical hold needs the declaration
//       first; restrictions in force carry over; the record is returned unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,restartProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const {HYBRID,doneBefore}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/test/v1cp-fixtures.mjs')).href);
const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const NO={fever:false,chestPainOrPressure:false,breathlessnessOrPalpitations:false,faintingOrDizziness:false,painThatChangesMovementOrSwelling:false,injuryFromFallOrImpact:false,worsening:false};
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const FORBIDDEN=/\b(cleared|clearance granted|liberad[oa]|approved by|safe to (train|run)|apto|alta m[eé]dica)\b/i;
function timeline(input=HYBRID()){
 const t={p:generateProgram(input).program,ledger:[],ref:null,n:0,results:[]};
 t.step=(w,d,kind,extra={},time='08:00')=>{const day=addDays(t.p.startDate,w*7+d);const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`f08-${input.athlete.id}-${++t.n}`,kind},eligibility:ELIG(day,extra.flags??{}),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.substitution?{substitution:extra.substitution}:{}),...(extra.eligibility?{eligibility:extra.eligibility}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})};
  const r=evaluateProgram(t.p,review);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 return t;
}
const sessionsIn=(p,from,to,sport)=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.date>=from&&s.date<=to&&(!sport||s.sport===sport));
const rowsOf=s=>(s.prescription?.exercises??[]);
const facts=(t,f)=>t.ledger.filter(o=>o.fact===f);

// ---------------- Situation 1 ----------------
test('S1-1: the entry screen: a warning sign routes to the clinical hold; every item must be answered; only the vocabulary is read',()=>{
 const t=timeline(),wb={condition:'MILD_ILLNESS',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:5};
 // Each sign on its own timeline: after one, the hold stands (the next report of that timeline sees it).
 for(const k of Object.keys(NO)){const r=timeline().step(1,2,'NOT_FEELING_100',{wellbeing:{...wb,warningSigns:{...NO,[k]:true}}});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',k);assert.equal(r.proposal,null);assert.match(r.reason,/professional assessment/);}
 const missing=t.step(1,2,'NOT_FEELING_100',{wellbeing:{...wb,warningSigns:{...NO,worsening:undefined}}});assert.equal(missing.status,'ASK');assert.deepEqual(missing.missingInputs,['wellbeing.warningSigns.worsening']);
 for(const [x,input] of [[{days:2},'wellbeing.days'],[{days:15},'wellbeing.days'],[{text:'I have the flu'},'wellbeing.text'],[{professionalSeen:true},'wellbeing.professionalSeen'],[{condition:'COVID'},'wellbeing.condition'],[{intent:'TRAIN_HARDER'},'wellbeing.intent']]){
  const r=t.step(1,2,'NOT_FEELING_100',{wellbeing:{...wb,...x}});assert.equal(r.status,'ASK',JSON.stringify(x));assert.ok(r.missingInputs.includes(input),JSON.stringify(r.missingInputs));
 }
 const later=t.step(1,2,'NOT_FEELING_100',{wellbeing:{...wb,startDate:t.day(1,4)}});assert.equal(later.status,'ASK','a reduction starts on the day it is reported');
 assert.equal(facts(t,'WELLBEING_DECLARED').length,0,'nothing is recorded until a reduction is accepted');
});

test('S1-2: rest for five days: the window rests, the return reads the short recipe (the last completed doses) and the next step waits for execution',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const before=t.p,from=t.day(1,2),to=t.day(1,6);
 const r=t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:5,returnSpeed:'FASTER'}});
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);
 for(const s of sessionsIn(t.p,from,to))if(before.weeks.flatMap(x=>x.sessions).find(x=>x.id===s.id)?.prescription)assert.equal(s.role,'REST_BY_DESIGN',s.id);
 // History before the report is untouched and the record gains one fact.
 assert.deepEqual(sessionsIn(t.p,before.startDate,t.day(1,1)).map(s=>hash(s.prescription)),sessionsIn(before,before.startDate,t.day(1,1)).map(s=>hash(s.prescription)));
 assert.equal(facts(t,'WELLBEING_DECLARED').length,1);assert.equal(facts(t,'WELLBEING_DECLARED')[0].wellbeing.returnClass,'SHORT');
 // The week after the window holds the doses the athlete last completed: no step planned from the rest.
 const wk2=sessionsIn(t.p,t.day(2,0),t.day(2,6),'STRENGTH'),wk1=sessionsIn(before,t.day(1,0),t.day(1,6),'STRENGTH');
 assert.ok(rowsOf(wk2[0]).every(e=>e.sets<=Math.max(...rowsOf(wk1[0]).map(x=>x.sets))),'never above the doses before the window');
 assert.match(r.reason,/Nothing returns to a previous dose by date alone/);assert.doesNotMatch(r.reason,FORBIDDEN);
 // A replay of the same report changes nothing; the same id with other facts is asked.
 const again=evaluateProgram(t.p,{...t.results.at(-1).trace?{}:{},version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${t.day(1,2)}T08:30:00-03:00`,weekIndex:1,event:{id:facts(t,'WELLBEING_DECLARED')[0].eventId,kind:'NOT_FEELING_100'},eligibility:ELIG(t.day(1,2)),observations:[],wellbeing:{condition:'MILD_ILLNESS',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:5,returnSpeed:'FASTER'},actualLedger:t.ledger,referenceState:t.ref});
 assert.equal(again.status,'KEEP',again.reason);
});

test('S1-3: the speeds never pass the same caps: BALANCED adds a week without a step, CONSERVATIVE reads one class more cautious',()=>{
 const run=speed=>{const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:5,...(speed?{returnSpeed:speed}:{})}});return t;};
 const fast=run('FASTER'),bal=run(),cons=run('CONSERVATIVE');
 assert.equal(facts(cons,'WELLBEING_DECLARED')[0].wellbeing.returnClass,'MODERATE');
 const sets=(t,w)=>sessionsIn(t.p,t.day(w,0),t.day(w,6),'STRENGTH').flatMap(rowsOf).reduce((n,e)=>n+e.sets,0),long=(t,w)=>sessionsIn(t.p,t.day(w,0),t.day(w,6),'RUN').filter(s=>s.role==='LONG').map(s=>s.prescription.durationMinutes)[0]??0;
 for(const w of [2,3,4]){assert.ok(sets(bal,w)<=sets(fast,w),`week ${w}: balanced never above faster`);assert.ok(sets(cons,w)<=sets(bal,w),`week ${w}: conservative never above balanced`);assert.ok(long(bal,w)<=long(fast,w)&&long(cons,w)<=long(bal,w),`week ${w}: long run ordered`);}
 assert.ok(sets(bal,3)<sets(fast,3)||long(bal,3)<long(fast,3),'balanced holds one more week where faster steps');
});

test('S1-4: a light reduction lowers the difficulty and keeps the volume; the weekly review of a reduced week releases no step',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const before=t.p,r=t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'MILD_INDISPOSITION',scope:'WHOLE_BODY',warningSigns:NO,intent:'REDUCE_LIGHT',days:5,returnSpeed:'FASTER'}});
 assert.equal(r.action,'WELLBEING_REDUCTION');
 for(const s of sessionsIn(t.p,t.day(1,2),t.day(1,6))){
  const o=before.weeks.flatMap(x=>x.sessions).find(x=>x.id===s.id);if(!o?.prescription)continue;
  if(s.sport==='STRENGTH'){assert.ok(rowsOf(s).every(e=>e.rir>=4),'more reps in reserve');assert.equal(rowsOf(s).length,rowsOf(o).length,'same exercises');}
  else{assert.ok(!['QUALITY','RACE_TOUCH'].includes(s.role),'no hard run');assert.ok(s.prescription.durationMinutes>=Math.min(o.prescription.durationMinutes,t.p.schedule.runMinutes),'the run keeps its minutes');}
 }
 // The reduced week executed as prescribed is reviewed: no step for either sport (the gates hold), so next week is not above this week's start.
 const done=sessionsIn(t.p,t.day(1,0),t.day(1,6)).filter(live).map(s=>({eventId:'done-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,actual:{completed:true,minutes:s.prescription.durationMinutes,...(s.sport==='STRENGTH'?{exercises:rowsOf(s).map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{})}))}))}:{})},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},occurrenceDate:s.date}));
 const rv=t.step(1,6,'WEEKLY_REVIEW',{observations:done},'20:00');
 assert.ok(Object.values(rv.gates??{}).every(g=>g!=='ADVANCE'&&g!=='EARNED'),JSON.stringify(rv.gates));
});

test('S1-5: hybrid scope: a local discomfort leaves the other sport untouched; a systemic condition never spares a sport',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const before=t.p;t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',scope:'UPPER_BODY',warningSigns:NO,intent:'REDUCE_SUBSTANTIAL',days:5,returnSpeed:'FASTER'}});
 const runs=p=>sessionsIn(p,t.day(1,2),t.day(4,6),'RUN').map(s=>[s.id,hash(s.prescription)]);
 assert.deepEqual(runs(t.p),runs(before),'running is unchanged by an upper-body discomfort');
 for(const s of sessionsIn(t.p,t.day(1,2),t.day(1,6),'STRENGTH').filter(live)){const o=before.weeks.flatMap(x=>x.sessions).find(x=>x.id===s.id);assert.deepEqual(rowsOf(s).filter(e=>e.region==='LOWER').map(e=>[e.id,e.sets,e.rir]),rowsOf(o).filter(e=>e.region==='LOWER').map(e=>[e.id,e.sets,e.rir]),'lower rows unchanged');}
 const u=timeline();u.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(u.p,1)});
 const r=u.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',scope:'RUN',warningSigns:NO,intent:'REST',days:4}});
 assert.deepEqual(facts(u,'WELLBEING_DECLARED')[0].wellbeing.sports,['RUN','STRENGTH'],'a mild illness affects both sports whatever the scope');assert.match(r.reason,/running and strength/);
});

test('S1-6: the race is never changed by a reduction; reductions never chain past 14 days',()=>{
 const race=HYBRID();race.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date:'2026-12-05'}},strength:'GENERAL'};
 const t=timeline(race),raceDay=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE').date,w=Math.floor((Date.parse(raceDay)-Date.parse(t.p.startDate))/864e5/7);
 t.step(w-1,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,w)});
 const d=Math.floor((Date.parse(raceDay)-Date.parse(t.day(w,0)))/864e5);
 if(d>=1){const r=t.step(w,Math.max(0,d-2),'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:5}});assert.equal(r.status,'ASK',r.reason);assert.match(r.reason,/race/);}
 const c=timeline();c.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(c.p,1)});
 const a=c.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',scope:'WHOLE_BODY',warningSigns:NO,intent:'REDUCE_SUBSTANTIAL',days:10,returnSpeed:'FASTER'}});assert.equal(a.action,'WELLBEING_REDUCTION');
 const b=c.step(2,2,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',scope:'WHOLE_BODY',warningSigns:NO,intent:'REST',days:7}});assert.equal(b.status,'ASK');assert.match(b.reason,/14 days/);
});

// ---------------- Situation 2 ----------------
function clinicalBreak(){
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const r=t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');
 return t;
}
test('S2-1: a clinical hold has a legitimate exit: an incomplete or stale declaration keeps it; a complete one restarts each sport declared ready',()=>{
 const t=clinicalBreak();
 assert.equal(t.step(3,1,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','the hold stands until the athlete declares readiness');
 const half=t.step(3,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true}}}});assert.equal(half.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(half.missingInputs,['readiness.sports.STRENGTH.ready']);
 const stale=t.step(3,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}},eligibility:ELIG(t.day(3,1))});assert.equal(stale.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(stale.missingInputs,['eligibility.assessedToday']);
 const r=t.step(3,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:false}}}});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.doesNotMatch(r.reason,FORBIDDEN);assert.match(r.reason,/not a medical clearance/);
 const d=t.p.decisions.at(-1);assert.equal(d.interruption.cause,'CLINICAL');assert.equal(d.interruption.nonclinical,false);assert.equal(d.interruption.restart,'READINESS_DECLARED');
 // Strength stays held; running restarts; the record keeps the clinical break and gains the declaration.
 assert.ok(sessionsIn(t.p,t.day(3,3),t.day(5,6),'STRENGTH').every(s=>s.role==='REST_BY_DESIGN'||!s.prescription),'strength held');
 assert.ok(sessionsIn(t.p,t.day(4,0),t.day(4,6),'RUN').some(live),'running restarts');
 assert.equal(facts(t,'INTERRUPTION_DECLARED')[0].interruption.reasonCategory,'ILLNESS','the clinical cause stays on record');assert.equal(facts(t,'READINESS_DECLARED').length,1);
 assert.notEqual(t.step(3,4,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','the restart is in force');
});

test('S2-2: a restriction is a hard cap until a later declaration ends it; a new sign returns to the hold and needs a new declaration',()=>{
 const t=clinicalBreak();
 t.step(3,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}}}});
 const ahead=sessionsIn(t.p,t.day(3,3),t.day(7,6),'STRENGTH').filter(live);
 assert.ok(ahead.length&&ahead.every(s=>rowsOf(s).every(e=>e.region!=='LOWER')),'no lower-body row while restricted');
 const end=t.step(4,1,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}}});
 assert.equal(end.action,'READINESS_RESTART',end.reason);
 assert.ok(sessionsIn(t.p,t.day(5,0),t.day(7,6),'STRENGTH').filter(live).some(s=>rowsOf(s).some(e=>e.region==='LOWER')),'lower rows come back after the stated end');
 const back=sessionsIn(t.p,t.day(4,2),t.day(4,6),'STRENGTH').filter(live).flatMap(rowsOf).filter(e=>e.region==='LOWER');
 assert.ok(back.every(e=>e.sets<=1&&e.rir>=4)||!back.length,'the restricted rows restart by the return rules, never at prior loads');
 const sign=t.step(5,1,'WEEKLY_REVIEW',{flags:{injury:true}});assert.equal(sign.status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(t.step(5,2,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','back to the hold');
 assert.equal(t.step(5,3,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}}}).action,'READINESS_RESTART');
});

test('S2-3: a hold from a pain substitution (no break) has the same exit; no hold means nothing to restart; a replay changes nothing',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const x=t.p.weeks[1].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date>t.day(1,2)),ex=rowsOf(x)[0];
 assert.equal(t.step(1,2,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}).status,'CLINICAL_HUMAN_REQUIRED');
 const r=t.step(1,4,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}}});
 assert.equal(r.action,'READINESS_RESTART',r.reason);assert.notEqual(t.step(1,5,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED');
 const id=facts(t,'READINESS_DECLARED')[0].eventId,replay=t.step(1,5,'READINESS_DECLARATION',{eventId:id,readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}}});
 assert.equal(replay.status,'KEEP');
 const none=timeline(),k=none.step(1,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true}}}});
 assert.equal(k.status,'KEEP');assert.match(k.reason,/nothing to restart/);
});

// ---------------- Situation 3 ----------------
test('S3-1: a new plan: a standing clinical hold needs the declaration first; after it, the cold start with the pause and restrictions carried',()=>{
 const fresh=(asOf,startDate)=>{const i=HYBRID();i.asOf=asOf;i.startDate=startDate;i.athlete.eligibility={...i.athlete.eligibility,assessedAt:asOf};return i;};
 const t=clinicalBreak(),updated=fresh(t.day(7,0),t.day(7,1));
 const blocked=restartProgram({intake:updated,record:t.ledger,referenceState:t.ref});
 assert.equal(blocked.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(blocked.missingInputs,['readiness']);
 t.step(3,2,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}}}});
 const later=fresh(addDays(t.p.startDate,7*9),addDays(t.p.startDate,7*9+1));
 const g=restartProgram({intake:later,record:t.ledger,referenceState:t.ref});
 assert.equal(g.status,'PROPOSED',g.reason);
 assert.equal(g.program.canonical.athlete.pause.readinessDeclared,true,'the pause carries the declaration, never "nonclinical"');
 assert.ok(g.program.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='STRENGTH'&&live(s)).every(s=>rowsOf(s).every(e=>e.region!=='LOWER')),'the restriction carries over');
 assert.equal(g.restart.carriedRecord.length,t.ledger.length,'the record is returned whole');assert.equal(hash(g.restart.carriedRecord),hash(t.ledger));
});
