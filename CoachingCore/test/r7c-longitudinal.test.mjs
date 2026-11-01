// R7-C Phase 2 (DOMAIN_COACHING_R7-C, Longitudinal Coaching): directed tests for
// - R7C-G01: one factual reading of weeks without a gating review or without a report. Unknown is neither executed-success nor
//   executed-failure: no credit, no zero, no adverse reading; when a safe dose depends on it, a typed question (G03 owns how it is asked);
// - R7C-G02: learned maintenance of the long run inside the current R6-PARTIAL-NOISY-LEARNING envelope (Founder option A).
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {opts,K,FULL,elig,program,weekly,review,obs,live,runs,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const UNREPORTED='observations.unreportedSessions|interruption';
const BASE={id:'r7c-g01',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x={})=>evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger},opts);
const minutes=(p,w)=>runs(p,w).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const doses=p=>p.weeks.map(x=>x.sessions.map(s=>s.id+':'+hash(s.prescription??null)));
/** Weeks [0,from) executed and reviewed; weeks [from,to) EXEC (executed and reviewed), EMPTY (reviewed, nothing reported) or NONE (no review). */
function gap(mode,{o=BASE,from=2,to=7}={}){
 const t={p:program(o),ledger:[],reviews:[]};
 for(let w=0;w<from;w++)weekly(t,w);
 for(let w=from;w<to;w++){if(mode==='EXEC')weekly(t,w);else if(mode==='EMPTY')t.reviews.push(apply(t,decide(t,w)));}
 return t;
}
const historyAt=(t,w)=>historicalStateOf(t.p,{asOf:`${t.p.weeks[w].startDate}T06:00:00Z`,actualLedger:t.ledger},opts);
// The run's facts (HistoricalState.run) and its development counters; a release the athlete has not run yet is no fact (historicalRun undoes it).
const runFacts=h=>({mode:h.run.mode,achieved:h.run.achieved,longestContinuous:h.run.longestContinuous,quality:h.state.run.qualityStep,easyWeeks:h.state.run.easyWeeksDone??0});

// ---------- R7C-G01 ----------
test('R7-C G01: after weeks with no review or no report, a run dose that depends on them is asked, typed; neither the entry (zero) nor the projection (credit) is planned (R18, CQ-R6-04)',()=>{
 for(const mode of ['NONE','EMPTY']){
  const t=gap(mode),r=decide(t,7);
  assert.equal(r.status,'ASK',mode);assert.equal(r.action,'ASK');assert.equal(r.proposal,null,mode+': nothing is planned on unreported training');
  assert.deepEqual(r.missingInputs,[UNREPORTED]);
  assert.equal(r.question.kind,'UNREPORTED_TRAINING');assert.equal(r.question.dependentScope,'RUN_DOSE');assert.equal(r.question.fromWeek,8);
  const asked=new Set(r.question.unreported.sessionIds),sessions=t.p.weeks.flatMap(x=>x.sessions).filter(s=>asked.has(s.id));
  assert.ok(sessions.length>0&&sessions.length===asked.size);
  assert.ok(sessions.every(s=>s.sport==='RUN'&&s.date>=r.question.referenceWindow.from&&s.date<=r.question.referenceWindow.through&&!t.ledger.some(o=>o.sessionId===s.id)));
  assert.equal(r.planValidity.status,'REQUIRES_RECONCILIATION','the plan in force is not valid until the question is answered');
 }
 // Control: the same weeks executed and reviewed plan next week from what was run, without a question and without a collapse.
 const c=decide(gap('EXEC'),7);
 assert.equal(c.status,'MODIFY');assert.ok(runs(c.proposal,8).every(s=>s.prescription.durationMinutes>15),minutes(c.proposal,8).join());
});
test('R7-C G01: a week reviewed with nothing reported is no adverse execution and reads exactly as a week never reviewed (metamorphic)',()=>{
 const none=gap('NONE'),empty=gap('EMPTY');
 // The empty reviews hold every dose and count no adverse response: absence is not adverse.
 assert.ok(empty.reviews.length===5);
 for(const r of empty.reviews){assert.equal(r.weekEvidence.adverseSessions,0);assert.ok(Object.values(r.gates??{}).every(g=>g==='HOLD'),JSON.stringify(r.gates));}
 const a=decide(none,7),b=decide(empty,7);
 assert.deepEqual([a.status,a.missingInputs,a.question.unreported,a.question.referenceWindow],[b.status,b.missingInputs,b.question.unreported,b.question.referenceWindow]);
 const ha=historyAt(none,7),hb=historyAt(empty,7);
 assert.deepEqual(runFacts(ha),runFacts(hb));
 assert.equal(ha.strength.exercises['back-squat'].lastExecutedLoad,hb.strength.exercises['back-squat'].lastExecutedLoad);
});
test('R7-C G01: the last established execution stays the fact: weeks with no evidence move neither the run nor the strength history',()=>{
 const t=gap('NONE'),before=historyAt(t,2),after=historyAt(t,7);
 assert.deepEqual(runFacts(after),runFacts(before),'weeks 2-6 earned nothing');
 assert.deepEqual([after.state.run.easy,after.state.run.long],[before.state.run.easy,before.state.run.long]);
 const projected=t.p.stateTrace[7].run;
 assert.ok(projected.qualityStep>after.state.run.qualityStep||projected.long>after.state.run.long||projected.easy>after.state.run.easy,'the projection assumed progress the record does not hold');
 const squat=after.strength.exercises['back-squat'];
 assert.equal(squat.lastExecutedLoad,before.strength.exercises['back-squat'].lastExecutedLoad);
 assert.ok(squat.lastPerformedAt<t.p.weeks[2].startDate,'last performed before the gap');
});
test('R7-C G01: a week executed after weeks with no review re-bases the plan and says so; it is never kept as an instantiation (C15)',()=>{
 const o={...BASE,id:'r7c-c15',goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const t=gap('NONE',{o,from:3}),r=decide(t,7,{observations:t.p.weeks[7].sessions.filter(live).map(s=>obs(t.p,s))});
 assert.ok(Object.values(r.gates).every(g=>g==='ADVANCE'),'week 7 was executed as planned');
 assert.equal(r.status,'MODIFY');assert.equal(r.instantiationOnly,false);assert.equal(r.action,'GATED_NEXT_STEP');assert.match(r.reason,/re-based, not kept/);
 const step=p=>runs(p,8).find(s=>s.role==='QUALITY')?.progression?.value??-1;
 assert.ok(step(r.proposal)<step(t.p),`the plan's quality step ${step(t.p)} assumed weeks 3-6; next week starts at ${step(r.proposal)}`);
 // Control: every week reviewed, the same review keeps the planned step with its usual label.
 const all=gap('EXEC',{o,from:3}),k=decide(all,7,{observations:all.p.weeks[7].sessions.filter(live).map(s=>obs(all.p,s))});
 assert.equal(k.status,'KEEP');assert.doesNotMatch(k.reason,/re-based/);
});
test('R7-C G01: an agenda or event-date change after weeks with no review asks instead of collapsing running before the race (CQ-R6-04, C15)',()=>{
 const o={...BASE,id:'r7c-race',goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const changes=[{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays('2026-11-02',10*7+6)}}];
 const t=gap('NONE',{o,from:3}),done=gap('EXEC',{o,from:3});
 for(const x of changes){
  const r=decide(t,7,{day:0,hour:'07:00:00',...x});
  assert.equal(r.status,'ASK',x.kind);assert.deepEqual(r.missingInputs,[UNREPORTED]);assert.equal(r.proposal,null);
  const c=decide(done,7,{day:0,hour:'07:00:00',...x});
  assert.equal(c.status,'MODIFY',x.kind);
  for(let w=8;w<c.proposal.phases.raceWeek;w++)assert.ok(runs(c.proposal,w).every(s=>s.prescription.durationMinutes>15),`${x.kind} week ${w}: ${minutes(c.proposal,w)}`);
 }
});
test('R7-C G01: a declared pause and an unknown gap of the same length stay different facts with coherent outcomes (D4)',()=>{
 for(const [from,days,cls] of [[2,35,'LONG'],[3,28,'MODERATE']]){
  const t=gap('NONE',{from}),start=t.p.weeks[from].startDate,at={day:0,hour:'07:00:00'};
  const interruption={startDate:start,endDate:addDays(start,days-1),days,reasonCategory:'WORK',reason:'work',nonclinical:true};
  // Unknown: nothing is prescribed; the athlete is asked whether there was training or a break.
  const unknown=decide(t,7,{...at,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
  assert.equal(unknown.status,'ASK',cls);assert.equal(unknown.proposal,null);assert.deepEqual(unknown.missingInputs,[UNREPORTED]);
  // Declared: the existing return mechanism re-enters by its recipe; the answer to the question is exactly this report.
  const declared=decide(t,7,{...at,kind:'RETURN_AFTER_PAUSE',interruption});
  assert.equal(declared.action,'REESTABLISH',cls);assert.equal(declared.proposal.decisions.at(-1).interruption.class,cls);
  const next=declared.proposal.decisions.at(-1).fromWeek;
  assert.ok(runs(declared.proposal,next).every(s=>s.prescription.durationMinutes<=20),'re-entry from the reviewed entry: '+minutes(declared.proposal,next));
  // Once the break is declared, the same agenda change re-plans without asking: a declared stop is a known fact.
  const after=evaluateProgram(declared.proposal,{...review(declared.proposal,7,{day:0,hour:'08:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),actualLedger:declared.actualLedger},opts);
  assert.notEqual(after.status,'ASK',cls+': '+after.reason);
 }
});
test('R7-C G01: late reports of the unreported runs answer the question; the record revises only the future',()=>{
 const t=gap('NONE'),late=t.p.weeks.slice(2,7).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>obs(t.p,s));
 const r=decide(t,7,{observations:late});
 assert.equal(r.status,'MODIFY',r.reason);
 for(let w=0;w<=7;w++)assert.deepEqual(doses(r.proposal)[w],doses(t.p)[w],`week ${w} is history and is never rewritten`);
 assert.ok(runs(r.proposal,8).every(s=>s.prescription.durationMinutes>15),minutes(r.proposal,8).join());
 assert.ok(r.actualLedger.length===t.ledger.length+late.length,'the late facts are recorded once');
});
test('R7-C G01: strength after weeks with no review or no report earns no credit and is re-established from the last executed load; never reviewed equals reviewed empty (R18 strength regression)',()=>{
 const o={id:'r7c-strength',weeks:12,goals:{run:'NONE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],schedule:{runDays:[],longRunDay:null}};
 const rows=(p,w)=>p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id==='back-squat').map(e=>`${e.sets}x${e.reps} ${e.load.mode}:${e.load.value??'-'}`));
 const out={};
 for(const mode of ['NONE','EMPTY']){const t=gap(mode,{o}),r=decide(t,7);assert.equal(r.status,'MODIFY',mode+' '+r.reason);out[mode]={week8:rows(r.proposal,8),last:historyAt(t,7).strength.exercises['back-squat'].lastExecutedLoad};}
 assert.deepEqual(out.NONE,out.EMPTY);
 assert.ok(out.NONE.week8.every(x=>/ESTABLISH/.test(x)),'re-established by effort after the gap, never stepped from the projection: '+out.NONE.week8);
 assert.ok(out.NONE.last>=82.5&&out.NONE.last<=85);
});
test('R7-C G01: the novice density cap starts when the week before it had no review, as when it was reviewed (QE-R7B-R2-05)',()=>{
 const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,4]},weeks:12};
 const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
 const path=(name,f)=>{const t={p:program({...NOV,id:'r7c-cap-'+name}),ledger:[]};weekly(t,0);apply(t,decide(t,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}));f(t);
  const d=decide(t,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}});
  return types(d.proposal??t.p,2);};
 const skipped=path('skip',()=>{}),reviewed=path('empty',t=>weekly(t,1,{keep:()=>false}));
 assert.equal(skipped,reviewed);assert.match(skipped,/CORE/,'week 2 is capped: '+skipped);
});
test('R7-C G01: a session the plan moved is gated on its own report, and a report that a session was not done is a known miss (CQ-R6-19 record, D2)',()=>{
 // H22 shape: the long-run day becomes unavailable mid-week; the long run moves to an easier day of the week and is executed there.
 const t={p:program({id:'r7c-moved'}),ledger:[]};weekly(t,0);weekly(t,1);
 const w=2,long=t.p.weeks[w].sessions.find(s=>s.role==='LONG'),day2=addDays(t.p.weeks[w].startDate,2);
 const u=apply(t,decide(t,w,{day:2,hour:'20:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[long.date]},observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date<=day2).map(s=>obs(t.p,s))}));
 const moved=t.p.weeks[w].sessions.find(s=>s.moved?.from===long.id);
 assert.equal(u.action,'RESCHEDULE_WITHIN_WEEK');assert.ok(moved&&moved.role==='LONG');
 const r=weekly(t,w,{keep:s=>s.date>day2});
 assert.equal(r.gates.LONG,'ADVANCE','the executed moved long run is not held by the slot it left');
 assert.deepEqual(r.weekEvidence.rows.filter(x=>x.role==='LONG').map(x=>x.sessionId),[moved.id]);
 // A session skipped without a move keeps its row: the next comparable session repeats the last executed dose (R6), nothing is earned.
 const s={p:program({id:'r7c-skipped'}),ledger:[]};weekly(s,0);weekly(s,1);
 const sl=s.p.weeks[2].sessions.find(x=>x.role==='LONG'),day5=addDays(s.p.weeks[2].startDate,5);
 const k=apply(s,decide(s,2,{day:5,hour:'20:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[sl.date]},observations:s.p.weeks[2].sessions.filter(x=>live(x)&&x.date<=day5).map(x=>obs(s.p,x))}));
 assert.equal(s.p.weeks[2].sessions.find(x=>x.id===sl.id).status,'SKIPPED',k.action);assert.equal(s.p.weeks[2].sessions.find(x=>x.id===sl.id).movedTo??null,null);
 const kr=weekly(s,2,{keep:()=>false});
 assert.ok(['MISSED','NOT_REPORTED'].includes(kr.weekEvidence.rows.find(x=>x.sessionId===sl.id)?.status));assert.equal(kr.gates.LONG,'HOLD');
 // H17 shape: the athlete reports the key session as not done: a known miss, never a partial execution; the dose holds, nothing is earned.
 const m={p:program({...BASE,id:'r7c-miss'}),ledger:[]};weekly(m,0);weekly(m,1);
 const q=m.p.weeks[2].sessions.find(s=>s.role==='QUALITY'&&live(s))??m.p.weeks[2].sessions.find(s=>s.sport==='RUN'&&live(s));
 const miss=weekly(m,2,{o:s=>s.id===q.id?{actual:{completed:false}}:{}});
 const row=miss.weekEvidence.rows.find(x=>x.sessionId===q.id);
 assert.equal(row.status,'MISSED');assert.equal(miss.weekEvidence.partial,0);
 assert.equal(miss.gates[q.role==='QUALITY'?'QUALITY':q.role],'HOLD');
});
test('R7-C G01: the clinical route comes before the question about unreported training, and a pending clinical state stays (S1, C4)',()=>{
 const t=gap('NONE'),day=addDays(t.p.weeks[7].startDate,6);
 const pain=decide(t,7,{eligibility:{...elig(day),pain:true}});
 assert.equal(pain.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(pain.proposal,null);assert.deepEqual(pain.missingInputs,[]);
 const ill=decide(t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:35,reasonCategory:'ILLNESS'}});
 assert.equal(ill.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(ill.proposal,null);
 const sub=decide(t,7,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'back-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}});
 assert.equal(sub.status,'CLINICAL_HUMAN_REQUIRED');
 // While the clinical dependency is pending, no review clears it, and the unreported question never replaces it.
 const later=decide(t,7,{referenceState:pain.referenceState});
 assert.equal(later.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(later.proposal,null);
});
test('R7-C G01: same facts, same decision',()=>{
 const t=gap('NONE'),rv={...review(t.p,7),actualLedger:t.ledger};
 assert.equal(hash(evaluateProgram(t.p,rv,opts)),hash(evaluateProgram(t.p,rv,opts)));
});

// ---------- R7C-G02 ----------
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
/** Weeks [0,until) executed and reviewed; a long run is followed by an adverse response when `bad(week, minutes)`. `consent(week)` per review. */
function longRuns({until,bad=(w,m)=>m>=70,consent=()=>true,o={id:'r7c-g02',weeks:16}}){
 const t={p:program(o),ledger:[],results:[],plans:[]};
 for(let w=0;w<until;w++){
  const r=decide(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s,s.role==='LONG'&&bad(w,s.prescription.durationMinutes)?{response:BAD}:{})),learningConsent:consent(w)});
  assert.ok(!['UNSUPPORTED','HOLD','ASK'].includes(r.status),`week ${w}: ${r.status} ${r.reason}`);t.results.push(apply(t,r));t.plans.push(t.p);
 }
 return t;
}
const longOf=(p,w)=>runs(p,w).find(s=>s.role==='LONG').prescription.durationMinutes;
const learnedOf=r=>(r.learnedPatterns??[]).find(x=>x.kind==='LEARNED_MAINTENANCE')??null;
const prescriptions=(p,from=0)=>p.weeks.slice(from).map(x=>x.sessions.map(s=>s.id+':'+hash(s.prescription??null)));
test('R7-C G02: with learning consent, long runs repeatedly followed by an adverse response at one dose hold the next step to it; the long run stays at the dose last executed',()=>{
 const on=longRuns({until:13}),off=longRuns({until:13,consent:()=>false});
 // Two cycles each failed at 70 minutes (weeks 5-6 and 9-10); after 65 minutes went well, the population rule steps back up to 70.
 assert.equal(longOf(off.p,13),70);assert.equal(longOf(on.p,13),65);
 const r=on.results[12],lp=learnedOf(r);
 assert.equal(r.gates.LONG,'HOLD');assert.equal(off.results[12].gates.LONG,'ADVANCE');
 assert.deepEqual([lp.sessionType,lp.heldAtMinutes,lp.stepToMinutes,lp.causal,lp.automaticDoseAuthority,lp.basis],['RUN:LONG',65,70,false,false,'R6-PARTIAL-NOISY-LEARNING']);
 assert.equal(lp.evidence.direction,'ADVERSE');assert.ok(['EMERGING','STRONG'].includes(lp.evidence.confidence));
 assert.ok(lp.evidence.adverseCount>=r.updatedModel.policy.emergingSessions,'never one event');
 assert.match(r.reason,/an association, not a cause/);
 // Only the choice changes: the long run keeps a dose the athlete executed (week 11) and the plan prescribed; every other session is the same.
 assert.ok(on.ledger.some(o=>o.context?.sessionType==='RUN:LONG'&&o.context.runMinutes===65&&o.context.weekIndex===11));
 const others=p=>p.weeks[13].sessions.filter(s=>s.role!=='LONG').map(s=>s.id+':'+hash(s.prescription??null));
 assert.deepEqual(others(on.p),others(off.p));
 // Before that decision nothing differed: learning changes only the decision it is established for.
 for(let w=0;w<12;w++)assert.equal(learnedOf(on.results[w]),null,`week ${w}`);
 assert.deepEqual(prescriptions(on.plans[11]),prescriptions(off.plans[11]));
});
test('R7-C G02: without consent, or once consent is revoked, nothing learned changes the plan; the completed-work record stays',()=>{
 const off=longRuns({until:13,consent:()=>false}),revoked=longRuns({until:13,consent:w=>w<12});
 const r=revoked.results[12];
 assert.equal(learnedOf(r),null);assert.equal(longOf(revoked.p,13),70);
 assert.deepEqual(prescriptions(revoked.plans[12]),prescriptions(off.plans[12]));
 assert.equal(r.updatedModel.purposeAllowed,false);assert.equal(r.updatedModel.observations.length,0,'the revoked model holds no athlete-specific evidence');
 assert.equal(r.actualLedger.length,off.results[12].actualLedger.length,'facts are not erased by a revocation');
 assert.equal(off.results.every(x=>x.updatedModel.observations.length===0&&learnedOf(x)===null),true);
});
test('R7-C G02: insufficient or mixed evidence personalizes nothing; one event never becomes a rule',()=>{
 // Insufficient: one failed cycle (two adverse runs at 70) is the population's regression, not a learned pattern.
 const one=longRuns({until:10}),oneOff=longRuns({until:10,consent:()=>false});
 assert.ok(one.results.every(x=>learnedOf(x)===null));assert.equal(longOf(one.p,9),70);
 assert.deepEqual(prescriptions(one.p),prescriptions(oneOff.p));
 // Mixed: a long run of 70 minutes that went well between the failed ones leaves the association uncertain.
 const mixed=longRuns({until:15,bad:(w,m)=>m>=70&&w!==9}),mixedOff=longRuns({until:15,bad:(w,m)=>m>=70&&w!==9,consent:()=>false});
 assert.ok(mixed.results.every(x=>learnedOf(x)===null));assert.deepEqual(prescriptions(mixed.p),prescriptions(mixedOff.p));
 // A single adverse long run never becomes a rule.
 const single=longRuns({until:15,bad:w=>w===5});
 assert.ok(single.results.every(x=>learnedOf(x)===null));
});
test('R7-C G02: the same facts and consent give the same decision, with the carried model or without it; nothing learned outside build weeks',()=>{
 const on=longRuns({until:12}),rv={...review(on.p,12,{observations:on.p.weeks[12].sessions.filter(live).map(s=>obs(on.p,s))}),actualLedger:on.ledger};
 const a=evaluateProgram(on.p,rv,opts),b=evaluateProgram(on.p,rv,opts),c=evaluateProgram(on.p,{...rv,athleteModel:on.results[11].updatedModel},opts);
 assert.equal(hash(a),hash(b));
 assert.deepEqual([a.gates,learnedOf(a),prescriptions(a.proposal)],[c.gates,learnedOf(c),prescriptions(c.proposal)]);
 // An event plan: taper, race-week and post-event doses are the event authority's, whatever was learned.
 const race={id:'r7c-g02-race',weeks:12,goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',11*7+6)}},strength:'MAINTAIN'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:60,longRunMinutes:120}};
 const ron=longRuns({o:race,until:11,bad:(w,m)=>m>=70}),roff=longRuns({o:race,until:11,bad:(w,m)=>m>=70,consent:()=>false});
 const phases=ron.p.phases.phases;
 for(const [w,r] of ron.results.entries())if(learnedOf(r))assert.ok(['BUILD','DEVELOPMENT'].includes(phases[w+1]),`learned into ${phases[w+1]}`);
 for(let w=0;w<12;w++)if(['TAPER','RACE_WEEK','POST_EVENT'].includes(phases[w])&&!ron.results.some((r,k)=>k<w&&learnedOf(r)))assert.deepEqual(minutes(ron.p,w),minutes(roff.p,w),'week '+w);
 assert.equal(ron.p.weeks[ron.p.phases.raceWeek].sessions.some(s=>s.role==='RACE'),true);
});
