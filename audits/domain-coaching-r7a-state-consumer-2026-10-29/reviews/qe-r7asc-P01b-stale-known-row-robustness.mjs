// P01b (reviewer-owned): robustness of P01 (history holds an exercise only as FROM_LOG, a stale KNOWN row planned from retracted evidence is the
// adoption reference of its first usable log).
//  (i)  correction trigger as P01 (noDetails), but week 3 is NEVER reviewed: reported day by day, Sunday's run the next morning. History at the
//       start of week 4 reads week 3 as COMPLETED_SESSIONS (every gate ADVANCE with logs) through the evidence reducer alone, with no decision.
//  (ii) conflict trigger (the judge's Q3b): week 0's Saturday establishes db-rdl at 20 kg with the athlete's confirmation (D45); a wearable record
//       of that session with another duration quarantines it. ORDERED: the wearable record arrives with week 0's review. LATE: Monday 07:00 of
//       week 1 (mid-week: KEEP). Week 1 reported day by day, never closed, Saturday synced without exercise details. Week 2 reported day by day
//       and closed by its Sunday review, Saturday's db-rdl logged at 19 kg, target met. Identical reports in both cells.
import * as L from './qe-r7asc-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asc-P01b-stale-known-row-robustness',root:L.ROOT_USED,exercise:ID};
const st=e=>e?{mode:e.mode,load:e.load??null,pendingLoad:e.pendingLoad??null,unlogged:!!e.unlogged,source:e.source,loadTick:e.loadTick??null}:null;
const sat19=kg=>({kg:(id,e)=>id===ID?kg:(e.load.mode==='KNOWN'?e.load.value:20),sets:(id,e)=>id===ID?3:e.sets,set:(id,x)=>id===ID?{...x,reps:5,rir:3}:x});
// (i)
{
 L.resetIds();const g0=L.R.generateProgram(L.intake({id:'qe-c1'}),L.opts),r={p:g0.program,ledger:[]};L.weekly(r,0);
 const w1r=r.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(r.p,s),eventId:`c1-w1-${i}`}));L.step(r,L.at(r.p,1,6,'21:00:00',{observations:w1r}));
 const w2=r.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(r.p,s,L.SAT(s)?{noDetails:true}:{}),eventId:`c1-w2-${i}`}));
 const w3=r.p.weeks[3].sessions.filter(L.live).map((s,i)=>({...L.obs(r.p,s,L.SAT(s)?sat19(19):{}),eventId:`c1-w3-${i}`}));
 const res={};
 for(const cell of ['EARLY','LATE']){
  L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-c1'}),L.opts),t={p:g.program,ledger:[]};L.weekly(t,0);
  const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`c1-w1-${i}`}));
  const hasId=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===ID)));
  const originals=[...t.ledger.filter(o=>o.logs?.[ID]&&!o.superseded),...w1.filter(hasId)],correctedAt=`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
  const corrections=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==ID)},response:{...o.response}}));
  if(cell==='EARLY')L.step(t,L.at(t.p,1,6,'21:00:00',{observations:[...w1,...corrections]}));else{L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));L.step(t,L.at(t.p,2,0,'07:00:00',{observations:corrections}));}
  L.deliverPerDay(t,2,w2);L.deliverPerDay(t,3,w3);   // neither week closed by a review
  const H=L.history(t,4,0,'12:00:00');
  res[cell]={record:L.V.hash(L.recordOf(t)),week3Rows:L.rowsOf(t,3,L.SAT,[ID]).map(L.fmtRow),decisionsAfterWeek1:t.p.decisions.slice(2).map(d=>d.action),basis:H.basis,history:st(H.state.strength.exercises[ID]),lastExecutedLoad:L.hex(H,ID)?.lastExecutedLoad??null};
 }
 out.i_week3NeverReviewed={...res,sameRecord:res.EARLY.record===res.LATE.record,sameHistory:JSON.stringify(res.EARLY.history)===JSON.stringify(res.LATE.history)};
}
// (ii)
{
 function refReports(){L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-c1b'}),L.opts),t={p:g.program,ledger:[]};
  const w0=t.p.weeks[0].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`c1b-w0-${i}`}));
  L.step(t,{...L.at(t.p,0,6,'21:00:00',{observations:w0}),loadConfirmations:[{exerciseId:ID,value:20,unit:'KG',convention:'PER_HAND'}]});
  const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{noDetails:true}:{}),eventId:`c1b-w1-${i}`}));
  const w2=t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?sat19(19):{}),eventId:`c1b-w2-${i}`}));return {w1,w2};}
 const ref=refReports(),res={};
 for(const cell of ['ORDERED','LATE']){
  L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-c1b'}),L.opts),t={p:g.program,ledger:[]};
  const w0=t.p.weeks[0].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`c1b-w0-${i}`}));
  const sat0=t.p.weeks[0].sessions.find(L.SAT),manual=w0.find(o=>o.sessionId===sat0.id);
  const wearable={eventId:'c1b-w0-wearable',athleteId:t.p.athleteId,sessionId:sat0.id,observedAt:manual.observedAt,source:{provider:'HEALTHKIT',activityId:'hk-123',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:Math.round(manual.actual.minutes*0.6)},response:{...L.OK}};
  const conf=[{exerciseId:ID,value:20,unit:'KG',convention:'PER_HAND'}];
  L.step(t,{...L.at(t.p,0,6,'21:00:00',{observations:cell==='ORDERED'?[...w0,wearable]:w0}),loadConfirmations:conf});
  if(cell==='LATE')L.step(t,L.at(t.p,1,0,'07:00:00',{observations:[wearable]}));
  const rows2=L.rowsOf(t,2,L.SAT,[ID]).map(L.fmtRow);
  L.deliverPerDay(t,1,ref.w1);L.deliverPerDay(t,2,ref.w2,{closeSunday:true});
  const H2=L.history(t,2,0,'12:00:00'),H3=L.history(t,3,0,'06:00:00');
  res[cell]={record:L.V.hash(L.recordOf(t)),quarantined:[...new Set(t.ledger.filter(o=>o.conflicted).map(o=>o.sessionId))],week2RowsExecuted:rows2,historyWeek2:st(H2.state.strength.exercises[ID]),
   week2Review:{action:t.last.action,gate:t.last.gates?.[ID]??null,questions:(t.last.loadQuestions??[]).filter(q=>q.exerciseId===ID).map(q=>q.reason)},historyWeek3:st(H3.state.strength.exercises[ID]),internalReducer:L.reducerEntry(t,3,[ID]).entry[ID],week3Rows:L.rowsOf(t,3,L.SAT,[ID]).map(L.fmtRow)};
 }
 out.ii_conflictTrigger={...res,sameRecord:res.ORDERED.record===res.LATE.record,sameHistoryWeek2:JSON.stringify(res.ORDERED.historyWeek2)===JSON.stringify(res.LATE.historyWeek2),sameHistoryWeek3:JSON.stringify(res.ORDERED.historyWeek3)===JSON.stringify(res.LATE.historyWeek3)};
}
console.log(JSON.stringify(out,null,1));
