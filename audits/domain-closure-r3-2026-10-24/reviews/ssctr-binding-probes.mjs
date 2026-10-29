import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeRepresentative,validateCanonical} from '../../../CoachingCore/src/r3-input.mjs';
import {evaluateCanonicalShadow} from '../../../CoachingCore/src/r3-runtime.mjs';
import {clone,hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url),here=new URL('./',import.meta.url);
const corpus=JSON.parse(fs.readFileSync(new URL('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json',root)));
const checks=[];
function run(n,change){const c=clone(corpus.cases[n-1]);if(change){change(c.scenarioFacts);c.scenarioFactsSha256=hash(c.scenarioFacts);c.caseId='SSCTR-MUTATION';}const input=normalizeRepresentative(c);const before=hash(input);const result=evaluateCanonicalShadow(input);return {input,result,d:result.shadowDecision,unchanged:before===hash(input)};}
function check(name,condition,observed){checks.push({name,passed:Boolean(condition),observed});}
for(let n=1;n<=42;n++){
 const {input,result,d,unchanged}=run(n);
 check('all42/'+n+'/schema-consumption-preservation-determinism',validateCanonical(input).valid&&unchanged&&d.applied===false&&d.effect==='SHADOW_ONLY'&&hash(result.appliedState)===hash(result.officialPlanState)&&hash(result)===hash(evaluateCanonicalShadow(input)),{decision:d.decisionType,coverage:d.coverage,consumed:d.semanticConsumption.consumed});
}
for(const n of [31,33]){
 const base=run(n);check('positive/'+n+'/exact-review',base.d.decisionType==='MODIFY'&&base.d.policyRefs.length===1&&base.d.evidenceRefs.length===1,base.d.coverage);
 const renamed=clone(base.input);renamed.source.caseId='RENAMED';check('positive/'+n+'/no-case-id-oracle',evaluateCanonicalShadow(renamed).shadowDecision.decisionType==='MODIFY',evaluateCanonicalShadow(renamed).shadowDecision.decisionType);
 const mutations={
  'interruption':f=>f.interruption={reason:'TRAVEL',durationDays:8,nonclinical:true},
  'adverse-current-response':f=>f.observations={response:'INCOMPATIBLE'},
  'clinical-current-pain':f=>f.observations={persistentPain:true},
  'clinical-eligibility':f=>f.eligibility.illness=true,
  'unknown-eligibility':f=>f.eligibility.status='UNKNOWN',
  'missing-current-pain-guard':f=>delete f.eligibility.pain,
  'underage-conflict':f=>f.population.ageYears=15,
  'elite-expansion':f=>f.population.runExperience='ELITE',
  'real-person':f=>f.population.realPerson=true,
  'stale-history':f=>f.priorHistory.stale=true,
  'duplicated-evidence':f=>f.priorHistory.observations=[{eventId:'x'},{eventId:'x'}],
  'extra-history-context':f=>f.priorHistory.extraCurrentProblem='incompatible current response',
  'novel-terrain':f=>f.environment.terrain='steep downhill',
  'unreviewed-calibration':f=>f.calibration.newUnreviewedTarget=100,
  'unreviewed-root-context':f=>f.newContext={unreviewed:true}
 };
 for(const [key,change] of Object.entries(mutations)){const r=run(n,change);check('positive/'+n+'/'+key,r.d.decisionType!=='MODIFY',{decision:r.d.decisionType,coverage:r.d.coverage});if(key==='clinical-current-pain'||key==='clinical-eligibility')check('positive/'+n+'/'+key+'/human',r.d.decisionType==='CLINICAL_HUMAN_REQUIRED',r.d.decisionType);}
}
check('steady/exact-supplied-dose',hash(run(33).d.candidate?.recipe)===hash(JSON.parse(fs.readFileSync(new URL('CoachingCore/r3/domain/STEADY.json',root))).recipe),run(33).d.candidate?.recipe??null);
check('steady/no-invented-request-dose',run(33,f=>f.currentDemand.requestedWorkMinutes=30).d.decisionType!=='MODIFY',run(33,f=>f.currentDemand.requestedWorkMinutes=30).d.decisionType);
check('easy/retain-walk-fallback-and-no-zone',run(31).d.candidate?.recipe.prescription.target.noPhysiologicalZoneClaim===true&&/walk/.test(run(31).d.candidate?.recipe.prescription.target.cue??''),run(31).d.candidate?.recipe??null);
for(const n of [13,14]){
 check('keep/'+n+'/original',run(n).d.decisionType==='KEEP',run(n).d.decisionType);
 check('keep/'+n+'/changed-recovery',run(n,f=>{f.observations.systemic='incompatible';f.observations.recovery='incompatible';}).d.decisionType!=='KEEP',run(n,f=>{f.observations.systemic='incompatible';f.observations.recovery='incompatible';}).d.decisionType);
 check('keep/'+n+'/interruption',run(n,f=>f.interruption={reason:'TRAVEL',durationDays:20,nonclinical:true}).d.decisionType!=='KEEP',run(n,f=>f.interruption={reason:'TRAVEL',durationDays:20,nonclinical:true}).d.decisionType);
}
check('strides/no-full-session-positive',run(39).d.decisionType==='ASK'&&run(39).d.coverage==='USEFUL_ASK'&&run(39).d.candidate===null,run(39).d.missingInputs);
check('return23/no-dose-on-incompatible-entry',run(23).d.decisionType==='HOLD'&&run(23).d.candidate===null,run(23).d.coverage);
check('learning42/no-causal-rule',run(42).d.decisionType==='HOLD'&&run(42).d.candidate===null,run(42).d.coverage);
for(const n of [19,20,21,22,25,26,27,28,29,34,35,36,38,40,41])check('unresolved/'+n+'/no-dose-invention',run(n).d.candidate===null&&run(n).d.decisionType!=='MODIFY',run(n).d.coverage);
for(const n of [24,30])check('clinical/'+n+'/human',run(n).d.decisionType==='CLINICAL_HUMAN_REQUIRED'&&run(n).d.candidate===null,run(n).d.coverage);
const originalProbeCount=checks.length;
for(const n of [31,33]){
 const empty=run(n,f=>f.priorHistory={});check('material/'+n+'/empty-history-not-consumed',empty.d.semanticConsumption.consumed===false&&empty.d.candidate===null&&empty.d.coverage==='NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP',empty.d.semanticConsumption.materialContract);
}
const emptyDose=run(10,f=>f.completedPrefix.actualWorkMinutes=[]);check('material/partial/empty-actual-not-consumed',emptyDose.d.semanticConsumption.consumed===false&&emptyDose.d.candidate===null&&emptyDose.d.coverage==='NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP',emptyDose.d.semanticConsumption.materialContract);
const changedDose=run(10,f=>f.completedPrefix.actualWorkMinutes=[4,2]);check('material/partial/rationale-uses-actual',changedDose.d.rationale.includes('[4,2]')&&!changedDose.d.rationale.includes('5min plus 3min'),changedDose.d.rationale);
const fills={
 18:f=>{f.currentDemand.requested.loadKgPerHand=10;f.history.requestedMovementFamiliar=true;f.history.completeAlternativeRecipe=true;},
 28:f=>{f.priorHistory.run={longestRecentRun:'known explicit current90min'};f.calibration.halfMarathonPace=360;},
 38:f=>{f.calibration.grade=5;f.calibration.duration=15;f.calibration.downhillExposure='familiar';f.environment.surface='dry';},
 39:f=>{f.priorHistory.sameFamily.preparation='explicit familiar preparation';f.currentDemand.sessionEnvelope='explicit complete current envelope';}
};
for(const [n,fill] of Object.entries(fills)){
 const r=run(Number(n),fill);check('material/filled/'+n+'/no-stale-ask',r.d.decisionType!=='ASK'&&r.d.missingInputs.length===0,{decision:r.d.decisionType,missing:r.d.missingInputs});check('material/filled/'+n+'/no-unreviewed-positive',r.d.decisionType!=='MODIFY'&&r.d.candidate===null,r.d.coverage);
}
for(const value of ['present','persistent with ordinary jogging']){const r=run(31,f=>f.observations={pain:value});check('clinical/narrative/'+value,r.d.decisionType==='CLINICAL_HUMAN_REQUIRED',r.d.decisionType);}
for(const value of ['no pain','none','unknown']){const r=run(31,f=>f.observations={pain:value});check('clinical/nonpositive-narrative/'+value,r.d.decisionType!=='CLINICAL_HUMAN_REQUIRED'&&r.d.decisionType!=='MODIFY',r.d.decisionType);}
const targetFiles=['CoachingCore/src/r3-runtime.mjs','CoachingCore/src/r3-consumption.mjs','CoachingCore/src/r3-input.mjs','CoachingCore/r3/CANONICAL_COACHING_INPUT_R3_SCHEMA.json','CoachingCore/r3/domain/STEADY.json','CoachingCore/r3/domain/STRIDES.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json'];
const targets=targetFiles.map(path=>({path,sha256:createHash('sha256').update(fs.readFileSync(new URL(path,root))).digest('hex')}));
const output={reviewer:'/root/ssctr_r3',date:'2026-10-25',passed:checks.every(x=>x.passed),originalProbeCount,affectedChangeProbeCount:checks.length-originalProbeCount,total:checks.length,passing:checks.filter(x=>x.passed).length,failures:checks.filter(x=>!x.passed),targets,checks};
fs.writeFileSync(new URL('ssctr-binding-probes.json',here),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({passed:output.passed,total:output.total,passing:output.passing,failures:output.failures}));
process.exitCode=output.passed?0:1;
