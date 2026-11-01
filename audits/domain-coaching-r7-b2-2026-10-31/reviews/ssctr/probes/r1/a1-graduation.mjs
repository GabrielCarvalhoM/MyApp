// R7B2-SSCTR-r1-A1 probe (SSCTR judge, session 6, addendum): the graduation-withdrawal family of Quality's QR7B2-01 (groups B, B2, D), rebuilt
// independently from the public fixture helpers. For each case on both runtimes, each applying its own result:
//  - the decision (status, proposal, its action, disclosure ids, pending);
//  - the run-quality sessions still ahead in the plan in force after the step (count, the first dates, the families), and the date of the next
//    review the probe sends;
//  - follow-ups: the next review carrying the step's reference state (sticky?); the next review with no signal and no reference state (does it
//    re-derive the withdrawal?), applied, then the quality sessions ahead again;
//  - whether R7-B.2's plan after that next review equals FREEZE-2's plan after its own step and next review, for sessions after the next review;
//  - the pre-existing analog: the handler's own clinical route with the same correction (new-id illness return; pain without the late report).
// Cases: B  same-id "Flu illness" resend + week-3 long-run correction (adverse response), re-entry week 4, day 4
//        B2 the week after: week 5 day 0, + week-4 long-run correction
//        D  late pre-break strength report + substitution pain + week-4 long-run correction, re-entry week 5, day 4
// Read-only on both trees (dual.mjs); writes only ./out/a1-graduation.json.
import {NOW,PRED,BAD,correctionOf,apply,write} from './dual.mjs';
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'];
const GRAD={goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const GRADS={goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH'],weeks:16};
function runAll(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,program}=rt.H,out={};
 const ev=(p,rv,ledger,ref=null)=>evaluateProgram(p,{...rv,actualLedger:ledger,...(ref?{referenceState:ref}:{})},opts);
 const corr=(t,w,pred,when)=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
 const qAhead=(p,after)=>p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='RUN'&&s.date>after&&QUALITY.includes(s.prescription.family));
 const runsAfter=(p,after)=>JSON.stringify(p.weeks.flatMap(w=>w.sessions).filter(s=>s.date>after).map(s=>[s.id,s.date,s.prescription??null,s.status??null]));
 const S=r=>({status:r.status,action:r.action,proposal:!!r.proposal,proposalAction:r.proposal?.decisions?.at(-1)?.action??null,disclosures:(r.disclosures??[]).map(d=>d.id),pending:r.referenceState?.pending?.status??null,planValidity:r.planValidity?.status??null,reason:String(r.reason??'').slice(0,150)});
 const returnFirst=(t,w,repDay)=>{const rep=addDays(t.p.weeks[w].startDate,repDay),first={startDate:t.p.weeks[w].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const rv=review(t.p,w,{day:repDay,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});const r=apply(t,ev(t.p,rv,t.ledger));if(r.action!=='REESTABLISH')throw new Error(rt.label+' return: '+r.status);return {first,id:rv.event.id,rep};};
 const follow=(name,t,stepRv,next)=>{ // apply the step, then the follow-ups
  const step=ev(t.p,stepRv,t.ledger),stepDay=stepRv.asOf.slice(0,10);
  const a={p:t.p,ledger:t.ledger};apply(a,step);
  const q1=qAhead(a.p,stepDay);
  const withRef=ev(a.p,next(a.p),a.ledger,step.referenceState);
  const nrv=next(a.p),noRef=ev(a.p,nrv,a.ledger),nextDay=nrv.asOf.slice(0,10);
  const b={p:a.p,ledger:a.ledger};apply(b,noRef);
  const q2=qAhead(b.p,stepDay);
  out[name]={step:S(step),stepDay,graduationOnRecordAfterStep:!!a.p.canonical.athlete.runGraduation,
   qualityAheadAfterStep:{count:q1.length,firstDates:q1.slice(0,4).map(s=>s.date+' '+s.prescription.family+' '+s.prescription.durationMinutes+'min'),
    beforeNextReview:q1.filter(s=>s.date<nextDay||s.date===nextDay).map(s=>s.date)},
   nextReviewDay:nextDay,nextWithReference:S(withRef),nextWithoutReference:S(noRef),
   qualityAheadAfterNext:{count:q2.length},graduationOnRecordAfterNext:!!b.p.canonical.athlete.runGraduation,
   _planAfterNext:runsAfter(b.p,nextDay),_planAfterStep:runsAfter(a.p,nextDay)};
 };
 // B and B2: same-id resend x graduation withdrawal.
 {const t=reviewed({...GRAD,id:'ssctr-a1-b'},4);if(!t.p.canonical.athlete.runGraduation)throw new Error(rt.label+': GRAD did not graduate');
  const R=returnFirst(t,4,3),when=`${addDays(R.rep,1)}T05:00:00Z`,long=s=>s.role==='LONG',fix=corr(t,3,long,when);
  const resend=(p,w,day,observations,id=R.id)=>{const rv=review(p,w,{day,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...R.first,reasonCategory:null,reason:'Flu illness'},observations});return id?{...rv,event:{...rv.event,id}}:rv;};
  const nextB=p=>review(p,4,{day:5,hour:'06:00:00'});
  follow('B same-id illness + w3 long correction',t,resend(t.p,4,4,fix),nextB);
  follow('B-ctl new-id illness + w3 long correction (handler route)',t,resend(t.p,4,4,fix,null),nextB);
  follow('B-ctl2 correction alone, weekly (no clinical signal)',t,review(t.p,4,{day:4,hour:'06:00:00',observations:fix}),nextB);
  const t2={p:t.p,ledger:t.ledger};weekly(t2,4);const when2=`${t2.p.weeks[5].startDate}T05:00:00Z`,fix2=corr(t2,4,long,when2);
  const nextB2=p=>review(p,5,{day:1,hour:'06:00:00'});
  follow('B2 same-id illness + w4 long correction (week 5)',t2,resend(t2.p,5,0,fix2),nextB2);
  follow('B2-ctl new-id illness + w4 long correction',t2,resend(t2.p,5,0,fix2,null),nextB2);
  // B2w3: Quality's B2 group form: in week 5, the correction of a graduation qualifying week (week 3's long run).
  out._qualifyingWeeks=t.p.canonical.athlete.runGraduation.qualifyingWeeks.map(q=>q.week);
  const fix3=corr(t2,3,long,when2);
  follow('B2w3 same-id illness + w3 long correction (week 5)',t2,resend(t2.p,5,0,fix3),nextB2);
  follow('B2w3-ctl new-id illness + w3 long correction',t2,resend(t2.p,5,0,fix3,null),nextB2);
  // B3: the exposure window. The route comes the day before the first THRESHOLD session (week 6 day 0); the next review comes after it (day 2),
  // with the session not reported, or reported executed as planned (the athlete trained on the plan in force before any admitted review).
  const t3={p:t2.p,ledger:t2.ledger};weekly(t3,5);const day6=t3.p.weeks[6].startDate,when3=`${day6}T05:00:00Z`,fix6=corr(t3,3,long,when3);
  for(const [name,id] of [['B3 same-id illness + w3 long correction (week 6 day 0)',R.id],['B3-ctl new-id illness + w3 long correction',null]]){
   const step=ev(t3.p,resend(t3.p,6,0,fix6,id),t3.ledger);const a={p:t3.p,ledger:t3.ledger};apply(a,step);
   const q=qAhead(a.p,day6),thr=q[0];
   const noRep=ev(a.p,review(a.p,6,{day:2,hour:'06:00:00'}),a.ledger);
   const rep=ev(a.p,review(a.p,6,{day:2,hour:'06:00:00',observations:thr?[obs(a.p,thr)]:[]}),a.ledger);
   const b={p:a.p,ledger:a.ledger};apply(b,rep);
   out[name]={step:S(step),stepDay:day6,qualityAheadAfterStep:{count:q.length,first:thr?thr.date+' '+thr.prescription.family+' '+thr.prescription.durationMinutes+'min':null},
    nextDay:addDays(day6,2),thresholdBeforeNextReview:!!thr&&thr.date<addDays(day6,2),
    nextNoReport:S(noRep),nextWithThresholdExecuted:S(rep),qualityAheadAfterNext:qAhead(b.p,addDays(day6,2)).length,
    thresholdKeptAsHistory:!!thr&&b.p.weeks.flatMap(w=>w.sessions).some(s=>s.id===thr.id&&s.prescription?.family===thr.prescription.family),
    _planAfterNext:'',_planAfterStep:''};
  }}
 // D: late-evidence exit x graduation withdrawal.
 {const t={p:program({...GRADS,id:'ssctr-a1-d'}),ledger:[]};for(let w=0;w<4;w++)weekly(t,w);
  const late=t.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,4,{keep:s=>s.id!==late.id});
  if(!t.p.canonical.athlete.runGraduation)throw new Error(rt.label+': GRADS did not graduate');
  const R=returnFirst(t,5,3),lateObs=obs(t.p,late),when=`${addDays(R.rep,1)}T05:00:00Z`,fix=corr(t,4,s=>s.role==='LONG',when);
  const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>R.rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const pain=(p,observations)=>review(p,5,{day:4,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations});
  const nextD=p=>review(p,5,{day:4,hour:'21:00:00'});
  follow('D late + pain + w4 long correction',t,pain(t.p,[...fix,lateObs]),nextD);
  follow('D-ctl pain + w4 long correction, no late (handler route)',t,pain(t.p,fix),nextD);
  follow('D-ctl2 late + w4 long correction, no signal',t,review(t.p,5,{day:4,hour:'06:00:00',observations:[...fix,lateObs]}),nextD);}
 return out;
}
const a=runAll(PRED),b=runAll(NOW);
const qualifyingWeeks={freeze2:a._qualifyingWeeks,r7b2:b._qualifyingWeeks};delete a._qualifyingWeeks;delete b._qualifyingWeeks;
const window=Object.keys(a).filter(k=>k.startsWith('B3')).map(k=>{const {_planAfterNext:x1,_planAfterStep:x2,...x}=a[k],{_planAfterNext:y1,_planAfterStep:y2,...y}=b[k];delete a[k];delete b[k];return {case:k,sameOnBothRuntimes:JSON.stringify(x)===JSON.stringify(y),freeze2:x,r7b2:y};});
console.log('qualifying weeks',JSON.stringify(qualifyingWeeks));
for(const r of window)console.log('\n== '+r.case+(r.sameOnBothRuntimes?'  [SAME on both]':'  [DIFFERS]')+'\n'+['freeze2','r7b2'].map(s=>{const z=r[s];return ' '+s+' step '+z.step.status+(z.step.proposal?' +P':'')+' disc='+JSON.stringify(z.step.disclosures)+' | qAhead '+z.qualityAheadAfterStep.count+' first '+z.qualityAheadAfterStep.first+' beforeNext('+z.nextDay+')='+z.thresholdBeforeNextReview+' | next no report: '+z.nextNoReport.status+(z.nextNoReport.proposal?' +P':'')+' disc='+JSON.stringify(z.nextNoReport.disclosures)+' | next with threshold executed: '+z.nextWithThresholdExecuted.status+(z.nextWithThresholdExecuted.proposal?' +P':'')+' disc='+JSON.stringify(z.nextWithThresholdExecuted.disclosures)+' | qAheadAfter '+z.qualityAheadAfterNext+' executedKept='+z.thresholdKeptAsHistory;}).join('\n'));
const rows=Object.keys(a).map(k=>{const x=a[k],y=b[k];const strip=o=>{const {_planAfterNext,_planAfterStep,...r}=o;return r;};
 return {case:k,sameOnBothRuntimes:JSON.stringify(strip(x))===JSON.stringify(strip(y))&&x._planAfterNext===y._planAfterNext,
  r7b2PlanAfterNextEqualsFreeze2PlanAfterNext:y._planAfterNext===x._planAfterNext,
  r7b2PlanAfterNextEqualsFreeze2PlanAfterStep:y._planAfterNext===x._planAfterStep,
  freeze2:strip(x),r7b2:strip(y)};});
write('a1-graduation',{qualifyingWeeks,rows,window});
for(const r of rows){const x=r.freeze2,y=r.r7b2;console.log('\n== '+r.case+(r.sameOnBothRuntimes?'  [SAME on both]':'  [DIFFERS]'));
 for(const [l,z] of [['F2',x],['B2',y]])console.log(' '+l+' step '+z.step.status+(z.step.proposal?' +P('+z.step.proposalAction+')':'')+' disc='+JSON.stringify(z.step.disclosures)+' pend='+z.step.pending+' | qAhead '+z.qualityAheadAfterStep.count+' first '+JSON.stringify(z.qualityAheadAfterStep.firstDates)+' beforeNext='+JSON.stringify(z.qualityAheadAfterStep.beforeNextReview)+' | next('+z.nextReviewDay+') ref:'+z.nextWithReference.status+' noRef:'+z.nextWithoutReference.status+(z.nextWithoutReference.proposal?' +P('+z.nextWithoutReference.proposalAction+')':'')+' disc='+JSON.stringify(z.nextWithoutReference.disclosures)+' | qAheadAfterNext '+z.qualityAheadAfterNext.count+' grad='+z.graduationOnRecordAfterNext);
 console.log(' B2 plan after next == F2 plan after next: '+r.r7b2PlanAfterNextEqualsFreeze2PlanAfterNext+' ; == F2 plan after step: '+r.r7b2PlanAfterNextEqualsFreeze2PlanAfterStep);}
