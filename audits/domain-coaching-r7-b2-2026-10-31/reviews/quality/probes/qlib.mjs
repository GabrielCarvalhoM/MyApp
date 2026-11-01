// R7B2-QUALITY-r1 probe library (narrow Quality judge, R7-B.2 U4b). Builds on the verbatim copy of the Engineering judge's dual.mjs in this folder
// (NOW = R7B2-FREEZE-1 worktree bytes, PRED = R7B1-FREEZE-2 from git archive 146ebb8 in a temp dir outside the repository). Read-only on both
// trees; writes only ./out/<probe>.json through dual.mjs's write().
import {NOW,PRED,BAD,correctionOf,apply,write} from './dual.mjs';
export {NOW,PRED,BAD,correctionOf,apply,write};
// Fields a §5 route change may differ in: the route itself (status, action, reason, question, missing inputs), its proposal and what only a
// proposal carries (horizons, counterfactuals, instantiationOnly), the pending/reference state the route sets, and the route's own screen/scope.
export const ROUTE_KEYS=['status','action','reason','missingInputs','question','proposal','horizons','counterfactuals','instantiationOnly','referenceState','planValidity','screen','scope','nextObservation'];
/** Every top-level field of one evaluateProgram result, hashed (so any change anywhere is seen), plus readable route fields. */
export function full(rt,r){
 const h=x=>x===undefined?'<undefined>':rt.V.hash(x),keys={};
 for(const k of Object.keys(r).sort())keys[k]=h(r[k]);
 return {status:r.status,action:r.action,reason:r.reason??null,proposal:r.proposal?r.proposal.hash:null,pending:r.referenceState?.pending?.status??null,
  disclosureIds:(r.disclosures??[]).map(d=>d.id),ledgerSize:(r.actualLedger??[]).length,corrections:(r.actualLedger??[]).filter(o=>o.correctionOf).map(o=>o.eventId),keys};
}
/** Which top-level fields differ between the two runtimes' results. */
export const keyDiff=(a,b)=>[...new Set([...Object.keys(a.keys),...Object.keys(b.keys)])].filter(k=>a.keys[k]!==b.keys[k]).sort();
/**
 * The contract §5 / §7 G4 classification of one row:
 * - SAME: every field identical;
 * - S5_I: a nonclinical question with no proposal (FREEZE-2) -> CLINICAL_HUMAN_REQUIRED with no proposal and pending clinical (R7-B.2), nothing
 *   else different (inside §5);
 * - S5_II: the QE-R7B2-01 shape: a nonclinical question carrying a proposal -> CLINICAL_HUMAN_REQUIRED with no proposal, nothing but route and
 *   proposal fields different (outside §5, the reopened class);
 * - OTHER: anything else (a finding).
 */
export function classify(f2,b2){
 const d=keyDiff(f2,b2);if(!d.length)return {cls:'SAME',differs:d,outsideRoute:[]};
 const outsideRoute=d.filter(k=>!ROUTE_KEYS.includes(k));
 const toClinical=f2.status==='ASK'&&f2.action==='ASK'&&b2.status==='CLINICAL_HUMAN_REQUIRED'&&b2.action==='CLINICAL_HUMAN_REQUIRED'&&!b2.proposal&&b2.pending==='CLINICAL_HUMAN_REQUIRED';
 if(toClinical&&!outsideRoute.length)return {cls:f2.proposal?'S5_II':'S5_I',differs:d,outsideRoute};
 return {cls:'OTHER',differs:d,outsideRoute};
}
export const presc=wk=>JSON.stringify(wk.sessions.map(s=>[s.id,s.prescription??null,s.status??null]));
/** Weeks whose prescriptions differ between two programs. */
export const weeksDiffering=(p,q)=>p.weeks.map((wk,k)=>presc(wk)!==presc(q.weeks[k])?k:null).filter(k=>k!==null);
/** Run one scenario on both runtimes with the same call sequence, and pair the rows. */
export function dual(scenario){
 const a=scenario(PRED),b=scenario(NOW);
 if(a.length!==b.length)throw new Error('row count differs: '+a.length+' vs '+b.length);
 return a.map((x,i)=>{const y=b[i];if(x.name!==y.name)throw new Error('row order differs at '+i);const c=classify(x.f,y.f);
  return {name:x.name,cls:c.cls,differs:c.differs,outsideRoute:c.outsideRoute,meta:x.meta??null,
   freeze2:{status:x.f.status,action:x.f.action,proposal:x.f.proposal,pending:x.f.pending,disclosureIds:x.f.disclosureIds,reason:x.f.reason},
   r7b2:{status:y.f.status,action:y.f.action,proposal:y.f.proposal,pending:y.f.pending,disclosureIds:y.f.disclosureIds,reason:y.f.reason},
   ledgerEqual:x.f.keys.actualLedger===y.f.keys.actualLedger,modelEqual:x.f.keys.updatedModel===y.f.keys.updatedModel,
   correctionsRecorded:{freeze2:x.f.corrections.length,r7b2:y.f.corrections.length},
   appliedWeeksDiffering:x.applied&&y.applied?weeksDiffering(x.applied,y.applied):null,extra:{freeze2:x.extra??null,r7b2:y.extra??null}};});
}
export function counts(rows){const c={};for(const r of rows)c[r.cls]=(c[r.cls]??0)+1;return c;}
export const choiceShapes={
 none:undefined,empty:[],ladder:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],declined:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],
 accepted:[{offer:'RUN_QUALITY_GRADUATION',decision:'ACCEPT'}],mainChange:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'db-front-squat',reason:'PREFERENCE'}],
 unrecognised:[{type:'SOMETHING_ELSE'}],nullEntry:[null],stringEntry:['LADDER_STEP']
};
