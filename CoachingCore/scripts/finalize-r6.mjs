import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

/**
 * Closing records for DOMAIN_COACHING_R6: the deliverable index (path, role, SHA-256) and the final disposition.
 * Writes CoachingCore/r6/DELIVERABLE_INDEX_R6.json and audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json once.
 * The disposition text comes from READINESS_VERDICTS_R6.json and VERIFICATION.json; nothing is recomputed here.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const R6='CoachingCore/r6/',AUDIT='audits/domain-coaching-r6-2026-10-26/',REVIEWS=AUDIT+'reviews/';
const TOPICS=['R5_HOLDOUT_REGRESSION_R6','BALANCED_HYBRID_R6','COLD_START_ENGINE_R6','INITIAL_PROGRAM_GENERATION_R6','RUN_PROGRAMMING_R6','STRENGTH_PROGRAMMING_R6','HYBRID_PROGRAMMING_R6','SUBSTITUTION_ENGINE_R6','RETURN_ENGINE_R6','EVENT_TRANSITION_R6','ADAPTIVE_COACHING_R6','ATHLETE_MODEL_R6','PROVENANCE_TIME_R6','PROGRAM_QUALITY_R6','OPEN_GAPS_R6'];
const entries=[
 ...TOPICS.flatMap((t,i)=>[[`${i+1}`,R6+t+'.md'],[`${i+1}`,R6+t+'.json']]).map(([n,p])=>({deliverable:Number(n)<=14?n:'22',path:p})),
 {deliverable:'15',path:'CoachingCore/src',role:'Node runtime implementation (r6-*.mjs)'},
 {deliverable:'16',path:'CoachingCore/test',role:'Regression tests (r6-*.test.mjs)'},
 {deliverable:'17',path:R6+'SIMULATION_RESULTS_R6.json',role:'Whole-program simulator results'},
 {deliverable:'18',path:R6+'holdout/R6_INDEPENDENT_HOLDOUT.json',role:'Fresh R6 holdout corpus'},
 {deliverable:'19',path:R6+'holdout/FIRST_EVALUATION.json',role:'First evaluation raw'},
 {deliverable:'20',path:REVIEWS+'coaching-quality-holdout-review.json',role:'Independent coaching-quality review'},
 {deliverable:'21',path:REVIEWS+'ssctr-policy-review.json',role:'SSCTR review where required'},
 {deliverable:'23',path:R6+'READINESS_VERDICTS_R6.json',role:'Readiness verdicts'},
 {deliverable:'24',path:R6+'VERIFICATION.json',role:'Objective verification'},
 {deliverable:'25',path:R6+'FINAL_REPORT.md',role:'Final report'},
 {deliverable:'supporting',path:R6+'R5_HOLDOUT_REPLAY_R6.json',role:'Raw R5 replay through R6'},
 {deliverable:'supporting',path:REVIEWS+'r5-regression-review.json',role:'Independent R5 regression classification'},
 {deliverable:'supporting',path:REVIEWS+'quality-engineering-review.json',role:'Independent engineering review of FREEZE-1 (FAIL; findings fixed in FREEZE-2)'},
 {deliverable:'supporting',path:REVIEWS+'quality-engineering-rereview.json',role:'Independent engineering re-review of FREEZE-2'},
 {deliverable:'supporting',path:R6+'RUNTIME_FREEZE_R6_2.json',role:'Runtime freeze after the engineering fixes (delta against FREEZE-1)'},
 {deliverable:'supporting',path:R6+'holdout/POSTFIX_EVALUATION_FREEZE2.json',role:'Post-fix rerun of the sealed holdout on FREEZE-2 (challenge reuse, not fresh evidence)'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/REVISION_R6_POLICY_3.md',role:'Policy delta for the FREEZE-2 fixes, as reviewed by the SSCTR'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/REVISION_R6_POLICY_4.md',role:'Policy delta answering SSCTR round 7, as reviewed by the SSCTR in round 8'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/REVISION_R6_POLICY_5.md',role:'Policy delta answering SSCTR round 8, as reviewed by the SSCTR in round 9'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/RUNTIME_DELTA_D50_D51.md',role:'Runtime-only delta answering SSCTR round 9 (D50, D51) at the same policy hash'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/RUNTIME_DELTA_D52.md',role:'Runtime-only delta answering SSCTR round 10 (D52) at the same policy hash'},
 {deliverable:'supporting',path:REVIEWS+'ssctr-dossier/RUNTIME_DELTA_D53.md',role:'Runtime-only delta answering SSCTR round 11 (D53) at the same policy hash'},
 {deliverable:'supporting',path:REVIEWS+'r5-regression-rereview.json',role:'Independent R5 regression reclassification of the cases whose output changed on FREEZE-2'},
 {deliverable:'16',path:'CoachingCore/test/r6-engineering-fixes.test.mjs',role:'Regression tests for the engineering findings QRE-R6-01…23'},
 {deliverable:'16',path:'CoachingCore/test/r6-ssctr-r7-fixes.test.mjs',role:'Regression tests for SSCTR round-7 defects D42–D46, recommendations R6, R7, R9, R10 and one author-found return-entry defect (its D45 test also asserts D48)'},
 {deliverable:'16',path:'CoachingCore/test/r6-ssctr-r8-fixes.test.mjs',role:'Regression tests for SSCTR round-8 defects D47–D49, recommendations R11–R13 and one author-found restart change'},
 {deliverable:'16',path:'CoachingCore/test/r6-ssctr-r9-fixes.test.mjs',role:'Regression tests for SSCTR round-9 defects D50 and D51'},
 {deliverable:'16',path:'CoachingCore/test/r6-ssctr-r10-fixes.test.mjs',role:'Regression tests for SSCTR round-10 defect D52 and the author-found conflicted-report change'},
 {deliverable:'16',path:'CoachingCore/test/r6-ssctr-r11-fixes.test.mjs',role:'Regression tests for SSCTR round-11 defect D53 (sets after a re-establishment)'},
 {deliverable:'supporting',path:R6+'DEMONSTRATIONS_R6.json',role:'Demonstrations A–M'},
 {deliverable:'supporting',path:R6+'RUNTIME_FREEZE_R6.json',role:'Runtime freeze FREEZE-1 (first evaluation bound here)'},
 {deliverable:'supporting',path:R6+'PROGRAM_POLICY_R6.json',role:'Reviewed policy'},
 {deliverable:'supporting',path:R6+'CONFORMANCE_SUPERSESSION_R6.md',role:'Conformance supersession'},
 {deliverable:'supporting',path:R6+'holdout/INDEPENDENCE_MANIFEST.json',role:'Holdout independence manifest'},
 {deliverable:'supporting',path:R6+'holdout/INTERFACE_ONLY.md',role:'Holdout interface'}
];
// Without FREEZE-2 (the SSCTR refused it and the Founder bound closed R6 with an explicit blocker) these entries cannot exist; they are
// recorded as not run, with the reason, instead of being required (FOUNDER_LOOP_BOUND.md).
const FREEZE2_ONLY=new Set([REVIEWS+'quality-engineering-rereview.json',R6+'RUNTIME_FREEZE_R6_2.json',R6+'holdout/POSTFIX_EVALUATION_FREEZE2.json',REVIEWS+'r5-regression-rereview.json']),freeze2Refused=!exists(R6+'RUNTIME_FREEZE_R6_2.json');
const fileSha=p=>{const s=fs.statSync(abs(p));if(!s.isDirectory())return sha(p);const files=fs.readdirSync(abs(p)).filter(n=>/^r6-/.test(n)).sort();return createHash('sha256').update(files.map(n=>n+':'+sha(path.posix.join(p,n))).join('\n')).digest('hex');};
const index={revision:'R6-DELIVERABLE-INDEX-1',generatedAt:new Date().toISOString(),entries:entries.map(e=>({...e,present:exists(e.path),sha256:exists(e.path)?fileSha(e.path):null,...(!exists(e.path)&&freeze2Refused&&FREEZE2_ONLY.has(e.path)?{notRun:'FREEZE-2 refused by the SSCTR (round 12); R6 closed with an explicit blocker'}:{})}))};
const missing=index.entries.filter(e=>!e.present&&!e.notRun).map(e=>e.path);
if(missing.length){console.error(JSON.stringify({missing},null,1));process.exitCode=1;}
else{
 fs.writeFileSync(abs(R6+'DELIVERABLE_INDEX_R6.json'),JSON.stringify(index,null,2)+'\n');
 const verdicts=json(R6+'READINESS_VERDICTS_R6.json'),verification=json(R6+'VERIFICATION.json'),freeze1=json(R6+'RUNTIME_FREEZE_R6.json'),freeze=exists(R6+'RUNTIME_FREEZE_R6_2.json')?json(R6+'RUNTIME_FREEZE_R6_2.json'):freeze1,raw=R6+'holdout/FIRST_EVALUATION.json',postfix=R6+'holdout/POSTFIX_EVALUATION_FREEZE2.json',out=abs(AUDIT+'FINAL_DISPOSITION.json');
 if(fs.existsSync(out))throw Error('FINAL_DISPOSITION.json already exists');
 const disposition={revision:'R6-DISPOSITION-1',date:new Date().toISOString(),owner:'/root (Claude Code continuation)',delivery:verdicts.delivery,completeAutonomousDefinitionOfDone:verdicts.completeAutonomousDefinitionOfDone,sourceDigest:freeze.sourceDigest,freezeRevision:freeze.revision,firstEvaluationFreezeDigest:freeze1.sourceDigest,policyHash:verdicts.policyHash,objectiveVerification:{passing:verification.passing,total:verification.total},
  independentJudgments:{science:REVIEWS+'ssctr-policy-review.json',engineering:REVIEWS+'quality-engineering-review.json',engineeringRereview:exists(REVIEWS+'quality-engineering-rereview.json')?REVIEWS+'quality-engineering-rereview.json':null,coaching:REVIEWS+'coaching-quality-holdout-review.json',r5Regression:REVIEWS+'r5-regression-review.json',r5RegressionRereview:exists(REVIEWS+'r5-regression-rereview.json')?REVIEWS+'r5-regression-rereview.json':null},
  firstEvaluation:{path:raw,sha256:sha(raw),freezeDigest:freeze1.sourceDigest,runtimeRetunedBeforeIt:false,corpusRetuned:false},postFixRerun:exists(postfix)?{path:postfix,sha256:sha(postfix),freezeDigest:freeze.sourceDigest,challengeReuse:true,freshEvidence:false}:null,
  verdicts:Object.fromEntries(Object.entries(verdicts.verdicts).map(([k,v])=>[k,v.verdict])),nextEngineeringStep:verdicts.verdicts.NEXT_ENGINEERING_STEP.verdict,blocker:verdicts.blocker??null,freeze2:freeze2Refused?{status:'REFUSED_BY_SSCTR',review:REVIEWS+'ssctr-policy-review.json',revision:json(REVIEWS+'ssctr-policy-review.json').revision,blocking:json(REVIEWS+'ssctr-policy-review.json').freezeVerdict.blocking}:{status:'FROZEN',path:R6+'RUNTIME_FREEZE_R6_2.json'},nextMissionStarted:false,productionOrRealAthleteAuthority:false,uiFigmaKmpChanges:false,commitMergeDeployPerformed:false,deliverableIndex:{path:R6+'DELIVERABLE_INDEX_R6.json',sha256:sha(R6+'DELIVERABLE_INDEX_R6.json')}};
 fs.writeFileSync(out,JSON.stringify(disposition,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({index:index.entries.length,disposition:disposition.delivery,next:disposition.nextEngineeringStep}));
}
