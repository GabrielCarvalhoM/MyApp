// QE probe G (branch asymmetry / stale row): MISSED_SESSION moves a key strength session to a later day of the same week. The moved
// rows keep the kind and dose computed for the original date, so an exercise that crosses return.moderateMaxDays (28 days without it)
// between the two dates is prescribed at its full known load instead of being re-established by effort (SSCTR D52,
// strength.resumeAfterDays). The planner, given the same exercise on that date, re-establishes it.
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const R=process.env.QE_RUNTIME==='pre'?await pre():cur;
const ia={id:'qe-G',athlete:{exerciseRotationPreference:'FIXED'},schedule:{runDays:[5,6],strengthDays:[0,2,4],longRunDay:6,runMinutes:50,strengthMinutes:60}};
let p=R.generateProgram(intake({weeks:12,...ia}),opts).program,ledger=[];
const W=5;
for(let w=0;w<W;w++){const list=p.weeks[w].sessions.filter(s=>s.prescription&&(s.sport==='RUN'||w<2)).map(s=>obs(p,s));const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
const wk=p.weeks[W],target=wk.sessions.find(s=>s.sport==='STRENGTH'&&s.day===0&&s.prescription);
const st=p.stateTrace[W].strength.exercises;
const r=R.evaluateProgram(p,review(p,W,{day:0,kind:'MISSED_SESSION',targetSessionId:target.id,observations:[],actualLedger:ledger}),opts);
const P=r.proposal??p,moved=P.weeks[W].sessions.find(s=>s.moved?.from===target.id);
const gap=(id,date)=>st[id]?.lastPerformed?Math.round((Date.parse(date)-Date.parse(st[id].lastPerformed))/864e5):null;
// The planner's own reading of the same exercise on the new date: regenerate week W from its start state with the target's template
// on the moved day (a program whose schedule puts that template there). Here: the same program built for a week where the day-2 session
// carries the exercise, i.e. the d4 session of the original plan if it shares an exercise.
out('G',{runtime:process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',review:{status:r.status,action:r.action,reason:r.reason,candidates:(r.counterfactuals??[]).map(c=>`${c.id}:${c.admissible}`)},
 target:{id:target.id,date:target.date,key:target.key,rows:target.prescription.exercises.map(e=>`${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''} kind=${e.exposure?.kind??'-'} daysSinceLast=${gap(e.id,target.date)}`)},
 moved:moved?{id:moved.id,date:moved.date,rows:moved.prescription.exercises.map(e=>`${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''} kind=${e.exposure?.kind??'-'} daysSinceLast=${gap(e.id,moved.date)} (> ${cur.skeletonOf(P,opts.authority).op.return.moderateMaxDays}?)`)}:null,
 plannerOnSameDates:rows(p,W).filter(x=>x.s.day>0).map(({s,e})=>`${fmt(s,e)} daysSinceLast=${gap(e.id,s.date)}`)});
// G2 (same root, no move): the athlete does the day-0 session two days late (observed on day 2, 30 days after the last back squat);
// the review reads the row's KNOWN kind, so no re-establishment follows and the known load stands.
{
 const late=obs(p,target,{observedAt:addDays(target.date,2)+'T19:00:00Z'});
 const list=[late,...wk.sessions.filter(s=>s.prescription&&s.id!==target.id&&s.sport==='RUN').map(s=>obs(p,s))];
 const rr=R.evaluateProgram(p,review(p,W,{day:6,observations:list,actualLedger:ledger}),opts),Q=rr.proposal??p,s6=Q.stateTrace[W+1].strength.exercises['back-squat'];
 out('G2',{performedOn:addDays(target.date,2),daysSinceLastBackSquat:gap('back-squat',addDays(target.date,2)),review:`${rr.status}/${rr.action}`,backSquatStateNextWeek:{mode:s6.mode,load:s6.load,source:s6.source,lastPerformed:s6.lastPerformed,regainCap:s6.regainCap??null},nextWeekBackSquat:rows(Q,W+1).filter(x=>x.e.id==='back-squat').map(({s,e})=>fmt(s,e))});
}
