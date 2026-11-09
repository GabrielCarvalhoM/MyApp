// R7-C Phase 6: directed tests for QE-R7C-07 (Engineering recheck of R7C-FREEZE-2). An answer to UNREPORTED_TRAINING that a decision recorded
// without applying it (a refusal: the R4 HOLD of a schedule change in the program's last week; a handler clinical route: a substitution with pain)
// is applied by the next eligible decision from the canonical record, whichever decision recorded it, with no re-send (answeredOnRecord):
// same answer + same record + same clock + same safety state = same plan. The grid is the recheck's own (rc-p4-recorder-independence.mjs):
// R10K race week (R4 and clinical), R10K taper and GEN week 7 (clinical); gap from week 0 or 2; RV or NR; next decision a plain review on day 3,
// with and without the re-send; reference: the same answer delivered as a plain review on day 2 (DIRECT).
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const GEN={id:'r7c-p6-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const R10K={id:'r7c-p6-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const RECORDED=/whichever decision recorded them/,CEILING=/exceed what the recorded runs allow/;
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
let ND=0;
const notDone=(p,s)=>({eventId:`r7c-p6-nd-${s.id}-${ND++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
/** The answer: MISS every gap run not done; EXEC all done; MIXED the long runs done, the rest not; ADVERSE all done, the long runs with an adverse
 * response; PARTIAL half not done, the rest still unreported. */
const report=(p,from,to,V)=>runSessions(p,from,to).flatMap((s,i)=>V==='PARTIAL'?(i%2===0?[notDone(p,s)]:[]):[V==='MISS'||V==='MIXED'&&s.role!=='LONG'?notDone(p,s):obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{})]);
function step(t,w,x={}){
 const r=evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},opts);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const AT=d=>({day:d,hour:'07:00:00'});
/** Weeks [0,g) executed and reviewed; [g,b-1) RV reviewed with strength only, NR neither; the review at the end of week b-1 asks. */
function fork(o,{g,b,mode,V}){
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),B=copy(t),q=step(B,b-1,{observations:strength});
 return {B,facts,question:q.question?.kind??null};
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
const runsFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
const past=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
const CELLS=[['R10K race week',R10K,11,['R4','CLIN']],['R10K taper',R10K,10,['CLIN']],['GEN week 7',GEN,7,['CLIN']]];
/** Every cell of the grid for answer V: DIRECT's plan from day 3 against each carrier's, after a plain day-3 review and after the re-send.
 * Computed once per answer and shared by the tests that read it (the decisions are pure: the same input gives the same result). */
const GRIDS={};
function cells(V){
 if(GRIDS[V])return GRIDS[V];
 const out=[];
 for(const [prog,o,b,carriers] of CELLS)for(const g of [0,2])for(const mode of ['RV','NR']){
  const {B,facts,question}=fork(o,{g,b,mode,V}),label=`${prog} g=${g} ${mode} ${V}`;
  assert.equal(question,'UNREPORTED_TRAINING',label+': the review before the answer week asks');
  const direct=copy(B),d2=step(direct,b,{...AT(2),observations:facts}),d3=step(direct,b,AT(3));
  const reference={plan:planFrom(d3.proposal??direct.p,b,3),runs:runsFrom(d3.proposal??direct.p,b,3),validity:d3.planValidity?.status,d2,d3};
  for(const carrier of carriers){
   const t=copy(B),before=t.p,c=carry(t,b,carrier,facts);if(carrier==='CLIN')clear(t);
   for(const [next,x] of [['plain day 3',{}],['answer re-sent day 3',{observations:facts}]]){
    const u=copy(t),r=step(u,b,{...AT(3),...x});
    out.push({label:`${label} ${carrier} :: ${next}`,carrier,c,r,u,b,before,facts,reference,plan:planFrom(r.proposal??u.p,b,3),runs:runsFrom(r.proposal??u.p,b,3)});
   }
  }
 }
 return GRIDS[V]=out;
}
const grid=(V,visit)=>cells(V).forEach(visit);
function independent(V){
 let n=0;
 grid(V,({label,carrier,c,r,plan,runs,reference})=>{
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
 });
 return n;
}

test('R7-C QE-R7C-07: an EXECUTED answer recorded by an R4 HOLD or a clinical route gives the plan the direct answer gives (recorder independence)',()=>{
 assert.equal(independent('EXEC'),32);
});
test('R7-C QE-R7C-07: a MIXED answer (long runs done, the rest not) recorded by an R4 HOLD or a clinical route gives the direct answer\'s plan',()=>{
 assert.equal(independent('MIXED'),32);
});
test('R7-C QE-R7C-07: an ADVERSE answer (done, the long runs with an adverse response) recorded by an R4 HOLD or a clinical route gives the direct answer\'s plan',()=>{
 assert.equal(independent('ADVERSE'),32);
});

test('R7-C QE-R7C-07: a known stop (MISS) recorded by a carrier is unchanged from R7C-FREEZE-2: the ceiling re-plan applies it, as the direct answer',()=>{
 let replanned=0;
 grid('MISS',({label,r,plan,reference})=>{
  assert.deepEqual(plan,reference.plan,label);assert.equal(r.planValidity?.status,reference.validity,label);
  assert.ok(!RECORDED.test(r.reason??''),label+': the recorded-answer re-plan never pre-empts the ceiling re-plan');
  if(r.action==='REPLAN_FROM_EVIDENCE'){replanned++;assert.match(r.reason,CEILING,label);}
 });
 assert.ok(replanned>0);
});

test('R7-C QE-R7C-07: a PARTIAL answer recorded by a carrier still leaves part of the window unknown: the next decision asks, never valid',()=>{
 grid('PARTIAL',({label,r,reference})=>{
  assert.equal(r.status,'ASK',label);assert.equal(r.question?.kind,'UNREPORTED_TRAINING',label);
  assert.equal(r.proposal??null,null,label);assert.equal(r.planValidity?.status,'REQUIRES_RECONCILIATION',label);
  assert.equal(reference.d3.status,'ASK',label+': as the direct partial answer');
 });
});

test('R7-C QE-R7C-07: while the clinical route stands nothing is prescribed; after qualified clearance the recorded facts are applied with no re-send',()=>{
 const b=7,{B,facts}=fork(GEN,{g:0,b,mode:'RV',V:'ADVERSE'});
 const direct=copy(B);step(direct,b,{...AT(2),observations:facts});const d3=step(direct,b,AT(3));
 const t=copy(B),stale=runsFrom(t.p,b,3),c=carry(t,b,'CLIN',facts);
 assert.equal(c.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(c.proposal??null,null);
 assert.ok(facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId)),'the answer is in the carried record');
 // The clinical reference state still in force: the dependency stands, no prescription, the facts stay facts.
 const held=copy(t),h=step(held,b,AT(3));
 assert.equal(h.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(h.proposal??null,null);assert.equal(h.planValidity?.status,'REQUIRES_RECONCILIATION');
 assert.ok(facts.every(f=>held.ledger.some(o=>o.sessionId===f.sessionId)),'the recorded answer stays in the record');
 // Qualified clearance (no clinical reference state), then a plain review with no observations: the facts are reconciled.
 clear(t);const r=step(t,b,AT(3));
 assert.equal(r.action,'REPLAN_FROM_EVIDENCE',r.reason);assert.match(r.reason,RECORDED);assert.equal(r.planValidity?.status,VALID);
 assert.deepEqual(runsFrom(t.p,b,3),runsFrom(direct.p,b,3));assert.notDeepEqual(runsFrom(t.p,b,3),stale);
 assert.deepEqual(stale,['QUALITY:34','LONG:60'],'the stale projection the adverse answer must not leave in force');
 assert.ok(runsFrom(t.p,b,3).every(x=>!/^QUALITY/.test(x))&&Number(runsFrom(t.p,b,3).find(x=>x.startsWith('LONG'))?.split(':')[1])<60,'the adverse long runs shorten the long run, no quality: '+runsFrom(t.p,b,3));
 assert.equal(d3.planValidity?.status,VALID);
});

test('R7-C QE-R7C-07: no decision presents the stale projection as valid once the record holds the answer (race touch, taper quality, long run)',()=>{
 for(const V of ['EXEC','MIXED','ADVERSE'])grid(V,({label,r,u,b,before,plan,reference})=>{
  const storedPlan=planFrom(before,b,3);
  if(r.planValidity?.status===VALID)assert.deepEqual(plan,reference.plan,label+': a valid plan is the facts\' plan');
  if(JSON.stringify(storedPlan)!==JSON.stringify(reference.plan))assert.ok(!(r.planValidity?.status===VALID&&JSON.stringify(plan)===JSON.stringify(storedPlan)),label+': the stale projection is never valid');
 });
});

test('R7-C QE-R7C-07: the same record, program, clock and safety state give the same decision whichever decision recorded the answer (determinism)',()=>{
 const b=11,{B,facts}=fork(R10K,{g:2,b,mode:'RV',V:'MIXED'});
 const viaR4=copy(B);carry(viaR4,b,'R4',facts);
 const viaClin=clear((()=>{const t=copy(B);carry(t,b,'CLIN',facts);return t;})());
 const rev=review(viaR4.p,b,AT(3)),decide=t=>evaluateProgram(t.p,{...rev,actualLedger:t.ledger},opts);
 const a=decide(viaR4),a2=decide(viaR4),c=decide(viaClin),c2=decide(viaClin);
 assert.equal(hash(a),hash(a2),'the same input decides the same');
 assert.equal(hash(c),hash(c2),'the same input decides the same');
 // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): the R4 carrier was the last-week schedule change's internal
 // TypeError. The explicit last-week rule keeps the weeks, so that review now applies the recorded answer itself: its record is the re-planned
 // program, no longer the clinical route's unchanged one. Determinism is asserted per path, and both paths end on the direct answer's race week.
 assert.deepEqual(runsFrom(a.proposal??viaR4.p,b,3),['EASY:20','RACE:75'],'race week after a mixed answer: no race touch, as the direct answer');
 assert.deepEqual(runsFrom(c.proposal,b,3),['EASY:20','RACE:75'],'race week after a mixed answer: no race touch, as the direct answer');
});

test('R7-C QE-R7C-07: the re-plan of a recorded answer never rewrites history: every session dated before the decision keeps its row',()=>{
 for(const V of ['EXEC','MIXED','ADVERSE'])grid(V,({label,r,u,b,before})=>{
  if(!r.proposal)return;
  assert.deepEqual(past(r.proposal,b,3),past(before,b,3),label);
 });
});

test('R7-C QE-R7C-07 scope: a late report of a session in a week a review already read leaves the projection standing (Property B), as in R7C-FREEZE-2',()=>{
 // Weeks 0-3 executed and reviewed on time, except one easy run of week 3 reported only on day 2 of week 4.
 const t={p:program(R10K),ledger:[],ref:null};let held=null;
 for(let w=0;w<4;w++){const sessions=t.p.weeks[w].sessions.filter(live).filter(s=>!(w===3&&!held&&s.sport==='RUN'&&s.role==='EASY'&&(held=s)));step(t,w,{observations:sessions.map(s=>obs(t.p,s))});}
 const stored=runsFrom(t.p,4,2),r=step(t,4,{...AT(2),observations:[obs(t.p,held)]});
 assert.ok(!RECORDED.test(r.reason??''),r.reason);assert.equal(r.planValidity?.status,VALID);
 assert.deepEqual(runsFrom(r.proposal??t.p,4,2),stored,'the late record alone re-plans nothing');
});

test('R7-C QE-R7C-07 reach: a plan that rests on projection over its whole run window follows the record of that window, however it was reported',()=>{
 // The R7-A judge's P51 history (test/r7asm-state-model.test.mjs before its Phase 6 pin): weeks 0-4 executed and reviewed (KEEP from week 2 on, so
 // no evidence anchor), weeks 5-6 reported day by day but for Saturday's lift, never reviewed. Week 7's run window then holds only weeks the stored
 // plan projected: the same program and record as an answer a refusal or a clinical route recorded. Its first decision re-plans from the facts: the
 // Saturday-only lifts follow history (R7C-FREEZE-2 kept the projection two steps ahead). History itself is never written by the re-plan.
 const SAT=s=>s.sport==='STRENGTH'&&s.day===5;
 const t={p:program({id:'r7c-p6-p51',weeks:16,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND'),{id:'db-split-squat',familiar:true}],schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}}),ledger:[],ref:null};
 for(let w=0;w<5;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 const last=[];
 for(const w of [5,6]){for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&!SAT(s)&&s.day<6))last.push(step(t,w,{day:s.day,hour:'21:00:00',observations:[obs(t.p,s)]}));
  if(w===6){assert.equal(t.p.stateTrace[7].strength.exercises['db-rdl'].load,24,'the projection runs two steps ahead while the window holds a read run');}
  last.push(step(t,w+1,{day:0,hour:'06:00:00',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&!SAT(s)&&s.day===6).map(s=>obs(t.p,s))}));}
 const r=last.at(-1),at7=`${t.p.weeks[7].startDate}T06:00:00Z`;
 assert.ok(last.slice(0,-1).every(x=>x.status==='KEEP'),'every earlier decision keeps the plan');
 assert.equal(r.action,'REPLAN_FROM_EVIDENCE',r.reason);assert.match(r.reason,RECORDED);assert.equal(r.planValidity?.status,VALID);
 const H=historicalStateOf(t.p,{asOf:at7,actualLedger:t.ledger},opts).strength.exercises['db-rdl'];
 assert.equal(H.lastExecutedLoad,22,'history holds the 22 last lifted');
 assert.equal(t.p.stateTrace[7].strength.exercises['db-rdl'].load,22,'the plan follows history, no step the projection assumed');
 assert.ok(t.p.weeks[7].sessions.filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id==='db-rdl').every(e=>e.load.mode!=='KNOWN'||e.load.value===22),'the Saturday row prescribes 22');
});

test('R7-C QE-R7C-07 (G01): the recorded-answer re-plan never travels with a question about unknown training; that question decides alone',()=>{
 // The answer: only the oldest long run of the window done, every other gap run not done; recorded by a clinical route, then cleared. Week 7's own
 // runs are never reported. On day 4 the facts' plan differs from the stored one again (more of week 7's runs elapsed with no report, C9), so a
 // plain review re-plans from the record; a schedule change at the same instant re-plans from next week, whose window (that long run falls out
 // of it) is unknown: it asks, and the question decides alone, with no proposal (without the guard it would carry the re-plan's run doses).
 const b=7,t={p:program(GEN),ledger:[],ref:null};
 for(let w=0;w<b;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const start=t.p.weeks[b].startDate,longest=runSessions(t.p,0,b).filter(s=>s.role==='LONG'&&addDays(s.date,30)>=start).sort((x,y)=>x.date<y.date?-1:1)[0];
 const facts=runSessions(t.p,0,b).map(s=>s.id===longest.id?obs(t.p,s):notDone(t.p,s));
 carry(t,b,'CLIN',facts);clear(t);
 const r3=step(t,b,AT(3));
 assert.equal(r3.action,'REPLAN_FROM_EVIDENCE',r3.reason);assert.match(r3.reason,RECORDED);
 const live4=step(copy(t),b,AT(4));
 assert.equal(live4.action,'REPLAN_FROM_EVIDENCE',live4.reason);assert.match(live4.reason,RECORDED,'the recorded-answer re-plan acts on day 4');
 const ask=step(copy(t),b,{...AT(4),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
 assert.equal(ask.question?.kind,'UNREPORTED_TRAINING',ask.reason);assert.equal(ask.status,'ASK');
 assert.equal(ask.proposal??null,null,'no run dose is planned while the question stands');
 assert.equal(ask.planValidity?.status,'REQUIRES_RECONCILIATION');
});
