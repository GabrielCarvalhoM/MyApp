// QE engineering check R7-D Phase 3 (independent judge): DX-02 / carrier probes. Read-only on the runtime it is given.
//   node qe-dx02.mjs <root holding CoachingCore>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const H=await imp('r7/b/fixtures/helpers.mjs');
const {REVIEW_KINDS}=await imp('src/r6-adaptation.mjs');
const {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram}=H;
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const GEN={id:'qe-dx02',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const out={};
const ev=(t,w,x={},extra={})=>evaluateProgram(t.p,{...review(t.p,w,x),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...extra},opts);
const adopt=(t,r)=>{t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const weekObs=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s));
const fresh=()=>{const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1,2])adopt(t,ev(t,w,{observations:weekObs(t.p,w)}));return t;};
const BASE=fresh();
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true});
const executedMax=t=>Math.max(...t.ledger.filter(o=>o.context?.sport==='RUN'&&o.actual?.completed).map(o=>o.actual.minutes));
const runsAhead=(p,w,from)=>[...runs(p,w),...(p.weeks[w+1]?runs(p,w+1):[])].filter(s=>s.date>=from).map(s=>({id:s.id,family:s.prescription.family,min:s.prescription.durationMinutes}));
const brief=r=>({status:r.status,action:r.action,validity:r.planValidity?.status,missing:r.missingInputs??[],question:r.question?.kind??null});
const ceiling=executedMax(BASE);out.executedMaxBeforeBreak=ceiling;

// E1. Re-sent interruption: the break applied by a weekly review, then the same interruption sent again with the next weekly review (a client
// that keeps the field), compared with the same re-send as a return report and with a plain review.
{
 const t=copy(BASE),brk=BREAK(t.p),r0=adopt(t,ev(t,5,{day:1,hour:'07:00:00',interruption:brk}));
 const doneW5=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date>=addDays(t.p.weeks[5].startDate,1)).map(s=>obs(t.p,s));
 const variants={PLAIN_REVIEW:{},REVIEW_RESENDS_BREAK:{interruption:brk},RETURN_RESENDS_BREAK:{kind:'RETURN_AFTER_PAUSE',interruption:brk}};
 const res={};
 for(const [k,x] of Object.entries(variants)){const c=copy(t),r=adopt(c,ev(c,5,{observations:doneW5,...x}));res[k]={...brief(r),gates:r.gates??null,week6:runsAhead(c.p,6,c.p.weeks[6].startDate).filter(s=>s.id.startsWith('w6'))};}
 out.E1_resentBreak={first:brief(r0),...res};
}
// E2. Malformed interruption values: string, array, null, {} and an object with no usable field, on a weekly review and on a return report.
{
 const res={};
 for(const [label,v] of [['string','vacation'],['array',[BREAK(BASE.p)]],['empty',{}],['noFields',{note:'away'}],['onlyReason',{reasonCategory:'VACATION',reason:'Holiday',nonclinical:true}]])
  for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){const c=copy(BASE),r=ev(c,5,{day:1,hour:'07:00:00',kind,interruption:v});res[label+'/'+kind]={...brief(r),maxRunAheadW5:Math.max(0,...runsAhead(r.proposal??c.p,5,addDays(c.p.weeks[5].startDate,1)).filter(s=>s.id.startsWith('w5')).map(s=>s.min))};}
 out.E2_malformedInterruption=res;
}
// E3 (flagged behaviour 2). A break declared with a clinical flag and no question pending: clinical; after a qualified clearance (the client drops
// the clinical continuation state, keeps the record), a plain review two days later. The same through the return report carrier.
{
 const res={};
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){
  const t=copy(BASE),brk=BREAK(t.p),d1=addDays(t.p.weeks[5].startDate,1);
  const r1=adopt(t,ev(t,5,{day:1,hour:'07:00:00',kind,interruption:brk,eligibility:{...elig(d1),illness:true}}));
  t.ref=null; // qualified clearance
  const r2=adopt(t,ev(t,5,{day:2,hour:'07:00:00'}));
  const ahead=runsAhead(t.p,5,addDays(t.p.weeks[5].startDate,2));
  res[kind]={declare:brief(r1),afterClearance:{...brief(r2),runsAhead:ahead,maxAhead:Math.max(...ahead.map(s=>s.min)),aboveExecutedMax:ahead.filter(s=>s.min>ceiling).map(s=>s.id+':'+s.min),quality:ahead.filter(s=>!['EASY','LONG','RECOVERY','EASY_CONVERSATIONAL'].includes(s.family)).map(s=>s.id+':'+s.family)}};
 }
 // Control: the same plain review with no break declared at all (silence over weeks 3-4).
 const c=copy(BASE),r=adopt(c,ev(c,5,{day:2,hour:'07:00:00'})),ahead=runsAhead(c.p,5,addDays(c.p.weeks[5].startDate,2));
 res.SILENCE_CONTROL={...brief(r),maxAhead:Math.max(...ahead.map(s=>s.min)),runsAhead:ahead};
 out.E3_breakWithClinicalFlagThenClearance=res;
}
// E4 (flagged behaviour 5). Another kind declares the break: asked. Then the athlete does not re-send it; a plain review two days later.
{
 const res={};
 for(const [kind,extra] of [['SCHEDULE_CHANGE',{changes:{strengthDays:[0,3]}}],['SYSTEMIC_FATIGUE',{}],['MISSED_SESSION',{}],['GOAL_CHANGE',{changes:{goals:{run:'GENERAL',strength:'GENERAL'}}}],['EVENT_DATE_CHANGE',{changes:{eventDate:'2027-01-24'}}],['LOCAL_FATIGUE',{}],['EQUIPMENT_CHANGE',{changes:{equipment:['DUMBBELLS','BENCH']}}]]){
  const t=copy(BASE),brk=BREAK(t.p);
  const r1=adopt(t,ev(t,5,{day:1,hour:'07:00:00',kind,interruption:brk,...extra}));
  const ahead1=runsAhead(t.p,5,addDays(t.p.weeks[5].startDate,1));
  const r2=adopt(t,ev(t,5,{day:2,hour:'07:00:00'}));
  const ahead2=runsAhead(t.p,5,addDays(t.p.weeks[5].startDate,2));
  res[kind]={declare:{...brief(r1),proposal:!!r1.proposal,pendingKept:r1.referenceState?.pending?.missingInputs??null,maxAhead:Math.max(0,...ahead1.map(s=>s.min))},nextPlainReview:{...brief(r2),maxAhead:Math.max(0,...ahead2.map(s=>s.min)),aboveExecutedMax:ahead2.filter(s=>s.min>ceiling).map(s=>s.id+':'+s.min)}};
 }
 out.E4_otherKindThenPlainReview=res;
}
// E5. Every review kind with a nonclinical break and no question pending: never a VALID plan whose runs ahead in the break-return week exceed the
// run executed before the break (a stale dose); clinical reason on every kind routes clinically.
{
 const res={};
 for(const kind of REVIEW_KINDS){
  const t=copy(BASE),brk=BREAK(t.p),r=ev(t,5,{day:1,hour:'07:00:00',kind,interruption:brk}),p=r.proposal??t.p;
  const ahead=runsAhead(p,5,addDays(t.p.weeks[5].startDate,1)).filter(s=>s.id.startsWith('w5'));
  const ill=ev(copy(BASE),5,{day:1,hour:'07:00:00',kind,interruption:{...brk,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}});
  res[kind]={...brief(r),validAbove:r.planValidity?.status===VALID?ahead.filter(s=>s.min>ceiling).map(s=>s.id+':'+s.min):[],clinicalReason:ill.status};
 }
 out.E5_everyKind=res;
}
// E6. A break in the past, followed by reported and reviewed training: declared later through each carrier.
{
 const t={p:program({...GEN,id:'qe-dx02-past'}),ledger:[],ref:null};
 for(const w of [0,1,2])adopt(t,ev(t,w,{observations:weekObs(t.p,w)}));
 adopt(t,ev(t,3,{observations:[]}));
 for(const w of [4,5])adopt(t,ev(t,w,{observations:weekObs(t.p,w)}));
 const brk={startDate:t.p.weeks[3].startDate,endDate:addDays(t.p.weeks[3].startDate,6),days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
 const res={};
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){const c=copy(t),r=ev(c,6,{day:1,hour:'07:00:00',kind,interruption:brk});res[kind]={...brief(r),runsW6:runsAhead(r.proposal??c.p,6,addDays(c.p.weeks[6].startDate,1)).filter(s=>s.id.startsWith('w6'))};}
 res.sameDecision=JSON.stringify(res.WEEKLY_REVIEW.runsW6)===JSON.stringify(res.RETURN_AFTER_PAUSE.runsW6)&&res.WEEKLY_REVIEW.action===res.RETURN_AFTER_PAUSE.action;
 out.E6_pastBreakAfterTraining=res;
}
// E7. Closed history: the weekly-review return keeps past sessions and the decision history (session prescriptions before the review's day).
{
 const t=copy(BASE),r=ev(t,5,{day:1,hour:'07:00:00',interruption:BREAK(t.p)}),day=addDays(t.p.weeks[5].startDate,1);
 const before=new Map(t.p.weeks.flatMap(w=>w.sessions).map(s=>[s.id,JSON.stringify(s.prescription??null)+s.status]));
 const changedPast=(r.proposal?.weeks??[]).flatMap(w=>w.sessions).filter(s=>s.date<day&&before.get(s.id)!==JSON.stringify(s.prescription??null)+s.status).map(s=>s.id);
 const hist=JSON.stringify(r.proposal?.decisions.slice(0,t.p.decisions.length))===JSON.stringify(t.p.decisions);
 out.E7_closedHistory={status:r.status,pastSessionsChanged:changedPast,decisionHistoryPrefixKept:hist,recordedKind:r.proposal?.decisions.at(-1)?.kind??r.proposal?.decisions.at(-1)?.eventKind??null,eventId:r.proposal?.decisions.at(-1)?.eventId??null};
}
console.log(JSON.stringify(out,null,1));
