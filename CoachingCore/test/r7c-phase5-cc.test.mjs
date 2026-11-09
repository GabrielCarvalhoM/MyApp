// R7-C Phase 5, correction cycle (the single cycle after the Engineering review of R7C-FREEZE-1): directed tests for QE-R7C-01..04 and for the
// SSCTR-SD5-01 / R1 condition C9, each over the class the review reproduced (audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes):
// - QE-R7C-01: an answer that a decision recorded without applying it (a refusal, a clinical route) never leaves the stored stale doses valid: the
//   next decision re-plans them from the facts (a run dose ahead above the single-run ceiling the record allows, while the window holds sessions a
//   projection credited, rests on training the record does not show);
// - QE-R7C-02 / C9: the weeks after the answer week never credit that week's sessions that elapsed with no report;
// - QE-R7C-03: a held signal keeps travelling beside a change kept while the question stays open;
// - QE-R7C-04: a held signal never acts outside its week (the week guard);
// - and the trigger's scope: never the timely path, never a dose that stands on facts the record does not keep (the intake, a return's entry).
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,intake,program,review,obs,live,addDays,evaluateProgram,generateProgram} from '../r7/b/fixtures/helpers.mjs';

const ENTRY=opts.authority.policy.operational.return.entryRunMinutes;
const GEN={id:'r7c-cc',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const R10K={id:'r7c-cc-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const CEILING=/exceed what the recorded runs allow/;
const notDone=(p,s)=>({eventId:`r7c-cc-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
const report=(p,from,to,V)=>runSessions(p,from,to).map(s=>V==='MISS'?notDone(p,s):obs(p,s));
/** One decision on timeline t, the reference state chained; t follows the decision. */
function step(t,w,x={}){
 const r=evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},opts);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
/** After qualified clearance the client continues with the carried record and no clinical reference state (the runtime cannot clear it, C3). */
const cleared=t=>({...copy(t),ref:null});
/** Weeks [0,g) executed and reviewed; [g,b-1) RV reviewed with strength only, NR neither; A's review at the end of week b-1 has the gap's run
 * reports, B's does not (it asks). Same construction as test/r7c-phase5.test.mjs. */
function fork(o,{g,b,mode,V}){
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
 step(A,b-1,{observations:[...strength,...facts]});step(B,b-1,{observations:strength});
 return {A,B,facts};
}
const AT=d=>({day:d,hour:'07:00:00'});
const runsFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
const weekRuns=(P,b)=>P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const fromDay=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
const past=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(0,b+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>`${s.id}:${hash(s.prescription??null)}`);};
/** A run dose a known stop never plans (SSCTR-SD-R7C-r2): above the entry, a quality session or a race touch; the race itself is excluded. */
const stale=list=>list.some(x=>/^(QUALITY|RACE_TOUCH)/.test(x)||!/^RACE:/.test(x)&&Number(x.split(':')[1])>ENTRY);
const inForce=(t,r)=>r.proposal??t.p;

test('R7-C QE-R7C-01: an answer a refusal (R4 HOLD) recorded without applying it never leaves the stale doses valid: the next decision re-plans them, as on time (race week)',()=>{
 for(const g of [0,2])for(const mode of ['RV','NR']){
  const b=11,{A,B,facts}=fork(R10K,{g,b,mode,V:'MISS'}),label=`g=${g} ${mode}`;
  const onTime=copy(A),a=step(onTime,b,AT(3)),expected=runsFrom(inForce(onTime,a),b,3);
  assert.ok(!stale(expected),label+': the on-time plan follows the known stop');
  // The answer arrives inside a schedule change in the program's last week: refused (HOLD), the reports recorded.
  const t=copy(B),stored=runsFrom(t.p,b,3),hold=step(t,b,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
  // V1CP A2 amendment (QRE-P5H-F04, K-QRE-P5H-06; disclosed in the V1CP checkpoint): this HOLD was the internal TypeError of a schedule change in
  // the program's last week. The explicit last-week rule keeps the weeks, so the review decides without the error path and applies the recorded
  // answer itself; what follows (the next decision keeps the race week as on time, history intact) is unchanged.
  // V1CP Fix-Forward QRE-V1CPR-C7 (QRE-V1CP-11): pinned to the measured outcome, a re-plan from evidence or a keep, never a question or a route.
  assert.ok([['MODIFY','REPLAN_FROM_EVIDENCE'],['KEEP','KEEP']].some(([s,a])=>hold.status===s&&hold.action===a)&&!/Malformed/.test(hold.reason??''),label+': '+hold.status+' '+hold.action+' '+hold.reason);
  assert.ok(facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId)),label+': the answer is recorded');
  assert.ok(stale(stored),label+': the stored race week still holds the projection');
  for(const [what,x] of [['no observations',{}],['the answer re-sent',{observations:facts}]]){
   const u=copy(t),r=step(u,b,{...AT(3),...x}),inPlan=runsFrom(inForce(u,r),b,3);
   assert.equal(r.planValidity.status,VALID,`${label}, ${what}: ${r.reason}`);
   assert.deepEqual(inPlan,expected,`${label}, ${what}: the race week as on time`);
   assert.ok(!stale(inPlan),`${label}, ${what}: no stale dose valid`);
   assert.deepEqual(past(inForce(u,r),b,3),past(t.p,b,3),`${label}, ${what}: history intact`);
  }
 }
});

test('R7-C QE-R7C-01: an answer a clinical route recorded is applied after clearance; while the clinical reference stands nothing is valid',()=>{
 for(const g of [0,2]){
  const b=7,{A,B,facts}=fork(GEN,{g,b,mode:'RV',V:'MISS'}),label=`g=${g}`;
  const onTime=copy(A),a=step(onTime,b,AT(3)),expected=runsFrom(inForce(onTime,a),b,3);
  const t=copy(B),X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const clin=step(t,b,{...AT(2),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});
  assert.equal(clin.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(clin.proposal,null);
  assert.ok(facts.every(f=>t.ledger.some(o=>o.sessionId===f.sessionId)),label+': the answer is recorded');
  // The clinical reference stands: still clinical, nothing proposed or validated.
  const sticky=step(copy(t),b,AT(3));
  assert.equal(sticky.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(sticky.proposal,null);assert.notEqual(sticky.planValidity.status,VALID);
  for(const [what,x] of [['no observations',{}],['the answer re-sent',{observations:facts}],['a systemic fatigue',{kind:'SYSTEMIC_FATIGUE'}]]){
   const u=cleared(t),r=step(u,b,{...AT(3),...x}),inPlan=runsFrom(inForce(u,r),b,3);
   assert.equal(r.planValidity.status,VALID,`${label}, after clearance, ${what}: ${r.reason}`);
   assert.ok(!stale(inPlan),`${label}, after clearance, ${what}: ${JSON.stringify(inPlan)}`);
   if(what!=='a systemic fatigue')assert.deepEqual(inPlan,expected,`${label}, after clearance, ${what}: as on time`);
  }
 }
 // A clinical return report (illness) carrying the answer, then clearance.
 const b=7,{B,facts}=fork(GEN,{g:2,b,mode:'RV',V:'MISS'}),t=copy(B),end=addDays(t.p.weeks[b].startDate,1);
 const clin=step(t,b,{...AT(2),kind:'RETURN_AFTER_PAUSE',observations:facts,interruption:{startDate:t.p.weeks[b].startDate,endDate:end,days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}});
 assert.equal(clin.status,'CLINICAL_HUMAN_REQUIRED');
 // R7-D Phase 3.1 (QE-R7D-P3-01(b); Founder D2-D3; F08 unchanged): the illness break is a fact the record keeps through the clinical route and
 // the clearance. Read again after it, its clinical reason routes to a human, as the same break stated again does (no nonclinical return recipe,
 // no clearance synthesized); R7D-FREEZE-1 dropped the break and validated the plan. The answer stays recorded; no dose is proposed or validated.
 for(const x of [{},{observations:facts}]){const u=cleared(t),r=step(u,b,{...AT(3),...x});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.equal(r.proposal,null);assert.notEqual(r.planValidity.status,VALID);assert.ok(facts.every(f=>u.ledger.some(o=>o.sessionId===f.sessionId)),'the answer stays recorded');assert.ok(u.ledger.some(o=>o.fact==='INTERRUPTION_DECLARED'&&o.interruption.reasonCategory==='ILLNESS'),'the break stays recorded');}
});

test('R7-C QE-R7C-02 / C9 (SSCTR-SD5-01): after a known-stop answer later in the week, the week after it is planned as on time; the elapsed sessions with no report are never credited (taper to race week included)',()=>{
 for(const [name,o,b] of [['GEN',GEN,7],['R10K taper to race week',R10K,10]])for(const g of [0,2])for(const mode of ['RV','NR']){
  const {A,B,facts}=fork(o,{g,b,mode,V:'MISS'}),t=copy(B),label=`${name} g=${g} ${mode}`;
  const elapsed=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<addDays(t.p.weeks[b].startDate,2));
  assert.ok(elapsed.length&&stale(elapsed.map(s=>`${s.role}:${s.prescription.durationMinutes}`))||name!=='GEN',label+': a stale run elapsed before the answer');
  const r=step(t,b,{...AT(2),observations:facts});
  assert.equal(r.planValidity.status,VALID,label+': '+r.reason);
  assert.deepEqual(weekRuns(t.p,b+1),weekRuns(A.p,b+1),label+': week b+1 as on time');
 }
 // The answer week's own review skipped: the first decision of week b+1 keeps a plan the facts allow (no dose above the ceiling, no quality).
 for(const g of [0,2])for(const mode of ['RV','NR']){
  const b=7,{A,B,facts}=fork(GEN,{g,b,mode,V:'MISS'}),t=copy(B),label=`first decision of week b+1, g=${g} ${mode}`;
  step(t,b,{...AT(2),observations:facts});
  const day=d=>addDays(t.p.weeks[b].startDate,d),runOn=d=>t.p.weeks[b].sessions.filter(s=>live(s)&&s.date===day(d)&&s.sport==='RUN');
  step(t,b,{day:4,hour:'07:00:00',observations:runOn(3).map(s=>obs(t.p,s))});
  for(const [what,x] of [['plain review',{}],['the day-6 long run reported',{observations:runOn(6).map(s=>obs(t.p,s))}],['a schedule change',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}]]){
   const u=copy(t),r=step(u,b+1,{...AT(0),...x}),inPlan=weekRuns(inForce(u,r),b+1);
   if(r.planValidity.status!==VALID)continue;
   assert.ok(!inPlan.some(z=>/^QUALITY/.test(z)),`${label}, ${what}: ${JSON.stringify(inPlan)}`);
   assert.deepEqual(inPlan,weekRuns(A.p,b+1),`${label}, ${what}: as on time`);
  }
 }
});

test('R7-C QE-R7C-03: a held signal keeps travelling beside a change kept while the question stays open, and is re-evaluated with the answer as on time',()=>{
 for(const V of ['MISS','EXEC']){
  const b=7,{A,B,facts}=fork(GEN,{g:0,b,mode:'RV',V}),day4=addDays(A.p.weeks[b].startDate,4);
  const a=copy(A);step(a,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'});step(a,b,{day:1,hour:'07:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day4]}});
  const t=copy(B),held=step(t,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'});
  assert.equal(held.status,'ASK');assert.equal(held.referenceState.pending.signal?.kind,'SYSTEMIC_FATIGUE');
  const kept=step(t,b,{day:1,hour:'07:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day4]}});
  assert.ok(kept.proposal,V+': the change is kept beside the open question');assert.equal(kept.planValidity.status,'REQUIRES_RECONCILIATION');
  assert.equal(kept.referenceState.pending.signal?.kind,'SYSTEMIC_FATIGUE',V+': the held fatigue keeps travelling');
  const r=step(t,b,{...AT(2),observations:facts});
  assert.match(r.reason,/systemic fatigue reported on .* with the question is re-evaluated with the answer/,V);
  assert.deepEqual(fromDay(t.p,b,2),fromDay(a.p,b,2),V+': the same plan in force as the fatigue applied on time');
  assert.equal(r.referenceState.pending,null);assert.equal(r.planValidity.status,VALID);
 }
});

test('R7-C QE-R7C-04: a signal held at the end of its week is never replayed in the next week (the week guard)',()=>{
 const {B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),t=copy(B);
 const held=step(t,7,{day:6,hour:'22:00:00',kind:'SYSTEMIC_FATIGUE'});
 assert.equal(held.status,'ASK');assert.deepEqual([held.referenceState.pending.signal?.kind,held.referenceState.pending.signal?.weekIndex],['SYSTEMIC_FATIGUE',7]);
 const r=step(t,8,{...AT(0),observations:[...facts,...runSessions(t.p,7,8).map(s=>notDone(t.p,s))]});
 assert.doesNotMatch(r.reason??'',/re-evaluated with the answer/,'a week’s signal acts on that week only');
 assert.equal(r.planValidity.status,VALID,r.reason);assert.equal(r.referenceState.pending,null);
});

test('R7-C QE-R7C-01 trigger scope: a dose standing on facts the record does not keep, or planned on time, is never re-planned by the ceiling',()=>{
 // Cold starts: week 0 stands on the intake (an unknown weekly volume has no recorded run; a start on the intake day has the intake run on day 0).
 for(const [label,o,asOf] of [['EASY_UNKNOWN',{id:'r7c-cc-u',recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null,strengthDaysPerWeek:2}},'2026-11-01'],['start on the intake day',{id:'r7c-cc-d'},'2026-11-02'],['QUALITY start on the intake day',{id:'r7c-cc-q',runExperience:'ADVANCED',recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:90,strengthDaysPerWeek:2},schedule:{runDays:[1,2,4,6]}},'2026-11-02']]){
  const g=generateProgram({...intake(o),asOf,athlete:{...intake(o).athlete,eligibility:elig(asOf)}},opts);assert.ok(g.program,label+': '+g.reason);
  const p=g.program;
  for(const x of [{day:0},{day:2,hour:'07:00:00'}]){const r=evaluateProgram(p,review(p,0,x),opts);assert.equal(r.status,'KEEP',`${label} day ${x.day}: ${r.reason}`);assert.equal(r.proposal??null,null);}
 }
 // On time: every session reported at its own reviews (mid-week and end of week): no decision re-plans by the ceiling.
 for(const o of [GEN,R10K]){
  const t={p:program(o),ledger:[],ref:null};
  for(let w=0;w<5;w++){
   const cut=addDays(t.p.weeks[w].startDate,2);
   for(const x of [{...AT(2),observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date<cut).map(s=>obs(t.p,s))},{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date>=cut).map(s=>obs(t.p,s))}]){
    const r=step(t,w,x);assert.doesNotMatch(r.reason??'',CEILING,`${o.id} week ${w}: ${r.reason}`);
   }
  }
 }
 // A return's entry stands on the interruption's facts with its current demonstration (not kept in the record): the re-entry week's later
 // decisions never re-plan it by the ceiling; nor does the ceiling read a return or restart week, which follows its own re-entry recipe.
 const demo=(t,day,minutes)=>({observedAt:`${addDays(day,-1)}T07:00:00Z`,sport:'RUN',family:'EASY',minutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'});
 const RG={id:'r7c-cc-r',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}};
 for(const days of [18,35]){
  const t={p:program(GEN),ledger:[],ref:null};step(t,0,{observations:t.p.weeks[0].sessions.filter(live).map(s=>obs(t.p,s))});
  const R=1+Math.ceil(days/7);
  const ret=step(t,R,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true,endDate:t.p.weeks[R].startDate},currentDemonstration:demo(t,addDays(t.p.weeks[R].startDate,2),30)});
  assert.ok(ret.proposal,`days ${days}: ${ret.reason}`);
  for(const x of [{day:4,hour:'07:00:00'},{}]){const r=step(t,R,x);assert.doesNotMatch(r.reason??'',CEILING,`days ${days}: ${r.reason}`);}
 }
 // A return report decides its own re-entry from the break it declares, never the ceiling (the timelines return:gen:* of regress-r7b2: weeks 0-4
 // reviewed, week 5 unreported, the break ending the day before week 6, reported on its first day).
 for(const days of [5,12,40]){
  const t={p:program({id:'r7c-cc-ret',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],weeks:12}),ledger:[],ref:null};
  for(let w=0;w<5;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
  const r=step(t,6,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{reason:'work travel',reasonCategory:'TRAVEL',nonclinical:true,days,endDate:addDays(t.p.weeks[6].startDate,-1)}});
  assert.equal(r.action,'REESTABLISH',`days ${days}: ${r.reason}`);assert.doesNotMatch(r.reason,CEILING,`days ${days}`);
 }
 {// A short break after a known stop (weeks 0-4 reviewed, their runs reported not done), the return on the break's last day + 1 with a 25-minute
  // demonstration the day before: the re-entry week (easy running) is planned from the demonstration and kept.
  const t={p:program(RG),ledger:[],ref:null};
  for(let w=0;w<5;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>s.sport==='RUN'?notDone(t.p,s):obs(t.p,s))});
  const start=t.p.weeks[5].startDate,ret=step(t,5,{day:6,hour:'12:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:addDays(start,5),days:6,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:demo(t,addDays(start,6),25)});
  assert.ok(ret.proposal,ret.reason);assert.equal(t.p.weeks[6].startAuthority.RUN.provenance,'RETURN_ENTRY');assert.equal(t.p.stateTrace[6].run.mode,'EASY');
  const entry=weekRuns(t.p,6);assert.ok(entry.some(z=>Number(z.split(':')[1])>ENTRY),JSON.stringify(entry));
  const r=step(t,6,{day:1,hour:'07:00:00'});assert.equal(r.status,'KEEP',r.reason);assert.deepEqual(weekRuns(inForce(t,r),6),entry);
 }
 {// A moderate break (return steps), the re-entry week unreported: the week after it follows the return recipe, as before this cycle.
  const t={p:program(RG),ledger:[],ref:null},start=t.p.weeks[2].startDate,end=addDays(start,19),retDate=addDays(t.p.weeks[4].startDate,6);
  const ret=step(t,4,{day:6,hour:'12:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:20,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:demo(t,retDate,40)});
  assert.ok(ret.proposal,ret.reason);assert.equal(t.p.stateTrace[5].run.mode,'RETURN');
  const stored=weekRuns(t.p,6),r=step(t,6,{day:1,hour:'07:00:00'});
  assert.equal(r.status,'KEEP',r.reason);assert.deepEqual(weekRuns(inForce(t,r),6),stored);
 }
 // G01 first: when the decision asks about unknown training (here a schedule change whose next week's window has no recorded run), the ceiling
 // re-plan never travels with the question: it asks with no proposal, as without the re-plan (the fixture of the Phase 4 G01 grid, GEN b7 g3 NR).
 {
  const t={p:program({id:'adv-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}}),ledger:[],ref:null};
  for(let w=0;w<3;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
  const late=[3,4,5,6].flatMap(w=>strengthOf(t.p,w)),r=evaluateProgram(t.p,{...review(t.p,7,{...AT(0),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:late}),actualLedger:t.ledger},opts);
  assert.equal(r.status,'ASK',r.reason);assert.equal(r.question?.kind,'UNREPORTED_TRAINING');assert.equal(r.proposal,null,'no run dose planned while the question stands');
  assert.doesNotMatch(r.reason,CEILING);assert.equal(r.planValidity.status,'REQUIRES_RECONCILIATION');
 }
 // The class it reaches: weeks never reported, the intake run still in the window: the stored doses above the facts' ceiling are re-planned.
 // (The fixture of r7a-cycle2.test.mjs:111: the stored week 2 credits weeks 0-1, with the intake's 50-minute run the only one recorded.)
 const p=program({id:'r7c-cc-n',goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],schedule:{runMinutes:50,strengthMinutes:50,longRunMinutes:80}});
 const stored=weekRuns(p,2),r=evaluateProgram(p,review(p,2,{day:0}),opts);
 assert.ok(stored.some(z=>Number(z.split(':')[1])>55),'the projection stored above the facts: '+JSON.stringify(stored));
 assert.match(r.reason,CEILING);assert.equal(r.planValidity.status,VALID);
 assert.ok(weekRuns(r.proposal,2).every(z=>Number(z.split(':')[1])<=55)&&!weekRuns(r.proposal,2).some(z=>/^QUALITY/.test(z)),JSON.stringify(weekRuns(r.proposal,2)));
 assert.deepEqual(past(r.proposal,2,0),past(p,2,0),'history intact');
});
