// R7-C Phase 5: adversarial grid for SSCTR-SD-01/02/03 on the working tree (the G01 answer grid). Read-only; prints JSON.
//
// A, the answer grid. Programs GEN and R10K (build week 7; R10K also its taper and race week), gap from the start (g=0) or after two executed weeks
// (g=2), gap weeks reviewed with strength reported and the runs unreported (RV) or neither reported nor reviewed (NR), and the athlete's answer
// V: MISS (every gap run not done), EXEC (every gap run done as prescribed), MIXED (long runs done, the rest not done), ADVERSE (done, the long runs
// followed by an adverse response) or PARTIAL (half the gap runs not done, the rest still unreported). A has the gap's facts at the review before
// the answer week; B has them arrive with a decision of every kind on day 0, 2 or 5 of that week. Properties, per cell:
//  V1 validity: VALID exactly when nothing is pending (no question, no pending reference state); ASK and HOLD are never VALID.
//  H1 history: the sessions dated before the answer day keep their prescriptions.
//  S1 no stale dose: after a known stop (MISS), no run ahead in the answer week exceeds the reviewed entry and none is quality or a race touch.
//  M1 metamorphic, uniform evidence (MISS, EXEC): B leaves A's plan in force from the answer day on (week b, and week b+1 when nothing of week b
//     had elapsed), with the same validity and the same question, if any. Classified apart (not violations): a decision both sides refuse with
//     HOLD (the pre-existing last-week schedule change exception), and, after day 0, a question in B only about sessions that elapsed in the
//     answer week before the answer (history stored before the answer).
//  M2 mixed evidence: every run B leaves ahead in the answer week is no longer than A's run in the same session.
//  E1 adverse evidence: the adverse responses change the plan against all done (EXEC), and never lengthen the long run.
//  Q1 partial: B asks, plans nothing, and the question names only elapsed run sessions with no report.
// C, clinical first: the answer with a pain flag (any kind), with a held signal, or as a substitution with pain: CLINICAL_HUMAN_REQUIRED, no
//  proposal, no question, no signal carried; the substitution still records the answer.
// S, signals: a fatigue report held by the question (day 0) and answered by a plain review (day 2), and a performance report held at the end of
//  the week and answered an hour later, leave A's plan in force (the same report with the facts on time); a held signal never crosses its week.
// I, interruption: a declared break answering mid-week re-enters by the return's recipe, with no question and no stored dose ahead.
import {REPO,load} from './phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,{hash}=rt;
const ENTRY=rt.opts.authority.policy.operational.return.entryRunMinutes;
const GEN={id:'p5-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const R10K={id:'p5-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const notDone=(p,s)=>({eventId:`p5-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
const report=(p,from,to,V)=>runSessions(p,from,to).flatMap((s,i)=>V==='PARTIAL'?(i%2===0?[notDone(p,s)]:[]):[V==='MISS'||V==='MIXED'&&s.role!=='LONG'?notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{})]);
function step(t,w,x={}){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
function fork(o,{g,b,mode,V}){
 const t={p:H.program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),known=V==='PARTIAL'?report(t.p,g,b,'MISS'):facts,A=copy(t),B=copy(t);
 const a=step(A,b-1,{observations:[...strength,...known]}),q=step(B,b-1,{observations:strength});
 return {A,B,a,q,facts};
}
const fromDay=(P,b,d,n=d===0?2:1)=>{const day=H.addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+n).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
const runsAhead=(P,b,d)=>{const day=H.addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=day);};
const past=(P,b,d)=>{const day=H.addDays(P.weeks[b].startDate,d);return hash(P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>[s.id,s.prescription??null]));};
const inForce=(t,r)=>r.proposal??t.p;
const pendingOf=r=>['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(r.status)||!!r.question;
const KINDS={
 WEEKLY_REVIEW:()=>({}),
 SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
 LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
 UNAVAILABLE_STRENGTH_DAY:(p,b)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[H.addDays(p.weeks[b].startDate,4)]}}),
 EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
 GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})
};
const EVENT_KINDS=['WEEKLY_REVIEW','SCHEDULE_CHANGE','SYSTEMIC_FATIGUE'];
const out={check:'R7C-P5-ADVERSARIAL-SD',runtime:'working tree',entry:ENTRY,A:{cells:0,byV:{},violations:[],classified:[]},C:{cases:0,violations:[]},S:{cases:0,violations:[]},I:{cases:0,violations:[]}};
const fail=(grid,cell,prop,detail)=>out[grid].violations.push({cell,property:prop,detail});
// ---------- A ----------
for(const [name,o,weeks] of [['GEN',GEN,[7]],['R10K',R10K,[7,10,11]]])for(const b of weeks)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC','MIXED','ADVERSE','PARTIAL']){
 const f=fork(o,{g,b,mode,V}),exec=V==='ADVERSE'?fork(o,{g,b,mode,V:'EXEC'}):null,kinds=b===7?Object.keys(KINDS):EVENT_KINDS;
 for(const kind of kinds)for(const d of [0,2,5]){
  const x=KINDS[kind](f.B.p,b),cell=`${name} b=${b} g=${g} ${mode} ${V} ${kind} day ${d}`;out.A.cells++;out.A.byV[V]=(out.A.byV[V]??0)+1;
  let rb,ra;
  try{rb=step(copy(f.B),b,{day:d,hour:'07:00:00',...x,observations:f.facts});ra=step(copy(f.A),b,{day:d,hour:'07:00:00',...KINDS[kind](f.A.p,b)});}catch(e){fail('A',cell,'ERROR',String(e).slice(0,200));continue;}
  const P=inForce(f.B,rb),valid=rb.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
  if(valid===pendingOf(rb)||valid!==!rb.referenceState?.pending)fail('A',cell,'V1',`${rb.status} ${rb.planValidity?.status} question=${rb.question?.kind??null} pending=${rb.referenceState?.pending?.status??null}`);
  if(past(P,b,d)!==past(f.B.p,b,d))fail('A',cell,'H1','a session before the answer changed');
  if(V==='MISS'&&valid){const bad=runsAhead(P,b,d).filter(s=>s.role!=='RACE'&&(s.prescription.durationMinutes>ENTRY||['QUALITY','RACE_TOUCH'].includes(s.role)));if(bad.length)fail('A',cell,'S1',bad.map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/'));}
  if(['MISS','EXEC'].includes(V)){
   // Classified apart, never counted as SD violations: (a) a decision both runtimes refuse with HOLD (the pre-existing last-week schedule change
   // exception, identical on B.2): B's stored doses stay but are never valid (V1 checks it); (b) after day 0, a question in B about sessions that
   // elapsed in the answer week before the answer: they are history with the prescription stored then, which can decide what A's do not.
   if(rb.status==='HOLD'&&ra.status==='HOLD'){out.A.classified.push({cell,class:'PREEXISTING_HOLD',reason:String(rb.reason).slice(0,120)});continue;}
   const day=H.addDays(f.B.p.weeks[b].startDate,d),elapsedOnly=q=>!!q&&(q.unreported?.sessionIds??[]).length>0&&q.unreported.sessionIds.every(id=>{const s=f.B.p.weeks[b].sessions.find(x=>x.id===id);return s&&s.date<day;});
   if(JSON.stringify(fromDay(P,b,d))!==JSON.stringify(fromDay(inForce(f.A,ra),b,d)))fail('A',cell,'M1','plan in force differs from A');
   if(rb.planValidity?.status!==ra.planValidity?.status||JSON.stringify(rb.question??null)!==JSON.stringify(ra.question??null)){
    if(d>0&&!ra.question&&elapsedOnly(rb.question))out.A.classified.push({cell,class:'ELAPSED_HISTORY_QUESTION',sessions:rb.question.unreported.sessionIds});
    else fail('A',cell,'M1',`validity/question ${rb.planValidity?.status}/${ra.planValidity?.status} ${rb.question?.kind??'-'}/${ra.question?.kind??'-'}`);
   }
  }
  if(V==='MIXED'&&valid){const a=new Map(runsAhead(inForce(f.A,ra),b,d).map(s=>[s.id,s]));for(const s of runsAhead(P,b,d)){const y=a.get(s.id);if(y&&y.role===s.role&&s.prescription.durationMinutes>y.prescription.durationMinutes)fail('A',cell,'M2',`${s.id} ${s.prescription.durationMinutes}>${y.prescription.durationMinutes}`);}}
  if(V==='ADVERSE'&&valid&&kind==='WEEKLY_REVIEW'){const re=step(copy(exec.B),b,{day:d,hour:'07:00:00',observations:exec.facts}),E=inForce(exec.B,re),long=Q=>runsAhead(Q,b,d).find(s=>s.role==='LONG')?.prescription.durationMinutes??0;
   if(JSON.stringify(fromDay(P,b,d))===JSON.stringify(fromDay(E,b,d))&&long(E)>0)fail('A',cell,'E1','adverse responses left the plan of all done');if(long(P)>long(E))fail('A',cell,'E1',`long ${long(P)}>${long(E)}`);}
  if(V==='PARTIAL'&&kind==='WEEKLY_REVIEW'){
   if(rb.status!=='ASK'||rb.proposal)fail('A',cell,'Q1',`${rb.status} proposal=${!!rb.proposal}`);
   else{const reported=new Set([...f.B.ledger,...(rb.actualLedger??[])].map(o=>o.sessionId)),byId=new Map(f.B.p.weeks.flatMap(w=>w.sessions).map(s=>[s.id,s])),day=H.addDays(f.B.p.weeks[b].startDate,d);
    for(const id of rb.question?.unreported?.sessionIds??[]){const s=byId.get(id);if(!s||s.sport!=='RUN'||reported.has(id)||s.date>=day)fail('A',cell,'Q1','asked about '+id);}}
  }
 }
}
// ---------- C ----------
{const f=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),day=H.addDays(f.B.p.weeks[7].startDate,2),pain={...H.elig(day),pain:true};
 for(const kind of Object.keys(KINDS)){out.C.cases++;const r=step(copy(f.B),7,{day:2,hour:'07:00:00',...KINDS[kind](f.B.p,7),observations:f.facts,eligibility:pain});if(r.status!=='CLINICAL_HUMAN_REQUIRED'||r.proposal||r.question)fail('C',kind,'CLINICAL',`${r.status} proposal=${!!r.proposal} question=${r.question?.kind??null}`);}
 const t=copy(f.B);step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'});out.C.cases++;
 const r=step(copy(t),7,{day:2,hour:'07:00:00',observations:f.facts,eligibility:pain});if(r.status!=='CLINICAL_HUMAN_REQUIRED'||r.proposal||r.referenceState?.pending?.signal)fail('C','held signal + pain','CLINICAL',`${r.status} signal=${!!r.referenceState?.pending?.signal}`);
 const X=f.B.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];out.C.cases++;
 const sub=step(copy(f.B),7,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:f.facts});
 if(sub.status!=='CLINICAL_HUMAN_REQUIRED'||sub.proposal||!sub.actualLedger.some(o=>o.sessionId===f.facts[0].sessionId))fail('C','substitution with pain','CLINICAL',`${sub.status} proposal=${!!sub.proposal}`);}
// ---------- S ----------
for(const V of ['MISS','EXEC'])for(const g of [0,2]){
 const f=fork(GEN,{g,b:7,mode:'RV',V}),cell=`fatigue ${V} g=${g}`;out.S.cases++;
 const ra=step(f.A,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'}),held=step(f.B,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'});
 if(held.status==='ASK'){if(held.referenceState?.pending?.signal?.kind!=='SYSTEMIC_FATIGUE')fail('S',cell,'HELD','signal not carried');
  const r=step(f.B,7,{day:2,hour:'07:00:00',observations:f.facts});
  if(JSON.stringify(fromDay(f.B.p,7,2))!==JSON.stringify(fromDay(f.A.p,7,2)))fail('S',cell,'APPLIED','plan differs from the fatigue applied on time');
  if(r.referenceState?.pending)fail('S',cell,'CONSUMED','still pending');}
 else fail('S',cell,'SETUP',`fatigue not held: ${held.status}`);
}
{const f=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),target=f.A.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').at(-1);out.S.cases++;
 const week7=t=>[...t.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(t.p,s,s.id===target.id?{response:BAD}:{})),...runSessions(t.p,7,8).map(s=>notDone(t.p,s))];
 const ev={day:6,hour:'20:00:00',kind:'UNDERPERFORMANCE',targetSessionId:target.id},ra=step(f.A,7,{...ev,observations:week7(f.A)}),held=step(f.B,7,{...ev,observations:week7(f.B)});
 const r=step(copy(f.B),7,{day:6,hour:'21:00:00',observations:f.facts});
 if(held.referenceState?.pending?.signal?.kind!=='UNDERPERFORMANCE'||JSON.stringify(fromDay(inForce(f.B,r),8,0,1))!==JSON.stringify(fromDay(inForce(f.A,ra),8,0,1)))fail('S','performance held','APPLIED','week 8 differs from the report decided on time');
 out.S.cases++;const next=step(copy(f.B),8,{day:0,hour:'07:00:00'});if(next.referenceState?.pending?.signal)fail('S','performance held','WEEK','the signal crossed its week');}
// ---------- I ----------
for(const g of [0,2])for(const d of [0,2]){
 const t={p:H.program(GEN),ledger:[],ref:null};for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 step(t,6,{});const start=t.p.weeks[g].startDate,end=H.addDays(t.p.weeks[7].startDate,d-1),cell=`break g=${g} day ${d}`;out.I.cases++;
 const r=step(copy(t),7,{day:d,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,reasonCategory:'WORK',reason:'work',nonclinical:true}});
 const bad=r.proposal?runsAhead(r.proposal,7,d).filter(s=>s.prescription.durationMinutes>ENTRY||['QUALITY','RACE_TOUCH'].includes(s.role)):null;
 if(r.action!=='REESTABLISH'||r.question||!bad||bad.length)fail('I',cell,'RETURN',`${r.status} ${r.action} question=${r.question?.kind??null} ahead=${bad?bad.map(s=>s.role+':'+s.prescription.durationMinutes).join('/'):'-'}`);
}
out.summary={A:{cells:out.A.cells,violations:out.A.violations.length,classified:Object.entries(out.A.classified.reduce((m,c)=>(m[c.class]=(m[c.class]??0)+1,m),{})).map(([k,n])=>k+':'+n).join(',')},C:{cases:out.C.cases,violations:out.C.violations.length},S:{cases:out.S.cases,violations:out.S.violations.length},I:{cases:out.I.cases,violations:out.I.violations.length},total:out.A.violations.length+out.C.violations.length+out.S.violations.length+out.I.violations.length};
console.log(JSON.stringify(out,null,1));
