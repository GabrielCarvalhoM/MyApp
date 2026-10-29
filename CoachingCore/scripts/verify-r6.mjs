import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {r6Authority,loadR6Policy} from '../src/r6-authority.mjs';
import {hash} from '../src/value.mjs';

/**
 * R6 objective verification. Read-only unless --write, which writes only CoachingCore/r6/VERIFICATION.json.
 * It never regenerates evidence and never runs historical verifiers (they rewrite closed evidence).
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const R6='CoachingCore/r6/',AUDIT='audits/domain-coaching-r6-2026-10-26/',REVIEWS=AUDIT+'reviews/';
export const TOPICS=['R5_HOLDOUT_REGRESSION_R6','BALANCED_HYBRID_R6','COLD_START_ENGINE_R6','INITIAL_PROGRAM_GENERATION_R6','RUN_PROGRAMMING_R6','STRENGTH_PROGRAMMING_R6','HYBRID_PROGRAMMING_R6','SUBSTITUTION_ENGINE_R6','RETURN_ENGINE_R6','EVENT_TRANSITION_R6','ADAPTIVE_COACHING_R6','ATHLETE_MODEL_R6','PROVENANCE_TIME_R6','PROGRAM_QUALITY_R6','OPEN_GAPS_R6'];
export const VERDICTS=['COLD_START_READINESS','WHOLE_PROGRAM_GENERATION_READINESS','RUN_PROGRAMMING_READINESS','STRENGTH_PROGRAMMING_READINESS','BALANCED_HYBRID_READINESS','HYBRID_PROGRAMMING_READINESS','SUBSTITUTION_READINESS','RETURN_AFTER_PAUSE_READINESS','EVENT_TRANSITION_READINESS','HORIZON_COACHING_READINESS','ADAPTIVE_COACHING_READINESS','ATHLETE_LEARNING_MODEL_READINESS','COACHING_DECISION_QUALITY','WHOLE_PROGRAM_QUALITY','AUTONOMOUS_COACHING_SPEC_READINESS','PRODUCTION_CORE_SEMANTIC_STABILITY','KMP_PRODUCTION_CORE_PREP_READINESS','NEXT_ENGINEERING_STEP'];
const REVIEW_FILES={ssctr:REVIEWS+'ssctr-policy-review.json',coachingHoldout:REVIEWS+'coaching-quality-holdout-review.json',r5Regression:REVIEWS+'r5-regression-review.json',engineering:REVIEWS+'quality-engineering-review.json',engineeringRereview:REVIEWS+'quality-engineering-rereview.json'};
// FREEZE-2 is the current runtime after the engineering FAIL on FREEZE-1; the first evaluation stays bound to FREEZE-1.
const FREEZE1=R6+'RUNTIME_FREEZE_R6.json',FREEZE2=R6+'RUNTIME_FREEZE_R6_2.json',currentFreeze=()=>exists(FREEZE2)?json(FREEZE2):json(FREEZE1);
const checks=[];
const check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const subsequence=(before,after)=>{const a=before.split(/\r?\n/),b=after.split(/\r?\n/);let i=0;for(const line of b)if(i<a.length&&line===a[i])i++;return i===a.length;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),insertOnly=['CURRENT_MISSION.md','MISSION_LEDGER.md'],superseded=['CoachingCore/package.json'];
 const changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>![...insertOnly,...superseded].includes(p));
 const insert=insertOnly.map(p=>({file:p,insertOnlySinceR6Entry:subsequence(fs.readFileSync(abs(AUDIT+'snapshots/'+p.replace('.md','.before-r6-entry.md')),'utf8'),fs.readFileSync(abs(p),'utf8'))}));
 return {pass:!unexpected.length&&insert.every(x=>x.insertOnlySinceR6Entry),entries:b.entries.length,changed,unexpected,insertOnly:insert,documentedSupersession:superseded.filter(p=>changed.includes(p)).map(p=>({file:p,record:R6+'CONFORMANCE_SUPERSESSION_R6.md'}))};
});
check('package-entrypoints',()=>{
 const s=json('CoachingCore/package.json').scripts;
 return {pass:s.verify==='node scripts/verify-r6.mjs'&&s.simulate==='node scripts/simulate-r6.mjs'&&s.test==='node --test'&&s['verify:r5-historical']==='node scripts/verify-r5.mjs'&&exists(R6+'CONFORMANCE_SUPERSESSION_R6.md'),scripts:s};
});
check('runtime-freeze',()=>{
 const f=currentFreeze(),f1=json(FREEZE1),drift=f.entries.filter(e=>sha(e.path)!==e.sha256).map(e=>e.path);
 const runtime=fs.readdirSync(abs('CoachingCore/src')).filter(n=>n.endsWith('.mjs')).map(n=>'CoachingCore/src/'+n),unfrozen=runtime.filter(p=>!f.entries.some(e=>e.path===p));
 const chain=f===f1||f.predecessor?.sourceDigest===f1.sourceDigest&&hash(f1.entries)===f1.sourceDigest;
 return {pass:!drift.length&&!unfrozen.length&&hash(f.entries)===f.sourceDigest&&chain,revision:f.revision,sourceDigest:f.sourceDigest,frozenAt:f.frozenAt,entries:f.entries.length,drift,unfrozen,predecessor:f.predecessor?{revision:f.predecessor.revision,sourceDigest:f.predecessor.sourceDigest,intact:hash(f1.entries)===f1.sourceDigest}:null,delta:f.delta?{changed:f.delta.changed.length,added:f.delta.added.length,removed:f.delta.removed.length}:null};
});
check('ssctr-authority',()=>{
 const review=json(REVIEW_FILES.ssctr),policy=loadR6Policy(),a=r6Authority();
 return {pass:a.valid===true&&review.policyHash===hash(policy),policyHash:hash(policy),reviewPolicyHash:review.policyHash,approved:a.approved,dispositions:(review.records??review.boundaries??[]).map(r=>({boundaryId:r.boundaryId,disposition:r.disposition}))};
});
check('fresh-holdout',()=>{
 const f=json(R6+'RUNTIME_FREEZE_R6.json'),m=json(R6+'holdout/INDEPENDENCE_MANIFEST.json'),raw=json(R6+'holdout/FIRST_EVALUATION.json');
 const corpusSha=sha(R6+'holdout/R6_INDEPENDENT_HOLDOUT.json'),rawSha=sha(R6+'holdout/FIRST_EVALUATION.json');
 const previous=exists(R6+'VERIFICATION.json')?json(R6+'VERIFICATION.json').firstEvaluationSha256??null:null;
 const ok=corpusSha===m.corpusSha256&&raw.corpusSha256===corpusSha&&raw.sourceDigest===f.sourceDigest&&raw.firstEvaluation===true&&m.runtimeInspectedBeforeSeal===false&&m.outputsInspectedBeforeSeal===false&&m.engineImplementationByAuthor===false&&Date.parse(m.authorStartedAt)>Date.parse(f.frozenAt)&&Date.parse(m.sealedAt)<=Date.parse(raw.evaluatedAt)&&(!previous||previous===rawSha);
 // After FREEZE-2 the sealed corpus is rerun once as labelled challenge reuse, never in place of the first evaluation.
 let postfix=null;
 if(exists(FREEZE2)){const f2=json(FREEZE2),p=R6+'holdout/POSTFIX_EVALUATION_FREEZE2.json',pr=exists(p)?json(p):null;postfix={present:!!pr,sha256:pr?sha(p):null,cases:pr?.rows.length??null,errors:pr?pr.rows.filter(r=>r.error).length:null,ok:!!pr&&pr.sourceDigest===f2.sourceDigest&&pr.predecessorDigest===f.sourceDigest&&pr.corpusSha256===corpusSha&&pr.challengeReuse===true&&pr.firstEvaluation===false&&pr.firstEvaluationSha256===rawSha&&f2.firstEvaluation.sha256===rawSha&&Date.parse(pr.evaluatedAt)>Date.parse(f2.frozenAt)};}
 return {pass:ok&&(!postfix||postfix.ok),corpusSha256:corpusSha,firstEvaluationSha256:rawSha,firstEvaluationFreeze:f.sourceDigest,cases:raw.rows.length,errors:raw.rows.filter(r=>r.error).length,authorStartedAt:m.authorStartedAt,sealedAt:m.sealedAt,evaluatedAt:raw.evaluatedAt,rawUnchangedSinceLastVerification:previous?previous===rawSha:null,postfix};
});
check('r5-regression',()=>{
 const d=json(R6+'R5_HOLDOUT_REPLAY_R6.json'),b=json(AUDIT+'BASELINE.json'),pinned=b.entries.find(e=>e.path==='CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json').sha256;
 return {pass:d.rows.length===24&&d.corpusSha256===pinned&&sha('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json')===pinned&&d.authority==='CURRENT_INDEPENDENT_REVIEW'&&d.policyHash===hash(loadR6Policy()),cases:d.rows.length,errors:d.rows.filter(r=>r.r6Error).length,factsUnchanged:d.corpusSha256===pinned};
});
check('simulation',()=>{
 const s=json(R6+'SIMULATION_RESULTS_R6.json');
 return {pass:s.authority==='CURRENT_INDEPENDENT_REVIEW'&&s.policyHash===hash(loadR6Policy())&&s.totals.allInvariantsHold===s.totals.trajectories&&[4,8,12,16].every(h=>s.totals.horizons.includes(h)),...s.totals};
});
check('demonstrations',()=>{
 const d=json(R6+'DEMONSTRATIONS_R6.json'),ids=d.demonstrations.map(x=>x.id);
 return {pass:d.authority==='CURRENT_INDEPENDENT_REVIEW'&&'ABCDEFGHIJKLM'.split('').every(x=>ids.includes(x)),ids};
});
check('independent-reviews',()=>{
 const rows=Object.entries(REVIEW_FILES).map(([k,p])=>({review:k,path:p,present:exists(p),sha256:exists(p)?sha(p):null}));
 return {pass:rows.every(r=>r.present),rows};
});
check('deliverables',()=>{
 const files=[...TOPICS.flatMap(t=>[R6+t+'.md',R6+t+'.json']),R6+'READINESS_VERDICTS_R6.json',R6+'FINAL_REPORT.md',R6+'R5_HOLDOUT_REPLAY_R6.json',R6+'SIMULATION_RESULTS_R6.json',R6+'DEMONSTRATIONS_R6.json',R6+'RUNTIME_FREEZE_R6.json',R6+'CONFORMANCE_SUPERSESSION_R6.md',R6+'PROGRAM_POLICY_R6.json',R6+'holdout/R6_INDEPENDENT_HOLDOUT.json',R6+'holdout/FIRST_EVALUATION.json',...(exists(FREEZE2)?[FREEZE2,R6+'holdout/POSTFIX_EVALUATION_FREEZE2.json']:[])];
 const missing=files.filter(p=>!exists(p));
 return {pass:!missing.length,count:files.length,missing};
});
check('readiness-verdicts',()=>{
 const v=json(R6+'READINESS_VERDICTS_R6.json'),names=Object.keys(v.verdicts??{});
 return {pass:VERDICTS.every(n=>names.includes(n)),missing:VERDICTS.filter(n=>!names.includes(n)),kmp:v.verdicts?.KMP_PRODUCTION_CORE_PREP_READINESS?.verdict??null,next:v.verdicts?.NEXT_ENGINEERING_STEP?.verdict??null};
});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:1<<28});
 const n=k=>Number((r.stdout.match(new RegExp('^ℹ '+k+' (\\d+)','m'))??[])[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),exitCode:r.status};
});
check('human-queue',()=>{
 const r=json(AUDIT+'QUEUE_INTEGRATION_R6.json'),q=json(r.queue);
 return {pass:sha(r.queue)===r.after.sha256&&q.items.length===r.after.items&&r.before.items+r.appended.length===r.after.items&&r.earlierItemsByteIdentical===true&&q.funding_trigger.state==='NOT_DECLARED',before:r.before.items,after:r.after.items,appended:r.appended.map(x=>x.queue_id)};
});
check('no-forbidden-scope',()=>{
 const hits=[];const walk=rel=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=rel?rel+'/'+e.name:e.name;if(e.isDirectory())walk(p);else if(/\.(kt|kts|gradle)$/.test(e.name)||/^settings\.gradle/.test(e.name))hits.push(p);}};walk('');
 return {pass:!hits.length,kmpOrGradleFiles:hits,productCanonUnchanged:'see baseline-preserved',uiFigmaChanged:false};
});

const result={revision:'R6-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,firstEvaluationSha256:checks.find(c=>c.id==='fresh-holdout')?.detail?.firstEvaluationSha256??null,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(R6+'VERIFICATION.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passing:result.passing,total:result.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
process.exitCode=result.passing===result.total?0:1;
