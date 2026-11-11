// CoachingCore V1 Final Closure (Founder request of 2026-11-11): the V1 scope of F08 in the engine (src/v1-index.mjs), with the conditions of
// SSCTR-V1FC-DECISION item C.1. The temporary reduction (Situation 1) is unreachable from every input; holds, the readiness declaration and declared
// breaks are the paths that stay. Development authority; synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as V1 from '../src/v1-index.mjs';
import * as Research from '../src/r6-index.mjs';
import * as F from '../src/v1-f08.mjs';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,review,obs,live,addDays} from '../r7/b/fixtures/helpers.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const GEN={id:'v1fc-scope',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false]));
/** A conforming client over the V1 engine: it keeps the record and the reference each decision returns. */
const client=(p)=>({p,ledger:[],ref:null});
const step=(t,w,x={},engine=V1)=>{const r=engine.evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const done=(t,w)=>step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
const setsOf=(p,w,id='back-squat')=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
const base=()=>{const t=client(program(GEN));for(const w of [0,1])done(t,w);return t;};
const report=(t,w,wellbeing,x={})=>step(t,w,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',...x,wellbeing,event:{id:'nf-'+hash(wellbeing).slice(0,8),kind:'NOT_FEELING_100'}});

test('C.1: every Situation 1 intent, for every condition, gives the typed unavailability and a plan byte for byte the one before the report; nothing of it joins the record',()=>{
 for(const condition of F.CONDITIONS)for(const intent of F.intentsFor(condition))for(const extra of [{},{returnSpeed:'FASTER'},{sports:condition==='MINOR_DISCOMFORT'?['STRENGTH']:undefined,region:condition==='MINOR_DISCOMFORT'?'LOWER_BODY':undefined}]){
  const t=base(),before=t.p.hash,rows=t.ledger.length,w={condition,warningSigns:NO(condition),intent,days:5,...Object.fromEntries(Object.entries(extra).filter(([,v])=>v!==undefined))};
  const r=report(t,2,w);
  assert.equal(r.status,'KEEP',`${condition} ${intent}: ${r.reason}`);assert.equal(r.proposal,null);assert.equal(t.p.hash,before);assert.deepEqual(r.unavailable,{code:'OUTSIDE_V1_SCOPE',capability:'TEMPORARY_REDUCTION',paths:['MISSED_SESSION','RETURN_AFTER_PAUSE']});
  assert.equal(t.ledger.length,rows,'no row is added');assert.ok(!t.ledger.some(x=>F.isF08Fact(x)));assert.equal(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE','the plan in force stays valid');
  assert.ok(!t.p.weeks.some(x=>(x.adaptations??[]).some(a=>a.kind==='WELLBEING_REDUCTION')));
 }
});
test('C.1: what the answer tells the athlete (and never that they are fine to train); a race within 20 days adds its own sentence',()=>{
 const t=base(),r=report(t,2,{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REDUCE_SUBSTANTIAL',days:4});
 for(const part of [/does not adjust the plan for feeling under par/,/skip, shorten or stop any session/,/a missed session is never made up/,/does not step up on sessions not done/,/report a break and the return is planned for you/,/persist or worsen, or any warning sign appears, report it and seek a health professional's assessment/])assert.match(r.reason,part);
 assert.doesNotMatch(r.reason,/you are fine|safe to train|cleared|no problem/i);assert.doesNotMatch(r.reason,/race is within 20 days/);
 // A 10K plan, two weeks before its race.
 const p=Research.generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,opts).program,E=p.phases.raceWeek,u=client(p);for(let w=0;w<E-2;w++)done(u,w);
 const near=step(u,E-2,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3},event:{id:'nf-near',kind:'NOT_FEELING_100'}});
 assert.equal(near.status,'KEEP');assert.match(near.reason,/Your race is within 20 days: you can mark the race date unavailable or change the event/);
});
test('C.1: the warning-sign instrument is unchanged: an unknown answer is asked (never the unavailability), any yes is the clinical hold for every sport, and the report earns nothing',()=>{
 const t=base(),signs=NO('MILD_ILLNESS');delete signs[F.WARNING_SIGNS.W12];
 const ask=report(t,2,{condition:'MILD_ILLNESS',warningSigns:signs,intent:'REST',days:4});assert.equal(ask.status,'ASK');assert.equal(ask.unavailable,undefined);assert.deepEqual(ask.missingInputs,['wellbeing.warningSigns.'+F.WARNING_SIGNS.W12]);
 const none=report(base(),2,{condition:'MILD_ILLNESS',intent:'REST',days:4});assert.equal(none.status,'ASK','no answers at all: every sign is asked');assert.equal(none.missingInputs.length,F.signsFor('MILD_ILLNESS').length);
 const u=base(),hold=report(u,2,{condition:'NEED_REST',warningSigns:{...NO('NEED_REST'),[F.WARNING_SIGNS.W5]:true},intent:'REST',days:3});
 assert.equal(hold.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(hold.guidance.level,'URGENT_CARE_ADVISED');assert.equal(hold.guidance.wordingStatus,'INTERIM_PENDING_G04');assert.equal(u.ledger.filter(x=>x.fact===F.CLINICAL_HOLD).length,1);
 assert.equal(done(u,2).status,'CLINICAL_HUMAN_REQUIRED','every later review stays on the hold, with no prescription');
 // The report is no compatible response: a week reviewed after it steps exactly as the same week without it.
 const a=base(),b=base();report(a,2,{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3});
 const ra=done(a,2),rb=done(b,2);assert.deepEqual(ra.gates,rb.gates);assert.equal(a.p.weeks[3].sessions.map(s=>hash(s.prescription??null)).join(),b.p.weeks[3].sessions.map(s=>hash(s.prescription??null)).join());
});
test('C.1: Situation 1 is unreachable from every input: a record or a plan that holds a temporary reduction (made outside V1) is never planned over',()=>{
 const t=base(),w={condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4};
 const r=step(t,2,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',wellbeing:w,event:{id:'nf-research',kind:'NOT_FEELING_100'}},Research);
 assert.equal(r.status,'MODIFY','the research engine opens the window');assert.ok(t.ledger.some(x=>x.fact===F.WELLBEING_DECLARED));assert.ok(t.p.weeks.some(x=>(x.adaptations??[]).some(a=>a.kind==='WELLBEING_REDUCTION')));
 const v=done(t,2);assert.equal(v.status,'HOLD');assert.deepEqual(v.errors,['record.outsideV1Scope']);assert.equal(v.proposal,null);
 // The plan alone (the record withheld) holds too; a check or a later report cannot move it either.
 const alone={p:t.p,ledger:[],ref:null};assert.equal(done(alone,2).status,'HOLD');
 const c=step({p:t.p,ledger:t.ledger,ref:t.ref},2,{kind:'WELLBEING_CHECK',day:5,hour:'08:00:00',wellbeingCheck:{warningSigns:NO('NEED_REST'),improved:true},event:{id:'chk-1',kind:'WELLBEING_CHECK'}});assert.equal(c.status,'HOLD');
});
test('C.1 (QRE-FFC-01 through the kept paths): across a chain of declared breaks, strength sets come back at most one per week and never at the held dose (D49)',()=>{
 const t=base(),S2=t.p.weeks[2].startDate,held=setsOf(t.p,2);assert.equal(held,3);
 const brk=(from,to,x={})=>({startDate:addDays(S2,from),endDate:addDays(S2,to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
 // Break A: weeks 2 and 3 (14 days). Its return is reported on the first day of week 4.
 const a=step(t,4,{kind:'RETURN_AFTER_PAUSE',day:0,hour:'07:00:00',interruption:brk(0,13),event:{id:'ret-a',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(a.status,'MODIFY',a.reason);const afterA=[4,5,6,7].map(w=>setsOf(t.p,w));assert.ok(afterA[0]<held,`the return enters below the held dose: ${afterA}`);
 for(let i=1;i<afterA.length;i++)assert.ok(afterA[i]-afterA[i-1]<=1,`one set a week at most: ${afterA}`);
 // Week 4 is not done. Break B (week 4, 7 days) is reported on the first day of week 5: the chain never restores what break A's return held.
 const b=step(t,5,{kind:'RETURN_AFTER_PAUSE',day:0,hour:'07:00:00',interruption:brk(14,20,{reasonCategory:'WORK',reason:'Work trip'}),event:{id:'ret-b',kind:'RETURN_AFTER_PAUSE'}});
 assert.ok(['MODIFY','KEEP','ASK'].includes(b.status),b.reason);
 const afterB=[5,6,7,8].map(w=>setsOf(t.p,w));assert.ok(afterB[0]<=afterA[0],`after the second break the entry is no higher than the first return's entry: ${afterA} then ${afterB}`);
 assert.ok(afterB[0]<held);for(let i=1;i<afterB.length;i++)assert.ok(afterB[i]-afterB[i-1]<=1,`one set a week at most: ${afterB}`);
 // Executed weeks then decide: each reviewed week adds at most one set to what was executed.
 let last=afterB[0];for(const w of [5,6,7]){const r=done(t,w);assert.notEqual(r.status,'HOLD',r.reason);const next=setsOf(t.p,w+1);assert.ok(next-last<=1,`week ${w+1}: ${next} after ${last} executed`);last=next;}
 assert.ok(!t.ledger.some(x=>x.fact===F.WELLBEING_DECLARED),'the kept paths never create a temporary-reduction fact');
});
test('G.6 and G.3: a race that takes longer than its window is never an adverse response and changes no gate; its duration is no training peak',()=>{
 const p0=Research.generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,opts).program,E=p0.phases.raceWeek;
 const run=minutes=>{const t=client(p0);for(let w=0;w<E;w++)done(t,w);const race=t.p.weeks[E].sessions.find(s=>s.role==='RACE');
  const r=step(t,E,{observations:t.p.weeks[E].sessions.filter(live).map(s=>s.id===race.id?{...obs(t.p,s),actual:{completed:true,minutes}}:obs(t.p,s))});return {r,t,race};};
 const inside=run(60),over=run(110);assert.ok(over.race.prescription.durationMinutes<110,'longer than the 75-minute window');
 assert.equal(over.r.status,inside.r.status);assert.deepEqual(over.r.gates,inside.r.gates,'the same gates whatever the race took');
 assert.ok(!(over.r.provenance?.conflicts??[]).length);assert.equal(over.r.reason,inside.r.reason,'the same decision in the same words');assert.equal(over.r.action,inside.r.action);
 const peak=t=>Math.max(...t.p.stateTrace.map(s=>s.run?.achieved?.long??0));assert.equal(peak(over.t),peak(inside.t),'the race is no achieved long run');assert.ok(peak(over.t)<110);
});
