// Point 5: what is not kept. (a) A current demonstration stated with the declaring review (asked) is not kept: the entry at the applying review
// with and without it; (b) a break that begins after its review; (c) an ongoing break (end after the review) is kept and asked until it ends;
// (d) observations sent with a declaring review that a clinical flag routes before reading reports. Run on both roots.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,live,elig,obs}=L;
const base=trained([0,1]),W=4,d=n=>addDays(base.p.weeks[W].startDate,n),s2=base.p.weeks[2].startDate;
const runs=(p,from)=>p.weeks.slice(W,W+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ');
const out={root};
{const brk={startDate:s2,endDate:addDays(s2,11),days:12,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 const demo={sport:'RUN',family:'EASY',completed:true,minutes:35,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL',observedAt:`${d(-1)}T08:00:00Z`};
 const t=copy(base);step(t,W,{day:1,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk,currentDemonstration:demo});
 const a=copy(t),ra=step(a,W,{day:2,hour:'07:00:00'});
 const b=copy(t),rb=step(b,W,{day:2,hour:'07:00:00',currentDemonstration:demo});
 const c=copy(base),rc=step(c,W,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk,currentDemonstration:demo});
 out.demonstration={missing:[ra,rb,rc].map(r=>r.missingInputs.join('+')),keptWithout:`${ra.action} demoUsed=${a.p.decisions.at(-1).demonstrationUsed} ${runs(a.p,d(2))}`,keptWithDemoResent:`${rb.action} demoUsed=${b.p.decisions.at(-1).demonstrationUsed} ${runs(b.p,d(2))}`,timelyWithDemo:`${rc.action} demoUsed=${c.p.decisions.at(-1).demonstrationUsed} ${runs(c.p,d(2))}`};}
{const fut={startDate:d(3),endDate:d(9),reasonCategory:'TRAVEL',reason:'Trip next week',nonclinical:true};
 const t=copy(base),r1=step(t,W,{day:1,hour:'07:00:00',interruption:fut}),r2=step(t,W,{day:2,hour:'07:00:00'});
 out.futureBreak={declaring:`${r1.status} ${r1.missingInputs.join('+')}`,rows:t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length,next:`${r2.status} ${r2.action}`};}
{const ongoing={startDate:s2,endDate:d(3),reasonCategory:'TRAVEL',reason:'Trip',nonclinical:true};
 const t=copy(base),seq=[];for(const day of [1,2,4,5]){const r=step(t,W,{day,hour:'07:00:00',...(day===1?{kind:'SYSTEMIC_FATIGUE',interruption:ongoing}:{})});seq.push(`d${day} ${r.status} ${r.action} ${r.missingInputs.join('+')}`+(r.action==='REESTABLISH'?' '+t.p.decisions.at(-1).interruption.class+' '+t.p.decisions.at(-1).interruption.days+'d':''));}
 out.ongoingBreak=seq;}
{const brk={startDate:s2,endDate:d(-1),days:14,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 const s=base.p.weeks[W].sessions.filter(x=>live(x)&&x.date<=d(1)).at(-1)??base.p.weeks[1].sessions.filter(live).at(-1);
 const o=obs(base.p,s);const t=copy(base),r=step(t,W,{day:1,hour:'07:00:00',interruption:brk,observations:[o],eligibility:{...elig(d(1)),illness:true}});
 out.clinicalFlagWithReports={status:r.status,breakRecorded:t.ledger.some(x=>x.fact==='INTERRUPTION_DECLARED'),reportRecorded:t.ledger.some(x=>x.sessionId===o.sessionId&&x.observedAt===o.observedAt)};}
console.log(JSON.stringify(out,null,1));
