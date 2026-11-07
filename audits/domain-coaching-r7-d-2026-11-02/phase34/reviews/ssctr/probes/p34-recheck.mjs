// SSCTR R7-D Phase 3.4 fresh recheck probes (CF-P34-08 of SSCTR-R7D-P34-DECISION-r1), written by the fresh recheck instance. Synthetic development
// fixtures (CoachingCore/r7/b/fixtures/helpers.mjs, through the SSCTR Phase 3.3 helpers): engineering evidence for a domain recheck only, never gate,
// quality or generalization evidence. Read-only: run on a scratch root holding CoachingCore (and the five SSCTR authority records the bound
// repertoire reads), never on the repository.
//   node p34-recheck.mjs <root holding CoachingCore> --label <name>
// Standard fixture: strength Mon (day 0, PM) and Fri (4, PM), runs Tue (1) and Thu (3), the long run Sun (6). Day n counts from Mon of week 2.
//  RT*  The race-week contract (BR-Q4.1): the 10K fixture of p34-ssctr.mjs (week 7 = RACE_WEEK: strength Mon, EASY Tue, RACE_TOUCH Thu, RACE Sun),
//       A = weeks 5-6 kept Mon wk7, week 7 reported (variants), D = Mon-Thu wk8, declared Fri wk8, plain review.
//       RT0 in full; RT1 the race touch reported completed at half its minutes (partial by the existing completion rule); RT2 the easy run so
//       (a gated row, control); RT3 the race touch completed with recovery ADVERSE. RT0o/RT1o/RT2o: the same in a run-only plan (in full; the
//       touch at half its minutes; the touch not done, control).
//  RW   A race week with no gated run (run days Thu, Sat, Sun: RACE_TOUCH Thu, optional SHAKEOUT Sat, RACE Sun), executed in full (BR-Q4.4);
//       RWo the same in a run-only plan.
//  EPW* The episode rule for the race shapes (A applied by a return report when stated; the race week reviewed as re-planned; D by a return
//       report): the timely comparator of W1 and W3.
//  SD*  A strength session on the earlier break's first day without a stated start (0.8; BR-Q1.3 "a decision met inside it is returned"):
//       SD1 the V1 shape (weeks 4-5 every run done, Fri strength missed) with A's Monday wk2 lift reported executed; SD1k the same lift with A
//       alone, applied by a return report (the existing rule); SD2 SD1 with A's start time stated after the lift; SD3 the V2 shape (strength
//       complete) with the same lift, where strength reads its executed history (no question needed).
//  F*   R-F08-1 on the separate-break paths: F1 A reported as an injury (routed), restated by name as a holiday with weeks 4-5 trained (V1),
//       then the trip and a plain review; F2 after the V1 own return, a report naming A that states an injury (F2b then a named correction of the
//       trip, F2c then a weekly review); F3 (control) A with an unclear reason, clarified by name, then the V1 shape.
//  G6   The ceiling (SSCTR-P34-F01 fix): the G3 shape with the elapsed week-7 runs reported executed: the runs completed still count.
//  C5   A named correction that moves the latest break's start one day later (CF-P34-02), against C5f, a fresh report of the corrected break.
//  X9   Three breaks with an inner own return: A; week 4 (V1 pattern); B = Mon-Thu wk5; week 6 (V1 pattern); D = Mon-Thu wk7; all reported with D.
import {setup} from '../../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup();
const {L,step,base,copy,day,brk,trip,obs,notDone,weekObs,view,live,returns,out}=P;
const {K,FULL,program}=L;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const v1=(p,s)=>friStrength(s)?notDone(p,s):obs(p,s);
const half=(p,s)=>obs(p,s,{minutes:Math.max(1,Math.round(s.prescription.durationMinutes/2))});
const sb=t=>(returns(t.p).at(-1)?.interruption?.separateBreaks??[]).map(b=>({episode:b.episode,stop:b.stop,...(b.ownReturn?{ownReturn:b.ownReturn}:{}),...(b.ownReturnOf?{ownReturnOf:b.ownReturnOf,stopInOwnReturn:b.stopInOwnReturn}:{})}));
// Bulk: A kept by a fatigue report (week aw, day 0), with optional observations; the weeks between reported with D; a plain review after D.
function bulk(t,id,{A,aw,weeks,dw,report,dDays=4,aObs=[]}){
 step(t,aw,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:aObs});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d0=dw*7-14,d=trip(d0,d0+dDays-1);
 step(t,dw,{day:dDays,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,dw,{day:dDays,hour:'08:00:00'});
 return {...view(r,t,dw,6),missingInputs:r.missingInputs??[],records:r.action==='REESTABLISH'?sb(t):null};
}
// ---------- RT: the race-week contract ----------
const GEV={id:'ssctr-p34r-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
function raceBase(o){const t={p:program(o),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});return t;}
const ev0=raceBase(GEV);
const RT=(id,f)=>bulk(copy(ev0),id,{A:brk(21,34),aw:7,weeks:[7],dw:8,report:f});
out.cases.RT0_raceWeekInFull=RT('rt0',(p,s)=>obs(p,s));
out.cases.RT1_raceTouchCompletedAtHalfMinutes=RT('rt1',(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s));
out.cases.RT2_easyRunCompletedAtHalfMinutes_control=RT('rt2',(p,s)=>role('EASY')(s)?half(p,s):obs(p,s));
out.cases.RT3_raceTouchRecoveryAdverse=RT('rt3',(p,s)=>role('RACE_TOUCH')(s)?obs(p,s,{response:{recovery:'ADVERSE'}}):obs(p,s));
// RT*o: the same race week in a run-only plan (EASY Tue, RACE_TOUCH Thu, RACE Sun): no strength week can carry direction A.
{const evo=raceBase({...GEV,id:'ssctr-p34r-evo',goals:{run:'10K',strength:'NONE'},knownExercises:[],schedule:{strengthDays:[]}});
 const RTo=(id,f)=>bulk(copy(evo),id,{A:brk(21,34),aw:7,weeks:[7],dw:8,report:f});
 out.cases.RT0o_runOnlyRaceWeekInFull=RTo('rt0o',(p,s)=>obs(p,s));
 out.cases.RT1o_runOnlyRaceTouchCompletedAtHalfMinutes=RTo('rt1o',(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s));
 out.cases.RT2o_runOnlyRaceTouchMissed_control=RTo('rt2o',(p,s)=>role('RACE_TOUCH')(s)?notDone(p,s):obs(p,s));}
// ---------- RW: a race week with no gated run ----------
{const ev=raceBase({...GEV,id:'ssctr-p34r-ev2',schedule:{runDays:[3,5,6],longRunDay:6}});
 const planned=ev.p.weeks[7].sessions.filter(live).map(s=>`${s.date} ${s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'STRENGTH'}${s.optional?'(optional)':''}`);
 out.cases.RW_raceWeekWithoutGatedRun={phase:ev.p.weeks[7].phase,planned,result:bulk(ev,'rw',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>obs(p,s)})};}
// RWo: the same race week in a run-only plan (no strength), executed in full.
{const ev=raceBase({...GEV,id:'ssctr-p34r-ev3',goals:{run:'10K',strength:'NONE'},knownExercises:[],schedule:{runDays:[3,5,6],longRunDay:6,strengthDays:[]}});
 const planned=ev.p.weeks[7].sessions.filter(live).map(s=>`${s.date} ${s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'STRENGTH'}${s.optional?'(optional)':''}`);
 out.cases.RWo_runOnlyRaceWeekWithoutGatedRun={phase:ev.p.weeks[7].phase,planned,result:bulk(ev,'rwo',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>obs(p,s)})};}
// EPW: the episode rule for the race shapes (A applied by a return report when stated, Mon wk7; the race week reviewed as re-planned; D by a return
// report on Fri wk8): the timely comparator of W1 and W3.
for(const [id,f] of [['EPW1_episodeRuleRaceWeekInFull',(p,s)=>obs(p,s)],['EPW3_episodeRuleRaceMissed',(p,s)=>role('RACE')(s)?notDone(p,s):obs(p,s)]]){
 const t=copy(ev0),ra=step(t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(21,34)});
 const week7=t.p.weeks[7].sessions.filter(live).map(s=>`${s.date} ${s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'STRENGTH'}`);
 step(t,7,{observations:weekObs(t.p,7,f)});
 const rd=step(t,8,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(42,45)});
 out.cases[id]={aReturn:ra.action,week7AsReplanned:week7,result:{...view(rd,t,8,6)}};
}
// ---------- SD: a strength session on the earlier break's first day ----------
{const t0=base(),mon=t0.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0));
 out.cases.SD0_mondayWk2LiftAsPlanned=mon?mon.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`).join(' '):null;
 const lift=t=>[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))];
 {const t=base();out.cases.SD1_v1WithLiftOnFirstDayOfA=bulk(t,'sd1',{A:brk(0,13),aw:4,weeks:[4,5],dw:6,report:v1,aObs:lift(t)});}
 {const t=base(),r=step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(0,13),observations:lift(t)});
  out.cases.SD1k_singleBreakWithLiftOnFirstDay={action:r.action,status:r.status,missingInputs:r.missingInputs??[],reason:(r.reason??'').slice(0,200)};}
 {const t=base();out.cases.SD2_v1WithLiftBeforeStatedStart=bulk(t,'sd2',{A:brk(0,13,{startedAt:day(0)+'T20:00:00Z'}),aw:4,weeks:[4,5],dw:6,report:v1,aObs:lift(t)});}
 // SD3: the V2 shape (the Tuesday run missed each week, strength complete) with the same lift: strength reads its executed history, so the order of
 // the lift and A's start does not change the state the return starts from (no question needed).
 {const t=base(),tue=s=>s.sport==='RUN'&&dow(s)===2;out.cases.SD3_v2WithLiftOnFirstDayOfA=bulk(t,'sd3',{A:brk(0,13),aw:4,weeks:[4,5],dw:6,report:(p,s)=>tue(s)?notDone(p,s):obs(p,s),aObs:lift(t)});}}
// ---------- F: R-F08-1 on the separate-break paths ----------
const injury=x=>brk(0,13,{reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false,...x});
{const t=base(),r1=step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:injury(),event:{id:'f1-A',kind:'SYSTEMIC_FATIGUE'}});
 t.ref=null;
 const o=[4,5].flatMap(w=>weekObs(t.p,w,v1));
 const r2=step(t,6,{day:4,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...brk(0,13),episodeId:'f1-A'},event:{id:'f1-A2',kind:'SYSTEMIC_FATIGUE'},observations:o});
 const r3=step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'f1-D'},event:{id:'f1-D',kind:'LOCAL_FATIGUE'}});
 const r4=step(t,6,{day:4,hour:'08:00:00'}),r5=step(t,6,{day:4,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'f1-D'},event:{id:'f1-D2',kind:'RETURN_AFTER_PAUSE'}});
 const s=r=>({status:r.status,action:r.action,proposal:!!r.proposal,reason:(r.reason??'').slice(0,160)});
 out.cases.F1_injuryRestatedThenTrainingThenTrip={injury:s(r1),restatement:s(r2),trip:s(r3),plainReview:s(r4),tripReturnReport:s(r5),returnsApplied:returns(t.p).length};}
{const t=base(),first=bulk(t,'f2',{A:brk(0,13),aw:4,weeks:[4,5],dw:6,report:v1});
 const r=step(t,6,{day:5,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...injury(),episodeId:'f2-A'},event:{id:'f2-A2',kind:'RETURN_AFTER_PAUSE'}});
 // F2b, F2c: then a named correction of the trip (it re-reads the separate breaks its return recorded), and a plain weekly review.
 const s=x=>({status:x.status,action:x.action,proposal:!!x.proposal,reason:(x.reason??'').slice(0,160)});
 const rb=step(copy(t),6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'f2-D'},event:{id:'f2-D2',kind:'RETURN_AFTER_PAUSE'}});
 const rc=step(copy(t),6,{day:6,hour:'21:00:00'});
 out.cases.F2_afterOwnReturnTheEarlierBreakStatedAsInjury={first:{ret:first.ret,records:first.records?.map(b=>b.stop)},then:{status:r.status,action:r.action,proposal:!!r.proposal,missingInputs:r.missingInputs??[],reason:(r.reason??'').slice(0,200)},
  F2b_thenNamedCorrectionOfTheTrip:s(rb),F2c_thenWeeklyReview:s(rc),returnsApplied:returns(t.p).length};}
{const t=base(),q=step(t,4,{day:0,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13,{reasonCategory:null,reason:'stuff'}),event:{id:'f3-U',kind:'SYSTEMIC_FATIGUE'}});
 const res=bulk(t,'f3',{A:{...brk(0,13),episodeId:'f3-U'},aw:4,weeks:[4,5],dw:6,report:v1});
 out.cases.F3_unclearReasonClarified_control={first:{status:q.status,action:q.action},result:res};}
// ---------- G6: the ceiling keeps executed runs ----------
{const runs=(t,w)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ');
 for(const [id,d,mode] of [['G1_mondayReport',0,'none'],['G6_fridayReportElapsedRunsExecuted',4,'done']]){
  const t=base();for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
  const elapsed=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<day(35+d));
  const r=step(t,7,{day:d,hour:'21:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34),observations:mode==='done'?elapsed.map(s=>obs(t.p,s)):[]});
  const ret=returns(t.p).at(-1);
  out.cases[id]={action:r.action,ret:ret?`${ret.interruption.class} ${ret.interruption.days}d fromWeek ${ret.fromWeek}`:null,executedInWk7:mode==='done'?elapsed.map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(' '):'',wk8:runs(t,8),wk9:runs(t,9)};
 }}
// ---------- C5: a named correction that moves the latest break's start later (CF-P34-02 shape not in T21) ----------
// The Founder's case (V1: A kept Mon wk4; weeks 4-5 every run done, Fri strength missed; D = Mon-Thu wk6 named, declared Fri wk6 07:00; plain review
// 08:00), then D corrected by name to Tue-Fri wk6 on Sat 10:00 with the Monday wk6 lift (now between the breaks) reported not done. C5f: the fresh
// comparator, the same facts with D reported as Tue-Fri wk6 from the start and the plain review on Sat 10:00.
{const mon6=t=>t.p.weeks[6].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(28));
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'c5-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'c5-D'},event:{id:'c5-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,v1))});
 const first=view(step(t,6,{day:4,hour:'08:00:00'}),t,6,6),firstRecords=sb(t);
 const m=mon6(t),rc=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(29,32),episodeId:'c5-D'},event:{id:'c5-D2',kind:'RETURN_AFTER_PAUSE'},observations:m?[notDone(t.p,m)]:[]});
 out.cases.C5_correctionMovesTheTripStartLater={first:{ret:first.ret,records:firstRecords.map(b=>b.stop)},corrected:{...view(rc,t,6,6),records:rc.action==='REESTABLISH'?sb(t).map(b=>b.stop):null}};
 const f=base();
 step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'c5f-A',kind:'SYSTEMIC_FATIGUE'}});
 const mf=mon6(f);
 step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(29,32),episodeId:'c5f-D'},event:{id:'c5f-D',kind:'LOCAL_FATIGUE'},observations:[...[4,5].flatMap(w=>weekObs(f.p,w,v1)),...(mf?[notDone(f.p,mf)]:[])]});
 const rf=step(f,6,{day:5,hour:'10:00:00'});
 out.cases.C5f_freshReportOfTheCorrectedTrip={...view(rf,f,6,6),records:rf.action==='REESTABLISH'?sb(f).map(b=>b.stop):null};}
// ---------- X9: three breaks with an inner own return ----------
{const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'x9-A',kind:'SYSTEMIC_FATIGUE'}});
 const o4=weekObs(t.p,4,v1);
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'x9-B'},event:{id:'x9-B',kind:'LOCAL_FATIGUE'},observations:o4});
 const o5=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date>day(24)).map(s=>v1(t.p,s)),o6=weekObs(t.p,6,v1);
 step(t,7,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(35,38),episodeId:'x9-D'},event:{id:'x9-D',kind:'LOCAL_FATIGUE'},observations:[...o5,...o6]});
 const r=step(t,7,{day:4,hour:'08:00:00'});
 out.cases.X9_threeBreaksInnerOwnReturn={...view(r,t,7,6),missingInputs:r.missingInputs??[],records:r.action==='REESTABLISH'?sb(t):null};}
console.log(JSON.stringify(out,null,1));
