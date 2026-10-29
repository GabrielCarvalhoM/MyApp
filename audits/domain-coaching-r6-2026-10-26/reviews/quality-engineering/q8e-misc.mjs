// QRE probe Q8e: small code-read confirmations. (1) EVENT_WEEK_CONFLICT naming the race date as unavailable;
// (2) SCHEDULE_CHANGE duplicate days -> duplicate session ids and same-day double runs; days 7/8 overlapping next week.
// Real authority.
import {R6,baseIntake,review,sessionsOf,write,addDays} from './qlib.mjs';
const out={probe:'Q8e-misc',authorityUsed:'REAL r6Authority()'};
const HM=R6.generateProgram(baseIntake({id:'q-misc-ev',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-20'}},strength:'MAINTAIN'}}})).program;
const rw=HM.phases.raceWeek,race=sessionsOf(HM).find(s=>s.role==='RACE');
const r1=R6.evaluateProgram(HM,review(HM,rw,{kind:'EVENT_WEEK_CONFLICT',day:0,changes:{unavailableDates:[race.date]}}));
out.raceDateUnavailable={raceDate:race.date,status:r1.status,action:r1.action,reason:r1.reason,missing:r1.missingInputs};
const P=R6.generateProgram(baseIntake({id:'q-misc-sc',weeks:8})).program;
for(const [name,changes] of [['dupes',{runDays:[1,1,3]}],['days7_8',{runDays:[1,7,8]}]]){
 const r=R6.evaluateProgram(P,review(P,1,{kind:'SCHEDULE_CHANGE',day:2,changes}));const q=r.proposal;const ids=sessionsOf(q).map(s=>s.id);
 const dupIds=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];const byDate={};for(const s of sessionsOf(q).filter(s=>s.sport==='RUN'&&s.prescription))(byDate[s.date]??=[]).push(s.id+':'+s.role+':'+s.prescription.durationMinutes);
 out['schedule_'+name]={status:r.status,action:r.action,validProgramHash:R6.validProgram(q),duplicateIds:dupIds.slice(0,4),datesWithTwoRuns:Object.entries(byDate).filter(([,v])=>v.length>1).slice(0,4)};
}
write('q8e-misc.out.json',out);console.log(JSON.stringify(out,null,1));
