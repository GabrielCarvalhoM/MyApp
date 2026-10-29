// SSCTR R6 independent probe 1: planned trajectory magnitudes across the development profiles.
// Reviewer-authored, read-only use of the runtime. DEV_TEST_ONLY authority enables every boundary for inspection.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../../../CoachingCore/r6/fixtures/profiles.mjs';

const out={probe:'R6-SSCTR-PROBE-TRAJECTORIES',authority:'DEV_TEST_ONLY',profiles:{}};
for(const [name,input] of Object.entries({...PROFILES,...EDGE_PROFILES})){
 const r=generateProgram(input,{authority:devAuthority()});
 if(!r.program){out.profiles[name]={status:r.status,reason:r.reason,missing:r.missingInputs};continue;}
 const p=r.program,cap=p.capability;
 const weeks=p.weeks.map(w=>{
  const runs=w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE');
  const runMin=runs.filter(s=>s.prescription.family!=='WALK').reduce((n,s)=>n+s.prescription.durationMinutes,0);
  const long=runs.find(s=>s.role==='LONG')?.prescription.durationMinutes??null;
  const quality=runs.find(s=>['QUALITY','RACE_TOUCH'].includes(s.role));
  const qWork=quality?.prescription.work?quality.prescription.work.repetitions*quality.prescription.work.workMinutes:0;
  const strides=runs.map(s=>s.prescription.strides?.repetitions??0).reduce((a,b)=>Math.max(a,b),0);
  const shakeStrides=runs.filter(s=>s.role==='SHAKEOUT').map(s=>s.prescription.strides?.repetitions??0)[0]??0;
  const str=w.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription);
  const sets=str.reduce((n,s)=>n+s.prescription.exercises.reduce((m,e)=>m+e.sets,0),0);
  const knownLoads=Object.fromEntries(str.flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='KNOWN').map(e=>[e.id,`${e.load.value}x${e.reps}x${e.sets}@${e.rir}`])));
  const modes=[...new Set(str.flatMap(s=>s.prescription.exercises.map(e=>e.load.mode)))];
  return {w:w.index,phase:w.phase,runMin,long,easy:runs.filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes),walks:w.sessions.filter(s=>s.prescription?.family==='WALK').length,walkJog:runs.filter(s=>s.role==='WALK_JOG').map(s=>s.prescription.work),quality:quality?{role:quality.role,family:quality.prescription.family,work:quality.prescription.work,qWork}:null,strides,shakeStrides,strengthSets:sets,strengthModes:modes,knownLoads,raceTouch:runs.some(s=>s.role==='RACE_TOUCH')};
 });
 const growth=weeks.slice(1).map((x,i)=>{const prev=weeks[i];return {w:x.w,phase:x.phase,runMinDelta:x.runMin-prev.runMin,runMinPct:prev.runMin?Math.round((x.runMin-prev.runMin)/prev.runMin*1000)/10:null,longDelta:x.long!==null&&prev.long!==null?x.long-prev.long:null,longPctVsMaxPriorLong:x.long!==null?(()=>{const m=Math.max(0,...weeks.slice(Math.max(0,i-3),i+1).map(y=>y.long??0));return m?Math.round((x.long-m)/m*1000)/10:null;})():null};});
 const maxPct=growth.filter(g=>g.runMinPct!==null).reduce((m,g)=>g.runMinPct>m.runMinPct?g:m,{runMinPct:-Infinity});
 const maxLongPct=growth.filter(g=>g.longPctVsMaxPriorLong!==null).reduce((m,g)=>g.longPctVsMaxPriorLong>m.longPctVsMaxPriorLong?g:m,{longPctVsMaxPriorLong:-Infinity});
 out.profiles[name]={status:r.status,runClass:cap.run.class,strengthClass:cap.strength.class,reportedWeeklyRunMinutes:cap.run.weeklyMinutes,reportedLongest:cap.run.longestMinutes,week1RunMin:weeks[0].runMin,week1ExceedsReported:cap.run.weeklyMinutes!==null&&weeks[0].runMin>cap.run.weeklyMinutes,week1LongExceedsLongest:cap.run.longestMinutes!==null&&weeks[0].long!==null&&weeks[0].long>cap.run.longestMinutes,maxWeeklyRunPctIncrease:maxPct,maxLongRunPctOverPrior4WeekMax:maxLongPct,arrangement:Object.fromEntries(Object.entries(r.trace.arrangement).map(([k,v])=>[k,{lead:v.lead,basis:v.basis,selectedId:v.selectedId,paretoIds:v.paretoIds}])),weeks,growth};
}
const file=path.join(import.meta.dirname,'ssctr-probe-trajectories.out.json');
fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
for(const [n,v] of Object.entries(out.profiles))console.log(n,v.status,v.runClass,v.strengthClass,'w1',v.week1RunMin,'/',v.reportedWeeklyRunMinutes,'w1>rep',v.week1ExceedsReported,'maxWk%',v.maxWeeklyRunPctIncrease?.runMinPct,'@w',v.maxWeeklyRunPctIncrease?.w,'maxLong%',v.maxLongRunPctOverPrior4WeekMax?.longPctVsMaxPriorLong,'@w',v.maxLongRunPctOverPrior4WeekMax?.w);
