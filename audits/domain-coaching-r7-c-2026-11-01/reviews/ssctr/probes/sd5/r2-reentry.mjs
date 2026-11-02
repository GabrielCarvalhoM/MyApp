// SSCTR semantic re-disposition (R7-C Phase 5), probe R2: what an answered known stop leads to once the athlete trains again.
// Same facts, three report timings, plus the same stop declared as a break:
//  A*  every gap week reviewed with its runs reported not done (the known stop reported strictly on time);
//  A   the gap's facts at the review before the answer week;
//  B   the review before the answer week asks; the answer (every gap run not done) arrives on day 0 of week 7 in a plain review;
//  D   no reports, the review before week 7 asks; on day 0 of week 7 the athlete declares the stop as a nonclinical break (RETURN_AFTER_PAUSE).
// From week 7 on, every live session of each week is executed as prescribed and reviewed at the end of the week. Per week: the run sessions,
// the run state, and the single-run ceiling (longest completed run in the 30 days before each session + 5, or the entry with none) checked on
// every run prescribed for weeks 7..11 from the plan in force at the start of that week. Read-only on the working tree; prints JSON.
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,POL=rt.opts.authority.policy.operational,ENTRY=POL.return.entryRunMinutes,CEIL=POL.run.singleRunCeiling;
const GEN={id:'sd5-r2-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const R10K={id:'sd5-r2-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const notDone=(p,s)=>({eventId:`sd5-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
function step(t,w,x={}){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const execWeek=(t,w)=>step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
const runRow=s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.family&&!['EASY','LONG'].includes(s.prescription.family)?':'+s.prescription.family:''}${s.prescription.work?':'+s.prescription.work.repetitions+'x'+s.prescription.work.workMinutes:''}${s.prescription.strides?':S'+s.prescription.strides.repetitions:''}`;
const runsOf=(P,w)=>P.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(runRow).join(' / ');
const st=(P,w)=>{const r=P.stateTrace?.[w]?.run;return r?{mode:r.mode,long:r.long,easy:r.easy,qualityStep:r.qualityStep,easyWeeksDone:r.easyWeeksDone,qualityDone:r.qualityDone,achievedLong:r.achieved?.long??null}:null;};
/** The single-run ceiling on the completed-work ledger: for each run prescribed in week w (plan in force at the start of week w), the longest
 * completed run in the windowDays before the session date + stepMinutes, or the entry with none. Returns the runs above it. */
function ceilingBreaches(t,w){
 const byId=new Map(t.p.weeks.flatMap(x=>x.sessions).map(s=>[s.id,s]));
 const done=t.ledger.filter(o=>o.actual?.completed!==false&&byId.get(o.sessionId)?.sport==='RUN').map(o=>({date:o.observedAt.slice(0,10),min:o.actual?.minutes??0}));
 const out=[];
 for(const s of t.p.weeks[w].sessions.filter(x=>H.live(x)&&x.sport==='RUN'&&x.role!=='RACE')){
  const win=done.filter(d=>d.date<s.date&&(Date.parse(s.date)-Date.parse(d.date))/864e5<=CEIL.windowDays),ref=win.length?Math.max(...win.map(d=>d.min))+CEIL.stepMinutes:ENTRY;
  if(s.prescription.durationMinutes>ref)out.push(`${s.id} ${s.prescription.durationMinutes}>${ref}`);
 }
 return out;
}
function timeline(kind,o,g){
 const t={p:H.program(o),ledger:[],ref:null},b=7,log={};
 for(let w=0;w<g;w++)execWeek(t,w);
 if(kind==='ASTAR'){for(let w=g;w<b;w++)step(t,w,{observations:[...strengthOf(t.p,w),...runSessions(t.p,w,w+1).map(s=>notDone(t.p,s))]});}
 else if(kind==='D'){
  // Nothing reported or reviewed in the gap; the review before week 7 asks; day 0 of week 7: the stop declared as a break, then strength history.
  const q=step(t,b-1,{});log.question=q.question?.kind??q.status;
  const start=t.p.weeks[g].startDate,end=H.addDays(t.p.weeks[b].startDate,-1);
  const r=step(t,b,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,reasonCategory:'WORK',reason:'work',nonclinical:true}});
  log.answer=`${r.status}/${r.action}/${r.planValidity?.status}`;log.interruptionClass=r.proposal?.decisions?.at(-1)?.interruption?.class??null;
 } else {
  for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
  const facts=runSessions(t.p,g,b).map(s=>notDone(t.p,s));
  if(kind==='A')log.answer=(r=>`${r.status}/${r.action}`)(step(t,b-1,{observations:[...strengthOf(t.p,b-1),...facts]}));
  else{const q=step(t,b-1,{observations:strengthOf(t.p,b-1)});log.question=q.question?.kind??q.status;const r=step(t,b,{day:0,hour:'07:00:00',observations:facts});log.answer=`${r.status}/${r.action}/${r.planValidity?.status}`;}
 }
 log.weeks={};
 for(let w=b;w<12;w++){
  const plan=runsOf(t.p,w),state=st(t.p,w),breaches=ceilingBreaches(t,w),r=execWeek(t,w);
  log.weeks[w]={phase:t.p.weeks[w].phase,runsInForce:plan,stateAtWeekStart:state,ceilingBreaches:breaches,review:`${r.status}/${r.action??''}${r.question?'/'+r.question.kind:''}`};
 }
 log.qualityWeeks=Object.entries(log.weeks).filter(([,x])=>/QUALITY|RACE_TOUCH|:S\d/.test(x.runsInForce)).map(([w])=>Number(w));
 return log;
}
const out={check:'SSCTR-SD5-R2-REENTRY',entry:ENTRY,ceiling:CEIL,qualityRequiresEstablishedEasyWeeks:POL.run.qualityRequiresEstablishedEasyWeeks,cases:{}};
for(const [name,o] of [['GEN',GEN],['R10K',R10K]])for(const g of [0,2]){
 const c={};for(const k of ['ASTAR','A','B','D'])c[k]=timeline(k,o,g);
 c.B_equals_ASTAR_weeks=Object.keys(c.B.weeks).filter(w=>c.B.weeks[w].runsInForce===c.ASTAR.weeks[w].runsInForce).map(Number);
 c.B_equals_A_weeks=Object.keys(c.B.weeks).filter(w=>c.B.weeks[w].runsInForce===c.A.weeks[w].runsInForce).map(Number);
 out.cases[`${name} g=${g}`]=c;
}
console.log(JSON.stringify(out,null,1));
