// SSCTR R7ASM-SSCTR-r1 changes probe (own; prints only). The three changes STATE_MODEL_CONTRACT §10 sends to the SSCTR, plus two consequences of
// the PlanningView I wanted to see with my own scenarios, each on the runtime SSCTR_CC selects (default: the live tree, HISTORICAL-PROJECTION-
// FREEZE-1; with SSCTR_CC set to the byte-exact STATE-EVIDENCE-FREEZE-1 copy it prints the same scenarios on the predecessor):
//  A (E6)  a week inside a return executed as finally prescribed after a reduction (systemic fatigue, an unavailable day, an equipment window)
//          or exactly, unreviewed (U) against the same facts reviewed on Sunday (R); then a SHORT or a MODERATE second break. The state at the
//          break, the return entry (run and strength), the caps, the rows after it; D56: no return or regain cap rises after a reduced week.
//  B       a return after a load step the evidence released but the athlete never executed (four reviewed weeks, break before the stepped row):
//          the resumed load, tick and ceiling, and the back-squat rows of the three reviewed weeks after it.
//  C (R42) the progression credit across a load change: C1 a projected dose lifted exactly after an unreviewed lighter week; C2 an athlete-
//          initiated heavier lift (one increment above the row, target met: SSCTR D44) in a reviewed week, at tick 1; rows of the weeks after.
//  D       a complete unreviewed week with a heavier adopted lift: the next rows, where the projection holds a load below history's.
// Harness: my ssctr-r7ase-tick-probe.mjs lines 8-51 (re-typed, unchanged in substance). Read-only use; synthetic data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-sm-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,set=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:e.load.ceiling?.value??20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`ssctr-sm-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const start=(id,weeks,o={})=>{const g=generateProgram(intake({id}),opts);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w,()=>true,o);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
const B=(t,k,{from=1,to=2}={})=>{const d=t.p.weeks[k].startDate,w=Math.floor((Date.parse(addDays(d,to+1))-Date.parse(t.p.startDate))/(7*864e5));const r=step(t,at(t.p,w,(to+1)%7,'06:00:00',brk(addDays(d,from),addDays(d,to))));
 return {status:r.status,action:r.action??null,missingInputs:r.missingInputs??[],d:r.action==='REESTABLISH'?t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1):null,returnDay:addDays(d,to+1),w};};
const pick=(e,keys=['mode','load','reps','sets','loadTick','returnStep','setCeiling','setCap','regainCap','ceiling','lastExecutedSets','lastPerformed'])=>e?Object.fromEntries(keys.filter(k=>e[k]!==undefined).map(k=>[k,e[k]])):null;
const runPick=r=>r?Object.fromEntries(Object.entries(r).filter(([k])=>['mode','long','easy','quality','qualityStep','returnStep','easyWeeksDone','achieved','longestContinuous'].includes(k))):null;
const rowText=(s,e)=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
const rowsOf=(t,from,ids,n=8)=>t.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.filter(e=>ids.includes(e.id)).map(e=>rowText(s,e))).slice(0,n);
const runRows=(t,from,n=6)=>t.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from).map(s=>`${s.date} ${s.role} ${s.prescription.family??''} ${s.prescription.durationMinutes}${s.prescription.work?` (${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}${s.prescription.strides?' +strides':''}`).slice(0,n);
const lifted=(t,id)=>t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>o.logs[id].load);
const out={probe:'R7ASM-SSCTR-r1-CHANGES',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (HISTORICAL-PROJECTION-FREEZE-1; check the digest)'};
const guard=(name,fn)=>{try{out[name]=fn();}catch(e){out[name]={error:String(e?.stack??e).slice(0,1500)};}};
const IDS=['back-squat','db-bench-press'];
const entryOf=b=>b.d?{stateAt:{kind:b.d.interruption.stateAt.kind,week:b.d.interruption.stateAt.week,authority:b.d.interruption.stateAt.authority},run:runPick(b.d.interruption.entry.run),strength:Object.fromEntries(Object.entries(b.d.interruption.entry.strength.exercises).map(([id,x])=>[id,pick(x)]))}:null;
// Follow-up after a return: every prescribed session from the return day executed and reviewed for n weeks, with the strength caps of each start
// (D56: a cap may rise only after a week whose last executed exposure did its whole count).
function follow(t,b,n=3){const trace=[];for(let w=b.w;w<Math.min(b.w+n,15);w++){weekly(t,w,s=>s.date>=b.returnDay);trace.push({week:w+1,caps:Object.fromEntries(IDS.map(id=>[id,pick(t.p.stateTrace[w+1]?.strength?.exercises?.[id],['load','loadTick','sets','returnStep','setCap','regainCap','setCeiling'])]))});}
 return {strengthRows:rowsOf(t,b.returnDay,IDS,10),runRows:runRows(t,b.returnDay,8),starts:trace};}
// ---------------- A (E6): a week inside a return, executed as finally prescribed after a reduction ----------------
guard('A_E6',()=>{
 const res={};
 // Weeks 0-1 reviewed; a MODERATE first break (week 2 day 1 to day 14) puts the exercises in the return steps; the entry week is executed and reviewed.
 const t0=start('ssctr-sm-a',2);const b1=B(t0,2,{from:1,to:14});if(!b1.d)return {firstBreak:b1};
 weekly(t0,b1.w,s=>s.date>=b1.returnDay);const W=b1.w+1;res.firstBreak={status:`${b1.status}/${b1.action}`,returnWeek:b1.w,entry:entryOf(b1),weekUnderTest:W,startOfWeekUnderTest:{run:runPick(t0.p.stateTrace[W].run),strength:Object.fromEntries(IDS.map(id=>[id,pick(t0.p.stateTrace[W].strength.exercises[id])]))},rowsOfWeekUnderTest:rowsOf(t0,t0.p.weeks[W].startDate,IDS,6)};
 const d0=t0.p.weeks[W].startDate;
 const variants={
  exact:t=>{},
  systemicFatigue:t=>step(t,at(t.p,W,0,'06:00:00',{kind:'SYSTEMIC_FATIGUE'})),
  unavailableDay:t=>step(t,at(t.p,W,0,'06:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,2)]}})),
  equipmentWindow:t=>step(t,at(t.p,W,0,'06:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:d0,to:addDays(d0,6)}}))};
 for(const [name,fn] of Object.entries(variants)){
  const v=res[name]={};const base=copy(t0);const pre=fn(base);v.reduction=pre?`${pre.status}/${pre.action}`:'none';
  v.rowsAsFinallyPrescribed=rowsOf(base,d0,IDS,6);v.runAsFinallyPrescribed=runRows(base,d0,4);
  const U=copy(base),R=copy(base);perDay(U,W,()=>true);weekly(R,W,()=>true);
  v.R_reviewedStartNextWeek={run:runPick(R.p.stateTrace[W+1].run),strength:Object.fromEntries(IDS.map(id=>[id,pick(R.p.stateTrace[W+1].strength.exercises[id])]))};
  for(const [kind,o] of [['SHORT',{from:1,to:2}],['MODERATE',{from:1,to:14}]]){
   const u=copy(U),r=copy(R),bu=B(u,W+1,o),br=B(r,W+1,o);
   const eu=entryOf(bu),er=entryOf(br);
   v[kind]={U:{result:`${bu.status}/${bu.action}`,entry:eu,after:bu.d?follow(copy(u),bu):null},R:{result:`${br.status}/${br.action}`,entry:er,after:br.d?follow(copy(r),br):null},
    entryUequalsR:JSON.stringify(eu?.strength)===JSON.stringify(er?.strength)&&JSON.stringify(eu?.run)===JSON.stringify(er?.run)};
  }
 }
 return res;
});
// ---------------- B: a return after a released, never executed load step ----------------
guard('B_RETURN_BASE',()=>{
 // Weeks 0-4 reviewed: week 4's review releases the back squat's next load (week 5's row), which the break (from week 5's first day) leaves
 // unexecuted.
 const res={};const t=start('ssctr-sm-b',5);
 res.history={liftedBackSquat:lifted(t,'back-squat'),startWeek5:pick(t.p.stateTrace[5].strength.exercises['back-squat']),rowsWeek5:rowsOf(t,t.p.weeks[5].startDate,['back-squat'],2)};
 for(const [kind,o] of [['SHORT',{from:0,to:1}],['MODERATE',{from:0,to:13}]]){const u=copy(t),b=B(u,5,o);
  res[kind]={result:`${b.status}/${b.action}`,entry:entryOf(b),after:b.d?follow(copy(u),b,4):null};}
 return res;
});
// ---------------- C (R42): progression credit across a load change ----------------
guard('C_R42',()=>{
 const res={};
 // C1: weeks 0-1 reviewed; week 2's Wednesday back-squat row lifted lighter by one increment and the week left unreviewed; week 3 every row lifted
 // exactly as prescribed (the projected dose), unreviewed; then week 4 executed and reviewed, and two more reviewed weeks.
 {const t=start('ssctr-sm-c1',2),WED=s=>s.sport==='STRENGTH'&&s.day===2;
  const rows2=rowsOf(t,t.p.weeks[2].startDate,['back-squat'],2);
  perDay(t,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value-2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});
  const rows3=rowsOf(t,t.p.weeks[3].startDate,['back-squat'],2);perDay(t,3,()=>true);
  const s4=pick(t.p.stateTrace[4].strength.exercises['back-squat']),rows4=rowsOf(t,t.p.weeks[4].startDate,['back-squat'],2);
  for(let w=4;w<7;w++)weekly(t,w);
  res.C1={rowsWeek2:rows2,rowsWeek3:rows3,projectedStartWeek4:s4,rowsWeek4AsPlanned:rows4,lifted:lifted(t,'back-squat'),rowsWeeks4to7:rowsOf(t,t.p.weeks[4].startDate,['back-squat'],8),starts:[4,5,6,7].map(w=>({week:w,...pick(t.p.stateTrace[w].strength.exercises['back-squat'],['load','loadTick','reps'])}))};}
 // C2: week 0 reviewed (back squat 80 kg, tick 1); week 1 Wednesday back squat lifted one increment above the row with the target met, reviewed.
 {const t=start('ssctr-sm-c2',1),WED=s=>s.sport==='STRENGTH'&&s.day===2;
  const s1=pick(t.p.stateTrace[1].strength.exercises['back-squat']),rows1=rowsOf(t,t.p.weeks[1].startDate,['back-squat'],2);
  weekly(t,1,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value+2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});
  const r1=t.last;for(let w=2;w<5;w++)weekly(t,w);
  res.C2={startWeek1:s1,rowsWeek1:rows1,review:`${r1.status}/${r1.action}`,lifted:lifted(t,'back-squat'),starts:[1,2,3,4,5].map(w=>({week:w,...pick(t.p.stateTrace[w].strength.exercises['back-squat'],['load','loadTick','reps'])})),rowsWeeks2to5:rowsOf(t,t.p.weeks[2].startDate,['back-squat'],8)};}
 return res;
});
// ---------------- D: a complete unreviewed week with a heavier adopted lift ----------------
guard('D_VIEW_BELOW_HISTORY',()=>{
 // Week 0 (the intake's 80 kg at tick 0: the projection does not step after one exposure) executed unreviewed with the Wednesday back squat
 // lifted one increment above its row, target met (SSCTR D44: adopted when the exposure met ADVANCE); a handler on Monday of week 1 plans from
 // the PlanningView; then weeks 1-4 executed as prescribed and reviewed.
 const g=generateProgram(intake({id:'ssctr-sm-d'}),opts),t={p:g.program,ledger:[]},WED=s=>s.sport==='STRENGTH'&&s.day===2;
 const rows0=rowsOf(t,t.p.weeks[0].startDate,['back-squat'],2);
 perDay(t,0,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value+2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});
 const p1=pick(t.p.stateTrace[1].strength.exercises['back-squat']),rows1=rowsOf(t,t.p.weeks[1].startDate,['back-squat'],2);
 const h=step(t,at(t.p,1,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[1].startDate,1)]}}));
 const rowsAfterHandler=rowsOf(t,t.p.weeks[1].startDate,['back-squat'],2);
 for(let w=1;w<5;w++)weekly(t,w);
 return {rowsWeek0:rows0,lifted:lifted(t,'back-squat'),projectionStartWeek1:p1,rowsWeek1AsProjected:rows1,handler:`${h.status}/${h.action}`,rowsWeek1AfterHandler:rowsAfterHandler,starts:[1,2,3,4,5].map(w=>({week:w,...pick(t.p.stateTrace[w].strength.exercises['back-squat'],['load','loadTick','reps'])})),rowsWeeks1to5:rowsOf(t,t.p.weeks[1].startDate,['back-squat'],8)};
});
console.log(JSON.stringify(out,null,1));
