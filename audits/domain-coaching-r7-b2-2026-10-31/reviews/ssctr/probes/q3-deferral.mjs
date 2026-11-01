// R7B2-SSCTR-r1 probe Q3 (SSCTR judge, read-only): after the clinical route of QE-R7B2-01 (S5R2: a return resent under its own event id with
// "Flu illness", in a review that also corrects week 4's strength reports), is the correction's effect deferred or dropped once the clinical
// route is resolved? The runtime has no clearance input (a pending CLINICAL_HUMAN_REQUIRED is sticky: previousValidity/withReference), so
// "resolved" is modelled as the only way the runtime resumes: a later review that carries no clinical signal and no pending clinical state.
// Paths, each on a fresh copy of the same S5R state, on both runtimes (dual.mjs: NOW = R7B2-FREEZE-1, PRED = R7B1-FREEZE-2):
//   A  no correction ever (week 5 and 6 reviewed as executed)
//   B  the correction reported at once in a nonclinical weekly-kind review (the factual re-plan proposes and is applied)
//   C  S5R2 applied, then resolved: a day-1 review of week 5 with no signal and no reference state, then weeks 5 and 6 reviewed
//   Cr S5R2 applied, then a day-1 review that resends the same correction rows (same event ids), no reference state
//   Cs S5R2 applied, then a day-1 review carrying S5R2's reference state (pending CLINICAL)
//   D  pre-existing control: S5R4 (the same report under a NEW id with "Flu illness" + the same correction), then resolved as in C
// Measured: status/proposal of every step; per week 5..11 the prescriptions (session id, prescription, status); the canonical HistoricalState
// (historicalStateOf) after the clinical step, to show whether the corrected facts stand in the record later reviews read. Writes ./out only.
import {NOW,PRED,BAD,correctionOf,apply,write} from './dual.mjs';

const presc=wk=>JSON.stringify(wk.sessions.map(s=>[s.id,s.prescription??null,s.status??null]));
const brief=wk=>wk.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>s.sport==='STRENGTH'?s.id+':'+(s.prescription.exercises??[]).map(e=>`${e.id} ${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`).join(','):s.id+':'+s.role+' '+(s.prescription.durationMinutes??'-')+'min').join(' | ');
function state(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,addDays}=rt.H;
 const t=reviewed({id:'qe-s5r',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));
 weekly(t,3);weekly(t,4);
 const when=`${t.p.weeks[5].startDate}T05:00:00Z`;
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
 return {t,r0,first,fixes};
}
const illness=(rt,S,id)=>{const {review,evaluateProgram,opts}=rt.H;const rv=review(S.t.p,5,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...S.first,reasonCategory:null,reason:'Flu illness'},observations:structuredClone(S.fixes)});return evaluateProgram(S.t.p,{...rv,event:{...rv.event,id},actualLedger:S.t.ledger},opts);};
const step=r=>({status:r.status,action:r.action,proposal:r.proposal?r.proposal.hash:null,pending:r.referenceState?.pending?.status??null,planValidity:r.planValidity?.status??null,reason:String(r.reason??'').slice(0,160)});
const weeksOf=t=>t.p.weeks.slice(5).map(presc);
const hist=(rt,t,asOf)=>{const h=rt.A.historicalStateOf(t.p,{asOf,actualLedger:t.ledger},rt.H.opts);return h?rt.V.hash({strength:h.strength,run:h.run}):null;};
function path(rt,name){
 const S=state(rt),{t}=S,{review,evaluateProgram,opts,weekly}=rt.H,steps=[],snaps={};
 const afterClinicalAsOf=`${t.p.weeks[5].startDate}T07:00:00Z`;
 snaps.histBefore=hist(rt,t,afterClinicalAsOf);
 if(name==='B'){steps.push(['correction (weekly kind, day 0)',step(apply(t,evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:structuredClone(S.fixes)}),actualLedger:t.ledger},opts)))]);}
 if(['C','Cr','Cs','D'].includes(name)){
  const r=illness(rt,S,name==='D'?'qe-s5r-new':S.r0.event.id);steps.push([name==='D'?'S5R4 new-id illness + correction':'S5R2 same-id illness + correction',step(r)]);
  const ledgerHasCorrection=(r.actualLedger??[]).some(o=>o.correctionOf);apply(t,r);snaps.ledgerHasCorrection=ledgerHasCorrection;
  snaps.histAfterClinical=hist(rt,t,afterClinicalAsOf);snaps.weeksRightAfterClinical=weeksOf(t);
  const nx=review(t.p,5,{day:1,hour:'06:00:00',...(name==='Cr'?{observations:structuredClone(S.fixes)}:{})});
  const r2=evaluateProgram(t.p,{...nx,...(name==='Cs'?{referenceState:r.referenceState}:{}),actualLedger:t.ledger},opts);
  steps.push([name==='Cr'?'day-1 review resending the same correction rows, no reference state':name==='Cs'?'day-1 review carrying the clinical reference state':'day-1 review, no signal, no reference state (resolved)',step(r2)]);
  if(name!=='Cs')apply(t,r2);
 }
 if(name==='Cs')return {name,steps,snaps};
 snaps.week5BeforeExecution=brief(t.p.weeks[5]);
 const w5=weekly(t,5);steps.push(['weekly review of week 5 (executed as planned)',step(w5)]);snaps.afterWeek5=weeksOf(t);snaps.week6Brief=brief(t.p.weeks[6]);
 const w6=weekly(t,6);steps.push(['weekly review of week 6 (executed as planned)',step(w6)]);snaps.afterWeek6=weeksOf(t);snaps.week7Brief=brief(t.p.weeks[7]);
 snaps.week5Executed=brief(t.p.weeks[5]);
 return {name,steps,snaps};
}
const cmp=(x,y)=>x&&y?x.map((wk,k)=>wk!==y[k]?k+5:null).filter(k=>k!==null):null;
const out={};
for(const rt of [NOW,PRED]){
 const P=Object.fromEntries(['A','B','C','Cr','Cs','D'].map(n=>[n,path(rt,n)]));
 out[rt.label]={
  paths:Object.fromEntries(Object.entries(P).map(([k,v])=>[k,{steps:v.steps,ledgerHasCorrection:v.snaps.ledgerHasCorrection??null,histBefore:v.snaps.histBefore,histAfterClinical:v.snaps.histAfterClinical??null,week5BeforeExecution:v.snaps.week5BeforeExecution??null,week5Executed:v.snaps.week5Executed??null,week6Brief:v.snaps.week6Brief??null,week7Brief:v.snaps.week7Brief??null}])),
  correctionReadInCanonicalState:{C:P.C.snaps.histAfterClinical!==P.C.snaps.histBefore,D:P.D.snaps.histAfterClinical!==P.D.snaps.histBefore},
  weeksDiffer:{
   'C vs A after week-5 review (does the withheld correction change anything later?)':cmp(P.C.snaps.afterWeek5,P.A.snaps.afterWeek5),
   'C vs A after week-6 review':cmp(P.C.snaps.afterWeek6,P.A.snaps.afterWeek6),
   'C vs B after week-5 review (is the correction fully recovered?)':cmp(P.C.snaps.afterWeek5,P.B.snaps.afterWeek5),
   'C vs B after week-6 review':cmp(P.C.snaps.afterWeek6,P.B.snaps.afterWeek6),
   'C vs D after week-5 review (B.2 same-id path vs the pre-existing new-id clinical path)':cmp(P.C.snaps.afterWeek5,P.D.snaps.afterWeek5),
   'C vs D after week-6 review':cmp(P.C.snaps.afterWeek6,P.D.snaps.afterWeek6),
   'Cr vs C after week-6 review (resending the correction)':cmp(P.Cr.snaps.afterWeek6,P.C.snaps.afterWeek6),
   'B vs A after week-5 review (what the correction changes when applied)':cmp(P.B.snaps.afterWeek5,P.A.snaps.afterWeek5),
   'B vs A after week-6 review':cmp(P.B.snaps.afterWeek6,P.A.snaps.afterWeek6)
  },
  _snaps:Object.fromEntries(Object.entries(P).map(([k,v])=>[k,{afterWeek5:v.snaps.afterWeek5?.map(x=>NOW.V.hash(x))??null,afterWeek6:v.snaps.afterWeek6?.map(x=>NOW.V.hash(x))??null}]))
 };
}
// Cross-runtime: path C on FREEZE-2 is the predecessor behaviour (the re-plan attached to the identity question and applied).
out.crossRuntime={
 'C: R7B2 vs FREEZE-2 after week-5 review':out['R7B2-FREEZE-1']._snaps.C.afterWeek5.map((h,k)=>h!==out['R7B1-FREEZE-2']._snaps.C.afterWeek5[k]?k+5:null).filter(x=>x!==null),
 'C on R7B2 vs B on R7B2 equals FREEZE-2 C vs B?':null,
 'A, B, D identical across runtimes':['A','B','D'].map(n=>[n,JSON.stringify(out['R7B2-FREEZE-1']._snaps[n])===JSON.stringify(out['R7B1-FREEZE-2']._snaps[n])])
};
write('q3-deferral',out);
for(const [label,o] of Object.entries(out).filter(([k])=>k!=='crossRuntime')){
 console.log('== '+label);
 for(const [k,v] of Object.entries(o.paths))console.log(k,JSON.stringify(v.steps.map(([n,s])=>n+': '+s.status+(s.proposal?' +proposal':'')+' pending='+s.pending)),'ledgerHasCorrection='+v.ledgerHasCorrection);
 console.log('correctionReadInCanonicalState',JSON.stringify(o.correctionReadInCanonicalState));
 for(const [k,v] of Object.entries(o.weeksDiffer))console.log(' ',k,JSON.stringify(v));
}
console.log(JSON.stringify(out.crossRuntime));
