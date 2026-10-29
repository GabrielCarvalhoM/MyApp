import fs from 'node:fs';
import crypto from 'node:crypto';
import {normalizeRepresentative,evaluateCoachingShadow} from '../../../CoachingCore/src/r4-index.mjs';
const project=new URL('../../../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,project)));
const frozen=read('CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json'),holdout=read('CoachingCore/r4/holdout/R4_INDEPENDENT_HOLDOUT.json');
const clinical=x=>x.scenarioFacts.eligibility?.clinicalConcern===true;
const rows=[];
for(const [set,corpus] of [['frozen40',frozen],['holdout',holdout]])for(const c of corpus.cases){
 if(set==='frozen40'&&clinical(c))continue;
 const input=normalizeRepresentative({...c,corpusId:corpus.corpusId,corpusVersion:corpus.version});
 const before=JSON.stringify(c.scenarioFacts),ib=JSON.stringify(input),r=evaluateCoachingShadow(input),again=evaluateCoachingShadow(input),d=r.shadowDecision;
 const completed=c.scenarioFacts.completedPrefix??c.scenarioFacts.currentDemand?.session?.completed??null;
 const invariants={sourceUnchanged:before===JSON.stringify(c.scenarioFacts),canonicalUnchanged:ib===JSON.stringify(input),deterministic:JSON.stringify(r)===JSON.stringify(again),appliedEqualsOfficial:JSON.stringify(r.appliedState)===JSON.stringify(r.officialPlanState),completedSourcePreserved:JSON.stringify(r.observedExecutionState)===JSON.stringify(completed),appliedFalse:d.applied===false,shadowOnly:d.effect==='SHADOW_ONLY'};
 rows.push({set,caseId:c.caseId,title:c.title,facts:c.scenarioFacts,decisionType:d.decisionType,coverage:d.coverage,rationale:d.rationale,missingInputs:d.missingInputs,candidate:d.candidate,requestedScopeSatisfied:d.requestedScopeSatisfied,reasoning:d.coachingReasoning,ranking:d.ranking,scientificConditions:d.scientificConditions,limitations:d.limitations,invariants,result:r});
 console.log(JSON.stringify({set,id:c.caseId,type:d.decisionType,coverage:d.coverage,why:d.rationale,recipe:d.candidate?.recipe,missing:d.missingInputs,reasoningGoal:d.coachingReasoning?.goal}));
}
const files=['CoachingCore/src/r4-index.mjs','CoachingCore/src/r4-runtime.mjs','CoachingCore/src/r4-candidates.mjs','CoachingCore/src/r4-context.mjs','CoachingCore/src/r4-athlete-model.mjs','CoachingCore/src/r4-authority.mjs','CoachingCore/src/r3-input.mjs','CoachingCore/src/r3-consumption.mjs','CoachingCore/src/r3-runtime.mjs','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json','CoachingCore/r4/holdout/R4_INDEPENDENT_HOLDOUT.json'];
const reviewedFiles=files.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(new URL(path,project))).digest('hex')}));
fs.writeFileSync(new URL('./quality-runtime-snapshot.json',import.meta.url),JSON.stringify({revision:'QUALITY-RUNTIME-SNAPSHOT-1',node:process.version,reviewedFiles,rows},null,2)+'\n');
