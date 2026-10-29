// DOMAIN_COACHING_R7-A: invariants of the semantic core, as properties and metamorphic relations over equivalence classes of state, phase,
// mode and representation. Each test names the policy clause or contract it holds the runtime to. Development authority only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {canonicalizeIntake} from '../src/r6-intake.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {skeletonOf,validateWeeks,dayPhaseOf,phaseDose,phaseMinimumRir,exposureKindOf,EXPOSURE_KINDS} from '../src/r6-program.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()},OP=opts.authority.policy.operational,E=OP.event;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=({id,weeks=12,athlete={},schedule={},...rest})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}});
let N=0;
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t7a-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
function obs(p,s,{over={},eventId=null,source=null,minutes=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const ld=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>{const set={load:ld};if(!o.noReps)set.reps=o.reps??e.reps;if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`t7a-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK},...(source?{source}:{})};
}
/** Weekly-reviewed timeline: act(p,w,s) 'EXEC' or 'MISS'; over(p,w,s) per-exercise log overrides; extra[w](p) an earlier review that week;
 * reviewed(w) false skips that week's weekly review. */
function timeline(ia,{weeks=12,act=()=>'EXEC',over=()=>({}),until=null,extra={},reviewed=()=>true}={}){
 const g=generateProgram(intake({weeks,...ia}),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);
 let p=g.program,ledger=[];const log=[];
 for(let w=0;w<(until??p.weeks.length-1);w++){
  if(extra[w]){const r=evaluateProgram(p,{...extra[w](p),actualLedger:ledger},opts);log.push(`${w}+:${r.status}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;}
  if(!reviewed(w))continue;
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&act(p,w,s)!=='MISS').map(s=>obs(p,s,{over:over(p,w,s)}));
  const r=evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);log.push(`${w}:${r.status}/${r.action}`);
  ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }
 return {P:p,log,ledger};
}
const rows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
const decisionKey=r=>JSON.stringify({status:r.status,action:r.action,gates:r.gates??null,weeks:r.proposal?r.proposal.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])):null,questions:(r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason])});
const event=(kind,goal)=>({athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',13*7+6)}},strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}});

// ---------- PHASE_MODIFIER_INTEGRITY ----------
test('R7-A phase integrity: every strength row in every reachable state stays inside its day phase dose (operational.event; principle 8; SSCTR D49, D54)',()=>{
 let checked=0,reduced=0;const kinds=new Set();
 for(const kind of ['10K','HALF_MARATHON'])for(const goal of ['STRENGTH','RUNNING_SUPPORT','GENERAL'])for(const until of [null,12,13,14,'RETURN']){
  const ia={id:`t7a-ph-${kind}-${goal}-${until}`,...event(kind,goal)};
  const extra=until==='RETURN'?{11:p=>review(p,11,{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[11].startDate,-9),endDate:addDays(p.weeks[11].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'},observations:[]})}:{};
  const t=timeline(ia,{weeks:16,extra,reviewed:w=>until!=='RETURN'||w!==11,act:(p,w,s)=>s.sport==='STRENGTH'&&Number.isInteger(until)&&w>=until-5&&w<until?'MISS':'EXEC'});
  const sk=skeletonOf(t.P,opts.authority);
  assert.deepEqual(validateWeeks(sk,t.P.weeks).filter(x=>x.includes('phaseDose')),[],ia.id);
  for(let w=0;w<t.P.weeks.length;w++)for(const {s,e} of rows(t.P,w)){
   checked++;const P=dayPhaseOf(sk,w,s.day),floor=phaseMinimumRir(OP,P);kinds.add(e.exposure.kind);
   assert.equal(e.exposure.phase,P,`${ia.id} ${s.id} ${e.id}: row phase`);
   assert.ok(e.sets<=phaseDose(OP,P,e.exposure.phaseBasis,e.rir)[0],`${ia.id} ${s.id} ${e.id}: ${e.sets} sets above the ${P} dose of ${e.exposure.phaseBasis}`);
   if(floor!==null)assert.ok(e.rir>=floor,`${ia.id} ${s.id} ${e.id}: RIR ${e.rir} below the ${P} minimum`);
   if(['RACE_WEEK','POST_EVENT'].includes(P)){reduced++;assert.equal(e.role,'MAIN',`${ia.id} ${s.id}: accessory in ${P}`);assert.ok(e.sets<=(P==='RACE_WEEK'?E.raceWeekStrengthSets:E.postEventStrengthSets));assert.ok(e.rir>=E.raceWeekStrengthMinimumRir);}
  }
 }
 assert.ok(checked>1000&&reduced>50,'the grid reaches reduced days');
 for(const k of ['REESTABLISH','RETURN_ENTRY','RETURN_STEP','KNOWN','FROM_LOG','BODYWEIGHT','FIRST_ESTABLISH'])assert.ok(kinds.has(k),'row kind reached: '+k);
});
test('R7-A phase integrity (D54 metamorphic): a re-establishment due in a taper, race-window or post-event session never exceeds the twin executed throughout',()=>{
 for(const kind of ['10K','HALF_MARATHON'])for(const goal of ['STRENGTH','RUNNING_SUPPORT'])for(const until of [12,13,14]){
  const ia={id:`t7a-d54-${kind}-${goal}-${until}`,...event(kind,goal)},twin=timeline(ia,{weeks:16}),t=timeline(ia,{weeks:16,act:(p,w,s)=>s.sport==='STRENGTH'&&w>=until-5&&w<until?'MISS':'EXEC'});
  let seen=0;
  for(const w of [until,until+1])for(const {s,e} of rows(t.P,w))if(e.exposure.kind==='REESTABLISH'){seen++;const tw=rows(twin.P,w).find(x=>x.e.id===e.id&&x.s.date===s.date);if(!tw)continue;assert.ok(e.sets<=tw.e.sets&&e.rir>=tw.e.rir,`${ia.id} w${w} ${s.date} ${e.id}: ${e.sets}x@${e.rir} against the phase dose ${tw.e.sets}x@${tw.e.rir}`);}
  assert.ok(seen>0,ia.id+': a re-establishment is reached');
 }
});
test('R7-A phase integrity (C17): the final validation rejects a strength row above its day phase dose, whatever produced it',()=>{
 const t=timeline({id:'t7a-c17',...event('10K','STRENGTH')},{weeks:16,until:12});const sk=skeletonOf(t.P,opts.authority);
 const P=structuredClone(t.P),wk=P.weeks[P.phases.raceWeek],s=wk.sessions.find(x=>x.sport==='STRENGTH'&&x.prescription);assert.ok(s,'a race-window strength session');
 assert.deepEqual(validateWeeks(sk,P.weeks).filter(x=>x.includes('phaseDose')),[]);
 s.prescription.exercises[0].sets=2;s.prescription.exercises[0].rir=3;
 assert.ok(validateWeeks(sk,P.weeks).some(x=>x.includes(`${s.id}:phaseDose:${s.prescription.exercises[0].id}`)),'a race-window row at 2 sets @RIR3 is rejected');
 // A taper row back at the count its reduction was applied to, with an allowed reserve, is caught by the relative check alone.
 const Q=structuredClone(t.P),tw=Q.weeks.flatMap(w=>w.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription&&dayPhaseOf(sk,w.index,x.day)==='TAPER')).flatMap(x=>x.prescription.exercises.map(e=>({x,e}))).find(({e})=>phaseDose(OP,'TAPER',e.exposure.phaseBasis,e.rir)[0]<e.exposure.phaseBasis);
 assert.ok(tw,'a taper row the reduction lowered');tw.e.sets=tw.e.exposure.phaseBasis;
 assert.ok(validateWeeks(sk,Q.weeks).some(x=>x.includes(`${tw.x.id}:phaseDose:${tw.e.id}:sets`)),'an unreduced taper row is rejected');
});

// ---------- STATE_COMPOSITION_STABILITY ----------
// strength.setsAfterReestablishment: "its earlier set count comes back one set per executed week, never at once" (SSCTR D53, all modes).
const regainOk=(t,label)=>{
 let traces=0;
 for(let w=0;w<t.P.weeks.length-1;w++)for(const {e} of rows(t.P,w).filter(x=>x.e.exposure.kind==='REESTABLISH')){
  const st=t.P.stateTrace[w+1]?.strength?.exercises?.[e.id];if(!st)continue;
  // A performed re-establishment always starts the regain from the count before its phase reduction, whatever the state's mode.
  if(st.lastPerformed>=t.P.weeks[w].startDate&&!Number.isInteger(st.returnStep)){traces++;assert.ok(Number.isInteger(st.regainCap)||Math.max(...rows(t.P,w+1).filter(x=>x.e.id===e.id).map(x=>x.e.exposure.baseSets),0)<=e.exposure.baseSets+1,`${label} w${w} ${e.id}: no regain after a performed re-establishment (state ${st.mode})`);
   for(const {e:n} of rows(t.P,w+1).filter(x=>x.e.id===e.id))assert.ok(n.exposure.baseSets<=e.exposure.baseSets+1,`${label} w${w+1} ${e.id}: ${n.exposure.baseSets} sets after a re-establishment of ${e.exposure.baseSets}`);}
 }
 return traces;
};
test('R7-A state composition (D53): after a performed re-establishment the count rises at most one set per week for every state mode',()=>{
 const noisy=()=>{const n={};return (p,w,s)=>{const o={};for(const e of s.prescription.exercises??[]){if(e.load.mode==='BODYWEIGHT'||e.load.mode==='KNOWN')continue;n[e.id]=(n[e.id]??0)+1;o[e.id]={load:{value:n[e.id]%2?20:40,unit:'KG',convention:e.load.convention}};}return o;};};
 const scripts={
  pendingThroughBlockEnd:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(p,w,s)=>s.sport==='STRENGTH'&&w>=5&&w<=9?'MISS':'EXEC',over:(()=>{const nl=noisy();return (p,w,s)=>w<=4?nl(p,w,s):{};})()},
  unloggedThroughGap:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(p,w,s)=>s.sport==='STRENGTH'&&w>=6&&w<=10?'MISS':'EXEC',over:(p,w,s)=>w===5?Object.fromEntries((s.prescription.exercises??[]).map(e=>[e.id,{load:null}])):{}},
  knownLoad:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},exerciseRotationPreference:'FIXED'}},act:(p,w,s)=>s.sport==='STRENGTH'&&w>=2&&w<=6?'MISS':'EXEC'},
  rotationBack:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},exerciseRotationPreference:'EVERY_6_WEEKS'}},act:()=>'EXEC'}
 };
 let total=0;
 for(const [name,s] of Object.entries(scripts)){const t=timeline({id:'t7a-d53-'+name,...s.ia},{weeks:16,act:s.act,over:s.over});total+=regainOk(t,name);}
 assert.ok(total>=4,'re-establishments were performed in the scripts');
});
test('R7-A state composition (R19): the week follows the executed exposure, not the last prescribed one',()=>{
 const ia={id:'t7a-r19',athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
 const P0=generateProgram(intake({weeks:12,...ia}),opts).program,by={};for(const {e} of rows(P0,1))(by[e.id]??=[]).push(e);
 const X=Object.entries(by).find(([,l])=>l.length>=2&&l.every(e=>e.load.mode==='KNOWN'))?.[0];assert.ok(X,'a known exercise prescribed twice a week');
 const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
 for(const both of [false,true]){
  const t=timeline(ia,{weeks:12,until:7,act:(p,w,s)=>{if(s.sport!=='STRENGTH')return 'EXEC';if(w===1)return s.id===sessX(p,1)[0]?.id?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5)return both||s.id===sessX(p,5)[0]?.id?'EXEC':'MISS';return 'EXEC';}});
  const w5=rows(t.P,5).filter(x=>x.e.id===X).map(x=>x.e);assert.equal(w5[0].exposure.kind,'KNOWN');assert.ok(w5.slice(1).some(e=>e.exposure.kind==='REESTABLISH'),'split week: a later re-establishment row');
  const st=t.P.stateTrace[6].strength.exercises[X];
  assert.equal(st.mode,'KNOWN',`${both?'both':'first only'} executed: the known load executed first keeps the state known`);
  assert.equal(st.regainCap,undefined);
  for(const {e} of rows(t.P,6).filter(x=>x.e.id===X))assert.equal(e.load.mode,'KNOWN');
  if(!both)for(const {e} of rows(t.P,6).filter(x=>x.e.id===X))assert.equal(e.sets,w5[0].sets,'the executed count stands');
 }
});
test('R7-A state composition (C11): an exercise not in use carries no weight in the return-entry decision',()=>{
 const ia={id:'t7a-c11',athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},exerciseRotationPreference:'EVERY_2_WEEKS'},schedule:{strengthDays:[0,4]}};
 let p=generateProgram(intake({weeks:16,...ia}),opts).program,ledger=[];
 const step=(w,extra={},list=null)=>{const r=evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
 const used=w=>[...new Set(rows(p,w).map(x=>x.e.id))];
 let w1=null,w2=null;for(let w=1;w<10&&w1===null;w++)if(used(w).some(id=>!used(0).includes(id)))w1=w;
 const B=used(w1).filter(id=>!used(0).includes(id));for(let w=w1+1;w<12&&w2===null;w++)if(!used(w).some(id=>B.includes(id)))w2=w;
 for(let w=0;w<=w2;w++)step(w);
 step(w2+1,{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[w2+1].startDate,-9),endDate:addDays(p.weeks[w2+1].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
 const e1=w2+2,s2=e1+1;
 // The entry week is reported with the change: once the week is complete, next week starts from its evidence (R7-A.1 C3).
 const eq=evaluateProgram(p,review(p,e1,{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[s2].startDate,to:addDays(p.weeks[s2].startDate,13)},observations:p.weeks[e1].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);
 const inactive=Object.entries(p.stateTrace[s2].strength.exercises).filter(([id,e])=>e.returnStep===0&&!used(s2).includes(id));assert.ok(inactive.length,'rotated-out exercises are still at the entry step');
 const fresh=rows(eq.proposal,s2).filter(x=>!p.stateTrace[s2].strength.exercises[x.e.id]);assert.ok(fresh.length,'a substitute appears in return step 2');
 for(const {e} of fresh)assert.notEqual(e.exposure.kind,'RETURN_ENTRY',`${e.id}: no exercise in use is at the entry step`);
});
test('R7-A state composition: the last executed count of an exercise used with two roles in a week is the later exposure (strengthReturnSets ceiling)',()=>{
 const g=generateProgram(intake({id:'t7a-roles',weeks:8,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},strengthExperience:'NOVICE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[1,3],strengthDays:[0,2,4,6],strengthMinutes:40,runMinutes:30,longRunDay:3}}),opts).program;
 let found=0;
 for(let w=1;w<g.weeks.length-1;w++){const by={};for(const {e} of rows(g,w))(by[e.id]??=[]).push(e);for(const [id,l] of Object.entries(by)){if(new Set(l.map(e=>e.sets)).size<2)continue;const st=g.stateTrace[w+1].strength.exercises[id];if(!Number.isInteger(st?.lastExecutedSets))continue;found++;assert.equal(st.lastExecutedSets,l.at(-1).sets,`w${w} ${id}`);}}
 assert.ok(found>0,'an exercise with two counts in one week');
});

// ---------- PRESCRIPTION_RECONSTRUCTION_INTEGRITY ----------
test('R7-A reconstruction: every row states its kind and counts, and a row read without them gets the same kind (stored programs keep their meaning)',()=>{
 const cases=[{id:'t7a-rc1',...event('10K','STRENGTH')},{id:'t7a-rc2',athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'NONE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthMinutes:30,longRunDay:null}}];
 for(const ia of cases){
  const t=timeline(ia,{weeks:16,act:(p,w,s)=>s.sport==='STRENGTH'&&w>=7&&w<12?'MISS':'EXEC'}),sk=skeletonOf(t.P,opts.authority);
  for(let w=0;w<t.P.weeks.length;w++)for(const {s,e} of rows(t.P,w)){
   assert.ok(EXPOSURE_KINDS.includes(e.exposure.kind),e.exposure.kind);
   assert.ok(Number.isInteger(e.exposure.baseSets)&&e.sets<=e.exposure.baseSets,`${s.id} ${e.id}: ${e.sets} sets above the stated base ${e.exposure.baseSets}`);
   // A row read without its stated kind is classified with the rules that wrote it; the only intended difference is R7-A's in-use
   // entry-week rule (a rotated-out exercise at the entry step no longer makes a return-entry week).
   const legacy=exposureKindOf(sk,t.P.stateTrace[w].strength,{id:e.id,mode:e.load.mode,date:s.date,practice:e.role==='PRACTICE'});
   if(!(e.exposure.kind==='FIRST_ESTABLISH'&&legacy==='RETURN_ENTRY')&&e.exposure.kind!=='PRACTICE')assert.equal(legacy,e.exposure.kind,`${s.id} ${e.id}: stated ${e.exposure.kind}, re-derived ${legacy}`);
  }
 }
});
test('R7-A reconstruction (C18): a race finished faster than its window is a completed race (operational.event.raceDay window)',()=>{
 const ia={id:'t7a-race',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7+6)}},strength:'MAINTAIN'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const p=generateProgram(intake({weeks:12,...ia}),opts).program,rw=p.phases.raceWeek,race=p.weeks[rw].sessions.find(s=>s.role==='RACE');
 for(const minutes of [41,52,race.prescription.durationMinutes]){const r=evaluateProgram(p,review(p,rw,{observations:[obs(p,race,{minutes})]}),opts);assert.equal(r.weekEvidence.rows.find(x=>x.sessionId===race.id).status,'COMPLETED',`${minutes} min`);}
 const dnf=evaluateProgram(p,review(p,rw,{observations:[{...obs(p,race,{minutes:30}),actual:{completed:false,minutes:30}}]}),opts);
 assert.equal(dnf.weekEvidence.rows.find(x=>x.sessionId===race.id).status,'PARTIAL','an unfinished race stays partial');
});

// ---------- CANONICAL_INPUT_SEMANTIC_STABILITY ----------
test('R7-A canonical input (C07): strength records merge independently of order and source; an incomplete record never displaces a complete dose',()=>{
 const self={id:'goblet-squat',sets:3,reps:10,load:{value:20,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'};
 const wear={provider:'GENERIC_WATCH',activityAvailable:true,exerciseIdentityAvailable:true,setsRepsLoadAvailable:true,completeness:'FULL',historyWeeks:4};
 const mk=(known,history=[])=>canonicalizeIntake(intake({id:'t7a-c07',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:known,wearableCapabilities:wear,history},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}})).canonical.athlete.knownExercises;
 const pick=list=>JSON.stringify(list.find(e=>e.id==='goblet-squat'));
 // An external record without RIR (no complete dose) next to the athlete's complete report.
 const extRow=day=>({activityId:'h'+day,sport:'STRENGTH',startedAt:day+'T18:00:00Z',durationMinutes:40,exercises:[{id:'goblet-squat',sets:3,reps:10,loadKg:22}]});
 assert.equal(JSON.parse(pick(mk([self],[extRow('2026-10-30')]))).dose.load.value,20,'the complete self-reported dose stays');
 const incomplete={...self,rir:undefined,observedAt:'2026-10-31'};
 const orders=[[self,incomplete],[incomplete,self]].map(k=>pick(mk(k)));assert.equal(orders[0],orders[1],'order independent');
 assert.equal(JSON.parse(orders[0]).dose.load.value,20);
 // Two complete records that disagree: the latest leads whatever the order, and the disagreement is disclosed.
 const later={...self,load:{value:24,unit:'KG',convention:'TOTAL'},observedAt:'2026-10-31'};
 const both=[[self,later],[later,self]].map(k=>pick(mk(k)));assert.equal(both[0],both[1]);assert.equal(JSON.parse(both[0]).dose.load.value,24);
 const u=canonicalizeIntake(intake({id:'t7a-c07u',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:[self,later]},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}})).canonical.uncertainty;
 assert.ok(u.some(x=>x.field==='knownExercises.goblet-squat'),'disagreeing complete doses are disclosed');
});
test('R7-A canonical input (C05, strength.loadUnits): a logged load in another convention than planned is unknown and asked; never relabelled',()=>{
 const g=generateProgram(intake({id:'t7a-c05',weeks:8}),opts),p=g.program,s=p.weeks[0].sessions.find(x=>x.sport==='STRENGTH'&&x.prescription?.exercises.some(e=>e.id==='db-bench-press'));
 const other={value:36,unit:'KG',convention:'TOTAL'},same={value:18,unit:'KG',convention:'PER_HAND'};
 const run=load=>evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(x=>x.prescription).map(x=>obs(p,x,{over:x.id===s.id?{'db-bench-press':{load}}:{}}))}),opts);
 const a=run(other),b=run(same);
 assert.ok(a.loadQuestions.some(q=>q.exerciseId==='db-bench-press'&&q.reason==='LOGGED_UNIT_OR_CONVENTION_UNKNOWN'),'another convention is asked about');
 const st=r=>(r.proposal??p).stateTrace[1].strength.exercises['db-bench-press'];
 assert.equal(st(a).load,18);assert.equal(st(a).convention,'PER_HAND');assert.equal(st(b).load,18);
});
test('R7-A canonical input (C06, DR-123): the same canonical observations under different source labels give the same decision',()=>{
 const p=generateProgram(intake({id:'t7a-c06',weeks:8}),opts).program;
 const list=src=>p.weeks[0].sessions.filter(s=>s.prescription).map((s,i)=>obs(p,s,{eventId:'t7a-c06-'+i,...(src?{source:{provider:src}}:{})}));
 const keys=[null,'MANUAL','APPLE_HEALTH','GARMIN','SELF_REPORT','POLAR'].map(src=>decisionKey(evaluateProgram(p,review(p,0,{observations:list(src)}),opts)));
 assert.equal(new Set(keys).size,1);
});
test('R7-A canonical input (C08): an exact replay or an agreeing second report of a session changes no decision',()=>{
 const p=generateProgram(intake({id:'t7a-c08',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[]}}),opts).program;
 const base=p.weeks[0].sessions.filter(s=>s.prescription).map((s,i)=>obs(p,s,{eventId:'t7a-c08-'+i}));
 const k0=decisionKey(evaluateProgram(p,review(p,0,{observations:base}),opts));
 assert.equal(decisionKey(evaluateProgram(p,review(p,0,{observations:[...base,...structuredClone(base)]}),opts)),k0,'exact replay');
 for(const [i,o] of base.entries())assert.equal(decisionKey(evaluateProgram(p,review(p,0,{observations:[...base,{...structuredClone(o),eventId:'t7a-c08-second-'+i,source:{provider:'APPLE_HEALTH'}}]}),opts)),k0,'second agreeing report of session '+o.sessionId);
});
test('R7-A canonical input (C09): two reports of one strength session with contradictory loads are a conflict in either order; agreeing ones merge',()=>{
 const p=generateProgram(intake({id:'t7a-c09',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[]}}),opts).program;
 const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),base=all.map((s,i)=>obs(p,s,{eventId:'t7a-c09-'+i}));
 const variant=(kg,later)=>{const o=structuredClone(base[all.indexOf(str)]);o.eventId='t7a-c09-v'+kg;o.observedAt=o.observedAt.replace(/T\d\d/,later?'T21':'T17');for(const e of o.actual.exercises)for(const s of e.sets)if(s.load?.unit==='KG')s.load={...s.load,value:kg};return o;};
 const conflicts=list=>evaluateProgram(p,review(p,0,{observations:list}),opts).provenance.conflicts.length;
 assert.equal(conflicts([...base,variant(40,true)]),1);assert.equal(conflicts([...base,variant(40,false)]),1);
 const near=OP.strength.smallestIncrement.PER_HAND;
 assert.equal(conflicts([...base,variant(20+near,true)]),0,'within one smallest increment the reports agree');
});
test('R7-A canonical input (C10): a correction survives the carried record; normalization of the carried record is idempotent',()=>{
 const asOf='2026-11-10T21:00:00Z',o1={eventId:'e1',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',actual:{completed:true,minutes:30},response:{...OK}};
 const c1={eventId:'e2',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',correctionOf:'e1',correctedAt:'2026-11-10T09:00:00Z',actual:{completed:true,minutes:45},response:{...OK}};
 const c2={eventId:'e3',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',correctionOf:'e2',correctedAt:'2026-11-12T09:00:00Z',actual:{completed:true,minutes:40},response:{...OK}};
 const n1=normalizeObservations([o1,c1],{athleteId:'a',asOf,maximumAgeDays:36500}),carry=n=>[...n.accepted,...n.supersededRows];
 const live=n=>n.accepted.filter(o=>o.sessionId==='s1').map(o=>[o.eventId,o.actual.minutes]);
 const n2=normalizeObservations([],{athleteId:'a',asOf:'2026-11-11T21:00:00Z',maximumAgeDays:36500,prior:carry(n1)});
 assert.deepEqual(live(n2),live(n1));assert.deepEqual(n2.excluded,[]);
 const n3=normalizeObservations([c2],{athleteId:'a',asOf:'2026-11-12T21:00:00Z',maximumAgeDays:36500,prior:carry(n2)});
 assert.deepEqual(live(n3),[['e3',40]],'a correction of a carried correction');
 const n4=normalizeObservations([],{athleteId:'a',asOf:'2026-11-13T21:00:00Z',maximumAgeDays:36500,prior:carry(n3)});
 assert.deepEqual(live(n4),[['e3',40]]);assert.deepEqual(n4.supersededRows.map(o=>o.eventId).sort(),['e1','e2'],'superseded facts stay as history');
 // End to end: the review's carried ledger keeps the corrected run for the next review.
 const p=generateProgram(intake({id:'t7a-c10',weeks:8}),opts).program,run=p.weeks[0].sessions.find(s=>s.sport==='RUN'&&s.prescription);
 const r0=evaluateProgram(p,review(p,0,{observations:[obs(p,run,{eventId:'t7a-c10-a',minutes:20}),{...obs(p,run,{eventId:'t7a-c10-b'}),correctionOf:'t7a-c10-a',correctedAt:addDays(p.weeks[0].startDate,6)+'T20:00:00Z'}]}),opts),P1=r0.proposal??p;
 const r1=evaluateProgram(P1,review(P1,1,{observations:[],actualLedger:r0.actualLedger}),opts),facts=r=>r.actualLedger.filter(o=>o.sessionId===run.id&&!o.superseded).map(o=>o.eventId);
 assert.deepEqual(facts(r1),['t7a-c10-b']);assert.ok(!r1.provenance.excluded.some(x=>x.reason==='INVALID_CORRECTION_CHAIN'));
});
test('R7-A canonical input (C12, gates.missingLogs): sets logged without repetitions hold the step and never regress it',()=>{
 const bw=timeline({id:'t7a-c12',athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'NOVICE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthMinutes:30,longRunDay:null}},{weeks:8,over:(p,w,s)=>Object.fromEntries((s.prescription.exercises??[]).map(e=>[e.id,{noReps:true}]))});
 const kl=timeline({id:'t7a-c12k',athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},exerciseRotationPreference:'FIXED'}},{weeks:8,over:(p,w,s)=>Object.fromEntries((s.prescription.exercises??[]).map(e=>[e.id,{noReps:true}]))});
 assert.ok(kl.log.every(x=>!/UNSUPPORTED|HOLD\//.test(x)),kl.log.join(' '));
 // Within one load mode: the accessory rep target that changes with the mode is a separate, routed finding (R7-A F-ACCESSORY-REPS).
 for(const t of [bw,kl])for(let w=1;w<t.P.weeks.length;w++)for(const {e} of rows(t.P,w)){const prev=rows(t.P,w-1).find(x=>x.e.id===e.id)?.e;if(!prev||prev.load.mode!==e.load.mode)continue;assert.ok(e.reps>=prev.reps,`w${w} ${e.id}: ${prev.reps} -> ${e.reps} reps`);if(e.load.mode==='KNOWN')assert.ok(e.load.value>=prev.load.value,`w${w} ${e.id}: load fell`);}
});
test('R7-A canonical input (C16): a change stated for dates is never applied beyond them',()=>{
 const p=generateProgram(intake({id:'t7a-c16',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'GENERAL'}},schedule:{runDays:[1,3,6],strengthDays:[1,4],runTurn:'AM',strengthTurn:'PM',temporaryPreference:'RUN'}}),opts).program;
 const day=p.weeks[1].sessions.find(s=>s.sport==='STRENGTH'&&s.day===1).date;
 for(const kind of ['DOUBLE_CONFLICT','SCHEDULE_CHANGE']){const r=evaluateProgram(p,review(p,1,{day:0,kind,changes:{strengthTurn:'AM',sameTurnConfirmed:false,from:day,to:day}}),opts);assert.equal(r.status,'ASK',kind);assert.equal(r.proposal,null,kind);}
 const from=p.weeks[3].startDate,r=evaluateProgram(p,review(p,1,{day:0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,4],from}}),opts);
 assert.equal(r.action,'REARRANGE_FUTURE_WEEKS');
 for(const w of [1,2])assert.deepEqual(r.proposal.weeks[w].sessions.map(s=>[s.id,s.prescription]),p.weeks[w].sessions.map(s=>[s.id,s.prescription]),`week ${w} keeps its days before ${from}`);
 assert.ok(r.proposal.weeks[3].sessions.some(s=>s.sport==='STRENGTH'&&s.day===0),'the new day from the stated date');
 assert.equal(evaluateProgram(p,review(p,1,{day:0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,4],from:'2026-11-20',to:'2026-11-10'}}),opts).status,'ASK','an end before the start is asked');
});
