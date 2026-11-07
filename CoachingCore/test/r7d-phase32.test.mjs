// R7-D Phase 3.2: directed tests for SSCTR-P31-F02 (audits/domain-coaching-r7-d-2026-11-02/PHASE31_CHECKPOINT.md), under the Founder's decision:
// a newer declared interruption never silently erases an older one that is still unapplied. It replaces it only when it names that interruption
// (the existing episodeId correction); the same facts again are the same declaration; otherwise the older one stays a fact and the relation is
// asked (corrects, or a separate break) before any return dose. Separate breaks stay separate facts: the return reads the continuous stop when
// their days touch or overlap or nothing was trained between them, the latest break after recorded training, and asks about unreported training.
// Clinical first is unchanged; F08 is unchanged.
// R7-D Phase 3.3 (SSCTR-P32-F01, Founder direction B): the latest break is read alone only after a whole week of the plan executed in full between
// them; training short of that is a fact of the stop. The two T4 assertions this changes are updated and marked "R7-D Phase 3.3".
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const GEN={id:'r7d-p32-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const clear=t=>{t.ref=null;return t;};
let BASE=null;
/** Weeks 0-1 executed and reviewed; weeks 2-4 nothing reported. */
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const S2=()=>BASE?.p.weeks[2].startDate??base().p.weeks[2].startDate;
const brk=(from,to,x={})=>({startDate:addDays(S2(),from),endDate:addDays(S2(),to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const A=()=>brk(0,13);                                                  // weeks 2-3, 14 days
const B=()=>brk(14,20,{reasonCategory:'WORK',reason:'Work trip'});      // week 4, 7 days, the day after A ends
const O=()=>brk(10,20,{reasonCategory:'WORK',reason:'Work trip'});      // overlaps A's last four days
const D=()=>brk(17,20,{reasonCategory:'WORK',reason:'Work trip'});      // week 4 days 3-6; days 0-2 between A and D
const W4D0={day:0,hour:'07:00:00'},W5D0={day:0,hour:'07:00:00'},W5D1={day:1,hour:'07:00:00'},W5D2={day:2,hour:'07:00:00'},W5D3={day:3,hour:'07:00:00'};
const declarations=ledger=>ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED');
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
/** A declared with a fatigue report on week 4 day 0 (asked, kept), then `newer` declared with a local-fatigue report on week 5 day 0. */
function twoKept(newer=B(),{carrier='LOCAL_FATIGUE',extra={}}={}){
 const t=base();
 const a=step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
 assert.equal(a.action,'ASK',a.reason);
 const b=step(t,5,{...W5D0,kind:carrier,interruption:newer,event:{id:'p32-B',kind:carrier},...extra});
 return {t,b};
}
const gapSessions=p=>p.weeks[4].sessions.filter(s=>live(s)&&s.date>=addDays(S2(),14)&&s.date<=addDays(S2(),16));
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});

// ---------- T1: the relation is asked; never last-write-wins, never joined on dates ----------
test('R7-D Phase 3.2 T1 (F02 witness): a newer break that does not name a kept one is asked about, whatever carries it; the older fact is never dropped and no return dose is chosen',()=>{
 // The SSCTR witness: a 14-day holiday kept, a contiguous 7-day work trip, then a plain review. R7D-FREEZE-2 re-entered from the trip alone.
 const {t,b}=twoKept();
 assert.equal(b.action,'ASK',b.reason);assert.deepEqual(b.missingInputs,['interruption.episodeId']);assert.equal(b.question?.kind,'INTERRUPTION_RELATION');
 const r=step(t,5,W5D1);
 assert.equal(r.action,'ASK',r.reason);assert.notEqual(r.planValidity.status,VALID);assert.equal(returns(t.p).length,0,'no return dose');
 assert.deepEqual(r.question.breaks.map(x=>x.episodeId),['p32-A','p32-B']);assert.deepEqual(r.question.unresolved,['p32-B']);
 assert.match(r.reason,/the earlier facts need not be stated again/);
 assert.equal(declarations(t.ledger).length,2,'both facts recorded');
 // The same with the trip stated by the weekly review itself, or by a return report, and with dates that touch, overlap or leave days between.
 for(const [label,newer] of [['contiguous',B()],['overlapping',O()],['disjoint',D()]]){
  for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){
   const c=twoKept(newer).t,x=base();
   step(x,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
   for(const [tt,rr] of [[c,step(c,5,W5D1)],[x,step(x,5,{...W5D1,kind,interruption:newer,event:{id:'p32-direct',kind}})]]){
    assert.equal(rr.action,'ASK',`${label} ${kind}: ${rr.reason}`);assert.equal(rr.question?.kind,'INTERRUPTION_RELATION',label);
    assert.equal(returns(tt.p).length,0,label);assert.equal(declarations(tt.ledger).length,2,label);
   }
  }
 }
});
test('R7-D Phase 3.2 T1: a partial newer declaration never replaces a kept break; the relation is asked and the kept facts are still read once it is answered',()=>{
 const partial={reasonCategory:'WORK',reason:'Work trip'};
 const {t}=twoKept(partial),r=step(t,5,W5D1);
 assert.equal(r.action,'ASK',r.reason);assert.equal(r.question?.kind,'INTERRUPTION_RELATION');assert.equal(returns(t.p).length,0);
 // Answered as a separate break with its dates (its own episodeId): the kept holiday is still read, so the stop is the whole 21 days.
 const a=step(t,5,{...W5D2,interruption:{...B(),episodeId:'p32-B'}});
 assert.equal(a.action,'REESTABLISH',a.reason);
 const d=returns(t.p).at(-1).interruption;
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[A().startDate,B().endDate,21,'MODERATE']);
});

// ---------- T2: an explicit correction ----------
test('R7-D Phase 3.2 T2: a newer break that names the kept one corrects it: its facts are applied once, the earlier facts stay recorded and inert',()=>{
 const t=base();
 step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
 const r=step(t,5,{...W5D1,kind:'RETURN_AFTER_PAUSE',interruption:{...B(),episodeId:'p32-A'},event:{id:'p32-corr',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(r.action,'REESTABLISH',r.reason);
 const d=returns(t.p).at(-1).interruption;
 assert.deepEqual([d.episode,d.relation,d.basis,d.startDate,d.endDate,d.class],['p32-A','NEW','EXPLICIT',B().startDate,B().endDate,'SHORT']);
 assert.equal(d.separateBreaks,undefined,'one interruption, corrected');
 assert.deepEqual(declarations(t.ledger).map(x=>x.eventId),['p32-A','p32-corr'],'the earlier fact is kept, unchanged');
 for(const day of [2,3,4]){const x=step(t,5,{day,hour:'07:00:00'});assert.notEqual(x.action,'REESTABLISH',`day ${day}: ${x.reason}`);}
 assert.equal(returns(t.p).length,1,'applied once');
});
test('R7-D Phase 3.2 T2: after the relation question, the answer that the newer break corrects the kept one (its facts with the kept one\'s episodeId) applies the newer facts alone, once',()=>{
 const {t}=twoKept();
 assert.equal(step(t,5,W5D1).action,'ASK');
 const r=step(t,5,{...W5D2,interruption:{...B(),episodeId:'p32-A'},event:{id:'p32-answer',kind:'WEEKLY_REVIEW'}});
 assert.equal(r.action,'REESTABLISH',r.reason);
 const d=returns(t.p).at(-1).interruption;
 assert.deepEqual([d.episode,d.startDate,d.days,d.class],['p32-A',B().startDate,7,'SHORT']);assert.equal(d.separateBreaks,undefined);
 const x=step(t,5,W5D3);assert.notEqual(x.action,'REESTABLISH',x.reason);assert.equal(returns(t.p).length,1);
});

// ---------- T3: exact replay ----------
test('R7-D Phase 3.2 T3: the same report replayed, or the same facts again, are one declaration: nothing new, one return, never applied twice',()=>{
 const t=base(),event={id:'p32-A',kind:'SYSTEMIC_FATIGUE'};
 const first=step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event});
 const replay=evaluateProgram(t.p,{...review(t.p,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A()}),event,actualLedger:t.ledger},opts);
 assert.equal(replay.action,first.action);assert.equal(declarations(replay.actualLedger).length,1,'a replay adds no row');
 // The same facts through another carrier: one interruption, so no relation question; the next review applies it once.
 const again=step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:A()});
 assert.notEqual(again.question?.kind,'INTERRUPTION_RELATION',again.reason);
 const r=step(t,5,W5D1);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(returns(t.p).at(-1).interruption.class,'MODERATE');
 for(const day of [2,3]){const x=step(t,5,{day,hour:'07:00:00'});assert.notEqual(x.action,'REESTABLISH',x.reason);}
 assert.equal(returns(t.p).length,1);
});
test('R7-D Phase 3.2 T3: the answer that resolves the relation, replayed, changes nothing and records nothing; nor do the earlier reports replayed',()=>{
 const {t}=twoKept();
 const answer={...W5D1,interruption:{...B(),episodeId:'p32-B'},event:{id:'p32-answer',kind:'WEEKLY_REVIEW'}};
 const r=step(t,5,answer);assert.equal(r.action,'REESTABLISH',r.reason);
 const rows=declarations(t.ledger).length,n=returns(t.p).length,plan=hash(t.p);
 const re=step(t,5,answer);
 assert.equal(re.action,'KEEP',re.reason);assert.equal(declarations(t.ledger).length,rows);assert.equal(returns(t.p).length,n);assert.equal(hash(t.p),plan);
 for(const [id,kind,interruption] of [['p32-A','SYSTEMIC_FATIGUE',A()],['p32-B','LOCAL_FATIGUE',B()]]){
  const x=evaluateProgram(t.p,{...review(t.p,5,{...W5D2,kind,interruption}),event:{id,kind},actualLedger:t.ledger},opts);
  assert.notEqual(x.action,'REESTABLISH',`${id}: ${x.reason}`);assert.equal(declarations(x.actualLedger).length,rows,id);
 }
});

// ---------- T4: separate breaks, read together ----------
test('R7-D Phase 3.2 T4: separate breaks whose days touch or overlap stay two interruptions; the return reads the one continuous stop, as the same stop declared at once',()=>{
 // The comparator: the 21 days declared once by a return report.
 const once=base(),r0=step(once,5,{...W5D1,kind:'RETURN_AFTER_PAUSE',interruption:brk(0,20)});
 assert.equal(r0.action,'REESTABLISH');
 for(const [label,newer,stop] of [['touching',B(),'TOUCHES'],['overlapping',O(),'OVERLAPS']]){
  const {t}=twoKept(newer);
  const r=step(t,5,{...W5D1,interruption:{...newer,episodeId:'p32-B'},event:{id:'p32-answer-'+label,kind:'WEEKLY_REVIEW'}});
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);assert.equal(r.planValidity.status,VALID);
  const d=returns(t.p).at(-1).interruption;
  assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[A().startDate,newer.endDate,21,'MODERATE'],label);
  assert.deepEqual(d.separateBreaks.map(x=>[x.episode,x.startDate,x.endDate,x.stop]),[['p32-A',A().startDate,A().endDate,stop],['p32-B',newer.startDate,newer.endDate,'LATEST']],label+': two interruptions, each with its own days');
  assert.equal(d.episode,'p32-B',label);
  const from=addDays(t.p.weeks[5].startDate,2);
  assert.deepEqual(runsAhead(t.p,5,from),runsAhead(once.p,5,from),label+': the re-entry of the one 21-day stop');
  assert.ok(runsAhead(t.p,5,from).every(x=>!QUALITY.some(q=>x.includes(':'+q+':'))),label+': no quality in the re-entry');
 }
});
test('R7-D Phase 3.2 T4: separate breaks with nothing trained between them (every planned session there reported not done) are one continuous stop; recorded training between them leaves the latest break alone only once a whole week of it re-entered the athlete (R7-D Phase 3.3)',()=>{
 for(const done of [false,true]){
  const t=base(),gap=gapSessions(t.p);
  assert.ok(gap.length,'sessions planned between the breaks');
  step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:D(),event:{id:'p32-B',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>done?obs(t.p,s):notDone(t.p,s))});
  const r=step(t,5,{...W5D1,interruption:{...D(),episodeId:'p32-B'}});
  assert.equal(r.action,'REESTABLISH',`done ${done}: ${r.reason}`);
  const d=returns(t.p).at(-1).interruption;
  if(!done){
   assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[A().startDate,D().endDate,21,'MODERATE']);
   assert.deepEqual(d.separateBreaks.map(x=>x.stop),['NO_TRAINING_BETWEEN','LATEST']);
  }else{
   // R7-D Phase 3.3: the two sessions between the breaks complete no week of the plan, so they re-enter nothing and the stop runs through the
   // holiday. The trip alone needs a whole week executed in full between them (r7d-phase33.test.mjs T3).
   assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[A().startDate,D().endDate,21,'MODERATE'],'training between that completes no week: the whole stop');
   assert.deepEqual(d.separateBreaks.map(x=>x.stop),['TRAINING_NOT_REESTABLISHED','LATEST'],'the holiday stays a fact, the training a fact of the stop');
  }
 }
});
test('R7-D Phase 3.2 T4: separate breaks with unreported training between them are asked about those sessions; the answer decides, never zero and never credit (R7-D Phase 3.3: here it decides the record, not the class)',()=>{
 const t=base(),gap=gapSessions(t.p);
 step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:D(),event:{id:'p32-B',kind:'LOCAL_FATIGUE'}});
 const q=step(t,5,{...W5D1,interruption:{...D(),episodeId:'p32-B'}});
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.notEqual(q.planValidity.status,VALID);
 assert.deepEqual(q.question.unreported.sessionIds,gap.map(s=>s.id));assert.deepEqual(q.missingInputs,['observations.unreportedSessions']);assert.equal(returns(t.p).length,0);
 for(const done of [false,true]){
  const c=copy(t),r=step(c,5,{...W5D2,observations:gap.map(s=>done?obs(c.p,s):notDone(c.p,s))});
  assert.equal(r.action,'REESTABLISH',`done ${done}: ${r.reason}`);
  // R7-D Phase 3.3: answered done, the two sessions complete no week of the plan and re-enter nothing, so the class is MODERATE either way; the
  // answer decides what the record says of them. Inside a whole week between the breaks it decides the class (r7d-phase33.test.mjs T4).
  const d=returns(c.p).at(-1).interruption;
  assert.equal(d.class,'MODERATE');
  assert.deepEqual(d.separateBreaks.map(x=>x.stop),[done?'TRAINING_NOT_REESTABLISHED':'NO_TRAINING_BETWEEN','LATEST']);
 }
});
test('R7-D Phase 3.2 T4: two separate breaks followed by a return report are applied together once, in either order of declaration',()=>{
 const results=[];
 for(const order of [['A','B'],['B','A']]){
  const t=base(),facts={A:A(),B:B()};
  step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:facts[order[0]],event:{id:'p32-'+order[0],kind:'SYSTEMIC_FATIGUE'}});
  step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:{...facts[order[1]],episodeId:'p32-'+order[1]},event:{id:'p32-'+order[1],kind:'LOCAL_FATIGUE'}});
  const r=step(t,5,{...W5D1,kind:'RETURN_AFTER_PAUSE'});
  assert.equal(r.action,'REESTABLISH',`${order}: ${r.reason}`);assert.equal(returns(t.p).length,1);
  // Identity provenance (which report named the break the return reads, and how) depends on the order; the stop, entry and plan do not.
  const {episode,basis,declaredBy,inputHash,separateBreaks,stateAt,...facts1}=returns(t.p).at(-1).interruption;
  results.push({facts:facts1,breaks:separateBreaks.map(x=>[x.episode,x.startDate,x.endDate,x.stop]),runs:runsAhead(t.p,5,addDays(t.p.weeks[5].startDate,2))});
  const x=step(t,5,W5D2);assert.notEqual(x.action,'REESTABLISH');assert.equal(returns(t.p).length,1,'never applied twice');
 }
 assert.deepEqual(results[0],results[1],'the same stop, entry and plan whichever break was declared first');
});

// ---------- T5: clinical first ----------
test('R7-D Phase 3.2 T5: clinical first comes before the relation question: a kept clinical break routes to a human whatever newer break comes, before and after clearance',()=>{
 const inj={...A(),reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false};
 // An older clinical break and a newer nonclinical one, unnamed or named as separate: never a dose, never a relabelled break.
 for(const newer of [B(),{...B(),episodeId:'p32-B'}]){
  const t=base();
  assert.equal(step(t,4,{...W4D0,interruption:inj,event:{id:'p32-A',kind:'WEEKLY_REVIEW'}}).status,'CLINICAL_HUMAN_REQUIRED');
  clear(t);
  const b=step(t,5,{...W5D0,kind:'RETURN_AFTER_PAUSE',interruption:newer});
  assert.equal(b.status,'CLINICAL_HUMAN_REQUIRED',b.reason);assert.equal(b.proposal,null);
  for(const day of [1,2]){clear(t);const r=step(t,5,{day,hour:'07:00:00'});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`day ${day}: ${r.reason}`);assert.equal(returns(t.p).length,0);}
 }
 // An older nonclinical break and a newer clinical one.
 const t=base();
 step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
 assert.equal(step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:{...B(),reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}}).status,'CLINICAL_HUMAN_REQUIRED');
 clear(t);const r=step(t,5,W5D1);
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.equal(returns(t.p).length,0);assert.equal(declarations(t.ledger).length,2);
});
test('R7-D Phase 3.2 T5: while the relation is unresolved a clinical flag, a pain substitution or a standing clinical reference routes to a human first',()=>{
 const {t}=twoKept();
 const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 for(const [label,x] of [['flag',{eligibility:{...elig(addDays(t.p.weeks[5].startDate,1)),pain:true}}],['substitution',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}}]]){
  const c=copy(t),r=step(c,5,{...W5D1,...x});
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',label+': '+r.reason);assert.equal(r.proposal,null);
  const sticky=step(c,5,W5D2);assert.equal(sticky.status,'CLINICAL_HUMAN_REQUIRED',label+': the clinical reference stands');
 }
});
test('R7-D Phase 3.2 T5 (F08 unchanged, characterization): a clinical-cause kept break stays clinical; only a report that names it corrects its facts, as in R7D-FREEZE-2',()=>{
 const inj={...A(),reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false},t=base();
 step(t,4,{...W4D0,interruption:inj,event:{id:'p32-A',kind:'WEEKLY_REVIEW'}});clear(t);
 assert.equal(step(copy(t),5,W5D1).status,'CLINICAL_HUMAN_REQUIRED');
 const r=step(t,5,{...W5D1,kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:'p32-A'}});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(returns(t.p).at(-1).interruption.episode,'p32-A');
});

// ---------- T6: applied breaks, no regression; a correction across a kept break ----------
test('R7-D Phase 3.2 T6: an applied break and a later new one follow the episode rules unchanged; a correction of the applied one while a break is kept is asked and the kept break is applied next',()=>{
 const t=base();
 step(t,4,{...W4D0,kind:'RETURN_AFTER_PAUSE',interruption:A(),event:{id:'p32-A',kind:'RETURN_AFTER_PAUSE'}});
 for(const w of [4,5])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 const s6=t.p.weeks[6].startDate,C={startDate:s6,endDate:addDays(s6,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 // The genuinely new break, applied directly: a new interruption after the re-entry, from the training since.
 const direct=copy(t),d=step(direct,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:C});
 assert.equal(d.action,'REESTABLISH',d.reason);
 assert.deepEqual([returns(direct.p).at(-1).interruption.relation,returns(direct.p).at(-1).interruption.basis],['NEW','AFTER_REENTRY']);
 // Kept, then a correction of the applied break: asked; the kept break is applied by the next review and the correction recorded as not read.
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:C,event:{id:'p32-C',kind:'SYSTEMIC_FATIGUE'}});
 const corr=step(t,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),endDate:addDays(S2(),12),days:13,episodeId:'p32-A'},event:{id:'p32-corr',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(corr.action,'ASK',corr.reason);assert.equal(corr.proposal?.decisions.at(-1)?.action==='REESTABLISH',false);
 const r=step(t,7,{day:2,hour:'07:00:00'});
 assert.equal(r.action,'REESTABLISH',r.reason);
 const x=returns(t.p).at(-1).interruption;
 assert.deepEqual([x.episode,x.startDate,x.endDate],['p32-C',C.startDate,C.endDate]);
 assert.deepEqual(x.notApplied.map(n=>n.eventId),['p32-corr']);
 assert.equal(returns(t.p).filter(z=>z.interruption.episode==='p32-A').length,1,'the applied break is not applied again');
});
test('R7-D Phase 3.2 T6: a kept correction of an applied break, then a newer break that names none: the relation is asked; named separate, the newer break is applied and the correction not read',()=>{
 const t=base();
 step(t,4,{...W4D0,kind:'RETURN_AFTER_PAUSE',interruption:A(),event:{id:'p32-A',kind:'RETURN_AFTER_PAUSE'}});
 for(const w of [4,5])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 const s6=t.p.weeks[6].startDate,C={startDate:s6,endDate:addDays(s6,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...A(),endDate:addDays(S2(),12),days:13,episodeId:'p32-A'},event:{id:'p32-corr',kind:'SYSTEMIC_FATIGUE'}});
 const q=step(t,7,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:C,event:{id:'p32-C',kind:'LOCAL_FATIGUE'}});
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'INTERRUPTION_RELATION');assert.deepEqual(q.question.unresolved,['p32-C']);
 assert.equal(step(copy(t),7,{day:2,hour:'07:00:00'}).question?.kind,'INTERRUPTION_RELATION','a plain review asks too');
 const r=step(t,7,{day:2,hour:'07:00:00',interruption:{...C,episodeId:'p32-C'}});
 assert.equal(r.action,'REESTABLISH',r.reason);
 const x=returns(t.p).at(-1).interruption;
 assert.deepEqual([x.episode,x.startDate,x.endDate],['p32-C',C.startDate,C.endDate]);assert.deepEqual(x.notApplied.map(n=>n.eventId),['p32-corr']);
});

// ---------- T7: event separation ----------
test('R7-D Phase 3.2 T7: an event that carries a newer break is never applied with it, nor with the return; sent again after the return it is applied',()=>{
 const t=base(),days=p=>p.schedule.strengthDays.join();
 const before=days(t.p);
 step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'p32-A',kind:'SYSTEMIC_FATIGUE'}});
 const b=step(t,5,{...W5D0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:B(),event:{id:'p32-B',kind:'SCHEDULE_CHANGE'}});
 assert.equal(b.action,'ASK',b.reason);assert.match(b.reason,/schedule change is sent again after the return/);assert.equal(days(t.p),before);
 const r=step(t,5,{...W5D1,interruption:{...B(),episodeId:'p32-B'}});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(days(t.p),before,'not applied with the return');
 const again=step(t,5,{...W5D2,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
 assert.notEqual(again.action,'ASK',again.reason);assert.equal(days(t.p),'0,3','sent again after the return, it is applied');
});

// ---------- T8: determinism ----------
test('R7-D Phase 3.2 T8: the same facts give the same decision; the record keeps every declaration, append-only, and the decision history is never rewritten',()=>{
 const {t}=twoKept(),input={...review(t.p,5,W5D1),event:{id:'p32-det',kind:'WEEKLY_REVIEW'},actualLedger:t.ledger};
 const once=evaluateProgram(t.p,input,opts),twice=evaluateProgram(t.p,input,opts);
 assert.equal(hash(JSON.parse(JSON.stringify(once))),hash(JSON.parse(JSON.stringify(twice))));
 const rows=JSON.parse(JSON.stringify(declarations(t.ledger))),history=JSON.parse(JSON.stringify(t.p.decisions));
 step(t,5,W5D1);step(t,5,{...W5D2,interruption:{...B(),episodeId:'p32-B'}});
 assert.deepEqual(JSON.parse(JSON.stringify(declarations(t.ledger).slice(0,rows.length))),rows,'earlier facts never rewritten');
 assert.deepEqual(JSON.parse(JSON.stringify(t.p.decisions.slice(0,history.length))),history,'decision history append-only');
});
