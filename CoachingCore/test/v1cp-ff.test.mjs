// V1CP Fix-Forward (Founder request of 2026-11-09): directed tests of the named blockers of V1CP, each written RED on 5ee9dec first, from the
// judges' own scenarios: NB-1..NB-6 (SSCTR_V1CP_RECHECK), SB-1..SB-5 (SEC_V1CP_RECHECK) and QRE-V1CPR-02 (QRE_V1CP_RECHECK). The race
// (NB-2 under the Founder's D3) and the decisions of SSCTR-V1CPFF-DECISION-r1 have their own section.
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
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false])),S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}})=>({declaredRecovered:true,warningSigns:RNO(),sports});
const W=F.WARNING_SIGNS;
const KNOWN=(n,i)=>{i.athlete.knownExercises=['db-bench-press','db-row'].map(id=>({id,load:{value:20,unit:'KG',convention:'PER_HAND'},sets:n,reps:8,rir:2,observedAt:'2026-11-06',current:true,familiar:true,tolerated:true}));return i;};
const RACE=(i,date='2026-12-27')=>{i.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date}},strength:'GENERAL'};return i;};
function timeline(input=HYBRID()){
 const g=generateProgram(input);assert.equal(g.status,'PROPOSED',g.reason);
 const t={p:g.program,ledger:[],ref:null,n:0,results:[]};
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`ff-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:t.ledger}),...(t.ref&&!extra.noRef?{referenceState:t.ref}:{})};};
 t.step=(w,d,kind,extra={},time='20:00')=>{const r=evaluateProgram(t.p,t.review(w,d,kind,extra,time));t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 return t;
}
const doneWeek=(t,w,{adverse=[],skip=[],sport=null}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&(!sport||s.sport!==sport))&&!skip.includes(o.sessionId)).map(o=>adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adv',response:{...o.response,recovery:'ADVERSE'}}:o);
const ladder=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy).reduce((o,a)=>({...o,...a.rungs}),null);
const marks=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&!a.endedBy);
const setsOf=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
const liveOn=(p,date,sport)=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.date===date&&s.sport===sport&&live(s));
const reviewWeeks=(t,from,to)=>{for(let k=from;k<to;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});};

// ================= NB-1 (SSCTR-V1CPR-01): the chaining rule CH-r2 (SSCTR-V1CPFF-DECISION-r1, FF-Q7), from the SSCTR's directed tests =================
const lastFact=(t,f)=>t.ledger.filter(o=>o.fact===f).at(-1);
const IMP=(...cs)=>Object.fromEntries(cs.map(c=>[c,true]));
test('NB-1 V1CPR-01 (a): a local report in an illness window moves its sport at the stricter rung carrying the illness; the other sport keeps the illness and its check',()=>{
 const t=timeline(KNOWN(5,HYBRID()));reviewWeeks(t,0,4);
 assert.equal(t.step(4,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:7}},'07:00').action,'WELLBEING_REDUCTION');
 const ill=lastFact(t,F.WELLBEING_DECLARED).eventId;
 const r=t.step(4,2,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.match(r.reason,/strength keeps what you reported before/);
 const v=lastFact(t,F.WELLBEING_DECLARED).wellbeing;assert.equal(v.rungs.RUN,'R0','running stays at R0, the illness rung in force');
 assert.deepEqual(v.carried.RUN.map(c=>c.condition),['MILD_ILLNESS']);assert.equal(v.takenFrom.RUN,ill);
 for(let d=2;d<=6;d++)assert.equal(liveOn(t.p,t.day(4,d),'RUN').length,0,`running rests on day ${d}`);
 for(let d=0;d<=6;d++)assert.equal(liveOn(t.p,t.day(4,d),'STRENGTH').length,0,`strength keeps the illness window on day ${d}`);
 const q=t.step(4,6,'WEEKLY_REVIEW',{check:{warningSigns:NO('MINOR_DISCOMFORT')}});
 assert.equal(q.status,'ASK');assert.ok(q.missingInputs.some(k=>k.endsWith(W.W11))&&q.missingInputs.some(k=>k.endsWith(W.W15)),'the illness items (W1-W15): '+JSON.stringify(q.missingInputs));
 assert.ok(q.missingInputs.includes('wellbeingCheck.improved.MILD_ILLNESS')&&q.missingInputs.includes('wellbeingCheck.improved.MINOR_DISCOMFORT'),'each condition\'s improvement: '+JSON.stringify(q.missingInputs));
 const ok=t.step(4,6,'WEEKLY_REVIEW',{check:{warningSigns:NO('MILD_ILLNESS'),improved:IMP('MILD_ILLNESS','MINOR_DISCOMFORT')}});assert.notEqual(ok.status,'ASK',ok.reason);
 assert.deepEqual(ladder(t.p,5),{RUN:'R2',STRENGTH:'R2'},'no strength step in week 5: both return on the rest row');
});
test('NB-1 V1CPR-01 (b): an easier local report on a sport in an illness return moves it at the ladder rung (R2), never above; strength keeps R2, R3, R4; running returns on the much-lighter row',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
 assert.deepEqual(ladder(t.p,2),{RUN:'R2',STRENGTH:'R2'});
 const r=t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);const v=lastFact(t,F.WELLBEING_DECLARED).wellbeing;
 assert.equal(v.rungs.RUN,'R2','the more restrictive of R3 and the R2 in force');assert.equal(v.carried,undefined,'the illness was answered improved: nothing is carried');
 assert.deepEqual([2,3,4].map(w=>ladder(t.p,w)?.STRENGTH),['R2','R3','R4'],'strength keeps its ladder');
 assert.ok(t.p.weeks[2].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>t.day(2,1)).every(s=>s.prescription.exercises.every(e=>e.sets<=1&&e.rir>=4)),'no strength above R2 in the R2 week');
 const runs=t.p.weeks[2].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=t.day(2,1)&&s.date<=t.day(2,3));
 assert.ok(runs.every(s=>!['QUALITY','LONG','RACE_TOUCH'].includes(s.role)),'running at R2 in the window: no hard or long run');
 const done=doneWeek(t,2).filter(o=>runs.some(s=>s.id===o.sessionId));
 const c=t.step(2,4,'WELLBEING_CHECK',{observations:done,check:{warningSigns:NO('MILD_ILLNESS'),...(done.length?{exerciseResponse:XNO('MILD_ILLNESS')}:{}),improved:true}},'09:00');assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 assert.equal(t.p.decisions.at(-1).wellbeing.plans.RUN.row,'REDUCE_SUBSTANTIAL','running returns on the REDUCE_SUBSTANTIAL row');
 assert.deepEqual([2,3,4,5].map(w=>ladder(t.p,w)?.RUN),['R2','R2','R3','R4'],'R2, R3, R4 (the mid-week first week repeats)');
});
test('NB-1 V1CPR-01 (c): a stricter local report during a return takes only its sport (R0, then its wait); the other sport keeps R2, R3, R4',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:XNO('MINOR_DISCOMFORT'),improved:true}});
 assert.deepEqual(ladder(t.p,2),{RUN:'R2',STRENGTH:'R2'});
 const r=t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',sports:['STRENGTH'],warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.match(r.reason,/running keeps what you reported before/);
 assert.deepEqual([2,3,4].map(w=>ladder(t.p,w)?.RUN),['R2','R3','R4'],'running keeps its ladder: never the held doses plus a step after the R2 week');
 for(let d=1;d<=6;d++)assert.equal(liveOn(t.p,t.day(2,d),'STRENGTH').length,0,`strength day ${d}: rest, then its own wait`);
});
test('NB-1 V1CPR-01 (d): another condition in an illness rest window keeps both sports at R0 until the illness end, carrying it (W11, W15 still asked); at an R2 rung an easier report keeps R2',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'07:00');
 const r=t.step(1,3,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);const v=lastFact(t,F.WELLBEING_DECLARED).wellbeing;
 assert.deepEqual(v.rungs,{RUN:'R0',STRENGTH:'R0'});assert.deepEqual(Object.keys(v.carried).sort(),['RUN','STRENGTH']);
 for(let d=1;d<=6;d++)for(const s of ['RUN','STRENGTH'])assert.equal(liveOn(t.p,t.day(1,d),s).length,0,`${s} day ${d}: no session until the illness is answered`);
 const c=t.step(1,6,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:IMP('UNUSUAL_FATIGUE','MILD_ILLNESS')}},'09:00');
 assert.equal(c.status,'ASK',c.reason);assert.ok(c.missingInputs.some(k=>k.endsWith(W.W11))&&c.missingInputs.some(k=>k.endsWith(W.W15)),'the illness items are still asked: '+JSON.stringify(c.missingInputs));
 const u=timeline();reviewWeeks(u,0,1);
 u.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 u.step(1,3,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(lastFact(u,F.WELLBEING_DECLARED).wellbeing.rungs.STRENGTH,'R2');
 assert.ok(u.p.weeks[1].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=u.day(1,3)&&s.date<=u.day(1,5)).every(s=>s.prescription.exercises.every(e=>e.sets<=1)),'R2 strength rows stay at one set (never raised to three)');
});
test('NB-1 V1CPR-01 (e), OBS-R2 (CH-r2-8): the same illness after it was answered improved, before the chain resets, is a recurrence: the clinical route with the professional-assessment recommendation',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:10}},'07:00');
 const e=t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}},'07:00');assert.equal(e.action,'WELLBEING_RETURN_START',e.reason);
 const r=t.step(1,4,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:14}},'07:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.match(r.reason,/came back/);assert.match(r.reason,/professional assessment/);
 assert.deepEqual(r.guidance,{level:'PROFESSIONAL_ASSESSMENT',wordingStatus:'INTERIM_PENDING_G04'});
 const rec=lastFact(t,F.WELLBEING_DECLARED);assert.equal(rec.wellbeing.persistence,'RECURRENCE');assert.equal(rec.wellbeing.chained,true,'recorded, never a window: never 18 days of windows');
 const u=timeline();reviewWeeks(u,0,1);
 u.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'07:00');
 assert.equal(u.step(2,1,'WELLBEING_CHECK',{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}},'07:00').action,'WELLBEING_RETURN_START');
 const again=u.step(3,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'07:00');
 assert.equal(again.status,'CLINICAL_HUMAN_REQUIRED',again.reason);assert.match(again.reason,/came back/);
});
test('NB-1 -06 (CH-r2-3 (b)): the same condition, easier, inside its window changes nothing: KEEP with the check offered, nothing recorded, not persistence; again the next week inside the window: still KEEP',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 const n=t.ledger.filter(o=>o.fact===F.WELLBEING_DECLARED).length,plan=t.p.hash;
 const a=t.step(1,3,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(a.status,'KEEP',a.reason);assert.equal(a.offers[0].type,'WELLBEING_CHECK');assert.equal(t.ledger.filter(o=>o.fact===F.WELLBEING_DECLARED).length,n,'no WELLBEING_DECLARED row');assert.equal(t.p.hash,plan);
 const b=t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:2}},'07:00');
 assert.equal(b.status,'KEEP',b.reason);assert.equal(t.ledger.filter(o=>o.fact===F.WELLBEING_DECLARED).length,n);
});
test('NB-1 (CH-r2-8): the same condition in its wait is its not-improved answer: clinical (discomfort, illness) or the break or a new plan (need to rest); never a new window',()=>{
 for(const [c,status] of [['MINOR_DISCOMFORT','CLINICAL_HUMAN_REQUIRED'],['MILD_ILLNESS','CLINICAL_HUMAN_REQUIRED'],['NEED_REST','ASK']]){
  const t=timeline();reviewWeeks(t,0,1);
  t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:'REST',days:3}},'07:00');
  const r=t.step(1,5,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:'REST',days:3}},'07:00');
  assert.equal(r.status,status,c+': '+r.reason);if(status==='ASK')assert.deepEqual(r.missingInputs,['interruption|restart']);
  assert.equal(lastFact(t,F.WELLBEING_DECLARED).wellbeing.persistence,'NOT_IMPROVED',c+': recorded');assert.ok(!marks(t.p,2).some(a=>a.phase==='WINDOW'),c+': no new window');
 }
});
test('NB-1 (CH-r2-2, FF-Q7 (i)): another condition on a sport at a recipe step moves it to R3 on the recipe\'s own state; after it the recipe continues from that state',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:5,returnSpeed:'CONSERVATIVE'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('UNUSUAL_FATIGUE'),exerciseResponse:XNO('UNUSUAL_FATIGUE'),improved:true}});
 assert.deepEqual(ladder(t.p,2),{RUN:'M',STRENGTH:'M'},'the MODERATE recipe');
 const recipe=t.p.stateTrace[2],rowsBefore=new Map(t.p.weeks[2].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>[e.id,e])));
 const longest=Math.max(0,...t.p.weeks[2].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>s.prescription.durationMinutes));
 const r=t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.equal(lastFact(t,F.WELLBEING_DECLARED).wellbeing.rungs,undefined,'R3: a recipe step ranks with R4, so the report\'s R3 is the stricter');
 for(const s of t.p.weeks[2].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=t.day(2,1)&&s.date<=t.day(2,3)))for(const e of s.prescription.exercises){const x=rowsBefore.get(e.id);if(x){assert.ok(e.sets<=x.sets,`${e.id}: sets never above the recipe's`);assert.ok(e.rir>=Math.max(x.rir,4),`${e.id}: RIR 4 or more`);}}
 for(const s of t.p.weeks[2].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=t.day(2,1)&&s.date<=t.day(2,3)))assert.ok(s.prescription.durationMinutes<=longest,'no run above the recipe\'s');
 assert.equal(t.step(2,4,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'09:00').action,'WELLBEING_RETURN_START');
 const held=t.p.weeks.slice(3).flatMap(x=>x.adaptations??[]).find(a=>a.phase==='LADDER'&&a.fixed?.RUN);
 assert.equal(held?.fixed.RUN.mode,recipe.run.mode,'after the window the return holds the recipe\'s own state');
});
test('NB-1 ((vii)): a report on a sport no report governs opens its own report: no question; its condition is answered apart from the same condition of the other report',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:4}},'07:00');
 const s=t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:5}},'07:00');
 assert.equal(s.action,'WELLBEING_REDUCTION',s.reason);assert.match(s.reason,/adds to what you reported before/);assert.equal(lastFact(t,F.WELLBEING_DECLARED).wellbeing.takenFrom,undefined);
 const [a,b]=t.ledger.filter(o=>o.fact===F.WELLBEING_DECLARED).map(o=>o.eventId);
 const amb=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:{MINOR_DISCOMFORT:true}}},'08:30');assert.equal(amb.status,'ASK','while both are open, the shared name alone does not say which');
 const c=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:{[`MINOR_DISCOMFORT@${a}`]:true}}},'09:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);assert.match(c.reason,/running/);assert.doesNotMatch(c.reason,/for strength:/);
 assert.ok(marks(t.p,1).some(m=>m.episode===b&&m.phase==='WINDOW'&&m.rungs?.STRENGTH&&m.endDate===t.day(1,6)),'strength keeps its own window and its own check');
 const late=t.step(1,5,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:{MINOR_DISCOMFORT:true}}},'09:00');assert.equal(late.action,'WELLBEING_RETURN_START','with running answered, the name now names the strength report alone: its own early end');
});
test('NB-1 ((vii), regions): another strength region merges into the whole sport at the stricter rung, carrying the first condition',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],region:'UPPER_BODY',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:6}},'07:00');
 const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',sports:['STRENGTH'],region:'LOWER_BODY',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);const v=lastFact(t,F.WELLBEING_DECLARED).wellbeing;
 assert.equal(v.region,null,'the whole sport');assert.deepEqual(v.carried.STRENGTH.map(c=>c.condition),['MINOR_DISCOMFORT']);
 for(const s of t.p.weeks[1].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=t.day(1,1)&&s.date<=t.day(1,3)))assert.ok(s.prescription.exercises.every(e=>e.sets<=1),'every strength row, upper and lower, at R2');
});
test('NB-1 (CH-r2-6): each improvement answer applies to its condition: a discomfort not improved routes clinical; a need to rest not improved keeps running waiting while strength returns',()=>{
 const two=()=>{const t=timeline();reviewWeeks(t,0,1);
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',sports:['RUN'],warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:3}},'07:30');return t;};
 const a=two(),r=a.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:{NEED_REST:true,MINOR_DISCOMFORT:false}}},'09:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.match(r.reason,/professional assessment/);
 const b=two(),s=b.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:{NEED_REST:false,MINOR_DISCOMFORT:true}}},'09:00');
 assert.equal(s.action,'WELLBEING_RETURN_START',s.reason);assert.deepEqual(s.offers.find(o=>o.type==='INTERRUPTION_OR_RESTART')?.sports,['RUN']);
 assert.equal(ladder(b.p,1)?.STRENGTH,'R2','strength returns');
 for(let d=3;d<=6;d++)assert.equal(liveOn(b.p,b.day(1,d),'RUN').length,0,`running keeps waiting on day ${d}`);
});
test('NB-1 ((vi), CH-r2-9): each sport\'s 14-day count: an early end or a declared break never resets it; a whole executed and checked ladder week does; a disjoint report neither resets nor extends it',()=>{
 const a=timeline();reviewWeeks(a,0,1);
 a.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:10}},'07:00');
 assert.equal(a.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}},'07:00').action,'WELLBEING_RETURN_START');
 const ea=a.step(1,4,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:14}},'07:00');
 assert.equal(ea.status,'ASK',ea.reason);assert.match(ea.reason,/choose 1 to 10 days/,'an early end does not reset the count');
 const b=timeline();reviewWeeks(b,0,1);
 b.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 b.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(b,1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
 b.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(b,2),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS')}});
 const eb=b.step(3,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:14}},'07:00');
 assert.equal(eb.action,'WELLBEING_REDUCTION',eb.reason+' (a whole executed and checked ladder week resets the count)');
 const c=timeline();reviewWeeks(c,0,1);
 c.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 c.step(1,5,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:5}},'07:00');
 const ec=c.step(1,6,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:14}},'07:00');
 assert.equal(ec.status,'ASK',ec.reason);assert.match(ec.reason,/choose 1 to 8 days/,'the smallest allowance: running 8 from its own start, strength 13 from its own');
 const d=timeline();reviewWeeks(d,0,1);
 d.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:7}},'07:00');
 const br=d.step(2,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:d.day(2,0),endDate:d.day(2,2),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');assert.notEqual(br.status,'CLINICAL_HUMAN_REQUIRED',br.reason);
 const ed=d.step(2,3,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'08:00');
 assert.equal(ed.status,'ASK',ed.reason);assert.match(ed.reason,/choose 1 to 4 days/,'a declared break never resets the count: 14 days from the first window start');
});

// ================= NB-2 (Founder D3; SSCTR-FF-Q2): a race during a reduction, a return or a restart, from the SSCTR's directed tests =================
const RACE_DAY='2026-12-26';
const raceRow=t=>t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE');
const raceOffer=r=>(r.offers??[]).find(o=>o.type==='RACE_PATHS');
const raceT=()=>{const t=timeline(RACE(HYBRID(),RACE_DAY));return {t,rw:raceRow(t).weekIndex,date:raceRow(t).date};};
test('NB-2 (FF-Q2 (b), (c)): a race inside a window is the athlete\'s own event: no question, the rung\'s easy run, no strength that day, the three paths offered once, no completion item',()=>{
 const {t,rw,date}=raceT();reviewWeeks(t,0,rw);
 const r=t.step(rw,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:6}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.equal(r.status,'MODIFY');
 const race=raceRow(t);assert.equal(race.date,date);assert.equal(race.role,'RACE','the event keeps its identity and date');assert.equal(race.ownEvent,true);assert.equal(race.coachRecommendation,'EASY_RUN');
 const easy=t.p.weeks[rw].sessions.filter(s=>s.sport==='RUN'&&s.role==='EASY'&&live(s)).map(s=>s.prescription.durationMinutes);
 assert.equal(race.prescription.family,'EASY');if(easy.length)assert.equal(race.prescription.durationMinutes,Math.min(...easy),'at the week\'s easy duration');
 assert.match(race.explanation,/does not plan a race while you are unwell/);assert.doesNotMatch(race.explanation,/cleared|safe to/i);
 assert.equal(liveOn(t.p,date,'STRENGTH').length,0,'race day keeps no strength');
 const o=raceOffer(r);assert.ok(o&&o.blocking===false,'the three paths are offered, never blocking');assert.deepEqual(o.paths.map(p=>p.id),['KEEP_AS_OWN_EVENT','MOVE','REMOVE']);assert.equal(o.paths[0].default,true);
 assert.ok(!(t.p.negotiation??[]).some(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING'),'no completion item');
 assert.ok(!(r.disclosures??[]).some(d=>d.id==='RACE_DURING_RETURN'),'the old disclosure is replaced by the offer');
 const later=t.step(rw,2,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3}},'07:00');
 assert.equal(later.action,'WELLBEING_REDUCTION',later.reason);assert.equal(raceOffer(later),undefined,'offered once, when the race enters the scope');assert.equal(raceRow(t).coachRecommendation,'NO_SESSION');
});
test('NB-2 (FF-Q2 (b)): at R0 or in the wait the race slot has no session and the event is kept; the r12 dead end: a check starts the return and the race slot is the rung\'s easy run',()=>{
 const a=raceT();reviewWeeks(a.t,0,a.rw);a.t.step(a.rw,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'07:00');
 const r0=raceRow(a.t);assert.equal(r0.coachRecommendation,'NO_SESSION');assert.equal(r0.prescription,null);assert.equal(r0.role,'RACE');assert.equal(r0.date,a.date);
 const b=raceT();reviewWeeks(b.t,0,b.rw);b.t.step(b.rw,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
 assert.equal(raceRow(b.t).coachRecommendation,'NO_SESSION','inside the wait: no session');
 const c=b.t.step(b.rw,3,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'07:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);assert.equal(ladder(b.t.p,b.rw)?.RUN,'R2');assert.equal(raceRow(b.t).coachRecommendation,'EASY_RUN','the race slot is the first rung\'s easy run');
});
test('NB-2 (FF-Q2 (a), (b)): R3 and R4 weeks hold the race in scope: an easy run at once, the race-week touch easy',()=>{
 const touch=(()=>{const p=timeline(RACE(HYBRID(),RACE_DAY)).p;return p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE_TOUCH')??null;})();
 const a=raceT();reviewWeeks(a.t,0,a.rw-1);
 a.t.step(a.rw-1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:5}},'07:00');
 const e=a.t.step(a.rw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(a.t,a.rw-1),check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:XNO('MINOR_DISCOMFORT'),improved:true}});
 assert.notEqual(e.status,'ASK',e.reason);assert.equal(ladder(a.t.p,a.rw)?.RUN,'R3');assert.equal(raceRow(a.t).coachRecommendation,'EASY_RUN','an R3 week: an easy run');
 const b=raceT();reviewWeeks(b.t,0,b.rw-2);
 b.t.step(b.rw-2,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:5}},'07:00');
 b.t.step(b.rw-2,6,'WEEKLY_REVIEW',{observations:doneWeek(b.t,b.rw-2),check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:XNO('MINOR_DISCOMFORT'),improved:true}});
 b.t.step(b.rw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(b.t,b.rw-1),check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:XNO('MINOR_DISCOMFORT')}});
 assert.equal(ladder(b.t.p,b.rw)?.RUN,'R4');assert.equal(raceRow(b.t).coachRecommendation,'EASY_RUN','an R4 week is still in scope');
 if(touch){const s=b.t.p.weeks[b.rw].sessions.find(x=>x.id===touch.id);assert.equal(s.prescription?.family,'EASY','the race-week touch runs easy');}
});
test('NB-2 (C-FF2-4): when the return completes before the race, the race leaves the scope: the event rules plan it again and the decision says so',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-5);
 const r=t.step(rw-5,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
 assert.equal(raceRow(t).coachRecommendation,'NO_SESSION','while the sessions wait for the check, so does the race');assert.ok(raceOffer(r));
 const c=t.step(rw-5,3,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'07:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);assert.ok((c.disclosures??[]).some(d=>d.id==='RACE_BACK_TO_EVENT_RULES'),'the decision says the race left the scope');
 const race=raceRow(t);assert.equal(race.ownEvent,undefined);assert.ok(race.prescription&&race.prescription.family!=='EASY','the event rules plan the race');
});
test('NB-2 (QRE-V1CPR-09): a strength-only report never involves the race: no offer, the race keeps the event rules',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-1);const before=JSON.stringify(raceRow(t).prescription);
 const r=t.step(rw-1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:3}},'07:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.equal(raceOffer(r),undefined);assert.equal(raceRow(t).ownEvent,undefined);assert.equal(JSON.stringify(raceRow(t).prescription),before);
});
test('NB-2 (FF-Q2 (d), I-17): a ladder week after the race takes no pre-race held start; the rung still applies',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-1);
 t.step(rw-1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(rw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,rw-1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
 assert.deepEqual([rw,rw+1].map(w=>ladder(t.p,w)?.RUN),['R2','R3'],'the plan ends the week after the race');
 const m=t.p.weeks[rw+1].adaptations.find(a=>a.phase==='LADDER'&&a.fixed?.RUN);assert.ok(m,'the marker still records its held start');
 assert.notEqual(JSON.stringify(t.p.stateTrace[rw+1].run),JSON.stringify(m.fixed.RUN),'the week after the race does not start from the pre-race held state');
});
test('NB-2 (FF-Q2 (b)): a MODERATE recipe step in race week: an easy run, no completion prescription, no completion item',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-1);
 t.step(rw-1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:5,returnSpeed:'CONSERVATIVE'}},'07:00');
 t.step(rw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,rw-1),check:{warningSigns:NO('UNUSUAL_FATIGUE'),exerciseResponse:XNO('UNUSUAL_FATIGUE'),improved:true}});
 assert.equal(ladder(t.p,rw)?.RUN,'M');const race=raceRow(t);assert.equal(race.coachRecommendation,'EASY_RUN');assert.equal(race.prescription.family,'EASY');
 assert.ok(!(t.p.negotiation??[]).some(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING'));
});
test('NB-2 (FF-Q2 (a)): a readiness restart with the race two weeks later plans an easy run there, never a completion; a declared nonclinical break\'s return is unchanged',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-2);
 assert.equal(t.step(rw-2,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(rw-3,0),endDate:t.day(rw-3,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
 const r=t.step(rw-2,1,'READINESS_DECLARATION',{readiness:READY()},'07:00');assert.equal(r.status,'MODIFY',r.reason);
 assert.ok(['RETURN','RESTART'].includes(t.p.stateTrace[rw].run.mode),'running is still restarting in race week');
 const race=raceRow(t);assert.equal(race.ownEvent,true);assert.equal(race.coachRecommendation,'EASY_RUN');assert.equal(race.prescription.family,'EASY');assert.ok(raceOffer(r),'the paths are offered');
 const u=raceT();reviewWeeks(u.t,0,u.rw-1);
 const b=u.t.step(u.rw-1,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:u.t.day(u.rw-3,0),endDate:u.t.day(u.rw-2,4),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.notEqual(b.status,'CLINICAL_HUMAN_REQUIRED',b.reason);assert.equal(raceRow(u.t).ownEvent,undefined,'a declared break\'s return keeps the event rules');assert.equal(raceOffer(b),undefined);
});
test('NB-2 (FF-Q2 (c)): removing the race (GOAL_CHANGE) leaves the ladder in place; the record keeps the history',()=>{
 const {t,rw}=raceT();reviewWeeks(t,0,rw-1);
 t.step(rw-1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(rw-1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,rw-1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
 const n=t.ledger.filter(o=>o.fact).length;
 const g=t.step(rw,0,'GOAL_CHANGE',{changes:{goals:{run:'GENERAL'},event:null}},'07:00');assert.equal(g.status,'MODIFY',g.reason);
 assert.equal(raceRow(t),undefined,'the race leaves the plan');assert.equal(ladder(t.p,rw)?.RUN,'R2','the ladder continues');assert.ok(t.ledger.filter(o=>o.fact).length>=n,'the record keeps its history');
});

// ================= NB-3 (SSCTR-V1CPI-03, QRE-V1CPR-01): rest days before a single declared break =================
test('NB-3: a single declared break right after a rest window reads the window\'s rest and waiting days, per sport',()=>{
 const t=timeline();reviewWeeks(t,0,4);
 t.step(4,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'07:00');
 const r=t.step(6,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(5,0),endDate:t.day(5,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(r.action,'REESTABLISH',r.reason);
 const i=t.p.decisions.at(-1).interruption,cls=s=>i.classBySport?.[s]??i.class;
 assert.equal(cls('RUN'),'MODERATE','14 days without running');assert.equal(cls('STRENGTH'),'MODERATE','14 days without strength');
 // A 4-day break straight after the same window: 11 days without either sport.
 const u=timeline();reviewWeeks(u,0,4);
 u.step(4,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'07:00');
 const v=u.step(5,4,'RETURN_AFTER_PAUSE',{interruption:{startDate:u.day(5,0),endDate:u.day(5,3),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(v.action,'REESTABLISH',v.reason);const j=u.p.decisions.at(-1).interruption;
 assert.notEqual(j.classBySport?.RUN??j.class,'SHORT');
 // A running-only rest window lengthens running's stop only.
 const x=timeline();reviewWeeks(x,0,4);
 x.step(4,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:7}},'07:00');
 const y=x.step(6,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:x.day(5,0),endDate:x.day(5,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(y.action,'REESTABLISH',y.reason);const k=x.p.decisions.at(-1).interruption;
 assert.equal(k.classBySport?.RUN,'MODERATE');assert.equal(k.classBySport?.STRENGTH??k.class,'SHORT','strength trained in the window: its own stop is the break');
});

// ================= NB-4 (SSCTR-V1CPI-04, SSCTR-V1CPR-04): an unreviewed ladder week =================
test('NB-4: an elapsed ladder week without its check repeats its rung at the next review, even with sessions pending, and only once',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5,returnSpeed:'FASTER'}},'07:00');
 const c=t.step(1,6,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'09:00');assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 assert.equal(ladder(t.p,2)?.RUN,'R3');assert.equal(ladder(t.p,3)?.RUN,'R4');
 // Week 2 (R3) is neither reported nor reviewed; the week-3 Monday review, with week 3 still ahead, decides.
 const m=t.step(3,0,'WEEKLY_REVIEW',{check:{warningSigns:NO('NEED_REST')}},'08:00');
 assert.notEqual(m.status,'CLINICAL_HUMAN_REQUIRED',m.reason);
 assert.equal(ladder(t.p,3)?.RUN,'R3','week 3 repeats the rung week 2 did not execute');
 assert.equal(ladder(t.p,3)?.STRENGTH,'R3');
 // The same facts reviewed again keep the plan (no stacked repeat).
 const before=JSON.stringify([3,4,5].map(w=>ladder(t.p,w)));
 t.step(3,0,'WEEKLY_REVIEW',{check:{warningSigns:NO('NEED_REST')}},'08:30');
 assert.equal(JSON.stringify([3,4,5].map(w=>ladder(t.p,w))),before,'a second review of the same week adds no repeat');
});

// ================= NB-5 (SSCTR-V1CPI-07): a race result never lowers week 1 =================
test('NB-5: without a reported longest run, a race result only raises the first long run, never lowers a session or the week',()=>{
 const base=()=>{const i=HYBRID();i.athlete.recent={runDaysPerWeek:3,runMinutesPerWeek:150,strengthDaysPerWeek:2};return i;};
 const runs=p=>p.weeks[0].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>[s.id,s.prescription.durationMinutes]);
 const p0=generateProgram(base()).program,r0=new Map(runs(p0)),t0=[...r0.values()].reduce((a,b)=>a+b,0);
 for(const [km,min] of [[5,25],[3,12],[10,62]]){
  const i=base();i.athlete.performanceAnchors=[{sport:'RUN',kind:'BEST_RESULT',distanceKm:km,durationMinutes:min,date:'2026-11-01',completed:true,tolerated:true}];
  const p=generateProgram(i).program,r=new Map(runs(p)),tot=[...r.values()].reduce((a,b)=>a+b,0);
  for(const [id,m] of r0)assert.ok((r.get(id)??0)>=m,`${km} km in ${min} min: ${id} ${r.get(id)} < ${m}`);
  assert.ok(tot>=t0,`${km} km: week total ${tot} < ${t0}`);
  for(let w=1;w<3;w++)assert.ok(p.weeks[w].plannedRunMinutes>=p0.weeks[w].plannedRunMinutes,`${km} km: week ${w} ${p.weeks[w].plannedRunMinutes} < ${p0.weeks[w].plannedRunMinutes}`);
 }
});

// ================= NB-6 (SSCTR-V1CPR-03, QRE-V1CPR-04): D49 on executed sets =================
test('NB-6: on the ladder and past it, strength sets rise at most one over the last executed count',()=>{
 for(const missed of ['R3','R4']){
  const t=timeline(KNOWN(6,HYBRID()));reviewWeeks(t,0,1);
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:3}},'07:00');
  t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
  const id='db-bench-press',executed=[];let lastDone=null;
  for(let w=2;w<8;w++){
   const planned=setsOf(t.p,w,id);if(planned&&lastDone!==null)assert.ok(planned<=lastDone+1,`${missed} missed: week ${w} plans ${planned} after ${lastDone} executed (${executed.join(' > ')})`);
   const skip=ladder(t.p,w)?.STRENGTH===missed&&!executed.includes('skipped')?t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.id):[];
   if(skip.length)executed.push('skipped');else if(planned){executed.push(planned);lastDone=planned;}
   if(w+1<8)t.step(w,6,'WEEKLY_REVIEW',{observations:doneWeek(t,w,{skip}),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
  }
 }
});

// ================= SB-1 (SEC-V1CPI-02 residual, RC-11): a new stop after the return =================
test('SB-1: a new stop after training resumed post-declaration is screened on its own: its reason is asked',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}});
 const d=t.step(3,2,'READINESS_DECLARATION',{readiness:READY()});assert.ok(['READINESS_RESTART','REESTABLISH'].includes(d.action),d.reason);
 for(let w=3;w<6;w++)t.step(w,6,'WEEKLY_REVIEW',{observations:doneWeek(t,w),check:S6NO()});
 for(const weeks of [4,6]){
  const i=HYBRID();i.asOf=addDays(t.day(5,6),weeks*7);i.startDate=addDays(i.asOf,1);i.athlete.eligibility=ELIG(i.asOf);
  const g=restartProgram({intake:i,record:t.ledger,referenceState:t.ref});
  assert.notEqual(g.status,'PROPOSED',`${weeks} weeks: the old declaration stood in for a stop it never answered`);
  assert.ok((g.missingInputs??[]).some(k=>/pause\.(reasonCategory|reason)/.test(k)),JSON.stringify(g.missingInputs));
 }
});

// ================= SB-2 (SEC-V1CPR-03, RC-01): clinical first, before an id conflict =================
test('SB-2: a warning sign under a reused event id routes to the clinical hold and writes its fact',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{eventId:'wr-G',observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
 const holds=()=>t.ledger.filter(o=>o.fact===F.CLINICAL_HOLD).length,h0=holds();
 const r=t.step(1,6,'WEEKLY_REVIEW',{eventId:'wr-G',observations:doneWeek(t,1),check:{warningSigns:{...NO('NEED_REST'),[W.W2]:true},exerciseResponse:XNO('NEED_REST'),improved:true}},'21:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.equal(holds(),h0+1,'the hold is on record');
 // A check that reuses the report's id, and a report that reuses a check's id, each with a sign yes.
 const u=timeline();reviewWeeks(u,0,1);
 u.step(1,1,'NOT_FEELING_100',{eventId:'rep-1',wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5}},'07:00');
 assert.equal(u.step(1,3,'WELLBEING_CHECK',{eventId:'rep-1',check:{warningSigns:{...NO('NEED_REST'),[W.W5]:true}}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
 const v=timeline();reviewWeeks(v,0,1);
 v.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5}},'07:00');
 v.step(1,3,'WELLBEING_CHECK',{eventId:'chk-1',check:{warningSigns:NO('NEED_REST')}},'07:00');
 // An identical replay is still a KEEP, and an all-no payload under a reused id is still asked.
 assert.equal(v.step(1,3,'WELLBEING_CHECK',{eventId:'chk-1',check:{warningSigns:NO('NEED_REST')}},'07:30').status,'KEEP');
 assert.equal(v.step(1,4,'NOT_FEELING_100',{eventId:'chk-1',wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5}},'07:00').status,'ASK');
 assert.equal(v.step(1,4,'NOT_FEELING_100',{eventId:'chk-1',wellbeing:{condition:'NEED_REST',warningSigns:{...NO('NEED_REST'),[W.W2]:true},intent:'REST',days:5}},'07:10').status,'CLINICAL_HUMAN_REQUIRED');
});

// ================= SB-3 (SEC-V1CPR-01, QRE-V1CPR-03): unreadable holds fail closed =================
test('SB-3: a restart never reads an unreadable, foreign or later hold as no hold',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 assert.equal(t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'08:00').status,'CLINICAL_HUMAN_REQUIRED');
 const intake=(x={})=>{const i=HYBRID();i.asOf=x.asOf??t.day(3,0);i.startDate=addDays(i.asOf,1);i.athlete.eligibility=ELIG(i.asOf);i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};if(x.id)i.athlete.id=x.id;return i;};
 assert.equal(restartProgram({intake:intake(),record:t.ledger}).status,'CLINICAL_HUMAN_REQUIRED');
 const altered=t.ledger.map(o=>o.fact===F.CLINICAL_HOLD?{...o,declaredAt:new Date(Date.parse(o.declaredAt)+1).toISOString()}:o);
 assert.notEqual(restartProgram({intake:intake(),record:altered}).status,'PROPOSED','an altered hold row');
 assert.notEqual(restartProgram({intake:intake({id:'someone-else'}),record:t.ledger}).status,'PROPOSED','an intake naming another athlete');
 assert.notEqual(restartProgram({intake:intake({asOf:t.day(0,6)}),record:t.ledger}).status,'PROPOSED','an intake dated before the hold');
 // A readiness with a restriction: the restriction is never lost through the intake's athlete id.
 t.step(2,1,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}})},'07:00');
 const g=restartProgram({intake:intake({id:'ath-v1cp-hybrid-2'}),record:t.ledger});
 if(g.status==='PROPOSED')assert.ok(g.program.weeks.flatMap(w=>w.sessions).filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).every(e=>e.region!=='LOWER'),'the lower-body restriction carries');
});

// ================= SB-4 (SEC-V1CPR-02): every clinical decision records its hold =================
test('SB-4: a clinical decision always leaves its CLINICAL_HOLD fact on record',()=>{
 const holds=t=>t.ledger.filter(o=>o.fact===F.CLINICAL_HOLD);
 // (a) a non-string event id is refused before anything is decided.
 const a=timeline();reviewWeeks(a,0,1);
 const ra=evaluateProgram(a.p,{...a.review(1,1,'WEEKLY_REVIEW',{eligibility:ELIG(a.day(1,1),{illness:true})}),event:{id:4242,kind:'WEEKLY_REVIEW'}});
 assert.equal(ra.status,'HOLD',ra.reason);
 // (b) a planted hold row of another athlete with this review's id never suppresses this athlete's hold.
 const b=timeline();reviewWeeks(b,0,1);
 b.ledger=[...b.ledger,F.sealed({fact:F.CLINICAL_HOLD,eventId:'ff-planted',athleteId:'someone-else',declaredAt:'2026-11-10T10:00:00Z',eventKind:null,provenance:{firstRecordedAt:'2026-11-10T10:00:00Z'}})];
 const rb=b.step(1,1,'WEEKLY_REVIEW',{eventId:'ff-planted',eligibility:ELIG(b.day(1,1),{illness:true})});
 assert.notEqual(rb.status,'PROPOSED');assert.ok(holds(b).some(o=>o.athleteId===b.p.athleteId),'this athlete\'s hold is written');
 // (c) an event id reused after a released hold writes the new hold.
 const c=timeline();reviewWeeks(c,0,1);
 c.step(1,1,'WEEKLY_REVIEW',{eventId:'ff-reused',eligibility:ELIG(c.day(1,1),{illness:true})});
 c.step(1,3,'READINESS_DECLARATION',{readiness:READY()},'07:00');
 const n=holds(c).length;c.step(2,1,'WEEKLY_REVIEW',{eventId:'ff-reused',eligibility:ELIG(c.day(2,1),{illness:true})});
 assert.equal(holds(c).length,n+1,'a new hold under a reused id is recorded');
 // (d) a stale clinical reference after a release: the record shows the new sign's hold.
 const d=timeline();reviewWeeks(d,0,1);
 d.step(1,1,'WEEKLY_REVIEW',{eligibility:ELIG(d.day(1,1),{illness:true})});const stale=d.ref;
 d.step(1,3,'READINESS_DECLARATION',{readiness:READY()},'07:00');d.ref=stale;
 const m=holds(d).length,rd=d.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:{...NO('NEED_REST'),[W.W2]:true},intent:'REST',days:3}},'07:00');
 assert.equal(rd.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(holds(d).length,m+1,'the hold this decision opens is on record');
});

// ================= SB-5 (SEC-V1CPR-04): the default restart =================
test('SB-5: a restart with no stated pause asks the reason; it never throws',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 for(const days of [1,3,10,45]){
  const i=HYBRID();i.asOf=addDays(t.day(0,6),days);i.startDate=addDays(i.asOf,1);i.athlete.eligibility=ELIG(i.asOf);delete i.athlete.pause;
  let g;assert.doesNotThrow(()=>{g=restartProgram({intake:i,record:t.ledger});},`${days} days`);
  if(days>=7)assert.ok((g.missingInputs??[]).some(k=>/pause\.reasonCategory/.test(k)),`${days} days: ${g.status} ${JSON.stringify(g.missingInputs)}`);
  else assert.ok(['PROPOSED','ASK'].includes(g.status),`${days} days: ${g.status}`);
 }
});

// ================= QRE-V1CPR-02: S6 checks are read =================
test('QRE-V1CPR-02: an answered restart check is not asked again, and a replay adds no row',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00');
 const d=t.step(3,0,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${t.day(3,0)}T11:30:00Z`)},'09:00');assert.ok(['READINESS_RESTART','REESTABLISH'].includes(d.action),d.reason);
 const tue=t.p.weeks[3].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date===t.day(3,1));assert.ok(tue,'a Tuesday run in the restart week');
 const adv=doneWeek(t,3,{adverse:[tue.id]}).filter(o=>o.sessionId===tue.id);
 assert.equal(t.step(3,3,'WEEKLY_REVIEW',{observations:adv},'08:00').status,'ASK');
 assert.notEqual(t.step(3,3,'WEEKLY_REVIEW',{observations:adv,check:S6NO()},'09:00').status,'ASK');
 const fri=t.step(3,4,'MISSED_SESSION',{},'08:00');assert.ok(!(fri.missingInputs??[]).includes('wellbeingCheck'),'the answered check is not asked again: '+fri.reason);
 const obs=doneWeek(t,3),chk=S6NO();t.step(3,6,'WEEKLY_REVIEW',{eventId:'wr-s6',observations:obs,check:chk});
 const n=t.ledger.filter(o=>o.fact===F.WELLBEING_CHECKED).length;
 t.step(3,6,'WEEKLY_REVIEW',{eventId:'wr-s6',observations:obs,check:chk});
 assert.equal(t.ledger.filter(o=>o.fact===F.WELLBEING_CHECKED).length,n,'a replay adds no row');
});
