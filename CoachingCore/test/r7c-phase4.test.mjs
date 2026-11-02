// R7-C Phase 4 (DOMAIN_COACHING_R7-C): directed tests for the Phase 3 blockers.
// - R7C-P3-02: while the run doses still ahead depend on unreported training, no decision keeps, validates or re-plans them: the same
//   UNREPORTED_TRAINING question is asked, and a change that plans no run dose keeps its change with that question pending;
// - R7C-P3-01: taper and race-week doses derived from the executed peaks are asked about when they depend on unreported training;
// - R7C-P3-03: the C15 re-base reason states only facts that hold;
// - R7C-P3-05: the mutation survivors G01-M5, G02-M3, G02-M4 and G02-M8.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,weekly,review,obs,live,runs,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const UNREPORTED='observations.unreportedSessions|interruption';
const BASE={id:'r7c-p4',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const race=(kind,id,extra={})=>({id,weeks:12,goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:kind==='10K'?100:120},...extra});
const RACES={R10K:race('10K','r7c-p4-10k'),RHM:race('HALF_MARATHON','r7c-p4-hm',{schedule:{runDays:[1,3,4,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:120}})};
const notDone=(p,s)=>({eventId:`r7c-p4-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
/** The facts of week w: strength reported done; runs EXEC (done as prescribed), MISS (reported not done) or UNREP (no report at all). */
const facts=(p,w,V,{only=null}={})=>p.weeks[w].sessions.filter(live).flatMap(s=>s.sport!=='RUN'?[obs(p,s)]:only?.(s)?[obs(p,s)]:V==='EXEC'?[obs(p,s)]:V==='MISS'?[notDone(p,s)]:[]);
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x={})=>evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger},opts);
/** Weeks [0,g) executed and reviewed; weeks [g,b) reviewed with the facts V. */
function timeline(o,{g,b,V,only=null}){
 const t={p:program(o),ledger:[],reviews:[]};
 for(let w=0;w<g;w++)weekly(t,w);
 for(let w=g;w<b;w++)t.reviews.push(apply(t,decide(t,w,{observations:facts(t.p,w,V,{only})})));
 return t;
}
const runPlan=(P,b)=>[b,b+1].filter(k=>P.weeks[k]).map(k=>P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}${s.prescription.strides?':S':''}`).join('/')).join(' | ');
/** The run doses a decision leaves in force for weeks b and b+1, or ASK when it asks or keeps the unreported-training question pending. */
const inForce=(t,r,b)=>r.status==='ASK'||r.question?.kind==='UNREPORTED_TRAINING'?'ASK':runPlan(r.proposal??t.p,b);
/** The run prescriptions of every week from `from`, each week as a sorted multiset. */
const runRows=(P,from)=>P.weeks.slice(from).map(x=>x.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>hash(s.prescription)).sort());
/** Every run prescription of `a` from `from` is one `b` already had in the same week (a sub-multiset): nothing new is planned. */
const noNewRun=(a,b,from)=>{const B=runRows(b,from);return runRows(a,from).every((list,k)=>{const pool=[...B[k]];return list.every(h=>{const i=pool.indexOf(h);if(i<0)return false;pool.splice(i,1);return true;});});};
const ENTRY=opts.authority.policy.operational.return.entryRunMinutes;

// ---------- R7C-P3-02 ----------
// A decision at day 0 of week b after the gap: each kind with the same input in the EXEC, MISS and UNREP timelines.
const AT={day:0,hour:'07:00:00'};
const KINDS={
 SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 WEEKLY_REVIEW_MIDWEEK:()=>({}),
 SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
 UNAVAILABLE_LONG_RUN_DAY:(t,b)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[b].startDate,6)]}}),
 UNAVAILABLE_STRENGTH_DAY:(t,b)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[b].startDate,4)]}}),
 EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
 LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}})
};
const INDEPENDENT=new Set(['UNAVAILABLE_LONG_RUN_DAY','UNAVAILABLE_STRENGTH_DAY','EQUIPMENT_CHANGE','LOCAL_FATIGUE']);
test('R7-C P3-02: after the question about unreported training, no decision validates the projected run doses; THRESHOLD 41 / LONG 65 never comes back after 7 weeks with no reported run',()=>{
 const t=timeline(BASE,{g:0,b:7,V:'UNREP'});
 const asked=t.reviews.filter(r=>r.question?.kind==='UNREPORTED_TRAINING');
 assert.ok(asked.length>0&&t.reviews.at(-1).question?.kind==='UNREPORTED_TRAINING','the reviews before week 7 asked');
 const stored=runPlan(t.p,7);assert.match(stored,/QUALITY:41:THRESHOLD/,'the stored plan still holds the projection: '+stored);
 for(const [kind,make] of Object.entries(KINDS)){
  const r=decide(t,7,{...AT,...make(t,7)});
  assert.notEqual(r.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',kind+': no decision validates doses that depend on unreported training');
  assert.equal(r.question?.kind,'UNREPORTED_TRAINING',kind);assert.deepEqual(r.missingInputs,[UNREPORTED],kind);
  // The same question the review asked for this week: same kind, scope, week, window and sessions.
  assert.deepEqual(r.question,t.reviews.at(-1).question,kind+': the same question');
  assert.equal(r.referenceState.pending?.status,'ASK',kind+': the question stays pending');
  if(INDEPENDENT.has(kind)){
   // Partial or local re-planning that plans no run dose keeps its change; every run row ahead stays as it was, never validated.
   assert.ok(r.proposal&&r.status!=='ASK',kind+' keeps its change: '+r.status);
   assert.ok(noNewRun(r.proposal,t.p,7),kind+': no run dose is planned');
   if(kind!=='UNAVAILABLE_LONG_RUN_DAY')assert.deepEqual(runRows(r.proposal,7),runRows(t.p,7),kind+': the run rows ahead are untouched');
  }else{
   assert.equal(r.status,'ASK',kind);assert.equal(r.action,'ASK',kind);assert.equal(r.proposal,null,kind+': nothing is planned on unreported training');
  }
 }
});
test('R7-C P3-02: metamorphic EXEC / MISS / UNKNOWN: wherever the facts of the gap decide the run doses, the unknown stays a question until it is factualized',()=>{
 for(const g of [0,2]){
  const T={EXEC:timeline(BASE,{g,b:7,V:'EXEC'}),MISS:timeline(BASE,{g,b:7,V:'MISS'}),UNREP:timeline(BASE,{g,b:7,V:'UNREP'})};
  for(const [kind,make] of Object.entries(KINDS)){
   const plan=Object.fromEntries(Object.entries(T).map(([V,t])=>[V,inForce(t,decide(t,7,{...AT,...make(t,7)}),7)]));
   assert.notEqual(plan.EXEC,plan.MISS,`g=${g} ${kind}: the gap's facts decide the dose`);
   assert.ok(![plan.EXEC,plan.MISS].includes('ASK'),`g=${g} ${kind}: known facts are decided`);
   assert.equal(plan.UNREP,'ASK',`g=${g} ${kind}: unknown is neither the executed plan (credit) nor the known miss (zero)`);
  }
 }
});
test('R7-C P3-02: the athlete’s report factualizes the gap: late reports of the runs (done or not done) answer it, and history is never rewritten',()=>{
 const t=timeline(BASE,{g:2,b:7,V:'UNREP'}),gapRuns=t.p.weeks.slice(2,7).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
 const past=P=>P.weeks.slice(0,7).map(x=>x.sessions.map(s=>s.id+':'+hash(s.prescription??null)));
 for(const [V,report] of [['EXEC',s=>obs(t.p,s)],['MISS',s=>notDone(t.p,s)]]){
  const r=decide(t,7,{...AT,...KINDS.SCHEDULE_CHANGE(),observations:gapRuns.map(report)});
  assert.notEqual(r.status,'ASK',V+': '+r.reason);assert.equal(r.question??null,null,V);
  assert.deepEqual(past(r.proposal),past(t.p),V+': the weeks up to the decision are history');
  const week8=runs(r.proposal,8).map(s=>s.prescription.durationMinutes);
  if(V==='EXEC')assert.ok(week8.every(m=>m>ENTRY),'reported done: no collapse '+week8);
  else assert.ok(week8.every(m=>m<=ENTRY),'reported not done for weeks: the reviewed entry '+week8);
 }
});
test('R7-C P3-02: a mid-week KEEP never clears the pending question, and the clinical route still comes first',()=>{
 const t=timeline(BASE,{g:0,b:7,V:'UNREP'});
 const keep=decide(t,7,AT);
 assert.equal(keep.status,'ASK');assert.equal(keep.question.kind,'UNREPORTED_TRAINING');assert.equal(keep.referenceState.pending.status,'ASK');
 const again=decide(t,7,{day:2,hour:'07:00:00',referenceState:keep.referenceState});
 assert.equal(again.status,'ASK');assert.equal(again.question.kind,'UNREPORTED_TRAINING');
 const pain=decide(t,7,{...AT,...KINDS.SCHEDULE_CHANGE(),eligibility:{...elig(t.p.weeks[7].startDate),pain:true}});
 assert.equal(pain.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(pain.proposal,null);assert.equal(pain.question??null,null);
});
test('R7-C P3-02: same facts, same decision; the strength change kept beside the question is the change itself',()=>{
 const t=timeline(BASE,{g:0,b:7,V:'UNREP'}),rv={...review(t.p,7,{...AT,...KINDS.EQUIPMENT_CHANGE()}),actualLedger:t.ledger};
 const a=evaluateProgram(t.p,rv,opts),b=evaluateProgram(t.p,rv,opts);
 assert.equal(hash(a),hash(b));
 assert.deepEqual(a.proposal.canonical.athlete.equipment,['BENCH','DUMBBELLS','KETTLEBELL']);
 const moved=decide(t,7,{...AT,...KINDS.UNAVAILABLE_STRENGTH_DAY(t,7)}),day4=addDays(t.p.weeks[7].startDate,4);
 assert.ok(moved.proposal.weeks[7].sessions.filter(s=>s.sport==='STRENGTH'&&s.date===day4).every(s=>s.status==='SKIPPED'),'the strength session on the unavailable date is moved or skipped');
});

// ---------- R7C-P3-01 ----------
test('R7-C P3-01: taper and race-week entry with no run ever reported asks; known misses plan the reviewed entry; executed weeks plan the taper',()=>{
 for(const [name,o] of Object.entries(RACES))for(const b of [10,11]){
  const phase=program(o).phases.phases[b];assert.ok(['TAPER','RACE_WEEK'].includes(phase),`${name} week ${b} is ${phase}`);
  const T={EXEC:timeline(o,{g:0,b,V:'EXEC'}),MISS:timeline(o,{g:0,b,V:'MISS'}),UNREP:timeline(o,{g:0,b:b-1,V:'UNREP'})};
  const u=decide(T.UNREP,b-1,{observations:facts(T.UNREP.p,b-1,'UNREP')});
  assert.equal(u.status,'ASK',`${name} ${phase}: ${u.reason}`);assert.equal(u.proposal,null);assert.deepEqual(u.missingInputs,[UNREPORTED]);
  assert.deepEqual([u.question.kind,u.question.dependentScope,u.question.fromWeek],['UNREPORTED_TRAINING','RUN_DOSE',b]);
  const ids=new Set(u.question.unreported.sessionIds),reported=new Set([...T.UNREP.ledger,...u.actualLedger].map(x=>x.sessionId));
  assert.ok(ids.size>0&&T.UNREP.p.weeks.flatMap(x=>x.sessions).filter(s=>ids.has(s.id)).every(s=>s.sport==='RUN'&&!reported.has(s.id)&&s.date>=u.question.referenceWindow.from&&s.date<=u.question.referenceWindow.through));
  const minutes=t=>runs(t.p,b).filter(s=>s.role!=='RACE').map(s=>s.prescription.durationMinutes);
  assert.ok(minutes(T.MISS).every(m=>m<=ENTRY),`${name} ${phase}: reported not done for ten weeks plans the reviewed entry ${minutes(T.MISS)}`);
  assert.ok(minutes(T.EXEC).some(m=>m>ENTRY),`${name} ${phase}: executed weeks plan more than the entry ${minutes(T.EXEC)}`);
 }
});
test('R7-C P3-01: a long gap before the taper asks; a short gap keeps the taper the executed peaks set, never the minimum and never more than executed',()=>{
 const o=RACES.R10K,b=10;
 const long=timeline(o,{g:b-5,b:b-1,V:'UNREP'}),q=decide(long,b-1,{observations:facts(long.p,b-1,'UNREP')});
 assert.equal(q.status,'ASK',q.reason);assert.equal(q.question.kind,'UNREPORTED_TRAINING');
 const plan=V=>{const t=timeline(o,{g:b-1,b,V});return {t,taper:runs(t.p,b).map(s=>`${s.role}:${s.prescription.durationMinutes}`)};};
 const short=plan('UNREP'),miss=plan('MISS'),exec=plan('EXEC');
 assert.ok(short.t.reviews.every(r=>r.status!=='ASK'),'one unreported week with runs known in the window is no question');
 assert.deepEqual(short.taper,miss.taper,'the unreported week holds like a reviewed miss');
 assert.ok(short.taper.some(x=>x.startsWith('QUALITY')||x.startsWith('LONG')),'the taper keeps what was executed: '+short.taper);
 const total=x=>x.taper.reduce((n,y)=>n+Number(y.split(':')[1]),0);
 assert.ok(total(short)<=total(exec),'never more than the executed weeks give');
});
test('R7-C P3-01: a run reported inside the window anchors it: no question, and the taper follows the executed long run, not the minimum',()=>{
 const o=RACES.R10K,b=10,only=s=>s.weekIndex===8&&s.role==='LONG';
 const t=timeline(o,{g:0,b,V:'UNREP',only});
 assert.ok(t.reviews.slice(-1).every(r=>r.status!=='ASK'),t.reviews.at(-1).reason);
 const long=runs(t.p,b).find(s=>s.role==='LONG');
 const ran=t.ledger.find(x=>x.sessionId===t.p.weeks[8].sessions.find(only).id);
 assert.ok(ran&&long&&long.prescription.durationMinutes>ENTRY&&long.prescription.durationMinutes<ran.actual.minutes,`taper long run ${long?.prescription.durationMinutes} from the executed ${ran?.actual.minutes}`);
});
test('R7-C P3-01: a declared interruption before the taper is a known stop (its return recipe applies), and the clinical route comes before the question',()=>{
 const o=RACES.R10K,b=10,g=5;
 // Unknown: weeks 5-9 unreported, the taper entry asks.
 const u=timeline(o,{g,b:b-1,V:'UNREP'}),ask=decide(u,b-1,{observations:facts(u.p,b-1,'UNREP')});
 assert.equal(ask.status,'ASK');assert.equal(ask.question.kind,'UNREPORTED_TRAINING');
 // Declared: the same weeks reported as a 35-day break at the taper entry re-enter by the return's recipe, with no question.
 const d={p:program(o),ledger:[]};for(let w=0;w<g;w++)weekly(d,w);
 const start=d.p.weeks[g].startDate,end=addDays(d.p.weeks[b].startDate,-1);
 const ret=decide(d,b,{...AT,kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:35,reasonCategory:'WORK',reason:'work',nonclinical:true}});
 assert.equal(ret.action,'REESTABLISH',ret.reason);assert.equal(ret.question??null,null);
 // Clinical: a pain flag at the taper entry routes to a human first; nothing is asked or proposed.
 const pain=decide(u,b-1,{observations:facts(u.p,b-1,'UNREP'),eligibility:{...elig(addDays(u.p.weeks[b-1].startDate,6)),pain:true}});
 assert.equal(pain.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(pain.question??null,null);assert.equal(pain.proposal,null);
});

// ---------- R7C-P3-03 ----------
const NO_REPORT=/have no report|has no report/,BREAK=/a break was declared from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/;
/** Every "no report" claim names a date range whose run sessions are, in fact, elapsed and unreported. */
function claimHolds(t,r){
 const m=r.reason.match(/(\d+) run sessions? \((\d{4}-\d{2}-\d{2})(?: to (\d{4}-\d{2}-\d{2}))?\) ha(?:ve|s) no report/);if(!m)return true;
 const [n,from,to]=[Number(m[1]),m[2],m[3]??m[2]],reported=new Set([...t.ledger,...(r.actualLedger??[])].map(x=>x.sessionId));
 const named=t.p.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&s.date>=from&&s.date<=to&&!reported.has(s.id));
 return named.length===n;
}
test('R7-C P3-03: a true gap is named with the sessions that have no report; the claim holds on the record',()=>{
 const o={...race('10K','r7c-p4-c15'),knownExercises:[K('back-squat',3,5,82.5)],equipment:FULL};
 const t={p:program(o),ledger:[]};for(let w=0;w<3;w++)weekly(t,w);
 const r=decide(t,7,{observations:t.p.weeks[7].sessions.filter(live).map(s=>obs(t.p,s))});
 assert.equal(r.action,'GATED_NEXT_STEP');assert.match(r.reason,/re-based, not kept/);assert.match(r.reason,NO_REPORT);
 assert.ok(claimHolds(t,r),r.reason);
 const unreported=t.p.weeks.slice(3,7).flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s));
 assert.match(r.reason,new RegExp(`${unreported.length} run sessions \\(${unreported[0].date} to ${unreported.at(-1).date}\\)`));
});
test('R7-C P3-03: with every week executed no reason claims missing evidence; an ordinary re-base says only that next week follows the executed record',()=>{
 // Every week executed and reviewed: the planned step stands (KEEP), with no re-base.
 const all={p:program(BASE),ledger:[]};for(let w=0;w<8;w++)weekly(all,w);
 assert.doesNotMatch(all.last.reason,NO_REPORT);assert.doesNotMatch(all.last.reason,/re-based/);
 // Every week executed, with a local fatigue report and a missed strength session in week 3: an ordinary re-base.
 const o={id:'r7c-p4-fm',equipment:['DUMBBELLS','BENCH','KETTLEBELL']},t={p:program(o),ledger:[]};for(let w=0;w<3;w++)weekly(t,w);
 const s=t.p.weeks[3].sessions.find(x=>live(x)&&x.sport==='STRENGTH');
 apply(t,decide(t,3,{day:s.day,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}));apply(t,decide(t,3,{day:6,hour:'06:00:00',kind:'MISSED_SESSION',targetSessionId:s.id}));
 const r=decide(t,3,{observations:t.p.weeks[3].sessions.filter(live).map(x=>obs(t.p,x))});
 assert.equal(r.action,'GATED_NEXT_STEP');assert.match(r.reason,/follow the executed record, not the plan’s earlier projection/);
 assert.doesNotMatch(r.reason,NO_REPORT);assert.doesNotMatch(r.reason,BREAK);assert.doesNotMatch(r.reason,/no executed evidence/);
});
test('R7-C P3-03: a declared interruption and a return re-entry are named with their dates, never as unreported training',()=>{
 // A short break declared on day 0 of week 6 (work travel, 5 days), then week 6 executed.
 const a={p:program({id:'r7c-p4-short',equipment:['DUMBBELLS','BENCH','KETTLEBELL']}),ledger:[]};for(let w=0;w<5;w++)weekly(a,w);
 const end=addDays(a.p.weeks[6].startDate,-1);apply(a,decide(a,6,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{reason:'work travel',reasonCategory:'TRAVEL',nonclinical:true,days:5,endDate:end}}));
 const ra=decide(a,6,{observations:a.p.weeks[6].sessions.filter(live).map(s=>obs(a.p,s))});
 // A return reported on day 3 of week 3 after a 3-day break, a late report, then weeks 3 and 4 executed.
 const b={p:program({id:'r7c-p4-reentry'}),ledger:[]};weekly(b,0);weekly(b,1);
 const late=b.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(b,2,{keep:s=>s.id!==late.id});const rep=addDays(b.p.weeks[3].startDate,3);
 apply(b,decide(b,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:b.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}));
 apply(b,decide(b,3,{day:4,hour:'06:00:00',observations:[obs(b.p,late)]}));weekly(b,3);
 const rb=decide(b,4,{observations:b.p.weeks[4].sessions.filter(live).map(s=>obs(b.p,s))});
 for(const [t,r,from,to] of [[a,ra,addDays(end,-4),end],[b,rb,b.p.weeks[3].startDate,addDays(rep,-1)]]){
  assert.equal(r.action,'GATED_NEXT_STEP',r.reason);
  const m=r.reason.match(BREAK);assert.ok(m,r.reason);assert.deepEqual([m[1],m[2]],[from,to]);
  assert.doesNotMatch(r.reason,/no executed evidence/);assert.ok(claimHolds(t,r),r.reason);
 }
});

// ---------- R7C-P3-05: mutation survivors ----------
test('R7-C P3-05 (G01-M5): the days of a declared pause are a known stop, never unreported training',()=>{
 // Weeks 0-1 executed; weeks 2-5 runs reported not done; week 6 neither reported nor reviewed.
 const t={p:program(BASE),ledger:[]};weekly(t,0);weekly(t,1);for(let w=2;w<6;w++)apply(t,decide(t,w,{observations:facts(t.p,w,'MISS')}));
 const w6=t.p.weeks[6],interruption={startDate:w6.startDate,endDate:addDays(w6.startDate,6),days:7,reasonCategory:'WORK',reason:'work',nonclinical:true};
 // Declared as a pause: the window holds no unreported session, so the return re-enters by its recipe from the reviewed entry, with no question.
 const ret=decide(t,7,{...AT,kind:'RETURN_AFTER_PAUSE',interruption});
 assert.equal(ret.action,'REESTABLISH',ret.reason);assert.equal(ret.question??null,null);assert.equal(ret.proposal.decisions.at(-1).interruption.class,'SHORT');
 assert.ok(runs(ret.proposal,7).every(s=>s.prescription.durationMinutes<=ENTRY));
 // Not declared: exactly the pause's run sessions are the unreported ones asked about.
 const ask=decide(t,7,{...AT,...KINDS.SCHEDULE_CHANGE()});
 assert.equal(ask.status,'ASK');assert.deepEqual(ask.question.unreported.sessionIds,w6.sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>s.id));
});
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
function longRuns({until,bad=()=>false,consent=()=>true,pre=()=>null,o={id:'r7c-g02',weeks:16}}){
 const t={p:program(o),ledger:[],results:[],plans:[],reviews:[]};
 for(let w=0;w<until;w++){
  const x=pre(w);if(x)apply(t,decide(t,w,{day:0,hour:'05:00:00',learningConsent:consent(w),...x}));
  const rv={...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s,s.role==='LONG'&&bad(w,s.prescription.durationMinutes)?{response:BAD}:{})),learningConsent:consent(w)}),actualLedger:t.ledger};
  t.plans.push(t.p);t.reviews.push(rv);const r=evaluateProgram(t.p,rv,opts);
  assert.ok(!['UNSUPPORTED','HOLD','ASK'].includes(r.status),`week ${w}: ${r.status} ${r.reason}`);t.results.push(apply(t,r));
 }
 return t;
}
const longOf=(p,w)=>runs(p,w).find(s=>s.role==='LONG').prescription.durationMinutes;
const learnedOf=r=>(r.learnedPatterns??[]).find(x=>x.kind==='LEARNED_MAINTENANCE')??null;
test('R7-C P3-05 (G02-M3): mixed evidence never sustains learned maintenance',()=>{
 // The first 70-minute long run went well, the later ones were followed by adverse responses: the association is mixed.
 const bad=(w,m)=>m>=70&&w!==5,on=longRuns({until:13,bad}),off=longRuns({until:13,bad,consent:()=>false});
 assert.ok(on.results.every(r=>learnedOf(r)===null));
 assert.equal(longOf(on.p,13),longOf(off.p,13));assert.equal(longOf(on.p,13),70);
});
test('R7-C P3-05 (G02-M4): evidence older than maximumAgeDays never sustains learned maintenance; the hold lifts by itself',()=>{
 const max=opts.authority.policy.operational.learning.maximumAgeDays,bad=(w,m)=>m===65&&w<=8;
 const on=longRuns({until:13,bad});
 // Inside the age limit two failed cycles at 65 minutes hold the step (weeks 9 and 10).
 assert.ok([9,10].every(w=>learnedOf(on.results[w])?.stepToMinutes===65),on.results.map(learnedOf).map(x=>x?.stepToMinutes??'-').join());
 // At week 12 the record still holds the four adverse 65-minute runs, two of them older than the limit: what is left no longer holds it.
 const r=on.results[12],asOf=Date.parse(r.updatedModel.asOf),adverse65=on.ledger.filter(x=>x.context?.sessionType==='RUN:LONG'&&x.context.runMinutes===65&&x.response?.recovery==='ADVERSE');
 assert.equal(adverse65.length,4);assert.equal(adverse65.filter(x=>(asOf-Date.parse(x.observedAt))/864e5>max).length,2);
 // The same review without learning (the population rule) gives the same week: the hold has lifted by itself.
 const population=evaluateProgram(on.plans[12],{...on.reviews[12],learningConsent:false},opts);
 assert.equal(learnedOf(r),null);assert.equal(longOf(on.p,13),65);assert.equal(longOf(on.p,13),longOf(population.proposal??on.plans[12],13));
 assert.ok(r.updatedModel.observations.every(x=>(asOf-Date.parse(x.observedAt))/864e5<=max),'the model keeps nothing older than the limit');
});
test('R7-C P3-05 (G02-M8): evidence from another arrangement pool never sustains learned maintenance',()=>{
 const bad=(w,m)=>m>=70&&w<11;
 // New run days from week 12: another arrangement pool, where nothing was observed.
 const pool=longRuns({until:14,bad,pre:w=>w===11?{kind:'SCHEDULE_CHANGE',changes:{runDays:[2,4,6],longRunDay:6}}:null});
 const poolOff=longRuns({until:14,bad,consent:()=>false,pre:w=>w===11?{kind:'SCHEDULE_CHANGE',changes:{runDays:[2,4,6],longRunDay:6}}:null});
 assert.notEqual(pool.p.weeks[13].arrangementId,pool.p.weeks[10].arrangementId);
 assert.ok(pool.results.every(r=>learnedOf(r)===null));assert.equal(longOf(pool.p,13),longOf(poolOff.p,13));
 // Control: new strength days keep the run arrangement pool, and the same evidence still holds the step.
 const same=longRuns({until:14,bad,pre:w=>w===11?{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}:null});
 assert.ok(learnedOf(same.results[12]),'same pool: the association still holds the step');
});
