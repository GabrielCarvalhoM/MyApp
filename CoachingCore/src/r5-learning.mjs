import {clone,freeze,hash,canonical} from './value.mjs';

const VERSION='R5-LEARNING-1',DAY=86_400_000,HASH=/^[a-f0-9]{64}$/;
/** Conservative evidence bookkeeping, NOT physiological laws or dose authority. */
export const LEARNING_POLICY=freeze({maximumAgeDays:56,emergingSessions:3,emergingSpanDays:7,
 strongSessions:4,strongSpanDays:14,phaseTransfer:false,causalInference:false});
const text=value=>typeof value==='string'&&value.trim().length>0;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function time(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))return NaN;
 const n=Date.parse(value),day=Date.parse(value.slice(0,10)+'T00:00:00Z');
 return Number.isFinite(n)&&Number.isFinite(day)&&new Date(day).toISOString().slice(0,10)===value.slice(0,10)?n:NaN;
}
function clock(value) {
 if(!Number.isFinite(time(value)))throw new TypeError('An explicit valid asOf timestamp with timezone is required');
 return new Date(time(value)).toISOString();
}
const has=(values,value)=>values.includes(value);
function contextReason(c) {
 if(!object(c)||!['family','modality','phase','doseKey'].every(k=>text(c[k])))return 'COMPARABLE_CONTEXT_REQUIRED';
 if(c.arrangement!==undefined&&!text(c.arrangement))return 'COMPARABLE_CONTEXT_REQUIRED';
 if(c.priority!==undefined&&!text(c.priority))return 'COMPARABLE_CONTEXT_REQUIRED';
 if(c.equipment!==undefined&&!text(c.equipment)&&!(Array.isArray(c.equipment)&&c.equipment.every(text)))return 'COMPARABLE_CONTEXT_REQUIRED';
 return null;
}
function observationReason(o,athleteId,asOf,{checkAge=true}={}) {
 if(!object(o)||!text(o.eventId))return 'EVENT_ID_REQUIRED';
 if(o.athleteId!==athleteId)return 'ATHLETE_MISMATCH';
 if(!text(o.sessionId))return 'SESSION_ID_REQUIRED';
 if(o.origin!=='ACTUAL_EXECUTION'||!HASH.test(o.sourceHash??'')||!HASH.test(o.plannedPrescriptionHash??''))return 'ACTUAL_SOURCE_PROVENANCE_REQUIRED';
 const observed=time(o.observedAt),now=time(asOf);
 if(!Number.isFinite(observed))return 'INVALID_OBSERVED_AT';
 if(observed>now)return 'FUTURE_OBSERVATION';
 if(checkAge&&now-observed>LEARNING_POLICY.maximumAgeDays*DAY)return 'STALE_OBSERVATION';
 if(o.stale===true)return 'STALE_OBSERVATION';
 if(o.comparable!==true)return 'COMPARABILITY_UNESTABLISHED';
 if(o.confounded!==false)return o.confounded===true?'CONFOUNDED':'CONFOUNDING_UNASSESSED';
 const a=o.actual;
 if(!object(a)||typeof a.completed!=='boolean')return 'ACTUAL_STIMULUS_REQUIRED';
 for(const k of ['minutes','sets','reps','loadKg']) {
  if(a[k]!==undefined&&(!Number.isFinite(a[k])||a[k]<0||(['sets','reps'].includes(k)&&!Number.isInteger(a[k]))))return 'INVALID_ACTUAL_STIMULUS';
 }
 if(!a.completed)return 'NOT_COMPLETED';
 if(!(a.minutes>0||a.sets>0||a.reps>0))return 'ACTUAL_STIMULUS_REQUIRED';
 const r=o.response;
 if(!object(r)||!has(['COMPATIBLE','UNDER','OVER','UNKNOWN'],r.performance)||
  !has(['COMPATIBLE','ADVERSE','UNKNOWN'],r.recovery)||!has(['ON_TARGET','EASIER','HARDER','UNKNOWN'],r.effort))return 'INVALID_RESPONSE';
 return contextReason(o.context);
}
function finish(body) {return freeze({...body,hash:hash(body)});}

export function createLearningModel({athleteId,purposeAllowed=false,asOf}={}) {
 if(!text(athleteId)||typeof purposeAllowed!=='boolean')throw new TypeError('Explicit athlete ownership and boolean purpose permission required');
 return finish({version:VERSION,athleteId,purposeAllowed,asOf:clock(asOf),revision:0,
  observations:[],excluded:[],populationPriorRetained:true,causalityEstablished:false,automaticDoseAuthority:false});
}

/** Integrity is local payload integrity; hashes do not authenticate an external execution source. */
export function validateLearningModel(model) {
 try {
  if(!object(model)||model.version!==VERSION||!HASH.test(model.hash??'')||!text(model.athleteId)||
   typeof model.purposeAllowed!=='boolean'||!Number.isFinite(time(model.asOf))||!Number.isInteger(model.revision)||model.revision<0||
   model.populationPriorRetained!==true||model.causalityEstablished!==false||model.automaticDoseAuthority!==false||
   !Array.isArray(model.observations)||!Array.isArray(model.excluded))return false;
  const {hash:digest,...body}=model;
  if(hash(body)!==digest)return false;
  const ids=new Set(),sources=new Set();
  for(const o of model.observations) {
   if(observationReason(o,model.athleteId,model.asOf,{checkAge:false})||ids.has(o.eventId)||sources.has(o.sourceHash))return false;
   ids.add(o.eventId);sources.add(o.sourceHash);
  }
  return model.excluded.every(e=>object(e)&&text(e.reason)&&HASH.test(e.inputHash??''));
 }catch{return false;}
}

export function updateLearningModel(model,observations,{asOf,purposeAllowed=model?.purposeAllowed}={}) {
 if(!validateLearningModel(model))throw new TypeError('A valid untampered R5 learning model is required');
 const nextAsOf=clock(asOf);
 if(time(nextAsOf)<time(model.asOf))throw new TypeError('Learning update time cannot precede the model clock');
 if(!Array.isArray(observations)||typeof purposeAllowed!=='boolean')throw new TypeError('Observations array and boolean purpose permission required');
 const accepted=clone(model.observations),excluded=clone(model.excluded);
 const ids=new Map(accepted.map(o=>[o.eventId,hash(o)])),sources=new Set(accepted.map(o=>o.sourceHash));
 const exclusions=new Set(excluded.map(e=>hash(e)));
 for(const original of observations) {
  let o,inputHash;
  try {o=clone(original);inputHash=hash(o);}catch{throw new TypeError('Observation must be a cloneable JSON data value');}
  let reason=!purposeAllowed?'PURPOSE_NOT_ALLOWED':observationReason(o,model.athleteId,nextAsOf);
  if(!reason&&ids.has(o.eventId)) {
   if(ids.get(o.eventId)===inputHash)continue;
   reason='EVENT_ID_CONFLICT';
  }
  if(!reason&&sources.has(o.sourceHash))reason='SOURCE_REUSED';
  if(reason) {
   const entry={eventId:text(o?.eventId)?o.eventId:null,reason,inputHash};
   if(!exclusions.has(hash(entry))){excluded.push(entry);exclusions.add(hash(entry));}
  }else {accepted.push(o);ids.set(o.eventId,inputHash);sources.add(o.sourceHash);}
 }
 accepted.sort((a,b)=>time(a.observedAt)-time(b.observedAt)||a.eventId.localeCompare(b.eventId));
 excluded.sort((a,b)=>a.inputHash.localeCompare(b.inputHash)||a.reason.localeCompare(b.reason));
 if(nextAsOf===model.asOf&&purposeAllowed===model.purposeAllowed&&canonical(accepted)===canonical(model.observations)&&canonical(excluded)===canonical(model.excluded))return model;
 const {hash:previousHash,...body}=clone(model);
 return finish({...body,asOf:nextAsOf,purposeAllowed,revision:model.revision+1,observations:accepted,excluded});
}

function matching(observed,requested) {
 if(contextReason(requested))return false;
 for(const k of ['family','modality','phase','doseKey','equipment','priority'])
  if(canonical(observed[k]??null)!==canonical(requested[k]??null))return false;
 return requested.arrangement===undefined||observed.arrangement===requested.arrangement;
}
const classify=o=>{
 const r=o.response;
 if(r.performance==='UNDER'||r.recovery==='ADVERSE'||r.effort==='HARDER')return 'ADVERSE';
 return r.performance!=='UNKNOWN'&&r.recovery==='COMPATIBLE'&&r.effort!=='UNKNOWN'?'COMPATIBLE':'UNKNOWN';
};
const unknown=reason=>({direction:'UNKNOWN',confidence:'PRIOR',count:0,sourceEventIds:[],causal:false,
 populationPriorRetained:true,automaticDoseAuthority:false,rankingInfluence:'POPULATION_PRIOR',reason});

export function evidenceFor(model,context,{asOf}={}) {
 if(!validateLearningModel(model))return freeze(unknown('INVALID_MODEL'));
 if(!model.purposeAllowed)return freeze(unknown('PURPOSE_NOT_ALLOWED'));
 const now=time(asOf);
 if(!Number.isFinite(now)||now<time(model.asOf))return freeze(unknown('INVALID_OR_PRE_MODEL_CLOCK'));
 if(contextReason(context))return freeze(unknown('COMPARABLE_CONTEXT_REQUIRED'));
 const matches=model.observations.filter(o=>matching(o.context,context)&&now-time(o.observedAt)<=LEARNING_POLICY.maximumAgeDays*DAY&&time(o.observedAt)<=now);
 // A repeated report for one completed session is one independent observation.
 const sessions=new Map();
 for(const o of matches){const prior=sessions.get(o.sessionId);if(!prior||time(o.observedAt)>time(prior.observedAt))sessions.set(o.sessionId,o);}
 const rows=[...sessions.values()].sort((a,b)=>time(a.observedAt)-time(b.observedAt)||a.eventId.localeCompare(b.eventId));
 const good=rows.filter(o=>classify(o)==='COMPATIBLE'),bad=rows.filter(o=>classify(o)==='ADVERSE');
 const informative=[...good,...bad],span=informative.length?Math.max(...informative.map(o=>time(o.observedAt)))-Math.min(...informative.map(o=>time(o.observedAt))):0;
 const mixed=good.length>0&&bad.length>0;
 const emerging=informative.length>=LEARNING_POLICY.emergingSessions&&span>=LEARNING_POLICY.emergingSpanDays*DAY;
 const complete=rows.every(o=>Object.values(o.response).every(value=>value!=='UNKNOWN'));
 const strong=!mixed&&complete&&informative.length===rows.length&&informative.length>=LEARNING_POLICY.strongSessions&&span>=LEARNING_POLICY.strongSpanDays*DAY;
 const confidence=strong?'STRONG':emerging?'EMERGING':'PRIOR';
 const direction=mixed?'MIXED':confidence==='PRIOR'?'UNKNOWN':bad.length?'ADVERSE':good.length?'COMPATIBLE':'UNKNOWN';
 return freeze({...unknown(null),direction,confidence,count:rows.length,sourceEventIds:rows.map(o=>o.eventId),
  informativeCount:informative.length,compatibleCount:good.length,adverseCount:bad.length,unknownCount:rows.length-informative.length,
  spanDays:span/DAY,rankingInfluence:strong?'CONTEXTUAL_ASSOCIATION':'POPULATION_PRIOR',
  responseSummary:{under:rows.filter(o=>o.response.performance==='UNDER').length,over:rows.filter(o=>o.response.performance==='OVER').length,
   easier:rows.filter(o=>o.response.effort==='EASIER').length,harder:rows.filter(o=>o.response.effort==='HARDER').length,
   adverseRecovery:rows.filter(o=>o.response.recovery==='ADVERSE').length},
  reason:mixed?'INCONSISTENT_COMPARABLE_RESPONSE':strong?'RECURRENT_COMPARABLE_ASSOCIATION':emerging?'EMERGING_NOT_DECISIVE':'INSUFFICIENT_RECURRENT_EVIDENCE'});
}

/** Ordinal tie-break among caller-admitted options; never grants prescription admissibility. */
export function preferredArrangement(model,options,context,{asOf}={}) {
 const eligible=(Array.isArray(options)?options:[]).filter(o=>object(o)&&text(o.id)&&o.admissible===true);
 const evidence=eligible.map(o=>({optionId:o.id,...evidenceFor(model,{...context,arrangement:o.arrangement??o.id},{asOf})}));
 const compatible=evidence.filter(e=>e.confidence==='STRONG'&&e.direction==='COMPATIBLE');
 const adverse=evidence.filter(e=>e.confidence==='STRONG'&&e.direction==='ADVERSE');
 let preferredId=null,reason='NO_DISTINGUISHING_EVIDENCE';
 if(compatible.length===1){preferredId=compatible[0].optionId;reason='STRONG_COMPARABLE_COMPATIBILITY';}
 else if(!compatible.length&&adverse.length){
  const remaining=eligible.filter(o=>!adverse.some(e=>e.optionId===o.id));
  if(remaining.length===1){preferredId=remaining[0].id;reason='AVOID_RECURRENT_ADVERSE_ARRANGEMENT';}
 }
 return freeze({preferredId,evidence,reason,causal:false,automaticDoseAuthority:false});
}
