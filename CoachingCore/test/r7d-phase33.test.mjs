// R7-D Phase 3.3: directed tests for SSCTR-P32-F01 (audits/domain-coaching-r7-d-2026-11-02/PHASE32_CHECKPOINT.md), under the Founder's direction B:
// what counts as known training between two separate breaks. Training between them re-enters the athlete only when a whole week of the plan between
// them was executed completely (every session as prescribed, every gate ADVANCE or EARNED: the evidence reducer's own rule, SSCTR S-A and E3); then
// the earlier break is history and the later one is read alone. Anything less (an isolated session of either sport, a partial or aborted one, a week
// with a session missed, partial, unreported, conflicted or adverse) is a fact of the stop, not a re-entry: the stop runs back through the earlier
// break, as with nothing trained between. Unknown training between them is still asked. Clinical first and F08 are unchanged; no number is added.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const GEN={id:'r7d-p33-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
/** Weeks 0-1 executed and reviewed; nothing reported after them. */
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(BASE?.p.weeks[2].startDate??base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);                 // weeks 2-3, 14 days
const D=()=>trip(17,20);               // Thu-Sun of week 4, 4 days; Mon-Wed of week 4 lie between A and D
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const runOnly=(p,s)=>s.sport==='RUN'?obs(p,s):notDone(p,s),strengthOnly=(p,s)=>s.sport==='STRENGTH'?obs(p,s):notDone(p,s);
const aborted=(p,s)=>s.sport==='RUN'?obs(p,s,{actual:{completed:false,minutes:5}}):notDone(p,s),all=(p,s)=>obs(p,s);
const declarations=ledger=>ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED');
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const stops=d=>d.separateBreaks.map(b=>b.stop);
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const quality=list=>list.some(x=>QUALITY.some(q=>x.includes(':'+q+':')));
const gapOf=p=>p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
/** A kept by a fatigue report on Mon wk4; D named on its own by a local-fatigue report on Mon wk5, with the gap reported by `report`; a plain review
 * on Tue wk5. */
function gapCase(id,report,{a=A(),d=D()}={}){
 const t=base();
 assert.equal(step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}}).action,'ASK');
 const gap=gapOf(t.p);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>report(t.p,s))});
 return {t,gap,r:step(t,5,{day:1,hour:'07:00:00'})};
}
/** The comparator: the stop from A's first day to `to` declared once by a return report in week `w`. */
function once(to,w,dayOf){const t=base(),r=step(t,w,{day:dayOf,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,to,{reason:'Holiday then work trip'})});assert.equal(r.action,'REESTABLISH',r.reason);return t;}
/** A kept on Mon wk4; D = Mon-Thu of week `dw`, named on its own, declared on Fri of that week with the weeks between reported by `report` (a sync,
 * no review between); a plain review an hour later. */
function bulk(id,weeks,dw,report=all){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s))),d=trip(dw*7-14,dw*7-11);
 step(t,dw,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,d,r:step(t,dw,{day:4,hour:'08:00:00'})};
}
const longRun=s=>s.sport==='RUN'&&s.role==='LONG';

// ---------- T1: break, isolated training, break (the SSCTR-P32-F01 witness and its regression) ----------
test('R7-D Phase 3.3 T1 (F01 witness): a long break, one isolated session and a short break: the session re-enters nothing, the stop runs through the earlier break and the return is the whole stop\'s',()=>{
 // The comparator: the 21 days declared once (MODERATE, EASY 15 / LONG 20, no quality).
 const k=once(20,5,1),from=addDays(k.p.weeks[5].startDate,2);
 for(const [label,report] of [['one easy run',runOnly],['every session between',all],['one strength session',strengthOnly],['a 5-minute aborted run',aborted]]){
  const {t,r}=gapCase('t1-'+label.replace(/\W+/g,''),report);
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);assert.equal(r.planValidity.status,VALID,label);
  const d=lastReturn(t.p);
  assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[A().startDate,D().endDate,21,'MODERATE'],label+': the whole stop, not the trip alone');
  assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST'],label);
  assert.equal(d.separateBreaks[0].reentryWeek,undefined,label);
  assert.deepEqual(runsAhead(t.p,5,from),runsAhead(k.p,5,from),label+': the re-entry of the 21 days declared once');
  assert.ok(!quality(runsAhead(t.p,5,from)),label+': no quality work in the re-entry');
  assert.match(r.reason,/completed no whole week of the plan/,label);
 }
});
test('R7-D Phase 3.3 T1: thirty days, one run and four days re-enter as the thirty-seven days declared once (a restart), not as the four days alone',()=>{
 const t=base();
 step(t,6,{day:2,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,29,{reason:'Long holiday'}),event:{id:'t1l-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date>=day(30)&&s.date<=day(32));
 step(t,7,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(33,36),episodeId:'t1l-D'},event:{id:'t1l-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>runOnly(t.p,s))});
 const r=step(t,7,{day:3,hour:'07:00:00'}),d=lastReturn(t.p),k=once(36,7,3),from=addDays(k.p.weeks[7].startDate,4);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(36),37,'LONG']);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
 assert.deepEqual(runsAhead(t.p,7,from),runsAhead(k.p,7,from),'the restart of the 37 days declared once');assert.ok(!quality(runsAhead(t.p,7,from)));
});

// ---------- T2: separate breaks with nothing trained between them (unchanged from R7D-FREEZE-3) ----------
test('R7-D Phase 3.3 T2 (characterization): separate breaks that touch, or with nothing trained between them, read the continuous stop as before',()=>{
 const {t,r}=gapCase('t2-none',notDone),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.deepEqual([d.startDate,d.days,d.class],[A().startDate,21,'MODERATE']);assert.deepEqual(stops(d),['NO_TRAINING_BETWEEN','LATEST']);
 assert.match(r.reason,/with no training recorded between them/);
 const x=base();
 step(x,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t2-touch-A',kind:'SYSTEMIC_FATIGUE'}});
 const y=step(x,5,{day:1,hour:'07:00:00',interruption:{...trip(14,20),episodeId:'t2-touch-B'},event:{id:'t2-touch-B',kind:'WEEKLY_REVIEW'}}),e=lastReturn(x.p);
 assert.equal(y.action,'REESTABLISH',y.reason);assert.deepEqual([e.days,e.class],[21,'MODERATE']);assert.deepEqual(stops(e),['TOUCHES','LATEST']);
});

// ---------- T3: a re-entry the record proves is recognized (the inverse defect) ----------
test('R7-D Phase 3.3 T3: a whole week of the plan executed in full between the breaks re-enters the athlete: the later break alone, from what was executed, never a conservative re-entry',()=>{
 for(const [label,weeks,dw] of [['one week',[4],5],['two weeks',[4,5],6]]){
  const {t,d:trip0,r}=bulk('t3-'+weeks.length,weeks,dw),d=lastReturn(t.p);
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);assert.equal(r.planValidity.status,VALID,label);
  assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[trip0.startDate,trip0.endDate,4,'SHORT'],label+': the later break alone');
  assert.deepEqual(stops(d),['TRAINING_AFTER','LATEST'],label);
  assert.equal(d.separateBreaks[0].reentryWeek,t.p.weeks[4].startDate,label+': the week that re-entered the athlete');
  assert.equal(d.entry.run.mode,'EASY',label+': no return or restart mode: the executed doses resume');
  assert.match(r.reason,/a whole week of the plan executed in full after the earlier one re-entered the athlete/,label);
 }
});
test('R7-D Phase 3.3 T3: the late form: a week executed in full and reviewed before the earlier break was declared re-enters the athlete; one session in a reviewed week does not',()=>{
 for(const full of [true,false]){
  const t=base();
  for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
  step(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>full||s.sport==='RUN'&&s.date===day(15)?obs(t.p,s):notDone(t.p,s))});
  step(t,5,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t3l-A-'+full,kind:'SYSTEMIC_FATIGUE'}});
  const before=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date<day(23));
  step(t,5,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(23,26),episodeId:'t3l-D-'+full},event:{id:'t3l-D-'+full,kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
  const r=step(t,6,{day:0,hour:'07:00:00'}),d=lastReturn(t.p);
  assert.equal(r.action,'REESTABLISH',`full ${full}: ${r.reason}`);
  if(full){assert.deepEqual([d.startDate,d.days,d.class],[day(23),4,'SHORT']);assert.deepEqual(stops(d),['TRAINING_AFTER','LATEST']);assert.equal(d.separateBreaks[0].reentryWeek,t.p.weeks[4].startDate);}
  else{assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(26),27,'MODERATE'],'a review that closed the week is not a re-entry');assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);}
 }
});

// ---------- T4: incomplete, unconfirmed or conflicting activity between the breaks ----------
test('R7-D Phase 3.3 T4: a week between the breaks with a session missed or partial re-enters nothing: the stop runs through',()=>{
 for(const [label,report] of [['the long run not done',(p,s)=>longRun(s)?notDone(p,s):obs(p,s)],['a partial run',(p,s)=>s.sport==='RUN'&&s.date===day(15)?obs(p,s,{actual:{completed:false,minutes:20}}):obs(p,s)],
  ['every run done, the Friday strength session not done',(p,s)=>s.sport==='STRENGTH'&&s.date===day(18)?notDone(p,s):obs(p,s)]]){
  const {t,r}=bulk('t4-'+label.replace(/\W+/g,''),[4],5,report),d=lastReturn(t.p);
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);
  assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(24),25,'MODERATE'],label);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST'],label);
  assert.equal(d.entry.run.mode,'RETURN',label+': the moderate re-entry');
 }
});
test('R7-D Phase 3.3 T4: a week that holds days of the earlier break never re-enters the athlete, even with every one of its sessions reported done',()=>{
 // The holiday ends on Wed wk3; every session of week 3 is reported done, its Mon and Tue inside the holiday. No week lies wholly between the breaks.
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,9),event:{id:'t4s-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk3=t.p.weeks[3].sessions.filter(live),wk4=gapOf(t.p);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'t4s-D'},event:{id:'t4s-D',kind:'LOCAL_FATIGUE'},observations:[...wk3.map(s=>obs(t.p,s)),...wk4.map(s=>notDone(t.p,s))]});
 const r=step(t,5,{day:1,hour:'07:00:00'}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(20),21,'MODERATE']);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
});
test('R7-D Phase 3.3 T4: unreported sessions in a week between the breaks are asked first; the answer decides whether that week re-entered the athlete',()=>{
 const {t,r:q}=bulk('t4-unk',[],5);
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.notEqual(q.planValidity.status,VALID);assert.equal(returns(t.p).length,0);
 assert.deepEqual(q.question.unreported.sessionIds,t.p.weeks[4].sessions.filter(live).map(s=>s.id));
 for(const [label,report,cls] of [['in full',all,'SHORT'],['the long run not done',(p,s)=>longRun(s)?notDone(p,s):obs(p,s),'MODERATE']]){
  const c=copy(t),r=step(c,5,{day:4,hour:'09:00:00',observations:c.p.weeks[4].sessions.filter(live).map(s=>report(c.p,s))});
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);assert.equal(lastReturn(c.p).class,cls,label);
 }
 // One session of that week reported done, the others unreported: still asked, since their answer can complete the week.
 const u=base();
 step(u,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t4-unk2-A',kind:'SYSTEMIC_FATIGUE'}});
 const run=u.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date===day(15));
 step(u,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t4-unk2-D'},event:{id:'t4-unk2-D',kind:'LOCAL_FATIGUE'},observations:[obs(u.p,run)]});
 const q2=step(u,5,{day:4,hour:'08:00:00'});
 assert.equal(q2.action,'ASK',q2.reason);assert.equal(q2.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.ok(!q2.question.unreported.sessionIds.includes(run.id));
});
test('R7-D Phase 3.3 T4: a conflicted report in a week between the breaks is asked as unreported; corrected, the week re-enters the athlete only when every session was executed',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t4c-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk=t.p.weeks[4].sessions.filter(live),run=wk.find(s=>s.sport==='RUN'&&s.date===day(15)),done=obs(t.p,run),undone={...notDone(t.p,run),observedAt:done.observedAt};
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t4c-D'},event:{id:'t4c-D',kind:'LOCAL_FATIGUE'},observations:[...wk.filter(s=>s!==run).map(s=>obs(t.p,s)),done,undone]});
 const q=step(t,5,{day:4,hour:'08:00:00'});
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.deepEqual(q.question.unreported.sessionIds,[run.id]);
 for(const [completed,cls] of [[true,'SHORT'],[false,'MODERATE']]){
  const c=copy(t),row=c.ledger.find(o=>o.sessionId===run.id&&o.conflicted);
  const fix={...(completed?obs(c.p,run):notDone(c.p,run)),observedAt:done.observedAt,correctionOf:row.eventId,correctedAt:`${day(25)}T08:30:00Z`};
  const r=step(c,5,{day:4,hour:'09:00:00',observations:[fix]});
  assert.equal(r.action,'REESTABLISH',`corrected ${completed}: ${r.reason}`);assert.equal(lastReturn(c.p).class,cls,'corrected '+completed);
 }
});

// ---------- T5: a report that does not show tolerance or recovery ----------
test('R7-D Phase 3.3 T5: a week executed in full but with an adverse response (recovery adverse or next-day function impaired) re-enters nothing: the stop runs through',()=>{
 for(const response of [{recovery:'ADVERSE'},{nextDayFunction:'IMPAIRED'}]){
  const {t,r}=bulk('t5-'+Object.keys(response)[0],[4],5,(p,s)=>longRun(s)?obs(p,s,{response}):obs(p,s)),d=lastReturn(t.p);
  assert.equal(r.action,'REESTABLISH',`${JSON.stringify(response)}: ${r.reason}`);
  assert.deepEqual([d.startDate,d.days,d.class],[day(0),25,'MODERATE'],JSON.stringify(response));assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
 }
});

// ---------- T6: two declarations of the same interruption, a correction ----------
test('R7-D Phase 3.3 T6: a named correction of the earlier break is read with its corrected facts, the isolated session between still re-enters nothing, and a replay changes nothing',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t6-A',kind:'SYSTEMIC_FATIGUE'}});
 // The holiday corrected by name: it ended on Wed wk3 (10 days, SHORT on its own).
 step(t,4,{day:0,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...brk(0,9),episodeId:'t6-A'},event:{id:'t6-A2',kind:'LOCAL_FATIGUE'}});
 const between=[...t.p.weeks[3].sessions,...t.p.weeks[4].sessions].filter(s=>live(s)&&s.date>=day(10)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'t6-D'},event:{id:'t6-D',kind:'LOCAL_FATIGUE'},observations:between.map(s=>s.sport==='RUN'&&s.date===day(15)?obs(t.p,s):notDone(t.p,s))});
 const plain={day:1,hour:'07:00:00',event:{id:'t6-plain',kind:'WEEKLY_REVIEW'}},r=step(t,5,plain),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(20),21,'MODERATE'],'the corrected holiday through the trip');
 assert.deepEqual(d.separateBreaks.map(b=>[b.episode,b.eventId,b.startDate,b.endDate,b.stop]),[['t6-A','t6-A2',day(0),day(9),'TRAINING_NOT_REESTABLISHED'],['t6-D','t6-D',day(17),day(20),'LATEST']]);
 assert.deepEqual(declarations(t.ledger).map(x=>x.eventId),['t6-A','t6-A2','t6-D'],'every declaration recorded, the earlier facts unchanged');
 const rows=declarations(t.ledger).length,n=returns(t.p).length,plan=hash(t.p),re=step(t,5,plain);
 assert.equal(re.action,'KEEP',re.reason);assert.equal(declarations(t.ledger).length,rows);assert.equal(returns(t.p).length,n);assert.equal(hash(t.p),plan);
});

// ---------- T7: clinical first ----------
test('R7-D Phase 3.3 T7: clinical first is unchanged: a clinical earlier break, or a current clinical flag, routes to a human before any reading of the training between',()=>{
 const flu=brk(0,13,{reasonCategory:'ILLNESS',reason:'Flu',nonclinical:false});
 for(const [label,report] of [['one run between',runOnly],['unreported between',null]]){
  const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:flu,event:{id:'t7-A-'+label,kind:'SYSTEMIC_FATIGUE'}});
  step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'t7-D-'+label},event:{id:'t7-D-'+label,kind:'LOCAL_FATIGUE'},observations:report?gapOf(t.p).map(s=>report(t.p,s)):[]});
  const r=step(t,5,{day:1,hour:'07:00:00'});
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${label}: ${r.reason}`);assert.equal(r.proposal??null,null,label);assert.equal(returns(t.p).length,0,label);
  assert.equal(declarations(t.ledger).length,2,label);
 }
 const {t}=gapCase('t7-flag',runOnly),before=returns(t.p).length,u=base();
 step(u,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t7-f-A',kind:'SYSTEMIC_FATIGUE'}});
 step(u,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'t7-f-D'},event:{id:'t7-f-D',kind:'LOCAL_FATIGUE'},observations:gapOf(u.p).map(s=>runOnly(u.p,s))});
 const f=step(u,5,{day:1,hour:'07:00:00',eligibility:{...elig(day(22)),pain:true}});
 assert.equal(f.status,'CLINICAL_HUMAN_REQUIRED',f.reason);assert.equal(returns(u.p).length,0);assert.ok(before>=1);
});

// ---------- T8: the record and the decisions between reviews ----------
test('R7-D Phase 3.3 T8: the record keeps both declarations and the training between, append-only; the carrying events are never applied; the return is applied once and earlier decisions stay as they were',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t8-A',kind:'SYSTEMIC_FATIGUE'}});
 const rowA=structuredClone(declarations(t.ledger)[0]),gap=gapOf(t.p),decisions0=structuredClone(t.p.decisions);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'t8-D'},event:{id:'t8-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>runOnly(t.p,s))});
 const r=step(t,5,{day:1,hour:'07:00:00'});
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual(declarations(t.ledger)[0],rowA,'the earlier declaration unchanged');assert.equal(declarations(t.ledger).length,2);
 const run=gap.find(s=>s.sport==='RUN');assert.ok(t.ledger.some(o=>o.sessionId===run.id&&o.actual?.completed===true),'the session between is kept as a fact');
 assert.deepEqual(t.p.decisions.slice(0,decisions0.length),decisions0,'earlier decisions are never rewritten');
 // Event separation (as the harness's P17 reads it): only a factual re-plan from the reported sessions and the one return are added.
 const added=t.p.decisions.slice(decisions0.length).map(d=>d.action);
 assert.ok(added.every(a=>['REPLAN_FROM_EVIDENCE','REESTABLISH'].includes(a)),'neither fatigue report is applied, before or with the return: '+added.join(', '));
 assert.equal(added.filter(a=>a==='REESTABLISH').length,1);
 for(const d of [2,3]){const x=step(t,5,{day:d,hour:'07:00:00'});assert.notEqual(x.action,'REESTABLISH',`day ${d}: ${x.reason}`);}
 assert.equal(returns(t.p).length,1,'applied once');
});

// ---------- T9: determinism ----------
test('R7-D Phase 3.3 T9: the same facts give the same decision: the same review twice is byte-identical, and either order of declaration gives the same stop, entry and plan',()=>{
 const {t}=gapCase('t9',runOnly),x=review(t.p,5,{day:2,hour:'07:00:00'});
 const a=evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts),b=evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);
 assert.equal(hash(a),hash(b));
 const results=[];
 for(const order of [['A','D'],['D','A']]){
  const u=base(),facts={A:{...A(),episodeId:'t9o-A'},D:{...D(),episodeId:'t9o-D'}},gap=gapOf(u.p);
  step(u,5,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:facts[order[0]],event:{id:'t9o-'+order[0],kind:'SYSTEMIC_FATIGUE'},observations:gap.map(s=>runOnly(u.p,s))});
  step(u,5,{day:0,hour:'08:00:00',kind:'LOCAL_FATIGUE',interruption:facts[order[1]],event:{id:'t9o-'+order[1],kind:'LOCAL_FATIGUE'}});
  const r=step(u,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE'});
  assert.equal(r.action,'REESTABLISH',`${order}: ${r.reason}`);
  const {episode,basis,declaredBy,inputHash,separateBreaks,stateAt,...facts1}=lastReturn(u.p);
  results.push({facts:facts1,breaks:separateBreaks.map(b=>[b.episode,b.startDate,b.endDate,b.stop]),runs:runsAhead(u.p,5,day(23))});
 }
 assert.deepEqual(results[0],results[1],'the same stop, entry and plan whichever break was declared first');
 assert.deepEqual(results[0].breaks.map(b=>b[3]),['TRAINING_NOT_REESTABLISHED','LATEST']);
});
