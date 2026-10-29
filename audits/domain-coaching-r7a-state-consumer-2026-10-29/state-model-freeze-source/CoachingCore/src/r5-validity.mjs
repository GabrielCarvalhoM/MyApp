import {clone,hash} from './value.mjs';
import {dateValid,daysBetween} from './r5-contract.mjs';
const pendingStatuses=['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'];
export function previousValidity(program,review){
 const state=review.referenceState;if(!state)return null;
 const {hash:digest,...body}=state;
 if(state.version!=='R5-REFERENCE-STATE-1'||state.athleteId!==program.athleteId||digest!==hash(body)||!dateValid(state.asOf)||Date.parse(state.asOf)>Date.parse(review.asOf))return {status:'HOLD',reason:'Reference state integrity/ownership/clock is invalid'};
 if(!state.pending)return null;
 if(state.pending.status==='CLINICAL_HUMAN_REQUIRED')return {status:'CLINICAL_HUMAN_REQUIRED',reason:'Prior clinical dependency remains outside this nonclinical reference; no automatic clearance'};
 // Retry the actual dependent request with corrected facts; a generic label is not an answer.
 if(review.event?.kind===state.pending.eventKind&&review.event?.kind!=='RECOVERED')return null;
 const r=review.reconciliation,week=program.weeks[review.weekIndex];
 if(['RETURN','GOAL_CHANGE'].includes(state.pending.eventKind)){
  if(program.hash!==state.programHash&&r?.programSourceInputHash===program.sourceInputHash)return null;
  return {status:'ASK',reason:'Return/goal dependency requires its specific current facts and reviewed task path, or a newly validated rebased program; generic recovery cannot clear it',missingInputs:['specificDependencyOrValidatedRebasedProgram']};
 }
 if(!['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','REVIEW','RECOVERED'].includes(state.pending.eventKind))return {status:'ASK',reason:'Re-evaluate the original dependent request with the missing current material facts',missingInputs:state.pending.missingInputs};
 const supplied=r?.source==='CURRENT_SELF_REPORT'&&r.ordinaryFunction==='COMPATIBLE'&&r.recovery==='COMPATIBLE'&&dateValid(r.observedAt)&&daysBetween(r.observedAt,review.asOf)>=0&&daysBetween(r.observedAt,review.asOf)<=1&&Array.isArray(r.prescriptionHashes)&&week?.sessions?.length&&week.sessions.every(s=>r.prescriptionHashes.includes(hash(s.prescription)));
 if(!supplied)return {status:'ASK',reason:'Prior unresolved plan-validity dependency requires current compatible combined-task/function/recovery reconciliation before resuming',missingInputs:['reconciliation.currentCombinedTasks']};
 return null;
}
export function referenceResult(program,review,result){
 const prior=review?.referenceState,{hash:digest,...priorBody}=prior??{},priorValid=prior?.athleteId===program.athleteId&&digest===hash(priorBody);
 const clinicalSticky=priorValid&&prior.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 if(clinicalSticky)result={...result,status:'CLINICAL_HUMAN_REQUIRED',action:'CLINICAL_HUMAN_REQUIRED',proposal:null,reason:'Prior clinical dependency is preserved through missing/invalid reviews; this reference cannot clear it'};
 const pending=clinicalSticky?clone(prior.pending):pendingStatuses.includes(result.status)?{status:result.status,reason:result.reason,missingInputs:clone(result.missingInputs??[]),eventKind:priorValid&&prior.pending?prior.pending.eventKind:review?.event?.kind??null,eventId:review?.event?.id??null}:null;
 const clock=dateValid(review?.asOf)&&(!priorValid||Date.parse(review.asOf)>=Date.parse(prior.asOf))?review.asOf:priorValid?prior.asOf:null;
 const body={version:'R5-REFERENCE-STATE-1',athleteId:program.athleteId,programHash:result.proposal?.hash??program.hash,asOf:clock,pending,scope:'Synthetic reference continuation state; never authorizes official plan effects'};
 return {...result,planValidity:{status:pending?'REQUIRES_RECONCILIATION':'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',wholeProgramGoalOptimalityEstablished:false},referenceState:{...body,hash:hash(body)}};
}
