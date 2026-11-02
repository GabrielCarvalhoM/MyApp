// QE probe E3 (R1 / SSCTR-SD5-01): after a known-stop answer on day 2 of the answer week, the day-1 run of that week elapsed before the answer with
// the stale stored prescription and no report. What does the stored week b+1 hold, is the plan VALID, how is week b+1 marked (start provenance,
// rows assumed executed), and what cures it (a mid-week plain review; the end-of-week review with the day-1 run unreported / reported not done)?
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e3-r1-next-week-projection.mjs
import {GEN,R10K,fork,step,copy,AT,weekRuns,brief,live,notDone,obs,addDays,stale} from './qe-lib.mjs';
const out={probe:'QE-E3 R1 next-week projection after a later-week answer',cases:[]};
for(const [name,o,b] of [['GEN',GEN,7],['R10K-taper-to-race',R10K,10]])for(const g of [0,2])for(const mode of ['RV','NR']){
 const {A,B,facts}=fork(o,{g,b,mode,V:'MISS'}),t=copy(B);
 const elapsed=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<addDays(t.p.weeks[b].startDate,2));
 const r=step(t,b,{...AT(2),observations:facts});
 const sa=t.p.weeks[b+1].startAuthority?.RUN??null,tr=t.p.stateTrace?.[b+1]?.run??null;
 const c={case:`${name} g=${g} ${mode} MISS answer day 2`,elapsedBeforeAnswer:elapsed.map(s=>`${s.role}:${s.prescription.durationMinutes}@${s.date}`),answer:brief(r),
  weekB:weekRuns(t.p,b),weekB1:weekRuns(t.p,b+1),weekB1Stale:stale(weekRuns(t.p,b+1)??[]),weekB1StartAuthorityRun:sa?{provenance:sa.provenance,assumed:sa.assumedExecuted??sa.assumed??sa.rows??null,keys:Object.keys(sa)}:null,
  A_weekB1:weekRuns(A.p,b+1)};
 // Cures.
 const mid=step(copy(t),b,{...AT(3)});c.midWeekPlainReviewDay3={...brief(mid),weekB1:weekRuns(mid.proposal??t.p,b+1)};
 const wk=t.p.weeks[b].sessions.filter(live),day2=addDays(t.p.weeks[b].startDate,2);
 const eowUnrep=step(copy(t),b,{observations:wk.filter(s=>s.date>=day2).map(s=>obs(t.p,s))});
 c.endOfWeekDay1Unreported={...brief(eowUnrep),weekB1:weekRuns(eowUnrep.proposal??t.p,b+1)};
 const eowND=step(copy(t),b,{observations:wk.map(s=>s.date<day2?notDone(t.p,s):obs(t.p,s))});
 c.endOfWeekDay1NotDone={...brief(eowND),weekB1:weekRuns(eowND.proposal??t.p,b+1)};
 const eowNone=step(copy(t),b,{observations:[]});
 c.endOfWeekNothingReported={...brief(eowNone),weekB1:weekRuns(eowNone.proposal??t.p,b+1)};
 out.cases.push(c);
}
console.log(JSON.stringify(out,null,1));
