// R7-D Phase 3.3: the SSCTR-P32-F01 witness (phase32/reviews/ssctr/probes/q4-between-breaks.mjs TB1-TB4, q4b-long-then-session.mjs), run on a
// runtime root. Weeks 0-1 executed and reviewed. The fixture plans strength Mon (day 0) and Fri (4), runs Tue (1) and Thu (3), the long run Sun (6).
//   F1-F4  A = weeks 2-3 (14-day holiday) kept by a fatigue report on Mon wk4; gap Mon-Wed wk4; D = Thu-Sun wk4 (4-day trip) named on its own
//          with the gap reported; a plain review Tue wk5. F1 the Tue easy run only; F2 every gap session; F3 the Mon strength session only;
//          F4 a 5-minute aborted run only.
//   F5     A = 30 days (Mon wk2 - Tue wk6), the Thu wk6 run between, D = Sat wk6 - Tue wk7.
//   F6     the late form: weeks 2-3 reported not done and reviewed, week 4 reviewed with its Tue run only; A (weeks 2-3) declared late, D = Wed-Sat
//          wk5 named on its own (with the Mon-Tue wk5 sessions reported not done); a plain review Mon wk6.
//   K1-K3  comparators: the 21 days declared once; nothing trained between (every gap session not done); A applied by a return report when
//          stated, then the gap sessions as re-planned, then D by a return report (the existing episode rule).
//   E1-E4  re-entry controls: E1 weeks 4 and 5 executed in full, reported with D (Mon-Thu wk6); E2 week 4 in full, D Mon-Thu wk5; E3 the late form
//          with week 4 executed in full and reviewed; E4 week 4 with its long run not done (an incomplete week), D Mon-Thu wk5.
// RED (the defect): F1-F6 return from D alone (the stop starts on D's first day; A listed TRAINING_AFTER).
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
//   node f01-witness.mjs <root holding CoachingCore> [--label <name>]
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.'),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=L;
const GEN={id:'p33-f01',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const fresh=()=>({p:program(GEN),ledger:[],ref:null}),copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const weekObs=(p,w,f=(q,s)=>obs(q,s))=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const trained=weeks=>{const t=fresh();for(const w of weeks)step(t,w,{observations:weekObs(t.p,w)});return t;};
const base=trained([0,1]),s2=base.p.weeks[2].startDate,day=n=>addDays(s2,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to)=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip'});
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`);
function view(r,t,w,d){
 const ret=r.action==='REESTABLISH'?returns(t.p).at(-1).interruption:null,ahead=runsAhead(t.p,w,addDays(t.p.weeks[w].startDate,d));
 return {status:r.status,action:r.action,validity:r.planValidity?.status,question:r.question?.kind??null,missing:r.missingInputs,
  ...(ret?{ret:`${ret.class} ${ret.days}d ${ret.startDate}..${ret.endDate}`,returnStart:ret.startDate,separateBreaks:ret.separateBreaks?.map(b=>`${b.episode} ${b.startDate}..${b.endDate} ${b.stop}`)??null}:{}),
  runsAhead:ahead.join(' '),qualityAhead:ahead.some(x=>QUALITY.some(q=>x.startsWith(q+':'))),maxRunAhead:Math.max(0,...ahead.map(x=>Number(x.split(':').at(-1))))};
}
const out={probe:'R7D-P33-F01-WITNESS',runtime:label,cases:{}};
// F1-F4, and K2 (nothing trained between).
const A=brk(0,13),D=trip(17,20),gapOf=p=>p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
const gapCase=(id,report)=>{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=gapOf(t.p);step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>report(t.p,s))});
 return {gap:gap.map(s=>`${s.date} ${s.sport} ${s.prescription.durationMinutes}`),result:view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2)};};
out.cases.F1_oneEasyRun=gapCase('f1',(p,s)=>s.sport==='RUN'?obs(p,s):notDone(p,s));
out.cases.F2_everyGapSession=gapCase('f2',(p,s)=>obs(p,s));
out.cases.F3_oneStrengthSession=gapCase('f3',(p,s)=>s.sport==='STRENGTH'?obs(p,s):notDone(p,s));
out.cases.F4_abortedFiveMinuteRun=gapCase('f4',(p,s)=>s.sport==='RUN'?obs(p,s,{actual:{completed:false,minutes:5}}):notDone(p,s));
out.cases.K2_nothingBetween=gapCase('k2',notDone);
// F5: 30 days, one run, 4 days.
{const t=copy(base),A5=brk(0,29,{reason:'Long holiday'}),D5=trip(33,36);
 step(t,6,{day:2,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A5,event:{id:'f5-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date>=day(30)&&s.date<=day(32));
 step(t,7,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D5,episodeId:'f5-D'},event:{id:'f5-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 out.cases.F5_thirtyDaysOneRun={gap:gap.map(s=>`${s.date} ${s.sport} ${s.prescription.durationMinutes}`),result:view(step(t,7,{day:3,hour:'07:00:00'}),t,7,4)};
 const once=copy(base);out.cases.K1b_thirtySevenDaysOnce=view(step(once,7,{day:3,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,36,{reason:'Long holiday then work trip'})}),once,7,4);}
// F6 and E3: the late form. Weeks 2-3 reported not done and reviewed; week 4 reviewed (F6: its Tue run only; E3: in full); A declared late on Mon
// wk5 by a fatigue report; D = Wed-Sat wk5 named on its own, declared Sun wk5; a plain review Mon wk6.
const late=(id,week4)=>{const t=copy(base);for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});step(t,4,{observations:weekObs(t.p,4,week4)});
 step(t,5,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const before=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date<day(23));
 step(t,5,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(23,26),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
 return view(step(t,6,{day:0,hour:'07:00:00'}),t,6,1);};
out.cases.F6_lateOneRunInReviewedWeek=late('f6',(p,s)=>s.sport==='RUN'&&s.date===day(15)?obs(p,s):notDone(p,s));
out.cases.E3_lateCompleteReviewedWeek=late('e3',(p,s)=>obs(p,s));
// K1: the 21 days declared once. K3: A applied by a return report when stated, then the gap as re-planned, then D by a return report.
{const once=copy(base);out.cases.K1_twentyOneDaysOnce=view(step(once,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,20,{reason:'Holiday then work trip'})}),once,5,2);}
{const c=copy(base),ra=step(c,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A,event:{id:'k3-A',kind:'RETURN_AFTER_PAUSE'}});
 const gap=gapOf(c.p),a=returns(c.p).at(-1)?.interruption;
 const r=step(c,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:D,observations:gap.map(s=>s.sport==='RUN'?obs(c.p,s):notDone(c.p,s))});
 out.cases.K3_appliedWhenStatedThenRunThenTrip={aReturn:a?`${a.class} ${a.days}d`:ra.action,gapAfterReturn:gap.map(s=>`${s.date} ${s.sport} ${s.prescription.durationMinutes}`),result:view(r,c,5,2)};}
// E1, E2, E4: A kept on Mon wk4; the weeks between executed and reported with D (a bulk sync, no review between); a plain review the next day.
const bulk=(id,weeks,dw,keep=()=>true)=>{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>weekObs(t.p,w,(p,s)=>keep(s)?obs(p,s):notDone(p,s))),Dk=trip(dw*7-14,dw*7-11);
 step(t,dw,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...Dk,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return view(step(t,dw,{day:5,hour:'07:00:00'}),t,dw,6);};
out.cases.E1_twoCompleteWeeks=bulk('e1',[4,5],6);
out.cases.E2_oneCompleteWeek=bulk('e2',[4],5);
out.cases.E4_weekWithoutItsLongRun=bulk('e4',[4],5,s=>!(s.sport==='RUN'&&s.role==='LONG'));
// The verdict: the earlier break has no decision effect (the return starts on D's first day, A listed TRAINING_AFTER).
const alone=(c,dStart)=>c?.action==='REESTABLISH'&&c.returnStart===dStart&&(c.separateBreaks??[]).some(b=>b.endsWith(' TRAINING_AFTER'));
const C=out.cases;
out.verdict={F1:alone(C.F1_oneEasyRun.result,D.startDate),F2:alone(C.F2_everyGapSession.result,D.startDate),F3:alone(C.F3_oneStrengthSession.result,D.startDate),F4:alone(C.F4_abortedFiveMinuteRun.result,D.startDate),
 F5:alone(C.F5_thirtyDaysOneRun.result,day(33)),F6:alone(C.F6_lateOneRunInReviewedWeek,day(23)),
 reentryRecognized:{E1:alone(C.E1_twoCompleteWeeks,day(28)),E2:alone(C.E2_oneCompleteWeek,day(21)),E3:alone(C.E3_lateCompleteReviewedWeek,day(23))},incompleteWeekE4:alone(C.E4_weekWithoutItsLongRun,day(21))};
out.verdict.RED=['F1','F2','F3','F4','F5','F6'].some(k=>out.verdict[k]);
console.log(JSON.stringify(out,null,1));
