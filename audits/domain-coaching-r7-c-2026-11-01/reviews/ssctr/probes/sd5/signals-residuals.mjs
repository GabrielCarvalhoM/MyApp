// SSCTR semantic re-disposition (R7-C Phase 5), probe SR: SSCTR-SD-03 routes the tests do not cover, and the disclosed residuals R1, R3, R4, R5.
// Timelines as in the Phase 5 tests (A: facts at the review before the answer week; B: that review asks; the answer arrives in week 7).
//  SIG  a reactive signal held on day 0 (SYSTEMIC_FATIGUE, LOCAL_FATIGUE, UNDERPERFORMANCE of a week-6 strength session), then the answer on day 2
//       through: a plain review; the same event kind re-submitted; a SCHEDULE_CHANGE; a partial plain review then the rest on day 3; and, for
//       SYSTEMIC_FATIGUE, no answer until day 0 of week 8. Compared with A (the signal on day 0 with the facts known, then the same second event).
//  R1   answer on day 2 and day 5 (MISS, EXEC): the next week's projection in B against A, the elapsed answer-week session's stored prescription.
//  R3   ADVERSE and MIXED answers on day 0: the answer week's runs in B and A; then week 7 executed as prescribed in each and reviewed: week 8.
//  R4   SCHEDULE_CHANGE in the R10K race week (the program's last week): R7-C B (answer carried) and A, and R7B2-FREEZE-1 with the facts on time.
//  R5   an eligibility pain flag with the answer: recorded or not; then, after clinical clearance (a fresh reference state), a plain review without
//       the answer, and one with it.
// Read-only (R7B2-FREEZE-1 extracted to a temporary directory); prints JSON.
import {REPO,R7B2_FREEZE_1,extract,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,{hash}=rt,ENTRY=rt.opts.authority.policy.operational.return.entryRunMinutes;
const GEN={id:'sd5-sr-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const R10K={id:'sd5-sr-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const notDone=(p,s)=>({eventId:`sd5-sr-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
const report=(p,from,to,V)=>runSessions(p,from,to).map(s=>V==='MISS'||V==='MIXED'&&s.role!=='LONG'?notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{}));
function stepWith(R,t,w,x={}){const r=R.evaluateProgram(t.p,{...R.H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const step=(t,w,x)=>stepWith(rt,t,w,x);
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
function fork(o,{g=0,b=7,mode='RV',V}){
 const t={p:H.program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
 step(A,b-1,{observations:[...strength,...facts]});const q=step(B,b-1,{observations:strength});
 return {A,B,q,facts};
}
const day=(p,b,d)=>H.addDays(p.weeks[b].startDate,d);
const fromDay=(P,b,d,n=1)=>P.weeks.slice(b,b+n).flatMap(x=>x.sessions).filter(s=>s.date>=day(P,b,d)).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);
const runs=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&(!from||s.date>=from)).map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.strides?'+S':''}`);
const brief=r=>`${r.status}/${r.action??''}/${r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status}${r.question?'/'+r.question.kind:''}`;
const out={check:'SSCTR-SD5-SIGNALS-RESIDUALS',entry:ENTRY,SIG:{},R1:{},R3:{},R4:{},R5:{}};
const AT=(d,h='07:00:00')=>({day:d,hour:h});

// ---------- SIG ----------
for(const V of ['MISS','EXEC'])for(const sig of ['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','UNDERPERFORMANCE']){
 const f=fork(GEN,{V}),target=f.A.p.weeks[6].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').at(-1).id;
 const ev=sig==='LOCAL_FATIGUE'?{kind:sig,signals:{region:'LOWER'}}:sig==='UNDERPERFORMANCE'?{kind:sig,targetSessionId:target}:{kind:sig};
 const row={};
 const A0=copy(f.A),a0=step(A0,7,{...AT(0),...ev});row.onTime=brief(a0);
 const B0=copy(f.B),held=step(B0,7,{...AT(0),...ev});row.held={decision:brief(held),signal:held.referenceState?.pending?.signal?.kind??null};
 const routes={
  plainReview:[{x:{}},null],
  resubmittedKind:[{x:{...ev}},null],
  scheduleChange:[{x:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}},{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}]
 };
 for(const [name,[bx,ax]] of Object.entries(routes)){
  const B=copy(B0),rb=step(B,7,{...AT(2),...bx.x,observations:f.facts});
  const A=copy(A0),ra=ax?step(A,7,{...AT(2),...ax}):null;
  row[name]={B:brief(rb),A:ra?brief(ra):'(plan after the on-time signal)',samePlanAsA:JSON.stringify(fromDay(B.p,7,2))===JSON.stringify(fromDay(A.p,7,2)),reasonNamesHeld:/with the question is re-evaluated with the answer/.test(rb.reason??''),pendingAfter:rb.referenceState?.pending?.status??null,signalAfter:rb.referenceState?.pending?.signal?.kind??null,runsAheadB:runs(B.p,7,day(B.p,7,2)),runsAheadA:runs(A.p,7,day(A.p,7,2))};
 }
 // Partial answer on day 2 (half the facts), the rest on day 3 in a plain review.
 {const B=copy(B0),half=f.facts.filter((x,i)=>i%2===0),rest=f.facts.filter((x,i)=>i%2===1),p1=step(B,7,{...AT(2),observations:half}),p2=step(B,7,{...AT(3),observations:rest});
  row.partialThenRest={partial:brief(p1),signalTravels:p1.referenceState?.pending?.signal?.kind??null,rest:brief(p2),samePlanAsA:JSON.stringify(fromDay(B.p,7,3))===JSON.stringify(fromDay(A0.p,7,3)),reasonNamesHeld:/re-evaluated with the answer/.test(p2.reason??'')};}
 if(sig==='SYSTEMIC_FATIGUE'){const B=copy(B0),r=step(B,8,{...AT(0),observations:[...f.facts,...runSessions(B.p,7,8).filter(s=>s.date<day(B.p,8,0)).map(s=>V==='MISS'?notDone(B.p,s):H.obs(B.p,s)),...strengthOf(B.p,7)]});row.answeredNextWeek={decision:brief(r),reasonNamesHeld:/re-evaluated/.test(r.reason??''),signalAfter:r.referenceState?.pending?.signal?.kind??null};}
 out.SIG[`${V} ${sig}`]=row;
}

// ---------- R1 ----------
for(const V of ['MISS','EXEC'])for(const d of [2,5]){
 const f=fork(GEN,{V}),B=copy(f.B),r=step(B,7,{...AT(d),observations:f.facts});
 const elapsed=B.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.date<day(B.p,7,d)).map(s=>`${s.id}:${s.role}:${s.prescription.durationMinutes}`);
 const elapsedA=f.A.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.date<day(f.A.p,7,d)).map(s=>`${s.id}:${s.role}:${s.prescription.durationMinutes}`);
 out.R1[`${V} day ${d}`]={decision:brief(r),elapsedInB:elapsed,elapsedInA:elapsedA,week7AheadB:runs(B.p,7,day(B.p,7,d)),week7AheadA:runs(f.A.p,7,day(f.A.p,7,d)),week8B:runs(B.p,8),week8A:runs(f.A.p,8),week8Same:JSON.stringify(runs(B.p,8))===JSON.stringify(runs(f.A.p,8))};
}

// ---------- R3 ----------
for(const V of ['ADVERSE','MIXED'])for(const mode of ['RV','NR']){
 const f=fork(GEN,{V,mode}),B=copy(f.B),A=copy(f.A),r=step(B,7,{...AT(0),observations:f.facts});
 const w7B=runs(B.p,7),w7A=runs(A.p,7);
 const rb=step(B,7,{observations:B.p.weeks[7].sessions.filter(H.live).map(s=>H.obs(B.p,s))}),ra=step(A,7,{observations:A.p.weeks[7].sessions.filter(H.live).map(s=>H.obs(A.p,s))});
 out.R3[`${V} ${mode}`]={answer:brief(r),week7B:w7B,week7A:w7A,week7ReviewB:brief(rb),week7ReviewA:brief(ra),week8B:runs(B.p,8),week8A:runs(A.p,8)};
}

// ---------- R4 ----------
{
 const x=extract(R7B2_FREEZE_1),B2=await load(x.root);
 for(const V of ['MISS','EXEC']){
  const f=fork(R10K,{b:11,V}),B=copy(f.B),A=copy(f.A),sc={kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}};
  const rb=step(B,11,{...AT(2),...sc,observations:f.facts}),ra=step(A,11,{...AT(2),...sc});
  // R7B2-FREEZE-1, the facts on time (every week reviewed, runs as V), then the same schedule change in week 11.
  const t={p:B2.H.program(R10K),ledger:[],ref:null};for(let w=0;w<11;w++)stepWith(B2,t,w,{observations:[...t.p.weeks[w].sessions.filter(s=>B2.H.live(s)&&s.sport==='STRENGTH').map(s=>B2.H.obs(t.p,s)),...t.p.weeks[w].sessions.filter(s=>B2.H.live(s)&&s.sport==='RUN').map(s=>V==='MISS'?notDone(t.p,s):B2.H.obs(t.p,s))]});
  const r2=stepWith(B2,t,11,{...AT(2),...sc});
  // After the HOLD, the race-week review with the answer carried earlier recorded: does it reconcile?
  const end=step(B,11,{observations:B.p.weeks[11].sessions.filter(s=>H.live(s)&&s.date>=day(B.p,11,2)&&s.role!=='RACE').map(s=>H.obs(B.p,s))});
  out.R4[V]={R7C_B:brief(rb),answerRecorded:f.facts.every(o=>(rb.actualLedger??[]).some(y=>y.sessionId===o.sessionId)),R7C_A:brief(ra),B2_onTime:brief(r2),B2reason:String(r2.reason??'').slice(0,140),raceWeekReviewAfter:brief(end)};
 }
 x.cleanup();
}

// ---------- R5 ----------
{
 const f=fork(GEN,{V:'MISS'}),d2=day(f.B.p,7,2),pain={...H.elig(d2),pain:true};
 const B=copy(f.B),r=step(B,7,{...AT(2),observations:f.facts,eligibility:pain});
 const recorded=f.facts.filter(o=>(r.actualLedger??B.ledger).some(y=>y.sessionId===o.sessionId)).length;
 // Clearance happens outside the reference (a qualified human); the next decision starts from a fresh reference state, the ledger kept.
 const cleared={p:B.p,ledger:B.ledger,ref:null},d3=day(B.p,7,3);
 const again=step(copy(cleared),7,{...AT(3)});
 const resent=step(copy(cleared),7,{...AT(3),observations:f.facts});
 out.R5={clinical:brief(r),answerRecorded:`${recorded}/${f.facts.length}`,afterClearanceWithoutAnswer:{decision:brief(again),runsInForceAhead:runs(again.proposal??cleared.p,7,d3)},afterClearanceAnswerResent:{decision:brief(resent),runsAhead:runs(resent.proposal??cleared.p,7,d3),atOrBelowEntry:runs(resent.proposal??cleared.p,7,d3).every(x=>Number(x.split(':')[1].replace('+S',''))<=ENTRY)}};
}
console.log(JSON.stringify(out,null,1));
