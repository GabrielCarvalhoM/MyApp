import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {skeletonOf} from '../src/r6-program.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** Regression tests for the SSCTR round-9 binding defects D50 and D51 (reviews/ssctr-policy-review.json, R6-SSCTR-POLICY-r9). */
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id,weeks=16,athlete={},schedule={}}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
  athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[2,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:45,longRunDay:6,longRunMinutes:100,...schedule}};
}
/** The probe-S profile: three run days, the long run on the last one, strength on two other days. */
const runner=(id,W,L,{goal={run:'REGULAR',strength:'GENERAL'},experience='INTERMEDIATE'}={})=>intake({id,athlete:{goals:goal,runExperience:experience,recent:{runDaysPerWeek:3,runMinutesPerWeek:W,longestRunMinutes:L,strengthDaysPerWeek:2}},schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}});
const BUILD=['DEVELOPMENT','BUILD','NEXT_BLOCK','SPECIFIC'];
const weeksOf=P=>P.weeks.map(w=>({phase:w.phase,run:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.prescription.family!=='WALK').reduce((n,s)=>n+s.prescription.durationMinutes,0),walks:w.sessions.filter(s=>s.role==='WALK').length,long:w.sessions.find(s=>s.role==='LONG'&&s.prescription)?.prescription.durationMinutes??null,easy:w.sessions.filter(s=>s.role==='EASY'&&s.prescription).map(s=>s.prescription.durationMinutes).sort((a,b)=>a-b),quality:w.sessions.find(s=>s.role==='QUALITY'&&s.prescription)?.progression?.value??null}));
/** The probe-S stall measure: consecutive build weeks whose running does not exceed the previous build week's and convert no walk. */
function longestFlatRun(P){
 let best=0,cur=0,prev=null;
 for(const x of weeksOf(P)){if(!BUILD.includes(x.phase))continue;if(prev&&x.run<=prev.run&&x.walks>=prev.walks)cur++;else cur=0;best=Math.max(best,cur);prev=x;}
 return best;
}
/** Under a 50-minute long run, a week never raises the long run together with an easy run or the quality step. */
function twoIncreasesUnder50(P){
 const wk=weeksOf(P),out=[];
 for(let i=1;i<wk.length;i++){const a=wk[i-1],b=wk[i];if(!BUILD.includes(a.phase)||!BUILD.includes(b.phase))continue;
  const longUp=a.long!==null&&b.long!==null&&b.long>a.long,easyUp=b.easy.length===a.easy.length&&b.easy.some((x,j)=>x>a.easy[j]),qUp=a.quality!==null&&b.quality!==null&&b.quality>a.quality;
  if(longUp&&a.long<50&&(easyUp||qUp))out.push(`week ${i}: long ${a.long}->${b.long}${easyUp?`, easy ${a.easy}->${b.easy}`:''}${qUp?`, quality ${a.quality}->${b.quality}`:''}`);}
 return out;
}

// ---------- D50: a long-run step the share cap holds is no increase ----------
test('SSCTR D50: probe-S 45/25 and 60/35 runners keep progressing when the share cap holds the long run',()=>{
 for(const [W,L] of [[45,25],[60,35]]){
  const P=generateProgram(runner(`t9-d50-${W}-${L}`,W,L),opts).program,wk=weeksOf(P),build=wk.filter(x=>BUILD.includes(x.phase));
  assert.ok(P.weeks.some(w=>w.sessions.some(s=>s.progression?.heldBy==='LONG_RUN_SHARE')),`${W}/${L}: the share cap holds the long run in some week`);
  assert.ok(longestFlatRun(P)<4,`${W}/${L}: ${longestFlatRun(P)} flat build weeks in a row`);
  assert.ok(build.at(-1).run>build[Math.floor(build.length/2)].run,`${W}/${L}: running grows in the second half (${build.map(x=>x.run)})`);
  assert.ok(Math.max(...build.at(-1).easy)>Math.max(...build[0].easy),`${W}/${L}: an easy run steps`);
  assert.deepEqual(twoIncreasesUnder50(P),[],`${W}/${L}: one increase per week under a 50-minute long run`);
 }
});
test('SSCTR D50: the quality ladder advances while the share cap holds the long run',()=>{
 const P=generateProgram(runner('t9-d50-quality',90,40,{goal:{run:'PERFORMANCE',strength:'GENERAL'},experience:'EXPERIENCED'}),opts).program;
 const steps=P.stateTrace.map(s=>s.run.qualityStep??0),active=weeksOf(P).filter(x=>x.quality!==null).length;
 assert.ok(active>=4,`quality is active for ${active} weeks`);
 assert.ok(steps.at(-1)>steps[0],`the quality ladder advances (${steps[0]} to ${steps.at(-1)})`);
 assert.ok(longestFlatRun(P)<4);assert.deepEqual(twoIncreasesUnder50(P),[]);
});
test('SSCTR D50: the all-walk athlete keeps progressing under the share cap after its walks convert, in projection and under executed reviews',()=>{
 const input=intake({id:'t9-d50-walks',athlete:{recent:{runDaysPerWeek:2,runMinutesPerWeek:15,longestRunMinutes:15,strengthDaysPerWeek:2}},schedule:{runMinutes:45,longRunMinutes:60}});
 const P=generateProgram(input,opts).program,F=simulateProgram(input,{},opts).finalProgram;
 for(const [label,Q] of [['projection',P],['executed',F]]){
  assert.equal(Q.stateTrace.at(-1).run.walks,0,`${label}: both walks convert`);
  assert.ok(longestFlatRun(Q)<4,`${label}: ${longestFlatRun(Q)} flat build weeks in a row`);
  assert.deepEqual(twoIncreasesUnder50(Q),[],label);
 }
});
test('SSCTR D50: an executed 45/25 runner progresses past a long run the share cap holds',()=>{
 const F=simulateProgram(runner('t9-d50-sim',45,25),{},opts).finalProgram;
 assert.ok(longestFlatRun(F)<4);assert.deepEqual(twoIncreasesUnder50(F),[]);
 const wk=weeksOf(F).filter(x=>BUILD.includes(x.phase));assert.ok(wk.at(-1).run>wk[0].run);
});

// ---------- D51: a return ends with the exercises in use ----------
/** Probe Y: weeks 0–5 executed and reviewed, a 14-day travel pause from Monday of week 6, the return review the day after, then every
 * later week executed (sessions inside the pause excluded) and reviewed. */
function rotationAfterReturn(rotation){
 let n=0;const rv=(p,w,day,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t9-d51-${rotation}-${w}-${n++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),...x};};
 const obs=(p,s)=>({eventId:`t9-d51-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes,...(s.prescription.exercises?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.value??20,unit:'KG',convention:e.load.convention}}))}))}:{})},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}});
 let p=generateProgram(intake({id:`t9-d51-${rotation}`,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:rotation}}),opts).program,ledger=[];
 for(let w=0;w<6;w++){const r=evaluateProgram(p,rv(p,w,6,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const pauseFrom=p.weeks[6].startDate,back=addDays(p.weeks[8].startDate,0);
 const r0=evaluateProgram(p,rv(p,8,0,{kind:'RETURN_AFTER_PAUSE',interruption:{days:14,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
 assert.equal(r0.action,'REESTABLISH');let Q=r0.proposal,led=r0.actualLedger;const ew=Q.decisions.at(-1).fromWeek;
 for(let w=ew;w<Q.weeks.length-1;w++){const r=evaluateProgram(Q,rv(Q,w,6,{observations:Q.weeks[w].sessions.filter(s=>s.prescription&&(s.date<pauseFrom||s.date>back)).map(s=>obs(Q,s)),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;}
 return {Q,ew,ids:Q.weeks.map(w=>[...new Set(w.sessions.flatMap(x=>x.prescription?.exercises??[]).map(e=>e.id))])};
}
/** Probe-Y assertions (SSCTR D51): the return ends, rotation resumes on its cadence, and nothing later starts at the entry dose. */
function checkRotationAfterReturn(rotation){
 const {Q,ew,ids}=rotationAfterReturn(rotation),sk=skeletonOf(Q,opts.authority);
 // The exercises in use finish their two steps; then no exercise, used or not, carries a return step.
 const last=Q.stateTrace.findLastIndex(s=>Object.values(s.strength.exercises).some(e=>Number.isInteger(e.returnStep)));
 assert.ok(last>=ew&&last<=ew+3,`the return ends by week ${ew+3} (last week with a return step: ${last})`);
 // Rotation resumes on the calendar cadence: every exercise after the return is the rotation's choice for its slot that week
 // (fitting may drop an accessory), and some week uses a rotated accessory rather than the base one.
 let rotated=0;
 for(let w=last+1;w<Q.weeks.length;w++){
  const choice=new Set(),base=new Set();
  for(const t of sk.templatesForDate(Q.weeks[w].startDate)){const rot=sk.rotation(w,t);for(const r of t.rows){choice.add(rot[r.slot]??r.entry.id);base.add(r.entry.id);}}
  for(const id of ids[w])assert.ok(choice.has(id),`week ${w}: ${id} is not the rotation's choice (${[...choice]})`);
  if(ids[w].some(id=>!base.has(id)))rotated++;
 }
 assert.ok(rotated>0,'some week after the return uses a rotated accessory');
 // Nothing after the return starts at the return-entry dose.
 for(const w of Q.weeks.slice(last+1))for(const s of w.sessions)for(const e of s.prescription?.exercises??[])assert.ok(!e.instructions.some(i=>/^Return entry/.test(i)),`${s.id} ${e.id} starts at the return-entry dose`);
}
test('SSCTR D51: after a return the strength state leaves the return and rotation resumes on its cadence (every 2 weeks)',()=>checkRotationAfterReturn('EVERY_2_WEEKS'));
test('SSCTR D51: after a return the strength state leaves the return and rotation resumes on its cadence (coach decides)',()=>checkRotationAfterReturn('COACH_DECIDES'));
