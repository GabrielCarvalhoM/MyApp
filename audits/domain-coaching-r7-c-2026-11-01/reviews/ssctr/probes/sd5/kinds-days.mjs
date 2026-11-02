// SSCTR semantic re-disposition (R7-C Phase 5), probe KD: SSCTR-SD-01 beyond the kinds and days the Phase 5 tests and the coordinator's grid
// exercise (r1 couldNotVerify: "event-week, return or strength-only decision kinds beyond those probed"). Independent of the coordinator's
// predicates. Timelines as in the Phase 5 tests (A: the gap's facts at the review before the answer week; B: that review asks, the facts arrive
// with a decision in the answer week), for GEN answer weeks 5, 7, 9 and R10K 7, 9 (specific), 10 (taper), 11 (race week); gap from the start
// (g=0) and, for week 7 / 10, after two executed weeks (g=2); gap weeks reviewed (RV) or not (NR); answers MISS (every gap run not done) and
// EXEC (done as prescribed); every handler kind; days 0, 1, 3, 4, 6. Per cell, on B:
//  V  validity: VALID exactly when no question and no pending reference state;
//  H  history: sessions dated before the answer day keep their prescriptions;
//  S  MISS and VALID: every non-race run on or after the answer day in the answer week is at or below the entry, with no quality, race touch or
//     strides; every run of the next week at or below entry + step with no quality or touch;
//  M  B's plan in force from the answer day equals A's after the same decision (same kind, same targets), and B's validity and question equal A's.
// Cells where M fails are classified, not counted blindly: ELAPSED (B asks only about answer-week sessions elapsed before the answer), BOTH_HOLD,
// and anything else is listed. Read-only on the working tree; prints JSON.
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,{hash}=rt,POL=rt.opts.authority.policy.operational,ENTRY=POL.return.entryRunMinutes,STEP=POL.run.singleRunCeiling.stepMinutes;
const GEN={id:'sd5-kd-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const R10K={id:'sd5-kd-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const notDone=(p,s)=>({eventId:`sd5-kd-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
const report=(p,from,to,V)=>runSessions(p,from,to).map(s=>V==='MISS'?notDone(p,s):H.obs(p,s));
function step(t,w,x={}){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
function fork(o,{g,b,mode,V}){
 const t={p:H.program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
 const a=step(A,b-1,{observations:[...strength,...facts]}),q=step(B,b-1,{observations:strength});
 return {A,B,a,q,facts};
}
const day=(p,b,d)=>H.addDays(p.weeks[b].startDate,d);
const elapsedOf=(p,b,d)=>p.weeks[b].sessions.filter(s=>H.live(s)&&s.date<day(p,b,d));
const lastStrength=(p,b)=>p.weeks[b-1].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').at(-1);
// Each kind returns the decision's extra fields, or null when the kind does not apply to the cell.
const KINDS={
 WEEKLY_REVIEW:()=>({}),
 RECOVERED:()=>({kind:'RECOVERED'}),
 SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
 LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
 UNAVAILABLE_STRENGTH_DAY:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH'&&x.date>day(p,b,d));return s?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[s.date]}}:null;},
 UNAVAILABLE_RUN_DAY:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='RUN'&&x.role!=='RACE'&&x.date>day(p,b,d));return s?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[s.date]}}:null;},
 EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
 GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 EXERCISE_SUBSTITUTION:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH'&&x.date>=day(p,b,d));return s?{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:s.prescription.exercises[0].id,reason:'SKILL_MISMATCH'}}:null;},
 MISSED_SESSION:(p,b,d)=>{const s=elapsedOf(p,b,d).find(x=>x.sport==='STRENGTH');return s?{kind:'MISSED_SESSION',targetSessionId:s.id}:null;},
 PARTIAL_SESSION:(p,b,d)=>{const s=elapsedOf(p,b,d).find(x=>x.sport==='STRENGTH');return s?{kind:'PARTIAL_SESSION',extraObs:[H.obs(p,s,{minutes:Math.max(5,Math.round(s.prescription.durationMinutes/2)),actual:{completed:false,minutes:Math.max(5,Math.round(s.prescription.durationMinutes/2))}})]}:null;},
 UNDERPERFORMANCE:(p,b)=>({kind:'UNDERPERFORMANCE',targetSessionId:lastStrength(p,b).id}),
 PROGRESSION_NOT_TOLERATED:(p,b)=>({kind:'PROGRESSION_NOT_TOLERATED',targetSessionId:lastStrength(p,b).id}),
 OVERPERFORMANCE:(p,b)=>({kind:'OVERPERFORMANCE',targetSessionId:lastStrength(p,b).id}),
 PROGRESSION_TOO_EASY:(p,b)=>({kind:'PROGRESSION_TOO_EASY',targetSessionId:lastStrength(p,b).id}),
 DOUBLE_CONFLICT:()=>({kind:'DOUBLE_CONFLICT',changes:{strengthTurn:'AM'}}),
 EVENT_DATE_CHANGE:(p)=>p.goal?.run?.event?{kind:'EVENT_DATE_CHANGE',changes:{eventDate:H.addDays(p.goal.run.event.date,-7)}}:null,
 EVENT_WEEK_CONFLICT:(p,b,d)=>{if(!p.goal?.run?.event||b<10)return null;const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='RUN'&&x.role!=='RACE'&&x.date>day(p,b,d));return s?{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[s.date]}}:null;},
 RETURN_SHORT:(p,b,d)=>d<3?null:{kind:'RETURN_AFTER_PAUSE',interruption:{startDate:day(p,b,0),endDate:day(p,b,d-1),days:d,reasonCategory:'WORK',reason:'work',nonclinical:true}}
};
const fromDay=(P,b,d)=>P.weeks.slice(b,b+(d===0?2:1)).flatMap(x=>x.sessions).filter(s=>s.date>=day(P,b,d)).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);
const past=(P,b,d)=>hash(P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day(P,b,d)).map(s=>[s.id,s.prescription??null]));
const CONFIGS=[['GEN',GEN,5,0],['GEN',GEN,7,0],['GEN',GEN,7,2],['GEN',GEN,9,0],['R10K',R10K,7,0],['R10K',R10K,9,0],['R10K',R10K,10,0],['R10K',R10K,10,2],['R10K',R10K,11,0]];
const out={check:'SSCTR-SD5-KINDS-DAYS',entry:ENTRY,cells:0,skipped:0,byKind:{},violations:{V:[],H:[],S:[]},mismatch:{ELAPSED:0,BOTH_HOLD:0,other:[]},errors:[]};
for(const [name,o,b,g] of CONFIGS)for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC']){
 const f=fork(o,{g,b,mode,V});
 if(f.q.question?.kind!=='UNREPORTED_TRAINING'){out.errors.push(`${name} b=${b} g=${g} ${mode} ${V}: the review before the answer week did not ask (${f.q.status})`);continue;}
 for(const [kind,make] of Object.entries(KINDS))for(const d of [0,1,3,4,6]){
  const xb=make(f.B.p,b,d),xa=make(f.A.p,b,d);if(!xb||!xa){out.skipped++;continue;}
  const cell=`${name} b=${b} g=${g} ${mode} ${V} ${kind} day ${d}`;out.cells++;out.byKind[kind]=(out.byKind[kind]??0)+1;
  const {extraObs=[],...rb_}=xb,{extraObs:ea=[],...ra_}=xa;let rb,ra;
  try{rb=step(copy(f.B),b,{day:d,hour:'07:00:00',...rb_,observations:[...f.facts,...extraObs]});ra=step(copy(f.A),b,{day:d,hour:'07:00:00',...ra_,observations:ea});}catch(e){out.errors.push(cell+': '+String(e).slice(0,160));continue;}
  const PB=rb.proposal??f.B.p,PA=ra.proposal??f.A.p,valid=rb.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
  if(valid!==(!rb.question&&!rb.referenceState?.pending))out.violations.V.push(`${cell}: ${rb.status} ${rb.planValidity?.status} q=${rb.question?.kind??'-'} pending=${rb.referenceState?.pending?.status??'-'}`);
  if(past(PB,b,d)!==past(f.B.p,b,d))out.violations.H.push(cell);
  if(V==='MISS'&&valid){
   const ahead=PB.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.role!=='RACE'&&s.date>=day(PB,b,d));
   const bad=ahead.filter(s=>s.prescription.durationMinutes>ENTRY||['QUALITY','RACE_TOUCH'].includes(s.role)||s.prescription.strides);
   const next=b+1<PB.weeks.length?PB.weeks[b+1].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.role!=='RACE'):[];
   const badNext=next.filter(s=>s.prescription.durationMinutes>ENTRY+STEP||['QUALITY','RACE_TOUCH'].includes(s.role));
   if(bad.length||badNext.length)out.violations.S.push(`${cell}: ${rb.status}/${rb.action} week b ${bad.map(s=>s.role+':'+s.prescription.durationMinutes+(s.prescription.strides?'+S':'')).join('/')} next ${badNext.map(s=>s.role+':'+s.prescription.durationMinutes).join('/')}`);
  }
  const same=JSON.stringify(fromDay(PB,b,d))===JSON.stringify(fromDay(PA,b,d))&&rb.planValidity?.status===ra.planValidity?.status&&JSON.stringify(rb.question??null)===JSON.stringify(ra.question??null);
  if(!same){
   const dd=day(f.B.p,b,d),ids=rb.question?.unreported?.sessionIds??[];
   if(rb.status==='HOLD'&&ra.status==='HOLD')out.mismatch.BOTH_HOLD++;
   else if(!ra.question&&ids.length&&ids.every(id=>{const s=f.B.p.weeks[b].sessions.find(x=>x.id===id);return s&&s.date<dd;}))out.mismatch.ELAPSED++;
   else out.mismatch.other.push(`${cell}: B ${rb.status}/${rb.action}/${rb.planValidity?.status}/${rb.question?.kind??'-'} A ${ra.status}/${ra.action}/${ra.planValidity?.status}/${ra.question?.kind??'-'} plan ${JSON.stringify(fromDay(PB,b,d))===JSON.stringify(fromDay(PA,b,d))?'same':'differs'}`);
  }
 }
}
out.summary={cells:out.cells,skipped:out.skipped,V:out.violations.V.length,H:out.violations.H.length,S:out.violations.S.length,mismatchElapsed:out.mismatch.ELAPSED,mismatchBothHold:out.mismatch.BOTH_HOLD,mismatchOther:out.mismatch.other.length,errors:out.errors.length};
console.log(JSON.stringify(out,null,1));
