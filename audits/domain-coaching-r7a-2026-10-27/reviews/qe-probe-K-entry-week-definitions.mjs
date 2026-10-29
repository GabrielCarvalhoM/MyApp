// QE probe K (duplicated semantic logic, claim 4): R7-A defines a return-entry week twice. buildWeek: an exercise of any template slot of
// the week's strength days is at the entry step (before fitting to the time budget). advanceStrength: an exercise among the week's
// prescribed rows (after fitting) is at the entry step. With a 30-minute budget (main lifts only) and new main lifts after a permanent
// equipment change, the planner doses the new mains as a return entry because of an accessory that is not prescribed, while the
// transition establishes them outside the return; they then skip return step 2.
import {cur,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const R=cur;
const run=strengthMinutes=>{
 const ia={id:'qe-K-'+strengthMinutes,athlete:{exerciseRotationPreference:'FIXED',goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},schedule:{strengthMinutes}};
 let p=R.generateProgram(intake({weeks:12,...ia}),opts).program,ledger=[];const log=[];
 const step=(w,extra={},list=null)=>{const r=R.evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
 for(let w=0;w<3;w++)step(w);step(3,{},[]);step(4,{},[]);
 const W=5;
 // Return reported on day 0 at 06:00 (sessions from day 0 PM on change), then the same morning a permanent move to a machines-only gym.
 step(W,{day:0,hour:'05',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[W].startDate,-16),endDate:addDays(p.weeks[W].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
 step(W,{day:0,hour:'06',kind:'EQUIPMENT_CHANGE',changes:{equipment:['MACHINES']}},[]);
 const entry=rows(p,W).map(({s,e})=>fmt(s,e)),inState=Object.entries(p.stateTrace[W].strength.exercises).filter(([,e])=>e.returnStep===0).map(([id])=>id);
 step(W);step(W+1);
 return {strengthMinutes,log:log.join(' '),atEntryStepInState:inState,weekW_rows:entry,
  stepsAfterEntryWeek:Object.fromEntries(Object.entries(p.stateTrace[W+1].strength.exercises).map(([id,e])=>[id,e.returnStep??null])),
  weekW1_rows:rows(p,W+1).map(({s,e})=>fmt(s,e)),weekW2_rows:rows(p,W+2).map(({s,e})=>fmt(s,e))};
};
out('K',{budget30_mainOnly:run(30),budget60_withAccessories:run(60)});
