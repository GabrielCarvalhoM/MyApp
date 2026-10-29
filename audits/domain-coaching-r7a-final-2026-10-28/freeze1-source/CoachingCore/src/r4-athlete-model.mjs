import {clone,freeze,hash} from './value.mjs';
import {favorable} from './r4-context.mjs';

/** Read-only individual evidence: associations may rank approved options, never authorize new doses. */
export function buildAthleteModel(observations,{purposeAllowed=false,athleteId='SYNTHETIC'}={}){
 const seen=new Set(),accepted=[],excluded=[];
 for(const [index,original] of (Array.isArray(observations)?observations:[]).entries()){
  const o=clone(original),id=o.eventId??o.observationId;
  let reason=null;
  if(!purposeAllowed)reason='PURPOSE_NOT_ALLOWED';
  else if(!id)reason='EVENT_ID_REQUIRED';
  else if(seen.has(id))reason='DUPLICATE_EVENT';
  else if(!/^[a-f0-9]{64}$/.test(o.sourceHash??'')||!Number.isFinite(Date.parse(o.observedAt))||o.origin!=='ACTUAL_EXECUTION')reason='ACTUAL_SOURCE_PROVENANCE_REQUIRED';
  else if(o.stale===true)reason='STALE';
  else if(o.comparable!==true)reason='COMPARABILITY_UNESTABLISHED';
  else if(!o.context||typeof o.context!=='object')reason='COMPARABLE_CONTEXT_REQUIRED';
  if(id)seen.add(id);
  if(reason)excluded.push({index,id:id??null,reason});else accepted.push(o);
 }
 return freeze({version:'R4-ATHLETE-MODEL-1',athleteId,purposeAllowed,observations:accepted,excluded,populationPriorRetained:true,causalityEstablished:false,automaticDoseAuthority:false,hash:hash({accepted,purposeAllowed,athleteId})});
}
export function updateAthleteModel(model,observations,options={}){
 const prior=usableModel(model);
 if(!prior)throw new TypeError('A valid consented athlete model is required');
 return buildAthleteModel([...prior.observations,...clone(observations)],{purposeAllowed:options.purposeAllowed===true,athleteId:prior.athleteId});
}
export function usableModel(model){
 if(model?.version!=='R4-ATHLETE-MODEL-1'||model.purposeAllowed!==true)return null;
 const rebuilt=buildAthleteModel(model.observations,{purposeAllowed:true,athleteId:model.athleteId});
 return rebuilt.hash===model.hash?rebuilt:null;
}
/** No hard causal rule from one bad day. Hysteresis requires recurring comparable direction. */
export function summarizeOptionResponse(observations,optionId){
 const matches=observations.filter(o=>(o.arrangement??o.optionId)===optionId&&o.stale!==true&&o.comparable!==false);
 const good=matches.filter(o=>favorable(o.cruiseResponse??o.response));
 const adverse=matches.filter(o=>/harder than intended|incompatible|under target|worse/i.test(String(o.cruiseResponse??o.response??'')));
 return {observations:matches.length,recurringCompatible:good.length>1&&adverse.length===0,recurringAdverse:adverse.length>1&&good.length===0,mixed:good.length>0&&adverse.length>0,causal:false,confidence:matches.length>1&&!(good.length&&adverse.length)?'CONTEXTUAL_ASSOCIATION':'UNCERTAIN'};
}
