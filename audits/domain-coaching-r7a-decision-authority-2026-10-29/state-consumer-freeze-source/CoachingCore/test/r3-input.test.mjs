import test from 'node:test';
import assert from 'node:assert/strict';
import corpus from '../r2/evaluation/REPRESENTATIVE_CORPUS_R2.json' with {type:'json'};
import {normalizeRepresentative,validateCanonical,fact,factCell,canonicalFactsHash} from '../src/r3-input.mjs';

const record=id=>corpus.cases.find(c=>c.caseId==='REP-R2-'+String(id).padStart(2,'0'));
const normalize=id=>normalizeRepresentative(record(id));
const custom=facts=>normalizeRepresentative({caseId:'TEST',scenarioFacts:{population:{synthetic:true,realPerson:false},...facts}});
const valid=input=>assert.deepEqual(validateCanonical(input),{valid:true,errors:[]});

test('all 42 frozen representative cases are canonical-valid and losslessly recoverable',()=>{
 assert.equal(corpus.cases.length,42);
 for(const source of corpus.cases){
  const before=JSON.stringify(source);const input=normalizeRepresentative(source);
  valid(input);assert.deepEqual(fact(input,''),source.scenarioFacts,source.caseId);
  assert.equal(input.source.factsHash,source.scenarioFactsSha256,source.caseId);
  assert.equal(input.adapter.blocked,false,source.caseId);
  assert.equal(JSON.stringify(source),before,'adapter cannot mutate fixture');
  assert.equal(Object.keys(input.facts).length,input.adapter.trace.filter(t=>['COPY','NULL_AS_UNKNOWN','UNKNOWN_TOKEN_PRESERVED'].includes(t.operation)).length);
  for(const [path,cell] of Object.entries(input.facts)){
   assert.equal(cell.sourcePath,path);assert.equal(cell.origin,'EXPLICIT_SYNTHETIC');
   assert.deepEqual(fact(input,path),cell.value);
  }
 }
});
test('normalization is deterministic, detached, and excludes independent expectations',()=>{
 const a=normalize(1),b=normalize(1);assert.deepEqual(a,b);
 const change=structuredClone(record(1));change.independentExpectation={targetCategory:'INJECT_POSITIVE'};change.title='not a runtime fact';change.gap='not a runtime instruction';
 assert.deepEqual(normalizeRepresentative(change),a);
 a.facts['/population/priority'].value='CHANGED';assert.equal(b.facts['/population/priority'].value,'BALANCED');
 assert.equal(JSON.stringify(b).includes('independentExpectation'),false);
 assert.equal(JSON.stringify(b).includes('exactDoseOracle'),false);
});
test('absent, explicit null unknown, unknown prose, not applicable, false and zero remain distinct',()=>{
 const input=custom({sample:{nullValue:null,unknown:'unknown',notApplicable:'not applicable',falseValue:false,zero:0,emptyArray:[],emptyObject:{}}});
 valid(input);
 assert.deepEqual(factCell(input,'/missing'),{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:'/missing'});
 assert.equal(factCell(input,'/sample/nullValue').status,'UNKNOWN');assert.equal(fact(input,'/sample/nullValue'),null);
 assert.equal(factCell(input,'/sample/unknown').status,'UNKNOWN');assert.equal(fact(input,'/sample/unknown'),'unknown');
 assert.equal(factCell(input,'/sample/notApplicable').status,'NOT_APPLICABLE');
 assert.equal(factCell(input,'/sample/falseValue').status,'KNOWN');assert.equal(fact(input,'/sample/falseValue'),false);
 assert.equal(fact(input,'/sample/zero'),0);assert.deepEqual(fact(input,'/sample/emptyArray'),[]);assert.deepEqual(fact(input,'/sample/emptyObject'),{});
});
test('JSON pointer escapes and numeric object keys are lossless rather than converted to arrays',()=>{
 const input=custom({sample:{'a/b':{'~key':{'0':'object entry'}},array:[{'0':'still an object'}]}});valid(input);
 assert.equal(fact(input,'/sample/a~1b/~0key/0'),'object entry');
 assert.deepEqual(fact(input,'/sample/a~1b/~0key'),{'0':'object entry'});
 assert.deepEqual(fact(input,'/sample/array'),[{'0':'still an object'}]);
});
test('onboarding day/minute capacities do not become invented sessions or dates',()=>{
 const input=normalize(1);valid(input);
 assert.equal(input.structuredContexts.schedule.availability.length,3);
 const first=input.structuredContexts.schedule.availability[0];assert.equal(first.day.value,'TUE');assert.equal(first.capacityMinutes.value,35);
 assert.equal(first.startMinute.status,'ABSENT');assert.equal(input.structuredContexts.schedule.timeBasis,'LOCAL_UNANCHORED');
 assert.equal(input.structuredContexts.schedule.timezone.status,'ABSENT');assert.equal(input.structuredContexts.athlete.ageYears.status,'ABSENT');
 assert.equal(input.structuredContexts.sessions.some(s=>s.sourcePath.includes('/availability')),false);
});
test('explicit HH:mm schedule windows become local minutes with arithmetic provenance',()=>{
 const input=normalize(15);valid(input);
 const [thu,fri]=input.structuredContexts.schedule.availability;
 assert.equal(thu.day.value,'THU');assert.equal(thu.startMinute.value,1080);assert.equal(thu.endMinute.value,1140);
 assert.equal(fri.startMinute.value,1020);assert.equal(fri.endMinute.value,1080);
 assert.equal(thu.startMinute.origin,'INFERRED');assert.equal(thu.startMinute.derivation,'HHMM_TO_LOCAL_MINUTE');
 assert.equal(fact(input,'/currentDemand/availability/THU/0/0'),'18:00');
 const run=input.structuredContexts.sessions.find(s=>s.sourcePath==='/currentDemand/planned/run');
 assert.equal(run.timing.startMinute.value,1080);assert.equal(run.dose.durationMinutes.value,40);
 assert.equal(input.adapter.trace.some(t=>t.operation==='HHMM_TO_LOCAL_MINUTE'),true);
});
test('malformed local times block representation instead of correction or rollover',()=>{
 const input=custom({currentDemand:{availability:{MON:[['25:00','26:00']]}}});valid(input);
 assert.equal(input.adapter.blocked,true);assert.equal(input.adapter.warnings.some(w=>w.code==='INVALID_LOCAL_TIME'),true);
 assert.equal(input.structuredContexts.schedule.availability[0].startMinute.status,'UNKNOWN');
 const reversed=custom({currentDemand:{availability:{MON:[['23:00','01:00']]}}});valid(reversed);
 assert.equal(reversed.adapter.conflicts[0].code,'UNANCHORED_WINDOW_ORDER');
 assert.equal(reversed.structuredContexts.schedule.availability[0].endMinute.value,60);
});
test('array availability exposes reversed local windows using the same boundary as object windows',()=>{
 const input=custom({availability:[{day:'MON',start:'19:00',end:'18:00'}]});valid(input);
 assert.equal(input.adapter.conflicts.some(c=>c.code==='UNANCHORED_WINDOW_ORDER'),true);
 assert.equal(input.structuredContexts.schedule.availability[0].startMinute.value,1140);
 assert.equal(input.structuredContexts.schedule.availability[0].endMinute.value,1080);
 assert.equal(fact(input,'/availability/0/end'),'18:00');
});
test('array availability exposes explicit capacity exceeding its clock window and preserves both values',()=>{
 const input=custom({availability:[{day:'MON',start:'18:00',end:'19:00',minutes:120}]});valid(input);
 assert.equal(input.adapter.conflicts.some(c=>c.code==='CAPACITY_EXCEEDS_LOCAL_WINDOW'),true);
 const window=input.structuredContexts.schedule.availability[0];assert.equal(window.capacityMinutes.value,120);
 assert.equal(window.endMinute.value-window.startMinute.value,60);
 const bounded=custom({availability:[{day:'MON',start:'18:00',end:'19:00',minutes:30}]});valid(bounded);
 assert.equal(bounded.adapter.conflicts.length,0,'a smaller declared capacity can fit inside a larger window');
});
test('planned dose and partial completed work remain separate and immutable',()=>{
 const input=normalize(10);valid(input);
 assert.deepEqual(fact(input,'/completedPrefix'),{repetitions:2,actualWorkMinutes:[5,3]});
 const planned=input.structuredContexts.sessions.find(s=>s.sourcePath==='/currentDemand/session');
 const completed=input.structuredContexts.sessions.find(s=>s.sourcePath==='/completedPrefix');
 assert.equal(planned.dose.repetitions.value,4);assert.equal(planned.dose.workMinutesEach.value,5);
 assert.equal(completed.role,'COMPLETED');assert.deepEqual(completed.dose.actualWorkMinutes.value,[5,3]);
 assert.equal(fact(input,'/completedPrefix/actualWorkMinutes/1'),3);
});
test('strength equipment configuration, per-hand load, RIR and set-wise actual reps retain units',()=>{
 const input=normalize(11);valid(input);
 const base=input.structuredContexts.sessions.find(s=>s.sourcePath==='/currentDemand/base');
 const candidate=input.structuredContexts.sessions.find(s=>s.sourcePath==='/currentDemand/candidate');
 assert.equal(base.dose.loadKgPerHand.value,12);assert.equal(base.dose.loadKg.status,'ABSENT');
 assert.equal(base.dose.targetRir.value,3);assert.equal(base.dose.restSeconds.value,120);assert.equal(candidate.dose.reps.value,9);
 assert.deepEqual(fact(input,'/observations/recentComparableSessions/0/reps'),[8,8]);
});
test('narrative amounts are preserved without fabricated numeric doses or age',()=>{
 const input=normalize(2);valid(input);
 assert.equal(fact(input,'/reportedExposure/run/familiar'),'10 min walk + three relaxed 1 min jog / 2 min walk segments');
 assert.equal(factCell(input,'/reportedExposure/run/repetitions').status,'ABSENT');
 assert.equal(input.structuredContexts.athlete.ageYears.status,'ABSENT');
 assert.equal(input.adapter.warnings.some(w=>w.code==='NARRATIVE_NUMERIC_CONTENT_RETAINED'),true);
 assert.equal(JSON.stringify(input.structuredContexts).includes('necessitySatisfied'),false);
});
test('low-data and no wearable retain useful facts without creating a device requirement',()=>{
 const input=normalize(7);valid(input);
 assert.equal(input.structuredContexts.athlete.dataTier.value,'NO_WEARABLE');
 assert.equal(fact(input,'/reportedExposure/walk/minutes'),30);assert.equal(input.adapter.blocked,false);
 assert.equal(factCell(input,'/calibration/method').status,'ABSENT');
});
test('rich wearable data never creates measured physiological calibration',()=>{
 const input=normalize(35);valid(input);
 assert.equal(fact(input,'/wearable/powerAvailable'),true);assert.equal(fact(input,'/wearable/individualPowerModelValidated'),false);
 assert.equal(factCell(input,'/calibration/measuredVo2').status,'UNKNOWN');
 assert.equal(factCell(input,'/calibration/criticalSpeed').status,'ABSENT');
 assert.equal(input.structuredContexts.calibration.method.status,'ABSENT');
});
test('conflicting data tier and device in case17 are exposed rather than reconciled silently',()=>{
 const input=normalize(17);valid(input);
 assert.equal(fact(input,'/population/dataTier'),'NO_WEARABLE');assert.equal(fact(input,'/wearable/type'),'HRV_AND_SLEEP');
 assert.equal(input.adapter.conflicts.some(c=>c.code==='DATA_TIER_DEVICE_CONFLICT'&&c.requiresResolution),true);
 assert.equal(input.adapter.blocked,false,'substantive conflict is not a transport failure');
});
test('conflicting explicit dose fields retain both values and expose the conflict',()=>{
 const input=custom({currentDemand:{session:{family:'EASY',minutes:20,durationMinutes:25}}});valid(input);
 assert.equal(input.adapter.conflicts[0].code,'CONFLICTING_DURATION_FIELDS');
 assert.equal(input.structuredContexts.sessions[0].dose.minutes.value,20);assert.equal(input.structuredContexts.sessions[0].dose.durationMinutes.value,25);
});
test('duplicated event IDs remain visible and cannot become silent repeated evidence',()=>{
 const input=custom({priorHistory:{observations:[{eventId:'one',minutes:20},{eventId:'one',minutes:20}]}});valid(input);
 assert.equal(fact(input,'/priorHistory/observations').length,2);
 assert.equal(input.adapter.warnings.some(w=>w.code==='DUPLICATED_EVENT_ID_PRESERVED'),true);
});
test('stale observations remain historical facts; no arbitrary freshness threshold appears',()=>{
 const input=custom({priorHistory:{observations:[{observedAt:'2025-01-01T10:00:00-03:00',stale:true,minutes:20}],lastRace:{ageMonths:8}}});valid(input);
 assert.equal(fact(input,'/priorHistory/observations/0/stale'),true);
 assert.equal(input.adapter.warnings.some(w=>w.code==='EXPLICIT_STALE_OBSERVATION'),true);
 assert.equal(fact(input,'/priorHistory/lastRace/ageMonths'),8);
 assert.equal(factCell(input,'/priorHistory/lastRace/stale').status,'ABSENT');
});
test('event chronology is not fabricated when evaluation time is absent',()=>{
 const input=normalize(29);valid(input);
 assert.equal(input.structuredContexts.event.completedAt.value,'2026-10-25T08:00:00-03:00');
 assert.equal(input.structuredContexts.schedule.evaluationTime.status,'ABSENT');
 assert.equal(input.adapter.warnings.some(w=>w.code==='EVENT_TIME_WITHOUT_EVALUATION_ANCHOR'),true);
 assert.equal(factCell(input,'/event/daysBefore').status,'ABSENT');
});
test('interruption duration never establishes return capacity or clinical clearance',()=>{
 const input=normalize(20);valid(input);
 assert.equal(input.structuredContexts.interruption.durationDays.value,18);
 assert.equal(input.structuredContexts.recovery.currentCapacity.status,'UNKNOWN');
 assert.equal(input.structuredContexts.eligibility.clearanceClaim.value,false);
 assert.equal(factCell(input,'/interruption/detrainingPercent').status,'ABSENT');
});
test('clinical fact normalization preserves clinical boundary and does not prescribe',()=>{
 const input=normalize(24);valid(input);
 assert.equal(input.structuredContexts.eligibility.clinicalConcern.value,true);assert.equal(input.structuredContexts.eligibility.injury.value,true);
 assert.equal(input.structuredContexts.recovery.pain.value,'persistent with ordinary jogging');
 assert.equal(hasDecision(input),false);
 function hasDecision(value){return ['decision','policyId','action','proposedEffects','appliedEffects'].some(key=>Object.hasOwn(value,key));}
});
test('learning observations remain observations rather than a causal or learned prescription',()=>{
 const input=normalize(41);valid(input);
 assert.equal(fact(input,'/priorHistory/observations').length,4);
 assert.equal(input.structuredContexts.history.causalityEstablished.value,false);
 assert.equal(input.structuredContexts.history.observational.value,true);
 assert.equal(factCell(input,'/priorHistory/learnedRule').status,'ABSENT');
});
test('new source leaves survive normalization without becoming new policy inputs by default',()=>{
 const input=custom({unfamiliarContext:{newFlag:true,scoreLikeValue:93},currentDemand:{kind:'FIRST_WEEK'}});valid(input);
 assert.equal(fact(input,'/unfamiliarContext/newFlag'),true);assert.equal(fact(input,'/unfamiliarContext/scoreLikeValue'),93);
 assert.equal(Object.hasOwn(input.structuredContexts,'fatigueScore'),false);
});
test('unsupported schema versions and extra canonical root fields are rejected',()=>{
 const input=normalize(1);input.schemaVersion='2.0.0';assert.equal(validateCanonical(input).valid,false);
 const future=normalize(1);future.schemaVersion='3.1.0';assert.equal(validateCanonical(future).valid,false);
 const extra=normalize(1);extra.readinessScore=99;assert.equal(validateCanonical(extra).valid,false);
});
test('source hash and typed projection tampering cannot silently alter coaching facts',()=>{
 const hash=normalize(1);hash.facts['/population/priority'].value='RUN_FIRST';assert.equal(validateCanonical(hash).valid,false);
 const context=normalize(1);context.structuredContexts.athlete.priority.value='RUN_FIRST';assert.equal(validateCanonical(context).valid,false);
 const forged=normalize(17);forged.adapter.conflicts=[];assert.equal(validateCanonical(forged).valid,false);
 const state=normalize(8);state.facts['/onboarding/availability'].status='KNOWN';assert.equal(validateCanonical(state).valid,false);
});
test('changed frozen source hash is explicit blocking and never silently accepted as unchanged corpus',()=>{
 const modified=structuredClone(record(1));modified.scenarioFacts.onboarding.availability[0].minutes=36;
 const input=normalizeRepresentative(modified);valid(input);
 assert.equal(input.adapter.blocked,true);assert.equal(input.adapter.warnings.some(w=>w.code==='SOURCE_HASH_MISMATCH'),true);
 assert.notEqual(input.source.factsHash,input.source.declaredFactsHash);
});
test('source-derived stale and duplicate warnings cannot be cleared or altered',()=>{
 const fixture={priorHistory:{observations:[{eventId:'same',stale:true,minutes:20},{eventId:'same',minutes:20}]}};
 const cleared=custom(fixture);valid(cleared);cleared.adapter.warnings=[];
 assert.equal(validateCanonical(cleared).valid,false);
 const altered=custom(fixture);altered.adapter.warnings.find(w=>w.code==='EXPLICIT_STALE_OBSERVATION').sourcePaths=['/unrelated'];
 assert.equal(validateCanonical(altered).valid,false);
});
test('source hash warning and transformation trace cannot be removed or forged',()=>{
 const modified=structuredClone(record(1));modified.scenarioFacts.onboarding.availability[0].minutes=36;
 const warning=normalizeRepresentative(modified);warning.adapter.warnings=warning.adapter.warnings.filter(w=>w.code!=='SOURCE_HASH_MISMATCH');
 assert.equal(validateCanonical(warning).valid,false);
 const removed=normalize(15);removed.adapter.trace=removed.adapter.trace.filter(t=>t.operation!=='HHMM_TO_LOCAL_MINUTE');
 assert.equal(validateCanonical(removed).valid,false);
 const forged=normalize(15);forged.adapter.trace.find(t=>t.operation==='HHMM_TO_LOCAL_MINUTE').detail='an unsupported threshold was inferred';
 assert.equal(validateCanonical(forged).valid,false);
});
test('representative validator rejects relabeling synthetic premises as measured or learned evidence',()=>{
 for(const origin of ['MEASURED','SELF_REPORTED','HISTORICAL_LEARNED_PATTERN']){
  const input=normalize(1);input.facts['/population/priority'].origin=origin;
  assert.equal(validateCanonical(input).valid,false,origin);
 }
});
test('real-person inputs and non-JSON source values cannot enter the synthetic reference path',()=>{
 const real=custom({population:{synthetic:false,realPerson:true}});assert.equal(real.adapter.blocked,true);assert.equal(validateCanonical(real).valid,false);
 assert.throws(()=>normalizeRepresentative({scenarioFacts:{population:{synthetic:true},bad:NaN}}),/Non-JSON fact/);
 assert.throws(()=>normalizeRepresentative({scenarioFacts:{population:{synthetic:true},bad:undefined}}),/Non-JSON fact/);
 assert.throws(()=>normalizeRepresentative({scenarioFacts:null}),/JSON object/);
});
test('hash uses sorted object keys while preserving sequence order',()=>{
 assert.equal(canonicalFactsHash({b:2,a:1}),canonicalFactsHash({a:1,b:2}));
 assert.notEqual(canonicalFactsHash([1,2]),canonicalFactsHash([2,1]));
});
