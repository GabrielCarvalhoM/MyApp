// R7-D Phase 3: directed tests for the four blockers of the independent diagnostic (audits/domain-coaching-r7-d-2026-11-02/PHASE2_CHECKPOINT.md).
// - DX-01: a completed-work row the record accepted stays factual when the record is carried; its time precision is not re-read later.
// - DX-02 (SAFETY): a declared interruption is a known stop whatever event carries it; it never depends on a pending question.
// - F03: a machine-stack load prescribed by the runtime is read back by its own ingestion path (F03-A); its progression is executable (F03-B).
// - F04: `confounded` limits the reading of performance and effort; it never erases an adverse recovery or an impaired next day.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',RECON='REQUIRES_RECONCILIATION';
const GEN={id:'r7d-p3-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const fresh=(o=GEN)=>({p:program(o),ledger:[],ref:null});
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
/** The factual fields of a record row (what was reported, when, and its provenance); binding context is recomputed by each decision. */
const facts=o=>({eventId:o.eventId,sessionId:o.sessionId,observedAt:o.observedAt,localDate:o.localDate,reportedAt:o.reportedAt??null,actual:o.actual,response:o.response,provenance:o.provenance,superseded:o.superseded??false});
const rowOf=(ledger,id)=>ledger.find(o=>o.eventId===id&&o.superseded!==true)??null;
const runDoses=(p,from=0)=>p.weeks.slice(from).map(x=>x.sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.id}:${s.prescription.family}:${s.prescription.durationMinutes}`));

// ---------- DX-01 ----------
/** A report with day precision only (the day it happened and the time it was reported). */
const dayReport=(p,s,{reportedAt,id,response=OK,minutes=null}={})=>({eventId:id,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,...(reportedAt?{reportedAt}:{}),actual:{completed:true,minutes:minutes??s.prescription.durationMinutes},response:{...OK,...response}});
const weekFacts=(p,w,{except=null}={})=>p.weeks[w].sessions.filter(s=>live(s)&&s!==except).map(s=>obs(p,s));
/** Week 0 reviewed on its last day (21:00 UTC) with one run reported at day precision: the long run (that same day) or `pick`. */
function dx01(reportedAtOf,{response=OK,pick=p=>runs(p,0).find(s=>s.role==='LONG')}={}){
 const t=fresh(),long=pick(t.p);
 const r1=step(t,0,{observations:[...weekFacts(t.p,0,{except:long}),dayReport(t.p,long,{id:'dx01-long',reportedAt:reportedAtOf(long),response})]});
 return {t,long,r1};
}
const sameDay=s=>`${s.date}T09:00:00Z`;
test('R7-D DX-01: a same-day report with day precision, accepted by a decision, stays in the record at the next decisions with its facts and first-recorded clock',()=>{
 const {t,r1}=dx01(sameDay);
 const accepted=rowOf(r1.actualLedger,'dx01-long');
 assert.ok(accepted,'the decision that receives it accepts it');assert.equal(accepted.provenance.timePrecision,'DAY');
 const at1=accepted.provenance.firstRecordedAt;
 assert.equal(at1,`${addDays(t.p.weeks[0].startDate,6)}T21:00:00.000Z`,'stamped with the accepting decision clock');
 // The next decisions bring no new information about it: the row is carried and stays, with the same facts and provenance.
 const r2=step(t,1,{observations:weekFacts(t.p,1)}),r3=step(t,2,{observations:weekFacts(t.p,2)});
 for(const [r,label] of [[r2,'decision 2'],[r3,'decision 3']]){
  const kept=rowOf(r.actualLedger,'dx01-long');
  assert.ok(kept,`${label}: the accepted row is still in the record`);
  assert.deepEqual(facts(kept),facts(accepted),`${label}: the row is the one accepted (facts, time precision and first-recorded clock)`);
  assert.ok(!(r.provenance?.excluded??[]).some(e=>e.eventId==='dx01-long'),`${label}: never excluded`);
 }
 assert.equal(rowOf(r3.actualLedger,'dx01-long').provenance.firstRecordedAt,at1,'firstRecordedAt never advances');
});
test('R7-D DX-01: the carried record decides exactly as the same report sent again (the row never disappears, so no factual result changes)',()=>{
 for(const response of [OK,{recovery:'ADVERSE',nextDayFunction:'IMPAIRED'}]){
  const {t,long}=dx01(sameDay,{response});
  const carried=copy(t),resent=copy(t),w1=weekFacts(t.p,1);
  const a=step(carried,1,{observations:w1});
  const b=step(resent,1,{observations:[...w1,dayReport(resent.p,long,{id:'dx01-long',reportedAt:sameDay(long),response})]});
  assert.equal(a.status,b.status);assert.equal(a.action,b.action);assert.deepEqual(a.gates,b.gates);
  assert.deepEqual(runDoses(a.proposal??carried.p,2),runDoses(b.proposal??resent.p,2),'same plan ahead with or without the re-send');
  assert.deepEqual(a.actualLedger.map(facts),b.actualLedger.map(facts),'same record');
 }
});
test('R7-D DX-01: two adverse long runs, the first reported the same day with day precision, still step the long run back (the repeated-adverse rule reads both)',()=>{
 const bad={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
 const {t}=dx01(sameDay,{response:bad}),long1=runs(t.p,1).find(s=>s.role==='LONG');
 const r=step(t,1,{observations:[...weekFacts(t.p,1,{except:long1}),obs(t.p,long1,{response:bad})]});
 assert.equal(r.gates.LONG,'REGRESS',`two comparable adverse long runs within 14 days: ${JSON.stringify(r.gates)}`);
 // Control: the second adverse alone (the first never recorded) only holds.
 const c=fresh(),l0=runs(c.p,0).find(s=>s.role==='LONG');step(c,0,{observations:weekFacts(c.p,0,{except:l0})});
 const l1=runs(c.p,1).find(s=>s.role==='LONG'),h=step(c,1,{observations:[...weekFacts(c.p,1,{except:l1}),obs(c.p,l1,{response:bad})]});
 assert.equal(h.gates.LONG,'HOLD');
});
test('R7-D DX-01: next-day, clockless and exact-timestamp reports are kept as before; the report-before-observation screen still rejects what it rejected',()=>{
 // The week's first run (two or more days before the review), so a next-day report is available to the decision that receives it.
 const first=p=>runs(p,0)[0];
 for(const [label,reportedAtOf] of [['same day',sameDay],['next day',s=>`${addDays(s.date,1)}T09:00:00Z`],['no report time',()=>null]]){
  const {t,r1}=dx01(reportedAtOf,{pick:first}),r2=step(t,1,{observations:weekFacts(t.p,1)});
  assert.ok(rowOf(r1.actualLedger,'dx01-long'),label+': accepted');
  assert.deepEqual(facts(rowOf(r2.actualLedger,'dx01-long')),facts(rowOf(r1.actualLedger,'dx01-long')),label+': kept unchanged');
 }
 // Exact timestamps: a report after its observation is kept across decisions; one before it is rejected at once, as on R7C-FREEZE-4.
 const base={athleteId:'a',sessionId:'s1',actual:{completed:true,minutes:40},response:OK};
 const ok=normalizeObservations([{...base,eventId:'e1',observedAt:'2026-11-08T08:00:00Z',reportedAt:'2026-11-08T09:00:00Z'}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 assert.equal(ok.accepted.length,1);assert.equal(ok.accepted[0].provenance.timePrecision,'EXACT');
 const again=normalizeObservations([],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:ok.accepted,recordArrival:true});
 assert.deepEqual(again.accepted.map(facts),ok.accepted.map(facts),'an exact row is carried unchanged');
 const early=normalizeObservations([{...base,eventId:'e2',observedAt:'2026-11-08T08:00:00Z',reportedAt:'2026-11-08T07:00:00Z'}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z'});
 assert.deepEqual(early.excluded.map(e=>e.reason),['REPORT_BEFORE_OBSERVATION']);
 // Day precision: a report dated before the day it reports is rejected, new or carried (the screen is not disabled for carried rows).
 const dayEarly=normalizeObservations([{...base,eventId:'e3',occurrenceDate:'2026-11-08',reportedAt:'2026-11-07T22:00:00Z'}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z'});
 assert.deepEqual(dayEarly.excluded.map(e=>e.reason),['REPORT_BEFORE_OBSERVATION']);
 const day=normalizeObservations([{...base,eventId:'e4',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T09:00:00Z'}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 assert.equal(day.accepted[0].provenance.timePrecision,'DAY');
 const tampered={...day.accepted[0],reportedAt:'2026-11-07T22:00:00.000Z'};
 assert.deepEqual(normalizeObservations([],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:[tampered]}).excluded.map(e=>e.reason),['REPORT_BEFORE_OBSERVATION']);
 // A decision on the reported day itself stores its own clock as the latest causal instant; the row is carried at later decisions.
 const today=normalizeObservations([{...base,eventId:'e5',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T12:00:00Z'}],{athleteId:'a',asOf:'2026-11-08T14:00:00Z',recordArrival:true});
 assert.equal(today.accepted[0].observedAt,'2026-11-08T14:00:00.000Z');
 const later=normalizeObservations([],{athleteId:'a',asOf:'2026-11-20T08:00:00Z',prior:today.accepted,recordArrival:true});
 assert.deepEqual(later.accepted.map(facts),today.accepted.map(facts),'kept unchanged, day precision included');
});
test('R7-D DX-01: a correction, an exact replay and a second-device duplicate of a carried same-day report work as for any report; history stays append-only',()=>{
 const base={athleteId:'a',sessionId:'s1',occurrenceDate:'2026-11-08',response:OK};
 const d1=normalizeObservations([{...base,eventId:'r1',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 const first=d1.accepted[0].provenance.firstRecordedAt;
 // Replay and a second device at the next decision: one execution, one row, the earliest first-recorded clock.
 const d2=normalizeObservations([{...base,eventId:'r1',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}},{...base,eventId:'r1-watch',reportedAt:'2026-11-09T07:00:00Z',source:{provider:'WATCH',activityId:'w1'},actual:{completed:true,minutes:41}}],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:d1.accepted,recordArrival:true});
 assert.equal(d2.accepted.length,1,'one execution');assert.deepEqual(d2.duplicates.map(d=>d.reason).sort(),['EXACT_REPLAY','SAME_EXECUTION_DIFFERENT_SOURCE']);
 assert.equal(d2.accepted[0].provenance.firstRecordedAt,first,'the earliest clock of the execution');
 // A correction at the next decision supersedes it; the original stays as history and the chain is still valid one decision later.
 const d3=normalizeObservations([{...base,eventId:'c1',correctionOf:'r1',correctedAt:'2026-11-16T08:00:00Z',actual:{completed:true,minutes:30}}],{athleteId:'a',asOf:'2026-11-16T21:00:00Z',prior:d2.accepted,recordArrival:true});
 assert.deepEqual(d3.accepted.map(o=>o.eventId),['c1']);assert.deepEqual(d3.supersededRows.map(o=>o.eventId),['r1']);
 assert.equal(d3.accepted[0].provenance.firstRecordedAt,first,'a correction reports the execution its chain reported');
 const d4=normalizeObservations([],{athleteId:'a',asOf:'2026-11-23T21:00:00Z',prior:[...d3.accepted,...d3.supersededRows],recordArrival:true});
 assert.deepEqual(d4.accepted.map(o=>o.eventId),['c1']);assert.deepEqual(d4.supersededRows.map(o=>o.eventId),['r1']);assert.deepEqual(d4.excluded,[]);
});

// ---------- DX-02 ----------
/** Weeks 0-2 executed and reviewed; then a declared break over weeks 3-4 (or `brk`), reported on day `day` of week 5. */
const PREP=new Map();
function beforeBreak(o=GEN){
 if(PREP.has(o.id))return PREP.get(o.id);
 const t=fresh(o);for(const w of [0,1,2])step(t,w,{observations:weekFacts(t.p,w)});
 PREP.set(o.id,t);return t;
}
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true});
const declare=(kind,interruption,{w=5,day=1,id='dx02-break',eligibility=null}={})=>t=>{const c=copy(t),x={day,hour:'07:00:00',kind,interruption,...(eligibility?{eligibility:eligibility(c.p)}:{})};const r=evaluateProgram(c.p,{...review(c.p,w,x),event:{id,kind},actualLedger:c.ledger,...(c.ref?{referenceState:c.ref}:{})},opts);return r;};
const executedMax=(t,beforeDay)=>Math.max(...t.ledger.filter(o=>o.context?.sport==='RUN'&&o.actual?.completed&&o.localDate<beforeDay).map(o=>o.actual.minutes));
const aheadRuns=(p,from,w)=>[...runs(p,w),...runs(p,w+1)].filter(s=>s.date>=from);
test('R7-D DX-02: a declared break inside a weekly review with no question pending is read as the known stop it is, exactly as the same break in a return report',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),wr=declare('WEEKLY_REVIEW',brk)(t),rt=declare('RETURN_AFTER_PAUSE',brk)(t);
 assert.equal(t.ref?.pending??null,null,'no question is pending');
 for(const r of [wr,rt]){assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(r.planValidity.status,VALID);}
 // Factual equivalence: the same interruption record (dates, class, identity relation, the executed state it starts from) and the same plan.
 const i=r=>{const d=r.proposal.decisions.at(-1);return {action:d.action,fromWeek:d.fromWeek,...d.interruption};};
 assert.deepEqual(i(wr),i(rt),'the same interruption is recorded');
 assert.deepEqual(wr.proposal.weeks,rt.proposal.weeks,'the same re-entry and the same weeks after it');
 assert.deepEqual(wr.proposal.stateTrace,rt.proposal.stateTrace,'the same start states');
 assert.deepEqual(wr.actualLedger.map(facts),rt.actualLedger.map(facts),'the same record');
});
test('R7-D DX-02: no stale run dose continues after a declared break; the re-entry stays within what was executed before it',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),from=addDays(t.p.weeks[5].startDate,1),ceiling=executedMax(t,brk.startDate);
 const r=declare('WEEKLY_REVIEW',brk)(t);
 const ahead=aheadRuns(r.proposal,from,5);
 assert.ok(ahead.length>0);
 for(const s of ahead.filter(s=>s.weekIndex===5))assert.ok(s.prescription.durationMinutes<=ceiling,`${s.id} ${s.prescription.durationMinutes} min is above the ${ceiling} min executed before the break`);
 assert.ok(ahead.every(s=>!['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'].includes(s.prescription.family)),'no quality work in the re-entry');
 // The stored plan's doses for those sessions are not kept (the R7C-FREEZE-4 decision kept them, VALID).
 const stale=aheadRuns(t.p,from,5).filter(s=>s.weekIndex===5);
 assert.ok(stale.some(s=>s.prescription.durationMinutes>ahead.find(x=>x.id===s.id)?.prescription.durationMinutes),'the stale doses are replaced');
});
test('R7-D DX-02: an ongoing break (its end after the review) is asked, never kept valid, through either carrier',()=>{
 const t=beforeBreak(),start=t.p.weeks[5].startDate,ongoing={startDate:start,endDate:addDays(start,9),reasonCategory:'TRAVEL',reason:'Work trip',nonclinical:true};
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){
  const r=declare(kind,ongoing,{day:2})(t);
  assert.equal(r.status,'ASK',kind);assert.equal(r.proposal,null);assert.equal(r.planValidity.status,RECON,kind);
  assert.deepEqual(r.missingInputs,['interruption.endAfterThisReview'],kind);
 }
});
test('R7-D DX-02: clinical first: a clinical flag or a clinical break reason routes to a human through either carrier and any other event',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),ill={...brk,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false};
 const flagged=p=>({...elig(addDays(p.weeks[5].startDate,1)),illness:true});
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE']){
  for(const [label,r] of [['flag',declare(kind,brk,{eligibility:flagged})(t)],['reason',declare(kind,ill)(t)]]){
   assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${kind} ${label}: ${r.reason}`);assert.equal(r.proposal,null);assert.equal(r.planValidity.status,RECON);
  }
 }
});
test('R7-D DX-02: another event that declares a break is asked, with neither its own change nor a return applied; the plan is not valid',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),from=addDays(t.p.weeks[5].startDate,1);
 // The facts-only re-plan a plain review makes at the same clock (withFactualReplan: every question carries the canonical factual state).
 const plain=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'07:00:00'}),actualLedger:t.ledger},opts),factual=plain.proposal??t.p;
 for(const [kind,extra] of [['SYSTEMIC_FATIGUE',{}],['SCHEDULE_CHANGE',{changes:{strengthDays:[0,3]}}],['MISSED_SESSION',{}]]){
  const c=copy(t),r=evaluateProgram(c.p,{...review(c.p,5,{day:1,hour:'07:00:00',kind,interruption:brk,...extra}),actualLedger:c.ledger},opts);
  assert.equal(r.status,'ASK',`${kind}: ${r.reason}`);assert.equal(r.planValidity.status,RECON);
  assert.deepEqual(r.missingInputs,['interruption.reportedOnItsOwn']);
  const p=r.proposal??t.p;
  assert.notEqual(p.decisions.at(-1).action,'REESTABLISH',kind+': no return is applied over the event');
  assert.deepEqual(runDoses(p,5),runDoses(factual,5),kind+': only the factual state, nothing of the event (no reduction, no rearrangement)');
  assert.deepEqual(p.weeks.map(x=>x.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>s.day)),factual.weeks.map(x=>x.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>s.day)),kind+': strength days unchanged');
 }
 // An empty interruption object declares nothing: the weekly review is decided as before.
 const empty=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'07:00:00',interruption:{}}),actualLedger:t.ledger},opts);
 assert.notEqual(empty.action,'REESTABLISH');assert.deepEqual(runDoses(empty.proposal??t.p,5),runDoses(factual,5));
});
test('R7-D DX-02: a weekly review that answers the unreported-training question with a declared break applies it, as the return report does',()=>{
 // Weeks 0-1 executed and reviewed, weeks 2-6 with no review and no report: week 7's review asks about the unreported runs.
 const t=fresh();for(const w of [0,1])step(t,w,{observations:weekFacts(t.p,w)});
 const q=step(copy(t),7,{day:0,hour:'07:00:00'});
 assert.equal(q.question?.kind,'UNREPORTED_TRAINING',q.reason);
 const start=t.p.weeks[2].startDate,brk={startDate:start,endDate:addDays(t.p.weeks[7].startDate,-1),reasonCategory:'WORK',reason:'Work project, no training',nonclinical:true};
 const answer=kind=>{const c=copy(t);step(c,7,{day:0,hour:'07:00:00'});const r=evaluateProgram(c.p,{...review(c.p,7,{day:1,hour:'07:00:00',kind,interruption:brk}),event:{id:'dx02-answer',kind},actualLedger:c.ledger,referenceState:c.ref},opts);return r;};
 const wr=answer('WEEKLY_REVIEW'),rt=answer('RETURN_AFTER_PAUSE');
 assert.equal(wr.action,'REESTABLISH',wr.reason);assert.equal(wr.question??null,null);assert.equal(wr.planValidity.status,VALID);
 assert.deepEqual(wr.proposal.weeks,rt.proposal.weeks,'the answer re-enters the same way through either carrier');
});

// ---------- F04 ----------
const CELL=(confounded,performance,recovery,nextDayFunction)=>({confounded,response:{performance,recovery,effort:'ON_TARGET',nextDayFunction}});
const MATRIX=[];for(const c of [false,true])for(const p of ['COMPATIBLE','UNDER'])for(const r of ['COMPATIBLE','ADVERSE'])for(const n of ['NORMAL','IMPAIRED'])MATRIX.push(CELL(c,p,r,n));
function longCell(cell){
 const t=fresh(),long=runs(t.p,0).find(s=>s.role==='LONG'),o={...obs(t.p,long,{response:cell.response}),confounded:cell.confounded};
 const r=step(t,0,{observations:[...weekFacts(t.p,0,{except:long}),o]});
 return {t,r,long};
}
test('R7-D F04: confounded × performance × recovery × next-day function: an adverse recovery or an impaired next day always holds the long run; confounding only neutralizes performance',()=>{
 for(const cell of MATRIX){
  const {r,long}=longCell(cell),{performance,recovery,nextDayFunction}=cell.response,label=JSON.stringify(cell);
  const adverseRecovery=recovery==='ADVERSE'||nextDayFunction==='IMPAIRED',adverse=adverseRecovery||!cell.confounded&&performance==='UNDER';
  assert.equal(r.weekEvidence.rows.find(x=>x.sessionId===long.id).kind,adverseRecovery||!cell.confounded&&performance==='UNDER'?'ADVERSE':cell.confounded?'CONFOUNDED':'COMPATIBLE',label);
  if(adverse)assert.ok(['HOLD','REGRESS'].includes(r.gates.LONG),`${label}: ${r.gates.LONG}`);
  else assert.equal(r.gates.LONG,'ADVANCE',`${label}: an execution with no adverse signal (performance unreadable when confounded) advances`);
 }
});
test('R7-D F04: no long-run advance follows a confounded run whose recovery was adverse or next day impaired',()=>{
 const base=longCell(CELL(false,'COMPATIBLE','COMPATIBLE','NORMAL')),longNext=p=>runs(p,1).find(s=>s.role==='LONG').prescription.durationMinutes;
 const advanced=longNext(base.t.p);
 for(const cell of MATRIX.filter(c=>c.confounded&&(c.response.recovery==='ADVERSE'||c.response.nextDayFunction==='IMPAIRED'))){
  const {t,long}=longCell(cell);
  assert.ok(longNext(t.p)<=long.prescription.durationMinutes,`${JSON.stringify(cell)}: next long ${longNext(t.p)} after ${long.prescription.durationMinutes}`);
  assert.ok(longNext(t.p)<=advanced);
 }
});
test('R7-D F04: two confounded long runs with adverse recovery within 14 days step the long run back, as two unconfounded ones do',()=>{
 for(const confounded of [false,true]){
  const t=fresh(),bad={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
  for(const w of [0,1]){const long=runs(t.p,w).find(s=>s.role==='LONG');const r=step(t,w,{observations:[...weekFacts(t.p,w,{except:long}),{...obs(t.p,long,{response:bad}),confounded}]});if(w===1)assert.equal(r.gates.LONG,'REGRESS',`confounded ${confounded}: ${JSON.stringify(r.gates)}`);}
 }
});
test('R7-D F04: a confounded strength session with an impaired next day holds its exercises; unconfounded control identical',()=>{
 for(const confounded of [false,true]){
  const t=fresh(),st=t.p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
  const r=step(t,0,{observations:[...t.p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>obs(t.p,s)),...st.map(s=>({...obs(t.p,s,{response:{nextDayFunction:'IMPAIRED'}}),confounded}))]});
  const ids=st.flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode!=='BODYWEIGHT').map(e=>e.id));
  assert.ok(ids.length>0);
  for(const id of ids)assert.ok(['HOLD','REGRESS'].includes(r.gates[id]),`confounded ${confounded} ${id}: ${r.gates[id]}`);
 }
});

// ---------- F03-A ----------
const MACHINE={id:'r7d-p3-machine',weeks:12,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],recent:{strengthDaysPerWeek:3},
 knownExercises:[K('leg-press',3,10,140,'MACHINE_STACK'),K('machine-chest-press',3,10,50,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')],
 schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}};
const MACHINES=['leg-press','machine-chest-press','seated-cable-row'];
/** A log written exactly as the row prescribes: the row's own load object, its reps and its reserve, every set. */
const asPrescribed=(p,s,id)=>({eventId:`${id}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(e.load.mode==='KNOWN'?{load:{value:e.load.value,unit:e.load.unit,convention:e.load.convention}}:{})}))}))},response:OK});
const machineRows=(p,w)=>p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>MACHINES.includes(e.id)).map(e=>({s,e})));
test('R7-D F03-A: a machine load is prescribed in the unit of its value, logged back exactly as prescribed, read, recorded and consumed by the next week',()=>{
 const t=fresh(MACHINE),w0=machineRows(t.p,0);
 assert.ok(w0.length>0);
 for(const {e} of w0){assert.equal(e.load.mode,'KNOWN');assert.equal(e.load.unit,'KG',`${e.id}: the value is kilograms`);assert.equal(e.load.convention,'MACHINE_STACK');}
 const sessions=t.p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
 const r=step(t,0,{observations:sessions.map(s=>asPrescribed(t.p,s,'f03a'))});
 assert.deepEqual((r.loadQuestions??[]).filter(q=>MACHINES.includes(q.exerciseId)),[],'every machine log is read');
 for(const row of r.weekEvidence.rows.filter(x=>x.sport==='STRENGTH'))for(const id of MACHINES.filter(id=>row.logs[id])){
  const planned=w0.find(x=>x.s.id===row.sessionId&&x.e.id===id).e;
  assert.equal(row.logs[id].unitUnknown,false,id);assert.equal(row.logs[id].load,planned.load.value,id);
 }
 // The record carries the log as sent, and the next week's machine rows continue from it (reps progress inside the range).
 for(const s of sessions)assert.deepEqual(rowOf(r.actualLedger,`f03a-${s.id}`).actual.exercises,asPrescribed(t.p,s,'f03a').actual.exercises);
 for(const id of MACHINES)assert.ok(['ADVANCE','EARNED'].includes(r.gates[id]),`${id}: ${r.gates[id]}`);
 const before=w0.find(x=>x.e.id==='leg-press').e,after=machineRows(t.p,1).find(x=>x.e.id==='leg-press').e;
 assert.ok(after.reps>before.reps||after.load.value!==before.load.value||after.sets!==before.sets,'the next week moves on from the read log');
});

// ---------- F03-B (SSCTR-R7D-F03B-r1 rule F03B-MACHINE-STEP-r1; PCG-R7D-F03B-r1 interpretation I-1) ----------
const PLATE={'leg-press':10,'machine-chest-press':5,'seated-cable-row':5,'lat-pulldown':5};
const MACHINE_LIFTS=[K('leg-press',3,10,140,'MACHINE_STACK'),K('machine-chest-press',3,10,50,'MACHINE_STACK'),K('lat-pulldown',3,10,55,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')];
const machines=goal=>({...MACHINE,id:'r7d-p3-m-'+goal,goals:{run:'NONE',strength:goal},knownExercises:MACHINE_LIFTS});
/** One athlete's log of a strength session. `next(e)`: what the athlete does on a next-setting row ({value, reps}); `known(e)`: on any other
 * loaded row ({value, reps, rir}); defaults: as prescribed (a numberless establishment row at 30 kg). */
const strengthLog=(p,s,{next=e=>({value:e.load.nextSetting.aboveKg+(PLATE[e.id]??5),reps:e.reps}),known=e=>({}),id='m'}={})=>({eventId:`${id}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,response:OK,
 actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>{
  if(e.load.mode==='BODYWEIGHT')return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir}))};
  const x=e.load.nextSetting?next(e):{value:e.load.mode==='KNOWN'?e.load.value:30,reps:e.reps,rir:e.rir,...known(e)};
  return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:x.reps??e.reps,rir:x.rir??e.rir,load:{value:x.value,unit:'KG',convention:e.load.convention}}))};
 })}});
const weekLogs=(p,w,o)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>strengthLog(p,s,{...o,id:`${o?.id??'m'}-w${w}`}));
const rowsOf=(p,w,id)=>p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===id).map(e=>({s,e})));
/**
 * Weeks [0,n) reviewed with the athlete `o`. After every decision, every machine value the plan in force states (KNOWN rows) must be one the athlete
 * had supplied, logged or confirmed by then (P1, C2): a value the engine computed first appears in a plan before any log of it, so it is caught there.
 */
function machineRun(goal,n,o={}){
 const t=fresh(machines(goal)),rs=[],stated=[],supplied=new Map(),add=(id,v)=>{if(!supplied.has(id))supplied.set(id,new Set());supplied.get(id).add(v);};
 for(const k of machines(goal).knownExercises)add(k.id,k.load.value);
 const check=at=>{for(const w of t.p.weeks)for(const s of w.sessions.filter(live))for(const e of s.prescription.exercises??[])if(e.load?.convention==='MACHINE_STACK'&&e.load.mode==='KNOWN'&&!supplied.get(e.id)?.has(e.load.value))stated.push(`${at}:${s.id}:${e.id}:${e.load.value}`);};
 check('generate');
 for(let w=0;w<n;w++){
  const extra=o.extra?.(t,w)??{},observations=(o.logs??weekLogs)(t.p,w,o);
  for(const x of observations)for(const e of x.actual?.exercises??[])for(const z of e.sets??[])if(z.load?.convention==='MACHINE_STACK')add(e.id,z.load.value);
  for(const c of extra.loadConfirmations??[])add(c.exerciseId,c.value);
  rs.push(step(t,w,{observations,...extra}));check('review'+w);
 }
 return {t,rs,stated};
}
test('R7-D F03-B T2 (C2): over every goal and athlete behaviour, no machine row states a value the athlete did not supply, log or confirm (no R±1 kg, no computed setting)',()=>{
 const behaviours={AS_PRESCRIBED:{next:e=>({value:e.load.nextSetting.aboveKg,reps:e.load.nextSetting.fallbackReps})},FITS:{},NEVER:{next:e=>({value:e.load.nextSetting.aboveKg,reps:e.load.nextSetting.fallbackReps})},
  STRUGGLES:{known:e=>({reps:Math.max(1,e.reps-3),rir:0}),next:e=>({value:e.load.nextSetting.aboveKg+(PLATE[e.id]??5),reps:Math.max(1,e.reps-3)})}};
 for(const goal of ['HYPERTROPHY','STRENGTH','GENERAL','RUNNING_SUPPORT','MAINTAIN'])for(const [name,o] of Object.entries(behaviours)){
  const {rs,stated}=machineRun(goal,10,o);
  assert.ok(rs.every(r=>!['UNSUPPORTED','HOLD'].includes(r.status)),`${goal}/${name}: ${rs.map(r=>r.status)}`);
  assert.deepEqual(stated,[],`${goal}/${name}`);
 }
});
test('R7-D F03-B T3/T4: at the top of the range a machine step is a numberless next-setting row; a verified heavier setting becomes the reference, an unverified one is asked once and never stated',()=>{
 // HYPERTROPHY 8-12: the cable row starts at 12 reps, so after week 0's review its next exposure is the step.
 const t=fresh(machines('HYPERTROPHY'));step(t,0,{observations:weekLogs(t.p,0)});
 const [{e:row}]=rowsOf(t.p,1,'seated-cable-row');
 assert.equal(row.load.mode,'FROM_LOG');assert.equal(row.load.value,undefined,'no heavier value is stated');assert.equal(row.load.unit,'KG');
 assert.deepEqual(row.load.nextSetting,{aboveKg:50,fallbackReps:12},'R stated as the fallback, at the dose held before the step');assert.equal(row.reps,8,'the existing load step’s repetition target');
 assert.match(row.instructions.join(' '),/next heavier setting this machine allows above 50 kg/);
 // Verified by a second equal log in the same week (the cable row is done on two days, both at 55): the reference at once, no question.
 const v=copy(t),r0=step(v,1,{observations:weekLogs(v.p,1)});
 assert.ok(!(r0.loadQuestions??[]).some(x=>x.exerciseId==='seated-cable-row'),JSON.stringify(r0.loadQuestions));
 assert.ok(rowsOf(v.p,2,'seated-cable-row').some(x=>x.e.load.mode==='KNOWN'&&x.e.load.value===55));
 // The leg press is done once a week: its step comes in week 2 (10 → 12 reps, then the step). One log at 150 is unverified: R stays, exactly one
 // question, and the next development week re-issues the same step relative to 140 without stating 150 (D48).
 const lp=fresh(machines('HYPERTROPHY'));for(const w of [0,1])step(lp,w,{observations:weekLogs(lp.p,w)});
 const [{e:lp2}]=rowsOf(lp.p,2,'leg-press');assert.deepEqual(lp2.load.nextSetting,{aboveKg:140,fallbackReps:12});
 const u=copy(lp),r1=step(u,2,{observations:weekLogs(u.p,2)});
 const q=(r1.loadQuestions??[]).filter(x=>x.exerciseId==='leg-press');
 assert.equal(q.length,1,JSON.stringify(r1.loadQuestions));assert.equal(q[0].reason,'MACHINE_SETTING_UNCONFIRMED');
 const later=[3,4].flatMap(w=>rowsOf(u.p,w,'leg-press').map(x=>x.e));
 assert.ok(later.length&&later.every(e=>e.load.nextSetting?.aboveKg===140||e.load.mode==='KNOWN'&&e.load.value===140),JSON.stringify(later.map(e=>e.load)));
 assert.ok(!JSON.stringify(later.map(e=>e.load)).includes('150'),'the pending value is never stated (D48)');
 // Verified by the athlete's confirmation in the same review: adopted at once, with no question.
 const c=copy(lp),r2=step(c,2,{observations:weekLogs(c.p,2),loadConfirmations:[{exerciseId:'leg-press',value:150,unit:'KG',convention:'MACHINE_STACK'}]});
 assert.ok(!(r2.loadQuestions??[]).some(x=>x.exerciseId==='leg-press'&&!x.confirmed));
 assert.ok([3,4].some(w=>rowsOf(c.p,w,'leg-press').some(x=>x.e.load.mode==='KNOWN'&&x.e.load.value===150)));
});
test('R7-D F03-B T5/T6: a heavier setting without the ADVANCE criterion is not adopted; a step logged at R holds R at the top of the range, never restarting it',()=>{
 const t=fresh(machines('HYPERTROPHY'));step(t,0,{observations:weekLogs(t.p,0)});
 // T5: 55 kg for 6 reps (target 8) with no reserve: the target is not met; R stays and the athlete is asked.
 const a=copy(t),r=step(a,1,{observations:weekLogs(a.p,1,{next:e=>({value:e.load.nextSetting.aboveKg+5,reps:6,rir:0})})});
 assert.ok((r.loadQuestions??[]).some(x=>x.exerciseId==='seated-cable-row'&&x.reason==='LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET'),JSON.stringify(r.loadQuestions));
 assert.ok(rowsOf(a.p,2,'seated-cable-row').every(x=>x.e.load.value!==55));
 // T6: the step logged at 50 kg (no heavier plate fits) at the fallback 12 reps: R holds at the top of the range; the step is offered again.
 const b=copy(t);step(b,1,{observations:weekLogs(b.p,1,{next:e=>({value:e.load.nextSetting.aboveKg,reps:e.load.nextSetting.fallbackReps})})});
 const next=rowsOf(b.p,2,'seated-cable-row').map(x=>x.e);
 assert.ok(next.length);
 for(const e of next)assert.ok(e.load.nextSetting?.aboveKg===50&&e.load.nextSetting.fallbackReps===12||e.load.mode==='KNOWN'&&e.load.value===50&&e.reps===12,JSON.stringify({load:e.load,reps:e.reps}));
 assert.ok(next.every(e=>!(e.load.mode==='KNOWN'&&e.reps<12)),'the range never restarts at R');
});
test('R7-D F03-B T7: under the STRENGTH goal (LOAD), the next-setting row appears only at due ticks; off-tick weeks state R; a verified setting is adopted',()=>{
 const {t,rs}=machineRun('STRENGTH',7,{next:e=>({value:e.load.nextSetting.aboveKg+(PLATE[e.id]??5),reps:e.reps})});
 const lp=w=>rowsOf(t.p,w,'leg-press').map(x=>x.e);
 const kinds=[...Array(7).keys()].map(w=>lp(w).map(e=>e.load.nextSetting?'STEP':e.load.mode==='KNOWN'?e.load.value:e.load.mode));
 assert.ok(kinds.flat().includes('STEP'),JSON.stringify(kinds));
 for(const [w,k] of kinds.entries())if(k.includes('STEP'))assert.ok(w===0||!kinds[w-1].includes('STEP')||rs[w-1].loadQuestions?.some(q=>q.exerciseId==='leg-press'),`week ${w}: a step follows a step only while one is pending (${JSON.stringify(kinds)})`);
 assert.ok(kinds.flat().some(v=>v===150),'the athlete’s real next plate is adopted once verified: '+JSON.stringify(kinds));
});
test('R7-D F03-B T8: REGRESS goes back to the previous adopted setting, otherwise lowers repetitions; never R minus a computed value',()=>{
 // A verified step to 55, then two adverse cable rows within 14 days: back to 50, the setting executed before.
 const t=fresh(machines('HYPERTROPHY'));step(t,0,{observations:weekLogs(t.p,0)});
 step(t,1,{observations:weekLogs(t.p,1),loadConfirmations:[{exerciseId:'seated-cable-row',value:55,unit:'KG',convention:'MACHINE_STACK'}]});
 assert.ok(rowsOf(t.p,2,'seated-cable-row').some(x=>x.e.load.value===55));
 const bad=p=>w=>weekLogs(p,w).map(o=>({...o,response:{...OK,recovery:'ADVERSE',nextDayFunction:'IMPAIRED'}}));
 for(const w of [2,3])step(t,w,{observations:bad(t.p)(w)});
 const after=[4,5].flatMap(w=>rowsOf(t.p,w,'seated-cable-row').map(x=>x.e)).filter(e=>e.load.mode==='KNOWN');
 assert.ok(after.length&&after.every(e=>[50,55].includes(e.load.value)),JSON.stringify(after.map(e=>e.load)));
 assert.ok(after.some(e=>e.load.value===50),'the previous adopted setting');
 // With no previous setting held (the intake value), REGRESS lowers repetitions by the rep step, not below the range.
 const u=fresh(machines('HYPERTROPHY'));for(const w of [0,1])step(u,w,{observations:bad(u.p)(w)});
 const lp=[2,3].flatMap(w=>rowsOf(u.p,w,'leg-press').map(x=>x.e)).filter(e=>e.load.mode==='KNOWN');
 assert.ok(lp.length&&lp.every(e=>e.load.value===140&&e.reps>=8),JSON.stringify(lp.map(e=>[e.load.value,e.reps])));
});
test('R7-D F03-B T9: a heavier machine value above a re-establishment ceiling is capped there and asked',()=>{
 // Not performed for more than the moderate return window: the leg press is re-established by effort under its earlier 140 kg ceiling.
 const t=fresh(machines('HYPERTROPHY'));step(t,0,{observations:weekLogs(t.p,0)});
 const skip=p=>w=>weekLogs(p,w).map(o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.filter(e=>e.id!=='leg-press')}}));
 for(const w of [1,2,3,4,5])step(t,w,{observations:skip(t.p)(w)});
 const re=rowsOf(t.p,6,'leg-press').map(x=>x.e);
 assert.ok(re.length&&re.every(e=>e.load.mode==='ESTABLISH'),JSON.stringify(re.map(e=>e.load)));
 const r=step(t,6,{observations:weekLogs(t.p,6,{known:e=>e.id==='leg-press'?{value:170}:{}})});
 assert.ok((r.loadQuestions??[]).some(q=>q.exerciseId==='leg-press'),JSON.stringify(r.loadQuestions));
 assert.ok([7,8].flatMap(w=>rowsOf(t.p,w,'leg-press').map(x=>x.e)).every(e=>e.load.mode!=='KNOWN'||e.load.value<=140));
});
test('R7-D F03-B T11: an athlete whose machine allows the next plate climbs by real plates; one whose next plate never fits holds at the top of the range, never oscillating',()=>{
 for(const goal of ['HYPERTROPHY','STRENGTH']){
  const fits=machineRun(goal,11,{}),never=machineRun(goal,11,{next:e=>({value:e.load.nextSetting.aboveKg,reps:e.load.nextSetting.fallbackReps})});
  const values=(t,id)=>t.p.weeks.slice(0,11).flatMap(w=>w.sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===id&&e.load.mode==='KNOWN').map(e=>e.load.value)));
  for(const id of ['leg-press','machine-chest-press']){
   const f=values(fits.t,id),n=values(never.t,id);
   assert.ok(f.every((v,i)=>i===0||v>=f[i-1]),`${goal} ${id} FITS never steps down: ${f}`);
   assert.ok(Math.max(...f)>f[0],`${goal} ${id} FITS climbs: ${f}`);
   assert.ok(f.every(v=>(v-f[0])%PLATE[id]===0),`${goal} ${id} FITS moves by the machine’s own plates: ${f}`);
   assert.ok(n.every(v=>v===n[0]),`${goal} ${id} NEVER holds its setting: ${n}`);
  }
  const askedWeeks=fits.rs.filter(r=>(r.loadQuestions??[]).some(q=>q.reason==='MACHINE_SETTING_UNCONFIRMED')).length;
  assert.ok(askedWeeks<=6,`${goal}: questions only while a step waits for verification (${askedWeeks} of 11 weeks)`);
  assert.equal(never.rs.filter(r=>(r.loadQuestions??[]).some(q=>q.reason==='MACHINE_SETTING_UNCONFIRMED')).length,0,`${goal}: an athlete who stays at R is never asked about a setting`);
 }
});
