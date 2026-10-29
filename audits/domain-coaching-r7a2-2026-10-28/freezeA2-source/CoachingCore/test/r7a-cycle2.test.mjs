// DOMAIN_COACHING_R7-A, second cycle: the engineering review's blockers (QE-R7A-01..12), its LOW findings 13-17 and SSCTR D55, each
// as a property or a metamorphic relation over the class it belongs to, not as the reviewer's single case. Development authority only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {canonicalizeIntake} from '../src/r6-intake.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {skeletonOf,validateWeeks,dayPhaseOf} from '../src/r6-program.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()},OP=opts.authority.policy.operational;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=({id,weeks=12,athlete={},schedule={},...rest})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}});
let N=0;
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',hour='21',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`t7a2-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
/** An as-prescribed report; over[id] = {load (null: none), reps, rir, sets (count)}; only = the exercises the report lists. */
function obs(p,s,{over={},eventId=null,source=null,observedAt=null,only=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.filter(e=>!only||only.includes(e.id)).map(e=>{const o=over[e.id]??{};const ld=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:o.sets??e.sets},()=>{const set={};if(ld!==null)set.load=ld;set.reps=o.reps??e.reps;set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`t7a2-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:observedAt??s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK},...(source?{source}:{})};
}
/** A weekly-reviewed program: step(w, review fields, observations) reviews week w (as prescribed when no list is given). */
function reviewed(ia,weeks=12){
 const g=generateProgram(intake({weeks,...ia}),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);
 const t={p:g.program,ledger:[],log:[]};
 t.step=(w,extra={},list=null)=>{const r=evaluateProgram(t.p,review(t.p,w,{observations:list??t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(t.p,s)),actualLedger:t.ledger,...extra}),opts);t.log.push(`${w}:${r.status}/${r.action}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
 return t;
}
const rows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
const decisionKey=r=>JSON.stringify({status:r.status,action:r.action,gates:r.gates??null,weeks:r.proposal?r.proposal.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])):null,questions:(r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason])});
const travel=(p,w,day)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[w].startDate,day-16),endDate:addDays(p.weeks[w].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'}});
const stepsOf=st=>Object.fromEntries(Object.entries(st.strength.exercises).map(([id,e])=>[id,e.returnStep??null]));

// ---------- STATE_COMPOSITION_STABILITY ----------
test('R7-A cycle 2: reviews of one week compose in either order: a return that starts next week survives a weekly review and a schedule change of that week (QE-R7A-01; INV-04)',()=>{
 const t=reviewed({id:'t7a2-order',athlete:{exerciseRotationPreference:'FIXED'}});
 for(let w=0;w<4;w++)t.step(w);t.step(4,{},[]);
 const W=5,p0=t.p,ledger=t.ledger,at=hh=>addDays(p0.weeks[W].startDate,6)+`T${hh}:00:00Z`;
 const ret=p=>review(p,W,{...travel(p,W,6),observations:[],actualLedger:ledger}),weekly=p=>review(p,W,{observations:[],actualLedger:ledger});
 const next=P=>({mode:P.stateTrace[W+1].run.mode,steps:stepsOf(P.stateTrace[W+1]),rows:rows(P,W+1).map(({s,e})=>[s.id,e.id,e.sets,e.reps,e.rir,e.exposure.kind])});
 const r1=evaluateProgram(p0,{...ret(p0),asOf:at('20')},opts);assert.equal(r1.action,'REESTABLISH');assert.equal(r1.proposal.decisions.at(-1).fromWeek,W+1);
 const first=next(evaluateProgram(r1.proposal,weekly(r1.proposal),opts).proposal??r1.proposal);
 const r2=evaluateProgram(p0,{...weekly(p0),asOf:at('20')},opts),P2=r2.proposal??p0,second=next(evaluateProgram(P2,ret(P2),opts).proposal);
 assert.deepEqual(first,second);
 assert.equal(first.mode,'RETURN');assert.ok(Object.values(first.steps).every(x=>x===0),JSON.stringify(first.steps));
 assert.ok(first.rows.every(x=>x[5]==='RETURN_ENTRY'),JSON.stringify(first.rows));
 const c=evaluateProgram(r1.proposal,review(r1.proposal,W,{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:55},actualLedger:ledger}),opts),P4=c.proposal??r1.proposal;
 assert.equal(P4.stateTrace[W+1].run.mode,'RETURN');assert.ok(rows(P4,W+1).every(({e})=>e.exposure.kind==='RETURN_ENTRY'));
});

test('R7-A cycle 2: a return reported on the morning of a session re-doses that unreported session; one already reported keeps its dose (QE-R7A-02; return policy; INV-04)',()=>{
 const setup=()=>{const t=reviewed({id:'t7a2-sameday',athlete:{exerciseRotationPreference:'FIXED'}});for(let w=0;w<4;w++)t.step(w);t.step(4,{},[]);return t;};
 const W=5;
 // Morning: the day-0 evening session is still ahead and takes the return entry, like every later session of the week.
 const a=setup(),s0=a.p.weeks[W].sessions.find(s=>s.day===0&&s.sport==='STRENGTH');
 const ra=a.step(W,{day:0,hour:'07',...travel(a.p,W,0)},[]);assert.equal(ra.action,'REESTABLISH');
 assert.equal(a.p.decisions.at(-1).fromWeek,W);
 assert.ok(rows(a.p,W).every(({e})=>e.exposure.kind==='RETURN_ENTRY'),JSON.stringify(rows(a.p,W).map(({s,e})=>[s.id,e.id,e.exposure.kind])));
 a.step(W);assert.ok(Object.values(stepsOf(a.p.stateTrace[W+1])).every(x=>x===1));
 // Evening, the session already done and reported in the same review: it stays as prescribed; only the later sessions change.
 const b=setup(),before=JSON.stringify(b.p.weeks[W].sessions.find(s=>s.id===s0.id).prescription);
 const rb=b.step(W,{day:0,hour:'21',...travel(b.p,W,0)},[obs(b.p,s0)]);assert.equal(rb.status,'MODIFY',rb.reason);
 assert.equal(JSON.stringify(b.p.weeks[W].sessions.find(s=>s.id===s0.id).prescription),before);
 assert.ok(rows(b.p,W).filter(({s})=>s.day>0).every(({e})=>e.exposure.kind==='RETURN_ENTRY'));
});

test('R7-A cycle 2: an event date that reaches this week re-plans its remaining days under the new phases, later same-week proposals validate, and a postponed race leaves no old race (QE-R7A-03, QE-R7A-04; operational.event; INV-02)',()=>{
 for(const kind of ['10K','HALF_MARATHON']){
  const ia={id:'t7a2-date-'+kind,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
  const t=reviewed(ia,16);for(let w=0;w<6;w++)t.step(w);
  const W=6,newRace=addDays(t.p.weeks[W].startDate,7),r=evaluateProgram(t.p,review(t.p,W,{day:0,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},actualLedger:t.ledger}),opts);
  assert.equal(r.status,'MODIFY',`${kind}: ${r.reason}`);const P=r.proposal,sk=skeletonOf(P,opts.authority),Q=P.weeks[W],day0=Q.startDate;
  assert.deepEqual(validateWeeks(sk,[Q]).filter(x=>x.includes('phaseDose')),[],kind);
  for(const {s,e} of rows(P,W).filter(x=>x.s.date>day0))assert.equal(e.exposure.phase,dayPhaseOf(sk,W,s.day),`${kind} ${s.id} ${e.id}`);
  const twin=generateProgram(intake({weeks:16,...ia,athlete:{...ia.athlete,goals:{...ia.athlete.goals,run:{kind:'RACE',event:{kind,date:newRace}}}}}),opts).program;
  const roles=wk=>wk.sessions.filter(s=>s.date>day0&&s.sport==='RUN'&&s.prescription).map(s=>[s.day,s.role]);
  assert.deepEqual(roles(Q),roles(twin.weeks[W]),kind);
  const later=k=>evaluateProgram(P,{...review(P,W,{day:0,kind:k,...(k==='UNAVAILABLE_DAY'?{changes:{unavailableDates:[Q.sessions.find(s=>s.sport==='RUN'&&s.day===1&&s.prescription).date]}}:{}),actualLedger:r.actualLedger}),asOf:day0+'T22:00:00Z'},opts);
  for(const k of ['UNAVAILABLE_DAY','SYSTEMIC_FATIGUE']){const x=later(k);assert.notEqual(x.status,'UNSUPPORTED',`${kind} ${k}: ${(x.errors??[]).slice(0,3)}`);}
 }
 const ia={id:'t7a2-postpone',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
 const t=reviewed(ia,16),W=t.p.phases.raceWeek;for(let w=0;w<W;w++)t.step(w);
 const newDate=addDays(t.p.goal.run.event.date,7),r=evaluateProgram(t.p,review(t.p,W,{day:0,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newDate},actualLedger:t.ledger}),opts);
 assert.deepEqual(r.proposal.weeks.flatMap(w=>w.sessions.filter(s=>s.role==='RACE').map(s=>s.date)),[newDate]);
});

test('R7-A cycle 2: a session moved to another date is never prescribed a dose that date does not allow (QE-R7A-10; SSCTR D52; principle 8)',()=>{
 let moves=0;
 for(const lastWeekDone of [2,1]){
  const t=reviewed({id:'t7a2-move-'+lastWeekDone,athlete:{exerciseRotationPreference:'FIXED'},schedule:{runDays:[5,6],strengthDays:[0,2,4],longRunDay:6,runMinutes:50,strengthMinutes:60}});
  const W=5;for(let w=0;w<W;w++)t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&(s.sport==='RUN'||w<=lastWeekDone)).map(s=>obs(t.p,s)));
  const st=t.p.stateTrace[W].strength.exercises,target=t.p.weeks[W].sessions.find(s=>s.sport==='STRENGTH'&&s.day===0&&s.prescription);
  const r=evaluateProgram(t.p,review(t.p,W,{day:0,kind:'MISSED_SESSION',targetSessionId:target.id,observations:[],actualLedger:t.ledger}),opts);
  for(const s of (r.proposal??t.p).weeks[W].sessions.filter(x=>x.moved?.from===target.id)){moves++;
   for(const e of s.prescription.exercises){const gap=st[e.id]?.lastPerformed?(Date.parse(s.date)-Date.parse(st[e.id].lastPerformed))/864e5:0;
    if(gap>OP.return.moderateMaxDays)assert.ok(!['KNOWN','FROM_LOG'].includes(e.exposure?.kind),`${s.id} ${e.id}: ${e.exposure?.kind} ${gap} days after its last exposure`);}}
 }
 assert.ok(moves>=1,'the control case must move the session');
});

test('R7-A cycle 2: a dated change with dates the plan cannot use is asked, never applied (QE-R7A-11; INV-11)',()=>{
 const p=generateProgram(intake({id:'t7a2-dates',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,W=2,from=p.weeks[3].startDate;
 const eq=(f,to)=>evaluateProgram(p,review(p,W,{day:0,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:f,to}}),opts);
 for(const [f,to] of [[from,'soon'],[from,'2026-13-45'],[from,'2026-11-01'],['next week',addDays(from,6)]]){const r=eq(f,to);assert.equal(r.status,'ASK',`${f}..${to}: ${r.status}`);assert.equal(r.proposal??null,null);}
 const ok=eq(from,addDays(from,6));assert.equal(ok.action,'SUBSTITUTE');
 const barbell=w=>rows(ok.proposal,w).some(x=>x.e.equipment.includes('BARBELL'));
 assert.equal(barbell(3),false);assert.ok([4,5,6].every(barbell));
});

test('R7-A cycle 2: HOLD and REGRESS repeat the planned repetitions; a short set never becomes the target (QE-R7A-12; strength gates)',()=>{
 const p=generateProgram(intake({id:'t7a2-hold',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
 const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),sq=str.prescription.exercises.find(e=>e.id==='back-squat');
 for(const shortfall of [[5,3,5],[3,3,3],[4,4,2]]){
  const list=all.map(s=>{const o=obs(p,s);if(s===str)o.actual.exercises=o.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:shortfall.map(reps=>({load:{value:sq.load.value,unit:'KG',convention:'TOTAL'},reps,rir:sq.rir}))}:e);return o;});
  const r=evaluateProgram(p,review(p,0,{observations:list}),opts),P=r.proposal??p;
  assert.ok(['HOLD','REGRESS'].includes(r.gates['back-squat']),`${shortfall}: ${r.gates['back-squat']}`);
  assert.equal(P.stateTrace[1].strength.exercises['back-squat'].reps,sq.reps,`${shortfall}`);
  assert.ok(rows(P,1).filter(x=>x.e.id==='back-squat').every(x=>x.e.reps===sq.reps),`${shortfall}`);
 }
 // A load re-established by effort is adopted with the repetitions it was established for, not the target from before the break.
 const t=reviewed({id:'t7a2-hold-re',athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}});
 const X='db-bench-press',sessX=w=>t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
 for(let w=0;w<6;w++){const sx=sessX(w);t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&(s.sport!=='STRENGTH'||w===0||w===1&&s.id===sx[0]?.id||w===5&&s.id===sx[1]?.id)).map(s=>obs(t.p,s)));}
 const re=rows(t.p,5).find(x=>x.e.id===X&&x.s.id===sessX(5)[1].id).e;assert.equal(re.exposure.kind,'REESTABLISH');
 assert.equal(t.p.stateTrace[6].strength.exercises[X].reps,re.reps);
 assert.ok(rows(t.p,6).filter(x=>x.e.id===X).every(x=>x.e.reps===re.reps),JSON.stringify(rows(t.p,6).filter(x=>x.e.id===X).map(x=>x.e.reps)));
});

test('R7-A cycle 2: an event change in the middle of a week validates with its executed sessions as they were done (QE-R7A-04; INV-02, INV-10)',()=>{
 const ia={id:'t7a2-midweek',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{strengthDays:[0,4],runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
 let checked=0;
 for(const [day,ahead] of [[1,8],[2,8],[1,10]]){
  const t=reviewed({...ia,id:`${ia.id}-${day}-${ahead}`},16);for(let w=0;w<5;w++)t.step(w);
  const W=5,done=t.p.weeks[W].sessions.filter(s=>s.prescription&&s.day<day),before=Object.fromEntries(done.map(s=>[s.id,JSON.stringify(s.prescription)]));
  assert.ok(done.some(s=>s.sport==='STRENGTH'));
  const r=evaluateProgram(t.p,review(t.p,W,{day,kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(t.p.weeks[W].startDate,day+ahead)},observations:done.map(s=>obs(t.p,s)),actualLedger:t.ledger}),opts);
  assert.equal(r.status,'MODIFY',`d${day} +${ahead}: ${r.status} ${(r.errors??[]).slice(0,3)}`);assert.equal(r.proposal.decisions.at(-1).fromWeek,W);
  for(const s of done)assert.equal(JSON.stringify(r.proposal.weeks[W].sessions.find(x=>x.id===s.id).prescription),before[s.id],s.id);
  // The executed strength session exceeds the new day phase: only its being history lets the proposal stand.
  const sk=skeletonOf(r.proposal,opts.authority);if(validateWeeks(sk,[r.proposal.weeks[W]]).some(x=>x.includes('phaseDose')))checked++;
  assert.deepEqual(validateWeeks(sk,[r.proposal.weeks[W]],{history:new Set(done.map(s=>s.id))}).filter(x=>x.includes('phaseDose')),[]);
 }
 assert.ok(checked>0,'no case where the executed session exceeds the new phases');
});

test('R7-A cycle 2: a return-entry week stays one when its remaining days are rebuilt, whatever the time budget (QE-R7A-15; SSCTR D49, D55)',()=>{
 const kinds={};
 for(const strengthMinutes of [30,60]){
  const t=reviewed({id:'t7a2-entry-'+strengthMinutes,athlete:{exerciseRotationPreference:'FIXED',goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},schedule:{strengthMinutes}});
  for(let w=0;w<3;w++)t.step(w);t.step(3,{},[]);t.step(4,{},[]);
  const W=5;t.step(W,{day:0,hour:'05',...travel(t.p,W,0)},[]);t.step(W,{day:0,hour:'06',kind:'EQUIPMENT_CHANGE',changes:{equipment:['MACHINES']}},[]);
  const fresh=rows(t.p,W).filter(({s,e})=>s.day>0&&!t.p.stateTrace[W].strength.exercises[e.id]);assert.ok(fresh.length,`${strengthMinutes}: no new exercise`);
  for(const {s,e} of fresh)assert.equal(e.exposure.kind,'RETURN_ENTRY',`${strengthMinutes} ${s.id} ${e.id}`);
  t.step(W);const ids=new Set(fresh.map(x=>x.e.id));
  kinds[strengthMinutes]=rows(t.p,W+1).filter(x=>ids.has(x.e.id)).map(x=>[x.e.id,x.e.exposure.kind,x.e.sets]);
  for(const [id,kind] of kinds[strengthMinutes])assert.equal(kind,'RETURN_STEP',`${strengthMinutes} ${id}`);
 }
});

test('R7-A cycle 2: an exercise first set up during a return regains at most one set per executed week and earns no block set (SSCTR D55; D49; INV-03)',()=>{
 let checked=0;
 for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const goal of ['HYPERTROPHY','STRENGTH','RUNNING_SUPPORT']){
  const t=reviewed({id:`t7a2-d55-${pref}-${goal}`,athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref},schedule:{strengthDays:[0,4]}},16);
  const used=w=>[...new Set(rows(t.p,w).map(x=>x.e.id))];
  let w2=4;if(pref!=='FIXED'){let w1=null;w2=null;for(let w=1;w<t.p.weeks.length-6&&w1===null;w++)if(used(w).some(id=>!used(0).includes(id)))w1=w;const B=w1===null?[]:used(w1).filter(id=>!used(0).includes(id));for(let w=(w1??0)+1;w<t.p.weeks.length-5&&w2===null;w++)if(!used(w).some(id=>B.includes(id)))w2=w;}
  assert.ok(Number.isInteger(w2),`${pref} ${goal}: no rotation turn`);
  for(let w=0;w<=w2;w++)t.step(w);
  t.step(w2+1,{...travel(t.p,w2+1,7),day:6},[]);
  const e1=w2+2,s2=e1+1;t.step(e1);
  const eq=evaluateProgram(t.p,review(t.p,e1,{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[s2].startDate,to:addDays(t.p.weeks[s2].startDate,13)},actualLedger:t.ledger}),opts);if(eq.proposal)t.p=eq.proposal;
  const fresh=[...new Set(rows(t.p,s2).filter(x=>!t.p.stateTrace[s2].strength.exercises[x.e.id]).map(x=>x.e.id))];assert.ok(fresh.length,`${pref} ${goal}: no substitute`);
  for(const w of [s2,s2+1,s2+2])t.step(w);
  for(const id of fresh){
   const most=w=>Math.max(0,...rows(t.p,w).filter(x=>x.e.id===id).map(x=>x.e.sets));
   assert.equal(t.p.stateTrace[s2+1].strength.exercises[id].blocksDone??0,0,`${pref} ${goal} ${id}: block set`);
   if(most(s2)&&most(s2+1)){checked++;assert.ok(most(s2+1)<=most(s2)+1,`${pref} ${goal} ${id}: ${most(s2)} -> ${most(s2+1)} sets`);}
  }
 }
 assert.ok(checked>=6,`only ${checked} substitute transitions checked`);
});

test('R7-A cycle 2: only a time-budget fit is not a reduction; a fatigue reduction after a re-establishment keeps the regain cap (QE-R7A-14; SSCTR D53 Q1, item 7; INV-03)',()=>{
 // The return ceiling is the largest whole count the week executed outside a phase reduction, each exposure counted after its time fit
 // (D49, SSCTR R20), whether the review changed the plan or kept its projection.
 const t=reviewed({id:'t7a2-fit',athlete:{exerciseRotationPreference:'FIXED'},schedule:{strengthMinutes:30}},12);let fitted=0;const outcomes=new Set();
 for(let w=0;w<8;w++){
  outcomes.add(t.step(w).proposal?'CHANGED':'KEPT');
  const byId=new Map();for(const {e} of rows(t.p,w))if(e.exposure)byId.set(e.id,[...(byId.get(e.id)??[]),e]);
  for(const [id,list] of byId){
   const whole=list.filter(e=>e.exposure.phasedSets===e.exposure.baseSets);if(!whole.length||Number.isInteger(t.p.stateTrace[w].strength.exercises[id]?.returnStep))continue;
   if(whole.some(e=>e.sets<e.exposure.phasedSets))fitted++;
   assert.equal(t.p.stateTrace[w+1].strength.exercises[id].lastExecutedSets,Math.max(...whole.map(e=>Math.min(e.exposure.phasedSets,e.sets))),`w${w} ${id}`);
  }
 }
 assert.ok(fitted>0,'no week with a fitted row');assert.equal(outcomes.size,2,'both review outcomes must occur');
 // A fatigue-reduced week is a reduced week: the regain cap set by the re-establishment is not released by it.
 const caps={};
 for(const fatigue of [false,true]){
  const f=reviewed({id:'t7a2-fr-'+fatigue,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,RDL,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}});
  for(let w=0;w<10;w++){
   if(fatigue&&w===6){const r=evaluateProgram(f.p,{...review(f.p,6,{day:1,kind:'SYSTEMIC_FATIGUE',actualLedger:f.ledger}),signals:{region:'ALL'},observations:f.p.weeks[6].sessions.filter(s=>s.prescription&&s.day<=1).map(s=>obs(f.p,s))},opts);assert.equal(r.action,'REDUCE');f.ledger=r.actualLedger??f.ledger;f.p=r.proposal;}
   f.step(w,{},f.p.weeks[w].sessions.filter(s=>s.prescription&&!(s.sport==='STRENGTH'&&w>=1&&w<=4)).map(s=>obs(f.p,s)));
  }
  caps[fatigue]=[6,7].map(w=>f.p.stateTrace[w].strength.exercises['barbell-rdl'].regainCap??null);
  if(fatigue){assert.ok(caps[fatigue].every(Number.isInteger),JSON.stringify(caps));assert.ok(rows(f.p,8).filter(x=>x.e.id==='barbell-rdl').every(x=>x.e.sets<=caps[fatigue][1]));}
 }
 assert.notDeepEqual(caps[true],caps[false]);
});

// ---------- CANONICAL_INPUT_SEMANTIC_STABILITY ----------
test('R7-A cycle 2: an agreeing second report of a strength session changes nothing, whatever it lists, omits or is labelled (QE-R7A-05; INV-07, INV-08)',()=>{
 const p=generateProgram(intake({id:'t7a2-merge',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
 const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),base=all.map((s,i)=>obs(p,s,{eventId:'t7a2-m-'+i}));
 const ev=list=>evaluateProgram(p,review(p,0,{observations:list}),opts),key0=decisionKey(ev(base));
 const variants={subset:{only:[str.prescription.exercises[0].id]},noLoads:{over:Object.fromEntries(str.prescription.exercises.map(e=>[e.id,{load:null}]))}};
 for(const provider of ['GENERIC_WATCH','WEARABLE_BAND','APPLE_HEALTH','PHONE_APP'])for(const [name,v] of Object.entries(variants)){
  const second={...obs(p,str,{...v,observedAt:str.date+'T19:30:00Z'}),eventId:`t7a2-m-${provider}-${name}`,source:{provider,activityId:`act-${provider}-${name}`,quality:'WEARABLE_FULL'}};
  const r=ev([...base,second]);
  assert.equal(r.provenance.conflicts.length,0,`${provider} ${name}`);assert.equal(decisionKey(r),key0,`${provider} ${name}`);
 }
});

test('R7-A cycle 2: two reports of one session that disagree on repetitions, reserve or load are a conflict in any order and units (QE-R7A-06, QE-R7A-07; INV-08, INV-09)',()=>{
 const p=generateProgram(intake({id:'t7a2-conflict',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
 const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),base=all.filter(s=>s!==str).map(s=>obs(p,s));
 const report=(id,hh,over)=>({...obs(p,str,{over:{'back-squat':over},observedAt:str.date+`T${hh}:00:00Z`}),eventId:id,source:{provider:'PHONE_APP'}});
 const ev=list=>evaluateProgram(p,review(p,0,{observations:list}),opts);
 for(const [a,b] of [[{reps:3},{reps:5}],[{rir:0},{rir:3}],[{load:{value:100,unit:'LB',convention:'TOTAL'}},{}]]){
  const x=ev([...base,report('t7a2-c-a','18',a),report('t7a2-c-b','20',b)]),y=ev([...base,report('t7a2-c-b','18',b),report('t7a2-c-a','20',a)]);
  assert.ok(x.provenance.conflicts.length>0&&y.provenance.conflicts.length>0,JSON.stringify(a));assert.equal(decisionKey(x),decisionKey(y),JSON.stringify(a));
 }
 // The same load in pounds is the same execution.
 const same=ev([...base,report('t7a2-c-kg','18',{}),report('t7a2-c-lb','20',{load:{value:176.4,unit:'LB',convention:'TOTAL'}})]);
 assert.equal(same.provenance.conflicts.length,0);assert.equal(same.provenance.duplicates.length,1);
});

test('R7-A cycle 2: the carried record round-trips: a correction of a merged report and an exact replay change nothing in the next review (QE-R7A-08, QE-R7A-09; INV-10)',()=>{
 const p=generateProgram(intake({id:'t7a2-carry',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
 const all=p.weeks[0].sessions.filter(s=>s.prescription),run=all.find(s=>s.sport==='RUN'&&s.role==='EASY'),base=all.filter(s=>s!==run).map(s=>obs(p,s));
 const day6=addDays(p.weeks[0].startDate,6),M={...obs(p,run,{eventId:'t7a2-M'}),observedAt:run.date+'T08:00:00Z'};
 const Wt={...M,eventId:'t7a2-W',observedAt:run.date+'T08:05:00Z',source:{provider:'GENERIC_WATCH',activityId:'act-t7a2',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:run.prescription.durationMinutes+1}};
 const live=(x,list='accepted')=>x[list].filter(o=>o.sessionId===run.id&&!o.superseded).map(o=>[o.eventId,o.actual.minutes]);
 for(const target of ['t7a2-W','t7a2-M']){
  const C={...M,eventId:'t7a2-C-'+target,correctionOf:target,correctedAt:run.date+'T12:00:00Z',actual:{completed:true,minutes:run.prescription.durationMinutes+20}};
  const n1=normalizeObservations([M,Wt,C],{athleteId:p.athleteId,asOf:day6+'T21:00:00Z',maximumAgeDays:36500});
  const n2=normalizeObservations([],{athleteId:p.athleteId,asOf:addDays(day6,1)+'T21:00:00Z',maximumAgeDays:36500,prior:[...n1.accepted,...n1.supersededRows]});
  assert.deepEqual(live(n1),[[C.eventId,C.actual.minutes]],target);assert.deepEqual(live(n2),live(n1),target);assert.equal(n2.excluded.length,0,target);
  const e1=evaluateProgram(p,review(p,0,{observations:[...base,M,Wt,C]}),opts),P1=e1.proposal??p,e2=evaluateProgram(P1,review(P1,1,{observations:[],actualLedger:e1.actualLedger}),opts);
  assert.deepEqual(live(e2,'actualLedger'),[[C.eventId,C.actual.minutes]],target);
 }
 const f1=evaluateProgram(p,{...review(p,0,{observations:[...base,M,Wt]}),asOf:day6+'T20:00:00Z'},opts);
 const without=evaluateProgram(p,review(p,0,{observations:[],actualLedger:f1.actualLedger}),opts),replay=evaluateProgram(p,review(p,0,{observations:[structuredClone(M)],actualLedger:f1.actualLedger}),opts);
 assert.equal(replay.provenance.conflicts.length,0);assert.equal(decisionKey(replay),decisionKey(without));
});

test('R7-A cycle 2: intake records of one exercise merge by what they say: a label never decides, instants compare as instants, a record without a load keeps the hint (QE-R7A-13; INV-06, INV-07)',()=>{
 const base={id:'db-row',sets:3,reps:10,current:true,familiar:true,tolerated:true};
 const pick=known=>{const e=canonicalizeIntake(intake({id:'t7a2-in',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:known},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}})).canonical.athlete.knownExercises.find(x=>x.id===base.id);return {load:e.dose?.load?.value??null,hint:e.loadHint?.value??null};};
 const A={...base,load:{value:20,unit:'KG',convention:'PER_HAND'},rir:2,observedAt:'2026-10-29'},B={...A,load:{value:24,unit:'KG',convention:'PER_HAND'}};
 const labels=[undefined,'SELF_REPORT','self_report','APPLE_HEALTH','MANUAL'],seen=new Set();
 for(const la of labels)for(const lb of labels)for(const order of [0,1]){const x=[{...A,source:la},{...B,source:lb}];seen.add(JSON.stringify(pick(order?x.reverse():x)));}
 assert.equal(seen.size,1,[...seen].join(' '));
 for(const order of [0,1]){const x=[{...A,observedAt:'2026-10-30T01:00:00+05:00'},{...B,observedAt:'2026-10-29T22:00:00Z'}];assert.equal(pick(order?x.reverse():x).load,24);}
 const H={...base,id:'db-row',load:{value:20,unit:'KG',convention:'PER_HAND'},rir:undefined,observedAt:'2026-10-27'},L={...base,load:undefined,rir:undefined,observedAt:'2026-10-30'};
 for(const order of [0,1]){const x=[H,L];assert.equal(pick(order?x.reverse():x).hint,20);}
});

test('R7-A cycle 2: only a carried row can be history; a new report flagged superseded is a live report and passes every check (QE-R7A-16; INV-10)',()=>{
 const asOf='2026-11-10T21:00:00Z',fact={eventId:'t7a2-o1',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',actual:{completed:true,minutes:30},response:{...OK}};
 const n1=normalizeObservations([{...fact,superseded:true,supersededBy:'x'}],{athleteId:'a',asOf,maximumAgeDays:36500});
 assert.equal(n1.accepted.length,1);assert.equal(n1.supersededRows.length,0);assert.equal(n1.accepted[0].superseded,undefined);
 const n2=normalizeObservations([{...fact,eventId:'t7a2-o2',observedAt:'2027-05-01T08:00:00Z',superseded:true}],{athleteId:'a',asOf,maximumAgeDays:36500});
 assert.deepEqual(n2.excluded.map(x=>x.reason),['FUTURE_OBSERVATION']);
 const carried=normalizeObservations([],{athleteId:'a',asOf,maximumAgeDays:36500,prior:[{...fact,superseded:true,supersededBy:'x'}]});
 assert.equal(carried.accepted.length,0);assert.equal(carried.supersededRows.length,1);
});

test('R7-A cycle 2: a practice exercise is practice in the plan and in the review (QE-R7A-17; INV-04)',()=>{
 const p=generateProgram(intake({id:'t7a2-practice',weeks:8,athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'NONE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthMinutes:30,longRunDay:null}}),opts).program;
 const practice=[...new Set(rows(p,0).filter(x=>x.e.exposure?.kind==='PRACTICE').map(x=>x.e.id))];assert.ok(practice.length>=2);
 const r=evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(p,s))}),opts),st=(r.proposal??p).stateTrace[1].strength.exercises;
 for(const id of practice)assert.equal(st[id]?.lastExecutedSets,undefined,id);
});
