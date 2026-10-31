// Q-R7B probe 15: the BLOCK_REVIEW disclosure options ('Keep the plan', 'Change a main lift with a reason', 'Step back on a skill ladder')
// against what the block-boundary review accepts, and the EXERCISE_SUBSTITUTION path for stepping back. Output: out/p15-block-review-options.json
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const t={p:program({id:'p15',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',equipment:FULL}),ledger:[]};
const at=(w,x={})=>evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...x}),actualLedger:t.ledger},opts);
for(let w=0;w<4;w++){const r=at(w);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
const inUse=[...new Set(t.p.weeks[4].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).map(e=>e.id+'/'+e.role)))];
const plain=at(4),blockReview=(plain.disclosures??[]).find(d=>d.id==='BLOCK_REVIEW');
const out={inUse,blockReviewOptions:blockReview?.options??null,attempts:{}};
// Step back on the ladder at the block review, by the choice types the boundary knows.
out.attempts.ladderStepBackwards=(r=>({status:r.status,reason:r.reason?.slice(0,200)}))(at(4,{choices:[{type:'LADDER_STEP',from:'db-row',to:'band-row'}]}));
out.attempts.stepBackType=(r=>({status:r.status,action:r.action,reason:r.reason?.slice(0,200)}))(at(4,{choices:[{type:'LADDER_STEP_BACK',from:'db-row',to:'band-row'}]}));
out.attempts.mainChangeToPrevious=(r=>({status:r.status,action:r.action,reason:r.reason?.slice(0,200)}))(at(4,{choices:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'box-squat-bodyweight',reason:'ATHLETE_PREFERENCE'}]}));
// The substitution review (a separate review kind) for an accessory.
const acc=inUse.find(x=>x.endsWith('/ACCESSORY')&&!x.startsWith('dead-bug'))?.split('/')[0];
out.attempts.substitutionSkillMismatch=(r=>({exercise:acc,status:r.status,action:r.action,selected:r.substitutions?.[0]?.selected??null,reason:r.reason?.slice(0,200)}))(evaluateProgram(t.p,{...review(t.p,4,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:acc,reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
fs.writeFileSync(new URL('./out/p15-block-review-options.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
