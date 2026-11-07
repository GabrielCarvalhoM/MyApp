// Q3 (the inverse defect): weeks of real but imperfect training between two separate breaks. Run on both roots.
// A = weeks 2-3 (14-day holiday). Weeks between are executed with one shortfall per week; then D, a 4-day trip, Mon-Thu of the next week.
//  V1  bulk: weeks 4-5, every run done, the Friday strength session missed each week; D = Mon-Thu wk6.
//  V2  bulk: weeks 4-5, every session done except the Tuesday easy run each week; D = Mon-Thu wk6.
//  V3  bulk: weeks 4-6, the Friday strength session missed each week; D = Mon-Thu wk7.
//  V4  normal use: A kept by a fatigue report on Mon wk4, then a weekly review at the end of week 4 and of week 5 (each with the Friday strength
//      session missed), then D named on its own on Fri wk6 and a plain review. Does a weekly review apply A?
//  V5  the late form: weeks 2-3 reported not done and reviewed; weeks 4-5 reviewed with the Friday strength missed; A declared late (fatigue
//      report, Mon wk6); D = Wed-Sat wk6 named, declared Sun wk6 with Mon-Tue wk6 not done; a plain review Mon wk7.
//  Comparators: E1 (weeks 4-5 in full, bulk); A applied when stated by a return report on Mon wk4, then weeks 4-5 as re-planned with the same
//  shortfall, then D by a return report (the existing episode rule); the 32 days declared once.
import {setup} from './common.mjs';
const P=await setup();
const {step,base,copy,day,brk,trip,obs,notDone,weekObs,view,once,live,returns,out}=P;
const friStrength=s=>s.sport==='STRENGTH'&&new Date(s.date+'T00:00:00Z').getUTCDay()===5;
const tueRun=s=>s.sport==='RUN'&&new Date(s.date+'T00:00:00Z').getUTCDay()===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
function bulk(id,weeks,dw,report){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d=trip(dw*7-14,dw*7-11);
 step(t,dw,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,d,view:view(step(t,dw,{day:4,hour:'08:00:00'}),t,dw,6)};
}
out.cases.V1_twoWeeksFridayStrengthMissed=bulk('v1',[4,5],6,miss(friStrength)).view;
out.cases.V2_twoWeeksTuesdayRunMissed=bulk('v2',[4,5],6,miss(tueRun)).view;
out.cases.V3_threeWeeksFridayStrengthMissed=bulk('v3',[4,5,6],7,miss(friStrength)).view;
out.cases.E1_twoCompleteWeeks=bulk('e1',[4,5],6,(p,s)=>obs(p,s)).view;
// V4: weekly reviews between.
{const t=base(),log=[];
 const a=step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'v4-A',kind:'SYSTEMIC_FATIGUE'}});log.push(['Mon wk4 fatigue+A',a.action,a.question?.kind??null,returns(t.p).length]);
 for(const w of [4,5]){const r=step(t,w,{observations:weekObs(t.p,w,miss(friStrength))});log.push([`weekly review wk${w}`,r.action,r.question?.kind??null,returns(t.p).length,(r.reason??'').slice(0,160)]);}
 const d=trip(28,31);
 const dr=step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:'v4-D'},event:{id:'v4-D',kind:'LOCAL_FATIGUE'}});log.push(['Fri wk6 fatigue+D',dr.action,dr.question?.kind??null,returns(t.p).length]);
 const r=step(t,6,{day:4,hour:'08:00:00'});
 out.cases.V4_weeklyReviewsBetween={log,result:view(r,t,6,6),returnsApplied:returns(t.p).map(x=>`${x.interruption.class} ${x.interruption.days}d ${x.interruption.startDate}..${x.interruption.endDate}`)};}
// V5: the late form.
{const t=base();
 for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
 for(const w of [4,5])step(t,w,{observations:weekObs(t.p,w,miss(friStrength))});
 step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'v5-A',kind:'SYSTEMIC_FATIGUE'}});
 const before=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date<day(30));
 step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:'v5-D'},event:{id:'v5-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
 out.cases.V5_lateTwoReviewedImperfectWeeks=view(step(t,7,{day:0,hour:'07:00:00'}),t,7,1);}
// Comparator: A applied when stated, then weeks 4-5 as re-planned with the Friday strength missed, then D by a return report.
{const c=base();const ra=step(c,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,13),event:{id:'k-A',kind:'RETURN_AFTER_PAUSE'}});
 for(const w of [4,5])step(c,w,{observations:weekObs(c.p,w,miss(friStrength))});
 const rd=step(c,6,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31)});
 out.cases.K_appliedWhenStatedThenTwoImperfectWeeksThenTrip={aReturn:ra.action,result:view(rd,c,6,6)};}
{const k=once(0,31,6,4);out.cases.K_thirtyTwoDaysOnce=view(k.r,k.t,6,6);}
console.log(JSON.stringify(out,null,1));
