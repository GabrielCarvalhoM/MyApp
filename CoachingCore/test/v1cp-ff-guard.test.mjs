// V1CP Fix-Forward: tests that kill the mutants the V1CP recheck found surviving (QRE-V1CPR-06: M12 on the readiness path, M29, N14, N18, N19;
// N11 is killed by NB-3 in v1cp-ff), and the directed tests of the conditions that bind before a freeze (QRE-V1CPR-07, -08; SEC-V1CPR-05, -06;
// SSCTR CF-1: SSCTR-V1CPI-08, -09).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,restartProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const F=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-f08.mjs')).href);
const {HYBRID,doneBefore,live}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/test/v1cp-fixtures.mjs')).href);
const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false]));
const S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}},x={})=>({declaredRecovered:true,warningSigns:RNO(),sports,...x});
const W=F.WARNING_SIGNS;
function timeline(input=HYBRID()){
 const g=generateProgram(input);assert.equal(g.status,'PROPOSED',g.reason);
 const t={p:g.program,ledger:[],ref:null,n:0};
 t.step=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);const r=evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`fg-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref&&!extra.noRef?{referenceState:t.ref}:{})});
  t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 return t;
}
const doneWeek=(t,w,{skip=[]}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId)&&!skip.includes(o.sessionId));
const ladderIn=(p,w)=>(p.weeks[w]?.adaptations??[]).some(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy);
const rows=p=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({...e,week:s.weekIndex})));

// ---- N14 (AF-01 restored): after a readiness restart, the closed Situation 1 episode never comes back, even if its window-end answers are sent ----
test('N14: the S1 window-end answers sent after a readiness restart open no S1 ladder; the restart\'s return stands',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'08:00');
 assert.equal(t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:{...NO('MILD_ILLNESS'),[W.W1]:true}}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
 const r=t.step(2,1,'READINESS_DECLARATION',{readiness:READY()},'07:00');assert.equal(r.action,'READINESS_RESTART',r.reason);
 const mode=t.p.stateTrace[3].run.mode;
 const c=t.step(2,4,'WELLBEING_CHECK',{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}},'07:00');
 assert.notEqual(c.action,'WELLBEING_RETURN_START',c.reason);
 assert.ok(![2,3,4,5].some(w=>ladderIn(t.p,w)),'no Situation 1 ladder after the restart');
 assert.equal(t.p.stateTrace[3].run.mode,mode,'the restart\'s return mode stands');
});

// ---- N18, QRE-V1CPR-07 (SEC-V1CPI-09 residual): a declaration names a hold on record, matched in full ----
test('N18, QRE-V1CPR-07: a declaration naming a hold not on record, or naming nothing, is asked; a full match restarts',()=>{
 const base=()=>{const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'08:00');return t;};
 for(const hold of [{eventId:'not-on-record'},{episodeId:'not-on-record'},{eventId:'not-on-record',episodeId:'x'},{}]){
  const t=base(),r=t.step(2,1,'READINESS_DECLARATION',{readiness:READY(undefined,{hold})},'07:00');
  assert.notEqual(r.action,'READINESS_RESTART',JSON.stringify(hold)+': '+r.reason);assert.ok((r.missingInputs??[]).includes('readiness.hold'),JSON.stringify(r.missingInputs));
 }
 const t=base(),id=t.ledger.find(o=>o.fact===F.CLINICAL_HOLD).eventId,ok=t.step(2,1,'READINESS_DECLARATION',{readiness:READY(undefined,{hold:{eventId:id}})},'07:00');
 assert.equal(ok.action,'READINESS_RESTART',ok.reason);
});

// ---- N19 (SEC-V1CPI-07): a screen answered before the hold cannot answer it ----
test('N19: a same-day screen stamped before the hold is asked again; one stamped after it restarts',()=>{
 const base=()=>{const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'10:00');return t;};
 const t=base(),day=t.day(1,1);
 const before=t.step(1,1,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${day}T11:00:00Z`)},'20:00');
 assert.equal(before.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(before.missingInputs,['eligibility.assessedAfterHold']);
 const u=base(),after=u.step(1,1,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${day}T22:00:00Z`)},'20:00');
 assert.equal(after.action,'READINESS_RESTART',after.reason);
});

// ---- M12 (readiness path): the restart starts from its own entry, never from a fixed copy merged with the old projection ----
test('M12: a readiness restart week starts from the restart\'s own state: no projected execution date leaks into it',()=>{
 const t=timeline();for(let k=0;k<2;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00');
 const d=t.step(3,0,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${t.day(3,0)}T11:30:00Z`)},'09:00');assert.ok(['READINESS_RESTART','REESTABLISH'].includes(d.action),d.reason);
 const from=t.p.decisions.at(-1).fromWeek,decl=t.day(3,0);
 for(const [id,e] of Object.entries(t.p.stateTrace[from].strength.exercises??{}))if(e.lastPerformed)assert.ok(e.lastPerformed<=decl,`${id} lastPerformed ${e.lastPerformed} after the declaration ${decl}`);
});

// ---- M29: a restriction lifted after a restarted plan's entry week enters the new region rows at the entry dose ----
test('M29: rows of a region whose restriction ends after the entry week enter at the return entry (one set, four or more in reserve)',()=>{
 const t=timeline();for(let k=0;k<2;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,6),reasonCategory:'INJURY',reason:'sprained my ankle'}},'07:00');
 t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}}),eligibility:ELIG(`${t.day(3,2)}T11:30:00Z`)},'09:00');
 const i=HYBRID();i.asOf=t.day(5,6);i.startDate=t.day(6,0);i.athlete.eligibility=ELIG(i.asOf);i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};
 const g=restartProgram({intake:i,record:t.ledger,referenceState:t.ref});assert.equal(g.status,'PROPOSED',g.reason);
 assert.ok(rows(g.program).every(e=>e.region!=='LOWER'),'the restriction carries into the new plan');
 const n=timeline();n.p=g.program;n.ledger=g.restart.carriedRecord;n.n=1000;
 for(let k=0;k<3;k++)n.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(n,k),check:S6NO()});
 const lift=n.step(3,0,'READINESS_DECLARATION',{readiness:READY()},'07:00');assert.equal(lift.action,'READINESS_RESTART',lift.reason);
 const lower=rows(n.p).filter(e=>e.region==='LOWER'&&e.week===3);
 assert.ok(lower.length,'lower-body rows come back');assert.ok(lower.every(e=>e.sets<=1&&e.rir>=4),JSON.stringify(lower.map(e=>[e.id,e.sets,e.rir])));
});

// ---- QRE-V1CPR-08: a hold on record is released by a declaration even when the reference state is gone ----
test('QRE-V1CPR-08: a declaration releases a hold the record holds, with or without the reference state',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'08:00');
 const r=t.step(2,1,'READINESS_DECLARATION',{readiness:READY(),noRef:true},'07:00');
 assert.ok(['READINESS_RESTART','REESTABLISH'].includes(r.action),r.reason);assert.ok(t.ledger.some(o=>o.fact===F.READINESS_DECLARED),'the release is on record');
 const i=HYBRID();i.asOf=t.day(4,0);i.startDate=t.day(4,1);i.athlete.eligibility=ELIG(i.asOf);i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};
 assert.equal(restartProgram({intake:i,record:t.ledger}).status,'PROPOSED','a new plan is possible after the release');
});

// ---- SEC-V1CPR-05: only the breaks a restart read are the old plan's history ----
test('SEC-V1CPR-05: a clinical break declared on the restart day, after the restart, still holds the new plan',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 const i=HYBRID();i.asOf=t.day(3,0);i.startDate=t.day(3,0);i.athlete.eligibility=ELIG(i.asOf);i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};
 const g=restartProgram({intake:i,record:t.ledger});assert.equal(g.status,'PROPOSED',g.reason);
 const n=timeline();n.p=g.program;n.ledger=g.restart.carriedRecord;n.n=1000;
 n.step(0,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:n.day(0,0),endDate:n.day(0,0),reasonCategory:'ILLNESS',reason:'flu'}},'18:00');
 assert.equal(n.step(0,1,'WEEKLY_REVIEW',{noRef:true},'20:00').status,'CLINICAL_HUMAN_REQUIRED','the record keeps the break declared under the new plan');
});

// ---- CF-1 SSCTR-V1CPI-08 (I-09): a missed entry week moves the restart's held week ----
test('I-09: when the restart\'s entry week is not done, the entry repeats once more, so two executed entry weeks come before the first step',()=>{
 const t=timeline();for(let k=0;k<2;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00');
 t.step(3,0,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${t.day(3,0)}T11:30:00Z`)},'09:00');
 const f=t.p.decisions.at(-1).fromWeek,entry=w=>JSON.stringify(t.p.weeks[w].sessions.filter(live).map(s=>[s.sport,s.prescription.durationMinutes,(s.prescription.exercises??[]).map(e=>e.sets)]));
 const holds=w=>(t.p.weeks[w].adaptations??[]).filter(a=>a.kind==='RETURN_HOLD');
 assert.ok(holds(f).length&&holds(f+1).length,'entry and its held repeat');
 const r=t.step(f,6,'WEEKLY_REVIEW',{observations:[],check:S6NO()});assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);
 assert.ok(holds(f+2).some(a=>a.repeatOf===f),'the repeat moves one week');assert.ok(holds(f+1).every(a=>Object.values(a.hold??{}).some(Boolean)),'the next week holds too');
 const marks=JSON.stringify(t.p.weeks.map(x=>holds(x.index)));
 t.step(f,6,'WEEKLY_REVIEW',{observations:[],check:S6NO()},'21:00');assert.equal(JSON.stringify(t.p.weeks.map(x=>holds(x.index))),marks,'a second review of the week adds nothing');
 const e1=entry(f+1);t.step(f+1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,f+1),check:S6NO()});assert.equal(entry(f+2),e1,'the second executed entry week repeats the entry');
});

// ---- CF-1 SSCTR-V1CPI-09 (I-10): a region restart records and states the region's own stop ----
test('I-10: a restriction that ends restarts its region from that region\'s own stop, recorded and stated',()=>{
 const t=timeline();for(let k=0;k<2;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,6),reasonCategory:'INJURY',reason:'sprained my ankle'}},'07:00');
 t.step(3,0,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}}),eligibility:ELIG(`${t.day(3,0)}T11:30:00Z`)},'09:00');
 for(let k=3;k<5;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k),check:S6NO()});
 const lift=t.step(5,0,'READINESS_DECLARATION',{readiness:READY()},'07:00');assert.equal(lift.action,'READINESS_RESTART',lift.reason);
 const stop=t.p.decisions.at(-1).readinessRecord.stops.STRENGTH;
 assert.deepEqual(stop.regions,['LOWER']);assert.ok(stop.start<=t.day(2,0),`the lower rows stopped with the break (${stop.start})`);assert.ok(stop.days>=14,`${stop.days} days`);
 assert.match(lift.reason,/lower-body rows restart after \d+ days without them/);
});

// ---- SEC-V1CPR-06: minimisation of the check rows ----
test('SEC-V1CPR-06: an early check that says not improved stores no improvement answer; a hold row stores no event kind',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:10}},'07:00');
 assert.equal(t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:false}},'07:00').status,'KEEP');
 const c=t.ledger.filter(o=>o.fact===F.WELLBEING_CHECKED).at(-1);assert.equal(c.check.improved,null);
 t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:{...NO('NEED_REST'),[W.W2]:true}}},'07:00');
 assert.ok(t.ledger.filter(o=>o.fact===F.CLINICAL_HOLD).every(o=>!('eventKind' in o)));
});
