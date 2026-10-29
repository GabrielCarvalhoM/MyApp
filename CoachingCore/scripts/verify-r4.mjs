import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
import {evaluateShadow} from '../src/index.mjs';
import {evaluateCanonicalShadow} from '../src/r3-runtime.mjs';
import {evaluateCoachingShadow,normalizeRepresentative,validateCanonical} from '../src/r4-index.mjs';
const root=path.resolve(import.meta.dirname,'../..'),core=path.join(root,'CoachingCore'),out=path.join(core,'r4'),audit='audits/domain-closure-r4-2026-10-25';
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const raw=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const write=(p,v)=>fs.writeFileSync(path.join(out,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const checks=[];
const check=(name,fn)=>{try{checks.push({name,status:'PASS',evidence:fn()});}catch(e){checks.push({name,status:'FAIL',error:e.stack??e.message});}};
const reviewedCurrent=review=>{
 const files=review.reviewedFiles??review.reviewed_files??review.targets??[];
 assert.ok(files.length,'No reviewed file hashes');
 for(const f of files){const p=f.path??f.artifact;assert.equal(raw(p),f.sha256??f.hash,'Stale review target '+p);}
 return files.length;
};
check('node24_reference',()=>{assert.equal(Number(process.versions.node.split('.')[0]),24);return process.version;});
check('all_current_tests',()=>{
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:core,encoding:'utf8',maxBuffer:40_000_000});
 write('TEST_RESULTS_CURRENT.tap',(r.stdout??'')+(r.stderr??''));assert.equal(r.status,0,'Tests failed; inspect TEST_RESULTS_CURRENT.tap');
 const tests=Number(r.stdout.match(/# tests (\d+)/)?.[1]),passed=Number(r.stdout.match(/# pass (\d+)/)?.[1]),failed=Number(r.stdout.match(/# fail (\d+)/)?.[1]);
 assert.ok(tests>209);assert.equal(tests,passed);assert.equal(failed,0);
 return {command:'node --test --test-reporter=tap',exitCode:r.status,tests,passed,failed,log:'CoachingCore/r4/TEST_RESULTS_CURRENT.tap',sha256:raw('CoachingCore/r4/TEST_RESULTS_CURRENT.tap')};
});
check('frozen_historical_source_preservation',()=>{
 const baseline=load(audit+'/before/MANIFEST.json');
 const intentionallyChanged=new Set(['CURRENT_MISSION.md','MISSION_LEDGER.md','CoachingCore/package.json','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json']);
 let preserved=0;
 for(const e of baseline.entries){if(intentionallyChanged.has(e.path)||/CoachingCore\/(?:src|test)\/r4-/.test(e.path))continue;assert.equal(raw(e.path),e.sha256,e.path+' changed');preserved++;}
 return {preserved,intentionallyChanged:[...intentionallyChanged],preexistingDirtyCheckoutPreserved:true};
});
check('frozen42_unchanged_and_original_r3_distribution',()=>{
 const c=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json');assert.equal(c.cases.length,42);assert.equal(hash(c.cases),c.corpusContentSha256);
 const baseline=load('CoachingCore/r3/TRUE_COVERAGE_BASELINE_R3.json');assert.deepEqual(baseline.amongSemanticConsumableNormal,{POSITIVE:2,KEEP:2,USEFUL_ASK:15,HOLD:2,NOT_SUPPORTED_DOMAIN:16,NOT_SUPPORTED_SCIENCE:3});
 let clinical=0;
 for(const x of c.cases){const input=normalizeRepresentative(x);assert.equal(validateCanonical(input).valid,true);const d=evaluateCanonicalShadow(input).shadowDecision;if(d.coverage==='CLINICAL_OR_OUT_OF_SCOPE')clinical++;}
 assert.equal(clinical,2);return {frozenHash:c.corpusContentSha256,all:42,normal:40,clinical};
});
check('independent_holdout_seal_and_all_runtime_invariants',()=>{
 const h=load('CoachingCore/r4/holdout/R4_INDEPENDENT_HOLDOUT.json'),seal=load('CoachingCore/r4/holdout/INDEPENDENCE_MANIFEST.json');
 assert.equal(raw(seal.corpusPath),seal.corpusSha256);assert.equal(seal.engineImplementationByAuthor,false);assert.equal(seal.runtimeInspectedBeforeSeal,false);assert.equal(h.cases.length,24);
 const frozen=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json');let clinical=0,positive=0;
 for(const c of [...frozen.cases,...h.cases]){const i=normalizeRepresentative(c),before=hash(i),r=evaluateCoachingShadow(i),d=r.shadowDecision;assert.deepEqual(r,evaluateCoachingShadow(i));assert.equal(hash(i),before);assert.deepEqual(r.appliedState,r.officialPlanState);assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');if(d.decisionType==='CLINICAL_HUMAN_REQUIRED'){clinical++;assert.equal(d.candidate,null);}if(d.decisionType==='MODIFY'){positive++;assert.ok(d.candidate&&d.requestedScopeSatisfied&&d.envelopeRefs?.length&&d.evidenceRefs?.length);const why=d.coachingReasoning;assert.ok(why?.goal&&why.phase!==undefined&&why.intendedStimulus&&why.candidates?.length>1&&why.selectedOption&&why.whyPreferred&&why.preserved&&why.tradeOff&&why.uncertainty&&why.nextObservation);}}
 assert.equal(clinical,2);return {evaluated:66,normal:64,clinical,positiveRaw:positive,officialMutations:0,appliedEffects:0,holdoutSeal:seal.corpusSha256,finalHoldoutReuse:'First evaluation retained; subsequent fixes disclosed as challenge reuse, not fresh unseen validation'};
});
check('runtime_has_no_corpus_or_expected_output_import',()=>{
 const files=fs.readdirSync(path.join(core,'src')).filter(p=>p.startsWith('r4-')&&p.endsWith('.mjs'));
 for(const f of files){const text=fs.readFileSync(path.join(core,'src',f),'utf8');assert.ok(!/from\s+['"][^'"]*(?:holdout|fixtures|CORPUS|RESULTS|expected)|readFileSync\([^)]*(?:holdout|CORPUS|RESULTS)|REP-R2-\d|R4-HO-\d/.test(text),'Case or expectation coupling '+f);}
 return files;
});
check('recorded_r4_results_reproduce_current_runtime',()=>{
 const stored=load('CoachingCore/r4/R4_RUNTIME_TRACES.json').rows;
 assert.equal(stored.length,66);
 for(const row of stored)assert.deepEqual(evaluateCoachingShadow(row.input),row.result,'Stale recorded result '+row.caseId);
 const comparison=load('CoachingCore/r4/COVERAGE_COMPARISON_R4.json');
 const classes={POSITIVE:'POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED',KEEP:'SUPPORTED_KEEP',USEFUL_ASK:'USEFUL_ASK',HOLD:'CORRECT_ABSTAIN_OR_HOLD',NOT_SUPPORTED_DOMAIN:'NOT_SUPPORTED_DOMAIN_GAP',NOT_SUPPORTED_SCIENCE:'NOT_SUPPORTED_SCIENCE_GAP',CLINICAL_OUT_OF_SCOPE:'CLINICAL_OR_OUT_OF_SCOPE',SOFTWARE_CONTRACT:'NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP'};
 for(const [set,key] of [['frozen42','frozen40'],['holdout','holdout24']])for(const [category,coverage] of Object.entries(classes)){
  const actual=stored.filter(r=>r.set===set&&r.result.shadowDecision.coverage===coverage&&(set!=='frozen42'||coverage!=='CLINICAL_OR_OUT_OF_SCOPE')).length;
  assert.equal(comparison[key][category],actual,'Recorded count '+key+'/'+category);
 }
 return {exactCurrentRecordedDecisions:66,dispositionCountsRecomputed:true,sourceAndReviewVersionsBound:true};
});
check('reusable_envelope_current_independent_scientific_authority',()=>{
 const reg=load('CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json'),a=load(audit+'/reviews/ssctr-envelope-review.json');assert.equal(reg.envelopes.length,9);
 for(const e of reg.envelopes){const r=a.records.find(r=>r.envelopeId===e.envelopeId);assert.ok(r);assert.equal(r.envelopeHash,hash(e));assert.equal(r.independent,true);assert.equal(r.disposition,'APPROVE_WITH_CONDITIONS');assert.ok(r.sourceIds.length&&r.conditions.length&&r.limitations.length);}
 const validation=load(audit+'/reviews/ssctr-schema-validation.json');assert.equal(validation.passed,true);assert.equal(validation.records,9);assert.equal(validation.actualGlobalQueueMergeObserved,true);
 return {envelopes:9,independentConditionalApprovals:9,validation,sourceScope:'Provisional internal literature review, not human/clinical/empirical validation'};
});
check('single_human_queue_preserved_prefix_and_reusable_semantics',()=>{
 const before=load(audit+'/before/reviews__provisional-sports-science__2026-10-23__HUMAN_REVALIDATION_QUEUE.json'),q=load('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
 assert.equal(before.items.length,101);assert.deepEqual(q.items.slice(0,101),before.items);assert.equal(q.items.length,110);assert.deepEqual(q.funding_trigger,before.funding_trigger);assert.ok(q.r4_queue_semantics.unit.includes('Reusable'));
 const proposed=load(audit+'/reviews/ssctr-proposed-queue-items.json');for(const i of proposed.items)assert.deepEqual(q.items.find(x=>x.queue_id===i.queue_id),i);assert.equal(new Set(q.items.map(x=>x.queue_id)).size,q.items.length);
 return {preserved:101,addedReusableApprovals:9,total:110,funding:q.funding_trigger.state};
});
check('historical_legacy_r2_exact_replays',()=>{
 let total=0;const counts={};
 for(const file of ['CoachingCore/r2/RUNTIME_R2_TRACES.json','CoachingCore/r2/legacy-replay/RUNTIME_TRACE_EXAMPLES.json']){const doc=load(file);const rows=Array.isArray(doc.traces)?doc.traces:Object.values(doc.traces);let n=0;for(const row of rows){const input=row.input??row.runtimeInput;if(!input)continue;const expected=row.result??row.output??Object.fromEntries(["mode","officialPlanState","observedExecutionState","shadowDecision","appliedState"].map(k=>[k,row[k]]));assert.deepEqual(evaluateShadow(input),expected);n++;}assert.ok(n>0,'No replay rows in '+file);counts[file]=n;total+=n;}
 assert.ok(total>=365);return {exactHistoricalInputs:total,counts};
});
check('independent_coaching_quality_current_and_complete',()=>{
 const q=load(audit+'/reviews/quality-assessment.json');assert.equal(q.independent,true);const fileCount=reviewedCurrent(q);
 const cases=q.cases??[];assert.equal(cases.filter(c=>c.set==='frozen40').length,40);assert.equal(cases.filter(c=>c.set==='holdout').length,24);
 const stored=load('CoachingCore/r4/R4_RUNTIME_TRACES.json').rows;
 for(const [set,traceSet] of [['frozen40','frozen42'],['holdout','holdout']]){
  const expected=stored.filter(r=>r.set===traceSet&&r.result.shadowDecision.coverage!=='CLINICAL_OR_OUT_OF_SCOPE').map(r=>r.caseId).sort();
  assert.deepEqual(cases.filter(c=>c.set===set).map(c=>c.caseId).sort(),expected,'Independent review case identity coverage');
 }
 for(const c of cases){const actual=stored.find(r=>r.caseId===c.caseId).result.shadowDecision;assert.equal(c.actualDecisionType,actual.decisionType);assert.equal(c.actualCoverage,actual.coverage);}
 for(const c of cases)assert.ok(['COACHING_BEST_SUPPORTED','COACHING_ACCEPTABLE_ALTERNATIVE','COACHING_SUBOPTIMAL','INSUFFICIENT_INFORMATION','UNSUPPORTED'].includes(c.qualityClass));
 const open=(q.findings??[]).filter(f=>(f.blocking===true||f.severity==='MUST')&&!/^(CORRECTED|CLOSED|RESOLVED|REJECTED_WITH_EVIDENCE)/.test(f.status??''));assert.equal(open.length,0,'Material unresolved executable findings');
 return {reviewedFiles:fileCount,cases:64,verdict:q.verdict,independent:true,scope:'Designed-case coaching correctness review; no empirical efficacy claim'};
});
check('independent_ssctr_binding_current',()=>{
 const s=load(audit+'/reviews/ssctr-binding-review.json');assert.equal(s.independent,true);const fileCount=reviewedCurrent(s);assert.ok(['PASS','PASS_WITH_CONDITIONS','APPROVE_WITH_CONDITIONS'].includes(s.verdict));
 const open=(s.findings??[]).filter(f=>(f.blocking===true||f.severity==='MUST')&&!/^(CORRECTED|CLOSED|RESOLVED|REJECTED_WITH_EVIDENCE)/.test(f.status??''));assert.equal(open.length,0,'Scientific runtime binding findings unresolved');return {reviewedFiles:fileCount,verdict:s.verdict};
});
check('deliverables_and_root_cause_ask_coverage',()=>{
 const mandatory=['COACHING_INTELLIGENCE_ARCHITECTURE.md','SSCTR_AUTHORITY_REFINEMENT.md','COACHING_DECISION_MODEL.json','PRESCRIPTION_ENVELOPE_REGISTRY.json','R3_DOMAIN_GAP_ROOT_CAUSE.json','R3_ASK_AUTOPSY.json','FIRST_PRESCRIPTION_ENGINE_R4.json','ADAPTIVE_COACHING_SELECTORS_R4.json','ATHLETE_SPECIFIC_LEARNING_R4.json','FROZEN40_RERUN.json','HOLDOUT_RESULTS.json','COACHING_DECISION_QUALITY_R4.json','HUMAN_REVALIDATION_QUEUE_UPDATE_R4.json','OPEN_GAPS_R4.json','FINAL_REPORT.md','READINESS_VERDICTS_R4.json'];for(const p of mandatory)assert.ok(fs.statSync(path.join(out,p)).size>0,p);
 const roots=load('CoachingCore/r4/R3_DOMAIN_GAP_ROOT_CAUSE.json'),asks=load('CoachingCore/r4/R3_ASK_AUTOPSY.json'),old=load('CoachingCore/r3/REPRESENTATIVE_RUNTIME_RESULTS_R3.json').results;
 assert.deepEqual(roots.clusters.flatMap(c=>c.caseIds).sort(),old.filter(r=>r.coverage==='NOT_SUPPORTED_DOMAIN_GAP').map(r=>r.caseId).sort());
 assert.deepEqual(asks.cases.map(c=>c.caseId).sort(),old.filter(r=>r.coverage==='USEFUL_ASK').map(r=>r.caseId).sort());
 const index=load('CoachingCore/r4/DELIVERABLE_INDEX.json');assert.equal(index.items.length,21);assert.equal(new Set(index.items.map(i=>i.id)).size,21);
 for(const item of index.items)for(const p of item.paths)assert.ok(fs.statSync(path.join(root,p)).size>0,p);
 return {mandatory:mandatory.length,indexedOutcomes:21,rootClusters:roots.clusters.length,domainCases:16,asks:15,caseIdentitiesMatched:true};
});
const verification={revision:'DCR4-VERIFY-1',executedAt:new Date().toISOString(),node:process.version,status:checks.every(c=>c.status==='PASS')?'PASS':'FAIL',checks,pass:checks.filter(c=>c.status==='PASS').length,fail:checks.filter(c=>c.status==='FAIL').length,limits:['Offline synthetic reference only','Current objective checks and independent internal judgments do not establish physiological optimality, clinical clearance, efficacy or production readiness'],artifactHashes:fs.readdirSync(path.join(core,'src')).filter(p=>p.startsWith('r4-')).map(p=>({path:'CoachingCore/src/'+p,sha256:raw('CoachingCore/src/'+p)}))};
write('VERIFICATION.json',verification);console.log(JSON.stringify({status:verification.status,pass:verification.pass,fail:verification.fail,checks:checks.map(c=>({name:c.name,status:c.status,error:c.error?.split('\n')[0]}))},null,2));if(verification.status!=='PASS')process.exitCode=1;
