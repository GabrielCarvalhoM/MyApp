// DOMAIN_COACHING_R7-B.2 — QE-R7B1-04, clinical-screen-first (B0-C06 condition 8; SSCTR D08; TASK_CONTRACT §4). Once a review is admitted, a clinical
// route that the review's own handler screen takes is the decision: no nonclinical question comes back in its place, whether R7-A's late-evidence
// confirmation (staleReturn), the factual re-plan's own question, a block-choice or unrecognised-choice question, or the return's report-identity
// question. The route is the handler's own (status, reason, no proposal, pending CLINICAL_HUMAN_REQUIRED) and the review's evidence is still recorded.
// Late evidence is never suppressed: a later review with no clinical signal and no pending clinical state still gets the confirmation question.
// Every test fails on R7B1-FREEZE-2 except those named "preserved" (behaviour FREEZE-2 already had that the fix must keep).
import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs} from '../r7/b/fixtures/helpers.mjs';
import {programHash,validProgram} from '../src/r6-program.mjs';

const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const STALE=/^Training before the interruption that began on \d{4}-\d{2}-\d{2} is now recorded, and the return reported on \d{4}-\d{2}-\d{2} did not read it: confirm that interruption again/;
const PAIN_ROUTE=X=>'Pain, injury, illness or a functional limitation with '+X+' routes to qualified human assessment; no exercise is substituted as a remedy';
const ILLNESS_ROUTE='The interruption reason is clinical or possibly clinical (flu, illness): qualified assessment is needed; no nonclinical return recipe';
/** The handler's own clinical route: no proposal, and the clinical dependency carried to later reviews. */
const clinical=(r,at,reason=null)=>{
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',at+': '+r.status+' '+r.reason);assert.equal(r.action,'CLINICAL_HUMAN_REQUIRED',at);
 assert.equal(r.proposal,null,at+': a clinical route proposes nothing');
 assert.equal(r.referenceState?.pending?.status,'CLINICAL_HUMAN_REQUIRED',at+': the clinical dependency carries to later reviews');
 if(reason)assert.equal(r.reason,reason,at+': the handler\'s own route');
};

// ---------- the re-entry week of a return with late training before the break (the R7-B.1 judge probes K6 and K6b) ----------
/** Week 2's day-4 strength session is left out of its weekly review; a nonclinical return is reported on day 3 of week 3 (the break began on day 0).
 * Reporting that session now is late evidence of training before the break, which the return did not read (R7-A final I6). */
const reentry=()=>{
 const t=reviewed({id:'b2-k6',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 assert.equal(ret.action,'REESTABLISH','setup: the nonclinical return re-establishes');
 const X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return {t,late,lateObs:obs(t.p,late),X};
};
const at=(t,x,hour='06:00:00')=>evaluateProgram(t.p,{...review(t.p,3,{day:4,hour,...x}),actualLedger:t.ledger},opts);
const sub=(X,x={})=>({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...x}});
const recorded=(r,s)=>(r.actualLedger??[]).some(o=>o.sessionId===s.id&&!o.superseded);

test('R7-B.2 QE-R7B1-04: pain or injury with an exercise, reported with late training before the break, routes to a human before the late-evidence question',()=>{
 const {t,late,lateObs,X}=reentry();
 for(const [name,x] of [['pain',{pain:true}],['injury',{injury:true}],['pain as a word',{pain:'yes'}],['a clinical free text',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'My knee hurts when I squat'}]]){
  const r=at(t,{...sub(X,x),observations:[lateObs]});
  clinical(r,name,PAIN_ROUTE(X));
  assert.ok(recorded(r,late),name+': the late report is still recorded, never suppressed');
 }
});
test('R7-B.2 QE-R7B1-04: with a block choice or an unrecognised choice in the same review, the clinical route still wins',()=>{
 const {t,late,lateObs,X}=reentry();
 for(const [name,choices] of [['ladder step',[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]],['graduation decline',[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]],['unrecognised',[{type:'LADDER_JUMP'}]]]){
  const r=at(t,{...sub(X,{pain:true}),observations:[lateObs],choices});
  clinical(r,name,PAIN_ROUTE(X));assert.ok(recorded(r,late),name+': the late report is still recorded');
 }
});
test('R7-B.2 QE-R7B1-04: two steps — the late report recorded with its question, then a pain-only review of the same re-entry week routes to a human',()=>{
 const {t,late,lateObs,X}=reentry();
 const sync=apply(t,at(t,{observations:[lateObs]},'05:00:00'));
 assert.equal(sync.status,'ASK');assert.match(sync.reason,STALE,'setup: the late report alone gets the confirmation question');assert.ok(recorded(sync,late));
 const r=at(t,{...sub(X,{pain:true}),observations:[]});
 clinical(r,'pain-only review',PAIN_ROUTE(X));assert.ok(recorded(r,late),'the late report stays in the record');
});
test('R7-B.2 QE-R7B1-04: after the clinical route a later review with no clinical signal and no pending clinical state still gets the late-evidence question, and one carrying the clinical state stays clinical',()=>{
 const {t,lateObs,X}=reentry();
 const pain=apply(t,at(t,{...sub(X,{pain:true}),observations:[lateObs]},'05:00:00'));
 const later=at(t,{observations:[]});
 assert.equal(later.status,'ASK');assert.match(later.reason,STALE,'the late evidence is not lost behind the clinical route');
 assert.deepEqual(later.missingInputs,['interruption.episodeId']);assert.equal(later.proposal,null);
 const carried=evaluateProgram(t.p,{...review(t.p,3,{day:4,hour:'06:00:00'}),actualLedger:t.ledger,referenceState:pain.referenceState},opts);
 assert.equal(carried.status,'CLINICAL_HUMAN_REQUIRED','a pending clinical state is never cleared by a later nonclinical review');
});
test('R7-B.2 preserved (neighbor A): late training before the break with no clinical signal gets R7-A\'s confirmation question, whatever the review kind',()=>{
 const {t,lateObs,X}=reentry();
 for(const [name,x] of [['weekly review',{}],['substitution without pain',sub(X,{pain:false,injury:false})],['substitution with an unclear pain flag',sub(X,{pain:'maybe'})],['nonclinical discomfort',sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'I just dislike this one'})]]){
  const r=at(t,{...x,observations:[lateObs]});
  assert.equal(r.status,'ASK',name+': '+r.reason);assert.match(r.reason,STALE,name);assert.deepEqual(r.missingInputs,['interruption.episodeId'],name);
  assert.notEqual(r.referenceState?.pending?.status,'CLINICAL_HUMAN_REQUIRED',name+': no clinical reading is invented');
 }
});
test('R7-B.2 preserved (neighbor B): a clinical signal with no late evidence takes the handler\'s own route',()=>{
 const {t,X}=reentry();
 clinical(at(t,{...sub(X,{pain:true}),observations:[]}),'substitution pain',PAIN_ROUTE(X));
 clinical(at(t,{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true},observations:[]}),'illness return',ILLNESS_ROUTE);
});
test('R7-B.2 preserved: a return reporting an illness in the re-entry week routes to a human, with or without late training before the break',()=>{
 const {t,late,lateObs}=reentry();
 const r=at(t,{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true},observations:[lateObs]});
 clinical(r,'illness return with the late report',ILLNESS_ROUTE);assert.ok(recorded(r,late));
});
test('R7-B.2 preserved (neighbor D): a nonclinical correction of earlier reports with late training before the break is never routed to a human',()=>{
 const {t,lateObs}=reentry(),day=t.p.weeks[3].startDate;
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${addDays(day,4)}T05:00:00Z`,BAD));
 assert.ok(fixes.length,'setup: week 2 has strength reports to correct');
 const r=at(t,{observations:[...fixes,lateObs]});
 assert.equal(r.status,'ASK',r.reason);assert.match(r.reason,STALE);assert.notEqual(r.referenceState?.pending?.status,'CLINICAL_HUMAN_REQUIRED');
 assert.ok((r.actualLedger??[]).some(o=>o.correctionOf),'the correction is recorded');
});
test('R7-B.2 preserved (neighbor F): a skill substitution with no clinical signal and no late evidence substitutes as R7-B.1 does',()=>{
 const t=reviewed({id:'b2-f',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2),day=t.p.weeks[2].startDate;
 const X=t.p.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))[0];
 const r=evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',...sub(X)}),actualLedger:t.ledger},opts);
 assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.ok(r.proposal,'the substitution is proposed');
 assert.ok(!r.proposal.weeks.slice(2).flatMap(w=>w.sessions).filter(s=>live(s)&&s.date>day).some(s=>s.prescription.exercises?.some(e=>e.id===X)),'the exercise set aside is no longer planned ahead');
});

// ---------- the return's report-identity question (R7B2-CAND-02): a resent report under the same event id ----------
const returned=()=>{
 const t=reviewed({id:'b2-c02',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});
 assert.equal(apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts)).action,'REESTABLISH','setup');
 const again=(interruption,id=r0.event.id)=>{const r=review(t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption});return evaluateProgram(t.p,{...r,event:{...r.event,id},actualLedger:t.ledger},opts);};
 return {first,again};
};
test('R7-B.2 CAND-02: a return report resent under the same event id whose reason is clinical routes to a human, not to the report-id question',()=>{
 const {first,again}=returned();
 clinical(again({...first,reasonCategory:null,reason:'Flu illness'}),'illness reason',ILLNESS_ROUTE);
 clinical(again({...first,reasonCategory:'INJURY',reason:'Twisted ankle'}),'injury category');
 clinical(again({...first,clinicalReason:true}),'clinical flag');
});
test('R7-B.2 preserved (CAND-02): the same report again is kept, and the same id with other nonclinical facts is asked',()=>{
 const {first,again}=returned();
 const same=again(first);assert.equal(same.status,'KEEP');assert.equal(same.reason,'This interruption report is already recorded; nothing changes');
 const other=again({...first,reason:'Family visit',reasonCategory:'FAMILY'});
 assert.equal(other.status,'ASK');assert.deepEqual(other.missingInputs,['event.id']);
});

// ---------- the factual re-plan's own question (R7B2-CAND-01) ----------
/** The public API never records an unavailable date that holds the race (the handler asks, and an event moves only through a rebuild that asks the
 * same question), so the state is built directly: the runtime's own program with that adaptation on its race week and its hash recomputed, which
 * validProgram accepts. A correction of last week's reports then moves this week's PlanningView and the factual re-plan raises its question. */
const factualAsk=()=>{
 const EV={id:'b2-c01',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
 const t=reviewed(EV,5),w=5,day=t.p.weeks[w].startDate,race=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription);
 const p=structuredClone(t.p),rw=p.weeks[race.weekIndex];
 rw.adaptations=[...(rw.adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'b2-state',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];p.hash=programHash(p);
 assert.ok(validProgram(p),'setup: the program is valid for the runtime');
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w-1].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
 const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return {X,fixes,at:x=>evaluateProgram(p,{...review(p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts)};
};
test('R7-B.2 CAND-01: when the factual re-plan raises its own question, a review reporting pain or an illness still routes to a human',()=>{
 const {X,fixes,at:on}=factualAsk();
 const r=on({...sub(X,{pain:true}),observations:fixes});
 clinical(r,'substitution pain',PAIN_ROUTE(X));assert.ok((r.actualLedger??[]).some(o=>o.correctionOf),'the correction is still recorded');
 clinical(on({kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true},observations:fixes}),'illness return',ILLNESS_ROUTE);
 clinical(on({...sub(X,{pain:true}),observations:fixes,choices:[{type:'LADDER_JUMP'}]}),'substitution pain with an unrecognised choice',PAIN_ROUTE(X));
});
test('R7-B.2 preserved (CAND-01): without a clinical signal the factual re-plan\'s question is asked as before',()=>{
 const {X,fixes,at:on}=factualAsk();
 for(const [name,x] of [['weekly review',{}],['substitution without pain',sub(X)]]){
  const r=on({...x,observations:fixes});
  assert.equal(r.status,'ASK',name);assert.equal(r.reason,'The race now falls on a date marked unavailable; confirm whether the race still happens on that date or the new date',name);
 }
});
