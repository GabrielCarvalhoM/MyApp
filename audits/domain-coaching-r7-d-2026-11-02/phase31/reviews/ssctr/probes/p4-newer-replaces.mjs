// Point 4: a newer declaration replaces an older one not applied yet. Weeks 0-1 executed. Break A covers weeks 2-3 (14 days); break B covers
// week 4 (7 days). Cases: (i) A declared with a fatigue report on week 4 day 0 (asked), B declared with a local fatigue report on week 5 day 0
// (asked), then a plain weekly review on week 5 day 1; (ii) the same with B declared directly by a weekly review on week 5 day 1; (iii) the
// comparator where A was applied by a return report before B arrives by a return report (episode rules); (iv) the whole 21-day stop declared
// once. Also (v) a correction: A then a shorter A' (week 3 only). Run on both roots. Synthetic fixtures; engineering evidence only.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,live}=L;
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const B={startDate:addDays(s2,14),endDate:addDays(s2,20),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const AB={startDate:s2,endDate:addDays(s2,20),days:21,reasonCategory:'VACATION',reason:'Holiday then work trip',nonclinical:true};
const A2={startDate:addDays(s2,7),endDate:addDays(s2,13),days:7,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const doses=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ');
const f=(r,t,w,day)=>({status:r.status,action:r.action,validity:r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':'RECON',question:r.question?.kind??null,missing:r.missingInputs,reason:r.reason.slice(0,170),ret:r.action==='REESTABLISH'?(({class:c,days,startDate,endDate})=>`${c} ${days}d ${startDate}..${endDate}`)(t.p.decisions.at(-1).interruption):null,runs:doses(t.p,w,addDays(t.p.weeks[w].startDate,day))});
const out={root,cases:{}};
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A});step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B});const r=step(t,5,{day:1,hour:'07:00:00'});out.cases.i=f(r,t,5,1);}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A});const r=step(t,5,{day:1,hour:'07:00:00',interruption:B});out.cases.ii=f(r,t,5,1);}
{const t=copy(base);const r0=step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A});const r=step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:B});out.cases.iii={first:r0.action,...f(r,t,5,1)};}
{const t=copy(base);const r=step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:AB});out.cases.iv=f(r,t,5,1);}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A});step(t,4,{day:0,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:A2});const r=step(t,4,{day:1,hour:'07:00:00'});out.cases.v=f(r,t,4,1);}
console.log(JSON.stringify(out,null,1));
