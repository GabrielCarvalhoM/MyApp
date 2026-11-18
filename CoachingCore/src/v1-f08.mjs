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

export const WELLBEING_DECLARED='WELLBEING_DECLARED',READINESS_DECLARED='READINESS_DECLARED',WELLBEING_CHECKED='WELLBEING_CHECKED',CLINICAL_HOLD='CLINICAL_HOLD';
/** V1 Coaching Integration Boundary (SEC-V1CPI-06 tombstone design, SEC-V1CP-14, Security C6): the append-only marker custody writes when F08 rows are
 * erased (their content removed, with every row that references them). The core never reads an erased fact as absent: the marker is a clinical hold
 * of unknown cause, standing from the erasure until a later readiness declaration (the athlete's legitimate way back). It carries ids and times only. */
export const ERASED_F08='ERASED_F08';
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
const unrecognized=(prefix,keys)=>({ask:{action:'ASK',reason:`${keys.length} answer${keys.length>1?'s are':' is'} not part of this form and ${keys.length>1?'are':'is'} not read; free text is never read here`,missingInputs:[prefix+'.unrecognized']}});
const ask=(missingInputs,reason)=>({ask:{action:'ASK',reason,missingInputs}});
const human=list=>list.map(k=>k.replace(/([A-Z])/g,' $1').toLowerCase()).join(', ');
/** The clinical route of a warning sign (RF-3): the hold for every sport, a professional assessment, the record kept; never a diagnosis (RF-4). */
/** V1CP Fix-Forward D5 (Founder; SSCTR-FF-Q9, C-FF9-1): the guidance level of a clinical route, derived only from the items answered yes (the higher one
 * when several): urgent care for chest pain, pressure or tightness, breathlessness or palpitations at rest, fainting or dizziness, and breathlessness,
 * chest symptoms, dizziness or a racing heart with exercise; a professional assessment otherwise. Interim wording, pending the clinical authority (G04). */
export const URGENT_SIGNS=Object.freeze([WS.W2,WS.W3,WS.W4,WS.W5,EXERCISE_SIGNS.X1]);
export const guidanceOf=(yes=[])=>({level:yes.some(k=>URGENT_SIGNS.includes(k))?'URGENT_CARE_ADVISED':'PROFESSIONAL_ASSESSMENT',wordingStatus:'INTERIM_PENDING_G04'});
export const signRoute=(yes,{lead='You reported'}={})=>{const g=guidanceOf(yes),urgent=g.level==='URGENT_CARE_ADVISED';return {action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:`${lead} ${yes.length>1?'warning signs':'a warning sign'} (${human(yes)}): ${urgent?'stop now and seek urgent medical care; if it is severe or does not settle, call your local emergency number':'stop training and seek a professional assessment'}; no training is planned while it stands, and your record keeps being kept. When you are ready to train again, you can tell us sport by sport`,warningSigns:[...yes],guidance:g};};
/** V1CP Fix-Forward SB-2 (SEC-V1CPR-03, RC-01): the warning signs and exercise-response items a payload answers yes, whatever else it holds. */
export const signsYesIn=p=>isObj(p)?[...ALL_W.filter(k=>isObj(p.warningSigns)&&p.warningSigns[k]===true),...ALL_X.filter(k=>isObj(p.exerciseResponse)&&p.exerciseResponse[k]===true)]:[];
/** Reads a group of booleans: the keys answered yes (any key of the group, asked or not), the asked keys not answered no, and keys outside it. */
function readBooleans(o,asked,group,prefix){
 const x=isObj(o)?o:{},yes=group.filter(k=>x[k]===true),missing=asked.filter(k=>x[k]!==false&&x[k]!==true).map(k=>prefix+'.'+k);
 return {yes,missing,bad:[...(unknownKeys(x,group).length?[prefix+'.unrecognized']:[]),...group.filter(k=>k in x&&typeof x[k]!=='boolean').map(k=>prefix+'.'+k)],answered:isObj(o)};
}

/**
 * Situation 1 entry. `w` is review.wellbeing; `today` the decision's local date; `programmed` the sports the plan programs.
 * Returns {clinical} when a warning sign is yes, {ask} when an item is missing, refused or outside the vocabulary, else {value}: the normalized
 * report with the affected sports, the region of strength rows a local report limits, the window and its rung.
 */
export function readWellbeing(w,{today,programmed}){
 if(!isObj(w))return ask(['wellbeing'],'Say how you are: the condition, the warning signs, what you want to do and for how many days');
 const extra=unknownKeys(w,['condition','sports','region','warningSigns','intent','days','startDate','endDate','returnSpeed']);
 if(extra.length)return unrecognized('wellbeing',extra);
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
 // V1CP Fix-Forward (SSCTR-FF-Q6): a report continuing a chain may be shorter than 3 days (the chain already holds the reduction); a new window keeps
 // the Founder's 3 to 14 days, which notFeeling100 checks.
 if(days===null)missing.push('wellbeing.days');else if(!Number.isInteger(days)||days<1||days>WINDOW_DAYS.max)bad.push('wellbeing.days');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): a condition and an intent from the list, every warning sign answered yes or no, a window of '+WINDOW_DAYS.min+' to '+WINDOW_DAYS.max+' days starting today');
 if(missing.length)return ask(missing,'Answer every item: the condition, each warning sign (yes or no), what you want to do and for how many days');
 if(!sports.length)return ask(['wellbeing.sports'],'What you reported affects no sport your plan has: say which sport it affects');
 const region=w.region==='UPPER_BODY'?'UPPER':w.region==='LOWER_BODY'?'LOWER':null;
 if(region&&!sports.includes('STRENGTH'))return ask(['wellbeing.region'],'A body region limits strength rows only: this report does not affect strength');
 return {value:{condition:w.condition,systemic,sports,region,intent:w.intent,rung:INTENT_RUNG[w.intent],returnSpeed:w.returnSpeed??'BALANCED',startDate:start,endDate:addDays(start,days-1),days}};
}
/** The record row of a Situation 1 report (append-only; its own channel, never a declared break: RC-07, C-Q05-6). */
/** SEC-V1CPI-04: every F08 row carries the digest of its own content; a row whose content no longer matches it is never read. */
export const sealed=row=>({...row,rowHash:hash(row)});
const intact=o=>{const {rowHash,...x}=o;return typeof rowHash==='string'&&rowHash===hash(x);};
export const wellbeingFact=(program,review,asOf,value)=>sealed({fact:WELLBEING_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,wellbeing:clone(value),inputHash:hash(review.wellbeing),provenance:{firstRecordedAt:asOf}});

/**
 * A check inside a Situation 1 episode (`c` = review.wellbeingCheck): the warning signs of the episode's condition, re-answered (C-Q05-4); the
 * exercise-response items when `exercise` (sessions executed or an adverse one reported); whether the condition resolved or clearly improved when
 * `improved` (the window-end check, C-Q05-1); a change of return speed only while `speed` (before the return starts, Q06). {clinical} on any yes.
 */
export function readCheck(c,{condition,improved=false,allowImproved=false,exercise=false,speed=false,signs=null,xsigns=null,due=null,early=[]}){
 // V1CP Fix-Forward NB-1 (CH-r2-6): with `due` (the conditions at or past their own end) and `early` (those that may end early), improvement is answered
 // per condition: `improved` is one yes or no when a single condition is concerned, else an object {CONDITION: yes or no}; every due one is answered.
 const per=Array.isArray(due),open=per?[...due,...early]:[],asksImproved=per?due.length>0:improved;
 const said=list=>list.map(k=>k.split('@')[0].toLowerCase().replace(/_/g,' ')+(k.includes('@')?` (report ${k.split('@')[1]})`:'')).join(', ');
 if(!isObj(c))return ask(['wellbeingCheck'],`Tell us how you are: each warning sign (yes or no)${exercise?', how your sessions felt (each exercise-response item)':''}${asksImproved?`, and whether ${per&&due.length>1?`each of these has passed or clearly improved: ${said(due)}`:'it has passed or clearly improved'}`:''}`);
 const extra=unknownKeys(c,['warningSigns','exerciseResponse','improved','returnSpeed']);
 if(extra.length)return unrecognized('wellbeingCheck',extra);
 const asked=signs??signsFor(condition),xasked=xsigns??exerciseSignsFor(condition),s=readBooleans(c.warningSigns,asked,ALL_W,'wellbeingCheck.warningSigns'),x=readBooleans(c.exerciseResponse,exercise?xasked:[],ALL_X,'wellbeingCheck.exerciseResponse');
 if(s.yes.length||x.yes.length)return {clinical:signRoute([...s.yes,...x.yes])};
 const missing=[...s.missing,...x.missing],bad=[...s.bad,...x.bad];
 let improvedBy=null;
 if(per){
  const single=open.length===1?open[0]:due.length===1?due[0]:null;
  if(typeof c.improved==='boolean'){if(single)improvedBy={[single]:c.improved};else bad.push('wellbeingCheck.improved');}
  // V1CP Fix-Forward cycle (SEC-FFR-01): a key that is not an open condition is never echoed back (free text): it is reported once, as unrecognized.
  else if(isObj(c.improved)){improvedBy={};let unknown=0;for(const [k,a] of Object.entries(c.improved)){if(!open.includes(k))unknown++;else if(typeof a!=='boolean')bad.push('wellbeingCheck.improved.'+k);else improvedBy[k]=a;}if(unknown)bad.push('wellbeingCheck.improved.unrecognized');for(const k of due)if(!(k in improvedBy))missing.push('wellbeingCheck.improved.'+k);}
  else if(c.improved!==undefined)bad.push('wellbeingCheck.improved');
  else if(due.length)missing.push(...(due.length===1?['wellbeingCheck.improved']:due.map(k=>'wellbeingCheck.improved.'+k)));
 }else{
  if(improved&&typeof c.improved!=='boolean')(c.improved===undefined?missing:bad).push('wellbeingCheck.improved');
  if(!improved&&!allowImproved&&c.improved!==undefined)bad.push('wellbeingCheck.improved');
  if(allowImproved&&c.improved!==undefined&&typeof c.improved!=='boolean')bad.push('wellbeingCheck.improved');
 }
 if(c.returnSpeed!==undefined&&!RETURN_SPEEDS.includes(c.returnSpeed))bad.push('wellbeingCheck.returnSpeed');
 else if(c.returnSpeed!==undefined&&!speed)return ask(['wellbeingCheck.returnSpeed'],'Your return has started: its speed no longer changes. The plan keeps following what you execute');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): each item yes or no'+(per&&open.length>1?`, and for each of ${said(open)} whether it has passed or clearly improved`:''));
 if(missing.length)return ask(missing,`Answer every item: each warning sign (yes or no)${exercise?' and each exercise-response item':''}${asksImproved?`, and whether ${per&&due.length>1?`each of these has passed or clearly improved: ${said(due)}`:'it has passed or clearly improved'}`:''}`);
 const one=improvedBy&&Object.keys(improvedBy).length===1?Object.values(improvedBy)[0]:null;
 return {value:{improved:per?one:improved||allowImproved?c.improved??null:null,...(improvedBy?{improvedBy}:{}),returnSpeed:c.returnSpeed??null,warningSigns:Object.fromEntries(asked.map(k=>[k,false])),...(exercise?{exerciseResponse:Object.fromEntries(xasked.map(k=>[k,false]))}:{})}};
}
/** V1CP Fix-Forward NB-1: a check that answered several open episodes names the kind it had for each one (`kinds`); `episode` is the latest of them. */
export const checkFact=(program,review,asOf,episode,value,kind,kinds=null)=>sealed({fact:WELLBEING_CHECKED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,episode,check:{...clone(value),kind,...(kinds?{kinds:clone(kinds)}:{})},inputHash:hash(review.wellbeingCheck),provenance:{firstRecordedAt:asOf}});

/**
 * Situation 2 entry: the athlete's readiness declaration (`r` = review.readiness). Every warning sign is answered (any yes keeps the hold for every
 * sport); every programmed sport is answered (ready yes or no); restrictions come from the closed vocabulary only (RC-08, RC-09); with
 * AVOID_LOWER_BODY_STRENGTH, running restarts only on its own explicit answer that running is not restricted (Q07, PCG Q4 f); the speed is
 * BALANCED (default) or CONSERVATIVE, never FASTER (Q07). {ask} when anything is missing or outside the vocabulary; else {value}.
 */
export function readReadiness(r,{programmed}){
 if(!isObj(r))return ask(['readiness'],'Tell us, sport by sport, whether you are ready to train again, and answer each warning sign');
 const extra=unknownKeys(r,['hold','declaredRecovered','sports','warningSigns','returnSpeed']);
 if(extra.length)return unrecognized('readiness',extra);
 const signs=readBooleans(r.warningSigns,READINESS_SIGNS,ALL_W,'readiness.warningSigns');
 if(signs.yes.length)return {clinical:signRoute(signs.yes)};
 const missing=[...signs.missing],bad=[...signs.bad];
 if(r.declaredRecovered!==true)(r.declaredRecovered===undefined?missing:bad).push('readiness.declaredRecovered');
 if(r.returnSpeed!==undefined&&!['BALANCED','CONSERVATIVE'].includes(r.returnSpeed))bad.push('readiness.returnSpeed');
 const sports=isObj(r.sports)?r.sports:{},out={};
 if(unknownKeys(sports,['RUN','STRENGTH']).length)bad.push('readiness.sports.unrecognized');
 const lowerAvoided=Array.isArray(sports.STRENGTH?.restrictions)&&sports.STRENGTH.restrictions.includes('AVOID_LOWER_BODY_STRENGTH');
 // SEC-V1CPI-09: a sport the plan does not program is still validated when sent (its answers are not used).
 for(const s of ['RUN','STRENGTH'].filter(x=>!programmed.includes(x)&&sports[x]!==undefined)){const x=sports[s];if(!isObj(x)||unknownKeys(x,s==='RUN'?['ready','runningNotRestricted']:['ready','restrictions']).length||x.ready!==undefined&&typeof x.ready!=='boolean'||s==='STRENGTH'&&x.restrictions!==undefined&&(!Array.isArray(x.restrictions)||x.restrictions.some(c=>!RESTRICTIONS.includes(c))))bad.push(`readiness.sports.${s}`);}
 for(const s of programmed){
  const x=sports[s];
  if(!isObj(x)){missing.push(`readiness.sports.${s}.ready`);continue;}
  if(unknownKeys(x,s==='RUN'?['ready','runningNotRestricted']:['ready','restrictions']).length)bad.push(`readiness.sports.${s}.unrecognized`);
  if(typeof x.ready!=='boolean'){missing.push(`readiness.sports.${s}.ready`);continue;}
  if(s==='STRENGTH'){
   // SEC-V1CPI-05: restrictions are answered too (an empty list is the answer "none"); never read as none by default (RC-08).
   if(x.ready&&x.restrictions===undefined){missing.push('readiness.sports.STRENGTH.restrictions');continue;}
   const list=x.restrictions===undefined?[]:x.restrictions;
   if(!Array.isArray(list)||list.some(c=>!RESTRICTIONS.includes(c))){bad.push('readiness.sports.STRENGTH.restrictions');continue;}
   out[s]={ready:x.ready,restrictions:[...new Set(list)].sort()};continue;
  }
  // Running with a lower-body strength restriction: the software infers nothing; the athlete answers whether running itself is restricted.
  if(x.ready&&lowerAvoided&&programmed.includes('STRENGTH')){
   if(typeof x.runningNotRestricted!=='boolean'){(x.runningNotRestricted===undefined?missing:bad).push('readiness.sports.RUN.runningNotRestricted');continue;}
   out[s]={ready:x.runningNotRestricted===true,...(x.runningNotRestricted?{}:{heldBy:'RUNNING_RESTRICTED'})};continue;
  }
  // SEC-V1CPI-09: running stated as restricted is asked, never ignored.
  if(x.runningNotRestricted!==undefined&&x.runningNotRestricted!==true)bad.push('readiness.sports.RUN.runningNotRestricted');
  out[s]={ready:x.ready};
 }
 const hold=isObj(r.hold)?r.hold:null;
 if(r.hold!==undefined&&(!hold||!Object.keys(hold).length||unknownKeys(hold,['episodeId','eventId']).length||Object.values(hold).some(v=>typeof v!=='string')))bad.push('readiness.hold');
 if(bad.length)return ask(bad,'Some answers are outside the options ('+bad.join(', ')+'): each sport ready yes or no, restrictions from the list only, each warning sign yes or no, a balanced or conservative restart');
 if(missing.length)return ask(missing,'Answer every item: each warning sign, that you recovered, for each sport whether you are ready to train again'+(lowerAvoided?', and whether running itself is restricted':''));
 return {value:{declaredRecovered:true,sports:out,returnSpeed:r.returnSpeed??'BALANCED',warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),hold:hold?clone(hold):null}};
}
export const readinessFact=(program,review,asOf,value,hold)=>sealed({fact:READINESS_DECLARED,eventId:review.event.id,athleteId:program.athleteId,declaredAt:asOf,readiness:{...clone(value),hold:clone(hold)},inputHash:hash(review.readiness),provenance:{firstRecordedAt:asOf}});
/** SEC-V1CPI-03: a clinical hold a decision opens is a fact of the record (no reason text: minimisation, SEC-V1CP-01), so a new plan reads every
 * standing hold from the record, never only from a reference state the client keeps; a readiness declaration after it releases it. */
// V1CP Fix-Forward (SEC-V1CPR-06, minimisation): the row holds only what a later decision reads: who, when, and the decision's event id.
export const holdFact=(program,eventId,asOf)=>sealed({fact:CLINICAL_HOLD,eventId,athleteId:program.athleteId,declaredAt:asOf,provenance:{firstRecordedAt:asOf}});
export const isF08Fact=o=>isObj(o)&&[WELLBEING_DECLARED,READINESS_DECLARED,WELLBEING_CHECKED,CLINICAL_HOLD,ERASED_F08].includes(o.fact);
/** The erasure marker (SEC-V1CPI-06): sealed like every F08 row, with the erased event ids only. */
export const erasureFact=({athleteId,eventId,asOf,erased})=>sealed({fact:ERASED_F08,eventId,athleteId,declaredAt:asOf,erased:[...erased].sort(),provenance:{firstRecordedAt:asOf}});
// V1 Coaching Integration Boundary (CF-OBS-1; Security Q2): a readiness declaration row reads only as the declaration it can be (every warning sign
// answered no, the recovery stated, the sports answered): any other content is unreadable, so it never releases a hold (callers fail closed).
const declarationOk=r=>isObj(r)&&r.declaredRecovered===true&&isObj(r.sports)&&isObj(r.warningSigns)&&READINESS_SIGNS.every(k=>r.warningSigns[k]===false);
const shapeOk=o=>o.fact===WELLBEING_DECLARED?isObj(o.wellbeing)&&CONDITIONS.includes(o.wellbeing.condition)&&isoDay(o.wellbeing.startDate)&&isoDay(o.wellbeing.endDate):o.fact===WELLBEING_CHECKED?typeof o.episode==='string'&&isObj(o.check):o.fact===READINESS_DECLARED?declarationOk(o.readiness):o.fact===ERASED_F08?Array.isArray(o.erased)&&o.erased.length>0&&o.erased.every(x=>typeof x==='string'):o.fact===CLINICAL_HOLD;
/**
 * V1 Coaching Integration Boundary CF-OBS-1 (PCG-V1CPFF-CFOBS1-r1 Q1, Q2; Security C2 Q2; QRE): the one standing-hold predicate, shared by every entry
 * point. `rows` are the athlete's readable F08 rows (readableF08). A clinical hold stands while a CLINICAL_HOLD row has no later READINESS_DECLARED;
 * the declaration releases it sport by sport (the sports it does not declare ready stay held: Situation 2, SPORT_HELD). Time, sessions, a break, a
 * report, a check, RECOVERED, an eligibility re-answer, an omitted or altered reference state or a relayed clearance never release it. Returns the
 * standing hold rows, oldest first, and the latest declaration.
 */
export function standingHolds(rows){
 const list=Array.isArray(rows)?rows:[],lastReady=list.filter(o=>o.fact===READINESS_DECLARED).sort((a,b)=>Date.parse(a.declaredAt)-Date.parse(b.declaredAt)).at(-1)??null;
 // An erasure marker is a hold of unknown cause (SEC-V1CPI-06): erased F08 facts are never read as absent.
 return {holds:list.filter(o=>(o.fact===CLINICAL_HOLD||o.fact===ERASED_F08)&&(!lastReady||Date.parse(o.declaredAt)>Date.parse(lastReady.declaredAt))).sort((a,b)=>Date.parse(a.declaredAt)-Date.parse(b.declaredAt)),lastReady};
}
/**
 * SEC-V1CPI-04: the F08 rows a decision reads: this athlete's, declared by the decision's clock (`at`, epoch ms), of their type's shape and intact;
 * a check only with the report of its own episode. Every row still travels with the record unchanged (append-only); an unreadable one is never read.
 */
export function readableF08(rows,{athleteId,at}){
 const ok=o=>isF08Fact(o)&&o.athleteId===athleteId&&typeof o.eventId==='string'&&typeof o.declaredAt==='string'&&Number.isFinite(Date.parse(o.declaredAt))&&Date.parse(o.declaredAt)<=at&&intact(o)&&shapeOk(o);
 // V1CP Fix-Forward QRE-V1CPR-02: a check belongs to a Situation 1 report or, during a readiness restart (S6), to the readiness declaration.
 const first=(Array.isArray(rows)?rows:[]).filter(ok),episodes=new Set(first.filter(o=>o.fact===WELLBEING_DECLARED||o.fact===READINESS_DECLARED).map(o=>o.eventId));
 return first.filter(o=>o.fact!==WELLBEING_CHECKED||episodes.has(o.episode)&&Object.keys(o.check?.kinds??{}).every(id=>episodes.has(id)));
}

/**
 * V1CP Fix-Forward SB-3 (SEC-V1CPR-01, QRE-V1CPR-03; SEC-V1CP-14): the F08 rows of a record that cannot be read with integrity for this athlete,
 * whatever their date: another athlete's, without a string id or a valid time, altered after sealing, of the wrong shape, or a check whose report
 * or declaration is not on record. A hold, a restriction or an episode is never read as absent because its row is unreadable: callers fail closed.
 * Counts by cause only; no row content is returned.
 */
export function unreadableF08(rows,{athleteId}){
 const list=(Array.isArray(rows)?rows:[]).filter(isF08Fact),cause=o=>o.athleteId!==athleteId?'foreign':typeof o.eventId!=='string'||!o.eventId||typeof o.declaredAt!=='string'||!Number.isFinite(Date.parse(o.declaredAt))?'malformed':!intact(o)||!shapeOk(o)?'altered':null;
 const owners=new Set(list.filter(o=>!cause(o)&&(o.fact===WELLBEING_DECLARED||o.fact===READINESS_DECLARED)).map(o=>o.eventId));
 const out={foreign:0,malformed:0,altered:0,orphanCheck:0};
 for(const o of list){const c=cause(o)??(o.fact===WELLBEING_CHECKED&&(!owners.has(o.episode)||Object.keys(o.check?.kinds??{}).some(id=>!owners.has(id)))?'orphanCheck':null);if(c)out[c]++;}
 const total=out.foreign+out.malformed+out.altered+out.orphanCheck;return total?{...out,total}:null;
}
// ---------- Situation 3 (DR-148 path 3; PCG-V1CP-F08 RC-11, RC-14; SSCTR-V1CP Q08): a new plan after a long interruption ----------
const CLINICAL_CATEGORIES_F08=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'];
const sportOf=o=>{const t=String(o?.context?.sessionType??o?.context?.sport??'');return t.startsWith('RUN')?'RUN':t.startsWith('STRENGTH')?'STRENGTH':null;};
const dayOfRow=o=>o.localDate??String(o.occurrenceDate??o.observedAt??'').slice(0,10);
// CORE-C2-F01: a row a correction replaced (`superseded`) is history the record keeps, not an execution of its own: only the rows in force show
// training done, as every other V1 reader reads them, and an event the record holds twice is one execution (`once`).
const executed=o=>o&&!o.fact&&!o.conflicted&&o.superseded!==true&&(o.actual?.completed===true||Number(o.actual?.minutes)>0);
const once=list=>{const seen=new Set();return list.filter(o=>typeof o?.eventId!=='string'||!executed(o)||(seen.has(o.eventId)?false:(seen.add(o.eventId),true)));};
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
export function restartIntake({intake,record=[],referenceState=null,asOf,screen,athleteId=null}){
 const all=Array.isArray(record)?record:[],day0=String(asOf??intake?.asOf??'').slice(0,10),at=isoDay(day0)?Date.parse(day0+'T23:59:59Z')+14*3600e3:Date.now();
 // Only this athlete's readable F08 rows are read (SEC-V1CPI-04); every row travels with the record.
 const owner=athleteId??intake?.athlete?.id??null,f08=readableF08(all,{athleteId:owner,at}),rows=[...all.filter(o=>!isF08Fact(o)),...f08];
 // V1CP Fix-Forward SB-3 (SEC-V1CPR-01, QRE-V1CPR-03; SEC-V1CP-23): the record a new plan reads is this athlete's, as kept, up to this restart's date.
 // A row that cannot be read for this athlete (another athlete's, altered, malformed, a check without its report) or that is dated after the
 // restart holds the new plan: never read as no hold, no restriction or no episode. Counts only; no content.
 const bad=unreadableF08(all,{athleteId:owner}),foreign=all.filter(o=>o&&typeof o==='object'&&!isF08Fact(o)&&typeof o.athleteId==='string'&&o.athleteId!==owner).length;
 const later=all.filter(o=>o&&typeof o==='object'&&(isF08Fact(o)||o.fact)?Number.isFinite(Date.parse(o.declaredAt))&&Date.parse(o.declaredAt)>at:isoDay(dayOfRow(o??{}))&&isoDay(day0)&&dayOfRow(o)>day0).length;
 if(bad||foreign||later)return {status:'HOLD',reason:`${(bad?.total??0)+foreign+later} record row${(bad?.total??0)+foreign+later>1?'s':''} cannot be read for this athlete at this date (another athlete's, dated after this restart, or altered): no new plan is made over them; send this athlete's record as kept, with today's date`,missingInputs:['record'],unreadable:{...(bad??{}),foreignRows:foreign,laterThanRestart:later}};
 const readiness=rows.filter(o=>o?.fact===READINESS_DECLARED).sort((a,b)=>Date.parse(a.declaredAt)-Date.parse(b.declaredAt)).at(-1)??null;
 const after=t=>!readiness||Date.parse(t)>Date.parse(readiness.declaredAt);
 const clinicalBreak=rows.find(o=>o?.fact==='INTERRUPTION_DECLARED'&&after(o.declaredAt)&&(CLINICAL_CATEGORIES_F08.includes(String(o.interruption?.reasonCategory??'').toUpperCase())||screen?.(o.interruption)?.status==='CLINICAL'));
 const continuation=referenceState?.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 // SEC-V1CPI-03, QRE-V1CP-03: a clinical hold the record holds after the latest declaration blocks the new plan, whatever reference is sent
 // (V1CIB CF-OBS-1: the shared standing-hold predicate).
 const heldOnRecord=standingHolds(f08).holds.length>0;
 if(continuation||clinicalBreak||heldOnRecord)return {status:'CLINICAL_HUMAN_REQUIRED',reason:'A clinical hold is on record: before a new plan, tell us, sport by sport, that you are ready to train again (readiness declaration); your record keeps being kept',missingInputs:['readiness']};
 const next=clone(intake),a=next.athlete??(next.athlete={});
 const day=String(asOf??next.asOf??'').slice(0,10),done=rows.filter(executed).map(dayOfRow).filter(d=>isoDay(d)&&d<=day).sort();
 const lastBy=s=>rows.filter(o=>executed(o)&&sportOf(o)===s).map(dayOfRow).filter(d=>isoDay(d)&&d<=day).sort().at(-1)??null;
 const daysSince=d=>d?gap(d,day):null,byDays={RUN:daysSince(lastBy('RUN')),STRENGTH:daysSince(lastBy('STRENGTH'))},any=daysSince(done.at(-1)??null);
 // The record's pause, per sport (Q08), as restart facts: a stated pause never shortens it (QRE-V1CP-06); a stated cause is screened as stated.
 const facts={pause:null,restart:null};
 // V1CP Fix-Forward SB-1 (SEC-V1CPI-02 residual, RC-11): the declaration stands in only for the stop it answered. With a session executed after it,
 // the stop now read from the record is a new one: screened as the athlete states it, and a missing reason is asked, as with no declaration.
 const trainedAfter=!!readiness&&rows.some(o=>executed(o)&&Date.parse(o.observedAt??'')>Date.parse(readiness.declaredAt));
 if(any!==null){const days=Math.max(...Object.values(byDays).filter(Number.isInteger),any);if(days>0)facts.pause={weeks:Math.floor(days/7),bySportDays:clone(byDays),...(readiness&&!trainedAfter?{readinessDeclared:true}:{})};}
 else if(readiness)facts.pause={weeks:0,bySportDays:{RUN:null,STRENGTH:null},readinessDeclared:true};
 // C-Q08-1: the record bounds the stated recent exposure (the last 28 days it covers).
 const from=isoDay(day)?addDays(day,-28):null,runRows=once(rows).filter(o=>executed(o)&&sportOf(o)==='RUN'&&from&&dayOfRow(o)>from&&dayOfRow(o)<=day);
 const shown={minutes:Math.round(runRows.reduce((n,o)=>n+(Number(o.actual?.minutes)||Number(o.context?.runMinutes)||0),0)/4),days:Math.min(7,Math.ceil(new Set(runRows.map(dayOfRow)).size/4))},bounded=[];
 if(rows.some(executed)&&isObj(a.recent)){
  if(Number.isFinite(a.recent.runMinutesPerWeek)&&a.recent.runMinutesPerWeek>shown.minutes){a.recent={...a.recent,runMinutesPerWeek:shown.minutes};bounded.push('recent.runMinutesPerWeek');}
  if(Number.isInteger(a.recent.runDaysPerWeek)&&a.recent.runDaysPerWeek>shown.days){a.recent={...a.recent,runDaysPerWeek:shown.days};bounded.push('recent.runDaysPerWeek');}
 }
 const strength=readiness?.readiness?.sports?.STRENGTH,restrictions=strength?.ready?strength.restrictions??[]:[];
 const notReady=readiness?Object.entries(readiness.readiness.sports??{}).filter(([,x])=>!x.ready).map(([s])=>s):[];
 // V1CP Fix-Forward SEC-V1CPR-05: the breaks this restart read, by event id: only they are the previous plan's history for the new plan.
 const readBreakIds=[...new Set(rows.filter(o=>o?.fact==='INTERRUPTION_DECLARED'&&typeof o.eventId==='string').map(o=>o.eventId))].sort();
 facts.restart=readiness?{readinessEventId:readiness.eventId,strengthRestrictions:clone(restrictions),notReady:clone(notReady),minimumClass:'MODERATE',fromRecord:true,asOf:day0,readBreakIds}:{readinessEventId:null,strengthRestrictions:[],fromRecord:true,asOf:day0,readBreakIds};
 const prior={lastExecutedDay:done.at(-1)??null,lastExecutedBySport:{RUN:lastBy('RUN'),STRENGTH:lastBy('STRENGTH')},observations:rows.filter(o=>o&&!o.fact).length};
 return {status:'READY',intake:next,facts,carried:{record:clone(all),priorCapacity:prior,boundedByRecord:bounded,note:'History and prior capacity are context only: the new plan starts from current capacity (the cold start), never from prior doses'}};
}
