// R7B2-SSCTR-r1 probe Q3 (SSCTR judge, session 6): is the factual correction carried by a clinically routed review only deferred, or lost?
// Scenario (the QE-R7B2-01 shape, S5R of the Engineering probe): 3 reviewed weeks, a WORK return on day 3 of week 3, weeks 3 and 4 reviewed; at
// day 0 of week 5 a review carries corrections of week 4's strength reports (same actual, adverse response). Step variants (both runtimes):
//   A  same-id return resend "Flu illness" + correction      (QE-R7B2-01: FREEZE-2 ASK + re-plan; R7-B.2 CLINICAL, no proposal)
//   B  same-id return resend "Flu illness", no correction    (S5R3: ASK -> CLINICAL, no proposal on either side)
//   C  new-id return "Flu illness" + correction               (pre-existing clinical + correction: CLINICAL on both)
//   D  substitution pain + correction                         (pre-existing clinical + correction: CLINICAL on both)
//   E  weekly review + correction, no clinical signal         (the correction applied at once: REPLAN_FROM_EVIDENCE)
//   F  no step                                               (no correction, no clinical report)
// After each step (proposal applied when there is one, the returned actualLedger always carried), the later reviews:
//   F1 week 5 day 1, weekly, carrying the step's referenceState (is the clinical dependency sticky; is anything proposed?)
//   F2 week 5 day 1, weekly, no referenceState, no reports       (the "human route resolved" reading: does it re-plan from the recorded correction?)
//   F3 week 5 day 1, weekly, no referenceState, the same correction rows sent again
//   F4 week 5 day 1, weekly, no referenceState, a correction of the correction rows with identical facts
//   HS historicalStateOf at week 5 day 1 (does the canonical state read the correction?)
//   W5 the whole week 5 executed as prescribed and reviewed (weekly helper); then the prescriptions of weeks 5-11
// Read-only on both trees (dual.mjs); writes only ./out/q3-resolution.json.
import {NOW,PRED,BAD,correctionOf,apply,snap,write} from './dual.mjs';

const dose=s=>!s.prescription?null:s.sport==='RUN'?{id:s.id,sport:'RUN',role:s.role,family:s.prescription.family??null,min:s.prescription.durationMinutes??null,status:s.status??null}
 :{id:s.id,sport:'STRENGTH',status:s.status??null,ex:(s.prescription.exercises??[]).map(e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,load:e.load?.mode==='KNOWN'?e.load.value:e.load?.mode??null}))};
const weekDoses=(p,k)=>p.weeks[k].sessions.map(dose);
const J=x=>JSON.stringify(x);

function runAll(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays}=rt.H,A=rt.A;
 const out={};
 for(const variant of ['A','B','C','D','E','F']){
  const t=reviewed({id:'ssctr-q3',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
  const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});
  const ret=apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));
  if(ret.action!=='REESTABLISH')throw new Error('setup return on '+rt.label+': '+ret.status);
  weekly(t,3);weekly(t,4);
  const p4=t.p,week5Planned=weekDoses(p4,5);
  const when=`${t.p.weeks[5].startDate}T05:00:00Z`;
  const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
  const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  let step=null;
  if(variant!=='F'){
   const illness={...first,reasonCategory:null,reason:'Flu illness'};
   const rv=variant==='D'?review(t.p,5,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:fixes})
    :variant==='E'?review(t.p,5,{day:0,hour:'06:00:00',observations:fixes})
    :review(t.p,5,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:illness,observations:variant==='B'?[]:fixes});
   const ev=variant==='A'||variant==='B'?{...rv.event,id:r0.event.id}:rv.event;
   step=evaluateProgram(t.p,{...rv,event:ev,actualLedger:t.ledger},opts);
   apply(t,step);
  }
  const after=t.p,ledger=t.ledger,refState=step?.referenceState??null;
  const later=(x,{ref=null}={})=>evaluateProgram(after,{...review(after,5,{day:1,hour:'06:00:00',...x}),...(ref?{referenceState:ref}:{}),actualLedger:ledger},opts);
  const F1=refState?later({},{ref:refState}):null;
  const F2=later({});
  const F3=fixes.length?later({observations:fixes.map(o=>structuredClone(o))}):null;
  const recFix=ledger.filter(o=>o.correctionOf&&!o.superseded);
  const F4=recFix.length?later({observations:recFix.map(o=>correctionOf(o,structuredClone(o.actual),`${addDays(t.p.weeks[5].startDate,1)}T05:00:00Z`,BAD))}):null;
  const hs=A.historicalStateOf(after,{asOf:`${addDays(after.weeks[5].startDate,1)}T05:30:00Z`,actualLedger:ledger},opts);
  const hsStrength=hs?Object.fromEntries(Object.entries(hs.strength.exercises).map(([id,e])=>[id,{lastExecutedLoad:e.lastExecutedLoad,loadTick:e.earnedProgress.loadTick,stepEarned:e.earnedProgress.stepEarned,lastExecutedSets:e.lastExecutedSets}])):null;
  const week5Now=weekDoses(after,5);
  const t5={p:after,ledger};const w5=weekly(t5,5);
  const weeksAfterW5=after.weeks.map((_,k)=>k).filter(k=>k>=5).map(k=>({k,doses:weekDoses(t5.p,k)}));
  out[variant]={
   step:step?{...snap(rt,step),proposalChangedWeeks:step.proposal?p4.weeks.map((w,k)=>J(weekDoses(p4,k))!==J(weekDoses(step.proposal,k))?k:null).filter(k=>k!==null):[],ledgerHasCorrection:(step.actualLedger??[]).some(o=>o.correctionOf&&!o.superseded),supersededOriginals:(step.actualLedger??[]).filter(o=>o.superseded).length}:null,
   corrections:fixes.length,
   F1:F1?snap(rt,F1):null,F2:snap(rt,F2),F3:F3?snap(rt,F3):null,F4:F4?snap(rt,F4):null,
   F2proposalWeeks:F2.proposal?after.weeks.map((w,k)=>J(weekDoses(after,k))!==J(weekDoses(F2.proposal,k))?k:null).filter(k=>k!==null):[],
   F3proposalWeeks:F3?.proposal?after.weeks.map((w,k)=>J(weekDoses(after,k))!==J(weekDoses(F3.proposal,k))?k:null).filter(k=>k!==null):[],
   F4proposalWeeks:F4?.proposal?after.weeks.map((w,k)=>J(weekDoses(after,k))!==J(weekDoses(F4.proposal,k))?k:null).filter(k=>k!==null):[],
   historicalStrength:hsStrength,historicalRun:hs?{mode:hs.run.mode,achieved:hs.run.achieved}:null,
   week5Planned,week5Now,week5Replanned:J(week5Planned)!==J(week5Now),
   w5:{status:w5.status,action:w5.action,reason:w5.reason,proposal:!!w5.proposal},
   weeksAfterW5
  };
 }
 return out;
}
const a=runAll(PRED),b=runAll(NOW);
// Comparisons.
const eqWeeks=(x,y)=>x.weeksAfterW5.map((w,i)=>J(w.doses)===J(y.weeksAfterW5[i].doses)?null:w.k).filter(k=>k!==null);
const doseDelta=(x,y)=>{ // per strength exercise row differences between two week-dose lists
 const rows=[];for(const s of x){const o=y.find(z=>z&&s&&z.id===s.id);if(!s||!o)continue;
  if(s.sport==='STRENGTH')for(const e of s.ex){const f=o.ex.find(q=>q.id===e.id);if(f&&J(e)!==J(f))rows.push({session:s.id,exercise:e.id,from:e,to:f});}
  else if(J(s)!==J(o))rows.push({session:s.id,from:s,to:o});}
 return rows;};
const cmp={
 // Does the recorded correction reach the canonical state on R7-B.2 after the clinical route (A vs B: same clinical step with and without it)?
 r7b2_historical_A_vs_B_differs:J(b.A.historicalStrength)!==J(b.B.historicalStrength),
 r7b2_historical_A_equals_E:J(b.A.historicalStrength)===J(b.E.historicalStrength),
 freeze2_historical_A_equals_E:J(a.A.historicalStrength)===J(a.E.historicalStrength),
 // Week 5 as the athlete would find it after the step.
 r7b2_A_week5_replanned:b.A.week5Replanned,freeze2_A_week5_replanned:a.A.week5Replanned,r7b2_E_week5_replanned:b.E.week5Replanned,
 r7b2_C_week5_replanned:b.C.week5Replanned,freeze2_C_week5_replanned:a.C.week5Replanned,
 week5_dose_delta_r7b2_A_vs_r7b2_E:doseDelta(b.A.week5Now,b.E.week5Now),
 week5_freeze2_A_equals_r7b2_E:J(a.A.week5Now)===J(b.E.week5Now),
 // After the whole week 5 executed as prescribed and reviewed.
 weeks_after_W5_differing_r7b2_A_vs_r7b2_B:eqWeeks(b.A,b.B),
 weeks_after_W5_differing_r7b2_A_vs_r7b2_F:eqWeeks(b.A,b.F),
 weeks_after_W5_differing_r7b2_A_vs_r7b2_E:eqWeeks(b.A,b.E),
 weeks_after_W5_differing_r7b2_A_vs_freeze2_A:eqWeeks(b.A,a.A),
 weeks_after_W5_differing_r7b2_A_vs_r7b2_C:eqWeeks(b.A,b.C),
 weeks_after_W5_differing_freeze2_C_vs_r7b2_C:eqWeeks(a.C,b.C),
 week6_dose_delta_r7b2_A_vs_r7b2_E:doseDelta(b.A.weeksAfterW5[1].doses,b.E.weeksAfterW5[1].doses),
 week6_dose_delta_r7b2_A_vs_r7b2_B:doseDelta(b.A.weeksAfterW5[1].doses,b.B.weeksAfterW5[1].doses)
};
const brief=x=>x?{status:x.status,proposal:x.proposal,pending:x.pending?.status??null,reason:String(x.reason).slice(0,140)}:null;
const table=Object.fromEntries(['A','B','C','D','E','F'].map(v=>[v,{freeze2:{step:brief(a[v].step),F1:brief(a[v].F1),F2:brief(a[v].F2),F3:brief(a[v].F3),F4:brief(a[v].F4),w5:a[v].w5},r7b2:{step:brief(b[v].step),F1:brief(b[v].F1),F2:brief(b[v].F2),F3:brief(b[v].F3),F4:brief(b[v].F4),w5:b[v].w5}}]));
write('q3-resolution',{comparisons:cmp,table,freeze2:a,r7b2:b});
console.log(JSON.stringify({comparisons:cmp,table},null,1));
