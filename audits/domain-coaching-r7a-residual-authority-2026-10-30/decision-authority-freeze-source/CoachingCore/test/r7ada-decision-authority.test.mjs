// COACHING CORE — R7-A DECISION AUTHORITY FINAL CLOSURE: factual authority, one decision context, evidence-based progression authority and the
// walk/jog return ceiling (Founder request 2026-10-29; audits/domain-coaching-r7a-decision-authority-2026-10-29/DECISION_AUTHORITY_CONTRACT.md).
// First the five blockers of the two independent reviews of STATE-MODEL-CONSUMER-FREEZE-1, each on its reviewer's own scenario (QE-R7ASC-01..04,
// SSCTR F4); then the Founder's properties P1-P7; then the classes the self-challenge added and the approved HOLD and MAINTAIN doses this closure
// must keep. Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {programHash} from '../src/r6-program.mjs';
import {hash} from '../src/value.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const opts={authority:devAuthority()},DOSES=opts.authority.policy.operational.strength.goalDoses;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const DEFAULT_KNOWN=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')];
const WJ={athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},knownExercises:[]},schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:30,strengthMinutes:30,longRunDay:6,longRunMinutes:30}};
const intake=({id,goal='STRENGTH',known=DEFAULT_KNOWN,athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7da-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s as prescribed: kg(id,e) picks a logged load, sets(id,e) a set count, set(id,x) edits each set; noDetails drops the
 * exercises and drop removes some. */
function obs(p,s,{kg=null,set=null,sets=null,noDetails=false,drop=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&!noDetails)a.exercises=pr.exercises.filter(e=>!drop||!drop.includes(e.id)).map(e=>({id:e.id,sets:Array.from({length:sets?.(e.id,e)??e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`t7da-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review,{allow=false}={})=>{const r=evaluate(t,review);if(!allow)assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??'')}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,isWJ=s=>s.sport==='RUN'&&s.role==='WALK_JOG';
const weekly=(t,w,keep=()=>true,o={},hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
/** Prebuilt reports of week w, one session-day at a time at 21:00; Sunday's (and `extra`) on Sunday 21:00 when `close` (the week's closing
 * review), otherwise on Monday 06:00 of the next week, so no decision closes week w. */
function deliver(t,w,reports,{close=false,extra=[]}={}){
 const byDay=new Map();for(const o of reports){const s=t.p.weeks[w].sessions.find(x=>x.id===o.sessionId);if(!byDay.has(s.day))byDay.set(s.day,[]);byDay.get(s.day).push(structuredClone(o));}
 for(const d of [0,1,2,3,4,5])if(byDay.has(d))step(t,at(t.p,w,d,'21:00:00',{observations:byDay.get(d)}));
 const sunday=[...(byDay.get(6)??[]),...structuredClone(extra)];
 if(close)step(t,at(t.p,w,6,'21:00:00',{observations:sunday}));else if(sunday.length)step(t,at(t.p,w+1,0,'06:00:00',{observations:sunday}));
}
const gen=o=>{const g=generateProgram(intake(o),opts);assert.ok(g.program,`${o.id}: ${g.status} ${g.reason}`);return {p:g.program,ledger:[]};};
const start=(id,weeks,o={})=>{const t=gen({id,...o});for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:structuredClone(t.p),ledger:structuredClone(t.ledger)});
const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
const history=(t,w,day=0,hour='06:00:00')=>historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts);
const historyAt=(t,asOf)=>historicalStateOf(t.p,{asOf,actualLedger:t.ledger},opts);
const hex=(H,id)=>H?.strength?.exercises?.[id]??null;
const rowsOf=(t,w,pred=()=>true,ids=null)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&pred(s)).flatMap(s=>s.prescription.exercises.filter(e=>!ids||ids.includes(e.id)).map(e=>({id:e.id,date:s.date,mode:e.load.mode,value:e.load.value??null,reps:e.reps,sets:e.sets})));
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.progression?.dimension??''}=${s.progression?.value??''}${s.prescription.strides?.repetitions?':strides'+s.prescription.strides.repetitions:''}`);
const wjSteps=(t,w)=>[...new Set((t.p.weeks[w]?.sessions??[]).filter(s=>live(s)&&isWJ(s)).map(s=>s.progression?.value))];
const record=t=>hash(t.ledger.map(o=>({eventId:o.eventId,sessionId:o.sessionId,observedAt:o.observedAt,actual:o.actual,correctionOf:o.correctionOf??null,superseded:!!o.superseded,conflicted:!!o.conflicted})).sort((a,b)=>a.eventId<b.eventId?-1:1));
/** A run state without its bookkeeping (the rows' summary and the planner's own per-week record): what a dose is resolved from. */
const runCore=st=>{const {planned,longByWeek,modeHistory,...rest}=st;return rest;};

// ---------- QE-R7ASC-01: factual authority. A prescription never establishes HistoricalState, whenever a correction reached the plan ----------

const RDL='db-rdl';
const P01V={noDetails:{noDetails:true},repsNoLoad:{set:(id,x)=>id===RDL?{reps:x.reps,rir:x.rir}:x},unknownUnit:{set:(id,x)=>id===RDL?{...x,load:{...x.load,unit:'STONE'}}:x}};
/** The judge's P01: db-rdl logged at 20 kg in weeks 0-1, then corrected away ("I did not do the RDLs"); week 2's Saturday performs it without a
 * usable load and no review closes week 2, so history holds db-rdl only as FROM_LOG; week 3's Saturday logs it at kg, target met, and week 3 is
 * closed. Every report is built once from a reference program, so every cell holds the same record. */
function p01Reports(v,kg){N=0;const t=gen({id:'t7da-p01'});weekly(t,0);const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s),eventId:`p01-w1-${i}`}));step(t,at(t.p,1,6,'21:00:00',{observations:w1}));
 const w2=t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?v:{}),eventId:`p01-w2-${i}`}));
 const w3=t.p.weeks[3].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:(id,e)=>id===RDL?kg:(e.load.mode==='KNOWN'?e.load.value:20),sets:(id,e)=>id===RDL?3:e.sets,set:(id,x)=>id===RDL?{...x,reps:5,rir:3}:x}:{}),eventId:`p01-w3-${i}`}));
 return {w1,w2,w3};}
/** EARLY: the corrections with week 1's review. LATE: on Monday 07:00 of week 2. AFTER: only with week 3's closing review, so the week-3 row that
 * was executed is the KNOWN row planned from the retracted 20 kg. `target` replaces that row's planned load (P1). */
function p01(cell,R,{target=null}={}){N=0;const t=gen({id:'t7da-p01'});weekly(t,0);
 const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===RDL)));
 const originals=[...t.ledger.filter(o=>o.logs?.[RDL]&&!o.superseded),...R.w1.filter(has)],correctedAt=`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
 const fixes=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==RDL)},response:{...o.response}}));
 step(t,at(t.p,1,6,'21:00:00',{observations:cell==='EARLY'?[...R.w1,...fixes]:R.w1}));
 if(cell==='LATE')step(t,at(t.p,2,0,'07:00:00',{observations:fixes}));
 deliver(t,2,R.w2);
 if(target!==null){const p=structuredClone(t.p);for(const s of p.weeks[3].sessions.filter(SAT))for(const e of s.prescription.exercises.filter(e=>e.id===RDL))e.load={...e.load,value:target};delete p.hash;p.hash=programHash(p);t.p=p;}
 const row3=rowsOf(t,3,SAT,[RDL])[0];
 deliver(t,3,R.w3,{close:true,extra:cell==='AFTER'?fixes:[]});
 const H=history(t,4,0),h=hex(H,RDL),st=H.state.strength.exercises[RDL]??null;
 return {t,row3,record:record(t),history:{reader:h&&{mode:h.mode,lastExecutedLoad:h.lastExecutedLoad,liftedLoad:h.liftedLoad,tick:h.earnedProgress.loadTick},state:st&&{mode:st.mode,load:st.load??null,pendingLoad:st.pendingLoad??null,unlogged:!!st.unlogged,source:st.source}},questions:(t.last.loadQuestions??[]).filter(q=>q.exerciseId===RDL).map(q=>q.reason),rows4:rowsOf(t,4,SAT,[RDL])};}
for(const [name,v,kg] of [['noDetails',P01V.noDetails,19],['repsNoLoad',P01V.repsNoLoad,24],['unknownUnit',P01V.unknownUnit,19]])
 test(`QE-R7ASC-01 (P01, ${name}, ${kg} kg): an exercise history holds only as FROM_LOG adopts no load from a KNOWN row planned before a correction`,()=>{
  const R=p01Reports(v,kg),E=p01('EARLY',R),L=p01('LATE',R),A=p01('AFTER',R);
  assert.equal(E.record,L.record,'EARLY and LATE hold the same record');assert.equal(E.record,A.record,'EARLY and AFTER hold the same record');
  assert.equal(A.row3.mode,'KNOWN','the AFTER cell executed the KNOWN row planned from the retracted evidence');
  assert.deepEqual(L.history,E.history,'LATE: the same HistoricalState');assert.deepEqual(A.history,E.history,'AFTER: the same HistoricalState');
  assert.notEqual(A.history.state?.mode,'KNOWN','the KNOWN row never becomes history');
  assert.equal(A.history.state?.pendingLoad,kg,'the first usable log waits for confirmation (SSCTR D45)');
  for(const x of [E,L,A])assert.deepEqual(x.questions,['ESTABLISHMENT_LOG_UNCONFIRMED'],'and the closing review asks for it');
  assert.deepEqual(A.rows4,E.rows4,'the next rows are the same');
 });

test('QE-R7ASC-01 (stale row above a corrected known load): a correction re-plans the rows ahead, so the same record gives the same history',()=>{
 // db-rdl logged at 24 kg in weeks 0-1, then corrected to 20 kg (still a known load). EARLY corrects with week 1's review; LATE on Monday 07:00 of
 // week 2, after week 3's row was planned from 24. Week 2 does not perform db-rdl and no review closes it; week 3's Saturday logs 26 kg, target met.
 const ID=RDL,at24=(id,e)=>id===ID?24:(e.load.mode==='KNOWN'?e.load.value:20);
 const base=()=>{N=0;const t=gen({id:'t7da-stale'});weekly(t,0,()=>true,s=>SAT(s)?{kg:at24}:{});return t;};
 const ref=(()=>{const t=base(),w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:at24}:{}),eventId:`st-w1-${i}`}));step(t,at(t.p,1,6,'21:00:00',{observations:w1}));
  return {w1,w2:t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{drop:[ID]}:{}),eventId:`st-w2-${i}`})),w3:t.p.weeks[3].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?{kg:(id,e)=>id===ID?26:(e.load.mode==='KNOWN'?e.load.value:20),sets:(id,e)=>id===ID?3:e.sets,set:(id,x)=>id===ID?{...x,reps:5,rir:3}:x}:{}),eventId:`st-w3-${i}`}))};})();
 const cell=name=>{const t=base(),has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===ID))),originals=[...t.ledger.filter(o=>o.logs?.[ID]&&!o.superseded),...ref.w1.filter(has)],correctedAt=`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
  const fixes=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).map(e=>e.id!==ID?e:{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:20}}))})},response:{...o.response}}));
  step(t,at(t.p,1,6,'21:00:00',{observations:name==='EARLY'?[...ref.w1,...fixes]:ref.w1}));const planned=rowsOf(t,3,SAT,[ID])[0];
  if(name==='LATE')step(t,at(t.p,2,0,'07:00:00',{observations:fixes}));
  const row3=rowsOf(t,3,SAT,[ID])[0];deliver(t,2,ref.w2);deliver(t,3,ref.w3,{close:true});
  const h=hex(history(t,4,0),ID);return {t,planned,row3,record:record(t),h:{mode:h.mode,last:h.lastExecutedLoad,tick:h.earnedProgress.loadTick},q:(t.last.loadQuestions??[]).filter(q=>q.exerciseId===ID).map(q=>q.reason)};};
 const E=cell('EARLY'),L=cell('LATE');
 assert.equal(E.record,L.record);
 assert.ok(L.planned.value>E.planned.value,`LATE planned week 3 from the retracted 24 kg (${L.planned.value} against ${E.planned.value})`);
 assert.deepEqual(L.row3,E.row3,'the correction re-plans the row still ahead from the corrected facts');
 assert.deepEqual(L.h,E.h,'the same HistoricalState');assert.deepEqual(L.q,E.q,'and the same question');
 assert.equal(L.h.last,20,'26 kg logged against the corrected plan is asked, never adopted from the retracted one');
});

test('P1 factual independence from the target: the same evidence with a planned target of 20 or of 24 kg gives the same HistoricalState',()=>{
 // P01's AFTER cell with week 3's KNOWN row planned at 20 kg or at 24 kg: the record is identical, only the target differs.
 for(const [name,v,kg] of [['first log',P01V.noDetails,22],['unreadable log',P01V.unknownUnit,22]]){
  const R=p01Reports(v,kg),a=p01('AFTER',R,{target:20}),b=p01('AFTER',R,{target:24});
  assert.equal(a.record,b.record,name+': the same record');assert.deepEqual([a.row3.value,b.row3.value],[20,24]);
  assert.deepEqual(a.history,b.history,name+': the same HistoricalState');assert.notEqual(a.history.state?.mode,'KNOWN',name+': no target becomes a load');
  if(name==='unreadable log')assert.equal(a.history.reader?.lastExecutedLoad??null,null,'an unreadable load is not filled with the target (unknown is not the target)');
 }
});

// ---------- QE-R7ASC-04: one decision context. The same facts and the same goal give the same dose, whichever consumer resolves it ----------

const P07=(g1,g2,cellName)=>{N=0;const t=gen({id:`t7da-p07-${g1}-${g2}`,goal:g1});for(let w=0;w<4;w++)weekly(t,w);
 step(t,{...at(t.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:g2}}},{allow:true});weekly(t,4);
 if(cellName==='EQUIP')step(t,{...at(t.p,5,0,'06:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...t.p.canonical.athlete.equipment,'BANDS']}},{allow:true});
 return t;};
for(const [g1,g2] of [['STRENGTH','HYPERTROPHY'],['STRENGTH','MAINTAIN'],['GENERAL','RUNNING_SUPPORT'],['MAINTAIN','HYPERTROPHY'],['RUNNING_SUPPORT','MAINTAIN']])
 test(`QE-R7ASC-04 (P07, ${g1} -> ${g2}): an equipment statement that changes no exercise leaves the week after a goal change as the review planned it`,()=>{
  const plan=P07(g1,g2,'PLAN'),equip=P07(g1,g2,'EQUIP');
  assert.equal(record(plan),record(equip),'the same record');assert.equal(equip.last.action,'KEEP');
  assert.deepEqual(rowsOf(equip,5),rowsOf(plan,5),'week 5 is dosed once, under the goal in force for it');
 });

test('P2 context consistency: equivalent facts and context give the same prescription, whichever no-op handler runs, in either order',()=>{
 // The goal-change shape of the judge's P07 (weeks 0-3 under STRENGTH, HYPERTROPHY stated on week 4's Monday, week 4 reviewed): week 5 is the
 // first week of the new goal. Equipment statements that change no exercise and a schedule restatement, alone or in either order.
 N=0;const t0=start('t7da-p2',4);step(t0,{...at(t0.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'HYPERTROPHY'}}},{allow:true});weekly(t0,4);
 const equip=p=>({...at(p,5,0,'06:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS']}}),win=p=>({...at(p,5,0,'07:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS'],from:addDays(p.weeks[5].startDate,1),to:addDays(p.weeks[5].startDate,3)}});
 const sched=p=>({...at(p,5,0,'08:00:00',{kind:'SCHEDULE_CHANGE'}),changes:{runDays:[...p.canonical.schedule.runDays]}});
 const seq=fs=>{const t=copy(t0);for(const f of fs)step(t,f(t.p),{allow:true});return JSON.stringify({strength:rowsOf(t,5),run:runRows(t,5),next:runCore(t.p.stateTrace[6].run)});};
 const none=seq([]);
 for(const fs of [[equip],[sched],[equip,win],[win,equip],[equip,sched,win],[win,sched,equip]])assert.equal(seq(fs),none,fs.map(f=>f.name).join('+'));
});

test('P2 review closure: a week executed as prescribed gives the same next week whether a review closes it or a no-op decision follows it',()=>{
 N=0;const t0=start('t7da-p2c',3);
 const reviewed=copy(t0);weekly(reviewed,3);
 const unreviewed=copy(t0);deliver(unreviewed,3,unreviewed.p.weeks[3].sessions.filter(live).map(s=>obs(unreviewed.p,s)));
 step(unreviewed,{...at(unreviewed.p,4,0,'07:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...unreviewed.p.canonical.athlete.equipment,'BANDS']}},{allow:true});
 assert.deepEqual(rowsOf(unreviewed,4),rowsOf(reviewed,4),'strength');assert.deepEqual(runRows(unreviewed,4),runRows(reviewed,4),'run');
});

test('QE-R7ASC-04 (return week): the review that closes a return\'s own week and a later no-op decision resolve the same next week',()=>{
 for(const missed of [false,true]){
  const cell=equip=>{N=0;const t=start('t7da-rw',2),s0=t.p.weeks[2].startDate,end=addDays(s0,16),rep=addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=addDays(x.startDate,6));
   step(t,at(t.p,W,Math.round((Date.parse(rep)-Date.parse(t.p.weeks[W].startDate))/864e5),'06:00:00',brk(s0,end)));
   step(t,at(t.p,W,6,'21:00:00',{observations:t.p.weeks[W].sessions.filter(s=>live(s)&&s.date>=rep&&!(missed&&s.sport==='RUN'&&s.role==='LONG')).map(s=>obs(t.p,s))}));
   if(equip)step(t,{...at(t.p,W+1,0,'06:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...t.p.canonical.athlete.equipment,'BANDS']}},{allow:true});
   return {strength:rowsOf(t,W+1),run:runRows(t,W+1)};};
  assert.deepEqual(cell(true),cell(false),missed?'long run missed':'executed');
 }
});

// ---------- QE-R7ASC-02: progression authority on the run. Projected run progress is never a start ----------

/** The judge's P02b, EMPTY shape: weeks 0..k-1 trained and reviewed, weeks k and k+1 with nothing executed; U leaves week k unreviewed, R reviews it. */
const emptyWeeks=(id,k,o,cellName)=>{N=0;const t=gen({id,...o});for(let w=0;w<k;w++)weekly(t,w);if(cellName==='R')weekly(t,k,()=>false);weekly(t,k+1,()=>false);return t;};
for(const [name,o,k] of [['EASY',{},1],['EASY',{},4],['WALK_JOG',WJ,2],['WALK_JOG',WJ,10]])
 test(`QE-R7ASC-02 (P02b ${name}, k=${k}): two unexecuted weeks earn nothing; the plan starts from history, reviewed or not`,()=>{
  const U=emptyWeeks('t7da-p02-'+name,k,o,'U'),R=emptyWeeks('t7da-p02-'+name,k,o,'R'),H=history(U,k+2,0).state.run;
  assert.deepEqual(runCore(U.p.stateTrace[k+2].run),runCore(H),'the plan two weeks on is history\'s run (no projected step, unlock or counter)');
  assert.deepEqual(runRows(U,k+2),runRows(R,k+2),'and the same rows whether or not week k was reviewed');
  if(name==='WALK_JOG')assert.equal(U.p.stateTrace[k+2].run.mode,'WALK_JOG','no graduation to continuous running without executed ladder weeks');
 });

test('P3 no calendar progression: weeks passing with nothing executed leave EarnedProgress unchanged, and the plan starts from it',()=>{
 // Weeks 0-2 executed and reviewed; weeks 3 and 4 pass with nothing reported and no review; an empty review closes week 5 and plans week 6.
 N=0;const t=start('t7da-p3',3),before=history(t,3,0);
 step(t,at(t.p,5,6,'21:00:00',{observations:[]}));
 const after=history(t,6,0),EARNED=['easy','long','qualityStep','thresholdDone','specificStep','easyWeeksDone','stridesDone','walkStep','devCount','walks'];
 for(const k of EARNED)assert.deepEqual(after.state.run[k],before.state.run[k],'history: run '+k);
 for(const [id,e] of Object.entries(before.strength.exercises))assert.deepEqual([after.strength.exercises[id].lastExecutedLoad,after.strength.exercises[id].earnedProgress],[e.lastExecutedLoad,e.earnedProgress],id);
 for(const k of EARNED)assert.deepEqual(t.p.stateTrace[6].run[k],before.state.run[k],'the plan\'s start for week 6: run '+k);
});

// ---------- QE-R7ASC-03: gate precedence and temporal credit ----------

/** The judge's P05: a moderate (17-day) break reported Thursday 06:00, re-entry this week; Thursday's easy run executed; Sunday's long run as `shape`. */
function p05(shape){N=0;const t=start('t7da-p05',2),s0=t.p.weeks[2].startDate,end=addDays(s0,16),rep=addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=addDays(x.startDate,6));
 step(t,at(t.p,W,3,'06:00:00',brk(s0,end)));
 const thu=t.p.weeks[W].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.day===3),sun=t.p.weeks[W].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.day===6),sat=t.p.weeks[W].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.day===5);
 step(t,at(t.p,W,3,'12:00:00',{observations:thu.map(s=>obs(t.p,s))}));
 const thursday=historyAt(t,`${addDays(t.p.weeks[W].startDate,3)}T22:00:00Z`);
 step(t,at(t.p,W,5,'21:00:00',{observations:sat.map(s=>obs(t.p,s))}));
 const r=step(t,at(t.p,W,6,'21:00:00',{observations:shape==='MISSED'?[]:sun.map(s=>obs(t.p,s))}));
 return {t,W,thursday,gate:r.gates?.EASY??null,next:history(t,W+1,0).state.run,rows:runRows(t,W+1)};}
test('QE-R7ASC-03 (P05, P05b): a missed long run holds the return; a run not yet due is never credited',()=>{
 const X=p05('EXEC'),M=p05('MISSED');
 assert.equal(M.gate,'HOLD','the shared re-entry gate holds when the long run was missed');
 assert.equal(M.next.returnStep,0,'history holds the return step');
 const long=rows=>Math.max(...rows.filter(r=>r.startsWith('LONG')).map(r=>Number(r.split(':')[1])));
 assert.ok(long(M.rows)<=20,`the next long run does not jump (${M.rows.join(' ')})`);
 assert.equal(X.next.returnStep,1,'executed after the return\'s point, the week is credited (C5)');
 for(const x of [X,M]){assert.notEqual(x.thursday.basis.RUN,'COMPLETED_SESSIONS','Thursday 22:00: Sunday\'s run is not yet due, so the week is not complete');assert.equal(x.thursday.run.returnStep??x.thursday.state.run.returnStep,0);}
});

test('P4 gate order independence: a held role holds the shared re-entry gate whether it is read first or last',()=>{
 // A moderate break reported Monday 06:00, re-entry this week, every session after the return's point: the long run (read first) or an easy run
 // (read later) missed, everything else executed.
 const cell=role=>{N=0;const t=start('t7da-p4',2),s0=t.p.weeks[2].startDate,end=addDays(s0,13),rep=addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=addDays(x.startDate,6));
  step(t,at(t.p,W,0,'06:00:00',brk(s0,end)));
  const runs=t.p.weeks[W].sessions.filter(s=>live(s)&&s.sport==='RUN'),miss=runs.find(s=>s.role===role)??runs.at(-1);
  const r=step(t,at(t.p,W,6,'21:00:00',{observations:t.p.weeks[W].sessions.filter(s=>live(s)&&s.id!==miss.id).map(s=>obs(t.p,s))}));
  return {mode:t.p.stateTrace[W]?.run?.mode,gate:r.gates?.EASY,next:history(t,W+1,0).state.run.returnStep};};
 const L=cell('LONG'),E=cell('EASY');
 assert.equal(L.mode,'RETURN');assert.deepEqual([L.gate,E.gate],['HOLD','HOLD']);assert.deepEqual([L.next,E.next],[0,0]);
});

test('P5 future session is not fact: a later run of the week never credits progression before it is executed',()=>{
 const X=p05('EXEC'),h=X.thursday;
 assert.equal(h.state.run.returnStep,0);assert.ok(['RETURN_ENTRY'].includes(h.basis.RUN),h.basis.RUN);
});

test('QE-R7ASC-03 (missed long run outside a re-entry): unexecuted long runs never step the next one because the projection was ahead',()=>{
 // Weeks 0-3 executed and reviewed. Weeks 4 and 5 (development) executed except their long runs, reported day by day and never reviewed; an
 // empty review closes week 5. The projection had stepped week 5's long run from the unexecuted week 4; the next long run stays at history's.
 N=0;const t=start('t7da-long',4),earned=history(t,4,0).state.run.long,longOf=w=>t.p.weeks[w].sessions.find(s=>live(s)&&s.role==='LONG')?.prescription?.durationMinutes;
 assert.ok(longOf(5)>earned,`the projection runs ahead (${longOf(5)} against ${earned})`);
 for(const w of [4,5])for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&s.role!=='LONG'))step(t,at(t.p,w,s.day,'21:30:00',{observations:[obs(t.p,s)]}));
 weekly(t,5,()=>false,{},'22:00:00');
 assert.ok(longOf(6)<=earned,`no long run executed since: the next is ${longOf(6)}, history's ${earned}`);
 assert.ok(t.p.stateTrace[6].run.long<=earned,`and the plan resolves week 6 from it (${t.p.stateTrace[6].run.long}), whatever ceiling trims the row`);
 assert.equal(history(t,6,0).state.run.long,earned,'history earned no long-run step');
});

// ---------- SSCTR F4: the walk/jog return ceiling ----------

/** The SSCTR's walk/jog probe (WALK_JOG_FIVE_DAYS): a SHORT break from Tuesday of week `first`, reported Thursday of the next week; that week's
 * sessions from the report on executed and reviewed; the held week executed by `variant`; then a second break, SHORT or MODERATE. */
function walkjogCell(timeline,variant,second){
 const T={CONS:{first:2,held:4,second:5},DEV:{first:1,held:3,second:4}}[timeline],g=generateProgram(structuredClone({...PROFILES,...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS),opts),t={p:g.program,ledger:[]};N=0;
 for(let w=0;w<T.first;w++)weekly(t,w);
 const b1=addDays(t.p.weeks[T.first].startDate,1);weekly(t,T.first,s=>s.date<b1,{},'06:30:00');
 const rd=addDays(t.p.weeks[T.first+1].startDate,3);step(t,at(t.p,T.first+1,3,'07:00:00',brk(b1,addDays(rd,-1))));weekly(t,T.first+1,s=>s.date>=rd);
 for(let w=T.first+2;w<T.held;w++)weekly(t,w);
 const first=t.p.weeks[T.held].sessions.filter(x=>live(x)&&isWJ(x))[0]?.id;
 weekly(t,T.held,{ALL:()=>true,ONE_MISSED:s=>s.id!==first,NONE:s=>!isWJ(s)}[variant]);
 const W=T.second,b2=addDays(t.p.weeks[W].startDate,1);weekly(t,W,s=>s.date<b2,{},'06:30:00');
 if(second==='SHORT')step(t,at(t.p,W,6,'07:00:00',brk(b2,addDays(t.p.weeks[W].startDate,5))));else step(t,at(t.p,W+1,6,'07:00:00',brk(b2,addDays(b2,11))));
 const ran=t.p.weeks.flatMap(w=>w.sessions.filter(s=>live(s)&&isWJ(s)&&t.ledger.some(o=>o.sessionId===s.id&&!o.superseded))).sort((a,b)=>a.date<b.date?-1:1),last=ran.at(-1).progression.value;
 return {last,back:wjSteps(t,second==='SHORT'?W+1:W+2),allowed:second==='SHORT'?last:Math.max(0,last-1)};}
for(const [timeline,variant,second] of [['CONS','NONE','SHORT'],['CONS','ALL','SHORT'],['CONS','ONE_MISSED','MODERATE'],['DEV','ONE_MISSED','SHORT'],['DEV','NONE','MODERATE']])
 test(`SSCTR F4 (${timeline}/${variant}/${second}): after a held or consolidation week, a later walk/jog return resumes no higher than its recipe`,()=>{
  const c=walkjogCell(timeline,variant,second);
  assert.ok(c.back.length&&c.back.every(x=>x<=c.allowed),`first week back ${c.back} against the step last run ${c.last} (recipe allows ${c.allowed})`);
 });

/** A walk/jog athlete runs the ladder for weeks 0..ran-1 (reviewed), misses every walk/jog session of the next week (its step never run), then a
 * SHORT (5-day) or MODERATE (14-day) break from Tuesday. */
function ladderBreak(cls,{ran=3,miss=true}={}){N=0;const t=gen({id:'t7da-wj',...WJ});for(let w=0;w<ran;w++)weekly(t,w);
 const planned=wjSteps(t,ran);weekly(t,ran,miss?s=>!isWJ(s):()=>true);
 const d0=t.p.weeks[ran+1].startDate,end=addDays(d0,cls==='SHORT'?5:14),rep=addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=addDays(x.startDate,6));
 const r=step(t,at(t.p,W,Math.round((Date.parse(rep)-Date.parse(t.p.weeks[W].startDate))/864e5),'07:00:00',brk(addDays(d0,1),end))),d=r.proposal.decisions.at(-1);
 return {planned,history:history(t,ran+1,0).state.run.walkStep,entry:d.interruption.entry.run.walkStep,back:wjSteps(t,d.fromWeek)};}
test('P6 walk/jog ceiling: a return never starts above the step last run, however far history had moved',()=>{
 const S=ladderBreak('SHORT'),M=ladderBreak('MODERATE');
 assert.deepEqual(S.planned,[3]);assert.equal(S.history,3,'the step after the last one run is earned, never run');
 assert.equal(S.entry,2,'SHORT: the step last run');assert.deepEqual(S.back,[2]);
 assert.equal(M.entry,1,'MODERATE: one below the step last run');assert.deepEqual(M.back,[1]);
});
test('P7 execution promotion: once the athlete runs the next step, a return resumes from it',()=>{
 const S=ladderBreak('SHORT',{miss:false});
 assert.equal(S.entry,3,'step 3 run: it is the tolerated step now');
});

// ---------- Kept: the approved HOLD and MAINTAIN doses (Founder decisions 1.3, §23) ----------

test('HOLD (Founder 1.3): 82.5 x 3 against the current line 82.5 x 5 holds 82.5 x 5, with no progression credit',()=>{
 N=0;const t=start('t7da-hold',1),BS='back-squat';
 // Week 1 lifts 80 x 5 again: the second exposure at 80 releases 82.5 (LOAD), the current line of week 2.
 const line=rowsOf(t,2,()=>true,[BS]);assert.deepEqual(line.map(r=>[r.value,r.reps]),[[82.5,5]],'the current prescribed line');
 weekly(t,2,()=>true,s=>({set:(id,x)=>id===BS?{...x,reps:3}:x}));
 assert.equal(t.last.gates[BS],'HOLD');
 assert.deepEqual(rowsOf(t,3,()=>true,[BS]).map(r=>[r.value,r.reps]),[[82.5,5]],'the HOLD repeats the line: 82.5 x 5');
 assert.equal(t.p.stateTrace[3].strength.exercises[BS].loadTick,0,'no progression credit');
});

test('MAINTAIN (Founder §23): 70 x 10 executed, the projection at 70 x 12, a change to MAINTAIN (8): 70 x 8, with no future progression',()=>{
 for(const reviewed of [true,false]){
  N=0;const t=gen({id:'t7da-maintain',goal:'HYPERTROPHY',known:[K('back-squat',3,8,70),K('db-bench-press',3,8,18,'PER_HAND')]}),BS='back-squat';weekly(t,0);
  if(reviewed)weekly(t,1);else deliver(t,1,t.p.weeks[1].sessions.filter(live).map(s=>obs(t.p,s)));
  step(t,at(t.p,1,6,'22:30:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'MAINTAIN'},from:t.p.weeks[2].startDate}}));
  const rows=[2,3,4].flatMap(w=>rowsOf(t,w,()=>true,[BS])),[,hi]=DOSES.MAINTAIN.repRange;
  assert.equal(t.p.goal.strength.kind,'MAINTAIN');
  assert.ok(rows.length&&rows.every(r=>r.mode==='KNOWN'&&r.value===70&&r.reps===hi),`${reviewed?'reviewed':'unreviewed'}: ${JSON.stringify(rows.map(r=>[r.value,r.reps]))}`);
 }
});
