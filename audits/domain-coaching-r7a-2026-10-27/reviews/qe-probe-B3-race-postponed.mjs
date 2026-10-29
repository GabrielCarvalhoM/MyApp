// QE probe B3 (stale state across a skeleton change): the race is postponed by one week during race week (EVENT_DATE_CHANGE on day 0).
// The re-plan starts next week, so the current week keeps its race-week sessions and a RACE session on the old date, while next week
// carries the new race.
import {cur,opts,intake,review,obs,addDays,out,SQUAT,BENCH} from './qe-lib.mjs';
const R=cur,START='2026-11-02';
const ia={id:'qe-B3',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
let p=R.generateProgram(intake(ia),opts).program,ledger=[];
const W=p.phases.raceWeek;
for(let w=0;w<W;w++){const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
const newDate=addDays(p.goal.run.event.date,7);
const r=R.evaluateProgram(p,review(p,W,{day:0,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newDate},actualLedger:ledger}),opts),P=r.proposal;
const races=P?P.weeks.flatMap(w=>w.sessions.filter(s=>s.role==='RACE').map(s=>`w${w.index} ${s.date} ${s.id}`)):null;
out('B3',{status:r.status,action:r.action,reason:r.reason,oldRace:p.goal.run.event.date,newRace:newDate,raceSessionsInProposal:races,currentWeekSessions:P?P.weeks[W].sessions.map(s=>`${s.date} ${s.sport} ${s.role}${s.prescription?' '+(s.prescription.family??'')+' '+(s.prescription.durationMinutes??''):''}`):null,phases:P?P.phases.phases.slice(W-1,W+3):null});
