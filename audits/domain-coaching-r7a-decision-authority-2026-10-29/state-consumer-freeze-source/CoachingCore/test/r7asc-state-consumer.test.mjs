// COACHING CORE — STATE MODEL CONSUMER CLOSURE: history ingress, semantic PlanningView and temporal evidence (Founder request 2026-10-29;
// audits/domain-coaching-r7a-state-consumer-2026-10-29/STATE_CONSUMER_CONTRACT.md). First the seven findings of the two independent reviews of
// HISTORICAL-PROJECTION-FREEZE-1, reproduced on the judges' own scenarios; then the Founder's H1-H5, S1-S6, T1-T5 and P1-P7; then the three
// defects this mission found on its way (a gate counting later logs, the public reader in the last week, a run re-entry crediting a step it did not
// run). Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {programHash} from '../src/r6-program.mjs';
import {hash} from '../src/value.mjs';
import {evaluateHoldoutCase} from '../scripts/evaluate-holdout-r6.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import * as SIM from '../src/r6-simulator.mjs';
import * as TRAJ from '../r6/fixtures/trajectories.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const opts={authority:devAuthority()},DOSES=opts.authority.policy.operational.strength.goalDoses;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const DEFAULT_KNOWN=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')];
const intake=({id,goal='STRENGTH',known=DEFAULT_KNOWN,recent={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2,...recent},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7sc-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s as prescribed; kg(id,e) picks a logged load, set(id,x,e) edits each set, noDetails drops the exercises, observedAt and
 * extra (reportedAt, correctionOf, ...) set the report's clocks and provenance. */
function obs(p,s,{kg=null,set=null,noDetails=false,actual=null,observedAt=null,extra={}}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&!noDetails)a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`t7sc-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:observedAt??`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK},...extra};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??'')}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2;
const weekly=(t,w,keep=()=>true,o={},hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
/** Each session reported on its own evening and Sunday's on Monday 06:00, so the week itself is never reviewed. */
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const gen=o=>{const g=generateProgram(intake(o),opts);assert.ok(g.program,`${o.id}: ${g.status} ${g.reason}`);return {p:g.program,ledger:[]};};
const start=(id,weeks,o={})=>{const t=gen({id,...o});for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:structuredClone(t.p),ledger:structuredClone(t.ledger)});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const history=(t,w,day=0,hour='06:00:00',ledger=t.ledger)=>historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:ledger},opts);
const hex=(H,id)=>H?.strength?.exercises?.[id]??null;
const rowsOf=(t,w,pred=()=>true,ids=null)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&pred(s)).flatMap(s=>s.prescription.exercises.filter(e=>!ids||ids.includes(e.id)).map(e=>({id:e.id,date:s.date,mode:e.load.mode,value:e.load.value??null,reps:e.reps,sets:e.sets,kind:e.exposure?.kind??null})));
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.progression?.dimension??''}=${s.progression?.value??''}`);
/** The record of facts a cell holds (ids, sessions, clocks, payloads, correction chain), so two cells can be shown to hold the same one. */
const record=t=>hash(t.ledger.map(o=>({eventId:o.eventId,sessionId:o.sessionId,observedAt:o.observedAt,actual:o.actual,correctionOf:o.correctionOf??null,superseded:!!o.superseded,conflicted:!!o.conflicted})).sort((a,b)=>a.eventId<b.eventId?-1:1));
/** A what-if SHORT return in week w (Tuesday-Wednesday, reported Thursday 06:00): its entry is the internal reducer's HistoricalState at the break. */
const whatIfEntry=(t,w,id)=>{const x=copy(t),r=step(x,at(x.p,w,3,'06:00:00',brk(addDays(x.p.weeks[w].startDate,1),addDays(x.p.weeks[w].startDate,2))));return r.proposal.decisions.at(-1).interruption.entry.strength.exercises[id]??null;};
const RDL='db-rdl';

// ---------- QE-R7ASM-01: a prescription never establishes HistoricalState (the judge's Q3, Q3b and Q12a) ----------

const Q3V={noDetails:{noDetails:true},repsNoLoad:{set:(id,x)=>id===RDL?{reps:x.reps,rir:x.rir}:x},unknownUnit:{set:(id,x)=>id===RDL?{...x,load:{...x.load,unit:'STONE'}}:x},loggedAt18:{kg:(id,e)=>id===RDL?18:(e.load.mode==='KNOWN'?e.load.value:20)}};
/** Week 2's reports, built once from a reference program (no correction), so every cell sends the identical observations. */
function q3Week2(v){N=0;const t=gen({id:'t7sc-q3'});weekly(t,0);const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s),eventId:`q3-w1-${i}`}));step(t,at(t.p,1,6,'21:00:00',{observations:w1}));
 return t.p.weeks[2].sessions.filter(live).map((s,i)=>({...obs(t.p,s,SAT(s)?v:{}),eventId:`q3-w2-${i}`}));}
/** db-rdl established at 20 kg in weeks 0-1, then corrected away ("I did not do the RDLs"): EARLY with week 1's review, LATE on Monday 07:00 of
 * week 2 after its rows were planned from the uncorrected evidence. Week 2 reported identically in every cell: reviewed, or (factsOnly) sent on
 * Monday of week 3 so that no decision closes week 2. */
function q3(cell,w2,{factsOnly=false}={}){N=0;const t=gen({id:'t7sc-q3'});weekly(t,0);
 const w1=t.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(t.p,s),eventId:`q3-w1-${i}`}));
 const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===RDL)));
 const originals=[...t.ledger.filter(o=>o.logs?.[RDL]&&!o.superseded),...w1.filter(has)],correctedAt=`${addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
 const fixes=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==RDL)},response:{...o.response}}));
 if(cell==='EARLY')step(t,at(t.p,1,6,'21:00:00',{observations:[...w1,...fixes]}));else{step(t,at(t.p,1,6,'21:00:00',{observations:w1}));step(t,at(t.p,2,0,'07:00:00',{observations:fixes}));}
 const rows2=rowsOf(t,2,SAT,[RDL]);
 step(t,factsOnly?at(t.p,3,0,'06:00:00',{observations:structuredClone(w2)}):at(t.p,2,6,'21:00:00',{observations:structuredClone(w2)}));
 return {t,rows2};}
for(const [name,v] of Object.entries(Q3V))test(`QE-R7ASM-01 (${name}): a KNOWN row planned from retracted evidence establishes nothing; history does not depend on when the correction reached the plan`,()=>{
 const w2=q3Week2(v),E=q3('EARLY',w2),L=q3('LATE',w2);
 assert.equal(record(E.t),record(L.t),'the two cells hold the same record of facts');
 assert.equal(L.rows2[0].mode,'KNOWN','the LATE cell planned a KNOWN 20 row before the correction reached it');
 assert.equal(E.rows2[0].mode,'ESTABLISH','the EARLY cell planned the establishment');
 const he=history(E.t,3,0),hl=history(L.t,3,0);
 // The atoms of what was established: whether the exercise is held, its mode, load, pending log, unlogged flag, source, dates and the lift. The
 // largest whole count executed (lastExecutedSets) is the prescribed count the athlete executed (SSCTR D49, R20): the cells' rows prescribed 2 and
 // 3 sets and the athlete logged 3 in both, so it follows the prescription by design, never above what was executed (contract §5).
 const est=H=>{const h=hex(H,RDL),s=H.state.strength.exercises[RDL];if(!h)return null;const {lastExecutedSets,...facts}=h;return {facts,state:{mode:s.mode,load:s.load??null,pendingLoad:s.pendingLoad??null,unlogged:!!s.unlogged,source:s.source,lastPerformed:s.lastPerformed??null,loadTick:s.loadTick??0}};};
 assert.deepEqual(est(hl),est(he),'HistoricalState is the same');
 assert.ok(!hex(hl,RDL)||hex(hl,RDL).lastExecutedLoad===null,'no prescribed load is a historical load');
 assert.notEqual(hl.state.strength.exercises[RDL]?.mode,'KNOWN','the row\'s KNOWN 20 never becomes the state');
 assert.deepEqual(rowsOf(L.t,3,SAT,[RDL]),rowsOf(E.t,3,SAT,[RDL]),'the next decision prescribes the same establishment');
 const entry=x=>{if(!x)return null;const {lastExecutedSets,...rest}=x;return rest;};
 assert.deepEqual(entry(whatIfEntry(L.t,3,RDL)),entry(whatIfEntry(E.t,3,RDL)),'a return resumes the same state');
 if(name==='loggedAt18'){const s=hl.state.strength.exercises[RDL];assert.equal(s.mode,'FROM_LOG');assert.equal(s.pendingLoad,18,'a first log waits for confirmation (SSCTR D45)');assert.equal(hex(hl,RDL).liftedLoad,18,'the lift is a fact');}
});
test('QE-R7ASM-01 (facts only, Q12a): the same when the week is never reviewed',()=>{
 const w2=q3Week2(Q3V.noDetails),E=q3('EARLY',w2,{factsOnly:true}),L=q3('LATE',w2,{factsOnly:true});
 assert.equal(record(E.t),record(L.t));
 const hl=history(L.t,3,0,'06:30:00'),he=history(E.t,3,0,'06:30:00');
 assert.deepEqual(hl.state.strength.exercises[RDL]??null,he.state.strength.exercises[RDL]??null);
 assert.notEqual(hl.state.strength.exercises[RDL]?.mode,'KNOWN','the facts-only reading takes no prescribed load either');
 assert.deepEqual(whatIfEntry(L.t,3,RDL),whatIfEntry(E.t,3,RDL));
});
test('QE-R7ASM-01 (conflict, Q3b): a late wearable record that quarantines the establishing session leaves no prescribed load in history',()=>{
 const cells={};
 // Week 1's reports, built once from a reference program in which db-rdl is KNOWN 20 (confirmed), sent identically in both cells.
 N=0;const ref=gen({id:'t7sc-q3b'}),r0=ref.p.weeks[0].sessions.filter(live).map((s,i)=>({...obs(ref.p,s),eventId:`q3b-w0-${i}`}));
 step(ref,{...at(ref.p,0,6,'21:00:00',{observations:r0}),loadConfirmations:[{exerciseId:RDL,value:20,unit:'KG',convention:'PER_HAND'}]});
 const w1=ref.p.weeks[1].sessions.filter(live).map((s,i)=>({...obs(ref.p,s,SAT(s)?{noDetails:true}:{}),eventId:`q3b-w1-${i}`}));
 for(const cell of ['ORDERED','LATE']){
  N=0;const t=gen({id:'t7sc-q3b'}),w0=t.p.weeks[0].sessions.filter(live).map((s,i)=>({...obs(t.p,s),eventId:`q3b-w0-${i}`}));
  const sat0=t.p.weeks[0].sessions.find(SAT),manual=w0.find(o=>o.sessionId===sat0.id);
  const wearable={eventId:'q3b-w0-wearable',athleteId:t.p.athleteId,sessionId:sat0.id,observedAt:manual.observedAt,source:{provider:'HEALTHKIT',activityId:'hk-123',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:Math.round(manual.actual.minutes*0.6)},response:{...OK}};
  step(t,{...at(t.p,0,6,'21:00:00',{observations:cell==='ORDERED'?[...w0,wearable]:w0}),loadConfirmations:[{exerciseId:RDL,value:20,unit:'KG',convention:'PER_HAND'}]});
  const rows1=rowsOf(t,1,SAT,[RDL]);
  if(cell==='LATE')step(t,at(t.p,1,0,'07:00:00',{observations:[wearable]}));
  step(t,at(t.p,1,6,'21:00:00',{observations:structuredClone(w1)}));
  cells[cell]={t,rows1,H:history(t,2,0)};
 }
 assert.equal(record(cells.ORDERED.t),record(cells.LATE.t),'the same record');
 assert.equal(cells.LATE.rows1[0].mode,'KNOWN','the LATE cell planned week 1 from the confirmed, later quarantined, 20 kg');
 assert.deepEqual(cells.LATE.H.state.strength.exercises[RDL]??null,cells.ORDERED.H.state.strength.exercises[RDL]??null);
 assert.notEqual(cells.LATE.H.state.strength.exercises[RDL]?.mode,'KNOWN');
 assert.deepEqual(whatIfEntry(cells.LATE.t,2,RDL),whatIfEntry(cells.ORDERED.t,2,RDL));
});

// ---------- QE-R7ASM-02: the run of a restart reads history, as a moderate return does (the judge's Q4, Q4b) ----------

test('QE-R7ASM-02: with identical ledgers, a LONG return (RESTART) and a MODERATE one (RETURN) plan the same run whether or not the empty week was reviewed',()=>{
 for(const [variant,days] of [['LONG',35],['MODERATE',20]]){
  const res={};
  for(const cell of ['U','C']){
   N=0;const t=start('t7sc-q4',3),s0=t.p.weeks[3].startDate,end=addDays(s0,days-1),reportDay=addDays(end,1);
   const rw=t.p.weeks.findIndex(x=>reportDay>=x.startDate&&reportDay<=addDays(x.startDate,6));
   step(t,at(t.p,rw,Math.round((Date.parse(reportDay)-Date.parse(t.p.weeks[rw].startDate))/864e5),'06:00:00',brk(s0,end)));
   const R=t.p.decisions.at(-1).fromWeek;
   if(cell==='C')weekly(t,R,()=>false);
   weekly(t,R+1,()=>false);
   res[cell]={ledger:hash(t.ledger.map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt}))),plan:t.p.stateTrace[R+2].run,history:history(t,R+2,0).state.run,rows:runRows(t,R+2),t,R};
  }
  assert.equal(res.U.ledger,res.C.ledger,variant+': identical ledgers');
  for(const k of ['mode','restart','returnStep','easy','long'])assert.deepEqual(res.U.plan[k]??null,res.C.plan[k]??null,`${variant}: the plan's ${k} does not depend on whether the empty week was reviewed`);
  assert.deepEqual(res.U.rows,res.C.rows,variant+': the same runs');
  for(const k of ['mode','restart','returnStep'])assert.deepEqual(res.U.plan[k]??null,res.U.history[k]??null,`${variant}: the plan's ${k} is history's`);
  // Q4b: executing every run as prescribed from then on keeps the two cells together, week after week.
  for(const c of ['U','C'])for(let w=res[c].R+2;w<res[c].R+6;w++)weekly(res[c].t,w);
  for(let w=res.U.R+2;w<res.U.R+7;w++)assert.deepEqual(runRows(res.U.t,w),runRows(res.C.t,w),`${variant}: week ${w}`);
 }
});

// ---------- QE-R7ASM-03: in REPS_THEN_LOAD goals the repetitions are earned progress, read from history (the judge's Q11c, Q12b) ----------

test('QE-R7ASM-03: with identical ledgers, a decision after two empty weeks prescribes the repetitions history earned, not the projection\'s steps',()=>{
 for(const goal of ['HYPERTROPHY','GENERAL','RUNNING_SUPPORT']){
  const rows={},hist={};
  for(const cell of ['U','R']){N=0;const t=gen({id:'t7sc-q11c',goal});for(let w=0;w<4;w++)weekly(t,w);if(cell==='R')weekly(t,4,()=>false);weekly(t,5,()=>false);rows[cell]=rowsOf(t,6);hist[cell]=history(t,6,0).state.strength.exercises;}
  assert.deepEqual(hist.U,hist.R,goal+': history is the same');
  assert.deepEqual(rows.U,rows.R,goal+': so is the dose prescribed after the facts');
 }
});

// ---------- QE-R7ASM-04: the public reader reads the canonical record (the judge's Q2, Q2b) ----------

test('QE-R7ASM-04: historicalStateOf reads a corrected load and a retracted session as the runtime does, never the superseded row',()=>{
 // Q2b: week 4's Saturday reported at 22 kg (row KNOWN 20, target met), then corrected the next day: it was 20 kg.
 N=0;const t=start('t7sc-q2b',2);perDay(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));
 const sat=t.p.weeks[4].sessions.find(SAT),first=obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});
 step(t,at(t.p,4,5,'21:00:00',{observations:[first]}));
 const fix=at(t.p,4,6,'21:00:00');step(t,{...fix,observations:[{...obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:`${addDays(t.p.weeks[4].startDate,6)}T20:00:00Z`}]});
 assert.ok(t.ledger.some(o=>o.eventId===first.eventId&&o.superseded),'the record carries the superseded row');
 const H=history(t,5,0),h=hex(H,RDL);
 assert.equal(h.lastExecutedLoad,20);assert.equal(h.liftedLoad,20,'the corrected lift');assert.equal(H.state.strength.exercises[RDL].load,20);
 assert.equal(whatIfEntry(t,5,RDL).load,20,'the internal reducer agrees');
 // Q2: a session reported done, then corrected to not done.
 N=0;const u=start('t7sc-q2',2);perDay(u,2,s=>!SAT(s));weekly(u,3,s=>!SAT(s));
 const sat4=u.p.weeks[4].sessions.find(SAT),done=obs(u.p,sat4);step(u,at(u.p,4,5,'21:00:00',{observations:[done]}));
 const fix2=at(u.p,4,6,'21:00:00');step(u,{...fix2,observations:[{...obs(u.p,sat4),eventId:done.eventId+'-fix',observedAt:done.observedAt,correctionOf:done.eventId,correctedAt:`${addDays(u.p.weeks[4].startDate,6)}T20:00:00Z`,actual:{completed:false,minutes:0}}]});
 assert.equal(hex(history(u,5,0),RDL).lastPerformedAt,'2026-11-14','the retracted session performed nothing');
});

// ---------- SSCTR F1: a return-covered count never comes back faster than the recipe (D53, D57) ----------

/** The SSCTR restoration grid's timeline sg-ret16thu-<goal>-K-3-20-after3: three 20-minute strength days, a 16-day break reported on Thursday of week
 * 6, every week executed as prescribed and reviewed, the budget raised to 75 minutes after the third week back. Returns the B violations: a
 * count more than one set above the largest executed since the break, for an exercise a cap or the return steps covered. */
function f1(goal){
 N=0;const KNOWN3=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
 const g=generateProgram(intake({id:'t7sc-f1-'+goal,goal,known:KNOWN3,recent:{runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:3},schedule:{runDays:[1,5,6],strengthDays:[0,2,4],runMinutes:50,strengthMinutes:20,longRunDay:6,longRunMinutes:80}}),opts);
 const t={p:g.program,ledger:[]},grid=(p,s)=>{const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`f1-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:a,response:{...OK}};};
 const wk=(w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>grid(t.p,s))}));
 for(let w=0;w<4;w++)wk(w);wk(4,s=>s.day<=2);wk(5,()=>false);
 const d=addDays(t.p.weeks[6].startDate,3);step(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const largest={},covered=new Set(),B=[],sets={};
 for(let w=6;w<15;w++){
  for(const [x,ex] of Object.entries(t.p.stateTrace[w].strength.exercises))if(Number.isInteger(ex.setCap)||Number.isInteger(ex.regainCap)||Number.isInteger(ex.returnStep))covered.add(x);
  const from=w===6?3:0,rows=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.day>=from).flatMap(s=>s.prescription.exercises);
  for(const e of rows){(sets[e.id]??=[]).push(`w${w}:${e.sets}`);if(covered.has(e.id)&&Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)B.push({week:w,id:e.id,sets:e.sets,largest:largest[e.id]});}
  wk(w,s=>s.day>=from);if(w===9)step(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
  for(const e of rows)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
 return {B,sets};
}
test('SSCTR F1 (D53, D57): after a mid-week return, no covered count comes back more than one set above the largest executed since the break',()=>{
 for(const goal of ['STRENGTH','HYPERTROPHY']){const {B,sets}=f1(goal);assert.deepEqual(B,[],`${goal}: ${JSON.stringify(B)} ${JSON.stringify(sets['db-overhead-press'])}`);}
});

// ---------- SSCTR F2: HOLD repeats the dose it held, on the R42 path too (the SSCTR's repetition probe) ----------

test('SSCTR F2: a load the plan stepped above history, lifted short or at low reserve, is held at its prescribed repetitions, inside the range',()=>{
 const [lo,hi]=DOSES.STRENGTH.repRange;
 for(const [name,v] of Object.entries({missedBy2:{reps:r=>Math.max(1,r-2),rir:x=>x},aboveTargetLowReserve:{reps:r=>r+3,rir:()=>0}})){
  N=0;const base=gen({id:'t7sc-f2',known:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')]});weekly(base,0);weekly(base,1);
  perDay(base,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value-2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});
  const row3=rowsOf(base,3,WED,['back-squat'])[0];assert.equal(row3.value,82.5,'the projection stepped to 82.5 while history holds the lighter lift');
  const mk=s=>WED(s)?{set:(id,x,e)=>id==='back-squat'?{...x,reps:v.reps(e.reps),rir:v.rir(e.rir)}:x}:{};
  const R=copy(base);weekly(R,3,()=>true,mk);
  assert.equal(R.last.gates['back-squat'],'HOLD',name+': the gate holds');
  for(let w=4;w<7;w++)weekly(R,w);
  const after=[4,5,6,7].flatMap(w=>rowsOf(R,w,()=>true,['back-squat']));
  assert.ok(after.every(r=>r.reps>=lo&&r.reps<=hi),`${name}: inside ${lo}-${hi}: ${JSON.stringify(after)}`);
  assert.deepEqual(rowsOf(R,4,()=>true,['back-squat']).map(r=>[r.value,r.reps]),[[82.5,5]],name+': the held dose, 82.5 x 5');
 }
});

// ---------- SSCTR F3: after a goal change to MAINTAIN the dose is the goal's, from the executed one (R6-H25) ----------

test('SSCTR F3 (R6-H25): after the change to MAINTAIN no bench press or lat pulldown row leaves 8-8 or rises above the dose executed',()=>{
 const item=JSON.parse(fs.readFileSync(new URL('../r6/holdout/R6_INDEPENDENT_HOLDOUT.json',import.meta.url),'utf8')).cases.find(c=>c.caseId==='R6-H25');
 const r=evaluateHoldoutCase(structuredClone(item),opts),P=r.steps.at(-1).result.proposal,[,hi]=DOSES.MAINTAIN.repRange;
 assert.equal(P.goal.strength.kind,'MAINTAIN');
 const rows=P.weeks.slice(7).flatMap(w=>w.sessions.filter(live).filter(s=>s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>['bench-press','lat-pulldown'].includes(e.id)).map(e=>({w:w.index,id:e.id,reps:e.reps,mode:e.load.mode,value:e.load.value??null}))));
 assert.ok(rows.length>0);
 assert.ok(rows.every(x=>x.reps<=hi),JSON.stringify(rows.filter(x=>x.reps>hi)));
 assert.ok(rows.every(x=>x.mode!=='KNOWN'||x.value<=70),'never above the load executed');
});

// ---------- H1-H5: history ingress ----------

test('H1: a projected KNOWN load without a factual load gives history no load',()=>{
 const w2=q3Week2(Q3V.noDetails),{t,rows2}=q3('LATE',w2),H=history(t,3,0);
 assert.equal(rows2[0].mode,'KNOWN');assert.equal(rows2[0].value,20,'the plan prescribed 20');
 assert.ok(!hex(H,RDL)||hex(H,RDL).lastExecutedLoad===null);
 assert.notEqual(H.state.strength.exercises[RDL]?.load,20);
});
test('H2: a valid factual load is history, exactly',()=>{
 N=0;const t=start('t7sc-h2',1),wed=t.p.weeks[1].sessions.find(WED),row=rowsOf(t,1,WED,['back-squat'])[0];
 weekly(t,1);
 const h=hex(history(t,2,0),'back-squat');
 assert.equal(h.liftedLoad,row.value);assert.equal(h.lastExecutedLoad,row.value);assert.equal(h.lastPerformedAt,wed.date);
});
test('H3: the plan says 20, the athlete lifts 18: history is 18',()=>{
 N=0;const t=start('t7sc-h3',2),row=rowsOf(t,2,SAT,[RDL])[0];assert.equal(row.mode,'KNOWN');
 weekly(t,2,()=>true,s=>SAT(s)?{kg:(id,e)=>id===RDL?row.value-2:(e.load.mode==='KNOWN'?e.load.value:20)}:{});
 const H=history(t,3,0);assert.equal(hex(H,RDL).liftedLoad,row.value-2);assert.equal(H.state.strength.exercises[RDL].load,row.value-2);
});
test('H4: the plan says 20, the lift has no readable load: history never invents 20',()=>{
 // History holds the lighter lift of an unreviewed week while the plan steps; the next exposure is logged in an unknown unit.
 N=0;const t=start('t7sc-h4',2);perDay(t,2,()=>true,s=>SAT(s)?{kg:(id,e)=>id===RDL?e.load.value-2:(e.load.mode==='KNOWN'?e.load.value:20)}:{});
 const held=history(t,3,0).state.strength.exercises[RDL].load,row=rowsOf(t,3,SAT,[RDL])[0];
 assert.ok(row.value>held,'the plan prescribes more than history holds');
 weekly(t,3,()=>true,s=>SAT(s)?{set:(id,x)=>id===RDL?{...x,load:{...x.load,unit:'STONE'}}:x}:{});
 assert.equal(history(t,4,0).state.strength.exercises[RDL].load,held,'the earlier factual load stands');
 // And for an exercise history does not hold: QE-R7ASM-01's unknown unit.
 const w2=q3Week2(Q3V.unknownUnit),L=q3('LATE',w2);assert.notEqual(history(L.t,3,0).state.strength.exercises[RDL]?.load,20);
});
test('H5: a correction removes the retracted value from every historical reader',()=>{
 N=0;const t=start('t7sc-h5',2);perDay(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));
 const sat=t.p.weeks[4].sessions.find(SAT),first=obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});
 step(t,at(t.p,4,5,'21:00:00',{observations:[first]}));
 assert.equal(hex(history(t,4,6),RDL).liftedLoad,22,'as first reported');
 const fix=at(t.p,4,6,'21:00:00');step(t,{...fix,observations:[{...obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:fix.asOf}]});
 for(const [label,H] of [['week 4, Sunday night',history(t,4,6,'23:00:00')],['week 5',history(t,5,0)],['week 5, mid-week',history(t,5,3,'12:00:00')]]){const h=hex(H,RDL);assert.equal(h.liftedLoad,20,label);assert.equal(h.lastExecutedLoad,20,label);assert.equal(H.state.strength.exercises[RDL].load,20,label);}
 assert.equal(whatIfEntry(t,5,RDL).load,20,'a return');
 // The plan the corrected record gives is the plan of a record that reported 20 kg from the start.
 N=0;const c=start('t7sc-h5',2);perDay(c,2,s=>!SAT(s));weekly(c,3,s=>!SAT(s));
 step(c,at(c.p,4,5,'21:00:00',{observations:[obs(c.p,c.p.weeks[4].sessions.find(SAT))]}));step(c,at(c.p,4,6,'21:00:00'));
 assert.deepEqual(rowsOf(t,5,()=>true),rowsOf(c,5,()=>true),'the plan');
});

// ---------- S1-S6: the resolved prescription ----------

test('S1 HOLD: a missed target repeats the dose, load and repetitions',()=>{
 N=0;const t=start('t7sc-s1',2),row=rowsOf(t,2,WED,['back-squat'])[0];
 weekly(t,2,()=>true,s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:x.reps-2}:x}:{});
 assert.equal(t.last.gates['back-squat'],'HOLD');
 const next=rowsOf(t,3,WED,['back-squat'])[0];assert.equal(next.value,row.value);assert.equal(next.reps,row.reps);
});
test('S2 MAINTAIN: after a goal change to maintenance every row of a known dose is inside 8-8',()=>{
 N=0;const t=start('t7sc-s2',2,{goal:'HYPERTROPHY',known:[K('back-squat',3,12,70),K('db-bench-press',3,12,18,'PER_HAND')]});
 step(t,{...at(t.p,2,0,'07:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'MAINTAIN'}}});
 assert.equal(t.p.goal.strength.kind,'MAINTAIN');
 for(let w=2;w<6;w++)weekly(t,w);
 const [,hi]=DOSES.MAINTAIN.repRange,rows=[3,4,5,6].flatMap(w=>rowsOf(t,w)).filter(r=>['KNOWN','FROM_LOG'].includes(r.mode));
 assert.ok(rows.length&&rows.every(r=>r.reps<=hi),JSON.stringify(rows.filter(r=>r.reps>hi)));
});
test('S3: a projection above history creates no unearned progression: load, tick and repetitions are history\'s',()=>{
 // Two development weeks executed but for Saturday's lift and never reviewed: the plan runs two steps ahead for the Saturday-only exercises.
 N=0;const t=start('t7sc-s3',5);perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));
 const P=t.p.stateTrace[7].strength.exercises[RDL],H=history(t,7,1).state.strength.exercises[RDL];
 assert.ok(P.load>H.load||(P.loadTick??0)>(H.loadTick??0),'the projection is ahead');
 // Week 7 reviewed with its Saturday lift missed: the review plans week 8 from the resolved dose, which is history's.
 weekly(t,7,s=>!SAT(s));
 const H8=history(t,8,0).state.strength.exercises[RDL],row=rowsOf(t,8,SAT,[RDL])[0],[,hi]=DOSES.STRENGTH.repRange;
 assert.equal(H8.load,H.load,'a missed exposure releases nothing');
 assert.deepEqual([row.value,row.reps],[H8.load,Math.min(H8.reps,hi)],'the decision prescribes history\'s dose, no step the projection assumed');
});
test('S4: a partial execution resolves only with the atoms it executed',()=>{
 N=0;const t=start('t7sc-s4',2),wed=t.p.weeks[2].sessions.find(WED),row=rowsOf(t,2,WED,['back-squat'])[0];
 // Two of the prescribed sets, at the prescribed load: a partial session.
 weekly(t,2,()=>true,s=>WED(s)?{actual:{completed:false,minutes:Math.round(wed.prescription.durationMinutes/2),exercises:wed.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:Math.max(1,e.sets-1)},()=>({load:{value:e.load.value??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}))}}:{});
 const h=hex(history(t,3,0),'back-squat');assert.equal(h.liftedLoad,row.value,'the load it lifted');assert.equal(h.lastPerformedAt,wed.date);
 const next=rowsOf(t,3,WED,['back-squat'])[0];assert.ok(next.value<=row.value&&next.reps<=row.reps,'no step on a partial session');
});
test('S5: a moderate return and a restart read the same facts; their differences come from their recipes only',()=>{
 // A break from Tuesday of week 4, reported Friday 07:00 of its last week, with the pre-return easy run of that week missed; the post-return runs
 // executed. Neither the return steps nor the restart minutes skip a dose the athlete did not run (the run side of F1).
 for(const [mode,days] of [['RETURN',16],['RESTART',35]]){
  N=0;const t=start('t7sc-s5-'+mode,4),s0=addDays(t.p.weeks[4].startDate,1),end=addDays(s0,days-1),rw=Math.floor(dayGapOf(t.p.startDate,end)/7);
  step(t,at(t.p,rw,4,'07:00:00',brk(s0,end)));
  weekly(t,rw,s=>s.date>=addDays(t.p.weeks[rw].startDate,4));
  for(let w=rw+1;w<rw+5;w++)weekly(t,w);
  const seq=[rw+1,rw+2,rw+3].map(w=>mode==='RETURN'?t.p.stateTrace[w].run.returnStep??'done':t.p.stateTrace[w].run.restart);
  if(mode==='RETURN')assert.deepEqual(seq,[0,1,'done'],'entry, then step 2, then the prior dose: no step skipped');
  else assert.deepEqual(seq,[15,20,25],'the restart minutes step from the minutes run');
  for(let w=rw+2;w<rw+5;w++)assert.deepEqual(t.p.stateTrace[w].run.mode==='EASY'?'EASY':t.p.stateTrace[w].run[mode==='RETURN'?'returnStep':'restart'],history(t,w,0).state.run.mode==='EASY'?'EASY':history(t,w,0).state.run[mode==='RETURN'?'returnStep':'restart'],`${mode} week ${w}: the plan is history`);
 }
});
const dayGapOf=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
test('S6: after a goal change the earlier goal\'s projected dose does not survive where it contradicts the new goal',()=>{
 N=0;const t=start('t7sc-s6',3,{goal:'HYPERTROPHY',known:[K('back-squat',3,12,70),K('db-bench-press',3,12,18,'PER_HAND')]});
 const before=rowsOf(t,4,()=>true,['back-squat'])[0];assert.ok(before.reps>8,'the hypertrophy plan prescribes more than 8');
 step(t,{...at(t.p,3,6,'22:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'MAINTAIN'}}});
 const [,hi]=DOSES.MAINTAIN.repRange;assert.ok(rowsOf(t,4).filter(r=>['KNOWN','FROM_LOG'].includes(r.mode)).every(r=>r.reps<=hi));
});

// ---------- T1-T5: evidence through time ----------

/** A moderate break reported Thursday 07:00 of week 6, re-entry this week: its Saturday session (the next strength day) is the entry. */
function returnThursday(id){N=0;const t=start(id,4);const end=addDays(t.p.weeks[6].startDate,2);step(t,at(t.p,6,3,'07:00:00',brk(addDays(t.p.weeks[4].startDate,1),end)));return t;}
const entrySession=t=>t.p.weeks[6].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day>3);
test('T1: a return reported on Thursday, the later session not yet executed: it never reaches Thursday\'s history',()=>{
 const t=returnThursday('t7sc-t1'),thu=history(t,6,3,'12:00:00'),sat=entrySession(t);
 assert.ok(sat.prescription.exercises.every(e=>e.exposure?.kind==='RETURN_ENTRY'),'the session after the report is the entry');
 const later=copy(t);step(later,at(later.p,6,5,'21:00:00',{observations:[obs(later.p,sat)]}));
 assert.deepEqual(history(later,6,3,'12:00:00'),thu,'Thursday\'s history with Saturday later executed equals Thursday\'s history without it');
 assert.ok(Object.values(thu.strength.exercises).every(e=>(e.lastPerformedAt??'')<sat.date),'no later exposure on Thursday');
 assert.ok(Object.values(thu.strength.exercises).every(e=>e.returnStep===null||e.returnStep===0),'no return step credited on Thursday');
});
test('T2: once the entry is executed, it is history from then on, at the dose it was executed',()=>{
 const t=returnThursday('t7sc-t2'),sat=entrySession(t),ids=sat.prescription.exercises.map(e=>e.id);
 step(t,at(t.p,6,5,'21:00:00',{observations:[obs(t.p,sat)]}));
 const H=history(t,6,5,'22:00:00');for(const id of ids)assert.equal(hex(H,id).lastPerformedAt,sat.date,id);
 weekly(t,6,s=>s.day>5);
 const W=history(t,7,0);for(const id of ids)assert.equal(hex(W,id).returnStep,1,id+': the entry it executed, one step');
});
test('T3: a late sync whose execution came before the cut enters that cut\'s history retroactively',()=>{
 N=0;const t=start('t7sc-t3',2),wed=t.p.weeks[2].sessions.find(WED);
 const before=history(t,2,3,'12:00:00');
 step(t,at(t.p,2,5,'10:00:00',{observations:[obs(t.p,wed,{extra:{reportedAt:`${addDays(t.p.weeks[2].startDate,5)}T09:00:00Z`}})]}));
 const after=history(t,2,3,'12:00:00');
 assert.notEqual(hex(before,'back-squat').lastPerformedAt,wed.date);assert.equal(hex(after,'back-squat').lastPerformedAt,wed.date,'executed Wednesday, known Saturday, history on Thursday');
});
test('T4: a report made later of an execution after the cut never anticipates it',()=>{
 N=0;const t=start('t7sc-t4',2),sat=t.p.weeks[2].sessions.find(SAT),thu=history(t,2,3,'12:00:00');
 step(t,at(t.p,2,6,'10:00:00',{observations:[obs(t.p,sat,{extra:{reportedAt:`${addDays(t.p.weeks[2].startDate,6)}T09:00:00Z`}})]}));
 assert.deepEqual(history(t,2,3,'12:00:00'),thu,'Thursday\'s history is unchanged');
});
test('T5: at a week boundary no session of the new week is credited, executed later or not',()=>{
 N=0;const t=start('t7sc-t5',3),mon=history(t,3,0,'00:30:00');
 assert.ok(Object.values(mon.strength.exercises).every(e=>(e.lastPerformedAt??'')<t.p.weeks[3].startDate),'nothing of week 3');
 const x=copy(t);weekly(x,3);assert.deepEqual(history(x,3,0,'00:30:00'),mon,'executing week 3 later changes nothing at its start');
});

// ---------- P1-P7 ----------

/** Rewrites every value of every stored start after week 0 (the projection) and every unexecuted row, keeps the program valid. */
function perturbProjection(p,cut){
 const q=structuredClone(p);
 for(let k=1;k<q.stateTrace.length;k++){const s=q.stateTrace[k];for(const e of Object.values(s.strength.exercises)){if(Number.isFinite(e.load))e.load+=10;e.loadTick=5;e.reps=(e.reps??8)+3;if(Number.isInteger(e.sets))e.sets+=2;e.lastPerformed='2099-01-01';}
  s.strength.exercises['phantom-exercise']={status:'ESTABLISHED',mode:'KNOWN',load:99,convention:'TOTAL',reps:9,sets:9,loadTick:9,source:'PLANNED_ESTABLISHMENT'};
  if(Number.isFinite(s.run.easy))s.run.easy+=20;if(Number.isFinite(s.run.long))s.run.long+=30;s.run.achieved={long:999,easy:999,quality:null,strides:9};s.run.longestContinuous=999;}
 for(const w of q.weeks)for(const s of w.sessions)if(s.date>cut.slice(0,10)&&s.prescription?.exercises)for(const e of s.prescription.exercises)if(e.load.mode==='KNOWN')e.load.value+=10;
 q.hash=programHash(q);return q;
}
test('P1: changing only PlanningProjection leaves HistoricalState identical',()=>{
 for(const [label,build] of [['P51',()=>{N=0;const t=start('t7sc-p1a',5);perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));return t;}],['moderate return',()=>{const t=returnThursday('t7sc-p1b');weekly(t,6,s=>s.day>=3);weekly(t,7);return t;}]]){
  const t=build();
  for(const [w,d,h] of [[2,3,'12:00:00'],[5,0,'06:00:00'],[7,1,'12:00:00'],[8,0,'06:00:00']]){
   const cut=`${addDays(t.p.weeks[w].startDate,d)}T${h}Z`,q=perturbProjection(t.p,cut);
   assert.deepEqual(historicalStateOf(q,{asOf:cut,actualLedger:t.ledger},opts),historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},opts),`${label} at ${cut}`);
  }
 }
 // The prescribed load of a KNOWN row for an exercise history does not hold is no evidence either (QE-R7ASM-01).
 const w2=q3Week2(Q3V.noDetails),{t}=q3('LATE',w2),q=structuredClone(t.p);for(const s of q.weeks[2].sessions)for(const e of s.prescription?.exercises??[])if(e.id===RDL&&e.load.mode==='KNOWN')e.load.value=35;q.hash=programHash(q);
 const cut=`${t.p.weeks[3].startDate}T06:00:00Z`;assert.deepEqual(historicalStateOf(q,{asOf:cut,actualLedger:t.ledger},opts),historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},opts));
});
test('P2: a retracted fact is returned as factual by no public reader',()=>{
 N=0;const t=start('t7sc-p2',2);perDay(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));
 const sat=t.p.weeks[4].sessions.find(SAT),first=obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});
 step(t,at(t.p,4,5,'21:00:00',{observations:[first]}));
 const fix=at(t.p,4,6,'21:00:00'),r=step(t,{...fix,observations:[{...obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:fix.asOf}]});
 const H=history(t,5,0),text=JSON.stringify({H:H.strength.exercises[RDL],state:H.state.strength.exercises[RDL],entry:whatIfEntry(t,5,RDL),questions:r.loadQuestions.filter(q=>q.exerciseId===RDL)});
 assert.ok(!/\b22\b/.test(text),text);
});
test('P3: no resolved prescription combines atoms into a dose its goal or gate does not allow',()=>{
 const cases=[];
 // HOLD on the R42 path, MAINTAIN after a change, and the three REPS_THEN_LOAD goals after empty weeks.
 N=0;const a=gen({id:'t7sc-p3a'});weekly(a,0);weekly(a,1);perDay(a,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value-2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});weekly(a,3,()=>true,s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:2}:x}:{});cases.push(['STRENGTH',a]);
 N=0;const b=start('t7sc-p3b',2,{goal:'HYPERTROPHY',known:[K('back-squat',3,12,70),K('db-bench-press',3,12,18,'PER_HAND')]});step(b,{...at(b.p,2,0,'07:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'MAINTAIN'}}});cases.push(['MAINTAIN',b]);
 for(const goal of ['HYPERTROPHY','GENERAL','RUNNING_SUPPORT']){N=0;const t=gen({id:'t7sc-p3-'+goal,goal});for(let w=0;w<4;w++)weekly(t,w);weekly(t,5,()=>false);cases.push([goal,t]);}
 for(const [goal,t] of cases){const [,hi]=DOSES[goal].repRange,w=t.p.decisions.at(-1)?.fromWeek??0;
  const rows=t.p.weeks.slice(Math.max(1,w)).flatMap(x=>rowsOf(t,x.index)).filter(r=>['KNOWN','FROM_LOG'].includes(r.mode));
  assert.ok(rows.every(r=>r.reps<=hi),`${goal}: ${JSON.stringify(rows.filter(r=>r.reps>hi).slice(0,3))}`);}
});
test('P4: HOLD with no new evidence never progresses the resolved dose',()=>{
 N=0;const t=start('t7sc-p4',2),row=rowsOf(t,2,WED,['back-squat'])[0];
 weekly(t,2,()=>true,s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:x.reps-2}:x}:{});
 const held=rowsOf(t,3,WED,['back-squat'])[0];assert.deepEqual([held.value,held.reps],[row.value,row.reps]);
 // A decision mid-week with nothing new (a day made unavailable that holds no session) re-plans from the view: the dose stays.
 step(t,at(t.p,3,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[3].startDate,0)]}}));
 const again=rowsOf(t,3,WED,['back-squat'])[0];assert.deepEqual([again.value,again.reps],[row.value,row.reps]);
});
test('P5: HistoricalState(T) holds no evidence executed only after T (the gate of a past week never counts a later log)',()=>{
 // Weeks 0-1 executed as prescribed; weeks 2-4 with the back squat lifted two repetitions short at a low reserve (repeated missed targets).
 N=0;const t=start('t7sc-p5',2);for(let w=2;w<5;w++)weekly(t,w,()=>true,s=>s.sport==='STRENGTH'?{set:(id,x)=>id==='back-squat'?{...x,reps:x.reps-2,rir:0}:x}:{});
 for(const [w,d,h] of [[1,0,'06:00:00'],[2,0,'06:00:00'],[3,2,'12:00:00'],[4,0,'06:00:00']]){
  const cut=`${addDays(t.p.weeks[w].startDate,d)}T${h}Z`,early=t.ledger.filter(o=>Date.parse(o.observedAt)<Date.parse(cut));
  assert.deepEqual(historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},opts),historicalStateOf(t.p,{asOf:cut,actualLedger:early},opts),'at '+cut);
 }
});
test('P6: an execution influences HistoricalState(T) only once its timestamp is before T',()=>{
 N=0;const t=start('t7sc-p6',2),wed=t.p.weeks[2].sessions.find(WED),cut=`${addDays(t.p.weeks[2].startDate,3)}T12:00:00Z`;
 const late=copy(t),early=copy(t);
 step(late,at(late.p,2,5,'10:00:00',{observations:[obs(late.p,wed,{observedAt:`${addDays(late.p.weeks[2].startDate,4)}T19:00:00Z`})]}));
 step(early,at(early.p,2,5,'10:00:00',{observations:[obs(early.p,wed,{observedAt:`${addDays(early.p.weeks[2].startDate,2)}T19:00:00Z`})]}));
 const H0=historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},opts);
 assert.deepEqual(historicalStateOf(late.p,{asOf:cut,actualLedger:late.ledger},opts),H0,'executed after T: nothing at T');
 assert.equal(hex(historicalStateOf(early.p,{asOf:cut,actualLedger:early.ledger},opts),'back-squat').lastPerformedAt,addDays(t.p.weeks[2].startDate,2),'executed before T: history at T');
});
test('P7: the evidence reducer and the public reader give one HistoricalState, corrections included',()=>{
 // A return's entry is the reducer's HistoricalState at its break (a SHORT return resumes it as it is): the public reader at the same instant agrees.
 for(const label of ['plain','corrected']){
  N=0;const t=start('t7sc-p7-'+label,2);perDay(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));
  const sat=t.p.weeks[4].sessions.find(SAT),first=obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});
  step(t,at(t.p,4,5,'21:00:00',{observations:[first]}));
  if(label==='corrected'){const fix=at(t.p,4,6,'21:00:00');step(t,{...fix,observations:[{...obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:fix.asOf}]});}
  const x=copy(t),bs=addDays(x.p.weeks[5].startDate,1),r=step(x,at(x.p,5,3,'06:00:00',brk(bs,addDays(bs,1))));
  const entry=r.proposal.decisions.at(-1).interruption.entry.strength.exercises,pub=historicalStateOf(x.p,{asOf:`${bs}T00:00:00Z`,actualLedger:x.ledger},opts).state.strength.exercises;
  for(const id of Object.keys(entry))assert.deepEqual(pub[id],entry[id],`${label}: ${id}`);
 }
});

// ---------- found on the way ----------

test('The public reader answers for a cut in the last week of a program while a return is in force (it threw before)',()=>{
 N=0;const t=start('t7sc-last',14);const w=15,end=addDays(t.p.weeks[w].startDate,1);
 step(t,at(t.p,w,3,'07:00:00',brk(addDays(t.p.weeks[14].startDate,1),end)));
 assert.doesNotThrow(()=>history(t,w,4,'12:00:00'));assert.ok(history(t,w,4,'12:00:00'));
});
test('NF-R7ASM-1: in a restart\'s own week a run planned inside the pause is never credited as run (the D47 statement)',()=>{
 // A long break from Tuesday of week 4 to Thursday of week 8, reported Friday 07:00: Thursday's easy run of the old plan lies inside the pause.
 N=0;const t=start('t7sc-nf1',4),s0=addDays(t.p.weeks[4].startDate,1),end=addDays(t.p.weeks[8].startDate,3);
 const inside=t.p.weeks[8].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date===end);assert.ok(inside&&inside.prescription.durationMinutes>20,'a planned run inside the pause');
 step(t,at(t.p,8,4,'07:00:00',brk(s0,end)));weekly(t,8,s=>s.date>end);
 const H=history(t,9,0),ran=t.ledger.filter(o=>o.context?.sport==='RUN'&&o.localDate>end).map(o=>o.actual.minutes);
 assert.ok(ran.length>0,'runs after the return');
 assert.ok((H.run.longestContinuous??0)<=Math.max(...ran),`longest continuous ${H.run.longestContinuous} against ${JSON.stringify(ran)}`);
});
test('Property D (found on the way): a past week\'s gate never counts a log executed after its clock (the T04 simulation\'s dead bug)',()=>{
 // Every week executed and reviewed; the lower-body session harder than planned in weeks 3-5. Week 0's gate, read again at a later cut, must not
 // see weeks 3-5's short sets: the bodyweight target history settled stays the one the reviews prescribed, at every exposure.
 const {simulateProgram}=SIM,{TRAJECTORIES}=TRAJ,t=TRAJECTORIES.find(x=>x.id==='T04_STRENGTH12_REPEATED_UNDERPERFORMANCE');
 const r=simulateProgram(t.input,t.script,opts),P=r.finalProgram;
 for(const w of [2,4,5]){const H=historicalStateOf(P,{asOf:`${P.weeks[w].startDate}T00:30:00Z`,actualLedger:r.actualLedger},opts),last=P.weeks[w-1].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.id==='dead-bug')).at(-1);
  assert.equal(hex(H,'dead-bug').lastExecutedReps,last.reps,`week ${w}: the target of the last exposure, as the review prescribed it`);}
});

// ---------- Paths the mutation check (Founder §25) found without a test; each test fails on the mutant it was written for ----------

test('QE-R7ASM-01 (the load questions): the decision asks to confirm a first log of an exercise history does not hold, whatever its row prescribed',()=>{
 // The question follows the transition (SSCTR D45): the log its own review left waiting is the one it asks about. That holds in the EARLY cell (an
 // establishment row) and in the LATE one (a KNOWN 20 row planned from the retracted evidence).
 const w2=q3Week2({}),cells={EARLY:q3('EARLY',w2),LATE:q3('LATE',w2)};
 assert.equal(cells.LATE.rows2[0].mode,'KNOWN','the LATE cell\'s row was planned KNOWN from the retracted evidence');
 for(const [name,x] of Object.entries(cells)){
  assert.equal(history(x.t,3,0).state.strength.exercises[RDL]?.pendingLoad,20,`${name}: the first log waits for confirmation`);
  assert.deepEqual((x.t.last.loadQuestions??[]).filter(q=>q.exerciseId===RDL).map(q=>[q.reason,q.logged]),[['ESTABLISHMENT_LOG_UNCONFIRMED',20]],`${name}: and the decision asks for it`);
 }
});

test('R42 and the gate\'s repetitions: a heavier load the athlete chose starts its credit at 0 and takes the repetitions executed at it',()=>{
 // back-squat 80 x 5 with one credit earned. The athlete lifts 82.5 x 6, target met (SSCTR D44, ADVANCE). No credit earned at 80 crosses to 82.5,
 // so the next week repeats 82.5 and the step comes one exposure later. Its target is the 6 executed (ADVANCE takes the logged repetitions).
 N=0;const t=start('t7sc-r42h',1),BS='back-squat';
 assert.deepEqual(rowsOf(t,1,()=>true,[BS]).map(r=>[r.value,r.reps]),[[80,5]]);
 assert.equal(t.p.stateTrace[1].strength.exercises[BS].loadTick,1,'one credit earned at 80');
 weekly(t,1,()=>true,()=>({kg:(id,e)=>id===BS?82.5:(e.load.mode==='KNOWN'?e.load.value:20),set:(id,x)=>id===BS?{...x,reps:6}:x}));
 assert.deepEqual(rowsOf(t,2,()=>true,[BS]).map(r=>[r.value,r.reps]),[[82.5,6]],'82.5 again, at the 6 executed');
 const h=hex(history(t,2,0),BS);
 assert.deepEqual([h.lastExecutedLoad,h.lastExecutedReps,h.earnedProgress.loadTick],[82.5,6,1],'history: the credit at 82.5 is its own');
 weekly(t,2);
 assert.equal(rowsOf(t,3,()=>true,[BS])[0].value,85,'then the step');
});

test('F1, the walk/jog side: after a short return the walk/jog step follows the step run, never one the plan did not prescribe',()=>{
 // WALK_JOG_FIVE_DAYS, weeks 0-3 executed. A break from Tuesday of week 4 is reported on Thursday of week 5; every session from the report on is
 // executed and each week reviewed. History credits week 5's step-4 sessions; the plan re-bases week 6 at step 4 (E7). Week 6 runs step 4 again,
 // so history moves to step 5, as the plan does, and never to step 6.
 N=0;const g=generateProgram(structuredClone({...PROFILES,...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS),opts),t={p:g.program,ledger:[]};
 for(let w=0;w<4;w++)weekly(t,w);
 const s4=addDays(t.p.weeks[4].startDate,1);weekly(t,4,s=>s.date<s4);
 const rd=addDays(t.p.weeks[5].startDate,3);step(t,at(t.p,5,3,'07:00:00',brk(s4,addDays(rd,-1))));
 for(const w of [5,6])weekly(t,w,s=>s.date>=rd);
 const steps=w=>[...new Set(t.p.weeks[w].sessions.filter(s=>live(s)&&s.role==='WALK_JOG').map(s=>s.progression?.value))];
 assert.deepEqual(steps(6),[4],'week 6 repeats step 4');
 assert.equal(history(t,7,0,'00:30:00').state.run.walkStep,5,'history after week 6: the step run, plus one');
 assert.deepEqual(steps(7),[5],'the plan agrees');
});

test('SSCTR F2, REGRESS at a projected load (REPS_THEN_LOAD): the regression starts from the dose held at that load, never from the earlier load\'s target',()=>{
 // HYPERTROPHY, db-bench-press 18 kg x 8. Weeks 1 and 2 are reported day by day with the Saturday lift missed, so history reads their facts only
 // (18 x 10) while the projection steps to 20 x 8. Week 3 lifts 20 kg one or two repetitions short and is reviewed: REGRESS from the dose held at
 // 20 kg (20 x 8) gives 18 x 8, as on STATE-EVIDENCE-FREEZE-1; not 18 x 10 (20 kg paired with 18 kg's target), not 18 x 7 or 6 (below 8-12).
 const BP='db-bench-press',[lo,hi]=DOSES.HYPERTROPHY.repRange;
 for(const miss of [1,2]){
  N=0;const t=gen({id:'t7sc-rtl',goal:'HYPERTROPHY',known:[K('back-squat',3,8,80),K('db-bench-press',3,8,18,'PER_HAND')]});weekly(t,0);
  for(const w of [1,2])perDay(t,w,s=>!SAT(s));
  assert.deepEqual(rowsOf(t,3,()=>true,[BP]).map(r=>[r.value,r.reps]),[[20,8],[20,8]],'the projection stepped to 20 x 8');
  assert.deepEqual((({load,reps})=>[load,reps])(history(t,3,0).state.strength.exercises[BP]),[18,10],'history holds 18 x 10');
  weekly(t,3,()=>true,()=>({set:(id,x,e)=>id===BP?{...x,reps:e.reps-miss}:x}));
  assert.equal(t.last.gates[BP],'REGRESS');
  const rows=rowsOf(t,4,()=>true,[BP]);
  assert.deepEqual(rows.map(r=>[r.value,r.reps]),[[18,8],[18,8]],`${miss} short: 18 x 8`);
  assert.ok(rows.every(r=>r.reps>=lo&&r.reps<=hi));
 }
});
