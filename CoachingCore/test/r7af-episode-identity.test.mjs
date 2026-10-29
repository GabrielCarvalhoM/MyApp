// DOMAIN_COACHING_R7-A Final Closure: interruption episode identity and the state the athlete had executed when an interruption began
// (Founder request §0, I1–I9, P1–P6, §13; audits/domain-coaching-r7a-final-2026-10-28/INTERRUPTION_EPISODE_CONTRACT.md). Each test names the
// invariant and the blocker it covers (QE-R7A2-01 through QE-R7A1-09/10, QE-R7A2-02/03, SSCTR NF-1/R37). Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,cls='KNOWN',schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')]:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7af-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** An as-prescribed report of session s, executed on `day` (its own date by default) in its shift; `reportedAt` when synced later. */
function obs(p,s,{day=s.date,hour=null,reportedAt=null}={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`t7af-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${day}T${hour??(s.turn==='PM'?'19:00:00':'08:00:00')}Z`,...(reportedAt?{reportedAt}:{}),actual,response:{...OK}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const report=(t,w,day,hour,keep,kind='WEEKLY_REVIEW')=>step(t,at(t.p,w,day,hour,{kind,observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const returns=P=>P.decisions.filter(d=>d.action==='REESTABLISH');
const lastReturn=P=>returns(P).at(-1);
const episodes=P=>new Set(returns(P).map(d=>d.interruption.episode));
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
/** No strength row back at the dose before the first break (the pre-break known load at three sets or more), no long run above re-entry. */
const preBreakDose=(P,w,from)=>strengthRows(P,w,from).filter(({e})=>e.load.mode==='KNOWN'&&e.sets>=3);
const longs=(P,w,from)=>P.weeks[w].sessions.filter(s=>live(s)&&s.role==='LONG'&&s.date>=from).map(s=>s.prescription.durationMinutes);
/** Weeks 0-2 trained and reviewed, 3-4 untrained (the first break), then a 16-day return on Monday 06:00 of week 5 (re-entry that week). */
function afterFirstReturn(id){
 const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 return {t,d0,A:lastReturn(t.p)};
}
/** The first loaded week F (strength Monday and Thursday evenings; runs Tuesday, Friday, Sunday mornings); the weeks before it trained and reviewed. */
function firstLoaded(id,cls='FAMILIAR'){
 const g=generateProgram(intake({id,cls,schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}}),opts),t={p:g.program,ledger:[]};
 const F=t.p.weeks.findIndex(x=>strengthRows(t.p,x.index).some(({e})=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE'));
 for(let w=0;w<F;w++)weekly(t,w);
 return {t,F,d:t.p.weeks[F].startDate};
}
const monday=(P,F)=>P.weeks[F].sessions.filter(s=>live(s)&&s.day===0);

test('R7-A final I1/I3 (§13 same episode, 0.6): a correction names its interruption, keeps its identity and reads the state at its new start',()=>{
 // A 15-day break from Saturday of the first loaded week, reported Saturday two weeks later: Monday's and Thursday's lifting came before it.
 const {t,F,d}=firstLoaded('t7af-same'),thursdayOnly=[...new Set(strengthRows(t.p,F).filter(({date})=>date===addDays(d,3)).map(({e})=>e.id))].filter(id=>!strengthRows(t.p,F).some(({date,e})=>date===d&&e.id===id));
 assert.ok(thursdayOnly.length,'an exercise lifted only on Thursday');
 weekly(t,F,s=>s.day<5);weekly(t,F+1,()=>false);
 const r=step(t,at(t.p,F+2,5,'06:00:00',brk(addDays(d,5),addDays(d,19)))),A=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH');assert.equal(A.interruption.relation,'NEW');assert.equal(A.interruption.revision,1);
 for(const id of thursdayOnly)assert.equal(A.interruption.entry.strength.exercises[id]?.returnStep,0,id+' lifted before Saturday');
 // Unmarked, a report with other dates is asked (0.4); the correction moves the start to Tuesday: Thursday's lifting is now after it (0.6).
 assert.equal(evaluate(t,at(t.p,F+2,6,'06:00:00',brk(addDays(d,1),addDays(d,19)))).status,'ASK');
 step(t,at(t.p,F+2,6,'06:00:00',brk(addDays(d,1),addDays(d,19),{episodeId:A.interruption.episode})));const C=lastReturn(t.p);
 assert.deepEqual([C.interruption.relation,C.interruption.episode,C.interruption.supersedes,C.interruption.basis,C.interruption.revision],['SAME_BREAK',A.interruption.episode,A.eventId,'EXPLICIT',2]);
 assert.equal(episodes(t.p).size,1,'one interruption');
 for(const id of thursdayOnly)assert.equal(C.interruption.entry.strength.exercises[id],undefined,id+' is after the corrected start');
 for(const {e} of strengthRows(t.p,F).filter(({date})=>date===d))assert.equal(C.interruption.entry.strength.exercises[e.id]?.returnStep,0,e.id+' lifted on Monday');
 // Corrected again, by naming one of its reports instead of its identity: still the same interruption, revision 3.
 step(t,at(t.p,F+2,6,'07:00:00',brk(addDays(d,5),addDays(d,19),{episodeId:C.eventId})));const D=lastReturn(t.p);
 assert.deepEqual([D.interruption.episode,D.interruption.supersedes,D.interruption.revision],[A.interruption.episode,C.eventId,3]);
 assert.deepEqual(D.interruption.entry.strength,A.interruption.entry.strength,'back to the first dates: back to their state');
 // A correction that moves the interruption after its own first report never starts from one of its own reports.
 const {t:m,d0,A:M}=afterFirstReturn('t7af-same-moved');
 step(m,at(m.p,5,3,'06:00:00',brk(addDays(d0,1),addDays(d0,2),{episodeId:M.interruption.episode})));const MC=lastReturn(m.p);
 assert.equal(MC.interruption.relation,'SAME_BREAK');assert.ok(MC.interruption.stateAt.eventId!==M.eventId,'not its own earlier report');
});

test('R7-A final I2/I4/P1 (QE-R7A2-01): a report of the first break made after a separate break began never turns that break into the first',()=>{
 for(const [fix,label] of [[(d0,A)=>brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long work trip'}),'duplicate'],[(d0,A)=>brk(addDays(d0,-17),addDays(d0,-1),{episodeId:A.interruption.episode}),'named correction']]){
  for(const fixAt of [[5,2,'22:00:00'],[6,0,'06:00:00']]){
   const {t,d0,A}=afterFirstReturn('t7af-p17');report(t,5,3,'05:00:00',s=>s.day<3);
   // A's report again (P1: only its time moves), then the separate trip B, Thursday to Sunday, reported Monday 07:00.
   step(t,at(t.p,...fixAt,fix(d0,A)));const A2=lastReturn(t.p);
   assert.deepEqual([A2.interruption.relation,A2.interruption.episode],['SAME_BREAK',A.interruption.episode],label);
   const r=step(t,at(t.p,6,0,'07:00:00',brk(addDays(d0,3),addDays(d0,6)))),B=lastReturn(t.p);
   assert.equal(r.action,'REESTABLISH');assert.equal(B.interruption.relation,'NEW',label);assert.notEqual(B.interruption.episode,A.interruption.episode);
   assert.equal(episodes(t.p).size,2,'two interruptions');assert.equal(B.interruption.stateAt.kind,'RETURN');
   // B starts from the report of A in force when B began: A's first report when A was reported again after B began (I4, 0.5).
   assert.equal(B.interruption.stateAt.eventId,fixAt[0]===6?A.eventId:A2.eventId,label);
   for(const w of [6,7])assert.deepEqual(preBreakDose(t.p,w,t.p.weeks[6].startDate),[],`${label} week ${w}`);
   assert.ok(longs(t.p,6,t.p.weeks[6].startDate).every(m=>m<=25),label+': no long run back at the pre-break length');
  }
 }
 // With no training logged between them: B begins after A's first report (its re-entry), so it is new even when A's newer report came
 // later; re-entry is read from the first report, never the latest one.
 const {t,d0,A}=afterFirstReturn('t7af-p17-untrained');
 step(t,at(t.p,5,4,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long work trip'})));
 step(t,at(t.p,5,4,'07:00:00',brk(addDays(d0,1),addDays(d0,3))));const B=lastReturn(t.p);
 assert.deepEqual([B.interruption.relation,B.interruption.basis,B.interruption.stateAt.eventId],['NEW','AFTER_REENTRY',A.eventId]);
});

test('R7-A final P3: a second break after the re-entry leaves the first break’s identity, record and state untouched',()=>{
 const {t,d0,A}=afterFirstReturn('t7af-p3');report(t,5,3,'05:00:00',s=>s.day<3);
 step(t,at(t.p,5,6,'08:00:00',brk(addDays(d0,3),addDays(d0,5))));
 const a=t.p.decisions.find(d=>d.eventId===A.eventId);
 assert.deepEqual(a,A,'the first report is recorded as it was');assert.equal(episodes(t.p).size,2);
 assert.ok(returns(t.p).every(d=>d.interruption.supersedes!==A.eventId),'nothing supersedes the first break');
});

test('R7-A final P5 (§13 cross week): a separate break gives the same start in the re-entry week or the next one when nothing else was decided',()=>{
 const {t,d0,A}=afterFirstReturn('t7af-p5');report(t,5,2,'21:00:00',s=>s.day<3);
 // Same week: Thursday-Friday, reported Saturday. Next week: Monday-Tuesday, reported Wednesday, with the re-entry week neither reviewed nor
 // finished: its planned start assumes return steps the athlete did not take, so it is not the point (§10).
 const same=copy(t);step(same,at(same.p,5,5,'06:00:00',brk(addDays(d0,3),addDays(d0,4))));const S=lastReturn(same.p);
 const cross=copy(t);step(cross,at(cross.p,6,2,'06:00:00',brk(addDays(d0,7),addDays(d0,8))));const X=lastReturn(cross.p);
 for(const B of [S,X]){assert.equal(B.interruption.relation,'NEW');assert.deepEqual([B.interruption.stateAt.kind,B.interruption.stateAt.eventId,B.interruption.stateAt.week],['RETURN',A.eventId,5]);}
 assert.deepEqual(X.interruption.entry,S.interruption.entry,'the same start on either side of the week boundary');
 assert.equal(X.interruption.entry.run.mode,'RETURN');assert.equal(X.interruption.entry.run.returnStep,0);
 // Reviewed on Sunday instead (Thursday to Sunday missed): the review decides the next start from what was executed (a step only where the
 // executed exposures earned it, SSCTR S-F), and the next-week break starts from that decision, never from more.
 const reviewed=copy(t);weekly(reviewed,5,()=>false);const decided=reviewed.p.stateTrace[6];
 step(reviewed,at(reviewed.p,6,2,'06:00:00',brk(addDays(d0,7),addDays(d0,8))));const R=lastReturn(reviewed.p);
 assert.equal(R.interruption.stateAt.kind,'WEEK_START');assert.deepEqual([R.interruption.entry.run.mode,R.interruption.entry.run.returnStep],[decided.run.mode,decided.run.returnStep]);
 for(const [id,e] of Object.entries(decided.strength.exercises))assert.equal(R.interruption.entry.strength.exercises[id].returnStep,e.returnStep,id);
 for(const P of [cross.p,reviewed.p])for(const w of [6,7])assert.deepEqual(preBreakDose(P,w,addDays(d0,9)),[]);
});

test('R7-A final I8 (§13 short + short, QE-R7A1-10): a second short break after the first one’s slot was run has its own slot, whatever came between',()=>{
 const t=start({id:'t7af-short'},3),w=3,d0=t.p.weeks[w].startDate;
 step(t,at(t.p,w,0,'06:00:00',brk(addDays(d0,-6),addDays(d0,-1))));const A=lastReturn(t.p);
 report(t,w,2,'05:00:00',s=>s.day<=1);
 assert.equal(t.p.weeks[w].sessions.find(s=>s.day===1&&s.sport==='RUN').easedFor,A.interruption.episode,'the first slot, run');
 // A's report again after B ended (a duplicate), then B: B is a break of its own and eases its own slot.
 step(t,at(t.p,w,5,'06:00:00',brk(addDays(d0,-6),addDays(d0,-1),{reason:'Long work trip'})));
 step(t,at(t.p,w,5,'07:00:00',brk(addDays(d0,2),addDays(d0,4))));const B=lastReturn(t.p);
 assert.equal(B.interruption.relation,'NEW');weekly(t,w,s=>s.day>=5);
 const tue=t.p.weeks[w+1].sessions.find(s=>s.sport==='RUN'&&s.day===1);
 assert.equal(tue.role,'EASY');assert.equal(tue.easedFor,B.interruption.episode);
});

test('R7-A final I6 (§13 late session, 0.7, QE-R7A2-02, SSCTR R37): Monday’s lifting synced after a Wednesday break began counts; after its return it is confirmed first',()=>{
 const brkWF=d=>brk(addDays(d,2),addDays(d,4));
 // (a) Synced Friday evening, before the return: report time alone never decides causality (I6), the lifting is before the break.
 const a=firstLoaded('t7af-late-a');step(a.t,at(a.t.p,a.F,4,'21:00:00',{kind:'PARTIAL_SESSION',observations:monday(a.t.p,a.F).map(s=>obs(a.t.p,s,{reportedAt:`${addDays(a.d,4)}T21:00:00Z`}))}));
 step(a.t,at(a.t.p,a.F,5,'06:00:00',brkWF(a.d)));const RA=lastReturn(a.t.p);
 const mondayIds=[...new Set(monday(a.t.p,a.F).flatMap(s=>s.prescription?.exercises?.map(e=>e.id)??[]))];
 for(const id of mondayIds)assert.ok(RA.interruption.entry.strength.exercises[id],id+' in the state at Wednesday');
 // (b) The return first, the sync an hour later: the sync is recorded and asks to confirm the break (confirmation-first); nothing else changes.
 const b=firstLoaded('t7af-late-b');step(b.t,at(b.t.p,b.F,5,'06:00:00',brkWF(b.d)));const RB=lastReturn(b.t.p),before=b.t.p;
 for(const id of mondayIds)assert.equal(RB.interruption.entry.strength.exercises[id],undefined,id+' not yet recorded');
 const sync=evaluate(b.t,at(b.t.p,b.F,5,'07:00:00',{kind:'PARTIAL_SESSION',observations:monday(b.t.p,b.F).map(s=>obs(b.t.p,s,{reportedAt:`${addDays(b.d,5)}T07:00:00Z`}))}));
 assert.equal(sync.status,'ASK');assert.deepEqual(sync.missingInputs,['interruption.episodeId']);assert.equal(sync.question.episodeId,RB.interruption.episode);assert.equal(sync.proposal,null);
 assert.ok(sync.actualLedger.some(o=>o.sessionId===monday(before,b.F)[0].id),'the late execution is recorded');b.t.ledger=sync.actualLedger;
 // Confirmed (the same dates again): the same break, now reading Monday; the state equals the one read in time.
 step(b.t,at(b.t.p,b.F,5,'08:00:00',brkWF(b.d)));const RC=lastReturn(b.t.p);
 assert.deepEqual([RC.interruption.relation,RC.interruption.basis,RC.interruption.episode],['SAME_BREAK','DUPLICATE',RB.interruption.episode]);
 assert.deepEqual(RC.interruption.entry.strength,RA.interruption.entry.strength);
 // A session of the break's first day logged after the return gives a reading the return did not have: confirmed first as well.
 const f=firstLoaded('t7af-late-f'),thu=f.t.p.weeks[f.F].sessions.filter(s=>live(s)&&s.day===3);
 step(f.t,at(f.t.p,f.F,5,'06:00:00',brk(addDays(f.d,3),addDays(f.d,4))));
 assert.equal(evaluate(f.t,at(f.t.p,f.F,5,'07:00:00',{kind:'PARTIAL_SESSION',observations:thu.map(s=>obs(f.t.p,s))})).status,'ASK');
 // Once its re-entry week was reviewed, a late fact is read as every late fact is read: no question (declared bound).
 const c=firstLoaded('t7af-late-c');step(c.t,at(c.t.p,c.F,5,'06:00:00',brkWF(c.d)));weekly(c.t,c.F,()=>false);weekly(c.t,c.F+1);
 const after=evaluate(c.t,at(c.t.p,c.F+2,1,'07:00:00',{kind:'PARTIAL_SESSION',observations:monday(c.t.p,c.F).map(s=>obs(c.t.p,s,{reportedAt:`${addDays(c.d,15)}T07:00:00Z`}))}));
 assert.notEqual(after.status,'ASK');
});

test('R7-A final I7/P4 (§13 same day, 0.8, SSCTR NF-1): a session on the first day counts by the stated start time, and is asked without one',()=>{
 // A 14-day break from Monday of the first loaded week; Monday's lifting at 19:00, sent with the return.
 const run=(cls,startedAt)=>{const {t,F,d}=firstLoaded('t7af-sd-'+cls+(startedAt??''),cls);const back=addDays(d,14);
  const r=evaluate(t,at(t.p,F+2,0,'06:00:00',{...brk(d,addDays(d,13),startedAt?{startedAt:`${d}T${startedAt}Z`}:{}),observations:monday(t.p,F).map(s=>obs(t.p,s))}));
  return {r,ids:[...new Set(monday(t.p,F).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode!=='BODYWEIGHT').map(e=>e.id)))],back};};
 const before=run('FAMILIAR','21:00:00'),afterIt=run('FAMILIAR','06:00:00'),unknown=run('FAMILIAR');
 const entryOf=r=>r.proposal.decisions.at(-1).interruption.entry.strength.exercises;
 for(const id of before.ids)assert.equal(entryOf(before.r)[id]?.returnStep,0,id+': lifted before the break began');
 for(const id of afterIt.ids)assert.equal(entryOf(afterIt.r)[id],undefined,id+': lifted after the break began');
 assert.equal(unknown.r.status,'ASK');assert.deepEqual(unknown.r.missingInputs,['interruption.startedAt']);
 // When the order changes no fact the return starts from, the date alone is enough and the other reading is recorded: a 16-day break from a
 // Saturday whose lifting was executed that evening (every exercise already in use, its ceiling unchanged; only the last performed date differs).
 const {A}=afterFirstReturn('t7af-sd-immaterial');assert.ok(A.interruption.stateAt.sameDay,'the other reading is recorded');
 // A stated start time on another day than the start date is asked.
 const {t,F,d}=firstLoaded('t7af-sd-bad');
 assert.deepEqual(evaluate(t,at(t.p,F+2,0,'06:00:00',brk(d,addDays(d,13),{startedAt:`${addDays(d,1)}T06:00:00Z`}))).missingInputs,['interruption.startedAtContradictsStartDate']);
});

test('R7-A final P6: the same report twice adds nothing; the same record again is the same interruption',()=>{
 const {t,d0,A}=afterFirstReturn('t7af-p6'),n=t.p.decisions.length,again=at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1)));
 const replay={...again,event:{...again.event,id:A.eventId}};
 const r=evaluate(t,replay);assert.equal(r.status,'KEEP');assert.equal(r.proposal,null);
 // One event id with other facts is asked, never applied.
 assert.deepEqual(evaluate(t,{...replay,interruption:{...replay.interruption,reason:'Holiday'}}).missingInputs,['event.id']);
 step(t,again);assert.equal(t.p.decisions.length,n+1);assert.equal(episodes(t.p).size,1);
 assert.deepEqual([lastReturn(t.p).interruption.basis,lastReturn(t.p).interruption.revision],['DUPLICATE',2]);
});

test('R7-A final I9 (0.4, §9, QE-R7A2-03): without a name, dates that touch or overlap are asked; a correction of an earlier break is asked',()=>{
 const {t,d0,A}=afterFirstReturn('t7af-i9');
 // Overlapping A without its name, and a new name for A's days: asked, never merged and never a new break.
 for(const extra of [{},{episodeId:'another-trip'}]){const r=evaluate(t,at(t.p,5,0,'08:00:00',brk(addDays(d0,-10),addDays(d0,-1),extra)));assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['interruption.episodeId']);}
 // A separate break after the re-entry, then a named correction of the first one: asked (a later break set the plan).
 report(t,5,3,'05:00:00',s=>s.day<3);step(t,at(t.p,5,5,'06:00:00',brk(addDays(d0,3),addDays(d0,4))));
 const late=evaluate(t,at(t.p,5,5,'07:00:00',brk(addDays(d0,-17),addDays(d0,-1),{episodeId:A.interruption.episode})));
 assert.equal(late.status,'ASK');assert.equal(late.proposal,null);
 // ... even when the named correction would move it after the later one; and a correction of the later one that reaches back across the
 // earlier re-entry is asked too.
 assert.equal(evaluate(t,at(t.p,5,5,'07:00:00',brk(addDays(d0,5),addDays(d0,5),{episodeId:A.interruption.episode}))).status,'ASK');
 assert.deepEqual(evaluate(t,at(t.p,5,5,'07:00:00',brk(addDays(d0,-1),addDays(d0,4),{episodeId:lastReturn(t.p).interruption.episode}))).missingInputs,['interruption.startDate','interruption.endDate']);
 // A first report made late, with its end stated (Monday-Tuesday, reported Saturday), after training on Wednesday: a break on Thursday-Friday
 // is a separate one (training between), starting from the start that report set; without the training it is asked.
 for(const trained of [true,false]){
  const g=start({id:'t7af-p21-'+trained},3),w=3,e0=g.p.weeks[w].startDate;
  if(trained)report(g,w,2,'21:00:00',s=>s.day===2);
  step(g,at(g.p,w,5,'06:00:00',brk(e0,addDays(e0,1))));const first=lastReturn(g.p);
  const r=evaluate(g,at(g.p,w,6,'06:00:00',brk(addDays(e0,3),addDays(e0,4))));
  if(!trained){assert.equal(r.status,'ASK');continue;}
  const B=r.proposal.decisions.at(-1).interruption;
  assert.deepEqual([B.relation,B.basis,B.supersedes,B.stateAt.kind,B.stateAt.eventId,B.stateAt.reportedAfterStart],['NEW','TRAINING_BETWEEN',null,'RETURN',first.eventId,true]);
 }
});
