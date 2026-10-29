import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
import {evaluateShadow} from '../src/index.mjs';
import {evaluateCoachingShadow} from '../src/r4-runtime.mjs';
import {normalizeRepresentative} from '../src/r3-input.mjs';
import {generateProgram} from '../src/r5-program.mjs';
import {simulateProgram} from '../src/r5-simulator.mjs';
import {evaluateHoldoutCase} from './evaluate-holdout-r5.mjs';
const root=path.resolve(import.meta.dirname,'../..'),core=path.join(root,'CoachingCore'),folder='CoachingCore/r5/',audit='audits/domain-coaching-r5-2026-10-25/';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const raw=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const checks=[],check=(name,fn)=>{try{checks.push({name,status:'PASS',evidence:fn()});}catch(e){checks.push({name,status:'FAIL',error:e.stack??e.message});}};
const reviewedCurrent=doc=>{assert.equal(doc.independent,true);for(const e of doc.reviewedFiles??[])assert.equal(raw(e.path),e.sha256,'Stale independent review '+e.path);};
check('Node24',()=>{assert.equal(Number(process.versions.node.split('.')[0]),24);return process.version;});
check('all_current_BSR_R2_R3_R4_R5_tests',()=>{
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:core,encoding:'utf8',maxBuffer:30_000_000});
 fs.writeFileSync(path.join(root,folder,'TEST_RESULTS_CURRENT.tap'),(r.stdout??'')+(r.stderr??''));assert.equal(r.status,0);
 const tests=Number(r.stdout.match(/# tests (\d+)/)?.[1]),passed=Number(r.stdout.match(/# pass (\d+)/)?.[1]);assert.ok(tests>=280);assert.equal(tests,passed);
 return {tests,passed,failed:0,command:'node --test --test-reporter=tap',log:folder+'TEST_RESULTS_CURRENT.tap',sha256:raw(folder+'TEST_RESULTS_CURRENT.tap')};
});
check('frozen_runtime_and_authority_unchanged',()=>{
 const f=read(folder+'RUNTIME_FREEZE_R5.json');for(const e of f.entries)assert.equal(raw(e.path),e.sha256,e.path);assert.equal(hash(f.entries),f.sourceDigest);return {sourceDigest:f.sourceDigest,files:f.entries.length,frozenAt:f.frozenAt};
});
check('preexisting_Core_and_frozen_R4_preserved',()=>{
 const baseline=read(audit+'BASELINE_MANIFEST.json'),exceptions=['CURRENT_MISSION.md','MISSION_LEDGER.md','CoachingCore/package.json','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'];let n=0;
 for(const e of baseline.entries){if(exceptions.includes(e.path))continue;assert.equal(raw(e.path),e.sha256,e.path);n++;}
 const scripts=read('CoachingCore/package.json').scripts;assert.equal(scripts.verify,'node scripts/verify-r5.mjs');assert.equal(scripts.simulate,'node scripts/simulate-r5.mjs');assert.equal(scripts['simulate:r4'],'node scripts/simulate-r4.mjs');return {preservedFiles:n,packageEntrypoints:'R5 defaults with explicit historical R4 aliases; test unchanged',documentedSupersession:folder+'CONFORMANCE_SUPERSESSION_R5.md'};
});
check('historical_legacy_R2_exact_replay',()=>{
 let n=0;for(const file of ['CoachingCore/r2/RUNTIME_R2_TRACES.json','CoachingCore/r2/legacy-replay/RUNTIME_TRACE_EXAMPLES.json']){
  const d=read(file),rows=Array.isArray(d.traces)?d.traces:Object.values(d.traces);
  for(const row of rows){const input=row.input??row.runtimeInput;if(!input)continue;const expected=row.result??row.output??Object.fromEntries(['mode','officialPlanState','observedExecutionState','shadowDecision','appliedState'].map(k=>[k,row[k]]));assert.deepEqual(evaluateShadow(input),expected);n++;}
 }assert.equal(n,365);return {exactHistoricalInputs:n};
});
check('all_66_R4_results_exact_and_frozen40_facts_intact',()=>{
 const rows=read('CoachingCore/r4/R4_RUNTIME_TRACES.json').rows;assert.equal(rows.length,66);for(const r of rows)assert.deepEqual(evaluateCoachingShadow(r.input),r.result);
 const c=read('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json');assert.equal(c.cases.length,42);assert.equal(hash(c.cases),c.corpusContentSha256);for(const x of c.cases)normalizeRepresentative(x);
 return {currentExactR4Decisions:66,frozen42Hash:c.corpusContentSha256};
});
check('science_current_frozen_binding_and_single_queue',()=>{
 const r=read(audit+'reviews/ssctr-binding-review.json');reviewedCurrent(r);assert.equal(r.finalFrozenRuntimeReview,true);assert.equal(r.verdict,'PASS_WITH_CONDITIONS');assert.equal(r.sourceDigest,read(folder+'RUNTIME_FREEZE_R5.json').sourceDigest);
 const validation=read(audit+'reviews/ssctr-schema-validation.json');assert.equal(validation.passed,true);assert.equal(validation.actualGlobalQueueMergeObserved,true);
 const before=read(audit+'HUMAN_QUEUE_BEFORE.json'),queue=read('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');assert.equal(before.items.length,110);assert.equal(queue.items.length,114);for(const item of before.items)assert.deepEqual(queue.items.find(i=>i.queue_id===item.queue_id),item);
 assert.equal(queue.funding_trigger.state,'NOT_DECLARED');return {scientificRecords:4,probes:read(audit+'reviews/ssctr-binding-probes.json').total,queueBefore:110,queueAdded:4,queueTotal:114};
});
check('independent_frozen_engineering_current',()=>{
 const r=read(audit+'reviews/quality-frozen-review.json');assert.equal(r.sourceDigest,read(folder+'RUNTIME_FREEZE_R5.json').sourceDigest);assert.equal(r.independent,true);assert.equal(r.sourceIntegrity,true);return {review: audit+'reviews/quality-frozen-review.json',sha256:raw(audit+'reviews/quality-frozen-review.json')};
});
check('no_runtime_corpus_or_expectation_coupling',()=>{
 const files=fs.readdirSync(path.join(core,'src')).filter(n=>/^r5-.*\.mjs$/.test(n));for(const f of files){const t=fs.readFileSync(path.join(core,'src',f),'utf8');assert.ok(!/from\s+['"][^'"]*(?:holdout|fixtures|CORPUS|RESULTS|expected)|readFileSync\([^)]*(?:holdout|CORPUS|RESULTS)|R5-HO-\d/.test(t),f);}
 return files;
});
check('whole_program_trajectories_replay_and_invariants',()=>{
 const data=read(folder+'SIMULATION_RESULTS_R5.json'),lengths=new Set();let weeks=0,sessions=0,actuals=0,mutations=0;
 for(const row of data.trajectories){
  const r=simulateProgram(row.input,row.eventFixtures);assert.deepEqual(r,row.result);lengths.add(r.rows.length);weeks+=r.rows.length;sessions+=r.summary.sessionsPlanned;actuals+=r.summary.actualExecutions;mutations+=r.summary.mutations;
  assert.equal(r.summary.officialMutations,0);assert.equal(r.summary.completedRewrites,0);assert.ok(r.summary.maximumRunMinutes<=Math.max(...row.input.athlete.anchors.filter(a=>a.prescription.modality==='RUN').map(a=>a.prescription.durationMinutes))*row.input.athlete.anchors.filter(a=>a.prescription.modality==='RUN').length);
  assert.ok(r.rows.every(x=>x.decision.horizonsConsidered.length===4));assert.ok(!r.rows.every(x=>x.decision.status==='HOLD'));assert.ok(r.summary.mutations<=1,'Unexpected adaptation cascade');
  for(const w of r.finalProgram.weeks){assert.equal(r.finalProgram.blocks.filter(b=>w.index>=b.startWeek&&w.index<b.endWeekExclusive).length,1);for(const s of w.sessions)assert.equal(s.plannedPrescriptionHash,hash(s.prescription));}
 }
 assert.deepEqual([...lengths].sort((a,b)=>a-b),[4,8,12,16]);return {trajectories:data.trajectories.length,weeks,sessions,actuals,mutations,physiologicalPredictions:0};
});
check('fresh_independent_holdout_sealed_after_freeze',()=>{
 const f=read(folder+'RUNTIME_FREEZE_R5.json'),m=read(folder+'holdout/INDEPENDENCE_MANIFEST.json'),c=read(folder+'holdout/R5_INDEPENDENT_HOLDOUT.json'),first=read(folder+'holdout/FIRST_EVALUATION.json');
 assert.equal(raw(folder+'holdout/R5_INDEPENDENT_HOLDOUT.json'),m.corpusSha256);assert.equal(m.runtimeInspectedBeforeSeal,false);assert.equal(m.engineImplementationByAuthor,false);assert.equal(m.outputsInspectedBeforeSeal,false);assert.equal(first.corpusSha256,m.corpusSha256);assert.equal(first.sourceDigest,f.sourceDigest);assert.equal(first.firstEvaluation,true);assert.equal(c.cases.length,24);assert.equal(first.rows.length,24);
 assert.ok(Date.parse(m.authorStartedAt??m.startedAt)>Date.parse(f.frozenAt));assert.ok(Date.parse(first.evaluatedAt)>=Date.parse(m.sealedAt));return {cases:24,corpusSha256:m.corpusSha256,authorStartedAt:m.authorStartedAt??m.startedAt,firstEvaluationAt:first.evaluatedAt};
});
check('first_holdout_results_exact_replay_no_retuning',()=>{
 const c=read(folder+'holdout/R5_INDEPENDENT_HOLDOUT.json'),first=read(folder+'holdout/FIRST_EVALUATION.json');let generated=0,reviewed=0;
 for(const item of c.cases){const stored=first.rows.find(r=>r.caseId===item.caseId);assert.equal(stored.error,null,'First evaluation contract/runtime error '+item.caseId);assert.deepEqual(evaluateHoldoutCase(item),stored.output);if(stored.output.generation.program)generated++;reviewed+=stored.output.steps.length;}
 return {cases:c.cases.length,generated,materialReviewSteps:reviewed,firstRawSha256:raw(folder+'holdout/FIRST_EVALUATION.json'),runtimeChangesSinceFirstEvaluation:0};
});
check('independent_coaching_quality_complete_and_current',()=>{
 const q=read(audit+'reviews/quality-holdout-review.json');reviewedCurrent(q);assert.equal(q.sourceDigest,read(folder+'RUNTIME_FREEZE_R5.json').sourceDigest);assert.equal(q.firstEvaluationSha256,raw(folder+'holdout/FIRST_EVALUATION.json'));assert.equal(q.cases.length,24);assert.equal(new Set(q.cases.map(c=>c.caseId)).size,24);
 for(const c of q.cases)assert.ok(['BEST_SUPPORTED','ACCEPTABLE_ALTERNATIVE','SUBOPTIMAL','INSUFFICIENT_INFORMATION','UNSUPPORTED'].includes(c.quality));
 return {counts:Object.fromEntries(['BEST_SUPPORTED','ACCEPTABLE_ALTERNATIVE','SUBOPTIMAL','INSUFFICIENT_INFORMATION','UNSUPPORTED'].map(k=>[k,q.cases.filter(c=>c.quality===k).length])),reviewSha256:raw(audit+'reviews/quality-holdout-review.json')};
});
check('requested_deliverable_files_present_and_json_valid',()=>{
 const required=['WHOLE_PROGRAM_COACHING_ARCHITECTURE','PROGRAM_MODEL_R5','HORIZON_REASONING_R5','RUN_PROGRAMMING_R5','STRENGTH_PROGRAMMING_R5','HYBRID_PROGRAMMING_R5','FIRST_PRESCRIPTION_R5','ADAPTIVE_PROGRAM_COACHING_R5','ATHLETE_LEARNING_MODEL_R5','COUNTERFACTUAL_DECISION_MODEL_R5','OPEN_GAPS_R5'];
 for(const name of required){assert.ok(fs.existsSync(path.join(root,folder,name+'.md')));read(folder+name+'.json');}
 read(folder+'READINESS_VERDICTS_R5.json');assert.ok(fs.readFileSync(path.join(root,folder,'FINAL_REPORT.md'),'utf8').includes('DOMAIN_COACHING_R6'));return {pairedContracts:required.length};
});
const result={revision:'R5-VERIFY-1',verifiedAt:new Date().toISOString(),node:process.version,sourceDigest:read(folder+'RUNTIME_FREEZE_R5.json').sourceDigest,objectiveChecksPassing:checks.every(c=>c.status==='PASS'),checks,passing:checks.filter(c=>c.status==='PASS').length,total:checks.length,scope:'Objective evidence for delivered bounded offline reference. Broad R5 Definition of Done and production readiness are separately assessed; a green checker is not clinical/empirical validation.'};
fs.writeFileSync(path.join(root,folder,'VERIFICATION.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passing:result.passing,total:result.total,failed:checks.filter(c=>c.status==='FAIL').map(c=>({name:c.name,error:c.error.split('\n')[0]}))}));process.exitCode=result.objectiveChecksPassing?0:1;
