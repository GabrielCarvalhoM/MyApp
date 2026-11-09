// V1 Coaching Productization: directed tests of the single bounded fix cycle on candidate fa3985b, one per finding fixed. They cover the judges'
// surviving mutants (QRE-V1CP M01, M07, M11, M12, M26, M33, M37, M54; M51 is S1-10 in v1cp-f08) and the findings of QRE-V1CP-01..13,
// SSCTR-V1CPI-01..12 and SEC-V1CPI-01..11 that the cycle fixes.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,restartProgram,canonicalizeIntake}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {screenInterruptionReason}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-clinical.mjs')).href);
const F=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-f08.mjs')).href);
const {HYBRID,doneBefore,live}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/test/v1cp-fixtures.mjs')).href);
const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false])),S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}})=>({declaredRecovered:true,warningSigns:RNO(),sports});
const RACE=i=>{i.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'GENERAL'};return i;};
const KNOWN5=i=>{i.athlete.knownExercises=['db-bench-press','db-row'].map(id=>({id,load:{value:20,unit:'KG',convention:'PER_HAND'},sets:5,reps:8,rir:2,observedAt:'2026-11-06',current:true,familiar:true,tolerated:true}));return i;};
function timeline(input=HYBRID()){
 const g=generateProgram(input);assert.equal(g.status,'PROPOSED',g.reason);
 const t={p:g.program,ledger:[],ref:null,n:0};
 t.step=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);const r=evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`fc-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:t.ledger}),...(t.ref&&!extra.noRef?{referenceState:t.ref}:{})});
  t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 return t;
}
const doneWeek=(t,w,{adverse=[],skip=[],load=false}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId)&&!skip.includes(o.sessionId)).map(o=>{const s=t.p.weeks[w].sessions.find(x=>x.id===o.sessionId);let x=adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adv',response:{...o.response,recovery:'ADVERSE'}}:o;
 if(load&&x.actual.exercises)x={...x,actual:{...x.actual,exercises:x.actual.exercises.map(e=>{const row=s.prescription.exercises.find(y=>y.id===e.id);return {...e,sets:e.sets.map(z=>z.load||row.load.mode==='BODYWEIGHT'?z:{...z,load:{value:row.load.mode==='KNOWN'?row.load.value:10,unit:'KG',convention:row.load.convention}})};})}};return x;});
const ladder=(p,w)=>(p.weeks[w]?.adaptations??[]).find(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy)?.rungs??null;
const sets=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
const runsOf=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s));
/** A window from week 1's Tuesday morning, each window week done and reviewed with its check; the last review is the window-end check. */
function windowThenCheck(input,{condition='NEED_REST',intent='REDUCE_SUBSTANTIAL',days=5,speed='BALANCED',sports,skip=()=>[],load=false,start=1}={}){
 const t=timeline(input);for(let k=0;k<1;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k,{load})});
 const r=t.step(1,start,'NOT_FEELING_100',{wellbeing:{condition,warningSigns:NO(condition),intent,days,returnSpeed:speed,...(sports?{sports}:{})}},'07:00');assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);
 const end=Math.floor((7+start+days-1)/7);
 for(let w=1;w<=end;w++){const obs=doneWeek(t,w,{skip:skip(t,w),load});t.step(w,6,'WEEKLY_REVIEW',{observations:obs,check:{warningSigns:NO(condition),...(obs.length?{exerciseResponse:XNO(condition)}:{}),...(w===end?{improved:true}:{})}});}
 t.review=(w,o={})=>{const obs=doneWeek(t,w,{load,...o});return t.step(w,6,'WEEKLY_REVIEW',{observations:obs,check:{warningSigns:NO(condition),...(obs.length?{exerciseResponse:XNO(condition)}:{})}});};
 return {t,from:end+1,condition};
}

// ---------------- QRE-V1CP-01: the A1 collocations as approved ----------------
test('QRE-V1CP-01: impact and care texts outside the approved collocations stay asked on the default path',()=>{
 for(const reason of ['banged my head into the door frame','knocked my head into a beam at work','back at the clinic again','back in a brace for two weeks','back on Wednesday'])assert.notEqual(screenInterruptionReason({reason,reasonCategory:'WORK',nonclinical:true}).status,'NONCLINICAL',reason);
});

// ---------------- QRE-V1CP-02 / AF-01 (M11): a superseded episode is closed ----------------
test('QRE-V1CP-02 (M11): after a readiness restart or a declared break, the superseded Situation 1 episode is closed and its ladder never comes back',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'08:00');
 assert.equal(t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W1]:true}}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
 const r=t.step(2,1,'READINESS_DECLARATION',{readiness:READY()},'07:00');assert.equal(r.action,'READINESS_RESTART',r.reason);
 const week3=runsOf(t.p,3).map(s=>s.prescription.durationMinutes).join('/');
 // The week's review never asks the window-end items of the closed episode; from the restart's re-entry week, its own check (W1-W9, X1-X4).
 const q=t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2)});assert.ok(!(q.missingInputs??[]).some(k=>/improved|bodyWideAches/.test(k)),JSON.stringify(q.missingInputs));
 const q3=t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3)});assert.equal(q3.status,'ASK');assert.ok(!q3.missingInputs.some(k=>/improved/.test(k)));
 assert.ok(!t.p.weeks.slice(3).some(x=>ladder({weeks:[x]},0)),'no Situation 1 ladder after the restart');
 assert.ok(week3.length>0);
 // A declared break during the wait: the weeks after its return carry live sessions (the wait ended with the episode).
 const b=timeline();b.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(b,0)});
 b.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'08:00');
 const ret=b.step(2,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:b.day(1,4),endDate:b.day(1,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(ret.action,'REESTABLISH',ret.reason);assert.ok([3,4].every(w=>b.p.weeks[w].sessions.some(live)),'the wait does not continue after the return');
});

// ---------------- QRE-V1CP-03 / SEC-V1CPI-03: holds are facts of the record ----------------
test('SEC-V1CPI-03 (QRE-V1CP-03): a new plan reads every standing hold from the record; no reference state is needed',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[F.WARNING_SIGNS.W2]:true},intent:'REST',days:5}},'08:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.ok(t.ledger.some(o=>o.fact===F.CLINICAL_HOLD),'the hold is on record');
 const i=HYBRID();i.asOf=t.day(3,0);i.startDate=t.day(3,1);i.athlete.eligibility=ELIG(t.day(3,0));i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};
 assert.equal(restartProgram({intake:i,record:t.ledger}).status,'CLINICAL_HUMAN_REQUIRED','without any reference state');
 t.step(2,1,'READINESS_DECLARATION',{readiness:READY()},'07:00');
 assert.equal(restartProgram({intake:i,record:t.ledger}).status,'PROPOSED','released by the declaration on record');
});

// ---------------- SEC-V1CPI-01 / -02 / QRE-V1CP-06: restart facts ----------------
test('SEC-V1CPI-01, -02 (QRE-V1CP-06): intake data never carries the restart facts; a stated cause is screened; the record\'s pause is never shortened',()=>{
 const i=HYBRID();i.athlete.pause={weeks:6,reasonCategory:'INJURY',reason:'surgery on my knee',readinessDeclared:true};
 const c=canonicalizeIntake(i);assert.notEqual(c.status,'CANONICAL');assert.ok(c.errors.includes('athlete.pause.readinessDeclared'));
 const j=HYBRID();j.athlete.restart={readinessEventId:'x',strengthRestrictions:[]};assert.ok(canonicalizeIntake(j).errors.includes('athlete.restart'));
 // After a declaration on record, a clinical cause the athlete now states is screened as stated.
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}});t.step(3,2,'READINESS_DECLARATION',{readiness:READY()});
 const later=HYBRID();later.asOf=addDays(t.p.startDate,63);later.startDate=addDays(t.p.startDate,64);later.athlete.eligibility=ELIG(later.asOf);later.athlete.pause={reasonCategory:'INJURY',reason:'tore a ligament',clinicalReason:true};
 assert.equal(restartProgram({intake:later,record:t.ledger,referenceState:t.ref}).status,'CLINICAL_HUMAN_REQUIRED');
 // A stated pause shorter than the record: the record's days decide the start (the return entry).
 const u=timeline();u.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(u,0)});
 const k=HYBRID();k.asOf=addDays(u.p.startDate,44);k.startDate=addDays(u.p.startDate,45);k.athlete.eligibility=ELIG(k.asOf);k.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true,weeks:1};
 const g=restartProgram({intake:k,record:u.ledger});assert.equal(g.status,'PROPOSED',g.reason);
 assert.ok(g.program.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).every(e=>e.sets<=1&&e.rir>=4),'strength at the return entry');
});

// ---------------- SEC-V1CPI-04: readable rows ----------------
test('SEC-V1CPI-04: a forged or foreign F08 row is never read',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{});
 assert.ok(ladder(t.p,from));
 const forged=F.sealed({fact:'READINESS_DECLARED',eventId:'forged',athleteId:'someone-else',declaredAt:'2026-11-20T10:00:00Z',readiness:{declaredRecovered:true,sports:{}}});
 const tampered={...t.ledger.find(o=>o.fact==='WELLBEING_DECLARED'),wellbeing:{...t.ledger.find(o=>o.fact==='WELLBEING_DECLARED').wellbeing,days:14}};
 assert.equal(F.readableF08([forged],{athleteId:t.p.athleteId,at:Date.now()}).length,0,'another athlete');
 assert.equal(F.readableF08([tampered],{athleteId:t.p.athleteId,at:Date.now()}).length,0,'content changed after it was sealed');
});

// ---------------- SEC-V1CPI-05, -08, -09, -10 ----------------
test('SEC-V1CPI-05, -08, -09, -10: restrictions answered; unknown keys never echoed; contradictions asked; one id is one fact',()=>{
 const f=F.readReadiness({declaredRecovered:true,warningSigns:RNO(),sports:{RUN:{ready:true},STRENGTH:{ready:true}}},{programmed:['RUN','STRENGTH']});assert.deepEqual(f.ask.missingInputs,['readiness.sports.STRENGTH.restrictions']);
 const secret='I take insulin and my cardiologist said no running';
 const e=F.readWellbeing({condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3,[secret]:true},{today:'2026-11-17',programmed:['RUN','STRENGTH']});
 assert.ok(!JSON.stringify(e).includes('insulin'),'never echoed');assert.deepEqual(e.ask.missingInputs,['wellbeing.unrecognized']);
 assert.ok(F.readReadiness({declaredRecovered:true,warningSigns:RNO(),sports:{RUN:{ready:true,runningNotRestricted:false},STRENGTH:{ready:true,restrictions:[]}}},{programmed:['RUN','STRENGTH']}).ask,'running restricted is asked');
 assert.deepEqual(F.readWellbeing({condition:'MINOR_DISCOMFORT',sports:['RUN'],region:'LOWER_BODY',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:3},{today:'2026-11-17',programmed:['RUN','STRENGTH']}).ask.missingInputs,['wellbeing.region']);
 const {t,from}=windowThenCheck(HYBRID(),{}),n=t.ledger.filter(o=>o.fact==='WELLBEING_CHECKED').length;
 const obs=doneWeek(t,from),chk={warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')};
 t.step(from,6,'WEEKLY_REVIEW',{observations:obs,check:chk,eventId:'wr-replay'});const again=t.step(from,6,'WEEKLY_REVIEW',{observations:obs,check:chk,eventId:'wr-replay'});
 assert.equal(again.status,'KEEP');assert.equal(t.ledger.filter(o=>o.fact==='WELLBEING_CHECKED').length,n+1,'a replay adds no fact');
 const reused=t.step(from+1,1,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST')},eventId:t.ledger.find(o=>o.fact==='WELLBEING_DECLARED').eventId},'07:00');assert.equal(reused.status,'ASK');
});

// ---------------- SEC-V1CPI-07, -11 ----------------
test('SEC-V1CPI-07, -11: the screen is today\'s by the program\'s clock; no clearance word anywhere',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 const utc=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3},eligibility:ELIG(`${t.day(1,1)}T02:00:00Z`)},'08:00');
 assert.deepEqual(utc.missingInputs,['eligibility.assessedToday'],'23:00 local the day before is not today');
 for(const x of [F.signRoute([F.WARNING_SIGNS.W2]).reason])assert.doesNotMatch(x,/clear|liberad|apto/i);
});

// ---------------- QRE-V1CP-04: a report new to the check ----------------
test('QRE-V1CP-04: an adverse session reported after a check, though dated before it, is asked about',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{});
 t.step(from,3,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST')}},'07:00');
 const tue=t.p.weeks[from].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date<=t.day(from,1));
 const late=doneWeek(t,from,{adverse:[tue.id]}).filter(o=>o.sessionId===tue.id);
 assert.equal(t.step(from,4,'WEEKLY_REVIEW',{observations:late},'07:00').status,'ASK');
});

// ---------------- QRE-V1CP-05 (M01): D49 through the ladder's exit ----------------
test('QRE-V1CP-05 (M01): strength sets come back one per executed week, through the ladder and past its exit',()=>{
 const {t,from}=windowThenCheck(KNOWN5(HYBRID()),{intent:'REDUCE_SUBSTANTIAL',days:3,speed:'FASTER',start:0});
 const id='db-bench-press',seq=[sets(t.p,1,id)];
 for(let w=from;w<8;w++){seq.push(sets(t.p,w,id));if(w+1<8)t.review(w);}
 for(let k=1;k<seq.length;k++)if(seq[k]&&seq[k-1])assert.ok(seq[k]<=seq[k-1]+1,`sets ${seq.join(' > ')}`);
 assert.ok(seq.includes(5)||seq.at(-1)>=seq[1],'the held sets come back');
});

// ---------------- M07: the R4 reserve clamp, with logged loads ----------------
test('M07 (C-Q12-2): with logged loads, higher strength difficulty lowers eligible rows to RIR 2, and never in a return week at the held doses',()=>{
 const base=timeline(HYBRID({difficulty:{strength:'HIGHER'}}));for(let k=0;k<4;k++)base.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(base,k,{load:true})});
 assert.ok(base.p.weeks[4].sessions.some(s=>s.sport==='STRENGTH'&&live(s)&&s.prescription.exercises.some(e=>e.rir===2))||base.p.weeks[5].sessions.some(s=>s.sport==='STRENGTH'&&live(s)&&s.prescription.exercises.some(e=>e.rir===2)),'D1 HIGHER is active without an episode');
 const {t,from}=windowThenCheck(HYBRID({difficulty:{strength:'HIGHER'}}),{intent:'REDUCE_LIGHT',days:3,speed:'FASTER',load:true,start:1});
 const r4=t.p.weeks.findIndex((x,k)=>k>=from&&ladder(t.p,k)?.STRENGTH==='R4');assert.ok(r4>=from,'a held strength week');
 assert.ok(t.p.weeks[r4].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).every(s=>s.prescription.exercises.every(e=>e.rir>=3)),'the held week keeps the start reserve');
});

// ---------------- M12: a return's own start ----------------
test('M12 (ownStart): a break reported during a ladder week restarts from the break\'s own entry, never from the ladder\'s held start',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{});
 const r=t.step(from+2,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(from,0),endDate:t.day(from+1,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(t.p.stateTrace[from+2].run.mode,'RETURN','the moderate return entry');
});

// ---------------- M26, M54: running inside a window and a return ----------------
test('M26, M54: an R2 week runs no hard session; after a window the first quality slot of the held week runs easy (C-Q06-2)',()=>{
 const p=timeline(RACE(HYBRID())).p,qw=p.weeks.findIndex(x=>x.sessions.some(s=>s.role==='QUALITY'&&live(s)));assert.ok(qw>0);
 const t=timeline(RACE(HYBRID()));for(let k=0;k<qw;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(qw,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:4}},'07:00');
 assert.ok(!t.p.weeks[qw].sessions.some(s=>live(s)&&['QUALITY','RACE_TOUCH'].includes(s.role)&&s.date<=t.day(qw,3)),'M54: no hard session inside the R2 window');
 const u=timeline(RACE(HYBRID()));for(let k=0;k<qw-1;k++)u.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(u,k)});
 u.step(qw-1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:3,returnSpeed:'FASTER'}},'07:00');
 u.step(qw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(u,qw-1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
 assert.equal(ladder(u.p,qw)?.RUN,'R4');
 // The held week runs the held doses; the first quality slot after the window, in whichever week it falls (D58), runs easy.
 const eased=u.p.weeks.slice(qw,qw+3).flatMap(x=>x.sessions).find(s=>s.sport==='RUN'&&s.explanation&&/First quality slot/.test(s.explanation));
 assert.ok(eased&&eased.role==='EASY','M26: the first quality slot runs easy');
});

// ---------------- M33, M37: the transition rule ----------------
test('M37 (I-04), M33 (I-16): a reduced window not all done repeats its rung first; repeated adverse weeks lower the held start',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{skip:(t,w)=>w===1?[t.p.weeks[1].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date>=t.day(1,1)).id]:[]});
 assert.deepEqual([from,from+1,from+2,from+3].map(w=>ladder(t.p,w)?.RUN),['R2','R2','R3','R4']);
 const u=windowThenCheck(HYBRID(),{}),held=JSON.stringify(u.t.p.weeks[u.from+1].adaptations.find(a=>a.phase==='LADDER').fixed.STRENGTH);
 const adverseAll=w=>u.t.p.weeks[w].sessions.filter(live).map(s=>s.id);
 u.t.step(u.from,6,'WEEKLY_REVIEW',{observations:doneWeek(u.t,u.from,{adverse:adverseAll(u.from)}),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
 u.t.step(u.from+1,6,'WEEKLY_REVIEW',{observations:doneWeek(u.t,u.from+1,{adverse:adverseAll(u.from+1)}),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
 const later=u.t.p.weeks.slice(u.from+2).map(x=>x.adaptations?.find(a=>a.phase==='LADDER'&&a.fixed?.STRENGTH)).filter(Boolean);
 assert.ok(later.length&&later.some(a=>JSON.stringify(a.fixed.STRENGTH)!==held),'the regressed start replaces the held one');
});

// ---------------- QRE-V1CP-07, SSCTR-V1CPI-05: the race ----------------
test('QRE-V1CP-07, SSCTR-V1CPI-05: a race waits for the window-end check too, and the return never crosses a race',()=>{
 const p=timeline(RACE(HYBRID())).p,raceDay=p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE').date,rw=Math.floor((Date.parse(raceDay)-Date.parse(p.startDate))/864e5/7);
 const t=timeline(RACE(HYBRID()));for(let k=0;k<rw;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});
 t.step(rw,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
 const race=t.p.weeks[rw].sessions.find(s=>s.role==='RACE');
 if(race.date>t.day(rw,2)){assert.equal(race.waitsForCheck,true,'the race waits for the check');assert.ok(race.prescription,'never dropped');}
 const ask=t.step(rw,3,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'07:00');
 if(race.date>=t.day(rw,3)){assert.equal(ask.status,'ASK');assert.match(ask.reason,/never crosses a race/);}
});

// ---------------- QRE-V1CP-08: the new plan's history ----------------
test('QRE-V1CP-08: a new plan made from the record reads the old clinical break as history',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}});t.step(3,2,'READINESS_DECLARATION',{readiness:READY()});
 const i=HYBRID();i.asOf=addDays(t.p.startDate,63);i.startDate=addDays(t.p.startDate,64);i.athlete.eligibility=ELIG(i.asOf);
 const g=restartProgram({intake:i,record:t.ledger,referenceState:t.ref});assert.equal(g.status,'PROPOSED',g.reason);
 const n=timeline();n.p=g.program;n.ledger=g.restart.carriedRecord;
 assert.notEqual(n.step(0,2,'WEEKLY_REVIEW',{},'20:00').status,'CLINICAL_HUMAN_REQUIRED');
});

// ---------------- SSCTR-V1CPI-02: execution facts in held starts ----------------
test('SSCTR-V1CPI-02 (I-14): a long return keeps the held known loads; its clock moves with the exposures the return holds',()=>{
 const {t,from}=windowThenCheck(KNOWN5(HYBRID()),{intent:'REDUCE_SUBSTANTIAL',days:10,speed:'BALANCED',start:1});
 for(let w=from;w<from+2;w++)t.review(w);
 const r4=from+2;assert.equal(ladder(t.p,r4)?.STRENGTH,'R4');
 const rows=t.p.weeks[r4].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id==='db-bench-press');
 assert.ok(rows.length&&rows.every(e=>e.load.mode==='KNOWN'&&e.load.value===20),'the held known load comes back at R4, never re-established by effort for the days the return held');
});

// ---------------- SSCTR-V1CPI-03: rest days before a declared break ----------------
test('SSCTR-V1CPI-03 (I-15): the window\'s rest and waiting days count as days without the sport for a later declared break',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'07:00');
 const r=t.step(4,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(3,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(r.action,'REESTABLISH',r.reason);assert.notEqual(t.p.decisions.at(-1).interruption.classBySport?.RUN??t.p.decisions.at(-1).interruption.class,'SHORT');
});

// ---------------- SSCTR-V1CPI-04: an unreviewed ladder week ----------------
test('SSCTR-V1CPI-04: a ladder week with no review of its own does not count as done',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{});
 assert.equal(ladder(t.p,from+1)?.RUN,'R3');
 const g=t.step(from+1,6,'WEEKLY_REVIEW',{observations:[...doneWeek(t,from),...doneWeek(t,from+1)],check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
 assert.match(g.reason,/no review/);assert.equal(ladder(t.p,from+2)?.RUN,'R3','the step repeats');
});

// ---------------- SSCTR-V1CPI-06: an early end ----------------
test('SSCTR-V1CPI-06: an athlete who recovers early ends the window from its third day, never before',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)});
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:10}},'07:00');
 const soon=t.step(1,2,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'07:00');assert.equal(soon.status,'ASK');assert.match(soon.reason,/at least 3 days/);
 const ok=t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'07:00');
 assert.equal(ok.action,'WELLBEING_RETURN_START',ok.reason);assert.match(ok.reason,/ends today, after 3 days/);
 assert.ok(t.p.weeks[1].sessions.filter(s=>s.date>=t.day(1,3)).some(live),'training resumes from the check');
});

// ---------------- SSCTR-V1CPI-07: a race result ----------------
test('SSCTR-V1CPI-07: a short race result never makes a run below the minimum session, nor throttles the stated typical run',()=>{
 const i=HYBRID();i.athlete.performanceAnchors=[{sport:'RUN',kind:'BEST_RESULT',distanceKm:3,durationMinutes:12,date:'2026-11-01',completed:true,tolerated:true}];
 const p=generateProgram(i).program;
 for(const x of p.weeks.slice(0,3))for(const s of runsOf({weeks:[x]},0))assert.ok(s.prescription.durationMinutes>=15,`${s.id} ${s.prescription.durationMinutes}`);
 assert.ok(runsOf(p,0).filter(s=>s.role==='EASY').every(s=>s.prescription.durationMinutes>=Math.min(40,i.schedule.runMinutes)-5),'the regular runs follow the stated exposure');
});

// ---------------- SSCTR-V1CPI-10: ellipsis ----------------
test('SSCTR-V1CPI-10: "me too" after someone else\'s illness is the athlete\'s own',()=>{
 for(const reason of ['my wife had covid, me too','minha esposa teve covid, eu também','mi esposa tuvo covid, yo también'])assert.equal(screenInterruptionReason({reason,reasonCategory:'FAMILY',nonclinical:true,clinicalReason:false}).status,'CLINICAL',reason);
});

// ---------------- C-Q12-2: a choice during a ladder ----------------
test('C-Q12-2: a preference change during a return is recorded; the return\'s rungs stay',()=>{
 const {t,from}=windowThenCheck(HYBRID(),{}),before=[from,from+1,from+2].map(w=>JSON.stringify(ladder(t.p,w)));
 const r=t.step(from,2,'PREFERENCE_CHANGE',{changes:{coaching:{volume:{strength:'LOWER'},difficulty:'HIGHER'}}},'08:00');assert.equal(r.action,'PREFERENCE_CHANGE',r.reason);
 assert.deepEqual([from,from+1,from+2].map(w=>JSON.stringify(ladder(t.p,w))),before);
});
