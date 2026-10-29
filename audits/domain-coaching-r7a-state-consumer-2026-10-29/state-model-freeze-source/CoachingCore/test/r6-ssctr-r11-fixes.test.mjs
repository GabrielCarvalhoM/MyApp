import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {startStrengthReturn} from '../src/r6-program.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** Regression tests for the SSCTR round-11 binding defect D53 (reviews/ssctr-policy-review.json, R6-SSCTR-POLICY-r11, probe section AH). */
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let N=0;
/** Probe AH: every week reviewed, everything executed and logged except strength in weeks [from, from+len). */
function skippedStrength({pref,goal,from,len}){
 let p=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
  athlete:{id:`t11-${pref}-${goal}-${from}-${len}`,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80}},opts).program,ledger=[];const done=new Set();
 for(let w=0;w<p.weeks.length-1;w++){
  const kept=p.weeks[w].sessions.filter(s=>s.prescription&&!(s.sport==='STRENGTH'&&w>=from&&w<from+len));
  const o=kept.map(s=>{const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.exercises){actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:20,unit:'KG',convention:e.load.convention}}))}));for(const e of pr.exercises)done.add(s.date+':'+e.id);}return {eventId:`t11-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};});
  const d=addDays(p.weeks[w].startDate,6),r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t11-w${w}-${N++}`,kind:'WEEKLY_REVIEW'},eligibility:elig(d),observations:o,actualLedger:ledger},opts);
  assert.ok(['KEEP','MODIFY'].includes(r.status),`week ${w}: ${r.status}`);ledger=r.actualLedger;if(r.proposal)p=r.proposal;
 }
 return {p,done};
}
/** Every performed re-establishment: the week, the exercise and the week-by-week base counts of its later exposures. */
function reestablishments({p,done}){
 const out=[];
 for(let w=0;w<p.weeks.length-1;w++)for(const s of p.weeks[w].sessions)for(const e of s.prescription?.exercises??[]){
  if(e.load.mode!=='ESTABLISH'||!e.instructions.some(t=>/Not done for more than/.test(t))||!done.has(s.date+':'+e.id)||out.some(x=>x.id===e.id&&x.w===w))continue;
  const later=[];for(let x=w+1;x<p.weeks.length;x++){const pl=p.stateTrace[x].strength.planned?.[e.id];if(pl)later.push({w:x,sets:pl.sets,base:pl.baseSets,normal:pl.normalSets});}
  const bd=x=>p.stateTrace[x]?.strength.exercises[e.id]?.blocksDone??0;
  out.push({w,id:e.id,sets:e.sets,later,creditBeforeGap:bd(w)>0,creditFromReestablishment:w+1<p.stateTrace.length&&bd(w+1)>bd(w)});
 }
 return out;
}
/** The count, block-boundary set included, comes back from the re-establishment count at most one set per later exposure week, and
 * not at all after a week with a phase reduction (SSCTR D53: "one set per executed week without a phase reduction"). */
function assertOneSetAtATime(r,label){
 let prev=r.sets,reduced=false;
 for(const x of r.later){
  const trace=`${label}: ${r.id} re-established in week ${r.w} at ${r.sets} sets; week ${x.w} base ${x.base} after ${prev} (${r.later.map(y=>`w${y.w}:${y.sets}/${y.base}/${y.normal}`).join(' ')})`;
  assert.ok(x.base<=prev+(reduced?0:1),trace);
  prev=Math.max(prev,x.base);reduced=x.sets<x.base;if(x.base>=x.normal)break;
 }
}
const GRID=[];for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const goal of ['STRENGTH','HYPERTROPHY'])for(const from of [3,4])for(const len of [4,5])GRID.push({pref,goal,from,len});
let gridRuns=null;const grid=()=>gridRuns??=GRID.map(g=>({g,all:reestablishments(skippedStrength(g))}));

test('SSCTR D53: strength — after a re-establishment a block-boundary set earned before the gap comes back one set at a time',()=>{
 let seen=0;
 for(const {g,all} of grid())for(const r of all.filter(x=>x.creditBeforeGap)){seen++;assertOneSetAtATime(r,JSON.stringify(g));assert.ok(r.later[0].base<=r.sets+1);}
 assert.ok(seen>0,'a re-establishment with a block-boundary set earned before the gap');
});
test('SSCTR D53: strength — a block whose only executed exposure was the re-establishment adds its set no faster than one set per week',()=>{
 let seen=0;
 for(const {g,all} of grid())for(const r of all.filter(x=>x.creditFromReestablishment)){seen++;assertOneSetAtATime(r,JSON.stringify(g));assert.ok(r.later[0].base<=r.sets+1);}
 assert.ok(seen>0,'a re-establishment week that ends a block and earns its set');
});
test('SSCTR D53: strength — a phase-reduced week after a re-establishment does not advance the regained set count',()=>{
 // Consolidation weeks are 3, 7, 11 and 15: a re-establishment in week 6 or 10 is followed by one while the count is still held back.
 let seen=0;
 for(const g of [{pref:'FIXED',goal:'STRENGTH',from:2,len:4},{pref:'FIXED',goal:'HYPERTROPHY',from:6,len:4},{pref:'EVERY_2_WEEKS',goal:'GENERAL',from:6,len:4}])
  for(const r of reestablishments(skippedStrength(g))){
   const i=r.later.findIndex(x=>x.sets<x.base);if(i<0||i+1>=r.later.length||r.later[i].base>=r.later[i].normal)continue;
   seen++;assert.ok(r.later[i+1].base<=r.later[i].base,`${JSON.stringify(g)} ${r.id}: the count rose after the reduced week ${r.later[i].w} (${r.later.map(y=>`w${y.w}:${y.sets}/${y.base}/${y.normal}`).join(' ')})`);assertOneSetAtATime(r,JSON.stringify(g));
  }
 assert.ok(seen>0,'a re-establishment followed by a phase-reduced week while the count is held back');
});
test('SSCTR D53: strength — a return replaces the regain after a re-establishment: its cap is cleared and the return steps govern the sets',()=>{
 const ex={status:'ESTABLISHED',mode:'KNOWN',load:80,convention:'TOTAL',reps:5,sets:3,rir:2,regainCap:3,lastPerformed:'2026-12-01'};
 const n=startStrengthReturn(ex);assert.equal(n.regainCap,undefined);assert.equal(n.returnStep,0);assert.equal(ex.regainCap,3,'the earlier state is not mutated');
});
test('SSCTR D53: strength — the probe-AH next exposure after any performed re-establishment is at most one set above it, and the earlier count comes back',()=>{
 let n=0;
 for(const g of [{pref:'FIXED',goal:'GENERAL',from:5,len:6},{pref:'EVERY_2_WEEKS',goal:'RUNNING_SUPPORT',from:3,len:6},{pref:'FIXED',goal:'STRENGTH',from:5,len:4}]){
  for(const r of reestablishments(skippedStrength(g))){n++;assertOneSetAtATime(r,JSON.stringify(g));const last=r.later.at(-1);if(r.later.length>=4)assert.ok(last.base>=Math.min(last.normal,r.sets+3),`${r.id}: the count stays held back (${r.later.map(y=>`w${y.w}:${y.base}/${y.normal}`).join(' ')})`);}
 }
 assert.ok(n>0);
});
