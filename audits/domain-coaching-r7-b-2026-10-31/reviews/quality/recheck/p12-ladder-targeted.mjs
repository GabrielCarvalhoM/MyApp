// Q-R7B probe 12: targeted skill-ladder steps through block-boundary weekly reviews. For each scenario the athlete executes as prescribed;
// at each block boundary the review is evaluated once for its offers, then again accepting the wanted step if offered. Records whether
// the step was offered, accepted, and whether the new configuration is prescribed in the weeks after. Output: out/p12-ladder-targeted.json
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const step=(t,w,choices)=>evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...(choices?{choices}:{})}),actualLedger:t.ledger},opts);
const ids=(p,w)=>[...new Set(p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).map(e=>e.id+'/'+e.role)))];
const CASES=[
 {want:['band-assisted-pull-up','chin-up'],o:{equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'STRENGTH'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
 {want:['band-assisted-pull-up','pull-up'],o:{equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
 {want:['goblet-squat','front-squat'],o:{equipment:FULL,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NOVICE'}},
 {want:['kb-deadlift','deadlift'],o:{equipment:FULL,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NOVICE'}},
 {want:['hip-thrust-db','barbell-hip-thrust'],o:{equipment:['DUMBBELLS','BENCH','BARBELL'],goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',knownExercises:[{id:'hip-thrust-db',familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'}]}},
 {want:['db-overhead-press','barbell-overhead-press'],o:{equipment:['DUMBBELLS','BARBELL','RACK'],goals:{run:'PERFORMANCE',strength:'STRENGTH'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
 {want:['scapular-pull-up','band-assisted-pull-up'],o:{equipment:['PULL_UP_BAR','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NOVICE',knownExercises:[{id:'scapular-pull-up',familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'}]}},
 {want:['bird-dog','dead-bug'],o:{equipment:[],goals:{run:'PERFORMANCE',strength:'GENERAL'},knownExercises:[{id:'bird-dog',familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'}]}},
];
const out=[];
for(const c of CASES){
 const [from,to]=c.want,t={p:program({id:'p12-'+to,weeks:16,rotation:'COACH_DECIDES',...c.o}),ledger:[]};const rec={want:from+' -> '+to,offeredAt:null,accepted:null,status:null,inUseBefore:null,after:null};
 for(let w=0;w<16;w++){
  let r=step(t,w);
  const offer=(r.offers??[]).find(o=>o.from===from&&o.to===to);
  if(offer&&!rec.offeredAt){rec.offeredAt=w;rec.inUseBefore=ids(t.p,w).filter(x=>x.startsWith(from));const r2=step(t,w,[{type:'LADDER_STEP',from,to}]);rec.status=r2.status;rec.reason=r2.reason?.slice(0,200);if(r2.status!=='ASK'){r=r2;rec.accepted=w;}}
  t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;
  if(rec.accepted!==null&&rec.after===null&&w>rec.accepted){rec.after={};}
  if(rec.accepted!==null&&w>=rec.accepted+1)rec.after['w'+w]={phase:t.p.weeks[w].phase,rows:ids(t.p,w).filter(x=>x.startsWith(to+'/')||x.startsWith(from+'/'))};
 }
 if(rec.accepted!==null)rec.ladderReached=t.p.canonical.athlete.ladderReached,rec.selections=t.p.canonical.athlete.strengthSelections;
 if(rec.offeredAt===null)rec.everInUse=[...new Set(t.p.weeks.flatMap((_,w)=>ids(t.p,w)).filter(x=>x.startsWith(from+'/')))];
 out.push(rec);
}
fs.writeFileSync(new URL('./out/p12-ladder-targeted.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
