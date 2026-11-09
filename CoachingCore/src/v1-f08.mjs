// V1 Coaching Productization, Block 2: F08 under DR-148 (Founder D2 and the 2026-11-08 request; PCG-V1CP-F08-r1; Security SEC-V1CP-01..27).
// The software never makes the clinical judgment, and a recovering athlete always has a legitimate way back to training:
// - Situation 1 (NOT_FEELING_100): a structured "not 100%" report with every warning sign actively answered no opens a temporary reduction of
//   3 to 14 days, starting on the decision day, with the athlete's intent per affected sport; the engine sets the dose from existing operations.
// - Situation 2 (READINESS_DECLARATION): after a clinical hold, the athlete's structured readiness declaration, per sport, opens a conservative
//   sporting restart. It is never a clearance; the clinical cause stays on record (R-F08-1); any new sign returns to the clinical hold.
// - Situation 3 (restart): a new plan from the existing cold start, the record kept (see restartIntake).
// Inputs are closed: enums and booleans only, every item actively answered (unknown is ASK), no free text and no professional-visit field
// (SEC-V1CP-02/04/05; RC-05). This module validates and shapes the inputs and their record facts; the adaptation handlers apply them.
import {clone,hash} from './value.mjs';

export const WELLBEING_DECLARED='WELLBEING_DECLARED',READINESS_DECLARED='READINESS_DECLARED';
export const CONDITIONS=Object.freeze(['MILD_INDISPOSITION','UNUSUAL_FATIGUE','MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']);
/** Systemic conditions affect every programmed sport whatever scope is stated (B4: a relevant systemic restriction never spares a sport). */
export const SYSTEMIC_CONDITIONS=Object.freeze(['MILD_INDISPOSITION','UNUSUAL_FATIGUE','MILD_ILLNESS']);
export const SCOPES=Object.freeze(['WHOLE_BODY','RUN','STRENGTH','UPPER_BODY','LOWER_BODY']);
export const INTENTS=Object.freeze(['REDUCE_LIGHT','REDUCE_SUBSTANTIAL','LIGHT_ACTIVITY_ONLY','REST']);
export const RETURN_SPEEDS=Object.freeze(['CONSERVATIVE','BALANCED','FASTER']);
/** The warning signs of the Situation 1 entry screen (DR-148; PCG RF-1..RF-8): each must be answered; any yes routes to the clinical hold. */
export const WARNING_SIGNS=Object.freeze(['fever','chestPainOrPressure','breathlessnessOrPalpitations','faintingOrDizziness','painThatChangesMovementOrSwelling','injuryFromFallOrImpact','worsening']);
export const RESTRICTIONS=Object.freeze(['AVOID_LOWER_BODY_STRENGTH','AVOID_UPPER_BODY_STRENGTH']);
/** The Founder's window (D2, B1): 3 to 14 days. Not a sporting parameter of this module: a product decision (RC-16). */
export const WINDOW_DAYS=Object.freeze({min:3,max:14});
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/864e5;
const unknownKeys=(o,allowed)=>Object.keys(o).filter(k=>!allowed.includes(k));
const ask=(missingInputs,reason)=>({ask:{action:'ASK',reason,missingInputs}});

/**
 * Situation 1 entry. `w` is review.wellbeing; `today` the decision's local date; `programmed` the sports the plan programs.
 * Returns {clinical} when a warning sign is yes (Situation 2: professional assessment, prescription held), {ask} when an item is missing or not
 * part of the vocabulary, else {value}: the normalized report with the affected sports and its window.
 */
export function readWellbeing(w,{today,programmed}){
 if(!w||typeof w!=='object'||Array.isArray(w))return ask(['wellbeing'],'Say how you are: the condition, what it affects, the warning signs, what you want to do and for how many days');
 const extra=unknownKeys(w,['condition','scope','warningSigns','intent','days','startDate','endDate','returnSpeed']);
 if(extra.length)return ask(extra.map(k=>'wellbeing.'+k),'These answers are not part of this report and are not read: '+extra.join(', ')+'; free text is never read here');
 const signs=w.warningSigns&&typeof w.warningSigns==='object'&&!Array.isArray(w.warningSigns)?w.warningSigns:{};
 const yes=WARNING_SIGNS.filter(k=>signs[k]===true);
 // Any warning sign routes to the clinical hold at once, whatever else is missing (clinical first, RC-01, RC-04).
 if(yes.length)return {clinical:{action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:`You reported ${yes.length>1?'warning signs':'a warning sign'} (${yes.join(', ')}): seek a professional assessment; no training is planned while it stands, and your record keeps being kept. When you are ready to train again, you can tell us sport by sport`,warningSigns:yes}};
 const missing=[],bad=[];
 const signExtra=unknownKeys(signs,WARNING_SIGNS);if(signExtra.length)bad.push(...signExtra.map(k=>'wellbeing.warningSigns.'+k));
 for(const k of WARNING_SIGNS)if(signs[k]!==false)missing.push('wellbeing.warningSigns.'+k);
 if(!CONDITIONS.includes(w.condition))(w.condition===undefined?missing:bad).push('wellbeing.condition');
 if(!SCOPES.includes(w.scope))(w.scope===undefined?missing:bad).push('wellbeing.scope');
 if(!INTENTS.includes(w.intent))(w.intent===undefined?missing:bad).push('wellbeing.intent');
 if(w.returnSpeed!==undefined&&!RETURN_SPEEDS.includes(w.returnSpeed))bad.push('wellbeing.returnSpeed');
 // The window starts on the decision day (RC-03) and lasts 3 to 14 days: `days`, or an end date (and a start date equal to today).
 const start=w.startDate??today;
 if(w.startDate!==undefined&&(!isoDay(w.startDate)||w.startDate!==today))bad.push('wellbeing.startDate');
 let days=null;
 if(w.days!==undefined)days=Number.isInteger(w.days)?w.days:NaN;
 if(w.endDate!==undefined){if(!isoDay(w.endDate))bad.push('wellbeing.endDate');else{const d=gap(start,w.endDate)+1;if(days!==null&&days!==d)bad.push('wellbeing.days');days=d;}}
 if(days===null)missing.push('wellbeing.days');else if(!Number.isInteger(days)||days<WINDOW_DAYS.min||days>WINDOW_DAYS.max)bad.push('wellbeing.days');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): a condition, a scope and an intent from the list, every warning sign answered yes or no, a window of '+WINDOW_DAYS.min+' to '+WINDOW_DAYS.max+' days starting today');
 if(missing.length)return ask(missing,'Answer every item: the condition, what it affects, each warning sign (yes or no), what you want to do and for how many days');
 const affected=SYSTEMIC_CONDITIONS.includes(w.condition)||w.scope==='WHOLE_BODY'?programmed:w.scope==='RUN'?programmed.filter(s=>s==='RUN'):w.scope==='STRENGTH'||w.scope==='UPPER_BODY'?programmed.filter(s=>s==='STRENGTH'):programmed;
 if(!affected.length)return ask(['wellbeing.scope'],'What you reported affects no sport your plan has: say what it affects');
 const value={condition:w.condition,scope:w.scope,intent:w.intent,returnSpeed:w.returnSpeed??'BALANCED',startDate:start,endDate:addDays(start,days-1),days,sports:affected,region:w.scope==='UPPER_BODY'?'UPPER':w.scope==='LOWER_BODY'?'LOWER':null};
 return {value};
}
/** The record row of a Situation 1 report (append-only; its own channel, never a declared break: RC-07). */
export const wellbeingFact=(program,review,asOf,value)=>({fact:WELLBEING_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,wellbeing:clone(value),inputHash:hash(review.wellbeing),provenance:{firstRecordedAt:asOf}});

/**
 * Situation 2 entry: the athlete's readiness declaration (`r` = review.readiness). Every programmed sport is answered (ready yes or no), the
 * athlete states they recovered, and restrictions come from the closed vocabulary only (RC-08, RC-09). {ask} when anything is missing or outside
 * the vocabulary; else {value}. The current eligibility screen is read by the decision's own eligibility gate (clinical first).
 */
export function readReadiness(r,{programmed}){
 if(!r||typeof r!=='object'||Array.isArray(r))return ask(['readiness'],'Tell us, sport by sport, whether you are ready to train again');
 const extra=unknownKeys(r,['hold','declaredRecovered','sports']);
 if(extra.length)return ask(extra.map(k=>'readiness.'+k),'These answers are not part of the readiness declaration and are not read: '+extra.join(', '));
 const missing=[],bad=[];
 if(r.declaredRecovered!==true)(r.declaredRecovered===undefined?missing:bad).push('readiness.declaredRecovered');
 const sports=r.sports&&typeof r.sports==='object'&&!Array.isArray(r.sports)?r.sports:{},out={};
 for(const k of unknownKeys(sports,['RUN','STRENGTH']))bad.push('readiness.sports.'+k);
 for(const s of programmed){
  const x=sports[s];
  if(!x||typeof x!=='object'){missing.push(`readiness.sports.${s}.ready`);continue;}
  for(const k of unknownKeys(x,['ready','restrictions']))bad.push(`readiness.sports.${s}.${k}`);
  if(typeof x.ready!=='boolean'){missing.push(`readiness.sports.${s}.ready`);continue;}
  const list=x.restrictions===undefined?[]:x.restrictions;
  if(!Array.isArray(list)||list.some(c=>!RESTRICTIONS.includes(c))||s!=='STRENGTH'&&list.length){bad.push(`readiness.sports.${s}.restrictions`);continue;}
  out[s]={ready:x.ready,restrictions:[...new Set(list)].sort()};
 }
 const hold=r.hold&&typeof r.hold==='object'&&!Array.isArray(r.hold)?r.hold:null;
 if(r.hold!==undefined&&(!hold||unknownKeys(hold,['episodeId','eventId']).length||Object.values(hold).some(v=>typeof v!=='string')))bad.push('readiness.hold');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): each sport ready yes or no, restrictions from the list only');
 if(missing.length)return ask(missing,'Answer every item: that you recovered, and for each sport whether you are ready to train again');
 return {value:{declaredRecovered:true,sports:out,hold:hold?clone(hold):null}};
}
export const readinessFact=(program,review,asOf,value,hold)=>({fact:READINESS_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,readiness:{...clone(value),hold:clone(hold)},inputHash:hash(review.readiness),provenance:{firstRecordedAt:asOf}});
export const isF08Fact=o=>!!o&&typeof o==='object'&&!Array.isArray(o)&&(o.fact===WELLBEING_DECLARED||o.fact===READINESS_DECLARED);

// ---------- Situation 3 (DR-148 path 3; PCG-V1CP-F08 RC-11, RC-14): a new plan after a long interruption ----------
const CLINICAL_CATEGORIES_F08=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'];
/**
 * The intake of a new plan from the athlete's updated facts (`intake`, R6-INTAKE-1: goals, availability, recent exposure, equipment, choices) and
 * the carried record (`record`, the last program's actualLedger), with the last decision's `referenceState`. It never erases the record (RC-14):
 * the new program starts from the existing cold start, and the record is returned unchanged with prior capacity as context only.
 * - A clinical hold still standing (a clinical continuation, or a clinical-cause break reported after the latest readiness declaration) needs the
 *   readiness declaration first: {status:'CLINICAL_HUMAN_REQUIRED'} (RC-11). `screen` is the interruption screen, injected to avoid a cycle.
 * - The pause is read from the record when the updated intake states none: the weeks since the last executed session of any sport. After a
 *   readiness declaration it carries that basis (never "nonclinical", RC-02), so the existing restart rules apply; the restrictions in force carry over.
 */
export function restartIntake({intake,record=[],referenceState=null,asOf,screen}){
 const rows=Array.isArray(record)?record:[],readiness=rows.filter(o=>o?.fact===READINESS_DECLARED).sort((a,b)=>Date.parse(a.declaredAt)-Date.parse(b.declaredAt)).at(-1)??null;
 const after=t=>!readiness||Date.parse(t)>Date.parse(readiness.declaredAt);
 const clinicalBreak=rows.find(o=>o?.fact==='INTERRUPTION_DECLARED'&&after(o.declaredAt)&&(CLINICAL_CATEGORIES_F08.includes(String(o.interruption?.reasonCategory??'').toUpperCase())||screen?.(o.interruption)?.status==='CLINICAL'));
 const continuation=referenceState?.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 if(continuation||clinicalBreak)return {status:'CLINICAL_HUMAN_REQUIRED',reason:'A clinical hold is on record: before a new plan, tell us, sport by sport, that you are ready to train again (readiness declaration); your record is kept',missingInputs:['readiness']};
 const next=clone(intake),a=next.athlete??(next.athlete={});
 const day=String(asOf??next.asOf??'').slice(0,10),done=rows.filter(o=>o&&!o.fact&&!o.conflicted&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)).map(o=>o.localDate??String(o.occurrenceDate??o.observedAt??'').slice(0,10)).filter(d=>isoDay(d)&&d<=day).sort().at(-1)??null;
 if(a.pause===undefined&&done){const weeks=Math.floor(gap(done,day)/7);if(weeks>0)a.pause=readiness?{weeks,readinessDeclared:true}:{weeks};}
 const strength=readiness?.readiness?.sports?.STRENGTH,restrictions=strength?.ready?strength.restrictions??[]:[];
 if(readiness)a.restart={readinessEventId:readiness.eventId,strengthRestrictions:clone(restrictions)};
 const prior={lastExecutedDay:done,observations:rows.filter(o=>o&&!o.fact).length};
 return {status:'READY',intake:next,carried:{record:clone(rows),priorCapacity:prior,note:'History and prior capacity are context only: the new plan starts from current capacity (the cold start), never from prior doses'}};
}
