// SSCTR R7A2-SSCTR-r1 trace (own instrument): the SD short-return timeline of ssctr-r7a2-items.mjs (re-establishment Monday of week 7, break
// Wednesday + 7 days, target met), with each week's phase, rows and state of the re-established exercises, and the same timeline without the
// break as a control. Read-only runtime use of the live tree, synthetic data, DEV_TEST_ONLY authority. Prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=id=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:KNOWN,exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`tr-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`tr-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED';
const step=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const IDS=['back-squat','db-row','db-bench-press'];
const view=(t,w,from)=>({week:w,phase:t.p.weeks[w].phase??t.p.phases?.[w]??null,rows:t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`d${s.day} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.exposure?.kind} phase=${e.exposure?.phase} base=${e.exposure?.baseSets} phased=${e.exposure?.phasedSets} normal=${e.exposure?.normalSets}`)),
 stateStart:Object.fromEntries(IDS.map(id=>{const x=t.p.stateTrace[w]?.strength?.exercises?.[id];return [id,x?Object.fromEntries(['sets','priorSets','regainCap','setCap','setCeiling','blocksDone','lastExecutedSets','returnStep','mode'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])):null];}))});
const out={probe:'R7A2-SSCTR-r1-TRACE-SD',runtime:'live tree (check the digest)',blocks:null,shortReturn:[],noBreak:[]};
for(const brk of [true,false]){
 const t={p:R.generateProgram(intake('tr-sd-'+brk),opts).program,ledger:[]};out.blocks=t.p.blocks?.map(b=>`${b.family}:${b.startWeek}-${b.endWeekExclusive}`);
 for(let w=0;w<2;w++)weekly(t,w);for(let w=2;w<7;w++)weekly(t,w,s=>s.sport!=='STRENGTH');
 const w=7,d0=t.p.weeks[w].startDate,bStart=addDays(d0,2),bEnd=addDays(bStart,6),back=addDays(bEnd,1);
 if(brk){
  step(t,at(t.p,w,1,'20:00:00',{kind:'PARTIAL_SESSION',observations:t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.day===0&&live(s)).map(s=>obs(t.p,s))}));
  weekly(t,w,s=>s.date<bStart&&s.sport!=='STRENGTH');
  step(t,at(t.p,8,2,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:7,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel'}}));
  for(let x=8;x<14;x++){out.shortReturn.push(view(t,x,x===8?back:null));weekly(t,x,s=>s.date>=back);}
 }else{for(let x=7;x<14;x++){out.noBreak.push(view(t,x));weekly(t,x);}}
}
console.log(JSON.stringify(out,null,1));
