// R7-D Phase 3.5: directed tests for the three blockers the narrow rechecks of candidate 46934a0 found (PREREG-6 Δ22) and the test items of Δ23.
// T31 SSCTR-P34R2-F01: a race week without a gated run never re-enters running when the systemic rule holds its evidence (SY1 = SY1g).
// T32 SSCTR-P34R2-F02: on the re-read of a named correction, the report it supersedes never marks its old days as a known stop: the sessions it
//     uncovers are asked about exactly as a fresh report asks (CU3 = CU3f, CU1 = CU1f, LC1/LC1d = LC1f, CU2 = CU2f); a repeated correction changes
//     nothing (idempotent).
// T33 QRE2-P34-01: the start-time question a re-read of a recorded return asks (rule 0.8, SSCTR-P34R-F04) is answered by restating that break with
//     its start time, on every re-read path (late evidence R07, correction R04): the answer is read, the next question (if any) is answerable, and
//     the athlete leaves ASK.
// T34 QRE CQ2-3 (QRE2-P34-03): the doses of a two-level chain of own returns are pinned (the depth-2 drop mutant passes every other test).
// T35 QRE CQ2-4: the F03 clause required(x) (N01, R08 shape) and the F04 target startBreak (N05, R03 shape) are pinned.
// No number is added; clinical first, R-F08-1 and F08 are unchanged.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram} from '../r7/b/fixtures/helpers.mjs';

const GEN={id:'r7d-p35-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const GEV={id:'r7d-p35-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
/** Weeks 0-1 executed and reviewed; nothing reported after them. Strength Mon (PM) and Fri (PM), runs Tue and Thu, the long run Sun. */
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s);
const weekObs=(p,w,f=all)=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const stops=d=>d.separateBreaks.map(b=>b.stop);
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
/** The return in force and the doses ahead from day `d` of week `w`, with each episode id reduced to its role (the part after the last '-'). */
function view(t,w,d=6){const x=lastReturn(t.p),from=addDays(t.p.weeks[w].startDate,d),role=s=>String(s).split('-').at(-1);
 return {stop:x?[x.startDate,x.endDate,x.days,x.class,(x.separateBreaks??[]).map(b=>role(b.episode)+':'+b.stop).join()]:null,runs:runsAhead(t.p,w,from),strength:strengthAhead(t.p,w,from)};}
/** The sessions a TRAINING_BETWEEN_BREAKS question asks about, as `date sport`. */
const asked=(t,r)=>(r.question?.unreported?.sessionIds??[]).map(id=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(x=>x.id===id);return `${s.date} ${s.sport}`;});
const isAsk=(r,inputs)=>r.action==='ASK'&&JSON.stringify(r.missingInputs)===JSON.stringify(inputs);
const ONE_PERIOD=/as one period/;

// ---------- T31: SSCTR-P34R2-F01, the systemic rule on a race week without a gated run ----------
/** GEV with runs Thu (race touch), Sat (optional shakeout) and Sun (race) in race week 7 (`gated` adds a gated easy run on Tue); weeks 0-4 executed and
 * reviewed; A = weeks 5-6 kept on Mon wk7; week 7 reported by `report` with D = Mon-Thu wk8, declared on Fri wk8; a plain review an hour later. */
function raceWeek(id,report,{gated=false}={}){
 const t={p:program({...GEV,id:'r7d-p35-'+(gated?'g':'n'),schedule:{runDays:gated?[1,3,5,6]:[3,5,6],longRunDay:6}}),ledger:[],ref:null};
 for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:weekObs(t.p,7,report)});
 return {t,r:step(t,8,{day:4,hour:'08:00:00'})};
}
const ADV={response:{recovery:'ADVERSE'}},shakeout=s=>s.sport==='RUN'&&s.role==='SHAKEOUT';
test('R7-D Phase 3.5 T31 (SSCTR-P34R2-F01): converging adverse responses in a race week without a gated run hold running as they do with a gated run: no own return, the stop runs through the earlier break (SY1 = SY1g); one adverse sport is not systemic and the week in full re-enters, unchanged',()=>{
 const sy1=raceWeek('t31-sy1',(p,s)=>s.sport==='STRENGTH'||shakeout(s)?obs(p,s,ADV):obs(p,s)),sy1g=raceWeek('t31-sy1g',(p,s)=>s.sport==='STRENGTH'||shakeout(s)?obs(p,s,ADV):obs(p,s),{gated:true});
 const runs7=sy1.t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>s.role);
 assert.ok(runs7.length&&runs7.every(r=>['RACE_TOUCH','SHAKEOUT','RACE'].includes(r)),'the race week holds no gated run: '+runs7.join());
 assert.equal(sy1.r.action,'REESTABLISH',sy1.r.reason);assert.equal(sy1g.r.action,'REESTABLISH',sy1g.r.reason);
 const d=lastReturn(sy1.t.p),g=lastReturn(sy1g.t.p);
 assert.deepEqual(stops(d),['TRAINING_NOT_REESTABLISHED','LATEST'],'46934a0 read the earlier break as its own return and re-entered running (SHORT 4)');
 assert.deepEqual([d.startDate,d.endDate,d.days,d.class],[g.startDate,g.endDate,g.days,g.class],'the same stop as the race week with a gated run');
 assert.deepEqual([d.days,d.class,d.entry.run.mode],[25,'MODERATE','RETURN']);
 // Controls, unchanged from 46934a0: strength adverse alone is one sport, one session (not systemic); the week executed in full re-enters both sports.
 const sy0=raceWeek('t31-sy0',(p,s)=>s.sport==='STRENGTH'?obs(p,s,ADV):obs(p,s)),d0=lastReturn(sy0.t.p);
 assert.deepEqual(stops(d0),['OWN_RETURN','LATEST']);assert.equal(d0.separateBreaks[0].ownReturn.reentered.RUN,sy0.t.p.weeks[7].startDate,'not systemic: running re-enters by the touch and race');
 const sy1x=raceWeek('t31-sy1x',all);assert.deepEqual(stops(lastReturn(sy1x.t.p)),['TRAINING_AFTER','LATEST']);assert.deepEqual([lastReturn(sy1x.t.p).days,lastReturn(sy1x.t.p).class],[4,'SHORT']);
});

// ---------- T32: SSCTR-P34R2-F02, the days a named correction uncovers ----------
const at={day:5,hour:'10:00:00'};
const correct=(t,id,D2,{when=at,w=6,observations=[]}={})=>step(t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:{...D2,episodeId:id+'-D'},event:{id:`${id}-D2-${when.day}-${when.hour}`,kind:'RETURN_AFTER_PAUSE'},observations});
/** A kept on Mon wk4; the trip `D` declared on Fri wk`dw` with `facts` (a sync); a plain review an hour later. */
function declared(id,D,facts,{dw=6,dd=4}={}){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,dw,{day:dd,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:facts(t)});
 return {t,r:step(t,dw,{day:dd,hour:'08:00:00'})};
}
const v1=t=>[4,5].flatMap(w=>weekObs(t.p,w,miss(friStrength)));
test('R7-D Phase 3.5 T32 (SSCTR-P34R2-F02, CU3): a correction that uncovers the Sunday long run, left unreported, asks about it as a fresh report does, never a restart; answered done it gives the fresh report\'s return; sent again it changes nothing',()=>{
 const sun5=s=>s.date===day(27),w4=miss(s=>tueRun(s)||friStrength(s)),w5=miss(friStrength);
 const facts=withSun=>t=>[...weekObs(t.p,4,w4),...t.p.weeks[5].sessions.filter(s=>live(s)&&(withSun||!sun5(s))).map(s=>w5(t.p,s))];
 const c=declared('t32c',trip(27,31),facts(false));assert.equal(c.r.action,'REESTABLISH',c.r.reason);const n=returns(c.t.p).length;
 const rc=correct(c.t,'t32c',trip(28,31));
 const f=declared('t32f',trip(28,31),facts(false),{dd:5}),rf=f.r;
 assert.equal(rc.action,'ASK',`46934a0 applied LONG 32 RESTART: ${rc.reason}`);assert.equal(rc.question?.kind,'TRAINING_BETWEEN_BREAKS');assert.equal(returns(c.t.p).length,n,'nothing applied');
 assert.equal(rf.question?.kind,'TRAINING_BETWEEN_BREAKS',rf.reason);assert.deepEqual(asked(c.t,rc),asked(f.t,rf),'the same sessions as the fresh report');assert.deepEqual(asked(c.t,rc),[`${day(27)} RUN`]);
 // Answered done (a plain review reporting the long run): the corrected return equals the fresh report answered the same way.
 const sun=t=>t.p.weeks[5].sessions.find(s=>live(s)&&sun5(s));
 const ac=step(c.t,6,{...at,hour:'11:00:00',observations:[obs(c.t.p,sun(c.t))]}),af=step(f.t,6,{...at,hour:'11:00:00',observations:[obs(f.t.p,sun(f.t))]});
 assert.equal(ac.action,'REESTABLISH',ac.reason);assert.equal(af.action,'REESTABLISH',af.reason);
 assert.deepEqual(view(c.t,6),view(f.t,6),'answered done: the fresh report\'s return');
 assert.deepEqual(stops(lastReturn(c.t.p)),['OWN_RETURN','LATEST']);assert.deepEqual([lastReturn(c.t.p).days,lastReturn(c.t.p).class],[4,'SHORT']);
 // Idempotent: the same correction sent again (a new report, the same facts) re-reads the same record and plans the same weeks.
 const before=view(c.t,6),again=correct(c.t,'t32c',trip(28,31),{when:{day:5,hour:'12:00:00'}});
 assert.notEqual(again.action,'ASK',again.reason);assert.deepEqual(view(c.t,6),before,'a repeated correction changes nothing');
});
test('R7-D Phase 3.5 T32 (SSCTR-P34R2-F02, CU1, LC1, CU2): the sessions a correction uncovers are asked about exactly as a fresh report of the corrected break asks',()=>{
 // CU1: the trip corrected from Mon-Thu to Tue-Fri wk6; the Monday lift is now between the breaks and unreported.
 const c1=declared('t32u',trip(28,31),v1);assert.equal(c1.r.action,'REESTABLISH',c1.r.reason);
 const r1=correct(c1.t,'t32u',trip(29,32)),f1=declared('t32uf',trip(29,32),v1,{dd:5});
 assert.equal(r1.action,'ASK',`46934a0 applied it without asking: ${r1.reason}`);assert.deepEqual(asked(c1.t,r1),asked(f1.t,f1.r));assert.deepEqual(asked(c1.t,r1),[`${day(28)} STRENGTH`]);
 // LC1/LC1d: a correction sent on Mon wk7 giving only its length (read as ending the day before that review), or the same with its dates: Mon-Tue wk6.
 for(const [label,i] of [['length only',{days:5,reasonCategory:'WORK',reason:'Work trip',nonclinical:true}],['its dates',trip(30,34)]]){
  const c=declared('t32l'+label.length,trip(28,31),v1);assert.equal(c.r.action,'REESTABLISH',c.r.reason);
  const r=correct(c.t,'t32l'+label.length,i,{when:{day:0,hour:'10:00:00'},w:7});
  const f=base();step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t32lf-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,7,{day:0,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,34),episodeId:'t32lf-D'},event:{id:'t32lf-D',kind:'LOCAL_FATIGUE'},observations:v1(f)});
  const rf=step(f,7,{day:0,hour:'10:00:00'});
  assert.equal(r.action,'ASK',`${label}: 46934a0 applied it without asking: ${r.reason}`);assert.deepEqual(asked(c.t,r),asked(f,rf),label);assert.deepEqual(asked(c.t,r),[`${day(28)} STRENGTH`,`${day(29)} RUN`],label);
 }
 // CU2: the trip corrected from Mon-Thu wk5 to Mon-Thu wk6 (a whole week moved in): every session of week 5 is asked, as a fresh report asks.
 const w=base();step(w,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t32w-A',kind:'SYSTEMIC_FATIGUE'}});
 step(w,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t32w-D'},event:{id:'t32w-D',kind:'LOCAL_FATIGUE'},observations:weekObs(w.p,4,miss(friStrength))});
 assert.equal(step(w,5,{day:4,hour:'08:00:00'}).action,'REESTABLISH');
 const rw=correct(w,'t32w',trip(28,31),{when:{day:4,hour:'10:00:00'}});
 const f2=declared('t32wf',trip(28,31),t=>weekObs(t.p,4,miss(friStrength)));
 assert.equal(rw.question?.kind,'TRAINING_BETWEEN_BREAKS',rw.reason);assert.deepEqual(asked(w,rw),asked(f2.t,f2.r),'46934a0 asked about 2 of week 5\'s 5 sessions');assert.equal(asked(w,rw).length,5);
});
test('R7-D Phase 3.5 T32 (SSCTR-P34R2-F02): a correction that moves the trip a week later reads the week it leaves between the breaks from the record, never from the return it supersedes: the fresh report\'s re-entry',()=>{
 // The trip first reported on Mon wk6 as Mon-Thu wk5, with week 4 (the Friday lift missed) and week 5's Friday lift and Sunday long run; then
 // corrected on Fri wk6 to Mon-Thu wk6, with week 5's Monday to Thursday sessions now reported done: week 5 is executed in full.
 const wk5=(t,pred)=>t.p.weeks[5].sessions.filter(s=>live(s)&&pred(s)).map(s=>obs(t.p,s)),early=s=>s.date<=day(24);
 const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'t32m-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'t32m-D'},event:{id:'t32m-D',kind:'LOCAL_FATIGUE'},observations:[...weekObs(t.p,4,miss(friStrength)),...wk5(t,s=>!early(s))]});
 const first=step(t,6,{day:0,hour:'08:00:00'});assert.equal(first.action,'REESTABLISH',first.reason);
 const rc=correct(t,'t32m',trip(28,31),{when:{day:4,hour:'10:00:00'},observations:wk5(t,early)});
 const f=declared('t32mf',trip(28,31),x=>[...weekObs(x.p,4,miss(friStrength)),...weekObs(x.p,5)]);
 assert.equal(rc.action,'REESTABLISH',rc.reason);assert.equal(f.r.action,'REESTABLISH',f.r.reason);
 assert.deepEqual(stops(lastReturn(t.p)),['TRAINING_AFTER','LATEST'],'week 5 re-entered both sports (read from the superseded return, it was no week at all)');
 assert.equal(lastReturn(t.p).separateBreaks[0].reentryWeek,t.p.weeks[5].startDate);
 // The stop and the strength doses are the fresh report's. The runs differ only in the R27 easy slot: the superseded return eased Tuesday of week 6,
 // which the corrected trip now covers, and the R7-A.2 slot rule keeps a past eased slot (pre-existing on R7D-FREEZE-4, single-break corrections
 // too: disclosed as O-P35-01, not changed in this phase).
 const v=view(t,6),vf=view(f.t,6);assert.deepEqual([v.stop,v.strength],[vf.stop,vf.strength],'the fresh report of the corrected trip');
});

// ---------- T33: QRE2-P34-01, answering the start-time question of a re-read ----------
/** The Founder's case (A kept; weeks 4-5 reported by `report`; the trip Mon-Thu wk6 named, declared Fri wk6; a plain review an hour later), with the
 * Monday lift of A's first day reported with A (`lift`). */
function founders(id,{report=miss(friStrength),a=A(),lift=false,D=trip(28,31)}={}){
 const t=base(),l=lift?[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))]:[];
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:l});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,typeof report==='function'?report:report[w]))});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
const LIFT_AT=`T19:00:00Z`;   // the Monday lift (PM) is observed at 19:00
const after=()=>`${day(0)}T20:00:00Z`,before=()=>`${day(0)}T07:00:00Z`;
/** The holiday restated by its episodeId with its start time, by one of three channels at `when` of week `w`. */
const restate=(t,id,startedAt,channel,when={day:5,hour:'10:00:00'},w=6)=>{const i={...A(),episodeId:id+'-A',startedAt},e={id:`${id}-A-${channel}-${when.hour}`};
 return channel==='declaration'?step(t,w,{...when,kind:'LOCAL_FATIGUE',interruption:i,event:{...e,kind:'LOCAL_FATIGUE'}})
  :channel==='weekly review'?step(t,w,{...when,interruption:i,event:{...e,kind:'WEEKLY_REVIEW'}}):step(t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:i,event:{...e,kind:'RETURN_AFTER_PAUSE'}});};
/** The reviews after an answer: the rest of week 6 and weeks 7-8 executed and reviewed; none may ask. */
function noLaterAsk(t,label){
 const rs=[step(t,6,{day:5,hour:'13:00:00'}),step(t,6,{day:6,hour:'21:00:00'}),step(t,7,{observations:weekObs(t.p,7)}),step(t,8,{observations:weekObs(t.p,8)})];
 for(const r of rs)assert.notEqual(r.action,'ASK',`${label}: a later review asks: ${r.reason}`);
}
const CHANNELS=['declaration','weekly review','return report'];
test('R7-D Phase 3.5 T33 (QRE2-P34-01, R07): after a late first-day lift asks the holiday\'s start time, restating the holiday with it is read by the re-read: by any channel the confirmation question follows (never the "as one period" lock), the trip\'s confirmation applies the return, and no later review asks',()=>{
 for(const channel of CHANNELS){
  const id='t33'+channel[0],x=founders(id);assert.equal(x.r.action,'REESTABLISH',x.r.reason);
  const lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));assert.ok(lift.observedAt.endsWith(LIFT_AT));
  const q=step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]});
  assert.ok(isAsk(q,['interruption.startedAt']),q.reason);assert.deepEqual([q.question?.episodeId,q.question?.startDate],[id+'-A',day(0)]);
  const a=restate(x.t,id,after(),channel);
  assert.ok(isAsk(a,['interruption.episodeId'])&&!ONE_PERIOD.test(a.reason),`${channel}: the answer is read and the confirmation question follows (46934a0: "as one period" at every review): ${a.reason}`);
  assert.deepEqual([a.question?.episodeId,a.question?.startDate],[id+'-D',day(28)],channel);
  const c=correct(x.t,id,trip(28,31),{when:{day:5,hour:'11:00:00'}});
  assert.equal(c.action,'REESTABLISH',`${channel}: the confirmation applies the return: ${c.reason}`);
  // It reads the lift as before the holiday: the same plan as the holiday with its start time stated from the outset, the lift reported late and the
  // trip confirmed.
  const ctl=founders(id+'c',{a:brk(0,13,{startedAt:after()})});
  step(ctl.t,6,{day:5,hour:'09:00:00',observations:[obs(ctl.t.p,ctl.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))]});
  assert.equal(correct(ctl.t,id+'c',trip(28,31),{when:{day:5,hour:'11:00:00'}}).action,'REESTABLISH');
  assert.deepEqual(view(x.t,6),view(ctl.t,6),channel+': the start time stated from the outset');
  noLaterAsk(x.t,channel);
 }
});
test('R7-D Phase 3.5 T33 (QRE2-P34-01, R07): a start time before the lift keeps the return as it is (nothing to confirm); confirming the trip first asks the start time again, and the restatement then applies the return',()=>{
 for(const channel of CHANNELS){
  const id='t33b'+channel[0],x=founders(id);
  const lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
  assert.ok(isAsk(step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]}),['interruption.startedAt']));
  const plan=view(x.t,6),a=restate(x.t,id,before(),channel);
  assert.notEqual(a.action,'ASK',`${channel}: the lift falls inside the holiday, as the return read it: ${a.reason}`);assert.deepEqual(view(x.t,6),plan,channel);
  noLaterAsk(x.t,channel);
 }
 // The trip confirmed first (I6's answer): the start time is still unknown, so it is asked again; the restatement answers it and the kept confirmation is
 // applied (by the restating review itself, or by the next review when the restatement comes with another event).
 for(const channel of CHANNELS){
  const id='t33c'+channel[0],x=founders(id);
  const lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
  step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]});
  const c=correct(x.t,id,trip(28,31));assert.ok(isAsk(c,['interruption.startedAt']),c.reason);
  const a=restate(x.t,id,after(),channel,{day:5,hour:'11:00:00'});
  const applied=a.action==='REESTABLISH'?a:step(x.t,6,{day:5,hour:'12:00:00'});
  assert.ok(channel!=='declaration'||isAsk(a,['interruption.reportedOnItsOwn']),`declaration: the confirmation on record is applied by a return report or the week's review: ${a.reason}`);
  assert.equal(applied.action,'REESTABLISH',`${channel}: ${applied.reason}`);
  noLaterAsk(x.t,channel);
 }
 // A restatement that changes another fact (here a start time on another day) is no answer: it is asked as before; a newer restatement with a valid
 // start time supersedes it and is read.
 const id='t33w',x=founders(id),lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
 step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]});
 const wrong=restate(x.t,id,`${day(1)}T20:00:00Z`,'weekly review');assert.equal(returns(x.t.p).length,1,'nothing applied');
 assert.ok(wrong.action==='ASK'&&wrong.missingInputs.includes('interruption.startedAtContradictsStartDate'),`the existing question about contradicting facts, never read as the answer: ${wrong.reason}`);
 const right=restate(x.t,id,after(),'weekly review',{day:5,hour:'11:00:00'});assert.ok(isAsk(right,['interruption.episodeId']),right.reason);
 assert.equal(correct(x.t,id,trip(28,31),{when:{day:5,hour:'12:00:00'}}).action,'REESTABLISH');noLaterAsk(x.t,'superseded restatement');
});
test('R7-D Phase 3.5 T33 (QRE2-P34-01, R04): a correction that leaves strength reading the holiday\'s own return asks the holiday\'s start time; restating it, by any channel, applies the correction as with the start time stated from the outset, and no later review asks',()=>{
 const REP={4:miss(friStrength),5:miss(tueRun)},CORR=trip(22,32);
 const ctl=founders('t33rc',{report:REP,lift:true,a:brk(0,13,{startedAt:after()})});assert.equal(correct(ctl.t,'t33rc',CORR).action,'REESTABLISH');
 for(const channel of CHANNELS){
  const id='t33r'+channel[0],x=founders(id,{report:REP,lift:true});assert.equal(x.r.action,'REESTABLISH',x.r.reason);
  const q=correct(x.t,id,CORR);assert.ok(isAsk(q,['interruption.startedAt']),q.reason);assert.equal(q.question?.episodeId,id+'-A');
  const a=restate(x.t,id,after(),channel,{day:5,hour:'11:00:00'});
  assert.ok(!ONE_PERIOD.test(a.reason),`${channel}: 46934a0 locked in "as one period": ${a.reason}`);
  // A return report or the week's review applies the correction on record in the same review, reading the restatement it carries (as the fresh
  // path does); another event kind is asked to be sent on its own, and the next review applies it.
  if(channel==='declaration')assert.ok(isAsk(a,['interruption.reportedOnItsOwn']),a.reason);else assert.equal(a.action,'REESTABLISH',`${channel}: ${a.reason}`);
  const applied=a.action==='REESTABLISH'?a:step(x.t,6,{day:5,hour:'12:00:00'});
  assert.equal(applied.action,'REESTABLISH',`${channel}: ${applied.reason}`);
  assert.deepEqual(view(x.t,6),view(ctl.t,6),channel+': the correction with the start time stated from the outset');
  // Idempotent: the correction sent again changes nothing.
  const plan=view(x.t,6);correct(x.t,id,CORR,{when:{day:5,hour:'12:30:00'}});assert.deepEqual(view(x.t,6),plan,channel+': a repeated correction');
  noLaterAsk(x.t,channel);
 }
});

// ---------- T34: QRE CQ2-3 (QRE2-P34-03), a two-level chain of own returns ----------
test('R7-D Phase 3.5 T34 (QRE CQ2-3): four separate breaks with a run-complete week between each pair: the inner own return reads its own earlier break (two levels), and the doses ahead are pinned',()=>{
 const t=base(),run3=w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s));
 step(t,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,6),event:{id:'t34-z',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(14,20),episodeId:'t34-y'},event:{id:'t34-y',kind:'LOCAL_FATIGUE'},observations:run3(3)});
 step(t,7,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,34),episodeId:'t34-x'},event:{id:'t34-x',kind:'LOCAL_FATIGUE'},observations:run3(5)});
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:'t34-h'},event:{id:'t34-h',kind:'LOCAL_FATIGUE'},observations:run3(7)});
 const r=step(t,8,{day:4,hour:'08:00:00'}),d=lastReturn(t.p),row=e=>d.separateBreaks.find(b=>b.episode===e);
 assert.equal(r.action,'REESTABLISH',r.reason);
 assert.deepEqual(['t34-z','t34-y','t34-x','t34-h'].map(e=>[row(e)?.stop,row(e)?.stopInOwnReturn??null]),[['WITHIN_OWN_RETURN','WITHIN_OWN_RETURN'],['WITHIN_OWN_RETURN','OWN_RETURN'],['OWN_RETURN',null],['LATEST',null]]);
 // Pinned on the candidate: strength restarts from the return steps the two-level chain gives (a mutant that drops the second-level break plans more).
 assert.deepEqual(view(t,8,4),{stop:[day(42),day(45),4,'SHORT','z:WITHIN_OWN_RETURN,y:WITHIN_OWN_RETURN,x:OWN_RETURN,h:LATEST'],
  runs:runsAhead(t.p,8,addDays(t.p.weeks[8].startDate,4)),strength:T34_STRENGTH});
});
// The strength doses ahead on the candidate (Fri wk8, Mon and Fri wk9), recorded when this test was written: every own return in the chain is short
// (seven days), so strength resumes what was executed before the first break, with no step (each week missed its Friday session).
const T34_STRENGTH=['db-rdl:2x10@ESTABLISH','db-row:2x10@22','db-bench-press:2x10@22','db-split-squat:1x12@ESTABLISH','dead-bug:1x14@BODYWEIGHT',
 'back-squat:3x7@82.5','db-bench-press:2x12@22','db-row:2x12@22','standing-calf-raise:1x14@BODYWEIGHT','dead-bug:1x16@BODYWEIGHT',
 'db-rdl:2x10@FROM_LOG','db-row:2x12@22','db-bench-press:2x12@22','db-split-squat:1x12@FROM_LOG','dead-bug:1x16@BODYWEIGHT'];

// ---------- T35: QRE CQ2-4, N01 and N05 ----------
test('R7-D Phase 3.5 T35 (QRE CQ2-4, N01): a post-event week whose runs are all optional, none done, re-enters strength only: running continues from the earlier break\'s own return',()=>{
 const t={p:program({...GEV,id:'r7d-p35-r8'}),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:'t35a-A',kind:'SYSTEMIC_FATIGUE'}});
 assert.ok(t.p.weeks[8].sessions.filter(s=>live(s)&&s.sport==='RUN').every(s=>s.optional),'week 8 holds only optional runs');
 const o=[...weekObs(t.p,7,notDone),...weekObs(t.p,8,(p,s)=>s.sport==='RUN'?notDone(p,s):obs(p,s))];
 step(t,9,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(49,52),episodeId:'t35a-D'},event:{id:'t35a-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,9,{day:4,hour:'08:00:00'}),d=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH',r.reason);assert.deepEqual(stops(d),['OWN_RETURN','LATEST'],'N01 read TRAINING_AFTER (running re-entered through a week with no run done)');
 assert.deepEqual([d.separateBreaks[0].ownReturn.reentered.RUN,d.separateBreaks[0].ownReturn.reentered.STRENGTH],[null,t.p.weeks[8].startDate]);
});
test('R7-D Phase 3.5 T35 (QRE CQ2-4, N05): with a stop that runs back through an even earlier break, the start-time question names the break that starts that stop, and its answer gives the return the start time stated from the outset gives',()=>{
 const chain=(id,zi)=>{const t=base(),lift=[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))];
  step(t,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:zi,event:{id:id+'-z',kind:'SYSTEMIC_FATIGUE'},observations:lift});
  step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(14,20),episodeId:id+'-x'},event:{id:id+'-x',kind:'LOCAL_FATIGUE'},observations:weekObs(t.p,3,notDone)});
  step(t,7,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(35,38),episodeId:id+'-H'},event:{id:id+'-H',kind:'LOCAL_FATIGUE'},observations:[5,6].flatMap(w=>weekObs(t.p,w,miss(friStrength)))});
  return {t,r:step(t,7,{day:4,hour:'08:00:00'})};};
 const x=chain('t35b',brk(0,6));
 assert.ok(isAsk(x.r,['interruption.startedAt']),x.r.reason);assert.deepEqual([x.r.question?.episodeId,x.r.question?.startDate],['t35b-z',day(0)],'N05 named x, the own return\'s head');
 step(x.t,7,{day:4,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...brk(0,6),episodeId:'t35b-z',startedAt:after()},event:{id:'t35b-ans',kind:'LOCAL_FATIGUE'}});
 const p=step(x.t,7,{day:4,hour:'10:00:00'});assert.equal(p.action,'REESTABLISH',p.reason);
 const ctl=chain('t35c',brk(0,6,{startedAt:after()}));assert.equal(ctl.r.action,'REESTABLISH',ctl.r.reason);
 assert.deepEqual(view(x.t,7),view(ctl.t,7));
});
