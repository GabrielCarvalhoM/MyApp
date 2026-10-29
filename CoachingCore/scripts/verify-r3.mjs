import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash,clone} from '../src/value.mjs';
import {evaluateShadow,ShadowJournal} from '../src/index.mjs';
import {evaluateCanonicalShadow,CanonicalShadowJournal} from '../src/r3-runtime.mjs';
import {normalizeRepresentative,validateCanonical,fact} from '../src/r3-input.mjs';
import {assessMaterialConsumption} from '../src/r3-consumption.mjs';

const core=path.resolve(import.meta.dirname,'..'),root=path.dirname(core),out=path.join(core,'r3'),audit='audits/domain-closure-r3-2026-10-24';
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const rawHash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const write=(name,v)=>fs.writeFileSync(path.join(out,name),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const checks=[];
function check(name,fn){try{const evidence=fn();checks.push({name,status:'PASS',evidence});}catch(e){checks.push({name,status:'FAIL',error:e.message});}}
function run(script){const r=spawnSync(process.execPath,[script],{cwd:core,encoding:'utf8',maxBuffer:40_000_000});assert.equal(r.status,0,r.stderr||r.stdout);return r.stdout;}
check('current_all_legacy_R2_R3_tests',()=>{
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:core,encoding:'utf8',maxBuffer:40_000_000});
 write('TEST_RESULTS_CURRENT.tap',(r.stdout??'')+(r.stderr??''));assert.equal(r.status,0,'Current tests failed; see TEST_RESULTS_CURRENT.tap');
 const tests=Number(r.stdout.match(/# tests (\d+)/)?.[1]),passed=Number(r.stdout.match(/# pass (\d+)/)?.[1]),failed=Number(r.stdout.match(/# fail (\d+)/)?.[1]);assert.ok(tests>=209);assert.equal(passed,tests);assert.equal(failed,0);
 return {command:'node --test --test-reporter=tap',node:process.version,exitCode:r.status,tests,passed,failed,raw:'CoachingCore/r3/TEST_RESULTS_CURRENT.tap',sha256:rawHash('CoachingCore/r3/TEST_RESULTS_CURRENT.tap')};
});
check('current_reproducible_simulation_and_reports',()=>{
 const sim=run('scripts/simulate-r3.mjs'),report=run('scripts/report-r3.mjs');write('SIMULATION_CURRENT.log',sim+report);
 return {commands:['node scripts/simulate-r3.mjs','node scripts/report-r3.mjs'],exitCodes:[0,0],raw:'CoachingCore/r3/SIMULATION_CURRENT.log'};
});
check('frozen_source_and_independent42_forensics',()=>{
 const c=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),m=load(audit+'/before/MANIFEST.json'),a=load('CoachingCore/r3/REPRESENTATIVE_CORPUS_FORENSICS_R3.json');
 assert.equal(rawHash('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),m.entries.find(e=>e.path==='CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json').sha256);assert.equal(hash(c.cases),c.corpusContentSha256);assert.equal(c.cases.length,42);assert.equal(a.cases.length,42);assert.equal(new Set(a.cases.map(c=>c.caseId)).size,42);
 for(const row of a.cases){assert.ok(row.primaryBlocker.code&&row.primaryBlocker.label);assert.ok(Array.isArray(row.secondaryBlockers));assert.ok(row.providedFacts&&row.runtimeCurrentlyExpects&&row.legitimateDerivations&&row.mustBeExplicitOrReviewed);assert.equal(row.sourceFactsSha256,hash(c.cases.find(c=>c.caseId===row.caseId).scenarioFacts));}
 return {cases:42,forensicRows:42,sourceCorpusRawHash:rawHash('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),sourceCasesHash:c.corpusContentSha256,sourceExpectationsUnchanged:true};
});
check('canonical42_lossless_typed_material_consumption_and_scope',()=>{
 const source=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),inputs=load('CoachingCore/r3/NORMALIZED_REPRESENTATIVE_CORPUS_R3.json').inputs,results=load('CoachingCore/r3/REPRESENTATIVE_RUNTIME_TRACES_R3.json').rows,journal=new CanonicalShadowJournal();
 assert.equal(inputs.length,42);assert.equal(results.length,42);let normal=0,clinical=0,positive=0;
 for(const c of source.cases){const input=inputs.find(i=>i.source.caseId===c.caseId);assert.deepEqual(input,normalizeRepresentative(c));assert.equal(validateCanonical(input).valid,true);assert.deepEqual(fact(input,''),c.scenarioFacts);assert.equal(input.source.factsHash,hash(c.scenarioFacts));assert.equal(input.adapter.blocked,false);
  const before=hash(input),result=journal.record(input).result,d=result.shadowDecision;assert.equal(hash(input),before);assert.deepEqual(journal.record(input).result,result);assert.equal(journal.record(input).duplicate,true);assert.deepEqual(result,results.find(r=>r.caseId===c.caseId).result);assert.deepEqual(result.appliedState,result.officialPlanState);assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');assert.ok(d.trace.adapterTrace.length);assert.ok(d.trace.reads.length);assert.equal(d.inputHash,before);
  if(d.coverage==='CLINICAL_OR_OUT_OF_SCOPE'){clinical++;assert.equal(d.decisionType,'CLINICAL_HUMAN_REQUIRED');assert.equal(d.candidate,null);}else {normal++;assert.equal(d.semanticConsumption.consumed,true);assert.equal(assessMaterialConsumption(input).valid,true);assert.ok(d.semanticConsumption.bindingAssessment.length);}
  if(d.coverage==='USEFUL_ASK'){assert.equal(d.semanticConsumption.schemaValid,true);assert.ok(d.missingInputs.length);assert.notEqual(d.unsupportedDependency,'MATERIAL_INPUT_CONTRACT');}
  if(d.decisionType==='MODIFY'){positive++;assert.ok(d.candidate&&d.policyRefs.length&&d.evidenceRefs.length&&d.requestedScopeSatisfied);assert.ok(d.scientificConditions);assert.ok(['R2-P14','R3-STEADY'].includes(d.policyRefs[0].id));}
 }
 assert.equal(normal,40);assert.equal(clinical,2);assert.equal(positive,2);assert.equal(journal.size,42);
 return {schemaValid:42,materialConsumableNormal:normal,clinical,positive,losslessFacts:42,deterministicInputDecisions:42,officialMutations:0,appliedEffects:0};
});
check('new_scientific_records_exact_targets_and_existing_R2_authority',()=>{
 const recordDoc=load(audit+'/reviews/ssctr-records.json'),records=recordDoc.records;assert.equal(records.length,2);
 const approved=records.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS'),abstain=records.filter(r=>r.disposition==='ABSTAIN');assert.equal(approved.length,1);assert.equal(abstain.length,1);assert.equal(approved[0].review_id,'R3-SSCTR-STEADY');assert.equal(abstain[0].review_id,'R3-SSCTR-STRIDES');
 for(const r of records){assert.equal(rawHash(r.target.artifact),r.target.sha256);assert.equal(r.reviewer.independent_of_target_author,true);assert.ok(r.claims.length&&r.literature_snapshot.sources.length);}
 const r2=load('CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json'),authority=load('CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json');assert.equal(authority.registryHash,hash(r2));assert.equal(authority.registryRawHash,rawHash('CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json'));for(const p of r2.policies)assert.equal(authority.policyHashes[p.policyId],hash(p));
 return {newRecords:2,newConditionalApprovals:1,newAbstentions:1,existingR2ConditionalApprovals:authority.records.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS').length,fullV1ScientificApproval:false};
});
check('single_queue_exact100_prefix_and_only_actual_approval',()=>{
 const before=load(audit+'/before/reviews__provisional-sports-science__2026-10-23__HUMAN_REVALIDATION_QUEUE.json'),q=load('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'),r=load(audit+'/reviews/ssctr-records.json').records.find(r=>r.review_id==='R3-SSCTR-STEADY');
 assert.equal(before.items.length,100);assert.equal(q.items.length,101);assert.deepEqual(q.items.slice(0,100),before.items);assert.deepEqual(q.funding_trigger,before.funding_trigger);const entry=q.items[100];assert.equal(entry.queue_id,'HQ-R3-STEADY');assert.equal(entry.decision_id,r.review_id);assert.equal(entry.decision_revision,r.review_revision);assert.deepEqual(entry.target,r.target);assert.deepEqual(entry.conditions,r.decision.conditions);assert.equal(entry.state,'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION');assert.ok(!q.items.some(x=>x.decision_id==='R3-SSCTR-STRIDES'));
 return {preserved:100,addedActualApprovals:1,total:101,fundingUnchanged:true,abstentionQueued:false};
});
function replayLegacy(file){
 const traces=load(file).traces,journal=new ShadowJournal();let positive=0;
 for(const t of traces){const before=hash(t.input),actual=evaluateShadow(t.input),expected=Object.fromEntries(['mode','officialPlanState','observedExecutionState','shadowDecision','appliedState'].map(k=>[k,t[k]]));assert.equal(hash(t.input),before);assert.deepEqual(actual,expected);assert.deepEqual(actual.appliedState,t.input.officialPlanState??null);assert.equal(actual.shadowDecision.applied,false);assert.equal(journal.record(t.input).duplicate,false);assert.equal(journal.record(t.input).duplicate,true);assert.deepEqual(evaluateShadow(t.input),actual);if(actual.shadowDecision.decisionType==='MODIFY')positive++;}
 return {uniqueInputs:traces.length,exactReplay:traces.length,positive,mutations:0,effects:0,flips:0};
}
check('all205_R2_and160_legacy_unique_saved_inputs_exact_replay',()=>{
 const r2=replayLegacy('CoachingCore/r2/RUNTIME_R2_TRACES.json'),legacy=replayLegacy('CoachingCore/r2/legacy-replay/RUNTIME_TRACE_EXAMPLES.json');assert.equal(r2.uniqueInputs,205);assert.equal(legacy.uniqueInputs,160);return {r2,legacy,total:365};
});
check('unchanged_legacy_R2_source_tests_registry_and_scientific_decisions',()=>{
 const old=load('audits/domain-closure-r2-2026-10-24/reviews/quality.json').targetHashes;
 const applicable=Object.entries(old).filter(([p])=>p.startsWith('CoachingCore/src/')||p.startsWith('CoachingCore/test/')||p==='CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json'||p==='CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json');assert.ok(applicable.length>=10);
 for(const [p,sha] of applicable)assert.equal(rawHash(p),sha,'Predecessor runtime/science source changed: '+p);
 return {exactPreservedFiles:applicable.length,defaultScriptChange:'R3 is the current mission; prior verifier remains preserved and labelled historical. Generated R2 report hash and mission locator staleness are recorded, not silently reapproved.'};
});
check('canonical84_multiday_multiweek_steps_replayed_no_propagation_or_noise',()=>{
 const doc=load('CoachingCore/r3/MULTIWEEK_STREAMS_R3.json');assert.equal(doc.streams.length,3);assert.equal(doc.rows,84);let count=0;
 for(const s of doc.streams){assert.equal(s.weeks,4);assert.equal(s.steps.length,28);for(const step of s.steps){const before=hash(step.input),actual=evaluateCanonicalShadow(step.input);assert.equal(hash(step.input),before);assert.deepEqual(actual,step.result);assert.deepEqual(actual.appliedState,actual.officialPlanState);assert.equal(actual.shadowDecision.applied,false);assert.deepEqual(evaluateCanonicalShadow(step.input),actual);assert.equal(step.noInferredRestoration,true);if([2,3,4,5,6].includes(step.day))assert.notEqual(actual.shadowDecision.decisionType,'MODIFY');if(step.day===6)assert.deepEqual(actual.observedExecutionState.actualWorkMinutes,[5,3]);count++;}}
 assert.equal(count,84);return {rows:84,streams:3,weeksEach:4,scriptedNotPhysiological:true,automaticRestoration:false,officialMutations:0,appliedEffects:0,flips:0};
});
check('honest_baseline_disjoint_classes_and_bound_denominators',()=>{
 const b=load('CoachingCore/r3/TRUE_COVERAGE_BASELINE_R3.json'),d=b.dashboard,a=b.amongSemanticConsumableNormal;
 assert.deepEqual(d,{REPRESENTATIVE_CASES_TOTAL:42,SCHEMA_VALID:42,SEMANTICALLY_CONSUMABLE:40,ADAPTER_BLOCKED:0,DOMAIN_BLOCKED:16,SCIENTIFICALLY_UNSUPPORTED:3,SUBSTANTIVE_ASK_REQUIRED:15,CLINICAL_OR_OUT_OF_SCOPE:2});assert.equal(Object.values(b.classes).reduce((a,v)=>a+v,0),42);assert.equal(Object.values(a).reduce((x,y)=>x+y,0),40);assert.equal(b.positiveCompetentCoaching.numerator,2);assert.equal(b.positiveCompetentCoaching.denominator,40);assert.equal(b.positiveCompetentCoaching.opportunityDenominator,23);assert.equal(b.transportAsk,0);assert.equal(b.adapterAndConsumerAuthoredAfterSeeingCorpus,true);assert.ok(b.interpretation.includes('not a new blinded holdout'));
 const before=load('CoachingCore/r3/PRE_EXPANSION_BASELINE_R3.json');assert.equal(before.positiveCompetentCoaching.numerator,1);assert.equal(before.dashboard.REPRESENTATIVE_CASES_TOTAL,42);
 return {dashboard:d,among:a,ratio:'2/40',positiveOpportunities:'2/23',beforeExpansion:'1/40',populationCoverageClaim:false};
});
function currentTargets(review){
 const targets=review.targetHashes??review.targets;assert.ok(targets,'Independent target manifest missing');
 const entries=Array.isArray(targets)?targets.map(t=>[t.path,t.sha256]):Object.entries(targets);assert.ok(entries.length>=3);
 for(const [p,sha] of entries)assert.equal(rawHash(p),sha,'Stale independent review: '+p);return entries;
}
check('fresh_independent_SSCTR_binding_and_actual_record_validation',()=>{
 const r=load(audit+'/reviews/ssctr-review.json');assert.equal(r.verdict,'PASS_BOUNDED_SCIENTIFIC_BINDING');assert.equal(r.independentOfPolicyAndRuntimeAuthors,true);const targets=currentTargets(r);assert.ok(targets.some(([p])=>p==='CoachingCore/src/r3-consumption.mjs'));
 const validation=load(audit+'/reviews/ssctr-schema-validation.json');assert.equal(validation.passed,true);assert.equal(validation.errors.length,0);
 return {review:audit+'/reviews/ssctr-review.json',targetsChecked:targets.length,verdict:r.verdict,actualValidator:audit+'/reviews/ssctr-schema-validation.json',humanOrEmpiricalValidation:false};
});
check('fresh_independent_Quality_core_measurement_and_verifier_gate',()=>{
 const r=load(audit+'/reviews/quality.json');assert.ok(['QUALITY_READY','QUALITY_READY_WITH_CONDITIONS','PASS'].includes(r.verdict));assert.equal(r.independent,true);const targets=currentTargets(r);assert.ok(targets.some(([p])=>p==='CoachingCore/scripts/verify-r3.mjs'));assert.ok(targets.some(([p])=>p==='CoachingCore/r3/FINAL_REPORT.md'));
 return {review:audit+'/reviews/quality.json',targetsChecked:targets.length,verdict:r.verdict};
});
check('all_requested_artifacts_readiness_and_explicit_scope',()=>{
 const files=['DOMAIN_CLOSURE_R3_REPORT.md','REPRESENTATIVE_CORPUS_FORENSICS_R3.md','REPRESENTATIVE_CORPUS_FORENSICS_R3.json','CANONICAL_COACHING_INPUT_R3_SCHEMA.json','INPUT_CONTRACT_R3.md','NORMALIZED_REPRESENTATIVE_CORPUS_R3.json','REPRESENTATIVE_RUNTIME_RESULTS_R3.md','REPRESENTATIVE_RUNTIME_RESULTS_R3.json','TRUE_COVERAGE_BASELINE_R3.md','TRUE_COVERAGE_BASELINE_R3.json','SOFTWARE_VS_DOMAIN_GAPS_R3.md','SOFTWARE_VS_DOMAIN_GAPS_R3.json','BOUNDED_POLICY_CANDIDATES_R3.json','POSITIVE_WITNESSES_R3.json','TAPER_PROFILES_R3.json','HUMAN_REVALIDATION_QUEUE_UPDATE_R3.json','OPEN_GAPS_R3.md','OPEN_GAPS_R3.json','TEST_RESULTS_CURRENT.tap','FINAL_REPORT.md'];for(const f of files)assert.ok(fs.statSync(path.join(out,f)).size>0,f);
 const v=load('CoachingCore/r3/READINESS_VERDICTS_R3.json');assert.equal(v.verdicts.NEXT_ENGINEERING_STEP,'DOMAIN_CLOSURE_R4');assert.equal(v.fullAutonomousRuntime,'NO_GO');for(const [k,val] of Object.entries(v.verdicts).filter(([k])=>!['NEXT_ENGINEERING_STEP','REPRESENTATIVE_INPUT_READINESS','RUNTIME_CONSUMPTION_READINESS'].includes(k)))assert.equal(val,'NOT_READY',k);
 return {artifactsChecked:files.length,verdicts:v.verdicts,fullAutonomousRuntime:v.fullAutonomousRuntime,UI:false,Figma:false,KMP:false,production:false,realUserMutation:false,ProductTruthPromotion:false};
});
const targets=['CoachingCore/src/r3-input.mjs','CoachingCore/src/r3-consumption.mjs','CoachingCore/src/r3-runtime.mjs','CoachingCore/src/r3-index.mjs','CoachingCore/scripts/simulate-r3.mjs','CoachingCore/scripts/report-r3.mjs','CoachingCore/scripts/verify-r3.mjs','CoachingCore/package.json','CoachingCore/test/r3-input.test.mjs','CoachingCore/test/r3-runtime.test.mjs','CoachingCore/r3/CANONICAL_COACHING_INPUT_R3_SCHEMA.json','CoachingCore/r3/INPUT_CONTRACT_R3.md','CoachingCore/r3/FINAL_REPORT.md',audit+'/reviews/ssctr-records.json',audit+'/reviews/ssctr-review.json',audit+'/reviews/quality.json'];
const artifactHashes=Object.fromEntries(targets.filter(p=>fs.existsSync(path.join(root,p))).map(p=>[p,rawHash(p)]));
const failed=checks.filter(c=>c.status!=='PASS'),verification={revision:'DCR3-VERIFICATION-1',executedAt:new Date().toISOString(),node:process.version,status:failed.length?'INCOMPLETE':'PASS',checks,artifactHashes,failed:failed.map(c=>({name:c.name,error:c.error})),verdicts:load('CoachingCore/r3/READINESS_VERDICTS_R3.json'),closureClaim:failed.length?'Required current evidence remains incomplete; do not claim mission closed':'Bounded R3 mission acceptance and independent gates satisfied; full autonomous/V1 readiness remains NOT_READY/NO_GO'};
write('VERIFICATION.json',verification);console.log(JSON.stringify({status:verification.status,checks:checks.length,failed:verification.failed,verdicts:verification.verdicts.verdicts}));if(failed.length)process.exitCode=1;
