// V1 Coaching Productization, Block 2: F08 under DR-148 (Founder D2 and the 2026-11-08 request; PCG-V1CP-F08 r2; Security SEC-V1CP-01..27),
// with the sporting mapping of SSCTR-V1CP-DECISION Q05-Q08 (returnLadder, warningSignInstrument). The software never makes the clinical
// judgment, and a recovering athlete always has a legitimate way back to training:
// - Situation 1 (NOT_FEELING_100): a structured "not 100%" report with every warning sign actively answered no opens a temporary window of 3 to
//   14 days, from the decision day, at the rung of the athlete's intent (R0 rest, R1 light activity only, R2 much lighter, R3 easier). At its end
//   the athlete answers the window-end check (WELLBEING_CHECK, or the weekly review's check): warning signs and whether the condition resolved
//   or clearly improved. Only then the return starts, climbing the rungs of the chosen speed one executed plan week at a time (returnLadder).
// - Situation 2 (READINESS_DECLARATION): after a clinical hold, the athlete's structured readiness declaration, per sport, opens a conservative
//   sporting restart. It is never a clearance; the clinical cause stays on record (R-F08-1); any new sign returns to the clinical hold.
// - Situation 3 (restart): a new plan from the existing cold start, the record kept (see restartIntake).
// Inputs are closed: enums and booleans only, every item actively answered (unknown is ASK), no free text and no professional-visit field
// (SEC-V1CP-02/03/04/05; RC-05). The added booleans (W1-W15, X1-X4, improved) are the SSCTR's instrument: Security confirms them before any real
// collection (C-Q05-8, SEC-V1CP-02); they are FUTURE_G04_REVALIDATION. This module validates and shapes the inputs and their record facts.
import {clone,hash} from './value.mjs';

export const WELLBEING_DECLARED='WELLBEING_DECLARED',READINESS_DECLARED='READINESS_DECLARED',WELLBEING_CHECKED='WELLBEING_CHECKED';
export const CONDITIONS=Object.freeze(['MILD_INDISPOSITION','UNUSUAL_FATIGUE','MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']);
/** Systemic conditions affect every programmed sport (Q05); the local ones affect the sports the athlete states, both when unstated (RC-13). */
export const SYSTEMIC_CONDITIONS=Object.freeze(['MILD_INDISPOSITION','UNUSUAL_FATIGUE','MILD_ILLNESS']);
/** Illness-type conditions: no long run and no near-normal strength volume while unwell (Q05: REDUCE_LIGHT not offered), and W11, W15, X3. */
export const ILLNESS_TYPE=Object.freeze(['MILD_ILLNESS','MILD_INDISPOSITION']);
export const REGIONS=Object.freeze(['WHOLE_BODY','UPPER_BODY','LOWER_BODY']);
export const INTENTS=Object.freeze(['REDUCE_LIGHT','REDUCE_SUBSTANTIAL','LIGHT_ACTIVITY_ONLY','REST']);
/** The rung each intent holds inside the window (returnLadder): R0 rest, R1 light activity only, R2 much lighter, R3 easier. */
export const INTENT_RUNG=Object.freeze({REST:'R0',LIGHT_ACTIVITY_ONLY:'R1',REDUCE_SUBSTANTIAL:'R2',REDUCE_LIGHT:'R3'});
export const intentsFor=condition=>ILLNESS_TYPE.includes(condition)?['REDUCE_SUBSTANTIAL','LIGHT_ACTIVITY_ONLY','REST']:[...INTENTS];
export const RETURN_SPEEDS=Object.freeze(['CONSERVATIVE','BALANCED','FASTER']);
/** SSCTR-V1CP warningSignInstrument: W1-W9 for every condition; W10, W12-W14 for the systemic ones; W11 and W15 for the illness-type ones. */
export const WARNING_SIGNS=Object.freeze({W1:'feverOrChills',W2:'chestPainPressureOrTightness',W3:'breathlessAtRest',W4:'palpitationsAtRest',W5:'faintingOrDizziness',W6:'painThatChangesMovement',W7:'swelling',W8:'injuryFromFallOrImpact',W9:'gettingWorse',W10:'bodyWideAches',W11:'exhaustionAtRest',W12:'vomitingDiarrhoeaNauseaOrAbdominalPain',W13:'moderateOrSevereCough',W14:'severeHeadache',W15:'severeNoseOrThroat'});
/** The exercise-response items, asked after an adverse or conflicting session and at each weekly review with sessions executed there; X3 for the
 * illness-type windows only. */
export const EXERCISE_SIGNS=Object.freeze({X1:'breathlessChestDizzyOrRacingWithExercise',X2:'muchHigherEffortThanUsual',X3:'newMuscleOrJointPainWithExercise',X4:'darkOrRedUrineAfterExercise'});
const ALL_W=Object.values(WARNING_SIGNS),ALL_X=Object.values(EXERCISE_SIGNS),WS=WARNING_SIGNS;
export const signsFor=condition=>[...ALL_W.slice(0,9),...(SYSTEMIC_CONDITIONS.includes(condition)?[WS.W10,...(ILLNESS_TYPE.includes(condition)?[WS.W11]:[]),WS.W12,WS.W13,WS.W14,...(ILLNESS_TYPE.includes(condition)?[WS.W15]:[])]:[])];
export const exerciseSignsFor=condition=>ALL_X.filter(k=>k!==EXERCISE_SIGNS.X3||ILLNESS_TYPE.includes(condition));
/** At a readiness declaration the cause of the hold is not read again: every warning sign is answered (Q4-c; C-Q07-4). */
export const READINESS_SIGNS=Object.freeze([...ALL_W]);
export const RESTRICTIONS=Object.freeze(['AVOID_LOWER_BODY_STRENGTH','AVOID_UPPER_BODY_STRENGTH']);
/** The Founder's window (D2, B1): 3 to 14 days. A product decision (RC-16), not a sporting parameter of this module. */
export const WINDOW_DAYS=Object.freeze({min:3,max:14});
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/864e5;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const unknownKeys=(o,allowed)=>Object.keys(o).filter(k=>!allowed.includes(k));
const ask=(missingInputs,reason)=>({ask:{action:'ASK',reason,missingInputs}});
const human=list=>list.map(k=>k.replace(/([A-Z])/g,' $1').toLowerCase()).join(', ');
/** The clinical route of a warning sign (RF-3): the hold for every sport, a professional assessment, the record kept; never a diagnosis (RF-4). */
export const signRoute=(yes,{lead='You reported'}={})=>({action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:`${lead} ${yes.length>1?'warning signs':'a warning sign'} (${human(yes)}): seek a professional assessment; no training is planned while it stands, and your record keeps being kept. When you are ready to train again, you can tell us sport by sport`,warningSigns:[...yes]});
/** Reads a group of booleans: the keys answered yes (any key of the group, asked or not), the asked keys not answered no, and keys outside it. */
function readBooleans(o,asked,group,prefix){
 const x=isObj(o)?o:{},yes=group.filter(k=>x[k]===true),missing=asked.filter(k=>x[k]!==false&&x[k]!==true).map(k=>prefix+'.'+k);
 return {yes,missing,bad:[...unknownKeys(x,group).map(k=>prefix+'.'+k),...group.filter(k=>k in x&&typeof x[k]!=='boolean').map(k=>prefix+'.'+k)],answered:isObj(o)};
}

/**
 * Situation 1 entry. `w` is review.wellbeing; `today` the decision's local date; `programmed` the sports the plan programs.
 * Returns {clinical} when a warning sign is yes, {ask} when an item is missing, refused or outside the vocabulary, else {value}: the normalized
 * report with the affected sports, the region of strength rows a local report limits, the window and its rung.
 */
export function readWellbeing(w,{today,programmed}){
 if(!isObj(w))return ask(['wellbeing'],'Say how you are: the condition, the warning signs, what you want to do and for how many days');
 const extra=unknownKeys(w,['condition','sports','region','warningSigns','intent','days','startDate','endDate','returnSpeed']);
 if(extra.length)return ask(extra.map(k=>'wellbeing.'+k),'These answers are not part of this report and are not read: '+extra.join(', ')+'; free text is never read here');
 const known=CONDITIONS.includes(w.condition),signs=readBooleans(w.warningSigns,known?signsFor(w.condition):ALL_W,ALL_W,'wellbeing.warningSigns');
 // Any warning sign routes to the clinical hold at once, whatever else is missing (clinical first, RC-01, RC-04).
 if(signs.yes.length)return {clinical:signRoute(signs.yes)};
 const missing=[...signs.missing],bad=[...signs.bad],systemic=SYSTEMIC_CONDITIONS.includes(w.condition);
 if(!known)(w.condition===undefined?missing:bad).push('wellbeing.condition');
 if(!INTENTS.includes(w.intent))(w.intent===undefined?missing:bad).push('wellbeing.intent');
 else if(known&&!intentsFor(w.condition).includes(w.intent))return ask(['wellbeing.intent'],'While you are unwell the options are a much lighter week, light activity only, or rest: no long run and no near-normal strength work until it has passed');
 if(w.returnSpeed!==undefined&&!RETURN_SPEEDS.includes(w.returnSpeed))bad.push('wellbeing.returnSpeed');
 // The affected sports: both for a systemic condition; for a local one, the sports the athlete states (never inferred), both when unstated.
 let sports=[...programmed];
 if(w.sports!==undefined){
  if(!Array.isArray(w.sports)||!w.sports.length||w.sports.some(x=>!['RUN','STRENGTH'].includes(x)))bad.push('wellbeing.sports');
  else if(systemic&&programmed.some(p=>!w.sports.includes(p)))return ask(['wellbeing.sports'],'How you feel affects your whole body: the reduction covers every sport of your plan');
  else sports=programmed.filter(p=>w.sports.includes(p));
 }
 if(w.region!==undefined&&!REGIONS.includes(w.region))bad.push('wellbeing.region');
 else if(systemic&&w.region!==undefined&&w.region!=='WHOLE_BODY')return ask(['wellbeing.region'],'How you feel affects your whole body: the reduction is not limited to one region');
 // The window starts on the decision day (RC-03) and lasts 3 to 14 days: `days`, or an end date (and a start date equal to today).
 const start=w.startDate??today;
 if(w.startDate!==undefined&&(!isoDay(w.startDate)||w.startDate!==today))bad.push('wellbeing.startDate');
 let days=null;
 if(w.days!==undefined)days=Number.isInteger(w.days)?w.days:NaN;
 if(w.endDate!==undefined){if(!isoDay(w.endDate))bad.push('wellbeing.endDate');else{const d=gap(start,w.endDate)+1;if(days!==null&&days!==d)bad.push('wellbeing.days');days=d;}}
 if(days===null)missing.push('wellbeing.days');else if(!Number.isInteger(days)||days<WINDOW_DAYS.min||days>WINDOW_DAYS.max)bad.push('wellbeing.days');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): a condition and an intent from the list, every warning sign answered yes or no, a window of '+WINDOW_DAYS.min+' to '+WINDOW_DAYS.max+' days starting today');
 if(missing.length)return ask(missing,'Answer every item: the condition, each warning sign (yes or no), what you want to do and for how many days');
 if(!sports.length)return ask(['wellbeing.sports'],'What you reported affects no sport your plan has: say which sport it affects');
 const region=w.region==='UPPER_BODY'?'UPPER':w.region==='LOWER_BODY'?'LOWER':null;
 return {value:{condition:w.condition,systemic,sports,region,intent:w.intent,rung:INTENT_RUNG[w.intent],returnSpeed:w.returnSpeed??'BALANCED',startDate:start,endDate:addDays(start,days-1),days}};
}
/** The record row of a Situation 1 report (append-only; its own channel, never a declared break: RC-07, C-Q05-6). */
export const wellbeingFact=(program,review,asOf,value)=>({fact:WELLBEING_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,wellbeing:clone(value),inputHash:hash(review.wellbeing),provenance:{firstRecordedAt:asOf}});

/**
 * A check inside a Situation 1 episode (`c` = review.wellbeingCheck): the warning signs of the episode's condition, re-answered (C-Q05-4); the
 * exercise-response items when `exercise` (sessions executed or an adverse one reported); whether the condition resolved or clearly improved when
 * `improved` (the window-end check, C-Q05-1); a change of return speed only while `speed` (before the return starts, Q06). {clinical} on any yes.
 */
export function readCheck(c,{condition,improved=false,exercise=false,speed=false,signs=null,xsigns=null}){
 if(!isObj(c))return ask(['wellbeingCheck'],`Tell us how you are: each warning sign (yes or no)${exercise?', how your sessions felt (each exercise-response item)':''}${improved?', and whether it has passed or clearly improved':''}`);
 const extra=unknownKeys(c,['warningSigns','exerciseResponse','improved','returnSpeed']);
 if(extra.length)return ask(extra.map(k=>'wellbeingCheck.'+k),'These answers are not part of this check and are not read: '+extra.join(', '));
 const asked=signs??signsFor(condition),xasked=xsigns??exerciseSignsFor(condition),s=readBooleans(c.warningSigns,asked,ALL_W,'wellbeingCheck.warningSigns'),x=readBooleans(c.exerciseResponse,exercise?xasked:[],ALL_X,'wellbeingCheck.exerciseResponse');
 if(s.yes.length||x.yes.length)return {clinical:signRoute([...s.yes,...x.yes])};
 const missing=[...s.missing,...x.missing],bad=[...s.bad,...x.bad];
 if(improved&&typeof c.improved!=='boolean')(c.improved===undefined?missing:bad).push('wellbeingCheck.improved');
 if(!improved&&c.improved!==undefined)bad.push('wellbeingCheck.improved');
 if(c.returnSpeed!==undefined&&!RETURN_SPEEDS.includes(c.returnSpeed))bad.push('wellbeingCheck.returnSpeed');
 else if(c.returnSpeed!==undefined&&!speed)return ask(['wellbeingCheck.returnSpeed'],'Your return has started: its speed no longer changes. The plan keeps following what you execute');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): each item yes or no');
 if(missing.length)return ask(missing,`Answer every item: each warning sign (yes or no)${exercise?' and each exercise-response item':''}${improved?', and whether it has passed or clearly improved':''}`);
 return {value:{improved:improved?c.improved:null,returnSpeed:c.returnSpeed??null,warningSigns:Object.fromEntries(asked.map(k=>[k,false])),...(exercise?{exerciseResponse:Object.fromEntries(xasked.map(k=>[k,false]))}:{})}};
}
export const checkFact=(program,review,asOf,episode,value,kind)=>({fact:WELLBEING_CHECKED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,episode,check:{...clone(value),kind},inputHash:hash(review.wellbeingCheck),provenance:{firstRecordedAt:asOf}});

/**
 * Situation 2 entry: the athlete's readiness declaration (`r` = review.readiness). Every warning sign is answered (any yes keeps the hold for every
 * sport); every programmed sport is answered (ready yes or no); restrictions come from the closed vocabulary only (RC-08, RC-09); with
 * AVOID_LOWER_BODY_STRENGTH, running restarts only on its own explicit answer that running is not restricted (Q07, PCG Q4 f); the speed is
 * BALANCED (default) or CONSERVATIVE, never FASTER (Q07). {ask} when anything is missing or outside the vocabulary; else {value}.
 */
export function readReadiness(r,{programmed}){
 if(!isObj(r))return ask(['readiness'],'Tell us, sport by sport, whether you are ready to train again, and answer each warning sign');
 const extra=unknownKeys(r,['hold','declaredRecovered','sports','warningSigns','returnSpeed']);
 if(extra.length)return ask(extra.map(k=>'readiness.'+k),'These answers are not part of the readiness declaration and are not read: '+extra.join(', '));
 const signs=readBooleans(r.warningSigns,READINESS_SIGNS,ALL_W,'readiness.warningSigns');
 if(signs.yes.length)return {clinical:signRoute(signs.yes)};
 const missing=[...signs.missing],bad=[...signs.bad];
 if(r.declaredRecovered!==true)(r.declaredRecovered===undefined?missing:bad).push('readiness.declaredRecovered');
 if(r.returnSpeed!==undefined&&!['BALANCED','CONSERVATIVE'].includes(r.returnSpeed))bad.push('readiness.returnSpeed');
 const sports=isObj(r.sports)?r.sports:{},out={};
 for(const k of unknownKeys(sports,['RUN','STRENGTH']))bad.push('readiness.sports.'+k);
 const lowerAvoided=Array.isArray(sports.STRENGTH?.restrictions)&&sports.STRENGTH.restrictions.includes('AVOID_LOWER_BODY_STRENGTH');
 for(const s of programmed){
  const x=sports[s];
  if(!isObj(x)){missing.push(`readiness.sports.${s}.ready`);continue;}
  for(const k of unknownKeys(x,s==='RUN'?['ready','runningNotRestricted']:['ready','restrictions']))bad.push(`readiness.sports.${s}.${k}`);
  if(typeof x.ready!=='boolean'){missing.push(`readiness.sports.${s}.ready`);continue;}
  if(s==='STRENGTH'){
   const list=x.restrictions===undefined?[]:x.restrictions;
   if(!Array.isArray(list)||list.some(c=>!RESTRICTIONS.includes(c))){bad.push('readiness.sports.STRENGTH.restrictions');continue;}
   out[s]={ready:x.ready,restrictions:[...new Set(list)].sort()};continue;
  }
  // Running with a lower-body strength restriction: the software infers nothing; the athlete answers whether running itself is restricted.
  if(x.ready&&lowerAvoided&&programmed.includes('STRENGTH')){
   if(typeof x.runningNotRestricted!=='boolean'){(x.runningNotRestricted===undefined?missing:bad).push('readiness.sports.RUN.runningNotRestricted');continue;}
   out[s]={ready:x.runningNotRestricted===true,...(x.runningNotRestricted?{}:{heldBy:'RUNNING_RESTRICTED'})};continue;
  }
  if(x.runningNotRestricted!==undefined&&typeof x.runningNotRestricted!=='boolean')bad.push('readiness.sports.RUN.runningNotRestricted');
  out[s]={ready:x.ready};
 }
 const hold=isObj(r.hold)?r.hold:null;
 if(r.hold!==undefined&&(!hold||unknownKeys(hold,['episodeId','eventId']).length||Object.values(hold).some(v=>typeof v!=='string')))bad.push('readiness.hold');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): each sport ready yes or no, restrictions from the list only, each warning sign yes or no, a balanced or conservative restart');
 if(missing.length)return ask(missing,'Answer every item: each warning sign, that you recovered, for each sport whether you are ready to train again'+(lowerAvoided?', and whether running itself is restricted':''));
 return {value:{declaredRecovered:true,sports:out,returnSpeed:r.returnSpeed??'BALANCED',warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),hold:hold?clone(hold):null}};
}
export const readinessFact=(program,review,asOf,value,hold)=>({fact:READINESS_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,readiness:{...clone(value),hold:clone(hold)},inputHash:hash(review.readiness),provenance:{firstRecordedAt:asOf}});
export const isF08Fact=o=>isObj(o)&&(o.fact===WELLBEING_DECLARED||o.fact===READINESS_DECLARED||o.fact===WELLBEING_CHECKED);

// ---------- Situation 3 (DR-148 path 3; PCG-V1CP-F08 RC-11, RC-14; SSCTR-V1CP Q08): a new plan after a long interruption ----------
const CLINICAL_CATEGORIES_F08=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'];
const sportOf=o=>{const t=String(o?.context?.sessionType??o?.context?.sport??'');return t.startsWith('RUN')?'RUN':t.startsWith('STRENGTH')?'STRENGTH':null;};
const dayOfRow=o=>o.localDate??String(o.occurrenceDate??o.observedAt??'').slice(0,10);
const executed=o=>o&&!o.fact&&!o.conflicted&&(o.actual?.completed===true||Number(o.actual?.minutes)>0);
/**
 * The intake of a new plan from the athlete's updated facts (`intake`, R6-INTAKE-1: goals, availability, recent exposure, equipment, choices) and
 * the carried record (`record`, the last program's actualLedger), with the last decision's `referenceState`. It never erases the record (RC-14):
 * the new program starts from the existing cold start, and the record is returned unchanged with prior capacity as context only.
 * - A clinical hold still standing (a clinical continuation, or a clinical-cause break reported after the latest readiness declaration) needs the
 *   readiness declaration first: {status:'CLINICAL_HUMAN_REQUIRED'} (RC-11, SEC-V1CP-23). `screen` is the interruption screen, injected.
 * - Per sport the pause is read from the record (weeks since that sport's last executed session) when the updated intake states none (Q08), and
 *   the existing restart rules apply. C-Q08-1: the recent weekly exposure the intake states never exceeds what the record shows executed in the
 *   last 28 days; unknown stays unknown. C-Q08-2: the new plan never starts a sport above the start the in-program return of the same pause would
 *   set: after a clinical hold, never above the readiness restart's MODERATE floor (`restart.minimumClass`), with the restrictions in force and
 *   the sports not declared ready left out of the plan (RC-11, C-Q08-3).
 */
export function restartIntake({intake,record=[],referenceState=null,asOf,screen}){
 const rows=Array.isArray(record)?record:[],readiness=rows.filter(o=>o?.fact===READINESS_DECLARED).sort((a,b)=>Date.parse(a.declaredAt)-Date.parse(b.declaredAt)).at(-1)??null;
 const after=t=>!readiness||Date.parse(t)>Date.parse(readiness.declaredAt);
 const clinicalBreak=rows.find(o=>o?.fact==='INTERRUPTION_DECLARED'&&after(o.declaredAt)&&(CLINICAL_CATEGORIES_F08.includes(String(o.interruption?.reasonCategory??'').toUpperCase())||screen?.(o.interruption)?.status==='CLINICAL'));
 const continuation=referenceState?.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 if(continuation||clinicalBreak)return {status:'CLINICAL_HUMAN_REQUIRED',reason:'A clinical hold is on record: before a new plan, tell us, sport by sport, that you are ready to train again (readiness declaration); your record keeps being kept',missingInputs:['readiness']};
 const next=clone(intake),a=next.athlete??(next.athlete={});
 const day=String(asOf??next.asOf??'').slice(0,10),done=rows.filter(executed).map(dayOfRow).filter(d=>isoDay(d)&&d<=day).sort();
 const lastBy=s=>rows.filter(o=>executed(o)&&sportOf(o)===s).map(dayOfRow).filter(d=>isoDay(d)&&d<=day).sort().at(-1)??null;
 const daysSince=d=>d?gap(d,day):null,byDays={RUN:daysSince(lastBy('RUN')),STRENGTH:daysSince(lastBy('STRENGTH'))},any=daysSince(done.at(-1)??null);
 // The athlete may state the pause's reason; its length per sport comes from the record whenever the intake does not state it.
 if((a.pause===undefined||isObj(a.pause)&&a.pause.weeks===undefined)&&any!==null){const days=Math.max(...Object.values(byDays).filter(Number.isInteger),any),weeks=Math.floor(days/7);if(days>0)a.pause={...(isObj(a.pause)?a.pause:{}),weeks,...(readiness?{readinessDeclared:true}:{}),bySportDays:clone(byDays)};}
 // C-Q08-1: the record bounds the stated recent exposure (the last 28 days it covers).
 const from=isoDay(day)?addDays(day,-28):null,runRows=rows.filter(o=>executed(o)&&sportOf(o)==='RUN'&&from&&dayOfRow(o)>from&&dayOfRow(o)<=day);
 const shown={minutes:Math.round(runRows.reduce((n,o)=>n+(Number(o.actual?.minutes)||Number(o.context?.runMinutes)||0),0)/4),days:Math.min(7,Math.ceil(new Set(runRows.map(dayOfRow)).size/4))},bounded=[];
 if(rows.some(executed)&&isObj(a.recent)){
  if(Number.isFinite(a.recent.runMinutesPerWeek)&&a.recent.runMinutesPerWeek>shown.minutes){a.recent={...a.recent,runMinutesPerWeek:shown.minutes};bounded.push('recent.runMinutesPerWeek');}
  if(Number.isInteger(a.recent.runDaysPerWeek)&&a.recent.runDaysPerWeek>shown.days){a.recent={...a.recent,runDaysPerWeek:shown.days};bounded.push('recent.runDaysPerWeek');}
 }
 const strength=readiness?.readiness?.sports?.STRENGTH,restrictions=strength?.ready?strength.restrictions??[]:[];
 const notReady=readiness?Object.entries(readiness.readiness.sports??{}).filter(([,x])=>!x.ready).map(([s])=>s):[];
 a.restart=readiness?{readinessEventId:readiness.eventId,strengthRestrictions:clone(restrictions),notReady:clone(notReady),minimumClass:'MODERATE',fromRecord:true}:{readinessEventId:null,strengthRestrictions:[],fromRecord:true};
 const prior={lastExecutedDay:done.at(-1)??null,lastExecutedBySport:{RUN:lastBy('RUN'),STRENGTH:lastBy('STRENGTH')},observations:rows.filter(o=>o&&!o.fact).length};
 return {status:'READY',intake:next,carried:{record:clone(rows),priorCapacity:prior,boundedByRecord:bounded,note:'History and prior capacity are context only: the new plan starts from current capacity (the cold start), never from prior doses'}};
}
