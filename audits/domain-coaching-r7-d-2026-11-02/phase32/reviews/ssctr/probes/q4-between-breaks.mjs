// Q4/Q7 (return conservatism; unknown training between). The fixture plans strength on Mon (day 0) and Fri (4), runs on Tue (1), Thu (3) and the
// long run on Sun (6); Wed (2) and Sat (5) are rest days. Run on both roots (candidate and R7D-FREEZE-2).
//  RD  Rest day only between: A = Mon wk2..Tue wk3 (9 days, SHORT alone), D = Thu..Sun wk3 (4 days, SHORT alone), Wed wk3 a rest day. A kept,
//      D declared separate (own name), plain review. Comparators: D alone; the 14-day stop once.
//  TB  Training between: A = weeks 2-3 (14 days), gap Mon-Wed wk4, D = Thu-Sun wk4 (4 days). Variants: (1) only the Tue easy run done, Mon
//      strength not done; (2) every gap session done (the directed T4 'done' case). Comparators: (c1) A applied by a return report when
//      stated (wk4 day 0), then the same gap training, then D by a return report; (c2) the whole 21 days once.
//  CF  A conflicted report between: Mon strength not done; the Tue run reported done and then not done by two reports (conflicted); expect
//      TRAINING_BETWEEN_BREAKS; then the conflict corrected (correctionOf) to done, and to not done.
//  UB  Unknown between, answered: asked; answered done or not done.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,view,live,obs,notDone,weekFacts}=L;
const out={root,cases:{}};
// ---- RD ----
{const base=trained([0,1]),s2=base.p.weeks[2].startDate;
 const A={startDate:s2,endDate:addDays(s2,8),days:9,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
 const D={startDate:addDays(s2,10),endDate:addDays(s2,13),days:4,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 const gap=base.p.weeks[3].sessions.filter(s=>live(s)&&s.date===addDays(s2,9));
 const t=copy(base);step(t,3,{day:2,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'rd-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,4,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'rd-D'},event:{id:'rd-D',kind:'LOCAL_FATIGUE'}});
 const r=step(t,4,{day:1,hour:'07:00:00'});
 const dAlone=copy(base),r1=step(dAlone,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:D});
 const once=copy(base),r2=step(once,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,endDate:D.endDate,days:14}});
 out.cases.RD={sessionsPlannedOnGapDay:gap.length,separate:view(r,t,4,2),comparatorDAlone:view(r1,dAlone,4,2),comparatorOnce14:view(r2,once,4,2)};}
// ---- TB, CF, UB ----
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const D={startDate:addDays(s2,17),endDate:addDays(s2,20),days:4,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const gapOf=p=>p.weeks[4].sessions.filter(s=>live(s)&&s.date>=addDays(s2,14)&&s.date<=addDays(s2,16));
const kept=()=>{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'tb-A',kind:'SYSTEMIC_FATIGUE'}});return t;};
const runOnly=(p,s)=>s.sport==='RUN'?obs(p,s):notDone(p,s);
const strengthOnly=(p,s)=>s.sport==='STRENGTH'?obs(p,s):notDone(p,s),aborted=(p,s)=>s.sport==='RUN'?obs(p,s,{actual:{completed:false,minutes:5}}):notDone(p,s);
for(const [label,report] of [['TB1_oneEasyRunOnly',runOnly],['TB2_allGapSessionsDone',(p,s)=>obs(p,s)],['TB3_oneStrengthSessionOnly',strengthOnly],['TB4_oneAbortedFiveMinuteRun',aborted]]){
 const t=kept(),gap=gapOf(t.p);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'tb-D'},event:{id:'tb-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>report(t.p,s))});
 const r=step(t,5,{day:1,hour:'07:00:00'});
 // c1: A applied when stated, then the same training, then D.
 const c=copy(base);const ra=step(c,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A,event:{id:'tb-A',kind:'RETURN_AFTER_PAUSE'}});
 const gc=gapOf(c.p);
 const aRet=c.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1)?.interruption,aView=aRet?`${aRet.class} ${aRet.days}d ${aRet.startDate}..${aRet.endDate}`:ra.action;
 const rc=step(c,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:D,observations:gc.map(s=>report(c.p,s))});
 out.cases[label]={gapSessions:gap.map(s=>`${s.date} ${s.sport} ${s.prescription.family??''} ${s.prescription.durationMinutes??''}`),gapReported:gap.map(s=>JSON.stringify(report(t.p,s).actual).slice(0,40)),separate:view(r,t,5,2),
  comparatorAAppliedThenGapThenD:{aReturn:aView,gapPlannedAfterAReturn:gc.map(s=>`${s.date} ${s.sport} ${s.prescription.family??''} ${s.prescription.durationMinutes??''}`),dReturn:view(rc,c,5,2)}};
}
{const once=copy(base),r=step(once,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,endDate:D.endDate,days:21}});out.cases.TB_comparatorOnce21=view(r,once,5,2);}
// ---- CF ----
{const t=kept(),gap=gapOf(t.p),run=gap.find(s=>s.sport==='RUN'),others=gap.filter(s=>s!==run);
 const done=obs(t.p,run),undone={...notDone(t.p,run),observedAt:done.observedAt};
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'cf-D'},event:{id:'cf-D',kind:'LOCAL_FATIGUE'},observations:[...others.map(s=>notDone(t.p,s)),done,undone]});
 const conflictedRows=t.ledger.filter(o=>o.sessionId===run.id).map(o=>({eventId:o.eventId,completed:o.actual?.completed,conflicted:!!o.conflicted}));
 const q=step(t,5,{day:1,hour:'07:00:00'});
 const res={conflictedRows,plain:view(q,t,5,2)};
 for(const [k,completed] of [['correctedToDone',true],['correctedToNotDone',false]]){
  const c=copy(t),row=c.ledger.find(o=>o.sessionId===run.id&&o.conflicted);
  const fix={...(completed?obs(c.p,run):notDone(c.p,run)),observedAt:done.observedAt,correctionOf:row?.eventId,correctedAt:`${addDays(c.p.weeks[5].startDate,2)}T06:00:00Z`};
  res[k]=view(step(c,5,{day:2,hour:'07:00:00',observations:[fix]}),c,5,3);
 }
 // The question answered as it reads ("report the sessions"), with a plain new report instead of a correction of the conflicted one.
 {const c=copy(t);res.answeredPlainNewReportNotDone=view(step(c,5,{day:2,hour:'07:00:00',observations:[{...notDone(c.p,run),observedAt:done.observedAt}]}),c,5,3);}
 out.cases.CF=res;}
// ---- UB ----
{const t=kept(),gap=gapOf(t.p);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:'ub-D'},event:{id:'ub-D',kind:'LOCAL_FATIGUE'}});
 const q=step(t,5,{day:1,hour:'07:00:00'});
 const res={asked:view(q,t,5,2)};
 for(const [k,f] of [['answeredAllNotDone',notDone],['answeredAllDone',(p,s)=>obs(p,s)],['answeredRunOnlyDone',runOnly]]){const c=copy(t);res[k]=view(step(c,5,{day:2,hour:'07:00:00',observations:gap.map(s=>f(c.p,s))}),c,5,3);}
 // A partial answer: one session reported, the other still unreported.
 {const c=copy(t);res.answeredPartlyNotDone=view(step(c,5,{day:2,hour:'07:00:00',observations:[notDone(c.p,gap[0])]}),c,5,3);}
 out.cases.UB=res;}
console.log(JSON.stringify(out,null,1));
