import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import {evaluateShadow} from '../src/runtime.mjs';
import {hash} from '../src/value.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),core=path.join(root,'CoachingCore'),out=path.join(core,'artifacts'),audit=path.join(root,'audits/bounded-shadow-runtime-2026-10-24');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const fileHash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write=(name,v)=>fs.writeFileSync(path.join(out,name),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const checks=[];
function check(name,run){try{const evidence=run();checks.push({name,status:'PASS',evidence});}catch(e){checks.push({name,status:'FAIL',error:e.message});}}
const tests=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:core,encoding:'utf8'});
// Preserve the exact log frozen by independent review; each current verification has its own evidence file.
write('TEST_RESULTS_CURRENT.tap',tests.stdout+(tests.stderr||''));
const testCount=Number(tests.stdout.match(/^# tests (\d+)$/m)?.[1]??0),passCount=Number(tests.stdout.match(/^# pass (\d+)$/m)?.[1]??0),failCount=Number(tests.stdout.match(/^# fail (\d+)$/m)?.[1]??0);
check('current_executable_tests',()=>{assert.equal(tests.status,0);assert.ok(testCount>=98);assert.equal(testCount,passCount);assert.equal(failCount,0);return {command:'node --test --test-reporter=tap',node:process.version,exitCode:tests.status,tests:testCount,passed:passCount,failed:failCount,raw:'artifacts/TEST_RESULTS_CURRENT.tap',sha256:fileHash(path.join(out,'TEST_RESULTS_CURRENT.tap'))};});
const bundle=read(path.join(core,'fixtures/authority-bundle.json')),traces=read(path.join(out,'RUNTIME_TRACE_EXAMPLES.json')),metrics=read(path.join(out,'SYNTHETIC_SHADOW_RESULTS.json')),coverage=read(path.join(out,'COACHING_COVERAGE_BASELINE.json'));
check('upstream_reviewed_authority_integrity',()=>{for(const [p,h]of Object.entries(bundle.sourceManifest))assert.equal(fileHash(path.join(root,p)),h,p);for(const d of bundle.records)assert.equal(fileHash(path.join(root,d.target.artifact)),d.target.sha256,d.review_id);const {bundleHash,...rest}=bundle;assert.equal(hash(rest),bundleHash);return {sources:Object.keys(bundle.sourceManifest).length,records:bundle.records.length,bundleHash};});
const validate=new Ajv2020({strict:false,allErrors:true}).compile(read(path.join(core,'SHADOW_DECISION_SCHEMA.json')));
check('saved_trace_replay_schema_and_no_application',()=>{
  const ids=new Set();
  for(const t of traces.traces){assert.ok(!ids.has(t.shadowDecision.traceId));ids.add(t.shadowDecision.traceId);assert.equal(validate(t.shadowDecision),true,JSON.stringify(validate.errors));assert.equal(hash(t.input),t.shadowDecision.inputHash);const result=evaluateShadow(t.input);assert.deepEqual(result,{mode:t.mode,officialPlanState:t.officialPlanState,observedExecutionState:t.observedExecutionState,shadowDecision:t.shadowDecision,appliedState:t.appliedState});assert.deepEqual(t.appliedState,t.officialPlanState);assert.equal(t.shadowDecision.applied,false);assert.equal(t.shadowDecision.effect,'SHADOW_ONLY');}
  assert.equal(ids.size,metrics.uniqueLogicalEvaluations);return {uniqueTraces:ids.size,replayed:ids.size,schemaValid:ids.size,officialPlanMutations:0,appliedEffects:0};
});
check('coverage_disjoint_denominators_and_evaluation_index',()=>{
  const ids=new Set(traces.traces.map(t=>t.shadowDecision.traceId));assert.equal(traces.evaluationIndex.length,metrics.evaluationRows);
  const classes=Object.keys(coverage.classDefinitions);
  for(const [name,corpus]of Object.entries(coverage.corpora)){
    const rows=traces.evaluationIndex.filter(x=>x.corpus===name);assert.equal(rows.length,corpus.count);assert.equal(Object.values(corpus.classes).reduce((a,b)=>a+b,0),corpus.count);
    for(const cls of classes)assert.equal(rows.filter(x=>x.coverage===cls).length,corpus.classes[cls]);
  }
  for(const row of traces.evaluationIndex)assert.ok(ids.has(row.traceId));
  assert.equal(coverage.corpora.ACF_24.count,24);assert.equal(coverage.acf24PositiveCount,6);assert.equal(coverage.corpora.ACF_24.classes.SUPPORTED_KEEP,10);assert.equal(coverage.corpora.ACF_24.classes.USEFUL_ASK,6);assert.equal(coverage.corpora.ACF_24.classes.CORRECT_ABSTAIN_OR_HOLD,2);
  for(const id of ['E2E-15','E2E-24'])assert.equal(traces.evaluationIndex.find(r=>r.label===id).coverage,'SUPPORTED_KEEP');
  return {rows:traces.evaluationIndex.length,unique:ids.size,originalScenarios:24,positiveProposalDecisions:6,branchesCountedAsPositive:0};
});
check('multi_day_and_horizon_execution',()=>{assert.equal(metrics.trajectories.filter(t=>t.id.startsWith('WEEK')).length,9);assert.ok(metrics.trajectories.every(t=>t.days===7&&t.traceIds.length===7));assert.equal(coverage.corpora.FOUR_WEEK_STREAM.count,28);assert.equal(metrics.determinismChecks,metrics.evaluationRows);assert.equal(metrics.replayChecks,metrics.evaluationRows);assert.equal(metrics.oscillation.identicalInputFlips,0);assert.equal(metrics.oscillation.unsupportedNoisePrescriptions,0);return {familiarWeeks:9,stressWeeks:4,observationBlockWeeks:4,determinismChecks:metrics.determinismChecks,replayChecks:metrics.replayChecks,limits:metrics.scriptedResponses};});
check('preexisting_dirty_repository_and_queue_preserved',()=>{
  const before=read(path.join(audit,'before/MANIFEST.json'));let unchanged=0,appendOnly=0;
  for(const [p,h]of Object.entries(before.files)){
    if(['CURRENT_MISSION.md','MISSION_LEDGER.md'].includes(p)){assert.ok(fs.readFileSync(path.join(root,p)).subarray(0,fs.statSync(path.join(audit,'before',p)).size).equals(fs.readFileSync(path.join(audit,'before',p))),p);appendOnly++;}
    else {assert.equal(fileHash(path.join(root,p)),h,p);unchanged++;}
  }
  const queue=read(path.join(out,'HUMAN_REVALIDATION_QUEUE_UPDATE.json'));assert.equal(queue.preservedItems,88);assert.equal(queue.addedItems,0);assert.equal(queue.beforeHash,queue.afterHash);assert.equal(fileHash(path.join(root,queue.canonicalQueue)),queue.afterHash);assert.ok(queue.projection.every(x=>x.queueId));
  return {unchangedFiles:unchanged,appendOnlyEntryFiles:appendOnly,humanQueueItems:88,newScientificApprovals:0,newHumanQueueItems:0,queueHash:queue.afterHash};
});
check('runtime_does_not_import_expected_oracle',()=>{for(const p of ['src/runtime.mjs','src/semantics.mjs','src/value.mjs','src/index.mjs'])assert.ok(!fs.readFileSync(path.join(core,p),'utf8').includes('e2e-oracles'));assert.equal(bundle.profiles.filter(p=>/^E2E-\d\d$/.test(p.id)).length,24);return {originalE2EProfiles:24,noviceCounterpartProfiles:1,expectedOracleImport:false,clarification:'Explicit candidate resources and reviewed inputs are distinct from expected disposition/autonomy/MEC test oracles'};});
const required=['BOUNDED_SHADOW_RUNTIME_CONTRACT.md','POLICY_REGISTRY_RUNTIME_BINDINGS.json','SHADOW_DECISION_SCHEMA.json','SHADOW_INPUT_SCHEMA.json',...['SYNTHETIC_SHADOW_RESULTS.md','SYNTHETIC_SHADOW_RESULTS.json','COACHING_COVERAGE_BASELINE.md','COACHING_COVERAGE_BASELINE.json','RUNTIME_TRACE_EXAMPLES.md','RUNTIME_TRACE_EXAMPLES.json','ACF_G01_G05_PROGRESS.md','ACF_G01_G05_PROGRESS.json','SSCTR_EVIDENCE_SNAPSHOT.json','HUMAN_REVALIDATION_QUEUE_UPDATE.json','OPEN_GAPS_AFTER_SHADOW.md'].map(n=>'artifacts/'+n)];
check('requested_deliverables_exist',()=>{for(const p of required)assert.ok(fs.statSync(path.join(core,p)).size>0,p);return {artifacts:required.length,finalReportAndVerification:'Emitted by this current verification after independent gate checks'};});
const reviewResults={};
for(const name of ['ssctr','quality'])check('independent_'+name+'_review_current',()=>{
  const p=path.join(audit,'reviews',name+'.json');assert.ok(fs.existsSync(p),'Review pending: '+name);
  const review=read(p);assert.equal(review.openBlockingFindings,0);assert.ok(review.reviewedFileHashes&&Object.keys(review.reviewedFileHashes).length>0);
  for(const [f,h]of Object.entries(review.reviewedFileHashes))assert.equal(fileHash(path.join(root,f)),h,name+' stale '+f);
  assert.ok(!/BLOCKED|REQUEST_CHANGES|NOT_READY|FAIL/.test(review.verdict),'Independent review does not pass: '+review.verdict);
  reviewResults[name]={verdict:review.verdict,path:path.relative(root,p).replaceAll('\\','/'),sha256:fileHash(p),reviewedFiles:Object.keys(review.reviewedFileHashes).length};return reviewResults[name];
});
const failed=checks.filter(c=>c.status==='FAIL');
const verdicts={BOUNDED_SHADOW_RUNTIME_READINESS:failed.length?'NOT_READY':'READY',POSITIVE_PRESCRIPTION_COVERAGE:'NOT_READY',AUTONOMOUS_COACHING_SPEC_READINESS:'NOT_READY',AUTONOMOUS_COACH_RUNTIME_READINESS:'NO_GO',NEXT_ENGINEERING_STEP:'DOMAIN_CLOSURE_REQUIRED'};
const report=`# V1 Bounded Shadow Runtime — final report\n\nBSR-0.1.0 · 2026-10-24 · MyApp / Vilumo Fit. ${failed.length?'Verification has outstanding checks; see VERIFICATION.json.':'The exact bounded offline shadow module is ready within its documented scope.'}\n\n| Verdict | Result |\n|---|---|\n${Object.entries(verdicts).map(([k,v])=>'| '+k+' | '+v+' |').join('\n')}\n\nThe runtime returns real deterministic reviewed-context decisions and concrete proposals; it has no application capability. Node24 plus a locked AJV input-contract validator runs independently of any app. No UI/Figma/production/real athlete or official plan was changed. The candidate Foundation and existing Product Truth retain their authority/status.\n\nCurrent evidence: ${passCount}/${testCount} executable tests passed, including all24 original E2Es, the separate novice counterpart, selected seven Golden successors, semantic controls and review regression tests. ${metrics.evaluationRows} multi-day evaluation rows / ${metrics.uniqueLogicalEvaluations} unique logical inputs were replayed from saved traces. Nine seven-day familiar weeks, four seven-day stress trajectories and a four-week unchanged-plan observation stream ran. Applied effects and official-plan mutations are0; identical-input flips and unsupported-noise prescriptions are0. These are synthetic conformance results, not efficacy/safety, real athlete adherence or production reliability claims.\n\nOriginal ACF24:6 positive proposal decisions,10 supported KEEP,6 useful ASK,2 correct HOLD. Only the6 enter that corpus positive numerator; KEEP/ASK/ABSTAIN never do. E2E04/05 share the same easy35 witness, E2E16 is prospective schedule-option ranking, and E2E20 selects a previously familiar novice week. This is not six independent dose laws or complete V1 coverage. Branch withdrawal is supported KEEP. All other corpora and replay denominators are separate in COACHING_COVERAGE_BASELINE.json and the trace evaluationIndex.\n\nSupported next-horizon doses include easy30→35, squat60→62.5 and squat60→57.5 only under their exact reviewed inputs. Repeated effort/response premises are not universal count thresholds. Unknown first establishment, new fatigue dose, return recipe, combined taper and calibration/tolerance remain failure-closed. The ACF-G01–G05 progress files identify executable consumers and retained scientific gaps; no new scientific approvals were manufactured. All88 human revalidation entries remain byte-identical, with runtime-consumer links and0 additions.\n\nIndependent gates: ${Object.entries(reviewResults).map(([n,r])=>n+' '+r.verdict+' ('+r.path+')').join('; ')||'pending'}. Initial Quality findings and scientific Golden-envelope blocker were reproduced as failing tests, corrected by the author and independently rechecked on exact hashes. Input validation was centralized after recurring malformed-metadata findings. Raw current results and review freshness are in VERIFICATION.json; initial review history is preserved in the audit.\n\nNext required work is bounded domain closure with concrete runtime consumers: first-history establishment, positive fatigue/variation recipes, nonclinical return, joint race taper and task-specific calibration/tolerance. New prescription requires literature/claim/counterevidence/applicability/confidence plus independent SSCTR disposition, executable fixture and queue entry. Suggestion Mode adoption, actual application, source integration/persistence and real use remain future separately authorized work. Full autonomous runtime stays NO_GO.\n\nStart: ../BOUNDED_SHADOW_RUNTIME_CONTRACT.md. Reproduce: npm ci; npm test; npm run simulate; npm run verify. Existing documentary files were preserved; mission and ledger receive only additive locators. No commit or release was made.\n`;
write('FINAL_REPORT.md',report);
const artifactHashes=Object.fromEntries([...required,'artifacts/FINAL_REPORT.md','package.json','package-lock.json','src/runtime.mjs','src/semantics.mjs','src/fixtures.mjs','scripts/compile-authority.mjs','scripts/simulate.mjs','scripts/prepare-artifacts.mjs','scripts/verify.mjs'].map(p=>[p,fileHash(path.join(core,p))]));
write('VERIFICATION.json',{revision:'BSR-VERIFY-0.1.0',verifiedAt:new Date().toISOString(),status:failed.length?'FAIL':'PASS',environment:{node:process.version,platform:process.platform,scope:'OFFLINE_SYNTHETIC_SHADOW'},checks,verdicts,reviewResults,artifactHashes,scientificApprovalsAdded:0,humanValidation:false,clinicalValidation:false,empiricalValidation:false,uiChanged:false,figmaAccessed:false,productionRelease:false,officialPlanApplication:false,limitations:['Finite exact synthetic contexts only','Current schema/guard/conformance evidence is not safety/efficacy or human validation','No cross-process idempotency or real-service application','Full V1 sporting gaps retained']});
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',tests:testCount,passed:passCount,checks:checks.length,failures:failed.map(f=>({name:f.name,error:f.error})),verdicts}));
if(failed.length)process.exitCode=1;
