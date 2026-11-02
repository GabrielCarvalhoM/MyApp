// Recheck probe RC-P1: the week AFTER a return's re-entry week, the re-entry week unreported. The return's entry rests on a current
// demonstration the record does not keep; the trigger's scope excludes the re-entry week itself (RETURN_ENTRY) but not the week after it,
// whose stored doses were projected from the re-entry week assumed executed. Does the ceiling re-plan act there, and does it then plan what
// the same facts give on the on-time path (the re-entry week's own end-of-week review with nothing reported)?
// For each runtime in QE_ROOTS (F1 = R7C-FREEZE-1, F2 = R7C-FREEZE-2). Read-only; prints JSON.
import {RUNTIMES,timeline,runsOf,brief,live,addDays} from './rc-lib.mjs';
const CLASSES={
 EASY_CURRENT:{recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:40,strengthDaysPerWeek:2},schedule:{runMinutes:60,longRunMinutes:90}},
 EASY_LOW:{runExperience:'BEGINNER',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:20,strengthDaysPerWeek:2}},
 RACE_10K:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:50,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}}
};
const demoAt=(day,minutes)=>({observedAt:`${day}T06:00:00Z`,sport:'RUN',family:'EASY',minutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'});
const out={probe:'RC-P1 week after a return, re-entry week unreported',runtimes:Object.keys(RUNTIMES),cases:[]};
for(const [cls,o] of Object.entries(CLASSES))for(const days of [8,10,14,18,26])for(const demo of [20,30,45,60]){
 const row={case:`${cls} break=${days} demo=${demo}`,by:{}};
 for(const [name,R] of Object.entries(RUNTIMES)){
  const t=timeline(R,{id:`rc-p1-${cls}`,...o});
  // Weeks 0-1 executed and reviewed.
  for(let w=0;w<2;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>R.H.obs(t.p,s))});
  const W=2+Math.ceil(days/7);if(!t.p.weeks[W+1]){row.by[name]={skip:'horizon'};continue;}
  const ret=t.step(W,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true,endDate:t.p.weeks[W].startDate},currentDemonstration:demoAt(addDays(t.p.weeks[W].startDate,1),demo)});
  const r={ret:brief(ret),entryProvenance:t.p.weeks[W].startAuthority?.RUN?.provenance??null,entryMode:t.p.stateTrace[W]?.run?.mode,entryRuns:runsOf(t.p,W),storedNext:runsOf(t.p,W+1),nextProvenance:t.p.weeks[W+1].startAuthority?.RUN?.provenance??null};
  // Re-entry week unreported. The first decisions of week W+1.
  for(const [label,x] of [['W+1 day 0 plain review',{day:0,hour:'07:00:00'}],['W+1 day 2 plain review',{day:2,hour:'07:00:00'}]]){const u=t.copy(),d=u.step(W+1,x);r[label]={...brief(d),next:runsOf(d.proposal??u.p,W+1)};}
  // On time with the same facts: the re-entry week's own end-of-week review with nothing reported, then week W+1 day 0.
  {const u=t.copy(),e=u.step(W,{});const d=u.step(W+1,{day:0,hour:'07:00:00'});r.onTimeEOWNothingReported={eow:brief(e),nextAfterEOW:runsOf(u.p,W+1),thenDay0:{...brief(d),next:runsOf(d.proposal??u.p,W+1)}};}
  // Control: the re-entry week executed and reviewed.
  {const u=t.copy(),e=u.step(W,{observations:u.p.weeks[W].sessions.filter(s=>live(s)&&s.date>=addDays(u.p.weeks[W].startDate,2)).map(s=>R.H.obs(u.p,s))});r.controlExecuted={eow:brief(e),next:runsOf(u.p,W+1)};}
  row.by[name]=r;
 }
 const names=Object.keys(row.by),a=row.by[names[0]],b=row.by[names[1]];
 if(a&&b&&!a.skip&&!b.skip){row.differs=['W+1 day 0 plain review','W+1 day 2 plain review'].filter(k=>JSON.stringify(a[k].next)!==JSON.stringify(b[k].next)||a[k].status!==b[k].status);}
 out.cases.push(row);
}
out.summary={cases:out.cases.length,differing:out.cases.filter(c=>c.differs?.length).map(c=>c.case)};
console.log(JSON.stringify(out,null,1));
