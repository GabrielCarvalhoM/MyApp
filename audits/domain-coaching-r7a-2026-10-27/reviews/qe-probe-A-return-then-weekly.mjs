// QE probe A (state reconstruction / order dependence): a RETURN_AFTER_PAUSE review that starts the return next week (fewer than two
// sessions left this week) stores the return state at stateTrace[w+1]; a weekly review of the same week w then re-derives week w+1
// from stateTrace[w] (the pre-break state). Does the return survive? Compared with the opposite arrival order and with a mid-week return.
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const R=process.env.QE_RUNTIME==='pre'?await pre():cur;console.error('runtime',process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT');
const ia={id:'qe-A',athlete:{exerciseRotationPreference:'FIXED'}};
const g=R.generateProgram(intake({weeks:12,...ia}),opts);let p0=g.program,ledger0=[];
// Weeks 0-3 executed and reviewed as prescribed.
for(let w=0;w<4;w++){const r=R.evaluateProgram(p0,review(p0,w,{observations:p0.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p0,s)),actualLedger:ledger0}),opts);ledger0=r.actualLedger;if(r.proposal)p0=r.proposal;}
// Week 4: nothing performed (the break starts); weekly review records it.
{const r=R.evaluateProgram(p0,review(p0,4,{observations:[],actualLedger:ledger0}),opts);ledger0=r.actualLedger;if(r.proposal)p0=r.proposal;}
const W=5;
const ret=(p,day)=>review(p,W,{day,kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[W].startDate,day-16),endDate:addDays(p.weeks[W].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'},observations:[],actualLedger:ledger0});
const weekly=(p,day)=>review(p,W,{day,observations:[],actualLedger:ledger0});
const steps=(st)=>Object.fromEntries(Object.entries(st?.strength?.exercises??{}).map(([id,e])=>[id,e.returnStep??null]));
const wk=(P,w)=>rows(P,w).map(({s,e})=>fmt(s,e));
const run=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
// Order 1: return review (day 6, 20:00), then the weekly review (day 6, 21:00).
const r1=R.evaluateProgram(p0,{...ret(p0,6),asOf:addDays(p0.weeks[W].startDate,6)+"T20:00:00Z"},opts),P1=r1.proposal;if(!P1){console.log(r1.status,r1.action,r1.reason,r1.errors);process.exit(1);}
const r1w=R.evaluateProgram(P1,weekly(P1,6),opts),P1w=r1w.proposal??P1;
// Order 2: weekly review first (20:00), then the return review (21:00).
const r2w=R.evaluateProgram(p0,{...weekly(p0,6),asOf:addDays(p0.weeks[W].startDate,6)+'T20:00:00Z'},opts),P2=r2w.proposal??p0;
const r2=R.evaluateProgram(P2,ret(P2,6),opts),P2r=r2.proposal??P2;
// Control: return reported mid-week (day 2) with two or more sessions left, then the weekly review on day 6.
const r3=R.evaluateProgram(p0,ret(p0,2),opts),P3=r3.proposal;if(!P3){console.log("r3",r3.status,r3.action,r3.reason,r3.missingInputs);process.exit(1);}
const r3w=R.evaluateProgram(P3,weekly(P3,6),opts),P3w=r3w.proposal??P3;
out('A',{
 returnReview:{status:r1.status,action:r1.action,fromWeek:P1.decisions.at(-1).fromWeek,runModeWeek6:P1.stateTrace[6].run.mode,returnStepsWeek6:steps(P1.stateTrace[6]),week6Strength:wk(P1,6),week6Run:run(P1,6)},
 order1_returnThenWeekly:{weekly:`${r1w.status}/${r1w.action}`,runModeWeek6:P1w.stateTrace[6].run.mode,returnStepsWeek6:steps(P1w.stateTrace[6]),week6Strength:wk(P1w,6),week6Run:run(P1w,6)},
 order2_weeklyThenReturn:{return:`${r2.status}/${r2.action}`,runModeWeek6:P2r.stateTrace[6].run.mode,returnStepsWeek6:steps(P2r.stateTrace[6]),week6Strength:wk(P2r,6),week6Run:run(P2r,6)},
 control_midWeekReturnThenWeekly:{fromWeek:P3.decisions.at(-1).fromWeek,weekly:`${r3w.status}/${r3w.action}`,runModeWeek6:P3w.stateTrace[6].run.mode,returnStepsWeek6:steps(P3w.stateTrace[6]),week6Strength:wk(P3w,6)},
 verdict:{returnErasedByWeeklyReview:JSON.stringify(steps(P1w.stateTrace[6]))!==JSON.stringify(steps(P2r.stateTrace[6]))||P1w.stateTrace[6].run.mode!==P2r.stateTrace[6].run.mode}
});
// Same defect through another same-week handler: a SCHEDULE_CHANGE (rebuild from next week) after the return review.
const r4=R.evaluateProgram(P1,review(P1,W,{day:6,kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:55},actualLedger:ledger0}),opts),P4=r4.proposal??P1;
out('A-scheduleChangeAfterReturn',{change:`${r4.status}/${r4.action}`,runModeWeek6:P4.stateTrace[6]?.run?.mode,returnStepsWeek6:steps(P4.stateTrace[6]),week6Strength:wk(P4,6).slice(0,3)});
