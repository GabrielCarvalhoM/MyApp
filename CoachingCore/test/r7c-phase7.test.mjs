// R7-C Phase 7: directed tests for QE-R7C-10 (Engineering review of R7C-FREEZE-3) and SSCTR P6-F01. Whether a prior review read a run is derived
// from the canonical record available to that review (the clock at which the record first held each report, provenance.firstRecordedAt, against
// the clock of the decision that closed the report's week), never inferred from the gate that review gave: a run done shorter than prescribed, an
// adverse run or a run not done can each give HOLD or REGRESS. The answer grid is Phase 6's (R10K race week with R4 and clinical carriers, R10K
// taper and GEN week 7 with the clinical carrier; gap from week 0 or 2; RV or NR; next decision a plain review on day 3, with and without the
// re-send; reference: the same answer delivered as a plain review on day 2, DIRECT) with the answer shapes Phase 6 did not cover: shortened (60 %,
// 80 %, the long run only), shortened with misses or adverse responses, all adverse, and the mixed patterns of P6-F01.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const GEN={id:'r7c-p7-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const R10K={id:'r7c-p7-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const RECORDED=/whichever decision recorded them/;
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
let ND=0;
const notDone=(p,s)=>({eventId:`r7c-p7-nd-${s.id}-${ND++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const short=(p,s,f,x={})=>obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*f)),...x});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
/** The answers, over the gap's run sessions in date order (i its index). */
const ANSWERS={
 SHORT60:(p,s)=>[short(p,s,0.6)],
 SHORT80:(p,s)=>[short(p,s,0.8)],
 LONGSHORT:(p,s)=>[s.role==='LONG'?short(p,s,0.6):obs(p,s)],
 SHORT_MISS:(p,s)=>[s.role==='LONG'?short(p,s,0.6):notDone(p,s)],
 SHORT_ADVERSE:(p,s)=>[short(p,s,0.6,{response:BAD})],
 ALL_ADVERSE:(p,s)=>[obs(p,s,{response:BAD})],
 MIX_EXEC_MISS:(p,s,i)=>[i%2===1?notDone(p,s):obs(p,s)],
 MIX_SHORT_MISS:(p,s,i)=>[i%2===1?notDone(p,s):short(p,s,0.6)],
 MIX_EXEC_ADVERSE:(p,s,i)=>[obs(p,s,i%2===1?{response:BAD}:{})],
 // A run done (even short) inside the 30-day window is the single-run reference that makes the window known; so a partial answer that leaves it
 // unknown has the runs before the window done short and, inside it, half not done and half unreported.
 SHORT_PARTIAL:(p,s,i,b)=>(Date.parse(p.weeks[b].startDate)-Date.parse(s.date))/864e5>30?[short(p,s,0.6)]:i%2===0?[notDone(p,s)]:[]
};
const report=(p,from,to,V)=>runSessions(p,from,to).flatMap((s,i)=>ANSWERS[V](p,s,i,to));
function step(t,w,x={}){
 const r=evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},opts);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const AT=d=>({day:d,hour:'07:00:00'});
/** Weeks [0,g) executed and reviewed; [g,b-1) RV reviewed with strength only (and `onTime` reports), NR neither; the review closing week b-1 asks. */
const FORKS=new Map();
function fork(o,{g,b,mode,onTime=null}){
 const key=`${o.id}|${g}|${b}|${mode}|${onTime?'on-time':''}`;if(FORKS.has(key))return FORKS.get(key);
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:[...strengthOf(t.p,w),...(onTime?onTime(t.p,w):[])]});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1),...(onTime&&mode==='RV'?onTime(t.p,b-1):[])];
 const B=copy(t),q=step(B,b-1,{observations:strength}),out={B,question:q.question?.kind??null};
 FORKS.set(key,out);return out;
}
/** The carriers: the R4 HOLD (a schedule change in the last week) and the handler clinical route (a substitution with pain), on day 2. */
function carry(t,b,carrier,facts){
 if(carrier==='R4')return step(t,b,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
 const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return step(t,b,{...AT(2),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});
}
/** After qualified clearance the client continues with the carried record and no clinical reference state (the runtime cannot clear it, C3). */
const clear=t=>{t.ref=null;return t;};
const planFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+2).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
const runsFrom=(P,b,d,span=1)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+span).flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
const past=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
const CELLS=[['R10K race week',R10K,11,['R4','CLIN']],['R10K taper',R10K,10,['CLIN']],['GEN week 7',GEN,7,['CLIN']]];
/** Every cell of the grid for answer V (computed once per answer and shared; decisions are pure). */
const GRIDS={};
function cells(V,{onTime=null,modes=['RV','NR'],key=V}={}){
 if(GRIDS[key])return GRIDS[key];
 const out=[];
 for(const [prog,o,b,carriers] of CELLS)for(const g of [0,2])for(const mode of modes){
  const {B,question}=fork(o,{g,b,mode,onTime}),facts=report(B.p,g,b,V),label=`${prog} g=${g} ${mode} ${key}`;
  assert.equal(question,'UNREPORTED_TRAINING',label+': the review before the answer week asks');
  const direct=copy(B),d2=step(direct,b,{...AT(2),observations:facts}),d3=step(direct,b,AT(3));
  const reference={plan:planFrom(d3.proposal??direct.p,b,3),runs:runsFrom(d3.proposal??direct.p,b,3),validity:d3.planValidity?.status,d2,d3};
  for(const carrier of carriers){
   const t=copy(B),before=t.p,c=carry(t,b,carrier,facts);if(carrier==='CLIN')clear(t);
   for(const [next,x] of [['plain day 3',{}],['answer re-sent day 3',{observations:facts}]]){
    const u=copy(t),r=step(u,b,{...AT(3),...x});
    out.push({label:`${label} ${carrier} :: ${next}`,carrier,c,r,u,t,b,g,before,facts,reference,plan:planFrom(r.proposal??u.p,b,3),runs:runsFrom(r.proposal??u.p,b,3)});
   }
  }
 }
 return GRIDS[key]=out;
}
function independent(V,opt){
 let n=0;
 for(const {label,carrier,c,r,plan,runs,reference} of cells(V,opt)){
  n++;
  // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): the R4 carrier's HOLD was the internal TypeError of a
  // schedule change in the program's last week. The explicit last-week rule keeps the weeks, so that review now applies the recorded answer
  // itself and is no longer a refusal; the clinical-route carrier still records and applies nothing. The property below is unchanged.
  if(carrier==='R4')assert.ok(c.status!=='HOLD'&&!/Malformed/.test(c.reason??''),label+': the last-week schedule change decides without the error path: '+c.status);
  else{assert.ok(['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(c.status)&&!c.proposal,label+': the carrier records the answer and applies nothing: '+c.status);
  assert.notEqual(c.planValidity?.status,VALID,label+': the carrier decision is never valid');}
  assert.deepEqual(runs,reference.runs,label+': the runs ahead follow the facts, as the direct answer');
  assert.deepEqual(plan,reference.plan,label+': the plan in force equals the direct answer\'s');
  assert.equal(r.planValidity?.status,reference.validity,label+': same validity');
 }
 return n;
}
/** A timely athlete: every session reported on its day and every week reviewed on its last day, the runs as `fact` gives them. */
function timely(fact,weeks=6){
 const t={p:program(GEN),ledger:[],ref:null},reviews=[];
 for(let w=0;w<weeks;w++)reviews.push(step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>s.sport==='RUN'?fact(t.p,s):obs(t.p,s))}));
 return {t,reviews};
}
const runGates=r=>Object.entries(r.gates??{}).filter(([k])=>['EASY','LONG','QUALITY','WALK_JOG'].includes(k)).map(([,g])=>g);
/** The clock of the review that closed week j (its next start is WEEK_EVIDENCE), else null (a projected week has no closing review). */
const closingClock=(P,j)=>{const a=P.weeks[j+1].startAuthority.RUN;return a.provenance==='WEEK_EVIDENCE'?a.evidenceThrough:null;};
/** The decisions of a timely week before its own review: each later day, a plain review; the plan stands (no re-plan, the same rows, valid). */
function stands(label,{t},w=6){
 for(const d of [1,2,3,4,5]){
  const u=copy(t),stored=planFrom(t.p,w,d),r=step(u,w,AT(d));
  assert.ok(!RECORDED.test(r.reason??''),`${label} day ${d}: no recorded-answer re-plan: ${r.reason}`);
  assert.equal(r.action,'KEEP',`${label} day ${d}: ${r.action} ${r.reason}`);
  assert.deepEqual(planFrom(r.proposal??u.p,w,d),stored,`${label} day ${d}: the plan in force is the stored one`);
  assert.equal(r.planValidity?.status,VALID,`${label} day ${d}`);
 }
}

// ---------- evidence visibility ----------
test('R7-C QE-R7C-10 visibility (1): a review that had the run reports by its clock read them, though every run gate it gave was HOLD (runs done short): the plan stands mid-week',()=>{
 const T=timely((p,s)=>short(p,s,0.6));
 for(const [j,r] of T.reviews.entries()){
  assert.ok(runGates(r).length&&runGates(r).every(g=>g==='HOLD'),`week ${j}: every run gate HOLD: ${runGates(r)}`);
  const clock=Date.parse(closingClock(T.t.p,j)),reports=T.t.ledger.filter(o=>o.context?.sport==='RUN'&&o.context.weekIndex===j);
  assert.ok(reports.length&&reports.every(o=>Date.parse(o.provenance.firstRecordedAt)<=clock),`week ${j}: the record held every run report by the review's clock`);
 }
 stands('timely, runs at 60 %',T);
});
test('R7-C QE-R7C-10 visibility (2) and all-adverse (11): a review that read adverse runs and gave REGRESS read them; REGRESS is never read as "the review read no run"',()=>{
 const T=timely((p,s)=>obs(p,s,{response:BAD}));
 for(const [j,r] of T.reviews.entries()){
  const g=runGates(r);assert.ok(g.includes('REGRESS')&&!g.some(x=>['ADVANCE','EARNED'].includes(x)),`week ${j}: a REGRESS gate and no executed one: ${g}`);
  const clock=Date.parse(closingClock(T.t.p,j));
  assert.ok(T.t.ledger.filter(o=>o.context?.sport==='RUN'&&o.context.weekIndex===j).every(o=>Date.parse(o.provenance.firstRecordedAt)<=clock),`week ${j}: reports held by the review's clock`);
 }
 stands('timely, every run adverse',T);
});
test('R7-C QE-R7C-10 visibility (3): a report the record first held after the review closed its week was not read by it, whatever gate the week gives; the next eligible decision reconciles it',()=>{
 const V='SHORT60',cell=cells(V).find(x=>x.label.startsWith('GEN week 7 g=0 RV')&&x.carrier==='CLIN'&&/re-sent/.test(x.label));
 const carrierClock=Date.parse(`${addDays(cell.before.weeks[7].startDate,2)}T07:00:00Z`);let closed=0;
 for(const f of cell.facts){
  const row=cell.u.ledger.find(o=>o.sessionId===f.sessionId),clock=closingClock(cell.before,row.context.weekIndex);
  assert.equal(Date.parse(row.provenance.firstRecordedAt),carrierClock,f.sessionId+': first recorded by the carrier on day 2; the re-send keeps that clock');
  if(clock){closed++;assert.ok(Date.parse(row.provenance.firstRecordedAt)>Date.parse(clock),f.sessionId+': after the review that closed its week');}
 }
 assert.ok(closed>=6,'reports of weeks a review closed with HOLD gates: '+closed);
 assert.equal(cell.r.action,'REPLAN_FROM_EVIDENCE',cell.r.reason);assert.match(cell.r.reason,RECORDED);
 assert.deepEqual(cell.runs,cell.reference.runs);assert.equal(cell.r.planValidity?.status,VALID);
 assert.deepEqual(runsFrom(cell.before,7,3),['QUALITY:34','LONG:60'],'the stale projection QE-R7C-10 left valid on R7C-FREEZE-3');
 assert.ok(cell.runs.every(x=>!/^QUALITY/.test(x)),'the shortened answer rules the quality session out: '+cell.runs);
});
test('R7-C QE-R7C-10 visibility (4): reports of one week held by its review and reports recorded after it are read and unread one by one',()=>{
 // RV weeks: the long run reported not done on its day (a known stop the review read); the easy runs unreported, then answered done short.
 const onTime=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.role==='LONG').map(s=>notDone(p,s));
 const easyShort=(p,from,to)=>runSessions(p,from,to).filter(s=>s.role!=='LONG').map(s=>short(p,s,0.6));
 let n=0;
 for(const [prog,o,b,carriers] of CELLS)for(const g of [0,2]){
  const {B,question}=fork(o,{g,b,mode:'RV',onTime});assert.equal(question,'UNREPORTED_TRAINING',prog);
  const facts=easyShort(B.p,g,b),direct=copy(B);step(direct,b,{...AT(2),observations:facts});const d3=step(direct,b,AT(3));
  for(const carrier of carriers){
   const t=copy(B);carry(t,b,carrier,facts);if(carrier==='CLIN')clear(t);
   let closed=0;
   for(let j=g;j<b;j++){
    const at=closingClock(B.p,j);if(!at)continue;closed++;
    const clock=Date.parse(at),rows=t.ledger.filter(o=>o.context?.sport==='RUN'&&o.context.weekIndex===j);
    assert.ok(rows.some(o=>o.context.role==='LONG'&&Date.parse(o.provenance.firstRecordedAt)<=clock),`${prog} week ${j}: the known stop held by its review`);
    assert.ok(rows.some(o=>o.context.role!=='LONG'&&Date.parse(o.provenance.firstRecordedAt)>clock),`${prog} week ${j}: the easy runs recorded after it`);
   }
   assert.ok(closed>0,`${prog} g=${g}: some week a review closed`);
   const r=step(t,b,AT(3));n++;
   assert.deepEqual(planFrom(r.proposal??t.p,b,3),planFrom(d3.proposal??direct.p,b,3),`${prog} g=${g} ${carrier}: the direct answer's plan`);
   assert.equal(r.planValidity?.status,d3.planValidity?.status,`${prog} g=${g} ${carrier}`);
  }
 }
 assert.equal(n,8);
 // A week whose review read a run done (short, on its day) keeps that run read when other reports of the week arrive later: the stored plan knew
 // the window, so the late reports leave the projection standing (Property B), whichever decision records them.
 const t={p:program(GEN),ledger:[],ref:null};
 for(let w=0;w<6;w++)step(t,w,{observations:[...strengthOf(t.p,w),...t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.role==='LONG').map(s=>short(t.p,s,0.6))]});
 const late=runSessions(t.p,0,6).filter(s=>s.role!=='LONG').map(s=>obs(t.p,s)),stored=planFrom(t.p,6,3);
 const d=copy(t);const dr=step(d,6,{...AT(2),observations:late});
 const c=copy(t);carry(c,6,'CLIN',late);clear(c);const cr=step(c,6,AT(3)),dr3=step(d,6,AT(3));
 for(const [x,r,label] of [[d,dr,'direct day 2'],[d,dr3,'direct day 3'],[c,cr,'clinical then clearance, day 3']]){
  assert.ok(!RECORDED.test(r.reason??''),label+': '+r.reason);assert.equal(r.proposal??null,null,label);assert.deepEqual(planFrom(x.p,6,3),stored,label);
 }
});

// ---------- shortened ----------
test('R7-C QE-R7C-10 shortened (5): every gap run done at 60 % of its minutes, recorded by an R4 HOLD or a clinical route, gives the direct answer\'s plan',()=>{
 assert.equal(independent('SHORT60'),32);
});
test('R7-C QE-R7C-10 shortened (6): every gap run done at 80 %, recorded by a carrier, gives the direct answer\'s plan',()=>{
 assert.equal(independent('SHORT80'),32);
});
test('R7-C QE-R7C-10 shortened (7): the long runs shortened (60 %), the rest done, recorded by a carrier, gives the direct answer\'s plan',()=>{
 assert.equal(independent('LONGSHORT'),32);
});
test('R7-C QE-R7C-10 shortened (8): the long runs shortened, the rest not done, recorded by a carrier, gives the direct answer\'s plan',()=>{
 assert.equal(independent('SHORT_MISS'),32);
});
test('R7-C QE-R7C-10 shortened (9): every gap run shortened with an adverse response, recorded by a carrier, gives the direct answer\'s plan',()=>{
 assert.equal(independent('SHORT_ADVERSE'),32);
});

// ---------- all adverse ----------
test('R7-C QE-R7C-10 all-adverse (10): every gap run done with an adverse response, recorded by a carrier, gives the direct answer\'s plan, never the stale projection',()=>{
 assert.equal(independent('ALL_ADVERSE'),32);
 const cell=cells('ALL_ADVERSE').find(x=>x.label.startsWith('GEN week 7 g=0 RV')&&x.carrier==='CLIN'&&/plain/.test(x.label));
 assert.deepEqual(runsFrom(cell.before,7,3),['QUALITY:34','LONG:60']);assert.notDeepEqual(cell.runs,runsFrom(cell.before,7,3));
 assert.ok(cell.runs.every(x=>!/^QUALITY/.test(x))&&Number(cell.runs.find(x=>x.startsWith('LONG'))?.split(':')[1])<60,'adverse runs: no quality, a shorter long run: '+cell.runs);
});

// ---------- mixed (SSCTR P6-F01) ----------
test('R7-C P6-F01 mixed: some runs done, some not done; some done short, some not done; some done, some adverse: recorded by a carrier, each gives the direct answer\'s plan',()=>{
 for(const V of ['MIX_EXEC_MISS','MIX_SHORT_MISS','MIX_EXEC_ADVERSE'])assert.equal(independent(V),32,V);
 // The SSCTR's reproduction: GEN, weeks 0-5 reviewed with strength only, every other run not done, a substitution with pain, clearance, a plain
 // day-3 decision: the stale QUALITY 34 / LONG 60 stayed valid on R7C-FREEZE-3 where the direct answer plans easy running and a shorter long run.
 const cell=cells('MIX_EXEC_MISS').find(x=>x.label.startsWith('GEN week 7 g=0 RV')&&x.carrier==='CLIN'&&/plain/.test(x.label));
 assert.deepEqual(runsFrom(cell.before,7,3),['QUALITY:34','LONG:60']);
 assert.equal(cell.r.action,'REPLAN_FROM_EVIDENCE',cell.r.reason);assert.deepEqual(cell.runs,cell.reference.runs);
 assert.ok(cell.runs.every(x=>!/^QUALITY/.test(x))&&Number(cell.runs.find(x=>x.startsWith('LONG'))?.split(':')[1])<60,cell.runs.join('/'));
});

// ---------- invariants ----------
test('R7-C QE-R7C-10 (12): true unread still reconciles: wherever the facts change the plan, the carrier\'s next decision re-plans from the record',()=>{
 // Answers whose every gap session has an executed report: no session is credited, so the ceiling re-plan cannot act and the recorded-answer
 // re-plan alone reconciles (RV weeks closed with HOLD gates, NR weeks projected).
 let replanned=0;const modes=new Set();
 for(const V of ['SHORT60','SHORT80','LONGSHORT','SHORT_ADVERSE','ALL_ADVERSE'])for(const {label,carrier,c,r,reference,before,b} of cells(V)){
  if(JSON.stringify(reference.plan)===JSON.stringify(planFrom(before,b,3)))continue;
  replanned++;modes.add(label.split(' ').find(x=>x==='RV'||x==='NR'));
  // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): the R4 carrier (a schedule change in the program's last
  // week) no longer refuses with the internal TypeError: it applies the answer it carries itself, as the direct answer does on day 2, so the
  // reconciliation is its own decision and the next one has nothing left to re-plan. The clinical-route carrier is unchanged.
  if(carrier==='R4'){assert.equal(c.action,reference.d2.action,label+': '+c.reason);continue;}
  assert.equal(r.action,'REPLAN_FROM_EVIDENCE',label+': '+r.reason);assert.match(r.reason,RECORDED,label);
 }
 assert.ok(replanned>=40&&modes.has('RV')&&modes.has('NR'),'cells where the facts change the plan: '+replanned+' '+[...modes]);
});
test('R7-C QE-R7C-10 (13): an answer that reports earlier runs done short but leaves part of the window unknown still asks, never valid, as the direct partial answer',()=>{
 let withShort=0;
 for(const {label,r,reference,facts} of cells('SHORT_PARTIAL')){
  if(facts.some(f=>f.actual.completed))withShort++;
  assert.equal(r.status,'ASK',label);assert.equal(r.question?.kind,'UNREPORTED_TRAINING',label);
  assert.equal(r.proposal??null,null,label);assert.equal(r.planValidity?.status,'REQUIRES_RECONCILIATION',label);
  assert.equal(reference.d3.status,'ASK',label+': as the direct partial answer');
 }
 assert.ok(withShort>=16,'cells whose answer has runs done short before the window: '+withShort);
});
test('R7-C QE-R7C-10 (14): the reconciliation never rewrites history, and the first-recorded clock never enters HistoricalState',()=>{
 let n=0;
 for(const V of ['SHORT60','SHORT_MISS','ALL_ADVERSE','MIX_SHORT_MISS'])for(const {label,r,u,t,b} of cells(V)){
  if(!r.proposal)continue;n++;
  assert.deepEqual(past(r.proposal,b,3),past(t.p,b,3),label+': every session dated before the decision keeps its row');
  assert.ok(r.proposal.decisions.length===t.p.decisions.length+1&&hash(r.proposal.decisions.slice(0,-1))===hash(t.p.decisions),label+': the decision log is append-only');
 }
 assert.ok(n>=20,'re-plans checked: '+n);
 const cell=cells('SHORT60').find(x=>x.label.startsWith('GEN week 7 g=0 RV')&&x.carrier==='CLIN'),asOf=`${addDays(cell.before.weeks[7].startDate,3)}T07:00:00Z`;
 const bare=cell.t.ledger.map(o=>{const {firstRecordedAt,...provenance}=o.provenance;return {...o,provenance};});
 assert.ok(cell.t.ledger.some(o=>o.provenance.firstRecordedAt)&&bare.every(o=>!('firstRecordedAt' in o.provenance)));
 assert.deepEqual(historicalStateOf(cell.before,{asOf,actualLedger:cell.t.ledger},opts),historicalStateOf(cell.before,{asOf,actualLedger:bare},opts));
});
test('R7-C QE-R7C-10 (15): clinical first: while the route stands a shortened answer prescribes nothing; after clearance it is applied with no re-send',()=>{
 for(const V of ['SHORT60','SHORT_MISS','MIX_SHORT_MISS'])for(const [prog,o,b] of CELLS){
  const {B}=fork(o,{g:0,b,mode:'RV'}),facts=report(B.p,0,b,V),direct=copy(B);step(direct,b,{...AT(2),observations:facts});const d3=step(direct,b,AT(3));
  const t=copy(B),c=carry(t,b,'CLIN',facts);
  assert.equal(c.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(c.proposal??null,null);
  assert.ok(facts.every(f=>t.ledger.some(x=>x.sessionId===f.sessionId)),'the answer is in the carried record');
  const held=copy(t),h=step(held,b,AT(3));
  assert.equal(h.status,'CLINICAL_HUMAN_REQUIRED',`${prog} ${V}`);assert.equal(h.proposal??null,null);assert.equal(h.planValidity?.status,'REQUIRES_RECONCILIATION');
  clear(t);const r=step(t,b,AT(3));
  assert.deepEqual(planFrom(r.proposal??t.p,b,3),planFrom(d3.proposal??direct.p,b,3),`${prog} ${V}: after clearance, the direct answer's plan`);
  assert.equal(r.planValidity?.status,d3.planValidity?.status,`${prog} ${V}`);
 }
});
test('R7-C QE-R7C-10 (16): no decision presents the stale projection as valid once the record holds the answer (shortened, adverse, mixed)',()=>{
 let n=0;
 for(const V of Object.keys(ANSWERS).filter(x=>x!=='SHORT_PARTIAL'))for(const {label,r,b,before,plan,reference} of cells(V)){
  n++;const storedPlan=planFrom(before,b,3);
  if(r.planValidity?.status===VALID)assert.deepEqual(plan,reference.plan,label+': a valid plan is the facts\' plan');
  if(JSON.stringify(storedPlan)!==JSON.stringify(reference.plan))assert.ok(!(r.planValidity?.status===VALID&&JSON.stringify(plan)===JSON.stringify(storedPlan)),label+': the stale projection is never valid');
 }
 assert.equal(n,9*32);
});

// ---------- the first-recorded clock ----------
test('R7-C QE-R7C-10 record: the runtime stamps the clock it first held a report at, never a value the input supplies; one execution keeps its earliest; the learning model holds none',()=>{
 const p=program(GEN),s=p.weeks[0].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.role==='EASY'),T1='2026-11-03T21:00:00Z',T2='2026-11-05T07:00:00Z';
 const base={athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T08:00:00Z`,actual:{completed:true,minutes:s.prescription.durationMinutes},response:{}};
 const forged={...base,eventId:'p7-forged',provenance:{firstRecordedAt:'2020-01-01T00:00:00Z'}};
 const n1=normalizeObservations([forged],{athleteId:p.athleteId,asOf:T1,maximumAgeDays:36500,recordArrival:true});
 assert.equal(n1.accepted[0].provenance.firstRecordedAt,new Date(T1).toISOString(),'the decision clock, not the supplied value');
 // An agreeing report of the same execution from a second source, recorded later, merges into the first: the earliest clock stays.
 const watch={...base,eventId:'p7-watch',source:{provider:'WATCH',activityId:'a1'}};
 const n2=normalizeObservations([watch],{athleteId:p.athleteId,asOf:T2,maximumAgeDays:36500,prior:n1.accepted,recordArrival:true});
 assert.equal(n2.accepted.length,1);assert.equal(n2.accepted[0].provenance.firstRecordedAt,new Date(T1).toISOString());
 // The same report re-sent keeps its first clock.
 const n3=normalizeObservations([forged],{athleteId:p.athleteId,asOf:T2,maximumAgeDays:36500,prior:n1.accepted,recordArrival:true});
 assert.equal(n3.duplicates[0]?.reason,'EXACT_REPLAY');assert.equal(n3.accepted[0].provenance.firstRecordedAt,new Date(T1).toISOString());
 // A correction reports the execution its chain reported: the record first held a report of it at the original's clock.
 const corr={...base,eventId:'p7-corr',correctionOf:'p7-forged',correctedAt:T2,actual:{completed:true,minutes:20}};
 const n4=normalizeObservations([corr],{athleteId:p.athleteId,asOf:T2,maximumAgeDays:36500,prior:n1.accepted,recordArrival:true});
 assert.equal(n4.accepted.find(o=>o.eventId==='p7-corr').provenance.firstRecordedAt,new Date(T1).toISOString());
 // Without recordArrival (the learning model, the legacy path) no new row carries one, and a supplied value is dropped.
 const n5=normalizeObservations([forged],{athleteId:p.athleteId,asOf:T1,maximumAgeDays:36500});
 assert.ok(!('firstRecordedAt' in n5.accepted[0].provenance));
 const r=evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(live).map(x=>obs(p,x)),learningConsent:true}),opts);
 assert.ok(r.actualLedger.length&&r.actualLedger.every(o=>o.provenance.firstRecordedAt===new Date(r.referenceState.asOf).toISOString()),'the decision stamps its own reports with its clock');
 assert.ok(r.updatedModel.observations.length&&r.updatedModel.observations.every(o=>!('firstRecordedAt' in (o.provenance??{}))),'the learning model holds no first-recorded clock');
});
test('R7-C QE-R7C-10 backward behaviour: a record written before R7C-FREEZE-4 (no first-recorded clocks) is read as R7C-FREEZE-3 read it',()=>{
 // Gate-class rule, kept only for such records: sound for full-dose and adverse answers (REGRESS counts as an executed run), so they still reconcile;
 // a shortened answer reads HOLD either way and keeps R7C-FREEZE-3's reading (disclosed: such a record does not say when its reports arrived).
 const strip=t=>{t.ledger=t.ledger.map(o=>{const {firstRecordedAt,...provenance}=o.provenance??{};return {...o,provenance};});return t;};
 for(const [V,reconciled] of [['ALL_ADVERSE',true],['SHORT60',false]]){
  const {B}=fork(GEN,{g:0,b:7,mode:'RV'}),facts=report(B.p,0,7,V),direct=copy(B);step(direct,7,{...AT(2),observations:facts});const d3=step(strip(direct),7,AT(3));
  const t=copy(B),stale=planFrom(t.p,7,3);carry(t,7,'CLIN',facts);clear(strip(t));const r=step(t,7,AT(3));
  if(reconciled){assert.match(r.reason??'',RECORDED,V);assert.deepEqual(planFrom(r.proposal??t.p,7,3),planFrom(d3.proposal??direct.p,7,3),V);}
  else{assert.ok(!RECORDED.test(r.reason??''),V);assert.deepEqual(planFrom(t.p,7,3),stale,V+': the R7C-FREEZE-3 reading');}
 }
});
