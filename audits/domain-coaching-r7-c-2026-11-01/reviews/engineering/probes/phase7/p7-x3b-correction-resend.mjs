// P7-X3b: the R7 control of P7-X3 with the correction re-sent after clearance (C3: the answer is kept and re-sent after qualified clearance).
// Timely GEN athlete, weeks 0..5 reported and reviewed on time; week 6 day 2 a correction of week 5's long run to 60 % recorded by a clinical
// substitution (cleared); day 3 a plain review re-sending the correction. Reference: the correction as a plain review on day 2, then day 3.
// Read-only; prints JSON.
import {RUNTIMES,client,live,programs,csub,AT,brief,runsFromDay,planFrom,val} from './p7-lib.mjs';
const out={probe:'P7-X3b correction re-sent after clearance',runtimes:Object.keys(RUNTIMES),cells:[]};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,P=programs(H),t=client(R,H.program(P.GEN)),kept=[];
 for(let w=0;w<6;w++){const ob=t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s));kept.push(...ob);t.step(w,{observations:ob});}
 const lr=t.p.weeks[5].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.role==='LONG'),orig=kept.find(o=>o.sessionId===lr.id),d2=H.addDays(t.p.weeks[6].startDate,2);
 const fix={...orig,eventId:orig.eventId+'-c',correctionOf:orig.eventId,correctedAt:`${d2}T06:00:00Z`,actual:{...orig.actual,minutes:Math.round(orig.actual.minutes*0.6)}};
 const x=t.copy();csub(x,6,[fix],AT(2));const a=x.step(6,{...AT(3),observations:[fix]});
 const y=t.copy();y.step(6,{...AT(2),observations:[fix]});const b=y.step(6,AT(3));
 out.cells.push({runtime:name,resent:{...brief(a),runs:runsFromDay(x.p,6,3,2)},direct:{...brief(b),runs:runsFromDay(y.p,6,3,2)},equal:JSON.stringify(planFrom(R,x.p,6,3))===JSON.stringify(planFrom(R,y.p,6,3))&&val(a)===val(b)});
}
console.log(JSON.stringify(out,null,1));
