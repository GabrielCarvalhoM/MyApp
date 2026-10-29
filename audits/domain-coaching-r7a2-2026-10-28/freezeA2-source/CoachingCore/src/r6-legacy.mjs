import {clone,freeze,hash} from './value.mjs';
import {validateProgramInput,validatePrescription,changedDimensions,anchorConfigurationHash,levelIntent,onDate,daysBetween,dateValid} from './r5-contract.mjs';
import {scheduleCandidates} from './r5-schedule.mjs';
import {programAuthority} from './r5-authority.mjs';
import {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement} from './r5-learning.mjs';
import {sessionContext,reviewKinds} from './r5-review-context.mjs';
import {bindActual} from './r5-observation.mjs';
import {previousValidity,referenceResult} from './r5-validity.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {chooseBalanced,interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {normalizeObservations,utcTimestamp} from './r6-provenance.mjs';
import {racePrescription,roundTo5,reducedWork} from './r6-prescription.mjs';
import {screenInterruptionReason,isYes} from './r6-clinical.mjs';

/**
 * R5-INPUT-1 compatibility path with the R6 root-cause corrections. The frozen R5 runtime is untouched; this module
 * re-reads the same input contract so the frozen R5 holdout can be replayed as a regression, never as fresh evidence.
 */
export const LEGACY_PROGRAM_VERSION='R6-LEGACY-PROGRAM-1';
export function legacyProgramHash(p){const c=clone(p);delete c.hash;return hash(c);}
export const validLegacyProgram=p=>p?.version===LEGACY_PROGRAM_VERSION&&p.hash===legacyProgramHash(p);
const HORIZONS=['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'];
const LEAD={RUN_FIRST:'RUN',STRENGTH_FIRST:'STRENGTH',BALANCED:'JOINT'};
const EASY_FAMILIES=['EASY','LONG','WALK_JOG'];
const current=(observedAt,asOf)=>dateValid(observedAt)&&daysBetween(observedAt,asOf)>=0&&daysBetween(observedAt,asOf)<=28;
/**
 * Direction of an alternative against its anchor. A dependent dimension follows its primary one: a strength session
 * with fewer sets is shorter; a shorter easy run has shorter preparation. Mixed directions remain unsupported.
 */
export function legacyDirection(a,b){
 const dims=changedDimensions(a,b),deltas={};
 if(dims.includes('DURATION'))deltas.DURATION=b.durationMinutes-a.durationMinutes;
 if(dims.includes('PREPARATION'))deltas.PREPARATION=(b.warmupMinutes+b.cooldownMinutes)-(a.warmupMinutes+a.cooldownMinutes);
 for(const k of ['repetitions','workMinutes'])if(dims.includes('WORK_'+k.toUpperCase()))deltas['WORK_'+k.toUpperCase()]=(b.work?.[k]??0)-(a.work?.[k]??0);
 if(a.modality==='STRENGTH'&&!dims.includes('EXERCISE'))for(const [name,key] of [['LOAD','load'],['REPS','reps'],['SETS','sets'],['RIR','rir']])if(dims.includes(name))deltas[name]=b.exercises.reduce((n,e,i)=>n+Math.sign((key==='load'?e.load.value-a.exercises[i].load.value:e[key]-a.exercises[i][key])*(key==='rir'?-1:1)),0);
 const unsupported=dims.filter(d=>!Object.hasOwn(deltas,d));
 if(unsupported.length)return {direction:'UNSUPPORTED',dims,reason:'Unsupported changed dimension(s): '+unsupported.join(',')};
 const dependent=new Set();
 if(a.modality==='STRENGTH'&&deltas.DURATION!==undefined&&['SETS','REPS'].some(d=>deltas[d]!==undefined&&Math.sign(deltas[d])===Math.sign(deltas.DURATION)))dependent.add('DURATION');
 if(a.modality==='RUN'&&deltas.PREPARATION!==undefined&&deltas.DURATION!==undefined&&Math.sign(deltas.PREPARATION)===Math.sign(deltas.DURATION))dependent.add('PREPARATION');
 const primary=Object.entries(deltas).filter(([d])=>!dependent.has(d)),signs=new Set(primary.map(([,v])=>Math.sign(v)).filter(Boolean));
 if(primary.length>1)return {direction:'UNSUPPORTED',dims,reason:'More than one primary dose dimension changes'};
 if(signs.size!==1)return {direction:'UNSUPPORTED',dims,reason:'Mixed or null dose direction'};
 return {direction:[...signs][0]>0?'PROGRESS':'REGRESS',dims,primary:primary[0][0],dependent:[...dependent]};
}
/** Alternatives are validated one by one; an invalid unused alternative is excluded, never allowed to block the baseline. */
export function legacyAlternative(anchor,alt,anchors,asOf){
 const reasons=[];
 if(!alt?.id||!['PROGRESS','REGRESS','RECOVERY','SUBSTITUTE'].includes(alt.purpose))return {admissible:false,reasons:['alternative.id/purpose']};
 reasons.push(...validatePrescription(alt.prescription).map(e=>'prescription:'+e));
 if(alt.familiar!==true||alt.tolerated!==true)reasons.push('NOT_FAMILIAR_TOLERATED');
 if(!current(alt.observedAt,asOf))reasons.push('STALE_OR_FUTURE_SUPPORT');
 let direction=null;
 if(['PROGRESS','REGRESS'].includes(alt.purpose)){
  direction=legacyDirection(anchor.prescription,alt.prescription);
  if(alt.prescription.modality!==anchor.prescription.modality||direction.direction!==alt.purpose)reasons.push('DIRECTION:'+(direction.reason??direction.direction));
 }
 if(['PROGRESS','REGRESS','RECOVERY'].includes(alt.purpose)){
  const c=alt.weeklyContext,proposed=anchors.map(a=>a.id===anchor.id?{...a,prescription:alt.prescription}:a);
  if(c?.source!=='SELF_REPORT'||c.recovery!=='COMPATIBLE'||!current(c.observedAt,asOf)||c.baselineHash!==anchorConfigurationHash(anchors)||c.proposedHash!==anchorConfigurationHash(proposed))reasons.push('NO_CURRENT_COMBINED_WEEK_SUPPORT');
 }
 if(alt.purpose==='SUBSTITUTE'&&alt.weeklyContext&&(alt.weeklyContext.recovery==='ADVERSE'||!current(alt.weeklyContext.observedAt,asOf)))reasons.push('SUBSTITUTE_CONTEXT_NOT_CURRENT');
 return {admissible:!reasons.length,reasons,direction};
}
function combinedTolerance(input){
 const t=input.athlete.weeklyTolerance;
 return t?.current===true&&t.source==='SELF_REPORT'&&t.recovery==='COMPATIBLE'&&current(t.observedAt,input.asOf)&&Array.isArray(t.anchorIds)&&hash([...t.anchorIds].sort())===hash(input.athlete.anchors.map(a=>a.id).sort());
}
/**
 * Arrangement candidates. Unknown arrangement-level recovery stays admissible with disclosed uncertainty when current
 * whole-week tolerance covers the same tasks; adverse arrangement evidence still excludes. Unavailable equipment can use
 * an admissible familiar substitute; the stimulus change is disclosed.
 */
export function legacyCandidates(anchors,availability,options,asOf,{weeklyToleranceCovers=false,forbiddenPairs=[],allowOmissions=false}={}){
 const out=[];
 for(const option of options??[]){
  const unknown=option?.evidence?.combinedRecovery==='UNKNOWN'&&weeklyToleranceCovers;
  const opt=unknown?{...option,evidence:{...option.evidence,combinedRecovery:'COMPATIBLE'}}:option;
  const [base]=scheduleCandidates(anchors,availability,[opt],asOf,{allowOmissions,forbiddenPairs});
  const adverse=option?.evidence?.combinedRecovery==='ADVERSE';
  // Unknown arrangement response: only with worst interference LOW or less and no same-day pairing (SSCTR D26).
  if(unknown&&base.admissible){const costs=interferenceCosts(base.sessions.map(s=>({...s,id:s.anchorId})),{wrap:true}),worst=costs.reduce((m,c)=>SEVERITY.indexOf(c.severity)>SEVERITY.indexOf(m)?c.severity:m,'NONE'),pairing=base.sessions.some((s,i)=>base.sessions.some((o,j)=>j>i&&o.day===s.day));if(SEVERITY.indexOf(worst)>SEVERITY.indexOf('LOW')||pairing){base.admissible=false;base.reasons=[...base.reasons,pairing?'Unknown combined response with a same-day pairing needs arrangement evidence':'Unknown combined response with '+worst+' interference needs arrangement evidence'];}}
  out.push({...base,reasons:adverse?['Explicit adverse combined recovery reported for this arrangement',...base.reasons.filter(r=>r!=='Current combined configuration response missing')]:base.reasons,arrangementEvidence:unknown?'UNKNOWN_WITH_WEEKLY_TOLERANCE':option?.evidence?.combinedRecovery??'MISSING',substitutions:[]});
  if(base.admissible||!base.reasons.some(r=>/unavailable equipment|duration does not fit/.test(r)))continue;
  const swapped=anchors.map(a=>{
   const assignment=option.assignments?.find(x=>x.anchorId===a.id),window=availability.find(d=>d.day===assignment?.day)?.windows.find(w=>w.id===assignment?.windowId);
   if(!window||a.prescription.equipment.every(eq=>window.equipment.includes(eq))&&a.prescription.durationMinutes<=window.durationMinutes)return a;
   const sub=(a.alternatives??[]).find(alt=>alt.purpose==='SUBSTITUTE'&&alt.admissibility?.admissible&&alt.prescription.equipment.every(eq=>window.equipment.includes(eq))&&alt.prescription.durationMinutes<=window.durationMinutes);
   return sub?{...a,prescription:clone(sub.prescription),substitutedBy:sub.id}:a;
  });
  if(swapped.every((a,i)=>a===anchors[i]))continue;
  const [withSubs]=scheduleCandidates(swapped,availability,[opt],asOf,{allowOmissions,forbiddenPairs});
  out.push({...withSubs,id:option.id+'+substitutes',arrangementEvidence:unknown?'UNKNOWN_WITH_WEEKLY_TOLERANCE':option?.evidence?.combinedRecovery??'MISSING',substitutions:swapped.filter(a=>a.substitutedBy).map(a=>({anchorId:a.id,alternativeId:a.substitutedBy,disclosure:'Different stimulus (equipment-constrained); not an equivalent external load'})),baseOptionId:option.id});
 }
 return out;
}
const asBalanced=c=>({...c,sessions:c.sessions.map(s=>({...s,id:s.anchorId}))});
function legacyBlocks(input,E){
 const end=E??input.weeks,first=Math.min(end,Math.max(1,Math.floor(end/3))),second=Math.min(end,Math.max(first+1,Math.floor(end*2/3)));
 const taperStart=E!==null&&E>=3?E-1:E;
 const defs=[['FOUNDATION',0,first,'Re-establish comparable exposure and stable scheduling'],['DEVELOPMENT',first,second,'Earn bounded progress while preserving both essential modalities'],['SPECIFIC',second,taperStart??end,'Retain familiar long and event-specific tasks; no novel intensity near the event']];
 if(E!==null){if(taperStart<E)defs.push(['TAPER',taperStart,E,'Baseline-relative volume reduction with frequency and familiar effort kept']);defs.push(['EVENT',E,E+1,'Race week: short familiar work, a brief familiar touch, race day']);if(E+1<input.weeks)defs.push(['POST_EVENT',E+1,E+2,'Easy nonclinical transition; check function before resuming']);if(E+2<input.weeks)defs.push(['REVIEW',E+2,input.weeks,'Resume the familiar baseline only after a current eligibility and response review']);}
 return defs.filter(([,a,b])=>b>a).map(([phase,start,stop,intent],i)=>({id:'block-'+i,phase,startWeek:start,endWeekExclusive:stop,...levelIntent(intent,['Goal-aligned essential stimulus','Actual-response transition review'],['Additional tolerated development']),transitionAutomatic:false}));
}
function sessionsFor(selected,anchors,w,block,startDate,{prescriptionFor=s=>s.prescription,origin='CURRENT_SELF_REPORTED_TOLERATED_TASK'}={}){
 return selected.sessions.map((s,i)=>{const p=prescriptionFor(s);return p?{...clone(s),prescription:clone(p),id:`w${w}-${s.anchorId}`,arrangement:selected.baseOptionId??selected.id,weekIndex:w,blockId:block.id,date:onDate(startDate,w*7+s.day),status:'PLANNED',plannedPrescriptionHash:hash(p),prescriptionSource:{origin,anchorId:s.anchorId,anchorObservedAt:anchors.find(a=>a.id===s.anchorId)?.observedAt},...levelIntent(s.objective,[s.essential?s.objective:'Retain optional productive exposure'],s.essential?[]:[s.objective]),optional:!s.essential,order:i}:null;}).filter(Boolean);
}
const strengthMinutes=p=>Math.ceil(p.exercises.reduce((n,e)=>n+e.preparationMinutes+e.sets*e.reps*3/60+Math.max(0,e.sets-1)*e.restSeconds/60,0));
/** Baseline-relative event transforms inside R6-EVENT-TRANSITION; familiar effort and loads are kept, volume falls. */
export function eventTransform(p,{phase,daysBeforeRace,op,eventKind}){
 const E=op.event,mid=([a,b])=>(a+b)/2,q=clone(p);
 if(p.modality==='RUN'){
  if(EASY_FAMILIES.includes(p.family)){
   const f=phase==='TAPER'?(p.family==='LONG'?mid(E.taperWeekLongRunRange):(eventKind==='10K'?E.taperWeekRunVolumeRange[1]:mid(E.taperWeekRunVolumeRange))):mid(E.raceWeekRunVolumeRange);
   q.durationMinutes=Math.max(15,Math.min(p.durationMinutes,roundTo5(p.durationMinutes*f)));
   const prep=p.warmupMinutes+p.cooldownMinutes;if(prep>q.durationMinutes){q.warmupMinutes=Math.floor(q.durationMinutes*p.warmupMinutes/Math.max(1,prep));q.cooldownMinutes=Math.floor(q.durationMinutes*p.cooldownMinutes/Math.max(1,prep));}
   return q;
  }
  if(phase==='RACE_WEEK'&&daysBeforeRace<E.raceWeekTouchMinDaysBeforeRace)return {modality:'RUN',family:'EASY',durationMinutes:Math.max(15,Math.min(20,p.durationMinutes)),effortDomain:'EASY_CONVERSATIONAL',effort:'Easy conversational effort; no hard work this close to the race',warmupMinutes:3,cooldownMinutes:3,equipment:clone(p.equipment)};
  if(phase==='TAPER')q.work=reducedWork(p.work,E.taperQualityWorkRange,E.reducedWorkMinimums);
  else{const touch=E.raceWeekTouch[eventKind]??E.raceWeekTouch.HALF_MARATHON;q.work={...p.work,repetitions:Math.min(p.work.repetitions,touch.repetitions),workMinutes:Math.min(p.work.workMinutes,touch.workMinutes),recoveryMinutes:Math.max(p.work.recoveryMinutes,touch.recoveryMinutes)};}q.durationMinutes=Math.min(p.durationMinutes,Math.ceil(p.warmupMinutes+p.cooldownMinutes+q.work.repetitions*q.work.workMinutes+Math.max(0,q.work.repetitions-1)*q.work.recoveryMinutes));
  return q;
 }
 if(phase==='RACE_WEEK'&&daysBeforeRace<E.raceWeekStrengthMinDaysBeforeRace)return null;
 q.exercises=p.exercises.map(e=>({...e,sets:phase==='TAPER'?Math.max(1,Math.round(e.sets*E.taperStrengthSetFraction)):E.raceWeekStrengthSets,rir:Math.max(e.rir,phase==='TAPER'?3:E.raceWeekStrengthMinimumRir)}));
 q.durationMinutes=Math.min(p.durationMinutes,Math.max(strengthMinutes(q),1));
 return q;
}
function eventSupplied(input,asOf){
 const event=input.eventWeek;
 if(!event||event.goalKind!==input.athlete.goal.kind||event.eventDate!==input.athlete.goal.eventDate||event.baselineHash!==anchorConfigurationHash(input.athlete.anchors))return null;
 const candidate={...clone(input),athlete:{...clone(input.athlete),anchors:event.anchors,weeklyTolerance:event.weeklyTolerance},scheduleOptions:event.scheduleOptions,asOf};
 const v=validateProgramInput(candidate);if(!v.valid||!combinedTolerance(candidate))return null;
 const choice=chooseBalanced(legacyCandidates(event.anchors,input.availability,event.scheduleOptions,asOf).map(asBalanced),{lead:LEAD[input.athlete.goal.priority]??'JOINT'});
 return choice.selected?{selected:choice.selected,anchors:event.anchors}:null;
}
export function generateLegacyProgram(input,options={}){
 const source=clone(input??{});
 const legacyEventKind=source.athlete?.goal?.kind==='HALF_MARATHON'?'HALF_MARATHON':'10K';
 const base={runtimeVersion:'R6-LEGACY-1',mode:'SHADOW',inputHash:hash(source),program:null,applied:false,officialPlanState:clone(source.officialPlanState??null),appliedState:clone(source.officialPlanState??null),completedWork:clone(source.completedWork??[]),missingInputs:[],errors:[],horizonsConsidered:HORIZONS};
 const reject=(status,reason,extra={})=>freeze({...base,status,reason,...extra});
 const stripped={...source,athlete:source.athlete?{...source.athlete,anchors:Array.isArray(source.athlete.anchors)?source.athlete.anchors.map(a=>{if(!a||typeof a!=='object')return a;const {alternatives,...rest}=a;return rest;}):source.athlete.anchors}:source.athlete};
 let v;try{v=validateProgramInput(stripped);}catch(e){if(!(e instanceof TypeError))throw e;v={clinical:false,errors:['Malformed nested input: '+e.message],missing:[]};}
 // A clinical flag that means yes in any form routes to a human, as in the R6 intake (SSCTR R6); the frozen R5 validator reads only true.
 const el0=source.athlete&&typeof source.athlete==='object'?source.athlete.eligibility:null;
 if(el0&&typeof el0==='object'&&['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>isYes(el0[k])))v={...v,clinical:true};
 if(v.clinical)return reject('CLINICAL_HUMAN_REQUIRED','Current clinical concern requires qualified human assessment; no prescription or clinical return');
 if(v.errors.length)return reject('INVALID_INPUT','Baseline input validation failed',{errors:v.errors});
 if(v.missing.length)return reject('ASK','Current material facts are required; perfect history is not',{missingInputs:v.missing});
 if(!combinedTolerance(source))return reject('ASK','Individual session tolerance does not establish the complete combined weekly configuration',{missingInputs:['athlete.weeklyTolerance']});
 const r5=programAuthority(options.r5??{}),r6=r6Authority(options);
 if(!r5.valid)return reject('UNSUPPORTED','Current independent reusable R5 program authority is unavailable');
 const anchors=source.athlete.anchors.map(a=>({...clone(a),alternatives:(a.alternatives??[]).map(alt=>({...clone(alt),admissibility:legacyAlternative(a,alt,source.athlete.anchors,source.asOf)}))}));
 const excludedAlternatives=anchors.flatMap(a=>a.alternatives.filter(x=>!x.admissibility.admissible).map(x=>({anchorId:a.id,alternativeId:x.id,purpose:x.purpose,reasons:x.admissibility.reasons})));
 const candidates=legacyCandidates(anchors,source.availability,source.scheduleOptions,source.asOf,{weeklyToleranceCovers:true,forbiddenPairs:source.constraints?.forbiddenPairs??[]});
 const lead=LEAD[source.athlete.goal.priority]??'JOINT';
 const choice=chooseBalanced(candidates.map(asBalanced),{lead,severityAuthority:allows(r6,'R6-HYBRID-ARRANGEMENT'),hybrid:r6.policy?.operational?.hybrid});
 if(choice.askRequired)return reject('ASK',choice.reason,{missingInputs:['temporaryTradeOffPreference'],question:choice.question,counterfactuals:choice.counterfactuals,excludedAlternatives});
 if(!choice.selected)return reject('UNSUPPORTED',choice.reason,{counterfactuals:choice.counterfactuals,excludedAlternatives});
 const selected=candidates.find(c=>c.id===choice.selected.id);
 if(source.athlete.goal.kind==='HALF_MARATHON'&&!anchors.some(a=>a.prescription.family==='LONG'))return reject('ASK','Event durability needs a current long-run anchor or a bounded establishment pathway',{missingInputs:['athlete.anchors.LONG']});
 const eventDate=source.athlete.goal.eventDate,E=eventDate?Math.floor(daysBetween(source.startDate,eventDate)/7):null,raceDay=eventDate?daysBetween(source.startDate,eventDate)-E*7:null;
 const eventAuthority=E!==null&&allows(r6,'R6-EVENT-TRANSITION'),supplied=E!==null?eventSupplied(source,source.asOf):null;
 const blocks=legacyBlocks(source,E),weeks=[],gaps=[],op=r6.policy?.operational;
 for(let w=0;w<source.weeks;w++){
  const block=blocks.find(b=>w>=b.startWeek&&w<b.endWeekExclusive),phase=block.phase;
  let sessions=[],status='CONDITIONAL',notes=[];
  if(['TAPER','EVENT','POST_EVENT'].includes(phase)&&!eventAuthority&&!(phase==='EVENT'&&supplied)){status='UNSUPPORTED_EVENT_CONFIGURATION';gaps.push({weekIndex:w,phase,dependency:status});}
  else if(phase==='EVENT'){
   const sel=supplied?.selected??selected,anc=supplied?.anchors??anchors;
   sessions=sessionsFor(sel,anc,w,block,source.startDate,{origin:supplied?'SUPPLIED_FAMILIAR_EVENT_WEEK':'BASELINE_RELATIVE_EVENT_TRANSFORM',prescriptionFor:s=>{const before=raceDay-s.day;if(before<=0)return null;return supplied?s.prescription:eventTransform(s.prescription,{phase:'RACE_WEEK',daysBeforeRace:before,op,eventKind:legacyEventKind});}});
   let strengthKept=false;sessions=sessions.filter(s=>{if(s.prescription.modality!=='STRENGTH')return true;if(strengthKept)return false;strengthKept=true;return true;});
   const race=racePrescription({kind:source.athlete.goal.kind==='HALF_MARATHON'?'HALF_MARATHON':'10K',date:eventDate},{cues:op.run.effortCues,raceDay:op.event.raceDay});
   sessions.push({anchorId:'race',id:`w${w}-race`,day:raceDay,date:eventDate,weekIndex:w,blockId:block.id,status:'PLANNED',race:true,essential:true,optional:false,objective:'Race day',prescription:race,plannedPrescriptionHash:hash(race),arrangement:sel.id,order:99});
   notes.push('Race week: familiar effort kept, volume reduced, nothing after the race');
  }else if(phase==='TAPER'){
   sessions=sessionsFor(selected,anchors,w,block,source.startDate,{origin:'BASELINE_RELATIVE_TAPER',prescriptionFor:s=>eventTransform(s.prescription,{phase:'TAPER',daysBeforeRace:7,op,eventKind:legacyEventKind})});
  }else if(phase==='POST_EVENT'){
   const since=d=>7-raceDay+d;let strengthKept=false;
   sessions=sessionsFor(selected,anchors,w,block,source.startDate,{origin:'POST_EVENT_TRANSITION',prescriptionFor:s=>{if(since(s.day)<op.event.postEventFirstRunMinDaysAfterRace)return null;if(s.prescription.modality==='RUN')return {modality:'RUN',family:'EASY',durationMinutes:Math.min(s.prescription.durationMinutes,op.event.postEventEasyMinutes[since(s.day)>=4?1:0]),effortDomain:'EASY_CONVERSATIONAL',effort:'Easy, optional, by feel after the race',warmupMinutes:3,cooldownMinutes:3,equipment:clone(s.prescription.equipment)};if(strengthKept)return null;strengthKept=true;return {...clone(s.prescription),exercises:s.prescription.exercises.map(e=>({...e,sets:op.event.postEventStrengthSets,rir:Math.max(e.rir,op.event.raceWeekStrengthMinimumRir)})),durationMinutes:s.prescription.durationMinutes};}});
  }else{
   sessions=sessionsFor(selected,anchors,w,block,source.startDate);
   if(phase==='REVIEW')notes.push('Resume only after a current eligibility and response review');
  }
  for(const s of sessions)if(s.prescription.modality==='STRENGTH'&&!s.race)s.prescription.durationMinutes=Math.max(s.prescription.durationMinutes,strengthMinutes(s.prescription));
  weeks.push({index:w,startDate:onDate(source.startDate,w*7),blockId:block.id,phase,status,conditional:true,sessions,restDays:[0,1,2,3,4,5,6].filter(d=>!sessions.some(s=>s.day===d)),...levelIntent(block.intent,['Retain run and strength essential exposure','Respond to actual tolerance before progression'],['Optional productive work']),progressionAutomatic:false,requiresReconciliationBeforeExecution:phase==='REVIEW',notes,plannedRunMinutes:sessions.filter(s=>s.prescription.modality==='RUN'&&!s.race).reduce((n,s)=>n+s.prescription.durationMinutes,0)});
 }
 const program={version:LEGACY_PROGRAM_VERSION,id:'program-'+base.inputHash,athleteId:source.athlete.id,goal:clone(source.athlete.goal),startDate:source.startDate,timezone:'UTC_SYNTHETIC_REFERENCE',proposalOnly:true,official:false,revision:0,sourceInputHash:base.inputHash,policyHash:r5.policyHash,r6PolicyHash:r6.policyHash,baselineHash:anchorConfigurationHash(source.athlete.anchors),...levelIntent('Legacy-input program with R6 corrections',anchors.filter(a=>a.essential).map(a=>a.objective),anchors.filter(a=>!a.essential).map(a=>a.objective)),blocks,weeks,anchors,availability:clone(source.availability),scheduleOptions:clone(source.scheduleOptions),constraints:clone(source.constraints??{}),selectedScheduleId:selected.baseOptionId??selected.id,arrangementEvidence:selected.arrangementEvidence,weeklyTolerance:clone(source.athlete.weeklyTolerance),completedWork:clone(source.completedWork??[]),decisions:[],gaps,excludedAlternatives,eventTransition:E===null?null:{eventWeek:E,raceDay,source:supplied?'SUPPLIED_FAMILIAR_EVENT_WEEK_PLUS_DERIVED_TAPER':eventAuthority?'DERIVED_BASELINE_RELATIVE':'UNSUPPORTED'},horizonContract:'H0 must remain feasible in H1, preserve protected H2 stimulus and serve H3',assumptions:['Future weeks are conditional candidate projections, not predictions','Phase lengths partition the requested horizon operationally','Familiar task tolerance and combined configuration are self-reported, not measured clearance']};
 program.hash=legacyProgramHash(program);
 return freeze({...base,status:'PROPOSED',reason:choice.reason,program,requestedScopeSatisfied:gaps.length===0,unsupportedProgramDecisions:gaps.length,counterfactuals:choice.counterfactuals,ranking:{selectedId:selected.id,basis:choice.basis,paretoIds:choice.paretoIds,whySelected:choice.reason},excludedAlternatives,authorityRefs:[...r5.records.map(r=>({boundaryId:r.boundaryId,policyHash:r.policyHash})),...r6.records.map(r=>({boundaryId:r.boundaryId,disposition:r.disposition}))],nextObservation:'Record actual task, effort, recovery, performance and adherence; reassess eligibility before execution'});
}
// ---------- evaluation ----------
function legacyPrepare(program,review,{learningBlocked=false,priorClinical=false}={}){
 const errors=[],missing=[],el=review?.eligibility;
 const clinical=priorClinical||['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>isYes(el?.[k]));
 if(review?.version!=='R5-REVIEW-1'||review?.synthetic!==true||review?.purpose!=='SHADOW_REFERENCE')errors.push('synthetic review contract');
 const asOf=utcTimestamp(review?.asOf);if(!asOf)errors.push('explicit asOf timestamp with timezone');
 if(!Number.isInteger(review?.weekIndex)||!program.weeks[review.weekIndex])errors.push('weekIndex');
 const week=program.weeks[review?.weekIndex];
 if(week&&asOf&&(Date.parse(asOf)<Date.parse(week.startDate)||Date.parse(asOf)>=Date.parse(week.startDate)+7*86400000))errors.push('weekIndex/asOf chronology');
 if(!review?.event?.id||!reviewKinds.includes(review?.event?.kind))errors.push('event.id/kind');
 if(!el||el.status!=='NONCLINICAL_CONFIRMED'||!dateValid(el.assessedAt)||(asOf&&(daysBetween(el.assessedAt,asOf)<0||daysBetween(el.assessedAt,asOf)>14))||['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>typeof el?.[k]!=='boolean'))missing.push('eligibility.currentAssessment');
 if(errors.length)return {errors,missing,clinical,model:null,actualLedger:clone(review?.actualLedger??[]),accepted:[],excluded:[],asOf};
 let model=review.athleteModel??createLearningModel({athleteId:program.athleteId,purposeAllowed:review.learningConsent===true,asOf});
 if(!validateLearningModel(model)||model.athleteId!==program.athleteId||Date.parse(model.asOf)>Date.parse(asOf))errors.push('athleteModel integrity/ownership/clock');
 const prior=Array.isArray(review.actualLedger)?clone(review.actualLedger):[];
 // R6 causal provenance first: future, stale, duplicate and conflicting facts never reach a decision.
 const n=normalizeObservations(review.observations??[],{athleteId:program.athleteId,asOf,prior});
 const ledgerIds=new Set(prior.map(o=>o.eventId)),fresh=n.accepted.filter(o=>!ledgerIds.has(o.eventId));
 const accepted=[],excluded=[...n.excluded.map(e=>({eventId:e.eventId,reason:e.reason})),...n.conflicts.map(c=>({eventIds:c.eventIds,reason:c.reason})),...n.duplicates.map(d=>({eventId:d.eventId,reason:'DUPLICATE_'+d.reason}))],actualLedger=[...prior];
 const historical=Array.isArray(review.historicalSessions)?review.historicalSessions:[];
 for(const o of fresh){
  const original=(review.observations??[]).find(x=>x.eventId===o.eventId)??o,binding=bindActual(program,{...original,observedAt:o.observedAt},historical,asOf,sessionContext);
  if(!binding.valid){excluded.push({eventId:o.eventId,reason:'PLANNED_ACTUAL_CONTEXT_OR_CHRONOLOGY_MISMATCH'});continue;}
  actualLedger.push({...clone(original),observedAt:o.observedAt,provenance:o.provenance});
  if(!binding.comparable||original.actual?.completed!==true||clinical||missing.length||learningBlocked){excluded.push({eventId:o.eventId,reason:clinical?'CLINICAL_CONTEXT_NOT_TOLERANCE':!binding.comparable?'ACTUAL_DOSE_NOT_COMPARABLE':'CURRENT_ELIGIBILITY_OR_COMPLETION_UNASSESSED'});continue;}
  accepted.push({...clone(original),observedAt:o.observedAt});
 }
 if(!errors.length&&!missing.length&&!clinical&&!learningBlocked)model=updateLearningModel(model,accepted,{asOf,purposeAllowed:review.learningConsent===true});
 return {errors,missing,clinical,model,actualLedger,accepted,excluded,asOf,provenance:{duplicates:n.duplicates,conflicts:n.conflicts,superseded:n.superseded}};
}
const counter=(action,admissible,reason,extra={})=>({action,admissible,reason,reversible:true,disruption:action==='KEEP'?'NONE':'SCOPED',...extra});
/** Query-time comparability class: build-phase labels pool for the identical prescription and arrangement; event phases never pool. */
function phaseClassModel(model,r6){
 const classes=r6.policy?.operational?.learning?.comparablePhaseClasses;
 if(!model||!classes||!allows(r6,'R6-PARTIAL-NOISY-LEARNING'))return {model,map:p=>p};
 const map=p=>Object.entries(classes).find(([,v])=>v.includes(p))?.[0]??p;
 const copy=createLearningModel({athleteId:model.athleteId,purposeAllowed:model.purposeAllowed,asOf:model.asOf});
 return {model:model.purposeAllowed?updateLearningModel(copy,model.observations.map(o=>({...o,context:{...o.context,phase:map(o.context.phase)}})),{asOf:model.asOf,purposeAllowed:true}):copy,map};
}
function selectAlternative(anchor,purpose,configuration,asOf){
 const ok=(anchor?.alternatives??[]).filter(a=>a.purpose===purpose&&legacyAlternative(anchor,a,configuration,asOf).admissible);
 const size=a=>Math.abs((a.prescription.durationMinutes-anchor.prescription.durationMinutes))+(a.prescription.exercises??[]).reduce((n,e,i)=>n+Math.abs(e.sets-(anchor.prescription.exercises[i]?.sets??e.sets))+Math.abs((e.load?.value??0)-(anchor.prescription.exercises[i]?.load?.value??0)),0);
 return ok.sort((a,b)=>size(a)-size(b))[0]??null;
}
function selectLegacyAction(program,review,prepared,r6){
 const week=program.weeks[review.weekIndex],kind=review.event.kind,all=program.weeks.flatMap(w=>w.sessions),target=all.find(s=>s.id===review.targetSessionId),next=program.weeks[review.weekIndex+1];
 const keep=counter('KEEP',true,'The supplied plan remains adequate; no material necessity for mutation');
 const result=(action,reason,extra={})=>({...extra,action,reason,counterfactuals:[keep,...(extra.counterfactuals??[])]});
 const futureProtected=next&&['TAPER','EVENT','POST_EVENT','REVIEW'].includes(next.phase)||['TAPER','EVENT'].includes(week.phase);
 const lead=LEAD[program.goal.priority]??'JOINT',severity=allows(r6,'R6-HYBRID-ARRANGEMENT');
 if(kind==='GOAL_CHANGE')return result('ASK','A changed goal needs a newly validated horizon and program proposal',{missingInputs:['newProgramInput']});
 if(kind==='MISSED_OPTIONAL')return result('DISCARD','Discard the missed optional exposure; no load debt and no compensatory training');
 if(kind==='MISSED_ESSENTIAL'&&!review.availability&&!review.forbiddenPairs?.length)return result('DISCARD','A missed essential workout alone does not make the next planned key session inadequate; zero work is recorded and nothing is repaid',{counterfactuals:[counter('MOVE',false,'No need to move the next valid stimulus'),counter('CATCH_UP',false,'Stacking missed work creates load debt')]});
 if(kind==='RETURN'){
  const i=review.interruption??{},screen=screenInterruptionReason({reason:i.reason,reasonCategory:i.reasonCategory??(i.clinicalReason===false?'OTHER_NONCLINICAL':null),nonclinical:i.nonclinical??null,clinicalReason:i.clinicalReason??null});
  if(screen.status==='CLINICAL')return result('CLINICAL_HUMAN_REQUIRED','Clinical or possibly clinical interruption requires qualified human return assessment',{screen});
  if(!allows(r6,'R6-NONCLINICAL-RETURN'))return result('UNSUPPORTED','Nonclinical return authority unavailable');
  const d=review.currentDemonstration,demoOk=d?.current===true&&d.response==='COMPATIBLE'&&d.ordinaryFunction==='COMPATIBLE'&&dateValid(d.observedAt)&&daysBetween(d.observedAt,review.asOf)>=0&&daysBetween(d.observedAt,review.asOf)<=r6.policy.operational.return.currentDemonstrationMaxAgeDays&&!validatePrescription(d.prescription??{}).length&&d.prescription?.modality==='RUN'&&r6.policy.operational.return.demonstration.families.includes(d.prescription?.family)&&d.prescription?.effortDomain==='EASY_CONVERSATIONAL';
  if(screen.status!=='NONCLINICAL'||review.currentCapacityConfirmed!==true)return result('ASK','A nonclinical restart needs an explicit no-clinical-reason fact and current capacity; historical doses do not restore automatically',{missingInputs:['interruption.clinicalReason=false','currentCapacityConfirmed']});
  if(!next)return result('KEEP','No future week remains in this horizon');
  const R=r6.policy.operational.return,configuration=next.sessions.map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}));
  const entry=s=>{
   const a=program.anchors.find(x=>x.id===s.anchorId),p=s.prescription;
   if(p.modality==='RUN'){
    const regress=selectAlternative(a,'REGRESS',configuration,review.asOf);
    if(demoOk&&regress&&hash(regress.prescription)===hash(d.prescription))return {prescription:clone(regress.prescription),source:'SUPPLIED_FAMILIAR_REGRESSION_MATCHING_CURRENT_DEMONSTRATION',alternativeId:regress.id};
    if(demoOk&&d.prescription.modality==='RUN'&&EASY_FAMILIES.includes(p.family)&&d.prescription.durationMinutes<=p.durationMinutes)return {prescription:{...clone(p),durationMinutes:d.prescription.durationMinutes,warmupMinutes:Math.min(p.warmupMinutes,d.prescription.warmupMinutes),cooldownMinutes:Math.min(p.cooldownMinutes,d.prescription.cooldownMinutes),family:p.family==='LONG'?'EASY':p.family},source:'CURRENT_DEMONSTRATION_DOSE'};
    if(!EASY_FAMILIES.includes(p.family))return {prescription:{modality:'RUN',family:'EASY',durationMinutes:Math.min(p.durationMinutes,demoOk?d.prescription.durationMinutes:R.entryRunMinutes),effortDomain:'EASY_CONVERSATIONAL',effort:'Easy conversational re-entry; no hard work until easy running is observed',warmupMinutes:3,cooldownMinutes:3,equipment:clone(p.equipment)},source:'EASY_REPLACES_HARD_WORK_ON_RE_ENTRY'};
    return {prescription:{...clone(p),durationMinutes:Math.min(p.durationMinutes,demoOk?d.prescription.durationMinutes:R.entryRunMinutes),warmupMinutes:Math.min(p.warmupMinutes,3),cooldownMinutes:Math.min(p.cooldownMinutes,3)},source:demoOk?'CURRENT_DEMONSTRATION_DOSE':'REVIEWED_ENTRY_DOSE'};
   }
   const q={...clone(p),exercises:p.exercises.map(e=>({...e,sets:R.strengthEntrySets,rir:Math.max(e.rir,R.strengthEntryMinimumRir)}))};q.durationMinutes=Math.min(p.durationMinutes,Math.max(strengthMinutes(q),1));
   return {prescription:q,source:'FAMILIAR_LOW_DEMAND_ENTRY_PRIOR_LOAD_AS_CEILING'};
  };
  const prescriptions=next.sessions.map(s=>({sessionId:s.id,anchorId:s.anchorId,...entry(s)}));
  return result('REESTABLISH','Known nonclinical interruption: one staged re-entry week from current evidence; later weeks need observed compatible execution before the familiar baseline resumes',{prescriptions,fromWeek:review.weekIndex+1,throughWeek:review.weekIndex+1,demonstrationUsed:demoOk,counterfactuals:[counter('RESUME_BASELINE',false,'Elapsed time does not restore the full familiar week'),counter('PERCENT_ROLLBACK',false,'A universal percentage rollback is not an approved rule'),counter('REESTABLISH',true,'Current evidence first; prior tolerance is the ceiling')]});
 }
 const scheduling=['SCHEDULE_CHANGE','TRAVEL','DOUBLE_INFEASIBLE','SESSION_MOVED','CONFLICT','MISSED_ESSENTIAL','EQUIPMENT_CHANGE'].includes(kind);
 if(scheduling){
  const availability=review.availability??program.availability,options=review.scheduleOptions??program.scheduleOptions;
  const anchors=(next??week).sessions.filter(s=>!s.race).map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}));
  const candidates=legacyCandidates(anchors,availability,options,review.asOf,{weeklyToleranceCovers:true,allowOmissions:true,forbiddenPairs:[...(program.constraints?.forbiddenPairs??[]),...(review.forbiddenPairs??[])]});
  const context=next?.sessions.find(s=>s.prescription.modality==='RUN'&&!EASY_FAMILIES.includes(s.prescription.family))??next?.sessions[0];
  const pc=phaseClassModel(prepared.model,r6),ctx0=context?sessionContext(program,context):null,qctx=ctx0?{...ctx0,phase:pc.map(ctx0.phase)}:null;
  const pref=qctx&&pc.model?preferredArrangement(pc.model,candidates.map(c=>({id:c.baseOptionId??c.id,admissible:c.admissible,arrangement:c.baseOptionId??c.id})),qctx,{asOf:review.asOf}):null;
  const arrangementEvidence=qctx&&pc.model?[...new Set(candidates.map(c=>c.baseOptionId??c.id))].map(id=>({id,...evidenceFor(pc.model,{...qctx,arrangement:id},{asOf:review.asOf})})).map(e=>({id:e.id,direction:e.direction,confidence:e.confidence,compatible:e.compatibleCount,adverse:e.adverseCount})):[];
  const choice=chooseBalanced(candidates.map(asBalanced),{lead,severityAuthority:severity,hybrid:r6.policy?.operational?.hybrid,currentId:program.selectedScheduleId,athleteEvidence:pref?.preferredId?{preferredId:pref.preferredId,confidence:'STRONG'}:null});
  const counterfactuals=choice.counterfactuals.map(c=>counter(c.selected?'SELECTED':'ALTERNATIVE',c.admissible,c.reason,{id:c.id,costs:c.costs}));
  const currentAdmissible=candidates.find(c=>c.id===program.selectedScheduleId&&c.admissible&&!c.omitted.length);
  const supportive=arrangementEvidence.find(e=>e.id===program.selectedScheduleId&&e.confidence!=='PRIOR'&&e.direction==='COMPATIBLE'),against=arrangementEvidence.filter(e=>e.id!==program.selectedScheduleId&&e.confidence!=='PRIOR'&&e.direction==='ADVERSE');
  if(currentAdmissible&&kind!=='MISSED_ESSENTIAL'&&(!pref?.preferredId||pref.preferredId===program.selectedScheduleId))return result('KEEP',supportive||against.length?'Current arrangement stays: '+(supportive?supportive.compatible+' comparable compatible responses in it':'')+(supportive&&against.length?'; ':'')+(against.length?against.map(e=>e.adverse+' comparable adverse responses in '+e.id).join(', '):'')+' (association, not causation; strength outcomes in each arrangement remain unmeasured)':pref?.preferredId?'Current arrangement is admissible and repeated comparable responses favour it (association, not causation)':'Current arrangement remains feasible and adequate',{counterfactuals,athleteEvidence:pref,arrangementEvidence});
  if(choice.askRequired)return result('ASK',choice.reason,{missingInputs:['temporaryTradeOffPreference'],counterfactuals});
  const sel=candidates.find(c=>c.id===choice.selected?.id);
  if(!sel)return result('UNSUPPORTED','No admissible same-dose arrangement or familiar substitute fits the supplied windows and equipment',{counterfactuals});
  if(futureProtected&&sel.omitted.some(id=>program.anchors.find(a=>a.id===id)?.essential))return result('ASK','The event horizon makes essential-work loss material; a complete event-week proposal is required',{missingInputs:['eventWeekConfiguration'],counterfactuals});
  return result(sel.substitutions.length?'SUBSTITUTE':sel.omitted.length?'PARTIAL_REPLAN':'MOVE',sel.substitutions.length?'Supplied familiar substitutes keep the strength practice inside the available equipment; the stimulus change is disclosed and no load is converted':choice.reason,{schedule:sel,availability,fromWeek:review.weekIndex+1,throughWeek:review.weekIndex+1,counterfactuals,athleteEvidence:pref,substitutions:sel.substitutions});
 }
 if(kind==='LOCAL_FATIGUE'||kind==='SYSTEMIC_FATIGUE'){
  const affected=review.affectedSessionIds??(target?[target.id]:[]);
  const optional=week.sessions.filter(s=>s.optional&&(kind==='SYSTEMIC_FATIGUE'||affected.includes(s.id))&&Date.parse(s.date+'T23:59:59Z')>=Date.parse(review.asOf)&&!prepared.actualLedger.some(o=>o.sessionId===s.id));
  if(optional.length)return result('REDUCE','Remove only uncompleted optional work affected by the fatigue signal; protected stimuli stay',{removeSessionIds:optional.map(s=>s.id),fromWeek:review.weekIndex,throughWeek:review.weekIndex});
  if(kind==='SYSTEMIC_FATIGUE')return result('ASK','No optional reduction resolves systemic fatigue; reconcile current function and recovery before hard work',{missingInputs:['currentCompatibleReducedTask']});
  return result('KEEP','No affected uncompleted optional work; monitor current function');
 }
 if(kind==='EVENT_NEAR'||futureProtected)return result('KEEP','Protect the event horizon; no new overload or catch-up session');
 if(!target)return result('KEEP','No targeted material inadequacy; retain the valid programme and collect actual response');
 const pc=phaseClassModel(prepared.model,r6),context0=sessionContext(program,target),context={...context0,phase:pc.map(context0.phase)},evidence=evidenceFor(pc.model,context,{asOf:review.asOf}),anchor0=program.anchors.find(a=>a.id===target.anchorId),anchor=anchor0?{...anchor0,prescription:target.prescription}:null;
 const repeated=['EMERGING','STRONG'].includes(evidence.confidence),adverse=repeated&&evidence.direction==='ADVERSE',earned=repeated&&evidence.direction==='COMPATIBLE'&&evidence.responseSummary.over>=3&&evidence.responseSummary.easier>=3;
 const configuration=week.sessions.filter(s=>!s.race).map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}));
 const purpose=adverse?'REGRESS':earned?'PROGRESS':null,alt=purpose&&selectAlternative(anchor,purpose,configuration,review.asOf);
 if(purpose&&alt&&next){
  if(program.decisions.some(d=>['PROGRESS','REGRESS'].includes(d.action)&&d.fromWeek===review.weekIndex+1))return result('KEEP','One prospective dose dimension is already changed for this next horizon; observe the combined response first',{athleteEvidence:evidence});
  return result(purpose,purpose==='REGRESS'?'Repeated comparable adverse responses select the familiar lower dose before a wider block change':'Repeated comparable easier-than-target responses earn the familiar next dose',{anchorId:anchor.id,prescription:alt.prescription,alternativeId:alt.id,fromWeek:review.weekIndex+1,throughWeek:program.weeks.length-1,athleteEvidence:evidence,counterfactuals:[counter(purpose,true,'Current familiar alternative with combined-week support; later weeks stay conditional'),counter('BLOCK_ADJUSTMENT',false,'A wider change is not yet necessary')]});
 }
 if(purpose&&!alt)return result('ASK','Evidence suggests a dose review but no current familiar admissible alternative exists',{athleteEvidence:evidence,missingInputs:['currentFamiliarDoseAlternative']});
 return result('KEEP','Current evidence does not justify a stronger intervention; keep the plan and the next comparable observation',{athleteEvidence:evidence,counterfactuals:[counter('PROGRESS',false,'Repeated comparable surplus not established'),counter('REGRESS',false,'Repeated comparable mismatch not established')]});
}
function patchLegacy(program,review,selection){
 const proposal=clone(program),start=selection.fromWeek??review.weekIndex+1,end=selection.throughWeek??start;
 for(const week of proposal.weeks){
  if(week.index<start||week.index>end||week.status!=='CONDITIONAL'||['TAPER','EVENT','POST_EVENT'].includes(week.phase))continue;
  if(selection.schedule){
   const keepRace=week.sessions.filter(s=>s.race);
   week.availabilityOverride=clone(selection.availability??program.availability);
   week.sessions=[...selection.schedule.sessions.map((s,i)=>({...clone(s),id:`w${week.index}-${s.anchorId}`,arrangement:selection.schedule.baseOptionId??selection.schedule.id,weekIndex:week.index,blockId:week.blockId,date:onDate(program.startDate,week.index*7+s.day),status:'PLANNED',order:i,plannedPrescriptionHash:hash(s.prescription),prescriptionSource:{origin:selection.schedule.substitutions?.some(x=>x.anchorId===s.anchorId)?'SUPPLIED_FAMILIAR_SUBSTITUTE':'FAMILIAR_COMBINED_CONFIGURATION',anchorId:s.anchorId},...levelIntent(s.objective,[s.objective]),optional:!s.essential})),...keepRace];
  }
  if(selection.prescription){const s=week.sessions.find(s=>s.anchorId===selection.anchorId);if(s){s.prescription=clone(selection.prescription);s.plannedPrescriptionHash=hash(s.prescription);s.prescriptionSource={origin:'EARNED_CURRENT_FAMILIAR_ALTERNATIVE',anchorId:selection.anchorId,alternativeId:selection.alternativeId};}}
  if(selection.prescriptions)for(const x of selection.prescriptions){const s=week.sessions.find(s=>s.anchorId===x.anchorId);if(s){s.prescription=clone(x.prescription);s.plannedPrescriptionHash=hash(s.prescription);s.prescriptionSource={origin:x.source,anchorId:x.anchorId,alternativeId:x.alternativeId??null};}}
  if(selection.removeSessionIds)week.sessions=week.sessions.filter(s=>!selection.removeSessionIds.includes(s.id));
  week.plannedRunMinutes=week.sessions.filter(s=>s.prescription.modality==='RUN'&&!s.race).reduce((n,s)=>n+s.prescription.durationMinutes,0);
  week.restDays=[0,1,2,3,4,5,6].filter(d=>!week.sessions.some(s=>s.day===d));
 }
 if(selection.prescription||selection.prescriptions)for(const w of proposal.weeks.filter(w=>w.index>end))if(w.status==='CONDITIONAL')w.requiresReconciliationBeforeExecution=true;
 proposal.revision++;proposal.decisions.push({eventId:review.event.id,asOf:review.asOf,action:selection.action,fromWeek:start,throughWeek:end,reason:selection.reason,horizonsConsidered:HORIZONS});
 proposal.hash=legacyProgramHash(proposal);return proposal;
}
export function evaluateLegacyProgram(program,review,options={}){
 const official=clone(review?.officialPlanState??null),base={runtimeVersion:'R6-LEGACY-1',mode:'SHADOW',applied:false,proposal:null,officialPlanState:official,appliedState:clone(official),completedWork:clone(program?.completedWork??[]),horizonsConsidered:HORIZONS,qualityAssessment:{assessor:'RUNTIME_SELF_CHECK',independent:false,class:'UNREVIEWED'},missingInputs:[],counterfactuals:[]};
 if(!validLegacyProgram(program))return freeze({...base,status:'HOLD',action:'HOLD',reason:'Program integrity/version is invalid'});
 const r6=r6Authority(options),r5=programAuthority(options.r5??{});
 let prepared,guard;
 try{guard=previousValidity(program,review??{});prepared=legacyPrepare(program,clone(review??{}),{learningBlocked:!!guard,priorClinical:guard?.status==='CLINICAL_HUMAN_REQUIRED'});}catch(e){if(!(e instanceof TypeError))throw e;return freeze(referenceResult(program,review,{...base,status:'HOLD',action:'HOLD',reason:'Malformed review context: '+e.message,actualLedger:clone(Array.isArray(review?.actualLedger)?review.actualLedger:[])}));}
 const output={...base,updatedModel:prepared.model,actualLedger:prepared.actualLedger,excludedObservations:prepared.excluded,provenance:prepared.provenance??null,inputHash:hash({programHash:program.hash,review})};
 const reject=(status,reason,extra={})=>freeze(referenceResult(program,review,{...output,status,action:status,reason,...extra}));
 if(prepared.clinical)return reject('CLINICAL_HUMAN_REQUIRED','Clinical concern routes to qualified human assessment; no dependent prescription');
 if(prepared.errors.length)return reject('HOLD','Material review context failed validation',{errors:prepared.errors});
 if(prepared.missing.length)return reject('ASK','Current eligibility must be assessed; unknown remains unknown',{missingInputs:prepared.missing});
 if(guard)return reject(guard.status,guard.reason,{missingInputs:guard.missingInputs??[]});
 if(!r5.valid||r5.policyHash!==program.policyHash||r6.policyHash!==program.r6PolicyHash)return reject('UNSUPPORTED','Current independent program authority is missing or stale');
 const selection=selectLegacyAction(program,review,prepared,r6);
 const status=['KEEP','DISCARD'].includes(selection.action)?'KEEP':['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(selection.action)?selection.action:'MODIFY';
 const proposal=status==='MODIFY'?patchLegacy(program,review,selection):null;
 if(proposal){
  const old=new Map(program.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));
  for(const week of proposal.weeks)for(const s of week.sessions){
   if(s.race||hash(old.get(s.id)??null)===hash(s))continue;
   const window=(week.availabilityOverride??proposal.availability).find(d=>d.day===s.day)?.windows.find(w=>w.id===s.windowId);
   if(validatePrescription(s.prescription).length||!window||s.prescription.durationMinutes>window.durationMinutes||!s.prescription.equipment.every(e=>window.equipment.includes(e))||Date.parse(s.date+'T00:00:00Z')<=Date.parse(review.asOf))return reject('UNSUPPORTED','Counterfactual fails complete future prescription, window, equipment or chronology validation',{counterfactuals:selection.counterfactuals});
  }
  for(const a of prepared.actualLedger){const before=old.get(a.sessionId),after=proposal.weeks.flatMap(w=>w.sessions).find(s=>s.id===a.sessionId);if(before&&hash(before)!==hash(after??null))return reject('HOLD','Counterfactual would rewrite a session with immutable actual execution');}
  if(hash(proposal.weeks)===hash(program.weeks))return reject('UNSUPPORTED','Selected change has no executable uncompleted horizon');
 }
 return freeze(referenceResult(program,review,{...output,...selection,status,proposal,selectedAction:selection.action,trace:{sourceProgramHash:program.hash,reviewHash:hash(review),policyHash:r5.policyHash,r6PolicyHash:r6.policyHash,modelBeforeHash:review.athleteModel?.hash??null,modelAfterHash:prepared.model?.hash??null,authoritySplit:'Reusable boundaries constrain; coaching compares concrete feasible options',noCausalClaim:true},nextObservation:selection.nextObservation??'Compare actual execution, effort and recovery at the selected dose; revalidate the next horizon before execution'}));
}
