import fs from 'node:fs';
import crypto from 'node:crypto';
import {simulateProgram} from '../../../CoachingCore/src/r5-simulator.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r5-adaptation.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8').replace(/^\uFEFF/,''));
const raw=read('CoachingCore/r5/SIMULATION_RESULTS_R5.json'),demos=read('CoachingCore/r5/DEMONSTRATIONS_R5.json'),rows=[];
for(const source of raw.trajectories){
 const replay=simulateProgram(source.input,source.eventFixtures),decisions=replay.rows.map(r=>({weekIndex:r.weekIndex,phase:r.phase,event:r.review.event.kind,status:r.decision.status,action:r.decision.action,reason:r.decision.reason,mutation:r.decision.proposal!==null,missing:r.decision.missingInputs,modelCount:r.decision.updatedModel?.observations.length,exclusionCount:r.decision.excludedObservations?.length,targetSessionId:r.review.targetSessionId,athleteEvidence:r.decision.athleteEvidence,selectedScheduleId:r.decision.schedule?.id}));
 rows.push({id:source.id,storedResultHash:hash(source.result),replayResultHash:hash(replay),exactReplay:hash(source.result)===hash(replay),summary:replay.summary,materialDecisions:decisions.filter(r=>r.event!=='REVIEW'||r.status!=='KEEP'),wholeProgramCoverage:{phases:replay.finalProgram?.blocks.map(b=>b.phase),eventGapCount:replay.finalProgram?.gaps.length}});
}
const g=demos.scenarios.find(x=>x.id==='G'),gd=evaluateProgram(g.programBefore,g.review);
const report={evaluator:'/root/quality',purpose:'INDEPENDENT_DEV_SIMULATION_REPLAY_NOT_HOLDOUT',runtime:process.version,generatedAt:new Date().toISOString(),sourceHashes:Object.fromEntries(fs.readdirSync(new URL('CoachingCore/src/',root)).filter(x=>x.startsWith('r5-')).map(x=>['CoachingCore/src/'+x,crypto.createHash('sha256').update(fs.readFileSync(new URL('CoachingCore/src/'+x,root))).digest('hex')])),rows,G:{exactReplay:hash(gd)===hash(g.decision),status:gd.status,action:gd.action,reason:gd.reason,evidence:gd.athleteEvidence,officialUnchanged:hash(gd.officialPlanState)===hash(gd.appliedState)}};
fs.writeFileSync(new URL('./'+(process.argv[2]??'quality-simulation-replay-candidate.json'),import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
