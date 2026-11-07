// Q3 baseline for s2: what the existing single-break rule does on the same paths without the later trip D, to separate the pre-existing reading
// of training after an unapplied break from the candidate's increment. Run on both roots.
//  B1  bulk (as V1): A kept on Mon wk4; weeks 4-5 reported on Fri wk6 (Friday strength missed each week); no D; a plain review an hour later.
//  B2  bulk, weeks 4-5 in full (as E1 without D).
//  B3  the late form (as V5): weeks 2-3 not done and reviewed, weeks 4-5 reviewed with the Friday strength missed, A declared late (fatigue
//      report, Mon wk6), Mon-Tue wk6 reported not done on Sun wk6, no D; a plain review Mon wk7.
//  B4  the late form with A declared by a return report on Mon wk6 (RETURN_AFTER_PAUSE).
//  B5  as V1, but D declared through a return report (RETURN_AFTER_PAUSE, named) rather than a fatigue report: the same stop.
import {setup} from './common.mjs';
const P=await setup();
const {step,base,day,brk,trip,obs,notDone,weekObs,view,live,returns,out}=P;
const friStrength=s=>s.sport==='STRENGTH'&&new Date(s.date+'T00:00:00Z').getUTCDay()===5;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const listReturns=t=>returns(t.p).map(x=>`${x.interruption.class} ${x.interruption.days}d ${x.interruption.startDate}..${x.interruption.endDate} fromWeek ${x.fromWeek}`);
for(const [id,report] of [['B1_bulkTwoImperfectWeeksNoD',miss(friStrength)],['B2_bulkTwoCompleteWeeksNoD',(p,s)=>obs(p,s)]]){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>weekObs(t.p,w,report));
 const s=step(t,6,{day:4,hour:'07:00:00',observations:o}),r=step(t,6,{day:4,hour:'08:00:00'});
 out.cases[id]={sync:s.action+' '+(s.question?.kind??''),result:view(r.action==='REESTABLISH'?r:s,t,6,5),plain:r.action,returns:listReturns(t)};
}
for(const [id,kind] of [['B3_lateFatigueNoD','SYSTEMIC_FATIGUE'],['B4_lateReturnReportNoD','RETURN_AFTER_PAUSE']]){
 const t=base();
 for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
 for(const w of [4,5])step(t,w,{observations:weekObs(t.p,w,miss(friStrength))});
 const a=step(t,6,{day:0,hour:'07:00:00',kind,interruption:brk(0,13),event:{id:id+'-A',kind}});
 const before=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date<day(30));
 const s=step(t,6,{day:6,hour:'07:00:00',observations:before.map(x=>notDone(t.p,x))});
 const r=step(t,7,{day:0,hour:'07:00:00'});
 out.cases[id]={declare:a.action+' '+(a.question?.kind??''),reasonDeclare:(a.reason??'').slice(0,200),sun:s.action,mon:view(r,t,7,1),returns:listReturns(t)};
}
{const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'b5-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>weekObs(t.p,w,miss(friStrength)));
 const r=step(t,6,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'b5-D'},event:{id:'b5-D',kind:'RETURN_AFTER_PAUSE'},observations:o});
 out.cases.B5_DByReturnReport={result:view(r,t,6,6),returns:listReturns(t)};}
console.log(JSON.stringify(out,null,1));
