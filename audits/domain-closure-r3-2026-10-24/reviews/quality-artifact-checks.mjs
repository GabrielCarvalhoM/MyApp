import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {normalizeRepresentative,validateCanonical,fact} from '../../../CoachingCore/src/r3-input.mjs';
import {evaluateCanonicalShadow} from '../../../CoachingCore/src/r3-runtime.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url),load=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const raw=p=>createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex');
const corpus=load('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),norm=load('CoachingCore/r3/NORMALIZED_REPRESENTATIVE_CORPUS_R3.json'),trace=load('CoachingCore/r3/REPRESENTATIVE_RUNTIME_TRACES_R3.json'),results=load('CoachingCore/r3/REPRESENTATIVE_RUNTIME_RESULTS_R3.json'),baseline=load('CoachingCore/r3/TRUE_COVERAGE_BASELINE_R3.json'),forensics=load('CoachingCore/r3/REPRESENTATIVE_CORPUS_FORENSICS_R3.json'),streams=load('CoachingCore/r3/MULTIWEEK_STREAMS_R3.json');
const checks=[];
const check=(name,fn)=>{const evidence=fn();checks.push({name,status:'PASS',evidence});};
check('frozen42_and_forensic_completeness',()=>{
 assert.equal(corpus.cases.length,42);assert.equal(hash(corpus.cases),corpus.corpusContentSha256);assert.equal(forensics.cases.length,42);
 const manifest=load('audits/domain-closure-r3-2026-10-24/before/MANIFEST.json');assert.equal(raw('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),manifest.entries.find(e=>e.path==='CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json').sha256);
 for(const c of corpus.cases){const f=forensics.cases.find(x=>x.caseId===c.caseId);assert.ok(f.primaryBlocker&&Array.isArray(f.secondaryBlockers));assert.equal(f.sourceFactsSha256,hash(c.scenarioFacts));for(const k of ['providedFacts','runtimeCurrentlyExpects','missingOrUnsupported','legitimateDerivations','mustBeExplicitOrReviewed'])assert.ok(f[k]!==undefined,c.caseId+' '+k);}
 return {cases:42,sourceFactsAndExpectationsFrozen:true,primarySecondaryCausalBlockers:true};
});
check('all42_saved_canonical_and_runtime_results_exact_current_replay',()=>{
 assert.equal(norm.inputs.length,42);assert.equal(trace.rows.length,42);assert.equal(results.results.length,42);
 let normal=0,positive=0,keep=0,ask=0,hold=0,domain=0,science=0,clinical=0;
 for(const c of corpus.cases){
  const i=norm.inputs.find(x=>x.source.caseId===c.caseId),t=trace.rows.find(x=>x.caseId===c.caseId),r=results.results.find(x=>x.caseId===c.caseId);
  assert.deepEqual(fact(i,''),c.scenarioFacts);assert.deepEqual(i,normalizeRepresentative(c));assert.deepEqual(i,t.input);assert.equal(validateCanonical(i).valid,true);
  const before=hash(i),actual=evaluateCanonicalShadow(i),d=actual.shadowDecision;assert.deepEqual(actual,t.result);assert.equal(hash(i),before);assert.deepEqual(actual.appliedState,actual.officialPlanState);assert.equal(d.applied,false);assert.equal(r.inputHash,d.inputHash);assert.equal(r.coverage,d.coverage);
  if(d.coverage==='CLINICAL_OR_OUT_OF_SCOPE'){clinical++;assert.equal(d.decisionType,'CLINICAL_HUMAN_REQUIRED');continue;}
  assert.equal(d.semanticConsumption.consumed,true);assert.equal(d.semanticConsumption.materialContract.valid,true);normal++;
  if(d.decisionType==='MODIFY'){positive++;assert.ok(d.policyRefs.length&&d.evidenceRefs.length&&d.scientificConditions&&d.requestedScopeSatisfied);assert.ok(['REP-R2-31','REP-R2-33'].includes(c.caseId));}
  if(d.coverage==='SUPPORTED_KEEP')keep++;
  if(d.coverage==='USEFUL_ASK'){ask++;assert.ok(d.missingInputs.length);}
  if(d.coverage==='CORRECT_ABSTAIN_OR_HOLD')hold++;
  if(d.coverage==='NOT_SUPPORTED_DOMAIN_GAP')domain++;
  if(d.coverage==='NOT_SUPPORTED_SCIENCE_GAP')science++;
 }
 assert.deepEqual({normal,positive,keep,ask,hold,domain,science,clinical},{normal:40,positive:2,keep:2,ask:15,hold:2,domain:16,science:3,clinical:2});
 assert.equal(corpus.cases.filter(x=>x.independentExpectation.targetCategory==='POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED').length,23);assert.equal(baseline.positiveCompetentCoaching.ratio,'2/40');assert.equal(baseline.positiveCompetentCoaching.opportunityNumerator,2);assert.equal(baseline.positiveCompetentCoaching.opportunityDenominator,23);assert.equal(baseline.transportAsk,0);
 return {cases:42,normal,positive,keep,ask,hold,domain,science,clinical,positiveOpportunities:23,transportAsk:0};
});
check('all84_scripted_multiweek_rows_exact_current_replay',()=>{
 assert.equal(streams.streams.length,3);let rows=0,positive=0;
 for(const s of streams.streams){assert.equal(s.weeks,4);assert.equal(s.steps.length,28);for(const step of s.steps){const i=step.input,before=hash(i),a=evaluateCanonicalShadow(i);assert.deepEqual(a,step.result);assert.equal(hash(i),before);assert.deepEqual(a.appliedState,a.officialPlanState);assert.equal(a.shadowDecision.applied,false);assert.deepEqual(evaluateCanonicalShadow(i),a);if([2,3,4,5,6].includes(step.day))assert.notEqual(a.shadowDecision.decisionType,'MODIFY');if(step.day===5)assert.equal(a.shadowDecision.decisionType,'CLINICAL_HUMAN_REQUIRED');if(step.day===6)assert.deepEqual(a.observedExecutionState.actualWorkMinutes,[5,3]);rows++;if(a.shadowDecision.decisionType==='MODIFY')positive++;}}
 assert.equal(rows,84);assert.equal(streams.rows,84);return {rows,positive,priorityProfiles:3,weeksEach:4,identicalInputFlips:0,inputMutations:0,officialMutations:0,appliedEffects:0,limits:'Explicit synthetic next contexts; not physiological or autonomous longitudinal inference.'};
});
check('queue_preserves100_and_adds_only_one_exact_approval',()=>{
 const old=load('audits/domain-closure-r3-2026-10-24/before/reviews__provisional-sports-science__2026-10-23__HUMAN_REVALIDATION_QUEUE.json'),q=load('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'),reviews=load('audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json').records;
 assert.equal(old.items.length,100);assert.equal(q.items.length,101);assert.deepEqual(q.items.slice(0,100),old.items);assert.deepEqual(q.funding_trigger,old.funding_trigger);
 const approved=reviews.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS');assert.equal(approved.length,1);const added=q.items[100];assert.equal(added.decision_id,approved[0].review_id);assert.deepEqual(added.target,approved[0].target);assert.deepEqual(added.conditions,approved[0].decision.conditions);return {preserved:100,added:1,total:101,noAbstentionQueued:true,fundingUnchanged:true};
});
check('runtime_does_not_import_corpus_expectations',()=>{for(const file of ['CoachingCore/src/r3-input.mjs','CoachingCore/src/r3-runtime.mjs','CoachingCore/src/r3-consumption.mjs']){const code=fs.readFileSync(new URL(file,root),'utf8');assert.ok(!/from\s+['"][^'"]*(?:REPRESENTATIVE_CORPUS|evaluation|oracles)/.test(code));assert.ok(!/independentExpectation|targetCategory/.test(code));}return {sourceModules:3,noExpectedOutcomeImports:true};});
const targetFiles=['CoachingCore/src/r3-input.mjs','CoachingCore/src/r3-runtime.mjs','CoachingCore/src/r3-consumption.mjs','CoachingCore/scripts/simulate-r3.mjs','CoachingCore/scripts/report-r3.mjs','CoachingCore/r3/TRUE_COVERAGE_BASELINE_R3.json','CoachingCore/r3/REPRESENTATIVE_RUNTIME_RESULTS_R3.json','CoachingCore/r3/REPRESENTATIVE_RUNTIME_TRACES_R3.json','CoachingCore/r3/NORMALIZED_REPRESENTATIVE_CORPUS_R3.json','CoachingCore/r3/MULTIWEEK_STREAMS_R3.json','CoachingCore/r3/REPRESENTATIVE_CORPUS_FORENSICS_R3.json','CoachingCore/r3/FINAL_REPORT.md','CoachingCore/r3/READINESS_VERDICTS_R3.json','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'];
const out={revision:'QUALITY-DCR3-ARTIFACT-CHECKS-1',evaluator:'/root/quality_r3',independent:true,executedAt:new Date().toISOString(),node:process.version,status:'PASS',checks,targetHashes:Object.fromEntries(targetFiles.map(p=>[p,raw(p)]))};
fs.writeFileSync(new URL('quality-artifact-checks.raw.json',import.meta.url),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,checks},null,2));
