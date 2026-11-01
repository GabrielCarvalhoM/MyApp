// QE-R7B2 judge probe Q4 (request REVIEW Q4): can the precedence point (clinicalRoute) and the handlers' own screens read a report differently, can
// it route a report the handler would not route (a false clinical route), and can it fire before admission? For a grid of substitution and
// interruption payloads (flag spellings, free texts, exercise ids, categories, clinical flags), each payload is evaluated on both runtimes in:
//  FRESH   a plain program with no return, no late evidence, no prior report id: the handler reaches its own screen (the reference);
//  STALE   the K6 re-entry week with the late pre-break report (staleReturn decides first on FREEZE-2);
//  SAMEID  a return report resent under the event id of a recorded nonclinical return (CAND-02; interruption payloads only);
// and a set of not-admitted reviews carrying a clinical substitution. Expected on R7-B.2: FRESH identical to FREEZE-2 (screens moved verbatim);
// STALE/SAMEID clinical exactly when FRESH is clinical, with the same reason; otherwise identical to FREEZE-2. Read-only (dual.mjs).
import {NOW,PRED,snap,diff,write,reentry,at,apply} from './dual.mjs';

const PAIN=[true,false,'yes','YES',' yes ','Sí','si','sim','y','1',1,0,'0','no','maybe',null,undefined,{},[],'true','TRUE','n','nao'];
const INJ=[true,'yes',1,false,'no',null,'maybe'];
const TEXTS=[undefined,'','My knee hurts','no pain at all','pain free','I dislike it',"didn't feel any pain until I ran",'tendinite no joelho','I feel dizzy','sore muscles','it is boring','Dolor en la rodilla','sprained ankle','not injured, just bored','C-section recovery'];
const IDS=X=>[['X',X],['empty string',''],['number',7],['null',null],['missing',undefined]];
function subPayloads(X){
 const out=[];
 for(const p of PAIN)for(const [idn,id] of IDS(X))out.push({label:`pain=${JSON.stringify(p)} id=${idn}`,s:{exerciseId:id,reason:'SKILL_MISMATCH',pain:p}});
 for(const j of INJ)out.push({label:`injury=${JSON.stringify(j)}`,s:{exerciseId:X,reason:'SKILL_MISMATCH',injury:j}});
 for(const t of TEXTS){out.push({label:`text=${JSON.stringify(t)}`,s:{exerciseId:X,reason:'SKILL_MISMATCH',text:t}});out.push({label:`text=${JSON.stringify(t)} nonclinical confirmed`,s:{exerciseId:X,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:t}});}
 for(const [n,v] of [['substitution string','pain'],['substitution array',[{exerciseId:X,pain:true}]],['substitution null',null]])out.push({label:n,raw:v});
 return out;
}
const CATS=[undefined,null,'WORK','TRAVEL','FAMILY','INJURY','ILLNESS','illness',' Injury ','MEDICAL','PREGNANCY','OTHER_NONCLINICAL','POSTPARTUM'];
const CFLAGS=[undefined,true,false,'yes','no','maybe',1,0];
const REASONS=['Work travel','Flu illness','knee pain','no pain','',null,'sick','family visit','travel, no injury'];
function intPayloads(){
 const out=[];
 for(const c of CATS)for(const f of CFLAGS)out.push({label:`category=${JSON.stringify(c)} clinicalReason=${JSON.stringify(f)}`,i:{reasonCategory:c,clinicalReason:f,reason:'Work travel',nonclinical:true}});
 for(const r of REASONS)for(const n of [true,false,undefined])out.push({label:`reason=${JSON.stringify(r)} nonclinical=${JSON.stringify(n)}`,i:{reason:r,nonclinical:n}});
 for(const [n,v] of [['interruption string','flu'],['interruption array',[{reason:'Flu illness'}]]])out.push({label:n,raw:v});
 return out;
}
function scenario(rt){
 const {reviewed,review,evaluateProgram,opts,addDays}=rt.H,res={sub:[],int:[],admission:[]};
 const fresh=reviewed({id:'qe-q4f',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const e=reentry(rt,'qe-q4s');
 // SAMEID: a nonclinical WORK return recorded in week 3 of another program; payloads resent under its id on day 4.
 const s=reviewed({id:'qe-q4i',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(s.p.weeks[3].startDate,3),first={startDate:s.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(s.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});apply(s,evaluateProgram(s.p,{...r0,actualLedger:s.ledger},opts));
 for(const p of subPayloads(e.X)){
  const x={kind:'EXERCISE_SUBSTITUTION',substitution:p.raw!==undefined?p.raw:p.s};
  res.sub.push({label:p.label,fresh:snap(rt,at(rt,fresh,3,x,{day:1})),stale:snap(rt,at(rt,e.t,3,{...x,observations:[e.lateObs]}))});
 }
 for(const p of intPayloads()){
  const i=p.raw!==undefined?p.raw:{...first,...p.i,startDate:undefined,endDate:undefined,days:1};
  const x={kind:'RETURN_AFTER_PAUSE',interruption:i};
  const rv=review(s.p,3,{day:4,hour:'06:00:00',...x});
  res.int.push({label:p.label,fresh:snap(rt,at(rt,fresh,3,x,{day:1})),stale:snap(rt,at(rt,e.t,3,{...x,observations:[e.lateObs]})),sameId:snap(rt,evaluateProgram(s.p,{...rv,event:{...rv.event,id:r0.event.id},actualLedger:s.ledger},opts))});
 }
 // Not admitted (contract §4 class a): a clinical substitution in the K6 state with an admission check failing.
 const pain={kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:e.X,reason:'SKILL_MISMATCH',pain:true},observations:[e.lateObs]};
 const base=review(e.t.p,3,{day:4,hour:'06:00:00',...pain});
 const elig=base.eligibility,old=addDays(base.asOf.slice(0,10),-30);
 const goodState=at(rt,e.t,3,{observations:[e.lateObs]},{hour:'05:00:00'}).referenceState;
 for(const [n,mut] of [['eligibility missing',r=>({...r,eligibility:null})],['eligibility 30 days old',r=>({...r,eligibility:{...elig,assessedAt:old}})],["eligibility flag 'no' (not boolean)",r=>({...r,eligibility:{...elig,pain:'no'}})],
  ['eligibility status unknown',r=>({...r,eligibility:{...elig,status:'UNKNOWN'}})],['review version wrong',r=>({...r,version:'R6-REVIEW-0'})],['not synthetic',r=>({...r,synthetic:false})],['asOf outside the week',r=>({...r,asOf:`${addDays(e.t.p.weeks[3].startDate,9)}T06:00:00Z`})],
  ['event kind unknown',r=>({...r,event:{...r.event,kind:'PAIN_REPORT'}})],['reference state tampered',r=>({...r,referenceState:{...goodState,asOf:goodState.asOf}})&&{...r,referenceState:{...goodState,pending:null}}],
  ['reference state pending ASK (valid)',r=>({...r,referenceState:goodState})],['observations not a list',r=>({...r,observations:'x'})],['choices not a list',r=>({...r,choices:'LADDER_STEP'})],['athlete model malformed',r=>({...r,athleteModel:{athleteId:'someone-else'}})],
  ['eligibility flag pain:true (eligibility route)',r=>({...r,eligibility:{...elig,pain:true}})]]){
  const r=evaluateProgram(e.t.p,{...mut(base),actualLedger:e.t.ledger},opts);
  res.admission.push({case:n,...snap(rt,r)});
 }
 return res;
}
const A=scenario(PRED),B=scenario(NOW);
const C=s=>s.status==='CLINICAL_HUMAN_REQUIRED';
const subRows=B.sub.map((b,k)=>{const a=A.sub[k];
 const freshSame=!diff(a.fresh,b.fresh).length;
 const consistent=C(b.stale)===C(b.fresh)&&(!C(b.fresh)||b.stale.reason===b.fresh.reason&&b.stale.proposal===null&&b.stale.pending?.status==='CLINICAL_HUMAN_REQUIRED');
 const unchangedIfNonclinical=C(b.fresh)||!diff(a.stale,b.stale).length;
 return {label:b.label,ok:freshSame&&consistent&&unchangedIfNonclinical,freshClinical:C(b.fresh),freshSame,staleR7b2:b.stale.status,staleFreeze2:a.stale.status,consistent,unchangedIfNonclinical,freshStatus:b.fresh.status,freshReason:String(b.fresh.reason).slice(0,90)};});
const intRows=B.int.map((b,k)=>{const a=A.int[k];
 const freshSame=!diff(a.fresh,b.fresh).length,staleSame=!diff(a.stale,b.stale).length;
 const consistent=C(b.sameId)===C(b.fresh)&&(!C(b.fresh)||b.sameId.reason===b.fresh.reason&&b.sameId.proposal===null)&&C(b.stale)===C(b.fresh)&&(!C(b.fresh)||b.stale.reason===b.fresh.reason);
 const unchangedIfNonclinical=C(b.fresh)||!diff(a.sameId,b.sameId).length;
 return {label:b.label,ok:freshSame&&staleSame&&consistent&&unchangedIfNonclinical,freshClinical:C(b.fresh),freshSame,staleSame,sameIdR7b2:b.sameId.status,sameIdFreeze2:a.sameId.status,consistent,unchangedIfNonclinical,freshStatus:b.fresh.status,freshReason:String(b.fresh.reason).slice(0,90)};});
const admRows=B.admission.map((b,k)=>({case:b.case,same:!diff(A.admission[k],b).length,differs:diff(A.admission[k],b),status:b.status,reason:String(b.reason).slice(0,100),missing:b.missingInputs}));
const summary={substitution:{payloads:subRows.length,ok:subRows.filter(r=>r.ok).length,freshClinical:subRows.filter(r=>r.freshClinical).length,changedOnStale:subRows.filter(r=>r.staleR7b2!==r.staleFreeze2).length,failed:subRows.filter(r=>!r.ok)},
 interruption:{payloads:intRows.length,ok:intRows.filter(r=>r.ok).length,freshClinical:intRows.filter(r=>r.freshClinical).length,changedOnSameId:intRows.filter(r=>r.sameIdR7b2!==r.sameIdFreeze2).length,failed:intRows.filter(r=>!r.ok)},
 admission:{cases:admRows.length,identical:admRows.filter(r=>r.same).length,changed:admRows.filter(r=>!r.same),statuses:admRows.map(r=>r.case+': '+r.status)}};
write('q4-screen-fuzz',{summary,subRows,intRows,admRows});
console.log(JSON.stringify(summary,null,1));
