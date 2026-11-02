// QE probe E1: the answer to UNREPORTED_TRAINING lands in the carried record through a decision that records it but does not apply it
// (R4 HOLD in the program's last week; a handler clinical route; a clinical return report). Does the NEXT decision re-plan the stale stored week
// from the facts, or does it keep and validate the projection stored while the training was unknown (the SSCTR-SD-01 class)?
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e1-answer-in-carried-record.mjs
import {GEN,R10K,ENTRY,fork,step,copy,AT,runsFrom,stale,brief,live,addDays,elig} from './qe-lib.mjs';
const out={probe:'QE-E1 answer in the carried record',entry:ENTRY,cases:[]};
function next(t,b,d,label,x={}){const r=step(t,b,{...AT(d),...x});return {label,...brief(r),runsAheadInForce:runsFrom(r.proposal??t.p,b,d),staleValid:r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&stale(runsFrom(r.proposal??t.p,b,d))};}
// Case 1: R4. R10K, gap from week g, the week-10 review asks; in race week (week 11, the program's last week) the answer arrives inside a schedule
// change on day 2 (HOLD, R4); the next decisions are a plain review on day 3 (no observations), and a plain review on day 3 with the answer re-sent.
for(const g of [0,2])for(const mode of ['RV','NR']){
 const b=11,{A,B,facts}=fork(R10K,{g,b,mode,V:'MISS'});
 const onTime=copy(A),aRef=step(onTime,b,{...AT(3)});
 const t=copy(B),hold=step(t,b,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
 const recorded=facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId));
 const c={case:`R4 R10K g=${g} ${mode} MISS`,storedRaceWeekAhead:runsFrom(B.p,b,3),onTimeAtDay3:{...brief(aRef),runsAheadInForce:runsFrom(aRef.proposal??onTime.p,b,3)},carrier:{...brief(hold),answerRecorded:recorded},next:[]};
 c.next.push(next(copy(t),b,3,'plain review day 3, no observations'));
 c.next.push(next(copy(t),b,3,'plain review day 3, answer re-sent',{observations:facts}));
 out.cases.push(c);
}
// Case 2: handler clinical route. GEN, gap from week 0 reviewed with runs unreported, week-6 review asks; on day 2 of week 7 an exercise
// substitution with pain carries the answer (CLINICAL_HUMAN_REQUIRED; the answer is recorded). After qualified clearance the client continues
// with the carried record and no clinical reference state (the runtime cannot clear it): a plain review on day 3, with and without the answer re-sent (C3).
for(const g of [0,2]){
 const b=7,{A,B,facts}=fork(GEN,{g,b,mode:'RV',V:'MISS'});
 const onTime=copy(A),aRef=step(onTime,b,{...AT(3)});
 const t=copy(B),X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const clin=step(t,b,{...AT(2),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});
 const recorded=facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId));
 const c={case:`clinical substitution GEN g=${g} RV MISS`,storedWeekAhead:runsFrom(B.p,b,3),onTimeAtDay3:{...brief(aRef),runsAheadInForce:runsFrom(aRef.proposal??onTime.p,b,3)},carrier:{...brief(clin),answerRecorded:recorded},next:[]};
 c.next.push(next(copy(t),b,3,'sticky clinical reference kept: plain review day 3'));
 c.next.push(next(copy(t),b,3,'after clearance (no reference state): plain review day 3, no observations',{referenceState:null}));
 c.next.push(next(copy(t),b,3,'after clearance (no reference state): plain review day 3, answer re-sent (C3)',{referenceState:null,observations:facts}));
 c.next.push(next(copy(t),b,3,'after clearance (no reference state): systemic fatigue day 3',{referenceState:null,kind:'SYSTEMIC_FATIGUE'}));
 // Control: the same answer re-sent after clearance when the clinical decision had NOT recorded it (eligibility flag, R5).
 const u=copy(B),el=step(u,b,{...AT(2),observations:facts,eligibility:{...elig(addDays(u.p.weeks[b].startDate,2)),pain:true}});
 c.controlEligibilityClinical={carrier:{...brief(el),answerRecorded:facts.every(f=>u.ledger.some(o=>o.sessionId===f.sessionId))},next:next(copy(u),b,3,'after clearance: plain review day 3, answer re-sent',{referenceState:null,observations:facts})};
 out.cases.push(c);
}
// Case 3: clinical return report (illness) carrying the answer, then clearance.
{
 const b=7,{A,B,facts}=fork(GEN,{g:2,b,mode:'RV',V:'MISS'});
 const t=copy(B),start=t.p.weeks[2].startDate,end=addDays(t.p.weeks[b].startDate,1);
 const clin=step(t,b,{...AT(2),kind:'RETURN_AFTER_PAUSE',observations:facts,interruption:{startDate:addDays(t.p.weeks[b].startDate,0),endDate:end,days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}});
 const c={case:'clinical return report GEN g=2 RV MISS',storedWeekAhead:runsFrom(B.p,b,3),carrier:{...brief(clin),answerRecorded:facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId))},next:[]};
 c.next.push(next(copy(t),b,3,'after clearance (no reference state): plain review day 3, no observations',{referenceState:null}));
 c.next.push(next(copy(t),b,3,'after clearance (no reference state): plain review day 3, answer re-sent',{referenceState:null,observations:facts}));
 out.cases.push(c);
}
out.summary={staleValidAfterRecordedAnswer:out.cases.flatMap(c=>c.next.filter(n=>n.staleValid).map(n=>`${c.case} :: ${n.label}`))};
console.log(JSON.stringify(out,null,1));
