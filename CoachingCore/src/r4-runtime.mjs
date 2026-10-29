import {clone,freeze,hash} from './value.mjs';
import {fact,factCell,validateCanonical} from './r3-input.mjs';
import {evaluateCanonicalShadow,COVERAGE_CLASSES} from './r3-runtime.mjs';
import {loadR4Authority,approvedEnvelope} from './r4-authority.mjs';
import {generateCoachingCandidates,envelopeFor,rankCandidates} from './r4-candidates.mjs';
import {usableModel} from './r4-athlete-model.mjs';
import {enforcePracticalConstraints,favorable} from './r4-context.mjs';

const coverage=COVERAGE_CLASSES;
const goalContext=s=>{const supplied=s.goal??s.onboarding?.goals??s.observations?.athleteGoal??s.event?.goal??null;return {stated:supplied,primary:supplied&&typeof supplied==='object'&&!Array.isArray(supplied)?supplied.primary??supplied.main??null:supplied,secondary:s.secondaryGoal??(supplied&&typeof supplied==='object'?supplied.secondary:null)??null,priority:s.population?.priority??'UNKNOWN',requestIntent:s.currentDemand?.kind??'UNKNOWN',phase:s.phase??s.block??'UNKNOWN',unknownPhaseIsNotInferred:true};};
const modelProposal=(source,inputHash)=>({proposalOnly:true,applied:false,sourceHash:inputHash,populationPriorRetained:true,causalClaim:false,observations:source.observations?clone(source.observations):null,completedPrefix:source.completedPrefix?clone(source.completedPrefix):null,nextIngestionRequirement:'Record actual execution/effort/function/recovery with event id, context, observation time, comparability and purpose-specific consent. Predictions and selected recipes are not observations.'});
function reconcile(source,input){
 const allowed=['population','eligibility','currentDemand','onboarding','reportedExposure','observations','priorHistory','history','alternatives','completedPrefix','interruption','event','constraints','calibration','environment','wearable','learningConsent','availableAdmissibleDoseAlternatives','athletePreference','observationPlan','nextCheck','availability','equipment','goal','secondaryGoal','phase','block','evaluatedAt','localDate','timezone'];
 const extra=Object.keys(source).filter(k=>!allowed.includes(k));
 if(extra.length)return 'Additional unreviewed context requires reconciliation: '+extra.join(', ');
 const populationFields=['synthetic','realPerson','ageBand','ageYears','participation','priority','runExperience','strengthExperience','dataTier','historyOrigin'];
 const eligibilityFields=['status','source','clinicalConcern','pain','persistentPain','injury','illness','functionalLimitation','clearanceClaim'];
 const populationExtra=Object.keys(source.population??{}).filter(k=>!populationFields.includes(k)),eligibilityExtra=Object.keys(source.eligibility??{}).filter(k=>!eligibilityFields.includes(k));
 if(populationExtra.length||eligibilityExtra.length)return 'Additional population or eligibility context is outside the reviewed applicability contract; reconcile without inferring disease or clearance: '+[...populationExtra,...eligibilityExtra].join(', ');
 if(source.eligibility?.clearanceClaim===true)return 'A supplied clearance claim cannot itself establish current nonclinical eligibility or extend the reviewed population';
 if(input.adapter.warnings.some(w=>['EXPLICIT_STALE_OBSERVATION','DUPLICATED_EVENT_ID_PRESERVED'].includes(w.code)))return 'Stale or duplicate events cannot supply positive tolerance evidence';
 // Additional current signals cannot disappear behind familiar historical work.
 if(source.currentDemand.kind==='RUN_CALIBRATION'&&source.observations&&Object.keys(source.observations).some(k=>!['fatigueStatus','needForSeparateRecoveryIntent'].includes(k)))return 'Additional current run context requires assessment before familiar calibration reuse';
 if(source.interruption&&!['FIRST_RETURN_SESSION','FIRST_RETURN_STRENGTH','RETURN_WEEK','RETURN_NEXT_STEP'].includes(source.currentDemand.kind))return 'Interruption requires the re-establishment pathway rather than familiar historical reuse';
 return null;
}
function rejected(reason,dependency,type='HOLD',className=coverage[3]){
 return {decisionType:type,coverage:className,rationale:reason,missingInputs:[],policyRefs:[],evidenceRefs:[],envelopeRefs:[],candidate:null,unsupportedDependency:dependency,requestedScopeSatisfied:false};
}
function applyGoalAndPhase(p,context,source){
 if(!p?.candidates)return p;
 const current=p.candidates.find(x=>['KEEP_BASE','KEEP_CURRENT'].includes(x.id));
 if(!current)return p;
 const phase=JSON.stringify(context.phase),stated=JSON.stringify(context.primary??'');
 const taper=/taper|race.week|pre.event|competition/i.test(phase);
 const maintenance=/maintain strength|strength maintenance|maintenance|retain strength|recovery|recover/i.test(stated);
 const protectKey=source.constraints?.progressionConflictsWithKeyStimulus===true;
 if(!taper&&!maintenance&&!protectKey)return p;
 const reason=taper?'The known taper/event phase prioritizes freshness and stimulus continuity over a new overload':maintenance?'The stated maintenance/recovery objective does not call for more training stress':'The supplied horizon shows secondary progression would compromise a future essential priority stimulus';
 for(const x of p.candidates)if(/PROGRESSION/.test(x.id)){x.grades.goal='POOR';x.reason+='; '+reason;}
 current.grades.goal='PREFERRED';current.grades.recovery='PREFERRED';current.reason=reason+'; retain the current familiar prescription rather than chase progression';
 p.essentialStimulus=reason;p.tradeOff='Forego this progression opportunity to serve the current goal/phase and future priority stimulus';
 return p;
}
function r4MaterialExtension(source,base){
 const errors=base.shadowDecision.semanticConsumption?.materialContract?.errors??[];
 // R3 represented this flag as boolean. R4 also consumes a complete source-bound alternative.
 if(source.currentDemand?.kind==='EQUIPMENT_SUBSTITUTION'&&typeof source.history?.completeAlternativeRecipe==='object'&&source.history.completeAlternativeRecipe!==null&&errors.length>0&&errors.every(e=>e.path==='/history/completeAlternativeRecipe'&&e.keyword==='type'))return true;
 const run=source.reportedExposure?.run,obs=source.observations;
 return source.currentDemand?.kind==='FIRST_RETURN_SESSION'&&run?.family==='EASY'&&run.establishedToday===true&&typeof run.minutes==='number'&&run.minutes>0&&favorable(run.talk)&&favorable(run.response)&&favorable(obs?.ordinaryFunction)&&typeof obs?.currentCapacity==='string'&&errors.length>0&&errors.every(e=>['/observations/currentFunction','/observations/runningCapacity'].includes(e.path)&&e.keyword==='required');
}
/** Node reference only. This function never imports a corpus, expectation or case-id policy. */
export function evaluateCoachingShadow(input,options={}){
 const i=clone(input??{}),base=clone(evaluateCanonicalShadow(i)),s=fact(i,'')??{},validation=validateCanonical(i),reads=[];
 const read=path=>{const value=fact(i,path);reads.push({path,state:value===undefined?'ABSENT':value===null?'UNKNOWN':'SUPPLIED',value:clone(value??null)});return value;};
 const inputHash=hash(i),kind=read('/currentDemand/kind'),goal=goalContext(s);
 const loaded=options.registry===undefined||options.authority===undefined?loadR4Authority():{};
 const registry=options.registry===undefined?loaded.registry:options.registry,authority=options.authority===undefined?loaded.authority:options.authority;
 const envelopeId=envelopeFor(kind),approval=approvedEnvelope(envelopeId,registry,authority),model=usableModel(options.athleteModel);
 let d=clone(base.shadowDecision),ranking=null,reasoning=null;
 if(s.eligibility?.persistentPain===true)d=rejected('Explicit persistent pain requires qualified clinical assessment; no dependent dose is selected','QUALIFIED_CLINICAL_HUMAN','CLINICAL_HUMAN_REQUIRED',coverage[7]);
 // Existing canonical/clinical/material guards remain authoritative. R4 changes programming judgment.
 const extendedMaterial=r4MaterialExtension(s,base);
 const guarded=!validation.valid||i.synthetic!==true||i.purpose!=='SHADOW_REFERENCE'||i.adapter?.blocked||d.coverage===coverage[7]||d.coverage===coverage[6]&&!extendedMaterial||s.population?.ageBand!=='ADULT'||(s.population?.ageYears!==undefined&&s.population.ageYears<18)||s.eligibility?.status!=='NONCLINICAL_CONFIRMED'||i.adapter.conflicts.length;
 if(!guarded){
  const conflicts=reconcile(s,i);
  if(conflicts)d=rejected(conflicts,'CURRENT_CONTEXT_RECONCILIATION');
  else if(s.population?.participation!=='RECREATIONAL_HYBRID'||!['NOVICE','INTERMEDIATE'].includes(s.population.runExperience)||!['NOVICE','INTERMEDIATE'].includes(s.population.strengthExperience))d=rejected('Population is outside the reviewed adult recreational novice/intermediate envelopes','POPULATION_APPLICABILITY','NOT_SUPPORTED_YET',coverage[4]);
  else if(['clinicalConcern','pain','injury','illness','functionalLimitation'].some(k=>s.eligibility[k]!==false))d={...rejected('Explicit current clinical guard facts are required before a positive prescription','ELIGIBILITY_UNASSESSED','ASK',coverage[2]),missingInputs:['/eligibility/currentClinicalGuards']};
  else if(options.athleteModel!==undefined&&!model)d=rejected('Athlete model consent, comparable source provenance, version or hash is invalid; no hidden history is supplied','ATHLETE_MODEL_PROVENANCE');
  else {
   const c={population:read('/population'),demand:read('/currentDemand'),onboarding:read('/onboarding'),reportedExposure:read('/reportedExposure'),observations:read('/observations'),history:read('/history'),priorHistory:read('/priorHistory'),completedPrefix:read('/completedPrefix'),alternatives:read('/alternatives'),interruption:read('/interruption'),calibration:read('/calibration'),environment:read('/environment'),constraints:read('/constraints'),learningConsent:read('/learningConsent'),model,goal};
   const p=enforcePracticalConstraints(applyGoalAndPhase(generateCoachingCandidates(c,approval),goal,s),s);
   if(p?.missingInputs){
    const qualification=p.missingInputs.map(path=>({path,status:factCell(i,path).status}));
    const missingInputs=qualification.filter(x=>['ABSENT','UNKNOWN'].includes(x.status)).map(x=>x.path);
    d=missingInputs.length?{...rejected(p.reason,'SUBSTANTIVE_MISSING_INPUT','ASK',coverage[2]),missingInputs}:{...rejected('The requested facts are supplied and retained, but they do not yet establish an admissible complete coaching prescription. '+p.reason,'SUPPLIED_FACTS_REQUIRE_COACHING_BINDING','NOT_SUPPORTED_YET',coverage[4])};
    d.inputQualification={requested:qualification,suppliedButInsufficient:missingInputs.length===0,noKnownAdverseFactIsApproved:true};
   }
   else if(p?.keep)d={...rejected(p.reason,null,'KEEP',coverage[1]),nextCheck:{owner:'COACHING_INTELLIGENCE',trigger:p.nextObservation??'Comparable execution, symptoms or goal/context change',exit:'Reassess necessity before any change'},requestedScopeSatisfied:true};
   else if(p?.dependency)d={...rejected(p.reason,p.dependency,'NOT_SUPPORTED_YET',approval?coverage[4]:coverage[5]),...(p.advisoryRanking?{advisoryRanking:clone(p.advisoryRanking)}:{})};
   else if(p?.candidates){
    ranking=rankCandidates(p.candidates,p.criteria??['essential','goal','continuity','recovery','change']);
    if(!ranking.selected||ranking.selected.recipe===null)d=rejected('No admissible complete recipe remains after current context constraints','NO_ADMISSIBLE_CANDIDATE','NOT_SUPPORTED_YET',coverage[4]);
    else if(!approval)d=rejected('Reusable envelope lacks current independent scientific approval matching its exact hash','ENVELOPE_AUTHORITY_UNAVAILABLE','HOLD',coverage[5]);
    else {
     const selected=ranking.selected;
     reasoning={goal,phase:clone(goal.phase),intendedStimulus:p.essentialStimulus,candidates:ranking.candidates.map(x=>({id:x.id,admissible:x.admissible,why:x.reason,goalTradeOff:clone(x.grades),selected:x.id===selected.id})),selectedOption:selected.id,whyPreferred:selected.reason,preserved:p.preserved??'Essential training intent, all completed work, official plan and unselected dose dimensions',tradeOff:p.tradeOff??'The smallest supported change is chosen before additional dose or disruption',uncertainty:p.uncertainty??'This is the best-supported available option under stated facts, not guaranteed physiological efficacy or universal optimality. Goal/phase remain explicitly unknown where not supplied.',nextObservation:p.nextObservation??'Actual execution, effort, technique/function and same-day/next-day recovery; reassess on incompatible response, clinical signal, changed goal/availability or authority revision'};
     d={decisionType:'MODIFY',coverage:coverage[0],rationale:selected.reason,missingInputs:[],unsupportedDependency:null,requestedScopeSatisfied:true,candidate:{recipe:clone(selected.recipe),scope:s.currentDemand.kind,confirmation:'REQUIRED_FOR_ANY_FUTURE_EFFECT'},envelopeRefs:[{id:envelopeId,version:approval.envelope.revision,hash:hash(approval.envelope)}],policyRefs:[{id:envelopeId,version:approval.envelope.revision,hash:hash(approval.envelope)}],evidenceRefs:[{reviewId:approval.review.reviewId,hash:hash(approval.review),disposition:approval.review.disposition,evidenceStatus:approval.review.evidenceStatus,sourceIds:clone(approval.review.sourceIds)}],scientificConditions:clone(approval.review.conditions??[]),limitations:clone(approval.review.limitations??[]),nextCheck:{owner:'COACHING_INTELLIGENCE',trigger:reasoning.nextObservation,exit:'Retain, regress or progress inside current approved envelopes using observed response; no automatic restoration'},coachingReasoning:reasoning,ranking:clone(ranking)};
     if(['KEEP_BASE','KEEP_CURRENT'].includes(selected.id))d={...d,decisionType:'KEEP',coverage:coverage[1],candidate:null};
    }
   }
   // True adequate-plan KEEP and clinical/current-state ASK/HOLD retain R3 behavior.
  }
 }
 const quality=d.coverage===coverage[0]?'COACHING_BEST_SUPPORTED':d.decisionType==='KEEP'?'COACHING_BEST_SUPPORTED':d.decisionType==='ASK'?'INSUFFICIENT_INFORMATION':d.coverage===coverage[7]?'CLINICAL_OUT_OF_SCOPE':'UNSUPPORTED';
 const official=clone(base.officialPlanState),completed=clone(base.observedExecutionState);
 const result={...base,mode:'SHADOW',runtimeVersion:'DCR4-COACHING-1',officialPlanState:official,observedExecutionState:completed,appliedState:clone(official),shadowDecision:{...d,id:'r4-'+inputHash,traceId:'r4-trace-'+inputHash,inputHash,applied:false,effect:'SHADOW_ONLY',autonomyLevel:d.decisionType==='MODIFY'?'SUGGEST_AND_CONFIRM':'ABSTAIN_OR_HOLD',mustNot:['MUTATE_OFFICIAL_PLAN','APPLY_EFFECT','REWRITE_COMPLETED_WORK','INVENT_MISSING_FACT','INFER_CAUSALITY','PROMOTE_PRODUCT_TRUTH'],preserve:{officialHash:hash(official),completedHash:hash(completed)},coachingQuality:quality,qualityAssessment:{class:quality,assessor:'RUNTIME_RULE_SELF_CHECK',independent:false,scope:'Relative to generated approved candidates and available facts; independent coaching quality review required'},coachingReasoning:reasoning??d.coachingReasoning??null,ranking:ranking??d.ranking??null,athleteModelUpdate:modelProposal(s,inputHash),semanticConsumption:{...clone(base.shadowDecision.semanticConsumption),decisionReady:!['ASK','CLINICAL_HUMAN_REQUIRED'].includes(d.decisionType)},trace:{consumerVersion:'DCR4-COACHING-1',inputHash,reads,legacyAssessment:{decisionType:base.shadowDecision.decisionType,coverage:base.shadowDecision.coverage,reason:base.shadowDecision.rationale},goalContext:goal,envelopeId,envelopeApprovalMatched:!!approval,registryHash:registry?hash(registry):null,authorityHash:authority?hash(authority):null,athleteModelHash:model?.hash??null,source:clone(i.source??null),adapterTrace:clone(i.adapter?.trace??[]),adapterWarnings:clone(i.adapter?.warnings??[]),adapterConflicts:clone(i.adapter?.conflicts??[]),authoritySplit:'SSCTR approves this reusable option space; coaching rules rank concrete options. No paper-level approval is required for each concrete selection inside the approved bounds.'}}};
 if(extendedMaterial)result.shadowDecision.semanticConsumption={...result.shadowDecision.semanticConsumption,consumed:true,representationExtension:'R4-SOURCE-BOUND-COMPLETE-TASK-1',materialContract:{recognized:true,valid:true,contract:'R4-SOURCE-BOUND-COMPLETE-TASK-1',request:kind,errors:[],supersededRepresentationErrors:clone(base.shadowDecision.semanticConsumption.materialContract.errors)}};
 return freeze(result);
}
export class CoachingShadowJournal {
 #entries=new Map();
 record(input,options={}){const result=evaluateCoachingShadow(input,options),key=hash({input,options,registryHash:result.shadowDecision.trace.registryHash,authorityHash:result.shadowDecision.trace.authorityHash});if(this.#entries.has(key))return {duplicate:true,result:this.#entries.get(key)};this.#entries.set(key,result);return {duplicate:false,result};}
 get size(){return this.#entries.size;}
}
