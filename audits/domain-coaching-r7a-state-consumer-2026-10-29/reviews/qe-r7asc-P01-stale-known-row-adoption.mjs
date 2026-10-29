// P01 (reviewer-owned, Property A / P5): QE-R7ASM-01's fix converts a KNOWN row to an effort-guided establishment only for an exercise the start
// does NOT hold (asEstablishment: `ss0.exercises[id] ? rows : rows.map(asEstablishment)`). Attack the neighbouring state: the start DOES hold the
// exercise, but only as FROM_LOG (established by effort, no usable load ever logged), while a KNOWN row planned from evidence that was later
// retracted still stands. Is that stale row's value then the reference a first log is judged against (SSCTR D45 bypass)?
// Q3's shape, extended by one week. Weeks 0-1 trained and reviewed, db-rdl logged at 20 kg both times (KNOWN 20). Corrections remove db-rdl from
// both week-1 and week-0 reports ("I did not do the RDLs"):
//   EARLY : corrections delivered with week 1's review (before weeks 2-3 are planned);
//   LATE  : the same corrections (same rows, same correctedAt) delivered Monday 07:00 of week 2 (mid-week review: KEEP, the rows stand);
//   NOCORR: no correction (control).
// Week 2 is reported day by day and never closed (no weekly review closes it): its Saturday db-rdl is executed without a usable load (variant).
// Week 3 is reported day by day and closed by its Sunday review; its Saturday db-rdl is logged at 19 kg, target met. Every report is built once
// from a reference program and sent identically, so EARLY and LATE hold the same record. History is read on the record as returned.
import * as L from './qe-r7asc-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asc-P01-stale-known-row-adoption',root:L.ROOT_USED,exercise:ID,variants:[]};
const variants={noDetails:{noDetails:true},repsNoLoad:{set:(id,x)=>id===ID?{reps:x.reps,rir:x.rir}:x},unknownUnit:{set:(id,x)=>id===ID?{...x,load:{...x.load,unit:'STONE'}}:x}};
const W3KG=Number(process.env.QE_W3KG??19);
function reports(vopt){
 L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-c1'}),L.opts),t={p:g.program,ledger:[]};L.weekly(t,0);
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`c1-w1-${i}`}));L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));
 const w2=t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?vopt:{}),eventId:`c1-w2-${i}`}));
 // Week 3 Saturday: db-rdl at W3KG, 3 sets of 5 reps at RIR 3 (meets any row's target and reserve); every other exercise as prescribed.
 const w3=t.p.weeks[3].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{kg:(id,e)=>id===ID?W3KG:(e.load.mode==='KNOWN'?e.load.value:20),sets:(id,e)=>id===ID?3:e.sets,set:(id,x)=>id===ID?{...x,reps:5,rir:3}:x}:{}),eventId:`c1-w3-${i}`}));
 return {w2,w3};
}
for(const [vname,vopt] of Object.entries(variants)){
 const ref=reports(vopt),res={variant:vname,cells:{}};
 for(const cell of ['EARLY','LATE','NOCORR']){
  L.resetIds();
  const g=L.R.generateProgram(L.intake({id:'qe-c1'}),L.opts),t={p:g.program,ledger:[]};
  L.weekly(t,0);
  const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`c1-w1-${i}`}));
  const hasId=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===ID)));
  const originals=[...t.ledger.filter(o=>o.logs?.[ID]&&!o.superseded),...w1.filter(hasId)];
  const correctedAt=`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
  const corrections=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==ID)},response:{...o.response}}));
  if(cell==='EARLY')L.step(t,L.at(t.p,1,6,'21:00:00',{observations:[...w1,...corrections]}));
  else{L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));if(cell==='LATE')L.step(t,L.at(t.p,2,0,'07:00:00',{observations:corrections}));}
  const rows2=L.rowsOf(t,2,L.SAT,[ID]).map(L.fmtRow),rows3planned=L.rowsOf(t,3,L.SAT,[ID]).map(L.fmtRow);
  L.deliverPerDay(t,2,ref.w2);                    // week 2: never closed
  const H3=L.history(t,3,0,'12:00:00'),h3=L.hex(H3,ID);
  L.deliverPerDay(t,3,ref.w3,{closeSunday:true});  // week 3: closed by its Sunday review
  const review=t.last,H4=L.history(t,4,0,'06:00:00'),h4=L.hex(H4,ID),st4=H4.state.strength.exercises[ID];
  res.cells[cell]={record:L.V.hash(L.recordOf(t)),week2SaturdayRows:rows2,week3SaturdayRowsAsPlanned:rows3planned,week3SaturdayRowsExecuted:L.rowsOf(t,3,L.SAT,[ID]).map(L.fmtRow),
   historyAtWeek3:h3?{mode:h3.mode,lastExecutedLoad:h3.lastExecutedLoad,liftedLoad:h3.liftedLoad,state:(e=>e&&{mode:e.mode,load:e.load??null,pendingLoad:e.pendingLoad??null,unlogged:!!e.unlogged,source:e.source})(H3.state.strength.exercises[ID])}:null,
   week3Review:{status:review.status,action:review.action,gate:review.gates?.[ID]??null,loadQuestions:(review.loadQuestions??[]).filter(q=>q.exerciseId===ID).map(q=>({reason:q.reason,logged:q.logged,planned:q.planned??null}))},
   historyAtWeek4:h4?{mode:h4.mode,lastExecutedLoad:h4.lastExecutedLoad,liftedLoad:h4.liftedLoad,tick:h4.earnedProgress.loadTick,state:{mode:st4.mode,load:st4.load??null,pendingLoad:st4.pendingLoad??null,unlogged:!!st4.unlogged,source:st4.source}}:null,
   internalReducer:L.reducerEntry(t,4,[ID]).entry[ID],
   week4SaturdayRows:L.rowsOf(t,4,L.SAT,[ID]).map(L.fmtRow),
   usableLogs:L.logsOf(t,ID)};
 }
 const E=res.cells.EARLY,La=res.cells.LATE;
 res.sameRecordEarlyLate=E.record===La.record;
 res.sameHistoryAtWeek3=JSON.stringify(E.historyAtWeek3)===JSON.stringify(La.historyAtWeek3);
 res.sameHistoryAtWeek4=JSON.stringify(E.historyAtWeek4)===JSON.stringify(La.historyAtWeek4);
 res.lateAdoptedFirstLogAgainstStaleKnownRow=La.historyAtWeek4?.state?.mode==='KNOWN'&&E.historyAtWeek4?.state?.mode!=='KNOWN'&&/KNOWN\d/.test(La.week3SaturdayRowsExecuted.join(' '));
 res.earlyAsksLateDoesNot=E.week3Review.loadQuestions.length>0&&La.week3Review.loadQuestions.length===0;
 out.variants.push(res);
}
out.anyViolation=out.variants.some(v=>v.sameRecordEarlyLate&&!v.sameHistoryAtWeek4);
console.log(JSON.stringify(out,null,1));
