import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../r2/SHADOW_INPUT_R2_SCHEMA.json' with {type:'json'};
import rawRegistry from '../r2/POSITIVE_PRESCRIPTION_REGISTRY.json' with {type:'json'};
import rawAuthority from '../r2/SSCTR_RUNTIME_AUTHORITY.json' with {type:'json'};
import {clone,freeze,hash} from './value.mjs';
import {routeBoundary} from './semantics.mjs';

const registry=freeze(clone(rawRegistry)),authority=freeze(clone(rawAuthority));
const validate=new Ajv2020({strict:false,allErrors:true}).compile(schema);
const registryHash=hash(registry),days=['MON','TUE','WED','THU','FRI','SAT','SUN'];
export const r2AuthorityInfo=()=>({registryVersion:registry.revision,registryHash,approvedPolicyIds:registry.policies.filter(p=>reviewFor(p)).map(p=>p.policyId)});
function reviewFor(p){
 if(authority.registryHash!==registryHash||authority.policyHashes[p.policyId]!==hash(p))return null;
 return authority.records.find(r=>r.target.rule_ids.includes(p.policyId)&&r.disposition==='APPROVE_WITH_CONDITIONS'&&['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(r.evidence_status)&&r.reviewer.independent_of_target_author===true);
}
function recipe(id){return registry.recipes.find(r=>r.recipeId===id);}
function validParameters(s){
 const p=s.parameters,id=s.recipeId;
 const exactly=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&sameSet(Object.keys(o),keys);
 if(['R2-SQUAT-3X8','R2-SQUAT-3X9','R2-SQUAT-2X8','R2-LOWER-CALF','R2-LOWER-ONE-CALF','R2-LOWER-NO-CALF'].includes(id))return exactly(p,['loadKg','targetRir'])&&p.loadKg>0&&p.targetRir===2;
 if(['R2-ST-EST-1X8','R2-RACE-ST-1X5'].includes(id)){const keys=id==='R2-ST-EST-1X8'?['legPress','machineChestPress','seatedCableRow','seatedLegCurl']:['legPress','machineChestPress','seatedCableRow'];return exactly(p,['loadsKg'])&&exactly(p.loadsKg,keys)&&Object.values(p.loadsKg).every(n=>n>0);}
 if(['R2-RUN-5X3','R2-RUN-4X3','R2-CRUISE-3X5'].includes(id))return exactly(p,['paceSecondsPerKm'])&&p.paceSecondsPerKm>0;
 if(['R2-RACE-10K-CUE','R2-RACE-HALF-CUE'].includes(id))return exactly(p,['racePaceSecondsPerKm'])&&p.racePaceSecondsPerKm>0;
 return exactly(p,[]);
}
function resolve(value,parameters){
 if(typeof value==='string'&&value.startsWith('$')){
  let v=parameters;for(const key of value.slice(1).split('.'))v=v?.[key];
  if(typeof v!=='number'||!Number.isFinite(v)||v<0)throw new Error('Missing concrete established parameter '+value);
  return v;
 }
 if(Array.isArray(value))return value.map(v=>resolve(v,parameters));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolve(v,parameters)]));
 return value;
}
function projectedSession(id,day,recipeId,parameters={},optional=false){
 const r=recipe(recipeId);if(!r)throw new Error('Unknown recipe '+recipeId);
 return {session_id:id,day,recipeId,recipeRevision:r.revision,status:'PLANNED',optional,parameters:clone(parameters),modality:r.modality,family:r.family,prescription:resolve(r.prescription,parameters)};
}
function validTime(v,now){
 if(typeof v!=='string')return false;
 const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.\d+)?(?:Z|([+-])(\d\d):(\d\d))$/.exec(v);
 if(!m)return false;
 const [year,month,day,hour,minute,second]=m.slice(1,7).map(Number),last=new Date(0);last.setUTCFullYear(year,month,0);
 return month>=1&&month<=12&&day>=1&&day<=last.getUTCDate()&&hour<=23&&minute<=59&&second<=59&&(!m[7]||Number(m[8])<=23&&Number(m[9])<=59)&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.parse(now);
}
const sameSet=(a,b)=>new Set(a).size===a.length&&new Set(b).size===b.length&&a.length===b.length&&a.every(x=>b.includes(x));

export function evaluateR2(i,make){
 const base=(type,reason,extra={})=>make(i,type,reason,{policyVersion:registry.revision,policyHash:registryHash,...extra});
 const ask=(reason,...missing)=>base('ASK',reason,{missingInputs:missing});
 const hold=(reason,dependency='R2_BOUNDED_POLICY_SCOPE')=>base('HOLD',reason,{unsupportedDependency:dependency});
 const unsupported=(reason,gap)=>base('NOT_SUPPORTED_YET',reason,{unsupportedDependency:gap});
 if(i.synthetic!==true||i.purpose!=='SYNTHETIC_SHADOW')return base('ABSTAIN','R2 is authorized only for explicit offline synthetic shadow evaluations',{unsupportedDependency:'REAL_USE_NOT_AUTHORIZED'});
 const clinical=routeBoundary(i.recoveryContext)?.decisionType==='CLINICAL_HUMAN_REQUIRED'||i.recoveryContext?.clinicalConcern===true||i.recoveryContext?.eligibilityStatus==='CLINICAL_CONCERN'||i.athleteState?.clinical_profile===true||['INJURY','ILLNESS'].includes(i.event?.facts?.reason);
 if(clinical)return base('CLINICAL_HUMAN_REQUIRED','Supplied clinical dependency prevents any dependent prescription; elapsed time, wearable or confidence cannot clear it',{unsupportedDependency:'QUALIFIED_CLINICAL_HUMAN'});
 if(!validate(i))return ask('R2 strict input contract is incomplete or contains unsupported metadata; nothing is defaulted',...validate.errors.map(e=>(e.instancePath||'/')+(e.params.missingProperty?'/'+e.params.missingProperty:'')));
 if(!validTime(i.evaluatedAt,i.evaluatedAt)||!validTime(i.observation.observedAt,i.evaluatedAt))return ask('Evaluation/observation time is invalid or future','NONFUTURE_EXPLICIT_OBSERVATION');
 if(i.athleteFixtureId!==i.athleteState.athlete_id||i.officialPlanState&&i.officialPlanState.athlete_id!==i.athleteFixtureId)return base('ABSTAIN','Athlete and plan identities do not agree',{unsupportedDependency:'IDENTITY_PURPOSE'});
 if(!i.athleteState.adult)return unsupported('This bounded R2 population includes adults only','POPULATION_APPLICABILITY');
 if(i.athleteState.ageYears!==undefined&&i.athleteState.ageYears<18)return unsupported('Declared age contradicts the adult population; no adult policy can prescribe','POPULATION_APPLICABILITY');
 if(i.recoveryContext.eligibilityStatus!=='NONCLINICAL_CONFIRMED')return ask('Current nonclinical eligibility is unassessed; no clearance or disease is inferred','CURRENT_ELIGIBILITY');
 if(i.recoveryContext.contextChanged||i.policyContext.holds.length)return hold('A current hold or changed context suspends dependent policy use','CURRENT_CONTEXT_GUARDS');
 if(i.provenance.dataClass!=='SYNTHETIC')return base('ABSTAIN','Real data is outside the authorized R2 scope',{unsupportedDependency:'REAL_USE_NOT_AUTHORIZED'});
 if(i.provenance.coverage!=='EXPLICIT_FIXTURE_FACTS'||i.provenance.association!=='CONFIRMED'||i.observation.coverage!=='COMPLETE'||i.observation.association!=='CONFIRMED')return ask('Incomplete coverage or uncertain association cannot establish dosing eligibility','COMPLETE_ASSOCIATED_CURRENT_FACTS');
 if(!i.observation.contextComparable)return ask('Current context does not establish the required comparison','COMPARABLE_CURRENT_CONTEXT');
 if(i.observation.response!=='COMPATIBLE')return hold('Adverse or unknown response requires reassessment before a new dose','CURRENT_RESPONSE_REASSESSMENT');
 const echoes=i.observedExecutionState.events;
 const establishmentObservation=['ESTABLISH_RUN','ESTABLISH_STRENGTH'].includes(i.event.request)&&i.officialPlanState!==null;
 if(echoes.length>1||echoes.length===1&&echoes[0].event_id!==i.event.event_id||i.observedExecutionState.inferred.length||i.observedExecutionState.completed.length&&!establishmentObservation)return hold('Additional actual/events/inferences cannot be silently discarded by this atomic request','R2_RECONCILED_ACTUAL_STATE');
 if(i.policyContext.registryVersion!==registry.revision||i.policyContext.registryHash!==registryHash)return hold('The registry version/hash is stale or unsupported','CURRENT_POLICY_REGISTRY');
 const p=registry.policies.find(p=>p.request===i.event.request);
 if(!p||i.policyContext.requestedPolicyIds.some(id=>id!==p.policyId))return unsupported('Requested policy has no binding to this request','REQUESTED_POLICY_BINDING');
 const isReturn=i.event.request.startsWith('RETURN');
 if(i.recoveryContext.interrupted!==isReturn)return hold('Interrupted continuity cannot reuse an ordinary progression or calibration policy','REENTRY_POLICY_REQUIRED');
 const review=reviewFor(p);
 if(!review||i.policyContext.revokedReviewIds.includes(review.review_id))return hold('This exact policy has no current independent sufficient approval; no positive recipe is enabled','INDEPENDENT_SSCTR_APPROVAL_'+p.policyId);
 const bind=d=>({...d,profileId:p.policyId,policyRefs:[{id:p.policyId,version:p.revision,hash:hash(p)}],evidenceRefs:[{reviewId:review.review_id,version:review.review_revision,hash:hash(review),target:review.target,evidenceStatus:review.evidence_status,disposition:review.disposition}],scientificConditions:{population:p.populationBound,applicability:clone(review.applicability),conditions:clone(review.decision),limitations:clone(review.limitations),humanValidation:false,clinicalValidation:false,empiricalValidation:false},confidence:{level:'MODERATE',basis:'Bounded provisional internal literature review and explicit synthetic task facts; no individual efficacy, clinical clearance or safety probability'},nextCheck:clone(p.nextCheck)});
 const keep=reason=>bind(base('KEEP',reason));
 const f=i.event.facts,plan=i.officialPlanState;
 if(plan){
  if(new Set(plan.sessions.map(s=>s.session_id)).size!==plan.sessions.length)return ask('Plan session identities are duplicated','UNIQUE_SESSION_IDENTITIES');
  if(plan.sessions.some(s=>!recipe(s.recipeId)))return unsupported('Current plan contains a recipe outside the reviewed bounded registry','CURRENT_PLAN_RECIPE_BINDING');
  if(plan.sessions.some(s=>!validParameters(s)))return ask('Current session parameters must match the exact recipe, including unrelated sessions; unsupported parameters are never ignored','EXACT_RECIPE_PARAMETER_BINDING');
 }
 const target=plan?.sessions.find(s=>s.session_id===i.event.sessionId);
 if(i.event.sessionId!==null&&(!target||target.status!=='PLANNED'))return hold('Target is missing or already completed; only prospective work may change','PROSPECTIVE_TARGET');
 if(establishmentObservation){
  const recipeId=i.event.request==='ESTABLISH_RUN'?'R2-RUN-EST-10X1':'R2-ST-EST-1X8',expectedCount=i.event.request==='ESTABLISH_RUN'?3:2,actual=i.observedExecutionState.completed;
  const allowed=i.event.request==='ESTABLISH_RUN'?[['MON','WED','SAT'],['TUE','THU','SAT'],['MON','WED','FRI']]:[['MON','THU'],['TUE','FRI'],['WED','SAT']];
  if(f.timeBudgetMinutes<30||plan.sessions.some(s=>!f.availableDays.includes(s.day)))return ask('Current time and availability no longer support retaining the same establishment week','CURRENT_ESTABLISHMENT_SCHEDULE');
  if(!allowed.some(s=>sameSet(s,plan.sessions.map(s=>s.day))))return unsupported('The chosen establishment calendar is outside the finite reviewed schedules','ESTABLISHMENT_CALENDAR_BINDING');
  if(i.event.request==='ESTABLISH_RUN'&&(!(i.athleteState.ageYears>=18&&i.athleteState.ageYears<=65)||f.walkMinutes<30||!f.comfortableTalk))return ask('Next-week retention requires the same current bounded population and establishment context','CURRENT_ESTABLISHMENT_APPLICABILITY');
  if(i.event.request==='ESTABLISH_STRENGTH'&&(i.athleteState.movementCompetence!=='KNOWN'||!f.configurationFamiliar||!f.techniqueDemonstrated||!f.loadEstablished||plan.sessions.some(s=>hash(s.parameters.loadsKg)!==hash(f.loadsKg))))return ask('Next-week retention requires current demonstrated task competence and the same established loads','CURRENT_ESTABLISHMENT_APPLICABILITY');
  if(plan.sessions.length!==expectedCount||plan.sessions.some(s=>s.recipeId!==recipeId))return unsupported('An unrelated existing plan cannot establish this first-week/response sequence','ESTABLISHMENT_RESPONSE_BINDING');
  if(actual.length!==expectedCount||new Set(actual.map(a=>a.factId)).size!==expectedCount||new Set(actual.map(a=>a.sessionId)).size!==expectedCount||actual.some(a=>{const s=plan.sessions.find(s=>s.session_id===a.sessionId);return !s||a.athleteId!==i.athleteFixtureId||a.recipeId!==s.recipeId||a.executedRevision!==plan.plan_revision||hash(a.parameters)!==hash(s.parameters)||a.coverage!=='COMPLETE'||!validTime(a.observedAt,i.evaluatedAt);}))return ask('Completed first-week dose, identity, revision and current compatible response must be observed; absent uploads cannot become completion','COMPLETE_ESTABLISHMENT_RESPONSE');
  return keep('The complete chosen establishment week has explicit compatible observed response in the same current context; retain the same next-week dose, without automatic progression');
 }
 const propose=(reason,sessions,actionClass='REPLAN',changeLevel=2,comparisons=[],extra={})=>{
  if(extra.scope?.startsWith('FIRST_RETURN')){
   sessions=sessions.map(s=>({...s,session_id:'r2-return-'+hash({inputHash:hash(i),selectedSession:s.session_id})}));
   if(sessions.some(s=>plan?.sessions.some(old=>old.session_id===s.session_id)))return hold('A return-session identity collides with existing work; no prospective/observed identity may be reused','RETURN_SESSION_IDENTITY');
   sessions=[...clone(plan?.sessions.filter(s=>s.status==='COMPLETED')??[]),...sessions];
   extra={...extra,preservedOfficialPlan:clone(plan)};
  }
  const candidate={basePlanId:plan?.plan_id??null,basePlanRevision:plan?.plan_revision??null,basePlanHash:hash(plan),athleteId:i.athleteFixtureId,scope:plan?'NEXT_REVIEWED_HORIZON':'FIRST_ESTABLISHMENT_WEEK',sessions,confirmation:'REQUIRED_FOR_ANY_FUTURE_EFFECT',...extra};
  if(sessions.length&&plan&&hash(sessions.map(s=>({session_id:s.session_id,day:s.day,recipeId:s.recipeId,status:s.status,optional:s.optional,parameters:s.parameters})))===hash(plan.sessions))return keep('Concrete selected target equals the already established plan; no positive change is counted');
  const changes=[{scope:candidate.scope,targetSessionId:i.event.sessionId,selectedRecipeIds:sessions.map(s=>s.recipeId),action:actionClass}];
  return bind(base('MODIFY',reason,{candidate,candidateHash:hash(candidate),modify:changes,actionClass,mec:{changeLevel,framework:'AEC/AEOS minimum effective change; bounded R2 candidate selector'},candidateActionsConsidered:[{action:'KEEP',disposition:'INSUFFICIENT',reason:'Explicit request facts establish the bounded material problem or first-dose/calibration need'},...comparisons,{action:actionClass,disposition:'PROPOSE_ONLY',reason}],rejectedAlternatives:[{action:'ESCALATE_OTHER_DOSE_DIMENSIONS',reason:'Not needed or independently supported; preserve all unrelated work'},{action:'AUTOMATIC_APPLY',reason:'No application capability exists in shadow'}],tradeoff:p.tradeoff,necessityWitness:reason,sufficiencyWitness:'Selected finite protocol addresses only the declared problem; actual response remains to be observed',populationPrior:'Applicable group-level literature is a bounded prior; it does not predict the individual response'}));
 };
 const replaceTarget=(recipeId,parameters=target?.parameters??{})=>plan.sessions.map(s=>s.session_id===target.session_id?projectedSession(s.session_id,s.day,recipeId,parameters,s.optional):clone(s));
 const eligibleEpisodes=(expectedRecipe,minSets=0)=>{
  const es=f.episodes;
  return es.length===2&&new Set(es.map(e=>e.factId)).size===2&&new Set(es.map(e=>e.observedAt)).size===2&&es.every(e=>e.athleteId===i.athleteFixtureId&&validTime(e.observedAt,i.evaluatedAt)&&e.coverage==='COMPLETE'&&e.comparable&&e.completed&&e.recipeId===expectedRecipe&&e.technique==='ACCEPTABLE'&&e.setsCompleted>=minSets&&e.uniformRepsAcrossAllSets)&&f.relevantContextUnchanged;
 };
 const strengthTarget=()=>target?.recipeId==='R2-SQUAT-3X8'&&target.parameters.loadKg===f.loadKg&&f.loadKg>0&&f.rirCalibratedForTask&&f.establishedTargetRir===2&&target.parameters.targetRir===2&&f.episodes.every(e=>e.actualLoadKg===f.loadKg);
 try{
 switch(i.event.request){
 case 'ESTABLISH_RUN':{
  if(typeof i.athleteState.ageYears!=='number')return ask('The bounded source-transferred first-run protocol requires its explicit age applicability; adult alone is not an empirical universal','BOUNDED_AGE_APPLICABILITY');
  if(i.athleteState.ageYears<18||i.athleteState.ageYears>65)return unsupported('This first-run protocol does not establish applicability beyond its adult18–65 source-transfer bound','FIRST_RUN_POPULATION_BOUND');
  if(f.walkMinutes<30||!f.comfortableTalk||f.timeBudgetMinutes<30)return ask('The selected run/walk protocol needs its current walking/talk/time anchor; no lower-capacity dose is guessed','CURRENT_PROTOCOL_ESTABLISHMENT_ANCHOR');
  const schedules=[['MON','WED','SAT'],['TUE','THU','SAT'],['MON','WED','FRI']],schedule=schedules.find(s=>s.every(day=>f.availableDays.includes(day)));
  if(!schedule)return unsupported('No reviewed establishment schedule fits the supplied days','FIRST_WEEK_SCHEDULE');
  return propose('First bounded conversational run/walk week uses the explicit current walking anchor without product history or wearable',schedule.map((d,n)=>projectedSession('est-run-'+n,d,'R2-RUN-EST-10X1')), 'REPLAN',4,[{action:'INFER_PACE_OR_CONTINUOUS_RUN',disposition:'REJECTED',reason:'No measured run capacity or performance target exists'}]);
 }
 case 'ESTABLISH_STRENGTH':case 'RETURN_STRENGTH':{
  const returning=isReturn;
  if(i.athleteState.movementCompetence!=='KNOWN'||!(returning?f.currentConfigurationDemonstrated:f.configurationFamiliar&&f.techniqueDemonstrated))return ask('Each machine task must first be demonstrated; run experience does not establish lifting competence','TASK_SPECIFIC_MACHINE_COMPETENCE');
  if(!(returning?f.currentLoadEstablished:f.loadEstablished)||Object.values(f.loadsKg).some(n=>n<=0))return ask('Each current easy/moderate task-specific machine load is required; no kilograms are inferred','CURRENT_DEMONSTRATED_MACHINE_LOADS');
  if(returning&&(!f.priorFamiliar||!['TRAVEL','SCHEDULE'].includes(f.reason)))return ask('Nonclinical prior exposure and interruption reason are required','NONCLINICAL_RETURN_CONTEXT');
  if(f.timeBudgetMinutes<30)return unsupported('The finite four-task session has no shorter approved configuration','STRENGTH_TIME_CONFIGURATION');
  const schedules=[['MON','THU'],['TUE','FRI'],['WED','SAT']],schedule=schedules.find(s=>s.every(d=>f.availableDays.includes(d)));
  if(!schedule)return unsupported('No reviewed nonconsecutive machine schedule fits','STRENGTH_ESTABLISHMENT_SCHEDULE');
  return propose(returning?'Re-entry uses current demonstrated machine loads, never a percentage of prior load or a day-count restoration':'First machine week uses each explicitly demonstrated easy/moderate load and configuration',schedule.map((d,n)=>projectedSession('est-strength-'+n,d,'R2-ST-EST-1X8',{loadsKg:f.loadsKg})),'REPLAN',4,[],returning?{scope:'FIRST_RETURN_SESSIONS_ONLY',preservedCompletedSessions:clone(plan?.sessions.filter(s=>s.status==='COMPLETED')??[]),unrelatedCurrentPlanPreserved:true}:{});
 }
 case 'PROGRESS_STRENGTH':{
  if(!f.nextHorizonNeedConfirmed)return keep('The current strength dose remains adequate; potential improvement alone does not establish necessity');
  if(!strengthTarget()||!eligibleEpisodes('R2-SQUAT-3X8',3))return ask('The reviewed task/load/RIR and two complete comparable all-set responses are not established; the witness count is not a universal threshold','COMPARABLE_SQUAT_TASK_RESPONSES');
  if(f.episodes.some(e=>e.result!=='OVER_TARGET'||e.actualReps!==10||e.actualRir<2))return keep('Small/noisy or nonmatching positive deviation does not justify this finite progression');
  return propose('Observed comparable 3x10 at the current calibrated effort supports next-session 3x9 at unchanged load, preserving all other dimensions',replaceTarget('R2-SQUAT-3X9'),'REPLAN',2,[{action:'INCREASE_LOAD_AND_REPS',disposition:'REJECTED',reason:'One repetition dimension addresses the progression need'}]);
 }
 case 'LOCAL_FATIGUE':{
  if(!f.materialProblem)return keep('Local sensation without established current inadequacy does not create necessity');
  if(target?.recipeId!=='R2-LOWER-CALF'||target.parameters.loadKg!==f.loadKg||target.parameters.targetRir!==2||!f.rirCalibratedForTask||f.establishedTargetRir!==2||f.fatigueScope!=='LOCAL'||f.affectedComponent!=='calf_raise_familiar_bodyweight'||f.essentialPerformance!=='COMPATIBLE'||!f.optionalComponentUnperformed)return hold('The optional-only local-fatigue recipe cannot address systemic/essential/unknown or already performed work');
  const selected=f.oneOptionalSetStillInadequate?'R2-LOWER-NO-CALF':'R2-LOWER-ONE-CALF';
  return propose(f.oneOptionalSetStillInadequate?'Even one optional calf set remains inadequate today; omit only the unperformed accessory and preserve the essential squat':'One optional calf set is sufficient; remove one defined set while preserving essential work',replaceTarget(selected),'REDUCE_VOLUME',2,[{action:'REMOVE_ONE_OPTIONAL_SET',disposition:f.oneOptionalSetStillInadequate?'INSUFFICIENT':'CHOSEN',reason:f.oneOptionalSetStillInadequate?'Supplied current local response makes even one set inappropriate':'Smaller action satisfies the explicit optional-volume need'},{action:'REDUCE_ESSENTIAL_SQUAT',disposition:'REJECTED',reason:'Essential performance remains compatible'}]);
 }
 case 'SYSTEMIC_FATIGUE':{
  if(!f.materialProblem)return keep('No established inadequacy means no fatigue-driven schedule change');
  if(f.optionalRemovalSufficient)return ask('A smaller optional-only change is sufficient; this larger scheduling branch is not justified','REVIEWED_SMALLER_OPTIONAL_CHANGE');
  if(!f.subjectiveFatigue||!f.performanceDecline||!f.contextComparable)return ask('Converging comparable fatigue/performance facts are required; no sensor-only score can prescribe','CONVERGING_NONCLINICAL_RESPONSE');
  const key=plan?.sessions.find(s=>s.session_id===i.event.sessionId),easySession=plan?.sessions.find(s=>s.recipeId==='R2-EASY-20'&&s.day==='SAT');
  if(!f.branchAuthorized||!f.branchFamiliar||!f.branchWindowAllowed||!f.easyCurrentlyTolerated||key?.day!=='THU'||key.recipeId!=='R2-RUN-5X3'||key.status!=='PLANNED'||!easySession||easySession.status!=='PLANNED')return hold('Only the exact authorized familiar THU/SAT branch is admissible; no new fatigue dose or recovery window is invented');
  const sessions=plan.sessions.map(s=>s===key||s===easySession?projectedSession(s.session_id,s===key?'SAT':'THU',s.recipeId,s.parameters,s.optional):clone(s));
  return propose('Comparable converging signals make today key execution inadequate; the authorized familiar swap preserves both essential prescriptions without claiming recovery by Saturday',sessions,'MOVE',3,[{action:'KEEP_KEY_TODAY',disposition:'INSUFFICIENT',reason:'Current comparable performance and fatigue establish inadequacy'},{action:'DELETE_KEY_OR_REPLAN_WHOLE_WEEK',disposition:'REJECTED',reason:'A familiar allowed slot preserves the essential stimulus'}]);
 }
 case 'UNDER_TARGET_STRENGTH':{
  if(!f.materialProblem)return keep('Small negative deviation with adequate current work does not justify changing dose');
  if(!f.essentialIntentPreserved)return hold('The reduced candidate does not preserve the essential intent; tolerated does not mean sufficient');
  if(f.smallerRestChangeSufficient)return ask('A smaller rest-only alternative is sufficient; the larger set reduction is not justified','REVIEWED_SMALLER_REST_CHANGE');
  if(!strengthTarget()||!eligibleEpisodes('R2-SQUAT-3X8',2)||!f.reducedCandidateTolerated)return ask('The concrete tolerated two-set candidate and comparable task responses are required','TOLERATED_REDUCED_STRENGTH_CANDIDATE');
  if(f.episodes.some(e=>e.result!=='UNDER_TARGET'||e.setsCompleted!==2||e.actualReps!==8))return hold('Observed execution does not support this exact third-set limitation');
  return propose('Repeated comparable third-set limitation with tolerated first two sets supports next-session 2x8 at the same load/effort/rest',replaceTarget('R2-SQUAT-2X8'),'REDUCE_VOLUME',2,[{action:'INCREASE_RIR_OR_LOWER_LOAD',disposition:'REJECTED',reason:'The explicit problem is only the third set; those alternatives unnecessarily change the established task target'}]);
 }
 case 'REDUCE_RUN_REPETITION':{
  if(!f.materialProblem)return keep('Under-target noise without necessity leaves the current interval plan unchanged');
  if(!f.essentialIntentPreserved)return hold('The reduced interval candidate does not preserve the essential intent; tolerance alone is insufficient');
  if(f.smallerRestChangeSufficient)return ask('A smaller rest-only alternative is sufficient; the larger repetition reduction is not justified','REVIEWED_SMALLER_REST_CHANGE');
  if(target?.recipeId!=='R2-RUN-5X3'||target.parameters.paceSecondsPerKm!==f.paceSecondsPerKm||f.paceSecondsPerKm<=0||!eligibleEpisodes('R2-RUN-5X3',0)||!f.fifthRepDegrades||!f.fourRepsTolerated||!f.targetCalibrated)return ask('Current task target, repeated fifth-repetition limitation and four-repetition tolerance are required','CALIBRATED_FOUR_REPETITION_CANDIDATE');
  if(f.episodes.some(e=>e.result!=='UNDER_TARGET'))return hold('The supplied run responses do not support this reduction');
  return propose('Select familiar 4x3min instead of 5x3min at unchanged established field-session pace and 120s recovery; no physiological VO2 claim',replaceTarget('R2-RUN-4X3'),'REDUCE_VOLUME',2);
 }
 case 'PROGRESS_RUN':{
  if(!f.nextHorizonNeedConfirmed)return keep('The current easy/long dose remains adequate; available capacity alone does not establish progression necessity');
  if(target?.recipeId!=='R2-EASY-40'||!eligibleEpisodes('R2-EASY-45',0)||!f.candidatePreviouslyTolerated)return ask('A current comparable tolerated 45min candidate is required; no universal increment is computed','CURRENT_45MIN_TOLERANCE');
  if(f.episodes.some(e=>e.result!=='COMPATIBLE'))return hold('Candidate response is not compatible; no positive progression');
  return propose('Select the already demonstrated 45min conversational candidate for the next easy/long horizon; no new maximum or 10% law',replaceTarget('R2-EASY-45'),'REPLAN',2);
 }
 case 'RETURN_RUN':{
  if(!['TRAVEL','SCHEDULE'].includes(f.reason)||!f.priorFamiliar)return ask('The nonclinical interruption and prior familiar exposure must be explicit','NONCLINICAL_RETURN_CONTEXT');
  if(!f.capacityEstablishedToday||f.currentRunMinutes<20||!f.currentComfortableTalk)return ask('Current conversational 20min capacity must be re-established; old fitness and elapsed days are insufficient','CURRENT_REENTRY_RUN_CAPACITY');
  if(f.timeBudgetMinutes<20||!f.availableDays.length)return unsupported('No reviewed return schedule fits current availability','RETURN_SESSION_AVAILABILITY');
  const d=[...f.availableDays].sort((a,b)=>days.indexOf(a)-days.indexOf(b))[0];
  return propose('First return session selects current demonstrated 20min easy work, followed by response observation before any further return-week progression',[projectedSession('return-run',d,'R2-EASY-20')],'REPLAN',3,[],{scope:'FIRST_RETURN_SESSION_ONLY',preservedCompletedSessions:clone(plan?.sessions.filter(s=>s.status==='COMPLETED')??[]),unrelatedCurrentPlanPreserved:true});
 }
 case 'TAPER_10K':case 'TAPER_HALF':case 'TAPER_BALANCED':
  return hold('Joint hybrid event-week baseline, ordering and essential-stimulus admissibility require a separately sufficient review; isolated familiar recipes do not validate the whole week','ACF-G04_JOINT_HYBRID_TAPER');
 case 'CALIBRATE_RUN':{
  const mapping={EASY:['R2-EASY-20','TALK_RPE','EASY_EFFORT'],LONG:['R2-EASY-40','TALK_RPE','LONG_EASY'],THRESHOLD:['R2-CRUISE-3X5','PACE','FIELD_SESSION_TARGET'],VO2:['R2-RUN-4X3','PACE','FIELD_SESSION_TARGET'],STRIDES:['R2-EASY20-STRIDES','TALK_RPE','RELAXED_STRIDE']};
  const m=mapping[f.family];
  if(!m||m[1]!==f.targetMethod||m[2]!==f.construct)return unsupported('Family/method/construct has no approved equivalence or calibration binding; CS, LT2, race pace, HR and power are not interchangeable','ACF-G05_CONSTRUCT_CALIBRATION');
  if(!f.familyFamiliar||!f.targetEstablished||!f.conditionsComparable||!f.toleranceKnown||f.toleratedRecipeId!==m[0])return ask('Exact task target and tolerance for this concrete recipe are required; familiarity or a label alone cannot establish dose','TASK_TARGET_AND_RECIPE_TOLERANCE');
  if(f.targetMethod==='PACE'&&!(f.paceSecondsPerKm>0)||f.targetMethod==='TALK_RPE'&&f.paceSecondsPerKm!==null)return unsupported('Provided pace is absent/inconsistent with the selected task-specific target method','TARGET_METHOD_BINDING');
  const params=f.targetMethod==='PACE'?{paceSecondsPerKm:f.paceSecondsPerKm}:{};
  if(target&&target.recipeId===m[0]&&hash(target.parameters)===hash(params))return keep('This exact calibrated recipe and target already form the concrete adequate prescription; no change is needed');
  if(target&&target.recipeId!=='R2-LABEL-'+f.family)return hold('Calibration can bind only the matching intent-only label; it cannot replace concrete adequate training or change modality without a separate necessity/admissibility policy','CALIBRATION_TARGET_SCOPE');
  if(plan&&!target)return ask('A current plan needs a concrete prospective session target; calibration cannot replace unrelated work','CURRENT_CALIBRATION_TARGET_SESSION');
  return propose('Bind the familiar session label to its explicit task-specific target and exact tolerated recipe; no physiological zone inference',plan?replaceTarget(m[0],params):[projectedSession('calibrated-run',null,m[0],params)],'REPLAN',1,[{action:'INFER_LT2_FROM_CS_OR_HR',disposition:'REJECTED',reason:'Constructs and measurement methods are not equivalent'}],plan?{}:{scope:'SINGLE_UNSCHEDULED_SESSION'});
 }
 case 'RANK_OPTIONS':{
  if(!i.policyContext.longitudinalPurposeAllowed)return hold('Longitudinal purpose is not allowed; athlete-specific ranking is suspended','LONGITUDINAL_PURPOSE');
  if(!f.necessityEstablished)return keep('Priority/history does not create necessity when the current schedule is adequate');
  if(!f.candidatesAdmissible||!sameSet(f.alternatives,['MON_LOWER','WED_LOWER'])||!f.counterevidenceConsidered||!f.relevantContextUnchanged)return ask('Both options must first be admissible with context and counterevidence assessed','ADMISSIBLE_COMPARABLE_OPTIONS');
  const es=f.episodes;
  if(es.length!==4||new Set(es.map(e=>e.factId)).size!==4||new Set(es.map(e=>e.observedAt)).size!==4||es.some(e=>e.athleteId!==i.athleteFixtureId||!validTime(e.observedAt,i.evaluatedAt)||e.coverage!=='COMPLETE'||!e.comparable)||es.filter(e=>e.placement==='MON_LOWER'&&e.response==='DEGRADED').length!==2||es.filter(e=>e.placement==='WED_LOWER'&&e.response==='COMPATIBLE').length!==2)return ask('This finite reviewed paired observational witness is not established; one noisy event never creates a rule','REVIEWED_COMPARABLE_PAIRED_HISTORY');
  if(target?.day!=='MON'||target.recipeId!=='R2-LOWER-CALF')return unsupported('The reviewed ranking witness compares this Monday lower option with the already admissible Wednesday alternative','LEARNED_OPTION_BINDING');
  return propose('Comparable paired observations favor the already admissible Wednesday lower option for the next horizon; observational ranking is not causation',plan.sessions.map(s=>s===target?projectedSession(s.session_id,'WED',s.recipeId,s.parameters,s.optional):clone(s)),'MOVE',3,[{action:'POPULATION_PRIOR_MON_LOWER',disposition:'RANKED_SECOND',reason:'The group-level key-session protection prior remains visible; explicit individual compatible observations alter only the admissible option ranking'}],{learning:{causalClaim:false,populationPriorVisible:true,changedRanking:['WED_LOWER','MON_LOWER'],scope:'EXACT_COMPARABLE_OBSERVATIONAL_CONTEXT',minimumCountLaw:false}});
 }
 default:return unsupported('No executable request program','R2_REQUEST');
 }
 }catch(error){return ask('Concrete parameter binding failed; no load, pace or dose is inferred',error.message);}
}
