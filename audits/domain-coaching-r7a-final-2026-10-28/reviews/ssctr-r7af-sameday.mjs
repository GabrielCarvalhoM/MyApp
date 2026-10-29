// SSCTR R7AF-SSCTR-r1 same-day probe (own instrument; F-C). Read-only runtime use of the live tree (or SSCTR_CC), synthetic data,
// DEV_TEST_ONLY authority. Prints only. Usage: node ssctr-r7af-sameday.mjs > out.json
// The 72 cases of my R7-A.2 same-day probe (ssctr-r7a2-sameday.mjs, left unchanged): the first-week grid's intake factors, a 14-day break whose
// stated first day is a strength day of the first loaded week, that day's session executed at 19:00 and logged with the return. Three
// reports of the same break: dates only; a stated start time of 06:00 (the session is after the start); 21:00 (the session is before it).
// For the exercises executed only that day (loaded, not practice): the report's status, whether they are in the return's state with the
// entry and that day's count as the ceiling, and E, O (against that day's count) and B as in the first-week grid, through week 12.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,cls,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:cls==='NONE'?0:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:days.includes(4)?[1,5,6]:[1,4,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sdf-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sdf-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const loaded=e=>e.load.mode!=='BODYWEIGHT'&&!(e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE');
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const copy=t=>({p:t.p,ledger:t.ledger});
const out={probe:'R7AF-SSCTR-r1-SAMEDAY',runtime:process.env.SSCTR_CC?'SSCTR_CC':'live tree (check the digest)',cases:0,skipped:[],tally:{},firstExposure:{},examples:{}};
const T=(v,cls,k,n=1)=>{const c=((out.tally[v]??={})[cls]??={});c[k]=(c[k]??0)+n;};
const X=(k,v)=>{const l=(out.examples[k]??=[]);if(l.length<4)l.push(v);};
function follow(t,v,cls,id,rw,report,ids,ceil){
 const seen=new Set(),largest={},blocks=t.p.blocks??[],bi=blocks.findIndex(b=>rw>=b.startWeek&&rw<b.endWeekExclusive),limitWeek=blocks[bi+1]?.endWeekExclusive??16;
 for(let w=rw;w<13;w++){
  for(const {date,e} of rowsOf(t.p,w)){if(!ids.includes(e.id)||date<report)continue;
   if(!seen.has(e.id)){seen.add(e.id);const fx=((out.firstExposure[v]??={})[cls]??={maxSets:0,minRir:9,kinds:{}});fx.maxSets=Math.max(fx.maxSets,e.sets);fx.minRir=Math.min(fx.minRir,e.rir);fx.kinds[e.exposure?.kind??'none']=(fx.kinds[e.exposure?.kind??'none']??0)+1;
    if(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>1||e.rir<4){T(v,cls,'E');X(v+'E',{id,exercise:e.id,kind:e.exposure?.kind,sets:e.sets,rir:e.rir});}}
   if(w<limitWeek&&e.sets>ceil[e.id]){T(v,cls,'O');X(v+'O',{id,week:w,exercise:e.id,sets:e.sets,ceiling:ceil[e.id]});}
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1){T(v,cls,'B');X(v+'B',{id,week:w,exercise:e.id,sets:e.sets,largest:largest[e.id]});}}
  weekly(t,w,s=>s.date>=report);
  for(const {date,e} of rowsOf(t.p,w))if(date>=report&&ids.includes(e.id))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
}
for(const cls of ['NONE','FAMILIAR','KNOWN'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const days of [[0],[0,3]])for(const minutes of [20,30,40])for(const startDay of days){
 const cfg={goal,cls,days,minutes},id=`sd-${cls}-${goal}-${days.length}-${minutes}-b${startDay}`;
 const g=R.generateProgram(intake(id,cfg),opts);if(!g.program){out.skipped.push(id+':'+g.status);continue;}
 const t={p:g.program,ledger:[]};
 try{
  const F=t.p.weeks.findIndex(x=>rowsOf(t.p,x.index).some(r=>loaded(r.e)));if(F<0||F>3){out.skipped.push(id+':no loaded week');continue;}
  for(let w=0;w<F;w++)weekly(t,w);
  const bStart=addDays(t.p.weeks[F].startDate,startDay),bEnd=addDays(bStart,13),report=addDays(bEnd,1);
  const sameDay=rowsOf(t.p,F).filter(r=>r.date===bStart&&loaded(r.e)),earlier=new Set(rowsOf(t.p,F).filter(r=>r.date<bStart&&loaded(r.e)).map(r=>r.e.id));
  const ids=[...new Set(sameDay.map(r=>r.e.id))].filter(x=>!earlier.has(x));if(!ids.length){out.skipped.push(id+':no exercise only on the first day');continue;}
  const ceil={};for(const {e} of sameDay)ceil[e.id]=Math.max(ceil[e.id]??0,e.sets);
  weekly(t,F,s=>s.date<=bStart);
  const rw=Math.floor((Date.parse(report)-Date.parse(t.p.startDate))/(7*864e5));for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
  const day=(Date.parse(report)-Date.parse(t.p.weeks[rw].startDate))/864e5;
  const mk=(startedAt)=>at(t.p,rw,day,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:14,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel',...(startedAt?{startedAt:`${bStart}T${startedAt}Z`}:{})}});
  out.cases++;
  for(const [v,startedAt] of [['datesOnly',null],['startedBeforeSession','06:00:00'],['startedAfterSession','21:00:00']]){
   const tv=copy(t),r=ev(tv,mk(startedAt));
   T(v,cls,'cases');T(v,cls,'exercises',ids.length);T(v,cls,'status:'+r.status+(r.missingInputs?.length?':'+r.missingInputs.join('+'):''));
   if(!/REESTABLISH/.test(r.action??''))continue;
   const D=tv.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
   for(const x of ids){const s=D.interruption.entry.strength.exercises[x];if(s)T(v,cls,'inState');if(s?.returnStep===0&&s.setCeiling===ceil[x])T(v,cls,'entryWithCeiling');}
   follow(tv,v,cls,id,rw,report,ids,ceil);
  }
 }catch(err){out.skipped.push(id+':'+String(err?.stack??err).slice(0,300));}
}
console.log(JSON.stringify(out,null,1));
