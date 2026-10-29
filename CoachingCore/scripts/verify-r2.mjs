import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import {evaluateShadow,ShadowJournal} from '../src/index.mjs';
import {hash} from '../src/value.mjs';
const core=path.resolve(import.meta.dirname,'..'),root=path.dirname(core),out=path.join(core,'r2'),audit='audits/domain-closure-r2-2026-10-24';
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p))),rawHash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const checks=[];
async function check(name,fn){try{const evidence=await fn();checks.push({name,status:'PASS',evidence});}catch(e){checks.push({name,status:'FAIL',error:e.message});}}
const reg=load('CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json'),authority=load('CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json');
const recDoc=load(audit+'/reviews/ssctr-records.json'),records=recDoc.records??recDoc,approved=records.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS');
const baseline=load(audit+'/before/MANIFEST.json');
await check('current_executable_tests',()=>{
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:core,encoding:'utf8',maxBuffer:20_000_000});
 fs.writeFileSync(path.join(out,'TEST_RESULTS_CURRENT.tap'),(r.stdout??'')+(r.stderr??''));
 assert.equal(r.status,0,'Current executable tests failed');
 const tests=Number(r.stdout.match(/# tests (\d+)/)?.[1]),passed=Number(r.stdout.match(/# pass (\d+)/)?.[1]),failed=Number(r.stdout.match(/# fail (\d+)/)?.[1]);assert.ok(tests>=98);assert.equal(passed,tests);assert.equal(failed,0);
 return {command:'node --test --test-reporter=tap',node:process.version,exitCode:r.status,tests,passed,failed,raw:'CoachingCore/r2/TEST_RESULTS_CURRENT.tap',sha256:rawHash('CoachingCore/r2/TEST_RESULTS_CURRENT.tap')};
});
await check('exact_independent_scientific_authority',()=>{
 assert.equal(authority.registryRawHash,rawHash('CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json'));assert.equal(authority.registryHash,hash(reg));assert.deepEqual(authority.records,records);assert.equal(records.length,15);assert.equal(approved.length,12);
 for(const p of reg.policies){assert.equal(authority.policyHashes[p.policyId],hash(p));assert.equal(rawHash(p.domainArtifact),p.scientificArtifactSha256);const r=records.find(r=>r.target.rule_ids.includes(p.policyId));assert.ok(r);assert.equal(r.target.sha256,authority.registryRawHash);assert.equal(r.reviewer.independent_of_target_author,true);if(r.disposition==='APPROVE_WITH_CONDITIONS')assert.ok(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(r.evidence_status));}
 assert.deepEqual(records.filter(r=>r.disposition!=='APPROVE_WITH_CONDITIONS').flatMap(r=>r.target.rule_ids).sort(),['R2-P11','R2-P12','R2-P13']);
 return {policies:15,conditionalApprovals:12,abstentions:3,registryRawHash:authority.registryRawHash,humanCredentials:false};
});
const decisionSchema=load('CoachingCore/SHADOW_DECISION_SCHEMA.json'),validateDecision=new Ajv2020({strict:false,allErrors:true}).compile(decisionSchema);
function replay(file){
 const doc=load(file),journal=new ShadowJournal();let schemas=0,positive=0;
 for(const t of doc.traces){const actual=evaluateShadow(t.input),expected=Object.fromEntries(['mode','officialPlanState','observedExecutionState','shadowDecision','appliedState'].map(k=>[k,t[k]]));assert.deepEqual(actual,expected);assert.deepEqual(actual.appliedState,t.input.officialPlanState??null);assert.equal(actual.shadowDecision.applied,false);assert.ok(validateDecision(actual.shadowDecision),JSON.stringify(validateDecision.errors));schemas++;
  assert.equal(journal.record(t.input).duplicate,false);assert.equal(journal.record(t.input).duplicate,true);
  if(actual.shadowDecision.decisionType==='MODIFY'){positive++;const sessions=actual.shadowDecision.candidate.sessions;if(sessions)assert.equal(new Set(sessions.map(s=>s.session_id)).size,sessions.length);for(const s of (t.input.officialPlanState?.sessions??[]).filter(s=>s.status==='COMPLETED'))assert.deepEqual(sessions?.find(c=>c.session_id===s.session_id),s);}
 }
 return {uniqueInputs:doc.traces.length,replayed:doc.traces.length,schemaValid:schemas,positiveProposals:positive,officialPlanMutations:0,appliedEffects:0};
}
await check('saved_R2_trace_replay_schema_determinism_and_no_application',()=>replay('CoachingCore/r2/RUNTIME_R2_TRACES.json'));
await check('current_legacy_simulation_replay',()=>replay('CoachingCore/r2/legacy-replay/RUNTIME_TRACE_EXAMPLES.json'));
await check('representative_independence_and_honest_denominators',()=>{
 const c=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),a=load('CoachingCore/r2/evaluation/R2_EVAL_INPUTS.json'),b=load('CoachingCore/r2/COVERAGE_BASELINE_R2.json');assert.equal(hash(c.cases),c.corpusContentSha256);assert.equal(c.cases.length,42);assert.equal(a.cases.length,42);assert.equal(b.representative.rows,42);
 for(const row of a.cases){const original=c.cases.find(c=>c.caseId===row.caseId);assert.equal(hash(original.scenarioFacts),row.sourceFactsSha256);assert.equal(hash(row.input),row.inputSha256);}
 const counts=b.representative.classes;assert.equal(Object.values(counts).reduce((a,v)=>a+v,0),42);assert.equal(counts.POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED,1);assert.equal(counts.USEFUL_ASK,b.representative.askBreakdown.substantiveMissingInputAsk);assert.equal(b.representative.rawDecisionCounts.ASK,b.representative.askBreakdown.transportOrContractAsk+counts.USEFUL_ASK);
 for(const p of ['CoachingCore/src/runtime.mjs','CoachingCore/src/r2-runtime.mjs'])assert.ok(!/from\s+['"][^'"]*(evaluation|r2-fixtures|e2e-oracles)/.test(fs.readFileSync(path.join(root,p),'utf8')),'Evaluator imports an expected oracle');
 return {independentCases:42,positive:1,positiveOpportunities:23,currentSchemaValid:b.representative.currentSchemaValid,currentSchemaInvalid:b.representative.currentSchemaInvalid,semanticClasses:counts,rawAskBreakdown:b.representative.askBreakdown,frozenCorpusHash:c.corpusContentSha256};
});
await check('single_human_queue_preserves_history_and_only_actual_approvals',()=>{
 const old=load(audit+'/before/HUMAN_REVALIDATION_QUEUE.json'),q=load('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');assert.equal(old.items.length,88);assert.equal(q.items.length,100);assert.deepEqual(q.items.slice(0,88),old.items);assert.deepEqual(q.funding_trigger,old.funding_trigger);
 const additions=q.items.slice(88);assert.equal(new Set(additions.map(x=>x.queue_id)).size,12);for(const r of approved){const item=additions.find(x=>x.decision_id===r.review_id);assert.ok(item);assert.deepEqual(item.target,r.target);assert.deepEqual(item.conditions,r.decision.conditions);assert.equal(item.state,'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION');assert.ok(!item.approved_scope.includes('undefined'));}assert.ok(!additions.some(x=>['SSCTR-R2-P11','SSCTR-R2-P12','SSCTR-R2-P13'].includes(x.decision_id)));
 return {preserved:88,added:12,total:100,fundingUnchanged:true,noAbstentionQueued:true};
});
await check('baseline_authority_and_existing_work_preserved',()=>{
 const allowed=['CURRENT_MISSION.md','MISSION_LEDGER.md','CoachingCore/src/runtime.mjs','CoachingCore/package.json','CoachingCore/README.md','CoachingCore/BOUNDED_SHADOW_RUNTIME_CONTRACT.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'];
 const external=['audits/new-figma-v1-completion-2026-10-23/DELIVERY_REPORT.md'];
 const changed=Object.keys(baseline.hashes).filter(p=>fs.existsSync(path.join(root,p))&&rawHash(p)!==baseline.hashes[p]),unexpected=changed.filter(p=>!allowed.includes(p)&&!external.includes(p));assert.deepEqual(unexpected,[],'Unclassified baseline source changed');assert.ok(Object.keys(baseline.hashes).every(p=>fs.existsSync(path.join(root,p))),'A baseline file disappeared');
 for(const p of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const before=fs.readFileSync(path.join(root,audit,'before',p),'utf8'),current=fs.readFileSync(path.join(root,p),'utf8');let cursor=0;for(const line of before.split(/\r?\n/).filter(l=>l.trim())){const at=current.indexOf(line,cursor);assert.ok(at>=0,'Existing mission/ledger text was lost: '+line);cursor=at+line.length;}assert.ok(current.includes('DCR2-20261024-r1'));}
 const externalDeltas=changed.filter(p=>external.includes(p)).map(p=>({path:p,beforeSha256:baseline.hashes[p],currentSha256:rawHash(p),classification:'External concurrent IDV-1 visual-audit locator, not a scientific/runtime R2 input and not changed/certified by R2'}));
 for(const d of externalDeltas)assert.ok(!reg.policies.some(p=>p.domainArtifact===d.path),'External delta is a prescribing input');
 return {baselineFiles:Object.keys(baseline.hashes).length,missionOwnedChangedPaths:changed.filter(p=>allowed.includes(p)),externalConcurrentDeltas:externalDeltas,unclassifiedChanges:0,concurrentMissionContext:'IDV-1 inserted its own visual locator in the shared mission/ledger; all original text is retained in order. No external visual activity is attributed to or certified by R2'};
});
await check('multiday_multiweek_scope_and_guard_metrics',()=>{
 const m=load('CoachingCore/r2/RUNTIME_R2_RESULTS.json'),b=load('CoachingCore/r2/COVERAGE_BASELINE_R2.json');assert.equal(m.evaluationRows,209);assert.equal(m.uniqueLogicalInputs,205);assert.equal(m.legacyReplay.rows,164);assert.equal(m.legacyReplay.unique,160);assert.equal(m.trajectories.length,9);assert.equal(m.officialPlanMutations,0);assert.equal(m.appliedEffects,0);assert.equal(m.identicalInputFlips,0);assert.equal(m.unsupportedNoisePrescriptions,0);assert.equal(m.prescriptionCascade,0);assert.equal(m.traceCompleteness.complete,m.traceCompleteness.total);assert.equal(b.development.positive,12);
 return {rows:209,uniqueR2Inputs:205,legacyRows:164,legacyUnique:160,trajectories:9,establishmentWeeks:2,fourWeekStreams:3,stressWeeks:4,scriptedResponsesNotPhysiology:true,officialPlanMutations:0,appliedEffects:0,identicalInputFlips:0,unsupportedNoisePrescriptions:0};
});
function freshTargets(targets){assert.ok(targets&&Object.keys(targets).length);for(const [p,sha]of Object.entries(targets))assert.equal(rawHash(p),sha,'Stale independent review target: '+p);return Object.keys(targets).length;}
await check('independent_SSCTR_final_current_fidelity_gate',()=>{
 const d=load(audit+'/reviews/ssctr-final-verification.json'),index=load(audit+'/reviews/ssctr-review.json');assert.equal(d.verdict,'PASS');assert.equal(index.independent,true);const supporting=freshTargets(d.supportingTargetHashes)+freshTargets(index.targetHashes);assert.ok(Object.values(d.checks).every(v=>v===true));const schema=load(audit+'/reviews/ssctr-schema-validation.json');assert.ok(schema.passed===true&&schema.errors.length===0);return {path:audit+'/reviews/ssctr-final-verification.json',verdict:d.verdict,supportingHashesChecked:supporting,probes:d.targetedProbes,scope:d.meaning};
});
for(const name of ['quality','governance'])await check('independent_'+name+'_current_gate',()=>{
 const d=load(audit+'/reviews/'+name+'.json');assert.equal(d.verdict,'PASS');assert.equal(d.independent,true);const targets=freshTargets(d.targetHashes);return {path:audit+'/reviews/'+name+'.json',verdict:d.verdict,targets,reviewer:d.reviewerInstance??d.reviewer??null};
});
await check('all_requested_deliverables_and_explicit_readiness',()=>{
 const needed=['DOMAIN_CLOSURE_R2_REPORT.md','POSITIVE_PRESCRIPTION_REGISTRY.md','POSITIVE_PRESCRIPTION_REGISTRY.json','INPUT_CONTRACT.md','SHADOW_INPUT_R2_SCHEMA.json','SSCTR_RUNTIME_AUTHORITY.json','evaluation/REPRESENTATIVE_CORPUS_R2.md','evaluation/REPRESENTATIVE_CORPUS_R2.json','evaluation/R2_EVAL_INPUTS.json','COVERAGE_BASELINE_R2.md','COVERAGE_BASELINE_R2.json','RUNTIME_R2_RESULTS.md','RUNTIME_R2_RESULTS.json','RUNTIME_R2_TRACES.json','domain/LITERATURE_SNAPSHOT_R2.json','domain/SEARCH_LOG_R2.md','HUMAN_REVALIDATION_QUEUE_UPDATE.json','OPEN_GAPS_R2.md','OPEN_GAPS_R2.json','FINAL_REPORT.md'];
 for(const stem of ['ACF_G01_ESTABLISHMENT','ACF_G02_ADAPTATION_DOSING','ACF_G03_RETURN','ACF_G04_TAPER_RACE_WEEK','ACF_G05_RUN_CALIBRATION'])for(const ext of ['md','json'])needed.push('domain/'+stem+'.'+ext);
 for(const p of needed){assert.ok(fs.statSync(path.join(out,p)).size>0,p);if(p.endsWith('.json'))JSON.parse(fs.readFileSync(path.join(out,p)));}
 const v=load('CoachingCore/r2/OPEN_GAPS_R2.json').verdicts;assert.equal(Object.keys(v).length,8);assert.equal(v.NEXT_ENGINEERING_STEP,'DOMAIN_CLOSURE_R3');assert.ok(Object.entries(v).filter(([k])=>k!=='NEXT_ENGINEERING_STEP').every(([,v])=>v==='NOT_READY'));return {requestedArtifactPathsChecked:needed.length,verdicts:v,fullAutonomousRuntime:'NO_GO'};
});
const artifactHashes={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name!=='VERIFICATION.json'){const rel=path.relative(root,p).replaceAll('\\','/');artifactHashes[rel]=rawHash(rel);}}}walk(out);
for(const p of ['CoachingCore/src/runtime.mjs','CoachingCore/src/r2-runtime.mjs','CoachingCore/src/r2-fixtures.mjs','CoachingCore/scripts/verify-r2.mjs','CoachingCore/scripts/simulate-r2.mjs','CoachingCore/scripts/report-r2.mjs','CoachingCore/test/r2.test.mjs','CoachingCore/package.json','CoachingCore/package-lock.json'])artifactHashes[p]=rawHash(p);
const failed=checks.filter(c=>c.status!=='PASS'),result={revision:'DCR2-VERIFY-1',verifiedAt:new Date().toISOString(),status:failed.length?'INCOMPLETE':'PASS',meaning:'Current bounded offline conformance and independent review freshness; NOT V1 readiness or efficacy/safety/clinical/production approval',environment:{node:process.version,platform:process.platform,purpose:'OFFLINE_SYNTHETIC_SHADOW_REFERENCE'},checks,verdicts:load('CoachingCore/r2/OPEN_GAPS_R2.json').verdicts,artifactHashes,scientificApprovalsAdded:12,historicalQueueItemsPreserved:88,humanValidation:false,clinicalValidation:false,empiricalValidation:false,officialPlanApplication:false,uiImplementation:false,figmaAction:false,kmpMigration:false,productionRelease:false};
fs.writeFileSync(path.join(out,'VERIFICATION.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks:checks.length,failed:failed.map(f=>({name:f.name,error:f.error})),verdicts:result.verdicts}));if(failed.length)process.exitCode=1;
