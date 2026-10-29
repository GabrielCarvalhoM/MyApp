// SSCTR R7ASM-SSCTR-r1 mechanism trace for the restoration-grid B violation (own; prints only). Same timeline as ssctr-r7asm-trace-b.mjs
// (sg-ret16thu-<GOAL>-K-3-20-after3, my R7-A.1 grid's logic), on the runtime SSCTR_CC selects (default: live). It prints, at each week start from
// the return's week to week 10: the return step of every exercise in the stored projection (stateTrace) and, on a runtime that exports it, in
// HistoricalState (historicalStateOf at that week's first instant); the start authority the program records for that week; and, for weeks 7-9,
// every strength session's rows with its duration and the time budget. Read-only use; synthetic data; DEV_TEST_ONLY authority.
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
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.date<=addDays(t.p.weeks[w].startDate,6)).map(s=>obs(t.p,s))}));
const out={probe:'R7ASM-SSCTR-r1-TRACE-B2',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (HISTORICAL-PROJECTION-FREEZE-1; check the digest)',goals:{}};
for(const goal of (process.env.GOALS??'STRENGTH,HYPERTROPHY').split(',')){
 const id=`sg-ret16thu-${goal}-K-3-20-after3`,g=R.generateProgram(intake(id,{goal,known:true,days:[0,2,4],minutes:20}),opts),t={p:g.program,ledger:[]},o=out.goals[goal]={weeks:[]};
 for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,s=>s.day<=2);weekly(t,5,()=>false);
 const d=addDays(t.p.weeks[6].startDate,3);const r=ev(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 o.return=`${r.status}/${r.action}`;
 const snap=w=>{const st=t.p.stateTrace[w]?.strength?.exercises??{},hs=typeof A.historicalStateOf==='function'?A.historicalStateOf(t.p,{asOf:t.p.weeks[w].startDate+'T03:00:00Z',actualLedger:t.ledger},opts):null;
  return {week:w,phase:t.p.phases.phases[w],startAuthority:t.p.weeks[w].startAuthority?{RUN:t.p.weeks[w].startAuthority.RUN?.provenance,STRENGTH:t.p.weeks[w].startAuthority.STRENGTH?.provenance}:null,
   projectionReturnStep:Object.fromEntries(Object.entries(st).map(([x,v])=>[x,Number.isInteger(v.returnStep)?v.returnStep:(Number.isInteger(v.setCap)?'cap'+v.setCap:'-')])),
   historyReturnStep:hs?Object.fromEntries(Object.entries(hs.strength.exercises).map(([x,v])=>[x,v.returnStep??'-'])):'not exported',historyBasis:hs?.basis??null,
   sessions:t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>`d${s.day} ${s.prescription.durationMinutes}min: `+s.prescription.exercises.map(e=>`${e.id} ${e.sets}${e.exposure?.kind?'('+e.exposure.kind+')':''}`).join(', '))};};
 for(let w=6;w<11;w++){o.weeks.push(snap(w));weekly(t,w,s=>w===6?s.day>=3:true);if(w===9)ev(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));}
 o.weeks.push(snap(11));
}
console.log(JSON.stringify(out,null,1));
