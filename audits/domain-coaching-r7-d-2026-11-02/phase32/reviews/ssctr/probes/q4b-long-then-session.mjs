// Q4 severity of the training-between reading: a 30-day break (LONG alone), one session between, then a 4-day break. Weeks 0-1 executed.
// A = Mon wk2 .. Tue wk6 (30 days), kept (declared Wed wk6 with a fatigue report). Gap: Wed wk6 (rest), Thu wk6 run, Fri wk6 strength.
// D = Sat wk6 .. Tue wk7 (4 days), declared Wed wk7 named on its own, with the gap reported; plain review Thu wk7. Variants: the Thu run done
// (Fri strength not done); every gap session not done. Comparator: the 37 days once. Run on both roots.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,view,live,obs,notDone}=L;
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,29),days:30,reasonCategory:'VACATION',reason:'Long holiday',nonclinical:true};
const D={startDate:addDays(s2,33),endDate:addDays(s2,36),days:4,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const out={root,cases:{}};
for(const [label,f] of [['oneRunBetween',(p,s)=>s.sport==='RUN'?obs(p,s):notDone(p,s)],['nothingBetween',notDone]]){
 const t=copy(base);step(t,6,{day:2,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'lb-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date>=addDays(s2,30)&&s.date<=addDays(s2,32));
 step(t,7,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'lb-D'},event:{id:'lb-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>f(t.p,s))});
 out.cases[label]={gap:gap.map(s=>`${s.date} ${s.sport} ${s.prescription.durationMinutes}`),result:view(step(t,7,{day:3,hour:'07:00:00'}),t,7,4)};
}
{const once=copy(base);out.cases.comparatorOnce37=view(step(once,7,{day:3,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,endDate:D.endDate,days:37}}),once,7,4);}
console.log(JSON.stringify(out,null,1));
