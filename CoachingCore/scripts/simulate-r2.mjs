import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import {evaluateShadow,ShadowJournal} from '../src/index.mjs';
import {r2Input,r2Requests,r2RegistryInfo} from '../src/r2-fixtures.mjs';
import {hash,clone} from '../src/value.mjs';
import inputSchema from '../r2/SHADOW_INPUT_R2_SCHEMA.json' with {type:'json'};
import decisionSchema from '../SHADOW_DECISION_SCHEMA.json' with {type:'json'};
const core=path.resolve(import.meta.dirname,'..'),root=path.dirname(core),out=path.join(core,'r2');
const write=(name,obj)=>fs.writeFileSync(path.join(out,name),typeof obj==='string'?obj:JSON.stringify(obj,null,2)+'\n');
const classes=['POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED','SUPPORTED_KEEP','USEFUL_ASK','CORRECT_ABSTAIN_OR_HOLD','NOT_SUPPORTED_YET','CLINICAL_OR_OUT_OF_SCOPE'];
const classify=d=>d.decisionType==='CLINICAL_HUMAN_REQUIRED'||d.unsupportedDependency==='REAL_USE_NOT_AUTHORIZED'?classes[5]:({MODIFY:classes[0],KEEP:classes[1],ASK:classes[2],HOLD:classes[3],ABSTAIN:classes[3],NOT_SUPPORTED_YET:classes[4]})[d.decisionType];
const tally=rs=>Object.fromEntries(classes.map(c=>[c,rs.filter(r=>r.coverage===c).length]));
const ajv=new Ajv2020({strict:false,allErrors:true}),validateInput=ajv.compile(inputSchema),validateDecision=ajv.compile(decisionSchema);
const rows=[],journal=new ShadowJournal();
function evaluate(input,corpus,label,metadata={}){
 const before=hash(input),result=journal.record(input).result,d=result.shadowDecision;
 assert.equal(hash(input),before,'Input mutated');assert.deepEqual(result.appliedState,input.officialPlanState??null);assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');assert.deepEqual(evaluateShadow(input),result);assert.equal(journal.record(input).duplicate,true);assert.ok(validateDecision(d),JSON.stringify(validateDecision.errors));
 const schemaValid=validateInput(input),rawCoverage=classify(d),coverage=!schemaValid&&d.decisionType==='ASK'?classes[4]:rawCoverage;
 if(d.decisionType==='MODIFY'){assert.ok(d.candidate&&d.policyRefs.length&&d.evidenceRefs.length&&d.scientificConditions);assert.equal(metadata.missingSemanticBinding?.length??0,0,'Positive prescription has unresolved independent semantic facts');}
 rows.push({corpus,label,coverage,rawCoverage,classificationBasis:!schemaValid&&d.decisionType==='ASK'?'TRANSPORT_OR_CONTRACT_NOT_SUPPORTED; raw ASK usefulness is not established':'EXECUTABLE_SEMANTIC_DISPOSITION',input:clone(input),result,schemaValid,schemaErrors:schemaValid?[]:clone(validateInput.errors),...metadata});return result;
}

// Re-run the unchanged BSR1 simulation source against the integrated runtime. Only its output directory is redirected.
const legacyOut=path.join(out,'legacy-replay');fs.mkdirSync(legacyOut,{recursive:true});
let legacySource=fs.readFileSync(path.join(core,'scripts/simulate.mjs'),'utf8');
legacySource=legacySource.replaceAll(/from '\.\.\/src\/([^']+)'/g,(_,file)=>'from '+JSON.stringify(pathToFileURL(path.join(core,'src',file)).href));
const originalOut="const out=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../artifacts');";
assert.ok(legacySource.includes(originalOut));legacySource=legacySource.replace(originalOut,'const out='+JSON.stringify(legacyOut)+';');
const legacyRun=spawnSync(process.execPath,['--input-type=module','-e',legacySource],{cwd:core,encoding:'utf8',maxBuffer:10_000_000});
write('LEGACY_SIMULATION_LOG.txt',(legacyRun.stdout??'')+(legacyRun.stderr??''));assert.equal(legacyRun.status,0,'Legacy simulation failed');
const legacy=JSON.parse(fs.readFileSync(path.join(legacyOut,'SYNTHETIC_SHADOW_RESULTS.json')));

for(const request of r2Requests())evaluate(r2Input(request),'DEVELOPMENT',request);
for(const [family,targetMethod,construct,toleratedRecipeId,paceSecondsPerKm]of [['LONG','TALK_RPE','LONG_EASY','R2-EASY-40',null],['THRESHOLD','PACE','FIELD_SESSION_TARGET','R2-CRUISE-3X5',330],['VO2','PACE','FIELD_SESSION_TARGET','R2-RUN-4X3',300],['STRIDES','TALK_RPE','RELAXED_STRIDE','R2-EASY20-STRIDES',null]]){
 const i=r2Input('CALIBRATE_RUN');Object.assign(i.event.facts,{family,targetMethod,construct,toleratedRecipeId,paceSecondsPerKm});i.officialPlanState.sessions[0].recipeId='R2-LABEL-'+family;i.event.event_id='DEV-CALIBRATE-'+family;evaluate(i,'DEVELOPMENT_FAMILY_VARIANTS',family);
}
for(const priority of ['RUN_FIRST','STRENGTH_FIRST','BALANCED'])for(const dataMode of ['NONE','PARTIAL','RICH']){
 const i=r2Input('LOCAL_FATIGUE');i.athleteState.priority=priority;i.athleteState.dataMode=dataMode;i.event.event_id='VAR-'+priority+'-'+dataMode;evaluate(i,'CONTEXT_VARIANTS',priority+'/'+dataMode);
}

const corpus=JSON.parse(fs.readFileSync(path.join(out,'evaluation/REPRESENTATIVE_CORPUS_R2.json'))),adapter=JSON.parse(fs.readFileSync(path.join(out,'evaluation/R2_EVAL_INPUTS.json')));
assert.equal(hash(corpus.cases),corpus.corpusContentSha256,'Independent corpus facts/expectations changed');
for(const row of adapter.cases){
 const frozen=corpus.cases.find(c=>c.caseId===row.caseId);assert.ok(frozen);assert.equal(hash(frozen.scenarioFacts),row.sourceFactsSha256);
 const i=clone(row.input);Object.assign(i.policyContext,r2RegistryInfo());
 evaluate(i,'REPRESENTATIVE_INDEPENDENT',row.caseId,{independentTarget:row.independentTargetCategory,sourceFactsSha256:row.sourceFactsSha256,adapterIssues:row.adapterIssues,missingSemanticBinding:row.missingSemanticBinding});
}

const trajectories=[];
const timestamp=(day,hour=21)=>new Date(Date.UTC(2026,9,26+day,hour)).toISOString();
const strip=s=>{const {session_id,day,recipeId,status,optional,parameters}=s;return {session_id,day,recipeId,status,optional,parameters};};
for(const request of ['ESTABLISH_RUN','ESTABLISH_STRENGTH']){
 const first=r2Input(request),proposal=evaluate(first,'ESTABLISHMENT_TRANSITIONS',request+'/FIRST').shadowDecision.candidate;
 const chosen={plan_id:'SYNTHETIC-EXPLICITLY-CHOSEN-'+request,plan_revision:'chosen-week1',athlete_id:first.athleteFixtureId,sessions:proposal.sessions.map(strip)},completed=[],traceIds=[];
 for(let day=0;day<7;day++){
  for(const s of chosen.sessions.filter(s=>s.day===['MON','TUE','WED','THU','FRI','SAT','SUN'][day]))completed.push({sessionId:s.session_id,athleteId:first.athleteFixtureId,factId:'SCRIPTED-'+s.session_id,sourceRef:'SCRIPTED-COMPATIBLE-ESTABLISHMENT-ACTUAL',sourceRevision:'1',observedAt:timestamp(day,18),recipeId:s.recipeId,executedRevision:'chosen-week1',parameters:clone(s.parameters),coverage:'COMPLETE'});
  const i=r2Input(request);i.officialPlanState=clone(chosen);i.evaluatedAt=timestamp(day);i.observation.observedAt=timestamp(day,20);i.observation.sourceRef='SCRIPTED-WEEK1-COMPATIBLE-RESPONSE';i.observedExecutionState.completed=clone(completed);i.event.event_id=request+'-W1-D'+day;
  traceIds.push(evaluate(i,'ESTABLISHMENT_TRANSITIONS',request+'/DAY'+day).shadowDecision.traceId);
 }
 const next=r2Input(request);next.officialPlanState=clone(chosen);next.evaluatedAt=timestamp(7);next.observation.observedAt=timestamp(6);next.observedExecutionState.completed=clone(completed);next.event.event_id=request+'-W2-OBSERVED';assert.equal(evaluate(next,'ESTABLISHMENT_TRANSITIONS',request+'/WEEK2').shadowDecision.decisionType,'KEEP');
 trajectories.push({id:request,days:7,nextWeek:'SUPPORTED_KEEP_ONLY',traceIds,responseSource:'Scripted explicit actual response, not predicted physiology',chosenPlanHash:hash(chosen)});
}

// Four weeks with a hypothetical explicit synthetic choice after week1; no apply API is invoked.
for(const request of ['PROGRESS_STRENGTH','PROGRESS_RUN','LOCAL_FATIGUE']){
 let chosen=null;const ids=[];
 for(let week=0;week<4;week++)for(let day=0;day<7;day++){
  const i=r2Input(request);i.evaluatedAt=timestamp(week*7+day);i.observation.observedAt=timestamp(week*7+day,20);i.event.event_id=request+'-W'+week+'-D'+day;
  if(chosen){i.officialPlanState=clone(chosen);if('nextHorizonNeedConfirmed'in i.event.facts)i.event.facts.nextHorizonNeedConfirmed=false;else i.event.facts.materialProblem=false;}
  const r=evaluate(i,'FOUR_WEEK_R2_OBSERVATION',request+'/W'+week+'/D'+day);ids.push(r.shadowDecision.traceId);
  if(!chosen&&r.shadowDecision.decisionType==='MODIFY')chosen={plan_id:'SYNTHETIC-CHOSEN-'+request,plan_revision:'scripted-choice-1',athlete_id:i.athleteFixtureId,sessions:r.shadowDecision.candidate.sessions.map(strip)};
 }
 const rs=rows.filter(r=>r.corpus==='FOUR_WEEK_R2_OBSERVATION'&&r.label.startsWith(request+'/'));
 assert.equal(rs.filter(r=>r.result.shadowDecision.decisionType==='MODIFY').length,1,'Unexpected prescription cascade');
 trajectories.push({id:request,days:28,traceIds:ids,selectedCandidateCount:1,limitation:'Subsequent compatible response/adequacy is supplied by the harness; not product efficacy or autonomous learning'});
}
for(const request of ['RETURN_RUN','RETURN_STRENGTH','SYSTEMIC_FATIGUE','TAPER_10K']){
 const ids=[];for(let day=0;day<7;day++){const i=r2Input(request);i.evaluatedAt=timestamp(day);i.observation.observedAt=timestamp(day,20);i.event.event_id='STRESS-'+request+'-'+day;if(day>0)i.policyContext.holds=['EXPLICIT_UNRESOLVED_NEXT_CHECK'];ids.push(evaluate(i,'SEVEN_DAY_R2_STRESS',request+'/'+day).shadowDecision.traceId);}trajectories.push({id:'STRESS-'+request,days:7,traceIds:ids,holdsNeverReleasedByTime:true});
}
for(const v of ['LOW','HIGH','LOW','HIGH']){const i=r2Input('LOCAL_FATIGUE');i.event.facts.unreviewedSensor=v;evaluate(i,'UNSUPPORTED_NOISE',v);}
for(const f of ['RECOVERY','STEADY','SHORT_INTERVALS','HILLS','RACE_PACE']){const i=r2Input('CALIBRATE_RUN');i.event.facts.family=f;i.event.event_id='UNSUPPORTED-FAMILY-'+f;evaluate(i,'UNSUPPORTED_FAMILY',f);}

const representative=rows.filter(r=>r.corpus==='REPRESENTATIVE_INDEPENDENT'),dev=rows.filter(r=>r.corpus==='DEVELOPMENT'),unique=[...new Map(rows.map(r=>[r.result.shadowDecision.traceId,r])).values()];
const repSchema=representative.filter(r=>r.schemaValid),opportunities=representative.filter(r=>r.independentTarget===classes[0]),unresolved=opportunities.filter(r=>r.coverage!==classes[0]);
const baseline={revision:'COVERAGE-BASELINE-R2-1',measuredAt:new Date().toISOString(),positiveNumeratorRule:'Only concrete MODIFY with exact independent scientific authority, recipe, trace and no unresolved semantic-binding issue; KEEP/ASK/HOLD never enter numerator',denominatorPolicy:'Each corpus is reported separately; context variants, scripted days and replay do not become independent dose laws or V1 prevalence estimates',classes,corpora:Object.fromEntries([...new Set(rows.map(r=>r.corpus))].map(c=>[c,{rows:rows.filter(r=>r.corpus===c).length,uniqueInputs:new Set(rows.filter(r=>r.corpus===c).map(r=>r.result.shadowDecision.traceId)).size,classes:tally(rows.filter(r=>r.corpus===c))}])),legacyOriginalACF24:{rows:24,positive:6,keep:10,ask:6,hold:2,unchanged:true},development:{requests:dev.length,positive:dev.filter(r=>r.coverage===classes[0]).length,independentTaperAbstentions:3},representative:{rows:representative.length,classes:tally(representative),targetPositiveOpportunities:opportunities.length,unresolvedPositiveOpportunities:unresolved.map(r=>({caseId:r.label,actual:r.coverage,schemaValid:r.schemaValid,missingSemanticBinding:r.missingSemanticBinding})),currentSchemaValid:repSchema.length,currentSchemaInvalid:representative.length-repSchema.length,adapterOriginallySchemaValid:adapter.validInputCount,independentCorpusHash:corpus.corpusContentSha256,transportVersusDomain:'Schema-invalid cases demonstrate contract/adapter incompleteness. Schema-valid cases receive substantive guard/policy evaluation; neither result is population coverage.'},unique:{count:unique.length,classes:tally(unique)},humanValidation:false,empiricalValidation:false};
const metrics={revision:'RUNTIME-R2-RESULTS-1',generatedAt:new Date().toISOString(),node:process.version,scope:'OFFLINE_SYNTHETIC_SHADOW_REFERENCE',evaluationRows:rows.length,uniqueLogicalInputs:unique.length,savedReplayCount:unique.length,determinismChecks:rows.length,journalReplayChecks:rows.length,officialPlanMutations:0,appliedEffects:0,identicalInputFlips:0,unsupportedNoisePrescriptions:rows.filter(r=>r.corpus==='UNSUPPORTED_NOISE'&&r.result.shadowDecision.decisionType==='MODIFY').length,traceCompleteness:{complete:rows.filter(r=>r.result.shadowDecision.traceId&&r.result.shadowDecision.inputHash&&r.result.shadowDecision.nextCheck.exit).length,total:rows.length},trajectories,legacyReplay:{rows:legacy.evaluationRows,unique:legacy.uniqueLogicalEvaluations,officialPlanMutations:legacy.officialPlanMutations,appliedEffects:legacy.appliedEffects,reference:'legacy-replay/SYNTHETIC_SHADOW_RESULTS.json'},prescriptionCascade:0,limitations:['Scripted responses and explicit hypothetical synthetic choices are supplied facts, not physiological simulation or adoption by the runtime','Necessity, sufficiency, tolerance and calibration are explicit adjudicated context premises, not inferred from arbitrary raw data','No exhaustive policy-pair search, real-person safety, adherence, treatment efficacy or production reliability claim','Human/clinical/empirical validation remains absent']};
baseline.representative.rawDecisionCounts=Object.fromEntries(['MODIFY','KEEP','ASK','HOLD','ABSTAIN','NOT_SUPPORTED_YET','CLINICAL_HUMAN_REQUIRED'].map(t=>[t,representative.filter(r=>r.result.shadowDecision.decisionType===t).length]));
baseline.representative.askBreakdown={transportOrContractAsk:representative.filter(r=>!r.schemaValid&&r.result.shadowDecision.decisionType==='ASK').length,substantiveMissingInputAsk:representative.filter(r=>r.schemaValid&&r.result.shadowDecision.decisionType==='ASK').length,rule:'Schema-invalid ASK is semantically NOT_SUPPORTED_YET, never automatically USEFUL_ASK. Raw decision types remain available.'};
assert.equal(metrics.unsupportedNoisePrescriptions,0);
write('COVERAGE_BASELINE_R2.json',baseline);write('RUNTIME_R2_RESULTS.json',metrics);write('RUNTIME_R2_TRACES.json',{revision:'R2-TRACES-1',evaluationIndex:rows.map((r,n)=>({row:n,corpus:r.corpus,label:r.label,coverage:r.coverage,traceId:r.result.shadowDecision.traceId,schemaValid:r.schemaValid})),traces:unique.map(r=>({corpus:r.corpus,label:r.label,input:r.input,...r.result}))});
write('COVERAGE_BASELINE_R2.md',`# Coverage baseline R2\n\nDevelopment: ${dev.filter(r=>r.coverage===classes[0]).length}/${dev.length} request fixtures produce concrete positive proposals; three hybrid-taper requests remain HOLD. This is development conformance, not representative V1 coverage or twelve dose laws.\n\nIndependent corpus: ${representative.length} frozen cases, ${repSchema.length} current-schema-valid inputs, ${representative.length-repSchema.length} contract/adapter-incomplete inputs. ${opportunities.length} independent positive opportunities; ${unresolved.length} remain unresolved.\n\n| Actual independent class | Count |\n|---|---:|\n${classes.map(c=>'| '+c+' | '+tally(representative)[c]+' |').join('\n')}\n\nNo KEEP/ASK/HOLD is counted as positive. Corpus facts/expectations were authored separately and frozen before evaluation. Missing semantic or transport facts are not silently completed. Rows/days/replays have separate denominators. Original ACF24 remains 6 positive /10KEEP/6ASK/2HOLD. This designed corpus does not establish population prevalence, efficacy or safety.\n`);
write('RUNTIME_R2_RESULTS.md',`# Runtime R2 results\n\n${rows.length} R2 evaluation rows / ${unique.length} unique logical inputs replayed; ${legacy.evaluationRows}/${legacy.uniqueLogicalEvaluations} legacy rows/unique inputs rerun against the integrated runtime. ${trajectories.length} R2 trajectories include two establishment weeks with observed response→week2 KEEP, three four-week observation streams and four seven-day stress streams.\n\nOfficial-plan mutations:0; applied effects:0; identical-input flips:0; unsupported-noise prescriptions:0; accidental prescription cascades in the three scripted adoption streams:0.\n\nThese are finite synthetic conformance results. Current necessity, adequate essential intent, tolerance and calibration are supplied adjudicated context facts; this runtime does not autonomously infer those facts. Scripted compatibility is not physiology, efficacy, safety or real athlete adherence. Every input/result is saved in RUNTIME_R2_TRACES.json for replay.\n`);
console.log(JSON.stringify({rows:rows.length,unique:unique.length,development:tally(dev),representative:tally(representative),representativeSchemaValid:repSchema.length,legacyRows:legacy.evaluationRows}));
