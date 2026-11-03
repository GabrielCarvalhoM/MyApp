// Point 1: the re-entry from a kept break. Weeks 0-1 executed and reviewed; the break starts on week 2 day 0 and lasts `len` days; it is
// declared the day after it ends by a carrier (an ASK carrier, a clinical flag, unknown eligibility). The kept break is then applied by the
// first plain weekly review 1, 7 or 14 days later (after qualified clearance for the clinical carrier). Compared with (i) the same break
// stated again at that review, (ii) the timely direct return report at the declaring clock, and (iii) R7D-FREEZE-1's plain review (run this
// file on both roots). Synthetic fixtures; engineering evidence only.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,clear,trained,executedMax,brief,quality,maxRun,addDays,elig,live}=L;
const base=trained([0,1]);
const start=base.p.weeks[2].startDate;
const at=(t,day)=>{const w=t.p.weeks.findIndex(x=>x.startDate<=day&&day<=addDays(x.startDate,6));return {w,day:Math.round((Date.parse(day)-Date.parse(t.p.weeks[w].startDate))/864e5)};};
const forms={
 DATES:len=>({startDate:start,endDate:addDays(start,len-1),days:len,reasonCategory:'TRAVEL',reason:'Trip, no training',nonclinical:true}),
 START_ONLY:len=>({startDate:start,reasonCategory:'TRAVEL',reason:'Trip, no training',nonclinical:true}),
 DAYS_ONLY:len=>({days:len,reasonCategory:'TRAVEL',reason:'Trip, no training',nonclinical:true}),
};
const carriers={FATIGUE_ASK:{kind:'SYSTEMIC_FATIGUE'},ILLNESS_FLAG:{kind:'WEEKLY_REVIEW',clinical:'illness'},ELIG_UNKNOWN:{kind:'WEEKLY_REVIEW',eligibility:{status:'UNKNOWN'}}};
const weekMax=(p,w,fromDay)=>Math.max(0,...p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=fromDay).map(s=>s.prescription.durationMinutes));
const rows=[];
for(const [fname,form] of Object.entries(forms))for(const len of [5,10,14,21,35])for(const [cname,c] of Object.entries(carriers))for(const delay of [1,7,14]){
 const t=copy(base),brk=form(len),declDay=addDays(start,len),D=at(t,declDay),ceiling=executedMax(t,start);
 const x={day:D.day,hour:'07:00:00',kind:c.kind,interruption:brk,...(c.clinical?{eligibility:{...elig(declDay),[c.clinical]:true}}:{}),...(c.eligibility?{eligibility:c.eligibility}:{})};
 const r1=step(t,D.w,x);
 const d=copy(base),rd=step(d,D.w,{day:D.day,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk});
 if(c.clinical)clear(t);
 const appDay=addDays(declDay,delay),A0=at(t,appDay),a=copy(t),b=copy(t);
 const ra=step(a,A0.w,{day:A0.day,hour:'07:00:00'});
 const rb=step(b,A0.w,{day:A0.day,hour:'07:00:00',interruption:brk});
 const A=brief(ra,a,A0.w,A0.day),B=brief(rb,b,A0.w,A0.day),T=brief(rd,d,D.w,D.day);
 const strip=o=>JSON.stringify({...o,reason:null,declaredBy:null});
 rows.push({form:fname,len,carrier:cname,declared:`w${D.w}d${D.day}`,applied:`w${A0.w}d${A0.day}`,first:r1.status,ceiling,
  kept:{action:A.action,validity:A.validity,cls:A.cls??null,days:A.days??null,span:A.start?`${A.start}..${A.end}`:null,missing:A.missing,question:A.question,appWeekMax:weekMax(a.p,A0.w,appDay),nextWeekMax:a.p.weeks[A0.w+1]?weekMax(a.p,A0.w+1,'0000'):null,quality:quality(A.runsAhead),reason:A.reason},
  sameAsRestated:strip(A)===strip(B),
  timely:{action:T.action,cls:T.cls??null,days:T.days??null,missing:T.missing}});
}
console.log(JSON.stringify({root,rows}));
