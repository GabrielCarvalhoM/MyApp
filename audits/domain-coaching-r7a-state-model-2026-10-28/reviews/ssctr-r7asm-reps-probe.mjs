// SSCTR R7ASM-SSCTR-r1 repetition-target probe (own; prints only). The R42 path (contract §7: "a load above the one the state held ... takes the
// repetition target of the dose executed at it"): the athlete lifts a load the projection stepped to while history still holds the lighter one,
// with the repetitions and reserve of each variant below; does the next prescription repeat the planned dose under HOLD (SSCTR R7A1 DOSE-READING:
// "HOLD and REGRESS keep the planned target, ADVANCE takes the logged repetitions") and stay inside the goal's repetition range? On the runtime
// SSCTR_CC selects (default: the live tree). Setup per goal: weeks 0-1 executed and reviewed; week 2's Wednesday back squat lifted one increment
// below its row and the week left unreviewed (history keeps the lighter load, the projection steps); week 3's Wednesday back squat lifted at its
// row's load with the variant's repetitions and reserve, every other row as prescribed; U leaves week 3 unreviewed (a handler on Monday of week 4
// plans from the PlanningView), R reviews it on Sunday. Then weeks 4-6 executed as prescribed and reviewed. Prints the week-3 row, the gate the
// review gave (R), the rows of weeks 4-7, and every row whose repetitions leave the goal's range.
// Read-only use; synthetic data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()},policy=opts.authority.policy;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,goal})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,goal==='STRENGTH'?5:goal==='HYPERTROPHY'?12:10,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-rp-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,set=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:e.load.ceiling?.value??20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`ssctr-rp-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const copy=t=>({p:t.p,ledger:t.ledger});
const WED=s=>s.sport==='STRENGTH'&&s.day===2;
const rowText=(s,e)=>`${s.date} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
const rows=(t,from,to)=>t.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from&&s.date<to).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>({text:rowText(s,e),reps:e.reps,mode:e.load.mode})));
const VARIANTS={
 missedBy2:{reps:r=>Math.max(1,r-2),rir:x=>x},
 metExactly:{reps:r=>r,rir:x=>x},
 aboveTargetLowReserve:{reps:r=>r+3,rir:()=>0},
 aboveTargetWithReserve:{reps:r=>r+2,rir:x=>x+2}};
const out={probe:'R7ASM-SSCTR-r1-REPS',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (HISTORICAL-PROJECTION-FREEZE-1; check the digest)',goals:{}};
for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT']){
 const range=policy.operational.strength.goalDoses[goal].repRange,o=out.goals[goal]={repRange:range};
 const g=generateProgram(intake({id:'ssctr-rp-'+goal,goal}),opts),base={p:g.program,ledger:[]};
 weekly(base,0);weekly(base,1);
 o.rowsWeek2=rows(base,base.p.weeks[2].startDate,base.p.weeks[3].startDate).map(r=>r.text);
 perDay(base,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value-2.5:e.load.mode==='KNOWN'?e.load.value:e.load.ceiling?.value??20}:{});
 o.rowsWeek3=rows(base,base.p.weeks[3].startDate,base.p.weeks[4].startDate).map(r=>r.text);
 for(const [name,v] of Object.entries(VARIANTS)){
  const mk=s=>WED(s)?{set:(id,x,e)=>id==='back-squat'?{...x,reps:v.reps(e.reps),rir:v.rir(e.rir)}:x}:{};
  const U=copy(base),R=copy(base);
  perDay(U,3,()=>true,mk);const h=step(U,at(U.p,4,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(U.p.weeks[4].startDate,1)]}}));
  weekly(R,3,()=>true,mk);const rg=R.last;
  const cell=o[name]={},gate=(rg.gates??rg.decision?.gates??null);
  cell.R_review=`${rg.status}/${rg.action}`;cell.R_gateBackSquat=rg.gateReasons?.find?.(x=>x.key==='back-squat')??null;
  for(const [label,t] of [['U',U],['R',R]]){
   const w4=rows(t,t.p.weeks[4].startDate,t.p.weeks[5].startDate);
   for(let w=4;w<7;w++)weekly(t,w);
   const all=rows(t,t.p.weeks[4].startDate,t.p.weeks[8].startDate);
   cell[label]={week4AsPlanned:w4.map(r=>r.text),weeks4to7:all.map(r=>r.text),outsideRange:all.filter(r=>r.mode==='KNOWN'&&(r.reps<range[0]||r.reps>range[1])).map(r=>r.text)};
  }
  cell.handlerU=`${h.status}/${h.action}`;
 }
}
console.log(JSON.stringify(out,null,1));
