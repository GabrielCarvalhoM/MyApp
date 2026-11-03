// Point 2: a break whose own reason is clinical. Declared (injury, 14 days, weeks 2-3) on week 4 day 0 by a return report and by a weekly review;
// cleared; then (a) four weeks of plain weekly reviews with the athlete's own training reported, (b) the exits: a newer nonclinical declaration
// of different later dates, and the same dates relabelled nonclinical; (c) a past injury break followed by two weeks of reported training.
// Run on both roots. Synthetic fixtures; engineering evidence only.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,clear,trained,weekFacts,addDays,live}=L;
const base=trained([0,1]),start=base.p.weeks[2].startDate;
const injury={startDate:start,endDate:addDays(start,13),days:14,reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false};
const runs=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(',');
const out={root,a:[],b:[],c:[]};
for(const kind of ['RETURN_AFTER_PAUSE','WEEKLY_REVIEW']){
 const t=copy(base),r1=step(t,4,{day:0,hour:'07:00:00',kind,interruption:injury});clear(t);
 const seq=[r1.status];
 for(const w of [4,5,6,7]){const r=step(t,w,{observations:weekFacts(t.p,w).filter(o=>true)});seq.push(`${r.status}/${r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':'RECON'}`);clear(t);}
 out.a.push({carrier:kind,sequence:seq,ledgerDeclarations:t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length,ledgerReports:t.ledger.filter(o=>!o.fact).length});
}
{
 const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:injury});clear(t);
 const later={startDate:addDays(start,14),endDate:addDays(start,20),days:7,reasonCategory:'TRAVEL',reason:'Trip',nonclinical:true};
 const x=copy(t),rx=step(x,5,{day:0,hour:'07:00:00',interruption:later});
 const relabel={...injury,reasonCategory:'OTHER_NONCLINICAL',reason:'cleared',nonclinical:true};
 const y=copy(t),ry=step(y,4,{day:1,hour:'07:00:00',interruption:relabel});
 const f=(r,t,w)=>({status:r.status,action:r.action,cls:r.action==='REESTABLISH'?t.p.decisions.at(-1).interruption.class:null,days:r.action==='REESTABLISH'?t.p.decisions.at(-1).interruption.days:null,question:r.question?.kind??null,missing:r.missingInputs,runs:runs(t.p,w)+' | '+runs(t.p,w+1)});
 out.b.push({exit:'newer nonclinical break, later dates (week 4)',...f(rx,x,5)});
 out.b.push({exit:'same dates relabelled nonclinical',...f(ry,y,4)});
}
{
 const t=trained([0,1]);// injury weeks 2-3 never reported then; athlete trains weeks 4-5 and reports them; injury declared at week 6 day 0
 for(const w of [4,5])step(t,w,{observations:weekFacts(t.p,w)});
 const r=step(t,6,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:injury});clear(t);
 const seq=[r.status];for(const w of [6,7]){const q=step(t,w,{observations:weekFacts(t.p,w)});seq.push(q.status);clear(t);}
 out.c.push({case:'past injury break reported after two weeks of training',sequence:seq});
}
console.log(JSON.stringify(out,null,1));
