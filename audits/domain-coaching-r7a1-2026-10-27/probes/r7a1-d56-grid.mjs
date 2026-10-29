// DOMAIN_COACHING_R7-A.1 D56/D53 grid (author instrument, modelled on the SSCTR's R7A-SSCTR-r2 time-fit grid): after a re-establishment
// (a five-week gap) or a 16-day return, with one or two 25-35 minute strength days, three goals, known or no exercises, and the budget kept or
// raised to 75 minutes later. Every week is executed and reviewed as prescribed. Measured per exercise:
//  A. a regain or return cap that rises or ends after a week whose last executed exposure was trimmed below its whole count by the time fit;
//  B. a prescribed count more than one set above the largest count executed since the re-establishment or the return, for an exercise the
//     re-establishment or return capped (the D53/D56 class), and separately for exercises no ceiling covers (bodyweight rows are never re-established).
// RT=freeze2 runs the R7A-FREEZE-2 snapshot. Synthetic data, DEV_TEST_ONLY authority, read-only runtime use.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'CURRENT';
const CC=tag==='CURRENT'?path.resolve(here,'../../../CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let N=0;
const intake=(id,{goal,known,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?[SQUAT,RDL,BENCH]:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`d56g-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`d56g-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r.status;};
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&keep(s)).map(s=>obs(t.p,s))}));
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.map(e=>({day:s.day,e})));
const out={probe:'R7A1-D56-GRID-1',runtime:tag,timelines:0,cap:{trimmedWeeksWithCap:0,riseOrEndAfterTrimmed:0},jumpsAboveLargestPlusOne:{capped:0,uncovered:0,uncoveredByExercise:{}},examples:{A:[],B:[],uncovered:[]}};
for(const mode of ['reestablish','return'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const known of [true,false])for(const days of [[0],[0,3]])for(const minutes of [25,30,35])for(const raise of [false,true]){
 const t={p:R.generateProgram(intake(`d56g-${mode}-${goal}-${known}-${days.length}-${minutes}-${raise}`,{goal,known,days,minutes}),opts).program,ledger:[]};if(!t.p)continue;out.timelines++;
 let from;
 if(mode==='reestablish'){for(let w=0;w<7;w++)weekly(t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));from=7;}
 else{for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(t.p.weeks[6].startDate,-16),endDate:addDays(t.p.weeks[6].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=6;}
 const largest={},capped=new Set();
 for(let w=from;w<14;w++){
  const st=t.p.stateTrace[w].strength.exercises,rows=rowsOf(t.p,w);
  for(const [id,ex] of Object.entries(st))if(Number.isInteger(ex.regainCap)||Number.isInteger(ex.setCap)||Number.isInteger(ex.returnStep))capped.add(id);
  for(const {e} of rows){if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1){const x={timeline:t.p.athleteId,week:w,id:e.id,mode:e.load.mode,sets:e.sets,largestExecuted:largest[e.id]};if(capped.has(e.id)){out.jumpsAboveLargestPlusOne.capped++;if(out.examples.B.length<6)out.examples.B.push(x);}else{out.jumpsAboveLargestPlusOne.uncovered++;out.jumpsAboveLargestPlusOne.uncoveredByExercise[e.id+'/'+e.load.mode]=(out.jumpsAboveLargestPlusOne.uncoveredByExercise[e.id+'/'+e.load.mode]??0)+1;if(out.examples.uncovered.length<4)out.examples.uncovered.push(x);}}}
  weekly(t,w);if(raise&&w===from+1)ev(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
  for(const {e} of rows)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  const next=t.p.stateTrace[w+1].strength.exercises;
  for(const [id,ex] of Object.entries(st)){
   const mine=rows.filter(x=>x.e.id===id);if(!mine.length)continue;const last=mine.at(-1).e,trimmed=Number.isInteger(last.exposure?.baseSets)&&last.sets<last.exposure.baseSets&&last.exposure.phasedSets===last.exposure.baseSets;
   for(const cap of ['regainCap','setCap'])if(Number.isInteger(ex[cap])&&trimmed&&!Number.isInteger(ex.returnStep)){out.cap.trimmedWeeksWithCap++;if(!(Number.isInteger(next[id]?.[cap])&&next[id][cap]<=ex[cap])){out.cap.riseOrEndAfterTrimmed++;if(out.examples.A.length<6)out.examples.A.push({timeline:t.p.athleteId,week:w,id,cap,before:ex[cap],after:next[id]?.[cap]??null,lastRow:`${last.sets}/${last.exposure.phasedSets}/${last.exposure.baseSets}`});}}
  }
 }
}
console.log(JSON.stringify(out,null,1));
