// QE-R7B2 judge probe S5: does any changed decision carry a proposal on the FREEZE-2 side? In the re-entry week a review can carry, besides
// late pre-break evidence (R7-A's question), a correction that moves this week's PlanningView: on FREEZE-2 the late-evidence question (or the
// return's report-identity question) is then returned with the factual re-plan proposed (withFactualReplan attaches it to a question); on
// R7-B.2 the clinical route proposes nothing. Contract §5/§7 G4 allow only "nonclinical question -> CLINICAL_HUMAN_REQUIRED, no proposal on either
// side". Read-only on both trees (dual.mjs). Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node s5-factual-proposal.mjs
import {NOW,PRED,BAD,correctionOf,apply,snap,diff,write,reentry,at,sub,recorded} from './dual.mjs';

function scenario(rt){
 const {review,evaluateProgram,opts,live,obs,addDays}=rt.H,rows=[];
 const row=(name,r,x={})=>rows.push({name,...snap(rt,r),...x});
 // Base: the re-entry state; the day-3 run (after the return report at 06:00) is executed and reported that evening (no late evidence yet).
 const base=()=>{
  const e=reentry(rt,'qe-s5');
  const run3=e.t.p.weeks[3].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date===e.rep);
  const o3=obs(e.t.p,run3),sync=apply(e.t,evaluateProgram(e.t.p,{...review(e.t.p,3,{day:3,hour:'21:00:00',observations:[o3]}),actualLedger:e.t.ledger},opts));
  const fix=correctionOf(e.t.ledger.find(o=>o.sessionId===run3.id&&!o.correctionOf),{completed:true,minutes:o3.actual.minutes},`${addDays(e.rep,1)}T05:00:00Z`,BAD);
  return {...e,run3,sync,fix};
 };
 {const e=base();row('setup: day-3 run reported the same evening',e.sync,{run3:e.run3.id,X:e.X});}
 // S5a: correction of this week's run + late pre-break report, no clinical signal (control: both runtimes alike).
 {const e=base();row('S5a correction(this week) + late, weekly, no signal',at(rt,e.t,3,{observations:[e.fix,e.lateObs]}));}
 // S5b: the same + substitution pain with a named exercise (the changed decision under test).
 {const e=base();const r=at(rt,e.t,3,{...sub(e.X,{pain:true}),observations:[e.fix,e.lateObs]});row('S5b correction(this week) + late + substitution pain',r,{lateRecorded:recorded(r,e.late)});}
 // S5c: the same + pain + a block choice.
 {const e=base();row('S5c correction(this week) + late + pain + ladder choice',at(rt,e.t,3,{...sub(e.X,{pain:true}),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],observations:[e.fix,e.lateObs]}));}
 // S5d: correction + pain, no late report (control: the handler's own route on both).
 {const e=base();row('S5d correction(this week) + pain, no late (control)',at(rt,e.t,3,{...sub(e.X,{pain:true}),observations:[e.fix]}));}
 // S5e: correction only, no late, no signal (control: the factual re-plan alone).
 {const e=base();row('S5e correction(this week) only (control)',at(rt,e.t,3,{observations:[e.fix]}));}
 // S5f: the return resent under its own event id with an illness reason + the correction (CAND-02 path with a factual re-plan).
 {const e=base();const r0=e.ret;const id=(r0.proposal?.decisions??e.t.p.decisions).filter(d=>d.action==='REESTABLISH').at(-1).eventId;
  const rv=review(e.t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:e.t.p.weeks[3].startDate,endDate:addDays(e.rep,-1),reasonCategory:null,reason:'Flu illness',nonclinical:true},observations:[e.fix]});
  row('S5f same-id resend (illness) + correction(this week)',evaluateProgram(e.t.p,{...rv,event:{...rv.event,id},actualLedger:e.t.ledger},opts),{sameId:id});
  const rv2=review(e.t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:e.t.p.weeks[3].startDate,endDate:addDays(e.rep,-1),reasonCategory:'FAMILY',reason:'Family visit',nonclinical:true},observations:[e.fix]});
  row('S5g same-id resend (other nonclinical facts) + correction (control)',evaluateProgram(e.t.p,{...rv2,event:{...rv2.event,id},actualLedger:e.t.ledger},opts),{sameId:id});}
 // S5h: week 2 strength corrections (the D neighbor) + late + pain: does the pre-break correction move the view in the re-entry week?
 {const e=base();const fixes=e.t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&e.t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${addDays(e.rep,1)}T05:00:00Z`,BAD));
  row('S5h correction(week 2 strength) + late + pain',at(rt,e.t,3,{...sub(e.X,{pain:true}),observations:[...fixes,e.lateObs]}),{fixes:fixes.length});
  row('S5i correction(week 2 strength) + late, no signal (D neighbor)',at(rt,e.t,3,{observations:[...fixes,e.lateObs]}));}
 // S5R: a return resent under its own event id two weeks later (CAND-02 path) in a review that also corrects last week's reports, so the
 // factual re-plan proposes; FREEZE-2 attaches that proposal to the report-identity question (withFactualReplan).
 {const {reviewed,weekly}=rt.H;const t=reviewed({id:'qe-s5r',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
  const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});row('S5R0 return (WORK), week 3',apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts)));
  weekly(t,3);weekly(t,4);
  const when=`${t.p.weeks[5].startDate}T05:00:00Z`,fixes=()=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
  const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const ret=(interruption,{fx=true,id=r0.event.id,hour='06:00:00'}={})=>{const rv=review(t.p,5,{day:0,hour,kind:'RETURN_AFTER_PAUSE',interruption,observations:fx?fixes():[]});return evaluateProgram(t.p,{...rv,event:{...rv.event,id},actualLedger:t.ledger},opts);};
  row('S5R1 weekly + correction(week 4) (control: the factual re-plan proposes)',at(rt,t,5,{observations:fixes()},{day:0}));
  const r1=ret({...first,reasonCategory:null,reason:'Flu illness'});row('S5R2 same-id resend (illness) + correction(week 4)',r1,{ledgerHasCorrection:(r1.actualLedger??[]).some(o=>o.correctionOf)});
  row('S5R3 same-id resend (illness), no correction',ret({...first,reasonCategory:null,reason:'Flu illness'},{fx:false}));
  row('S5R4 new-id return (illness) + correction (control: the handler route, no proposal)',ret({...first,reasonCategory:null,reason:'Flu illness'},{id:'qe-s5r-new'}));
  row('S5R5 substitution pain + correction (control: the handler route, no proposal)',at(rt,t,5,{...sub(X,{pain:true}),observations:fixes()},{day:0}));
  row('S5R6 same-id resend (other nonclinical facts) + correction (control)',ret({...first,reasonCategory:'FAMILY',reason:'Family visit'}));
  row('S5R7 same-id resend (same facts) + correction (control)',ret(first));
  row('S5R8 same-id resend (illness) + correction + ladder choice',(()=>{const rv=review(t.p,5,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...first,reasonCategory:null,reason:'Flu illness'},observations:fixes(),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]});return evaluateProgram(t.p,{...rv,event:{...rv.event,id:r0.event.id},actualLedger:t.ledger},opts);})());
  // What follows on each runtime when the athlete's client applies the result: the next review of the week (no signal, no reference state).
  const t2={p:t.p,ledger:t.ledger};apply(t2,r1);row('S5R9 after S5R2 applied: next review of week 5, no signal, no reference state',evaluateProgram(t2.p,{...review(t2.p,5,{day:1,hour:'06:00:00'}),actualLedger:t2.ledger},opts),{programAdvanced:t2.p.hash!==t.p.hash});
  const t3={p:t.p,ledger:t.ledger};apply(t3,r1);rt.H.weekly(t3,5);row('S5R10 after S5R2 applied: weekly review of week 6 (whole-week evidence)',rt.H.weekly(t3,6));
 }
 return rows;
}
const a=scenario(PRED),b=scenario(NOW);
const rows=a.map((x,i)=>{const y=b[i],d=diff(x,y);return {name:x.name,same:!d.length,differs:d,freeze2:x,r7b2:y};});
const outsideS5=rows.filter(r=>!r.same&&!(r.r7b2.status==='CLINICAL_HUMAN_REQUIRED'&&r.freeze2.status==='ASK'&&!r.freeze2.proposal&&!r.r7b2.proposal));
const out=write('s5-factual-proposal',{rows,changedRows:rows.filter(r=>!r.same).map(r=>r.name),changedOutsideSection5:outsideS5.map(r=>({name:r.name,freeze2:{status:r.freeze2.status,proposal:r.freeze2.proposal,reason:r.freeze2.reason},r7b2:{status:r.r7b2.status,proposal:r.r7b2.proposal,reason:r.r7b2.reason}}))});
console.log(JSON.stringify({changed:out.changedRows,changedOutsideSection5:out.changedOutsideSection5},null,1));
for(const r of rows)console.log((r.same?'SAME ':'DIFF ')+r.name+' | F2 '+r.freeze2.status+(r.freeze2.proposal?' +proposal':'')+' | B2 '+r.r7b2.status+(r.r7b2.proposal?' +proposal':'')+' | '+String(r.freeze2.reason).slice(0,90));
