// R7-C Phase 5 (DOMAIN_COACHING_R7-C): directed tests for SSCTR-SD-01, SSCTR-SD-02 and SSCTR-SD-03.
// - SD-01: once the athlete's answer turns unreported training into facts, the run doses still ahead in the answer week follow those facts,
//   never the projection stored while they were unknown;
// - SD-02: the answer week itself is checked: history intact, the sessions still ahead re-planned, no stale dose left valid, the question
//   gone from the reference state, plan validity VALID only after the reconciliation;
// - SD-03: the signals that arrive with the answer (or that the question held) are applied by their normal authority on the facts.
// The metamorphic core. A* has each gap week reported at its own review (strictly on time); A has the gap's facts at the review before the answer
// week; B has the same facts arrive in the answer week after the question. A* shares B's factual history only for a known stop (nothing was
// executed, so nothing depended on what was prescribed); A shares it always (same prefix). Where the history is shared and each dimension's
// evidence uniform (every run not done, or every run done as prescribed), A*, A and B leave the same plan in force from the answer on. With mixed
// evidence in a week whose review asked, B reads that week as every decision reads it (PlanningView: held unless executed completely) while A's
// review closed it with its own gates: a disclosed residual, tested here for its bounds.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const UNREPORTED='observations.unreportedSessions|interruption';
const ENTRY=opts.authority.policy.operational.return.entryRunMinutes;
const GEN={id:'r7c-p5',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const R10K={id:'r7c-p5-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const notDone=(p,s)=>({eventId:`r7c-p5-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
/** The athlete's report of the run sessions of weeks [from,to): MISS not done; EXEC done as prescribed; MIXED long runs done, the rest not done;
 * ADVERSE done, the long runs followed by an adverse response. */
const report=(p,from,to,V)=>runSessions(p,from,to).map(s=>V==='MISS'||V==='MIXED'&&s.role!=='LONG'?notDone(p,s):obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{}));
/** One decision on timeline t, the reference state chained; t follows the decision. */
function step(t,w,x={}){
 const r=evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},opts);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
/**
 * Weeks [0,g) executed and reviewed. Weeks [g,b-1): RV reviewed with strength reported and the runs unreported; NR neither reported nor reviewed.
 * At the end of week b-1, A's review carries the run reports of weeks [g,b) and B's does not (it asks).
 */
function fork(o,{g,b,mode,V}){
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
 const a=step(A,b-1,{observations:[...strength,...facts]}),q=step(B,b-1,{observations:strength});
 return {A,B,a,q,facts};
}
/** A*: weeks [0,g) executed; every gap week reviewed with its strength done and its runs reported not done (a known stop reported on time). */
function onTime(o,{g,b}){
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 for(let w=g;w<b;w++)step(t,w,{observations:[...strengthOf(t.p,w),...runSessions(t.p,w,w+1).map(s=>notDone(t.p,s))]});
 return t;
}
/**
 * The plan in force from day d of week b on: every session dated on or after that day, with its status and prescription; with week b+1 too when
 * nothing of week b had elapsed. Once a session of week b has elapsed before the answer it is history in B with the prescription stored then,
 * and the conditional projection of week b+1 counts it as prescribed (as A counts its own), so week b+1 legitimately differs by that elapsed
 * time until week b's review re-plans it from what week b's facts show (convergence test below).
 */
const fromDay=(P,b,d,n=d===0?2:1)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+n).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
/**
 * The run doses in force in week b from day d on. A* executed other strength prescriptions, so only runs share B's history; and only the answer
 * week: A*'s reviews re-planned each missed week at the entry, and in a week that is not a consolidation the trim also brings the run state down
 * to the dose it prescribed, while B's missed weeks keep the projection stored before the question (history), so the run state B carries out of
 * the answer week can stand above A*'s. The single-run ceiling bounds both (D17/D18); disclosed residual (Phase 5 checkpoint).
 */
const runPlanFrom=(P,b,d)=>fromDay(P,b,d,1).filter(x=>x.includes('-run-'));
const runsFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
const minutesFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return new Map(P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>[s.id,s.prescription.durationMinutes]));};
const past=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>`${s.id}:${hash(s.prescription??null)}`);};
const stale=list=>list.some(x=>/^(QUALITY|RACE_TOUCH)/.test(x)||Number(x.split(':')[1])>ENTRY);
const inForce=(t,r)=>r.proposal??t.p;

// ---------- SSCTR-SD-01 / SD-02: the metamorphic core ----------
const AT=d=>({day:d,hour:'07:00:00'});
test('R7-C SD-01: the same facts on time (A*, A) or answered after the question (B) leave the same plan in force from the answer on; the answer week drops the stale doses',()=>{
 let cells=0;
 for(const [name,o] of [['GEN',GEN],['R10K',R10K]])for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC']){
  const {A,B,a,q,facts}=fork(o,{g,b:7,mode,V}),tag=`${name} g=${g} ${mode} ${V}`,star=V==='MISS'?onTime(o,{g,b:7}):null;
  assert.notEqual(a.status,'ASK',tag+': on time, the facts are known: '+a.reason);
  assert.equal(q.question?.kind,'UNREPORTED_TRAINING',tag+': without them the review before the answer week asks');
  if(V==='MISS')assert.ok(stale(runsFrom(B.p,7,0)),tag+': the stored answer week still holds the projection '+runsFrom(B.p,7,0));
  for(const d of [0,2,5]){
   const before=B.p,r=step(copy(B),7,{...AT(d),observations:facts}),P=inForce(B,r),cell=`${tag} day ${d}`;cells++;
   // SD-02: the answer week itself: the plan in force follows the facts (A, A*), history is intact, the question is gone, the plan is valid.
   assert.deepEqual(fromDay(P,7,d),fromDay(A.p,7,d),cell+': B leaves A’s plan in force from the answer on');
   if(star)assert.deepEqual(runPlanFrom(P,7,d),runPlanFrom(star.p,7,d),cell+': and the run doses of the known stop reported strictly on time');
   assert.deepEqual(past(P,7,d),past(before,7,d),cell+': history is never rewritten');
   assert.equal(r.question??null,null,cell);assert.equal(r.referenceState.pending,null,cell+': the answered question no longer travels');
   assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',cell);
   if(V==='MISS')assert.ok(!stale(runsFrom(P,7,d)),cell+': no stale run dose stays valid after a known stop '+runsFrom(P,7,d));
   if(V==='MISS'&&d===0)assert.equal(r.action,'REPLAN_FROM_EVIDENCE',cell+': the answer week is re-planned from the facts');
  }
 }
 assert.equal(cells,48);
});
test('R7-C SD-01: after an answer later in the week, A and B converge at the week’s review: the same week facts give the same next week',()=>{
 for(const V of ['MISS','EXEC'])for(const d of [2,5]){
  const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V}),cell=`${V} day ${d}`;
  step(B,7,{...AT(d),observations:facts});
  // Week 7's facts, the same in A and B: what elapsed before the answer reported not done (its prescriptions may differ: history), the
  // sessions from the answer on (the same prescriptions, asserted) executed as prescribed.
  const day=addDays(A.p.weeks[7].startDate,d),week=t=>t.p.weeks[7].sessions.filter(live).map(s=>s.date<day?notDone(t.p,s):obs(t.p,s));
  assert.deepEqual(fromDay(B.p,7,d),fromDay(A.p,7,d),cell);
  const ra=step(A,7,{observations:week(A)}),rb=step(B,7,{observations:week(B)});
  assert.deepEqual(fromDay(rb.proposal??B.p,8,0,1),fromDay(ra.proposal??A.p,8,0,1),cell+': week 8 converges');
  assert.equal(rb.status,ra.status,cell);assert.deepEqual(rb.question??null,ra.question??null,cell);
 }
});
test('R7-C SD-01: the answer re-plans the answer week before the event decides: A and B agree for every decision kind, day 0 and day 2',()=>{
 const KINDS={
  WEEKLY_REVIEW:()=>({}),
  SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
  SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
  LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
  UNAVAILABLE_LONG_RUN_DAY:p=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(p.weeks[7].startDate,6)]}}),
  UNAVAILABLE_STRENGTH_DAY:p=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(p.weeks[7].startDate,4)]}}),
  EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
  GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})
 };
 for(const V of ['MISS','EXEC']){
  const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V});
  for(const [kind,make] of Object.entries(KINDS))for(const d of [0,2]){
   const ra=step(copy(A),7,{...AT(d),...make(A.p)}),rb=step(copy(B),7,{...AT(d),...make(B.p),observations:facts}),cell=`${V} ${kind} day ${d}`;
   assert.deepEqual(fromDay(inForce(B,rb),7,d),fromDay(inForce(A,ra),7,d),cell+': the same plan in force');
   assert.equal(rb.planValidity.status,ra.planValidity.status,cell+': the same validity');
   assert.deepEqual(rb.question??null,ra.question??null,cell+': the same question, if any (only what stays unknown)');
   if(V==='MISS')assert.ok(!stale(runsFrom(inForce(B,rb),7,d)),cell+': no stale run dose '+runsFrom(inForce(B,rb),7,d));
  }
 }
});
test('R7-C SD-01: answered before a key session, before the long run, in the taper and in race week, the remaining sessions follow the facts',()=>{
 const phases=program(R10K).phases.phases;
 for(const b of [10,11]){
  assert.ok(['TAPER','RACE_WEEK'].includes(phases[b]),`week ${b} is ${phases[b]}`);
  for(const V of ['MISS','EXEC'])for(const d of [2,5]){
   const {A,B,facts}=fork(R10K,{g:0,b,mode:'RV',V}),r=step(copy(B),b,{...AT(d),observations:facts}),cell=`${phases[b]} ${V} day ${d}`;
   assert.deepEqual(fromDay(inForce(B,r),b,d),fromDay(A.p,b,d),cell);
   assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',cell);
   const race=inForce(B,r).weeks.flatMap(x=>x.sessions).filter(s=>s.role==='RACE'&&live(s));
   assert.equal(race.length,1,cell+': the race stays, once');
   if(V==='MISS')assert.ok(runs(inForce(B,r),b).filter(s=>s.role!=='RACE'&&s.date>=addDays(B.p.weeks[b].startDate,d)).every(s=>s.prescription.durationMinutes<=ENTRY),cell+': a known stop plans the reviewed entry, never the stored taper');
  }
 }
 // Before a key session (day 2, quality on day 3) and before the long run (day 5) in a build week: the stored quality and long run go.
 const {B,facts}=fork(GEN,{g:2,b:7,mode:'RV',V:'MISS'});
 for(const d of [2,5]){const r=step(copy(B),7,{...AT(d),observations:facts});assert.ok(!stale(runsFrom(inForce(B,r),7,d)),'day '+d+': '+runsFrom(inForce(B,r),7,d));}
});
test('R7-C SD-01: mixed evidence in the week the question left open: the answer week follows the canonical factual state, never more than a review on time would plan',()=>{
 for(const mode of ['RV','NR']){
  const {A,B,facts}=fork(GEN,{g:0,b:7,mode,V:'MIXED'});
  const r0=step(copy(B),7,{...AT(0),observations:facts});
  assert.equal(r0.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',mode);assert.equal(r0.referenceState.pending,null,mode);
  // The executed long runs anchor the window: no question, and nothing stored is kept.
  assert.equal(r0.action,'REPLAN_FROM_EVIDENCE',mode+': '+r0.reason);
  // Never more than the review that had these facts on time (it advanced the long run its week executed; B holds that week, which its review left open).
  const a=minutesFrom(A.p,7,0),b=minutesFrom(inForce(B,r0),7,0);
  for(const [id,m] of b)assert.ok(m<=a.get(id),`${mode} ${id}: ${m} > ${a.get(id)}`);
  // The same answer later in the week leaves the same sessions ahead.
  for(const d of [2,5]){const r=step(copy(B),7,{...AT(d),observations:facts});assert.deepEqual(fromDay(inForce(B,r),7,d),fromDay(inForce(B,r0),7,d,1),`${mode} day ${d}`);}
 }
});
test('R7-C SD-01: a partial answer asks only about what stays unknown; the stored doses are never validated until the rest is answered',()=>{
 const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),half=facts.filter((x,i)=>i%2===0),rest=facts.filter((x,i)=>i%2===1);
 const t=copy(B),r=step(t,7,{...AT(0),observations:half});
 assert.equal(r.status,'ASK',r.reason);assert.equal(r.question.kind,'UNREPORTED_TRAINING');assert.deepEqual(r.missingInputs,[UNREPORTED]);
 assert.equal(r.proposal,null,'nothing is planned on what is still unknown');assert.equal(r.planValidity.status,'REQUIRES_RECONCILIATION');
 const asked=new Set(r.question.unreported.sessionIds),reported=new Set(half.map(x=>x.sessionId));
 assert.ok(asked.size>0&&[...asked].every(id=>!reported.has(id)),'the question names only sessions with no report');
 assert.ok(rest.filter(x=>Date.parse(x.observedAt)>=Date.parse(r.question.referenceWindow.from+'T00:00:00Z')).every(x=>asked.has(x.sessionId)),'every session still unknown in the window is asked about');
 // The rest of the answer, mid-week: the answer week follows the facts.
 const done=step(t,7,{...AT(2),observations:rest});
 assert.equal(done.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');assert.equal(done.referenceState.pending,null);
 assert.deepEqual(fromDay(inForce(t,done),7,2),fromDay(A.p,7,2));
});
test('R7-C SD-01: a declared interruption answers by its own authority: the return re-enters mid-week, nothing stored is kept',()=>{
 // Weeks 0-1 executed; then nothing is reported or reviewed (a real stop); week 6's review asks; on day 2 of week 7 the athlete declares the
 // stop as a break from week 2 to day 1 of week 7.
 const t={p:program(GEN),ledger:[],ref:null};
 for(let w=0;w<2;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 const q=step(t,6,{});assert.equal(q.question?.kind,'UNREPORTED_TRAINING',q.reason);
 const stored=runsFrom(t.p,7,2);assert.ok(stale(stored),'the stored week still holds the projection '+stored);
 const start=t.p.weeks[2].startDate,end=addDays(t.p.weeks[7].startDate,1);
 const r=step(copy(t),7,{...AT(2),kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,reasonCategory:'WORK',reason:'work',nonclinical:true}});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(r.question??null,null);
 assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');assert.equal(r.referenceState.pending,null);
 assert.ok(!stale(runsFrom(r.proposal,7,2)),'the re-entry, never the stored doses: '+runsFrom(r.proposal,7,2));
});

// ---------- SSCTR-SD-02: the answer week, explicitly ----------
test('R7-C SD-02 (fixture of r7c-phase4.test.mjs:85): the answer week, not only the next week, follows the late reports',()=>{
 // The fixture of the Phase 4 test: weeks 0-1 executed, 2-6 reviewed with the runs unreported, the late reports with a schedule change on day 0.
 const t={p:program({...GEN,id:'r7c-p4'}),ledger:[],ref:null};
 for(let w=0;w<2;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 for(let w=2;w<7;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const gap=runSessions(t.p,2,7);
 for(const V of ['EXEC','MISS']){
  const r=step(copy(t),7,{...AT(0),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:gap.map(s=>V==='EXEC'?obs(t.p,s):notDone(t.p,s))});
  assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',V);
  const week7=runs(r.proposal,7).map(s=>s.prescription.durationMinutes),stored=runs(t.p,7).map(s=>s.prescription.durationMinutes);
  if(V==='MISS')assert.ok(week7.every(m=>m<=ENTRY),'reported not done: the answer week plans the entry '+week7+' (stored '+stored+')');
  else assert.ok(week7.every(m=>m>ENTRY),'reported done: no collapse '+week7);
  assert.notDeepEqual(runs(r.proposal,7).map(s=>hash(s.prescription)),runs(t.p,7).map(s=>hash(s.prescription)),V+': the stored answer week does not stand');
 }
});
test('R7-C SD-02: a question raised in the answer week, answered later that week, reconciles the rest of the week; validity follows the reconciliation',()=>{
 const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'});
 // Day 0: a strength day becomes unavailable. A applies it; B keeps the change with the question pending (not valid).
 const day4=addDays(A.p.weeks[7].startDate,4),change={...AT(0),kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day4]}};
 const a0=step(A,7,change),b0=step(B,7,change);
 assert.equal(a0.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');
 assert.equal(b0.planValidity.status,'REQUIRES_RECONCILIATION');assert.equal(b0.question.kind,'UNREPORTED_TRAINING');assert.equal(b0.referenceState.pending.status,'ASK');
 // Day 2: the answer. The rest of the week follows the facts, with the day-0 change kept; the question no longer travels; valid only now.
 const before=B.p,r=step(B,7,{...AT(2),observations:facts});
 assert.deepEqual(fromDay(B.p,7,2),fromDay(A.p,7,2));
 assert.deepEqual(past(B.p,7,2),past(before,7,2));
 assert.ok(B.p.weeks[7].sessions.filter(s=>s.sport==='STRENGTH'&&s.date===day4).every(s=>s.status==='SKIPPED'),'the day-0 change stays');
 assert.equal(r.referenceState.pending,null);assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');
});
test('R7-C SD-02: a question raised in an earlier week and answered in a later week reconciles that later week',()=>{
 // The athlete stopped: every run of weeks 0-7 not done. A reports week by week from week 6 on; B answers on day 2 of week 8.
 const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),star=onTime(GEN,{g:0,b:8});
 const stop=runSessions(B.p,7,8).map(s=>notDone(B.p,s));
 const a7=step(A,7,{observations:[...strengthOf(A.p,7),...runSessions(A.p,7,8).map(s=>notDone(A.p,s))]});
 assert.notEqual(a7.status,'ASK',a7.reason);
 const b7=step(B,7,{observations:strengthOf(B.p,7)});
 assert.equal(b7.question?.kind,'UNREPORTED_TRAINING','still unknown at the next review');
 const before=B.p,r=step(B,8,{...AT(2),observations:[...facts,...stop]});
 assert.deepEqual(fromDay(B.p,8,2),fromDay(A.p,8,2),'week 8 follows the facts');
 assert.deepEqual(runPlanFrom(B.p,8,2),runPlanFrom(star.p,8,2),'the run doses of the known stop reported strictly on time');
 assert.ok(!stale(runsFrom(B.p,8,2)),runsFrom(B.p,8,2).join('/'));
 assert.deepEqual(past(B.p,8,2),past(before,8,2),'history intact');
 assert.equal(r.referenceState.pending,null);assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');
});
test('R7-C SD-02: an answer at the end-of-week review plans the next week from the facts, as on time',()=>{
 for(const V of ['MISS','EXEC']){
  const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V});
  // Week 7's own facts, the same in A and B whatever its stored rows: every session reported not done. B answers at week 7's review.
  const week=t=>t.p.weeks[7].sessions.filter(live).map(s=>notDone(t.p,s));
  const ra=step(A,7,{observations:week(A)}),rb=step(B,7,{observations:[...facts,...week(B)]});
  assert.notEqual(ra.status,'ASK',V+': '+ra.reason);
  assert.deepEqual(fromDay(rb.proposal??B.p,8,0,1),fromDay(ra.proposal??A.p,8,0,1),V+': next week as planned on time');
  assert.equal(rb.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',V);assert.equal(rb.referenceState.pending,null,V);
 }
});

// ---------- SSCTR-SD-03: the signals that come with the answer ----------
test('R7-C SD-03: the answer with adverse recovery: the factual plan reads the adverse responses, not only the known runs',()=>{
 for(const mode of ['RV','NR']){
  const ok=fork(GEN,{g:0,b:7,mode,V:'EXEC'}),bad=fork(GEN,{g:0,b:7,mode,V:'ADVERSE'});
  const rOk=step(copy(ok.B),7,{...AT(0),observations:ok.facts}),rBad=step(copy(bad.B),7,{...AT(0),observations:bad.facts});
  assert.notDeepEqual(fromDay(inForce(bad.B,rBad),7,0),fromDay(inForce(ok.B,rOk),7,0),mode+': the adverse evidence changes the plan: it is not dropped');
  const long=P=>runs(P,7).find(s=>s.role==='LONG').prescription.durationMinutes;
  assert.ok(long(inForce(bad.B,rBad))<long(inForce(ok.B,rOk)),mode+': the long run does not progress after adverse responses');
  assert.ok(long(inForce(bad.B,rBad))<=long(bad.B.p),mode+': never above the stored long run');
  assert.equal(rBad.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',mode);
 }
});
test('R7-C SD-03: a fatigue report held by the question is applied when a plain review answers it that week (the engine carries it), as on time',()=>{
 for(const V of ['MISS','EXEC']){
  const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V});
  // A: the fatigue on day 0 with the facts known. B: the fatigue on day 0 is held by the question; the answer comes in a plain review on day 2.
  const ra=step(A,7,{...AT(0),kind:'SYSTEMIC_FATIGUE'});
  assert.equal(ra.action,'REDUCE',V+': '+ra.reason);
  const held=step(B,7,{...AT(0),kind:'SYSTEMIC_FATIGUE'});
  assert.equal(held.status,'ASK');assert.equal(held.proposal,null);
  assert.deepEqual([held.referenceState.pending.eventKind,held.referenceState.pending.signal?.kind,held.referenceState.pending.signal?.weekIndex],['SYSTEMIC_FATIGUE','SYSTEMIC_FATIGUE',7],V+': the signal travels with the question');
  // A plain review without the answer keeps the signal waiting.
  const wait=step(copy(B),7,{day:1,hour:'07:00:00'});
  assert.equal(wait.status,'ASK');assert.equal(wait.referenceState.pending.signal?.kind,'SYSTEMIC_FATIGUE',V+': still waiting');
  const r=step(B,7,{...AT(2),observations:facts});
  assert.equal(r.action,'REDUCE',V+': the held fatigue is applied with the answer: '+r.reason);assert.match(r.reason,/systemic fatigue reported on .* with the question is re-evaluated with the answer/);
  assert.deepEqual(fromDay(B.p,7,2),fromDay(A.p,7,2),V+': the same plan in force as the fatigue applied on time');
  assert.equal(r.referenceState.pending,null,V+': consumed');assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');
 }
});
test('R7-C SD-03: a performance report held by the question is re-evaluated with the answer; a held signal never crosses its week',()=>{
 const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'});
 // Week 7: its runs reported not done and its strength executed, the last strength session followed by an adverse response, reported at the
 // end of the week as an underperformance of that session.
 const target=A.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').at(-1);
 const week7=t=>[...t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(t.p,s,s.id===target.id?{response:BAD}:{})),...runSessions(t.p,7,8).map(s=>notDone(t.p,s))];
 const event={day:6,hour:'20:00:00',kind:'UNDERPERFORMANCE',targetSessionId:target.id};
 // A: the gap's facts on time. B: the same report with the gap unknown: the question (about week 8) holds it; the answer comes in the plain
 // end-of-week review an hour later.
 const ra=step(A,7,{...event,observations:week7(A)});assert.notEqual(ra.status,'ASK',ra.reason);
 const held=step(B,7,{...event,observations:week7(B)});
 assert.equal(held.status,'ASK',held.reason);assert.equal(held.referenceState.pending.signal?.kind,'UNDERPERFORMANCE');assert.equal(held.referenceState.pending.signal?.targetSessionId,target.id);
 const r=step(copy(B),7,{day:6,hour:'21:00:00',observations:facts});
 assert.match(r.reason,/underperformance reported on .* with the question is re-evaluated with the answer/);
 assert.deepEqual(fromDay(inForce(B,r),8,0,1),fromDay(inForce(A,ra),8,0,1),'week 8 as the report decided on time');
 assert.equal(r.planValidity.status,ra.planValidity.status);
 // Not answered that week: the signal stays with its week; next week's pending question does not carry it.
 const next=step(copy(B),8,{...AT(0)});
 assert.equal(next.status,'ASK');assert.equal(next.referenceState.pending.signal,undefined,'a week’s signal acts on that week only');
});
test('R7-C SD-03: a clinical flag wins over the answer and over a held signal: nothing is proposed or carried',()=>{
 const {B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'});
 const held=step(B,7,{...AT(0),kind:'SYSTEMIC_FATIGUE'});assert.equal(held.referenceState.pending.signal?.kind,'SYSTEMIC_FATIGUE');
 const day=addDays(B.p.weeks[7].startDate,2);
 for(const kind of ['WEEKLY_REVIEW','SYSTEMIC_FATIGUE']){
  const r=step(copy(B),7,{...AT(2),kind,observations:facts,eligibility:{...elig(day),pain:true}});
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',kind);assert.equal(r.proposal,null,kind);assert.equal(r.question??null,null,kind);
  assert.equal(r.referenceState.pending.status,'CLINICAL_HUMAN_REQUIRED',kind);assert.equal(r.referenceState.pending.signal,undefined,kind+': the clinical route takes over');
 }
 // A substitution with pain answering the gap: the clinical route of its own screen, before the factual re-plan's proposal.
 const X=B.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const sub=step(copy(B),7,{...AT(2),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});
 assert.equal(sub.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(sub.proposal,null);
 assert.ok(sub.actualLedger.some(o=>o.sessionId===facts[0].sessionId),'the answer is still recorded');
});
test('R7-C SD-01/SD-03: same facts, same decision (determinism); the answer is named as such',()=>{
 const {B,facts}=fork(GEN,{g:2,b:7,mode:'RV',V:'MISS'});
 const rv={...review(B.p,7,{...AT(2),observations:facts}),actualLedger:B.ledger,referenceState:B.ref};
 const x=evaluateProgram(B.p,rv,opts),y=evaluateProgram(B.p,rv,opts);
 assert.equal(hash(x),hash(y));
 assert.equal(x.referenceState.pending,null);assert.equal(x.status,'MODIFY');assert.equal(x.action,'REPLAN_FROM_EVIDENCE');
 assert.match(x.reason,/answer the question about unreported training/);
});
