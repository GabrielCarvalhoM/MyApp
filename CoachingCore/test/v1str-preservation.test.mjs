// V1 Strength Extension: what the rules must leave as it was (Strength Intelligence Foundation C.6, V-INT-01, V-INT-02, V-PRG-01, V-SUB-02,
// V-SUB-04): dose, progression, recovery and interference, taper and race week, fatigue reports, the clinical route, and the multi-week
// synthetic athletes run again through the composed entry point. Novice, intermediate and experienced; hypertrophy and running support.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {S,DEV,OFF,only,HOLDS,lifter,hybrid,familiar,known,timeline,report,rowsOf,idsOf,slots,mainsOf,strengthSessions,configurationOf,hash,live,EQUIPMENT,FULL,addDays} from './v1str-helpers.mjs';
import {interferenceCosts} from '../src/r6-balanced.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const POLICY=JSON.parse(fs.readFileSync(new URL('../r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength;
const liveSessions=(p,w)=>p.weeks[w].sessions.filter(live);
const GOALS=['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'],EXPERIENCE=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'];
const HYBRIDS=['RUNNING_SUPPORT','HYPERTROPHY'].flatMap(goal=>Object.keys(EQUIPMENT).flatMap(eq=>[[2,5],[0,2,4]].map(days=>({goal,eq,days,name:`hybrid ${goal} ${eq} ${days.length}d`}))));

test('C.6 the upper-body rules change upper rows only: every run, every lower-body and trunk row, each day and the arrangement of every week are the same', ()=>{
 for(const h of HYBRIDS){
  const intake=hybrid({goal:h.goal,equipment:EQUIPMENT[h.eq],days:h.days}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,only('UPPER','PLANE')).program;
  assert.ok(a&&b,h.name);
  for(let w=0;w<a.weeks.length;w++){
   const x=liveSessions(a,w),y=liveSessions(b,w);
   assert.equal(hash(y.filter(s=>s.sport==='RUN')),hash(x.filter(s=>s.sport==='RUN')),`${h.name} week ${w}: a run changed`);
   assert.equal(hash(y.map(s=>[s.id,s.sport,s.day,s.turn,s.role,s.templateType??null])),hash(x.map(s=>[s.id,s.sport,s.day,s.turn,s.role,s.templateType??null])),`${h.name} week ${w}: the week's shape changed`);
   assert.equal(b.weeks[w].arrangementId,a.weeks[w].arrangementId);
   const rest=p=>rowsOf(p,w).filter(r=>r.e.region!=='UPPER').map(r=>[r.s.id,r.e]);
   assert.equal(hash(rest(b)),hash(rest(a)),`${h.name} week ${w}: a lower-body or trunk row changed`);
  }
 }
});
test('V-INT-02 the ordinal run and strength interference costs of every week are the same with all the rules on', ()=>{
 for(const h of HYBRIDS){
  const intake=hybrid({goal:h.goal,equipment:EQUIPMENT[h.eq],days:h.days}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,DEV).program;
  for(let w=0;w<a.weeks.length;w++)assert.deepEqual(interferenceCosts(liveSessions(b,w),{wrap:true}),interferenceCosts(liveSessions(a,w),{wrap:true}),`${h.name} week ${w}`);
  assert.equal(hash(b.arrangement),hash(a.arrangement));assert.equal(hash(b.phases),hash(a.phases));assert.equal(hash(b.blocks),hash(a.blocks));
 }
});
test('the goal dose bounds hold for every row with the rules on, as they do without them: the set count, the reserve, and no kilogram for a load chosen by effort', ()=>{
 // Repetitions are not bounded here: an exercise keeps the repetitions it was established with, which the frozen engine sets apart from the
 // goal's range. They are compared row by row in the next test, and followed week by week in the progression tests.
 const check=(p,goal,label)=>{const G=POLICY.goalDoses[goal];
  for(let w=0;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w)){
   if(e.role==='PRACTICE')continue;
   assert.ok(e.sets>=1&&e.sets<=G.maxSets,`${label} week ${w} ${e.id}: ${e.sets} sets`);assert.ok(e.rir>=G.targetRir,`${label} week ${w} ${e.id}: reserve ${e.rir}`);
   if(e.load.mode==='ESTABLISH')assert.ok(!Number.isFinite(e.load.value),`${label} ${e.id}: a load chosen by effort carries no kilogram`);
  }};
 for(const goal of GOALS)for(const experience of EXPERIENCE)for(const eq of ['FULL','DB','BW','MACH_DB'])for(const days of [[1,4],[0,2,4,6]]){
  const intake=lifter({goal,experience,equipment:EQUIPMENT[eq],days}),label=`${goal} ${experience} ${eq} ${days.length}d`;
  check(S.generateProgram(intake,OFF).program,goal,label+' (without)');check(S.generateProgram(intake,DEV).program,goal,label+' (with)');
 }
});
test('a row of a session whose exercises are all the same with and without the rules is the same row in every week (dose, load and exposure)', ()=>{
 let compared=0;
 for(const goal of GOALS)for(const experience of EXPERIENCE)for(const eq of Object.keys(EQUIPMENT)){
  const intake=lifter({goal,experience,equipment:EQUIPMENT[eq],days:[1,3,5]}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,DEV).program;
  // The exercises the two plans share and use in the same sessions over the whole plan: their state is fed by the same exposures.
  const usage=p=>{const m=new Map();for(let w=0;w<p.weeks.length;w++)for(const {s,e} of rowsOf(p,w))m.set(e.id,[...(m.get(e.id)??[]),s.id]);return m;},ua=usage(a),ub=usage(b);
  const shared=[...ua.keys()].filter(id=>ub.has(id)&&hash(ua.get(id))===hash(ub.get(id)));
  for(let w=0;w<a.weeks.length;w++)for(const id of shared){const x=rowsOf(a,w).filter(r=>r.e.id===id).map(r=>[r.s.id,r.e]),y=rowsOf(b,w).filter(r=>r.e.id===id).map(r=>[r.s.id,r.e]);assert.equal(hash(y),hash(x),`${goal} ${experience} ${eq} week ${w} ${id}`);compared+=x.length;}
 }
 assert.ok(compared>1000);
});
test('V-PRG-01 progression is the engine\'s: at most one smallest increment a week on executed evidence for a vertical MAIN the rule selected, identity kept through the block', ()=>{
 const t=timeline(lifter({goal:'STRENGTH',experience:'INTERMEDIATE',equipment:FULL,known:[known('bench-press',3,5,70)]})),trail=[];
 assert.equal(mainsOf(t.p)['FULL_B:2'],'db-overhead-press');
 for(let w=0;w<7;w++){const row=rowsOf(t.p,w).find(x=>x.e.id==='db-overhead-press'),bench=rowsOf(t.p,w).find(x=>x.e.id==='bench-press');trail.push({w,phase:t.p.phases.phases[w],load:row?.e.load.value??null,mode:row?.e.load.mode,reps:row?.e.reps,bench:bench?.e.load.value??null});t.week(w);}
 assert.ok(trail.every(x=>x.mode),'db-overhead-press is in every week: '+JSON.stringify(trail));
 assert.equal(trail[0].mode,'ESTABLISH');assert.equal(trail[0].load,null);
 const loads=trail.map(x=>x.load).filter(Number.isFinite),steps=loads.slice(1).map((v,i)=>Math.round((v-loads[i])*10)/10),inc=POLICY.smallestIncrement.PER_HAND;
 assert.ok(steps.every(d=>d===0||d===inc),JSON.stringify(trail));assert.ok(steps.some(d=>d===inc),'it progresses: '+JSON.stringify(trail));
 const bench=trail.map(x=>x.bench).filter(Number.isFinite),bsteps=bench.slice(1).map((v,i)=>Math.round((v-bench[i])*10)/10);
 assert.equal(bench[0],70,'the known load is used as declared');assert.ok(bsteps.every(d=>d===0||d===POLICY.smallestIncrement.TOTAL));
});
test('V-PRG-01 hypertrophy: repetitions rise inside 8 to 12 before any load step, for the rows the rules selected', ()=>{
 const t=timeline(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:FULL})),ids=['db-overhead-press','lat-pulldown'],trail=Object.fromEntries(ids.map(id=>[id,[]]));
 for(const id of ids)assert.ok(Object.values(mainsOf(t.p)).includes(id),id);
 for(let w=0;w<8;w++){for(const id of ids){const row=rowsOf(t.p,w).find(x=>x.e.id===id);if(row)trail[id].push({w,reps:row.e.reps,load:row.e.load.value??null,sets:row.e.sets});}assert.equal(strengthSessions(t.p,w).every(s=>s.prescription.goalMode==='REPS_THEN_LOAD'),true);t.week(w);}
 for(const id of ids){const r=trail[id];assert.ok(r.length>=7,id);assert.ok(r.every(x=>x.reps>=8&&x.reps<=12),JSON.stringify(r));
  for(let i=1;i<r.length;i++)assert.ok(r[i].reps-r[i-1].reps<=POLICY.repStep,`${id}: ${JSON.stringify(r)}`);
  assert.ok(r.some((x,i)=>i>0&&x.reps>r[i-1].reps),`${id} progresses: ${JSON.stringify(r)}`);}
});
test('V-SUB-04 taper and race week with the rules on: fewer sets, reserve of 3 or more, MAIN rows only in race week, no exercise new to the plan', ()=>{
 for(const [goal,eq] of [['RUNNING_SUPPORT','FULL'],['HYPERTROPHY','FULL'],['RUNNING_SUPPORT','DB_BANDS'],['RUNNING_SUPPORT','BW']]){
  const p=S.generateProgram(hybrid({goal,equipment:EQUIPMENT[eq]}),DEV).program,ph=p.phases.phases,taper=ph.indexOf('TAPER'),race=ph.indexOf('RACE_WEEK'),label=`${goal} ${eq}`;
  assert.ok(taper>0&&race>taper,label);
  const earlier=new Set(idsOf({weeks:p.weeks.slice(0,taper)})),tr=rowsOf(p,taper),rr=rowsOf(p,race),before=rowsOf(p,taper-1);
  assert.ok(tr.length&&rr.length,label);
  assert.ok(tr.every(x=>x.e.rir>=3)&&rr.every(x=>x.e.rir>=3),label);assert.ok(rr.every(x=>x.e.role==='MAIN'),label);
  assert.ok([...tr,...rr].every(x=>earlier.has(x.e.id)),label);
  const sets=rows=>rows.filter(x=>x.e.role==='MAIN').reduce((n,x)=>n+x.e.sets,0);assert.ok(sets(tr)<sets(before),`${label}: ${sets(tr)} against ${sets(before)}`);
 }
});
test('fatigue reports and the clinical route decide as before: local fatigue leaves the MAIN rows, systemic fatigue keeps MAIN rows only, pain with an exercise goes to a person', ()=>{
 for(const opts of [OFF,DEV]){
  const t=timeline(lifter({goal:'GENERAL',experience:'INTERMEDIATE',equipment:FULL,run:'PERFORMANCE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},schedule:{runDays:[1,3,6],runMinutes:45,longRunMinutes:75,longRunDay:6},days:[0,4],minutes:50}),{opts});
  t.weeks(0,1);
  const local=S.evaluateProgram(t.p,t.review(2,0,'LOCAL_FATIGUE',{signals:{region:'LOWER'}},'06:00'),opts),lr=rowsOf(local.proposal,2);
  assert.ok(lr.every(x=>!(x.e.role!=='MAIN'&&x.e.region==='LOWER'))&&lr.some(x=>x.e.role==='MAIN'&&x.e.region==='LOWER'));
  const systemic=S.evaluateProgram(t.p,t.review(2,0,'SYSTEMIC_FATIGUE',{},'06:00'),opts),sr=rowsOf(systemic.proposal,2);
  assert.ok(sr.length&&sr.every(x=>x.e.role==='MAIN'&&x.e.rir>=4));
  const target=rowsOf(t.p,2).find(x=>x.e.role==='MAIN'&&x.e.region==='UPPER').e.id;
  const pain=S.evaluateProgram(t.p,t.review(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}},'06:00'),opts);
  assert.equal(pain.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(pain.proposal??null,null);assert.equal(pain.strengthExposure.status==='ACTIVE',false);
  const sign=S.evaluateProgram(t.p,t.review(2,0,'WEEKLY_REVIEW',{eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:t.day(2,0),pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}},'06:00'),opts);
  assert.equal(sign.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(sign.proposal??null,null);
 }
});
test('familiarity is what the athlete named, nothing more: experience, a past load and an unknown name grant no lift and no load', ()=>{
 // Years of training without a named lift: no HIGH-skill lift, with the rules as without them.
 const years=S.generateProgram(lifter({goal:'STRENGTH',experience:'EXPERIENCED',months:120,equipment:FULL,days:[1,3,5]}),DEV).program;
 assert.ok(idsOf(years).every(id=>configurationOf(id).skill!=='HIGH'));
 // A named lift without a load is selected and established by effort; a variant of it is not assumed.
 const named=S.generateProgram(lifter({goal:'STRENGTH',experience:'EXPERIENCED',equipment:FULL,days:[1,3,5],known:['back-squat','bench-press','barbell-overhead-press'].map(familiar)}),DEV).program;
 for(const id of ['back-squat','bench-press','barbell-overhead-press']){const row=rowsOf(named,0).find(x=>x.e.id===id);assert.ok(row,id+' is selected');assert.equal(row.e.load.mode,'ESTABLISH');}
 assert.ok(!idsOf(named).includes('front-squat'));
 // A load observed long ago is not today's working load.
 const old=S.generateProgram(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:FULL,known:[{...known('bench-press',3,8,100),observedAt:'2026-06-01'}]}),DEV).program,bench=rowsOf(old,0).find(x=>x.e.id==='bench-press');
 assert.ok(bench);assert.notEqual(bench.e.load.mode,'KNOWN');assert.ok(!Number.isFinite(bench.e.load.value));
 // A name the repertoire does not hold selects nothing and invents no exercise.
 const unknown=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:FULL,known:[familiar('zercher-squat')]}),DEV);
 if(unknown.program)assert.ok(idsOf(unknown.program).every(id=>!!configurationOf(id)));else assert.ok(['ASK','INVALID_INPUT'].includes(unknown.status),unknown.status);
 assert.equal(unknown.status,S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:FULL,known:[familiar('zercher-squat')]}),OFF).status);
});
test('the multi-week synthetic athletes through the composed entry point: the same decisions week by week, the same runs, no hold row, each slot as it was built', ()=>{
 const athletes={...PROFILES,BODYWEIGHT_ONLY_NOVICE:EDGE_PROFILES.BODYWEIGHT_ONLY_NOVICE,TEN_K_EIGHT_WEEKS:EDGE_PROFILES.TEN_K_EIGHT_WEEKS,SHARED_SAME_TURN:EDGE_PROFILES.SHARED_SAME_TURN,WALK_JOG_FIVE_DAYS:EDGE_PROFILES.WALK_JOG_FIVE_DAYS};
 // Week 2: the strength sessions are missed. Week 3: every session is reported harder than planned with an adverse recovery.
 const how=w=>s=>w===2&&s.sport==='STRENGTH'?false:w===3?{response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}}:{};
 for(const [name,intake] of Object.entries(athletes)){
  const a=timeline(intake,{opts:OFF,prefix:'sim'}),b=timeline(intake,{opts:DEV,prefix:'sim'});
  assert.equal(b.g.status,a.g.status,name);if(!a.p){assert.equal(b.p,null);continue;}
  const built=slots(b.p),strength=b.p.capability.strength.programmed;
  for(let w=0;w<a.p.weeks.length;w++){
   assert.equal(hash(liveSessions(b.p,w).filter(s=>s.sport==='RUN')),hash(liveSessions(a.p,w).filter(s=>s.sport==='RUN')),`${name} week ${w}: the runs of the plan in force`);
   const x=a.week(w,how(w)),y=b.week(w,how(w));
   assert.equal(y.status,x.status,`${name} week ${w}`);assert.equal(y.action,x.action,`${name} week ${w}`);
   assert.ok(!idsOf(b.p).some(id=>HOLDS.includes(id)),`${name} week ${w}`);
   assert.deepEqual(slots(b.p),built,`${name} week ${w}: a slot changed without a recorded decision`);
   assert.equal(y.strengthExtension.status,strength||b.p.repertoire.strengthExtension?'ACTIVE':y.strengthExtension.status);
  }
  assert.equal(hash(b.p.weeks.map(w=>w.plannedRunMinutes)),hash(a.p.weeks.map(w=>w.plannedRunMinutes)),name);
 }
});
