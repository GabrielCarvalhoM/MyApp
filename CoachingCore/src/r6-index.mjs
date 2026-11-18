import {generateProgram as generateColdProgram,validProgram as validColdProgram,programHash,SESSION_NAMESPACE} from './r6-program.mjs';
import {evaluateProgram as evaluateColdProgram} from './r6-adaptation.mjs';
import {generateLegacyProgram,evaluateLegacyProgram,validLegacyProgram,LEGACY_PROGRAM_VERSION} from './r6-legacy.mjs';
import {hash,clone,freeze} from './value.mjs';
import {restartIntake} from './v1-f08.mjs';
import {RESTART_FACTS} from './r6-intake.mjs';
import {screenInterruptionReason} from './r6-clinical.mjs';
import {utcTimestamp} from './r6-provenance.mjs';
export {canonicalizeIntake} from './r6-intake.mjs';
export {programHash,PROGRAM_VERSION} from './r6-program.mjs';
export {REVIEW_VERSION,REVIEW_KINDS} from './r6-adaptation.mjs';
export {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement} from './r6-learning.mjs';
export {normalizeObservations} from './r6-provenance.mjs';
export {chooseBalanced,interferenceCosts} from './r6-balanced.mjs';
export {stimulusOf} from './r5-observation.mjs';
export {LEGACY_PROGRAM_VERSION};
/** Public R6 entrypoint. R5-INPUT-1 replays the frozen R5 contract with R6 corrections; R6-INTAKE-1 is the onboarding-like cold start. */
export function generateProgram(input,options={}){
 return input?.version==='R5-INPUT-1'?generateLegacyProgram(input,options):generateColdProgram(input,options);
}
export function evaluateProgram(program,review,options={}){
 if(program?.version===LEGACY_PROGRAM_VERSION)return evaluateLegacyProgram(program,review,options);
 if(program?.version==='R6-PROGRAM-1')return evaluateColdProgram(program,review,options);
 return freeze({runtimeVersion:'R6-1',mode:'SHADOW',status:'HOLD',action:'HOLD',reason:'Unknown program version',applied:false,proposal:null,officialPlanState:clone(review?.officialPlanState??null),appliedState:clone(review?.officialPlanState??null)});
}
export const validProgram=p=>validColdProgram(p)||validLegacyProgram(p);
export function sessionContext(program,session){
 return {family:session.prescription.family,modality:session.prescription.modality,phase:program.weeks[session.weekIndex]?.phase,arrangement:session.arrangement??program.selectedScheduleId??program.weeks[session.weekIndex]?.arrangementId??'CHOSEN_DAYS',doseKey:session.plannedPrescriptionHash??hash(session.prescription),equipment:clone(session.prescription.equipment??[]),priority:program.goal?.priority??'DYNAMIC_GOALS'};
}
/**
 * V1CP F08 Situation 3 (DR-148 path 3; PCG-V1CP-F08 RC-11, RC-14): a new plan after a long interruption, from the athlete's updated facts and the
 * carried record. A clinical hold still standing needs the readiness declaration first; otherwise the existing cold start builds the plan (the
 * pause read from the record, the restrictions in force carried), and the record is returned unchanged with prior capacity as context only.
 */
export function restartProgram({intake,record=[],referenceState=null,asOf=null,athleteId=null},options={}){
 const stopped=(status,reason,missingInputs=[],extra={})=>freeze({runtimeVersion:'R6-1',mode:'SHADOW',status,reason,missingInputs,program:null,applied:false,carriedRecord:clone(Array.isArray(record)?record:[]),...extra});
 // V1CP Fix-Forward SB-5 (SEC-V1CPR-04): a restart returns a status, never an exception (QRE-R6-10); a malformed input holds, naming only its class.
 try{
  const r=restartIntake({intake,record,referenceState,asOf:asOf??intake?.asOf,athleteId,screen:i=>screenInterruptionReason({reason:i?.reason,reasonCategory:i?.reasonCategory,nonclinical:i?.nonclinical??null,clinicalReason:i?.clinicalReason??null})});
  if(r.status!=='READY')return stopped(r.status,r.reason,r.missingInputs??[],r.unreadable?{unreadable:clone(r.unreadable)}:{});
  // V1 Core Safety & Lifecycle (QRE-AIF-02): the new plan's session namespace, from the athlete's updated facts as sent and the restart's decision
  // instant (UTC): two restarts of one athlete never share a session id, and the same restart (the same facts at the same instant) gives the same
  // plan, whatever form the carried record holds its facts in (nothing read from the record enters it).
  const at=typeof (asOf??intake?.asOf)==='string'?(utcTimestamp(asOf??intake.asOf)??String(asOf??intake.asOf)):null;
  const ns='r'+hash({intake:intake??null,at}).slice(0,10);
  const g=generateProgram(r.intake,{...options,[RESTART_FACTS]:r.facts,[SESSION_NAMESPACE]:ns});
  return freeze({...g,restart:{carriedRecord:r.carried.record,priorCapacity:r.carried.priorCapacity,boundedByRecord:r.carried.boundedByRecord??[],note:r.carried.note}});
 }catch(e){return stopped('HOLD','The restart facts could not be read: no new plan is made from them; send the updated facts and the record as kept',[],{errors:['malformed:'+(e?.constructor?.name??'Error')]});}
}
