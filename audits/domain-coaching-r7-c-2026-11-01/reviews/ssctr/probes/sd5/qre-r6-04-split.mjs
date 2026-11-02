// SSCTR semantic re-disposition (R7-C Phase 5), probe Q4: the QRE-R6-04 fixture (test/r6-engineering-fixes.test.mjs:94) decision by decision,
// to word a testable UNREPORTED assertion (coordinator fact of 2026-11-02 checked here, not assumed). The fixture's intake, the simulator's
// weekly loop reproduced by hand (end-of-week review, strength executed, proposals adopted, ledger and reference state chained), three paths:
//  UNREPORTED            the runs carry no report (simulateProgram with missed RUN, exactly);
//  KNOWN_MISS            every run reported not done at its week's review;
//  ANSWERED_KNOWN_STOP   unreported until the first UNREPORTED_TRAINING question, answered on day 2 of the next week (every elapsed run not done),
//                        then weekly not-done reports.
// Per decision: status, action, question, validity, the intense run sessions (quality, race touch, strides) dated after the decision in the plan in
// force, whether a no-proposal ASK leaves stored run doses ahead undecided, and easyWeeksDone. Also on R7B2-FREEZE-1 for UNREPORTED and KNOWN_MISS.
// Read-only (R7B2-FREEZE-1 extracted to a temporary directory); prints JSON.
import {REPO,R7B2_FREEZE_1,extract,load} from '../../../../probes/phase3-lib.mjs';
const NOW=await load(REPO),x=extract(R7B2_FREEZE_1),B2=await load(x.root);
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
// The QRE-R6-04 intake, as test/r6-engineering-fixes.test.mjs builds it.
const INTAKE={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,
 athlete:{id:'t-gate',ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-07'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],
  knownExercises:[SQUAT,{id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]},
 schedule:{runDays:[1,3,5,6],strengthDays:[2],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80}};
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const at=(s)=>`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`;
const done=(p,s,n)=>{const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},rir:e.rir}))}));return {eventId:`q4-${s.id}-${n}`,athleteId:p.athleteId,sessionId:s.id,observedAt:at(s),actual:a,response:{...OK}};};
const notDone=(p,s)=>({eventId:`q4-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:at(s),actual:{completed:false},response:{}});
const live=s=>s.prescription&&!['REST_BY_DESIGN'].includes(s.role)&&s.status!=='SKIPPED';
const intense=s=>s.prescription&&(s.role==='QUALITY'||s.role==='RACE_TOUCH'||!!s.prescription.strides);
function run(R,path){
 const g=R.generateProgram(INTAKE,R.opts);let p=g.program,ledger=[],ref=null,n=0,asked=false,answeredAt=null;const rows=[];
 const decide=(w,day,kind,observations)=>{const d=addDays(p.weeks[w].startDate,day);const rv={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T21:00:00Z`,weekIndex:w,event:{id:`q4-${kind}-w${w}-d${day}`,kind},eligibility:elig(d),observations,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})};
  const r=R.evaluateProgram(p,rv,R.opts);ledger=r.actualLedger??ledger;ref=r.referenceState??ref;const before=p;if(r.proposal)p=r.proposal;
  const ahead=p.weeks.flatMap(x=>x.sessions).filter(s=>s.date>d&&intense(s));
  const nextWeek=p.weeks[w+1]?.sessions.filter(s=>intense(s)).length??0,future=R.hash(p.weeks.slice(w+1).map(x=>x.sessions.map(s=>[s.id,s.prescription??null])));rows.push({w,day,nextWeekIntense:nextWeek,futureHash:future.slice(0,12),proposalHash:r.proposal?.hash?.slice(0,12)??null,status:r.status,action:r.action??null,question:r.question?.kind??null,validity:r.planValidity?.status??null,proposal:!!r.proposal,intenseAhead:ahead.length,intenseAheadWeeks:[...new Set(ahead.map(s=>s.weekIndex))],storedUndecidedLeftValid:r.question?.kind==='UNREPORTED_TRAINING'&&!r.proposal&&r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',easyWeeksDoneMax:Math.max(...p.stateTrace.map(st=>st.run.easyWeeksDone??0))});
  return r;};
 for(let w=0;w<p.weeks.length;w++){
  const wk=p.weeks[w],strength=wk.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>done(p,s,n++));
  if(path==='ANSWERED_KNOWN_STOP'&&asked&&!answeredAt){
   // The answer on day 2 of this week: every run dated before day 2 that has no report, not done.
   const cut=addDays(wk.startDate,2),reported=new Set(ledger.map(o=>o.sessionId));
   const facts=p.weeks.slice(0,w+1).flatMap(x=>x.sessions).filter(s=>live(s)&&s.sport==='RUN'&&s.date<cut&&!reported.has(s.id)).map(s=>notDone(p,s));
   decide(w,2,'WEEKLY_REVIEW',facts);answeredAt=w;
  }
  const runs=p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'),reported=new Set(ledger.map(o=>o.sessionId));
  const runObs=path==='KNOWN_MISS'||path==='ANSWERED_KNOWN_STOP'&&answeredAt!==null?runs.filter(s=>!reported.has(s.id)).map(s=>notDone(p,s)):[];
  const r=decide(w,6,'WEEKLY_REVIEW',[...p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>done(p,s,n++)),...runObs]);
  if(r.question?.kind==='UNREPORTED_TRAINING')asked=true;
 }
 const finalIntense=p.weeks.flatMap(x=>x.sessions).filter(s=>s.weekIndex>0&&intense(s)).map(s=>s.id);
 return {rows,finalIntenseAfterWeek0:finalIntense,easyWeeksDoneAlwaysZero:p.stateTrace.every(st=>(st.run.easyWeeksDone??0)===0),runLedger:ledger.filter(o=>p.weeks.flatMap(x=>x.sessions).find(s=>s.id===o.sessionId)?.sport==='RUN').map(o=>o.actual?.completed===false?'ND':'DONE').reduce((m,k)=>(m[k]=(m[k]??0)+1,m),{})};
}
const cmp=(a,b,from)=>a.rows.filter(r=>r.w>=from).map(r=>{const k=b.rows.find(y=>y.w===r.w&&y.day===6);return r.day===6?[r.w,r.futureHash===k.futureHash]:null;}).filter(Boolean);
const out={check:'SSCTR-SD5-QRE-R6-04-SPLIT',baseline:x.commit,R7C:{},B2:{}};
for(const path of ['UNREPORTED','KNOWN_MISS','ANSWERED_KNOWN_STOP'])out.R7C[path]=run(NOW,path);
for(const path of ['UNREPORTED','KNOWN_MISS'])out.B2[path]=run(B2,path);
out.compare={UNREPORTED_vs_KNOWN_MISS_futureEqual:cmp(out.R7C.UNREPORTED,out.R7C.KNOWN_MISS,0),ANSWERED_vs_KNOWN_MISS_futureEqual:cmp(out.R7C.ANSWERED_KNOWN_STOP,out.R7C.KNOWN_MISS,0),R7C_vs_B2_KNOWN_MISS_futureEqual:cmp(out.R7C.KNOWN_MISS,out.B2.KNOWN_MISS,0)};
// The simulator exactly as the test calls it (UNREPORTED), for the stored final program.
const sim=NOW.simulateProgram(INTAKE,{default:{missed:[{sport:'RUN'}]}},NOW.opts);
out.R7C.simulatorExact={finalIntenseAfterWeek0:sim.finalProgram.weeks.flatMap(w=>w.sessions).filter(s=>s.weekIndex>0&&intense(s)).map(s=>s.id),decisions:sim.decisions.map(d=>`${d.weekIndex}:${d.status}/${d.action}`)};
x.cleanup();
console.log(JSON.stringify(out,null,1));
