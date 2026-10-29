// SSCTR R7ASM-SSCTR-r1 trace of the restoration-grid B violations (own; prints only). Re-types, for the timelines named in TIMELINES (default: the
// two that report B on HISTORICAL-PROJECTION-FREEZE-1), the timeline logic of my R7-A.1 restoration grid (audits/domain-coaching-r7a1-2026-10-27/
// reviews/ssctr-r7a1-grid.mjs, unchanged in substance: same intake, observations, reviews, return report and budget raise), on the runtime
// SSCTR_CC selects (default: the live tree). For every exercise named in IDS (default: all with a row from the return week on) it prints, per week
// from the week before the break to week 14: the start state (caps, ceiling, return step, counts, load) and the rows (sets / phased / base /
// normal, kind, phase), the largest count executed since the break, and the B check exactly as the grid applies it. It also prints the
// interruption record of the return (the state at the break, per value, and the entry of the traced exercises) and the history the reducer holds
// at the break (historicalStateOf, when the runtime exports it). Read-only use; synthetic data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),A=await load('src/r6-adaptation.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,known,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6].filter(d=>!days.includes(d)).length===3?[1,4,6]:[1,5,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sg-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sg-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.date<=addDays(t.p.weeks[w].startDate,6)).map(s=>obs(t.p,s))}));
const rowsOf=(P,w,id)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>!id||e.id===id).map(e=>({day:s.day,e})));
const capOf=x=>Number.isInteger(x?.regainCap)?['regainCap',x.regainCap]:Number.isInteger(x?.setCap)?['setCap',x.setCap]:null;
const ST=x=>x?Object.fromEntries(['mode','load','reps','loadTick','sets','priorSets','regainCap','setCap','setCeiling','returnStep','lastExecutedSets','blocksDone','ceiling','lastPerformed'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])):null;
const TIMELINES=(process.env.TIMELINES??'sg-ret16thu-STRENGTH-K-3-20-after3,sg-ret16thu-HYPERTROPHY-K-3-20-after3').split(',');
const out={probe:'R7ASM-SSCTR-r1-TRACE-B',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (HISTORICAL-PROJECTION-FREEZE-1; check the digest)',timelines:{}};
for(const id of TIMELINES){
 const [,mode,goal,kn,nd,mins,raise]=id.split('-'),known=kn==='K',days=nd==='1'?[0]:nd==='2'?[0,3]:[0,2,4],minutes=+mins;
 if(mode!=='ret16thu')throw Error('only ret16thu is re-typed here');
 const g=R.generateProgram(intake(id,{goal,known,days,minutes}),opts),t={p:g.program,ledger:[],log:[]},o=out.timelines[id]={};
 for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,s=>s.day<=2);weekly(t,5,()=>false);
 const d=addDays(t.p.weeks[6].startDate,3);const r=ev(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const from=6,reviewDay=3,dec=t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1),itr=dec?.interruption;
 const IDS=process.env.IDS?process.env.IDS.split(','):null;
 o.return={result:`${r.status}/${r.action}`,breakStart:addDays(d,-16),stateAt:itr?{kind:itr.stateAt.kind,week:itr.stateAt.week,authority:itr.stateAt.authority,values:itr.stateAt.values?.STRENGTH??null}:null};
 o.preBreak={rowsWeek3:rowsOf(t.p,3).map(({day,e})=>`d${day} ${e.id} ${e.sets}`),rowsWeek4:rowsOf(t.p,4).map(({day,e})=>`d${day} ${e.id} ${e.sets}`),startWeek4:Object.fromEntries(Object.entries(t.p.stateTrace[4].strength.exercises).map(([x,v])=>[x,ST(v)]))};
 if(typeof A.historicalStateOf==='function'){const h=A.historicalStateOf(t.p,{asOf:addDays(d,-16)+'T00:00:00Z',actualLedger:t.ledger},opts);o.historyAtBreak=h?Object.fromEntries(Object.entries(h.state.strength.exercises).map(([x,v])=>[x,ST(v)])):null;}
 o.entry=itr?Object.fromEntries(Object.entries(itr.entry.strength.exercises).map(([x,v])=>[x,ST(v)])):null;
 const largest={},covered=new Set(),weeks=[],B=[];
 for(let w=from;w<15;w++){
  const st=t.p.stateTrace[w].strength.exercises;for(const [x,ex] of Object.entries(st))if(capOf(ex)||Number.isInteger(ex.returnStep))covered.add(x);
  const fromDay=w===from?reviewDay:0,ids=[...new Set(rowsOf(t.p,w).map(r=>r.e.id))].filter(x=>!IDS||IDS.includes(x));
  const row={week:w,phase:t.p.phases.phases[w],exercises:{}};
  for(const x of ids){const mine=rowsOf(t.p,w,x).filter(r=>r.day>=fromDay);row.exercises[x]={start:ST(st[x]),rows:mine.map(({day,e})=>`d${day}:${e.sets}/${e.exposure?.phasedSets}/${e.exposure?.baseSets}/${e.exposure?.normalSets} ${e.exposure?.kind} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}`),largestBefore:largest[x]??null};
   for(const {e} of mine)if(Number.isInteger(largest[x])&&e.sets>largest[x]+1)B.push({week:w,id:x,sets:e.sets,largestExecutedSinceBreak:largest[x],covered:covered.has(x)});}
  weeks.push(row);
  weekly(t,w,s=>s.day>=fromDay);
  if((raise==='after1'&&w===from+1)||(raise==='after3'&&w===from+3))ev(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
  for(const x of ids)for(const {day,e} of rowsOf(t.p,w,x))if(day>=fromDay)largest[x]=Math.max(largest[x]??0,e.sets);
 }
 o.weeks=weeks;o.B=B;o.log=t.log;
}
console.log(JSON.stringify(out,null,1));
