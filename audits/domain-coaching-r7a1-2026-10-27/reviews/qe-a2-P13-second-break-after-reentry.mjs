// R7A1-QE-r2 P13: the A2 change to the return's starting point (QE-R7A1-03: `startBeforeReturn` of the break's own week, whichever week
// the report comes in) applied to a *different, later* break. A first return re-plans its own week (it stores startBeforeReturn there);
// the athlete then trains re-entry sessions and has a second, separate short break that begins in that same week. Is the second return's
// start the re-entry the athlete was doing (C5 "a newer report *of a break*" is about the same break), or the start from before the first
// break? Oracle: after a SHORT second break ("resume last completed doses"), no strength row is above the largest count, load or below the
// smallest reserve executed since the first return, and run durations do not exceed what was run since then by more than the re-entry rule.
// Run on FREEZE-A2 (live) and, with QE_LIVE_ROOT, on the byte-exact FREEZE-A1 copy. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,line,addDays,print} from './qe-a2-lib.mjs';
const out={probe:'R7A1-QE-P13',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const RT=await runtime('A1'),H=make(RT),{R,opts}=RT;
const travel=(p,w,day,start,end)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const doses=(P,w)=>Object.fromEntries(P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>[`${s.id}:${e.id}`,`${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`])));
const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`d${s.day} ${s.role} ${s.prescription.durationMinutes}`);
const strengthOf=(P,w)=>Object.fromEntries(Object.entries(P.stateTrace[w]?.strength?.exercises??{}).map(([id,e])=>[id,{mode:e.mode,load:e.load??null,sets:e.sets??null,returnStep:e.returnStep??null,setCap:e.setCap??null}]));
const runOf=(P,w)=>{const r=P.stateTrace[w]?.run??{};return {mode:r.mode,easy:r.easy,long:r.long,returnStep:r.returnStep??null};};
function scenario(name,{secondStartDay,secondEndWeekOffset,secondEndDay,reportWeekOffset,reportDay,reportHm,reviewFirstWeek}){
 const t=H.start({id:'qa2-p13',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);
 // Weeks 3-4 not trained (the first break), reviewed with nothing reported.
 H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);
 const w=5,d0=t.p.weeks[w].startDate,log=[];
 log.push('first return '+H.ev(t,at(t.p,w,0,'06:00',travel(t.p,w,0,addDays(d0,-16),addDays(d0,-1)))));
 const reentry={doses:doses(t.p,w),runs:runs(t.p,w),start:strengthOf(t.p,w),startBeforeReturn:!!t.p.weeks[w].startBeforeReturn};
 // Re-entry sessions executed as prescribed up to the day before the second break.
 const done=s=>s.day<secondStartDay;
 const s2=addDays(d0,secondStartDay),e2=addDays(t.p.weeks[w+secondEndWeekOffset].startDate,secondEndDay);
 if(reviewFirstWeek){H.weekly(t,w,done);log.push('weekly w5 '+t.last.status+'/'+t.last.action);}
 else{const o=t.p.weeks[w].sessions.filter(s=>live(s)&&done(s)).map(s=>obs(t.p,s));if(o.length)log.push('reports '+H.ev(t,at(t.p,w,secondStartDay,'05:00',{kind:'WEEKLY_REVIEW',observations:o})));}
 const rw=w+reportWeekOffset,beforeSecond={rows:line(t.p,rw),start:strengthOf(t.p,rw),runStart:runOf(t.p,rw)};
 log.push('second return '+H.ev(t,at(t.p,rw,reportDay,reportHm,travel(t.p,rw,reportDay,s2,e2))));
 const decision=t.p.decisions.at(-1);
 // What the re-entry executed: the largest count and load, the smallest reserve, per exercise, from the first return to the second break.
 const executed={};for(const s of t.p.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&live(x)&&done(x)))for(const e of s.prescription.exercises){const x=executed[e.id]??={sets:0,load:0,rir:9};x.sets=Math.max(x.sets,e.sets);x.load=Math.max(x.load,e.load.value??0);x.rir=Math.min(x.rir,e.rir);}
 const after=[];for(const k of [rw,rw+1])for(const s of (t.p.weeks[k]?.sessions??[]).filter(x=>x.sport==='STRENGTH'&&live(x)&&x.date>=addDays(e2,1)))for(const e of s.prescription.exercises){const x=executed[e.id];if(!x)continue;if(e.sets>x.sets+1||(e.load.value??0)>x.load||e.rir<x.rir-1)after.push(`${s.id}:${e.id} ${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''} vs executed max ${x.sets} sets, ${x.load} kg, min RIR ${x.rir}`);}
 // Also against the re-entry week as the first return prescribed it (the oracle when no strength session was executed before the second break).
 const plannedReentry={};for(const [k,v] of Object.entries(reentry.doses)){const id=k.split(':')[1],n=Number(v.split('x')[0]);plannedReentry[id]=Math.max(plannedReentry[id]??0,n);}
 const aboveReentryPlan=[];for(const k of [rw,rw+1])for(const s of (t.p.weeks[k]?.sessions??[]).filter(x=>x.sport==='STRENGTH'&&live(x)&&x.date>=addDays(e2,1)))for(const e of s.prescription.exercises)if(Number.isInteger(plannedReentry[e.id])&&e.sets>plannedReentry[e.id]+1)aboveReentryPlan.push(`${s.id}:${e.id} ${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''} vs re-entry ${plannedReentry[e.id]} set(s)`);
 out.cases[name]={aboveReentryPlan,log,secondBreak:{start:s2,end:e2},classOfSecond:decision?.action,reentry,executedSinceFirstReturn:executed,beforeSecond,
  startUsedBySecond:{rw,startOfReportWeek:strengthOf(t.p,rw),runStartOfReportWeek:runOf(t.p,rw)},
  afterSecond:{week:rw,rows:line(t.p,rw),next:line(t.p,rw+1),startOfNext:strengthOf(t.p,rw+1),runStartOfNext:runOf(t.p,rw+1)},
  aboveExecutedReentry:after};
}
// X: the second break starts in the first return's week (Friday) and is reported in the next week (Wednesday): A2's cross-week reading.
scenario('X_crossWeek',{secondStartDay:4,secondEndWeekOffset:1,secondEndDay:1,reportWeekOffset:1,reportDay:2,reportHm:'06:00',reviewFirstWeek:true});
// X2: the second break is Friday-Sunday of the first return's week, reported on Monday morning of the next week.
scenario('X2_crossWeekMonday',{secondStartDay:4,secondEndWeekOffset:0,secondEndDay:6,reportWeekOffset:1,reportDay:0,reportHm:'06:00',reviewFirstWeek:true});
// S: the second break is inside the first return's week (Wednesday-Thursday), reported on Friday of that week (A1 and A2 alike).
scenario('S_sameWeek',{secondStartDay:2,secondEndWeekOffset:0,secondEndDay:3,reportWeekOffset:0,reportDay:4,reportHm:'06:00',reviewFirstWeek:false});
print(out);
