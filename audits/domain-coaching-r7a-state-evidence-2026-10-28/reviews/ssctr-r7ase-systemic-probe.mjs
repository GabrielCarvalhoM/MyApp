// SSCTR R7ASE-SSCTR-r1 systemic per-sport probe (own; prints only). SE-E: after a re-entry, a Monday systemic-fatigue report that reduced only
// strength rows, then every session executed (strength at the projected loads), week 5 left unreviewed (U: Sunday reported Monday) or reviewed
// on Sunday (R), then trip B. Does history credit the run's executed return step where a review would not? Harness: lines 2-77 of my
// ssctr-r7ab-probe.mjs (unchanged helpers, byte copy below its first line); SSCTR_CC selects the runtime as there.
// plus the S-F checks across them. Read-only runtime use, synthetic data, DEV_TEST_ONLY authority; prints only. The runtime root is SSCTR_CC
// (default: the live CoachingCore tree, i.e. R7A-BOUNDARY-FINAL-FREEZE); with SSCTR_CC set to the byte-exact R7A-FINAL-FREEZE copy
// (final-freeze-source/CoachingCore) it prints the same scenarios on the freeze I accepted, for comparison. Scenario scaffolding follows
// CoachingCore/test/r7ab-week-start-authority.test.mjs and test/r6-adaptation.test.mjs (the author's fixtures), re-typed here; the checks and the
// recorded outputs are mine. Usage: node ssctr-r7ab-probe.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),{PROFILES}=await load('r6/fixtures/profiles.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-ab-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,actual=null,response=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:kg?.(e.id)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`ssctr-ab-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK,...(response??{})}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)))step(t,at(t.p,w,s.day,s.day===6?'05:00:00':'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));};
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const lastReturn=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const rowText=({date,e})=>`${date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
const runRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&(!from||s.date>=from)).map(s=>`${s.date} ${s.role} ${s.prescription.family??''} ${s.prescription.durationMinutes}`);
const atKnown=t=>({kg:id=>t.p.stateTrace[5].strength.exercises[id]?.load??20});
const res=r=>({status:r.status,action:r.action??null,missingInputs:r.missingInputs??[]});
/** The state an interruption starts from, compactly: run mode/step and return fields; per exercise every field except dates. */
const runState=st=>st?Object.fromEntries(Object.entries(st.run).filter(([k])=>!['planned','modeHistory','peaks'].includes(k)).sort()):null;
const exState=st=>st?Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([id,{lastPerformed,...e}])=>[id,e])):null;
const irq=d=>d?{eventId:d.eventId,relation:d.interruption.relation,class:d.interruption.class,days:d.interruption.days,stateAt:{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,authority:d.interruption.stateAt.authority??null,executed:d.interruption.stateAt.executed}}:null;
const entryOut=d=>d?{irq:irq(d),run:runState(d.interruption.entry),strength:exState(d.interruption.entry)}:null;
/** S-F checks on an entry against a reference return (A): every exercise's set ceiling at most A's (or its executed count), no run step above
 * the one executed, and, in the given weeks, no row above its ceiling while in return steps, no KNOWN row at 3+ sets (the pre-break dose). */
function sf(P,d,{A=null,executedRunStep=0,weeks=[],from=null}={}){
 const e=d?.interruption?.entry;if(!e)return null;const out={runStepAbove:0,ceilingAboveA:[],rowsAboveCeiling:[],preBreakRows:[]};
 if(Number.isInteger(e.run.returnStep)&&e.run.returnStep>executedRunStep)out.runStepAbove=e.run.returnStep;
 const a=A?.interruption?.entry?.strength?.exercises??{};
 for(const [id,x] of Object.entries(e.strength.exercises))if(Number.isInteger(x.setCeiling)&&Number.isInteger(a[id]?.setCeiling)&&x.setCeiling>a[id].setCeiling)out.ceilingAboveA.push({id,ceiling:x.setCeiling,A:a[id].setCeiling});
 for(const w of weeks){const st=P.stateTrace[w]?.strength?.exercises??{};
  for(const r of strengthRows(P,w,w===weeks[0]?from:null)){const x=st[r.e.id];if(Number.isInteger(x?.returnStep)&&Number.isInteger(x?.setCeiling)&&r.e.sets>x.setCeiling)out.rowsAboveCeiling.push(rowText(r));if(r.e.load.mode==='KNOWN'&&r.e.sets>=3)out.preBreakRows.push(rowText(r));}}
 return out;
}
/** After a return: every prescribed session from `from` executed and reviewed for `n` weeks. O = rows above the return entry's ceiling while in
 * return steps; J = a count more than one set above the largest of the weeks before; long runs per week. */
function follow(t,rw,from,ret,n=4){
 const ceil=Object.fromEntries(Object.entries(ret?.interruption?.entry?.strength?.exercises??{}).map(([id,x])=>[id,x.setCeiling??null]));
 const longRuns={},O=[],J=[],largest={};
 for(let w=rw;w<Math.min(rw+n,15);w++){
  const st=t.p.stateTrace[w]?.strength?.exercises??{};
  for(const {date,e} of strengthRows(t.p,w,w===rw?from:null)){
   if(Number.isInteger(st[e.id]?.returnStep)&&Number.isInteger(ceil[e.id])&&e.sets>ceil[e.id])O.push({week:w,date,exercise:e.id,sets:e.sets,ceiling:ceil[e.id]});
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)J.push({week:w,date,exercise:e.id,sets:e.sets,largestBefore:largest[e.id]});
  }
  longRuns[w]=t.p.weeks[w].sessions.filter(s=>live(s)&&s.role==='LONG'&&(w!==rw||s.date>=from)).map(s=>s.prescription.durationMinutes);
  weekly(t,w,s=>w!==rw||s.date>=from);
  for(const {e} of strengthRows(t.p,w,w===rw?from:null))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
 return {longRuns,O:O.length,J:J.length,examples:{O:O.slice(0,3),J:J.slice(0,3)}};
}
/** Weeks 0-2 trained and reviewed, 3-4 untrained (the first break), then A: a 16-day return on Monday 06:00 of week 5 (re-entry that week). */
function afterReturn(id){const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));return {t,d0,A:lastReturn(t.p)};}
/** B: a separate trip of days [from,to] after d0, reported on day `said` at 06:00. */
const tripB=(t,d0,{from=8,to=9,said=10}={})=>{const w=Math.floor((Date.parse(addDays(d0,said))-Date.parse(t.p.startDate))/(7*864e5)),r=step(t,at(t.p,w,(said%7+7)%7,'06:00:00',brk(addDays(d0,from),addDays(d0,to))));return {r:res(r),B:r.action==='REESTABLISH'?lastReturn(t.p):null};};
const sundayOnMonday=(t,o={})=>step(t,at(t.p,6,0,'06:00:00',{observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s,o))}));
const weekRows=(P,weeks,from)=>Object.fromEntries(weeks.map((w,i)=>[w,{run:runRows(P,w,i===0?from:null),strength:strengthRows(P,w,i===0?from:null).map(rowText)}]));
const out={probe:'R7ASE-SSCTR-r1-SYSTEMIC',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (STATE-EVIDENCE-FREEZE-1; check the digest)'};
const cell=(label,reviewSunday,report)=>{const {t,d0}=afterReturn('ssctr-se-sys-'+label);const u=copy(t);
 if(report)step(u,at(u.p,5,0,'08:00:00',report));
 const adaptKinds=(u.p.weeks[5].adaptations??[]).map(a=>a.kind);
 if(reviewSunday){perDay(u,5,s=>s.day<6,atKnown(u));weekly(u,5,s=>s.day===6,atKnown(u));}else{perDay(u,5,s=>s.day<6,atKnown(u));sundayOnMonday(u,atKnown(u));}
 const b=tripB(u,d0);return {adaptations:adaptKinds,B:b.r,entry:entryOut(b.B),rows:weekRows(u.p,[6,7],addDays(d0,10))};};
for(const [label,report] of [['none',null],['systemic',{kind:'SYSTEMIC_FATIGUE'}]])out[label]={U:cell(label+'-u',false,report),R:cell(label+'-r',true,report)};
out.compare=Object.fromEntries(['none','systemic'].map(l=>[l,{runReturnStepU:out[l].U.entry?.run?.returnStep??null,runReturnStepR:out[l].R.entry?.run?.returnStep??null,runModeU:out[l].U.entry?.run?.mode,runModeR:out[l].R.entry?.run?.mode,authorityU:out[l].U.entry?.irq?.stateAt?.authority,authorityR:out[l].R.entry?.irq?.stateAt?.authority,runRowsU:out[l].U.rows,runRowsR:out[l].R.rows}]));
console.log(JSON.stringify(out,null,1));
