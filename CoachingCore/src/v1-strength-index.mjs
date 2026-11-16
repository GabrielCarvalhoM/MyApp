// CoachingCore V1 Strength Extension (Founder request of 2026-11-16; SI-V1-SSCTR-SQ-1 to SQ-4): the composed entry point.
// - Underneath is v1-run-forecast-index.mjs, unchanged (COACHINGCORE-V1-RACE-FORECAST-FREEZE-1), and under it the engine. This module edits no
//   plan, prescription, decision or record: it hands the repertoire's own selection the strength rules its authority enabled, and reads the answer.
// - A new plan (generateProgram, restartProgram) is built under the rules in force. The plan records them in its repertoire binding
//   (`program.repertoire.strengthExtension`).
// - A review (evaluateProgram) runs under the rules the plan was built under, and only those:
//     a plan built without them is reviewed without them, exactly as the entry point below reviews it (it never adopts a rule on the way);
//     a plan built under rules that are not the rules in force now (other bytes, other boundaries, or none) is not reviewed: the engine
//     answers UNSUPPORTED, as it does for a plan of another catalog (fail closed). One answer comes before that refusal: when the entry point
//     below answers the same review with CLINICAL_HUMAN_REQUIRED (a warning sign, pain with an exercise, a hold on the record), that answer
//     is given as it is. It prescribes and proposes nothing, so no rule is needed to give it.
// - Two keys are added to each result: `strengthExtension` (what is on, and under what the plan in force was built) and `strengthExposure`
//   (V1X-STRENGTH-EXPOSURE: working sets per primary muscle of the week reviewed, planned and executed, descriptive only). Nothing below reads
//   either: the engine's answer is the one it gives without them.
// - With no boundary on, every answer is the answer of the entry point below with the two keys saying so.
// An integration passes no options. A caller's own strength rules (the key STRENGTH_RULES on its options or on an authority it supplies) are
// taken off before anything is read: only this module's authority turns a rule on. The rules never travel under a field a JSON value can carry.
import * as F from './v1-run-forecast-index.mjs';
import {STRENGTH_RULES,repertoireAuthority} from './r7b-repertoire.mjs';
import {strengthAuthority,allowsStrength,strengthRules,sameRules,slotsInForce,weeklyStrengthExposure,STRENGTH_BOUNDARIES,STRENGTH_EXTENSION_ID,STRENGTH_EXPOSURE_VERSION} from './v1-strength.mjs';
import {freeze} from './value.mjs';
export * from './v1-run-forecast-index.mjs';
export {strengthAuthority,weeklyStrengthExposure,STRENGTH_BOUNDARIES,STRENGTH_EXTENSION_ID} from './v1-strength.mjs';
export const V1_STRENGTH_ENGINE=F.V1_RUN_FORECAST_ENGINE+'+'+STRENGTH_EXTENSION_ID;

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
/** An authority without rules of the caller's own: a copy of its own fields, whether the key was its own, hidden or inherited. */
const bare=r=>{if(!isObj(r)||!(STRENGTH_RULES in r))return r;const {[STRENGTH_RULES]:_never,...rest}=r;return rest;};
/** A caller's options without strength rules of its own. */
function internal(options){
 const {[STRENGTH_RULES]:_never,...rest}=isObj(options)?options:{};
 if(isObj(rest.repertoire))rest.repertoire=bare(rest.repertoire);
 if(isObj(rest.authority)&&isObj(rest.authority.repertoire))rest.authority={...rest.authority,repertoire:bare(rest.authority.repertoire)};
 return rest;
}
/** The options with the rules handed to the repertoire authority, whichever way the caller's authority reaches the engine. */
const under=(opts,rules)=>!rules?opts:{...opts,[STRENGTH_RULES]:rules,...(isObj(opts.authority)&&isObj(opts.authority.repertoire)?{authority:{...opts.authority,repertoire:{...opts.authority.repertoire,[STRENGTH_RULES]:rules}}}:{})};
/** The options under which the engine refuses the plan (its own answer for a plan it has no repertoire for). */
function closed(opts){
 const off={...repertoireAuthority(opts),valid:false};
 return {...opts,repertoire:off,...(isObj(opts.authority)&&isObj(opts.authority.repertoire)?{authority:{...opts.authority,repertoire:off}}:{})};
}
/** What is on (fail closed): an error reading the authority leaves every boundary off. */
function authorityOf(opts){
 try{const ext=strengthAuthority(opts);return {ext,on:Object.fromEntries(Object.keys(STRENGTH_BOUNDARIES).map(k=>[k,allowsStrength(ext,k)]))};}
 catch{return {ext:null,on:Object.fromEntries(Object.keys(STRENGTH_BOUNDARIES).map(k=>[k,false]))};}
}
const rulesOf=(A,more={})=>{try{return A.ext?strengthRules(A.ext,more):null;}catch{return null;}};
/** The statuses under which the engine prescribes nothing, and those under which it decided nothing. */
const NO_PRESCRIPTION=new Set(['HOLD','CLINICAL_HUMAN_REQUIRED']),NO_DECISION=new Set(['UNSUPPORTED','INVALID_INPUT']);
/** The exposure never fails the engine: an error inside it leaves the engine's answer whole and the exposure unavailable. */
function exposureOf(A,base,{program,weekIndex,ledger}){
 if(!A.on.EXPOSURE)return {version:STRENGTH_EXPOSURE_VERSION,status:'DISABLED'};
 if(!F.validProgram(program))return {version:STRENGTH_EXPOSURE_VERSION,status:'NOT_APPLICABLE',reason:'NO_PLAN'};
 if(NO_DECISION.has(base?.status))return {version:STRENGTH_EXPOSURE_VERSION,status:'NOT_APPLICABLE',reason:'NO_DECISION'};
 if(NO_PRESCRIPTION.has(base?.status))return {version:STRENGTH_EXPOSURE_VERSION,status:'NOT_APPLICABLE',reason:'NO_PRESCRIPTION'};
 try{return weeklyStrengthExposure({program,weekIndex,ledger},A.ext.values);}catch{return {version:STRENGTH_EXPOSURE_VERSION,status:'UNAVAILABLE',reason:'EXPOSURE_ERROR'};}
}
/**
 * SI-V1-SSCTR-SQ-1 c3 (QRE-STR-A-02): a trunk slot the plan in force leaves unfilled is declared in the answer, never left silent. It can only
 * arise once an athlete has set a trunk configuration aside: with the holds out, a session with two trunk slots may then have one left over.
 */
function trunkGaps(program){
 const sets=[...(Array.isArray(program?.templates)?program.templates:[]),...(Array.isArray(program?.noviceTemplates)?program.noviceTemplates:[])];
 const types=[...new Set(sets.filter(t=>Array.isArray(t?.missingPatterns)&&t.missingPatterns.includes('TRUNK')).map(t=>t.type))].sort();
 return types.length?[{id:'TRUNK_SLOT_UNFILLED',blocking:false,informational:true,pattern:'TRUNK',templates:types,detail:'A trunk slot of these sessions has no configuration left that fits: a hold is not selectable while it has no time dose, and the other trunk configurations are already in the session, were set aside, or need equipment this plan does not have. The sessions keep their other rows; nothing is claimed equivalent.',options:['Accept the gap','Add a band for another trunk exercise']}]:[];
}
/** The engine's answer with this extension's two keys. `plan` says under what the plan in force was built. */
function joined(base,A,plan,context){
 const selection=Object.keys(STRENGTH_BOUNDARIES).filter(k=>k!=='EXPOSURE'),any=selection.some(k=>A.on[k]);
 const strengthExtension={id:STRENGTH_EXTENSION_ID,sha256:A.ext?.sha256??null,status:plan==='MISMATCH'?'PLAN_BUILT_UNDER_OTHER_RULES':plan==='WITHOUT'?'PLAN_BUILT_WITHOUT_THE_RULES':any?'ACTIVE':'DISABLED',boundaries:Object.fromEntries(Object.entries(STRENGTH_BOUNDARIES).map(([k,id])=>[id,A.on[k]])),
  ...(A.on.HOLD&&plan==='UNDER'?{knownLimitations:A.ext.values.holdDose.knownLimitations.map(x=>({id:x.id,detail:x.detail}))}:{})};
 const gaps=A.on.HOLD&&plan==='UNDER'&&!NO_DECISION.has(base?.status)?trunkGaps(context.program):[];if(gaps.length)strengthExtension.disclosures=gaps;
 return freeze({...base,strengthExtension,strengthExposure:exposureOf(A,base,context)});
}

/** A first plan, built under the rules in force. */
export function generateProgram(input,options={}){
 const opts=internal(options),A=authorityOf(opts),rules=rulesOf(A),base=F.generateProgram(input,under(opts,rules));
 return joined(base,A,rules?'UNDER':'NONE',{program:base?.program??null,weekIndex:0,ledger:[]});
}
/** A review, under the rules the plan was built under and only those. */
export function evaluateProgram(program,review,options={}){
 const opts=internal(options),A=authorityOf(opts),bound=isObj(program)&&isObj(program.repertoire)?program.repertoire.strengthExtension??null:null;
 const rules=bound?rulesOf(A,{inForce:slotsInForce(program)}):null,plan=!bound?(rulesOf(A)?'WITHOUT':'NONE'):sameRules(bound,rules)?'UNDER':'MISMATCH';
 // A plan built under other rules is not reviewed, with one answer that comes first: what the entry point below says of a warning sign, of pain
 // with an exercise or of a hold on the record (CLINICAL_HUMAN_REQUIRED, which prescribes and proposes nothing) is given as it is. A change of
 // the rules never stands between an athlete and that answer.
 const below=plan==='MISMATCH'?F.evaluateProgram(program,review,opts):null,clinical=below?.status==='CLINICAL_HUMAN_REQUIRED'&&!below.proposal;
 const base=clinical?below:F.evaluateProgram(program,review,plan==='UNDER'?under(opts,rules):plan==='MISMATCH'?closed(opts):opts);
 const inForce=F.validProgram(base?.proposal)?base.proposal:program;
 return joined(base,A,plan,{program:inForce,weekIndex:isObj(review)?review.weekIndex:null,ledger:Array.isArray(base?.actualLedger)?base.actualLedger:isObj(review)&&Array.isArray(review.actualLedger)?review.actualLedger:[]});
}
/** A new plan from the record, built under the rules in force. */
export function restartProgram(input,options={}){
 const opts=internal(options),A=authorityOf(opts),rules=rulesOf(A),base=F.restartProgram(input,under(opts,rules));
 return joined(base,A,rules?'UNDER':'NONE',{program:base?.program??null,weekIndex:0,ledger:[]});
}
