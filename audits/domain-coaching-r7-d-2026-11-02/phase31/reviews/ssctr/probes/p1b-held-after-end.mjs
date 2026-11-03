// Point 1, held days after a stated end: a 10-day (SHORT) or 14-day (MODERATE) break with stated dates, declared the day after it ends with an
// illness flag (clinical route), cleared 14 days later; no reports in between. What the first review after clearance plans, against
// (a) the same review with the break stated again, (b) a timeline where the break was never declared (silence only), and (c) the same days
// declared as one break up to the day before the applying review. Run on both roots.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,clear,trained,executedMax,addDays,elig,live}=L;
const base=trained([0,1]),start=base.p.weeks[2].startDate;
const at=(t,day)=>{const w=t.p.weeks.findIndex(x=>x.startDate<=day&&day<=addDays(x.startDate,6));return {w,day:Math.round((Date.parse(day)-Date.parse(t.p.weeks[w].startDate))/864e5)};};
const plan=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.date>=from).map(s=>s.sport==='RUN'?`${s.date.slice(5)} R:${s.prescription.family}:${s.prescription.durationMinutes}`:`${s.date.slice(5)} S:${s.prescription.exercises.map(e=>e.sets+'x'+e.reps+'@rir'+e.rir).join(',')}`));
const out={root,ceiling:executedMax(base,start),cases:[]};
for(const len of [10,14])for(const hold of [7,14]){
 const brk={startDate:start,endDate:addDays(start,len-1),days:len,reasonCategory:'TRAVEL',reason:'Trip, no training',nonclinical:true};
 const decl=addDays(start,len),D=at(base,decl),app=addDays(decl,hold),A=at(base,app);
 const t=copy(base);const r1=step(t,D.w,{day:D.day,hour:'07:00:00',interruption:brk,eligibility:{...elig(decl),illness:true}});clear(t);
 const k=copy(t),rk=step(k,A.w,{day:A.day,hour:'07:00:00'});
 const s=copy(t),rs=step(s,A.w,{day:A.day,hour:'07:00:00',interruption:brk});
 const n=copy(base),rn=step(n,A.w,{day:A.day,hour:'07:00:00'});
 const whole={...brk,endDate:addDays(app,-1),days:len+hold};
 const u=copy(t),ru=step(u,A.w,{day:A.day,hour:'07:00:00',interruption:whole});
 const row=(r,t)=>({status:r.status,action:r.action,validity:r.planValidity?.status,question:r.question?.kind??null,missing:r.missingInputs,cls:r.action==='REESTABLISH'?t.p.decisions.at(-1).interruption.class:null,plan:plan(t.p,A.w,app)});
 out.cases.push({len,hold,declared:decl,applied:app,first:r1.status,kept:row(rk,k),restated:row(rs,s),neverDeclared:row(rn,n),wholeStopDeclared:row(ru,u)});
}
console.log(JSON.stringify(out,null,1));
