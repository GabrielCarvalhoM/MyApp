// QE probe B (skipped phase modifier through another branch; false UNSUPPORTED): an EVENT_DATE_CHANGE that brings the race into
// next week re-plans only from next week, so this week's remaining sessions that now fall in the race window or taper days keep
// their earlier BUILD dose, and validation never sees them (proposal validated from week w+1). A later same-week proposal (validated
// from week w with the new skeleton) is then rejected for rows it did not write.
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const R=process.env.QE_RUNTIME==='pre'?await pre():cur;
const START='2026-11-02';
const ia={id:'qe-B',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[(await import('./qe-lib.mjs')).SQUAT,(await import('./qe-lib.mjs')).BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
let p=R.generateProgram(intake({weeks:16,...ia}),opts).program,ledger=[];
for(let w=0;w<6;w++){const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
const W=6,asOfDay=0,newRace=addDays(p.weeks[W].startDate,asOfDay+7);
const r=R.evaluateProgram(p,review(p,W,{day:asOfDay,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},actualLedger:ledger}),opts),P=r.proposal;
const sk=cur.skeletonOf(P,opts.authority),Q=P.weeks[W];
const remaining=Q.sessions.filter(s=>s.date>addDays(Q.startDate,asOfDay)).map(s=>({date:s.date,day:s.day,sport:s.sport,role:s.role,dayPhaseNow:cur.dayPhaseOf(sk,W,s.day),daysToRace:cur.eventDays(sk).before(W,s.day),dose:s.sport==='STRENGTH'?s.prescription?.exercises.map(e=>`${e.id} ${e.role} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''} rowPhase=${e.exposure?.phase??'-'}`):s.prescription?`${s.prescription.family} ${s.prescription.durationMinutes} min`:null}));
const errorsThisWeek=cur.validateWeeks(sk,[Q]).filter(x=>x.includes('phaseDose'));
// A twin program generated with the new race date from the start: the same days get the race-window dose.
const twin=R.generateProgram(intake({weeks:16,...ia,athlete:{...ia.athlete,goals:{...ia.athlete.goals,run:{kind:'RACE',event:{kind:'10K',date:newRace}}}}}),opts).program;
const twinWeek=twin?twin.weeks[W].sessions.filter(s=>s.day>asOfDay).map(s=>({day:s.day,sport:s.sport,role:s.role,dose:s.sport==='STRENGTH'?s.prescription?.exercises.map(e=>`${e.id} ${e.sets}x@${e.rir}`)??s.explanation:s.prescription?`${s.prescription.family} ${s.prescription.durationMinutes} min`:s.explanation})):null;
// A later ordinary same-week proposal: the athlete cannot make the Tuesday run (UNAVAILABLE_DAY), reviewed on day 0 at 22:00.
const tue=Q.sessions.find(s=>s.sport==='RUN'&&s.day===1&&s.prescription);
const u=R.evaluateProgram(P,{...review(P,W,{day:asOfDay,kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[tue.date]},actualLedger:r.actualLedger}),asOf:addDays(Q.startDate,asOfDay)+'T22:00:00Z'},opts);
const lf=R.evaluateProgram(P,{...review(P,W,{day:asOfDay,kind:'SYSTEMIC_FATIGUE',actualLedger:r.actualLedger}),asOf:addDays(Q.startDate,asOfDay)+'T22:00:00Z'},opts);
out('B',{runtime:process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',eventDateChange:{status:r.status,action:r.action,newRace,fromWeek:P.decisions.at(-1).fromWeek,newRaceWeek:P.phases.raceWeek,weekPhaseKept:Q.phase},
 currentWeekRemainingSessions:remaining,phaseDoseErrorsInCurrentWeekUnderNewSkeleton:errorsThisWeek,
 twinGeneratedWithNewDate_week6AfterDay0:twinWeek,
 laterSameWeekProposal_unavailableTuesdayRun:{status:u.status,action:u.action,reason:u.reason,errors:(u.errors??[]).slice(0,6)},
 laterSameWeekProposal_systemicFatigue:{status:lf.status,action:lf.action,errors:(lf.errors??[]).slice(0,6)}});
