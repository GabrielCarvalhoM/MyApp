// QE probe E3b (R1 / C9 claim): "the first decision of the next week" re-plans the stale week b+1. Known-stop answer on day 2 of week b (the day-1
// run elapsed unreported). Then week b's later runs are reported executed mid-week (day 4, day 6 morning decisions), and the answer week's own
// end-of-week review is skipped. Does the first decision of week b+1 (a plain review on day 0; a schedule change on day 0) re-plan week b+1, or keep
// and validate the stale projection? Control: the same with the end-of-week review of week b.
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e3b-r1-first-decision-next-week.mjs
import {GEN,fork,step,copy,AT,weekRuns,brief,live,obs,addDays,stale,ceilingAt,aboveCeiling} from './qe-lib.mjs';
const out={probe:'QE-E3b first decision of week b+1 after a day-2 answer',cases:[]};
for(const g of [0,2])for(const mode of ['RV','NR']){
 const b=7,{A,B,facts}=fork(GEN,{g,b,mode,V:'MISS'}),t=copy(B);
 const ans=step(t,b,{...AT(2),observations:facts});
 const day=d=>addDays(t.p.weeks[b].startDate,d),runOn=d=>t.p.weeks[b].sessions.filter(s=>live(s)&&s.date===day(d)&&s.sport==='RUN');
 const r4=step(t,b,{day:4,hour:'07:00:00',observations:runOn(3).map(s=>obs(t.p,s))});
 const stored=weekRuns(t.p,b+1);
 const c={case:`GEN g=${g} ${mode} MISS`,answer:brief(ans),day4:brief(r4),storedB1:stored,A_B1:weekRuns(A.p,b+1),next:[]};
 for(const [label,x] of [['week b+1 day 0 plain review',{}],['week b+1 day 0 plain review with the day-6 long run reported',{observations:runOn(6).map(s=>obs(t.p,s))}],['week b+1 day 0 schedule change (strength days)',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}]]){
  const u=copy(t),r=step(u,b+1,{...AT(0),...x});
  const runsIn=weekRuns(r.proposal??u.p,b+1),ceiling=ceilingAt(u,b+1);
  c.next.push({label,...brief(r),b1RunsInForce:runsIn,singleRunCeiling:ceiling,aboveCeilingValid:r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&aboveCeiling(runsIn,ceiling),qualityValid:r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&runsIn.some(x=>/^QUALITY/.test(x)),staleValid:r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&(aboveCeiling(runsIn,ceiling)||runsIn.some(x=>/^QUALITY/.test(x)))});
 }
 // Control: the answer week's own review (day-6 long run reported) cures it.
 const u=copy(t),eow=step(u,b,{observations:runOn(6).map(s=>obs(u.p,s))});
 c.controlEndOfWeekReview={...brief(eow),b1:weekRuns(eow.proposal??u.p,b+1)};
 out.cases.push(c);
}
out.summary=out.cases.flatMap(c=>c.next.filter(n=>n.staleValid).map(n=>`${c.case} :: ${n.label} :: ${JSON.stringify(n.b1RunsInForce)}`));
console.log(JSON.stringify(out,null,1));
