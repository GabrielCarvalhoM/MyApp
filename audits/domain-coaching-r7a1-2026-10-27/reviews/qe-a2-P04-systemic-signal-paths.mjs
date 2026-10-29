// R7A1-QE-r1 P04: is the weekly review's systemic hold one rule for every handler (C3 "one rule"; C4 SYSTEMIC_SIGNAL)?
// (b) A week whose weekly review held every step for a systemic signal (a fatigue report with nothing left to reduce, recorded as
//     SYSTEMIC_SIGNAL; or converging adverse responses in the week's own reports), then a change on Sunday 22:00 that re-plans next week from
//     the week's evidence: an equipment change (evidenceStart via composeWeeks), a schedule change or a goal change (rebuild). Oracle: next
//     week's doses stay at the held doses (same exercise: no more sets; same run role: no longer run, no later quality step).
// (a) For the SSCTR (dose reading, not ruled here): the same systemic fatigue report on Thursday evening (it reduces the remaining quality)
//     against Sunday morning (nothing left to reduce): next week's doses.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,obs,print} from './qe-a2-lib.mjs';
const out={probe:'R7A1-QE-P04',cases:{}};
const doses=(P,w)=>{const d={};for(const s of P.weeks[w].sessions)if(s.prescription&&s.status!=='SKIPPED'){if(s.sport==='STRENGTH')for(const e of s.prescription.exercises)d[e.id]=Math.max(d[e.id]??0,e.sets);else d['RUN:'+s.role]=Math.max(d['RUN:'+s.role]??0,s.prescription.durationMinutes);}return d;};
const above=(held,after)=>Object.entries(after).filter(([k,v])=>Number.isFinite(held[k])&&v>held[k]).map(([k,v])=>`${k} ${held[k]} -> ${v}`);
const ADVERSE={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'NORMAL'};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),w=3,{R,opts}=RT;
 const base=H.start({id:'qa1-p04',schedule:{runDays:[1,4,6],strengthDays:[0,2],longRunDay:6}},3);
 const sys={kind:'SYSTEMIC_FATIGUE'},C={};
 // Hold 1: Sunday 07:00 fatigue (nothing left to reduce: only the Sunday long run remains), then the weekly review.
 const signal=H.copy(base),l1=[H.ev(signal,at(signal.p,w,6,'07:00',sys)),H.weekly(signal,w)];
 // Hold 2: converging adverse responses: three of the week's reports adverse (both sports), then the weekly review.
 const conv=H.copy(base),reps=conv.p.weeks[w].sessions.filter(s=>s.prescription).map((s,i)=>({...obs(conv.p,s),response:i<3?{...ADVERSE}:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
 const l2=[(()=>{const r=R.evaluateProgram(conv.p,{...at(conv.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:reps}),actualLedger:conv.ledger},opts);conv.ledger=r.actualLedger;if(r.proposal)conv.p=r.proposal;conv.last=r;return r.status+'/'+r.action+' convergence='+r.weekEvidence?.systemicConvergence;})()];
 const later={EQUIPMENT_SWAP:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},EQUIPMENT_WINDOW_NEXT_WEEK:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:base.p.weeks[w+1].startDate,to:base.p.weeks[w+1].startDate}},SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[1,3,6],longRunDay:6}},GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}};
 for(const [hname,held,hlog] of [['SYSTEMIC_SIGNAL',signal,l1],['CONVERGENCE',conv,l2]]){
  const h={log:hlog,heldGates:held.last.gates?Object.values(held.last.gates).every(g=>g==='HOLD'||g==='REGRESS'):null,heldNextWeek:line(held.p,w+1)};
  for(const [k,x] of Object.entries(later)){const T=H.copy(held),l=H.ev(T,at(T.p,w,6,'22:00',x));const up=above(doses(held.p,w+1),doses(T.p,w+1));h[k]={log:l,decisionGates:T.p.decisions.at(-1).gates?Object.entries(T.p.decisions.at(-1).gates).filter(([,g])=>g==='ADVANCE').map(([k])=>k):null,dosesAboveHeld:up,nextWeek:up.length?line(T.p,w+1):undefined};}
  C[hname]=h;
 }
 // (a) dose reading for the SSCTR.
 const thu=H.copy(base),la=[H.ev(thu,at(thu.p,w,3,'21:00',sys)),H.weekly(thu,w)];
 C.forSSCTR_thursdayVsSunday={thursday:{log:la,adaptations:(thu.p.weeks[w].adaptations??[]).map(a=>a.kind),nextWeekAboveSunday:above(doses(signal.p,w+1),doses(thu.p,w+1))},sunday:{log:l1,adaptations:(signal.p.weeks[w].adaptations??[]).map(a=>a.kind)}};
 out.cases[tag]=C;
}
print(out);
