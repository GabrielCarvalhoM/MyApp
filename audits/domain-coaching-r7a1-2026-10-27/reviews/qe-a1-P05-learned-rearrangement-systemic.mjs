// R7A1-QE-r1 P05: the weekly review's own learned-rearrangement branch re-plans next week through `rebuild`, whose gates are computed
// without the systemic flag. A week with converging adverse responses (both sports adverse) in which the athlete-specific pattern is also
// learned: does next week hold every step (as the weekly review does without the pattern), or do the non-adverse run steps advance?
// Uses the R6 simulator over the SHARED_SAME_TURN profile (the R6 test of the learned rearrangement), learning consent on and off.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,runtime,print} from './qe-a1-lib.mjs';
const out={probe:'R7A1-QE-P05',cases:{}};
for(const tag of ['A1','F2']){
 const base=tag==='A1'?path.join(ROOT,'CoachingCore'):path.join(ROOT,'audits/domain-coaching-r7a1-2026-10-27/freeze2-source/CoachingCore');
 const {simulateProgram}=await import(pathToFileURL(path.join(base,'src/r6-simulator.mjs')).href),{EDGE_PROFILES}=await import(pathToFileURL(path.join(base,'r6/fixtures/profiles.mjs')).href),{opts}=await runtime(tag);
 const sh=EDGE_PROFILES.SHARED_SAME_TURN;
 for(const budget of [null,{runMinutes:60,longRunMinutes:90}])for(const consent of [true,false]){
  const input={...structuredClone(sh),learningConsent:consent,schedule:{...sh.schedule,...(budget??{}),temporaryPreference:'STRENGTH',sameTurnConfirmed:true}};
  const weeks=Array.from({length:8},(_,x)=>x===3?{responses:[{sport:"RUN",role:"QUALITY",response:"HARDER"}]}:x===4?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'},{sport:'STRENGTH',response:'HARDER'}]}:{});
  const r=simulateProgram(input,{weeks},opts);
  const d=r.decisions.find(x=>x.kind==='WEEKLY_REVIEW'&&x.weekIndex===4);
  const w6=r.rows[5]?.plannedWeek.sessions.filter(s=>s.prescription).map(s=>`d${s.day} ${s.sport} ${s.role} ${s.sport==='RUN'?s.prescription.durationMinutes:s.prescription.exercises.map(e=>e.id+':'+e.sets).join(',')}`);
  out.cases[`${tag}:budget=${budget?'raised':'profile'}:consent=${consent}`]={learnWeekReview:{action:d?.action,gates:d?.gates},nextWeek:w6,weekAfterNext:r.rows[6]?.plannedWeek.sessions.filter(s=>s.prescription&&s.sport==='RUN').map(s=>s.role+':'+s.prescription.durationMinutes),learned:r.decisions.filter(x=>x.action==='LEARNED_REARRANGEMENT').map(x=>x.weekIndex)};
 }
}
print(out);
