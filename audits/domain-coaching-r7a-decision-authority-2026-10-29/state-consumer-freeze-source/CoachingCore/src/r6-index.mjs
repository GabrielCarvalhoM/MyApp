import {generateProgram as generateColdProgram,validProgram as validColdProgram,programHash} from './r6-program.mjs';
import {evaluateProgram as evaluateColdProgram} from './r6-adaptation.mjs';
import {generateLegacyProgram,evaluateLegacyProgram,validLegacyProgram,LEGACY_PROGRAM_VERSION} from './r6-legacy.mjs';
import {hash,clone,freeze} from './value.mjs';
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
