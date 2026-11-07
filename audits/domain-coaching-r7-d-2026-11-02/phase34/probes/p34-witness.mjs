// R7-D Phase 3.4: the before/after witness (SSCTR-P33-F01 under the Founder's direction A; the correction and late-evidence paths of a return that
// read separate breaks), run on a runtime root. Weeks 0-1 executed and reviewed. The fixture plans strength Mon (day 0) and Fri (4), runs Tue (1) and
// Thu (3), the long run Sun (6). Day n counts from Mon of week 2 (day 0). A = weeks 2-3, a 14-day holiday, kept by a fatigue report on Mon wk4.
//   P1      the Founder's case: weeks 4-5 every run done, the Friday strength session missed each week; D = Mon-Thu wk6 (bulk, named, a plain review).
//   P2      the same with an easy run missed each week (strength complete).                P3  three weeks, the Friday strength missed.
//   P4      one week (wk4), every run done, Friday strength missed; D = Mon-Thu wk5.         P5  one week in full, strength logged without RIR.
//   P6      the late form: weeks 2-3 not done and reviewed; weeks 4-5 reviewed with the Friday strength missed; A declared Mon wk6; D Wed-Sat wk6.
//   C1      after P1's return, a plain review on Sat wk6 (late-evidence check).            C2  after P1's return, a named correction of D (+1 day).
//   C3      F1 (one easy run between A and a Thu-Sun wk4 trip), its return, then a named correction of the trip (+1 day).
//   Controls (unchanged by the phase): F1 isolated run; X1 one run in a three-week gap; X2 both sports partial; E1 two complete weeks; V4 weekly
//   reviews between; K3 A applied when stated; CL a clinical A with a run-complete week between.
// RED (the defect): P1-P6 restart or hold running through the stop while a whole week of the plan was executed in one sport; C1 asks again; C2/C3
// drop the earlier break from a correction's stop.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
//   node p34-witness.mjs <root holding CoachingCore> [--label <name>]
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.'),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram,elig}=L;
const GEN={id:'p34-witness',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const fresh=()=>({p:program(GEN),ledger:[],ref:null}),copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const weekObs=(p,w,f=(q,s)=>obs(q,s))=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const base0=(()=>{const t=fresh();for(const w of [0,1])step(t,w,{observations:weekObs(t.p,w)});return t;})(),base=()=>copy(base0),s2=base0.p.weeks[2].startDate,day=n=>addDays(s2,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to)=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip'});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay(),friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const noRir=(p,s)=>{const o=obs(p,s);if(o.actual.exercises)o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(({rir,...x})=>x)}));return o;};
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`)).slice(0,3);
function view(r,t,w,d){
 const ret=r.action==='REESTABLISH'?returns(t.p).at(-1).interruption:null,from=addDays(t.p.weeks[w].startDate,d),ahead=runsAhead(t.p,w,from);
 return {status:r.status,action:r.action,question:r.question?.kind??null,missing:r.missingInputs??[],
  ...(ret?{ret:`${ret.class} ${ret.days}d ${ret.startDate}..${ret.endDate}`,cls:ret.class,days:ret.days,returnStart:ret.startDate,relation:ret.relation,runMode:ret.entry?.run?.mode??null,
   separateBreaks:ret.separateBreaks?.map(b=>`${b.episode} ${b.startDate}..${b.endDate} ${b.stop}${b.ownReturn?` own=${b.ownReturn.class}/${b.ownReturn.days} RUN:${b.ownReturn.reentered.RUN??'-'} STRENGTH:${b.ownReturn.reentered.STRENGTH??'-'}`:''}${b.reentryWeek?' reentry '+b.reentryWeek:''}`)??null}:{}),
  runsAhead:ahead.join(' '),qualityAhead:ahead.slice(0,3).some(x=>QUALITY.some(q=>x.startsWith(q+':'))),maxRunAhead:Math.max(0,...ahead.map(x=>Number(x.split(':').at(-1)))),strengthAhead:strengthAhead(t.p,w,from).join(' ')};
}
const out={probe:'R7D-P34-WITNESS',runtime:label,cases:{}};
function bulk(id,weeks,dw,report){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d=trip(dw*7-14,dw*7-11);
 step(t,dw,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,d,dw,r:step(t,dw,{day:4,hour:'08:00:00'})};
}
const C=out.cases,V=(x)=>view(x.r,x.t,x.dw,6);
const p1=bulk('p1',[4,5],6,miss(friStrength));C.P1_foundersCase=V(p1);
C.P2_easyRunMissedEachWeek=V(bulk('p2',[4,5],6,miss(tueRun)));
C.P3_threeWeeksFridayStrengthMissed=V(bulk('p3',[4,5,6],7,miss(friStrength)));
C.P4_oneWeekRunsDoneFridayStrengthMissed=V(bulk('p4',[4],5,miss(friStrength)));
C.P5_oneWeekFullNoRir=V(bulk('p5',[4],5,(p,s)=>s.sport==='STRENGTH'?noRir(p,s):obs(p,s)));
{const t=base();for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});for(const w of [4,5])step(t,w,{observations:weekObs(t.p,w,miss(friStrength))});
 step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'p6-A',kind:'SYSTEMIC_FATIGUE'}});
 const before=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date<day(30));
 step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:'p6-D'},event:{id:'p6-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
 C.P6_lateFormReviewedWeeks=view(step(t,7,{day:0,hour:'07:00:00'}),t,7,1);}
// C1, C2: after P1's return.
{const t=copy(p1.t),sat=step(t,6,{day:5,hour:'09:00:00'});C.C1_reviewAfterReturn={action:sat.action,status:sat.status,question:sat.question?.kind??null,missing:sat.missingInputs??[]};
 const c2=copy(p1.t),r=step(c2,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'p1-D'},event:{id:'p1-D2',kind:'RETURN_AFTER_PAUSE'}});C.C2_correctionAfterOwnReturn=view(r,c2,6,6);}
// C3 and F1: one easy run between A and a Thu-Sun wk4 trip.
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'f1-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'f1-D'},event:{id:'f1-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 C.F1_isolatedRun=view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2);
 const r=step(t,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(17,21),episodeId:'f1-D'},event:{id:'f1-D2',kind:'RETURN_AFTER_PAUSE'}});C.C3_correctionAfterContinuity=view(r,t,5,2);}
C.X1_oneRunInThreeWeekGap=V(bulk('x1',[4,5,6],7,(p,s)=>s.sport==='RUN'&&dow(s)===2&&s.date>=day(21)&&s.date<=day(27)?obs(p,s):notDone(p,s)));
C.X2_bothSportsPartial=V(bulk('x2',[4,5],6,miss(s=>tueRun(s)||friStrength(s))));
C.E1_twoCompleteWeeks=V(bulk('e1',[4,5],6,(p,s)=>obs(p,s)));
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'v4-A',kind:'SYSTEMIC_FATIGUE'}});
 for(const w of [4,5])step(t,w,{observations:weekObs(t.p,w,miss(friStrength))});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'v4-D'},event:{id:'v4-D',kind:'LOCAL_FATIGUE'}});
 C.V4_weeklyReviewsBetween=view(step(t,6,{day:4,hour:'08:00:00'}),t,6,6);}
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,13),event:{id:'k3-A',kind:'RETURN_AFTER_PAUSE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 C.K3_appliedWhenStated=view(step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(17,20),observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))}),t,5,2);}
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13,{reasonCategory:'ILLNESS',reason:'Flu',nonclinical:false}),event:{id:'cl-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weekObs(t.p,4,miss(friStrength));
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'cl-D'},event:{id:'cl-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,5,{day:4,hour:'08:00:00'});C.CL_clinicalEarlierBreak={status:r.status,action:r.action,proposal:r.proposal===null?null:'PRESENT',returnsApplied:returns(t.p).length};}
// The verdict.
const ownReturn=c=>(c?.separateBreaks??[]).some(b=>/ OWN_RETURN /.test(b+' ')),restart=c=>c?.cls==='LONG'||c?.runMode==='RESTART';
const keptEarlier=c=>(c?.separateBreaks??[]).some(b=>/^p1-A |^f1-A /.test(b));
out.verdict={
 P1_noRestart:!restart(C.P1_foundersCase)&&C.P1_foundersCase.cls==='SHORT'&&ownReturn(C.P1_foundersCase),
 P2toP6_ownReturn:['P2_easyRunMissedEachWeek','P3_threeWeeksFridayStrengthMissed','P4_oneWeekRunsDoneFridayStrengthMissed','P5_oneWeekFullNoRir','P6_lateFormReviewedWeeks'].every(k=>ownReturn(C[k])&&C[k].cls==='SHORT'),
 C1_noSpuriousQuestion:C.C1_reviewAfterReturn.action!=='ASK',
 C2_correctionKeepsEarlier:C.C2_correctionAfterOwnReturn.action==='REESTABLISH'&&keptEarlier(C.C2_correctionAfterOwnReturn),
 C3_correctionKeepsEarlier:C.C3_correctionAfterContinuity.action==='REESTABLISH'&&keptEarlier(C.C3_correctionAfterContinuity)&&C.C3_correctionAfterContinuity.returnStart===day(0),
 controls:{F1_continuity:C.F1_isolatedRun.returnStart===day(0),X1_continuity:C.X1_oneRunInThreeWeekGap.cls==='LONG',X2_residualContinuity:C.X2_bothSportsPartial.cls==='LONG',E1_reentry:(C.E1_twoCompleteWeeks.separateBreaks??[]).some(b=>/TRAINING_AFTER/.test(b)),CL_clinical:C.CL_clinicalEarlierBreak.status==='CLINICAL_HUMAN_REQUIRED'}};
out.verdict.RED=!(out.verdict.P1_noRestart&&out.verdict.P2toP6_ownReturn&&out.verdict.C1_noSpuriousQuestion&&out.verdict.C2_correctionKeepsEarlier&&out.verdict.C3_correctionKeepsEarlier);
out.verdict.controlsHold=Object.values(out.verdict.controls).every(Boolean);
console.log(JSON.stringify(out,null,1));
