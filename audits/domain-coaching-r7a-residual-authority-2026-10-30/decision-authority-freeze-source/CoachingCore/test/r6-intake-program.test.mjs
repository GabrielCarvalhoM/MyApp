import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canonicalizeIntake} from '../src/r6-intake.mjs';
import {generateProgram,validProgram} from '../src/r6-program.mjs';
import {loadR6Policy} from '../src/r6-authority.mjs';
import {DEFAULT_HYBRID} from '../src/r6-balanced.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../r6/fixtures/profiles.mjs';

const opts={authority:devAuthority()};
const sessions=p=>p.weeks.flatMap(w=>w.sessions);
const clone=x=>structuredClone(x);

test('R6 intake: goals without a static priority flag are canonical; priority is derived per phase',()=>{
 const r=canonicalizeIntake(PROFILES.C_BALANCED_HYBRID);
 assert.equal(r.status,'CANONICAL');
 const g=generateProgram(PROFILES.C_BALANCED_HYBRID,opts);
 assert.equal(g.program.goal.staticPriorityRequired,false);
 assert.equal(g.program.goal.priorityByPhase.DEVELOPMENT.lead,'JOINT');
 const hm=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program.goal.priorityByPhase;
 assert.equal(hm.SPECIFIC.lead,'RUN');assert.equal(hm.TAPER.lead,'RUN');
 const strengthFirst=generateProgram(PROFILES.B_STRENGTH_FIRST,opts).program.goal.priorityByPhase;
 assert.equal(strengthFirst.DEVELOPMENT.lead,'STRENGTH');
});
test('R6 intake: unknowns are classified into the four categories; missing exposure never blocks',()=>{
 const r=canonicalizeIntake(PROFILES.G_LOW_DATA_NO_WEARABLE);
 assert.equal(r.status,'CANONICAL');
 const categories=new Set(r.uncertainty.map(u=>u.category));
 assert.ok(categories.has('SAFE_CONSERVATIVE_ESTABLISHMENT'));
 assert.ok(categories.has('LEARN_DURING_FIRST_SESSIONS'));
 assert.equal(generateProgram(PROFILES.G_LOW_DATA_NO_WEARABLE,opts).status,'PROPOSED');
});
test('R6 intake: eligibility unknown is ASK, pain is clinical, out-of-V1 events are unsupported',()=>{
 assert.equal(generateProgram(EDGE_PROFILES.ELIGIBILITY_UNKNOWN,opts).status,'ASK');
 assert.deepEqual(generateProgram(EDGE_PROFILES.ELIGIBILITY_UNKNOWN,opts).missingInputs,['athlete.eligibility.currentNonclinicalAssessment']);
 const clinical=generateProgram(EDGE_PROFILES.CLINICAL_PAIN,opts);
 assert.equal(clinical.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(clinical.program,null);
 assert.equal(generateProgram(EDGE_PROFILES.MARATHON_OUT_OF_SCOPE,opts).status,'UNSUPPORTED');
 const minor=intake('X-minor',{athlete:{ageYears:16,goals:{run:'REGULAR',strength:'GENERAL'}},schedule:{runDays:[1],strengthDays:[3]}});
 assert.equal(generateProgram(minor,opts).status,'UNSUPPORTED');
});
test('R6 intake: shifts only matter on shared days; missing shift elsewhere is not asked',()=>{
 const x=clone(PROFILES.A_RUN_FIRST_HALF_MARATHON);delete x.schedule.runTurn;delete x.schedule.strengthTurn;
 const r=canonicalizeIntake(x);assert.equal(r.status,'CANONICAL');assert.equal(r.negotiation.length,0);
});
test('R6 intake: partial wearable history is a conservative lower bound with provenance; duplicates removed',()=>{
 const r=canonicalizeIntake(PROFILES.H_PARTIAL_WEARABLE);
 assert.equal(r.canonical.athlete.historySummary.duplicatesRemoved,1);
 assert.equal(r.canonical.athlete.recentRun.basis,'WEARABLE_PARTIAL');
 assert.equal(r.canonical.athlete.recentRun.runMinutesPerWeek,65);
 assert.ok(r.uncertainty.some(u=>u.field==='wearable.subjectiveEffort'));
});
test('R6 cold start: core profiles A–H produce complete valid programs on chosen days without prebuilt weeks',()=>{
 for(const [name,input] of Object.entries(PROFILES)){
  const r=generateProgram(input,opts);
  assert.equal(r.status,'PROPOSED',name+': '+r.reason+JSON.stringify(r.errors??[]));
  assert.ok(validProgram(r.program),name);
  const s=r.program.schedule;
  for(const x of sessions(r.program).filter(x=>x.prescription&&x.role!=='RACE')){
   assert.ok((x.sport==='RUN'?s.runDays:s.strengthDays).includes(x.day),name+' '+x.id+' off chosen days');
   const limit=x.sport==='RUN'?(x.role==='LONG'?s.longRunMinutes:s.runMinutes):s.strengthMinutes;
   assert.ok(x.prescription.durationMinutes<=limit,name+' '+x.id+' exceeds chosen time');
  }
  for(const w of r.program.weeks)for(const d of s.runDays)assert.ok(w.sessions.some(x=>x.sport==='RUN'&&x.day===d),name+' empty chosen run day');
 }
});
test('R6 cold start: week 1 never exceeds reported running and more chosen days spread rather than add load',()=>{
 for(const name of ['A_RUN_FIRST_HALF_MARATHON','C_BALANCED_HYBRID','E_EXPERIENCED_RUNNER_NOVICE_STRENGTH','H_PARTIAL_WEARABLE']){
  const r=generateProgram(PROFILES[name],opts),reported=r.program.capability.run.weeklyMinutes;
  assert.ok(r.program.weeks[0].plannedRunMinutes<=reported,name+' '+r.program.weeks[0].plannedRunMinutes+'>'+reported);
 }
 const many=generateProgram(EDGE_PROFILES.WALK_JOG_FIVE_DAYS,opts).program;
 assert.equal(many.weeks[0].sessions.filter(x=>x.role==='WALK_JOG').length,3);
 assert.ok(many.weeks[0].sessions.filter(x=>x.role==='WALK').every(x=>x.optional));
 assert.ok(many.negotiation.some(n=>n.id==='TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT'));
});
test('R6 cold start: unknown loads are established by effort; no kilogram is fabricated; sex never feeds dose',()=>{
 const r=generateProgram(PROFILES.F_GENERAL_HYBRID,opts).program;
 const rows=sessions(r).filter(x=>x.sport==='STRENGTH'&&x.prescription).flatMap(x=>x.prescription.exercises);
 assert.ok(rows.filter(e=>['ESTABLISH','FROM_LOG','BODYWEIGHT'].includes(e.load.mode)).every(e=>e.load.value===undefined));
 assert.ok(r.weeks[0].sessions.some(x=>x.prescription?.exercises?.some(e=>e.id==='sit-to-stand'&&e.sets===1&&e.reps===5&&e.rir>=3)));
 const withSex=clone(PROFILES.F_GENERAL_HYBRID);withSex.athlete.sex='F';withSex.athlete.weightKg=55;
 const a=generateProgram(withSex,opts).program,b=generateProgram(PROFILES.F_GENERAL_HYBRID,opts).program;
 assert.deepEqual(a.weeks.map(w=>w.sessions.map(x=>x.prescription)),b.weeks.map(w=>w.sessions.map(x=>x.prescription)));
 assert.equal(a.profileContextUsedForDose,false);
});
test('R6 run programming: quality only after established easy weeks, effort cues without goal pace, never next to the long run',()=>{
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program;
 const quality=sessions(p).filter(x=>x.role==='QUALITY');
 assert.ok(quality.length>4);
 assert.ok(quality.every(x=>x.weekIndex>=p.phases.establishmentWeeks+2));
 assert.ok(quality.every(x=>x.prescription.calibration.paceFromGoalTime===false&&!/min\/km|pace of/i.test(x.prescription.effort)));
 for(const w of p.weeks){const long=w.sessions.find(x=>x.role==='LONG'),q=w.sessions.find(x=>x.role==='QUALITY');if(long&&q)assert.ok(![1,6].includes(Math.abs(long.day-q.day)));}
 assert.ok(sessions(p).some(x=>x.prescription?.family==='HALF_MARATHON_SPECIFIC'));
 const familiar=generateProgram(PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,opts).program;
 assert.ok(sessions(familiar).some(x=>x.role==='QUALITY'&&x.prescription.calibration.basis==='CURRENT_FAMILIAR_TASK'));
});
test('R6 event transition: taper, race week, race day and post-event exist; strength stays reduced and stops before the race',()=>{
 for(const input of [PROFILES.A_RUN_FIRST_HALF_MARATHON,EDGE_PROFILES.TEN_K_EIGHT_WEEKS]){
  const p=generateProgram(input,opts).program,race=p.phases.raceWeek;
  assert.equal(p.weeks[race].phase,'RACE_WEEK');assert.equal(p.weeks[race-1].phase,'TAPER');
  assert.ok(p.weeks[race].sessions.some(x=>x.role==='RACE'));
  assert.ok(p.weeks[race-1].plannedRunMinutes<p.weeks[race-2].plannedRunMinutes);
  assert.ok(p.weeks[race].sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription).every(x=>p.phases.raceDay-x.day>=3&&x.prescription.exercises.every(e=>e.sets===1)));
  assert.ok(p.weeks[race-1].sessions.some(x=>x.sport==='STRENGTH'&&x.prescription),'strength does not disappear in the taper');
  if(p.weeks[race+1])assert.equal(p.weeks[race+1].phase,'POST_EVENT');
 }
});
test('R6 cold start fails closed without current independent authority',()=>{
 assert.equal(generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:devAuthority([])}).status,'UNSUPPORTED');
 const noQuality=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:devAuthority(loadR6Policy().scientificBoundaryIds.filter(id=>id!=='R6-RUN-QUALITY'))}).program;
 assert.equal(sessions(noQuality).filter(x=>x.role==='QUALITY'||x.prescription?.strides).length,0);
 assert.equal(generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:devAuthority(loadR6Policy().scientificBoundaryIds.filter(id=>id!=='R6-EVENT-TRANSITION'))}).status,'UNSUPPORTED');
 const noRotation=generateProgram(PROFILES.B_STRENGTH_FIRST,{authority:devAuthority(loadR6Policy().scientificBoundaryIds.filter(id=>id!=='R6-ROTATION'))}).program;
 const ids=w=>noRotation.weeks[w].sessions.filter(x=>x.prescription?.exercises).flatMap(x=>x.prescription.exercises.map(e=>e.id)).sort().join();
 assert.equal(ids(0),ids(noRotation.weeks.length-1));
});
test('R6 policy and runtime hybrid thresholds are identical',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(DEFAULT_HYBRID)),loadR6Policy().operational.hybrid);
});
test('R6 runtime source does not import fixtures, corpora or expectations',()=>{
 for(const f of fs.readdirSync(new URL('../src/',import.meta.url)).filter(n=>/^r6-.*\.mjs$/.test(n))){
  const t=fs.readFileSync(new URL('../src/'+f,import.meta.url),'utf8');
  assert.ok(!/from\s+['"][^'"]*(?:fixtures|holdout|CORPUS|RESULTS|expected)|readFileSync\([^)]*(?:holdout|CORPUS)/.test(t),f);
 }
});
test('Cold start: a self-reported familiar quality task keeps its own work; missing effort text comes from the family cue',()=>{
 const input=intake('familiar-cruise',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[{prescription:{modality:'RUN',family:'CRUISE',durationMinutes:45,work:{repetitions:3,workMinutes:8,recoveryMinutes:2}},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]},schedule:{runDays:[0,2,4,6],strengthDays:[],longRunDay:6}});
 const r=generateProgram(input,opts);assert.equal(r.status,'PROPOSED');assert.equal(r.program.capability.run.class,'QUALITY_FAMILIAR');
 const q=r.program.weeks.flatMap(w=>w.sessions).find(s=>s.role==='QUALITY');
 assert.equal(q.prescription.calibration.basis,'CURRENT_FAMILIAR_TASK');assert.deepEqual(q.prescription.work,{repetitions:3,workMinutes:8,recoveryMinutes:2});
 assert.equal(q.prescription.family,'THRESHOLD');assert.match(q.prescription.effort,/controlled/);assert.equal(q.prescription.calibration.paceFromGoalTime,undefined);
});
test('Cold start: an intake pause reason is screened; a pause-driven restart needs the nonclinical-return authority (SSCTR D22)',()=>{
 const base=EDGE_PROFILES.RESTART_AFTER_PAUSE,withPause=pause=>({...structuredClone(base),athlete:{...structuredClone(base.athlete),pause}});
 assert.equal(generateProgram(withPause({nonclinical:true,weeks:6,reason:'Pneumonia, recovered now'}),opts).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(generateProgram(withPause({nonclinical:true,weeks:6,reasonCategory:'INJURY'}),opts).status,'CLINICAL_HUMAN_REQUIRED');
 const unclear=generateProgram(withPause({nonclinical:true,weeks:6}),opts);assert.equal(unclear.status,'ASK');assert.ok(unclear.missingInputs.includes('athlete.pause.reasonCategory'));
 assert.equal(generateProgram(base,opts).program.capability.run.class,'RESTART');
 const noReturn=generateProgram(base,{authority:devAuthority(loadR6Policy().scientificBoundaryIds.filter(id=>id!=='R6-NONCLINICAL-RETURN'))});
 assert.equal(noReturn.status,'UNSUPPORTED');assert.match(noReturn.reason,/Nonclinical-return authority/);
});
