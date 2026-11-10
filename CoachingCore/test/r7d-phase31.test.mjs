// R7-D Phase 3.1: directed tests for QE-R7D-P3-01 (a), (b) and P3-F01 (audits/domain-coaching-r7-d-2026-11-02/PHASE3_CHECKPOINT.md), under the
// Founder's decisions D1-D3: a declared interruption is a fact whatever event carried it; retaining it is not applying a return. The record keeps
// the declaration (INTERRUPTION_DECLARED) through ASK, HOLD and CLINICAL_HUMAN_REQUIRED routing until a return applies it or a newer declaration
// replaces it; a later review that states no break reads it as if it stated it; the event that carried it is never applied with it; clinical
// first is unchanged.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import * as adaptation from '../src/r6-adaptation.mjs';
import {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';
import * as F08 from '../src/v1-f08.mjs';

// The record row type is named as the runtime exports it (read by name so the file also runs, and fails for its reasons, on R7D-FREEZE-1).
const {historicalStateOf,REVIEW_KINDS}=adaptation,INTERRUPTION_DECLARED=adaptation.INTERRUPTION_DECLARED??'INTERRUPTION_DECLARED';
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',RECON='REQUIRES_RECONCILIATION';
const GEN={id:'r7d-p31-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const fresh=(o=GEN)=>({p:program(o),ledger:[],ref:null});
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
/** Qualified clearance as C3 models it: the client drops the clinical continuation state and keeps the record. */
const clear=t=>{t.ref=null;return t;};
// V1 Coaching Integration Boundary CF-OBS-1 migration (PCG-V1CPFF-CFOBS1-r1 Q4, Q6; Security C2; QRE): the record is the source of truth of a clinical
// hold and only the athlete's readiness declaration releases it. Dropping the clinical reference state (`clear`, the R7 evaluation convention for a
// qualified clearance, PCG-F08-C07) is never a release: each migrated test keeps it as its negative twin and releases by the declaration.
const RNO=()=>Object.fromEntries(F08.READINESS_SIGNS.map(k=>[k,false]));
const declare=(t,w,at)=>step(t,w,{...at,kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:RNO(),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});
const CLASS_ORDER=['SHORT','MODERATE','LONG'];
const weekFacts=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s));
const PREP=new Map();
function beforeBreak(o=GEN){if(!PREP.has(o.id)){const t=fresh(o);for(const w of [0,1,2])step(t,w,{observations:weekFacts(t.p,w)});PREP.set(o.id,t);}return copy(PREP.get(o.id));}
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true});
const D1={day:1,hour:'07:00:00'},D2={day:2,hour:'07:00:00'},D3={day:3,hour:'07:00:00'};
const flagged=(p,w,day,flag='illness')=>({...elig(addDays(p.weeks[w].startDate,day)),[flag]:true});
const declarations=ledger=>ledger.filter(o=>o.fact===INTERRUPTION_DECLARED);
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const executedMax=(t,beforeDay)=>Math.max(...t.ledger.filter(o=>o.context?.sport==='RUN'&&o.actual?.completed&&o.localDate<beforeDay).map(o=>o.actual.minutes));
const aheadRuns=(p,w,from)=>[...runs(p,w),...(p.weeks[w+1]?runs(p,w+1):[])].filter(s=>s.date>=from);
/** The plan a decision leaves in force: its sessions (date, status, prescription) and start states; identities and free text are not compared. */
const planView=p=>({sessions:p.weeks.map(x=>x.sessions.map(s=>`${s.id}|${s.date}|${s.status??'PLANNED'}|${hash(s.prescription??null)}`)),states:p.stateTrace.map(({anchor,...st})=>st)});
/** The interruption a return records, without its identity (the report that declared it names it). */
const breakFacts=d=>{const {episode,declaredBy,supersedes,...x}=d.interruption;return {action:d.action,fromWeek:d.fromWeek,...x};};
/** One review decided on the same state twice: as sent, and with the break stated again in it (same event id and clock). */
function restated(t,w,x,brk){
 const id=`p31-restated-${w}-${x.day}`,kind=x.kind??'WEEKLY_REVIEW';
 const a=copy(t),ra=step(a,w,{...x,event:{id,kind}}),b=copy(t),rb=step(b,w,{...x,event:{id,kind},interruption:brk});
 return {a,ra,b,rb};
}
const SIBLINGS=[['SCHEDULE_CHANGE',{changes:{strengthDays:[0,3]}}],['SYSTEMIC_FATIGUE',{}],['MISSED_SESSION',{}],['GOAL_CHANGE',{changes:{goals:{run:'GENERAL',strength:'GENERAL'}}}],['EQUIPMENT_CHANGE',{changes:{equipment:['DUMBBELLS','BENCH']}}],['LOCAL_FATIGUE',{}],['EVENT_DATE_CHANGE',{changes:{eventDate:'2027-01-24'}}]];

// ---------- T1: another event carries the break ----------
test('R7-D Phase 3.1 T1: a break declared with another event is asked and recorded; the next plain review applies it with no repetition, as the same break stated there',()=>{
 for(const [kind,extra] of SIBLINGS){
  const t=beforeBreak(),brk=BREAK(t.p),ceiling=executedMax(t,brk.startDate);
  const r1=step(t,5,{...D1,kind,interruption:brk,...extra,event:{id:'p31-t1-'+kind,kind}});
  assert.equal(r1.action,'ASK',`${kind}: ${r1.reason}`);assert.equal(r1.planValidity.status,RECON);
  assert.deepEqual(r1.missingInputs,['interruption.reportedOnItsOwn'],kind);
  assert.match(r1.reason,/is recorded and not applied yet/,kind);assert.match(r1.reason,/no need to state the break again/,kind);
  const rows=declarations(t.ledger);
  assert.equal(rows.length,1,kind+': the break is recorded once');
  assert.deepEqual({eventId:rows[0].eventId,eventKind:rows[0].eventKind,interruption:rows[0].interruption,inputHash:rows[0].inputHash},{eventId:'p31-t1-'+kind,eventKind:kind,interruption:brk,inputHash:hash(brk)},kind);
  // The next plain review states no break: it reads the recorded one, exactly as the same break stated there.
  const {a,ra,b,rb}=restated(t,5,D2,brk);
  assert.equal(ra.action,'REESTABLISH',`${kind}: ${ra.reason}`);assert.equal(ra.planValidity.status,VALID);
  assert.match(ra.reason,/is on record and applied now/);
  assert.equal(rb.action,'REESTABLISH');
  assert.deepEqual(breakFacts(ra.proposal.decisions.at(-1)),breakFacts(rb.proposal.decisions.at(-1)),kind+': the same interruption facts and re-entry');
  assert.deepEqual(planView(a.p),planView(b.p),kind+': the same plan as the break stated again');
  assert.deepEqual(ra.proposal.decisions.at(-1).interruption.declaredBy,{eventId:'p31-t1-'+kind,eventKind:kind,declaredAt:rows[0].declaredAt},kind+': the return names the report that declared it');
  assert.equal(ra.proposal.decisions.at(-1).interruption.episode,'p31-t1-'+kind,kind+': the interruption is identified by the report that declared it');
  // No stale dose: the re-entry stays within what was executed before the break, with no quality work.
  const ahead=aheadRuns(a.p,5,addDays(a.p.weeks[5].startDate,2));
  assert.ok(ahead.length&&ahead.filter(s=>s.weekIndex===5).every(s=>s.prescription.durationMinutes<=ceiling),kind+': within the executed run');
  assert.ok(ahead.every(s=>!QUALITY.includes(s.prescription.family)),kind+': no quality in the re-entry');
 }
});
test('R7-D Phase 3.1 T1: while the recorded break is not applied, a later event of another kind is asked and applies nothing; a return report with no break of its own applies it',()=>{
 const t=beforeBreak(),brk=BREAK(t.p);
 step(t,5,{...D1,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk,event:{id:'p31-t1b',kind:'SCHEDULE_CHANGE'}});
 for(const [kind,extra] of SIBLINGS){
  const c=copy(t),r=step(c,5,{...D2,kind,...extra});
  assert.equal(r.action,'ASK',`${kind}: ${r.reason}`);assert.deepEqual(r.missingInputs,['interruption.reportedOnItsOwn'],kind);assert.notEqual(r.planValidity.status,VALID,kind);
  assert.ok(r.reason.includes('reported on '+addDays(t.p.weeks[5].startDate,1)),kind+': '+r.reason);
  assert.ok(!(r.proposal?.decisions??[]).slice(t.p.decisions.length).some(d=>d.action!=='REPLAN_FROM_EVIDENCE'),kind+': nothing but the factual state');
  assert.equal(declarations(c.ledger).length,1,kind+': nothing new is recorded');
 }
 const r=step(copy(t),5,{...D2,kind:'RETURN_AFTER_PAUSE'});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(r.planValidity.status,VALID);
});

// ---------- T2: a clinical route carries the break ----------
/** V1CIB CF-OBS-1 migration: the readiness declaration that ends the route re-enters from the recorded break once (its restart reads the break's days
 * and is recorded as its return); the next plain review re-enters no more. Returns the restart decision. */
function releasedReentersOnce(t,brk,ceiling,label){
 const ra=declare(t,5,D2),d=t.p.decisions.at(-1);
 assert.equal(ra.action,'REESTABLISH',`${label}: ${ra.reason}`);assert.equal(ra.planValidity.status,VALID,label);
 assert.equal(d.interruption.relation,'READINESS',label+': the restart is the return of the recorded break');
 for(const s of ['RUN','STRENGTH'])assert.ok(d.interruption.stops[s].start<=brk.startDate,`${label}: ${s} restarts after the break's days (${JSON.stringify(d.interruption.stops[s])})`);
 const ahead=aheadRuns(t.p,5,addDays(t.p.weeks[5].startDate,2));
 assert.ok(ahead.filter(s=>s.weekIndex===5).every(s=>s.prescription.durationMinutes<=ceiling),label+': within the executed run');
 assert.ok(ahead.every(s=>!QUALITY.includes(s.prescription.family)),label+': no quality');
 const next=step(copy(t),5,D3);
 assert.notEqual(next.action,'REESTABLISH',`${label}: applied once, never again over the restart (${next.reason})`);assert.notEqual(next.status,'CLINICAL_HUMAN_REQUIRED',label);
 return ra;
}
test('R7-D Phase 3.1 T2 (V1CIB CF-OBS-1 migration): a break with a clinical flag routes to a human first and is recorded; nothing is prescribed while the route stands; dropping the reference state never releases; after the readiness declaration the restart re-enters from it, once',()=>{
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE']){
  for(const flag of ['illness','pain','injury','clinicalConcern']){
   const t=beforeBreak(),brk=BREAK(t.p),ceiling=executedMax(t,brk.startDate),label=`${kind} ${flag}`;
   const r1=step(t,5,{...D1,kind,interruption:brk,eligibility:flagged(t.p,5,1,flag),...(kind==='SCHEDULE_CHANGE'?{changes:{strengthDays:[0,3]}}:{})});
   assert.equal(r1.status,'CLINICAL_HUMAN_REQUIRED',label);assert.equal(r1.proposal,null);assert.equal(r1.planValidity.status,RECON);
   assert.equal(declarations(t.ledger).length,1,label+': the clinical route keeps the declared break');
   // The clinical route stands (no clearance): still clinical, no dose, no return.
   const sticky=step(copy(t),5,D2);
   assert.equal(sticky.status,'CLINICAL_HUMAN_REQUIRED',label);assert.equal(sticky.proposal,null);assert.notEqual(sticky.planValidity.status,VALID);
   // Negative twin (the R7 convention): the reference state dropped is no release; the record keeps the hold and the break.
   const dropped=clear(copy(t)),neg=step(dropped,5,D2);
   assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED',label+': dropping the reference never releases');assert.equal(neg.proposal,null,label);assert.notEqual(neg.planValidity.status,VALID,label);
   assert.equal(declarations(dropped.ledger).length,1,label+': the break is still on record');
   releasedReentersOnce(t,brk,ceiling,label);
  }
 }
});
test('R7-D Phase 3.1 T2 (V1CIB CF-OBS-1 migration): a break with a pain substitution routes to a human and is recorded; dropping the reference never releases; after the readiness declaration the restart re-enters from it, once',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),ceiling=executedMax(t,brk.startDate),X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const r1=step(t,5,{...D1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},interruption:brk});
 assert.equal(r1.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r1.proposal,null);assert.equal(declarations(t.ledger).length,1);
 const neg=step(clear(copy(t)),5,D2);assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED','dropping the reference never releases');assert.equal(neg.proposal,null);
 releasedReentersOnce(t,brk,ceiling,'pain substitution');
});
test('R7-D Phase 3.1 T2: a break whose own reason is clinical is recorded and, after clearance, routes to a human again as the same break stated again does (F08 unchanged): never a dose, never the pre-break plan',()=>{
 const t=beforeBreak(),brk={...BREAK(t.p),reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false};
 const r1=step(t,5,{...D1,interruption:brk});
 assert.equal(r1.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(declarations(t.ledger).length,1);
 for(const day of [2,3,4]){
  clear(t);
  const {ra,rb}=restated(t,5,{day,hour:'07:00:00'},brk);
  for(const r of [ra,rb]){assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`day ${day}: ${r.reason}`);assert.equal(r.proposal,null);assert.notEqual(r.planValidity.status,VALID);}
  step(t,5,{day,hour:'07:00:00'});
 }
});

// ---------- T3: P3-F01 ----------
/** Weeks 0-1 executed and reviewed, weeks 2-6 silent: week 7's first review asks about the unreported training. */
function silent(){const t=fresh();for(const w of [0,1])step(t,w,{observations:weekFacts(t.p,w)});const q=step(t,7,{day:0,hour:'07:00:00'});assert.equal(q.question?.kind,'UNREPORTED_TRAINING',q.reason);return t;}
const answerBreak=p=>({startDate:p.weeks[2].startDate,endDate:addDays(p.weeks[7].startDate,-1),reasonCategory:'WORK',reason:'Work project, no training',nonclinical:true});
test('R7-D Phase 3.1 T3 (P3-F01; V1CIB CF-OBS-1 migration): a break answering the unreported-training question through a clinical route survives the route; dropping the reference never releases; the readiness declaration applies it with no second declaration, never less conservative than the direct answer',()=>{
 const base=silent(),brk=answerBreak(base.p);
 // Direct: the answer in a plain review on day 2, then a plain review on day 3.
 const direct=copy(base),d2=step(direct,7,{day:2,hour:'07:00:00',interruption:brk}),d3=step(direct,7,D3);
 assert.equal(d2.action,'REESTABLISH',d2.reason);
 // Through a clinical route: the same answer with a pain substitution on day 2, then (negative twin) the reference dropped, or the readiness
 // declaration on day 3.
 const t=copy(base),X=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const c2=step(t,7,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},interruption:brk});
 assert.equal(c2.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(c2.proposal,null);assert.equal(declarations(t.ledger).length,1,'the answer is recorded');
 const neg=step(clear(copy(t)),7,D3);assert.equal(neg.status,'CLINICAL_HUMAN_REQUIRED','dropping the reference never releases');assert.equal(neg.proposal,null);
 const c3=declare(t,7,D3);
 assert.equal(c3.action,'REESTABLISH',c3.reason);assert.equal(c3.question??null,null);assert.equal(c3.planValidity.status,VALID);
 assert.equal(declarations(t.ledger).length,1,'no second declaration of the break');
 const r=t.p.decisions.at(-1).interruption,b=direct.p.decisions.findLast(d=>d.action==='REESTABLISH').interruption;
 assert.equal(r.relation,'READINESS');
 for(const s of ['RUN','STRENGTH']){assert.ok(r.stops[s].start<=brk.startDate,`${s}: the restart reads the break's days`);assert.ok(CLASS_ORDER.indexOf(r.classBySport[s])>=CLASS_ORDER.indexOf(b.classBySport?.[s]??b.class),`${s}: ${r.classBySport[s]} is never below the direct answer's ${b.classBySport?.[s]??b.class}`);}
 const next=step(t,7,{day:4,hour:'07:00:00'});assert.notEqual(next.action,'REESTABLISH','applied once');
 assert.equal(d3.planValidity.status,VALID);
});

// ---------- T4: event separation ----------
test('R7-D Phase 3.1 T4: retaining the break never applies the event that carried it; after the return the event is sent again and applied then',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),days=p=>p.weeks.slice(5).map(x=>x.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>s.day).join()).join('|');
 const before=days(t.p);
 step(t,5,{...D1,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
 assert.equal(days(t.p),before,'the schedule change is not applied with the break');
 const r=step(t,5,D2);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(days(t.p).split('|')[0],before.split('|')[0],'the return does not apply it either');
 assert.deepEqual(t.p.schedule.strengthDays,[0,4],'the schedule in force is unchanged');
 const again=step(t,5,{...D3,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
 assert.notEqual(again.action,'ASK',again.reason);assert.deepEqual(t.p.schedule.strengthDays,[0,3],'sent again after the return, it is applied');
 // A goal or equipment change that carried the break stays unapplied too.
 for(const [kind,extra,read] of [['GOAL_CHANGE',{changes:{goals:{run:'GENERAL',strength:'HYPERTROPHY'}}},p=>p.goal.strength.kind],['EQUIPMENT_CHANGE',{changes:{equipment:['DUMBBELLS','BENCH']}},p=>JSON.stringify(p.canonical.athlete.equipment)]]){
  const c=beforeBreak(),was=read(c.p);
  step(c,5,{...D1,kind,interruption:BREAK(c.p),...extra});const rr=step(c,5,D2);
  assert.equal(rr.action,'REESTABLISH',kind);assert.equal(read(c.p),was,kind+': not applied with the break');
 }
});

// ---------- T5: duplicate and replay ----------
test('R7-D Phase 3.1 T5: the same break delivered again, or the same report replayed, records one fact and applies one return; the next reviews never apply it again',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),event={id:'p31-t5',kind:'SYSTEMIC_FATIGUE'};
 const first=step(t,5,{...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk,event});
 const replay=evaluateProgram(t.p,{...review(t.p,5,{...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk}),event,actualLedger:t.ledger},opts);
 assert.equal(replay.action,first.action);assert.equal(declarations(replay.actualLedger).length,1,'an exact replay adds no row');
 // The same break delivered again through another carrier while it is recorded: one more fact of the same break, one return.
 step(t,5,{...D1,hour:'08:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
 assert.equal(declarations(t.ledger).length,2);
 const r=step(t,5,D2);
 assert.equal(r.action,'REESTABLISH');assert.equal(returns(t.p).length,1,'one return');
 for(const day of [3,4,5]){const x=step(t,5,{day,hour:'07:00:00'});assert.notEqual(x.action,'REESTABLISH',`day ${day}: ${x.reason}`);}
 assert.equal(returns(t.p).length,1,'never applied again');assert.equal(new Set(returns(t.p).map(d=>d.interruption.episode)).size,1,'one interruption');
 assert.equal(declarations(t.ledger).length,2,'the record keeps both facts, unchanged');
});

// ---------- T6: correction ----------
test('R7-D Phase 3.1 T6: a newer declaration of the break replaces a recorded one not applied yet when it names it (R7-D Phase 3.2: unnamed, it is asked); the earlier decisions stay as they were',()=>{
 const t=beforeBreak(),brk=BREAK(t.p),corrected={...brk,startDate:addDays(brk.startDate,7),days:7};
 const r1=step(t,5,{...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk});
 const kept=JSON.parse(JSON.stringify({decisions:t.p.decisions,row:declarations(t.ledger)[0]}));
 step(t,5,{...D1,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:corrected});
 assert.deepEqual(JSON.parse(JSON.stringify(declarations(t.ledger)[0])),kept.row,'the first fact is never rewritten');
 assert.equal(r1.action,'ASK');assert.deepEqual(JSON.parse(JSON.stringify(t.p.decisions.slice(0,kept.decisions.length))),kept.decisions,'decision history is append-only');
 // R7-D Phase 3.2 (SSCTR-P31-F02, Founder): a newer declaration that does not name the recorded break never replaces it; the relation is asked.
 const q=step(t,5,D2);
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'INTERRUPTION_RELATION');assert.equal(returns(t.p).length,0);
 // Named as its correction (the episodeId of the report that declared it), it replaces it.
 const r=step(t,5,{...D3,interruption:{...corrected,episodeId:kept.row.eventId}}),d=r.proposal.decisions.at(-1);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.equal(d.interruption.startDate,corrected.startDate);assert.equal(d.interruption.days,7);assert.equal(d.interruption.class,'SHORT');
});
test('R7-D Phase 3.1 T6: a recorded break once applied is corrected through its episode, named by the report that declared it; only later decisions use the correction',()=>{
 const t=beforeBreak(),brk=BREAK(t.p);
 step(t,5,{...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk,event:{id:'p31-t6-declared',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,D2);
 const applied=JSON.parse(JSON.stringify(t.p.decisions));
 const r=step(t,5,{...D3,kind:'RETURN_AFTER_PAUSE',interruption:{...brk,endDate:addDays(brk.endDate,-2),days:12,episodeId:'p31-t6-declared'}});
 assert.equal(r.action,'REESTABLISH',r.reason);
 const d=r.proposal.decisions.at(-1);
 assert.deepEqual({relation:d.interruption.relation,basis:d.interruption.basis,episode:d.interruption.episode,revision:d.interruption.revision},{relation:'SAME_BREAK',basis:'EXPLICIT',episode:'p31-t6-declared',revision:2});
 assert.deepEqual(JSON.parse(JSON.stringify(t.p.decisions.slice(0,applied.length))),applied,'decision history is append-only');
});

// ---------- T7: clinical first is unchanged ----------
test('R7-D Phase 3.1 T7: a recorded break never passes a clinical route: a later clinical flag, a pain substitution or a standing clinical reference routes to a human with no return applied',()=>{
 const t=beforeBreak(),brk=BREAK(t.p);
 step(t,5,{...D1,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
 const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 for(const [label,x] of [['flag',{eligibility:flagged(t.p,5,2,'pain')}],['flag on a return report',{kind:'RETURN_AFTER_PAUSE',eligibility:flagged(t.p,5,2,'injury')}],['substitution',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}}]]){
  const c=copy(t),r=step(c,5,{...D2,...x});
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',label+': '+r.reason);assert.equal(r.proposal,null);assert.equal(returns(c.p).length,0,label);
  assert.equal(declarations(c.ledger).length,1,label+': the break stays recorded');
  const sticky=step(c,5,D3);assert.equal(sticky.status,'CLINICAL_HUMAN_REQUIRED',label+': the clinical reference stands');assert.equal(sticky.proposal,null);
 }
 // Unknown eligibility is asked, never cleared by the recorded break.
 const u=copy(t),r=step(u,5,{...D2,eligibility:{status:'UNKNOWN'}});
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['eligibility.currentAssessment']);assert.equal(returns(u.p).length,0);
});
test('R7-D Phase 3.1 T7: every event kind with a recorded break and a clinical flag routes to a human; with no flag none is valid before the return',()=>{
 const t=beforeBreak(),brk=BREAK(t.p);
 step(t,5,{...D1,kind:'MISSED_SESSION',interruption:brk});
 for(const kind of REVIEW_KINDS){
  const flaggedR=step(copy(t),5,{...D2,kind,eligibility:flagged(t.p,5,2)});
  assert.equal(flaggedR.status,'CLINICAL_HUMAN_REQUIRED',kind);assert.equal(flaggedR.proposal,null,kind);
  const plain=step(copy(t),5,{...D2,kind});
  assert.ok(plain.action==='REESTABLISH'||plain.planValidity.status!==VALID,`${kind}: ${plain.status} ${plain.reason}`);
 }
});

// ---------- the record ----------
test('R7-D Phase 3.1: the declared break is a record fact of its own kind: carried unchanged and append-only, never an execution report, never read when it is not this athlete\'s or its facts do not match its hash',()=>{
 const t=beforeBreak(),brk=BREAK(t.p);
 step(t,5,{...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk});
 const row=declarations(t.ledger)[0];
 assert.deepEqual(Object.keys(row).sort(),['athleteId','declaredAt','eventId','eventKind','fact','inputHash','interruption','provenance'].sort());
 assert.equal(row.declaredAt,`${addDays(t.p.weeks[5].startDate,1)}T07:00:00.000Z`);assert.equal(row.provenance.firstRecordedAt,row.declaredAt);
 // Never an execution report: the evidence reducer reads the same history with or without it.
 const cut=`${addDays(t.p.weeks[5].startDate,1)}T08:00:00Z`;
 assert.deepEqual(historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},opts),historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger.filter(o=>o.fact!==INTERRUPTION_DECLARED)},opts));
 // Carried unchanged by every later decision, whatever it decides.
 const c=copy(t);for(const x of [{...D2,kind:'LOCAL_FATIGUE'},{...D2,hour:'09:00:00'},{...D3}])step(c,5,x);
 assert.deepEqual(declarations(c.ledger),[row]);
 // A row that is not this athlete's, or whose facts were changed after recording, is carried but not read.
 for(const bad of [{...row,athleteId:'someone-else'},{...row,interruption:{...row.interruption,days:3}}]){
  const r=evaluateProgram(t.p,{...review(t.p,5,D2),actualLedger:[...t.ledger.filter(o=>o.fact!==INTERRUPTION_DECLARED),bad]},opts);
  assert.notEqual(r.action,'REESTABLISH',r.reason);assert.ok(r.actualLedger.some(o=>JSON.stringify(o)===JSON.stringify(bad)),'carried as given');
 }
});
test('R7-D Phase 3.1: a break that begins after its review is its own review\'s question, not a recorded fact; a template of empty fields records nothing; the same facts give the same decision',()=>{
 const t=beforeBreak(),start=addDays(t.p.weeks[5].startDate,3),future={startDate:start,endDate:addDays(start,6),reasonCategory:'TRAVEL',reason:'Trip next week',nonclinical:true};
 const r=step(t,5,{...D1,interruption:future});
 assert.equal(r.status,'ASK');assert.equal(declarations(t.ledger).length,0);
 const n=step(t,5,D2);assert.notEqual(n.action,'ASK',n.reason);
 const u=beforeBreak(),e=step(u,5,{...D1,interruption:{startDate:null,endDate:null,reason:null}});
 assert.equal(e.status,'ASK');assert.equal(declarations(u.ledger).length,0);
 const v=beforeBreak(),brk=BREAK(v.p),x={...D1,kind:'SYSTEMIC_FATIGUE',interruption:brk,event:{id:'p31-det',kind:'SYSTEMIC_FATIGUE'}};
 const once=evaluateProgram(v.p,{...review(v.p,5,x),event:x.event,actualLedger:v.ledger},opts),twice=evaluateProgram(v.p,{...review(v.p,5,x),event:x.event,actualLedger:v.ledger},opts);
 assert.equal(hash(JSON.parse(JSON.stringify(once))),hash(JSON.parse(JSON.stringify(twice))));
});
