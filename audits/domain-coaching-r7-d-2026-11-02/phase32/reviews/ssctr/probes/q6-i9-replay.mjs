// Q2/Q6 (exact replay; I9: dates never join; equal dates with other facts are asked). Weeks 0-1 executed. A = weeks 2-3 (14 days).
// Run on both roots.
//  R1 the same facts again through another carrier (another event id): one declaration, no relation question; next review applies once.
//  R2 the same dates, another reason text ("Vacation" for "Holiday"): asked; answered as a correction or as separate (identical days: overlap).
//  R3 the same dates with one more fact (startedAt): asked; the named correction applies.
//  R4 days-only reports (no dates), identical, stated two weeks apart while kept: joined as one declaration (an exact replay), read as one
//     7-day break ending the day before the applying review; comparator: two 7-day stops declared with dates and no training between.
//  R5 two reports with identical facts and two different names given by the athlete (named separate by the athlete): joined or separate?
//  R6 a newer report naming a break the record does not hold (a typo): what it is.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,view,live,notDone}=L;
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const out={root,cases:{}};
const keptA=()=>{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'r-A',kind:'SYSTEMIC_FATIGUE'}});return t;};
{const t=keptA(),R1={};R1.again=view(step(t,4,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...A},event:{id:'r-A2',kind:'LOCAL_FATIGUE'}}),t,4,2);
 R1.plain=view(step(t,4,{day:2,hour:'07:00:00'}),t,4,3);R1.plainAgain=view(step(t,4,{day:3,hour:'07:00:00'}),t,4,4);out.cases.R1=R1;}
{const t=keptA(),R2={};R2.sameDatesOtherText=view(step(t,4,{day:1,hour:'07:00:00',interruption:{...A,reason:'Vacation'},event:{id:'r-A3',kind:'WEEKLY_REVIEW'}}),t,4,2);
 const c=copy(t),s=copy(t);
 R2.answeredCorrection=view(step(c,4,{day:2,hour:'07:00:00',interruption:{...A,reason:'Vacation',episodeId:'r-A'},event:{id:'r-ans-c',kind:'WEEKLY_REVIEW'}}),c,4,3);
 R2.answeredSeparate=view(step(s,4,{day:2,hour:'07:00:00',interruption:{...A,reason:'Vacation',episodeId:'r-A3'},event:{id:'r-ans-s',kind:'WEEKLY_REVIEW'}}),s,4,3);
 out.cases.R2=R2;}
{const t=keptA(),R3={};const at=`${s2}T05:00:00Z`;
 R3.withStartedAt=view(step(t,4,{day:1,hour:'07:00:00',interruption:{...A,startedAt:at},event:{id:'r-A4',kind:'WEEKLY_REVIEW'}}),t,4,2);
 R3.named=view(step(t,4,{day:2,hour:'07:00:00',interruption:{...A,startedAt:at,episodeId:'r-A'},event:{id:'r-A5',kind:'WEEKLY_REVIEW'}}),t,4,3);out.cases.R3=R3;}
{const t=copy(base),R4={};const rel={days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 // weeks 2-3 reported not done (no unreported training), the first days-only report on week 3 day 0 (7 days ending the day before: week 2),
 // the identical one on week 4 day 0 (7 days ending the day before: week 3), plain review on week 4 day 1.
 step(t,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...rel},event:{id:'r-rel1',kind:'SYSTEMIC_FATIGUE'}});
 R4.second=view(step(t,4,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...rel},event:{id:'r-rel2',kind:'LOCAL_FATIGUE'}}),t,4,1);
 R4.plain=view(step(t,4,{day:1,hour:'07:00:00'}),t,4,2);
 const d=copy(base);step(d,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{startDate:s2,endDate:addDays(s2,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true},event:{id:'r-dat1',kind:'SYSTEMIC_FATIGUE'}});
 step(d,4,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{startDate:addDays(s2,7),endDate:addDays(s2,13),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true,episodeId:'r-dat2'},event:{id:'r-dat2',kind:'LOCAL_FATIGUE'}});
 R4.comparatorDated=view(step(d,4,{day:1,hour:'07:00:00'}),d,4,2);out.cases.R4=R4;}
{const t=copy(base),R5={};step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...A,episodeId:'holiday-1'},event:{id:'r-n1',kind:'SYSTEMIC_FATIGUE'}});
 R5.secondNamedOther=view(step(t,4,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...A,episodeId:'holiday-2'},event:{id:'r-n2',kind:'LOCAL_FATIGUE'}}),t,4,2);
 R5.plain=view(step(t,4,{day:2,hour:'07:00:00'}),t,4,3);out.cases.R5=R5;}
{const t=keptA(),R6={};const B={startDate:addDays(s2,14),endDate:addDays(s2,20),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 R6.namesUnknown=view(step(t,5,{day:1,hour:'07:00:00',interruption:{...B,episodeId:'r-AA'},event:{id:'r-typo',kind:'WEEKLY_REVIEW'}}),t,5,2);out.cases.R6=R6;}
console.log(JSON.stringify(out,null,1));
