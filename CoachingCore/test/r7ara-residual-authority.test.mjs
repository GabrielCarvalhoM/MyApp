// DOMAIN_COACHING_R7-A residual authority closure (Founder request 2026-10-30; audits/domain-coaching-r7a-residual-authority-2026-10-30/
// RESIDUAL_AUTHORITY_CONTRACT.md). Two root causes, each closed in one place: A5, the canonical factual state comes before every decision
// (QE-R7ADA-01), and E1, a return never starts above the running state or dose last executed (QE-R7ADA-02, SSCTR F4-X). Every finding regression
// fails on R7A-DECISION-AUTHORITY-FREEZE-1 and passes here; P1-P4 are the four property clusters of the request (§24). The reviewers' own shapes:
// Q01 and Q01b (engineering) for A5, Q06c and the SSCTR's continuous-running probe (its profile and timeline) for E1. Development authority;
// synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7ara-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s as prescribed: kg(id,e) picks a logged load, set(id,x) edits each set, sets(id,e) forces a count. */
function obs(p,s,{kg=null,set=null,sets=null,response=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:sets?.(e.id,e)??e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:`t7ara-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK,...(response??{})}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s&&s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,o={},hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const gen=input=>{const g=generateProgram(input,opts);assert.ok(g.program,`${input.athlete.id}: ${g.status} ${g.reason}`);return {p:g.program,ledger:[]};};
const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
const history=(t,w,day=0,hour='06:00:00')=>historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts);
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2;
const rowsOf=(t,w,pred,id)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&pred(s)).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>`${e.load.mode}${e.load.value??''} ${e.sets}x${e.reps}`));
const hState=(H,id)=>{const st=H?.state?.strength?.exercises?.[id]??null;return st&&{mode:st.mode,load:st.load??null,reps:st.reps??null,pending:st.pendingLoad??null};};
const correctionOf=(o,actual,correctedAt)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response}});
const kgFor=(id0,v)=>(id,e)=>id===id0?v:(e.load.mode==='KNOWN'?e.load.value:20);
const withLoad=(id,to)=>xs=>xs.map(e=>e.id!==id?e:{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:to}}))});

// ---------- A5: the canonical factual state before every decision (QE-R7ADA-01) ----------
// The Monday 07:00 event of week W, carrying `obs` (the late fact in LATE, nothing in EARLY): each review kind the runtime accepts observations with.
const KINDS={
 WEEKLY_REVIEW:(p,w,o)=>at(p,w,0,'07:00:00',{observations:o}),
 SCHEDULE_NOOP:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'SCHEDULE_CHANGE',observations:o}),changes:{runMinutes:p.canonical.schedule.runMinutes}}),
 SCHEDULE_NEXT_WEEK:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'SCHEDULE_CHANGE',observations:o}),changes:{runMinutes:55}}),
 GOAL_NOOP:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'GOAL_CHANGE',observations:o}),changes:{goals:{strength:'STRENGTH'}}}),
 GOAL_NEXT_WEEK:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'GOAL_CHANGE',observations:o}),changes:{goals:{strength:'HYPERTROPHY'}}}),
 UNAVAILABLE_DAY:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'UNAVAILABLE_DAY',observations:o}),changes:{unavailableDates:[addDays(p.weeks[w].startDate,3)]}}),
 LOCAL_FATIGUE_REDUCES:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'LOCAL_FATIGUE',observations:o}),signals:{region:'LOWER'}}),
 TURN_CONFLICT:(p,w,o)=>({...at(p,w,0,'07:00:00',{kind:'DOUBLE_CONFLICT',observations:o}),changes:{strengthTurn:'PM'}}),
};
/**
 * One cell of the engineering shapes (Q01, Q01b): weeks before W set up by `setup(t,cell)`, which returns the late fact (EARLY sends it with the
 * closing review of week W-1); then the Monday event of KIND with (LATE) or without (EARLY) it; week W reported day by day from reports built once
 * (`reports`, the same facts in both cells) and closed on Sunday. Read: the rows of the exercise right after the event, the closing review's load
 * questions, HistoricalState at the start of week W+1, the rows of week W+1.
 */
function cell({kind,cellName,id,W,setup,reports,shared}){
 N=0;const t=gen(intake({id:'t7ara-a5'})),fact=setup(t,cellName),d=step(t,KINDS[kind](t.p,W,cellName==='LATE'?fact:[])),afterEvent=rowsOf(t,W,()=>true,id);
 shared.reports??=reports(t);
 const byDay=new Map();for(const o of shared.reports.filter(o=>t.p.weeks[W].sessions.some(s=>s.id===o.sessionId&&live(s)))){const s=t.p.weeks[W].sessions.find(x=>x.id===o.sessionId);if(!byDay.has(s.day))byDay.set(s.day,[]);byDay.get(s.day).push(structuredClone(o));}
 for(const day of [1,2,3,4,5])if(byDay.has(day))step(t,at(t.p,W,day,'21:00:00',{observations:byDay.get(day)}));
 const close=step(t,at(t.p,W,6,'21:00:00',{observations:byDay.get(6)??[]}));
 return {action:d.action,afterEvent,questions:(close.loadQuestions??[]).filter(q=>q.exerciseId===id).map(q=>`${q.reason}:${q.logged}/${q.planned}`),history:hState(history(t,W+1),id),next:rowsOf(t,W+1,()=>true,id),t};
}
const pair=spec=>{const shared={};return {EARLY:cell({...spec,cellName:'EARLY',shared}),LATE:cell({...spec,cellName:'LATE',shared})};};
// Q01 KNOWN_LOWER: db-rdl established at 24 kg in weeks 0-1, both logs corrected to 20 (history KNOWN 20); Saturday of week 2 logged at X, 3x5 @ RIR 3.
const lowered=X=>({id:'db-rdl',W:2,
 setup:(t,c)=>{weekly(t,0,()=>true,s=>SAT(s)?{kg:kgFor('db-rdl',24)}:{});const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',24)}:{}),eventId:`a5-w1-${i}`}));
  const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id==='db-rdl')));
  const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(has)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:withLoad('db-rdl',20)(o.actual.exercises??[])},`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
  step(t,at(t.p,1,6,'21:00:00',{observations:c==='EARLY'?[...w1,...fix]:w1}));return fix;},
 reports:t=>t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',X),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:`a5-w2-${i}`}))});
const CELLS=new Map();
const loweredPair=kind=>{if(!CELLS.has(kind))CELLS.set(kind,pair({kind,...lowered(24)}));return CELLS.get(kind);};

test('QE-R7ADA-01: a correction delivered with any review kind is applied before that review decides (24 -> 20 kg, logged 24)',()=>{
 for(const kind of Object.keys(KINDS)){const {EARLY:E,LATE:L}=loweredPair(kind);
  // The row the log is judged against is the corrected one, the D44 question is asked in both cells, and history is the corrected load.
  assert.deepEqual(L.afterEvent,E.afterEvent,kind+': the rows still ahead after the event');assert.ok(!L.afterEvent.some(r=>r.startsWith('KNOWN24')),kind+': no row from the retracted 24 kg');
  assert.deepEqual(L.questions,['LOGGED_LOAD_ABOVE_PLAN:24/20'],kind+': the confirmation rule still asks');assert.deepEqual(L.questions,E.questions,kind);
  assert.deepEqual(L.history,{mode:'KNOWN',load:20,reps:5,pending:null},kind+': history keeps the corrected 20 kg');assert.deepEqual(L.history,E.history,kind);assert.deepEqual(L.next,E.next,kind+': next week');}
});
test('QE-R7ADA-01 last day: a correction on the week\'s last day re-plans that day\'s session still ahead, whatever the review kind',()=>{
 // Strength on Wednesday and Sunday (PM). db-rdl at 24 kg in weeks 0-1, both logs corrected to 20; week 2 executed Monday to Saturday; the correction
 // arrives on Sunday 07:00, before Sunday's session (LATE), or with week 1's closing review (EARLY); Sunday's db-rdl logged at 24 (3x5 @ RIR 3).
 const SUN=s=>s.sport==='STRENGTH'&&s.day===6,has=s=>s.prescription?.exercises?.some(e=>e.id==='db-rdl');
 const EVENT={WEEKLY_REVIEW:(p,o)=>at(p,2,6,'07:00:00',{observations:o}),UNAVAILABLE_DAY:(p,o)=>({...at(p,2,6,'07:00:00',{kind:'UNAVAILABLE_DAY',observations:o}),changes:{unavailableDates:['2030-01-01']}}),
  SCHEDULE_NOOP:(p,o)=>({...at(p,2,6,'07:00:00',{kind:'SCHEDULE_CHANGE',observations:o}),changes:{runMinutes:p.canonical.schedule.runMinutes}}),LOCAL_FATIGUE:(p,o)=>({...at(p,2,6,'07:00:00',{kind:'LOCAL_FATIGUE',observations:o}),signals:{region:'UPPER'}})};
 const run=(kind,c,shared)=>{N=0;const t=gen(intake({id:'t7ara-a5-sun',schedule:{strengthDays:[2,6]}}));weekly(t,0,()=>true,s=>has(s)?{kg:kgFor('db-rdl',24)}:{});
  const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s,has(s)?{kg:kgFor('db-rdl',24)}:{}),eventId:`sun-w1-${i}`}));
  const hasO=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&has(s)));
  const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(hasO)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:withLoad('db-rdl',20)(o.actual.exercises??[])},`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
  step(t,at(t.p,1,6,'21:00:00',{observations:c==='EARLY'?[...w1,...fix]:w1}));
  for(const s of t.p.weeks[2].sessions.filter(s=>live(s)&&s.day<6))step(t,at(t.p,2,s.day,'21:00:00',{observations:[obs(t.p,s)]}));
  step(t,EVENT[kind](t.p,c==='LATE'?fix:[]));const row=rowsOf(t,2,SUN,'db-rdl'),sun=t.p.weeks[2].sessions.find(s=>live(s)&&SUN(s));
  shared.rep??={...obs(t.p,sun,{kg:kgFor('db-rdl',24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}),eventId:'sun-w2'};
  const close=step(t,at(t.p,2,6,'21:00:00',{observations:[structuredClone(shared.rep)]}));
  return {row,questions:(close.loadQuestions??[]).filter(q=>q.exerciseId==='db-rdl').map(q=>q.reason),history:hState(history(t,3),'db-rdl')};};
 for(const kind of Object.keys(EVENT)){const shared={},E=run(kind,'EARLY',shared),L=run(kind,'LATE',shared);
  assert.deepEqual(L.row,E.row,kind+': Sunday\'s row');assert.ok(L.row.every(r=>r.startsWith('KNOWN20')),kind+': '+L.row);
  assert.deepEqual(L.questions,['LOGGED_LOAD_ABOVE_PLAN'],kind);assert.deepEqual(L.history,E.history,kind);assert.equal(L.history.load,20,kind);}
});
test('QE-R7ADA-01 robustness: removed load, wearable conflict and a correction upward give EARLY = LATE whatever the review kind',()=>{
 const shapes={
  // Q01b (i): back-squat (TOTAL, Wednesday) at 80 in weeks 0-1, week 1's back-squat removed by its correction; week 2 Wednesday logged 85, 3x5 @ RIR 3.
  removed:{id:'back-squat',W:2,kinds:['SCHEDULE_NEXT_WEEK','UNAVAILABLE_DAY','SCHEDULE_NOOP'],
   setup:(t,c)=>{weekly(t,0);const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s),eventId:`rm-w1-${i}`})),o=w1.find(x=>t.p.weeks[1].sessions.find(s=>s.id===x.sessionId)?.prescription?.exercises?.some(e=>e.id==='back-squat'));
    const fix=[correctionOf(o,{...structuredClone(o.actual),exercises:o.actual.exercises.filter(e=>e.id!=='back-squat')},`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`)];step(t,at(t.p,1,6,'21:00:00',{observations:c==='EARLY'?[...w1,...fix]:w1}));return fix;},
   reports:t=>t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,WED(s)?{kg:kgFor('back-squat',85),set:(id,x)=>id==='back-squat'?{...x,reps:5,rir:3}:x}:{}),eventId:`rm-w2-${i}`}))},
  // Q01b (ii-b): db-rdl KNOWN 20 (weeks 0-1), week 2 Saturday logged 22 and adopted, a wearable record of that session quarantines it in week 3.
  wearable:{id:'db-rdl',W:3,kinds:['GOAL_NEXT_WEEK','UNAVAILABLE_DAY','LOCAL_FATIGUE_REDUCES'],
   setup:(t,c)=>{for(const w of [0,1])weekly(t,w,()=>true,s=>SAT(s)?{kg:kgFor('db-rdl',20)}:{});const w2=t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',22),set:(id,x)=>id==='db-rdl'?{...x,rir:3}:x}:{}),eventId:`wr-w2-${i}`}));
    const sat=t.p.weeks[2].sessions.find(SAT),man=w2.find(o=>o.sessionId===sat.id);
    const wear=[{eventId:'wr-w2-wear',athleteId:t.p.athleteId,sessionId:sat.id,observedAt:man.observedAt,source:{provider:'HEALTHKIT',activityId:'hk-88',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:Math.round(man.actual.minutes*0.5)},response:{...OK}}];
    step(t,at(t.p,2,6,'21:00:00',{observations:c==='EARLY'?[...w2,...wear]:w2}));return wear;},
   reports:t=>t.p.weeks[3].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:`wr-w3-${i}`}))},
  // Q01b (iii): db-rdl at 20 in weeks 0-1, both logs corrected UP to 24; week 2 Saturday logged 26 (the conservative direction).
  upward:{id:'db-rdl',W:2,kinds:['SCHEDULE_NEXT_WEEK','GOAL_NOOP','TURN_CONFLICT'],
   setup:(t,c)=>{weekly(t,0,()=>true,s=>SAT(s)?{kg:kgFor('db-rdl',20)}:{});const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',20)}:{}),eventId:`up-w1-${i}`}));
    const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id==='db-rdl')));
    const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(has)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:withLoad('db-rdl',24)(o.actual.exercises??[])},`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
    step(t,at(t.p,1,6,'21:00:00',{observations:c==='EARLY'?[...w1,...fix]:w1}));return fix;},
   reports:t=>t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',26),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:`up-w2-${i}`}))},
 };
 for(const [name,{kinds,...spec}] of Object.entries(shapes))for(const kind of kinds){const {EARLY:E,LATE:L}=pair({kind,...spec});
  assert.deepEqual(L.afterEvent,E.afterEvent,`${name} ${kind}: rows after the event`);assert.deepEqual(L.questions,E.questions,`${name} ${kind}: questions`);
  assert.deepEqual(L.history,E.history,`${name} ${kind}: history`);assert.deepEqual(L.next,E.next,`${name} ${kind}: next week`);}
});
test('P1 factual correction globality: the same corrected evidence through different review kinds gives the same factual state',()=>{
 const base=loweredPair('WEEKLY_REVIEW').LATE;
 for(const kind of Object.keys(KINDS)){const L=loweredPair(kind).LATE;
  // The corrected exercise: the load the rows still ahead prescribe (the D44 reference), the question, and history, whichever review carried the fact.
  assert.deepEqual(L.afterEvent.map(r=>r.split(' ')[0]),base.afterEvent.map(r=>r.split(' ')[0]),kind);assert.deepEqual(L.questions,base.questions,kind);assert.deepEqual(L.history,base.history,kind);}
});
test('P2 a retracted value cannot come back through a planned row: removed or lowered, history moves only on a new valid execution',()=>{
 // Lowered 24 -> 20: no row still ahead prescribes the retracted 24 kg after any review kind, and logging that 24 is asked, never adopted.
 for(const kind of Object.keys(KINDS)){const L=loweredPair(kind).LATE;assert.ok(L.afterEvent.length&&L.afterEvent.every(r=>r.startsWith('KNOWN20')),kind);assert.equal(L.history.load,20,kind);}
 // A new valid execution moves it: 22 kg (one increment above the corrected 20, target met) is adopted as the athlete's load.
 const {LATE:valid}=pair({kind:'UNAVAILABLE_DAY',...lowered(22)});assert.deepEqual(valid.questions,[]);assert.equal(valid.history.load,22);
 // Removed: the corrected record says db-rdl was never performed, so the rows still ahead establish it by effort, never prescribe the retracted load.
 const removed={id:'db-rdl',W:2,
  setup:(t,c)=>{weekly(t,0,()=>true,s=>SAT(s)?{kg:kgFor('db-rdl',20)}:{});const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',20)}:{}),eventId:`fl-w1-${i}`}));
   const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id==='db-rdl')));
   const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(has)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!=='db-rdl')},`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
   step(t,at(t.p,1,6,'21:00:00',{observations:c==='EARLY'?[...w1,...fix]:w1}));return fix;},
  reports:t=>t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:kgFor('db-rdl',24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:`fl-w2-${i}`}))};
 for(const kind of ['UNAVAILABLE_DAY','SCHEDULE_NEXT_WEEK','LOCAL_FATIGUE_REDUCES']){const {EARLY:E,LATE:L}=pair({kind,...removed});
  assert.ok(L.afterEvent.length&&L.afterEvent.every(r=>r.startsWith('ESTABLISH')),kind+': '+L.afterEvent);assert.deepEqual(L.afterEvent,E.afterEvent,kind);
  assert.deepEqual(L.history,E.history,kind);assert.equal(L.history.mode,'FROM_LOG',kind+': the log waits for confirmation (D45)');}
});

// ---------- E1: a return never starts above the running state or dose last executed (QE-R7ADA-02, SSCTR F4-X) ----------
/** A pause of `days` from day d0 of week k, reported on the day after it ends at 06:00: the return's first rows, by role, after the report. */
function pauseFrom(t,k,days,d0=0){
 const start=addDays(t.p.weeks[k].startDate,d0),end=addDays(start,days-1),report=addDays(end,1),W=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=addDays(x.startDate,6));
 const r=step(t,at(t.p,W,Math.round((Date.parse(report)-Date.parse(t.p.weeks[W].startDate))/864e5),'06:00:00',brk(start,end))),d=t.p.decisions.at(-1);
 const rows=t.p.weeks[d.fromWeek].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=report).map(s=>({role:s.role,minutes:s.prescription.durationMinutes,dim:s.progression?.dimension??null,value:s.progression?.value??null}));
 return {r,entry:d.interruption.entry.run,cls:d.interruption.class,rows,report,fromWeek:d.fromWeek};
}
/** Runs the record shows executed completely before a day: the dose its row prescribed, by role, with its dimension and week. */
const executedRuns=(t,before)=>t.p.weeks.flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<before&&t.ledger.some(o=>o.sessionId===s.id&&!o.partial&&!o.conflicted&&o.actual?.completed)).map(s=>({role:s.role,minutes:s.prescription.durationMinutes,dim:s.progression?.dimension??null,date:s.date,week:w.index})));
/** The largest long run and easy run executed (an eased quality slot is no easy-run dose). */
const largestRuns=ran=>({long:Math.max(...ran.filter(x=>x.role==='LONG').map(x=>x.minutes)),easy:Math.max(...ran.filter(x=>x.role==='EASY'&&!['THRESHOLD_STEP','SPECIFIC_STEP'].includes(x.dim)).map(x=>x.minutes))});
/** A MODERATE break of 14 days (weeks 3-4) after three executed weeks, reported Monday 06:00 of week 5: a full re-entry week at return step 0. */
const reentry=id=>{N=0;const e=gen(intake({id}));for(let w=0;w<3;w++)weekly(e,w);const first=pauseFrom(e,3,14);assert.deepEqual([first.cls,first.entry.mode,first.fromWeek],['MODERATE','RETURN',5]);return e;};

test('QE-R7ADA-02 / EASY return factual ceiling: 70 executed, 75 released, a short pause never resumes 75 (nor an easy run above the one executed)',()=>{
 // The athlete's long runs: 65 (weeks 0-2, the share cap holding 70), 60 in the consolidation week 3, 70 in week 4, 75 in week 5. The state after
 // a week the evidence closed is the next step, released and not yet run.
 for(const [k,days] of [[5,6],[5,10],[3,6],[2,6],[4,6]]){
  N=0;const t=gen(intake({id:'t7ara-easy'}));for(let w=0;w<k;w++)weekly(t,w);
  const H=history(t,k,0).state.run,ran=executedRuns(t,t.p.weeks[k].startDate),{long,easy}=largestRuns(ran),{entry,cls,rows}=pauseFrom(t,k,days);
  assert.equal(cls,'SHORT');if(k===5)assert.ok(H.long>long,'the evidence released the next long run (the case under test)');
  assert.ok(entry.long<=long,`k=${k} ${days}d: the return's long run ${entry.long} above the largest executed ${long}`);
  for(const x of rows.filter(x=>x.role==='LONG'))assert.ok(x.minutes<=long,`k=${k}: long ${x.minutes} > ${long}`);
  for(const x of rows.filter(x=>x.role==='EASY'&&x.dim==='EASY_MINUTES'))assert.ok(x.minutes<=easy,`k=${k}: easy ${x.minutes} > ${easy}`);
  if(k===5)assert.equal(entry.long,70,'resumes the 70 executed, never the 75 only released');
  // After a consolidation week (60, a planned reduction from the same state) it resumes the 65 executed, never the released 70.
  if(k===4)assert.equal(entry.long,65,'resumes the dose reached by execution, not the reduced row nor the released step');}
 // Moderate: the conditional steps go back to the prior executed dose, never to the step only released, and never below a dose executed.
 for(const [k,to] of [[5,70],[8,75]]){N=0;const m=gen(intake({id:'t7ara-easy-mod'}));for(let w=0;w<k;w++)weekly(m,w);const {entry,cls}=pauseFrom(m,k,17);
  assert.equal(cls,'MODERATE');assert.equal(entry.mode,'RETURN');assert.equal(entry.returnTo.long,to,`k=${k}`);}
});
// The SSCTR's continuous-running probe (R7ADA-SSCTR-r1), its profile and timeline: WALK_JOG_FIVE_DAYS, walk/jog Mon, Wed, Fri and walks Tue, Sat.
// TOP5 is a non-novice starting at step 5 (SSCTR D42, the exit in a CONSOLIDATION week), FULL the fixture novice from step 0 (16 weeks, the exit in a
// DEVELOPMENT week). X is the first week whose plan prescribes continuous easy runs when every week is executed; L = X-1 runs step 8 (1 x 20 min).
const BASE={...PROFILES,...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS;
const ATHLETES={TOP5:()=>{const p=structuredClone(BASE);p.weeks=12;p.athlete.id='t7ara-wj-top5';p.athlete.runExperience='INTERMEDIATE';p.athlete.recent={...p.athlete.recent,runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12};return p;},
 FULL:()=>{const p=structuredClone(BASE);p.weeks=16;p.athlete.id='t7ara-wj-full';return p;}};
const CONT=['EASY','LONG','QUALITY'];
const exitWeek=profile=>{const ref=gen(profile());for(let w=0;w<ref.p.weeks.length-1;w++){weekly(ref,w);if(ref.p.weeks[w+1].sessions.some(s=>live(s)&&s.sport==='RUN'&&CONT.includes(s.role)))return w+1;}return null;};
const EXITS={};
const exitOf=name=>EXITS[name]??=exitWeek(ATHLETES[name]);
/** Pause from Monday of week X (or `d0`): SHORT to Friday reported Saturday 07:00, MODERATE 14 days, LONG 33 days; the re-entry week's runs. */
function exitReturn(name,pName,{setup=null,d0=0}={}){
 N=0;const X=exitOf(name),t=gen(ATHLETES[name]()),Lw=X-1;
 if(setup)setup(t,X);else for(let w=0;w<=Lw;w++)weekly(t,w);
 const P={SHORT:{end:4,report:[X,5]},MODERATE:{end:d0+13,report:[X+2,d0]},LONG:{end:d0+32,report:[X+4,Math.min(6,d0+5)]}}[pName],start=addDays(t.p.weeks[X].startDate,d0);
 if(P.report[0]+1>=t.p.weeks.length)return null;
 const r=step(t,at(t.p,P.report[0],P.report[1],'07:00:00',brk(start,addDays(t.p.weeks[X].startDate,P.end)))),reportAt=`${addDays(t.p.weeks[P.report[0]].startDate,P.report[1])}T07:00:00Z`,d=t.p.decisions.at(-1);
 // The re-entry week: the return's own, from the report on, or the next one when re-entry starts there (as the SSCTR's probe reads it).
 const rows=t.p.weeks[d.fromWeek].sessions.filter(s=>live(s)&&s.sport==='RUN'&&(d.fromWeek!==P.report[0]||`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`>reportAt));
 return {r,entry:d.interruption.entry.run,continuous:rows.filter(s=>CONT.includes(s.role)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),steps:rows.filter(s=>s.role==='WALK_JOG').map(s=>s.progression.value)};
}
test('SSCTR F4-X: step 8 executed, the exit to continuous running released but never run, a pause: the return is the walk/jog recipe',()=>{
 for(const name of ['TOP5','FULL'])for(const [pName,allowed] of [['SHORT',8],['MODERATE',7],['LONG',0]]){
  const c=exitReturn(name,pName);if(!c)continue;
  assert.equal(c.r.action,'REESTABLISH',`${name} ${pName}`);assert.equal(c.entry.mode,'WALK_JOG',`${name} ${pName}: the state last run`);
  assert.deepEqual(c.continuous,[],`${name} ${pName}: no continuous run the athlete never ran (${c.continuous})`);
  assert.ok(c.steps.length&&c.steps.every(v=>v<=allowed),`${name} ${pName}: walk/jog steps ${c.steps} within the recipe (${allowed})`);}
 // Week L complete but never reviewed (history still credits it): the same.
 const u=exitReturn('TOP5','SHORT',{setup:(t,X)=>{for(let w=0;w<X-1;w++)weekly(t,w);for(const s of t.p.weeks[X-1].sessions.filter(s=>live(s)&&s.day<6))step(t,at(t.p,X-1,s.day,'21:00:00',{observations:[obs(t.p,s)]}));step(t,at(t.p,X,0,'06:00:00',{observations:t.p.weeks[X-1].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));}});
 assert.equal(u.entry.mode,'WALK_JOG');assert.deepEqual(u.continuous,[]);
});
test('P3 return factual ceiling: a released or projected run state above the factual one is never the return baseline',()=>{
 // Walk/jog (F4): the week's step run, the next step released, a short break resumes the step run.
 N=0;const t=gen(ATHLETES.TOP5());weekly(t,0);const ran=t.p.weeks[0].sessions.find(s=>live(s)&&s.role==='WALK_JOG').progression.value;
 assert.ok(history(t,1).state.run.walkStep>ran,'the evidence released the next step');
 const {entry}=pauseFrom(t,1,6);assert.equal(entry.walkStep,ran);
 // A repeated pause (a MODERATE re-entry, then a short break): the re-entry week ran return step 0, the evidence released step 1, the break resumes 0.
 const e=reentry('t7ara-rep');weekly(e,5);
 assert.equal(history(e,6).state.run.returnStep,1,'history credits the executed re-entry week');
 const second=pauseFrom(e,6,4);assert.equal(second.entry.mode,'RETURN');assert.equal(second.entry.returnStep,0,'the break resumes the step last run');
});
test('P4 execution promotes: once the athlete runs the next state or dose, it is the one a later return reads',()=>{
 // The first continuous run after the walk/jog exit executed on Monday of week X, the pause from Tuesday: the return keeps continuous running.
 const c=exitReturn('TOP5','SHORT',{d0:1,setup:(t,X)=>{for(let w=0;w<X;w++)weekly(t,w);const s=t.p.weeks[X].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.day===0);step(t,at(t.p,X,0,'21:00:00',{observations:[obs(t.p,s)]}));}});
 assert.equal(c.entry.mode,'EASY');assert.ok(c.entry.easy<=25);
 // EASY: the 75-minute long run the evidence released after the 70 of week 4, executed in week 5, then a short break: it resumes 75 (a break from
 // Monday of week 5, before that run, resumes 70: QE-R7ADA-02 above).
 N=0;const t=gen(intake({id:'t7ara-promote'}));for(let w=0;w<6;w++)weekly(t,w);
 const lastLong=executedRuns(t,t.p.weeks[6].startDate).filter(x=>x.role==='LONG').at(-1).minutes;assert.equal(lastLong,75,'the released 75 was run in week 5');
 assert.equal(pauseFrom(t,6,6).entry.long,75);
 // A repeated pause after return step 1 was run (Tuesday of week 6), the break from Wednesday: it resumes step 1.
 const e=reentry('t7ara-rep2');weekly(e,5);
 const tue=e.p.weeks[6].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.day===1);assert.deepEqual([tue.progression.dimension,tue.progression.value],['RETURN_STEP',1],'week 6 runs return step 1');
 step(e,at(e.p,6,1,'21:00:00',{observations:[obs(e.p,tue)]}));const second=pauseFrom(e,6,3,2);assert.equal(second.entry.returnStep,1);
});
