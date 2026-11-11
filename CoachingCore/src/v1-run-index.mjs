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
import {runCalibrationOf,runCalibrationAuthority,allowsRun,appendEvidence,RUN_EXTENSION_ID,RUN_EVIDENCE_DECLARED} from './v1-run-calibration.mjs';
import {utcTimestamp} from './r6-provenance.mjs';
import {clone,freeze,hash} from './value.mjs';
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
 return freeze({...base,runCalibration:safely(()=>runCalibrationOf({program:base.program,ledger:[],evidenceRecord:[],asOf:base.program.canonical?.asOf,weekIndex:0,engineStatus:base.status,eligibility:input?.athlete?.eligibility??null},options)),runEvidenceRecord:[]});
}
/** The ids the intake's anchors use: a declaration may not reuse one. */
const anchorIds=program=>(Array.isArray(program.canonical?.athlete?.performanceAnchors)?program.canonical.athlete.performanceAnchors:[]).map((raw,i)=>isObj(raw)&&typeof raw.id==='string'&&raw.id.trim()?raw.id.trim():'intake-'+i);
/** The engine refused the review itself (its contract, its clock, the integrity of what it was sent): it accepted no instant. */
const REFUSED=new Set(['HOLD','INVALID_INPUT','UNSUPPORTED']);
/** The last instant the record already holds: the extension's rows, the engine's rows and the engine's reference clock. */
function lastInstant(carried,review){
 const times=[];for(const r of carried)if(isObj(r)&&Number.isFinite(Date.parse(r.declaredAt)))times.push(Date.parse(r.declaredAt));
 for(const o of Array.isArray(review.actualLedger)?review.actualLedger:[])if(isObj(o))for(const t of [o.provenance?.firstRecordedAt,o.declaredAt])if(Number.isFinite(Date.parse(t)))times.push(Date.parse(t));
 if(Number.isFinite(Date.parse(review.referenceState?.asOf)))times.push(Date.parse(review.referenceState.asOf));
 let last=-Infinity;for(const t of times)if(t>last)last=t;return last;
}
/**
 * The harder sessions a field test replaced (reading R12, as QRE-V1RC-01 narrowed it): only a FIELD_TEST of this athlete that the record holds
 * intact or that this review would add, naming a live QUALITY run of the plan in force in the week of the test.
 */
function replacedByTests(program,rows,asOfMs){
 const out=new Set(),sessions=new Map(program.weeks.flatMap(w=>w.sessions.map(x=>[x.id,x])));
 for(const r of rows){
  if(!isObj(r)||r.fact!==RUN_EVIDENCE_DECLARED||r.athleteId!==program.athleteId||!isObj(r.evidence)||r.evidence.id!==r.eventId||r.inputHash!==hash(r.evidence)||!(Date.parse(r.declaredAt)<=asOfMs))continue;
  const e=r.evidence,x=sessions.get(e.replacedSessionId);if(e.kind!=='FIELD_TEST'||!x||x.sport!=='RUN'||x.role!=='QUALITY'||!x.prescription||x.status==='SKIPPED'||typeof e.date!=='string')continue;
  const weekStart=Date.parse(program.startDate+'T00:00:00Z')+x.weekIndex*7*864e5,d=Date.parse(e.date+'T00:00:00Z');if(d>=weekStart&&d<weekStart+7*864e5)out.add(x.id);
 }
 return out;
}
/** A review: the engine's decision on the review without the extension's keys, then the calibration of the plan in force from the whole record. */
export function evaluateProgram(program,review,options={}){
 const mine=['runEvidence','runEvidenceRecord'],carried=isObj(review)&&Array.isArray(review.runEvidenceRecord)?review.runEvidenceRecord:[];
 const readable=validProgram(program)&&program.version==='R6-PROGRAM-1',asOf=isObj(review)?utcTimestamp(review.asOf):null;
 let on=false;try{on=allowsRun(runCalibrationAuthority(options),'CAPACITY');}catch{on=false;}
 // What this review would add to the record if the engine accepts its instant. Nothing while the extension is off (QRE-V1RC-10).
 let tentative=null;if(on&&readable&&asOf)try{tentative=appendEvidence(carried,review.runEvidence,{athleteId:program.athleteId,asOf,timezoneOffsetMinutes:program.timezoneOffsetMinutes??0,reservedIds:anchorIds(program)});}catch{tentative=null;}
 // A field test is done instead of the week's harder session, never as well as it: when the session it replaced is reported as not done, the
 // engine is asked to withhold the move of that session to a later day (its own option; the decision is the one it makes without the move).
 let missed=false;if(on&&readable&&asOf)try{const replaced=replacedByTests(program,tentative?.record??carried,Date.parse(asOf));
  missed=replaced.has(review.targetSessionId)||(Array.isArray(review.observations)?review.observations:[]).some(o=>isObj(o)&&o.actual?.completed===false&&replaced.has(o.sessionId));}catch{missed=false;}
 const base=evaluate(program,isObj(review)?without(review,mine):review,missed?{...options,withhold:[...new Set([...(Array.isArray(options.withhold)?options.withhold:[]),'MOVE'])]}:options);
 // A plan the engine does not review, or a review without a readable instant, records nothing and calibrates nothing.
 if(!readable||!asOf)return freeze({...base,runCalibration:none('NO_DECISION'),runEvidenceRecord:clone(carried),runEvidence:{added:[],refused:[]}});
 // A declared result is a fact of the record whatever a review decides, but only under an instant the engine accepted and never earlier than
 // the record already is (QRE-V1RC-02): a refused, replayed or backdated review records nothing.
 const declared=Array.isArray(review.runEvidence)?review.runEvidence:review.runEvidence===undefined||review.runEvidence===null?[]:[review.runEvidence];
 const why=!on?'evidence.extensionNotEnabled':REFUSED.has(base.status)?'evidence.reviewNotAccepted':Date.parse(asOf)<lastInstant(carried,review)?'evidence.reviewBeforeTheRecord':!tentative?'evidence.unreadable':null;
 const appended=why?{record:clone(carried),added:[],refused:declared.map(d=>({id:isObj(d)&&typeof d.id==='string'?d.id:null,errors:[why]}))}:tentative;
 const inForce=validProgram(base.proposal)?base.proposal:program,ledger=Array.isArray(base.actualLedger)?base.actualLedger:Array.isArray(review.actualLedger)?review.actualLedger:[];
 const runCalibration=['UNSUPPORTED','INVALID_INPUT'].includes(base.status)?none('NO_DECISION')
  :safely(()=>runCalibrationOf({program:inForce,ledger,evidenceRecord:appended.record,asOf,weekIndex:review.weekIndex,hold:NO_PRESCRIPTION.has(base.status),engineStatus:base.status,eligibility:review.eligibility??null},options));
 return freeze({...base,runCalibration,runEvidenceRecord:appended.record,runEvidence:{added:appended.added,refused:appended.refused}});
}
/** A new plan from the record: the engine's restart, and the calibration the carried record still supports (a break or a hold withdraws it). */
export function restartProgram(input,options={}){
 const base=restart(isObj(input)?without(input,['runEvidenceRecord']):input,options),carried=isObj(input)&&Array.isArray(input.runEvidenceRecord)?clone(input.runEvidenceRecord):[];
 if(!base?.program)return freeze({...base,runCalibration:none('NO_PLAN'),runEvidenceRecord:carried});
 const ledger=Array.isArray(base.carriedRecord)?base.carriedRecord:Array.isArray(input.record)?input.record:[];
 return freeze({...base,runCalibration:safely(()=>runCalibrationOf({program:base.program,ledger,evidenceRecord:carried,asOf:base.program.canonical?.asOf,weekIndex:0,engineStatus:base.status,eligibility:input.intake?.athlete?.eligibility??null},options)),runEvidenceRecord:carried});
}
