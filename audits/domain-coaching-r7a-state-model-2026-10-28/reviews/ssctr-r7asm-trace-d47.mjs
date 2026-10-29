// SSCTR R7ASM-SSCTR-r1 trace of the D47 statement after a restart applied by a review (own; prints only). Re-types restart-s2-d30 and
// restart-s3-d30 of my round-12 instrument's section V (unchanged in substance: 10K at week 10, EASY athlete, weeks executed and reviewed before
// the break (strength days 0 and 4, 50 minutes, as the instrument's intake defaults), a 30-day WORK break reported by RETURN_AFTER_PAUSE, every later week executed and reviewed except the sessions dated inside the pause)
// on the runtime SSCTR_CC selects (default: live). Per week from the restart: the stored run state's mode, longest continuous run and planned
// summary (stateTrace), the HistoricalState run atoms at that week's first instant (when the runtime exports historicalStateOf), the run sessions
// with their status, and the D47 item's stated minutes in the program. Read-only use; synthetic data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),A=await load('src/r6-adaptation.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=(id,raceWeek)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',raceWeek*7+5)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:50,longRunDay:6,longRunMinutes:100}});
let n=0;
const rvAt=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:'ssctr-d47-'+w+'-'+(x.kind??'W')+'-'+(n++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
const obs=(p,s)=>{const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:'ssctr-d47-o-'+(n++),athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:a,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};};
const execUntil=(p,from,to,ledger=[],skip=()=>false)=>{for(let w=from;w<to;w++){const r=evaluateProgram(p,rvAt(p,w,6,{observations:p.weeks[w].sessions.filter(x=>x.prescription&&!skip(x)).map(x=>obs(p,x)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}return {p,ledger};};
const out={probe:'R7ASM-SSCTR-r1-TRACE-D47',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (HISTORICAL-PROJECTION-FREEZE-1; check the digest)',cases:{}};
for(const s of [2,3]){
 const d=30,raceWeek=10,label=`restart-s${s}-d${d}`,o=out.cases[label]={weeks:[]};
 let p=generateProgram(intake('ssctr-d47-'+label,raceWeek),opts).program;let {p:p1,ledger}=execUntil(p,0,s);
 const reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7,pauseFrom=p1.weeks[s].startDate,after=addDays(p1.weeks[rw].startDate,rday);
 const r0=evaluateProgram(p1,rvAt(p1,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'WORK',nonclinical:true},actualLedger:ledger}),opts);
 const P=r0.proposal,ew=P.decisions.at(-1).fromWeek,stale=x=>x.date>=pauseFrom&&x.date<=after;o.return={result:`${r0.status}/${r0.action}`,entryWeek:ew,reviewWeek:rw,reviewDay:rday,pauseFrom,after};
 let Q=P;ledger=r0.actualLedger;
 for(let w=ew;w<=raceWeek;w++){
  const st=Q.stateTrace[w].run,hs=typeof A.historicalStateOf==='function'?A.historicalStateOf(Q,{asOf:Q.weeks[w].startDate+'T03:00:00Z',actualLedger:ledger},opts):null,item=(Q.negotiation??[]).find(x=>x.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
  o.weeks.push({week:w,phase:Q.phases.phases[w],stored:{mode:st.mode,restart:st.restart??null,longestContinuous:st.longestContinuous??null,planned:st.planned??null},history:hs?{mode:hs.run.mode,longestContinuous:hs.run.longestContinuous,basis:hs.basis}:'not exported',
   runs:Q.weeks[w].sessions.filter(x=>x.sport==='RUN'&&x.prescription).map(x=>`${x.date} ${x.role} ${x.prescription.durationMinutes}${stale(x)?' (inside the pause: never executed)':''}`),statedNow:item?.longestContinuousRunMinutes??null});
  if(w<raceWeek){const r=evaluateProgram(Q,rvAt(Q,w,6,{observations:Q.weeks[w].sessions.filter(x=>x.prescription&&!stale(x)).map(x=>obs(Q,x)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)Q=r.proposal;}
 }
}
console.log(JSON.stringify(out,null,1));
