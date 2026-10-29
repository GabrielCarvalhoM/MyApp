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
 {deliverable:'supporting',path:REVIEWS+'quality-engineering-review.json',role:'Independent engineering review'},
 {deliverable:'supporting',path:R6+'DEMONSTRATIONS_R6.json',role:'Demonstrations A–M'},
 {deliverable:'supporting',path:R6+'RUNTIME_FREEZE_R6.json',role:'Runtime freeze'},
 {deliverable:'supporting',path:R6+'PROGRAM_POLICY_R6.json',role:'Reviewed policy'},
 {deliverable:'supporting',path:R6+'CONFORMANCE_SUPERSESSION_R6.md',role:'Conformance supersession'},
 {deliverable:'supporting',path:R6+'holdout/INDEPENDENCE_MANIFEST.json',role:'Holdout independence manifest'},
 {deliverable:'supporting',path:R6+'holdout/INTERFACE_ONLY.md',role:'Holdout interface'}
];
const fileSha=p=>{const s=fs.statSync(abs(p));if(!s.isDirectory())return sha(p);const files=fs.readdirSync(abs(p)).filter(n=>/^r6-/.test(n)).sort();return createHash('sha256').update(files.map(n=>n+':'+sha(path.posix.join(p,n))).join('\n')).digest('hex');};
const index={revision:'R6-DELIVERABLE-INDEX-1',generatedAt:new Date().toISOString(),entries:entries.map(e=>({...e,present:exists(e.path),sha256:exists(e.path)?fileSha(e.path):null}))};
const missing=index.entries.filter(e=>!e.present).map(e=>e.path);
if(missing.length){console.error(JSON.stringify({missing},null,1));process.exitCode=1;}
else{
 fs.writeFileSync(abs(R6+'DELIVERABLE_INDEX_R6.json'),JSON.stringify(index,null,2)+'\n');
 const verdicts=json(R6+'READINESS_VERDICTS_R6.json'),verification=json(R6+'VERIFICATION.json'),freeze=json(R6+'RUNTIME_FREEZE_R6.json'),raw=R6+'holdout/FIRST_EVALUATION.json',out=abs(AUDIT+'FINAL_DISPOSITION.json');
 if(fs.existsSync(out))throw Error('FINAL_DISPOSITION.json already exists');
 const disposition={revision:'R6-DISPOSITION-1',date:new Date().toISOString(),owner:'/root (Claude Code continuation)',delivery:verdicts.delivery,completeAutonomousDefinitionOfDone:verdicts.completeAutonomousDefinitionOfDone,sourceDigest:freeze.sourceDigest,policyHash:verdicts.policyHash,objectiveVerification:{passing:verification.passing,total:verification.total},
  independentJudgments:{science:REVIEWS+'ssctr-policy-review.json',engineering:REVIEWS+'quality-engineering-review.json',coaching:REVIEWS+'coaching-quality-holdout-review.json',r5Regression:REVIEWS+'r5-regression-review.json'},
  firstEvaluation:{path:raw,sha256:sha(raw),runtimeRetuned:false,corpusRetuned:false},
  verdicts:Object.fromEntries(Object.entries(verdicts.verdicts).map(([k,v])=>[k,v.verdict])),nextEngineeringStep:verdicts.verdicts.NEXT_ENGINEERING_STEP.verdict,nextMissionStarted:false,productionOrRealAthleteAuthority:false,uiFigmaKmpChanges:false,commitMergeDeployPerformed:false,deliverableIndex:{path:R6+'DELIVERABLE_INDEX_R6.json',sha256:sha(R6+'DELIVERABLE_INDEX_R6.json')}};
 fs.writeFileSync(out,JSON.stringify(disposition,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({index:index.entries.length,disposition:disposition.delivery,next:disposition.nextEngineeringStep}));
}
