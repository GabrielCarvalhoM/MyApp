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
 // Mutation analysis (MF-D3-post survived the line above): the post-race start is the plan's own (shorter easy runs), never the held one.
 assert.ok(t.p.stateTrace[rw+1].run.easy<m.fixed.RUN.easy,`post-race easy ${t.p.stateTrace[rw+1].run.easy} vs held ${m.fixed.RUN.easy}`);
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

// ================= SSCTR-V1CPFF-DECISION-r1: the Founder's D1, D2, D4-D6 as ruled (FF-Q1, -Q3, -N1, -Q6, -Q9, -Q8, -Q4) =================
const {screenInterruptionReason,reasonQuestion}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-clinical.mjs')).href);
/** A REDUCE_LIGHT window of 10 days from week 1's Monday (week 1 whole inside it), its week-1 review, and the window-end check at week 2's review. */
function lightTen(speed,{skip=false,noCheck=false,adverse=false}={}){
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:10,returnSpeed:speed}},'07:00');
 const w1=doneWeek(t,1),skipped=skip?[w1.find(o=>t.p.weeks[1].sessions.some(s=>s.id===o.sessionId&&s.sport==='RUN')).sessionId]:[];
 if(!noCheck)t.step(1,6,'WEEKLY_REVIEW',{observations:w1.filter(o=>!skipped.includes(o.sessionId)),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
 const run2=t.p.weeks[2].sessions.find(s=>s.sport==='RUN'&&live(s)&&s.date<=t.day(2,2));
 const obs=[...(noCheck?w1:[]),...doneWeek(t,2,{adverse:adverse&&run2?[run2.id]:[]})];
 const end=t.step(2,6,'WEEKLY_REVIEW',{observations:obs,check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
 return {t,end};
}
test('FF-Q1 (D1, D2): FASTER after an easier window resumes the held doses at once only after a whole executed and checked week inside it',()=>{
 const a=lightTen('FASTER');assert.notEqual(a.end.status,'ASK',a.end.reason);
 assert.equal(ladder(a.t.p,3)?.RUN,'R4','a whole executed and checked R3 week inside the window: R4');assert.equal(ladder(a.t.p,4)?.RUN,undefined,'then the plan moves on');
 const b=lightTen('FASTER',{skip:true});assert.deepEqual([3,4].map(w=>ladder(b.t.p,w)?.RUN),['R3','R4'],'one session unreported: R3, R4 (no regression, no debt)');
 const c=lightTen('FASTER',{noCheck:true});assert.deepEqual([3,4].map(w=>ladder(c.t.p,w)?.RUN),['R3','R4'],'the week was never checked: R3, R4');
 const d=lightTen('BALANCED');assert.deepEqual([3,4].map(w=>ladder(d.t.p,w)?.RUN),['R3','R4'],'BALANCED is unchanged');
});
test('FF-Q1 (C-FF1-1): with no whole week inside an easier window FASTER equals BALANCED and says so; a missed session repeats the rung once at each speed',()=>{
 const run=(speed,skip)=>{const t=timeline();reviewWeeks(t,0,1);
  t.step(1,2,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:5,returnSpeed:speed}},'07:00');
  const o=doneWeek(t,1),miss=skip?o.filter(x=>t.p.weeks[1].sessions.some(s=>s.id===x.sessionId&&s.sport==='RUN'&&s.date>=t.day(1,2))).map(x=>x.sessionId).slice(0,1):[];
  const r=t.step(1,6,'WEEKLY_REVIEW',{observations:o.filter(x=>!miss.includes(x.sessionId)),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
  return {r,got:[2,3,4,5,6].map(w=>ladder(t.p,w)?.RUN).filter(Boolean)};};
 const f=run('FASTER',false);assert.deepEqual(f.got,['R3','R4']);assert.match(f.r.reason,/one easier week first at both/);assert.doesNotMatch(f.r.reason,/skipped/);
 assert.deepEqual(run('FASTER',true).got,['R3','R4'],'FASTER: R3 is the repeat, never R3, R3, R4');
 assert.deepEqual(run('BALANCED',true).got,['R3','R3','R4']);assert.deepEqual(run('CONSERVATIVE',true).got,['R3','R3','R4','R4']);
});
test('FF-Q3 (D4): the weekly review ends the window with its plan week (the return starts next week, whole); an early warning sign or clinical flag routes clinical',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[],check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:true}});
 assert.notEqual(r.status,'ASK',r.reason);assert.equal(ladder(t.p,1),null,'the window held the rest of the reviewed week');assert.equal(ladder(t.p,2)?.RUN,'R2','the return starts next week, as a whole week');
 const u=timeline();reviewWeeks(u,0,1);u.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 assert.equal(u.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},improved:true}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
 const v=timeline();reviewWeeks(v,0,1);v.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 const flag=v.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),improved:true},eligibility:ELIG(v.day(1,3),{persistentPain:true})},'07:00');assert.equal(flag.status,'CLINICAL_HUMAN_REQUIRED','a current clinical flag routes clinical');
 assert.deepEqual(flag.guidance,{level:'PROFESSIONAL_ASSESSMENT',wordingStatus:'INTERIM_PENDING_G04'},'a route no warning sign caused carries the professional assessment (D5)');
});
test('FF-Q3 (C-Q05-5 precised): an easier window with no planned session of a sport follows its row; one whose planned runs were all missed reads as rest',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 const day=[0,1,2,3,4,5].find(d=>!t.p.weeks[1].sessions.some(s=>s.sport==='STRENGTH'&&live(s)&&s.date===t.day(1,d))&&t.p.weeks[1].sessions.some(s=>s.sport==='RUN'&&live(s)&&s.date===t.day(1,d)));
 if(day!==undefined){
  t.step(1,day,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:3}},'06:00');
  const runs=doneWeek(t,1).filter(o=>t.p.weeks[1].sessions.some(s=>s.id===o.sessionId&&s.sport==='RUN'&&s.date===t.day(1,day)));
  const c=t.step(1,day+1,'WELLBEING_CHECK',{observations:runs,check:{warningSigns:NO('NEED_REST'),...(runs.length?{exerciseResponse:XNO('NEED_REST')}:{}),improved:true}},'07:00');
  assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);const plans=t.p.decisions.at(-1).wellbeing.plans;
  if(!t.p.weeks[1].sessions.some(s=>s.sport==='STRENGTH'&&s.prescription&&s.date===t.day(1,day)))assert.equal(plans.STRENGTH.row,'REDUCE_LIGHT','no strength session in the window: its row as chosen');
 }
 const u=timeline();reviewWeeks(u,0,1);
 u.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',sports:['RUN'],warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 const c=u.step(1,5,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'07:00');assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 const p=u.p.decisions.at(-1).wellbeing.plans.RUN;if(u.p.weeks[1].sessions.some(s=>s.sport==='RUN'&&s.prescription&&s.date<=u.day(1,4)))assert.equal(p.read,'READ_AS_REST','its planned runs were all missed: rest');
});
test('FF-N1: days waited for the check are days without training: up to 10 the short rows, 11 to 28 the MODERATE recipe, beyond that the LONG restart',()=>{
 const wait=(intent,days,checkW,checkD,speed='FASTER')=>{const t=timeline();reviewWeeks(t,0,1);
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent,days,returnSpeed:speed}},'07:00');
  // The window's sessions done as planned, so only the waited days decide the row (C-Q05-5 reads a missed window as rest).
  const done=doneWeek(t,1).filter(o=>t.p.weeks[1].sessions.some(s=>s.id===o.sessionId&&s.date<=t.day(1,days-1)));
  const c=t.step(checkW,checkD,'WELLBEING_CHECK',{observations:done,check:{warningSigns:NO('NEED_REST'),...(done.length?{exerciseResponse:XNO('NEED_REST')}:{}),improved:true}},'07:00');assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
  return {t,plan:t.p.decisions.at(-1).wellbeing.plans.RUN};};
 assert.equal(wait('REST',3,2,4).plan.recipe,'MODERATE','REST 3 days and 9 waited (12 days): the MODERATE recipe');
 assert.deepEqual(wait('REST',3,1,3).plan.rungs,['R3','R4'],'a check the day after the window: unchanged');
 assert.equal(wait('REDUCE_LIGHT',3,2,1).plan.row,'REDUCE_LIGHT','REDUCE_LIGHT 3 days and 5 waited: its row');
 assert.equal(wait('REDUCE_LIGHT',3,3,1).plan.recipe,'MODERATE','REDUCE_LIGHT 3 days and 12 waited: the MODERATE recipe');
 for(const speed of ['FASTER','BALANCED','CONSERVATIVE']){const x=wait('REST',5,5,6,speed);assert.equal(x.plan.recipe,'LONG',speed+': REST 5 days and 30 waited: the LONG class');assert.equal(x.t.p.stateTrace[5].run.mode==='RESTART'||x.t.p.stateTrace[6]?.run?.mode==='RESTART',true,speed+': a restart from current capacity');}
});
test('FF-Q6: the 14 days per sport: none left is persistence at the strictest route; else the days are 1 to the smallest allowance, never 0',()=>{
 const ten=c=>{const t=timeline();reviewWeeks(t,0,1);t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:'REST',days:10}},'07:00');return t;};
 const a=ten('NEED_REST'),r=a.step(3,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3}},'07:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.match(r.reason,/professional assessment/);assert.equal(a.ledger.filter(o=>o.fact===F.WELLBEING_DECLARED).at(-1).wellbeing.persistence,'FOURTEEN_DAYS');
 const b=ten('NEED_REST'),s=b.step(3,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');assert.equal(s.status,'ASK');assert.deepEqual(s.missingInputs,['interruption|restart']);
 const c=ten('MILD_ILLNESS'),q=c.step(2,4,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:5}},'07:00');
 assert.equal(q.status,'ASK');assert.match(q.reason,/choose 1 to 3 days/);
 const ok=c.step(2,4,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3}},'07:30');assert.equal(ok.action,'WELLBEING_REDUCTION',ok.reason);
 const d=ten('MILD_ILLNESS'),one=d.step(2,6,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3}},'07:00');assert.match(one.reason,/choose 1 day/);
 const e=timeline();reviewWeeks(e,0,1);e.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:10}},'07:00');
 const two=e.step(2,5,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:5}},'07:00');assert.match(two.reason,/choose 1 to 2 days/,'running has 2 days left, strength no chain');
 for(const x of [...a.results,...b.results,...c.results,...d.results,...e.results])assert.doesNotMatch(x.reason??'',/at most 0 days|choose 0/);
});
test('FF-Q9 (D5): the guidance level comes only from the items answered yes: urgent care for W2-W5 and X1, a professional assessment otherwise; an unanswered item has none',()=>{
 const wb=c=>({condition:c,warningSigns:NO(c),intent:'REST',days:5}),urgent=F.URGENT_SIGNS;
 for(const k of F.signsFor('MILD_ILLNESS')){const r=timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MILD_ILLNESS'),warningSigns:{...NO('MILD_ILLNESS'),[k]:true}}});
  assert.deepEqual(r.guidance,{level:urgent.includes(k)?'URGENT_CARE_ADVISED':'PROFESSIONAL_ASSESSMENT',wordingStatus:'INTERIM_PENDING_G04'},k);if(!urgent.includes(k))assert.doesNotMatch(r.reason,/emergency/i,k);}
 const both=timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MINOR_DISCOMFORT'),warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true,[W.W2]:true}}});assert.equal(both.guidance.level,'URGENT_CARE_ADVISED','the higher level of several');
 const t=timeline();reviewWeeks(t,0,1);t.step(1,1,'NOT_FEELING_100',{wellbeing:wb('MINOR_DISCOMFORT')},'07:00');
 for(const k of Object.values(F.EXERCISE_SIGNS)){const r=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:{...XNO('MILD_ILLNESS'),[k]:true},improved:true}},'07:00');if(r.status!=='CLINICAL_HUMAN_REQUIRED')continue;assert.equal(r.guidance.level,urgent.includes(k)?'URGENT_CARE_ADVISED':'PROFESSIONAL_ASSESSMENT',k);break;}
 const s6=timeline();reviewWeeks(s6,0,1);s6.step(2,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:s6.day(1,1),endDate:s6.day(1,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00');
 const decl=s6.step(2,1,'READINESS_DECLARATION',{readiness:{...READY(),warningSigns:{...RNO(),[W.W3]:true}}},'07:00');assert.equal(decl.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(decl.guidance.level,'URGENT_CARE_ADVISED','Situation 2 uses the same mapping');
 const ask=timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MINOR_DISCOMFORT'),warningSigns:(({[W.W2]:_,...x})=>x)(NO('MINOR_DISCOMFORT'))}});assert.equal(ask.status,'ASK');assert.equal(ask.guidance,undefined,'an unanswered item is asked, with no level');
});
test('FF-Q8 (lexicon V1CP-A1-LEX-3): the 43 directed texts, with and without the answer no',()=>{
 const CASES=[["my wife had covid, and me too","CLINICAL"],["my wife had covid, I also did","CLINICAL"],["my wife had covid, I had it too","CLINICAL"],["my wife had covid, then I got it","CLINICAL"],["my wife had covid, same for me","CLINICAL"],["my wife had covid, us too","CLINICAL"],["my wife had covid, both of us actually","CLINICAL"],["my wife had covid; same","ASK_EVEN_WITH_NO"],["my wife had covid, not me","THIRD_PARTY"],["my son had the flu, I didn't get it","THIRD_PARTY"],["my mother had surgery, I took care of her","THIRD_PARTY"],["my mother had covid. I did too","CLINICAL"],["my mother had covid; me too","CLINICAL"],["my mother had covid and so did I","CLINICAL"],["visiting my dad in hospital","THIRD_PARTY"],["my dog bit me (OTHER_NONCLINICAL)","CLINICAL"],["I got bit by a dog (TRAVEL)","CLINICAL"],["the dog bit my son","THIRD_PARTY"],["work was a bit crazy (WORK)","NONCLINICAL"],["tore my acl skiing (TRAVEL)","CLINICAL"],["I tore my jeans on the trip (TRAVEL)","NONCLINICAL"],["my friend tore her acl","THIRD_PARTY"],["minha esposa teve covid, eu tbm","CLINICAL"],["minha esposa teve covid, eu também tive","CLINICAL"],["minha esposa teve covid, e eu também","CLINICAL"],["minha mãe teve covid, tive também","CLINICAL"],["minha mãe teve gripe, ela me passou","CLINICAL"],["minha mãe operou e eu também","CLINICAL"],["minha mãe operou, cuidei dela","THIRD_PARTY"],["minha mãe teve covid, eu não","THIRD_PARTY"],["minha mãe teve covid; tbm","ASK_EVEN_WITH_NO"],["o cachorro me mordeu (OTHER_NONCLINICAL)","CLINICAL"],["rompi o lca jogando futebol (TRAVEL)","CLINICAL"],["meu filho teve covid, nós também","CLINICAL"],["mi esposa tuvo covid, y yo también","CLINICAL"],["mi mamá tuvo covid, también la tuve","CLINICAL"],["mi hijo tuvo gripe, me la pegó","CLINICAL"],["mi mamá tuvo covid, yo no","THIRD_PARTY"],["mi mamá tuvo covid, yo tmb","CLINICAL"],["tuve una cirugía (TRAVEL)","CLINICAL"],["mi perro me mordió (OTHER_NONCLINICAL)","CLINICAL"],["me rompí el menisco (TRAVEL)","CLINICAL"],["mi mamá tuvo una cirugía, la cuidé","THIRD_PARTY"]];
 const WANT={CLINICAL:['CLINICAL','CLINICAL'],THIRD_PARTY:['ASK','NONCLINICAL'],ASK_EVEN_WITH_NO:['ASK','ASK'],NONCLINICAL:['NONCLINICAL','NONCLINICAL']};
 for(const [s,k] of CASES){const m=s.match(/^(.*) \(([A-Z_]+)\)$/),reason=m?m[1]:s,reasonCategory=m?m[2]:'FAMILY';
  const got=[screenInterruptionReason({reason,reasonCategory,nonclinical:true}).status,screenInterruptionReason({reason,reasonCategory,nonclinical:true,clinicalReason:false}).status];assert.deepEqual(got,WANT[k],`${k}: ${s}`);}
 const u=screenInterruptionReason({reason:'my wife had covid; same',reasonCategory:'FAMILY',nonclinical:true,clinicalReason:false});assert.equal(u.basis,'SELF_INCLUSION_UNCERTAIN');
 const q=reasonQuestion(u,{reasonCategory:'FAMILY'});assert.deepEqual(q.missingInputs,['interruption.reason','interruption.clinicalReason']);assert.match(q.text,/may say you had it too/);
});
test('FF-Q4 (D6): the Demanding coach prescribes what the Balanced coach prescribes, on generation and on the F08 paths; it says so',()=>{
 const run=profile=>{const t=timeline(HYBRID({profile}));reviewWeeks(t,0,1);
  t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
  t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
  return t;};
 const b=run('BALANCED'),d=run('DEMANDING'),rx=t=>JSON.stringify(t.p.weeks.map(w=>w.sessions.map(s=>[s.id,s.role,s.prescription])));
 assert.equal(rx(d),rx(b),'the same sessions and doses');
 assert.match(d.p.negotiation.find(n=>n.id==='COACH_DEMANDING')?.detail??'',/same as the balanced coach/,'the disclosure says the doses and limits are the balanced coach\'s');
});

// ================= The single narrow fix cycle after the review round (SSCTR_FF_RECHECK, SEC_FF_RECHECK), each test red on 4630bca =================
test('Cycle SSCTR-FFR-01: a check outside the weekly review never makes an unexecuted ladder week done: its rung repeats',()=>{
 for(const [speed,intent,want] of [['FASTER','REST','R3'],['BALANCED','REDUCE_SUBSTANTIAL','R2']]){
  const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
  t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent,days:5,returnSpeed:speed}},'07:00');
  assert.equal(t.step(1,6,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'09:00').action,'WELLBEING_RETURN_START');
  const step2=ladder(t.p,2)?.RUN;assert.equal(step2,want,speed+': the first whole week of the return');
  assert.equal(t.step(2,5,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST')}},'09:00').status,'KEEP','an off-review check with every sign no');
  const r=t.step(3,0,'WEEKLY_REVIEW',{observations:[],check:{warningSigns:NO('NEED_REST')}},'07:00');assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);
  assert.equal(ladder(t.p,3)?.RUN,want,`${speed}: week 2 was not executed, so its rung (${want}) repeats in week 3, never the next step`);
 }
});
test('Cycle SSCTR-FFR-02: return days with no executed session between two rest windows of a chain are days without training',()=>{
 const run=(speed,{executed=false,waitDays=0}={})=>{const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7,returnSpeed:speed}},'07:00');
  assert.equal(t.step(2,0,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'06:00').action,'WELLBEING_RETURN_START');
  const obs=executed?doneWeek(t,2).filter(o=>t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.date<=t.day(2,1))):[];
  const r=t.step(2,3,'NOT_FEELING_100',{observations:obs,wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:4,returnSpeed:speed}},'07:00');assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);
  const c=t.step(3+Math.floor(waitDays/7),waitDays%7,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'07:00');assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
  return t.p.decisions.at(-1).wellbeing.plans;};
 for(const speed of ['FASTER','BALANCED','CONSERVATIVE']){const p=run(speed);assert.equal(p.RUN.recipe,'MODERATE',speed+': 14 days without training: '+JSON.stringify(p.RUN));assert.equal(p.STRENGTH.recipe,'MODERATE',speed+' strength');}
 assert.equal(run('FASTER',{waitDays:6}).RUN.recipe,'MODERATE','20 days with the wait');
 assert.deepEqual(run('FASTER',{executed:true}).RUN.rungs,['R3','R4'],'the return trained: the last window alone, unchanged');
});
test('Cycle SSCTR-FFR-06: after a single declared break read per sport (NB-3), later reports and reviews are decided, never asked to confirm the break again',()=>{
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,4);
 t.step(4,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:7}},'07:00');
 const b=t.step(6,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(5,0),endDate:t.day(5,6),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');assert.equal(b.action,'REESTABLISH',b.reason);
 const stale=r=>(r.missingInputs??[]).includes('interruption.episodeId')||/confirm that interruption again/.test(r.reason??'');
 for(const r of [t.step(6,1,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST')}},'07:00'),t.step(6,2,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REDUCE_SUBSTANTIAL',days:3}},'07:00'),t.step(6,6,'WEEKLY_REVIEW',{observations:doneWeek(t,6)},'20:00')])assert.ok(!stale(r),`${r.status}: ${r.reason}`);
});
test('Cycle SEC-FFR-01: a key of the improvement answer that is not an open condition is never echoed back',()=>{
 const t=timeline();reviewWeeks(t,0,1);t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}},'07:00');
 const canary='CANARY-'+'x'.repeat(2000),r=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:{[canary]:true}}},'07:00');
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['wellbeingCheck.improved.unrecognized']);
 assert.ok(!JSON.stringify(r).includes('CANARY'),'not in the decision or its reference state');assert.ok(!JSON.stringify(t.ledger).includes('CANARY'),'not in the record');
});
test('Cycle SEC-FFR-02 (D5): a sign answered yes while a clinical dependency stands sets the guidance level and the wording',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 assert.equal(t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'08:00').status,'CLINICAL_HUMAN_REQUIRED');
 const r=t.step(1,3,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[W.W2]:true},intent:'REST',days:5}},'08:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.guidance?.level,'URGENT_CARE_ADVISED');assert.match(r.reason,/urgent medical care/);
 const q=t.step(1,4,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[W.W7]:true},intent:'REST',days:5}},'08:00');
 assert.equal(q.guidance?.level,'PROFESSIONAL_ASSESSMENT');assert.doesNotMatch(q.reason,/emergency/i);
});

test('Cycle QRE-FF-01: a ladder week behind a readiness restart never re-opens its episode or lays a ladder over the restart',()=>{
 const build=()=>{const t=timeline();reviewWeeks(t,0,1);
  t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
  t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
  t.step(2,5,'MISSED_SESSION',{observations:doneWeek(t,2).filter(o=>t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.date<=t.day(2,5)))},'20:00');
  assert.equal(t.step(3,0,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:3}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
  const d=t.step(3,2,'READINESS_DECLARATION',{readiness:READY()},'09:00');assert.ok(['READINESS_RESTART','REESTABLISH'].includes(d.action),d.reason);return t;};
 const s1Ladder=(t,w,from)=>(t.p.weeks[w]?.adaptations??[]).some(x=>x.kind==='WELLBEING_REDUCTION'&&x.phase==='LADDER'&&!x.endedBy&&(!from||x.startDate>=from));
 const a=build(),g=a.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(a,3).filter(o=>a.p.weeks[3].sessions.some(s=>s.id===o.sessionId&&s.date>a.day(3,2))),check:S6NO()},'20:00');
 assert.doesNotMatch(g.reason??'',/had no review with your check/,g.reason);assert.ok(!s1Ladder(a,4),'no Situation 1 ladder over the restart');
 const b=build();b.step(3,3,'MISSED_SESSION',{observations:[]},'20:00');assert.ok(!s1Ladder(b,3,b.day(3,3))&&!s1Ladder(b,4),'the day after the restart nothing re-opens the episode');
});
test('Cycle QRE-FF-02 (a): a race in a recipe step that the hold extension adds is the athlete\'s own event, never at race effort',()=>{
 const t=timeline(RACE(HYBRID(),'2026-12-19'));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:12,returnSpeed:'CONSERVATIVE'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST')}});
 const e=t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2),check:{warningSigns:NO('NEED_REST'),improved:true}});assert.notEqual(e.status,'ASK',e.reason);
 const race=raceRow(t);assert.equal(race.weekIndex,5);assert.equal(ladder(t.p,5)?.RUN,'M','week 5 holds a recipe step');
 assert.equal(race.ownEvent,true,'the athlete\'s own event');assert.ok(race.prescription===null||race.prescription.family==='EASY','never at race effort: '+JSON.stringify(race.prescription?.family));
 assert.ok(!(t.p.negotiation??[]).some(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING'),'no completion item');
});
test('Cycle QRE-FF-02 (b): after a race moved into the return, the D49 week after it plans at most one set over the last count',()=>{
 const t=timeline(KNOWN(6,RACE(HYBRID(),'2026-12-26')));reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:4,returnSpeed:'CONSERVATIVE'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MINOR_DISCOMFORT'),exerciseResponse:XNO('MINOR_DISCOMFORT'),improved:true}});
 const c=t.step(2,2,'EVENT_DATE_CHANGE',{changes:{eventDate:'2026-12-05'}},'07:00');assert.notEqual(c.status,'ASK',c.reason);
 const id='db-bench-press',last=Math.max(setsOf(t.p,3,id),setsOf(t.p,4,id)),w5=setsOf(t.p,5,id);
 assert.ok(w5<=last+1,`week 5 plans ${w5} sets after ${last} (D49)`);
});
test('Cycle QRE-V1CPR-05 (a), CF-OBS-2: a date change that moves the race into a return week makes it the athlete\'s own event, with no question',()=>{
 const t=timeline(RACE(HYBRID(),RACE_DAY));reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}});
 assert.deepEqual([2,3,4].map(w=>ladder(t.p,w)?.RUN),['R2','R3','R4']);
 const c=t.step(2,1,'EVENT_DATE_CHANGE',{changes:{eventDate:'2026-12-05'}},'07:00');assert.notEqual(c.status,'ASK',c.reason);
 const race=raceRow(t);assert.equal(race.date,'2026-12-05');assert.equal(race.ownEvent,true);assert.equal(race.coachRecommendation,'EASY_RUN','an R3 week: an easy run');assert.ok(raceOffer(c),'its paths offered once');
});
test('Cycle QRE-V1CPR-06 residual (M12, known rows): a readiness restart week starts from the restart\'s own state, never a projected execution date',()=>{
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,2);
 t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}},'07:00');
 const d=t.step(3,0,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(`${t.day(3,0)}T11:30:00Z`)},'09:00');assert.ok(['READINESS_RESTART','REESTABLISH'].includes(d.action),d.reason);
 const from=t.p.decisions.at(-1).fromWeek,ids=new Set(t.p.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='STRENGTH').map(s=>s.id)),lastDone=t.ledger.filter(o=>ids.has(o.sessionId)&&o.actual?.completed).map(o=>o.occurrenceDate).sort().at(-1);
 for(let w=from;w<Math.min(from+2,t.p.weeks.length);w++)for(const [id,e] of Object.entries(t.p.stateTrace[w].strength.exercises??{}))if(e.lastPerformed&&w===from)assert.ok(e.lastPerformed<=lastDone,`${id} week ${w} lastPerformed ${e.lastPerformed} after the last executed strength session ${lastDone}`);
});
test('Cycle FF-Q1 DT4: an adverse session in the window\'s trailing days removes FASTER\'s shortcut',()=>{
 const e=lightTen('FASTER',{adverse:true});assert.notEqual(e.end.status,'ASK',e.end.reason);assert.deepEqual([3,4].map(w=>ladder(e.t.p,w)?.RUN),['R3','R4']);
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
// Mutation analysis of the fix-forward (MF-NB4-stack, MF-NB6-d49, MF-SB3-program survived the first run): the three directed tests below close them.
test('NB-4 (SSCTR-V1CPR-04): a second review of the same ladder week adds no second repeat',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}});
 assert.deepEqual([2,3,4].map(w=>ladder(t.p,w)?.RUN),['R2','R3','R4']);
 const run=t.p.weeks[2].sessions.find(s=>s.sport==='RUN'&&live(s)).id,obs=doneWeek(t,2,{skip:[run]}),check={warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')};
 t.step(2,6,'WEEKLY_REVIEW',{observations:obs,check},'20:00');
 const once=[3,4,5].map(w=>ladder(t.p,w)?.RUN);assert.deepEqual(once,['R2','R3','R4'],'the R2 week not done repeats once');
 t.step(2,6,'WEEKLY_REVIEW',{observations:obs,check},'21:00');
 assert.deepEqual([3,4,5].map(w=>ladder(t.p,w)?.RUN),once,'a second review of the same week adds nothing');
});
test('NB-6 (SSCTR-V1CPR-03): past the ladder, the D49 hold reads the sets the last R4 week executed, never the plan, from the first week placed',()=>{
 for(const n of [3,4,6]){
 const t=timeline(KNOWN(n,HYBRID()));reviewWeeks(t,0,1);const ck=x=>({warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),...x});
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:3}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:ck({improved:true})});
 for(let w=2;w<4;w++)t.step(w,6,'WEEKLY_REVIEW',{observations:doneWeek(t,w),check:ck()});
 assert.equal(ladder(t.p,4)?.STRENGTH,'R4');const id='db-bench-press',r4=setsOf(t.p,4,id);assert.ok(r4>=2,'R4 plans '+r4);
 const obs=doneWeek(t,4).map(o=>o.actual.exercises?{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.slice(0,1)}))}}:o);
 t.step(4,6,'WEEKLY_REVIEW',{observations:obs,check:ck()});
 const next=setsOf(t.p,5,id);assert.ok(next<=2,`known ${n}: week 5 plans ${next} sets of ${id} after one executed (R4 planned ${r4})`);
 }
});
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
test('SB-3 (SEC-V1CPR-01): a decision never reads an altered recovery row as absent: it holds',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 assert.equal(t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:{...NO('MINOR_DISCOMFORT'),[W.W7]:true},intent:'REST',days:5}},'08:00').status,'CLINICAL_HUMAN_REQUIRED');
 const altered=t.ledger.map(o=>o.fact===F.CLINICAL_HOLD?{...o,declaredAt:new Date(Date.parse(o.declaredAt)+1).toISOString()}:o);
 const r=evaluateProgram(t.p,{...t.review(1,6,'WEEKLY_REVIEW',{noLedger:true,noRef:true}),actualLedger:altered});
 assert.equal(r.status,'HOLD',r.reason);assert.deepEqual(r.errors,['record.f08Unreadable']);assert.equal(r.proposal,null);
});
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
