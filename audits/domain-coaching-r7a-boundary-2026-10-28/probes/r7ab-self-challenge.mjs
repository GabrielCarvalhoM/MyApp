// DOMAIN_COACHING_R7-A boundary closure author self-challenge (Founder request §17): equivalence classes that try to make a projected week
// start count as history. Each class states its oracle; the probe prints the cases and the violations. Built on the R7-A final engineering
// judge's helpers (qe-r7af-lib.mjs): synthetic data, DEV_TEST_ONLY authority, read-only, prints only. QE_LIVE_ROOT=<a CoachingCore copy>
// runs another runtime (for example ../final-freeze-source/CoachingCore, the byte-exact R7A-FINAL-FREEZE). Usage: node r7ab-self-challenge.mjs
//
// Base history (the judge's P30c): A, a 16-day break reported Monday 06:00 of week 5 (re-entry that week; A stores the conditional start of
// week 6, return step 1). Week 5 rows: Tue run, Wed lift (squat, bench, row, calf raise, dead bug), Thu run, Sat lift (RDL, row, bench, split
// squat, dead bug), Sun long run. B: a separate 2-day trip, Tuesday-Wednesday of week 6, reported Thursday 06:00 (or as each class states).
import {H,R,opts,afterA,at,on,obs,addDays,brk,lastR,copy,stateSummary,preBreakDose,live,print,tzOf} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const out={probe:'R7AB-SELF-CHALLENGE-1',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',classes:{},violations:[]};
const flag=(c,what)=>out.violations.push(`${c}: ${what}`),expect=(c,ok,what)=>{if(!ok)flag(c,what);return ok;};
const steps=st=>({run:st?.run?.returnStep??null,mode:st?.run?.mode??null,strength:Object.fromEntries(Object.entries(st?.strength?.exercises??{}).map(([k,e])=>[k,e.returnStep??null]))});
const point=d=>{const s=d?.interruption?.stateAt;return s?`${s.kind}/w${s.week}/${s.eventId??'-'}`:null;};
const facts=st=>JSON.stringify({run:{...st.run,planned:undefined},strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))}});
const WED=new Set(['back-squat','db-bench-press','db-row','db-calf-raise','dead-bug']);
// Reports: each session of week w chosen by `keep`, observed on its own day, sent the same evening (a mid-week review: no consolidation)
// or at `hm` on `day`. `edit` changes an observation (not completed, adverse, a lighter load).
const report=(t,w,{keep=()=>true,day=null,hm='21:00',kind='WEEKLY_REVIEW',edit=o=>o}={})=>{const ss=t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s));if(day!==null)return H.ev(t,at(t.p,w,day,hm,{kind,observations:ss.map(s=>edit(obs(t.p,s),s))}));for(const s of ss)H.ev(t,at(t.p,w,s.day,hm,{kind,observations:[edit(obs(t.p,s),s)]}));return 'per-day';};
const B=(t,d0,{from=8,to=9,said=10,hm='06:00',extra={}}={})=>{const r=H.ev(t,on(t,addDays(d0,said),hm,brk(addDays(d0,from),addDays(d0,to),extra)));if(r!=='MODIFY/REESTABLISH')flag('harness',`B (${addDays(d0,from)}..${addDays(d0,to)}) is ${r}: ${t.last.reason}`);return {r,d:lastR(t.p)};};
const base=(id,o={})=>afterA(id,o);
// ---------- C1. QE-R7AF-01 and handler independence (I4, I8, P1, P2): one decision X between A's unfinished re-entry week and B ----------
{
 const c='C1-unrelated-decision',cells=[];
 const {t:b0,d0}=base('ab-c1');report(b0,5,{keep:s=>s.day<3});
 const ctl=copy(b0),C=B(ctl,d0).d,cs=steps(C.interruption.entry);
 const X={
  equipmentWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}},
  equipmentNoop:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}},
  equipmentSame:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}},
  systemicFatigue:{kind:'SYSTEMIC_FATIGUE'},localFatigue:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},
  strengthMinutes:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}},sameSchedule:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:60}},
  goalChange:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},unavailableDay:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,12)]}},
  missedNone:{kind:'MISSED_SESSION'},recovered:{kind:'RECOVERED'}
 };
 // Monday 06:00 of week 6 (week 5 is over and was never consolidated): every cell must give the control's start (no handler consolidates week 5).
 for(const [n,x] of Object.entries(X)){const t=copy(b0),xr=H.ev(t,on(t,addDays(d0,7),'06:00',structuredClone(x))),D=B(t,d0).d,e=D.interruption.entry;
  const same=facts(e)===facts(C.interruption.entry);cells.push({clock:'mon0600',x:n,xr,point:point(D),authority:D.interruption.stateAt.authority,same});
  expect(c,same,`${n} at Monday 06:00 of week 6 changes B's start (point ${point(D)}, steps ${JSON.stringify(steps(e))} vs control ${JSON.stringify(cs)})`);
  expect(c,D.interruption.relation==='NEW'&&D.interruption.episode!==b0.p.decisions.find(d=>d.action==='REESTABLISH').interruption.episode,`${n}: B is not a new episode`);
  expect(c,!preBreakDose(t.p,6,addDays(d0,10)).length&&!preBreakDose(t.p,7,addDays(d0,14)).length,`${n}: a pre-break dose after B`);}
 // Sunday 06:00 of week 5 (the week is complete for a review): a handler that applies the weekly review's rule to the whole week may
 // consolidate it; then the run holds (Thursday's run was missed) and only Wednesday's exercises may step. A strength-only handler keeps the
 // run projected, so the start is not history and B starts as the control (P1: a no-op statement promotes nothing).
 const review=copy(b0);H.ev(review,at(review.p,5,6,'06:00',{kind:'WEEKLY_REVIEW'}));const RV=B(review,d0).d;
 for(const [n,x] of [['weeklyReview',null],...Object.entries(X)]){const t=copy(b0);const xr=x?H.ev(t,on(t,addDays(d0,6),'06:00',structuredClone(x))):H.ev(t,at(t.p,5,6,'06:00',{kind:'WEEKLY_REVIEW'}));const D=B(t,d0).d,e=D.interruption.entry,s=steps(e);
  cells.push({clock:'sun0600',x:n,xr,point:point(D),authority:D.interruption.stateAt.authority,steps:s});
  expect(c,s.run===cs.run,`${n} at Sunday 06:00: the run return step ${s.run} differs from the control's ${cs.run} (Thursday's run was missed)`);
  for(const [id,k] of Object.entries(s.strength))expect(c,k===cs.strength[id]||WED.has(id)&&D.interruption.stateAt.authority?.STRENGTH==='WEEK_EVIDENCE'&&k===cs.strength[id]+1,`${n} at Sunday 06:00: ${id} at step ${k} (control ${cs.strength[id]}) without executing it`);
  if(['equipmentWindow','equipmentNoop','equipmentSame','sameSchedule','missedNone','recovered'].includes(n)&&!['weeklyReview'].includes(n))expect(c,facts(e)===facts(C.interruption.entry)||facts(e)===facts(RV.interruption.entry),`${n} at Sunday 06:00 gives neither the control's start nor the weekly review's`);
  if(n==='strengthMinutes')expect(c,facts(e)===facts(RV.interruption.entry),'P2: a schedule change on Sunday (the weekly review rule) gives another start than the weekly review');}
 out.classes[c]={control:{point:point(C),steps:cs},cells};
}
// ---------- C2. The re-entry week executed in full, with or without its review (I5, P2, P3) ----------
{
 const c='C2-executed-in-full',cells={};
 const {t:b0,d0}=base('ab-c2');
 const mk=(name,fn)=>{const t=copy(b0);fn(t);const D=B(t,d0).d;cells[name]={point:point(D),authority:D.interruption.stateAt.authority,steps:steps(D.interruption.entry)};return D;};
 // The harness logs an effort-guided row at 20 kg: lighter than the known load the return keeps as its ceiling, so a review adopts it.
 const noReview=mk('perDayNoReview',t=>{report(t,5,{keep:s=>s.day<6});H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));});
 const reviewed=mk('sundayReview',t=>{report(t,5,{keep:s=>s.day<6});H.ev(t,at(t.p,5,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));});
 expect(c,reviewed.interruption.stateAt.kind==='WEEK_START'&&reviewed.interruption.stateAt.week===6,`a reviewed re-entry week is not B's point (${point(reviewed)})`);
 // Without the review, the effort-guided loads lifted (20 kg) are below the known load the projection kept: the projection is not what was
 // executed, so B starts from the re-entry and its facts (never from the projection's 82.5 kg step 1).
 expect(c,noReview.interruption.stateAt.kind==='RETURN',`an unreviewed re-entry week lifted lighter than the projection, yet B starts at ${point(noReview)}`);
 // Logged at the known loads the projection kept, the same unreviewed week is executed exactly as projected: completed sessions anchor it.
 const atKnown=mk('perDayAtKnownLoads',t=>{const kg=id=>t.p.stateTrace[5].strength.exercises[id]?.load;report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.sport!=='STRENGTH'?o:{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>Number.isFinite(kg(e.id))&&x.load.unit==='KG'?{...x,load:{...x.load,value:kg(e.id)}}:x)}))}}});H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));});
 expect(c,atKnown.interruption.stateAt.kind==='WEEK_START'&&atKnown.interruption.stateAt.week===6&&atKnown.interruption.stateAt.authority?.RUN==='COMPLETED_SESSIONS',`an unreviewed re-entry week executed exactly as projected is not history (${point(atKnown)} ${JSON.stringify(atKnown.interruption.stateAt.authority)})`);
 out.classes[c]=cells;
}
// ---------- C3. Premise breakers: executed but not as the projection assumed (no review) ----------
{
 const c='C3-premise-breakers',cells={};
 const {t:b0,d0}=base('ab-c3');
 const known=t=>(o,s)=>s.sport!=='STRENGTH'?o:{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>Number.isFinite(t.p.stateTrace[5].strength.exercises[e.id]?.load)&&x.load.unit==='KG'?{...x,load:{...x.load,value:t.p.stateTrace[5].strength.exercises[e.id].load}}:x)}))}};
 const finish=t=>H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const cases={
  notCompleted:t=>{report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.day===3?{...o,actual:{completed:false,minutes:0}}:known(t)(o,s)});finish(t);},
  partialRun:t=>{report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.day===3?{...o,actual:{...o.actual,minutes:5}}:known(t)(o,s)});finish(t);},
  adverse:t=>{report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.day===3?{...o,response:{...o.response,recovery:'ADVERSE'}}:known(t)(o,s)});finish(t);},
  skippedByUnavailableDay:t=>{H.ev(t,on(t,addDays(d0,0),'08:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,3)]}}));report(t,5,{keep:s=>s.day<6,edit:known(t)});finish(t);},
  reducedBySystemicFatigue:t=>{H.ev(t,on(t,addDays(d0,0),'08:00',{kind:'SYSTEMIC_FATIGUE'}));report(t,5,{keep:s=>s.day<6,edit:known(t)});finish(t);},
  missedSaturdayLift:t=>{report(t,5,{keep:s=>s.day<6&&s.day!==5,edit:known(t)});finish(t);},
  strengthNotLogged:t=>{report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.sport==='STRENGTH'?{...o,actual:{completed:true,minutes:o.actual.minutes}}:o});finish(t);}
 };
 for(const [n,fn] of Object.entries(cases)){const t=copy(b0);fn(t);const D=B(t,d0).d;cells[n]={point:point(D),authority:D.interruption.stateAt.authority,steps:steps(D.interruption.entry)};
  expect(c,D.interruption.stateAt.kind==='RETURN',`${n}: B starts at ${point(D)} although the re-entry week did not execute as the projection assumed`);
  expect(c,steps(D.interruption.entry).run===0,`${n}: the run return step at B is ${steps(D.interruption.entry).run}`);}
 out.classes[c]=cells;
}
// ---------- C4. A value held by a review from a projected start, inside a return (I4) ----------
{
 const c='C4-held-from-projected-start',cells={};
 const {t:b0,d0}=base('ab-c4');
 // Week 5: Saturday's lift missed, no review (week 6 starts from A's projection: every exercise at return step 1). Week 6: everything executed
 // except Saturday's lift again, and reviewed on Sunday: RDL and split squat (Saturday only) stay at step 1, never executed. B in week 7.
 // Sunday's long run of week 5 is reported on Monday of week 6, so no review ever consolidated week 5.
 const week5=t=>{report(t,5,{keep:s=>s.day<5});H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));};
 const t=copy(b0);week5(t);const w6=t.p.weeks[6].startAuthority;H.ev(t,at(t.p,6,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[6].sessions.filter(s=>live(s)&&s.day!==5).map(s=>obs(t.p,s))}));
 const D=B(t,d0,{from:15,to:16,said:17}).d,s=steps(D.interruption.entry);cells.missedTwice={week6Start:w6?.authority??null,week7Start:t.p.weeks[7].startAuthority?.authority??null,point:point(D),authority:D.interruption.stateAt.authority,steps:s};
 for(const id of ['db-rdl','db-split-squat'])expect(c,(s.strength[id]??0)===0,`${id} was never executed after A, yet B resumes it at return step ${s.strength[id]}`);
 expect(c,D.interruption.stateAt.kind==='RETURN',`week 7's start holds values carried from A's projection, yet B starts at ${point(D)}`);
 // Every week-6 session executed and reviewed: each value comes from an execution, so week 7's start is history.
 const u=copy(b0);week5(u);H.ev(u,at(u.p,6,6,'21:00',{kind:'WEEKLY_REVIEW',observations:u.p.weeks[6].sessions.filter(live).map(s=>obs(u.p,s))}));
 const E=B(u,d0,{from:15,to:16,said:17}).d;cells.weekSixInFull={point:point(E),authority:E.interruption.stateAt.authority,steps:steps(E.interruption.entry)};
 expect(c,E.interruption.stateAt.kind==='WEEK_START'&&E.interruption.stateAt.week===7,`week 6 executed in full and reviewed, yet B starts at ${point(E)}`);
 out.classes[c]=cells;
}
// ---------- C5. Time alone (H, P5): nothing executed, B one or two weeks later; the week boundary ----------
{
 const c='C5-time-and-boundary',cells={};
 const {t:b0,d0,A}=base('ab-c5');
 for(const [n,o] of [['nextWeek',{}],['twoWeeksLater',{from:15,to:16,said:17}]]){const t=copy(b0);const D=B(t,d0,o).d;cells[n]={point:point(D),steps:steps(D.interruption.entry)};
  expect(c,D.interruption.stateAt.kind==='RETURN'&&facts(D.interruption.entry)===facts({run:A.interruption.entry.run,strength:{...A.interruption.entry.strength,exercises:Object.fromEntries(Object.entries(A.interruption.entry.strength.exercises).map(([k,e])=>[k,{...e}]))}}),`${n}: with nothing executed, B does not start from A's re-entry (${point(D)})`);}
 // The same executed history (Tue run, Wed lift), B starting on Sunday of week 5 or on Monday of week 6: the same state (P5).
 const x=copy(b0);report(x,5,{keep:s=>s.day<3});const sun=B(x,d0,{from:6,to:7,said:8}).d;
 const y=copy(b0);report(y,5,{keep:s=>s.day<3});const mon=B(y,d0,{from:7,to:8,said:9}).d;
 cells.sunday={point:point(sun),steps:steps(sun.interruption.entry)};cells.monday={point:point(mon),steps:steps(mon.interruption.entry)};
 expect(c,JSON.stringify(steps(sun.interruption.entry))===JSON.stringify(steps(mon.interruption.entry)),'P5: B on either side of the week boundary starts at different steps');
 out.classes[c]=cells;
}
// ---------- C6. Evidence removed (P4): a session that completed the week is corrected to not done ----------
{
 const c='C6-evidence-removed',cells={};
 const {t:b0,d0}=base('ab-c6');
 const t=copy(b0),kg=id=>t.p.stateTrace[5].strength.exercises[id]?.load;
 const edit=(o,s)=>s.sport!=='STRENGTH'?o:{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>Number.isFinite(kg(e.id))&&x.load.unit==='KG'?{...x,load:{...x.load,value:kg(e.id)}}:x)}))}};
 report(t,5,{keep:s=>s.day<6,edit});const sun=t.p.weeks[5].sessions.find(s=>live(s)&&s.day===6);
 H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,sun)]}));
 const before=copy(t),D0=B(before,d0).d;cells.complete={point:point(D0),authority:D0.interruption.stateAt.authority};
 // A correction of Thursday's run report (correctionOf): it was not done.
 const thu=t.p.weeks[5].sessions.find(s=>live(s)&&s.day===3),orig=t.ledger.find(o=>o.sessionId===thu.id);
 const fixAt=on(t,addDays(d0,7),'07:00',{kind:'WEEKLY_REVIEW'});
 H.ev(t,{...fixAt,observations:[{...obs(t.p,thu),eventId:'ab-c6-correction',correctionOf:orig.eventId,correctedAt:fixAt.asOf,actual:{completed:false,minutes:0}}]});
 const D1=B(t,d0).d;cells.corrected={point:point(D1),authority:D1.interruption.stateAt.authority,ledger:t.ledger.filter(o=>o.sessionId===thu.id).map(o=>({completed:o.actual?.completed,conflicted:!!o.conflicted,superseded:!!o.superseded}))};
 expect(c,D0.interruption.stateAt.kind==='WEEK_START',`the complete week is not history (${point(D0)})`);
 expect(c,D1.interruption.stateAt.kind==='RETURN',`after the correction the projection still counts (${point(D1)})`);
 out.classes[c]=cells;
}
// ---------- C7. Temporal contradiction (I7, Founder §11) ----------
{
 const c='C7-temporal-contradiction',cells={};
 const {t:b0,d0,A}=base('ab-c7');report(b0,5,{keep:s=>s.day<3});
 const name=A.interruption.episode;
 const fix=(t,from,to,said,extra={})=>H.ev(t,on(t,addDays(d0,said),'06:00',brk(addDays(d0,from),addDays(d0,to),{episodeId:name,...extra})));
 // Moved after its own executed re-entry (Thursday-Friday of week 5): both stories cannot be true.
 const t1=copy(b0);cells.movedPastReentry=fix(t1,3,4,5);expect(c,cells.movedPastReentry==='ASK/ASK',`a correction moved past the executed re-entry is ${cells.movedPastReentry}`);
 // By A's report id instead of its identity.
 const t2=copy(b0);cells.byReportId=H.ev(t2,on(t2,addDays(d0,5),'06:00',brk(addDays(d0,3),addDays(d0,4),{episodeId:A.eventId})));expect(c,cells.byReportId==='ASK/ASK',`the same by report id is ${cells.byReportId}`);
 // Extended over the executed Tuesday run.
 const t3=copy(b0);cells.endOverTuesday=fix(t3,-16,1,5);expect(c,cells.endOverTuesday==='ASK/ASK',`a correction ending over the executed Tuesday run is ${cells.endOverTuesday}`);
 // Moved earlier, or shortened before the re-entry: no contradiction, the correction applies (SAME_BREAK).
 const t4=copy(b0);cells.movedEarlier=fix(t4,-20,-5,5);expect(c,cells.movedEarlier.startsWith('MODIFY')&&lastR(t4.p).interruption.relation==='SAME_BREAK',`a consistent correction is ${cells.movedEarlier}`);
 // Nothing executed since the re-entry: the correction moved past the report still applies (the R7-A final test's case).
 const {t:b5,d0:e0,A:A5}=base('ab-c7b');cells.noExecutedReentry=H.ev(b5,on(b5,addDays(e0,5),'06:00',brk(addDays(e0,3),addDays(e0,4),{episodeId:A5.interruption.episode})));
 expect(c,!cells.noExecutedReentry.startsWith('ASK'),`with no executed re-entry the correction is ${cells.noExecutedReentry}`);
 out.classes[c]=cells;
}
// ---------- C8. A first interruption (no earlier return): the plan's week start is not history either (Founder 0.1) ----------
{
 const c='C8-first-interruption',cells={};
 const t0=H.start({id:'ab-c8',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3),d3=t0.p.weeks[3].startDate;
 const brkIn4=t=>H.ev(t,on(t,addDays(d3,9),'06:00',brk(addDays(d3,8),addDays(d3,9))));
 // Week 3 half executed and never reviewed, an equipment statement on Monday of week 4, a short break in week 4.
 const t=copy(t0);report(t,3,{keep:s=>s.day<3});H.ev(t,on(t,addDays(d3,7),'06:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d3,28),to:addDays(d3,30)}}));brkIn4(t);
 const D=lastR(t.p);cells.halfExecuted={point:point(D),authority:D.interruption.stateAt.authority};
 expect(c,!(D.interruption.stateAt.kind==='WEEK_START'&&D.interruption.stateAt.week===4),`week 4's planned start is read as history (${point(D)})`);
 // Week 3 executed in full and reviewed: week 4's start is history.
 const u=copy(t0);H.weekly(u,3);brkIn4(u);const E=lastR(u.p);cells.reviewed={point:point(E),authority:E.interruption.stateAt.authority};
 expect(c,E.interruption.stateAt.kind==='WEEK_START'&&E.interruption.stateAt.week===4,`a reviewed week 3 is not history for week 4 (${point(E)})`);
 out.classes[c]=cells;
}
// ---------- C9. Time zones: C1's Monday cells and C2's reviewed case at +9 h and -5 h ----------
{
 const c='C9-time-zones',cells={};
 for(const tz of [540,-300]){const {t:b0,d0}=base('ab-c9-'+tz,{tz});report(b0,5,{keep:s=>s.day<3});const ctl=copy(b0),C=B(ctl,d0).d;
  for(const [n,x] of [['equipmentNoop',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}}],['systemicFatigue',{kind:'SYSTEMIC_FATIGUE'}]]){
   const t=copy(b0);H.ev(t,on(t,addDays(d0,7),'06:00',x));const D=B(t,d0).d;cells[`${tz}:${n}`]=point(D);expect(c,facts(D.interruption.entry)===facts(C.interruption.entry),`tz ${tz} ${n}: B's start differs from the control`);}
  expect(c,tzOf(b0.p)===tz,'time zone not applied');}
 out.classes[c]=cells;
}
out.summary={classes:Object.keys(out.classes).length,violations:out.violations.length};
print(out);
