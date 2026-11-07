// R7-D Phase 3.4: directed tests for SSCTR-P33-F01 (the inverse direction of SSCTR-P32-F01's fix) under the Founder's direction A, the re-entry week
// contract (QE-R7D-P33-01) and the corrections of a return that read separate breaks.
// With an earlier separate break still unapplied, training between it and a later break that completed a whole week of the plan in one sport but not
// in every sport it plans is training, never days of the stop: the earlier break is read as its own return, as if applied when the athlete came back
// (OWN_RETURN: its own class, the unchanged recipe, no current demonstration), the training after it is read by the evidence reducer from that
// return, and the later break is classed by its own days. A sport with its own whole complete week reads its executed history (per sport). Isolated,
// partial or aborted training in no such week, or none, still runs the stop through the earlier break. A whole week complete in every sport is the
// unchanged Phase 3.3 re-entry. A newer report of the latest break, and the late-evidence check, re-read the separate breaks that return recorded.
// No number is added; clinical first and F08 are unchanged.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const GEN={id:'r7d-p34-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
/** Weeks 0-1 executed and reviewed; nothing reported after them. The fixture plans strength Mon and Fri, runs Tue and Thu, the long run Sun. */
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(BASE?.p.weeks[2].startDate??base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);                 // weeks 2-3, 14 days (MODERATE on its own)
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2,longRun=s=>s.sport==='RUN'&&s.role==='LONG';
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s);
const noRir=(p,s)=>{const o=obs(p,s);if(o.actual.exercises)o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(({rir,...x})=>x)}));return o;};
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const stops=d=>d.separateBreaks.map(b=>b.stop);
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
const quality=list=>list.some(x=>QUALITY.some(q=>x.includes(':'+q+':')));
const minutes=list=>list.map(x=>Number(x.split(':').at(-1)));
/** A kept by a fatigue report on Mon wk4; D = Mon-Thu of week `dw`, named on its own, declared on Fri of that week with the weeks between reported by
 * `report` (a sync, no review between); a plain review an hour later. */
function bulk(id,weeks,dw,report=all,{a=A()}={}){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s))),d=trip(dw*7-14,dw*7-11);
 step(t,dw,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,dw,{day:4,hour:'08:00:00'}),from=addDays(t.p.weeks[dw].startDate,6);
 return {t,d,r,dw,runs:runsAhead(t.p,dw,from),strength:strengthAhead(t.p,dw,from)};
}
/** One week (wk4) of the plan between A and a Mon-Thu wk5 trip, reported with D. */
const oneWeek=(id,report)=>bulk(id,[4],5,report);

// ---------- T1: the Founder's case ----------
test('R7-D Phase 3.4 T1 (the Founder\'s case): a 14-day holiday, two weeks with every run done and one strength session missed each week, then a 4-day trip: never a restart; the trip is classed by its own days, running resumes the executed doses and strength steps nothing',()=>{
 const c=bulk('t1',[4,5],6,miss(friStrength)),d=lastReturn(c.t.p);
 assert.equal(c.r.action,'REESTABLISH',c.r.reason);assert.equal(c.r.planValidity.status,VALID);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[c.d.startDate,c.d.endDate,4,'SHORT'],'the trip alone, by its own days; R7D-FREEZE-4 read LONG 32 (a restart)');
 assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);
 const own=d.separateBreaks[0].ownReturn;
 assert.deepEqual([own.class,own.days,own.startDate,own.endDate,own.returnDay],['MODERATE',14,day(0),day(13),day(14)],'the holiday is read as its own return, the day after it ended');
 assert.equal(own.reentered.RUN,c.t.p.weeks[4].startDate,'running re-entered by its own whole week');assert.equal(own.reentered.STRENGTH,null,'strength did not');
 assert.equal(d.entry.run.mode,'EASY','no restart and no moderate re-entry for running: it executed two whole weeks');
 // Running: the doses the two whole executed weeks give, exactly as with every session done (E1); strength: no step (the Friday lifts re-established
 // after more than 28 days undone; the Monday lifts at the return entry), never the doses of the complete weeks.
 const e1=bulk('t1-e1',[4,5],6,all);
 assert.deepEqual(stops(lastReturn(e1.t.p)),['TRAINING_AFTER','LATEST']);
 assert.deepEqual(c.runs,e1.runs,'running is not penalized for a strength shortfall');
 assert.ok(!quality(c.runs.slice(0,3)),'after the short break the first quality slot runs easy (R27)');
 assert.notDeepEqual(c.strength,e1.strength,'strength gets no credit for weeks it did not complete');
 assert.ok(c.strength.every(x=>/@(ESTABLISH|FROM_LOG)$/.test(x)||/^[^:]+:1x/.test(x)),'strength re-enters from its return, one set: '+c.strength.join(' '));
});

// ---------- T2: per sport, both directions ----------
test('R7-D Phase 3.4 T2: strength executed in full and an easy run missed each week: strength resumes its executed doses, running continues from the holiday\'s own return (no step it did not earn)',()=>{
 const c=bulk('t2',[4,5],6,miss(tueRun)),d=lastReturn(c.t.p),own=d.separateBreaks[0].ownReturn;
 assert.equal(c.r.action,'REESTABLISH',c.r.reason);assert.deepEqual([d.days,d.class],[4,'SHORT']);assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);
 assert.deepEqual([own.reentered.RUN,own.reentered.STRENGTH],[null,c.t.p.weeks[4].startDate]);
 assert.equal(d.entry.run.mode,'RETURN','running continues the holiday\'s moderate re-entry');assert.equal(d.entry.run.returnStep,0,'its weeks completed no run step');
 const e1=bulk('t2-e1',[4,5],6,all);
 assert.deepEqual(c.strength,e1.strength,'strength is not penalized for a running shortfall');
 assert.ok(Math.max(...minutes(c.runs))<Math.max(...minutes(e1.runs)),'running gets no credit for weeks it did not complete');
});
test('R7-D Phase 3.4 T2: one week with every run done and the Friday strength missed: running resumes the doses of that whole week, as the complete week gives',()=>{
 const c=oneWeek('t2b',miss(friStrength)),full=oneWeek('t2b-full',all),d=lastReturn(c.t.p);
 assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);assert.deepEqual(stops(lastReturn(full.t.p)),['TRAINING_AFTER','LATEST']);
 assert.deepEqual([d.days,d.class],[4,'SHORT'],'R7D-FREEZE-4 read MODERATE 25');
 assert.deepEqual(c.runs,full.runs);assert.notDeepEqual(c.strength,full.strength);
});

// ---------- T3: strength logged without reps or reps in reserve (SSCTR-P33-F02) ----------
test('R7-D Phase 3.4 T3: a week executed in full with strength logged without reps in reserve: the missing strength data holds strength only; running re-enters by its whole week',()=>{
 const c=oneWeek('t3',(p,s)=>s.sport==='STRENGTH'?noRir(p,s):obs(p,s)),full=oneWeek('t3-full',all),d=lastReturn(c.t.p);
 assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);
 assert.deepEqual([d.separateBreaks[0].ownReturn.reentered.RUN,d.separateBreaks[0].ownReturn.reentered.STRENGTH],[c.t.p.weeks[4].startDate,null]);
 assert.deepEqual(c.runs,full.runs,'R7D-FREEZE-4 held running too (MODERATE 25)');
 assert.notDeepEqual(c.strength,full.strength);
});

// ---------- T4: isolated or partial training stays a fact of the stop (the SSCTR-P32-F01 closure holds) ----------
test('R7-D Phase 3.4 T4: isolated sessions in no whole week, in either sport, still run the stop through the earlier break, exactly as R7D-FREEZE-4',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t4-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'t4-D'},event:{id:'t4-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 const r=step(t,5,{day:1,hour:'07:00:00'}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(0),day(20),21,'MODERATE']);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
 // One run in a three-week gap (every other session reported not done): the stop runs through, as with nothing trained (a restart either way).
 const x1=bulk('t4-x1',[4,5,6],7,(p,s)=>s.sport==='RUN'&&dow(s)===2&&s.date>=day(21)&&s.date<=day(27)?obs(p,s):notDone(p,s)),x0=bulk('t4-x0',[4,5,6],7,notDone);
 assert.deepEqual([lastReturn(x1.t.p).days,lastReturn(x1.t.p).class],[39,'LONG']);assert.deepEqual(stops(lastReturn(x1.t.p)),['TRAINING_NOT_REESTABLISHED','LATEST']);
 assert.deepEqual([lastReturn(x0.t.p).days,lastReturn(x0.t.p).class],[39,'LONG']);assert.deepEqual(stops(lastReturn(x0.t.p)),['NO_TRAINING_BETWEEN','LATEST']);
 assert.deepEqual(x1.runs,x0.runs,'one isolated run in a long gap changes nothing');
});
test('R7-D Phase 3.4 T4 (disclosed residual): weeks with both sports partial (an easy run and a strength session missed each week) complete no week in any sport: the stop still runs through the earlier break',()=>{
 const c=bulk('t4-x2',[4,5],6,miss(s=>tueRun(s)||friStrength(s))),d=lastReturn(c.t.p);
 assert.deepEqual([d.startDate,d.days,d.class],[day(0),32,'LONG']);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
});

// ---------- T5: adverse responses ----------
test('R7-D Phase 3.4 T5: an adverse response holds the sport it was reported in: the long run with recovery adverse or next-day function impaired, strength complete: strength resumes, running continues from the holiday\'s own return',()=>{
 for(const response of [{recovery:'ADVERSE'},{nextDayFunction:'IMPAIRED'}]){
  const c=oneWeek('t5-'+Object.keys(response)[0],(p,s)=>longRun(s)?obs(p,s,{response}):obs(p,s)),d=lastReturn(c.t.p),own=d.separateBreaks[0].ownReturn;
  assert.equal(c.r.action,'REESTABLISH',`${JSON.stringify(response)}: ${c.r.reason}`);assert.deepEqual(stops(d),['OWN_RETURN','LATEST'],JSON.stringify(response));
  assert.deepEqual([own.reentered.RUN,own.reentered.STRENGTH],[null,c.t.p.weeks[4].startDate],JSON.stringify(response));
  assert.equal(d.entry.run.mode,'RETURN',JSON.stringify(response)+': no run credit for an adverse week');
 }
});

// ---------- T6: unknown training between is asked first ----------
test('R7-D Phase 3.4 T6: unreported sessions between the breaks are asked first, also when a sport has a whole week executed; the answer decides',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t6-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk=t.p.weeks[4].sessions.filter(live),fri=wk.find(friStrength);
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t6-D'},event:{id:'t6-D',kind:'LOCAL_FATIGUE'},observations:wk.filter(s=>s!==fri).map(s=>obs(t.p,s))});
 const q=step(t,5,{day:4,hour:'08:00:00'});
 assert.equal(q.action,'ASK',q.reason);assert.equal(q.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.deepEqual(q.question.unreported.sessionIds,[fri.id]);assert.equal(returns(t.p).length,0);
 for(const [label,o,stop] of [['done',obs,'TRAINING_AFTER'],['not done',notDone,'OWN_RETURN']]){
  const c=copy(t),r=step(c,5,{day:4,hour:'09:00:00',observations:[o(c.p,fri)]});
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);assert.deepEqual(stops(lastReturn(c.p)),[stop,'LATEST'],label);assert.equal(lastReturn(c.p).class,'SHORT',label);
 }
});

// ---------- T7: the late form, and timely reporting unchanged ----------
test('R7-D Phase 3.4 T7: the late form (weeks reviewed at the time, the holiday declared later) reads the same way; timely reporting (weekly reviews; the holiday applied when stated) is unchanged',()=>{
 const t=base();
 for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
 for(const w of [4,5])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s))});
 step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t7-A',kind:'SYSTEMIC_FATIGUE'}});
 const before=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date<day(30));
 step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:'t7-D'},event:{id:'t7-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
 const r=step(t,7,{day:0,hour:'07:00:00'}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.deepEqual([d.days,d.class],[4,'SHORT'],'R7D-FREEZE-4 read LONG 34');assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);
 // Timely: weekly reviews between (the first one applies the kept holiday), then the trip. Identical to R7D-FREEZE-4 (no separate breaks read).
 const v=base();
 step(v,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t7v-A',kind:'SYSTEMIC_FATIGUE'}});
 for(const w of [4,5])step(v,w,{observations:v.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(v.p,s))});
 step(v,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'t7v-D'},event:{id:'t7v-D',kind:'LOCAL_FATIGUE'}});
 const rv=step(v,6,{day:4,hour:'08:00:00'}),dv=lastReturn(v.p);
 assert.equal(rv.action,'REESTABLISH',rv.reason);assert.equal(dv.separateBreaks,undefined);assert.deepEqual([dv.days,dv.class,dv.entry.run.mode],[4,'SHORT','RETURN']);
 assert.deepEqual(runsAhead(v.p,6,addDays(v.p.weeks[6].startDate,6)),['LONG:LONG:20','EASY:EASY:30','EASY:EASY:30','LONG:LONG:45'],'the weekly-review path, as on R7D-FREEZE-4');
});

// ---------- T8: three breaks ----------
test('R7-D Phase 3.4 T8: three breaks: a run-complete week after the first reads it as its own return; the days between the second and the last, in no whole week, run their stop through; the record says each',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t8-A',kind:'SYSTEMIC_FATIGUE'}});
 const o4=t.p.weeks[4].sessions.filter(live).map(s=>miss(friStrength)(t.p,s));
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,23),episodeId:'t8-B'},event:{id:'t8-B',kind:'LOCAL_FATIGUE'},observations:o4});
 const o5=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date>day(23)).map(s=>miss(friStrength)(t.p,s));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'t8-D'},event:{id:'t8-D',kind:'LOCAL_FATIGUE'},observations:o5});
 const r=step(t,6,{day:4,hour:'08:00:00'}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[day(21),day(31),11,'MODERATE']);
 assert.deepEqual(stops(d),['OWN_RETURN','TRAINING_NOT_REESTABLISHED','LATEST']);
 assert.equal(d.separateBreaks[0].ownReturn.class,'MODERATE');assert.equal(d.separateBreaks[0].ownReturn.reentered.RUN,t.p.weeks[4].startDate);
});

// ---------- T9: clinical first ----------
test('R7-D Phase 3.4 T9: clinical first is unchanged: a clinical earlier break with a run-complete week between, or a pain flag at the review, routes to a human with no proposal',()=>{
 const c=bulk('t9',[4],5,miss(friStrength),{a:brk(0,13,{reasonCategory:'ILLNESS',reason:'Flu',nonclinical:false})});
 assert.equal(c.r.status,'CLINICAL_HUMAN_REQUIRED',c.r.reason);assert.equal(c.r.proposal,null);assert.equal(returns(c.t.p).length,0);
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t9b-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=t.p.weeks[4].sessions.filter(live).map(s=>miss(friStrength)(t.p,s));
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t9b-D'},event:{id:'t9b-D',kind:'LOCAL_FATIGUE'},observations:o});
 const p=step(t,5,{day:4,hour:'08:00:00',eligibility:{...elig(`${day(25)}T08:00:00Z`),pain:true}});
 assert.equal(p.status,'CLINICAL_HUMAN_REQUIRED',p.reason);assert.equal(p.proposal,null);
});

// ---------- T10: after the return: late evidence, a newer report of the latest break, a replay ----------
test('R7-D Phase 3.4 T10: after a return that read the earlier break as its own return, later reviews are not asked again, and a named correction of the trip re-reads the holiday as that return did; a replay changes nothing',()=>{
 const c=bulk('t10',[4,5],6,miss(friStrength));
 const sat=step(c.t,6,{day:5,hour:'09:00:00'});
 assert.notEqual(sat.action,'ASK',`no spurious late-evidence question: ${sat.reason}`);
 const corr={day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'t10-D'},event:{id:'t10-D2',kind:'RETURN_AFTER_PAUSE'}};
 const r=step(c.t,6,corr),d=lastReturn(c.t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.deepEqual([d.days,d.class,d.relation],[5,'SHORT','SAME_BREAK']);
 assert.deepEqual(stops(d),['OWN_RETURN','LATEST'],'the holiday is read again, never dropped');
 const n=returns(c.t.p).length,again=step(c.t,6,corr);
 assert.equal(again.action,'KEEP',again.reason);assert.equal(returns(c.t.p).length,n,'a replay applies nothing');
});
test('R7-D Phase 3.4 T10: a named correction of the latest break after a return whose stop ran through the earlier break keeps the earlier break in the stop (R7D-FREEZE-4 dropped it and resumed the pre-break doses)',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t10b-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'t10b-D'},event:{id:'t10b-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 assert.equal(step(t,5,{day:1,hour:'07:00:00'}).action,'REESTABLISH');
 const r=step(t,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(17,21),episodeId:'t10b-D'},event:{id:'t10b-D2',kind:'RETURN_AFTER_PAUSE'}}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class,d.relation],[day(0),day(21),22,'MODERATE','SAME_BREAK']);assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);
 assert.equal(d.entry.run.mode,'RETURN','the moderate re-entry, never the pre-break doses');
});

// ---------- T11: the record, determinism and order ----------
test('R7-D Phase 3.4 T11: the record keeps both declarations and the training between, append-only; the return is applied once; the same review twice is byte-identical; either order of declaration gives the same stop and plan',()=>{
 const c=bulk('t11',[4,5],6,miss(friStrength));
 const decl=c.t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').map(o=>o.eventId);
 assert.deepEqual(decl,['t11-A','t11-D']);assert.equal(returns(c.t.p).length,1);
 const between=new Set([4,5].flatMap(w=>c.t.p.weeks[w].sessions.filter(live).map(s=>s.id)));
 assert.equal(c.t.ledger.filter(o=>!o.fact&&between.has(o.sessionId)).length,between.size,'every session between stays on the record, done or not');
 // The same plain review twice, on the program before the return: byte-identical.
 const u=base();
 step(u,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t11d-A',kind:'SYSTEMIC_FATIGUE'}});
 const ou=[4,5].flatMap(w=>u.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(u.p,s)));
 step(u,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'t11d-D'},event:{id:'t11d-D',kind:'LOCAL_FATIGUE'},observations:ou});
 const x=review(u.p,6,{day:4,hour:'08:00:00'}),ra=evaluateProgram(u.p,{...x,actualLedger:u.ledger},opts),rb=evaluateProgram(u.p,{...x,actualLedger:u.ledger},opts);
 assert.equal(hash(ra),hash(rb));assert.equal(ra.action,'REESTABLISH');
 // The trip declared first, then the holiday: the same stop, own return and plan.
 const t=base();
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s)));
 step(t,6,{day:4,hour:'06:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'t11o-D'},event:{id:'t11o-D',kind:'LOCAL_FATIGUE'},observations:o});
 step(t,6,{day:4,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...A(),episodeId:'t11o-A'},event:{id:'t11o-A',kind:'SYSTEMIC_FATIGUE'}});
 const r=step(t,6,{day:4,hour:'08:00:00'}),d=lastReturn(t.p),d0=lastReturn(c.t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class,stops(d).join()],[d0.startDate,d0.endDate,d0.days,d0.class,stops(d0).join()]);
 assert.deepEqual(runsAhead(t.p,6,addDays(t.p.weeks[6].startDate,6)),c.runs);
});

// ---------- T12: R-F08-1 (PCG-R7D-F08-r1): a clinical-cause episode stays clinical; F08 itself stays blocked by authority ----------
const injury=()=>brk(0,13,{reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false});
const restated=()=>({...A(),episodeId:'t12-A'});
test('R7-D Phase 3.4 T12 (R-F08-1): a clinical-cause break restated as a holiday by name never ends the clinical route, with or without a clearance, and opens no nonclinical return',()=>{
 // P1: the injury stated while eligibility was still asked (no clinical route yet), then restated by name as a holiday, no clearance at any point.
 const a=base();
 assert.equal(step(a,4,{day:0,hour:'07:00:00',interruption:injury(),eligibility:{status:'UNKNOWN'},event:{id:'t12-A',kind:'WEEKLY_REVIEW'}}).action,'ASK');
 const p1=step(a,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:restated()});
 assert.equal(p1.status,'CLINICAL_HUMAN_REQUIRED',p1.reason);assert.equal(p1.proposal,null);assert.equal(returns(a.p).length,0);
 // P3: the injury routed clinically, restated, then the client clears (drops the continuation state): a plain review and the restatement again.
 const b=base();
 assert.equal(step(b,4,{day:0,hour:'07:00:00',interruption:injury(),event:{id:'t12-A',kind:'WEEKLY_REVIEW'}}).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(step(b,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:restated()}).status,'CLINICAL_HUMAN_REQUIRED');
 b.ref=null;
 for(const [label,x] of [['a plain review after the clearance',{day:2,hour:'07:00:00'}],['the restatement after the clearance',{day:3,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:restated()}]]){
  const c=copy(b),r=step(c,4,x);
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${label}: ${r.reason}`);assert.equal(r.proposal,null,label);assert.equal(returns(c.p).length,0,label);
 }
 // P4: a client that drops the continuation state with no clearance at all, then restates.
 const d=base();step(d,4,{day:0,hour:'07:00:00',interruption:injury(),event:{id:'t12-A',kind:'WEEKLY_REVIEW'}});d.ref=null;
 assert.equal(step(d,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:restated()}).status,'CLINICAL_HUMAN_REQUIRED');
});
test('R7-D Phase 3.4 T12 (R-F08-1): a later trip, a schedule change or a weekly review never makes the clinical-cause episode nonclinical, and no other event\'s change is applied with the route; the record keeps every report',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',interruption:injury(),event:{id:'t12b-A',kind:'WEEKLY_REVIEW'}});
 step(t,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:'t12b-A'}});t.ref=null;
 const before=hash(t.p);
 const trip2=step(copy(t),5,{day:3,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(14,16),episodeId:'t12b-T'},event:{id:'t12b-T',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(trip2.status,'CLINICAL_HUMAN_REQUIRED',trip2.reason);assert.equal(trip2.proposal,null);
 const sched=step(copy(t),5,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{schedule:{runDays:[1,3,5]}},event:{id:'t12b-S',kind:'SCHEDULE_CHANGE'}});
 assert.equal(sched.status,'CLINICAL_HUMAN_REQUIRED',sched.reason);assert.equal(sched.proposal,null,'the schedule change is not applied with the route');
 const wk=copy(t),rv=step(wk,4,{day:6,hour:'21:00:00'});
 assert.equal(rv.status,'CLINICAL_HUMAN_REQUIRED',rv.reason);assert.equal(hash(wk.p),before,'the program is unchanged');
 assert.deepEqual(rv.actualLedger.filter(o=>o.fact==='INTERRUPTION_DECLARED').map(o=>[o.eventId,o.interruption.reasonCategory]),[['t12b-A','INJURY'],[rv.actualLedger.filter(o=>o.fact==='INTERRUPTION_DECLARED')[1].eventId,'VACATION']],'both reports stay, append-only: the clinical one is never replaced');
});
test('R7-D Phase 3.4 T12 (R-F08-1, control): a nonclinical break corrected by name, and a reason screened only as unclear, are unaffected',()=>{
 const t=base(),h=A();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:h,event:{id:'t12c-H',kind:'SYSTEMIC_FATIGUE'}});
 const r=step(t,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...h,endDate:day(12),days:13,episodeId:'t12c-H'}});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.deepEqual([lastReturn(t.p).days,lastReturn(t.p).class],[13,'MODERATE']);
 const u=base();
 const q=step(u,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...h,reasonCategory:null,reason:'stuff'},event:{id:'t12c-U',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(q.action,'ASK',q.reason);
 const ok=step(u,4,{day:0,hour:'08:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...h,episodeId:'t12c-U'}});
 assert.equal(ok.action,'REESTABLISH',ok.reason);
});

// ---------- T13: late evidence after an own return is still asked (R7-A final I6; SSCTR CF-P34-04) ----------
test('R7-D Phase 3.4 T13: after a return that read the earlier break as its own return, a genuine late fact about the training before the trip still asks to confirm the trip again',()=>{
 const c=bulk('t13',[4,5],6,miss(friStrength));
 const fri=c.t.p.weeks[5].sessions.find(s=>live(s)&&friStrength(s)),row=c.t.ledger.find(o=>o.sessionId===fri.id&&!o.fact);
 const fix={...obs(c.t.p,fri),observedAt:row.observedAt,correctionOf:row.eventId,correctedAt:`${day(33)}T09:00:00Z`};
 const r=step(c.t,6,{day:5,hour:'09:30:00',observations:[fix]});
 assert.equal(r.action,'ASK',`the late strength session changes what the return of the trip started from: ${r.reason}`);assert.deepEqual(r.missingInputs,['interruption.episodeId']);
});

// ---------- T14: the re-entry week contract (QE-R7D-P33-01; SSCTR BR-Q4) ----------
const GEV={id:'r7d-p34-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
function raceWeek(id,report){
 const t={p:program(GEV),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=t.p.weeks[7].sessions.filter(live).map(s=>report(t.p,s));
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,8,{day:4,hour:'08:00:00'})};
}
test('R7-D Phase 3.4 T14: a race week between the breaks re-enters running only with its race touch and race finished; strength re-enters by its own week',()=>{
 const full=raceWeek('t14f',all),d0=lastReturn(full.t.p);
 assert.equal(full.r.action,'REESTABLISH',full.r.reason);assert.deepEqual(stops(d0),['TRAINING_AFTER','LATEST']);
 for(const [label,missRole] of [['the race touch missed','RACE_TOUCH'],['the race missed','RACE']]){
  const c=raceWeek('t14-'+missRole,(p,s)=>s.sport==='RUN'&&s.role===missRole?notDone(p,s):obs(p,s)),d=lastReturn(c.t.p),own=d.separateBreaks[0].ownReturn;
  assert.equal(c.r.action,'REESTABLISH',`${label}: ${c.r.reason}`);assert.deepEqual(stops(d),['OWN_RETURN','LATEST'],label+': R7D-FREEZE-4 re-entered running on one easy run');
  assert.deepEqual([own.reentered.RUN,!!own.reentered.STRENGTH],[null,true],label);
 }
});
test('R7-D Phase 3.4 T14: optional walks never decide a re-entry week, done or not',()=>{
 const WALKS={id:'r7d-p34-walks',weeks:12,goals:{run:'GENERAL',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runDays:[1,2,3,5,6]}};
 const results=[];
 for(const [label,report] of [['walks done',all],['walks not done',(p,s)=>s.role==='WALK'?notDone(p,s):obs(p,s)]]){
  const t={p:program(WALKS),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
  assert.ok(t.p.weeks[4].sessions.some(s=>live(s)&&s.role==='WALK'&&s.optional),'the plan holds optional walks');
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t14w-A-'+results.length,kind:'SYSTEMIC_FATIGUE'}});
  step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t14w-D-'+results.length},event:{id:'t14w-D-'+results.length,kind:'LOCAL_FATIGUE'},observations:t.p.weeks[4].sessions.filter(live).map(s=>report(t.p,s))});
  const r=step(t,5,{day:4,hour:'08:00:00'});
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);results.push(stops(lastReturn(t.p)));
 }
 assert.deepEqual(results,[['TRAINING_AFTER','LATEST'],['TRAINING_AFTER','LATEST']]);
});

// ---------- T15: a stated start time on the later break's first day (QE-R7D-P33-02; SSCTR BR-Q5) ----------
test('R7-D Phase 3.4 T15: a week whose last session falls on the first day of the later break counts when that session was executed before the stated start, never after it',()=>{
 const out=[];
 for(const startedAt of [`${day(20)}T18:00:00Z`,`${day(20)}T07:00:00Z`]){
  const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t15-A-'+out.length,kind:'SYSTEMIC_FATIGUE'}});
  step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(20,23),startedAt,episodeId:'t15-D-'+out.length},event:{id:'t15-D-'+out.length,kind:'LOCAL_FATIGUE'},observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s))});
  const r=step(t,5,{day:4,hour:'08:00:00'});
  assert.equal(r.action,'REESTABLISH',r.reason);out.push([stops(lastReturn(t.p)).join(),lastReturn(t.p).class]);
 }
 assert.deepEqual(out,[['TRAINING_AFTER,LATEST','SHORT'],['OWN_RETURN,LATEST','SHORT']],'the Sunday long run (08:00) before an 18:00 start re-enters; with a 07:00 start it falls inside the break');
});

// ---------- T16: the single-run ceiling after a return planned from its own week (SSCTR-P34-F01) ----------
test('R7-D Phase 3.4 T16: a return reported mid-week plans the weeks after it from the runs completed, never from the elapsed runs of that week that were not done',()=>{
 const runsOfWeek=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
 const plans=[];
 for(const [label,d,notReported] of [['Monday',0,false],['Wednesday, unreported',2,false],['Friday, reported not done',4,true]]){
  const t=base();for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
  const elapsed=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<day(35+d));
  const r=step(t,7,{day:d,hour:'21:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34),observations:notReported?elapsed.map(s=>notDone(t.p,s)):[]});
  assert.equal(r.action,'REESTABLISH',`${label}: ${r.reason}`);
  plans.push([label,runsOfWeek(t.p,8),runsOfWeek(t.p,9)]);
 }
 for(const [label,w8,w9] of plans.slice(1)){assert.deepEqual(w8,plans[0][1],label+': week 8 as from a Monday report');assert.deepEqual(w9,plans[0][2],label+': week 9 as from a Monday report');assert.ok(!quality(w9),label+': no quality');}
 // Direction A on a running lapse (strength complete, every run not done for three weeks): bounded by the runs completed.
 const c=bulk('t16',[4,5,6],7,(p,s)=>s.sport==='RUN'?notDone(p,s):obs(p,s)),from=addDays(c.t.p.weeks[7].startDate,4);
 assert.deepEqual(stops(lastReturn(c.t.p)),['OWN_RETURN','LATEST']);
 assert.ok(Math.max(...minutes(runsAhead(c.t.p,7,from)))<=20,'no run above the entry ceiling plus one step after about 45 days without a completed run: '+runsAhead(c.t.p,7,from).join(' '));
});

// ---------- T17-T20: the remaining shapes of SSCTR CF-P34-06 (the SSCTR decision probes p34-ssctr.mjs and p34-ceiling.mjs, and the decision
// request's table): a whole sport's lapse against the episode rule (R1, R1b, R2); E4, X6, V3, W4; a run-only and a strength-only plan; each sport
// re-entering in a different week; the applied-return guard (QE-R7D-P33-03); the consolidation-week re-entry (L1, O-01); a correction naming the
// earlier break (C3, O-02); the G3 ceiling. The characterization tests hold on R7D-FREEZE-4 too. ----------
const by=(fRun,fStr)=>(p,s)=>s.sport==='RUN'?fRun(p,s):fStr(p,s);
/** The episode rule for the bulk shape: A applied by a return report when stated (Mon wk4), the weeks between reviewed as re-planned with the same
 * report pattern, D by a return report on Fri of week `dw`. */
function episodeRule(id,weeks,dw,report){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A(),event:{id:id+'-A',kind:'RETURN_AFTER_PAUSE'}});
 for(const w of weeks)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s))});
 const r=step(t,dw,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(dw*7-14,dw*7-11),event:{id:id+'-D',kind:'RETURN_AFTER_PAUSE'}}),from=addDays(t.p.weeks[dw].startDate,6);
 return {t,r,runs:runsAhead(t.p,dw,from),strength:strengthAhead(t.p,dw,from)};
}
const reentered=d=>[d.separateBreaks[0].ownReturn.reentered.RUN,d.separateBreaks[0].ownReturn.reentered.STRENGTH];
test('R7-D Phase 3.4 T17 (R1, R1b): a running lapse with strength complete: strength resumes its executed doses; running continues the holiday\'s own return, exactly as the episode rule',()=>{
 const runLapse=by(notDone,all);
 for(const [label,weeks,dw] of [['R1, three weeks',[4,5,6],7],['R1b, two weeks',[4,5],6]]){
  const c=bulk('t17-'+dw,weeks,dw,runLapse),d=lastReturn(c.t.p),k=episodeRule('t17k-'+dw,weeks,dw,runLapse),full=bulk('t17f-'+dw,weeks,dw,all);
  assert.equal(c.r.action,'REESTABLISH',`${label}: ${c.r.reason}`);assert.equal(k.r.action,'REESTABLISH',`${label}, episode rule: ${k.r.reason}`);
  assert.deepEqual(stops(d),['OWN_RETURN','LATEST'],label);assert.deepEqual(reentered(d),[null,c.t.p.weeks[4].startDate],label);
  assert.equal(d.entry.run.mode,'RETURN',label);
  assert.deepEqual(c.runs,k.runs,label+': running equals the episode rule (CF-P34-03: never above it), R7D-FREEZE-4 restarted it');
  assert.deepEqual(c.strength,full.strength,label+': strength is not penalized for the running lapse');
 }
});
test('R7-D Phase 3.4 T17 (R2): a strength lapse with every run done: running resumes its executed doses; strength re-enters from its return exactly as the episode rule',()=>{
 const strengthLapse=by(all,notDone);
 const c=bulk('t17-r2',[4,5],6,strengthLapse),d=lastReturn(c.t.p);
 assert.equal(c.r.action,'REESTABLISH',c.r.reason);assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);assert.deepEqual(reentered(d),[c.t.p.weeks[4].startDate,null]);
 assert.deepEqual(c.runs,bulk('t17-r2-full',[4,5],6,all).runs,'running is not penalized for the strength lapse');
 assert.deepEqual(c.strength,episodeRule('t17-r2k',[4,5],6,strengthLapse).strength,'strength: exactly the episode rule');
});
test('R7-D Phase 3.4 T18 (E4, V3, W4): a week without its long run holds running only; three weeks with the Friday strength missed re-enter running; a race week with only its easy run and strength done re-enters strength only',()=>{
 const e4=oneWeek('t18-e4',miss(longRun)),de=lastReturn(e4.t.p);
 assert.deepEqual(stops(de),['OWN_RETURN','LATEST'],'E4');assert.deepEqual(reentered(de),[null,e4.t.p.weeks[4].startDate],'E4');assert.equal(de.entry.run.mode,'RETURN','E4');
 const v3=bulk('t18-v3',[4,5,6],7,miss(friStrength)),dv=lastReturn(v3.t.p);
 assert.deepEqual(stops(dv),['OWN_RETURN','LATEST'],'V3');assert.deepEqual([dv.days,dv.class],[4,'SHORT'],'V3: R7D-FREEZE-4 read LONG 39');
 assert.deepEqual(v3.runs,bulk('t18-v3-full',[4,5,6],7,all).runs,'V3: running resumes the three whole weeks it executed');
 const w4=raceWeek('t18-w4',(p,s)=>s.sport==='RUN'&&['RACE','RACE_TOUCH'].includes(s.role)?notDone(p,s):obs(p,s)),dw=lastReturn(w4.t.p);
 assert.equal(w4.r.action,'REESTABLISH',w4.r.reason);assert.deepEqual(stops(dw),['OWN_RETURN','LATEST'],'W4');
 assert.deepEqual([dw.separateBreaks[0].ownReturn.reentered.RUN,!!dw.separateBreaks[0].ownReturn.reentered.STRENGTH],[null,true],'W4: one easy run never re-enters running in a race week');
});
test('R7-D Phase 3.4 T18 (X6, characterization): an adverse recovery on every run of the week is a systemic signal that holds both sports: no week complete in any sport, the stop runs through, as R7D-FREEZE-4',()=>{
 const x6=oneWeek('t18-x6',(p,s)=>s.sport==='RUN'?obs(p,s,{response:{recovery:'ADVERSE'}}):obs(p,s)),d=lastReturn(x6.t.p);
 assert.equal(x6.r.action,'REESTABLISH',x6.r.reason);
 assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST']);assert.deepEqual([d.startDate,d.days,d.class],[day(0),25,'MODERATE']);
});
test('R7-D Phase 3.4 T19 (characterization): a run-only and a strength-only plan re-enter only by a whole week of their one sport; one session missed there is no whole week, never an own return',()=>{
 for(const [label,o,missOne] of [['run-only',{id:'r7d-p34-run',weeks:12,goals:{run:'PERFORMANCE',strength:'NONE'},equipment:FULL,schedule:{strengthDays:[]}},tueRun],
  ['strength-only',{id:'r7d-p34-str',weeks:12,goals:{run:'NONE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],schedule:{runDays:[],longRunDay:null}},friStrength]]){
  const mk=(id,report)=>{const t={p:program(o),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
   step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
   step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:t.p.weeks[4].sessions.filter(live).map(s=>report(t.p,s))});
   return {r:step(t,5,{day:4,hour:'08:00:00'}),t};};
  const full=mk('t19f-'+label,all),part=mk('t19p-'+label,miss(missOne)),df=lastReturn(full.t.p),dp=lastReturn(part.t.p);
  assert.equal(full.r.action,'REESTABLISH',`${label}: ${full.r.reason}`);assert.deepEqual(stops(df),['TRAINING_AFTER','LATEST'],label);assert.equal(df.class,'SHORT',label);
  assert.equal(part.r.action,'REESTABLISH',`${label}: ${part.r.reason}`);assert.deepEqual(stops(dp),['TRAINING_NOT_REESTABLISHED','LATEST'],label);assert.deepEqual([dp.days,dp.class],[25,'MODERATE'],label);
 }
});
test('R7-D Phase 3.4 T19: each sport re-enters by its own first whole week when the sports complete different weeks',()=>{
 const c=bulk('t19-diff',[4,5],6,(p,s)=>(s.date<p.weeks[5].startDate?friStrength(s):tueRun(s))?notDone(p,s):obs(p,s)),d=lastReturn(c.t.p);
 assert.equal(c.r.action,'REESTABLISH',c.r.reason);assert.deepEqual(stops(d),['OWN_RETURN','LATEST']);assert.deepEqual([d.days,d.class],[4,'SHORT']);
 assert.deepEqual(reentered(d),[c.t.p.weeks[4].startDate,c.t.p.weeks[5].startDate],'running by week 4, strength by week 5');
});
test('R7-D Phase 3.4 T20 (characterization): an applied return between the breaks blocks any own return across it (the existing question stands); a consolidation week executed in full re-enters the athlete (O-01); a correction naming the earlier break a return consumed is asked (O-02)',()=>{
 // The guard (QE-R7D-P33-03): the late form, a short break C applied by its return in week 5, the holiday declared after it, then the trip.
 const g=base();
 for(const w of [2,3])step(g,w,{observations:g.p.weeks[w].sessions.filter(live).map(s=>notDone(g.p,s))});
 step(g,4,{observations:g.p.weeks[4].sessions.filter(live).map(s=>miss(friStrength)(g.p,s))});
 assert.equal(step(g,5,{day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(21,22),event:{id:'t20g-C',kind:'RETURN_AFTER_PAUSE'}}).action,'REESTABLISH');
 step(g,5,{observations:g.p.weeks[5].sessions.filter(s=>live(s)&&s.date>day(22)).map(s=>miss(friStrength)(g.p,s))});
 step(g,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t20g-A',kind:'SYSTEMIC_FATIGUE'}});
 step(g,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'t20g-D'},event:{id:'t20g-D',kind:'LOCAL_FATIGUE'}});
 const rg=step(g,6,{day:4,hour:'08:00:00'});
 assert.equal(rg.action,'ASK',rg.reason);assert.deepEqual(rg.missingInputs,['interruption.episodeId']);assert.equal(returns(g.p).length,1,'only C\'s return: nothing reconstructed across it');
 // L1: weeks 2-4 in full, the holiday weeks 5-6, the consolidation week 7 executed in full, a trip in week 8.
 const l=base();for(const w of [2,3,4])step(l,w,{observations:l.p.weeks[w].sessions.filter(live).map(s=>obs(l.p,s))});
 assert.equal(l.p.weeks[7].phase,'CONSOLIDATION');
 const executed=Math.max(...l.ledger.filter(o=>!o.fact&&o.actual?.completed&&o.context?.sport==='RUN').map(o=>o.actual.minutes));
 step(l,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:'t20l-A',kind:'SYSTEMIC_FATIGUE'}});
 step(l,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:'t20l-D'},event:{id:'t20l-D',kind:'LOCAL_FATIGUE'},observations:l.p.weeks[7].sessions.filter(live).map(s=>obs(l.p,s))});
 const rl=step(l,8,{day:4,hour:'08:00:00'}),dl=lastReturn(l.p);
 assert.equal(rl.action,'REESTABLISH',rl.reason);assert.deepEqual(stops(dl),['TRAINING_AFTER','LATEST']);assert.deepEqual([dl.days,dl.class,dl.entry.run.mode],[4,'SHORT','EASY']);
 const wk8=l.p.weeks[8].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=addDays(l.p.weeks[8].startDate,4)).map(s=>s.prescription.durationMinutes);
 assert.ok(wk8.length&&Math.max(...wk8)<=executed,`the return week never exceeds what was executed (${wk8.join(',')} vs ${executed})`);
 // C3: after a continuity return (the F1 shape), a report naming the earlier break with other dates is asked; nothing is applied.
 const c=base();
 step(c,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t20c-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=c.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(c,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'t20c-D'},event:{id:'t20c-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(c.p,s):notDone(c.p,s))});
 assert.equal(step(c,5,{day:1,hour:'07:00:00'}).action,'REESTABLISH');
 const rc=step(c,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...brk(0,12),episodeId:'t20c-A'}});
 assert.equal(rc.action,'ASK',rc.reason);assert.equal(returns(c.p).length,1,'fails closed: nothing applied');
});
test('R7-D Phase 3.4 T20: the ceiling ladder (G1-G4): a return reported on Friday with that week\'s elapsed runs unreported plans the weeks after it as a Monday report does',()=>{
 const runsOfWeek=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
 const plan=d=>{const t=base();for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
  const r=step(t,7,{day:d,hour:'21:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34)});assert.equal(r.action,'REESTABLISH',r.reason);return [runsOfWeek(t.p,8),runsOfWeek(t.p,9)];};
 assert.deepEqual(plan(4),plan(0),'G3 equals G1 (R7D-FREEZE-4 planned 30/30/45 from the elapsed runs)');
});

// ---------- T21: a named correction of the latest break is the fresh re-read (SSCTR CF-P34-02) ----------
/** The Founder's case with the trip `D`; the plain review at `plainAt` (Fri wk6 08:00 by default). */
function foundersCase(id,D,plainAt={day:4,hour:'08:00:00'}){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s)));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,6,plainAt)};
}
test('R7-D Phase 3.4 T21: a named correction of the latest break gives the return a fresh report of the corrected break gives, also when it makes the breaks touch or overlap or moves a whole week out; a week it moves in between is asked about first',()=>{
 const at={day:5,hour:'10:00:00'},from=t=>addDays(t.p.weeks[6].startDate,6);
 const view=t=>{const d=lastReturn(t.p);return {stop:[d.startDate,d.endDate,d.days,d.class,stops(d).join()],runs:runsAhead(t.p,6,from(t)),strength:strengthAhead(t.p,6,from(t))};};
 const correct=(t,id,D2)=>step(t,6,{...at,kind:'RETURN_AFTER_PAUSE',interruption:{...D2,episodeId:id+'-D'},event:{id:id+'-D2',kind:'RETURN_AFTER_PAUSE'}});
 for(const [label,D2] of [['one day longer',trip(28,32)],['touching the holiday',trip(14,31)],['overlapping the holiday',trip(10,31)]]){
  const a=foundersCase('t21a',trip(28,31));assert.equal(a.r.action,'REESTABLISH',a.r.reason);
  const rc=correct(a.t,'t21a',D2),f=foundersCase('t21f',D2,at);
  assert.equal(rc.action,'REESTABLISH',`${label}: ${rc.reason}`);assert.equal(f.r.action,'REESTABLISH',`${label}, fresh: ${f.r.reason}`);
  assert.equal(lastReturn(a.t.p).relation,'SAME_BREAK',label);
  assert.deepEqual(view(a.t),view(f.t),label+': the corrected return is the fresh re-read (R7D-FREEZE-4 dropped the holiday)');
 }
 // A whole week moved out (the trip corrected to start Mon wk5): week 5's reported sessions fall inside it: asked, exactly as a fresh report.
 const o=foundersCase('t21o',trip(28,31)),n=returns(o.t.p).length,ro=correct(o.t,'t21o',trip(21,31)),fo=foundersCase('t21of',trip(21,31),at);
 assert.equal(ro.action,'ASK',ro.reason);assert.equal(fo.r.action,'ASK',fo.r.reason);assert.deepEqual(ro.missingInputs,fo.r.missingInputs);assert.equal(returns(o.t.p).length,n,'nothing applied');
 // A whole week moved in: one week between, the trip Mon-Thu wk5 applied, then corrected to Mon-Thu wk6: week 5, unreported, is asked first.
 const w=base();
 step(w,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t21w-A',kind:'SYSTEMIC_FATIGUE'}});
 step(w,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t21w-D'},event:{id:'t21w-D',kind:'LOCAL_FATIGUE'},observations:w.p.weeks[4].sessions.filter(live).map(s=>miss(friStrength)(w.p,s))});
 assert.equal(step(w,5,{day:4,hour:'08:00:00'}).action,'REESTABLISH');
 const m=returns(w.p).length,rw=step(w,6,{day:4,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'t21w-D'},event:{id:'t21w-D2',kind:'RETURN_AFTER_PAUSE'}});
 assert.equal(rw.action,'ASK',rw.reason);assert.equal(rw.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.equal(returns(w.p).length,m,'nothing applied before the answer');
});
