import fs from 'node:fs';
import {clone, freeze, hash} from './value.mjs';
import {fact, factCell, validateCanonical} from './r3-input.mjs';
import {assessMaterialConsumption} from './r3-consumption.mjs';
import r2Registry from '../r2/POSITIVE_PRESCRIPTION_REGISTRY.json' with {type:'json'};
import r2Authority from '../r2/SSCTR_RUNTIME_AUTHORITY.json' with {type:'json'};

export const COVERAGE_CLASSES = ['POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED','SUPPORTED_KEEP','USEFUL_ASK','CORRECT_ABSTAIN_OR_HOLD','NOT_SUPPORTED_DOMAIN_GAP','NOT_SUPPORTED_SCIENCE_GAP','NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP','CLINICAL_OR_OUT_OF_SCOPE'];
const classes=COVERAGE_CLASSES;
const loadOptional=p=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null;
// Authority is loaded, never written, by the reference consumer. Missing approval fails closed.
function currentApproval(policyId){
 const registry=loadOptional(new URL('../r3/BOUNDED_POLICY_CANDIDATES_R3.json',import.meta.url));
 const authority=loadOptional(new URL('../../audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json',import.meta.url));
 const policy=registry?.policies.find(p=>p.policyId===policyId);
 if(!policy)return null;
 const review=(authority?.records??[]).find(r=>r.target.rule_ids.includes(policyId)&&r.target.sha256===hash(policy)&&r.disposition==='APPROVE_WITH_CONDITIONS'&&['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(r.evidence_status)&&r.reviewer.independent_of_target_author===true);
 return review?{policy,review}:null;
}
function existingApproval(id){
 const policy=r2Registry.policies.find(p=>p.policyId===id);
 const review=r2Authority.records.find(r=>r.target.rule_ids.includes(id)&&r.disposition==='APPROVE_WITH_CONDITIONS'&&r.reviewer.independent_of_target_author);
 return policy&&review&&r2Authority.registryHash===hash(r2Registry)&&r2Authority.policyHashes[id]===hash(policy)?{policy,review}:null;
}

/** Read-only canonical reference entry point; never imports a case corpus or expected output. */
export function evaluateCanonicalShadow(input,{enableExpansion=true}={}){
 const i=clone(input??{}),reads=[];
 const read=p=>{const value=fact(i,p);reads.push({path:p,state:value===undefined?'ABSENT':value===null?'UNKNOWN':'SUPPLIED',value:clone(value??null)});return value;};
 const official=read('/currentDemand/officialPlan')??read('/currentDemand/officialWeek')??read('/currentDemand/officialRunWeek')??read('/currentDemand/session')??read('/currentDemand/planned')??null;
 const completed=read('/completedPrefix')??read('/currentDemand/session/completed')??null;
 const make=(type,coverage,reason,extra={})=>({decisionType:type,coverage,rationale:reason,missingInputs:[],policyRefs:[],evidenceRefs:[],candidate:null,unsupportedDependency:null,...extra});
 const ask=(reason,paths,force=false)=>{
  const missing=force?paths:paths.filter(p=>!p.startsWith('/')||['ABSENT','UNKNOWN','NOT_APPLICABLE'].includes(factCell(i,p).status));
  return missing.length?make('ASK',classes[2],reason,{missingInputs:missing,unsupportedDependency:'SUBSTANTIVE_MISSING_INPUT'}):make('NOT_SUPPORTED_YET',classes[4],'The requested information is supplied and retained; this context still needs an exact independently supported recipe/eligibility binding',{unsupportedDependency:'SUPPLIED_FACTS_REQUIRE_DOMAIN_BINDING'});
 };
 const domain=(reason,gap)=>make('NOT_SUPPORTED_YET',classes[4],reason,{unsupportedDependency:gap});
 const science=(reason,gap)=>make('HOLD',classes[5],reason,{unsupportedDependency:gap});
 const hold=(reason,gap)=>make('HOLD',classes[3],reason,{unsupportedDependency:gap});
 const bind=(d,a)=>({...d,policyRefs:[{id:a.policy.policyId,version:a.policy.revision,hash:hash(a.policy)}],evidenceRefs:[{reviewId:a.review.review_id,revision:a.review.review_revision,hash:hash(a.review),disposition:a.review.disposition,evidenceStatus:a.review.evidence_status}],scientificConditions:clone(a.review.decision),limitations:clone(a.review.limitations),nextCheck:{owner:'TRAINING_POLICY_OWNER',trigger:'Response, symptoms, task, source, context or authority changes; before any further prescription',exit:'Reassess exact current facts; no automatic progression'}});
 const positive=(a,recipe,scope)=>bind(make('MODIFY',classes[0],'Select only the exact currently familiar bounded task; no physiological calibration, novel dose, full-week sufficiency or efficacy is inferred',{candidate:{recipe:clone(recipe),scope,confirmation:'REQUIRED_FOR_ANY_FUTURE_EFFECT'},requestedScopeSatisfied:true}),a);
 const validation=validateCanonical(i),material=validation.valid?assessMaterialConsumption(i):null;
 const assessments=[];
 const groups={
 FIRST_WEEK:[['/onboarding'],['/reportedExposure']],FIRST_RUN_SESSION:[['/onboarding'],['/reportedExposure']],FIRST_PRODUCT_WEEK:[['/onboarding'],['/reportedExposure']],FIRST_STRENGTH_SESSION:[['/onboarding']],
 NEVER_EXPOSED_RUN_FAMILY:[['/reportedExposure/run'],['/currentDemand/family']],LOCAL_FATIGUE:[['/currentDemand/session/essential'],['/currentDemand/session/optional'],['/observations/local'],['/alternatives']],SYSTEMIC_FATIGUE:[['/currentDemand/session'],['/observations/firstTwoRepetitions'],['/completedPrefix']],NEXT_STRENGTH_SESSION:[['/currentDemand/exercise'],['/currentDemand/base'],['/currentDemand/candidate','/currentDemand/availableAlternative'],['/observations']],
 REVIEW_NEXT_SESSION:[['/currentDemand/officialWeek'],['/observations/lastEasyRun'],['/history/pattern']],MISSED_OPTIONAL_SESSION:[['/currentDemand/session'],['/currentDemand/remainingWeek'],['/observations']],ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT:[['/currentDemand/planned'],['/currentDemand/availability'],['/alternatives']],REVIEW_SESSION:[['/currentDemand/session'],['/observations'],['/wearable']],EQUIPMENT_SUBSTITUTION:[['/currentDemand/original'],['/currentDemand/requested'],['/history']],
 FIRST_RETURN_SESSION:[['/interruption'],['/priorHistory'],['/observations']],FIRST_RETURN_STRENGTH:[['/interruption'],['/priorHistory'],['/observations']],RETURN_WEEK:[['/interruption'],['/priorHistory'],['/observations']],RETURN_NEXT_STEP:[['/interruption'],['/observations'],['/currentDemand/availableReviewedSmallerAlternative']],
 RACE_WEEK:[['/event'],['/priorHistory'],['/availability','/currentDemand/availability']],DAY_AFTER_EVENT:[['/event'],['/observations']],RUN_CALIBRATION:[['/currentDemand/family'],['/priorHistory'],['/calibration']],RUN_NEXT_SESSION:[['/currentDemand/currentMinutes'],['/currentDemand/candidateMinutes'],['/priorHistory'],['/calibration']],RANK_EXISTING_ADMISSIBLE_OPTIONS:[['/currentDemand/options'],['/priorHistory/observations'],['/constraints'],['/learningConsent']],LEARN_NEW_RULE:[['/currentDemand/requestedRule'],['/priorHistory/observations'],['/availableAdmissibleDoseAlternatives']]
 };
 let d,consumed=false;
 if(!validation.valid)d=make('ASK',classes[6],'Canonical contract validation failed; this ASK is not useful coaching',{missingInputs:validation.errors,unsupportedDependency:'CANONICAL_INPUT_CONTRACT'});
 else if(i.synthetic!==true||i.purpose!=='SHADOW_REFERENCE')d=make('ABSTAIN',classes[7],'Only offline synthetic reference use is authorized',{unsupportedDependency:'REAL_USE_NOT_AUTHORIZED'});
 else if(i.adapter.blocked)d=make('ASK',classes[6],'Source identity/hash or representation is blocked; no sporting conclusion is drawn',{missingInputs:i.adapter.warnings.filter(w=>['SOURCE_HASH_MISMATCH','NOT_SYNTHETIC_SHADOW_SOURCE'].includes(w.code)||w.code.startsWith('INVALID_')),unsupportedDependency:'SOURCE_OR_ADAPTER_BLOCK'});
 else {
  const eligibility=read('/eligibility'),kind=read('/currentDemand/kind'),population=read('/population');
  const group=groups[kind];
  const missingGroups=[];
  const expectedTypes=p=>['/currentDemand/currentMinutes','/currentDemand/candidateMinutes'].includes(p)?['number']:['/currentDemand/family','/currentDemand/exercise','/currentDemand/requestedRule','/history/pattern','/observations/local','/observations/firstTwoRepetitions'].includes(p)?['string']:['/currentDemand/options','/priorHistory/observations','/currentDemand/session/essential','/currentDemand/session/optional','/availability'].includes(p)?['array']:['/alternatives','/currentDemand/availability','/reportedExposure','/reportedExposure/run','/availableAdmissibleDoseAlternatives','/currentDemand/availableReviewedSmallerAlternative'].includes(p)?['object','array','string']:['object'];
  for(const alternatives of group??[]){
   const operands=alternatives.map(p=>{const v=read(p),cell=factCell(i,p),type=v===null?'null':Array.isArray(v)?'array':typeof v,expected=expectedTypes(p);return {path:p,state:cell.status,present:v!==undefined,type,expectedTypes:expected,typed:cell.status==='UNKNOWN'||cell.status==='NOT_APPLICABLE'||expected.includes(type),valueHash:hash(v??null)};});
   const present=operands.some(o=>o.present&&o.typed);assessments.push({check:'SOURCE_BOUND_MATERIAL_OPERAND',alternatives:operands,present});if(!present)missingGroups.push(alternatives[0]);
  }
  consumed=!!group&&population?.ageBand==='ADULT'&&missingGroups.length===0&&material.valid;
  const currentObservations=read('/observations');
  const narrativeClinical=['pain','persistentPain','injury','illness','functionalLimitation'].some(k=>typeof currentObservations?.[k]==='string'&&!/^(?:no\b|none\b|false\b|unknown\b|unassessed\b)/i.test(currentObservations[k])&&(/^(?:present|true|yes|ongoing)$/i.test(currentObservations[k])||/persistent|current illness|injur|new functional limitation/i.test(currentObservations[k])));
  if(eligibility?.status==='CLINICAL_CONCERN'||narrativeClinical||['clinicalConcern','pain','injury','illness','persistentPain','functionalLimitation'].some(k=>eligibility?.[k]===true||currentObservations?.[k]===true)||['INJURY','ILLNESS'].includes(read('/interruption/reason'))){
   d=make('CLINICAL_HUMAN_REQUIRED',classes[7],'Explicit clinical dependency requires a qualified human; no dependent dose is selected',{unsupportedDependency:'QUALIFIED_CLINICAL_HUMAN'});
  } else if(!group||population?.ageBand!=='ADULT')d=domain('Population or request is outside the typed adult recreational request vocabulary','POPULATION_OR_REQUEST_SCOPE');
  else if(missingGroups.length||!material.valid)d=make('ASK',classes[6],'Request-specific material representation is incomplete, empty, conflicting or untyped. This is a contract/normalization ASK, excluded from useful coaching and semantic consumption.',{missingInputs:[...new Set([...missingGroups,...material.errors.map(e=>e.path)])],unsupportedDependency:'MATERIAL_INPUT_CONTRACT'});
  else if(population.ageYears!==undefined&&(!Number.isFinite(population.ageYears)||population.ageYears<18))d=domain('Explicit age contradicts or does not establish the adult policy population','POPULATION_APPLICABILITY');
  else if(eligibility?.status!=='NONCLINICAL_CONFIRMED')d=ask('Current eligibility is unknown; no disease or clearance is inferred',['/eligibility/status']);
  else if(i.adapter.conflicts.length)d=ask('Supplied sources disagree; reconcile the specific facts before dependent interpretation',i.adapter.conflicts.flatMap(c=>c.sourcePaths??[String(c)]),true);
  else {
   const demand=read('/currentDemand'),obs=read('/observations'),history=read('/priorHistory')??read('/history'),calibration=read('/calibration');
   switch(kind){
    case 'FIRST_WEEK':case 'FIRST_RUN_SESSION':case 'FIRST_STRENGTH_SESSION':case 'FIRST_PRODUCT_WEEK':{
     const movement=read('/onboarding/movementKnowledge');
     if(demand.requestedExercise&&(!movement||typeof movement==='string'&&/unknown|never handled/i.test(movement)))d=ask('Requested load and equipment do not establish task competence, configuration or demonstrated load',['/onboarding/movementKnowledge','/reportedExposure/strength']);
     else d=domain('The supplied establishment context is understood, but no approved whole-request recipe matches these modality configurations, available days and current exposure. An adult label is not an exact age; a reported walk is not a run tolerance or machine-task demonstration.','FIRST_PRESCRIPTION_EXACT_RECIPE');
     read('/onboarding/availability');read('/reportedExposure');break;
    }
    case 'NEVER_EXPOSED_RUN_FAMILY':d=ask('Lifting experience does not establish interval competence or task-specific calibration',['/reportedExposure/run','/currentDemand/calibration']);break;
    case 'LOCAL_FATIGUE':read('/alternatives');d=domain('Typed essential/optional configuration is represented. Its exact task, current necessity and smaller sufficient alternatives still need a bounded independently approved binding; no other registry configuration is substituted.','OPTIONAL_ACCESSORY_EXACT_CONFIGURATION');break;
    case 'SYSTEMIC_FATIGUE':{
     const actual=read('/completedPrefix');read('/alternatives');d=domain('Actual completed dose '+JSON.stringify(actual)+' is immutable. This exact partial-execution context has no independently approved future-suffix dose binding.','PARTIAL_CRUISE_SUFFIX_DOSING');break;
    }
    case 'NEXT_STRENGTH_SESSION':d=domain('Exact set-level response and candidate load/repetitions are consumed. Current necessity, smallest sufficient change and this movement-specific finite candidate lack a reviewed binding.','STRENGTH_ADAPTATION_EXACT_TASK');break;
    case 'REVIEW_NEXT_SESSION':{
     const last=obs?.lastEasyRun;
     if(last?.plannedMinutes===25&&last.actualMinutes===26&&last.talk==='comfortable'&&last.response==='usual'&&obs.restOfWeek==='ordinary'&&history?.pattern==='no repeated incompatible response')d=make('KEEP',classes[1],'The bounded familiar week has no supported necessity for change; retain actual26 and planned25 separately. The one-minute observation is not a universal noise threshold.');
     else d=ask('Comparable actual work and current response are needed before calling the next session adequate',['/observations/lastEasyRun','/history/pattern']);break;
    }
    case 'MISSED_OPTIONAL_SESSION':{
     if(demand.session?.optional===true&&obs?.notMissingUpload===true&&obs.coreWork==='compatible'&&obs.recovery==='usual'&&demand.remainingWeek?.status==='feasible'&&read('/athletePreference')==='continue current week')d=make('KEEP',classes[1],'Explicit optional omission leaves feasible essential work and compatible response. No catch-up work or automatic progression.');
     else d=ask('Distinguish confirmed optional omission from absent upload and establish remaining essential feasibility',['/currentDemand/session/optional','/observations/notMissingUpload','/currentDemand/remainingWeek']);break;
    }
    case 'ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT':read('/alternatives');d=domain('Local start/duration/window overlap is representable. Familiar arrangement is not a complete admissibility/essential-stimulus review; priority alone cannot certify either moved configuration.','JOINT_SCHEDULE_ADMISSIBILITY');break;
    case 'REVIEW_SESSION':read('/wearable');d=ask('Reconcile device provenance and current comparable observations before interpreting a proprietary readiness alert',['/population/dataTier','/wearable/measurementComparability']);break;
    case 'EQUIPMENT_SUBSTITUTION':d=ask('Barbell kilograms cannot supply dumbbell load, competence, configuration or complete alternative recipe',['/currentDemand/requested/loadKgPerHand','/history/requestedMovementFamiliar','/history/completeAlternativeRecipe']);break;
    case 'FIRST_RETURN_SESSION':case 'FIRST_RETURN_STRENGTH':case 'RETURN_WEEK':{
     const interruption=read('/interruption');
     if(!interruption?.reason||interruption.nonclinical!==true||interruption.actualExposureKnown!==true)d=ask('Interruption reason and actual exposure/current restrictions are missing; elapsed days and an old plan cannot establish current capacity',['/interruption/reason','/interruption/nonclinical','/interruption/actualExposureKnown','/observations/currentCapacity']);
     else if(read('/observations/currentTaskDemonstration')!==undefined&&factCell(i,'/observations/currentTaskDemonstration').status==='KNOWN')d=domain('A current task demonstration is now supplied, but this complete return recipe/context still needs its exact independent approval and executable binding','CURRENT_RETURN_RECIPE_BINDING');
     else d=ask('The nonclinical pause is explicit, but current task-specific capacity/response is unestablished; ordinary walking and historical tolerance do not establish a current run or lifting dose',['/observations/currentTaskDemonstration']);break;
    }
    case 'RETURN_NEXT_STEP':{
     read('/interruption');
     d=typeof obs?.entrySession==='string'&&/ended early/i.test(obs.entrySession)&&obs.contextComparability==='uncertain'&&demand.availableReviewedSmallerAlternative===null?hold('The supplied early-ended entry response and uncertain comparison do not support restoring former loads; no reviewed smaller current alternative is supplied','CURRENT_REENTRY_REASSESSMENT'):domain('Current entry response and alternatives are supplied and retained; this exact next-return context has no supported prescription binding','CURRENT_REENTRY_BINDING');break;
    }
    case 'RACE_WEEK':{
     read('/event');read('/availability');read('/constraints');
     if(read('/event/firstAtDistance')===true)d=ask('Recent long-run exposure, distance-specific experience and event intent remain unknown; no 5K-to-half pace conversion is permitted',['/priorHistory/run/longestRecentRun','/calibration/halfMarathonPace']);
     else d=science('The exact event, temporary priority, familiar run/strength components and windows are consumed. Their combined baseline-relative race-week recipe and essential-stimulus adequacy lack sufficient independent approval.','JOINT_HYBRID_TAPER_RECIPE');break;
    }
    case 'DAY_AFTER_EVENT':{
     read('/event');const paths=['/observations/postEventSymptoms','/observations/currentFunction','/observations/subjectiveRecovery'],missing=paths.filter(p=>['ABSENT','UNKNOWN'].includes(factCell(i,p).status));
     d=missing.length?ask('Hard event completion does not establish next-day recovery; the listed current response facts remain absent/unknown. Absolute evaluation date is not invented.',missing):domain('Current post-event response is supplied and consumed; an exact independently reviewed next-day lifting recipe and chronological binding are still absent','POST_EVENT_RETURN_RECIPE');break;
    }
    case 'RUN_CALIBRATION':{
     const family=read('/currentDemand/family');read('/environment');
     if(family==='EASY'&&demand.requestedMinutes===20&&history?.sameRoute==='two comfortable 20 min walk/jog sessions'&&history.talkAnchor==='comfortable full sentences'&&history.response==='compatible'&&read('/environment/terrain')==='flat'&&read('/environment/conditions')==='similar to reported exposure'&&calibration?.construct==='comfortable easy effort, not a measured physiological zone'){
      const a=existingApproval('R2-P14');d=a?positive(a,r2Registry.recipes.find(r=>r.recipeId==='R2-EASY-20'),'ONE_FAMILIAR_EASY_SESSION'):science('Current independent R2 authority is unavailable','R2_P14_AUTHORITY');
     }else if(family==='RECOVERY'){
      const paths=['/calibration/recoveryDistinctConstruct','/observations/needForSeparateRecoveryIntent'],missing=paths.filter(p=>['ABSENT','UNKNOWN'].includes(factCell(i,p).status)||read(p)==='not supplied');
      d=missing.length?ask('A separate recovery target needs an explicit construct/intent; familiar easy is not automatically a distinct recovery calibration',missing):domain('Separate recovery construct and intent are supplied; no exact reviewed distinct recovery method/recipe binding is implemented','RECOVERY_CONSTRUCT_RECIPE_BINDING');
     }
     else if(family==='HILLS')d=ask('Flat pace does not calibrate unfamiliar hills; grade, footing, bout and downhill exposure are material',['/calibration/grade','/calibration/duration','/calibration/downhillExposure','/environment/surface']);
     else if(['VO2_STYLE_INTERVALS','SHORT_INTERVALS','RACE_PACE'].includes(family))d=domain('The provided prediction, easy pace or historical race does not bind an exact current same-task recipe/target. Primary gap is task establishment/domain binding; no new literature insufficiency is inferred merely from missing athlete data.','CURRENT_TASK_CALIBRATION_BINDING');
     else if(family==='THRESHOLD_CRUISE'){
      const paths=['/priorHistory/sameFamily/warmupMinutes','/priorHistory/sameFamily/cooldownMinutes'],missing=paths.filter(p=>['ABSENT','UNKNOWN'].includes(factCell(i,p).status));
      d=missing.length?ask('Cruise work is present, but the listed full-session components are missing. Matching work blocks alone does not establish complete-recipe tolerance.',missing):domain('Full-session components are now supplied and consumed; exact complete current-context recipe eligibility still requires a supported binding','COMPLETE_CRUISE_CURRENT_CONTEXT_BINDING');
     }
     else if(family==='STRIDES')d=ask('The familiar4x15s block and self-paced walking recovery are represented, but preparation and the full-session envelope are absent. No easy minutes or fixed rest may be added to turn a block into a complete session.',['/priorHistory/sameFamily/preparation','/currentDemand/sessionEnvelope']);
     else if(family==='STEADY')d=domain('The complete familiar steady task is represented but its exact recipe has no current independent executable approval','FAMILIAR_STEADY_RECIPE');
     else d=domain('Run family and calibration facts are understood but no exact eligible binding exists','RUN_FAMILY_EXACT_BINDING');
     break;
    }
    case 'RUN_NEXT_SESSION':d=domain('The55-to60min familiar candidate is distinct from the reviewed40-to45 selector; exact next-horizon need and smallest sufficient step are not approved by relabeling minutes.','LONG_RUN_EXACT_PROGRESS_CANDIDATE');break;
    case 'RANK_EXISTING_ADMISSIBLE_OPTIONS':read('/learningConsent');read('/constraints');d=domain('Contextual observations are preserved as associations. Each option still requires independent admissibility and a current reason to choose; no causal rule or unreviewed option is created.','OPTION_ADMISSIBILITY_AND_NECESSITY');break;
    case 'LEARN_NEW_RULE':read('/learningConsent');d=hold('The supplied confounded observations do not establish a causal fatigue rule or an independently admissible new dose. Preserve the population prior and actual observations.','NO_SUPPORTED_INDIVIDUAL_RULE');break;
    default:d=domain('Request is represented but has no semantic consumer yet','UNIMPLEMENTED_REQUEST_KIND');consumed=false;
   }
   // New finite witnesses can only be enabled after a separately recorded pre-expansion baseline.
   if(enableExpansion&&kind==='RUN_CALIBRATION'&&['STEADY','STRIDES'].includes(demand.family)){
    const a=currentApproval('R3-'+demand.family);
    if(a&&Object.keys(history??{}).every(k=>k==='sameFamily')&&hash(history?.sameFamily)===a.policy.requiredSameFamilyHash&&hash(calibration)===a.policy.requiredCalibrationHash&&hash(read('/environment'))===a.policy.requiredEnvironmentHash&&population.runExperience==='INTERMEDIATE'&&read('/eligibility/source')==='EXPLICIT_SYNTHETIC_CURRENT_CONTEXT')d=positive(a,a.policy.recipe,'ONE_FAMILIAR_'+demand.family+'_SESSION');
   }
   if(d.decisionType==='MODIFY'){
    const sourceKeys=[...new Set(Object.keys(i.facts).map(p=>p.split('/')[1]))];
    const allowedSourceKeys=['population','eligibility','currentDemand','priorHistory','calibration','environment'];
    const interruption=read('/interruption'),current=read('/observations');
    const currentFacts=sourceKeys.filter(k=>!allowedSourceKeys.includes(k));
    const populationFields=['synthetic','realPerson','ageBand','ageYears','participation','priority','runExperience','strengthExperience','dataTier','historyOrigin'];
    const eligibilityFields=['status','source','clinicalConcern','pain','injury','illness','functionalLimitation','clearanceClaim'];
    const unsupportedFields=Object.keys(population).filter(k=>!populationFields.includes(k)).concat(Object.keys(eligibility).filter(k=>!eligibilityFields.includes(k)));
    const warningCodes=i.adapter.warnings.map(w=>w.code);
    if(interruption!==undefined||current!==undefined||currentFacts.length||unsupportedFields.length||warningCodes.some(c=>['EXPLICIT_STALE_OBSERVATION','DUPLICATED_EVENT_ID_PRESERVED'].includes(c)))d=hold('Additional current, stale, duplicate or unreviewed context cannot be discarded by a familiar-task selector; reconcile before reuse','CURRENT_CONTEXT_RECONCILIATION');
    else if(population.participation!=='RECREATIONAL_HYBRID'||!['NOVICE','INTERMEDIATE'].includes(population.runExperience)||!['NOVICE','INTERMEDIATE'].includes(population.strengthExperience))d=domain('Familiar task does not extend the independently reviewed population','POPULATION_APPLICABILITY');
    else if(['clinicalConcern','pain','injury','illness','functionalLimitation'].some(k=>eligibility[k]!==false)||eligibility.source!=='EXPLICIT_SYNTHETIC_CURRENT_CONTEXT')d=ask('Current explicit source and nonclinical guard facts are missing; no hidden default certainty',['/eligibility/source','/eligibility/currentClinicalGuards']);
    else if(d.policyRefs[0].id==='R2-P14'&&(Object.keys(history).some(k=>!['sameRoute','talkAnchor','response'].includes(k))||Object.keys(calibration??{}).some(k=>!['available','unavailable','construct'].includes(k))||Object.keys(demand).some(k=>!['kind','family','requestedMinutes'].includes(k))||Object.keys(read('/environment')??{}).some(k=>!['terrain','conditions'].includes(k))))d=hold('Unreviewed same-task calibration metadata must be reconciled before exact R2 reuse','R2_EXACT_CONTEXT_METADATA');
    else if(d.policyRefs[0].id==='R3-STEADY'&&(Object.keys(demand).some(k=>!['kind','family','requestedWorkMinutes'].includes(k))||demand.requestedWorkMinutes!==d.candidate.recipe.workMinutes))d=hold('The requested steady dose or additional demand metadata differs from the exact reviewed session','STEADY_REQUEST_RECIPE_BINDING');
   }
   if(d.decisionType==='KEEP'){
    const allowedTop=['population','eligibility','currentDemand','observations',...(kind==='REVIEW_NEXT_SESSION'?['history']:['athletePreference'])];
    const topKeys=[...new Set(Object.keys(i.facts).map(p=>p.split('/')[1]))];
    const allowedObservations=kind==='REVIEW_NEXT_SESSION'?['lastEasyRun','terrain','restOfWeek','athleteRequest']:['omission','notMissingUpload','coreWork','recovery'];
    if(read('/interruption')!==undefined||topKeys.some(k=>!allowedTop.includes(k))||Object.keys(obs??{}).some(k=>!allowedObservations.includes(k))||i.adapter.warnings.some(w=>['EXPLICIT_STALE_OBSERVATION','DUPLICATED_EVENT_ID_PRESERVED'].includes(w.code)))d=hold('Changed or unreviewed current context prevents calling the bounded familiar remainder adequate','CURRENT_ADEQUACY_RECONCILIATION');
   }
  }
 }
 const inputHash=hash(i);
 const result={mode:'SHADOW',inputVersion:'CANONICAL-3.0.0',officialPlanState:clone(official),observedExecutionState:clone(completed),appliedState:clone(official),shadowDecision:{...d,id:'r3-'+inputHash,traceId:'r3-trace-'+inputHash,inputHash,applied:false,effect:'SHADOW_ONLY',autonomyLevel:d.decisionType==='MODIFY'?'SUGGEST_AND_CONFIRM':'ABSTAIN_OR_HOLD',mustNot:['MUTATE_OFFICIAL_PLAN','APPLY_EFFECT','REWRITE_COMPLETED_WORK','INVENT_MISSING_FACT','INFER_CAUSALITY','PROMOTE_PRODUCT_TRUTH'],preserve:{officialHash:hash(official),completedHash:hash(completed)},semanticConsumption:{schemaValid:validation.valid,consumed,normal:d.coverage!==classes[7],materialContract:material,bindingAssessment:assessments,decisionReady:!['ASK','CLINICAL_HUMAN_REQUIRED'].includes(d.decisionType)},trace:{consumerVersion:'DCR3-CONSUMER-3',inputHash,reads,source:clone(i.source??null),adapterTrace:clone(i.adapter?.trace??[]),adapterWarnings:clone(i.adapter?.warnings??[]),adapterConflicts:clone(i.adapter?.conflicts??[])}}};
 return freeze(result);
}

export class CanonicalShadowJournal {
 #entries=new Map();
 record(input,options){const r=evaluateCanonicalShadow(input,options),key=hash({input,options:options??{}});if(this.#entries.has(key))return {duplicate:true,result:this.#entries.get(key)};this.#entries.set(key,r);return {duplicate:false,result:r};}
 get size(){return this.#entries.size;}
}
