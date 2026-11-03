// Q1/Q2 (F02 factual preservation; separate versus corrected; answer protocol). Weeks 0-1 executed. A = weeks 2-3 (14 days, holiday),
// B = week 4 (7 days, work trip, the day after A). Run on both roots (candidate and R7D-FREEZE-2).
//  F1  W1 path: A with a fatigue report (kept), B with a local-fatigue report, plain review; then the two answers (separate: B's own id;
//      correction: A's id), each on a copy.
//  F2  W2 path: A kept, B stated by the weekly review itself; then the two answers.
//  F3  B named with a new name of its own at first statement (already separate): no relation question, the continuous stop.
//  F4  Three breaks, all touching: A 14 + B 7 + C 10 days (31 days): asked for B and C; answered separate one by one; comparator: 31 days once.
//  F5  A kept, then a review with a clinical flag (routed), clearance, then B and a plain review: A must survive the clinical route.
//  F6  Order: B declared first (kept), then A (older days, reported later), then plain review and answers.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,clear,trained,addDays,view,elig}=L;
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const brk=(from,to,x={})=>({startDate:addDays(s2,from),endDate:addDays(s2,to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const A=brk(0,13),B=brk(14,20,{reasonCategory:'WORK',reason:'Work trip'}),C=brk(21,30,{reasonCategory:'FAMILY',reason:'Family visit'});
const out={root,cases:{}};
const answers=(t,w,day,bId,aId,label)=>{
 const sep=copy(t),cor=copy(t);
 const rs=step(sep,w,{day,hour:'07:00:00',interruption:{...B,episodeId:bId},event:{id:label+'-ans-sep',kind:'WEEKLY_REVIEW'}});
 const rc=step(cor,w,{day,hour:'07:00:00',interruption:{...B,episodeId:aId},event:{id:label+'-ans-cor',kind:'WEEKLY_REVIEW'}});
 return {answerSeparate:view(rs,sep,w,day+1),answerCorrection:view(rc,cor,w,day+1)};
};
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'q1-A',kind:'SYSTEMIC_FATIGUE'}});
 const b=step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B,event:{id:'q1-B',kind:'LOCAL_FATIGUE'}});
 const r=step(t,5,{day:1,hour:'07:00:00'});
 out.cases.F1={carrierB:view(b,t,5,1).question??b.missingInputs,plain:view(r,t,5,2),...answers(t,5,2,'q1-B','q1-A','F1')};}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'q1-A',kind:'SYSTEMIC_FATIGUE'}});
 const r=step(t,5,{day:1,hour:'07:00:00',interruption:B,event:{id:'q1-B2',kind:'WEEKLY_REVIEW'}});
 out.cases.F2={weeklyStatesB:view(r,t,5,2),...answers(t,5,2,'q1-B2','q1-A','F2')};}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'q1-A',kind:'SYSTEMIC_FATIGUE'}});
 const r=step(t,5,{day:1,hour:'07:00:00',interruption:{...B,episodeId:'my-work-trip'},event:{id:'q1-B3',kind:'WEEKLY_REVIEW'}});
 out.cases.F3=view(r,t,5,2);}
{const once=copy(base);const r0=step(once,6,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,30,{reason:'Holiday, trip, family'})});
 const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'q1-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B,event:{id:'q1-B',kind:'LOCAL_FATIGUE'}});
 step(t,6,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:C,event:{id:'q1-C',kind:'LOCAL_FATIGUE'}});
 const F4={comparatorOnce31:view(r0,once,6,5)};
 F4.plain=view(step(t,6,{day:4,hour:'07:00:00'}),t,6,5);
 F4.afterAnswerB=view(step(t,6,{day:4,hour:'08:00:00',interruption:{...B,episodeId:'q1-B'},event:{id:'q1-ansB',kind:'WEEKLY_REVIEW'}}),t,6,5);
 F4.afterAnswerC=view(step(t,6,{day:4,hour:'09:00:00',interruption:{...C,episodeId:'q1-C'},event:{id:'q1-ansC',kind:'WEEKLY_REVIEW'}}),t,6,5);
 out.cases.F4=F4;}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'q1-A',kind:'SYSTEMIC_FATIGUE'}});
 const f=step(t,4,{day:3,hour:'07:00:00',eligibility:{...elig(addDays(base.p.weeks[4].startDate,3)),illness:true}});clear(t);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B,event:{id:'q1-B',kind:'LOCAL_FATIGUE'}});
 const r=step(t,5,{day:1,hour:'07:00:00'});
 out.cases.F5={flag:f.status,plainAfterClearance:view(r,t,5,2),...answers(t,5,2,'q1-B','q1-A','F5')};}
{const t=copy(base);step(t,5,{day:0,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE',interruption:B,event:{id:'q1-Bfirst',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:A,event:{id:'q1-Alater',kind:'LOCAL_FATIGUE'}});
 const r=step(t,5,{day:1,hour:'07:00:00'});
 const sep=copy(t),rs=step(sep,5,{day:2,hour:'07:00:00',interruption:{...A,episodeId:'q1-Alater'},event:{id:'F6-ans-sep',kind:'WEEKLY_REVIEW'}});
 out.cases.F6={plain:view(r,t,5,2),answerSeparate:view(rs,sep,5,3)};}
console.log(JSON.stringify(out,null,1));
