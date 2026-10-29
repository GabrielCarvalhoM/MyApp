import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {hash,clone} from '../src/value.mjs';
import {normalizeRepresentative,validateCanonical} from '../src/r3-input.mjs';
import {evaluateCanonicalShadow,CanonicalShadowJournal,COVERAGE_CLASSES} from '../src/r3-runtime.mjs';

const core=path.resolve(import.meta.dirname,'..'),root=path.dirname(core),out=path.join(core,'r3');
fs.mkdirSync(out,{recursive:true});
const load=p=>JSON.parse(fs.readFileSync(path.join(core,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(out,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const corpus=load('r2/evaluation/REPRESENTATIVE_CORPUS_R2.json');
assert.equal(hash(corpus.cases),corpus.corpusContentSha256);
const baselineOnly=process.argv.includes('--baseline-only');
const rows=[],journal=new CanonicalShadowJournal();
for(const c of corpus.cases){
 const input=normalizeRepresentative(c),before=hash(input),schema=validateCanonical(input),result=journal.record(input,{enableExpansion:!baselineOnly}).result,d=result.shadowDecision;
 assert.equal(hash(input),before);assert.deepEqual(result.appliedState,result.officialPlanState);assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');assert.deepEqual(evaluateCanonicalShadow(input,{enableExpansion:!baselineOnly}),result);assert.equal(journal.record(input,{enableExpansion:!baselineOnly}).duplicate,true);
 if(d.decisionType==='MODIFY')assert.ok(d.candidate&&d.policyRefs.length&&d.evidenceRefs.length&&d.scientificConditions&&d.requestedScopeSatisfied);
 rows.push({caseId:c.caseId,title:c.title,gap:c.gap,targetCategory:c.independentExpectation.targetCategory,sourceFactsHash:hash(c.scenarioFacts),schemaValid:schema.valid,schemaErrors:schema.errors,input,result});
}
assert.equal(rows.length,42);
const classes=Object.fromEntries(COVERAGE_CLASSES.map(k=>[k,rows.filter(r=>r.result.shadowDecision.coverage===k).length]));
const normal=rows.filter(r=>r.result.shadowDecision.coverage!=='CLINICAL_OR_OUT_OF_SCOPE'),consumable=normal.filter(r=>r.result.shadowDecision.semanticConsumption.consumed);
const c=k=>classes[k]??0;
const dashboard={REPRESENTATIVE_CASES_TOTAL:42,SCHEMA_VALID:rows.filter(r=>r.schemaValid).length,SEMANTICALLY_CONSUMABLE:consumable.length,ADAPTER_BLOCKED:rows.filter(r=>r.result.shadowDecision.coverage==='NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP').length,DOMAIN_BLOCKED:c('NOT_SUPPORTED_DOMAIN_GAP'),SCIENTIFICALLY_UNSUPPORTED:c('NOT_SUPPORTED_SCIENCE_GAP'),SUBSTANTIVE_ASK_REQUIRED:c('USEFUL_ASK'),CLINICAL_OR_OUT_OF_SCOPE:c('CLINICAL_OR_OUT_OF_SCOPE')};
const cc=k=>consumable.filter(r=>r.result.shadowDecision.coverage===k).length;
const among={POSITIVE:cc('POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED'),KEEP:cc('SUPPORTED_KEEP'),USEFUL_ASK:cc('USEFUL_ASK'),HOLD:cc('CORRECT_ABSTAIN_OR_HOLD'),NOT_SUPPORTED_DOMAIN:cc('NOT_SUPPORTED_DOMAIN_GAP'),NOT_SUPPORTED_SCIENCE:cc('NOT_SUPPORTED_SCIENCE_GAP')};
const facets=Object.fromEntries(['planning','run_prescription','strength_prescription','adaptation','recovery_readiness','return','taper_event','athlete_learning'].map(f=>[f,[]]));
for(const r of rows){
 const f=corpus.cases.find(c=>c.caseId===r.caseId).scenarioFacts,k=f.currentDemand.kind;
 const tags=[];
 if(r.gap==='ACF-G01')tags.push('planning');
 if(r.gap==='ACF-G05'||k==='FIRST_RUN_SESSION')tags.push('run_prescription');
 if(k==='FIRST_STRENGTH_SESSION'||k==='NEXT_STRENGTH_SESSION'||k==='EQUIPMENT_SUBSTITUTION')tags.push('strength_prescription');
 if(r.gap==='ACF-G02')tags.push('adaptation');
 if(['LOCAL_FATIGUE','SYSTEMIC_FATIGUE','REVIEW_SESSION','DAY_AFTER_EVENT'].includes(k))tags.push('recovery_readiness');
 if(r.gap==='ACF-G03')tags.push('return');
 if(r.gap==='ACF-G04')tags.push('taper_event');
 if(r.gap==='ATHLETE_SPECIFIC_LEARNING')tags.push('athlete_learning');
 for(const tag of tags)facets[tag].push(r);
}
const byFacet=Object.fromEntries(Object.entries(facets).map(([f,rs])=>[f,{cases:rs.length,normal:rs.filter(r=>r.result.shadowDecision.semanticConsumption.normal).length,classes:Object.fromEntries(COVERAGE_CLASSES.map(k=>[k,rs.filter(r=>r.result.shadowDecision.coverage===k).length])),caseIds:rs.map(r=>r.caseId)}]));
const positiveOpportunities=rows.filter(r=>r.targetCategory==='POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED');
const baseline={revision:baselineOnly?'DCR3-PRE-EXPANSION-1':'DCR3-BASELINE-1',sourceCorpus:corpus.corpusId,sourceVersion:corpus.version,sourceCorpusHash:corpus.corpusContentSha256,independentSourceFactsAndExpectationsUnchanged:true,adapterAndConsumerAuthoredAfterSeeingCorpus:true,interpretation:'Independent designed challenge set reused after implementation; not a new blinded holdout, population estimate, efficacy or safety study',dashboard,amongSemanticConsumableNormal:among,classes,coverageByFacet:byFacet,denominators:{all:42,normal:normal.length,semanticConsumableNormal:consumable.length,normalWithoutSubstantiveMissingInputs:consumable.length-c('USEFUL_ASK'),positiveOpportunities:positiveOpportunities.length},positiveCompetentCoaching:{numerator:among.POSITIVE,denominator:consumable.length,ratio:among.POSITIVE+'/'+consumable.length,scope:'Whole requested task only, within exact finite approved context. KEEP/ASK/HOLD and partial subtask opportunities are not positive.',opportunityNumerator:positiveOpportunities.filter(r=>r.result.shadowDecision.coverage===COVERAGE_CLASSES[0]).length,opportunityDenominator:positiveOpportunities.length},unresolvedPositiveOpportunities:positiveOpportunities.filter(r=>r.result.shadowDecision.coverage!==COVERAGE_CLASSES[0]).map(r=>({caseId:r.caseId,coverage:r.result.shadowDecision.coverage,dependency:r.result.shadowDecision.unsupportedDependency,missing:r.result.shadowDecision.missingInputs})),transportAsk:rows.filter(r=>r.result.shadowDecision.decisionType==='ASK'&&r.result.shadowDecision.coverage!==COVERAGE_CLASSES[2]).length,consumptionDefinition:'Normal case with valid typed canonical input, recognized request/population and trace of material facts used in an eligibility/missing/domain/science/decision branch. Missing inputs can be understood without being supplied; this is not dose-readiness. Two clinical cases are schema-valid and evaluated but excluded from normal40.',metricOverlap:'Dashboard DOMAIN/SCIENCE/ASK are disjoint final case dispositions. SCHEMA_VALID and SEMANTICALLY_CONSUMABLE are pipeline measures and overlap those dispositions. Facets overlap; do not sum them.',rawDecisionCounts:Object.fromEntries(['MODIFY','KEEP','ASK','HOLD','NOT_SUPPORTED_YET','CLINICAL_HUMAN_REQUIRED'].map(t=>[t,rows.filter(r=>r.result.shadowDecision.decisionType===t).length]))};
const concise=rows.map(r=>({caseId:r.caseId,title:r.title,gap:r.gap,targetCategory:r.targetCategory,schemaValid:r.schemaValid,inputHash:r.result.shadowDecision.inputHash,coverage:r.result.shadowDecision.coverage,decisionType:r.result.shadowDecision.decisionType,semanticConsumption:r.result.shadowDecision.semanticConsumption,rationale:r.result.shadowDecision.rationale,missingInputs:r.result.shadowDecision.missingInputs,dependency:r.result.shadowDecision.unsupportedDependency,policyRefs:r.result.shadowDecision.policyRefs,readPaths:[...new Set(r.result.shadowDecision.trace.reads.map(p=>p.path))],adapterWarnings:r.input.adapter.warnings,adapterConflicts:r.input.adapter.conflicts}));
if(baselineOnly){
 write('PRE_EXPANSION_BASELINE_R3.json',{recordedAt:new Date().toISOString(),...baseline});write('PRE_EXPANSION_RESULTS_R3.json',concise);
}else{
 write('NORMALIZED_REPRESENTATIVE_CORPUS_R3.json',{revision:'R3-NORMALIZED-1',sourceCorpusHash:corpus.corpusContentSha256,inputs:rows.map(r=>r.input)});
 write('REPRESENTATIVE_RUNTIME_TRACES_R3.json',{revision:'R3-TRACES-1',rows});
 write('REPRESENTATIVE_RUNTIME_RESULTS_R3.json',{revision:'R3-RESULTS-1',dashboard,results:concise});
 write('TRUE_COVERAGE_BASELINE_R3.json',baseline);
 const table=Object.entries(dashboard).map(([k,v])=>'| '+k+' | '+v+' |').join('\n');
 const table2=Object.entries(among).map(([k,v])=>'| '+k+' | '+v+' |').join('\n');
 write('TRUE_COVERAGE_BASELINE_R3.md',`# True coverage baseline R3\n\nR2→R3 reuses the same42 designed synthetic facts/expectations, not a population sample or newly blinded holdout. Runtime authors saw the corpus. Source corpus hash: ${corpus.corpusContentSha256}.\n\n| Pipeline measure | Count |\n|---|---:|\n${table}\n\nSchema-valid42 does not mean dose-ready42. Semantic consumption includes identifying substantive missing facts; normal denominator excludes the2 clinical cases.\n\n| Among ${consumable.length} consumable normal cases | Count |\n|---|---:|\n${table2}\n\nPositive competent whole-request coaching: **${among.POSITIVE}/${consumable.length}**; independent positive opportunities: **${baseline.positiveCompetentCoaching.opportunityNumerator}/${positiveOpportunities.length}**. No partial run proposal counts as a complete hybrid week. Transport ASK=${baseline.transportAsk}. KEEP/ASK/HOLD are separate from positive coverage.\n\nR2:8 schema-valid,34 contract-incomplete,1 positive across42. R2's6 reported useful ASK were classified by schema validity; R3 rechecks substantive usefulness. R2's8 should not be read as an audited dose-ready denominator. R3 final category counts are disjoint; pipeline counts and facets overlap.\n\n${Object.entries(byFacet).map(([k,v])=>'- '+k+': '+v.cases+' designed cases; '+v.classes[COVERAGE_CLASSES[0]]+' positive; '+v.classes[COVERAGE_CLASSES[1]]+' KEEP; '+v.classes[COVERAGE_CLASSES[2]]+' useful ASK.').join('\n')}\n\nIndividual facts, group science, internal approval and actual response remain separate. No empirical validation, real-user prescription or autonomous coaching readiness is claimed.\n`);
 write('REPRESENTATIVE_RUNTIME_RESULTS_R3.md',`# Representative runtime results R3\n\nEvery row has its normalized input, complete decision, adapter trace and consulted facts in the JSON trace artifact. Source cases remain frozen.\n\n| Case | Schema | Actual coverage | Dependency / missing information |\n|---|---|---|---|\n${concise.map(r=>'| '+r.caseId+' | '+r.schemaValid+' | '+r.coverage+' | '+(r.dependency??'—')+' '+r.missingInputs.join(', ')+' |').join('\n')}\n`);
 const gaps=concise.filter(r=>['NOT_SUPPORTED_DOMAIN_GAP','NOT_SUPPORTED_SCIENCE_GAP','NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP','USEFUL_ASK'].includes(r.coverage)).map(r=>({...r,owner:r.coverage==='USEFUL_ASK'?'INPUT_PROVIDER_AND_TRAINING_POLICY':r.coverage==='NOT_SUPPORTED_SCIENCE_GAP'?'TRAINING_POLICY_AND_INDEPENDENT_SSCTR':'DOMAIN_ENGINEERING_AND_SSCTR',closureTrigger:r.coverage==='USEFUL_ASK'?'Supply current task-specific missing facts without invention; reassess exact binding':'Provide explicit applicable finite recipe/semantic contract, independent evidence and runtime proof; no aliasing of different doses'}));
 write('SOFTWARE_VS_DOMAIN_GAPS_R3.json',{revision:'DCR3-GAPS-1',dashboard,gaps});write('OPEN_GAPS_R3.json',{revision:'DCR3-GAPS-1',fullAutonomousRuntime:'NO_GO',gaps});
 const gapText=`# Open software, domain and science gaps R3\n\nNo adapter/schema blocker is silently counted as useful ASK or domain incapacity. An explicit schema can represent missing facts, not supply them.\n\n${gaps.map(g=>'## '+g.caseId+' — '+g.coverage+'\n\n'+g.rationale+'\n\nOwner: '+g.owner+'. Trigger: '+g.closureTrigger+'. Missing: '+(g.missingInputs.join(', ')||'independent exact binding')+'.\n').join('\n')}\nHybrid taper remains three separate profiles: Run-first10K, Run-first half-marathon, Balanced with temporary event priority. Familiar components do not establish their combined week. No universal hybrid taper or maintenance efficacy is approved.\n`;
 write('SOFTWARE_VS_DOMAIN_GAPS_R3.md',gapText);write('OPEN_GAPS_R3.md',gapText);
 const streams=[];
 for(const priority of ['RUN_FIRST','STRENGTH_FIRST','BALANCED']){
  const steps=[];
  for(let week=1;week<=4;week++)for(let day=0;day<7;day++){
   const original=corpus.cases[[31,31,19,31,31,10,14][day]-1],record=clone(original);
   record.caseId=`STREAM-${priority}-W${week}-D${day+1}`;record.corpusId='R3-SCRIPTED-STREAMS';record.corpusVersion='R3-STREAM-1';
   record.scenarioFacts.population.priority=priority;
   if(day===1)record.scenarioFacts.observations={response:'INCOMPATIBLE',currentFunction:'limited training tolerance'};
   if(day===3)record.scenarioFacts.eligibility.status='UNKNOWN';
   if(day===4)record.scenarioFacts.observations={clinicalConcern:true};
   record.scenarioFactsSha256=hash(record.scenarioFacts);
   const input=normalizeRepresentative(record),h=hash(input),result=evaluateCanonicalShadow(input);
   assert.equal(hash(input),h);assert.equal(result.shadowDecision.applied,false);assert.deepEqual(result.appliedState,result.officialPlanState);assert.deepEqual(evaluateCanonicalShadow(input),result);
   if([1,2,3,4,5].includes(day))assert.notEqual(result.shadowDecision.decisionType,'MODIFY');
   if(day===5)assert.deepEqual(result.observedExecutionState.actualWorkMinutes,[5,3]);
   steps.push({week,day:day+1,renewedExplicitSyntheticContext:day===0,noInferredRestoration:true,input,result});
  }
  streams.push({priority,weeks:4,days:28,steps});
 }
 write('MULTIWEEK_STREAMS_R3.json',{revision:'R3-STREAM-1',streams,rows:84,scriptedInputContextsNotPhysiologicalModel:true,sourceCasesExcludedFromRepresentativeDenominator:true,carriedActualEffects:0,officialMutations:0,appliedEffects:0,identicalInputFlips:0,unsupportedNoisePrescriptions:0,limitations:'Weeks/day indexes are scenario labels, not inferred dates. Each input states its own synthetic current facts. No physiological simulation, autonomous learning, capacity restoration or plan application occurs.'});
 write('MULTIWEEK_STREAMS_R3.md','# Canonical multiweek streams R3\n\nThree explicit priority profiles × four weeks × seven labelled days =84 evaluations. Familiar request, incompatible current context, nonclinical pause, unknown eligibility, clinical concern, partial completed work and confirmed optional omission are exercised through normalization and the semantic consumer. Each next context is supplied, never physiologically inferred. All invariant assertions run in simulate-r3.mjs. These84 rows are not extra representative cases or empirical athlete trajectories.\n');
}
console.log(JSON.stringify({baselineOnly,dashboard,among,positive:baseline.positiveCompetentCoaching,classes}));
