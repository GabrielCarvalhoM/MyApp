// QE re-check probe P1 (R7A-QE-r2, FREEZE-2): composition of same-week reviews through the branches the second cycle touched.
// S1 (QE-R7A-01 class): a return that starts next week (rebasedNext) followed by an EQUIPMENT_CHANGE of the same week, which re-projects
//    from stateTrace[w] (r6-adaptation.mjs equipmentChange), versus the opposite arrival order.
// S2 (QE-R7A-03 x QE-R7A-01): a return in race week that leaves only the race ahead (re-entry next week), then the race is postponed:
//    goalChange skips "reaches this week" when rebasedNext holds. Count RACE sessions; opposite order as control.
// S3 (QE-R7A-03 new interplay): an adaptation made earlier in the week (systemic fatigue, unavailable day) followed by an event change that
//    reaches this week (rebuild from week w re-projects the remaining days from stateTrace[w]); opposite order as control.
// Synthetic data, DEV_TEST_ONLY authority, read-only use of the frozen runtime. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out,SQUAT,BENCH} from './qe-lib.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const steps=st=>Object.fromEntries(Object.entries(st?.strength?.exercises??{}).map(([id,e])=>[id,e.returnStep??null]));
const kinds=(P,w)=>rows(P,w).map(({s,e})=>`${s.id} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''} kind=${e.exposure?.kind??'-'}`);
const at=(p,w,day,hour,x)=>({...review(p,w,{day,...x}),asOf:`${addDays(p.weeks[w].startDate,day)}T${hour}Z`});
const ev=(P,r,label)=>{if(!r.proposal&&!['KEEP','ASK'].includes(r.status))console.error(label,r.status,r.action,r.reason,r.errors);return r.proposal??P;};
const weekLine=(P,w,fromDay=0)=>P.weeks[w].sessions.filter(s=>s.day>=fromDay).map(s=>`d${s.day} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''}${s.prescription?' '+(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x@${e.rir}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):''}`);
const result={runtime:tag};

// ---------- S1: return (next-week re-entry) then EQUIPMENT_CHANGE ----------
{
 let p=R.generateProgram(intake({id:'qe-rc-P1a',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];
 for(let w=0;w<4;w++){const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 {const r=R.evaluateProgram(p,review(p,4,{observations:[],actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const W=5,d6=addDays(p.weeks[W].startDate,6),wk6=p.weeks[W+1].startDate;
 const ret=(P,hour)=>at(P,W,6,hour,{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d6,-16),endDate:addDays(d6,-1),reasonCategory:'TRAVEL',reason:'Work travel'},observations:[],actualLedger:ledger});
 const eq=(P,hour,changes)=>at(P,W,6,hour,{kind:'EQUIPMENT_CHANGE',changes,observations:[],actualLedger:ledger});
 const S1={};
 for(const [name,changes] of [['temporaryWindowNextWeek',{equipment:['DUMBBELLS','BENCH'],from:wk6,to:addDays(wk6,6)}],['permanent',{equipment:['DUMBBELLS','BENCH']}]]){
  const r1=R.evaluateProgram(p,ret(p,'20:00:00'),opts),P1=ev(p,r1,'ret');
  const r2=R.evaluateProgram(P1,eq(P1,'20:30:00',changes),opts),P2=ev(P1,r2,'eq-after-ret');
  const q1=R.evaluateProgram(p,eq(p,'20:00:00',changes),opts),Q1=ev(p,q1,'eq');
  const q2=R.evaluateProgram(Q1,ret(Q1,'20:30:00'),opts),Q2=ev(Q1,q2,'ret-after-eq');
  S1[name]={
   returnAlone:{decision:`${r1.status}/${r1.action}`,fromWeek:P1.decisions.at(-1)?.fromWeek,stepsW6:steps(P1.stateTrace[W+1]),runModeW6:P1.stateTrace[W+1].run.mode,rowsW6:kinds(P1,W+1)},
   returnThenEquipment:{decision:`${r2.status}/${r2.action}`,stepsW6:steps(P2.stateTrace[W+1]),runModeW6:P2.stateTrace[W+1].run.mode,rowsW6:kinds(P2,W+1),rowsW7:kinds(P2,W+2).slice(0,3)},
   equipmentThenReturn:{decision:`${q1.status}/${q1.action} then ${q2.status}/${q2.action}`,stepsW6:steps(Q2.stateTrace[W+1]),runModeW6:Q2.stateTrace[W+1].run.mode,rowsW6:kinds(Q2,W+1)},
   returnStrengthErasedByEquipmentChange:Object.values(steps(P2.stateTrace[W+1])).every(v=>v===null)&&Object.values(steps(P1.stateTrace[W+1])).some(v=>v===0),
   sameEitherOrder:JSON.stringify(steps(P2.stateTrace[W+1]))===JSON.stringify(steps(Q2.stateTrace[W+1]))&&JSON.stringify(kinds(P2,W+1).map(x=>x.split(' kind=')[1]))===JSON.stringify(kinds(Q2,W+1).map(x=>x.split(' kind=')[1]))
  };
 }
 result.S1_returnThenEquipmentChange=S1;
}

// ---------- S2: return in race week (only the race ahead), then the race is postponed ----------
{
 const START='2026-11-02',ia={id:'qe-rc-P1b',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
 let p=R.generateProgram(intake(ia),opts).program,ledger=[];const RW=p.phases.raceWeek;
 for(let w=0;w<RW;w++){const list=w<RW-2?p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)):[];const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const d5=addDays(p.weeks[RW].startDate,5),oldRace=p.goal.run.event.date,newRace=addDays(oldRace,7);
 const ret=(P,hour)=>at(P,RW,5,hour,{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d5,-16),endDate:addDays(d5,-1),reasonCategory:'TRAVEL',reason:'Work travel'},observations:[],actualLedger:ledger});
 const mv=(P,hour)=>at(P,RW,5,hour,{kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},observations:[],actualLedger:ledger});
 const races=P=>P.weeks.flatMap(w=>w.sessions.filter(s=>s.role==='RACE'&&s.prescription).map(s=>`w${w.index} ${s.date} ${s.id}`));
 const r1=R.evaluateProgram(p,ret(p,'07:00:00'),opts),P1=ev(p,r1,'ret');
 const r2=R.evaluateProgram(P1,mv(P1,'08:00:00'),opts),P2=ev(P1,r2,'mv-after-ret');
 const q1=R.evaluateProgram(p,mv(p,'07:00:00'),opts),Q1=ev(p,q1,'mv');
 const q2=R.evaluateProgram(Q1,ret(Q1,'08:00:00'),opts),Q2=ev(Q1,q2,'ret-after-mv');
 result.S2_returnInRaceWeekThenPostponed={oldRace,newRace,raceWeek:RW,
  returnAlone:{decision:`${r1.status}/${r1.action}`,fromWeek:P1.decisions.at(-1)?.fromWeek,raceWeekFromDay5:weekLine(P1,RW,5),races:races(P1)},
  returnThenPostpone:{decision:`${r2.status}/${r2.action}`,fromWeek:P2.decisions.at(-1)?.fromWeek,reason:r2.reason,goalEventDate:P2.goal.run.event?.date,raceWeekNow:P2.phases.raceWeek,races:races(P2),oldRaceWeekFromDay5:weekLine(P2,RW,5)},
  postponeThenReturn:{decision:`${q1.status}/${q1.action} then ${q2.status}/${q2.action}`,goalEventDate:Q2.goal.run.event?.date,races:races(Q2),oldRaceWeekFromDay5:weekLine(Q2,RW,5)},
  twoRacesAfterReturnThenPostpone:races(P2).length>1};
}

// ---------- S3: an earlier same-week adaptation, then an event change that reaches this week ----------
{
 const START='2026-11-02',ia={id:'qe-rc-P1c',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
 let p=R.generateProgram(intake(ia),opts).program,ledger=[];
 for(let w=0;w<6;w++){const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const W=6,newRace=addDays(p.weeks[W].startDate,7),thu=p.weeks[W].sessions.find(s=>s.day===3&&s.sport==='RUN'&&s.prescription);
 const change=(P,hour)=>at(P,W,0,hour,{kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},observations:[],actualLedger:ledger});
 const S3={};
 for(const [name,x] of [['systemicFatigue',{kind:'SYSTEMIC_FATIGUE'}],['unavailableThursday',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[thu.date]}}]]){
  const adapt=(P,hour)=>at(P,W,0,hour,{...x,observations:[],actualLedger:ledger});
  const a1=R.evaluateProgram(p,adapt(p,'05:00:00'),opts),A1=ev(p,a1,name);
  const a2=R.evaluateProgram(A1,change(A1,'06:00:00'),opts),A2=ev(A1,a2,name+'-then-change');
  const b1=R.evaluateProgram(p,change(p,'05:00:00'),opts),B1=ev(p,b1,'change');
  const b2=R.evaluateProgram(B1,adapt(B1,'06:00:00'),opts),B2=ev(B1,b2,'change-then-'+name);
  S3[name]={
   adaptationAlone:{decision:`${a1.status}/${a1.action}`,week:weekLine(A1,W,1)},
   adaptationThenEventChange:{decision:`${a2.status}/${a2.action}`,fromWeek:A2.decisions.at(-1)?.fromWeek,week:weekLine(A2,W,1)},
   eventChangeThenAdaptation:{decision:`${b1.status}/${b1.action} then ${b2.status}/${b2.action}`,week:weekLine(B2,W,1)},
   eventChangeAlone:{week:weekLine(B1,W,1)},
   sameEitherOrder:hash(weekLine(A2,W,1))===hash(weekLine(B2,W,1)),
   adaptationErasedByLaterEventChange:hash(weekLine(A2,W,1))===hash(weekLine(B1,W,1))&&hash(weekLine(B1,W,1))!==hash(weekLine(B2,W,1))
  };
 }
 result.S3_adaptationThenEventChange=S3;
}
out('P1',result);
