// Exploration only (scratch): cases that separate the direction-A variants. Uses the SSCTR Phase 3.3 probe helpers (read-only).
// node x-cases.mjs <root holding CoachingCore> [--label <name>]
import {setup} from '../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup();
const {step,base,day,brk,trip,obs,notDone,weekObs,view,once,noRir,out}=P;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
// A kept by a fatigue report on Mon wk4 (14-day holiday, days 0-13); the weeks between reported with D (bulk); a plain review after D.
function bulk(id,weeks,dw,report,{dStartDay=0,dDays=4,clinicalA=false,lead=null}={}){
 const t=base();
 const A=clinicalA?brk(0,13,{reasonCategory:'ILLNESS',reason:'Flu',nonclinical:false}):brk(0,13);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d0=dw*7-14+dStartDay,d=trip(d0,d0+dDays-1);
 step(t,dw,{day:dStartDay+dDays,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return view(step(t,dw,{day:dStartDay+dDays,hour:'08:00:00'}),t,dw,6);
}
// X1 isolated session in a long gap: weeks 4-6 every session not done except the Tue run of week 5; D Mon-Thu wk7 (14 + 21 + 4 = 39 days).
const oneRun=(p,s)=>s.sport==='RUN'&&dow(s)===2&&s.date>=day(21)&&s.date<=day(27)?obs(p,s):notDone(p,s);
out.cases.X1_isolatedRunInThreeWeekGap=bulk('x1',[4,5,6],7,oneRun);
out.cases.X1c_nothingInThreeWeekGap=bulk('x1c',[4,5,6],7,notDone);
// X2 both sports partial: weeks 4-5 with the Tue run and the Fri strength session missed each week; D Mon-Thu wk6.
out.cases.X2_bothSportsPartialTwoWeeks=bulk('x2',[4,5],6,miss(s=>tueRun(s)||friStrength(s)));
// X3 one week: every run done, the Fri strength missed; D Mon-Thu wk5.
out.cases.X3_oneWeekRunsDoneFridayStrengthMissed=bulk('x3',[4],5,miss(friStrength));
out.cases.X3c_oneCompleteWeek=bulk('x3c',[4],5,(p,s)=>obs(p,s));
// X4 one week executed in full, strength logged without reps in reserve (SSCTR P33-F02); D Mon-Thu wk5.
out.cases.X4_oneWeekFullNoRir=bulk('x4',[4],5,(p,s)=>s.sport==='STRENGTH'?noRir(p,s):obs(p,s));
// X5 the Founder's case: 14-day holiday, two weeks with every run done and one strength session missed each week, 4-day trip.
out.cases.X5_mandatoryCase=bulk('x5',[4,5],6,miss(friStrength));
// X6 adverse response on the runs of an otherwise complete week (recovery ADVERSE), strength complete; D Mon-Thu wk5.
out.cases.X6_runsAdverseStrengthComplete=bulk('x6',[4],5,(p,s)=>s.sport==='RUN'?obs(p,s,{response:{recovery:'ADVERSE'}}):obs(p,s));
// X7 clinical earlier break (flu) with a week of runs done, strength missed Friday: must stay clinical (F08).
out.cases.X7_clinicalEarlierBreakPartialWeek=bulk('x7',[4],5,miss(friStrength),{clinicalA:true});
// X8 three breaks: A (days 0-13), week 4 runs done Fri strength missed, B Mon-Wed wk5 (days 21-23), week 5 rest runs done, D Mon-Thu wk6.
{const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'x8-A',kind:'SYSTEMIC_FATIGUE'}});
 const o4=weekObs(t.p,4,miss(friStrength)),B=trip(21,23);
 const o5=t.p.weeks[5].sessions.filter(s=>P.live(s)&&s.date>day(23)).map(s=>friStrength(s)?notDone(t.p,s):obs(t.p,s));
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...B,episodeId:'x8-B'},event:{id:'x8-B',kind:'LOCAL_FATIGUE'},observations:o4});
 const D=trip(28,31);
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'x8-D'},event:{id:'x8-D',kind:'LOCAL_FATIGUE'},observations:o5});
 out.cases.X8_threeBreaksPartialLinks=view(step(t,6,{day:4,hour:'08:00:00'}),t,6,6);}
console.log(JSON.stringify(out,null,1));
