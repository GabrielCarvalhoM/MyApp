import {clone,freeze,hash} from './value.mjs';
import {normalizeObservations,utcTimestamp} from './r6-provenance.mjs';

export const LEARNING_VERSION='R6-LEARNING-1';
const DAY=86400000;
const finish=body=>freeze({...body,hash:hash(body)});
export function createLearningModel({athleteId,purposeAllowed=false,asOf,policy}={}){
 const clock=utcTimestamp(asOf);if(!athleteId||!clock)throw new TypeError('Athlete and timezone-aware decision time required');
 return finish({version:LEARNING_VERSION,athleteId,purposeAllowed:purposeAllowed===true,asOf:clock,revision:0,policy:clone(policy??{maximumAgeDays:56,emergingSessions:3,emergingSpanDays:7,strongSessions:4,strongSpanDays:14}),observations:[],excluded:[],superseded:[],duplicates:[],conflicts:[],populationPriorRetained:true,causalityEstablished:false,automaticDoseAuthority:false});
}
export function validateLearningModel(model){try{const {hash:digest,...body}=model;return model.version===LEARNING_VERSION&&hash(body)===digest&&!!utcTimestamp(model.asOf)&&Array.isArray(model.observations);}catch{return false;}}
/**
 * Adds causally available actual observations. Without learning purpose permission nothing is retained for learning;
 * the actual ledger (completed work) is kept separately by the caller.
 */
export function updateLearningModel(model,observations,{asOf,purposeAllowed=model?.purposeAllowed,timezoneOffsetMinutes=0}={}){
 if(!validateLearningModel(model)||!utcTimestamp(asOf)||Date.parse(asOf)<Date.parse(model.asOf))throw new TypeError('Valid model and monotonic timezone-aware update time required');
 const {hash:previousHash,...body}=clone(model);
 if(!purposeAllowed)return finish({...body,asOf:utcTimestamp(asOf),purposeAllowed:false,revision:body.revision+1,observations:[],excluded:[...body.excluded,...(observations??[]).map(o=>({eventId:o?.eventId??null,reason:'PURPOSE_NOT_ALLOWED'}))]});
 const n=normalizeObservations(observations,{athleteId:model.athleteId,asOf,prior:model.observations,maximumAgeDays:model.policy.maximumAgeDays,timezoneOffsetMinutes});
 const seenExcluded=new Set(body.excluded.map(e=>e.eventId+':'+e.reason));
 return finish({...body,asOf:n.asOf,purposeAllowed:true,revision:body.revision+1,observations:n.observations,excluded:[...body.excluded,...n.excluded.filter(e=>!seenExcluded.has(e.eventId+':'+e.reason))],superseded:[...body.superseded,...n.superseded],duplicates:[...body.duplicates,...n.duplicates],conflicts:[...body.conflicts,...n.conflicts]});
}
/** Response class of one actual. Missing effort or heart rate is unknown, never adverse. */
export function classify(o){
 const r=o.response??{},a=o.actual??{};
 if(a.completed!==true)return 'PARTIAL';
 if(r.performance==='OVER'&&(r.recovery==='ADVERSE'||r.effort==='HARDER')||r.performance==='UNDER'&&r.recovery==='COMPATIBLE'&&r.effort==='EASIER')return 'CONFLICTING';
 if(r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED'||r.performance==='UNDER'&&r.effort!=='EASIER'||r.effort==='HARDER'&&r.performance!=='OVER')return 'ADVERSE';
 if(r.performance==='OVER'&&r.effort==='EASIER'&&r.recovery!=='ADVERSE')return 'SURPLUS';
 if(['COMPATIBLE','OVER'].includes(r.performance)&&r.recovery!=='ADVERSE'||r.effort==='ON_TARGET'&&r.recovery==='COMPATIBLE')return 'COMPATIBLE';
 return 'COMPLETED_NO_RESPONSE';
}
const matches=(o,q)=>Object.entries(q??{}).every(([k,v])=>v===undefined||(Array.isArray(v)?v.includes(o.context?.[k]):o.context?.[k]===v));
/**
 * Evidence for a context (sessionType, arrangementId, condition...). Recency, comparability, consistency and
 * hysteresis decide confidence; nothing becomes causal or dose authority.
 */
export function evidenceFor(model,query,{asOf=model?.asOf,windowDays=null}={}){
 const none=reason=>({direction:'UNKNOWN',confidence:'PRIOR',count:0,informativeCount:0,partialCount:0,unknownCount:0,conflictingCount:0,adverseCount:0,surplusCount:0,compatibleCount:0,spanDays:0,sourceEventIds:[],causal:false,automaticDoseAuthority:false,reason});
 if(!validateLearningModel(model)||!model.purposeAllowed)return none(model?.purposeAllowed===false?'PURPOSE_NOT_ALLOWED':'INVALID_MODEL');
 const now=Date.parse(asOf),max=(windowDays??model.policy.maximumAgeDays)*DAY;
 const rows=model.observations.filter(o=>Date.parse(o.observedAt)<=now&&now-Date.parse(o.observedAt)<=max&&matches(o,query));
 const kinds=rows.map(o=>({o,k:o.comparable===false&&o.actual?.completed?'NOT_COMPARABLE':o.confounded===true?'CONFOUNDED':classify(o)}));
 const informative=kinds.filter(x=>['ADVERSE','SURPLUS','COMPATIBLE'].includes(x.k));
 const count=k=>kinds.filter(x=>x.k===k).length,adverse=count('ADVERSE'),surplus=count('SURPLUS'),compatible=count('COMPATIBLE'),conflicting=count('CONFLICTING');
 const span=informative.length?(Math.max(...informative.map(x=>Date.parse(x.o.observedAt)))-Math.min(...informative.map(x=>Date.parse(x.o.observedAt))))/DAY:0;
 const mixed=adverse>0&&surplus+compatible>0||conflicting>0;
 const p=model.policy,emerging=informative.length>=p.emergingSessions&&span>=p.emergingSpanDays,strong=!mixed&&informative.length>=p.strongSessions&&span>=p.strongSpanDays;
 const confidence=strong?'STRONG':emerging?'EMERGING':'PRIOR';
 const direction=mixed&&confidence!=='PRIOR'?'MIXED':confidence==='PRIOR'?(informative.length?'TENTATIVE_'+(adverse?'ADVERSE':surplus===informative.length?'SURPLUS':'COMPATIBLE'):'UNKNOWN'):adverse?'ADVERSE':surplus===informative.length?'SURPLUS':'COMPATIBLE';
 return {direction,confidence,count:rows.length,informativeCount:informative.length,partialCount:count('PARTIAL'),unknownCount:count('COMPLETED_NO_RESPONSE'),notComparableCount:count('NOT_COMPARABLE')+count('CONFOUNDED'),conflictingCount:conflicting,adverseCount:adverse,surplusCount:surplus,compatibleCount:compatible,spanDays:span,sourceEventIds:informative.map(x=>x.o.eventId),latest:rows.length?{eventId:rows.at(-1).eventId,kind:kinds.at(-1).k}:null,adherence:{completed:rows.filter(o=>o.actual?.completed).length,partial:count('PARTIAL'),capacityInferenceFromMissing:false},causal:false,automaticDoseAuthority:false,reason:mixed?'CONFLICTING_OR_MIXED_SIGNALS_RETAIN_UNCERTAINTY':strong?'REPEATED_COMPARABLE_ASSOCIATION':emerging?'EMERGING_ASSOCIATION':'INSUFFICIENT_REPEATED_COMPARABLE_EVIDENCE'};
}
/** Ordinal preference among already-admissible arrangements; never grants admissibility or dose. */
export function preferredArrangement(model,options,query,{asOf}={}){
 const evidence=(options??[]).filter(o=>o.admissible!==false).map(o=>({id:o.id,...evidenceFor(model,{...query,arrangementId:o.id},{asOf})}));
 const good=evidence.filter(e=>e.confidence!=='PRIOR'&&['COMPATIBLE','SURPLUS'].includes(e.direction)),bad=evidence.filter(e=>e.confidence!=='PRIOR'&&e.direction==='ADVERSE');
 let preferredId=good.length===1&&bad.length>=1?good[0].id:good.length===1&&good[0].confidence==='STRONG'?good[0].id:null;
 if(!preferredId&&bad.length){const remaining=evidence.filter(e=>!bad.some(b=>b.id===e.id));if(remaining.length===1)preferredId=remaining[0].id;}
 return {preferredId,confidence:preferredId?(good.find(g=>g.id===preferredId)?.confidence==='STRONG'||bad.some(b=>b.confidence==='STRONG')?'STRONG':'EMERGING'):'PRIOR',evidence,causal:false,automaticDoseAuthority:false,reason:preferredId?'Repeated comparable responses differ between admissible arrangements':'No distinguishing repeated evidence'};
}
