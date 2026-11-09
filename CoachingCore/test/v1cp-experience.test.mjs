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
