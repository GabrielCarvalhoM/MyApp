import rawBundle from '../fixtures/authority-bundle.json' with { type: 'json' };
import { clone, freeze, hash } from './value.mjs';
import { routeBoundary } from './semantics.mjs';
import { evaluateR2 } from './r2-runtime.mjs';
import Ajv2020 from 'ajv/dist/2020.js';
import inputSchema from '../SHADOW_INPUT_SCHEMA.json' with {type:'json'};
const validateInput=new Ajv2020({strict:false,allErrors:true}).compile(inputSchema);

const bundle=freeze(clone(rawBundle));
const levels={KEEP:'AUTO_EXECUTE_ALLOWED',MODIFY:'SUGGEST_AND_CONFIRM',ASK:'ASK_BEFORE_DECISION',HOLD:'ABSTAIN_OR_HOLD',ABSTAIN:'ABSTAIN_OR_HOLD',NOT_SUPPORTED_YET:'ABSTAIN_OR_HOLD',CLINICAL_HUMAN_REQUIRED:'CLINICAL_HUMAN_REQUIRED'};
const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];
const mustNot=['MUTATE_OFFICIAL_PLAN','APPLY_OR_EXPORT_PROPOSAL','REWRITE_COMPLETED_WORK','INFER_MISSING_AS_ZERO_OR_NORMAL','INVENT_DOSE_OR_THRESHOLD','TREAT_SYNTHETIC_RESULTS_AS_EFFICACY','TREAT_BRANCH_AS_EQUIVALENT_ORIGINAL_DOSE'];
const factsFor=i=>({event:i.event,observation:i.observation,branch:i.preacceptedBranch??null,history:i.athleteResponseHistory??null,planContext:i.planContext??null});

// This comparator orders only already admissible options. It contains no sport dose model.
export function arbitrate({adequacy,necessity,priority,candidates=[]}) {
  if(adequacy==='ADEQUATE') return {action:'KEEP',reason:'Current adequacy precedes priority and theoretical improvement'};
  if(necessity!=='REQUIRED') return {action:'HOLD',reason:'Supported necessity is unresolved'};
  const valid=candidates.filter(c=>c.admissible===true);
  if(!valid.length) return {action:'HOLD',reason:'No supported candidate'};
  if(valid.length===1) return {action:'PROPOSE',candidateId:valid[0].id};
  const goal=priority==='RUN_FIRST'?'RUN':priority==='STRENGTH_FIRST'?'STRENGTH':null;
  const preferred=goal?valid.filter(c=>c.preservesGoals.includes(goal)):[];
  if(preferred.length===1) return {action:'PROPOSE',candidateId:preferred[0].id};
  return {action:'ASK',reason:'Material Pareto trade-off requires explicit choice'};
}

function decision(i,type,reason,extra={}) {
  return {decisionType:type,actionClass:type==='MODIFY'?'REPLAN':type,autonomyLevel:levels[type],
    preserve:[{scope:'OFFICIAL_PLAN',id:i.officialPlanState?.plan_id??null,revision:i.officialPlanState?.plan_revision??null},{scope:'COMPLETED_AND_OBSERVED_HISTORY',inputHash:hash(i.observedExecutionState??null)}],
    modify:[],mec:{changeLevel:0,framework:'AEC-1.3/AEOS-1.2-r2; existing conceptual degree, not a new enum'},
    rationale:reason,jev:{mode:'SHADOW',authority:'NONE',method:'DETERMINISTIC_REVIEWED_RULE'},
    evidenceRefs:[],policyRefs:[],confidence:{level:'NOT_ASSESSED',basis:'No probability of safety/efficacy inferred'},missingInputs:[],
    mustNot:[...mustNot],nextCheck:{owner:'BOUNDED_RUNTIME_OWNER',trigger:'Relevant input, context, policy or authority changes',exit:'Re-evaluate exact covered context'},
    unsupportedDependency:null,candidateActionsConsidered:[{action:'KEEP',disposition:type==='KEEP'?'CHOSEN':'NOT_ESTABLISHED',reason}],rejectedAlternatives:[],...extra};
}

function bind(d,profile) {
  const reviews=profile.reviewIds.map(id=>bundle.records.find(r=>r.review_id===id)).filter(Boolean);
  d.policyRefs=profile.policyIds.map(id=>{const p=bundle.bindings.find(p=>p.policyId===id);return {id,version:p.version,hash:p.policyHash};});
  d.evidenceRefs=reviews.map(r=>({reviewId:r.review_id,version:r.review_revision,hash:hash(r),target:r.target,evidenceStatus:r.evidence_status,disposition:r.disposition,claimRefs:r.claims.map(c=>c.claim_id??c.id)}));
  d.confidence={level:'MODERATE',basis:'Exact reviewed synthetic context; reversible design choice, no predicted response or safety probability'};
  d.profileId=profile.id;
  d.mustNot=[...new Set([...d.mustNot,...reviews.flatMap(r=>r.decision.must_not)])];
  return d;
}

function authorityFailure(i,profile) {
  for(const id of profile.reviewIds) {
    const r=bundle.records.find(r=>r.review_id===id);
    if(!r||r.disposition!=='APPROVE_WITH_CONDITIONS'||i.policyContext.revokedReviewIds.includes(id)) return 'Missing, limited or revoked review '+id;
  }
  return null;
}

function runProgram(i,p) {
  let d;
  const keep=reason=>decision(i,'KEEP',reason);
  const ask=(reason,missing)=>decision(i,'ASK',reason,{missingInputs:missing});
  const hold=(reason,gap)=>decision(i,'HOLD',reason,{unsupportedDependency:gap});
  const propose=(reason,degree,actionClass='REPLAN')=>decision(i,'MODIFY',reason,{actionClass,modify:clone(p.candidateResource.changeSet??[]),candidate:clone(p.candidateResource),mec:{changeLevel:degree,framework:'AEC-1.3/AEOS-1.2-r2'},candidateActionsConsidered:[{action:'KEEP_CURRENT_WEEK',disposition:'PRESERVED',reason:'Only reviewed future horizon may change'},{action:actionClass,disposition:'PROPOSE_ONLY',reason}],rejectedAlternatives:[{action:'ESCALATE_MULTIPLE_DOSE_DIMENSIONS',reason:'No supporting exact combined prescription'}],nextCheck:{owner:'TRAINING_POLICY_OWNER',trigger:'First proposed-dose exposure or changed context',exit:'Verify actual technique/effort/function and joint horizon before any further change'}});
  switch(p.program) {
    case 'keep': d=keep('Exact reviewed familiar plan remains adequate under supplied compatible response; no necessity for change');break;
    case 'optionalMiss':
      if(i.event.optional!==true||!i.officialPlanState.sessions.some(s=>s.session_id===i.event.session_id&&s.optional)) return hold('Omission is not the reviewed optional session','OPTIONAL_SESSION_BINDING');
      d=keep('Confirmed optional omission preserves essential plan; no compensation, catch-up debt or extra work');break;
    case 'overTargetKeep':d=keep('Actual above-target work is retained once; adequate remainder and no automatic progression or compensation');break;
    case 'runProgress':
      if(i.event.exposures&&i.event.exposures.some(e=>e.duration_minutes!==30)) return hold('Reviewed easy-dose history does not match','ACF-G02');
      d=propose('Exact reviewed easy30 to35 next-horizon duration option; current adequate week stays unchanged',1);break;
    case 'strengthProgress':d=propose('Exact reviewed next-horizon squat60 to62.5kg; sets/reps/rest unchanged; future RIR is unknown',1);break;
    case 'strengthRegression':d=propose('Repeated reconciled task-specific mismatch supports only the reviewed next-horizon squat60 to57.5kg candidate; no repeated automatic decrements',2);break;
    case 'jointHold':d=hold('Moving lower lacks supported joint adequacy for the next long run; hours elapsed cannot supply it','ACF-G02_JOINT_MOVE_LONG');break;
    case 'fatigueAsk':d=ask('Current function and possible concern change the choice; no wearable-driven deload',['CURRENT_FUNCTION','CURRENT_CONCERN_CONTEXT']);break;
    case 'sourceAsk':d=ask('Recording ended while the athlete reports all intervals; retain both facts and reconcile before physiological interpretation',['CONFIRMED_ACTUAL_THIRD_INTERVAL']);d.actionClass='RECONCILE';break;
    case 'taperHold':d=hold('Endurance framework does not authorize the exact combined hybrid race-week dose','ACF-G04');d.candidateMecScope=5;break;
    case 'returnAsk':d=ask('Nonclinical pause does not establish current capacity or approve historical dose restoration',['CURRENT_FUNCTION','CURRENT_ELIGIBILITY','REVIEWED_RETURN_RECIPE']);break;
    case 'strengthChoice':d=ask('Goblet support is not equivalent to heavy squat development; choose feasible window or explicit supported intent trade-off',['SCHEDULE_OR_GOAL_TRADEOFF']);break;
    case 'runChoice':d=ask('The40min cruise structure cannot fit30min by silently compressing warmup/recovery',['FEASIBLE_WINDOW_OR_ACCEPTED_STIMULUS_LOSS']);break;
    case 'paretoAsk':d=ask('Balanced key-stimulus losses are incomparable; no hidden run-first tie-break',['EXPLICIT_KEY_STIMULUS_TRADEOFF']);break;
    case 'cruiseBranch':
    case 'calfBranch':
      if(!i.preacceptedBranch||hash(i.preacceptedBranch)!==hash(p.facts.branch)) return hold('Exact accepted branch and guards are absent or changed','EXACT_PREACCEPTED_BRANCH');
      d=keep('User invokes the exact preaccepted withdrawal; original target, chosen branch and actual exposure remain distinct');
      d.executionInterpretation=clone(p.branchResult);d.rejectedAlternatives=[{action:'MAKE_UP_OR_REPLACE_OMITTED_WORK',reason:'No authority or necessity'}];break;
    case 'learnedMove':
      if(i.policyContext.longitudinalPurposeAllowed!==true) return hold('Longitudinal purpose is not permitted','PURPOSE_GUARD');
      if(!i.athleteResponseHistory?.sufficiency||!Object.values(i.athleteResponseHistory.sufficiency).every(v=>v===true)) return hold('Pattern sufficiency lacks an exact reviewed predicate','ARM_SUFFICIENCY');
      d=propose('Exact observational history ranks an already supported next-horizon schedule; no causal12/36h rule',3,'MOVE');
      d.inferredResponse={patternId:i.athleteResponseHistory.pattern_id,status:'SUPPORTED_FOR_BOUNDED_USE',causal:false,observationRefs:i.athleteResponseHistory.observations.map(o=>o.id),effect:'COMPARE_ALREADY_ADMISSIBLE_OPTIONS_ONLY'};break;
    case 'familiarNovice':
      d=decision(i,'MODIFY','Only supplied recently exposed modality-specific novice weeks; never-exposed establishment is unsupported',{actionClass:'REPLAN',candidate:clone(p.candidateResource),modify:[{scope:'INITIAL_FAMILIAR_NOVICE_CANDIDATES',planRefs:p.candidateResource.plans.map(p=>p.plan_id??p.athlete_id)}]});break;
    default:return hold('Unimplemented rule program','UNSUPPORTED_POLICY_PROGRAM');
  }
  return bind(d,p);
}

function dailyDecision(i) {
  if(i.preacceptedBranch!=null||i.athleteResponseHistory!=null||i.planContext!=null)return decision(i,'NOT_SUPPORTED_YET','Daily no-op does not cover an attached branch, response pattern or prospective context',{unsupportedDependency:'REVIEWED_DAILY_CONTEXT'});
  if(i.policyContext.requestedPolicyIds?.some(id=>!['POL-04','POL-15','POL-18'].includes(id)))return decision(i,'NOT_SUPPORTED_YET','Requested policy has no binding to daily no-op',{unsupportedDependency:'POLICY_CONTEXT_BINDING'});
  if(i.observedExecutionState.events.length||i.observedExecutionState.inferred.length)return decision(i,'HOLD','Additional daily events/inferences require reconciliation and their own reviewed context',{unsupportedDependency:'RECONCILED_DAILY_STATE'});
  const plan=bundle.plans.find(p=>hash(p)===hash(i.officialPlanState));
  const athlete=bundle.athletes.find(a=>hash(a)===hash(i.athleteState));
  if(!plan||!athlete||plan.athlete_id!==athlete.athlete_id||!days.includes(i.event.day)||hash(i.observation)!==hash({type:'EXPLICIT_COMPATIBLE_CONTEXT',response:athlete.history.response})||Object.keys(i.event).some(k=>!['event_id','type','day'].includes(k))) return decision(i,'NOT_SUPPORTED_YET','Daily context is outside the reviewed familiar week',{unsupportedDependency:'REVIEWED_DAILY_CONTEXT'});
  const seen=new Set(),factIds=new Set();
  for(const actual of i.observedExecutionState.completed) {
    if(actual?.sourceConflict===true||actual?.source_conflict===true)return decision(i,'ASK','Actual source conflict blocks dependent adequacy',{missingInputs:['CONFIRMED_SOURCE_FACTS']});
    const session=plan.sessions.find(s=>s.session_id===actual.sessionId);
    if(!session||seen.has(actual.sessionId)||actual.athleteId!==i.athleteFixtureId||actual.executedRevision!==session.session_revision||!actual.factId||factIds.has(actual.factId)||actual.coverage!=='COMPLETE'||!actual.sourceRevision||!actual.sourceRef||!Number.isFinite(Date.parse(actual.observedAt))||Date.parse(actual.observedAt)>Date.parse(i.evaluatedAt)||days.indexOf(session.day)>days.indexOf(i.event.day)) return decision(i,'ASK','Completed identity/lineage/coverage is missing or conflicting',{missingInputs:['RECONCILED_COMPLETED_LINEAGE']});
    if(Object.keys(actual).some(k=>!['sessionId','athleteId','executedRevision','actualPrescription','status','factId','sourceRevision','sourceRef','coverage','observedAt','sourceConflict','source_conflict'].includes(k)))return decision(i,'HOLD','Unrecognized actual metadata requires explicit interpretation',{unsupportedDependency:'ACTUAL_INPUT_CONTRACT'});
    factIds.add(actual.factId);
    seen.add(actual.sessionId);
    if(actual.status==='OPTIONAL_OMITTED_CONFIRMED'&&session.optional===true) continue;
    if(actual.status!=='COMPLETED_AS_CHOSEN'||hash(actual.actualPrescription)!==hash(session.prescription)) return decision(i,'HOLD','Daily actual differs from reviewed compatible execution; preserve observed facts and reassess',{unsupportedDependency:'ACTUAL_RESPONSE_REVIEW'});
  }
  if(plan.sessions.some(s=>days.indexOf(s.day)<=days.indexOf(i.event.day)&&!seen.has(s.session_id))) return decision(i,'ASK','No record does not establish completion or a missed session',{missingInputs:['ACTUAL_EXECUTION_OR_CONFIRMED_OMISSION']});
  const reviewIds=['SSCTR-ACF-E-WEEKS','SSCTR-ACF-ABC',...bundle.records.filter(r=>r.target.rule_ids.some(id=>plan.sessions.some(s=>s.recipe_ref===id))&&r.disposition==='APPROVE_WITH_CONDITIONS').map(r=>r.review_id)];
  const profile={id:'DAILY-'+plan.plan_id,policyIds:['POL-04','POL-15','POL-18'],reviewIds:[...new Set([...reviewIds,'SSCTR-ACF-P04','SSCTR-ACF-P15','SSCTR-ACF-P18'])]};
  const failure=authorityFailure(i,profile);
  if(failure) return decision(i,'HOLD',failure,{unsupportedDependency:'CURRENT_AUTHORITY'});
  return bind(decision(i,'KEEP','All known actual work and explicit compatible context fit the exact reviewed familiar week; retain plan without replanning'),profile);
}

function goldenDecision(i) {
  if(hash(i.observation)!==hash({type:'SDC_EXPLICIT_FACTS'})||i.preacceptedBranch!=null||i.athleteResponseHistory!=null||i.planContext!=null||Object.keys(i.event).some(k=>!['event_id','type','facts'].includes(k)))return decision(i,'NOT_SUPPORTED_YET','Golden observations or ancillary context exceed exact reviewed scope',{unsupportedDependency:'SDC_EXACT_SUCCESSOR_ENVELOPE'});
  const p=bundle.sdcProfiles.find(p=>p.factsHash===hash(i.event.facts));
  if(!p||hash(i.athleteState)!==hash({athlete_id:'A-SDC',facts:p.facts})||hash(i.officialPlanState)!==hash({plan_id:'SDC-WEEK',plan_revision:'SDC-SCI-r1',athlete_id:'A-SDC',sessions:p.facts.week,recipeCatalog:bundle.sdcCatalog.recipes})||hash(i.observedExecutionState)!==hash({events:[i.event],completed:[],inferred:[]})) return decision(i,'NOT_SUPPORTED_YET','Golden successor facts or lineage do not match exact independent scope',{unsupportedDependency:'SDC_EXACT_SUCCESSOR'});
  const r=p.record;
  if(i.policyContext.requestedPolicyIds?.some(id=>id!==(p.program==='criticality'?'P-CRITICALITY':'P-REMAINDER')))return decision(i,'NOT_SUPPORTED_YET','Requested policy has no binding to this Golden successor',{unsupportedDependency:'POLICY_CONTEXT_BINDING'});
  if(r.disposition!=='APPROVE_WITH_CONDITIONS'||i.policyContext.revokedReviewIds.includes(r.decision_id)) return decision(i,'HOLD','Golden successor authority is absent/revoked',{unsupportedDependency:'SDC_CURRENT_AUTHORITY'});
  let d;
  if(p.program==='criticality') {
    if(!p.facts.new_material_fact)d=decision(i,'KEEP','Criticality alone supplies no necessity; preserve the adequate week');
    else if(p.facts.criticality_goal_linkage.value==='HIGH')d=decision(i,'MODIFY','Exact37min cruise no longer fits29min; full accepted intent requires the reviewed move, with Thursday recheck',{actionClass:'MOVE',modify:[{sessionId:'run-tue',from:'2026-10-27T07:00:00-03:00',to:'2026-10-28T07:00:00-03:00',recipeId:'R-Q18',doseChanged:false}],mec:{changeLevel:3,framework:'AEC/AEOS reviewed S13-T'}});
    else d=decision(i,'MODIFY','Exact supplemental intent admits reviewed reduced cruise with explicit loss of6min work; no equivalence',{actionClass:'REDUCE_VOLUME',modify:[{sessionId:'run-tue',fromRecipe:'R-Q18',toRecipe:'R-Q12',candidate:clone(bundle.sdcCatalog.recipes.find(r=>r.recipe_id==='R-Q12'))}],mec:{changeLevel:2,framework:'AEC/AEOS reviewed S14-T'}});
  } else if(p.facts.execution.new_fact.material_after_start!==true)d=decision(i,'KEEP','Starting made the pending prestart proposal stale; old rationale cannot mutate the remainder');
  else d=decision(i,'MODIFY','New material rack unavailability after start supports exact prospective omission of unperformed sq-3; prefix preserved',{actionClass:'REDUCE_VOLUME',modify:[{scope:'UNPERFORMED_SUFFIX_ONLY',omit:['sq-3'],preserveRemaining:['rdl-1','rdl-2','split-L1','split-R1','split-L2','split-R2'],baseRecipe:clone(bundle.sdcCatalog.recipes.find(r=>r.recipe_id==='S-L60'))}],mec:{changeLevel:2,framework:'AEC/AEOS reviewed S29-R2'},completedPrefix:clone(p.facts.execution.completed_prefix)});
  d.profileId=p.id;d.policyRefs=[{id:p.program==='criticality'?'P-CRITICALITY':'P-REMAINDER',version:bundle.sdcCatalog.document_version,hash:hash(bundle.sdcCatalog.policies.find(x=>x.policy_id===(p.program==='criticality'?'P-CRITICALITY':'P-REMAINDER')))}];
  d.evidenceRefs=[{reviewId:r.decision_id,hash:p.recordHash,target:r.target,evidenceStatus:r.evidence_status,disposition:r.disposition}];
  d.confidence={level:'MODERATE',basis:'Exact independently reviewed SDC successor only; not the historical original or a generalized dosing rule'};
  d.candidateActionsConsidered=[{action:'KEEP',disposition:d.decisionType==='KEEP'?'CHOSEN':'INSUFFICIENT',reason:d.rationale},{action:d.actionClass,disposition:d.decisionType==='MODIFY'?'PROPOSE_ONLY':'NOT_REQUIRED',reason:'No effects in shadow'}];
  if(d.decisionType==='MODIFY')d.rejectedAlternatives=[{action:'AUTOMATIC_APPLY',reason:'Current exact confirmation is required for any future effect; shadow always preserves official state'}];
  if(d.decisionType==='MODIFY'){
    const sessions=clone(i.officialPlanState.sessions);
    if(p.program==='criticality'){
      const session=sessions.find(s=>s.session_id==='run-tue');
      if(p.facts.criticality_goal_linkage.value==='HIGH')session.time=d.modify[0].to;
      else {session.recipe_id='R-Q12';session.duration_min=bundle.sdcCatalog.recipes.find(r=>r.recipe_id==='R-Q12').dose.total_min;}
    }
    const recipeIds=p.program==='criticality'?[p.facts.criticality_goal_linkage.value==='HIGH'?'R-Q18':'R-Q12']:['S-L60','S-L2'];
    d.candidate={basePlanId:i.officialPlanState.plan_id,basePlanRevision:i.officialPlanState.plan_revision,basePlanHash:hash(i.officialPlanState),athleteId:i.athleteFixtureId,scope:p.program==='criticality'?'REMAINING_HORIZON':'UNPERFORMED_SUFFIX_ONLY',sessions,recipes:clone(bundle.sdcCatalog.recipes.filter(r=>recipeIds.includes(r.recipe_id))),changeSet:clone(d.modify),confirmation:'REQUIRED_FOR_ANY_FUTURE_EFFECT'};
    if(p.program==='executingRemainder'){
      delete d.candidate.sessions;
      d.candidate.originalSessions=sessions;
      d.candidate.selectedRemainder={baseRecipeId:'S-L60',selectedBranchRecipeId:'S-L2',omitSetIds:['sq-3'],completedPrefix:clone(p.facts.execution.completed_prefix),exercises:clone(bundle.sdcCatalog.recipes.find(r=>r.recipe_id==='S-L60').dose.exercises.filter(e=>e.id!=='back_squat_high_bar')),noAddedWork:true};
    }
    d.candidateHash=hash(d.candidate);
  }
  return d;
}

function evaluate(i) {
  if(i.synthetic!==true||i.purpose!=='SYNTHETIC_SHADOW') return decision(i,'ABSTAIN','Only explicit offline synthetic shadow evaluations are supported',{unsupportedDependency:'REAL_USE_NOT_AUTHORIZED'});
  if(i.recoveryContext?.clinicalConcern===true||i.athleteState?.clinical_profile===true||i.recoveryContext?.eligibilityStatus==='CLINICAL_CONCERN') return decision(i,'CLINICAL_HUMAN_REQUIRED','Clinical dependency prevents dependent system prescription',{unsupportedDependency:'QUALIFIED_CLINICAL_HUMAN',nextCheck:{owner:'QUALIFIED_CLINICAL_HUMAN',trigger:'Human assessment and applicable restrictions',exit:'Reassess sporting scope; runtime cannot clear clinical dependency'}});
  const boundary=routeBoundary(i.recoveryContext);
  if(boundary?.decisionType==='CLINICAL_HUMAN_REQUIRED')return decision(i,boundary.decisionType,'Supplied clinical dependency requires a qualified human',{missingInputs:boundary.missingInputs,unsupportedDependency:boundary.unsupportedDependency});
  if(!validateInput(i)){
    const errors=clone(validateInput.errors);
    return decision(i,errors.some(e=>e.instancePath.startsWith('/policyContext/requestedPolicyIds'))?'HOLD':'ASK','Input contract validation failed; no missing metadata is completed by assumption',{missingInputs:errors.map(e=>(e.instancePath||'/')+(e.params.missingProperty?'/'+e.params.missingProperty:'')),unsupportedDependency:'TYPED_INPUT_CONTRACT',validationErrors:errors});
  }
  if(i.recoveryContext?.eligibilityStatus!=='NONCLINICAL_CONFIRMED') return decision(i,'ASK','Eligibility is unassessed; no clearance or illness inferred',{missingInputs:['CURRENT_ELIGIBILITY']});
  if(boundary&&i.event?.type!=='SYNTHETIC_PAUSE')return decision(i,boundary.decisionType,'Current continuity boundary prevents reuse of a familiar-dose profile',{missingInputs:boundary.missingInputs,unsupportedDependency:boundary.unsupportedDependency});
  const recoveryKeys=['eligibilityStatus','clinicalConcern','interrupted','interruptionReason','actualExposureKnown','reentryRecipe','sourceRef','contextChanged','clinicalFlags','clinicalDependency','persistentPain','injury','illness','pathology','functionalLimitation','clearanceRequired','rehabilitation','eligibilityCurrent','relevantContextChanged'];
  if(Object.keys(i.recoveryContext).some(k=>!recoveryKeys.includes(k)))return decision(i,'HOLD','Unrecognized recovery metadata cannot be silently ignored',{unsupportedDependency:'RECOVERY_INPUT_CONTRACT'});
  if(['clinicalConcern','interrupted','actualExposureKnown','contextChanged','clinicalDependency','persistentPain','injury','illness','pathology','functionalLimitation','clearanceRequired','rehabilitation','eligibilityCurrent','relevantContextChanged'].some(k=>i.recoveryContext[k]!==undefined&&typeof i.recoveryContext[k]!=='boolean'))return decision(i,'ASK','Recovery guard values require explicit known boolean facts',{missingInputs:['TYPED_RECOVERY_GUARDS']});
  const missing=['inputVersion','evaluatedAt','athleteFixtureId','athleteState','event','observation','observedExecutionState','provenance','policyContext'].filter(k=>i[k]===undefined||i[k]===null);
  if(missing.length) return decision(i,'ASK','Required metadata is missing',{missingInputs:missing});
  if(i.inputVersion!=='BSR-INPUT-1'||!Number.isFinite(Date.parse(i.evaluatedAt))) return decision(i,'HOLD','Unsupported input version or timestamp',{unsupportedDependency:'INPUT_CONTRACT'});
  if(typeof i.event.event_id!=='string'||!i.event.event_id||typeof i.event.type!=='string'||!i.event.type)return decision(i,'ASK','Event identity and type are required for auditable evaluation',{missingInputs:['EVENT_ID_AND_TYPE']});
  if(!i.provenance.sourceRef||!i.provenance.sourceRevision||i.provenance.coverage!=='EXPLICIT_FIXTURE_FACTS'||!i.provenance.association||!Array.isArray(i.observedExecutionState.completed)||!Array.isArray(i.observedExecutionState.events)||!Array.isArray(i.observedExecutionState.inferred)) return decision(i,'ASK','Provenance/actual state cannot be silently completed',{missingInputs:['SOURCE_REVISION_COVERAGE_ASSOCIATION_AND_EXPLICIT_STATES']});
  if(i.provenance.dataClass!=='SYNTHETIC'||i.athleteFixtureId!==i.athleteState.athlete_id) return decision(i,'ABSTAIN','Identity or data class mismatch',{unsupportedDependency:'IDENTITY_PURPOSE'});
  if(i.event.source_conflict===true||i.provenance.association!=='CONFIRMED') return decision(i,'ASK','Source conflict or uncertain association requires reconciliation',{actionClass:'RECONCILE',missingInputs:['CONFIRMED_SOURCE_FACTS'],policyRefs:[{id:'G03',version:'SDC-G03-r1',hash:bundle.sourceManifest['reviews/sports-domain-closure/2026-10-23/semantics/G03_REVIEW.json']}],evidenceRefs:[{reviewId:'SDC-G03-NORMATIVE',source:'reviews/sports-domain-closure/2026-10-23/DECISION_REGISTRY.json'}]});
  if(i.policyContext.registryVersion!==bundle.registryVersion||i.policyContext.registryHash!==bundle.registryHash||!Array.isArray(i.policyContext.revokedReviewIds)||!Array.isArray(i.policyContext.holds)) return decision(i,'HOLD','Registry version/hash or guard state is missing/stale',{unsupportedDependency:'CURRENT_POLICY_REGISTRY'});
  if(i.policyContext.holds.length||i.recoveryContext.contextChanged!==false) return decision(i,'HOLD','Current hold or changed/unknown context suspends dependent use',{unsupportedDependency:'CURRENT_CONTEXT_GUARDS'});
  if(i.policyContext.requestedPolicyIds!==undefined&&(!Array.isArray(i.policyContext.requestedPolicyIds)||i.policyContext.requestedPolicyIds.some(id=>typeof id!=='string')))return decision(i,'HOLD','Requested policy metadata is malformed',{unsupportedDependency:'POLICY_CONTEXT_CONTRACT'});
  if(i.policyContext.requestedPolicyIds?.some(id=>!bundle.bindings.some(p=>p.policyId===id)&&!bundle.sdcCatalog.policies.some(p=>p.policy_id===id))) return decision(i,'NOT_SUPPORTED_YET','Requested policy is not executable',{unsupportedDependency:'UNSUPPORTED_POLICY'});
  if(!i.officialPlanState) return decision(i,'NOT_SUPPORTED_YET','No-history first establishment has no reviewed executable recipe',{unsupportedDependency:'ACF-G01'});
  if(i.officialPlanState.athlete_id!==i.athleteState.athlete_id) return decision(i,'ABSTAIN','Plan belongs to a different athlete',{unsupportedDependency:'PLAN_IDENTITY'});
  if(i.event.type==='SDC_REVIEWED_EVENT')return goldenDecision(i);
  if(i.event.type==='DAY_RECORDED') return dailyDecision(i);
  const profile=bundle.profiles.find(p=>p.athleteHash===hash(i.athleteState)&&p.planHash===hash(i.officialPlanState)&&p.factsHash===hash(factsFor(i)));
  if(!profile) return decision(i,'NOT_SUPPORTED_YET','Facts, dose, history, branch or context fall outside the exact reviewed executable subset',{unsupportedDependency:'EXACT_REVIEWED_CONTEXT_OR_RECIPE'});
  if(i.policyContext.requestedPolicyIds?.some(id=>!profile.policyIds.includes(id)))return decision(i,'NOT_SUPPORTED_YET','Requested policy has no binding to this reviewed context',{unsupportedDependency:'POLICY_CONTEXT_BINDING'});
  if(hash(i.observedExecutionState.events)!==hash([i.event])||i.observedExecutionState.completed.length||i.observedExecutionState.inferred.length) return decision(i,'HOLD','Extra actual/inferred facts are not covered by this atomic profile; no silent discard',{unsupportedDependency:'RECONCILED_PROFILE_STATE'});
  const failure=authorityFailure(i,profile);
  if(failure) return bind(decision(i,'HOLD',failure,{unsupportedDependency:'CURRENT_AUTHORITY'}),profile);
  return runProgram(i,profile);
}

export function evaluateShadow(input) {
  const i=clone(input&&typeof input==='object'&&!Array.isArray(input)?input:{}),d=i.inputVersion==='BSR-INPUT-R2'?evaluateR2(i,decision):evaluate(i),inputHash=hash(i);
  const stringOrNull=value=>typeof value==='string'?value:null;
  Object.assign(d,{id:'decision-'+inputHash,traceId:'trace-'+inputHash,inputVersion:typeof i.inputVersion==='string'?i.inputVersion:'UNKNOWN',inputHash,timestamp:stringOrNull(i.evaluatedAt),athleteFixtureId:stringOrNull(i.athleteFixtureId),planId:stringOrNull(i.officialPlanState?.plan_id),observationEventId:stringOrNull(i.event?.event_id),policyVersion:d.policyVersion??bundle.registryVersion,policyHash:d.policyHash??bundle.registryHash,sourceFacts:{provenance:clone(i.provenance??null),event:clone(i.event??null),observation:clone(i.observation??null),completed:clone(i.observedExecutionState?.completed??[]),inferred:clone(i.observedExecutionState?.inferred??[]),responseHistory:clone(i.athleteResponseHistory??null),rawInputMetadata:{inputVersion:clone(i.inputVersion??null),evaluatedAt:clone(i.evaluatedAt??null),athleteFixtureId:clone(i.athleteFixtureId??null)}},applied:false,effect:'SHADOW_ONLY'});
  Object.assign(d.sourceFacts,{recoveryContext:clone(i.recoveryContext??null),policyContext:clone(i.policyContext??null),preacceptedBranch:clone(i.preacceptedBranch??null),planContext:clone(i.planContext??null)});
  if(i.inputVersion==='BSR-INPUT-R2')Object.assign(d.sourceFacts,{athleteState:clone(i.athleteState??null),adjudicatedPremiseNotice:'Necessity, sufficiency, current calibration and tolerance are explicit synthetic reviewed-context premises, not inferred autonomous intelligence'});
  return freeze({mode:'SHADOW',officialPlanState:clone(i.officialPlanState??null),observedExecutionState:clone(i.observedExecutionState??null),shadowDecision:d,appliedState:clone(i.officialPlanState??null)});
}

export class ShadowJournal {
  #traces=new Map();
  record(input) {const result=evaluateShadow(input),id=result.shadowDecision.traceId;if(this.#traces.has(id))return {duplicate:true,result:this.#traces.get(id)};this.#traces.set(id,result);return {duplicate:false,result};}
  get size(){return this.#traces.size;}
  entries(){return [...this.#traces.values()];}
}
