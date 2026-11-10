// V1 Coaching Integration Boundary (V1CIB, Founder request of 2026-11-09): directed tests of the three runtime blockers the V1CP Fix-Forward recheck
// named, written RED on 0950b0a first, from the judges' own scenarios (SSCTR_FF_RECHECK_CYCLE SSCTR-FFC-01, -02; QRE_FF_RECHECK_CYCLE QRE-FFC-01).
// The shared cause: exposure is read from executed history (days without training, sets executed), never from the markers of the latest report only.
// The oracle beside the plan's structure is the Founder's criterion: adding days without training never makes the plan more aggressive (doses compared
// week by week with the same facts without the later report).
import test from 'node:test';
import assert from 'node:assert/strict';
import {timeline,HYBRID,KNOWN,NO,XNO,ALLNO,doneWeek,reviewWeeks,ladder,setsOf,plans,weekDose,live} from './v1cib-helpers.mjs';

const sum=a=>a.reduce((x,y)=>x+y,0);
/** Weeks from `from` where program a prescribes more of `sport` than program b (weekly total). */
const aboveWeeks=(a,b,sport,from)=>{const out=[];for(let k=from;k<a.weeks.length;k++){const x=sum(weekDose(a,k,sport)),y=sum(weekDose(b,k,sport));if(x>y)out.push(`week ${k}: ${weekDose(a,k,sport).join('/')} > ${weekDose(b,k,sport).join('/')}`);}return out;};
const HOLDS={FASTER:'NONE',BALANCED:'FIRST',CONSERVATIVE:'EACH'};
const SPEEDS=['FASTER','BALANCED','CONSERVATIVE'];

// ================= SSCTR-FFC-01: an unexecuted REDUCE window chained with a REST report keeps its days =================
/** The SSCTR's scenario: REDUCE_SUBSTANTIAL 12 days from week-1 Monday, nothing executed, week 1 reviewed with its check; optionally a REST report on
 * week-2 Thursday (3 days); the check on week-3 Monday, every open condition improved. `sports` limits both reports to one sport (a local condition). */
function q05(speed,{chained,sports=null,executeReduce=false,partly=false}){
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 const c1=sports?'MINOR_DISCOMFORT':'NEED_REST',c2=sports?'MINOR_DISCOMFORT':'UNUSUAL_FATIGUE';
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:c1,...(sports?{sports}:{}),warningSigns:NO(c1),intent:'REDUCE_SUBSTANTIAL',days:12,returnSpeed:speed}},'07:00');
 const first=new Set(['RUN','STRENGTH'].map(sp=>t.p.weeks[1].sessions.find(x=>x.sport===sp&&live(x)&&!x.optional)?.id));
 const obs1=executeReduce?doneWeek(t,1).filter(o=>!partly||first.has(o.sessionId)):[];
 t.step(1,6,'WEEKLY_REVIEW',{observations:obs1,check:{warningSigns:NO(c1),exerciseResponse:XNO(c1)}},'20:00');
 if(chained){
  const obs2=executeReduce&&!partly?doneWeek(t,2,{before:t.day(2,3)}):[];
  const r=t.step(2,3,'NOT_FEELING_100',{observations:obs2,wellbeing:{condition:c2,...(sports?{sports}:{}),warningSigns:NO(c2),intent:'REST',days:3,returnSpeed:speed}},'07:00');
  if(sports&&r.status==='KEEP')return {t,skipped:true};
 }
 const signs=chained&&c2!==c1?{...NO(c1),...NO(c2)}:NO(c1),imp=chained&&c2!==c1?{[c1]:true,[c2]:true}:true;
 const c=t.step(3,0,'WELLBEING_CHECK',{check:{warningSigns:signs,improved:imp}},'07:00');
 return {t,c};
}
for(const speed of SPEEDS){
 test(`SSCTR-FFC-01 (${speed}): REDUCE 12 none executed + REST 3 reads 14 days without training: the MODERATE recipe with the speed's holds, never above the REDUCE report alone`,()=>{
  const alone=q05(speed,{chained:false}),chain=q05(speed,{chained:true});
  assert.equal(chain.c.action,'WELLBEING_RETURN_START',chain.c.reason);
  for(const s of ['RUN','STRENGTH']){
   const p=plans(chain.t)[s];
   assert.equal(p.recipe,'MODERATE',`${s}: ${JSON.stringify(p)}`);assert.equal(p.holds,HOLDS[speed],`${s} holds: ${JSON.stringify(p)}`);
   assert.ok(p.days>=11,`${s}: at least 11 days without training are read: ${JSON.stringify(p)}`);
   assert.deepEqual(aboveWeeks(chain.t.p,alone.t.p,s,3),[],`${s}: the chain is never above the REDUCE report alone`);
  }
 });
}
test('SSCTR-FFC-01 variant: REDUCE 7 none executed, its return none executed, then REST 4: 14 days without training, the MODERATE recipe (FASTER)',()=>{
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:7,returnSpeed:'FASTER'}},'07:00');
 const r1=t.step(1,6,'WEEKLY_REVIEW',{observations:[],check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}},'20:00');
 assert.equal(r1.status,'MODIFY',r1.reason);assert.match(r1.reason,/your return \(faster\) starts now/);
 const r2=t.step(2,3,'NOT_FEELING_100',{observations:[],wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:4,returnSpeed:'FASTER'}},'07:00');
 assert.equal(r2.action,'WELLBEING_REDUCTION',r2.reason);
 const c=t.step(3,0,'WELLBEING_CHECK',{check:{warningSigns:{...NO('NEED_REST'),...NO('UNUSUAL_FATIGUE')},improved:true}},'07:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 for(const s of ['RUN','STRENGTH']){const p=plans(t)[s];assert.equal(p.recipe,'MODERATE',`${s}: ${JSON.stringify(p)}`);assert.ok(p.days>=14,`${s}: ${JSON.stringify(p)}`);}
});
test('SSCTR-FFC-01: the same chain with the REDUCE window executed is unchanged (the REST row of its own rest and waited days)',()=>{
 const want={FASTER:['R3','R4'],BALANCED:['R2','R3','R4']};
 for(const speed of ['FASTER','BALANCED']){
  const {t,c}=q05(speed,{chained:true,executeReduce:true});
  assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
  for(const s of ['RUN','STRENGTH'])assert.deepEqual(plans(t)[s].rungs,want[speed],`${speed} ${s}: ${JSON.stringify(plans(t)[s])}`);
 }
});
for(const [label,sports] of [['running only',['RUN']],['strength only',['STRENGTH']]]){
 test(`SSCTR-FFC-01 (${label}): a local REDUCE window none executed chained with a local REST keeps its days at every speed`,()=>{
  for(const speed of SPEEDS){
   const alone=q05(speed,{chained:false,sports}),chain=q05(speed,{chained:true,sports});
   if(chain.skipped)continue;
   const s=sports[0],p=plans(chain.t)?.[s];
   assert.ok(p,`${speed}: a return plan for ${s}: ${chain.c?.reason}`);
   assert.equal(p.recipe,'MODERATE',`${speed} ${s}: ${JSON.stringify(p)}`);
   assert.deepEqual(aboveWeeks(chain.t.p,alone.t.p,s,3),[],`${speed} ${s}: never above the REDUCE report alone`);
  }
 });
}
/** The structural order of the SSCTR's rows (CH-r2 'never less conservative', the speed tables of SSCTR-V1CPFF-DECISION-r1): the R6 LONG class, then
 * the MODERATE recipe (EACH, FIRST, NONE holds), then rung lists (the first lower rung, then the longer list). Written here independently of the
 * runtime: -1 when a is less conservative than b, 0 when equal, 1 when more. */
function order(a,b){
 const cls=p=>p.recipe==='LONG'?3:p.recipe?2:1,H={NONE:0,FIRST:1,EACH:2},L={R2:2,R3:3,R4:4};
 if(cls(a)!==cls(b))return cls(a)>cls(b)?1:-1;
 if(a.recipe)return Math.sign((H[a.holds]??0)-(H[b.holds]??0));
 for(let i=0;i<Math.max(a.rungs.length,b.rungs.length);i++){const x=L[a.rungs[i]]??9,y=L[b.rungs[i]]??9;if(x!==y)return x<y?1:-1;}
 return 0;
}
test('SSCTR-FFC-01 (FF-N1): a partly executed REDUCE window chained with a REST report reads the days after its last executed session as days without training: the R6 class of those days, never below the REDUCE report alone',()=>{
 for(const speed of SPEEDS){
  const alone=q05(speed,{chained:false,executeReduce:true,partly:true}),chain=q05(speed,{chained:true,executeReduce:true,partly:true});
  assert.equal(chain.c.action,'WELLBEING_RETURN_START',chain.c.reason);
  for(const s of ['RUN','STRENGTH']){
   const p=plans(chain.t)[s],q=plans(alone.t)[s];
   assert.ok(p.days>=11&&p.recipe==='MODERATE'&&p.holds===HOLDS[speed],`${speed} ${s}: 11 or more days without training give the MODERATE recipe with the speed's holds: ${JSON.stringify(p)}`);
   assert.ok(order(p,q)>=0,`${speed} ${s}: never less conservative than the REDUCE report alone: ${JSON.stringify(p)} vs ${JSON.stringify(q)}`);
  }
 }
});
/** A short tail: the REDUCE window is executed through week-2 Tuesday except week 1's Thursday run and Friday strength (partly executed), then the
 * REST report on Thursday: few days without training at its end. */
function shortTail(speed,chained){
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:12,returnSpeed:speed}},'07:00');
 const missed=t.p.weeks[1].sessions.filter(x=>live(x)&&(x.date===t.day(1,3)&&x.sport==='RUN'||x.date===t.day(1,4)&&x.sport==='STRENGTH')).map(x=>x.id);
 assert.equal(missed.length,2,'a run and a strength session are missed in week 1');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1,{skip:missed}),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 if(chained)t.step(2,3,'NOT_FEELING_100',{observations:doneWeek(t,2,{before:t.day(2,3)}),wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3,returnSpeed:speed}},'07:00');
 const c=t.step(3,0,'WELLBEING_CHECK',{observations:chained?[]:doneWeek(t,2,{before:t.day(2,3)}),check:{warningSigns:chained?{...NO('NEED_REST'),...NO('UNUSUAL_FATIGUE')}:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:chained?{NEED_REST:true,UNUSUAL_FATIGUE:true}:true}},'07:00');
 return {t,c};
}
test('SSCTR-FFC-01 (CH-r2 with I-04 within the chain): a partly executed REDUCE window, then a REST report, with few days without training: never less conservative than the REDUCE report alone (its rung repeats first)',()=>{
 for(const speed of SPEEDS){
  const alone=shortTail(speed,false),chain=shortTail(speed,true);
  assert.equal(chain.c.action,'WELLBEING_RETURN_START',chain.c.reason);
  for(const s of ['RUN','STRENGTH']){
   const p=plans(chain.t)[s],q=plans(alone.t)[s];
   assert.ok(order(p,q)>=0,`${speed} ${s}: ${JSON.stringify(p)} vs ${JSON.stringify(q)}`);
   if(p.rungs&&q.rungs)assert.deepEqual(aboveWeeks(chain.t.p,alone.t.p,s,3),[],`${speed} ${s}: same kind of plan, so the doses are never above either: ${JSON.stringify(p)} vs ${JSON.stringify(q)}`);
  }
 }
});

// ================= SSCTR-FFC-02: a declared break after an answered check and an unexecuted return week =================
/** The SSCTR's scenario: NEED_REST REST 5 days from week-1 Tuesday; the check answered improved on week-1 Sunday (or not answered); no session of the
 * return executed; a TRAVEL break week-3 Monday-Tuesday reported on Wednesday 07:00. */
function q07(speed,{check=true,executeWeek2=false}={}){
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5,returnSpeed:speed}},'07:00');
 if(check)t.step(1,6,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'09:00');
 if(executeWeek2)t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 const r=t.step(3,2,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(3,0),endDate:t.day(3,1),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 return {t,r,i:t.p.decisions.at(-1).interruption??{}};
}
for(const speed of ['FASTER','BALANCED']){
 test(`SSCTR-FFC-02 (${speed}): a break after an answered check and a return week with nothing executed reads the days without training: per-sport MODERATE, as the waited variant`,()=>{
  const {t,r,i}=q07(speed),waited=q07(speed,{check:false});
  assert.equal(r.action,'REESTABLISH',r.reason);
  assert.deepEqual(i.classBySport,{RUN:'MODERATE',STRENGTH:'MODERATE'},JSON.stringify(i));
  // The re-entry doses: the first sessions ahead of the decision are the MODERATE entry, as in the waited variant (which re-enters a week later, the
  // known SSCTR-FFR-04 timing; the class and the entry are the same).
  const day=t.day(3,2),entry=(p,s)=>{for(const w of p.weeks){const xs=w.sessions.filter(x=>x.sport===s&&live(x)&&!x.optional&&x.date>day);if(xs.length)return xs.map(x=>s==='RUN'?x.prescription.durationMinutes:x.prescription.exercises.reduce((a,e)=>a+e.sets,0));}return [];};
  for(const s of ['RUN','STRENGTH']){const a=entry(t.p,s),b=entry(waited.t.p,s);assert.ok(Math.max(...a)<=Math.max(...b),`${s}: re-entry ${a} at most the waited variant's entry ${b}`);}
  const held=weekDose(t.p,0,'STRENGTH');assert.ok(sum(weekDose(t.p,4,'STRENGTH'))<sum(held),'the held doses do not come back at once: '+weekDose(t.p,4,'STRENGTH'));
 });
}
test('SSCTR-FFC-02: a return week executed in full before the break keeps the short class (an executed session stops the stretch)',()=>{
 const {r,i}=q07('FASTER',{executeWeek2:true});
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.notEqual(i.classBySport?.STRENGTH,'MODERATE',JSON.stringify(i));assert.notEqual(i.classBySport?.RUN,'MODERATE',JSON.stringify(i));
});
test('SSCTR-FFC-02 (C-Q05-5 with FF-N1): a declared break right after a REDUCE window none executed reads the window as days without training',()=>{
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:10,returnSpeed:'FASTER'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:[],check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 const r=t.step(2,4,'RETURN_AFTER_PAUSE',{observations:[],interruption:{startDate:t.day(2,3),endDate:t.day(2,3),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 assert.equal(r.action,'REESTABLISH',r.reason);
 const i=t.p.decisions.at(-1).interruption;
 assert.deepEqual(i.classBySport,{RUN:'MODERATE',STRENGTH:'MODERATE'},JSON.stringify(i));
});

// ================= QRE-FFC-01: D49 across a per-sport chain =================
const bench=(t,k)=>t.p.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>s.prescription.exercises.find(e=>e.id==='db-bench-press')?.sets??0);
/** The QRE's reproduction: known 6x8 rows; MILD_ILLNESS REDUCE_SUBSTANTIAL 10 days from week-1 Monday (strength at 1 set, executed); a second report on
 * week-2 Wednesday (Monday's 1 set reported); the week-2 review with the check, every condition improved. */
function pd49(c2,i2,d2,sp){
 const t=timeline(KNOWN(6,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:10,returnSpeed:'BALANCED'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:ALLNO()},'20:00');
 t.step(2,2,'NOT_FEELING_100',{wellbeing:{condition:c2,warningSigns:NO(c2),intent:i2,days:d2,returnSpeed:sp},observations:doneWeek(t,2,{before:t.day(2,2)})},'07:00');
 let r=t.step(2,6,'WEEKLY_REVIEW',{observations:[],check:{...ALLNO(),improved:{MILD_ILLNESS:true,[c2]:true}}},'20:00');
 if(r.status==='ASK'&&(r.missingInputs??[]).some(k=>k.startsWith('wellbeingCheck.improved.'))){const imp={};for(const k of r.missingInputs.filter(k=>k.startsWith('wellbeingCheck.improved.')))imp[k.slice(24)]=true;r=t.step(2,6,'WEEKLY_REVIEW',{observations:[],check:{...ALLNO(),improved:imp}},'20:30');}
 return {t,r};
}
for(const [c2,i2,d2] of [['NEED_REST','REST',2],['NEED_REST','REST',4],['UNUSUAL_FATIGUE','REST',3],['NEED_REST','REDUCE_LIGHT',2]])for(const sp of ['FASTER','BALANCED']){
 test(`QRE-FFC-01 (${c2} ${i2} ${d2}d, ${sp}): strength sets come back at most one per executed week across the chain (D49)`,()=>{
  const {t,r}=pd49(c2,i2,d2,sp);
  assert.equal(r.status,'MODIFY',r.reason);
  const last=Math.max(0,...bench(t,2).slice(0,1),...bench(t,1));
  assert.equal(last,1,'the window executed 1 set: '+bench(t,1)+' / '+bench(t,2));
  assert.ok(Math.max(...bench(t,3))<=2,`week 3 plans at most 2 sets after a week at 1: ${bench(t,3)}`);
  assert.ok(Math.max(...bench(t,4))<=Math.max(...bench(t,3))+1,`week 4 at most one above week 3: ${bench(t,3)} -> ${bench(t,4)}`);
 });
}
test('QRE-FFC-01: a single report whose return waits a whole week for its check keeps the D49 cap of the executed window',()=>{
 const t=timeline(KNOWN(6,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:7,returnSpeed:'FASTER'}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 assert.equal(Math.max(...bench(t,1)),1);
 const c=t.step(3,0,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST'),improved:true}},'07:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 assert.ok(Math.max(...bench(t,3))<=2,`after a week at 1 set and a week waiting, at most 2: ${bench(t,3)} (${JSON.stringify(plans(t).STRENGTH)})`);
});
test('QRE-FFC-01 (QRE fuzz seed 367 shape): a window that starts mid-week counts only the sessions inside it: a full Monday before it never lifts the D49 cap',()=>{
 const t=timeline(KNOWN(4,HYBRID()));
 t.step(0,1,'NOT_FEELING_100',{observations:doneWeek(t,0,{before:t.day(0,1)}),wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:6,returnSpeed:'FASTER'}},'07:00');
 assert.equal(Math.max(...bench(t,0)),4,'Monday, before the window, at the held count');
 const fri=t.p.weeks[0].sessions.find(s=>s.sport==='STRENGTH'&&live(s)&&s.date===t.day(0,4));
 assert.equal(fri.prescription.exercises.find(e=>e.id==='db-bench-press').sets,1,'Friday inside the window is R2: 1 set');
 const r=t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0).filter(o=>o.occurrenceDate>=t.day(0,1)),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}},'20:00');
 assert.equal(r.status,'MODIFY',r.reason);
 assert.ok(Math.max(...bench(t,1))<=2,`week 1 at most 2 sets after the window's 1 set: ${bench(t,1)} (${JSON.stringify(plans(t)?.STRENGTH)})`);
});
test('QRE-FFC-01: with nothing executed in the reduction the rung keeps its own count (no executed count to rise from)',()=>{
 const t=timeline(KNOWN(6,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5,returnSpeed:'FASTER'}},'07:00');
 const c=t.step(1,6,'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'09:00');
 assert.equal(c.action,'WELLBEING_RETURN_START',c.reason);
 assert.deepEqual(ladder(t.p,2),{RUN:'R3',STRENGTH:'R3'});
 assert.ok(setsOf(t.p,2,'db-bench-press')>2,'R3 is the consolidation count of the held rows, with no D49 cap: '+setsOf(t.p,2,'db-bench-press'));
});
