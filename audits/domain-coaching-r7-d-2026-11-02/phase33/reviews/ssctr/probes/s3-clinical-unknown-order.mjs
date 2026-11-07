// Q5 (clinical first, F08), Q7 (unknown training between) and Q6 (order of declaration on the re-entry branch). Run on both roots.
//  C1  A clinical-cause earlier break (flu, nonclinical false), week 4 executed in full, D = Mon-Thu wk5 (named): clinical first (F08)?
//  C2  A nonclinical, week 4 in full, D clinical-cause (injury): clinical first?
//  C3  A and D nonclinical, week 4 in full, the plain review carries a pain flag in eligibility: clinical first?
//  C4  A and D nonclinical, week 4 in full, the long run reported with recovery ADVERSE and the review's eligibility unchanged: no re-entry,
//      no clinical route (an adverse training response is not a clinical flag).
//  U1  A, D (Thu-Sun wk4) and the 3-day gap unreported: asked even though no whole week fits (O-01 extended); answered all done; answered one
//      session only (the rest still unreported).
//  U2  A, week 4 in full, Mon-Tue wk5 unreported, D = Wed-Sat wk5: is the unknown asked once a complete week re-entered the athlete?
//  O1  A and D with week 4 in full declared in either order (re-entry branch): the same stop, record and plan?
import {setup} from './common.mjs';
const P=await setup();
const {step,base,copy,day,brk,trip,obs,notDone,weekObs,sessionsIn,view,live,returns,elig,out}=P;
const keptA=(id,a=brk(0,13))=>{const t=base();const r=step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});return {t,r};};
const withD=(t,id,d,o)=>step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
const brief=(r,t,w,d)=>({...view(r,t,w,d),proposal:r.proposal?'present':null,declared:t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length});
// ---- C1 ----
{const {t,r:a}=keptA('c1',brk(0,13,{reasonCategory:'ILLNESS',reason:'Flu',nonclinical:false}));
 const d1=withD(t,'c1',trip(21,24),weekObs(t.p,4));
 out.cases.C1_clinicalEarlierBreakCompleteWeekBetween={aStep:a.status+' '+a.action,dStep:d1.status+' '+d1.action,result:brief(step(t,5,{day:4,hour:'08:00:00'}),t,5,6)};}
// ---- C2 ----
{const {t}=keptA('c2');
 const d2=withD(t,'c2',trip(21,24,{reasonCategory:'INJURY',reason:'Ankle sprain',nonclinical:false}),weekObs(t.p,4));
 out.cases.C2_clinicalLaterBreakCompleteWeekBetween={dStep:d2.status+' '+d2.action,result:brief(step(t,5,{day:4,hour:'08:00:00'}),t,5,6)};}
// ---- C3 ----
{const {t}=keptA('c3');withD(t,'c3',trip(21,24),weekObs(t.p,4));
 out.cases.C3_painFlagAtReview=brief(step(t,5,{day:4,hour:'08:00:00',eligibility:{...elig(day(25)),pain:true}}),t,5,6);}
// ---- C4 ----
{const {t}=keptA('c4');withD(t,'c4',trip(21,24),weekObs(t.p,4,(p,s)=>s.sport==='RUN'&&s.role==='LONG'?obs(p,s,{response:{recovery:'ADVERSE'}}):obs(p,s)));
 out.cases.C4_adverseRecoveryInTheWeek=brief(step(t,5,{day:4,hour:'08:00:00'}),t,5,6);}
// ---- U1 ----
{const {t}=keptA('u1'),gap=sessionsIn(t.p,14,16);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'u1-D'},event:{id:'u1-D',kind:'LOCAL_FATIGUE'}});
 const q=step(t,5,{day:1,hour:'07:00:00'}),res={asked:brief(q,t,5,2)};
 {const c=copy(t);res.answeredAllDone=brief(step(c,5,{day:2,hour:'07:00:00',observations:gap.map(s=>obs(c.p,s))}),c,5,3);}
 {const c=copy(t);res.answeredAllNotDone=brief(step(c,5,{day:2,hour:'07:00:00',observations:gap.map(s=>notDone(c.p,s))}),c,5,3);}
 {const c=copy(t);res.answeredOneOnly=brief(step(c,5,{day:2,hour:'07:00:00',observations:[obs(c.p,gap[0])]}),c,5,3);}
 out.cases.U1_unknownNoWholeWeekFits={gap:gap.map(s=>`${s.date} ${s.sport}`),...res};}
// ---- U2 ----
{const {t}=keptA('u2');
 const o=weekObs(t.p,4);
 step(t,5,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(23,26),episodeId:'u2-D'},event:{id:'u2-D',kind:'LOCAL_FATIGUE'},observations:o});
 out.cases.U2_completeWeekThenUnknownSessions={unknownBetween:sessionsIn(t.p,21,22).map(s=>`${s.date} ${s.sport}`),result:brief(step(t,5,{day:6,hour:'08:00:00'}),t,6,0)};}
// ---- O1 ----
{const results=[];
 for(const order of [['A','D'],['D','A']]){
  const u=base(),facts={A:{...brk(0,13),episodeId:'o1-A'},D:{...trip(21,24),episodeId:'o1-D'}};
  step(u,5,{day:4,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:facts[order[0]],event:{id:'o1-'+order[0],kind:'SYSTEMIC_FATIGUE'},observations:weekObs(u.p,4)});
  step(u,5,{day:4,hour:'08:00:00',kind:'LOCAL_FATIGUE',interruption:facts[order[1]],event:{id:'o1-'+order[1],kind:'LOCAL_FATIGUE'}});
  const r=step(u,5,{day:4,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE'}),v=brief(r,u,5,6);
  results.push({order:order.join(''),ret:v.ret,separateBreaks:v.separateBreaks,runsAhead:v.runsAhead,strengthAhead:v.strengthAhead});
 }
 out.cases.O1_orderOnReentryBranch={results,same:JSON.stringify(results[0].separateBreaks)===JSON.stringify(results[1].separateBreaks)&&results[0].ret===results[1].ret&&results[0].runsAhead===results[1].runsAhead&&results[0].strengthAhead===results[1].strengthAhead};}
console.log(JSON.stringify(out,null,1));
