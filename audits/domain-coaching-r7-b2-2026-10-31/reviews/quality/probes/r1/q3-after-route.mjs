// R7B2-QUALITY-r1 Q3: truthfulness of the clinical route that replaces a question carrying the factual state's proposal, and what a later review
// with no clinical signal does with the recorded correction. Each runtime applies its own result (ledger, and the proposal if any) and continues.
//  T  QE-R7B2-01 (S5R2): output fields of the R7-B.2 route against the handler's own route for the same report under a new id (S5R4)
//  PA factual re-plan source (same-id illness + week-4 strength correction): next review mid-week (no signal, no reference state), the same with
//     the reference state, then the weekly review of the complete week; control PA0: the same review never sent (the correction never reported)
//  PB graduation-withdrawal source, same-id exit (GRAD, re-entry week): next review mid-week, with and without the reference state
//  PD graduation-withdrawal source, late-evidence exit (strength program graduating at week 4): next review mid-week
//  Pre-existing analogs on both runtimes (the handler's own clinical route with the same correction, identical on FREEZE-2 and R7-B.2):
//  XA substitution pain + week-4 strength correction; XB new-id illness return + week-3 long-run correction; XD pain + week-4 long-run correction
//  without the late report.
// Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node q3-after-route.mjs
import {NOW,PRED,BAD,correctionOf,apply,write,full,diff} from './qr1.mjs';
const W12={id:'q-q3',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
const GRAD={goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const GRADS={goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH'],weeks:16};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'];
function scenario(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,program}=rt.H,out={};
 const V=rt.A,ev=(p,rv,ledger,ref=null)=>evaluateProgram(p,{...rv,actualLedger:ledger,...(ref?{referenceState:ref}:{})},opts);
 const corr=(t,w,pred,when)=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
 const quality=(p,from)=>p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='RUN'&&s.date>from&&QUALITY.includes(s.prescription.family)).length;
 const sum=r=>{const f=full(rt,r);return {status:f.status,action:f.action,proposal:!!f.proposal,proposalAction:f.proposalAction,disclosureIds:f.disclosureIds,pending:f.pending?.status??null,reason:String(f.reason).slice(0,170)};};
 const returnFirst=(t,w,repDay)=>{const rep=addDays(t.p.weeks[w].startDate,repDay),first={startDate:t.p.weeks[w].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const rv=review(t.p,w,{day:repDay,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});apply(t,ev(t.p,rv,t.ledger));return {first,id:rv.event.id,rep};};
 const resend=(t,w,day,first,id,observations,x={})=>{const rv=review(t.p,w,{day,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...first,reasonCategory:null,reason:'Flu illness'},observations,...x});return id?{...rv,event:{...rv.event,id}}:rv;};
 const copy=t=>({p:t.p,ledger:t.ledger});

 // ---------- T + PA + XA (factual re-plan source) ----------
 {const t=reviewed({...W12,id:'q-q3-a'},3),R=returnFirst(t,3,3);weekly(t,3);weekly(t,4);
  const when=`${t.p.weeks[5].startDate}T05:00:00Z`,fix=corr(t,4,s=>s.sport==='STRENGTH',when),day0=t.p.weeks[5].startDate;
  const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const route=ev(t.p,resend(t,5,0,R.first,R.id,fix),t.ledger),newId=ev(t.p,resend(t,5,0,R.first,null,fix),t.ledger);
  const ctl=ev(t.p,review(t.p,5,{day:0,hour:'06:00:00',observations:fix}),t.ledger);// the correction alone: the factual re-plan
  const corrRows=(route.actualLedger??[]).filter(o=>o.correctionOf),supersededRows=(route.actualLedger??[]).filter(o=>o.superseded);
  const fr=full(rt,route),fn=full(rt,newId);
  out.T={route:{status:route.status,action:route.action,reason:route.reason,proposal:route.proposal??null,horizons:route.horizons??null,disclosures:route.disclosures??[],counterfactuals:route.counterfactuals??[],missingInputs:route.missingInputs??[],question:route.question??null,planValidity:route.planValidity?.status??null,pending:route.referenceState?.pending??null,referenceProgramIsSource:route.referenceState?.programHash===t.p.hash},
   correctionRecorded:{correctionRows:corrRows.length,supersededOriginals:supersededRows.length,expected:fix.length},
   sameAsHandlerRouteForNewId:{reason:route.reason===newId.reason,status:route.status===newId.status,fieldsDifferingFromNewIdRoute:diff(fr,fn)},
   factualReplanOfTheCorrectionAlone:{status:ctl.status,proposal:!!ctl.proposal,changedSessions:ctl.horizons?.H0_SESSION??null}};
  // PA: each runtime applies its own S5R2 result and goes on.
  const a=copy(t);apply(a,route);
  const nextMid=ev(a.p,review(a.p,5,{day:1,hour:'06:00:00'}),a.ledger);
  const nextMidRef=ev(a.p,review(a.p,5,{day:1,hour:'06:00:00'}),a.ledger,route.referenceState);
  const sameAsReplan=JSON.stringify(a.p.weeks.slice(5).map(w=>w.sessions.map(s=>[s.id,s.prescription])))===JSON.stringify((ctl.proposal??t.p).weeks.slice(5).map(w=>w.sessions.map(s=>[s.id,s.prescription])));
  const h=V.historicalStateOf(a.p,{asOf:`${addDays(day0,1)}T06:00:00Z`,actualLedger:a.ledger},opts),h0=V.historicalStateOf(t.p,{asOf:`${addDays(day0,1)}T06:00:00Z`,actualLedger:t.ledger},opts);
  const wk5=weekly(a,5);
  // PA0: the same history with the correction never reported, then the same weekly review.
  const z=copy(t);const wk5z=weekly(z,5);
  out.PA={planInForceEqualsTheFactualReplan:sameAsReplan,nextMidweek:sum(nextMid),nextMidweekWithReferenceState:sum(nextMidRef),
   historicalDiffersFromNoCorrection:JSON.stringify(h.state)!==JSON.stringify(h0.state),
   weeklyOfWeek5:{status:wk5.status,action:wk5.action,reason:String(wk5.reason).slice(0,140)},weeklyOfWeek5_noCorrection:{status:wk5z.status,action:wk5z.action},
   week6StartDiffersFromNoCorrection:JSON.stringify(a.p.stateTrace[6])!==JSON.stringify(z.p.stateTrace[6]),
   week6PrescriptionsDifferFromNoCorrection:JSON.stringify(a.p.weeks[6].sessions.map(s=>s.prescription))!==JSON.stringify(z.p.weeks[6].sessions.map(s=>s.prescription))};
  // XA: the pre-existing handler route with the same correction (identical on both runtimes), applied, then the next review.
  const xa=copy(t),xr=ev(xa.p,review(xa.p,5,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:fix}),xa.ledger);apply(xa,xr);
  out.XA={route:sum(xr),nextMidweek:sum(ev(xa.p,review(xa.p,5,{day:1,hour:'06:00:00'}),xa.ledger)),planInForceEqualsTheFactualReplan:JSON.stringify(xa.p.weeks.slice(5).map(w=>w.sessions.map(s=>[s.id,s.prescription])))===JSON.stringify((ctl.proposal??t.p).weeks.slice(5).map(w=>w.sessions.map(s=>[s.id,s.prescription])))};}

 // ---------- PB + XB (graduation withdrawal, same-id exit) ----------
 {const t=reviewed({...GRAD,id:'q-q3-b'},4),R=returnFirst(t,4,3),when=`${addDays(R.rep,1)}T05:00:00Z`,fix=corr(t,3,s=>s.role==='LONG',when),from=addDays(R.rep,1);
  const route=ev(t.p,resend(t,4,4,R.first,R.id,fix),t.ledger);
  const b=copy(t);apply(b,route);
  const nb=ev(b.p,review(b.p,4,{day:5,hour:'06:00:00'}),b.ledger),nbRef=ev(b.p,review(b.p,4,{day:5,hour:'06:00:00'}),b.ledger,route.referenceState);
  const b2=copy(b);apply(b2,nb);
  out.PB={route:sum(route),qualityAheadAfterRoute:quality(b.p,from),graduationOnRecordAfterRoute:!!b.p.canonical.athlete.runGraduation,
   nextMidweek:sum(nb),qualityAheadAfterNext:quality(b2.p,from),graduationOnRecordAfterNext:!!b2.p.canonical.athlete.runGraduation,nextMidweekWithReferenceState:sum(nbRef)};
  const xb=copy(t),xr=ev(xb.p,resend(t,4,4,R.first,null,fix),xb.ledger);apply(xb,xr);
  const xn=ev(xb.p,review(xb.p,4,{day:5,hour:'06:00:00'}),xb.ledger);const xb2=copy(xb);apply(xb2,xn);
  out.XB={route:sum(xr),qualityAheadAfterRoute:quality(xb.p,from),nextMidweek:sum(xn),qualityAheadAfterNext:quality(xb2.p,from)};}

 // ---------- PD + XD (graduation withdrawal, late-evidence exit) ----------
 {const t={p:program({...GRADS,id:'q-q3-d'}),ledger:[]};for(let w=0;w<4;w++)weekly(t,w);
  const late=t.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,4,{keep:s=>s.id!==late.id});
  const R=returnFirst(t,5,3),lateObs=obs(t.p,late),when=`${addDays(R.rep,1)}T05:00:00Z`,fix=corr(t,4,s=>s.role==='LONG',when),from=addDays(R.rep,1);
  const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>R.rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const pain=observations=>review(t.p,5,{day:4,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations});
  const route=ev(t.p,pain([...fix,lateObs]),t.ledger);
  const d=copy(t);apply(d,route);
  const nd=ev(d.p,review(d.p,5,{day:4,hour:'21:00:00'}),d.ledger),ndRef=ev(d.p,review(d.p,5,{day:4,hour:'21:00:00'}),d.ledger,route.referenceState);
  const d2=copy(d);apply(d2,nd);
  out.PD={route:sum(route),lateRecorded:(route.actualLedger??[]).some(o=>o.sessionId===late.id&&!o.superseded),correctionRecorded:(route.actualLedger??[]).filter(o=>o.correctionOf).length,
   qualityAheadAfterRoute:quality(d.p,from),nextMidweek:sum(nd),qualityAheadAfterNext:quality(d2.p,from),nextMidweekWithReferenceState:sum(ndRef)};
  const xd=copy(t),xr=ev(xd.p,pain(fix),xd.ledger);apply(xd,xr);
  const xn=ev(xd.p,review(xd.p,5,{day:4,hour:'21:00:00'}),xd.ledger);const xd2=copy(xd);apply(xd2,xn);
  out.XD={route:sum(xr),qualityAheadAfterRoute:quality(xd.p,from),nextMidweek:sum(xn),qualityAheadAfterNext:quality(xd2.p,from)};}
 return out;
}
const res={freeze2:scenario(PRED),r7b2:scenario(NOW)};
write('q3-after-route',res);
console.log(JSON.stringify(res,null,1));
