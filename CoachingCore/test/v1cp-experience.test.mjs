// V1 Coaching Productization, Block 1 (E): the experience and records data path, on the Founder's synthetic athlete (30 years, M, 170 cm, 70 kg;
// ten months of running and strength; runs Tue/Thu/Sat and strength Mon/Wed/Fri in the evening; PERFORMANCE and HYPERTROPHY; 45 and 60 minutes;
// long run on Saturday; 5 km 30:36 and 10 km 1:18:00; squat 20 kg and bench 15 kg in the convention "plates"; screening clear; Monday start).
// Only the stated facts are used. What the runtime does with each of them is pinned here, so a later change of the data path is visible:
//   E3: history the plan cannot use is named, never dropped in silence: a known exercise the declared equipment cannot program, and a load in a
//       unit or convention the engine does not read (PLATES), are disclosed as uncertainty; the plan is unchanged by the disclosure.
//   Pinned facts of the audit: age is used for eligibility only, sex/height/weight never reach a dose, and the race records are kept in the
//   canonical intake as stated.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,canonicalizeIntake}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
/** The Founder's synthetic athlete, stated facts only. Days are offsets from the Monday start (0 = Monday); evening is PM. */
export const FOUNDER_ATHLETE=()=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-08',startDate:'2026-11-09',timezoneOffsetMinutes:-180,
 athlete:{id:'ath-founder-synthetic',ageYears:30,sex:'M',heightCm:170,weightKg:70,eligibility:ELIG('2026-11-08'),goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},
  performanceAnchors:[{sport:'RUN',kind:'BEST_RESULT',distanceKm:5,time:'30:36'},{sport:'RUN',kind:'BEST_RESULT',distanceKm:10,time:'1:18:00'}],
  knownExercises:[{id:'back-squat',load:{value:20,unit:'KG',convention:'PLATES'}},{id:'bench-press',load:{value:15,unit:'KG',convention:'PLATES'}}]},
 schedule:{runDays:[1,3,5],strengthDays:[0,2,4],runTurn:'PM',strengthTurn:'PM',runMinutes:45,strengthMinutes:60,longRunDay:5}});
const fields=c=>c.uncertainty.map(u=>u.field);

test('E3: the synthetic athlete\'s squat and bench are disclosed, never dropped in silence (equipment not declared; PLATES not a load convention)',()=>{
 const c=canonicalizeIntake(FOUNDER_ATHLETE());
 assert.equal(c.status,'CANONICAL');
 for(const f of ['knownExercises.back-squat','knownExercises.bench-press','knownExercises.back-squat.load','knownExercises.bench-press.load'])assert.ok(fields(c).includes(f),f);
 const sq=c.uncertainty.find(u=>u.field==='knownExercises.back-squat');assert.deepEqual(sq.requires,['BARBELL','RACK']);
 const ld=c.uncertainty.find(u=>u.field==='knownExercises.back-squat.load');assert.deepEqual(ld.reported,{value:20,unit:'KG',convention:'PLATES'});assert.match(ld.action,/PLATES/);
 // The disclosure changes no dose: the plan is generated, bodyweight only, as without it.
 const g=generateProgram(FOUNDER_ATHLETE());assert.equal(g.status,'PROPOSED',g.reason);
});

test('E3: declared equipment and a readable convention remove the disclosure, and the reported load becomes a starting hint',()=>{
 const i=FOUNDER_ATHLETE();i.athlete.equipment=['BARBELL','RACK','BENCH'];i.athlete.knownExercises=i.athlete.knownExercises.map(e=>({...e,load:{...e.load,convention:'TOTAL'}}));
 const c=canonicalizeIntake(i);
 for(const f of ['knownExercises.back-squat','knownExercises.bench-press','knownExercises.back-squat.load','knownExercises.bench-press.load'])assert.ok(!fields(c).includes(f),f);
 const g=generateProgram(i),rows=g.program.weeks[0].sessions.filter(s=>s.prescription?.modality==='STRENGTH').flatMap(s=>s.prescription.exercises);
 const squat=rows.find(e=>e.id==='back-squat');assert.ok(squat,'the known squat is planned');assert.equal(squat.load.mode,'ESTABLISH');assert.ok((squat.instructions??[]).some(x=>/20 KG.*starting hint/.test(x)),JSON.stringify(squat.instructions));
});

test('E1 (SSCTR-V1CP Q03): ten months of regular training is INTERMEDIATE in both sports; the label never sets current capacity',()=>{
 const i=FOUNDER_ATHLETE();i.athlete.runTrainingMonths=10;i.athlete.strengthTrainingMonths=10;
 const c=canonicalizeIntake(i);assert.equal(c.status,'CANONICAL');const a=c.canonical.athlete;
 assert.deepEqual([a.runExperience,a.strengthExperience],['INTERMEDIATE','INTERMEDIATE']);
 assert.deepEqual(a.experienceBasis,{run:{basis:'DERIVED_FROM_TRAINING_MONTHS',months:10},strength:{basis:'DERIVED_FROM_TRAINING_MONTHS',months:10}});
 assert.deepEqual(a.experienceDeclared,{run:false,strength:false},'the athlete stated months, not a category');
 const g=generateProgram(i);assert.equal(g.program.capability.run.class,'EASY_UNKNOWN','no longer walk/jog; still an easy entry while weekly minutes are unknown (C-Q03-5)');
 assert.equal(g.program.capability.strength.class,'FAMILIAR_UNKNOWN_LOAD');
 assert.equal(a.recentRun.runMinutesPerWeek,null,'unknown stays unknown');
 for(const [m,cat] of [[0,'NONE'],[3,'NOVICE'],[6,'INTERMEDIATE'],[23,'INTERMEDIATE'],[24,'EXPERIENCED']]){const x=FOUNDER_ATHLETE();x.athlete.runTrainingMonths=m;assert.equal(canonicalizeIntake(x).canonical.athlete.runExperience,cat,String(m));}
 const stated=FOUNDER_ATHLETE();stated.athlete.runTrainingMonths=40;stated.athlete.runExperience='NOVICE';assert.equal(canonicalizeIntake(stated).canonical.athlete.runExperience,'NOVICE','a stated category wins');
 const bad=FOUNDER_ATHLETE();bad.athlete.runTrainingMonths=361;const b=canonicalizeIntake(bad);assert.equal(b.status,'ASK');assert.ok(b.missing.includes('athlete.runTrainingMonths'));
});

test('E2 (SSCTR-V1CP Q04): a current confirmed race result caps only the first long run and the single-run limit; never the run class',()=>{
 const base=()=>{const i=FOUNDER_ATHLETE();i.athlete.runExperience='INTERMEDIATE';i.athlete.recent={runDaysPerWeek:3,runMinutesPerWeek:120};return i;};
 const race=(min,date)=>({sport:'RUN',kind:'BEST_RESULT',distanceKm:5,durationMinutes:min,date,completed:true,tolerated:true});
 const without=generateProgram(base()),withRace=(()=>{const i=base();i.athlete.performanceAnchors=[race(31,'2026-11-01')];return generateProgram(i);})();
 assert.equal(withRace.program.capability.run.class,without.program.capability.run.class,'the class is unchanged');
 const long=g=>g.program.weeks[0].sessions.find(s=>s.role==='LONG')?.prescription.durationMinutes??0;
 assert.ok(long(withRace)<=31&&long(withRace)<=withRace.program.schedule.runMinutes,'week 1 within the race minutes and the availability');
 assert.ok(withRace.uncertainty.some(u=>u.field==='performanceAnchors'&&/recent run of about 31 minutes/.test(u.action)));
 const short=base();short.athlete.performanceAnchors=[race(14,'2026-11-01')];assert.notEqual(generateProgram(short).program.capability.run.class,'WALK_JOG','a sub-15-minute race never makes walk/jog');
 const old=base();old.athlete.performanceAnchors=[race(31,'2026-09-01')];assert.equal(canonicalizeIntake(old).canonical.athlete.recentRun.longestFromRace,undefined,'older than 28 days: history only');
 const unconfirmed=base();unconfirmed.athlete.performanceAnchors=[{...race(31,'2026-11-01'),tolerated:undefined}];assert.equal(canonicalizeIntake(unconfirmed).canonical.athlete.recentRun.longestFromRace,undefined,'tolerated must be answered');
 const novice=FOUNDER_ATHLETE();novice.athlete.runExperience='NOVICE';novice.athlete.recent={runDaysPerWeek:2,runMinutesPerWeek:60};const n0=generateProgram(novice).program.capability.run.class;novice.athlete.performanceAnchors=[race(31,'2026-11-01')];assert.equal(generateProgram(novice).program.capability.run.class,n0,'a novice EASY_LOW class is unchanged');
});

test('E audit (pinned): age is eligibility only, body facts never reach a dose, race records are kept as stated, and the default experience is NOVICE',()=>{
 const c=canonicalizeIntake(FOUNDER_ATHLETE()).canonical,a=c.athlete;
 assert.equal(a.profileContext.doseConsumer,false);assert.equal(a.profileContext.heightCm,170);assert.equal(a.profileContext.weightKg,70);
 assert.deepEqual(a.performanceAnchors.map(x=>x.time),['30:36','1:18:00']);
 assert.deepEqual([a.runExperience,a.strengthExperience,a.experienceDeclared.run,a.experienceDeclared.strength],['NOVICE','NOVICE',false,false]);
 const g=generateProgram(FOUNDER_ATHLETE());assert.equal(g.program.profileContextUsedForDose,false);
 // Body facts are inert: the same athlete at another height and weight gets the same weeks.
 const o=FOUNDER_ATHLETE();o.athlete.heightCm=190;o.athlete.weightKg=95;const g2=generateProgram(o);
 assert.equal(JSON.stringify(g2.program.weeks),JSON.stringify(g.program.weeks));
 const young=FOUNDER_ATHLETE();young.athlete.ageYears=17;assert.notEqual(generateProgram(young).status,'PROPOSED','under 18 is outside the V1 population');
});
