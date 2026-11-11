// CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11): the V1 engine with the run calibration beside it.
// - The engine is v1-index.mjs, unchanged (COACHINGCORE-V1-FREEZE-1): every plan, decision, proposal and record it returns is returned as it is.
//   This module never edits a program, a prescription, a gate or the engine's record.
// - It adds two keys to each result: `runCalibration` (v1-run-calibration.mjs: capacity, evidence, effort domains, pace bands, heart-rate zones,
//   estimates, assessment, and the guidance of each planned run session of the plan in force) and `runEvidenceRecord` (this extension's own
//   append-only record of declared performance evidence, which the caller keeps and sends back, as it keeps the engine's record).
// - A review may carry `runEvidence` (new declarations: a race run outside the plan, a field test) and `runEvidenceRecord` (the carried record).
//   Both are taken off the review before the engine reads it, so the engine's decision is the one it makes without them.
// - With the extension off (no enabling record bound to the pinned values), `runCalibration.status` is DISABLED and everything else is the
//   frozen V1 behaviour.
import {generateProgram as generate,evaluateProgram as evaluate,restartProgram as restart,validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE,V1_ENGINE} from './v1-index.mjs';
import {runCalibrationOf,appendEvidence,readEvidence,RUN_EXTENSION_ID,RUN_EVIDENCE_DECLARED} from './v1-run-calibration.mjs';
import {utcTimestamp} from './r6-provenance.mjs';
import {clone,freeze} from './value.mjs';
export {validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE,V1_ENGINE};
export {runCalibrationOf,runCalibrationAuthority,readEvidence,RUN_BOUNDARIES,RUN_EXTENSION_ID,RUN_EVIDENCE_DECLARED} from './v1-run-calibration.mjs';
export const V1_RUN_ENGINE=V1_ENGINE+'+'+RUN_EXTENSION_ID;

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
/** The statuses under which the engine prescribes nothing: the guidance is withheld with it. */
const NO_PRESCRIPTION=new Set(['HOLD','CLINICAL_HUMAN_REQUIRED']);
const none=reason=>({status:'NOT_APPLICABLE',reason,sessions:{}});
/** The extension never fails the engine: an error inside it leaves the engine's result whole and the calibration unavailable (fail closed). */
const safely=f=>{try{return f();}catch{return {status:'UNAVAILABLE',reason:'CALIBRATION_ERROR',sessions:{}};}};
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));

/** A first plan: the engine's result, and the calibration the intake's own evidence supports (week 0). */
export function generateProgram(input,options={}){
 const base=generate(input,options);
 if(!base?.program)return freeze({...base,runCalibration:none('NO_PLAN'),runEvidenceRecord:[]});
 return freeze({...base,runCalibration:safely(()=>runCalibrationOf({program:base.program,ledger:[],evidenceRecord:[],asOf:base.program.canonical?.asOf,weekIndex:0},options)),runEvidenceRecord:[]});
}
/** The sessions a field test replaced: on the record, or declared with this review. */
const replacedBy=(record,declared)=>new Set([...record.filter(r=>isObj(r)&&r.fact===RUN_EVIDENCE_DECLARED).map(r=>r.evidence?.replacedSessionId),...(Array.isArray(declared)?declared:[]).map(d=>{try{return readEvidence(d).evidence?.replacedSessionId;}catch{return null;}})].filter(x=>typeof x==='string'));
/** A review: the engine's decision on the review without the extension's keys, then the calibration of the plan in force from the whole record. */
export function evaluateProgram(program,review,options={}){
 const mine=['runEvidence','runEvidenceRecord'],carried=isObj(review)&&Array.isArray(review.runEvidenceRecord)?review.runEvidenceRecord:[];
 // A field test is done instead of the week's harder session, never as well as it: when the session it replaced is reported as not done, the
 // engine is asked to withhold the move of that session to a later day (its own option; the decision is the one it makes without the move).
 const replaced=isObj(review)?replacedBy(carried,review.runEvidence):new Set(),missed=isObj(review)&&(replaced.has(review.targetSessionId)||(Array.isArray(review.observations)?review.observations:[]).some(o=>isObj(o)&&o.actual?.completed===false&&replaced.has(o.sessionId)));
 const base=evaluate(program,isObj(review)?without(review,mine):review,missed?{...options,withhold:[...new Set([...(Array.isArray(options.withhold)?options.withhold:[]),'MOVE'])]}:options);
 const asOf=isObj(review)?utcTimestamp(review.asOf):null;
 // A plan the engine does not review, or a review without a readable instant, records nothing and calibrates nothing.
 if(!validProgram(program)||program.version!=='R6-PROGRAM-1'||!asOf)return freeze({...base,runCalibration:none('NO_DECISION'),runEvidenceRecord:clone(carried),runEvidence:{added:[],refused:[]}});
 // A declared result is a fact of the record whatever this review decides (fact retention is not decision application).
 let appended;try{appended=appendEvidence(carried,review.runEvidence,{athleteId:program.athleteId,asOf,timezoneOffsetMinutes:program.timezoneOffsetMinutes??0});}catch{appended={record:clone(carried),added:[],refused:[{id:null,errors:['evidence.unreadable']}]};}
 const inForce=validProgram(base.proposal)?base.proposal:program,ledger=Array.isArray(base.actualLedger)?base.actualLedger:Array.isArray(review.actualLedger)?review.actualLedger:[];
 const runCalibration=['UNSUPPORTED','INVALID_INPUT'].includes(base.status)?none('NO_DECISION')
  :safely(()=>runCalibrationOf({program:inForce,ledger,evidenceRecord:appended.record,asOf,weekIndex:review.weekIndex,hold:NO_PRESCRIPTION.has(base.status)},options));
 return freeze({...base,runCalibration,runEvidenceRecord:appended.record,runEvidence:{added:appended.added,refused:appended.refused}});
}
/** A new plan from the record: the engine's restart, and the calibration the carried record still supports (a break or a hold withdraws it). */
export function restartProgram(input,options={}){
 const base=restart(isObj(input)?without(input,['runEvidenceRecord']):input,options),carried=isObj(input)&&Array.isArray(input.runEvidenceRecord)?clone(input.runEvidenceRecord):[];
 if(!base?.program)return freeze({...base,runCalibration:none('NO_PLAN'),runEvidenceRecord:carried});
 const ledger=Array.isArray(base.carriedRecord)?base.carriedRecord:Array.isArray(input.record)?input.record:[];
 return freeze({...base,runCalibration:safely(()=>runCalibrationOf({program:base.program,ledger,evidenceRecord:carried,asOf:base.program.canonical?.asOf,weekIndex:0},options)),runEvidenceRecord:carried});
}
