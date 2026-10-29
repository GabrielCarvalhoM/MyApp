// Independent, conservative transport adapter. No runtime, development fixture or expected-output import.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const root='C:/Users/carva/Desktop/myApp/MyApp';
const require=createRequire(import.meta.url);
const Ajv2020=require(path.join(root,'CoachingCore/node_modules/ajv/dist/2020.js'));
const source=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json')));
const schema=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json')));
const registry=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json')));
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
if(hash(source.cases)!==source.corpusContentSha256)throw new Error('Frozen corpus mismatch');
const expectedHash='efd521341252db0413ea9dbac0b28df83ef5b7606cad1b99fd025ea024f07971';
if(source.corpusContentSha256!==expectedHash)throw new Error('Unexpected semantic corpus revision');
const validate=new Ajv2020({allErrors:true,strict:false}).compile(schema);
const at='2026-10-24T12:00:00-03:00';
const requestMap={1:'ESTABLISH_RUN',2:'ESTABLISH_RUN',3:'ESTABLISH_STRENGTH',4:'ESTABLISH_STRENGTH',5:'CALIBRATE_RUN',6:'ESTABLISH_RUN',7:'ESTABLISH_RUN',8:'ESTABLISH_RUN',9:'LOCAL_FATIGUE',10:'SYSTEMIC_FATIGUE',11:'PROGRESS_STRENGTH',12:'UNDER_TARGET_STRENGTH',13:'REVIEW_ORDINARY_SESSION',14:'REVIEW_MISSED_OPTIONAL',15:'RESOLVE_DOUBLE_SESSION_CONFLICT',16:'RESOLVE_DOUBLE_SESSION_CONFLICT',17:'REVIEW_DEVICE_ONLY_SIGNAL',18:'CONFIGURED_SUBSTITUTION',19:'RETURN_RUN',20:'RETURN_STRENGTH',21:'RETURN_HYBRID',22:'RETURN_RUN',23:'RETURN_STRENGTH',24:'RETURN_RUN',25:'TAPER_10K',26:'TAPER_HALF',27:'TAPER_BALANCED',28:'TAPER_HALF',29:'POST_EVENT_RESPONSE_CHECK',30:'TAPER_10K',31:'CALIBRATE_RUN',32:'CALIBRATE_RUN',33:'CALIBRATE_RUN',34:'CALIBRATE_RUN',35:'CALIBRATE_RUN',36:'CALIBRATE_RUN',37:'PROGRESS_RUN',38:'CALIBRATE_RUN',39:'CALIBRATE_RUN',40:'CALIBRATE_RUN',41:'RANK_OPTIONS',42:'LEARN_NEW_RULE'};
const knownMovement=new Set([2,6,9,10,11,12,13,14,15,16,17,19,20,21,23,25,26,27,31,33,34,37,39,40,41,42]);
const currentCompatible=new Set([1,2,3,6,7,9,11,13,14,15,16,17,31,33,34,37,39,41]);
const currentAdverse=new Set([10,12,23,24,30]);
const comparableKnown=new Set([1,2,6,7,9,11,12,13,14,15,16,31,33,34,37,39]);
const rows=[];
for(const c of source.cases){
 const n=Number(c.caseId.slice(-2)), f=c.scenarioFacts, p=f.population;
 if(hash(f)!==c.scenarioFactsSha256)throw new Error('Fact mismatch '+c.caseId);
 const issues=[],missing=[];
 const note=(code,detail)=>issues.push({code,detail});
 const bind=(detail)=>missing.push(detail);
 const athleteId='EVAL-'+c.caseId;
 const request=requestMap[n];
 const facts={};
 const input={inputVersion:'BSR-INPUT-R2',purpose:'SYNTHETIC_SHADOW',synthetic:true,evaluatedAt:at,athleteFixtureId:athleteId,
  athleteState:{athlete_id:athleteId,adult:true,priority:p.priority,runLevel:p.runExperience,strengthLevel:p.strengthExperience,dataMode:{NO_WEARABLE:'NONE',PARTIAL:'PARTIAL',RICH:'RICH'}[p.dataTier],history:p.historyOrigin==='RECENT_COMPARABLE_RECORDS'?'KNOWN':'LIMITED',movementCompetence:knownMovement.has(n)?'KNOWN':'UNKNOWN'},
  officialPlanState:null,event:{event_id:c.caseId+'-REQUEST',type:'R2_REQUEST',request,sessionId:null,facts},
  observation:{sourceRef:c.caseId+'-FROZEN-SYNTHETIC-CONTEXT',sourceRevision:source.version,observedAt:at,coverage:'COMPLETE',association:'CONFIRMED',response:currentCompatible.has(n)?'COMPATIBLE':currentAdverse.has(n)?'ADVERSE':'UNKNOWN',contextComparable:comparableKnown.has(n)},
  observedExecutionState:{events:[{event_id:c.caseId+'-REQUEST'}],completed:[],inferred:[]},
  recoveryContext:{eligibilityStatus:f.eligibility.status==='UNKNOWN'?'ELIGIBILITY_UNASSESSED':f.eligibility.status,clinicalConcern:f.eligibility.clinicalConcern===true,interrupted:!!f.interruption,sourceRef:c.caseId+'-EXPLICIT-ELIGIBILITY',contextChanged:false,clinicalFlags:Object.entries(f.eligibility).filter(([k,v])=>v===true&&['injury','illness','persistentPain','functionalLimitation'].includes(k)).map(([k])=>k),persistentPain:f.eligibility.persistentPain===true,injury:f.eligibility.injury===true,illness:f.eligibility.illness===true,functionalLimitation:f.eligibility.functionalLimitation===true,clearanceRequired:false},
  policyContext:{registryVersion:'R2_REGISTRY_VERSION',registryHash:'R2_REGISTRY_HASH',revokedReviewIds:[],holds:[],longitudinalPurposeAllowed:f.learningConsent?.purposeAllowed===true,requestedPolicyIds:[]},
  provenance:{dataClass:'SYNTHETIC',sourceRef:c.caseId,sourceRevision:source.version,coverage:'EXPLICIT_FIXTURE_FACTS',association:'CONFIRMED'}
 };
 // This timestamp is the authored snapshot time, not an invented historical exposure date.
 // Missing historical dates remain omitted from episode records.
 note('TRANSPORT_TIMESTAMP','evaluatedAt and current context observedAt identify the frozen synthetic snapshot. No historical exposure dates are fabricated.');
 const plan=(sessions)=>{input.officialPlanState={plan_id:'PLAN-'+c.caseId,plan_revision:source.version,athlete_id:athleteId,sessions:sessions.map((s,i)=>({session_id:c.caseId+'-S'+(i+1),day:s.day,recipeId:s.recipeId,status:'PLANNED',optional:!!s.optional,parameters:s.parameters??{}}))};input.event.sessionId=input.officialPlanState.sessions[0]?.session_id??null;};
 const unknownRecipe=(suffix)=>'INDEPENDENT-'+c.caseId+'-'+suffix;
 const availability=f.onboarding?.availability??f.currentDemand?.availability??f.availability;
 const addAvailability=()=>{if(Array.isArray(availability)){facts.availableDays=availability.map(x=>x.day);facts.timeBudgetMinutes=Math.min(...availability.map(x=>x.minutes));}else{note('MISSING_AVAILABILITY','No named current days and budgets supplied; required facts are omitted.');}};
 const episode=(id,recipeId,extra)=>({factId:c.caseId+'-'+id,athleteId,sourceRef:c.caseId+'-HISTORY',sourceRevision:source.version,coverage:'COMPLETE',recipeId,...extra});
 if([1,2,6,7,8].includes(n)){
  addAvailability();
  if(n===1)Object.assign(facts,{walkMinutes:25,comfortableTalk:true,runExposure:'NEVER'});
  if(n===2){Object.assign(facts,{walkMinutes:10,runExposure:'REPORTED'});note('MISSING_TALK_ANCHOR','Comfortable completion is reported, but explicit talk-cue comprehension is absent; comfortableTalk is omitted.');}
  if(n===6){Object.assign(facts,{comfortableTalk:true,runExposure:'REPORTED'});note('MISSING_WALKING_TASK','Familiar 20 min easy running is supplied, but the separate walking-capacity input required by ESTABLISH_RUN is not.');bind('No initial known-easy-repeat selector for the reported 20 min run configuration; generic novice run/walk establishment is a different task.');}
  if(n===7)Object.assign(facts,{walkMinutes:30,comfortableTalk:true,runExposure:'NEVER'});
  if(n===8){bind('Onboarding needs question selection; eligibility, time, equipment and exposure are unassessed.');}
  if([1,2,7].includes(n))bind('Frozen available days differ from the fixed Mon/Wed/Sat establishment template. A full-week proposal must not replace supplied availability.');
 }
 if([3,4].includes(n)){
  addAvailability();
  if(n===3){Object.assign(facts,{configurationFamiliar:false,techniqueDemonstrated:false,loadEstablished:false});bind('Supplied sit-to-stand/supported-row demonstrations do not establish the four machine tasks in R2-ST-EST-1X8.');}
  if(n===4){Object.assign(facts,{configurationFamiliar:false,techniqueDemonstrated:false,loadEstablished:false});bind('Unknown loaded barbell squat competence cannot be replaced with a familiar machine configuration.');}
  note('MISSING_TASK_LOADS','loadsKg is omitted. No machine kilograms or zero-load stand-ins were supplied by this independent case.');
 }
 if(n===5)Object.assign(facts,{family:'VO2',targetMethod:'PACE',construct:'VO2_STYLE',paceSecondsPerKm:null,familyFamiliar:false,targetEstablished:false,conditionsComparable:false,toleranceKnown:false,noLab:true});
 if(n===9){
  Object.assign(facts,{loadKg:18,fatigueScope:'LOCAL',affectedComponent:'CALF',essentialPerformance:'COMPATIBLE',optionalComponentUnperformed:true,materialProblem:true});
  plan([{day:'THU',recipeId:unknownRecipe('GOBLET-ROW-LOADED-CALF')}]);
  bind('R2-LOWER-CALF contains back squat 3x8/RIR2 and bodyweight calf 2x12; the frozen case is goblet squat 2x8/RIR3 plus supported row and loaded calf 2x10. Substituting the registry recipe would alter essential work.');
 }
 if(n===10){
  Object.assign(facts,{subjectiveFatigue:true,performanceDecline:true,materialProblem:true});
  plan([{day:'THU',recipeId:unknownRecipe('CRUISE-4X5')}]);
  note('MISSING_BRANCH_AUTHORITY','No preauthorized THU/SAT swap, branch window, current easy tolerance or unchanged comparability was supplied. These facts are omitted.');
  bind('Converging fatigue in partially completed 4x5 cruise work is not the 5x3-to-easy preauthorized swap selector. Completed prefix and early-ended second repetition are retained in frozen facts; R2 completed schema cannot represent exact partial dose.');
 }
 if(n===11){
  Object.assign(facts,{loadKg:12,relevantContextUnchanged:true});
  facts.episodes=f.observations.recentComparableSessions.map((e,i)=>episode('ROW-'+i,unknownRecipe('ROW-2X8'),{comparable:true,result:'OVER_TARGET',completed:true,technique:'ACCEPTABLE',actualReps:8,actualRir:Math.min(...e.reportedRir),actualLoadKg:12}));
  plan([{day:'MON',recipeId:unknownRecipe('ROW-2X8')}]);
  note('MISSING_DATED_HISTORY','No historical exposure dates or equipment-step availability are supplied; observedAt and smallestIncrementAvailable are omitted rather than invented.');
  bind('A supported-row 2x8-to-2x9 step is not the reviewed back-squat 3x8-to-3x9 recipe. RIR values are retained conservatively as minimum across actual sets; per-set history remains in frozen facts.');
 }
 if(n===12){
  Object.assign(facts,{loadKg:24,reducedCandidateTolerated:true,materialProblem:true});
  facts.episodes=[episode('GOBLET-LAST',unknownRecipe('GOBLET-3X8'),{comparable:true,result:'UNDER_TARGET',completed:false,technique:'ACCEPTABLE',actualReps:6,actualRir:0,actualLoadKg:24})];
  plan([{day:'MON',recipeId:unknownRecipe('GOBLET-3X8')}]);
  note('MISSING_DATED_HISTORY','The repeated trend is described but dates and exact earlier exposure fields are not supplied; historical observedAt and unchanged-context assertion remain omitted.');
  bind('Known smaller goblet load 22kg is not a back-squat set-removal recipe. The exact actual set sequence 8/7/6 is preserved in the frozen facts and cannot be replaced by one scalar in a prescriptive claim.');
 }
 if(n===13){plan([{day:'TUE',recipeId:'R2-EASY-25'}]);bind('No ordinary-session review request exists. A no-material-problem KEEP should not require inventing a local-fatigue event.');}
 if(n===14){plan([{day:'WED',recipeId:'R2-EASY-20',optional:true}]);bind('No explicit missed-optional/no-compensation semantic request exists; do not relabel omission as fatigue.');}
 if([15,16].includes(n)){
  plan([{day:'THU',recipeId:unknownRecipe('CRUISE-40')},{day:'THU',recipeId:unknownRecipe('LOWER-45')}]);
  bind('R2 RANK_OPTIONS only accepts MON_LOWER/WED_LOWER, not the independently supplied THU/FRI two-modality availability conflict. Losslessly mapping actual times and alternatives is unavailable.');
 }
 if(n===17){plan([{day:'THU',recipeId:'R2-EASY-25'}]);note('FROZEN_SOURCE_DATA_MODE_CONFLICT','The frozen generic population profile says NO_WEARABLE, while this scenario explicitly supplies a device HRV/sleep alert. The profile was not silently rewritten after freeze; this conflict requires a future versioned corpus correction and must preclude hidden certainty.');bind('No device-only noise/ordinary-context review request exists. The isolated firmware-related alert must not become a fatigue event.');}
 if(n===18){plan([{day:'MON',recipeId:unknownRecipe('BENCH-2X8-30KG')}]);bind('No configured-substitution request exists, and no complete alternative recipe was supplied.');}
 if([19,22,24].includes(n)){
  const z=f.interruption;
  Object.assign(facts,{reason:z.reason==='TRAVEL'?'TRAVEL':z.reason==='INJURY'?'INJURY':'UNKNOWN',interruptionDays:z.durationDays,priorFamiliar:true,capacityEstablishedToday:false});
  if(n===19){facts.timeBudgetMinutes=35;bind('Only prior 25min easy tolerance and current ordinary walking are known. No current demonstrated run minutes or named day is supplied; automatic 20min return would infer capacity.');}
  if(n===22)bind('Reason, current response and availability require questions before a return dose.');
  if(n===24)bind('Clinical injury/persistent-pain guard must dominate missing return facts; no dose is admissible.');
  note('MISSING_CURRENT_RUN_TASK','currentRunMinutes, currentComfortableTalk and unknown named availability are omitted; unknown does not become zero/currently tolerated.');
 }
 if([20,23].includes(n)){
  Object.assign(facts,{reason:'TRAVEL',interruptionDays:f.interruption.durationDays,priorFamiliar:true});
  if(n===20){facts.timeBudgetMinutes=35;bind('Old goblet 2x8@16kg history is not a current machine-task demonstration. Current task/load fields and machine kilograms are absent.');}
  if(n===23)bind('Current return trial was not tolerated; no smaller reviewed alternative or machine task loads were supplied.');
  note('MISSING_CURRENT_STRENGTH_TASK','Current four-machine demonstration/load fields, loadsKg and named days are omitted rather than synthesized.');
 }
 if(n===21)bind('No joint RETURN_HYBRID request exists. Current establishment must address both modalities from the frozen independent entry configurations, not restore the former week.');
 if([25,26,27,28,30].includes(n)){
  Object.assign(facts,{eventDistance:[26,28].includes(n)?'HALF_MARATHON':'10K',eventPriorityConfirmed:true,strengthIntent:'MAINTAIN_FAMILIAR'});
  // No event-relative date or numeric race-pace target is in the frozen scenarios.
  if(n===28)Object.assign(facts,{allRecipesFamiliar:false,runTargetsCalibrated:false});
  note('MISSING_JOINT_EVENT_RECIPE','daysToRace, numeric racePaceSecondsPerKm, exact machine loads and full fixed-template familiarity/schedule are absent, so they are omitted. Race day names do not establish a calendar date.');
  bind('Familiar goblet/supported or light strength intent cannot be changed into the registry legPress/machineChestPress/cableRow template. Familiar event cues differ from fixed registry repetitions and do not establish every other event-week recipe.');
  if(n===27)bind('The event is SAT and available days MON/WED/SAT; a SUN event template must not override those facts.');
 }
 if(n===29)bind('No post-event response-check request exists. Post-event current symptoms/function/recovery are unknown, so no dose should be manufactured.');
 const cal=(family,targetMethod,construct,pace,familiar,established,comparable,tolerance,noLab)=>Object.assign(facts,{family,targetMethod,construct,paceSecondsPerKm:pace,familyFamiliar:familiar,targetEstablished:established,conditionsComparable:comparable,toleranceKnown:tolerance,noLab});
 if(n===31){cal('EASY','TALK_RPE','EASY_EFFORT',null,true,true,true,true,true);Object.assign(facts,{toleratedRecipeId:'R2-EASY-20',toleranceFactId:c.caseId+'-PRIOR-20MIN-TALK-EXPOSURES'});}
 if(n===32){cal('RECOVERY','PACE','UNKNOWN',null,false,false,false,false,true);Object.assign(facts,{toleratedRecipeId:'R2-EASY-25',toleranceFactId:c.caseId+'-KNOWN-EASY25-NOT-RECOVERY'});bind('The desired recovery/easy construct is unestablished. No separate universal recovery pace may be generated. The supplied toleratedRecipeId refers only to the known easy 25min exposure.');}
 if(n===33){cal('STEADY','PACE','STEADY_EFFORT',355,true,true,true,true,true);Object.assign(facts,{toleratedRecipeId:unknownRecipe('STEADY-10WU-15WORK-5CD'),toleranceFactId:c.caseId+'-PRIOR-STEADY-EXPOSURE'});bind('The registry has no independent familiar steady 15min work protocol; easy/VO2 recipes are not equivalent.');}
 if(n===34){cal('THRESHOLD','PACE','FIELD_SESSION_TARGET',330,true,true,true,true,true);Object.assign(facts,{toleratedRecipeId:unknownRecipe('CRUISE-3X5'),toleranceFactId:c.caseId+'-PRIOR-CRUISE-EXPOSURE'});bind('FIELD_SESSION_TARGET preserves the familiar task anchor without asserting measured LT2 or CS. The familiar 3x5 cruise recipe is not the 4x3 VO2-style field recipe.');}
 if(n===35)cal('VO2','POWER','VO2_STYLE',null,false,false,false,false,true);
 if(n===36){cal('SHORT_INTERVALS','PACE','SHORT_FAST',null,false,false,false,false,true);Object.assign(facts,{toleratedRecipeId:'R2-EASY-20',toleranceFactId:c.caseId+'-KNOWN-EASY20-NOT-SHORT-INTERVALS'});}
 if(n===37){
  Object.assign(facts,{family:'LONG',relevantContextUnchanged:true,candidatePreviouslyTolerated:true});
  facts.episodes=f.priorHistory.recentComparable.map((_,i)=>episode('LONG-'+i,unknownRecipe('LONG55'),{comparable:true,result:'COMPATIBLE',completed:true,technique:'UNKNOWN'}));
  plan([{day:'SUN',recipeId:unknownRecipe('LONG55')}]);
  note('EPISODE_SCHEMA_NOT_RUN_SPECIFIC','Generic R2 episode requires actualReps, actualRir and actualLoadKg even for run history. No irrelevant zeros or lifting measures are fabricated; these and unsupplied exposure dates remain omitted.');
  bind('Frozen long-run candidate is 55-to-60 minutes, not the registry 40-to-45 selector.');
 }
 if(n===38)cal('HILLS','PACE','HILL_EFFORT',null,false,false,false,false,true);
 if(n===39){cal('STRIDES','TALK_RPE','RELAXED_STRIDE',null,true,true,true,true,true);Object.assign(facts,{toleratedRecipeId:unknownRecipe('STRIDES-4X15-SELF-PACED-WALK'),toleranceFactId:c.caseId+'-PRIOR-STRIDE-EXPOSURE'});bind('The frozen 4x15s relaxed strides use self-paced walking recovery and supply no 20min easy component. R2-EASY20-STRIDES adds 20min easy and fixes 60s recovery. A candidate must not silently add/change those doses.');}
 if(n===40)cal('RACE_PACE','PACE','RACE_PACE',null,false,false,false,false,true);
 if(n===41){
  Object.assign(facts,{alternatives:['MON_LOWER','WED_LOWER'],counterevidenceConsidered:true});
  facts.episodes=f.priorHistory.observations.map((e,i)=>({factId:c.caseId+'-PATTERN-'+i,athleteId,sourceRef:c.caseId+'-OBSERVATIONAL-HISTORY',sourceRevision:source.version,coverage:'COMPLETE',comparable:true,placement:e.arrangement==='LOWER_MON_CRUISE_THU'?'MON_LOWER':'WED_LOWER',response:e.cruiseResponse==='usual effort'?'COMPATIBLE':'DEGRADED'}));
  note('MISSING_HISTORY_DATES_AND_ADMISSIBILITY','Historical observation dates, a concrete necessity and current independent admissibility/unchanged-context are not supplied. Those fields remain omitted; no scientific approval is inferred from the phrase options.');
  bind('Ranking must await separate admissibility confirmation for both candidates and a current reason to choose a next-horizon option. It cannot convert four uncontrolled observations into causality.');
 }
 if(n===42)bind('No LEARN_NEW_RULE request exists; single confounded event is explicitly insufficient to authorize a dose rule.');
 const valid=validate(input);
 const requestSpec=schema.properties.event.oneOf.find(x=>x.properties.request.enum.includes(request));
 const requestIndex=schema.properties.event.oneOf.indexOf(requestSpec);
 const relevantPrefix='#/properties/event/oneOf/'+requestIndex+'/';
 const errors=structuredClone((validate.errors??[]).filter(e=>!e.schemaPath.startsWith('#/properties/event/')||e.schemaPath.startsWith(relevantPrefix)));
 if(!requestSpec)errors.push({instancePath:'/event/request',keyword:'unrecognizedRequest',message:'No strict R2 branch for '+request});
 if(!requestSpec)note('REQUEST_NOT_IN_API',request+' has no strict R2 event branch; minimal request is preserved so runtime must fail closed.');
 if(requestSpec){const required=requestSpec.properties.facts.required;const absent=required.filter(k=>!(k in facts));if(absent.length)note('REQUIRED_FACTS_ABSENT',absent.join(', '));}
 const recognizedRecipes=(input.officialPlanState?.sessions??[]).filter(s=>registry.recipes.some(r=>r.recipeId===s.recipeId)).map(s=>s.recipeId);
 rows.push({caseId:c.caseId,sourceFactsSha256:c.scenarioFactsSha256,independentTargetCategory:c.independentExpectation.targetCategory,input,adapterIssues:issues,missingSemanticBinding:missing,schemaValidation:{valid,errors},recognizedPlanRecipeIds:recognizedRecipes,inputSha256:hash(input),coverageClaimRule:'Actual MODIFY cannot count as positive when the emitted dose depends on an unresolved missingSemanticBinding or changes a frozen fact. Judge evidence is required; adapter validity alone is insufficient.'});
}
const adapted={adapterId:'R2-INDEPENDENT-EVAL-ADAPTER',version:'1.0.0',authoredAt:'2026-10-24',sourceCorpus:{id:source.corpusId,version:source.version,corpusContentSha256:source.corpusContentSha256},apiSchemaSha256:hash(schema),registryReadForRecipeIdentityOnly:true,independence:{runtimeImported:false,developmentFixturesImported:false,expectedOutputsImported:false,sourceFactsAndExpectationsChanged:false},registryInjection:{allowedFields:['policyContext.registryVersion','policyContext.registryHash'],placeholders:['R2_REGISTRY_VERSION','R2_REGISTRY_HASH'],rule:'Evaluation runner injects current registry identity only; input hash must be recomputed and recorded separately after injection. It must not repair unknown sporting facts or missing semantic bindings.'},limits:['A valid envelope is supplied for every case, but intentionally incomplete request facts retain missing knowledge and can fail strict schema.','Unsupported ordinary requests remain explicit instead of being relabeled as an unrelated approved policy.','Global movementCompetence is a coarse transport field; frozen modality/configuration-specific facts retain authority.','No per-history dates, machine loads, exact race paces or established capacity are invented.','Synthetic transport timestamp is the authored context snapshot; it is not a historical exposure timestamp.','R2 results and judging belong in a separate artifact, not this input adapter.'],caseCount:rows.length,validInputCount:rows.filter(x=>x.schemaValidation.valid).length,intentionallyIncompleteOrUnsupportedInputCount:rows.filter(x=>!x.schemaValidation.valid).length,cases:rows,adaptedInputsSha256:hash(rows.map(r=>({caseId:r.caseId,input:r.input,sourceFactsSha256:r.sourceFactsSha256,adapterIssues:r.adapterIssues,missingSemanticBinding:r.missingSemanticBinding})))};
const target=path.join(root,'CoachingCore/r2/evaluation/R2_EVAL_INPUTS.json');
fs.writeFileSync(target,JSON.stringify(adapted,null,2)+'\n');
const proof={mechanism:'Node24 independent adapter + AJV2020 strict R2 schema validation; SHA-256 recomputation of frozen scenario facts/expectations',node:process.version,sourceCorpusHash:source.corpusContentSha256,sourceUnchanged:hash(source.cases)===expectedHash,caseCount:rows.length,validInputCount:adapted.validInputCount,intentionallyIncompleteOrUnsupportedInputCount:adapted.intentionallyIncompleteOrUnsupportedInputCount,validCaseIds:rows.filter(x=>x.schemaValidation.valid).map(x=>x.caseId),allCaseIdsUnique:new Set(rows.map(x=>x.caseId)).size===rows.length,allFactHashesMatch:source.cases.every(c=>hash(c.scenarioFacts)===c.scenarioFactsSha256),allRegistryPlaceholdersPresent:rows.every(x=>x.input.policyContext.registryVersion==='R2_REGISTRY_VERSION'&&x.input.policyContext.registryHash==='R2_REGISTRY_HASH'),runtimeOrDevFixtureImports:false,adaptedInputsSha256:adapted.adaptedInputsSha256,coverageOrRuntimeSuccessClaimed:false};
fs.writeFileSync(path.join(root,'audits/domain-closure-r2-2026-10-24/eval-author/ADAPTER_VALIDATION.json'),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof,null,2));
