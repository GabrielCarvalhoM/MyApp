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
// V1 Coaching Integration Boundary CF-OBS-1 migration (PCG-V1CPFF-CFOBS1-r1 Q4, Q6; QRE Q6): the clinical carrier's route ends only by the athlete's
// readiness declaration, read from the record; dropping the clinical state (`clear`, the R7 evaluation convention, PCG-F08-C07) never releases and is
// kept as each cell's negative twin. Recorder independence is then asserted at the release: the answer the clinical route recorded gives the plan
// that the same route without the answer gives when the answer comes with the declaration itself (same program, same clock, same hold).
const READY_ALL={declaredRecovered:true,warningSigns:Object.fromEntries(['feverOrChills','chestPainPressureOrTightness','breathlessAtRest','palpitationsAtRest','faintingOrDizziness','painThatChangesMovement','swelling','injuryFromFallOrImpact','gettingWorse','bodyWideAches','exhaustionAtRest','vomitingDiarrhoeaNauseaOrAbdominalPain','moderateOrSevereCough','severeHeadache','severeNoseOrThroat'].map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}};
const declare=(t,b,x={})=>step(t,b,{...AT(3),kind:'READINESS_DECLARATION',readiness:READY_ALL,...x});
const LATER={day:3,hour:'08:00:00'};
/** The CLIN carrier's reference at the release: the same clinical route with no answer, then the declaration carrying the answer, then a plain review. */
function heldReference(B,b,facts){
 const hold=copy(B),c=carry(hold,b,'CLIN',[]),dr=declare(hold,b,{observations:facts}),d3=step(hold,b,LATER);
 return {plan:planFrom(d3.proposal??hold.p,b,3),runs:runsFrom(d3.proposal??hold.p,b,3),validity:d3.planValidity?.status,d2:c,d3,release:dr};
}
function cells(V){
 if(GRIDS[V])return GRIDS[V];
 const out=[];
 for(const [prog,o,b,carriers] of CELLS)for(const g of [0,2])for(const mode of ['RV','NR']){
  const {B,facts,question}=fork(o,{g,b,mode,V}),label=`${prog} g=${g} ${mode} ${V}`;
  assert.equal(question,'UNREPORTED_TRAINING',label+': the review before the answer week asks');
  const direct=copy(B),d2=step(direct,b,{...AT(2),observations:facts}),d3=step(direct,b,AT(3));
  const reference={plan:planFrom(d3.proposal??direct.p,b,3),runs:runsFrom(d3.proposal??direct.p,b,3),validity:d3.planValidity?.status,d2,d3};
  for(const carrier of carriers){
   const t=copy(B),before=t.p,c=carry(t,b,carrier,facts);
   if(carrier==='CLIN'){
    const neg=step(clear(copy(t)),b,AT(3)),held=heldReference(B,b,facts);
    for(const [next,x] of [['declaration day 3',{}],['declaration with the answer re-sent day 3',{observations:facts}]]){
     const u=copy(t),release=declare(u,b,x),r=step(u,b,LATER);
     out.push({label:`${label} ${carrier} :: ${next}`,carrier,c,r,u,b,before,facts,reference:held,neg,release,plan:planFrom(r.proposal??u.p,b,3),runs:runsFrom(r.proposal??u.p,b,3)});
    }
    continue;
   }
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
 grid(V,({label,carrier,c,r,plan,runs,reference,neg})=>{
  n++;
  // V1CIB CF-OBS-1: the negative twin, the clinical state dropped, is never a release.
  if(carrier==='CLIN'){assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED',label+': dropping the clinical state never releases');assert.equal(neg.proposal??null,null,label);}
  // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): the R4 carrier's HOLD was the internal TypeError of a
  // schedule change in the program's last week. The explicit last-week rule keeps the weeks, so that review now applies the recorded answer
  // itself and is no longer a refusal; the clinical-route carrier still records and applies nothing. The property below is unchanged.
  // V1CP Fix-Forward QRE-V1CPR-C7 (QRE-V1CP-11): pinned to the measured outcome, a re-plan from evidence or a keep, never a question or a route.
  if(carrier==='R4')assert.ok([['MODIFY','REPLAN_FROM_EVIDENCE'],['KEEP','KEEP']].some(([s,a])=>c.status===s&&c.action===a)&&!/Malformed/.test(c.reason??''),label+': the last-week schedule change decides without the error path: '+c.status+' '+c.action);
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

test('R7-C QE-R7C-07 (V1CIB CF-OBS-1 migration): a known stop (MISS) recorded by a carrier is applied as the direct answer: the ceiling re-plan for the R4 carrier, the readiness restart for the clinical route',()=>{
 let replanned=0,restarted=0;
 grid('MISS',({label,carrier,r,plan,reference,release,facts,neg})=>{
  if(carrier==='CLIN'){assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED',label+': dropping the clinical state never releases');assert.equal(neg.proposal??null,null,label);}
  assert.deepEqual(plan,reference.plan,label);assert.equal(r.planValidity?.status,reference.validity,label);
  assert.ok(!RECORDED.test(r.reason??''),label+': the recorded-answer re-plan never pre-empts the ceiling re-plan');
  if(r.action==='REPLAN_FROM_EVIDENCE'){replanned++;assert.match(r.reason,CEILING,label);}
  if(carrier==='CLIN'){const d=release.proposal?.decisions.at(-1),stop=d?.readinessRecord?.stops??d?.interruption?.stops;assert.equal(release.status,'MODIFY',label+': '+release.reason);
   assert.ok(stop.RUN.start<=facts.map(f=>f.observedAt.slice(0,10)).sort()[0],label+': the restart reads the runs not done as days without running');restarted++;}
 });
 assert.ok(replanned+restarted>0);assert.ok(restarted>0);
});

test('R7-C QE-R7C-07 (V1CIB CF-OBS-1 migration): a PARTIAL answer recorded by a carrier still leaves part of the window unknown: the next decision asks, never valid; under a clinical route the declaration itself asks and the hold stands',()=>{
 grid('PARTIAL',({label,carrier,r,reference,release,neg})=>{
  if(carrier==='CLIN'){
   assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED',label+': dropping the clinical state never releases');assert.equal(neg.proposal??null,null,label);
   assert.equal(release.question?.kind,'UNREPORTED_TRAINING',label+': the declaration asks the unknown training first: '+release.reason);
   assert.equal(release.proposal??null,null,label);assert.notEqual(release.planValidity?.status,VALID,label);
   assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',label+': with nothing released the hold stands');assert.equal(r.proposal??null,null,label);
   assert.equal(reference.release.question?.kind,'UNREPORTED_TRAINING',label+': as the declaration carrying the partial answer');
   return;
  }
  assert.equal(r.status,'ASK',label);assert.equal(r.question?.kind,'UNREPORTED_TRAINING',label);
  assert.equal(r.proposal??null,null,label);assert.equal(r.planValidity?.status,'REQUIRES_RECONCILIATION',label);
  assert.equal(reference.d3.status,'ASK',label+': as the direct partial answer');
 });
});

test('R7-C QE-R7C-07 (V1CIB CF-OBS-1 migration): while the clinical route stands nothing is prescribed; dropping the clinical state never releases; after the readiness declaration the recorded facts are applied with no re-send',()=>{
 const b=7,{B,facts}=fork(GEN,{g:0,b,mode:'RV',V:'ADVERSE'});
 const t=copy(B),stale=runsFrom(t.p,b,3),c=carry(t,b,'CLIN',facts);
 assert.equal(c.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(c.proposal??null,null);
 assert.ok(facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId)),'the answer is in the carried record');
 // The clinical reference state still in force: the dependency stands, no prescription, the facts stay facts.
 const held=copy(t),h=step(held,b,AT(3));
 assert.equal(h.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(h.proposal??null,null);assert.equal(h.planValidity?.status,'REQUIRES_RECONCILIATION');
 assert.ok(facts.every(f=>held.ledger.some(o=>o.sessionId===f.sessionId)),'the recorded answer stays in the record');
 // Negative twin: no clinical state sent is no release.
 const neg=step(clear(copy(t)),b,AT(3));assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(neg.proposal??null,null);
 // The release: the readiness declaration, then a plain review with no observations: the facts are applied, never the stale projection.
 const ready=declare(t,b),r=step(t,b,LATER),ref=heldReference(B,b,facts);
 assert.equal(ready.status,'MODIFY',ready.reason);assert.equal(r.planValidity?.status,VALID,r.reason);
 assert.deepEqual(runsFrom(t.p,b,3),ref.runs,'as the declaration carrying the answer');assert.notDeepEqual(runsFrom(t.p,b,3),stale);
 assert.deepEqual(stale,['QUALITY:34','LONG:60'],'the stale projection the adverse answer must not leave in force');
 assert.ok(runsFrom(t.p,b,3).every(x=>!/^QUALITY/.test(x))&&Number(runsFrom(t.p,b,3).find(x=>x.startsWith('LONG'))?.split(':')[1]??0)<60,'the adverse long runs shorten the long run, no quality: '+runsFrom(t.p,b,3));
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
 // V1CIB CF-OBS-1 migration: the clinical path is released by the readiness declaration (dropping the clinical state is no release).
 const viaClin=(()=>{const t=copy(B);carry(t,b,'CLIN',facts);declare(t,b);return t;})();
 const rev=review(viaR4.p,b,AT(3)),decide=t=>evaluateProgram(t.p,{...rev,actualLedger:t.ledger},opts);
 const a=decide(viaR4),a2=decide(viaR4),c=decide(viaClin),c2=decide(viaClin);
 // Negative twin: the clinical route with no declaration, decided on the record alone (no reference state sent), stays clinical.
 const held=(()=>{const t=copy(B);carry(t,b,'CLIN',facts);return t;})(),h=decide(held);
 assert.equal(h.status,'CLINICAL_HUMAN_REQUIRED','no clinical state sent is never a release');assert.equal(h.proposal??null,null);
 assert.equal(hash(a),hash(a2),'the same input decides the same');
 assert.equal(hash(c),hash(c2),'the same input decides the same');
 // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): the R4 carrier was the last-week schedule change's internal
 // TypeError. The explicit last-week rule keeps the weeks, so that review now applies the recorded answer itself: its record is the re-planned
 // program, no longer the clinical route's unchanged one. Determinism is asserted per path, and both paths end on the direct answer's race week.
 assert.deepEqual(runsFrom(a.proposal??viaR4.p,b,3),['EASY:20','RACE:75'],'race week after a mixed answer: no race touch, as the direct answer');
 // V1CIB CF-OBS-1 migration: the clinical path's release is a readiness restart (the record releases it, with or without the reference state sent):
 // inside it the race is the athlete's own event with the coach's recommendation (Founder D3, NB-2), never a race touch or race effort.
 const P=c.proposal??viaClin.p,race=P.weeks[b].sessions.find(s=>s.role==='RACE');
 assert.notEqual(c.status,'CLINICAL_HUMAN_REQUIRED','the declaration on record releases the hold without the reference state');
 assert.ok(runsFrom(P,b,3).every(x=>!x.startsWith('RACE_TOUCH')),'no race touch: '+runsFrom(P,b,3));
 assert.ok(race&&race.ownEvent===true&&['NO_SESSION','OPTIONAL_WALK','EASY_RUN'].includes(race.coachRecommendation),'the race is the athlete\'s own event inside the restart: '+JSON.stringify({own:race?.ownEvent,rec:race?.coachRecommendation}));
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
 carry(t,b,'CLIN',facts);
 // V1CIB CF-OBS-1 migration: dropping the clinical state is no release (negative twin); the release is the readiness declaration on day 3.
 const neg=step(clear(copy(t)),b,AT(3));assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED',neg.reason);assert.equal(neg.proposal??null,null);
 const r3=declare(t,b);
 assert.equal(r3.status,'MODIFY',r3.reason);assert.equal(r3.planValidity?.status,VALID,r3.reason);
 // After the restart, week 7's runs after it are never reported: a later change whose window is unknown asks, and the question decides alone, with
 // no run dose planned; a plain review with that unknown training ahead never validates a run dose it depends on either.
 const ask=step(copy(t),b,{...AT(5),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
 if(ask.question?.kind==='UNREPORTED_TRAINING'){assert.equal(ask.status,'ASK');assert.equal(ask.proposal??null,null,'no run dose is planned while the question stands');assert.equal(ask.planValidity?.status,'REQUIRES_RECONCILIATION');}
 else assert.ok(!ask.question,'no question travels with a change: '+ask.status+' '+ask.reason);
});
