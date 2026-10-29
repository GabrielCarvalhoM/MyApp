import test from 'node:test';
import assert from 'node:assert/strict';
import {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement} from '../src/r5-learning.mjs';
import {hash,clone} from '../src/value.mjs';

const asOf='2026-10-25T12:00:00Z';
const context={family:'EASY',modality:'RUN',phase:'BUILD',doseKey:'EASY_30',arrangement:'SPLIT'};
const model=()=>createLearningModel({athleteId:'SYNTHETIC_A',purposeAllowed:true,asOf});
function observation(n,overrides={}) {
 return {...{eventId:`EV_${n}`,athleteId:'SYNTHETIC_A',sessionId:`S_${n}`,
  observedAt:`2026-10-${String(1+n*7).padStart(2,'0')}T10:00:00Z`,origin:'ACTUAL_EXECUTION',
  sourceHash:hash({syntheticEvent:n}),plannedPrescriptionHash:hash({syntheticPlan:'EASY_30'}),
  actual:{completed:true,minutes:30},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'},
  context:clone(context),comparable:true,confounded:false},...overrides};
}
const recurring=()=>[0,1,2,3].map(n=>observation(n));
const learn=(observations,base=model(),options={})=>updateLearningModel(base,observations,{asOf,purposeAllowed:true,...options});

test('cold-start model retains population prior, validates and is immutable',()=>{
 const m=model();
 assert.equal(validateLearningModel(m),true);
 assert.equal(Object.isFrozen(m),true);
 assert.equal(Object.isFrozen(m.observations),true);
 const e=evidenceFor(m,context,{asOf});
 assert.equal(e.confidence,'PRIOR');assert.equal(e.direction,'UNKNOWN');assert.equal(e.causal,false);
 assert.equal(e.populationPriorRetained,true);assert.equal(m.automaticDoseAuthority,false);
});
test('actual comparable repeated response becomes contextual ranking evidence without mutating inputs',()=>{
 const initial=model(),events=recurring(),before=clone(events),m=learn(events,initial);
 assert.equal(m.observations.length,4);assert.deepEqual(events,before);assert.equal(initial.observations.length,0);
 const e=evidenceFor(m,context,{asOf});
 assert.equal(e.direction,'COMPATIBLE');assert.equal(e.confidence,'STRONG');assert.equal(e.count,4);
 assert.deepEqual(e.sourceEventIds,events.map(x=>x.eventId));assert.equal(e.causal,false);
 assert.equal(e.automaticDoseAuthority,false);
});
test('one event and same-day repetitions never become strong learned preference',()=>{
 assert.equal(evidenceFor(learn([observation(0)]),context,{asOf}).confidence,'PRIOR');
 const events=recurring().map(o=>({...o,observedAt:'2026-10-22T10:00:00Z'}));
 assert.notEqual(evidenceFor(learn(events),context,{asOf}).confidence,'STRONG');
 assert.equal(preferredArrangement(learn(events),[{id:'SPLIT',admissible:true},{id:'DOUBLE',admissible:true}],context,{asOf}).preferredId,null);
});
test('consent is explicit and revocation removes individual ranking influence',()=>{
 const unconsented=createLearningModel({athleteId:'SYNTHETIC_A',purposeAllowed:false,asOf});
 assert.equal(validateLearningModel(unconsented),true);
 const blocked=learn(recurring(),unconsented,{purposeAllowed:false});
 assert.equal(blocked.observations.length,0);assert.ok(blocked.excluded.every(x=>x.reason==='PURPOSE_NOT_ALLOWED'));
 assert.equal(evidenceFor(blocked,context,{asOf}).confidence,'PRIOR');
 const revoked=learn([],learn(recurring()),{purposeAllowed:false});
 assert.equal(evidenceFor(revoked,context,{asOf}).direction,'UNKNOWN');
});
test('wrong owner, prediction, future, stale, confounded and unestablished comparability are excluded',()=>{
 const overrides=[{athleteId:'OTHER'},{origin:'PREDICTED'},{observedAt:'2026-10-26T10:00:00Z'},
  {observedAt:'2026-01-01T10:00:00Z'},{confounded:true},{comparable:false}];
 const m=learn(overrides.map((o,n)=>observation(0,{...o,eventId:`BAD_${n}`,sourceHash:hash({bad:n})})));
 assert.equal(m.observations.length,0);assert.equal(m.excluded.length,6);
 for(const reason of ['ATHLETE_MISMATCH','ACTUAL_SOURCE_PROVENANCE_REQUIRED','FUTURE_OBSERVATION','STALE_OBSERVATION','CONFOUNDED','COMPARABILITY_UNESTABLISHED'])
  assert.ok(m.excluded.some(x=>x.reason===reason),reason);
});
test('incomplete actuals, invalid response enum, absent planned provenance and invalid times fail closed',()=>{
 const overrides=[{actual:{completed:true}},{actual:{completed:'true',minutes:30}},
  {actual:{completed:true,minutes:-1}},{actual:{completed:true,minutes:Infinity}},
  {response:{performance:'GREAT',recovery:'COMPATIBLE',effort:'ON_TARGET'}},
  {plannedPrescriptionHash:'missing'},{observedAt:'2026-10-30T10:00:00'},
  {actual:{completed:false,minutes:0}}];
 const m=learn(overrides.map((o,n)=>observation(0,{...o,eventId:`INVALID_${n}`,sourceHash:hash(n)})));
 assert.equal(m.observations.length,0);assert.equal(m.excluded.length,overrides.length);
});
test('duplicate IDs and replay are idempotent; changed payload and reused source never double count',()=>{
 const events=recurring(),m=learn([...events,events[0]]);
 assert.equal(m.observations.length,4);
 assert.equal(learn(events,m).hash,m.hash);
 const conflict=learn([{...events[0],actual:{completed:true,minutes:99}}, {...events[0],eventId:'RENAMED'}],m);
 assert.equal(conflict.observations.length,4);
 assert.ok(conflict.excluded.some(x=>x.reason==='EVENT_ID_CONFLICT'));
 assert.ok(conflict.excluded.some(x=>x.reason==='SOURCE_REUSED'));
 assert.equal(learn([{...events[0],actual:{completed:true,minutes:99}}],conflict).hash,conflict.hash);
});
test('hash integrity covers observations, owner, consent and flags; tampering cannot influence ranking',()=>{
 const m=learn(recurring());
 for(const mutate of [x=>{x.athleteId='OTHER';},x=>{x.observations[0].actual.minutes=999;},
  x=>{x.automaticDoseAuthority=true;},x=>{x.purposeAllowed=false;}]) {
  const changed=clone(m);mutate(changed);
  assert.equal(validateLearningModel(changed),false);
  assert.equal(evidenceFor(changed,context,{asOf}).confidence,'PRIOR');
  assert.throws(()=>learn([],changed),TypeError);
 }
});
test('learning does not cross phase, dose, family, modality or equipment boundaries',()=>{
 const m=learn(recurring());
 for(const changed of [{phase:'RACE_WEEK'},{doseKey:'EASY_60'},{family:'LONG'},{modality:'STRENGTH'},{equipment:'TREADMILL'}]) {
  const e=evidenceFor(m,{...context,...changed},{asOf});assert.equal(e.count,0);assert.equal(e.confidence,'PRIOR');
 }
});
test('unknown outcomes preserve uncertainty and mixed comparable response weakens strong evidence',()=>{
 const unknown=recurring().map(o=>({...o,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'}}));
 assert.equal(evidenceFor(learn(unknown),context,{asOf}).direction,'UNKNOWN');
 const mixed=learn([...recurring(),observation(0,{eventId:'ADVERSE',sessionId:'S_BAD',sourceHash:hash('bad'),
  observedAt:'2026-10-24T10:00:00Z',response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'}})]);
 const e=evidenceFor(mixed,context,{asOf});assert.equal(e.direction,'MIXED');assert.notEqual(e.confidence,'STRONG');
 assert.equal(preferredArrangement(mixed,[{id:'SPLIT',admissible:true},{id:'DOUBLE',admissible:true}],context,{asOf}).preferredId,null);
});
test('strong association may select only an already admissible option',()=>{
 const m=learn(recurring());
 const options=[{id:'SPLIT',admissible:true},{id:'DOUBLE',admissible:true}];
 assert.equal(preferredArrangement(m,options,context,{asOf}).preferredId,'SPLIT');
 assert.equal(preferredArrangement(m,[{id:'SPLIT',admissible:false},{id:'DOUBLE',admissible:true}],context,{asOf}).preferredId,null);
 assert.equal(preferredArrangement(m,[{id:'SPLIT'},{id:'DOUBLE',admissible:true}],context,{asOf}).preferredId,null);
});
test('repeated adverse arrangement may prefer an existing compatible alternative without causal claims',()=>{
 const events=recurring().map(o=>({...o,context:{...context,arrangement:'DOUBLE'},response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'}}));
 const m=learn(events),e=evidenceFor(m,{...context,arrangement:'DOUBLE'},{asOf});
 assert.equal(e.direction,'ADVERSE');assert.equal(e.confidence,'STRONG');
 const choice=preferredArrangement(m,[{id:'DOUBLE',admissible:true},{id:'SPLIT',admissible:true}],context,{asOf});
 assert.equal(choice.preferredId,'SPLIT');assert.equal(choice.causal,false);
});
test('evidence expires and explicit clock prevents future-model or backwards replay use',()=>{
 const m=learn(recurring());
 assert.equal(evidenceFor(m,context,{asOf:'2027-01-25T12:00:00Z'}).confidence,'PRIOR');
 assert.equal(evidenceFor(m,context,{asOf:'2026-09-25T12:00:00Z'}).confidence,'PRIOR');
 assert.throws(()=>learn([],m,{asOf:'2026-09-25T12:00:00Z'}),TypeError);
 assert.throws(()=>createLearningModel({athleteId:'A',purposeAllowed:true}),TypeError);
});
test('multiple reports for one session cannot manufacture longitudinal confidence',()=>{
 const events=recurring().map(o=>({...o,sessionId:'SAME_SESSION'}));
 assert.notEqual(evidenceFor(learn(events),context,{asOf}).confidence,'STRONG');
});
test('unknown recovery and effort cannot become strong evidence even when performance was under target',()=>{
 const events=recurring().map(o=>({...o,response:{performance:'UNDER',recovery:'UNKNOWN',effort:'UNKNOWN'}}));
 const m=learn(events),e=evidenceFor(m,context,{asOf});
 assert.notEqual(e.confidence,'STRONG');
 assert.equal(preferredArrangement(m,[{id:'SPLIT',admissible:true},{id:'DOUBLE',admissible:true}],context,{asOf}).preferredId,null);
});
test('incomplete context and uncertain confounding are excluded rather than granted comparability',()=>{
 const events=[observation(0,{context:{family:'EASY'}}),observation(1,{confounded:undefined})];
 const m=learn(events);assert.equal(m.observations.length,0);
 assert.ok(m.excluded.some(x=>x.reason==='COMPARABLE_CONTEXT_REQUIRED'));
 assert.ok(m.excluded.some(x=>x.reason==='CONFOUNDING_UNASSESSED'));
});
