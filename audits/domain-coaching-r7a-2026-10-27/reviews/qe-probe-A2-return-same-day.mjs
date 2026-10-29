// QE probe A2 (event-day boundary): RETURN_AFTER_PAUSE re-plans only sessions dated after the review's local date (s.date > asOfLocal).
// A return reported in the morning keeps that day's evening strength session at its full pre-break dose, and the weekly review then
// counts that full-dose session as the return entry (returnStep 0 -> 1).
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const ia={id:'qe-A2',athlete:{exerciseRotationPreference:'FIXED'}};
let p=R.generateProgram(intake({weeks:12,...ia}),opts).program,ledger=[];
const step=(w,extra={},list=null)=>{const r=R.evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
for(let w=0;w<4;w++)step(w);step(4,{},[]);
const W=5,d0=p.weeks[W].startDate;
const r=step(W,{day:0,hour:'07',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-16),endDate:addDays(d0,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
const day0=p.weeks[W].sessions.filter(s=>s.day===0&&s.prescription);
const stateW=Object.fromEntries(Object.entries(p.stateTrace[W].strength.exercises).map(([id,e])=>[id,e.returnStep??null]));
const thisWeek=rows(p,W).map(({s,e})=>fmt(s,e));
const wr=step(W);
out('A2',{runtime:tag,returnReview:{asOf:`${d0}T07:00:00Z`,status:r.status,action:r.action,fromWeek:p.decisions.at(-2)?.fromWeek},
 day0Sessions:day0.map(s=>({id:s.id,turn:s.turn,sport:s.sport,role:s.role})),stateAtWeekStart_returnStep:stateW,weekRows:thisWeek,
 afterWeeklyReview:{decision:`${wr.status}/${wr.action}`,returnStepNextWeek:Object.fromEntries(Object.entries(p.stateTrace[W+1].strength.exercises).map(([id,e])=>[id,e.returnStep??null])),nextWeekRows:rows(p,W+1).map(({s,e})=>fmt(s,e)).slice(0,4)}});
