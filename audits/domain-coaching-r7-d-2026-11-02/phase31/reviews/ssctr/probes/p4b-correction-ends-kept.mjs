// Point 4, variant: a correction of an earlier, already applied break (episodeId) is also a newer stated break: it ends the retention of a
// different break kept since. Weeks 0-1 executed; break A (weeks 2-3) applied by a return report on week 4 day 0; weeks 4-5 executed and
// reviewed; break C (week 6, 7 days) declared with a fatigue report on week 7 day 0 (asked, kept); on week 7 day 1 a return report corrects
// A's dates (episodeId); then a plain review on week 7 day 2. Run on both roots. Synthetic fixtures; engineering evidence only.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,trained,weekFacts,addDays,live}=L;
const t=trained([0,1]),s2=t.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const r0=step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A,event:{id:'p4b-A',kind:'RETURN_AFTER_PAUSE'}});
for(const w of [4,5])step(t,w,{observations:weekFacts(t.p,w).filter(o=>true)});
const s6=t.p.weeks[6].startDate,C={startDate:s6,endDate:addDays(s6,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const r1=step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:C});
const r2=step(t,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,endDate:addDays(s2,12),days:13,episodeId:'p4b-A'}});
const r3=step(t,7,{day:2,hour:'07:00:00'});
const runs=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=addDays(p.weeks[w].startDate,2)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ');
console.log(JSON.stringify({root,A:r0.action,C:`${r1.status} ${r1.missingInputs.join('+')}`,correction:`${r2.action} ${r2.reason.slice(0,120)}`,plainAfter:`${r3.status} ${r3.action} ${r3.planValidity.status}`,returns:t.p.decisions.filter(d=>d.action==='REESTABLISH').map(d=>`${d.interruption.episode} ${d.interruption.startDate}..${d.interruption.endDate}`),runsWeek7:runs(t.p,7)},null,1));
