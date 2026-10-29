import test from 'node:test';
import assert from 'node:assert/strict';
import corpus from '../r2/evaluation/REPRESENTATIVE_CORPUS_R2.json' with {type:'json'};
import {normalizeRepresentative} from '../src/r3-input.mjs';
import {evaluateCoachingShadow,CoachingShadowJournal,buildAthleteModel,updateAthleteModel} from '../src/r4-index.mjs';
import registry from '../r4/PRESCRIPTION_ENVELOPE_REGISTRY.json' with {type:'json'};
import {clone,hash} from '../src/value.mjs';

const source=n=>clone(corpus.cases[n-1].scenarioFacts);
const input=(n,change)=>{const f=source(n);change?.(f);return normalizeRepresentative({caseId:'BEHAVIOR_ONLY',scenarioFacts:f});};
// Explicitly synthetic authority injection tests the gate mechanics, never a scientific approval.
const authority={records:registry.envelopes.map(e=>({envelopeId:e.envelopeId,envelopeHash:hash(e),disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',independent:true,sourceIds:['TEST_ONLY_NOT_SCIENCE'],reviewId:'TEST_ONLY'}))};
const run=(n,change,options={})=>evaluateCoachingShadow(input(n,change),{registry,authority,...options});
test('R4 coached strength progression chooses concrete minimum candidate and explains goal trade-offs',()=>{
 const d=run(11).shadowDecision;
 assert.equal(d.decisionType,'MODIFY');
 assert.equal(d.candidate.recipe.reps,9);
 assert.equal(d.candidate.recipe.loadKgPerHand,12);
 assert.ok(d.coachingReasoning.candidates.length>=2);
 assert.ok(d.coachingReasoning.whyPreferred);
});
test('R4 local adaptation preserves all essential work and omits only optional affected accessory',()=>{
 const d=run(9).shadowDecision;
 assert.equal(d.decisionType,'MODIFY');
 assert.deepEqual(d.candidate.recipe.essential,source(9).currentDemand.session.essential);
 assert.deepEqual(d.candidate.recipe.optional,[]);
});
test('R4 confirmed systemic convergence modifies only uncompleted suffix and does not require another hard rep',()=>{
 const r=run(10);
 assert.equal(r.shadowDecision.decisionType,'MODIFY');
 assert.deepEqual(r.observedExecutionState,{repetitions:2,actualWorkMinutes:[5,3]});
 assert.equal(r.shadowDecision.candidate.recipe.remainingHardRepetitions,0);
});
test('phase and goal change progression selection, rather than merely changing trace text',()=>{
 assert.equal(run(11).shadowDecision.candidate.recipe.reps,9);
 for(const change of [f=>f.phase='TAPER',f=>f.goal='strength maintenance',f=>f.constraints={progressionConflictsWithKeyStimulus:true}]){
  const d=run(11,change).shadowDecision;
  assert.equal(d.decisionType,'KEEP');
  assert.equal(d.ranking.selectedId,'KEEP_BASE');
  assert.equal(d.candidate,null);
  assert.ok(d.coachingReasoning.tradeOff);
 }
 const p=run(37,f=>f.phase='BUILD').shadowDecision,t=run(37,f=>f.phase='RACE_WEEK').shadowDecision;
 assert.equal(p.candidate.recipe.minutes,60);assert.equal(t.decisionType,'KEEP');
});
test('single noisy strength response does not trigger progression; repeated mismatch uses smallest known increment',()=>{
 assert.equal(run(11,f=>f.observations.recentComparableSessions=f.observations.recentComparableSessions.slice(0,1)).shadowDecision.decisionType,'KEEP');
 const down=run(12).shadowDecision;assert.equal(down.candidate.recipe.loadKg,22);assert.equal(down.candidate.recipe.sets,3);assert.equal(down.candidate.recipe.reps,8);
 assert.notEqual(run(12,f=>f.currentDemand.availableAlternative.loadKg=18).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(11,f=>f.currentDemand.candidate.loadKgPerHand=14).shadowDecision.decisionType,'MODIFY');
});
test('priority counterfactual changes which familiar session moves into the supplied window',()=>{
 const r=run(15).shadowDecision,s=run(16).shadowDecision;
 assert.equal(r.ranking.selectedId,'MOVE_STRENGTH_FRI');assert.equal(s.ranking.selectedId,'MOVE_RUN_FRI');
 assert.deepEqual(r.candidate.recipe.sessions.map(x=>[x.modality,x.day]),[['run','THU'],['strength','FRI']]);
 assert.deepEqual(s.candidate.recipe.sessions.map(x=>[x.modality,x.day]),[['run','FRI'],['strength','THU']]);
 assert.notEqual(run(15,f=>f.currentDemand.availability.FRI=[['17:00','17:10']]).shadowDecision.decisionType,'MODIFY');
});
test('new runner and strength familiarity produce governed executable starting work without imagined capacity',()=>{
 const r=run(7).shadowDecision;assert.equal(r.decisionType,'MODIFY');assert.equal(r.candidate.recipe.work.repetitions,3);assert.ok(r.candidate.recipe.work.walkInsteadIfTalkOrFunctionDeteriorates);
 const s=run(3).shadowDecision;assert.equal(s.decisionType,'MODIFY');assert.equal(s.candidate.recipe.exercises.length,2);assert.ok(s.candidate.recipe.exercises.every(x=>x.loadSelection.targetRirAtLeast>=3));
 assert.equal(run(4).shadowDecision.decisionType,'ASK');assert.equal(run(8).shadowDecision.decisionType,'ASK');
 assert.equal(run(2).shadowDecision.decisionType,'ASK');
});
test('familiar cruise and strides compose approved easy preparation without claiming measured physiology',()=>{
 for(const n of [34,39]){const d=run(n).shadowDecision;assert.equal(d.decisionType,'MODIFY');assert.equal(d.candidate.recipe.warmup.minutes,10);assert.equal(d.candidate.recipe.cooldown.minutes,5);assert.match(d.candidate.recipe.calibration.claim,/not a measured/);}
 for(const n of [35,36,38,40])assert.equal(run(n).shadowDecision.decisionType,'ASK');
});
test('nonclinical return uses a governed low-demand trial and current compatible demonstration outranks generic prior',()=>{
 assert.equal(run(19).shadowDecision.candidate.recipe.maximumMinutes,15);
 assert.equal(run(20).shadowDecision.candidate.recipe.loadSelection.ceilingKg,16);
 const d=run(19,f=>f.observations.currentTaskDemonstration={current:true,comparable:true,response:'compatible',recipe:{family:'EASY',minutes:20,effort:'comfortable full sentences'}}).shadowDecision;
 assert.equal(d.candidate.recipe.minutes,20);assert.equal(d.ranking.selectedId,'CURRENT_COMPATIBLE_DEMONSTRATION');
 assert.equal(run(22).shadowDecision.decisionType,'ASK');assert.equal(run(23).shadowDecision.decisionType,'HOLD');
});
test('immutable completed dose rejects impossible partial execution rather than rewriting it',()=>{
 for(const n of [9,10,11,15,19,31,34,37,39]){const i=input(n),before=hash(i),r=evaluateCoachingShadow(i,{registry,authority});assert.equal(hash(i),before);assert.deepEqual(r.appliedState,r.officialPlanState);assert.equal(r.shadowDecision.applied,false);assert.ok(Object.isFrozen(r.shadowDecision));}
 assert.notEqual(run(10,f=>f.completedPrefix.actualWorkMinutes=[5,8]).shadowDecision.decisionType,'MODIFY');
});
test('all clinical current signals win over historical nonclinical eligibility and familiar recipes',()=>{
 for(const signal of [{pain:true},{persistentPain:true},{injury:true},{illness:'current illness symptoms reported'}])assert.equal(run(31,f=>f.observations=signal).shadowDecision.decisionType,'CLINICAL_HUMAN_REQUIRED');
 for(const n of [24,30])assert.equal(run(n).shadowDecision.decisionType,'CLINICAL_HUMAN_REQUIRED');
 assert.notEqual(run(31,f=>f.population.ageYears=16).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(31,f=>f.population.realPerson=true).shadowDecision.decisionType,'MODIFY');
});
test('missing, stale, mutated, withdrawn or self-authored envelope authority fails closed',()=>{
 assert.notEqual(run(11,undefined,{authority:null}).shadowDecision.decisionType,'MODIFY');
 for(const change of [a=>a.records[2].independent=false,a=>a.records.forEach(r=>r.independent=false),a=>a.records.forEach(r=>r.disposition='ABSTAIN'),a=>a.records.forEach(r=>r.envelopeHash='stale')]){
  const a=clone(authority);change(a);assert.notEqual(run(11,undefined,{authority:a}).shadowDecision.decisionType,'MODIFY');
 }
 const r=clone(registry);r.envelopes.find(e=>e.envelopeId==='R4-STRENGTH-ADAPTATION').revision='UNREVIEWED';
 assert.notEqual(run(11,undefined,{registry:r}).shadowDecision.decisionType,'MODIFY');
});
test('case identities never select an action, contract tampering cannot become coaching ASK',()=>{
 const i=input(11),j=clone(i);j.source.caseId='A_NEW_ID';
 assert.deepEqual(evaluateCoachingShadow(i,{registry,authority}).shadowDecision.candidate,evaluateCoachingShadow(j,{registry,authority}).shadowDecision.candidate);
 i.facts['/currentDemand/base/reps'].value=12;
 assert.equal(evaluateCoachingShadow(i,{registry,authority}).shadowDecision.coverage,'NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP');
});
test('learning model excludes unconsented, stale, incomparable, duplicate and unproven observations',()=>{
 const event={eventId:'A',sourceHash:hash({actual:true}),origin:'ACTUAL_EXECUTION',observedAt:'2026-10-25T09:00:00-03:00',comparable:true,context:{movement:'row',equipment:'same'},arrangement:'OPTION',response:'usual'};
 assert.equal(buildAthleteModel([event]).observations.length,0);
 const m=buildAthleteModel([event,event,{...event,eventId:'B',stale:true},{...event,eventId:'C',comparable:false},{...event,eventId:'D',sourceHash:null}],{purposeAllowed:true});
 assert.equal(m.observations.length,1);assert.equal(m.excluded.length,4);assert.equal(m.automaticDoseAuthority,false);assert.equal(m.causalityEstablished,false);
 const updated=updateAthleteModel(m,[{...event,eventId:'E'}],{purposeAllowed:true});assert.equal(updated.observations.length,2);assert.equal(m.observations.length,1);
 const forged=clone(m);forged.observations[0].response='forged';assert.notEqual(run(11,undefined,{athleteModel:forged}).shadowDecision.decisionType,'MODIFY');
});
test('symbolic option names and one confounded bad observation never become positive prescriptions or causal rules',()=>{
 assert.equal(run(41).shadowDecision.decisionType,'ASK');
 assert.ok(run(41).shadowDecision.missingInputs.includes('/currentDemand/options/prescriptions'));
 assert.equal(run(42).shadowDecision.decisionType,'HOLD');
});
test('journal is deterministic, immutable, idempotent and sensitive to review version',()=>{
 const j=new CoachingShadowJournal(),i=input(11);const x=j.record(i,{registry,authority});assert.equal(x.duplicate,false);assert.equal(j.record(i,{registry,authority}).duplicate,true);
 const a=clone(authority);a.records[0].reviewId='NEW_REVIEW';assert.equal(j.record(i,{registry,authority:a}).duplicate,false);assert.equal(j.size,2);
});
test('scientific boundary review: maximal strides, hard return and undersized windows are inadmissible',()=>{
 assert.notEqual(run(39,f=>f.priorHistory.sameFamily.effort='all-out maximal sprint').shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(19,f=>f.observations.currentTaskDemonstration={current:true,comparable:true,response:'compatible',recipe:{family:'HARD_RUN',minutes:30,effort:'maximal'}}).shadowDecision.ranking?.selectedId,'CURRENT_COMPATIBLE_DEMONSTRATION');
 assert.notEqual(run(34,f=>f.currentDemand.availabilityMinutes=10).shadowDecision.decisionType,'MODIFY');
});
test('substitution requires its own effort and rest anchor, never only kilograms and repetitions',()=>{
 const mutate=f=>{f.history.requestedMovementFamiliar=true;f.currentDemand.requested.loadKgPerHand=10;f.history.completeAlternativeRecipe={exercise:'dumbbell bench press',sets:2,reps:8,loadKgPerHand:10};};
 assert.notEqual(run(18,mutate).shadowDecision.decisionType,'MODIFY');
 assert.equal(run(18,f=>{mutate(f);f.history.completeAlternativeRecipe.targetRir=3;f.history.completeAlternativeRecipe.restSeconds=120;}).shadowDecision.decisionType,'MODIFY');
});
test('source availability and equipment are hard constraints for full requested recipes',()=>{
 for(const [num,change] of [[37,f=>f.availability=[{day:'SUN',minutes:20}]],[34,f=>f.availability=[{day:'THU',minutes:10}]],[11,f=>f.availability=[{day:'TUE',minutes:1}]],[11,f=>{f.currentDemand.candidate={...f.currentDemand.base,loadKgPerHand:13};f.equipment={availableLoadsKgPerHand:[12]};}]])assert.notEqual(run(num,change).shadowDecision.decisionType,'MODIFY');
});
test('negated compatibility is never positive tolerance evidence',()=>{
 for(const phrase of ['not compatible in similar context','not normal','no longer comfortable','not usual'])assert.notEqual(run(37,f=>f.priorHistory.candidateResponse=phrase).shadowDecision.decisionType,'MODIFY');
});
test('a maintenance secondary goal does not veto progression toward the explicit primary goal',()=>{
 const d=run(11,f=>f.goal={primary:'increase strength in supported row',secondary:'maintain strength in other movements'}).shadowDecision;
 assert.equal(d.decisionType,'MODIFY');assert.equal(d.candidate.recipe.reps,9);
});
test('boundary regressions reject contradictory intensity, response, environment and movement comparability',()=>{
 for(const change of [f=>f.priorHistory.sameFamily.effort='maximal unsustainable all-out',f=>f.priorHistory.sameFamily.response='not compatible',f=>f.environment={terrain:'steep hilly',conditions:'hot humid not comparable'}])assert.notEqual(run(34,change).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(39,f=>f.environment.surface='icy uneven new surface').shadowDecision.decisionType,'MODIFY');
 for(const change of [f=>f.observations.nextDay='incompatible',f=>f.observations.recentComparableSessions[0].technique='not usual',f=>f.history.knownResponse='not compatible',f=>f.history.contextComparability='DIFFERENT movement and equipment'])assert.notEqual(run(11,change).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(19,f=>f.observations.currentFunction='not normal').shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(37,f=>f.currentDemand.family='VO2_STYLE_INTERVALS').shadowDecision.decisionType,'MODIFY');
});
test('complete actual optional work is preserved, not falsely omitted; recovery/rest is part of a strength recipe',()=>{
 const d=run(9,f=>f.currentDemand.session.completed=[clone(f.currentDemand.session.optional[0])]).shadowDecision;
 assert.equal(d.decisionType,'KEEP');assert.equal(d.candidate,null);
 assert.match(run(12).shadowDecision.candidate.recipe.rest,/2 minutes/);
});
test('restrictive natural equipment list is not unrestricted availability, ambiguous dumbbell units ask',()=>{
 assert.notEqual(run(11,f=>{f.currentDemand.candidate={...f.currentDemand.base,loadKgPerHand:13};f.onboarding={equipment:['12 kg dumbbells only']};}).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(11,f=>{f.currentDemand.candidate={...f.currentDemand.base,loadKgPerHand:18};f.history.equipmentIncrementKg=2;}).shadowDecision.decisionType,'MODIFY');
 assert.equal(run(18,f=>{f.history.requestedMovementFamiliar=true;f.history.completeAlternativeRecipe={exercise:'dumbbell bench press',sets:2,reps:8,loadKg:20,targetRir:3,restSeconds:120};}).shadowDecision.decisionType,'ASK');
 assert.notEqual(run(11,f=>f.onboarding={equipment:['bodyweight only; no dumbbells']}).shadowDecision.decisionType,'MODIFY');
});
test('explicit current same-task reported exposure is consumed without demanding another synonymous field',()=>{
 const d=run(19,f=>{f.currentDemand.candidateMinutes=25;f.reportedExposure={run:{family:'EASY',minutes:25,talk:'comfortable',response:'normal during and next day',establishedToday:true}};f.observations={currentCapacity:'current compatible easy25',ordinaryFunction:'usual',clinicalConcern:false};}).shadowDecision;
 assert.equal(d.decisionType,'MODIFY');assert.equal(d.candidate.recipe.minutes,25);assert.equal(d.semanticConsumption.consumed,true);assert.equal(d.semanticConsumption.materialContract.valid,true);
});
test('actual truncated work is evidence of early termination without requiring a magic narrative phrase',()=>{
 const d=run(10,f=>{f.currentDemand.session.workMinutesEach=6;f.completedPrefix.actualWorkMinutes=[6,4];f.observations.firstTwoRepetitions='usual pace requires distinctly more effort; second voluntarily stopped early';}).shadowDecision;
 assert.equal(d.decisionType,'MODIFY');assert.equal(d.candidate.recipe.remainingHardRepetitions,0);
});
function claimedLearnedOptions(f,malformed){
 f.currentDemand.availability={MON:[['10:00','11:00']],WED:[['10:00','11:00']],THU:[['10:00','11:00']]};
 for(const option of f.currentDemand.options){const day=option.id.includes('LOWER_MON')?'MON':'WED';option.schedule={strengthDay:day,cruiseDay:'THU'};option.prescriptions=[{day,start:'10:00',durationMinutes:30,recipe:malformed?{}:{exercise:'goblet squat',sets:2,reps:8,loadKg:12,targetRir:3,restSeconds:120}}];}
 if(!malformed)f.currentDemand.options[1].prescriptions[0].recipe.sets=100000;
}
test('self-declared same-dose label and arbitrary embedded recipe cannot create learned positive authority',()=>{
 for(const malformed of [true,false]){const d=run(41,f=>claimedLearnedOptions(f,malformed)).shadowDecision;assert.notEqual(d.decisionType,'MODIFY');assert.equal(d.unsupportedDependency,'LEARNED_OPTION_ADMISSIBILITY_CONTRACT');}
});
test('unreviewed pregnancy/postpartum/frailty and extra eligibility context cannot disappear behind a familiar task',()=>{
 for(const field of ['pregnant','postpartum','frailty','unreviewedPopulationContext'])assert.notEqual(run(37,f=>f.population[field]=true).shadowDecision.decisionType,'MODIFY');
 assert.notEqual(run(37,f=>f.eligibility.contraindication='unassessed material restriction').shadowDecision.decisionType,'MODIFY');
 assert.equal(run(37,f=>f.eligibility.persistentPain=true).shadowDecision.decisionType,'CLINICAL_HUMAN_REQUIRED');
});
test('answers to a substantive ASK remove that ASK; missing coaching logic becomes an explicit domain gap',()=>{
 const recovery=run(32,f=>{f.calibration.recoveryDistinctConstruct='lighter than familiar easy, subjective-only recovery intent';f.observations.needForSeparateRecoveryIntent='explicitly requested low-demand recovery practice after ordinary life stress';}).shadowDecision;
 assert.equal(recovery.coverage,'NOT_SUPPORTED_DOMAIN_GAP');assert.equal(recovery.decisionType,'NOT_SUPPORTED_YET');assert.deepEqual(recovery.missingInputs,[]);
 const novel=run(35,f=>{f.calibration.recentTaskAnchor={family:'VO2_STYLE_INTERVALS',repetitions:3,workMinutesEach:2,effort:'controlled hard'};f.priorHistory.currentComparableResponse='compatible current same-task completion';}).shadowDecision;
 assert.equal(novel.coverage,'NOT_SUPPORTED_DOMAIN_GAP');assert.deepEqual(novel.missingInputs,[]);
 const partial=run(32,f=>f.calibration.recoveryDistinctConstruct='subjective-only low demand').shadowDecision;
 assert.equal(partial.coverage,'USEFUL_ASK');assert.deepEqual(partial.missingInputs,['/observations/needForSeparateRecoveryIntent']);
});
test('numbered historical familiarity binds its actual minute dose rather than every future candidate',()=>{
 assert.equal(run(37).shadowDecision.candidate.recipe.minutes,60);
 const changed=run(37,f=>f.currentDemand.candidateMinutes=70).shadowDecision;
 assert.notEqual(changed.decisionType,'MODIFY');
 const supplied=run(37,f=>{f.currentDemand.candidateMinutes=70;f.priorHistory.candidate60PreviouslyFamiliar=false;f.priorHistory.candidate70PreviouslyFamiliar=true;}).shadowDecision;
 assert.equal(supplied.decisionType,'MODIFY');assert.equal(supplied.candidate.recipe.minutes,70);
});
