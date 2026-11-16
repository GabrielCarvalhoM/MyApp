// V1 Strength Extension, V1X-STRENGTH-EXPOSURE (SI-V1-SSCTR-SQ-3, invariant V-EXT-04): the weekly strength exposure is a description. The oracle
// is the bound catalog file itself (its `prim` lists), read here, never the function under test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {S,DEV,OFF,only,lifter,hybrid,timeline,report,rowsOf,strengthSessions,hash,live,EQUIPMENT,FULL,addDays} from './v1str-helpers.mjs';
import {weeklyStrengthExposure,STRENGTH_VALUES} from '../src/v1-strength.mjs';

const CATALOG=JSON.parse(fs.readFileSync(new URL('../r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8')),CFG=new Map(CATALOG.strength.configurations.map(e=>[e.id,e]));
/** The count by the catalog rule: each working set once per primary muscle; a PRACTICE row never. */
function oracle(rows){const out={};for(const e of rows){if(e.role==='PRACTICE')continue;for(const m of CFG.get(e.id).prim)out[m]=(out[m]??0)+e.sets;}return out;}
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));

test('SQ-3 c1 planned exposure: each working set once per primary muscle, secondary muscles never, for novice, intermediate and experienced plans', ()=>{
 for(const experience of ['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'])for(const goal of ['HYPERTROPHY','RUNNING_SUPPORT','GENERAL'])for(const eq of ['FULL','DB','BW']){
  const p=S.generateProgram(lifter({goal,experience,equipment:EQUIPMENT[eq],days:[1,3,5]}),DEV).program;
  for(const w of [0,1,4,7]){const x=weeklyStrengthExposure({program:p,weekIndex:w});
   assert.equal(x.status,'ACTIVE');assert.deepEqual(x.planned.byPrimaryMuscle,oracle(rowsOf(p,w).map(r=>r.e)),`${experience} ${goal} ${eq} week ${w}`);
   assert.deepEqual(Object.keys(x.planned.byPrimaryMuscle),CATALOG.vocabulary.muscles.filter(m=>m in x.planned.byPrimaryMuscle),'in the catalog\'s order');}
 }
 // One worked week, by hand: hypertrophy, two days, full gym, a named bench (week 1 of the plan as built).
 const p=S.generateProgram(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:FULL,known:[{id:'bench-press',sets:3,reps:8,load:{value:60,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-06'}]}),DEV).program;
 assert.deepEqual(rowsOf(p,1).map(r=>`${r.e.id} ${r.e.sets}`),['goblet-squat 3','bench-press 3','db-row 3','db-calf-raise 2','dead-bug 2','db-rdl 3','lat-pulldown 3','db-overhead-press 3','leg-curl-machine 2','db-biceps-curl 2']);
 // goblet-squat: QUADRICEPS, GLUTEUS_MAXIMUS. bench-press: PECTORALS, TRICEPS, ANTERIOR_DELTOID. db-row: LATISSIMUS, UPPER_BACK. db-calf-raise: GASTROCNEMIUS.
 // dead-bug: ABDOMINALS. db-rdl: HAMSTRINGS, GLUTEUS_MAXIMUS. lat-pulldown: LATISSIMUS. db-overhead-press: ANTERIOR_DELTOID, LATERAL_DELTOID, TRICEPS.
 // leg-curl-machine: HAMSTRINGS. db-biceps-curl: BICEPS. The biceps work of the two pulls (a secondary muscle) is not counted.
 assert.deepEqual(weeklyStrengthExposure({program:p,weekIndex:1}).planned.byPrimaryMuscle,{QUADRICEPS:3,GLUTEUS_MAXIMUS:6,HAMSTRINGS:5,GASTROCNEMIUS:2,PECTORALS:3,ANTERIOR_DELTOID:6,LATERAL_DELTOID:3,TRICEPS:6,LATISSIMUS:6,UPPER_BACK:3,BICEPS:2,ABDOMINALS:2});
});
test('SQ-3 c1 a unilateral set counts once, and a practice row never counts', ()=>{
 const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB_BENCH,days:[1,3,5]}),DEV).program,rows=rowsOf(p,2).map(r=>r.e),uni=rows.filter(e=>CFG.get(e.id).lat==='UNILATERAL');
 assert.ok(uni.length>0,'the week holds a unilateral row');
 const x=weeklyStrengthExposure({program:p,weekIndex:2});
 for(const e of uni)assert.equal(x.planned.rows.filter(r=>r.exerciseId===e.id).reduce((n,r)=>n+r.sets,0),rows.filter(r=>r.id===e.id).reduce((n,r)=>n+r.sets,0),e.id+': its sets, not twice its sets');
 const novice=S.generateProgram(lifter({experience:'NONE',equipment:EQUIPMENT.DB,days:[1,4]}),DEV).program,practice=rowsOf(novice,0).filter(r=>r.e.role==='PRACTICE');
 assert.ok(practice.length>0,'week 0 of a new lifter holds practice rows');
 const y=weeklyStrengthExposure({program:novice,weekIndex:0});
 assert.deepEqual(y.planned.notCounted.map(r=>r.reason),practice.map(()=>'PRACTICE_ROW'));assert.ok(!y.planned.rows.some(r=>practice.some(q=>q.e.id===r.exerciseId)));
 assert.deepEqual(y.planned.byPrimaryMuscle,oracle(rowsOf(novice,0).map(r=>r.e)));
});
test('SQ-3 c2 executed exposure is counted from logged sets only, apart from the planned one, and nothing is imputed', ()=>{
 const t=timeline(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:FULL}));
 // Nothing reported yet.
 const none=t.step(0,2,'WEEKLY_REVIEW',{},'08:00').strengthExposure;
 assert.equal(none.executed.sessionsReported,0);assert.deepEqual(none.executed.byPrimaryMuscle,{});assert.equal(none.executed.imputed,false);assert.ok(Object.keys(none.planned.byPrimaryMuscle).length>0);
 // Every session logged as prescribed: executed equals planned for that week.
 const full=t.week(0).strengthExposure;
 assert.equal(full.executed.sessionsReported,full.executed.sessionsPlanned);assert.deepEqual(full.executed.byPrimaryMuscle,full.planned.byPrimaryMuscle);
 // Week 1: one session marked complete with no set logged, the other with one set fewer on its first row, one set without repetitions on its
 // second, and an exercise the session does not hold.
 const [first,second]=strengthSessions(t.p,1),rows=second.prescription.exercises;
 const logged=rows.map((e,i)=>({id:e.id,sets:Array.from({length:i===0?e.sets-1:e.sets},(_,k)=>i===1&&k===0?{load:{value:20,unit:'KG',convention:e.load.convention}}:{reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:20,unit:'KG',convention:e.load.convention}})}));
 const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[{...report(t.p,first),actual:{completed:true,minutes:first.prescription.durationMinutes}},report(t.p,second,{exercises:[...logged,{id:'barbell-row',sets:[{reps:8},{reps:8}]}]})]});
 const x=r.strengthExposure,expected=oracle(rows.map((e,i)=>({...e,sets:i<2?e.sets-1:e.sets})));
 assert.equal(x.executed.sessionsReported,2);assert.deepEqual(x.executed.byPrimaryMuscle,expected);
 assert.deepEqual(x.executed.notCounted,[{sessionId:second.id,exerciseId:rows[1].id,reason:'SET_WITHOUT_REPETITIONS',sets:1},{sessionId:second.id,exerciseId:'barbell-row',reason:'NOT_A_ROW_OF_THE_SESSION'}]);
 assert.notDeepEqual(x.executed.byPrimaryMuscle,x.planned.byPrimaryMuscle);assert.equal(x.executed.rows.some(q=>q.sessionId===first.id),false,'a session marked complete with no logged set counts nothing');
});
test('SQ-3 c2 a report that is superseded, in conflict, of another athlete or dated outside the week is not counted', ()=>{
 const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}),DEV).program,s=strengthSessions(p,1)[0],o=report(p,s),row=x=>({...o,localDate:s.date,...x});
 const count=ledger=>weeklyStrengthExposure({program:p,weekIndex:1,ledger}).executed;
 assert.equal(count([row({})]).sessionsReported,1);assert.deepEqual(count([row({})]).byPrimaryMuscle,oracle(s.prescription.exercises));
 for(const x of [{superseded:true},{conflicted:true},{athleteId:'someone-else'},{localDate:addDays(p.weeks[1].startDate,-1)},{localDate:addDays(p.weeks[1].startDate,7)},{sessionId:'another-session'}])assert.equal(count([row(x)]).sessionsReported,0,JSON.stringify(x));
 // The latest report of a session that stands is the one read (a correction after the report it replaced).
 const fewer={...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.slice(0,1)}))};
 assert.deepEqual(count([row({superseded:true}),row({eventId:'corrected',actual:fewer})]).byPrimaryMuscle,oracle(s.prescription.exercises.map(e=>({...e,sets:1}))));
});
test('SQ-3 c3, V-INT-01 nothing reads the exposure: every plan, decision and record is the same with it on or off', ()=>{
 for(const intake of [lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE'}),hybrid({})]){
  const a=timeline(intake,{opts:only('HOLD','UPPER','PLANE')}),b=timeline(intake,{opts:DEV}),mine=['strengthExposure','strengthExtension'];
  assert.equal(hash(without(b.g,mine)),hash(without(a.g,mine)));assert.equal(a.g.strengthExposure.status,'DISABLED');assert.equal(b.g.strengthExposure.status,'ACTIVE');
  for(let w=0;w<4;w++){const x=a.week(w),y=b.week(w);assert.equal(hash(without(y,mine)),hash(without(x,mine)),`week ${w}`);}
  // The exposure alone, on a plan with no selection rule: the plan is the plan without the extension.
  assert.equal(hash(S.generateProgram(intake,only('EXPOSURE')).program),hash(S.generateProgram(intake,OFF).program));
 }
});
test('SQ-3 c4, c5 the exposure says what it is and judges nothing: no target, range, threshold, score or comparison, and no muscle listed with nothing', ()=>{
 const t=timeline(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:EQUIPMENT.DB,days:[1,4],minutes:40}));t.week(0);
 const x=t.week(1).strengthExposure,text=JSON.stringify(x);
 assert.equal(x.descriptiveOnly,true);assert.equal(x.label,'Working sets where the muscle is a primary mover. Descriptive only.');assert.equal(x.unit,'WORKING_SETS');
 assert.ok(!/target|optim|recommend|enough|insufficient|suffic|below|above|minimum|maximum|range|threshold|score|balanc|neglect|deficit|growth|adequa|ideal|science|should|more sets|percent|ratio/i.test(text),text.slice(0,200));
 assert.ok(Object.values(x.planned.byPrimaryMuscle).every(n=>Number.isInteger(n)&&n>0)&&Object.values(x.executed.byPrimaryMuscle).every(n=>Number.isInteger(n)&&n>0));
 assert.deepEqual(Object.keys(x).sort(),['counts','descriptiveOnly','executed','label','planned','status','unit','version','weekIndex']);
 assert.deepEqual(STRENGTH_VALUES?.exposure.consumers??[],[]);
});
test('the exposure follows the engine\'s answer: nothing under a hold or a clinical route, nothing where no decision was made, disabled when off', ()=>{
 const t=timeline(lifter({experience:'INTERMEDIATE'}));t.week(0);
 // A plan built under other rules is not reviewed: no decision, so no exposure.
 const refused=S.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW'),only('HOLD'));assert.equal(refused.status,'UNSUPPORTED');assert.equal(refused.strengthExposure.status,'DISABLED');
 const other=S.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW'),only('HOLD','EXPOSURE'));assert.equal(other.status,'UNSUPPORTED');assert.deepEqual(without(other.strengthExposure,['version']),{status:'NOT_APPLICABLE',reason:'NO_DECISION'});
 // A warning sign: the engine prescribes nothing, and the exposure describes nothing. The hold then stands on the record, also for a plan the
 // rules in force would not review (the clinical answer comes first).
 const sign=t.step(1,0,'WEEKLY_REVIEW',{eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:t.day(1,0),pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}},'06:00');
 assert.equal(sign.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(without(sign.strengthExposure,['version']),{status:'NOT_APPLICABLE',reason:'NO_PRESCRIPTION'});
 const held=S.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW'),only('HOLD','EXPOSURE'));assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(held.proposal??null,null);assert.equal(held.strengthExposure.status,'NOT_APPLICABLE');
 assert.equal(weeklyStrengthExposure({program:t.p,weekIndex:99}).status,'NOT_APPLICABLE');assert.equal(weeklyStrengthExposure({program:null,weekIndex:0}).status,'NOT_APPLICABLE');
 assert.equal(S.generateProgram(lifter({}),OFF).strengthExposure.status,'DISABLED');
 const noPlan=S.generateProgram({...lifter({}),athlete:{...lifter({}).athlete,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-13',pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}}},DEV);
 assert.equal(noPlan.program,null);assert.equal(noPlan.strengthExposure.status,'NOT_APPLICABLE');
});

// ---------- the corrective cycle (QRE-STR-A-08, A-13) ----------
test('SQ-3 c1 (QRE-STR-A-08) a logged practice row is never counted as executed, and a session the plan skipped is not planned exposure', ()=>{
 const t=timeline(lifter({experience:'NONE',equipment:EQUIPMENT.DB,days:[1,4]})),practice=rowsOf(t.p,0).filter(r=>r.e.role==='PRACTICE');assert.ok(practice.length>0);
 // Every session of week 0 is logged as prescribed, its practice rows included.
 const x=t.week(0).strengthExposure;
 assert.deepEqual(x.executed.byPrimaryMuscle,oracle(rowsOf(t.p,0).map(r=>r.e)));assert.deepEqual(x.executed.byPrimaryMuscle,x.planned.byPrimaryMuscle);
 assert.deepEqual(x.executed.notCounted.map(r=>r.reason),practice.map(()=>'PRACTICE_ROW'));assert.ok(!x.executed.rows.some(r=>practice.some(q=>q.e.id===r.exerciseId&&q.s.id===r.sessionId)));
 // A session marked skipped in the plan is not a planned session: its rows are no planned exposure.
 const p=structuredClone(S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}),DEV).program),[first,second]=strengthSessions(p,1);first.status='SKIPPED';
 assert.deepEqual(weeklyStrengthExposure({program:p,weekIndex:1}).planned.byPrimaryMuscle,oracle(second.prescription.exercises));
});
test('SQ-3 c2 (QRE-STR-A-13) only a set with a whole, positive repetition count is a logged set, and only this athlete\'s report is read', ()=>{
 const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}),DEV).program,s=strengthSessions(p,1)[0],o=report(p,s),[a,b,c]=s.prescription.exercises;
 const logged=sets=>({...o,localDate:s.date,actual:{...o.actual,exercises:[{id:a.id,sets},{id:b.id,sets:[{reps:b.reps},{reps:b.reps}]}]}});
 const read=sets=>weeklyStrengthExposure({program:p,weekIndex:1,ledger:[logged(sets)]}).executed;
 for(const [name,sets] of Object.entries({zero:[{reps:0},{reps:0}],negative:[{reps:-3}],fraction:[{reps:7.5}],text:[{reps:'8'}],missing:[{},{rir:2}],notANumber:[{reps:NaN},{reps:Infinity}]})){
  const x=read(sets);assert.deepEqual(x.byPrimaryMuscle,oracle([{...b,sets:2}]),name);assert.ok(!x.rows.some(r=>r.exerciseId===a.id),name+': no row with nothing counted');
  assert.deepEqual(x.notCounted,[{sessionId:s.id,exerciseId:a.id,reason:'SET_WITHOUT_REPETITIONS',sets:sets.length}],name);}
 assert.deepEqual(read([{reps:a.reps},{reps:0},{reps:a.reps}]).byPrimaryMuscle,oracle([{...a,sets:2},{...b,sets:2}]));
 // A report that names no athlete, or another one, is not this athlete's.
 const {athleteId:_none,...anonymous}=logged([{reps:a.reps}]);
 assert.equal(weeklyStrengthExposure({program:p,weekIndex:1,ledger:[anonymous]}).executed.sessionsReported,0);
 assert.equal(weeklyStrengthExposure({program:p,weekIndex:1,ledger:[{...anonymous,athleteId:p.athleteId}]}).executed.sessionsReported,1);
 void c;
});
test('the exposure describes the plan in force after the review, not the plan the review was asked about', ()=>{
 const t=timeline(lifter({goal:'GENERAL',experience:'INTERMEDIATE',equipment:FULL,run:'PERFORMANCE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},schedule:{runDays:[1,3,6],runMinutes:45,longRunMinutes:75,longRunDay:6},days:[0,4],minutes:50}));t.weeks(0,1);
 const before=oracle(rowsOf(t.p,2).map(r=>r.e)),r=t.step(2,0,'LOCAL_FATIGUE',{signals:{region:'LOWER'}},'06:00');
 assert.ok(r.proposal);const after=oracle(rowsOf(r.proposal,2).map(q=>q.e));assert.notDeepEqual(after,before,'the review changes the week it was asked about');
 assert.deepEqual(r.strengthExposure.planned.byPrimaryMuscle,after);
});
